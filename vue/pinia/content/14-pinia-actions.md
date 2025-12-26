# 第 14 节：Actions 方法

## 概述

Actions 是 Pinia Store 中的方法，用于定义业务逻辑、状态变更和异步操作。与 Vuex 不同，Pinia 的 Actions 可以是同步或异步的，并且可以直接修改状态，无需通过 mutations。

## 一、Actions 基础

### 1.1 Options API 中的 Actions

```javascript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null
  }),
  
  actions: {
    // 同步 action
    setUser(user) {
      this.currentUser = user
      this.error = null
    },
    
    // 异步 action
    async fetchUser(userId) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.fetchUser(userId)
        this.currentUser = response.data
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 复杂的业务逻辑
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        // 1. 验证凭据
        const loginResponse = await api.login(credentials)
        
        // 2. 设置用户信息
        this.currentUser = loginResponse.user
        
        // 3. 存储 token
        localStorage.setItem('authToken', loginResponse.token)
        
        // 4. 获取用户权限
        const permissionsResponse = await api.getUserPermissions(loginResponse.user.id)
        this.currentUser.permissions = permissionsResponse.permissions
        
        // 5. 记录登录日志
        await api.logUserActivity('login', loginResponse.user.id)
        
        return { success: true, user: this.currentUser }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },
    
    // 调用其他 actions
    async refreshUserData() {
      if (!this.currentUser) {
        throw new Error('No current user to refresh')
      }
      
      // 调用其他 action
      return await this.fetchUser(this.currentUser.id)
    }
  }
})
```

### 1.2 Setup API 中的 Actions

```javascript
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 状态
  const users = ref([])
  const currentUser = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Actions (普通函数)
  function setUser(user) {
    currentUser.value = user
    error.value = null
  }
  
  async function fetchUser(userId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.fetchUser(userId)
      currentUser.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function login(credentials) {
    loading.value = true
    error.value = null
    
    try {
      const loginResponse = await api.login(credentials)
      currentUser.value = loginResponse.user
      
      localStorage.setItem('authToken', loginResponse.token)
      
      const permissionsResponse = await api.getUserPermissions(loginResponse.user.id)
      currentUser.value.permissions = permissionsResponse.permissions
      
      await api.logUserActivity('login', loginResponse.user.id)
      
      return { success: true, user: currentUser.value }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  async function refreshUserData() {
    if (!currentUser.value) {
      throw new Error('No current user to refresh')
    }
    return await fetchUser(currentUser.value.id)
  }
  
  return {
    users, currentUser, loading, error,
    setUser, fetchUser, login, refreshUserData
  }
})
```

## 二、高级 Actions 模式

### 2.1 错误处理和重试机制

```javascript
export const useApiStore = defineStore('api', () => {
  const loading = ref(false)
  const error = ref(null)
  
  // 带重试机制的 action
  async function fetchWithRetry(fetchFn, maxRetries = 3, delay = 1000) {
    let lastError
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        loading.value = true
        error.value = null
        
        const result = await fetchFn()
        return result
      } catch (err) {
        lastError = err
        console.warn(`Attempt ${attempt} failed:`, err.message)
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
        }
      } finally {
        loading.value = false
      }
    }
    
    error.value = lastError.message
    throw lastError
  }
  
  // 使用重试机制的具体 action
  async function fetchUserWithRetry(userId) {
    return await fetchWithRetry(
      () => api.fetchUser(userId),
      3, // 最大重试3次
      1000 // 每次重试延迟1秒
    )
  }
  
  // 批量操作 action
  async function batchFetchUsers(userIds) {
    loading.value = true
    const results = []
    const errors = []
    
    // 并发获取，限制并发数量
    const batchSize = 5
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize)
      
      const promises = batch.map(async (userId) => {
        try {
          const user = await api.fetchUser(userId)
          return { success: true, userId, user }
        } catch (error) {
          return { success: false, userId, error: error.message }
        }
      })
      
      const batchResults = await Promise.all(promises)
      
      batchResults.forEach(result => {
        if (result.success) {
          results.push(result.user)
        } else {
          errors.push(result)
        }
      })
    }
    
    loading.value = false
    
    return {
      successful: results,
      failed: errors,
      total: userIds.length
    }
  }
  
  return {
    loading, error,
    fetchWithRetry, fetchUserWithRetry, batchFetchUsers
  }
})
```

### 2.2 乐观更新模式

