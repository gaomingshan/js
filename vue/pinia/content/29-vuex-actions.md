# 第 29 节：Actions 动作

## 概述

Actions 用于处理异步操作和复杂的业务逻辑。与 Mutations 不同，Actions 可以包含任意异步操作，并通过提交 Mutations 来改变状态。

## 一、基本用法

### 1.1 定义 Actions

```javascript
// store/index.js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      user: null,
      todos: [],
      loading: false,
      error: null
    }
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    },
    
    SET_USER(state, user) {
      state.user = user
    },
    
    SET_TODOS(state, todos) {
      state.todos = todos
    },
    
    ADD_TODO(state, todo) {
      state.todos.push(todo)
    }
  },
  
  actions: {
    // 基本异步 action
    async fetchUser({ commit }, userId) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }
        
        const user = await response.json()
        commit('SET_USER', user)
        return user
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 带参数的 action
    async login({ commit, dispatch }, { email, password }) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        })
        
        if (!response.ok) {
          throw new Error('Login failed')
        }
        
        const { user, token } = await response.json()
        
        // 存储 token
        localStorage.setItem('auth-token', token)
        
        // 设置用户信息
        commit('SET_USER', user)
        
        // 获取用户相关数据
        await dispatch('fetchUserTodos', user.id)
        
        return user
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // 调用其他 actions
    async fetchUserTodos({ commit, dispatch }, userId) {
      try {
        const response = await fetch(`/api/users/${userId}/todos`)
        const todos = await response.json()
        commit('SET_TODOS', todos)
      } catch (error) {
        console.error('Failed to fetch todos:', error)
      }
    },
    
    // 同步 action
    logout({ commit }) {
      localStorage.removeItem('auth-token')
      commit('SET_USER', null)
      commit('SET_TODOS', [])
    }
  }
})

export default store
```

### 1.2 分发 Actions

```vue
<template>
  <div class="actions-example">
    <div v-if="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="!user" class="login-form">
      <input v-model="email" placeholder="邮箱" />
      <input v-model="password" type="password" placeholder="密码" />
      <button @click="handleLogin" :disabled="loading">登录</button>
    </div>
    
    <div v-else class="user-dashboard">
      <h2>欢迎, {{ user.name }}</h2>
      <button @click="handleLogout">退出</button>
      
      <div class="todos">
        <h3>待办事项</h3>
        <ul>
          <li v-for="todo in todos" :key="todo.id">
            {{ todo.text }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionsExample',
  
  data() {
    return {
      email: '',
      password: ''
    }
  },
  
  computed: {
    user() {
      return this.$store.state.user
    },
    
    todos() {
      return this.$store.state.todos
    },
    
    loading() {
      return this.$store.state.loading
    },
    
    error() {
      return this.$store.state.error
    }
  },
  
  methods: {
    async handleLogin() {
      try {
        await this.$store.dispatch('login', {
          email: this.email,
          password: this.password
        })
        
        // 清空表单
        this.email = ''
        this.password = ''
      } catch (error) {
        console.error('Login error:', error)
      }
    },
    
    handleLogout() {
      this.$store.dispatch('logout')
    }
  }
}
</script>
```

## 二、使用 mapActions 辅助函数

### 2.1 基本映射

```vue
<template>
  <div class="map-actions-example">
    <button @click="fetchData">获取数据</button>
    <button @click="saveData">保存数据</button>
    <button @click="refreshAll">刷新所有</button>
    <button @click="customFetch(123)">获取用户123</button>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'MapActionsExample',
  
  methods: {
    // 数组语法
    ...mapActions([
      'fetchUser',
      'fetchTodos',
      'logout'
    ]),
    
    // 对象语法（重命名）
    ...mapActions({
      getData: 'fetchData',
      saveInfo: 'saveData',
      customFetch: 'fetchUser'
    }),
    
    // 包装的方法
    async fetchData() {
      try {
        await this.fetchUser(this.userId)
      } catch (error) {
        this.showError(error.message)
      }
    },
    
    async saveData() {
      await this.saveInfo(this.formData)
    },
    
    async refreshAll() {
      await Promise.all([
        this.fetchUser(),
        this.fetchTodos()
      ])
    }
  }
}
</script>
```

## 三、高级 Actions 模式

### 3.1 错误处理模式

