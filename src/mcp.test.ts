import { describe, it, expect } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { addServer, listServers, loadPreset, readMcp, removeServer } from './mcp.js';

const makeTmp = (): string => mkdtempSync(path.join(tmpdir(), 'hk-mcp-'));

describe('mcp config', () => {
  it('add 创建 .mcp.json，list/remove 生效，同名需 --force', () => {
    const tmp = makeTmp();
    try {
      const proj = path.join(tmp, 'proj');
      mkdirSync(proj, { recursive: true });

      const r1 = addServer({ dir: proj, name: 'filesystem', config: { command: 'npx', args: ['-y', 'pkg'] } });
      expect(r1.action).toBe('added');
      expect(existsSync(path.join(proj, '.mcp.json'))).toBe(true);
      expect(listServers(proj)).toEqual(['filesystem']);

      expect(() => addServer({ dir: proj, name: 'filesystem', config: { command: 'x' } })).toThrow(/已存在同名/);
      const r2 = addServer({ dir: proj, name: 'filesystem', config: { command: 'y' }, force: true });
      expect(r2.action).toBe('replaced');

      expect(removeServer(proj, 'nope')).toBe(false);
      expect(removeServer(proj, 'filesystem')).toBe(true);
      expect(listServers(proj)).toEqual([]);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('非法 server 名被拒', () => {
    const tmp = makeTmp();
    try {
      expect(() => addServer({ dir: tmp, name: 'bad name', config: {} })).toThrow(/非法/);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('保留 ${ENV_VAR} 占位（不写死密钥）', () => {
    const tmp = makeTmp();
    try {
      addServer({ dir: tmp, name: 'remote', config: { url: 'https://x/mcp', headers: { Authorization: 'Bearer ${TOKEN}' } } });
      const doc = readMcp(tmp).doc;
      expect(JSON.stringify(doc)).toContain('${TOKEN}');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('loadPreset 读取 server.json（{name,config} 与裸配置两种形状）', () => {
    const tmp = makeTmp();
    try {
      const a = path.join(tmp, 'a');
      mkdirSync(a, { recursive: true });
      writeFileSync(path.join(a, 'server.json'), JSON.stringify({ name: 'fs', config: { command: 'npx' } }), 'utf8');
      expect(loadPreset(a)).toEqual({ name: 'fs', config: { command: 'npx' } });

      const b = path.join(tmp, 'b');
      mkdirSync(b, { recursive: true });
      writeFileSync(path.join(b, 'server.json'), JSON.stringify({ command: 'node', args: ['x.js'] }), 'utf8');
      const p = loadPreset(b);
      expect(p.name).toBeUndefined();
      expect(p.config).toEqual({ command: 'node', args: ['x.js'] });
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
