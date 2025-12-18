# 构建工具 - 面试题汇总

**难度分布：** 🟢 简单 x15 | 🟡 中等 x20 | 🔴 困难 x15

---

## 第 1 题 🟢

**类型：** 多选题  
**标签：** 构建工具基础

### 题目

前端构建工具通常解决哪些问题？

**选项：**
- A. 模块化与依赖管理（解析、打包、拆包）
- B. 语法/兼容性转换（TS/JSX/Polyfill、目标环境差异）
- C. 开发体验（Dev Server、HMR、Source Map）
- D. 生产优化（压缩、Tree Shaking、缓存策略）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

构建工具本质上是在缩短“源码形态”到“可交付产物”之间的差距：

- **模块图**：从入口建立依赖图，决定模块如何组合与拆分。
- **变换**：把源码变成目标环境可运行的代码（语法降级、资源处理）。
- **体验**：提供快速反馈链路（HMR、调试定位）。
- **交付**：产物体积、缓存与部署契约（publicPath/base）。

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** Bundle

### 题目

下面对“Bundle（打包产物）”的描述，哪一项更准确？

**选项：**
- A. 把所有源码压缩成一行
- B. 把模块依赖图编译成可部署的资产集合（JS/CSS/资源），并附带拆包与运行时加载策略
- C. 只把第三方依赖打进一个文件
- D. 只在开发环境使用

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

Bundle 不是“合并文件”这么简单，它通常包含：

- **模块图的产物化**：模块被组织成一个或多个 chunk。
- **运行时加载逻辑**：决定异步 chunk 如何加载。
- **资源处理与输出结构**：hash 命名、目录结构、publicPath。

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** ESM Dev

### 题目

Vite 在开发阶段“快”的核心原因更接近下面哪一项？

**选项：**
- A. 完全不做任何转译
- B. 依赖一次性全量打包
- C. 基于浏览器原生 ESM，按请求对模块做 transform，并对模块图做缓存与失效
- D. 只优化了 CSS

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

Vite 的关键不在“某个编译器很快”，而在范式：

- **按需 transform**：页面请求哪个模块，就转换哪个模块。
- **模块图缓存**：复用上次的解析/转换结果。
- **依赖预构建**：用引擎（常见 esbuild）把依赖“粗打包”以减少请求瀑布。

</details>

---

## 第 4 题 🟢

**类型：** 单选题  
**标签：** Loader vs Plugin

### 题目

在 webpack 中，`Loader` 与 `Plugin` 的区别更接近下面哪一项？

**选项：**
- A. Loader 负责在模块级做“文件到模块”的转换；Plugin 负责在编译生命周期中扩展/改写构建行为
- B. Loader 只能处理 JS；Plugin 只能处理 CSS
- C. Loader 只在生产生效；Plugin 只在开发生效
- D. 两者没有区别

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

可以用“粒度”理解：

- **Loader（模块级）**：把某类资源变成模块可被依赖图消费（如 TS/JSX、CSS、图片）。
- **Plugin（过程级）**：参与编译过程（构建开始/结束、优化、生成产物、注入运行时）。

</details>

---

## 第 5 题 🟢

**类型：** 判断题  
**标签：** Tree Shaking

### 题目

tree shaking 主要依赖 ESM 的“静态结构”，因此 CommonJS 形态的依赖通常更难被精确摇掉。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

tree shaking 的前提是：

- import/export 在编译期可静态分析
- 工具能判定“哪些导出未使用”以及“删除是否安全”（副作用语义）

CommonJS 的 `require()` 是运行时行为，通常更难做精确的静态分析，因此摇树效果受限。

</details>

---

## 第 6 题 🟢

**类型：** 单选题  
**标签：** Source Map

### 题目

Source Map 的主要作用是什么？

**选项：**
- A. 让代码在运行时更快
- B. 把编译/压缩后的代码位置映射回源码位置，便于调试与定位错误
- C. 自动把 CommonJS 转成 ESM
- D. 自动开启 tree shaking

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

Source Map 的价值在于“**定位能力**”而非“性能能力”。它把：

- 浏览器/运行时报错的行列号
- 映射回你写的源码（TS/JSX/未压缩版本）

代价通常是：

- 生成更慢
- 产物更大（尤其是 `sourceMappingURL` 外链或内联）
- 需要注意线上暴露源码与敏感信息的风险

</details>

---

## 第 7 题 🟢

**类型：** 单选题  
**标签：** HMR

### 题目

HMR（Hot Module Replacement）的核心目标更接近下面哪一项？

**选项：**
- A. 每次改动都自动刷新整个页面
- B. 只替换发生变化的模块，并尽量保留应用状态，提高反馈速度
- C. 让打包产物体积变小
- D. 让代码自动降级到 ES5

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

HMR 本质是“**在模块图里做局部替换**”。关键点是：

- 需要知道变更模块的影响边界（依赖关系）
- 需要在边界处决定：能否 accept、是否需要 full reload

这也是为什么某些改动（例如入口模块、全局样式、运行时副作用）更容易触发整页刷新。

</details>

---

## 第 8 题 🟡

**类型：** 单选题  
**标签：** Vite 依赖预构建

### 题目

Vite 的依赖预构建（dep pre-bundling）的主要目的是什么？

