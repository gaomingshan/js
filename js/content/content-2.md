# 变量声明与作用域基础

> 掌握变量声明机制，避免作用域陷阱

---

## 概述

JavaScript 有三种变量声明方式：`var`、`let`、`const`。理解它们的区别以及变量提升（Hoisting）机制，是掌握 JS 作用域的基础。

本章将帮助你理解：
- 三种声明方式的本质差异
- 变量提升的原理
- 暂时性死区（TDZ）
- 全局变量的创建方式

---

## 1. var、let、const 对比

### 1.1 基本语法

```javascript
// var：函数作用域
var a = 1;

// let：块级作用域
let b = 2;

// const：块级作用域 + 不可重新赋值
const c = 3;
```

### 1.2 核心差异对比表

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是（初始化为 undefined） | 是（但有 TDZ） | 是（但有 TDZ） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 全局对象属性 | 是（浏览器中） | 否 | 否 |
| 暂时性死区 | 无 | 有 | 有 |

---

## 2. 作用域差异

### 2.1 var：函数作用域

```javascript
function testVar() {
  if (true) {
    var x = 1;
  }
  console.log(x);  // 1 - var 无视块级作用域
}

// 等价于（变量提升后）
function testVar() {
  var x;  // 提升到函数顶部
  if (true) {
    x = 1;
  }
  console.log(x);  // 1
}
```

**陷阱：循环中的 var**

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);  // 输出 3, 3, 3
  }, 100);
}

// 原因：var 在函数作用域，循环结束后 i = 3
```

### 2.2 let/const：块级作用域

```javascript
function testLet() {
  if (true) {
    let x = 1;
    const y = 2;
  }
  console.log(x);  // ❌ ReferenceError: x is not defined
  console.log(y);  // ❌ ReferenceError: y is not defined
}
```

**修复循环问题**

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);  // 输出 0, 1, 2
  }, 100);
}

// 每次迭代创建新的块级作用域
```

### 2.3 块级作用域的边界

```javascript
// 块：花括号 {}
{
  let x = 1;
}
console.log(x);  // ❌ ReferenceError

// if 块
if (true) {
  let y = 2;
}
console.log(y);  // ❌ ReferenceError

// for 块
for (let i = 0; i < 1; i++) {
  let z = 3;
}
console.log(i);  // ❌ ReferenceError
console.log(z);  // ❌ ReferenceError

// switch 块（注意：整个 switch 是一个块）
switch (true) {
  case true:
    let a = 1;
    break;
  case false:
    let a = 2;  // ❌ SyntaxError: Identifier 'a' has already been declared
    break;
}

// 修复方式：为每个 case 创建块
switch (true) {
  case true: {
    let a = 1;
    break;
  }
  case false: {
    let a = 2;  // ✅ 不同块，可以重新声明
    break;
  }
}
```

---

## 3. 变量提升（Hoisting）

### 3.1 var 的提升

**定义**：变量声明被提升到作用域顶部，但赋值不提升。

```javascript
console.log(x);  // undefined（而非 ReferenceError）
var x = 1;
console.log(x);  // 1

// 等价于
var x;  // 声明提升
console.log(x);  // undefined
x = 1;  // 赋值保持原位置
console.log(x);  // 1
```

### 3.2 函数声明的提升

```javascript
foo();  // "Hello" - 函数声明完整提升

function foo() {
  console.log("Hello");
}

// 等价于
function foo() {
  console.log("Hello");
}
foo();  // "Hello"
```

### 3.3 函数表达式不提升

```javascript
bar();  // ❌ TypeError: bar is not a function

var bar = function() {
  console.log("World");
};

// 等价于
var bar;  // 只有声明提升
bar();  // bar 是 undefined，无法调用
bar = function() {
  console.log("World");
};
```

### 3.4 let/const 与提升的关系

**误区**：let/const 不提升？  
**真相**：let/const 也提升，但有暂时性死区（TDZ）。

```javascript
// var：提升后初始化为 undefined
console.log(x);  // undefined
var x = 1;

// let：提升但未初始化（TDZ）
console.log(y);  // ❌ ReferenceError: Cannot access 'y' before initialization
let y = 2;
```

**证明提升存在**

```javascript
let x = 1;
{
  console.log(x);  // ❌ ReferenceError（如果不提升，应该访问外层的 x）
  let x = 2;  // 内层 x 提升了，但在 TDZ 中
}
```

---

## 4. 暂时性死区（TDZ）

### 4.1 定义

**TDZ**：从块的开始到变量声明语句之间的区域。

