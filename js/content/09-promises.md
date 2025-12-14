# Promise 详解

## 概述

Promise 是对“未来才会得到的值（future value）”的一种抽象：它把异步结果变成一个对象，从而让异步逻辑具备更强的**组合性**与更可控的**错误传播**。

与回调相比，Promise 的核心改进点是：

- 不再把“下一步”交给对方随意回调（降低控制反转带来的信任问题）
- 把异步流程变成可以**链式**与**并发组合**的结构

---

## 一、Promise 解决了什么问题

### 1.1 从“回调控制流”到“状态机对象”

回调模式的问题集中在：

- 控制流分散、嵌套深
- 错误传播靠约定，容易漏
- 并行/竞速/超时等控制流需要手写

Promise 的思路是：

- 用一个对象表示“异步的最终状态”：`pending → fulfilled/rejected`
- 用统一机制订阅结果：`then/catch/finally`

---

## 二、Promise 基础：状态与 then/catch/finally

### 2.1 三态与一次性（Once Settlement）

- `pending`：初始态
- `fulfilled`：成功
- `rejected`：失败

一旦从 `pending` 进入 `fulfilled/rejected`，状态就不可再改变。

### 2.2 then 的返回值规则（链式的本质）

`then` 会返回一个**新的 Promise**，它的状态由回调返回值决定：

- 返回普通值 → 新 Promise fulfilled（值为返回值）
- 抛出异常 → 新 Promise rejected（原因是异常）
- 返回 Promise/thenable → 新 Promise 跟随它（“同化”）

示例：

```js
Promise.resolve(1)
  .then((x) => x + 1)
  .then((x) => {
    if (x === 2) throw new Error('boom');
    return x;
  })
  .catch((e) => {
    console.log('caught:', e.message);
    return 0;
  })
  .then((x) => console.log('final:', x));
```

---

## 三、错误传播与恢复

### 3.1 Promise 的错误传播

链式调用中，异常会向后传播，直到遇到最近的 `catch`：

```js
doWork()
  .then(step1)
  .then(step2)
  .catch(handleError);
```

### 3.2 错误恢复（Recovery）

`catch` 里如果返回了一个值（或返回一个成功的 Promise），链路就会恢复为 fulfilled：

```js
fetchSomething()
  .catch(() => ({ fallback: true }))
  .then(console.log);
```

---

## 四、并发组合：all / allSettled / race / any

### 4.1 `Promise.all`

- 所有都成功 → 成功（结果数组顺序与输入一致）
- 任意一个失败 → 立即失败（短路）

适合：并行依赖的聚合。

### 4.2 `Promise.allSettled`

- 不短路：等全部结束
- 结果是 `{status, value|reason}` 的数组

适合：你想收集所有结果（成功/失败都要）。

### 4.3 `Promise.race`

- 谁先结束（成功或失败）就用谁

适合：超时控制（配合 timeout Promise）。

### 4.4 `Promise.any`

- 谁先成功用谁
- 全部失败才失败（错误是 AggregateError）

适合：多源请求的“择优成功”。

---

## 五、深入原理：微任务（Microtask）与 then 的异步性

Promise 的 `then/catch/finally` 回调不会在当前栈立即同步执行，而是进入 **微任务队列**。

```js
console.log(1);
Promise.resolve().then(() => console.log(2));
console.log(3);
// 1 3 2
```

> **为什么要这么设计？**
>
> - 保证 `then` 回调时机一致，避免“有时同步、有时异步”的 Zalgo。
> - 让链式语义更稳定：你可以在 `then` 后继续链式注册，不用担心错过。

---

## 六、最佳实践与常见坑

1. **不要滥用 `new Promise`**：能用现有 Promise/async 就不要手写构造。
2. **链式要记得 `return`**：忘记 `return` 会导致链路拿到 `undefined`。
3. **处理未捕获拒绝**：浏览器有 `unhandledrejection` 事件；Node 有对应警告/钩子。
4. **并发用 `Promise.all`，串行用链/async**：避免无意串行降低性能。
5. **Promise 不自带取消**：需要额外协议（如 `AbortController`）或库抽象。

---

## 参考资料

- [MDN - Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [ECMAScript 规范 - Promise 对象](https://tc39.es/ecma262/#sec-promise-objects)
- [MDN - Microtask](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide)
