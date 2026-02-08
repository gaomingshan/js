# 第 27 节：Getters 计算属性

## 概述

Getters 是 Vuex 中的计算属性，用于从 Store 的状态中派生出一些状态。Getters 可以认为是 Store 的计算属性，具有缓存特性，只有当它的依赖值发生改变才会被重新计算。

## 一、基本用法

### 1.1 定义 Getters

```javascript
// store/index.js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      todos: [
        { id: 1, text: '学习 Vue', completed: false },
        { id: 2, text: '学习 Vuex', completed: true },
        { id: 3, text: '构建项目', completed: false }
      ],
      user: {
        id: 1,
        name: 'John Doe',
        role: 'admin',
        isActive: true
      },
      products: [
        { id: 1, name: 'iPhone', price: 999, category: 'phone', inStock: true },
        { id: 2, name: 'iPad', price: 599, category: 'tablet', inStock: false },
        { id: 3, name: 'MacBook', price: 1299, category: 'laptop', inStock: true }
      ]
    }
  },
  
  getters: {
    // 基本 getter
    completedTodos(state) {
      return state.todos.filter(todo => todo.completed)
    },
    
    // 返回数量
    completedTodosCount(state, getters) {
      return getters.completedTodos.length
    },
    
    // 基于用户状态的 getter
    isAdmin(state) {
      return state.user.role === 'admin'
    },
    
    // 复杂计算
    availableProducts(state) {
      return state.products.filter(product => product.inStock)
    },
    
    // 返回函数的 getter（用于传参）
    getTodoById: (state) => (id) => {
      return state.todos.find(todo => todo.id === id)
    },
    
    // 价格相关计算
    productsByPrice: (state) => (minPrice, maxPrice) => {
      return state.products.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      )
    }
  }
})

export default store
```

### 1.2 访问 Getters

```vue
<template>
  <div class="getters-example">
    <h2>Getters 示例</h2>
    
    <!-- 直接访问 -->
    <div class="todos-summary">
      <p>已完成任务: {{ $store.getters.completedTodosCount }} / {{ $store.state.todos.length }}</p>
      <p>管理员权限: {{ $store.getters.isAdmin ? '是' : '否' }}</p>
    </div>
    
    <!-- 通过计算属性访问 -->
    <div class="completed-todos">
      <h3>已完成的任务</h3>
      <ul>
        <li v-for="todo in completedTodos" :key="todo.id">
          {{ todo.text }}
        </li>
      </ul>
    </div>
    
    <!-- 可用产品 -->
    <div class="available-products">
      <h3>有库存产品</h3>
      <div v-for="product in availableProducts" :key="product.id" class="product-card">
        <h4>{{ product.name }}</h4>
        <p>价格: ¥{{ product.price }}</p>
        <p>类别: {{ product.category }}</p>
      </div>
    </div>
    
    <!-- 使用参数化 getter -->
    <div class="todo-search">
      <input v-model="selectedTodoId" type="number" placeholder="输入待办ID" />
      <div v-if="selectedTodo">
        <p>找到: {{ selectedTodo.text }}</p>
        <p>状态: {{ selectedTodo.completed ? '已完成' : '未完成' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GettersExample',
  
  data() {
    return {
      selectedTodoId: 1
    }
  },
  
  computed: {
    // 通过计算属性访问 getters
    completedTodos() {
      return this.$store.getters.completedTodos
    },
    
    availableProducts() {
      return this.$store.getters.availableProducts
    },
    
    // 使用参数化 getter
    selectedTodo() {
      return this.$store.getters.getTodoById(parseInt(this.selectedTodoId))
    }
  }
}
</script>
```

## 二、使用 mapGetters 辅助函数

### 2.1 基本映射

```vue
<template>
  <div class="map-getters-example">
    <h2>MapGetters 示例</h2>
    
    <div class="statistics">
      <p>总任务数: {{ totalTodos }}</p>
      <p>已完成: {{ completedCount }}</p>
      <p>未完成: {{ pendingCount }}</p>
      <p>完成率: {{ completionRate }}%</p>
    </div>
    
    <div class="user-info">
      <p>当前用户: {{ userName }}</p>
      <p>权限级别: {{ userRole }}</p>
      <p>活跃状态: {{ userStatus }}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'MapGettersExample',
  
  computed: {
    // 数组语法：getter 名称与计算属性名相同
    ...mapGetters([
      'completedTodos',
      'availableProducts',
      'isAdmin'
    ]),
    
    // 对象语法：重命名 getter
    ...mapGetters({
      // 映射 this.completedCount 为 this.$store.getters.completedTodosCount
      completedCount: 'completedTodosCount',
      userName: 'userName',
      userRole: 'userRole'
    }),
    
    // 本地计算属性
    totalTodos() {
      return this.$store.state.todos.length
    },
    
    pendingCount() {
      return this.totalTodos - this.completedCount
    },
    
    completionRate() {
      return this.totalTodos === 0 ? 0 : Math.round((this.completedCount / this.totalTodos) * 100)
    },
    
    userStatus() {
      return this.$store.state.user.isActive ? '在线' : '离线'
    }
  }
}
</script>
```

