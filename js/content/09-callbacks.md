# 回调函数模式

## 概述

回调函数（callback）是 JavaScript 中最基础的控制反转（Inversion of Control）手段之一：你把“后续要做什么”以函数的形式交给另一个函数，在特定时机（同步/异步、成功/失败、事件发生等）由对方回调执行。

理解回调模式，是理解异步编程（事件循环、任务队列）、事件系统（观察者模式）、以及 Promise/async-await 为什么出现的关键一步。

---

## 一、什么是回调函数

### 1.1 回调函数定义

回调函数是**作为参数传递**给另一个函数的函数，在某个事件或条件满足时被调用。

```js
function fetchData(callback) {
  // 模拟异步操作
  setTimeout(() => {
    const data = { id: 1, name: 'Alice' };
    callback(data);
  }, 1000);
}

fetchData((data) => {
  console.log('收到数据:', data);
});
```

> **关键点**
>
> - `fetchData` 并不知道“收到数据后要做什么”，它把这部分交给外部传入的 `callback`。
> - 这就是“控制反转”：控制流从调用者（你）反转到被调用者（`fetchData`/宿主环境）手里。

### 1.2 同步回调 vs 异步回调

**同步回调**：在当前调用栈内立即执行。

```js
[1, 2, 3].forEach((item) => {
  console.log(item); // 同步执行
});
```

**异步回调**：在未来某个时机执行（通常需要事件循环调度）。

```js
setTimeout(() => {
  console.log('异步执行');
}, 1000);
```

> **理解方式**
>
> - 同步回调：函数调用期间就执行，仍在同一条执行路径里。
> - 异步回调：先注册“将来要执行的函数”，当计时器/IO/事件等完成后再进入队列等待执行。

---

## 二、常见回调模式

### 2.1 Error-First 回调（Node.js 风格）

Error-First 是一种约定：回调的**第一个参数为错误**，第二个才是结果。

```js
function readFile(path, callback) {
  setTimeout(() => {
    if (!path) {
      callback(new Error('路径不能为空'), null);
      return;
    }
    callback(null, '文件内容');
  }, 1000);
}

readFile('test.txt', (err, data) => {
  if (err) {
    console.error('错误:', err.message);
    return;
  }
  console.log('数据:', data);
});
```

> **为什么是 Error-First？（深入一点）**
>
> - `try/catch` 只能捕获**同一调用栈**上的异常；异步回调执行时已经不在原来的栈里。
> - 用 `err` 参数把错误“显式化”，形成统一的错误通道。
> - 也便于上层做错误传播（比如把 `err` 继续传给上层回调）。

### 2.2 事件监听回调（Observer / Pub-Sub）

DOM 事件是典型回调：你注册监听器，事件发生时由浏览器回调。

```js
button.addEventListener('click', (event) => {
  console.log('按钮被点击', event.type);
});
```

自定义事件系统（简化版）：

```js
class EventEmitter {
  constructor() {
    this.events = Object.create(null);
  }

  on(event, callback) {
    (this.events[event] ||= []).push(callback);
  }

  emit(event, payload) {
    for (const cb of this.events[event] || []) {
      cb(payload);
    }
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }
}
```

> **注意**
>
> - 事件监听是“长期回调”（可能触发多次）；需要考虑 `off` 清理，避免内存泄漏。
> - DOM 事件还涉及捕获/冒泡、默认行为、委托等（属于事件系统更深入话题）。

---

## 三、回调地狱（Callback Hell）

### 3.1 什么是回调地狱

多层嵌套回调导致代码呈“金字塔”，难以阅读维护：

```js
getData(function (a) {
  getMoreData(a, function (b) {
    getMoreData(b, function (c) {
      getMoreData(c, function (d) {
        console.log(d);
      });
    });
  });
});
```

### 3.2 回调地狱的问题

- **可读性差**：代码横向增长，逻辑不直观。
- **错误处理难**：每一层都要写 `if (err) return ...`。
- **复用困难**：业务逻辑与流程控制粘在一起。
- **难以组合**：并行、重试、超时、取消等能力不自然。

> **更深一层：回调的“信任问题”**
>
> 回调是一种控制反转：你把“下一步”交出去，就需要相信对方：
>
> - 只调用一次（不会重复调用）
> - 一定会调用（不会永远不调用）
> - 在合适时机调用（不会同步/异步混用造成 Zalgo）
>
> 这些“不可控”促成了 Promise 等更强抽象的出现。

---

## 四、改善回调代码

### 4.1 提取命名函数

```js
function handleMoreData(b) {
  console.log(b);
}

function handleData(a) {
  getMoreData(a, handleMoreData);
}

getData(handleData);
```

### 4.2 模块化：用对象组织回调

```js
const handlers = {
  onSuccess(data) {
    console.log('成功:', data);
  },
  onError(error) {
    console.error('错误:', error);
  }
};

fetchData(handlers.onSuccess, handlers.onError);
```

### 4.3 提前返回（Guard Clauses）

```js
function processData(data, callback) {
  if (!data) return callback(new Error('无数据'));
  if (!data.isValid) return callback(new Error('数据无效'));

  const processedData = { ...data, processed: true };
  callback(null, processedData);
}
```

---

## 五、回调函数最佳实践

1. **统一错误通道**：优先使用 Error-First 约定。
2. **回调只调用一次**：必要时使用 `once` 包装器防重入。
3. **避免“Zalgo”（同步/异步不一致）**：尽量保证回调总是异步触发。
4. **保证提前返回**：调用回调后 `return`，避免继续执行造成二次回调。
5. **关注资源清理**：事件监听要可解除，定时器要能清理。
6. **深层嵌套就重构**：提取函数、拆模块，必要时升级到 Promise/async。

一个常用的 `once`：

```js
function once(fn) {
  let called = false;
  return (...args) => {
    if (called) return;
    called = true;
    fn(...args);
  };
}
```

---

## 六、回调的局限性

- **组合能力弱**：串行/并行需要手写控制流。
- **错误传播靠约定**：容易漏处理。
- **取消能力弱**：回调一旦注册，取消往往需要额外协议。
- **可测试性与可读性问题**：尤其在复杂异步链路中。

这些局限促成了：

- Promise：把“未来值”变成对象，可组合、可链式。
- async/await：让异步控制流接近同步。
- 流（Stream）/Observable：更适合多次事件与时间序列。

---

## 七、深入原理：回调与事件循环（最小必要版）

下面代码的输出顺序是什么？

```js
console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve().then(() => console.log('C'));

console.log('D');
```

输出通常是：`A D C B`

> **原因（简化）**
>
> - 同步代码先跑完：`A`、`D`
> - `Promise.then` 的回调进入**微任务队列**，当前栈清空后优先执行：`C`
> - `setTimeout` 回调进入**宏任务队列**，在下一轮事件循环执行：`B`

---

## 参考资料

- [Callback Hell](http://callbackhell.com/)
- [MDN - Callback function](https://developer.mozilla.org/zh-CN/docs/Glossary/Callback_function)
- [MDN - 并发模型与事件循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop)
