# 第 20 节：Hash 模式

## 概述

Hash 模式是 Vue Router 支持的一种历史管理模式，通过 URL 的 hash 部分（#后面的内容）来管理路由状态。这种模式具有良好的兼容性，无需服务器配置支持。

## 一、Hash 模式基础

### 1.1 工作原理

```javascript
// Hash 模式 URL 格式
// https://example.com/#/home
// https://example.com/#/user/123
// https://example.com/#/products?category=electronics

// URL 结构分析
const url = 'https://example.com/path/#/user/123?tab=profile'
//          ^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^
//          服务器路径（不变）        Hash 部分（路由管理）
```

### 1.2 创建 Hash 模式路由

```javascript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: User }
  ]
})

// 生成的 URL：
// /#/           → Home
// /#/about      → About  
// /#/user/123   → User
```

### 1.3 Hash 事件监听

```javascript
// 浏览器原生 hashchange 事件
window.addEventListener('hashchange', (event) => {
  console.log('Hash 变化:', {
    oldURL: event.oldURL,
    newURL: event.newURL,
    oldHash: new URL(event.oldURL).hash,
    newHash: new URL(event.newURL).hash
  })
})

// Vue Router 内部实现类似机制
class HashHistory {
  constructor(router, base) {
    this.router = router
    this.base = base
    this.current = this.getCurrentLocation()
    
    // 监听 hash 变化
    window.addEventListener('hashchange', this.onHashChange.bind(this))
  }
  
  getCurrentLocation() {
    // 获取当前 hash 作为路由路径
    const hash = window.location.hash.slice(1) // 去掉 # 号
    return hash || '/'
  }
  
  onHashChange() {
    const location = this.getCurrentLocation()
    this.current = location
    this.router.push(location)
  }
  
  push(location) {
    // 更新 hash
    window.location.hash = '#' + location
  }
  
  replace(location) {
    // 替换当前 hash（不产生历史记录）
    const url = window.location.href.replace(/#.*$/, '') + '#' + location
    window.location.replace(url)
  }
}
```

## 二、Hash 模式特点

### 2.1 兼容性优势

```javascript
// Hash 模式兼容性测试
const checkHashSupport = () => {
  // 所有现代浏览器都支持 hash
  const hasHashChangeSupport = 'onhashchange' in window
  const hasLocationHashSupport = 'location' in window && 'hash' in window.location
  
  return {
    hashChange: hasHashChangeSupport,
    locationHash: hasLocationHashSupport,
    compatible: hasHashChangeSupport && hasLocationHashSupport
  }
}

console.log('Hash 模式支持:', checkHashSupport())
// 结果: { hashChange: true, locationHash: true, compatible: true }

// 支持的浏览器版本
const browserSupport = {
  'Chrome': '5+',
  'Firefox': '3.6+',
  'Safari': '5+',
  'IE': '8+',
  'Edge': '12+'
}
```

### 2.2 服务器配置优势

```nginx
# Nginx 配置 - Hash 模式无需特殊配置
server {
    listen 80;
    server_name example.com;
    
    location / {
        root /var/www/html;
        index index.html;
        
        # Hash 模式下，服务器始终返回 index.html
        # 无需额外的 try_files 配置
    }
}
```

```apache
<!-- Apache 配置 - Hash 模式无需 .htaccess -->
<!-- 因为 # 后的内容不会发送到服务器 -->
<VirtualHost *:80>
    DocumentRoot /var/www/html
    DirectoryIndex index.html
</VirtualHost>
```

### 2.3 SEO 限制

```javascript
// Hash 模式的 SEO 问题
const seoConsiderations = {
  searchEngineIndexing: {
    google: 'limited', // Google 有限支持 hash URL
    bing: 'poor',      // Bing 支持较差
    others: 'poor'     // 其他搜索引擎支持不佳
  },
  
  socialSharing: {
    facebook: 'supported',  // Facebook 支持
    twitter: 'supported',   // Twitter 支持
    linkedin: 'limited'     // LinkedIn 有限支持
  },
  
  analytics: {
    googleAnalytics: 'supported', // GA 可以追踪 hash 变化
    customTracking: 'manual'      // 需要手动配置
  }
}

// 改善 Hash 模式 SEO
const improveSEO = () => {
  // 1. 使用 Google Analytics 跟踪
  window.gtag('config', 'GA_MEASUREMENT_ID', {
    page_path: window.location.hash.slice(1) || '/'
  })
  
  // 2. 更新页面标题和 meta 标签
  document.title = getPageTitle()
  updateMetaTags()
  
  // 3. 添加结构化数据
  addStructuredData()
}
```

