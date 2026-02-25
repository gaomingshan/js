# 导航守卫

> 导航守卫用于控制路由跳转，实现权限验证、数据预取等功能。

## 核心概念

导航守卫主要用于通过跳转或取消的方式守卫导航。

### 守卫类型

1. **全局守卫**：应用于所有路由
2. **路由独享守卫**：应用于特定路由
3. **组件内守卫**：应用于组件内部

---

## 全局守卫

### 全局前置守卫

```typescript
// router/index.ts
const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // to: 即将进入的路由
  // from: 当前导航正要离开的路由
  // next: 必须调用以 resolve 钩子
  
  console.log('导航到:', to.path)
  console.log('来自:', from.path)
  
  next() // 继续导航
})

// 返回值方式（推荐）
router.beforeEach((to, from) => {
  // 返回 false 取消导航
  if (!isAuthenticated) {
    return false
  }
  
  // 返回路由地址重定向
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'Login' }
  }
  
  // 返回 true 或不返回，继续导航
  return true
})
```

### 全局解析守卫

在导航被确认之前、所有组件内守卫和异步路由组件被解析之后调用。

```typescript
router.beforeResolve((to, from) => {
  if (to.meta.requiresCamera) {
    return navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => true)
      .catch(() => false)
  }
})
```

### 全局后置钩子

导航确认后调用，不接受 `next` 函数。

```typescript
router.afterEach((to, from, failure) => {
  // 修改页面标题
  document.title = to.meta.title || 'My App'
  
  // 发送页面浏览统计
  sendToAnalytics(to.path)
  
  // 关闭加载指示器
  hideLoadingIndicator()
})
```

---

## 路由独享守卫

```typescript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from) => {
      // 只在进入该路由时触发
      if (!isAdmin()) {
        return { name: 'Home' }
      }
    }
  },
  {
    path: '/users/:id',
    component: User,
    beforeEnter: [checkAuth, loadUserData]
  }
]

function checkAuth(to, from) {
  if (!isAuthenticated()) {
    return '/login'
  }
}

async function loadUserData(to, from) {
  const user = await fetchUser(to.params.id)
  if (!user) {
    return { name: 'NotFound' }
  }
}
```

---

## 组件内守卫

### beforeRouteEnter

在渲染该组件的对应路由被验证前调用，**不能访问 `this`**。

```vue
<script setup>
import { onBeforeRouteEnter } from 'vue-router'

onBeforeRouteEnter((to, from) => {
  // 此时组件实例还未创建，不能访问 this
  console.log('进入路由前')
  
  // 可以通过返回函数访问组件实例
  return (vm) => {
    // vm 是组件实例
    vm.loadData()
  }
})
</script>
```

### beforeRouteUpdate

在当前路由改变，但该组件被复用时调用。

```vue
<script setup>
import { onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteUpdate((to, from) => {
  // 例如：/user/1 -> /user/2
  console.log('路由参数变化:', to.params.id)
  
  // 重新获取数据
  fetchUser(to.params.id)
})
</script>
```

### beforeRouteLeave

在导航离开渲染该组件的对应路由时调用。

```vue
<script setup>
import { onBeforeRouteLeave } from 'vue-router'

const hasUnsavedChanges = ref(false)

onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('有未保存的更改，确定要离开吗？')
    if (!answer) {
      return false
    }
  }
})
</script>
```

---

## 导航流程

完整的导航解析流程：

```
1. 导航被触发
2. 在失活的组件里调用 beforeRouteLeave 守卫
3. 调用全局的 beforeEach 守卫
4. 在重用的组件里调用 beforeRouteUpdate 守卫
5. 在路由配置里调用 beforeEnter
6. 解析异步路由组件
7. 在被激活的组件里调用 beforeRouteEnter
8. 调用全局的 beforeResolve 守卫
9. 导航被确认
10. 调用全局的 afterEach 钩子
11. 触发 DOM 更新
12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数
```

---

## 权限控制

### 基于角色的访问控制

