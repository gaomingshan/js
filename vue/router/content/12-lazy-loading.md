# 第 12 节：路由懒加载

## 概述

路由懒加载（Lazy Loading）是一种性能优化技术，将路由组件分割成独立的代码块，只在需要时才加载对应的组件。这能显著减少应用的初始加载时间。

## 一、懒加载基础

### 1.1 基本语法

```javascript
// 传统方式：同步导入（不推荐）
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

// 懒加载方式：异步导入（推荐）
const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about', 
    component: () => import('@/views/About.vue')
  }
]
```

### 1.2 工作原理

```javascript
// 动态导入返回 Promise
const LazyComponent = () => import('@/views/LazyComponent.vue')

// 等价于
const LazyComponent = () => {
  return new Promise((resolve) => {
    // webpack/vite 会将这个组件打包成独立的 chunk
    // 只有在路由被访问时才会加载
    import('@/views/LazyComponent.vue').then(resolve)
  })
}
```

### 1.3 构建产物对比

```bash
# 不使用懒加载
dist/
├── index.html
├── js/
│   └── app.js     # 包含所有组件的大文件 (500KB+)
└── css/
    └── app.css

# 使用懒加载
dist/
├── index.html
├── js/
│   ├── app.js           # 主应用文件 (50KB)
│   ├── chunk-home.js    # Home 组件 (20KB)
│   ├── chunk-about.js   # About 组件 (15KB)
│   └── chunk-user.js    # User 组件 (30KB)
└── css/
    ├── app.css
    ├── chunk-home.css
    └── chunk-user.css
```

## 二、Chunk 命名

### 2.1 webpack 注释语法

```javascript
const routes = [
  {
    path: '/',
    component: () => import(
      /* webpackChunkName: "home" */
      '@/views/Home.vue'
    )
  },
  {
    path: '/user',
    component: () => import(
      /* webpackChunkName: "user" */
      '@/views/User.vue'
    )
  }
]
```

### 2.2 Vite 注释语法

```javascript
const routes = [
  {
    path: '/dashboard',
    component: () => import(
      /* @vite-ignore */
      '@/views/Dashboard.vue'
    )
  }
]
```

### 2.3 分组打包

```javascript
// 将相关页面打包到同一个 chunk
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
    path: '/admin/dashboard',
    component: () => import(
      /* webpackChunkName: "admin" */
      '@/views/admin/Dashboard.vue'
    )
  },
  {
    path: '/admin/users',
    component: () => import(
      /* webpackChunkName: "admin" */
      '@/views/admin/Users.vue'
    )
  }
]
```

## 三、高级懒加载策略

### 3.1 条件懒加载

```javascript
// 基于环境的条件加载
const routes = [
  {
    path: '/dev-tools',
    component: process.env.NODE_ENV === 'development'
      ? () => import('@/views/DevTools.vue')
      : () => import('@/views/NotFound.vue')
  }
]

// 基于权限的条件加载
const createAdminRoutes = () => {
  if (hasAdminRole()) {
    return [
      {
        path: '/admin',
        component: () => import('@/views/admin/Dashboard.vue')
      }
    ]
  }
  return []
}
```

### 3.2 预加载策略

```javascript
// 预加载相关组件
const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue'),
    beforeEnter: () => {
      // 预加载可能访问的页面
      import('@/views/About.vue')
      import('@/views/Contact.vue')
    }
  }
]

// 基于用户行为的预加载
const HomeComponent = () => {
  const promise = import('@/views/Home.vue')
  
  // 鼠标悬停时预加载其他页面
  document.addEventListener('mouseover', (e) => {
    if (e.target.matches('[data-preload]')) {
      const path = e.target.getAttribute('data-preload')
      import(`@/views/${path}.vue`)
    }
  }, { once: true })
  
  return promise
}
```

### 3.3 重试机制

