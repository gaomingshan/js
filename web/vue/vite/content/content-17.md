# SSR 支持

## 概述

Vite 提供了完善的服务端渲染（SSR）支持，可以构建高性能的 SSR 应用。本章介绍 Vite SSR 原理、配置方法、预构建处理、以及性能优化技巧。

## Vite SSR 原理

### SSR 工作流程

```
1. 用户请求页面
     ↓
2. 服务器执行 Vue/React 组件
     ↓
3. 生成 HTML 字符串
     ↓
4. 返回 HTML 给浏览器
     ↓
5. 浏览器加载客户端 JS
     ↓
6. 客户端激活（Hydration）
```

### Vite SSR 特点

**开发环境**：
- 无需打包，直接运行 SSR 代码
- 即时的模块热替换
- 快速的服务器重启

**生产环境**：
- 优化的服务端 bundle
- 优化的客户端 bundle
- 自动代码分割

## 服务端入口配置

### 项目结构

```
project/
├── index.html              # 客户端模板
├── src/
│   ├── entry-client.js     # 客户端入口
│   ├── entry-server.js     # 服务端入口
│   ├── App.vue
│   └── main.js             # 通用代码
├── server.js               # SSR 服务器
└── vite.config.js
```

### 服务端入口

```javascript
// src/entry-server.js
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'

export async function render(url, manifest) {
  const app = createSSRApp(App)
  
  // 路由处理
  // await router.push(url)
  // await router.isReady()
  
  // 渲染应用
  const html = await renderToString(app)
  
  return { html }
}
```

### 客户端入口

```javascript
// src/entry-client.js
import { createSSRApp } from 'vue'
import App from './App.vue'

const app = createSSRApp(App)

// 客户端激活
app.mount('#app')
```

### SSR 服务器

```javascript
// server.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

async function createServer() {
  const app = express()
  
  let vite
  if (!isProduction) {
    // 开发环境：使用 Vite 开发服务器
    const { createServer } = await import('vite')
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })
    app.use(vite.middlewares)
  } else {
    // 生产环境：使用构建产物
    app.use((await import('compression')).default())
    app.use(
      (await import('serve-static')).default(
        path.resolve(__dirname, 'dist/client'),
        { index: false }
      )
    )
  }
  
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl
      
      let template
      let render
      
      if (!isProduction) {
        // 开发环境
        template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8'
        )
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.js')).render
      } else {
        // 生产环境
        template = fs.readFileSync(
          path.resolve(__dirname, 'dist/client/index.html'),
          'utf-8'
        )
        render = (await import('./dist/server/entry-server.js')).render
      }
      
      // 渲染应用
      const { html: appHtml } = await render(url)
      
      // 注入 HTML
      const html = template.replace(`<!--app-html-->`, appHtml)
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      !isProduction && vite.ssrFixStacktrace(e)
      console.error(e.stack)
      res.status(500).end(e.stack)
    }
  })
  
  return { app }
}

createServer().then(({ app }) => {
  app.listen(3000, () => {
    console.log('Server running at http://localhost:3000')
  })
})
```

### HTML 模板

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>SSR App</title>
  </head>
  <body>
    <div id="app"><!--app-html--></div>
    <script type="module" src="/src/entry-client.js"></script>
  </body>
</html>
```

## SSR 预构建处理

### Vite 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  // SSR 选项
  ssr: {
    // 不外部化的依赖
    noExternal: ['element-plus'],
    
    // 外部化的依赖
    external: ['some-node-only-module']
  },
  
  build: {
    // 生成 sourcemap
    sourcemap: true
  }
})
```

### 构建脚本

```json
{
  "scripts": {
    "dev": "node server",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --ssr src/entry-server.js --outDir dist/server"
  }
}
```

### 构建产物

```
dist/
├── client/              # 客户端产物
│   ├── index.html
│   └── assets/
│       └── *.js
└── server/              # 服务端产物
    └── entry-server.js
```

## 外部化依赖管理

### 自动外部化

```javascript
// vite.config.js
export default {
  ssr: {
    // 默认外部化所有非 Vite 插件处理的依赖
    // 仅预构建 ESM 依赖
  }
}
```

### 不外部化特定依赖

```javascript
export default {
  ssr: {
    // 需要 SSR 转换的依赖
    noExternal: [
      'element-plus',  // UI 库
      '@vueuse/core',  // 组合式函数
      /\.css$/         // CSS 文件
    ]
  }
}
```

### 外部化 Node 模块

```javascript
export default {
  ssr: {
    // 外部化这些依赖（不打包）
    external: [
      'express',
      'compression'
    ]
  }
}
```

## 客户端激活（Hydration）

### 基础激活

```javascript
// src/entry-client.js
import { createSSRApp } from 'vue'
import App from './App.vue'
import { createRouter } from './router'

const app = createSSRApp(App)
const router = createRouter()

app.use(router)

router.isReady().then(() => {
  app.mount('#app', true)  // hydrate: true
})
```

### 状态同步

