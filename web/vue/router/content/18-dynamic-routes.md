# 第 18 节：动态路由

## 概述

动态路由允许在运行时添加、删除和修改路由配置，这为构建灵活的应用提供了强大支持。Vue Router 4 提供了完整的动态路由 API。

## 一、动态路由基础

### 1.1 添加路由

```javascript
import { createRouter } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home }
  ]
})

// 动态添加路由
router.addRoute({
  path: '/dynamic',
  name: 'Dynamic',
  component: () => import('@/views/Dynamic.vue')
})

// 添加嵌套路由
router.addRoute('parent', {
  path: 'child',
  component: Child
})
```

### 1.2 删除路由

```javascript
// 通过名称删除
router.removeRoute('Dynamic')

// 通过添加同名路由覆盖
router.addRoute({ path: '/about', name: 'About', component: About })
router.addRoute({ path: '/about-us', name: 'About', component: AboutUs })

// 通过返回的删除函数
const removeRoute = router.addRoute({ path: '/temp', component: Temp })
removeRoute()  // 删除刚添加的路由
```

### 1.3 检查路由

```javascript
// 检查路由是否存在
console.log(router.hasRoute('About'))  // true/false

// 获取所有路由记录
const routes = router.getRoutes()
console.log(routes)
```

## 二、权限控制场景

### 2.1 基于角色的动态路由

```javascript
// 角色路由映射
const roleRoutes = {
  admin: [
    {
      path: '/admin',
      component: () => import('@/views/admin/Dashboard.vue'),
      children: [
        { path: 'users', component: () => import('@/views/admin/Users.vue') },
        { path: 'settings', component: () => import('@/views/admin/Settings.vue') }
      ]
    }
  ],
  
  manager: [
    {
      path: '/manager',
      component: () => import('@/views/manager/Dashboard.vue'),
      children: [
        { path: 'reports', component: () => import('@/views/manager/Reports.vue') }
      ]
    }
  ],
  
  user: [
    {
      path: '/profile',
      component: () => import('@/views/user/Profile.vue')
    }
  ]
}

// 根据用户角色添加路由
const setupUserRoutes = async (userRoles) => {
  // 清除之前的动态路由
  clearDynamicRoutes()
  
  // 添加角色对应的路由
  for (const role of userRoles) {
    const routes = roleRoutes[role] || []
    routes.forEach(route => {
      router.addRoute(route)
    })
  }
}

const clearDynamicRoutes = () => {
  const dynamicRouteNames = ['admin', 'manager', 'profile']
  dynamicRouteNames.forEach(name => {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
    }
  })
}
```

### 2.2 权限路由管理器

```javascript
class PermissionRouteManager {
  constructor(router) {
    this.router = router
    this.dynamicRoutes = new Map()
    this.currentUserRoles = []
  }
  
  async setupRoutes(userRoles, permissions) {
    this.clearDynamicRoutes()
    this.currentUserRoles = userRoles
    
    // 获取用户可访问的路由
    const allowedRoutes = await this.getPermittedRoutes(userRoles, permissions)
    
    // 添加路由
    allowedRoutes.forEach(route => {
      const removeRoute = this.router.addRoute(route)
      this.dynamicRoutes.set(route.name, removeRoute)
    })
  }
  
  async getPermittedRoutes(roles, permissions) {
    const routes = []
    
    // 管理员路由
    if (roles.includes('admin')) {
      routes.push(...this.getAdminRoutes())
    }
    
    // 经理路由
    if (roles.includes('manager')) {
      routes.push(...this.getManagerRoutes())
    }
    
    // 基于具体权限的路由
    if (permissions.includes('user:manage')) {
      routes.push(this.getUserManagementRoute())
    }
    
    if (permissions.includes('report:view')) {
      routes.push(this.getReportsRoute())
    }
    
    return routes
  }
  
  clearDynamicRoutes() {
    for (const [name, removeRoute] of this.dynamicRoutes) {
      removeRoute()
    }
    this.dynamicRoutes.clear()
  }
  
  hasAccess(routeName) {
    return this.router.hasRoute(routeName)
  }
  
  getAdminRoutes() {
    return [
      {
        path: '/admin',
        name: 'Admin',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { title: '管理后台' },
        children: [
          {
            path: 'dashboard',
            name: 'AdminDashboard',
            component: () => import('@/views/admin/Dashboard.vue')
          },
          {
            path: 'users',
            name: 'AdminUsers',
            component: () => import('@/views/admin/Users.vue')
          }
        ]
      }
    ]
  }
  
  getManagerRoutes() {
    return [
      {
        path: '/manager',
        name: 'Manager',
        component: () => import('@/layouts/ManagerLayout.vue'),
        children: [
          {
            path: 'team',
            name: 'TeamManagement',
            component: () => import('@/views/manager/Team.vue')
          }
        ]
      }
    ]
  }
  
  getUserManagementRoute() {
    return {
      path: '/users',
      name: 'UserManagement',
      component: () => import('@/views/UserManagement.vue')
    }
  }
  
  getReportsRoute() {
    return {
      path: '/reports',
      name: 'Reports',
      component: () => import('@/views/Reports.vue')
    }
  }
}

// 使用权限路由管理器
const routeManager = new PermissionRouteManager(router)

// 用户登录后设置路由
const onUserLogin = async (user) => {
  const userRoles = user.roles
  const permissions = user.permissions
  
  await routeManager.setupRoutes(userRoles, permissions)
  
  // 导航到适当的页面
  if (userRoles.includes('admin')) {
    router.push('/admin/dashboard')
  } else if (userRoles.includes('manager')) {
    router.push('/manager/team')
  } else {
    router.push('/profile')
  }
}

// 用户登出时清除路由
const onUserLogout = () => {
  routeManager.clearDynamicRoutes()
  router.push('/login')
}
```

