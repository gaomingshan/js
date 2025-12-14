# 第 19 章：事件循环与并发模型 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 事件循环基础

### 题目

JavaScript 的事件循环主要包括哪两个队列？

**选项：**
- A. 宏任务队列和微任务队列
- B. 同步队列和异步队列
- C. 高优先级队列和低优先级队列
- D. 输入队列和输出队列

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**事件循环的两个队列**

```javascript
// 宏任务（Macrotask）
- setTimeout / setInterval
- setImmediate (Node.js)
- I/O 操作
- UI 渲染
- script（整体代码）

// 微任务（Microtask）
- Promise.then/catch/finally
- MutationObserver
- queueMicrotask()
- process.nextTick (Node.js)
```

**执行顺序：**
```
1. 执行一个宏任务（从队列中取出）
2. 执行所有微任务
3. 渲染（如果需要）
4. 回到步骤 1
```

**示例：**
```javascript
console.log('1');  // 同步

setTimeout(() => {
  console.log('2');  // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3');  // 微任务
});

console.log('4');  // 同步

// 输出：1, 4, 3, 2
// 1. 同步：1, 4
// 2. 微任务：3
// 3. 宏任务：2
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 宏任务与微任务

### 题目

以下哪个是微任务？

**选项：**
- A. `setTimeout`
- B. `setInterval`
- C. `Promise.then`
- D. `requestAnimationFrame`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**微任务 vs 宏任务**

| 微任务 | 宏任务 |
|--------|--------|
| Promise.then | setTimeout |
| MutationObserver | setInterval |
| queueMicrotask | setImmediate |
| process.nextTick | I/O |
| | requestAnimationFrame |
| | UI 渲染 |

**执行时机：**
```javascript
// 宏任务：下一轮事件循环
setTimeout(() => {
  console.log('macro');
}, 0);

// 微任务：当前事件循环结束前
Promise.resolve().then(() => {
  console.log('micro');
});

console.log('sync');

// 输出：sync, micro, macro
```

**微任务优先级更高：**
```javascript
setTimeout(() => console.log('1'), 0);
Promise.resolve().then(() => console.log('2'));
Promise.resolve().then(() => console.log('3'));
setTimeout(() => console.log('4'), 0);

// 输出：2, 3, 1, 4
// 所有微任务先于宏任务执行
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 并发模型

### 题目

JavaScript 是单线程的，但可以实现并发。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**JavaScript 的并发模型**

JavaScript 是单线程的，但通过**事件循环**和**异步回调**实现并发。

**并发 vs 并行：**
```
并发（Concurrency）：
- 单线程，通过时间片轮转
- JavaScript 的模型

并行（Parallelism）：
- 多线程，同时执行
- Web Worker 可实现
```

**并发示例：**
```javascript
// 多个异步操作"同时"进行
fetch('/api/users');    // 发起请求
fetch('/api/posts');    // 发起请求
fetch('/api/comments'); // 发起请求

// 虽然是单线程，但三个请求可以并发
```

**真正的并行：**
```javascript
// Web Worker
const worker = new Worker('worker.js');
worker.postMessage('data');

// worker.js 在独立线程运行
// 可以与主线程并行执行
```

**事件循环实现并发：**
```javascript
function task1() {
  console.log('Task 1 start');
  setTimeout(() => {
    console.log('Task 1 end');
  }, 1000);
}

function task2() {
  console.log('Task 2 start');
  setTimeout(() => {
    console.log('Task 2 end');
  }, 500);
}

task1();
task2();

// Task 1 start
// Task 2 start
// Task 2 end（500ms 后）
// Task 1 end（1000ms 后）
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 事件循环执行顺序

### 题目

以下代码的输出顺序是什么？

```javascript
console.log('1');

async function async1() {
  console.log('2');
  await async2();
  console.log('3');
}

async function async2() {
  console.log('4');
}

