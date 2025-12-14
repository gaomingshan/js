# 第 12 章：模块化与包管理 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** ES6 模块基础

### 题目

ES6 模块的 `export` 和 `export default` 的主要区别是什么？

**选项：**
- A. `export default` 可以导出多个值，`export` 只能导出一个
- B. `export` 可以导出多个值，`export default` 只能导出一个
- C. 没有区别，可以互换使用
- D. `export default` 必须在文件开头

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**export vs export default**

```javascript
// ===== 命名导出（export）=====
// 可以导出多个
export const name = 'Alice';
export const age = 25;
export function greet() {
  console.log('Hello');
}

// 或批量导出
const name = 'Alice';
const age = 25;
function greet() {
  console.log('Hello');
}
export { name, age, greet };

// 导入时必须使用相同名称
import { name, age, greet } from './module.js';

// 可以重命名
import { name as userName } from './module.js';

// ===== 默认导出（export default）=====
// 只能导出一个
export default function() {
  console.log('Default');
}

// 或
const obj = { x: 1, y: 2 };
export default obj;

// 导入时可以使用任意名称
import myFunc from './module.js';
import anything from './module.js';
```

**混合使用：**
```javascript
// module.js
export const name = 'Alice';
export const age = 25;
export default function greet() {
  console.log('Hello');
}

// main.js
import greet, { name, age } from './module.js';
// 默认导出在前，命名导出在后
```

**导出方式对比：**

| 特性 | export | export default |
|------|--------|----------------|
| 数量 | 多个 | 一个 |
| 导入名称 | 必须匹配 | 任意 |
| 重命名 | `as` | 不需要 |
| 语法 | `import { name }` | `import name` |

**注意事项：**
```javascript
// ❌ 不能直接导出值
export 1;  // 错误

// ✅ 必须有声明或引用
export const num = 1;
export default 1;

// ❌ export default 不能与声明合并
export default const name = 'Alice';  // 错误

// ✅ 分开写
const name = 'Alice';
export default name;

// ✅ 或使用函数/类声明
export default function() {}
export default class {}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** CommonJS vs ES6

### 题目

CommonJS 和 ES6 模块的主要区别是什么？

**选项：**
- A. CommonJS 是静态加载，ES6 模块是动态加载
- B. CommonJS 是动态加载，ES6 模块是静态加载
- C. 两者都是静态加载
- D. 两者都是动态加载

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**CommonJS vs ES6 模块**

| 特性 | CommonJS | ES6 Module |
|------|----------|------------|
| 加载时机 | 运行时（动态） | 编译时（静态） |
| 导出 | `module.exports` | `export` |
| 导入 | `require()` | `import` |
| 值类型 | 值的拷贝 | 值的引用 |
| this | 指向模块 | undefined |
| 环境 | Node.js | 浏览器 + Node.js |

**CommonJS（动态加载）：**
```javascript
// 可以在条件语句中使用
if (condition) {
  const module = require('./module');  // 运行时加载
}

// 可以使用变量
const moduleName = './module';
const module = require(moduleName);

// 导出是值的拷贝
// counter.js
let count = 0;
module.exports = {
  count,
  increment() {
    count++;
  }
};

// main.js
const counter = require('./counter');
console.log(counter.count);  // 0
counter.increment();
console.log(counter.count);  // 0（不会变化）
```

**ES6 模块（静态加载）：**
```javascript
// ❌ 不能在条件语句中使用
if (condition) {
  import module from './module';  // 语法错误
}

// ❌ 不能使用变量
const moduleName = './module';
import module from moduleName;  // 语法错误

// ✅ 必须在顶层
import module from './module';

// 导出是值的引用
// counter.js
export let count = 0;
export function increment() {
  count++;
}

// main.js
import { count, increment } from './counter.js';
console.log(count);  // 0
increment();
console.log(count);  // 1（会变化）
```

**动态导入（ES6）：**
```javascript
// ES6 提供了动态导入
if (condition) {
  import('./module.js').then(module => {
    // 使用模块
  });
}

