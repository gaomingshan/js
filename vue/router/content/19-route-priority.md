# 第 19 节：路由优先级

## 概述

路由优先级决定了当多个路由模式可能匹配同一 URL 时，哪个路由会被选中。理解优先级规则对于设计正确的路由结构至关重要。

## 一、优先级规则

### 1.1 基本优先级顺序

```javascript
const routes = [
  // 1. 静态路由 - 最高优先级
  { path: '/user/profile', component: UserProfile },
  { path: '/user/settings', component: UserSettings },
  
  // 2. 动态路由 - 中等优先级
  { path: '/user/:id', component: UserDetail },
  
  // 3. 通配符路由 - 最低优先级
  { path: '/user/:pathMatch(.*)*', component: UserNotFound },
  { path: '/:pathMatch(.*)*', component: NotFound }
]

// URL '/user/profile' 的匹配顺序：
// ✅ /user/profile (静态) - 匹配成功，停止
// ❌ /user/:id (动态) - 不会执行
// ❌ 通配符路由 - 不会执行
```

### 1.2 路由声明顺序

```javascript
// ❌ 错误的顺序 - 通配符路由会拦截所有请求
const badRoutes = [
  { path: '/:pathMatch(.*)*', component: NotFound },     // 会匹配所有路径
  { path: '/user/profile', component: UserProfile },     // 永远不会匹配
  { path: '/user/:id', component: UserDetail }           // 永远不会匹配
]

// ✅ 正确的顺序 - 从具体到通用
const goodRoutes = [
  { path: '/user/profile', component: UserProfile },     // 最具体
  { path: '/user/:id', component: UserDetail },          // 中等具体
  { path: '/:pathMatch(.*)*', component: NotFound }      // 最通用
]
```

## 二、匹配算法详解

### 2.1 路径分析

```javascript
// 路由优先级分析器
class RoutePriorityAnalyzer {
  analyzePath(path) {
    return {
      segments: this.getSegments(path),
      staticCount: this.getStaticSegmentCount(path),
      dynamicCount: this.getDynamicSegmentCount(path),
      wildcardCount: this.getWildcardCount(path),
      specificity: this.calculateSpecificity(path)
    }
  }
  
  getSegments(path) {
    return path.split('/').filter(segment => segment !== '')
  }
  
  getStaticSegmentCount(path) {
    const segments = this.getSegments(path)
    return segments.filter(segment => 
      !segment.startsWith(':') && !segment.includes('*')
    ).length
  }
  
  getDynamicSegmentCount(path) {
    const segments = this.getSegments(path)
    return segments.filter(segment => 
      segment.startsWith(':') && !segment.includes('*')
    ).length
  }
  
  getWildcardCount(path) {
    return (path.match(/\*/g) || []).length
  }
  
  calculateSpecificity(path) {
    // 计算路由具体程度得分
    const static = this.getStaticSegmentCount(path) * 100
    const dynamic = this.getDynamicSegmentCount(path) * 10
    const wildcard = this.getWildcardCount(path) * 1
    
    return static + dynamic - wildcard
  }
  
  compareRoutes(routeA, routeB) {
    const scoreA = this.calculateSpecificity(routeA.path)
    const scoreB = this.calculateSpecificity(routeB.path)
    
    // 分数高的优先级更高
    return scoreB - scoreA
  }
}

// 使用示例
const analyzer = new RoutePriorityAnalyzer()

const routes = [
  { path: '/user/:id/posts/:postId', component: UserPost },      // 得分：120
  { path: '/user/:id', component: User },                        // 得分：110
  { path: '/user/profile', component: UserProfile },             // 得分：200
  { path: '/:category/:id', component: CategoryItem },           // 得分：20
  { path: '/:pathMatch(.*)*', component: NotFound }              // 得分：-1
]

// 排序后的优先级：
// 1. /user/profile (200)
// 2. /user/:id/posts/:postId (120)
// 3. /user/:id (110)
// 4. /:category/:id (20)
// 5. /:pathMatch(.*)* (-1)
```

### 2.2 参数约束的影响

