# 第 53 节：最佳实践总结

## 概述

本节总结Vue状态管理的核心最佳实践，涵盖架构设计、代码组织、性能优化、团队协作等方面。

## 一、架构设计原则

### 1.1 单向数据流

```javascript
// ✅ 推荐：严格的单向数据流
export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    filter: 'all',
    loading: false
  }),
  
  getters: {
    // 计算属性基于状态派生
    filteredTasks: (state) => {
      switch (state.filter) {
        case 'active': return state.tasks.filter(t => !t.completed)
        case 'completed': return state.tasks.filter(t => t.completed)
        default: return state.tasks
      }
    },
    
    taskStats: (state) => ({
      total: state.tasks.length,
      active: state.tasks.filter(t => !t.completed).length,
      completed: state.tasks.filter(t => t.completed).length
    })
  },
  
  actions: {
    // 通过 actions 修改状态
    addTask(text) {
      this.tasks.push({
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date()
      })
    },
    
    toggleTask(id) {
      const task = this.tasks.find(t => t.id === id)
      if (task) {
        task.completed = !task.completed
      }
    },
    
    setFilter(filter) {
      this.filter = filter
    }
  }
})

// ❌ 避免：在组件中直接修改状态
// const taskStore = useTaskStore()
// taskStore.tasks.push(newTask) // 不要这样做
```

### 1.2 状态归一化

```javascript
// ✅ 推荐：归一化的状态结构
export const useNormalizedStore = defineStore('normalized', {
  state: () => ({
    // 使用 Map 存储实体
    users: new Map(),
    posts: new Map(),
    comments: new Map(),
    
    // 存储 ID 列表用于排序和筛选
    userIds: [],
    postIds: [],
    
    // 关系映射
    postsByUser: new Map(),
    commentsByPost: new Map()
  }),
  
  getters: {
    getUserById: (state) => (id) => state.users.get(id),
    
    getPostById: (state) => (id) => state.posts.get(id),
    
    getPostsWithAuthors: (state) => {
      return state.postIds.map(id => {
        const post = state.posts.get(id)
        const author = state.users.get(post.authorId)
        return { ...post, author }
      })
    },
    
    getUserPosts: (state) => (userId) => {
      const postIds = state.postsByUser.get(userId) || []
      return postIds.map(id => state.posts.get(id)).filter(Boolean)
    }
  },
  
  actions: {
    // 批量设置用户
    setUsers(users) {
      users.forEach(user => {
        this.users.set(user.id, user)
        if (!this.userIds.includes(user.id)) {
          this.userIds.push(user.id)
        }
      })
    },
    
    // 添加帖子并更新关系
    addPost(post) {
      this.posts.set(post.id, post)
      this.postIds.push(post.id)
      
      // 更新用户-帖子关系
      const userPosts = this.postsByUser.get(post.authorId) || []
      userPosts.push(post.id)
      this.postsByUser.set(post.authorId, userPosts)
    },
    
    // 删除帖子及相关数据
    deletePost(postId) {
      const post = this.posts.get(postId)
      if (!post) return
      
      // 删除帖子
      this.posts.delete(postId)
      this.postIds = this.postIds.filter(id => id !== postId)
      
      // 更新用户-帖子关系
      const userPosts = this.postsByUser.get(post.authorId) || []
      const updatedUserPosts = userPosts.filter(id => id !== postId)
      this.postsByUser.set(post.authorId, updatedUserPosts)
      
      // 删除相关评论
      const commentIds = this.commentsByPost.get(postId) || []
      commentIds.forEach(commentId => this.comments.delete(commentId))
      this.commentsByPost.delete(postId)
    }
  }
})
```

### 1.3 模块化设计

```javascript
// stores/modules/user/index.js
export const useUserModule = defineStore('user', {
  state: () => ({
    currentUser: null,
    users: [],
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    userById: (state) => (id) => state.users.find(u => u.id === id)
  },
  
  actions: {
    async login(credentials) {
      // 登录逻辑
    },
    
    async fetchUsers() {
      // 获取用户列表
    }
  }
})

// stores/modules/user/profile.js
export const useUserProfileModule = defineStore('userProfile', {
  state: () => ({
    profile: null,
    editing: false,
    changes: {}
  }),
  
  actions: {
    async updateProfile(updates) {
      // 更新用户资料
    },
    
    async uploadAvatar(file) {
      // 上传头像
    }
  }
})

// stores/modules/user/settings.js
export const useUserSettingsModule = defineStore('userSettings', {
  state: () => ({
    preferences: {},
    notifications: {},
    privacy: {}
  }),
  
  actions: {
    async updatePreferences(prefs) {
      // 更新偏好设置
    }
  }
})

// stores/index.js - 统一导出
export { useUserModule } from './modules/user'
export { useUserProfileModule } from './modules/user/profile'
export { useUserSettingsModule } from './modules/user/settings'
```

