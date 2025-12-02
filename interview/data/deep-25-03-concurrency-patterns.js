/**
 * 并发模式
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2503ConcurrencyPatterns = {
  "config": {
    "title": "并发模式",
    "icon": "🔄",
    "description": "掌握SharedArrayBuffer的并发编程模式",
    "primaryColor": "#ec4899",
    "bgGradient": "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "medium",
      "tags": ["生产者消费者"],
      "question": "生产者-消费者模式的核心同步原语是什么？",
      "options": ["wait和notify", "lock和unlock", "read和write", "send和receive"],
      "correctAnswer": "A",
      "explanation": {"title": "生产者-消费者模式", "code": "// 使用wait/notify实现\nclass BoundedQueue {\n  constructor(capacity) {\n    this.sab = new SharedArrayBuffer((capacity + 3) * 4);\n    this.view = new Int32Array(this.sab);\n    this.capacity = capacity;\n    // [0]:head [1]:tail [2]:size [3+]:data\n  }\n  \n  enqueue(value) {\n    while (true) {\n      const size = Atomics.load(this.view, 2);\n      if (size < this.capacity) {\n        const tail = Atomics.load(this.view, 1);\n        Atomics.store(this.view, tail + 3, value);\n        Atomics.store(this.view, 1, (tail + 1) % this.capacity);\n        Atomics.add(this.view, 2, 1);\n        Atomics.notify(this.view, 2, 1);\n        return;\n      }\n      Atomics.wait(this.view, 2, size);\n    }\n  }\n  \n  dequeue() {\n    while (true) {\n      const size = Atomics.load(this.view, 2);\n      if (size > 0) {\n        const head = Atomics.load(this.view, 0);\n        const value = Atomics.load(this.view, head + 3);\n        Atomics.store(this.view, 0, (head + 1) % this.capacity);\n        Atomics.sub(this.view, 2, 1);\n        Atomics.notify(this.view, 2, 1);\n        return value;\n      }\n      Atomics.wait(this.view, 2, size);\n    }\n  }\n}"}
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["锁模式"],
      "question": "常见的锁模式有哪些？",
      "options": ["自旋锁", "读写锁", "互斥锁", "递归锁", "全局锁", "条件锁"],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {"title": "锁的类型", "code": "// 1. 自旋锁\nclass SpinLock {\n  lock() {\n    while (Atomics.compareExchange(this.view, 0, 0, 1) !== 0) {}\n  }\n}\n\n// 2. 读写锁\nclass RWLock {\n  acquireRead() {\n    Atomics.add(this.view, 0, 1);  // 增加读者数\n  }\n  releaseRead() {\n    Atomics.sub(this.view, 0, 1);\n  }\n  acquireWrite() {\n    while (Atomics.compareExchange(this.view, 1, 0, 1) !== 0) {}\n    while (Atomics.load(this.view, 0) !== 0) {}  // 等待读者\n  }\n}\n\n// 3. 互斥锁\nclass Mutex {\n  lock() {\n    while (Atomics.compareExchange(this.view, 0, 0, 1) !== 0) {\n      Atomics.wait(this.view, 0, 1);\n    }\n  }\n  unlock() {\n    Atomics.store(this.view, 0, 0);\n    Atomics.notify(this.view, 0, 1);\n  }\n}\n\n// 4. 递归锁\nclass RecursiveLock {\n  lock() {\n    const tid = this.getThreadId();\n    if (Atomics.load(this.view, 1) === tid) {\n      Atomics.add(this.view, 2, 1);  // 递归计数\n    } else {\n      while (Atomics.compareExchange(this.view, 0, 0, 1) !== 0) {}\n      Atomics.store(this.view, 1, tid);\n      Atomics.store(this.view, 2, 1);\n    }\n  }\n}"}
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["死锁"],
      "question": "使用SharedArrayBuffer和Atomics可能导致死锁",
      "correctAnswer": "A",
      "explanation": {"title": "死锁风险", "code": "// 死锁：多个线程互相等待\n\n// 死锁示例\n// Thread 1\nlock(A);\nlock(B);\nunlock(B);\nunlock(A);\n\n// Thread 2\nlock(B);  // 等待Thread 1释放B\nlock(A);  // Thread 1等待Thread 2释放A\nunlock(A);\nunlock(B);\n\n// 避免死锁：\n// 1. 锁排序\nfunction lockInOrder(lockA, lockB) {\n  const first = lockA.id < lockB.id ? lockA : lockB;\n  const second = lockA.id < lockB.id ? lockB : lockA;\n  first.lock();\n  second.lock();\n}\n\n// 2. 超时\nfunction tryLockWithTimeout(lock, timeout) {\n  const start = Date.now();\n  while (Date.now() - start < timeout) {\n    if (lock.tryLock()) return true;\n  }\n  return false;\n}\n\n// 3. 避免嵌套锁\n// ❌\nlock1.lock();\nlock2.lock();  // 危险\n\n// ✅\nlock1.lock();\noperation();\nlock1.unlock();\nlock2.lock();\noperation();\nlock2.unlock();"}
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["屏障"],
      "question": "实现屏障同步，空白处填什么？",
      "code": "class Barrier {\n  constructor(count) {\n    this.sab = new SharedArrayBuffer(8);\n    this.view = new Int32Array(this.sab);\n    Atomics.store(this.view, 0, count);\n  }\n  \n  wait() {\n    if (Atomics.______(this.view, 0, 1) === 1) {\n      Atomics.notify(this.view, 1, Infinity);\n    } else {\n      Atomics.wait(this.view, 1, 0);\n    }\n  }\n}",
      "options": ["sub", "add", "store", "load"],
      "correctAnswer": "A",
      "explanation": {"title": "屏障模式", "code": "// Barrier：等待所有线程到达同步点\nclass Barrier {\n  constructor(count) {\n    this.sab = new SharedArrayBuffer(8);\n    this.view = new Int32Array(this.sab);\n    Atomics.store(this.view, 0, count);  // 计数器\n    Atomics.store(this.view, 1, 0);      // 标志\n  }\n  \n  wait() {\n    // 最后一个线程到达\n    if (Atomics.sub(this.view, 0, 1) === 1) {\n      Atomics.store(this.view, 1, 1);\n      Atomics.notify(this.view, 1, Infinity);  // 唤醒所有\n    } else {\n      // 等待最后一个线程\n      Atomics.wait(this.view, 1, 0);\n    }\n  }\n}\n\n// 使用\nconst barrier = new Barrier(4);\n\n// Worker 1-4\nself.onmessage = ({ data: { buffer } }) => {\n  const barrier = new Barrier(4);\n  \n  // 阶段1\n  doWork1();\n  barrier.wait();  // 等待所有完成阶段1\n  \n  // 阶段2\n  doWork2();\n  barrier.wait();  // 等待所有完成阶段2\n};"}
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["信号量"],
      "question": "信号量的输出？",
      "code": "const sem = new Semaphore(2);\n\n// 3个Worker同时acquire\n// Worker 1: sem.acquire()\n// Worker 2: sem.acquire()\n// Worker 3: sem.acquire()\n\n// 有多少Worker会等待？",
      "options": ["1个", "2个", "3个", "0个"],
      "correctAnswer": "A",
      "explanation": {"title": "信号量机制", "code": "// 信号量：限制并发访问数量\nclass Semaphore {\n  constructor(permits) {\n    this.sab = new SharedArrayBuffer(4);\n    this.view = new Int32Array(this.sab);\n    Atomics.store(this.view, 0, permits);\n  }\n  \n  acquire() {\n    while (true) {\n      const current = Atomics.load(this.view, 0);\n      if (current > 0 && \n          Atomics.compareExchange(this.view, 0, current, current - 1) === current) {\n        return;\n      }\n      Atomics.wait(this.view, 0, 0);\n    }\n  }\n  \n  release() {\n    Atomics.add(this.view, 0, 1);\n    Atomics.notify(this.view, 0, 1);\n  }\n}\n\n// 初始permits=2\n// Worker 1 acquire: permits=1\n// Worker 2 acquire: permits=0\n// Worker 3 acquire: 等待（permits已为0）\n\n// 应用：限制并发连接\nconst connSemaphore = new Semaphore(10);\n\nasync function makeRequest() {\n  connSemaphore.acquire();\n  try {\n    await fetch(url);\n  } finally {\n    connSemaphore.release();\n  }\n}"}
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["无锁结构"],
      "question": "无锁数据结构的优势？",
      "options": ["避免死锁", "更好的伸缩性", "更高的吞吐量", "更简单的代码", "无需同步", "无竞争"],
      "correctAnswer": ["A", "B", "C"],
      "explanation": {"title": "无锁编程", "code": "// 无锁栈\nclass LockFreeStack {\n  push(value) {\n    const node = { value, next: null };\n    while (true) {\n      const head = Atomics.load(this.view, 0);\n      node.next = head;\n      if (Atomics.compareExchange(this.view, 0, head, nodeIndex) === head) {\n        return;\n      }\n    }\n  }\n  \n  pop() {\n    while (true) {\n      const head = Atomics.load(this.view, 0);\n      if (head === null) return null;\n      const next = this.getNext(head);\n      if (Atomics.compareExchange(this.view, 0, head, next) === head) {\n        return this.getValue(head);\n      }\n    }\n  }\n}\n\n// 无锁队列（更复杂）\nclass LockFreeQueue {\n  enqueue(value) {\n    while (true) {\n      const tail = Atomics.load(this.view, 1);\n      const next = (tail + 1) % this.capacity;\n      if (Atomics.compareExchange(this.view, 1, tail, next) === tail) {\n        Atomics.store(this.view, tail + 2, value);\n        return;\n      }\n    }\n  }\n}\n\n// ABA问题\n// Thread 1读取A\n// Thread 2: A→B→A\n// Thread 1 CAS成功（错误地认为没变化）\n\n// 解决：版本号\nfunction casWithVersion(view, index, expected, newValue) {\n  const versionIndex = index + 1;\n  const version = Atomics.load(view, versionIndex);\n  \n  if (Atomics.compareExchange(view, index, expected, newValue) === expected) {\n    Atomics.add(view, versionIndex, 1);\n    return true;\n  }\n  return false;\n}"}
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["内存顺序"],
      "question": "JavaScript的Atomics保证顺序一致性",
      "correctAnswer": "A",
      "explanation": {"title": "内存模型", "code": "// JavaScript内存模型：顺序一致性（Sequential Consistency）\n// 所有线程看到相同的操作顺序\n\n// Atomics操作保证：\n// 1. 原子性\n// 2. 可见性\n// 3. 有序性\n\n// 示例\nAtomics.store(view, 0, 1);  // 写1\nAtomics.store(view, 1, 2);  // 写2\n\n// 其他线程保证看到：\n// - 0=1, 1=0（只看到第一次写）\n// - 0=1, 1=2（看到两次写）\n// 不会看到：0=0, 1=2（违反顺序）\n\n// vs 普通内存操作（可能乱序）\nview[0] = 1;\nview[1] = 2;\n// 其他线程可能看到任意顺序\n\n// 内存屏障\n// Atomics操作隐式包含内存屏障\nAtomics.store(view, 0, 1);  // Store Barrier\nconst x = Atomics.load(view, 1);  // Load Barrier\n\n// 禁止编译器和CPU重排序"}
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Future"],
      "question": "实现Future模式，空白处填什么？",
      "code": "class Future {\n  get() {\n    while (Atomics.load(this.view, 0) === 0) {\n      Atomics.______(this.view, 0, 0);\n    }\n    return Atomics.load(this.view, 1);\n  }\n}",
      "options": ["wait", "notify", "load", "store"],
      "correctAnswer": "A",
      "explanation": {"title": "Future/Promise模式", "code": "// Future：异步计算结果\nclass Future {\n  constructor() {\n    this.sab = new SharedArrayBuffer(8);\n    this.view = new Int32Array(this.sab);\n    // [0]:ready flag [1]:result\n  }\n  \n  set(value) {\n    Atomics.store(this.view, 1, value);\n    Atomics.store(this.view, 0, 1);  // 标记完成\n    Atomics.notify(this.view, 0, Infinity);\n  }\n  \n  get() {\n    while (Atomics.load(this.view, 0) === 0) {\n      Atomics.wait(this.view, 0, 0);  // 等待完成\n    }\n    return Atomics.load(this.view, 1);\n  }\n  \n  isDone() {\n    return Atomics.load(this.view, 0) === 1;\n  }\n}\n\n// 使用\nconst future = new Future();\n\n// Worker\nself.onmessage = ({ data: { buffer } }) => {\n  const result = heavyComputation();\n  future.set(result);\n};\n\n// Main\nconst result = future.get();  // 阻塞直到完成"}
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "并发编程最佳实践？",
      "options": ["最小化共享状态", "使用高层抽象", "避免嵌套锁", "忽略死锁", "测试并发场景", "文档化同步"],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {"title": "并发最佳实践", "code": "// 1. 最小化共享\n// ❌ 共享所有数据\nconst sharedState = { a, b, c, d, e };\n\n// ✅ 只共享必要的\nconst sharedCounter = new Int32Array(sab);\n\n// 2. 高层抽象\n// ✅ 使用封装好的类\nconst queue = new SharedQueue(100);\nqueue.enqueue(value);\n\n// 3. 避免嵌套锁\n// ❌\nlock1.lock();\nlock2.lock();\n\n// ✅ 锁排序或单锁\nconst globalLock = new Mutex();\n\n// 4. 测试\nfunction testConcurrency() {\n  const workers = Array(10).fill(0).map(() => \n    new Worker('test-worker.js')\n  );\n  \n  // 并发测试\n  workers.forEach(w => w.postMessage({ buffer: sab }));\n  \n  // 验证结果\n  setTimeout(() => {\n    const result = Atomics.load(view, 0);\n    console.assert(result === expected);\n  }, 1000);\n}\n\n// 5. 文档化\n/**\n * SharedQueue使用说明：\n * view[0]: head index\n * view[1]: tail index\n * view[2]: size\n * view[3+]: data\n */\n\n// 6. 错误处理\ntry {\n  lock.lock();\n  operation();\n} finally {\n  lock.unlock();  // 确保释放\n}"}
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["双检锁"],
      "question": "双检锁单例的正确性？",
      "code": "class Singleton {\n  static getInstance() {\n    if (!this.instance) {\n      lock();\n      if (!this.instance) {\n        this.instance = new Singleton();\n      }\n      unlock();\n    }\n    return this.instance;\n  }\n}\n\n// 多线程安全吗？",
      "options": ["安全", "不安全（需要内存屏障）", "安全（JavaScript单线程）", "取决于实现"],
      "correctAnswer": "A",
      "explanation": {"title": "双检锁模式", "code": "// JavaScript中使用Atomics实现\nclass Singleton {\n  constructor() {\n    this.sab = new SharedArrayBuffer(8);\n    this.view = new Int32Array(this.sab);\n  }\n  \n  static getInstance() {\n    // 第一次检查（无锁）\n    if (Atomics.load(this.view, 0) === 0) {\n      // 加锁\n      while (Atomics.compareExchange(this.view, 1, 0, 1) !== 0) {}\n      \n      // 第二次检查（有锁）\n      if (Atomics.load(this.view, 0) === 0) {\n        const instance = new Singleton();\n        // 先创建实例，再设置标志（内存屏障）\n        Atomics.store(this.view, 2, instance.id);\n        Atomics.store(this.view, 0, 1);\n      }\n      \n      // 释放锁\n      Atomics.store(this.view, 1, 0);\n    }\n    \n    return this.getInstance(Atomics.load(this.view, 2));\n  }\n}\n\n// JavaScript的Atomics保证：\n// 1. Store-Load屏障\n// 2. 禁止重排序\n// 3. 保证可见性\n\n// 因此双检锁是安全的"}
    }
  ],
  "navigation": {
    "prev": {"title": "Atomics操作", "url": "25-02-atomics.html"},
    "next": {"title": "WebAssembly基础", "url": "26-01-wasm-basics.html"}
  }
};
