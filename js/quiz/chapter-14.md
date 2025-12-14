# 第 14 章：执行上下文与作用域链 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 执行上下文基础

### 题目

JavaScript 有哪几种执行上下文？

**选项：**
- A. 全局执行上下文、函数执行上下文
- B. 全局执行上下文、函数执行上下文、Eval 执行上下文
- C. 全局执行上下文、模块执行上下文
- D. 只有函数执行上下文

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**JavaScript 的三种执行上下文**

**1. 全局执行上下文（Global Execution Context）**
```javascript
// 程序启动时创建
var globalVar = 'global';

console.log(this);  // window（浏览器）或 global（Node.js）
```

**2. 函数执行上下文（Function Execution Context）**
```javascript
function foo() {
  var localVar = 'local';
  console.log(localVar);
}

foo();  // 创建函数执行上下文
```

**3. Eval 执行上下文（Eval Execution Context）**
```javascript
eval('var x = 10');
console.log(x);  // 10

// ⚠️ 不推荐使用 eval
```

---

**执行上下文的创建过程**

**创建阶段：**
1. **创建变量对象**（VO/AO）
2. **建立作用域链**
3. **确定 this 指向**

**执行阶段：**
1. **变量赋值**
2. **函数引用**
3. **执行代码**

```javascript
function example() {
  console.log(a);  // undefined（变量提升）
  var a = 10;
  console.log(a);  // 10
}

// 等价于
function example() {
  var a;  // 创建阶段：声明变量
  console.log(a);
  a = 10;  // 执行阶段：赋值
  console.log(a);
}
```

---

**执行上下文栈（Call Stack）**

```javascript
function first() {
  console.log('first');
  second();
}

function second() {
  console.log('second');
  third();
}

function third() {
  console.log('third');
}

first();

// 执行栈变化：
// [global]
// [global, first]
// [global, first, second]
// [global, first, second, third]
// [global, first, second]
// [global, first]
// [global]
```

---

**变量对象（Variable Object）**

```javascript
function test(a, b) {
  var c = 10;
  function inner() {}
  var d = function() {};
}

test(1, 2);

// 创建阶段的变量对象：
// VO(test) = {
//   arguments: { 0: 1, 1: 2, length: 2 },
//   a: 1,
//   b: 2,
//   c: undefined,
//   inner: <function reference>,
//   d: undefined
// }

// 执行阶段：
// AO(test) = {
//   arguments: { 0: 1, 1: 2, length: 2 },
//   a: 1,
//   b: 2,
//   c: 10,
//   inner: <function reference>,
//   d: <function reference>
// }
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 作用域链

### 题目

作用域链的本质是什么？

**选项：**
- A. 函数调用栈
- B. 变量对象的链表
- C. 原型链
- D. 闭包链

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**作用域链 = 变量对象的链表**

作用域链是由当前执行上下文的变量对象和所有父级执行上下文的变量对象组成的链表。

```javascript
var global = 'global';

function outer() {
  var outerVar = 'outer';
  
  function inner() {
    var innerVar = 'inner';
    console.log(global);    // 'global'
    console.log(outerVar);  // 'outer'
    console.log(innerVar);  // 'inner'
  }
  
  inner();
}

outer();

// 作用域链：
// inner: [innerAO, outerAO, globalVO]
// outer: [outerAO, globalVO]
// global: [globalVO]
```

---

**[[Scope]] 内部属性**

函数在创建时，会保存父级作用域链到 `[[Scope]]` 属性。

```javascript
function outer() {
  var x = 10;
  
  function inner() {
    console.log(x);
  }
  
  return inner;
}

const fn = outer();

// fn.[[Scope]] = [outerAO, globalVO]
// 即使 outer 执行完毕，inner 仍能访问 x（闭包）
```

---

**变量查找过程**

```javascript
var a = 1;

function foo() {
  var b = 2;
  
  function bar() {
    var c = 3;
    console.log(a + b + c);  // 6
  }
  
  bar();
}

