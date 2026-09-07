import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

/** 各编码 agent 在项目内的技能目录（canonical 源在 skills/ 或外部，此处安装为副本） */
export const AGENT_SKILL_DIRS = {
  claude: (root: string): string => path.join(root, '.claude', 'skills'),
  cursor: (root: string): string => path.join(root, '.cursor', 'skills'),
} as const;

export type AgentId = keyof typeof AGENT_SKILL_DIRS;

export interface InstallSkillOptions {
  source: string; // 技能目录（本地，含 SKILL.md）
  dir: string;
  agents: AgentId[];
  update?: boolean; // true = 已存在也覆盖
}

export interface SkillInstallResult {
  agent: AgentId;
  skillName: string;
  target: string;
  installed: boolean; // false = 已存在且未更新（跳过）
  action: 'installed' | 'updated' | 'skipped';
}

export type SourceSpec =
  | { kind: 'local'; label: string; path: string }
  | { kind: 'git'; label: string; repoUrl: string; ownerRepo?: string; sub?: string };

/** 识别本地路径 或 GitHub 简写 owner/repo[:sub] / 完整 URL */
export function parseSourceSpec(spec: string): SourceSpec {
  const s = spec.trim();
  const looksLocal = s.startsWith('.') || s.startsWith('/') || s.includes('\\') || /^[A-Za-z]:/.test(s);
  if (looksLocal || existsSync(path.resolve(s))) {
    const p = path.resolve(s);
    return { kind: 'local', label: p, path: p };
  }
  const m = s.match(/^([^/:\s]+)\/([^/:\s]+)(?::(.+))?$/);
  if (m) {
    return { kind: 'git', label: s, repoUrl: `https://github.com/${m[1]}/${m[2]}.git`, ownerRepo: `${m[1]}/${m[2]}`, sub: m[3] };
  }
  if (/^https?:\/\//.test(s)) {
    return { kind: 'git', label: s, repoUrl: s };
  }
  throw new Error(`无法识别技能源：${spec}（支持本地路径 / owner/repo[:sub] / https URL）`);
}

function gitCacheRoot(): string {
  return process.env.HK_CACHE || path.join(homedir(), '.cache', 'harness-tool', 'sources');
}

function safeRepoName(repoUrl: string): string {
  const clean = repoUrl.replace(/^https?:\/\//, '').replace(/\.git$/, '');
  return clean.replace(/[/\\:]/g, '__');
}

/** 浅克隆仓库到本地缓存；已存在且非 update 时复用 */
function ensureRepo(repoUrl: string, update: boolean): string {
  const repoDir = path.join(gitCacheRoot(), safeRepoName(repoUrl));
  if (existsSync(repoDir) && !update) return repoDir;
  if (existsSync(repoDir)) rmSync(repoDir, { recursive: true, force: true });
  mkdirSync(path.dirname(repoDir), { recursive: true });
  const args = [
    ...(process.platform === 'win32' ? ['-c', 'http.sslBackend=openssl'] : []),
    'clone', '--depth=1', repoUrl, repoDir,
  ];
  const res = spawnSync('git', args, { stdio: 'inherit' });
  if (res.status !== 0) throw new Error(`技能仓库克隆失败：${repoUrl}`);
  return repoDir;
}

/** 收集候选目录下的技能目录（自身或直接子级含 SKILL.md） */
export function listSkillDirs(candidate: string): string[] {
  if (existsSync(path.join(candidate, 'SKILL.md'))) return [candidate];
  const children = readdirSync(candidate, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(candidate, e.name))
    .filter((d) => existsSync(path.join(d, 'SKILL.md')));
  if (children.length === 0) {
    throw new Error(`该源下找不到含 SKILL.md 的技能目录：${candidate}`);
  }
  return children;
}

/** 校验技能目录并解析技能名：SKILL.md frontmatter name 优先，否则目录名 */
export function resolveSkillName(source: string): string {
  const skillMd = path.join(source, 'SKILL.md');
  if (!existsSync(skillMd)) throw new Error(`不是技能目录（缺 SKILL.md）：${source}`);
  const head = readFileSync(skillMd, 'utf8').split('\n').slice(0, 40).join('\n');
  const m = head.match(/^name:\s*"?([^"\s]+)"?\s*$/m);
  return (m?.[1] || path.basename(path.resolve(source))).trim();
}

function copyOneSkill(sourceDir: string, root: string, agent: AgentId, update: boolean): SkillInstallResult {
  const skillName = resolveSkillName(sourceDir);
  const agentDir = AGENT_SKILL_DIRS[agent](root);
  mkdirSync(agentDir, { recursive: true });
  const target = path.join(agentDir, skillName);
  const existed = existsSync(target);
  if (existed && !update) {
    return { agent, skillName, target, installed: false, action: 'skipped' };
  }
  if (existed) rmSync(target, { recursive: true, force: true });
  cpSync(sourceDir, target, { recursive: true });
  return { agent, skillName, target, installed: true, action: existed ? 'updated' : 'installed' };
}

/** 把本地技能目录安装到目标项目各 agent；已存在默认跳过（update=true 覆盖） */
export function installSkill(opts: InstallSkillOptions): SkillInstallResult[] {
  const root = path.resolve(opts.dir);
  if (!existsSync(root)) throw new Error(`目标项目目录不存在：${root}`);
  return opts.agents.map((agent) => copyOneSkill(path.resolve(opts.source), root, agent, opts.update ?? false));
}

export interface InstallFromSourceOptions {
  source: string; // 本地路径 / owner/repo[:sub] / URL
  dir: string;
  agents: AgentId[];
  update?: boolean;
}

export interface InstallFromSourceResult {
  sourceLabel: string;
  results: SkillInstallResult[];
}

/** 从源（本地或 git 仓库）解析出技能并安装 */
export function installFromSource(opts: InstallFromSourceOptions): InstallFromSourceResult {
  const spec = parseSourceSpec(opts.source);
  let candidate: string;
  if (spec.kind === 'local') {
    candidate = spec.path;
  } else {
    const repoDir = ensureRepo(spec.repoUrl, opts.update ?? false);
    candidate = spec.sub ? path.join(repoDir, spec.sub) : repoDir;
  }
  const skillDirs = listSkillDirs(candidate);
  const root = path.resolve(opts.dir);
  if (!existsSync(root)) throw new Error(`目标项目目录不存在：${root}`);
  const results: SkillInstallResult[] = [];
  for (const d of skillDirs) {
    for (const agent of opts.agents) {
      results.push(copyOneSkill(d, root, agent, opts.update ?? false));
    }
  }
  return { sourceLabel: spec.label, results };
}
