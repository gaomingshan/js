# 第 50 节：测试策略

## 概述

全面的测试策略确保状态管理系统的稳定性和可靠性。本节介绍单元测试、集成测试、端到端测试的实施方法。

## 一、单元测试基础

### 1.1 Store 单元测试

```javascript
// tests/stores/userStore.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  describe('State', () => {
    it('should have initial state', () => {
      const store = useUserStore()
      
      expect(store.currentUser).toBeNull()
      expect(store.users).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })
  
  describe('Getters', () => {
    it('should calculate authenticated status', () => {
      const store = useUserStore()
      
      expect(store.isAuthenticated).toBe(false)
      
      store.currentUser = { id: 1, name: 'John' }
      expect(store.isAuthenticated).toBe(true)
    })
    
    it('should filter active users', () => {
      const store = useUserStore()
      
      store.users = [
        { id: 1, name: 'John', active: true },
        { id: 2, name: 'Jane', active: false },
        { id: 3, name: 'Bob', active: true }
      ]
      
      expect(store.activeUsers).toHaveLength(2)
      expect(store.activeUsers[0].name).toBe('John')
      expect(store.activeUsers[1].name).toBe('Bob')
    })
  })
  
  describe('Actions', () => {
    it('should set current user', () => {
      const store = useUserStore()
      const user = { id: 1, name: 'John' }
      
      store.setCurrentUser(user)
      
      expect(store.currentUser).toEqual(user)
    })
    
    it('should fetch users successfully', async () => {
      const store = useUserStore()
      const mockUsers = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ]
      
      // Mock API call
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsers)
        })
      )
      
      await store.fetchUsers()
      
      expect(store.users).toEqual(mockUsers)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
    
    it('should handle fetch users error', async () => {
      const store = useUserStore()
      
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Server Error'
        })
      )
      
      await store.fetchUsers()
      
      expect(store.users).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBe('Failed to fetch users: 500 Server Error')
    })
  })
})
```

### 1.2 测试工具与设置

```javascript
// tests/setup.js
import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 全局测试配置
config.global.mocks = {
  $t: (key) => key // 模拟 i18n
}

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// 模拟 fetch
global.fetch = vi.fn()

// 测试辅助工具
export const createMockStore = (initialState = {}) => {
  return {
    $id: 'mockStore',
    $state: { ...initialState },
    $patch: vi.fn(),
    $subscribe: vi.fn(),
    $dispose: vi.fn()
  }
}

export const mockApiResponse = (data, options = {}) => {
  const { status = 200, ok = true, delay = 0 } = options
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok,
        status,
        statusText: ok ? 'OK' : 'Error',
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data))
      })
    }, delay)
  })
}

export const mockApiError = (status = 500, message = 'Server Error') => {
  return Promise.resolve({
    ok: false,
    status,
    statusText: message,
    json: () => Promise.reject(new Error('Invalid JSON'))
  })
}
```

## 二、组件集成测试

### 2.1 组件与 Store 集成

```javascript
// tests/components/UserProfile.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import UserProfile from '@/components/UserProfile.vue'
import { useUserStore } from '@/stores/user'

describe('UserProfile Component', () => {
  let wrapper
  let store
  
  beforeEach(() => {
    setActivePinia(createPinia())
    store = useUserStore()
  })
  
  afterEach(() => {
    wrapper?.unmount()
  })
  
  it('should display loading state', () => {
    store.loading = true
    
    wrapper = mount(UserProfile)
    
    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.user-info').exists()).toBe(false)
  })
  
  it('should display user information', () => {
    store.currentUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    }
    
    wrapper = mount(UserProfile)
    
    expect(wrapper.find('.user-name').text()).toBe('John Doe')
    expect(wrapper.find('.user-email').text()).toBe('john@example.com')
  })
  
  it('should handle user update', async () => {
    store.currentUser = { id: 1, name: 'John' }
    const updateSpy = vi.spyOn(store, 'updateUser')
    
    wrapper = mount(UserProfile)
    
    await wrapper.find('input[name="name"]').setValue('Jane Doe')
    await wrapper.find('form').trigger('submit')
    
    expect(updateSpy).toHaveBeenCalledWith({
      id: 1,
      name: 'Jane Doe'
    })
  })
  
  it('should display error message', () => {
    store.error = 'Failed to load user data'
    
    wrapper = mount(UserProfile)
    
    expect(wrapper.find('.error-message').text()).toBe('Failed to load user data')
  })
})
```

### 2.2 状态变化测试