foo();

// 查找过程：
// 1. 在 bar 的 AO 中查找 c → 找到：3
// 2. 在 bar 的 AO 中查找 b → 未找到
//    在 foo 的 AO 中查找 b → 找到：2
// 3. 在 bar 的 AO 中查找 a → 未找到
//    在 foo 的 AO 中查找 a → 未找到
//    在 global 的 VO 中查找 a → 找到：1
```

---

**作用域链 vs 原型链**

| 特性 | 作用域链 | 原型链 |
|------|----------|--------|
| 用途 | 变量查找 | 属性查找 |
| 构成 | 变量对象链 | 对象原型链 |
| 方向 | 内→外 | 子→父 |
| 关键字 | 无 | `__proto__` |

```javascript
// 作用域链
var x = 10;
function foo() {
  console.log(x);  // 沿作用域链查找
}

// 原型链
const obj = { x: 10 };
console.log(obj.toString());  // 沿原型链查找
```

---

**词法作用域 vs 动态作用域**

JavaScript 使用**词法作用域**（静态作用域），在函数定义时确定。

```javascript
var x = 10;

function foo() {
  console.log(x);
}

function bar() {
  var x = 20;
  foo();
}

bar();  // 10（词法作用域）
// 如果是动态作用域，输出 20
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 变量提升

### 题目

函数声明会被提升，函数表达式不会被提升。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**变量提升（Hoisting）**

```javascript
// 函数声明：整体提升
console.log(foo);  // [Function: foo]
foo();  // "Hello"

function foo() {
  console.log('Hello');
}

// 函数表达式：只提升变量声明
console.log(bar);  // undefined
bar();  // TypeError: bar is not a function

var bar = function() {
  console.log('World');
};
```

---

**提升的本质**

提升是执行上下文创建阶段的结果。

```javascript
// 代码
console.log(a);
var a = 10;
console.log(a);

// 等价于
var a;  // 创建阶段
console.log(a);  // undefined
a = 10;  // 执行阶段
console.log(a);  // 10
```

---

**不同声明方式的提升**

```javascript
// var：提升声明
console.log(a);  // undefined
var a = 1;

// let/const：TDZ（暂时性死区）
console.log(b);  // ReferenceError
let b = 2;

// function：整体提升
console.log(fn);  // [Function: fn]
function fn() {}

// class：不提升
console.log(MyClass);  // ReferenceError
class MyClass {}
```

---

**提升优先级**

```javascript
var foo = 1;
function foo() {
  return 2;
}

console.log(foo);  // 1

// 提升后：
// function foo() { return 2; }  // 函数声明先提升
// var foo;  // 变量声明被忽略（已存在）
// foo = 1;  // 变量赋值覆盖
```

---

**块级作用域与提升**

```javascript
// var：无块级作用域
{
  var x = 10;
}
console.log(x);  // 10

// let：块级作用域
{
  let y = 20;
}
console.log(y);  // ReferenceError

// 函数声明在块中（非严格模式）
{
  function foo() {
    return 1;
  }
}
console.log(foo);  // [Function: foo]（提升到外层）

// 严格模式下
'use strict';
{
  function bar() {
    return 2;
  }
}
console.log(bar);  // ReferenceError（块级作用域）
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 闭包与作用域链

### 题目

以下代码的输出是什么？

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 0);
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => {
    console.log(j);
  }, 0);
}
```

**选项：**
- A. `0 1 2 0 1 2`
- B. `3 3 3 0 1 2`
- C. `0 1 2 3 3 3`
- D. `3 3 3 3 3 3`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**var vs let 在循环中的区别**

```javascript
// var：没有块级作用域
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);  // 3, 3, 3
  }, 0);
}
// 所有回调共享同一个 i
// 循环结束后 i = 3

// let：块级作用域
for (let j = 0; j < 3; j++) {
  setTimeout(() => {
    console.log(j);  // 0, 1, 2
  }, 0);
}
// 每次迭代创建新的 j
```

