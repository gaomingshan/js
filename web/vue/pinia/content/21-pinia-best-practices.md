# 第 21 节：最佳实践

## 概述

掌握 Pinia 最佳实践对于构建高质量、可维护的应用至关重要。本节将总结在实际项目中使用 Pinia 的最佳实践，包括架构设计、性能优化、代码组织等方面。

## 一、Store 设计原则

### 1.1 单一职责原则

```javascript
// ❌ 避免：职责混合的 Store
export const useBadStore = defineStore('bad', {
  state: () => ({
    // 用户相关
    user: null,
    userPreferences: {},
    
    // 产品相关
    products: [],
    categories: [],
    
    // UI 相关
    sidebarOpen: false,
    theme: 'light'
  })
})

// ✅ 推荐：职责分离
export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    preferences: {},
    permissions: []
  })
})

export const useProductStore = defineStore('product', {
  state: () => ({
    items: [],
    categories: [],
    filters: {}
  })
})

export const useUIStore = defineStore('ui', {
  state: () => ({
    sidebarOpen: false,
    theme: 'light',
    loading: false
  })
})
```

### 1.2 状态结构设计

```javascript
// ✅ 推荐：扁平化状态结构
export const useUserStore = defineStore('user', {
  state: () => ({
    // 基础数据
    currentUserId: null,
    usersById: {},
    
    // UI 状态
    loading: false,
    error: null,
    
    // 业务状态
    isAuthenticated: false,
    permissions: []
  }),
  
  getters: {
    currentUser: (state) => {
      return state.currentUserId ? state.usersById[state.currentUserId] : null
    },
    
    getUserById: (state) => (id) => {
      return state.usersById[id]
    }
  }
})

// ❌ 避免：过度嵌套
export const useBadUserStore = defineStore('badUser', {
  state: () => ({
    data: {
      current: {
        user: {
          profile: {
            personal: {
              name: '',
              email: ''
            }
          }
        }
      }
    }
  })
})
```

### 1.3 命名约定

```javascript
// Store 命名约定
const storeNamingConventions = {
  // Store 名称：使用领域驱动命名
  storeNames: [
    'user',      // ✅ 简洁明了
    'product',   // ✅ 业务相关
    'cart',      // ✅ 功能明确
    'ui',        // ✅ UI 相关
    // 避免
    'data',      // ❌ 太泛化
    'store1',    // ❌ 无意义
    'temp'       // ❌ 临时命名
  ],
  
  // 状态命名：描述性和一致性
  stateNaming: {
    // 数据集合
    items: [],        // ✅ 复数形式
    users: [],        // ✅ 复数形式
    
    // 单个项目
    currentUser: null, // ✅ 明确指示
    selectedItem: null,// ✅ 状态清晰
    
    // 状态标识
    loading: false,    // ✅ 布尔状态
    error: null,      // ✅ 错误信息
    isValid: false,   // ✅ is 前缀布尔值
    hasData: false,   // ✅ has 前缀布尔值
    
    // 避免
    data: {},         // ❌ 太泛化
    info: {},         // ❌ 不明确
    flag: false       // ❌ 无意义
  },
  
  // Action 命名：动词开头
  actionNaming: [
    'fetchUsers',     // ✅ 获取数据
    'createUser',     // ✅ 创建操作
    'updateUser',     // ✅ 更新操作
    'deleteUser',     // ✅ 删除操作
    'setLoading',     // ✅ 状态设置
    'resetState',     // ✅ 重置操作
    
    // 避免
    'users',          // ❌ 名词形式
    'handleClick',    // ❌ 事件处理器命名
    'doSomething'     // ❌ 不明确
  ]
}
```

## 二、性能优化

### 2.1 状态订阅优化

