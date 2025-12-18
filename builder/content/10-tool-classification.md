# 构建工具分类体系

## 概述

“构建工具”这个词覆盖范围很大：从一个只做转译的编译器（Babel/SWC），到一个完整的应用开发平台（Vite/Rsbuild），都可能被称为构建工具。

为了不被名词淹没，你需要一套分类方式，把工具放到正确位置：

- 先按**职责**分类（它主要做什么）
- 再按**范式**分类（Dev/Prod 的基本路线）
- 最后按**使用场景**分类（应用 vs 库）

---

## 一、按职责分类：你到底在解决哪类问题

### 1.1 Bundler（打包器）

核心能力：把模块依赖图组织成可部署产物（chunk/asset）。

典型：

- webpack
- Rollup
- Rspack

### 1.2 Transformer / Compiler（转译器/编译器）

核心能力：把源码形态转换为另一种形态（TS/JSX/新语法/CSS）。

典型：

- Babel（生态强，速度相对慢）
- SWC（Rust，速度快）
- esbuild（Go，速度快，覆盖面更“工程导向”）

> **关键点**
>
> 转译器解决“单文件/单模块怎么变”，Bundler 解决“整张图怎么组织”。二者经常组合使用。

### 1.3 Dev Server（开发服务器）

核心能力：提供开发期的加载、按需转换、HMR、错误覆盖层、代理等能力。

典型：

- Vite dev server
- webpack-dev-server
- Rsbuild dev server

### 1.4 App-level Tool（应用级构建工具/平台）

核心能力：把多种底层能力组合成“开箱即用的工程体验”。

典型：

- Vite
- Rsbuild
- Parcel

---

## 二、按范式分类：开发/生产的“基本路线”

### 2.1 Bundle-first（以打包为中心）

开发与生产都围绕 bundling 模型运转：

- Dev：先构建（或增量构建）bundle，再交给浏览器
- Prod：输出多 chunk + runtime + manifest

典型：

- webpack
- Rspack（整体路线接近 webpack，但更快）

### 2.2 ESM Dev + Bundle Build（开发基于 ESM，生产打包）

- Dev：尽量基于原生 ESM 按需加载 + 按需 transform
- Prod：由 bundler 输出可部署产物

典型：

- Vite（Dev 常用 esbuild 负责转译与依赖预构建；Build 常用 Rollup 负责 bundling）

> **直觉理解**
>
> 这是“把开发期的全量构建”降级为“按需转换 + 缓存”，所以反馈更快。

---

## 三、按使用场景分类：应用 vs 库

### 3.1 应用（App）构建：更关心“工程体验与产物策略”

关注点：

- Dev Server/HMR 是否顺畅
- 代码分割与路由懒加载
- 资源处理（CSS、图片、字体）
- 多环境、部署路径、产物清单

典型：Vite、webpack、Rsbuild、Parcel

### 3.2 库（Library/SDK）构建：更关心“输出格式与可被下游优化”

关注点：

- 输出多格式（ESM/CJS/UMD）
- 类型声明（`.d.ts`）
- Tree Shaking 友好（尽量输出 ESM）
- External 处理（不要把 peer deps 打进产物）

典型：Rollup（强势）、esbuild（简单场景很高效）、webpack（也能做但更重）

---

## 四、一张“工具地图”（把名字放回正确位置）

```text
               应用级工具（体验/默认值）
      ┌─────────────────────────────────┐
      │  Vite         Rsbuild      Parcel│
      └───────────────┬─────────────────┘
                      │ 组合
            构建引擎/底层能力（性能/能力边界）
      ┌───────────────┴─────────────────┐
      │  Rollup   webpack/Rspack   esbuild│
      └───────────────┬─────────────────┘
                      │ 依赖
              转译/压缩等组件（可替换）
      ┌───────────────┴─────────────────┐
      │   Babel        SWC        Terser │
      └─────────────────────────────────┘
```

> **关键点**
>
> 很多争论（“谁替代谁”）是把不同层的工具放到同一层比较了。

---

## 参考资料

- [webpack - Concepts](https://webpack.js.org/concepts/)
- [Vite - Why Vite](https://vite.dev/guide/why.html)
- [Rollup - Introduction](https://rollupjs.org/introduction/)
- [esbuild](https://esbuild.github.io/)
