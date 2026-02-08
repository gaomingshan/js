# Rollup 高级配置

## 概述

当组件库从“能发布”走向“可长期维护”，你会逐步遇到更工程化的需求：

- 多入口/子路径导出
- 更稳定的 tree shaking（副作用语义、模块边界）
- 更可控的 external（peer deps、node built-ins）
- 类型声明 bundling、产物体积分析

这篇聚焦：Rollup 在库构建里常用的高级能力与可落地的配置范式。

---

## 一、external 的工程化写法：自动 external peerDependencies

### 1.1 为什么要自动化

手写 external 很容易漏：

- 漏了会把依赖打进产物
- 下游可能出现重复依赖、体积膨胀、版本冲突

### 1.2 一个常见写法（示意）

```js
import pkg from './package.json' assert { type: 'json' };

const peerDeps = Object.keys(pkg.peerDependencies || {});

export default {
  external: (id) => peerDeps.includes(id) || peerDeps.some((d) => id.startsWith(`${d}/`))
};
```

> **关键点**
>
> external 的边界，本质是在定义“库与外部世界的契约”。

---

## 二、`preserveModules`：让库更 tree-shaking 友好

### 2.1 什么时候需要它

当你希望：

- 下游能按模块粒度 tree shaking
- 你希望提供子路径 exports（`my-lib/button`）

### 2.2 典型配置（示意）

```js
export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist/esm',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: true
  }
};
```

优点：

- 输出结构更贴近源码
- 下游 bundler 更容易摇掉未用模块

代价：

- 输出文件变多
- 你必须把 `exports` 规划好

---

## 三、tree shaking 的现实：副作用语义要一起设计

### 3.1 package.json 的 sideEffects

- 纯 JS 库：可考虑 `sideEffects: false`
- 组件库往往有 CSS：建议把 CSS 标为副作用（避免误删）

```json
{ "sideEffects": ["**/*.css"] }
```

### 3.2 Rollup 的 treeshake 选项（了解即可）

```js
export default {
  treeshake: {
    moduleSideEffects: false
  }
};
```

> **关键点**
>
> tree shaking 的上限很多时候取决于“你依赖的包输出形态”，不是 Rollup 单方面决定。

---

## 四、类型声明：用 `rollup-plugin-dts` 合并类型（可选）

### 4.1 什么时候需要合并

- 你希望对外只暴露一个 `index.d.ts`
- 你有多入口或 preserveModules，类型文件可能很多

### 4.2 常见策略

- 先用 `tsc --emitDeclarationOnly` 生成 `.d.ts`
- 再用 dts 插件合并（可选）

> **建议**
>
> 类型合并属于“对外体验优化”，不是第一优先级。先保证类型正确与稳定。

---

## 五、输出质量：sourcemap、banner、exports/interop

### 5.1 sourcemap

- 库也建议输出 sourcemap：下游报错时更可定位
- 注意发布时是否需要保留/如何上传（看团队策略）

### 5.2 banner（例如许可证）

```js
output: {
  banner: '/* my-lib v1.0.0 */'
}
```

### 5.3 exports/interop

- CJS 输出时常用 `exports: 'named'`
- 互操作细节会影响下游的 `default` 导入行为

> **关键点**
>
> 库构建里“互操作细节”非常现实，建议在发布前用一个下游 demo 项目验证导入方式。

---

## 六、常见踩坑与排查顺序

1. **下游 tree shaking 不生效**：
   - 检查是否输出 ESM
   - 检查 sideEffects 标注
   - 检查依赖是否 CJS 或含副作用

2. **产物把 peer deps 打进去了**：
   - external 是否正确
   - `id.startsWith('react/')` 这类子路径是否漏掉

3. **CSS 被摇掉/样式丢失**：
   - sideEffects 是否误标为 false

---

## 参考资料

- [Rollup - Configuration Options](https://rollupjs.org/configuration-options/)
- [Rollup - Output Options](https://rollupjs.org/configuration-options/#output)
- [Node.js - package exports](https://nodejs.org/api/packages.html#exports)
- [TypeScript - Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
