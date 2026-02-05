# ES6+ 模块系统

> 掌握现代 JavaScript 的模块化方案

---

## 概述

ES6 模块是 JavaScript 官方的模块化标准，提供了静态导入导出、作用域隔离等特性。

本章将深入：
- ES6 模块语法
- 导入导出的各种方式
- 模块加载机制
- 与 CommonJS 的区别
- 最佳实践

---

## 1. 模块基础

### 1.1 export 导出

```javascript
// 命名导出
export const name = 'Alice';
export function greet() {
  return 'Hello';
}
export class User {
  constructor(name) {
    this.name = name;
  }
}

// 批量导出
const age = 25;
const email = 'alice@example.com';
export { age, email };

// 重命名导出
export { name as userName, age as userAge };

// 默认导出（每个模块只能有一个）
export default function() {
  console.log('Default export');
}

// 或
export default class User {}
export default 42;
```

### 1.2 import 导入

```javascript
// 命名导入
import { name, greet } from './module.js';

// 重命名导入
import { name as userName } from './module.js';

// 导入所有
import * as module from './module.js';
console.log(module.name);
console.log(module.greet());

// 默认导入
import User from './module.js';

// 混合导入
import User, { name, greet } from './module.js';

// 只执行模块（不导入）
import './module.js';
```

---

## 2. 动态导入

### 2.1 import()

```javascript
// 动态导入（返回 Promise）
const module = await import('./module.js');
module.greet();

// 条件导入
if (condition) {
  const module = await import('./feature.js');
  module.init();
}

// 按需加载
button.addEventListener('click', async () => {
  const { default: Component } = await import('./Component.js');
  new Component().render();
});
```

### 2.2 代码分割

```javascript
// 路由懒加载
const routes = {
  '/home': () => import('./pages/Home.js'),
  '/about': () => import('./pages/About.js'),
  '/contact': () => import('./pages/Contact.js')
};

async function navigateTo(path) {
  const loadPage = routes[path];
  if (loadPage) {
    const module = await loadPage();
    module.default.render();
  }
}
```

---

## 3. 模块特性

### 3.1 静态结构

```javascript
// ✅ 静态导入（顶层）
import { name } from './module.js';

// ❌ 不能在条件语句中
if (condition) {
  import { name } from './module.js';  // 语法错误
}

// ✅ 使用动态导入
if (condition) {
  const module = await import('./module.js');
}
```

### 3.2 单例模式

```javascript
// module.js
let count = 0;

export function increment() {
  count++;
}

export function getCount() {
  return count;
}

// main.js
import { increment, getCount } from './module.js';
import { increment as inc } from './module.js';

increment();
inc();
console.log(getCount());  // 2

// 模块只执行一次，多次导入共享同一实例
```

### 3.3 循环依赖

```javascript
// a.js
import { b } from './b.js';
export const a = 'A';
console.log('a.js:', b);  // undefined（b 还未初始化）

// b.js
import { a } from './a.js';
export const b = 'B';
console.log('b.js:', a);  // undefined

// ES6 模块支持循环依赖，但变量可能未初始化
```

---

## 4. CommonJS vs ES6 模块

### 4.1 主要区别

```javascript
// CommonJS（Node.js）
const module = require('./module');
module.exports = { name: 'Alice' };
exports.greet = function() {};

// ES6 模块
import module from './module.js';
export { name };
export default class {};

// 区别：
// 1. CommonJS 是动态的，ES6 是静态的
// 2. CommonJS 是值拷贝，ES6 是引用绑定
// 3. CommonJS 是运行时加载，ES6 是编译时加载
// 4. CommonJS 是同步的，ES6 支持异步
```

### 4.2 值拷贝 vs 引用绑定

```javascript
// CommonJS（值拷贝）
// module.js
let count = 0;
exports.count = count;
exports.increment = function() {
  count++;
  exports.count = count;  // 需要重新赋值
};

// main.js
const { count, increment } = require('./module');
console.log(count);  // 0
increment();
console.log(count);  // 还是 0（拷贝的值）

// ES6 模块（引用绑定）
// module.js
export let count = 0;
export function increment() {
  count++;
}

// main.js
import { count, increment } from './module.js';
console.log(count);  // 0
increment();
console.log(count);  // 1（绑定的引用）
```

---

## 5. 最佳实践

### 5.1 模块组织

```javascript
// ✅ 清晰的导出
// user.js
export class User {
  constructor(name) {
    this.name = name;
  }
}

export function createUser(name) {
  return new User(name);
}

export const DEFAULT_ROLE = 'user';

// ❌ 混乱的导出
export default class User {}
export { createUser, DEFAULT_ROLE };
```

### 5.2 index.js 聚合导出

```javascript
// components/index.js
export { Button } from './Button.js';
export { Input } from './Input.js';
export { Modal } from './Modal.js';

// 使用
import { Button, Input, Modal } from './components/index.js';
```

### 5.3 避免默认导出

```javascript
// ❌ 默认导出（重命名随意）
export default function() {}

import xyz from './module.js';  // 可以是任何名字

// ✅ 命名导出（名字一致）
export function processData() {}

import { processData } from './module.js';  // 必须是 processData
```

---

## 6. 实际应用

### 6.1 工具函数模块

```javascript
// utils.js
export function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, delay) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn(...args);
      lastTime = now;
    }
  };
}

export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};
```

### 6.2 配置模块

```javascript
// config.js
const dev = {
  apiUrl: 'http://localhost:3000',
  debug: true
};

const prod = {
  apiUrl: 'https://api.example.com',
  debug: false
};

export const config = process.env.NODE_ENV === 'production' ? prod : dev;
```

### 6.3 服务模块

```javascript
// api.js
class APIService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
  
  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    return response.json();
  }
  
  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

export const api = new APIService('https://api.example.com');
```

---

## 关键要点

1. **导出方式**
   - 命名导出：`export { name }`
   - 默认导出：`export default`
   - 重导出：`export * from`

2. **导入方式**
   - 命名导入：`import { name }`
   - 默认导入：`import Name`
   - 动态导入：`import()`

3. **模块特性**
   - 静态结构
   - 单例模式
   - 引用绑定

4. **最佳实践**
   - 优先命名导出
   - 使用 index.js 聚合
   - 清晰的模块组织

---

## 参考资料

- [MDN: JavaScript modules](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [ES6 Modules](https://exploringjs.com/es6/ch_modules.html)

---

**上一章**：[Web API 实践](./content-30.md)  
**下一章**：[Proxy 与 Reflect](./content-32.md)