## 三、Hash 路由实现

### 3.1 简单的 Hash 路由器

```javascript
class SimpleHashRouter {
  constructor() {
    this.routes = new Map()
    this.currentRoute = null
    this.init()
  }
  
  // 注册路由
  route(path, handler) {
    this.routes.set(path, handler)
    return this
  }
  
  // 初始化路由器
  init() {
    // 监听 hash 变化
    window.addEventListener('hashchange', () => {
      this.handleRoute()
    })
    
    // 监听页面加载
    window.addEventListener('load', () => {
      this.handleRoute()
    })
    
    // 处理初始路由
    this.handleRoute()
  }
  
  // 处理路由变化
  handleRoute() {
    const hash = this.getHash()
    const route = this.matchRoute(hash)
    
    if (route && route !== this.currentRoute) {
      this.currentRoute = route
      this.executeRoute(route, hash)
    }
  }
  
  // 获取当前 hash
  getHash() {
    return window.location.hash.slice(1) || '/'
  }
  
  // 匹配路由
  matchRoute(hash) {
    // 精确匹配
    if (this.routes.has(hash)) {
      return hash
    }
    
    // 参数匹配
    for (const [route, handler] of this.routes) {
      const params = this.extractParams(route, hash)
      if (params) {
        return { route, params, handler }
      }
    }
    
    return null
  }
  
  // 提取参数
  extractParams(pattern, hash) {
    const patternSegments = pattern.split('/')
    const hashSegments = hash.split('/')
    
    if (patternSegments.length !== hashSegments.length) {
      return null
    }
    
    const params = {}
    
    for (let i = 0; i < patternSegments.length; i++) {
      const patternSegment = patternSegments[i]
      const hashSegment = hashSegments[i]
      
      if (patternSegment.startsWith(':')) {
        // 参数段
        const paramName = patternSegment.slice(1)
        params[paramName] = hashSegment
      } else if (patternSegment !== hashSegment) {
        // 静态段不匹配
        return null
      }
    }
    
    return params
  }
  
  // 执行路由处理器
  executeRoute(route, hash) {
    if (typeof route === 'string') {
      const handler = this.routes.get(route)
      handler()
    } else if (route.handler) {
      route.handler(route.params)
    }
  }
  
  // 导航到指定路径
  navigate(path) {
    window.location.hash = '#' + path
  }
  
  // 替换当前路径
  replace(path) {
    const url = window.location.href.replace(/#.*$/, '') + '#' + path
    window.location.replace(url)
  }
}

// 使用示例
const router = new SimpleHashRouter()

router
  .route('/', () => {
    console.log('首页')
    document.getElementById('app').innerHTML = '<h1>首页</h1>'
  })
  .route('/about', () => {
    console.log('关于页面')
    document.getElementById('app').innerHTML = '<h1>关于我们</h1>'
  })
  .route('/user/:id', (params) => {
    console.log('用户页面', params)
    document.getElementById('app').innerHTML = `<h1>用户: ${params.id}</h1>`
  })

// 编程式导航
router.navigate('/user/123')
```

### 3.2 高级 Hash 路由功能

