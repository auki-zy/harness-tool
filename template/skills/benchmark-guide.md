# 技能基准指南（通用外壳）

> 目标：每个技能进 `experimental/` 时都带"可复现的验证"，证据够再提升内置。
> 参照试点：`skills/experimental/ponytail-minimal/`（已跑通）。

## 目录约定

```text
skills/<name>/或 skills/experimental/<name>/
├── SKILL.md
└── benchmarks/
    ├── protocol.md        # 本技能的指标与裁判规则
    ├── run.mjs            # （可选）零依赖运行器：断言 + 指标
    ├── AB.md              # 真实模型对照步骤（A 无技能 / B 有技能）
    ├── tasks/<task>/{description,cases, baseline, skill}.*
    └── results/<date>-<执行者>.md
```

## 裁判三级（按技能类型选择）

1. **自动**（产物可断言）→ run.mjs 自动判：正确性 + 可比指标（行数/大小/次数…）。可判定产物型技能用这层即可。
2. **LLM 按 protocol checklist 评**：过程/方法型技能（计划、review、调试）产物不唯一——给 checklist，由模型对照打分。
3. **人工/审美评审**：设计/体验类技能，产物正确只算"规范符合"，美感必须人看（截图 A/B）。

## 铁律

- **对照才有意义**：一律"无技能基线 vs 带技能"，差值才是技能贡献；
- **标版本**：results 文件名带日期与执行者（模型名或 human-dryrun）；技能改版重跑；
- **零依赖优先**：run.mjs 纯 Node，任务输入用固定用例；别为验证引入工具链；
- **诚实分级**：human-dryrun ≠ 模型证据；升级内置以 `AB.md` 的真实模型对照为准。

## 判定参考

- 全部任务正确 + 多数任务指标更优 → 可提议提升内置（附 evidence 链接）；
- 有卡点 → 回写 SKILL.md 并重跑；仍不过 → 留在 experimental 或废弃。