### 2.2 模块化 Getters 映射

```javascript
// store/modules/users.js
export default {
  namespaced: true,
  
  state() {
    return {
      users: [
        { id: 1, name: 'Alice', role: 'admin', active: true },
        { id: 2, name: 'Bob', role: 'user', active: false },
        { id: 3, name: 'Charlie', role: 'moderator', active: true }
      ]
    }
  },
  
  getters: {
    activeUsers(state) {
      return state.users.filter(user => user.active)
    },
    
    adminUsers(state) {
      return state.users.filter(user => user.role === 'admin')
    },
    
    userCount(state) {
      return state.users.length
    },
    
    getUserById: (state) => (id) => {
      return state.users.find(user => user.id === id)
    }
  }
}
```

```vue
<template>
  <div class="module-getters">
    <h2>模块化 Getters</h2>
    
    <div class="user-stats">
      <p>总用户数: {{ userCount }}</p>
      <p>活跃用户数: {{ activeUserCount }}</p>
      <p>管理员数: {{ adminCount }}</p>
    </div>
    
    <div class="active-users">
      <h3>活跃用户</h3>
      <ul>
        <li v-for="user in activeUsers" :key="user.id">
          {{ user.name }} ({{ user.role }})
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ModuleGetters',
  
  computed: {
    // 映射模块的 getters
    ...mapGetters('users', [
      'activeUsers',
      'adminUsers',
      'userCount'
    ]),
    
    // 重命名模块 getters
    ...mapGetters('users', {
      adminCount: 'adminUsers'
    }),
    
    // 计算属性
    activeUserCount() {
      return this.activeUsers.length
    }
  }
}
</script>
```

## 三、高级 Getters 模式

### 3.1 组合和链式 Getters

```javascript
const store = createStore({
  state() {
    return {
      orders: [
        { id: 1, userId: 1, items: [{ productId: 1, quantity: 2, price: 999 }], status: 'completed' },
        { id: 2, userId: 2, items: [{ productId: 2, quantity: 1, price: 599 }], status: 'pending' },
        { id: 3, userId: 1, items: [{ productId: 3, quantity: 1, price: 1299 }], status: 'completed' }
      ],
      users: [
        { id: 1, name: 'Alice', vipLevel: 'gold' },
        { id: 2, name: 'Bob', vipLevel: 'silver' }
      ]
    }
  },
  
  getters: {
    // 基础 getter
    completedOrders(state) {
      return state.orders.filter(order => order.status === 'completed')
    },
    
    pendingOrders(state) {
      return state.orders.filter(order => order.status === 'pending')
    },
    
    // 基于其他 getters
    completedOrdersCount(state, getters) {
      return getters.completedOrders.length
    },
    
    // 复杂计算
    totalRevenue(state, getters) {
      return getters.completedOrders.reduce((total, order) => {
        const orderTotal = order.items.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        )
        return total + orderTotal
      }, 0)
    },
    
    // 用户相关的订单统计
    userOrderStats(state, getters) {
      return state.users.map(user => {
        const userOrders = state.orders.filter(order => order.userId === user.id)
        const completedOrders = userOrders.filter(order => order.status === 'completed')
        const totalSpent = completedOrders.reduce((sum, order) => {
          return sum + order.items.reduce((orderSum, item) => 
            orderSum + (item.price * item.quantity), 0
          )
        }, 0)
        
        return {
          ...user,
          orderCount: userOrders.length,
          completedOrderCount: completedOrders.length,
          totalSpent
        }
      })
    },
    
    // 参数化的组合 getter
    getOrdersByUserAndStatus: (state) => (userId, status) => {
      return state.orders.filter(order => 
        order.userId === userId && order.status === status
      )
    }
  }
})
```

