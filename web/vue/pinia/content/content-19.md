# 5.4 最佳实践总结

## 概述

本节总结使用 Pinia 的最佳实践，包括 Store 设计模式、命名规范、目录组织、使用场景选择等，帮助你在实际项目中高效使用 Pinia。

## Store 设计模式

### 单一职责原则

每个 Store 应该只负责一个业务领域：

```javascript
// ✅ 好：职责单一
// stores/user.js - 只管理用户相关状态
export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    preferences: {}
  })
})

// stores/auth.js - 只管理认证相关状态
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    isAuthenticated: false
  })
})

// ❌ 不好：职责混乱
// stores/userAuth.js - 混合了用户和认证
export const useUserAuthStore = defineStore('userAuth', {
  state: () => ({
    profile: null,
    token: null,
    cart: [], // 购物车不应该在这里
    orders: [] // 订单也不应该在这里
  })
})
```

### 领域驱动设计

按业务领域组织 Store：

```
stores/
├── user/           # 用户领域
│   ├── profile.js
│   ├── settings.js
│   └── preferences.js
├── shop/           # 电商领域
│   ├── cart.js
│   ├── products.js
│   └── orders.js
├── content/        # 内容领域
│   ├── posts.js
│   └── comments.js
└── shared/         # 共享Store
    ├── app.js
    └── notification.js
```

### 组合优于继承

使用 Store 组合而非继承：

```javascript
// ✅ 好：组合模式
// stores/base.js
export const useBaseStore = defineStore('base', {
  state: () => ({
    loading: false,
    error: null
  }),
  
  actions: {
    setLoading(loading) {
      this.loading = loading
    },
    setError(error) {
      this.error = error
    }
  }
})

// stores/user.js
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),
  
  actions: {
    async fetchUser(id) {
      const base = useBaseStore()
      
      base.setLoading(true)
      try {
        const response = await fetch(`/api/users/${id}`)
        this.user = await response.json()
      } catch (error) {
        base.setError(error.message)
      } finally {
        base.setLoading(false)
      }
    }
  }
})
```

## 命名规范与目录组织

### Store 命名规范

```javascript
// ✅ 好的命名
export const useUserStore = defineStore('user', { /* ... */ })
export const useCartStore = defineStore('cart', { /* ... */ })
export const useProductStore = defineStore('product', { /* ... */ })

// Store ID 使用小写短横线
defineStore('user-profile', { /* ... */ })
defineStore('shopping-cart', { /* ... */ })

// Hook 使用 useXxxStore 格式
const useUserProfileStore = defineStore('user-profile', { /* ... */ })
const useShoppingCartStore = defineStore('shopping-cart', { /* ... */ })
```

### State 命名

```javascript
state: () => ({
  // ✅ 好：清晰的命名
  user: null,
  isLoading: false,
  errorMessage: null,
  items: [],
  currentPage: 1,
  
  // ❌ 不好：含糊的命名
  data: null,
  flag: false,
  msg: null,
  list: [],
  p: 1
})
```

### Actions 命名

```javascript
actions: {
  // ✅ 好：动词开头，语义清晰
  fetchUser(id) {},
  updateProfile(data) {},
  deleteItem(id) {},
  resetState() {},
  
  // ✅ 异步操作可以带 async 前缀
  async fetchUsers() {},
  async loadData() {},
  
  // ❌ 不好：不清晰的命名
  get() {},
  set() {},
  do() {},
  handle() {}
}
```

### Getters 命名

```javascript
getters: {
  // ✅ 好：描述性命名
  fullName: (state) => `${state.firstName} ${state.lastName}`,
  isAdult: (state) => state.age >= 18,
  activeItems: (state) => state.items.filter(i => i.active),
  totalPrice: (state) => state.items.reduce((sum, i) => sum + i.price, 0),
  
  // 返回函数的 getter 可以使用 get 前缀
  getItemById: (state) => (id) => state.items.find(i => i.id === id),
  
  // ❌ 不好
  getter1: () => {},
  compute: () => {},
  calc: () => {}
}
```