// 或使用 async/await
async function loadModule() {
  const module = await import('./module.js');
  // 使用模块
}
```

**值拷贝 vs 值引用：**
```javascript
// CommonJS：值拷贝
// lib.js
let counter = 0;
function increment() {
  counter++;
}
module.exports = { counter, increment };

// main.js
const lib = require('./lib');
console.log(lib.counter);  // 0
lib.increment();
console.log(lib.counter);  // 0（拷贝的值不会变）

// ES6：值引用
// lib.js
export let counter = 0;
export function increment() {
  counter++;
}

// main.js
import { counter, increment } from './lib.js';
console.log(counter);  // 0
increment();
console.log(counter);  // 1（引用的值会变）
```

**循环依赖处理：**
```javascript
// CommonJS：部分执行
// a.js
console.log('a starting');
exports.done = false;
const b = require('./b');
console.log('in a, b.done =', b.done);
exports.done = true;

// b.js
console.log('b starting');
exports.done = false;
const a = require('./a');
console.log('in b, a.done =', a.done);
exports.done = true;

// 输出：
// a starting
// b starting
// in b, a.done = false
// in a, b.done = true

// ES6：提前绑定
// a.js
import { b } from './b.js';
export let a = 1;
console.log(b);  // 可以访问

// b.js
import { a } from './a.js';
export let b = 2;
console.log(a);  // 可以访问
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 模块作用域

### 题目

ES6 模块中的顶层 `this` 指向 `undefined`。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**模块中的 this**

```javascript
// ES6 模块
// module.js
console.log(this);  // undefined

// CommonJS
// module.js
console.log(this);  // {}（module.exports）

// 浏览器全局脚本
console.log(this);  // window

// Node.js 全局
console.log(this);  // global
```

**原因：**
- ES6 模块自动启用严格模式
- 严格模式下，顶层 `this` 是 `undefined`

**在不同上下文中：**
```javascript
// ES6 模块
console.log(this);  // undefined

function func() {
  console.log(this);  // undefined（严格模式）
}

const obj = {
  method() {
    console.log(this);  // obj（对象方法）
  }
};

class MyClass {
  constructor() {
    console.log(this);  // 实例对象
  }
}
```

**严格模式的其他影响：**
```javascript
// ES6 模块自动使用严格模式
'use strict';  // 不需要显式声明

// 以下代码会报错
delete Object.prototype;  // TypeError
with (obj) {}              // SyntaxError
arguments.callee;          // TypeError
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 导入提升

### 题目

以下代码的输出顺序是什么？

```javascript
console.log('1');

import { value } from './module.js';

console.log('2');
console.log(value);
```

**选项：**
- A. `1`, `2`, `value的值`
- B. `2`, `value的值`, `1`
- C. `1`, `value的值`, `2`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**import 提升（Hoisting）**

```javascript
console.log('1');  // 第一个执行

// import 会被提升到模块顶部
import { value } from './module.js';

console.log('2');        // 第二个执行
console.log(value);      // 第三个执行

// 等价于
import { value } from './module.js';
console.log('1');
console.log('2');
console.log(value);
```

**import 特性：**

**1. 静态声明，会被提升**
```javascript
// ✅ 可以在导入前使用
console.log(value);
import { value } from './module.js';

// 等价于
import { value } from './module.js';
console.log(value);
```

**2. 只执行一次**
```javascript
import { a } from './module.js';
import { b } from './module.js';
import { c } from './module.js';
// module.js 只执行一次
```

**3. 不能放在块级作用域**
```javascript
// ❌ 语法错误
if (condition) {
  import { value } from './module.js';
}

// ✅ 使用动态导入
if (condition) {
  import('./module.js').then(({ value }) => {
    console.log(value);
  });
}
```

**模块执行顺序：**
```javascript
// main.js
console.log('main start');
import { a } from './a.js';
import { b } from './b.js';
console.log('main end');

// a.js
console.log('a');
export const a = 1;

// b.js
console.log('b');
export const b = 2;

// 输出顺序：
// a
// b
// main start
// main end
```

**动态导入不会提升：**
```javascript
console.log('1');

const module = await import('./module.js');  // 不会提升