### 3.2 缓存优化的 Getters

```javascript
// 带缓存的复杂计算 getter
const expensiveGettersStore = createStore({
  state() {
    return {
      bigDataset: [], // 大型数据集
      filters: {
        category: '',
        priceMin: 0,
        priceMax: Infinity,
        searchText: ''
      },
      cache: {
        lastFilterHash: null,
        filteredResults: []
      }
    }
  },
  
  getters: {
    // 生成过滤器哈希
    filterHash(state) {
      return JSON.stringify(state.filters)
    },
    
    // 带缓存的过滤结果
    filteredData(state, getters) {
      const currentHash = getters.filterHash
      
      // 如果过滤条件没变，返回缓存结果
      if (state.cache.lastFilterHash === currentHash) {
        return state.cache.filteredResults
      }
      
      // 执行复杂过滤计算
      const filtered = state.bigDataset.filter(item => {
        // 类别过滤
        if (state.filters.category && item.category !== state.filters.category) {
          return false
        }
        
        // 价格过滤
        if (item.price < state.filters.priceMin || item.price > state.filters.priceMax) {
          return false
        }
        
        // 文本搜索
        if (state.filters.searchText && 
            !item.name.toLowerCase().includes(state.filters.searchText.toLowerCase())) {
          return false
        }
        
        return true
      })
      
      // 更新缓存
      state.cache.lastFilterHash = currentHash
      state.cache.filteredResults = filtered
      
      return filtered
    },
    
    // 统计信息
    filterStats(state, getters) {
      return {
        total: state.bigDataset.length,
        filtered: getters.filteredData.length,
        percentage: state.bigDataset.length === 0 ? 0 : 
          Math.round((getters.filteredData.length / state.bigDataset.length) * 100)
      }
    }
  },
  
  mutations: {
    SET_FILTER(state, { key, value }) {
      state.filters[key] = value
    },
    
    CLEAR_CACHE(state) {
      state.cache.lastFilterHash = null
      state.cache.filteredResults = []
    }
  }
})
```

### 3.3 异步数据的 Getters

```javascript
// 处理异步数据的 getters
const asyncDataStore = createStore({
  state() {
    return {
      posts: [],
      users: [],
      comments: [],
      loading: {
        posts: false,
        users: false,
        comments: false
      },
      loaded: {
        posts: false,
        users: false,
        comments: false
      }
    }
  },
  
  getters: {
    // 检查数据是否已加载
    isDataReady(state) {
      return state.loaded.posts && state.loaded.users && state.loaded.comments
    },
    
    // 安全的数据访问（确保数据已加载）
    postsWithAuthors(state, getters) {
      if (!getters.isDataReady) return []
      
      return state.posts.map(post => {
        const author = state.users.find(user => user.id === post.authorId)
        return {
          ...post,
          author: author ? author.name : 'Unknown'
        }
      })
    },
    
    // 带评论的文章
    postsWithComments(state, getters) {
      if (!getters.isDataReady) return []
      
      return getters.postsWithAuthors.map(post => {
        const comments = state.comments.filter(comment => comment.postId === post.id)
        return {
          ...post,
          comments,
          commentCount: comments.length
        }
      })
    },
    
    // 热门文章（按评论数排序）
    popularPosts(state, getters) {
      return getters.postsWithComments
        .sort((a, b) => b.commentCount - a.commentCount)
        .slice(0, 10)
    },
    
    // 加载状态总结
    loadingStatus(state) {
      const loadingKeys = Object.keys(state.loading)
      const isLoading = loadingKeys.some(key => state.loading[key])
      const loadedCount = Object.values(state.loaded).filter(Boolean).length
      
      return {
        isLoading,
        progress: Math.round((loadedCount / loadingKeys.length) * 100),
        details: { ...state.loading },
        loaded: { ...state.loaded }
      }
    }
  }
})
```

## 四、Getters 最佳实践

### 4.1 性能优化

