# 案例 2：组件库构建

## 概述

组件库（Design System / UI Kit）的构建目标与应用不同：

- 你不是交付一个站点，而是交付“可被别人集成”的产物
- 下游可能是 Vite，也可能是 webpack/Rspack，甚至是 Node SSR

因此组件库的核心不是“跑起来”，而是“产物契约稳定”：

- 输出格式（ESM/CJS）
- external/peerDependencies
- `exports` 与子路径
- tree shaking 友好（sideEffects）
- 类型声明（`.d.ts`）

这也是 Rollup 在组件库领域长期占优的原因：**输出可控、产物干净、生态成熟**。

---

## 一、业务背景与工程约束

- 组件数逐步增长（几十到上百）
- 需要主题定制（CSS Variables / CSS-in-JS / 预处理器）
- 需要发布到 npm，保证向后兼容
- 需要 Storybook/文档站（但文档站不等于库产物）

> **关键点**
>
> “组件库构建”与“组件库文档站构建”是两件事：前者强调可集成，后者强调展示与 DX。

---

## 二、推荐工具链（可用于生产）

- **库 bundler**：Rollup
- **类型声明**：`tsc --emitDeclarationOnly`
- **样式策略**（三选一）：
  - 输出独立 CSS（适合大多数库）
  - CSS-in-JS（运行时）
  - CSS Variables（主题能力强）

---

## 三、产物契约设计（先写契约再写配置）

### 3.1 package.json 的关键字段

- `peerDependencies`：React/Vue 等框架应放这里
- `exports`：明确公开入口
- `sideEffects`：正确描述副作用

示意：

```json
{
  "name": "my-ui",
  "sideEffects": ["**/*.css"],
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

> **关键点**
>
> `exports` 是你的“公开 API 面”。一旦放出，最好长期稳定。

---

## 四、构建实现：Rollup + tsc 的组合

### 4.1 为什么不让 Rollup/插件全包

- Rollup 的强项是“产物组织与 tree shaking”
- TypeScript 的强项是“类型系统与声明文件”

在生产工程里，让它们各做擅长的事，最稳定。

### 4.2 最小可维护的构建流程

1. Rollup 输出 JS（ESM/CJS）与 CSS
2. tsc 输出 `.d.ts`
3. 发布前做“下游验证”（用一个 demo app 真实 import）

---

## 五、真实项目里的两个关键决策

### 5.1 单入口 bundle vs preserveModules

- 单入口：简单、文件少
- preserveModules：更利于 tree shaking 和子路径 exports，但产物多

> **建议**
>
> 组件规模小/中时优先单入口；当你需要子路径导出与更稳定的摇树效果时再上 preserveModules。

### 5.2 样式输出策略

1. **独立 CSS 文件**（常见）
   - 下游显式引入：`import 'my-ui/dist/style.css'`

2. **CSS Variables**（主题更强）
   - 更适合需要多主题切换的设计系统

> **关键点**
>
> 样式是否算副作用，直接影响 tree shaking；因此 `sideEffects` 不能乱写。

---

## 六、发布与质量门禁（避免“能发但不敢升”）

建议在发布前做：

- API 变更记录（changesets/语义化版本）
- 类型检查与类型对齐验证
- 下游集成验证（至少一个 Vite + 一个 webpack/Rspack demo）
- 产物体积与依赖治理（避免把 peer deps 打进去）

---

## 参考资料

- [Rollup](https://rollupjs.org/)
- [Node.js - package exports](https://nodejs.org/api/packages.html#exports)
- [TypeScript - Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [css-modules](https://github.com/css-modules/css-modules)
