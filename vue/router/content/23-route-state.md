# 第 23 节：路由状态

## 概述

路由状态包括当前路由信息、历史状态、导航状态等，是构建响应式路由应用的重要组成部分。Vue Router 提供了完整的状态管理机制。

## 一、路由对象状态

### 1.1 $route 对象结构

```javascript
// 当前路由对象的完整结构
const $route = {
  path: '/user/123/posts',           // 当前路径
  name: 'UserPosts',                 // 路由名称
  params: { id: '123' },             // 路径参数
  query: { tab: 'recent', page: '1' }, // 查询参数
  hash: '#comments',                 // URL hash
  fullPath: '/user/123/posts?tab=recent&page=1#comments', // 完整路径
  matched: [                         // 匹配的路由记录
    { path: '/user/:id', component: UserLayout },
    { path: 'posts', component: UserPosts }
  ],
  meta: { requiresAuth: true },      // 路由元信息
  redirectedFrom: undefined          // 重定向来源
}
```

### 1.2 响应式路由状态

```vue
<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 响应式计算属性
const currentUser = computed(() => route.params.id)
const isProfilePage = computed(() => route.name === 'UserProfile')
const queryString = computed(() => {
  return new URLSearchParams(route.query).toString()
})

// 监听路由变化
watch(() => route.path, (newPath, oldPath) => {
  console.log(`路由变化: ${oldPath} → ${newPath}`)
})

watch(() => route.query, (newQuery, oldQuery) => {
  console.log('查询参数变化:', { oldQuery, newQuery })
}, { deep: true })

// 监听特定参数
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    loadUserData(newId)
  }
})
</script>
```

## 二、历史状态管理

### 2.1 History State API

```javascript
// 使用 history.state 存储自定义数据
class RouteStateManager {
  constructor(router) {
    this.router = router
    this.setupStateManagement()
  }
  
  // 带状态的导航
  pushWithState(to, state) {
    // 使用 history.pushState 存储状态
    const resolved = this.router.resolve(to)
    history.pushState(state, '', resolved.href)
    
    return this.router.push(to)
  }
  
  replaceWithState(to, state) {
    const resolved = this.router.resolve(to)
    history.replaceState(state, '', resolved.href)
    
    return this.router.replace(to)
  }
  
  // 获取当前历史状态
  getCurrentState() {
    return history.state
  }
  
  // 更新当前状态（不导航）
  updateState(newState) {
    const currentUrl = window.location.href
    const mergedState = { ...this.getCurrentState(), ...newState }
    history.replaceState(mergedState, '', currentUrl)
  }
  
  setupStateManagement() {
    // 监听 popstate 事件
    window.addEventListener('popstate', (event) => {
      const state = event.state
      console.log('历史状态变化:', state)
      
      // 可以在这里处理状态恢复逻辑
      if (state) {
        this.restoreState(state)
      }
    })
  }
  
  restoreState(state) {
    // 恢复页面状态的逻辑
    if (state.scrollPosition) {
      window.scrollTo(state.scrollPosition.x, state.scrollPosition.y)
    }
    
    if (state.formData) {
      this.restoreFormData(state.formData)
    }
  }
  
  // 保存页面状态
  savePageState() {
    const state = {
      timestamp: Date.now(),
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY
      },
      formData: this.collectFormData(),
      userState: this.getUserState()
    }
    
    this.updateState(state)
  }
  
  collectFormData() {
    const forms = document.querySelectorAll('form')
    const formData = {}
    
    forms.forEach((form, index) => {
      const data = new FormData(form)
      formData[`form_${index}`] = Object.fromEntries(data)
    })
    
    return formData
  }
  
  getUserState() {
    // 收集用户相关状态
    return {
      preferences: localStorage.getItem('userPreferences'),
      theme: document.body.getAttribute('data-theme')
    }
  }
}

// 使用状态管理器
const stateManager = new RouteStateManager(router)

// 带状态导航
stateManager.pushWithState('/user/123', {
  source: 'search',
  timestamp: Date.now()
})
```

### 2.2 滚动位置管理