```javascript
{
  // TDZ 开始
  console.log(x);  // ❌ ReferenceError
  console.log(y);  // ❌ ReferenceError
  
  let x = 1;  // TDZ 结束（x）
  const y = 2;  // TDZ 结束（y）
  
  console.log(x);  // 1
  console.log(y);  // 2
}
```

### 4.2 TDZ 的典型陷阱

**陷阱 1：默认参数**

```javascript
function foo(x = y, y = 2) {
  console.log(x, y);
}
foo();  // ❌ ReferenceError: Cannot access 'y' before initialization

// 原因：参数从左到右初始化，x 初始化时 y 还在 TDZ
```

**陷阱 2：typeof 不再安全**

```javascript
// ES5：typeof 对未声明变量不报错
console.log(typeof undeclared);  // "undefined"

// ES6：let/const 在 TDZ 中使用 typeof 报错
console.log(typeof x);  // ❌ ReferenceError
let x;
```

**陷阱 3：隐藏的 TDZ**

```javascript
let x = x;  // ❌ ReferenceError: Cannot access 'x' before initialization
// 右侧的 x 访问时，左侧的 x 还未初始化完成
```

### 4.3 TDZ 的设计动机

**目的**：强制开发者先声明再使用，避免 var 时代的混乱。

```javascript
// var 时代的问题
console.log(user);  // undefined - 难以发现拼写错误
var user = "Alice";

// let/const 强制先声明
console.log(user);  // ❌ ReferenceError - 立即发现问题
let user = "Alice";
```

---

## 5. 重复声明与重新赋值

### 5.1 var 允许重复声明

```javascript
var x = 1;
var x = 2;  // ✅ 允许
console.log(x);  // 2
```

### 5.2 let/const 不允许重复声明

```javascript
let x = 1;
let x = 2;  // ❌ SyntaxError: Identifier 'x' has already been declared

const y = 1;
const y = 2;  // ❌ SyntaxError: Identifier 'y' has already been declared
```

**跨声明方式也不允许**

```javascript
var a = 1;
let a = 2;  // ❌ SyntaxError

let b = 1;
const b = 2;  // ❌ SyntaxError
```

### 5.3 const 的不可变性

```javascript
// 原始值：完全不可变
const x = 1;
x = 2;  // ❌ TypeError: Assignment to constant variable

// 对象：引用不可变，但内容可变
const obj = { a: 1 };
obj.a = 2;  // ✅ 允许修改属性
obj.b = 3;  // ✅ 允许添加属性
obj = {};   // ❌ TypeError: 不能重新赋值引用

// 数组：同理
const arr = [1, 2, 3];
arr.push(4);  // ✅ 允许修改内容
arr = [];     // ❌ TypeError: 不能重新赋值引用
```

**真正的不可变**

```javascript
const obj = Object.freeze({ a: 1 });
obj.a = 2;  // 严格模式下 TypeError，非严格模式静默失败
console.log(obj.a);  // 1
```

---

## 6. 全局对象与全局变量

### 6.1 var 创建全局对象属性（浏览器）

```javascript
var globalVar = "I'm global";
console.log(window.globalVar);  // "I'm global"
console.log(globalVar === window.globalVar);  // true
```

### 6.2 let/const 不创建全局对象属性

```javascript
let globalLet = "I'm also global";
console.log(window.globalLet);  // undefined
console.log(globalLet);  // "I'm also global" - 变量存在，但不在 window 上
```

### 6.3 不声明直接赋值（非严格模式）

```javascript
function createGlobal() {
  implicitGlobal = "Oops";  // 未声明，自动创建全局变量
}
createGlobal();
console.log(window.implicitGlobal);  // "Oops"
```

**严格模式禁止**

```javascript
"use strict";
function createGlobal() {
  implicitGlobal = "Oops";  // ❌ ReferenceError
}
```

### 6.4 全局变量的最佳实践

```javascript
// ❌ 避免：污染全局
var config = { /*...*/ };

// ✅ 推荐：模块化
export const config = { /*...*/ };

// ✅ 推荐：命名空间
const MyApp = {
  config: { /*...*/ }
};
```

---

## 7. 作用域链预览

### 7.1 嵌套作用域

```javascript
let global = "global";

function outer() {
  let outerVar = "outer";
  
  function inner() {
    let innerVar = "inner";
    console.log(innerVar);   // "inner" - 本地变量
    console.log(outerVar);   // "outer" - 外层变量
    console.log(global);     // "global" - 全局变量
  }
  
  inner();
}

outer();
```

### 7.2 词法作用域（Lexical Scope）

**定义**：作用域在代码书写时确定，而非运行时。

