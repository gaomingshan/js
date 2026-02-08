# esbuild 作为构建引擎

## 概述

在真实工程里，esbuild 最常见的用法不是“直接用它做整个应用构建”，而是作为**高速构建引擎（engine）**被上层工具调用。

你可以把它理解为：

- 负责最耗时、最通用的那段（解析/转译/压缩/简单 bundling）
- 让上层工具（Vite/Rsbuild/自研脚手架）把工程体验与产物策略组装起来

这篇聚焦一个问题：**esbuild 在工程里通常怎么用，为什么这样用是“合理的”**。

---

## 一、esbuild 在工程里的 3 种常见形态

### 1.1 作为 Dev 转译器（Transform Engine）

用于：

- TS/JSX 转译
- 部分语法降级（按 `target`）
- 生成 source map

特点：

- 速度极快，适合“频繁改动、频繁重建”的开发期

> **关键点**
>
> esbuild 的 TS 支持是“语法层转译”，不做类型检查。类型检查应独立跑（`tsc --noEmit`）。

### 1.2 作为依赖预构建器（Pre-bundler）

用于：

- 把第三方依赖打“粗一点”（减少模块请求与依赖瀑布）
- 把 CJS/复杂依赖转成更适合浏览器加载与分析的形态（常见是 ESM）

典型场景：Vite 的依赖预构建。

### 1.3 作为压缩器（Minifier）

用于：

- 生产构建对 JS 做 minify（速度快，通常足够好）

注意：

- 极端兼容/压缩质量需求时再评估 Terser 等

---

## 二、一个可用于生产的“引擎式用法”示例：自建 build 脚本

这里给出一个生产上常见的形态：**用 Node 脚本调用 esbuild 做构建**，用于小型工具/内部项目/构建步骤中的某个环节。

### 2.1 目录结构（示意）

```text
project/
├── src/
│   ├── index.ts
│   └── cli.ts
├── scripts/
│   └── build.mjs
└── package.json
```

### 2.2 build 脚本（示意）

```js
// scripts/build.mjs
import esbuild from 'esbuild';

const isProd = process.env.NODE_ENV === 'production';

await esbuild.build({
  entryPoints: {
    index: 'src/index.ts',
    cli: 'src/cli.ts'
  },
  outdir: 'dist',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: ['node18'],
  sourcemap: true,
  minify: isProd,
  external: ['fs', 'path']
});
```

> **关键点**
>
> 这种“脚本式构建”非常适合工具/库/CLI：构建目标明确、产物形态简单，esbuild 的优势能直接兑现。

---

## 三、为什么 esbuild 更适合做引擎：从职责边界看

### 3.1 引擎层解决的是“计算密集型环节”

- 解析（parse）
- 转换（transform）
- 压缩（minify）

这些环节天然适合优化性能。

### 3.2 平台层解决的是“工程语义与体验”

例如：

- Dev Server/HMR
- HTML 入口处理
- 复杂的 chunk/runtime/asset 输出策略
- 插件生态治理、默认值、框架集成

这也是为什么你会看到：

- Vite 负责体验
- esbuild 负责热点性能

---

## 四、在 Vite 里如何体现“esbuild 是引擎”

你会在 Vite 的工作流里看到典型分工：

- Dev：按需 transform + 模块缓存（其中常用 esbuild 做高速转换）
- Dep pre-bundling：用 esbuild 把依赖预构建并缓存
- Build：产物交给 bundler（通常 Rollup），minify 可能仍用 esbuild

> **直觉理解**
>
> Vite 的核心创新在范式（开发期 ESM）；esbuild 的核心价值在把“热点计算”做到极快。

---

## 五、实践建议

1. **把类型检查独立出来**：`tsc --noEmit`。
2. **把引擎放在热点环节**：转译、压缩、预构建。
3. **不要用引擎替代平台**：当你需要复杂产物策略与生态时，应该选择 Vite/Rsbuild/webpack 这类平台。

---

## 参考资料

- [esbuild](https://esbuild.github.io/)
- [Vite - Dep pre-bundling](https://vite.dev/guide/dep-pre-bundling.html)
- [TypeScript - `tsc --noEmit`](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