```javascript
const routes = [
  // 有约束的参数优先级更高
  { path: '/user/:id(\\d+)', component: UserById },        // 数字ID
  { path: '/user/:slug([a-z-]+)', component: UserBySlug }, // 字符串slug
  { path: '/user/:id', component: User },                  // 无约束参数
]

// URL '/user/123' 的匹配：
// ✅ /user/:id(\\d+) - 约束匹配，选中
// ❌ /user/:slug([a-z-]+) - 约束不匹配
// ❌ /user/:id - 不会检查（已找到更具体的匹配）

// URL '/user/john-doe' 的匹配：
// ❌ /user/:id(\\d+) - 约束不匹配
// ✅ /user/:slug([a-z-]+) - 约束匹配，选中
// ❌ /user/:id - 不会检查
```

## 三、嵌套路由优先级

### 3.1 父子路由匹配

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      // 子路由也遵循优先级规则
      { path: 'users/profile', component: AdminUserProfile },  // 最具体
      { path: 'users/:id', component: AdminUserDetail },       // 中等具体
      { path: ':section', component: AdminSection },           // 最通用
      { path: '', component: AdminHome }                       // 默认路由
    ]
  }
]

// URL '/admin/users/profile' 的匹配过程：
// 1. 匹配父路由 '/admin'
// 2. 在子路由中匹配 'users/profile'
// 3. 'users/profile' 优先于 'users/:id' 和 ':section'
```

### 3.2 跨层级优先级

```javascript
const routes = [
  // 平级路由
  { path: '/api/users', component: ApiUsers },
  
  // 嵌套路由
  {
    path: '/api',
    component: ApiLayout,
    children: [
      { path: 'docs', component: ApiDocs },
      { path: ':version', component: ApiVersion }
    ]
  }
]

// URL '/api/users' 的匹配：
// ✅ /api/users (平级静态路由) - 优先匹配
// ❌ /api + users (嵌套路由) - 不会尝试
```

## 四、优先级冲突处理

### 4.1 路由冲突检测

```javascript
class RouteConflictDetector {
  constructor(routes) {
    this.routes = routes
    this.conflicts = []
  }
  
  detectConflicts() {
    this.conflicts = []
    
    for (let i = 0; i < this.routes.length; i++) {
      for (let j = i + 1; j < this.routes.length; j++) {
        const routeA = this.routes[i]
        const routeB = this.routes[j]
        
        if (this.hasConflict(routeA, routeB)) {
          this.conflicts.push({
            routes: [routeA, routeB],
            type: this.getConflictType(routeA, routeB),
            severity: this.getConflictSeverity(routeA, routeB)
          })
        }
      }
    }
    
    return this.conflicts
  }
  
  hasConflict(routeA, routeB) {
    // 生成测试URL来检测冲突
    const testUrls = this.generateTestUrls(routeA, routeB)
    
    return testUrls.some(url => {
      return this.matchesRoute(url, routeA) && this.matchesRoute(url, routeB)
    })
  }
  
  generateTestUrls(routeA, routeB) {
    const urls = []
    
    // 基于路由模式生成测试URL
    const urlsFromA = this.generateUrlsFromRoute(routeA)
    const urlsFromB = this.generateUrlsFromRoute(routeB)
    
    return [...urlsFromA, ...urlsFromB]
  }
  
  generateUrlsFromRoute(route) {
    const urls = []
    let url = route.path
    
    // 替换参数为示例值
    url = url.replace(/:(\w+)(\([^)]*\))?/g, (match, paramName, constraint) => {
      if (constraint) {
        // 根据约束生成示例值
        if (constraint.includes('\\d+')) return '123'
        if (constraint.includes('[a-z-]+')) return 'example'
      }
      return 'test'
    })
    
    // 处理通配符
    url = url.replace(/\*+/g, 'wildcard/path')
    
