# 调用栈与执行流程

> 理解函数调用的底层机制与栈管理

---

## 概述

调用栈（Call Stack）是 JavaScript 管理函数执行的核心机制。理解调用栈的工作原理，有助于我们调试代码、理解递归、避免栈溢出。

本章将深入：
- 调用栈的工作原理
- 栈帧的结构
- 栈溢出的原因与解决
- 尾调用优化（TCO）
- 调用栈的调试技巧

---

## 1. 调用栈的基本原理

### 1.1 栈的数据结构

**栈（Stack）**：后进先出（LIFO）的数据结构。

```
栈操作：
┌─────────┐
│  third  │ ← push
├─────────┤
│  second │
├─────────┤
│  first  │
└─────────┘
    ↓
┌─────────┐
│  third  │ ← pop
├─────────┤
│  second │
├─────────┤
│  first  │
└─────────┘
```

### 1.2 调用栈的工作流程

```javascript
function first() {
  console.log("进入 first");
  second();
  console.log("离开 first");
}

function second() {
  console.log("进入 second");
  third();
  console.log("离开 second");
}

function third() {
  console.log("进入 third");
  console.log("离开 third");
}

first();

// 调用栈的变化：
// 1. [全局上下文]
// 2. [全局上下文, first]           → "进入 first"
// 3. [全局上下文, first, second]   → "进入 second"
// 4. [全局上下文, first, second, third]  → "进入 third", "离开 third"
// 5. [全局上下文, first, second]   → "离开 second"
// 6. [全局上下文, first]           → "离开 first"
// 7. [全局上下文]
```

### 1.3 可视化调用栈

```javascript
function a() {
  console.log("a: start");
  b();
  console.log("a: end");
}

function b() {
  console.log("b: start");
  c();
  console.log("b: end");
}

function c() {
  console.log("c: start");
  console.trace();  // 打印调用栈
  console.log("c: end");
}

a();

// 输出：
// a: start
// b: start
// c: start
// Trace
//   at c (VM123:13)
//   at b (VM123:8)
//   at a (VM123:3)
//   at <anonymous>:1:1
// c: end
// b: end
// a: end
```

---

## 2. 栈帧（Stack Frame）

### 2.1 栈帧的组成

每个函数调用会创建一个栈帧，包含：

1. **局部变量**
2. **参数**
3. **返回地址**
4. **调用者信息**

```javascript
function calculate(a, b) {
  let result = a + b;
  let double = result * 2;
  return double;
}

calculate(3, 4);

// 栈帧内容：
// ┌──────────────────┐
// │ 返回地址         │
// ├──────────────────┤
// │ a: 3             │
// │ b: 4             │
// │ result: 7        │
// │ double: 14       │
// └──────────────────┘
```

### 2.2 栈帧的生命周期

```javascript
function outer(x) {
  let outerVar = x + 1;
  
  function inner(y) {
    let innerVar = y + 1;
    return outerVar + innerVar;
  }
  
  return inner(10);
}

outer(5);

// 执行过程：
// 1. 创建 outer 栈帧
//    - x: 5
//    - outerVar: 6
// 
// 2. 调用 inner，创建 inner 栈帧
//    - y: 10
//    - innerVar: 11
//    - 访问 outerVar（通过作用域链）
// 
// 3. inner 返回 17，销毁 inner 栈帧
// 4. outer 返回 17，销毁 outer 栈帧
```

---

## 3. 栈溢出（Stack Overflow）

### 3.1 无限递归

```javascript
// ❌ 栈溢出
function infiniteRecursion() {
  infiniteRecursion();  // 无终止条件
}

infiniteRecursion();
// RangeError: Maximum call stack size exceeded
```

### 3.2 栈的大小限制

```javascript
// 测试栈深度
function measureStackDepth() {
  let depth = 0;
  
  function recurse() {
    depth++;
    recurse();
  }
  
  try {
    recurse();
  } catch (e) {
    console.log("栈深度:", depth);
  }
}

measureStackDepth();
// Chrome: 约 15000
// Firefox: 约 50000
// Node.js: 约 15000
```

### 3.3 常见导致栈溢出的场景

**场景 1：递归无终止条件**

