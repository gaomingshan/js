# 第 25 节：Router 实例

## 概述

Router 实例是 Vue Router 的核心对象，负责管理整个路由系统。理解 Router 实例的内部结构和工作机制，有助于深入掌握路由系统的运行原理。

## 一、Router 实例创建

### 1.1 createRouter 函数

```javascript
// Vue Router 4 源码简化版本
export function createRouter(options) {
  const matcher = createRouterMatcher(options.routes, options)
  const routerHistory = options.history
  
  let currentRoute = START_LOCATION_NORMALIZED
  const installedApps = new Set()
  
  const router = {
    currentRoute: shallowRef(currentRoute),
    listening: true,
    
    // 核心方法
    addRoute,
    removeRoute,
    hasRoute,
    getRoutes,
    resolve,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    
    // 生命周期
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    
    // 安装方法
    install(app) {
      installedApps.add(app)
      
      app.config.globalProperties.$router = router
      app.config.globalProperties.$route = currentRoute
      
      app.provide(routerKey, router)
      app.provide(routeLocationKey, currentRoute)
    }
  }
  
  return router
}
```

### 1.2 核心属性解析

```javascript
// Router 实例的核心属性
const routerInstance = {
  // 当前路由状态
  currentRoute: reactive(currentLocation),
  
  // 路由匹配器
  matcher: {
    addRoute(parentName, route) { /* 添加路由 */ },
    removeRoute(name) { /* 删除路由 */ },
    getRoutes() { /* 获取所有路由 */ },
    resolve(location, current) { /* 解析路由 */ }
  },
  
  // 历史管理器
  history: {
    location: '/current/path',
    state: {},
    push(to, data) { /* 推送新路由 */ },
    replace(to, data) { /* 替换当前路由 */ },
    go(delta) { /* 前进/后退 */ },
    listen(callback) { /* 监听变化 */ }
  },
  
  // 守卫集合
  beforeGuards: new Set(),
  beforeResolveGuards: new Set(),
  afterGuards: new Set(),
  
  // 安装的应用实例
  installedApps: new Set()
}
```

## 二、路由解析机制

### 2.1 resolve 方法

```javascript
// 路由解析的核心逻辑
function resolve(to, currentRoute) {
  // 1. 标准化路由位置
  const targetLocation = resolveLocation(to, currentRoute)
  
  // 2. 匹配路由记录
  const matched = matcher.resolve(targetLocation, currentRoute)
  
  // 3. 构建路由对象
  const resolved = {
    ...targetLocation,
    matched,
    meta: matched.reduce((meta, record) => 
      Object.assign(meta, record.meta), {}),
    href: routerHistory.createHref(targetLocation.fullPath)
  }
  
  return resolved
}

// 位置标准化
function resolveLocation(to, current) {
  if (typeof to === 'string') {
    return { path: to }
  }
  
  if (to.name) {
    // 命名路由解析
    const matched = matcher.getRecordMatcher(to.name)
    return {
      name: to.name,
      params: to.params || {},
      query: to.query || {},
      hash: to.hash || '',
      path: matched.stringify(to.params)
    }
  }
  
  return to
}
```

### 2.2 导航执行流程

```javascript
async function push(to) {
  // 1. 解析目标路由
  const targetRoute = resolve(to, currentRoute.value)
  
  // 2. 创建导航对象
  const navigation = {
    from: currentRoute.value,
    to: targetRoute,
    type: NavigationType.push
  }
  
  try {
    // 3. 执行导航流程
    await navigate(navigation)
    
    // 4. 更新历史记录
    routerHistory.push(targetRoute.fullPath, {
      ...targetRoute,
      scroll: getScrollPosition()
    })
    
    // 5. 更新当前路由
    markRouteAsAccessed(targetRoute)
    
  } catch (error) {
    // 6. 错误处理
    handleNavigationError(error, navigation)
  }
}

// 导航核心逻辑
async function navigate(navigation) {
  const { from, to } = navigation
  
  // 执行导航守卫
  await runGuardQueue([
    ...extractComponentsGuards(from.matched, 'beforeRouteLeave'),
    ...beforeGuards.list(),
    ...extractComponentsGuards(to.matched, 'beforeRouteUpdate'),
    ...to.matched.map(m => m.beforeEnter).flat(),
    ...resolveAsyncComponents(to.matched)
  ])
  
  // 执行 beforeResolve 守卫
  await runGuardQueue(beforeResolveGuards.list())
  
  // 更新组件实例
  updateComponentInstances(from, to)
  
  // 执行 afterEach 钩子
  afterGuards.list().forEach(guard => guard(to, from))
}
```

## 三、插件机制

### 3.1 install 方法详解

