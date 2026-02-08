# Rsbuild 开箱即用体验

## 概述

Rsbuild 是基于 Rspack 的“应用级构建工具”（platform/tooling layer），它的定位更接近：

- **为 Web 应用提供默认最佳实践**
- 用更少的配置，获得可用的 Dev Server、HMR、产物策略与工程能力
- 在需要时允许你下沉到 Rspack 层做深度定制

如果你把 Rspack 视为“高性能 webpack-compatible bundler”，那么 Rsbuild 更像：

- **“Rspack 之上的脚手架 + 默认配置 + 插件体系”**

---

## 一、创建项目：把默认值当成生产可用起点

### 1.1 推荐方式：create-rsbuild

```bash
npm create rsbuild@latest
# 或 pnpm/yarn/bun 对应 create 命令
```

### 1.2 Rsbuild CLI 的核心命令

- `rsbuild dev`
- `rsbuild build`
- `rsbuild preview`

```json
{
  "scripts": {
    "dev": "rsbuild dev",
    "build": "rsbuild build",
    "preview": "rsbuild preview"
  }
}
```

> **关键点**
>
> Rsbuild 的默认值覆盖了大量“通用工程问题”（入口、HTML 生成、资源处理、HMR），你应该先利用默认值，而不是一上来就把它当成 webpack 来配。

---

## 二、零配置背后做了什么（工程视角）

Rsbuild 之所以“开箱即用”，核心在于它把 bundler 的通用决策做成了默认策略：

1. **规范入口与 HTML 生成**：减少“应用壳”配置。
2. **集成开发服务器能力**：dev/preview 命令直接可用。
3. **把框架能力做成插件**：例如 React/Vue 的 HMR、JSX 编译等。

> **直觉理解**
>
> Rsbuild 不是“配置更少的 webpack”，而是把常见工程决策上移成产品化默认值。

---

## 三、一个最小但可维护的 rsbuild.config.ts

Rsbuild 会按顺序自动读取配置文件（推荐 `rsbuild.config.ts`），并提供 `defineConfig` 的类型提示。

### 3.1 React 项目最小配置

```ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    alias: {
      '@': './src',
    },
  },
});
```

### 3.2 React Fast Refresh 的一个真实细节

Rsbuild 使用 React 官方 Fast Refresh。

- 如果组件使用匿名函数导出，热更新可能无法保留 state。

> **关键点**
>
> 这类“框架开发体验”通常应该交给平台工具/插件去治理，而不是让每个项目都手写一堆 loader/plugin。

---

## 四、Rsbuild 的配置心智模型：高层配置 + 必要时下沉

Rsbuild 的配置结构可以理解为：

- **上层配置**：面向应用场景（dev/server/output/source/html/performance…）
- **底层工具透传**：必要时调整 Rspack 或其他底层工具的细节

> **关键点**
>
> 你应该优先用 Rsbuild 的“上层语义”表达意图；只有当上层不覆盖你的需求时，才下沉到工具层。

---

## 五、适用场景与边界

### 5.1 适用场景

1. 新建 Web 应用，希望快速得到稳定的工程体验。
2. 团队希望统一构建策略与默认规范（减少项目之间差异）。
3. 需要 webpack 风格的产物控制，但又不想维护繁杂配置。

### 5.2 边界与取舍

- 如果你有强烈的“自定义 bundler 管线”需求，最终仍可能要深入理解 Rspack/webpack 的底层。
- Rsbuild 解决的是“平台层问题”，不是替你解决业务架构问题。

---

## 参考资料

- [Rsbuild Quick Start](https://v0.rsbuild.dev/guide/start/quick-start)
- [Configure Rsbuild](https://v0.rsbuild.dev/guide/basic/configure-rsbuild)
- [Rsbuild React Guide](https://v0.rsbuild.dev/guide/framework/react)
- [@rsbuild/plugin-react](https://v0.rsbuild.dev/plugins/list/plugin-react)