```javascript
// 滚动位置状态管理
class ScrollStateManager {
  constructor(router) {
    this.router = router
    this.scrollPositions = new Map()
    this.setupScrollManagement()
  }
  
  setupScrollManagement() {
    // 路由离开前保存滚动位置
    this.router.beforeEach((to, from) => {
      if (from.path) {
        this.saveScrollPosition(from.path)
      }
    })
    
    // 路由完成后恢复滚动位置
    this.router.afterEach((to, from) => {
      this.$nextTick(() => {
        this.restoreScrollPosition(to.path, to.hash)
      })
    })
  }
  
  saveScrollPosition(path) {
    this.scrollPositions.set(path, {
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now()
    })
  }
  
  restoreScrollPosition(path, hash) {
    if (hash) {
      // 滚动到锚点
      const element = document.querySelector(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    
    // 恢复之前的滚动位置
    const savedPosition = this.scrollPositions.get(path)
    if (savedPosition) {
      window.scrollTo({
        left: savedPosition.x,
        top: savedPosition.y,
        behavior: 'smooth'
      })
    } else {
      // 新页面滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  // 自定义滚动行为
  setCustomScrollBehavior(path, behavior) {
    this.router.options.scrollBehavior = (to, from, savedPosition) => {
      if (to.path === path) {
        return behavior(to, from, savedPosition)
      }
      
      // 默认行为
      return savedPosition || { left: 0, top: 0 }
    }
  }
}

// 使用滚动管理器
const scrollManager = new ScrollStateManager(router)

// 自定义特定路由的滚动行为
scrollManager.setCustomScrollBehavior('/long-list', (to, from, savedPosition) => {
  if (to.query.page) {
    // 分页时保持滚动位置
    return savedPosition
  }
  return { top: 0 }
})
```

## 三、导航状态

### 3.1 导航进度追踪

```javascript
// 导航状态追踪器
class NavigationTracker {
  constructor(router) {
    this.router = router
    this.isNavigating = false
    this.navigationQueue = []
    this.currentNavigation = null
    this.setupTracking()
  }
  
  setupTracking() {
    // 开始导航
    this.router.beforeEach((to, from) => {
      this.startNavigation(to, from)
    })
    
    // 导航完成
    this.router.afterEach((to, from, failure) => {
      this.completeNavigation(to, from, failure)
    })
    
    // 导航错误
    this.router.onError((error) => {
      this.handleNavigationError(error)
    })
  }
  
  startNavigation(to, from) {
    const navigation = {
      id: this.generateNavigationId(),
      to: { ...to },
      from: { ...from },
      startTime: performance.now(),
      status: 'pending'
    }
    
    this.currentNavigation = navigation
    this.isNavigating = true
    this.navigationQueue.push(navigation)
    
    // 触发导航开始事件
    this.emit('navigationStart', navigation)
  }
  
  completeNavigation(to, from, failure) {
    if (!this.currentNavigation) return
    
    const navigation = this.currentNavigation
    navigation.endTime = performance.now()
    navigation.duration = navigation.endTime - navigation.startTime
    navigation.status = failure ? 'failed' : 'completed'
    navigation.failure = failure
    
    this.isNavigating = false
    this.currentNavigation = null
    
    // 触发导航完成事件
    this.emit('navigationComplete', navigation)
    
    // 清理旧的导航记录
    this.cleanupNavigationHistory()
  }
  
  handleNavigationError(error) {
    if (this.currentNavigation) {
      this.currentNavigation.status = 'error'
      this.currentNavigation.error = error
    }
    
    this.isNavigating = false
    this.emit('navigationError', { error, navigation: this.currentNavigation })
  }
  
  generateNavigationId() {
    return `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  cleanupNavigationHistory() {
    // 只保留最近100条导航记录
    if (this.navigationQueue.length > 100) {
      this.navigationQueue = this.navigationQueue.slice(-50)
    }
  }
  
  // 获取导航统计
  getNavigationStats() {
    const completed = this.navigationQueue.filter(nav => nav.status === 'completed')
    const failed = this.navigationQueue.filter(nav => nav.status === 'failed')
    
    const durations = completed.map(nav => nav.duration).filter(Boolean)
    const averageDuration = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0
    
    return {
      total: this.navigationQueue.length,
      completed: completed.length,
      failed: failed.length,
      averageDuration: Math.round(averageDuration),
      isCurrentlyNavigating: this.isNavigating
    }
  }
  
  // 事件发射器
  emit(event, data) {
    const customEvent = new CustomEvent(`router:${event}`, { detail: data })
    window.dispatchEvent(customEvent)
  }
}

// 使用导航追踪器
const tracker = new NavigationTracker(router)

// 监听导航事件
window.addEventListener('router:navigationStart', (event) => {
  console.log('导航开始:', event.detail)
  showLoadingIndicator()
})

window.addEventListener('router:navigationComplete', (event) => {
  console.log('导航完成:', event.detail)
  hideLoadingIndicator()
})
```

### 3.2 导航队列管理

```javascript
// 导航队列管理器
class NavigationQueueManager {
  constructor(router) {
    this.router = router
    this.queue = []
    this.isProcessing = false
    this.maxQueueSize = 10
    this.setupQueueManagement()
  }
  