---

**var 的问题原因**

```javascript
// 等价于
var i;
for (i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);  // 闭包引用同一个 i
  }, 0);
}
// 循环结束：i = 3
// 回调执行：打印 3
```

---

**let 的原理**

```javascript
// 等价于
{
  let j = 0;
  setTimeout(() => console.log(j), 0);  // 闭包捕获 j = 0
}
{
  let j = 1;
  setTimeout(() => console.log(j), 0);  // 闭包捕获 j = 1
}
{
  let j = 2;
  setTimeout(() => console.log(j), 0);  // 闭包捕获 j = 2
}
```

---

**使用 var 的解决方案**

**方案 1：IIFE（立即执行函数）**
```javascript
for (var i = 0; i < 3; i++) {
  (function(n) {
    setTimeout(() => {
      console.log(n);  // 0, 1, 2
    }, 0);
  })(i);
}
```

**方案 2：传参给 setTimeout**
```javascript
for (var i = 0; i < 3; i++) {
  setTimeout((n) => {
    console.log(n);  // 0, 1, 2
  }, 0, i);
}
```

**方案 3：bind**
```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(function(n) {
    console.log(n);  // 0, 1, 2
  }.bind(null, i), 0);
}
```

---

**实际应用：事件监听**

```javascript
// ❌ 错误
for (var i = 0; i < buttons.length; i++) {
  buttons[i].onclick = function() {
    console.log(i);  // 总是打印 buttons.length
  };
}

// ✅ 使用 let
for (let i = 0; i < buttons.length; i++) {
  buttons[i].onclick = function() {
    console.log(i);  // 打印对应索引
  };
}

// ✅ 使用闭包
for (var i = 0; i < buttons.length; i++) {
  buttons[i].onclick = (function(n) {
    return function() {
      console.log(n);
    };
  })(i);
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 闭包内存

### 题目

以下代码会造成内存泄漏吗？

```javascript
function createClosure() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    console.log('closure');
  };
}

const fn = createClosure();
```

**选项：**
- A. 会泄漏，因为 `largeData` 被闭包引用
- B. 不会泄漏，因为闭包没有使用 `largeData`
- C. 取决于 JavaScript 引擎优化
- D. 会泄漏，所有闭包都会造成内存泄漏

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**闭包与内存管理**

现代 JavaScript 引擎（V8）会优化未使用的变量。

```javascript
function createClosure() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    console.log('closure');  // 未使用 largeData
  };
}

const fn = createClosure();

// V8 优化：largeData 可能被回收
// 因为闭包没有引用它
```

---

**会造成内存泄漏的情况**

```javascript
// ❌ 闭包引用了大对象
function createClosure() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    console.log(largeData[0]);  // 引用了 largeData
  };
}

const fn = createClosure();
// largeData 无法被回收
```

---

**避免内存泄漏**

**方案 1：及时解除引用**
```javascript
let fn = createClosure();
// 使用完毕
fn = null;  // 解除引用，允许 GC
```

**方案 2：只保留需要的数据**
```javascript
function createClosure() {
  const largeData = new Array(1000000).fill('data');
  const firstItem = largeData[0];  // 只保留需要的
  
  return function() {
    console.log(firstItem);  // largeData 可以被回收
  };
}
```

**方案 3：使用 WeakMap**
```javascript
const cache = new WeakMap();

function process(element) {
  if (!cache.has(element)) {
    const data = computeExpensiveData();
    cache.set(element, data);
  }
  return cache.get(element);
}

// element 被移除后，data 自动回收
```

---

**常见内存泄漏场景**

**1. 意外的全局变量**
```javascript
function foo() {
  bar = 'global';  // 意外创建全局变量
}
```

**2. 定时器未清除**
```javascript
const timer = setInterval(() => {
  const data = getData();  // data 无法被回收
  console.log(data);
}, 1000);