console.log('2');
console.log(module.value);

// 输出：1, 2, value的值
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** 模块单例

### 题目

以下代码的输出是什么？

```javascript
// counter.js
let count = 0;
export function increment() {
  count++;
}
export function getCount() {
  return count;
}

// a.js
import { increment, getCount } from './counter.js';
increment();
console.log(getCount());

// b.js
import { increment, getCount } from './counter.js';
increment();
console.log(getCount());

// main.js
import './a.js';
import './b.js';
```

**选项：**
- A. `1`, `1`
- B. `1`, `2`
- C. `2`, `2`
- D. `0`, `0`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**模块单例模式**

```javascript
// counter.js 只会执行一次
// 所有导入都共享同一个实例

// a.js
increment();  // count 变为 1
console.log(getCount());  // 输出 1

// b.js
increment();  // count 变为 2（共享状态）
console.log(getCount());  // 输出 2
```

**模块是单例的：**
```javascript
// module.js
console.log('module executed');
export const value = { x: 1 };

// a.js
import { value } from './module.js';
value.x = 2;

// b.js
import { value } from './module.js';
console.log(value.x);  // 2（共享同一个对象）

// main.js
import './a.js';
import './b.js';

// 输出：
// module executed（只执行一次）
// 2
```

**利用单例模式：**
```javascript
// store.js
class Store {
  constructor() {
    this.state = {};
  }
  
  setState(key, value) {
    this.state[key] = value;
  }
  
  getState(key) {
    return this.state[key];
  }
}

export default new Store();  // 导出单例

// a.js
import store from './store.js';
store.setState('user', 'Alice');

// b.js
import store from './store.js';
console.log(store.getState('user'));  // "Alice"
```

**与 CommonJS 对比：**
```javascript
// CommonJS 也是单例
// module.js
let count = 0;
exports.increment = () => count++;
exports.getCount = () => count;

// a.js
const counter = require('./module');
counter.increment();
console.log(counter.getCount());  // 1

// b.js
const counter = require('./module');
counter.increment();
console.log(counter.getCount());  // 2
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** Tree Shaking

### 题目

Tree Shaking 可以移除以下哪些代码？

```javascript
// utils.js
export function used() {
  console.log('used');
}

export function unused() {
  console.log('unused');
}

// main.js
import { used } from './utils.js';
used();
```

**选项：**
- A. 只能移除 `unused` 函数
- B. 可以移除 `unused` 函数和未使用的导入
- C. 不能移除任何代码
- D. 可以移除整个 `utils.js` 文件

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Tree Shaking 原理**

Tree Shaking 是基于 ES6 模块的静态结构分析，移除未使用的代码。

**可以移除：**
```javascript
// utils.js
export function used() {
  console.log('used');
}

export function unused() {
  console.log('unused');  // ✅ 会被移除
}

// main.js
import { used } from './utils.js';
used();

// 打包后只包含 used 函数
```

**注意事项：**

**1. 副作用代码不会被移除**
```javascript
// utils.js
export function fn() {}

console.log('side effect');  // ❌ 不会被移除

// main.js
import { fn } from './utils.js';
// 即使不使用 fn，console.log 仍会执行
```

**2. 默认导出不利于 Tree Shaking**
```javascript
// ❌ 不利于 Tree Shaking
export default {
  used() {},
  unused() {}
};

import utils from './utils.js';
utils.used();  // unused 也会被打包

// ✅ 利于 Tree Shaking
export function used() {}
export function unused() {}

import { used } from './utils.js';
used();  // unused 会被移除
```

**3. CommonJS 不支持 Tree Shaking**
```javascript
// ❌ CommonJS 无法 Tree Shaking
module.exports = {
  used() {},
  unused() {}
};

const { used } = require('./utils');
// unused 也会被打包
```

**package.json 配置：**
```json
{
  "sideEffects": false
}
```

**标记无副作用：**
```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