    urls.push(url)
    return urls
  }
  
  matchesRoute(url, route) {
    try {
      const regex = this.pathToRegex(route.path)
      return regex.test(url)
    } catch {
      return false
    }
  }
  
  pathToRegex(path) {
    let regex = path
      .replace(/:[^(/]+(\([^)]*\))?/g, (match, constraint) => {
        return constraint ? constraint.slice(1, -1) : '[^/]+'
      })
      .replace(/\*+/g, '.*')
    
    return new RegExp(`^${regex}$`)
  }
  
  getConflictType(routeA, routeB) {
    if (routeA.path === routeB.path) return 'exact-duplicate'
    if (this.isOneMoreSpecific(routeA, routeB)) return 'specificity-conflict'
    return 'pattern-overlap'
  }
  
  getConflictSeverity(routeA, routeB) {
    if (routeA.path === routeB.path) return 'high'
    if (routeA.name === routeB.name) return 'high'
    return 'medium'
  }
  
  isOneMoreSpecific(routeA, routeB) {
    const analyzer = new RoutePriorityAnalyzer()
    const scoreA = analyzer.calculateSpecificity(routeA.path)
    const scoreB = analyzer.calculateSpecificity(routeB.path)
    
    return Math.abs(scoreA - scoreB) > 50 // 分数差异较大
  }
  
  generateReport() {
    const conflicts = this.detectConflicts()
    
    if (conflicts.length === 0) {
      console.log('✅ 未发现路由冲突')
      return
    }
    
    console.warn(`⚠️ 发现 ${conflicts.length} 个路由冲突:`)
    
    conflicts.forEach((conflict, index) => {
      console.group(`冲突 ${index + 1}: ${conflict.type} (${conflict.severity})`)
      console.log('路由A:', conflict.routes[0].path, conflict.routes[0].name)
      console.log('路由B:', conflict.routes[1].path, conflict.routes[1].name)
      console.log('建议:', this.getSuggestion(conflict))
      console.groupEnd()
    })
  }
  
  getSuggestion(conflict) {
    switch (conflict.type) {
      case 'exact-duplicate':
        return '删除重复的路由或使用不同的路径'
      case 'specificity-conflict':
        return '调整路由顺序，将更具体的路由放在前面'
      case 'pattern-overlap':
        return '添加参数约束或修改路径模式以避免重叠'
      default:
        return '检查路由配置并解决冲突'
    }
  }
}

// 使用冲突检测器
const detector = new RouteConflictDetector(routes)
detector.generateReport()
```

### 4.2 自动路由排序

```javascript
class RouteOptimizer {
  constructor(routes) {
    this.routes = routes
    this.analyzer = new RoutePriorityAnalyzer()
  }
  
  optimizeRoutes() {
    // 1. 检测并报告冲突
    const detector = new RouteConflictDetector(this.routes)
    const conflicts = detector.detectConflicts()
    
    if (conflicts.length > 0) {
      console.warn('发现路由冲突，将尝试自动优化')
    }
    
    // 2. 按优先级排序
    const sortedRoutes = this.sortByPriority(this.routes)
    
    // 3. 处理嵌套路由
    const optimizedRoutes = this.optimizeNestedRoutes(sortedRoutes)
    
    return optimizedRoutes
  }
  
  sortByPriority(routes) {
    return [...routes].sort((a, b) => {
      return this.analyzer.compareRoutes(a, b)
    })
  }
  
  optimizeNestedRoutes(routes) {
    return routes.map(route => {
      if (route.children) {
        return {
          ...route,
          children: this.sortByPriority(route.children)
        }
      }
      return route
    })
  }
  
  validateOptimization(originalRoutes, optimizedRoutes) {
    // 生成测试用例验证优化是否正确
    const testCases = this.generateTestCases(originalRoutes)
    
    const results = testCases.map(testCase => {
      const originalMatch = this.findMatch(testCase.url, originalRoutes)
      const optimizedMatch = this.findMatch(testCase.url, optimizedRoutes)
      
      return {
        url: testCase.url,
        originalMatch: originalMatch?.name,
        optimizedMatch: optimizedMatch?.name,
        consistent: originalMatch?.name === optimizedMatch?.name
      }
    })
    
    const inconsistencies = results.filter(result => !result.consistent)
    
    if (inconsistencies.length > 0) {
      console.error('路由优化导致匹配结果不一致:', inconsistencies)
    } else {
      console.log('✅ 路由优化验证通过')
    }
    
    return inconsistencies.length === 0
  }
  
  generateTestCases(routes) {
    const testCases = []
    
    routes.forEach(route => {
      // 为每个路由生成测试URL
      const testUrls = this.generateTestUrlsForRoute(route)
      testUrls.forEach(url => {
        testCases.push({ url, expectedRoute: route.name })
      })
    })
    
    return testCases
  }
  
  generateTestUrlsForRoute(route) {
    // 实现测试URL生成逻辑
    return [route.path.replace(/:[\w]+/g, 'test')]
  }
  
  findMatch(url, routes) {
    // 简化的匹配逻辑
    return routes.find(route => {
      const regex = this.pathToRegex(route.path)
      return regex.test(url)
    })
  }
  
