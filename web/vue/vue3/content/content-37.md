# Pinia 高级特性

> 掌握 Pinia 的高级用法，实现复杂的状态管理需求。

## Store 组合

### 在 Store 中使用其他 Store

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  
  return { token, user }
})

// stores/cart.ts
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore()
  const items = ref<CartItem[]>([])
  
  const canCheckout = computed(() => {
    return userStore.token && items.value.length > 0
  })
  
  async function checkout() {
    if (!canCheckout.value) return
    
    await api.checkout({
      userId: userStore.user!.id,
      items: items.value
    })
  }
  
  return { items, canCheckout, checkout }
})
```

### Composable 模式

```typescript
// composables/useStores.ts
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useAppStore } from '@/stores/app'

export function useStores() {
  const userStore = useUserStore()
  const cartStore = useCartStore()
  const appStore = useAppStore()
  
  return {
    userStore,
    cartStore,
    appStore
  }
}

// 使用
<script setup>
const { userStore, cartStore } = useStores()
</script>
```

---

## $subscribe 与 $onAction

### $subscribe - 监听状态变化

```typescript
const store = useCounterStore()

// 基础用法
store.$subscribe((mutation, state) => {
  console.log('Type:', mutation.type)
  console.log('Payload:', mutation.payload)
  console.log('State:', state)
})

// mutation.type 可能的值:
// - 'direct': store.count = 5
// - 'patch object': store.$patch({ count: 5 })
// - 'patch function': store.$patch(state => { state.count = 5 })

// 组件卸载后继续监听
store.$subscribe((mutation, state) => {
  // ...
}, { detached: true })

// 监听特定变化
store.$subscribe((mutation, state) => {
  if (mutation.type === 'patch object') {
    console.log('批量更新:', mutation.payload)
  }
})
```

### $onAction - 监听 Action 调用

```typescript
const store = useUserStore()

const unsubscribe = store.$onAction(({
  name,      // action 名称
  store,     // store 实例
  args,      // 传递给 action 的参数
  after,     // action 返回或 resolve 后的钩子
  onError    // action 抛出错误或 reject 时的钩子
}) => {
  const startTime = Date.now()
  
  console.log(`Action ${name} called with:`, args)
  
  // 成功后执行
  after((result) => {
    console.log(
      `Action ${name} finished in ${Date.now() - startTime}ms`,
      'Result:', result
    )
  })
  
  // 错误时执行
  onError((error) => {
    console.error(
      `Action ${name} failed after ${Date.now() - startTime}ms`,
      'Error:', error
    )
  })
})

// 停止监听
unsubscribe()
```

### 实战应用

```typescript
// composables/useActionLogger.ts
export function useActionLogger(storeName: string) {
  const store = useStore(storeName)
  
  if (import.meta.env.DEV) {
    store.$onAction(({ name, args, after, onError }) => {
      const startTime = performance.now()
      
      console.group(`[Action] ${storeName}.${name}`)
      console.log('Arguments:', args)
      
      after((result) => {
        const duration = performance.now() - startTime
        console.log('Duration:', `${duration.toFixed(2)}ms`)
        console.log('Result:', result)
        console.groupEnd()
      })
      
      onError((error) => {
        const duration = performance.now() - startTime
        console.error('Duration:', `${duration.toFixed(2)}ms`)
        console.error('Error:', error)
        console.groupEnd()
      })
    })
  }
}
```

---

## 选项式 API 与组合式 API 对比

### 选项式 API

```typescript
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  
  getters: {
    double: (state) => state.count * 2
  },
  
  actions: {
    increment() {
      this.count++
    }
  }
})
```

### 组合式 API（推荐）

```typescript
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  return { count, double, increment }
})
```

### 何时使用哪种方式

**选项式 API**：
- 熟悉 Vuex 的团队
- 简单的 store
- 喜欢结构化的代码

**组合式 API**：
- 需要复杂的逻辑复用
- 更好的 TypeScript 支持
- 更灵活的代码组织

---

## Setup Store 高级用法

### 返回类型控制

```typescript
export const useStore = defineStore('main', () => {
  // 内部状态（不暴露）
  const _privateCount = ref(0)
  
  // 公开状态
  const count = computed(() => _privateCount.value)
  
  // 公开方法
  function increment() {
    _privateCount.value++
  }
  
  // 只返回需要暴露的内容
  return {
    count,
    increment
  }
})
```

### 使用 Composables

```typescript
// composables/useAsync.ts
export function useAsync<T>(asyncFn: () => Promise<T>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  
  async function execute() {
    loading.value = true
    error.value = null
    
    try {
      data.value = await asyncFn()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }
  
  return { data, error, loading, execute }
}

// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  
  // 使用 composable
  const { data, loading, execute: fetchUser } = useAsync(async () => {
    const response = await api.getUser()
    return response.data
  })
  
  watch(data, (newData) => {
    if (newData) {
      user.value = newData
    }
  })
  
  return {
    user,
    loading,
    fetchUser
  }
})
```

---

## 模块化管理

### 按功能拆分 Store

```typescript
// stores/modules/auth.ts
export const useAuthModule = () => {
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)
  
  async function login(credentials: LoginCredentials) {
    const response = await api.login(credentials)
    token.value = response.token
  }
  
  function logout() {
    token.value = null
  }
  
  return {
    token,
    isAuthenticated,
    login,
    logout
  }
}

