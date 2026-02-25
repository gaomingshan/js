# Vue Router 面试题汇总

本文档包含 20 道精选的 Vue Router 面试题，涵盖基础概念、核心功能、高级特性和实战应用。

---

## 1. 前端路由的实现原理是什么？Hash 模式和 History 模式有什么区别？

**答案：**

前端路由通过监听 URL 变化来切换视图，有两种主要实现方式：

**Hash 模式：**
- 原理：利用 URL 的 hash 部分（`#` 后的内容）
- 监听：`hashchange` 事件
- URL 格式：`http://example.com/#/user`
- 特点：兼容性好（IE8+），无需服务器配置

**History 模式：**
- 原理：利用 HTML5 History API
- 监听：`popstate` 事件，使用 `pushState`/`replaceState` 修改 URL
- URL 格式：`http://example.com/user`
- 特点：URL 美观，但需要服务器配置支持

**主要区别：**
1. URL 美观度：History 更美观
2. 服务器配置：Hash 不需要，History 必须配置
3. SEO：History 相对友好
4. 兼容性：Hash 更好

**易错点：**
- History 模式刷新页面会向服务器请求，必须配置服务器将所有路由重定向到 `index.html`

---

## 2. Vue Router 3.x 和 4.x 的主要区别是什么？

**答案：**

**创建方式：**
```javascript
// 3.x
import VueRouter from 'vue-router'
Vue.use(VueRouter)
const router = new VueRouter({ ... })

// 4.x
import { createRouter } from 'vue-router'
const router = createRouter({ ... })
```

**历史模式配置：**
```javascript
// 3.x
mode: 'history' | 'hash' | 'abstract'

// 4.x
history: createWebHistory() | createWebHashHistory() | createMemoryHistory()
```

**导航守卫返回值：**
```javascript
// 3.x - 必须调用 next()
beforeEach((to, from, next) => {
  next()
})

// 4.x - 推荐直接 return
beforeEach((to, from) => {
  return '/login'
})
```

**通配符路由：**
```javascript
// 3.x
{ path: '*' }

// 4.x
{ path: '/:pathMatch(.*)* }
```

**新增 API：**
- `isReady()`、`addRoute()`、`removeRoute()`
- 更好的 TypeScript 支持

---

## 3. 什么是路由懒加载？如何实现？有什么好处？

**答案：**

**定义：**
路由懒加载是指将路由组件按需加载，而不是在应用启动时一次性加载所有组件。

**实现方式：**
```javascript
// 同步加载（不推荐）
import Home from './Home.vue'
{ path: '/', component: Home }

// 懒加载（推荐）
{
  path: '/about',
  component: () => import('./About.vue')
}

// 分组打包
{
  path: '/user',
  component: () => import(/* webpackChunkName: "user" */ './User.vue')
}
```

**好处：**
1. **减少首屏加载时间**：只加载必要的代码
2. **按需加载**：访问时才加载对应组件
3. **优化性能**：减少主 bundle 体积
4. **提升用户体验**：首页打开更快

**注意事项：**
- 不要过度拆分（HTTP 请求开销）
- 合理分组（按功能模块）
- 关键页面可同步加载

---

## 4. 导航守卫有哪些类型？执行顺序是什么？

**答案：**

**三种类型：**

1. **全局守卫：**
   - `beforeEach`：前置守卫
   - `beforeResolve`：解析守卫
   - `afterEach`：后置钩子

2. **路由独享守卫：**
   - `beforeEnter`：在路由配置中定义

3. **组件内守卫：**
   - `beforeRouteEnter`：进入前
   - `beforeRouteUpdate`：复用时
   - `beforeRouteLeave`：离开前

**完整执行顺序：**
```
1. 导航触发
2. beforeRouteLeave（失活组件）
3. beforeEach（全局）
4. beforeRouteUpdate（重用组件）
5. beforeEnter（路由配置）
6. 解析异步组件
7. beforeRouteEnter（激活组件）
8. beforeResolve（全局）
9. 导航确认
10. afterEach（全局）
11. DOM 更新
12. beforeRouteEnter 的 next 回调
```

