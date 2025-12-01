/**
 * 浏览器导航与历史
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Advanced11BrowserNavigation = {
  "config": {
    "title": "浏览器导航与历史",
    "icon": "🧭",
    "description": "掌握History API、location对象和前端路由实现",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["History API"],
      "question": "pushState和replaceState的主要区别是什么？",
      "options": [
        "pushState添加新记录，replaceState替换当前记录",
        "pushState会刷新页面，replaceState不会",
        "pushState可以跨域，replaceState不行",
        "完全相同"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "History API对比：",
        "code": "// pushState - 添加新历史记录\nhistory.pushState({ page: 1 }, '', '/page1');\nhistory.pushState({ page: 2 }, '', '/page2');\n// 可以后退到page1\n\n// replaceState - 替换当前记录\nhistory.replaceState({ page: 3 }, '', '/page3');\n// 无法后退到page2，直接回到page1"
      },
      "source": "History API"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["location对象"],
      "question": "以下哪些是location对象的属性？",
      "options": [
        "href",
        "pathname",
        "search",
        "hash",
        "query",
        "host"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "location对象属性：",
        "code": "// URL: https://example.com:8080/path?id=1#section\n\nlocation.href     // 'https://example.com:8080/path?id=1#section'\nlocation.protocol // 'https:'\nlocation.host     // 'example.com:8080'\nlocation.hostname // 'example.com'\nlocation.port     // '8080'\nlocation.pathname // '/path'\nlocation.search   // '?id=1'\nlocation.hash     // '#section'\nlocation.origin   // 'https://example.com:8080'\n\n// 注意：没有query属性，需手动解析search"
      },
      "source": "location对象"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["popstate事件"],
      "question": "pushState会触发popstate事件吗？",
      "code": "window.addEventListener('popstate', (e) => {\n  console.log('popstate triggered');\n});\n\nhistory.pushState({ page: 1 }, '', '/page1');",
      "options": [
        "不会触发",
        "会触发",
        "取决于浏览器",
        "只在hash模式触发"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "popstate事件触发时机：",
        "code": "// ❌ pushState/replaceState不触发popstate\nhistory.pushState({}, '', '/page');\nhistory.replaceState({}, '', '/page');\n\n// ✅ 用户点击前进/后退触发\nwindow.addEventListener('popstate', (e) => {\n  console.log('state:', e.state);\n});\n\n// ✅ history.back/forward/go触发\nhistory.back();\nhistory.forward();\nhistory.go(-2);"
      },
      "source": "popstate事件"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["页面刷新"],
      "question": "使用location.href会刷新页面，而pushState不会",
      "correctAnswer": "A",
      "explanation": {
        "title": "页面导航对比：",
        "code": "// ✅ 会刷新页面\nlocation.href = '/new-page';\nlocation.assign('/new-page');\nlocation.replace('/new-page');\nlocation.reload();\n\n// ✅ 不刷新页面（SPA路由）\nhistory.pushState({}, '', '/new-page');\nhistory.replaceState({}, '', '/new-page');"
      },
      "source": "页面导航"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["路由实现"],
      "question": "实现简单的前端路由，空白处填什么？",
      "code": "class Router {\n  constructor() {\n    this.routes = {};\n    window.addEventListener('popstate', () => {\n      this.handleRoute();\n    });\n  }\n  \n  route(path, callback) {\n    this.routes[path] = callback;\n  }\n  \n  navigate(path) {\n    history.pushState({}, '', path);\n    ______;\n  }\n  \n  handleRoute() {\n    const path = location.pathname;\n    const callback = this.routes[path];\n    if (callback) callback();\n  }\n}",
      "options": [
        "this.handleRoute()",
        "location.reload()",
        "window.dispatchEvent(new PopStateEvent('popstate'))",
        "this.routes[path]()"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "完整路由实现：",
        "code": "class Router {\n  constructor() {\n    this.routes = {};\n    \n    window.addEventListener('popstate', () => {\n      this.handleRoute();\n    });\n    \n    // 拦截链接点击\n    document.addEventListener('click', (e) => {\n      if (e.target.matches('[data-link]')) {\n        e.preventDefault();\n        this.navigate(e.target.href);\n      }\n    });\n  }\n  \n  route(path, callback) {\n    this.routes[path] = callback;\n  }\n  \n  navigate(path) {\n    history.pushState({}, '', path);\n    this.handleRoute(); // 手动触发路由处理\n  }\n  \n  handleRoute() {\n    const path = location.pathname;\n    const callback = this.routes[path] || this.routes['404'];\n    if (callback) callback();\n  }\n}\n\n// 使用\nconst router = new Router();\n\nrouter.route('/', () => {\n  document.body.innerHTML = '<h1>Home</h1>';\n});\n\nrouter.route('/about', () => {\n  document.body.innerHTML = '<h1>About</h1>';\n});\n\nrouter.route('404', () => {\n  document.body.innerHTML = '<h1>404</h1>';\n});\n\nrouter.handleRoute(); // 初始化"
      },
      "source": "路由实现"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["URL解析"],
      "question": "以下哪些方法可以解析URL查询参数？",
      "options": [
        "URLSearchParams",
        "new URL()",
        "手动解析location.search",
        "location.query",
        "正则表达式",
        "JSON.parse()"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "URL查询参数解析：",
        "code": "// 方法1：URLSearchParams（推荐）\nconst params = new URLSearchParams(location.search);\nparams.get('id');    // '123'\nparams.getAll('tag'); // ['a', 'b']\nparams.has('id');    // true\n\n// 方法2：URL对象\nconst url = new URL(location.href);\nurl.searchParams.get('id'); // '123'\n\n// 方法3：手动解析\nfunction parseQuery(search) {\n  return search.slice(1).split('&').reduce((acc, pair) => {\n    const [key, value] = pair.split('=');\n    acc[decodeURIComponent(key)] = decodeURIComponent(value);\n    return acc;\n  }, {});\n}\n\n// 方法4：正则表达式\nfunction getQueryParam(key) {\n  const regex = new RegExp(`[?&]${key}=([^&]*)`);\n  const match = location.search.match(regex);\n  return match ? decodeURIComponent(match[1]) : null;\n}"
      },
      "source": "URL解析"
    },
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["hash变化"],
      "question": "修改location.hash会触发什么事件？",
      "code": "window.addEventListener('hashchange', () => {\n  console.log('hash changed');\n});\n\nlocation.hash = '#section1';",
      "options": [
        "会触发hashchange",
        "会触发popstate",
        "两个都触发",
        "都不触发"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "hashchange事件：",
        "code": "// hashchange事件\nwindow.addEventListener('hashchange', (e) => {\n  console.log('oldURL:', e.oldURL);\n  console.log('newURL:', e.newURL);\n  console.log('hash:', location.hash);\n});\n\n// 触发方式\nlocation.hash = '#section1';  // 触发\nlocation.href = '#section2';  // 触发\n<a href=\"#section3\">Link</a> // 点击触发\n\n// Hash路由实现\nclass HashRouter {\n  constructor() {\n    this.routes = {};\n    window.addEventListener('hashchange', () => {\n      this.handleRoute();\n    });\n  }\n  \n  route(path, callback) {\n    this.routes[path] = callback;\n  }\n  \n  handleRoute() {\n    const hash = location.hash.slice(1) || '/';\n    const callback = this.routes[hash];\n    if (callback) callback();\n  }\n}"
      },
      "source": "hashchange"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["刷新页面"],
      "question": "location.reload(true)会强制从服务器重新加载页面，忽略缓存",
      "correctAnswer": "A",
      "explanation": {
        "title": "页面刷新方法：",
        "code": "// reload()方法\nlocation.reload();      // 可能使用缓存\nlocation.reload(true);  // 强制从服务器加载（已废弃）\nlocation.reload(false); // 可能使用缓存\n\n// 现代做法\nlocation.reload(); // 浏览器自行决定\n\n// 其他刷新方式\nlocation.href = location.href;\nlocation.assign(location.href);\nlocation.replace(location.href); // 不产生历史记录"
      },
      "source": "页面刷新"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["路由守卫"],
      "question": "实现路由守卫功能，空白处填什么？",
      "code": "class Router {\n  beforeEach(guard) {\n    this.guard = guard;\n  }\n  \n  async navigate(path) {\n    if (this.guard) {\n      const result = await this.guard(path);\n      if (______) return; // 阻止导航\n    }\n    history.pushState({}, '', path);\n    this.handleRoute();\n  }\n}",
      "options": [
        "result === false",
        "!result",
        "result !== true",
        "result === null"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "路由守卫实现：",
        "code": "class Router {\n  constructor() {\n    this.routes = {};\n    this.guards = [];\n  }\n  \n  beforeEach(guard) {\n    this.guards.push(guard);\n  }\n  \n  async navigate(to, from) {\n    // 执行所有守卫\n    for (const guard of this.guards) {\n      const result = await guard(to, from);\n      if (result === false) {\n        console.log('Navigation cancelled');\n        return false;\n      }\n      if (typeof result === 'string') {\n        // 重定向\n        return this.navigate(result, from);\n      }\n    }\n    \n    history.pushState({}, '', to);\n    this.handleRoute();\n    return true;\n  }\n}\n\n// 使用\nconst router = new Router();\n\n// 权限守卫\nrouter.beforeEach((to, from) => {\n  if (to === '/admin' && !isLoggedIn()) {\n    return '/login'; // 重定向\n  }\n  return true;\n});\n\n// 确认离开\nrouter.beforeEach((to, from) => {\n  if (hasUnsavedChanges()) {\n    return confirm('有未保存的更改，确定离开？');\n  }\n  return true;\n});"
      },
      "source": "路由守卫"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "以下哪些是前端路由的最佳实践？",
      "options": [
        "使用History API而不是Hash路由",
        "服务器配置支持SPA",
        "路由懒加载",
        "使用正则匹配动态路由",
        "每个路由都用location.href跳转",
        "监听所有链接点击事件"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "前端路由最佳实践：",
        "code": "// 1. History API（更优雅）\nhistory.pushState({}, '', '/users/123');\n\n// 2. 服务器配置（Nginx）\nlocation / {\n  try_files $uri $uri/ /index.html;\n}\n\n// 3. 路由懒加载\nconst routes = [\n  {\n    path: '/home',\n    component: () => import('./views/Home.vue')\n  }\n];\n\n// 4. 动态路由\nrouter.route('/users/:id', ({ id }) => {\n  loadUser(id);\n});\n\n// 5. 拦截链接\ndocument.addEventListener('click', (e) => {\n  if (e.target.matches('a[href^=\"/\"]')) {\n    e.preventDefault();\n    router.navigate(e.target.pathname);\n  }\n});"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "浏览器存储",
      "url": "11-browser-storage.html"
    },
    "next": {
      "title": "浏览器API",
      "url": "11-browser-apis.html"
    }
  }
};
