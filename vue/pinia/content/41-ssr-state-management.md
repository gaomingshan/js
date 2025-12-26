# 第 41 节：服务端渲染(SSR)

## 概述

服务端渲染(SSR)环境下的状态管理需要特殊处理，包括状态注水/脱水、同构应用设计和性能优化等方面。本节介绍在 SSR 环境中如何正确实现状态管理。

## 一、SSR 基础概念

### 1.1 状态注水与脱水

```javascript
// 服务端状态注水
// server.js
import { createSSRApp } from 'vue'
import { createPiniaSSR } from '@pinia/ssr'
import { createStore } from './store'

export async function createApp() {
  const app = createSSRApp(App)
  const pinia = createPiniaSSR()
  
  app.use(pinia)
  
  return { app, pinia }
}

// 服务端渲染处理
export async function render(url, manifest) {
  const { app, pinia } = await createApp()
  
  // 路由到指定页面
  await router.push(url)
  await router.isReady()
  
  // 预取数据
  const matchedComponents = router.currentRoute.value.matched
  await Promise.all(
    matchedComponents.map(async (component) => {
      if (component.default?.asyncData) {
        const store = useMainStore(pinia)
        await component.default.asyncData({ store, route: router.currentRoute.value })
      }
    })
  )
  
  // 渲染应用
  const html = await renderToString(app)
  
  // 序列化状态
  const state = JSON.stringify(pinia.state.value)
  
  return {
    html,
    state
  }
}
```

```html
<!-- 客户端状态脱水 -->
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>SSR App</title>
</head>
<body>
  <div id="app">{{{ html }}}</div>
  
  <!-- 注入服务端状态 -->
  <script>
    window.__PINIA_STATE__ = {{{ state }}}
  </script>
  <script src="/js/app.js"></script>
</body>
</html>
```

### 1.2 客户端激活

```javascript
// client.js - 客户端激活
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const pinia = createPinia()

// 恢复服务端状态
if (window.__PINIA_STATE__) {
  pinia.state.value = window.__PINIA_STATE__
}

const app = createApp(App)
app.use(pinia)

// 激活应用
app.mount('#app', true) // true 表示 hydration 模式
```

## 二、Pinia SSR 实现

### 2.1 基本 SSR Setup

```javascript
// stores/main.ts
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    user: null,
    posts: [],
    loading: false
  }),
  
  actions: {
    async fetchUser(id: number) {
      this.loading = true
      try {
        const response = await fetch(`/api/users/${id}`)
        this.user = await response.json()
      } finally {
        this.loading = false
      }
    },
    
    async fetchPosts() {
      this.loading = true
      try {
        const response = await fetch('/api/posts')
        this.posts = await response.json()
      } finally {
        this.loading = false
      }
    }
  }
})

// plugins/ssr.ts
export default defineNuxtPlugin(async () => {
  // 服务端预取数据
  if (process.server) {
    const store = useMainStore()
    
    // 根据路由预取必要数据
    const route = useRoute()
    
    if (route.name === 'user-id') {
      await store.fetchUser(parseInt(route.params.id as string))
    }
    
    if (route.name === 'posts') {
      await store.fetchPosts()
    }
  }
})
```

### 2.2 Nuxt 3 集成

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  
  pinia: {
    storesDirs: ['./stores/**']
  },
  
  ssr: true,
  
  nitro: {
    storage: {
      redis: {
        driver: 'redis',
        // Redis 配置用于缓存
      }
    }
  }
})

// pages/users/[id].vue
<template>
  <div class="user-page">
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else-if="user">
      <h1>{{ user.name }}</h1>
      <p>{{ user.email }}</p>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const userStore = useUserStore()

// SSR 友好的数据获取
const { data: user, pending, error } = await useLazyAsyncData(
  `user-${route.params.id}`,
  () => userStore.fetchUser(route.params.id),
  {
    // 缓存策略
    default: () => userStore.user,
    server: true
  }
)
</script>
```

## 三、Vuex SSR 实现

### 3.1 服务端 Store 创建

```javascript
// store/index.js
import { createStore } from 'vuex'
import user from './modules/user'
import posts from './modules/posts'

export function createSSRStore() {
  return createStore({
    modules: {
      user,
      posts
    },
    
    // SSR 严格模式配置
    strict: false // 服务端关闭严格模式
  })
}

// server-entry.js
import { createSSRApp } from 'vue'
import { createSSRStore } from './store'
import App from './App.vue'
import { createRouter } from './router'