// stores/modules/profile.ts
export const useProfileModule = () => {
  const user = ref<User | null>(null)
  
  async function fetchProfile() {
    const response = await api.getProfile()
    user.value = response.data
  }
  
  return {
    user,
    fetchProfile
  }
}

// stores/user.ts
export const useUserStore = defineStore('user', () => {
  // 组合多个模块
  const auth = useAuthModule()
  const profile = useProfileModule()
  
  // 监听认证状态变化
  watch(auth.isAuthenticated, (authenticated) => {
    if (authenticated) {
      profile.fetchProfile()
    } else {
      profile.user.value = null
    }
  })
  
  return {
    ...auth,
    ...profile
  }
})
```

### 命名空间

```typescript
// stores/namespaced/index.ts
import { defineStore } from 'pinia'

// 使用前缀避免命名冲突
export const useAdminUserStore = defineStore('admin/user', {
  state: () => ({
    users: []
  })
})

export const usePublicUserStore = defineStore('public/user', {
  state: () => ({
    currentUser: null
  })
})
```

---

## SSR 支持

### 状态序列化

```typescript
// server.ts
import { createPinia } from 'pinia'

export async function renderApp(url: string) {
  const pinia = createPinia()
  const app = createSSRApp(App)
  
  app.use(pinia)
  
  // 渲染应用
  const html = await renderToString(app)
  
  // 序列化状态
  const state = JSON.stringify(pinia.state.value)
  
  return {
    html,
    state
  }
}
```

### 客户端注水

```typescript
// client.ts
const pinia = createPinia()

// 从服务端注入的状态恢复
if (window.__INITIAL_STATE__) {
  pinia.state.value = JSON.parse(window.__INITIAL_STATE__)
}

const app = createApp(App)
app.use(pinia)
app.mount('#app')
```

### SSR Store

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isServer = typeof window === 'undefined'
  
  async function fetchUser() {
    // SSR 时使用不同的逻辑
    if (isServer) {
      // 服务端逻辑
      user.value = await fetchUserFromServer()
    } else {
      // 客户端逻辑
      user.value = await fetchUserFromAPI()
    }
  }
  
  return { user, fetchUser }
})
```

---

## 测试

### 单元测试

```typescript
// stores/counter.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from './counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('increments', () => {
    const counter = useCounterStore()
    expect(counter.count).toBe(0)
    
    counter.increment()
    expect(counter.count).toBe(1)
  })
  
  it('doubles count', () => {
    const counter = useCounterStore()
    counter.count = 5
    expect(counter.double).toBe(10)
  })
  
  it('handles async actions', async () => {
    const counter = useCounterStore()
    await counter.fetchData()
    expect(counter.count).toBeGreaterThan(0)
  })
})
```

### 测试 Actions

```typescript
import { vi } from 'vitest'

describe('User Store Actions', () => {
  it('login success', async () => {
    const user = useUserStore()
    
    // Mock API
    vi.spyOn(api, 'login').mockResolvedValue({
      token: 'test-token',
      user: { id: 1, name: 'Test' }
    })
    
    await user.login({ username: 'test', password: 'test' })
    
    expect(user.token).toBe('test-token')
    expect(user.isLoggedIn).toBe(true)
  })
  
  it('login failure', async () => {
    const user = useUserStore()
    
    vi.spyOn(api, 'login').mockRejectedValue(new Error('Login failed'))
    
    await expect(user.login({ username: 'test', password: 'wrong' }))
      .rejects
      .toThrow('Login failed')
  })
})
```

### 测试 Getters

