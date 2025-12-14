# 事件循环规范详解

## 概述

事件循环（Event Loop）是 JavaScript 运行时的核心机制，它使得 JavaScript 能够在单线程环境中处理异步操作。

理解事件循环的关键在于：

- **调用栈**（Call Stack）：同步代码执行的地方
- **任务队列**（Task Queue）：宏任务 vs 微任务
- **Run-to-Completion**：一个任务执行时不会被中断

---

## 一、基本概念

### 1.1 调用栈（Call Stack）

JavaScript 是单线程的，所有代码都在调用栈中执行：

- **LIFO 结构**：后进先出
- **同步执行**：栈顶函数执行完才能执行下一个
- **栈溢出**：递归过深会导致 Stack Overflow

### 1.2 任务队列（Task Queue）

JavaScript 运行时包含多个任务队列：

- **宏任务队列**（Macrotask / Task Queue）
- **微任务队列**（Microtask Queue）

---

## 二、宏任务与微任务

### 2.1 宏任务（Macrotask）

宏任务由宿主环境发起：

- `script`（整体代码）
- `setTimeout / setInterval`
- `setImmediate`（Node.js）
- I/O
- UI rendering
- `requestAnimationFrame`

### 2.2 微任务（Microtask）

微任务由 JavaScript 引擎发起：

- `Promise.then / catch / finally`
- `MutationObserver`
- `queueMicrotask()`
- `process.nextTick()`（Node.js，优先级最高）

关键差异：

```text
微任务优先级 > 宏任务优先级

每个宏任务执行完毕后，会清空所有微任务队列，
然后才会执行下一个宏任务。
```

---

## 三、事件循环执行流程

### 3.1 标准流程（简化版）

```text
1. 执行同步代码（调用栈）

2. 调用栈清空后，检查微任务队列
   - 执行所有微任务
   - 如果微任务产生新的微任务，继续执行
   - 直到微任务队列为空

3. 渲染（如果需要）
   - 浏览器可能会进行 UI 渲染

4. 取出一个宏任务执行

5. 回到步骤 2，重复循环
```

### 3.2 执行顺序示例

```js
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// 输出：1, 4, 3, 2
```

---

## 四、关键时序问题

### 4.1 微任务的递归

微任务可以无限递归添加微任务，会阻塞渲染：

```js
// ⚠️ 危险操作：会阻塞主线程！
function recursiveMicrotask() {
  Promise.resolve().then(recursiveMicrotask);
}

// recursiveMicrotask(); // 不要运行
```

### 4.2 宏任务的间隔

宏任务之间可以进行渲染，微任务不行。

---

## 五、浏览器与 Node.js 的差异

### 5.1 浏览器事件循环

- 每个标签页有独立的事件循环
- Web Workers 有自己的事件循环
- 包含渲染阶段

### 5.2 Node.js 事件循环

Node.js 事件循环的 6 个阶段：

```text
┌───────────────────────────┐
│        timers             │ setTimeout/setInterval
├───────────────────────────┤
│     pending callbacks     │ 系统操作的回调
├───────────────────────────┤
│       idle, prepare       │ 内部使用
├───────────────────────────┤
│        poll               │ I/O 回调
├───────────────────────────┤
│        check              │ setImmediate
├───────────────────────────┤
│    close callbacks        │ socket.on('close')
└───────────────────────────┘
```

### 5.3 process.nextTick()

Node.js 特有，优先级高于所有微任务：

```text
process.nextTick > Promise.then > setTimeout
```

---

## 六、性能优化

### 6.1 避免长任务

最佳实践：

- 将长任务拆分成多个短任务
- 使用 `setTimeout(..., 0)` 让出主线程
- 使用 Web Workers 处理计算密集型任务
- 使用 `requestIdleCallback` 执行低优先级任务

### 6.2 合理使用微任务

- 微任务适合快速的状态更新
- 避免在微任务中执行耗时操作
- 注意微任务的递归问题

---

## 七、常见误区

### 7.1 setTimeout(..., 0) 的误解

`setTimeout(..., 0)` 并不是立即执行，而是在下一个宏任务执行。

### 7.2 async/await 的本质

`async/await` 本质上是 Promise 的语法糖，遵循微任务规则。

### 7.3 事件循环不是多线程

JavaScript 始终是单线程的，事件循环只是调度机制。

---

## 八、最佳实践

1. **理解执行顺序**：同步 → 微任务 → 宏任务。
2. **避免长任务**：拆分任务，让出主线程。
3. **利用微任务**：批量更新状态。
4. **Worker 处理密集计算**：不阻塞主线程。

---

## 参考资料

- [HTML - Event Loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
- [ECMAScript - Jobs](https://tc39.es/ecma262/#sec-jobs)
- [Node.js - Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Jake Archibald - Tasks, microtasks, queues](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
