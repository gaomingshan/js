# esbuild 在工具链中的位置

## 概述

esbuild 的正确打开方式不是“我用 esbuild 还是用 Vite/webpack”，而是理解它在工程里经常扮演的角色：

- **高性能 Transform/Minify 引擎**：把 TS/JSX/现代语法转成目标 JS，并快速压缩
- **依赖预构建器**：把第三方依赖（尤其是 CJS/碎片化 ESM）转换/合并成更适合 Dev 的形态
- **轻量 Bundler**：在库/工具/CLI 这类场景下直接完成 bundling

> **关键点**
>
> esbuild 更像“构建引擎”，经常被上层工具调用，而不是替代上层工具。

---

## 一、为什么 Vite 会用 esbuild（而不是全都用 Rollup）

### 1.1 两个阶段、两个目标

- Dev：追求**反馈速度**（启动快、HMR 快）
- Build：追求**产物质量与可控性**（拆包、缓存、输出策略）

因此常见组合是：

```text
Dev：Vite dev server
  ├─ transform：esbuild（快）
  └─ optimize deps：esbuild（预构建依赖）

Build：Vite build
  ├─ bundling：Rollup（产物能力强）
  └─ minify：常用 esbuild（快，默认足够好）
```

### 1.2 esbuild 在 Dev 里做的事

- **把 TS/JSX 快速转成浏览器可执行的 JS**
- **把依赖打“粗”**：减少请求数与依赖瀑布
- **把 CJS 依赖转成更易被浏览器消费的形态**（常见是 ESM）

> **直觉理解**
>
> Dev 阶段的瓶颈往往在“反复的解析/转译/重启”，esbuild 专门把这段做到极快。

---

## 二、esbuild 的“强项”适合放在哪些环节

### 2.1 Transform（TS/JSX/语法转换）

适合：

- 日常开发转译
- CI 的快速转译

注意：

- esbuild 不做 TypeScript 类型检查（通常要配合 `tsc --noEmit`）

### 2.2 Minify（压缩）

适合：

- 大多数应用的生产压缩（速度快，效果通常足够）

需要评估：

- 极端兼容性/压缩质量要求时，可能仍会用 Terser 等（看团队策略）

### 2.3 依赖预构建（Pre-bundling）

适合：

- Dev 阶段把依赖“稳定化 + 可缓存化”

你会在 Vite 的依赖预构建、以及很多脚手架/内部工具里看到它。

---

## 三、为什么 esbuild 不常被当作大型应用的唯一 bundler

### 3.1 大型应用更像“产物策略工程”

除了“能把代码打出来”，你还需要：

- 复杂拆包策略（长期缓存、vendor 策略、runtime 组织）
- 复杂资源输出形态（多入口、多 HTML、微前端）
- 深度生态（历史 loader/plugin）

这些更接近 webpack/Rspack 这类 bundler 的优势区。

### 3.2 插件与生命周期控制边界

esbuild 的扩展点更轻量，适合做“工程拦截”，但不擅长成为“高度可编程的构建系统”。

> **关键点**
>
> esbuild 能在“热点环节”带来巨大性能收益，但“平台化能力”通常来自上层工具。

---

## 四、工程选型建议（把 esbuild 放到正确位置）

1. **你要做现代 Web 应用**：优先选 Vite/Rsbuild/webpack 等应用级工具，esbuild 作为底层加速器。
2. **你要做库/CLI/工具**：可直接用 esbuild（或基于它的工具如 tsup）做构建。
3. **你要优化存量构建速度**：优先把 esbuild/SWC 放到“转译/压缩/预构建”这些热点环节，而不是一上来换全套平台。

---

## 参考资料

- [esbuild](https://esbuild.github.io/)
- [Vite - Dep pre-bundling](https://vite.dev/guide/dep-pre-bundling.html)
- [Vite - Build options](https://vite.dev/guide/build.html)
