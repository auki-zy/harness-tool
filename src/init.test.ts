import { describe, it, expect } from 'vitest';
import { existsSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { initProject } from './init.js';

function makeTmp(): string {
  return mkdtempSync(path.join(tmpdir(), 'harness-tool-'));
}

describe('initProject', () => {
  it('把模板快照写入空目录（关键文件存在）', () => {
    const tmp = makeTmp();
    try {
      const res = initProject({ dir: tmp });
      for (const f of [
        'AGENTS.md',
        'ARCHITECTURE.md',
        'docs/BOOTSTRAP.md',
        'docs/PLANS.md',
        'docs/QUALITY_SCORE.md',
        'docs/exec-plans/tech-debt-tracker.md',
      ]) {
        expect(existsSync(path.join(tmp, f)), f).toBe(true);
        expect(res.created).toContain(f);
      }
      // 模板不再携带能力内容与启动器
      for (const gone of ['skills/README.md', 'agents/README.md', 'mcp/README.md', 'docs/CODE_STANDARDS.md']) {
        expect(existsSync(path.join(tmp, gone)), gone).toBe(false);
      }
      expect(res.conflicts).toHaveLength(0);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('绝不覆盖已存在文件，并记录为冲突', () => {
    const tmp = makeTmp();
    try {
      writeFileSync(path.join(tmp, 'README.md'), '用户自己的 README\n', 'utf8');
      const first = initProject({ dir: tmp });
      expect(first.conflicts).toContain('README.md');
      expect(readFileSync(path.join(tmp, 'README.md'), 'utf8')).toBe('用户自己的 README\n');
      // 二次 init：所有模板文件都应成冲突且内容不变
      const second = initProject({ dir: tmp });
      expect(second.created).toHaveLength(0);
      expect(second.conflicts.length).toBeGreaterThan(0);
      expect(readFileSync(path.join(tmp, 'README.md'), 'utf8')).toBe('用户自己的 README\n');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('目标目录不存在时自动创建（嵌套路径）', () => {
    const base = makeTmp();
    try {
      const nested = path.join(base, 'a', 'b');
      const res = initProject({ dir: nested });
      expect(existsSync(path.join(nested, 'AGENTS.md'))).toBe(true);
      expect(res.created.length).toBeGreaterThan(0);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});
