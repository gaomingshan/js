# 各层的职责与关系

## 概述

把构建工具按“范式 / 引擎 / 应用级工具”分层之后，下一步是理解：**每一层到底负责什么，以及它们如何协作**。

这能帮你回答一些很实际的问题：

- 为什么 Vite 会同时提到 esbuild 和 Rollup？
- 为什么换了编译器（Babel → SWC）开发变快了，但产物体积不一定变小？
- 为什么某些插件只能在某些工具上用？

---

## 一、构建范式：定义“路线图”与取舍

构建范式决定的是宏观设计：

- Dev 阶段：以 bundling 为中心还是以 ESM 按需加载为中心？
- Prod 阶段：产物是单 bundle、多 chunk，还是保留 ESM？
- 优化策略：更偏“长期缓存 + 拆包”，还是偏“简单直接”？

常见范式（概念层）：

- **Bundle-first**：Dev/Prod 都基于 bundling（webpack 传统路线）
- **ESM Dev + Bundle Build**：Dev 用原生 ESM 体验，Prod 输出 bundle（Vite 典型路线）
- **SSR/SSG 驱动**：构建与渲染强绑定（Next.js/Nuxt 等框架体系）

> **关键点**
>
> 范式本身不等于某个工具，但它决定了工具的很多“看似规定”的行为。

---

## 二、构建引擎：提供可组合的底层能力

引擎层通常提供这些“编译器级能力”：

- **resolve**：把导入路径解析到具体文件
- **transform**：把源码转成目标形态（TS/JSX/CSS 等）
- **bundle/chunk**：把模块图组织成产物结构
- **optimize/minify**：删死代码、压缩、去重

不同引擎的差异往往在：

- 速度（解析/编译/压缩性能）
- 可扩展性（插件 API、可插拔程度）
- 生态兼容（loader/plugin 体系）

> **深入一点**
>
> “引擎”决定的是能力边界与性能上限；应用级工具决定的是“怎么让你舒服地用”。

---

## 三、应用级构建工具：把能力变成工程体验

应用级工具通常负责：

- 提供 CLI 与默认配置（减少决策成本）
- Dev Server / HMR / 错误覆盖层
- 环境变量、HTML 模板、静态资源目录约定
- 插件体系（把项目需求接入引擎能力）
- 与框架生态的集成（React/Vue/Svelte）

典型例子：

- Vite：非常重视 Dev 体验与插件生态
- Rsbuild：把企业级常用默认值、最佳实践“打包进工具”

---

## 四、层与层如何协作：用 Vite 做一张“协作图”

```text
        Dev 阶段
浏览器(原生 ESM)
  ↕ 请求模块
Vite Dev Server
  ├─ resolve: 路径解析/别名/裸导入处理
  ├─ transform: 常用 esbuild + 插件链
  └─ HMR: 推送更新边界

        Build 阶段
Vite build
  └─ bundler: 通常基于 Rollup 做 chunk/asset 输出
```

你会看到：

- “范式”告诉 Vite：Dev 走 ESM，Build 走 bundle
- “引擎”告诉 Vite：转译用谁、bundling 用谁
- “应用级工具”负责把这些能力组合成统一体验

---

## 五、如何用分层模型定位问题

### 5.1 解析失败（Resolve）

- 表现：找不到模块、裸导入不工作、条件导出解析错误
- 关注：别名、`package.json` 的 `exports`、路径后缀、monorepo 边界

### 5.2 转译失败（Transform）

- 表现：TS/JSX 报错、装饰器/语法插件问题、CSS 处理异常
- 关注：Babel/SWC/esbuild 的语法支持与插件链

### 5.3 产物行为异常（Bundle/Runtime）

- 表现：动态导入 chunk 404、publicPath 错、代码分割结果异常
- 关注：chunk 命名、base/publicPath、runtime 注入

> **关键点**
>
> 越能准确定位层级，你越不需要“盲改配置”。

---

## 参考资料

- [Vite - Plugin API](https://vite.dev/guide/api-plugin)
- [Rollup - Plugin Development](https://rollupjs.org/plugin-development/)
- [webpack - Configuration](https://webpack.js.org/configuration/)
