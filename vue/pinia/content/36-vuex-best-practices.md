# 第 36 节：最佳实践

## 概述

本节总结 Vuex 开发中的最佳实践，包括项目结构、代码组织、命名规范、性能优化和团队协作等方面的建议。

## 一、项目结构组织

### 1.1 推荐的目录结构

```
src/
├── store/
│   ├── index.js                 # 根 store
│   ├── types.js                 # mutation 类型常量
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── index.js         # 模块入口
│   │   │   ├── state.js         # 状态定义
│   │   │   ├── getters.js       # getters
│   │   │   ├── mutations.js     # mutations
│   │   │   ├── actions.js       # actions
│   │   │   └── types.js         # 模块常量
│   │   ├── user/
│   │   └── products/
│   ├── plugins/
│   │   ├── persistence.js       # 持久化插件
│   │   ├── logger.js            # 日志插件
│   │   └── api.js               # API 插件
│   └── helpers/
│       ├── createModule.js      # 模块工厂
│       └── validators.js        # 验证工具
```

### 1.2 模块化组织

```javascript
// store/modules/auth/index.js - 模块入口
import state from './state'
import getters from './getters'
import mutations from './mutations'
import actions from './actions'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

// store/modules/auth/state.js - 状态定义
export default () => ({
  user: null,
  token: localStorage.getItem('auth-token'),
  refreshToken: localStorage.getItem('refresh-token'),
  permissions: [],
  isLoading: false,
  loginError: null
})

// store/modules/auth/types.js - 类型常量
export const SET_USER = 'SET_USER'
export const SET_TOKEN = 'SET_TOKEN'
export const SET_LOADING = 'SET_LOADING'
export const SET_ERROR = 'SET_ERROR'
export const CLEAR_AUTH = 'CLEAR_AUTH'

// store/modules/auth/mutations.js
import * as types from './types'

export default {
  [types.SET_USER](state, user) {
    state.user = user
  },
  
  [types.SET_TOKEN](state, token) {
    state.token = token
    if (token) {
      localStorage.setItem('auth-token', token)
    } else {
      localStorage.removeItem('auth-token')
    }
  },
  
  [types.SET_LOADING](state, loading) {
    state.isLoading = loading
  },
  
  [types.CLEAR_AUTH](state) {
    state.user = null
    state.token = null
    state.refreshToken = null
    state.permissions = []
    localStorage.removeItem('auth-token')
    localStorage.removeItem('refresh-token')
  }
}
```

## 二、命名规范

### 2.1 Mutation 命名

```javascript
// ✅ 推荐的命名风格
const mutations = {
  // 使用 SCREAMING_SNAKE_CASE
  SET_USER: 'SET_USER',
  UPDATE_USER_PROFILE: 'UPDATE_USER_PROFILE',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  TOGGLE_LOADING: 'TOGGLE_LOADING',
  
  // 动词 + 名词的模式
  FETCH_USERS: 'FETCH_USERS',
  CREATE_POST: 'CREATE_POST',
  DELETE_COMMENT: 'DELETE_COMMENT',
  
  // 状态变更的明确描述
  MARK_TODO_COMPLETED: 'MARK_TODO_COMPLETED',
  RESET_FORM_DATA: 'RESET_FORM_DATA'
}

// ❌ 避免的命名风格
const badMutations = {
  setUser: 'setUser',           // 应该全大写
  user: 'user',                 // 不明确的动作
  updateProfile: 'updateProfile' // 应该更具体
}
```

### 2.2 Action 命名

```javascript
// ✅ 推荐的 Action 命名
const actions = {
  // 使用 camelCase
  async fetchUser({ commit }, userId) {
    // 异步获取数据
  },
  
  async createPost({ commit }, postData) {
    // 创建资源
  },
  
  async updateUserProfile({ commit }, profileData) {
    // 更新资源
  },
  
  // 业务逻辑命名
  async authenticateUser({ commit, dispatch }, credentials) {
    // 复杂业务流程
  },
  
  async initializeApp({ dispatch }) {
    // 初始化流程
  }
}
```