**选项：**
- A. 把所有业务代码都提前打成一个 bundle
- B. 把第三方依赖转换为更适合 Dev 的形态（常见：把 CJS 依赖转为 ESM，并减少请求瀑布）
- C. 生成最终可上线的生产产物
- D. 让浏览器不再需要缓存

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

开发环境下直接用原生 ESM 会遇到两个常见问题：

- **依赖请求瀑布**：三方依赖模块多，浏览器要发大量请求
- **CJS 兼容**：部分依赖仍是 CommonJS，需要转换

依赖预构建通常用高性能引擎（常见 esbuild）把依赖整理成更适合 Dev 的形态，提升冷启动与页面加载速度。

</details>

---

## 第 9 题 🟡

**类型：** 单选题  
**标签：** Code Splitting

### 题目

在主流 bundler 中，动态 `import()` 通常会带来什么效果？

**选项：**
- A. 让模块变成全局变量
- B. 触发代码分割，生成异步 chunk，由运行时按需加载
- C. 禁用 tree shaking
- D. 强制变成同步加载

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

`import()` 的语义是“异步获取模块”。构建工具通常把它当作拆包边界：

- 生成一个独立 chunk
- 在运行时插入加载逻辑（script 或 import() polyfill/runtime）
- 与路由级懒加载、按需功能加载密切相关

</details>

---

## 第 10 题 🟢

**类型：** 单选题  
**标签：** 缓存策略

### 题目

生产环境产物文件名使用 `contenthash` 的主要价值是什么？

**选项：**
- A. 让 JS 执行更快
- B. 内容不变则 hash 不变，便于浏览器长期缓存；内容变化则 hash 变化，避免缓存污染
- C. 让 HMR 更稳定
- D. 让 tree shaking 更彻底

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

长期缓存的核心矛盾是：

- 希望资源“尽可能缓存很久”
- 又必须在内容变化时“立即拿到新版本”

`contenthash` 用“内容地址化”的方式解决这个矛盾：文件内容变化 → 文件名变化 → CDN/浏览器自然拉新。

</details>

---

## 第 11 题 🟢

**类型：** 单选题  
**标签：** Babel / 转译

### 题目

Babel 在工程化构建链路中的核心职责更接近下面哪一项？

**选项：**
- A. 负责模块打包与拆包（chunk 策略）
- B. 负责语法转换与按目标环境输出（常与 polyfill 策略配合）
- C. 负责 Dev Server 与 HMR
- D. 负责把所有依赖预打包成 vendor

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

Babel 更像“编译器/转译器”，解决的是：

- **把你写的语法**（TS/JSX/新语法提案）
- 转换成 **目标环境能执行的语法**（配合 `@babel/preset-env` 与 targets）

它不负责“模块如何组合成 chunk”，那属于 bundler（webpack/Rollup/Rspack）关注的产物策略。

</details>

---

## 第 12 题 🟢

**类型：** 单选题  
**标签：** browserslist / 兼容性

### 题目

在现代前端工程中，`browserslist` 通常会影响哪些环节？

**选项：**
- A. JS 转译目标（Babel / SWC / esbuild 的 target）
- B. CSS 兼容处理（例如 Autoprefixer）
- C. 部分工具的“是否需要降级/注入 polyfill”决策
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

`browserslist` 的价值是把“目标环境”变成**统一的契约**，让不同工具在同一个兼容基线上工作：

- JS 的语法转译与必要的降级
- CSS 的前缀与兼容策略
- 一些生态工具对 feature 支持与 polyfill 的推断

</details>

---

## 第 13 题 🟡

**类型：** 单选题  
**标签：** 环境变量注入

### 题目

webpack 的 `DefinePlugin`（以及类似机制的 `define`）更符合下面哪种描述？

**选项：**
- A. 运行时读取 `process.env` 并动态变化
- B. 构建时做常量替换/字符串替换，可能触发常量折叠与死代码删除
- C. 自动把 `.env` 内容加密后注入产物
- D. 只对 CSS 生效

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

这类机制是“**编译期注入**”，典型效果是：

- 让 `if (process.env.NODE_ENV === 'production')` 变成可在构建期判定的条件
- 从而让 minifier/优化器做 **dead code elimination**

注意它不是运行时配置系统：把敏感信息（密钥）注入前端产物通常是不安全的。

</details>

---

## 第 14 题 🟡

**类型：** 单选题  
**标签：** 模块解析 / package.json

### 题目

当一个包同时提供 `exports` 与 `main/module` 时，现代 Node.js 与主流 bundler 通常更优先使用哪个字段来决定“可用入口”？

**选项：**
- A. `main`
- B. `module`
- C. `exports`
- D. 都不优先，按文件系统扫描

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

`exports` 的定位是“**包对外暴露的入口契约**”：

- 它不仅提供入口
- 还会限制“哪些子路径可以被导入”（未声明的子路径可能直接被视为不可访问）
- 并可根据条件导出（`import`/`require`/`browser` 等）返回不同入口

因此一旦存在 `exports`，它往往比 `main/module` 更具决定性。

</details>

---

## 第 15 题 🔴

**类型：** 单选题  
**标签：** Tree Shaking / sideEffects

### 题目

