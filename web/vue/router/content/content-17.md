# 第 17 章：动态路由管理

## 概述

动态路由管理允许在运行时添加、删除路由，是实现动态权限路由系统的核心。Vue Router 4.x 提供了 `addRoute`、`removeRoute`、`hasRoute`、`getRoutes` 等 API，让路由管理更加灵活。

## addRoute 动态添加路由

### 基础用法

```javascript
const router = createRouter({
  routes: [
    { path: '/', component: Home }
  ]
})

// 添加新路由
router.addRoute({
  path: '/about',
  name: 'About',
  component: About
})

// 现在可以导航到 /about
router.push('/about')
```

### 添加嵌套路由

```javascript
// 先添加父路由
router.addRoute({
  path: '/admin',
  name: 'Admin',
  component: AdminLayout
})

// 再添加子路由（指定父路由 name）
router.addRoute('Admin', {
  path: 'users',
  name: 'AdminUsers',
  component: UserManagement
})

router.addRoute('Admin', {
  path: 'settings',
  name: 'AdminSettings',
  component: Settings
})

// 现在可以访问：
// /admin
// /admin/users
// /admin/settings
```

### 批量添加路由

```javascript
const adminRoutes = [
  {
    path: 'dashboard',
    name: 'AdminDashboard',
    component: Dashboard
  },
  {
    path: 'users',
    name: 'AdminUsers',
    component: Users
  },
  {
    path: 'posts',
    name: 'AdminPosts',
    component: Posts
  }
]

// 批量添加到 Admin 路由下
adminRoutes.forEach(route => {
  router.addRoute('Admin', route)
})
```

## removeRoute 动态删除路由

### 通过名称删除

```javascript
// 添加路由
router.addRoute({
  path: '/temp',
  name: 'Temp',
  component: TempPage
})

// 删除路由（通过名称）
router.removeRoute('Temp')

// 尝试访问会 404
router.push('/temp')  // 不会匹配
```

### 通过返回的移除函数

```javascript
// addRoute 返回一个移除函数
const removeAbout = router.addRoute({
  path: '/about',
  name: 'About',
  component: About
})

// 调用移除函数
removeAbout()

// 路由已被移除
```

### 删除嵌套路由

```javascript
// 删除父路由会自动删除所有子路由
router.addRoute({
  path: '/admin',
  name: 'Admin',
  component: AdminLayout,
  children: [
    { path: 'users', component: Users },
    { path: 'posts', component: Posts }
  ]
})

// 删除 Admin 路由
router.removeRoute('Admin')
// /admin、/admin/users、/admin/posts 都会被删除
```

## hasRoute 与 getRoutes

### hasRoute - 检查路由是否存在

```javascript
// 添加路由
router.addRoute({ path: '/test', name: 'Test', component: Test })

// 检查路由是否存在
console.log(router.hasRoute('Test'))  // true
console.log(router.hasRoute('NonExistent'))  // false

// 删除后
router.removeRoute('Test')
console.log(router.hasRoute('Test'))  // false
```

### getRoutes - 获取所有路由

```javascript
// 获取所有路由记录
const routes = router.getRoutes()

console.log(routes)
// [
//   { path: '/', name: 'Home', ... },
//   { path: '/about', name: 'About', ... },
//   ...
// ]

// 过滤特定路由
const adminRoutes = routes.filter(route => 
  route.path.startsWith('/admin')
)

// 检查某个路径是否已存在
const hasPath = routes.some(route => route.path === '/test')
```

## 动态权限路由实现

### 完整实现方案

```javascript
// stores/permission.js
import { defineStore } from 'pinia'
import { asyncRoutes } from '@/router/routes'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
    isRoutesGenerated: false
  }),
  
  actions: {
    generateRoutes(roles) {
      return new Promise(resolve => {
        let accessedRoutes
        
        if (roles.includes('admin')) {
          // 管理员拥有所有路由
          accessedRoutes = asyncRoutes
        } else {
          // 根据角色过滤路由
          accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
        }
        
        this.addRoutes = accessedRoutes
        this.routes = constantRoutes.concat(accessedRoutes)
        this.isRoutesGenerated = true
        
        resolve(accessedRoutes)
      })
    },
    
    resetRoutes() {
      this.routes = []
      this.addRoutes = []
      this.isRoutesGenerated = false
    }
  }
})

// 过滤异步路由
function filterAsyncRoutes(routes, roles) {
  const res = []
  
  routes.forEach(route => {
    const tmp = { ...route }
    
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  
  return res
}

// 检查权限
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  }
  return true
}
```

