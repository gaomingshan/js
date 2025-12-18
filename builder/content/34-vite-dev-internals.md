# Vite 开发阶段原理

## 概述

Vite 的开发体验之所以快，核心不是“换了个更快的压缩器”，而是**改变了开发期的交付模型**：

- 传统 bundle-first：Dev 先生成 bundle/chunk，再交给浏览器
- Vite：Dev 让浏览器用原生 ESM 按需请求模块，服务端再按需 transform

理解 Vite Dev 的关键抓 4 个点：

- 请求驱动的模块加载
- 依赖预构建（pre-bundling）
- 模块图（module graph）与缓存
- HMR 边界如何计算

---

## 一、请求驱动：浏览器决定“我要哪个模块”

### 1.1 最简流程图

```text
浏览器
  请求 /src/main.ts
    ↓
Vite dev server
  resolve + transform(main.ts)
    ↓
返回 JS（含 import）
    ↓
浏览器继续请求依赖模块
```

### 1.2 这带来的直接收益

- 冷启动不需要生成完整 bundle
- 改动某个模块，只需要让相关模块缓存失效

> **关键点**
>
> Vite Dev 的“最小增量单位”更接近模块（module），而不是 chunk。

---

## 二、依赖预构建：No-Bundle 的现实折中

### 2.1 为什么需要预构建

浏览器原生 ESM 有两个现实约束：

- 不识别裸导入：`import React from 'react'`
- 依赖模块可能非常碎，导致请求数量爆炸

### 2.2 预构建在做什么（概念版）

- 扫描入口依赖
- 把第三方依赖转换/合并成更适合浏览器加载的形态
- 重写 import specifier，让浏览器能请求到对应 URL

> **直觉理解**
>
> Vite 的 No-Bundle 主要是“不对业务源码整体打包”；依赖本身通常仍会被“打粗”。

---

## 三、模块图与缓存：让 HMR 可控、让 Dev 速度稳定

### 3.1 模块图（module graph）是什么

可以把它理解成：

- 每个模块是谁导入的（importers）
- 它导入了谁（imported modules）
- 它的转换结果与依赖版本（用于缓存与失效）

### 3.2 为什么模块图是 HMR 的基础

当某个文件变更时：

- Vite 根据模块图找到受影响的模块集合
- 计算 HMR 边界（哪些模块可以被替换，哪些需要整页刷新）

> **关键点**
>
> HMR 不是“永远不刷新”，而是“在可证明安全的边界内替换模块”。

---

## 四、HMR 的边界：工具与框架共同决定

### 4.1 Vite 的角色

- 发现变更
- 计算受影响模块
- 通过 websocket 推送更新

### 4.2 框架的角色

以 React 为例：

- React Fast Refresh 决定“如何替换组件并尽量保留状态”

因此你会看到：

- 某些改动热更新
- 改动导出形态/副作用边界时触发整页刷新

---

## 五、常见性能瓶颈与调优方向（Dev）

### 5.1 依赖预构建过慢或频繁失效

可能原因：

- 依赖版本频繁变化（lockfile 波动）
- 某些依赖被错误纳入优化或排除

调优方向：

- 通过 `optimizeDeps.include/exclude` 控制预构建范围
- 避免在本地开发频繁清理缓存（除非定位问题）

### 5.2 插件链过重

- 每个 `transform` 都会过插件链
- 插件做 AST 级重写会显著拉慢 HMR

调优方向：

- 把重任务挪到 Build 阶段
- 对 dev/build 分别启用插件（如果语义允许）

### 5.3 类型检查拖慢反馈

- TS 类型检查应当作为独立步骤（`tsc --noEmit`）
- Dev 阶段追求速度时，不建议把类型检查塞进 transform 流水线

---

## 参考资料

- [Vite - Why Vite](https://vite.dev/guide/why.html)
- [Vite - Dep pre-bundling](https://vite.dev/guide/dep-pre-bundling.html)
- [Vite - Plugin API](https://vite.dev/guide/api-plugin)
