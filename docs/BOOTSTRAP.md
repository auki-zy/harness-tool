# BOOTSTRAP.md

这份文件定义用本模板开新项目时的必填/必装清单，避免每次 bootstrap 都依赖主人逐条口述。
模板仓库本身只放规则与治理骨架；**机械配置（依赖/配置文件）落在新项目里**，按本清单装。

> 与根目录 `index.md` 的分工：`index.md` 说明"复制模板当下"的顺序；本文件是"开项目之后"的落地执行清单（含每项为什么）。

## 1. 建仓

- `git init`（main 分支）；把本模板文件复制为项目起点。
- 保留 `AGENTS.md` / `ARCHITECTURE.md` / `docs/` 骨架；按模板 `index.md` 的推荐顺序落位。

## 2. 必填文档（在开写代码前完成）

- [ ] `ARCHITECTURE.md`：填系统形态（产品/主流程/运行面）；领域地图照抄 `MODULE_STRUCTURE.md` 的分层（前端）或改写
- [ ] `docs/PRODUCT_SENSE.md`：产品核心四行（用户/任务/痛点/质量门槛）
- [ ] `docs/exec-plans/active/`：建第一份执行计划（参照 `docs/PLANS.md`）
- [ ] `docs/FRONTEND.md` 默认栈契约：确认或改写（默认 React+Vite+TS）
- [ ] 样式方案决策：Less Modules（默认）或 Tailwind，二选一记入 `FRONTEND.md`

## 3. 必装机械配置（含"为什么"）

| 配置 | 为什么 | 备注 |
|------|--------|------|
| `package.json` scripts：`dev / build / typecheck / lint / test` | AGENTS 完成定义引用的验证命令必须有落点 | 命令名保持这套，别发明新名 |
| `tsconfig` 开 `strict` | 类型即契约 | 见 `CODE_STANDARDS.md` |
| ESLint + Prettier | 风格机械执行，不靠口头约定 | 配 `eslint-plugin-boundaries` 执行模块分层依赖方向 |
| Vitest（或项目既定测试框架） | 行为证据 | 测试文件命名先定一种，禁混用 |
| Less + CSS Modules 或 Tailwind | 样式方案落地 | 只选一个 |

## 4. 必跑验证（声明"完成"之前）

```text
typecheck && lint && test && build   # 全绿才可宣布完成
```

- 对应 `AGENTS.md` 完成定义与 `RELIABILITY.md` 标准路径；任一失败先修 baseline 再加新范围。

## 5. 非默认栈 / 非前端项目

- 覆盖点：`ARCHITECTURE.md` 领域地图、`FRONTEND.md` 栈契约（或整节替换为对应领域）、本清单第 3 项的配置集。
- `CODE_STANDARDS.md` 的命名/提交/副作用约定尽量保留（通用）。

## 6. 收尾检查

- 一个新 agent（无聊天上下文）能否只靠仓库：读 AGENTS → ARCHITECTURE → 找到 active plan → 跑通验证？
- 若不能，补文档或清单，而不是继续口头交代。

## 7. 能力（技能 / 子代理 / MCP，可选）

- 本仓库不放能力内容；能力统一放在评测仓库 `harness-lab`（已采纳的 `adopted/`、候选 `candidates/`，带来源与试用证据）。
- 安装方式：`harness-tool skills install auki-zy/harness-lab:adopted/skills/<name> [项目]`（子代理 / MCP 同理）。
- 只装本项目实际会用到的，不要整目录全量复制；装完在 `ARCHITECTURE.md` 的「横切接口」记一行。
