# FRONTEND.md

这份文件定义稳定的前端预期：默认栈、样式方案、组件书写与可访问性，避免 agent 每次都临场发明一套 UI 模式。
模块分层见 `MODULE_STRUCTURE.md`，通用命名/拆分见 `CODE_STANDARDS.md`。

## 默认栈契约

- **React（18/19）+ Vite + TypeScript（strict）+ Vitest + ESLint + Prettier**（SPA）。
- 若项目栈不同：改本节并同步 `ARCHITECTURE.md` 系统形态；本文件其余规则尽量保持栈中立。
- 验证命令以项目 `package.json` scripts 为准：`dev / build / typecheck / lint / test` 是五件套（见 `BOOTSTRAP.md`）。

## 样式方案（默认：CSS Modules + Less）

- 样式默认 `*.module.less`（CSS Modules + Less 预处理），与组件就近放置。
- 设计 tokens 用 Less 变量文件（如 `shared/styles/tokens.less`），禁止组件里散落魔法色值/间距。
- 类名语义化，BEM 风格：`.block__element--modifier`；层级与结构表达含义，不表达颜色位置。
- 禁止内联样式承载关键布局/主题逻辑；动态样式走 CSS 变量或条件类名。
- 若项目改用 Tailwind 等方案：在 bootstrap 时决策并记录于本节，不要两种混用。

## UI 原则（保留）

- 先保证清晰，再追求新鲜感。
- 交互流程要可发现、可重走、可重启。
- 优先沉淀少量可复用组件，而不是到处长一次性变体。
- 可访问性检查属于正常验证，不是最后的美化工作。

## 组件书写规则

- props 最小化：只暴露需要的；布尔 props 语义化（`disabled` 优于 `isDisabled`）。
- 组件呈现 empty / loading / error / retry 等关键状态，不静默空白。
- 受控与非受控明确其一；跨层状态提升前先想清楚归属（见模块分层）。
- 不把业务数据抓取写死在通用 `components/` 里。

## 可访问性检查清单

- 语义化标签优先（button/heading/nav…），图标按钮带 `aria-label`。
- 键盘可达：焦点顺序、可聚焦控件、Esc 关闭浮层。
- 焦点管理：打开浮层聚焦、关闭归还。
- 颜色不止靠色相传达（附加图标/文案），对比度达标。
- 表单控件有关联 label；错误提示可感知。

## UI 验证闭环

- 关键用户旅程留证据（截图 / 浏览器实测步骤写进相关 plan）。
- UI 行为改动后必须实际渲染验证，不能只靠"读代码"宣布完成（呼应 `AGENTS.md` 完成定义）。
- 修复 UI bug 后顺手补对应验证步骤。
- 视觉回归一旦常见：标准化截图或 DOM 检查（见 `RELIABILITY.md` 黄金旅程）。
- 把浏览器/运行时验证步骤写进当前 active plan。
