# JavaScript 并发模型

## 概述

JavaScript 采用单线程、基于事件循环的并发模型。虽然是单线程，但通过异步编程可以实现高效的并发处理。

理解并发模型的关键在于：

- **并发 vs 并行**：并发是交替执行，并行是同时执行
- **Run-to-Completion**：一个任务执行时不会被中断
- **异步 I/O**：网络、文件操作不阻塞主线程

---

## 一、单线程模型

### 1.1 为什么是单线程

**历史原因**：

- JavaScript 最初设计为浏览器脚本语言
- 避免 DOM 操作的竞态条件
- 简化编程模型

**优点**：

- 无需处理线程同步
- 避免死锁问题
- 代码执行顺序可预测

**缺点**：

- 长时间运算会阻塞
- 无法利用多核 CPU

### 1.2 Run-to-Completion

JavaScript 执行遵循 Run-to-Completion 原则：**一个任务执行时不会被其他任务中断**。

```js
function task1() {
  console.log('Task 1 start');
  for (let i = 0; i < 1000000000; i++) {
    // 长时间运算，不会被中断
  }
  console.log('Task 1 end');
}

function task2() {
  console.log('Task 2');
}

task1(); // 必须完全执行完
task2(); // 才能执行这个
```

---

## 二、并发 vs 并行

### 2.1 概念区分

- **并发（Concurrency）**：多个任务在重叠的时间段内执行（交替）
- **并行（Parallelism）**：多个任务在同一时刻执行（同时）

JavaScript 是**并发的**，但不是**并行的**（除非使用 Web Workers）。

### 2.2 可视化对比

```text
// 并发（Concurrency）：
// 时间 →
// Task A: ████░░░░████░░░░████
// Task B: ░░░░████░░░░████░░░░
// 交替执行，单核 CPU

// 并行（Parallelism）：
// 时间 →
// Task A: ████████████████████  (Core 1)
// Task B: ████████████████████  (Core 2)
// 同时执行，多核 CPU
```

---

## 三、异步并发模式

### 3.1 Promise 并发

```js
// Promise.all - 等待所有完成
Promise.all([
  fetch('/api/data'),
  fetch('/api/user'),
  fetch('/api/posts')
]).then(results => {
  console.log('All resolved:', results);
});

// Promise.race - 第一个完成
Promise.race([
  fetch('/api/fast'),
  fetch('/api/slow')
]).then(result => {
  console.log('First resolved:', result);
});

// Promise.allSettled - 等待所有完成（不管成功失败）
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]);

// Promise.any - 第一个成功
Promise.any([
  Promise.reject('error1'),
  Promise.resolve('success'),
  Promise.reject('error2')
]).then(result => {
  console.log('First fulfilled:', result);
});
```

### 3.2 async/await 并发

```js
// ❌ 错误：顺序执行（不并发）
async function sequential() {
  const data1 = await fetch('/api/data1'); // 等待
  const data2 = await fetch('/api/data2'); // 然后等待
  return [data1, data2];
}

// ✅ 正确：并发执行
async function concurrent() {
  const promise1 = fetch('/api/data1'); // 立即开始
  const promise2 = fetch('/api/data2'); // 立即开始

  const data1 = await promise1; // 等待第一个
  const data2 = await promise2; // 等待第二个
  return [data1, data2];
}

// 或使用 Promise.all
async function concurrentAll() {
  const [data1, data2] = await Promise.all([
    fetch('/api/data1'),
    fetch('/api/data2')
  ]);
  return [data1, data2];
}
```

---

## 四、并发控制

### 4.1 限制并发数量

```js
class ConcurrencyLimiter {
  constructor(limit) {
    this.limit = limit;
    this.running = 0;
    this.queue = [];
  }

  async run(task) {
    while (this.running >= this.limit) {
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
const limiter = new ConcurrencyLimiter(3);

const tasks = Array(10).fill(0).map((_, i) =>
  () => fetch(`/api/data${i}`)
);

const results = await Promise.all(
  tasks.map(task => limiter.run(task))
);
// 最多同时 3 个请求
```

### 4.2 任务队列

```js
class TaskQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.running) {
        this.run();
      }
    });
  }

  async run() {
    this.running = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      await task();
    }

    this.running = false;
  }
}
```

---

## 五、Web Workers

### 5.1 真正的并行

```js
// 主线程
const worker = new Worker('worker.js');

// 发送消息
worker.postMessage({ type: 'calculate', data: [1, 2, 3] });

// 接收消息
worker.onmessage = (event) => {
  console.log('Result:', event.data);
};

// worker.js
self.onmessage = (event) => {
  if (event.data.type === 'calculate') {
    // 执行计算密集型任务
    const result = heavyCalculation(event.data.data);
    self.postMessage(result);
  }
};
```

### 5.2 Worker Pool

```js
class WorkerPool {
  constructor(workerScript, poolSize) {
    this.workers = [];
    this.queue = [];

    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.busy = false;
      worker.onmessage = (event) => {
        worker.busy = false;
        worker.resolve(event.data);
        this.runNext();
      };
      this.workers.push(worker);
    }
  }

  async run(data) {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.runNext();
    });
  }

  runNext() {
    const worker = this.workers.find(w => !w.busy);
    if (worker && this.queue.length > 0) {
      const { data, resolve, reject } = this.queue.shift();
      worker.busy = true;
      worker.resolve = resolve;
      worker.postMessage(data);
    }
  }
}
```

---

## 六、最佳实践

1. **理解单线程**：避免长时间阻塞操作。
2. **异步 I/O**：网络、文件操作用异步。
3. **Promise.all 并发**：多个独立任务同时执行。
4. **控制并发数**：避免资源耗尽。
5. **Worker 处理密集计算**：不阻塞主线程。
6. **避免嵌套回调**：使用 Promise 或 async/await。
7. **错误处理**：并发任务的错误要妥善处理。

---

## 参考资料

- [MDN - 事件循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/EventLoop)
- [MDN - Web Workers](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API)
