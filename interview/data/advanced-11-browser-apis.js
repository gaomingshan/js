/**
 * 浏览器API
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Advanced11BrowserAPIs = {
  "config": {
    "title": "浏览器API",
    "icon": "🌐",
    "description": "掌握Fetch、Intersection Observer、Mutation Observer等现代浏览器API",
    "primaryColor": "#10b981",
    "bgGradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["Fetch API"],
      "question": "fetch()返回什么？",
      "options": [
        "Promise对象",
        "Response对象",
        "JSON数据",
        "XMLHttpRequest对象"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Fetch API基础：",
        "code": "// fetch返回Promise\nfetch('/api/users')\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error(error));\n\n// async/await\nconst response = await fetch('/api/users');\nconst data = await response.json();"
      },
      "source": "Fetch API"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["Intersection Observer"],
      "question": "Intersection Observer的常见应用场景有哪些？",
      "options": [
        "图片懒加载",
        "无限滚动",
        "曝光埋点统计",
        "动画触发",
        "拖拽功能",
        "表单验证"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "Intersection Observer应用：",
        "code": "const observer = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      // 元素进入视口\n      const img = entry.target;\n      img.src = img.dataset.src; // 懒加载\n      observer.unobserve(img);\n    }\n  });\n}, {\n  threshold: 0.5, // 50%可见时触发\n  rootMargin: '50px' // 提前50px触发\n});\n\ndocument.querySelectorAll('img[data-src]').forEach(img => {\n  observer.observe(img);\n});"
      },
      "source": "Intersection Observer"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Fetch错误处理"],
      "question": "fetch()在404错误时会进入catch吗？",
      "code": "fetch('/api/not-found')\n  .then(response => console.log('then'))\n  .catch(error => console.log('catch'));",
      "options": [
        "进入then（fetch不把404当错误）",
        "进入catch",
        "两个都不进入",
        "取决于浏览器"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Fetch错误处理机制：",
        "code": "// ❌ 404不会触发catch\nfetch('/api/not-found')\n  .then(response => {\n    console.log('进入then'); // ✅ 执行\n    console.log(response.ok); // false\n    console.log(response.status); // 404\n  })\n  .catch(error => {\n    console.log('不会执行');\n  });\n\n// ✅ 正确处理HTTP错误\nfetch('/api/users')\n  .then(response => {\n    if (!response.ok) {\n      throw new Error(`HTTP ${response.status}`);\n    }\n    return response.json();\n  })\n  .catch(error => {\n    console.error('网络错误或HTTP错误:', error);\n  });\n\n// 只有网络错误才触发catch\n// - 断网\n// - DNS解析失败\n// - CORS错误\n// - 请求被阻止"
      },
      "source": "Fetch错误"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["Mutation Observer"],
      "question": "Mutation Observer可以监听DOM节点的属性变化、子节点变化和文本内容变化",
      "correctAnswer": "A",
      "explanation": {
        "title": "Mutation Observer功能：",
        "code": "const observer = new MutationObserver((mutations) => {\n  mutations.forEach(mutation => {\n    console.log('类型:', mutation.type);\n    console.log('目标:', mutation.target);\n  });\n});\n\nobserver.observe(element, {\n  attributes: true,    // 监听属性变化\n  childList: true,     // 监听子节点变化\n  characterData: true, // 监听文本内容\n  subtree: true,       // 监听所有后代\n  attributeOldValue: true, // 记录旧属性值\n  characterDataOldValue: true // 记录旧文本\n});"
      },
      "source": "Mutation Observer"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["封装Fetch"],
      "question": "封装一个带超时的fetch，空白处填什么？",
      "code": "function fetchWithTimeout(url, options = {}, timeout = 5000) {\n  return Promise.race([\n    fetch(url, options),\n    new Promise((_, reject) => {\n      setTimeout(() => ________, timeout);\n    })\n  ]);\n}",
      "options": [
        "reject(new Error('Timeout'))",
        "throw new Error('Timeout')",
        "return null",
        "reject('Timeout')"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "完整的Fetch封装：",
        "code": "function fetchWithTimeout(url, options = {}, timeout = 5000) {\n  const controller = new AbortController();\n  const timeoutId = setTimeout(() => {\n    controller.abort();\n  }, timeout);\n  \n  return fetch(url, {\n    ...options,\n    signal: controller.signal\n  })\n    .then(response => {\n      clearTimeout(timeoutId);\n      if (!response.ok) {\n        throw new Error(`HTTP ${response.status}`);\n      }\n      return response;\n    })\n    .catch(error => {\n      clearTimeout(timeoutId);\n      if (error.name === 'AbortError') {\n        throw new Error('Request timeout');\n      }\n      throw error;\n    });\n}\n\n// 使用\ntry {\n  const response = await fetchWithTimeout('/api/data', {}, 3000);\n  const data = await response.json();\n} catch (error) {\n  console.error(error.message);\n}"
      },
      "source": "Fetch封装"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Web Worker"],
      "question": "以下哪些是Web Worker的特点？",
      "options": [
        "运行在独立线程，不阻塞主线程",
        "不能访问DOM",
        "可以使用fetch和XMLHttpRequest",
        "通过postMessage通信",
        "可以直接修改页面元素",
        "可以使用localStorage"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "Web Worker使用：",
        "code": "// 主线程\nconst worker = new Worker('worker.js');\n\nworker.postMessage({ data: [1, 2, 3] });\n\nworker.onmessage = (e) => {\n  console.log('结果:', e.data);\n};\n\n// worker.js\nself.onmessage = (e) => {\n  const data = e.data.data;\n  const result = data.map(n => n * 2);\n  self.postMessage(result);\n};\n\n// Worker可以使用的API\n// - fetch\n// - XMLHttpRequest\n// - setTimeout/setInterval\n// - localStorage/sessionStorage\n// - indexedDB\n// - WebSocket\n\n// Worker不能使用\n// - DOM操作\n// - window对象\n// - document对象\n// - parent对象"
      },
      "source": "Web Worker"
    },
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["requestAnimationFrame"],
      "question": "requestAnimationFrame的回调通常以什么频率执行？",
      "options": [
        "60fps（约16.7ms一次）",
        "30fps",
        "取决于显示器刷新率",
        "1000ms一次"
      ],
      "correctAnswer": "C",
      "explanation": {
        "title": "requestAnimationFrame特性：",
        "code": "// 平滑动画\nfunction animate() {\n  element.style.left = position + 'px';\n  position += 1;\n  \n  if (position < 100) {\n    requestAnimationFrame(animate);\n  }\n}\n\nrequestAnimationFrame(animate);\n\n// 特点\n// - 匹配显示器刷新率（通常60Hz）\n// - 页面不可见时暂停\n// - 自动节流\n// - 更流畅的动画"
      },
      "source": "requestAnimationFrame"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["Geolocation"],
      "question": "Geolocation API可以获取用户精确的GPS坐标",
      "correctAnswer": "A",
      "explanation": {
        "title": "Geolocation API：",
        "code": "if ('geolocation' in navigator) {\n  navigator.geolocation.getCurrentPosition(\n    (position) => {\n      console.log('纬度:', position.coords.latitude);\n      console.log('经度:', position.coords.longitude);\n      console.log('精度:', position.coords.accuracy, 'm');\n    },\n    (error) => {\n      console.error('错误:', error.message);\n    },\n    {\n      enableHighAccuracy: true, // 高精度\n      timeout: 5000,\n      maximumAge: 0\n    }\n  );\n}"
      },
      "source": "Geolocation"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["防抖封装"],
      "question": "使用ResizeObserver监听元素尺寸变化，空白处填什么？",
      "code": "const observer = new ResizeObserver(entries => {\n  entries.forEach(entry => {\n    console.log('宽度:', ______);\n    console.log('高度:', entry.contentRect.height);\n  });\n});\n\nobserver.observe(element);",
      "options": [
        "entry.contentRect.width",
        "entry.target.width",
        "entry.width",
        "entry.boundingClientRect.width"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ResizeObserver使用：",
        "code": "const observer = new ResizeObserver(entries => {\n  entries.forEach(entry => {\n    // contentRect: 内容区域（不含border）\n    const { width, height } = entry.contentRect;\n    console.log(`尺寸: ${width}x${height}`);\n    \n    // borderBoxSize: 含border\n    // contentBoxSize: 不含border\n    \n    // 响应式布局\n    if (width < 768) {\n      entry.target.classList.add('mobile');\n    } else {\n      entry.target.classList.remove('mobile');\n    }\n  });\n});\n\nobserver.observe(document.querySelector('.container'));"
      },
      "source": "ResizeObserver"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "以下哪些是现代浏览器API的最佳实践？",
      "options": [
        "使用Fetch代替XMLHttpRequest",
        "使用Intersection Observer代替scroll事件",
        "使用Web Worker处理密集计算",
        "所有API都用polyfill",
        "使用AbortController取消请求",
        "使用MutationObserver代替setInterval轮询DOM"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "API使用最佳实践：",
        "code": "// 1. Fetch + AbortController\nconst controller = new AbortController();\nfetch('/api/data', { signal: controller.signal });\ncontroller.abort(); // 取消请求\n\n// 2. Intersection Observer懒加载\nconst observer = new IntersectionObserver(entries => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      loadImage(entry.target);\n      observer.unobserve(entry.target);\n    }\n  });\n});\n\n// 3. Web Worker密集计算\nconst worker = new Worker('calculate.js');\nworker.postMessage(bigData);\n\n// 4. MutationObserver监听DOM\nconst observer = new MutationObserver(mutations => {\n  // DOM变化时执行\n});\nobserver.observe(element, { childList: true });"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "浏览器导航",
      "url": "11-browser-navigation.html"
    },
    "next": {
      "title": "模块系统",
      "url": "../advanced/12-module-system.html"
    }
  }
};
