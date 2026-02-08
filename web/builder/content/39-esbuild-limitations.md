# esbuild 的局限性

## 概述

esbuild 的优势非常明确：**快**。

但工程实践里更重要的是边界：你要知道它“不擅长什么”，否则很容易出现两类问题：

- 把它当成“webpack/Vite 的替代品”，结果在复杂场景下踩坑
- 用它做了不该由它承担的职责，导致工程成本反而上升

这篇聚焦：esbuild 的局限来自哪些设计取舍，以及真实项目里如何规避。

---

## 一、局限 1：类型系统不在它的职责范围

### 1.1 能编译 TS，但不做类型检查

esbuild 对 TypeScript 的支持主要是：

- 语法层转译（去类型、转 JSX）

它不会替代：

- `tsc` 的类型检查
- `.d.ts` 生成（声明文件）

> **关键点**
>
> “构建成功”不等于“类型正确”。生产工程通常把类型检查作为独立步骤（`tsc --noEmit`），并作为 CI 门禁。

---

## 二、局限 2：应用级构建生态与深度定制能力较弱

### 2.1 插件能力边界更收敛

esbuild 有插件，但它更偏向：

- resolve/load 这类“工程拦截点”

并不擅长：

- 深度介入 chunk/asset 生命周期
- 复杂 runtime 注入与产物治理
- 复刻 webpack 那种“把构建当成可编程平台”的生态

> **直觉理解**
>
> esbuild 更像“高速编译器内核”，而不是“构建平台”。

### 2.2 复杂资产管线的边界

大型应用常见的复杂需求包括：

- 多入口、多 HTML 注入
- 微前端子应用的产物隔离
- 特殊资源处理链（历史 loader/plugin）
- 非标准场景下的 source map 与错误追踪

这类需求通常更适合：

- webpack/Rspack 这类 bundler-first 体系
- 或由 Vite/Rsbuild 这类平台工具在上层封装

---

## 三、局限 3：CommonJS/互操作与 tree shaking 的现实世界复杂度

### 3.1 tree shaking 的前提很苛刻

即使 esbuild 很快，tree shaking 的效果仍取决于：

- 依赖是否提供可静态分析的 ESM
- `sideEffects` 是否正确
- 代码是否存在阻碍静态分析的动态行为

因此你会遇到：

- 某些包无论用什么工具都摇不干净（因为它本身不是可摇形态）

> **关键点**
>
> tree shaking 是“生态问题 + 语义问题”，不是单纯“换工具”就能解决。

---

## 四、局限 4：开发体验不是它的主场

### 4.1 esbuild 不等于 dev server

esbuild 可以 serve，但它不是一个以：

- HMR 边界
- 框架集成（React/Vue 的 refresh）
- 错误覆盖层
- 依赖预构建策略治理

为核心目标的“应用开发平台”。

真实项目里，开发体验通常由：

- Vite/Rsbuild/webpack-dev-server

来承担。

---

## 五、不要用 esbuild 做什么（明确结论）

1. **不要指望它替你做 TS 类型检查**：类型检查应独立执行。
2. **不要把它当成复杂企业级应用的唯一构建平台**：产物策略、生态、治理需求会让你造一堆轮子。
3. **不要用它硬顶历史 webpack 生态**：loader/plugin 兼容是现实成本。

---

## 六、正确的工程姿势：把 esbuild 放到合适的位置

### 6.1 应用开发（推荐）

- 平台：Vite / Rsbuild / webpack
- 引擎加速：esbuild/SWC

你获得：

- 体验（dev server/HMR）
- 生态（插件体系）
- 性能（热点环节由 esbuild 加速）

### 6.2 库/CLI 构建（推荐）

- 产物目标简单：esbuild 直接构建
- 产物目标复杂：Rollup（必要时用 esbuild 做辅助）

---

## 参考资料

- [esbuild](https://esbuild.github.io/)
- [TypeScript - `tsc --noEmit`](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [Vite](https://vite.dev/)
- [webpack](https://webpack.js.org/)
