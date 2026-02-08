# 第 10 节：路由守卫

## 概述

路由守卫是定义在特定路由配置上的导航钩子，只对该路由及其子路由生效。它提供了更精确的导航控制，适用于特定页面的权限验证、数据加载等场景。

## 一、beforeEnter 守卫

### 1.1 基础用法

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminDashboard,
    beforeEnter: (to, from) => {
      // 只有访问 /admin 路由时才会执行
      console.log('进入管理后台')
      
      // 检查管理员权限
      if (!isAdmin()) {
        return { name: 'Login' }
      }
    }
  }
]
```

### 1.2 多个守卫函数

```javascript
const routes = [
  {
    path: '/protected',
    component: ProtectedPage,
    beforeEnter: [
      // 守卫数组，按顺序执行
      checkAuthentication,
      checkPermission,
      logAccess
    ]
  }
]

// 守卫函数定义
function checkAuthentication(to, from) {
  if (!isLoggedIn()) {
    return { name: 'Login' }
  }
}

function checkPermission(to, from) {
  if (!hasPermission(to.meta.permission)) {
    return { name: 'Forbidden' }
  }
}

function logAccess(to, from) {
  console.log(`用户访问了 ${to.path}`)
}
```

### 1.3 异步守卫

```javascript
const routes = [
  {
    path: '/user/:id',
    component: UserProfile,
    beforeEnter: async (to, from) => {
      try {
        // 验证用户存在
        const user = await fetchUser(to.params.id)
        
        if (!user) {
          return { name: 'UserNotFound' }
        }
        
        // 检查访问权限
        const canView = await checkUserViewPermission(user.id)
        
        if (!canView) {
          return { name: 'AccessDenied' }
        }
        
        // 将用户数据存储，供组件使用
        to.meta.userData = user
        
      } catch (error) {
        console.error('用户验证失败:', error)
        return { name: 'Error' }
      }
    }
  }
]
```

## 二、权限控制模式

### 2.1 角色基础权限

```javascript
// 权限配置
const adminRoutes = {
  path: '/admin',
  component: AdminLayout,
  beforeEnter: requireRole('admin'),
  children: [
    {
      path: 'users',
      component: UserManagement,
      beforeEnter: requirePermission('user:read')
    },
    {
      path: 'settings',
      component: SystemSettings,
      beforeEnter: requireRole(['admin', 'super-admin'])
    }
  ]
}

// 权限检查工具函数
function requireRole(roles) {
  return (to, from) => {
    const userRoles = getCurrentUserRoles()
    const requiredRoles = Array.isArray(roles) ? roles : [roles]
    
    const hasRole = requiredRoles.some(role => userRoles.includes(role))
    
    if (!hasRole) {
      return { 
        name: 'AccessDenied', 
        params: { requiredRole: requiredRoles.join(' 或 ') }
      }
    }
  }
}

function requirePermission(permission) {
  return async (to, from) => {
    const permissions = await getUserPermissions()
    
    if (!permissions.includes(permission)) {
      return { name: 'InsufficientPermission' }
    }
  }
}
```

### 2.2 动态权限验证

```javascript
const routes = [
  {
    path: '/document/:id',
    component: DocumentViewer,
    beforeEnter: async (to, from) => {
      const documentId = to.params.id
      
      try {
        // 检查文档权限
        const access = await checkDocumentAccess(documentId)
        
        switch (access.level) {
          case 'none':
            return { name: 'DocumentNotFound' }
          
          case 'read':
            to.meta.readOnly = true
            break
          
          case 'write':
            to.meta.readOnly = false
            break
          
          case 'admin':
            to.meta.readOnly = false
            to.meta.canDelete = true
            break
        }
        
        // 存储文档信息
        to.meta.document = access.document
        
      } catch (error) {
        console.error('文档权限检查失败:', error)
        return { name: 'Error' }
      }
    }
  }
]

