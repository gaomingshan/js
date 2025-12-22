# 第 8 章：core-js 深入解析

## 概述

core-js 是最全面的 JavaScript 标准库 Polyfill 集合，被 Babel 官方推荐使用。理解 core-js 的模块结构和使用方式，是优化 Polyfill 体积的关键。

## 一、core-js 是什么

### 1.1 定位

```
core-js = ECMAScript 标准库 Polyfill 集合
        + 部分 Web 标准 Polyfill
        + 提案阶段特性支持
```

### 1.2 覆盖范围

| 类别 | 示例 |
|------|------|
| ES6+ 新增类型 | Promise, Symbol, Map, Set, WeakMap |
| 数组方法 | includes, find, flat, flatMap, at |
| 对象方法 | assign, entries, fromEntries |
| 字符串方法 | includes, padStart, replaceAll |
| 提案特性 | Array.prototype.group, Promise.withResolvers |

### 1.3 不包含的内容

```javascript
// core-js 不包含这些（需要单独的 polyfill）
fetch()                  // → whatwg-fetch
IntersectionObserver     // → intersection-observer
ResizeObserver           // → resize-observer-polyfill
Web Animations API       // → web-animations-js
```

## 二、版本与包

### 2.1 core-js 3 vs 2

| 版本 | 状态 | 说明 |
|------|------|------|
| core-js@3 | 当前版本 | 推荐使用 |
| core-js@2 | 已废弃 | 不再维护 |

### 2.2 三种包

```bash
npm install core-js          # 全局 polyfill（修改全局）
npm install core-js-pure     # 纯净版（不污染全局）
npm install core-js-bundle   # 编译好的单文件
```

| 包 | 修改全局 | 适用场景 |
|----|----------|----------|
| core-js | ✅ 是 | 应用项目 |
| core-js-pure | ❌ 否 | 库开发 |
| core-js-bundle | ✅ 是 | 直接 `<script>` 引入 |

## 三、模块结构

### 3.1 入口模块

```javascript
// 全量引入（不推荐，体积大）
import 'core-js';  // 或
import 'core-js/stable';

// 按稳定性引入
import 'core-js/stable';     // 稳定特性
import 'core-js/actual';     // 稳定 + 已进入标准的提案
import 'core-js/full';       // 全部（含实验性提案）
```

### 3.2 按特性引入

```javascript
// 引入整个模块
import 'core-js/actual/promise';
import 'core-js/actual/array';

// 引入具体方法
import 'core-js/actual/array/includes';
import 'core-js/actual/object/from-entries';
import 'core-js/actual/string/pad-start';
```

### 3.3 按 ES 版本引入

```javascript
// 按 ECMAScript 版本
import 'core-js/es';           // 所有 ES 标准
import 'core-js/es/promise';   // ES Promise 相关
import 'core-js/es/array';     // ES Array 相关
```

## 四、使用方式

### 4.1 方式一：手动引入

```javascript
// 入口文件顶部
import 'core-js/stable';
import 'regenerator-runtime/runtime';  // async/await 支持

// 或者只引入需要的
import 'core-js/actual/promise';
import 'core-js/actual/array/includes';
```

### 4.2 方式二：配合 Babel entry 模式

```javascript
// babel.config.js
{
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'entry',
      corejs: 3
    }]
  ]
}

// 入口文件
import 'core-js/stable';
// Babel 会根据 targets 替换为实际需要的模块
```

### 4.3 方式三：配合 Babel usage 模式（推荐）

```javascript
// babel.config.js
{
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: '3.30'  // 指定具体版本
    }]
  ]
}

// 不需要手动引入，Babel 自动按使用添加
const p = Promise.resolve(1);  // 自动添加 promise polyfill
[1, 2].includes(1);            // 自动添加 includes polyfill
```

## 五、core-js-pure 纯净版

### 5.1 为什么需要纯净版

