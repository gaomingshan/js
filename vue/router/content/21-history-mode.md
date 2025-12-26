# 第 21 节：History 模式

## 概述

History 模式使用 HTML5 History API 来管理路由，生成干净的 URL，无需 hash 符号。这种模式提供更好的用户体验和 SEO 支持，但需要服务器配置支持。

## 一、History 模式基础

### 1.1 工作原理

```javascript
// History 模式 URL 格式
// https://example.com/home
// https://example.com/user/123
// https://example.com/products?category=electronics

// 与 Hash 模式对比
const urlComparison = {
  hash: 'https://example.com/#/user/123',
  history: 'https://example.com/user/123'  // 更干净
}
```

### 1.2 创建 History 模式路由

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: User }
  ]
})

// 可以指定 base URL
const routerWithBase = createRouter({
  history: createWebHistory('/my-app/'),
  routes: [...]
})
// 生成的 URL: /my-app/home, /my-app/user/123
```

### 1.3 History API 核心方法

```javascript
// HTML5 History API
const historyAPI = {
  // 添加新的历史记录
  pushState: (state, title, url) => {
    history.pushState(state, title, url)
  },
  
  // 替换当前历史记录
  replaceState: (state, title, url) => {
    history.replaceState(state, title, url)
  },
  
  // 前进/后退
  go: (delta) => {
    history.go(delta)  // -1: 后退, 1: 前进
  },
  
  back: () => history.back(),
  forward: () => history.forward()
}

// 监听历史变化
window.addEventListener('popstate', (event) => {
  console.log('History state:', event.state)
  console.log('Current URL:', window.location.pathname)
})
```

## 二、服务器配置

### 2.1 Nginx 配置

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.html;
    
    # History 模式核心配置
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 路由不应该 fallback 到 index.html
    location /api {
        try_files $uri $uri/ =404;
    }
    
    # 静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
```

### 2.2 Apache 配置

```apache
<VirtualHost *:80>
    DocumentRoot /var/www/html
    
    <Directory "/var/www/html">
        RewriteEngine On
        
        # 处理 History 模式路由
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # 排除 API 路由
    <LocationMatch "^/api">
        RewriteEngine Off
    </LocationMatch>
</VirtualHost>
```

### 2.3 Node.js 服务器配置

```javascript
// Express.js 配置
const express = require('express')
const path = require('path')
const app = express()

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')))

// API 路由
app.use('/api', require('./routes/api'))

// History 模式 fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.listen(3000)
```

## 三、History 路由实现

### 3.1 基本 History 路由器

```javascript
class HistoryRouter {
  constructor(base = '') {
    this.base = base
    this.routes = new Map()
    this.currentRoute = null
    this.init()
  }
  
  init() {
    // 监听 popstate 事件（浏览器前进/后退）
    window.addEventListener('popstate', (event) => {
      this.handleRoute(window.location.pathname, event.state)
    })
    
    // 处理初始路由
    this.handleRoute(window.location.pathname)
  }
  
  route(path, handler) {
    this.routes.set(path, handler)
    return this
  }
  
  push(path, state = null) {
    const fullPath = this.base + path
    history.pushState(state, '', fullPath)
    this.handleRoute(path, state)
  }
  
  replace(path, state = null) {
    const fullPath = this.base + path
    history.replaceState(state, '', fullPath)
    this.handleRoute(path, state)
  }
  
  handleRoute(path, state = null) {
    // 移除 base 前缀
    const routePath = path.startsWith(this.base) 
      ? path.slice(this.base.length) 
      : path
    
    const route = this.matchRoute(routePath)
    
    if (route && route !== this.currentRoute) {
      this.currentRoute = routePath
      this.executeRoute(route, routePath, state)
    }
  }
  
  matchRoute(path) {
    // 精确匹配
    if (this.routes.has(path)) {
      return path
    }
    
    // 参数匹配
    for (const [pattern, handler] of this.routes) {
      const params = this.extractParams(pattern, path)
      if (params) {
        return { pattern, params, handler }
      }
    }
    
    return null
  }
  
  extractParams(pattern, path) {
    const patternParts = pattern.split('/')
    const pathParts = path.split('/')
    
    if (patternParts.length !== pathParts.length) {
      return null
    }
    
    const params = {}
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i]
      const pathPart = pathParts[i]
      
      if (patternPart.startsWith(':')) {
        params[patternPart.slice(1)] = pathPart
      } else if (patternPart !== pathPart) {
        return null
      }
    }
    
    return params
  }
  
  executeRoute(route, path, state) {
    if (typeof route === 'string') {
      const handler = this.routes.get(route)
      handler({ path, state })
    } else if (route.handler) {
      route.handler({ path, params: route.params, state })
    }
  }
}

// 使用示例
const router = new HistoryRouter('/my-app')

router
  .route('/', ({ path, state }) => {
    console.log('首页', { path, state })
  })
  .route('/user/:id', ({ path, params, state }) => {
    console.log('用户页面', { path, params, state })
  })

// 导航
router.push('/user/123', { from: 'home' })
```

