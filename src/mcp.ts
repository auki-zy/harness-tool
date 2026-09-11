import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ensureRepo, parseSourceSpec } from './skills.js';

const MCP_FILE = '.mcp.json';

/** 去掉 UTF-8 BOM（Windows 下用 PowerShell 等写出的 JSON 常带 BOM） */
const stripBom = (s: string): string => s.replace(/^\uFEFF/, '');

export interface McpDoc {
  mcpServers: Record<string, unknown>;
}

export interface McpFileState {
  path: string;
  doc: McpDoc;
  existed: boolean;
}

function fileOf(dir: string): string {
  return path.join(path.resolve(dir), MCP_FILE);
}

/** 读取项目 .mcp.json（不存在则返回空结构） */
export function readMcp(dir: string): McpFileState {
  const file = fileOf(dir);
  if (!existsSync(file)) return { path: file, doc: { mcpServers: {} }, existed: false };
  try {
    const doc = JSON.parse(stripBom(readFileSync(file, 'utf8'))) as McpDoc;
    if (!doc || typeof doc !== 'object') throw new Error('bad shape');
    if (!doc.mcpServers || typeof doc.mcpServers !== 'object') doc.mcpServers = {};
    return { path: file, doc, existed: true };
  } catch (err) {
    throw new Error(`无法解析 ${MCP_FILE}：${err instanceof Error ? err.message : String(err)}`, { cause: err });
  }
}

function writeMcp(file: string, doc: McpDoc): void {
  writeFileSync(file, JSON.stringify(doc, null, 2) + '\n', 'utf8');
}

export interface AddServerOptions {
  dir: string;
  name: string;
  config: Record<string, unknown>;
  force?: boolean;
}

/** 添加/更新一个 MCP server 到项目 .mcp.json（默认拒绝覆盖同名） */
export function addServer(opts: AddServerOptions): { path: string; action: 'added' | 'replaced' } {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(opts.name)) {
    throw new Error(`非法的 server 名：${opts.name}`);
  }
  const state = readMcp(opts.dir);
  const exists = Object.prototype.hasOwnProperty.call(state.doc.mcpServers, opts.name);
  if (exists && !opts.force) {
    throw new Error(`已存在同名 server：${opts.name}（如需覆盖请加 --force）`);
  }
  state.doc.mcpServers[opts.name] = opts.config;
  writeMcp(state.path, state.doc);
  return { path: state.path, action: exists ? 'replaced' : 'added' };
}

/** 列出已配置的 server 名 */
export function listServers(dir: string): string[] {
  return Object.keys(readMcp(dir).doc.mcpServers);
}

/** 删除一个 server；返回是否真的删了 */
export function removeServer(dir: string, name: string): boolean {
  const state = readMcp(dir);
  if (!Object.prototype.hasOwnProperty.call(state.doc.mcpServers, name)) return false;
  delete state.doc.mcpServers[name];
  writeMcp(state.path, state.doc);
  return true;
}

/**
 * 从本地目录/仓库读一个 MCP 预设：约定文件 `server.json`，
 * 形状：{ "name": "x", "config": { command|url, args, env … } } 或直接是配置对象。
 */
export function loadPreset(source: string, update = false): { name?: string; config: Record<string, unknown> } {
  const spec = parseSourceSpec(source);
  let dir: string;
  if (spec.kind === 'local') {
    dir = spec.path;
  } else {
    const repoDir = ensureRepo(spec.repoUrl, update);
    dir = spec.sub ? path.join(repoDir, spec.sub) : repoDir;
  }
  const file = existsSync(path.join(dir, 'server.json'))
    ? path.join(dir, 'server.json')
    : existsSync(dir) && dir.endsWith('.json')
      ? dir
      : '';
  if (!file) throw new Error(`预设缺少 server.json：${dir}`);
  const raw = JSON.parse(stripBom(readFileSync(file, 'utf8'))) as { name?: string; config?: Record<string, unknown> };
  const config = (raw.config ?? raw) as Record<string, unknown>;
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('server.json 形状不对：应为 { name?, config } 或直接配置对象');
  }
  return { name: raw.name, config };
}
