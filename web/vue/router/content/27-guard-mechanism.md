# 第 27 节：路由守卫机制

## 概述

路由守卫是 Vue Router 的核心安全机制，通过一系列钩子函数控制导航流程。深入理解守卫机制的内部实现，有助于构建更安全、可控的路由系统。

## 一、守卫执行引擎

### 1.1 守卫队列管理

```javascript
// 守卫队列执行器
class GuardQueue {
  constructor() {
    this.guards = []
    this.isRunning = false
    this.currentIndex = 0
  }
  
  // 添加守卫
  add(guard) {
    this.guards.push(guard)
  }
  
  // 执行队列
  async run(to, from, next) {
    if (this.isRunning) {
      throw new Error('Guard queue is already running')
    }
    
    this.isRunning = true
    this.currentIndex = 0
    
    try {
      for (let i = 0; i < this.guards.length; i++) {
        this.currentIndex = i
        const guard = this.guards[i]
        
        const result = await this.executeGuard(guard, to, from, next)
        
        // 处理守卫返回值
        if (result === false) {
          throw createNavigationAborted(from, to)
        } else if (result && typeof result === 'object') {
          throw createNavigationRedirected(from, to, result)
        }
      }
    } finally {
      this.isRunning = false
      this.currentIndex = 0
    }
  }
  
  // 执行单个守卫
  async executeGuard(guard, to, from, next) {
    const guardWrapper = (to, from, next) => {
      return new Promise((resolve, reject) => {
        const nextWithPromise = (result) => {
          if (result === false) {
            reject(createNavigationAborted(from, to))
          } else if (result && typeof result === 'object') {
            reject(createNavigationRedirected(from, to, result))
          } else {
            resolve(result)
          }
        }
        
        const guardResult = guard.call(null, to, from, nextWithPromise)
        
        // 处理 Promise 返回值
        if (isPromise(guardResult)) {
          guardResult.then(resolve, reject)
        } else if (guardResult !== undefined) {
          resolve(guardResult)
        }
      })
    }
    
    return guardWrapper(to, from, next)
  }
}
```

### 1.2 导航解析器

```javascript
// 导航解析核心逻辑
class NavigationResolver {
  constructor(router) {
    this.router = router
    this.pendingNavigations = new Set()
  }
  
  async resolve(to, from) {
    const navigation = { to, from, type: 'push' }
    
    // 防止重复导航
    if (this.pendingNavigations.has(navigation)) {
      return Promise.reject(createNavigationDuplicated(from, to))
    }
    
    this.pendingNavigations.add(navigation)
    
    try {
      // 1. 提取所有守卫
      const guards = await this.extractGuards(to, from)
      
      // 2. 创建守卫队列
      const queue = new GuardQueue()
      guards.forEach(guard => queue.add(guard))
      
      // 3. 执行守卫队列
      await queue.run(to, from)
      
      // 4. 解析异步组件
      await this.resolveAsyncComponents(to.matched)
      
      // 5. 执行 beforeResolve 守卫
      await this.runBeforeResolveGuards(to, from)
      
      // 6. 确认导航
      return this.confirmNavigation(to, from)
      
    } catch (error) {
      throw this.handleNavigationError(error, navigation)
    } finally {
      this.pendingNavigations.delete(navigation)
    }
  }
  
  // 提取守卫函数
  async extractGuards(to, from) {
    const guards = []
    
    // 1. beforeRouteLeave 守卫（离开的组件）
    guards.push(...this.extractLeaveGuards(from.matched))
    
    // 2. 全局 beforeEach 守卫
    guards.push(...this.router.beforeGuards.list())
    
    // 3. beforeRouteUpdate 守卫（重用的组件）
    guards.push(...this.extractUpdateGuards(to, from))
    
    // 4. beforeEnter 守卫（路由配置）
    guards.push(...this.extractEnterGuards(to.matched))
    
    // 5. beforeRouteEnter 守卫（进入的组件）
    guards.push(...this.extractComponentEnterGuards(to.matched))
    
    return guards
  }
}
```