```javascript
// 统一错误处理的 actions
const errorHandlingActions = {
  actions: {
    // 通用错误处理包装器
    async withErrorHandling({ commit }, { action, ...params }) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        const result = await action(params)
        return result
      } catch (error) {
        commit('SET_ERROR', {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
          timestamp: new Date().toISOString()
        })
        
        // 根据错误类型执行不同操作
        if (error.code === 'AUTH_ERROR') {
          commit('LOGOUT')
        }
        
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 重试机制
    async withRetry({ dispatch }, { action, maxRetries = 3, delay = 1000 }) {
      let lastError
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await dispatch(action)
        } catch (error) {
          lastError = error
          
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
          }
        }
      }
      
      throw lastError
    },
    
    // 带缓存的 fetch
    async fetchWithCache({ state, commit }, { key, fetcher, maxAge = 5 * 60 * 1000 }) {
      const cached = state.cache[key]
      
      if (cached && Date.now() - cached.timestamp < maxAge) {
        return cached.data
      }
      
      const data = await fetcher()
      
      commit('SET_CACHE', {
        key,
        data,
        timestamp: Date.now()
      })
      
      return data
    }
  }
}
```

### 3.2 批量操作模式

```javascript
// 批量操作的 actions
const batchActions = {
  actions: {
    // 批量删除
    async batchDelete({ commit, dispatch }, { items, endpoint }) {
      const results = []
      const errors = []
      
      // 使用 Promise.allSettled 处理所有请求
      const promises = items.map(async (item) => {
        try {
          const response = await fetch(`${endpoint}/${item.id}`, {
            method: 'DELETE'
          })
          
          if (!response.ok) {
            throw new Error(`Failed to delete ${item.id}`)
          }
          
          return { success: true, id: item.id }
        } catch (error) {
          return { success: false, id: item.id, error: error.message }
        }
      })
      
      const results = await Promise.allSettled(promises)
      
      // 处理成功的删除
      const successIds = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => result.value.id)
      
      if (successIds.length > 0) {
        commit('BATCH_REMOVE_ITEMS', successIds)
      }
      
      // 处理失败的删除
      const failedItems = results
        .filter(result => result.status === 'rejected' || !result.value.success)
        .map(result => ({
          id: result.value?.id || 'unknown',
          error: result.reason?.message || result.value?.error || 'Unknown error'
        }))
      
      if (failedItems.length > 0) {
        commit('SET_BATCH_ERRORS', failedItems)
      }
      
      return {
        success: successIds,
        failed: failedItems
      }
    },
    
    // 批量更新
    async batchUpdate({ commit }, { updates, endpoint }) {
      const promises = updates.map(async (update) => {
        const response = await fetch(`${endpoint}/${update.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data)
        })
        
        if (!response.ok) {
          throw new Error(`Failed to update ${update.id}`)
        }
        
        return await response.json()
      })
      
      try {
        const results = await Promise.all(promises)
        commit('BATCH_UPDATE_ITEMS', results)
        return results
      } catch (error) {
        throw new Error('Batch update failed: ' + error.message)
      }
    }
  }
}
```

### 3.3 分页和无限滚动

```javascript
// 分页数据处理
const paginationActions = {
  state() {
    return {
      items: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        hasMore: true
      },
      loading: false
    }
  },
  
  mutations: {
    SET_ITEMS(state, items) {
      state.items = items
    },
    
    APPEND_ITEMS(state, items) {
      state.items.push(...items)
    },
    
    SET_PAGINATION(state, pagination) {
      state.pagination = { ...state.pagination, ...pagination }
    }
  },
  
  actions: {
    // 获取第一页
    async fetchFirstPage({ commit }, params = {}) {
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch('/api/items?' + new URLSearchParams({
          page: 1,
          pageSize: 20,
          ...params
        }))
        
        const data = await response.json()
        
        commit('SET_ITEMS', data.items)
        commit('SET_PAGINATION', {
          page: 1,
          total: data.total,
          hasMore: data.items.length === 20
        })
        
        return data
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 加载下一页（无限滚动）
    async loadMore({ state, commit }) {
      if (!state.pagination.hasMore || state.loading) {
        return
      }
      
      const nextPage = state.pagination.page + 1
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch('/api/items?' + new URLSearchParams({
          page: nextPage,
          pageSize: state.pagination.pageSize
        }))
        
        const data = await response.json()
        
        commit('APPEND_ITEMS', data.items)
        commit('SET_PAGINATION', {
          page: nextPage,
          hasMore: data.items.length === state.pagination.pageSize
        })
        
        return data
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 刷新当前页面数据
    async refresh({ state, dispatch }) {
      const currentPage = state.pagination.page
      
      // 重新获取从第一页到当前页的所有数据
      const promises = []
      for (let page = 1; page <= currentPage; page++) {
        promises.push(
          fetch('/api/items?' + new URLSearchParams({
            page,
            pageSize: state.pagination.pageSize
          })).then(r => r.json())
        )
      }
      
      const results = await Promise.all(promises)
      const allItems = results.flatMap(result => result.items)
      
      commit('SET_ITEMS', allItems)
    }
  }
}
```

## 四、测试 Actions

### 4.1 基本测试

```javascript
// actions.test.js
import { describe, it, expect, vi } from 'vitest'

// Mock fetch
global.fetch = vi.fn()

describe('Store Actions', () => {
  const createMockStore = () => ({
    commit: vi.fn(),
    dispatch: vi.fn(),
    state: {
      user: null,
      loading: false
    }
  })
  
  afterEach(() => {
    vi.resetAllMocks()
  })
  
  it('should fetch user successfully', async () => {
    const mockUser = { id: 1, name: 'John' }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    })
    
    const store = createMockStore()
    const actions = {
      async fetchUser({ commit }, userId) {
        const response = await fetch(`/api/users/${userId}`)
        const user = await response.json()
        commit('SET_USER', user)
        return user
      }
    }
    
    const result = await actions.fetchUser(store, 1)
    
    expect(fetch).toHaveBeenCalledWith('/api/users/1')
    expect(store.commit).toHaveBeenCalledWith('SET_USER', mockUser)
    expect(result).toEqual(mockUser)
  })
  
  it('should handle fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    const store = createMockStore()
    const actions = {
      async fetchUser({ commit }, userId) {
        try {
          const response = await fetch(`/api/users/${userId}`)
          const user = await response.json()
          commit('SET_USER', user)
          return user
        } catch (error) {
          commit('SET_ERROR', error.message)
          throw error
        }
      }
    }
    
    await expect(actions.fetchUser(store, 1)).rejects.toThrow('Network error')
    expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Network error')
  })
})
```

### 4.2 集成测试

```javascript
// integration.test.js
import { createStore } from 'vuex'
import { describe, it, expect, vi } from 'vitest'

