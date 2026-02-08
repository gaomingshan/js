# 第 17 节：测试

## 概述

测试是确保 Pinia Store 正确性和可靠性的重要手段。本节将详细介绍如何对 Pinia Store 进行单元测试、集成测试，以及如何使用 Mock 和测试工具。

## 一、测试环境配置

### 1.1 基本配置

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js']
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  }
})

// test/setup.js
import { beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  // 每个测试前创建新的 Pinia 实例
  setActivePinia(createPinia())
})
```

### 1.2 测试工具

```javascript
// test/utils.js
import { createPinia, setActivePinia } from 'pinia'
import { createApp } from 'vue'

// 创建测试用的 Pinia 实例
export function createTestPinia(initialState = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  
  // 设置初始状态
  if (Object.keys(initialState).length > 0) {
    Object.keys(initialState).forEach(storeId => {
      const store = pinia._s.get(storeId)
      if (store) {
        store.$patch(initialState[storeId])
      }
    })
  }
  
  return pinia
}

// 创建测试组件
export function createTestComponent(component, props = {}) {
  const app = createApp(component, props)
  return app
}

// Mock API 服务
export function createMockApi() {
  return {
    fetchUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn()
  }
}
```

## 二、Store 单元测试

### 2.1 基本 Store 测试

```javascript
// stores/counter.js
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  function reset() {
    count.value = 0
  }
  
  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset
  }
})

// test/stores/counter.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('初始状态正确', () => {
    const counter = useCounterStore()
    expect(counter.count).toBe(0)
    expect(counter.doubleCount).toBe(0)
  })
  
  it('increment 增加计数', () => {
    const counter = useCounterStore()
    counter.increment()
    expect(counter.count).toBe(1)
    expect(counter.doubleCount).toBe(2)
  })
  
  it('decrement 减少计数', () => {
    const counter = useCounterStore()
    counter.count = 5
    counter.decrement()
    expect(counter.count).toBe(4)
  })
  
  it('reset 重置计数', () => {
    const counter = useCounterStore()
    counter.count = 10
    counter.reset()
    expect(counter.count).toBe(0)
  })
  
  it('doubleCount 计算属性正确', () => {
    const counter = useCounterStore()
    counter.count = 3
    expect(counter.doubleCount).toBe(6)
  })
})
```

### 2.2 异步 Actions 测试

```javascript
// stores/user.js
export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  async function fetchUser(id) {
    loading.value = true
    error.value = null
    
    try {
      const userData = await api.fetchUser(id)
      user.value = userData
      return userData
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    user,
    loading,
    error,
    fetchUser
  }
})

// test/stores/user.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import * as api from '@/api'

// Mock API 模块
vi.mock('@/api', () => ({
  fetchUser: vi.fn()
}))

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })
  
  it('fetchUser 成功时更新用户数据', async () => {
    const mockUser = { id: 1, name: 'John Doe' }
    vi.mocked(api.fetchUser).mockResolvedValue(mockUser)
    
    const store = useUserStore()
    
    const result = await store.fetchUser(1)
    
    expect(api.fetchUser).toHaveBeenCalledWith(1)
    expect(store.user).toEqual(mockUser)
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
    expect(result).toEqual(mockUser)
  })
  
  it('fetchUser 失败时设置错误信息', async () => {
    const errorMessage = 'User not found'
    vi.mocked(api.fetchUser).mockRejectedValue(new Error(errorMessage))
    
    const store = useUserStore()
    
    await expect(store.fetchUser(999)).rejects.toThrow(errorMessage)
    
    expect(store.user).toBeNull()
    expect(store.error).toBe(errorMessage)
    expect(store.loading).toBe(false)
  })
  
  it('fetchUser 设置加载状态', async () => {
    let resolvePromise
    const promise = new Promise(resolve => { resolvePromise = resolve })
    vi.mocked(api.fetchUser).mockReturnValue(promise)
    
    const store = useUserStore()
    
    const fetchPromise = store.fetchUser(1)
    
    // 验证加载状态
    expect(store.loading).toBe(true)
    
    resolvePromise({ id: 1, name: 'John' })
    await fetchPromise
    
    // 验证加载完成
    expect(store.loading).toBe(false)
  })
})
```

## 三、组件与 Store 集成测试

### 3.1 组件测试配置

```javascript
// test/components/UserProfile.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import UserProfile from '@/components/UserProfile.vue'
import { useUserStore } from '@/stores/user'

