# 构建工具分层理解

## 概述

初学者常把构建工具理解成“我用的是 Vite / webpack”，但在真实工程里，一个“看起来只有一个命令”的工具，通常由多层组件拼出来。

理解分层的好处是：

- 你能知道“问题应该去哪一层找”（解析？转译？打包？Dev Server？）
- 你能理解为什么工具经常是“组合使用”而不是互相替代
- 你能在选型时看清：你选择的不只是一个 CLI，而是一整套范式与引擎组合

---

## 一、分层模型：三层就够用

### 1.1 构建范式（Build Paradigm）

决定“开发/生产”两阶段的基本路线：

- Dev 是否基于 ESM 按需加载？
- Prod 是否做 bundling？拆包策略是什么？
- 以应用为中心还是以库为中心？

### 1.2 构建引擎（Build Engine）

提供底层能力的“发动机”，典型能力：

- 解析（resolve）
- 转换（transform：TS/JSX/CSS…）
- 打包（bundle/chunk）
- 压缩（minify）

常见引擎/能力组件：

- 转译：Babel、SWC、esbuild
- 打包：webpack、Rollup、Rspack
- 压缩：Terser、esbuild minify、cssnano

### 1.3 应用级构建工具（App-level Tool）

面向“项目落地”的工具层：

- Dev Server / HMR
- 默认约定与最佳实践
- 插件体系、配置体验、脚手架
- 与框架生态集成（React/Vue/Svelte…）

典型：Vite、Rsbuild、Parcel、webpack CLI（很多团队也把 webpack 作为应用级工具使用）。

---

## 二、一张图建立直觉

```text
[构建范式]
  定义：开发/生产的基本路线与取舍
        ↓
[构建引擎]
  提供：resolve/transform/bundle/minify 等底层能力
        ↓
[应用级工具]
  负责：把能力组装成可用的工程体验（dev server、配置、插件、默认值）
```

> **关键点**
>
> 你在项目里“看到的工具”，往往是最上层；但真正决定能力边界与性能上限的，常常是底层引擎与范式。

---

## 三、用真实工具举例（把分层落到名字上）

### 3.1 Vite

- 范式：Dev 用原生 ESM 的按需加载体验；Prod 产出 bundle
- 引擎：开发时常用 esbuild 做转译/依赖预构建；生产用 Rollup 做 bundling
- 应用级：Vite 本身提供 dev server、插件体系、约定与配置入口

### 3.2 webpack

- 范式：bundle-first（开发与生产都围绕 bundling 模型）
- 引擎：webpack 自身（解析、构建依赖图、chunk、runtime）
- 应用级：webpack CLI/devServer + 大量生态 plugin/loader

### 3.3 Rsbuild / Rspack

- 范式：通常仍是 bundle-first（但强调更快的构建与更现代的默认值）
- 引擎：Rspack（Rust 实现的 bundler）
- 应用级：Rsbuild 提供开箱即用、工程化默认值、框架集成

---

## 四、你应该如何利用这个分层模型

1. **学概念先学范式**：先弄清 ESM Dev 与 Bundle Prod 的差异。
2. **遇到问题先定位层级**：解析失败？转译失败？还是 chunk/runtime 行为？
3. **选型时看“组合”**：例如某工具是否易于替换引擎、插件生态是否匹配。

---

## 参考资料

- [webpack - Concepts](https://webpack.js.org/concepts/)
- [Vite - Guide](https://vite.dev/guide/)
- [Rsbuild](https://rsbuild.dev/)
