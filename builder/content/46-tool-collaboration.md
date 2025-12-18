# 构建工具协作模式

## 概述

真实项目里“选一个工具包打天下”并不常见，更常见的是：

- 用一个**应用级工具**提供开发体验与默认最佳实践（Vite / Rsbuild）
- 用一个或多个**构建引擎/子工具**加速热点环节（esbuild / SWC / LightningCSS / Terser）
- 用一个**产物导向的 bundler**完成生产构建（Rollup / Rspack / webpack）

这不是“工具太多导致混乱”，而是因为前端构建同时要满足三种互相拉扯的目标：

- **开发反馈速度**（快）
- **产物可控与可优化**（稳）
- **生态与兼容性**（广）

本篇给出一种你在公司里最容易见到、也最容易长期维护的协作模型，并解释它背后的原理。

---

## 一、协作的基本单位：模块图（Module Graph）

无论你用什么工具，最终都会围绕“模块图”工作：

```text
入口 Entry
  ↓ resolve
模块 A ── import ──> 模块 B ── import ──> 模块 C
  ↓ transform            ↓ transform            ↓ transform
可执行代码 + sourcemap
```

工具协作的核心问题其实是：

- 谁负责构建模块图？
- 谁负责把图转成浏览器/Node 能执行的代码？
- 谁负责把图压缩/拆分/落盘（产物策略）？

---

## 二、最常见的协作模式：Vite + esbuild + Rollup

### 2.1 角色分工

- **Vite（平台层）**：
  - Dev Server + HMR
  - 以请求驱动的按需 transform
  - 管理模块图缓存与失效

- **esbuild（引擎层）**：
  - 依赖预构建（pre-bundling）
  - TS/JSX 的高速转译
  - 生产构建时可参与 minify

- **Rollup（bundler/产物层）**：
  - 生产构建的 bundling、tree shaking、code splitting
  - 输出结构与 chunk 策略
  - 插件生态（尤其适合库/多格式产物）

> **关键点**
>
> Vite “快”的关键是开发范式（ESM + 按需 transform），不是因为它不用 bundler；Rollup 仍然是生产构建的主力。

### 2.2 为什么不能让 Rollup 一把梭（开发也用 bundler）

bundle-first dev server（典型是 webpack-dev-server）的问题在于：

- 每次变更都可能触发“重新构建大块 bundle”
- 即使有增量构建，反馈也更依赖缓存命中与复杂的依赖失效策略

而 Vite 的优势在于：

- 页面加载什么模块，就 transform 什么模块
- HMR 的失效边界更容易收敛在“模块级”

---

## 三、另一种协作模式：Rsbuild + Rspack（平台与 bundler 合一）

在 Rspack/Rsbuild 体系里，协作关系更像：

- **Rsbuild**：提供默认工程体验与上层配置语义
- **Rspack**：负责 bundling 与 dev server
- **内置 SWC/CSS 能力**：替代一部分传统 loader 链路

这种模式的优势是：

- webpack 心智与产物控制力更容易保留
- 性能与默认值更现代

代价是：

- 你仍处在 bundler-first 的范式里（与 Vite 的 ESM dev 不同）

---

## 四、协作的“边界设计”：把哪件事交给谁

一个实用的判断法：

### 4.1 交给平台层（Vite/Rsbuild）

- Dev Server/HMR
- HTML 模板与入口管理
- 环境变量与模式（dev/prod/preview）
- 插件治理与默认值

### 4.2 交给引擎层（esbuild/SWC）

- TS/JSX/语法转译
- 依赖预构建
- 快速 minify（视需求）

### 4.3 交给 bundler 层（Rollup/Rspack/webpack）

- chunk 拆分策略
- runtime 注入
- 复杂的 asset 输出与缓存策略
- 与历史生态/复杂场景的兼容

> **关键点**
>
> 协作不是“叠加工具”，而是“叠加职责”。你应该尽量避免多套工具在同一职责上重复工作。

---

## 五、常见反模式（踩坑点）

1. **同时启用两套转译链**：
   - 例如 Babel + SWC + esbuild 同时处理同一类文件，导致规则冲突与调试困难。

2. **生产构建与开发构建语义割裂**：
   - Dev 用一套别名/注入规则，Prod 又另一套，最后出现“只在生产报错”。

3. **把平台当 bundler 用**：
   - 例如为复杂产物策略强行写大量 Vite 插件，最后变成“自研 bundler 平台”。

---

## 参考资料

- [Vite](https://vite.dev/)
- [Rollup](https://rollupjs.org/)
- [esbuild](https://esbuild.github.io/)
- [Rspack](https://rspack.rs/)
- [Rsbuild](https://v0.rsbuild.dev/)