describe('Store Integration Tests', () => {
  let store
  
  beforeEach(() => {
    // 创建真实的 store 实例
    store = createStore({
      state() {
        return {
          user: null,
          loading: false,
          error: null
        }
      },
      
      mutations: {
        SET_USER(state, user) {
          state.user = user
        },
        
        SET_LOADING(state, loading) {
          state.loading = loading
        },
        
        SET_ERROR(state, error) {
          state.error = error
        }
      },
      
      actions: {
        async fetchUser({ commit }, userId) {
          commit('SET_LOADING', true)
          
          try {
            const response = await fetch(`/api/users/${userId}`)
            const user = await response.json()
            commit('SET_USER', user)
            return user
          } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
          } finally {
            commit('SET_LOADING', false)
          }
        }
      }
    })
  })
  
  it('should handle complete fetch user flow', async () => {
    const mockUser = { id: 1, name: 'John' }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    })
    
    // 初始状态
    expect(store.state.user).toBeNull()
    expect(store.state.loading).toBe(false)
    
    // 执行 action
    const promise = store.dispatch('fetchUser', 1)
    
    // 检查加载状态
    expect(store.state.loading).toBe(true)
    
    // 等待完成
    const result = await promise
    
    // 检查最终状态
    expect(store.state.loading).toBe(false)
    expect(store.state.user).toEqual(mockUser)
    expect(store.state.error).toBeNull()
    expect(result).toEqual(mockUser)
  })
})
```

## 参考资料

- [Vuex Actions 文档](https://vuex.vuejs.org/guide/actions.html)
- [异步 Actions](https://vuex.vuejs.org/guide/actions.html#dispatching-actions)
- [mapActions 辅助函数](https://vuex.vuejs.org/guide/actions.html#dispatching-actions-in-components)

**下一节** → [第 30 节：Modules 模块](./30-vuex-modules.md)