## 三、插件系统

### 3.1 插件路由注册

```javascript
// 插件路由注册系统
class PluginRouteRegistry {
  constructor(router) {
    this.router = router
    this.plugins = new Map()
    this.pluginRoutes = new Map()
  }
  
  registerPlugin(pluginId, pluginConfig) {
    if (this.plugins.has(pluginId)) {
      console.warn(`插件 ${pluginId} 已存在`)
      return
    }
    
    this.plugins.set(pluginId, pluginConfig)
    
    if (pluginConfig.routes) {
      this.addPluginRoutes(pluginId, pluginConfig.routes)
    }
  }
  
  unregisterPlugin(pluginId) {
    if (!this.plugins.has(pluginId)) {
      console.warn(`插件 ${pluginId} 不存在`)
      return
    }
    
    this.removePluginRoutes(pluginId)
    this.plugins.delete(pluginId)
  }
  
  addPluginRoutes(pluginId, routes) {
    const removeCallbacks = []
    
    routes.forEach(route => {
      // 为插件路由添加前缀
      const prefixedRoute = {
        ...route,
        path: `/plugins/${pluginId}${route.path}`,
        name: `plugin-${pluginId}-${route.name}`,
        meta: {
          ...route.meta,
          plugin: pluginId
        }
      }
      
      const removeRoute = this.router.addRoute(prefixedRoute)
      removeCallbacks.push(removeRoute)
    })
    
    this.pluginRoutes.set(pluginId, removeCallbacks)
  }
  
  removePluginRoutes(pluginId) {
    const removeCallbacks = this.pluginRoutes.get(pluginId) || []
    removeCallbacks.forEach(callback => callback())
    this.pluginRoutes.delete(pluginId)
  }
  
  enablePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId)
    if (plugin && plugin.routes) {
      this.addPluginRoutes(pluginId, plugin.routes)
    }
  }
  
  disablePlugin(pluginId) {
    this.removePluginRoutes(pluginId)
  }
  
  getPluginRoutes(pluginId) {
    const plugin = this.plugins.get(pluginId)
    return plugin ? plugin.routes : []
  }
  
  getAllPlugins() {
    return Array.from(this.plugins.keys())
  }
}

// 使用插件路由系统
const pluginRegistry = new PluginRouteRegistry(router)

// 注册插件
pluginRegistry.registerPlugin('blog', {
  name: '博客插件',
  version: '1.0.0',
  routes: [
    {
      path: '/list',
      name: 'BlogList',
      component: () => import('@/plugins/blog/BlogList.vue')
    },
    {
      path: '/post/:id',
      name: 'BlogPost',
      component: () => import('@/plugins/blog/BlogPost.vue')
    }
  ]
})

// 动态启用/禁用插件
const togglePlugin = (pluginId, enabled) => {
  if (enabled) {
    pluginRegistry.enablePlugin(pluginId)
  } else {
    pluginRegistry.disablePlugin(pluginId)
  }
}
```

