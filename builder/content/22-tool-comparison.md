# 工具对比矩阵

## 概述

对比构建工具时，最容易犯的错是把不同层级的工具放在同一维度比较（例如把 esbuild 当作“完整应用平台”去和 Vite/webpack 对打）。

这份矩阵的目标是帮你快速建立“全景直觉”：

- 每个工具的**核心设计目标**是什么
- 它擅长解决什么问题
- 它不擅长什么（边界在哪里）

> **提示**
>
> 性能对比很依赖项目规模与配置。这里给的是“结构性差异”，不是跑分。

---

## 一、定位速查表（最常用的一张表）

| 工具 | 更像哪一层 | 核心设计目标 | 更擅长 | 不擅长 |
| --- | --- | --- | --- | --- |
| webpack | 应用级构建系统 + bundler | 覆盖面广 + 可编程扩展 | 企业级复杂应用、深度产物控制、成熟生态 | 配置心智复杂、Dev 反馈上限（bundle-first） |
| Rollup | bundler（偏库） | 产物干净 + Tree Shaking | 库/SDK/组件库、多格式输出 | 单独做应用开发体验（dev server/HMR 不是主场） |
| esbuild | 构建引擎 | 极致速度 | 预构建、转译、简单 bundling、库/工具打包 | 复杂应用生态与深度产物生命周期控制 |
| Rspack | bundler（偏应用） | 高性能 + 兼容 webpack 生态 | 需要提速的存量应用、迁移成本敏感 | “完全零差异兼容”不现实，生态边界要评估 |
| Rsbuild | 应用级工具 | 开箱即用 + 企业级默认值 | 快速落地工程体系、减少配置轮子 | 对高度特殊化产物策略仍可能需要下潜引擎 |
| Vite | 应用级工具 | Dev 体验极佳（ESM Dev） | 现代 Web 应用、快速反馈、插件生态 | 极复杂 legacy webpack 体系迁移成本、Prod 深度策略仍要理解 bundler |
| Parcel | 应用级工具 | 零配置与自动推断 | 快速原型/中小项目、新手上手 | 深度定制与企业级体系沉淀相对弱 |

---

## 二、从“范式”维度看：为什么 Vite 与 webpack 的体验差这么多

### 2.1 webpack（bundle-first）

- Dev/Prod 都围绕 bundling 模型
- 优点：产物与运行时语义高度一致，可控性强
- 代价：冷启动、增量构建的上限受 bundle 模型影响

### 2.2 Vite（ESM Dev + Bundle Build）

- Dev：按需转换 + 缓存（模块粒度增量）
- Build：交给 bundler 产生产物
- 优点：开发反馈速度极佳
- 代价：需要额外处理第三方依赖（预构建、重写 import 等）

> **关键点**
>
> 你感受到的“快”，主要来自范式变化，而不是“换了一个更快的编译器”。

---

## 三、从“生态”维度看：为什么 webpack 仍然很难被完全替代

webpack 的生态优势通常体现在：

- 历史沉淀（大量 loader/plugin、企业内部定制）
- 复杂资源管线（各种非标准需求都有现成方案）
- 复杂产物策略（微前端、多入口、多 CDN 形态）

这也是 Rspack 这类工具强调“兼容 webpack 生态”的原因。

---

## 四、从“引擎”维度看：esbuild/SWC 解决的到底是什么

esbuild/SWC 这类工具常见的价值是：

- 把“转译/压缩”这类热点环节变快
- 作为平台工具的底层组件（例如依赖预构建、TS/JSX 转换）

但它们通常不会单独解决：

- 应用级的 dev server 体验
- 复杂 chunk/asset 生命周期与产物策略

> **直觉理解**
>
> 引擎让“单次计算更快”，平台让“工程更好用”。两者经常是组合关系。

---

## 五、选型建议（简明但可执行）

### 5.1 新项目

- 默认优先：Vite（现代 Web 应用、反馈快、生态成熟）
- 若你明确需要 webpack 生态能力：Rsbuild/Rspack/webpack

### 5.2 老项目

- 已有大量 webpack loader/plugin：优先评估 Rspack/Rsbuild 的迁移可行性
- 迁移目标明确：先做“收益最大”的环节（缓存/拆包/转译加速），再考虑工具替换

### 5.3 企业级项目

- 优先考虑：生态稳定性、可维护性、团队熟悉度、可观测与发布链路
- 工具组合往往更重要：bundler + 编译器 + 任务编排（monorepo）

### 5.4 库/SDK 开发

- 默认优先：Rollup（产物干净、多格式、tree shaking 友好）
- 简单库/工具：esbuild 也很高效（再配合类型输出）

---

## 参考资料

- [webpack - Concepts](https://webpack.js.org/concepts/)
- [Vite - Why Vite](https://vite.dev/guide/why.html)
- [Rollup - Introduction](https://rollupjs.org/introduction/)
- [esbuild](https://esbuild.github.io/)
- [Rspack](https://rspack.dev/)
- [Rsbuild](https://rsbuild.dev/)
- [Parcel](https://parceljs.org/)
