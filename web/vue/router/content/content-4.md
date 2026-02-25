# 第 4 章：路由配置详解

## 概述

路由配置是 Vue Router 的核心，一个清晰、合理的路由配置能让项目易于维护和扩展。本章将深入讲解路由配置对象的各个属性及其最佳实践。

## 路由配置对象结构

```javascript
const route = {
  path: '/user/:id',           // 路径（必填）
  name: 'UserProfile',          // 路由名称（可选但推荐）
  component: UserProfile,       // 组件（必填）
  components: {                 // 命名视图（与 component 二选一）
    default: UserProfile,
    sidebar: UserSidebar
  },
  redirect: '/home',            // 重定向（可选）
  alias: '/people/:id',         // 别名（可选）
  children: [],                 // 嵌套路由（可选）
  meta: {                       // 元信息（可选）
    requiresAuth: true,
    title: '用户详情'
  },
  props: true,                  // 路由参数作为 props（可选）
  beforeEnter: (to, from) => {  // 路由独享守卫（可选）
    // ...
  },
  sensitive: false,             // 路径是否大小写敏感（可选）
  strict: false                 // 是否严格匹配尾部斜杠（可选）
}
```

## path、name、component 配置

### path - 路径配置

```javascript
const routes = [
  // 1. 静态路径
  { path: '/home', component: Home },
  
  // 2. 动态路径参数
  { path: '/user/:id', component: User },
  
  // 3. 多个动态参数
  { path: '/post/:category/:id', component: Post },
  
  // 4. 可选参数（Vue Router 4.x）
  { path: '/user/:id?', component: User },
  
  // 5. 正则匹配（Vue Router 4.x）
  { path: '/user/:id(\\d+)', component: User }, // 只匹配数字
  
  // 6. 重复参数
  { path: '/files/:path+', component: Files }, // 至少一个
  { path: '/files/:path*', component: Files }, // 零个或多个
  
  // 7. 根路径
  { path: '/', component: Home },
  
  // 8. 404 路由（Vue Router 4.x）
  { path: '/:pathMatch(.*)*', component: NotFound }
]
```

**路径匹配优先级：**
```javascript
// 优先级从高到低
const routes = [
  { path: '/user/create', component: UserCreate },    // 1. 静态路径（最高）
  { path: '/user/:id(\\d+)', component: UserProfile }, // 2. 带正则的动态路径
  { path: '/user/:id', component: UserProfile },      // 3. 普通动态路径
  { path: '/:pathMatch(.*)*', component: NotFound }   // 4. 通配符（最低）
]

// 访问 /user/create → 匹配 UserCreate（精确匹配优先）
// 访问 /user/123 → 匹配第二个路由（正则匹配）
// 访问 /user/abc → 匹配第三个路由（普通动态路径）
```

### name - 命名路由

**命名路由的优势：**

```javascript
const routes = [
  {
    path: '/user/:id/posts/:postId',
    name: 'UserPost',
    component: UserPost
  }
]

// 不使用命名路由（不推荐）
router.push('/user/123/posts/456')
router.push(`/user/${userId}/posts/${postId}`)

// 使用命名路由（推荐）
router.push({ 
  name: 'UserPost', 
  params: { id: 123, postId: 456 } 
})

// 优势：
// 1. 路径修改时，导航代码无需修改
// 2. 自动编码/解码参数
// 3. 防止路径拼写错误
// 4. 代码更清晰
```

**命名规范：**

```javascript
// 推荐：PascalCase
{ path: '/user/:id', name: 'UserProfile' }
{ path: '/user/:id/edit', name: 'UserEdit' }
{ path: '/posts', name: 'PostList' }

// 不推荐
{ path: '/user/:id', name: 'user-profile' }  // kebab-case
{ path: '/user/:id', name: 'userProfile' }   // camelCase
```

### component - 组件配置