  pathToRegex(path) {
    let regex = path.replace(/:[^(/]+/g, '[^/]+')
    return new RegExp(`^${regex}$`)
  }
}

// 使用路由优化器
const optimizer = new RouteOptimizer(routes)
const optimizedRoutes = optimizer.optimizeRoutes()

// 验证优化结果
if (optimizer.validateOptimization(routes, optimizedRoutes)) {
  console.log('使用优化后的路由配置')
  // router.options.routes = optimizedRoutes
}
```

## 五、实际应用场景

### 5.1 API 路由优先级

```javascript
const apiRoutes = [
  // 具体API端点
  { path: '/api/users/current', component: CurrentUser },
  { path: '/api/users/search', component: UserSearch },
  
  // 带版本的API
  { path: '/api/v2/users/:id', component: UserV2 },
  { path: '/api/v1/users/:id', component: UserV1 },
  
  // 通用API
  { path: '/api/users/:id', component: User },
  
  // API文档
  { path: '/api/docs/:section?', component: ApiDocs },
  
  // 通配符（最后）
  { path: '/api/:pathMatch(.*)*', component: ApiNotFound }
]

// 优先级顺序确保：
// 1. /api/users/current 优先于 /api/users/:id
// 2. 版本化API优先于通用API
// 3. 具体路径优先于通配符
```

### 5.2 多语言路由

```javascript
const i18nRoutes = [
  // 具体语言路由
  { path: '/en/about', component: AboutEn },
  { path: '/zh/about', component: AboutZh },
  
  // 动态语言路由
  { path: '/:locale(en|zh|fr)/about', component: AboutI18n },
  
  // 默认语言路由（无前缀）
  { path: '/about', component: About },
  
  // 语言重定向
  { path: '/:locale(en|zh|fr)', redirect: (to) => `${to.params.locale}/home` },
  
  // 根路径重定向
  { path: '/', redirect: '/en' }
]

// 确保具体语言路由优先于通用模式
```

## 六、调试优先级问题

### 6.1 优先级调试工具

```javascript
class RoutePriorityDebugger {
  constructor(router) {
    this.router = router
    this.enabled = process.env.NODE_ENV === 'development'
  }
  
  debugPath(path) {
    if (!this.enabled) return
    
    console.group(`🔍 路由优先级调试: ${path}`)
    
    const allRoutes = this.router.getRoutes()
    const matches = []
    
    // 找到所有可能匹配的路由
    allRoutes.forEach((route, index) => {
      if (this.testMatch(path, route.path)) {
        const analyzer = new RoutePriorityAnalyzer()
        matches.push({
          index,
          route,
          specificity: analyzer.calculateSpecificity(route.path)
        })
      }
    })
    
    // 按匹配顺序排序
    matches.sort((a, b) => a.index - b.index)
    
    console.log(`找到 ${matches.length} 个可能的匹配:`)
    matches.forEach((match, i) => {
      const status = i === 0 ? '✅ 选中' : '❌ 跳过'
      console.log(`${status} [${match.index}] ${match.route.path} (specificity: ${match.specificity})`)
    })
    
    if (matches.length === 0) {
      console.warn('❌ 没有匹配的路由')
    }
    
    console.groupEnd()
  }
  
  testMatch(url, pattern) {
    try {
      const regex = this.pathToRegex(pattern)
      return regex.test(url)
    } catch {
      return false
    }
  }
  
  pathToRegex(path) {
    let regex = path
      .replace(/:[^(/]+(\([^)]*\))?/g, (match, constraint) => {
        return constraint ? constraint.slice(1, -1) : '[^/]+'
      })
      .replace(/\*+/g, '.*')
    
    return new RegExp(`^${regex}$`)
  }
  
