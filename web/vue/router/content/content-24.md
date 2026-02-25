# 第 24 章：常见踩坑与解决方案

## 概述

本章汇总了 Vue Router 使用中最常见的 10+ 个问题及其解决方案，帮助开发者快速定位和解决实际开发中遇到的路由问题。

## History 模式 404 问题

### 问题描述

使用 History 模式时，刷新页面或直接访问子路由会出现 404 错误。

```javascript
// router/index.js
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
})

// 问题：
// 1. 访问 http://example.com/about 正常
// 2. 刷新页面 → 404 错误
```

### 原因分析

- History 模式下，URL 看起来像正常路径（如 `/about`）
- 刷新时浏览器向服务器请求 `/about` 路径
- 服务器上没有 `/about` 文件，返回 404

### 解决方案

#### Nginx 配置

```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/html;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

#### Apache 配置

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Node.js (Express)

```javascript
const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, 'dist')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.listen(3000)
```

#### 开发环境（Vite）

```javascript
// vite.config.js
export default {
  server: {
    // Vite 开发服务器已自动处理
  }
}
```

## 导航守卫死循环问题

### 问题描述

导航守卫中的重定向逻辑导致无限循环。

```javascript
// ❌ 错误示例
router.beforeEach((to, from) => {
  if (!isAuthenticated()) {
    return '/login'  // 死循环！
  }
})

// 问题：访问 /login 也会触发守卫，又重定向到 /login
```

### 解决方案

#### 方案 1：白名单

```javascript
// ✅ 正确
const whiteList = ['/login', '/register', '/404']

router.beforeEach((to, from) => {
  if (!whiteList.includes(to.path) && !isAuthenticated()) {
    return '/login'
  }
})
```

#### 方案 2：检查目标路由

```javascript
// ✅ 正确
router.beforeEach((to, from) => {
  if (!isAuthenticated() && to.path !== '/login') {
    return '/login'
  }
})
```

#### 方案 3：使用 meta 标识

```javascript
const routes = [
  {
    path: '/login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return '/login'
  }
})
```

## 路由参数丢失问题

### 问题描述

导航时路由参数意外丢失。

```javascript
// ❌ 问题代码
router.push({ path: '/user', params: { id: 123 } })
// 结果：/user（params 丢失！）
```

### 原因分析

使用 `path` 时，`params` 会被忽略（这是 Vue Router 的设计）。

### 解决方案

#### 方案 1：使用命名路由

```javascript
// ✅ 正确
router.push({ name: 'User', params: { id: 123 } })
// 结果：/user/123
```

#### 方案 2：使用 query

```javascript
// ✅ 正确（如果不需要在 URL 路径中）
router.push({ path: '/user', query: { id: 123 } })
// 结果：/user?id=123
```

#### 方案 3：手动拼接路径

```javascript
// ✅ 正确
router.push({ path: `/user/${id}` })
// 结果：/user/123
```

## 动态添加路由的时机问题

### 问题描述

动态添加路由后，导航到新路由失败。

```javascript
// ❌ 问题代码
router.beforeEach(async (to, from) => {
  const accessRoutes = await generateRoutes()
  accessRoutes.forEach(route => {
    router.addRoute(route)
  })
  // 新路由不会立即生效
})
```

### 解决方案

```javascript
// ✅ 正确：重新触发导航
router.beforeEach(async (to, from) => {
  if (!routesGenerated) {
    const accessRoutes = await generateRoutes()
    accessRoutes.forEach(route => {
      router.addRoute(route)
    })
    routesGenerated = true
    
    // 重新导航，确保新路由生效
    return { ...to, replace: true }
  }
})
```

## replace vs push 的使用场景

### 问题描述

不清楚何时使用 `push` 和 `replace`。

### 区别

```javascript
// push：添加历史记录
router.push('/user')
// 历史栈：[/, /user]
// 点击后退 → 回到 /

// replace：替换当前记录
router.replace('/user')
// 历史栈：[/user]
// 点击后退 → 回到进入应用前的页面
```

### 使用场景

```javascript
// ✅ 使用 push：正常页面跳转
function viewProduct(id) {
  router.push({ name: 'Product', params: { id } })
}

// ✅ 使用 replace：登录跳转
async function login() {
  await authService.login()
  router.replace('/dashboard')  // 不希望回到登录页
}

// ✅ 使用 replace：重定向
if (!hasPermission) {
  router.replace('/403')
}

// ✅ 使用 replace：表单提交后
async function submitForm() {
  await api.create(formData)
  router.replace('/list')  // 防止重复提交
}
```

## 路由懒加载失败处理

### 问题描述

网络不稳定时，动态导入的路由组件加载失败。

```javascript
// 错误：ChunkLoadError: Loading chunk xxx failed
```

### 解决方案

#### 方案 1：全局错误处理

```javascript
router.onError((error) => {
  if (/ChunkLoadError|Loading chunk/.test(error.message)) {
    console.error('路由组件加载失败:', error)
    
    if (confirm('页面加载失败，是否刷新页面？')) {
      window.location.reload()
    }
  }
})
```

#### 方案 2：重试机制

```javascript
function lazyLoadWithRetry(importFunc, retries = 3) {
  return () => {
    return new Promise((resolve, reject) => {
      const attemptLoad = (remainingRetries) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (remainingRetries === 0) {
              reject(error)
            } else {
              console.log(`加载失败，重试中...剩余次数: ${remainingRetries}`)
              setTimeout(() => {
                attemptLoad(remainingRetries - 1)
              }, 1000)
            }
          })
      }
      attemptLoad(retries)
    })
  }
}

