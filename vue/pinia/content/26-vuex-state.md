# 第 26 节：State 状态

## 概述

State 是 Vuex 中存储应用状态的地方，采用单一状态树的设计。本节将详细介绍如何定义、访问和管理 Vuex 中的状态。

## 一、状态定义

### 1.1 基本状态定义

```javascript
// store/index.js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      // 基础数据类型
      count: 0,
      message: 'Hello Vuex',
      isLoading: false,
      
      // 对象类型
      user: {
        id: null,
        name: '',
        email: '',
        avatar: '',
        preferences: {
          theme: 'light',
          language: 'zh-CN'
        }
      },
      
      // 数组类型
      todos: [],
      tags: ['vue', 'vuex', 'javascript'],
      
      // 复杂状态
      products: [],
      cart: {
        items: [],
        total: 0
      },
      
      // UI 状态
      ui: {
        sidebarOpen: false,
        currentPage: 'home',
        notifications: []
      },
      
      // 错误和加载状态
      errors: {},
      loadingStates: {}
    }
  }
})

export default store
```

### 1.2 状态初始化模式

```javascript
// 工厂函数模式
const createInitialState = () => ({
  user: null,
  posts: [],
  currentPost: null,
  filters: {
    category: '',
    status: 'all',
    dateRange: {
      start: null,
      end: null
    }
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0
  }
})

const store = createStore({
  state: createInitialState,
  
  mutations: {
    RESET_STATE(state) {
      // 重置到初始状态
      Object.assign(state, createInitialState())
    }
  }
})

// 从配置文件初始化
const defaultConfig = {
  api: {
    baseUrl: process.env.VUE_APP_API_BASE,
    timeout: 5000
  },
  ui: {
    theme: 'auto',
    language: navigator.language.substr(0, 2)
  },
  features: {
    enableNotifications: true,
    enableAnalytics: false
  }
}

const store = createStore({
  state() {
    return {
      config: { ...defaultConfig },
      // 从本地存储恢复
      settings: JSON.parse(localStorage.getItem('userSettings') || '{}'),
      // 其他状态...
    }
  }
})
```

## 二、状态访问

### 2.1 在组件中访问状态

```vue
<template>
  <div class="user-dashboard">
    <!-- 直接访问状态 -->
    <h1>欢迎, {{ $store.state.user.name }}</h1>
    <p>消息数量: {{ $store.state.notifications.length }}</p>
    
    <!-- 通过计算属性访问 -->
    <div class="user-info">
      <img :src="userAvatar" :alt="userName" />
      <div>
        <h3>{{ userName }}</h3>
        <p>{{ userEmail }}</p>
        <span :class="userStatusClass">{{ userStatus }}</span>
      </div>
    </div>
    
    <!-- 复杂状态访问 -->
    <div class="cart-summary">
      <h3>购物车</h3>
      <p>商品数量: {{ cartItemCount }}</p>
      <p>总金额: ¥{{ cartTotal }}</p>
    </div>
    
    <!-- 条件渲染 -->
    <div v-if="isLoading" class="loading">
      加载中...
    </div>
    
    <div v-if="hasErrors" class="errors">
      <p v-for="error in errorMessages" :key="error.code">
        {{ error.message }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserDashboard',
  
  computed: {
    // 基础状态访问
    userName() {
      return this.$store.state.user?.name || '游客'
    },
    
    userEmail() {
      return this.$store.state.user?.email || ''
    },
    
    userAvatar() {
      return this.$store.state.user?.avatar || '/default-avatar.png'
    },
    
    // 派生状态
    userStatus() {
      const user = this.$store.state.user
      if (!user) return '未登录'
      return user.isActive ? '在线' : '离线'
    },
    
    userStatusClass() {
      const user = this.$store.state.user
      return {
        'status': true,
        'status--online': user?.isActive,
        'status--offline': user && !user.isActive
      }
    },
    
    // 数组状态处理
    cartItemCount() {
      return this.$store.state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    
    cartTotal() {
      return this.$store.state.cart.items
        .reduce((sum, item) => sum + (item.price * item.quantity), 0)
        .toFixed(2)
    },
    
    // 加载状态
    isLoading() {
      return Object.values(this.$store.state.loadingStates).some(loading => loading)
    },
    
    // 错误状态
    hasErrors() {
      return Object.keys(this.$store.state.errors).length > 0
    },
    
    errorMessages() {
      return Object.values(this.$store.state.errors).filter(Boolean)
    }
  }
}
</script>

<style scoped>
.user-dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.user-info img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
}

.status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status--online {
  background: #e6f7ff;
  color: #1890ff;
}

.status--offline {
  background: #fff2e8;
  color: #fa8c16;
}

.cart-summary {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
}

.loading, .errors {
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
}

.loading {
  background: #e6f7ff;
  color: #1890ff;
}

.errors {
  background: #fff2f0;
  color: #ff4d4f;
}
</style>
```

