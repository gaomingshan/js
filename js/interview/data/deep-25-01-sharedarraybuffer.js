/**
 * SharedArrayBuffer基础
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2501SharedArrayBuffer = {
  "config": {
    "title": "SharedArrayBuffer基础",
    "icon": "🔀",
    "description": "理解SharedArrayBuffer的概念和基本用法",
    "primaryColor": "#06b6d4",
    "bgGradient": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["SharedArrayBuffer"],
      "question": "SharedArrayBuffer的主要用途是什么？",
      "options": [
        "在多个Worker之间共享内存",
        "提高数组性能",
        "加密数据",
        "压缩数据"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "SharedArrayBuffer概念",
        "code": "// SharedArrayBuffer：共享内存缓冲区\n// 允许多个Worker共享同一块内存\n\n// 创建共享内存\nconst sab = new SharedArrayBuffer(1024);  // 1KB\n\n// 主线程\nconst worker = new Worker('worker.js');\nworker.postMessage({ buffer: sab });\n\n// worker.js\nself.onmessage = (e) => {\n  const { buffer } = e.data;\n  const view = new Int32Array(buffer);\n  \n  // 直接修改共享内存\n  view[0] = 42;\n};\n\n// 主线程可以立即看到修改\nconst view = new Int32Array(sab);\nconsole.log(view[0]);  // 可能是42\n\n// vs 普通ArrayBuffer（复制）\nconst ab = new ArrayBuffer(1024);\nworker.postMessage({ buffer: ab });  // 发送副本\n// Worker修改不影响主线程\n\n// 应用场景：\n// 1. 多线程计算\n// 2. 实时数据共享\n// 3. 游戏物理引擎\n// 4. 音视频处理"
      },
      "source": "SharedArrayBuffer"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["竞态条件"],
      "question": "以下代码可能的输出？",
      "code": "const sab = new SharedArrayBuffer(4);\nconst view = new Int32Array(sab);\n\n// Worker 1\nview[0]++;\n\n// Worker 2\nview[0]++;\n\n// 最终view[0]的值？",
      "options": [
        "可能是1或2（竞态条件）",
        "一定是2",
        "一定是1",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "竞态条件（Race Condition）",
        "code": "// 共享内存的竞态条件\n\nconst sab = new SharedArrayBuffer(4);\nconst view = new Int32Array(sab);\n\n// Worker 1和Worker 2同时执行\n// view[0]++ 等价于：\n// 1. 读取view[0]  →  0\n// 2. 加1          →  1\n// 3. 写入view[0]  →  1\n\n// 可能的执行顺序：\n\n// 情况1（正确）：\n// W1: 读(0) → 加(1) → 写(1)\n// W2: 读(1) → 加(2) → 写(2)\n// 结果：2 ✅\n\n// 情况2（竞态）：\n// W1: 读(0)\n// W2: 读(0)  ← 在W1写入前读取\n// W1: 加(1) → 写(1)\n// W2: 加(1) → 写(1)\n// 结果：1 ❌\n\n// 解决方案：使用Atomics\nAtomics.add(view, 0, 1);  // Worker 1\nAtomics.add(view, 0, 1);  // Worker 2\n// 保证结果是2\n\n// 竞态条件示例：\nfunction increment(view, index) {\n  // ❌ 不安全\n  view[index]++;\n  \n  // ✅ 安全\n  Atomics.add(view, index, 1);\n}\n\n// 检测竞态\nconst iterations = 10000;\nconst workers = 2;\nconst errors = 0;\n\n// 预期：iterations * workers\n// 实际：可能更小（竞态导致）"
      },
      "source": "竞态条件"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["TypedArray"],
      "question": "哪些TypedArray可以用于SharedArrayBuffer？",
      "options": [
        "Int8Array",
        "Int32Array",
        "Float64Array",
        "Array",
        "Uint8ClampedArray",
        "BigInt64Array"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "TypedArray与SharedArrayBuffer",
        "code": "// 所有TypedArray都可以用于SharedArrayBuffer\n\nconst sab = new SharedArrayBuffer(1024);\n\n// 整数类型\nconst int8 = new Int8Array(sab);\nconst int16 = new Int16Array(sab);\nconst int32 = new Int32Array(sab);\nconst uint8 = new Uint8Array(sab);\nconst uint16 = new Uint16Array(sab);\nconst uint32 = new Uint32Array(sab);\n\n// 浮点类型\nconst float32 = new Float32Array(sab);\nconst float64 = new Float64Array(sab);\n\n// 特殊类型\nconst uint8clamped = new Uint8ClampedArray(sab);\nconst bigint64 = new BigInt64Array(sab);\nconst biguint64 = new BigUint64Array(sab);\n\n// ❌ 普通Array不行\n// const arr = new Array(sab);  // 不支持\n\n// 多个视图共享内存\nconst sab2 = new SharedArrayBuffer(16);\nconst view1 = new Int32Array(sab2);    // 4个int32\nconst view2 = new Uint8Array(sab2);    // 16个uint8\n\nview1[0] = 0x12345678;\nconsole.log(view2[0]);  // 0x78（小端序）\n\n// 字节序（Endianness）\nconst dv = new DataView(sab);\ndv.setInt32(0, 0x12345678, true);  // 小端序\ndv.setInt32(0, 0x12345678, false); // 大端序"
      },
      "source": "TypedArray"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["安全性"],
      "question": "出于安全原因，SharedArrayBuffer在某些浏览器中被默认禁用",
      "correctAnswer": "A",
      "explanation": {
        "title": "SharedArrayBuffer安全性",
        "code": "// Spectre漏洞导致SharedArrayBuffer被禁用\n\n// 启用条件（需要设置HTTP头）：\n// Cross-Origin-Opener-Policy: same-origin\n// Cross-Origin-Embedder-Policy: require-corp\n\n// 检测支持\nif (typeof SharedArrayBuffer !== 'undefined') {\n  console.log('支持SharedArrayBuffer');\n} else {\n  console.log('不支持或已禁用');\n}\n\n// 服务器配置（Node.js/Express）\napp.use((req, res, next) => {\n  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');\n  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');\n  next();\n});\n\n// Nginx配置\n// add_header Cross-Origin-Opener-Policy same-origin;\n// add_header Cross-Origin-Embedder-Policy require-corp;\n\n// 安全风险：\n// 1. Spectre攻击\n// 2. 时间侧信道攻击\n// 3. 跨域信息泄漏\n\n// 缓解措施：\n// 1. 设置安全头\n// 2. 隔离跨域内容\n// 3. 使用HTTPS\n// 4. 限制精度（降低时间分辨率）"
      },
      "source": "安全性"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Worker通信"],
      "question": "在Worker间共享内存，空白处填什么？",
      "code": "// 主线程\nconst sab = new ________(1024);\nconst worker = new Worker('worker.js');\nworker.postMessage({ buffer: sab });",
      "options": [
        "SharedArrayBuffer",
        "ArrayBuffer",
        "Buffer",
        "SharedBuffer"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Worker间共享内存",
        "code": "// 主线程创建共享内存\nconst sab = new SharedArrayBuffer(1024);\nconst view = new Int32Array(sab);\n\n// 创建多个Worker\nconst worker1 = new Worker('worker1.js');\nconst worker2 = new Worker('worker2.js');\n\n// 发送共享内存（不是复制）\nworker1.postMessage({ buffer: sab });\nworker2.postMessage({ buffer: sab });\n\n// worker1.js\nself.onmessage = (e) => {\n  const { buffer } = e.data;\n  const view = new Int32Array(buffer);\n  \n  // 修改共享内存\n  Atomics.add(view, 0, 1);\n  \n  console.log('Worker1:', view[0]);\n};\n\n// worker2.js\nself.onmessage = (e) => {\n  const { buffer } = e.data;\n  const view = new Int32Array(buffer);\n  \n  // 读取共享内存\n  console.log('Worker2:', view[0]);\n};\n\n// 完整示例：多Worker计数器\nclass SharedCounter {\n  constructor() {\n    this.sab = new SharedArrayBuffer(4);\n    this.view = new Int32Array(this.sab);\n  }\n  \n  getBuffer() {\n    return this.sab;\n  }\n  \n  increment() {\n    Atomics.add(this.view, 0, 1);\n  }\n  \n  getValue() {\n    return Atomics.load(this.view, 0);\n  }\n}\n\nconst counter = new SharedCounter();\nconst workers = [];\n\nfor (let i = 0; i < 4; i++) {\n  const worker = new Worker('counter-worker.js');\n  worker.postMessage({ buffer: counter.getBuffer() });\n  workers.push(worker);\n}\n\nsetTimeout(() => {\n  console.log('Total:', counter.getValue());\n}, 1000);"
      },
      "source": "Worker通信"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["内存对齐"],
      "question": "SharedArrayBuffer的字节对齐？",
      "code": "const sab = new SharedArrayBuffer(10);\nconst view = new Int32Array(sab);\n\nconsole.log(view.length);",
      "options": [
        "2",
        "10",
        "2.5",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "字节对齐",
        "code": "// TypedArray需要字节对齐\n\nconst sab = new SharedArrayBuffer(10);  // 10字节\nconst view = new Int32Array(sab);       // 每个元素4字节\n\n// 10 ÷ 4 = 2.5\n// 只能容纳2个完整的Int32\nconsole.log(view.length);  // 2\n\n// 字节对齐规则：\nconst sab2 = new SharedArrayBuffer(16);\n\n// Int8Array: 1字节对齐\nconst int8 = new Int8Array(sab2);     // 16个元素\n\n// Int16Array: 2字节对齐\nconst int16 = new Int16Array(sab2);   // 8个元素\n\n// Int32Array: 4字节对齐\nconst int32 = new Int32Array(sab2);   // 4个元素\n\n// Float64Array: 8字节对齐\nconst float64 = new Float64Array(sab2);  // 2个元素\n\n// 字节偏移必须对齐\ntry {\n  // ❌ 偏移1不是4的倍数\n  new Int32Array(sab, 1);  // RangeError\n} catch (e) {}\n\n// ✅ 偏移4是4的倍数\nconst aligned = new Int32Array(sab, 4);\n\n// DataView没有对齐要求\nconst dv = new DataView(sab);\ndv.setInt32(1, 42);  // ✅ 可以在任意偏移"
      },
      "source": "字节对齐"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["应用场景"],
      "question": "SharedArrayBuffer的典型应用？",
      "options": [
        "多线程数值计算",
        "实时游戏状态共享",
        "音视频处理",
        "单线程UI渲染",
        "WebGL缓冲区",
        "加密存储"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "SharedArrayBuffer应用场景",
        "code": "// 1. 多线程数值计算\n// 主线程\nconst sab = new SharedArrayBuffer(1000000 * 4);\nconst data = new Float32Array(sab);\n\nconst workers = [];\nfor (let i = 0; i < 4; i++) {\n  const worker = new Worker('compute.js');\n  worker.postMessage({\n    buffer: sab,\n    start: i * 250000,\n    end: (i + 1) * 250000\n  });\n  workers.push(worker);\n}\n\n// compute.js\nself.onmessage = ({ data: { buffer, start, end } }) => {\n  const arr = new Float32Array(buffer);\n  for (let i = start; i < end; i++) {\n    arr[i] = Math.sqrt(i);  // 并行计算\n  }\n};\n\n// 2. 游戏状态共享\nclass GameState {\n  constructor() {\n    this.sab = new SharedArrayBuffer(1024);\n    this.view = new Float32Array(this.sab);\n  }\n  \n  setPlayerPosition(id, x, y) {\n    Atomics.store(this.view, id * 2, x);\n    Atomics.store(this.view, id * 2 + 1, y);\n  }\n  \n  getPlayerPosition(id) {\n    return {\n      x: Atomics.load(this.view, id * 2),\n      y: Atomics.load(this.view, id * 2 + 1)\n    };\n  }\n}\n\n// 3. 音视频处理\nclass AudioBuffer {\n  constructor(size) {\n    this.sab = new SharedArrayBuffer(size * 4);\n    this.samples = new Float32Array(this.sab);\n  }\n  \n  write(worker) {\n    worker.postMessage({ buffer: this.sab });\n  }\n}\n\n// 4. WebGL缓冲区\nconst sab = new SharedArrayBuffer(vertices.byteLength);\nconst sharedVertices = new Float32Array(sab);\nsharedVertices.set(vertices);\n\nconst buffer = gl.createBuffer();\ngl.bindBuffer(gl.ARRAY_BUFFER, buffer);\ngl.bufferData(gl.ARRAY_BUFFER, sharedVertices, gl.STATIC_DRAW);"
      },
      "source": "应用场景"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["性能"],
      "question": "SharedArrayBuffer避免了数据复制，提高了性能",
      "correctAnswer": "A",
      "explanation": {
        "title": "性能优势",
        "code": "// SharedArrayBuffer避免数据复制\n\n// ❌ 普通ArrayBuffer（复制）\nconst ab = new ArrayBuffer(1024 * 1024);  // 1MB\nworker.postMessage({ buffer: ab });  // 复制1MB数据\n// 性能影响：复制耗时 + 双倍内存\n\n// ✅ SharedArrayBuffer（共享）\nconst sab = new SharedArrayBuffer(1024 * 1024);\nworker.postMessage({ buffer: sab });  // 只传递引用\n// 性能优势：零复制 + 共享内存\n\n// 性能对比测试\nfunction benchmark() {\n  const size = 10 * 1024 * 1024;  // 10MB\n  \n  // 测试ArrayBuffer\n  const ab = new ArrayBuffer(size);\n  const start1 = performance.now();\n  worker.postMessage({ buffer: ab });\n  const time1 = performance.now() - start1;\n  \n  // 测试SharedArrayBuffer\n  const sab = new SharedArrayBuffer(size);\n  const start2 = performance.now();\n  worker.postMessage({ buffer: sab });\n  const time2 = performance.now() - start2;\n  \n  console.log('ArrayBuffer:', time1, 'ms');\n  console.log('SharedArrayBuffer:', time2, 'ms');\n  console.log('提升:', (time1 / time2).toFixed(2), 'x');\n}\n\n// 典型结果：\n// ArrayBuffer: 15ms\n// SharedArrayBuffer: 0.1ms\n// 提升: 150x\n\n// 使用场景：\n// - 大数据传输\n// - 频繁通信\n// - 实时处理"
      },
      "source": "性能"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["内存管理"],
      "question": "检查是否支持SharedArrayBuffer，空白处填什么？",
      "code": "if (typeof ______ !== 'undefined') {\n  console.log('支持共享内存');\n}",
      "options": [
        "SharedArrayBuffer",
        "SharedBuffer",
        "ArrayBuffer.shared",
        "window.SharedArrayBuffer"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "特性检测",
        "code": "// 特性检测\nif (typeof SharedArrayBuffer !== 'undefined') {\n  console.log('支持SharedArrayBuffer');\n} else {\n  console.log('不支持或已禁用');\n  // 降级方案\n}\n\n// 完整检测\nfunction checkSupport() {\n  // 1. 检查SharedArrayBuffer\n  if (typeof SharedArrayBuffer === 'undefined') {\n    return { supported: false, reason: 'SharedArrayBuffer不存在' };\n  }\n  \n  // 2. 检查Atomics\n  if (typeof Atomics === 'undefined') {\n    return { supported: false, reason: 'Atomics不存在' };\n  }\n  \n  // 3. 尝试创建\n  try {\n    new SharedArrayBuffer(1);\n    return { supported: true };\n  } catch (e) {\n    return { supported: false, reason: e.message };\n  }\n}\n\nconst result = checkSupport();\nif (result.supported) {\n  // 使用SharedArrayBuffer\n} else {\n  console.warn('不支持:', result.reason);\n  // 使用替代方案\n}\n\n// Polyfill/Fallback\nif (typeof SharedArrayBuffer === 'undefined') {\n  // 使用普通ArrayBuffer\n  window.SharedArrayBuffer = ArrayBuffer;\n  console.warn('使用ArrayBuffer作为fallback');\n}"
      },
      "source": "特性检测"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "SharedArrayBuffer使用最佳实践？",
      "options": [
        "使用Atomics保证原子性",
        "避免竞态条件",
        "设置正确的HTTP头",
        "直接修改共享内存",
        "合理设计数据结构",
        "忽略字节对齐"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "SharedArrayBuffer最佳实践",
        "code": "// 1. 使用Atomics\n// ❌ 不安全\nsharedView[0]++;\n\n// ✅ 原子操作\nAtomics.add(sharedView, 0, 1);\n\n// 2. 避免竞态\n// 使用锁或同步原语\nfunction withLock(view, index, fn) {\n  while (Atomics.compareExchange(view, index, 0, 1) !== 0) {\n    // 等待锁\n  }\n  \n  try {\n    fn();\n  } finally {\n    Atomics.store(view, index, 0);  // 释放锁\n  }\n}\n\n// 3. 设置HTTP头\n// 确保浏览器启用SharedArrayBuffer\n\n// 4. 合理设计数据结构\nclass SharedQueue {\n  constructor(capacity) {\n    const size = (capacity + 2) * 4;  // head, tail, ...items\n    this.sab = new SharedArrayBuffer(size);\n    this.view = new Int32Array(this.sab);\n    this.capacity = capacity;\n  }\n  \n  enqueue(value) {\n    const tail = Atomics.load(this.view, 1);\n    Atomics.store(this.view, tail + 2, value);\n    Atomics.store(this.view, 1, (tail + 1) % this.capacity);\n  }\n  \n  dequeue() {\n    const head = Atomics.load(this.view, 0);\n    const value = Atomics.load(this.view, head + 2);\n    Atomics.store(this.view, 0, (head + 1) % this.capacity);\n    return value;\n  }\n}\n\n// 5. 错误处理\ntry {\n  const sab = new SharedArrayBuffer(1024);\n} catch (e) {\n  // 处理不支持的情况\n  console.error('SharedArrayBuffer不可用');\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "模块化对比",
      "url": "24-03-module-comparison.html"
    },
    "next": {
      "title": "Atomics操作",
      "url": "25-02-atomics.html"
    }
  }
};
