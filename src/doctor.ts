import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export interface CheckItem {
  name: string;
  ok: boolean;
  critical: boolean;
  detail: string;
}

export interface DoctorResult {
  checks: CheckItem[];
  criticalFails: number;
}

const PLACEHOLDER_RE = /\[替换|\[domain-|\[spec path|\[模块 \/ 路由|模板占位/;

function exists(p: string): boolean {
  return existsSync(p);
}

function read(p: string): string {
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

/**
 * 自检一个目录是否具备可开工的 harness 工程层（对标 BOOTSTRAP 清单）。
 * - critical 缺失 → 目录尚未具备 harness 层（doctor 返回非零）
 * - 其余为警告/信息，不影响退出码
 */
export function doctorProject(dir: string): DoctorResult {
  const root = path.resolve(dir);
  const checks: CheckItem[] = [];
  const add = (name: string, ok: boolean, critical: boolean, detail: string): void => {
    checks.push({ name, ok, critical, detail });
  };

  // 1) 关键文件（critical）
  const keyFiles = ['AGENTS.md', 'ARCHITECTURE.md', 'docs/BOOTSTRAP.md', 'docs/PLANS.md', 'docs/QUALITY_SCORE.md'];
  const missing = keyFiles.filter((f) => !exists(path.join(root, f)));
  add('harness 关键文件', missing.length === 0, true, missing.length === 0 ? 'AGENTS/ARCHITECTURE/BOOTSTRAP/PLANS/QUALITY 齐全' : `缺失：${missing.join(', ')}`);

  // 2) 模板占位是否已填（warning）
  const placeholders: string[] = [];
  for (const f of ['ARCHITECTURE.md', 'docs/QUALITY_SCORE.md']) {
    if (exists(path.join(root, f)) && PLACEHOLDER_RE.test(read(path.join(root, f)))) {
      placeholders.push(f);
    }
  }
  add('占位符填写', placeholders.length === 0, false, placeholders.length === 0 ? '未见 [替换]/模板占位 残留' : `仍含占位：${placeholders.join(', ')}（按 BOOTSTRAP 第 2 步填写）`);

  // 3) 机械配置（warning；纯文档项目可忽略）
  const pkgPath = path.join(root, 'package.json');
  const parsePkg = (p: string): { scripts?: Record<string, string> } => {
    try {
      return JSON.parse(read(p));
    } catch {
      return {};
    }
  };
  if (!exists(pkgPath)) {
    add('机械配置', false, false, '无 package.json（纯文档项目可忽略，否则按 BOOTSTRAP 第 3 步装配）');
  } else {
    const scripts = parsePkg(pkgPath).scripts ?? {};
    const need = ['dev', 'build', 'typecheck', 'lint', 'test'];
    const absent = need.filter((s) => !scripts[s]);
    add('五件套 scripts', absent.length === 0, false, absent.length === 0 ? 'dev/build/typecheck/lint/test 齐全' : `缺：${absent.join(', ')}`);
    add('tsconfig', exists(path.join(root, 'tsconfig.json')), false, exists(path.join(root, 'tsconfig.json')) ? '存在' : '缺（TS 项目按 BOOTSTRAP 装配 strict）');
  }

  // 4) active plan（warning）
  const activeDir = path.join(root, 'docs', 'exec-plans', 'active');
  const hasPlan = exists(activeDir) && readdirSync(activeDir).some((f) => f.endsWith('.md') && f !== 'index.md');
  add('active plan', hasPlan, false, hasPlan ? '存在执行计划' : 'docs/exec-plans/active/ 无计划（按 BOOTSTRAP 第 4 步建立）');

  // 5) git（信息）
  add('git 仓库', exists(path.join(root, '.git')), false, exists(path.join(root, '.git')) ? '已初始化' : '未初始化（可用 harness-tool init --git）');

  return {
    checks,
    criticalFails: checks.filter((c) => c.critical && !c.ok).length,
  };
}