### 2.2 使用 mapState 辅助函数

```vue
<template>
  <div class="map-state-example">
    <!-- 使用映射的计算属性 -->
    <h2>{{ message }}</h2>
    <p>计数: {{ count }}</p>
    <p>用户: {{ user?.name }}</p>
    
    <!-- 别名访问 -->
    <p>当前页面: {{ currentPage }}</p>
    <p>侧边栏状态: {{ sidebarStatus }}</p>
    
    <!-- 本地计算属性混合 -->
    <p>双倍计数: {{ doubleCount }}</p>
    <p>用户全名: {{ fullName }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'MapStateExample',
  
  computed: {
    // 方式 1: 数组语法
    ...mapState(['count', 'message', 'user']),
    
    // 方式 2: 对象语法 (使用别名)
    ...mapState({
      currentPage: 'currentPage',
      sidebarStatus: state => state.ui.sidebarOpen ? '打开' : '关闭'
    }),
    
    // 方式 3: 函数语法
    ...mapState({
      // 箭头函数
      todos: state => state.todos,
      
      // 传入字符串 'count' 等同于 state => state.count
      countAlias: 'count',
      
      // 使用常规函数以便使用 this
      countPlusLocalState(state) {
        return state.count + this.localCount
      }
    }),
    
    // 本地计算属性
    doubleCount() {
      return this.count * 2
    },
    
    fullName() {
      return this.user ? `${this.user.firstName} ${this.user.lastName}` : ''
    }
  },
  
  data() {
    return {
      localCount: 10
    }
  }
}
</script>
```

### 2.3 Composition API 中访问状态

```vue
<template>
  <div class="composition-state">
    <h2>{{ message }}</h2>
    <p>计数: {{ count }}</p>
    <p>用户: {{ user?.name }}</p>
    <p>待办数量: {{ todoCount }}</p>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'CompositionState',
  
  setup() {
    const store = useStore()
    
    // 基本状态访问
    const count = computed(() => store.state.count)
    const message = computed(() => store.state.message)
    const user = computed(() => store.state.user)
    
    // 复杂状态计算
    const todoCount = computed(() => store.state.todos.length)
    
    // 派生状态
    const isLoggedIn = computed(() => !!store.state.user)
    
    const cartSummary = computed(() => {
      const items = store.state.cart.items
      return {
        itemCount: items.length,
        totalPrice: items.reduce((sum, item) => sum + item.price, 0)
      }
    })
    
    return {
      count,
      message,
      user,
      todoCount,
      isLoggedIn,
      cartSummary
    }
  }
}
</script>
```

## 三、状态结构设计

### 3.1 扁平化 vs 嵌套结构

```javascript
// ❌ 过度嵌套的状态结构
const badStateStructure = {
  state() {
    return {
      app: {
        user: {
          profile: {
            personal: {
              basic: {
                name: '',
                email: ''
              },
              contact: {
                phone: '',
                address: {
                  street: '',
                  city: '',
                  country: ''
                }
              }
            }
          }
        }
      }
    }
  }
}

// ✅ 推荐的扁平化结构
const goodStateStructure = {
  state() {
    return {
      // 用户基本信息
      user: {
        id: null,
        name: '',
        email: '',
        phone: '',
        avatar: ''
      },
      
      // 用户地址（如果复杂可单独管理）
      userAddress: {
        street: '',
        city: '',
        country: '',
        postalCode: ''
      },
      
      // 用户偏好设置
      userPreferences: {
        theme: 'light',
        language: 'zh-CN',
        notifications: {
          email: true,
          push: false
        }
      }
    }
  }
}
```

