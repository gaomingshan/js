# 第 09 节：全局守卫

## 概述

全局导航守卫是在所有路由导航过程中执行的钩子函数，用于实现全局的权限控制、身份验证、数据预加载等功能。Vue Router 提供了三种全局守卫。

## 一、全局前置守卫

### 1.1 beforeEach 基础

```javascript
import { createRouter } from 'vue-router'

const router = createRouter({
  // 路由配置...
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('导航到:', to.path)
  console.log('来自:', from.path)
  
  // 必须调用 next() 才能继续导航
  next()
})
```

### 1.2 Vue Router 4 新语法

```javascript
// Vue Router 4: 返回值控制导航
router.beforeEach((to, from) => {
  // 返回 false 取消导航
  if (shouldCancelNavigation(to)) {
    return false
  }
  
  // 返回路由对象进行重定向
  if (needsRedirect(to)) {
    return { name: 'Login' }
  }
  
  // 返回 true 或不返回值继续导航
  return true
})

// 异步守卫
router.beforeEach(async (to, from) => {
  const user = await getCurrentUser()
  
  if (to.meta.requiresAuth && !user) {
    return { 
      name: 'Login',
      query: { redirect: to.fullPath }
    }
  }
})
```

### 1.3 权限控制示例

```javascript
// 权限检查守卫
router.beforeEach(async (to, from) => {
  // 1. 检查是否需要登录
  if (to.meta.requiresAuth) {
    const isAuthenticated = await checkAuth()
    
    if (!isAuthenticated) {
      return {
        name: 'Login',
        query: { redirect: to.fullPath }
      }
    }
  }
  
  // 2. 检查角色权限
  if (to.meta.roles) {
    const user = await getCurrentUser()
    const hasPermission = to.meta.roles.some(role => 
      user.roles.includes(role)
    )
    
    if (!hasPermission) {
      return { name: 'Forbidden' }
    }
  }
  
  // 3. 检查功能开关
  if (to.meta.feature) {
    const isFeatureEnabled = await checkFeatureFlag(to.meta.feature)
    
    if (!isFeatureEnabled) {
      return { name: 'NotFound' }
    }
  }
})
```

## 二、全局解析守卫

### 2.1 beforeResolve 用法

```javascript
// 在路由组件解析后、导航确认前调用
router.beforeResolve(async (to, from) => {
  // 此时已确定要导航到 to 路由
  // 可以进行数据预加载
  
  if (to.meta.preload) {
    try {
      // 预加载数据
      const data = await preloadRouteData(to)
      
      // 将数据注入到路由元信息中
      to.meta.preloadedData = data
    } catch (error) {
      console.error('数据预加载失败:', error)
      
      // 可以选择继续导航或重定向到错误页
      return { name: 'Error' }
    }
  }
})
```

### 2.2 数据预加载

```javascript
// 数据预加载守卫
router.beforeResolve(async (to, from) => {
  // 获取路由需要的数据
  const dataRequirements = getRouteDataRequirements(to)
  
  if (dataRequirements.length > 0) {
    try {
      // 并行加载所有需要的数据
      const dataPromises = dataRequirements.map(req => 
        loadData(req.type, req.params)
      )
      
      const results = await Promise.all(dataPromises)
      
      // 将数据存储到全局状态或路由元信息
      results.forEach((data, index) => {
        const req = dataRequirements[index]
        setRouteData(req.key, data)
      })
    } catch (error) {
      // 数据加载失败处理
      console.error('Route data loading failed:', error)
      showErrorNotification('数据加载失败')
    }
  }
})

function getRouteDataRequirements(route) {
  return route.meta?.dataRequirements || []
}
```

## 三、全局后置钩子

### 3.1 afterEach 基础

```javascript
// 导航完成后调用（不能改变导航）
router.afterEach((to, from, failure) => {
  // 导航成功
  if (!failure) {
    console.log('成功导航到:', to.path)
    
    // 页面标题设置
    document.title = to.meta?.title || '默认标题'
    
    // 页面访问统计
    analytics.track('page_view', {
      page: to.path,
      title: to.meta?.title
    })
  } else {
    // 导航失败
    console.error('导航失败:', failure)
  }
})
```

### 3.2 页面元信息设置

```javascript
router.afterEach((to, from) => {
  // 设置页面标题
  const title = to.meta?.title
  if (title) {
    document.title = `${title} - 我的应用`
  }
  
  // 设置 meta 标签
  updateMetaTags(to.meta)
  
  // 设置页面类名
  document.body.className = to.meta?.bodyClass || ''
})

function updateMetaTags(meta) {
  // 更新描述
  if (meta?.description) {
    updateMetaTag('description', meta.description)
  }
  
  // 更新关键词
  if (meta?.keywords) {
    updateMetaTag('keywords', meta.keywords)
  }
  
  // 更新 Open Graph 标签
  if (meta?.og) {
    Object.entries(meta.og).forEach(([key, value]) => {
      updateMetaTag(`og:${key}`, value)
    })
  }
}

function updateMetaTag(name, content) {
  let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
  
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(name.includes(':') ? 'property' : 'name', name)
    document.head.appendChild(meta)
  }
  
  meta.setAttribute('content', content)
}
```