```javascript
// ✅ 推荐：有选择的订阅
export const useOptimizedComponent = () => {
  const userStore = useUserStore()
  
  // 只订阅需要的状态
  const { currentUser, loading } = storeToRefs(userStore)
  
  // 避免订阅整个 store
  // const store = userStore // ❌ 会订阅所有变化
  
  return {
    currentUser,
    loading
  }
}

// ✅ 推荐：条件订阅
export const useConditionalSubscription = () => {
  const userStore = useUserStore()
  const debugMode = ref(false)
  
  // 只在调试模式下订阅
  if (debugMode.value) {
    userStore.$subscribe((mutation, state) => {
      console.log('State changed:', mutation, state)
    })
  }
}

// ✅ 推荐：防抖订阅
export const useDebouncedSubscription = () => {
  const userStore = useUserStore()
  
  const debouncedHandler = debounce((mutation, state) => {
    // 处理状态变化
    syncToServer(state)
  }, 500)
  
  userStore.$subscribe(debouncedHandler)
}
```

### 2.2 计算属性优化

```javascript
export const useOptimizedStore = defineStore('optimized', () => {
  const items = ref([])
  const filters = ref({ category: '', search: '' })
  
  // ✅ 推荐：分步计算
  const filteredByCategory = computed(() => {
    if (!filters.value.category) return items.value
    return items.value.filter(item => item.category === filters.value.category)
  })
  
  const filteredBySearch = computed(() => {
    if (!filters.value.search) return filteredByCategory.value
    return filteredByCategory.value.filter(item =>
      item.name.toLowerCase().includes(filters.value.search.toLowerCase())
    )
  })
  
  // ✅ 推荐：缓存昂贵计算
  const expensiveComputation = computed(() => {
    // 使用缓存避免重复计算
    const cacheKey = JSON.stringify(filters.value)
    if (computationCache.has(cacheKey)) {
      return computationCache.get(cacheKey)
    }
    
    const result = performExpensiveOperation(filteredBySearch.value)
    computationCache.set(cacheKey, result)
    return result
  })
  
  // ❌ 避免：在 computed 中执行副作用
  const badComputed = computed(() => {
    const result = items.value.length
    // ❌ 不要在 computed 中执行副作用
    // localStorage.setItem('count', result)
    // updateUI()
    return result
  })
  
  return {
    items,
    filters,
    filteredByCategory,
    filteredBySearch,
    expensiveComputation
  }
})

const computationCache = new Map()
```

### 2.3 数据加载策略

```javascript
// ✅ 推荐：智能数据加载
export const useDataStore = defineStore('data', () => {
  const items = ref(new Map())
  const loading = ref(false)
  const lastFetch = ref(new Map())
  
  // 带缓存的数据获取
  const fetchData = async (id, options = {}) => {
    const {
      force = false,
      cacheTtl = 5 * 60 * 1000 // 5分钟缓存
    } = options
    
    // 检查缓存
    if (!force && items.value.has(id)) {
      const lastFetchTime = lastFetch.value.get(id)
      if (lastFetchTime && Date.now() - lastFetchTime < cacheTtl) {
        return items.value.get(id)
      }
    }
    
    loading.value = true
    
    try {
      const data = await api.fetchData(id)
      items.value.set(id, data)
      lastFetch.value.set(id, Date.now())
      return data
    } finally {
      loading.value = false
    }
  }
  
  // 批量加载
  const fetchBatch = async (ids) => {
    const uncachedIds = ids.filter(id => !items.value.has(id))
    
    if (uncachedIds.length === 0) {
      return ids.map(id => items.value.get(id))
    }
    
    loading.value = true
    
    try {
      const data = await api.fetchBatch(uncachedIds)
      
      data.forEach(item => {
        items.value.set(item.id, item)
        lastFetch.value.set(item.id, Date.now())
      })
      
      return ids.map(id => items.value.get(id))
    } finally {
      loading.value = false
    }
  }
  
  // 预加载相关数据
  const preloadRelated = async (mainId) => {
    const main = items.value.get(mainId)
    if (!main || !main.relatedIds) return
    
    // 在后台预加载相关数据
    Promise.all(
      main.relatedIds.map(id => fetchData(id, { force: false }))
    ).catch(console.error)
  }
  
  return {
    items: computed(() => Object.fromEntries(items.value)),
    loading: readonly(loading),
    fetchData,
    fetchBatch,
    preloadRelated
  }
})
```

