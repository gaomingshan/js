# 路由高级特性

> 掌握 Vue Router 的高级功能，实现复杂的路由需求。

## 滚动行为

自定义路由切换时的滚动位置。

### 基础配置

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // savedPosition: 浏览器前进/后退时的滚动位置
    if (savedPosition) {
      return savedPosition
    }
    
    // 滚动到指定锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // 默认滚动到顶部
    return { top: 0 }
  }
})
```

### 延迟滚动

```typescript
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (savedPosition) {
        resolve(savedPosition)
      } else {
        resolve({ top: 0 })
      }
    }, 500)
  })
}
```

### 复杂滚动行为

```typescript
scrollBehavior(to, from, savedPosition) {
  // 保持滚动位置的路由
  const keepScrollRoutes = ['List', 'Search']
  
  if (savedPosition && keepScrollRoutes.includes(from.name as string)) {
    return savedPosition
  }
  
  // 滚动到锚点
  if (to.hash) {
    return {
      el: to.hash,
      behavior: 'smooth',
      top: 80 // 顶部偏移（导航栏高度）
    }
  }
  
  // 异步组件加载完成后滚动
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ top: 0, behavior: 'smooth' })
    }, 300)
  })
}
```

---

## 路由懒加载进阶

### 按需加载策略

```typescript
// 1. 基础懒加载
const Home = () => import('@/views/Home.vue')

// 2. 带命名的 chunk
const About = () => import(
  /* webpackChunkName: "about" */
  '@/views/About.vue'
)

// 3. 预加载（高优先级）
const Dashboard = () => import(
  /* webpackPrefetch: true */
  '@/views/Dashboard.vue'
)

// 4. 预取（空闲时加载）
const Profile = () => import(
  /* webpackPreload: true */
  '@/views/Profile.vue'
)

// 5. 条件懒加载
const Admin = () => {
  if (hasPermission('admin')) {
    return import('@/views/Admin.vue')
  }
  return import('@/views/Forbidden.vue')
}
```

### 路由分组打包

```typescript
// 按功能模块分组
const routes = [
  {
    path: '/user',
    children: [
      {
        path: 'profile',
        component: () => import(
          /* webpackChunkName: "user" */
          '@/views/user/Profile.vue'
        )
      },
      {
        path: 'settings',
        component: () => import(
          /* webpackChunkName: "user" */
          '@/views/user/Settings.vue'
        )
      }
    ]
  },
  {
    path: '/admin',
    children: [
      {
        path: 'dashboard',
        component: () => import(
          /* webpackChunkName: "admin" */
          '@/views/admin/Dashboard.vue'
        )
      },
      {
        path: 'users',
        component: () => import(
          /* webpackChunkName: "admin" */
          '@/views/admin/Users.vue'
        )
      }
    ]
  }
]
```

---

## 动态路由

### 添加路由

```typescript
// 动态添加路由
router.addRoute({
  path: '/about',
  name: 'About',
  component: About
})

// 添加嵌套路由
router.addRoute('ParentRoute', {
  path: 'child',
  component: Child
})

// 添加多个路由
const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
]

routes.forEach(route => {
  router.addRoute(route)
})
```

### 删除路由

```typescript
// 通过名称删除
router.addRoute({ path: '/about', name: 'about', component: About })
router.removeRoute('about')

// 通过添加同名路由覆盖
router.addRoute({ path: '/about', name: 'about', component: About })
router.addRoute({ path: '/other', name: 'about', component: Other })

// 通过返回的回调删除
const removeRoute = router.addRoute({ path: '/about', component: About })
removeRoute() // 删除路由
```

### 检查路由

```typescript
// 检查路由是否存在
router.hasRoute('about') // boolean

// 获取所有路由
const routes = router.getRoutes()

// 获取路由记录
const route = routes.find(r => r.name === 'about')
```

### 动态路由应用

```typescript
// 根据用户权限动态加载路由
import { useUserStore } from '@/stores/user'