### 2.3 模块和状态命名

```javascript
// ✅ 清晰的状态结构
const state = () => ({
  // 使用名词，描述数据本身
  user: null,
  users: [],
  currentUser: null,
  
  // UI 状态使用明确的前缀
  isLoading: false,
  isSubmitting: false,
  hasError: false,
  
  // 配置和设置
  settings: {
    theme: 'light',
    language: 'zh-CN'
  },
  
  // 分页数据结构
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0
  }
})
```

## 三、状态设计原则

### 3.1 数据归一化

```javascript
// ✅ 推荐：归一化的数据结构
const state = () => ({
  users: {
    byId: {},
    allIds: []
  },
  posts: {
    byId: {},
    allIds: []
  },
  comments: {
    byId: {},
    allIds: []
  }
})

const mutations = {
  SET_USERS(state, users) {
    state.users.byId = {}
    state.users.allIds = []
    
    users.forEach(user => {
      state.users.byId[user.id] = user
      state.users.allIds.push(user.id)
    })
  }
}

const getters = {
  allUsers: state => state.users.allIds.map(id => state.users.byId[id]),
  getUserById: state => id => state.users.byId[id]
}

// ❌ 避免：嵌套复杂的数据结构
const badState = () => ({
  data: {
    users: [
      {
        id: 1,
        posts: [
          {
            id: 1,
            comments: [
              { id: 1, text: 'comment' }
            ]
          }
        ]
      }
    ]
  }
})
```

### 3.2 单一数据源

```javascript
// ✅ 每种数据类型只有一个来源
const userModule = {
  state: () => ({
    currentUser: null,    // 当前登录用户
    profile: null         // 详细资料，引用 currentUser
  }),
  
  mutations: {
    SET_CURRENT_USER(state, user) {
      state.currentUser = user
      // 同时更新相关的资料引用
      if (state.profile?.id === user.id) {
        state.profile = { ...state.profile, ...user }
      }
    }
  }
}

// ❌ 避免：重复的数据来源
const badUserModule = {
  state: () => ({
    user: { id: 1, name: 'John' },
    userProfile: { id: 1, name: 'John', email: 'john@example.com' },
    currentUserName: 'John'  // 重复数据
  })
}
```

## 四、性能优化

### 4.1 Getter 优化

```javascript
// ✅ 高效的 getters
const getters = {
  // 使用缓存，避免重复计算
  expensiveComputation: (state) => {
    if (!state._cachedResult || state._cacheInvalid) {
      state._cachedResult = heavyCalculation(state.data)
      state._cacheInvalid = false
    }
    return state._cachedResult
  },
  
  // 参数化 getter 的优化版本
  getTodosByFilter: (state) => {
    const cache = new Map()
    return (filter) => {
      if (!cache.has(filter)) {
        cache.set(filter, state.todos.filter(todo => 
          filterFunction(todo, filter)
        ))
      }
      return cache.get(filter)
    }
  }
}
```

### 4.2 状态更新优化

```javascript
// ✅ 高效的状态更新
const mutations = {
  // 批量更新而不是逐个更新
  BATCH_UPDATE_ITEMS(state, updates) {
    const updateMap = new Map(updates.map(item => [item.id, item]))
    
    state.items = state.items.map(item => 
      updateMap.has(item.id) ? { ...item, ...updateMap.get(item.id) } : item
    )
  },
  
  // 使用对象展开而不是 Vue.set（Vue 3）
  UPDATE_NESTED_PROPERTY(state, { path, value }) {
    const keys = path.split('.')
    const lastKey = keys.pop()
    const target = keys.reduce((obj, key) => obj[key], state)
    
    // 创建新对象而不是修改原对象
    const newTarget = { ...target, [lastKey]: value }
    
    // 更新路径
    keys.reduce((obj, key, index) => {
      if (index === keys.length - 1) {
        obj[key] = newTarget
      }
      return obj[key]
    }, state)
  }
}
```

