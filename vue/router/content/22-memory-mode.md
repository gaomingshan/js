# 第 22 节：Memory 模式

## 概述

Memory 模式将路由历史保存在内存中，不依赖浏览器的 URL 或历史 API。这种模式主要用于服务端渲染（SSR）、测试环境和 Node.js 环境中。

## 一、Memory 模式基础

### 1.1 创建 Memory 模式路由

```javascript
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: User }
  ]
})

// 指定初始路径
const routerWithInitial = createRouter({
  history: createMemoryHistory('/about'),
  routes: [...]
})
```

### 1.2 Memory 历史实现原理

```javascript
class MemoryHistory {
  constructor(base = '') {
    this.base = base
    this.stack = ['/']  // 历史栈
    this.index = 0      // 当前位置
    this.listeners = [] // 监听器
  }
  
  // 获取当前位置
  get location() {
    return this.stack[this.index]
  }
  
  // 添加监听器
  listen(callback) {
    this.listeners.push(callback)
    
    // 返回取消监听函数
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
  
  // 通知监听器
  notify(location, action) {
    this.listeners.forEach(callback => {
      callback({ location, action })
    })
  }
  
  // 推入新路径
  push(location) {
    // 移除当前位置之后的历史
    this.stack = this.stack.slice(0, this.index + 1)
    
    // 添加新位置
    this.stack.push(location)
    this.index = this.stack.length - 1
    
    this.notify(location, 'PUSH')
  }
  
  // 替换当前路径
  replace(location) {
    this.stack[this.index] = location
    this.notify(location, 'REPLACE')
  }
  
  // 前进/后退
  go(delta) {
    const newIndex = this.index + delta
    
    if (newIndex >= 0 && newIndex < this.stack.length) {
      this.index = newIndex
      this.notify(this.stack[newIndex], 'POP')
    }
  }
  
  back() {
    this.go(-1)
  }
  
  forward() {
    this.go(1)
  }
  
  // 获取历史信息
  getState() {
    return {
      current: this.index,
      total: this.stack.length,
      stack: [...this.stack]
    }
  }
}
```

## 二、SSR 中的 Memory 模式

### 2.1 服务端渲染配置

```javascript
// server.js - 服务端配置
import { createSSRApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { renderToString } from 'vue/server-renderer'

const createApp = (url) => {
  const app = createSSRApp(App)
  
  // 为每个请求创建新的路由实例
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })
  
  app.use(router)
  
  return { app, router }
}

// 处理 SSR 请求
app.get('*', async (req, res) => {
  const { app, router } = createApp()
  
  try {
    // 推入请求的 URL
    await router.push(req.originalUrl)
    
    // 等待路由解析完成
    await router.isReady()
    
    // 渲染应用
    const html = await renderToString(app)
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>My App</title>
        </head>
        <body>
          <div id="app">${html}</div>
          <script src="/client.js"></script>
        </body>
      </html>
    `)
  } catch (error) {
    console.error('SSR Error:', error)
    res.status(500).send('Internal Server Error')
  }
})
```

### 2.2 客户端水合

```javascript
// client.js - 客户端配置
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

// 客户端使用 History 模式
const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)

// 等待路由准备就绪后挂载
router.isReady().then(() => {
  app.mount('#app')
})
```

### 2.3 同构路由状态

```javascript
// 服务端和客户端共享路由状态
class IsomorphicRouter {
  constructor(isServer = false) {
    this.isServer = isServer
    this.router = this.createRouter()
  }
  
  createRouter() {
    const history = this.isServer 
      ? createMemoryHistory()
      : createWebHistory()
      
    return createRouter({
      history,
      routes: this.getRoutes()
    })
  }
  
  getRoutes() {
    return [
      {
        path: '/',
        component: () => this.loadComponent('Home')
      },
      {
        path: '/user/:id',
        component: () => this.loadComponent('User')
      }
    ]
  }
  
  loadComponent(name) {
    if (this.isServer) {
      // 服务端同步加载
      return require(`@/components/${name}.vue`).default
    } else {
      // 客户端异步加载
      return import(`@/components/${name}.vue`)
    }
  }
  
  async navigate(url) {
    if (this.isServer) {
      await this.router.push(url)
      await this.router.isReady()
    } else {
      return this.router.push(url)
    }
  }
  
