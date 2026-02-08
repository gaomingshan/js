# webpack 性能优化

## 概述

webpack 的性能优化可以拆成两类问题：

- **构建速度**：本地 Dev 是否足够快？CI build 是否可接受？
- **产物性能**：产物体积是否可控？缓存策略是否稳定？首屏是否快？

更重要的是方法论：

1. 先测量（Profiling/Stats）
2. 再定位瓶颈（是解析慢？转译慢？压缩慢？还是拆包策略导致缓存失效？）
3. 最后做针对性优化

---

## 一、构建速度优化（Build Time）

### 1.1 用持久化缓存（webpack 5）

```js
module.exports = {
  cache: { type: 'filesystem' }
};
```

- 对大项目收益明显
- CI 里可配合缓存目录提升命中率

> **关键点**
>
> 缓存不是“开了就完事”，你需要治理：依赖版本稳定、cache key 可控。

### 1.2 减少转译范围（最常见的第一收益点）

- `exclude: /node_modules/`
- 只对需要的文件做 Babel/SWC 转译

```js
{ test: /\.(ts|tsx)$/, exclude: /node_modules/, use: 'babel-loader' }
```

### 1.3 用更快的转译器（SWC/esbuild）

- 如果你的 Babel 插件依赖不重，可以评估 SWC/esbuild-loader
- 把“热点环节”提速往往比“换整个平台”更划算

### 1.4 合理选择 Source Map

- dev 阶段：优先快（例如 `eval-cheap-module-source-map`）
- prod 阶段：看需求（`source-map` 更利于排障，但构建更慢且有泄露风险）

### 1.5 并行与压缩

- 压缩器开启 `parallel`（如果使用 Terser）
- 不要对所有环境都做重压缩（开发阶段通常不需要）

---

## 二、产物体积优化（Bundle Size）

### 2.1 先做分析：别靠感觉

常用做法：

- 生成 stats
- 使用 bundle analyzer

你需要回答的问题：

- 最大的依赖是谁？
- 为什么被打进来了（是否可按需加载/替换）？
- 是否存在重复依赖版本？

### 2.2 tree shaking 的现实落地

tree shaking 生效条件：

- 依赖提供 ESM（或可静态分析形态）
- `sideEffects` 标注合理

```json
{ "sideEffects": false }
```

> **关键点**
>
> 如果依赖是 CJS 或包含副作用，再强的工具也只能做保守优化。

### 2.3 代码分割（Code Splitting）

- 路由级/低频功能用 `import()`
- 提取公共依赖用 `splitChunks`

```js
module.exports = {
  optimization: {
    splitChunks: { chunks: 'all' }
  }
};
```

不要过度拆包：chunk 过小会增加请求与调度成本。

### 2.4 压缩与预压缩

- JS/CSS minify：降低传输体积
- 预压缩（gzip/br）：减少运行时压缩成本（通常由构建或 CI 完成）

---

## 三、缓存策略优化（Long-term Cache）

### 3.1 文件名 hash

```js
output: {
  filename: '[name].[contenthash:8].js',
  chunkFilename: '[name].[contenthash:8].chunk.js'
}
```

### 3.2 runtime 分离

```js
optimization: {
  runtimeChunk: 'single'
}
```

意义：

- runtime 变化会导致主包 hash 变化
- 分离后缓存更稳定

### 3.3 拆出稳定 vendor

- vendor 变动频率低
- 与业务代码分离可提升缓存命中率

> **关键点**
>
> “缓存策略”本质是“让变化局部化”。拆包不是为了拆而拆。

---

## 四、CI 与工程化优化（真实项目必做）

### 4.1 构建时间指标化

- 记录 build 耗时
- 记录产物体积
- 做趋势监控（避免无感变慢/变大）

### 4.2 把大依赖治理当成长期任务

- 依赖版本统一（避免重复版本）
- 大组件/大库按需加载
- 替换“为方便引入但巨大”的依赖

---

## 五、一个推荐的排障顺序（精简）

1. **慢在哪**：cache 是否开启？source map 是否太重？
2. **谁最慢**：转译还是压缩？用 profile/stats 定位。
3. **改动收益最大处**：缩小转译范围、开启缓存、拆大依赖。
4. **最后才考虑换工具**：迁移成本比想象大。

---

## 参考资料

- [webpack - Build Performance](https://webpack.js.org/guides/build-performance/)
- [webpack - Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [webpack - Caching](https://webpack.js.org/guides/caching/)
- [webpack - Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
