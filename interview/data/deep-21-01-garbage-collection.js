/**
 * 垃圾回收机制
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2101GarbageCollection = {
  "config": {
    "title": "垃圾回收机制",
    "icon": "🗑️",
    "description": "深入理解JavaScript的垃圾回收算法和内存管理",
    "primaryColor": "#10b981",
    "bgGradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["GC算法"],
      "question": "现代JavaScript引擎主要使用什么垃圾回收算法？",
      "options": [
        "标记-清除（Mark-Sweep）",
        "引用计数（Reference Counting）",
        "复制算法（Copying）",
        "手动管理"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "标记-清除算法",
        "code": "// 标记-清除（Mark-Sweep）\n// 1. 标记阶段：从根对象开始标记所有可达对象\n// 2. 清除阶段：清除所有未标记的对象\n\n// 根对象（GC Roots）：\n// - 全局对象\n// - 当前执行栈\n// - 活动闭包\n\nlet obj1 = { name: 'A' };\nlet obj2 = { name: 'B' };\n\nobj1.ref = obj2;  // obj1引用obj2\nobj2.ref = obj1;  // 循环引用\n\nobj1 = null;\nobj2 = null;\n\n// 标记-清除可以处理循环引用\n// 从根开始无法到达，会被回收\n\n// 引用计数的问题：\nlet a = { name: 'A' };  // count: 1\nlet b = { name: 'B' };  // count: 1\n\na.ref = b;  // b count: 2\nb.ref = a;  // a count: 2\n\na = null;  // a count: 1（无法回收）\nb = null;  // b count: 1（无法回收）\n// 循环引用导致内存泄漏"
      },
      "source": "GC算法"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["闭包内存"],
      "question": "以下代码的内存泄漏情况？",
      "code": "function createClosure() {\n  const largeData = new Array(1000000);\n  \n  return function() {\n    console.log(largeData.length);\n  };\n}\n\nconst closure = createClosure();\n// largeData会被回收吗？",
      "options": [
        "不会被回收，因为闭包引用了它",
        "会被回收，因为closure没有使用",
        "立即被回收",
        "取决于浏览器"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "闭包导致的内存保留",
        "code": "function createClosure() {\n  const largeData = new Array(1000000);  // 大数组\n  \n  return function() {\n    console.log(largeData.length);  // 引用largeData\n  };\n}\n\nconst closure = createClosure();\n// largeData不会被回收，因为closure引用它\n\n// 解决方案1：及时释放\nclosure = null;  // 释放闭包，largeData可被回收\n\n// 解决方案2：只保留需要的数据\nfunction createClosure2() {\n  const largeData = new Array(1000000);\n  const length = largeData.length;  // 只保留length\n  \n  return function() {\n    console.log(length);  // largeData可以被回收\n  };\n}\n\n// V8优化：只保留被引用的变量\nfunction createClosure3() {\n  const used = 1;\n  const unused = new Array(1000000);\n  \n  return function() {\n    console.log(used);  // unused可能被回收\n  };\n}"
      },
      "source": "闭包内存"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["内存泄漏"],
      "question": "常见的内存泄漏场景？",
      "options": [
        "全局变量",
        "未清理的定时器",
        "DOM引用",
        "闭包",
        "循环引用",
        "使用let声明"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "内存泄漏场景",
        "code": "// 1. 意外的全局变量\nfunction leak1() {\n  undeclared = 'global';  // 成为全局变量\n}\n\n// 2. 未清理的定时器\nfunction leak2() {\n  const data = new Array(1000000);\n  \n  setInterval(() => {\n    console.log(data.length);  // data无法被回收\n  }, 1000);\n  \n  // 解决：clearInterval\n}\n\n// 3. DOM引用\nconst elements = [];\nfunction leak3() {\n  const div = document.getElementById('div');\n  elements.push(div);  // 保存DOM引用\n  \n  // 即使从DOM中移除，元素仍被引用\n  div.remove();\n}\n\n// 4. 闭包\nfunction leak4() {\n  const bigData = new Array(1000000);\n  \n  return function() {\n    return bigData.length;\n  };\n}\n\n// 5. 事件监听器\nfunction leak5() {\n  const element = document.getElementById('btn');\n  element.addEventListener('click', function() {\n    // 监听器没有移除\n  });\n  \n  // 解决：removeEventListener\n}"
      },
      "source": "内存泄漏"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["WeakMap"],
      "question": "WeakMap的键可以被垃圾回收",
      "correctAnswer": "A",
      "explanation": {
        "title": "WeakMap弱引用",
        "code": "// WeakMap的键是弱引用\nlet key = { id: 1 };\nconst map = new WeakMap();\n\nmap.set(key, 'value');\n\n// key可以被垃圾回收\nkey = null;  // key对象可以被回收，WeakMap中的条目也会消失\n\n// 普通Map是强引用\nconst strongMap = new Map();\nstrongMap.set(key, 'value');\nkey = null;  // key对象不会被回收\n\n// WeakMap应用：存储私有数据\nconst privateData = new WeakMap();\n\nclass User {\n  constructor(name) {\n    privateData.set(this, { name });  // 不阻止this被回收\n  }\n  \n  getName() {\n    return privateData.get(this).name;\n  }\n}\n\n// WeakSet同理\nconst weakSet = new WeakSet();\nlet obj = {};\nweakSet.add(obj);\nobj = null;  // obj可以被回收"
      },
      "source": "WeakMap"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["内存优化"],
      "question": "优化内存使用，空白处填什么？",
      "code": "class ImageCache {\n  constructor() {\n    this.cache = ______;  // 避免内存泄漏\n  }\n  \n  set(key, value) {\n    this.cache.set(key, value);\n  }\n  \n  get(key) {\n    return this.cache.get(key);\n  }\n}",
      "options": [
        "new WeakMap()",
        "new Map()",
        "{}",
        "new Set()"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "使用WeakMap优化缓存",
        "code": "// ✅ 使用WeakMap\nclass ImageCache {\n  constructor() {\n    this.cache = new WeakMap();  // 键可以被回收\n  }\n  \n  set(key, value) {\n    this.cache.set(key, value);\n  }\n  \n  get(key) {\n    return this.cache.get(key);\n  }\n}\n\n// 使用\nlet img = new Image();\ncache.set(img, 'data');\n\nimg = null;  // img可以被回收，缓存自动清理\n\n// ❌ 使用Map会导致泄漏\nclass BadCache {\n  constructor() {\n    this.cache = new Map();  // 强引用\n  }\n}\n\nlet img2 = new Image();\nbadCache.set(img2, 'data');\nimg2 = null;  // img2不会被回收！\n\n// LRU缓存实现\nclass LRUCache {\n  constructor(limit) {\n    this.limit = limit;\n    this.cache = new Map();\n  }\n  \n  set(key, value) {\n    if (this.cache.has(key)) {\n      this.cache.delete(key);\n    }\n    this.cache.set(key, value);\n    \n    // 超过限制，删除最旧的\n    if (this.cache.size > this.limit) {\n      const firstKey = this.cache.keys().next().value;\n      this.cache.delete(firstKey);\n    }\n  }\n}"
      },
      "source": "内存优化"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["分代回收"],
      "question": "V8的分代回收策略？",
      "code": "// 哪种对象更可能被频繁回收？\nconst temp = {};        // A\nconst global = window.data = {};  // B",
      "options": [
        "A（临时对象更频繁）",
        "B（全局对象更频繁）",
        "一样频繁",
        "都不会被回收"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "分代回收策略",
        "code": "// V8使用分代回收：\n// 1. 新生代（Young Generation）\n//    - 存活时间短的对象\n//    - 使用Scavenge算法\n//    - 频繁回收（快）\n\n// 2. 老生代（Old Generation）\n//    - 存活时间长的对象\n//    - 使用标记-清除/标记-整理\n//    - 不频繁回收（慢）\n\nfunction demo() {\n  // 临时对象 → 新生代\n  const temp = { data: [] };\n  process(temp);\n  // temp很快被回收\n}\n\n// 全局对象 → 老生代\nwindow.data = { global: true };\n// 一直存在，不会被回收\n\n// 晋升条件：\n// 1. 对象经过两次Scavenge仍存活\n// 2. To空间使用超过25%\n\n// 优化建议：\n// - 避免创建大量临时对象\n// - 复用对象\n// - 对象池模式\nconst objectPool = [];\n\nfunction getObject() {\n  return objectPool.pop() || {};\n}\n\nfunction releaseObject(obj) {\n  Object.keys(obj).forEach(key => delete obj[key]);\n  objectPool.push(obj);\n}"
      },
      "source": "分代回收"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["GC优化"],
      "question": "如何减少GC压力？",
      "options": [
        "减少对象创建",
        "使用对象池",
        "及时解除引用",
        "避免全局变量",
        "增加内存",
        "使用WeakMap/WeakSet"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "GC优化策略",
        "code": "// 1. 减少对象创建\n// ❌ 频繁创建\nfor (let i = 0; i < 1000; i++) {\n  const obj = { x: i };  // 1000个对象\n  process(obj);\n}\n\n// ✅ 复用对象\nconst obj = { x: 0 };\nfor (let i = 0; i < 1000; i++) {\n  obj.x = i;\n  process(obj);\n}\n\n// 2. 对象池\nclass ObjectPool {\n  constructor(create, reset) {\n    this.pool = [];\n    this.create = create;\n    this.reset = reset;\n  }\n  \n  acquire() {\n    return this.pool.pop() || this.create();\n  }\n  \n  release(obj) {\n    this.reset(obj);\n    this.pool.push(obj);\n  }\n}\n\nconst pool = new ObjectPool(\n  () => ({ x: 0, y: 0 }),\n  (obj) => { obj.x = 0; obj.y = 0; }\n);\n\n// 3. 及时解除引用\nlet data = fetchData();\nprocess(data);\ndata = null;  // 帮助GC\n\n// 4. 避免全局变量\n// ❌\nwindow.cache = [];\n\n// ✅ 使用模块作用域\nlet cache = [];\n\n// 5. WeakMap缓存\nconst cache = new WeakMap();\n\nfunction memoize(fn) {\n  return function(obj) {\n    if (cache.has(obj)) {\n      return cache.get(obj);\n    }\n    const result = fn(obj);\n    cache.set(obj, result);\n    return result;\n  };\n}"
      },
      "source": "GC优化"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["增量GC"],
      "question": "V8使用增量标记来减少GC停顿时间",
      "correctAnswer": "A",
      "explanation": {
        "title": "增量标记",
        "code": "// 增量标记（Incremental Marking）\n// 将标记过程分解成多个小步骤\n// 与JavaScript执行交替进行\n\n// 传统标记（Stop-The-World）：\n// JavaScript执行 → [停止] 完整标记 [恢复] → JavaScript执行\n// 停顿时间长\n\n// 增量标记：\n// JavaScript → 标记一部分 → JavaScript → 标记一部分 → ...\n// 减少单次停顿时间\n\n// V8的三色标记：\n// - 白色：未标记（待回收）\n// - 灰色：已标记但未扫描子对象\n// - 黑色：已标记且已扫描\n\n// 写屏障（Write Barrier）\n// 在增量标记期间，如果修改了对象引用\n// 需要重新标记，避免漏标\n\n// 并发标记（Concurrent Marking）\n// 在后台线程进行标记\n// 进一步减少主线程停顿\n\n// 懒扫描（Lazy Sweeping）\n// 分批清除未标记对象\n// 按需分配时清除"
      },
      "source": "增量GC"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["性能监控"],
      "question": "监控内存使用，空白处填什么？",
      "code": "function checkMemory() {\n  if (performance.memory) {\n    const used = ______.usedJSHeapSize;\n    const total = performance.memory.totalJSHeapSize;\n    console.log(`内存使用: ${(used / total * 100).toFixed(2)}%`);\n  }\n}",
      "options": [
        "performance.memory",
        "window.memory",
        "process.memoryUsage()",
        "navigator.memory"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "内存监控",
        "code": "// 浏览器内存监控\nfunction checkMemory() {\n  if (performance.memory) {\n    const memory = performance.memory;\n    \n    console.log('JS堆大小限制:', memory.jsHeapSizeLimit);\n    console.log('已分配堆大小:', memory.totalJSHeapSize);\n    console.log('实际使用堆大小:', memory.usedJSHeapSize);\n    \n    const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;\n    if (usage > 0.9) {\n      console.warn('内存使用率过高');\n    }\n  }\n}\n\n// Node.js内存监控\nif (typeof process !== 'undefined') {\n  const usage = process.memoryUsage();\n  console.log('堆使用:', usage.heapUsed);\n  console.log('堆总量:', usage.heapTotal);\n  console.log('外部内存:', usage.external);\n}\n\n// 监控内存泄漏\nlet baseline;\n\nfunction detectLeak() {\n  if (!baseline) {\n    baseline = performance.memory.usedJSHeapSize;\n    return;\n  }\n  \n  const current = performance.memory.usedJSHeapSize;\n  const growth = current - baseline;\n  \n  if (growth > 10 * 1024 * 1024) {  // 增长超过10MB\n    console.warn('可能存在内存泄漏');\n  }\n}"
      },
      "source": "性能监控"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "内存管理的最佳实践？",
      "options": [
        "及时清理定时器和监听器",
        "避免意外的全局变量",
        "使用WeakMap存储对象数据",
        "手动调用gc()",
        "限制缓存大小",
        "分批处理大数据"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "内存管理最佳实践",
        "code": "// 1. 清理资源\nclass Component {\n  constructor() {\n    this.timer = setInterval(() => {}, 1000);\n    this.handler = () => {};\n    element.addEventListener('click', this.handler);\n  }\n  \n  destroy() {\n    clearInterval(this.timer);  // ✅ 清理定时器\n    element.removeEventListener('click', this.handler);  // ✅ 移除监听\n  }\n}\n\n// 2. 避免全局变量\n// ❌\nfunction leak() {\n  data = new Array(1000000);\n}\n\n// ✅\nfunction good() {\n  const data = new Array(1000000);\n}\n\n// 3. WeakMap存储\nconst userData = new WeakMap();\n\nfunction setUser(element, data) {\n  userData.set(element, data);  // element被移除时自动清理\n}\n\n// 4. 限制缓存\nclass LimitedCache {\n  constructor(maxSize) {\n    this.maxSize = maxSize;\n    this.cache = new Map();\n  }\n  \n  set(key, value) {\n    if (this.cache.size >= this.maxSize) {\n      const firstKey = this.cache.keys().next().value;\n      this.cache.delete(firstKey);\n    }\n    this.cache.set(key, value);\n  }\n}\n\n// 5. 分批处理\nasync function processBig(data) {\n  const chunkSize = 1000;\n  \n  for (let i = 0; i < data.length; i += chunkSize) {\n    const chunk = data.slice(i, i + chunkSize);\n    await processChunk(chunk);\n    \n    // 让出控制权，允许GC\n    await new Promise(r => setTimeout(r, 0));\n  }\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "装饰器模式",
      "url": "20-03-decorator.html"
    },
    "next": {
      "title": "内存泄漏检测",
      "url": "21-02-memory-leak.html"
    }
  }
};
