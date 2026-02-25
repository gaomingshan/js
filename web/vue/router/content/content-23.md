# 第 23 章：性能优化

## 概述

路由性能优化直接影响用户体验和应用性能。本章将介绍路由懒加载的颗粒度控制、预加载策略、路由缓存、首屏优化等多个方面的性能优化技巧。

## 路由懒加载的颗粒度

### 过度拆分的问题

```javascript
// ❌ 问题：每个组件单独打包
const routes = [
  {
    path: '/user/profile',
    component: () => import('@/views/user/Profile.vue')  // profile.js
  },
  {
    path: '/user/settings',
    component: () => import('@/views/user/Settings.vue')  // settings.js
  },
  {
    path: '/user/posts',
    component: () => import('@/views/user/Posts.vue')  // posts.js
  }
]

// 问题：
// 1. 3 个 HTTP 请求
// 2. 每个文件都很小（10-20KB）
// 3. HTTP 开销大于收益
```

### 合理分组

```javascript
// ✅ 解决方案：按模块分组
const routes = [
  {
    path: '/user/profile',
    component: () => import(
      /* webpackChunkName: "user" */
      '@/views/user/Profile.vue'
    )
  },
  {
    path: '/user/settings',
    component: () => import(
      /* webpackChunkName: "user" */
      '@/views/user/Settings.vue'
    )
  },
  {
    path: '/user/posts',
    component: () => import(
      /* webpackChunkName: "user" */
      '@/views/user/Posts.vue'
    )
  }
]

// user.js (包含所有用户相关组件，约 50KB)
// 1 个 HTTP 请求，更高效
```

### 分组策略

```javascript
// 1. 按功能模块分组
const routes = [
  // 用户模块
  ...userRoutes.map(route => ({
    ...route,
    component: () => import(/* webpackChunkName: "user" */ route.component)
  })),
  
  // 产品模块
  ...productRoutes.map(route => ({
    ...route,
    component: () => import(/* webpackChunkName: "product" */ route.component)
  })),
  
  // 订单模块
  ...orderRoutes.map(route => ({
    ...route,
    component: () => import(/* webpackChunkName: "order" */ route.component)
  }))
]

// 2. 按访问频率分组
const routes = [
  // 高频页面：打包到主 chunk
  { path: '/', component: Home },
  { path: '/products', component: Products },
  
  // 中频页面：分组打包
  {
    path: '/cart',
    component: () => import(/* webpackChunkName: "common" */ '@/views/Cart.vue')
  },
  {
    path: '/checkout',
    component: () => import(/* webpackChunkName: "common" */ '@/views/Checkout.vue')
  },
  
  // 低频页面：单独打包
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
]

// 3. 按权限级别分组
const routes = [
  // 公开页面
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "public" */ '@/views/Login.vue')
  },
  
  // 用户页面
  {
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "user" */ '@/views/Dashboard.vue')
  },
  
  // 管理员页面
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/Admin.vue')
  }
]
```

## 预加载策略

### Prefetch（预获取）

```javascript
const routes = [
  {
    path: '/products',
    // 浏览器空闲时预加载
    component: () => import(
      /* webpackChunkName: "products" */
      /* webpackPrefetch: true */
      '@/views/Products.vue'
    )
  }
]

// 生成的 HTML
<link rel="prefetch" href="/js/products.js">

// 优点：
// - 浏览器空闲时下载
// - 不阻塞主线程
// - 用户点击时立即可用

// 缺点：
// - 可能浪费带宽
// - 移动端需谨慎使用
```

### Preload（预加载）

```javascript
const routes = [
  {
    path: '/critical',
    // 与主 chunk 并行加载
    component: () => import(
      /* webpackChunkName: "critical" */
      /* webpackPreload: true */
      '@/views/Critical.vue'
    )
  }
]

// 生成的 HTML
<link rel="preload" href="/js/critical.js" as="script">

// 注意：慎用 preload，可能影响首屏加载
```

### 智能预加载

