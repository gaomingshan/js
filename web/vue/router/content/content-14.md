# 第 14 章：导航守卫完整流程

## 概述

理解导航守卫的完整执行流程，是正确使用守卫、避免踩坑的关键。本章将深入讲解导航解析流程、守卫的执行时机，以及常见陷阱。

## 完整的导航解析流程

### 详细步骤

```javascript
// 假设从 /user/1 导航到 /about

1. 导航被触发
   router.push('/about')

2. 在失活的组件里调用 beforeRouteLeave 守卫
   User.beforeRouteLeave(to, from)

3. 调用全局的 beforeEach 守卫
   router.beforeEach(to, from)

4. 在重用的组件里调用 beforeRouteUpdate 守卫
   （如果没有重用组件则跳过）

5. 在路由配置里调用 beforeEnter
   routes[0].beforeEnter(to, from)

6. 解析异步路由组件
   const About = await import('./About.vue')

7. 在被激活的组件里调用 beforeRouteEnter
   About.beforeRouteEnter(to, from, next)

8. 调用全局的 beforeResolve 守卫
   router.beforeResolve(to, from)

9. 导航被确认

10. 调用全局的 afterEach 钩子
    router.afterEach(to, from)

11. 触发 DOM 更新
    Vue 组件渲染

12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数
    next(vm => { ... })
```

### 可视化流程图

```
触发导航
   ↓
失活组件 beforeRouteLeave
   ↓
全局 beforeEach
   ↓
重用组件 beforeRouteUpdate
   ↓
路由配置 beforeEnter
   ↓
解析异步组件
   ↓
激活组件 beforeRouteEnter
   ↓
全局 beforeResolve
   ↓
导航确认
   ↓
全局 afterEach
   ↓
DOM 更新
   ↓
beforeRouteEnter 的 next 回调
```

## 守卫的执行时机

### 场景 1：首次进入应用

```javascript
// 访问 http://example.com/about

执行顺序：
1. 全局 beforeEach
2. 路由 beforeEnter
3. 解析异步组件
4. 组件 beforeRouteEnter
5. 全局 beforeResolve
6. 导航确认
7. 全局 afterEach
8. 创建组件实例
9. beforeRouteEnter 的 next 回调
```

### 场景 2：组件复用

```javascript
// 从 /user/1 到 /user/2（User 组件被复用）

执行顺序：
1. 全局 beforeEach
2. 组件 beforeRouteUpdate  ← 关键：只触发 Update
3. 全局 beforeResolve
4. 导航确认
5. 全局 afterEach
```

### 场景 3：嵌套路由切换

```javascript
// 从 /user/1/posts 到 /user/1/settings

路由配置：
{
  path: '/user/:id',
  component: User,
  children: [
    { path: 'posts', component: Posts },
    { path: 'settings', component: Settings }
  ]
}

执行顺序：
1. Posts.beforeRouteLeave
2. 全局 beforeEach
3. User.beforeRouteUpdate  ← User 组件被复用
4. 路由 beforeEnter（如果 settings 有）
5. Settings.beforeRouteEnter
6. 全局 beforeResolve
7. 全局 afterEach
```

### 场景 4：导航被取消

```javascript
router.beforeEach((to, from) => {
  if (to.path === '/admin' && !isAdmin) {
    return false  // 取消导航
  }
})

结果：
1. 全局 beforeEach 执行
2. 返回 false，导航被取消
3. 不会执行后续守卫
4. 停留在当前页面
```

### 场景 5：导航重定向

```javascript
router.beforeEach((to, from) => {
  if (to.path === '/old-path') {
    return { path: '/new-path' }  // 重定向
  }
})

结果：
1. 第一次导航到 /old-path
2. beforeEach 返回 /new-path
3. 取消第一次导航
4. 开始新的导航到 /new-path
5. 重新执行完整的守卫流程
```

## next 函数的使用（3.x vs 4.x）

### Vue Router 3.x（必须调用 next）

