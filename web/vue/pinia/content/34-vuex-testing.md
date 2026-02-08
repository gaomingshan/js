# 第 34 节：测试

## 概述

测试是确保 Vuex Store 可靠性的关键环节。本节介绍如何对 Vuex 的各个部分进行单元测试和集成测试，包括 State、Mutations、Actions、Getters 和完整的 Store。

## 一、测试基础设置

### 1.1 测试环境配置

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom', // 模拟浏览器环境
    globals: true,
    setupFiles: ['./test/setup.js']
  }
})

// test/setup.js
import { vi } from 'vitest'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock
global.sessionStorage = localStorageMock
```

### 1.2 基本测试结构

```javascript
// tests/store/user.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createStore } from 'vuex'
import userModule from '@/store/modules/user'

describe('User Store Module', () => {
  let store
  
  beforeEach(() => {
    // 每个测试前重新创建 store
    store = createStore({
      modules: {
        user: userModule
      }
    })
  })
  
  afterEach(() => {
    vi.resetAllMocks()
  })
  
  // 测试用例...
})
```

## 二、Mutations 测试

### 2.1 基本 Mutations 测试

```javascript
// tests/store/mutations.test.js
import { describe, it, expect } from 'vitest'
import mutations from '@/store/modules/user/mutations'

describe('User Mutations', () => {
  it('SET_USER should update user state', () => {
    const state = { user: null }
    const user = { id: 1, name: 'John' }
    
    mutations.SET_USER(state, user)
    
    expect(state.user).toEqual(user)
  })
  
  it('UPDATE_USER_PROFILE should merge profile data', () => {
    const state = {
      user: {
        id: 1,
        name: 'John',
        email: 'john@example.com'
      }
    }
    
    const updates = { name: 'John Doe', age: 30 }
    
    mutations.UPDATE_USER_PROFILE(state, updates)
    
    expect(state.user).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    })
  })
  
  it('ADD_TODO should add new todo to list', () => {
    const state = { todos: [] }
    const todo = { text: 'Test todo', completed: false }
    
    mutations.ADD_TODO(state, todo)
    
    expect(state.todos).toHaveLength(1)
    expect(state.todos[0]).toMatchObject(todo)
    expect(state.todos[0]).toHaveProperty('id')
  })
  
  it('TOGGLE_TODO should toggle todo completion', () => {
    const state = {
      todos: [
        { id: 1, text: 'Todo 1', completed: false },
        { id: 2, text: 'Todo 2', completed: true }
      ]
    }
    
    mutations.TOGGLE_TODO(state, 1)
    
    expect(state.todos[0].completed).toBe(true)
    expect(state.todos[1].completed).toBe(true) // 不应该改变
  })
})
```

### 2.2 复杂 Mutations 测试

```javascript
// 测试复杂的状态变更
describe('Complex Mutations', () => {
  it('UPDATE_NESTED_STATE should handle deep updates', () => {
    const state = {
      user: {
        profile: {
          personal: { name: 'John', age: 25 },
          preferences: { theme: 'light', lang: 'en' }
        },
        settings: { notifications: true }
      }
    }
    
    mutations.UPDATE_NESTED_STATE(state, {
      path: 'user.profile.personal',
      updates: { age: 26, city: 'NYC' }
    })
    
    expect(state.user.profile.personal).toEqual({
      name: 'John',
      age: 26,
      city: 'NYC'
    })
  })
  
  it('BATCH_UPDATE should handle multiple updates', () => {
    const state = {
      items: [
        { id: 1, name: 'Item 1', active: false },
        { id: 2, name: 'Item 2', active: false }
      ]
    }
    
    const updates = [
      { id: 1, updates: { active: true } },
      { id: 2, updates: { name: 'Updated Item 2' } }
    ]
    
    mutations.BATCH_UPDATE(state, updates)
    
    expect(state.items[0].active).toBe(true)
    expect(state.items[1].name).toBe('Updated Item 2')
  })
})
```

## 三、Actions 测试

### 3.1 异步 Actions 测试

```javascript
// tests/store/actions.test.js
import { describe, it, expect, vi } from 'vitest'
import actions from '@/store/modules/user/actions'