**易错点：**
- `beforeRouteEnter` 不能访问 `this`，需要通过 `next` 回调
- 3.x 必须调用 `next()`，否则导航会卡住

---

## 5. 动态路由参数如何传递和接收？params 和 query 有什么区别？

**答案：**

**params 传参：**
```javascript
// 路由配置
{ path: '/user/:id', name: 'User', component: User }

// 传递（必须使用 name）
router.push({ name: 'User', params: { id: 123 } })
// URL: /user/123

// 接收
this.$route.params.id  // '123'（字符串）
```

**query 传参：**
```javascript
// 传递（可以使用 path 或 name）
router.push({ path: '/search', query: { q: 'vue', page: 1 } })
// URL: /search?q=vue&page=1

// 接收
this.$route.query.q     // 'vue'
this.$route.query.page  // '1'（字符串）
```

**区别对比：**

| 特性 | params | query |
|------|--------|-------|
| **URL 形式** | `/user/123` | `/user?id=123` |
| **路由配置** | 需要定义 | 不需要定义 |
| **导航方式** | 必须用 name | path 或 name 都可以 |
| **刷新保留** | ✅ | ✅ |
| **适用场景** | 资源标识 | 过滤、分页 |

**常见错误：**
```javascript
// ❌ 使用 path + params 会丢失参数
router.push({ path: '/user', params: { id: 123 } })
// URL: /user（params 丢失）

// ✅ 正确
router.push({ name: 'User', params: { id: 123 } })
```

---

## 6. 如何解决组件复用时路由参数变化不响应的问题？

**答案：**

**问题场景：**
从 `/user/1` 导航到 `/user/2` 时，User 组件被复用，`mounted` 不会再次执行。

**解决方案：**

**方案 1：watch $route（推荐）**
```javascript
export default {
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        this.fetchUser(newId)
      }
    }
  }
}
```

**方案 2：beforeRouteUpdate**
```javascript
export default {
  async beforeRouteUpdate(to, from) {
    if (to.params.id !== from.params.id) {
      await this.fetchUser(to.params.id)
    }
  }
}
```

**方案 3：Composition API**
```javascript
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
watch(
  () => route.params.id,
  (newId) => fetchUser(newId),
  { immediate: true }
)
```

**方案 4：使用 key 强制刷新（不推荐）**
```vue
<router-view :key="$route.fullPath" />
<!-- 缺点：组件完全重建，性能差 -->
```

**推荐：** 方案 1 或方案 2，性能好且代码清晰。

---

## 7. 什么是路由元信息（meta）？常见的使用场景有哪些？

**答案：**

**定义：**
路由元信息是附加在路由配置上的自定义数据，通过 `meta` 字段定义。

**配置示例：**
```javascript
{
  path: '/admin',
  component: Admin,
  meta: {
    requiresAuth: true,
    roles: ['admin'],
    title: '管理后台',
    icon: 'dashboard',
    keepAlive: true,
    breadcrumb: '系统管理'
  }
}
```

**常见使用场景：**

**1. 权限控制：**
```javascript
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return '/login'
  }
  
  if (to.meta.roles && !hasRole(to.meta.roles)) {
    return '/403'
  }
})
```

**2. 页面标题：**
```javascript
router.afterEach((to) => {
  document.title = to.meta.title || '默认标题'
})
```

**3. 面包屑导航：**
```javascript
const breadcrumbs = computed(() => {
  return route.matched.map(r => ({
    title: r.meta.title,
    path: r.path
  }))
})
```

**4. 页面缓存：**
```vue
<keep-alive :include="cachedViews">
  <router-view />
</keep-alive>

<script>
const cachedViews = computed(() => {
  return route.matched
    .filter(r => r.meta.keepAlive)
    .map(r => r.name)
})
</script>
```