```javascript
// ❌ 错误
function factorial(n) {
  return n * factorial(n - 1);  // 缺少终止条件
}

factorial(5);  // 栈溢出

// ✅ 正确
function factorial(n) {
  if (n <= 1) return 1;  // 终止条件
  return n * factorial(n - 1);
}
```

**场景 2：相互递归**

```javascript
// ❌ 无限循环
function isEven(n) {
  if (n === 0) return true;
  return isOdd(n - 1);
}

function isOdd(n) {
  if (n === 0) return false;
  return isEven(n - 1);
}

isEven(10000000);  // 栈溢出

// ✅ 解决方案：使用迭代
function isEven(n) {
  return n % 2 === 0;
}
```

**场景 3：深层嵌套调用**

```javascript
// ❌ 处理大数组
function processArray(arr) {
  if (arr.length === 0) return 0;
  return arr[0] + processArray(arr.slice(1));
}

const bigArray = new Array(100000).fill(1);
processArray(bigArray);  // 栈溢出

// ✅ 使用迭代
function processArray(arr) {
  let sum = 0;
  for (let item of arr) {
    sum += item;
  }
  return sum;
}
```

---

## 4. 递归 vs 迭代

### 4.1 递归实现

```javascript
// 斐波那契数列（递归）
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));  // 55

// 问题：
// 1. 性能差（重复计算）
// 2. 大数值会栈溢出
console.time("递归");
fibonacci(40);
console.timeEnd("递归");  // 约 1000ms
```

### 4.2 迭代实现

```javascript
// 斐波那契数列（迭代）
function fibonacci(n) {
  if (n <= 1) return n;
  
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

console.log(fibonacci(10));  // 55

console.time("迭代");
fibonacci(40);
console.timeEnd("迭代");  // < 1ms
```

### 4.3 尾递归优化（理论）

```javascript
// 普通递归
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);  // 递归后还有操作
}

// 尾递归（递归是最后一个操作）
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc);  // 递归是最后操作
}

// 理论上，尾递归可以优化为迭代，不增加栈深度
// 但 JavaScript 大部分引擎不支持 TCO（见下文）
```

---

## 5. 尾调用优化（TCO）

### 5.1 什么是尾调用

**尾调用**：函数的最后一个操作是调用另一个函数。

```javascript
// ✅ 尾调用
function foo() {
  return bar();  // 最后操作是函数调用
}

// ❌ 非尾调用
function foo() {
  return bar() + 1;  // 调用后还有加法操作
}

function foo() {
  bar();  // 没有 return
}

function foo() {
  const result = bar();
  return result;  // 最后操作是 return 变量
}
```

### 5.2 尾调用优化的原理

**优化前**：

```
调用栈：
[全局, foo, bar]
```

**优化后**（TCO）：

```
调用栈：
[全局, bar]  // foo 的栈帧被 bar 复用
```

**关键**：既然 `foo` 的结果就是 `bar` 的结果，不需要保留 `foo` 的栈帧。

### 5.3 严格模式下的 TCO

```javascript
"use strict";

// 尾递归阶乘
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc);  // 尾调用
}

// 理论上可以处理大数值（如果引擎支持 TCO）
factorial(100000);  // 实际上大部分引擎仍会栈溢出
```

### 5.4 TCO 的现状

**支持情况**：
- Safari：支持（部分）
- Chrome：不支持（曾计划支持后放弃）
- Firefox：不支持
- Node.js：不支持（即使严格模式）

**原因**：
1. 实现复杂
2. 破坏调试体验（栈帧消失）
3. 不向后兼容

---

## 6. 手动实现尾调用优化

### 6.1 蹦床函数（Trampoline）

```javascript
// 蹦床函数：将递归转为迭代
function trampoline(fn) {
  return function(...args) {
    let result = fn(...args);
    
    // 持续执行，直到返回非函数值
    while (typeof result === 'function') {
      result = result();
    }
    
    return result;
  };
}

// 尾递归函数（返回函数而非直接递归）
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return () => factorial(n - 1, n * acc);  // 返回函数
}

// 使用蹦床函数
const optimizedFactorial = trampoline(factorial);
console.log(optimizedFactorial(100000));  // 不会栈溢出
```

### 6.2 自动转换尾递归

