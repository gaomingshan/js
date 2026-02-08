# 构建工具发展趋势

## 概述

构建工具的“趋势”不是某个明星项目的更替，而是由三股长期力量驱动：

1. **Web 平台能力增强**：ESM、HTTP/2、原生特性让“开发期不打包”成为可能。
2. **项目规模与协作变复杂**：缓存、增量、可观测与治理成为刚需。
3. **性能成为基础设施问题**：Rust/Go 等高性能实现把吞吐变成标配。

理解这些驱动力，你就能在工具不断变化时保持稳定判断。

---

## 一、语言与实现：Rust/Go 工具链成为默认选项

趋势：

- bundler/transformer/minifier 越来越多采用 Rust/Go

原因：

- 构建本质是计算密集型（解析、转译、压缩）
- 多线程与内存控制对吞吐影响巨大

影响：

- “性能”逐步从差异点变成入门门槛
- 选型更看重：生态、治理、产物策略与兼容边界

---

## 二、范式演进：开发期 ESM 化，生产期依然产物导向

趋势：

- Dev 更偏向“按需 transform + 模块缓存”（ESM Dev）
- Build 仍偏向“全局视角优化”（bundling + chunking）

原因：

- 开发期优化目标是反馈速度（增量最小化）
- 生产期优化目标是交付质量（请求数、缓存、首屏关键资源）

> **关键点**
>
> Dev 与 Build 的最优解不同是常态，不必强行统一。

---

## 三、标准化与约束：Node Packages/exports 变得更关键

趋势：

- `package.json` 的 `exports`、条件导出、ESM/CJS 边界越来越影响“构建正确性”

原因：

- 生态正在从“默认 main”走向“多入口、多条件”
- bundler 需要在不同环境（browser/node/worker）做一致决策

影响：

- 依赖治理成为构建治理的一部分（版本统一、入口正确、避免重复依赖）

---

## 四、缓存与增量：从“本地优化”走向“分布式工程能力”

趋势：

- filesystem cache → content-addressed cache → remote cache

原因：

- Monorepo 与多团队协作让 CI 成本变成主要成本
- 可复现构建是缓存成立的前提

影响：

- 工具链会越来越强调：
  - 可复现
  - 可观测（stats/profile）
  - 输入/输出契约（cache key）

---

## 五、工具形态：从“单一 bundler”走向“平台化组合”

趋势：

- 应用级工具负责默认值与体验
- 引擎负责热点计算
- bundler 负责产物策略

原因：

- 构建系统的目标是多目标优化
- 组合分层能降低复杂度（每层专注自己的职责）

---

## 六、对学习者的建议：抓住不变的核心

无论工具怎么变，你只要掌握这几件事：

1. 模块图（Module Graph）
2. transform 管线与缓存
3. chunk 拆分与长期缓存策略
4. 解析与包入口（exports/conditions）

你就能快速适配新工具。

---

## 参考资料

- [Vite](https://vite.dev/)
- [webpack](https://webpack.js.org/)
- [Rspack](https://rspack.rs/)
- [Node.js - Packages](https://nodejs.org/api/packages.html)
- [ECMAScript Modules](https://tc39.es/ecma262/#sec-modules)