export default async function createApp(context) {
  const app = createSSRApp(App)
  const store = createSSRStore()
  const router = createRouter()
  
  app.use(store)
  app.use(router)
  
  // 路由导航
  await router.push(context.url)
  await router.isReady()
  
  // 预取数据
  const matchedComponents = router.currentRoute.value.matched.flatMap(record => 
    Object.values(record.components || {}).filter(Boolean)
  )
  
  await Promise.all(
    matchedComponents.map(async component => {
      if (component.asyncData) {
        await component.asyncData({
          store,
          route: router.currentRoute.value
        })
      }
    })
  )
  
  // 返回应用实例和状态
  context.state = store.state
  
  return app
}
```

### 3.2 客户端状态恢复

```javascript
// client-entry.js
import { createApp } from 'vue'
import { createSSRStore } from './store'
import App from './App.vue'
import { createRouter } from './router'

const store = createSSRStore()
const router = createRouter()

// 恢复服务端状态
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

const app = createApp(App)
app.use(store)
app.use(router)

// 等待路由就绪后挂载
router.isReady().then(() => {
  app.mount('#app', true)
})
```

## 四、数据预取策略

### 4.1 组件级预取

```vue
<!-- UserProfile.vue -->
<template>
  <div class="user-profile">
    <h1 v-if="user">{{ user.name }}</h1>
    <div v-else>加载中...</div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'UserProfile',
  
  // 服务端数据预取
  async asyncData({ store, route }) {
    const userId = route.params.id
    await store.dispatch('user/fetchUser', userId)
  },
  
  computed: {
    ...mapState('user', ['user', 'loading'])
  },
  
  methods: {
    ...mapActions('user', ['fetchUser'])
  },
  
  // 客户端激活后的数据获取
  async mounted() {
    // 如果服务端没有数据，客户端获取
    if (!this.user && !this.loading) {
      await this.fetchUser(this.$route.params.id)
    }
  }
}
</script>
```

### 4.2 路由级预取

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/user/:id',
    component: () => import('../pages/UserProfile.vue'),
    meta: {
      // 定义预取需求
      asyncData: async ({ store, route }) => {
        return Promise.all([
          store.dispatch('user/fetchUser', route.params.id),
          store.dispatch('posts/fetchUserPosts', route.params.id)
        ])
      }
    }
  }
]

export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes
  })
  
  return router
}

// 路由预取中间件
export async function prefetchRouteData(router, store) {
  const matched = router.currentRoute.value.matched
  
  await Promise.all(
    matched.map(async record => {
      if (record.meta?.asyncData) {
        return record.meta.asyncData({
          store,
          route: router.currentRoute.value
        })
      }
    })
  )
}
```

## 五、缓存策略

### 5.1 页面级缓存

```javascript
// server/cache.js
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export class SSRCache {
  constructor(options = {}) {
    this.defaultTTL = options.ttl || 300 // 5分钟
    this.keyPrefix = options.prefix || 'ssr:'
  }
  
  // 生成缓存键
  generateKey(url, user = null) {
    const userKey = user ? `user:${user.id}` : 'anonymous'
    return `${this.keyPrefix}${userKey}:${url}`
  }
  
  // 获取缓存
  async get(url, user = null) {
    const key = this.generateKey(url, user)
    const cached = await redis.get(key)
    
    return cached ? JSON.parse(cached) : null
  }
  
  // 设置缓存
  async set(url, data, user = null, ttl = this.defaultTTL) {
    const key = this.generateKey(url, user)
    await redis.setex(key, ttl, JSON.stringify(data))
  }
  
  // 清除相关缓存
  async invalidate(pattern) {
    const keys = await redis.keys(`${this.keyPrefix}${pattern}`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}

// 使用缓存中间件
export const ssrCache = new SSRCache()

export async function cacheMiddleware(req, res, next) {
  const cacheKey = req.url
  const user = req.user
  
  // 尝试从缓存获取
  const cached = await ssrCache.get(cacheKey, user)
  if (cached) {
    return res.send(cached.html)
  }
  
  // 包装响应以捕获输出
  const originalSend = res.send
  res.send = function(html) {
    // 缓存响应
    ssrCache.set(cacheKey, { html }, user)
    originalSend.call(this, html)
  }
  
  next()
}
```

### 5.2 数据缓存

