# 第 26 章：共享内存与原子操作 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** SharedArrayBuffer

### 题目

SharedArrayBuffer 的主要用途是什么？

**选项：**
- A. 存储大量数据
- B. 在多个 Worker 间共享内存
- C. 加密数据
- D. 提高数组性能

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**SharedArrayBuffer 共享内存**

```javascript
// 主线程
const sab = new SharedArrayBuffer(1024);
const view = new Uint8Array(sab);

// 发送给 Worker
worker.postMessage(sab);

// Worker 中
self.onmessage = (e) => {
  const sab = e.data;
  const view = new Uint8Array(sab);
  
  // 直接修改共享内存
  view[0] = 42;
};

// 主线程可以看到修改
setTimeout(() => {
  console.log(view[0]);  // 42
}, 100);
```

**与普通 ArrayBuffer 的区别：**

| 特性 | ArrayBuffer | SharedArrayBuffer |
|------|-------------|-------------------|
| 共享 | ❌ 拷贝传递 | ✅ 共享内存 |
| 并发访问 | ❌ | ✅ |
| Atomics | ❌ | ✅ 需要 |
| 安全性 | 高 | 需要同步 |

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** Atomics

### 题目

Atomics 对象的作用是什么？

**选项：**
- A. 加速计算
- B. 保证原子操作
- C. 压缩数据
- D. 加密数据

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Atomics 保证原子操作**

```javascript
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);

// 原子操作
Atomics.store(view, 0, 10);    // 原子写入
const value = Atomics.load(view, 0);  // 原子读取
Atomics.add(view, 0, 5);       // 原子加法
Atomics.sub(view, 0, 3);       // 原子减法

console.log(view[0]);  // 12
```

**Atomics 方法：**

```javascript
// 算术操作
Atomics.add(view, index, value)    // 加
Atomics.sub(view, index, value)    // 减
Atomics.and(view, index, value)    // 与
Atomics.or(view, index, value)     // 或
Atomics.xor(view, index, value)    // 异或

// 比较交换
Atomics.compareExchange(view, index, expected, replacement)

// 交换
Atomics.exchange(view, index, value)

// 读写
Atomics.load(view, index)
Atomics.store(view, index, value)

// 等待/通知
Atomics.wait(view, index, value, timeout)
Atomics.notify(view, index, count)
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 数据竞争

### 题目

使用 SharedArrayBuffer 需要考虑数据竞争问题。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**数据竞争问题**

```javascript
// ❌ 数据竞争
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);

// Worker 1
view[0]++;  // 读-修改-写

// Worker 2
view[0]++;  // 读-修改-写

// 可能结果：1（而不是 2）
```

**使用 Atomics 避免竞争：**

```javascript
// ✅ 原子操作
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);

// Worker 1
Atomics.add(view, 0, 1);

// Worker 2
Atomics.add(view, 0, 1);

// 保证结果：2
```

**临界区保护：**

```javascript
// 使用锁
class SpinLock {
  constructor(sab) {
    this.view = new Int32Array(sab);
    this.LOCKED = 1;
    this.UNLOCKED = 0;
  }
  
  lock() {
    while (true) {
      const old = Atomics.compareExchange(
        this.view, 0,
        this.UNLOCKED,
        this.LOCKED
      );
      
      if (old === this.UNLOCKED) {
        break;  // 获得锁
      }
      
      // 自旋等待
    }
  }
  
  unlock() {
    Atomics.store(this.view, 0, this.UNLOCKED);
  }
}

// 使用
const lock = new SpinLock(lockSab);

lock.lock();
// 临界区代码
view[0]++;
lock.unlock();
```

</details>

---

## 第 4 题 🟡

**类型：** 代码分析题  
**标签：** Atomics.wait/notify

### 题目

如何使用 Atomics.wait 和 Atomics.notify 实现线程同步？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**wait/notify 机制**

```javascript
// 主线程
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);

// 发送给 Worker
worker.postMessage(sab);

