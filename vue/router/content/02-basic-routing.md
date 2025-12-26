# 第 02 节：基础路由配置

## 概述

路由配置是 Vue Router 的核心，定义了 URL 路径与组件的映射关系。本节详细介绍路由配置的语法、选项和最佳实践。

## 一、路由记录基础

### 1.1 路由记录结构

```javascript
const route = {
  path: '/user/:id',        // 必需：路径模式
  component: UserComponent, // 必需：组件
  name: 'User',            // 可选：路由名称
  props: true,             // 可选：props 传递
  meta: { requiresAuth: true }, // 可选：元信息
  children: [],            // 可选：子路由
  redirect: '/login',      // 可选：重定向
  alias: '/profile'        // 可选：别名
}
```

### 1.2 基本配置示例

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import User from '@/views/User.vue'

const routes = [
  // 静态路由
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  
  // 动态路由
  {
    path: '/user/:id',
    name: 'User',
    component: User
  },
  
  // 可选参数
  {
    path: '/posts/:id?',
    name: 'Post',
    component: () => import('@/views/Post.vue')
  }
]
```

## 二、路径匹配

### 2.1 静态路径

```javascript
// 精确匹配
{ path: '/about', component: About }

// 匹配：/about
// 不匹配：/about/team, /about/
```

### 2.2 动态路径参数

```javascript
// 基本参数
{ path: '/user/:id', component: User }

// 多个参数
{ path: '/user/:id/post/:postId', component: UserPost }

// 参数正则约束
{ path: '/user/:id(\\d+)', component: User }

// 可选参数
{ path: '/posts/:id?', component: Post }

// 重复参数
{ path: '/chapters/:chapterId+', component: Chapters }

// 通配符
{ path: '/files/:path(.*)', component: FileViewer }
```

### 2.3 参数访问

```vue
<template>
  <div>
    <p>用户 ID: {{ $route.params.id }}</p>
    <p>文章 ID: {{ $route.params.postId }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// 获取路由参数
console.log(route.params.id)
console.log(route.params.postId)

// 监听参数变化
watch(
  () => route.params.id,
  (newId) => {
    // 参数变化处理逻辑
    fetchUserData(newId)
  }
)
</script>
```

## 三、组件配置

### 3.1 直接引用组件

```javascript
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/',
    component: Home
  }
]
```

### 3.2 懒加载组件

```javascript
const routes = [
  {
    path: '/about',
    // 动态导入，代码分割
    component: () => import('@/views/About.vue')
  },
  
  {
    path: '/dashboard',
    // 带注释的动态导入，自定义 chunk 名
    component: () => import(
      /* webpackChunkName: "dashboard" */
      '@/views/Dashboard.vue'
    )
  }
]
```

### 3.3 函数式组件

```javascript
const routes = [
  {
    path: '/render',
    component: (props) => {
      return h('div', `Hello ${props.name}`)
    }
  }
]
```

## 四、重定向与别名

### 4.1 重定向

```javascript
const routes = [
  // 简单重定向
  { path: '/home', redirect: '/' },
  
  // 命名路由重定向
  { path: '/user', redirect: { name: 'Profile' } },
  
  // 动态重定向
  {
    path: '/old/:id',
    redirect: (to) => {
      return { path: `/new/${to.params.id}` }
    }
  },
  
  // 函数式重定向
  {
    path: '/search/:searchText',
    redirect: (to) => {
      return {
        name: 'Search',
        params: { q: to.params.searchText }
      }
    }
  }
]
```

### 4.2 别名

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    // 别名：/profile/:id 也会匹配到同一个组件
    alias: '/profile/:id'
  },
  
  {
    path: '/home',
    component: Home,
    // 多个别名
    alias: ['/', '/index', '/main']
  }
]
```

### 4.3 重定向 vs 别名

| 特性 | 重定向 | 别名 |
|------|-------|------|
| URL 变化 | 会改变 | 不会改变 |
| 历史记录 | 产生新记录 | 不产生记录 |
| SEO | 301/302 | 200 |
| 使用场景 | 旧链接迁移 | 多入口访问 |

