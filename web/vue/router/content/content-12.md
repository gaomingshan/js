# 第 12 章：路由独享守卫

## 概述

路由独享守卫 `beforeEnter` 定义在路由配置中，只对特定路由生效。相比全局守卫，它更加精确和模块化，适合实现路由级别的权限控制和逻辑处理。

## beforeEnter 配置

### 基础用法

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from) => {
      // 只在进入 /admin 路由时调用
      // 不会在 params、query 或 hash 改变时调用
    }
  }
]
```

### 单个守卫

```javascript
{
  path: '/user/:id',
  component: User,
  beforeEnter: (to, from) => {
    // 验证用户 ID 格式
    const id = to.params.id
    if (!/^\d+$/.test(id)) {
      return { name: 'NotFound' }
    }
  }
}
```

### 守卫数组（Vue Router 4.x）

```javascript
function checkAuth(to, from) {
  if (!isAuthenticated()) {
    return { name: 'Login' }
  }
}

function checkRole(requiredRole) {
  return (to, from) => {
    const userRole = getUserRole()
    if (userRole !== requiredRole) {
      return { name: 'Forbidden' }
    }
  }
}

const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: [checkAuth, checkRole('admin')]  // 守卫数组
  }
]
```

### 可复用的守卫函数

```javascript
// guards/auth.js
export function requireAuth(to, from) {
  if (!localStorage.getItem('token')) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath }
    }
  }
}

export function requireRole(role) {
  return (to, from) => {
    const userRole = getUserRole()
    if (userRole !== role) {
      return { name: 'Forbidden' }
    }
  }
}

export function requirePermission(permission) {
  return (to, from) => {
    const permissions = getUserPermissions()
    if (!permissions.includes(permission)) {
      return { name: 'Forbidden' }
    }
  }
}

// router/index.js
import { requireAuth, requireRole, requirePermission } from '@/guards/auth'

const routes = [
  {
    path: '/profile',
    component: Profile,
    beforeEnter: requireAuth
  },
  {
    path: '/admin',
    component: Admin,
    beforeEnter: [requireAuth, requireRole('admin')]
  },
  {
    path: '/posts/create',
    component: CreatePost,
    beforeEnter: [requireAuth, requirePermission('post:create')]
  }
]
```

## 路由级别的权限控制

### 管理员页面保护

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: (to, from) => {
      const user = getCurrentUser()
      
      // 未登录
      if (!user) {
        return {
          name: 'Login',
          query: { redirect: to.fullPath }
        }
      }
      
      // 非管理员
      if (user.role !== 'admin') {
        return { name: 'Forbidden' }
      }
    },
    children: [
      {
        path: 'users',
        component: UserManagement
      },
      {
        path: 'settings',
        component: SystemSettings
      }
    ]
  }
]
```

### VIP 内容访问控制

```javascript
{
  path: '/vip/course/:id',
  component: VipCourse,
  beforeEnter: async (to, from) => {
    const user = getCurrentUser()
    
    // 检查 VIP 状态
    if (!user.isVip) {
      return {
        name: 'Upgrade',
        params: { courseId: to.params.id }
      }
    }
    
    // 检查 VIP 是否过期
    if (user.vipExpireAt < Date.now()) {
      return {
        name: 'Renew',
        params: { courseId: to.params.id }
      }
    }
  }
}
```

### 付费内容访问控制

```javascript
{
  path: '/article/:id',
  component: Article,
  beforeEnter: async (to, from) => {
    const articleId = to.params.id
    
    try {
      // 检查是否已购买
      const hasPurchased = await checkPurchaseStatus(articleId)
      
      if (!hasPurchased) {
        // 获取文章信息
        const article = await getArticleInfo(articleId)
        
        // 免费文章，允许访问
        if (article.isFree) {
          return true
        }
        
        // 付费文章，跳转到购买页
        return {
          name: 'Purchase',
          params: { articleId },
          query: { price: article.price }
        }
      }
    } catch (error) {
      return { name: 'Error' }
    }
  }
}
```

## 守卫的复用

### 工厂函数模式

```javascript
// guards/permission.js
export function createPermissionGuard(config) {
  return async (to, from) => {
    const {
      requiredRole,
      requiredPermissions,
      onDenied = () => ({ name: 'Forbidden' })
    } = config
    
    const user = getCurrentUser()
    
    // 检查登录
    if (!user) {
      return { name: 'Login' }
    }
    
    // 检查角色
    if (requiredRole && user.role !== requiredRole) {
      return onDenied()
    }
    
    // 检查权限
    if (requiredPermissions) {
      const hasAllPermissions = requiredPermissions.every(
        permission => user.permissions.includes(permission)
      )
      
      if (!hasAllPermissions) {
        return onDenied()
      }
    }
  }
}

// 使用
const routes = [
  {
    path: '/admin/users',
    component: UserManagement,
    beforeEnter: createPermissionGuard({
      requiredRole: 'admin',
      requiredPermissions: ['user:read', 'user:write']
    })
  },
  {
    path: '/moderator',
    component: ModeratorPanel,
    beforeEnter: createPermissionGuard({
      requiredRole: 'moderator',
      onDenied: () => ({
        name: 'Home',
        query: { error: 'no_permission' }
      })
    })
  }
]
```

### 组合守卫

