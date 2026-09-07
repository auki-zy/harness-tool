#!/usr/bin/env node
import { initProject, runStackScaffold } from './init.js';
import { doctorProject } from './doctor.js';
import { AGENT_SKILL_DIRS, installSkill, type AgentId } from './skills.js';

const USAGE = `harness-tool — 给新项目一键带上 harness 工程层

用法：
  harness-tool init [dir] [--git] [--stack <vite-template>]
  harness-tool skills install <skill> [dir] [--agents claude,cursor]
  harness-tool doctor [dir]

命令：
  init [dir] [--git] [--stack <tpl>]
                      把内置模板快照（AGENTS/docs 治理/工程规范/skills 源）合并进 dir
                      （只新增、绝不覆盖；冲突列出；--git 额外执行 git init）
                      --stack：先用 create-vite 搭建代码脚手架再合并（如 react-ts/vue-ts）
  skills install <skill> [dir] [--agents <list>]
                      把一个技能目录（含 SKILL.md）复制安装进 dir 下各 agent 的技能目录
                      （默认 agents=claude,cursor；已存在则跳过不覆盖）
  doctor [dir]        自检一个(harness)项目目录是否就绪：关键文件/占位符/机械配置/active plan/git

参数：
  dir   目标目录（默认 "."；init 时目录可不存在，会自动创建）

示例：
  harness-tool init my-app
  harness-tool init my-app --stack react-ts
  harness-tool init . --git
  harness-tool skills install ./skills/code-review my-app --agents claude,cursor
  harness-tool doctor
`;

const paint = (code: number, s: string): string => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const ok = (s: string): string => paint(32, s); // green
const warn = (s: string): string => paint(33, s); // yellow
const accent = (s: string): string => paint(36, s); // cyan
const subtle = (s: string): string => paint(2, s); // dim

function printNextSteps(dir: string, created: number, conflicts: string[]): void {
  const where = dir === '.' ? '当前目录' : dir;
  console.log(`${ok('✔')} 已在 ${where} 写入 ${created} 个 harness 工程文件`);
  if (conflicts.length > 0) {
    const shown = conflicts.slice(0, 5).join('、');
    console.log(`${warn('⚠')} 跳过 ${conflicts.length} 个已存在文件：${shown}${conflicts.length > 5 ? ` 等 ${conflicts.length} 个` : ''}`);
  }
  console.log('');
  console.log(`  ${accent('交给 AI')}：复制这句给你的 agent：`);
  console.log(`    ${subtle('“请按 AGENTS.md + BOOTSTRAP.md 落地，最后跑 harness-tool doctor 确认。”')}`);
  console.log(`  ${accent('自己动手')}：按 docs/BOOTSTRAP.md 操作。`);
  console.log(`  ${subtle('装内置技能（如需）：node skills/install.mjs')}`);
}

function runSkills(args: string[]): number {
  const sub = args[0];
  if (sub !== 'install') {
    console.error(`未知 skills 子命令：${sub ?? '(空)'}\n`);
    console.error(USAGE);
    return 1;
  }
  let source = '';
  let dir = '.';
  const agents: AgentId[] = [];
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--agents') {
      const list = args[i + 1];
      if (!list) {
        console.error('--agents 需要一个逗号分隔列表（如 claude,cursor）\n');
        console.error(USAGE);
        return 1;
      }
      for (const id of list.split(',')) {
        const k = id.trim() as AgentId;
        if (!(k in AGENT_SKILL_DIRS)) {
          console.error(`未知 agent：${id}（支持 ${Object.keys(AGENT_SKILL_DIRS).join(' / ')}）`);
          return 1;
        }
        agents.push(k);
      }
      i++;
    } else if (a.startsWith('-')) {
      console.error(`未知参数：${a}\n`);
      console.error(USAGE);
      return 1;
    } else if (!source) {
      source = a;
    } else {
      dir = a;
    }
  }
  if (!source) {
    console.error('skills install 需要 <skill>（含 SKILL.md 的技能目录路径）\n');
    console.error(USAGE);
    return 1;
  }
  const targets: AgentId[] = agents.length > 0 ? agents : ['claude', 'cursor'];
  try {
    const results = installSkill({ source, dir, agents: targets });
    for (const r of results) {
      const icon = r.installed ? ok('✔') : warn('↷');
      console.log(`${icon} ${r.agent}: ${r.skillName} ${r.installed ? '已安装' : '已存在，跳过'} → ${r.target}`);
    }
    return 0;
  } catch (err) {
    console.error(`harness-tool: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}

function main(argv: string[]): number {
  const cmd = argv[2];
  if (!cmd || cmd === '-h' || cmd === '--help' || cmd === 'help') {
    console.log(USAGE);
    return 0;
  }
  if (cmd !== 'init' && cmd !== 'doctor' && cmd !== 'skills') {
    console.error(`未知命令：${cmd}\n`);
    console.error(USAGE);
    return 1;
  }

  if (cmd === 'skills') {
    return runSkills(argv.slice(3));
  }

  if (cmd === 'doctor') {
    const dir = argv[3] ?? '.';
    if (argv[4]) {
      console.error(`未知参数：${argv[4]}\n`);
      console.error(USAGE);
      return 1;
    }
    const res = doctorProject(dir);
    for (const c of res.checks) {
      const icon = c.ok ? '✓' : c.critical ? '✗' : '!';
      console.log(`${icon} ${c.name} — ${c.detail}`);
    }
    const warns = res.checks.filter((c) => !c.critical && !c.ok).length;
    console.log(`\n${res.criticalFails === 0 ? '✅ 可开工' : `❌ ${res.criticalFails} 项关键缺失`}（警告 ${warns} 项）`);
    return res.criticalFails === 0 ? 0 : 1;
  }

  let dir = '.';
  let git = false;
  let stack: string | undefined;
  const args = argv.slice(3);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--git') {
      git = true;
    } else if (arg === '--stack') {
      const tpl = args[i + 1];
      if (!tpl || tpl.startsWith('-')) {
        console.error('--stack 需要一个 create-vite 模板名（如 react-ts）\n');
        console.error(USAGE);
        return 1;
      }
      stack = tpl;
      i++;
    } else if (arg.startsWith('-')) {
      console.error(`未知参数：${arg}\n`);
      console.error(USAGE);
      return 1;
    } else {
      dir = arg;
    }
  }

  try {
    if (stack) {
      runStackScaffold(dir, stack);
      console.log(`${accent('⚙')} 已用 create-vite 搭建脚手架：${stack}`);
    }
    const { created, conflicts } = initProject({ dir, git });
    printNextSteps(dir, created.length, conflicts);
    return 0;
  } catch (err) {
    console.error(`harness-tool: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}

process.exitCode = main(process.argv);
