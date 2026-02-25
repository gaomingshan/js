# SSR 服务端渲染

> 服务端渲染（SSR）提升首屏加载速度和 SEO 效果。

## 核心概念

SSR 在服务器端将 Vue 组件渲染成 HTML 字符串，发送到浏览器。

### SSR vs CSR

| 特性 | SSR | CSR |
|------|-----|-----|
| 首屏速度 | 快 | 慢 |
| SEO | 友好 | 需要额外处理 |
| 服务器负载 | 高 | 低 |
| 交互时间 | 较慢 | 快 |
| 开发复杂度 | 高 | 低 |

---

## 基础配置

### 安装依赖

```bash
npm install -D @vue/server-renderer express
```

### 基础服务器

```typescript
// server.ts
import express from 'express'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import App from './App.vue'

const server = express()

server.get('*', async (req, res) => {
  const app = createSSRApp(App)
  
  const html = await renderToString(app)
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SSR App</title>
      </head>
      <body>
        <div id="app">${html}</div>
      </body>
    </html>
  `)
})

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000')
})
```

---

## Vite SSR

### 项目结构

```
src/
├── entry-client.ts    # 客户端入口
├── entry-server.ts    # 服务端入口
├── App.vue
└── main.ts            # 通用代码

server.ts              # Node.js 服务器
```

### entry-server.ts

```typescript
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createRouter } from './router'
import { createPinia } from 'pinia'
import App from './App.vue'

export async function render(url: string) {
  const app = createSSRApp(App)
  const router = createRouter()
  const pinia = createPinia()
  
  app.use(router)
  app.use(pinia)
  
  await router.push(url)
  await router.isReady()
  
  const html = await renderToString(app)
  const state = pinia.state.value
  
  return { html, state }
}
```

### entry-client.ts

```typescript
import { createApp } from 'vue'
import { createRouter } from './router'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const router = createRouter()
const pinia = createPinia()

// 从服务端注入的状态恢复
if (window.__INITIAL_STATE__) {
  pinia.state.value = window.__INITIAL_STATE__
}

app.use(router)
app.use(pinia)

router.isReady().then(() => {
  app.mount('#app')
})
```

### server.ts

```typescript
import fs from 'fs'
import path from 'path'
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()
  
  // 创建 Vite 服务器
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })
  
  app.use(vite.middlewares)
  
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl
      
      // 读取 index.html
      let template = fs.readFileSync(
        path.resolve('index.html'),
        'utf-8'
      )
      
      // 应用 Vite HTML 转换
      template = await vite.transformIndexHtml(url, template)
      
      // 加载服务端入口
      const { render } = await vite.ssrLoadModule('/src/entry-server.ts')
      
      // 渲染应用
      const { html, state } = await render(url)
      
      // 注入渲染的 HTML 和状态
      const finalHtml = template
        .replace('<!--app-html-->', html)
        .replace(
          '<!--app-state-->',
          `<script>window.__INITIAL_STATE__=${JSON.stringify(state)}</script>`
        )
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml)
    } catch (e) {
      vite.ssrFixStacktrace(e as Error)
      console.error(e)
      res.status(500).end((e as Error).stack)
    }
  })
  
  app.listen(3000, () => {
    console.log('Server running at http://localhost:3000')
  })
}

createServer()
```

---

## 数据预取

### 组件级数据预取

```vue
<!-- views/User.vue -->
<script setup lang="ts">
const route = useRoute()
const user = ref(null)

// 服务端和客户端都会执行
if (import.meta.env.SSR) {
  // 服务端：同步获取
  user.value = await fetchUser(route.params.id)
} else {
  // 客户端：异步获取
  onMounted(async () => {
    if (!user.value) {
      user.value = await fetchUser(route.params.id)
    }
  })
}
</script>

<template>
  <div v-if="user">
    <h1>{{ user.name }}</h1>
    <p>{{ user.email }}</p>
  </div>
</template>
```

### 路由级数据预取

```typescript
// router/index.ts
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'

