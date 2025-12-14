# 事件循环机制（Event Loop）

## 概述

JavaScript 常被描述为“单线程”，但浏览器/Node.js 又能处理计时器、网络 IO、文件 IO、渲染、事件等并发任务。

这背后的关键是：

- **调用栈（Call Stack）**：执行同步代码
- **宿主能力（Web APIs / libuv）**：执行计时器与 IO
- **任务队列（Task Queues）**：把回调排队
- **事件循环（Event Loop）**：选择合适的时机把队列里的回调推回调用栈

---

## 一、最小模型：调用栈 + 队列

你可以先记住一句话：

> **同步先跑完，异步回调进队列；栈清空后，事件循环再把回调拿出来执行。**

```js
console.log('start');
setTimeout(() => console.log('timeout'), 0);
console.log('end');
// start end timeout
```

---

## 二、宏任务与微任务

### 2.1 为什么要分两种队列

为了让某些异步回调“更快、更可控”，宿主环境通常把任务分成：

- **宏任务（task / macrotask）**：如 `setTimeout`、`setInterval`、I/O、UI 事件等
- **微任务（microtask）**：如 `Promise.then/catch/finally`、`queueMicrotask`、MutationObserver（浏览器）

执行顺序（简化版，浏览器常见）：

1. 执行一个宏任务（通常是脚本或计时器回调）
2. 清空微任务队列（把所有微任务执行完）
3. 可能进行渲染
4. 进入下一轮事件循环

### 2.2 经典顺序题

```js
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
// A D C B
```

---

## 三、常见 API 属于哪一类任务

### 3.1 浏览器常见归类（经验版）

- **宏任务**：`setTimeout`、`setInterval`、DOM 事件回调、`postMessage`
- **微任务**：`Promise.then`、`queueMicrotask`、MutationObserver
- **渲染前回调**：`requestAnimationFrame`

> **注意**
>
> 具体细节受浏览器实现与标准影响，但“微任务优先于下一轮宏任务”这个规律很稳定。

### 3.2 Node.js 的差异提示

Node.js 还存在：

- `process.nextTick`（优先级甚至高于微任务，容易饿死 IO）
- `setImmediate`（与 timers 有不同阶段）

本文以浏览器模型为主，Node 的完整阶段可参考 libuv 文档。

---

## 四、深入一点：为什么 setTimeout(0) 也不会“立刻执行”

`setTimeout(fn, 0)` 的含义不是“马上执行”，而是：

- 等**当前调用栈清空**
- 等到事件循环选中下一轮宏任务
- 同时还受到**最小延迟**与**计时器精度**影响（浏览器可能做 clamping）

因此它更像是“把回调推迟到下一轮”。

---

## 五、调试事件循环：你应该怎么验证

1. **写最小复现**：用 10 行内的代码验证顺序。
2. **把 log 标号**：`A1/A2` 等，避免看串。
3. **理解队列归属**：先判断是宏任务还是微任务。
4. **区分浏览器/Node**：同一段代码在不同环境可能顺序不同。

---

## 参考资料

- [MDN - 并发模型与事件循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop)
- [MDN - queueMicrotask](https://developer.mozilla.org/zh-CN/docs/Web/API/queueMicrotask)
- [Node.js - Event Loop, Timers, and process.nextTick](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