// 使用
const routes = [
  {
    path: '/user',
    component: lazyLoadWithRetry(() => import('@/views/User.vue'))
  }
]
```

## 命名路由 vs 路径导航的选择

### 对比

```javascript
// 路径导航
router.push('/user/123/posts')
router.push({ path: '/user/123/posts' })

// 命名路由导航
router.push({ name: 'UserPosts', params: { id: 123 } })
```

### 优劣分析

| 特性 | 路径导航 | 命名路由导航 |
|------|---------|-------------|
| **简洁性** | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **参数传递** | 手动拼接 | 自动处理 |
| **类型安全** | ❌ | ✅（TypeScript） |
| **重构友好** | ❌ | ✅ |
| **IDE 支持** | ❌ | ✅ |

### 推荐用法

```javascript
// ✅ 简单路由：使用路径
router.push('/about')
router.push('/products')

// ✅ 带参数路由：使用命名路由
router.push({ name: 'User', params: { id: 123 } })
router.push({ name: 'Product', params: { id: 456, category: 'tech' } })

// ✅ 带查询参数：两种都可以
router.push({ path: '/search', query: { q: 'vue' } })
router.push({ name: 'Search', query: { q: 'vue' } })
```

## $route vs $router 误用

### 区别

```javascript
// $route：当前路由信息对象（只读）
this.$route.path      // '/user/123'
this.$route.params    // { id: '123' }
this.$route.query     // { tab: 'posts' }
this.$route.meta      // { title: '用户详情' }

// $router：路由器实例（用于导航）
this.$router.push()
this.$router.replace()
this.$router.go()
this.$router.back()
```

### 常见错误

```javascript
// ❌ 错误：用 $route 导航
this.$route.push('/home')  // TypeError: $route.push is not a function

// ✅ 正确：用 $router 导航
this.$router.push('/home')

// ❌ 错误：用 $router 获取参数
this.$router.params.id  // undefined

// ✅ 正确：用 $route 获取参数
this.$route.params.id
```

## 组件复用时参数不响应

### 问题描述

从 `/user/1` 导航到 `/user/2` 时，组件不更新。

```vue
<script>
export default {
  data() {
    return {
      userId: null,
      userInfo: null
    }
  },
  
  mounted() {
    this.userId = this.$route.params.id
    this.fetchUser(this.userId)
  }
  
  // 问题：从 /user/1 到 /user/2 时，mounted 不会再次执行
}
</script>
```

### 解决方案

#### 方案 1：watch $route

```vue
<script>
export default {
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        this.userId = newId
        this.fetchUser(newId)
      }
    }
  }
}
</script>
```

#### 方案 2：beforeRouteUpdate

```vue
<script>
export default {
  async beforeRouteUpdate(to, from) {
    if (to.params.id !== from.params.id) {
      this.userId = to.params.id
      await this.fetchUser(to.params.id)
    }
  },
  
  async mounted() {
    this.userId = this.$route.params.id
    await this.fetchUser(this.userId)
  }
}
</script>
```

#### 方案 3：使用 key 强制刷新（不推荐）

```vue
<template>
  <router-view :key="$route.fullPath" />
</template>

<!-- 缺点：组件完全重建，性能差 -->
```

## addRoute 动态路由权限控制

### 问题描述

动态添加路由时的权限控制和时机问题。

### 完整方案

```javascript
// stores/permission.js
export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
    isGenerated: false
  }),
  
  actions: {
    async generateRoutes(roles) {
      const accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      
      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat(accessedRoutes)
      this.isGenerated = true
      
      return accessedRoutes
    },
    
    resetRoutes() {
      this.routes = []
      this.addRoutes = []
      this.isGenerated = false
    }
  }
})

// router/index.js
router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  
  if (userStore.token) {
    if (!permissionStore.isGenerated) {
      try {
        await userStore.getUserInfo()
        const accessRoutes = await permissionStore.generateRoutes(userStore.roles)
        
        // 动态添加路由
        accessRoutes.forEach(route => {
          router.addRoute(route)
        })
        
        // 重新导航
        return { ...to, replace: true }
      } catch (error) {
        await userStore.logout()
        return '/login'
      }
    }
  } else {
    if (to.path !== '/login') {
      return '/login'
    }
  }
})
```

## 快速排查清单

```javascript
// 路由问题排查清单
const troubleshootingChecklist = {
  'History 模式 404': {
    check: () => {
      return '是否配置了服务器重定向规则？'
    },
    solution: '配置 Nginx/Apache 将所有请求重定向到 index.html'
  },
  
  '导航守卫死循环': {
    check: () => {
      return '守卫中的重定向是否包含了目标路由？'
    },
    solution: '使用白名单或检查目标路由'
  },
  
  '参数丢失': {
    check: () => {
      return '是否使用了 path + params 的组合？'
    },
    solution: '使用 name + params 或 path + query'
  },
  
  '组件不更新': {
    check: () => {
      return '路由参数变化时组件是否被复用？'
    },
    solution: '使用 watch 或 beforeRouteUpdate'
  },
  
  '动态路由不生效': {
    check: () => {
      return 'addRoute 后是否重新触发导航？'
    },
    solution: 'return { ...to, replace: true }'
  }
}
```

## 参考资料

- [Vue Router - FAQ](https://router.vuejs.org/zh/guide/essentials/history-mode.html#%E6%9C%8D%E5%8A%A1%E5%99%A8%E9%85%8D%E7%BD%AE%E7%A4%BA%E4%BE%8B)
- [Vue Router - 导航故障](https://router.vuejs.org/zh/guide/advanced/navigation-failures.html)
