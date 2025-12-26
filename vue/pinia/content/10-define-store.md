# 第 10 节：定义 Store

## 概述

Store 是 Pinia 状态管理的核心单位，封装了状态、计算属性和方法。Pinia 提供了两种定义 Store 的语法：Options API 和 Setup API，本节将详细介绍这两种方式及其使用场景。

## 一、Options API 语法

### 1.1 基本结构

```javascript
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // 状态定义
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  
  // 计算属性
  getters: {
    doubleCount: (state) => state.count * 2,
    
    // 可以访问其他 getters
    countPlusOne: (state) => state.count + 1,
    
    // 箭头函数形式，需要明确类型
    tripleCount: (state) => state.count * 3,
    
    // 普通函数形式，可以使用 this
    displayText() {
      return `${this.name}: ${this.count}`
    }
  },
  
  // 方法定义
  actions: {
    // 同步操作
    increment() {
      this.count++
    },
    
    // 带参数的操作
    incrementBy(amount) {
      this.count += amount
    },
    
    // 异步操作
    async fetchInitialCount() {
      try {
        const response = await api.getInitialCount()
        this.count = response.data
      } catch (error) {
        console.error('Failed to fetch initial count:', error)
      }
    }
  }
})
```

### 1.2 复杂状态示例

```javascript
// 用户管理 Store
export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户信息
    currentUser: null,
    userList: [],
    
    // UI 状态
    loading: false,
    error: null,
    
    // 分页信息
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0
    },
    
    // 过滤条件
    filters: {
      role: '',
      status: 'active',
      searchText: ''
    }
  }),
  
  getters: {
    // 当前用户状态
    isLoggedIn: (state) => !!state.currentUser,
    
    // 用户权限
    userPermissions: (state) => state.currentUser?.permissions || [],
    
    // 过滤后的用户列表
    filteredUsers() {
      let users = this.userList
      
      if (this.filters.role) {
        users = users.filter(user => user.role === this.filters.role)
      }
      
      if (this.filters.searchText) {
        users = users.filter(user => 
          user.name.includes(this.filters.searchText) ||
          user.email.includes(this.filters.searchText)
        )
      }
      
      return users
    },
    
    // 分页数据
    paginatedUsers() {
      const start = (this.pagination.page - 1) * this.pagination.pageSize
      const end = start + this.pagination.pageSize
      return this.filteredUsers.slice(start, end)
    },
    
    // 权限检查
    hasPermission: (state) => (permission) => {
      return state.currentUser?.permissions?.includes(permission) || false
    }
  },
  
  actions: {
    // 用户登录
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.login(credentials)
        this.currentUser = response.user
        
        // 存储 token
        localStorage.setItem('auth_token', response.token)
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },
    
    // 获取用户列表
    async fetchUsers(options = {}) {
      this.loading = true
      this.error = null
      
      try {
        const params = {
          page: options.page || this.pagination.page,
          pageSize: options.pageSize || this.pagination.pageSize,
          ...this.filters
        }
        
        const response = await api.fetchUsers(params)
        
        this.userList = response.users
        this.pagination = {
          ...this.pagination,
          page: response.page,
          total: response.total
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    // 更新过滤条件
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.pagination.page = 1 // 重置页码
    },
    
    // 重置状态
    reset() {
      this.currentUser = null
      this.userList = []
      this.error = null
      this.pagination.page = 1
      this.filters = {
        role: '',
        status: 'active',
        searchText: ''
      }
    }
  }
})
```

## 二、Setup API 语法

### 2.1 基本结构

```javascript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  // 状态 (相当于 state)
  const count = ref(0)
  const name = ref('Counter')
  
  // 计算属性 (相当于 getters)
  const doubleCount = computed(() => count.value * 2)
  const displayText = computed(() => `${name.value}: ${count.value}`)
  
  // 方法 (相当于 actions)
  function increment() {
    count.value++
  }
  
  function incrementBy(amount) {
    count.value += amount
  }
  
  async function fetchInitialCount() {
    try {
      const response = await api.getInitialCount()
      count.value = response.data
    } catch (error) {
      console.error('Failed to fetch initial count:', error)
    }
  }
  
  // 返回公开的状态和方法
  return {
    count,
    name,
    doubleCount,
    displayText,
    increment,
    incrementBy,
    fetchInitialCount
  }
})
```

### 2.2 Setup API 高级用法