```javascript
// tests/integration/stateFlow.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

describe('State Flow Integration', () => {
  let userStore, authStore, notificationStore
  
  beforeEach(() => {
    setActivePinia(createPinia())
    userStore = useUserStore()
    authStore = useAuthStore()
    notificationStore = useNotificationStore()
  })
  
  it('should handle login flow correctly', async () => {
    // Mock successful login
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          user: { id: 1, name: 'John' },
          token: 'fake-token',
          permissions: ['read', 'write']
        })
      })
    )
    
    // 执行登录
    await authStore.login({ username: 'john', password: 'password' })
    
    // 验证状态变化
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user.name).toBe('John')
    expect(userStore.currentUser.name).toBe('John')
    expect(notificationStore.notifications).toContainEqual(
      expect.objectContaining({
        type: 'success',
        message: expect.stringContaining('登录成功')
      })
    )
  })
  
  it('should handle logout flow correctly', async () => {
    // 设置初始登录状态
    authStore.user = { id: 1, name: 'John' }
    authStore.isAuthenticated = true
    userStore.currentUser = { id: 1, name: 'John' }
    
    // 执行登出
    await authStore.logout()
    
    // 验证状态清理
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBeNull()
    expect(userStore.currentUser).toBeNull()
  })
  
  it('should handle cross-store dependencies', async () => {
    // 测试跨 store 依赖关系
    const userUpdateSpy = vi.spyOn(userStore, 'updateProfile')
    
    // 当认证用户更新时，用户 store 也应该更新
    await authStore.updateProfile({ name: 'Jane Doe' })
    
    expect(userUpdateSpy).toHaveBeenCalledWith({ name: 'Jane Doe' })
  })
})
```

## 三、端到端测试

### 3.1 E2E 测试场景

```javascript
// tests/e2e/userManagement.spec.js
import { test, expect } from '@playwright/test'

test.describe('User Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    
    // 登录
    await page.fill('[data-testid="username"]', 'testuser')
    await page.fill('[data-testid="password"]', 'password')
    await page.click('[data-testid="login-button"]')
    
    // 等待跳转到主页
    await expect(page).toHaveURL('/dashboard')
  })
  
  test('should create new user', async ({ page }) => {
    // 导航到用户管理页面
    await page.click('[data-testid="users-menu"]')
    await expect(page).toHaveURL('/users')
    
    // 点击创建用户按钮
    await page.click('[data-testid="create-user-button"]')
    
    // 填写用户表单
    await page.fill('[data-testid="user-name"]', 'New User')
    await page.fill('[data-testid="user-email"]', 'newuser@example.com')
    await page.selectOption('[data-testid="user-role"]', 'editor')
    
    // 提交表单
    await page.click('[data-testid="save-user-button"]')
    
    // 验证用户创建成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText('用户创建成功')
    await expect(page.locator('[data-testid="user-list"]')).toContainText('New User')
  })
  
  test('should update user information', async ({ page }) => {
    await page.goto('/users')
    
    // 点击编辑第一个用户
    await page.click('[data-testid="user-row"]:first-child [data-testid="edit-button"]')
    
    // 修改用户名
    await page.fill('[data-testid="user-name"]', 'Updated User Name')
    
    // 保存修改
    await page.click('[data-testid="save-user-button"]')
    
    // 验证更新成功
    await expect(page.locator('[data-testid="success-message"]')).toContainText('用户更新成功')
    await expect(page.locator('[data-testid="user-list"]')).toContainText('Updated User Name')
  })
  
  test('should handle network errors gracefully', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/api/users', (route) => {
      route.abort('failed')
    })
    
    await page.goto('/users')
    
    // 验证错误处理
    await expect(page.locator('[data-testid="error-message"]')).toContainText('网络连接失败')
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
    
    // 测试重试功能
    await page.unroute('**/api/users')
    await page.click('[data-testid="retry-button"]')
    
    await expect(page.locator('[data-testid="user-list"]')).toBeVisible()
  })
  
  test('should persist state across page reloads', async ({ page }) => {
    // 创建一些状态
    await page.goto('/users')
    await page.fill('[data-testid="search-input"]', 'john')
    
    // 刷新页面
    await page.reload()
    
    // 验证状态是否持久化
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('john')
  })
})
```

### 3.2 状态管理 E2E 测试工具

