# esbuild 用于库构建

## 概述

用 esbuild 构建库（library/SDK）在真实项目里非常常见，因为它能把“构建时间”和“配置复杂度”显著降低。

但要做到“可用于生产”，你需要明确库构建的几个硬要求：

- 输出格式：至少 ESM（可选 CJS）
- external：正确处理 `peerDependencies`
- 类型声明：`.d.ts` 的生成与发布
- `exports`：清晰的入口与子路径
- tree shaking 友好：副作用语义（`sideEffects`）

这篇给出一套**可直接套用**的 esbuild 库构建方案（精简但完整）。

---

## 一、推荐的库项目结构

```text
my-lib/
├── src/
│   ├── index.ts
│   └── utils.ts
├── scripts/
│   └── build.mjs
├── package.json
├── tsconfig.json
└── README.md
```

> **关键点**
>
> 库构建的关键在“产物契约”（exports/types/sideEffects），而不是 bundler 本身。

---

## 二、产物目标：同时输出 ESM + CJS

### 2.1 build 脚本（示意，可落地）

```js
// scripts/build.mjs
import esbuild from 'esbuild';

const shared = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  sourcemap: true,
  minify: true,
  target: ['es2018'],
  external: ['react'],
};

// ESM
await esbuild.build({
  ...shared,
  format: 'esm',
  outfile: 'dist/index.mjs'
});

// CJS
await esbuild.build({
  ...shared,
  format: 'cjs',
  outfile: 'dist/index.cjs'
});
```

### 2.2 为什么要 external（非常重要）

如果你的库以 React 为 peer dependency：

- 你不应该把 React 打进产物
- 否则下游会出现重复依赖、版本冲突、体积膨胀

所以应该：

- `peerDependencies` → external

---

## 三、package.json：把“对外契约”写清楚

### 3.1 exports（建议使用）

```json
{
  "name": "my-lib",
  "version": "0.1.0",
  "sideEffects": false,
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
> `exports` 是库的“公开 API 面”。它能限制用户 import 到未发布的内部文件，从而提升可维护性。

### 3.2 sideEffects（谨慎标注）

- 如果你的库没有副作用（纯函数、纯组件导出），可以标注 `false`，帮助下游 tree shaking。
- 如果你有样式注入、全局注册、polyfill 等副作用，**不要误标**。

---

## 四、类型声明：不要指望 esbuild 生成 d.ts

esbuild 不等价于 TypeScript 编译器，它不会生成 `.d.ts`。

真实项目常用做法：

- 代码用 esbuild 构建
- 类型用 `tsc` 生成

### 4.1 生成类型（示意）

```json
{
  "scripts": {
    "build": "node scripts/build.mjs && tsc -p tsconfig.json --declaration --emitDeclarationOnly --outDir dist"
  }
}
```

> **提示**
>
> 你可以用单独的 `tsconfig.build.json` 专门生成声明，避免与应用 tsconfig 混在一起。

---

## 五、库构建常见坑（与 esbuild 无关，但经常发生）

1. **把 peer deps 打进产物**：导致体积与冲突问题。
2. **exports 缺失**：用户能 import 到内部文件，升级难。
3. **sideEffects 误标**：下游 tree shaking 误删导致功能缺失。
4. **只输出 CJS**：现代 bundler 下 tree shaking 效果差。

---

## 六、何时不要用 esbuild 直接构建库

- 需要非常复杂的多入口、多格式、多平台产物策略
- 需要大量 Rollup 插件生态（例如复杂 CSS/资源处理链）

这类情况更适合：

- Rollup（库构建主场）

---

## 参考资料

- [esbuild](https://esbuild.github.io/)
- [Node.js - package exports](https://nodejs.org/api/packages.html#exports)
- [TypeScript - Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
