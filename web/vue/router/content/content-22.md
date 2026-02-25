# 第 22 章：TypeScript 集成

## 概述

TypeScript 为 Vue Router 带来了类型安全、更好的 IDE 支持和更少的运行时错误。Vue Router 4.x 对 TypeScript 提供了完善的支持，本章将介绍如何在 TypeScript 项目中充分利用 Vue Router 的类型系统。

## 路由类型定义

### 基础路由配置

```typescript
import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  }
]
```

### 自定义路由元信息类型

```typescript
// router/types.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    // 页面标题
    title?: string
    // 图标
    icon?: string
    // 是否需要登录
    requiresAuth?: boolean
    // 允许的角色
    roles?: string[]
    // 需要的权限
    permissions?: string[]
    // 是否缓存
    keepAlive?: boolean
    // 是否在菜单中隐藏
    hidden?: boolean
    // 激活的菜单项
    activeMenu?: string
    // 面包屑
    breadcrumb?: string | ((route: RouteLocationNormalizedLoaded) => string)
    // 过渡动画
    transition?: string
  }
}
```

```typescript
// 使用自定义 meta
const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'),
    meta: {
      title: '管理后台',  // ✅ 类型安全
      icon: 'dashboard',
      requiresAuth: true,
      roles: ['admin'],
      keepAlive: true
      // invalidField: 'test'  // ❌ TypeScript 会报错
    }
  }
]
```

### 路由配置类型封装

```typescript
// router/types.ts
import type { RouteRecordRaw } from 'vue-router'

export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'meta' | 'children'> {
  meta?: RouteMeta
  children?: AppRouteRecordRaw[]
}

// 使用
const routes: AppRouteRecordRaw[] = [
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    meta: {
      title: '用户中心',
      requiresAuth: true
    },
    children: [
      {
        path: 'profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人资料' }
      }
    ]
  }
]
```

## 类型安全的路由跳转

### 路由名称类型化

```typescript
// router/route-names.ts
export const RouteNames = {
  Home: 'Home',
  About: 'About',
  UserProfile: 'UserProfile',
  UserSettings: 'UserSettings',
  ProductList: 'ProductList',
  ProductDetail: 'ProductDetail',
  AdminDashboard: 'AdminDashboard'
} as const

export type RouteName = typeof RouteNames[keyof typeof RouteNames]

// 路由配置中使用
const routes: RouteRecordRaw[] = [
  {
    path: '/user/profile',
    name: RouteNames.UserProfile,  // 类型安全
    component: () => import('@/views/user/Profile.vue')
  }
]
```

```typescript
// 组件中使用
import { useRouter } from 'vue-router'
import { RouteNames } from '@/router/route-names'

const router = useRouter()

// ✅ 类型安全
router.push({ name: RouteNames.UserProfile })

// ❌ TypeScript 会报错
router.push({ name: 'UserProfiles' })  // 拼写错误
```

### 路由参数类型推导

```typescript
// router/typed-routes.ts
import type { RouteLocationNamedRaw } from 'vue-router'

// 定义路由参数映射
interface RouteParamsMap {
  Home: undefined
  About: undefined
  UserProfile: { id: string }
  ProductDetail: { id: string; category?: string }
  ArticleEdit: { id: string; section: string }
}

// 类型安全的路由跳转
type TypedRouteLocation<T extends keyof RouteParamsMap> = 
  RouteParamsMap[T] extends undefined
    ? { name: T }
    : { name: T; params: RouteParamsMap[T] }

// 辅助函数
function typedPush<T extends keyof RouteParamsMap>(
  router: Router,
  location: TypedRouteLocation<T>
) {
  return router.push(location as any)
}

// 使用
const router = useRouter()

// ✅ 正确
typedPush(router, { name: 'UserProfile', params: { id: '123' } })

// ❌ TypeScript 会报错（缺少 params）
typedPush(router, { name: 'UserProfile' })

// ❌ TypeScript 会报错（params 类型错误）
typedPush(router, { name: 'UserProfile', params: { id: 123 } })
```

### 完整的类型安全路由系统