```javascript
// 加载失败时的重试逻辑
const createLazyComponent = (importFn, maxRetries = 3) => {
  return async () => {
    let lastError
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await importFn()
      } catch (error) {
        lastError = error
        console.warn(`组件加载失败，重试 ${i + 1}/${maxRetries}:`, error)
        
        // 延迟重试
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
      }
    }
    
    // 所有重试都失败，返回错误组件
    console.error('组件加载最终失败:', lastError)
    return import('@/components/LoadError.vue')
  }
}

// 使用重试机制
const routes = [
  {
    path: '/heavy-page',
    component: createLazyComponent(() => import('@/views/HeavyPage.vue'))
  }
]
```

## 四、加载状态处理

### 4.1 全局加载状态

```javascript
// 全局加载指示器
let loadingCount = 0

const showGlobalLoading = () => {
  loadingCount++
  if (loadingCount === 1) {
    // 显示全局加载动画
    const loading = document.getElementById('global-loading')
    if (loading) loading.style.display = 'block'
  }
}

const hideGlobalLoading = () => {
  loadingCount--
  if (loadingCount <= 0) {
    loadingCount = 0
    // 隐藏全局加载动画
    const loading = document.getElementById('global-loading')
    if (loading) loading.style.display = 'none'
  }
}

// 包装懒加载函数
const withLoading = (importFn) => {
  return async () => {
    showGlobalLoading()
    
    try {
      const component = await importFn()
      return component
    } finally {
      hideGlobalLoading()
    }
  }
}

// 应用到路由
const routes = [
  {
    path: '/page',
    component: withLoading(() => import('@/views/Page.vue'))
  }
]
```

### 4.2 组件级加载状态

```vue
<!-- LazyWrapper.vue -->
<template>
  <div class="lazy-wrapper">
    <div v-if="loading" class="loading-placeholder">
      <div class="spinner"></div>
      <p>页面加载中...</p>
    </div>
    
    <div v-else-if="error" class="error-placeholder">
      <p>页面加载失败</p>
      <button @click="retry">重试</button>
    </div>
    
    <component v-else :is="loadedComponent" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  loader: {
    type: Function,
    required: true
  }
})

const loading = ref(true)
const error = ref(null)
const loadedComponent = ref(null)

const loadComponent = async () => {
  loading.value = true
  error.value = null
  
  try {
    const component = await props.loader()
    loadedComponent.value = component.default || component
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}

const retry = () => {
  loadComponent()
}

onMounted(() => {
  loadComponent()
})
</script>
```

```javascript
// 使用 LazyWrapper
const routes = [
  {
    path: '/wrapped-page',
    component: LazyWrapper,
    props: {
      loader: () => import('@/views/WrappedPage.vue')
    }
  }
]
```

## 五、性能优化

### 5.1 代码分割策略

```javascript
// 按功能模块分割
const userRoutes = [
  {
    path: '/user/profile',
    component: () => import(
      /* webpackChunkName: "user-profile" */
      '@/views/user/Profile.vue'
    )
  },
  {
    path: '/user/settings',
    component: () => import(
      /* webpackChunkName: "user-settings" */ 
      '@/views/user/Settings.vue'
    )
  }
]

// 按访问频率分割
const routes = [
  // 高频访问页面：较小的 chunk
  {
    path: '/',
    component: () => import(
      /* webpackChunkName: "home" */
      '@/views/Home.vue'
    )
  },
  
  // 低频访问页面：可以合并到一个 chunk
  {
    path: '/privacy',
    component: () => import(
      /* webpackChunkName: "legal" */
      '@/views/Privacy.vue'
    )
  },
  {
    path: '/terms',
    component: () => import(
      /* webpackChunkName: "legal" */
      '@/views/Terms.vue'
    )
  }
]
```

### 5.2 预加载优化

