# 并发模式与实践

> 掌握 JavaScript 异步编程的高级技术

---

## 概述

JavaScript 虽然是单线程的，但通过事件循环、Promise、async/await 等机制，可以实现高效的并发处理。掌握并发模式和最佳实践，能显著提升应用性能。

本章将深入：
- 并发 vs 并行
- 常见并发模式
- 并发控制策略
- 性能优化技巧
- 实际应用场景

---

## 1. 并发 vs 并行

### 1.1 概念区分

```javascript
// 并发（Concurrency）：多个任务交替执行
// JavaScript 是单线程，只有并发，没有真正的并行

async function concurrent() {
  const promise1 = fetch('/api/data1');  // 启动请求1
  const promise2 = fetch('/api/data2');  // 启动请求2
  // 两个请求并发执行（交替处理 I/O）
  
  const [data1, data2] = await Promise.all([promise1, promise2]);
  return { data1, data2 };
}

// 并行（Parallelism）：多个任务同时执行
// Web Worker 实现真正的并行

// main.js
const worker = new Worker('worker.js');
worker.postMessage({ task: 'heavy computation' });

worker.onmessage = (e) => {
  console.log('Worker result:', e.data);
};

// 主线程和 Worker 线程并行执行
```

### 1.2 JavaScript 的并发模型

```javascript
// JavaScript 的并发基于事件循环
// 同一时刻只执行一个任务，但可以快速切换

console.log('Task 1 start');

setTimeout(() => {
  console.log('Task 2 (async)');
}, 0);

console.log('Task 1 end');

// 输出：
// Task 1 start
// Task 1 end
// Task 2 (async)
```

---

## 2. 串行 vs 并行执行

### 2.1 串行执行

```javascript
// 串行：一个接一个执行
async function serial() {
  const data1 = await fetch('/api/data1').then(r => r.json());
  const data2 = await fetch('/api/data2').then(r => r.json());
  const data3 = await fetch('/api/data3').then(r => r.json());
  
  return [data1, data2, data3];
}

// 总时间 = time1 + time2 + time3
```

### 2.2 并行执行

```javascript
// 并行：同时启动所有任务
async function parallel() {
  const [data1, data2, data3] = await Promise.all([
    fetch('/api/data1').then(r => r.json()),
    fetch('/api/data2').then(r => r.json()),
    fetch('/api/data3').then(r => r.json())
  ]);
  
  return [data1, data2, data3];
}

// 总时间 ≈ max(time1, time2, time3)
```

### 2.3 混合模式

```javascript
// 部分串行，部分并行
async function hybrid() {
  // 第一步：获取用户信息（必须先执行）
  const user = await fetch('/api/user').then(r => r.json());
  
  // 第二步：并行获取用户相关数据（依赖用户信息）
  const [posts, comments, likes] = await Promise.all([
    fetch(`/api/posts?userId=${user.id}`).then(r => r.json()),
    fetch(`/api/comments?userId=${user.id}`).then(r => r.json()),
    fetch(`/api/likes?userId=${user.id}`).then(r => r.json())
  ]);
  
  return { user, posts, comments, likes };
}
```

---

## 3. 并发控制

### 3.1 限制并发数

```javascript
// 并发数限制器
class ConcurrencyLimit {
  constructor(limit) {
    this.limit = limit;
    this.running = 0;
    this.queue = [];
  }
  
  async run(fn) {
    while (this.running >= this.limit) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.running++;
    
    try {
      return await fn();
    } finally {
      this.running--;
      const resolve = this.queue.shift();
      if (resolve) resolve();
    }
  }
}

// 使用
const limiter = new ConcurrencyLimit(3);  // 最多3个并发

const urls = [/* 100个URL */];

const results = await Promise.all(
  urls.map(url => limiter.run(() => fetch(url).then(r => r.json())))
);

// 最多同时发起3个请求
```

### 3.2 批量处理

```javascript
// 分批执行任务
async function batchProcess(items, batchSize, processFn) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processFn(item))
    );
    results.push(...batchResults);
  }
  
  return results;
}

// 使用
const urls = [/* 1000个URL */];

const data = await batchProcess(urls, 10, async (url) => {
  const response = await fetch(url);
  return response.json();
});

// 每次处理10个，避免并发过高
```

### 3.3 队列管理

