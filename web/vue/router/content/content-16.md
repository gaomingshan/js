# 第 16 章：路由元信息

## 概述

路由元信息（meta）是附加在路由配置上的自定义数据，可以在导航守卫、组件中访问。它是实现权限控制、页面标题设置、面包屑导航等功能的核心机制。

## meta 字段的使用

### 基础用法

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: '管理后台',
      icon: 'dashboard'
    }
  }
]

// 在组件中访问
export default {
  mounted() {
    console.log(this.$route.meta.title)  // '管理后台'
  }
}

// 在导航守卫中访问
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth) {
    // 需要登录
  }
})
```

### 常用 meta 字段

```javascript
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      // 权限相关
      requiresAuth: true,          // 需要登录
      roles: ['admin', 'editor'],  // 允许的角色
      permissions: ['read', 'write'], // 需要的权限
      
      // UI 相关
      title: '仪表盘',              // 页面标题
      icon: 'dashboard',            // 图标
      keepAlive: true,              // 是否缓存
      
      // 导航相关
      breadcrumb: ['首页', '仪表盘'], // 面包屑
      hidden: false,                // 是否在菜单中隐藏
      activeMenu: '/dashboard',     // 激活的菜单项
      
      // 其他
      transition: 'fade',           // 过渡动画
      layout: 'admin'               // 使用的布局
    }
  }
]
```

### TypeScript 类型定义

```typescript
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
    permissions?: string[]
    title?: string
    icon?: string
    keepAlive?: boolean
    breadcrumb?: string[]
    hidden?: boolean
  }
}

// 使用
const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,  // 类型安全
      title: '管理后台'
    }
  }
]
```

## 权限控制最佳实践

### 基于角色的权限控制（RBAC）

```javascript
// 路由配置
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      roles: ['user', 'admin']  // 用户或管理员都可以访问
    }
  },
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      roles: ['admin']  // 仅管理员
    }
  },
  {
    path: '/moderator',
    component: Moderator,
    meta: {
      requiresAuth: true,
      roles: ['admin', 'moderator']
    }
  }
]

// 导航守卫
router.beforeEach((to, from) => {
  const userStore = useUserStore()
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath }
    }
  }
  
  // 检查角色权限
  if (to.meta.roles) {
    const userRole = userStore.user?.role
    
    if (!to.meta.roles.includes(userRole)) {
      return { name: 'Forbidden' }
    }
  }
})
```

### 基于权限的访问控制

```javascript
const routes = [
  {
    path: '/posts',
    component: PostList,
    meta: {
      permissions: ['post:read']  // 需要读取帖子的权限
    }
  },
  {
    path: '/posts/create',
    component: PostCreate,
    meta: {
      permissions: ['post:create']  // 需要创建帖子的权限
    }
  },
  {
    path: '/posts/:id/edit',
    component: PostEdit,
    meta: {
      permissions: ['post:update']
    }
  },
  {
    path: '/posts/:id/delete',
    meta: {
      permissions: ['post:delete']
    }
  }
]

// 导航守卫
router.beforeEach((to, from) => {
  const userStore = useUserStore()
  
  if (to.meta.permissions) {
    const hasAllPermissions = to.meta.permissions.every(
      permission => userStore.hasPermission(permission)
    )
    
    if (!hasAllPermissions) {
      return {
        name: 'Forbidden',
        query: { missing: to.meta.permissions.join(',') }
      }
    }
  }
})
```

### 组合权限控制

```javascript
const routes = [
  {
    path: '/sensitive-data',
    component: SensitiveData,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      permissions: ['sensitive:read'],
      // 自定义验证函数
      validate: async (to, from) => {
        const hasOTP = await checkOTPStatus()
        return hasOTP || { name: 'OTPRequired' }
      }
    }
  }
]

// 导航守卫
router.beforeEach(async (to, from) => {
  // 1. 登录检查
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return '/login'
  }
  
  // 2. 角色检查
  if (to.meta.roles && !hasRole(to.meta.roles)) {
    return '/forbidden'
  }
  
  // 3. 权限检查
  if (to.meta.permissions && !hasPermissions(to.meta.permissions)) {
    return '/forbidden'
  }
  
  // 4. 自定义验证
  if (to.meta.validate) {
    const result = await to.meta.validate(to, from)
    if (result !== true) {
      return result
    }
  }
})
```

## 面包屑导航实现

### 基础面包屑

```javascript
// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      breadcrumb: false  // 不显示在面包屑中
    }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: {
      title: '产品列表',
      breadcrumb: '产品'
    }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: {
      title: '产品详情',
      breadcrumb: route => `产品 ${route.params.id}`  // 动态面包屑
    }
  }
]
```

```vue
<!-- Breadcrumb.vue -->
<template>
  <nav class="breadcrumb">
    <router-link
      v-for="(item, index) in breadcrumbs"
      :key="index"
      :to="item.path"
      :class="{ active: index === breadcrumbs.length - 1 }"
    >
      {{ item.title }}
      <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
    </router-link>
  </nav>
</template>

