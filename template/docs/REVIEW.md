# REVIEW.md

这份文件定义 Code Review / PR 约定：让人和 AI reviewer 用同一套标准审，让反馈**沉淀**成规则而不是反复口头解释（呼应 `AGENTS.md` 工作约定"某类 review feedback 反复出现 → 升级成机械规则/检查/linter"）。

## PR 描述要素（模板）

```text
## 目的
（一句话：解决什么，为什么现在做）

## 改动
- 主要改动点（文件级即可）
- 遵循的规范/分层（MODULE_STRUCTURE / CODE_STANDARDS 相关点）

## 验证证据
- 本地门禁：typecheck / lint / test / build 结果
- UI 改动：截图或浏览器实测步骤
- 关联 plan / spec / 测试链接

## 影响面
- 是否触碰公共 API / 依赖方向 / 兼容性
```

## 作者自审 checklist（提交前）

- [ ] 一次 PR 只做一个有边界的改动（小 PR 优先）
- [ ] 本地全套门禁绿（命令 = CI 命令，见 `CI_CD.md`）
- [ ] 命名/分层/样式合规（`CODE_STANDARDS.md` / `MODULE_STRUCTURE.md` / `FRONTEND.md`）
- [ ] 行为改动有测试或证据，且更新了相关 plan/spec/文档
- [ ] 无无关重构混入；无调试残留（console/log/token）

## Reviewer 关注点（人与 AI 通用）

1. **证据优先**：声明完成 ≠ 完成；看门禁与测试/截图。
2. **安全与边界**：secrets、不可信输入、外部动作（`SECURITY.md`）。
3. **结构与依赖**：是否越层/深路径/复制粘贴（`MODULE_STRUCTURE.md` §10）。
4. **可读性与维护性**：命名、拆分、是否把简单事写复杂。

## 反馈升级回路（关键机制）

> 同一类反馈出现 **第 2 次**，就不该再靠 reviewer 重复解释：

- 可机械化的（风格/边界/命名）→ 升级成 lint 规则 / import 检查 / 脚本（`CI_CD.md`）
- 需要上下文的（流程/边界/领域规则）→ 升级成文档（本文档系 / spec / plan）
- 升级动作本身要留痕：在本文件或 `tech-debt-tracker.md` 记一行"何时从口头反馈变成规则"

## 合入门禁

- 合并依赖：CI 全绿 + 至少一次有效 review（人或 AI reviewer）。
- review 阻塞项未清不合并；非阻塞建议记入 `tech-debt-tracker.md` 或新 issue，不拖死 PR。