```javascript
// 任务队列
class TaskQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { task, resolve, reject } = this.queue.shift();
    
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
  
  async clear() {
    this.queue = [];
  }
  
  get pending() {
    return this.queue.length;
  }
}

// 使用
const queue = new TaskQueue(5);  // 并发数5

const promises = urls.map(url => 
  queue.add(() => fetch(url).then(r => r.json()))
);

const results = await Promise.all(promises);
```

---

## 4. 竞速与超时

### 4.1 Promise.race 应用

```javascript
// 最快响应
async function fastestResponse(urls) {
  return Promise.race(
    urls.map(url => fetch(url).then(r => r.json()))
  );
}

// 使用多个CDN，返回最快的
const data = await fastestResponse([
  'https://cdn1.example.com/data.json',
  'https://cdn2.example.com/data.json',
  'https://cdn3.example.com/data.json'
]);
```

### 4.2 超时控制

```javascript
// 通用超时函数
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
}

// 使用
try {
  const data = await withTimeout(
    fetch('/api/data').then(r => r.json()),
    5000  // 5秒超时
  );
  console.log(data);
} catch (error) {
  console.error('请求超时或失败:', error.message);
}

// 使用 AbortController（现代方式）
async function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(id);
    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时');
    }
    throw error;
  }
}
```

### 4.3 重试机制

```javascript
// 带退避的重试
async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options;
  
  let delay = initialDelay;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      console.log(`重试 ${i + 1}/${maxRetries}，等待 ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }
}

// 使用
const data = await retryWithBackoff(
  () => fetch('/api/data').then(r => r.json()),
  { maxRetries: 3, initialDelay: 1000 }
);
```

---

## 5. 取消与中止

### 5.1 AbortController

```javascript
// 取消单个请求
const controller = new AbortController();

const promise = fetch('/api/data', {
  signal: controller.signal
});

// 3秒后取消
setTimeout(() => controller.abort(), 3000);

try {
  const response = await promise;
  const data = await response.json();
  console.log(data);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('请求被取消');
  }
}
```

### 5.2 取消多个请求

```javascript
// 取消多个并发请求
async function fetchMultiple(urls) {
  const controller = new AbortController();
  
  const promises = urls.map(url => 
    fetch(url, { signal: controller.signal })
      .then(r => r.json())
  );
  
  // 设置超时
  const timeout = setTimeout(() => {
    controller.abort();
  }, 5000);
  
  try {
    const results = await Promise.all(promises);
    clearTimeout(timeout);
    return results;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('所有请求被取消');
    }
    throw error;
  }
}
```

### 5.3 可取消的 Promise

```javascript
// 封装可取消的 Promise
function makeCancelable(promise) {
  let isCanceled = false;
  
  const wrappedPromise = new Promise((resolve, reject) => {
    promise
      .then(value => {
        if (!isCanceled) resolve(value);
      })
      .catch(error => {
        if (!isCanceled) reject(error);
      });
  });
  
  return {
    promise: wrappedPromise,
    cancel() {
      isCanceled = true;
    }
  };
}

// 使用
const cancelable = makeCancelable(
  fetch('/api/data').then(r => r.json())
);

// 稍后取消
setTimeout(() => cancelable.cancel(), 1000);

try {
  const data = await cancelable.promise;
  console.log(data);
} catch (error) {
  console.error(error);
}
```

---

## 6. 资源池模式

### 6.1 连接池

```javascript
// 数据库连接池模拟
class ConnectionPool {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.connections = [];
    this.available = [];
    this.waiting = [];
  }
  
  async acquire() {
    // 有可用连接，直接返回
    if (this.available.length > 0) {
      return this.available.pop();
    }
    
    // 可以创建新连接
    if (this.connections.length < this.maxSize) {
      const connection = await this.createConnection();
      this.connections.push(connection);
      return connection;
    }
    
    // 等待连接释放
    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }
  
  release(connection) {
    const waiting = this.waiting.shift();
    
    if (waiting) {
      waiting(connection);
    } else {
      this.available.push(connection);
    }
  }
  
  async createConnection() {
    // 模拟创建连接
    return { id: Math.random() };
  }
  
  async execute(fn) {
    const connection = await this.acquire();
    
    try {
      return await fn(connection);
    } finally {
      this.release(connection);
    }
  }
}

// 使用
const pool = new ConnectionPool(5);

async function queryDatabase(sql) {
  return pool.execute(async (connection) => {
    // 使用连接执行查询
    return `Result from connection ${connection.id}`;
  });
}

