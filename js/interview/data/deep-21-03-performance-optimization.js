/**
 * 性能优化策略
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2103PerformanceOptimization = {
  "config": {
    "title": "性能优化策略",
    "icon": "⚡",
    "description": "掌握JavaScript性能优化的策略和技巧",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["防抖节流"],
      "question": "防抖（debounce）和节流（throttle）的区别？",
      "options": [
        "防抖是延迟执行，节流是定期执行",
        "防抖是定期执行，节流是延迟执行",
        "没有区别",
        "都是立即执行"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "防抖与节流",
        "code": "// 防抖（debounce）：延迟执行，重复触发会重置计时\nfunction debounce(fn, delay) {\n  let timer = null;\n  \n  return function(...args) {\n    clearTimeout(timer);  // 清除之前的计时器\n    timer = setTimeout(() => {\n      fn.apply(this, args);\n    }, delay);\n  };\n}\n\n// 使用场景：搜索输入\nconst search = debounce((value) => {\n  console.log('搜索:', value);\n}, 500);\n\ninput.oninput = (e) => search(e.target.value);\n// 只在停止输入500ms后执行\n\n// 节流（throttle）：定期执行，忽略期间的触发\nfunction throttle(fn, interval) {\n  let lastTime = 0;\n  \n  return function(...args) {\n    const now = Date.now();\n    \n    if (now - lastTime >= interval) {\n      lastTime = now;\n      fn.apply(this, args);\n    }\n  };\n}\n\n// 使用场景：滚动事件\nconst handleScroll = throttle(() => {\n  console.log('滚动位置:', window.scrollY);\n}, 200);\n\nwindow.onscroll = handleScroll;\n// 每200ms最多执行一次"
      },
      "source": "防抖节流"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["惰性加载"],
      "question": "惰性函数的执行次数？",
      "code": "function createLogger() {\n  console.log('初始化');\n  \n  return function log(msg) {\n    console.log(msg);\n  };\n}\n\nlet logger = createLogger;\n\nlogger('A');\nlogger('B');\nlogger('C');",
      "options": [
        "初始化, A, 初始化, B, 初始化, C",
        "初始化, A, B, C",
        "报错",
        "A, B, C"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "惰性函数优化",
        "code": "// ❌ 问题：每次都初始化\nfunction createLogger() {\n  console.log('初始化');  // 每次调用都执行\n  \n  return function log(msg) {\n    console.log(msg);\n  };\n}\n\nlet logger = createLogger;  // 只赋值函数引用\n\nlogger('A');  // createLogger('A') - 初始化\nlogger('B');  // createLogger('B') - 初始化\nlogger('C');  // createLogger('C') - 初始化\n\n// ✅ 惰性函数（自重写）\nfunction logger(msg) {\n  console.log('初始化');  // 只执行一次\n  \n  logger = function(msg) {  // 重写自己\n    console.log(msg);\n  };\n  \n  logger(msg);  // 执行新函数\n}\n\nlogger('A');  // 初始化, A\nlogger('B');  // B\nlogger('C');  // C\n\n// ✅ 应用：浏览器特性检测\nfunction getScrollTop() {\n  if (window.pageYOffset !== undefined) {\n    getScrollTop = function() {\n      return window.pageYOffset;\n    };\n  } else {\n    getScrollTop = function() {\n      return document.documentElement.scrollTop;\n    };\n  }\n  \n  return getScrollTop();\n}\n\n// 第一次调用后，函数被重写为最优实现"
      },
      "source": "惰性函数"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["DOM优化"],
      "question": "DOM操作的优化策略？",
      "options": [
        "批量修改DOM",
        "使用DocumentFragment",
        "虚拟DOM",
        "每次修改都触发重排",
        "缓存DOM查询",
        "使用innerHTML"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "DOM性能优化",
        "code": "// 1. ❌ 逐个添加（触发多次重排）\nfor (let i = 0; i < 1000; i++) {\n  const div = document.createElement('div');\n  div.textContent = i;\n  container.appendChild(div);  // 1000次重排！\n}\n\n// ✅ 使用DocumentFragment\nconst fragment = document.createDocumentFragment();\nfor (let i = 0; i < 1000; i++) {\n  const div = document.createElement('div');\n  div.textContent = i;\n  fragment.appendChild(div);  // 不触发重排\n}\ncontainer.appendChild(fragment);  // 一次重排\n\n// ✅ 批量修改（离线操作）\nconst clone = container.cloneNode(true);\n// 修改clone\ncontainer.parentNode.replaceChild(clone, container);\n\n// 2. 缓存DOM查询\n// ❌\nfor (let i = 0; i < 100; i++) {\n  document.getElementById('btn').style.left = i + 'px';\n}\n\n// ✅\nconst btn = document.getElementById('btn');\nfor (let i = 0; i < 100; i++) {\n  btn.style.left = i + 'px';\n}\n\n// 3. 批量样式修改\n// ❌ 触发多次重排\nelement.style.left = '10px';\nelement.style.top = '10px';\nelement.style.width = '100px';\n\n// ✅ 使用cssText\nelement.style.cssText = 'left:10px; top:10px; width:100px;';\n\n// ✅ 使用class\nelement.className = 'optimized';\n\n// 4. 读写分离\n// ❌ 强制同步布局\nconst h1 = div1.clientHeight;  // 读\ndiv1.style.height = h1 * 2 + 'px';  // 写\nconst h2 = div2.clientHeight;  // 读（触发重排）\ndiv2.style.height = h2 * 2 + 'px';  // 写\n\n// ✅ 先读后写\nconst h1 = div1.clientHeight;\nconst h2 = div2.clientHeight;\ndiv1.style.height = h1 * 2 + 'px';\ndiv2.style.height = h2 * 2 + 'px';"
      },
      "source": "DOM优化"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["requestAnimationFrame"],
      "question": "requestAnimationFrame比setTimeout(fn, 16)性能更好",
      "correctAnswer": "A",
      "explanation": {
        "title": "requestAnimationFrame优势",
        "code": "// requestAnimationFrame优势：\n\n// 1. 与浏览器刷新率同步（通常60fps）\nfunction animate() {\n  // 更新动画\n  element.style.left = x + 'px';\n  \n  requestAnimationFrame(animate);\n}\n\nrequestAnimationFrame(animate);\n\n// vs setTimeout（可能不同步）\nfunction animateOld() {\n  element.style.left = x + 'px';\n  setTimeout(animateOld, 16);  // 约60fps，但不精确\n}\n\n// 2. 页面不可见时自动暂停\n// requestAnimationFrame会自动暂停\n// setTimeout继续执行，浪费资源\n\n// 3. 更好的性能\n// - 浏览器优化\n// - 批量更新\n// - 减少重排/重绘\n\n// 应用场景：\n// ✅ 动画\nfunction smoothScroll(to) {\n  const start = window.scrollY;\n  const distance = to - start;\n  const duration = 500;\n  let startTime = null;\n  \n  function scroll(currentTime) {\n    if (!startTime) startTime = currentTime;\n    const elapsed = currentTime - startTime;\n    const progress = Math.min(elapsed / duration, 1);\n    \n    window.scrollTo(0, start + distance * progress);\n    \n    if (progress < 1) {\n      requestAnimationFrame(scroll);\n    }\n  }\n  \n  requestAnimationFrame(scroll);\n}\n\n// ✅ 性能监控\nfunction monitorFPS() {\n  let lastTime = performance.now();\n  let frames = 0;\n  \n  function tick() {\n    const now = performance.now();\n    frames++;\n    \n    if (now >= lastTime + 1000) {\n      const fps = Math.round(frames * 1000 / (now - lastTime));\n      console.log('FPS:', fps);\n      frames = 0;\n      lastTime = now;\n    }\n    \n    requestAnimationFrame(tick);\n  }\n  \n  requestAnimationFrame(tick);\n}"
      },
      "source": "RAF"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["虚拟滚动"],
      "question": "实现虚拟列表，空白处填什么？",
      "code": "class VirtualList {\n  constructor(container, itemHeight, totalItems) {\n    this.container = container;\n    this.itemHeight = itemHeight;\n    this.totalItems = totalItems;\n    this.visibleCount = Math.ceil(______ / itemHeight);\n  }\n}",
      "options": [
        "container.clientHeight",
        "window.innerHeight",
        "container.scrollHeight",
        "totalItems"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "虚拟滚动实现",
        "code": "// 虚拟滚动：只渲染可见区域\nclass VirtualList {\n  constructor(container, itemHeight, totalItems) {\n    this.container = container;\n    this.itemHeight = itemHeight;\n    this.totalItems = totalItems;\n    \n    // 计算可见项数量\n    this.visibleCount = Math.ceil(\n      container.clientHeight / itemHeight\n    );\n    \n    // 缓冲区（上下多渲染几项）\n    this.buffer = 3;\n    \n    this.init();\n  }\n  \n  init() {\n    // 创建占位元素（撑开滚动条）\n    this.placeholder = document.createElement('div');\n    this.placeholder.style.height = \n      this.totalItems * this.itemHeight + 'px';\n    \n    // 创建内容容器\n    this.content = document.createElement('div');\n    this.content.style.position = 'relative';\n    \n    this.container.appendChild(this.placeholder);\n    this.container.appendChild(this.content);\n    \n    // 监听滚动\n    this.container.addEventListener('scroll', () => {\n      this.render();\n    });\n    \n    this.render();\n  }\n  \n  render() {\n    const scrollTop = this.container.scrollTop;\n    \n    // 计算起始索引\n    const startIndex = Math.max(\n      0,\n      Math.floor(scrollTop / this.itemHeight) - this.buffer\n    );\n    \n    // 计算结束索引\n    const endIndex = Math.min(\n      this.totalItems,\n      startIndex + this.visibleCount + this.buffer * 2\n    );\n    \n    // 清空内容\n    this.content.innerHTML = '';\n    \n    // 渲染可见项\n    for (let i = startIndex; i < endIndex; i++) {\n      const item = this.createItem(i);\n      item.style.position = 'absolute';\n      item.style.top = i * this.itemHeight + 'px';\n      item.style.height = this.itemHeight + 'px';\n      this.content.appendChild(item);\n    }\n  }\n  \n  createItem(index) {\n    const div = document.createElement('div');\n    div.textContent = `Item ${index}`;\n    return div;\n  }\n}\n\n// 使用：渲染10000项，但只渲染可见部分\nconst list = new VirtualList(\n  document.getElementById('container'),\n  50,    // 每项高度\n  10000  // 总项数\n);\n// 实际DOM只有10-20个元素，而非10000个！"
      },
      "source": "虚拟滚动"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["事件委托"],
      "question": "事件委托的性能优势？",
      "code": "// 方案A：每个item添加监听\nfor (let i = 0; i < 1000; i++) {\n  items[i].addEventListener('click', handler);\n}\n\n// 方案B：事件委托\ncontainer.addEventListener('click', (e) => {\n  if (e.target.matches('.item')) {\n    handler(e);\n  }\n});\n\n// 哪个性能更好？",
      "options": [
        "方案B（事件委托）",
        "方案A（直接监听）",
        "性能相同",
        "取决于浏览器"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "事件委托优化",
        "code": "// ❌ 方案A：为每个元素添加监听器\nconst items = document.querySelectorAll('.item');\nitems.forEach(item => {\n  item.addEventListener('click', handleClick);\n});\n// 问题：\n// 1. 1000个监听器占用内存\n// 2. 动态添加的元素需要再次绑定\n// 3. 移除元素需要解绑监听器\n\n// ✅ 方案B：事件委托\nconst container = document.getElementById('container');\ncontainer.addEventListener('click', (e) => {\n  // 向上查找匹配的元素\n  const item = e.target.closest('.item');\n  if (item) {\n    handleClick(e, item);\n  }\n});\n// 优势：\n// 1. 只有一个监听器\n// 2. 动态元素自动支持\n// 3. 减少内存占用\n\n// 事件委托最佳实践\nfunction delegate(container, selector, event, handler) {\n  container.addEventListener(event, (e) => {\n    const target = e.target.closest(selector);\n    if (target && container.contains(target)) {\n      handler.call(target, e);\n    }\n  });\n}\n\n// 使用\ndelegate(\n  document.getElementById('list'),\n  '.item',\n  'click',\n  function(e) {\n    console.log('点击:', this.textContent);\n  }\n);\n\n// 注意事项：\n// 1. 某些事件不冒泡（focus, blur）\n// 2. stopPropagation会阻止委托\n// 3. 需要判断目标元素"
      },
      "source": "事件委托"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["代码分割"],
      "question": "代码分割的策略有哪些？",
      "options": [
        "路由懒加载",
        "动态import()",
        "按需加载组件",
        "全部打包成一个文件",
        "Tree Shaking",
        "代码拆分成多个chunk"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "代码分割优化",
        "code": "// 1. 动态import（懒加载）\n// ❌ 静态import\nimport HeavyComponent from './HeavyComponent';\n\n// ✅ 动态import\nbutton.onclick = async () => {\n  const module = await import('./HeavyComponent');\n  const component = new module.default();\n};\n\n// 2. 路由懒加载\nconst routes = [\n  {\n    path: '/home',\n    component: () => import('./views/Home.vue')\n  },\n  {\n    path: '/about',\n    component: () => import('./views/About.vue')\n  }\n];\n\n// 3. 按需加载库\n// ❌ 导入整个库\nimport _ from 'lodash';\n\n// ✅ 只导入需要的\nimport debounce from 'lodash/debounce';\n\n// 或使用插件\nimport { debounce } from 'lodash-es';  // Tree Shaking\n\n// 4. Webpack代码分割\nmodule.exports = {\n  optimization: {\n    splitChunks: {\n      chunks: 'all',\n      cacheGroups: {\n        // 分离第三方库\n        vendor: {\n          test: /[\\/]node_modules[\\/]/,\n          name: 'vendors',\n          priority: 10\n        },\n        // 分离公共代码\n        common: {\n          minChunks: 2,\n          name: 'common',\n          priority: 5\n        }\n      }\n    }\n  }\n};\n\n// 5. 预加载/预获取\n// 预加载（立即加载）\nimport(/* webpackPreload: true */ './module');\n\n// 预获取（空闲时加载）\nimport(/* webpackPrefetch: true */ './module');\n\n// 6. React.lazy\nconst LazyComponent = React.lazy(() => \n  import('./LazyComponent')\n);\n\nfunction App() {\n  return (\n    <Suspense fallback={<Loading />}>\n      <LazyComponent />\n    </Suspense>\n  );\n}"
      },
      "source": "代码分割"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["缓存"],
      "question": "使用记忆化可以优化重复计算",
      "correctAnswer": "A",
      "explanation": {
        "title": "记忆化优化",
        "code": "// 记忆化（Memoization）：缓存计算结果\n\n// ❌ 未优化：每次都计算\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nfibonacci(40);  // 非常慢！\n\n// ✅ 记忆化优化\nfunction memoize(fn) {\n  const cache = new Map();\n  \n  return function(...args) {\n    const key = JSON.stringify(args);\n    \n    if (cache.has(key)) {\n      return cache.get(key);  // 返回缓存\n    }\n    \n    const result = fn.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}\n\nconst fibonacci2 = memoize(function(n) {\n  if (n <= 1) return n;\n  return fibonacci2(n - 1) + fibonacci2(n - 2);\n});\n\nfibonacci2(40);  // 快！\n\n// React.memo（组件记忆化）\nconst MemoComponent = React.memo(function Component({ value }) {\n  console.log('渲染');\n  return <div>{value}</div>;\n});\n// 只在props变化时重新渲染\n\n// useMemo（值记忆化）\nfunction Component({ items }) {\n  const sorted = useMemo(() => {\n    return items.sort();  // 只在items变化时排序\n  }, [items]);\n  \n  return <List items={sorted} />;\n}\n\n// useCallback（函数记忆化）\nfunction Parent() {\n  const handleClick = useCallback(() => {\n    console.log('clicked');\n  }, []);  // 函数不会重新创建\n  \n  return <Child onClick={handleClick} />;\n}"
      },
      "source": "记忆化"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Web Worker"],
      "question": "使用Worker处理重任务，空白处填什么？",
      "code": "// 主线程\nconst worker = new Worker('worker.js');\n\nworker.postMessage({ data: largeArray });\n\nworker.______ = (e) => {\n  console.log('结果:', e.data);\n};",
      "options": [
        "onmessage",
        "addEventListener",
        "on",
        "callback"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Web Worker性能优化",
        "code": "// 主线程\nconst worker = new Worker('worker.js');\n\n// 发送数据\nworker.postMessage({ \n  type: 'process',\n  data: largeArray \n});\n\n// 接收结果\nworker.onmessage = (e) => {\n  console.log('结果:', e.data);\n};\n\nworker.onerror = (e) => {\n  console.error('错误:', e.message);\n};\n\n// worker.js\nself.onmessage = (e) => {\n  const { type, data } = e.data;\n  \n  if (type === 'process') {\n    // CPU密集型任务\n    const result = heavyComputation(data);\n    \n    // 返回结果\n    self.postMessage(result);\n  }\n};\n\nfunction heavyComputation(data) {\n  // 复杂计算\n  return data.map(item => {\n    // 处理\n    return item * 2;\n  });\n}\n\n// 传输大数据：使用Transferable Objects\nconst buffer = new ArrayBuffer(1024 * 1024);  // 1MB\n\n// 转移所有权（零拷贝）\nworker.postMessage({ buffer }, [buffer]);\n// 主线程无法再访问buffer\n\n// Worker池\nclass WorkerPool {\n  constructor(workerScript, poolSize) {\n    this.workers = [];\n    this.queue = [];\n    \n    for (let i = 0; i < poolSize; i++) {\n      const worker = new Worker(workerScript);\n      worker.onmessage = (e) => this.handleResult(e, worker);\n      this.workers.push({ worker, busy: false });\n    }\n  }\n  \n  execute(data) {\n    return new Promise((resolve) => {\n      const freeWorker = this.workers.find(w => !w.busy);\n      \n      if (freeWorker) {\n        this.runTask(freeWorker, data, resolve);\n      } else {\n        this.queue.push({ data, resolve });\n      }\n    });\n  }\n  \n  runTask(workerObj, data, resolve) {\n    workerObj.busy = true;\n    workerObj.resolve = resolve;\n    workerObj.worker.postMessage(data);\n  }\n  \n  handleResult(e, worker) {\n    const workerObj = this.workers.find(w => w.worker === worker);\n    workerObj.busy = false;\n    workerObj.resolve(e.data);\n    \n    // 处理队列\n    if (this.queue.length > 0) {\n      const { data, resolve } = this.queue.shift();\n      this.runTask(workerObj, data, resolve);\n    }\n  }\n}"
      },
      "source": "Web Worker"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "JavaScript性能优化的最佳实践？",
      "options": [
        "避免强制同步布局",
        "使用requestAnimationFrame",
        "减少重排重绘",
        "所有代码都用Worker",
        "合理使用缓存",
        "代码分割和懒加载"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "性能优化最佳实践",
        "code": "// 1. 避免强制同步布局\n// ❌ 布局抖动\nfor (let i = 0; i < 100; i++) {\n  const h = div.clientHeight;  // 强制布局\n  div.style.height = h + 10 + 'px';\n}\n\n// ✅ 批量读写\nconst heights = [];\nfor (let i = 0; i < 100; i++) {\n  heights.push(divs[i].clientHeight);\n}\nfor (let i = 0; i < 100; i++) {\n  divs[i].style.height = heights[i] + 10 + 'px';\n}\n\n// 2. 减少重排重绘\n// ✅ 离线操作\nconst clone = element.cloneNode(true);\n// 修改clone\nelement.parentNode.replaceChild(clone, element);\n\n// ✅ display:none\nelement.style.display = 'none';\n// 大量修改\nelement.style.display = '';\n\n// 3. requestAnimationFrame\nfunction smoothUpdate() {\n  requestAnimationFrame(() => {\n    // 更新UI\n    smoothUpdate();\n  });\n}\n\n// 4. 缓存策略\nconst cache = new Map();\n\nfunction expensiveOperation(key) {\n  if (cache.has(key)) {\n    return cache.get(key);\n  }\n  \n  const result = compute(key);\n  cache.set(key, result);\n  return result;\n}\n\n// 5. 代码分割\n// 按需加载\nconst loadModule = async () => {\n  const module = await import('./heavy-module.js');\n  module.init();\n};\n\n// 6. 性能监控\nconst observer = new PerformanceObserver((list) => {\n  for (const entry of list.getEntries()) {\n    console.log('LCP:', entry.startTime);\n  }\n});\n\nobserver.observe({ entryTypes: ['largest-contentful-paint'] });\n\n// 7. 图片优化\n// 懒加载\nconst images = document.querySelectorAll('img[data-src]');\nconst imageObserver = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      const img = entry.target;\n      img.src = img.dataset.src;\n      imageObserver.unobserve(img);\n    }\n  });\n});\n\nimages.forEach(img => imageObserver.observe(img));"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "内存泄漏检测",
      "url": "21-02-memory-leak.html"
    },
    "next": {
      "title": "V8引擎原理",
      "url": "22-01-v8-engine.html"
    }
  }
};
