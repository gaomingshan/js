# 第 3 章：Vue Router 快速上手

## 概述

本章将通过实际代码，快速搭建一个基于 Vue Router 的单页应用，并了解 Vue Router 3.x 和 4.x 的主要差异。

## Vue Router 安装与引入

### 安装

```bash
# Vue 3 + Vue Router 4
npm install vue-router@4

# Vue 2 + Vue Router 3
npm install vue-router@3
```

### 引入与配置（Vue Router 4）

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

// 1. 定义路由配置
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

// 2. 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 3. 导出路由实例
export default router
```

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 4. 使用路由
app.use(router)

app.mount('#app')
```

### 引入与配置（Vue Router 3）

```javascript
// router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

// 1. 安装插件
Vue.use(VueRouter)

// 2. 定义路由配置
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

// 3. 创建路由实例
const router = new VueRouter({
  mode: 'history',
  routes
})

// 4. 导出路由实例
export default router
```

```javascript
// main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router'

new Vue({
  router, // 5. 注入路由
  render: h => h(App)
}).$mount('#app')
```

## 基础路由配置

### 路由配置对象

```javascript
const routes = [
  {
    path: '/',           // 路径
    name: 'Home',        // 路由名称（可选）
    component: Home,     // 组件
    meta: {              // 元信息（可选）
      title: '首页',
      requiresAuth: false
    }
  },
  {
    path: '/user/:id',   // 动态路径参数
    name: 'User',
    component: User,
    props: true          // 将路由参数作为 props 传递
  },
  {
    path: '/about',
    component: About,
    children: [          // 嵌套路由
      {
        path: 'team',
        component: Team
      }
    ]
  }
]
```

### 组件示例

```vue
<!-- views/Home.vue -->
<template>
  <div class="home">
    <h1>欢迎来到首页</h1>
    <p>这是一个 Vue Router 示例应用</p>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>
```

```vue
<!-- views/About.vue -->
<template>
  <div class="about">
    <h1>关于我们</h1>
    <p>这是关于页面</p>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>
```

## RouterView 与 RouterLink

### RouterView - 路由出口

`<router-view>` 是路由匹配到的组件的渲染出口。

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
    </nav>
    
    <!-- 路由匹配的组件将渲染在这里 -->
    <router-view />
  </div>
</template>
```

**多个 RouterView：**

```vue
<template>
  <div id="app">
    <!-- 默认视图 -->
    <router-view />
    
    <!-- 命名视图 -->
    <router-view name="sidebar" />
    <router-view name="footer" />
  </div>
</template>
```

### RouterLink - 导航链接

`<router-link>` 是声明式导航组件，渲染为 `<a>` 标签。

```vue
<template>
  <nav>
    <!-- 字符串路径 -->
    <router-link to="/">首页</router-link>
    
    <!-- 对象形式（路径） -->
    <router-link :to="{ path: '/about' }">关于</router-link>
    
    <!-- 对象形式（命名路由） -->
    <router-link :to="{ name: 'User', params: { id: 123 } }">
      用户详情
    </router-link>
    
    <!-- 带查询参数 -->
    <router-link :to="{ path: '/search', query: { q: 'vue' } }">
      搜索
    </router-link>
    
    <!-- 自定义激活类名 -->
    <router-link to="/" active-class="is-active">首页</router-link>
    
    <!-- 精确匹配 -->
    <router-link to="/" exact-active-class="exact-active">
      首页
    </router-link>
  </nav>
</template>

<style>
.router-link-active {
  color: #42b983;
}

.is-active {
  font-weight: bold;
}
</style>
```

## Vue Router 3.x vs 4.x 差异

### 1. 创建方式

```javascript
// Vue Router 3.x
import VueRouter from 'vue-router'
Vue.use(VueRouter)
const router = new VueRouter({ ... })

// Vue Router 4.x
import { createRouter } from 'vue-router'
const router = createRouter({ ... })
```

### 2. 历史模式配置

```javascript
// Vue Router 3.x
const router = new VueRouter({
  mode: 'history',  // 'hash' | 'history' | 'abstract'
  routes
})