## 四、多租户应用

### 4.1 租户路由隔离

```javascript
class TenantRouteManager {
  constructor(router) {
    this.router = router
    this.tenantRoutes = new Map()
    this.currentTenant = null
  }
  
  async switchTenant(tenantId) {
    // 清除当前租户路由
    if (this.currentTenant) {
      this.clearTenantRoutes(this.currentTenant)
    }
    
    // 加载新租户配置
    const tenantConfig = await this.loadTenantConfig(tenantId)
    
    // 添加租户专用路由
    await this.setupTenantRoutes(tenantId, tenantConfig)
    
    this.currentTenant = tenantId
  }
  
  async loadTenantConfig(tenantId) {
    // 从服务器加载租户配置
    const response = await fetch(`/api/tenants/${tenantId}/config`)
    return response.json()
  }
  
  async setupTenantRoutes(tenantId, config) {
    const routes = this.generateTenantRoutes(tenantId, config)
    const removeCallbacks = []
    
    routes.forEach(route => {
      const removeRoute = this.router.addRoute(route)
      removeCallbacks.push(removeRoute)
    })
    
    this.tenantRoutes.set(tenantId, removeCallbacks)
  }
  
  generateTenantRoutes(tenantId, config) {
    const routes = []
    
    // 基础租户路由
    routes.push({
      path: `/${tenantId}`,
      name: `tenant-${tenantId}`,
      component: () => import('@/layouts/TenantLayout.vue'),
      props: { tenantId, config },
      children: []
    })
    
    // 根据配置生成功能路由
    if (config.features.includes('dashboard')) {
      routes[0].children.push({
        path: 'dashboard',
        name: `tenant-${tenantId}-dashboard`,
        component: () => import('@/views/tenant/Dashboard.vue')
      })
    }
    
    if (config.features.includes('analytics')) {
      routes[0].children.push({
        path: 'analytics',
        name: `tenant-${tenantId}-analytics`,
        component: () => import('@/views/tenant/Analytics.vue')
      })
    }
    
    // 自定义页面
    if (config.customPages) {
      config.customPages.forEach(page => {
        routes[0].children.push({
          path: page.path,
          name: `tenant-${tenantId}-${page.name}`,
          component: () => import(`@/views/tenant/custom/${page.component}.vue`)
        })
      })
    }
    
    return routes
  }
  
  clearTenantRoutes(tenantId) {
    const removeCallbacks = this.tenantRoutes.get(tenantId) || []
    removeCallbacks.forEach(callback => callback())
    this.tenantRoutes.delete(tenantId)
  }
  
  getCurrentTenantRoutes() {
    if (!this.currentTenant) return []
    
    return this.router.getRoutes().filter(route => 
      route.name && route.name.startsWith(`tenant-${this.currentTenant}`)
    )
  }
}

// 租户切换示例
const tenantManager = new TenantRouteManager(router)

const switchToTenant = async (tenantId) => {
  try {
    await tenantManager.switchTenant(tenantId)
    
    // 导航到租户首页
    router.push(`/${tenantId}/dashboard`)
    
    console.log(`已切换到租户: ${tenantId}`)
  } catch (error) {
    console.error('租户切换失败:', error)
  }
}
```

## 五、A/B 测试路由

### 5.1 实验路由管理

