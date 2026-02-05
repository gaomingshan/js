# 执行上下文与作用域链

> 理解 JS 代码的执行过程与变量查找机制

---

## 概述

执行上下文（Execution Context）是 JavaScript 代码执行的环境，理解它是掌握作用域、闭包、this、变量提升的基础。

本章将深入：
- 执行上下文的创建与执行过程
- 词法环境与变量环境
- 作用域链的构建机制
- [[Scope]] 内部属性
- with 与 eval 的影响

---

## 1. 执行上下文的类型

### 1.1 三种执行上下文

**全局执行上下文**
- 程序启动时创建
- 全局对象：浏览器中的 `window`，Node.js 中的 `global`
- 只有一个

**函数执行上下文**
- 每次函数调用时创建
- 可以有无数个

**Eval 执行上下文**
- `eval()` 函数内部的代码
- 不推荐使用

```javascript
// 全局执行上下文
const globalVar = "global";

// 函数执行上下文
function outer() {
  const outerVar = "outer";
  
  function inner() {
    const innerVar = "inner";
    console.log(globalVar, outerVar, innerVar);
  }
  
  inner();  // 创建 inner 的执行上下文
}

outer();  // 创建 outer 的执行上下文
```

### 1.2 执行上下文栈（Call Stack）

**栈结构**：后进先出（LIFO）

```javascript
function first() {
  console.log("first");
  second();
  console.log("first again");
}

function second() {
  console.log("second");
  third();
  console.log("second again");
}

function third() {
  console.log("third");
}

first();

// 执行栈的变化：
// 1. [全局上下文]
// 2. [全局上下文, first]
// 3. [全局上下文, first, second]
// 4. [全局上下文, first, second, third]
// 5. [全局上下文, first, second]        (third 执行完毕)
// 6. [全局上下文, first]                (second 执行完毕)
// 7. [全局上下文]                       (first 执行完毕)
```

**可视化工具**

```javascript
// 使用 console.trace() 查看调用栈
function a() {
  b();
}

function b() {
  c();
}

function c() {
  console.trace();  // 打印完整调用栈
}

a();
// 输出：
// c @ VM123:2
// b @ VM123:6
// a @ VM123:10
// (anonymous) @ VM123:14
```

---

## 2. 执行上下文的组成

### 2.1 ES5 的执行上下文

```javascript
ExecutionContext = {
  // 变量对象（Variable Object）
  VO: {
    arguments,
    variables,
    functionDeclarations
  },
  
  // 作用域链
  ScopeChain: [VO, [[Scope]]],
  
  // this 绑定
  thisValue: this
}
```

### 2.2 ES6+ 的执行上下文

```javascript
ExecutionContext = {
  // 词法环境（Lexical Environment）
  LexicalEnvironment: {
    EnvironmentRecord: {
      // let/const 变量
      // 函数声明
    },
    outer: <外层词法环境引用>
  },
  
  // 变量环境（Variable Environment）
  VariableEnvironment: {
    EnvironmentRecord: {
      // var 变量
    },
    outer: <外层词法环境引用>
  },
  
  // this 绑定
  ThisBinding: <this 值>
}
```

**区别**：
- **词法环境**：用于存储 `let`、`const`、函数声明
- **变量环境**：用于存储 `var` 声明
- 这种分离解释了 `let/const` 的暂时性死区（TDZ）

---

## 3. 执行上下文的创建阶段

### 3.1 创建阶段的步骤

**步骤 1：创建变量对象/环境记录**

```javascript
function example(a, b) {
  var x = 1;
  let y = 2;
  const z = 3;
  
  function inner() {}
}

example(10, 20);

// 创建阶段的 VO/环境记录：
{
  arguments: { 0: 10, 1: 20, length: 2 },
  a: 10,
  b: 20,
  x: undefined,      // var：提升并初始化为 undefined
  // y 和 z 声明但未初始化（TDZ）
  inner: <function>  // 函数声明提升
}
```

**步骤 2：建立作用域链**

```javascript
// [[Scope]] 在函数定义时就确定了
function outer() {
  const outerVar = "outer";
  
  function inner() {
    const innerVar = "inner";
    console.log(outerVar);  // 通过作用域链访问
  }
  
  return inner;
}

// inner.[[Scope]] = [outer 的 AO, 全局 VO]
```

**步骤 3：确定 this 值**

```javascript
// 根据调用方式确定 this
obj.method();      // this → obj
method();          // this → window/undefined
new Func();        // this → 新对象
method.call(ctx);  // this → ctx
```