```javascript
// stores/cache.js
export const useCacheStore = defineStore('cache', {
  state: () => ({
    dataCache: new Map(),
    cacheTimestamps: new Map()
  }),
  
  getters: {
    isCacheValid: (state) => (key, maxAge = 300000) => {
      const timestamp = state.cacheTimestamps.get(key)
      return timestamp && (Date.now() - timestamp < maxAge)
    }
  },
  
  actions: {
    getCachedData(key) {
      return this.dataCache.get(key)
    },
    
    setCachedData(key, data) {
      this.dataCache.set(key, data)
      this.cacheTimestamps.set(key, Date.now())
    },
    
    async fetchWithCache(key, fetcher, maxAge = 300000) {
      // 检查缓存
      if (this.isCacheValid(key, maxAge)) {
        return this.getCachedData(key)
      }
      
      // 获取新数据
      const data = await fetcher()
      this.setCachedData(key, data)
      
      return data
    }
  }
})
```

## 六、性能优化

### 6.1 代码分割与懒加载

```javascript
// router优化
const routes = [
  {
    path: '/admin',
    component: () => import(
      /* webpackChunkName: "admin" */ 
      '../pages/Admin.vue'
    ),
    meta: {
      requiresAuth: true,
      preload: false // 不在服务端预加载
    }
  },
  
  {
    path: '/dashboard', 
    component: () => import('../pages/Dashboard.vue'),
    children: [
      {
        path: 'analytics',
        component: () => import('../components/Analytics.vue')
      }
    ]
  }
]

// 动态导入 store 模块
export const useLazyStore = () => {
  const lazyModules = new Map()
  
  const loadModule = async (name) => {
    if (lazyModules.has(name)) {
      return lazyModules.get(name)
    }
    
    const module = await import(`../stores/${name}.js`)
    lazyModules.set(name, module.default)
    
    return module.default
  }
  
  return { loadModule }
}
```

### 6.2 流式渲染

```javascript
// 流式 SSR 实现
import { renderToNodeStream } from '@vue/server-renderer'

export async function streamRender(app, context) {
  const stream = renderToNodeStream(app)
  
  // HTML 头部
  context.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SSR App</title>
      <link rel="stylesheet" href="/css/app.css">
    </head>
    <body>
      <div id="app">
  `)
  
  // 流式输出应用内容
  stream.on('data', chunk => {
    context.write(chunk)
  })
  
  stream.on('end', () => {
    // HTML 尾部和状态注入
    context.write(`
      </div>
      <script>
        window.__INITIAL_STATE__ = ${JSON.stringify(context.state)}
      </script>
      <script src="/js/app.js"></script>
    </body>
    </html>
    `)
    
    context.end()
  })
  
  stream.on('error', error => {
    context.error(error)
  })
}
```

## 七、错误处理

### 7.1 SSR 错误边界

```javascript
// composables/useSSRError.js
export function useSSRError() {
  const handleAsyncError = async (asyncFn) => {
    try {
      return await asyncFn()
    } catch (error) {
      // 服务端错误处理
      if (process.server) {
        console.error('SSR Error:', error)
        
        // 可以选择返回默认数据或抛出错误
        if (error.statusCode === 404) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Page Not Found'
          })
        }
        
        // 其他错误返回默认状态
        return null
      }
      
      // 客户端错误处理
      console.error('Client Error:', error)
      throw error
    }
  }
  
  return { handleAsyncError }
}

// 在组件中使用
export default {
  async asyncData({ store, route, error }) {
    const { handleAsyncError } = useSSRError()
    
    return handleAsyncError(async () => {
      await store.dispatch('fetchData', route.params.id)
    })
  }
}
```

### 7.2 回退策略

```javascript
// 渐进增强策略
export const createProgressiveApp = async () => {
  try {
    // 尝试完整 SSR
    const app = await createSSRApp()
    return { app, mode: 'ssr' }
  } catch (error) {
    console.warn('SSR failed, falling back to CSR:', error)
    
    // 回退到客户端渲染
    const app = await createCSRApp()
    return { app, mode: 'csr' }
  }
}

// 部分 hydration
export const createIslandApp = () => {
  const islands = document.querySelectorAll('[data-island]')
  
  islands.forEach(async (island) => {
    const componentName = island.dataset.island
    const props = JSON.parse(island.dataset.props || '{}')
    
    try {
      const component = await import(`../islands/${componentName}.vue`)
      const app = createApp(component.default, props)
      app.mount(island)
    } catch (error) {
      console.error(`Failed to hydrate island ${componentName}:`, error)
    }
  })
}
```

## 参考资料

- [Vue SSR 指南](https://vuejs.org/guide/scaling-up/ssr.html)
- [Pinia SSR](https://pinia.vuejs.org/ssr/)
- [Nuxt 3 文档](https://nuxt.com/docs)

**下一节** → [第 42 节：TypeScript 集成](./42-typescript-integration.md)
