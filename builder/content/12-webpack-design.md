# webpack 核心设计思想

## 概述

webpack 经常被描述为“模块打包工具”，但更准确的理解是：**一个以“模块依赖图”为中心的可编程构建系统**。

理解 webpack 的关键不是记配置，而是把它拆成三层心智模型：

- **依赖图**：从入口出发，把一切资源视为模块
- **转换链**：通过 Loader 把不同资源变成可被纳入图的模块
- **生命周期扩展**：通过 Plugin 介入构建过程，生成最终产物

---

## 一、核心原则：一切皆模块（Everything is a module）

在 webpack 的世界里，JS/CSS/图片都可以成为模块：

```js
import './index.css';
import logoUrl from './logo.png';
```

这背后的价值是：

- 依赖关系从“人为约定”变成“机器可分析的结构”
- 产物可以围绕依赖图做优化：拆包、缓存、去重

---

## 二、依赖图：从 Entry 出发的递归解析

### 2.1 入口与图

```js
module.exports = {
  entry: './src/main.js'
};
```

webpack 会：

- 解析 `main.js` 的依赖
- 递归解析依赖的依赖
- 构建完整的 module graph

```text
main.js
 ├─ App.js
 │   ├─ Button.js
 │   └─ api.js
 └─ styles.css
```

### 2.2 为什么“图”很重要

你能做的很多优化，本质都是“在图上做变换”：

- 把一些模块分到一个 chunk（拆包）
- 删除不可达或未被使用的导出（tree shaking / DCE）
- 把图中的节点转换为目标代码（转译）

---

## 三、Loader：把“非 JS 资源”变成模块

### 3.1 Loader 的职责边界

- 输入：某种资源的源码（字符串/Buffer）
- 输出：JS 模块代码（或可被 webpack 处理的结果）

```js
module.exports = {
  module: {
    rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader'] }]
  }
};
```

> **关键点**
>
> Loader 解决的是“单个模块如何进入依赖图”。它不负责“整个构建过程的协调”。

---

## 四、Plugin：介入生命周期，控制产物形态

### 4.1 Plugin 的定位

Plugin 可以理解为：

- 在构建的各个阶段“插入逻辑”
- 对 chunk、asset、manifest、HTML 注入等做整体控制

例如生成 HTML：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = { plugins: [new HtmlWebpackPlugin()] };
```

### 4.2 为什么 webpack 的生态这么强

因为 webpack 把大量能力开放给了 plugin：

- 拆包策略
- 资源输出
- 缓存与增量构建
- 与框架/平台集成

这使得它能覆盖非常多复杂场景，但代价是：

- 配置与心智复杂度更高
- 性能上限与“可插拔程度”存在 trade-off

---

## 五、Runtime：让 chunk 在浏览器中正确加载

webpack 输出不仅是业务代码，还通常包含运行时代码，用来：

- 管理模块缓存
- 处理动态导入（chunk 映射）
- 处理 publicPath、资源定位

> **深入一点**
>
> 很多“打包后与源码行为不同”的问题，最终都与 runtime 注入有关：例如作用域包装、模块缓存语义、chunk 加载路径。

---

## 六、总结：webpack 的设计目标

- 用统一的模块抽象，覆盖各种资源类型
- 用 loader/plugin 机制提供极强的可扩展性
- 用 bundling 模型产出可部署、可缓存、可拆分的资源

---

## 参考资料

- [webpack - Concepts](https://webpack.js.org/concepts/)
- [webpack - Loaders](https://webpack.js.org/loaders/)
- [webpack - Plugins](https://webpack.js.org/plugins/)
