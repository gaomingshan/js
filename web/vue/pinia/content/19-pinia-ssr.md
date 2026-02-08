# 第 19 节：SSR 支持

## 概述

服务端渲染（SSR）是现代 Web 应用的重要特性，Pinia 提供了完整的 SSR 支持，包括状态序列化、客户端水合、同构应用等功能。本节将详细介绍如何在 SSR 环境中使用 Pinia。

## 一、SSR 基础概念

### 1.1 SSR 流程

```javascript
// SSR 流程图
const ssrFlow = {
  server: {
    1: '服务端创建 Vue 应用实例',
    2: '创建 Pinia 实例',
    3: '执行路由匹配和组件渲染',
    4: '执行 Store Actions 获取数据',
    5: '序列化 Store 状态',
    6: '渲染 HTML 并注入状态',
    7: '发送完整 HTML 给客户端'
  },
  
  client: {
    1: '接收服务端渲染的 HTML',
    2: '创建客户端 Vue 应用',
    3: '创建 Pinia 实例',
    4: '反序列化服务端状态',
    5: '执行客户端水合',
    6: '应用变为交互式'
  }
}
```

### 1.2 Pinia SSR 特性

```javascript
// Pinia SSR 核心特性
const piniaSSRFeatures = {
  stateHydration: '自动状态水合',
  serialization: '状态序列化和反序列化',
  isomorphic: '同构应用支持',
  async: '异步数据获取',
  caching: '服务端缓存',
  streaming: '流式渲染支持'
}
```

## 二、Nuxt 3 集成

### 2.1 安装和配置

```bash
# 安装 Pinia 模块
npm install @pinia/nuxt

# 或在已有项目中
npm install pinia @pinia/nuxt
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt'
  ],
  
  pinia: {
    autoImports: [
      'defineStore',
      'storeToRefs'
    ]
  },
  
  ssr: true, // 启用 SSR
  
  // 可选：禁用某些页面的 SSR
  nitro: {
    routeRules: {
      '/spa': { ssr: false }, // SPA 模式
      '/admin/**': { ssr: false }, // 管理页面禁用 SSR
      '/api/**': { cors: true }
    }
  }
})
```

### 2.2 Store 定义

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  
  // SSR 友好的数据获取
  const fetchUser = async (id: number) => {
    // 避免重复请求
    if (user.value?.id === id) return user.value
    
    loading.value = true
    
    try {
      const { data } = await $fetch<{ user: User }>(`/api/users/${id}`)
      user.value = data.user
      return data.user
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    } finally {
      loading.value = false
    }
  }
  
  return {
    user: readonly(user),
    loading: readonly(loading),
    fetchUser
  }
})
```

### 2.3 页面中使用

```vue
<!-- pages/user/[id].vue -->
<template>
  <div>
    <div v-if="pending" class="loading">
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error.message }}
    </div>
    
    <div v-else-if="user" class="user-profile">
      <h1>{{ user.name }}</h1>
      <p>{{ user.email }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 路由参数
const route = useRoute()
const userId = parseInt(route.params.id as string)

// Store
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

// SSR 数据获取
const { pending, error } = await useLazyAsyncData(
  `user-${userId}`,
  () => userStore.fetchUser(userId),
  {
    // 服务端和客户端都执行
    server: true,
    client: true,
    
    // 缓存设置
    default: () => null,
    
    // 错误处理
    onError: (error) => {
      console.error('Failed to fetch user:', error)
    }
  }
)

// SEO 元数据
useSeoMeta({
  title: () => user.value ? `${user.value.name} - 用户资料` : '用户资料',
  description: () => user.value?.bio || '查看用户详细信息'
})
</script>
```

## 三、自定义 SSR 实现

### 3.1 服务端设置

```javascript
// server.js
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { renderToString } from '@vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import { routes } from './router'

export async function createApp(url, initialState = {}) {
  // 创建应用实例
  const app = createSSRApp(App)
  
  // 创建 Pinia 实例
  const pinia = createPinia()
  app.use(pinia)
  
  // 如果有初始状态，则恢复
  if (Object.keys(initialState).length > 0) {
    pinia.state.value = initialState
  }
  
  // 创建路由器
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })
  app.use(router)
  
  // 路由准备
  await router.push(url)
  await router.isReady()
  
  return { app, router, pinia }
}

