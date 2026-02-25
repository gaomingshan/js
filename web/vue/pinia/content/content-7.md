# 2.4 Setup Store 组合式写法

## 概述

除了 Options API 风格，Pinia 还支持使用 Composition API 的 Setup 语法定义 Store。这种方式更灵活，与 Vue 3 的 `<script setup>` 语法高度一致，适合喜欢组合式 API 的开发者。

## Setup 语法定义 Store

### 基本语法

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // State：使用 ref
  const count = ref(0)
  const name = ref('Counter')
  
  // Getters：使用 computed
  const doubleCount = computed(() => count.value * 2)
  
  // Actions：使用 function
  function increment() {
    count.value++
  }
  
  function incrementBy(amount) {
    count.value += amount
  }
  
  // 必须返回所有需要暴露的内容
  return {
    count,
    name,
    doubleCount,
    increment,
    incrementBy
  }
})
```

### 对比 Options API

**Options API**：
```javascript
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++
    }
  }
})
```

**Setup API**：
```javascript
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const name = ref('Counter')
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  return { count, name, doubleCount, increment }
})
```

## ref() 定义 State

### 基础用法

使用 `ref()` 定义响应式状态：

```javascript
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 基本类型 State
  const id = ref(null)
  const name = ref('')
  const age = ref(0)
  const isActive = ref(false)
  
  // 引用类型 State
  const profile = ref({
    avatar: '',
    bio: ''
  })
  const roles = ref([])
  
  return {
    id,
    name,
    age,
    isActive,
    profile,
    roles
  }
})
```

### reactive() 也可以使用

```javascript
import { ref, reactive } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // 使用 ref
  const items = ref([])
  const total = ref(0)
  
  // 使用 reactive
  const config = reactive({
    currency: 'CNY',
    locale: 'zh-CN'
  })
  
  // 混合使用
  const state = reactive({
    loading: false,
    error: null
  })
  
  return {
    items,
    total,
    config,
    state
  }
})
```

### 访问 State

在组件中使用与 Options API 相同：

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const user = useUserStore()

// 访问 ref 类型的 state（自动解包）
console.log(user.name) // 不需要 .value
user.name = 'Alice' // 直接赋值

// 在模板中使用
</script>

<template>
  <div>{{ user.name }}</div>
</template>
```

## computed() 定义 Getters

### 基本用法

使用 `computed()` 定义计算属性：

```javascript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref([
    { id: 1, text: 'Task 1', done: false },
    { id: 2, text: 'Task 2', done: true }
  ])
  
  // Getter 1: 未完成的任务
  const activeTodos = computed(() => {
    return todos.value.filter(todo => !todo.done)
  })
  
  // Getter 2: 已完成的任务
  const completedTodos = computed(() => {
    return todos.value.filter(todo => todo.done)
  })
  
  // Getter 3: 统计信息
  const stats = computed(() => ({
    total: todos.value.length,
    active: activeTodos.value.length,
    completed: completedTodos.value.length
  }))
  
  return {
    todos,
    activeTodos,
    completedTodos,
    stats
  }
})
```

### 组合多个 Computed

```javascript
export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const filter = ref('all') // 'all' | 'inStock' | 'lowStock'
  const sortBy = ref('name') // 'name' | 'price'
  
  // 基础 getter：过滤
  const filteredProducts = computed(() => {
    switch (filter.value) {
      case 'inStock':
        return products.value.filter(p => p.stock > 0)
      case 'lowStock':
        return products.value.filter(p => p.stock > 0 && p.stock < 10)
      default:
        return products.value
    }
  })
  
  // 组合 getter：过滤 + 排序
  const sortedProducts = computed(() => {
    const list = [...filteredProducts.value]
    
    if (sortBy.value === 'price') {
      return list.sort((a, b) => a.price - b.price)
    } else {
      return list.sort((a, b) => a.name.localeCompare(b.name))
    }
  })
  
  return {
    products,
    filter,
    sortBy,
    filteredProducts,
    sortedProducts
  }
})
```

## function() 定义 Actions

### 基本用法

使用普通函数或箭头函数定义 Actions：

```javascript
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // 同步 action
  function setUser(userData) {
    user.value = userData
  }
  
  // 异步 action
  async function fetchUser(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`/api/users/${id}`)
      const data = await response.json()
      user.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 调用其他 actions
  async function refreshUser() {
    if (!user.value) return
    await fetchUser(user.value.id)
  }
  
  return {
    user,
    loading,
    error,
    setUser,
    fetchUser,
    refreshUser
  }
})
```

### 访问其他 Store

```javascript
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useLogStore } from './log'

export const useDataStore = defineStore('data', () => {
  const data = ref([])
  
  async function loadData() {
    // 获取其他 Store
    const auth = useAuthStore()
    const log = useLogStore()
    
    // 检查权限
    if (!auth.isAuthenticated) {
      throw new Error('未授权')
    }
    
    // 加载数据
    const response = await fetch('/api/data', {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
    
    data.value = await response.json()
    
    // 记录日志
    log.add('数据已加载', data.value.length)
  }
  
  return { data, loadData }
})
```

## Setup Store vs Options Store 选择

### 功能对比

| 特性 | Options Store | Setup Store |
|------|---------------|-------------|
| 语法风格 | Options API | Composition API |
| State 定义 | `state: () => ({})` | `ref()` / `reactive()` |
| Getters | `getters: {}` | `computed()` |
| Actions | `actions: {}` | `function()` |
| this 访问 | ✅ 支持 | ❌ 不支持 |
| $reset() | ✅ 自动支持 | ❌ 需手动实现 |
| 灵活性 | 中等 | 高 |
| 类型推导 | 好 | 优秀 |

