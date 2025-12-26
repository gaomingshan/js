# 第 01 节：路由概念与安装

## 概述

Vue Router 是 Vue.js 的官方路由管理器，用于构建单页面应用（SPA）。它通过 URL 的变化来控制页面内容的切换，无需重新加载整个页面。

## 一、路由基本概念

### 1.1 什么是路由

```
传统多页面应用：
URL1 → 页面1.html
URL2 → 页面2.html
URL3 → 页面3.html
（每次跳转都重新加载页面）

单页面应用 + 路由：
URL1 → 组件1
URL2 → 组件2  
URL3 → 组件3
（页面不刷新，只替换组件）
```

### 1.2 路由解决的问题

| 问题 | 传统方案 | 路由方案 |
|------|----------|----------|
| 页面切换 | 重新加载页面 | 组件切换 |
| 浏览器历史 | 自动管理 | 手动管理 |
| 书签支持 | 天然支持 | 需要路由配置 |
| SEO | 友好 | 需要 SSR |

## 二、Vue Router 特性

### 2.1 核心特性

```javascript
// 1. 声明式路由配置
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

// 2. 嵌套路由
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      { path: 'profile', component: UserProfile },
      { path: 'posts', component: UserPosts }
    ]
  }
]

// 3. 动态路由匹配
{ path: '/user/:id', component: User }

// 4. 导航守卫
router.beforeEach((to, from) => {
  // 路由跳转前的钩子
})
```

### 2.2 路由模式

| 模式 | URL 格式 | 原理 |
|------|----------|------|
| Hash | `#/home` | 利用 hash 不会触发页面刷新 |
| History | `/home` | 使用 HTML5 History API |
| Memory | 无 URL | 纯内存管理，用于非浏览器环境 |

## 三、版本对比

### 3.1 Vue Router 3 vs 4

| 特性 | Vue Router 3 (Vue 2) | Vue Router 4 (Vue 3) |
|------|---------------------|---------------------|
| 创建方式 | `new VueRouter()` | `createRouter()` |
| 历史模式 | `mode: 'history'` | `createWebHistory()` |
| 导航守卫 | 回调函数 | Promise/async |
| TypeScript | 需要额外配置 | 原生支持 |
| 包大小 | ~20KB | ~16KB |

### 3.2 API 变化

```javascript
// Vue Router 3
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes
})

// Vue Router 4
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes
})
```

## 四、安装与配置

### 4.1 安装

```bash
# npm
npm install vue-router@4

# yarn
yarn add vue-router@4

# pnpm
pnpm add vue-router@4
```

### 4.2 基本配置

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
```

### 4.3 应用集成

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.mount('#app')
```

### 4.4 基本模板

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </nav>
    
    <!-- 路由出口 -->
    <router-view />
  </div>
</template>
```

## 五、开发工具

### 5.1 Vue Devtools

```javascript
// 路由信息会显示在 Vue Devtools 中
// 可以查看当前路由状态、参数、元信息等
```

### 5.2 TypeScript 支持

```typescript
// 路由类型定义
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
  }
}

// 类型安全的路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Home,
    meta: {
      title: '首页',
      requiresAuth: false
    }
  }
]
```

### 5.3 Vite 配置

```javascript
// vite.config.js
export default {
  server: {
    // 开发服务器配置
    // 处理 History 模式的 fallback
  },
  build: {
    // 路由懒加载的代码分割配置
    rollupOptions: {
      output: {
        manualChunks: {
          router: ['vue-router']
        }
      }
    }
  }
}
```

## 六、常见问题

### 6.1 History 模式服务器配置

```nginx
# Nginx 配置
location / {
  try_files $uri $uri/ /index.html;
}
```

```apache
# Apache 配置
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 6.2 Hash 模式 vs History 模式

```javascript
// Hash 模式 - 兼容性好，但 URL 不美观
const router = createRouter({
  history: createWebHashHistory(),
  routes
})
// URL: http://example.com/#/home

// History 模式 - URL 美观，需要服务器配置
const router = createRouter({
  history: createWebHistory(),
  routes
})
// URL: http://example.com/home
```

## 七、最佳实践

### 7.1 目录结构

```
src/
├── router/
│   ├── index.js          # 路由配置
│   ├── routes.js         # 路由定义
│   └── guards.js         # 导航守卫
├── views/                # 页面组件
│   ├── Home.vue
│   └── About.vue
└── components/           # 公共组件
```

### 7.2 路由组织

```javascript
// 按功能模块组织路由
const routes = [
  // 首页
  { path: '/', component: Home },
  
  // 用户模块
  ...userRoutes,
  
  // 产品模块
  ...productRoutes,
  
  // 404 页面（放在最后）
  { path: '/:pathMatch(.*)*', component: NotFound }
]
```

## 八、总结

| 概念 | 说明 |
|------|------|
| SPA 路由 | 在单页应用中管理页面导航 |
| Vue Router 4 | Vue 3 的官方路由解决方案 |
| 历史模式 | Hash 和 History 两种 URL 模式 |
| 路由配置 | 声明式的路由映射配置 |

## 参考资料

- [Vue Router 官方文档](https://router.vuejs.org/)
- [Vue Router GitHub](https://github.com/vuejs/router)

---

**下一节** → [第 02 节：基础路由配置](./02-basic-routing.md)
