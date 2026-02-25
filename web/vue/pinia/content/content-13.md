# 4.2 服务端渲染（SSR）支持

## 概述

Pinia 提供了完整的 SSR（服务端渲染）支持，本节介绍如何在 SSR 应用中正确使用 Pinia，包括状态注水与脱水的概念和实践。

## SSR 中的 Pinia 初始化

### 基本原理

在 SSR 中，每个请求都需要创建独立的 Pinia 实例，避免不同用户间的状态污染：

```javascript
// ❌ 错误：全局单例（会在用户间共享状态）
import { createPinia } from 'pinia'
const pinia = createPinia()

// ✅ 正确：每个请求创建新实例
export function createApp() {
  const pinia = createPinia()
  const app = createSSRApp(App)
  app.use(pinia)
  return { app, pinia }
}
```

### Vite SSR 示例

```javascript
// server.js
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'

export async function render(url, manifest) {
  // 每个请求创建新的 app 和 pinia 实例
  const app = createSSRApp(App)
  const pinia = createPinia()
  
  app.use(pinia)
  
  // 渲染应用
  const html = await renderToString(app)
  
  // 序列化 pinia 状态
  const state = JSON.stringify(pinia.state.value)
  
  return { html, state }
}
```

### Express 服务器示例

```javascript
// server.js
import express from 'express'
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { renderToString } from 'vue/server-renderer'

const app = express()

app.get('*', async (req, res) => {
  try {
    // 创建 Vue 应用和 Pinia 实例
    const vueApp = createSSRApp(App)
    const pinia = createPinia()
    vueApp.use(pinia)
    
    // 在服务端获取数据
    const userStore = useUserStore(pinia)
    await userStore.fetchInitialData()
    
    // 渲染应用
    const html = await renderToString(vueApp)
    
    // 序列化状态
    const state = pinia.state.value
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SSR App</title>
        </head>
        <body>
          <div id="app">${html}</div>
          <script>
            window.__PINIA_STATE__ = ${JSON.stringify(state)}
          </script>
          <script type="module" src="/client.js"></script>
        </body>
      </html>
    `)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server Error')
  }
})

app.listen(3000)
```

## 状态注水与脱水

### 概念说明

- **注水（Hydration）**：服务端渲染的状态传递到客户端，恢复响应式
- **脱水（Dehydration）**：将服务端的状态序列化为 JSON

### 服务端脱水

```javascript
// server.js
import { createPinia } from 'pinia'
import { renderToString } from 'vue/server-renderer'

export async function render() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  
  // 获取数据（在 Store 中）
  const userStore = useUserStore(pinia)
  await userStore.fetchUser()
  
  const cartStore = useCartStore(pinia)
  await cartStore.loadCart()
  
  // 渲染
  const html = await renderToString(app)
  
  // 脱水：序列化所有 Store 的状态
  const state = pinia.state.value
  // state = {
  //   user: { id: 1, name: 'Alice' },
  //   cart: { items: [...] }
  // }
  
  return {
    html,
    state: JSON.stringify(state)
  }
}
```

### 客户端注水

```javascript
// client.js
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createSSRApp(App)
const pinia = createPinia()

// 注水：恢复服务端的状态
if (window.__PINIA_STATE__) {
  pinia.state.value = window.__PINIA_STATE__
}

app.use(pinia)
app.mount('#app')
```

### 完整的 HTML 模板

```javascript
// server.js
function renderHTML(html, state) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My SSR App</title>
        <meta charset="utf-8">
      </head>
      <body>
        <div id="app">${html}</div>
        
        <!-- 将状态注入到全局变量 -->
        <script>
          window.__PINIA_STATE__ = ${state}
        </script>
        
        <!-- 加载客户端应用 -->
        <script type="module" src="/client.js"></script>
      </body>
    </html>
  `
}
```

## SSR 场景下的注意事项

### 1. 避免状态污染

每个请求必须使用独立的 Pinia 实例：

```javascript
// ❌ 错误：全局共享 Store
const userStore = useUserStore()

app.get('/', async (req, res) => {
  // 所有用户共享同一个 userStore，造成数据泄露！
  await userStore.fetchUser(req.userId)
})

// ✅ 正确：每个请求独立的 Store
app.get('/', async (req, res) => {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  
  // 使用当前请求的 pinia 实例
  const userStore = useUserStore(pinia)
  await userStore.fetchUser(req.userId)
})
```

### 2. 异步数据获取

在服务端预取数据：

```javascript
// stores/user.js
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    loading: false
  }),
  
  actions: {
    async fetchUser(id) {
      this.loading = true
      
      try {
        // 在服务端和客户端都可以调用
        const response = await fetch(`/api/users/${id}`)
        this.user = await response.json()
      } finally {
        this.loading = false
      }
    }
  }
})

// server.js
app.get('/user/:id', async (req, res) => {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  
  // 服务端预取数据
  const userStore = useUserStore(pinia)
  await userStore.fetchUser(req.params.id)
  
  const html = await renderToString(app)
  const state = JSON.stringify(pinia.state.value)
  
  res.send(renderHTML(html, state))
})
```

### 3. 路由匹配组件的数据预取