```javascript
router.beforeEach((to, from, next) => {
  // ✅ 正确：调用 next()
  if (isAuthenticated) {
    next()
  } else {
    next('/login')
  }
  
  // ❌ 错误：忘记调用 next()
  if (isAuthenticated) {
    // 导航会卡住！
  }
  
  // ❌ 错误：多次调用 next()
  next()
  next('/home')  // 警告：多次调用 next
})
```

### Vue Router 4.x（推荐使用 return）

```javascript
router.beforeEach((to, from) => {
  // ✅ 推荐：使用 return
  if (!isAuthenticated) {
    return '/login'
  }
  // 不需要显式返回 true
  
  // ✅ 也支持 next()（向后兼容）
  // 但不推荐混用
})
```

### next() 的各种用法

```javascript
router.beforeEach((to, from, next) => {
  // 1. 继续导航
  next()
  next(true)
  
  // 2. 取消导航
  next(false)
  
  // 3. 重定向到其他路由
  next('/login')
  next({ path: '/login' })
  next({ name: 'Login', query: { redirect: to.fullPath } })
  
  // 4. 传递错误（Vue Router 3.x）
  next(new Error('导航失败'))
})
```

### 4.x return 的各种用法

```javascript
router.beforeEach((to, from) => {
  // 1. 继续导航
  return true
  return undefined
  // 或者不返回任何值
  
  // 2. 取消导航
  return false
  
  // 3. 重定向到其他路由
  return '/login'
  return { path: '/login' }
  return { name: 'Login', query: { redirect: to.fullPath } }
  
  // 4. 抛出错误
  throw new Error('导航失败')
})
```

## 常见陷阱与解决方案

### 陷阱 1：beforeEach 中的无限循环

```javascript
// ❌ 错误：导致无限循环
router.beforeEach((to, from) => {
  if (!isAuthenticated) {
    return '/login'  // 访问 /login 又会触发 beforeEach
  }
})

// ✅ 正确：检查目标路由
router.beforeEach((to, from) => {
  if (!isAuthenticated && to.path !== '/login') {
    return '/login'
  }
})

// ✅ 更好：使用白名单
const whiteList = ['/login', '/register', '/forgot-password']

router.beforeEach((to, from) => {
  if (!isAuthenticated && !whiteList.includes(to.path)) {
    return '/login'
  }
})
```

### 陷阱 2：异步守卫未等待

```javascript
// ❌ 错误：未等待异步操作
router.beforeEach((to, from) => {
  if (needsAuth) {
    validateToken().then(isValid => {
      if (!isValid) {
        return '/login'  // 这里的 return 不会生效！
      }
    })
  }
  // 守卫已经返回，导航继续
})

// ✅ 正确：使用 async/await
router.beforeEach(async (to, from) => {
  if (needsAuth) {
    const isValid = await validateToken()
    if (!isValid) {
      return '/login'
    }
  }
})

// ✅ 正确：返回 Promise
router.beforeEach((to, from) => {
  if (needsAuth) {
    return validateToken().then(isValid => {
      if (!isValid) {
        return '/login'
      }
    })
  }
})
```

### 陷阱 3：next() 在 3.x 中未调用

```javascript
// Vue Router 3.x

// ❌ 错误：条件分支中忘记 next()
router.beforeEach((to, from, next) => {
  if (isAuthenticated) {
    next()
  }
  // else 分支忘记调用 next()，导航卡住！
})

// ✅ 正确：确保所有分支都调用 next()
router.beforeEach((to, from, next) => {
  if (isAuthenticated) {
    next()
  } else {
    next('/login')
  }
})

// ✅ 更好：提前返回
router.beforeEach((to, from, next) => {
  if (!isAuthenticated) {
    next('/login')
    return
  }
  next()
})
```

### 陷阱 4：beforeRouteEnter 访问 this

```javascript
// ❌ 错误：直接访问 this
export default {
  beforeRouteEnter(to, from, next) {
    console.log(this.someData)  // undefined
    this.loadData()  // 报错
  }
}

// ✅ 正确：使用 next 回调
export default {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      console.log(vm.someData)  // 可以访问
      vm.loadData()  // 正确
    })
  }
}
```

