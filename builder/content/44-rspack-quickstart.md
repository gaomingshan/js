# Rspack 快速上手

## 概述

Rspack 是一个 Rust 实现的 Web Bundler，目标非常明确：

- **尽可能对齐 webpack 5 的配置与生态**（降低迁移成本）
- 在保持“可控产物策略”的前提下，获得更好的构建性能

因此它最常见的真实使用方式是：

- **从 webpack 迁移到 Rspack**（配置与心智成本最小）
- 在大中型项目里替换 bundler 内核，获得构建提速

> **关键点**
>
> 新项目通常更推荐用 **Rsbuild**（更开箱即用）；Rspack 更像“webpack-compatible 的高性能内核”。

---

## 一、适用场景：什么时候该选 Rspack

1. **已有 webpack v5 项目**，希望显著提速但不想重写整套配置。
2. **强依赖 webpack 生态**（loader/plugin/Module Federation 等），又希望提高吞吐。
3. **对产物策略要求很强**（复杂拆包、运行时代码、资产输出结构），需要 bundler-first 的可控性。

不太适合的情况：

- 你想要“尽可能少写配置”的应用开发体验（优先 Rsbuild/Vite）
- 你对 webpack 的历史兼容包袱反而是负担

---

## 二、安装与启动（两条路线）

### 2.1 新项目脚手架（最快）

官方提供 create-rspack：

```bash
npm create rspack@latest
# 或 pnpm/yarn/bun 对应 create 命令
```

### 2.2 在现有项目里手动安装（迁移/改造常用）

从 webpack 迁移时常见做法：

```bash
npm remove webpack webpack-cli webpack-dev-server
npm add -D @rspack/core @rspack/cli
```

如果你原来依赖 webpack-dev-server，对应包是：

- `webpack-dev-server` -> `@rspack/dev-server`

> **说明**
>
> Rspack CLI 对 dev server 有内置支持；在工程里显式安装 `@rspack/dev-server` 的价值在于“版本可控/迁移对齐”。

### 2.3 npm scripts（对齐 webpack 的使用习惯）

Rspack CLI 常用命令：

- `rspack dev`（可简写为 `rspack serve` / `rspack s`）
- `rspack build`
- `rspack preview`（预览 build 产物）

例如：

```json
{
  "scripts": {
    "dev": "rspack dev",
    "build": "rspack build",
    "preview": "rspack preview"
  }
}
```

> **关键点**
>
> `@rspack/cli` 与 `webpack-cli` **不兼容**，不要指望命令行参数完全一致。

---

## 三、从 webpack 迁移：最小改动路径

### 3.1 改文件名与脚本

- `webpack.config.js` -> `rspack.config.js`
- `webpack serve/build` -> `rspack dev/build`

### 3.2 改内置插件引用（webpack -> @rspack/core）

例如 HMR 插件：

```js
// webpack
const webpack = require('webpack');
new webpack.HotModuleReplacementPlugin();

// rspack
const rspack = require('@rspack/core');
new rspack.HotModuleReplacementPlugin();
```

### 3.3 优先“删掉慢的链路”：babel-loader

Rspack 内置 `builtin:swc-loader`，如果你只是为了：

- TS/JSX
- 现代语法

那么通常可以直接移除 `babel-loader`（它往往是大型项目最显著的性能瓶颈之一）。

---

## 四、一个最小可用的 rspack.config.js（示意）

```js
const path = require('path');

/** @type {import('@rspack/core').Configuration} */
module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: path.resolve(__dirname, 'src/index.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/js/[name].[contenthash:8].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript', tsx: true },
            transform: { react: { runtime: 'automatic', refresh: true } },
          },
        },
      },
      // CSS：Rspack 提供内置的 css 类型支持（也可按需使用 css-loader 链路）
      { test: /\.css$/i, type: 'css' },
      { test: /\.module\.css$/i, type: 'css/module' },
      // 静态资源：对齐 webpack 5 asset modules
      { test: /\.(png|jpe?g|gif|svg)$/i, type: 'asset/resource' },
    ],
  },
  devServer: {
    hot: true,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
};
```

> **关键点**
>
> Rspack 的价值不在“你能写出一个配置”，而在于你可以用较小成本把 webpack 项目的热点瓶颈（babel-loader、CSS 链路等）替换掉。

---

## 五、实践建议：迁移落地的顺序

1. **建立基线**：记录 webpack 构建耗时、产物体积、关键页面性能指标。
2. **最小迁移跑通**：先让 Rspack build 出与 webpack 结构接近的产物。
3. **逐步替换慢链路**：优先移除 babel-loader，改用内置 swc-loader。
4. **验证兼容边界**：社区插件/loader 兼容性与差异点尽早暴露。

---

## 参考资料

- [Rspack CLI](https://rspack.rs/api/cli.html)
- [Rspack Quick Start](https://rspack.rs/guide/start/quick-start)
- [Migrate webpack -> Rspack](https://v0.rspack.dev/guide/migration/webpack)
- [Rspack DevServer](https://v0.rspack.dev/guide/features/dev-server)