<script>
export default {
  computed: {
    breadcrumbs() {
      const matched = this.$route.matched.filter(
        route => route.meta.breadcrumb !== false
      )
      
      return matched.map(route => {
        const breadcrumb = route.meta.breadcrumb
        
        return {
          path: route.path,
          title: typeof breadcrumb === 'function'
            ? breadcrumb(this.$route)
            : breadcrumb || route.meta.title
        }
      })
    }
  }
}
</script>
```

### 嵌套路由面包屑

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { title: '管理后台' },
    children: [
      {
        path: 'users',
        component: UserManagement,
        meta: { title: '用户管理' },
        children: [
          {
            path: ':id',
            component: UserDetail,
            meta: {
              title: '用户详情',
              breadcrumb: route => `用户 ${route.params.id}`
            }
          }
        ]
      }
    ]
  }
]

// 访问 /admin/users/123
// 面包屑：管理后台 / 用户管理 / 用户 123
```

```vue
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  // matched 包含所有匹配的路由记录（包括父路由）
  return route.matched
    .filter(r => r.meta.title)
    .map(r => ({
      title: typeof r.meta.breadcrumb === 'function'
        ? r.meta.breadcrumb(route)
        : r.meta.breadcrumb || r.meta.title,
      path: r.path
    }))
})
</script>
```

## 页面标题的动态设置

### 基础标题设置

```javascript
const routes = [
  {
    path: '/',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/about',
    component: About,
    meta: { title: '关于我们' }
  }
]

// 导航守卫
router.afterEach((to, from) => {
  document.title = to.meta.title || '默认标题'
})
```

### 模板标题

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    meta: {
      title: route => `用户 ${route.params.id} - 个人中心`
    }
  }
]

router.afterEach((to, from) => {
  const title = typeof to.meta.title === 'function'
    ? to.meta.title(to)
    : to.meta.title
  
  document.title = title || '默认标题'
})
```

### 多语言标题

```javascript
import { useI18n } from 'vue-i18n'

const routes = [
  {
    path: '/about',
    component: About,
    meta: {
      titleKey: 'pages.about.title'  // i18n key
    }
  }
]

router.afterEach((to, from) => {
  const { t } = useI18n()
  
  if (to.meta.titleKey) {
    document.title = t(to.meta.titleKey)
  }
})
```

### 复杂标题格式

```javascript
const APP_NAME = 'MyApp'

router.afterEach((to, from) => {
  const pageTitle = to.meta.title
  
  if (pageTitle) {
    // 格式：页面标题 - 应用名称
    document.title = `${pageTitle} - ${APP_NAME}`
  } else {
    document.title = APP_NAME
  }
  
  // SEO: 设置 meta 描述
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description)
    }
  }
})
```

## 元信息的继承与合并

### 父子路由 meta 继承

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true,
      layout: 'admin',
      keepAlive: true
    },
    children: [
      {
        path: 'users',
        component: Users,
        meta: {
          title: '用户管理',
          permissions: ['user:read']
        }
        // 继承父路由的 meta：
        // requiresAuth: true
        // layout: 'admin'
        // keepAlive: true
      }
    ]
  }
]

// 访问所有 meta（包括父路由）
function getAllMeta(route) {
  return route.matched.reduce((meta, record) => {
    return { ...meta, ...record.meta }
  }, {})
}

// 使用
router.beforeEach((to, from) => {
  const allMeta = getAllMeta(to)
  console.log(allMeta)
  // {
  //   requiresAuth: true,
  //   layout: 'admin',
  //   keepAlive: true,
  //   title: '用户管理',
  //   permissions: ['user:read']
  // }
})
```

### 合并策略

```javascript
// 自定义合并逻辑
function mergeMeta(route) {
  return route.matched.reduce((merged, record) => {
    const meta = record.meta
    
    // 数组合并（权限累加）
    if (meta.permissions) {
      merged.permissions = [
        ...(merged.permissions || []),
        ...meta.permissions
      ]
    }
    
    // 覆盖（后面的覆盖前面的）
    if (meta.title) {
      merged.title = meta.title
    }
    
    // 逻辑或（任一为 true 则为 true）
    if (meta.requiresAuth) {
      merged.requiresAuth = true
    }
    
    return merged
  }, {})
}
```

## 关键点总结

1. **meta 字段**：在路由配置中添加自定义数据
2. **权限控制**：基于 meta 实现角色和权限验证
3. **面包屑导航**：利用 `route.matched` 生成层级导航
4. **页面标题**：在 `afterEach` 中根据 meta 设置标题
5. **继承合并**：通过 `route.matched` 访问所有父级 meta

## 深入一点：动态 meta 更新

```javascript
// 场景：根据数据动态设置 meta
router.beforeEach(async (to, from) => {
  if (to.name === 'ArticleDetail') {
    const articleId = to.params.id
    const article = await fetchArticle(articleId)
    
    // 动态设置 meta（注意：这只在当前导航有效）
    to.meta.title = article.title
    to.meta.description = article.summary
    to.meta.author = article.author
  }
})

// 在组件中访问动态 meta
export default {
  computed: {
    articleTitle() {
      return this.$route.meta.title
    }
  },
  
  watch: {
    '$route.meta.title': {
      handler(newTitle) {
        document.title = newTitle
      }
    }
  }
}
```

## 参考资料

- [Vue Router - 路由元信息](https://router.vuejs.org/zh/guide/advanced/meta.html)
- [Vue Router - matched 数组](https://router.vuejs.org/zh/api/#routelocationnormalized)
