import { describe, it, expect } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { installAgentsFromSource, resolveAgentName } from './agents.js';

const makeTmp = (): string => mkdtempSync(path.join(tmpdir(), 'hk-agents-'));

function makeAgent(dir: string, name: string, body = '职责：审查代码'): string {
  const p = path.join(dir, name);
  mkdirSync(p, { recursive: true });
  writeFileSync(path.join(p, 'AGENT.md'), `---\nname: ${name}\ndescription: 测试用代理\n---\n\n# ${name}\n\n${body}\n`, 'utf8');
  return p;
}

describe('agents install', () => {
  it('解析 frontmatter name', () => {
    const tmp = makeTmp();
    try {
      const a = makeAgent(tmp, 'code-reviewer');
      expect(resolveAgentName(a)).toBe('code-reviewer');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('安装到 .claude/agents 与 .cursor/agents，已存在跳过、--update 覆盖', () => {
    const tmp = makeTmp();
    try {
      const src = makeAgent(tmp, 'code-reviewer', 'v1');
      const proj = path.join(tmp, 'proj');
      mkdirSync(proj, { recursive: true });

      const r1 = installAgentsFromSource({ source: src, dir: proj, tools: ['claude', 'cursor'] });
      expect(r1.results.every((r) => r.action === 'installed')).toBe(true);
      expect(existsSync(path.join(proj, '.claude', 'agents', 'code-reviewer.md'))).toBe(true);
      expect(existsSync(path.join(proj, '.cursor', 'agents', 'code-reviewer.md'))).toBe(true);

      const r2 = installAgentsFromSource({ source: src, dir: proj, tools: ['claude'] });
      expect(r2.results[0].action).toBe('skipped');

      writeFileSync(path.join(src, 'AGENT.md'), '---\nname: code-reviewer\ndescription: x\n---\n\nv2\n', 'utf8');
      const r3 = installAgentsFromSource({ source: src, dir: proj, tools: ['claude'], update: true });
      expect(r3.results[0].action).toBe('updated');
      expect(readFileSync(path.join(proj, '.claude', 'agents', 'code-reviewer.md'), 'utf8')).toContain('v2');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('目录内多个 agent 会全部安装', () => {
    const tmp = makeTmp();
    try {
      const repo = path.join(tmp, 'repo');
      makeAgent(repo, 'agent-a');
      makeAgent(repo, 'agent-b');
      const proj = path.join(tmp, 'proj');
      mkdirSync(proj, { recursive: true });
      const r = installAgentsFromSource({ source: repo, dir: proj, tools: ['claude'] });
      expect(r.results.map((x) => x.name).sort()).toEqual(['agent-a', 'agent-b']);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