async function checkDocumentAccess(documentId) {
  const response = await fetch(`/api/documents/${documentId}/access`)
  
  if (!response.ok) {
    throw new Error('权限检查失败')
  }
  
  return response.json()
}
```

## 三、数据预加载

### 3.1 页面数据预加载

```javascript
const routes = [
  {
    path: '/products/:category',
    component: ProductList,
    beforeEnter: async (to, from) => {
      const category = to.params.category
      
      try {
        // 预加载产品数据
        const [products, filters, pagination] = await Promise.all([
          fetchProducts(category, to.query),
          fetchCategoryFilters(category),
          fetchPaginationInfo(category, to.query)
        ])
        
        // 将数据注入到路由元信息
        to.meta.preloadedData = {
          products,
          filters,
          pagination
        }
        
        // 更新页面标题
        to.meta.title = `${category} 产品`
        
      } catch (error) {
        console.error('数据预加载失败:', error)
        
        // 可以选择继续导航或重定向到错误页
        if (error.status === 404) {
          return { name: 'CategoryNotFound' }
        } else {
          // 继续导航，但在组件中处理错误
          to.meta.loadError = error
        }
      }
    }
  }
]
```

### 3.2 条件数据加载

```javascript
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    beforeEnter: async (to, from) => {
      const user = getCurrentUser()
      
      // 根据用户角色加载不同数据
      const dataLoaders = []
      
      if (user.roles.includes('sales')) {
        dataLoaders.push(loadSalesData())
      }
      
      if (user.roles.includes('marketing')) {
        dataLoaders.push(loadMarketingData())
      }
      
      if (user.roles.includes('admin')) {
        dataLoaders.push(loadSystemData())
      }
      
      try {
        const results = await Promise.all(dataLoaders)
        to.meta.dashboardData = results
      } catch (error) {
        console.error('仪表板数据加载失败:', error)
        to.meta.dataError = error
      }
    }
  }
]
```

## 四、参数验证

### 4.1 路径参数验证

```javascript
const routes = [
  {
    path: '/user/:userId(\\d+)',
    component: UserProfile,
    beforeEnter: (to, from) => {
      const userId = parseInt(to.params.userId, 10)
      
      // 验证用户ID范围
      if (userId <= 0 || userId > 999999) {
        return { name: 'InvalidUser' }
      }
      
      // 检查用户是否存在（可以是同步检查缓存）
      if (!isUserIdValid(userId)) {
        return { name: 'UserNotFound' }
      }
    }
  },
  
  {
    path: '/article/:slug',
    component: Article,
    beforeEnter: (to, from) => {
      const slug = to.params.slug
      
      // 验证 slug 格式
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return { name: 'InvalidArticleUrl' }
      }
      
      // 验证长度
      if (slug.length > 100) {
        return { name: 'ArticleNotFound' }
      }
    }
  }
]
```

### 4.2 查询参数验证

```javascript
const routes = [
  {
    path: '/search',
    component: SearchResults,
    beforeEnter: (to, from) => {
      const query = to.query
      
      // 验证搜索参数
      const validation = validateSearchQuery(query)
      
      if (!validation.valid) {
        // 重定向到修正后的URL
        return {
          path: '/search',
          query: validation.correctedQuery
        }
      }
    }
  }
]

function validateSearchQuery(query) {
  const corrected = { ...query }
  let needsCorrection = false
  
  // 验证页码
  const page = parseInt(query.page, 10)
  if (isNaN(page) || page < 1) {
    corrected.page = '1'
    needsCorrection = true
  } else if (page > 1000) {
    corrected.page = '1000'
    needsCorrection = true
  }
  
  // 验证排序
  const validSorts = ['relevance', 'date', 'popularity']
  if (query.sort && !validSorts.includes(query.sort)) {
    corrected.sort = 'relevance'
    needsCorrection = true
  }
  
  // 验证搜索词长度
  if (query.q && query.q.length > 200) {
    corrected.q = query.q.substring(0, 200)
    needsCorrection = true
  }
  
  return {
    valid: !needsCorrection,
    correctedQuery: corrected
  }
}
```

## 五、缓存策略

### 5.1 守卫结果缓存

```javascript
// 缓存守卫执行结果
const guardCache = new Map()

const routes = [
  {
    path: '/expensive-check/:id',
    component: ExpensiveComponent,
    beforeEnter: async (to, from) => {
      const cacheKey = `expensive-${to.params.id}`
      
      // 检查缓存
      if (guardCache.has(cacheKey)) {
        const cached = guardCache.get(cacheKey)
        
        // 检查缓存是否过期（5分钟）
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
          console.log('使用缓存的守卫结果')
          return cached.result
        } else {
          guardCache.delete(cacheKey)
        }
      }
      
      // 执行昂贵的检查
      const result = await performExpensiveCheck(to.params.id)
      
      // 缓存结果
      guardCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      })
      
      return result
    }
  }
]
```

### 5.2 数据缓存策略

```javascript
const dataCache = new Map()

const routes = [
  {
    path: '/cached-data/:type',
    component: CachedDataComponent,
    beforeEnter: async (to, from) => {
      const dataType = to.params.type
      const cacheKey = `data-${dataType}`
      
      // 检查缓存
      const cached = dataCache.get(cacheKey)
      if (cached && !isCacheExpired(cached)) {
        to.meta.data = cached.data
        to.meta.fromCache = true
        return
      }
      
      try {
        // 加载新数据
        const data = await loadData(dataType)
        
        // 更新缓存
        dataCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          expires: getDataExpiration(dataType)
        })
        
        to.meta.data = data
        to.meta.fromCache = false
        
      } catch (error) {
        // 如果有过期缓存，使用它
        if (cached) {
          to.meta.data = cached.data
          to.meta.fromCache = true
          to.meta.staleData = true
        } else {
          throw error
        }
      }
    }
  }
]

function isCacheExpired(cached) {
  return Date.now() > cached.expires
}