  getState() {
    return {
      currentRoute: this.router.currentRoute.value,
      history: this.isServer ? this.router.options.history.getState() : null
    }
  }
}

// 使用同构路由
const isServer = typeof window === 'undefined'
const routerManager = new IsomorphicRouter(isServer)
```

## 三、测试环境应用

### 3.1 单元测试配置

```javascript
// router.test.js
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '@/App.vue'

describe('Router Tests', () => {
  let router
  
  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/about', component: { template: '<div>About</div>' } }
      ]
    })
  })
  
  test('路由导航', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })
    
    // 导航到 about 页面
    await router.push('/about')
    await wrapper.vm.$nextTick()
    
    expect(router.currentRoute.value.path).toBe('/about')
    expect(wrapper.text()).toContain('About')
  })
  
  test('路由参数', async () => {
    router.addRoute({
      path: '/user/:id',
      component: {
        template: '<div>User: {{ $route.params.id }}</div>'
      }
    })
    
    const wrapper = mount(App, {
      global: { plugins: [router] }
    })
    
    await router.push('/user/123')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('User: 123')
  })
  
  test('路由守卫', async () => {
    const mockGuard = jest.fn()
    
    router.beforeEach(mockGuard)
    
    await router.push('/about')
    
    expect(mockGuard).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/about' }),
      expect.objectContaining({ path: '/' }),
      expect.any(Function)
    )
  })
})
```

### 3.2 集成测试工具

```javascript
class RouterTestUtils {
  constructor(routes) {
    this.router = createRouter({
      history: createMemoryHistory(),
      routes
    })
    this.navigationHistory = []
  }
  
  // 创建测试实例
  createWrapper(component, options = {}) {
    return mount(component, {
      global: {
        plugins: [this.router],
        ...options.global
      },
      ...options
    })
  }
  
  // 导航并等待完成
  async navigateTo(path, waitForComponents = true) {
    const startTime = Date.now()
    
    await this.router.push(path)
    
    if (waitForComponents) {
      await this.router.isReady()
    }
    
    const endTime = Date.now()
    
    this.navigationHistory.push({
      path,
      duration: endTime - startTime,
      timestamp: new Date().toISOString()
    })
    
    return this.router.currentRoute.value
  }
  
  // 模拟浏览器后退
  async goBack() {
    this.router.back()
    await this.router.isReady()
    return this.router.currentRoute.value
  }
  
  // 模拟浏览器前进
  async goForward() {
    this.router.forward()
    await this.router.isReady()
    return this.router.currentRoute.value
  }
  
  // 获取当前路由状态
  getCurrentRoute() {
    return this.router.currentRoute.value
  }
  
  // 检查路由是否存在
  hasRoute(name) {
    return this.router.hasRoute(name)
  }
  
  // 获取导航历史
  getNavigationHistory() {
    return [...this.navigationHistory]
  }
  
  // 清理
  destroy() {
    this.router = null
    this.navigationHistory = []
  }
}

// 使用测试工具
describe('E2E Router Tests', () => {
  let testUtils
  
  beforeEach(() => {
    testUtils = new RouterTestUtils(routes)
  })
  
  afterEach(() => {
    testUtils.destroy()
  })
  
  test('完整导航流程', async () => {
    // 导航到用户页面
    await testUtils.navigateTo('/user/123')
    expect(testUtils.getCurrentRoute().params.id).toBe('123')
    
    // 导航到设置页面
    await testUtils.navigateTo('/settings')
    expect(testUtils.getCurrentRoute().path).toBe('/settings')
    
    // 后退
    await testUtils.goBack()
    expect(testUtils.getCurrentRoute().path).toBe('/user/123')
    
    // 检查导航历史
    const history = testUtils.getNavigationHistory()
    expect(history).toHaveLength(2)
  })
})
```

## 四、Memory 模式的特殊用例

### 4.1 桌面应用 (Electron)

```javascript
// Electron 主进程
const { app, BrowserWindow } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  
  // 加载应用
  win.loadFile('dist/index.html')
}

app.whenReady().then(createWindow)

// Vue 应用中的路由配置
const isElectron = window && window.process && window.process.type