如果一个包存在真实副作用（例如全局 polyfill、样式导入、注册逻辑），但在 `package.json` 中错误地设置了 `"sideEffects": false`，生产构建最可能出现什么问题？

**选项：**
- A. 构建变慢，但运行结果正确
- B. 产物更大，性能更差
- C. 优化器可能删除“看起来未使用”的模块导入，导致功能缺失或样式丢失
- D. 只影响开发 HMR，不影响生产

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

`sideEffects` 是给 tree shaking 的“安全提示”。当你声明 `false` 时，相当于告诉 bundler：

- 这个包的模块在“未被引用其导出”时可以被安全移除

但如果模块本身依赖“执行副作用”（注入全局、注册、导入 CSS），被移除就会直接破坏运行行为。实践中更稳的做法是：

- 对副作用文件做白名单（数组形式），例如保留 `*.css` 等

</details>

---

## 第 16 题 🟢

**类型：** 单选题  
**标签：** Polyfill / 兼容性

### 题目

下面关于“语法转译（syntax transform）”与“Polyfill”的描述，哪一项是正确的？

**选项：**
- A. 语法转译会自动为所有新 API 注入 polyfill
- B. 语法转译解决“代码长什么样”；polyfill 解决“运行时有没有这些能力”
- C. polyfill 只在开发环境需要，生产环境不需要
- D. polyfill 等价于压缩（minify）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

两者关注点不同：

- **语法转译**：把 `optional chaining`、`class` 等语法转换成旧语法。
- **polyfill**：为 `Promise`、`Array.prototype.includes` 等运行时能力提供补丁。

你可以“只转译不 polyfill”（产物能运行但缺 API），也可能“有 polyfill 但语法不支持”（代码无法解析）。

</details>

---

## 第 17 题 🟡

**类型：** 单选题  
**标签：** Babel / polyfill 策略

### 题目

使用 `@babel/preset-env` 时，`useBuiltIns: "usage"` 的典型含义是什么？

**选项：**
- A. 不注入任何 polyfill，完全依赖运行环境
- B. 根据代码实际使用到的内建 API，按需注入/引入 polyfill（通常需要 `core-js`）
- C. 把所有 polyfill 一次性注入到入口文件
- D. 只对 `node_modules` 生效

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

`usage` 的核心是“**按用量引入**”：

- 工具扫描你的代码用到哪些 API
- 只为这些 API 引入对应的 polyfill

这通常能在“兼容性”与“产物体积”之间取得更好平衡。

</details>

---

## 第 18 题 🟡

**类型：** 单选题  
**标签：** TypeScript / 类型检查

### 题目

为什么很多项目会把“TS 编译（transpile）”和“类型检查（typecheck）”拆开执行？

**选项：**
- A. 因为 TypeScript 不能输出 JS
- B. 因为类型检查是全局语义分析，成本更高；拆开可提升 Dev 增量反馈速度
- C. 因为 bundler 不支持 sourcemap
- D. 因为拆开会让产物更小

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

类型检查需要构建完整的 TypeScript Program（跨文件、跨项目引用），属于相对“重”的步骤；而很多构建链路只需要把 TS 变成 JS（语法层）即可。

常见做法：

- Dev/build：使用更快的转译器（SWC/esbuild/Babel/ts-loader transpileOnly）
- CI 或独立进程：使用 `tsc --noEmit` 做类型检查

这样既保证体验，也保证质量门禁。

</details>

---

## 第 19 题 🟡

**类型：** 单选题  
**标签：** webpack 5 / Asset Modules

### 题目

webpack 5 引入 Asset Modules 的主要意义是什么？

**选项：**
- A. 让 JS 代码自动变成 TypeScript
- B. 用内置能力覆盖常见资源处理场景（替代部分 `file-loader`/`url-loader`），减少额外 loader 依赖
- C. 让 dev server 不再需要 HMR
- D. 自动实现 tree shaking

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

Asset Modules 把“静态资源如何进入模块图、如何输出”为一等能力（如 `asset/resource`、`asset/inline`）。

这降低了配置成本，并让资源处理更一致。

</details>

---

## 第 20 题 🟡

**类型：** 单选题  
**标签：** splitChunks / 去重与缓存

### 题目

webpack 的 `optimization.splitChunks` 更偏向解决什么问题？

**选项：**
- A. 让所有代码都合并成一个文件
- B. 抽离公共依赖/公共模块，减少重复，并改善缓存复用
- C. 让代码在运行时更快（提升 JS 引擎执行速度）
- D. 让 ESM 自动变成 CommonJS

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

代码分割不仅来自 `import()`（异步边界），也来自“公共模块抽取”的策略。

`splitChunks` 典型目标：

- **去重**：多个入口重复依赖同一个库时，避免重复打包
- **缓存复用**：公共 chunk 稳定，变更频率低，利于长期缓存

</details>

---

## 第 21 题 🟡

**类型：** 单选题  
**标签：** webpack / runtimeChunk

### 题目

在 webpack 中，将运行时代码单独抽成 `runtimeChunk`（或让 runtime 更稳定）的主要收益是什么？

**选项：**
- A. 让 JS 执行更快
- B. 提升长期缓存命中率，避免业务代码变动导致 vendor hash 频繁变化
- C. 让 tree shaking 更彻底
- D. 让 HMR 永远不会 full reload

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