  analyzeRouteOrder() {
    console.group('📊 路由顺序分析')
    
    const routes = this.router.getRoutes()
    const analyzer = new RoutePriorityAnalyzer()
    
    const analysis = routes.map((route, index) => ({
      index,
      path: route.path,
      name: route.name,
      specificity: analyzer.calculateSpecificity(route.path)
    }))
    
    console.table(analysis)
    
    // 检查是否有顺序问题
    const issues = []
    for (let i = 0; i < analysis.length - 1; i++) {
      const current = analysis[i]
      const next = analysis[i + 1]
      
      if (current.specificity < next.specificity) {
        issues.push({
          problem: '顺序错误',
          current: current.path,
          next: next.path,
          suggestion: '更具体的路由应该放在前面'
        })
      }
    }
    
    if (issues.length > 0) {
      console.warn('发现路由顺序问题:')
      console.table(issues)
    } else {
      console.log('✅ 路由顺序正确')
    }
    
    console.groupEnd()
  }
}

// 使用优先级调试器
const debugger = new RoutePriorityDebugger(router)

// 调试特定路径
debugger.debugPath('/user/profile')

// 分析整体路由顺序
debugger.analyzeRouteOrder()
```

### 6.2 性能监控

```javascript
// 路由匹配性能监控
const monitorRouteMatching = () => {
  const originalResolve = router.resolve
  
  router.resolve = function(to) {
    const start = performance.now()
    const result = originalResolve.call(this, to)
    const duration = performance.now() - start
    
    // 记录慢匹配
    if (duration > 5) {
      console.warn(`慢路由匹配: ${typeof to === 'string' ? to : to.path} (${duration.toFixed(2)}ms)`)
    }
    
    return result
  }
}

// 启用监控
if (process.env.NODE_ENV === 'development') {
  monitorRouteMatching()
}
```

## 七、最佳实践

### 7.1 路由设计原则

```javascript
// ✅ 优秀的路由优先级设计
const excellentRoutes = [
  // 1. 最具体的静态路由在前
  { path: '/admin/dashboard', component: AdminDashboard },
  { path: '/admin/users/new', component: AdminUserNew },
  { path: '/admin/users/bulk', component: AdminUserBulk },
  
  // 2. 带约束的动态路由
  { path: '/admin/users/:id(\\d+)', component: AdminUser },
  { path: '/admin/users/:slug([a-z-]+)', component: AdminUserBySlug },
  
  // 3. 一般动态路由
  { path: '/admin/:section', component: AdminSection },
  
  // 4. 通配符路由在最后
  { path: '/:pathMatch(.*)*', component: NotFound }
]

// ❌ 问题路由设计
const problematicRoutes = [
  // 通配符在前面会拦截所有请求
  { path: '/:pathMatch(.*)*', component: NotFound },
  
  // 通用模式在具体模式之前
  { path: '/user/:id', component: User },
  { path: '/user/profile', component: UserProfile }, // 永远不会匹配
  
  // 没有约束的重叠模式
  { path: '/item/:id', component: Item },
  { path: '/item/:slug', component: ItemBySlug } // 会冲突
]
```

### 7.2 测试策略

```javascript
// 路由优先级测试套件
describe('路由优先级', () => {
  const routes = [
    { path: '/user/profile', name: 'UserProfile', component: UserProfile },
    { path: '/user/:id(\\d+)', name: 'UserById', component: UserById },
    { path: '/user/:slug', name: 'UserBySlug', component: UserBySlug }
  ]
  
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })
  
  test('静态路由优先于动态路由', async () => {
    const resolved = router.resolve('/user/profile')
    expect(resolved.name).toBe('UserProfile')
  })
  
  test('约束参数优先级正确', async () => {
    const numericUser = router.resolve('/user/123')
    expect(numericUser.name).toBe('UserById')
    
    const slugUser = router.resolve('/user/john-doe')
    expect(slugUser.name).toBe('UserBySlug')
  })
  
  test('路由不会误匹配', async () => {
    const resolved = router.resolve('/user/profile')
    expect(resolved.params.id).toBeUndefined()
  })
})
```

## 八、总结

| 优先级 | 路由类型 | 示例 | 说明 |
|--------|----------|------|------|
| 最高 | 静态路由 | `/user/profile` | 精确匹配，无参数 |
| 高 | 约束动态路由 | `/user/:id(\\d+)` | 有正则约束 |
| 中 | 普通动态路由 | `/user/:id` | 无约束参数 |
| 低 | 可选参数路由 | `/posts/:id?` | 可选参数 |
| 最低 | 通配符路由 | `/:pathMatch(.*)` | 匹配所有 |

## 参考资料

- [路由匹配语法](https://router.vuejs.org/guide/essentials/route-matching-syntax.html)
- [动态路由匹配](https://router.vuejs.org/guide/essentials/dynamic-matching.html)

---

**下一节** → [第 20 节：Hash 模式](./20-hash-mode.md)
