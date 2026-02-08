# Vite 架构与设计

## 概述

Vite 常被一句话概括为“开发不打包，生产再打包”，但要真正理解它为什么快、边界在哪里，需要把它拆成三个核心部件：

- **Dev Server（开发范式）**：以浏览器原生 ESM 为基础，按需转换（on-demand transform）
- **依赖预构建（现实折中）**：用 esbuild 把第三方依赖“打粗 + 转成更可分析/可加载的形态”
- **生产构建（产物策略）**：用 Rollup 输出可部署的 bundle（拆包、压缩、hash、manifest…）

> **关键点**
>
> Vite 的“快”主要来自开发阶段的范式变化：把全量 bundling 的成本，拆成按需转换 + 缓存。

---

## 一、Dev 阶段：基于 ESM 的按需加载

### 1.1 浏览器请求驱动的模块加载

```html
<script type="module" src="/src/main.ts"></script>
```

浏览器会递归请求：

```text
/main.ts
  ├─ /App.tsx
  └─ /router.ts
       └─ /pages/Home.tsx
```

Vite dev server 的工作方式更像“编译中间件”：

- 浏览器请求哪个模块，Vite 就转换哪个模块
- 转换结果会被缓存
- 改动发生时，只让受影响的模块失效

> **直觉理解**
>
> webpack dev 的“最小增量”通常是 chunk；Vite dev 的“最小增量”更接近模块（module）。

---

## 二、依赖预构建：为什么 Vite 仍需要 esbuild

### 2.1 解决裸导入（Bare Import）

业务代码里常见：

```js
import React from 'react';
```

浏览器原生 ESM 不知道 `react` 对应哪个 URL。

Vite 的策略（概念上）是：

- 扫描依赖（从入口出发分析）
- 预构建第三方依赖（通常输出到缓存目录）
- 在 dev 阶段把 `react` 这类 specifier 重写成可请求的 URL

### 2.2 解决依赖请求过多与瀑布

很多依赖在 ESM 形态下模块非常碎：

- 直接 ESM 加载会产生大量网络请求
- 依赖层级深时容易形成瀑布

预构建的目标是把依赖“打粗一点”，让浏览器请求数量更可控。

### 2.3 解决 CommonJS 依赖

npm 生态里仍有大量 CJS：

- 浏览器无法直接执行 `require()`
- bundler 做 Tree Shaking 也更困难

Vite 通过预构建把依赖尽量转成更统一的可消费形式（常见是 ESM）。

> **关键点**
>
> Vite 的 No-Bundle 主要针对“业务源码”，而不是“第三方依赖”。

---

## 三、HMR：为什么能快，但也有边界

### 3.1 HMR 的基本模型

- Vite 维护模块依赖关系
- 文件变化后，计算受影响模块
- 推送更新到浏览器，尝试在模块边界内替换

### 3.2 状态能否保留，不只取决于 Vite

以 React 为例：

- “保留组件状态”的能力来自 React Fast Refresh
- Vite 负责把更新推到浏览器，并提供边界信息

因此你会看到：

- 改动组件实现：常可热更新
- 改动模块导出形态：可能触发整页刷新

---

## 四、Build 阶段：为什么生产仍交给 Rollup

生产构建需要解决：

- 拆包（code splitting）与长期缓存
- 产物 hash、manifest、HTML 注入
- 兼容性、压缩、资源优化

这类工作更适合成熟 bundler 的生态与产物控制能力。

Vite 的常见策略：

```text
Dev：ESM + 按需 transform（体验优先）
Build：Rollup bundling（产物优先）
```

> **深入一点**
>
> “同一套插件”能同时影响 dev 与 build，是 Vite 插件体系设计的重点：它尽量让 resolve/transform 的语义在两阶段一致。

---

## 五、Vite 的优势与局限（定位总结）

### 5.1 优势

- 冷启动快、HMR 快
- 插件体系清晰、生态成熟
- 现代工程默认值好（ESM、按需加载、预构建）

### 5.2 局限（你需要提前知道）

- 生产构建能力来自 Rollup（因此复杂产物策略仍要理解 bundler）
- 超大型项目仍需要针对性优化（依赖预构建、缓存、分包策略）
- 对非常依赖 webpack loader/plugin 的存量工程，迁移成本需要评估

---

## 参考资料

- [Vite - Why Vite](https://vite.dev/guide/why.html)
- [Vite - Dep pre-bundling](https://vite.dev/guide/dep-pre-bundling.html)
- [Vite - Plugin API](https://vite.dev/guide/api-plugin)
- [Rollup](https://rollupjs.org/)