### 3.2 规范化状态结构

```javascript
// 规范化的状态设计
const normalizedState = {
  state() {
    return {
      // 实体存储（按 ID 索引）
      entities: {
        users: {},      // { id: userObject }
        posts: {},      // { id: postObject }
        comments: {},   // { id: commentObject }
        categories: {}  // { id: categoryObject }
      },
      
      // ID 列表（维护顺序和关系）
      ids: {
        users: [],      // [userId1, userId2, ...]
        posts: [],      // [postId1, postId2, ...]
        userPosts: {},  // { userId: [postId1, postId2] }
        postComments: {} // { postId: [commentId1, commentId2] }
      },
      
      // UI 状态
      ui: {
        selectedUserId: null,
        selectedPostId: null,
        loading: {
          users: false,
          posts: false,
          comments: false
        },
        errors: {
          users: null,
          posts: null,
          comments: null
        }
      },
      
      // 分页信息
      pagination: {
        users: { page: 1, pageSize: 20, total: 0 },
        posts: { page: 1, pageSize: 10, total: 0 }
      }
    }
  },
  
  mutations: {
    // 设置用户实体
    SET_USER(state, user) {
      state.entities.users[user.id] = user
      if (!state.ids.users.includes(user.id)) {
        state.ids.users.push(user.id)
      }
    },
    
    // 设置用户列表
    SET_USERS(state, users) {
      users.forEach(user => {
        state.entities.users[user.id] = user
      })
      state.ids.users = users.map(user => user.id)
    },
    
    // 移除用户
    REMOVE_USER(state, userId) {
      delete state.entities.users[userId]
      const index = state.ids.users.indexOf(userId)
      if (index > -1) {
        state.ids.users.splice(index, 1)
      }
    },
    
    // 设置用户文章关系
    SET_USER_POSTS(state, { userId, postIds }) {
      state.ids.userPosts[userId] = postIds
    }
  },
  
  getters: {
    // 获取所有用户（保持顺序）
    allUsers: (state) => {
      return state.ids.users.map(id => state.entities.users[id])
    },
    
    // 按ID获取用户
    getUserById: (state) => (id) => {
      return state.entities.users[id]
    },
    
    // 获取用户的文章
    getUserPosts: (state) => (userId) => {
      const postIds = state.ids.userPosts[userId] || []
      return postIds.map(id => state.entities.posts[id]).filter(Boolean)
    },
    
    // 当前选中的用户
    selectedUser: (state, getters) => {
      return state.ui.selectedUserId ? getters.getUserById(state.ui.selectedUserId) : null
    }
  }
}
```

### 3.3 状态分类管理

```javascript
// 按功能分类的状态结构
const categorizedState = {
  state() {
    return {
      // 1. 领域数据 (Domain Data)
      domain: {
        users: [],
        products: [],
        orders: [],
        categories: []
      },
      
      // 2. 应用状态 (App State)
      app: {
        currentUser: null,
        selectedProduct: null,
        shoppingCart: {
          items: [],
          total: 0
        },
        filters: {
          category: '',
          priceRange: [0, 1000],
          searchQuery: ''
        }
      },
      
      // 3. UI 状态 (UI State)
      ui: {
        layout: {
          sidebarOpen: false,
          theme: 'light'
        },
        modals: {
          loginModal: false,
          confirmModal: false
        },
        notifications: [],
        loading: {
          global: false,
          users: false,
          products: false
        }
      },
      
      // 4. 缓存状态 (Cache State)
      cache: {
        apiResponses: {},
        computedValues: {},
        timestamps: {}
      },
      
      // 5. 临时状态 (Transient State)
      temp: {
        formData: {},
        unsavedChanges: {},
        dragAndDrop: null
      }
    }
  },
  
  mutations: {
    // 领域数据更新
    SET_USERS(state, users) {
      state.domain.users = users
    },
    
    // 应用状态更新
    SET_CURRENT_USER(state, user) {
      state.app.currentUser = user
    },
    
    // UI 状态更新
    TOGGLE_SIDEBAR(state) {
      state.ui.layout.sidebarOpen = !state.ui.layout.sidebarOpen
    },
    
    SET_LOADING(state, { key, value }) {
      state.ui.loading[key] = value
    },
    
    // 缓存管理
    SET_CACHE(state, { key, value, timestamp = Date.now() }) {
      state.cache.apiResponses[key] = value
      state.cache.timestamps[key] = timestamp
    },
    
    CLEAR_EXPIRED_CACHE(state, maxAge = 5 * 60 * 1000) {
      const now = Date.now()
      Object.keys(state.cache.timestamps).forEach(key => {
        if (now - state.cache.timestamps[key] > maxAge) {
          delete state.cache.apiResponses[key]
          delete state.cache.timestamps[key]
        }
      })
    }
  }
}
```

