# 为什么真实项目是组合使用

## 概述

很多人第一次接触现代工具链时会困惑：

- Vite 里为什么同时出现 esbuild 和 Rollup？
- webpack 里为什么还要接 Babel/SWC、Terser、PostCSS？
- Rsbuild/Rspack 为什么又是一套体系？

答案不是“前端喜欢堆工具”，而是构建系统天然包含多类不同性质的问题：

- 有些问题是**体验问题**（dev server/HMR/错误覆盖层）
- 有些问题是**计算密集型问题**（转译/压缩）
- 有些问题是**产物策略问题**（拆包/缓存/资源输出/运行时）
- 有些问题是**生态兼容问题**（历史 loader/plugin/框架约定）

单一工具很难在所有维度同时做到“快 + 稳 + 可控 + 兼容”。组合使用，本质是**按职责分层，让不同工具在各自擅长的层发挥优势**。

---

## 一、组合使用的根因：构建是“多目标优化”

你面对的目标通常互相拉扯：

1. **开发阶段**：反馈速度最重要（冷启动/HMR/调试）
2. **生产阶段**：产物质量最重要（体积/缓存/兼容/稳定）
3. **团队维度**：生态与治理最重要（插件、规范、可维护性）

> **关键点**
>
> 真实工程不是“跑得起来”，而是要在长期迭代中保持可预测性；构建系统需要为这种可预测性付出结构化设计。

---

## 二、典型分层：平台层 / 引擎层 / 产物层

### 2.1 平台层（App-level Tooling）

负责“开发体验与工程语义”：

- dev server / HMR
- HTML 入口与多页面
- 环境变量与模式（dev/build/preview）
- 框架集成（React Refresh、Vue HMR）

代表：Vite / Rsbuild / Next（内部也有构建层）。

### 2.2 引擎层（Build Engine）

负责“热点计算”：

- TS/JSX 转译
- 依赖预构建
- 压缩（部分场景）

代表：esbuild / SWC。

### 2.3 产物层（Bundler / Output Strategy）

负责“可控产物”：

- chunk 拆分、runtime
- tree shaking、code splitting
- 资源输出与缓存策略

代表：Rollup / webpack / Rspack。

---

## 三、Vite 组合的一个直觉解释

### 3.1 为什么开发期要靠 ESM + 按需 transform

开发期最怕：

- 改一行就 rebuild 一个巨大的 bundle

Vite 把开发期范式换成：

- 浏览器请求什么模块 → 服务端就 transform 什么模块

因此天然“增量”。

### 3.2 为什么生产期仍需要 bundler

生产环境关心的是：

- 请求数、缓存策略、首屏关键资源
- 代码分割与按需加载
- 压缩与去重

这些都更适合 bundler 在全局视角下做决策，因此 Vite 把 build 交给 Rollup。

> **关键点**
>
> “开发范式”与“生产交付”可以是两套最优解，没必要强行统一。

---

## 四、webpack 工具链为什么也在组合

webpack 本身是“可编程构建平台”，但它也不会把所有能力都内置。

- 转译：Babel / SWC / ts-loader
- 压缩：Terser / CSSMinimizer
- CSS 生态：PostCSS / Sass

原因同样是职责边界：

- webpack 更擅长图的构建与产物治理
- 转译/压缩属于独立领域，交给专门工具更划算

---

## 五、组合使用的工程原则（避免“堆叠”）

1. **每个职责只让一套工具负责**
   - 例如不要让 Babel 和 SWC 同时处理同一类文件（除非你明确知道为什么）。

2. **平台层负责默认值与治理**
   - 把“团队共识”做成默认配置，而不是每个项目复制粘贴。

3. **产物层尽量保持可预测**
   - 拆包策略、publicPath、hash 命名要稳定。

4. **引擎层只放热点**
   - 哪里最耗时，就把加速引擎放哪里。

---

## 参考资料

- [Vite](https://vite.dev/)
- [Rollup](https://rollupjs.org/)
- [esbuild](https://esbuild.github.io/)
- [Rspack](https://rspack.rs/)
- [webpack](https://webpack.js.org/)
