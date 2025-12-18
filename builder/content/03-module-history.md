# JavaScript 模块化历史

## 概述

模块化解决的是一个朴素问题：**当代码变大时，如何把它拆成可组合、可复用、可维护的单元，并且管理依赖关系**。

理解模块化演进时，抓住两条主线就够了：

- **运行时加载**：模块在运行时如何被加载与执行（同步/异步、缓存、循环依赖）
- **静态结构**：模块结构是否能在“运行前”被分析（决定 tree shaking、拆包、预加载等能力）

---

## 一、最早的“模块化”：IIFE 与命名空间

### 1.1 IIFE（立即执行函数）

```js
const Counter = (() => {
  let n = 0;
  return {
    inc() { n++; },
    get() { return n; }
  };
})();
```

优点：

- 通过闭包隔离私有变量

缺点：

- 依赖关系仍然是隐式的（靠全局变量或注入顺序）
- 复用与打包发布成本高

---

## 二、CommonJS：Node.js 的事实标准

### 2.1 核心语法

```js
// a.js
module.exports = { x: 1 };

// b.js
const a = require('./a');
console.log(a.x);
```

### 2.2 设计动机与特性

- **同步加载**：适合磁盘 IO（服务端）
- **运行时解析**：`require()` 可以写在条件里
- **模块缓存**：同一模块只执行一次，后续复用缓存结果

> **关键点**
>
> CommonJS 的“灵活”来自运行时特性；但运行时特性也意味着难以做严格静态分析。

---

## 三、AMD：面向浏览器的异步模块

### 3.1 典型语法（RequireJS）

```js
define(['./a'], function (a) {
  return { x: a.x + 1 };
});
```

特点：

- **异步加载**：契合浏览器网络请求
- 但语法与开发体验较“重”

---

## 四、CMD：更接近 CommonJS 的浏览器方案

CMD（如 SeaJS）强调“依赖就近、延迟执行”：

```js
define(function (require, exports, module) {
  const a = require('./a');
  exports.x = a.x + 1;
});
```

---

## 五、UMD：兼容多种环境的“包装层”

库作者为了同时支持：

- 浏览器全局变量
- AMD
- CommonJS

会产出 UMD：本质是一个“运行时检测 + 适配层”。

> **直觉理解**
>
> UMD 不是新的模块系统，更像“在不同模块系统之间桥接”。

---

## 六、ESM：语言层面的标准模块

### 6.1 基本语法

```js
// a.js
export const x = 1;

// b.js
import { x } from './a.js';
```

### 6.2 ESM 的关键设计点

- **静态结构**：`import/export` 必须出现在顶层
- **可被编译期分析**：依赖图在运行前就能确定
- **Live Binding（活绑定）**：导出是“绑定”，不是值的拷贝

```js
// a.js
export let n = 0;
export function inc() { n++; }

// b.js
import { n, inc } from './a.js';
inc();
console.log(n); // 1
```

> **深入一点**
>
> ESM 的静态结构，是 tree shaking、预加载（preload）、更稳定拆包策略的基础。

---

## 七、为什么模块化演进最终指向构建工具

现代项目会同时遇到：

- npm 依赖（历史上有大量 CommonJS 包）
- 浏览器 ESM（路径导入、跨域限制）
- 语法与资源转译（TS/JSX/CSS/图片）

构建工具在这里扮演“翻译 + 组织 + 优化”的角色：

- 把多种模块规范与资源统一到可部署产物
- 利用 ESM 静态结构进行优化（tree shaking、拆包）

---

## 参考资料

- [MDN - JavaScript modules](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [Node.js - Modules](https://nodejs.org/api/modules.html)
- [ECMA-262 - Modules](https://tc39.es/ecma262/#sec-modules)