### 3.3 页面访问分析

```javascript
// 页面访问统计和分析
router.afterEach((to, from, failure) => {
  if (!failure) {
    // 记录页面访问
    recordPageVisit(to, from)
    
    // 发送统计数据
    sendAnalytics(to, from)
    
    // 更新用户活动状态
    updateUserActivity()
  }
})

function recordPageVisit(to, from) {
  const visitData = {
    path: to.path,
    fullPath: to.fullPath,
    name: to.name,
    timestamp: new Date().toISOString(),
    referrer: from.path,
    userAgent: navigator.userAgent
  }
  
  // 存储到本地或发送到服务器
  localStorage.setItem('lastPageVisit', JSON.stringify(visitData))
}

function sendAnalytics(to, from) {
  // Google Analytics
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to.path,
      page_title: to.meta?.title
    })
  }
  
  // 自定义统计
  if (window.analytics) {
    window.analytics.page(to.path, {
      title: to.meta?.title,
      referrer: from.path
    })
  }
}
```

## 四、守卫组合使用

### 4.1 完整的权限系统

```javascript
// 用户状态管理
let currentUser = null
let permissions = []

// 1. 全局前置守卫：权限检查
router.beforeEach(async (to, from) => {
  // 获取当前用户信息
  if (!currentUser) {
    try {
      currentUser = await fetchCurrentUser()
      permissions = await fetchUserPermissions(currentUser.id)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      currentUser = null
      permissions = []
    }
  }
  
  // 检查登录要求
  if (to.meta.requiresAuth && !currentUser) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath }
    }
  }
  
  // 检查权限要求
  if (to.meta.permissions) {
    const hasPermission = to.meta.permissions.every(p => 
      permissions.includes(p)
    )
    
    if (!hasPermission) {
      return { name: 'AccessDenied' }
    }
  }
})

// 2. 全局解析守卫：数据预加载
router.beforeResolve(async (to, from) => {
  const loadingIndicator = showLoading()
  
  try {
    // 加载页面数据
    if (to.meta.asyncData) {
      const data = await to.meta.asyncData({
        route: to,
        user: currentUser
      })
      
      // 存储到状态管理中
      store.setPageData(to.name, data)
    }
  } catch (error) {
    console.error('数据加载失败:', error)
    showErrorMessage('数据加载失败，请重试')
  } finally {
    hideLoading(loadingIndicator)
  }
})

// 3. 全局后置钩子：清理和统计
router.afterEach((to, from, failure) => {
  if (failure) {
    console.error('导航失败:', failure)
    return
  }
  
  // 页面标题
  document.title = to.meta?.title ? 
    `${to.meta.title} - 我的应用` : 
    '我的应用'
  
  // 页面访问统计
  trackPageView(to, from, currentUser)
  
  // 滚动到顶部（如果需要）
  if (to.meta?.scrollToTop !== false) {
    window.scrollTo(0, 0)
  }
})
```

### 4.2 加载状态管理

```javascript
// 全局加载状态管理
let loadingCount = 0
const loadingElement = document.getElementById('global-loading')

router.beforeEach(() => {
  loadingCount++
  showGlobalLoading()
})

router.afterEach(() => {
  loadingCount--
  if (loadingCount <= 0) {
    loadingCount = 0
    hideGlobalLoading()
  }
})

function showGlobalLoading() {
  if (loadingElement) {
    loadingElement.style.display = 'block'
  }
}

function hideGlobalLoading() {
  if (loadingElement) {
    setTimeout(() => {
      loadingElement.style.display = 'none'
    }, 300) // 给过渡动画一些时间
  }
}
```

## 五、错误处理

### 5.1 导航错误捕获

```javascript
import { isNavigationFailure, NavigationFailureType } from 'vue-router'

router.beforeEach(async (to, from) => {
  try {
    // 可能出错的异步操作
    await validateRoute(to)
    return true
  } catch (error) {
    console.error('路由验证失败:', error)
    
    // 根据错误类型处理
    if (error.code === 'UNAUTHORIZED') {
      return { name: 'Login' }
    } else if (error.code === 'FORBIDDEN') {
      return { name: 'AccessDenied' }
    } else {
      return { name: 'Error', params: { code: '500' } }
    }
  }
})

router.afterEach((to, from, failure) => {
  if (failure) {
    if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
      console.log('导航被中止')
    } else if (isNavigationFailure(failure, NavigationFailureType.cancelled)) {
      console.log('导航被取消')
    } else if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
      console.log('重复导航')
    }
  }
})
```

