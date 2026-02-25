# 4.4 测试策略

## 概述

测试是保证代码质量的重要手段。本节介绍如何对 Pinia Store 进行单元测试，包括测试 State、Getters、Actions 以及异步操作。

## 单元测试 Store

### 测试环境搭建

```bash
# 安装测试依赖
npm install -D vitest @vue/test-utils
```

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom'
  }
})
```

### 基本测试示例

```javascript
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  actions: {
    increment() {
      this.count++
    },
    
    incrementBy(amount) {
      this.count += amount
    }
  }
})

// stores/__tests__/counter.spec.js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '../counter'

describe('Counter Store', () => {
  beforeEach(() => {
    // 每个测试前创建新的 pinia 实例
    setActivePinia(createPinia())
  })
  
  it('初始 state 正确', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
  })
  
  it('increment 增加计数', () => {
    const store = useCounterStore()
    store.increment()
    expect(store.count).toBe(1)
  })
  
  it('incrementBy 按指定数量增加', () => {
    const store = useCounterStore()
    store.incrementBy(5)
    expect(store.count).toBe(5)
  })
  
  it('doubleCount getter 正确计算', () => {
    const store = useCounterStore()
    store.count = 10
    expect(store.doubleCount).toBe(20)
  })
})
```

### 测试 State 修改

```javascript
// stores/user.js
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    age: 0,
    email: ''
  }),
  
  actions: {
    updateUser(userData) {
      this.$patch(userData)
    },
    
    resetUser() {
      this.$reset()
    }
  }
})

// stores/__tests__/user.spec.js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('直接修改 state', () => {
    const store = useUserStore()
    store.name = 'Alice'
    store.age = 25
    
    expect(store.name).toBe('Alice')
    expect(store.age).toBe(25)
  })
  
  it('使用 $patch 批量修改', () => {
    const store = useUserStore()
    store.$patch({
      name: 'Bob',
      age: 30
    })
    
    expect(store.name).toBe('Bob')
    expect(store.age).toBe(30)
  })
  
  it('使用 $reset 重置状态', () => {
    const store = useUserStore()
    store.name = 'Alice'
    store.age = 25
    
    store.$reset()
    
    expect(store.name).toBe('')
    expect(store.age).toBe(0)
  })
  
  it('updateUser action 正确更新', () => {
    const store = useUserStore()
    store.updateUser({
      name: 'Charlie',
      email: 'charlie@example.com'
    })
    
    expect(store.name).toBe('Charlie')
    expect(store.email).toBe('charlie@example.com')
  })
})
```

## 模拟（Mock）Store 数据

### 创建测试用 Store

```javascript
// tests/helpers/createTestStore.js
import { setActivePinia, createPinia } from 'pinia'

export function createTestStore(storeDefinition, initialState = {}) {
  setActivePinia(createPinia())
  const store = storeDefinition()
  
  // 设置初始状态
  store.$patch(initialState)
  
  return store
}

// 使用
import { useUserStore } from '@/stores/user'
import { createTestStore } from '@/tests/helpers/createTestStore'

const userStore = createTestStore(useUserStore, {
  name: 'Test User',
  age: 25
})
```

### Mock Actions

```javascript
import { describe, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'

describe('User Store Actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('mock action 调用', () => {
    const store = useUserStore()
    
    // Mock action
    const mockFetchUser = vi.fn()
    store.fetchUser = mockFetchUser
    
    // 调用
    store.fetchUser(123)
    
    // 验证
    expect(mockFetchUser).toHaveBeenCalledWith(123)
    expect(mockFetchUser).toHaveBeenCalledTimes(1)
  })
})
```

### Mock 依赖的其他 Store

```javascript
// stores/cart.js
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  actions: {
    checkout() {
      const userStore = useUserStore()
      
      if (!userStore.isLoggedIn) {
        throw new Error('请先登录')
      }
      
      // 结算逻辑...
    }
  }
})

// stores/__tests__/cart.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '../cart'
import { useUserStore } from '../user'

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('未登录时 checkout 抛出错误', () => {
    const cartStore = useCartStore()
    const userStore = useUserStore()
    
    // Mock user store 状态
    userStore.isLoggedIn = false
    
    expect(() => {
      cartStore.checkout()
    }).toThrow('请先登录')
  })
  
  it('已登录时 checkout 成功', () => {
    const cartStore = useCartStore()
    const userStore = useUserStore()
    
    // Mock user store 状态
    userStore.isLoggedIn = true
    
    expect(() => {
      cartStore.checkout()
    }).not.toThrow()
  })
})
```

## 测试异步 Actions

### 基本异步测试

```javascript
// stores/user.js
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchUser(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/users/${id}`)
        this.user = await response.json()
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// stores/__tests__/user.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'

describe('User Store Async', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('fetchUser 成功获取数据', async () => {
    const store = useUserStore()
    
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 1, name: 'Alice' })
      })
    )
    
    await store.fetchUser(1)
    
    expect(store.user).toEqual({ id: 1, name: 'Alice' })
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })
  
  it('fetchUser 失败处理错误', async () => {
    const store = useUserStore()
    
    // Mock fetch 失败
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    )
    
    await expect(store.fetchUser(1)).rejects.toThrow('Network error')
    
    expect(store.user).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBe('Network error')
  })
  
  it('loading 状态正确切换', async () => {
    const store = useUserStore()
    
    global.fetch = vi.fn(() =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            json: () => Promise.resolve({ id: 1, name: 'Alice' })
          })
        }, 100)
      })
    )
    
    const promise = store.fetchUser(1)
    
    // 请求中
    expect(store.loading).toBe(true)
    
    await promise
    
    // 请求完成
    expect(store.loading).toBe(false)
  })
})
```

### Mock API 请求

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductStore } from '../product'

