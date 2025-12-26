# 第 24 节：导航流程

## 概述

导航流程是 Vue Router 的核心执行机制，包含路由匹配、守卫执行、组件解析等步骤。深入理解导航流程有助于优化应用性能和调试路由问题。

## 一、导航流程概述

### 1.1 完整导航流程

```
用户触发导航
    ↓
1. 导航触发
    ↓
2. 失活组件守卫 (beforeRouteLeave)
    ↓
3. 全局前置守卫 (beforeEach)
    ↓
4. 重用组件守卫 (beforeRouteUpdate)
    ↓
5. 路由配置守卫 (beforeEnter)
    ↓
6. 解析异步路由组件
    ↓
7. 激活组件守卫 (beforeRouteEnter)
    ↓
8. 全局解析守卫 (beforeResolve)
    ↓
9. 导航确认
    ↓
10. 全局后置钩子 (afterEach)
    ↓
11. DOM 更新
    ↓
12. beforeRouteEnter 的 next 回调
```

### 1.2 导航类型

```javascript
// 不同导航类型触发的流程
const navigationTypes = {
  push: '添加新的历史记录',
  replace: '替换当前历史记录',
  go: '历史记录前进/后退',
  initial: '初始页面加载',
  popstate: '浏览器前进/后退按钮'
}

// 导航触发方式
const triggerMethods = {
  programmatic: 'router.push/replace/go',
  declarative: '<router-link>',
  browser: '浏览器前进/后退按钮',
  direct: '直接URL访问'
}
```

## 二、导航执行引擎

### 2.1 导航解析器

```javascript
class NavigationResolver {
  constructor(router) {
    this.router = router
    this.currentNavigation = null
    this.navigationQueue = []
  }
  
  async resolve(to, from) {
    // 创建导航上下文
    const navigation = this.createNavigationContext(to, from)
    this.currentNavigation = navigation
    
    try {
      // 执行导航流程
      await this.executeNavigationFlow(navigation)
      return navigation
      
    } catch (error) {
      navigation.error = error
      throw error
    }
  }
  
  createNavigationContext(to, from) {
    return {
      id: this.generateNavigationId(),
      to: this.normalizeLocation(to),
      from: this.normalizeLocation(from),
      startTime: performance.now(),
      status: 'pending',
      guards: [],
      components: new Map(),
      error: null
    }
  }
  
  async executeNavigationFlow(navigation) {
    const { to, from } = navigation
    
    // 1. 检查导航是否重复
    if (this.isDuplicateNavigation(to, from)) {
      throw new NavigationDuplicated(to)
    }
    
    // 2. 获取路由记录
    const matched = this.router.resolve(to).matched
    const leavingRecords = from.matched.slice().reverse()
    
    // 3. 执行离开守卫
    await this.executeLeaveGuards(leavingRecords, to, from)
    
    // 4. 执行全局前置守卫
    await this.executeBeforeEachGuards(to, from)
    
    // 5. 执行更新守卫
    await this.executeUpdateGuards(matched, to, from)
    
    // 6. 执行路由守卫
    await this.executeRouteGuards(matched, to, from)
    
    // 7. 解析异步组件
    await this.resolveAsyncComponents(matched)
    
    // 8. 执行进入守卫
    await this.executeEnterGuards(matched, to, from)
    
    // 9. 执行全局解析守卫
    await this.executeBeforeResolveGuards(to, from)
    
    navigation.status = 'resolved'
  }
  
  async executeLeaveGuards(records, to, from) {
    for (const record of records) {
      const component = this.getComponentInstance(record)
      if (component && component.beforeRouteLeave) {
        await this.executeGuard(component.beforeRouteLeave, to, from)
      }
    }
  }
  
  async executeBeforeEachGuards(to, from) {
    for (const guard of this.router.beforeEachGuards) {
      await this.executeGuard(guard, to, from)
    }
  }
  
  async executeGuard(guard, to, from) {
    return new Promise((resolve, reject) => {
      const result = guard(to, from, (result) => {
        if (result === false) {
          reject(new NavigationAborted(from))
        } else if (typeof result === 'string' || typeof result === 'object') {
          reject(new NavigationRedirect(result))
        } else {
          resolve(result)
        }
      })
      
      // 支持 Promise 返回
      if (result && typeof result.then === 'function') {
        result.then(resolve, reject)
      }
    })
  }
  
  generateNavigationId() {
    return `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  isDuplicateNavigation(to, from) {
    return to.path === from.path && 
           JSON.stringify(to.query) === JSON.stringify(from.query) &&
           to.hash === from.hash
  }
}
```

### 2.2 守卫执行器

```javascript
class GuardExecutor {
  constructor() {
    this.guardStack = []
    this.isExecuting = false
  }
  
