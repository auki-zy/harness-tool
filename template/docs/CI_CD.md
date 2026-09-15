# CI_CD.md

这份文件定义 CI 门禁蓝图：把 `AGENTS.md` 的"完成定义"与 `RELIABILITY.md` 的标准路径机械化，让人机和 agent 共用同一道门禁。
模板层只放蓝图与理由；`.github/workflows` 等实现在 bootstrap 时落地（见 `BOOTSTRAP.md`）。

## 门禁顺序（标准流水线）

```text
typecheck → lint → test → build → (结构检查) → 全绿才可合并/发布
```

| 阶段 | 跑什么 | 为什么 | 失败即 |
|------|--------|--------|--------|
| typecheck | `tsc --noEmit`（strict） | 类型即契约 | 阻断 |
| lint | ESLint（含 import 边界/命名规则） | 风格与结构机械执行 | 阻断 |
| test | Vitest/项目框架（`TESTING.md` 层级） | 行为证据 | 阻断 |
| build | 生产构建 | 产物可生成 | 阻断 |
| 结构检查 | md 相对链接自检、`eslint-plugin-boundaries` 依赖方向 | 文档/架构不漂移 | 阻断 |

## 规则

- 顺序不可跳：先修 baseline（红的基础验证），再加新范围（呼应 `AGENTS.md` 开工第 7 步）。
- agent 声称"完成"的凭证 = 门禁绿 + 证据挂在 plan/文档（不是聊天里的一句话）。
- **结构检查是通用件**：md 链接自检（防文档断链）与 import 边界检查（防分层穿越）成本低、收益高，建议每个项目都上。
- 门禁脚本与本地 scripts 一致（同一命令，`package.json scripts` 为唯一事实，见 `BOOTSTRAP.md`）。

## CD / 发布（按需启用）

- 预览部署：PR 构建 → 预览 URL（前端 SPA 常见）。
- 发布：main 绿 → 构建产物发布（Pages / npm / 平台）；发布前跑一次全量门禁。
- 版本：发布走 semver + CHANGELOG（若项目启用，见模板变更管理约定——未内置时按项目决策）。
- **密钥只走 CI secrets**，不落源码/日志（呼应 `SECURITY.md`）；`.env` 样例入库、真实值不入库。

## 落地要点

1. bootstrap 时按本蓝图生成 `.github/workflows/ci.yml`（job 一一对应上表）。
2. 每个 job 命令与本地 `package.json scripts` 完全一致，杜绝"本地过 CI 挂"。
3. 加新检查先在本文件登记一行（谁/跑什么/为什么），再实现——避免检查清单与实现漂移。