// 等待 Worker 完成
Atomics.wait(view, 0, 0);  // 等待 view[0] 不等于 0
console.log('Worker completed');

// Worker
self.onmessage = (e) => {
  const view = new Int32Array(e.data);
  
  // 执行任务
  doWork();
  
  // 通知主线程
  Atomics.store(view, 0, 1);
  Atomics.notify(view, 0, 1);
};
```

**完整的生产者-消费者模式：**

```javascript
// 主线程（生产者）
const sab = new SharedArrayBuffer(12);
const state = new Int32Array(sab, 0, 1);    // 状态
const data = new Int32Array(sab, 4, 2);     // 数据

const worker = new Worker('consumer.js');
worker.postMessage(sab);

function produce(value) {
  // 等待消费者准备好
  while (Atomics.load(state, 0) !== 0) {
    Atomics.wait(state, 0, 1);
  }
  
  // 写入数据
  data[0] = value;
  
  // 标记数据已就绪
  Atomics.store(state, 0, 1);
  Atomics.notify(state, 0, 1);
}

setInterval(() => {
  produce(Math.random());
}, 1000);

// consumer.js（消费者）
self.onmessage = (e) => {
  const sab = e.data;
  const state = new Int32Array(sab, 0, 1);
  const data = new Int32Array(sab, 4, 2);
  
  while (true) {
    // 等待数据
    Atomics.wait(state, 0, 0);
    
    // 读取数据
    const value = data[0];
    console.log('Consumed:', value);
    
    // 标记已消费
    Atomics.store(state, 0, 0);
    Atomics.notify(state, 0, 1);
  }
};
```

**超时控制：**

```javascript
// 等待最多 1 秒
const result = Atomics.wait(view, 0, 0, 1000);