```javascript
// guards/index.js
export function composeGuards(...guards) {
  return async (to, from) => {
    for (const guard of guards) {
      const result = await guard(to, from)
      if (result !== undefined && result !== true) {
        return result
      }
    }
  }
}

// 使用
import { requireAuth, requireVip, checkQuota } from '@/guards'

const routes = [
  {
    path: '/premium/export',
    component: Export,
    beforeEnter: composeGuards(
      requireAuth,
      requireVip,
      checkQuota('export', 10)  // 每日导出限制 10 次
    )
  }
]
```

### 条件守卫

```javascript
export function conditionalGuard(condition, guard) {
  return (to, from) => {
    if (condition(to, from)) {
      return guard(to, from)
    }
  }
}

// 使用
const routes = [
  {
    path: '/debug',
    component: DebugPanel,
    beforeEnter: conditionalGuard(
      () => import.meta.env.MODE === 'development',
      requireAuth
    )
  }
]
```

## 与全局守卫的配合

### 执行顺序

```javascript
// 全局前置守卫
router.beforeEach((to, from) => {
  console.log('1. 全局 beforeEach')
})

// 路由独享守卫
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from) => {
      console.log('2. 路由 beforeEnter')
    }
  }
]

// 组件内守卫
export default {
  beforeRouteEnter(to, from) {
    console.log('3. 组件 beforeRouteEnter')
  }
}

// 全局解析守卫
router.beforeResolve((to, from) => {
  console.log('4. 全局 beforeResolve')
})
```

### 职责划分

```javascript
// 全局守卫：通用逻辑
router.beforeEach((to, from) => {
  // 1. 页面访问统计
  analytics.track('page_view', { path: to.path })
  
  // 2. 设置页面标题
  document.title = to.meta.title || '默认标题'
  
  // 3. 通用权限检查
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: 'Login' }
  }
})

// 路由独享守卫：路由特定逻辑
const routes = [
  {
    path: '/admin/users/:id/edit',
    component: UserEdit,
    beforeEnter: async (to, from) => {
      // 检查用户是否有权限编辑该用户
      const canEdit = await checkEditPermission(to.params.id)
      if (!canEdit) {
        return { name: 'Forbidden' }
      }
    }
  }
]
```

### 父子路由守卫

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: requireAdmin,  // 父路由守卫
    children: [
      {
        path: 'users',
        component: UserManagement,
        beforeEnter: requirePermission('user:read')  // 子路由守卫
      },
      {
        path: 'settings',
        component: Settings,
        beforeEnter: requirePermission('setting:write')
      }
    ]
  }
]

// 访问 /admin/users 时：
// 1. 先执行父路由的 requireAdmin
// 2. 再执行子路由的 requirePermission('user:read')
```

## 实战案例

### 表单未保存提示

```javascript
{
  path: '/editor/:id',
  component: Editor,
  beforeEnter: (to, from) => {
    // 检查来源页面是否有未保存的数据
    const hasUnsavedData = from.meta?.hasUnsavedData
    
    if (hasUnsavedData) {
      const confirmed = window.confirm('有未保存的数据，确定要离开吗？')
      if (!confirmed) {
        return false  // 取消导航
      }
    }
  }
}
```

### 环境检查

```javascript
{
  path: '/beta/feature',
  component: BetaFeature,
  beforeEnter: (to, from) => {
    // 生产环境禁止访问
    if (import.meta.env.PROD) {
      return { name: 'NotFound' }
    }
    
    // Beta 测试用户
    const user = getCurrentUser()
    if (!user?.isBetaTester) {
      return { 
        name: 'Home',
        query: { message: 'beta_only' }
      }
    }
  }
}
```

### 资源预加载

```javascript
{
  path: '/article/:id',
  component: Article,
  beforeEnter: async (to, from) => {
    const articleId = to.params.id
    
    try {
      // 预加载文章数据
      const article = await fetchArticle(articleId)
      
      // 将数据存储到路由 meta 中
      to.meta.article = article
      
      // 404 处理
      if (!article) {
        return { name: 'NotFound' }
      }
    } catch (error) {
      return { name: 'Error', params: { error } }
    }
  }
}
```

## 关键点总结

1. **beforeEnter**：定义在路由配置中，只对当前路由生效
2. **守卫数组**：Vue Router 4.x 支持多个守卫按顺序执行
3. **可复用**：通过工厂函数创建可复用的守卫逻辑
4. **执行顺序**：在全局 beforeEach 之后，组件内守卫之前
5. **最佳实践**：将路由特定逻辑放在 beforeEnter，通用逻辑放在全局守卫

## 深入一点：动态守卫配置

```javascript
// 从服务器获取路由配置
const routeConfigs = await fetchRouteConfigs()

const routes = routeConfigs.map(config => ({
  path: config.path,
  component: () => import(`@/views/${config.component}.vue`),
  beforeEnter: createGuardFromConfig(config.guards)
}))

function createGuardFromConfig(guardsConfig) {
  const guards = guardsConfig.map(config => {
    switch (config.type) {
      case 'auth':
        return requireAuth
      case 'role':
        return requireRole(config.role)
      case 'permission':
        return requirePermission(config.permission)
      default:
        return () => true
    }
  })
  
  return composeGuards(...guards)
}
```

## 参考资料

- [Vue Router - 路由独享的守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E8%B7%AF%E7%94%B1%E7%8B%AC%E4%BA%AB%E7%9A%84%E5%AE%88%E5%8D%AB)
- [Vue Router - 组合式守卫](https://router.vuejs.org/zh/guide/advanced/composition-api.html)