// 应该在不需要时清除
clearInterval(timer);
```

**3. DOM 引用**
```javascript
const elements = [];

document.querySelectorAll('button').forEach(btn => {
  elements.push(btn);
  btn.onclick = () => console.log('clicked');
});

// DOM 元素被移除，但 elements 仍持有引用
```

**4. 闭包循环引用**
```javascript
function outer() {
  const obj = {};
  
  obj.fn = function() {
    console.log(obj);  // obj 引用 fn，fn 引用 obj
  };
  
  return obj.fn;
}
```

---

**检测内存泄漏**

```javascript
// Chrome DevTools
// 1. Memory Profiler
// 2. 拍摄堆快照
// 3. 对比前后快照
// 4. 查找 Detached DOM 和未释放对象

// 代码中监控
if (performance.memory) {
  console.log('Used:', performance.memory.usedJSHeapSize);
  console.log('Total:', performance.memory.totalJSHeapSize);
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码输出题  
**标签：** 作用域嵌套

### 题目

以下代码的输出是什么？

```javascript
var x = 10;

function foo() {
  console.log(x);
  var x = 20;
  console.log(x);
}

foo();
console.log(x);
```

**选项：**
- A. `10`, `20`, `10`
- B. `undefined`, `20`, `10`
- C. `10`, `20`, `20`
- D. `undefined`, `20`, `20`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**变量提升与作用域**

```javascript
var x = 10;  // 全局

function foo() {
  console.log(x);  // undefined（局部 x 提升）
  var x = 20;      // 局部
  console.log(x);  // 20
}

foo();
console.log(x);  // 10（全局）

// 等价于
var x = 10;

function foo() {
  var x;  // 变量提升
  console.log(x);  // undefined
  x = 20;
  console.log(x);  // 20
}

foo();
console.log(x);  // 10
```

---

**关键点**

1. 函数内的 `var x` 会提升到函数顶部
2. 第一个 `console.log(x)` 访问的是局部 `x`（已声明但未赋值）
3. 局部变量不影响全局变量

---

**对比：不使用 var**

```javascript
var x = 10;

function foo() {
  console.log(x);  // 10（访问全局）
  x = 20;          // 修改全局
  console.log(x);  // 20
}

foo();
console.log(x);  // 20（全局被修改）
```

---

**对比：使用 let**

```javascript
let x = 10;

function foo() {
  console.log(x);  // ReferenceError（TDZ）
  let x = 20;
  console.log(x);
}

foo();
```

---

**作用域链查找**

```javascript
var x = 'global';

function outer() {
  var x = 'outer';
  
  function inner() {
    console.log(x);  // 'outer'（最近的作用域）
  }
  
  inner();
}

outer();
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 执行上下文

### 题目

执行上下文包含哪些组成部分？

**选项：**
- A. 变量对象（Variable Object）
- B. 作用域链（Scope Chain）
- C. this 绑定
- D. 原型链（Prototype Chain）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**执行上下文的三个组成部分**

```javascript
ExecutionContext = {
  VariableObject: {  // 变量对象
    arguments,
    variables,
    functions
  },
  ScopeChain: [...],  // 作用域链
  this: value         // this 指向
}
```

---

**A. 变量对象（VO/AO）**

```javascript
function foo(a, b) {
  var c = 10;
  function bar() {}
  var d = function() {};
}

foo(1, 2);

// 变量对象
VO(foo) = {
  arguments: {
    0: 1,
    1: 2,
    length: 2
  },
  a: 1,
  b: 2,
  c: undefined → 10,
  bar: <function>,
  d: undefined → <function>
}
```

---

**B. 作用域链**

```javascript
var global = 'global';

function outer() {
  var outer = 'outer';
  
  function inner() {
    var inner = 'inner';
    console.log(global, outer, inner);
  }
  
  inner();
}

outer();

// 作用域链
inner.[[Scope]] = [
  innerAO,
  outerAO,
  globalVO
]
```

---

**C. this 绑定**

```javascript
// 全局上下文
console.log(this);  // window（浏览器）

// 函数上下文
function foo() {
  console.log(this);
}

foo();         // window（非严格模式）
foo.call({});  // {}（显式绑定）

const obj = {
  method() {
    console.log(this);  // obj
  }
};
obj.method();
```

---

**D 错误：原型链不是执行上下文的组成部分**

原型链是对象属性查找机制，与执行上下文无关。

```javascript
// 原型链：对象的属性查找
const obj = {};
obj.toString();  // 沿原型链查找

// 作用域链：变量查找
var x = 10;
function foo() {
  console.log(x);  // 沿作用域链查找
}
```

---

**ES6+ 的执行上下文**

```javascript
// 词法环境（Lexical Environment）
LexicalEnvironment = {
  EnvironmentRecord: {
    // let/const 变量
    // 函数声明
  },
  outer: <reference to parent>
}

// 变量环境（Variable Environment）
VariableEnvironment = {
  EnvironmentRecord: {
    // var 变量
  },
  outer: <reference to parent>
}

// this 绑定
ThisBinding: <value>
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** 作用域模拟

### 题目

实现一个函数，模拟块级作用域（在不支持 let/const 的环境）。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

**使用 IIFE 模拟块级作用域**

```javascript
// ES6 块级作用域
{
  let x = 10;
  console.log(x);  // 10
}
console.log(x);  // ReferenceError

// ES5 模拟（IIFE）
(function() {
  var x = 10;
  console.log(x);  // 10
})();
console.log(x);  // ReferenceError
```

---

**模拟 let 循环**

```javascript
// ES6
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 输出：0, 1, 2

// ES5 模拟
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}
// 输出：0, 1, 2
```

---

**完整的块级作用域模拟**

```javascript
function block(callback) {
  callback();
}

// 使用
block(function() {
  var x = 10;
  console.log(x);  // 10
});
console.log(typeof x);  // 'undefined'

// 带参数
function blockWithParams(params, callback) {
  callback.apply(null, params);
}

blockWithParams([1, 2], function(a, b) {
  console.log(a + b);  // 3
});
```

---

**模拟 const**

```javascript
function defineConst(name, value) {
  Object.defineProperty(window, name, {
    value: value,
    writable: false,
    configurable: false
  });
}

defineConst('PI', 3.14159);
console.log(PI);  // 3.14159
PI = 3;  // 静默失败（非严格模式）
console.log(PI);  // 3.14159
```

---

**完整示例：模拟 let/const**

```javascript
(function() {
  'use strict';
  
  // 模拟 let
  function createLet() {
    var scope = {};
    
    return {
      define(name, value) {
        if (name in scope) {
          throw new Error(`${name} has already been declared`);
        }
        scope[name] = value;
      },
      get(name) {
        if (!(name in scope)) {
          throw new ReferenceError(`${name} is not defined`);
        }
        return scope[name];
      },
      set(name, value) {
        if (!(name in scope)) {
          throw new ReferenceError(`${name} is not defined`);
        }
        scope[name] = value;
      }
    };
  }
  
  // 使用
  var myScope = createLet();
  
  myScope.define('x', 10);
  console.log(myScope.get('x'));  // 10
  
  myScope.set('x', 20);
  console.log(myScope.get('x'));  // 20
  
  // myScope.define('x', 30);  // Error: x has already been declared
})();
```

---

**模拟 TDZ（暂时性死区）**

```javascript
function createTDZ() {
  var declared = new Set();
  var initialized = new Set();
  
  return {
    declare(name) {
      declared.add(name);
    },
    initialize(name, value) {
      if (!declared.has(name)) {
        throw new ReferenceError(`${name} is not defined`);
      }
      initialized.add(name);
      this[name] = value;
    },
    access(name) {
      if (!declared.has(name)) {
        throw new ReferenceError(`${name} is not defined`);
      }
      if (!initialized.has(name)) {
        throw new ReferenceError(`Cannot access '${name}' before initialization`);
      }
      return this[name];
    }
  };
}

// 使用
var scope = createTDZ();
scope.declare('x');
// scope.access('x');  // Error: Cannot access 'x' before initialization
scope.initialize('x', 10);
console.log(scope.access('x'));  // 10
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** with 语句

### 题目

以下代码的输出是什么？为什么不推荐使用 `with`？

```javascript
var obj = { x: 10 };
var x = 20;

with (obj) {
  console.log(x);
  y = 30;
}

console.log(x);
console.log(y);
console.log(obj.y);
```

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**输出**
```
10
20
30
undefined
```

---

**代码分析**

```javascript
var obj = { x: 10 };
var x = 20;

with (obj) {
  console.log(x);  // 10（obj.x）
  y = 30;          // 创建全局变量（obj 没有 y）
}

console.log(x);      // 20（全局 x）
console.log(y);      // 30（全局 y）
console.log(obj.y);  // undefined
```

---

**with 的问题**

**1. 作用域混乱**
```javascript
var obj = { x: 1 };
var x = 2;

with (obj) {
  x = 3;  // 修改的是 obj.x 还是全局 x？
}

console.log(obj.x);  // 3
console.log(x);      // 2
```

**2. 性能问题**
```javascript
// with 会阻止编译器优化
with (obj) {
  // 每次属性访问都需要动态查找
  console.log(x);
  console.log(y);
  console.log(z);
}

// 推荐：直接访问
console.log(obj.x);
console.log(obj.y);
console.log(obj.z);
```

**3. 意外创建全局变量**
```javascript
var obj = {};

with (obj) {
  x = 10;  // 意外创建全局变量
}

console.log(window.x);  // 10
```

**4. 严格模式禁用**
```javascript
'use strict';

with (obj) {  // SyntaxError
  console.log(x);
}
```

---

**替代方案**

**方案 1：解构赋值**
```javascript
const obj = { x: 1, y: 2, z: 3 };

// ❌ with
with (obj) {
  console.log(x, y, z);
}

// ✅ 解构
const { x, y, z } = obj;
console.log(x, y, z);
```

**方案 2：短变量名**
```javascript
const obj = { veryLongPropertyName: 1 };

// ❌ with
with (obj) {
  console.log(veryLongPropertyName);
}

// ✅ 短变量
const o = obj;
console.log(o.veryLongPropertyName);
```

**方案 3：作用域函数**
```javascript
function withObj(obj, callback) {
  callback.call(obj);
}

withObj(obj, function() {
  console.log(this.x);
  console.log(this.y);
});
```

---

**with 的唯一合理用途（已废弃）**

```javascript
// 模板引擎（古老用法）
function render(template, data) {
  with (data) {
    return eval('`' + template + '`');
  }
}

const html = render(
  '<h1>${title}</h1><p>${content}</p>',
  { title: 'Hello', content: 'World' }
);

// 现代方案：模板字符串
const data = { title: 'Hello', content: 'World' };
const html = `<h1>${data.title}</h1><p>${data.content}</p>`;
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 执行上下文综合

### 题目

分析以下代码的执行过程，画出执行上下文栈的变化。

```javascript
var a = 1;

function foo(x) {
  var b = 2;
  function bar(y) {
    var c = 3;
    console.log(a + b + c + x + y);
  }
  bar(10);
}

foo(5);
```

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**执行过程分析**

**1. 创建全局执行上下文**
```javascript
GlobalContext = {
  VO: {
    a: undefined → 1,
    foo: <function>
  },
  ScopeChain: [GlobalVO],
  this: window
}

ExecutionStack = [GlobalContext]
```

**2. 执行 `foo(5)`**
```javascript
FooContext = {
  AO: {
    arguments: { 0: 5, length: 1 },
    x: 5,
    b: undefined → 2,
    bar: <function>
  },
  ScopeChain: [FooAO, GlobalVO],
  this: window
}

ExecutionStack = [GlobalContext, FooContext]
```

**3. 执行 `bar(10)`**
```javascript
BarContext = {
  AO: {
    arguments: { 0: 10, length: 1 },
    y: 10,
    c: undefined → 3
  },
  ScopeChain: [BarAO, FooAO, GlobalVO],
  this: window
}

ExecutionStack = [GlobalContext, FooContext, BarContext]
```

**4. 计算 `a + b + c + x + y`**
```javascript
// 沿作用域链查找
a: BarAO ✗ → FooAO ✗ → GlobalVO ✓ = 1
b: BarAO ✗ → FooAO ✓ = 2
c: BarAO ✓ = 3
x: BarAO ✗ → FooAO ✓ = 5
y: BarAO ✓ = 10

result = 1 + 2 + 3 + 5 + 10 = 21
```

**5. bar 执行完毕**
```javascript
ExecutionStack = [GlobalContext, FooContext]
// BarContext 出栈
```

**6. foo 执行完毕**
```javascript
ExecutionStack = [GlobalContext]
// FooContext 出栈
```

---

**执行上下文栈变化图**

```
执行 foo(5)前：
┌─────────────┐
│ GlobalContext│
└─────────────┘

执行 foo(5)：
┌─────────────┐
│  FooContext │
├─────────────┤
│ GlobalContext│
└─────────────┘

执行 bar(10)：
┌─────────────┐
│  BarContext │
├─────────────┤
│  FooContext │
├─────────────┤
│ GlobalContext│
└─────────────┘

bar 执行完：
┌─────────────┐
│  FooContext │
├─────────────┤
│ GlobalContext│
└─────────────┘

foo 执行完：
┌─────────────┐
│ GlobalContext│
└─────────────┘
```

---

**详细的作用域链**

```javascript
// 函数创建时
foo.[[Scope]] = [GlobalVO]
bar.[[Scope]] = [FooAO, GlobalVO]

// 函数执行时
FooContext.ScopeChain = [FooAO] + foo.[[Scope]]
                      = [FooAO, GlobalVO]

BarContext.ScopeChain = [BarAO] + bar.[[Scope]]
                      = [BarAO, FooAO, GlobalVO]
```

---

**完整的生命周期**

```javascript
// 1. 全局代码执行
// 创建 GlobalContext
// 变量提升：a = undefined, foo = <function>
// 执行：a = 1

// 2. 调用 foo(5)
// 创建 FooContext
// 参数：x = 5
// 变量提升：b = undefined, bar = <function>
// 执行：b = 2

// 3. 调用 bar(10)
// 创建 BarContext
// 参数：y = 10
// 变量提升：c = undefined
// 执行：c = 3, console.log(21)

// 4. bar 返回
// 销毁 BarContext

// 5. foo 返回
// 销毁 FooContext

// 6. 程序结束
// 销毁 GlobalContext
```

---

**如果有闭包**

```javascript
var a = 1;

function foo(x) {
  var b = 2;
  
  return function bar(y) {
    var c = 3;
    console.log(a + b + c + x + y);
  };
}

const closure = foo(5);
// foo 执行完，但 FooAO 不会被销毁
// 因为 bar 的 [[Scope]] 引用了它

closure(10);  // 21
// bar 仍能访问 FooAO 中的 b 和 x
```

</details>

---

**本章总结：**
- ✅ 执行上下文类型
- ✅ 作用域链本质
- ✅ 变量提升机制
- ✅ 闭包与作用域
- ✅ 闭包内存管理
- ✅ 作用域嵌套
- ✅ 执行上下文组成
- ✅ 块级作用域模拟
- ✅ with 语句问题
- ✅ 执行过程分析

**下一章：** [第 15 章：原型系统深入](./chapter-15.md)
