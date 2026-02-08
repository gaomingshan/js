# 第 17 节：路由匹配算法

## 概述

路由匹配算法是 Vue Router 的核心功能，负责将 URL 路径与路由配置进行匹配，找到对应的组件进行渲染。理解匹配算法有助于优化路由配置和解决匹配问题。

## 一、匹配原理

### 1.1 匹配流程

```
URL: /user/123/posts
         ↓
1. 路径分割: ['user', '123', 'posts']
         ↓
2. 遍历路由表，逐个尝试匹配
         ↓
3. 生成匹配结果: { matched: [...], params: {...} }
```

### 1.2 匹配结果结构

```javascript
// 匹配结果示例
const matchResult = {
  path: '/user/123/posts',
  matched: [
    // 父路由记录
    {
      path: '/user/:id',
      component: UserLayout,
      regex: /^\/user\/((?:[^\/]+?))$/,
      keys: [{ name: 'id', optional: false }]
    },
    // 子路由记录
    {
      path: 'posts',
      component: UserPosts,
      regex: /^posts$/,
      keys: []
    }
  ],
  params: { id: '123' },
  query: {},
  hash: ''
}
```

### 1.3 路径编译

```javascript
// 路由路径编译过程
const pathToRegexp = (path) => {
  // '/user/:id' 编译为正则表达式
  
  // 1. 解析参数
  const keys = []
  let regex = path
    .replace(/:([^\/]+)/g, (match, key) => {
      keys.push({ name: key, optional: false })
      return '([^/]+)'  // 替换为捕获组
    })
  
  // 2. 生成正则
  regex = new RegExp(`^${regex}$`)
  
  return { regex, keys }
}

// 示例
const compiled = pathToRegexp('/user/:id')
// {
//   regex: /^\/user\/([^/]+)$/,
//   keys: [{ name: 'id', optional: false }]
// }
```

## 二、匹配策略

### 2.1 精确匹配

```javascript
const routes = [
  {
    path: '/about',
    component: About
  }
]

// 匹配规则：
// ✅ '/about'     → 匹配
// ❌ '/about/'    → 不匹配 
// ❌ '/about/us'  → 不匹配
```

### 2.2 参数匹配

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User
  }
]

// 匹配规则：
// ✅ '/user/123'   → 匹配，params: { id: '123' }
// ✅ '/user/abc'   → 匹配，params: { id: 'abc' }
// ❌ '/user'       → 不匹配
// ❌ '/user/123/posts' → 不匹配（除非有子路由）
```

### 2.3 通配符匹配

```javascript
const routes = [
  {
    path: '/files/:path(.*)',
    component: FileViewer
  }
]

// 匹配规则：
// ✅ '/files/docs'           → params: { path: 'docs' }
// ✅ '/files/docs/readme.md' → params: { path: 'docs/readme.md' }
// ✅ '/files/'               → params: { path: '' }
```

## 三、路径解析

### 3.1 路径标记化

```javascript
// 路径标记化过程
const tokenizePath = (path) => {
  const tokens = []
  let i = 0
  
  while (i < path.length) {
    if (path[i] === ':') {
      // 参数标记
      const start = ++i
      while (i < path.length && path[i] !== '/' && path[i] !== '(') {
        i++
      }
      
      tokens.push({
        type: 'param',
        name: path.slice(start, i)
      })
      
    } else if (path[i] === '*') {
      // 通配符标记
      tokens.push({
        type: 'wildcard'
      })
      i++
      
    } else {
      // 静态标记
      const start = i
      while (i < path.length && path[i] !== ':' && path[i] !== '*') {
        i++
      }
      
      tokens.push({
        type: 'static',
        value: path.slice(start, i)
      })
    }
  }
  
  return tokens
}

