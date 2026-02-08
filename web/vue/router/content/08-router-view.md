# 第 08 节：router-view 详解

## 概述

`<router-view>` 是 Vue Router 的核心组件，用于渲染当前路由匹配的组件。它是路由组件的显示容器，支持嵌套路由、命名视图、过渡动画等高级功能。

## 一、基础用法

### 1.1 简单使用

```vue
<template>
  <div id="app">
    <header>
      <nav>
        <router-link to="/home">首页</router-link>
        <router-link to="/about">关于</router-link>
      </nav>
    </header>
    
    <!-- 路由组件在这里渲染 -->
    <main>
      <router-view />
    </main>
    
    <footer>
      <p>© 2024 我的网站</p>
    </footer>
  </div>
</template>
```

### 1.2 渲染机制

```javascript
// 路由配置
const routes = [
  { path: '/home', component: Home },
  { path: '/about', component: About }
]

// 当访问 /home 时：
// <router-view /> 会被替换为 <Home />

// 当访问 /about 时：
// <router-view /> 会被替换为 <About />
```

## 二、插槽 API

### 2.1 作用域插槽

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <div class="page-wrapper">
      <!-- 页面元信息 -->
      <h1 v-if="route.meta.title">{{ route.meta.title }}</h1>
      
      <!-- 渲染路由组件 -->
      <component :is="Component" />
      
      <!-- 页面底部信息 -->
      <div class="page-info">
        <p>当前路由：{{ route.path }}</p>
        <p>最后更新：{{ new Date().toLocaleString() }}</p>
      </div>
    </div>
  </router-view>
</template>
```

### 2.2 插槽参数详解

```vue
<template>
  <router-view v-slot="slotProps">
    <!-- Component: 当前要渲染的组件 -->
    <component :is="slotProps.Component" />
    
    <!-- route: 当前路由对象 -->
    <div class="route-debug">
      <p>路径：{{ slotProps.route.path }}</p>
      <p>参数：{{ JSON.stringify(slotProps.route.params) }}</p>
      <p>查询：{{ JSON.stringify(slotProps.route.query) }}</p>
    </div>
  </router-view>
</template>
```

### 2.3 条件渲染

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <!-- 加载状态 -->
    <div v-if="!Component" class="loading">
      加载中...
    </div>
    
    <!-- 正常渲染 -->
    <template v-else>
      <!-- 错误边界 -->
      <error-boundary>
        <component :is="Component" :key="route.path" />
      </error-boundary>
    </template>
  </router-view>
</template>
```

## 三、KeepAlive 缓存

### 3.1 基本缓存

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

### 3.2 条件缓存

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cachedViews" :exclude="excludedViews">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 需要缓存的组件名
const cachedViews = ref(['Home', 'UserProfile', 'ProductList'])

// 不需要缓存的组件名
const excludedViews = ref(['Login', 'Payment'])

// 基于路由元信息动态控制
const shouldCache = computed(() => {
  return route => route.meta?.keepAlive !== false
})
</script>
```

### 3.3 动态缓存控制

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="dynamicCachedViews">
      <component :is="Component" :key="getCacheKey(route)" />
    </keep-alive>
  </router-view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const dynamicCachedViews = ref(new Set())

// 动态添加/移除缓存
const addToCache = (componentName) => {
  dynamicCachedViews.value.add(componentName)
}

const removeFromCache = (componentName) => {
  dynamicCachedViews.value.delete(componentName)
}

// 基于用户行为控制缓存
watch(() => route.meta, (meta) => {
  if (meta?.component && meta?.cache) {
    addToCache(meta.component)
  }
})

// 生成缓存键
const getCacheKey = (route) => {
  // 基于路由参数生成唯一键
  return route.meta?.cacheKey || route.fullPath
}
</script>
```

## 四、过渡动画

### 4.1 基础过渡

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="route.path" />
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

### 4.2 动态过渡

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="getTransitionName(route)" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
const getTransitionName = (route) => {
  // 基于路由元信息
  if (route.meta?.transition) {
    return route.meta.transition
  }
  
  // 基于路由深度
  const depth = route.path.split('/').length
  return depth > 2 ? 'slide-left' : 'slide-right'
}
</script>