### 3.2 变量提升的本质

```javascript
console.log(x);  // undefined
var x = 1;

console.log(foo);  // [Function: foo]
function foo() {}

console.log(y);  // ❌ ReferenceError
let y = 2;

// 创建阶段：
// 1. var x：声明并初始化为 undefined
// 2. function foo：完整提升
// 3. let y：声明但未初始化（TDZ）
```

---

## 4. 执行上下文的执行阶段

### 4.1 代码执行

```javascript
function example() {
  console.log(x);  // undefined（创建阶段已初始化）
  var x = 1;
  console.log(x);  // 1（执行阶段赋值）
  
  console.log(y);  // ❌ ReferenceError（TDZ）
  let y = 2;
  console.log(y);  // 2
}

example();
```

### 4.2 完整示例

```javascript
var a = 10;

function outer(x) {
  var b = 20;
  
  function inner(y) {
    var c = 30;
    console.log(a, b, c, x, y);
  }
  
  inner(100);
}

outer(50);

// 执行过程：
// 1. 创建全局上下文
//    - VO: { a: undefined, outer: <function> }
// 2. 执行全局代码
//    - a = 10
// 3. 调用 outer(50)，创建 outer 上下文
//    - AO: { x: 50, b: undefined, inner: <function> }
//    - Scope Chain: [outer AO, 全局 VO]
// 4. 执行 outer 代码
//    - b = 20
// 5. 调用 inner(100)，创建 inner 上下文
//    - AO: { y: 100, c: undefined }
//    - Scope Chain: [inner AO, outer AO, 全局 VO]
// 6. 执行 inner 代码
//    - c = 30
//    - 查找变量：a(全局) b(outer) c(inner) x(outer) y(inner)
```

---

## 5. 词法环境与变量环境

### 5.1 词法环境的结构

```javascript
LexicalEnvironment = {
  EnvironmentRecord: {
    Type: "Declarative" | "Object" | "Function" | "Global",
    // 绑定的标识符
  },
  outer: <引用外层词法环境>
}
```

**环境记录类型**

| 类型 | 说明 | 示例 |
|------|------|------|
| 声明式环境记录 | 函数、块作用域 | `let`、`const`、函数参数 |
| 对象环境记录 | 全局、with | `window`、`with` 对象 |
| 函数环境记录 | 函数内部 | 包含 `this`、`arguments` |
| 全局环境记录 | 全局作用域 | 结合声明式和对象式 |

### 5.2 let/const 的块级作用域

```javascript
{
  let x = 1;
  const y = 2;
  
  {
    let x = 10;  // 新的词法环境
    console.log(x, y);  // 10, 2
  }
  
  console.log(x, y);  // 1, 2
}

// 词法环境的嵌套：
// 全局环境
//   └─ 外层块环境 { x: 1, y: 2 }
//       └─ 内层块环境 { x: 10 }
```

### 5.3 var 与 let/const 的差异

```javascript
// var：存储在变量环境
{
  var x = 1;
}
console.log(x);  // 1（函数作用域，块无法限制）

// let/const：存储在词法环境
{
  let y = 2;
}
console.log(y);  // ❌ ReferenceError（块级作用域）

// 原因：
// - var 的 EnvironmentRecord 在函数/全局级别
// - let/const 的 EnvironmentRecord 在块级别
```

---

## 6. 作用域链

### 6.1 作用域链的构建

**定义**：由当前环境记录和外层环境引用组成的链表。

```javascript
let global = "global";

function outer() {
  let outer = "outer";
  
  function inner() {
    let inner = "inner";
    
    // 作用域链查找顺序：
    // 1. inner 的环境记录
    // 2. outer 的环境记录
    // 3. 全局环境记录
    console.log(inner);  // "inner"（在第 1 层找到）
    console.log(outer);  // "outer"（在第 2 层找到）
    console.log(global); // "global"（在第 3 层找到）
  }
  
  return inner;
}

const fn = outer();
fn();

// fn.[[Scope]] = [outer 的词法环境, 全局词法环境]
```

### 6.2 [[Scope]] 属性

**定义**：函数的内部属性，保存函数定义时的作用域链。

```javascript
function createCounter() {
  let count = 0;
  
  return function() {
    return ++count;
  };
}

const counter = createCounter();

// counter.[[Scope]] = [createCounter 的 AO, 全局 VO]
// 即使 createCounter 执行完毕，counter 仍能访问 count
console.log(counter());  // 1
console.log(counter());  // 2
```

**关键点**：
- [[Scope]] 在函数**定义**时确定
- 不受函数**调用位置**影响（词法作用域）
- 是闭包的基础