**最佳实践：**
```javascript
// ✅ 使用命名导出
export const a = 1;
export const b = 2;

// ✅ 避免副作用
// 不要在模块顶层执行副作用代码

// ✅ 使用 /*#__PURE__*/ 注释
const obj = /*#__PURE__*/ createObj();
export { obj };
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** package.json

### 题目

`package.json` 中的哪些字段与模块导入相关？

**选项：**
- A. `main` - 指定模块的入口文件
- B. `module` - 指定 ES6 模块的入口文件
- C. `exports` - 定义模块的导出映射
- D. `type` - 指定模块类型（`module` 或 `commonjs`）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**package.json 模块字段**

**A. main（CommonJS 入口）**
```json
{
  "main": "./dist/index.js"
}
```

```javascript
// Node.js 导入
const pkg = require('my-package');  // 加载 dist/index.js
```

**B. module（ES6 模块入口）**
```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs"
}
```

```javascript
// 构建工具（Webpack/Rollup）优先使用 module
import pkg from 'my-package';  // 加载 dist/index.mjs
```

**C. exports（导出映射）**
```json
{
  "exports": {
    ".": {
      "require": "./dist/index.cjs",
      "import": "./dist/index.mjs"
    },
    "./utils": {
      "require": "./dist/utils.cjs",
      "import": "./dist/utils.mjs"
    }
  }
}
```

```javascript
// 导入主入口
import pkg from 'my-package';  // dist/index.mjs
const pkg = require('my-package');  // dist/index.cjs

// 导入子路径
import { fn } from 'my-package/utils';  // dist/utils.mjs
const { fn } = require('my-package/utils');  // dist/utils.cjs
```

**D. type（模块类型）**
```json
{
  "type": "module"
}
```

```javascript
// type: "module" 时
// .js 文件被视为 ES6 模块
// .cjs 文件被视为 CommonJS

