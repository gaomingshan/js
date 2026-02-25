# Vue Router 基础

> Vue Router 是 Vue.js 官方的路由管理器，用于构建单页面应用。

## 核心概念

Vue Router 4 是专为 Vue 3 设计的路由解决方案。

### 安装

```bash
npm install vue-router@4
```

### 基础配置

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'

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
  history: createWebHistory(),
  routes
})

export default router

// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

---

## 路由模式

### History 模式

使用 HTML5 History API，URL 更美观。

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes
})
```

**特点**：
- URL: `http://example.com/user/123`
- 需要服务器配置支持
- SEO 友好

**服务器配置**：

```nginx
# Nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Hash 模式

使用 URL hash，无需服务器配置。

```typescript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
```

**特点**：
- URL: `http://example.com/#/user/123`
- 无需服务器配置
- 兼容性更好

### Memory 模式

不依赖浏览器 URL，适用于 Node.js 环境。

```typescript
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes
})
```

---

## 路由定义

### 基础路由

```typescript
const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/about',
    component: About
  },
  {
    path: '/user/:id',
    component: User
  }
]
```

### 命名路由

```typescript
const routes = [
  {
    path: '/user/:id',
    name: 'User',
    component: User
  }
]

// 导航
router.push({ name: 'User', params: { id: 123 } })
```

### 嵌套路由

```typescript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        path: '', // 默认子路由
        component: UserHome
      },
      {
        path: 'profile',
        component: UserProfile
      },
      {
        path: 'posts',
        component: UserPosts
      }
    ]
  }
]
```

```vue
<!-- User.vue -->
<template>
  <div class="user">
    <h2>User {{ $route.params.id }}</h2>
    <router-view></router-view>
  </div>
</template>
```

---

## 路由导航

### router-link

```vue
<template>
  <!-- 字符串 -->
  <router-link to="/">Home</router-link>
  
  <!-- 对象 -->
  <router-link :to="{ path: '/about' }">About</router-link>
  
  <!-- 命名路由 -->
  <router-link :to="{ name: 'User', params: { id: 123 } }">
    User
  </router-link>
  
  <!-- 带查询参数 -->
  <router-link :to="{ path: '/search', query: { q: 'vue' } }">
    Search
  </router-link>
  
  <!-- 自定义激活类名 -->
  <router-link
    to="/about"
    active-class="active"
    exact-active-class="exact-active"
  >
    About
  </router-link>
  
  <!-- 替换而非 push -->
  <router-link to="/about" replace>About</router-link>
</template>

<style>
.router-link-active {
  color: #42b983;
}

.router-link-exact-active {
  font-weight: bold;
}
</style>
```

### 编程式导航

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// 字符串路径
router.push('/users')

// 对象
router.push({ path: '/users' })

// 命名路由
router.push({ name: 'User', params: { id: 123 } })

// 带查询参数
router.push({ path: '/search', query: { q: 'vue' } })

// 带 hash
router.push({ path: '/about', hash: '#team' })

// 替换当前记录
router.replace({ path: '/home' })

// 前进/后退
router.go(1)   // 前进一步
router.go(-1)  // 后退一步
router.back()  // 后退
router.forward() // 前进
```

---

## 路由参数

### 动态路由匹配

```typescript
// 路由定义
{
  path: '/user/:id',
  component: User
}

// 访问参数
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
console.log(route.params.id) // 123
</script>

// 响应路由参数变化
watch(() => route.params.id, (newId, oldId) => {
  // 响应路由参数的变化
  fetchUser(newId)
})
```

### 多个参数

```typescript
{
  path: '/user/:username/post/:postId',
  component: Post
}

// 访问
route.params.username // 'alice'
route.params.postId   // '456'
```

### 可选参数

```typescript
// ? 表示可选
{
  path: '/user/:id?',
  component: User
}
```

### 重复参数

```typescript
// + 表示一个或多个
// * 表示零个或多个
{
  path: '/chapter/:chapterId+',
  component: Chapter
}

// /chapter/1/2/3
route.params.chapterId // ['1', '2', '3']
```

### 查询参数

```typescript
// /search?q=vue&page=2
route.query.q    // 'vue'
route.query.page // '2'
```

---

## 路由视图

### router-view

```vue
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
```

### 命名视图

```typescript
const routes = [
  {
    path: '/',
    components: {
      default: Home,
      sidebar: Sidebar,
      footer: Footer
    }
  }
]
```

```vue
<template>
  <div id="app">
    <router-view></router-view>
    <router-view name="sidebar"></router-view>
    <router-view name="footer"></router-view>
  </div>
</template>
```

### 嵌套视图

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<!-- User.vue -->
<template>
  <div class="user">
    <h2>User {{ $route.params.id }}</h2>
    <router-view></router-view>
  </div>
</template>
```

---

## 重定向与别名

### 重定向