// 多个并发查询共享连接池
const results = await Promise.all([
  queryDatabase('SELECT * FROM users'),
  queryDatabase('SELECT * FROM posts'),
  queryDatabase('SELECT * FROM comments')
]);
```

### 6.2 对象池

```javascript
// 通用对象池
class ObjectPool {
  constructor(factory, maxSize = 10) {
    this.factory = factory;
    this.maxSize = maxSize;
    this.pool = [];
    this.inUse = new Set();
  }
  
  acquire() {
    let obj;
    
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else if (this.inUse.size < this.maxSize) {
      obj = this.factory();
    } else {
      throw new Error('Pool exhausted');
    }
    
    this.inUse.add(obj);
    return obj;
  }
  
  release(obj) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.pool.push(obj);
    }
  }
  
  get available() {
    return this.pool.length;
  }
  
  get size() {
    return this.inUse.size + this.pool.length;
  }
}

// 使用
const bufferPool = new ObjectPool(
  () => new ArrayBuffer(1024),
  20
);

function processData(data) {
  const buffer = bufferPool.acquire();
  
  try {
    // 使用 buffer 处理数据
    return process(data, buffer);
  } finally {
    bufferPool.release(buffer);
  }
}
```

---

## 7. 生产者-消费者模式

### 7.1 基本实现

```javascript
class Channel {
  constructor() {
    this.queue = [];
    this.receivers = [];
  }
  
  async send(value) {
    const receiver = this.receivers.shift();
    
    if (receiver) {
      receiver(value);
    } else {
      this.queue.push(value);
    }
  }
  
  async receive() {
    if (this.queue.length > 0) {
      return this.queue.shift();
    }
    
    return new Promise(resolve => {
      this.receivers.push(resolve);
    });
  }
}

// 使用
const channel = new Channel();

// 生产者
async function producer() {
  for (let i = 0; i < 10; i++) {
    await channel.send(i);
    console.log('Produced:', i);
    await new Promise(r => setTimeout(r, 100));
  }
}

// 消费者
async function consumer(id) {
  while (true) {
    const value = await channel.receive();
    console.log(`Consumer ${id} received:`, value);
    await new Promise(r => setTimeout(r, 200));
  }
}

// 启动
producer();
consumer(1);
consumer(2);
```

### 7.2 带缓冲的通道

```javascript
class BufferedChannel {
  constructor(capacity) {
    this.capacity = capacity;
    this.queue = [];
    this.senders = [];
    this.receivers = [];
  }
  
  async send(value) {
    if (this.queue.length < this.capacity) {
      this.queue.push(value);
      const receiver = this.receivers.shift();
      if (receiver) receiver();
      return;
    }
    
    return new Promise(resolve => {
      this.senders.push({ value, resolve });
    });
  }
  
  async receive() {
    if (this.queue.length > 0) {
      const value = this.queue.shift();
      const sender = this.senders.shift();
      if (sender) {
        this.queue.push(sender.value);
        sender.resolve();
      }
      return value;
    }
    
    return new Promise(resolve => {
      this.receivers.push(() => {
        const value = this.queue.shift();
        resolve(value);
      });
    });
  }
}
```

---

## 8. 并发模式总结

### 8.1 常用模式对比

| 模式 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| 串行 | 有依赖关系 | 简单、顺序清晰 | 慢 |
| 并行 | 无依赖关系 | 快 | 资源消耗大 |
| 限流 | 资源有限 | 可控 | 需要额外管理 |
| 批处理 | 大量任务 | 平衡速度和资源 | 实现复杂 |
| 竞速 | 多个来源 | 快速响应 | 浪费资源 |
| 资源池 | 复用资源 | 高效 | 实现复杂 |

### 8.2 选择指南

```javascript
// 1. 任务有依赖 → 串行
async function withDependency() {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id);  // 依赖 user
  return { user, posts };
}

// 2. 任务无依赖 → 并行
async function noDependency() {
  const [users, config, stats] = await Promise.all([
    fetchUsers(),
    fetchConfig(),
    fetchStats()
  ]);
  return { users, config, stats };
}

// 3. 大量任务 → 限流/批处理
async function manyTasks(items) {
  return batchProcess(items, 10, processItem);
}

// 4. 需要快速响应 → 竞速
async function fastResponse() {
  return Promise.race([
    fetchFromCDN1(),
    fetchFromCDN2(),
    fetchFromCDN3()
  ]);
}