const router = createRouter({
  // Electron 中可以使用 Memory 模式避免文件协议问题
  history: isElectron ? createMemoryHistory() : createWebHistory(),
  routes
})
```

### 4.2 微前端架构

```javascript
// 微前端中的 Memory 模式路由
class MicrofrontendRouter {
  constructor(basePath) {
    this.basePath = basePath
    this.router = createRouter({
      history: createMemoryHistory(basePath),
      routes: this.getRoutes()
    })
    
    this.setupCommunication()
  }
  
  setupCommunication() {
    // 监听主应用的路由变化
    window.addEventListener('message', (event) => {
      if (event.data.type === 'ROUTE_CHANGE') {
        const { path } = event.data
        
        // 检查路径是否属于当前微应用
        if (path.startsWith(this.basePath)) {
          const relativePath = path.slice(this.basePath.length)
          this.router.push(relativePath)
        }
      }
    })
    
    // 向主应用报告路由变化
    this.router.afterEach((to, from) => {
      window.parent.postMessage({
        type: 'MICROFRONTEND_ROUTE_CHANGE',
        data: {
          microfrontend: this.basePath,
          path: to.path,
          fullPath: this.basePath + to.path
        }
      }, '*')
    })
  }
  
  getRoutes() {
    return [
      { path: '/', component: MicroHome },
      { path: '/feature1', component: Feature1 },
      { path: '/feature2', component: Feature2 }
    ]
  }
  
  mount(element) {
    const app = createApp(App)
    app.use(this.router)
    app.mount(element)
    
    return app
  }
  
  unmount() {
    // 清理资源
    if (this.app) {
      this.app.unmount()
    }
  }
}

// 使用微前端路由
const microRouter = new MicrofrontendRouter('/micro-app-1')
```

### 4.3 状态持久化

```javascript
// Memory 模式状态持久化
class PersistentMemoryHistory {
  constructor(storageKey = 'router-state') {
    this.storageKey = storageKey
    this.history = createMemoryHistory()
    this.loadState()
    this.setupPersistence()
  }
  
  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey)
      if (saved) {
        const state = JSON.parse(saved)
        
        // 恢复历史栈
        this.history.stack = state.stack || ['/']
        this.history.index = state.index || 0
      }
    } catch (error) {
      console.warn('Failed to load router state:', error)
    }
  }
  
  setupPersistence() {
    // 监听路由变化并保存状态
    this.history.listen(() => {
      this.saveState()
    })
    
    // 页面卸载时保存状态
    window.addEventListener('beforeunload', () => {
      this.saveState()
    })
  }
  
  saveState() {
    try {
      const state = {
        stack: this.history.stack,
        index: this.history.index,
        timestamp: Date.now()
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to save router state:', error)
    }
  }
  
  clearState() {
    localStorage.removeItem(this.storageKey)
  }
  
  getRouter() {
    return createRouter({
      history: this.history,
      routes
    })
  }
}

// 使用持久化 Memory 历史
const persistentHistory = new PersistentMemoryHistory()
const router = persistentHistory.getRouter()
```

## 五、调试和监控

### 5.1 Memory 模式调试工具

```javascript
class MemoryRouterDebugger {
  constructor(router) {
    this.router = router
    this.history = router.options.history
    this.logs = []
    this.setupDebugging()
  }
  
  setupDebugging() {
    // 监听所有导航
    this.history.listen(({ location, action }) => {
      this.log('Navigation', {
        action,
        location,
        state: this.getHistoryState()
      })
    })
    
    // 添加全局调试方法
    window.memoryRouterDebug = {
      getState: () => this.getHistoryState(),
      getLogs: () => this.logs,
      clearLogs: () => this.logs = [],
      navigate: (path) => this.router.push(path),
      back: () => this.router.back(),
      forward: () => this.router.forward()
    }
  }
  
  log(event, data) {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      data
    }
    
    this.logs.push(entry)
    console.log('[MemoryRouter]', event, data)
  }
  
  getHistoryState() {
    return {
      current: this.history.index,
      total: this.history.stack.length,
      stack: [...this.history.stack],
      location: this.history.location
    }
  }
  
  visualizeHistory() {
    const state = this.getHistoryState()
    
    console.group('Memory Router History')
    state.stack.forEach((path, index) => {
      const marker = index === state.current ? '→' : ' '
      console.log(`${marker} ${index}: ${path}`)
    })
    console.groupEnd()
  }
  
  generateReport() {
    return {
      totalNavigations: this.logs.length,
      historyState: this.getHistoryState(),
      navigationPatterns: this.analyzePatterns(),
      performance: this.getPerformanceMetrics()
    }
  }
  
  analyzePatterns() {
    const patterns = {}
    
    this.logs.forEach(log => {
      if (log.event === 'Navigation') {
        const pattern = log.data.action
        patterns[pattern] = (patterns[pattern] || 0) + 1
      }
    })
    
    return patterns
  }
  
  getPerformanceMetrics() {
    const navigations = this.logs.filter(log => log.event === 'Navigation')
    
    return {
      totalNavigations: navigations.length,
      averageHistorySize: this.logs.reduce((sum, log) => {
        return sum + (log.data.state?.total || 0)
      }, 0) / this.logs.length
    }
  }
}

