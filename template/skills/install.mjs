#!/usr/bin/env node
// 安装 skills/ 目录下的内置技能到各编码 agent 的技能目录（幂等：已存在跳过）。
// 用法（项目根执行）：node skills/install.mjs [--agents claude,cursor]
// 内置集是"随模板快照分发的稳定默认技能"；需要从源持续更新的技能请改用：
//   harness-tool skills install <owner/repo[:path]> [--update]
// 本脚本零依赖、只复制、不执行技能内容。
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AGENTS = {
  claude: (root) => path.join(root, '.claude', 'skills'),
  cursor: (root) => path.join(root, '.cursor', 'skills'),
};

function parseArgs() {
  const argv = process.argv.slice(2);
  const idx = argv.indexOf('--agents');
  return idx > -1 && argv[idx + 1] ? argv[idx + 1].split(',').map((s) => s.trim()) : Object.keys(AGENTS);
}

function skillName(skillDir) {
  const head = readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8').split('\n').slice(0, 40).join('\n');
  const m = head.match(/^name:\s*"?([^"\s]+)"?\s*$/m);
  return (m?.[1] || path.basename(skillDir)).trim();
}

const agents = parseArgs();
const skillsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url))); // <项目根>/skills
const root = path.dirname(skillsDir);

const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => path.join(skillsDir, e.name))
  .filter((d) => existsSync(path.join(d, 'SKILL.md')));

if (skillDirs.length === 0) {
  console.log('✔ 内置技能 0 个（技能入库标准见 skills/README.md）');
  process.exit(0);
}

console.log(`安装 ${skillDirs.length} 个内置技能 → ${agents.join(' / ')}`);
for (const dir of skillDirs) {
  const name = skillName(dir);
  for (const agent of agents) {
    const agentDir = AGENTS[agent](root);
    mkdirSync(agentDir, { recursive: true });
    const target = path.join(agentDir, name);
    if (existsSync(target)) {
      console.log(`  ↷ ${agent}: ${name} 已存在，跳过`);
    } else {
      cpSync(dir, target, { recursive: true });
      console.log(`  ✔ ${agent}: ${name} 已安装 → ${path.relative(root, target).replace(/\\/g, '/')}`);
    }
  }
}
console.log('提示：experimental/ 下的草案技能不会被安装；需要从源更新的技能见 skills/README.md（harness-tool 仓库源）。');