chunk 的文件名 hash 往往取决于“内容”。如果 runtime 与业务/依赖高度耦合，任何一个 chunk 的变化都可能“连锁”影响到其他 chunk 的 hash。

把 runtime 抽离出来的典型好处是：

- **稳定 vendor/commons 的 hash**：业务改动不应频繁影响第三方依赖 chunk。
- **提升缓存命中**：浏览器/CDN 可以长期缓存不变的公共 chunk。

这属于“交付质量”优化，而不是语法或运行时性能优化。

</details>

---

## 第 22 题 🟢

**类型：** 单选题  
**标签：** publicPath / base

### 题目

生产环境出现 `chunk 404`（主页面能打开，但异步 chunk 加载失败）时，最常见的根因更接近下面哪一项？

**选项：**
- A. tree shaking 把 chunk 摇没了
- B. publicPath/base（资源基准路径）配置与实际部署路径不一致
- C. HMR 没开
- D. babel 没配置

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

异步 chunk 的加载 URL 通常由“运行时”根据 `publicPath/base` 计算得出：

- 你把应用部署到子路径（例如 `/app/`）
- 但构建产物认为自己在根路径（例如 `/`）

就会导致异步加载请求指向错误位置，从而出现 404。

排查思路：

- 打开 Network，找到 chunk 请求的真实 URL
- 对照产物在 CDN/静态服务器上的真实路径
- 检查构建工具的 `publicPath` / `base` / `assetPrefix` 等配置

</details>

---

## 第 23 题 🔴

**类型：** 单选题  
**标签：** 模块图 / chunk 图

### 题目

下面关于“模块图（Module Graph）”与“Chunk 图（Chunk Graph）”的关系，哪一项更准确？

**选项：**
- A. 两者完全等价，只是叫法不同
- B. 模块图描述依赖关系；Chunk 图描述模块如何被分组输出（拆包策略的结果）
- C. Chunk 图只在开发环境存在
- D. 模块图只在生产环境存在

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

你可以把构建过程拆成两层：

- **模块图**：从入口出发解析 import/require，得到“谁依赖谁”。
- **Chunk 图**：在模块图基础上，结合入口、动态导入、拆包规则（splitChunks/manualChunks 等）决定“哪些模块打到一起输出”。

很多复杂问题（缓存、体积、懒加载边界）本质都发生在 Chunk 图层面，而不是模块解析层面。

</details>

---

## 第 24 题 🔴

**类型：** 多选题  
**标签：** Tree Shaking / 失效原因

### 题目

下面哪些情况会导致 tree shaking 效果明显变差或直接失效？**（多选）**

**选项：**
- A. 依赖以 CommonJS 入口为主（运行时 `require` 难以静态分析）
- B. 包/模块存在副作用，但未正确声明（或被错误标记为无副作用）
- C. 导入方式把 ESM 变成“整体对象”使用（例如 `import * as ns` 并动态访问属性）
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

tree shaking 依赖两个前提：

- **可静态分析的导入导出结构**（ESM 更有优势）
- **可证明删除是安全的**（副作用语义、导出使用情况）

常见“看起来没摇干净”的根因，往往不是“工具不行”，而是：

- 入口选择不对（解析到 CJS）
- 语义不对（有副作用）
- 用法不利于静态分析（动态属性访问）

</details>

---

## 第 25 题 🟡

**类型：** 单选题  
**标签：** Rollup / external / preserveModules

### 题目

在构建组件库/SDK 时，Rollup 中经常把 `peerDependencies` 设置为 `external`，其核心原因更接近下面哪一项？

**选项：**
- A. 让库的产物体积更大
- B. 避免把宿主应用的依赖重复打进库里，引发重复副本与运行时冲突
- C. 让 dev server 更快
- D. 让 sourcemap 更准确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

对库而言，`peerDependencies` 更像“宿主必须提供的依赖契约”。如果把它们打进库：

- 宿主与库可能各自带一份 React/Vue 等核心依赖
- 造成体积增大、上下文不一致、甚至 Hooks/单例失效等严重问题

因此常见组合是：

- `peerDependencies`：声明版本范围（契约）
- `external`：构建时不打包进去（执行）

</details>

---

## 第 26 题 🟢

**类型：** 单选题  
**标签：** Rspack / webpack 生态

### 题目

Rspack 更准确的定位是下面哪一项？

**选项：**
- A. 一个 JavaScript 包管理器
- B. 一个基于 Rust 实现、目标是兼容 webpack 配置/生态并提升性能的 bundler
- C. 一个只做 TypeScript 类型检查的工具
- D. 一个只做 CSS 前缀补全的工具

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

Rspack 的核心是“bundler 引擎”，重点在：

- **性能**：用 Rust 做热点计算（解析、构图、生成、优化）。
- **兼容**：尽量复用 webpack 的心智模型与生态（配置形态、插件/loader 思路）。

它解决的是“应用/复杂工程的构建与交付”，而不是包管理、类型检查等问题。

</details>

---

## 第 27 题 🟡

**类型：** 单选题  
**标签：** Rsbuild / 分层

### 题目

在 Rspack 与 Rsbuild 的组合中，下面哪一项更符合职责分层？