```javascript
class AdvancedHashRouter extends SimpleHashRouter {
  constructor() {
    super()
    this.beforeHooks = []
    this.afterHooks = []
    this.history = []
    this.historyIndex = -1
  }
  
  // 添加前置守卫
  beforeEach(hook) {
    this.beforeHooks.push(hook)
  }
  
  // 添加后置钩子
  afterEach(hook) {
    this.afterHooks.push(hook)
  }
  
  // 重写路由处理
  async handleRoute() {
    const hash = this.getHash()
    const route = this.matchRoute(hash)
    
    if (!route) return
    
    const to = { path: hash, route }
    const from = this.currentRoute ? { path: this.currentRoute } : { path: '' }
    
    // 执行前置守卫
    for (const hook of this.beforeHooks) {
      const result = await hook(to, from)
      if (result === false) {
        return // 取消导航
      }
      if (typeof result === 'string') {
        this.navigate(result)
        return // 重定向
      }
    }
    
    // 执行路由
    this.currentRoute = hash
    this.executeRoute(route, hash)
    
    // 更新历史记录
    this.updateHistory(hash)
    
    // 执行后置钩子
    this.afterHooks.forEach(hook => hook(to, from))
  }
  
  // 更新历史记录
  updateHistory(path) {
    // 移除当前位置之后的历史记录
    this.history = this.history.slice(0, this.historyIndex + 1)
    
    // 添加新记录
    this.history.push(path)
    this.historyIndex = this.history.length - 1
  }
  
  // 后退
  back() {
    if (this.historyIndex > 0) {
      this.historyIndex--
      const path = this.history[this.historyIndex]
      this.replace(path)
    }
  }
  
  // 前进
  forward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      const path = this.history[this.historyIndex]
      this.replace(path)
    }
  }
  
  // 获取历史记录
  getHistory() {
    return {
      current: this.historyIndex,
      total: this.history.length,
      history: [...this.history]
    }
  }
}

// 使用高级功能
const advancedRouter = new AdvancedHashRouter()

// 添加导航守卫
advancedRouter.beforeEach((to, from) => {
  console.log(`导航: ${from.path} -> ${to.path}`)
  
  // 权限检查示例
  if (to.path.startsWith('/admin') && !isAdmin()) {
    return '/login' // 重定向到登录页
  }
})

advancedRouter.afterEach((to, from) => {
  console.log('导航完成')
  updatePageTitle(to.path)
})
```

## 四、Hash 模式优化

### 4.1 URL 美化

```javascript
// Hash URL 美化处理
class HashURLBeautifier {
  constructor() {
    this.baseTitle = document.title
  }
  
  // 格式化显示URL（去掉#号显示）
  getDisplayURL() {
    const hash = window.location.hash.slice(1)
    const origin = window.location.origin
    return origin + hash
  }
  
  // 更新浏览器地址栏显示（仅视觉效果）
  updateAddressBarDisplay() {
    // 注意：这只能改变页面标题，不能改变地址栏
    const path = window.location.hash.slice(1) || '/'
    const displayURL = this.getDisplayURL()
    
    // 更新页面标题包含路径信息
    document.title = `${this.getPageTitle(path)} - ${this.baseTitle}`
    
    // 在页面中显示美化的URL
    this.updateURLDisplay(displayURL)
  }
  
  getPageTitle(path) {
    const titles = {
      '/': '首页',
      '/about': '关于我们',
      '/contact': '联系我们'
    }
    
    return titles[path] || '页面'
  }
  
  updateURLDisplay(url) {
    const urlDisplay = document.getElementById('url-display')
    if (urlDisplay) {
      urlDisplay.textContent = url
    }
  }
}

// 使用URL美化器
const beautifier = new HashURLBeautifier()

// 在路由变化时更新显示
window.addEventListener('hashchange', () => {
  beautifier.updateAddressBarDisplay()
})
```

### 4.2 Hash 模式性能优化

