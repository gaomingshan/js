# 宏任务与微任务

## 概述

宏任务（Macro Task）和微任务（Micro Task）是事件循环中的两种任务队列。

理解它们的关键在于：

- **执行时机不同**：微任务优先于宏任务
- **清空策略不同**：微任务队列会被完全清空
- **来源不同**：宏任务由宿主环境发起，微任务由 JS 引擎发起

---

## 一、任务队列分类

### 1.1 宏任务（Macro Task）

- `script`（整体代码）
- `setTimeout / setInterval`
- `setImmediate`（Node.js）
- I/O 操作
- UI 交互事件
- `postMessage`
- `MessageChannel`

### 1.2 微任务（Micro Task）

- `Promise.then / catch / finally`
- `async/await`
- `queueMicrotask()`
- `MutationObserver`
- `process.nextTick`（Node.js）

---

## 二、执行机制

### 2.1 基本流程

```text
1. 执行一个宏任务（首次是整体代码）
2. 执行过程中产生的微任务加入微任务队列
3. 宏任务执行完毕后，检查微任务队列
4. 执行所有微任务（微任务中产生的新微任务也会执行）
5. 微任务队列清空后，进行渲染（如果需要）
6. 开始下一轮，执行下一个宏任务
7. 重复上述流程
```

### 2.2 可视化流程

```text
宏任务1
  ↓
微任务队列（清空）
  ↓
渲染（可选）
  ↓
宏任务2
  ↓
微任务队列（清空）
  ↓
渲染（可选）
  ...
```

---

## 三、执行顺序示例

### 3.1 基础示例

```js
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');

// 执行分析：
// 第一个宏任务（script）：
//   同步代码：1, 4
//   产生微任务：Promise.then
//   产生宏任务：setTimeout
//
// 微任务队列：
//   执行 Promise.then：3
//
// 第二个宏任务：
//   执行 setTimeout：2
//
// 输出：1 → 4 → 3 → 2
```

### 3.2 嵌套示例

```js
setTimeout(() => {
  console.log('timeout1');
  Promise.resolve().then(() => {
    console.log('promise1');
  });
}, 0);

setTimeout(() => {
  console.log('timeout2');
  Promise.resolve().then(() => {
    console.log('promise2');
  });
}, 0);

// 输出：timeout1 → promise1 → timeout2 → promise2
```

---

## 四、微任务优先级

### 4.1 同级微任务

微任务按加入顺序执行：

```js
Promise.resolve().then(() => {
  console.log('promise1');
});

queueMicrotask(() => {
  console.log('microtask1');
});

Promise.resolve().then(() => {
  console.log('promise2');
});

// 输出：promise1 → microtask1 → promise2
```

### 4.2 Node.js 中的 nextTick

```js
// process.nextTick 优先级最高
Promise.resolve().then(() => {
  console.log('promise');
});

process.nextTick(() => {
  console.log('nextTick');
});

queueMicrotask(() => {
  console.log('microtask');
});

// Node.js 输出：
// nextTick → promise → microtask
```

---

## 五、常见陷阱

### 5.1 微任务阻塞

大量微任务会阻塞渲染和宏任务：

```js
function recursiveMicrotask(n) {
  if (n <= 0) return;

  Promise.resolve().then(() => {
    console.log(n);
    recursiveMicrotask(n - 1);
  });
}

// 产生 1000 个微任务
recursiveMicrotask(1000);

setTimeout(() => {
  console.log('这个要等很久');
}, 0);
```

### 5.2 Promise 构造函数

Promise 构造函数内的代码是**同步的**：

```js
new Promise(resolve => {
  console.log('1'); // 同步
  resolve();
  console.log('2'); // 同步
}).then(() => {
  console.log('3'); // 微任务
});

console.log('4');

// 输出：1 → 2 → 4 → 3
```

### 5.3 async 函数执行时机

```js
async function test() {
  console.log('1'); // 同步
  await Promise.resolve();
  console.log('2'); // 微任务
}

test();
console.log('3');

// 输出：1 → 3 → 2
```

await 之前是同步，await 之后是微任务。

---

## 六、实际应用

### 6.1 批量更新

使用微任务实现批量更新 DOM：

```js
class BatchUpdater {
  constructor() {
    this.updates = [];
    this.pending = false;
  }

  add(update) {
    this.updates.push(update);

    if (!this.pending) {
      this.pending = true;
      queueMicrotask(() => this.flush());
    }
  }

  flush() {
    const updates = this.updates.slice();
    this.updates = [];
    this.pending = false;

    updates.forEach(update => update());
  }
}
```

### 6.2 任务调度

根据优先级调度任务：

```js
class TaskScheduler {
  highPriority(task) {
    queueMicrotask(task); // 微任务
  }

  normalPriority(task) {
    Promise.resolve().then(task); // 微任务
  }

  lowPriority(task) {
    setTimeout(task, 0); // 宏任务
  }
}
```

---

## 七、最佳实践

1. **理解执行顺序**：微任务在宏任务之间。
2. **避免长时间微任务**：会阻塞渲染。
3. **使用 queueMicrotask**：明确的微任务 API。
4. **注意 Promise 构造函数**：内部是同步的。
5. **合理使用 setTimeout(0)**：让出执行权。
6. **批量操作用微任务**：提高性能。

---

## 参考资料

- [HTML Standard - Event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
- [Node.js - Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