```javascript
export const useTodoStore = defineStore('todo', () => {
  const todos = ref([])
  const optimisticUpdates = ref(new Map()) // 追踪乐观更新
  
  // 乐观添加待办事项
  async function addTodoOptimistic(todoText) {
    const tempId = `temp_${Date.now()}`
    const optimisticTodo = {
      id: tempId,
      text: todoText,
      completed: false,
      pending: true, // 标记为待确认
      createdAt: new Date()
    }
    
    // 1. 立即更新 UI
    todos.value.unshift(optimisticTodo)
    optimisticUpdates.value.set(tempId, optimisticTodo)
    
    try {
      // 2. 发送请求到服务器
      const serverTodo = await api.createTodo(todoText)
      
      // 3. 用服务器返回的数据替换乐观数据
      const index = todos.value.findIndex(t => t.id === tempId)
      if (index !== -1) {
        todos.value[index] = {
          ...serverTodo,
          pending: false
        }
      }
      
      optimisticUpdates.value.delete(tempId)
      return serverTodo
    } catch (error) {
      // 4. 失败时回滚乐观更新
      const index = todos.value.findIndex(t => t.id === tempId)
      if (index !== -1) {
        todos.value.splice(index, 1)
      }
      
      optimisticUpdates.value.delete(tempId)
      throw error
    }
  }
  
  // 乐观更新待办事项
  async function updateTodoOptimistic(todoId, updates) {
    const originalTodo = todos.value.find(t => t.id === todoId)
    if (!originalTodo) throw new Error('Todo not found')
    
    // 保存原始状态
    const backup = { ...originalTodo }
    optimisticUpdates.value.set(todoId, backup)
    
    // 乐观更新
    Object.assign(originalTodo, updates, { pending: true })
    
    try {
      const updatedTodo = await api.updateTodo(todoId, updates)
      
      // 用服务器数据更新
      const index = todos.value.findIndex(t => t.id === todoId)
      if (index !== -1) {
        todos.value[index] = { ...updatedTodo, pending: false }
      }
      
      optimisticUpdates.value.delete(todoId)
      return updatedTodo
    } catch (error) {
      // 回滚到原始状态
      const index = todos.value.findIndex(t => t.id === todoId)
      if (index !== -1) {
        todos.value[index] = backup
      }
      
      optimisticUpdates.value.delete(todoId)
      throw error
    }
  }
  
  // 回滚所有待确认的乐观更新
  function rollbackOptimisticUpdates() {
    optimisticUpdates.value.forEach((backup, id) => {
      const index = todos.value.findIndex(t => t.id === id)
      if (index !== -1) {
        if (backup.id.startsWith('temp_')) {
          // 删除临时添加的项目
          todos.value.splice(index, 1)
        } else {
          // 恢复修改的项目
          todos.value[index] = backup
        }
      }
    })
    
    optimisticUpdates.value.clear()
  }
  
  return {
    todos,
    addTodoOptimistic,
    updateTodoOptimistic,
    rollbackOptimisticUpdates
  }
})
```

### 2.3 跨 Store 的 Actions

```javascript
// 购物车 Store
export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  
  function addToCart(product, quantity = 1) {
    const existingItem = items.value.find(item => item.productId === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity
      })
    }
  }
  
  return { items, addToCart }
})

// 订单 Store
export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  
  // 从购物车创建订单
  async function createOrderFromCart() {
    const cartStore = useCartStore()
    const userStore = useUserStore()
    
    if (cartStore.items.length === 0) {
      throw new Error('购物车为空')
    }
    
    if (!userStore.currentUser) {
      throw new Error('用户未登录')
    }
    
    try {
      // 创建订单
      const orderData = {
        userId: userStore.currentUser.id,
        items: cartStore.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        total: cartStore.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      }
      
      const order = await api.createOrder(orderData)
      
      // 更新订单状态
      currentOrder.value = order
      orders.value.unshift(order)
      
      // 清空购物车
      cartStore.items.length = 0
      
      // 记录用户活动
      await userStore.logActivity('order_created', order.id)
      
      return order
    } catch (error) {
      console.error('创建订单失败:', error)
      throw error
    }
  }
  
  return {
    orders, currentOrder,
    createOrderFromCart
  }
})

// 通知 Store
export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  
  function addNotification(message, type = 'info', duration = 3000) {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    }
    
    notifications.value.push(notification)
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, duration)
    }
  }
  
  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  return {
    notifications,
    addNotification,
    removeNotification
  }
})

// 在其他 Store 中使用通知
export const useProductStore = defineStore('product', () => {
  const products = ref([])
  
  async function deleteProduct(productId) {
    const notificationStore = useNotificationStore()
    
    try {
      await api.deleteProduct(productId)
      
      const index = products.value.findIndex(p => p.id === productId)
      if (index > -1) {
        const product = products.value[index]
        products.value.splice(index, 1)
        
        notificationStore.addNotification(
          `商品 "${product.name}" 删除成功`, 
          'success'
        )
      }
    } catch (error) {
      notificationStore.addNotification(
        `删除商品失败: ${error.message}`, 
        'error'
      )
      throw error
    }
  }
  
  return {
    products,
    deleteProduct
  }
})
```

