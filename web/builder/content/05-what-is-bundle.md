# 什么是 Bundle（打包）

## 概述

很多人把“打包”理解成“把很多文件合成一个文件”，这只对了一半。

更准确的理解是：**Bundler 接收一张模块依赖图，输出一组可部署资源（assets）**。

其中可能包含：

- 多个 JS 文件（多个 chunk，而不是单一 bundle）
- CSS 文件（抽取后的样式）
- 静态资源（图片/字体）
- 清单文件（manifest）与运行时代码（runtime）

---

## 一、核心术语：模块图 → chunk → asset

| 术语 | 直觉理解 | 你会在哪里看到它 |
| --- | --- | --- |
| Module（模块） | 源码中的一个依赖单元（JS/TS/CSS…） | `src/a.ts`、`node_modules/x` |
| Module Graph（模块图） | 模块之间 `import/require` 关系组成的图 | bundler 内部结构 |
| Chunk（代码块） | bundler 根据策略切分出来的“加载单元” | code splitting / dynamic import |
| Asset（资源文件） | 最终输出到 `dist/` 的文件 | `app.[hash].js`、`style.css` |
| Bundle（狭义） | 一个包含多个模块的 JS 产物文件 | `app.[hash].js` |

> **关键点**
>
> “Bundle 应用”并不意味着“只有一个文件”，现代应用通常是“多 chunk 输出”。

---

## 二、Bundler 在做什么：从“图”到“产物”

一个可用的 bundler 至少要完成：

```text
入口(entry)
  ↓
解析(resolve) —— 把 import specifier 变成真实文件路径
  ↓
构建模块图(module graph)
  ↓
转换(transform) —— TS/JSX/CSS/资源处理
  ↓
切分(chunking) —— 拆包策略（静态/动态边界）
  ↓
代码生成(codegen) + 运行时(runtime)
  ↓
优化(optimize) —— tree shaking / 压缩 / 去重
  ↓
输出(emit) —— 写入 dist/，生成 manifest
```

> **直觉理解**
>
> bundling 更像“链接（linking）”：把分散的模块在保留依赖语义的前提下，组织成可加载的产物集合。

---

## 三、为什么生产环境往往仍需要 bundling

即使现代浏览器支持原生 ESM，生产仍普遍选择 bundling，核心原因通常不是“浏览器不支持”，而是**性能与缓存策略**：

### 3.1 请求数量与优先级

- ESM 应用开发时可能产生成百上千个模块请求
- 生产首屏更希望“少而关键”的请求集合（关键 CSS/JS 优先）

### 3.2 长期缓存（Long-term Cache）

拆包的目的之一是把稳定的依赖（vendor）与频繁变动的业务代码分开：

```text
vendor.[contenthash].js  （很久才变）
app.[contenthash].js     （经常变）
```

### 3.3 Tree Shaking 与死代码消除

- 需要静态结构（ESM）与副作用语义（`sideEffects`）
- 单靠浏览器加载并不会“自动把没用的代码删掉”

---

## 四、Bundling 不等于 Minify（压缩）

- **Bundling**：组织模块图 → 产物结构（chunk/asset）
- **Minify**：对单个产物做语义等价的体积压缩（变量改名、删除空白等）

二者常一起出现，但解决的问题不同。

---

## 五、产物里通常还包含一个“runtime”

即使输出是 ESM 格式，bundler 仍可能注入运行时代码来实现：

- chunk 加载（动态 `import()` 的映射）
- 模块缓存与执行
- publicPath、资源定位
- HMR（开发阶段）

> **深入一点**
>
> 许多“为什么打包后行为变了”的问题，最终都和 runtime 注入有关：
>
> - 全局变量隔离（scope wrapping）
> - 模块缓存语义
> - `__webpack_require__`/Rollup helpers 等辅助逻辑

---

## 六、什么时候 bundling 反而不划算

- 小型项目、模块数量少
- 内网工具、对首屏性能要求不高
- 需要保留原生模块边界（例如某些调试/教学场景）

但即使如此，通常仍需要至少做：

- TS/JSX 转译
- 资源处理（CSS/图片）
- 环境变量注入

---

## 参考资料

- [webpack - Concepts](https://webpack.js.org/concepts/)
- [Rollup - Concepts](https://rollupjs.org/introduction/)
- [Vite - Build](https://vite.dev/guide/build.html)
