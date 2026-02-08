# 学习资源推荐

## 概述

构建工具的资源非常多，但有效学习需要“分层选材”：

- 先学机制（模块、解析、产物）
- 再学平台工具（Vite/Rsbuild）与存量平台（webpack）
- 最后按需深入库构建与引擎（Rollup/esbuild/SWC）

这篇按“用途”而不是“热度”整理资源，便于你在不同阶段快速找到合适材料。

---

## 一、官方文档（优先级最高）

- **Vite**
  - https://vite.dev/

- **webpack**
  - https://webpack.js.org/

- **Rollup**
  - https://rollupjs.org/

- **esbuild**
  - https://esbuild.github.io/

- **Rspack**
  - https://rspack.rs/

- **Rsbuild**
  - https://v0.rsbuild.dev/

> **关键点**
>
> 优先看官方的“Guide / Concepts / Migration”，少走弯路。

---

## 二、标准与底层机制（看懂“为什么”）

- **ECMAScript Modules（规范）**
  - https://tc39.es/ecma262/#sec-modules

- **WHATWG HTML（理解浏览器与模块加载边界）**
  - https://html.spec.whatwg.org/

- **Node.js Packages（exports/conditions）**
  - https://nodejs.org/api/packages.html

这些资源帮助你解决“工具差异的根因”：

- 为什么同一个包在不同环境入口不同
- 为什么 tree shaking 有上限
- 为什么 CJS/ESM 互操作这么麻烦

---

## 三、源码与仓库（适合做深入）

- Vite： https://github.com/vitejs/vite
- webpack： https://github.com/webpack/webpack
- Rollup： https://github.com/rollup/rollup
- esbuild： https://github.com/evanw/esbuild
- Rspack： https://github.com/web-infra-dev/rspack

建议的阅读方式：

- 从 CLI 入口跟一条 dev/build 路径
- 重点看：resolve、transform、module graph、chunk/output

---

## 四、推荐的“工程视角”阅读

- webpack 官方 Guides（Caching/Code Splitting/Tree Shaking）
  - https://webpack.js.org/guides/

- Vite Guide（尤其是 dep pre-bundling 与 plugins）
  - https://vite.dev/guide/

- Rollup 文档（Output/Plugins/Tree-shaking）
  - https://rollupjs.org/

> **提示**
>
> 与其找“某某最佳实践”，不如直接看官方对“为什么这样设计”的解释。

---

## 五、学习路线建议（如何用这些资源）

1. **先读 Node Packages + ESM 规范相关部分**（建立解析与模块基础）
2. **选一个平台工具（Vite 或 Rsbuild）**：按 Guide 做一遍完整应用链路
3. **补齐 webpack**：重点学模块图、Loader/Plugin、缓存与拆包
4. **按需深入 Rollup/esbuild**：对应库构建与引擎层理解

---

## 参考资料

- [Node.js - Packages](https://nodejs.org/api/packages.html)
- [ECMAScript Modules](https://tc39.es/ecma262/#sec-modules)
- [Vite](https://vite.dev/)
- [webpack](https://webpack.js.org/)
- [Rspack](https://rspack.rs/)
- [Rsbuild](https://v0.rsbuild.dev/)