## 四、状态持久化

### 4.1 本地存储同步

```javascript
// 状态持久化插件
const persistencePlugin = (store) => {
  // 需要持久化的状态键
  const persistKeys = ['user', 'userPreferences', 'cart']
  
  // 从 localStorage 恢复状态
  const savedState = {}
  persistKeys.forEach(key => {
    const saved = localStorage.getItem(`vuex_${key}`)
    if (saved) {
      try {
        savedState[key] = JSON.parse(saved)
      } catch (error) {
        console.error(`Failed to parse saved state for ${key}:`, error)
      }
    }
  })
  
  // 恢复状态
  if (Object.keys(savedState).length > 0) {
    store.commit('RESTORE_STATE', savedState)
  }
  
  // 监听状态变化并保存
  store.subscribe((mutation, state) => {
    // 只保存指定的状态
    persistKeys.forEach(key => {
      if (state[key] !== undefined) {
        localStorage.setItem(`vuex_${key}`, JSON.stringify(state[key]))
      }
    })
  })
}

const store = createStore({
  state() {
    return {
      user: null,
      userPreferences: {},
      cart: { items: [] },
      // 其他状态...
    }
  },
  
  mutations: {
    RESTORE_STATE(state, savedState) {
      Object.keys(savedState).forEach(key => {
        if (state.hasOwnProperty(key)) {
          state[key] = savedState[key]
        }
      })
    }
  },
  
  plugins: [persistencePlugin]
})
```

### 4.2 条件持久化

```javascript
// 智能持久化策略
const smartPersistencePlugin = (store) => {
  const config = {
    // 持久化配置
    user: {
      storage: localStorage,
      key: 'vuex_user',
      expires: 7 * 24 * 60 * 60 * 1000 // 7天
    },
    
    cart: {
      storage: sessionStorage,
      key: 'vuex_cart',
      expires: null // 会话级别
    },
    
    preferences: {
      storage: localStorage,
      key: 'vuex_preferences',
      expires: null, // 永久存储
      transform: {
        serialize: (data) => btoa(JSON.stringify(data)), // base64编码
        deserialize: (data) => JSON.parse(atob(data))
      }
    }
  }
  
  // 恢复状态
  const restoreState = () => {
    const restored = {}
    
    Object.keys(config).forEach(key => {
      const cfg = config[key]
      const stored = cfg.storage.getItem(cfg.key)
      
      if (stored) {
        try {
          let data = cfg.transform ? cfg.transform.deserialize(stored) : JSON.parse(stored)
          
          // 检查过期时间
          if (cfg.expires && data._timestamp) {
            const now = Date.now()
            if (now - data._timestamp > cfg.expires) {
              cfg.storage.removeItem(cfg.key)
              return
            }
            delete data._timestamp
          }
          
          restored[key] = data
        } catch (error) {
          console.error(`Failed to restore ${key}:`, error)
          cfg.storage.removeItem(cfg.key)
        }
      }
    })
    
    if (Object.keys(restored).length > 0) {
      store.commit('RESTORE_PERSISTED_STATE', restored)
    }
  }
  
  // 保存状态
  const saveState = (mutation, state) => {
    Object.keys(config).forEach(key => {
      if (state[key] !== undefined) {
        const cfg = config[key]
        let data = state[key]
        
        // 添加时间戳
        if (cfg.expires) {
          data = { ...data, _timestamp: Date.now() }
        }
        
        try {
          const serialized = cfg.transform 
            ? cfg.transform.serialize(data)
            : JSON.stringify(data)
          
          cfg.storage.setItem(cfg.key, serialized)
        } catch (error) {
          console.error(`Failed to save ${key}:`, error)
        }
      }
    })
  }
  
  // 初始化
  restoreState()
  
  // 监听变化
  store.subscribe(saveState)
}
```