## 三、异步 Actions 处理

### 3.1 并发控制

```javascript
export const useAsyncStore = defineStore('async', () => {
  const loading = ref(false)
  const activeRequests = ref(new Set())
  
  // 防止重复请求
  async function fetchUserWithDeduplication(userId) {
    const requestKey = `fetchUser_${userId}`
    
    // 如果已经在请求中，等待现有请求
    if (activeRequests.value.has(requestKey)) {
      return new Promise((resolve, reject) => {
        const checkRequest = () => {
          if (!activeRequests.value.has(requestKey)) {
            // 请求完成，返回缓存的结果或重新请求
            resolve(fetchUser(userId))
          } else {
            setTimeout(checkRequest, 100)
          }
        }
        checkRequest()
      })
    }
    
    activeRequests.value.add(requestKey)
    
    try {
      const user = await api.fetchUser(userId)
      return user
    } finally {
      activeRequests.value.delete(requestKey)
    }
  }
  
  // 请求队列管理
  const requestQueue = ref([])
  const maxConcurrentRequests = 3
  let runningRequests = 0
  
  async function queuedRequest(requestFn) {
    return new Promise((resolve, reject) => {
      requestQueue.value.push({ requestFn, resolve, reject })
      processQueue()
    })
  }
  
  async function processQueue() {
    if (runningRequests >= maxConcurrentRequests || requestQueue.value.length === 0) {
      return
    }
    
    const { requestFn, resolve, reject } = requestQueue.value.shift()
    runningRequests++
    
    try {
      const result = await requestFn()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      runningRequests--
      processQueue() // 处理队列中的下一个请求
    }
  }
  
  return {
    loading,
    fetchUserWithDeduplication,
    queuedRequest
  }
})
```

### 3.2 取消请求

```javascript
export const useCancellableStore = defineStore('cancellable', () => {
  const abortControllers = ref(new Map())
  
  // 可取消的请求
  async function fetchDataWithCancellation(dataId, signal) {
    const controller = new AbortController()
    const requestKey = `fetchData_${dataId}`
    
    // 保存控制器以便后续取消
    abortControllers.value.set(requestKey, controller)
    
    try {
      const response = await fetch(`/api/data/${dataId}`, {
        signal: signal || controller.signal
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled')
        return null
      }
      throw error
    } finally {
      abortControllers.value.delete(requestKey)
    }
  }
  
  // 取消特定请求
  function cancelRequest(requestKey) {
    const controller = abortControllers.value.get(requestKey)
    if (controller) {
      controller.abort()
      abortControllers.value.delete(requestKey)
    }
  }
  
  // 取消所有请求
  function cancelAllRequests() {
    abortControllers.value.forEach(controller => controller.abort())
    abortControllers.value.clear()
  }
  
  // 组件卸载时取消请求
  function setupAutoCancel() {
    onUnmounted(() => {
      cancelAllRequests()
    })
  }
  
  return {
    fetchDataWithCancellation,
    cancelRequest,
    cancelAllRequests,
    setupAutoCancel
  }
})
```

## 四、Actions 最佳实践

### 4.1 错误处理统一化