```javascript
// 1. 同步组件（不推荐）
import Home from './views/Home.vue'
{ path: '/', component: Home }

// 2. 异步组件（推荐）
{
  path: '/about',
  component: () => import('./views/About.vue')
}

// 3. 分组打包
{
  path: '/admin',
  component: () => import(/* webpackChunkName: "admin" */ './views/Admin.vue')
}

// 4. 多个路由共享一个 chunk
{
  path: '/user/profile',
  component: () => import(/* webpackChunkName: "user" */ './views/UserProfile.vue')
},
{
  path: '/user/settings',
  component: () => import(/* webpackChunkName: "user" */ './views/UserSettings.vue')
}
```

## redirect 与 alias

### redirect - 重定向

```javascript
// 1. 字符串重定向
{ path: '/home', redirect: '/' }

// 2. 命名路由重定向
{ path: '/home', redirect: { name: 'Home' } }

// 3. 函数重定向
{
  path: '/search',
  redirect: to => {
    // to 是目标路由对象
    return { path: '/search-results', query: { q: to.params.searchText } }
  }
}

// 4. 相对重定向
{
  path: '/users/:id',
  children: [
    { path: '', redirect: 'profile' },        // → /users/:id/profile
    { path: 'profile', component: UserProfile },
    { path: 'posts', component: UserPosts }
  ]
}

// 5. 保留查询参数和 hash
{ 
  path: '/old-path', 
  redirect: to => ({
    path: '/new-path',
    query: to.query,  // 保留查询参数
    hash: to.hash     // 保留 hash
  })
}
```

**重定向的历史记录：**

```javascript
// 用户访问 /home
{ path: '/home', redirect: '/' }

// 浏览器地址栏显示：/
// 历史记录：/ （不会记录 /home）
// 点击后退：回到上一个页面（不是 /home）
```

### alias - 别名

```javascript
// 1. 单个别名
{
  path: '/users',
  component: Users,
  alias: '/people'
}
// 访问 /users 或 /people 都显示 Users 组件
// 但 URL 不会改变

// 2. 多个别名
{
  path: '/users',
  component: Users,
  alias: ['/people', '/persons']
}

// 3. 嵌套路由的别名
{
  path: '/users/:id',
  component: UserProfile,
  children: [
    {
      path: 'profile',
      component: Profile,
      alias: ['', 'info']  // /users/:id 和 /users/:id/info 都可以访问
    }
  ]
}
```

**redirect vs alias：**

| 特性 | redirect | alias |
|------|----------|-------|
| **URL 变化** | 改变为重定向目标 | 保持不变 |
| **历史记录** | 只记录目标路由 | 记录别名路由 |
| **适用场景** | 路径迁移、默认路径 | 同一组件的多个访问路径 |

```javascript
// 场景对比
// 1. 路径迁移：使用 redirect
{ path: '/old-dashboard', redirect: '/dashboard' }

// 2. 多种访问方式：使用 alias
{
  path: '/user/:id',
  component: UserProfile,
  alias: ['/profile/:id', '/u/:id']
}
```

## 命名路由的使用

### 声明式导航

```vue
<template>
  <!-- 路径导航 -->
  <router-link to="/user/123">用户</router-link>
  
  <!-- 命名路由导航 -->
  <router-link :to="{ name: 'User', params: { id: 123 } }">
    用户
  </router-link>
  
  <!-- 带查询参数 -->
  <router-link :to="{ 
    name: 'User', 
    params: { id: 123 },
    query: { tab: 'posts' }
  }">
    用户帖子
  </router-link>
</template>
```

### 编程式导航

```javascript
// 路径导航
this.$router.push('/user/123')
this.$router.push({ path: '/user/123' })

// 命名路由导航
this.$router.push({ name: 'User', params: { id: 123 } })

// 注意：命名路由时 path 会被忽略
this.$router.push({ 
  name: 'User', 
  params: { id: 123 },
  path: '/user/456'  // ❌ 这个 path 会被忽略
})
```

### 命名路由的陷阱

```javascript
// ❌ 错误：使用 path 时不能用 params
router.push({ path: '/user', params: { id: 123 } })
// 结果：/user（params 被忽略）

// ✅ 正确：使用 path 时用 query
router.push({ path: '/user', query: { id: 123 } })
// 结果：/user?id=123

// ✅ 正确：使用 name 时用 params
router.push({ name: 'User', params: { id: 123 } })
// 结果：/user/123
```

