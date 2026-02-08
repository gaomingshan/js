# Rollup 核心设计思想

## 概述

Rollup 是一个以 **ESM（ES Modules）为中心** 的打包器。

如果说 webpack 更像“可编程的构建系统”，Rollup 更像“面向产物质量的链接器（linker）”：

- 目标是输出**更干净、更可优化**的 bundle
- 强调基于 ESM 静态结构的 Tree Shaking
- 通过插件体系把“解析/加载/转换”串成一条清晰的管线

---

## 一、ESM-first：静态结构是核心前提

### 1.1 为什么 Rollup 偏爱 ESM

ESM 的 `import/export` 是静态结构，这意味着：

- 依赖图可在执行前确定
- 未使用导出可在构建期删除（Tree Shaking）

```js
// lib.js
export function a() {}
export function b() {}

// main.js
import { a } from './lib.js';
a();
```

Rollup 可以在产物中删除 `b`。

> **关键点**
>
> Rollup 的优化能力很大程度建立在“输入可静态分析”之上。

---

## 二、输出导向：产物干净、格式多样

### 2.1 面向库输出的多格式能力

Rollup 常用于库构建，因为它能输出多种格式：

- `es`（ESM）
- `cjs`（CommonJS）
- `umd` / `iife`（面向浏览器全局）

### 2.2 “输出干净”是什么意思

- 辅助代码（helpers）更少、更集中
- 更少的运行时代码（取决于场景）
- 对“保持模块语义”的场景更友好（例如 `preserveModules`）

> **直觉理解**
>
> Rollup 更像“把模块图连接成产物”，尽量不引入额外框架。

---

## 三、插件管线：把构建拆成可组合的阶段

Rollup 的插件体系很清晰，常见关键钩子包括：

- `resolveId`：把导入 specifier 解析为具体 id
- `load`：加载模块内容
- `transform`：转换模块源码（TS/JSX/宏等）
- `renderChunk` / `generateBundle`：在输出阶段再加工 chunk/assets

> **关键点**
>
> 你可以把 Rollup 理解为：
>
> ```text
> 模块解析 → 模块加载 → 模块转换 → chunk 生成 → 输出加工
> ```

---

## 四、代码分割：基于图的 chunk 生成

Rollup 支持通过动态导入触发代码分割：

```js
// main.js
import('./heavy.js');
```

它会在构建期把模块图切分成多个 chunk，并生成正确的加载关系。

---

## 五、Rollup 的设计取舍

Rollup 的核心关注点是“构建产物”，它本身并不提供完整的应用级开发体验（例如 Dev Server/HMR 体系）。

因此你常见的组合是：

- **应用**：Vite（Dev） + Rollup（Build）
- **库**：Rollup（Build）+ 类型生成（tsc/dts 插件）

---

## 参考资料

- [Rollup - Introduction](https://rollupjs.org/introduction/)
- [Rollup - Plugin Development](https://rollupjs.org/plugin-development/)
- [ESM - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