## 二、代码组织规范

### 2.1 文件命名和结构

```
src/
├── stores/
│   ├── auth.js           # 认证相关
│   ├── user.js           # 用户管理
│   ├── product.js        # 产品管理
│   ├── order.js          # 订单管理
│   └── modules/          # 复杂模块
│       ├── dashboard/
│       │   ├── analytics.js
│       │   ├── widgets.js
│       │   └── index.js
│       └── admin/
│           ├── users.js
│           ├── roles.js
│           └── index.js
├── composables/          # 组合式函数
│   ├── useAuth.js
│   ├── useApi.js
│   └── useForm.js
└── types/               # TypeScript 类型定义
    ├── store.ts
    ├── user.ts
    └── api.ts
```

### 2.2 命名约定

```javascript
// ✅ 推荐的命名约定

// Store 名称：使用 camelCase
export const useUserStore = defineStore('userStore', {})
export const useOrderManagementStore = defineStore('orderManagement', {})

// State 属性：使用 camelCase，语义明确
state: () => ({
  currentUser: null,        // 当前用户
  userList: [],            // 用户列表
  isLoading: false,        // 加载状态
  lastFetchTime: null,     // 最后获取时间
  validationErrors: {}     // 验证错误
})

// Getters：使用动词或形容词，描述性强
getters: {
  isAuthenticated: (state) => !!state.currentUser,
  activeUsers: (state) => state.userList.filter(u => u.active),
  hasPermission: (state) => (permission) => state.currentUser?.permissions.includes(permission),
  userCount: (state) => state.userList.length
}

// Actions：使用动词，描述操作
actions: {
  async fetchUsers() {},        // 获取用户
  async createUser(data) {},    // 创建用户
  async updateUser(id, data) {}, // 更新用户
  async deleteUser(id) {},      // 删除用户
  setCurrentUser(user) {},      // 设置当前用户
  clearErrors() {},             // 清除错误
  resetState() {}               // 重置状态
}
```

### 2.3 类型定义

```typescript
// types/store.ts
export interface BaseState {
  loading: boolean
  error: string | null
  lastUpdated: string | null
}

export interface PaginationState {
  currentPage: number
  pageSize: number
  total: number
  hasNextPage: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface UserState extends BaseState, PaginationState {
  currentUser: User | null
  users: User[]
  selectedUsers: User[]
  filters: UserFilters
}

export interface UserFilters {
  role?: string
  status?: 'active' | 'inactive'
  searchTerm?: string
  dateRange?: {
    start: string
    end: string
  }
}

// stores/user.ts
import type { UserState, User, UserFilters } from '@/types/store'

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    // Base state
    loading: false,
    error: null,
    lastUpdated: null,
    
    // Pagination
    currentPage: 1,
    pageSize: 10,
    total: 0,
    hasNextPage: false,
    
    // User specific
    currentUser: null,
    users: [],
    selectedUsers: [],
    filters: {}
  }),
  
  getters: {
    isAuthenticated(): boolean {
      return !!this.currentUser
    },
    
    filteredUsers(): User[] {
      // 过滤逻辑
    },
    
    hasRole: (state) => (role: string): boolean => {
      return state.currentUser?.role === role
    }
  },
  
  actions: {
    async fetchUsers(filters?: UserFilters): Promise<void> {
      // 实现逻辑
    },
    
    async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
      // 实现逻辑
    }
  }
})
```

## 三、性能优化策略

### 3.1 计算属性优化