### 路由配置

```javascript
// router/routes.js

// 基础路由（所有用户可访问）
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/Login.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  }
]

// 异步路由（需要权限）
export const asyncRoutes = [
  {
    path: '/system',
    component: Layout,
    name: 'System',
    meta: {
      title: '系统管理',
      icon: 'system',
      roles: ['admin']  // 仅管理员
    },
    children: [
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/views/system/User.vue'),
        meta: { title: '用户管理', roles: ['admin'] }
      },
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('@/views/system/Role.vue'),
        meta: { title: '角色管理', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/content',
    component: Layout,
    name: 'Content',
    meta: {
      title: '内容管理',
      icon: 'content',
      roles: ['admin', 'editor']  // 管理员和编辑
    },
    children: [
      {
        path: 'article',
        name: 'Article',
        component: () => import('@/views/content/Article.vue'),
        meta: { title: '文章管理', roles: ['admin', 'editor'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404.vue'),
    meta: { hidden: true }
  }
]
```

### 路由守卫集成

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes } from './routes'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

const whiteList = ['/login', '/register']

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  
  // 已登录
  if (userStore.token) {
    if (to.path === '/login') {
      return '/'
    }
    
    // 检查是否已生成动态路由
    if (!permissionStore.isRoutesGenerated) {
      try {
        // 获取用户信息（包含角色）
        await userStore.getInfo()
        
        // 生成可访问的路由
        const accessRoutes = await permissionStore.generateRoutes(
          userStore.roles
        )
        
        // 动态添加路由
        accessRoutes.forEach(route => {
          router.addRoute(route)
        })
        
        // 重新导航到当前路由（确保新路由生效）
        return { ...to, replace: true }
      } catch (error) {
        // 获取用户信息失败，清除 token 并跳转到登录页
        await userStore.resetToken()
        return `/login?redirect=${to.path}`
      }
    }
  } else {
    // 未登录
    if (!whiteList.includes(to.path)) {
      return `/login?redirect=${to.path}`
    }
  }
})

export default router
```

### 退出登录时重置路由

```javascript
// stores/user.js
export const useUserStore = defineStore('user', {
  actions: {
    async logout() {
      await logoutAPI()
      
      this.token = ''
      this.roles = []
      
      // 重置权限路由
      const permissionStore = usePermissionStore()
      permissionStore.resetRoutes()
      
      // 重置路由器（移除动态添加的路由）
      resetRouter()
      
      router.push('/login')
    }
  }
})

// 重置路由器
function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes: constantRoutes
  })
  
  // 替换 matcher
  router.matcher = newRouter.matcher
}

// Vue Router 4.x 更好的方式
function resetRouter() {
  const permissionStore = usePermissionStore()
  
  // 移除所有动态添加的路由
  permissionStore.addRoutes.forEach(route => {
    if (route.name) {
      router.removeRoute(route.name)
    }
  })
}
```

## 动态路由的时机与陷阱

### 陷阱 1：过早添加路由

```javascript
// ❌ 错误：在 router 创建时就添加
const router = createRouter({ ... })

// 此时用户可能还未登录，角色未知
const userRole = getUserRole()  // 可能为 null
if (userRole === 'admin') {
  router.addRoute(adminRoute)  // 不应该在这里添加
}

// ✅ 正确：在登录成功后添加
router.beforeEach(async (to, from) => {
  if (userStore.token && !permissionStore.isRoutesGenerated) {
    const roles = await getUserRoles()
    const accessRoutes = generateRoutes(roles)
    accessRoutes.forEach(route => router.addRoute(route))
  }
})
```

### 陷阱 2：忘记重新导航

```javascript
// ❌ 错误：添加路由后直接继续导航
router.beforeEach(async (to, from) => {
  if (!permissionStore.isRoutesGenerated) {
    const accessRoutes = await permissionStore.generateRoutes()
    accessRoutes.forEach(route => router.addRoute(route))
    // 问题：新添加的路由不会立即生效
  }
})