```javascript
// 智能预加载
class PreloadManager {
  constructor() {
    this.preloaded = new Set()
    this.preloadQueue = []
    this.isPreloading = false
  }
  
  // 添加预加载任务
  addPreloadTask(importFn, priority = 0) {
    this.preloadQueue.push({ importFn, priority })
    this.preloadQueue.sort((a, b) => b.priority - a.priority)
    this.processQueue()
  }
  
  // 处理预加载队列
  async processQueue() {
    if (this.isPreloading) return
    
    this.isPreloading = true
    
    while (this.preloadQueue.length > 0) {
      // 检查网络状况
      if (this.isSlowNetwork()) {
        break
      }
      
      const task = this.preloadQueue.shift()
      const key = task.importFn.toString()
      
      if (!this.preloaded.has(key)) {
        try {
          await task.importFn()
          this.preloaded.add(key)
        } catch (error) {
          console.warn('预加载失败:', error)
        }
      }
      
      // 避免阻塞主线程
      await this.delay(100)
    }
    
    this.isPreloading = false
  }
  
  isSlowNetwork() {
    return navigator.connection?.effectiveType === 'slow-2g' ||
           navigator.connection?.effectiveType === '2g'
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

const preloadManager = new PreloadManager()

// 在路由中使用
const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue'),
    beforeEnter: () => {
      // 高优先级预加载
      preloadManager.addPreloadTask(
        () => import('@/views/Dashboard.vue'),
        10
      )
      
      // 低优先级预加载
      preloadManager.addPreloadTask(
        () => import('@/views/Settings.vue'),
        1
      )
    }
  }
]
```

## 六、错误处理

### 6.1 加载失败降级

```javascript
// 创建带降级的懒加载函数
const createResilientLoader = (primary, fallback) => {
  return async () => {
    try {
      return await primary()
    } catch (error) {
      console.warn('主要组件加载失败，使用降级组件:', error)
      
      if (fallback) {
        return await fallback()
      } else {
        // 返回通用错误组件
        return import('@/components/ErrorPage.vue')
      }
    }
  }
}

const routes = [
  {
    path: '/feature',
    component: createResilientLoader(
      () => import('@/views/FeaturePage.vue'),
      () => import('@/views/FeaturePageLite.vue')
    )
  }
]
```

### 6.2 网络错误处理

```javascript
// 网络状况检测
const createNetworkAwareLoder = (importFn) => {
  return async () => {
    // 检查网络状况
    if (!navigator.onLine) {
      throw new Error('网络连接不可用')
    }
    
    // 慢网络时显示提示
    if (navigator.connection?.effectiveType === 'slow-2g') {
      showSlowNetworkWarning()
    }
    
    const startTime = Date.now()
    
    try {
      const component = await importFn()
      const loadTime = Date.now() - startTime
      
      // 记录加载时间
      console.log(`组件加载耗时: ${loadTime}ms`)
      
      return component
    } catch (error) {
      const loadTime = Date.now() - startTime
      
      // 网络错误特殊处理
      if (error.message.includes('Loading chunk')) {
        console.error('代码块加载失败，可能是网络问题')
        return import('@/components/NetworkError.vue')
      }
      
      throw error
    }
  }
}

function showSlowNetworkWarning() {
  // 显示慢网络提示
  const toast = document.createElement('div')
  toast.textContent = '网络较慢，页面加载可能需要一些时间'
  toast.className = 'network-warning'
  document.body.appendChild(toast)
  
  setTimeout(() => {
    document.body.removeChild(toast)
  }, 3000)
}
```

## 七、构建配置优化

### 7.1 Vite 配置

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        // 手动控制代码分割
        manualChunks: {
          // 将 Vue 相关库打包到一起
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          
          // 将 UI 库单独打包
          'vendor-ui': ['element-plus', 'ant-design-vue'],
          
          // 将工具库打包到一起
          'vendor-utils': ['lodash', 'dayjs', 'axios']
        },
        
        // chunk 文件命名
        chunkFileNames: (chunkInfo) => {
          return `js/[name]-[hash].js`
        }
      }
    },
    
    // chunk 大小警告阈值
    chunkSizeWarningLimit: 1000
  }
}
```

### 7.2 Webpack 配置

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 第三方库
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        
        // 公共组件
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5
        }
      }
    }
  }
}
```