### Options Store 优势

```javascript
// 1. 结构清晰，易于理解
export const useStore = defineStore('store', {
  state: () => ({ /* ... */ }),
  getters: { /* ... */ },
  actions: { /* ... */ }
})

// 2. 自动支持 $reset()
store.$reset()

// 3. this 访问方便
actions: {
  doSomething() {
    this.count++ // 直接访问
    this.someGetter // 访问 getter
    this.otherAction() // 调用其他 action
  }
}
```

### Setup Store 优势

```javascript
// 1. 更灵活，可以使用所有 Composition API
import { ref, watch, onMounted } from 'vue'

export const useStore = defineStore('store', () => {
  const count = ref(0)
  
  // 可以使用 watch
  watch(count, (newVal) => {
    console.log('count changed:', newVal)
  })
  
  // 可以在 setup 中执行逻辑
  onMounted(() => {
    console.log('Store 初始化')
  })
  
  return { count }
})

// 2. 更好的 TypeScript 类型推导
// 3. 可以定义私有变量（不返回的变量）
export const useStore = defineStore('store', () => {
  const publicCount = ref(0)
  const privateSecret = ref('secret') // 不返回，外部无法访问
  
  return { publicCount } // 只返回需要暴露的
})
```

### 选择建议

**选择 Options Store**：
- ✅ 团队熟悉 Options API
- ✅ 需要简单清晰的结构
- ✅ 需要 `$reset()` 功能
- ✅ Store 逻辑相对简单

**选择 Setup Store**：
- ✅ 团队熟悉 Composition API
- ✅ 需要更灵活的逻辑组织
- ✅ 需要使用 `watch`、生命周期等高级特性
- ✅ 需要私有变量/方法
- ✅ TypeScript 项目（类型推导更好）

### 混合使用

在同一项目中可以同时使用两种风格：

```javascript
// stores/user.js - Options Store
export const useUserStore = defineStore('user', {
  state: () => ({ user: null }),
  actions: {
    fetchUser() { /* ... */ }
  }
})

// stores/settings.js - Setup Store
export const useSettingsStore = defineStore('settings', () => {
  const theme = ref('dark')
  const locale = ref('zh-CN')
  
  return { theme, locale }
})
```

## 关键点总结

1. **Setup Store** 使用 Composition API 语法
2. **ref()** 定义 State，**computed()** 定义 Getters，**function()** 定义 Actions
3. **必须返回**所有需要暴露的内容
4. **不支持 $reset()**，需手动实现
5. **更灵活**，可使用所有 Composition API 特性

## 深入一点

### 手动实现 $reset

```javascript
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const name = ref('Counter')
  
  // 保存初始值
  const initialState = {
    count: 0,
    name: 'Counter'
  }
  
  // 手动实现 $reset
  function $reset() {
    count.value = initialState.count
    name.value = initialState.name
  }
  
  return {
    count,
    name,
    $reset
  }
})
```

### 私有变量与方法

Setup Store 可以定义私有内容：

```javascript
export const useAuthStore = defineStore('auth', () => {
  // 公开状态
  const user = ref(null)
  const token = ref(null)
  
  // 私有状态（不返回）
  const refreshTimer = ref(null)
  
  // 私有方法（不返回）
  function scheduleRefresh() {
    clearTimeout(refreshTimer.value)
    refreshTimer.value = setTimeout(() => {
      refreshToken()
    }, 5 * 60 * 1000) // 5分钟
  }
  
  // 公开方法
  async function login(credentials) {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
    const data = await response.json()
    
    user.value = data.user
    token.value = data.token
    
    // 调用私有方法
    scheduleRefresh()
  }
  
  // 只返回公开内容
  return {
    user,
    token,
    login
    // refreshTimer 和 scheduleRefresh 不返回，外部无法访问
  }
})
```

### 使用组合式函数

Setup Store 可以复用组合式函数：

```javascript
// composables/useAsync.js
import { ref } from 'vue'

export function useAsync(asyncFn) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  async function execute(...args) {
    loading.value = true
    error.value = null
    
    try {
      data.value = await asyncFn(...args)
      return data.value
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return { data, loading, error, execute }
}

// stores/user.js
import { defineStore } from 'pinia'
import { useAsync } from '@/composables/useAsync'

export const useUserStore = defineStore('user', () => {
  // 复用组合式函数
  const { data: user, loading, error, execute: fetchUser } = useAsync(
    async (id) => {
      const response = await fetch(`/api/users/${id}`)
      return response.json()
    }
  )
  
  return {
    user,
    loading,
    error,
    fetchUser
  }
})
```

### TypeScript 完整示例

```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  // State（自动推导类型）
  const users = ref<User[]>([])
  const currentUserId = ref<number | null>(null)
  
  // Getter（自动推导返回类型）
  const currentUser = computed(() => {
    return users.value.find(u => u.id === currentUserId.value) ?? null
  })
  
  // Action（显式类型标注）
  async function fetchUsers(): Promise<User[]> {
    const response = await fetch('/api/users')
    const data: User[] = await response.json()
    users.value = data
    return data
  }
  
  function setCurrentUser(id: number): void {
    currentUserId.value = id
  }
  
  return {
    users,
    currentUserId,
    currentUser,
    fetchUsers,
    setCurrentUser
  }
})
```

## 参考资料

- [Pinia Setup Stores 文档](https://pinia.vuejs.org/core-concepts/#setup-stores)
- [Vue 3 Composition API](https://vuejs.org/api/composition-api-setup.html)
- [ref() API](https://vuejs.org/api/reactivity-core.html#ref)
- [computed() API](https://vuejs.org/api/reactivity-core.html#computed)