```javascript
// src/entry-server.js
export async function render(url) {
  const app = createSSRApp(App)
  const store = createStore()
  
  app.use(store)
  
  // 预取数据
  await store.dispatch('fetchData')
  
  const html = await renderToString(app)
  
  // 序列化状态
  const state = store.state
  
  return {
    html,
    state
  }
}

// server.js
const { html, state } = await render(url)

const finalHtml = template
  .replace(`<!--app-html-->`, html)
  .replace(
    `<!--app-state-->`,
    `<script>window.__INITIAL_STATE__=${JSON.stringify(state)}</script>`
  )
```

```javascript
// src/entry-client.js
import { createSSRApp } from 'vue'
import { createStore } from './store'

const app = createSSRApp(App)
const store = createStore()

// 恢复状态
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

app.use(store)
app.mount('#app')
```

### 异步组件处理

```javascript
// src/entry-server.js
import { renderToString } from 'vue/server-renderer'

export async function render(url) {
  const app = createSSRApp(App)
  const router = createRouter()
  
  app.use(router)
  
  await router.push(url)
  await router.isReady()
  
  // 等待异步组件
  const matchedComponents = router.currentRoute.value.matched
  await Promise.all(
    matchedComponents.map(component => {
      if (component.asyncData) {
        return component.asyncData({ route: router.currentRoute.value })
      }
    })
  )
  
  const html = await renderToString(app)
  return { html }
}
```

## SSR 性能优化

### 1. 流式渲染

```javascript
import { renderToNodeStream } from 'vue/server-renderer'

app.use('*', async (req, res) => {
  const stream = renderToNodeStream(app)
  
  res.write(templateStart)
  
  stream.on('data', chunk => {
    res.write(chunk)
  })
  
  stream.on('end', () => {
    res.write(templateEnd)
    res.end()
  })
})
```

### 2. 组件级缓存

```javascript
import LRU from 'lru-cache'

const cache = new LRU({
  max: 1000,
  ttl: 1000 * 60 * 15  // 15 分钟
})

export async function render(url) {
  const cacheKey = url
  const cached = cache.get(cacheKey)
  
  if (cached) {
    return cached
  }
  
  const result = await renderApp(url)
  cache.set(cacheKey, result)
  
  return result
}
```

### 3. 资源提示

```javascript
// 生成 preload 链接
function renderPreloadLinks(modules, manifest) {
  let links = ''
  const seen = new Set()
  
  modules.forEach(id => {
    const files = manifest[id]
    if (files) {
      files.forEach(file => {
        if (!seen.has(file)) {
          seen.add(file)
          links += `<link rel="modulepreload" href="${file}">`
        }
      })
    }
  })
  
  return links
}
```

### 4. 代码分割

```javascript
// 路由懒加载
const routes = [
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
]
```

## SSG（静态生成）方案

### 预渲染配置

```javascript
// prerender.js
import fs from 'fs'
import path from 'path'
import { render } from './dist/server/entry-server.js'

const routes = ['/', '/about', '/contact']

async function prerender() {
  for (const route of routes) {
    const { html } = await render(route)
    
    const filePath = path.resolve(
      __dirname,
      'dist/client',
      route.slice(1) || 'index',
      'index.html'
    )
    
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, html)
    
    console.log('预渲染:', route)
  }
}

prerender()
```

### 构建脚本

```json
{
  "scripts": {
    "build:ssg": "npm run build && node prerender.js"
  }
}
```

## 实战示例

### Vue SSR 完整示例

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  ssr: {
    noExternal: ['element-plus', '@vueuse/core']
  }
})
```

```javascript
// src/app.js
import { createSSRApp } from 'vue'
import { createRouter } from './router'
import { createStore } from './store'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  const router = createRouter()
  const store = createStore()
  
  app.use(router)
  app.use(store)
  
  return { app, router, store }
}
```

```javascript
// src/entry-server.js
import { renderToString } from 'vue/server-renderer'
import { createApp } from './app'

export async function render(url) {
  const { app, router, store } = createApp()
  
  await router.push(url)
  await router.isReady()
  
  const html = await renderToString(app)
  const state = store.state
  
  return { html, state }
}
```

```javascript
// src/entry-client.js
import { createApp } from './app'

const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

router.isReady().then(() => {
  app.mount('#app')
})
```

## 常见问题

### 1. window is not defined

服务端没有 window 对象：
```javascript
// 条件判断
if (typeof window !== 'undefined') {
  // 仅客户端执行
}

// 或使用 import.meta.env.SSR
if (!import.meta.env.SSR) {
  // 仅客户端执行
}
```

### 2. 第三方库不支持 SSR

```javascript
// 动态导入
const MyComponent = defineAsyncComponent({
  loader: () => import('./MyComponent.vue'),
  ssr: false  // 禁用 SSR
})
```

### 3. 样式闪烁

确保服务端渲染包含样式：
```javascript
// vite.config.js
export default {
  ssr: {
    noExternal: [/\.css$/]
  }
}
```

## 参考资料

- [Vite SSR](https://cn.vitejs.dev/guide/ssr.html)
- [Vue SSR Guide](https://vuejs.org/guide/scaling-up/ssr.html)
- [React SSR](https://react.dev/reference/react-dom/server)