// Express 服务器
app.get('*', async (req, res) => {
  try {
    const { app, router, pinia } = await createApp(req.originalUrl)
    
    // 执行匹配路由的异步数据获取
    const matchedComponents = router.currentRoute.value.matched
      .flatMap(route => Object.values(route.components || {}))
    
    await Promise.all(
      matchedComponents.map(component => {
        if (component.asyncData) {
          return component.asyncData({ pinia, route: router.currentRoute.value })
        }
      })
    )
    
    // 渲染应用
    const html = await renderToString(app)
    
    // 序列化状态
    const state = JSON.stringify(pinia.state.value)
    
    // 发送 HTML
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vue SSR App</title>
        </head>
        <body>
          <div id="app">${html}</div>
          <script>window.__INITIAL_STATE__ = ${state}</script>
          <script src="/client-bundle.js"></script>
        </body>
      </html>
    `)
  } catch (error) {
    console.error('SSR Error:', error)
    res.status(500).send('Internal Server Error')
  }
})
```

### 3.2 客户端水合

```javascript
// client.js
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { routes } from './router'

async function createClientApp() {
  const app = createSSRApp(App)
  
  // 创建 Pinia 实例
  const pinia = createPinia()
  
  // 从服务端状态恢复
  if (window.__INITIAL_STATE__) {
    pinia.state.value = window.__INITIAL_STATE__
  }
  
  app.use(pinia)
  
  // 创建客户端路由器
  const router = createRouter({
    history: createWebHistory(),
    routes
  })
  app.use(router)
  
  await router.isReady()
  
  return { app, router }
}

createClientApp().then(({ app }) => {
  // 水合应用
  app.mount('#app', true) // true 表示水合模式
})
```

## 四、异步数据处理

### 4.1 服务端数据预取

```javascript
// composables/useAsyncData.js
export function useAsyncData(key, handler, options = {}) {
  const nuxtApp = useNuxtApp()
  const data = ref(null)
  const pending = ref(false)
  const error = ref(null)
  
  // 服务端执行
  if (process.server) {
    return executeOnServer()
  }
  
  // 客户端执行
  return executeOnClient()
  
  async function executeOnServer() {
    pending.value = true
    
    try {
      const result = await handler()
      data.value = result
      
      // 将数据存储到 Nuxt payload 中
      nuxtApp.payload.data[key] = result
      
      return { data, pending, error }
    } catch (err) {
      error.value = err
      throw err
    } finally {
      pending.value = false
    }
  }
  
  async function executeOnClient() {
    // 尝试从 payload 中获取服务端数据
    if (nuxtApp.payload.data[key] !== undefined) {
      data.value = nuxtApp.payload.data[key]
      return { data, pending, error }
    }
    
    // 客户端重新获取
    if (options.client !== false) {
      pending.value = true
      
      try {
        const result = await handler()
        data.value = result
      } catch (err) {
        error.value = err
      } finally {
        pending.value = false
      }
    }
    
    return { data, pending, error }
  }
}
```

### 4.2 数据预取 Store

```typescript
// stores/posts.ts
export const usePostsStore = defineStore('posts', () => {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // SSR 友好的获取方法
  const fetchPosts = async (options: {
    page?: number
    limit?: number
    category?: string
  } = {}) => {
    // 避免重复请求
    const cacheKey = `posts-${JSON.stringify(options)}`
    if (process.client && nuxtApp.payload.data[cacheKey]) {
      return nuxtApp.payload.data[cacheKey]
    }
    
    loading.value = true
    error.value = null
    
    try {
      const query = new URLSearchParams({
        page: (options.page || 1).toString(),
        limit: (options.limit || 10).toString(),
        ...(options.category && { category: options.category })
      })
      
      const response = await $fetch<{ posts: Post[] }>(`/api/posts?${query}`)
      
      // 更新或追加数据
      if (options.page === 1) {
        posts.value = response.posts
      } else {
        posts.value.push(...response.posts)
      }
      
      // 缓存结果
      if (process.server) {
        nuxtApp.payload.data[cacheKey] = response.posts
      }
      
      return response.posts
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取文章失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    posts: readonly(posts),
    loading: readonly(loading),
    error: readonly(error),
    fetchPosts
  }
})
```

## 五、状态同步和缓存

### 5.1 服务端缓存策略

```javascript
// plugins/pinia-cache.client.js
export default defineNuxtPlugin(({ $pinia }) => {
  // 客户端缓存插件
  $pinia.use(({ store }) => {
    // 从 sessionStorage 恢复状态
    if (process.client && store.$options.persist) {
      const saved = sessionStorage.getItem(`pinia-${store.$id}`)
      if (saved) {
        try {
          const state = JSON.parse(saved)
          store.$patch(state)
        } catch (error) {
          console.warn('Failed to restore state:', error)
        }
      }
      
      // 监听状态变化并保存
      store.$subscribe((mutation, state) => {
        sessionStorage.setItem(`pinia-${store.$id}`, JSON.stringify(state))
      })
    }
    
    // 添加缓存方法
    store.$cache = {
      clear() {
        if (process.client) {
          sessionStorage.removeItem(`pinia-${store.$id}`)
        }
      },
      
      invalidate() {
        store.$reset()
        this.clear()
      }
    }
  })
})
```

### 5.2 状态同步

```typescript
// composables/useStateSync.ts
export function useStateSync() {
  const nuxtApp = useNuxtApp()
  
  // 服务端到客户端状态同步
  const syncServerState = (storeId: string, serverState: any) => {
    if (process.client) {
      const store = nuxtApp.$pinia.state.value[storeId]
      if (store && serverState) {
        Object.assign(store, serverState)
      }
    }
  }
  
  // 客户端状态持久化
  const persistClientState = (storeId: string) => {
    if (process.client) {
      const store = useNuxtApp().$pinia.state.value[storeId]
      if (store) {
        localStorage.setItem(`client-${storeId}`, JSON.stringify(store))
      }
    }
  }
  
  // 恢复客户端状态
  const restoreClientState = (storeId: string) => {
    if (process.client) {
      const saved = localStorage.getItem(`client-${storeId}`)
      if (saved) {
        try {
          const state = JSON.parse(saved)
          syncServerState(storeId, state)
        } catch (error) {
          console.warn('Failed to restore client state:', error)
        }
      }
    }
  }
  
  return {
    syncServerState,
    persistClientState,
    restoreClientState
  }
}
```

## 六、错误处理

### 6.1 SSR 错误处理

```javascript
// plugins/error-handler.js
export default defineNuxtPlugin(() => {
  // 全局错误处理
  const handleError = (error, context) => {
    console.error('Application error:', error)
    
    // 服务端错误
    if (process.server) {
      // 记录服务端错误
      console.error('Server error:', {
        message: error.message,
        stack: error.stack,
        url: context?.ssrContext?.url,
        userAgent: context?.ssrContext?.req?.headers['user-agent']
      })
    }
    
    // 客户端错误
    if (process.client) {
      // 发送错误到监控服务
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: false
        })
      }
    }
  }
  
  // Vue 错误处理
  nuxtApp.vueApp.config.errorHandler = handleError
  
  // 异步错误处理
  if (process.client) {
    window.addEventListener('unhandledrejection', (event) => {
      handleError(event.reason, { type: 'unhandledrejection' })
    })
  }
})
```

### 6.2 Store 错误处理

```typescript
// stores/error.ts
export const useErrorStore = defineStore('error', () => {
  const errors = ref<Array<{
    id: string
    message: string
    stack?: string
    timestamp: Date
    context?: string
  }>>([])
  
  const addError = (error: Error, context?: string) => {
    const errorItem = {
      id: nanoid(),
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      context
    }
    
    errors.value.push(errorItem)
    
    // 服务端错误记录
    if (process.server) {
      console.error('Store error:', errorItem)
    }
    
    // 客户端错误上报
    if (process.client) {
      reportError(errorItem)
    }
  }
  
  const clearErrors = () => {
    errors.value = []
  }
  
  const removeError = (id: string) => {
    const index = errors.value.findIndex(error => error.id === id)
    if (index > -1) {
      errors.value.splice(index, 1)
    }
  }
  
  return {
    errors: readonly(errors),
    addError,
    clearErrors,
    removeError
  }
})

function reportError(error: any) {
  // 上报到错误监控服务
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...error,
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  }).catch(console.error)
}
```

## 七、性能优化

### 7.1 预加载和懒加载

```typescript
// stores/preload.ts
export const usePreloadStore = defineStore('preload', () => {
  const preloadedData = ref(new Map())
  
  // 预加载数据
  const preloadData = async (key: string, loader: () => Promise<any>) => {
    if (preloadedData.value.has(key)) {
      return preloadedData.value.get(key)
    }
    
    try {
      const data = await loader()
      preloadedData.value.set(key, data)
      return data
    } catch (error) {
      console.error(`Failed to preload ${key}:`, error)
      throw error
    }
  }
  
  // 获取预加载的数据
  const getPreloadedData = (key: string) => {
    return preloadedData.value.get(key)
  }
  
  // 清理预加载数据
  const clearPreload = (key?: string) => {
    if (key) {
      preloadedData.value.delete(key)
    } else {
      preloadedData.value.clear()
    }
  }
  
  return {
    preloadData,
    getPreloadedData,
    clearPreload
  }
})
```

### 7.2 流式渲染

```javascript
// server/streaming.js
import { renderToNodeStream } from '@vue/server-renderer'

export async function renderWithStreaming(app, res) {
  const stream = renderToNodeStream(app)
  
  res.write(`
    <!DOCTYPE html>
    <html>
      <head><title>Vue SSR App</title></head>
      <body>
        <div id="app">
  `)
  
  stream.on('data', (chunk) => {
    res.write(chunk)
  })
  
  stream.on('end', () => {
    res.write(`
        </div>
        <script>
          // 注入初始状态
          window.__INITIAL_STATE__ = ${JSON.stringify(app.config.globalProperties.$pinia.state.value)}
        </script>
        <script src="/client.js"></script>
      </body>
    </html>
    `)
    res.end()
  })
  
  stream.on('error', (error) => {
    console.error('Streaming error:', error)
    res.status(500).end('Internal Server Error')
  })
}
```

## 参考资料

- [Pinia SSR Guide](https://pinia.vuejs.org/cookbook/ssr.html)
- [Nuxt Pinia Module](https://pinia.vuejs.org/ssr/nuxt.html)
- [Vue SSR Guide](https://vuejs.org/guide/scaling-up/ssr.html)
- [Universal Application Architecture](https://nuxt.com/docs/guide/concepts/server-engine)

**下一节** → [第 20 节：开发工具](./20-pinia-devtools.md)