```javascript
// tests/e2e/helpers/stateHelpers.js
export class StateTestHelper {
  constructor(page) {
    this.page = page
  }
  
  // 获取 Pinia store 状态
  async getStoreState(storeId) {
    return await this.page.evaluate((id) => {
      const pinia = window.__PINIA__
      if (!pinia || !pinia.state.value[id]) {
        return null
      }
      return pinia.state.value[id]
    }, storeId)
  }
  
  // 触发 store action
  async dispatchAction(storeId, actionName, payload) {
    return await this.page.evaluate(({ id, action, data }) => {
      const pinia = window.__PINIA__
      const store = pinia._s.get(id)
      if (store && typeof store[action] === 'function') {
        return store[action](data)
      }
      throw new Error(`Action ${action} not found in store ${id}`)
    }, { id: storeId, action: actionName, data: payload })
  }
  
  // 等待状态变化
  async waitForStateChange(storeId, predicate, timeout = 5000) {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      const state = await this.getStoreState(storeId)
      if (predicate(state)) {
        return state
      }
      await this.page.waitForTimeout(100)
    }
    
    throw new Error(`State change timeout for store ${storeId}`)
  }
  
  // 模拟网络条件
  async simulateNetworkCondition(condition) {
    switch (condition) {
      case 'offline':
        await this.page.route('**/*', route => route.abort('failed'))
        break
      case 'slow':
        await this.page.route('**/*', route => {
          setTimeout(() => route.continue(), 2000)
        })
        break
      case 'online':
        await this.page.unroute('**/*')
        break
    }
  }
  
  // 清理所有状态
  async clearAllStates() {
    await this.page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
      
      // 重置 Pinia stores
      const pinia = window.__PINIA__
      if (pinia) {
        pinia._s.forEach(store => {
          if (typeof store.$reset === 'function') {
            store.$reset()
          }
        })
      }
    })
  }
}

// 使用示例
test('should sync state across tabs', async ({ context }) => {
  const page1 = await context.newPage()
  const page2 = await context.newPage()
  
  const helper1 = new StateTestHelper(page1)
  const helper2 = new StateTestHelper(page2)
  
  await page1.goto('/app')
  await page2.goto('/app')
  
  // 在第一个标签页中触发状态变化
  await helper1.dispatchAction('user', 'setCurrentUser', { id: 1, name: 'John' })
  
  // 验证第二个标签页中的状态同步
  const state2 = await helper2.waitForStateChange('user', 
    state => state.currentUser?.name === 'John'
  )
  
  expect(state2.currentUser.name).toBe('John')
})
```

## 四、性能测试

### 4.1 状态管理性能测试

```javascript
// tests/performance/storePerformance.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('Store Performance', () => {
  let store
  
  beforeEach(() => {
    setActivePinia(createPinia())
    store = useUserStore()
  })
  
  it('should handle large dataset efficiently', () => {
    const startTime = performance.now()
    
    // 添加大量数据
    const users = Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`
    }))
    
    store.setUsers(users)
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(100) // 应该在100ms内完成
    expect(store.users.length).toBe(10000)
  })
  
  it('should optimize getter computations', () => {
    // 设置测试数据
    store.setUsers(Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      active: i % 2 === 0
    })))
    
    const iterations = 1000
    const startTime = performance.now()
    
    // 多次访问 getter
    for (let i = 0; i < iterations; i++) {
      const activeUsers = store.activeUsers
      expect(activeUsers).toBeDefined()
    }
    
    const endTime = performance.now()
    const avgTime = (endTime - startTime) / iterations
    
    expect(avgTime).toBeLessThan(1) // 平均每次访问应该少于1ms
  })
  
  it('should handle frequent state updates', () => {
    const updateCount = 1000
    const startTime = performance.now()
    
    for (let i = 0; i < updateCount; i++) {
      store.$patch({
        counter: i,
        timestamp: Date.now()
      })
    }
    
    const endTime = performance.now()
    const avgTime = (endTime - startTime) / updateCount
    
    expect(avgTime).toBeLessThan(0.1) // 平均每次更新少于0.1ms
    expect(store.counter).toBe(updateCount - 1)
  })
})
```

### 4.2 内存泄漏测试

```javascript
// tests/performance/memoryLeak.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('Memory Leak Detection', () => {
  it('should properly cleanup store subscriptions', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    
    const subscriptions = []
    const stores = []
    
    // 创建多个 store 实例和订阅
    for (let i = 0; i < 100; i++) {
      const store = useUserStore()
      stores.push(store)
      
      const unsubscribe = store.$subscribe(() => {
        // 空回调
      })
      subscriptions.push(unsubscribe)
    }
    
    // 清理订阅
    subscriptions.forEach(unsub => unsub())
    
    // 销毁 stores
    stores.forEach(store => store.$dispose?.())
    
    // 验证清理
    const initialMemory = performance.memory?.usedJSHeapSize || 0
    
    // 强制垃圾回收（仅在支持的环境中）
    if (global.gc) {
      global.gc()
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0
    
    // 内存使用应该没有显著增长
    if (initialMemory && finalMemory) {
      expect(finalMemory - initialMemory).toBeLessThan(1024 * 1024) // 少于1MB
    }
  })
})
```

## 五、测试最佳实践

### 5.1 测试数据管理

```javascript
// tests/fixtures/userData.js
export const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    active: true,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'editor',
    active: true,
    createdAt: '2023-01-02T00:00:00Z'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'viewer',
    active: false,
    createdAt: '2023-01-03T00:00:00Z'
  }
]

export const createMockUser = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000) + 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'viewer',
  active: true,
  createdAt: new Date().toISOString(),
  ...overrides
})

export const createMockApiResponse = (data, options = {}) => ({
  data,
  status: options.status || 200,
  message: options.message || 'Success',
  pagination: options.pagination || {
    page: 1,
    limit: 10,
    total: Array.isArray(data) ? data.length : 1
  }
})
```

### 5.2 测试配置文件

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.js'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        './src/stores/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

## 参考资料

- [Vitest Testing Framework](https://vitest.dev/)
- [Vue Test Utils](https://vue-test-utils.vuejs.org/)
- [Playwright E2E Testing](https://playwright.dev/)

**下一节** → [第 51 节：开发工具](./51-development-tools.md)
