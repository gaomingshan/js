# 事件循环机制

> 理解 JavaScript 异步执行的核心原理

---

## 概述

事件循环（Event Loop）是 JavaScript 运行时的核心机制，负责协调代码执行、事件处理、异步任务。理解事件循环是掌握 JavaScript 异步编程的关键。

本章将深入：
- 调用栈与任务队列
- 宏任务与微任务
- 事件循环的执行流程
- 浏览器与 Node.js 的区别
- 实际应用与优化

---

## 1. JavaScript 运行时模型

### 1.1 单线程特性

```javascript
// JavaScript 是单线程的
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

console.log("3");

// 输出：1, 3, 2
// 即使 setTimeout 是 0ms，也会在同步代码后执行
```

### 1.2 运行时组件

```
┌─────────────────────────────────┐
│        JavaScript 引擎           │
│  ┌──────────────────────────┐   │
│  │     调用栈 (Call Stack)   │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │      堆 (Heap)           │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
              │
              ↓
┌─────────────────────────────────┐
│         Web APIs                │
│  - setTimeout/setInterval        │
│  - fetch/XMLHttpRequest         │
│  - DOM Events                   │
│  - Promise                      │
└─────────────────────────────────┘
              │
              ↓
┌─────────────────────────────────┐
│        任务队列                  │
│  ┌──────────────────────────┐   │
│  │   宏任务队列 (Task Queue) │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ 微任务队列 (Microtask Queue)│   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
              │
              ↓
         Event Loop
```

---

## 2. 调用栈（Call Stack）

### 2.1 栈的工作原理

```javascript
function third() {
  console.log("third");
}

function second() {
  console.log("second");
  third();
}

function first() {
  console.log("first");
  second();
}

first();

// 调用栈的变化：
// 1. [first]
// 2. [first, second]
// 3. [first, second, third]
// 4. [first, second]       (third 执行完)
// 5. [first]               (second 执行完)
// 6. []                    (first 执行完)
```

### 2.2 栈溢出

```javascript
function recursion() {
  recursion();  // 无限递归
}

try {
  recursion();
} catch (e) {
  console.error(e);  // RangeError: Maximum call stack size exceeded
}
```

---

## 3. 任务队列

### 3.1 宏任务（Macro Task）

**宏任务来源**：
- `setTimeout`
- `setInterval`
- `setImmediate`（Node.js）
- I/O 操作
- UI 渲染
- `MessageChannel`
- `requestAnimationFrame`

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

console.log("3");

// 输出：1, 3, 2
// setTimeout 是宏任务，在下一轮事件循环执行
```

### 3.2 微任务（Micro Task）

**微任务来源**：
- `Promise.then/catch/finally`
- `MutationObserver`
- `queueMicrotask`
- `process.nextTick`（Node.js，优先级最高）

```javascript
console.log("1");

Promise.resolve().then(() => {
  console.log("2");
});

console.log("3");

// 输出：1, 3, 2
// Promise.then 是微任务，在当前宏任务结束后立即执行
```

### 3.3 宏任务 vs 微任务

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");  // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log("3");  // 微任务
});

console.log("4");

// 输出：1, 4, 3, 2
// 执行顺序：
// 1. 同步代码：1, 4
// 2. 微任务：3
// 3. 宏任务：2
```

---

## 4. 事件循环执行流程

### 4.1 完整流程

```
1. 执行同步代码（当前宏任务）
   ↓
2. 执行所有微任务
   ↓
3. 渲染（如果需要）
   ↓
4. 执行下一个宏任务
   ↓
回到步骤 1
```

### 4.2 详细示例

```javascript
console.log("script start");  // 1. 同步代码

setTimeout(() => {
  console.log("setTimeout1");  // 5. 宏任务 1
  
  Promise.resolve().then(() => {
    console.log("promise3");  // 6. 微任务 3
  });
}, 0);

Promise.resolve().then(() => {
  console.log("promise1");  // 3. 微任务 1
  
  setTimeout(() => {
    console.log("setTimeout2");  // 7. 宏任务 2
  }, 0);
}).then(() => {
  console.log("promise2");  // 4. 微任务 2
});

console.log("script end");  // 2. 同步代码

// 输出顺序：
// script start
// script end
// promise1
// promise2
// setTimeout1
// promise3
// setTimeout2

// 执行过程：
// 第 1 轮事件循环：
//   - 执行同步代码：script start, script end
//   - 执行微任务：promise1, promise2
// 第 2 轮事件循环：
//   - 执行宏任务：setTimeout1
//   - 执行微任务：promise3
// 第 3 轮事件循环：
//   - 执行宏任务：setTimeout2
```

### 4.3 复杂示例

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
  Promise.resolve().then(() => {
    console.log("3");
  });
}, 0);

new Promise((resolve) => {
  console.log("4");
  resolve();
}).then(() => {
  console.log("5");
}).then(() => {
  console.log("6");
});

