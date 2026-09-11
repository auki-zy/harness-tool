# harness-tool

**把 agent-first 工程层一键装进新项目的 CLI** —— `init` 在任意目录铺好 AGENTS / 系统地图 / 治理文档骨架，`doctor` 负责确认它真的就绪；技能等能力按需从评测仓库安装。

> `v0.1.0 · Node ≥ 20 · MIT · 零运行时依赖 · 工具中立（DSH / Claude Code / Cursor / Codex 通用）`

---

## ✨ 特性

| | 特性 | 说明 |
|---|---|---|
| ⚡ | **一条命令铺层** | `harness-tool init my-app`：模板快照合并进目标目录；配合 `--stack` 可先搭代码脚手架 |
| 🏗 | **代码脚手架可选** | `--stack react-ts`：先用 create-vite 搭好 app，再合并 harness 层（两者不冲突） |
| 🧩 | **能力按需安装** | `harness-tool add <name>`：默认从 `harness-lab` 的 `adopted/` 按名字找（类型自动识别），装进项目；也可用 `skills install` / `agents install` / `mcp add` 从任意源装 |
| 🛡 | **绝不覆盖** | 只新增；已存在文件一律跳过并列出冲突，你的文件永远安全 |
| 🤖 | **AI 交接** | 装完直接输出一段可复制的提示语，交给编码 agent 照仓库内文档继续落地 |
| 🩺 | **就绪自检** | `harness-tool doctor`：关键文件 / 占位符 / 机械配置 / active plan / git 五维检查 |
| 🔧 | **零运行时依赖** | 纯 Node 实现；TypeScript + Vitest + ESLint 仅用于开发与测试 |
| 🔄 | **模板源可同步** | 内置 `template/` 快照源自 [`harness-template`](https://github.com/auki-zy/harness-template)，发版前随源更新 |

## 🚀 快速开始

```bash
# 纯 harness 层
npx harness-tool init my-app
# 直接带前端脚手架（先 create-vite 再合并 harness 层）
npx harness-tool init my-app --stack react-ts
cd my-app
harness-tool doctor              # 自检（会提示还缺哪些文档/配置）
harness-tool add frontend-design # 按需装一个能力（默认从 harness-lab 拿）
```

然后把 `init` 输出里那段话发给你的编码 agent（DSH / Claude Code / Cursor / Codex），
它会按仓库内 `AGENTS.md` 与 `docs/BOOTSTRAP.md` 完成落地——你不需要手把手教它。

想叠前端栈？直接用 `--stack`（自动执行 `npm create vite@latest` 后再合并），或手动 `npm create vite@latest . -- --template react-ts` 后再 `harness-tool init`。
能力（技能 / 子代理 / MCP）不在模板里，用到什么按名字装什么——在项目目录里执行：

```bash
harness-tool add frontend-design            # 默认从 harness-lab 的 adopted/ 找
harness-tool add frontend-design --from .   # 换源时才需要 --from（本地路径 / owner/repo）
```

类型自动识别（`SKILL.md` → 技能，`AGENT.md` → 子代理，`server.json` → MCP 预设）；已采纳能力与试用证据都在 [`harness-lab`](https://github.com/auki-zy/harness-lab)。

## 📖 命令参考

| 命令 | 作用 | 退出码 |
|------|------|--------|
| `harness-tool init [dir] [--git] [--stack <tpl>]` | ①（`--stack` 时）先用 create-vite 搭脚手架 → ② 把模板快照合并进 `dir`（默认 `.`）：只新增不覆盖、冲突列出；`--git` 额外执行 `git init -b main` | 0=成功，1=错误 |
| `harness-tool doctor [dir]` | 自检目录是否具备可开工的 harness 工程层 | 0=可开工（无关键缺失），1=存在关键缺失 |
| `harness-tool add <name> [dir] [--from <源>] [--update] [--force]` | **按名字装能力**：默认从 `harness-lab` 找（先 `adopted/` 再 `candidates/`），类型自动识别；技能 → `.claude/skills/<name>/` 与 `.cursor/skills/<name>/`，子代理 → `.claude/agents/<name>.md`，MCP → 项目 `.mcp.json` | 0=成功，1=错误 |
| `harness-tool skills install <source> [dir] [--agents <list>] [--update]` | 从源（本地路径 / `owner/repo[:sub]` / https URL）安装技能 → `.claude/skills/<name>/`（默认 `claude,cursor`）；`--update` 重拉覆盖 | 0=成功，1=错误 |
| `harness-tool agents install <source> [dir] [--tools <list>] [--update]` | 从源安装子代理规格（`AGENT.md`）→ `<tool>/agents/<name>.md`；默认 `claude` | 0=成功，1=错误 |
| `harness-tool mcp add <name\|preset> [dir] [--command <cmd>] [--args "…"] [--url <url>] [--force]` | 写入项目 `.mcp.json`；`preset` = 含 `server.json` 的目录/仓库路径；同名需 `--force`；**不写真实密钥** | 0=成功，1=错误 |
| `harness-tool mcp list [dir]` / `mcp remove <name> [dir]` | 列出 / 移除已配置的 MCP server | 0=成功，1=错误/未找到 |

`doctor` 检查维度：关键文件（critical）· 占位符是否已填 · 五件套 scripts / tsconfig · active plan · git。

## 🧩 它往项目里放了什么

```text
my-app/
├── AGENTS.md          # Agent 开工流程 + 路由地图
├── ARCHITECTURE.md    # 系统形态 / 领域地图 / 分层规则 / 工程约定
└── docs/              # 治理骨架（BOOTSTRAP · PLANS · QUALITY_SCORE · product-specs · design-docs · exec-plans）
```

装的是"规则与治理骨架"，不是代码脚手架——`package.json`、`src/` 等由你的技术栈脚手架负责，两者不冲突、互不覆盖。
模板也不带能力内容（技能 / 子代理 / MCP）：那些按需从 `harness-lab` 装，项目里只留安装副本。

## 🛠 工作原理

- **模板快照**：`template/` 是 [`harness-template`](https://github.com/auki-zy/harness-template) 的版本化快照；`init` 递归合并、逐文件判断"已存在则跳过"。
- **验证闭环**：`doctor` 把模板的纪律（文档填了没、机械配置装没装、计划建没建）转成可执行检查——AI 干完活能自证"就绪"。

## 🔗 相关项目

| 仓库 | 关系 |
|------|------|
| [`harness-template`](https://github.com/auki-zy/harness-template)（npm 模板源） | 本 CLI 内置快照的上游；模板与工具"同源、各自迭代" |
| [`harness-lab`](https://github.com/auki-zy/harness-lab)（能力评测仓库） | 能力的唯一来源：已采纳的 `adopted/`、候选 `candidates/`，带来源与试用证据；用本 CLI 装进项目 |

本项目自身也用它自己的方法论治理（dogfood）：AGENTS 路由、BOOTSTRAP 清单、active plan 驱动。

## 🔄 模板自动同步与发布（GitHub Actions）

内置 `template/` 是 [`harness-template`](https://github.com/auki-zy/harness-template) 的**版本化快照**。为让模板更新尽快到达用户，本仓库配了自动流水线：

- **触发**：每天 `02:00 UTC` 定时检查；也可在仓库 **Actions → Run workflow** 手动触发；
- **逻辑**：对比上游 `harness-template@main` 最新 commit 与 `template/.template-version`；有更新则同步快照 → `npm version patch` → 过 `typecheck / lint / test / build` → 发布 npm → 打 `vX.Y.Z` tag；
- **前置**：仓库需配置 npm 发布密钥（Actions secret `NPM_TOKEN`：npmjs 上 auki-zy 的 granular token，勾选 *Read and write* 与 *Bypass 2FA*）；
- **用户侧**：新版本发布后，`npx harness-tool` / `npm i -g harness-tool@latest` 即拿到含最新模板的快照；**已初始化项目不会被自动覆盖**（项目是独立副本，需升级时走模板同步流程）；
- **手动**：本地 `npm run sync:template` 可随时同步（写入 `template/.template-version`）。

```text
harness-template 更新
   ↓（Actions 每日/手动检查）
harness-tool 同步快照 + bump + 发布 npm vX.Y.Z
   ↓（用户 npx / npm i -g @latest）
新项目 init 时拿到最新模板
```

## 🧑‍💻 开发

```bash
git clone https://github.com/auki-zy/harness-tool.git
cd harness-tool
npm install            # 开发依赖（TypeScript/Vitest/ESLint）
npm run build          # 产出 dist/
npm run lint && npm test   # 质量门禁
npm link               # 本地体验：任意目录执行 harness-tool
```

| script | 作用 |
|--------|------|
| `dev` / `start` | 运行 CLI（需先 build） |
| `build` / `typecheck` | tsc 产出 / 类型检查 |
| `lint` / `test` | ESLint / Vitest（threads 池） |

## 🗺 仓库治理入口

- [`AGENTS.md`](AGENTS.md)：开工流程 + 路由地图（canonical 入口）
- [`ARCHITECTURE.md`](ARCHITECTURE.md)：系统形态与分层
- [`docs/BOOTSTRAP.md`](docs/BOOTSTRAP.md)：开新项目落地清单
- 当前计划：[`docs/exec-plans/active/`](docs/exec-plans/active/)

---

> 反馈与想法：欢迎在 [issues](https://github.com/auki-zy/harness-tool/issues) 提出。
