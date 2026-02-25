# 第 8 章：编程式导航

## 概述

除了使用 `<router-link>` 创建声明式导航，Vue Router 还提供了编程式导航 API，允许在 JavaScript 代码中控制路由跳转。这对于需要在业务逻辑中进行导航的场景非常有用。

## $router.push 详解

`router.push` 是最常用的编程式导航方法，用于跳转到新路由并添加历史记录。

### 基础用法

```javascript
// 1. 字符串路径
this.$router.push('/user/123')

// 2. 对象形式（路径）
this.$router.push({ path: '/user/123' })

// 3. 命名路由（推荐）
this.$router.push({ name: 'User', params: { id: 123 } })

// 4. 带查询参数
this.$router.push({ path: '/search', query: { q: 'vue' } })
// 结果：/search?q=vue

// 5. 带 hash
this.$router.push({ path: '/docs', hash: '#introduction' })
// 结果：/docs#introduction

// 6. 组合使用
this.$router.push({
  name: 'User',
  params: { id: 123 },
  query: { tab: 'posts' },
  hash: '#comments'
})
// 结果：/user/123?tab=posts#comments
```

### 路径 vs 命名路由的陷阱

```javascript
// ❌ 错误：path 会忽略 params
this.$router.push({ path: '/user', params: { id: 123 } })
// 结果：/user（params 被忽略！）

// ✅ 正确：使用 name 时才能用 params
this.$router.push({ name: 'User', params: { id: 123 } })
// 结果：/user/123

// ✅ 正确：path 配合 query
this.$router.push({ path: '/user', query: { id: 123 } })
// 结果：/user?id=123

// ✅ 正确：path 中手动拼接参数
this.$router.push({ path: `/user/${id}` })
// 结果：/user/123
```

### Composition API 用法

```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToUser = (id) => {
  router.push({ name: 'User', params: { id } })
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <button @click="navigateToUser(123)">查看用户</button>
  <button @click="goBack">返回</button>
</template>
```

### 返回 Promise（Vue Router 4.x）

```javascript
// 导航成功
router.push('/home').then(() => {
  console.log('导航成功')
})

// 导航失败
router.push('/admin').catch(error => {
  if (error.type === NavigationFailureType.aborted) {
    console.log('导航被守卫取消')
  }
})

// async/await
async function navigate() {
  try {
    await router.push('/dashboard')
    console.log('导航完成')
  } catch (error) {
    console.log('导航失败', error)
  }
}
```

## $router.replace vs push

### 区别对比

| 特性 | push | replace |
|------|------|---------|
| **历史记录** | 添加新记录 | 替换当前记录 |
| **后退行为** | 可回到上一页 | 回到上上页 |
| **适用场景** | 正常页面跳转 | 重定向、登录跳转 |

### 使用示例

```javascript
// push：添加历史记录
this.$router.push('/user/123')
// 历史栈：[/, /user/123]
// 点击后退 → 回到 /

// replace：替换历史记录
this.$router.replace('/login')
// 假设当前在 /dashboard
// 历史栈：[/, /dashboard] → [/, /login]
// 点击后退 → 回到 /（不是 /dashboard）
```

### 实际应用场景

```javascript
// 场景 1：登录成功后跳转（使用 replace）
async function login() {
  const success = await authService.login(username, password)
  if (success) {
    // 使用 replace，防止用户后退回到登录页
    this.$router.replace('/dashboard')
  }
}

// 场景 2：重定向（使用 replace）
if (!hasPermission) {
  this.$router.replace('/403')
}

// 场景 3：正常页面跳转（使用 push）
function viewUserProfile(id) {
  this.$router.push({ name: 'UserProfile', params: { id } })
}

// 场景 4：表单提交成功后跳转（使用 replace）
async function submitForm() {
  await api.createPost(formData)
  // 提交成功后跳转，防止用户后退重复提交
  this.$router.replace({ name: 'PostList' })
}
```

## $router.go / back / forward

### go() - 前进/后退指定步数

```javascript
// 后退 1 步（等同于 back()）
this.$router.go(-1)

// 后退 2 步
this.$router.go(-2)

// 前进 1 步（等同于 forward()）
this.$router.go(1)

// 如果历史记录不够，静默失败
this.$router.go(-100)  // 没有效果
```

### back() - 后退

```javascript
// 后退一页
this.$router.back()

// 等价于
this.$router.go(-1)
// 等价于
window.history.back()
```

### forward() - 前进

```javascript
// 前进一页
this.$router.forward()

// 等价于
this.$router.go(1)
// 等价于
window.history.forward()
```

### 实际应用

