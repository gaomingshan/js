# Rollup 的优势与局限

## 概述

Rollup 最常被推荐用于“库构建”，但真正的原因不是一句“它更适合库”，而是它的设计取舍非常明确：

- 强优化（Tree Shaking、产物干净）
- 强输出能力（多格式、多入口策略）
- 弱应用开发体验（Dev Server/HMR 不是它的主场）

---

## 一、Rollup 的优势

### 1.1 Tree Shaking 体验好

- ESM-first 的设计让静态分析更自然
- 对“导出/导入边界清晰”的代码，产物通常更小

### 1.2 产物更“库友好”

库构建常见诉求：

- 输出 `es` 供下游 Tree Shaking
- 输出 `cjs` 兼容 Node.js 生态
- external 掉 peer deps（避免重复打包）

Rollup 在这类场景下配置路径清晰。

### 1.3 插件体系清晰

插件钩子围绕“解析/加载/转换/输出”展开，便于理解与组合。

---

## 二、Rollup 的局限

### 2.1 不提供完整的应用级开发体验

Rollup 有 watch，但它并不是一个以 Dev Server/HMR 为核心的工具。

应用开发常见的体验需求：

- 秒级冷启动
- HMR 边界与框架集成
- 静态资源处理约定

通常需要上层工具补齐（例如 Vite）。

### 2.2 “什么都能插件化”也意味着你要自己做组合

库构建看起来简单，但当你加入：

- CSS 处理
- 多入口
- 生成 `.d.ts`
- 兼容不同运行时（browser/node）

你仍需要谨慎设计插件组合与输出策略。

### 2.3 对非 ESM 输入的处理需要额外插件

现实世界里仍有 CJS 包，Rollup 通常需要 `@rollup/plugin-commonjs` 等来处理互操作。

> **关键点**
>
> Rollup 并不是“不支持 CJS”，而是它的优势来自 ESM；处理 CJS 会让分析与优化更保守。

---

## 三、什么时候用 Rollup

更适合：

- 库/SDK/组件库
- 希望输出干净、格式多样的产物
- 希望下游（应用）能更好地 Tree Shaking

不太适合（单独使用时）：

- 以开发体验为核心诉求的应用项目
- 需要强约定与开箱即用的团队

---

## 四、实践建议

1. **库优先输出 ESM**：让下游 bundler 做更好的优化。
2. **external 掉 peerDependencies**：避免重复打包与版本冲突。
3. **先明确产物目标**：再决定插件链（别让插件链反推产物）。

---

## 参考资料

- [Rollup - Command Line Interface](https://rollupjs.org/command-line-interface/)
- [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs)
- [@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve)