  async executeGuardSequence(guards, context) {
    this.isExecuting = true
    
    for (const guard of guards) {
      try {
        const result = await this.executeGuard(guard, context)
        
        // 处理守卫返回值
        if (result === false) {
          throw new NavigationAborted()
        } else if (result && result !== true) {
          throw new NavigationRedirect(result)
        }
        
      } catch (error) {
        this.isExecuting = false
        throw error
      }
    }
    
    this.isExecuting = false
  }
  
  async executeGuard(guard, context) {
    const { to, from } = context
    
    // 记录守卫执行
    const guardExecution = {
      guard,
      startTime: performance.now(),
      context
    }
    
    this.guardStack.push(guardExecution)
    
    try {
      let result
      
      // 判断守卫类型
      if (guard.length >= 3) {
        // 传统的 next 回调风格
        result = await this.executeCallbackGuard(guard, to, from)
      } else {
        // Promise 风格
        result = await guard(to, from)
      }
      
      guardExecution.endTime = performance.now()
      guardExecution.duration = guardExecution.endTime - guardExecution.startTime
      guardExecution.result = result
      
      return result
      
    } catch (error) {
      guardExecution.error = error
      throw error
    } finally {
      this.guardStack.pop()
    }
  }
  
  executeCallbackGuard(guard, to, from) {
    return new Promise((resolve, reject) => {
      const next = (result) => {
        if (result === undefined || result === true) {
          resolve(true)
        } else {
          resolve(result)
        }
      }
      
      try {
        const result = guard(to, from, next)
        
        // 如果返回 Promise，等待解析
        if (result && typeof result.then === 'function') {
          result.then(resolve, reject)
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  
  // 获取守卫执行统计
  getExecutionStats() {
    return {
      currentlyExecuting: this.isExecuting,
      guardStack: this.guardStack.slice(),
      totalExecutions: this.guardStack.length
    }
  }
}
```

## 三、组件解析

### 3.1 异步组件加载

```javascript
class ComponentResolver {
  constructor() {
    this.componentCache = new Map()
    this.loadingComponents = new Map()
  }
  
  async resolveComponents(matched) {
    const componentPromises = matched.map(record => {
      return this.resolveRouteComponent(record)
    })
    
    const results = await Promise.allSettled(componentPromises)
    
    // 检查是否有组件加载失败
    const failures = results.filter(result => result.status === 'rejected')
    if (failures.length > 0) {
      throw new ComponentResolutionError(failures)
    }
    
    return results.map(result => result.value)
  }
  
  async resolveRouteComponent(record) {
    const component = record.component
    
    if (!component) {
      throw new Error(`路由记录缺少组件: ${record.path}`)
    }
    
    // 已经是组件对象
    if (typeof component === 'object') {
      return component
    }
    
    // 异步组件（函数）
    if (typeof component === 'function') {
      return await this.loadAsyncComponent(component, record.path)
    }
    
    throw new Error(`无效的组件类型: ${typeof component}`)
  }
  
  async loadAsyncComponent(loader, path) {
    // 检查缓存
    if (this.componentCache.has(loader)) {
      return this.componentCache.get(loader)
    }
    
    // 检查是否正在加载
    if (this.loadingComponents.has(loader)) {
      return await this.loadingComponents.get(loader)
    }
    
    // 开始加载
    const loadPromise = this.executeLoader(loader, path)
    this.loadingComponents.set(loader, loadPromise)
    
    try {
      const component = await loadPromise
      
      // 缓存结果
      this.componentCache.set(loader, component)
      
      return component
      
    } finally {
      // 清理加载状态
      this.loadingComponents.delete(loader)
    }
  }
  
  async executeLoader(loader, path) {
    try {
      const result = await loader()
      
      // 处理 ES 模块默认导出
      return result.default || result
      
    } catch (error) {
      console.error(`组件加载失败: ${path}`, error)
      
      // 返回错误组件
      return this.createErrorComponent(error, path)
    }
  }
  
  createErrorComponent(error, path) {
    return {
      template: `
        <div class="router-error">
          <h3>组件加载失败</h3>
          <p>路径: ${path}</p>
          <p>错误: ${error.message}</p>
          <button @click="reload">重新加载</button>
        </div>
      `,
      methods: {
        reload() {
          window.location.reload()
        }
      }
    }
  }
  
  // 预加载组件
  preloadComponent(loader) {
    if (!this.componentCache.has(loader) && !this.loadingComponents.has(loader)) {
      this.loadAsyncComponent(loader, 'preload')
    }
  }
  
  // 清理缓存
  clearCache() {
    this.componentCache.clear()
    this.loadingComponents.clear()
  }
}
```

### 3.2 组件实例管理

```javascript
class ComponentInstanceManager {
  constructor() {
    this.instances = new WeakMap()
    this.lifecycleHooks = new Map()
  }
  
  registerInstance(component, instance, route) {
    this.instances.set(component, {
      instance,
      route,
      createdAt: Date.now()
    })
    
    // 注册生命周期钩子
    this.setupLifecycleHooks(instance, route)
  }
  
  setupLifecycleHooks(instance, route) {
    // beforeRouteEnter 回调执行
    if (instance.$options.beforeRouteEnter) {
      const callbacks = this.lifecycleHooks.get(route.path) || []
      callbacks.forEach(callback => {
        if (typeof callback === 'function') {
          callback(instance)
        }
      })
      
      this.lifecycleHooks.delete(route.path)
    }
  }
  
  getInstance(component) {
    return this.instances.get(component)?.instance
  }
  
  addEnterCallback(routePath, callback) {
    if (!this.lifecycleHooks.has(routePath)) {
      this.lifecycleHooks.set(routePath, [])
    }
    
    this.lifecycleHooks.get(routePath).push(callback)
  }
  
  cleanupInstance(component) {
    this.instances.delete(component)
  }
}
```

## 四、错误处理

### 4.1 导航错误类型

```javascript
// 导航错误类
class NavigationError extends Error {
  constructor(message, type, from, to) {
    super(message)
    this.name = 'NavigationError'
    this.type = type
    this.from = from
    this.to = to
  }
}

class NavigationAborted extends NavigationError {
  constructor(from, to) {
    super('Navigation aborted', 'aborted', from, to)
    this.name = 'NavigationAborted'
  }
}

class NavigationDuplicated extends NavigationError {
  constructor(to) {
    super('Navigation duplicated', 'duplicated', null, to)
    this.name = 'NavigationDuplicated'
  }
}

class NavigationRedirect extends NavigationError {
  constructor(to) {
    super('Navigation redirected', 'redirected', null, to)
    this.name = 'NavigationRedirect'
    this.redirectTo = to
  }
}

// 错误处理器
class NavigationErrorHandler {
  constructor(router) {
    this.router = router
    this.errorHandlers = []
    this.setupErrorHandling()
  }
  
  setupErrorHandling() {
    // 捕获未处理的导航错误
    this.router.onError((error) => {
      this.handleError(error)
    })
  }
  
  handleError(error) {
    console.error('导航错误:', error)
    
    // 执行错误处理器
    this.errorHandlers.forEach(handler => {
      try {
        handler(error)
      } catch (e) {
        console.error('错误处理器执行失败:', e)
      }
    })
    
    // 根据错误类型处理
    switch (error.name) {
      case 'NavigationAborted':
        this.handleNavigationAborted(error)
        break
        
      case 'NavigationDuplicated':
        this.handleNavigationDuplicated(error)
        break
        
      case 'NavigationRedirect':
        this.handleNavigationRedirect(error)
        break
        
      default:
        this.handleUnknownError(error)
    }
  }
  
  handleNavigationAborted(error) {
    // 导航被中止，通常不需要特殊处理
    console.log('导航被中止')
  }
  
  handleNavigationDuplicated(error) {
    // 重复导航，可以忽略或显示提示
    console.log('重复导航:', error.to.path)
  }
  
  handleNavigationRedirect(error) {
    // 执行重定向
    this.router.push(error.redirectTo)
  }
  
  handleUnknownError(error) {
    // 显示错误页面或提示
    this.showErrorMessage(error.message)
  }
  
  showErrorMessage(message) {
    // 显示用户友好的错误信息
    console.error('导航失败:', message)
  }
  
  addErrorHandler(handler) {
    this.errorHandlers.push(handler)
  }
}
```

## 五、性能优化

### 5.1 导航性能监控

```javascript
class NavigationPerformanceMonitor {
  constructor(router) {
    this.router = router
    this.metrics = []
    this.setupMonitoring()
  }
  
  setupMonitoring() {
    let navigationStart = null
    
    // 监控导航开始
    this.router.beforeEach((to, from) => {
      navigationStart = {
        from: from.path,
        to: to.path,
        startTime: performance.now(),
        timestamp: Date.now()
      }
    })
    
    // 监控导航完成
    this.router.afterEach((to, from, failure) => {
      if (navigationStart) {
        const endTime = performance.now()
        const metric = {
          ...navigationStart,
          endTime,
          duration: endTime - navigationStart.startTime,
          success: !failure,
          failure
        }
        
        this.recordMetric(metric)
        navigationStart = null
      }
    })
  }
  
  recordMetric(metric) {
    this.metrics.push(metric)
    
    // 保持最近1000条记录
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500)
    }
    
    // 性能警告
    if (metric.duration > 1000) {
      console.warn(`慢导航检测: ${metric.from} -> ${metric.to} (${metric.duration.toFixed(2)}ms)`)
    }
  }
  
  getPerformanceReport() {
    const successful = this.metrics.filter(m => m.success)
    const failed = this.metrics.filter(m => !m.success)
    
    const durations = successful.map(m => m.duration)
    const avgDuration = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0
    
    return {
      totalNavigations: this.metrics.length,
      successfulNavigations: successful.length,
      failedNavigations: failed.length,
      averageDuration: Math.round(avgDuration),
      slowNavigations: successful.filter(m => m.duration > 1000).length,
      fastestNavigation: Math.min(...durations),
      slowestNavigation: Math.max(...durations)
    }
  }
}
```

### 5.2 导航优化策略

```javascript
class NavigationOptimizer {
  constructor(router) {
    this.router = router
    this.preloadCache = new Set()
    this.setupOptimizations()
  }
  
  setupOptimizations() {
    // 智能预加载
    this.setupIntelligentPreloading()
    
    // 导航防抖
    this.setupNavigationDebouncing()
    
    // 组件缓存优化
    this.setupComponentCaching()
  }
  
  setupIntelligentPreloading() {
    // 预加载用户可能访问的路由
    this.router.afterEach((to) => {
      const relatedRoutes = this.getRelatedRoutes(to)
      
      relatedRoutes.forEach(route => {
        if (!this.preloadCache.has(route.path)) {
          this.preloadRoute(route)
          this.preloadCache.add(route.path)
        }
      })
    })
  }
  
  getRelatedRoutes(currentRoute) {
    // 基于路由路径推测相关路由
    const related = []
    const path = currentRoute.path
    
    // 父级路由
    if (path.includes('/')) {
      const parentPath = path.substring(0, path.lastIndexOf('/')) || '/'
      const parentRoute = this.router.resolve(parentPath)
      if (parentRoute.matched.length > 0) {
        related.push(parentRoute)
      }
    }
    
    // 同级路由
    if (currentRoute.matched.length > 0) {
      const parentRecord = currentRoute.matched[currentRoute.matched.length - 2]
      if (parentRecord && parentRecord.children) {
        parentRecord.children.forEach(child => {
          if (child.path !== currentRoute.matched[currentRoute.matched.length - 1].path) {
            related.push({ path: parentRecord.path + '/' + child.path })
          }
        })
      }
    }
    
    return related
  }
  
  async preloadRoute(route) {
    try {
      const resolved = this.router.resolve(route.path)
      
      // 预加载组件
      for (const record of resolved.matched) {
        if (typeof record.component === 'function') {
          await record.component()
        }
      }
    } catch (error) {
      console.warn('路由预加载失败:', route.path, error)
    }
  }
  
  setupNavigationDebouncing() {
    let lastNavigation = null
    const originalPush = this.router.push.bind(this.router)
    
    this.router.push = (to) => {
      const now = Date.now()
      
      // 防抖：100ms内的重复导航
      if (lastNavigation && 
          now - lastNavigation.time < 100 && 
          JSON.stringify(to) === JSON.stringify(lastNavigation.to)) {
        return Promise.resolve()
      }
      
      lastNavigation = { to, time: now }
      return originalPush(to)
    }
  }
}
```

## 六、调试工具

### 6.1 导航流程调试器

```javascript
class NavigationFlowDebugger {
  constructor(router) {
    this.router = router
    this.enabled = false
    this.logs = []
    this.currentNavigation = null
  }
  
  enable() {
    this.enabled = true
    this.setupDebugging()
    console.log('🔍 导航流程调试器已启用')
  }
  
  disable() {
    this.enabled = false
  }
  
  setupDebugging() {
    // 导航开始
    this.router.beforeEach((to, from, next) => {
      if (!this.enabled) return next()
      
      this.currentNavigation = {
        id: Date.now(),
        from: from.path,
        to: to.path,
        startTime: performance.now(),
        steps: []
      }
      
      this.log('🚀 导航开始', { from: from.path, to: to.path })
      next()
    })
    
    // 导航解析
    this.router.beforeResolve((to, from, next) => {
      if (!this.enabled) return next()
      
      this.log('🔄 导航解析', { to: to.path })
      next()
    })
    
    // 导航完成
    this.router.afterEach((to, from, failure) => {
      if (!this.enabled) return
      
      if (this.currentNavigation) {
        this.currentNavigation.endTime = performance.now()
        this.currentNavigation.duration = 
          this.currentNavigation.endTime - this.currentNavigation.startTime
        this.currentNavigation.success = !failure
        
        this.log(failure ? '❌ 导航失败' : '✅ 导航完成', {
          to: to.path,
          duration: `${this.currentNavigation.duration.toFixed(2)}ms`,
          failure: failure?.message
        })
        
        this.logs.push(this.currentNavigation)
        this.currentNavigation = null
      }
    })
  }
  
  log(message, data) {
    if (!this.enabled) return
    
    const logEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      data
    }
    
    if (this.currentNavigation) {
      this.currentNavigation.steps.push(logEntry)
    }
    
    console.log(`[Router] ${message}`, data)
  }
  
  getNavigationHistory() {
    return this.logs.slice()
  }
  
  printNavigationSummary() {
    const successful = this.logs.filter(nav => nav.success)
    const failed = this.logs.filter(nav => !nav.success)
    const avgDuration = successful.length > 0 
      ? successful.reduce((sum, nav) => sum + nav.duration, 0) / successful.length 
      : 0
    
    console.table({
      '总导航次数': this.logs.length,
      '成功导航': successful.length,
      '失败导航': failed.length,
      '平均耗时': `${avgDuration.toFixed(2)}ms`
    })
  }
}

// 使用调试器
const debugger = new NavigationFlowDebugger(router)

// 在开发环境启用
if (process.env.NODE_ENV === 'development') {
  debugger.enable()
}
```

## 七、总结

| 流程阶段 | 执行内容 | 可中断 |
|----------|----------|--------|
| 触发导航 | 用户操作或编程导航 | - |
| 离开守卫 | beforeRouteLeave | ✅ |
| 全局前置守卫 | beforeEach | ✅ |
| 更新守卫 | beforeRouteUpdate | ✅ |
| 路由守卫 | beforeEnter | ✅ |
| 组件解析 | 异步组件加载 | ✅ |
| 进入守卫 | beforeRouteEnter | ✅ |
| 全局解析守卫 | beforeResolve | ✅ |
| 导航确认 | 更新URL和渲染 | - |
| 全局后置钩子 | afterEach | - |

## 参考资料

- [导航守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [路由懒加载](https://router.vuejs.org/guide/advanced/lazy-loading.html)

---

**下一节** → [第 25 节：Router 实例](./25-router-instance.md)
