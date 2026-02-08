# 零基础入门建议

## 概述

“构建工具”之所以让新手头大，往往不是概念难，而是信息源太分散：

- webpack/Vite/Rollup/esbuild 看起来都在“打包”
- 但它们解决的问题层级不同（平台/引擎/产物）
- 你一旦从“抄配置”开始，很快就会失去整体方向

这篇给你一条更稳的路线：**先建立最小心智模型，再学习工具，再回到工程实践**。

---

## 一、第一原则：不要从配置开始

### 1.1 先学“构建在做什么”

你需要先能用一句话解释构建：

- 从入口出发，构建模块依赖图
- 对模块做解析/转译（TS/JSX/兼容性）
- 决定如何交付（拆包、压缩、hash、资源输出）

```text
source -> resolve -> transform -> bundle/chunk -> optimize -> output
```

> **关键点**
>
> 你真正要掌握的是“流程与边界”，而不是某个工具的某个配置项。

### 1.2 先分清 Dev 与 Build

- Dev：追求反馈速度与可调试（HMR、sourcemap、按需 transform）
- Build：追求产物质量（体积、缓存、拆包策略、兼容性）

很多认知混乱来自把这两阶段混为一谈。

---

## 二、阶段 1：把模块化与模块解析学清楚（1~2 天）

你至少要理解：

- ESM vs CommonJS 的加载模型差异
- 静态结构为何影响 tree shaking（`import` 可静态分析）
- Node/打包器如何做模块解析（`package.json` 的 `exports`/`module`/`main`）

练习目标：

- 能解释“为什么某些包摇不掉”
- 能解释“为什么同一个包在不同环境导入路径不同”

---

## 三、阶段 2：用一个平台工具把应用跑起来（2~3 天）

推荐从 **Vite 或 Rsbuild** 这种平台工具入手：

- 你会快速获得完整的开发体验（dev server/HMR/build/preview）
- 你能把精力放在“理解范式”而不是“组装链路”

练习目标：

- 看懂 `vite.config.ts` / `rsbuild.config.ts` 的核心字段（alias、proxy、env、build output）
- 明白“依赖预构建”是什么、为什么第一次启动慢、之后会快

---

## 四、阶段 3：补齐生产构建与产物策略（3~5 天）

你需要把“产物交付”这件事学清楚：

- chunk 拆分（路由级、组件级）
- long-term cache（`contenthash`、runtime 分离、稳定 vendor）
- sourcemap（定位 vs 泄露风险）
- publicPath/base（资源路径与部署契约）

练习目标：

- 看到产物结构就能判断：缓存策略是否稳定、拆包是否合理

---

## 五、阶段 4：什么时候开始学 webpack（以及学到什么程度）

webpack 值得学的原因很现实：

- 企业里大量存量项目仍基于它
- 它的“可编程构建平台”思想能帮你理解很多工具的共性

建议的学习边界：

- **必须掌握**：模块图、Loader vs Plugin、Compilation 生命周期、splitChunks/caching
- **不必背诵**：所有 loader/plugin 的具体配置

> **关键点**
>
> 你学 webpack 的目标不是“写出花哨配置”，而是能维护一个真实项目：定位构建慢、产物大、chunk 404、HMR 异常等问题。

---

## 六、阶段 5：最后再回头学“引擎与库构建”（按需）

- esbuild/SWC：理解它们在工具链中的位置（转译/预构建/压缩）
- Rollup：如果你要做库/SDK/组件库，建议更深入

练习目标：

- 能回答“为什么真实项目是组合使用”
- 能按职责分层做选型（平台/引擎/产物）

---

## 参考资料

- [Vite](https://vite.dev/)
- [Rsbuild](https://v0.rsbuild.dev/)
- [webpack Guides](https://webpack.js.org/guides/)
- [Rollup](https://rollupjs.org/)
- [esbuild](https://esbuild.github.io/)
- [Node.js - Packages](https://nodejs.org/api/packages.html)