```typescript
const routes = [
  // 字符串
  {
    path: '/home',
    redirect: '/'
  },
  
  // 对象
  {
    path: '/home',
    redirect: { name: 'Home' }
  },
  
  // 函数
  {
    path: '/search/:query',
    redirect: to => {
      return { path: '/search', query: { q: to.params.query } }
    }
  },
  
  // 相对重定向
  {
    path: '/users/:id',
    redirect: to => 'profile'
  }
]
```

### 别名

```typescript
const routes = [
  {
    path: '/home',
    component: Home,
    alias: '/'
  },
  {
    path: '/user/:id',
    component: User,
    alias: ['/u/:id', '/person/:id']
  }
]
```

---

## Props 传递

### 布尔模式

```typescript
const routes = [
  {
    path: '/user/:id',
    component: User,
    props: true
  }
]
```

```vue
<!-- User.vue -->
<script setup>
defineProps<{
  id: string
}>()
</script>

<template>
  <div>User {{ id }}</div>
</template>
```

### 对象模式

```typescript
const routes = [
  {
    path: '/promotion',
    component: Promotion,
    props: { newsletter: true }
  }
]
```

### 函数模式

```typescript
const routes = [
  {
    path: '/search',
    component: SearchUser,
    props: route => ({ query: route.query.q })
  }
]
```

---

## 懒加载

### 路由懒加载

```typescript
const routes = [
  {
    path: '/about',
    // 动态导入
    component: () => import('@/views/About.vue')
  },
  {
    path: '/dashboard',
    // 使用 webpack 魔法注释命名 chunk
    component: () => import(
      /* webpackChunkName: "dashboard" */
      '@/views/Dashboard.vue'
    )
  }
]
```

### 路由分组

```typescript
// 将多个路由打包到同一个 chunk
const routes = [
  {
    path: '/admin/users',
    component: () => import(
      /* webpackChunkName: "admin" */
      '@/views/admin/Users.vue'
    )
  },
  {
    path: '/admin/settings',
    component: () => import(
      /* webpackChunkName: "admin" */
      '@/views/admin/Settings.vue'
    )
  }
]
```

---

## 路由元信息

```typescript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      title: '管理后台',
      roles: ['admin']
    }
  }
]

// 访问
const route = useRoute()
console.log(route.meta.requiresAuth)
console.log(route.meta.title)
```

---

## 实战示例

### 示例 1：完整的路由配置

```typescript
// router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: '关于' }
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue'),
    props: true,
    children: [
      {
        path: '',
        name: 'UserHome',
        component: () => import('@/views/user/Home.vue')
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue')
      },
      {
        path: 'posts',
        name: 'UserPosts',
        component: () => import('@/views/user/Posts.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/Layout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        redirect: { name: 'AdminDashboard' }
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
```

### 示例 2：导航菜单

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

interface MenuItem {
  path: string
  name: string
  icon: string
}

const route = useRoute()

const menuItems: MenuItem[] = [
  { path: '/', name: '首页', icon: 'home' },
  { path: '/about', name: '关于', icon: 'info' },
  { path: '/contact', name: '联系', icon: 'mail' }
]

const isActive = (path: string) => {
  return route.path === path
}
</script>

<template>
  <nav class="menu">
    <router-link
      v-for="item in menuItems"
      :key="item.path"
      :to="item.path"
      :class="{ active: isActive(item.path) }"
      class="menu-item"
    >
      <span class="icon">{{ item.icon }}</span>
      <span>{{ item.name }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.menu {
  display: flex;
  gap: 10px;
}

.menu-item {
  padding: 10px 20px;
  text-decoration: none;
  color: #666;
  border-radius: 4px;
  transition: all 0.3s;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.active {
  background: #42b983;
  color: white;
}
</style>
```

### 示例 3：面包屑导航

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(r => r.meta?.title)
  
  return matched.map(r => ({
    name: r.name,
    title: r.meta.title,
    path: r.path
  }))
})
</script>

<template>
  <nav class="breadcrumb">
    <router-link
      v-for="(item, index) in breadcrumbs"
      :key="item.name"
      :to="item.path"
      class="breadcrumb-item"
    >
      {{ item.title }}
      <span v-if="index < breadcrumbs.length - 1" class="separator">
        /
      </span>
    </router-link>
  </nav>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px;
  background: #f5f5f5;
}

.breadcrumb-item {
  color: #666;
  text-decoration: none;
}

.breadcrumb-item:hover {
  color: #42b983;
}

.separator {
  color: #999;
  margin: 0 5px;
}
</style>
```

---

## 最佳实践

1. **使用命名路由**：便于维护和重构
2. **路由懒加载**：优化首屏加载
3. **合理分组**：相关路由打包到一起
4. **元信息管理**：统一管理权限、标题等
5. **类型安全**：使用 TypeScript
6. **错误处理**：404 页面、错误边界
7. **滚动行为**：自定义滚动位置
8. **导航守卫**：权限控制、数据预取

---

## 参考资料

- [Vue Router 官方文档](https://router.vuejs.org/)
- [路由守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [滚动行为](https://router.vuejs.org/guide/advanced/scroll-behavior.html)