## 五、路由元信息

### 5.1 基本用法

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      title: '管理后台',
      layout: 'admin',
      roles: ['admin', 'moderator']
    }
  }
]
```

### 5.2 元信息访问

```vue
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// 访问元信息
console.log(route.meta.title)
console.log(route.meta.requiresAuth)

// 在导航守卫中使用
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth) {
    // 需要认证的处理逻辑
    return checkAuth() ? true : '/login'
  }
})
</script>
```

### 5.3 TypeScript 支持

```typescript
// 扩展 RouteMeta 类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    layout?: string
    roles?: string[]
  }
}

// 类型安全的路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      title: '仪表板',
      requiresAuth: true,
      roles: ['user']
    }
  }
]
```

## 六、路由组织模式

### 6.1 单文件配置

```javascript
// router/index.js
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/contact', component: Contact }
]
```

### 6.2 模块化配置

```javascript
// router/modules/user.js
export const userRoutes = [
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      { path: 'profile', component: UserProfile },
      { path: 'settings', component: UserSettings }
    ]
  }
]

// router/modules/admin.js
export const adminRoutes = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      { path: 'users', component: AdminUsers },
      { path: 'reports', component: AdminReports }
    ]
  }
]

// router/index.js
import { userRoutes } from './modules/user'
import { adminRoutes } from './modules/admin'

const routes = [
  { path: '/', component: Home },
  ...userRoutes,
  ...adminRoutes
]
```

### 6.3 自动路由生成

```javascript
// 动态生成路由（基于文件结构）
function generateRoutes() {
  const modules = import.meta.glob('../views/**/*.vue')
  const routes = []
  
  for (const path in modules) {
    const routePath = path
      .replace('../views', '')
      .replace('.vue', '')
      .replace(/\/index$/, '')
      .toLowerCase()
    
    routes.push({
      path: routePath || '/',
      component: modules[path]
    })
  }
  
  return routes
}
```

## 七、路由配置最佳实践

### 7.1 命名规范

```javascript
const routes = [
  {
    name: 'UserProfile',        // PascalCase
    path: '/user/:id/profile',  // kebab-case
    component: UserProfile,
    meta: {
      title: 'user.profile'    // 国际化 key
    }
  }
]
```

### 7.2 路径设计

```javascript
// ✅ 好的路径设计
'/users/:id'
'/users/:id/posts'
'/users/:id/posts/:postId'

// ❌ 避免的设计
'/user-profile/:id'
'/getUserById/:id'
'/api/users/:id'  // API 路径不应该在前端路由中
```

### 7.3 组件组织

```javascript
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/layouts/Dashboard.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/dashboard/Overview.vue')
      },
      {
        path: 'analytics',
        component: () => import('@/views/dashboard/Analytics.vue')
      }
    ]
  }
]
```

## 八、常见问题

### 8.1 参数响应性

```vue
<script setup>
// ❌ 组件不会响应参数变化
const userId = route.params.id

// ✅ 使用 computed 或 watch
const userId = computed(() => route.params.id)

// ✅ 或者监听变化
watch(
  () => route.params.id,
  async (newId) => {
    await fetchUserData(newId)
  },
  { immediate: true }
)
</script>
```

### 8.2 404 路由

```javascript
const routes = [
  // 其他路由...
  
  // 404 路由必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]
```

## 九、总结

| 概念 | 说明 |
|------|------|
| 路由记录 | 定义路径与组件的映射关系 |
| 动态参数 | 使用冒号语法定义可变路径 |
| 重定向 | URL 跳转到新地址 |
| 别名 | 同一组件的多个访问路径 |
| 元信息 | 附加的路由配置数据 |

## 参考资料

- [路由匹配语法](https://router.vuejs.org/guide/essentials/route-matching-syntax.html)
- [动态路由匹配](https://router.vuejs.org/guide/essentials/dynamic-matching.html)

---

**下一节** → [第 03 节：路由组件](./03-route-components.md)