const createWrapper = (props = {}) => {
  return mount(UserProfile, {
    global: {
      plugins: [createPinia()]
    },
    props
  })
}

describe('UserProfile Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('显示用户信息', async () => {
    const wrapper = createWrapper()
    const store = useUserStore()
    
    // 设置用户数据
    store.user = { id: 1, name: 'Alice', email: 'alice@example.com' }
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('alice@example.com')
  })
  
  it('显示加载状态', async () => {
    const wrapper = createWrapper()
    const store = useUserStore()
    
    store.loading = true
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.loading').exists()).toBe(true)
  })
  
  it('调用 store action', async () => {
    const wrapper = createWrapper()
    const store = useUserStore()
    
    // Mock store action
    const mockFetchUser = vi.fn().mockResolvedValue({})
    store.fetchUser = mockFetchUser
    
    // 触发按钮点击
    await wrapper.find('.refresh-btn').trigger('click')
    
    expect(mockFetchUser).toHaveBeenCalled()
  })
})
```

### 3.2 路由与 Store 测试

```javascript
// test/router/guards.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { routes } from '@/router'

const createTestRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes
  })
}

describe('Router Guards', () => {
  let router
  
  beforeEach(() => {
    setActivePinia(createPinia())
    router = createTestRouter()
  })
  
  it('未登录用户访问受保护路由时重定向到登录页', async () => {
    const authStore = useAuthStore()
    authStore.isLoggedIn = false
    
    await router.push('/dashboard')
    
    expect(router.currentRoute.value.name).toBe('login')
  })
  
  it('已登录用户可以访问受保护路由', async () => {
    const authStore = useAuthStore()
    authStore.isLoggedIn = true
    
    await router.push('/dashboard')
    
    expect(router.currentRoute.value.name).toBe('dashboard')
  })
})
```

## 四、Mock 和模拟

### 4.1 API Mock

```javascript
// test/mocks/api.js
export const mockApi = {
  // 用户相关 API Mock
  users: {
    fetchAll: vi.fn(() => Promise.resolve([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ])),
    
    fetchById: vi.fn((id) => {
      const users = {
        1: { id: 1, name: 'Alice', email: 'alice@example.com' },
        2: { id: 2, name: 'Bob', email: 'bob@example.com' }
      }
      
      if (users[id]) {
        return Promise.resolve(users[id])
      }
      return Promise.reject(new Error('User not found'))
    }),
    
    create: vi.fn((userData) => Promise.resolve({
      id: Date.now(),
      ...userData
    })),
    
    update: vi.fn((id, updates) => Promise.resolve({
      id,
      ...updates
    })),
    
    delete: vi.fn(() => Promise.resolve())
  },
  
  // 设置延迟
  delay: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))
}

// 在测试中使用
import { mockApi } from './mocks/api'

beforeEach(() => {
  // 重置所有 mock
  Object.values(mockApi.users).forEach(mock => {
    if (typeof mock.mockClear === 'function') {
      mock.mockClear()
    }
  })
})
```

### 4.2 Store Mock

```javascript
// test/mocks/stores.js
export function createMockUserStore(initialState = {}) {
  const defaultState = {
    user: null,
    loading: false,
    error: null
  }
  
  const state = reactive({ ...defaultState, ...initialState })
  
  return {
    // 状态
    ...toRefs(state),
    
    // Mock actions
    fetchUser: vi.fn().mockImplementation(async (id) => {
      state.loading = true
      
      try {
        const user = await mockApi.users.fetchById(id)
        state.user = user
        return user
      } catch (error) {
        state.error = error.message
        throw error
      } finally {
        state.loading = false
      }
    }),
    
    login: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn().mockImplementation(() => {
      state.user = null
    }),
    
    // 辅助方法
    $patch: vi.fn(),
    $reset: vi.fn(),
    $subscribe: vi.fn(),
    $onAction: vi.fn()
  }
}