```javascript
// ✅ 推荐：使用 computed 缓存复杂计算
export const useOptimizedStore = defineStore('optimized', {
  state: () => ({
    items: [],
    filters: {
      category: '',
      priceRange: [0, 1000],
      inStock: false
    },
    sortBy: 'name',
    sortOrder: 'asc'
  }),
  
  getters: {
    // 使用 getter 自动缓存
    filteredAndSortedItems: (state) => {
      let filtered = state.items
      
      // 分步过滤，避免重复计算
      if (state.filters.category) {
        filtered = filtered.filter(item => item.category === state.filters.category)
      }
      
      if (state.filters.inStock) {
        filtered = filtered.filter(item => item.stock > 0)
      }
      
      filtered = filtered.filter(item => 
        item.price >= state.filters.priceRange[0] && 
        item.price <= state.filters.priceRange[1]
      )
      
      // 排序
      return filtered.sort((a, b) => {
        const aVal = a[state.sortBy]
        const bVal = b[state.sortBy]
        const modifier = state.sortOrder === 'desc' ? -1 : 1
        
        return aVal > bVal ? modifier : aVal < bVal ? -modifier : 0
      })
    },
    
    // 统计信息也可以缓存
    itemStats: (state) => {
      const items = state.items
      return {
        total: items.length,
        inStock: items.filter(i => i.stock > 0).length,
        categories: [...new Set(items.map(i => i.category))],
        avgPrice: items.reduce((sum, i) => sum + i.price, 0) / items.length
      }
    }
  },
  
  actions: {
    // 批量更新避免多次响应式更新
    updateFilters(newFilters) {
      this.$patch({
        filters: { ...this.filters, ...newFilters }
      })
    },
    
    // 使用 $patch 函数形式进行复杂更新
    bulkUpdateItems(updates) {
      this.$patch((state) => {
        updates.forEach(({ id, data }) => {
          const item = state.items.find(i => i.id === id)
          if (item) {
            Object.assign(item, data)
          }
        })
      })
    }
  }
})
```

### 3.2 懒加载和分页

```javascript
// composables/usePaginatedData.js
export function usePaginatedData(fetchFunction, pageSize = 10) {
  const loading = ref(false)
  const error = ref(null)
  const items = ref([])
  const currentPage = ref(1)
  const total = ref(0)
  const hasNextPage = computed(() => currentPage.value * pageSize < total.value)
  
  const loadPage = async (page = 1, reset = false) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetchFunction({
        page,
        limit: pageSize,
        offset: (page - 1) * pageSize
      })
      
      if (reset || page === 1) {
        items.value = response.data
      } else {
        items.value.push(...response.data)
      }
      
      currentPage.value = page
      total.value = response.total
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  
  const loadMore = () => {
    if (hasNextPage.value && !loading.value) {
      loadPage(currentPage.value + 1, false)
    }
  }
  
  const refresh = () => {
    loadPage(1, true)
  }
  
  return {
    loading,
    error,
    items,
    currentPage,
    total,
    hasNextPage,
    loadPage,
    loadMore,
    refresh
  }
}

// stores/paginatedStore.js
export const usePaginatedStore = defineStore('paginated', () => {
  const { 
    loading, 
    error, 
    items, 
    loadPage, 
    loadMore, 
    refresh 
  } = usePaginatedData(api.fetchUsers)
  
  return {
    loading,
    error,
    users: items,
    loadPage,
    loadMore,
    refresh
  }
})
```

## 四、错误处理和调试

### 4.1 统一错误处理

```javascript
// utils/errorHandler.js
export class StoreErrorHandler {
  static async handleAsyncAction(action, context = {}) {
    try {
      return await action()
    } catch (error) {
      console.error('Store action failed:', error, context)
      
      // 根据错误类型进行不同处理
      if (error.status === 401) {
        // 认证过期，重定向到登录页
        const authStore = useAuthStore()
        authStore.logout()
        router.push('/login')
      } else if (error.status >= 500) {
        // 服务器错误，显示友好提示
        const notificationStore = useNotificationStore()
        notificationStore.addError('服务器暂时不可用，请稍后重试')
      } else {
        // 其他错误，显示具体信息
        const notificationStore = useNotificationStore()
        notificationStore.addError(error.message || '操作失败')
      }
      
      throw error
    }
  }
}

// 在 store 中使用
export const useUserStore = defineStore('user', {
  actions: {
    async fetchUsers() {
      return StoreErrorHandler.handleAsyncAction(async () => {
        this.loading = true
        const response = await api.get('/users')
        this.users = response.data
        return response.data
      }, { action: 'fetchUsers', store: 'user' })
      .finally(() => {
        this.loading = false
      })
    }
  }
})
```

### 4.2 开发调试工具

```javascript
// plugins/storeDebugger.js
export function createStoreDebugger(options = {}) {
  const { 
    enableLogging = true, 
    enableSnapshot = true,
    logLevel = 'info' 
  } = options
  
  return ({ store }) => {
    if (process.env.NODE_ENV !== 'development') return
    
    const storeName = store.$id
    
    // 监听状态变化
    store.$subscribe((mutation, state) => {
      if (enableLogging) {
        console.group(`🏪 Store: ${storeName}`)
        console.log('📝 Mutation:', mutation)
        console.log('📊 State:', state)
        console.groupEnd()
      }
    })
    
    // 监听 Action 调用
    store.$onAction(({ name, args, after, onError }) => {
      const startTime = Date.now()
      
      if (enableLogging) {
        console.log(`🚀 Action: ${storeName}.${name}`, args)
      }
      
      after((result) => {
        const duration = Date.now() - startTime
        if (enableLogging) {
          console.log(`✅ Action completed in ${duration}ms:`, result)
        }
      })
      
      onError((error) => {
        const duration = Date.now() - startTime
        console.error(`❌ Action failed after ${duration}ms:`, error)
      })
    })
    
    // 添加调试方法
    store.$debug = {
      snapshot: () => JSON.parse(JSON.stringify(store.$state)),
      restore: (snapshot) => store.$patch(snapshot),
      reset: () => store.$reset?.(),
      log: () => console.log(`Store ${storeName}:`, store.$state)
    }
  }
}

// main.js
if (process.env.NODE_ENV === 'development') {
  pinia.use(createStoreDebugger({
    enableLogging: true,
    enableSnapshot: true
  }))
}
```

