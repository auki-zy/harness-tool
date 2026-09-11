import { describe, it, expect } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { addCapability, resolveCapability } from './add.js';

function makeTmp(prefix: string): string {
  return mkdtempSync(path.join(tmpdir(), prefix));
}

/** 搭一个"迷你 lab"：adopted/skills 一个技能 + candidates/agents 一个子代理 + adopted/mcp 一个预设 */
function makeLab(): string {
  const lab = makeTmp('hk-lab-');
  mkdirSync(path.join(lab, 'adopted', 'skills', 'demo-skill'), { recursive: true });
  writeFileSync(
    path.join(lab, 'adopted', 'skills', 'demo-skill', 'SKILL.md'),
    '---\nname: demo-skill\ndescription: 演示用\n---\n\n# demo\n',
    'utf8',
  );
  mkdirSync(path.join(lab, 'candidates', 'agents', 'demo-agent'), { recursive: true });
  writeFileSync(
    path.join(lab, 'candidates', 'agents', 'demo-agent', 'AGENT.md'),
    '---\nname: demo-agent\ndescription: 演示用\n---\n\n职责…\n',
    'utf8',
  );
  mkdirSync(path.join(lab, 'adopted', 'mcp', 'demo-mcp'), { recursive: true });
  writeFileSync(
    path.join(lab, 'adopted', 'mcp', 'demo-mcp', 'server.json'),
    JSON.stringify({ name: 'demo-mcp', config: { command: 'npx', args: ['-y', 'demo'], env: { TOKEN: '${TOKEN}' } } }),
    'utf8',
  );
  return lab;
}

describe('add：按名字装能力', () => {
  it('从 adopted/ 找到技能并装进项目的各 agent 目录', () => {
    const lab = makeLab();
    const proj = makeTmp('hk-proj-');
    try {
      const res = addCapability({ name: 'demo-skill', dir: proj, from: lab });
      expect(res.capability.kind).toBe('skill');
      expect(res.capability.pool).toBe('adopted');
      expect(existsSync(path.join(proj, '.claude', 'skills', 'demo-skill', 'SKILL.md'))).toBe(true);
      expect(existsSync(path.join(proj, '.cursor', 'skills', 'demo-skill', 'SKILL.md'))).toBe(true);
    } finally {
      rmSync(lab, { recursive: true, force: true });
      rmSync(proj, { recursive: true, force: true });
    }
  });

  it('候选池里的子代理也能按名字装，且只写一个 .md', () => {
    const lab = makeLab();
    const proj = makeTmp('hk-proj-');
    try {
      const res = addCapability({ name: 'demo-agent', dir: proj, from: lab });
      expect(res.capability.kind).toBe('agent');
      expect(res.capability.pool).toBe('candidates');
      expect(existsSync(path.join(proj, '.claude', 'agents', 'demo-agent.md'))).toBe(true);
    } finally {
      rmSync(lab, { recursive: true, force: true });
      rmSync(proj, { recursive: true, force: true });
    }
  });

  it('MCP 预设写进项目 .mcp.json，密钥保持 ${ENV_VAR} 占位', () => {
    const lab = makeLab();
    const proj = makeTmp('hk-proj-');
    try {
      const res = addCapability({ name: 'demo-mcp', dir: proj, from: lab });
      expect(res.capability.kind).toBe('mcp');
      const doc = JSON.parse(readFileSync(path.join(proj, '.mcp.json'), 'utf8')) as {
        mcpServers: Record<string, { env: Record<string, string> }>;
      };
      expect(doc.mcpServers['demo-mcp'].env.TOKEN).toBe('${TOKEN}');
    } finally {
      rmSync(lab, { recursive: true, force: true });
      rmSync(proj, { recursive: true, force: true });
    }
  });

  it('名字找不到时报清楚，且提示去哪个池子找', () => {
    const lab = makeLab();
    try {
      expect(() => resolveCapability('nope', lab)).toThrow(/找不到能力「nope」/);
    } finally {
      rmSync(lab, { recursive: true, force: true });
    }
  });
});
