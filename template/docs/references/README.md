# references/ 目录约定

> 本目录放**面向模型阅读的外部参考材料**（呼应 `AGENTS.md` 工作约定："外部 reference 放进 `docs/references/`"）。

## 约定

- 参考材料以 `*-llms.txt` 命名：内容应是给 LLM 预读的精炼片段（官方文档子集），不是整页拷贝。
- 文本优先（`.txt` / `.md`）；放项目外部的规范整理（如 FSD 指南）也可放此，但正文规则仍留在 `docs/` 顶层。
- bootstrap 时按项目抓取相关官方参考存为 `*-llms.txt`，例如（前端基线常用）：
  - React：`react.dev/llms.txt`
  - Vite：`vite.dev/llms.txt`
  - TypeScript：官方文档的 llms.txt（若站点提供）
  - ESLint / Vitest：按需
- 链接/整理类样例见 [`agent-tool-views-samples.md`](agent-tool-views-samples.md) 与 [`fsd-guide.md`](fsd-guide.md)。