describe('User Actions', () => {
  const createMockContext = (state = {}) => ({
    state,
    commit: vi.fn(),
    dispatch: vi.fn(),
    getters: {},
    rootState: {},
    rootGetters: {}
  })
  
  it('fetchUser should fetch and commit user data', async () => {
    const mockUser = { id: 1, name: 'John' }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    })
    
    const context = createMockContext()
    
    const result = await actions.fetchUser(context, 1)
    
    expect(fetch).toHaveBeenCalledWith('/api/users/1')
    expect(context.commit).toHaveBeenCalledWith('SET_LOADING', true)
    expect(context.commit).toHaveBeenCalledWith('SET_USER', mockUser)
    expect(context.commit).toHaveBeenCalledWith('SET_LOADING', false)
    expect(result).toEqual(mockUser)
  })
  
  it('fetchUser should handle API errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    const context = createMockContext()
    
    await expect(actions.fetchUser(context, 1)).rejects.toThrow('Network error')
    expect(context.commit).toHaveBeenCalledWith('SET_ERROR', 'Network error')
  })
  
  it('login should dispatch multiple actions', async () => {
    const credentials = { email: 'test@example.com', password: 'password' }
    const user = { id: 1, email: 'test@example.com' }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user, token: 'abc123' })
    })
    
    const context = createMockContext()
    context.dispatch.mockResolvedValue()
    
    await actions.login(context, credentials)
    
    expect(context.commit).toHaveBeenCalledWith('SET_USER', user)
    expect(context.dispatch).toHaveBeenCalledWith('fetchUserPreferences', user.id)
    expect(localStorage.setItem).toHaveBeenCalledWith('auth-token', 'abc123')
  })
})
```

### 3.2 带依赖的 Actions 测试

```javascript
describe('Actions with Dependencies', () => {
  it('complex action should orchestrate multiple operations', async () => {
    const context = createMockContext({
      user: { id: 1 }
    })
    
    // Mock 依赖的其他 actions
    context.dispatch
      .mockResolvedValueOnce({ data: 'profile' })    // fetchProfile
      .mockResolvedValueOnce({ data: 'preferences' }) // fetchPreferences
      .mockResolvedValueOnce({ data: 'notifications' }) // fetchNotifications
    
    await actions.initializeUserData(context)
    
    expect(context.dispatch).toHaveBeenCalledTimes(3)
    expect(context.dispatch).toHaveBeenNthCalledWith(1, 'fetchProfile')
    expect(context.dispatch).toHaveBeenNthCalledWith(2, 'fetchPreferences')
    expect(context.dispatch).toHaveBeenNthCalledWith(3, 'fetchNotifications')
  })
})
```

## 四、Getters 测试

### 4.1 基本 Getters 测试

```javascript
// tests/store/getters.test.js
import { describe, it, expect } from 'vitest'
import getters from '@/store/modules/user/getters'

describe('User Getters', () => {
  it('isLoggedIn should return true when user exists', () => {
    const state = { user: { id: 1, name: 'John' } }
    
    expect(getters.isLoggedIn(state)).toBe(true)
  })
  
  it('isLoggedIn should return false when user is null', () => {
    const state = { user: null }
    
    expect(getters.isLoggedIn(state)).toBe(false)
  })
  
  it('completedTodos should filter completed todos', () => {
    const state = {
      todos: [
        { id: 1, text: 'Todo 1', completed: true },
        { id: 2, text: 'Todo 2', completed: false },
        { id: 3, text: 'Todo 3', completed: true }
      ]
    }
    
    const result = getters.completedTodos(state)
    
    expect(result).toHaveLength(2)
    expect(result.map(t => t.id)).toEqual([1, 3])
  })
  
  it('getTodoById should return function that finds todo by id', () => {
    const state = {
      todos: [
        { id: 1, text: 'Todo 1' },
        { id: 2, text: 'Todo 2' }
      ]
    }
    
    const getTodoById = getters.getTodoById(state)
    
    expect(getTodoById(1)).toEqual({ id: 1, text: 'Todo 1' })
    expect(getTodoById(3)).toBeUndefined()
  })
})
```

### 4.2 依赖其他 Getters 的测试

```javascript
describe('Dependent Getters', () => {
  it('todoStats should use other getters', () => {
    const state = {
      todos: [
        { id: 1, text: 'Todo 1', completed: true },
        { id: 2, text: 'Todo 2', completed: false }
      ]
    }
    
    // Mock 其他 getters
    const mockGetters = {
      completedTodos: [{ id: 1, text: 'Todo 1', completed: true }],
      pendingTodos: [{ id: 2, text: 'Todo 2', completed: false }]
    }
    
    const result = getters.todoStats(state, mockGetters)
    
    expect(result).toEqual({
      total: 2,
      completed: 1,
      pending: 1,
      completionRate: 0.5
    })
  })
})
```

## 五、完整 Store 集成测试

### 5.1 Store 集成测试

```javascript
// tests/store/integration.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'vuex'
import userModule from '@/store/modules/user'

