# 持续学习建议

## 概述

构建工具的学习很容易陷入两种极端：

- 只会“抄配置”，遇到问题就靠搜索
- 过度追新，工具一换就要推倒重来

更稳的做法是把学习目标从“记住工具”调整为“掌握不变的机制 + 用工程实践验证”。

这篇给出一套可长期执行的学习策略：你会知道该关注什么、怎么练、怎么把学习沉淀为团队资产。

---

## 一、把学习对象从“工具”转为“机制”

你需要长期掌握的核心机制只有几类：

1. **模块图**：入口、依赖边、动态 import、循环依赖
2. **解析（resolve）**：`exports`/conditions、路径别名、monorepo workspace
3. **transform 管线**：TS/JSX、兼容策略、sourcemap 串联
4. **产物策略**：chunk 拆分、runtime、缓存（hash/publicPath）
5. **开发体验**：dev server、HMR 边界、缓存与失效

> **关键点**
>
> 工具会变，但这些机制几乎不变。只要机制清楚，换工具时你只是在“换一层壳”。

---

## 二、每个月做一次“工程复盘”而不是“新闻追踪”

建议你每月做一次 30~60 分钟的复盘：

- 本月构建慢在哪？（cold start / incremental / CI）
- 本月产物问题有哪些？（chunk 404、体积回归、缓存失效）
- 本月最值得沉淀的一条规则是什么？（例如 external 规范、split 策略）

输出物：

- 一页文档：问题 → 原因 → 解决方案 → 治理规则

---

## 三、用“最小复现仓库”训练排障能力

构建问题最难的地方在于：

- 真实项目太大，变量太多

推荐你建立一个 `repro/`（或独立 repo），长期维护 5~10 个复现用例：

- tree shaking 不生效
- CJS/ESM 互操作导致 default 导入异常
- publicPath/base 配错导致 chunk 404
- sourcemap 定位偏移
- monorepo 中依赖重复版本导致包体增大

> **关键点**
>
> 能复现的问题才是可治理的问题。

---

## 四、把“测量”当成第一习惯

建议建立三类指标：

1. **构建耗时**：dev 冷启动、增量构建、CI build
2. **产物体积**：首屏关键包、最大 chunk、异步 chunk 数
3. **稳定性**：构建失败率、回滚次数、线上 chunk 404

实践建议：

- 先把 stats/profile 跑起来
- 再谈优化（否则都是“凭感觉改”）

---

## 五、关注信息源的优先级（从高到低）

1. **官方文档与迁移指南**：最权威、最少噪音
2. **Release Notes / Changelog**：知道变化点与破坏性变更
3. **Issue/PR 讨论**：了解真实边界与坑
4. **博客/短视频**：只当作线索，不当作结论

> **经验**
>
> 构建工具的“最佳实践”往往写在迁移指南与 issue 里，而不是营销文章里。

---

## 六、把学习沉淀成团队资产

对团队最有价值的沉淀不是“分享 PPT”，而是：

- 统一的构建模板（脚手架）
- 共享配置与 preset
- 质量门禁（lint/typecheck/test/build）
- 监控与报警（体积回归、构建耗时趋势）

当这些沉淀存在时，新人不需要“从零理解全部工具”，也能在正确轨道上开发。

---

## 参考资料

- [webpack - Build Performance](https://webpack.js.org/guides/build-performance/)
- [Vite - Dep pre-bundling](https://vite.dev/guide/dep-pre-bundling.html)
- [Node.js - Packages](https://nodejs.org/api/packages.html)
- [Rspack](https://rspack.rs/)
- [Rsbuild](https://v0.rsbuild.dev/)