export async function setupDynamicRoutes(router: Router) {
  const userStore = useUserStore()
  
  if (!userStore.isLoggedIn) return
  
  try {
    // 获取用户权限路由
    const userRoutes = await api.getUserRoutes()
    
    // 动态添加路由
    userRoutes.forEach(route => {
      router.addRoute(route)
    })
    
    // 添加 404 路由（必须最后添加）
    router.addRoute({
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
    })
  } catch (error) {
    console.error('加载动态路由失败:', error)
  }
}
```

---

## 路由过渡动画

### 基础过渡

```vue
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 基于路由的过渡

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
// 路由配置
const routes = [
  {
    path: '/',
    component: Home,
    meta: { transition: 'slide-left' }
  },
  {
    path: '/about',
    component: About,
    meta: { transition: 'slide-right' }
  }
]
</script>
```

### 动态过渡

```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const transitionName = ref('fade')

watch(
  () => route.meta.index,
  (toIndex, fromIndex) => {
    transitionName.value = toIndex > fromIndex ? 'slide-left' : 'slide-right'
  }
)
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
```

---

## 路由元信息进阶

### 类型定义

```typescript
// types/router.d.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: string[]
    layout?: 'default' | 'blank' | 'admin'
    icon?: string
    hidden?: boolean
    breadcrumb?: boolean
    cache?: boolean
    transition?: string
  }
}
```

### 元信息应用

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '仪表盘',
      requiresAuth: true,
      roles: ['admin', 'user'],
      icon: 'dashboard',
      layout: 'default',
      breadcrumb: true,
      cache: true,
      transition: 'slide-left'
    }
  }
]
```

### 元信息继承

```typescript
// 获取完整的元信息（包括父路由的 meta）
function getFullMeta(route: RouteLocationNormalized) {
  const meta = {}
  
  route.matched.forEach(record => {
    Object.assign(meta, record.meta)
  })
  
  return meta
}
```

---

## 导航重复

### 处理导航重复

```typescript
// Vue Router 4 不再抛出导航重复错误
router.push('/home').catch(err => {
  if (err.name !== 'NavigationDuplicated') {
    throw err
  }
})

// 或者全局处理
const originalPush = router.push
router.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      return Promise.reject(err)
    }
  })
}
```

---

## 路由懒加载优化

### 按需预加载

```typescript
// composables/useRoutePreload.ts
import { useRouter } from 'vue-router'

export function useRoutePreload() {
  const router = useRouter()
  
  function preloadRoute(name: string) {
    const route = router.getRoutes().find(r => r.name === name)
    
    if (route?.components?.default) {
      const component = route.components.default
      if (typeof component === 'function') {
        component()
      }
    }
  }
  
  return { preloadRoute }
}

// 使用
<script setup>
const { preloadRoute } = useRoutePreload()

function handleMouseEnter() {
  preloadRoute('Dashboard')
}
</script>

<template>
  <router-link
    to="/dashboard"
    @mouseenter="handleMouseEnter"
  >
    仪表盘
  </router-link>
</template>
```

---

## 实战示例

### 示例 1：多布局系统

```vue
<!-- App.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const route = useRoute()

const layouts = {
  default: DefaultLayout,
  blank: BlankLayout,
  admin: AdminLayout
}

const layout = computed(() => {
  const layoutName = route.meta.layout || 'default'
  return layouts[layoutName] || layouts.default
})
</script>

<template>
  <component :is="layout">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
</template>
```

### 示例 2：路由缓存控制

```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const cachedViews = ref<string[]>([])

watch(
  () => route.name,
  (newName) => {
    if (route.meta.cache && newName) {
      if (!cachedViews.value.includes(newName as string)) {
        cachedViews.value.push(newName as string)
      }
    }
  },
  { immediate: true }
)

function removeCachedView(name: string) {
  const index = cachedViews.value.indexOf(name)
  if (index > -1) {
    cachedViews.value.splice(index, 1)
  }
}
</script>

<template>
  <keep-alive :include="cachedViews">
    <router-view />
  </keep-alive>
</template>
```

### 示例 3：路由标签页

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Tab {
  name: string
  path: string
  title: string
}

const route = useRoute()
const router = useRouter()
const tabs = ref<Tab[]>([])

watch(
  () => route.path,
  () => {
    const tab: Tab = {
      name: route.name as string,
      path: route.path,
      title: route.meta.title as string || route.name as string
    }
    
    const exists = tabs.value.find(t => t.path === tab.path)
    if (!exists) {
      tabs.value.push(tab)
    }
  },
  { immediate: true }
)