describe('Store Integration Tests', () => {
  let store
  
  beforeEach(() => {
    store = createStore({
      modules: {
        user: {
          namespaced: true,
          ...userModule
        }
      }
    })
  })
  
  it('complete user flow should work', async () => {
    // Mock API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'John' })
    })
    
    // 初始状态
    expect(store.getters['user/isLoggedIn']).toBe(false)
    
    // 执行登录 action
    await store.dispatch('user/fetchUser', 1)
    
    // 验证状态变化
    expect(store.state.user.user).toEqual({ id: 1, name: 'John' })
    expect(store.getters['user/isLoggedIn']).toBe(true)
    
    // 执行登出
    store.commit('user/LOGOUT')
    
    // 验证状态重置
    expect(store.state.user.user).toBeNull()
    expect(store.getters['user/isLoggedIn']).toBe(false)
  })
  
  it('error handling should work correctly', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'))
    
    await expect(store.dispatch('user/fetchUser', 1)).rejects.toThrow('API Error')
    
    expect(store.state.user.error).toBe('API Error')
    expect(store.state.user.loading).toBe(false)
  })
})
```

## 六、组件与 Store 集成测试

### 6.1 Vue 组件测试

```javascript
// tests/components/UserProfile.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import UserProfile from '@/components/UserProfile.vue'

describe('UserProfile Component', () => {
  let store
  let wrapper
  
  beforeEach(() => {
    store = createStore({
      modules: {
        user: {
          namespaced: true,
          state: () => ({
            user: null,
            loading: false
          }),
          getters: {
            isLoggedIn: (state) => !!state.user
          },
          mutations: {
            SET_USER: (state, user) => {
              state.user = user
            }
          },
          actions: {
            fetchUser: vi.fn()
          }
        }
      }
    })
    
    wrapper = mount(UserProfile, {
      global: {
        plugins: [store]
      }
    })
  })
  
  it('should display login prompt when not logged in', () => {
    expect(wrapper.text()).toContain('请登录')
    expect(wrapper.find('[data-test="user-info"]').exists()).toBe(false)
  })
  
  it('should display user info when logged in', async () => {
    // 更新 store 状态
    await store.commit('user/SET_USER', { id: 1, name: 'John' })
    
    expect(wrapper.find('[data-test="user-info"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('John')
  })
  
  it('should call fetchUser action on mount', () => {
    expect(store._actions['user/fetchUser']).toHaveBeenCalled()
  })
})
```

## 七、测试最佳实践

### 7.1 测试工具函数

```javascript
// tests/utils/store-utils.js
import { createStore } from 'vuex'

export const createTestStore = (modules = {}) => {
  return createStore({
    modules,
    strict: false // 测试环境关闭严格模式
  })
}

export const createMockContext = (overrides = {}) => ({
  state: {},
  commit: vi.fn(),
  dispatch: vi.fn(),
  getters: {},
  rootState: {},
  rootGetters: {},
  ...overrides
})

export const waitForAction = async (store, actionName) => {
  return new Promise((resolve) => {
    const unsubscribe = store.subscribeAction((action) => {
      if (action.type === actionName) {
        unsubscribe()
        resolve()
      }
    })
  })
}

// 断言助手
export const expectMutation = (mutations, type) => {
  const mutation = mutations.find(m => m.type === type)
  expect(mutation).toBeDefined()
  return mutation
}
```

### 7.2 测试数据工厂

```javascript
// tests/factories/user-factory.js
export const createUser = (overrides = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  avatar: null,
  createdAt: new Date().toISOString(),
  ...overrides
})

export const createTodo = (overrides = {}) => ({
  id: Date.now(),
  text: 'Test todo',
  completed: false,
  createdAt: new Date().toISOString(),
  ...overrides
})

// 使用示例
it('should handle user data correctly', () => {
  const user = createUser({ name: 'Custom Name' })
  // 测试逻辑...
})
```

### 7.3 异步测试模式

```javascript
// 测试异步操作的常见模式
describe('Async Testing Patterns', () => {
  it('should wait for async operations', async () => {
    const promise = store.dispatch('fetchData')
    
    // 验证加载状态
    expect(store.state.loading).toBe(true)
    
    // 等待完成
    await promise
    
    // 验证最终状态
    expect(store.state.loading).toBe(false)
    expect(store.state.data).toBeDefined()
  })
  
  it('should handle race conditions', async () => {
    const promise1 = store.dispatch('fetchUser', 1)
    const promise2 = store.dispatch('fetchUser', 2)
    
    await Promise.all([promise1, promise2])
    
    // 验证最后一个请求的结果
    expect(store.state.user.id).toBe(2)
  })
})
```

## 参考资料

- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Vitest 文档](https://vitest.dev/)
- [Vuex 测试指南](https://vuex.vuejs.org/guide/testing.html)

**下一节** → [第 35 节：调试技巧](./35-vuex-debugging.md)