```javascript
// router/index.js
export function createRouter() {
  return VueRouter.createRouter({
    // ...
    routes: [
      {
        path: '/user/:id',
        component: UserProfile,
        meta: {
          // 定义数据预取函数
          async asyncData({ params, pinia }) {
            const userStore = useUserStore(pinia)
            await userStore.fetchUser(params.id)
          }
        }
      }
    ]
  })
}

// server.js
app.get('*', async (req, res) => {
  const app = createSSRApp(App)
  const pinia = createPinia()
  const router = createRouter()
  
  app.use(pinia)
  app.use(router)
  
  // 导航到请求的路由
  await router.push(req.url)
  await router.isReady()
  
  // 获取匹配的路由组件
  const matchedComponents = router.currentRoute.value.matched
  
  // 执行数据预取
  await Promise.all(
    matchedComponents.map(route => {
      if (route.meta.asyncData) {
        return route.meta.asyncData({
          params: router.currentRoute.value.params,
          pinia
        })
      }
    })
  )
  
  const html = await renderToString(app)
  const state = JSON.stringify(pinia.state.value)
  
  res.send(renderHTML(html, state))
})
```

### 4. Cookies 和 Headers

在 SSR 中访问请求头和 Cookie：

```javascript
// server.js
app.get('*', async (req, res) => {
  const app = createSSRApp(App)
  const pinia = createPinia()
  
  // 通过插件传递请求信息
  pinia.use(({ store }) => {
    store.$cookies = req.cookies
    store.$headers = req.headers
  })
  
  app.use(pinia)
  
  // Store 中可以访问
  const authStore = useAuthStore(pinia)
  const token = authStore.$cookies.token
  
  // ...
})
```

## Nuxt 3 集成示例

### 安装配置

```bash
npm install pinia @pinia/nuxt
```

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt']
})
```

### 定义 Store

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null
  }),
  
  actions: {
    async fetchUser(id: number) {
      // Nuxt 会自动处理 SSR 和客户端
      const { data } = await useFetch(`/api/users/${id}`)
      this.user = data.value
    }
  }
})
```

### 在页面中使用

```vue
<!-- pages/user/[id].vue -->
<script setup>
const route = useRoute()
const userStore = useUserStore()

// Nuxt 会在服务端和客户端都执行
await userStore.fetchUser(route.params.id)
</script>

<template>
  <div>
    <h1>{{ userStore.user?.name }}</h1>
  </div>
</template>
```

### 服务端插件

```typescript
// server/plugins/pinia.ts
export default defineNuxtPlugin(({ $pinia }) => {
  // 为所有 Store 添加服务端专用逻辑
  $pinia.use(({ store }) => {
    if (process.server) {
      store.$nuxt = useNuxtApp()
    }
  })
})
```

## 关键点总结

1. **独立实例**：每个请求创建独立的 Pinia 实例
2. **状态序列化**：服务端序列化状态，客户端恢复
3. **数据预取**：在服务端预先获取数据
4. **避免污染**：不要使用全局 Store 实例
5. **Nuxt 集成**：使用 `@pinia/nuxt` 模块自动处理

## 深入一点

### 状态选择性注水

只注水部分状态，减少传输数据量：

```javascript
// server.js
const state = pinia.state.value

// 只序列化需要的 Store
const clientState = {
  user: state.user,
  settings: state.settings
  // 不包含敏感或临时数据
}

const html = renderHTML(htmlContent, JSON.stringify(clientState))
```

### 错误处理

```javascript
// server.js
app.get('*', async (req, res) => {
  try {
    const app = createSSRApp(App)
    const pinia = createPinia()
    app.use(pinia)
    
    // 数据预取可能失败
    try {
      const userStore = useUserStore(pinia)
      await userStore.fetchUser(req.params.id)
    } catch (error) {
      console.error('数据预取失败:', error)
      // 可以设置默认状态或错误状态
      userStore.$patch({
        user: null,
        error: error.message
      })
    }
    
    const html = await renderToString(app)
    const state = JSON.stringify(pinia.state.value)
    
    res.send(renderHTML(html, state))
  } catch (error) {
    console.error('SSR 错误:', error)
    res.status(500).send('Internal Server Error')
  }
})
```

### 性能优化

```javascript
// 使用流式渲染
import { renderToNodeStream } from 'vue/server-renderer'

app.get('*', async (req, res) => {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  
  // 预取数据
  await fetchData(pinia)
  
  const state = JSON.stringify(pinia.state.value)
  
  // 发送 HTML 头部
  res.write(`
    <!DOCTYPE html>
    <html>
      <head><title>App</title></head>
      <body>
        <div id="app">
  `)
  
  // 流式渲染应用
  const stream = renderToNodeStream(app)
  stream.pipe(res, { end: false })
  
  stream.on('end', () => {
    res.end(`
        </div>
        <script>window.__PINIA_STATE__ = ${state}</script>
        <script src="/client.js"></script>
      </body>
    </html>
    `)
  })
})
```

## 参考资料

- [Pinia SSR 文档](https://pinia.vuejs.org/ssr/)
- [Vue SSR 指南](https://vuejs.org/guide/scaling-up/ssr.html)
- [Nuxt 3 Pinia 模块](https://pinia.vuejs.org/ssr/nuxt.html)
- [Vite SSR](https://vitejs.dev/guide/ssr.html)