setTimeout(() => {
  console.log("7");
  Promise.resolve().then(() => {
    console.log("8");
  });
}, 0);

console.log("9");

// 输出：1, 4, 9, 5, 6, 2, 3, 7, 8

// 分析：
// 第 1 轮：
//   同步：1, 4, 9
//   微任务：5, 6
// 第 2 轮：
//   宏任务：2
//   微任务：3
// 第 3 轮：
//   宏任务：7
//   微任务：8
```

---

## 5. async/await 与事件循环

### 5.1 async/await 的执行时机

```javascript
console.log("1");

async function async1() {
  console.log("2");
  await async2();
  console.log("3");  // await 后的代码相当于微任务
}

async function async2() {
  console.log("4");
}

async1();

console.log("5");

// 输出：1, 2, 4, 5, 3

// 等价于：
console.log("1");

function async1() {
  console.log("2");
  
  return Promise.resolve(async2()).then(() => {
    console.log("3");
  });
}

function async2() {
  console.log("4");
}

async1();

console.log("5");
```

### 5.2 复杂的 async/await

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

async1();

new Promise((resolve) => {
  console.log("promise1");
  resolve();
}).then(() => {
  console.log("promise2");
});

console.log("script end");

// 输出：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

---

## 6. 浏览器 vs Node.js

### 6.1 浏览器事件循环

```javascript
// 浏览器中的事件循环
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

Promise.resolve().then(() => {
  console.log("3");
});

requestAnimationFrame(() => {
  console.log("4");
});

console.log("5");

// 可能的输出：1, 5, 3, 4, 2
// requestAnimationFrame 在渲染前执行
```

### 6.2 Node.js 事件循环

**Node.js 事件循环阶段**：

```
   ┌───────────────────────────┐
┌─>│           timers          │  (setTimeout, setInterval)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  (I/O 回调)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  (内部使用)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  (获取新的 I/O 事件)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  (setImmediate)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  (关闭回调)
   └───────────────────────────┘
```

**process.nextTick 与 Promise**：

```javascript
// Node.js
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

setImmediate(() => {
  console.log("3");
});

Promise.resolve().then(() => {
  console.log("4");
});

process.nextTick(() => {
  console.log("5");
});

console.log("6");

// 输出：1, 6, 5, 4, 2, 3
// process.nextTick 优先级最高
// Promise 是微任务
// setTimeout 和 setImmediate 顺序不确定
```

### 6.3 差异对比

| 特性 | 浏览器 | Node.js |
|------|--------|---------|
| 微任务队列 | 每个宏任务后清空 | 每个阶段后清空 |
| `setImmediate` | 不支持 | 支持 |
| `process.nextTick` | 不支持 | 支持（最高优先级）|
| `requestAnimationFrame` | 支持 | 不支持 |
| I/O 操作 | 少 | 多（文件、网络）|

---

## 7. 常见陷阱

### 7.1 setTimeout 0 不是立即执行

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

console.log("3");

// 输出：1, 3, 2
// setTimeout 0 只是将回调放入宏任务队列
// 不会立即执行
```

### 7.2 微任务优先级

```javascript
setTimeout(() => {
  console.log("timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("promise");
});

// 输出：promise, timeout
// 微任务总是在宏任务前执行
```

### 7.3 微任务队列被阻塞

```javascript
function block() {
  Promise.resolve().then(() => {
    console.log("micro task");
    block();  // 递归创建微任务
  });
}

block();

setTimeout(() => {
  console.log("macro task");  // 永远不会执行
}, 0);

// 微任务队列被无限填充，宏任务永远无法执行
```

### 7.4 Promise executor 同步执行

```javascript
console.log("1");

new Promise((resolve) => {
  console.log("2");  // executor 同步执行
  resolve();
}).then(() => {
  console.log("3");  // then 是微任务
});

console.log("4");

// 输出：1, 2, 4, 3
```

---

## 8. 实际应用

### 8.1 任务调度

```javascript
// 将大任务拆分，避免阻塞
function processLargeArray(array, processFn) {
  let index = 0;
  const chunkSize = 100;
  
  function processChunk() {
    const end = Math.min(index + chunkSize, array.length);
    
    for (; index < end; index++) {
      processFn(array[index]);
    }
    
    if (index < array.length) {
      // 使用 setTimeout 让出控制权
      setTimeout(processChunk, 0);
    }
  }
  
  processChunk();
}

// 使用
const largeArray = new Array(100000).fill(0);
processLargeArray(largeArray, (item) => {
  // 处理每个元素
});
```

### 8.2 防止页面卡顿

