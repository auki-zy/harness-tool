#!/usr/bin/env node
import { initProject, runStackScaffold } from './init.js';
import { doctorProject } from './doctor.js';
import { AGENT_SKILL_DIRS, installFromSource, type AgentId } from './skills.js';
import { AGENT_TARGET_DIRS, installAgentsFromSource, type AgentToolId } from './agents.js';
import { addServer, listServers, loadPreset, removeServer } from './mcp.js';
import { addCapability, DEFAULT_SOURCE } from './add.js';

const USAGE = `harness-tool — 给新项目一键带上 harness 工程层

用法：
  harness-tool init [dir] [--git] [--stack <vite-template>]
  harness-tool add <name> [dir] [--from <源>] [--update] [--force]
  harness-tool skills install <source> [dir] [--agents claude,cursor] [--update]
  harness-tool agents install <source> [dir] [--tools claude,cursor] [--update]
  harness-tool mcp add <name|preset> [dir] [--command <cmd>] [--args "…"] [--url <url>] [--force]
  harness-tool mcp list [dir]
  harness-tool mcp remove <name> [dir]
  harness-tool doctor [dir]

命令：
  init [dir] [--git] [--stack <tpl>]
                      把内置模板快照（AGENTS + docs 治理骨架）合并进 dir
                      （只新增、绝不覆盖；冲突列出；--git 额外执行 git init）
                      --stack：先用 create-vite 搭建代码脚手架再合并（如 react-ts/vue-ts）
  add <name> [dir] [--from <源>] [--update] [--force]
                      按名字装一个能力：默认从评测仓库 ${DEFAULT_SOURCE} 找
                      （先 adopted/ 再 candidates/）；类型自动识别——含 SKILL.md 是技能、
                      AGENT.md 是子代理、server.json 是 MCP 预设；--from 可换成别的源
  skills install <source> [dir] [--agents <list>] [--update]
                      从源安装技能：本地路径 / owner/repo[:sub] / https URL → .claude/skills/<name>/（默认 claude,cursor）
  agents install <source> [dir] [--tools <list>] [--update]
                      从源安装子代理规格（AGENT.md）→ <tool>/agents/<name>.md（默认 claude）
  mcp add/list/remove 管理项目 .mcp.json：add 支持 --command/--args/--url 或读预设 server.json
                      （密钥请用 \${ENV_VAR} 占位，不要写死；同名需 --force 覆盖）
  doctor [dir]        自检一个(harness)项目目录是否就绪：关键文件/占位符/机械配置/active plan/git

参数：
  dir   目标目录（默认 "."；init 时目录可不存在，会自动创建）

示例：
  harness-tool init my-app
  harness-tool init my-app --stack react-ts
  harness-tool add frontend-design my-app
  harness-tool add frontend-design my-app --from ./harness-lab
  harness-tool skills install auki-zy/harness-lab:adopted/skills/frontend-design my-app --update
  harness-tool agents install auki-zy/harness-lab:adopted/agents/code-reviewer my-app
  harness-tool mcp add auki-zy/harness-lab:adopted/mcp/filesystem my-app
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
  console.log(`  ${subtle('装能力（按需）：harness-tool add <名字>   # 默认从 harness-lab 的 adopted/ 找')}`);
}

/** harness-tool add <name> [dir] [--from <源>] [--update] [--force] */
function runAdd(args: string[]): number {
  let name = '';
  let dir = '.';
  let from: string | undefined;
  let update = false;
  let force = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--from') {
      const value = args[i + 1];
      if (!value || value.startsWith('-')) {
        console.error('--from 需要一个源（本地路径或 owner/repo）\n');
        console.error(USAGE);
        return 1;
      }
      from = value;
      i++;
    } else if (a === '--update') {
      update = true;
    } else if (a === '--force') {
      force = true;
    } else if (a.startsWith('-')) {
      console.error(`未知参数：${a}\n`);
      console.error(USAGE);
      return 1;
    } else if (!name) {
      name = a;
    } else {
      dir = a;
    }
  }

  if (!name) {
    console.error('add 需要 <name>：能力名，或一个能力目录路径\n');
    console.error(USAGE);
    return 1;
  }

  try {
    const { sourceLabel, capability, results } = addCapability({ name, dir, from, update, force });
    console.log(`${ok('✔')} ${capability.kind}：${capability.name}（来自 ${capability.pool}）— 源 ${sourceLabel}`);
    for (const r of results) {
      const icon = r.action === 'skipped' ? warn('↷') : r.action === 'updated' ? accent('⇅') : ok('✔');
      const verb =
        r.action === 'skipped' ? '已存在，跳过（要覆盖加 --update）' : r.action === 'updated' ? '已更新' : '已安装';
      console.log(`${icon} ${r.name} ${verb} → ${r.target}`);
    }
    return 0;
  } catch (err) {
    console.error(`harness-tool: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
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
  let update = false;
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
    } else if (a === '--update') {
      update = true;
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
    console.error('skills install 需要 <source>：本地技能路径 或 owner/repo[:sub]\n');
    console.error(USAGE);
    return 1;
  }
  const targets: AgentId[] = agents.length > 0 ? agents : ['claude', 'cursor'];
  try {
    const { sourceLabel, results } = installFromSource({ source, dir, agents: targets, update });
    console.log(`源：${sourceLabel}`);
    for (const r of results) {
      const icon = r.action === 'skipped' ? warn('↷') : r.action === 'updated' ? accent('⇅') : ok('✔');
      const verb = r.action === 'skipped' ? '已存在，跳过' : r.action === 'updated' ? '已更新' : '已安装';
      console.log(`${icon} ${r.agent}: ${r.skillName} ${verb} → ${r.target}`);
    }
    return 0;
  } catch (err) {
    console.error(`harness-tool: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}

function runAgents(args: string[]): number {
  const sub = args[0];
  if (sub !== 'install') {
    console.error(`未知 agents 子命令：${sub ?? '(空)'}\n`);
    console.error(USAGE);
    return 1;
  }
  let source = '';
  let dir = '.';
  let update = false;
  const tools: AgentToolId[] = [];
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--tools') {
      const list = args[i + 1];
      if (!list) {
        console.error('--tools 需要逗号分隔列表（如 claude,cursor）\n');
        return 1;
      }
      for (const id of list.split(',')) {
        const k = id.trim() as AgentToolId;
        if (!(k in AGENT_TARGET_DIRS)) {
          console.error(`未知工具：${id}（支持 ${Object.keys(AGENT_TARGET_DIRS).join(' / ')}）`);
          return 1;
        }
        tools.push(k);
      }
      i++;
    } else if (a === '--update') {
      update = true;
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
    console.error('agents install 需要 <source>（含 AGENT.md 的目录 / owner/repo[:sub]）\n');
    console.error(USAGE);
    return 1;
  }
  const targets: AgentToolId[] = tools.length > 0 ? tools : ['claude'];
  try {
    const { sourceLabel, results } = installAgentsFromSource({ source, dir, tools: targets, update });
    console.log(`源：${sourceLabel}`);
    for (const r of results) {
      const icon = r.action === 'skipped' ? warn('↷') : r.action === 'updated' ? accent('⇅') : ok('✔');
      const verb = r.action === 'skipped' ? '已存在，跳过' : r.action === 'updated' ? '已更新' : '已安装';
      console.log(`${icon} ${r.tool}: ${r.name} ${verb} → ${r.target}`);
    }
    return 0;
  } catch (err) {
    console.error(`harness-tool: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}

function runMcp(args: string[]): number {
  const sub = args[0];
  const fallbackName = (s: string): string => {
    const stripped = s.replace(/[\\/]+$/, '');
    const tail = stripped.includes(':') ? stripped.slice(stripped.lastIndexOf(':') + 1) : stripped;
    return tail.replace(/[\\/]+$/, '').split(/[\\/]/).pop() ?? tail;
  };

  if (sub === 'list') {
    const dir = args[1] ?? '.';
    try {
      const names = listServers(dir);
      if (names.length === 0) console.log('（未配置任何 MCP server）');
      else for (const n of names) console.log(`- ${n}`);
      return 0;
    } catch (err) {
      console.error(`harness-tool: ${err instanceof Error ? err.message : String(err)}`);
      return 1;
    }
  }

  if (sub === 'remove') {
    const name = args[1];
    const dir = args[2] ?? '.';
    if (!name) {
      console.error('mcp remove 需要 <name>\n');
      console.error(USAGE);
      return 1;
    }
    try {
      const done = removeServer(dir, name);
      console.log(done ? `${ok('✔')} 已移除 mcp server：${name}` : `${warn('↷')} 未找到：${name}`);
      return done ? 0 : 1;
    } catch (err) {
      console.error(`harness-tool: ${err instanceof Error ? err.message : String(err)}`);
      return 1;
    }
  }

  if (sub === 'add') {
    let positional = '';
    let dir = '.';
    let name = '';
    let command = '';
    let url = '';
    let argsStr = '';
    let force = false;
    for (let i = 1; i < args.length; i++) {
      const a = args[i];
      const next = (): string => args[i + 1] ?? '';
      if (a === '--command') { command = next(); i++; }
      else if (a === '--url') { url = next(); i++; }
      else if (a === '--args') { argsStr = next(); i++; }
      else if (a === '--name') { name = next(); i++; }
      else if (a === '--force') { force = true; }
      else if (a.startsWith('-')) {
        console.error(`未知参数：${a}\n`);
        console.error(USAGE);
        return 1;
      } else if (!positional) {
        positional = a;
      } else {
        dir = a;
      }
    }
    if (!positional) {
      console.error('mcp add 需要 <name|preset>（或 --name + --command/--url）\n');
      console.error(USAGE);
      return 1;
    }
    try {
      let config: Record<string, unknown>;
      if (command || url) {
        if (!name) name = positional;
        config = command
          ? { command, args: argsStr ? argsStr.split(/\s+/).filter(Boolean) : [] }
          : { url };
      } else {
        const preset = loadPreset(positional);
        if (!name) name = preset.name ?? fallbackName(positional);
        config = preset.config;
      }
      if (!name) throw new Error('无法确定 server 名（可用 --name 指定）');
      const { action } = addServer({ dir, name, config, force });
      console.log(`${action === 'added' ? ok('✔') : accent('⇅')} ${action === 'added' ? '已添加' : '已覆盖'} mcp server：${name}`);
      console.log(subtle('提示：密钥请用 ${ENV_VAR} 占位，真实值放环境变量/凭据管理器，不要写进仓库。'));
      return 0;
    } catch (err) {
      console.error(`harness-tool: ${err instanceof Error ? err.message : String(err)}`);
      return 1;
    }
  }

  console.error(`未知 mcp 子命令：${sub ?? '(空)'}（支持 add / list / remove）\n`);
  console.error(USAGE);
  return 1;
}

function main(argv: string[]): number {
  const cmd = argv[2];
  if (!cmd || cmd === '-h' || cmd === '--help' || cmd === 'help') {
    console.log(USAGE);
    return 0;
  }
  if (cmd !== 'init' && cmd !== 'doctor' && cmd !== 'add' && cmd !== 'skills' && cmd !== 'agents' && cmd !== 'mcp') {
    console.error(`未知命令：${cmd}\n`);
    console.error(USAGE);
    return 1;
  }

  if (cmd === 'skills') {
    return runSkills(argv.slice(3));
  }
  if (cmd === 'agents') {
    return runAgents(argv.slice(3));
  }
  if (cmd === 'add') {
    return runAdd(argv.slice(3));
  }
  if (cmd === 'mcp') {
    return runMcp(argv.slice(3));
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