## 三、错误处理模式

### 3.1 统一错误处理

```javascript
// 错误类型定义
export class ApiError extends Error {
  constructor(message, status, code, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export class ValidationError extends Error {
  constructor(message, field, value) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
    this.value = value
  }
}

// 统一错误处理 Store
export const useErrorStore = defineStore('error', () => {
  const errors = ref([])
  const globalError = ref(null)
  
  // 添加错误
  const addError = (error, context = {}) => {
    const errorItem = {
      id: nanoid(),
      message: error.message,
      type: error.constructor.name,
      timestamp: new Date(),
      context,
      stack: error.stack
    }
    
    errors.value.push(errorItem)
    
    // 严重错误设置为全局错误
    if (error instanceof ApiError && error.status >= 500) {
      globalError.value = errorItem
    }
    
    // 自动清理旧错误
    if (errors.value.length > 50) {
      errors.value.splice(0, 25)
    }
    
    return errorItem.id
  }
  
  // 处理 API 错误
  const handleApiError = (error, action = '') => {
    console.error(`API Error in ${action}:`, error)
    
    let message = '操作失败，请稍后重试'
    
    if (error.status === 401) {
      message = '请先登录'
      // 触发登录流程
      navigateTo('/login')
    } else if (error.status === 403) {
      message = '没有权限执行此操作'
    } else if (error.status === 404) {
      message = '请求的资源不存在'
    } else if (error.status >= 500) {
      message = '服务器错误，请联系管理员'
    } else if (error.message) {
      message = error.message
    }
    
    return addError(new ApiError(message, error.status, error.code), {
      action,
      originalError: error
    })
  }
  
  return {
    errors: readonly(errors),
    globalError: readonly(globalError),
    addError,
    handleApiError
  }
})
```

### 3.2 Action 错误处理模式

```javascript
export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const loading = ref(false)
  const errorStore = useErrorStore()
  
  // ✅ 推荐：统一错误处理模式
  const createActionWithErrorHandling = (actionName, apiCall) => {
    return async (...args) => {
      loading.value = true
      
      try {
        const result = await apiCall(...args)
        return { success: true, data: result }
      } catch (error) {
        const errorId = errorStore.handleApiError(error, actionName)
        return { success: false, error, errorId }
      } finally {
        loading.value = false
      }
    }
  }
  
  // 使用统一错误处理
  const fetchUser = createActionWithErrorHandling(
    'fetchUser',
    async (id) => {
      const response = await api.fetchUser(id)
      user.value = response.data
      return response.data
    }
  )
  
  const updateUser = createActionWithErrorHandling(
    'updateUser',
    async (id, updates) => {
      const response = await api.updateUser(id, updates)
      user.value = { ...user.value, ...response.data }
      return response.data
    }
  )
  
  return {
    user: readonly(user),
    loading: readonly(loading),
    fetchUser,
    updateUser
  }
})
```

## 四、代码组织

### 4.1 文件结构

```
stores/
├── index.js                 # Store 注册和配置
├── modules/                 # 按模块组织
│   ├── user/
│   │   ├── index.js        # 用户相关 Store
│   │   ├── types.js        # 类型定义
│   │   └── api.js          # API 调用
│   ├── product/
│   └── order/
├── plugins/                 # Store 插件
│   ├── persistence.js
│   ├── api.js
│   └── logger.js
├── composables/            # 组合式函数
│   ├── useAsyncData.js
│   ├── useErrorHandler.js
│   └── useLocalStorage.js
└── utils/                  # 工具函数
    ├── validators.js
    ├── formatters.js
    └── constants.js
```

### 4.2 Store 组合