**5. 过渡动画：**
```vue
<transition :name="route.meta.transition || 'fade'">
  <router-view />
</transition>
```

---

## 8. 如何实现动态路由权限控制？

**答案：**

**实现步骤：**

**1. 定义基础路由和异步路由：**
```javascript
// 基础路由（所有用户）
export const constantRoutes = [
  { path: '/login', component: Login },
  { path: '/', component: Home }
]

// 异步路由（根据权限加载）
export const asyncRoutes = [
  {
    path: '/admin',
    component: Admin,
    meta: { roles: ['admin'] }
  },
  {
    path: '/editor',
    component: Editor,
    meta: { roles: ['admin', 'editor'] }
  }
]
```

**2. 过滤路由：**
```javascript
function filterAsyncRoutes(routes, roles) {
  const res = []
  
  routes.forEach(route => {
    const tmp = { ...route }
    
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  
  return res
}

function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  }
  return true
}
```

**3. 在导航守卫中动态添加：**
```javascript
router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  
  if (userStore.token) {
    if (!routesGenerated) {
      // 获取用户角色
      await userStore.getUserInfo()
      
      // 生成可访问路由
      const accessRoutes = filterAsyncRoutes(asyncRoutes, userStore.roles)
      
      // 动态添加路由
      accessRoutes.forEach(route => {
        router.addRoute(route)
      })
      
      routesGenerated = true
      
      // 重新导航
      return { ...to, replace: true }
    }
  } else {
    if (to.path !== '/login') {
      return '/login'
    }
  }
})
```

**关键点：**
- 动态添加后必须重新触发导航
- 退出登录时需要重置路由
- 404 路由应该最后添加

---

## 9. History 模式下，刷新页面出现 404 如何解决？

**答案：**

**问题原因：**
- History 模式的 URL 看起来像正常路径（如 `/user/123`）
- 刷新时浏览器向服务器请求 `/user/123`
- 服务器上没有该文件，返回 404

**解决方案：配置服务器**

**Nginx：**
```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

**Apache：**
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

**Node.js (Express)：**
```javascript
const express = require('express')
const path = require('path')
const app = express()

app.use(express.static('dist'))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.listen(3000)
```

**原理：**
所有找不到的路径都返回 `index.html`，让前端路由接管。

---

## 10. 路由懒加载失败如何处理？

**答案：**

**问题场景：**
网络不稳定时，动态导入的组件加载失败，报错 `ChunkLoadError`。

**解决方案：**

**方案 1：全局错误捕获**
```javascript
router.onError((error) => {
  if (/ChunkLoadError|Loading chunk/.test(error.message)) {
    if (confirm('页面加载失败，是否刷新？')) {
      window.location.reload()
    }
  }
})
```

**方案 2：重试机制**
```javascript
function lazyLoadWithRetry(importFunc, retries = 3, delay = 1000) {
  return () => {
    return new Promise((resolve, reject) => {
      const attemptLoad = (remainingRetries) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (remainingRetries === 0) {
              reject(error)
            } else {
              console.log(`重试...剩余次数: ${remainingRetries}`)
              setTimeout(() => {
                attemptLoad(remainingRetries - 1)
              }, delay)
            }
          })
      }
      attemptLoad(retries)
    })
  }
}

// 使用
{
  path: '/user',
  component: lazyLoadWithRetry(() => import('./User.vue'))
}
```

**方案 3：降级组件**
```javascript
function lazyLoadWithFallback(importFunc, fallback) {
  return () => {
    return importFunc().catch(() => {
      console.warn('组件加载失败，使用降级组件')
      return fallback
    })
  }
}

const ErrorFallback = {
  template: '<div>加载失败 <button @click="reload">重试</button></div>',
  methods: { reload() { location.reload() } }
}

