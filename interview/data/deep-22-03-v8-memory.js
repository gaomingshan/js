/**
 * V8内存管理
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2203V8Memory = {
  "config": {
    "title": "V8内存管理",
    "icon": "💾",
    "description": "深入理解V8的内存分配和垃圾回收机制",
    "primaryColor": "#06b6d4",
    "bgGradient": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["堆结构"],
      "question": "V8将堆分为哪两个主要部分？",
      "options": [
        "新生代和老生代",
        "栈和堆",
        "大对象和小对象",
        "代码区和数据区"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "V8堆结构",
        "code": "// V8堆结构：\n\n/*\nV8 Heap\n├── 新生代（Young Generation）\n│   ├── From空间（Survivor From）\n│   └── To空间（Survivor To）\n├── 老生代（Old Generation）\n│   ├── 老生代指针区（Old Pointer Space）\n│   └── 老生代数据区（Old Data Space）\n├── 大对象区（Large Object Space）\n├── 代码区（Code Space）\n└── Map区（Map Space）\n*/\n\n// 新生代（1-8MB）\n// - 存放生命周期短的对象\n// - 使用Scavenge算法（快速）\n// - 空间小，回收频繁\n\n// 老生代（数百MB）\n// - 存放生命周期长的对象\n// - 使用Mark-Sweep/Mark-Compact\n// - 空间大，回收慢\n\n// 对象分配：\nconst temp = { x: 1 };  // 新生代\nprocess(temp);\n// temp很快被回收\n\nconst global = window.data = { y: 2 };  // 晋升到老生代\n// 一直存在\n\n// 晋升条件：\n// 1. 对象经历过一次Scavenge\n// 2. To空间使用超过25%\n\n// 查看内存使用（Node.js）：\nconst used = process.memoryUsage();\nconsole.log('堆总量:', used.heapTotal / 1024 / 1024, 'MB');\nconsole.log('堆使用:', used.heapUsed / 1024 / 1024, 'MB');\nconsole.log('外部内存:', used.external / 1024 / 1024, 'MB');"
      },
      "source": "堆结构"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Scavenge"],
      "question": "Scavenge算法的执行过程？",
      "code": "// 新生代空间：8MB\n// From: [obj1, obj2, obj3, obj4]\n// To: []\n\n// obj1、obj3被引用\n// obj2、obj4没有引用\n\n// 执行Scavenge后：\n// From: ?\n// To: ?",
      "options": [
        "From: [], To: [obj1, obj3]",
        "From: [obj1, obj3], To: []",
        "From: [obj2, obj4], To: [obj1, obj3]",
        "From: [obj1, obj3], To: [obj2, obj4]"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Scavenge算法",
        "code": "// Scavenge（复制算法）：\n\n// 初始状态：\n// From空间：[obj1, obj2, obj3, obj4]\n// To空间：[]\n\n// 执行Scavenge：\n// 1. 扫描From空间\n// 2. 将存活对象复制到To空间\n// 3. 清空From空间\n// 4. 交换From和To\n\n// 步骤1：复制存活对象\n// From: [obj1, obj2, obj3, obj4]\n// To: [obj1, obj3]  ← 复制存活对象\n\n// 步骤2：清空From\n// From: []\n// To: [obj1, obj3]\n\n// 步骤3：交换\n// From: [obj1, obj3]\n// To: []\n\n// Scavenge特点：\n// 1. 快速（线性时间）\n// 2. 空间换时间（需要两倍空间）\n// 3. 适合小空间\n// 4. 频繁执行\n\n// 对象晋升：\nfunction createObjects() {\n  const obj = { data: new Array(1000) };\n  \n  // 第一次Scavenge：obj在From\n  // 第二次Scavenge：obj存活，晋升到老生代\n  \n  return obj;\n}\n\nconst persistent = createObjects();\n// persistent不会被回收，最终晋升到老生代\n\n// 查看GC日志（Node.js）：\n// node --trace-gc script.js\n// 输出：\n// [12345] Scavenge 2.3 (3.0) -> 1.8 (4.0) MB, 0.5ms"
      },
      "source": "Scavenge"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["标记清除"],
      "question": "标记-清除算法包括哪些阶段？",
      "options": [
        "标记阶段",
        "清除阶段",
        "压缩阶段",
        "复制阶段",
        "增量标记",
        "并发清除"
      ],
      "correctAnswer": ["A", "B", "E", "F"],
      "explanation": {
        "title": "标记-清除算法",
        "code": "// 老生代使用标记-清除（Mark-Sweep）\n\n// 1. 标记阶段（Marking）\n/*\n从GC Roots开始：\n- 全局对象\n- 活动栈帧\n- CPU寄存器\n\n标记所有可达对象\n*/\n\nfunction marking() {\n  // 深度优先遍历\n  function mark(obj) {\n    if (obj.marked) return;\n    obj.marked = true;\n    \n    for (let ref of obj.references) {\n      mark(ref);\n    }\n  }\n  \n  // 从roots开始\n  roots.forEach(mark);\n}\n\n// 2. 清除阶段（Sweeping）\nfunction sweeping() {\n  for (let obj of heap) {\n    if (!obj.marked) {\n      free(obj);  // 回收未标记对象\n    } else {\n      obj.marked = false;  // 重置标记\n    }\n  }\n}\n\n// 3. 增量标记（Incremental Marking）\n// 分多次标记，减少停顿\n/*\nJavaScript执行\n  ↓\n标记一部分\n  ↓\nJavaScript执行\n  ↓\n标记一部分\n  ↓\n...\n*/\n\n// 4. 并发清除（Concurrent Sweeping）\n// 在后台线程清除\nfunction concurrentSweep() {\n  // 主线程继续执行JavaScript\n  // 后台线程清除垃圾\n}\n\n// 5. 压缩阶段（Compaction）\n// 标记-压缩（Mark-Compact）\nfunction compact() {\n  // 移动存活对象到一起\n  // 消除内存碎片\n  \n  /*\n  Before: [obj1][][obj2][][][obj3][]\n  After:  [obj1][obj2][obj3][        ]\n  */\n}\n\n// V8的策略：\n// - 通常使用Mark-Sweep\n// - 内存碎片严重时使用Mark-Compact\n// - 使用增量标记减少停顿\n// - 使用并发清除提高性能"
      },
      "source": "标记清除"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["写屏障"],
      "question": "写屏障用于追踪增量标记期间的对象引用变化",
      "correctAnswer": "A",
      "explanation": {
        "title": "写屏障（Write Barrier）",
        "code": "// 写屏障：在增量标记期间追踪对象修改\n\n// 问题场景：\n/*\n增量标记：\n1. 标记obj1（黑色）\n2. JavaScript执行\n3. obj1.ref = newObj（黑→白引用）\n4. 继续标记\n5. newObj未被标记，但应该存活！\n*/\n\n// 三色标记：\n// - 白色：未标记（待回收）\n// - 灰色：已标记但未扫描子对象\n// - 黑色：已标记且已扫描\n\n// 写屏障示例：\nfunction writeBarrier(obj, field, value) {\n  // 检查是否在标记期间\n  if (marking && obj.color === 'black' && value.color === 'white') {\n    // 记录这个引用\n    markingWorkList.push(value);\n  }\n  \n  // 执行赋值\n  obj[field] = value;\n}\n\n// V8的实现：\nclass V8Object {\n  set(field, value) {\n    // 写屏障\n    if (V8.isMarking()) {\n      V8.recordWrite(this, field, value);\n    }\n    \n    this[field] = value;\n  }\n}\n\n// 开销：\n// - 每次对象写入都要检查\n// - 增量标记期间性能影响\n\n// 优化：\n// 1. 只在标记期间启用\n// 2. 批量处理记录\n// 3. 使用卡表（Card Table）\n\n// 卡表：将堆分成小块\nconst CARD_SIZE = 512;  // 字节\nconst cardTable = new Uint8Array(heapSize / CARD_SIZE);\n\nfunction recordWrite(obj) {\n  const card = getCardIndex(obj);\n  cardTable[card] = 1;  // 标记脏卡\n}\n\n// GC时只扫描脏卡"
      },
      "source": "写屏障"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["对象分配"],
      "question": "对象分配到哪个空间，空白处填什么？",
      "code": "// 大对象（>128KB）分配到______\nconst largeArray = new Array(100000);\n\n// 小对象分配到______\nconst smallObj = { x: 1 };",
      "options": [
        "大对象空间, 新生代",
        "老生代, 新生代",
        "新生代, 老生代",
        "堆, 栈"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "V8对象分配策略",
        "code": "// V8对象分配规则：\n\n// 1. 小对象（<128KB）→ 新生代\nconst small = { x: 1 };\nconst arr = new Array(1000);  // < 128KB\n// 分配到新生代（From空间）\n\n// 2. 大对象（>128KB）→ 大对象空间\nconst large = new Array(1000000);  // > 128KB\nconst buffer = new ArrayBuffer(200 * 1024);  // 200KB\n// 直接分配到大对象空间\n// 不经过新生代，不会被Scavenge\n\n// 3. 代码对象 → 代码空间\nfunction code() {\n  // 函数对象\n}\n// 编译后的代码分配到代码空间\n\n// 4. Map对象 → Map空间\nclass Point {\n  constructor(x, y) {\n    this.x = x;\n    this.y = y;\n  }\n}\n// 隐藏类（Map）存储在Map空间\n\n// 分配流程：\nfunction allocate(size) {\n  if (size > LARGE_OBJECT_THRESHOLD) {\n    return allocateLargeObject(size);\n  }\n  \n  if (newGeneration.freeSpace < size) {\n    scavenge();  // 触发新生代GC\n  }\n  \n  return allocateInNewGen(size);\n}\n\n// 优化建议：\n// 1. 避免频繁创建大对象\nconst pool = [];  // 对象池\n\nfunction getLargeBuffer() {\n  return pool.pop() || new ArrayBuffer(200 * 1024);\n}\n\nfunction releaseLargeBuffer(buf) {\n  pool.push(buf);\n}\n\n// 2. 复用对象\nconst reusable = { x: 0, y: 0 };\n\nfunction process(x, y) {\n  reusable.x = x;\n  reusable.y = y;\n  return compute(reusable);\n}\n\n// 3. 使用TypedArray\nconst ints = new Int32Array(1000);  // 固定大小\n// vs\nconst arr = new Array(1000);  // 可能重新分配"
      },
      "source": "对象分配"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["内存限制"],
      "question": "V8默认堆大小限制？",
      "code": "// 64位系统默认老生代大小？",
      "options": [
        "约1.4GB",
        "约4GB",
        "无限制",
        "约512MB"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "V8内存限制",
        "code": "// V8默认堆限制：\n\n// 64位系统：\n// - 老生代：~1.4GB\n// - 新生代：~32MB\n// - 总计：~1.4GB\n\n// 32位系统：\n// - 老生代：~700MB\n// - 新生代：~16MB\n\n// 为什么限制？\n// 1. GC停顿时间（1GB堆可能停顿50ms+）\n// 2. 浏览器环境内存限制\n// 3. 历史原因\n\n// 修改限制（Node.js）：\n// node --max-old-space-size=4096 script.js  // 4GB\n// node --max-new-space-size=64 script.js    // 64MB新生代\n\n// 查看当前限制：\nif (typeof v8 !== 'undefined') {\n  const stats = v8.getHeapStatistics();\n  console.log('堆限制:', stats.heap_size_limit / 1024 / 1024, 'MB');\n  console.log('堆总量:', stats.total_heap_size / 1024 / 1024, 'MB');\n  console.log('已用堆:', stats.used_heap_size / 1024 / 1024, 'MB');\n}\n\n// 超出限制：\ntry {\n  const huge = new Array(1e9);  // 尝试分配超大数组\n} catch (e) {\n  console.log(e);  // RangeError: Invalid array length\n  // 或 JavaScript heap out of memory\n}\n\n// 监控内存使用：\nfunction checkMemory() {\n  const usage = process.memoryUsage();\n  const limit = 1.4 * 1024 * 1024 * 1024;  // 1.4GB\n  \n  if (usage.heapUsed / limit > 0.9) {\n    console.warn('内存使用接近限制！');\n    // 触发清理或其他措施\n  }\n}\n\nsetInterval(checkMemory, 60000);  // 每分钟检查\n\n// 增加内存的代价：\n// - GC停顿时间更长\n// - 启动时间增加\n// - 可能影响系统其他程序"
      },
      "source": "内存限制"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["GC优化"],
      "question": "V8的GC优化技术？",
      "options": [
        "增量标记",
        "并发标记",
        "并行清除",
        "手动GC",
        "懒扫描",
        "分代收集"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "V8 GC优化技术",
        "code": "// 1. 分代收集（Generational GC）\n// - 新生代：频繁、快速\n// - 老生代：不频繁、慢速\n\n// 2. 增量标记（Incremental Marking）\n// 将标记过程分成多个小步骤\nfunction incrementalMark() {\n  while (hasWorkToDo()) {\n    markSomeObjects();  // 标记一部分\n    yield;  // 让出控制权给JavaScript\n  }\n}\n\n// 3. 并发标记（Concurrent Marking）\n// 在后台线程标记\nfunction concurrentMark() {\n  // 主线程继续执行JavaScript\n  // 后台线程并发标记对象\n  \n  startBackgroundThread(() => {\n    markAllObjects();\n  });\n}\n\n// 4. 并行GC（Parallel GC）\n// 多线程协作GC\nfunction parallelGC() {\n  const threads = getWorkerThreads();\n  \n  // 分配工作给多个线程\n  threads.forEach(thread => {\n    thread.assignWork(heap.slice(...));\n  });\n  \n  // 等待所有线程完成\n  threads.forEach(thread => thread.wait());\n}\n\n// 5. 懒扫描（Lazy Sweeping）\n// 按需清除，不一次性清除所有垃圾\nfunction lazySweep() {\n  // 只清除需要分配的页\n  while (needMoreSpace()) {\n    sweepOnePage();\n  }\n}\n\n// 6. 空闲时GC（Idle-time GC）\n// 利用浏览器空闲时间GC\nif (isIdle()) {\n  performGC();\n}\n\n// GC停顿时间演进：\n/*\n传统GC（Stop-the-world）：\n  JavaScript [停顿100ms] JavaScript\n\n增量GC：\n  JavaScript [5ms] JavaScript [5ms] JavaScript\n\n并发GC：\n  JavaScript\n  Background: [标记中...]\n  JavaScript [短暂停顿]\n*/\n\n// V8 GC触发时机：\n// 1. 新生代满了 → Scavenge\n// 2. 老生代空间不足 → Major GC\n// 3. 显式调用（不推荐）\nif (global.gc) {\n  global.gc();  // 需要--expose-gc\n}\n\n// 4. 空闲时间\nrequestIdleCallback(() => {\n  // V8可能在此时GC\n});"
      },
      "source": "GC优化"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["压缩"],
      "question": "标记-压缩算法可以消除内存碎片",
      "correctAnswer": "A",
      "explanation": {
        "title": "标记-压缩算法",
        "code": "// 标记-压缩（Mark-Compact）\n\n// 内存碎片问题：\n/*\n标记-清除后：\n[obj1] [空] [obj2] [空] [空] [obj3] [空]\n       ↑          ↑              ↑\n     碎片        碎片           碎片\n\n无法分配大对象！\n*/\n\n// 压缩过程：\nfunction compact() {\n  // 1. 计算新地址\n  let newAddress = heapStart;\n  for (let obj of liveObjects) {\n    obj.forwardingAddress = newAddress;\n    newAddress += obj.size;\n  }\n  \n  // 2. 更新引用\n  for (let obj of liveObjects) {\n    for (let ref of obj.references) {\n      ref.address = ref.forwardingAddress;\n    }\n  }\n  \n  // 3. 移动对象\n  for (let obj of liveObjects) {\n    memcpy(obj.forwardingAddress, obj.address, obj.size);\n  }\n}\n\n// 压缩后：\n/*\n[obj1][obj2][obj3][             空闲空间            ]\n                  ↑\n           连续的空闲空间\n*/\n\n// V8的策略：\n// - 通常使用Mark-Sweep（快）\n// - 碎片严重时使用Mark-Compact（慢但整理内存）\n\nfunction shouldCompact() {\n  const fragmentation = calculateFragmentation();\n  \n  if (fragmentation > THRESHOLD) {\n    return true;  // 使用Mark-Compact\n  }\n  \n  return false;  // 使用Mark-Sweep\n}\n\n// 碎片率计算：\nfunction calculateFragmentation() {\n  const totalFree = getTotalFreeSpace();\n  const largestFree = getLargestFreeBlock();\n  \n  return 1 - (largestFree / totalFree);\n  // 接近1：高度碎片化\n  // 接近0：连续空间\n}"
      },
      "source": "压缩"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["性能分析"],
      "question": "分析GC性能，空白处填什么？",
      "code": "// Node.js查看GC日志\nnode ______ script.js",
      "options": [
        "--trace-gc",
        "--gc-log",
        "--show-gc",
        "--verbose-gc"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "GC性能分析",
        "code": "// 1. 查看GC日志\n// node --trace-gc script.js\n/*\n输出示例：\n[12345] Scavenge 2.3 (3.0) -> 1.8 (4.0) MB, 0.5ms\n[12356] Mark-sweep 15.3 (18.0) -> 12.1 (16.0) MB, 12.3ms\n\n格式：\n[时间] GC类型 之前(总) -> 之后(总) MB, 耗时\n*/\n\n// 2. 详细GC日志\n// node --trace-gc --trace-gc-verbose script.js\n\n// 3. GC统计\n// node --trace-gc-nvp script.js\n/*\npause=0.5\nmu=0.8\nstepped=0\n*/\n\n// 4. Chrome DevTools\n// Performance面板 → Memory\n// 可视化GC事件\n\n// 5. 代码中监控\nconst v8 = require('v8');\n\nfunction analyzeGC() {\n  const stats = v8.getHeapStatistics();\n  \n  console.log('堆统计:');\n  console.log('  总堆:', stats.total_heap_size / 1024 / 1024, 'MB');\n  console.log('  可用堆:', stats.total_available_size / 1024 / 1024, 'MB');\n  console.log('  已用堆:', stats.used_heap_size / 1024 / 1024, 'MB');\n  console.log('  堆限制:', stats.heap_size_limit / 1024 / 1024, 'MB');\n  console.log('  物理内存:', stats.total_physical_size / 1024 / 1024, 'MB');\n}\n\n// 6. 堆快照\nconst snapshot = v8.writeHeapSnapshot();\nconsole.log('快照保存到:', snapshot);\n// 用Chrome DevTools分析\n\n// 7. GC事件监听\nconst { performance, PerformanceObserver } = require('perf_hooks');\n\nconst obs = new PerformanceObserver((list) => {\n  const entries = list.getEntries();\n  entries.forEach((entry) => {\n    if (entry.entryType === 'gc') {\n      console.log('GC:', entry.kind, entry.duration, 'ms');\n    }\n  });\n});\n\nobs.observe({ entryTypes: ['gc'] });\n\n// 8. 内存泄漏检测\nconst before = process.memoryUsage().heapUsed;\n\n// 执行操作\nfor (let i = 0; i < 1000; i++) {\n  createAndDestroy();\n}\n\nif (global.gc) global.gc();\n\nconst after = process.memoryUsage().heapUsed;\nconst growth = (after - before) / 1024 / 1024;\n\nif (growth > 10) {  // 增长超过10MB\n  console.warn('可能存在内存泄漏:', growth, 'MB');\n}"
      },
      "source": "性能分析"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "减少GC压力的最佳实践？",
      "options": [
        "对象池复用",
        "避免频繁创建临时对象",
        "及时释放大对象",
        "手动调用gc()",
        "使用WeakMap",
        "增大堆大小"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "减少GC压力",
        "code": "// 1. 对象池\nclass ObjectPool {\n  constructor(create, reset) {\n    this.pool = [];\n    this.create = create;\n    this.reset = reset;\n  }\n  \n  acquire() {\n    return this.pool.pop() || this.create();\n  }\n  \n  release(obj) {\n    this.reset(obj);\n    this.pool.push(obj);\n  }\n}\n\nconst pointPool = new ObjectPool(\n  () => ({ x: 0, y: 0 }),\n  (p) => { p.x = 0; p.y = 0; }\n);\n\n// 2. 避免临时对象\n// ❌\nfor (let i = 0; i < 1000; i++) {\n  const temp = { x: i, y: i + 1 };\n  process(temp);\n}\n\n// ✅\nconst reusable = { x: 0, y: 0 };\nfor (let i = 0; i < 1000; i++) {\n  reusable.x = i;\n  reusable.y = i + 1;\n  process(reusable);\n}\n\n// 3. 及时释放\nlet bigData = fetchLargeData();\nprocess(bigData);\nbigData = null;  // 帮助GC\n\n// 4. WeakMap（自动清理）\nconst cache = new WeakMap();\n\nfunction cacheFor(obj, data) {\n  cache.set(obj, data);\n  // obj被回收时，cache条目自动清除\n}\n\n// 5. 分批处理\nasync function processLarge(data) {\n  const chunkSize = 1000;\n  \n  for (let i = 0; i < data.length; i += chunkSize) {\n    const chunk = data.slice(i, i + chunkSize);\n    await processChunk(chunk);\n    \n    // 给GC机会\n    await new Promise(r => setTimeout(r, 0));\n  }\n}\n\n// 6. TypedArray\n// ✅ 固定大小，减少重分配\nconst buffer = new Float64Array(1000);\n\n// ❌ 可能多次重分配\nconst arr = [];\nfor (let i = 0; i < 1000; i++) {\n  arr.push(i);  // 可能触发扩容\n}\n\n// 7. 避免闭包陷阱\nfunction createHandlers() {\n  const bigData = new Array(1000000);\n  \n  return {\n    // ❌ 闭包保留bigData\n    handle: function() {\n      console.log(bigData.length);\n    }\n  };\n}\n\n// ✅ 只保留需要的\nfunction createHandlers2() {\n  const bigData = new Array(1000000);\n  const length = bigData.length;\n  \n  return {\n    handle: function() {\n      console.log(length);  // bigData可被回收\n    }\n  };\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "JIT编译优化",
      "url": "22-02-jit-optimization.html"
    },
    "next": {
      "title": "ES6+新特性",
      "url": "23-01-es6-features.html"
    }
  }
};
