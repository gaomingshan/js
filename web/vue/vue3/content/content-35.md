# Pinia 基础

> Pinia 是 Vue 3 的官方状态管理库，提供了简单直观的 API。

## 核心概念

Pinia 是 Vuex 的替代方案，专为 Vue 3 设计，提供更好的 TypeScript 支持。

### 安装

```bash
npm install pinia
```

### 基础配置

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

---

## Store 定义

### 选项式 API

```typescript
// stores/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // State
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  
  // Getters
  getters: {
    double: (state) => state.count * 2,
    
    // 使用 this 访问其他 getter
    doubleWithPrefix(): string {
      return `Count: ${this.double}`
    }
  },
  
  // Actions
  actions: {
    increment() {
      this.count++
    },
    
    decrement() {
      this.count--
    },
    
    async fetchData() {
      const data = await api.getData()
      this.count = data.count
    }
  }
})
```

### 组合式 API（推荐）

```typescript
// stores/counter.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const name = ref('Counter')
  
  // Getters
  const double = computed(() => count.value * 2)
  const doubleWithPrefix = computed(() => `Count: ${double.value}`)
  
  // Actions
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  async function fetchData() {
    const data = await api.getData()
    count.value = data.count
  }
  
  return {
    count,
    name,
    double,
    doubleWithPrefix,
    increment,
    decrement,
    fetchData
  }
})
```

---

## 使用 Store

### 在组件中使用

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

// 访问 state
console.log(counter.count)

// 访问 getter
console.log(counter.double)

// 调用 action
counter.increment()
</script>

<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <p>Double: {{ counter.double }}</p>
    <button @click="counter.increment">+1</button>
    <button @click="counter.decrement">-1</button>
  </div>
</template>
```

### 解构 Store

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

// 使用 storeToRefs 保持响应性
const { count, double } = storeToRefs(counter)

// actions 可以直接解构
const { increment, decrement } = counter
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ double }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

---

## State

### 访问 State

```typescript
const store = useCounterStore()

// 直接访问
console.log(store.count)

// 使用 $state
console.log(store.$state.count)
```

### 修改 State

```typescript
// 直接修改
store.count++

// 使用 $patch（对象）
store.$patch({
  count: store.count + 1,
  name: 'New Counter'
})

// 使用 $patch（函数）
store.$patch((state) => {
  state.count++
  state.items.push({ id: 1, name: 'Item' })
})

// 替换整个 state
store.$state = {
  count: 0,
  name: 'Counter'
}
```

### 重置 State

```typescript
// 重置到初始状态
store.$reset()
```

---

## Getters

### 基础 Getter

```typescript
export const useStore = defineStore('main', {
  state: () => ({
    count: 0
  }),
  
  getters: {
    // 自动推导返回类型
    double: (state) => state.count * 2,
    
    // 显式指定返回类型
    doubleString(): string {
      return `${this.count * 2}`
    }
  }
})
```

### 访问其他 Getter

```typescript
getters: {
  double: (state) => state.count * 2,
  
  // 使用 this 访问其他 getter
  quadruple(): number {
    return this.double * 2
  }
}
```

### 传递参数

```typescript
getters: {
  getUserById: (state) => {
    return (userId: number) => {
      return state.users.find(user => user.id === userId)
    }
  }
}

// 使用
const user = store.getUserById(123)
```

### 访问其他 Store

```typescript
import { useOtherStore } from './other'

export const useStore = defineStore('main', {
  getters: {
    otherGetter(): string {
      const other = useOtherStore()
      return `${this.count} - ${other.data}`
    }
  }
})
```

---

## Actions

### 基础 Action

```typescript
export const useStore = defineStore('main', {
  state: () => ({
    count: 0
  }),
  
  actions: {
    increment() {
      this.count++
    },
    
    incrementBy(amount: number) {
      this.count += amount
    }
  }
})
```

### 异步 Action

```typescript
actions: {
  async fetchData() {
    try {
      const data = await api.getData()
      this.data = data
    } catch (error) {
      console.error('获取数据失败:', error)
      throw error
    }
  },
  
  async login(username: string, password: string) {
    const token = await api.login({ username, password })
    this.token = token
    this.isLoggedIn = true
  }
}
```

### 调用其他 Action

```typescript
actions: {
  async saveData() {
    // 调用本 store 的其他 action
    await this.fetchData()
    
    // 调用其他 store 的 action
    const other = useOtherStore()
    await other.doSomething()
  }
}
```

---

## TypeScript 支持

### 完整类型定义

```typescript
// stores/user.ts
import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
}