if (result === 'timed-out') {
  console.log('等待超时');
} else if (result === 'ok') {
  console.log('收到通知');
} else if (result === 'not-equal') {
  console.log('值已改变');
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码实现题  
**标签：** 互斥锁

### 题目

使用 SharedArrayBuffer 和 Atomics 实现一个互斥锁。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
class Mutex {
  constructor(sab, index = 0) {
    this.view = new Int32Array(sab);
    this.index = index;
    this.LOCKED = 1;
    this.UNLOCKED = 0;
  }
  
  lock() {
    while (true) {
      // 尝试获取锁
      const old = Atomics.compareExchange(
        this.view,
        this.index,
        this.UNLOCKED,
        this.LOCKED
      );
      
      if (old === this.UNLOCKED) {
        return;  // 成功获取锁
      }
      
      // 等待锁释放
      Atomics.wait(this.view, this.index, this.LOCKED);
    }
  }
  
  unlock() {
    // 释放锁
    Atomics.store(this.view, this.index, this.UNLOCKED);
    
    // 通知等待的线程
    Atomics.notify(this.view, this.index, 1);
  }
  
  tryLock() {
    const old = Atomics.compareExchange(
      this.view,
      this.index,
      this.UNLOCKED,
      this.LOCKED
    );
    
    return old === this.UNLOCKED;
  }
}

// 使用
const sab = new SharedArrayBuffer(4);
const mutex = new Mutex(sab);

// Worker 1
mutex.lock();
try {
  // 临界区
  sharedData++;
} finally {
  mutex.unlock();
}

// Worker 2
if (mutex.tryLock()) {
  try {
    sharedData++;
  } finally {
    mutex.unlock();
  }
} else {
  console.log('获取锁失败');
}
```

**扩展：读写锁**

```javascript
class RWLock {
  constructor(sab, offset = 0) {
    this.view = new Int32Array(sab, offset, 2);
    this.READER_COUNT = 0;
    this.WRITER_FLAG = 1;
  }
  
  readLock() {
    while (true) {
      // 等待写锁释放
      while (Atomics.load(this.view, this.WRITER_FLAG) === 1) {
        Atomics.wait(this.view, this.WRITER_FLAG, 1);
      }
      
      // 增加读者计数
      Atomics.add(this.view, this.READER_COUNT, 1);
      
      // 再次检查写锁
      if (Atomics.load(this.view, this.WRITER_FLAG) === 0) {
        return;  // 成功获取读锁
      }
      
      // 写锁被获取，减少计数
      Atomics.sub(this.view, this.READER_COUNT, 1);
    }
  }
  
  readUnlock() {
    const count = Atomics.sub(this.view, this.READER_COUNT, 1);
    
    // 最后一个读者通知写者
    if (count === 1) {
      Atomics.notify(this.view, this.READER_COUNT, 1);
    }
  }
  
  writeLock() {
    // 获取写锁
    while (true) {
      const old = Atomics.compareExchange(
        this.view,
        this.WRITER_FLAG,
        0, 1
      );
      
      if (old === 0) break;
      Atomics.wait(this.view, this.WRITER_FLAG, 1);
    }
    
    // 等待所有读者完成
    while (Atomics.load(this.view, this.READER_COUNT) > 0) {
      Atomics.wait(this.view, this.READER_COUNT, 
        Atomics.load(this.view, this.READER_COUNT)
      );
    }
  }
  
  writeUnlock() {
    Atomics.store(this.view, this.WRITER_FLAG, 0);
    Atomics.notify(this.view, this.WRITER_FLAG);
  }
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** 内存序

### 题目

什么是内存序（Memory Ordering）？为什么重要？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**内存序概念**

内存序定义了多线程环境下内存操作的顺序保证。

**问题示例：**

```javascript
// 线程 1
x = 1;
y = 2;

// 线程 2
if (y === 2) {
  console.log(x);  // 可能是 0！
}
```

**Atomics 保证顺序：**

```javascript
const sab = new SharedArrayBuffer(8);
const view = new Int32Array(sab);

// 线程 1
view[0] = 1;
Atomics.store(view, 1, 2);  // 保证之前的写入可见

// 线程 2
if (Atomics.load(view, 1) === 2) {
  console.log(view[0]);  // 保证是 1
}
```

**内存屏障：**

```javascript
// Atomics 操作提供内存屏障
Atomics.store(view, index, value);
// 之前的所有写入对其他线程可见

const value = Atomics.load(view, index);
// 之后的读取能看到其他线程的写入
```

**实际应用：无锁队列**

```javascript
class LockFreeQueue {
  constructor(sab, capacity) {
    this.view = new Int32Array(sab);
    this.capacity = capacity;
    this.HEAD = 0;
    this.TAIL = 1;
    this.DATA_START = 2;
  }
  
  enqueue(value) {
    while (true) {
      const tail = Atomics.load(this.view, this.TAIL);
      const head = Atomics.load(this.view, this.HEAD);
      
      // 检查队列是否满
      if ((tail + 1) % this.capacity === head) {
        return false;  // 队列满
      }
      
      // 尝试写入
      const index = this.DATA_START + tail;
      this.view[index] = value;
      
      // 更新尾指针
      const success = Atomics.compareExchange(
        this.view,
        this.TAIL,
        tail,
        (tail + 1) % this.capacity
      ) === tail;
      
      if (success) {
        return true;
      }
    }
  }
  
  dequeue() {
    while (true) {
      const head = Atomics.load(this.view, this.HEAD);
      const tail = Atomics.load(this.view, this.TAIL);
      
      // 检查队列是否空
      if (head === tail) {
        return null;  // 队列空
      }
      
      // 读取数据
      const index = this.DATA_START + head;
      const value = this.view[index];
      
      // 更新头指针
      const success = Atomics.compareExchange(
        this.view,
        this.HEAD,
        head,
        (head + 1) % this.capacity
      ) === head;
      
      if (success) {
        return value;
      }
    }
  }
}
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 并发编程

### 题目

SharedArrayBuffer 的使用场景包括？

**选项：**
- A. 多线程计算
- B. 实时通信
- C. 游戏引擎
- D. 大数据处理

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**A. 多线程计算**
```javascript
// 主线程
const workers = [];
const sab = new SharedArrayBuffer(1000 * 4);
const view = new Float32Array(sab);

// 创建多个 Worker
for (let i = 0; i < 4; i++) {
  const worker = new Worker('compute.js');
  worker.postMessage({ sab, start: i * 250, end: (i + 1) * 250 });
  workers.push(worker);
}

// Worker：并行计算
self.onmessage = ({ data: { sab, start, end } }) => {
  const view = new Float32Array(sab);
  
  for (let i = start; i < end; i++) {
    view[i] = Math.sqrt(i);
  }
};
```

**B. 实时通信**
```javascript
// 音频/视频流处理
const bufferSize = 48000 * 4;  // 1 秒音频
const sab = new SharedArrayBuffer(bufferSize);
const audioData = new Float32Array(sab);

// 生产者线程
function produceAudio() {
  // 填充音频数据
  for (let i = 0; i < audioData.length; i++) {
    audioData[i] = generateSample(i);
  }
}

// 消费者线程
function consumeAudio() {
  // 播放音频数据
  audioContext.decodeAudioData(audioData.buffer);
}
```

**C. 游戏引擎**
```javascript
// 物理引擎在 Worker 中运行
const sab = new SharedArrayBuffer(1000 * 12);  // 位置、速度、加速度
const positions = new Float32Array(sab, 0, 1000);
const velocities = new Float32Array(sab, 4000, 1000);

// Physics Worker
function updatePhysics(dt) {
  for (let i = 0; i < positions.length; i += 3) {
    // 更新位置
    positions[i] += velocities[i] * dt;
    positions[i + 1] += velocities[i + 1] * dt;
    positions[i + 2] += velocities[i + 2] * dt;
  }
}

// 主线程渲染
function render() {
  // 直接读取共享内存中的位置
  for (let i = 0; i < positions.length; i += 3) {
    renderEntity(positions[i], positions[i + 1], positions[i + 2]);
  }
}
```

**D. 大数据处理**
```javascript
// 并行排序
function parallelSort(data) {
  const sab = new SharedArrayBuffer(data.length * 4);
  const view = new Int32Array(sab);
  view.set(data);
  
  const workers = [];
  const chunkSize = Math.ceil(data.length / 4);
  
  // 分块排序
  for (let i = 0; i < 4; i++) {
    const worker = new Worker('sort.js');
    worker.postMessage({
      sab,
      start: i * chunkSize,
      end: Math.min((i + 1) * chunkSize, data.length)
    });
    workers.push(worker);
  }
  
  // 等待完成后合并
  Promise.all(workers.map(w => new Promise(resolve => {
    w.onmessage = resolve;
  }))).then(() => {
    merge(view);
  });
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** 线程池

### 题目

使用 SharedArrayBuffer 实现一个线程池。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workers = [];
    this.tasks = [];
    this.availableWorkers = [];
    
    // 创建共享任务队列
    const queueSize = 100;
    this.queueSab = new SharedArrayBuffer((queueSize + 2) * 4);
    this.queueView = new Int32Array(this.queueSab);
    this.HEAD = 0;
    this.TAIL = 1;
    this.QUEUE_START = 2;
    
    // 初始化 Worker
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      
      worker.onmessage = (e) => {
        this.handleWorkerResult(worker, e.data);
      };
      
      worker.postMessage({
        type: 'init',
        queueSab: this.queueSab,
        workerId: i
      });
      
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }
  
  async execute(task) {
    return new Promise((resolve, reject) => {
      const taskId = this.tasks.length;
      
      this.tasks.push({
        task,
        resolve,
        reject,
        taskId
      });
      
      this.scheduleTask(taskId);
    });
  }
  
  scheduleTask(taskId) {
    if (this.availableWorkers.length === 0) {
      return;  // 等待 Worker 可用
    }
    
    const worker = this.availableWorkers.pop();
    const taskData = this.tasks[taskId];
    
    worker.postMessage({
      type: 'task',
      taskId,
      data: taskData.task
    });
  }
  
  handleWorkerResult(worker, result) {
    const { taskId, data, error } = result;
    const taskData = this.tasks[taskId];
    
    if (error) {
      taskData.reject(error);
    } else {
      taskData.resolve(data);
    }
    
    // Worker 重新可用
    this.availableWorkers.push(worker);
    
    // 调度下一个任务
    const nextTaskId = this.tasks.findIndex(
      (t, i) => i > taskId && t && !t.completed
    );
    
    if (nextTaskId !== -1) {
      this.scheduleTask(nextTaskId);
    }
  }
  
  terminate() {
    this.workers.forEach(worker => worker.terminate());
  }
}

// worker.js
let queueView;
let workerId;

self.onmessage = async (e) => {
  const { type, queueSab, workerId: id, taskId, data } = e.data;
  
  if (type === 'init') {
    queueView = new Int32Array(queueSab);
    workerId = id;
    return;
  }
  
  if (type === 'task') {
    try {
      const result = await processTask(data);
      self.postMessage({ taskId, data: result });
    } catch (error) {
      self.postMessage({ taskId, error: error.message });
    }
  }
};

async function processTask(data) {
  // 处理任务
  return data * 2;
}

// 使用
const pool = new WorkerPool('worker.js', 4);

const tasks = Array.from({ length: 100 }, (_, i) => i);

Promise.all(tasks.map(task => pool.execute(task)))
  .then(results => {
    console.log('所有任务完成:', results);
  });
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** 性能优化

### 题目

如何优化 SharedArrayBuffer 的性能？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**性能优化策略**

**1. 减少同步开销**
```javascript
// ❌ 频繁同步
for (let i = 0; i < 1000; i++) {
  Atomics.add(view, 0, 1);
}

// ✅ 批量处理
let localCount = 0;
for (let i = 0; i < 1000; i++) {
  localCount++;
}
Atomics.add(view, 0, localCount);
```

**2. 缓存行对齐**
```javascript
// ❌ 伪共享
const sab = new SharedArrayBuffer(8);
const view = new Int32Array(sab);

// Worker 1 写入 view[0]
// Worker 2 写入 view[1]
// 可能在同一缓存行，导致竞争

// ✅ 缓存行填充
const CACHE_LINE = 64;  // 字节
const sab = new SharedArrayBuffer(CACHE_LINE * 2);
const view1 = new Int32Array(sab, 0, 1);
const view2 = new Int32Array(sab, CACHE_LINE, 1);
```

**3. 使用类型化数组**
```javascript
// ✅ 类型化数组性能更好
const int32 = new Int32Array(sab);
const float32 = new Float32Array(sab);

// ❌ 避免混合类型
const dataView = new DataView(sab);
```

**4. 最小化锁粒度**
```javascript
// ❌ 锁粒度太大
mutex.lock();
process1();
process2();
process3();
mutex.unlock();

// ✅ 减小临界区
const result1 = process1();
const result2 = process2();

mutex.lock();
updateSharedData(result1, result2);
mutex.unlock();

const result3 = process3();
```

**5. 无锁数据结构**
```javascript
// 无锁栈
class LockFreeStack {
  constructor(sab) {
    this.view = new Int32Array(sab);
    this.TOP = 0;
  }
  
  push(value) {
    while (true) {
      const top = Atomics.load(this.view, this.TOP);
      this.view[top + 1] = value;
      
      const success = Atomics.compareExchange(
        this.view, this.TOP,
        top, top + 1
      ) === top;
      
      if (success) return;
    }
  }
  
  pop() {
    while (true) {
      const top = Atomics.load(this.view, this.TOP);
      if (top === 0) return null;
      
      const value = this.view[top];
      
      const success = Atomics.compareExchange(
        this.view, this.TOP,
        top, top - 1
      ) === top;
      
      if (success) return value;
    }
  }
}
```

**性能测试：**
```javascript
function benchmark(name, fn, iterations = 10000) {
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const duration = performance.now() - start;
  console.log(`${name}: ${duration.toFixed(2)}ms`);
  console.log(`  Ops/sec: ${(iterations / duration * 1000).toFixed(0)}`);
}

// 对比测试
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);

benchmark('Atomics.add', () => {
  Atomics.add(view, 0, 1);
});

benchmark('Direct write', () => {
  view[0]++;
});
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 并发编程总结

### 题目

总结 JavaScript 并发编程的最佳实践。

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**JavaScript 并发编程指南**

**1. 选择合适的并发模型**

```javascript
// Web Worker：CPU 密集型
const worker = new Worker('heavy-computation.js');

// SharedArrayBuffer：实时数据共享
const sab = new SharedArrayBuffer(1024);

// Promise：异步 I/O
const data = await fetch(url);

// async/await：异步流程控制
async function process() {
  const result = await operation();
}
```

**2. 数据共享策略**

```javascript
// 方案 1：消息传递（推荐）
worker.postMessage({ type: 'task', data });

// 方案 2：共享内存（需要时）
const sab = new SharedArrayBuffer(size);
worker.postMessage(sab);
```

**3. 同步机制**

```javascript
// 互斥锁
class Mutex {
  lock() { /* ... */ }
  unlock() { /* ... */ }
}

// 信号量
class Semaphore {
  acquire() { /* ... */ }
  release() { /* ... */ }
}

// 条件变量
Atomics.wait(view, index, value);
Atomics.notify(view, index);
```

**4. 避免常见错误**

```javascript
// ❌ 数据竞争
view[0]++;

// ✅ 原子操作
Atomics.add(view, 0, 1);

// ❌ 死锁
mutex1.lock();
mutex2.lock();  // 可能死锁

// ✅ 锁顺序
function lockInOrder(m1, m2) {
  if (m1.id < m2.id) {
    m1.lock();
    m2.lock();
  } else {
    m2.lock();
    m1.lock();
  }
}
```

**5. 性能优化**

```javascript
// 批量处理
const batch = [];
for (const item of items) {
  batch.push(process(item));
  if (batch.length >= 100) {
    await Promise.all(batch);
    batch.length = 0;
  }
}

// 对象池
const pool = new WorkerPool(4);

// 缓存行对齐
const CACHE_LINE = 64;
const offset = index * CACHE_LINE;
```

**完整示例：并行图像处理**

```javascript
class ImageProcessor {
  constructor(workerCount = 4) {
    this.workerCount = workerCount;
  }
  
  async process(imageData) {
    const { width, height, data } = imageData;
    
    // 创建共享内存
    const sab = new SharedArrayBuffer(data.length);
    const view = new Uint8ClampedArray(sab);
    view.set(data);
    
    // 分配任务
    const chunkHeight = Math.ceil(height / this.workerCount);
    const workers = [];
    
    for (let i = 0; i < this.workerCount; i++) {
      const worker = new Worker('image-worker.js');
      const startY = i * chunkHeight;
      const endY = Math.min((i + 1) * chunkHeight, height);
      
      workers.push(new Promise(resolve => {
        worker.onmessage = resolve;
        worker.postMessage({
          sab,
          width,
          startY,
          endY
        });
      }));
    }
    
    // 等待完成
    await Promise.all(workers);
    
    // 返回处理后的数据
    return new ImageData(
      new Uint8ClampedArray(view),
      width,
      height
    );
  }
}
```

</details>

---

**本章总结：**
- ✅ SharedArrayBuffer 基础
- ✅ Atomics 原子操作
- ✅ 数据竞争问题
- ✅ wait/notify 同步
- ✅ 互斥锁实现
- ✅ 内存序概念
- ✅ 并发应用场景
- ✅ 线程池实现
- ✅ 性能优化策略
- ✅ 并发编程最佳实践

**下一章：** [第 27 章：TC39 提案与未来特性](./chapter-27.md)