### 5.2 全局错误处理器

```javascript
// 全局错误处理
const errorHandler = {
  handleRouteError(error, to, from) {
    console.error('路由错误:', error)
    
    // 错误上报
    this.reportError(error, { to: to.path, from: from.path })
    
    // 用户提示
    this.showUserError(error)
  },
  
  reportError(error, context) {
    // 发送错误到监控服务
    if (window.Sentry) {
      window.Sentry.captureException(error, { contexts: { route: context } })
    }
  },
  
  showUserError(error) {
    // 显示用户友好的错误信息
    const message = this.getErrorMessage(error)
    showNotification(message, 'error')
  },
  
  getErrorMessage(error) {
    const messages = {
      'NETWORK_ERROR': '网络连接失败，请检查网络设置',
      'UNAUTHORIZED': '登录已过期，请重新登录',
      'FORBIDDEN': '没有访问权限',
      'NOT_FOUND': '页面不存在',
      'SERVER_ERROR': '服务器错误，请稍后重试'
    }
    
    return messages[error.code] || '发生未知错误'
  }
}

// 应用错误处理器
router.beforeEach(async (to, from) => {
  try {
    // 路由逻辑...
  } catch (error) {
    errorHandler.handleRouteError(error, to, from)
    return false // 取消导航
  }
})
```

## 六、性能优化

### 6.1 守卫缓存

```javascript
// 缓存权限检查结果
const permissionCache = new Map()
const cacheTimeout = 5 * 60 * 1000 // 5分钟

router.beforeEach(async (to, from) => {
  const cacheKey = `${to.path}-${getCurrentUserId()}`
  const cached = permissionCache.get(cacheKey)
  
  // 检查缓存
  if (cached && Date.now() - cached.timestamp < cacheTimeout) {
    if (!cached.hasPermission) {
      return { name: 'AccessDenied' }
    }
    return true
  }
  
  // 执行权限检查
  const hasPermission = await checkRoutePermission(to)
  
  // 缓存结果
  permissionCache.set(cacheKey, {
    hasPermission,
    timestamp: Date.now()
  })
  
  if (!hasPermission) {
    return { name: 'AccessDenied' }
  }
})
```

### 6.2 异步守卫优化

```javascript
// 防抖导航守卫
const debouncedGuards = new Map()

router.beforeEach((to, from) => {
  const guardKey = `${from.path}-${to.path}`
  
  // 清除之前的防抖
  if (debouncedGuards.has(guardKey)) {
    clearTimeout(debouncedGuards.get(guardKey))
  }
  
  // 设置新的防抖
  return new Promise(resolve => {
    const timeoutId = setTimeout(() => {
      // 执行实际的守卫逻辑
      performGuardCheck(to, from).then(resolve)
      debouncedGuards.delete(guardKey)
    }, 100)
    
    debouncedGuards.set(guardKey, timeoutId)
  })
})
```

## 七、最佳实践

### 7.1 守卫职责分离

```javascript
// ✅ 好的实践：职责分离
const authGuard = (to, from) => {
  // 只处理身份验证
}

const permissionGuard = (to, from) => {
  // 只处理权限检查
}

const dataGuard = (to, from) => {
  // 只处理数据预加载
}

// 组合守卫
router.beforeEach(authGuard)
router.beforeEach(permissionGuard)
router.beforeResolve(dataGuard)

// ❌ 避免的做法：单个守卫处理所有逻辑
router.beforeEach(async (to, from) => {
  // 身份验证、权限检查、数据加载、页面设置...
  // 代码过于复杂，难以维护
})
```

### 7.2 错误恢复

```javascript
// 错误恢复机制
router.beforeEach(async (to, from) => {
  try {
    return await performNavigation(to)
  } catch (error) {
    // 尝试恢复
    const fallbackRoute = getFallbackRoute(to, error)
    if (fallbackRoute) {
      return fallbackRoute
    }
    
    // 无法恢复，显示错误
    showErrorPage(error)
    return false
  }
})

function getFallbackRoute(targetRoute, error) {
  // 根据错误类型和目标路由确定fallback
  if (error.code === 'UNAUTHORIZED') {
    return { name: 'Login', query: { redirect: targetRoute.fullPath } }
  }
  
  if (targetRoute.meta?.fallback) {
    return targetRoute.meta.fallback
  }
  
  return null
}
```

## 八、总结

| 守卫类型 | 调用时机 | 主要用途 |
|----------|----------|----------|
| beforeEach | 导航触发前 | 权限验证、身份检查 |
| beforeResolve | 组件解析后 | 数据预加载、最终确认 |
| afterEach | 导航完成后 | 页面设置、统计上报 |

## 参考资料

- [导航守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [导航故障](https://router.vuejs.org/guide/advanced/navigation-failures.html)

---

**下一节** → [第 10 节：路由守卫](./10-route-guards.md)
