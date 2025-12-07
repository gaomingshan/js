/**
 * 内存泄漏检测
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2102MemoryLeak = {
  "config": {
    "title": "内存泄漏检测",
    "icon": "🔍",
    "description": "学习如何检测和修复JavaScript内存泄漏",
    "primaryColor": "#ef4444",
    "bgGradient": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["内存泄漏"],
      "question": "以下哪种情况会导致内存泄漏？",
      "options": [
        "忘记清除定时器",
        "使用let声明变量",
        "使用箭头函数",
        "使用const声明"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "定时器内存泄漏",
        "code": "// ❌ 内存泄漏\nfunction leak() {\n  const data = new Array(1000000);\n  \n  setInterval(() => {\n    console.log(data.length);\n  }, 1000);\n  \n  // 定时器一直运行，data无法被回收\n}\n\nleak();\n\n// ✅ 正确做法\nclass Component {\n  constructor() {\n    this.data = new Array(1000000);\n    \n    this.timer = setInterval(() => {\n      console.log(this.data.length);\n    }, 1000);\n  }\n  \n  destroy() {\n    clearInterval(this.timer);  // 清除定时器\n    this.data = null;  // 释放数据\n  }\n}\n\nconst comp = new Component();\n// 使用完毕\ncomp.destroy();"
      },
      "source": "定时器泄漏"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["DOM泄漏"],
      "question": "以下代码会导致内存泄漏吗？",
      "code": "const cache = [];\n\nfunction addElement() {\n  const div = document.createElement('div');\n  document.body.appendChild(div);\n  cache.push(div);\n}\n\nfunction removeElement() {\n  const div = cache[0];\n  div.remove();  // 从DOM移除\n}\n\naddElement();\nremoveElement();\n// cache[0]会被回收吗？",
      "options": [
        "不会，cache仍然引用div",
        "会立即回收",
        "取决于浏览器",
        "会延迟回收"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "DOM引用泄漏",
        "code": "const cache = [];\n\nfunction addElement() {\n  const div = document.createElement('div');\n  document.body.appendChild(div);\n  cache.push(div);  // 保存引用\n}\n\nfunction removeElement() {\n  const div = cache[0];\n  div.remove();  // 从DOM移除\n  // 但cache仍然引用div\n}\n\n// ❌ div不会被回收\ncache[0];  // 仍然可以访问\n\n// ✅ 正确做法1：清除引用\nfunction removeElement2() {\n  const div = cache.shift();  // 从cache移除\n  if (div) {\n    div.remove();\n  }\n}\n\n// ✅ 正确做法2：使用WeakMap\nconst weakCache = new WeakMap();\n\nfunction addElement2() {\n  const div = document.createElement('div');\n  document.body.appendChild(div);\n  weakCache.set(div, { data: 'some data' });\n  // div被移除后，WeakMap条目自动清除\n}\n\n// ✅ 正确做法3：使用WeakSet\nconst elements = new WeakSet();\nelements.add(div);\n// div被移除后自动从WeakSet移除"
      },
      "source": "DOM泄漏"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["泄漏检测工具"],
      "question": "可以使用哪些工具检测内存泄漏？",
      "options": [
        "Chrome DevTools Memory",
        "Performance Monitor",
        "Heap Snapshot",
        "console.log",
        "Allocation Timeline",
        "Node.js --inspect"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "内存泄漏检测工具",
        "code": "// 1. Chrome DevTools Memory Profiler\n// - Heap Snapshot：堆快照\n// - Allocation instrumentation on timeline：时间线分配\n// - Allocation sampling：分配采样\n\n// 使用Heap Snapshot检测泄漏：\n// 1. 打开DevTools → Memory\n// 2. 选择Heap snapshot\n// 3. 执行操作\n// 4. 拍摄快照\n// 5. 重复操作\n// 6. 再次拍摄快照\n// 7. 比较快照，查看增长的对象\n\n// 2. Performance Monitor\n// 实时监控：\n// - JS heap size\n// - DOM nodes\n// - Event listeners\n\n// 3. 代码监控\nfunction monitorMemory() {\n  if (performance.memory) {\n    const used = performance.memory.usedJSHeapSize;\n    const total = performance.memory.totalJSHeapSize;\n    \n    console.log(`堆使用: ${(used / 1024 / 1024).toFixed(2)} MB`);\n    console.log(`堆总量: ${(total / 1024 / 1024).toFixed(2)} MB`);\n    console.log(`使用率: ${(used / total * 100).toFixed(2)}%`);\n  }\n}\n\nsetInterval(monitorMemory, 5000);\n\n// 4. Node.js内存监控\nif (typeof process !== 'undefined') {\n  const usage = process.memoryUsage();\n  console.log('堆使用:', (usage.heapUsed / 1024 / 1024).toFixed(2), 'MB');\n  console.log('RSS:', (usage.rss / 1024 / 1024).toFixed(2), 'MB');\n}\n\n// 5. 自动检测泄漏\nclass LeakDetector {\n  constructor() {\n    this.baseline = null;\n    this.threshold = 50 * 1024 * 1024;  // 50MB\n  }\n  \n  start() {\n    this.baseline = performance.memory.usedJSHeapSize;\n  }\n  \n  check() {\n    const current = performance.memory.usedJSHeapSize;\n    const growth = current - this.baseline;\n    \n    if (growth > this.threshold) {\n      console.warn('检测到可能的内存泄漏');\n      console.warn('内存增长:', (growth / 1024 / 1024).toFixed(2), 'MB');\n      return true;\n    }\n    return false;\n  }\n}"
      },
      "source": "检测工具"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["事件监听器"],
      "question": "移除DOM元素会自动移除其事件监听器",
      "correctAnswer": "A",
      "explanation": {
        "title": "事件监听器清理",
        "code": "// 现代浏览器会自动清理\nconst div = document.createElement('div');\ndiv.addEventListener('click', handler);\ndocument.body.appendChild(div);\n\n// 移除DOM\ndiv.remove();\n// 事件监听器会被自动清理（现代浏览器）\n\n// 但最佳实践仍是手动清理\n// ✅ 推荐做法\nclass Component {\n  constructor(element) {\n    this.element = element;\n    this.handler = this.onClick.bind(this);\n    this.element.addEventListener('click', this.handler);\n  }\n  \n  onClick() {\n    console.log('clicked');\n  }\n  \n  destroy() {\n    this.element.removeEventListener('click', this.handler);\n    this.element = null;\n  }\n}\n\n// ❌ 可能泄漏的情况\nconst handlers = [];\n\nfunction addListener(element) {\n  const handler = () => console.log('click');\n  element.addEventListener('click', handler);\n  handlers.push(handler);  // 保存引用\n}\n\nfunction removeElement(element) {\n  element.remove();\n  // handlers仍然引用handler函数\n}\n\n// ✅ 使用AbortController（新方法）\nconst controller = new AbortController();\n\nelement.addEventListener('click', handler, {\n  signal: controller.signal\n});\n\n// 一次性移除所有监听器\ncontroller.abort();"
      },
      "source": "事件监听器"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["闭包泄漏"],
      "question": "修复闭包内存泄漏，空白处填什么？",
      "code": "function createHandler() {\n  const largeData = new Array(1000000);\n  \n  return {\n    getData: function() {\n      return largeData.length;\n    },\n    destroy: function() {\n      ______;  // 释放内存\n    }\n  };\n}",
      "options": [
        "largeData.length = 0",
        "largeData = null",
        "delete this.largeData",
        "无法释放"
      ],
      "correctAnswer": "D",
      "explanation": {
        "title": "闭包内存无法释放",
        "code": "// 问题：闭包引用的变量无法直接释放\nfunction createHandler() {\n  const largeData = new Array(1000000);\n  \n  return {\n    getData: function() {\n      return largeData.length;\n    },\n    destroy: function() {\n      // largeData在闭包中，无法在这里释放\n      // largeData = null;  // 无效！\n    }\n  };\n}\n\n// ✅ 解决方案1：只保留需要的数据\nfunction createHandler1() {\n  const largeData = new Array(1000000);\n  const length = largeData.length;  // 提取需要的值\n  \n  return {\n    getData: function() {\n      return length;  // largeData可以被回收\n    }\n  };\n}\n\n// ✅ 解决方案2：使用对象存储\nfunction createHandler2() {\n  const state = {\n    largeData: new Array(1000000)\n  };\n  \n  return {\n    getData: function() {\n      return state.largeData?.length || 0;\n    },\n    destroy: function() {\n      state.largeData = null;  // 可以释放\n    }\n  };\n}\n\n// ✅ 解决方案3：使用类\nclass Handler {\n  constructor() {\n    this.largeData = new Array(1000000);\n  }\n  \n  getData() {\n    return this.largeData.length;\n  }\n  \n  destroy() {\n    this.largeData = null;  // 可以释放\n  }\n}"
      },
      "source": "闭包泄漏"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["循环引用"],
      "question": "以下循环引用会导致泄漏吗？",
      "code": "function createNodes() {\n  const parent = { name: 'parent' };\n  const child = { name: 'child' };\n  \n  parent.child = child;\n  child.parent = parent;\n  \n  return parent;\n}\n\nlet node = createNodes();\nnode = null;\n// parent和child会被回收吗？",
      "options": [
        "会被回收（标记-清除算法）",
        "不会被回收（循环引用）",
        "只有parent被回收",
        "只有child被回收"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "现代GC处理循环引用",
        "code": "// 现代JavaScript使用标记-清除算法\n// 可以正确处理循环引用\n\nfunction createNodes() {\n  const parent = { name: 'parent' };\n  const child = { name: 'child' };\n  \n  parent.child = child;\n  child.parent = parent;  // 循环引用\n  \n  return parent;\n}\n\nlet node = createNodes();\nnode = null;  // parent和child都会被回收\n\n// 标记-清除过程：\n// 1. 从根对象（全局、栈）开始标记\n// 2. node = null后，parent不可达\n// 3. parent和child都未被标记\n// 4. 在清除阶段被回收\n\n// 旧的引用计数算法才会有问题：\n// parent引用计数: 1 (child.parent)\n// child引用计数: 1 (parent.child)\n// 即使node=null，计数仍为1，无法回收\n\n// ⚠️ 但在某些情况下仍需注意\n// DOM和JavaScript对象的循环引用（旧IE）\nconst element = document.getElementById('div');\nconst obj = { element: element };\nelement.data = obj;  // 循环引用\n\n// 旧版IE可能泄漏，现代浏览器没问题\n\n// ✅ 安全做法：手动解除\nobj.element = null;\nelement.data = null;"
      },
      "source": "循环引用"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["预防泄漏"],
      "question": "如何预防内存泄漏？",
      "options": [
        "使用WeakMap/WeakSet",
        "及时清理定时器",
        "避免全局变量",
        "使用严格模式",
        "移除事件监听器",
        "限制闭包作用域"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "内存泄漏预防",
        "code": "// 1. WeakMap存储对象关联数据\nconst privateData = new WeakMap();\n\nclass User {\n  constructor(name) {\n    privateData.set(this, { name });\n  }\n  \n  getName() {\n    return privateData.get(this).name;\n  }\n}\n// 实例被回收时，WeakMap条目自动清除\n\n// 2. 清理定时器\nclass Timer {\n  start() {\n    this.id = setInterval(() => {}, 1000);\n  }\n  \n  stop() {\n    if (this.id) {\n      clearInterval(this.id);\n      this.id = null;\n    }\n  }\n}\n\n// 3. 避免全局变量\n// ❌\nfunction bad() {\n  cache = [];  // 意外创建全局变量\n}\n\n// ✅\n'use strict';\nfunction good() {\n  const cache = [];  // 局部变量\n}\n\n// 4. 移除监听器\nclass Component {\n  constructor() {\n    this.handler = () => {};\n    window.addEventListener('resize', this.handler);\n  }\n  \n  destroy() {\n    window.removeEventListener('resize', this.handler);\n  }\n}\n\n// 5. 限制闭包\n// ❌ 保留整个数组\nfunction bad() {\n  const data = new Array(1000000);\n  return () => console.log(data.length);\n}\n\n// ✅ 只保留需要的\nfunction good() {\n  const data = new Array(1000000);\n  const length = data.length;\n  return () => console.log(length);\n}\n\n// 6. 使用IIFE限制作用域\n(function() {\n  const temp = new Array(1000000);\n  process(temp);\n  // temp在IIFE结束后可被回收\n})();"
      },
      "source": "预防泄漏"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["console.log"],
      "question": "console.log会导致内存泄漏",
      "correctAnswer": "A",
      "explanation": {
        "title": "console.log的隐患",
        "code": "// console.log会保留对象引用\nfunction process() {\n  const largeData = new Array(1000000);\n  \n  console.log('数据:', largeData);  // 保留引用！\n  \n  // 即使函数结束，DevTools打开时\n  // largeData不会被回收\n}\n\n// ✅ 生产环境移除console.log\nif (process.env.NODE_ENV === 'production') {\n  console.log = () => {};\n}\n\n// ✅ 或使用日志库\nconst logger = {\n  log(...args) {\n    if (process.env.NODE_ENV !== 'production') {\n      console.log(...args);\n    }\n  }\n};\n\n// ✅ 只输出必要信息\n// ❌\nconsole.log('数据:', largeObject);\n\n// ✅\nconsole.log('数据大小:', largeObject.size);\n\n// 注意：\n// - 打开DevTools时，console保留引用\n// - 关闭DevTools时，引用被清除\n// - 生产环境应该移除所有console调用"
      },
      "source": "console泄漏"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["缓存清理"],
      "question": "实现自动清理的缓存，空白处填什么？",
      "code": "class Cache {\n  constructor(maxAge) {\n    this.maxAge = maxAge;\n    this.cache = new Map();\n  }\n  \n  set(key, value) {\n    this.cache.set(key, {\n      value,\n      timestamp: Date.now()\n    });\n  }\n  \n  get(key) {\n    const item = this.cache.get(key);\n    if (!item) return null;\n    \n    if (Date.now() - item.timestamp > ______) {\n      this.cache.delete(key);\n      return null;\n    }\n    \n    return item.value;\n  }\n}",
      "options": [
        "this.maxAge",
        "item.timestamp",
        "Date.now()",
        "this.cache.size"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "带过期时间的缓存",
        "code": "// 自动清理过期数据的缓存\nclass Cache {\n  constructor(maxAge = 60000) {  // 默认60秒\n    this.maxAge = maxAge;\n    this.cache = new Map();\n    \n    // 定期清理\n    this.cleanupTimer = setInterval(() => {\n      this.cleanup();\n    }, maxAge);\n  }\n  \n  set(key, value) {\n    this.cache.set(key, {\n      value,\n      timestamp: Date.now()\n    });\n  }\n  \n  get(key) {\n    const item = this.cache.get(key);\n    if (!item) return null;\n    \n    // 检查是否过期\n    if (Date.now() - item.timestamp > this.maxAge) {\n      this.cache.delete(key);\n      return null;\n    }\n    \n    return item.value;\n  }\n  \n  cleanup() {\n    const now = Date.now();\n    \n    for (const [key, item] of this.cache.entries()) {\n      if (now - item.timestamp > this.maxAge) {\n        this.cache.delete(key);\n      }\n    }\n  }\n  \n  destroy() {\n    clearInterval(this.cleanupTimer);\n    this.cache.clear();\n  }\n}\n\n// LRU缓存（限制大小）\nclass LRUCache {\n  constructor(maxSize) {\n    this.maxSize = maxSize;\n    this.cache = new Map();\n  }\n  \n  get(key) {\n    if (!this.cache.has(key)) return null;\n    \n    const value = this.cache.get(key);\n    // 更新访问顺序\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    return value;\n  }\n  \n  set(key, value) {\n    if (this.cache.has(key)) {\n      this.cache.delete(key);\n    }\n    \n    this.cache.set(key, value);\n    \n    // 超过限制，删除最旧的\n    if (this.cache.size > this.maxSize) {\n      const firstKey = this.cache.keys().next().value;\n      this.cache.delete(firstKey);\n    }\n  }\n}"
      },
      "source": "缓存清理"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "检测内存泄漏的最佳实践？",
      "options": [
        "定期拍摄堆快照对比",
        "监控内存使用趋势",
        "使用Performance API",
        "手动调用gc()",
        "代码审查关注泄漏点",
        "自动化测试"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "内存泄漏检测最佳实践",
        "code": "// 1. 堆快照对比\n// Chrome DevTools:\n// - 拍摄初始快照\n// - 执行操作\n// - 拍摄第二个快照\n// - 对比差异\n\n// 2. 监控趋势\nclass MemoryMonitor {\n  constructor() {\n    this.samples = [];\n    this.maxSamples = 100;\n  }\n  \n  sample() {\n    if (performance.memory) {\n      const used = performance.memory.usedJSHeapSize;\n      this.samples.push({\n        time: Date.now(),\n        used\n      });\n      \n      if (this.samples.length > this.maxSamples) {\n        this.samples.shift();\n      }\n      \n      return this.detectLeak();\n    }\n  }\n  \n  detectLeak() {\n    if (this.samples.length < 10) return false;\n    \n    // 计算增长趋势\n    const recent = this.samples.slice(-10);\n    const growth = recent[9].used - recent[0].used;\n    \n    if (growth > 10 * 1024 * 1024) {  // 10MB增长\n      console.warn('检测到内存持续增长');\n      return true;\n    }\n    \n    return false;\n  }\n}\n\n// 3. Performance API\nfunction measureMemory() {\n  if (performance.memory) {\n    return {\n      used: performance.memory.usedJSHeapSize,\n      total: performance.memory.totalJSHeapSize,\n      limit: performance.memory.jsHeapSizeLimit\n    };\n  }\n}\n\n// 4. 代码审查清单\nconst leakChecklist = [\n  '是否清理了定时器？',\n  '是否移除了事件监听器？',\n  '是否有意外的全局变量？',\n  '闭包是否保留了不必要的引用？',\n  '是否正确使用了WeakMap/WeakSet？',\n  '缓存是否有大小限制？'\n];\n\n// 5. 自动化测试\ndescribe('Memory Leak Test', () => {\n  it('should not leak memory', async () => {\n    const before = performance.memory.usedJSHeapSize;\n    \n    // 执行操作多次\n    for (let i = 0; i < 100; i++) {\n      createAndDestroy();\n    }\n    \n    // 强制GC（需要--expose-gc）\n    if (global.gc) global.gc();\n    \n    await delay(1000);\n    \n    const after = performance.memory.usedJSHeapSize;\n    const growth = after - before;\n    \n    // 允许少量增长\n    expect(growth).toBeLessThan(1024 * 1024);  // 1MB\n  });\n});"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "垃圾回收机制",
      "url": "21-01-garbage-collection.html"
    },
    "next": {
      "title": "性能优化策略",
      "url": "21-03-performance-optimization.html"
    }
  }
};