describe('Product Store API', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    
    // 清除所有 mock
    vi.clearAllMocks()
  })
  
  it('fetchProducts 调用正确的 API', async () => {
    const store = useProductStore()
    
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([
          { id: 1, name: 'Product 1' },
          { id: 2, name: 'Product 2' }
        ])
      })
    )
    
    global.fetch = mockFetch
    
    await store.fetchProducts()
    
    expect(mockFetch).toHaveBeenCalledWith('/api/products')
    expect(store.products).toHaveLength(2)
  })
})
```

## 测试最佳实践

### 1. 隔离测试

每个测试应该独立，不依赖其他测试：

```javascript
describe('Counter Store', () => {
  let store
  
  beforeEach(() => {
    // 每个测试都有新的 store 实例
    setActivePinia(createPinia())
    store = useCounterStore()
  })
  
  it('test 1', () => {
    store.count = 10
    expect(store.count).toBe(10)
  })
  
  it('test 2', () => {
    // 不受 test 1 影响
    expect(store.count).toBe(0)
  })
})
```

### 2. 测试边界情况

```javascript
it('处理空数组', () => {
  const store = useCartStore()
  store.items = []
  
  expect(store.total).toBe(0)
  expect(store.itemCount).toBe(0)
})

it('处理 null 值', () => {
  const store = useUserStore()
  store.user = null
  
  expect(store.userName).toBe('Guest')
})

it('处理大数值', () => {
  const store = useCounterStore()
  store.count = Number.MAX_SAFE_INTEGER
  store.increment()
  
  // 验证溢出处理
})
```

### 3. 组织测试结构

```javascript
describe('User Store', () => {
  describe('State', () => {
    it('初始状态正确', () => {})
    it('修改状态', () => {})
  })
  
  describe('Getters', () => {
    it('greeting getter', () => {})
    it('isAdult getter', () => {})
  })
  
  describe('Actions', () => {
    describe('fetchUser', () => {
      it('成功获取', async () => {})
      it('失败处理', async () => {})
      it('loading 状态', async () => {})
    })
    
    describe('updateUser', () => {
      it('更新用户信息', () => {})
    })
  })
})
```

### 4. 使用测试工具函数

```javascript
// tests/helpers/storeHelpers.js
export function createMockStore(storeDefinition, state = {}) {
  setActivePinia(createPinia())
  const store = storeDefinition()
  store.$patch(state)
  return store
}

export function mockFetch(data, error = null) {
  return vi.fn(() => {
    if (error) {
      return Promise.reject(error)
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data)
    })
  })
}

// 使用
import { createMockStore, mockFetch } from '@/tests/helpers/storeHelpers'

it('test', async () => {
  const store = createMockStore(useUserStore, { name: 'Alice' })
  global.fetch = mockFetch({ id: 1, name: 'Bob' })
  
  await store.fetchUser(1)
  expect(store.user.name).toBe('Bob')
})
```

### 5. 快照测试

```javascript
it('store state 快照', () => {
  const store = useUserStore()
  store.$patch({
    name: 'Alice',
    age: 25,
    email: 'alice@example.com'
  })
  
  expect(store.$state).toMatchSnapshot()
})
```

## 关键点总结

1. **beforeEach 隔离**：每个测试创建新的 Pinia 实例
2. **Mock 依赖**：使用 vi.fn() mock 外部依赖
3. **异步测试**：使用 async/await 测试异步 actions
4. **边界情况**：测试空值、边界值、错误情况
5. **测试组织**：按 State、Getters、Actions 组织测试

## 深入一点

### 集成测试

```javascript
// tests/integration/userFlow.spec.js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'

describe('用户购物流程', () => {
  let auth, cart, order
  
  beforeEach(() => {
    setActivePinia(createPinia())
    auth = useAuthStore()
    cart = useCartStore()
    order = useOrderStore()
  })
  
  it('完整购物流程', async () => {
    // 1. 登录
    await auth.login({ username: 'test', password: 'password' })
    expect(auth.isLoggedIn).toBe(true)
    
    // 2. 添加商品到购物车
    cart.addItem({ id: 1, name: 'Product', price: 100 })
    expect(cart.items).toHaveLength(1)
    
    // 3. 创建订单
    await order.createOrder()
    expect(order.orders).toHaveLength(1)
    expect(cart.items).toHaveLength(0)
  })
})
```

### E2E 测试（使用 Playwright）

```javascript
// e2e/cart.spec.js
import { test, expect } from '@playwright/test'

test('购物车流程', async ({ page }) => {
  await page.goto('/')
  
  // 添加商品
  await page.click('[data-test="add-to-cart"]')
  
  // 验证购物车数量
  await expect(page.locator('[data-test="cart-count"]')).toHaveText('1')
  
  // 打开购物车
  await page.click('[data-test="cart-icon"]')
  
  // 验证商品在购物车中
  await expect(page.locator('[data-test="cart-item"]')).toBeVisible()
})
```

## 参考资料

- [Vitest 文档](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Pinia 测试](https://pinia.vuejs.org/cookbook/testing.html)
- [Testing Library](https://testing-library.com/)
