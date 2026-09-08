#!/usr/bin/env node
// ponytail-minimal 基准：遍历 tasks/*（含 cases.mjs / baseline.mjs / skill.mjs），
// 断言两版一致且正确，对比实现行数；零依赖。
import { readFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const tasksDir = path.join(here, 'tasks');

function linesOf(file) {
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0 && !l.trim().startsWith('//')).length;
}

const taskDirs = readdirSync(tasksDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => path.join(tasksDir, e.name))
  .filter((d) => readdirSync(d).includes('cases.mjs'));

const rows = [];
let totalFail = 0;
for (const taskDir of taskDirs) {
  const name = path.basename(taskDir);
  const baseMod = (await import(pathToFileURL(path.join(taskDir, 'baseline.mjs')).href).catch(() => null)) ?? {};
  const skillMod = (await import(pathToFileURL(path.join(taskDir, 'skill.mjs')).href).catch(() => null)) ?? {};
  const { cases } = await import(pathToFileURL(path.join(taskDir, 'cases.mjs')).href);
  const key =
    Object.keys(baseMod).find((k) => typeof baseMod[k] === 'function') ??
    Object.keys(skillMod).find((k) => typeof skillMod[k] === 'function') ??
    '';
  if (!key) {
    console.log(`✗ ${name}: 找不到实现函数`);
    rows.push({ name, fail: cases.length, baseLines: 0, skillLines: 0 });
    totalFail += cases.length;
    continue;
  }
  const baseFn = baseMod[key];
  const skillFn = skillMod[key];
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  let fail = 0;
  for (const [input, expected] of cases) {
    const b = baseFn ? baseFn(input) : undefined;
    const s = skillFn ? skillFn(input) : undefined;
    if (!eq(s, expected) || !eq(b, expected)) {
      fail++;
      console.log(`✗ ${name} input=${JSON.stringify(input)} 期望=${JSON.stringify(expected)} 基线=${JSON.stringify(b)} 技能=${JSON.stringify(s)}`);
    }
  }
  const baseLines = linesOf(path.join(taskDir, 'baseline.mjs'));
  const skillLines = linesOf(path.join(taskDir, 'skill.mjs'));
  totalFail += fail;
  rows.push({ name, fail, baseLines, skillLines });
  const verdict = fail === 0 && skillLines <= baseLines;
  console.log(`[${name}] 用例 ${cases.length} / 失败 ${fail} | 基线 ${baseLines} 行 / 技能 ${skillLines} 行 | ${verdict ? '✅ 有效' : '⚠ 未达优'}`);
}

const date = new Date().toISOString().slice(0, 10);
const md = [
  '# benchmark run — ponytail-minimal',
  '',
  `- 日期: ${date}`,
  `- 执行者: human-dryrun（真实模型 A/B 待补）`,
  '',
  '| 任务 | 用例 | 失败 | 基线行 | 技能行 | 判定 |',
  '|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.name} | - | ${r.fail} | ${r.baseLines} | ${r.skillLines} | ${r.fail === 0 && r.skillLines <= r.baseLines ? '✅' : '⚠'} |`),
  '',
  `总结：任务 ${rows.length}，失败合计 ${totalFail}。`,
];
const outDir = path.join(here, 'results');
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, `${date}-run.md`), md.join('\n') + '\n', 'utf8');
console.log(`结果：benchmarks/results/${date}-run.md`);
process.exit(totalFail > 0 ? 1 : 0);