// 启用调试
const debugger = new MemoryRouterDebugger(router)
```

## 六、最佳实践

### 6.1 使用场景选择

```javascript
// Memory 模式适用场景
const memoryModeScenarios = {
  recommended: [
    'SSR 服务端渲染',
    '单元测试和集成测试',
    'Node.js 环境',
    'Electron 桌面应用',
    '微前端子应用',
    'Web Workers 环境'
  ],
  
  notRecommended: [
    '常规 SPA 应用',
    'SEO 要求高的网站',
    '需要 URL 分享的应用',
    '需要浏览器历史的应用'
  ]
}

// 模式选择助手
class RouterModeSelector {
  static selectMode(requirements) {
    const {
      isSSR = false,
      isTesting = false,
      needsURL = true,
      needsHistory = true,
      isEmbedded = false,
      environment = 'browser'
    } = requirements
    
    if (isSSR || isTesting || environment === 'node') {
      return 'memory'
    }
    
    if (isEmbedded && !needsURL) {
      return 'memory'
    }
    
    if (needsURL && needsHistory) {
      return 'history'
    }
    
    return 'hash' // 默认备选
  }
  
  static createRouter(mode, routes, options = {}) {
    const histories = {
      memory: () => createMemoryHistory(options.base),
      history: () => createWebHistory(options.base),
      hash: () => createWebHashHistory(options.base)
    }
    
    return createRouter({
      history: histories[mode](),
      routes,
      ...options
    })
  }
}

// 使用示例
const requirements = {
  isSSR: typeof window === 'undefined',
  needsURL: true,
  needsHistory: true
}

const mode = RouterModeSelector.selectMode(requirements)
const router = RouterModeSelector.createRouter(mode, routes)
```

### 6.2 性能优化

```javascript
// Memory 模式性能优化
class OptimizedMemoryHistory {
  constructor(options = {}) {
    this.maxHistorySize = options.maxHistorySize || 50
    this.history = createMemoryHistory()
    this.setupOptimizations()
  }
  
  setupOptimizations() {
    // 限制历史栈大小
    const originalPush = this.history.push.bind(this.history)
    this.history.push = (location) => {
      originalPush(location)
      this.trimHistory()
    }
  }
  
  trimHistory() {
    if (this.history.stack.length > this.maxHistorySize) {
      // 保留最近的历史记录
      const keepCount = Math.floor(this.maxHistorySize * 0.8)
      const trimCount = this.history.stack.length - keepCount
      
      this.history.stack.splice(0, trimCount)
      this.history.index = Math.max(0, this.history.index - trimCount)
    }
  }
  
  getMemoryUsage() {
    return {
      stackSize: this.history.stack.length,
      maxSize: this.maxHistorySize,
      memoryEstimate: JSON.stringify(this.history.stack).length
    }
  }
}

// 使用优化的 Memory 历史
const optimizedHistory = new OptimizedMemoryHistory({ maxHistorySize: 30 })
const router = createRouter({
  history: optimizedHistory.history,
  routes
})
```

## 七、总结

| 特性 | Memory 模式 | 适用场景 |
|------|-------------|----------|
| URL 显示 | 无 | SSR、测试 |
| 历史管理 | 内存中 | 隔离环境 |
| 性能 | 优秀 | 无 DOM 操作 |
| 持久化 | 需要手动实现 | 临时状态 |
| 调试 | 容易控制 | 测试验证 |

## 参考资料

- [Memory History API](https://router.vuejs.org/api/#creatememoryhistory)
- [服务端渲染指南](https://vuejs.org/guide/scaling-up/ssr.html)

---

**下一节** → [第 23 节：路由状态](./23-route-state.md)
