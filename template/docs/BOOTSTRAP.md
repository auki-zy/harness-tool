# BOOTSTRAP.md

这份文件定义用本模板开新项目时的必填 / 必装 / 必跑清单，避免每次 bootstrap 都依赖主人逐条口述。

模板只放规则骨架，**机械配置与产品代码落在新项目里**，按本清单装配。

## 1. 建仓

- `npx harness-tool init <项目>`（推荐，合并而不覆盖），或把本模板当 GitHub Template 建仓。
- 结果应该包含：`AGENTS.md`、`ARCHITECTURE.md`、`README.md`、`docs/`（BOOTSTRAP / PLANS / QUALITY_SCORE / product-specs / design-docs / exec-plans）。
- `git init` 后第一次提交前，先做完第 2、3 步。

## 2. 必填文档（开写代码之前完成）

- [ ] `ARCHITECTURE.md`：填系统形态（产品 / 主流程 / 运行面）、领域地图，并按实际栈改写「工程约定」一节
- [ ] `docs/QUALITY_SCORE.md`：填产品领域与架构层两栏（未填写的项 agent 不得自行假设等级）
- [ ] `docs/product-specs/`：写第一份用户可见行为规格（索引里挂一行）
- [ ] `docs/exec-plans/active/`：建第一份执行计划（格式见 `docs/PLANS.md`）
- [ ] `docs/design-docs/`：把"为什么这么选"的第一个决策写下来（可选，但一旦有争议就补）

## 3. 必装机械配置（含"为什么"）

| 配置 | 为什么 | 备注 |
|------|--------|------|
| `package.json` scripts：`dev / build / typecheck / lint / test` | `AGENTS.md` 完成定义引用的验证命令必须有落点 | 命令名保持这套，别发明新名 |
| `tsconfig` 开 `strict` | 类型即契约 | 非 TS 项目换成对应的静态检查 |
| ESLint（+ 格式化工具） | 风格机械执行，不靠口头约定 | 需要时再加分层依赖检查 |
| 测试框架（Vitest / pytest / …） | 行为证据 | 测试文件命名先定一种，禁混用 |
| 样式方案 | 落地方式定一次 | 只选一个；设计 token 集中在一个文件 |

## 4. 必跑验证（声明"完成"之前）

```text
typecheck && lint && test && build   # 全绿才可宣布完成
```

- 对应 `AGENTS.md` 的完成定义；任一失败先修 baseline，再加新范围。

## 5. 能力（技能 / 子代理 / MCP，按需）

- 本模板**不带**能力内容。需要什么就按名字装：

  ```bash
  harness-tool add <name>                 # 默认从评测仓库 harness-lab 的 adopted/ 找
  harness-tool add <name> --from <源>      # 指定别的源（本地路径 / owner/repo）
  ```

- 类型自动识别（技能 / 子代理 / MCP）；`harness-tool mcp add` 也可直接写命令行配置。MCP 默认关、按需开，密钥只写 `${ENV_VAR}`。
- 来源与试用证据都在 `harness-lab`；装完在 `ARCHITECTURE.md`「横切接口」记一行。
- 只装本项目实际会用到的，不要整目录全量复制。

## 6. 收尾检查

- 一个新 agent（无聊天上下文）能否只靠仓库：读 AGENTS → ARCHITECTURE → 找到 active plan → 跑通验证？
- `harness-tool doctor` 是否全绿（关键文件齐全、无模板占位残留、五件套脚本到位）？
- 若不能，补文档或清单，而不是继续口头交代。