### 3.2 高级 History 功能

```javascript
class AdvancedHistoryRouter extends HistoryRouter {
  constructor(base = '') {
    super(base)
    this.guards = []
    this.hooks = []
    this.scrollPositions = new Map()
  }
  
  // 添加导航守卫
  beforeEach(guard) {
    this.guards.push(guard)
  }
  
  // 添加后置钩子
  afterEach(hook) {
    this.hooks.push(hook)
  }
  
  async handleRoute(path, state = null) {
    const routePath = path.startsWith(this.base) 
      ? path.slice(this.base.length) 
      : path
      
    const route = this.matchRoute(routePath)
    if (!route) return
    
    const to = { path: routePath, route, state }
    const from = { path: this.currentRoute }
    
    // 执行导航守卫
    for (const guard of this.guards) {
      const result = await guard(to, from)
      if (result === false) {
        // 取消导航，恢复URL
        this.revertNavigation(from.path)
        return
      }
      if (typeof result === 'string') {
        // 重定向
        this.replace(result)
        return
      }
    }
    
    // 保存滚动位置
    if (this.currentRoute) {
      this.saveScrollPosition(this.currentRoute)
    }
    
    // 执行路由
    this.currentRoute = routePath
    this.executeRoute(route, routePath, state)
    
    // 恢复滚动位置
    this.restoreScrollPosition(routePath)
    
    // 执行后置钩子
    this.hooks.forEach(hook => hook(to, from))
  }
  
  revertNavigation(path) {
    const fullPath = this.base + (path || '/')
    history.replaceState(null, '', fullPath)
  }
  
  saveScrollPosition(path) {
    this.scrollPositions.set(path, {
      x: window.scrollX,
      y: window.scrollY
    })
  }
  
  restoreScrollPosition(path) {
    const position = this.scrollPositions.get(path)
    if (position) {
      window.scrollTo(position.x, position.y)
    } else {
      window.scrollTo(0, 0)
    }
  }
  
  // 获取历史状态
  getState() {
    return history.state
  }
  
  // 设置状态
  setState(state) {
    const currentUrl = window.location.pathname
    history.replaceState(state, '', currentUrl)
  }
}
```

## 四、History 模式挑战

### 4.1 刷新页面问题