```javascript
// 将尾递归转为循环
function tco(fn) {
  return function(...args) {
    let result = fn(...args);
    
    while (result && result.isTailCall) {
      result = fn(...result.args);
    }
    
    return result;
  };
}

// 标记尾调用
function tailCall(fn, ...args) {
  return { isTailCall: true, fn, args };
}

// 尾递归实现
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return tailCall(factorial, n - 1, n * acc);
}

const optimized = tco(factorial);
console.log(optimized(5));  // 120
```

### 6.3 实用的递归优化

```javascript
// 分治法 + 迭代
function fibonacci(n) {
  const memo = { 0: 0, 1: 1 };
  
  function fib(n) {
    if (n in memo) return memo[n];
    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
  }
  
  return fib(n);
}

console.log(fibonacci(100));  // 快速且不会栈溢出

// 尾递归 + 记忆化
function sum(arr, acc = 0, i = 0) {
  if (i >= arr.length) return acc;
  return sum(arr, acc + arr[i], i + 1);
}

// 转为迭代（最佳）
function sum(arr) {
  return arr.reduce((acc, val) => acc + val, 0);
}
```

---

## 7. 异步与调用栈

### 7.1 异步代码的栈行为

```javascript
function a() {
  console.log("a: start");
  setTimeout(() => {
    console.log("a: setTimeout");
  }, 0);
  console.log("a: end");
}

function b() {
  console.log("b: start");
  a();
  console.log("b: end");
}

b();

// 输出：
// b: start
// a: start
// a: end
// b: end
// a: setTimeout  ← 异步，栈已清空

// 调用栈变化：
// 1. [全局, b]
// 2. [全局, b, a]
// 3. [全局, b]        (a 结束)
// 4. [全局]           (b 结束)
// 5. [setTimeout 回调] (新栈)
```

### 7.2 Promise 与调用栈

```javascript
function a() {
  console.log("a: start");
  Promise.resolve().then(() => {
    console.log("a: promise");
  });
  console.log("a: end");
}

function b() {
  console.log("b: start");
  a();
  console.log("b: end");
}

b();

// 输出：
// b: start
// a: start
// a: end
// b: end
// a: promise  ← 微任务，在栈清空后执行
```

### 7.3 async/await 与调用栈

```javascript
async function a() {
  console.log("a: start");
  await Promise.resolve();
  console.log("a: after await");
}

async function b() {
  console.log("b: start");
  await a();
  console.log("b: after await");
}

b();

// 输出：
// b: start
// a: start
// a: after await
// b: after await

// await 会暂停函数执行，栈帧保存状态
```

---

## 8. 调试调用栈

### 8.1 查看调用栈

```javascript
// 方法 1：console.trace()
function deep() {
  console.trace("当前调用栈");
}

function middle() {
  deep();
}

function shallow() {
  middle();
}

shallow();

// 方法 2：Error 对象
function getStack() {
  const error = new Error();
  return error.stack;
}

console.log(getStack());

// 方法 3：浏览器 DevTools
function buggyFunction() {
  debugger;  // 断点
  // ...
}
```

### 8.2 异常中的栈追踪

```javascript
function level3() {
  throw new Error("Something went wrong");
}

function level2() {
  level3();
}

function level1() {
  level2();
}

try {
  level1();
} catch (e) {
  console.error(e.stack);
  // Error: Something went wrong
  //   at level3 (...)
  //   at level2 (...)
  //   at level1 (...)
}
```

### 8.3 Source Map 与调用栈

```javascript
// 压缩后的代码
function a(){b()}function b(){c()}function c(){throw new Error}

// 有 Source Map 时，调用栈显示原始文件名和行号
// 无 Source Map 时，调用栈显示混淆后的代码
```

---

## 9. 前端工程实践

### 9.1 错误边界（React）

```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    // 捕获子组件的错误和调用栈
    console.error("Error:", error);
    console.error("Component stack:", info.componentStack);
    
    // 上报错误
    logErrorToService(error, info.componentStack);
  }
  
  render() {
    return this.props.children;
  }
}
```

### 9.2 性能分析

```javascript
// 使用 console.time 测量函数执行
function expensiveOperation() {
  console.time("expensiveOperation");
  
  // 长时间运行的代码
  for (let i = 0; i < 1000000; i++) {
    // ...
  }
  
  console.timeEnd("expensiveOperation");
}

// 使用 Performance API
function measurePerformance() {
  performance.mark("start");
  
  // 执行操作
  expensiveOperation();
  
  performance.mark("end");
  performance.measure("operation", "start", "end");
  
  const measure = performance.getEntriesByName("operation")[0];
  console.log(`Duration: ${measure.duration}ms`);
}
```