```javascript
// ❌ 阻塞 UI
function heavyTask() {
  for (let i = 0; i < 1000000000; i++) {
    // 长时间计算
  }
}

button.onclick = () => {
  heavyTask();  // 页面卡死
};

// ✅ 使用 Web Worker
// worker.js
self.onmessage = (e) => {
  const result = heavyTask(e.data);
  self.postMessage(result);
};

// main.js
const worker = new Worker('worker.js');

button.onclick = () => {
  worker.postMessage(data);
  
  worker.onmessage = (e) => {
    console.log('结果:', e.data);
  };
};

// ✅ 使用 requestIdleCallback
button.onclick = () => {
  requestIdleCallback((deadline) => {
    while (deadline.timeRemaining() > 0 && hasMoreWork()) {
      doWork();
    }
  });
};
```

### 8.3 优先级调度

```javascript
// 高优先级任务使用微任务
function highPriorityTask(fn) {
  queueMicrotask(fn);
}

// 低优先级任务使用宏任务
function lowPriorityTask(fn) {
  setTimeout(fn, 0);
}

// 使用
highPriorityTask(() => {
  console.log("重要任务");  // 先执行
});

lowPriorityTask(() => {
  console.log("次要任务");  // 后执行
});
```

---

## 9. 性能优化

### 9.1 批量更新 DOM

```javascript
// ❌ 多次触发重排
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  document.body.appendChild(div);  // 每次都重排
}

// ✅ 使用 DocumentFragment
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}

document.body.appendChild(fragment);  // 一次重排

// ✅ 使用 requestAnimationFrame
function batchUpdate() {
  requestAnimationFrame(() => {
    // 批量 DOM 更新
  });
}
```

### 9.2 避免微任务队列过长

```javascript
// ❌ 递归微任务
function recursiveMicrotask() {
  Promise.resolve().then(() => {
    // 处理
    recursiveMicrotask();  // 阻塞事件循环
  });
}

// ✅ 使用宏任务让出控制权
function recursiveTask() {
  Promise.resolve().then(() => {
    // 处理
    setTimeout(recursiveTask, 0);  // 让出控制权
  });
}
```

---

## 10. 调试技巧

### 10.1 可视化事件循环

```javascript
console.log("=== Start ===");

console.log("Sync 1");

setTimeout(() => {
  console.log("Macro Task 1");
}, 0);

Promise.resolve().then(() => {
  console.log("Micro Task 1");
}).then(() => {
  console.log("Micro Task 2");
});

setTimeout(() => {
  console.log("Macro Task 2");
}, 0);

console.log("Sync 2");

console.log("=== End ===");

// 输出：
// === Start ===
// Sync 1
// Sync 2
// === End ===
// Micro Task 1
// Micro Task 2
// Macro Task 1
// Macro Task 2
```

### 10.2 使用 Performance API

```javascript
performance.mark("task-start");

setTimeout(() => {
  performance.mark("task-end");
  performance.measure("task-duration", "task-start", "task-end");
  
  const measure = performance.getEntriesByName("task-duration")[0];
  console.log(`任务耗时: ${measure.duration}ms`);
}, 0);
```

---

## 关键要点

1. **事件循环组成**
   - 调用栈：执行同步代码
   - 任务队列：存储异步回调
   - 微任务优先于宏任务

2. **执行顺序**
   - 同步代码 → 微任务 → 宏任务
   - 每个宏任务后清空微任务队列

3. **宏任务 vs 微任务**
   - 宏任务：setTimeout、setInterval
   - 微任务：Promise.then、queueMicrotask

4. **常见陷阱**
   - setTimeout(fn, 0) 不是立即执行
   - Promise executor 同步执行
   - 微任务可能阻塞宏任务

5. **性能优化**
   - 拆分长任务
   - 批量更新 DOM
   - 使用 requestAnimationFrame

---

## 深入一点

### 浏览器渲染时机

```javascript
// 浏览器渲染发生在宏任务之间

console.log("1");

// 修改 DOM
document.body.style.background = "red";

// 微任务（不触发渲染）
Promise.resolve().then(() => {
  console.log("2");
  document.body.style.background = "blue";
});

// 宏任务（可能触发渲染）
setTimeout(() => {
  console.log("3");
  document.body.style.background = "green";
}, 0);

// 用户只会看到 blue 和 green
// red 在微任务执行前被覆盖
```

### 事件循环的实现

```javascript
// 简化的事件循环伪代码
while (eventLoop.waitForTask()) {
  const task = eventLoop.nextTask();
  execute(task);
  
  // 执行所有微任务
  while (microtaskQueue.hasTasks()) {
    const microtask = microtaskQueue.nextTask();
    execute(microtask);
  }
  
  // 渲染（如果需要）
  if (shouldRender()) {
    render();
  }
}
```

---

## 参考资料

- [MDN: 并发模型与事件循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/EventLoop)
- [Jake Archibald: In The Loop](https://www.youtube.com/watch?v=cCOL7MC4Pl0)
- [Node.js Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Philip Roberts: What the heck is the event loop anyway?](https://www.youtube.com/watch?v=8aGhZQkoFbQ)

---

**上一章**：[async/await](./content-20.md)  
**下一章**：[Generator 与迭代器](./content-22.md)