```javascript
class ExperimentRouteManager {
  constructor(router) {
    this.router = router
    this.experiments = new Map()
    this.activeExperiments = new Set()
  }
  
  createExperiment(experimentId, config) {
    this.experiments.set(experimentId, {
      ...config,
      routes: new Map()
    })
  }
  
  addExperimentVariant(experimentId, variantName, routes) {
    const experiment = this.experiments.get(experimentId)
    if (!experiment) {
      throw new Error(`实验 ${experimentId} 不存在`)
    }
    
    experiment.routes.set(variantName, routes)
  }
  
  activateExperiment(experimentId, userVariant) {
    const experiment = this.experiments.get(experimentId)
    if (!experiment) {
      console.error(`实验 ${experimentId} 不存在`)
      return
    }
    
    const variantRoutes = experiment.routes.get(userVariant)
    if (!variantRoutes) {
      console.error(`实验变体 ${userVariant} 不存在`)
      return
    }
    
    // 添加实验路由
    const removeCallbacks = []
    variantRoutes.forEach(route => {
      const experimentRoute = {
        ...route,
        name: `${route.name}-${experimentId}-${userVariant}`,
        meta: {
          ...route.meta,
          experiment: experimentId,
          variant: userVariant
        }
      }
      
      const removeRoute = this.router.addRoute(experimentRoute)
      removeCallbacks.push(removeRoute)
    })
    
    experiment.removeCallbacks = removeCallbacks
    this.activeExperiments.add(experimentId)
  }
  
  deactivateExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId)
    if (experiment && experiment.removeCallbacks) {
      experiment.removeCallbacks.forEach(callback => callback())
      delete experiment.removeCallbacks
    }
    
    this.activeExperiments.delete(experimentId)
  }
  
  getUserVariant(experimentId, userId) {
    // 简单的哈希分组
    const hash = this.simpleHash(`${experimentId}-${userId}`)
    return hash % 2 === 0 ? 'A' : 'B'
  }
  
  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
}

// A/B 测试示例
const experimentManager = new ExperimentRouteManager(router)

// 创建首页实验
experimentManager.createExperiment('homepage-test', {
  name: '首页布局测试',
  description: '测试新的首页设计'
})

// 添加实验变体
experimentManager.addExperimentVariant('homepage-test', 'A', [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeOriginal.vue')
  }
])

experimentManager.addExperimentVariant('homepage-test', 'B', [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeNew.vue')
  }
])

// 用户访问时激活实验
const setupUserExperiments = (userId) => {
  const variant = experimentManager.getUserVariant('homepage-test', userId)
  experimentManager.activateExperiment('homepage-test', variant)
  
  console.log(`用户 ${userId} 分配到变体: ${variant}`)
}
```

## 六、模块化路由系统

### 6.1 路由模块管理

```javascript
class ModularRouteSystem {
  constructor(router) {
    this.router = router
    this.modules = new Map()
    this.moduleRoutes = new Map()
  }
  
  async loadModule(moduleName) {
    if (this.modules.has(moduleName)) {
      console.log(`模块 ${moduleName} 已加载`)
      return
    }
    
    try {
      // 动态导入模块
      const moduleConfig = await import(`@/modules/${moduleName}/routes.js`)
      
      // 注册模块
      this.modules.set(moduleName, moduleConfig.default)
      
      // 添加模块路由
      this.addModuleRoutes(moduleName, moduleConfig.default.routes)
      
      console.log(`模块 ${moduleName} 加载成功`)
    } catch (error) {
      console.error(`模块 ${moduleName} 加载失败:`, error)
    }
  }
  
  unloadModule(moduleName) {
    if (!this.modules.has(moduleName)) {
      console.log(`模块 ${moduleName} 未加载`)
      return
    }
    
    // 移除模块路由
    this.removeModuleRoutes(moduleName)
    
    // 移除模块注册
    this.modules.delete(moduleName)
    
    console.log(`模块 ${moduleName} 卸载成功`)
  }
  
  addModuleRoutes(moduleName, routes) {
    const removeCallbacks = []
    
    routes.forEach(route => {
      const moduleRoute = {
        ...route,
        path: `/modules/${moduleName}${route.path}`,
        name: `module-${moduleName}-${route.name}`,
        meta: {
          ...route.meta,
          module: moduleName
        }
      }
      
      const removeRoute = this.router.addRoute(moduleRoute)
      removeCallbacks.push(removeRoute)
    })
    
    this.moduleRoutes.set(moduleName, removeCallbacks)
  }
  
  removeModuleRoutes(moduleName) {
    const removeCallbacks = this.moduleRoutes.get(moduleName) || []
    removeCallbacks.forEach(callback => callback())
    this.moduleRoutes.delete(moduleName)
  }
  
  isModuleLoaded(moduleName) {
    return this.modules.has(moduleName)
  }
  
  getLoadedModules() {
    return Array.from(this.modules.keys())
  }
  
  async loadModuleOnDemand(routePath) {
    // 根据路由路径判断需要加载的模块
    const moduleName = this.extractModuleName(routePath)
    
    if (moduleName && !this.isModuleLoaded(moduleName)) {
      await this.loadModule(moduleName)
    }
  }
  
  extractModuleName(routePath) {
    const match = routePath.match(/^\/modules\/([^\/]+)/)
    return match ? match[1] : null
  }
}

// 使用模块化路由系统
const moduleSystem = new ModularRouteSystem(router)

// 路由守卫中按需加载模块
router.beforeEach(async (to, from) => {
  if (to.path.startsWith('/modules/')) {
    await moduleSystem.loadModuleOnDemand(to.path)
  }
})

// 手动加载模块
const loadUserModule = async () => {
  await moduleSystem.loadModule('user-management')
}

// 卸载模块
const unloadUserModule = () => {
  moduleSystem.unloadModule('user-management')
}
```

