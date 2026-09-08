# A/B 验证指引（真实模型对照）

目标：补足"human-dryrun"无法证明的——**真实模型加载技能前后是否有收益**。

## 怎么做（每任务一次，共两轮）

对同一固定任务 `benchmarks/tasks/<name>/description.md`（+ cases.mjs 做断言）：

| 轮 | 条件 | 会话给模型的材料 |
|---|---|---|
| A（基线） | 无技能 | 仅 `description.md`（要求写出实现，可提示"有 cases.mjs 可测"） |
| B（技能） | 加载技能 | `description.md` + 对应 SKILL.md（让模型先读技能再实现） |

产出：各自写 `tasks/<name>/solution-a.mjs` / `solution-b.mjs`（导出与 baseline 同名函数），跑断言与行数。

## 记录

把结果写进 `results/<date>-<模型名>.md`，字段：
模型/版本、日期、每任务：A 行数 vs B 行数、通过率、B 是否 ≤ A、一次通过还是反复修正（若可观测）。

## 判定

- 3 个任务中 B 全部正确且 ≥2 个任务 B 行数 ≤ A → 技能"有效（受控模型证据）"，可考虑提升内置；
- 否则记卡点回写 SKILL.md（改版后重跑）。

> 注意：不同模型差异大，先固定一个主力模型跑；结果要标模型名，别跨模型平均。
