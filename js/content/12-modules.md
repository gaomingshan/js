# ES6 模块系统（ES Modules）

## 概述

ES Modules（ESM）是 JavaScript 官方模块化标准：

- 使用 `import` / `export`
- **静态结构**：依赖关系在“编译阶段”可分析
- 支持 Tree Shaking（移除未使用导出）

理解 ESM 的关键不是语法，而是两点：

- **导出是 live binding（活绑定）**：导入方读取的是“绑定”，不是一次性拷贝
- **模块只执行一次**：天然具备单例语义

---

## 一、导出（export）

### 1.1 命名导出

```js
export const name = 'Alice';
export let age = 25;

export function greet() {
  return 'Hello';
}

export class User {
  constructor(name) {
    this.name = name;
  }
}

const x = 10;
const y = 20;
export { x, y };
```

### 1.2 默认导出（一个模块只能有一个）

```js
export default function main() {
  console.log('main');
}

// 也可以默认导出值
export default 42;
```

### 1.3 重命名导出

```js
const privateVar = 'v';
export { privateVar as publicVar };
```

---

## 二、导入（import）

### 2.1 命名导入

```js
import { name, age } from './user.js';
import { name as userName } from './user.js';
```

### 2.2 默认导入

```js
import main from './main.js';
```

### 2.3 命名空间导入

```js
import * as user from './user.js';
console.log(user.name, user.age);
```

### 2.4 仅执行模块（副作用导入）

```js
import './polyfill.js';
import './styles.css';
```

---

## 三、动态导入：`import()`

动态导入返回 Promise：

```js
const mod = await import('./heavy-module.js');
mod.default();
```

典型用途：

- 按需加载大模块
- 路由懒加载
- 代码分割（配合构建工具）

---

## 四、模块特性（机制层）

### 4.1 静态结构与 Tree Shaking

因为 `import/export` 是语法级别的静态声明，工具可以在构建期分析依赖图并移除死代码。

### 4.2 自动严格模式

模块天然处于 strict mode：

```js
undeclaredVar = 1; // ReferenceError
```

### 4.3 顶层 this

模块顶层：

```js
console.log(this); // undefined
```

### 4.4 单例语义

模块只初始化一次：

```js
// counter.js
let count = 0;
export function inc() {
  return ++count;
}

// a.js / b.js 都 import counter.js，count 是共享的
```

### 4.5 live binding

```js
// counter.js
export let count = 0;
export function inc() { count++; }

// main.js
import { count, inc } from './counter.js';
inc();
console.log(count); // 1
```

---

## 五、模块路径与解析

常见三类 specifier：

- 相对路径：`./a.js`、`../b.js`
- 绝对 URL：`https://cdn.../x.js`
- 裸模块标识符：`react`（通常需要 bundler / Node 的解析规则支持）

> **浏览器提示**
>
> 原生浏览器 ESM 不支持直接解析裸模块标识符（需要 import map 或构建工具）。

---

## 六、重导出（re-export）

```js
export { name } from './user.js';
export * from './utils.js';
export * as user from './user.js';
```

常用于 `index.js` 聚合导出。

---

## 七、浏览器中使用

```html
<script type="module" src="./main.js"></script>
```

特性：

- 默认具备 defer 行为
- 跨域需要 CORS
- 模块有独立作用域

---

## 八、最佳实践

1. **优先命名导出**：更利于 Tree Shaking 与重构。
2. **模块保持单一职责**：避免“万能 util 模块”。
3. **避免循环依赖**：拆分职责、引入中间层。
4. **用动态导入做代码分割**：大模块、低频功能按需加载。
5. **统一出口**：用 `index.js` 聚合导出，简化 import 路径。

---

## 参考资料

- [ECMA-262 - Modules](https://tc39.es/ecma262/#sec-modules)
- [MDN - JavaScript Modules](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