```typescript
describe('Cart Store Getters', () => {
  it('calculates total price', () => {
    const cart = useCartStore()
    
    cart.items = [
      { id: 1, price: 10, quantity: 2 },
      { id: 2, price: 20, quantity: 1 }
    ]
    
    expect(cart.totalPrice).toBe(40)
  })
})
```

---

## 性能优化

### 避免不必要的响应式

```typescript
// ❌ 不好：所有属性都是响应式的
export const useStore = defineStore('store', () => {
  const largeData = ref<LargeObject>({
    // 大量数据
  })
  
  return { largeData }
})

// ✅ 好：使用 shallowRef
export const useStore = defineStore('store', () => {
  const largeData = shallowRef<LargeObject>({
    // 大量数据
  })
  
  return { largeData }
})
```

### 批量更新

```typescript
// ❌ 不好：多次触发更新
store.count = 1
store.name = 'New Name'
store.active = true

// ✅ 好：批量更新
store.$patch({
  count: 1,
  name: 'New Name',
  active: true
})

// 或使用函数
store.$patch((state) => {
  state.count = 1
  state.name = 'New Name'
  state.active = true
})
```

### 惰性加载

```typescript
// 只在需要时初始化
export const useExpensiveStore = defineStore('expensive', () => {
  const data = ref<any>(null)
  
  async function init() {
    if (data.value === null) {
      data.value = await loadExpensiveData()
    }
  }
  
  return { data, init }
})

// 使用
const store = useExpensiveStore()
await store.init() // 只在第一次使用时加载
```

---

## 实战案例

### 完整的用户认证系统

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
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.roles.includes('admin') || false)
  const userName = computed(() => user.value?.username || 'Guest')
  
  // Actions
  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.login(credentials)
      
      token.value = response.token
      refreshToken.value = response.refreshToken
      user.value = response.user
      
      // 保存到 localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      // 跳转到首页
      router.push('/')
    } catch (e) {
      error.value = (e as Error).message
      throw e
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
      refreshToken.value = null
      
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      
      router.push('/login')
    }
  }
  
  async function refreshTokens() {
    if (!refreshToken.value) {
      throw new Error('No refresh token')
    }
    
    try {
      const response = await api.refreshToken(refreshToken.value)
      token.value = response.token
      refreshToken.value = response.refreshToken
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('refreshToken', response.refreshToken)
    } catch (e) {
      await logout()
      throw e
    }
  }
  
  async function checkAuth() {
    const savedToken = localStorage.getItem('token')
    
    if (savedToken) {
      token.value = savedToken
      refreshToken.value = localStorage.getItem('refreshToken')
      
      try {
        user.value = await api.getCurrentUser()
      } catch (e) {
        await logout()
      }
    }
  }
  
  async function updateProfile(data: Partial<User>) {
    if (!user.value) return
    
    loading.value = true
    
    try {
      const response = await api.updateProfile(data)
      user.value = { ...user.value, ...response.data }
    } finally {
      loading.value = false
    }
  }
  
  function $reset() {
    user.value = null
    token.value = null
    refreshToken.value = null
    loading.value = false
    error.value = null
  }
  
  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    isAdmin,
    userName,
    login,
    logout,
    refreshTokens,
    checkAuth,
    updateProfile,
    $reset
  }
})
```

---

## 调试技巧

### Vue DevTools

Pinia 完全支持 Vue DevTools：
- 查看所有 store 的状态
- 时间旅行调试
- 修改状态
- 触发 actions
- 查看 mutations 历史

### 自定义 DevTools

```typescript
// 添加自定义标签
store.$id = 'user-store'

// 添加自定义检查器
if (import.meta.env.DEV) {
  store.$customInspector = {
    label: 'User Store',
    state: () => ({
      user: store.user,
      isLoggedIn: store.isLoggedIn
    })
  }
}
```

---

## 最佳实践

1. **命名规范**：使用 `use` 前缀和清晰的名称
2. **组合式 API**：优先使用组合式 API
3. **单一职责**：每个 store 只管理相关的状态
4. **TypeScript**：提供完整的类型定义
5. **错误处理**：在 action 中妥善处理错误
6. **性能优化**：使用 `$patch` 批量更新
7. **测试覆盖**：为关键逻辑编写测试
8. **文档化**：注释说明 store 的用途

---

## 参考资料

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [组合式 API Store](https://pinia.vuejs.org/core-concepts/#setup-stores)
- [测试 Store](https://pinia.vuejs.org/cookbook/testing.html)
- [SSR](https://pinia.vuejs.org/ssr/)