**选项：**
- A. Rsbuild 是 bundler 引擎，Rspack 是应用级脚手架
- B. Rspack 是 bundler 引擎，Rsbuild 提供应用级默认配置/插件体系/工程化体验，底层调用 Rspack
- C. 两者完全独立，不存在上下层关系
- D. Rsbuild 只负责压缩，Rspack 只负责 HMR

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

可以用“平台 vs 引擎”理解：

- **Rspack**：更像“编译器/打包器引擎”（做构图、产物、优化）。
- **Rsbuild**：更像“应用级平台”（提供默认值、预设、插件整合、开发体验与工程化约束）。

这种分层的价值是：引擎专注吞吐，平台专注体验与配置治理。

</details>

---

## 第 28 题 🟡

**类型：** 单选题  
**标签：** Vite / esbuild / Rollup

### 题目

为什么常说 Vite “开发阶段常用 esbuild，但生产构建通常交给 Rollup（或同级 bundler）”？

**选项：**
- A. esbuild 不能输出 sourcemap
- B. Dev 更强调单文件 transform 与依赖预处理的速度；Build 更强调成熟的 chunking/产物控制与插件生态
- C. Rollup 只能用于开发环境
- D. esbuild 不支持 ESM

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

这体现了“Dev 与 Build 的最优解不同”：

- **Dev**：目标是反馈速度，常见模式是按需 transform + 缓存。
- **Build**：目标是交付质量，需要更完整的拆包策略、产物语义与生态兼容。

所以 Vite 会把“快”用在该快的地方（依赖预构建、局部 transform），把“产物策略”交给更擅长全局视角的 bundler。

</details>

---

## 第 29 题 🔴

**类型：** 单选题  
**标签：** 模块解析 / 重复依赖

### 题目

生产构建中发现“同一个依赖被打包了两份”（例如同一工具库出现两套代码），最可能的根因是什么？

**选项：**
- A. 开启了 `contenthash`
- B. 使用了动态 `import()`
- C. 同一个包被解析到不同入口文件（例如同时命中 ESM 与 CJS 入口、不同条件导出命中不同文件、或导入路径不一致），导致 bundler 视为不同模块
- D. 生成了 sourcemap

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

bundler 的模块身份通常基于“**解析后的文件路径**”。只要解析结果不同，它就会当作两个模块：

- 同一个包的不同入口（`exports`/`mainFields`/条件导出）
- deep import 与入口 import 混用
- monorepo symlink/路径差异

治理思路：

- 统一导入方式与入口选择（别混用 CJS/ESM 路径）
- 用 alias/dedupe/解析配置确保命中同一份物理文件

</details>

---

## 第 30 题 🔴

**类型：** 单选题  
**标签：** Monorepo / 去重 / React 单例

### 题目

在 pnpm monorepo 中出现 `Invalid hook call`（或类似“Hooks 规则错误”）时，最常见的根因是什么？

**选项：**
- A. React 没写在任何 `package.json` 里
- B. 运行时存在多个 React 物理副本（路径不同），导致出现两个 React 实例；常见来源是版本不统一或库把 React 错误打包进产物
- C. webpack 没开启 `hot: true`
- D. sourcemap 生成失败

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

React/Vue 这类核心依赖往往要求“**单例**”。一旦出现两份副本：

- Hooks/上下文等机制就会失效（不同副本之间状态不共享）
- 同时还会导致 bundle 体积变大

常见治理方式：

- 统一版本（workspace 约束、resolutions/overrides）
- 对库包把 React 放入 `peerDependencies` 并 external
- bundler 配置 `alias/dedupe` 指向同一份 React

</details>

---

## 第 31 题 🟢

**类型：** 单选题  
**标签：** Vite / preview

### 题目

`vite preview` 的主要用途是什么？

**选项：**
- A. 启动开发服务器并开启 HMR
- B. 本地启动一个静态服务器，用于预览 `vite build` 的产物效果
- C. 自动把项目从 webpack 迁移到 Vite
- D. 只做依赖预构建，不启动服务

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

`preview` 的价值在于验证“**生产产物的运行形态**”：

- 产物的 base/publicPath 是否正确
- 路由与静态资源是否能正常加载

它不是 dev server（没有完整的 HMR 体验），更接近“上线前的本地验收”。

</details>

---

## 第 32 题 🟢

**类型：** 单选题  
**标签：** webpack / mode

### 题目

webpack 配置中的 `mode: 'production'` 通常意味着什么？

**选项：**
- A. 关闭所有优化，便于调试
- B. 启用一组面向生产的默认优化（如压缩、作用域提升、环境变量替换等）
- C. 自动把项目改成 ESM-only
- D. 只影响 devServer，不影响 build

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

`mode` 本质是“默认值开关”。它会影响：

- 是否启用压缩/优化
- `process.env.NODE_ENV` 等常量替换（从而影响死代码删除）

工程上仍建议显式配置关键优化项，而不是完全依赖默认行为。

</details>

---

## 第 33 题 🟡

**类型：** 单选题  
**标签：** 模块解析 / mainFields

### 题目

在 bundler 解析依赖包入口时，配置/默认的 `mainFields`（或类似机制）主要影响什么？