// 示例
tokenizePath('/user/:id/posts')
// [
//   { type: 'static', value: '/user/' },
//   { type: 'param', name: 'id' },
//   { type: 'static', value: '/posts' }
// ]
```

### 3.2 正则表达式生成

```javascript
// 从标记生成正则表达式
const tokensToRegex = (tokens) => {
  let pattern = '^'
  const keys = []
  
  for (const token of tokens) {
    switch (token.type) {
      case 'static':
        // 转义特殊字符
        pattern += escapeRegex(token.value)
        break
        
      case 'param':
        // 参数捕获组
        pattern += '([^/]+)'
        keys.push({
          name: token.name,
          optional: false
        })
        break
        
      case 'wildcard':
        // 通配符捕获组
        pattern += '(.*)'
        keys.push({
          name: 'pathMatch',
          optional: false
        })
        break
    }
  }
  
  pattern += '$'
  
  return {
    regex: new RegExp(pattern),
    keys
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
```

## 四、参数约束

### 4.1 正则约束

```javascript
const routes = [
  {
    path: '/user/:id(\\d+)',           // 只匹配数字
    component: User
  },
  {
    path: '/article/:slug([a-z-]+)',   // 只匹配小写字母和连字符
    component: Article  
  }
]

// 约束解析
const parseConstraint = (param) => {
  // ':id(\\d+)' → { name: 'id', pattern: '\\d+' }
  const match = param.match(/^([^(]+)(?:\((.+)\))?$/)
  
  if (match) {
    return {
      name: match[1],
      pattern: match[2] || '[^/]+',  // 默认模式
      optional: false
    }
  }
}
```

### 4.2 可选参数

```javascript
const routes = [
  {
    path: '/posts/:page?',
    component: PostList
  }
]

// 匹配：
// ✅ '/posts'     → params: {}
// ✅ '/posts/1'   → params: { page: '1' }
// ✅ '/posts/abc' → params: { page: 'abc' }

// 生成的正则: /^\/posts(?:\/([^/]+))?$/
```

### 4.3 重复参数

```javascript
const routes = [
  {
    path: '/files/:dirs+',      // 一个或多个
    component: FileExplorer
  },
  {
    path: '/tags/:tags*',       // 零个或多个  
    component: TagList
  }
]

// '/files/:dirs+' 匹配：
// ✅ '/files/docs'                → params: { dirs: ['docs'] }
// ✅ '/files/docs/images'         → params: { dirs: ['docs', 'images'] }
// ❌ '/files'                     → 不匹配

// '/tags/:tags*' 匹配：
// ✅ '/tags'                      → params: { tags: [] }
// ✅ '/tags/vue'                  → params: { tags: ['vue'] }
// ✅ '/tags/vue/router'           → params: { tags: ['vue', 'router'] }
```

## 五、匹配优化

### 5.1 路由排序

```javascript
// 路由匹配优先级
const sortRoutes = (routes) => {
  return routes.sort((a, b) => {
    // 1. 静态路由优先于动态路由
    const aStatic = !a.path.includes(':') && !a.path.includes('*')
    const bStatic = !b.path.includes(':') && !b.path.includes('*')
    
    if (aStatic && !bStatic) return -1
    if (!aStatic && bStatic) return 1
    
    // 2. 参数少的优先于参数多的
    const aParams = (a.path.match(/:/g) || []).length
    const bParams = (b.path.match(/:/g) || []).length
    
    if (aParams !== bParams) {
      return aParams - bParams
    }
    
    // 3. 路径长的优先于路径短的
    return b.path.length - a.path.length
  })
}

// 示例排序结果：
const routes = [
  { path: '/user/profile' },      // 1. 静态路由，最高优先级
  { path: '/user/:id/posts' },    // 2. 一个参数，路径较长
  { path: '/user/:id' },          // 3. 一个参数，路径较短
  { path: '/:category/:id' },     // 4. 两个参数
  { path: '/:pathMatch(.*)' }     // 5. 通配符，最低优先级
]
```

### 5.2 快速匹配

```javascript
// 路由匹配缓存
class RouteMatcher {
  constructor(routes) {
    this.routes = sortRoutes(routes)
    this.cache = new Map()
    this.staticRoutes = new Map()  // 静态路由缓存
    
    // 预处理静态路由
    this.preprocessStaticRoutes()
  }
  
  preprocessStaticRoutes() {
    for (const route of this.routes) {
      if (!route.path.includes(':') && !route.path.includes('*')) {
        this.staticRoutes.set(route.path, route)
      }
    }
  }
  
  match(path) {
    // 1. 检查缓存
    if (this.cache.has(path)) {
      return this.cache.get(path)
    }
    
    // 2. 快速匹配静态路由
    if (this.staticRoutes.has(path)) {
      const result = {
        matched: [this.staticRoutes.get(path)],
        params: {},
        path
      }
      this.cache.set(path, result)
      return result
    }
    
    // 3. 动态路由匹配
    for (const route of this.routes) {
      const match = this.matchRoute(route, path)
      if (match) {
        this.cache.set(path, match)
        return match
      }
    }
    
    return null
  }
  
  matchRoute(route, path) {
    const { regex, keys } = route.compiled
    const match = path.match(regex)
    
    if (!match) return null
    
    const params = {}
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = match[i + 1]
      
      if (value !== undefined) {
        params[key.name] = value
      }
    }
    
    return {
      matched: [route],
      params,
      path
    }
  }
}
```

## 六、嵌套匹配

### 6.1 层级匹配

```javascript
// 嵌套路由匹配
const matchNestedRoutes = (path, routes) => {
  const segments = path.split('/').filter(Boolean)
  const matched = []
  let currentRoutes = routes
  let currentPath = ''
  let params = {}
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += '/' + segment
    
    // 在当前层级寻找匹配
    const route = findMatchingRoute(currentPath, currentRoutes)
    
    if (!route) break
    
    matched.push(route)
    Object.assign(params, route.params || {})
    
    // 准备下一层级
    if (route.children && i < segments.length - 1) {
      currentRoutes = route.children
      currentPath = ''  // 重置相对路径
    }
  }
  
  return { matched, params }
}
```

### 6.2 路径解析器

```javascript
// 完整路径解析器
class PathResolver {
  constructor() {
    this.matchers = []
  }
  
  addRoute(route, parent = null) {
    const matcher = this.createMatcher(route, parent)
    this.matchers.push(matcher)
    
    // 处理子路由
    if (route.children) {
      for (const child of route.children) {
        this.addRoute(child, matcher)
      }
    }
  }
  
  createMatcher(route, parent) {
    // 构建完整路径
    const fullPath = parent 
      ? this.normalizePath(parent.path + '/' + route.path)
      : route.path
    
    // 编译路径
    const compiled = this.compilePath(fullPath)
    
    return {
      path: fullPath,
      route,
      parent,
      compiled,
      children: []
    }
  }
  
  resolve(path) {
    for (const matcher of this.matchers) {
      const result = this.matchPath(matcher, path)
      if (result) {
        return this.buildResult(result, path)
      }
    }
    
    return null
  }
  
  matchPath(matcher, path) {
    const { regex, keys } = matcher.compiled
    const match = path.match(regex)
    
    if (!match) return null
    
    const params = {}
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = match[i + 1]
      
      if (value !== undefined) {
        params[key.name] = this.decodeParam(value)
      }
    }
    
    return { matcher, params }
  }
  
  buildResult(matchResult, path) {
    const { matcher, params } = matchResult
    const matched = []
    
    // 构建匹配链
    let current = matcher
    while (current) {
      matched.unshift(current.route)
      current = current.parent
    }
    
    return {
      path,
      matched,
      params,
      query: this.parseQuery(path),
      hash: this.parseHash(path)
    }
  }
  
  decodeParam(value) {
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }
  
  parseQuery(path) {
    const queryIndex = path.indexOf('?')
    if (queryIndex === -1) return {}
    
    const queryString = path.slice(queryIndex + 1)
    const hashIndex = queryString.indexOf('#')
    const cleanQuery = hashIndex !== -1 
      ? queryString.slice(0, hashIndex)
      : queryString
    
    return Object.fromEntries(new URLSearchParams(cleanQuery))
  }
  
  parseHash(path) {
    const hashIndex = path.indexOf('#')
    return hashIndex !== -1 ? path.slice(hashIndex + 1) : ''
  }
  
  normalizePath(path) {
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
  }
  
  compilePath(path) {
    // 实现路径编译逻辑
    return pathToRegexp(path)
  }
}
```

## 七、匹配调试

### 7.1 调试工具

```javascript
// 路由匹配调试器
class RouteMatchDebugger {
  constructor(router) {
    this.router = router
    this.enabled = process.env.NODE_ENV === 'development'
  }
  
