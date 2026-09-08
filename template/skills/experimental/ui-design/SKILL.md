---
name: ui-design
description: >
  设计或改进界面外观时使用：页面/组件的视觉层级、排版、配色、间距、状态反馈，
  让产物"好看且符合项目规范"而不是默认模板脸。在实现 UI 前后都适用；需要遵循
  项目 `docs/FRONTEND.md` 与设计 tokens。工具中立。来源参考：Anthropic Agent Skills
  frontend-design 思路（MIT）。
---

# ui-design（写出美观且规范的界面）

## 适用场景

- 从零写页面/组件，或要美化已有界面、消除"默认模板感"；
- 用户说"做好看点/更精致/风格统一/别像模板"。

## 步骤

1. **先读规范**：项目 `docs/FRONTEND.md`（栈与样式方案）与设计 tokens（`references/` 或 tokens 文件）；不发明与项目冲突的设计语言。
2. **定层级**：一个主行动/主信息；标题→正文→辅助信息节奏清晰；空白是设计的一部分。
3. **少而一致的视觉词**：配色/圆角/字号/间距从 tokens 取；强调色只用于行动点与状态。
4. **写真实内容自测**：用真实文案/边界（长标题、空态、报错）检查不破版。
5. **状态与反馈**：loading / empty / error / success 都要有可见处理（呼应 FRONTEND）。
6. **收尾验证**：对照 `docs/FRONTEND.md` 可访问性清单 + 截图自查。

## 验证

- [ ] 样式只来自 tokens/规范，无散落魔法值
- [ ] 语义结构 + 键盘可达 + 对比度自查通过
- [ ] 真实内容与三种状态不破版；截图留证

## 关联

- 项目 `docs/FRONTEND.md`、`docs/MODULE_STRUCTURE.md`（FSD 分层）
- 设计 tokens 样本见项目 `references/`（若未建，先建 tokens 文件再设计）