// 使用 Mock Store
describe('Component with Mock Store', () => {
  it('使用 mock store 进行测试', () => {
    const mockStore = createMockUserStore({
      user: { id: 1, name: 'Test User' }
    })
    
    // 在测试中使用 mock store
    expect(mockStore.user.name).toBe('Test User')
    
    // 验证 action 调用
    mockStore.fetchUser(1)
    expect(mockStore.fetchUser).toHaveBeenCalledWith(1)
  })
})
```

## 五、测试最佳实践

### 5.1 测试结构

```javascript
// 良好的测试结构示例
describe('Todo Store', () => {
  // 测试分组
  describe('状态管理', () => {
    it('应该正确初始化状态', () => {
      // 测试初始状态
    })
    
    it('应该正确更新状态', () => {
      // 测试状态更新
    })
  })
  
  describe('计算属性', () => {
    it('应该正确计算已完成的待办事项', () => {
      // 测试 getter
    })
  })
  
  describe('Actions', () => {
    describe('addTodo', () => {
      it('应该成功添加待办事项', () => {
        // 测试成功情况
      })
      
      it('应该处理添加失败的情况', () => {
        // 测试失败情况
      })
    })
    
    describe('deleteTodo', () => {
      it('应该成功删除待办事项', () => {
        // 测试删除
      })
    })
  })
})
```

### 5.2 测试数据工厂

```javascript
// test/factories/user.js
export const userFactory = {
  build: (overrides = {}) => ({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    ...overrides
  }),
  
  buildList: (count = 3, overrides = {}) => {
    return Array.from({ length: count }, (_, index) => 
      userFactory.build({ id: index + 1, ...overrides })
    )
  },
  
  admin: (overrides = {}) => userFactory.build({
    role: 'admin',
    ...overrides
  })
}

// 使用工厂
describe('User Store', () => {
  it('应该管理用户列表', () => {
    const store = useUserStore()
    const users = userFactory.buildList(5)
    
    store.setUsers(users)
    
    expect(store.users).toHaveLength(5)
    expect(store.users[0]).toMatchObject({
      id: 1,
      name: 'Test User'
    })
  })
})
```

### 5.3 异步测试

```javascript
describe('异步操作测试', () => {
  it('应该处理并发请求', async () => {
    const store = useUserStore()
    
    // Mock 并发 API 调用
    const promises = [
      store.fetchUser(1),
      store.fetchUser(2),
      store.fetchUser(3)
    ]
    
    const results = await Promise.all(promises)
    
    expect(results).toHaveLength(3)
    expect(store.loading).toBe(false)
  })
  
  it('应该正确处理请求竞态', async () => {
    const store = useUserStore()
    
    // 模拟慢请求
    mockApi.users.fetchById.mockImplementation((id) => {
      const delay = id === 1 ? 200 : 50
      return new Promise(resolve => {
        setTimeout(() => resolve({ id, name: `User ${id}` }), delay)
      })
    })
    
    // 先发起慢请求，再发起快请求
    const slowPromise = store.fetchUser(1)
    const fastPromise = store.fetchUser(2)
    
    await Promise.all([slowPromise, fastPromise])
    
    // 验证最终状态是最后完成的请求
    expect(store.user.id).toBe(1)
  })
})
```

## 六、端到端测试

### 6.1 E2E 测试配置

```javascript
// e2e/user-workflow.spec.js
import { test, expect } from '@playwright/test'

test.describe('用户工作流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })
  
  test('用户登录和数据管理', async ({ page }) => {
    // 登录
    await page.fill('[data-testid="username"]', 'testuser')
    await page.fill('[data-testid="password"]', 'password')
    await page.click('[data-testid="login-btn"]')
    
    // 验证登录成功
    await expect(page.locator('[data-testid="user-name"]')).toContainText('testuser')
    
    // 添加数据
    await page.click('[data-testid="add-item-btn"]')
    await page.fill('[data-testid="item-name"]', '新项目')
    await page.click('[data-testid="save-btn"]')
    
    // 验证数据已添加
    await expect(page.locator('[data-testid="item-list"]')).toContainText('新项目')
  })
})
```

### 6.2 测试覆盖率

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

## 参考资料

- [Pinia Testing Guide](https://pinia.vuejs.org/cookbook/testing.html)
- [Vitest Documentation](https://vitest.dev/)
- [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
- [Playwright Testing](https://playwright.dev/)

**下一节** → [第 18 节：TypeScript 支持](./18-pinia-typescript.md)