  debug(path) {
    if (!this.enabled) return
    
    console.group(`🔍 路由匹配调试: ${path}`)
    
    const resolved = this.router.resolve(path)
    
    if (resolved.matched.length === 0) {
      console.warn('❌ 没有匹配的路由')
      this.suggestAlternatives(path)
    } else {
      console.log('✅ 匹配成功')
      this.logMatchDetails(resolved)
    }
    
    console.groupEnd()
  }
  
  logMatchDetails(resolved) {
    console.table([
      { 属性: 'path', 值: resolved.path },
      { 属性: 'name', 值: resolved.name },
      { 属性: 'params', 值: JSON.stringify(resolved.params) },
      { 属性: 'query', 值: JSON.stringify(resolved.query) }
    ])
    
    if (resolved.matched.length > 0) {
      console.log('📚 匹配的路由记录:')
      resolved.matched.forEach((record, index) => {
        console.log(`${index + 1}. ${record.path}`, record)
      })
    }
  }
  
  suggestAlternatives(path) {
    const routes = this.getAllRoutes()
    const suggestions = this.findSimilarRoutes(path, routes)
    
    if (suggestions.length > 0) {
      console.log('💡 相似路由建议:')
      suggestions.forEach(route => {
        console.log(`   • ${route.path}`)
      })
    }
  }
  
  getAllRoutes() {
    // 获取所有路由配置
    return this.flattenRoutes(this.router.options.routes)
  }
  
  flattenRoutes(routes, parent = '') {
    const result = []
    
    for (const route of routes) {
      const fullPath = parent + route.path
      result.push({ ...route, path: fullPath })
      
      if (route.children) {
        result.push(...this.flattenRoutes(route.children, fullPath))
      }
    }
    
    return result
  }
  
