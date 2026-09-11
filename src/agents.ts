import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { collectDirsWith, ensureRepo, parseSourceSpec } from './skills.js';

/** 各工具在项目内的子代理目录（Claude Code 约定 .claude/agents；Cursor 同构保留） */
export const AGENT_TARGET_DIRS = {
  claude: (root: string): string => path.join(root, '.claude', 'agents'),
  cursor: (root: string): string => path.join(root, '.cursor', 'agents'),
} as const;

export type AgentToolId = keyof typeof AGENT_TARGET_DIRS;

export interface AgentInstallResult {
  tool: AgentToolId;
  name: string;
  target: string;
  action: 'installed' | 'updated' | 'skipped';
}

/** 解析 agent 名：AGENT.md frontmatter 的 name 优先，否则目录名 */
export function resolveAgentName(agentDir: string): string {
  const file = path.join(agentDir, 'AGENT.md');
  if (!existsSync(file)) throw new Error(`不是 agent 目录（缺 AGENT.md）：${agentDir}`);
  const head = readFileSync(file, 'utf8').split('\n').slice(0, 40).join('\n');
  const m = head.match(/^name:\s*"?([^"\s]+)"?\s*$/m);
  return (m?.[1] || path.basename(path.resolve(agentDir))).trim();
}

export interface InstallAgentsOptions {
  source: string; // 本地路径 / owner/repo[:sub] / https URL
  dir: string;
  tools: AgentToolId[];
  update?: boolean;
}

export interface InstallAgentsResult {
  sourceLabel: string;
  results: AgentInstallResult[];
}

/** 从源安装子代理规格：AGENT.md → <tool>/agents/<name>.md */
export function installAgentsFromSource(opts: InstallAgentsOptions): InstallAgentsResult {
  const spec = parseSourceSpec(opts.source);
  let candidate: string;
  if (spec.kind === 'local') {
    candidate = spec.path;
  } else {
    const repoDir = ensureRepo(spec.repoUrl, opts.update ?? false);
    candidate = spec.sub ? path.join(repoDir, spec.sub) : repoDir;
  }
  const agentDirs = collectDirsWith(candidate, 'AGENT.md');
  const root = path.resolve(opts.dir);
  if (!existsSync(root)) throw new Error(`目标项目目录不存在：${root}`);

  const results: AgentInstallResult[] = [];
  for (const dir of agentDirs) {
    const name = resolveAgentName(dir);
    for (const tool of opts.tools) {
      const targetDir = AGENT_TARGET_DIRS[tool](root);
      mkdirSync(targetDir, { recursive: true });
      const target = path.join(targetDir, `${name}.md`);
      const existed = existsSync(target);
      if (existed && !opts.update) {
        results.push({ tool, name, target, action: 'skipped' });
        continue;
      }
      if (existed) rmSync(target, { force: true });
      cpSync(path.join(dir, 'AGENT.md'), target);
      results.push({ tool, name, target, action: existed ? 'updated' : 'installed' });
    }
  }
  return { sourceLabel: spec.label, results };
}