setTimeout(() => {
  console.log('5');
}, 0);

async1();

new Promise(resolve => {
  console.log('6');
  resolve();
}).then(() => {
  console.log('7');
});

console.log('8');
```

**选项：**
- A. `1, 2, 4, 6, 8, 3, 7, 5`
- B. `1, 2, 4, 6, 8, 7, 3, 5`
- C. `1, 2, 4, 3, 6, 8, 7, 5`
- D. `1, 2, 4, 6, 3, 8, 7, 5`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**详细执行流程**

```javascript
// 1. 同步代码
console.log('1');  // → 1

// 2. async1() 开始执行（同步部分）
// console.log('2');  // → 2

// 3. await async2() - 调用 async2（同步部分）
// console.log('4');  // → 4
// await 后面的代码加入微任务队列

// 4. setTimeout 加入宏任务队列

// 5. Promise 构造函数同步执行
// console.log('6');  // → 6
// then 加入微任务队列

// 6. 同步代码
console.log('8');  // → 8

// 7. 执行微任务队列
// await 后的代码
// console.log('3');  // → 3
// Promise.then
// console.log('7');  // → 7

// 8. 执行宏任务队列
// setTimeout
// console.log('5');  // → 5

// 最终输出：1, 2, 4, 6, 8, 3, 7, 5
```

**await 的本质：**
```javascript
async function async1() {
  console.log('2');
  await async2();
  console.log('3');
}

// 等价于
function async1() {
  console.log('2');
  return async2().then(() => {
    console.log('3');
  });
}
```

**执行队列状态：**
```
【同步】 1, 2, 4, 6, 8
  ↓
【微任务队列】[await后, then]
  → 3, 7
  ↓
【宏任务队列】[setTimeout]
  → 5
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** 嵌套事件循环

### 题目

以下代码的输出是什么？

```javascript
Promise.resolve().then(() => {
  console.log('1');
  setTimeout(() => console.log('2'), 0);
});

setTimeout(() => {
  console.log('3');
  Promise.resolve().then(() => console.log('4'));
}, 0);
```

**选项：**
- A. `1, 3, 2, 4`
- B. `1, 3, 4, 2`
- C. `1, 2, 3, 4`
- D. `3, 4, 1, 2`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**嵌套任务的执行顺序**

```javascript
// 初始：
// 微任务队列：[Promise.then]
// 宏任务队列：[setTimeout(3)]

// 第一轮事件循环
// 执行微任务：Promise.then
console.log('1');  // → 1
// 添加宏任务：setTimeout(2)
// 微任务队列：[]
// 宏任务队列：[setTimeout(3), setTimeout(2)]

// 第二轮事件循环
// 执行宏任务：setTimeout(3)
console.log('3');  // → 3
// 添加微任务：Promise.then(4)
// 微任务队列：[Promise.then(4)]
// 宏任务队列：[setTimeout(2)]

// 执行所有微任务
console.log('4');  // → 4
// 微任务队列：[]

// 第三轮事件循环
// 执行宏任务：setTimeout(2)
console.log('2');  // → 2

// 输出：1, 3, 4, 2
```

**关键点：**
1. 每轮事件循环执行一个宏任务
2. 微任务在当前宏任务后立即执行
3. 新添加的宏任务排在队列末尾

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** requestAnimationFrame

### 题目

`requestAnimationFrame` 在事件循环中的位置是什么？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**requestAnimationFrame 的执行时机**

```javascript
// rAF 在浏览器重绘前执行
console.log('1');

setTimeout(() => {
  console.log('2');  // 宏任务
}, 0);

requestAnimationFrame(() => {
  console.log('3');  // 在重绘前
});

Promise.resolve().then(() => {
  console.log('4');  // 微任务
});

console.log('5');

// 输出：1, 5, 4, 3, 2
// 或：1, 5, 4, 2, 3（取决于时机）
```

