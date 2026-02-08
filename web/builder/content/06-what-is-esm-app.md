# 什么是 ESM 应用（No-Bundle）

## 概述

“ESM 应用 / No-Bundle”通常指一种开发范式：**开发阶段尽量不对应用代码做整体打包，而是让浏览器用原生 ESM 机制按需加载模块**。

它常与 Vite 这类工具绑定在一起，但要避免一个误解：

> **No-Bundle ≠ 不构建**
>
> 多数 No-Bundle 工具仍会对源码做按需转译、对依赖做预构建。

---

## 一、浏览器原生 ESM 提供了什么能力

### 1.1 `type="module"`

```html
<script type="module" src="/src/main.js"></script>
```

浏览器会：

- 把 `import` 当作模块依赖
- 递归请求依赖模块
- 对模块做缓存（同一 URL 只执行一次）

### 1.2 原生 ESM 的约束

- 需要明确路径（浏览器默认不识别裸导入 `react`）
- 跨域受 CORS 限制
- 模块天然严格模式

---

## 二、为什么 No-Bundle Dev 往往更快

### 2.1 “不打大包”的核心收益

传统 bundle-first 的开发模式：

- 每次启动 dev server 先产出一个（或多个）bundle
- 修改后要重新打包再交给浏览器

No-Bundle Dev 的典型模式：

- 浏览器请求哪个模块，dev server 就按需转换哪个模块
- 修改一个文件，通常只影响该模块及其少量关联模块

```text
浏览器请求 /src/main.ts
  ↓
dev server: transform(main.ts) -> 返回 JS
  ↓
main.ts import './App.tsx'
  ↓
浏览器请求 /src/App.tsx
  ↓
dev server: transform(App.tsx) -> 返回 JS
```

> **关键点**
>
> 快的本质来自“增量粒度更细”：把“全量构建”降级为“按需转换 + 缓存”。

---

## 三、现实世界：为什么依赖仍常被“预构建”

### 3.1 裸导入问题

应用代码里常见：

```js
import React from 'react';
```

浏览器不认识 `react` 该去哪找。

解决路径一般有两种：

- Import Maps（浏览器方案）
- Dev Server 重写 import + 预构建依赖（工具方案，Vite 常用）

### 3.2 依赖预构建的动机

- 把大量 CJS 依赖转换为 ESM，便于浏览器加载与工具分析
- 把依赖“打粗一点”，减少请求数量与瀑布
- 提升冷启动与 HMR 速度（依赖相对稳定，可长期缓存）

> **直觉理解**
>
> No-Bundle 通常只是不对“你的业务源码”做整体 bundling；但对第三方依赖，工具往往仍会做某种形式的打包/合并。

---

## 四、生产环境为什么通常还是 Bundle

生产环境的目标与开发不同：

- 更少请求、更稳定缓存
- 更好的代码分割与预加载
- 更彻底的 tree shaking 与压缩
- 生成可部署资产（hash、manifest、HTML 注入）

因此像 Vite 这样的工具通常是：

```text
Dev：ESM + 按需 transform（No-Bundle 体验）
Build：Bundler（例如 Rollup）输出生产产物
```

---

## 五、No-Bundle 的适用边界

更适合：

- 现代浏览器目标（无需兼容大量旧环境）
- 中小型 Web 应用、组件开发、原型验证
- 需要极致开发反馈速度（HMR 快、冷启动快）

需要谨慎：

- 模块数量巨大、依赖关系复杂（开发时可能出现请求瀑布）
- 需要复杂的产物形态（多入口、多环境、多 CDN 策略）

---

## 参考资料

- [MDN - JavaScript modules](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [Vite - Why Vite](https://vite.dev/guide/why.html)
- [Import Maps](https://github.com/WICG/import-maps)