```javascript
// 问题：直接访问 /user/123 会向服务器请求该路径
// 解决方案：服务器配置 fallback 到 index.html

// 检测直接访问vs路由导航
class DirectAccessDetector {
  constructor() {
    this.isDirectAccess = !window.performance.navigation || 
                         window.performance.navigation.type === 1
  }
  
  handleDirectAccess() {
    if (this.isDirectAccess) {
      console.log('直接访问或刷新页面')
      
      // 可以显示加载状态
      this.showInitialLoading()
      
      // 验证URL有效性
      this.validateCurrentUrl()
    }
  }
  
  showInitialLoading() {
    const loader = document.createElement('div')
    loader.className = 'initial-loader'
    loader.innerHTML = '正在加载...'
    document.body.appendChild(loader)
    
    // 路由加载完成后移除
    setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader)
      }
    }, 500)
  }
  
  async validateCurrentUrl() {
    const currentPath = window.location.pathname
    
    // 检查路径是否有效
    const isValidRoute = await this.checkRouteExists(currentPath)
    
    if (!isValidRoute) {
      // 重定向到 404 页面
      window.location.replace('/404')
    }
  }
  
  async checkRouteExists(path) {
    // 实现路由验证逻辑
    return true
  }
}

const detector = new DirectAccessDetector()
detector.handleDirectAccess()
```

### 4.2 SEO 优化

```javascript
// History 模式 SEO 优化
class HistorySEOManager {
  constructor(router) {
    this.router = router
    this.baseTitle = document.title
    this.setupSEO()
  }
  
  setupSEO() {
    // 监听路由变化
    this.router.afterEach((to, from) => {
      this.updateSEOTags(to)
      this.trackPageView(to)
    })
  }
  
  updateSEOTags(route) {
    // 更新页面标题
    const title = this.getPageTitle(route)
    document.title = title
    
    // 更新 meta 标签
    this.updateMetaTag('description', route.meta?.description)
    this.updateMetaTag('keywords', route.meta?.keywords)
    
    // 更新 Open Graph 标签
    this.updateOGTags(route, title)
    
    // 更新结构化数据
    this.updateStructuredData(route)
  }
  
  getPageTitle(route) {
    if (route.meta?.title) {
      return `${route.meta.title} - ${this.baseTitle}`
    }
    return this.baseTitle
  }
  
  updateMetaTag(name, content) {
    if (!content) return
    
    let meta = document.querySelector(`meta[name="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = name
      document.head.appendChild(meta)
    }
    meta.content = content
  }
  
  updateOGTags(route, title) {
    const ogTags = {
      'og:title': title,
      'og:description': route.meta?.description,
      'og:url': window.location.href,
      'og:type': route.meta?.type || 'website'
    }
    
    Object.entries(ogTags).forEach(([property, content]) => {
      if (content) {
        this.updateMetaProperty(property, content)
      }
    })
  }
  
  updateMetaProperty(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('property', property)
      document.head.appendChild(meta)
    }
    meta.content = content
  }
  
  updateStructuredData(route) {
    if (route.meta?.structuredData) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(route.meta.structuredData)
      
      // 移除旧的结构化数据
      const oldScript = document.querySelector('script[type="application/ld+json"]')
      if (oldScript) {
        document.head.removeChild(oldScript)
      }
      
      document.head.appendChild(script)
    }
  }
  
  trackPageView(route) {
    // Google Analytics
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: route.path,
        page_title: route.meta?.title
      })
    }
    
    // 其他分析工具
    if (window.analytics) {
      window.analytics.page(route.path)
    }
  }
}

// 使用 SEO 管理器
const seoManager = new HistorySEOManager(router)
```

## 五、History 模式最佳实践

### 5.1 生产环境配置

```javascript
// 生产环境 History 模式配置清单
const productionChecklist = {
  server: {
    nginx: '配置 try_files 规则',
    apache: '配置 .htaccess 重写规则',
    express: '配置 fallback 中间件',
    cdn: '确保 CDN 支持 SPA 路由'
  },
  
  application: {
    baseUrl: '设置正确的 base URL',
    publicPath: '配置正确的 public path',
    errorHandling: '处理 404 和服务器错误',
    seo: '配置 meta 标签和结构化数据'
  },
  
  monitoring: {
    analytics: '设置页面访问跟踪',
    errors: '监控路由相关错误',
    performance: '监控页面加载性能'
  }
}