### 6.3 词法作用域 vs 动态作用域

```javascript
let value = 1;

function foo() {
  console.log(value);
}

function bar() {
  let value = 2;
  foo();  // 调用位置
}

bar();  // 输出 1（而非 2）

// JavaScript 是词法作用域：
// foo 的 [[Scope]] 在定义时确定，包含全局作用域
// 与调用位置无关
```

**动态作用域（如 Bash）**

```bash
#!/bin/bash
value=1

foo() {
  echo $value
}

bar() {
  local value=2
  foo
}

bar  # 输出 2（动态作用域）
```

---

## 7. 变量查找机制

### 7.1 标识符解析

```javascript
let a = 1;

function outer() {
  let b = 2;
  
  function inner() {
    let c = 3;
    console.log(a, b, c);  // 查找 a、b、c
  }
  
  inner();
}

outer();

// 查找过程：
// 1. 查找 c：在 inner 的环境记录中找到
// 2. 查找 b：inner 中没有，沿 outer 链查找，在 outer 中找到
// 3. 查找 a：inner、outer 中都没有，沿 outer 链查找全局，找到
```

### 7.2 变量遮蔽（Shadowing）

```javascript
let x = "global";

function test() {
  let x = "local";
  
  console.log(x);  // "local"（遮蔽全局的 x）
  
  // 无法访问外层的同名变量
  // 除非使用 window.x（浏览器环境）
}

test();
```

### 7.3 性能优化：作用域链长度

```javascript
// ❌ 作用域链长
function outer() {
  function middle() {
    function inner() {
      // 访问全局变量需要遍历 3 层
      console.log(globalVar);
    }
    inner();
  }
  middle();
}

// ✅ 缓存外层变量
function outer() {
  const cached = globalVar;  // 缓存
  
  function middle() {
    function inner() {
      console.log(cached);  // 快速访问
    }
    inner();
  }
  middle();
}
```

---

## 8. with 语句（不推荐）

### 8.1 with 的作用

**目的**：简化对象属性访问。

```javascript
const obj = { a: 1, b: 2, c: 3 };

// 不使用 with
console.log(obj.a, obj.b, obj.c);

// 使用 with
with (obj) {
  console.log(a, b, c);  // 1, 2, 3
}
```

### 8.2 with 的问题

**问题 1：性能差**

```javascript
// with 会创建新的对象环境记录，导致性能下降
with (obj) {
  // 每次变量查找都要先查 obj
  // 引擎无法优化
}
```

**问题 2：变量泄漏**

```javascript
const obj = { a: 1 };

with (obj) {
  a = 2;      // 修改 obj.a
  b = 3;      // obj 没有 b，创建全局变量！
}

console.log(obj);     // { a: 2 }
console.log(window.b);  // 3（意外的全局变量）
```

**问题 3：不确定性**

```javascript
function foo(obj) {
  with (obj) {
    console.log(a);  // 是 obj.a 还是外层的 a？取决于运行时
  }
}

let a = 1;
foo({ a: 2 });  // 2
foo({});        // 1
```

### 8.3 替代方案

```javascript
// ✅ 解构赋值
const { a, b, c } = obj;
console.log(a, b, c);

// ✅ 临时变量
const o = obj;
console.log(o.a, o.b, o.c);
```

---

## 9. eval 语句（不推荐）

### 9.1 eval 的作用

**执行字符串代码**

```javascript
eval("var x = 1; console.log(x);");  // 1
console.log(x);  // 1（在当前作用域创建变量）
```

### 9.2 eval 的问题

**问题 1：安全风险**

```javascript
// 用户输入可能包含恶意代码
const userInput = "alert('XSS攻击')";
eval(userInput);  // 执行了恶意代码
```

**问题 2：性能问题**

```javascript
// 引擎无法优化包含 eval 的代码
function foo() {
  eval("var x = 1");  // 动态代码，引擎无法提前优化
  console.log(x);
}
```

**问题 3：作用域污染**

```javascript
function test() {
  eval("var x = 1");
  console.log(x);  // 1（eval 在当前作用域创建变量）
}

// 严格模式下，eval 有自己的作用域
function testStrict() {
  "use strict";
  eval("var x = 1");
  console.log(x);  // ❌ ReferenceError（隔离）
}
```

### 9.3 替代方案