function getDataExpiration(dataType) {
  const expirations = {
    'user': 10 * 60 * 1000,      // 10分钟
    'product': 30 * 60 * 1000,   // 30分钟
    'static': 24 * 60 * 60 * 1000 // 24小时
  }
  
  return Date.now() + (expirations[dataType] || 5 * 60 * 1000)
}
```

## 六、错误处理

### 6.1 优雅降级

```javascript
const routes = [
  {
    path: '/resilient-page',
    component: ResilientPage,
    beforeEnter: async (to, from) => {
      const checks = []
      
      // 尝试多个数据源
      try {
        // 主要数据源
        checks.push(loadPrimaryData())
      } catch (error) {
        console.warn('主要数据源失败，尝试备用源')
        checks.push(loadFallbackData())
      }
      
      try {
        // 可选数据
        checks.push(loadOptionalData())
      } catch (error) {
        console.warn('可选数据加载失败，继续渲染')
        checks.push(Promise.resolve(null))
      }
      
      const [primaryData, optionalData] = await Promise.all(checks)
      
      to.meta.pageData = {
        primary: primaryData,
        optional: optionalData,
        degraded: !optionalData
      }
    }
  }
]
```

### 6.2 重试机制

```javascript
const routes = [
  {
    path: '/retry-page',
    component: RetryPage,
    beforeEnter: async (to, from) => {
      const maxRetries = 3
      let attempt = 0
      
      while (attempt < maxRetries) {
        try {
          const data = await loadCriticalData()
          to.meta.data = data
          return
          
        } catch (error) {
          attempt++
          console.warn(`数据加载失败 (尝试 ${attempt}/${maxRetries}):`, error)
          
          if (attempt >= maxRetries) {
            // 最终失败
            console.error('数据加载彻底失败')
            return { name: 'DataLoadError' }
          }
          
          // 等待后重试
          await new Promise(resolve => 
            setTimeout(resolve, 1000 * attempt)
          )
        }
      }
    }
  }
]
```

## 七、路由守卫组合

### 7.1 守卫链

```javascript
// 创建守卫链
function createGuardChain(...guards) {
  return async (to, from) => {
    for (const guard of guards) {
      const result = await guard(to, from)
      
      // 如果守卫返回导航结果，停止链式执行
      if (result !== undefined && result !== true) {
        return result
      }
    }
  }
}

// 使用守卫链
const routes = [
  {
    path: '/complex-page',
    component: ComplexPage,
    beforeEnter: createGuardChain(
      checkAuthentication,
      validateParameters,
      checkPermission,
      preloadData,
      logAccess
    )
  }
]
```

### 7.2 条件守卫

```javascript
// 条件守卫执行
function conditionalGuard(condition, guard) {
  return (to, from) => {
    if (condition(to, from)) {
      return guard(to, from)
    }
  }
}

const routes = [
  {
    path: '/conditional-page',
    component: ConditionalPage,
    beforeEnter: [
      // 只在开发环境执行的守卫
      conditionalGuard(
        () => process.env.NODE_ENV === 'development',
        developmentOnlyGuard
      ),
      
      // 只在特定时间执行的守卫
      conditionalGuard(
        () => isBusinessHours(),
        businessHoursGuard
      ),
      
      // 基于用户类型的守卫
      conditionalGuard(
        (to, from) => isVipUser(),
        vipUserGuard
      )
    ]
  }
]
```

## 八、最佳实践

### 8.1 守卫复用

```javascript
// ✅ 创建可复用的守卫工厂
const createAuthGuard = (requiredLevel) => {
  return async (to, from) => {
    const user = await getCurrentUser()
    
    if (!user || user.level < requiredLevel) {
      return { name: 'Login' }
    }
  }
}

// ✅ 参数化守卫
const createDataGuard = (dataType, required = true) => {
  return async (to, from) => {
    try {
      const data = await loadData(dataType, to.params)
      to.meta[dataType] = data
    } catch (error) {
      if (required) {
        return { name: 'DataError' }
      }
      to.meta[dataType] = null
    }
  }
}

// 使用
const routes = [
  {
    path: '/admin',
    beforeEnter: createAuthGuard(5) // 需要等级5
  },
  {
    path: '/user/:id',
    beforeEnter: createDataGuard('user', true) // 必需数据
  }
]
```

### 8.2 错误边界

```javascript
// 守卫错误边界
function withErrorBoundary(guard) {
  return async (to, from) => {
    try {
      return await guard(to, from)
    } catch (error) {
      console.error('守卫执行失败:', error)
      
      // 错误上报
      reportGuardError(error, to, from)
      
      // 返回安全的默认行为
      return { name: 'Error' }
    }
  }
}

// 使用错误边界
const routes = [
  {
    path: '/safe-page',
    beforeEnter: withErrorBoundary(async (to, from) => {
      // 可能出错的守卫逻辑
      const data = await riskyOperation()
      to.meta.data = data
    })
  }
]
```

## 九、总结

| 特性 | 说明 |
|------|------|
| beforeEnter | 路由独享守卫，只对特定路由生效 |
| 守卫数组 | 可以定义多个守卫按顺序执行 |
| 异步支持 | 支持 Promise 和 async/await |
| 参数验证 | 验证路径参数和查询参数 |
| 数据预加载 | 在进入路由前预加载数据 |
| 权限控制 | 精确控制特定路由的访问权限 |

## 参考资料

- [路由独享守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html#per-route-guard)
- [路由元信息](https://router.vuejs.org/guide/advanced/meta.html)

---

**下一节** → [第 11 节：组件守卫](./11-component-guards.md)