### 目录结构最佳实践

```
src/
├── stores/
│   ├── index.js                 # 导出所有 Store
│   ├── modules/                 # 功能模块
│   │   ├── user/
│   │   │   ├── index.js        # useUserStore
│   │   │   ├── profile.js      # useUserProfileStore
│   │   │   └── settings.js     # useUserSettingsStore
│   │   ├── shop/
│   │   │   ├── cart.js
│   │   │   ├── products.js
│   │   │   └── orders.js
│   │   └── content/
│   │       ├── posts.js
│   │       └── comments.js
│   ├── shared/                  # 共享Store
│   │   ├── app.js
│   │   ├── notification.js
│   │   └── config.js
│   └── plugins/                 # Pinia 插件
│       ├── persistence.js
│       ├── logger.js
│       └── index.js
└── composables/                 # 组合式函数
    └── useStores.js            # Store 组合
```

## 何时使用状态管理

### 应该使用 Pinia 的场景

```javascript
// ✅ 多个组件共享状态
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] // 购物车在多个页面/组件中使用
  })
})

// ✅ 需要持久化的状态
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null
  }),
  persist: true
})

// ✅ 复杂的业务逻辑
export const useOrderStore = defineStore('order', {
  actions: {
    async createOrder() {
      // 复杂的订单创建逻辑
      const cart = useCartStore()
      const user = useUserStore()
      const payment = usePaymentStore()
      // ...
    }
  }
})

// ✅ 跨路由的状态
export const useWizardStore = defineStore('wizard', {
  state: () => ({
    step: 1,
    formData: {}
  })
})
```

### 不需要使用 Pinia 的场景

```vue
<script setup>
import { ref } from 'vue'

// ✅ 组件内部状态，使用 ref
const isOpen = ref(false)
const inputValue = ref('')

// ✅ 临时 UI 状态
const showDialog = ref(false)
const hoveredItem = ref(null)

// ✅ 表单临时数据（提交前）
const formData = ref({
  name: '',
  email: ''
})
</script>
```

## Pinia vs 组合式函数的选择

### 使用 Pinia

```javascript
// 全局共享、需要持久化、跨组件通信
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    preferences: {}
  }),
  persist: true
})
```

### 使用组合式函数

```javascript
// composables/useCounter.js
// 逻辑复用，但每个组件独立状态
export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  function increment() {
    count.value++
  }
  
  return {
    count: readonly(count),
    increment
  }
}

// 每个组件有独立的计数器
const counter1 = useCounter(0)
const counter2 = useCounter(10)
```

### 结合使用

```javascript
// composables/useAuth.js
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  
  const { user, isAuthenticated } = storeToRefs(authStore)
  const { login, logout } = authStore
  
  // 添加业务逻辑
  async function handleLogin(credentials) {
    await login(credentials)
    router.push('/dashboard')
  }
  
  async function handleLogout() {
    await logout()
    router.push('/login')
  }
  
  return {
    user,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout
  }
}
```

## 企业级项目实践经验

### 1. 状态分层架构

```
stores/
├── domain/          # 领域层（业务实体）
│   ├── user.js
│   ├── product.js
│   └── order.js
├── application/     # 应用层（业务流程）
│   ├── checkout.js
│   ├── search.js
│   └── wizard.js
├── infrastructure/  # 基础设施层
│   ├── api.js
│   ├── cache.js
│   └── websocket.js
└── ui/             # UI 层（UI 状态）
    ├── layout.js
    ├── theme.js
    └── notification.js
```

### 2. 统一的错误处理

```javascript
// stores/shared/error.js
export const useErrorStore = defineStore('error', {
  state: () => ({
    errors: []
  }),
  
  actions: {
    addError(error) {
      this.errors.push({
        message: error.message,
        timestamp: Date.now(),
        stack: error.stack
      })
    },
    
    clearErrors() {
      this.errors = []
    }
  }
})

// 在其他 Store 中使用
export const useUserStore = defineStore('user', {
  actions: {
    async fetchUser(id) {
      try {
        const response = await fetch(`/api/users/${id}`)
        this.user = await response.json()
      } catch (error) {
        const errorStore = useErrorStore()
        errorStore.addError(error)
        throw error
      }
    }
  }
})
```

