# 动手实践指南

## 概述

构建工具最适合用“任务驱动”学习：每做完一个任务，你都会对工具边界更清晰。

这篇给出一套**从易到难、可用于真实项目的练习清单**。每个练习都强调两件事：

- 你要交付什么（产物/能力）
- 你要观察什么（模块图、缓存、拆包、体积、调试体验）

---

## 一、练习 0：画出你的模块图（半小时）

选一个你熟悉的项目，回答：

- 入口是什么？（HTML 入口？JS 入口？多入口？）
- 依赖边从哪里来？（npm 包、内部包、动态 import）
- 哪些资源参与构建？（CSS、图片、SVG、Wasm）

输出物：

- 一张手绘/ASCII 模块图

> **关键点**
>
> 能画出模块图，才有资格谈性能优化与拆包策略。

---

## 二、练习 1：用 Vite 做一个“可部署”的小应用（1 天）

目标不是写业务，而是覆盖完整链路：

- dev server + HMR
- proxy（对接本地 mock/真实后端）
- build + preview
- 部署到静态服务器（本地 nginx 也行）

你要观察：

- 第一次启动慢在哪里（依赖预构建）
- 改动一个文件，HMR 的边界是什么（哪些模块会刷新）
- build 产物的 chunk 结构（是否按路由拆分）

---

## 三、练习 2：用 Rollup 打一个“可发布”的库（1 天）

目标：发布一个可被 Vite/webpack 同时消费的库。

交付要求：

- 输出 ESM + CJS
- 正确 external peerDependencies
- 生成 `.d.ts`（用 `tsc --emitDeclarationOnly`）
- 配好 `exports`

你要观察：

- tree shaking 是否生效（下游引用一个函数时是否只打进必要代码）
- sideEffects 标注是否正确（CSS/副作用是否被误删）

---

## 四、练习 3：用 esbuild 打一个 CLI（半天~1 天）

目标：交付一个能 `npx` 运行的 CLI。

交付要求：

- 单文件产物（或少量文件）
- shebang 正确
- 资源文件（模板）复制策略清晰

你要观察：

- 哪些依赖必须 external（原生模块、动态 require）
- bundling 对启动速度的影响

---

## 五、练习 4：把一个 webpack 项目“治理到可维护”（2~3 天）

不要追求炫技，追求可维护：

- 配置分层（common/dev/prod）
- 开启 filesystem cache
- 缩小转译范围（Babel/SWC）
- 明确拆包与缓存策略（splitChunks/runtimeChunk）

你要观察：

- 构建慢在哪里（转译？压缩？解析？）
- 产物大在哪里（重复依赖？错误引入？未按需加载？）

> **关键点**
>
> 你能把 webpack 项目“治理好”，说明你已经理解了构建系统的主要矛盾。

---

## 六、练习 5（进阶）：做一次“迁移/替换”评估（2~5 天）

任选一条：

- webpack -> Rspack/Rsbuild
- webpack -> Vite（只迁移开发或只迁移部分模块）

交付要求：

- 基线指标（构建耗时、产物体积、关键页面性能）
- 回滚方案
- 差异点清单（loader/plugin、publicPath、env 注入、HMR 行为）

你要观察：

- 迁移成本主要来自哪里（生态/约定/产物策略/团队习惯）

---

## 参考资料

- [Vite](https://vite.dev/)
- [Rollup](https://rollupjs.org/)
- [webpack Guides](https://webpack.js.org/guides/)
- [Rspack](https://rspack.rs/)
- [Rsbuild](https://v0.rsbuild.dev/)
- [Node.js - package exports](https://nodejs.org/api/packages.html#exports)