```javascript
import { ref, reactive, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export const useTaskStore = defineStore('task', () => {
  // 响应式状态
  const tasks = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // 复杂状态对象
  const filters = reactive({
    status: 'all',
    priority: '',
    assignee: '',
    search: ''
  })
  
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0
  })
  
  // 计算属性
  const filteredTasks = computed(() => {
    let result = tasks.value
    
    if (filters.status !== 'all') {
      result = result.filter(task => task.status === filters.status)
    }
    
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority)
    }
    
    if (filters.search) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(filters.search.toLowerCase())
      )
    }
    
    return result
  })
  
  const taskStats = computed(() => ({
    total: tasks.value.length,
    completed: tasks.value.filter(t => t.status === 'completed').length,
    pending: tasks.value.filter(t => t.status === 'pending').length,
    inProgress: tasks.value.filter(t => t.status === 'in-progress').length
  }))
  
  // 监听器
  watch(
    () => [filters.status, filters.priority, filters.search],
    () => {
      pagination.page = 1 // 重置分页
    },
    { deep: true }
  )
  
  // 异步方法
  async function fetchTasks() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.fetchTasks({
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filters
      })
      
      tasks.value = response.tasks
      pagination.total = response.total
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  async function createTask(taskData) {
    try {
      const newTask = await api.createTask(taskData)
      tasks.value.unshift(newTask)
      return { success: true, task: newTask }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }
  
  async function updateTask(taskId, updates) {
    const taskIndex = tasks.value.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return { success: false, error: 'Task not found' }
    
    try {
      const updatedTask = await api.updateTask(taskId, updates)
      tasks.value[taskIndex] = updatedTask
      return { success: true, task: updatedTask }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }
  
  function updateFilters(newFilters) {
    Object.assign(filters, newFilters)
  }
  
  function resetFilters() {
    Object.assign(filters, {
      status: 'all',
      priority: '',
      assignee: '',
      search: ''
    })
  }
  
  // 工具方法
  function getTaskById(id) {
    return tasks.value.find(task => task.id === id)
  }
  
  function getTasksByStatus(status) {
    return tasks.value.filter(task => task.status === status)
  }
  
  return {
    // 状态
    tasks: readonly(tasks),
    loading: readonly(loading),
    error: readonly(error),
    filters,
    pagination,
    
    // 计算属性
    filteredTasks,
    taskStats,
    
    // 方法
    fetchTasks,
    createTask,
    updateTask,
    updateFilters,
    resetFilters,
    getTaskById,
    getTasksByStatus
  }
})
```

## 三、语法对比与选择

### 3.1 Options vs Setup 对比

```javascript
const syntaxComparison = {
  optionsAPI: {
    优点: [
      '熟悉的 Vuex 风格语法',
      '结构清晰，易于理解',
      '自动的 TypeScript 推断'
    ],
    缺点: [
      '无法使用组合式函数',
      'TypeScript 支持有限',
      '代码复用性较差'
    ],
    适用场景: [
      '团队熟悉 Vuex',
      '简单的状态管理',
      '快速原型开发'
    ]
  },
  
  setupAPI: {
    优点: [
      '完整的 Composition API 支持',
      '更好的 TypeScript 体验',
      '可以使用组合式函数',
      '更灵活的代码组织'
    ],
    缺点: [
      '学习成本稍高',
      '需要手动返回暴露的内容'
    ],
    适用场景: [
      '复杂的状态逻辑',
      'TypeScript 项目',
      '需要代码复用'
    ]
  }
}

// 选择建议
const selectionGuide = {
  useOptions: [
    '团队主要使用 Options API',
    '简单的状态管理需求',
    '快速开发和原型'
  ],
  
  useSetup: [
    '复杂的业务逻辑',
    'TypeScript 项目',
    '需要使用组合式函数',
    '追求更好的代码组织'
  ]
}
```

### 3.2 混合使用

```javascript
// 可以在同一项目中混合使用两种语法
// 简单的 Store 使用 Options API
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    language: 'zh-CN'
  }),
  
  actions: {
    setTheme(theme) {
      this.theme = theme
    }
  }
})

// 复杂的 Store 使用 Setup API  
export const useDataStore = defineStore('data', () => {
  // 使用组合式函数
  const { data, loading, error, fetch } = useAsyncData()
  const { cache, clearCache } = useCache()
  
  // 复杂计算逻辑
  const processedData = computed(() => {
    return data.value.map(item => ({
      ...item,
      processed: true
    }))
  })
  
  return {
    data,
    loading,
    error,
    processedData,
    fetch,
    clearCache
  }
})
```

## 四、高级特性

### 4.1 Store 组合

