# 第 9 章：按需加载 vs 全量加载

## 概述

Polyfill 的加载策略直接影响应用的体积和性能。本章对比 Babel 的 entry 和 usage 两种模式，帮助你选择最合适的方案。

## 一、两种策略对比

### 1.1 全量加载（entry 模式）

```javascript
// babel.config.js
{
  useBuiltIns: 'entry',
  corejs: 3
}

// 入口文件
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Babel 将替换为 targets 需要的所有 polyfill
// 不管代码是否用到
```

### 1.2 按需加载（usage 模式）

```javascript
// babel.config.js
{
  useBuiltIns: 'usage',
  corejs: 3
}

// 入口文件 - 不需要手动引入
const p = Promise.resolve(1);
[1, 2].includes(1);

// Babel 只添加代码实际使用的 polyfill
```

### 1.3 对比表

| 特性 | entry | usage |
|------|-------|-------|
| 引入方式 | 手动在入口引入 | 自动按使用添加 |
| 体积 | 较大（可能有冗余） | 较小（精准） |
| 可靠性 | 高（包含所有） | 依赖代码分析 |
| 第三方库 | 覆盖 | 可能遗漏 |

## 二、entry 模式详解

### 2.1 工作原理

```javascript
// 源代码
import 'core-js/stable';

// Babel 转换后（根据 targets: "> 0.25%"）
import "core-js/modules/es.promise";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.flat";
// ... 几十个模块
```

### 2.2 配置示例

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.25%, not dead',
      useBuiltIns: 'entry',
      corejs: '3.30'
    }]
  ]
};
```

```javascript
// src/index.js（入口文件顶部）
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 应用代码...
```

### 2.3 适用场景

| 场景 | 说明 |
|------|------|
| 大型应用 | 确保所有 polyfill 都包含 |
| 使用较多第三方库 | 库可能依赖某些 polyfill |
| 无法确定使用了哪些 API | 保险起见全量引入 |

### 2.4 优化：细粒度入口

```javascript
// 不引入全部，只引入特定类别
import 'core-js/stable/promise';
import 'core-js/stable/array';
import 'core-js/stable/object';
```

## 三、usage 模式详解

### 3.1 工作原理

```javascript
// 源代码
const p = Promise.resolve(1);
const has = [1, 2].includes(1);

// Babel 分析后自动添加
import "core-js/modules/es.promise";
import "core-js/modules/es.array.includes";

const p = Promise.resolve(1);
const has = [1, 2].includes(1);
```

### 3.2 配置示例

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.25%, not dead',
      useBuiltIns: 'usage',
      corejs: '3.30'  // 指定具体版本很重要
    }]
  ]
};
```

### 3.3 适用场景

| 场景 | 说明 |
|------|------|
| 体积敏感 | 需要最小化打包体积 |
| 代码可控 | 知道用了哪些 API |
| 现代化项目 | 不需要大量 polyfill |

### 3.4 潜在问题

```javascript
// 问题1：动态 API 调用可能检测不到
const method = 'includes';
[1, 2][method](1);  // Babel 可能检测不到

// 问题2：第三方库中的 polyfill 需求
// node_modules 默认不被 Babel 处理
// 库中用到的新 API 可能没有 polyfill
```

### 3.5 解决方案

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ],
  // 处理特定第三方库
  overrides: [{
    test: /node_modules\/some-library/,
    presets: [
      ['@babel/preset-env', {
        useBuiltIns: 'usage',
        corejs: 3
      }]
    ]
  }]
};
```

## 四、不处理 Polyfill（false）

### 4.1 配置

```javascript
// babel.config.js
{
  useBuiltIns: false  // 默认值
}
```

### 4.2 适用场景

| 场景 | 说明 |
|------|------|
| 只需要语法转换 | 目标环境已有所有 API |
| 自己管理 polyfill | 使用 polyfill.io 等服务 |
| 库开发 | 不应该包含 polyfill |

## 五、实际选择建议

### 5.1 决策流程

```
开始
  │
  ├─ 是库/SDK？
  │    └─ 是 → useBuiltIns: false + @babel/runtime
  │
  ├─ 体积敏感？
  │    └─ 是 → useBuiltIns: 'usage'
  │
  ├─ 使用大量第三方库？
  │    └─ 是 → useBuiltIns: 'entry'
  │
  └─ 默认 → useBuiltIns: 'usage'
```

### 5.2 推荐配置

**应用项目（推荐）**：
```javascript
{
  useBuiltIns: 'usage',
  corejs: '3.30'
}
```

**大型企业应用**：
```javascript
{
  useBuiltIns: 'entry',
  corejs: '3.30'
}
// 入口引入 core-js/stable
```

**库开发**：
```javascript
{
  useBuiltIns: false
}
// 配合 @babel/plugin-transform-runtime
```

## 六、体积对比实验

### 6.1 测试代码

```javascript
// 使用了几个新 API
async function main() {
  const result = await Promise.resolve([1, 2, 3]);
  console.log(result.includes(2));
  console.log(Object.fromEntries([['a', 1]]));
}
```

### 6.2 体积对比（示例数据）

| 模式 | Polyfill 体积 |
|------|---------------|
| 不使用 | 0 KB |
| usage | ~15 KB |
| entry (defaults) | ~80 KB |
| 全量 core-js | ~150 KB+ |

*注：实际体积取决于 targets 和使用的 API*

## 七、调试技巧

### 7.1 查看添加了哪些 polyfill

```javascript
// babel.config.js
{
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3,
      debug: true  // 开启调试输出
    }]
  ]
}
```

### 7.2 分析打包产物

```bash
# webpack
npx webpack --json > stats.json
npx webpack-bundle-analyzer stats.json

# Vite
npx vite-bundle-visualizer
```

## 八、总结

| 模式 | 体积 | 可靠性 | 推荐场景 |
|------|------|--------|----------|
| entry | 大 | 高 | 大型应用、多第三方库 |
| usage | 小 | 中 | 现代应用、体积敏感 |
| false | 无 | - | 库开发、自管理 polyfill |

## 参考资料

- [@babel/preset-env useBuiltIns](https://babeljs.io/docs/babel-preset-env#usebuiltins)
- [core-js 作者的建议](https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md)

---

**下一章** → [第 10 章：@babel/runtime 与 helpers](./10-babel-runtime.md)