```javascript
function install(app) {
  const router = this
  
  // 1. 注册全局属性
  app.config.globalProperties.$router = router
  app.config.globalProperties.$route = unref(router.currentRoute)
  
  // 2. 提供依赖注入
  app.provide(routerKey, router)
  app.provide(routeLocationKey, readonly(router.currentRoute))
  
  // 3. 注册全局组件
  app.component('RouterLink', RouterLink)
  app.component('RouterView', RouterView)
  
  // 4. 处理首次导航
  if (!installedApps.has(app)) {
    installedApps.add(app)
    
    app.mixin({
      beforeCreate() {
        if (this.$options.router === router) {
          // 启动路由系统
          router.push(router.history.location)
        }
      }
    })
  }
}
```

### 3.2 响应式集成

```javascript
// 与Vue响应式系统的集成
function setupReactiveIntegration() {
  // 当前路由的响应式引用
  const currentRoute = shallowRef(START_LOCATION)
  
  // 监听历史变化
  routerHistory.listen((to, from, info) => {
    // 更新响应式状态
    currentRoute.value = createRouteLocation(to, from)
    
    // 触发组件更新
    triggerRef(currentRoute)
  })
  
  return currentRoute
}

// 路由对象创建
function createRouteLocation(to, from) {
  const route = {
    path: to.path,
    name: to.name,
    params: to.params || {},
    query: to.query || {},
    hash: to.hash || '',
    fullPath: to.fullPath,
    matched: to.matched || [],
    meta: to.meta || {},
    redirectedFrom: to.redirectedFrom
  }
  
  // 只读保护
  return Object.freeze(route)
}
```

## 四、错误处理机制

### 4.1 导航错误类型

```javascript
// 错误类型定义
export const NavigationFailureType = {
  aborted: 4,        // 导航被中断
  cancelled: 8,      // 导航被取消
  duplicated: 16     // 重复导航
}

// 错误处理器
function handleNavigationError(error, navigation) {
  if (isNavigationFailure(error)) {
    const { type, from, to } = error
    
    switch (type) {
      case NavigationFailureType.aborted:
        console.warn(`Navigation aborted from ${from.path} to ${to.path}`)
        break
        
      case NavigationFailureType.cancelled:
        console.warn(`Navigation cancelled from ${from.path} to ${to.path}`)
        break
        
      case NavigationFailureType.duplicated:
        console.warn(`Duplicate navigation to ${to.path}`)
        break
    }
  } else {
    // 未知错误
    console.error('Navigation error:', error)
    throw error
  }
}
```

### 4.2 守卫错误处理

```javascript
async function runGuardQueue(guards) {
  for (const guard of guards) {
    try {
      const result = await guard()
      
      // 处理守卫返回值
      if (result === false) {
        throw createNavigationAborted()
      } else if (result && typeof result === 'object') {
        // 重定向
        throw createNavigationRedirected(result)
      }
    } catch (error) {
      // 传播错误
      throw error
    }
  }
}
```

## 五、性能优化

### 5.1 路由缓存机制

```javascript
// 路由解析缓存
const resolveCache = new Map()

function cachedResolve(to, current) {
  const cacheKey = getCacheKey(to, current)
  
  if (resolveCache.has(cacheKey)) {
    return resolveCache.get(cacheKey)
  }
  
  const resolved = resolve(to, current)
  resolveCache.set(cacheKey, resolved)
  
  return resolved
}

// 缓存键生成
function getCacheKey(to, current) {
  return `${JSON.stringify(to)}-${current?.path || ''}`
}
```

### 5.2 批量更新优化

```javascript
// 批量更新机制
let pendingUpdate = null

function scheduleUpdate() {
  if (pendingUpdate) return pendingUpdate
  
  pendingUpdate = nextTick(() => {
    // 批量执行更新
    flushUpdates()
    pendingUpdate = null
  })
  
  return pendingUpdate
}
```

## 六、最佳实践

### 6.1 实例管理

- **单例模式**：确保应用中只有一个Router实例
- **生命周期管理**：正确处理Router的创建和销毁
- **内存泄漏防护**：及时清理事件监听器和引用

### 6.2 配置优化

```javascript
// 推荐的Router配置
const router = createRouter({
  history: createWebHistory(),
  routes,
  
  // 性能优化
  strict: false,
  sensitive: false,
  
  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})
```

## 参考资料

- [Vue Router 官方文档 - Router 实例](https://router.vuejs.org/zh/api/#router-实例方法)
- [Vue Router 源码解析](https://github.com/vuejs/router)
- [Vue Router 4 设计思路](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0021-router-link-scoped-slot.md)

**下一节** → [第 26 节：History 实现原理](./26-history-impl.md)