// 环境检测和配置
class EnvironmentConfig {
  constructor() {
    this.environment = this.detectEnvironment()
    this.config = this.getConfig()
  }
  
  detectEnvironment() {
    if (process.env.NODE_ENV === 'production') return 'production'
    if (process.env.NODE_ENV === 'development') return 'development'
    return 'production' // 默认为生产环境
  }
  
  getConfig() {
    const configs = {
      development: {
        base: '/',
        strict: false,
        debug: true
      },
      production: {
        base: process.env.VUE_APP_BASE_URL || '/',
        strict: true,
        debug: false
      }
    }
    
    return configs[this.environment]
  }
  
  createRouter(routes) {
    return createRouter({
      history: createWebHistory(this.config.base),
      routes,
      strict: this.config.strict
    })
  }
}

const envConfig = new EnvironmentConfig()
const router = envConfig.createRouter(routes)
```

### 5.2 错误处理

```javascript
// History 模式错误处理
class HistoryErrorHandler {
  constructor(router) {
    this.router = router
    this.setupErrorHandling()
  }
  
  setupErrorHandling() {
    // 处理导航错误
    this.router.onError((error) => {
      console.error('路由错误:', error)
      this.handleRouteError(error)
    })
    
    // 处理未匹配路由
    this.router.beforeEach((to, from) => {
      if (to.matched.length === 0) {
        this.handleNotFound(to)
        return '/404'
      }
    })
    
    // 处理服务器错误
    window.addEventListener('error', (event) => {
      if (event.target === window && event.message.includes('404')) {
        this.handleServerError()
      }
    })
  }
  
  handleRouteError(error) {
    // 根据错误类型处理
    if (error.name === 'NavigationDuplicated') {
      // 重复导航，忽略
      return
    }
    
    if (error.name === 'NavigationAborted') {
      console.log('导航被中止')
      return
    }
    
    // 其他错误，显示错误页面
    this.showErrorPage(error)
  }
  
  handleNotFound(to) {
    console.log('404 页面:', to.path)
    
    // 记录 404 事件
    this.trackError('404', {
      path: to.path,
      referrer: document.referrer
    })
  }
  
  handleServerError() {
    console.error('服务器配置错误：History 模式需要服务器支持')
    
    // 显示配置帮助信息
    this.showServerConfigHelp()
  }
  
  showErrorPage(error) {
    // 显示用户友好的错误信息
    const errorPage = document.createElement('div')
    errorPage.innerHTML = `
      <div class="error-page">
        <h2>出错了</h2>
        <p>页面加载时发生了错误，请稍后重试。</p>
        <button onclick="window.location.reload()">重新加载</button>
      </div>
    `
    document.body.appendChild(errorPage)
  }
  
  showServerConfigHelp() {
    console.group('History 模式配置帮助')
    console.log('服务器需要配置 fallback 规则：')
    console.log('Nginx: try_files $uri $uri/ /index.html;')
    console.log('Apache: RewriteRule . /index.html [L]')
    console.groupEnd()
  }
  
  trackError(type, data) {
    // 错误上报
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `${type}: ${data.path}`,
        fatal: false
      })
    }
  }
}

const errorHandler = new HistoryErrorHandler(router)
```

## 六、总结

| 特性 | History 模式 | Hash 模式 |
|------|--------------|-----------|
| URL 格式 | `/path` | `/#/path` |
| SEO 友好 | ✅ 优秀 | ❌ 较差 |
| 服务器配置 | ❌ 需要 | ✅ 无需 |
| 浏览器支持 | IE10+ | IE8+ |
| 用户体验 | ✅ 更好 | ✅ 良好 |
| 部署复杂度 | ❌ 较高 | ✅ 简单 |

## 参考资料

- [HTML5 History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [Vue Router History Mode](https://router.vuejs.org/guide/essentials/history-mode.html)

---

**下一节** → [第 22 节：Memory 模式](./22-memory-mode.md)