```typescript
// router/typed-router.ts
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router'

// 1. 定义所有路由名称
export enum RouteNames {
  Home = 'Home',
  About = 'About',
  UserProfile = 'UserProfile',
  ProductDetail = 'ProductDetail'
}

// 2. 定义路由参数
interface RouteParamsMap {
  [RouteNames.Home]: Record<string, never>
  [RouteNames.About]: Record<string, never>
  [RouteNames.UserProfile]: { id: string }
  [RouteNames.ProductDetail]: { id: string; tab?: string }
}

// 3. 定义查询参数
interface RouteQueryMap {
  [RouteNames.Home]: { page?: string }
  [RouteNames.About]: Record<string, never>
  [RouteNames.UserProfile]: { from?: string }
  [RouteNames.ProductDetail]: { ref?: string }
}

// 4. 类型安全的导航函数
export function useTypedRouter() {
  const router = useRouter()
  
  function push<T extends RouteNames>(
    name: T,
    ...args: {} extends RouteParamsMap[T]
      ? [params?: RouteParamsMap[T], query?: RouteQueryMap[T]]
      : [params: RouteParamsMap[T], query?: RouteQueryMap[T]]
  ) {
    const [params, query] = args
    return router.push({ name, params, query } as any)
  }
  
  function replace<T extends RouteNames>(
    name: T,
    ...args: {} extends RouteParamsMap[T]
      ? [params?: RouteParamsMap[T], query?: RouteQueryMap[T]]
      : [params: RouteParamsMap[T], query?: RouteQueryMap[T]]
  ) {
    const [params, query] = args
    return router.replace({ name, params, query } as any)
  }
  
  return { push, replace }
}

// 使用
const { push, replace } = useTypedRouter()

// ✅ 正确
push(RouteNames.UserProfile, { id: '123' })
push(RouteNames.UserProfile, { id: '123' }, { from: 'home' })

// ❌ 类型错误
push(RouteNames.UserProfile)  // 缺少 params
push(RouteNames.UserProfile, { id: 123 })  // 类型错误
```

## 路由参数类型推导

### 获取当前路由参数

```typescript
// composables/useRouteParams.ts
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useRouteParams<T extends Record<string, string>>() {
  const route = useRoute()
  
  return computed(() => route.params as T)
}

// 使用
<script setup lang="ts">
const params = useRouteParams<{ id: string; category: string }>()

console.log(params.value.id)  // 类型安全
console.log(params.value.category)  // 类型安全
</script>
```

### 获取查询参数

```typescript
// composables/useRouteQuery.ts
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { LocationQuery } from 'vue-router'

export function useRouteQuery<T extends Record<string, string | undefined>>() {
  const route = useRoute()
  
  return computed(() => route.query as T & LocationQuery)
}

// 使用
<script setup lang="ts">
interface Query {
  page?: string
  pageSize?: string
  keyword?: string
}

const query = useRouteQuery<Query>()

const page = computed(() => Number(query.value.page) || 1)
const pageSize = computed(() => Number(query.value.pageSize) || 10)
const keyword = computed(() => query.value.keyword || '')
</script>
```

## 路由元信息类型

### 强类型 meta 访问

```typescript
// composables/useRouteMeta.ts
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteMeta } from 'vue-router'

export function useRouteMeta() {
  const route = useRoute()
  
  const meta = computed(() => route.meta)
  
  const title = computed(() => meta.value.title || '')
  const requiresAuth = computed(() => meta.value.requiresAuth || false)
  const roles = computed(() => meta.value.roles || [])
  const permissions = computed(() => meta.value.permissions || [])
  
  return {
    meta,
    title,
    requiresAuth,
    roles,
    permissions
  }
}

// 使用
<script setup lang="ts">
const { title, requiresAuth, roles } = useRouteMeta()

console.log(title.value)  // string
console.log(requiresAuth.value)  // boolean
console.log(roles.value)  // string[]
</script>
```

### 路由守卫类型

```typescript
// router/guards/auth.ts
import type { 
  NavigationGuardNext, 
  RouteLocationNormalized 
} from 'vue-router'

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const requiresAuth = to.meta.requiresAuth
  
  if (requiresAuth && !isAuthenticated()) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}

// Vue Router 4.x 推荐写法（无需 next）
export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath }
    }
  }
}
```

## 最佳类型实践

### 1. 集中管理路由常量

```typescript
// router/constants.ts

// 路由名称枚举
export enum RouteNames {
  Home = 'Home',
  About = 'About',
  UserProfile = 'UserProfile',
  UserSettings = 'UserSettings',
  ProductList = 'ProductList',
  ProductDetail = 'ProductDetail'
}

// 路由路径常量
export const RoutePaths = {
  Home: '/',
  About: '/about',
  UserProfile: '/user/profile',
  UserSettings: '/user/settings',
  ProductList: '/products',
  ProductDetail: '/products/:id'
} as const

// 角色枚举
export enum UserRole {
  Admin = 'admin',
  Editor = 'editor',
  User = 'user'
}

// 权限枚举
export enum Permission {
  UserCreate = 'user:create',
  UserRead = 'user:read',
  UserUpdate = 'user:update',
  UserDelete = 'user:delete'
}
```

### 2. 类型安全的路由配置