interface UserState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: null,
    isLoggedIn: false
  }),
  
  getters: {
    userName: (state): string => {
      return state.user?.name || 'Guest'
    },
    
    isAdmin(): boolean {
      return this.user?.role === 'admin'
    }
  },
  
  actions: {
    async login(username: string, password: string): Promise<void> {
      const response = await api.login({ username, password })
      this.token = response.token
      this.user = response.user
      this.isLoggedIn = true
    },
    
    logout(): void {
      this.user = null
      this.token = null
      this.isLoggedIn = false
    }
  }
})
```

### 组合式 API 类型

```typescript
export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoggedIn = ref(false)
  
  // Getters
  const userName = computed((): string => {
    return user.value?.name || 'Guest'
  })
  
  const isAdmin = computed((): boolean => {
    return user.value?.role === 'admin'
  })
  
  // Actions
  async function login(username: string, password: string): Promise<void> {
    const response = await api.login({ username, password })
    token.value = response.token
    user.value = response.user
    isLoggedIn.value = true
  }
  
  function logout(): void {
    user.value = null
    token.value = null
    isLoggedIn.value = false
  }
  
  return {
    user,
    token,
    isLoggedIn,
    userName,
    isAdmin,
    login,
    logout
  }
})
```

---

## 实战示例

### 示例 1：用户认证

```typescript
// stores/auth.ts
import { defineStore } from 'pinia'
import { router } from '@/router'

interface LoginCredentials {
  username: string
  password: string
}

interface User {
  id: number
  username: string
  email: string
  roles: string[]
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.roles.includes('admin') || false)
  
  async function login(credentials: LoginCredentials) {
    loading.value = true
    try {
      const response = await api.login(credentials)
      token.value = response.token
      user.value = response.user
      
      // 保存到 localStorage
      localStorage.setItem('token', response.token)
      
      // 跳转到首页
      router.push('/')
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }
  
  async function logout() {
    try {
      await api.logout()
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      router.push('/login')
    }
  }
  
  async function checkAuth() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      try {
        user.value = await api.getCurrentUser()
      } catch (error) {
        logout()
      }
    }
  }
  
  return {
    user,
    token,
    loading,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    checkAuth
  }
})
```

### 示例 2：购物车

```typescript
// stores/cart.ts
import { defineStore } from 'pinia'

interface Product {
  id: number
  name: string
  price: number
}

interface CartItem extends Product {
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })
  
  function addItem(product: Product) {
    const existingItem = items.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({
        ...product,
        quantity: 1
      })
    }
  }
  
  function removeItem(productId: number) {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }
  
  function updateQuantity(productId: number, quantity: number) {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      item.quantity = quantity
      if (item.quantity <= 0) {
        removeItem(productId)
      }
    }
  }
  
  function clear() {
    items.value = []
  }
  
  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clear
  }
})
```

### 示例 3：全局配置

```typescript
// stores/app.ts
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const sidebar = reactive({
    opened: true,
    withoutAnimation: false
  })
  
  const theme = ref<'light' | 'dark'>('light')
  const language = ref('zh-CN')
  const loading = ref(false)
  
  function toggleSidebar() {
    sidebar.opened = !sidebar.opened
    sidebar.withoutAnimation = false
  }
  
  function closeSidebar(withoutAnimation: boolean) {
    sidebar.opened = false
    sidebar.withoutAnimation = withoutAnimation
  }
  
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }
  
  function setLanguage(lang: string) {
    language.value = lang
  }
  
  function showLoading() {
    loading.value = true
  }
  
  function hideLoading() {
    loading.value = false
  }
  
  return {
    sidebar,
    theme,
    language,
    loading,
    toggleSidebar,
    closeSidebar,
    toggleTheme,
    setLanguage,
    showLoading,
    hideLoading
  }
})
```

---

## 最佳实践

1. **命名规范**：使用 `use` 前缀，如 `useUserStore`
2. **组合式 API**：优先使用组合式 API 定义
3. **TypeScript**：提供完整的类型定义
4. **模块化**：按功能拆分 store
5. **持久化**：敏感数据使用插件持久化
6. **错误处理**：在 action 中处理错误
7. **状态重置**：提供重置方法
8. **避免直接修改**：通过 action 修改状态

---

## Pinia vs Vuex

| 特性 | Pinia | Vuex |
|------|-------|------|
| API | 简单直观 | 较复杂 |
| TypeScript | 原生支持 | 需要额外配置 |
| DevTools | 完整支持 | 支持 |
| 体积 | 约 1KB | 约 3KB |
| Mutations | 无需 | 必需 |
| Modules | 自动代码分割 | 需要手动配置 |
| HMR | 完整支持 | 部分支持 |

---

## 参考资料

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Pinia vs Vuex](https://pinia.vuejs.org/introduction.html#comparison-with-vuex)
- [从 Vuex 迁移](https://pinia.vuejs.org/cookbook/migration-vuex.html)