  findSimilarRoutes(targetPath, routes) {
    return routes
      .map(route => ({
        route,
        similarity: this.calculateSimilarity(targetPath, route.path)
      }))
      .filter(item => item.similarity > 0.6)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(item => item.route)
  }
  
  calculateSimilarity(str1, str2) {
    // 简单的字符串相似度计算
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    return (longer.length - this.editDistance(longer, shorter)) / longer.length
  }
  
  editDistance(str1, str2) {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }
}

// 使用调试器
const debugger = new RouteMatchDebugger(router)

router.beforeEach((to, from) => {
  debugger.debug(to.path)
})
```

### 7.2 性能分析

```javascript
// 路由匹配性能分析
class RouteMatchProfiler {
  constructor() {
    this.stats = new Map()
    this.enabled = false
  }
  
  enable() {
    this.enabled = true
    this.stats.clear()
  }
  
  disable() {
    this.enabled = false
  }
  
  profile(path, matchFn) {
    if (!this.enabled) {
      return matchFn()
    }
    
    const start = performance.now()
    const result = matchFn()
    const duration = performance.now() - start
    
    // 记录统计信息
    const existing = this.stats.get(path) || { count: 0, totalTime: 0 }
    existing.count++
    existing.totalTime += duration
    existing.avgTime = existing.totalTime / existing.count
    
    this.stats.set(path, existing)
    
    // 慢匹配警告
    if (duration > 10) {  // 10ms 阈值
      console.warn(`慢速路由匹配: ${path} (${duration.toFixed(2)}ms)`)
    }
    
    return result
  }
  
  getReport() {
    const report = Array.from(this.stats.entries())
      .map(([path, stats]) => ({ path, ...stats }))
      .sort((a, b) => b.avgTime - a.avgTime)
    
    return report
  }
  
  printReport() {
    console.table(this.getReport())
  }
}

// 集成到路由器
const profiler = new RouteMatchProfiler()

const originalResolve = router.resolve
router.resolve = function(to) {
  return profiler.profile(typeof to === 'string' ? to : to.path, () => {
    return originalResolve.call(this, to)
  })
}
```

## 八、最佳实践

### 8.1 路由设计原则

```javascript
// ✅ 好的路由设计
const routes = [
  // 1. 静态路由优先
  { path: '/about', component: About },
  { path: '/contact', component: Contact },
  
  // 2. 具体路径优先于通用路径
  { path: '/user/profile', component: UserProfile },
  { path: '/user/settings', component: UserSettings },
  { path: '/user/:id', component: UserDetail },
  
  // 3. 参数约束明确
  { path: '/post/:id(\\d+)', component: Post },
  { path: '/category/:slug([a-z-]+)', component: Category },
  
  // 4. 通配符路由放最后
  { path: '/:pathMatch(.*)*', component: NotFound }
]

// ❌ 避免的设计
const badRoutes = [
  // 通配符路由放前面，会匹配所有路径
  { path: '/:pathMatch(.*)*', component: NotFound },
  
  // 缺乏约束的参数，可能匹配意外内容  
  { path: '/file/:path', component: FileViewer },
  
  // 路由顺序不当
  { path: '/user/:id', component: UserDetail },
  { path: '/user/profile', component: UserProfile } // 永远匹配不到
]
```

### 8.2 性能优化建议

```javascript
// 1. 路由分组和懒加载
const routes = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      // 管理相关路由分组
    ]
  }
]

// 2. 缓存匹配结果
class CachedMatcher {
  constructor() {
    this.cache = new LRU({ max: 100 })  // 使用 LRU 缓存
  }
  
  match(path) {
    if (this.cache.has(path)) {
      return this.cache.get(path)
    }
    
    const result = this.performMatch(path)
    this.cache.set(path, result)
    return result
  }
}

// 3. 避免复杂正则
// ✅ 简单约束
{ path: '/user/:id(\\d+)', component: User }

// ❌ 复杂正则（影响性能）
{ path: '/user/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', component: User }
```

## 九、总结

| 概念 | 说明 |
|------|------|
| 路径编译 | 将路由路径转换为正则表达式 |
| 参数提取 | 从 URL 中提取动态参数 |
| 匹配优先级 | 静态 > 动态 > 通配符 |
| 约束匹配 | 使用正则表达式约束参数格式 |
| 嵌套匹配 | 层级匹配父子路由 |
| 性能优化 | 缓存、排序、简化正则 |

## 参考资料

- [路由匹配语法](https://router.vuejs.org/guide/essentials/route-matching-syntax.html)
- [动态路由匹配](https://router.vuejs.org/guide/essentials/dynamic-matching.html)

---

**下一节** → [第 18 节：动态路由](./18-dynamic-routes.md)