```javascript
// 库开发时，不应该污染全局
// 使用 core-js-pure 避免修改 Array.prototype 等

import includes from 'core-js-pure/actual/array/includes';

includes([1, 2, 3], 2);  // 作为函数调用，而非方法
```

### 5.2 使用方式

```javascript
// 导入单个方法
import includes from 'core-js-pure/actual/array/includes';
import assign from 'core-js-pure/actual/object/assign';

// 导入整个模块
import { from, of, isArray } from 'core-js-pure/actual/array';

// 使用
const arr = from([1, 2, 3]);
const merged = assign({}, obj1, obj2);
```

### 5.3 配合 @babel/runtime

```javascript
// babel.config.js - 库开发推荐配置
{
  presets: ['@babel/preset-env'],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: 3  // 使用 @babel/runtime-corejs3
    }]
  ]
}

// 代码中使用原生语法
[1, 2].includes(1);

// Babel 自动转换为纯净版调用
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/includes";
_includesInstanceProperty([1, 2]).call([1, 2], 1);
```

## 六、regenerator-runtime

### 6.1 作用

```javascript
// async/await 语法需要 regenerator-runtime
async function fetchData() {
  const res = await fetch('/api');
  return res.json();
}

// 转换后需要 regenerator-runtime 支持
```

### 6.2 引入方式

```javascript
// 方式一：手动引入
import 'regenerator-runtime/runtime';

// 方式二：core-js/stable 包含
import 'core-js/stable';

// 方式三：Babel 自动处理
// useBuiltIns: 'usage' 会自动添加
```

## 七、版本指定

### 7.1 为什么要指定版本

```javascript
// babel.config.js
{
  useBuiltIns: 'usage',
  corejs: 3       // ❌ 只指定主版本
  corejs: '3.30'  // ✅ 指定具体版本
}

// 原因：新版本 core-js 会添加新的 polyfill
// 指定具体版本确保 Babel 知道有哪些可用
```

### 7.2 查看版本

```bash
# 查看已安装版本
npm list core-js
```

## 八、体积优化

### 8.1 避免全量引入

```javascript
// ❌ 全量引入（~150KB+）
import 'core-js';

// ✅ 按需引入
// 让 Babel usage 模式自动处理
```

### 8.2 分析 polyfill 体积

```bash
# 使用 webpack-bundle-analyzer 查看
npm install -D webpack-bundle-analyzer

# 或使用 source-map-explorer
npx source-map-explorer dist/bundle.js
```

### 8.3 排除不需要的 polyfill

```javascript
// babel.config.js
{
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3,
      exclude: [
        'es.promise',  // 如果确定不需要
        'es.array.includes'
      ]
    }]
  ]
}
```

## 九、常见问题

### 9.1 重复的 polyfill

```javascript
// 问题：多个入口都引入了 polyfill
// 解决：确保 polyfill 只在主入口引入一次
// 或使用 useBuiltIns: 'usage'
```

### 9.2 Polyfill 未生效

```javascript
// 检查：
// 1. core-js 是否安装
// 2. corejs 版本是否正确配置
// 3. browserslist 是否正确配置

// 调试
BABEL_SHOW_CONFIG_FOR=./src/index.js npx babel src/
```

### 9.3 与第三方库冲突

```javascript
// 某些库自带 polyfill，可能与 core-js 冲突
// 解决：检查控制台警告，必要时调整加载顺序
```

## 十、总结

| 要点 | 说明 |
|------|------|
| 推荐版本 | core-js@3 |
| 应用项目 | core-js + Babel usage 模式 |
| 库开发 | core-js-pure 或 @babel/runtime-corejs3 |
| 体积优化 | 避免全量引入，指定具体版本 |

## 参考资料

- [core-js GitHub](https://github.com/zloirock/core-js)
- [core-js 文档](https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md)
- [Babel preset-env 与 core-js](https://babeljs.io/docs/babel-preset-env#corejs)

---

**下一章** → [第 9 章：按需加载 vs 全量加载](./09-polyfill-strategy.md)
