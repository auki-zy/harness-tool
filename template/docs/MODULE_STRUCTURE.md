# MODULE_STRUCTURE.md

这份文件定义前端模块分层，避免 agent 每次临场发明目录结构、或发明跨层依赖。
默认面向 React SPA（栈契约见 `FRONTEND.md`）；FSD 方法论详解见 [`references/fsd-guide.md`](references/fsd-guide.md)，本文件只留**规则**。

## 分层（Feature-Sliced 风格）

顶层目录即模块边界，只允许向下引用：

```text
shared → components → features → widgets → pages
```

| 层 | 职责 | 放什么 | 禁止 |
|----|------|--------|------|
| `pages/` | 路由页面级组装 | 路由入口、页面布局、数据加载编排 | 不放可复用 UI |
| `widgets/` | 页面内可复用区块 | 头部/侧边栏/卡片组等跨页区块 | 不放纯 UI 原子组件 |
| `features/` | 业务功能切片 | 一次完整业务能力（`features/auth/login-form`） | 不放通用组件 |
| `components/` | 通用/基础组件 | 无业务含义的原子/复合组件（`components/ui/button`） | 不放业务逻辑 |
| `shared/` | 跨层共享（可别名 `lib/`） | utils、hooks、types、api client、常量、design tokens | 不得依赖任何上层 |

> 基线为 `features/widgets/pages/components` 四层（主人指定）+ `shared/` 推荐补充。引入 FSD `entities/` 或 `app/` 层时，在 `ARCHITECTURE.md` 与本文记录差异。

## 依赖规则（硬规则）

- 每层只可引用自己及更下层；**禁止反向引用与跨层直连**（`features/` 不得 import `pages/` 或 `widgets/`）。
- 同层 `features/*` 切片默认禁止互引：需要协作就把共同部分下沉到 `components/` 或 `shared/`（领域成型后再考虑 `entities/`）。
- 同层协作走公共出口 `index.ts`；禁止深路径散引（`../features/x/ui/deep/comp`）。
- 机械执行：`eslint-plugin-boundaries` 或等价 import 检查（见 `BOOTSTRAP.md` / `CI_CD.md`）。
- 违反依赖方向 = 架构违规：要么移码到正确层，要么先在 `ARCHITECTURE.md` 说明分层调整理由。

## features/ 切片内部

每个业务切片自洽，推荐"四件套"，小功能允许从简：

```text
features/order-history/
├── ui/          # 切片内组件
├── model/       # 状态与业务逻辑（store/reducer/hooks）
├── api/         # 切片数据访问
└── index.ts     # 公共出口（只导出公开面）
```

## 何时提升 / 下放

- 组件出现第二个使用方：从 `features/` 内移到 `components/`（区块则 `widgets/`）。
- 区块只在单一页面使用：先就近放 `pages/<page>/`，重复出现再提升 `widgets/`。
- 跨切片复用的逻辑：下沉 `shared/`，不要复制。
- 禁止过早抽象：第二个使用方出现前，不提前建层。

## 提交前自检

1. 新 import 是否越层 / 反向 / 深路径？
2. 新代码是否放进了语义正确的层？
3. 是否复制了本应共享的组件/逻辑？
4. 分层调整是否同步更新了 `ARCHITECTURE.md`？
