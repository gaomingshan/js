# 老项目迁移策略

## 概述

老项目迁移构建工具最容易失败的原因是：把它当成“换一个命令”的事。

更现实的定义是：**迁移的是一整套工程语义**，包括：

- 模块解析规则（alias、exports、CJS/ESM 互操作）
- 资源管线（CSS/图片/字体/特殊 loader）
- 环境变量注入方式
- 产物结构（拆包、publicPath、runtime）
- 发布链路（CI、sourcemap 上传、监控）

迁移策略的目标应当是：**可控风险 + 可量化收益 + 可回滚**。

---

## 一、先做“迁移必要性评估”

### 1.1 你想解决什么问题

- Dev 体验慢？（冷启动、HMR、增量构建）
- CI 构建慢？（构建耗时、缓存命中率）
- 配置维护成本高？（不可理解的 loader/plugin 堆叠）
- 生态升级困难？（旧工具链阻塞升级）

> **关键点**
>
> 如果你的目标是“提速”，不一定需要迁移平台。很多时候先换编译器/开缓存/优化拆包就能拿到 80% 收益。

---

## 二、三条常见迁移路线（从保守到激进）

### 2.1 路线 A：不换平台，先把 webpack 优化到位

常见收益点：

- filesystem cache
- 并行压缩/构建
- 用 SWC/esbuild 替换部分转译
- 拆包策略与依赖治理

适合：

- 生态依赖很重
- 风险容忍度低

### 2.2 路线 B：迁移到 Rspack/Rsbuild（兼容路线）

动机：

- 尽量复用现有 webpack 生态
- 在可控迁移成本下获得性能提升

适合：

- 大型存量 webpack 项目
- loader/plugin 依赖深

### 2.3 路线 C：迁移到 Vite（范式切换）

动机：

- 获得 ESM Dev 范式带来的反馈速度
- 拥抱更现代的工程默认值

适合：

- 能接受对构建体系做“概念升级”
- webpack 历史依赖相对少

> **建议**
>
> 大型项目更常见的做法是：先路线 A/B 稳定提速；在边界清晰后再评估路线 C。

---

## 三、迁移前必须做的“基线建设”（不做就容易翻车）

### 3.1 建立可回归的对照

- 锁定依赖（lockfile）
- 记录构建输出（产物结构、hash 规则、publicPath）
- 产物体积与性能基线（bundle 分析、首屏指标）

### 3.2 建立自动化保障

- 单元测试/集成测试
- E2E（关键路径）
- CI 必跑 build + serve/preview

> **关键点**
>
> 构建迁移的风险不是“构建失败”，而是“构建成功但线上行为 subtly 变了”。测试与对照能把风险显性化。

---

## 四、迁移实施：推荐“并行跑 + 渐进切换”

### 4.1 并行运行两套构建（一段时间）

- 保留旧构建为 fallback
- 新构建先用于：开发/预发/灰度

### 4.2 先迁移“最独立”的部分

例如：

- 文档站/内部工具
- 某个子应用
- monorepo 中某个 package

### 4.3 常见差异点清单（迁移最容易踩坑）

- **资源路径**：`base/publicPath` 导致 chunk 404
- **环境变量**：Vite 的 `import.meta.env` vs webpack 的 DefinePlugin
- **CSS 行为**：CSS Modules 命名、全局样式注入顺序
- **CJS/ESM 互操作**：默认导入、`require()` 动态依赖
- **polyfill 策略**：旧浏览器兼容路径

---

## 五、回滚策略（必须提前写好）

- 一键切回旧构建产物（发布系统层面）
- 关键配置与产物规则不要一次性大改
- 迁移期间保持版本可对比（同一 commit 同时产出两套 dist）

---

## 参考资料

- [webpack - Performance](https://webpack.js.org/guides/build-performance/)
- [Vite - Migration](https://vite.dev/guide/migration)
- [Rspack](https://rspack.dev/)
- [Rsbuild](https://rsbuild.dev/)