## 五、错误处理

### 5.1 统一错误处理

```javascript
// 错误处理模块
const errorModule = {
  namespaced: true,
  
  state: () => ({
    errors: [],
    globalError: null,
    networkError: false
  }),
  
  mutations: {
    ADD_ERROR(state, error) {
      state.errors.push({
        id: Date.now(),
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
        stack: error.stack
      })
    },
    
    REMOVE_ERROR(state, errorId) {
      state.errors = state.errors.filter(e => e.id !== errorId)
    },
    
    SET_GLOBAL_ERROR(state, error) {
      state.globalError = error
    },
    
    CLEAR_ERRORS(state) {
      state.errors = []
      state.globalError = null
    }
  },
  
  actions: {
    handleError({ commit }, error) {
      console.error('Application Error:', error)
      
      // 根据错误类型分类处理
      if (error.code === 'NETWORK_ERROR') {
        commit('SET_NETWORK_ERROR', true)
      } else if (error.code === 'AUTH_ERROR') {
        commit('auth/LOGOUT', null, { root: true })
      }
      
      commit('ADD_ERROR', error)
      
      // 发送到错误追踪服务
      if (window.ErrorTracking) {
        window.ErrorTracking.captureException(error)
      }
    }
  }
}

// 在其他模块中使用
const userModule = {
  actions: {
    async fetchUser({ commit, dispatch }, userId) {
      try {
        const user = await api.fetchUser(userId)
        commit('SET_USER', user)
      } catch (error) {
        await dispatch('error/handleError', error, { root: true })
        throw error
      }
    }
  }
}
```

## 六、测试策略

### 6.1 测试层次

```javascript
// 1. 单元测试 - 测试单个 mutation/getter/action
describe('User Mutations', () => {
  it('should set user correctly', () => {
    const state = { user: null }
    mutations.SET_USER(state, { id: 1, name: 'John' })
    expect(state.user).toEqual({ id: 1, name: 'John' })
  })
})

// 2. 集成测试 - 测试模块整体功能
describe('User Module Integration', () => {
  let store
  
  beforeEach(() => {
    store = new Vuex.Store({ modules: { user: userModule } })
  })
  
  it('should handle user login flow', async () => {
    await store.dispatch('user/login', credentials)
    expect(store.getters['user/isLoggedIn']).toBe(true)
  })
})

// 3. E2E 测试 - 测试完整用户流程
describe('User Flow E2E', () => {
  it('should complete registration and login process', () => {
    // Cypress 或 Playwright 测试
  })
})
```

## 七、团队协作

### 7.1 代码审查清单

```javascript
// Code Review Checklist for Vuex
const codeReviewChecklist = {
  structure: [
    '是否遵循了推荐的目录结构？',
    '模块是否正确使用了命名空间？',
    '是否有适当的代码分离（state/getters/mutations/actions）？'
  ],
  
  naming: [
    'Mutation 名称是否使用 SCREAMING_SNAKE_CASE？',
    'Action 名称是否使用 camelCase？',
    '名称是否具有描述性？'
  ],
  
  functionality: [
    '是否只在 mutations 中修改状态？',
    'Actions 是否正确处理异步操作？',
    '是否有适当的错误处理？',
    '状态结构是否归一化？'
  ],
  
  performance: [
    'Getters 是否避免了不必要的计算？',
    '是否存在性能瓶颈？',
    '状态更新是否高效？'
  ],
  
  testing: [
    '是否有足够的单元测试？',
    '测试用例是否覆盖了主要场景？',
    '是否测试了错误情况？'
  ]
}
```

### 7.2 团队规范