// Vue Router 4.x
import { createWebHistory, createWebHashHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(),  // 或 createWebHashHistory()
  routes
})
```

### 3. 通配符路由

```javascript
// Vue Router 3.x
{
  path: '*',           // 匹配所有路径
  path: '/user-*'      // 匹配以 /user- 开头的路径
}

// Vue Router 4.x
{
  path: '/:pathMatch(.*)*',           // 匹配所有路径
  path: '/user-:afterUser(.*)'        // 自定义正则匹配
}
```

### 4. 导航守卫返回值

```javascript
// Vue Router 3.x
router.beforeEach((to, from, next) => {
  if (!isAuthenticated) {
    next('/login')  // 必须调用 next()
  } else {
    next()
  }
})

// Vue Router 4.x（推荐）
router.beforeEach((to, from) => {
  if (!isAuthenticated) {
    return '/login'  // 直接返回
  }
  // 返回 undefined 或 true 表示继续
})

// Vue Router 4.x（兼容）
router.beforeEach((to, from, next) => {
  next()  // 仍然支持 next()
})
```

### 5. 滚动行为

```javascript
// Vue Router 4.x 新增异步滚动
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ left: 0, top: 0 })
    }, 500)
  })
}
```

### 6. API 变化总结

| 功能 | Vue Router 3.x | Vue Router 4.x |
|------|---------------|----------------|
| 创建实例 | `new VueRouter()` | `createRouter()` |
| 历史模式 | `mode: 'history'` | `history: createWebHistory()` |
| 通配符 | `path: '*'` | `path: '/:pathMatch(.*)*'` |
| 导航守卫 | `next()` 必须 | `return` 推荐，`next()` 兼容 |
| 新增 API | - | `isReady()`, `addRoute()`, `removeRoute()` |

## 第一个路由应用

完整示例：

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <header>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/about">关于</router-link>
        <router-link to="/user/123">用户</router-link>
      </nav>
    </header>
    
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
nav {
  padding: 20px;
  background: #f5f5f5;
}

nav a {
  margin-right: 15px;
  text-decoration: none;
  color: #333;
}

nav a.router-link-active {
  color: #42b983;
  font-weight: bold;
}

main {
  padding: 20px;
}
</style>
```

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('../views/User.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

```vue
<!-- views/User.vue -->
<template>
  <div class="user">
    <h1>用户 ID: {{ id }}</h1>
    <p>用户信息页面</p>
  </div>
</template>

<script>
export default {
  name: 'User',
  props: ['id'],
  mounted() {
    console.log('当前用户 ID:', this.id)
  }
}
</script>
```

## 关键点总结

1. **安装配置**：Vue Router 4 使用 `createRouter`，3.x 使用 `new VueRouter`
2. **核心组件**：`<router-view>` 渲染匹配的组件，`<router-link>` 声明式导航
3. **版本差异**：主要在创建方式、历史模式配置、导航守卫返回值
4. **最佳实践**：新项目优先使用 Vue Router 4.x

## 深入一点：路由懒加载

```javascript
// 不推荐：同步导入（所有组件都会打包到一个文件）
import Home from './views/Home.vue'
import About from './views/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

// 推荐：异步导入（代码分割）
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/about',
    // 魔法注释：指定 chunk 名称
    component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
  }
]
```

**打包结果：**
```
dist/
  js/
    app.js           # 主入口文件
    home.js          # Home 组件单独打包
    about.js         # About 组件单独打包（名称为 about）
```

**优势：**
- 首屏加载更快（只加载必要的代码）
- 按需加载（访问 `/about` 时才加载 `about.js`）

## 参考资料

- [Vue Router 官方文档 - 快速上手](https://router.vuejs.org/zh/guide/)
- [Vue Router 迁移指南 (3.x → 4.x)](https://router.vuejs.org/zh/guide/migration/)
- [Webpack - 代码分割](https://webpack.js.org/guides/code-splitting/)
