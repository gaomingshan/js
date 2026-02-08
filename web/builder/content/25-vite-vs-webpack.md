# Vite vs webpack 深度对比

## 概述

Vite 与 webpack 的差异，本质是两种构建范式的差异：

- Vite：**ESM Dev + Bundle Build**（开发阶段尽量按需转换；生产阶段再打包）
- webpack：**Bundle-first**（开发与生产都围绕 bundling 模型）

所以对比时最有价值的不是“谁更快”，而是理解：

- 为什么它们的 Dev 体验差异这么大
- 为什么它们的产物控制能力与迁移成本差异这么大
- 你的项目到底更需要哪一种 trade-off

---

## 一、核心路线：Dev/Build 的工作模型不同

### 1.1 Vite：请求驱动的按需转换

```text
浏览器请求某个模块
  ↓
Vite dev server resolve + transform
  ↓
返回 JS（并缓存）
```

特征：

- 冷启动更快（不必先构建完整 bundle）
- 更新粒度更细（通常是模块级）

### 1.2 webpack：构建驱动的 bundle 输出

```text
启动 dev
  ↓
构建模块图 + 生成 chunk（常在内存）
  ↓
浏览器加载 bundle/chunk
```

特征：

- Dev/Prod 语义更一致（都在 chunk/runtime 体系里）
- 适配复杂生态更自然（loader/plugin 能深度介入）

> **关键点**
>
> 你在 Vite 里感受到的“快”，主要来自“把全量 bundling 变成按需 transform + 缓存”。

---

## 二、开发体验：冷启动、热更新与问题定位

### 2.1 冷启动

- Vite：启动时更像“起服务 + 建缓存”，业务源码不需要先打包
- webpack：启动时要构建依赖图并生成可运行产物（项目越大启动越慢）

### 2.2 HMR（热更新）

- Vite：模块边界更贴近源码，HMR 通常更快
- webpack：依赖 HMR runtime 与 chunk 映射，更新链路更复杂

> **深入一点**
>
> “HMR 能否保留状态”并不是 bundler 单方面决定的，常与框架运行时（如 React Fast Refresh）共同作用。

### 2.3 调试与 Source Map

两者都能提供 source map，但差异在：

- Vite dev：更接近“源码级模块”的映射
- webpack dev：更多时候是“bundle/chunk 到源码”的映射

在复杂 loader 链下，webpack 的 source map 质量取决于 loader 是否正确传递 map。

---

## 三、依赖处理：为什么 Vite 需要预构建

### 3.1 裸导入与浏览器约束

```js
import React from 'react';
```

浏览器原生 ESM 默认不解析 `react` 这种裸导入。

- Vite：通常通过“依赖预构建 + import 重写”让它可用
- webpack：在 bundle 阶段把依赖纳入模块图，并在产物里解决

### 3.2 CJS 依赖

npm 生态里仍有大量 CJS。

- Vite：常把依赖转换为更易消费的形态（常见是 ESM）
- webpack：天然能在 bundling 过程中处理多种模块形态

> **关键点**
>
> Vite 的 No-Bundle 主要是针对“业务源码”，而不是“第三方依赖”。

---

## 四、扩展体系：Vite 插件 vs webpack Loader/Plugin

### 4.1 webpack：Loader + Plugin（高度可编程）

- Loader：单模块资源进入依赖图的转换
- Plugin：介入构建生命周期，控制 chunk/asset/runtime

适合：

- 深度定制产物策略
- 复杂历史资源管线

代价：

- 体系复杂
- 插件/loader 组合需要更强工程经验

### 4.2 Vite：插件体系（更偏“开发体验 + 现代 ESM”）

- 以 dev server 的 resolve/transform 为中心
- 生产构建阶段通常与 Rollup 插件语义相近

适合：

- 现代应用开发
- 以模块转换、按需加载、框架集成为主的需求

> **提示**
>
> 生态对比往往不是“插件数量”，而是“你所在的项目是否依赖某类插件的不可替代能力”。

---

## 五、生产构建：产物控制与长期缓存

### 5.1 生产目标一致，但路径不同

两者最终都要解决：

- 代码分割（`import()`）
- 长期缓存（content hash、vendor 拆分）
- 压缩与死代码消除

差异在于“默认策略与可调深度”：

- webpack：产物策略可调范围更大，但要付出配置成本
- Vite：默认策略更现代与简化，但极端场景可能需要更理解底层 bundler

### 5.2 “Vite build 用 Rollup”意味着什么

这意味着：

- 产物质量与 tree shaking 很大程度受 Rollup 体系影响
- 许多“生产构建问题”最终要落到 bundler（Rollup）层分析

---

## 六、选型建议（可执行）

### 6.1 更偏向选 Vite

- 新项目、现代浏览器为主
- 团队更看重 Dev 反馈速度与配置简化
- 架构更接近现代 ESM/组件化

### 6.2 更偏向选 webpack

- 存量 webpack 生态依赖很重（大量 loader/plugin）
- 企业级复杂产物策略（多入口、微前端、严格输出形态）
- 需要最大程度的可控性与成熟方案

> **建议**
>
> 不要用“跑分”做最终决定。优先用：
>
> - 迁移成本
> - 生态依赖
> - 产物策略复杂度
> - 团队掌控能力
>
> 来做权衡。

---

## 参考资料

- [Vite - Why Vite](https://vite.dev/guide/why.html)
- [Vite - Build](https://vite.dev/guide/build.html)
- [webpack - Concepts](https://webpack.js.org/concepts/)
- [webpack - Code Splitting](https://webpack.js.org/guides/code-splitting/)
