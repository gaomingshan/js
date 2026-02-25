# 第 11 章：全局导航守卫

## 概述

导航守卫是 Vue Router 最强大的功能之一，允许我们在路由跳转前后执行自定义逻辑。全局导航守卫作用于所有路由，是实现权限控制、登录验证、页面埋点等功能的基础。

## beforeEach 全局前置守卫

### 基础用法

```javascript
router.beforeEach((to, from) => {
  // 返回 false 取消导航
  // 返回路由对象重定向
  // 返回 undefined 或 true 继续导航
})
```

### 参数说明

```javascript
router.beforeEach((to, from, next) => {
  console.log('to:', to)      // 目标路由对象
  console.log('from:', from)  // 来源路由对象
  console.log('next:', next)  // 可选，Vue Router 3.x 必须调用
})

// to 和 from 路由对象包含：
{
  path: '/user/123',
  name: 'User',
  params: { id: '123' },
  query: { tab: 'posts' },
  hash: '#comments',
  fullPath: '/user/123?tab=posts#comments',
  matched: [...],      // 匹配的路由记录
  meta: { ... }        // 路由元信息
}
```

### Vue Router 4.x 写法（推荐）

```javascript
router.beforeEach((to, from) => {
  // 1. 返回 false：取消导航
  if (needCancel) {
    return false
  }
  
  // 2. 返回路由对象：重定向
  if (!isAuthenticated && to.meta.requiresAuth) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  
  // 3. 返回 undefined 或 true：继续导航
  return true
  // 或者什么都不返回（默认继续）
})
```

### Vue Router 3.x 写法（兼容）

```javascript
router.beforeEach((to, from, next) => {
  // 必须调用 next()
  
  // 1. 取消导航
  if (needCancel) {
    next(false)
    return
  }
  
  // 2. 重定向
  if (!isAuthenticated && to.meta.requiresAuth) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // 3. 继续导航
  next()
})
```

## beforeResolve 全局解析守卫

### 执行时机

`beforeResolve` 在导航被确认之前、所有组件内守卫和异步路由组件被解析之后调用。

```javascript
router.beforeResolve((to, from) => {
  // 此时已经解析了所有异步组件
  // 可以确保能访问到所有组件
  console.log('所有守卫和异步组件都已解析')
})
```

### 使用场景

```javascript
// 场景 1：获取数据前的最后检查
router.beforeResolve(async (to, from) => {
  // 确保所有路由组件都已加载
  if (to.meta.requiresData) {
    try {
      await fetchRouteData(to)
    } catch (error) {
      return { name: 'Error', params: { error } }
    }
  }
})

// 场景 2：页面访问统计
router.beforeResolve((to, from) => {
  // 确保导航会成功再统计
  if (to.name) {
    analytics.track('page_view', {
      path: to.path,
      name: to.name
    })
  }
})
```

## afterEach 全局后置守卫

### 基础用法

```javascript
router.afterEach((to, from) => {
  // 导航已经完成
  // 没有 next 参数
  // 不能改变导航
})
```

### 使用场景

```javascript
// 场景 1：页面标题设置
router.afterEach((to, from) => {
  document.title = to.meta.title || '默认标题'
})

// 场景 2：页面加载进度条
import NProgress from 'nprogress'

router.beforeEach(() => {
  NProgress.start()  // 开始进度条
})

router.afterEach(() => {
  NProgress.done()   // 结束进度条
})

// 场景 3：页面埋点
router.afterEach((to, from) => {
  // 记录页面访问
  analytics.track('page_view', {
    from: from.fullPath,
    to: to.fullPath,
    timestamp: Date.now()
  })
})

// 场景 4：重置滚动位置
router.afterEach((to, from) => {
  if (!to.hash) {
    window.scrollTo(0, 0)
  }
})
```

### 失败回调（Vue Router 4.x）

```javascript
router.afterEach((to, from, failure) => {
  if (failure) {
    console.log('导航失败:', failure)
    
    if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
      console.log('导航被守卫取消')
    }
  } else {
    console.log('导航成功')
  }
})
```

## 守卫的执行顺序

### 完整流程

```javascript
// 从 /user/1 导航到 /user/2

1. 导航触发
2. 在失活组件中调用 beforeRouteLeave
3. 调用全局 beforeEach 守卫
4. 在重用组件中调用 beforeRouteUpdate
5. 调用路由配置中的 beforeEnter
6. 解析异步路由组件
7. 在激活组件中调用 beforeRouteEnter
8. 调用全局 beforeResolve 守卫
9. 导航被确认
10. 调用全局 afterEach 钩子
11. 触发 DOM 更新
12. 调用 beforeRouteEnter 中 next 的回调函数
```