## 二、组件守卫提取

### 2.1 组件实例守卫

```javascript
// 从组件实例提取守卫
function extractComponentGuards(matched, guardType, to, from) {
  const guards = []
  
  for (const record of matched) {
    for (const name in record.components) {
      const component = record.components[name]
      
      if (isAsyncComponent(component)) {
        // 异步组件处理
        guards.push(async (to, from, next) => {
          const resolved = await resolveAsyncComponent(component)
          const guard = extractGuardFromComponent(resolved, guardType)
          
          if (guard) {
            return guard.call(resolved, to, from, next)
          }
          
          next()
        })
      } else {
        // 同步组件处理
        const guard = extractGuardFromComponent(component, guardType)
        
        if (guard) {
          guards.push((to, from, next) => {
            return guard.call(component, to, from, next)
          })
        }
      }
    }
  }
  
  return guards
}

// 从组件中提取特定守卫
function extractGuardFromComponent(component, guardType) {
  if (!component) return null
  
  // Vue 2 选项式 API
  if (component[guardType]) {
    return component[guardType]
  }
  
  // Vue 3 组合式 API
  if (component.setup) {
    const setupGuards = component.__guardHooks
    return setupGuards?.[guardType]
  }
  
  return null
}
```

### 2.2 守卫注册机制

```javascript
// Vue 3 组合式 API 守卫注册
export function onBeforeRouteEnter(guard) {
  const instance = getCurrentInstance()
  
  if (instance) {
    if (!instance.__guardHooks) {
      instance.__guardHooks = {}
    }
    
    instance.__guardHooks.beforeRouteEnter = guard
  }
}

export function onBeforeRouteUpdate(guard) {
  const instance = getCurrentInstance()
  
  if (instance) {
    if (!instance.__guardHooks) {
      instance.__guardHooks = {}
    }
    
    instance.__guardHooks.beforeRouteUpdate = guard
    
    // 立即绑定到当前路由
    const router = inject(routerKey)
    const route = inject(routeLocationKey)
    
    watchEffect(() => {
      const currentRoute = unref(route)
      if (currentRoute) {
        // 注册到路由系统
        router.__registerGuard(instance, 'beforeRouteUpdate', guard)
      }
    })
  }
}

export function onBeforeRouteLeave(guard) {
  const instance = getCurrentInstance()
  
  if (instance) {
    if (!instance.__guardHooks) {
      instance.__guardHooks = {}
    }
    
    instance.__guardHooks.beforeRouteLeave = guard
  }
}
```

## 三、守卫参数处理

### 3.1 next 函数实现

```javascript
// next 函数的内部实现
function createNextFunction(navigation, guardQueue) {
  let isResolved = false
  
  return function next(to) {
    // 防止多次调用
    if (isResolved) {
      console.warn('next() should be called exactly once')
      return
    }
    
    isResolved = true
    
    if (to === false) {
      // 取消导航
      guardQueue.abort(createNavigationAborted(navigation.from, navigation.to))
      
    } else if (to === undefined || to === true) {
      // 继续导航
      guardQueue.continue()
      
    } else if (typeof to === 'string' || (typeof to === 'object' && (to.path || to.name))) {
      // 重定向
      guardQueue.redirect(createNavigationRedirected(navigation.from, navigation.to, to))
      
    } else {
      // 无效参数
      guardQueue.abort(new Error(`Invalid next() parameter: ${to}`))
    }
  }
}
```

### 3.2 错误传播机制