export function createRouter() {
  return createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory()
      : createWebHistory(),
    routes: [
      {
        path: '/user/:id',
        component: () => import('./views/User.vue'),
        meta: {
          async fetchData(route) {
            return {
              user: await fetchUser(route.params.id)
            }
          }
        }
      }
    ]
  })
}

// entry-server.ts
export async function render(url: string) {
  const app = createSSRApp(App)
  const router = createRouter()
  
  app.use(router)
  
  await router.push(url)
  await router.isReady()
  
  // 预取数据
  const matchedRoute = router.currentRoute.value
  if (matchedRoute.meta.fetchData) {
    const data = await matchedRoute.meta.fetchData(matchedRoute)
    // 将数据注入到组件或 store
  }
  
  const html = await renderToString(app)
  return { html }
}
```

---

## 状态管理

### Pinia SSR

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  
  async function fetchUser(id: string) {
    if (import.meta.env.SSR) {
      // 服务端：直接查询数据库
      user.value = await db.users.findOne({ id })
    } else {
      // 客户端：调用 API
      user.value = await api.getUser(id)
    }
  }
  
  return { user, fetchUser }
})

// entry-server.ts
export async function render(url: string) {
  const app = createSSRApp(App)
  const pinia = createPinia()
  
  app.use(pinia)
  
  // 预取数据
  const userStore = useUserStore(pinia)
  await userStore.fetchUser('123')
  
  const html = await renderToString(app)
  
  // 序列化状态
  const state = JSON.stringify(pinia.state.value)
  
  return { html, state }
}

// entry-client.ts
const pinia = createPinia()

// 恢复状态
if (window.__INITIAL_STATE__) {
  pinia.state.value = JSON.parse(window.__INITIAL_STATE__)
}

app.use(pinia)
```

---

## Head 管理

### @vueuse/head

```bash
npm install @vueuse/head
```

```typescript
// main.ts
import { createHead } from '@vueuse/head'

export function createApp() {
  const app = createSSRApp(App)
  const head = createHead()
  
  app.use(head)
  
  return { app, head }
}

// entry-server.ts
import { renderHeadToString } from '@vueuse/head'

export async function render(url: string) {
  const { app, head } = createApp()
  
  const html = await renderToString(app)
  const { headTags } = renderHeadToString(head)
  
  return { html, headTags }
}
```

```vue
<!-- 组件中使用 -->
<script setup>
import { useHead } from '@vueuse/head'

useHead({
  title: '用户列表',
  meta: [
    { name: 'description', content: '查看所有用户' }
  ]
})
</script>
```

---

## 流式渲染

```typescript
// entry-server.ts
import { renderToNodeStream } from '@vue/server-renderer'

export async function renderStream(url: string) {
  const app = createSSRApp(App)
  const router = createRouter()
  
  app.use(router)
  await router.push(url)
  await router.isReady()
  
  return renderToNodeStream(app)
}

// server.ts
app.use('*', async (req, res) => {
  const stream = await renderStream(req.originalUrl)
  
  res.write(`
    <!DOCTYPE html>
    <html>
      <head><title>SSR App</title></head>
      <body><div id="app">
  `)
  
  stream.pipe(res, { end: false })
  
  stream.on('end', () => {
    res.end('</div></body></html>')
  })
  
  stream.on('error', (err) => {
    console.error(err)
    res.status(500).end('Internal Server Error')
  })
})
```

---

## 性能优化

### 缓存策略

```typescript
import LRU from 'lru-cache'

const cache = new LRU({
  max: 1000,
  ttl: 1000 * 60 * 10 // 10分钟
})

app.use('*', async (req, res) => {
  const url = req.originalUrl
  const cacheKey = `page:${url}`
  
  // 检查缓存
  const cached = cache.get(cacheKey)
  if (cached) {
    return res.send(cached)
  }
  
  // 渲染
  const html = await render(url)
  
  // 存入缓存
  cache.set(cacheKey, html)
  
  res.send(html)
})
```

### 组件级缓存

```typescript
import { createRenderer } from '@vue/server-renderer'

const renderer = createRenderer({
  template: fs.readFileSync('template.html', 'utf-8')
})

// 缓存组件
renderer.renderToString(app, {
  cache: {
    get(key) {
      return componentCache.get(key)
    },
    set(key, value) {
      componentCache.set(key, value)
    }
  }
})
```

