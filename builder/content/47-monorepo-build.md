# Monorepo 中的构建策略

## 概述

Monorepo 的难点从来不是“一个仓库放很多包”，而是：

- **依赖关系变复杂**：包之间互相引用，变更会产生连锁影响
- **构建成本变高**：全量 build 很慢，CI 成本爆炸
- **一致性要求更高**：TS/ESLint/构建配置要共享，否则维护地狱

因此 Monorepo 的构建策略核心目标是两件事：

1. **正确性**：包之间的依赖图与产物契约稳定
2. **效率**：增量构建、缓存复用、并行执行

---

## 一、先把 Monorepo 拆成两层问题

### 1.1 包管理层（workspace）

解决：

- 依赖安装与 hoist
- 本地包互相链接（workspace protocol）
- 版本与发布策略

常见组合：pnpm / yarn workspaces + changesets。

### 1.2 构建编排层（task graph）

解决：

- 谁先构建谁后构建（任务依赖图）
- 哪些任务可以跳过（增量）
- 缓存如何复用（本地/远端）

常见工具：Turborepo / Nx / Lage。

> **关键点**
>
> Monorepo 的本质是“任务图”，不是“目录结构”。

---

## 二、库包（packages）应遵循的产物契约

对于 Monorepo 里的库包（被其他包依赖的 packages），建议统一：

- 输出 ESM（必要时再补 CJS）
- `exports` 明确入口与子路径
- `.d.ts` 可用且与 JS 对齐
- `peerDependencies` 正确 external

否则你会遇到：

- 下游 bundler 的解析差异
- 重复依赖与版本冲突
- 类型漂移（源码改了但声明没跟上）

---

## 三、应用包（apps）的构建：让平台工具统一体验

对于 apps（Web 应用）建议统一使用平台工具：

- Vite 或 Rsbuild

原因：

- 开发体验一致（dev server/HMR/env）
- 默认值可治理（团队可统一最佳实践）

> **关键点**
>
> Monorepo 里最怕“每个 app 自己一套构建规则”，那会直接抵消 Monorepo 的协作收益。

---

## 四、构建编排：增量 + 缓存才是收益来源

### 4.1 为什么要增量构建

Monorepo 的变更通常是局部的：

- 改一个包，不应该重建整个仓库

因此需要：

- 根据依赖图只重建受影响的包

### 4.2 缓存的本质：把“可重现的计算”复用

任务缓存一般以输入为 key：

- 源码
- lockfile
- 环境变量
- 构建配置

只要输入不变，输出就应可复用。

> **关键点**
>
> 缓存成立的前提是构建“可重现”。如果你的构建依赖时间戳/随机数/网络请求，缓存就会失效或不可信。

---

## 五、一个可落地的策略组合（通用）

1. **库包构建**：Rollup / tsup / esbuild（统一模板与 exports 规范）
2. **应用构建**：Vite / Rsbuild（统一 dev/build/preview 命令）
3. **任务编排**：Turborepo/Nx（统一 pipeline，开启缓存）
4. **质量门禁**：
   - `tsc --noEmit`（类型检查）
   - lint/test 作为 pipeline 的前置

---

## 六、常见坑与排查方向

1. **本地没问题，CI 有问题**：
   - 是否依赖 hoist 行为？
   - 是否缺失显式依赖声明？

2. **缓存命中率很差**：
   - 是否把大量无关文件纳入 hash（例如根目录的巨型文件）？
   - 环境变量是否不稳定？

3. **包之间引用混乱**：
   - 是否缺失 exports 约束，导致 import 到内部文件？

---

## 参考资料

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo](https://turbo.build/)
- [Nx](https://nx.dev/)
- [Node.js - package exports](https://nodejs.org/api/packages.html#exports)