```javascript
let x = "global";

function foo() {
  console.log(x);  // 访问哪个 x？
}

function bar() {
  let x = "bar";
  foo();  // 调用 foo
}

bar();  // 输出 "global"（而非 "bar"）
// 原因：foo 的作用域在定义时确定，访问全局 x
```

---

## 8. 易错点与最佳实践

### 8.1 循环中的闭包

```javascript
// ❌ 问题代码
var funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(function() {
    console.log(i);
  });
}
funcs[0]();  // 3
funcs[1]();  // 3
funcs[2]();  // 3

// ✅ 方案 1：let
var funcs = [];
for (let i = 0; i < 3; i++) {
  funcs.push(function() {
    console.log(i);
  });
}
funcs[0]();  // 0
funcs[1]();  // 1
funcs[2]();  // 2

// ✅ 方案 2：IIFE
var funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push((function(j) {
    return function() {
      console.log(j);
    };
  })(i));
}
```

### 8.2 const 与可变对象

```javascript
// ❌ 误解：const 声明的对象不可变
const config = { debug: true };
config.debug = false;  // ✅ 允许

// ✅ 需要深冻结
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      deepFreeze(obj[key]);
    }
  });
  return obj;
}

const config = deepFreeze({ debug: true, nested: { value: 1 } });
config.nested.value = 2;  // 严格模式下报错
```

### 8.3 块级作用域的利用

```javascript
// ✅ 利用块作用域限制变量生命周期
{
  let tempData = fetchData();
  let processed = process(tempData);
  // tempData 在块结束后不再可访问
  saveResult(processed);
}

// ✅ 避免变量污染
for (let i = 0; i < array.length; i++) {
  // i 只在循环内可见
}
// i 不污染外层作用域
```

---

## 9. 前端工程实践

### 9.1 ESLint 规则推荐

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-var': 'error',           // 禁用 var
    'prefer-const': 'error',     // 优先使用 const
    'no-use-before-define': 'error',  // 禁止先使用后声明
  }
};
```

### 9.2 声明方式选择

```javascript
// 决策树
// 1. 值是否会重新赋值？
//    └─ 否 → 使用 const
//    └─ 是 → 使用 let
// 2. 永远不使用 var（除非维护旧代码）

// ✅ 好的实践
const API_URL = "https://api.example.com";  // 不变的常量
let count = 0;  // 会改变的变量
for (let i = 0; i < 10; i++) {  // 循环变量
  count += i;
}
```

### 9.3 大型项目的变量组织

```javascript
// ✅ 使用模块避免全局变量
// config.js
export const API_CONFIG = {
  url: 'https://api.example.com',
  timeout: 5000
};

// utils.js
export function formatDate(date) {
  // ...
}

// main.js
import { API_CONFIG } from './config.js';
import { formatDate } from './utils.js';
```

---

## 关键要点

1. **三种声明方式的选择**
   - 优先使用 `const`，需要重新赋值时使用 `let`
   - 避免使用 `var`（除非维护旧代码）

2. **作用域差异**
   - `var`：函数作用域，忽略块级作用域
   - `let/const`：块级作用域，更符合直觉

3. **变量提升**
   - `var`：声明提升，初始化为 `undefined`
   - `let/const`：声明提升，但有暂时性死区（TDZ）
   - 函数声明：完整提升

4. **暂时性死区（TDZ）**
   - 从块开始到声明语句之间的区域
   - 访问 TDZ 中的变量会抛出 `ReferenceError`
   - `typeof` 在 TDZ 中也不再安全

5. **全局变量**
   - `var` 在全局作用域会创建 `window` 属性（浏览器）
   - `let/const` 不会创建全局对象属性
   - 避免隐式全局变量（不声明直接赋值）

---

## 深入一点

### 变量提升的实现原理

**编译阶段**：
1. 扫描所有声明（var、function、let、const）
2. 创建词法环境（Lexical Environment）
3. var：初始化为 undefined
4. let/const：创建但不初始化（TDZ）

**执行阶段**：
1. 执行代码
2. 遇到 let/const 声明语句时才初始化
3. 访问未初始化的 let/const 抛出 ReferenceError

### 块级作用域的内部实现

```javascript
// 源代码
{
  let x = 1;
  console.log(x);
}

// 引擎内部处理（简化版）
// 1. 创建新的词法环境
// 2. 将 x 绑定到该环境
// 3. 执行代码块
// 4. 销毁词法环境
```

---

## 参考资料

- [MDN: var](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/var)
- [MDN: let](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/let)
- [MDN: const](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/const)
- [ES6 标准入门：let 和 const](https://es6.ruanyifeng.com/#docs/let)

---

**上一章**：[JavaScript 语言特性与设计理念](./content-1.md)  
**下一章**：[数据类型概览](./content-3.md)