<style>
/* 左滑动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

/* 右滑动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
```

### 4.3 复杂过渡效果

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="transitionName"
      :mode="transitionMode"
      :duration="transitionDuration"
      @before-enter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
import { ref, computed } from 'vue'

const transitionName = ref('default')
const transitionMode = ref('out-in')
const transitionDuration = ref(300)

// JavaScript 钩子函数
const beforeEnter = (el) => {
  console.log('过渡开始前')
  el.style.opacity = 0
}

const enter = (el, done) => {
  console.log('过渡进入中')
  el.offsetHeight // 强制重排
  el.style.transition = 'opacity 0.3s'
  el.style.opacity = 1
  el.addEventListener('transitionend', done)
}

const leave = (el, done) => {
  console.log('过渡离开中')
  el.style.transition = 'opacity 0.3s'
  el.style.opacity = 0
  el.addEventListener('transitionend', done)
}
</script>
```

## 五、嵌套路由视图

### 5.1 多级嵌套

```vue
<!-- App.vue (根级 router-view) -->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<!-- UserLayout.vue (二级 router-view) -->
<template>
  <div class="user-layout">
    <aside class="sidebar">
      <router-link to="/user/profile">个人资料</router-link>
      <router-link to="/user/settings">设置</router-link>
    </aside>
    
    <main class="content">
      <!-- 嵌套路由在这里渲染 -->
      <router-view />
    </main>
  </div>
</template>

<!-- 路由配置 -->
<script>
const routes = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      { path: 'profile', component: UserProfile },
      { path: 'settings', component: UserSettings }
    ]
  }
]
</script>
```

### 5.2 嵌套视图的键值

```vue
<template>
  <!-- 为嵌套路由提供唯一键 -->
  <router-view v-slot="{ Component, route }">
    <transition name="nested-route" mode="out-in">
      <component 
        :is="Component" 
        :key="route.fullPath"
      />
    </transition>
  </router-view>
</template>
```

## 六、命名视图

### 6.1 基本命名视图

```vue
<template>
  <div class="layout">
    <!-- 默认视图 -->
    <router-view />
    
    <!-- 命名视图 -->
    <router-view name="sidebar" />
    <router-view name="footer" />
  </div>
</template>

<!-- 路由配置 -->
<script>
const routes = [
  {
    path: '/dashboard',
    components: {
      default: Dashboard,
      sidebar: DashboardSidebar,
      footer: DashboardFooter
    }
  }
]
</script>
```

### 6.2 命名视图的插槽

```vue
<template>
  <div class="multi-view-layout">
    <!-- 主视图 -->
    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition name="main" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    
    <!-- 侧边栏视图 -->
    <aside class="sidebar">
      <router-view name="sidebar" v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </aside>
    
    <!-- 模态框视图 -->
    <router-view name="modal" v-slot="{ Component }">
      <teleport to="body">
        <component :is="Component" />
      </teleport>
    </router-view>
  </div>
</template>
```

## 七、错误处理

### 7.1 错误边界

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <error-boundary
      :key="route.path"
      @error="handleError"
    >
      <suspense>
        <template #default>
          <component :is="Component" />
        </template>
        <template #fallback>
          <div class="loading">Loading...</div>
        </template>
      </suspense>
    </error-boundary>
  </router-view>
</template>

<script setup>
import ErrorBoundary from '@/components/ErrorBoundary.vue'

const handleError = (error, errorInfo) => {
  console.error('路由组件错误:', error)
  
  // 错误上报
  reportError(error, {
    route: route.path,
    component: errorInfo.componentStack
  })
}
</script>
```

### 7.2 加载状态

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <div v-if="isLoading" class="page-loading">
        <div class="spinner"></div>
        <p>加载页面中...</p>
      </div>
      
      <component 
        v-else-if="Component" 
        :is="Component"
        :key="route.path"
        @loading="handleLoading"
      />
      
      <div v-else class="no-component">
        <p>页面不存在</p>
      </div>
    </transition>
  </router-view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLoading = ref(false)

// 监听路由变化显示加载状态
watch(() => route.path, () => {
  isLoading.value = true
  
  // 模拟加载时间
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})

const handleLoading = (loading) => {
  isLoading.value = loading
}
</script>
```

## 八、高级功能

### 8.1 元数据注入

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <!-- 注入路由元数据 -->
    <component 
      :is="Component" 
      v-bind="getRouteProps(route)"
      :route-meta="route.meta"
    />
  </router-view>
</template>

<script setup>
const getRouteProps = (route) => {
  return {
    routePath: route.path,
    routeParams: route.params,
    routeQuery: route.query,
    ...route.meta?.componentProps
  }
}
</script>
```

### 8.2 权限控制

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <!-- 权限检查 -->
    <component 
      v-if="hasPermission(route)"
      :is="Component" 
    />
    
    <!-- 无权限时显示 -->
    <forbidden-page 
      v-else
      :required-permission="route.meta?.permission"
    />
  </router-view>
</template>

<script setup>
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const hasPermission = (route) => {
  const requiredPermission = route.meta?.permission
  
  if (!requiredPermission) return true
  
  return userStore.hasPermission(requiredPermission)
}
</script>
```

### 8.3 性能监控

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <component 
      :is="Component"
      :key="route.path"
      @vue:mounted="onComponentMounted"
      @vue:unmounted="onComponentUnmounted"
    />
  </router-view>
</template>

<script setup>
const performanceData = new Map()

const onComponentMounted = (componentInstance) => {
  const startTime = performance.now()
  const componentName = componentInstance.$options.name || 'Anonymous'
  
  performanceData.set(componentName, {
    mountTime: startTime,
    route: route.path
  })
  
  console.log(`组件 ${componentName} 挂载耗时: ${startTime}ms`)
}

const onComponentUnmounted = (componentInstance) => {
  const componentName = componentInstance.$options.name || 'Anonymous'
  const data = performanceData.get(componentName)
  
  if (data) {
    const duration = performance.now() - data.mountTime
    console.log(`组件 ${componentName} 存活时间: ${duration}ms`)
    performanceData.delete(componentName)
  }
}
</script>
```

## 九、最佳实践

### 9.1 组件键管理

```vue
<script setup>
// ✅ 好的键值策略
const getComponentKey = (route) => {
  // 1. 对于需要重新创建的页面
  if (route.meta?.forceReload) {
    return `${route.path}-${Date.now()}`
  }
  
  // 2. 对于参数化页面
  if (route.params.id) {
    return `${route.name}-${route.params.id}`
  }
  
  // 3. 默认使用完整路径
  return route.fullPath
}

// ❌ 避免的做法
const badKey = route => Math.random() // 总是重新创建
const alsoBad = route => route.name   // 参数变化时不会重新创建
</script>
```

### 9.2 性能优化

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <!-- 预加载下一个可能的路由 -->
    <component 
      :is="Component"
      @mouseenter="preloadNextRoute"
    />
  </router-view>
</template>

<script setup>
const preloadNextRoute = () => {
  // 预加载相关路由组件
  const nextRoutes = getNextPossibleRoutes(route)
  nextRoutes.forEach(routePath => {
    router.resolve(routePath) // 触发懒加载
  })
}

const getNextPossibleRoutes = (currentRoute) => {
  // 基于当前路由预测下一步可能的路由
  const suggestions = []
  
  if (currentRoute.path === '/') {
    suggestions.push('/products', '/about')
  } else if (currentRoute.path.startsWith('/product/')) {
    suggestions.push('/cart', '/checkout')
  }
  
  return suggestions
}
</script>
```

## 十、总结

| 特性 | 说明 |
|------|------|
| 基础渲染 | 渲染当前路由匹配的组件 |
| 作用域插槽 | 访问 Component 和 route 对象 |
| KeepAlive | 组件缓存，提高性能 |
| 过渡动画 | 页面切换动画效果 |
| 嵌套视图 | 支持多级路由嵌套 |
| 命名视图 | 同时渲染多个组件 |
| 错误处理 | 优雅处理组件错误 |

## 参考资料

- [router-view API](https://router.vuejs.org/api/#router-view)
- [嵌套路由](https://router.vuejs.org/guide/essentials/nested-routes.html)

---

**下一节** → [第 09 节：全局守卫](./09-global-guards.md)
