# 第 03 节：路由组件

## 概述

路由组件是被路由系统管理的 Vue 组件，它们通过路由配置与特定 URL 关联。本节介绍路由组件的特性、生命周期和最佳实践。

## 一、路由组件基础

### 1.1 什么是路由组件

```javascript
// 路由组件：通过路由配置渲染的组件
const routes = [
  {
    path: '/user/:id',
    component: UserComponent  // UserComponent 是路由组件
  }
]

// 普通组件：直接在模板中使用
<template>
  <HeaderComponent />  <!-- HeaderComponent 是普通组件 -->
  <router-view />      <!-- 路由组件在这里渲染 -->
</template>
```

### 1.2 路由组件特性

```vue
<template>
  <div>
    <!-- 路由组件可以访问路由信息 -->
    <h1>用户：{{ $route.params.id }}</h1>
    <p>查询参数：{{ $route.query.tab }}</p>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

// 获取当前路由
const route = useRoute()
const router = useRouter()

// 访问路由参数
console.log(route.params.id)
console.log(route.query.tab)

// 编程式导航
const navigateToProfile = () => {
  router.push(`/user/${route.params.id}/profile`)
}
</script>
```

## 二、路由组件注入

### 2.1 自动注入的属性

```vue
<script>
export default {
  created() {
    // Options API 中自动注入的属性
    console.log(this.$route)  // 当前路由对象
    console.log(this.$router) // 路由器实例
  }
}
</script>
```

### 2.2 Composition API 访问

```vue
<script setup>
import { useRoute, useRouter } from 'vue-router'

// 获取路由对象
const route = useRoute()
const router = useRouter()

// 响应式的路由信息
console.log(route.path)     // 当前路径
console.log(route.params)   // 路径参数
console.log(route.query)    // 查询参数
console.log(route.hash)     // hash 值
console.log(route.fullPath) // 完整路径
console.log(route.name)     // 路由名称
console.log(route.meta)     // 元信息
</script>
```

## 三、路由参数传递

### 3.1 通过 $route 访问

```vue
<template>
  <div>
    <h1>商品详情</h1>
    <p>商品 ID: {{ $route.params.id }}</p>
    <p>分类: {{ $route.query.category }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// URL: /product/123?category=electronics
console.log(route.params.id)      // "123"
console.log(route.query.category) // "electronics"
</script>
```

### 3.2 Props 模式

```javascript
// 路由配置
const routes = [
  {
    path: '/user/:id',
    component: User,
    props: true  // 将 params 作为 props 传递
  },
  {
    path: '/search',
    component: SearchResults,
    props: (route) => ({
      // 自定义 props
      query: route.query.q,
      page: parseInt(route.query.page) || 1
    })
  }
]
```

```vue
<!-- User.vue -->
<template>
  <div>
    <h1>用户：{{ id }}</h1>
  </div>
</template>

<script setup>
// 通过 props 接收路由参数
defineProps({
  id: {
    type: String,
    required: true
  }
})
</script>
```

### 3.3 Props 模式类型

```javascript
const routes = [
  // 1. 布尔值模式：将 params 转为 props
  {
    path: '/user/:id',
    component: User,
    props: true
  },
  
  // 2. 对象模式：静态 props
  {
    path: '/about',
    component: About,
    props: { title: '关于我们', version: '1.0.0' }
  },
  
  // 3. 函数模式：动态生成 props
  {
    path: '/search',
    component: SearchResults,
    props: (route) => ({
      query: route.query.q,
      filters: JSON.parse(route.query.filters || '{}')
    })
  },
  
  // 4. 命名视图的 props
  {
    path: '/dashboard',
    components: {
      default: Dashboard,
      sidebar: Sidebar
    },
    props: {
      default: true,
      sidebar: false
    }
  }
]
```

## 四、路由组件生命周期

### 4.1 组件复用问题

```vue
<script setup>
import { useRoute } from 'vue-router'
import { watch, onMounted } from 'vue'

const route = useRoute()

// 组件挂载时执行
onMounted(() => {
  fetchUserData(route.params.id)
})

// ❌ 错误：从 /user/1 导航到 /user/2 时不会重新执行
// 因为组件被复用了

// ✅ 正确：监听路由参数变化
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      await fetchUserData(newId)
    }
  }
)
</script>
```

### 4.2 beforeRouteUpdate