// type: "commonjs" 或未设置时（默认）
// .js 文件被视为 CommonJS
// .mjs 文件被视为 ES6 模块
```

**完整示例：**
```json
{
  "name": "my-package",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "exports": {
    ".": {
      "require": "./dist/index.cjs",
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "require": "./dist/utils.cjs",
      "import": "./dist/utils.mjs",
      "types": "./dist/utils.d.ts"
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist"
  ],
  "sideEffects": false
}
```

**exports 的优先级：**
```json
{
  "exports": {
    ".": {
      "node": {
        "import": "./node.mjs",
        "require": "./node.cjs"
      },
      "default": "./default.js"
    }
  }
}
```

**条件导出：**
```json
{
  "exports": {
    ".": {
      "development": "./dev.js",
      "production": "./prod.js",
      "default": "./index.js"
    }
  }
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** 动态导入

### 题目

实现一个模块懒加载函数，支持加载失败重试。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

**模块懒加载与重试**

```javascript
class ModuleLoader {
  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.cache = new Map();
  }
  
  async load(url, retries = 0) {
    // 检查缓存
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    
    try {
      console.log(`Loading ${url}...`);
      const module = await import(url);
      
      // 缓存成功加载的模块
      this.cache.set(url, module);
      return module;
      
    } catch (error) {
      console.error(`Failed to load ${url}:`, error);
      
      // 重试
      if (retries < this.maxRetries) {
        console.log(`Retrying ${retries + 1}/${this.maxRetries}...`);
        
        // 延迟重试
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * (retries + 1))
        );
        
        return this.load(url, retries + 1);
      }
      
      throw new Error(`Failed to load ${url} after ${this.maxRetries} retries`);
    }
  }
  
  // 预加载模块
  preload(urls) {
    return Promise.allSettled(
      urls.map(url => this.load(url))
    );
  }
  
  // 清除缓存
  clearCache(url) {
    if (url) {
      this.cache.delete(url);
    } else {
      this.cache.clear();
    }
  }
}

// 使用
const loader = new ModuleLoader(3, 1000);

// 加载模块
loader.load('./module.js')
  .then(module => {
    console.log('Module loaded:', module);
  })
  .catch(err => {
    console.error('Load failed:', err);
  });

// 预加载多个模块
loader.preload([
  './moduleA.js',
  './moduleB.js',
  './moduleC.js'
]).then(results => {
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`Module ${index} loaded`);
    } else {
      console.error(`Module ${index} failed:`, result.reason);
    }
  });
});
```

**React 路由懒加载示例：**
```javascript
import React, { lazy, Suspense } from 'react';

const loader = new ModuleLoader();

// 包装懒加载组件
function lazyWithRetry(importFn) {
  return lazy(() => 
    loader.load(importFn)
      .catch(err => {
        // 加载失败时显示错误组件
        return { default: ErrorComponent };
      })
  );
}

// 使用
const Home = lazyWithRetry(() => import('./pages/Home'));
const About = lazyWithRetry(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}
```

**Vue 路由懒加载示例：**
```javascript
const loader = new ModuleLoader();

const routes = [
  {
    path: '/',
    component: () => loader.load(
      () => import('./views/Home.vue')
    )
  },
  {
    path: '/about',
    component: () => loader.load(
      () => import('./views/About.vue')
    )
  }
];
```

**Webpack 魔法注释：**
```javascript
// 预加载
import(
  /* webpackPreload: true */
  './module.js'
);

// 预取
import(
  /* webpackPrefetch: true */
  './module.js'
);

// 命名 chunk
import(
  /* webpackChunkName: "my-chunk" */
  './module.js'
);

// 组合使用
import(
  /* webpackChunkName: "my-chunk" */
  /* webpackPrefetch: true */
  './module.js'
);
```

**完整的路由懒加载方案：**
```javascript
class RouteLoader {
  constructor() {
    this.loader = new ModuleLoader();
    this.loadingComponents = new Set();
  }
  
  async loadRoute(routePath) {
    // 避免重复加载
    if (this.loadingComponents.has(routePath)) {
      return;
    }
    
    this.loadingComponents.add(routePath);
    
    try {
      const module = await this.loader.load(`./routes${routePath}.js`);
      return module.default;
    } finally {
      this.loadingComponents.delete(routePath);
    }
  }
  
  // 预加载相关路由
  async preloadRelatedRoutes(currentRoute, routes) {
    const related = this.getRelatedRoutes(currentRoute, routes);
    await this.loader.preload(related);
  }
  
  getRelatedRoutes(currentRoute, routes) {
    // 根据路由配置返回相关路由
    // 例如：父子路由、同级路由等
    return routes
      .filter(route => this.isRelated(currentRoute, route))
      .map(route => `./routes${route.path}.js`);
  }
  
  isRelated(currentRoute, route) {
    // 判断路由是否相关
    return route.path.startsWith(currentRoute) ||
           currentRoute.startsWith(route.path);
  }
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** 循环依赖

### 题目

以下循环依赖的代码会正常运行吗？

```javascript
// a.js
import { b } from './b.js';
export const a = 'a';
console.log(b);

// b.js
import { a } from './a.js';
export const b = 'b';
console.log(a);
```

**选项：**
- A. 会报错
- B. 正常运行，输出 `undefined` 和 `a`
- C. 正常运行，输出 `b` 和 `a`
- D. 死循环

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**ES6 模块循环依赖**

```javascript
// a.js
import { b } from './b.js';  // b = 'b'
export const a = 'a';
console.log(b);  // 'b'

// b.js
import { a } from './a.js';  // a = undefined（还未执行到 export）
export const b = 'b';
console.log(a);  // undefined
```

**执行流程：**
1. 开始执行 `a.js`
2. 遇到 `import { b } from './b.js'`，暂停 `a.js`，执行 `b.js`
3. 在 `b.js` 中，`import { a } from './a.js'`
4. 此时 `a.js` 还未执行到 `export const a`，所以 `a` 是 `undefined`
5. 继续执行 `b.js`，`export const b = 'b'`
6. `console.log(a)` 输出 `undefined`
7. `b.js` 执行完毕，返回 `a.js`
8. 继续执行 `a.js`，`export const a = 'a'`
9. `console.log(b)` 输出 `'b'`

**避免循环依赖的方法：**

**方法 1：重构代码结构**
```javascript
// ❌ 循环依赖
// a.js
import { b } from './b.js';
export const a = 'a';

// b.js
import { a } from './a.js';
export const b = 'b';

// ✅ 提取公共依赖
// shared.js
export const shared = {};

// a.js
import { shared } from './shared.js';
export const a = 'a';

// b.js
import { shared } from './shared.js';
export const b = 'b';
```

**方法 2：延迟导入**
```javascript
// a.js
export const a = 'a';
export function getB() {
  const { b } = require('./b.js');
  return b;
}

// b.js
export const b = 'b';
export function getA() {
  const { a } = require('./a.js');
  return a;
}
```

**方法 3：使用函数**
```javascript
// a.js
import { getB } from './b.js';
export const a = 'a';
export function getA() {
  return a;
}
console.log(getB());  // 'b'

// b.js
import { getA } from './a.js';
export const b = 'b';
export function getB() {
  return b;
}
console.log(getA());  // 'a'
```

**CommonJS 循环依赖：**
```javascript
// a.js
console.log('a starting');
exports.done = false;
const b = require('./b');
console.log('in a, b.done =', b.done);
exports.done = true;
console.log('a done');

// b.js
console.log('b starting');
exports.done = false;
const a = require('./a');
console.log('in b, a.done =', a.done);
exports.done = true;
console.log('b done');

// main.js
require('./a');

// 输出：
// a starting
// b starting
// in b, a.done = false
// b done
// in a, b.done = true
// a done
```

**检测循环依赖工具：**
```bash
# madge
npx madge --circular src/

# webpack
# webpack.config.js
module.exports = {
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true
    })
  ]
};
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 模块打包

