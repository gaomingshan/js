# 第 10 章：@babel/runtime 与 helpers

## 概述

Babel 转换代码时会注入辅助函数（helpers），默认每个文件都有一份副本。@babel/plugin-transform-runtime 可以复用这些函数，减少代码体积，同时提供不污染全局的 polyfill 方案。

## 一、问题：重复的辅助函数

### 1.1 默认行为

```javascript
// 源代码 a.js
class A {}

// 源代码 b.js
class B {}

// 转换后 a.js（每个文件都有 _classCallCheck）
function _classCallCheck(instance, Constructor) { /* ... */ }
var A = function A() { _classCallCheck(this, A); };

// 转换后 b.js（又有一份 _classCallCheck）
function _classCallCheck(instance, Constructor) { /* ... */ }
var B = function B() { _classCallCheck(this, B); };
```

### 1.2 问题

- 每个文件都有辅助函数副本
- 打包后代码冗余
- 项目越大，浪费越多

## 二、解决方案：transform-runtime

### 2.1 工作原理

```javascript
// 使用 transform-runtime 后
// 转换后 a.js
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
var A = function A() { _classCallCheck(this, A); };

// 转换后 b.js
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
var B = function B() { _classCallCheck(this, B); };

// 打包时只有一份 _classCallCheck
```

### 2.2 安装

```bash
# 开发依赖：Babel 插件
npm install -D @babel/plugin-transform-runtime

# 生产依赖：运行时库
npm install @babel/runtime
```

### 2.3 基础配置

```javascript
// babel.config.js
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true,       // 复用辅助函数
      regenerator: true    // 复用 regenerator-runtime
    }]
  ]
};
```

## 三、配置选项详解

### 3.1 helpers

```javascript
{
  helpers: true  // 默认：复用辅助函数
  helpers: false // 不复用，每个文件内联
}
```

### 3.2 regenerator

```javascript
{
  regenerator: true  // 从 runtime 引入 regenerator
  // async function 不会污染全局 regeneratorRuntime
}
```

### 3.3 corejs

```javascript
// 不使用 runtime 的 polyfill（默认）
{ corejs: false }

// 使用 runtime 的 polyfill（不污染全局）
{ corejs: 3 }

// 需要安装对应包
// npm install @babel/runtime-corejs3
```

## 四、corejs 选项详解

### 4.1 不污染全局的 polyfill

```javascript
// 配置
{
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: 3
    }]
  ]
}

// 源代码
const p = Promise.resolve(1);
[1, 2].includes(1);

// 转换后（不修改全局 Promise 和 Array.prototype）
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/includes";

const p = _Promise.resolve(1);
_includesInstanceProperty([1, 2]).call([1, 2], 1);
```

### 4.2 与 useBuiltIns 的区别

| 方式 | 修改全局 | 适用场景 |
|------|----------|----------|
| useBuiltIns: usage | ✅ 是 | 应用项目 |
| transform-runtime + corejs | ❌ 否 | 库开发 |

### 4.3 安装对应的 runtime 包

```bash
# corejs: false（默认）
npm install @babel/runtime

# corejs: 2
npm install @babel/runtime-corejs2

# corejs: 3（推荐）
npm install @babel/runtime-corejs3
```

## 五、应用项目 vs 库开发

### 5.1 应用项目配置

```javascript
// babel.config.js - 应用项目
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',  // 全局 polyfill
      corejs: 3
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true,      // 复用 helpers
      regenerator: false, // 由 preset-env 处理
      corejs: false       // 由 preset-env 处理
    }]
  ]
};
```

### 5.2 库开发配置

```javascript
// babel.config.js - 库/SDK
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true,
      regenerator: true,
      corejs: 3  // 不污染全局的 polyfill
    }]
  ]
};
```

### 5.3 为什么库不应该污染全局

```javascript
// ❌ 库使用全局 polyfill
// 问题：用户的项目可能有不同版本的 polyfill，导致冲突

// ✅ 库使用 transform-runtime
// 好处：polyfill 是私有的，不影响用户环境
```

## 六、辅助函数列表

### 6.1 常见 helpers

| 语法 | 辅助函数 |
|------|----------|
| class | _classCallCheck, _defineProperties |
| extends | _inherits, _possibleConstructorReturn |
| async/await | _asyncToGenerator |
| spread | _toConsumableArray |
| for...of | _createForOfIteratorHelper |
| ?? | _nullishCoalesce |
| ?. | _optionalChain |

### 6.2 查看生成的代码

```bash
# 编译单个文件查看
npx babel src/index.js --out-file dist/index.js
```

## 七、版本匹配

### 7.1 版本对应关系

| @babel/plugin-transform-runtime | @babel/runtime |
|---------------------------------|----------------|
| 7.x | 7.x |

```json
// package.json
{
  "devDependencies": {
    "@babel/plugin-transform-runtime": "^7.23.0"
  },
  "dependencies": {
    "@babel/runtime": "^7.23.0"  // 或 @babel/runtime-corejs3
  }
}
```

### 7.2 为什么 runtime 是生产依赖

```javascript
// @babel/runtime 在运行时需要
// 所以是 dependencies，不是 devDependencies

import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
// 运行时需要这个模块
```

## 八、实际效果对比

### 8.1 不使用 transform-runtime

```javascript
// 假设有 10 个文件使用 class
// 每个文件：~500 bytes helpers
// 总计：~5KB 冗余代码
```

### 8.2 使用 transform-runtime

```javascript
// helpers 只有一份
// @babel/runtime/helpers：~1KB
// 节省：~4KB
```

## 九、常见问题

### 9.1 报错：Cannot find module '@babel/runtime'

```bash
# 原因：没有安装 runtime
npm install @babel/runtime
# 或
npm install @babel/runtime-corejs3
```

### 9.2 与 useBuiltIns 冲突

```javascript
// ❌ 不要同时使用
{
  useBuiltIns: 'usage',
  corejs: 3
}
// 和
{
  plugins: [['@babel/plugin-transform-runtime', { corejs: 3 }]]
}

// ✅ 应用项目：useBuiltIns 处理 polyfill
// ✅ 库开发：transform-runtime 处理 polyfill
```

## 十、总结

| 场景 | helpers | corejs | regenerator |
|------|---------|--------|-------------|
| 应用项目 | true | false（用 useBuiltIns） | false |
| 库开发 | true | 3 | true |

## 参考资料

- [@babel/plugin-transform-runtime](https://babeljs.io/docs/babel-plugin-transform-runtime)
- [@babel/runtime](https://babeljs.io/docs/babel-runtime)

---

**下一章** → [第 11 章：特性检测原理](./11-feature-detection.md)
