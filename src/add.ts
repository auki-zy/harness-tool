import { existsSync } from 'node:fs';
import path from 'node:path';
import { AGENT_SKILL_DIRS, ensureRepo, installSkill, parseSourceSpec, type AgentId } from './skills.js';
import { AGENT_TARGET_DIRS, installAgentsFromSource, type AgentToolId } from './agents.js';
import { addServer, loadPreset } from './mcp.js';

export type CapabilityKind = 'skill' | 'agent' | 'mcp';

/** 能力类型 → 它在仓库里的子目录 + 判别文件 */
const KIND_DIRS: { kind: CapabilityKind; dir: string; marker: string }[] = [
  { kind: 'skill', dir: 'skills', marker: 'SKILL.md' },
  { kind: 'agent', dir: 'agents', marker: 'AGENT.md' },
  { kind: 'mcp', dir: 'mcp', marker: 'server.json' },
];

/** 能力池：先看已采纳，再看候选 */
const POOLS = ['adopted', 'candidates'];

/** 默认能力源（评测仓库）；可用 --from 或环境变量 HK_LAB 覆盖 */
export const DEFAULT_SOURCE = process.env.HK_LAB || 'auki-zy/harness-lab';

export interface ResolvedCapability {
  name: string;
  kind: CapabilityKind;
  dir: string;
  /** adopted | candidates | direct（直接给了一个能力目录） */
  pool: string;
}

/** 解析源根目录：本地路径原样用，owner/repo 走浅克隆缓存 */
export function resolveRoot(from?: string, update = false): { label: string; dir: string } {
  const spec = parseSourceSpec(from?.trim() || DEFAULT_SOURCE);
  if (spec.kind === 'local') return { label: spec.label, dir: spec.path };
  const repoDir = ensureRepo(spec.repoUrl, update);
  return { label: spec.label, dir: spec.sub ? path.join(repoDir, spec.sub) : repoDir };
}

function detectKind(dir: string): CapabilityKind | null {
  for (const k of KIND_DIRS) if (existsSync(path.join(dir, k.marker))) return k.kind;
  return null;
}

/**
 * 按名字找能力目录：`<源>/adopted/<type>/<name>` → `<源>/candidates/<type>/<name>`；
 * 也允许直接传一个能力目录（含 SKILL.md / AGENT.md / server.json）。
 */
export function resolveCapability(name: string, rootDir: string): ResolvedCapability {
  const direct = path.resolve(rootDir, name);
  const directKind = existsSync(direct) ? detectKind(direct) : null;
  if (directKind) return { name, kind: directKind, dir: direct, pool: 'direct' };

  for (const pool of POOLS) {
    for (const k of KIND_DIRS) {
      const dir = path.join(rootDir, pool, k.dir, name);
      if (existsSync(path.join(dir, k.marker))) return { name, kind: k.kind, dir, pool };
    }
  }
  throw new Error(
    `找不到能力「${name}」：在 ${rootDir} 的 ${POOLS.map((p) => `${p}/`).join(' 与 ')} 下都没有同名能力（技能 / 子代理 / MCP）`,
  );
}

export interface AddOptions {
  /** 能力名（或直接一个能力目录路径） */
  name: string;
  /** 目标项目目录 */
  dir: string;
  /** 能力源根目录（本地路径 / owner/repo）；默认 harness-lab */
  from?: string;
  update?: boolean;
  agents?: AgentId[];
  tools?: AgentToolId[];
  force?: boolean;
}

export interface AddItemResult {
  name: string;
  action: 'installed' | 'updated' | 'skipped';
  /** 落到哪里（人话：claude → .claude/skills/x） */
  target: string;
}

export interface AddResult {
  sourceLabel: string;
  capability: ResolvedCapability;
  results: AddItemResult[];
}

/** 按名字把一个能力装进项目：类型由目录内容决定，安装位置按各工具约定 */
export function addCapability(opts: AddOptions): AddResult {
  const target = path.resolve(opts.dir);
  if (!existsSync(target)) throw new Error(`目标项目目录不存在：${target}`);

  const root = resolveRoot(opts.from, opts.update ?? false);
  const capability = resolveCapability(opts.name, root.dir);
  const results: AddItemResult[] = [];

  if (capability.kind === 'skill') {
    const agents = opts.agents?.length ? opts.agents : (Object.keys(AGENT_SKILL_DIRS) as AgentId[]);
    for (const r of installSkill({ source: capability.dir, dir: target, agents, update: opts.update })) {
      results.push({ name: r.skillName, action: r.action, target: `${r.agent} → ${r.target}` });
    }
  } else if (capability.kind === 'agent') {
    const tools = opts.tools?.length ? opts.tools : (Object.keys(AGENT_TARGET_DIRS) as AgentToolId[]);
    const installed = installAgentsFromSource({ source: capability.dir, dir: target, tools, update: opts.update });
    for (const r of installed.results) {
      results.push({ name: r.name, action: r.action, target: `${r.tool} → ${r.target}` });
    }
  } else {
    const preset = loadPreset(capability.dir, opts.update ?? false);
    const name = preset.name ?? capability.name;
    const added = addServer({ dir: target, name, config: preset.config, force: opts.force });
    results.push({ name, action: added.action === 'added' ? 'installed' : 'updated', target: added.path });
  }

  return { sourceLabel: root.label, capability, results };
}
