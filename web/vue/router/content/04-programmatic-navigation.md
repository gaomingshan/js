# 第 04 节：编程式导航

## 概述

编程式导航允许在 JavaScript 代码中控制路由跳转，而不仅仅依赖用户点击链接。Vue Router 提供了多种编程式导航方法。

## 一、基础导航方法

### 1.1 router.push()

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

// 字符串路径
router.push('/user/123')

// 对象形式
router.push({ path: '/user/123' })

// 命名路由
router.push({ name: 'User', params: { id: '123' } })

// 带查询参数
router.push({ path: '/search', query: { q: 'vue' } })

// 带 hash
router.push({ path: '/page', hash: '#section1' })
```

### 1.2 router.replace()

```javascript
// replace 不会向历史栈添加记录
// 而是替换当前记录

router.replace('/new-page')

// 等价于
router.push({ path: '/new-page', replace: true })
```

### 1.3 router.go()

```javascript
// 前进一页
router.go(1)
// 等价于 router.forward()

// 后退一页
router.go(-1)
// 等价于 router.back()

// 前进三页
router.go(3)

// 如果记录不够，静默失败
router.go(-100) // 静默失败
```

## 二、导航方法详解

### 2.1 push vs replace

```javascript
// push：添加新的历史记录
router.push('/page1')
router.push('/page2')
router.push('/page3')
// 历史栈：['/page1', '/page2', '/page3']

// replace：替换当前记录
router.push('/page1')
router.push('/page2')
router.replace('/page3')
// 历史栈：['/page1', '/page3']
```

### 2.2 导航选项

```javascript
// 完整的导航选项
router.push({
  name: 'UserProfile',
  params: { id: '123' },
  query: { tab: 'posts' },
  hash: '#comments',
  replace: true,    // 替换而非添加历史记录
  force: true      // 强制导航，即使目标与当前路由相同
})
```

## 三、异步导航

### 3.1 Promise 返回值

```javascript
// router.push() 返回 Promise
try {
  await router.push('/user/123')
  console.log('导航成功')
} catch (error) {
  if (error.type === 'NavigationDuplicated') {
    console.log('导航到相同路由')
  } else {
    console.log('导航失败', error)
  }
}
```

### 3.2 导航错误处理

```javascript
import { NavigationFailureType, isNavigationFailure } from 'vue-router'

try {
  await router.push('/protected-page')
} catch (error) {
  if (isNavigationFailure(error, NavigationFailureType.aborted)) {
    console.log('导航被中止')
  } else if (isNavigationFailure(error, NavigationFailureType.cancelled)) {
    console.log('导航被取消')
  } else if (isNavigationFailure(error, NavigationFailureType.duplicated)) {
    console.log('重复导航')
  }
}
```

### 3.3 导航守卫中的异步处理

```javascript
router.beforeEach(async (to, from) => {
  // 异步验证
  const isAuthenticated = await checkAuth()
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Login' }
  }
})
```

## 四、条件导航

### 4.1 基于状态的导航

```vue
<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const navigateToProfile = () => {
  if (userStore.isLoggedIn) {
    router.push({ name: 'UserProfile', params: { id: userStore.user.id } })
  } else {
    router.push({ name: 'Login', query: { redirect: '/profile' } })
  }
}

const conditionalNavigation = (userRole) => {
  const routeMap = {
    admin: '/admin/dashboard',
    user: '/user/dashboard',
    guest: '/welcome'
  }
  
  const targetRoute = routeMap[userRole] || '/404'
  router.push(targetRoute)
}
</script>
```

### 4.2 表单提交后导航

```vue
<script setup>
const handleSubmit = async () => {
  try {
    const result = await submitForm(formData)
    
    // 成功后导航
    if (result.success) {
      router.push({
        name: 'Success',
        query: { id: result.id }
      })
    } else {
      // 显示错误，不导航
      showError(result.message)
    }
  } catch (error) {
    console.error('提交失败', error)
  }
}
</script>
```

## 五、导航守卫

### 5.1 导航确认

```vue
<script setup>
import { onBeforeRouteLeave } from 'vue-router'

const hasUnsavedChanges = ref(false)

onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('有未保存的更改，确定要离开吗？')
    if (!answer) return false
  }
})

// 或使用现代浏览器 API
const preventNavigation = (e) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', preventNavigation)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', preventNavigation)
})
</script>
```

### 5.2 权限检查

```javascript
// 全局导航守卫
router.beforeEach(async (to, from) => {
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const user = await getCurrentUser()
    if (!user) {
      return {
        name: 'Login',
        query: { redirect: to.fullPath }
      }
    }
  }
  
  // 检查权限
  if (to.meta.roles && to.meta.roles.length > 0) {
    const user = await getCurrentUser()
    if (!user || !to.meta.roles.includes(user.role)) {
      return { name: 'Forbidden' }
    }
  }
})
```

## 六、导航模式

### 6.1 模态框导航

```vue
<script setup>
const showModal = ref(false)