### 题目

Webpack、Rollup 和 Vite 在模块打包上有什么主要区别？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**打包工具对比**

| 特性 | Webpack | Rollup | Vite |
|------|---------|--------|------|
| 主要用途 | 应用打包 | 库打包 | 开发服务器 + 打包 |
| 开发模式 | Bundle | Bundle | No-bundle（ESM） |
| 生产模式 | Bundle | Bundle | Bundle（Rollup） |
| Tree Shaking | ✅ | ✅✅ | ✅✅ |
| Code Splitting | ✅✅ | ✅ | ✅✅ |
| HMR | ✅ | ❌ | ✅✅ |
| 配置复杂度 | 高 | 中 | 低 |

**Webpack：**
```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendor'
        }
      }
    }
  }
};
```

**Rollup：**
```javascript
// rollup.config.js
export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm'
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'MyLibrary'
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    babel(),
    terser()
  ],
  external: ['react', 'react-dom']
};
```

**Vite：**
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        nested: './nested/index.html'
      }
    }
  },
  server: {
    port: 3000,
    hmr: true
  }
};
```

**打包产物对比：**

**Webpack（运行时较重）：**
```javascript
// webpack bundle
(function(modules) {
  // webpack 运行时代码
  var installedModules = {};
  function __webpack_require__(moduleId) {
    // ...
  }
  return __webpack_require__(0);
})([
  /* 0 */
  function(module, exports, __webpack_require__) {
    // 模块代码
  },
  /* 1 */
  function(module, exports, __webpack_require__) {
    // 模块代码
  }
]);
```

**Rollup（产物更干净）：**
```javascript
// rollup bundle
// 直接是模块代码，没有多余的运行时
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

export { add, multiply };
```

**使用场景：**

**Webpack：**
- ✅ 大型应用
- ✅ 需要丰富的 loader/plugin
- ✅ 复杂的代码分割需求

**Rollup：**
- ✅ 库开发
- ✅ 需要多种输出格式（CJS、ESM、UMD）
- ✅ 追求更小的打包体积

**Vite：**
- ✅ 现代应用开发
- ✅ 追求极速的开发体验
- ✅ 基于 ESM 的项目

</details>

---

**本章总结：**
- ✅ export vs export default
- ✅ CommonJS vs ES6 模块
- ✅ 模块作用域中的 this
- ✅ import 提升
- ✅ 模块单例
- ✅ Tree Shaking
- ✅ package.json 模块字段
- ✅ 动态导入与懒加载
- ✅ 循环依赖处理
- ✅ 打包工具对比

**下一章：** [第 13 章：工程化与构建](./chapter-13.md)