```javascript
// 性能优化的 getters 实践
const optimizedGetters = {
  getters: {
    // ✅ 使用缓存避免重复计算
    expensiveCalculation: memoize((state) => {
      return state.bigArray.reduce((acc, item) => {
        // 复杂计算逻辑
        return acc + heavyComputation(item)
      }, 0)
    }),
    
    // ✅ 避免在 getter 中创建新对象
    usersList(state) {
      // 返回引用而不是新数组
      return state.users
    },
    
    // ❌ 避免：每次调用都创建新数组
    // badUsersList(state) {
    //   return [...state.users] // 每次都创建新数组
    // },
    
    // ✅ 正确的排序 getter
    sortedUsers: memoize((state, sortKey = 'name', sortOrder = 'asc') => {
      return [...state.users].sort((a, b) => {
        if (sortOrder === 'asc') {
          return a[sortKey] > b[sortKey] ? 1 : -1
        } else {
          return a[sortKey] < b[sortKey] ? 1 : -1
        }
      })
    })
  }
}

// 简单的 memoize 函数
function memoize(fn) {
  const cache = new Map()
  
  return function(...args) {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn.apply(this, args)
    cache.set(key, result)
    
    return result
  }
}
```

### 4.2 类型安全的 Getters (TypeScript)

```typescript
// TypeScript 中的类型安全 getters
interface State {
  todos: Todo[]
  user: User | null
  products: Product[]
}

interface Todo {
  id: number
  text: string
  completed: boolean
}

interface User {
  id: number
  name: string
  role: 'admin' | 'user' | 'moderator'
}

interface Product {
  id: number
  name: string
  price: number
  category: string
  inStock: boolean
}

interface Getters {
  completedTodos: Todo[]
  completedTodosCount: number
  isAdmin: boolean
  availableProducts: Product[]
  getTodoById: (id: number) => Todo | undefined
}

const store = createStore<State>({
  state(): State {
    return {
      todos: [],
      user: null,
      products: []
    }
  },
  
  getters: {
    completedTodos: (state): Todo[] => {
      return state.todos.filter(todo => todo.completed)
    },
    
    completedTodosCount: (state, getters): number => {
      return (getters.completedTodos as Todo[]).length
    },
    
    isAdmin: (state): boolean => {
      return state.user?.role === 'admin'
    },
    
    availableProducts: (state): Product[] => {
      return state.products.filter(product => product.inStock)
    },
    
    getTodoById: (state) => (id: number): Todo | undefined => {
      return state.todos.find(todo => todo.id === id)
    }
  }
})
```

## 五、调试和测试

### 5.1 Getters 调试

```javascript
// 添加调试信息的 getters
const debugStore = createStore({
  state() {
    return {
      items: []
    }
  },
  
  getters: {
    filteredItems(state) {
      const start = performance.now()
      
      const result = state.items.filter(item => {
        // 过滤逻辑
        return item.active === true
      })
      
      const end = performance.now()
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`filteredItems took ${end - start} milliseconds`)
        console.log(`Filtered ${state.items.length} items to ${result.length}`)
      }
      
      return result
    }
  }
})
```

### 5.2 Getters 单元测试

```javascript
// getters.test.js
import { describe, it, expect } from 'vitest'

// 测试 getters
describe('Store Getters', () => {
  const state = {
    todos: [
      { id: 1, text: 'Learn Vue', completed: false },
      { id: 2, text: 'Learn Vuex', completed: true },
      { id: 3, text: 'Build App', completed: false }
    ],
    user: { id: 1, name: 'John', role: 'admin' }
  }
  
  const getters = {
    completedTodos: (state) => state.todos.filter(todo => todo.completed),
    completedTodosCount: (state, getters) => getters.completedTodos.length,
    isAdmin: (state) => state.user.role === 'admin',
    getTodoById: (state) => (id) => state.todos.find(todo => todo.id === id)
  }
  
  it('should return completed todos', () => {
    const result = getters.completedTodos(state)
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Learn Vuex')
  })
  
  it('should return completed todos count', () => {
    const mockGetters = {
      completedTodos: [{ id: 2, text: 'Learn Vuex', completed: true }]
    }
    const result = getters.completedTodosCount(state, mockGetters)
    expect(result).toBe(1)
  })
  
  it('should check admin role', () => {
    const result = getters.isAdmin(state)
    expect(result).toBe(true)
  })
  
  it('should get todo by id', () => {
    const getTodo = getters.getTodoById(state)
    const result = getTodo(2)
    expect(result.text).toBe('Learn Vuex')
  })
})
```

## 参考资料

- [Vuex Getters 文档](https://vuex.vuejs.org/guide/getters.html)
- [mapGetters 辅助函数](https://vuex.vuejs.org/guide/getters.html#the-mapgetters-helper)
- [Vue 计算属性](https://vuejs.org/guide/essentials/computed.html)

**下一节** → [第 28 节：Mutations 变更](./28-vuex-mutations.md)