```javascript
// composables/useSmartPrefetch.ts
import { onMounted, ref } from 'vue'

export function useSmartPrefetch() {
  const observer = ref<IntersectionObserver>()
  
  onMounted(() => {
    // 检测网络状态
    const connection = (navigator as any).connection
    const isFastNetwork = !connection || 
      connection.effectiveType === '4g' ||
      connection.effectiveType === '3g'
    
    if (!isFastNetwork) {
      return  // 慢速网络不预加载
    }
    
    // 使用 IntersectionObserver 检测元素可见
    observer.value = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLElement
          const href = link.getAttribute('data-prefetch')
          
          if (href) {
            // 预加载路由
            import(/* webpackChunkName: "[request]" */ `@/views/${href}.vue`)
          }
        }
      })
    })
  })
  
  function prefetchRoute(el: HTMLElement) {
    if (observer.value) {
      observer.value.observe(el)
    }
  }
  
  return { prefetchRoute }
}

// 使用
<template>
  <nav>
    <a
      href="/products"
      data-prefetch="Products"
      @mouseenter="prefetchRoute"
    >
      产品列表
    </a>
  </nav>
</template>

<script setup>
const { prefetchRoute } = useSmartPrefetch()
</script>
```

### 鼠标悬停预加载

```javascript
// router/prefetch.js
export function setupHoverPrefetch(router) {
  const prefetchedRoutes = new Set()
  
  document.addEventListener('mouseover', (e) => {
    const link = (e.target as HTMLElement).closest('a')
    if (!link) return
    
    const href = link.getAttribute('href')
    if (!href || prefetchedRoutes.has(href)) return
    
    // 查找对应的路由
    const route = router.resolve(href)
    const component = route.matched[0]?.components?.default
    
    if (component && typeof component === 'function') {
      // 预加载组件
      component().catch(() => {})
      prefetchedRoutes.add(href)
    }
  })
}

// 使用
import { setupHoverPrefetch } from './router/prefetch'

const router = createRouter({ ... })
setupHoverPrefetch(router)
```

## 路由缓存与 KeepAlive

### 基础用法

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

### 条件缓存

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cachedViews">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 根据路由 meta 决定是否缓存
const cachedViews = computed(() => {
  return route.matched
    .filter(r => r.meta.keepAlive)
    .map(r => r.name)
})
</script>
```

### 动态缓存管理

```javascript
// stores/cache.js
import { defineStore } from 'pinia'

export const useCacheStore = defineStore('cache', {
  state: () => ({
    cachedViews: []
  }),
  
  actions: {
    addCachedView(view) {
      if (!this.cachedViews.includes(view)) {
        this.cachedViews.push(view)
      }
    },
    
    removeCachedView(view) {
      const index = this.cachedViews.indexOf(view)
      if (index > -1) {
        this.cachedViews.splice(index, 1)
      }
    },
    
    clearCachedViews() {
      this.cachedViews = []
    }
  }
})
```

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cacheStore.cachedViews">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup>
import { useCacheStore } from '@/stores/cache'

const cacheStore = useCacheStore()
</script>
```

### 缓存刷新

```vue
<!-- 列表页 -->
<script setup>
import { onActivated } from 'vue'

// 从详情页返回时刷新列表
onActivated(() => {
  if (needRefresh.value) {
    fetchList()
    needRefresh.value = false
  }
})
</script>
```

## 首屏优化技巧

### 1. 首屏关键路由同步加载

```javascript
// 首页直接导入（同步）
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/',
    component: Home  // 同步加载，无需额外请求
  },
  {
    path: '/about',
    component: () => import('@/views/About.vue')  // 懒加载
  }
]
```

### 2. 骨架屏

```vue
<!-- App.vue -->
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <Suspense>
        <component :is="Component" />
        <template #fallback>
          <SkeletonScreen />
        </template>
      </Suspense>
    </transition>
  </router-view>
</template>

<script setup>
import SkeletonScreen from '@/components/SkeletonScreen.vue'
</script>
```

### 3. 路由级 Loading

```javascript
// router/index.js
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

router.beforeEach(() => {
  NProgress.start()
})

router.afterEach(() => {
  NProgress.done()
})
```

### 4. 按需加载第三方库

```javascript
// ❌ 不推荐：全局导入
import ElementPlus from 'element-plus'
app.use(ElementPlus)

// ✅ 推荐：按需导入
import { ElButton, ElMessage } from 'element-plus'
app.use(ElButton)
```