// ✅ 正确：重新触发导航
router.beforeEach(async (to, from) => {
  if (!permissionStore.isRoutesGenerated) {
    const accessRoutes = await permissionStore.generateRoutes()
    accessRoutes.forEach(route => router.addRoute(route))
    
    // 重新导航，确保新路由生效
    return { ...to, replace: true }
  }
})
```

### 陷阱 3：404 路由的位置

```javascript
// ❌ 错误：404 路由在基础路由中
const constantRoutes = [
  { path: '/', component: Home },
  { path: '/:pathMatch(.*)*', component: NotFound }  // 会匹配所有路由！
]

// 动态添加的路由永远不会被匹配（已被 404 捕获）

// ✅ 正确：404 路由放在动态路由中，最后添加
const asyncRoutes = [
  // ... 其他路由
  { path: '/:pathMatch(.*)*', component: NotFound }  // 最后添加
]
```

### 陷阱 4：重复添加路由

```javascript
// ❌ 错误：可能重复添加
router.beforeEach(async (to, from) => {
  const accessRoutes = await generateRoutes()
  accessRoutes.forEach(route => {
    router.addRoute(route)  // 每次导航都添加！
  })
})

// ✅ 正确：添加标志位
router.beforeEach(async (to, from) => {
  if (!permissionStore.isRoutesGenerated) {
    const accessRoutes = await generateRoutes()
    accessRoutes.forEach(route => router.addRoute(route))
    permissionStore.isRoutesGenerated = true
  }
})
```

## 实战案例：多租户路由

```javascript
// 场景：不同租户有不同的路由配置
const tenantRoutes = {
  // 租户 A
  tenantA: [
    {
      path: '/reports',
      component: () => import('@/views/tenantA/Reports.vue')
    }
  ],
  
  // 租户 B
  tenantB: [
    {
      path: '/analytics',
      component: () => import('@/views/tenantB/Analytics.vue')
    }
  ]
}

// 登录成功后加载租户路由
async function loadTenantRoutes(tenantId) {
  const routes = tenantRoutes[tenantId] || []
  
  routes.forEach(route => {
    router.addRoute('Dashboard', route)  // 添加到 Dashboard 下
  })
}

// 切换租户时
async function switchTenant(newTenantId) {
  // 1. 移除当前租户路由
  const currentRoutes = tenantRoutes[currentTenantId]
  currentRoutes.forEach(route => {
    if (route.name) {
      router.removeRoute(route.name)
    }
  })
  
  // 2. 加载新租户路由
  await loadTenantRoutes(newTenantId)
  
  // 3. 导航到首页
  router.push('/dashboard')
}
```

## 关键点总结

1. **addRoute**：动态添加路由，支持嵌套路由
2. **removeRoute**：删除指定路由，返回移除函数
3. **hasRoute/getRoutes**：检查和获取路由信息
4. **权限路由**：登录后根据角色动态生成并添加路由
5. **重要陷阱**：添加路由后需重新导航、404 路由应最后添加

## 深入一点：动态路由的性能优化

```javascript
// 优化 1：路由懒加载
const asyncRoutes = [
  {
    path: '/admin',
    component: () => import('@/layouts/Admin.vue'),
    children: [
      {
        path: 'users',
        component: () => import('@/views/admin/Users.vue')
      }
    ]
  }
]

// 优化 2：缓存路由配置
let cachedRoutes = null

async function generateRoutes(roles) {
  const cacheKey = roles.sort().join(',')
  
  if (cachedRoutes && cachedRoutes.key === cacheKey) {
    return cachedRoutes.routes
  }
  
  const routes = filterRoutes(asyncRoutes, roles)
  cachedRoutes = { key: cacheKey, routes }
  
  return routes
}

// 优化 3：按需加载路由配置
async function loadRouteConfig(role) {
  // 从服务器获取路由配置
  const config = await fetch(`/api/routes/${role}`).then(r => r.json())
  
  // 转换为路由对象
  return config.map(item => ({
    path: item.path,
    component: () => import(`@/views/${item.component}.vue`),
    meta: item.meta
  }))
}
```

## 参考资料

- [Vue Router - 动态路由](https://router.vuejs.org/zh/guide/advanced/dynamic-routing.html)
- [Vue Router API - addRoute](https://router.vuejs.org/zh/api/#addroute)
- [Vue Router API - removeRoute](https://router.vuejs.org/zh/api/#removeroute)