## 路由配置的最佳实践

### 1. 模块化组织

```javascript
// router/modules/user.js
export default [
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      {
        path: '',
        name: 'UserList',
        component: () => import('@/views/user/List.vue')
      },
      {
        path: ':id',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue')
      }
    ]
  }
]

// router/modules/admin.js
export default [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      // ...
    ]
  }
]

// router/index.js
import userRoutes from './modules/user'
import adminRoutes from './modules/admin'

const routes = [
  { path: '/', component: Home },
  ...userRoutes,
  ...adminRoutes
]
```

### 2. 统一命名规范

```javascript
// 推荐：模块_功能 格式
const routes = [
  { path: '/user', name: 'UserList', component: UserList },
  { path: '/user/:id', name: 'UserProfile', component: UserProfile },
  { path: '/user/:id/edit', name: 'UserEdit', component: UserEdit },
  { path: '/post', name: 'PostList', component: PostList },
  { path: '/post/:id', name: 'PostDetail', component: PostDetail }
]
```

### 3. 合理使用 meta

```javascript
const routes = [
  {
    path: '/admin',
    meta: { 
      requiresAuth: true,     // 需要登录
      roles: ['admin'],       // 需要的角色
      title: '管理后台',      // 页面标题
      icon: 'dashboard',      // 菜单图标
      keepAlive: true,        // 是否缓存
      breadcrumb: ['首页', '管理后台']  // 面包屑
    },
    component: Admin
  }
]

// 导航守卫中使用
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return '/login'
  }
  
  if (to.meta.title) {
    document.title = to.meta.title
  }
})
```

### 4. 路径规范

```javascript
// ✅ 推荐
{ path: '/user', component: User }
{ path: '/user/:id', component: UserProfile }
{ path: '/user/:id/posts', component: UserPosts }

// ❌ 不推荐
{ path: '/user/', component: User }           // 避免尾部斜杠
{ path: '/User', component: User }            // 避免大写
{ path: '/user_profile', component: User }    // 避免下划线
{ path: '/userProfile', component: User }     // 避免驼峰
```

### 5. 懒加载优化

```javascript
// 按功能模块分组
const routes = [
  {
    path: '/user',
    component: () => import(/* webpackChunkName: "user" */ '@/views/user/Index.vue'),
    children: [
      {
        path: 'profile',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Profile.vue')
      },
      {
        path: 'settings',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Settings.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/admin/Index.vue'),
    children: [
      // 管理相关路由使用同一个 chunk
    ]
  }
]
```

## 关键点总结

1. **path 配置**：支持静态、动态、正则、通配符等多种形式
2. **命名路由**：推荐使用，便于维护和重构
3. **redirect**：改变 URL，用于路径迁移
4. **alias**：不改变 URL，用于同一组件的多个访问路径
5. **最佳实践**：模块化组织、统一命名、合理使用 meta、懒加载优化

## 深入一点：路径参数的高级匹配

```javascript
// 1. 自定义正则
{
  path: '/user/:id(\\d+)',  // 只匹配数字
  component: User
}
// /user/123 ✅
// /user/abc ❌

// 2. 可选参数
{
  path: '/user/:id?',  // id 可选
  component: User
}
// /user ✅
// /user/123 ✅

// 3. 重复参数
{
  path: '/files/:path+',  // 至少一个段
  component: Files
}
// /files/a ✅
// /files/a/b/c ✅
// /files ❌

{
  path: '/files/:path*',  // 零个或多个段
  component: Files
}
// /files ✅
// /files/a/b/c ✅

// 4. 组合使用
{
  path: '/articles/:category/:year(\\d{4})/:month(\\d{2})?',
  component: Articles
}
// /articles/tech/2024 ✅
// /articles/tech/2024/03 ✅
// /articles/tech/abc ❌
```

## 参考资料

- [Vue Router - 路由配置](https://router.vuejs.org/zh/api/#routerecordraw)
- [Vue Router - 动态路由匹配](https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html)
- [Vue Router - 路由重定向和别名](https://router.vuejs.org/zh/guide/essentials/redirect-and-alias.html)