```javascript
// stores/modules/user/index.js
export const useUserStore = defineStore('user', () => {
  // 组合多个功能
  const profile = useUserProfile()
  const preferences = useUserPreferences()
  const authentication = useAuthentication()
  
  return {
    ...profile,
    ...preferences,
    ...authentication
  }
})

// stores/modules/user/profile.js
export const useUserProfile = () => {
  const profile = ref(null)
  const loading = ref(false)
  
  const fetchProfile = async (id) => {
    loading.value = true
    try {
      profile.value = await api.fetchUserProfile(id)
    } finally {
      loading.value = false
    }
  }
  
  return {
    profile: readonly(profile),
    profileLoading: readonly(loading),
    fetchProfile
  }
}

// stores/modules/user/preferences.js
export const useUserPreferences = () => {
  const preferences = ref({
    theme: 'light',
    language: 'zh-CN'
  })
  
  const updatePreferences = (updates) => {
    preferences.value = { ...preferences.value, ...updates }
    localStorage.setItem('userPreferences', JSON.stringify(preferences.value))
  }
  
  return {
    preferences: readonly(preferences),
    updatePreferences
  }
}
```

### 4.3 类型安全

```typescript
// stores/types.ts
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export type UserRole = 'admin' | 'user' | 'moderator'

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    total: number
    pages: number
  }
}

// stores/modules/user/index.ts
export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref<boolean>(false)
  
  const fetchUsers = async (): Promise<User[]> => {
    loading.value = true
    
    try {
      const response: ApiResponse<User[]> = await api.fetchUsers()
      users.value = response.data
      return response.data
    } finally {
      loading.value = false
    }
  }
  
  const setCurrentUser = (user: User | null): void => {
    currentUser.value = user
  }
  
  return {
    users: readonly(users),
    currentUser: readonly(currentUser),
    loading: readonly(loading),
    fetchUsers,
    setCurrentUser
  }
})
```

## 五、测试策略

### 5.1 测试结构

```javascript
// tests/stores/user.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })
  
  describe('State Management', () => {
    it('should initialize with correct default state', () => {
      const store = useUserStore()
      
      expect(store.currentUser).toBe(null)
      expect(store.users).toEqual([])
      expect(store.loading).toBe(false)
    })
    
    it('should update state correctly', () => {
      const store = useUserStore()
      const mockUser = { id: 1, name: 'Test User' }
      
      store.setCurrentUser(mockUser)
      
      expect(store.currentUser).toEqual(mockUser)
    })
  })
  
  describe('Actions', () => {
    it('should fetch users successfully', async () => {
      // 测试成功情况
    })
    
    it('should handle fetch errors gracefully', async () => {
      // 测试错误情况
    })
  })
  
  describe('Getters', () => {
    it('should compute derived state correctly', () => {
      // 测试计算属性
    })
  })
})
```

### 5.2 Mock 策略

```javascript
// tests/utils/store-mocks.js
export const createMockUserStore = (initialState = {}) => {
  const defaultState = {
    currentUser: null,
    users: [],
    loading: false
  }
  
  const state = reactive({ ...defaultState, ...initialState })
  
  return {
    ...toRefs(state),
    
    // Mock actions
    fetchUsers: vi.fn().mockResolvedValue([]),
    setCurrentUser: vi.fn().mockImplementation((user) => {
      state.currentUser = user
    }),
    
    // Mock utility methods
    $patch: vi.fn(),
    $reset: vi.fn(),
    $subscribe: vi.fn(() => () => {}), // 返回取消订阅函数
    $onAction: vi.fn(() => () => {})
  }
}

// 在测试中使用
import { createMockUserStore } from '@/tests/utils/store-mocks'

describe('Component with Store', () => {
  it('should work with mock store', () => {
    const mockStore = createMockUserStore({
      currentUser: { id: 1, name: 'Test User' }
    })
    
    // 使用 mock store 进行测试
    expect(mockStore.currentUser.name).toBe('Test User')
  })
})
```

## 六、部署和监控