```javascript
// 守卫错误处理
function handleGuardError(error, to, from) {
  // 自定义错误类型处理
  if (error instanceof NavigationFailure) {
    return error
  }
  
  // 未知错误包装
  const wrappedError = new NavigationFailure(
    NavigationFailureType.aborted,
    from,
    to,
    error.message || 'Guard execution failed'
  )
  
  wrappedError.cause = error
  return wrappedError
}

// 全局错误处理器
function setupGlobalErrorHandler(router) {
  router.onError((error, to, from) => {
    console.error('Navigation guard error:', error)
    
    // 错误上报
    if (router.options.errorReporter) {
      router.options.errorReporter(error, { to, from })
    }
    
    // 错误恢复策略
    if (router.options.errorRecovery) {
      return router.options.errorRecovery(error, to, from)
    }
    
    // 默认处理：回退到from路由
    return from
  })
}
```

## 四、性能优化

### 4.1 守卫缓存机制

```javascript
// 守卫结果缓存
class GuardCache {
  constructor(maxSize = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }
  
  // 生成缓存键
  generateKey(guard, to, from) {
    return `${guard.name || 'anonymous'}-${to.path}-${from.path}`
  }
  
  // 获取缓存结果
  get(guard, to, from) {
    const key = this.generateKey(guard, to, from)
    const cached = this.cache.get(key)
    
    if (cached && !this.isExpired(cached)) {
      return cached.result
    }
    
    return null
  }
  
  // 设置缓存
  set(guard, to, from, result, ttl = 5000) {
    const key = this.generateKey(guard, to, from)
    
    // LRU 清理
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      ttl
    })
  }
  
  // 检查过期
  isExpired(cached) {
    return Date.now() - cached.timestamp > cached.ttl
  }
}
```

### 4.2 并发控制

```javascript
// 导航并发控制
class NavigationConcurrencyController {
  constructor() {
    this.activeNavigations = new Map()
    this.maxConcurrent = 3
  }
  
  async execute(navigation, executor) {
    const key = this.getNavigationKey(navigation)
    
    // 检查并发限制
    if (this.activeNavigations.size >= this.maxConcurrent) {
      // 取消最早的导航
      const oldestKey = this.activeNavigations.keys().next().value
      const oldest = this.activeNavigations.get(oldestKey)
      oldest.abort()
    }
    
    // 创建可取消的导航
    const abortController = new AbortController()
    const promise = this.executeWithAbort(executor, abortController.signal)
    
    this.activeNavigations.set(key, {
      promise,
      abort: () => abortController.abort(),
      timestamp: Date.now()
    })
    
    try {
      const result = await promise
      return result
    } finally {
      this.activeNavigations.delete(key)
    }
  }
  
  async executeWithAbort(executor, signal) {
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => {
        reject(new NavigationAborted())
      })
      
      executor().then(resolve, reject)
    })
  }
  
  getNavigationKey(navigation) {
    return `${navigation.from.path}->${navigation.to.path}`
  }
}
```

## 五、调试工具

### 5.1 守卫执行追踪

```javascript
// 守卫执行日志
class GuardTracker {
  constructor(enabled = false) {
    this.enabled = enabled
    this.logs = []
  }
  
  // 记录守卫开始
  logGuardStart(guard, to, from) {
    if (!this.enabled) return
    
    const log = {
      id: this.generateId(),
      type: 'start',
      guardName: guard.name || 'anonymous',
      to: to.path,
      from: from.path,
      timestamp: Date.now()
    }
    
    this.logs.push(log)
    console.group(`🛡️ Guard: ${log.guardName}`)
    console.log('From:', from.path, '→ To:', to.path)
  }
  
  // 记录守卫结束
  logGuardEnd(guard, result, duration) {
    if (!this.enabled) return
    
    console.log(`✅ Result: ${result} (${duration}ms)`)
    console.groupEnd()
  }
  
  // 记录守卫错误
  logGuardError(guard, error) {
    if (!this.enabled) return
    
    console.log(`❌ Error: ${error.message}`)
    console.groupEnd()
  }
  
  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  // 导出日志
  exportLogs() {
    return this.logs.slice()
  }
}

// 使用装饰器包装守卫
function wrapGuardWithTracker(guard, tracker) {
  return async function wrappedGuard(to, from, next) {
    const startTime = Date.now()
    tracker.logGuardStart(guard, to, from)
    
    try {
      const result = await guard.call(this, to, from, next)
      const duration = Date.now() - startTime
      tracker.logGuardEnd(guard, result, duration)
      return result
    } catch (error) {
      tracker.logGuardError(guard, error)
      throw error
    }
  }
}
```