{
  path: '/user',
  component: lazyLoadWithFallback(
    () => import('./User.vue'),
    ErrorFallback
  )
}
```

---

## 11. 如何在导航守卫中避免死循环？

**答案：**

**常见死循环场景：**
```javascript
// ❌ 错误示例
router.beforeEach((to, from) => {
  if (!isLoggedIn()) {
    return '/login'  // 访问 /login 也会触发守卫！
  }
})
```

**解决方案：**

**方案 1：白名单**
```javascript
const whiteList = ['/login', '/register', '/404']

router.beforeEach((to, from) => {
  if (!whiteList.includes(to.path) && !isLoggedIn()) {
    return '/login'
  }
})
```

**方案 2：检查目标路由**
```javascript
router.beforeEach((to, from) => {
  if (!isLoggedIn() && to.path !== '/login') {
    return '/login'
  }
})
```

**方案 3：使用 meta 标识**
```javascript
const routes = [
  {
    path: '/login',
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    meta: { requiresAuth: true }
  }
]

router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return '/login'
  }
})
```

**最佳实践：**
使用 meta 标识，代码清晰且易维护。

---

## 12. 如何实现路由级别的 KeepAlive 缓存？

**答案：**

**实现方案：**

**1. 路由配置中标识需要缓存的页面：**
```javascript
{
  path: '/list',
  component: List,
  meta: { keepAlive: true }
},
{
  path: '/detail/:id',
  component: Detail,
  meta: { keepAlive: false }
}
```

**2. 动态管理缓存列表：**
```javascript
// stores/cache.js
export const useCacheStore = defineStore('cache', {
  state: () => ({
    cachedViews: []
  }),
  
  actions: {
    addCachedView(view) {
      if (!this.cachedViews.includes(view)) {
        this.cachedViews.push(view)
      }
    },
    
    removeCachedView(view) {
      const index = this.cachedViews.indexOf(view)
      if (index > -1) {
        this.cachedViews.splice(index, 1)
      }
    }
  }
})
```

**3. 模板中使用：**
```vue
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cacheStore.cachedViews">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<script setup>
import { useCacheStore } from '@/stores/cache'

const cacheStore = useCacheStore()

// 监听路由变化，动态添加缓存
watch(() => route.name, () => {
  if (route.meta.keepAlive) {
    cacheStore.addCachedView(route.name)
  }
})
</script>
```

**4. 列表页从详情页返回时刷新：**
```vue
<script>
export default {
  data() {
    return {
      needRefresh: false
    }
  },
  
  activated() {
    // 从详情页返回时刷新
    if (this.needRefresh) {
      this.fetchList()
      this.needRefresh = false
    }
  },
  
  beforeRouteLeave(to, from) {
    if (to.name === 'Detail') {
      this.needRefresh = true
    }
  }
}
</script>
```

---

## 13. 编程式导航和声明式导航的区别是什么？

**答案：**

**声明式导航：**
```vue
<template>
  <router-link to="/about">关于</router-link>
  <router-link :to="{ name: 'User', params: { id: 123 } }">用户</router-link>
</template>
```

**编程式导航：**
```javascript
// 字符串路径
this.$router.push('/about')

// 对象形式
this.$router.push({ path: '/about' })

// 命名路由
this.$router.push({ name: 'User', params: { id: 123 } })

// 带查询参数
this.$router.push({ path: '/search', query: { q: 'vue' } })
```

**对比：**

| 特性 | 声明式导航 | 编程式导航 |
|------|-----------|-----------|
| **使用方式** | `<router-link>` | `router.push()` |
| **渲染结果** | `<a>` 标签 | JavaScript 调用 |
| **SEO** | 友好 | 不友好 |
| **适用场景** | 导航菜单、链接 | 业务逻辑中的跳转 |
| **激活状态** | 自动添加类名 | 需手动处理 |

**使用场景：**
```javascript
// ✅ 声明式：导航菜单
<router-link to="/products">产品</router-link>

// ✅ 编程式：表单提交后跳转
async function submitForm() {
  await api.submit(formData)
  this.$router.push('/success')
}