```javascript
// 错误处理工具
class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
    this.name = 'ApiError'
  }
}

// 统一的错误处理 action
export const useErrorHandlingStore = defineStore('errorHandling', () => {
  const errors = ref([])
  
  // 包装 API 调用的通用方法
  async function handleApiCall(apiCall, options = {}) {
    const {
      showLoading = true,
      showError = true,
      retries = 0,
      onSuccess,
      onError
    } = options
    
    let loading = showLoading ? ref(true) : null
    
    try {
      const result = await apiCall()
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return { success: true, data: result, error: null }
    } catch (error) {
      const formattedError = {
        message: error.message,
        status: error.status || 500,
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: new Date()
      }
      
      if (showError) {
        errors.value.push(formattedError)
      }
      
      if (onError) {
        onError(formattedError)
      }
      
      return { success: false, data: null, error: formattedError }
    } finally {
      if (loading) {
        loading.value = false
      }
    }
  }
  
  function clearErrors() {
    errors.value = []
  }
  
  return {
    errors,
    handleApiCall,
    clearErrors
  }
})

// 在其他 Store 中使用
export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const errorHandling = useErrorHandlingStore()
  
  async function fetchUsers() {
    const result = await errorHandling.handleApiCall(
      () => api.fetchUsers(),
      {
        onSuccess: (data) => {
          users.value = data
        },
        onError: (error) => {
          console.error('获取用户失败:', error)
        }
      }
    )
    
    return result
  }
  
  return {
    users,
    fetchUsers
  }
})
```

### 4.2 Actions 组合和复用

```javascript
// 可复用的 actions
export function createCrudActions(entityName, apiService) {
  return {
    async create(data) {
      try {
        const result = await apiService.create(data)
        return { success: true, data: result }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
    
    async read(id) {
      try {
        const result = await apiService.read(id)
        return { success: true, data: result }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
    
    async update(id, data) {
      try {
        const result = await apiService.update(id, data)
        return { success: true, data: result }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
    
    async delete(id) {
      try {
        await apiService.delete(id)
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
  }
}

// 使用可复用 actions
export const useUserStore = defineStore('user', () => {
  const users = ref([])
  
  // 使用通用 CRUD actions
  const crudActions = createCrudActions('user', api.users)
  
  async function createUser(userData) {
    const result = await crudActions.create(userData)
    if (result.success) {
      users.value.push(result.data)
    }
    return result
  }
  
  async function updateUser(userId, updates) {
    const result = await crudActions.update(userId, updates)
    if (result.success) {
      const index = users.value.findIndex(u => u.id === userId)
      if (index > -1) {
        users.value[index] = result.data
      }
    }
    return result
  }
  
  return {
    users,
    createUser,
    updateUser
  }
})
```

### 4.3 Actions 测试

```javascript
// 测试辅助工具
export function createMockApiService() {
  return {
    fetchUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn()
  }
}

// Store 测试示例
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store Actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('should fetch user successfully', async () => {
    const store = useUserStore()
    const mockUser = { id: 1, name: 'John Doe' }
    
    // Mock API 调用
    vi.mocked(api.fetchUser).mockResolvedValue(mockUser)
    
    const result = await store.fetchUser(1)
    
    expect(api.fetchUser).toHaveBeenCalledWith(1)
    expect(store.currentUser).toEqual(mockUser)
    expect(result).toEqual(mockUser)
  })
  
  it('should handle fetch user error', async () => {
    const store = useUserStore()
    const errorMessage = 'User not found'
    
    vi.mocked(api.fetchUser).mockRejectedValue(new Error(errorMessage))
    
    await expect(store.fetchUser(999)).rejects.toThrow(errorMessage)
    expect(store.error).toBe(errorMessage)
    expect(store.currentUser).toBeNull()
  })
  
  it('should handle optimistic updates', async () => {
    const store = useUserStore()
    const todoText = 'New todo'
    
    // Mock 成功的 API 调用
    const mockTodo = { id: 1, text: todoText, completed: false }
    vi.mocked(api.createTodo).mockResolvedValue(mockTodo)
    
    const promise = store.addTodoOptimistic(todoText)
    
    // 验证乐观更新
    expect(store.todos).toHaveLength(1)
    expect(store.todos[0]).toMatchObject({ text: todoText, pending: true })
    
    const result = await promise
    
    // 验证最终状态
    expect(store.todos).toHaveLength(1)
    expect(store.todos[0]).toEqual({ ...mockTodo, pending: false })
    expect(result).toEqual(mockTodo)
  })
})
```

## 参考资料

- [Pinia Actions](https://pinia.vuejs.org/core-concepts/actions.html)
- [Async/Await Best Practices](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await)
- [Error Handling in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [Testing Pinia Stores](https://pinia.vuejs.org/cookbook/testing.html)

**下一节** → [第 15 节：插件系统](./15-pinia-plugins.md)