**完整的事件循环：**
```
1. 执行一个宏任务
2. 执行所有微任务
3. 执行 requestAnimationFrame 回调
4. 浏览器渲染
5. 执行 requestIdleCallback（如果有空闲时间）
6. 回到步骤 1
```

**实际应用：**
```javascript
// 性能监控
let lastTime = performance.now();

function measure() {
  const now = performance.now();
  const fps = 1000 / (now - lastTime);
  console.log(`FPS: ${fps.toFixed(2)}`);
  lastTime = now;
  
  requestAnimationFrame(measure);
}

requestAnimationFrame(measure);
```

**与 setTimeout 的区别：**
```javascript
// setTimeout：不同步浏览器刷新
let count = 0;
function animate1() {
  count++;
  if (count < 100) {
    setTimeout(animate1, 16);  // 可能掉帧
  }
}

// requestAnimationFrame：同步刷新
function animate2() {
  count++;
  if (count < 100) {
    requestAnimationFrame(animate2);  // 流畅
  }
}
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** Node.js 事件循环

### 题目

Node.js 的事件循环包括哪些阶段？

**选项：**
- A. timers（定时器）
- B. pending callbacks
- C. poll（轮询）
- D. check（检查）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**Node.js 事件循环的 6 个阶段**

```
   ┌───────────────────────────┐
┌─>│           timers          │  setTimeout/setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  系统操作回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  内部使用
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  I/O 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  关闭回调
   └───────────────────────────┘
```

**各阶段说明：**

**A. timers**
```javascript
setTimeout(() => {
  console.log('timer');
}, 0);
```

**B. pending callbacks**
```javascript
// TCP 错误等系统操作的回调
```

**C. poll**
```javascript
// 等待新的 I/O 事件
fs.readFile('file.txt', () => {
  console.log('file read');
});
```

**D. check**
```javascript
setImmediate(() => {
  console.log('immediate');
});
```

**process.nextTick vs setImmediate：**
```javascript
setImmediate(() => {
  console.log('immediate');
});

process.nextTick(() => {
  console.log('nextTick');
});

// 输出：nextTick, immediate
// nextTick 在所有阶段前执行
```

**完整示例：**
```javascript
setTimeout(() => {
  console.log('setTimeout');
}, 0);

setImmediate(() => {
  console.log('setImmediate');
});

process.nextTick(() => {
  console.log('nextTick');
});

Promise.resolve().then(() => {
  console.log('promise');
});

// 输出：
// nextTick
// promise
// setTimeout（可能）
// setImmediate（可能）
// 注：setTimeout 和 setImmediate 顺序不确定
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** 任务调度器

### 题目

实现一个支持优先级的任务调度器。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
class TaskScheduler {
  constructor() {
    this.tasks = [];
    this.running = false;
  }
  
  // 添加任务
  add(task, priority = 0) {
    this.tasks.push({ task, priority });
    this.tasks.sort((a, b) => b.priority - a.priority);
    
    if (!this.running) {
      this.run();
    }
  }
  
  // 执行任务
  async run() {
    this.running = true;
    
    while (this.tasks.length > 0) {
      const { task } = this.tasks.shift();
      
      try {
        await task();
      } catch (error) {
        console.error('Task error:', error);
      }
      
      // 让出控制权，防止阻塞
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    this.running = false;
  }
  
  // 清空任务
  clear() {
    this.tasks = [];
  }
}

// 使用
const scheduler = new TaskScheduler();

scheduler.add(async () => {
  console.log('Low priority task');
}, 1);

scheduler.add(async () => {
  console.log('High priority task');
}, 10);

scheduler.add(async () => {
  console.log('Medium priority task');
}, 5);

// 输出：
// High priority task
// Medium priority task
// Low priority task
```

**扩展：支持并发控制**
```javascript
class ConcurrentScheduler {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  async add(task) {
    if (this.running >= this.concurrency) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.running++;
    