### 5. 代码分割优化

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 核心库单独打包
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 将 UI 库单独打包
          'ui-vendor': ['element-plus'],
          // 工具库
          'utils': ['axios', 'dayjs', 'lodash-es']
        }
      }
    }
  }
}
```

## 路由性能监控

### 路由切换时间监控

```javascript
// router/performance.js
export function setupPerformanceMonitor(router) {
  let startTime = 0
  
  router.beforeEach(() => {
    startTime = performance.now()
  })
  
  router.afterEach((to) => {
    const duration = performance.now() - startTime
    
    // 上报性能数据
    if (duration > 1000) {
      console.warn(`路由切换耗时过长: ${to.path} (${duration}ms)`)
      
      // 上报到监控系统
      reportPerformance({
        type: 'route-change',
        path: to.path,
        duration
      })
    }
  })
}
```

### 组件加载时间监控

```javascript
router.beforeResolve((to) => {
  const startTime = performance.now()
  
  // 等待异步组件加载完成
  to.matched.forEach(route => {
    const component = route.components?.default
    
    if (typeof component === 'function') {
      component().then(() => {
        const loadTime = performance.now() - startTime
        console.log(`组件加载时间: ${route.path} (${loadTime}ms)`)
      })
    }
  })
})
```

### Performance API 集成

```javascript
// 标记路由切换
router.beforeEach((to) => {
  performance.mark(`route-start-${to.path}`)
})

router.afterEach((to) => {
  performance.mark(`route-end-${to.path}`)
  performance.measure(
    `route-${to.path}`,
    `route-start-${to.path}`,
    `route-end-${to.path}`
  )
  
  // 获取测量结果
  const measures = performance.getEntriesByName(`route-${to.path}`)
  if (measures.length > 0) {
    console.log(`路由 ${to.path} 耗时: ${measures[0].duration}ms`)
  }
})
```

## 性能优化检查清单

```javascript
// 性能优化自检
const performanceChecklist = {
  // 1. 路由懒加载
  lazyLoading: {
    check: () => {
      const syncRoutes = routes.filter(r => 
        r.component && typeof r.component !== 'function'
      )
      return syncRoutes.length <= 2  // 首页和 404
    },
    tip: '除首页外，其他路由应使用懒加载'
  },
  
  // 2. 合理的 chunk 大小
  chunkSize: {
    check: () => {
      // 检查打包后的 chunk 是否合理（通过 bundle analyzer）
      return true
    },
    tip: '单个 chunk 不超过 244KB，总体不超过 1MB'
  },
  
  // 3. 使用 KeepAlive
  keepAlive: {
    check: () => {
      return routes.some(r => r.meta?.keepAlive)
    },
    tip: '列表页面应使用 KeepAlive 缓存'
  },
  
  // 4. 预加载策略
  prefetch: {
    check: () => {
      const prefetchRoutes = routes.filter(r => 
        r.component.toString().includes('webpackPrefetch')
      )
      return prefetchRoutes.length > 0
    },
    tip: '高频页面应使用 prefetch 预加载'
  }
}

// 执行检查
Object.entries(performanceChecklist).forEach(([key, { check, tip }]) => {
  if (!check()) {
    console.warn(`❌ ${key}: ${tip}`)
  } else {
    console.log(`✅ ${key}`)
  }
})
```

## 关键点总结

1. **懒加载颗粒度**：合理分组，避免过度拆分
2. **预加载策略**：使用 prefetch，智能预加载高频页面
3. **路由缓存**：使用 KeepAlive 缓存列表页面
4. **首屏优化**：关键路由同步加载，使用骨架屏
5. **性能监控**：监控路由切换时间，及时发现问题

## 深入一点：Webpack vs Vite 性能对比

```javascript
// Webpack 配置
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          name: 'vendor'
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
}

// Vite 配置（更快的开发体验）
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
}

// 性能对比：
// Webpack: 首次构建 30s+，热更新 1-3s
// Vite: 首次启动 < 1s，热更新 < 100ms
```

## 参考资料

- [Webpack - Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [Vite - Build Optimizations](https://vitejs.dev/guide/build.html)
- [Vue - KeepAlive](https://cn.vuejs.org/guide/built-ins/keep-alive.html)
- [Web.dev - Lazy Loading](https://web.dev/lazy-loading/)