```javascript
// 在一个 Store 中使用其他 Store
export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  
  // 使用其他 Store
  const userStore = useUserStore()
  const productStore = useProductStore()
  
  // 计算属性依赖其他 Store
  const total = computed(() => {
    const discount = userStore.vipLevel === 'gold' ? 0.9 : 1
    return items.value.reduce((sum, item) => {
      const product = productStore.getProductById(item.productId)
      return sum + (product?.price || 0) * item.quantity
    }, 0) * discount
  })
  
  function addItem(productId, quantity = 1) {
    const existingItem = items.value.find(item => item.productId === productId)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({ productId, quantity })
    }
  }
  
  return {
    items,
    total,
    addItem
  }
})
```

### 4.2 动态 Store ID

```javascript
// 动态生成 Store ID（谨慎使用）
function createUserStore(userId) {
  return defineStore(`user-${userId}`, () => {
    const profile = ref(null)
    const preferences = ref({})
    
    async function fetchProfile() {
      profile.value = await api.fetchUserProfile(userId)
    }
    
    return {
      profile,
      preferences,
      fetchProfile
    }
  })
}

// 使用动态 Store
const userStore1 = createUserStore('user1')()
const userStore2 = createUserStore('user2')()
```

## 五、TypeScript 支持

### 5.1 Options API 类型

```typescript
interface UserState {
  currentUser: User | null
  users: User[]
  loading: boolean
}

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    users: [],
    loading: false
  }),
  
  getters: {
    isAdmin: (state): boolean => state.currentUser?.role === 'admin',
    
    userCount: (state): number => state.users.length
  },
  
  actions: {
    async fetchUser(id: number): Promise<User | null> {
      this.loading = true
      try {
        const user = await api.fetchUser(id)
        this.currentUser = user
        return user
      } catch (error) {
        console.error('Failed to fetch user:', error)
        return null
      } finally {
        this.loading = false
      }
    }
  }
})
```

### 5.2 Setup API 类型

```typescript
export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const users = ref<User[]>([])
  const loading = ref<boolean>(false)
  
  const isAdmin = computed((): boolean => 
    currentUser.value?.role === 'admin'
  )
  
  const userCount = computed((): number => users.value.length)
  
  async function fetchUser(id: number): Promise<User | null> {
    loading.value = true
    try {
      const user = await api.fetchUser(id)
      currentUser.value = user
      return user
    } catch (error) {
      console.error('Failed to fetch user:', error)
      return null
    } finally {
      loading.value = false
    }
  }
  
  return {
    currentUser: readonly(currentUser),
    users: readonly(users), 
    loading: readonly(loading),
    isAdmin,
    userCount,
    fetchUser
  }
})

// 类型导出
export type UserStore = ReturnType<typeof useUserStore>
```

## 六、最佳实践

### 6.1 Store 设计原则

```javascript
const storeDesignPrinciples = {
  // 1. 单一职责
  singleResponsibility: {
    good: 'useUserStore - 只处理用户相关状态',
    bad: 'useAppStore - 包含用户、产品、订单等所有状态'
  },
  
  // 2. 状态扁平化
  flatState: {
    good: {
      users: { 1: { id: 1, name: 'Alice' } },
      posts: { 1: { id: 1, authorId: 1 } }
    },
    bad: {
      users: [{ id: 1, posts: [{ id: 1 }] }] // 嵌套过深
    }
  },
  
  // 3. 命名规范
  naming: {
    store: 'use{Entity}Store',
    state: 'camelCase',
    actions: 'verbNoun', 
    getters: 'descriptive'
  }
}
```

### 6.2 性能优化

```javascript
// 性能优化技巧
export const useOptimizedStore = defineStore('optimized', () => {
  // 使用 shallowRef 优化大型数据集
  const largeDataset = shallowRef([])
  
  // 使用 markRaw 标记不需要响应式的对象
  const staticConfig = markRaw({
    apiEndpoints: { /* ... */ },
    constants: { /* ... */ }
  })
  
  // 懒计算复杂操作
  const expensiveComputation = computed(() => {
    if (largeDataset.value.length === 0) return []
    
    return largeDataset.value
      .filter(item => item.active)
      .sort((a, b) => a.priority - b.priority)
  })
  
  // 批量更新
  function batchUpdate(updates) {
    // 暂停响应式更新
    batch(() => {
      updates.forEach(update => {
        // 执行更新
        update()
      })
    })
  }
  
  return {
    largeDataset,
    staticConfig,
    expensiveComputation,
    batchUpdate
  }
})
```

## 参考资料

- [Pinia defineStore](https://pinia.vuejs.org/core-concepts/#defining-a-store)
- [Vue Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript with Pinia](https://pinia.vuejs.org/cookbook/composing-stores.html)

**下一节** → [第 11 节：使用 Store](./11-use-store.md)