### 9.3 调用栈限制的实用建议

```javascript
// ❌ 避免深度递归
function processTree(node) {
  if (!node) return;
  processNode(node);
  node.children.forEach(processTree);  // 可能很深
}

// ✅ 使用队列迭代
function processTree(root) {
  const queue = [root];
  
  while (queue.length > 0) {
    const node = queue.shift();
    processNode(node);
    queue.push(...node.children);
  }
}

// ✅ 使用栈迭代（深度优先）
function processTree(root) {
  const stack = [root];
  
  while (stack.length > 0) {
    const node = stack.pop();
    processNode(node);
    stack.push(...node.children.reverse());
  }
}
```

---

## 10. 易错点与最佳实践

### 10.1 递归终止条件

```javascript
// ❌ 容易遗忘终止条件
function countdown(n) {
  console.log(n);
  countdown(n - 1);  // 无终止
}

// ✅ 明确终止条件
function countdown(n) {
  if (n < 0) return;  // 终止条件
  console.log(n);
  countdown(n - 1);
}
```

### 10.2 递归 vs 迭代的选择

```
递归适用：
- 树/图遍历
- 分治算法
- 问题本身递归定义

迭代适用：
- 大数据量处理
- 性能关键场景
- 避免栈溢出
```

### 10.3 监控栈深度

```javascript
// 运行时检查栈深度
let stackDepth = 0;
const MAX_DEPTH = 1000;

function recursiveFunction(n) {
  if (stackDepth++ > MAX_DEPTH) {
    stackDepth = 0;
    throw new Error("Stack depth exceeded");
  }
  
  if (n <= 0) {
    stackDepth = 0;
    return 0;
  }
  
  const result = n + recursiveFunction(n - 1);
  stackDepth--;
  return result;
}
```

---

## 关键要点

1. **调用栈机制**
   - LIFO 数据结构
   - 每次函数调用创建栈帧
   - 栈帧包含局部变量、参数、返回地址

2. **栈溢出**
   - 原因：递归层数过深
   - 栈大小：浏览器约 15000 层
   - 解决：终止条件、改用迭代、蹦床函数

3. **尾调用优化**
   - 理论：尾调用可复用栈帧
   - 现状：大部分引擎不支持
   - 替代：蹦床函数、手动迭代

4. **递归 vs 迭代**
   - 递归：简洁但可能栈溢出
   - 迭代：性能好、不溢出
   - 选择：根据数据规模和问题特性

5. **最佳实践**
   - 优先使用迭代处理大数据
   - 递归必须有明确终止条件
   - 使用调试工具查看调用栈
   - 错误上报包含栈信息

---

## 深入一点

### 栈内存布局

```
高地址
┌──────────────┐
│   参数 n     │
├──────────────┤
│   返回地址   │
├──────────────┤
│   旧 BP      │ ← BP（基址指针）
├──────────────┤
│  局部变量 1  │
├──────────────┤
│  局部变量 2  │
└──────────────┘ ← SP（栈指针）
低地址
```

### 异步代码的栈行为

```javascript
// 同步代码：栈连续
function sync() {
  a();
  b();
  c();
}
// 栈：[全局, sync, a] → [全局, sync, b] → [全局, sync, c]

// 异步代码：栈分段
function async() {
  a();
  setTimeout(b, 0);
  c();
}
// 栈 1：[全局, async, a] → [全局, async, c]
// 栈 2：[b]  ← 新栈
```

---

## 参考资料

- [MDN: 调用栈](https://developer.mozilla.org/zh-CN/docs/Glossary/Call_stack)
- [Understanding the JavaScript Call Stack](https://www.freecodecamp.org/news/understanding-the-javascript-call-stack-861e41ae61d4/)
- [Tail Call Optimization](https://2ality.com/2015/06/tail-call-optimization.html)
- [JavaScript深入之执行上下文栈](https://github.com/mqyqingfeng/Blog/issues/4)

---

**上一章**：[this 绑定机制](./content-9.md)  
**下一章**：[错误处理机制](./content-11.md)