## 五、状态验证和调试

### 5.1 状态验证

```javascript
// 状态验证中间件
const stateValidationPlugin = (store) => {
  // 状态验证规则
  const validators = {
    user: (user) => {
      if (user && typeof user === 'object') {
        return typeof user.id === 'number' && typeof user.name === 'string'
      }
      return user === null
    },
    
    cart: (cart) => {
      return cart && 
             Array.isArray(cart.items) &&
             typeof cart.total === 'number' &&
             cart.total >= 0
    },
    
    ui: (ui) => {
      return ui &&
             typeof ui.sidebarOpen === 'boolean' &&
             ['light', 'dark'].includes(ui.theme)
    }
  }
  
  // 验证状态
  const validateState = (state) => {
    const errors = []
    
    Object.keys(validators).forEach(key => {
      if (state.hasOwnProperty(key)) {
        try {
          if (!validators[key](state[key])) {
            errors.push(`Invalid state for ${key}: ${JSON.stringify(state[key])}`)
          }
        } catch (error) {
          errors.push(`Validation error for ${key}: ${error.message}`)
        }
      }
    })
    
    if (errors.length > 0) {
      console.error('State validation failed:', errors)
      
      if (process.env.NODE_ENV === 'development') {
        throw new Error('State validation failed: ' + errors.join(', '))
      }
    }
  }
  
  // 监听状态变化
  store.subscribe((mutation, state) => {
    validateState(state)
  })
  
  // 初始验证
  validateState(store.state)
}
```

### 5.2 状态调试工具

```javascript
// 状态调试插件
const debugPlugin = (store) => {
  if (process.env.NODE_ENV !== 'development') return
  
  // 状态变化日志
  store.subscribe((mutation, state) => {
    console.group(`💫 ${mutation.type}`)
    console.log('Payload:', mutation.payload)
    console.log('Previous State:', JSON.parse(JSON.stringify(state)))
    console.groupEnd()
  })
  
  // 添加调试方法到 store
  store.debug = {
    // 获取状态快照
    snapshot() {
      return JSON.parse(JSON.stringify(store.state))
    },
    
    // 比较状态差异
    diff(snapshot1, snapshot2) {
      const diff = {}
      
      const findDifferences = (obj1, obj2, path = '') => {
        Object.keys(obj1).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key
          
          if (obj1[key] !== obj2[key]) {
            if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
              findDifferences(obj1[key], obj2[key], currentPath)
            } else {
              diff[currentPath] = {
                from: obj1[key],
                to: obj2[key]
              }
            }
          }
        })
      }
      
      findDifferences(snapshot1, snapshot2)
      return diff
    },
    
    // 状态大小分析
    analyze() {
      const sizeOf = (obj) => JSON.stringify(obj).length
      
      const analysis = {
        totalSize: sizeOf(store.state),
        breakdown: {}
      }
      
      Object.keys(store.state).forEach(key => {
        analysis.breakdown[key] = sizeOf(store.state[key])
      })
      
      return analysis
    }
  }
}
```

## 参考资料

- [Vuex State 文档](https://vuex.vuejs.org/guide/state.html)
- [单一状态树概念](https://vuex.vuejs.org/guide/#single-state-tree)
- [状态管理模式](https://vuex.vuejs.org/guide/#state-management-pattern)

**下一节** → [第 27 节：Getters 计算属性](./27-vuex-getters.md)