    try {
      return await task();
    } finally {
      this.running--;
      
      const resolve = this.queue.shift();
      if (resolve) resolve();
    }
  }
}

// 使用
const scheduler = new ConcurrentScheduler(3);

const tasks = Array.from({ length: 10 }, (_, i) => 
  () => {
    console.log(`Task ${i} started`);
    return new Promise(resolve => 
      setTimeout(() => {
        console.log(`Task ${i} finished`);
        resolve();
      }, 1000)
    );
  }
);

Promise.all(tasks.map(task => scheduler.add(task)));
```

**扩展：支持取消**
```javascript
class CancellableScheduler {
  constructor() {
    this.tasks = new Map();
    this.nextId = 0;
  }
  
  add(task) {
    const id = this.nextId++;
    let cancelled = false;
    
    const promise = (async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      
      if (cancelled) {
        throw new Error('Task cancelled');
      }
      
      return await task();
    })();
    
    this.tasks.set(id, { promise, cancel: () => { cancelled = true; } });
    
    promise.finally(() => {
      this.tasks.delete(id);
    });
    
    return {
      id,
      promise,
      cancel: () => {
        const task = this.tasks.get(id);
        if (task) {
          task.cancel();
          this.tasks.delete(id);
        }
      }
    };
  }
}

// 使用
const scheduler = new CancellableScheduler();

const task = scheduler.add(async () => {
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('Task done');
});

// 提前取消
setTimeout(() => {
  task.cancel();
  console.log('Task cancelled');
}, 2000);
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** 事件循环陷阱

### 题目

分析以下代码为什么会造成阻塞。

```javascript
while (true) {
  // 处理数据
}
```

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**死循环阻塞事件循环**

```javascript
// ❌ 阻塞事件循环
function blockingLoop() {
  while (true) {
    // 永远占用主线程
    // 其他任务无法执行
  }
}

blockingLoop();
console.log('Never printed');
```

**为什么会阻塞：**
1. JavaScript 是单线程
2. 事件循环需要主线程空闲才能执行下一个任务
3. 死循环永远不释放主线程

**解决方案：**

**方案 1：拆分任务**
```javascript
async function nonBlockingLoop() {
  let i = 0;
  
  while (i < 1000000) {
    // 处理一批数据
    for (let j = 0; j < 1000; j++, i++) {
      // 处理
    }
    
    // 让出控制权
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

nonBlockingLoop();
console.log('Will be printed');
```

**方案 2：使用 setImmediate（Node.js）**
```javascript
function processLargeData(data, callback) {
  let index = 0;
  
  function processChunk() {
    const end = Math.min(index + 1000, data.length);
    
    for (; index < end; index++) {
      // 处理数据
    }
    
    if (index < data.length) {
      setImmediate(processChunk);  // 下一轮事件循环
    } else {
      callback();
    }
  }
  
  processChunk();
}
```

**方案 3：使用 Web Worker**
```javascript
// main.js
const worker = new Worker('worker.js');

worker.postMessage({ data: largeData });

worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// worker.js
self.onmessage = (e) => {
  const { data } = e.message;
  
  // 在独立线程处理，不阻塞主线程
  while (true) {
    // 处理数据
  }
  
  self.postMessage(result);
};
```

**方案 4：requestIdleCallback**
```javascript
function processWhenIdle(data) {
  let index = 0;
  
  function processChunk(deadline) {
    while (deadline.timeRemaining() > 0 && index < data.length) {
      // 处理数据
      index++;
    }
    
    if (index < data.length) {
      requestIdleCallback(processChunk);
    }
  }
  
  requestIdleCallback(processChunk);
}
```