**选项：**
- A. 代码压缩算法
- B. 同一个包会优先命中哪个入口构建（如 `browser`/`module`/`main`），从而影响 ESM/CJS 形态与 tree shaking 效果
- C. sourcemap 的生成方式
- D. HMR 的更新速度

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

入口选择直接决定“你到底打进来的是哪份代码”：

- 命中 ESM 入口通常更利于 tree shaking
- 命中 CJS 入口更利于兼容，但优化上限更明显
- `browser` 入口可能包含对浏览器更友好的替代实现

很多“重复打包”“摇树失效”问题，本质是入口解析策略不一致导致的。

</details>

---

## 第 34 题 🟡

**类型：** 单选题  
**标签：** TypeScript / paths

### 题目

在 TS 项目里配置了 `tsconfig.json` 的 `paths`，但运行/打包仍提示“找不到模块”，最常见原因是什么？

**选项：**
- A. `paths` 只影响 TypeScript 的类型检查/编译解析；bundler/运行时仍需要对应的 alias/resolve 配置
- B. `paths` 会自动修改 Node.js 的模块解析算法
- C. `paths` 会自动生成 npm 包
- D. `paths` 只在生产环境生效

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

这是“多解析器”问题：

- TS 编译器有自己的解析规则
- bundler（webpack/Vite/Rollup）有自己的解析规则
- Node.js 运行时也有自己的解析规则

想让三者一致，需要在构建工具中同步配置 alias（或使用能读取 tsconfig 的插件/配置）。

</details>

---

## 第 35 题 🔴

**类型：** 单选题  
**标签：** Source Map / 链路

### 题目

线上错误通过 sourcemap 还原后“定位到的源码行列明显不对”，更可能的根因是哪一项？

**选项：**
- A. `contenthash` 配置错误
- B. 多段 transform（TS→JS、Babel、压缩）中某一段没有正确传递/合并 input sourcemap，导致映射链断裂
- C. 使用了动态 `import()`
- D. splitChunks 抽了公共包

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

sourcemap 是“链式结构”：

- 每一步 transform 都可能生成一份 map
- 下一步必须把上一份 map 作为输入继续合并

只要中间某步丢了 map（或生成不正确），最终定位就会偏移。排查时要重点关注：

- 转译器/压缩器是否开启 map
- loader/plugin 是否正确接收 `inputSourceMap`

</details>

---

## 第 36 题 🟡

**类型：** 多选题  
**标签：** Vite / optimizeDeps

### 题目

下面哪些变化通常会触发（或应该触发）Vite 重新进行依赖预构建？**（多选）**

**选项：**
- A. `package.json`/lockfile 发生变化
- B. Vite 配置（尤其是 resolve/optimizeDeps）发生变化
- C. Node.js 版本或依赖安装结构变化（影响解析结果）
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

依赖预构建的本质是“把依赖变成更适合 Dev 的可缓存产物”。只要输入（依赖与解析环境）变了，就必须重建，否则容易出现：

- 依赖版本对不上
- 导出不一致
- 运行时报错但源码没变

</details>

---

## 第 37 题 🟡

**类型：** 单选题  
**标签：** Rollup / preserveModules

### 题目

在构建组件库/工具库时，使用 Rollup 的 `preserveModules: true` 的主要目的是什么？

**选项：**
- A. 让产物变成一个单文件
- B. 保留模块边界与目录结构，使下游 bundler 更容易按需引用与二次 tree shaking（代价是文件数变多）
- C. 让 HMR 更快
- D. 自动生成类型声明文件

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

对库而言，“可被消费方按需引用”往往比“单文件”更重要。

`preserveModules` 保留模块结构，常用于：

- 对外暴露多入口/多子路径
- 与 `exports` 子路径导出配合

但要权衡：文件数变多会影响发布体积与包管理器解压/安装成本。

</details>

---

## 第 38 题 🔴

**类型：** 单选题  
**标签：** CSS / 拆包 / 顺序

### 题目

在“路由级懒加载 + CSS 提取”场景下，为什么有时会出现样式闪烁或样式覆盖顺序异常？

**选项：**
- A. 因为 CSS 不能被缓存
- B. CSS 作为副作用资源被拆分到异步 chunk 后，加载时序与注入顺序受运行时影响，可能与预期的“源码引入顺序”不完全一致
- C. 因为 tree shaking 把 CSS 摇掉了
- D. 因为 `contenthash` 会随机变化

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

本质是“**异步边界改变了 CSS 的加载时序**”。常见缓解思路：

- 保持关键样式同步引入（首屏 CSS）
- 避免跨路由共享样式被拆得过碎
- 使用工具提供的 CSS code splitting/加载策略，并验证产物顺序

</details>

---

## 第 39 题 🔴

**类型：** 单选题  
**标签：** 缓存 / 可复现构建

### 题目

要让“远程构建缓存（remote cache）”真正可靠成立，最关键的前提是什么？

**选项：**
- A. 网络带宽足够大
- B. 构建在相同输入下必须可复现（deterministic）：依赖版本、工具版本、环境变量、构建参数变化都会体现在 cache key 中
- C. 只要 CI 机器性能强就行
- D. 只要把 dist 上传到 CDN 就行

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

缓存本质是“用 key 代表一次构建的所有输入”。如果 key 不完整或构建不可复现：

