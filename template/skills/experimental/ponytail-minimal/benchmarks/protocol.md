# 基准协议：ponytail-minimal

## 目的
用固定任务 + 自动指标度量该技能是否带来"更少代码且正确"的收益；跑"无技能基线 vs 带技能"两版实现做对照。

## 任务集（起步 1 个，可扩展）
- `email-validator`：写一个 `isEmail(s)`，返回 boolean。要求：非空、单 `@`、@ 后有点且有域名、本地部分非空。

## 度量（自动）
1. **正确性**：对固定用例断言全过（run.mjs 内 assert）。
2. **代码量**：非空行数（实现文件，不含注释/导入差异按实现计算）。
3. **结论规则**：两版都正确时，行数少者为优；技能版 ≤ 基线则"有效（本任务）"。

## 裁判
- 自动：用例断言 + 行数对比（run.mjs）。
- 人工补充：可读性抽查（命名/无死代码）——写入结果备注。

## 运行
```bash
node skills/experimental/ponytail-minimal/benchmarks/run.mjs
```

## 记录
- 结果写入 `benchmarks/results/<date>-<model 或 human>.md`；
- 标注：任务集版本、执行者（模型名或 human-dryrun）、日期。
- 技能每次改版后重跑并追加记录。