**检测长任务：**
```javascript
// Performance Observer
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {  // 超过 50ms
      console.warn('Long task detected:', entry.duration);
    }
  }
});

observer.observe({ entryTypes: ['longtask'] });
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 并发模型实践

### 题目

实现一个异步任务管理器，支持并发控制、超时、重试和取消。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
class AsyncTaskManager {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 2;
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 3;
    
    this.running = 0;
    this.queue = [];
    this.tasks = new Map();
  }
  
  // 添加任务
  async add(fn, options = {}) {
    const taskId = this.generateId();
    const task = this.createTask(taskId, fn, options);
    
    this.tasks.set(taskId, task);
    
    if (this.running < this.concurrency) {
      this.execute(task);
    } else {
      this.queue.push(task);
    }
    
    return {
      id: taskId,
      promise: task.promise,
      cancel: () => this.cancel(taskId)
    };
  }
  
  // 创建任务
  createTask(id, fn, options) {
    let cancelled = false;
    let timeoutId;
    
    const promise = new Promise(async (resolve, reject) => {
      const timeout = options.timeout || this.timeout;
      const retries = options.retries || this.retries;
      
      // 超时控制
      if (timeout) {
        timeoutId = setTimeout(() => {
          cancelled = true;
          reject(new Error('Task timeout'));
        }, timeout);
      }
      
      // 重试逻辑
      let lastError;
      for (let attempt = 0; attempt <= retries; attempt++) {
        if (cancelled) {
          reject(new Error('Task cancelled'));
          return;
        }
        
        try {
          const result = await fn();
          clearTimeout(timeoutId);
          resolve(result);
          return;
        } catch (error) {
          lastError = error;
          if (attempt < retries) {
            await this.delay(1000 * (attempt + 1));
          }
        }
      }
      
      clearTimeout(timeoutId);
      reject(lastError);
    });
    
    promise.finally(() => {
      this.running--;
      this.tasks.delete(id);
      this.executeNext();
    });
    
    return {
      id,
      fn,
      promise,
      cancel: () => {
        cancelled = true;
        clearTimeout(timeoutId);
      }
    };
  }
  
  // 执行任务
  execute(task) {
    this.running++;
    return task.promise;
  }
  
  // 执行下一个任务
  executeNext() {
    if (this.queue.length > 0 && this.running < this.concurrency) {
      const task = this.queue.shift();
      this.execute(task);
    }
  }
  
  // 取消任务
  cancel(taskId) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.cancel();
      
      // 从队列中移除
      const index = this.queue.indexOf(task);
      if (index > -1) {
        this.queue.splice(index, 1);
      }
    }
  }
  
  // 取消所有任务
  cancelAll() {
    this.tasks.forEach(task => task.cancel());
    this.queue = [];
  }
  
  // 等待所有任务完成
  async waitAll() {
    const promises = Array.from(this.tasks.values())
      .map(task => task.promise.catch(() => {}));
    
    await Promise.all(promises);
  }
  
  // 工具方法
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36);
  }
}

// 使用示例
const manager = new AsyncTaskManager({
  concurrency: 3,
  timeout: 5000,
  retries: 2
});

// 添加任务
const task1 = manager.add(async () => {
  await delay(1000);
  return 'Task 1 done';
});

const task2 = manager.add(async () => {
  await delay(2000);
  throw new Error('Task 2 failed');
}, { retries: 5 });

const task3 = manager.add(async () => {
  await delay(10000);
  return 'Task 3 done';
}, { timeout: 3000 });

// 取消任务
setTimeout(() => {
  task3.cancel();
}, 2000);

// 等待所有任务
await manager.waitAll();
console.log('All tasks completed');
```

</details>

---

**本章总结：**
- ✅ 事件循环机制
- ✅ 宏任务与微任务
- ✅ JavaScript 并发模型
- ✅ 执行顺序分析
- ✅ 嵌套事件循环
- ✅ requestAnimationFrame
- ✅ Node.js 事件循环
- ✅ 任务调度器
- ✅ 事件循环陷阱
- ✅ 异步任务管理

**下一章：** [第 20 章：元编程与反射](./chapter-20.md)