// 5. 需要超时控制 → 超时包装
async function withTimeout() {
  return Promise.race([
    fetchData(),
    timeout(5000)
  ]);
}
```

---

## 9. 实际应用案例

### 9.1 批量上传文件

```javascript
async function uploadFiles(files, concurrency = 3) {
  const limiter = new ConcurrencyLimit(concurrency);
  const results = [];
  
  for (const file of files) {
    const promise = limiter.run(async () => {
      try {
        const result = await uploadFile(file);
        return { file: file.name, status: 'success', result };
      } catch (error) {
        return { file: file.name, status: 'error', error: error.message };
      }
    });
    
    results.push(promise);
  }
  
  return Promise.all(results);
}

// 使用
const files = [/* FileList */];
const results = await uploadFiles(files, 3);

results.forEach(result => {
  if (result.status === 'success') {
    console.log(`${result.file} 上传成功`);
  } else {
    console.error(`${result.file} 上传失败: ${result.error}`);
  }
});
```

### 9.2 数据预加载

```javascript
class DataPreloader {
  constructor() {
    this.cache = new Map();
    this.loading = new Map();
  }
  
  async load(key, fetchFn) {
    // 检查缓存
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    // 检查是否正在加载
    if (this.loading.has(key)) {
      return this.loading.get(key);
    }
    
    // 开始加载
    const promise = fetchFn(key).then(data => {
      this.cache.set(key, data);
      this.loading.delete(key);
      return data;
    });
    
    this.loading.set(key, promise);
    return promise;
  }
  
  preload(keys, fetchFn) {
    return Promise.all(
      keys.map(key => this.load(key, fetchFn))
    );
  }
}

// 使用
const preloader = new DataPreloader();

// 预加载
await preloader.preload([1, 2, 3], id => 
  fetch(`/api/items/${id}`).then(r => r.json())
);

// 后续请求从缓存获取
const item = await preloader.load(1, id => 
  fetch(`/api/items/${id}`).then(r => r.json())
);
```

### 9.3 分页数据加载

```javascript
async function loadAllPages(baseUrl) {
  const results = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`${baseUrl}?page=${page}`);
    const data = await response.json();
    
    results.push(...data.items);
    hasMore = data.hasMore;
    page++;
  }
  
  return results;
}

// 并发加载多页
async function loadPagesInParallel(baseUrl, maxPages) {
  const pages = Array.from({ length: maxPages }, (_, i) => i + 1);
  
  const results = await Promise.all(
    pages.map(async page => {
      const response = await fetch(`${baseUrl}?page=${page}`);
      const data = await response.json();
      return data.items;
    })
  );
  
  return results.flat();
}
```

---

## 关键要点

1. **并发 vs 并行**
   - 并发：任务交替执行
   - 并行：任务同时执行
   - JavaScript 主要是并发

2. **执行模式**
   - 串行：一个接一个
   - 并行：Promise.all
   - 混合：根据依赖关系

3. **并发控制**
   - 限制并发数
   - 批量处理
   - 队列管理

4. **高级技术**
   - 超时与取消
   - 重试机制
   - 资源池

5. **最佳实践**
   - 根据场景选择模式
   - 控制资源消耗
   - 处理错误

---

## 深入一点

### 微任务与宏任务的并发

```javascript
console.log('1');

Promise.resolve().then(() => {
  console.log('2');
  
  Promise.resolve().then(() => {
    console.log('3');
  });
});

Promise.resolve().then(() => {
  console.log('4');
});

console.log('5');

// 输出：1, 5, 2, 4, 3
// 微任务在当前宏任务后立即执行
// 所有微任务清空后才执行下一个宏任务
```

### Web Worker 实现并行

```javascript
// 真正的并行需要 Web Worker
// main.js
const worker = new Worker('worker.js');

const data = new Array(1000000).fill(0).map((_, i) => i);

worker.postMessage({ data });

worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// worker.js
self.onmessage = (e) => {
  const result = e.data.data.reduce((sum, val) => sum + val, 0);
  self.postMessage(result);
};

// 主线程和 Worker 线程并行计算
```

---

## 参考资料

- [MDN: Promise concurrency](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#promise_concurrency)
- [JavaScript Concurrency Patterns](https://www.patterns.dev/posts/async-patterns)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

---

**上一章**：[Generator 与迭代器](./content-22.md)  
**下一章**：[V8 引擎优化](./content-24.md)