```vue
<script>
export default {
  // Options API 中处理路由更新
  async beforeRouteUpdate(to, from) {
    // 当前路由改变，但该组件被复用时调用
    if (to.params.id !== from.params.id) {
      await this.fetchUserData(to.params.id)
    }
  }
}
</script>
```

### 4.3 Composition API 替代方案

```vue
<script setup>
import { onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    await fetchUserData(to.params.id)
  }
})
</script>
```

## 五、路由组件缓存

### 5.1 KeepAlive 包装

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

### 5.2 条件缓存

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cachedComponents">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<script setup>
import { ref } from 'vue'

// 需要缓存的组件名称
const cachedComponents = ref(['UserProfile', 'ProductList'])
</script>
```

### 5.3 缓存生命周期

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

// 组件被激活时（从缓存恢复）
onActivated(() => {
  console.log('组件被激活')
  // 刷新数据
  refreshData()
})

// 组件被停用时（进入缓存）
onDeactivated(() => {
  console.log('组件被缓存')
  // 暂停操作
  pauseOperations()
})
</script>
```

## 六、路由组件通信

### 6.1 父子路由通信

```vue
<!-- ParentRoute.vue -->
<template>
  <div>
    <nav>
      <router-link to="/user/profile">个人资料</router-link>
      <router-link to="/user/settings">设置</router-link>
    </nav>
    
    <!-- 子路由出口 -->
    <router-view :user-data="userData" @update="handleUpdate" />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'

const userData = ref({})

// 通过 provide/inject 传递数据
provide('userData', userData)

const handleUpdate = (data) => {
  userData.value = { ...userData.value, ...data }
}
</script>
```

```vue
<!-- ChildRoute.vue -->
<template>
  <div>
    <h2>个人资料</h2>
    <p>{{ userData.name }}</p>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// 接收父路由提供的数据
const userData = inject('userData', {})
</script>
```

### 6.2 跨路由状态管理

```javascript
// store/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    userSettings: {}
  }),
  
  actions: {
    async fetchUser(id) {
      this.currentUser = await api.getUser(id)
    },
    
    updateSettings(settings) {
      this.userSettings = { ...this.userSettings, ...settings }
    }
  }
})
```

```vue
<script setup>
import { useUserStore } from '@/store/user'
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()

// 监听路由参数变化，更新用户数据
watch(
  () => route.params.id,
  (userId) => {
    if (userId) {
      userStore.fetchUser(userId)
    }
  },
  { immediate: true }
)
</script>
```

## 七、路由组件最佳实践

### 7.1 组件命名

```javascript
// ✅ 推荐：使用描述性名称
const routes = [
  { path: '/', component: () => import('@/views/HomePage.vue') },
  { path: '/about', component: () => import('@/views/AboutPage.vue') },
  { path: '/user/:id', component: () => import('@/views/UserProfile.vue') }
]

// ❌ 避免：使用模糊名称
const routes = [
  { path: '/', component: () => import('@/views/Index.vue') },
  { path: '/page1', component: () => import('@/views/Page1.vue') }
]
```

### 7.2 数据获取策略

```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(false)
const error = ref(null)
const data = ref(null)

// 数据获取函数
const fetchData = async (id) => {
  try {
    loading.value = true
    error.value = null
    data.value = await api.fetchUserData(id)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// 初始化和参数变化时获取数据
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchData(newId)
    }
  },
  { immediate: true }
)
</script>
```

### 7.3 错误处理

```vue
<template>
  <div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">
      <p>加载失败：{{ error }}</p>
      <button @click="retry">重试</button>
    </div>
    <div v-else-if="data" class="content">
      <!-- 正常内容 -->
    </div>
  </div>
</template>

<script setup>
const retry = () => {
  fetchData(route.params.id)
}
</script>
```

## 八、总结

| 特性 | 说明 |
|------|------|
| 路由注入 | 自动注入 $route 和 $router |
| Props 传递 | 通过 props 选项传递路由参数 |
| 组件复用 | 相同组件间导航时组件会被复用 |
| 生命周期 | beforeRouteUpdate 处理复用场景 |
| 缓存管理 | 配合 KeepAlive 实现组件缓存 |

## 参考资料

- [路由组件传参](https://router.vuejs.org/guide/essentials/passing-props.html)
- [组件内的守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html#in-component-guards)

---

**下一节** → [第 04 节：编程式导航](./04-programmatic-navigation.md)
