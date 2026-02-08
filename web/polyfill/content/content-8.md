# core-js 详解

## 核心概念

**core-js** 是一个**模块化的标准库 Polyfill 集合**，提供了 ECMAScript 所有标准特性的 JavaScript 实现。

是目前最流行、最完整的 Polyfill 解决方案。

---

## core-js 的作用

### 覆盖范围

```
ECMAScript 特性（ES5 - ES2023+）
├── Promise、async/await
├── Array.prototype.includes、flat、flatMap
├── Object.assign、Object.entries、Object.fromEntries
├── String.prototype.includes、startsWith、endsWith
├── Symbol、BigInt
├── Map、Set、WeakMap、WeakSet
├── Proxy、Reflect
└── ... 数百个 API
```

---

## core-js@2 vs core-js@3

### 版本对比

| 特性 | core-js@2 | core-js@3 |
|------|-----------|-----------|
| **维护状态** | ❌ 已停止维护（2018） | ✅ 持续更新 |
| **ECMAScript 支持** | ES5 - ES2017 | ES5 - ES2023+ |
| **包大小** | ~80 KB | ~90 KB |
| **模块化** | 较差 | ✅ 完全模块化 |
| **提案支持** | 部分 | ✅ 完整 Stage 3+ |
| **推荐度** | ❌ 不推荐 | ✅ 推荐 |

---

### core-js@3 新增特性

**ES2019+**：
```javascript
// Array.prototype.flat / flatMap
[1, [2, [3]]].flat(2); // [1, 2, 3]
[1, 2, 3].flatMap(x => [x, x * 2]); // [1, 2, 2, 4, 3, 6]

// Object.fromEntries
Object.fromEntries([['a', 1], ['b', 2]]); // { a: 1, b: 2 }

// String.prototype.trimStart / trimEnd
'  hello  '.trimStart(); // 'hello  '

// Promise.allSettled
Promise.allSettled([p1, p2, p3]);

// globalThis
globalThis.setTimeout(() => {});
```

---

## 按需引入策略

### 1. 全量引入（不推荐）

```javascript
import 'core-js';

// 优势：一次性引入所有 Polyfill
// 劣势：包体积巨大（~90 KB），现代浏览器不需要
```

---

### 2. 按特性引入

```javascript
// 引入 Promise
import 'core-js/features/promise';

// 引入 Array.prototype.includes
import 'core-js/features/array/includes';

// 引入 Object.assign
import 'core-js/features/object/assign';
```

**优势**：体积小，可控
**劣势**：需要手动维护

---

### 3. 按模块引入

```javascript
// 引入所有 Array 方法
import 'core-js/features/array';

// 引入所有 Promise 相关
import 'core-js/features/promise';

// 引入所有 Symbol 相关
import 'core-js/features/symbol';
```

---

### 4. Babel 自动注入（推荐）✅

```javascript
// babel.config.js
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3
    }]
  ]
}

// 源码（无需手动导入）
Promise.resolve(42);
[1, 2, 3].includes(2);

// Babel 自动注入
import "core-js/modules/es.promise.js";
import "core-js/modules/es.array.includes.js";
Promise.resolve(42);
[1, 2, 3].includes(2);
```

---

## 与 Babel 的集成

### 配置示例

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.5%, last 2 versions, not dead',
      useBuiltIns: 'usage', // 自动按需注入
      corejs: {
        version: 3,
        proposals: true // 启用提案特性
      }
    }]
  ]
};
```

**安装依赖**：
```bash
npm install --save core-js@3
npm install --save-dev @babel/core @babel/preset-env
```

---

### 自动注入流程

**1. Babel 扫描代码**：
```javascript
Promise.resolve(42);
[1, 2, 3].flat();
```

**2. 查询目标环境支持情况**：
```
Chrome 80: Promise ✅, flat ✅
IE 11: Promise ❌, flat ❌
```

**3. 注入必要的 Polyfill**：
```javascript
import "core-js/modules/es.promise.js";
import "core-js/modules/es.array.flat.js";
Promise.resolve(42);
[1, 2, 3].flat();
```

---

## 体积优化：tree-shaking 支持

### core-js@3 的模块化

**特点**：每个 Polyfill 都是独立模块

```
core-js/
├── modules/
│   ├── es.promise.js           (~6 KB)
│   ├── es.array.includes.js    (~1 KB)
│   ├── es.object.assign.js     (~0.5 KB)
│   └── ... (数百个独立模块)
```

---

### Tree Shaking 效果

**示例**：只使用 Promise 和 includes

```javascript
// 源码
Promise.resolve(42);
[1, 2, 3].includes(2);

// 打包结果
import "core-js/modules/es.promise.js";        // 6 KB
import "core-js/modules/es.array.includes.js"; // 1 KB
// 总计：7 KB（而非 90 KB）
```

**优化率**：92% 体积减少

---

## 全局污染 vs 局部导入

### 1. 全局污染（默认）

**行为**：修改全局对象的原型

```javascript
import 'core-js/features/array/includes';

// 修改全局 Array.prototype
[1, 2, 3].includes(2); // ✓

// 问题：可能与其他库冲突
```

**适用**：应用开发（非库开发）

---

### 2. 局部导入（pure 版本）

**行为**：不修改全局对象

```javascript
import includes from 'core-js-pure/features/array/includes';
import assign from 'core-js-pure/features/object/assign';