### 示例代码

```javascript
// 全局守卫
router.beforeEach((to, from) => {
  console.log('1. 全局 beforeEach')
})

router.beforeResolve((to, from) => {
  console.log('2. 全局 beforeResolve')
})

router.afterEach((to, from) => {
  console.log('3. 全局 afterEach')
})

// 路由配置
{
  path: '/user/:id',
  component: User,
  beforeEnter: (to, from) => {
    console.log('路由独享 beforeEnter')
  }
}

// 组件内守卫
export default {
  beforeRouteEnter(to, from) {
    console.log('组件 beforeRouteEnter')
  },
  beforeRouteUpdate(to, from) {
    console.log('组件 beforeRouteUpdate')
  },
  beforeRouteLeave(to, from) {
    console.log('组件 beforeRouteLeave')
  }
}
```

## 实战：权限验证与登录拦截

### 基础权限控制

```javascript
// router/index.js
const router = createRouter({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
      meta: { 
        requiresAuth: true,
        roles: ['admin']
      }
    }
  ]
})

// 权限验证
router.beforeEach((to, from) => {
  // 1. 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    
    if (!token) {
      // 未登录，跳转到登录页
      return {
        name: 'Login',
        query: { redirect: to.fullPath }  // 保存目标路径
      }
    }
  }
  
  // 2. 检查角色权限
  if (to.meta.roles) {
    const userRole = getUserRole()
    
    if (!to.meta.roles.includes(userRole)) {
      // 无权限
      return { name: 'Forbidden' }
    }
  }
})
```

### 异步权限验证

```javascript
import { useUserStore } from '@/stores/user'

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  
  // 白名单：不需要验证的页面
  const whiteList = ['Login', 'Register', 'ForgotPassword']
  if (whiteList.includes(to.name)) {
    return true
  }
  
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath }
    }
  }
  
  // 获取用户信息（如果还没有）
  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      // 获取用户信息失败，可能 token 过期
      userStore.logout()
      return { name: 'Login' }
    }
  }
  
  // 检查页面权限
  if (to.meta.permission) {
    const hasPermission = userStore.hasPermission(to.meta.permission)
    if (!hasPermission) {
      return { name: 'Forbidden' }
    }
  }
})
```

### 动态路由权限

```javascript
import { useUserStore } from '@/stores/user'
import { useRouterStore } from '@/stores/router'

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  const routerStore = useRouterStore()
  
  if (userStore.token) {
    if (!routerStore.routesGenerated) {
      try {
        // 获取用户权限
        await userStore.fetchUserInfo()
        
        // 根据权限生成路由
        const accessRoutes = await routerStore.generateRoutes(userStore.roles)
        
        // 动态添加路由
        accessRoutes.forEach(route => {
          router.addRoute(route)
        })
        
        // 重新导航到目标路由
        return { ...to, replace: true }
      } catch (error) {
        return { name: 'Login' }
      }
    }
  } else {
    return { name: 'Login' }
  }
})
```

### 登录成功后跳转

```vue
<!-- Login.vue -->
<script>
export default {
  methods: {
    async login() {
      const success = await this.submitLogin()
      
      if (success) {
        // 获取重定向路径
        const redirect = this.$route.query.redirect || '/'
        
        // 跳转
        this.$router.replace(redirect)
      }
    }
  }
}
</script>
```

## 关键点总结

1. **beforeEach**：全局前置守卫，最常用，适合权限验证
2. **beforeResolve**：在导航确认前、异步组件解析后调用
3. **afterEach**：导航完成后调用，不能改变导航
4. **执行顺序**：beforeEach → beforeEnter → beforeRouteEnter → beforeResolve → afterEach
5. **返回值**：false 取消导航，路由对象重定向，undefined/true 继续

## 深入一点：守卫中的异步操作

```javascript
// ✅ 正确：async/await
router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    const isValid = await validateToken()
    
    if (!isValid) {
      return { name: 'Login' }
    }
  }
})

// ✅ 正确：Promise
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth) {
    return validateToken().then(isValid => {
      if (!isValid) {
        return { name: 'Login' }
      }
    })
  }
})

// ❌ 错误：忘记等待异步操作
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth) {
    validateToken().then(isValid => {
      if (!isValid) {
        return { name: 'Login' }  // 这里的 return 不会生效！
      }
    })
  }
  // 守卫已经返回 undefined，继续导航
})
```

## 参考资料

- [Vue Router - 导航守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)
- [Vue Router - 完整的导航解析流程](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E5%AE%8C%E6%95%B4%E7%9A%84%E5%AF%BC%E8%88%AA%E8%A7%A3%E6%9E%90%E6%B5%81%E7%A8%8B)
