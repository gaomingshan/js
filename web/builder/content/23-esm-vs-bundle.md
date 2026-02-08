# ESM 应用 vs Bundle 应用

## 概述

“ESM 应用”和“Bundle 应用”描述的是两种**交付与运行方式**（Delivery Model），它们会影响：

- Dev Server 的实现方式
- 依赖解析与加载行为
- 性能瓶颈（网络 vs CPU）与缓存策略
- 代码分割、预加载与 tree shaking 的落地方式

先给一个直觉型定义：

- **ESM 应用**：生产环境尽量以“模块”形态交付给浏览器（模块边界被保留）。
- **Bundle 应用**：生产环境把模块图组织成少量可控的 chunk/asset（模块边界被重新组织）。

> **关键点**
>
> “Bundle”不是“合成一个文件”，而是“把模块图组织成一组可部署的加载单元（chunks/assets）”。

---

## 一、它们的本质差异：谁来做“链接（linking）”

### 1.1 ESM 应用：链接发生在浏览器

浏览器负责：

- 解析 `import`
- 递归发请求
- 缓存模块
- 执行模块（遵循模块执行顺序）

```text
浏览器
  ├─ 请求 main.js
  ├─ 发现 import './a.js'
  ├─ 请求 a.js
  └─ ...
```

### 1.2 Bundle 应用：链接发生在构建期

构建工具负责：

- 解析依赖图
- 决定 chunk 边界（拆包/合并）
- 生成 runtime/manifest（如果需要）

```text
构建期
  模块图 → chunk 图 → dist/assets

运行期
  浏览器加载少量 chunk（由 runtime/HTML 注入决定）
```

> **直觉理解**
>
> ESM 应用把“链接成本”放在运行期；Bundle 应用把“链接成本”前移到构建期。

---

## 二、性能模型：ESM 更像“网络密集”，Bundle 更像“CPU/构建密集”

### 2.1 ESM 应用的典型瓶颈

- **请求数量**：模块碎会带来大量请求
- **依赖瀑布**：深层依赖可能造成加载链路拉长
- **解析成本分散**：浏览器要解析更多文件

可用的缓解手段：

- `modulepreload`（提前预加载模块依赖）
- 合理的模块粒度（避免过度碎片化）
- CDN/HTTP2/HTTP3 传输优化
- Import Maps（解决裸导入并减少重写成本）

### 2.2 Bundle 应用的典型瓶颈

- **构建成本**：打包、压缩、拆包策略本身耗时
- **变更影响面**：bundle-first 的 dev 模式下，修改可能触发更大范围的重新生成
- **首屏解析成本**：chunk 过大可能导致 JS 解析/执行压力

可用的缓解手段：

- 缓存（filesystem cache、增量构建）
- 拆包（路由级/组件级）与长期缓存（vendor 分离）
- 预压缩与 CDN

---

## 三、缓存策略：Bundle 更容易做“长期缓存”，ESM 更依赖“模块级缓存”

### 3.1 Bundle 应用的经典缓存打法

- 文件名带内容哈希：`app.[contenthash].js`
- vendor chunk 稳定：依赖不变，hash 不变

```text
vendor.[hash].js   （长期缓存）
app.[hash].js      （频繁变）
```

### 3.2 ESM 应用的缓存特点

- 每个模块就是一个独立可缓存资源
- 模块更新粒度更细，但请求数量更多

> **关键点**
>
> “缓存更细”不等于“性能更好”：还要看请求调度、优先级、预加载与依赖深度。

---

## 四、tree shaking 与代码分割：两者都能做，但落地点不同

### 4.1 tree shaking 的前提

tree shaking 是构建期优化，本质依赖静态结构（ESM）与副作用语义：

- ESM 静态导入导出
- `package.json` 的 `sideEffects`

因此：

- **ESM 应用**：如果不做 bundling，你仍然需要某种构建来做 tree shaking（否则浏览器不会替你删除未用导出）
- **Bundle 应用**：通常天然在构建期做 DCE/tree shaking

### 4.2 代码分割（code splitting）

- ESM 应用：运行期模块边界天然存在，但“按需加载策略”更依赖浏览器调度与 preload
- Bundle 应用：构建期根据 `import()`、路由边界等生成 chunk，并可结合 runtime 做预取/预加载

---

## 五、适用场景：怎么选（更工程化的答案）

### 5.1 更适合 ESM 应用的情况

- 中小型应用，模块数量可控
- 现代浏览器为主（无需大量 legacy 兼容）
- 你更看重“交付透明与调试友好”（保留模块边界）

### 5.2 更适合 Bundle 应用的情况

- 大型应用、依赖多、模块图复杂
- 需要强产物控制（拆包、缓存、runtime、部署路径）
- 企业级场景（可观测、发布链路、复杂资源管线）

> **建议**
>
> 现实项目常见做法是：
>
> - Dev 采用 ESM 范式提升反馈速度
> - Prod 采用 bundle 产物确保性能与可控性

---

## 参考资料

- [MDN - JavaScript modules](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [Vite - Why Vite](https://vite.dev/guide/why.html)
- [webpack - Concepts](https://webpack.js.org/concepts/)
- [Import Maps](https://github.com/WICG/import-maps)