- 你会命中错误缓存（产物与当前输入不一致）
- 导致线上难以解释的行为差异

因此工程上会强调：锁定依赖、锁定工具版本、控制环境变量、并把这些纳入缓存键。

</details>

---

## 第 40 题 🟡

**类型：** 单选题  
**标签：** 体积分析 / stats

### 题目

想定位“是哪一部分依赖导致 bundle 体积显著增长”，更推荐的第一步是什么？

**选项：**
- A. 盲目调大 splitChunks 阈值
- B. 生成构建 stats 并用可视化工具分析（如 bundle analyzer），确认增量来源
- C. 关闭 sourcemap
- D. 把所有依赖都 external

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

体积治理首先是“可观测”。没有 stats/分析报告时，优化往往是猜测。

常见输出：

- 依赖树与每个模块的体积占比
- chunk 的组成与重复模块

明确来源后，再决定用 tree shaking、拆包、替代依赖或 external 等策略。

</details>

---

## 第 41 题 🟡

**类型：** 单选题  
**标签：** Tree Shaking / Minify

### 题目

下面关于 tree shaking 与代码压缩（minify）的描述，哪一项更准确？

**选项：**
- A. tree shaking 在运行时删除未使用的函数
- B. minify 会基于导出使用情况删除未使用模块，不需要 ESM
- C. tree shaking 基于模块静态结构移除未使用导出；minify 主要做语法级压缩，两者互补
- D. 两者都只对 CSS 生效

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

两者解决的问题不同：

- **tree shaking**：更偏“语义级删除”（基于 ESM 的静态可分析结构 + 副作用语义）。
- **minify**：更偏“表达级压缩”（变量改名、语法压缩），也可能配合常量替换做 DCE。

工程上通常是“先确定可删什么”，再“把留下的东西压到更小”。

</details>

---

## 第 42 题 🟡

**类型：** 多选题  
**标签：** Babel / SWC / esbuild

### 题目

下面关于 Babel、SWC、esbuild 的说法，哪些是正确的？**（多选）**

**选项：**
- A. Babel 的优势通常在插件生态与语法提案覆盖面，但纯转译性能往往不如 Rust/Go 实现
- B. SWC/esbuild 常用于高性能语法转译，但通常不负责 TypeScript 的类型检查
- C. 使用 SWC/esbuild 转译 TS 仍需要独立的 `tsc --noEmit` 或等价方案做类型门禁
- D. SWC/esbuild 完全等价于 bundler，能替代 webpack/Rollup 的拆包与产物策略

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

理解它们最稳的方式是把职责拆开：

- **转译器**（Babel/SWC/esbuild）：把“代码形态”变成目标形态。
- **类型检查**：是全局语义分析，常单独跑。
- **bundler**（webpack/Rollup/Rspack…）：负责模块图、chunk 策略与交付产物。

不要把“转译器很快”误认为“可以替代 bundler 的产物策略”。

</details>

---

## 第 43 题 🟡

**类型：** 单选题  
**标签：** Vite 插件 / Dev vs Build

### 题目

下面哪一个 hook 更典型地属于“Vite dev server 阶段（dev-only）”，而不是 Rollup build 阶段？

**选项：**
- A. `resolveId`
- B. `load`
- C. `transform`
- D. `configureServer`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

Vite 的插件模型会复用/兼容大量 Rollup hooks（`resolveId/load/transform` 等），但也提供了面向 dev server 的扩展点：

- `configureServer` 用于接入中间件、改写 server 行为等，是典型的 dev-only hook。

这也是写 Vite 插件时需要区分“Dev 路径”和“Build 路径”的原因。

</details>

---

## 第 44 题 🔴

**类型：** 单选题  
**标签：** Code Splitting / 重复依赖

### 题目

一个应用使用大量路由级懒加载后，发现同一个第三方库被打进多个异步 chunk，导致总体体积变大且缓存效率差。更合理的治理方向是？

**选项：**
- A. 禁用动态 `import()`，让所有代码合并成一个大 bundle
- B. 配置公共依赖抽取（如 webpack `splitChunks` 或 Rollup/Vite `manualChunks`），让依赖聚合到更稳定的公共 chunk
- C. 开启 `inline-source-map`
- D. 把所有依赖都 external

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

“重复打包”通常是拆包边界与抽取策略共同作用的结果。更稳的目标是：

- 让变化频率低的依赖形成稳定公共 chunk（利于缓存）
- 让业务代码按路由/功能拆分（利于首屏与按需加载）

盲目合并成单 bundle 往往牺牲首屏与缓存；盲目 external 又会引入运行时依赖管理成本。

</details>

---

## 第 45 题 🔴

**类型：** 多选题  
**标签：** Tree Shaking / 入口选择

### 题目

你希望某个依赖可以被 tree shaking，但产物里该依赖几乎整包打进来。排查发现 bundler 解析到了它的 CommonJS 入口。以下哪些方法可能有效？**（多选）**

**选项：**
- A. 调整解析策略（如 `mainFields` / 条件导出），优先命中 ESM 入口
- B. 对该包做 alias，显式指向其 ESM 入口文件
- C. 把该包强行标记为 `sideEffects: false`（即使它确实有副作用）
- D. 避免在项目中用 `require()` 方式引入该包（减少 CJS 链路）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, D

