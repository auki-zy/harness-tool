# AGENTS.md

这个仓库面向长时运行的 coding-agent 工作流。保持这个文件简短，把它当成“唯一事实来源”的入口和路由层，而不是一本不断膨胀的大说明书。

## 开工流程

改代码前先做这些事：

1. 用 `pwd` 确认仓库根目录。
2. 读取 `ARCHITECTURE.md`：系统地图、分层与依赖规则、工程约定。
3. 读取 `docs/QUALITY_SCORE.md`：当前最弱的领域。
4. 读取 `docs/PLANS.md`，再打开 `docs/exec-plans/active/` 里的当前计划。
5. 读相关规格：`docs/product-specs/`（用户可见行为）、`docs/design-docs/`（为什么这么设计）。
6. 跑这个仓库的验证五件套（脚本名以 `package.json` 为准：`typecheck / lint / test / build`，加 `dev` 起来看一眼）。
7. 基础验证先失败就先修 baseline，再加新范围。

## 路由地图

- `ARCHITECTURE.md`：领域地图、分层与依赖规则、工程约定（栈 / 样式 / 命名 / 测试 / UI 验证）
- `docs/BOOTSTRAP.md`：用模板开新项目的必填 / 必装 / 必跑清单
- `docs/PLANS.md`：计划生命周期与执行计划规则
- `docs/exec-plans/active/`：当前正在执行的计划
- `docs/exec-plans/tech-debt-tracker.md`：延期处理的债务
- `docs/QUALITY_SCORE.md`：产品领域与架构层健康度
- `docs/product-specs/`：用户可见行为规格与验收标准
- `docs/design-docs/`：设计决策（accepted / proposed / deprecated）

## 能力从哪来（技能 / 子代理 / MCP）

- 本仓库**不放**能力内容，也不放它们的分发目录；用到什么就按名字装什么。
- 安装：`harness-tool add <name>`（默认从评测仓库 `harness-lab` 的 `adopted/` 找，类型自动识别）；`--from` 可指定别的源。
- 已采纳的能力都在评测仓库 `harness-lab`（`adopted/` 下），来源与试用证据在那里；不要在本仓库里复制一份。
- MCP 铁律：默认关、按需开；密钥只写 `${ENV_VAR}` 占位，绝不入库。

## 工作约定

- 一次只围绕一个有边界的计划或功能切片工作。
- 不能只靠读代码就宣布完成：必须有跑过的命令、可打开的产物或测试。
- 改了行为就同步更新对应的 spec、plan 与质量文档。
- 展示用文案、命名与拆分规则集中在 `ARCHITECTURE.md` 的「工程约定」里，别在组件里另立一套。
- 如果某类 review feedback 反复出现，把它升级成测试、检查或 linter，而不是在聊天里重复解释。
- 需要更多细节时，优先补小而新的文档，而不是继续把这个文件写长。

## 完成定义

一个改动只有在以下条件都满足时才算完成：

- 目标行为已实现
- 要求的验证真的跑过（五件套全绿）
- 证据已经挂到相关 plan 或质量文档里
- 受影响的文档仍然是最新的
- 仓库能按标准启动路径干净重启

## 收尾

结束会话前：

1. 更新当前 active execution plan 的进度日志。
2. 产品领域或架构层有明显变化时，更新 `docs/QUALITY_SCORE.md`。
3. 延期处理的债务记到 `docs/exec-plans/tech-debt-tracker.md`。
4. 做完的计划从 `active/` 移出，别让过期计划冒充"当前工作"。
5. 保证仓库可重启，并留下清晰的下一步动作。
