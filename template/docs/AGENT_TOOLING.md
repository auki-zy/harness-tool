# AGENT_TOOLING.md

这份文件定义 AI 工具生态接入约定：`AGENTS.md` 是**唯一 canonical 入口**，Claude Code、Cursor、Codex 等的规则文件只是它的"视图"；同时定义仓库内 skills（技能）的组织方式。目标：换工具不丢上下文，加能力不改多处。

## 原则

- **单一事实**：所有规则与路由只维护在 `AGENTS.md`（+ 它链接的 `docs/`）。工具私有文件尽量薄。
- 工具文件要么**只声明"读 AGENTS.md 与对应路径"**，要么是 AGENTS 路由的机械投影；禁止同一规则在两个文件各写一遍（必然漂移）。
- 深层规则永远拆到 `docs/` 里由 AGENTS 链接（呼应 core-beliefs：AGENTS 是路由器，不是百科全书）。
- 薄视图样例见 [`references/agent-tool-views-samples.md`](references/agent-tool-views-samples.md)（CLAUDE.md / .cursor 各一份，bootstrap 时抄）。

## 常见工具映射

| 工具 | 入口文件 | 本模板的约定 |
|------|---------|-------------|
| 通用 / DSH / 未来 agent | `AGENTS.md` | canonical，唯一维护点 |
| Claude Code | `CLAUDE.md` | 薄视图：指向 AGENTS + 少量工具特有设置（权限/钩子） |
| Cursor | `.cursor/rules/*.mdc` | 薄视图：指向 AGENTS；项目级指令用一条 `AGENTS.mdc` 引用 |
| Codex / 其它 | 各自规则文件 | 同上：能引用就引用，不复制正文 |

**同步触发**：当 AGENTS 路由地图增删文档时，检查各工具视图是否需要 +1 行引用（新增能力 → 对应登记，见文末检查项）。

## Skills（技能从哪来）

- **本模板不放技能内容**：技能本体在评测仓库 `harness-lab` 的 `adopted/` 下（含来源、试用证据与许可），
  用 `harness-tool add <name>` / `harness-tool skills install <source>` 装进来，落在工具生态的目录里
  （`.claude/skills/` `.cursor/skills/` 或 `~/.claude/skills`，bootstrap 时定）。**不要在本仓库里再复制一份**。
- 自己写技能时（项目专有的那种）才放 `skills/<skill-name>/SKILL.md`，`SKILL.md` frontmatter 必填：
  ```yaml
  ---
  name: skill-短横线名
  description: 一句话说明何时该用（触发条件尽量具体）
  ---
  ```
- 技能 = 可复用"怎么做"（流程/命令/模板），不是项目专属配置；一条技能只做一件事，写不进一句 description 就拆。
- 与 `docs/` 关系：规则放 docs，操作步骤放 skill；两者都从 AGENTS/索引可发现。

## 上下文预算

- 指令文件（AGENTS/工具视图/技能 description）保持小；大段背景放被链接文档（渐进披露）。
- 新增能力时优先"新增小而新的文档/技能 + 一行路由"，而不是膨胀现有文件（呼应 AGENTS 工作约定末条）。

## 检查项

- [ ] 新增能力/文档后，AGENTS 路由与各工具视图是否需要登记？
- [ ] 是否存在同一规则在 AGENTS 与工具文件重复维护？
- [ ] 新技能是否有可判定的 `description`（触发条件）与唯一职责？
