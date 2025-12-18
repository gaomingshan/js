# 库 / SDK 开发选型

## 概述

库/SDK 的构建目标与应用完全不同。

应用构建关注“用户怎么更快看到页面”；库构建关注“别人怎么更安全、更高性能地用你的代码”。

因此库构建的核心问题通常是：

- 输出哪些格式（ESM/CJS/UMD）？
- 如何让下游 Tree Shaking 生效？
- 哪些依赖应该 external（peerDependencies）？
- 类型声明如何交付（`.d.ts`）？
- 如何兼容 Node/browser、以及不同 bundler？

---

## 一、库构建的关键指标（你应该先写成需求）

### 1.1 产物格式

- **ESM（推荐）**：给现代 bundler 做 Tree Shaking
- **CJS（通常仍需要）**：兼容 Node.js 与历史生态
- **UMD/IIFE（可选）**：给无需 bundler 的浏览器场景（CDN 直引）

### 1.2 入口设计

- 单入口（简单）
- 多入口/子路径导出（更工程化，例如 `pkg/utils`）

### 1.3 下游优化友好性

- Tree Shaking
- sideEffects 标注
- external/peer deps 处理

---

## 二、为什么 Rollup 常被优先推荐

### 2.1 产物质量与 tree shaking

Rollup 以 ESM 为中心，产物通常更干净、更利于下游优化。

### 2.2 多格式输出路径清晰

Rollup 天然围绕“输出格式”设计，适合库发布。

> **关键点**
>
> 库构建最重要的不是“构建快”，而是“下游更好用、更不容易出错”。

---

## 三、esbuild 在库构建中的位置

esbuild 非常适合：

- 简单库/工具（配置少、构建快）
- CLI 工具（单文件输出、node 平台）
- 作为底层引擎（tsup/unbuild 等）

需要注意：

- 复杂产物策略（多入口、多格式、细粒度 external）时，Rollup 往往更好控

---

## 四、库构建“最容易踩坑”的点

### 4.1 把依赖打进产物（导致重复与版本冲突）

通用原则：

- `peerDependencies`：通常应该 external
- `dependencies`：视情况（小而稳定的可打入，大依赖通常 external）

### 4.2 默认导入互操作问题（CJS/ESM）

如果你同时输出 ESM 与 CJS，最好通过 `package.json` 的 `exports` 条件导出明确区分。

```json
{
  "name": "my-lib",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  }
}
```

> **关键点**
>
> `exports` 不只是“入口声明”，它也是一种“对外 API 面”的约束与治理。

### 4.3 sideEffects 标注

如果你的库是“无副作用模块”，应当标注以帮助下游 tree shaking：

```json
{ "sideEffects": false }
```

但注意：

- 如果你有样式注入、polyfill、全局注册等副作用，误标会导致功能缺失

### 4.4 类型声明交付

常见做法：

- 代码用 bundler 构建
- 类型用 `tsc` 或 dts 工具生成

因为类型系统属于 TypeScript 编译器职责，bundler 并不等价。

---

## 五、选型建议（可执行）

### 5.1 组件库/SDK（面向前端应用消费）

- 默认：Rollup
- 输出：ESM + CJS（必要时 UMD）
- external：peer deps
- `exports`：明确子路径
- `sideEffects`：谨慎标注

### 5.2 小型工具库 / 内部工具

- 默认：esbuild（或基于它的工具）
- 输出：ESM（必要时再补 CJS）

### 5.3 Node.js CLI

- esbuild 很合适（单文件、平台 node）
- 注意：对 Node 版本与 ESM/CJS 运行方式要提前定策略

---

## 参考资料

- [Rollup](https://rollupjs.org/)
- [esbuild](https://esbuild.github.io/)
- [Node.js - package exports](https://nodejs.org/api/packages.html#exports)
- [TypeScript - Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