function closeTab(index: number) {
  tabs.value.splice(index, 1)
  
  if (tabs.value.length === 0) {
    router.push('/')
  } else if (route.path === tabs.value[index]?.path) {
    router.push(tabs.value[index - 1]?.path || tabs.value[0].path)
  }
}

function closeOthers(path: string) {
  tabs.value = tabs.value.filter(t => t.path === path)
}

function closeAll() {
  tabs.value = []
  router.push('/')
}
</script>

<template>
  <div class="tabs">
    <div
      v-for="(tab, index) in tabs"
      :key="tab.path"
      :class="['tab', { active: route.path === tab.path }]"
    >
      <router-link :to="tab.path">{{ tab.title }}</router-link>
      <button @click="closeTab(index)">×</button>
    </div>
  </div>
  
  <router-view />
</template>
```

### 示例 4：路由权限指令

```typescript
// directives/auth.ts
import { Directive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export const vAuth: Directive = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value) {
      const hasAuth = userStore.permissions.includes(value)
      
      if (!hasAuth) {
        el.style.display = 'none'
      }
    }
  }
}

// 使用
<template>
  <button v-auth="'delete'">删除</button>
  <button v-auth="'edit'">编辑</button>
</template>
```

### 示例 5：路由切换进度条

```typescript
// plugins/nprogress.ts
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Router } from 'vue-router'

NProgress.configure({
  showSpinner: false,
  speed: 500,
  minimum: 0.2
})

export function setupProgress(router: Router) {
  router.beforeEach((to, from, next) => {
    if (to.path !== from.path) {
      NProgress.start()
    }
    next()
  })
  
  router.afterEach(() => {
    NProgress.done()
  })
  
  router.onError(() => {
    NProgress.done()
  })
}
```

---

## 路由测试

### 测试路由配置

```typescript
import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import routes from '@/router/routes'

describe('Router', () => {
  it('should have home route', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes
    })
    
    const homeRoute = router.getRoutes().find(r => r.name === 'Home')
    expect(homeRoute).toBeDefined()
    expect(homeRoute?.path).toBe('/')
  })
})
```

### 测试导航守卫

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'

describe('Navigation Guards', () => {
  it('should redirect to login if not authenticated', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: Home },
        { path: '/login', component: Login },
        { 
          path: '/dashboard',
          component: Dashboard,
          meta: { requiresAuth: true }
        }
      ]
    })
    
    router.beforeEach((to, from) => {
      if (to.meta.requiresAuth && !isAuthenticated()) {
        return '/login'
      }
    })
    
    await router.push('/dashboard')
    expect(router.currentRoute.value.path).toBe('/login')
  })
})
```

---

## 性能优化

### 1. 路由懒加载

```typescript
// ✅ 使用懒加载
const About = () => import('@/views/About.vue')

// ❌ 避免直接导入
import About from '@/views/About.vue'
```

### 2. 按需预加载

```typescript
// 根据用户行为预加载
<router-link
  to="/dashboard"
  @mouseenter="() => import('@/views/Dashboard.vue')"
>
  Dashboard
</router-link>
```

### 3. 路由缓存

```vue
<keep-alive :include="cachedViews">
  <router-view />
</keep-alive>
```

### 4. 减少路由层级

```typescript
// ❌ 过深的嵌套
{
  path: '/user',
  children: [{
    path: ':id',
    children: [{
      path: 'posts',
      children: [{
        path: ':postId'
      }]
    }]
  }]
}

// ✅ 扁平化
{
  path: '/user/:id/posts/:postId',
  component: Post
}
```

---

## 最佳实践

1. **路由懒加载**：优化首屏加载
2. **合理分组**：相关路由打包到一起
3. **元信息管理**：统一管理路由配置
4. **滚动行为**：提供良好的导航体验
5. **动态路由**：按需加载权限路由
6. **过渡动画**：平滑的页面切换
7. **错误处理**：404、权限错误等
8. **性能监控**：监控路由加载时间

---

## 参考资料

- [Vue Router 官方文档](https://router.vuejs.org/)
- [滚动行为](https://router.vuejs.org/guide/advanced/scroll-behavior.html)
- [路由懒加载](https://router.vuejs.org/guide/advanced/lazy-loading.html)
- [动态路由](https://router.vuejs.org/guide/advanced/dynamic-routing.html)
