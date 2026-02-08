# Rollup 打包组件库

## 概述

组件库/SDK 的构建目标与应用不同：

- 应用：追求“用户体验”（首屏、缓存、路由拆包）
- 组件库：追求“下游好用”（tree shaking、格式兼容、类型声明、可控的外部依赖）

Rollup 适合组件库的原因在于：

- ESM-first，tree shaking 体验好
- 输出更“干净”，可控多格式产物
- 插件体系清晰，适合组合出稳定的发布产物

这篇给你一套可用于生产的组件库构建方案（精简但完整）。

---

## 一、组件库构建的“产物契约”（先写需求再写配置）

在开始写 Rollup 配置前，建议先把以下问题写成 checklist：

1. **要输出哪些格式**：ESM / CJS /（可选 UMD）？
2. **入口长什么样**：只允许从 `my-lib` 导入，还是允许 `my-lib/button`？
3. **哪些依赖 external**：`peerDependencies` 是否必须 external（通常是）？
4. **是否有样式**：输出独立 CSS？还是交给下游处理？
5. **类型声明**：`.d.ts` 怎么生成与发布？

> **关键点**
>
> 组件库构建的难点往往不在 bundler，而在“对外契约”是否清晰。

---

## 二、推荐目录结构（真实项目可落地）

```text
my-ui/
├── src/
│   ├── index.ts              # 统一出口
│   ├── button/
│   │   ├── index.ts
│   │   └── Button.tsx
│   └── styles/
│       └── index.css
├── rollup.config.mjs
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

建议：

- `src/index.ts` 只做 re-export（保持入口干净）
- 每个组件有独立目录，方便未来做子路径 exports

---

## 三、package.json：把“对外契约”写清楚（非常重要）

### 3.1 推荐写法：使用 `exports`

```json
{
  "name": "my-ui",
  "version": "0.1.0",
  "sideEffects": ["**/*.css"],
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

- `peerDependencies`：通常 external（不要打进产物）
- `sideEffects`：组件库常有 CSS 副作用，建议至少把 CSS 标出来

> **关键点**
>
> `exports` 能限制用户 import 到内部文件，从而让你未来重构不破坏用户代码。

---

## 四、构建策略：两种常见方案

### 4.1 方案 A：单入口打成一个 ESM + 一个 CJS

优点：

- 最简单，下游使用一致
- 适合中小型组件库

缺点：

- 下游 tree shaking 依赖 bundler 的分析效果

### 4.2 方案 B：`preserveModules` 保留模块结构（更库友好）

优点：

- 更有利于下游 tree shaking
- 可配合 `exports` 做子路径导出

缺点：

- 输出文件更多
- 你需要更明确的 exports 规划

这篇以“方案 A”为主，最后给出 preserveModules 的扩展点。

---

## 五、Rollup 配置（方案 A：可直接用）

### 5.1 rollup.config.mjs（示意）

```js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

const external = ['react', 'react-dom'];

export default {
  input: 'src/index.ts',
  external,
  output: [
    { file: 'dist/index.mjs', format: 'esm', sourcemap: true },
    { file: 'dist/index.cjs', format: 'cjs', sourcemap: true, exports: 'named' }
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.build.json' }),
    postcss({ extract: 'style.css' }),
    terser()
  ]
};
```

### 5.2 为什么这么配（要点解释）

- `external`：避免把 React 打进产物（避免重复与冲突）
- `postcss({ extract })`：输出独立 CSS，用户可以 `import 'my-ui/dist/style.css'`
- `terser()`：生产压缩（库也建议压缩，减少下游成本）

---

## 六、类型声明（d.ts）：建议用 tsc 单独生成

Rollup 不等价于 TS 编译器。生产实践通常是：

- Rollup：构建 JS/CSS 产物
- tsc：生成 `.d.ts`

例如脚本：

```json
{
  "scripts": {
    "build": "rollup -c && tsc -p tsconfig.build.json --declaration --emitDeclarationOnly --outDir dist"
  }
}
```

> **关键点**
>
> 类型声明是库的“公共 API 文档”，必须稳定。

---

## 七、扩展：需要子路径导出时怎么做（方向，不展开）

当你希望：

```js
import { Button } from 'my-ui';
import { Button } from 'my-ui/button';
```

通常会：

- 用 `preserveModules: true` 输出目录结构
- 在 `exports` 里声明子路径

这属于“更工程化”的库发布策略，建议在项目规模稳定后再引入。

---

## 参考资料

- [Rollup](https://rollupjs.org/)
- [@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve)
- [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs)
- [Node.js - package exports](https://nodejs.org/api/packages.html#exports)
- [TypeScript - Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