const openModal = (itemId) => {
  // 更新 URL，但不导航到新页面
  router.push({
    query: { ...route.query, modal: itemId }
  })
  showModal.value = true
}

const closeModal = () => {
  // 移除 modal 参数
  const query = { ...route.query }
  delete query.modal
  router.replace({ query })
  showModal.value = false
}

// 监听路由变化
watch(() => route.query.modal, (modalId) => {
  showModal.value = !!modalId
})
</script>
```

### 6.2 标签页导航

```vue
<script setup>
const activeTab = computed({
  get: () => route.query.tab || 'overview',
  set: (tab) => {
    router.replace({
      query: { ...route.query, tab }
    })
  }
})

const switchTab = (tabName) => {
  activeTab.value = tabName
}
</script>

<template>
  <div class="tabs">
    <button 
      v-for="tab in tabs" 
      :key="tab.name"
      :class="{ active: activeTab === tab.name }"
      @click="switchTab(tab.name)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
```

## 七、导航优化

### 7.1 路由缓存

```javascript
// 缓存导航状态
const navigationCache = new Map()

const cachedPush = (to) => {
  const key = JSON.stringify(to)
  
  if (navigationCache.has(key)) {
    // 使用缓存的结果
    return navigationCache.get(key)
  }
  
  const promise = router.push(to)
  navigationCache.set(key, promise)
  
  // 清理过期缓存
  setTimeout(() => {
    navigationCache.delete(key)
  }, 5000)
  
  return promise
}
```

### 7.2 防抖导航

```javascript
import { debounce } from 'lodash-es'

// 防抖导航，避免快速多次点击
const debouncedPush = debounce((to) => {
  router.push(to)
}, 300)

// 节流导航
const throttledPush = throttle((to) => {
  router.push(to)
}, 1000)
```

### 7.3 批量导航

```javascript
// 批量处理导航操作
class NavigationBatch {
  constructor(router) {
    this.router = router
    this.queue = []
    this.processing = false
  }
  
  async add(navigation) {
    this.queue.push(navigation)
    
    if (!this.processing) {
      await this.process()
    }
  }
  
  async process() {
    this.processing = true
    
    while (this.queue.length > 0) {
      const navigation = this.queue.shift()
      try {
        await this.router.push(navigation)
      } catch (error) {
        console.error('导航失败', error)
      }
    }
    
    this.processing = false
  }
}
```

## 八、最佳实践

### 8.1 导航封装

```javascript
// 导航工具类
export class NavigationService {
  constructor(router) {
    this.router = router
  }
  
  // 安全导航：检查路由是否存在
  async safePush(to) {
    try {
      const resolved = this.router.resolve(to)
      if (resolved.matched.length === 0) {
        throw new Error('路由不存在')
      }
      return await this.router.push(to)
    } catch (error) {
      console.error('导航失败', error)
      // 导航到 404 页面
      return await this.router.push('/404')
    }
  }
  
  // 带确认的导航
  async confirmPush(to, message = '确定要离开当前页面吗？') {
    if (window.confirm(message)) {
      return await this.router.push(to)
    }
  }
  
  // 返回上一页或指定页面
  backOr(fallback = '/') {
    if (window.history.length > 1) {
      this.router.back()
    } else {
      this.router.push(fallback)
    }
  }
}
```

### 8.2 错误处理

```vue
<script setup>
import { onErrorCaptured } from 'vue'

// 捕获导航错误
onErrorCaptured((error) => {
  if (error.name === 'NavigationFailure') {
    // 处理导航失败
    console.log('导航失败', error)
    return false // 阻止错误继续传播
  }
})

const handleNavigationError = (error) => {
  // 记录错误日志
  console.error('Navigation Error:', error)
  
  // 显示用户友好的错误信息
  showNotification('页面跳转失败，请重试')
  
  // 可选：导航到错误页面
  router.push('/error')
}
</script>
```

## 九、总结

| 方法 | 作用 | 历史记录 |
|------|------|----------|
| push() | 导航到新页面 | 添加记录 |
| replace() | 替换当前页面 | 替换记录 |
| go() | 历史记录导航 | 不改变 |
| back() | 后退一页 | 不改变 |
| forward() | 前进一页 | 不改变 |

## 参考资料

- [编程式导航](https://router.vuejs.org/guide/essentials/navigation.html)
- [导航故障](https://router.vuejs.org/guide/advanced/navigation-failures.html)

---

**下一节** → [第 05 节：路由参数](./05-route-params.md)