## 五、团队协作规范

### 5.1 代码审查清单

```markdown
# Store 代码审查清单

## 结构和组织 ✅
- [ ] Store 名称清晰且遵循命名约定
- [ ] 状态结构合理，避免深度嵌套
- [ ] Getters 用于派生数据，没有副作用
- [ ] Actions 处理业务逻辑和异步操作

## 性能考虑 ⚡
- [ ] 使用 computed/getters 缓存复杂计算
- [ ] 避免在 getters 中进行 API 调用
- [ ] 大量数据更新时使用 $patch
- [ ] 适当使用数据归一化

## 错误处理 🛡️
- [ ] 异步操作有适当的错误处理
- [ ] 错误状态被正确管理
- [ ] 用户友好的错误提示

## 类型安全 📝
- [ ] TypeScript 类型定义完整
- [ ] 接口和类型导入正确
- [ ] 避免使用 any 类型

## 测试覆盖 🧪
- [ ] 关键业务逻辑有单元测试
- [ ] 异步操作测试包含成功和失败场景
- [ ] Mock 数据合理且真实

## 文档说明 📚
- [ ] 复杂业务逻辑有注释说明
- [ ] 公共 API 有 JSDoc 文档
- [ ] README 包含使用示例
```

### 5.2 Git 提交规范

```bash
# Commit 消息格式
feat(store): add user profile management
fix(auth): handle token refresh failure
refactor(user): normalize user data structure
test(order): add integration tests for checkout flow
docs(store): update API documentation

# 示例提交
git commit -m "feat(user): implement user role management

- Add role-based permission system
- Update user store with role actions
- Add role validation in guards
- Add unit tests for role operations

Closes #123"
```

### 5.3 文档模板

```javascript
/**
 * 用户管理 Store
 * 
 * 负责用户数据的获取、更新和管理，包括：
 * - 用户列表的分页加载
 * - 用户资料的增删改查
 * - 用户权限和角色管理
 * 
 * @example
 * ```js
 * const userStore = useUserStore()
 * 
 * // 获取用户列表
 * await userStore.fetchUsers({ page: 1, limit: 10 })
 * 
 * // 创建用户
 * const newUser = await userStore.createUser({
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * })
 * ```
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    /** @type {User[]} 用户列表 */
    users: [],
    
    /** @type {User|null} 当前选中的用户 */
    selectedUser: null,
    
    /** @type {boolean} 是否正在加载 */
    loading: false,
    
    /** @type {string|null} 错误消息 */
    error: null
  }),
  
  getters: {
    /**
     * 获取活跃用户列表
     * @returns {User[]} 状态为活跃的用户列表
     */
    activeUsers: (state) => state.users.filter(user => user.active),
    
    /**
     * 根据ID获取用户
     * @param {string} id 用户ID
     * @returns {User|undefined} 用户对象或undefined
     */
    getUserById: (state) => (id) => state.users.find(user => user.id === id)
  },
  
  actions: {
    /**
     * 获取用户列表
     * @param {Object} params 查询参数
     * @param {number} params.page 页码
     * @param {number} params.limit 每页数量
     * @param {string} [params.search] 搜索关键词
     * @returns {Promise<User[]>} 用户列表
     */
    async fetchUsers(params = {}) {
      // 实现逻辑
    },
    
    /**
     * 创建新用户
     * @param {Omit<User, 'id'>} userData 用户数据
     * @returns {Promise<User>} 创建的用户对象
     * @throws {Error} 当创建失败时抛出错误
     */
    async createUser(userData) {
      // 实现逻辑
    }
  }
})
```

## 参考资料

- [Vue.js Style Guide](https://vuejs.org/style-guide/)
- [Pinia Best Practices](https://pinia.vuejs.org/cookbook/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

**下一节** → [第 54 节：迁移指南](./54-migration-guide.md)