// ✅ 编程式：根据条件跳转
function handleClick() {
  if (hasPermission) {
    this.$router.push('/admin')
  } else {
    this.$router.push('/403')
  }
}
```

---

## 14. router.push 和 router.replace 的区别是什么？

**答案：**

**push：添加历史记录**
```javascript
router.push('/user')

// 历史栈：[/, /user]
// 点击后退 → 回到 /
```

**replace：替换当前记录**
```javascript
router.replace('/user')

// 假设当前在 /about
// 历史栈：[/, /about] → [/, /user]
// 点击后退 → 回到 /（不是 /about）
```

**使用场景：**

**使用 push：**
```javascript
// ✅ 正常页面跳转
function viewProduct(id) {
  router.push({ name: 'Product', params: { id } })
}

// ✅ 用户主动点击
<router-link to="/about">关于</router-link>
```

**使用 replace：**
```javascript
// ✅ 登录成功后跳转
async function login() {
  await authService.login()
  router.replace('/dashboard')  // 不希望回到登录页
}

// ✅ 重定向
if (!hasPermission) {
  router.replace('/403')
}

// ✅ 表单提交后
async function submitForm() {
  await api.create(formData)
  router.replace('/list')  // 防止重复提交
}

// ✅ 修正错误路由
if (invalidRoute) {
  router.replace('/404')
}
```

**记忆技巧：**
- 需要回退：用 `push`
- 不需要回退：用 `replace`

---

## 15. 如何实现路由过渡动画？

**答案：**

**基础实现：**
```vue
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

**根据路由 meta 配置：**
```javascript
const routes = [
  {
    path: '/',
    component: Home,
    meta: { transition: 'fade' }
  },
  {
    path: '/about',
    component: About,
    meta: { transition: 'slide-left' }
  }
]
```

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>
```

**根据导航方向：**
```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const transitionName = ref('fade')