  setupQueueManagement() {
    // 拦截路由导航
    const originalPush = this.router.push.bind(this.router)
    const originalReplace = this.router.replace.bind(this.router)
    
    this.router.push = (to) => {
      return this.enqueue('push', to, originalPush)
    }
    
    this.router.replace = (to) => {
      return this.enqueue('replace', to, originalReplace)
    }
  }
  
  async enqueue(method, to, originalMethod) {
    // 检查队列大小
    if (this.queue.length >= this.maxQueueSize) {
      console.warn('导航队列已满，丢弃最旧的请求')
      this.queue.shift()
    }
    
    const navigationTask = {
      id: this.generateTaskId(),
      method,
      to,
      originalMethod,
      promise: null,
      status: 'queued',
      timestamp: Date.now()
    }
    
    this.queue.push(navigationTask)
    
    // 开始处理队列
    if (!this.isProcessing) {
      this.processQueue()
    }
    
    return navigationTask.promise
  }
  
  async processQueue() {
    this.isProcessing = true
    
    while (this.queue.length > 0) {
      const task = this.queue.shift()
      
      try {
        task.status = 'processing'
        task.promise = task.originalMethod(task.to)
        await task.promise
        task.status = 'completed'
        
      } catch (error) {
        task.status = 'failed'
        task.error = error
        console.error('导航任务失败:', error)
      }
    }
    
    this.isProcessing = false
  }
  
  // 取消队列中的导航
  cancelPendingNavigations() {
    const cancelled = this.queue.filter(task => task.status === 'queued')
    this.queue = this.queue.filter(task => task.status !== 'queued')
    
    cancelled.forEach(task => {
      task.status = 'cancelled'
    })
    
    return cancelled.length
  }
  
  // 获取队列状态
  getQueueStatus() {
    return {
      length: this.queue.length,
      isProcessing: this.isProcessing,
      tasks: this.queue.map(task => ({
        id: task.id,
        method: task.method,
        to: task.to,
        status: task.status
      }))
    }
  }
  
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// 使用队列管理器
const queueManager = new NavigationQueueManager(router)

// 批量导航示例
async function batchNavigate(routes) {
  const promises = routes.map(route => router.push(route))
  
  try {
    await Promise.all(promises)
    console.log('批量导航完成')
  } catch (error) {
    console.error('批量导航失败:', error)
  }
}
```

## 四、状态同步

### 4.1 URL 与状态同步

```javascript
// URL 状态同步器
class URLStateSync {
  constructor(router, stateKey = 'appState') {
    this.router = router
    this.stateKey = stateKey
    this.state = reactive({})
    this.setupSync()
  }
  
  setupSync() {
    // 初始化：从 URL 读取状态
    this.loadStateFromURL()
    
    // 监听状态变化，同步到 URL
    watchEffect(() => {
      this.syncStateToURL()
    })
    
    // 监听 URL 变化，同步到状态
    this.router.afterEach(() => {
      this.loadStateFromURL()
    })
  }
  
  loadStateFromURL() {
    const query = this.router.currentRoute.value.query
    const stateString = query[this.stateKey]
    
    if (stateString) {
      try {
        const urlState = JSON.parse(decodeURIComponent(stateString))
        Object.assign(this.state, urlState)
      } catch (error) {
        console.warn('URL 状态解析失败:', error)
      }
    }
  }
  
  syncStateToURL() {
    if (Object.keys(this.state).length === 0) return
    
    const stateString = encodeURIComponent(JSON.stringify(this.state))
    const currentQuery = { ...this.router.currentRoute.value.query }
    
    currentQuery[this.stateKey] = stateString
    
    // 静默更新 URL，不触发导航
    this.router.replace({
      query: currentQuery
    })
  }
  
  // 设置状态
  setState(newState) {
    Object.assign(this.state, newState)
  }
  
  // 获取状态
  getState() {
    return { ...this.state }
  }
  
  // 清除状态
  clearState() {
    Object.keys(this.state).forEach(key => {
      delete this.state[key]
    })
  }
}

// 使用状态同步器
const urlSync = new URLStateSync(router, 'filters')

// 设置过滤器状态
urlSync.setState({
  category: 'electronics',
  priceRange: [100, 500],
  sortBy: 'price'
})

// 状态会自动同步到 URL: ?filters=%7B%22category%22%3A%22electronics%22...
```

### 4.2 多组件状态共享

```javascript
// 路由状态共享
const routeStatePlugin = {
  install(app) {
    const sharedState = reactive({
      breadcrumbs: [],
      pageTitle: '',
      loading: false,
      error: null
    })
    
    app.provide('routeState', sharedState)
    
    // 全局属性
    app.config.globalProperties.$routeState = sharedState
    
    return sharedState
  }
}

// 在主应用中安装
app.use(routeStatePlugin)

// 在组件中使用
// Composition API
const routeState = inject('routeState')

// Options API
export default {
  computed: {
    routeState() {
      return this.$routeState
    }
  }
}

// 面包屑管理器
class BreadcrumbManager {
  constructor(router, routeState) {
    this.router = router
    this.routeState = routeState
    this.setupBreadcrumbs()
  }
  
