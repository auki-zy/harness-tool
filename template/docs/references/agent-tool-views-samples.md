# AI 工具薄视图样例

> 配套 `../AGENT_TOOLING.md`：工具规则文件是 `AGENTS.md` 的"薄视图"，只做引用，不复制正文。
> bootstrap 时把下面任一/全部样例拷到对应位置，替换仓库路径后即可用。

## Claude Code：`CLAUDE.md`（仓库根）

```markdown
# CLAUDE.md

本仓库的 canonical 规则入口是 AGENTS.md。
- 开工前先读 `AGENTS.md`（含路由地图）与 `ARCHITECTURE.md`。
- 项目级工程规范按需读：`docs/FRONTEND.md`、`docs/CODE_STANDARDS.md`、`docs/MODULE_STRUCTURE.md`。
- 验证路径以 `docs/BOOTSTRAP.md` 与 CI（`docs/CI_CD.md`）为准，本地过全套门禁才算完成。
- 收尾按 `AGENTS.md` 与 `docs/MEMORY.md` 执行（记忆分层/历史索引/技术债）。
```

## Cursor：`.cursor/rules/AGENTS.mdc`

```markdown
---
description: 仓库 canonical 规则入口（先读 AGENTS.md）
globs: ["**/*"]
alwaysApply: true
---

本仓库唯一 canonical 规则入口是根 `AGENTS.md`（含开工流程与路由地图）。
- 改 UI/代码前读 `docs/FRONTEND.md`、`docs/CODE_STANDARDS.md`、`docs/MODULE_STRUCTURE.md`。
- 完成 = 本地全套门禁绿 + 证据挂 plan/文档；收尾遵守 `AGENTS.md` 与 `docs/MEMORY.md`。
```

## 其它工具

同一模式：规则文件只声明"读 AGENTS.md 与相关 docs 路径"，不复制规则正文；AGENTS 路由增删时回来同步引用。