```vue
<template>
  <div class="page">
    <header>
      <button @click="$router.back()" :disabled="!canGoBack">
        ← 返回
      </button>
      <h1>{{ title }}</h1>
    </header>
    
    <main>
      <!-- 内容 -->
    </main>
  </div>
</template>

<script>
export default {
  computed: {
    canGoBack() {
      // 判断是否可以后退
      return window.history.length > 1
    }
  }
}
</script>
```

## 导航参数传递

### 1. params 传参

```javascript
// 定义路由
{
  path: '/user/:id',
  name: 'User',
  component: User
}

// 传参
this.$router.push({ 
  name: 'User', 
  params: { id: 123 } 
})

// 接收
this.$route.params.id  // 123
```

**注意：** params 参数会显示在 URL 中，刷新页面后仍然存在。

### 2. query 传参

```javascript
// 传参
this.$router.push({ 
  path: '/search', 
  query: { 
    q: 'vue router',
    page: 1,
    sort: 'date'
  } 
})
// URL: /search?q=vue%20router&page=1&sort=date

// 接收
this.$route.query.q      // 'vue router'
this.$route.query.page   // '1'（注意是字符串）
this.$route.query.sort   // 'date'
```

**类型转换：**

```javascript
// query 参数都是字符串
this.$route.query.page   // '1'（字符串）

// 需要手动转换
const page = Number(this.$route.query.page) || 1
const isActive = this.$route.query.active === 'true'
```

### 3. state 传参（HTML5 History API）

```javascript
// 传参（不会显示在 URL 中）
this.$router.push({ 
  name: 'User', 
  params: { id: 123 },
  state: { 
    from: 'search-results',
    query: 'vue developer'
  } 
})

// 接收
this.$route.meta.state  // Vue Router 4.x
window.history.state    // 原生 API
```

**特点：**
- 不显示在 URL 中
- 刷新页面后**丢失**
- 适合传递敏感或临时数据

### 4. props 解耦（推荐）

```javascript
// 路由配置
{
  path: '/user/:id',
  component: User,
  props: route => ({
    id: route.params.id,
    page: Number(route.query.page) || 1
  })
}

// 组件接收
export default {
  props: ['id', 'page'],
  
  mounted() {
    console.log(this.id, this.page)
    // 无需访问 $route
  }
}
```

## 导航失败处理（Vue Router 4.x）

### 导航失败类型

```javascript
import { NavigationFailureType, isNavigationFailure } from 'vue-router'

router.push('/admin').catch(failure => {
  if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
    // 导航被守卫取消
    console.log('导航被取消')
  }
  
  if (isNavigationFailure(failure, NavigationFailureType.cancelled)) {
    // 新导航打断了旧导航
    console.log('导航被打断')
  }
  
  if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
    // 导航到当前位置
    console.log('重复导航')
  }
})
```

### 实际应用

```javascript
async function navigateToPage(path) {
  try {
    await router.push(path)
    // 导航成功
  } catch (error) {
    if (isNavigationFailure(error, NavigationFailureType.aborted)) {
      // 被导航守卫拦截，可能需要登录
      Message.warning('请先登录')
    } else if (isNavigationFailure(error, NavigationFailureType.duplicated)) {
      // 已经在当前页面，忽略
    } else {
      // 其他错误
      console.error('导航失败', error)
    }
  }
}
```

### 全局错误处理

```javascript
// Vue Router 3.x 需要全局捕获
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      throw err
    }
  })
}

// Vue Router 4.x 默认已处理，不会抛出错误
```

## 关键点总结

1. **push vs replace**：push 添加历史，replace 替换历史
2. **params vs query**：params 需要命名路由，query 适用于任何路由
3. **导航方法**：push、replace、go、back、forward
4. **返回 Promise**：Vue Router 4.x 支持 async/await
5. **导航失败**：4.x 提供了完善的失败处理机制

## 深入一点：导航的完整流程

```javascript
// 1. 触发导航
router.push('/user/123')

// 2. 导航守卫执行
beforeEach → beforeEnter → beforeRouteEnter

// 3. 解析异步组件

// 4. 调用 beforeRouteEnter 守卫

// 5. 确认导航

// 6. 调用 afterEach 钩子

// 7. 触发 DOM 更新

// 8. 调用 beforeRouteEnter 的 next 回调
beforeRouteEnter(to, from, next) {
  next(vm => {
    // 此时组件实例已创建
    console.log(vm)
  })
}
```

## 参考资料

- [Vue Router - 编程式导航](https://router.vuejs.org/zh/guide/essentials/navigation.html)
- [Vue Router - 导航故障](https://router.vuejs.org/zh/guide/advanced/navigation-failures.html)
- [MDN - History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API)