watch(() => route.path, (to, from) => {
  // 简单判断：基于路由深度
  const toDepth = to.split('/').length
  const fromDepth = from.split('/').length
  
  transitionName.value = toDepth > fromDepth ? 'slide-left' : 'slide-right'
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
```

**性能优化：**
```css
/* ✅ 推荐：使用 transform 和 opacity */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s, opacity 0.3s;
}

/* ❌ 不推荐：使用 left、width 等会触发重排的属性 */
```

---

## 16. 如何实现前端路由的权限控制？

**答案：**

**多层次权限控制：**

**1. 路由级别 - 导航守卫：**
```javascript
router.beforeEach((to, from) => {
  // 检查登录
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  
  // 检查角色
  if (to.meta.roles) {
    const userRole = getUserRole()
    if (!to.meta.roles.includes(userRole)) {
      return '/403'
    }
  }
  
  // 检查权限
  if (to.meta.permissions) {
    const userPermissions = getUserPermissions()
    const hasPermission = to.meta.permissions.every(p => 
      userPermissions.includes(p)
    )
    if (!hasPermission) {
      return '/403'
    }
  }
})
```

**2. 组件级别 - 指令：**
```javascript
// directives/permission.js
export default {
  mounted(el, binding) {
    const { value } = binding
    const permissions = getUserPermissions()
    
    if (value && !permissions.includes(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

// 使用
<button v-permission="'user:delete'">删除</button>
```

**3. 按钮级别 - 函数判断：**
```javascript
// composables/usePermission.js
export function usePermission() {
  function hasPermission(permission) {
    const permissions = getUserPermissions()
    return permissions.includes(permission)
  }
  
  return { hasPermission }
}

// 使用
<button v-if="hasPermission('user:create')">创建</button>
```

**4. 数据级别 - 行级权限：**
```javascript
function canAccessData(data) {
  const user = getCurrentUser()
  
  // 管理员可访问所有数据
  if (user.role === 'admin') return true
  
  // 普通用户只能访问自己的数据
  return data.userId === user.id
}
```

---

## 17. 嵌套路由是什么？如何配置？

**答案：**

**定义：**
嵌套路由允许在父路由组件内部渲染子路由组件，形成层级结构。

**配置示例：**
```javascript
{
  path: '/user',
  component: User,
  children: [
    {
      // 空路径：匹配 /user
      path: '',
      component: UserHome
    },
    {
      // 匹配 /user/profile
      path: 'profile',
      component: UserProfile
    },
    {
      // 匹配 /user/posts
      path: 'posts',
      component: UserPosts
    }
  ]
}
```

**父组件模板：**
```vue
<!-- User.vue -->
<template>
  <div class="user-layout">
    <aside>
      <router-link to="/user">首页</router-link>
      <router-link to="/user/profile">个人资料</router-link>
      <router-link to="/user/posts">我的帖子</router-link>
    </aside>
    
    <main>
      <!-- 子路由的渲染出口 -->
      <router-view />
    </main>
  </div>
</template>
```

**注意事项：**

1. **子路径不要以 `/` 开头：**
```javascript
// ✅ 正确
{ path: 'profile', component: UserProfile }  // /user/profile

// ❌ 错误（会被视为根路径）
{ path: '/profile', component: UserProfile }  // /profile
```

2. **每一级都需要 `<router-view>`：**
```
App.vue
└── <router-view>  (渲染 User)
    └── User.vue
        └── <router-view>  (渲染 UserProfile)
```

3. **多层嵌套：**
```javascript
{
  path: '/admin',
  component: AdminLayout,
  children: [
    {
      path: 'users',
      component: UserManagement,
      children: [
        { path: ':id', component: UserDetail }
      ]
    }
  ]
}
// 访问 /admin/users/123
```

---

## 18. 如何优化路由性能？

**答案：**

**1. 合理的路由懒加载：**
```javascript
// ❌ 过度拆分
{ path: '/user', component: () => import('./User.vue') }  // 10KB
{ path: '/profile', component: () => import('./Profile.vue') }  // 8KB

// ✅ 合理分组
{
  path: '/user',
  component: () => import(/* webpackChunkName: "user" */ './User.vue')
},
{
  path: '/profile',
  component: () => import(/* webpackChunkName: "user" */ './Profile.vue')
}
// user.js (18KB) 一次请求
```

**2. 预加载高频页面：**
```javascript
{
  path: '/products',
  component: () => import(
    /* webpackChunkName: "products" */
    /* webpackPrefetch: true */
    './Products.vue'
  )
}
```

**3. 使用 KeepAlive 缓存：**
```vue
<keep-alive :include="cachedViews">
  <router-view />
</keep-alive>
```

**4. 避免在守卫中进行耗时操作：**
```javascript
// ❌ 不推荐
router.beforeEach(async (to, from) => {
  await heavyComputation()  // 阻塞导航
})

// ✅ 推荐：在组件中处理
```

**5. 首屏关键路由同步加载：**
```javascript
import Home from './Home.vue'  // 同步导入

{
  path: '/',
  component: Home  // 首屏关键组件
}
```

**6. 路由性能监控：**
```javascript
router.beforeEach(() => {
  performance.mark('route-start')
})

router.afterEach(() => {
  performance.mark('route-end')
  performance.measure('route-change', 'route-start', 'route-end')
  
  const measure = performance.getEntriesByName('route-change')[0]
  if (measure.duration > 1000) {
    console.warn('路由切换耗时过长:', measure.duration)
  }
})
```

**7. 代码分割优化：**
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus']
        }
      }
    }
  }
}
```

---

## 19. 如何处理路由中的异步数据加载？

**答案：**

**方案 1：在组件中加载（推荐）**
```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const data = ref(null)
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  data.value = await fetchData(route.params.id)
  loading.value = false
})
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else>{{ data }}</div>
</template>
```

**方案 2：在导航守卫中加载：**
```vue
<script>
export default {
  async beforeRouteEnter(to, from, next) {
    try {
      const data = await fetchData(to.params.id)
      next(vm => {
        vm.data = data
      })
    } catch (error) {
      next({ name: 'Error', params: { error } })
    }
  }
}
</script>
```

**方案 3：使用 Suspense（Vue 3）：**
```vue
<template>
  <router-view v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
      <template #fallback>
        <div>加载中...</div>
      </template>
    </Suspense>
  </router-view>
</template>
```

```vue
<!-- AsyncComponent.vue -->
<script setup>
const data = await fetchData()  // 顶层 await
</script>
```

**方案 4：组合式函数：**
```javascript
// composables/useRouteData.js
export function useRouteData(fetcher) {
  const route = useRoute()
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  async function fetchData() {
    loading.value = true
    try {
      data.value = await fetcher(route.params)
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }
  
  watch(() => route.params, fetchData, { immediate: true })
  
  return { data, loading, error, refetch: fetchData }
}

// 使用
const { data, loading, error } = useRouteData(
  (params) => fetchUser(params.id)
)
```

**推荐：** 方案 1 或方案 4，简单且易于测试。

---

## 20. 路由的滚动行为如何控制？

**答案：**

**基础配置：**
```javascript
const router = createRouter({
  history: createWebHistory(),
  routes: [...],
  
  scrollBehavior(to, from, savedPosition) {
    // 1. 浏览器前进/后退：恢复位置
    if (savedPosition) {
      return savedPosition
    }
    
    // 2. 锚点导航：滚动到锚点
    if (to.hash) {
      return {
        el: to.hash,
        top: 60,  // 考虑固定头部
        behavior: 'smooth'
      }
    }
    
    // 3. 新页面：滚动到顶部
    return { top: 0 }
  }
})
```

**异步滚动：**
```javascript
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    // 等待页面渲染完成
    setTimeout(() => {
      if (savedPosition) {
        resolve(savedPosition)
      } else {
        resolve({ top: 0 })
      }
    }, 300)
  })
}
```

**根据场景定制：**
```javascript
scrollBehavior(to, from, savedPosition) {
  // 场景 1：前进/后退 → 恢复位置
  if (savedPosition) {
    return savedPosition
  }
  
  // 场景 2：锚点 → 滚动到锚点
  if (to.hash) {
    return { el: to.hash, behavior: 'smooth' }
  }
  
  // 场景 3：相同路径不同参数 → 保持位置
  if (to.path === from.path) {
    return false  // 不滚动
  }
  
  // 场景 4：其他 → 滚动到顶部
  return { top: 0 }
}
```

**列表页优化：**
```javascript
// 保存列表滚动位置
const listPositions = new Map()

router.beforeEach((to, from) => {
  if (from.name === 'List') {
    listPositions.set(from.fullPath, window.scrollY)
  }
})

scrollBehavior(to, from, savedPosition) {
  // 列表页恢复位置
  if (to.name === 'List') {
    const savedY = listPositions.get(to.fullPath)
    if (savedY) {
      return { top: savedY }
    }
  }
  
  return savedPosition || { top: 0 }
}
```

**移动端优化：**
```javascript
scrollBehavior(to, from, savedPosition) {
  const isMobile = /mobile/i.test(navigator.userAgent)
  
  // 移动端禁用平滑滚动（性能考虑）
  const behavior = isMobile ? 'auto' : 'smooth'
  
  if (savedPosition) {
    return { ...savedPosition, behavior }
  }
  
  return { top: 0, behavior }
}
```

---

## 总结

以上 20 道面试题覆盖了 Vue Router 的核心知识点：

**基础部分（1-5）：**
- 路由原理和模式
- 版本差异
- 懒加载
- 导航守卫
- 参数传递

**核心功能（6-10）：**
- 组件复用问题
- 路由元信息
- 权限控制
- 常见错误处理

**高级特性（11-15）：**
- 守卫陷阱
- KeepAlive
- 导航方式
- 过渡动画

**工程实践（16-20）：**
- 权限系统
- 嵌套路由
- 性能优化
- 异步数据
- 滚动行为

建议按顺序学习教程内容，结合这些面试题进行复习和巩固。
