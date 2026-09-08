# EVIDENCE：ponytail-minimal（experimental 试点）

状态：Tier0（候选）。验证闭环已跑通：experimental → 固定任务基准 → 对照结论 → EVIDENCE 留痕。

## L0 静态自检

- [x] description 可判定触发；步骤=动词+产物；含"验证"小节且可运行
- [x] 无工具绑定；来源标注（ponytail 哲学，MIT）
- [x] 与 `CODE_STANDARDS` 互补（技能给步骤，无规则重复）；体量小

## 基准结果（human-dryrun；真实模型 A/B 待补）

运行：`node skills/experimental/ponytail-minimal/benchmarks/run.mjs`（零依赖，自动断言+行数）
详见 `benchmarks/results/2026-09-07-run.md`：

| 任务 | 用例 | 失败 | 基线行 | 技能行 | 判定 |
|---|---|---|---|---|---|
| csv-sum | 8 | 0 | 25 | 4 | ✅ |
| dedupe | 6 | 0 | 17 | 1 | ✅ |
| email-validator | 12 | 0 | 31 | 2 | ✅ |

**待补**：真实模型 A/B（见 `benchmarks/AB.md`）——同任务"无技能 vs 加载技能"，记录行数与一次通过率。

## 卡点与备注

- Windows 动态 import 需 `pathToFileURL`；数组产物需深比较（JSON）——已在 run.mjs 修复。
- "最少"不应牺牲可读：SKILL.md"验证"里要求多写超 30% 需说明理由。
- 3 个纯函数任务不足以证明普适；扩展（重构/错误处理类任务）后再评估提升内置。
- 验证方法通用约定见 `skills/benchmark-guide.md`。