### 3. 统一的 API 封装

```javascript
// stores/shared/api.js
export const useApiStore = defineStore('api', {
  actions: {
    async request(url, options = {}) {
      const auth = useAuthStore()
      const error = useErrorStore()
      
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`,
            ...options.headers
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        return await response.json()
      } catch (err) {
        error.addError(err)
        throw err
      }
    }
  }
})

// 业务 Store 使用
export const useProductStore = defineStore('product', {
  actions: {
    async fetchProducts() {
      const api = useApiStore()
      this.products = await api.request('/api/products')
    }
  }
})
```

### 4. 数据预加载策略

```javascript
// stores/shared/preload.js
export const usePreloadStore = defineStore('preload', {
  state: () => ({
    initialized: false
  }),
  
  actions: {
    async initApp() {
      if (this.initialized) return
      
      // 并行加载关键数据
      await Promise.all([
        useConfigStore().loadConfig(),
        useAuthStore().checkAuth(),
        useUserStore().loadCurrentUser()
      ])
      
      this.initialized = true
    }
  }
})

// main.js
const preload = usePreloadStore()
await preload.initApp()
app.mount('#app')
```

### 5. 性能监控

```javascript
// plugins/metrics.js
export function metricsPlugin({ store }) {
  const metrics = {
    actions: {},
    stateChanges: 0
  }
  
  store.$onAction(({ name, after }) => {
    const start = performance.now()
    
    after(() => {
      const duration = performance.now() - start
      
      if (!metrics.actions[name]) {
        metrics.actions[name] = {
          count: 0,
          totalDuration: 0,
          avgDuration: 0
        }
      }
      
      metrics.actions[name].count++
      metrics.actions[name].totalDuration += duration
      metrics.actions[name].avgDuration = 
        metrics.actions[name].totalDuration / metrics.actions[name].count
    })
  })
  
  store.$subscribe(() => {
    metrics.stateChanges++
  })
  
  store.$metrics = metrics
}
```

## 关键点总结

1. **单一职责**：每个 Store 只负责一个业务领域
2. **清晰命名**：Store ID、State、Actions、Getters 都有明确命名规范
3. **合理分层**：领域层、应用层、基础设施层、UI 层
4. **场景选择**：区分何时用 Pinia、何时用组合式函数
5. **企业实践**：统一错误处理、API 封装、性能监控

## 深入一点

### 完整的企业级 Store 示例

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { useApiStore } from './shared/api'
import { useErrorStore } from './shared/error'
import { useLoadingStore } from './shared/loading'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

interface UserState {
  user: User | null
  users: User[]
  currentPage: number
  totalPages: number
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    users: [],
    currentPage: 1,
    totalPages: 1
  }),
  
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    
    getUserById: (state) => {
      return (id: number) => state.users.find(u => u.id === id)
    }
  },
  
  actions: {
    async fetchUsers(page = 1) {
      const api = useApiStore()
      const loading = useLoadingStore()
      const error = useErrorStore()
      
      loading.start('fetchUsers')
      
      try {
        const data = await api.request(`/api/users?page=${page}`)
        this.users = data.users
        this.currentPage = data.page
        this.totalPages = data.totalPages
      } catch (err) {
        error.addError(err as Error)
        throw err
      } finally {
        loading.stop('fetchUsers')
      }
    },
    
    async updateUser(id: number, updates: Partial<User>) {
      const api = useApiStore()
      
      const updated = await api.request(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      
      // 更新本地状态
      const index = this.users.findIndex(u => u.id === id)
      if (index !== -1) {
        this.users[index] = updated
      }
      
      if (this.user?.id === id) {
        this.user = updated
      }
    }
  }
})
```

## 参考资料

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue 3 组合式 API](https://vuejs.org/guide/reusability/composables.html)
- [领域驱动设计](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