---

## 构建配置

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  build: {
    // 客户端构建
    outDir: 'dist/client',
    
    // SSR 构建
    ssr: true,
    ssrManifest: true
  },
  
  ssr: {
    // 不外部化的依赖
    noExternal: ['vue', 'vue-router', 'pinia']
  }
})
```

### package.json

```json
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --ssr src/entry-server.ts --outDir dist/server",
    "build": "npm run build:client && npm run build:server",
    "preview": "NODE_ENV=production node server"
  }
}
```

---

## 生产部署

### 生产服务器

```typescript
// server-prod.ts
import fs from 'fs'
import path from 'path'
import express from 'express'

const app = express()

// 静态资源
app.use('/assets', express.static(path.resolve('dist/client/assets')))

// 加载构建产物
const template = fs.readFileSync(
  path.resolve('dist/client/index.html'),
  'utf-8'
)

const manifest = JSON.parse(
  fs.readFileSync(path.resolve('dist/client/ssr-manifest.json'), 'utf-8')
)

const { render } = await import('./dist/server/entry-server.js')

app.use('*', async (req, res) => {
  try {
    const { html, state } = await render(req.originalUrl, manifest)
    
    const finalHtml = template
      .replace('<!--app-html-->', html)
      .replace('<!--app-state-->', 
        `<script>window.__INITIAL_STATE__=${JSON.stringify(state)}</script>`
      )
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml)
  } catch (e) {
    console.error(e)
    res.status(500).end('Internal Server Error')
  }
})

app.listen(3000)
```

---

## 常见问题

### 1. 浏览器 API

```typescript
// ❌ 错误：服务端没有 window
if (window.innerWidth > 768) {
  // ...
}

// ✅ 正确：检查环境
if (typeof window !== 'undefined' && window.innerWidth > 768) {
  // ...
}

// 或使用环境变量
if (!import.meta.env.SSR) {
  // 仅客户端执行
}
```

### 2. 生命周期钩子

```typescript
// ❌ 不推荐：在 SSR 中 mounted 不会执行
onMounted(() => {
  fetchData()
})

// ✅ 推荐：区分环境
if (import.meta.env.SSR) {
  // 服务端数据获取
  const data = await fetchData()
} else {
  onMounted(() => {
    fetchData()
  })
}
```

### 3. 状态污染

```typescript
// ❌ 错误：共享状态
const cache = {}

export function useCache() {
  return cache
}

// ✅ 正确：每次创建新实例
export function createCache() {
  return {}
}

// 或使用 Symbol
const cacheKey = Symbol('cache')

export function useCache() {
  if (!app.provides[cacheKey]) {
    app.provides[cacheKey] = {}
  }
  return app.provides[cacheKey]
}
```

---

## Nuxt 3

Nuxt 3 是基于 Vue 3 的全栈框架，提供开箱即用的 SSR。

```bash
npx nuxi init my-app
cd my-app
npm install
npm run dev
```

```vue
<!-- pages/index.vue -->
<script setup>
const { data: posts } = await useFetch('/api/posts')
</script>

<template>
  <div>
    <h1>Posts</h1>
    <div v-for="post in posts" :key="post.id">
      <h2>{{ post.title }}</h2>
    </div>
  </div>
</template>
```

---

## 最佳实践

1. **数据预取**：在服务端获取关键数据
2. **缓存策略**：合理使用页面和组件缓存
3. **流式渲染**：大页面使用流式渲染
4. **错误处理**：完善的错误处理机制
5. **性能监控**：监控 SSR 性能指标
6. **环境区分**：正确处理客户端和服务端差异
7. **状态管理**：避免状态污染
8. **SEO 优化**：设置正确的 meta 标签

---

## 参考资料

- [Vue SSR 指南](https://vuejs.org/guide/scaling-up/ssr.html)
- [Vite SSR](https://vitejs.dev/guide/ssr.html)
- [Nuxt 3](https://nuxt.com/)
- [@vueuse/head](https://github.com/vueuse/head)
