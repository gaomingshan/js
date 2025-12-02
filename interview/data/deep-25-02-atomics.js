/**
 * Atomics操作
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2502Atomics = {
  "config": {
    "title": "Atomics操作",
    "icon": "⚛️",
    "description": "掌握Atomics提供的原子操作方法",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["Atomics"],
      "question": "Atomics对象的主要作用是什么？",
      "options": [
        "提供原子操作，避免竞态条件",
        "提高数组性能",
        "加密数据",
        "压缩数据"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Atomics原子操作",
        "code": "// Atomics：原子操作API\n// 保证操作的原子性（不可分割）\n\nconst sab = new SharedArrayBuffer(4);\nconst view = new Int32Array(sab);\n\n// ❌ 非原子操作（可能竞态）\nview[0]++;  // 读 → 加 → 写（三步）\n\n// ✅ 原子操作（一步完成）\nAtomics.add(view, 0, 1);\n\n// Atomics方法：\n\n// 1. 读写操作\nAtomics.load(view, 0);        // 原子读\nAtomics.store(view, 0, 42);   // 原子写\nAtomics.exchange(view, 0, 100);  // 交换值\n\n// 2. 数学操作\nAtomics.add(view, 0, 5);      // 加法\nAtomics.sub(view, 0, 3);      // 减法\n\n// 3. 位操作\nAtomics.and(view, 0, 0xFF);   // 按位与\nAtomics.or(view, 0, 0x01);    // 按位或\nAtomics.xor(view, 0, 0x10);   // 按位异或\n\n// 4. 比较交换\nAtomics.compareExchange(view, 0, 10, 20);\n// 如果view[0] === 10，设置为20\n\n// 5. 等待通知\nAtomics.wait(view, 0, 0);     // 等待\nAtomics.notify(view, 0, 1);   // 通知"
      },
      "source": "Atomics"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["compareExchange"],
      "question": "Atomics.compareExchange的返回值？",
      "code": "const sab = new SharedArrayBuffer(4);\nconst view = new Int32Array(sab);\nview[0] = 10;\n\nconst result = Atomics.compareExchange(view, 0, 10, 20);\nconsole.log(result, view[0]);",
      "options": [
        "10, 20",
        "20, 20",
        "10, 10",
        "20, 10"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "compareExchange详解",
        "code": "// Atomics.compareExchange(view, index, expect, replace)\n// 如果view[index] === expect，则设置为replace\n// 返回旧值\n\nconst sab = new SharedArrayBuffer(4);\nconst view = new Int32Array(sab);\nview[0] = 10;\n\n// 期望值匹配\nconst old = Atomics.compareExchange(view, 0, 10, 20);\nconsole.log(old);      // 10（旧值）\nconsole.log(view[0]);  // 20（新值）\n\n// 期望值不匹配\nconst old2 = Atomics.compareExchange(view, 0, 100, 30);\nconsole.log(old2);     // 20（旧值，未改变）\nconsole.log(view[0]);  // 20（未改变）\n\n// 应用：实现自旋锁\nfunction tryLock(view, index) {\n  // 尝试将0改为1（加锁）\n  return Atomics.compareExchange(view, index, 0, 1) === 0;\n}\n\nfunction unlock(view, index) {\n  Atomics.store(view, index, 0);\n}\n\nfunction withLock(view, index, fn) {\n  // 自旋等待锁\n  while (!tryLock(view, index)) {\n    // 忙等待\n  }\n  \n  try {\n    fn();\n  } finally {\n    unlock(view, index);\n  }\n}\n\n// 使用\nconst lockView = new Int32Array(new SharedArrayBuffer(4));\n\nwithLock(lockView, 0, () => {\n  // 临界区代码\n  console.log('受保护的操作');\n});"
      },
      "source": "compareExchange"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["wait/notify"],
      "question": "Atomics.wait和Atomics.notify的特点？",
      "options": [
        "wait会阻塞线程",
        "notify唤醒等待的线程",
        "只能在Worker中使用wait",
        "主线程可以使用wait",
        "notify可以指定唤醒数量",
        "wait可以设置超时"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "wait/notify机制",
        "code": "// Atomics.wait/notify：线程同步\n\n// wait(view, index, value, timeout)\n// - 如果view[index] === value，则等待\n// - 返回值：'ok'、'not-equal'、'timed-out'\n// - 只能在Worker中调用\n\n// notify(view, index, count)\n// - 唤醒count个等待的线程\n// - 返回实际唤醒的数量\n\n// Worker 1（生产者）\nconst sab = new SharedArrayBuffer(8);\nconst view = new Int32Array(sab);\n\nAtomics.store(view, 0, 0);  // 数据\nAtomics.store(view, 1, 0);  // 标志\n\n// 生产数据\nAtomics.store(view, 0, 42);\nAtomics.store(view, 1, 1);  // 设置标志\nAtomics.notify(view, 1, 1);  // 通知一个等待者\n\n// Worker 2（消费者）\nself.onmessage = ({ data: { buffer } }) => {\n  const view = new Int32Array(buffer);\n  \n  // 等待数据\n  const result = Atomics.wait(view, 1, 0);  // 等待标志变为非0\n  \n  if (result === 'ok') {\n    const data = Atomics.load(view, 0);\n    console.log('收到数据:', data);\n  }\n};\n\n// 超时等待\nconst result = Atomics.wait(view, 0, 0, 1000);  // 等待1秒\nif (result === 'timed-out') {\n  console.log('等待超时');\n}\n\n// 唤醒所有等待者\nAtomics.notify(view, 0, Infinity);\n\n// 生产者-消费者模式\nclass SharedQueue {\n  constructor(capacity) {\n    this.sab = new SharedArrayBuffer((capacity + 2) * 4);\n    this.view = new Int32Array(this.sab);\n  }\n  \n  push(value) {\n    // 等待队列有空间\n    while (this.isFull()) {\n      Atomics.wait(this.view, 0, this.getHead());\n    }\n    \n    const tail = Atomics.load(this.view, 1);\n    Atomics.store(this.view, tail + 2, value);\n    Atomics.add(this.view, 1, 1);\n    Atomics.notify(this.view, 1, 1);  // 通知消费者\n  }\n  \n  pop() {\n    // 等待队列有数据\n    while (this.isEmpty()) {\n      Atomics.wait(this.view, 1, this.getTail());\n    }\n    \n    const head = Atomics.load(this.view, 0);\n    const value = Atomics.load(this.view, head + 2);\n    Atomics.add(this.view, 0, 1);\n    Atomics.notify(this.view, 0, 1);  // 通知生产者\n    return value;\n  }\n}"
      },
      "source": "wait/notify"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["主线程"],
      "question": "主线程不能使用Atomics.wait",
      "correctAnswer": "A",
      "explanation": {
        "title": "主线程限制",
        "code": "// 主线程禁止使用Atomics.wait\n// 原因：会阻塞UI线程\n\n// ❌ 主线程\ntry {\n  const sab = new SharedArrayBuffer(4);\n  const view = new Int32Array(sab);\n  Atomics.wait(view, 0, 0);  // TypeError\n} catch (e) {\n  console.log('主线程不能wait');\n}\n\n// ✅ Worker中可以\n// worker.js\nself.onmessage = ({ data: { buffer } }) => {\n  const view = new Int32Array(buffer);\n  Atomics.wait(view, 0, 0);  // ✅ 允许\n};\n\n// 主线程可以notify\nconst sab = new SharedArrayBuffer(4);\nconst view = new Int32Array(sab);\nAtomics.notify(view, 0, 1);  // ✅ 允许\n\n// 解决方案：主线程使用轮询\nfunction pollUntil(view, index, value) {\n  return new Promise(resolve => {\n    function check() {\n      if (Atomics.load(view, index) === value) {\n        resolve();\n      } else {\n        setTimeout(check, 10);  // 轮询\n      }\n    }\n    check();\n  });\n}\n\n// 使用\nawait pollUntil(view, 0, 1);\nconsole.log('条件满足');"
      },
      "source": "主线程限制"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["原子加法"],
      "question": "原子递增，空白处填什么？",
      "code": "const result = Atomics.______(view, 0, 1);\n// result是旧值，view[0]已增加1",
      "options": [
        "add",
        "increment",
        "inc",
        "plus"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Atomics数学操作",
        "code": "// Atomics.add(view, index, value)\n// 原子加法，返回旧值\n\nconst sab = new SharedArrayBuffer(4);\nconst view = new Int32Array(sab);\nview[0] = 10;\n\nconst old = Atomics.add(view, 0, 5);\nconsole.log(old);      // 10（旧值）\nconsole.log(view[0]);  // 15（新值）\n\n// 其他数学操作\n\n// 减法\nconst old2 = Atomics.sub(view, 0, 3);\n// view[0] = 15 - 3 = 12\n\n// 按位与\nview[0] = 0b1111;\nAtomics.and(view, 0, 0b0011);\n// view[0] = 0b0011\n\n// 按位或\nview[0] = 0b1100;\nAtomics.or(view, 0, 0b0011);\n// view[0] = 0b1111\n\n// 按位异或\nview[0] = 0b1010;\nAtomics.xor(view, 0, 0b0101);\n// view[0] = 0b1111\n\n// 实现原子递增\nfunction atomicIncrement(view, index) {\n  return Atomics.add(view, index, 1) + 1;  // 返回新值\n}\n\n// 实现原子递减\nfunction atomicDecrement(view, index) {\n  return Atomics.sub(view, index, 1) - 1;  // 返回新值\n}\n\n// 所有操作都返回旧值\nconst operations = [\n  () => Atomics.add(view, 0, 1),\n  () => Atomics.sub(view, 0, 1),\n  () => Atomics.and(view, 0, 0xFF),\n  () => Atomics.or(view, 0, 0x01),\n  () => Atomics.xor(view, 0, 0x10)\n];\n\noperations.forEach(op => {\n  const old = op();\n  console.log('旧值:', old, '新值:', view[0]);\n});"
      },
      "source": "数学操作"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["exchange"],
      "question": "Atomics.exchange的行为？",
      "code": "const sab = new SharedArrayBuffer(4);\nconst view = new Int32Array(sab);\nview[0] = 100;\n\nconst old = Atomics.exchange(view, 0, 200);\nconsole.log(old, view[0]);",
      "options": [
        "100, 200",
        "200, 200",
        "100, 100",
        "200, 100"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Atomics.exchange",
        "code": "// Atomics.exchange(view, index, value)\n// 原子交换：设置新值，返回旧值\n\nconst sab = new SharedArrayBuffer(4);\nconst view = new Int32Array(sab);\nview[0] = 100;\n\nconst old = Atomics.exchange(view, 0, 200);\nconsole.log(old);      // 100（旧值）\nconsole.log(view[0]);  // 200（新值）\n\n// vs store\nconst old2 = Atomics.store(view, 0, 300);\nconsole.log(old2);     // 300（返回设置的值）\nconsole.log(view[0]);  // 300\n\n// 应用：实现令牌桶\nclass TokenBucket {\n  constructor(capacity) {\n    this.sab = new SharedArrayBuffer(4);\n    this.view = new Int32Array(this.sab);\n    Atomics.store(this.view, 0, capacity);\n  }\n  \n  tryAcquire() {\n    while (true) {\n      const current = Atomics.load(this.view, 0);\n      \n      if (current <= 0) {\n        return false;  // 没有令牌\n      }\n      \n      // 尝试减少令牌\n      const prev = Atomics.compareExchange(\n        this.view, 0, current, current - 1\n      );\n      \n      if (prev === current) {\n        return true;  // 成功获取\n      }\n      // 否则重试\n    }\n  }\n  \n  release() {\n    Atomics.add(this.view, 0, 1);\n  }\n}\n\n// 实现交换两个位置的值\nfunction atomicSwap(view, i, j) {\n  const temp = Atomics.exchange(view, i, view[j]);\n  Atomics.store(view, j, temp);\n}"
      },
      "source": "exchange"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["应用场景"],
      "question": "Atomics的典型应用？",
      "options": [
        "实现锁",
        "实现信号量",
        "实现条件变量",
        "UI渲染",
        "实现队列",
        "单线程计算"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "Atomics应用场景",
        "code": "// 1. 自旋锁\nclass SpinLock {\n  constructor() {\n    this.sab = new SharedArrayBuffer(4);\n    this.view = new Int32Array(this.sab);\n  }\n  \n  lock() {\n    while (Atomics.compareExchange(this.view, 0, 0, 1) !== 0) {\n      // 忙等待\n    }\n  }\n  \n  unlock() {\n    Atomics.store(this.view, 0, 0);\n  }\n}\n\n// 2. 信号量\nclass Semaphore {\n  constructor(count) {\n    this.sab = new SharedArrayBuffer(4);\n    this.view = new Int32Array(this.sab);\n    Atomics.store(this.view, 0, count);\n  }\n  \n  acquire() {\n    while (true) {\n      const current = Atomics.load(this.view, 0);\n      if (current > 0) {\n        if (Atomics.compareExchange(this.view, 0, current, current - 1) === current) {\n          return;\n        }\n      } else {\n        Atomics.wait(this.view, 0, 0);\n      }\n    }\n  }\n  \n  release() {\n    Atomics.add(this.view, 0, 1);\n    Atomics.notify(this.view, 0, 1);\n  }\n}\n\n// 3. 条件变量\nclass ConditionVariable {\n  constructor() {\n    this.sab = new SharedArrayBuffer(4);\n    this.view = new Int32Array(this.sab);\n  }\n  \n  wait() {\n    const current = Atomics.load(this.view, 0);\n    Atomics.wait(this.view, 0, current);\n  }\n  \n  notifyOne() {\n    Atomics.add(this.view, 0, 1);\n    Atomics.notify(this.view, 0, 1);\n  }\n  \n  notifyAll() {\n    Atomics.add(this.view, 0, 1);\n    Atomics.notify(this.view, 0, Infinity);\n  }\n}\n\n// 4. 无锁队列\nclass LockFreeQueue {\n  constructor(capacity) {\n    const size = (capacity + 2) * 4;\n    this.sab = new SharedArrayBuffer(size);\n    this.view = new Int32Array(this.sab);\n    this.capacity = capacity;\n  }\n  \n  enqueue(value) {\n    while (true) {\n      const tail = Atomics.load(this.view, 1);\n      const next = (tail + 1) % this.capacity;\n      \n      if (Atomics.compareExchange(this.view, 1, tail, next) === tail) {\n        Atomics.store(this.view, tail + 2, value);\n        return;\n      }\n    }\n  }\n}"
      },
      "source": "应用场景"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["性能"],
      "question": "Atomics操作比普通操作慢",
      "correctAnswer": "A",
      "explanation": {
        "title": "Atomics性能",
        "code": "// Atomics操作有性能开销\n// 但在多线程环境中是必需的\n\n// 性能对比\nconst sab = new SharedArrayBuffer(4);\nconst view = new Int32Array(sab);\n\n// 普通操作（快但不安全）\nlet start = performance.now();\nfor (let i = 0; i < 1000000; i++) {\n  view[0]++;\n}\nconst time1 = performance.now() - start;\n\n// Atomics操作（慢但安全）\nstart = performance.now();\nfor (let i = 0; i < 1000000; i++) {\n  Atomics.add(view, 0, 1);\n}\nconst time2 = performance.now() - start;\n\nconsole.log('普通操作:', time1, 'ms');\nconsole.log('Atomics:', time2, 'ms');\nconsole.log('性能差异:', (time2 / time1).toFixed(2), 'x');\n\n// 典型结果：\n// 普通操作: 5ms\n// Atomics: 50ms\n// 性能差异: 10x\n\n// 何时使用Atomics：\n// ✅ 多线程共享数据\n// ✅ 需要原子性保证\n// ✅ 实现同步原语\n\n// ❌ 单线程\n// ❌ 不共享的数据\n// ❌ 性能关键路径（考虑其他方案）\n\n// 优化策略：\n// 1. 减少Atomics调用次数\n// 2. 批量操作\n// 3. 使用更粗粒度的锁"
      },
      "source": "性能"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["isLockFree"],
      "question": "检查操作是否无锁，空白处填什么？",
      "code": "if (Atomics.______(4)) {\n  console.log('4字节操作是无锁的');\n}",
      "options": [
        "isLockFree",
        "checkLockFree",
        "isFree",
        "hasLock"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Atomics.isLockFree",
        "code": "// Atomics.isLockFree(size)\n// 检查指定字节大小的操作是否无锁\n\nconsole.log(Atomics.isLockFree(1));  // true（通常）\nconsole.log(Atomics.isLockFree(2));  // true（通常）\nconsole.log(Atomics.isLockFree(4));  // true（总是）\nconsole.log(Atomics.isLockFree(8));  // false（可能）\n\n// 无锁操作：\n// - 硬件直接支持\n// - 性能更好\n// - 不需要操作系统锁\n\n// 有锁操作：\n// - 软件模拟\n// - 性能较差\n// - 可能使用互斥锁\n\n// 根据结果选择数据类型\nfunction getBestIntArray(sab) {\n  if (Atomics.isLockFree(8)) {\n    return new BigInt64Array(sab);\n  } else if (Atomics.isLockFree(4)) {\n    return new Int32Array(sab);\n  } else if (Atomics.isLockFree(2)) {\n    return new Int16Array(sab);\n  } else {\n    return new Int8Array(sab);\n  }\n}\n\n// LOCK_FREE_BYTE_LENGTH常量\nconsole.log(Atomics.BYTES_PER_ELEMENT);  // undefined（不存在）\n\n// 实践中：\n// Int32Array总是无锁的\n// BigInt64Array可能有锁\n\n// 性能测试\nfunction benchmarkAtomics(size) {\n  const sab = new SharedArrayBuffer(size);\n  const arrays = [\n    new Int8Array(sab),\n    new Int16Array(sab),\n    new Int32Array(sab)\n  ];\n  \n  arrays.forEach(arr => {\n    const start = performance.now();\n    for (let i = 0; i < 1000000; i++) {\n      Atomics.add(arr, 0, 1);\n    }\n    const time = performance.now() - start;\n    console.log(`${arr.constructor.name}: ${time}ms`);\n  });\n}"
      },
      "source": "isLockFree"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "Atomics使用最佳实践？",
      "options": [
        "优先使用Int32Array",
        "避免在主线程wait",
        "合理使用锁粒度",
        "所有操作都用Atomics",
        "使用compareExchange实现CAS",
        "忽略竞态条件"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "Atomics最佳实践",
        "code": "// 1. 优先Int32Array\n// 总是无锁，性能最好\nconst sab = new SharedArrayBuffer(1024);\nconst view = new Int32Array(sab);  // ✅\n\n// 2. 避免主线程wait\n// 会阻塞UI\n// ❌ 主线程\n// Atomics.wait(view, 0, 0);\n\n// ✅ Worker中\n// worker.js: Atomics.wait(view, 0, 0);\n\n// 3. 合理的锁粒度\n// ❌ 粗粒度锁（性能差）\nlock();\nfor (let i = 0; i < 1000; i++) {\n  process(i);\n}\nunlock();\n\n// ✅ 细粒度锁\nfor (let i = 0; i < 1000; i++) {\n  lock();\n  process(i);\n  unlock();\n}\n\n// 4. 使用CAS\nfunction atomicMax(view, index, value) {\n  while (true) {\n    const current = Atomics.load(view, index);\n    if (value <= current) return current;\n    \n    if (Atomics.compareExchange(view, index, current, value) === current) {\n      return value;\n    }\n  }\n}\n\n// 5. 错误处理\ntry {\n  Atomics.wait(view, 0, 0, 1000);\n} catch (e) {\n  if (e instanceof TypeError) {\n    console.error('主线程不能wait');\n  }\n}\n\n// 6. 文档化同步逻辑\n// 注释说明哪些索引用于什么目的\nconst LOCK_INDEX = 0;\nconst DATA_INDEX = 1;\nconst FLAG_INDEX = 2;\n\n// 7. 使用辅助函数\nfunction withAtomicLock(view, index, fn) {\n  while (Atomics.compareExchange(view, index, 0, 1) !== 0) {}\n  try {\n    return fn();\n  } finally {\n    Atomics.store(view, index, 0);\n  }\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "SharedArrayBuffer基础",
      "url": "25-01-sharedarraybuffer.html"
    },
    "next": {
      "title": "并发模式",
      "url": "25-03-concurrency-patterns.html"
    }
  }
};