## 七、最佳实践

### 7.1 动态路由管理原则

```javascript
// ✅ 好的实践
class RouteManager {
  constructor(router) {
    this.router = router
    this.dynamicRoutes = new Map() // 跟踪动态路由
    this.routeGroups = new Map()   // 路由分组管理
  }
  
  addRouteGroup(groupName, routes) {
    const removeCallbacks = []
    
    routes.forEach(route => {
      const removeRoute = this.router.addRoute(route)
      removeCallbacks.push(removeRoute)
    })
    
    this.routeGroups.set(groupName, removeCallbacks)
  }
  
  removeRouteGroup(groupName) {
    const removeCallbacks = this.routeGroups.get(groupName) || []
    removeCallbacks.forEach(callback => callback())
    this.routeGroups.delete(groupName)
  }
  
  cleanup() {
    // 统一清理所有动态路由
    this.routeGroups.forEach((callbacks, groupName) => {
      callbacks.forEach(callback => callback())
    })
    this.routeGroups.clear()
  }
}

// ❌ 避免的做法
// 1. 不跟踪动态添加的路由
router.addRoute(someRoute) // 无法清理

// 2. 重复添加相同名称的路由而不清理
router.addRoute({ name: 'Test', path: '/test1', component: Test1 })
router.addRoute({ name: 'Test', path: '/test2', component: Test2 }) // 覆盖但不清理

// 3. 在组件中直接操作路由
// 应该在适当的生命周期或路由守卫中操作
```

### 7.2 性能考虑

```javascript
// 路由缓存和预加载
class OptimizedRouteManager {
  constructor(router) {
    this.router = router
    this.routeCache = new Map()
    this.preloadQueue = []
  }
  
  async addRouteWithCache(routeConfig) {
    const cacheKey = this.generateCacheKey(routeConfig)
    
    if (this.routeCache.has(cacheKey)) {
      return this.routeCache.get(cacheKey)
    }
    
    const removeRoute = this.router.addRoute(routeConfig)
    this.routeCache.set(cacheKey, removeRoute)
    
    return removeRoute
  }
  
  preloadRouteComponent(routeConfig) {
    if (routeConfig.component && typeof routeConfig.component === 'function') {
      // 预加载组件
      routeConfig.component().catch(error => {
        console.warn('路由组件预加载失败:', error)
      })
    }
  }
  
  generateCacheKey(routeConfig) {
    return `${routeConfig.path}-${routeConfig.name}-${JSON.stringify(routeConfig.meta)}`
  }
}
```

## 八、总结

| 功能 | API | 用途 |
|------|-----|------|
| 添加路由 | `addRoute()` | 运行时添加新路由 |
| 删除路由 | `removeRoute()` | 删除已存在的路由 |
| 检查路由 | `hasRoute()` | 判断路由是否存在 |
| 获取路由 | `getRoutes()` | 获取所有路由记录 |
| 权限控制 | 动态添加/删除 | 基于用户角色控制访问 |
| 模块化 | 按需加载路由 | 代码分割和懒加载 |

## 参考资料

- [动态路由](https://router.vuejs.org/guide/advanced/dynamic-routing.html)
- [路由 API](https://router.vuejs.org/api/#addroute)

---

**下一节** → [第 19 节：路由优先级](./19-route-priority.md)