### 6.1 生产环境优化

```javascript
// stores/config.js
export const useConfigStore = defineStore('config', () => {
  const isDevelopment = ref(process.env.NODE_ENV === 'development')
  const isProduction = ref(process.env.NODE_ENV === 'production')
  
  // 生产环境禁用某些功能
  const debugMode = ref(isDevelopment.value)
  const enableDevTools = ref(isDevelopment.value)
  const enableLogging = ref(!isProduction.value)
  
  return {
    isDevelopment: readonly(isDevelopment),
    isProduction: readonly(isProduction),
    debugMode: readonly(debugMode),
    enableDevTools: readonly(enableDevTools),
    enableLogging: readonly(enableLogging)
  }
})

// 条件性插件注册
const pinia = createPinia()

if (process.env.NODE_ENV === 'development') {
  pinia.use(createDebugPlugin())
  pinia.use(createPerformancePlugin())
}

if (process.env.NODE_ENV === 'production') {
  pinia.use(createErrorReportingPlugin())
  pinia.use(createAnalyticsPlugin())
}
```

### 6.2 监控和分析

```javascript
// plugins/analytics.js
export function createAnalyticsPlugin() {
  return function analyticsPlugin({ store }) {
    // 监控 Store 使用情况
    store.$onAction(({ name, args, after, onError }) => {
      const startTime = Date.now()
      
      after((result) => {
        const duration = Date.now() - startTime
        
        // 发送分析数据
        analytics.track('store_action', {
          store: store.$id,
          action: name,
          duration,
          success: true
        })
      })
      
      onError((error) => {
        analytics.track('store_error', {
          store: store.$id,
          action: name,
          error: error.message,
          stack: error.stack
        })
      })
    })
    
    // 监控状态大小
    store.$subscribe((mutation, state) => {
      const stateSize = JSON.stringify(state).length
      
      if (stateSize > 1024 * 100) { // 100KB
        console.warn(`Large state detected in ${store.$id}: ${stateSize} bytes`)
        
        analytics.track('large_state_warning', {
          store: store.$id,
          size: stateSize
        })
      }
    })
  }
}
```

## 七、迁移和升级

### 7.1 从 Vuex 迁移

```javascript
// 迁移清单
const migrationChecklist = {
  preparation: [
    '分析现有 Vuex Store 结构',
    '识别 mutations 和 actions',
    '检查 modules 的使用',
    '记录现有的 getters',
    '分析组件中的使用方式'
  ],
  
  migration: [
    '创建对应的 Pinia Stores',
    '转换 state 结构',
    '合并 mutations 到 actions',
    '转换 getters 为 computed',
    '更新组件中的使用方式'
  ],
  
  testing: [
    '单元测试 Store 逻辑',
    '集成测试组件交互',
    '性能测试对比',
    '用户验收测试'
  ]
}

// Vuex 到 Pinia 映射示例
const vuexToPiniaMapping = {
  // Vuex
  vuex: {
    state: () => ({ count: 0 }),
    mutations: {
      increment(state) { state.count++ }
    },
    actions: {
      incrementAsync({ commit }) {
        setTimeout(() => commit('increment'), 1000)
      }
    },
    getters: {
      doubleCount: (state) => state.count * 2
    }
  },
  
  // Pinia 等效
  pinia: defineStore('counter', () => {
    const count = ref(0)
    
    const doubleCount = computed(() => count.value * 2)
    
    const increment = () => {
      count.value++
    }
    
    const incrementAsync = () => {
      setTimeout(increment, 1000)
    }
    
    return {
      count,
      doubleCount,
      increment,
      incrementAsync
    }
  })
}
```

## 参考资料

- [Pinia Best Practices](https://pinia.vuejs.org/cookbook/)
- [Vue.js Style Guide](https://vuejs.org/style-guide/)
- [Clean Code Principles](https://clean-code-javascript.com/)
- [JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

**下一节** → [第 22 节：常见问题](./22-pinia-faq.md)