```typescript
// router/routes/user.ts
import type { RouteRecordRaw } from 'vue-router'
import { RouteNames, UserRole } from '../constants'

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      {
        path: 'profile',
        name: RouteNames.UserProfile,
        component: () => import('@/views/user/Profile.vue'),
        meta: {
          title: '个人资料',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'settings',
        name: RouteNames.UserSettings,
        component: () => import('@/views/user/Settings.vue'),
        meta: {
          title: '账号设置',
          requiresAuth: true,
          roles: [UserRole.User, UserRole.Admin]
        }
      }
    ]
  }
]

export default userRoutes
```

### 3. 类型安全的导航守卫

```typescript
// router/guards/permission.ts
import type { Router } from 'vue-router'
import { UserRole } from '../constants'

export function setupPermissionGuard(router: Router) {
  router.beforeEach((to, from) => {
    const requiredRoles = to.meta.roles as UserRole[] | undefined
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }
    
    const userRole = getCurrentUserRole()
    
    if (!requiredRoles.includes(userRole)) {
      return { name: 'Forbidden' }
    }
  })
}

function getCurrentUserRole(): UserRole {
  // 获取当前用户角色
  return UserRole.User
}
```

### 4. 类型安全的组合式函数

```typescript
// composables/useNavigation.ts
import { useRouter } from 'vue-router'
import { RouteNames } from '@/router/constants'

export function useNavigation() {
  const router = useRouter()
  
  function goToHome() {
    return router.push({ name: RouteNames.Home })
  }
  
  function goToUserProfile(userId: string) {
    return router.push({
      name: RouteNames.UserProfile,
      params: { id: userId }
    })
  }
  
  function goToProductDetail(productId: string, tab?: string) {
    return router.push({
      name: RouteNames.ProductDetail,
      params: { id: productId },
      query: tab ? { tab } : undefined
    })
  }
  
  return {
    goToHome,
    goToUserProfile,
    goToProductDetail
  }
}

// 使用
<script setup lang="ts">
const { goToHome, goToUserProfile } = useNavigation()

function handleClick() {
  goToUserProfile('123')  // 类型安全
}
</script>
```

### 5. 类型安全的路由数据获取

```typescript
// composables/useRouteData.ts
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export function useRouteData<T>(
  fetcher: (params: Record<string, string>) => Promise<T>
) {
  const route = useRoute()
  const data = ref<T>()
  const loading = ref(false)
  const error = ref<Error>()
  
  async function fetchData() {
    loading.value = true
    error.value = undefined
    
    try {
      data.value = await fetcher(route.params as Record<string, string>)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }
  
  watch(
    () => route.params,
    () => fetchData(),
    { immediate: true }
  )
  
  return { data, loading, error, refetch: fetchData }
}

// 使用
<script setup lang="ts">
interface User {
  id: string
  name: string
  email: string
}

const { data: user, loading, error } = useRouteData<User>(
  async (params) => {
    const response = await fetch(`/api/users/${params.id}`)
    return response.json()
  }
)
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <div v-else-if="user">
    <h1>{{ user.name }}</h1>
    <p>{{ user.email }}</p>
  </div>
</template>
```

## 关键点总结

1. **类型定义**：使用 `RouteRecordRaw` 定义路由，扩展 `RouteMeta` 接口
2. **路由名称**：使用枚举或常量定义路由名称，确保类型安全
3. **参数类型**：定义路由参数映射，实现类型安全的导航
4. **守卫类型**：使用正确的类型注解，避免类型错误
5. **组合式函数**：封装类型安全的路由操作函数

## 深入一点：自动生成路由类型

```typescript
// scripts/generate-route-types.ts
import fs from 'fs'
import { routes } from '../router/index'

function generateRouteTypes(routes: any[]) {
  const names: string[] = []
  const params: Record<string, string> = {}
  
  function traverse(routes: any[]) {
    routes.forEach(route => {
      if (route.name) {
        names.push(route.name)
        
        // 提取参数
        const paramMatches = route.path.matchAll(/:(\w+)/g)
        const routeParams = Array.from(paramMatches).map(m => m[1])
        
        if (routeParams.length > 0) {
          params[route.name] = routeParams.join(', ')
        }
      }
      
      if (route.children) {
        traverse(route.children)
      }
    })
  }
  
  traverse(routes)
  
  const typeCode = `
// 自动生成的路由类型
export enum RouteNames {
${names.map(name => `  ${name} = '${name}'`).join(',\n')}
}

export interface RouteParamsMap {
${Object.entries(params).map(([name, params]) => 
  `  [RouteNames.${name}]: { ${params}: string }`
).join('\n')}
}
  `.trim()
  
  fs.writeFileSync('router/generated-types.ts', typeCode)
}

generateRouteTypes(routes)
```

## 参考资料

- [Vue Router - TypeScript](https://router.vuejs.org/zh/guide/advanced/typed-routes.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vue 3 TypeScript](https://cn.vuejs.org/guide/typescript/overview.html)