```javascript
class OptimizedHashRouter extends AdvancedHashRouter {
  constructor() {
    super()
    this.routeCache = new Map()
    this.debounceTime = 50
    this.debouncedHandler = this.debounce(this.handleRoute.bind(this), this.debounceTime)
  }
  
  // 防抖处理
  debounce(func, delay) {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
  }
  
  // 重写事件监听，使用防抖
  init() {
    window.addEventListener('hashchange', this.debouncedHandler)
    window.addEventListener('load', () => this.handleRoute())
    this.handleRoute()
  }
  
  // 路由缓存
  matchRoute(hash) {
    // 检查缓存
    if (this.routeCache.has(hash)) {
      return this.routeCache.get(hash)
    }
    
    // 执行匹配
    const result = super.matchRoute(hash)
    
    // 缓存结果
    if (result) {
      this.routeCache.set(hash, result)
      
      // 限制缓存大小
      if (this.routeCache.size > 100) {
        const firstKey = this.routeCache.keys().next().value
        this.routeCache.delete(firstKey)
      }
    }
    
    return result
  }
  
  // 预加载路由组件
  preloadRoute(path) {
    const route = this.matchRoute(path)
    if (route && route.handler && route.handler.preload) {
      route.handler.preload()
    }
  }
  
  // 批量预加载
  preloadRoutes(paths) {
    paths.forEach(path => {
      setTimeout(() => this.preloadRoute(path), 0)
    })
  }
}

// 使用优化后的路由器
const optimizedRouter = new OptimizedHashRouter()

// 预加载常用路由
optimizedRouter.preloadRoutes(['/about', '/contact', '/user/profile'])
```

### 4.3 Hash 模式调试工具

```javascript
class HashRouterDebugger {
  constructor(router) {
    this.router = router
    this.enabled = localStorage.getItem('hash-router-debug') === 'true'
    this.logs = []
    
    if (this.enabled) {
      this.setupDebugTools()
    }
  }
  
  enable() {
    this.enabled = true
    localStorage.setItem('hash-router-debug', 'true')
    this.setupDebugTools()
  }
  
  disable() {
    this.enabled = false
    localStorage.removeItem('hash-router-debug')
  }
  
  setupDebugTools() {
    // 监听所有 hash 变化
    window.addEventListener('hashchange', (e) => {
      this.log('Hash Change', {
        from: new URL(e.oldURL).hash,
        to: new URL(e.newURL).hash,
        timestamp: new Date().toISOString()
      })
    })
    
    // 添加全局调试方法
    window.hashRouterDebug = {
      logs: () => this.logs,
      clearLogs: () => this.logs = [],
      currentRoute: () => window.location.hash,
      navigate: (path) => this.router.navigate(path),
      history: () => this.router.getHistory?.() || '历史功能不可用'
    }
    
    // 在控制台显示调试信息
    console.log('🔧 Hash Router 调试工具已启用')
    console.log('使用 window.hashRouterDebug 访问调试方法')
  }
  
  log(event, data) {
    if (!this.enabled) return
    
    const logEntry = {
      event,
      data,
      timestamp: Date.now(),
      url: window.location.href
    }
    
    this.logs.push(logEntry)
    console.log(`[HashRouter] ${event}:`, data)
    
    // 保持日志数量限制
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(-400)
    }
  }
  
  generateReport() {
    const report = {
      totalNavigations: this.logs.length,
      currentHash: window.location.hash,
      mostVisitedRoutes: this.getMostVisitedRoutes(),
      navigationTiming: this.getNavigationTiming(),
      errors: this.logs.filter(log => log.event === 'Error')
    }
    
    console.table(report.mostVisitedRoutes)
    return report
  }
  
  getMostVisitedRoutes() {
    const routeCounts = {}
    
    this.logs.forEach(log => {
      if (log.event === 'Hash Change' && log.data.to) {
        const route = log.data.to
        routeCounts[route] = (routeCounts[route] || 0) + 1
      }
    })
    
    return Object.entries(routeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([route, count]) => ({ route, count }))
  }
  
  getNavigationTiming() {
    const navigations = this.logs.filter(log => log.event === 'Hash Change')
    if (navigations.length < 2) return null
    
    const intervals = []
    for (let i = 1; i < navigations.length; i++) {
      intervals.push(navigations[i].timestamp - navigations[i-1].timestamp)
    }
    
    return {
      average: intervals.reduce((a, b) => a + b, 0) / intervals.length,
      min: Math.min(...intervals),
      max: Math.max(...intervals)
    }
  }
}

// 使用调试工具
const debugger = new HashRouterDebugger(router)

// 在开发环境中自动启用
if (process.env.NODE_ENV === 'development') {
  debugger.enable()
}
```

## 五、Hash 模式与 History 模式对比