```javascript
// team-standards.js - 团队开发规范
export const VUEX_STANDARDS = {
  // 强制性规则
  required: {
    // 所有模块必须使用命名空间
    namespaced: true,
    
    // Mutation 类型必须使用常量
    mutationTypes: 'CONSTANTS_REQUIRED',
    
    // 状态必须是函数返回对象
    stateAsFunction: true
  },
  
  // 推荐规则
  recommended: {
    // 使用 TypeScript
    typescript: true,
    
    // 添加 JSDoc 注释
    documentation: true,
    
    // 使用 ESLint 规则
    linting: 'vuex/recommended'
  },
  
  // 禁止规则
  forbidden: {
    // 禁止直接修改状态
    directStateMutation: true,
    
    // 禁止在 mutations 中进行异步操作
    asyncMutations: true,
    
    // 禁止过深的状态嵌套
    deepNesting: { maxDepth: 3 }
  }
}
```

## 八、迁移和升级

### 8.1 从 Vuex 3 升级到 Vuex 4

```javascript
// Vuex 3 (Vue 2)
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    count: 0
  }
})

// Vuex 4 (Vue 3)
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      count: 0
    }
  }
})
```

### 8.2 迁移到 Pinia

```javascript
// 从 Vuex 迁移到 Pinia
// Vuex 模块
const userModule = {
  namespaced: true,
  state: () => ({ user: null }),
  mutations: { SET_USER(state, user) { state.user = user } },
  actions: { async fetchUser({ commit }, id) { /* ... */ } },
  getters: { isLoggedIn: (state) => !!state.user }
}

// 对应的 Pinia store
export const useUserStore = defineStore('user', {
  state: () => ({ user: null }),
  
  getters: {
    isLoggedIn: (state) => !!state.user
  },
  
  actions: {
    setUser(user) {
      this.user = user
    },
    
    async fetchUser(id) {
      // 直接修改状态，无需 mutations
      const user = await api.fetchUser(id)
      this.setUser(user)
    }
  }
})
```

## 九、工具和生态系统

### 9.1 推荐工具

```javascript
// 开发工具配置
const developmentTools = {
  // Vue DevTools
  devtools: {
    enabled: process.env.NODE_ENV !== 'production',
    settings: {
      logMutations: true,
      logActions: true,
      logStrictModeViolations: true
    }
  },
  
  // ESLint 配置
  eslint: {
    extends: ['plugin:vuex/recommended'],
    rules: {
      'vuex/no-state-mutations': 'error',
      'vuex/no-async-mutations': 'error'
    }
  },
  
  // TypeScript 支持
  typescript: {
    strict: true,
    types: ['vuex']
  }
}
```

## 十、总结

### 10.1 核心原则

1. **单向数据流**：始终通过 mutations 修改状态
2. **状态归一化**：避免数据重复和不一致
3. **模块化组织**：合理拆分模块，使用命名空间
4. **类型安全**：使用 TypeScript 和常量定义
5. **测试覆盖**：确保关键业务逻辑有测试保障

### 10.2 避免的反模式

```javascript
// ❌ 反模式示例
const antiPatterns = {
  // 1. 直接修改状态
  directMutation: () => {
    store.state.count++ // 错误！应该使用 mutation
  },
  
  // 2. 在 mutations 中进行异步操作
  asyncMutation: (state, payload) => {
    setTimeout(() => {
      state.data = payload // 错误！mutations 必须是同步的
    }, 1000)
  },
  
  // 3. 过度嵌套的状态
  deepNesting: {
    level1: {
      level2: {
        level3: {
          level4: {
            data: 'too deep!' // 应该扁平化
          }
        }
      }
    }
  }
}
```

## 参考资料

- [Vuex 官方最佳实践](https://vuex.vuejs.org/guide/structure.html)
- [Vue.js 风格指南](https://vuejs.org/style-guide/)
- [JavaScript 编码规范](https://github.com/airbnb/javascript)

**下一节** → [第 37 节：与 TypeScript](./37-vuex-typescript.md)