  setupBreadcrumbs() {
    this.router.afterEach((to) => {
      this.updateBreadcrumbs(to)
    })
  }
  
  updateBreadcrumbs(route) {
    const breadcrumbs = []
    
    // 遍历匹配的路由记录
    route.matched.forEach((record) => {
      if (record.meta?.breadcrumb) {
        const breadcrumb = {
          title: typeof record.meta.breadcrumb === 'function'
            ? record.meta.breadcrumb(route)
            : record.meta.breadcrumb,
          path: record.path,
          name: record.name
        }
        
        breadcrumbs.push(breadcrumb)
      }
    })
    
    this.routeState.breadcrumbs = breadcrumbs
  }
}

// 页面标题管理器
class PageTitleManager {
  constructor(router, routeState) {
    this.router = router
    this.routeState = routeState
    this.baseTitle = document.title
    this.setupTitleManagement()
  }
  
  setupTitleManagement() {
    this.router.afterEach((to) => {
      this.updateTitle(to)
    })
  }
  
  updateTitle(route) {
    let title = this.baseTitle
    
    if (route.meta?.title) {
      title = `${route.meta.title} - ${this.baseTitle}`
    }
    
    document.title = title
    this.routeState.pageTitle = title
  }
}
```

## 五、状态持久化

### 5.1 本地存储集成

```javascript
// 路由状态持久化
class RouteStatePersistence {
  constructor(router, options = {}) {
    this.router = router
    this.storageKey = options.key || 'routeState'
    this.storage = options.storage || localStorage
    this.ttl = options.ttl || 24 * 60 * 60 * 1000 // 24小时
    
    this.state = reactive(this.loadState())
    this.setupPersistence()
  }
  
  setupPersistence() {
    // 监听状态变化并保存
    watchEffect(() => {
      this.saveState()
    })
    
    // 页面卸载时保存
    window.addEventListener('beforeunload', () => {
      this.saveState()
    })
    
    // 定期清理过期状态
    setInterval(() => {
      this.cleanupExpiredState()
    }, 60 * 60 * 1000) // 每小时检查一次
  }
  
  loadState() {
    try {
      const stored = this.storage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        
        // 检查是否过期
        if (Date.now() - data.timestamp < this.ttl) {
          return data.state || {}
        }
      }
    } catch (error) {
      console.warn('加载路由状态失败:', error)
    }
    
    return {}
  }
  
  saveState() {
    try {
      const data = {
        state: this.state,
        timestamp: Date.now()
      }
      
      this.storage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('保存路由状态失败:', error)
    }
  }
  
  cleanupExpiredState() {
    try {
      const stored = this.storage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        
        if (Date.now() - data.timestamp >= this.ttl) {
          this.storage.removeItem(this.storageKey)
        }
      }
    } catch (error) {
      console.warn('清理过期状态失败:', error)
    }
  }
  
  // 设置状态
  setState(key, value) {
    this.state[key] = value
  }
  
  // 获取状态
  getState(key) {
    return this.state[key]
  }
  
  // 清除状态
  clearState() {
    Object.keys(this.state).forEach(key => {
      delete this.state[key]
    })
    this.storage.removeItem(this.storageKey)
  }
}

// 使用持久化状态
const persistence = new RouteStatePersistence(router, {
  key: 'myAppRouteState',
  ttl: 7 * 24 * 60 * 60 * 1000 // 7天
})

// 在组件中使用持久化状态
export default {
  setup() {
    const rememberScrollPosition = (path, position) => {
      persistence.setState(`scroll_${path}`, position)
    }
    
    const getScrollPosition = (path) => {
      return persistence.getState(`scroll_${path}`) || { x: 0, y: 0 }
    }
    
    return {
      rememberScrollPosition,
      getScrollPosition
    }
  }
}
```

## 六、总结

| 状态类型 | 特点 | 用途 |
|----------|------|------|
| 路由对象 | 响应式，只读 | 获取当前路由信息 |
| 历史状态 | 浏览器管理 | 前进后退导航 |
| 导航状态 | 临时状态 | 加载指示，进度追踪 |
| 应用状态 | 持久化 | 用户偏好，表单数据 |
| 共享状态 | 跨组件 | 面包屑，页面标题 |

## 参考资料

- [路由对象](https://router.vuejs.org/api/#route-object)
- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)

---

**下一节** → [第 24 节：导航流程](./24-navigation-flow.md)