### 5.1 功能对比

| 特性 | Hash 模式 | History 模式 |
|------|-----------|--------------|
| URL 格式 | `/#/path` | `/path` |
| 服务器配置 | 无需配置 | 需要配置 fallback |
| 浏览器兼容性 | IE8+ | IE10+ |
| SEO 友好 | 较差 | 良好 |
| 社交分享 | 支持 | 支持 |
| 刷新页面 | 正常工作 | 需要服务器支持 |

### 5.2 迁移指南

```javascript
// 从 Hash 模式迁移到 History 模式
const migrateFromHash = () => {
  // 1. 更改路由器配置
  const router = createRouter({
    // history: createWebHashHistory(), // 旧配置
    history: createWebHistory(),        // 新配置
    routes
  })
  
  // 2. 处理现有的 Hash URL
  const handleLegacyHashUrls = () => {
    const hash = window.location.hash
    if (hash.startsWith('#/')) {
      const path = hash.slice(1)
      window.location.replace(path)
    }
  }
  
  // 3. 配置服务器重定向
  // nginx.conf:
  // try_files $uri $uri/ /index.html;
  
  return router
}

// 支持两种模式共存的路由器
const createUniversalRouter = () => {
  const isHashMode = window.location.hash.length > 0
  
  return createRouter({
    history: isHashMode ? createWebHashHistory() : createWebHistory(),
    routes
  })
}
```

## 六、最佳实践

### 6.1 何时使用 Hash 模式

```javascript
// ✅ 适合使用 Hash 模式的场景
const hashModeScenarios = {
  // 1. 静态托管环境
  staticHosting: ['GitHub Pages', 'Netlify', 'Vercel'],
  
  // 2. 无法控制服务器配置
  limitedServerControl: ['共享主机', '企业内部系统'],
  
  // 3. 需要支持旧浏览器
  legacyBrowserSupport: ['IE8+', '企业内网'],
  
  // 4. 原型和演示项目
  prototyping: ['快速原型', 'Demo 项目', '概念验证'],
  
  // 5. 嵌入式应用
  embeddedApps: ['iframe 应用', '第三方集成']
}

// ❌ 不建议使用 Hash 模式的场景
const avoidHashModeScenarios = {
  seoImportant: 'SEO 是关键要求的网站',
  publicWebsite: '面向公众的营销网站',
  ecommerce: '电子商务网站',
  blog: '博客和内容网站',
  corporateWebsite: '企业官方网站'
}
```

### 6.2 Hash 模式优化建议

```javascript
// Hash 模式优化清单
const hashModeOptimizations = {
  // 1. URL 管理
  urlManagement: {
    removeHashFromDisplay: '在 UI 中隐藏 # 符号',
    canonicalUrls: '设置规范URL',
    socialMetaTags: '配置社交媒体meta标签'
  },
  
  // 2. SEO 优化
  seoOptimization: {
    googleAnalytics: '配置 GA 跟踪 hash 变化',
    sitemap: '生成包含 hash URL 的站点地图',
    metaTags: '动态更新 meta 标签',
    structuredData: '添加结构化数据'
  },
  
  // 3. 性能优化  
  performance: {
    lazyLoading: '路由组件懒加载',
    preloading: '预加载关键路由',
    caching: '路由匹配结果缓存',
    debouncing: '防抖处理快速导航'
  },
  
  // 4. 用户体验
  userExperience: {
    loadingStates: '显示加载状态',
    errorHandling: '优雅的错误处理',
    backButton: '正确处理浏览器后退',
    bookmarking: '支持书签功能'
  }
}
```

## 七、总结

| 优势 | 劣势 |
|------|------|
| 无需服务器配置 | URL 不够美观 |
| 浏览器兼容性好 | SEO 支持有限 |
| 实现简单 | 社交分享限制 |
| 静态部署友好 | 专业度感知较低 |
| 调试容易 | 某些功能限制 |

## 参考资料

- [HTML5 History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [Vue Router History Mode](https://router.vuejs.org/guide/essentials/history-mode.html)

---

**下一节** → [第 21 节：History 模式](./21-history-mode.md)