// 使用
includes([1, 2, 3], 2); // true
assign({}, { a: 1 }, { b: 2 }); // { a: 1, b: 2 }
```

**优势**：
- ✅ 不污染全局
- ✅ 适合库开发
- ✅ 避免冲突

**劣势**：
- ❌ 语法不一致
- ❌ 需要手动管理

---

## 提案特性支持

### 启用 proposals

```javascript
// babel.config.js
{
  "presets": [
    ["@babel/preset-env", {
      "corejs": {
        "version": 3,
        "proposals": true // 启用 Stage 3+ 提案
      }
    }]
  ]
}
```

---

### Stage 3 提案示例

```javascript
// String.prototype.replaceAll（已进入标准）
'aabbcc'.replaceAll('a', 'x'); // 'xxbbcc'

// Array.prototype.at（已进入标准）
[1, 2, 3].at(-1); // 3

// Promise.any（已进入标准）
Promise.any([p1, p2, p3]);
```

**注意**：提案特性可能变化，谨慎使用

---

## 实战案例：包体积优化

### 优化前

**配置**：
```javascript
// ❌ 全量引入
import 'core-js';
```

**结果**：
- 包体积：500 KB
- core-js：90 KB（18%）
- 加载时间：+500ms

---

### 优化后

**配置**：
```javascript
// ✅ 按需注入
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3,
      "targets": "> 0.5%, last 2 versions, not dead"
    }]
  ]
}
```

**结果**：
- 包体积：420 KB
- core-js：10 KB（2%）
- 加载时间：+100ms

**优化效果**：
- 体积减少 80 KB（16%）
- 加载时间减少 400ms（80%）

---

## 常见陷阱

### ❌ 陷阱 1：版本不匹配

```javascript
// package.json
{
  "dependencies": {
    "core-js": "^2.6.0" // 错误：使用 core-js@2
  }
}

// babel.config.js
{
  "corejs": 3 // 配置 core-js@3
}

// 报错：无法找到 core-js@3 模块
```

**解决**：
```bash
npm uninstall core-js
npm install --save core-js@3
```

---

### ❌ 陷阱 2：忘记安装 core-js

```javascript
// babel.config.js
{
  "useBuiltIns": "usage",
  "corejs": 3
}

// 报错
Cannot find module 'core-js/modules/es.promise.js'
```

**解决**：
```bash
npm install --save core-js@3
```

---

### ❌ 陷阱 3：全量引入后再配置按需

```javascript
// ❌ 错误
import 'core-js'; // 全量引入

// babel.config.js
{
  "useBuiltIns": "usage" // 按需注入（无效）
}

// 结果：全量和按需都引入，重复
```

**解决**：移除 `import 'core-js'`，仅使用 Babel 自动注入

---

## 高级配置：分离运行时

### @babel/plugin-transform-runtime

**问题**：Babel 辅助函数重复

```javascript
// 多个文件使用 async/await
// file1.js
async function foo() {}

// file2.js
async function bar() {}

// 编译后：每个文件都包含 _asyncToGenerator 辅助函数（重复）
```

---

### 解决方案

```bash
npm install --save @babel/runtime-corejs3
npm install --save-dev @babel/plugin-transform-runtime
```

**配置**：
```javascript
// babel.config.js
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3
    }]
  ],
  "plugins": [
    ["@babel/plugin-transform-runtime", {
      "corejs": false, // Polyfill 由 preset-env 处理
      "helpers": true, // 复用辅助函数
      "regenerator": true // 复用 regenerator
    }]
  ]
}
```

**效果**：
- 辅助函数从重复变为引用
- 包体积减少 10-30 KB

---

## 调试技巧

### 查看注入的 Polyfill

**方法 1**：Babel debug 模式
```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "debug": true
    }]
  ]
}
```

**输出**：
```
Using polyfills with `usage` option:
  es.promise { "ie":"11" }
  es.array.includes { "ie":"11" }
  es.object.assign { "ie":"11" }
```

---

### 方法 2：webpack-bundle-analyzer

```bash
npm install --save-dev webpack-bundle-analyzer
```

**查看 core-js 占比**：
- 可视化展示每个模块的大小
- 识别不必要的 Polyfill

---

## 库开发推荐：core-js-pure

### 为什么使用 pure 版本

**问题**：库不应污染用户的全局环境

```javascript
// ❌ 库开发错误
import 'core-js/features/array/includes';

export function myLibFunc() {
  return [1, 2, 3].includes(2);
}
// 问题：修改了用户环境的 Array.prototype
```

---

### 正确做法

```bash
npm install --save core-js-pure
```

```javascript
// ✅ 库开发正确
import includes from 'core-js-pure/features/array/includes';

export function myLibFunc() {
  return includes([1, 2, 3], 2);
}
// 不污染全局，仅库内使用
```

---

## 实战配置模板

### 现代前端项目

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.5%, last 2 versions, not dead',
      useBuiltIns: 'usage',
      corejs: {
        version: 3,
        proposals: false // 生产环境不启用提案
      },
      modules: false // Webpack tree-shaking
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: false,
      helpers: true,
      regenerator: true
    }]
  ]
};
```

---

### Node.js 项目

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' },
      useBuiltIns: 'usage',
      corejs: 3,
      modules: 'commonjs'
    }]
  ]
};
```

---

## 关键要点

1. **core-js@3**：最新、最完整的 Polyfill 集合
2. **按需注入**：配合 Babel 的 `useBuiltIns: 'usage'` 体积最优
3. **模块化**：每个 Polyfill 独立模块，支持 tree-shaking
4. **全局 vs pure**：应用开发用全局版，库开发用 pure 版
5. **版本匹配**：确保 core-js 包版本与配置一致

---

## 下一步

下一章节将学习 **Polyfill 服务化方案**，理解动态 CDN 服务的原理与应用。