```javascript
// ✅ Function 构造函数（不访问局部作用域）
const fn = new Function('a', 'b', 'return a + b');
console.log(fn(1, 2));  // 3

// ✅ JSON 解析
const data = JSON.parse('{"a": 1, "b": 2}');

// ✅ 模板引擎
const template = (data) => `Hello, ${data.name}!`;
console.log(template({ name: "Alice" }));
```

---

## 10. 前端工程实践

### 10.1 避免全局变量污染

```javascript
// ❌ 全局变量
var config = { /*...*/ };
function init() { /*...*/ }

// ✅ IIFE 模块模式
(function() {
  const config = { /*...*/ };
  function init() { /*...*/ }
  
  window.MyApp = { init };  // 只暴露必要接口
})();

// ✅ ES6 模块
// config.js
export const config = { /*...*/ };

// main.js
import { config } from './config.js';
```

### 10.2 利用闭包实现私有变量

```javascript
function createCounter() {
  let count = 0;  // 私有变量
  
  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment());  // 1
console.log(counter.count);        // undefined（无法直接访问）
```

### 10.3 调试技巧

```javascript
// 查看作用域链
function outer() {
  const outerVar = "outer";
  
  function inner() {
    const innerVar = "inner";
    debugger;  // 在此处暂停，查看 Scope 面板
  }
  
  inner();
}

// 使用 console.dir 查看函数属性
function test() {
  let x = 1;
  return function() {
    console.log(x);
  };
}

const fn = test();
console.dir(fn);  // 查看 [[Scopes]] 属性
```

---

## 11. 易错点与最佳实践

### 11.1 理解变量提升

```javascript
// ❌ 误解
function foo() {
  console.log(x);  // 认为报错
  let x = 1;
}

// 实际：ReferenceError（TDZ）

// ✅ 正确理解：let 也提升，但有 TDZ
```

### 11.2 避免闭包陷阱

```javascript
// ❌ 循环中的 var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出：3, 3, 3

// ✅ 使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出：0, 1, 2
```

### 11.3 减少作用域链查找

```javascript
// ❌ 频繁访问全局变量
function process(items) {
  for (let i = 0; i < items.length; i++) {
    // 每次循环都查找 document
    document.body.appendChild(items[i]);
  }
}

// ✅ 缓存全局变量
function process(items) {
  const body = document.body;  // 缓存
  for (let i = 0; i < items.length; i++) {
    body.appendChild(items[i]);
  }
}
```

---

## 关键要点

1. **执行上下文**
   - 三种类型：全局、函数、eval
   - 组成：词法环境、变量环境、this 绑定
   - 通过执行栈管理

2. **创建阶段**
   - 创建变量对象/环境记录
   - 建立作用域链
   - 确定 this 值
   - var 提升并初始化，let/const 提升但不初始化（TDZ）

3. **词法环境与变量环境**
   - 词法环境：let、const、函数声明
   - 变量环境：var 声明
   - 分离解释了 TDZ 的存在

4. **作用域链**
   - 由环境记录和外层引用组成
   - [[Scope]] 在函数定义时确定（词法作用域）
   - 变量查找沿着作用域链进行

5. **最佳实践**
   - 避免 with 和 eval
   - 使用块级作用域（let/const）
   - 缓存外层变量减少查找
   - 利用闭包实现私有变量

---

## 深入一点

### 执行上下文的完整生命周期

```
创建阶段：
  1. 创建变量对象/环境记录
  2. 建立作用域链
  3. 确定 this

执行阶段：
  1. 变量赋值
  2. 函数引用
  3. 执行代码

销毁阶段：
  1. 出栈
  2. 等待垃圾回收
```

### V8 的优化

**内联缓存（Inline Cache）**

```javascript
function getProperty(obj) {
  return obj.x;
}

// 多次调用相同"形状"的对象，V8 会优化
getProperty({ x: 1 });
getProperty({ x: 2 });
getProperty({ x: 3 });
```

**隐藏类（Hidden Class）**

```javascript
// 相同构造顺序的对象共享隐藏类
function Point(x, y) {
  this.x = x;
  this.y = y;
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// p1 和 p2 共享隐藏类，性能更好
```

---

## 参考资料

- [ECMAScript 规范：执行上下文](https://tc39.es/ecma262/#sec-execution-contexts)
- [MDN: 闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
- [Understanding Execution Context and Execution Stack](https://blog.bitsrc.io/understanding-execution-context-and-execution-stack-in-javascript-1c9ea8642dd0)
- [JavaScript深入之执行上下文栈](https://github.com/mqyqingfeng/Blog/issues/4)

---

**上一章**：[类型转换规则](./content-6.md)  
**下一章**：[闭包原理与应用](./content-8.md)