## 八、监控与分析

### 8.1 加载性能监控

```javascript
// 性能监控工具
class RoutePerformanceMonitor {
  constructor() {
    this.metrics = new Map()
  }
  
  startLoading(routeName) {
    this.metrics.set(routeName, {
      startTime: performance.now(),
      navigationStart: performance.timeOrigin
    })
  }
  
  endLoading(routeName) {
    const metric = this.metrics.get(routeName)
    
    if (metric) {
      const endTime = performance.now()
      const loadTime = endTime - metric.startTime
      
      console.log(`路由 ${routeName} 加载耗时: ${loadTime.toFixed(2)}ms`)
      
      // 发送到分析服务
      this.sendMetrics(routeName, loadTime)
      
      this.metrics.delete(routeName)
    }
  }
  
  sendMetrics(routeName, loadTime) {
    // 发送性能数据
    if (window.gtag) {
      window.gtag('event', 'route_load_time', {
        route_name: routeName,
        load_time: Math.round(loadTime)
      })
    }
  }
}

const monitor = new RoutePerformanceMonitor()

// 在路由守卫中使用
router.beforeEach((to) => {
  monitor.startLoading(to.name)
})

router.afterEach((to) => {
  monitor.endLoading(to.name)
})
```

### 8.2 Bundle 分析

```javascript
// 分析工具配置
// package.json
{
  "scripts": {
    "analyze": "npm run build && npx webpack-bundle-analyzer dist/js/*.js",
    "analyze:vite": "npm run build && npx vite-bundle-analyzer dist"
  }
}
```

## 九、最佳实践

### 9.1 懒加载策略

```javascript
// ✅ 好的策略
const routes = [
  // 首页立即加载
  {
    path: '/',
    component: Home // 直接导入
  },
  
  // 高频页面分别打包
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  
  // 相关页面组合打包
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
  }
]

// ❌ 避免的做法
const routes = [
  // 所有页面都懒加载（包括首页）
  {
    path: '/',
    component: () => import('@/views/Home.vue') // 首页也懒加载会影响首屏性能
  },
  
  // 过度分割（每个小组件都独立打包）
  {
    path: '/simple',
    component: () => import('@/components/SimpleButton.vue') // 组件太小，不值得独立打包
  }
]
```

### 9.2 错误恢复

```javascript
// 自动重试和降级机制
const createSmartLoader = (importFn, options = {}) => {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    fallback = null
  } = options
  
  return async () => {
    let lastError
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await importFn()
      } catch (error) {
        lastError = error
        
        if (i < maxRetries) {
          console.warn(`组件加载失败，${retryDelay}ms 后重试 ${i + 1}/${maxRetries}`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
    }
    
    // 尝试降级组件
    if (fallback) {
      try {
        return await fallback()
      } catch (fallbackError) {
        console.error('降级组件也加载失败:', fallbackError)
      }
    }
    
    // 最终返回错误页面
    console.error('组件加载彻底失败:', lastError)
    return import('@/components/LoadError.vue')
  }
}
```

## 十、总结

| 策略 | 优势 | 适用场景 |
|------|------|----------|
| 基础懒加载 | 减少初始包大小 | 所有非首屏页面 |
| 分组打包 | 减少HTTP请求 | 相关功能页面 |
| 预加载 | 提升用户体验 | 高概率访问页面 |
| 条件加载 | 按需加载功能 | 权限页面、A/B测试 |
| 错误处理 | 提高可靠性 | 网络不稳定环境 |

## 参考资料

- [路由懒加载](https://router.vuejs.org/guide/advanced/lazy-loading.html)
- [Webpack代码分割](https://webpack.js.org/guides/code-splitting/)

---

**下一节** → [第 13 节：路由元信息](./13-route-meta.md)
