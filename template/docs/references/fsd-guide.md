# FSD 指南（Feature-Sliced Design）参考

> 配套 `../MODULE_STRUCTURE.md`（规则版）。本文是 FSD 方法论文档的整理：为什么存在、分层/切片/公共 API 怎么运作。
> FSD 是社区方法论（feature-sliced.github.io），本文只做中文整理与模板适配，非原创规范。

## 1. 它解决什么

无约束前端结构有三大慢性病：

- **循环依赖**：A 引 B、B 引 A，越改越难拆
- **隐性耦合**：牵一发动全身，不敢重构
- **AI/新人无法判断落子位置**：只能问人，或复制别人的写法

FSD 三条核心法则：
1. **按业务切片组织**（不是按技术类型）：同一业务的东西放一起，改一个需求不跨十个文件夹
2. **依赖方向严格单向**：上层具体、下层通用，下层永远不知道上层存在
3. **只暴露公共 API**：外部只能引用入口文件，内部随便改不惊动调用方

## 2. 标准分层（canonical）

```text
app → pages → widgets → features → entities → shared
```

| 层 | 职责 | 放什么 | 禁止 |
|----|------|--------|------|
| `app/` | 应用装配与初始化 | 路由表、全局 store、provider、启动配置 | 不放业务 UI |
| `pages/` | 路由页面组装 | 页面组件、页面级数据加载 | 不放可复用区块 |
| `widgets/` | 可复用区块 | 跨页区块（header/sidebar/card 组） | 不放纯 UI 原子 |
| `features/` | 业务场景切片 | 一次完整能力（含 UI+逻辑） | 不依赖别的 feature |
| `entities/` | 业务实体 | 领域对象与其展示/操作 | 不依赖具体页面场景 |
| `shared/` | 无业务共享 | utils/hooks/types/api client/UI 原子/tokens | 不依赖任何上层 |

> 旧版 FSD 的 `processes/` 层已废弃（职责并入 pages/features）。`entities/` 是领域成型后才值得抽的层。

## 3. 切片（slice）与段（segment）

- **slice**：某一层下按业务拆的文件夹（kebab-case），边界由业务语言定义
- **segment**：slice 内部按技术职责分的子目录

```text
features/order-history/     # slice
├── ui/                     # UI 组件
├── model/                  # 状态/业务逻辑（store/reducer/hooks）
├── api/                    # 数据访问
├── lib/                    # 切片私有工具
├── config/                 # （可选）切片内配置
└── index.ts                # 公共 API
```

规则：小切片可平铺（不必强行四段）；slice 内部 segment 可用相对路径，**对外一律走 `index.ts`**。

## 4. 依赖与公共 API

- 只允许向下引用；同层 slice 默认**禁止互引**（需要协作 → 共同部分下沉 entities/shared）
- 公共 API（`index.ts`）是唯一对外入口；禁深路径 import（`../features/a/ui/deep/comp`）
- **公共 API 即评审面**：改它等于改契约；内部改动完全自由
- 机械执行：`eslint-plugin-boundaries` 或等价 import 检查

## 5. 完整示例（电商风格）

```text
src/
├── app/router.tsx, providers.tsx
├── pages/home/, checkout/
├── widgets/header/, product-card-grid/
├── features/auth/, cart/, search/
├── entities/product/, user/
├── components/ui/button/          # = shared/ui
└── shared/api, hooks, types, constants, styles/tokens
```

依赖示例：`pages/checkout → widgets/* / features/cart / entities/product / components/* / shared/*`；
`features/cart → entities/product / components/* / shared/*`（绝不 → pages/ 或其它 features/*）。

## 6. 反模式速查

- `components/` 变垃圾桶（业务组件混入）
- 层间穿越（页面直连兄弟 feature 深路径）
- 切片蔓延（一层 10+ 切片且没抽 entities/ → 缺领域模型）
- 过度分层（小项目强开全部层）
- 复制粘贴跨切片复用

## 7. 模板基线的适配

模板基线 `pages/widgets/features/components/shared` 是 canonical 的精简：
`components/` ≈ `shared/ui`；`entities/` 与 `app/` 按演进开关启用（出现跨 feature 共享的领域对象 → 抽 entities；路由/全局装配膨胀 → 抽 app）。详见 `../MODULE_STRUCTURE.md` §适配。