### 陷阱 5：重复导航警告

```javascript
// ❌ 导致警告
router.push('/home')
router.push('/home')  // 警告：重复导航

// ✅ 解决方案1：捕获错误
router.push('/home').catch(err => {
  if (!isNavigationFailure(err, NavigationFailureType.duplicated)) {
    throw err
  }
})

// ✅ 解决方案2：先检查
if (router.currentRoute.value.path !== '/home') {
  router.push('/home')
}
```

### 陷阱 6：守卫中修改 to 对象

```javascript
// ❌ 错误：to 是只读的
router.beforeEach((to, from) => {
  to.params.id = 123  // 无效！
  to.query.page = 1   // 无效！
})

// ✅ 正确：返回新的路由对象
router.beforeEach((to, from) => {
  return {
    ...to,
    query: {
      ...to.query,
      page: 1
    }
  }
})
```

## 守卫的最佳实践

### 1. 职责分离

```javascript
// ✅ 全局守卫：通用逻辑
router.beforeEach((to, from) => {
  // 1. 页面标题
  document.title = to.meta.title || '默认标题'
  
  // 2. 通用权限检查
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return '/login'
  }
  
  // 3. 页面访问统计
  trackPageView(to)
})

// ✅ 路由守卫：路由特定逻辑
{
  path: '/admin',
  beforeEnter: requireAdmin
}

// ✅ 组件守卫：组件特定逻辑
export default {
  beforeRouteLeave(to, from) {
    if (this.hasUnsavedChanges) {
      return confirm('有未保存的更改，确定离开？')
    }
  }
}
```

### 2. 守卫的组合

```javascript
// 创建可组合的守卫
function composeGuards(...guards) {
  return async (to, from) => {
    for (const guard of guards) {
      const result = await guard(to, from)
      if (result !== undefined && result !== true) {
        return result
      }
    }
  }
}

// 使用
router.beforeEach(composeGuards(
  checkAuth,
  checkPermissions,
  trackPageView
))
```

### 3. 错误处理

```javascript
router.beforeEach(async (to, from) => {
  try {
    await checkAuthStatus()
    await loadUserPermissions()
  } catch (error) {
    console.error('导航守卫错误:', error)
    return {
      name: 'Error',
      params: { error: error.message }
    }
  }
})

// 全局错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 上报错误监控
  trackError(error)
})
```

## 关键点总结

1. **执行顺序**：beforeRouteLeave → beforeEach → beforeRouteUpdate → beforeEnter → beforeRouteEnter → beforeResolve → afterEach
2. **next 函数**：3.x 必须调用，4.x 推荐使用 return
3. **常见陷阱**：无限循环、异步未等待、忘记调用 next
4. **最佳实践**：职责分离、守卫组合、完善错误处理
5. **调试技巧**：在每个守卫中打印日志，观察执行流程

## 深入一点：守卫的性能优化

```javascript
// ❌ 性能问题：每次导航都请求数据
router.beforeEach(async (to, from) => {
  const user = await fetchUser()
  const permissions = await fetchPermissions()
  // ...
})

// ✅ 优化：缓存数据
let userCache = null
let permissionsCache = null

router.beforeEach(async (to, from) => {
  if (!userCache) {
    userCache = await fetchUser()
  }
  if (!permissionsCache) {
    permissionsCache = await fetchPermissions()
  }
  // ...
})

// ✅ 更好：使用状态管理
import { useUserStore } from '@/stores/user'

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  
  if (!userStore.user) {
    await userStore.fetchUser()
  }
  // ...
})
```

## 参考资料

- [Vue Router - 完整的导航解析流程](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E5%AE%8C%E6%95%B4%E7%9A%84%E5%AF%BC%E8%88%AA%E8%A7%A3%E6%9E%90%E6%B5%81%E7%A8%8B)
- [Vue Router 3 → 4 迁移指南](https://router.vuejs.org/zh/guide/migration/)