### 📖 解析

tree shaking 的第一步是“拿到可静态分析的模块形态（ESM）”。所以通常要先解决：

- **解析到哪个入口**（exports/mainFields/conditions）
- **导入方式是否破坏静态结构**（require / 动态访问）

`sideEffects` 不能当作“性能开关”乱写，否则会造成真实副作用被删除，导致线上功能/样式丢失。

</details>

---

## 第 46 题 🔴

**类型：** 单选题  
**标签：** webpack cache / cache miss

### 题目

启用 webpack `cache: { type: 'filesystem' }` 后，仍然经常二次构建很慢（大量 cache miss）。下面哪一项最可能是根因？

**选项：**
- A. 产物使用了 `contenthash`
- B. 构建输入不稳定：依赖版本漂移、绝对路径变化、环境变量/时间戳/随机数参与输出，或 loader/plugin 的 options 非确定
- C. 使用了动态 `import()`
- D. 使用了 CSS Modules

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

缓存能否命中，本质取决于“cache key 是否覆盖全部输入且输入是否稳定”。常见破坏因素：

- 构建中读取未纳入 key 的环境变量
- 把时间戳/随机数写进产物
- 依赖未锁定（CI 与本地安装结果不同）
- 与路径强绑定（不同机器/不同工作目录导致绝对路径变化）

这类问题需要先让构建尽可能可复现，再谈缓存命中率。

</details>

---

## 第 47 题 🔴

**类型：** 单选题  
**标签：** Source Map / 安全

### 题目

如果你希望生成 sourcemap 以便错误追踪还原堆栈，但又不想在 sourcemap 中包含源码内容（降低泄露风险），更适合选择哪种策略？

**选项：**
- A. `inline-source-map`
- B. `eval-source-map`
- C. `nosources-source-map`（并把 sourcemap/源码上传到错误追踪系统，而非对外公开）
- D. 关闭 sourcemap

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

`nosources-source-map` 通常会保留映射关系，但不直接内嵌源码内容（`sourcesContent`）。更常见的线上落地是：

- 构建生成 map
- 部署阶段上传到错误追踪平台（如 Sentry）
- 线上静态服务不公开 map

从而在“可定位”与“降低源码暴露风险”之间取得更稳的平衡。

</details>

---

## 第 48 题 🔴

**类型：** 单选题  
**标签：** Module Federation / shared

### 题目

在 Module Federation 场景下，为了避免 host 与 remote 各自加载一份 React 导致 hooks 错误，最合理的配置方向是？

**选项：**
- A. 把 React 打进每个 remote 的 bundle 里，保证版本一致
- B. 在 `shared` 中把 React 标记为 singleton，并让版本约束一致（例如 `shared: { react: { singleton: true } }`）
- C. 禁用 splitChunks
- D. 关闭 HMR

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

React 这类核心依赖通常要求“单例”。Federation 的 shared 配置就是运行时共享依赖的关键：

- `singleton: true` 约束运行时只使用一份实例
- 配合版本治理，避免 host/remote 版本不兼容

另外，从库发布角度也应把 React 放入 `peerDependencies` 并 external，避免在库侧打入重复副本。

</details>

---

## 第 49 题 🔴

**类型：** 单选题  
**标签：** 库发布 / exports / types

### 题目

发布一个同时支持 Node ESM 与 CommonJS 的库，并希望类型声明也能正确映射，下面哪种设计更合理？

**选项：**
- A. 只写 `main` 指向一个文件，不写 `exports`，也不发布 `.d.ts`
- B. 使用 `exports` 条件导出分别提供 `import`/`require`/`types` 入口，并把核心运行时依赖放入 `peerDependencies`
- C. 直接把 TS 源码发布到 npm，让用户自己编译
- D. 把所有依赖都打进库里，避免 peerDependencies

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

现代库发布的关键是“对外契约”：

- `exports` 让不同消费端（import/require、browser/node）命中正确入口
- `types`/类型入口保证 TS 工具链能正确拿到声明文件
- `peerDependencies` 防止宿主与库重复携带 React/Vue 等核心依赖

这套契约能显著降低“同库不同入口”“重复依赖”“类型对不上”等工程问题。

</details>

---

## 第 50 题 🔴

**类型：** 单选题  
**标签：** 工具选型 / 迁移治理

### 题目

一个大型存量企业应用（长期 webpack 体系，深度定制 loader/plugin，交付链路复杂）希望提升构建性能并控制风险。下面哪种迁移策略更稳？

**选项：**
- A. 直接全量切换到 Vite，并一次性重写所有 loader/plugin
- B. 先建立性能与稳定性基线（指标/用例），再选择兼容性更强的替换（如 webpack 升级或 Rspack/Rsbuild），按模块/页面逐步迁移
- C. 删除所有构建优化配置，让构建更简单
- D. 关闭 sourcemap 以提高性能

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

迁移的本质是“风险管理”。更稳的路线是：

- 先把目标量化（构建时间、失败率、产物体积、线上异常）
- 建立回归用例与基线
- 在兼容性与性能之间做分阶段替换

对复杂存量项目而言，“一刀切换工具”往往带来不可控的生态与交付风险；分阶段迁移更符合工程现实。

</details>