```typescript
// router/index.ts
import { useUserStore } from '@/stores/user'

router.beforeEach((to, from) => {
  const userStore = useUserStore()
  
  // 需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath }
    }
  }
  
  // 需要特定角色
  if (to.meta.roles) {
    const hasRole = to.meta.roles.some(role => 
      userStore.roles.includes(role)
    )
    
    if (!hasRole) {
      return { name: 'Forbidden' }
    }
  }
  
  return true
})
```

### 路由元信息配置

```typescript
const routes = [
  {
    path: '/public',
    component: Public,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      roles: ['admin']
    }
  }
]
```

---

## 数据预取

### 在守卫中预取数据

```typescript
router.beforeEach(async (to, from) => {
  if (to.meta.preload) {
    try {
      // 显示加载指示器
      showLoading()
      
      // 预取数据
      const data = await fetchData(to.params.id)
      
      // 将数据存储到 store 或通过 props 传递
      to.meta.data = data
      
      return true
    } catch (error) {
      return { name: 'Error', params: { error } }
    } finally {
      hideLoading()
    }
  }
})
```

### 在组件中预取

```vue
<script setup>
import { onBeforeRouteUpdate } from 'vue-router'

const route = useRoute()
const data = ref(null)
const loading = ref(false)

async function fetchData(id: string) {
  loading.value = true
  try {
    data.value = await api.getData(id)
  } finally {
    loading.value = false
  }
}

// 首次加载
onMounted(() => {
  fetchData(route.params.id)
})

// 路由参数变化时重新加载
onBeforeRouteUpdate((to, from) => {
  if (to.params.id !== from.params.id) {
    fetchData(to.params.id)
  }
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>{{ data }}</div>
</template>
```

---

## 实战示例

### 示例 1：完整的权限系统

```typescript
// router/guards.ts
import { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

export function setupGuards(router: Router) {
  // 登录验证
  router.beforeEach((to, from) => {
    const userStore = useUserStore()
    const publicPages = ['/login', '/register', '/forgot-password']
    const authRequired = !publicPages.includes(to.path)
    
    if (authRequired && !userStore.isLoggedIn) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      }
    }
  })
  
  // 权限验证
  router.beforeEach((to, from) => {
    const userStore = useUserStore()
    
    if (to.meta.roles) {
      const hasPermission = (to.meta.roles as string[]).some(role =>
        userStore.roles.includes(role)
      )
      
      if (!hasPermission) {
        return { name: 'Forbidden' }
      }
    }
  })
  
  // 页面标题
  router.afterEach((to) => {
    const appStore = useAppStore()
    document.title = to.meta.title 
      ? `${to.meta.title} - ${appStore.appName}`
      : appStore.appName
  })
  
  // 加载进度条
  router.beforeEach(() => {
    const appStore = useAppStore()
    appStore.startLoading()
  })
  
  router.afterEach(() => {
    const appStore = useAppStore()
    appStore.stopLoading()
  })
  
  // 页面浏览统计
  router.afterEach((to) => {
    if (import.meta.env.PROD) {
      // 发送统计
      gtag('event', 'page_view', {
        page_path: to.path,
        page_title: to.meta.title
      })
    }
  })
}
```

### 示例 2：表单未保存提示

```vue
<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'

const form = reactive({
  name: '',
  email: ''
})

const initialForm = ref({...form})
const isDirty = computed(() => {
  return JSON.stringify(form) !== JSON.stringify(initialForm.value)
})

onBeforeRouteLeave((to, from) => {
  if (isDirty.value) {
    const answer = window.confirm(
      '表单有未保存的更改，确定要离开吗？'
    )
    
    if (!answer) {
      return false
    }
  }
})

function handleSubmit() {
  // 保存表单
  api.save(form)
  
  // 更新初始值
  initialForm.value = {...form}
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name">
    <input v-model="form.email">
    <button type="submit">保存</button>
  </form>
</template>
```

### 示例 3：路由级加载状态

