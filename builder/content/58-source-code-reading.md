# 构建工具源码学习

## 概述

读构建工具源码的价值不在“背 API”，而在于你能建立**更稳定的心智模型**：

- 为什么它快/慢？瓶颈在哪里？
- 为什么某个配置/插件会影响拆包与缓存？
- 为什么某些边界问题（HMR、sourcemap、CJS/ESM 互操作）总是反复出现？

当你能在源码里把这些问题定位到“哪一层负责”，你就从“会用”进入了“能治理”。

---

## 一、读源码前：先把问题写成“可验证的假设”

不要从“随便翻”开始。推荐先准备：

1. **复现仓库**：最小复现（最少文件、最少依赖）。
2. **一个可观察指标**：
   - Dev：冷启动、HMR、transform 次数
   - Build：build 时间、chunk 数、产物体积
3. **一个假设**：例如“这里慢是因为每次都在重新构建依赖图”。

> **关键点**
>
> 没有复现与指标，读源码很容易变成信息堆积。

---

## 二、通用阅读路径：从 CLI 到核心数据结构

不管是 Vite/webpack/Rollup/Rspack，入口通常都类似：

```text
CLI command
  ↓
load config
  ↓
create compiler/server
  ↓
build module graph
  ↓
transform
  ↓
chunk / generate assets
```

推荐顺序：

1. **CLI（命令入口）**：
   - 参数如何映射到配置？
   - dev/build/preview 分别走什么路径？

2. **配置解析与默认值**：
   - 默认值在哪里合并？（这决定“开箱即用”的边界）

3. **核心数据结构**：
   - Module Graph / Chunk Graph
   - HMR 的依赖边与失效边界

4. **插件系统**：
   - 哪些生命周期暴露给插件？
   - 插件如何改变解析/transform/产物？

---

## 三、抓住 3 个“高价值模块”（比全读更重要）

### 3.1 解析（resolve）

你要搞清楚：

- 一个 import specifier 如何变成最终文件路径
- `package.json` 的 `exports`/`module`/`main` 如何参与决策

解析层的差异往往导致：

- “同一个包在不同工具里产物不同”
- “为什么 tree shaking 失效（导入到 CJS 入口）”

### 3.2 transform 管线

你要搞清楚：

- 哪些文件被 transform？
- transform 的 cache key 是什么？
- sourcemap 如何串起来？

### 3.3 bundling / generate

你要搞清楚：

- chunk 是如何生成的（split 策略在哪里）
- runtime 注入在哪里发生
- asset 输出结构如何决定部署契约（publicPath/base）

---

## 四、如何高效定位：别靠“读”，要靠“追踪”

### 4.1 代码检索优先

- 搜命令：`createServer` / `build` / `compiler.run`
- 搜关键对象：`moduleGraph` / `chunkGraph` / `pluginContainer`
- 搜关键行为：`transformRequest` / `load` / `resolveId`

### 4.2 用日志与断点做“动态阅读”

建议：

- 在关键边界打印：输入/输出/耗时
- 用 Node inspector 或 IDE 断点跟一条请求路径

> **关键点**
>
> 对构建工具来说，“一条请求路径”往往比“读一个目录”更能建立整体感。

---

## 五、一个实用的阅读模板（你可以照抄）

每当你读到一个核心模块，记录四件事：

1. **输入是什么**（来自哪里）
2. **输出是什么**（给谁用）
3. **缓存在哪里**（key 是什么，何时失效）
4. **扩展点在哪里**（插件/钩子）

这四件事几乎覆盖了构建系统的主要矛盾。

---

## 参考资料

- [Vite (GitHub)](https://github.com/vitejs/vite)
- [webpack (GitHub)](https://github.com/webpack/webpack)
- [Rollup (GitHub)](https://github.com/rollup/rollup)
- [esbuild (GitHub)](https://github.com/evanw/esbuild)
- [Rspack (GitHub)](https://github.com/web-infra-dev/rspack)
- [Tapable (webpack plugin hooks)](https://github.com/webpack/tapable)
