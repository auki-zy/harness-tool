# skills/ 技能源目录

> 随模板分发的**通用技能源**（canonical）：每个技能一份 `SKILL.md`，随项目 bootstrap 复制到工具的技能目录使用。
> 与 `AGENT_TOOLING.md` 分工一致：这里是"源"，工具目录（Cursor `.cursor/skills` / Claude Code `.claude/skills` / DSH 等）是"安装视图"。

## 唯一原则

**模板只收"在至少一个真实项目里被验证过"的技能**——入库必须带使用证据与理由；禁止"收藏夹式"集成（收藏 = 维护负担 + 每个新项目的噪音）。

## 目录结构

```text
skills/
├── README.md            # 本文件：清单/标准/安装
└── <skill-name>/
    └── SKILL.md         # frontmatter: name + description；正文 = 该技能的操作步骤
```

`SKILL.md` 骨架（新技能照此写）：

```markdown
---
name: skill-短横线名
description: 一句话说明何时该用（触发条件尽量具体、可判定）
---

# <技能名>

## 适用场景
（触发条件；不适用时明说）

## 步骤
1. …
2. …

## 验证
（最小可验证命令或 checklist——没有验证路径的技能不入库）

## 关联
（相关 docs 规则 / 流程链接，避免与 docs 重复维护）
```

## 入库 checklist（全部满足才允许放进本目录）

- [ ] 通用性：不绑定单一项目或公司流程（绑定类放个人技能目录）
- [ ] 可判定触发：`description` 能让人/agent 判断"什么时候该用"
- [ ] 有验证路径：自带最小验证（命令或 checklist）
- [ ] 体积小、依赖少：SKILL.md + 少量脚本，不拖运行环境
- [ ] 不与 docs 规则重复：操作步骤 → 技能；规则/约束 → docs
- [ ] **使用证据**：在 ≥1 个真实项目跑通过（记录项目与日期）

## 安装 / 发现

- **内置技能一键安装**：项目根执行 `node skills/install.mjs [--agents claude,cursor]`——把顶层内置技能装到 `.claude/skills`、`.cursor/skills`（幂等：已存在跳过；零依赖；不执行技能内容）。内置集是随模板快照分发的**稳定默认集**。
- **需要持续更新的技能**：用 `harness-tool skills install <owner/repo[:path]> [--update]` 直接从源（如本模板仓库 `auki-zy/harness-template:skills/<name>`）安装/更新——不依赖模板快照。详见 [harness-tool](https://github.com/auki-zy/harness-tool)。
- **草案技能**：放 `skills/experimental/<name>/`——`install.mjs` 不会把它装到 agent 技能目录（仅在仓库内作参考/试点，附 `EVIDENCE.md` 记录验证证据）；验证成熟后提升到顶层。
- 仓库内 `skills/` 始终是源，各 agent 目录（`.claude/skills` 等）只是安装副本。
- 发现路径：本 README 列当前技能清单；agent 开工时由 `AGENTS.md` 路由或工具视图引用。
- 验证约定：技能有效性用固定任务基准验证（详见 [`skills/benchmark-guide.md`](benchmark-guide.md)）；experimental 技能须带 `EVIDENCE.md` 与 `benchmarks/` 证据。

## 当前技能清单

（v1：暂无内置技能。第一批在"用模板开第一个真实项目"后，按本 checklist 逐批回填。）
