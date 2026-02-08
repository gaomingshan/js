# Dev Server 的不同实现方式

## 概述

Dev Server 的目标从来不只是“起一个静态服务器”，而是提供一套开发期的编译与调试体验：

- 模块解析（resolve）
- 源码转换（transform：TS/JSX/CSS）
- HMR（热更新）
- Source Map
- 代理、错误覆盖层等工程能力

主流实现方式可以抽象为两类：

- **打包式（bundle-first）Dev Server**：先产出 bundle/chunk，再交给浏览器
- **转译式（transform-on-demand）Dev Server**：浏览器按 ESM 请求模块，服务端按需转换

---

## 一、打包式 Dev Server（bundle-first）

### 1.1 工作流程（宏观）

```text
启动
  解析配置 → 构建模块图 → 生成 bundle/chunk（通常写入内存）

浏览器访问
  返回 HTML + bundle

文件变更
  增量构建（重新生成受影响 chunk）
  ↓
  通过 HMR runtime 推送更新
```

典型：webpack-dev-server（以及同范式的 bundler dev）。

### 1.2 优势

- 运行期语义与生产更接近（都围绕 chunk/runtime）
- 对复杂资源管线与历史生态更友好（loader/plugin）
- 产物与拆包策略可一致验证（Dev/Prod 差异相对更小）

### 1.3 局限

- 冷启动成本高（需要先形成可运行 bundle）
- 大项目增量构建上限受制于 bundling 模型

> **关键点**
>
> 打包式 Dev Server 的“最小增量单位”常常接近 chunk；chunk 越大，更新影响面越大。

---

## 二、转译式 Dev Server（transform-on-demand）

### 2.1 工作流程（宏观）

```text
启动
  起服务 + 建立 transform 缓存

浏览器请求 /src/main.ts
  ↓
dev server: transform(main.ts) → 返回 JS

浏览器继续请求依赖模块
  ↓
dev server: 对每个模块按需 transform

文件变更
  失效相关模块缓存 + 推送 HMR 更新
```

典型：Vite dev server。

### 2.2 优势

- 冷启动快（不必先做全量 bundling）
- 更新粒度更细（模块级）
- HMR 通常更快、更稳定（依赖边界更清晰）

### 2.3 现实折中：依赖预构建

转译式 Dev Server 仍要解决：

- 裸导入（`import react from 'react'`）
- 第三方依赖模块过碎导致请求爆炸
- CJS 依赖无法直接被浏览器加载

因此通常会：

- 预构建依赖（把依赖打粗、转成更可加载形态）
- 重写 import specifier

> **直觉理解**
>
> 转译式 Dev Server 并不是“完全不打包”，它更像“不对业务源码做整体打包”。

---

## 三、HMR 的差异：不是“有没有”，而是“边界如何表达”

### 3.1 打包式 HMR

- 需要 runtime 维护模块映射与 chunk 关系
- 更新通常要在 bundle/runtime 体系里完成

### 3.2 转译式 HMR

- 以模块为中心（更贴近源码依赖边界）
- 更容易做到“只更新受影响模块”

但注意：

- 状态保留能力还取决于框架运行时（如 React Fast Refresh）

---

## 四、如何选择：看你的约束与目标

### 4.1 你更应该选打包式 Dev Server，如果

- 你依赖大量 webpack loader/plugin
- 你需要 Dev/Prod 行为尽可能一致
- 你项目非常复杂且需要深度产物控制

### 4.2 你更应该选转译式 Dev Server，如果

- 你更在乎开发反馈速度
- 你面向现代浏览器
- 你希望减少构建配置复杂度

---

## 参考资料

- [Vite - Why Vite](https://vite.dev/guide/why.html)
- [webpack-dev-server](https://webpack.js.org/configuration/dev-server/)
- [MDN - JavaScript modules](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