### 5.2 性能监控

```javascript
// 守卫性能监控
class GuardPerformanceMonitor {
  constructor() {
    this.metrics = new Map()
  }
  
  // 记录执行时间
  recordExecution(guardName, duration, success) {
    if (!this.metrics.has(guardName)) {
      this.metrics.set(guardName, {
        totalExecutions: 0,
        totalTime: 0,
        successCount: 0,
        errorCount: 0,
        maxTime: 0,
        minTime: Infinity
      })
    }
    
    const metric = this.metrics.get(guardName)
    metric.totalExecutions++
    metric.totalTime += duration
    metric.maxTime = Math.max(metric.maxTime, duration)
    metric.minTime = Math.min(metric.minTime, duration)
    
    if (success) {
      metric.successCount++
    } else {
      metric.errorCount++
    }
  }
  
  // 获取性能报告
  getPerformanceReport() {
    const report = {}
    
    for (const [guardName, metric] of this.metrics) {
      report[guardName] = {
        averageTime: metric.totalTime / metric.totalExecutions,
        maxTime: metric.maxTime,
        minTime: metric.minTime === Infinity ? 0 : metric.minTime,
        successRate: metric.successCount / metric.totalExecutions,
        totalExecutions: metric.totalExecutions
      }
    }
    
    return report
  }
  
  // 检测慢守卫
  getSlowGuards(threshold = 100) {
    const slowGuards = []
    
    for (const [guardName, metric] of this.metrics) {
      const avgTime = metric.totalTime / metric.totalExecutions
      if (avgTime > threshold) {
        slowGuards.push({
          name: guardName,
          averageTime: avgTime,
          maxTime: metric.maxTime
        })
      }
    }
    
    return slowGuards.sort((a, b) => b.averageTime - a.averageTime)
  }
}
```

## 六、最佳实践

### 6.1 守卫设计原则

```javascript
// 良好的守卫设计示例
const authGuard = {
  name: 'AuthGuard',
  
  async beforeEnter(to, from, next) {
    try {
      // 1. 快速路径检查
      if (!to.meta.requiresAuth) {
        return next()
      }
      
      // 2. 缓存检查
      const cachedAuth = getAuthCache()
      if (cachedAuth && !isExpired(cachedAuth)) {
        return next()
      }
      
      // 3. 异步验证
      const isAuthenticated = await validateAuth()
      
      if (isAuthenticated) {
        setAuthCache(isAuthenticated)
        next()
      } else {
        next({ name: 'Login', query: { redirect: to.fullPath } })
      }
      
    } catch (error) {
      // 4. 错误处理
      console.error('Auth guard error:', error)
      next({ name: 'Error', params: { error: error.message } })
    }
  }
}
```

### 6.2 守卫组合模式

```javascript
// 守卫组合器
function composeGuards(...guards) {
  return async function composedGuard(to, from, next) {
    for (const guard of guards) {
      const result = await guard(to, from, next)
      
      // 如果守卫返回false或重定向，停止执行
      if (result === false || (result && typeof result === 'object')) {
        return result
      }
    }
    
    next()
  }
}

// 使用示例
const protectedRoute = {
  path: '/admin',
  component: AdminPanel,
  beforeEnter: composeGuards(
    authGuard,
    roleGuard('admin'),
    rateLimit(10, '1m'),
    auditLog
  )
}
```

## 参考资料

- [Vue Router 导航守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)
- [Vue Router 4 守卫源码](https://github.com/vuejs/router/blob/main/packages/router/src/navigationGuards.ts)
- [前端路由守卫最佳实践](https://vue-router-next.netlify.app/guide/advanced/navigation-guards.html)

**下一节** → [第 28 节：组件渲染机制](./28-component-render.md)
