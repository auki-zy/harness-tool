# CODE_STANDARDS.md

这份文件定义通用编码规范：命名、文件拆分、TypeScript 严格度、副作用与提交约定，让 agent 与人遵守同一套"看起来像同一个人写的"规则。
可机械执行的交给 lint/typecheck（见 `BOOTSTRAP.md` / `CI_CD.md`），这里只留文字规则。

## TypeScript 默认值

- `strict: true` 为默认；`any` 必须带理由注释，禁止作为"绕路出口"。
- 类型收窄用显式判断；导出类型集中或就近声明，避免散落。
- 接口与实现同名时不加 `I` 前缀。

## 命名规则

| 对象 | 规则 | 示例 |
|------|------|------|
| 目录 | kebab-case（分层目录按 `MODULE_STRUCTURE.md` 固定） | `features/order-history` |
| 文件 | kebab-case | `order-history.tsx` |
| React 组件 | PascalCase + 默认具名导出 | `OrderHistory` |
| hooks | `use` 前缀 + camelCase | `useOrderHistory` |
| 函数/变量 | camelCase | `fetchOrders` |
| 常量 | UPPER_SNAKE（组内用 `as const`） | `ORDER_STATUS.READY` |
| 类型 | PascalCase | `OrderItem` |
| 样式类名 | 语义化 + BEM 风格（配 Less Modules，见 `FRONTEND.md`） | `.order-item__title` |
| 测试文件 | 就近 `*.test.ts(x)` 或统一 `__tests__/`（bootstrap 时定一种，禁混用） | `order-history.test.tsx` |

## 文件拆分

- 一个文件一个主职责；UI / 逻辑 / hooks / 常量 / 类型分文件放，禁止堆巨型文件（软上限约 300 行）。
- 就近放置：`.tsx`、样式、`.test.tsx` 同目录。
- 公共出口：目录 `index.ts` 只导出公开面。
- 拆分决策树：
  - 重复 UI → `components/`（通用）或 `widgets/`（区块）
  - 重复逻辑 → hooks / `shared/`
  - 跨页面的业务 → `features/` 切片
  - 纯数据变换 → `shared/utils`
  - 复杂页面开始膨胀 → 优先拆子组件/hook，而不是继续加长文件

## 数据流与副作用

- 纯函数优先；禁止在渲染函数体内做副作用（fetch、订阅、写存储）。
- 副作用集中在事件处理器、effects、或明确的数据层；错误处理必须显式（不静默吞错）。
- 状态变更走既定数据流；UI 状态不泄露进业务逻辑。

## 提交信息约定

- 格式：`<type>: <短描述>`，type ∈ `feat / fix / docs / refactor / chore / test / perf`。
- 描述用祈使句、聚焦一件事；行为相关提交同步更新对应 plan/spec（见 `AGENTS.md` 工作约定）。

## 禁止模式

- 复制粘贴代码代替复用（先找 `components/` / `shared/`）
- 用 `any` / `@ts-ignore` 绕过类型系统
- 静默吞错或无证据声称"已修复/已完成"
- 在一个 PR/提交里混入无关重构

## 提交前自检

1. `typecheck` / `lint` / `test` 是否通过（命令以项目 `package.json` scripts 为准）？
2. 命名与分层是否合规（对照本文件与 `MODULE_STRUCTURE.md`）？
3. 是否引入了本可复用的重复代码？