```typescript
// composables/useRouteLoading.ts
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useRouteLoading() {
  const router = useRouter()
  const loading = ref(false)
  
  router.beforeEach(() => {
    loading.value = true
  })
  
  router.afterEach(() => {
    loading.value = false
  })
  
  return { loading }
}

// App.vue
<script setup>
const { loading } = useRouteLoading()
</script>

<template>
  <div id="app">
    <div v-if="loading" class="loading-bar"></div>
    <router-view />
  </div>
</template>

<style>
.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #42b983;
  animation: loading 1s ease-in-out infinite;
}

@keyframes loading {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
```

### 示例 4：动态路由加载

```typescript
// router/index.ts
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/login',
      component: Login
    }
  ]
})

// 动态添加路由
router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  
  if (userStore.isLoggedIn && !userStore.routesLoaded) {
    try {
      // 获取用户路由
      const userRoutes = await api.getUserRoutes()
      
      // 动态添加路由
      userRoutes.forEach(route => {
        router.addRoute(route)
      })
      
      userStore.routesLoaded = true
      
      // 重新导航到目标路由
      return to.fullPath
    } catch (error) {
      console.error('加载路由失败:', error)
      return '/login'
    }
  }
})
```

### 示例 5：权限指令

```typescript
// directives/permission.ts
import { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

export const vPermission: Directive = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const { value } = binding
    
    if (value) {
      const hasPermission = userStore.permissions.includes(value)
      
      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    }
  }
}

// 使用
<template>
  <button v-permission="'delete'">删除</button>
  <button v-permission="'edit'">编辑</button>
</template>
```

---

## 导航故障

### 检测导航故障

```typescript
import { NavigationFailureType, isNavigationFailure } from 'vue-router'

router.push('/admin').catch(failure => {
  if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
    console.log('导航被中止')
  }
  
  if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
    console.log('重复导航')
  }
})

// 或使用 await
try {
  await router.push('/admin')
} catch (failure) {
  if (isNavigationFailure(failure)) {
    console.log('导航失败:', failure)
  }
}
```

### 故障类型

```typescript
// 导航被 beforeEach 等守卫取消
NavigationFailureType.aborted

// 导航到相同位置
NavigationFailureType.duplicated

// 导航守卫中抛出错误
NavigationFailureType.cancelled
```

---

## 异步错误处理

```typescript
router.beforeEach(async (to, from) => {
  try {
    await checkPermission(to)
    return true
  } catch (error) {
    console.error('权限检查失败:', error)
    return { name: 'Error' }
  }
})

// 全局错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 显示错误提示
  showErrorMessage(error.message)
})
```

---

## 最佳实践

1. **守卫分离**：将守卫逻辑分离到独立文件
2. **错误处理**：捕获异步操作的错误
3. **性能优化**：避免在守卫中执行耗时操作
4. **用户体验**：提供加载反馈和错误提示
5. **权限粒度**：合理划分权限级别
6. **类型安全**：使用 TypeScript 定义元信息类型
7. **测试覆盖**：为守卫编写单元测试
8. **文档化**：注释说明守卫的作用

---

## 守卫执行顺序总结

```typescript
// 1. 组件内守卫（离开）
onBeforeRouteLeave((to, from) => {
  console.log('1. 组件内 beforeRouteLeave')
})

// 2. 全局前置守卫
router.beforeEach((to, from) => {
  console.log('2. 全局 beforeEach')
})

// 3. 重用组件的守卫
onBeforeRouteUpdate((to, from) => {
  console.log('3. 组件内 beforeRouteUpdate')
})

// 4. 路由独享守卫
{
  path: '/admin',
  beforeEnter: (to, from) => {
    console.log('4. 路由 beforeEnter')
  }
}

// 5. 组件内守卫（进入）
onBeforeRouteEnter((to, from) => {
  console.log('5. 组件内 beforeRouteEnter')
})

// 6. 全局解析守卫
router.beforeResolve((to, from) => {
  console.log('6. 全局 beforeResolve')
})

// 7. 全局后置钩子
router.afterEach((to, from) => {
  console.log('7. 全局 afterEach')
})
```

---

## 参考资料

- [导航守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [路由元信息](https://router.vuejs.org/guide/advanced/meta.html)
- [导航故障](https://router.vuejs.org/guide/advanced/navigation-failures.html)
