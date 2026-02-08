# 第 30 节：Modules 模块

## 概述

当应用变得复杂时，Store 会变得相当臃肿。Vuex 允许我们将 Store 分割成模块（Module），每个模块拥有自己的 state、mutation、action、getter，甚至是嵌套子模块。

## 一、基本模块结构

### 1.1 定义模块

```javascript
// store/modules/user.js
const userModule = {
  state() {
    return {
      profile: null,
      preferences: {
        theme: 'light',
        language: 'zh-CN'
      },
      notifications: []
    }
  },
  
  mutations: {
    SET_PROFILE(state, profile) {
      state.profile = profile
    },
    
    UPDATE_PREFERENCES(state, preferences) {
      state.preferences = { ...state.preferences, ...preferences }
    },
    
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push({
        id: Date.now(),
        timestamp: new Date(),
        ...notification
      })
    },
    
    REMOVE_NOTIFICATION(state, id) {
      const index = state.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        state.notifications.splice(index, 1)
      }
    }
  },
  
  getters: {
    isLoggedIn: (state) => !!state.profile,
    
    userName: (state) => state.profile?.name || '游客',
    
    unreadNotifications: (state) => {
      return state.notifications.filter(n => !n.read)
    },
    
    notificationCount: (state, getters) => {
      return getters.unreadNotifications.length
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        })
        
        const user = await response.json()
        commit('SET_PROFILE', user)
        return user
      } catch (error) {
        throw error
      }
    },
    
    async fetchProfile({ commit }) {
      const response = await fetch('/api/user/profile')
      const profile = await response.json()
      commit('SET_PROFILE', profile)
      return profile
    },
    
    updatePreferences({ commit }, preferences) {
      commit('UPDATE_PREFERENCES', preferences)
      
      // 可选：同步到服务器
      fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })
    }
  }
}

export default userModule
```

### 1.2 注册模块

```javascript
// store/index.js
import { createStore } from 'vuex'
import userModule from './modules/user'
import todoModule from './modules/todo'
import productModule from './modules/product'

const store = createStore({
  // 根模块的状态
  state() {
    return {
      appVersion: '1.0.0',
      online: true
    }
  },
  
  // 根模块的 mutations
  mutations: {
    SET_ONLINE(state, status) {
      state.online = status
    }
  },
  
  // 注册子模块
  modules: {
    user: userModule,
    todo: todoModule,
    product: productModule
  }
})

export default store
```

## 二、命名空间

### 2.1 启用命名空间

```javascript
// store/modules/user.js
const userModule = {
  namespaced: true, // 启用命名空间
  
  state() {
    return {
      profile: null,
      posts: []
    }
  },
  
  mutations: {
    SET_PROFILE(state, profile) {
      state.profile = profile
    },
    
    ADD_POST(state, post) {
      state.posts.push(post)
    }
  },
  
  getters: {
    isLoggedIn: (state) => !!state.profile,
    
    postCount: (state) => state.posts.length
  },
  
  actions: {
    async fetchProfile({ commit }) {
      // 实现逻辑
    },
    
    async createPost({ commit }, post) {
      // 实现逻辑
    }
  }
}

export default userModule
```

### 2.2 访问命名空间模块

```vue
<template>
  <div class="namespaced-module-example">
    <div class="user-info">
      <p>用户: {{ userName }}</p>
      <p>登录状态: {{ isLoggedIn ? '已登录' : '未登录' }}</p>
      <p>文章数量: {{ postCount }}</p>
    </div>
    
    <button @click="login">登录</button>
    <button @click="createPost">创建文章</button>
  </div>
</template>

<script>
export default {
  name: 'NamespacedModuleExample',
  
  computed: {
    // 访问命名空间模块的状态
    userName() {
      return this.$store.state.user.profile?.name || '游客'
    },
    
    // 访问命名空间模块的 getters
    isLoggedIn() {
      return this.$store.getters['user/isLoggedIn']
    },
    
    postCount() {
      return this.$store.getters['user/postCount']
    }
  },
  
  methods: {
    login() {
      // 提交命名空间模块的 mutation
      this.$store.commit('user/SET_PROFILE', {
        name: 'John Doe',
        email: 'john@example.com'
      })
    },
    
    async createPost() {
      // 分发命名空间模块的 action
      try {
        await this.$store.dispatch('user/createPost', {
          title: '新文章',
          content: '文章内容...'
        })
      } catch (error) {
        console.error('创建文章失败:', error)
      }
    }
  }
}
</script>
```

## 三、模块辅助函数

### 3.1 使用 map 辅助函数

```vue
<template>
  <div class="module-helpers">
    <div class="user-section">
      <h3>用户信息</h3>
      <p>姓名: {{ userName }}</p>
      <p>状态: {{ isLoggedIn ? '在线' : '离线' }}</p>
      <p>通知: {{ notificationCount }}</p>
      
      <button @click="fetchProfile">获取资料</button>
      <button @click="logout">退出登录</button>
    </div>
    
    <div class="todo-section">
      <h3>待办事项</h3>
      <p>总数: {{ todoCount }}</p>
      <p>已完成: {{ completedCount }}</p>
      
      <button @click="fetchTodos">获取待办</button>
      <button @click="addNewTodo">添加待办</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'ModuleHelpers',
  
  computed: {
    // 映射根模块状态
    ...mapState(['appVersion', 'online']),
    
    // 映射命名空间模块状态
    ...mapState('user', {
      userProfile: 'profile',
      userNotifications: 'notifications'
    }),
    
    ...mapState('todo', ['todos']),
    
    // 映射命名空间模块 getters
    ...mapGetters('user', [
      'isLoggedIn',
      'userName',
      'notificationCount'
    ]),
    
    ...mapGetters('todo', {
      todoCount: 'totalCount',
      completedCount: 'completedCount'
    })
  },
  
  methods: {
    // 映射根模块 mutations
    ...mapMutations(['SET_ONLINE']),
    
    // 映射命名空间模块 mutations
    ...mapMutations('user', [
      'SET_PROFILE',
      'ADD_NOTIFICATION'
    ]),
    
    ...mapMutations('todo', {
      addTodo: 'ADD_TODO',
      removeTodo: 'REMOVE_TODO'
    }),
    
    // 映射命名空间模块 actions
    ...mapActions('user', [
      'fetchProfile',
      'updatePreferences'
    ]),
    
    ...mapActions('user', {
      userLogout: 'logout'
    }),
    
    ...mapActions('todo', [
      'fetchTodos',
      'createTodo'
    ]),
    
    // 自定义方法
    logout() {
      this.userLogout()
    },
    
    addNewTodo() {
      this.createTodo({
        text: '新的待办事项',
        priority: 'medium'
      })
    }
  }
}
</script>
```

### 3.2 createNamespacedHelpers

```javascript
// 为特定模块创建命名空间辅助函数
import { createNamespacedHelpers } from 'vuex'

// 创建用户模块的辅助函数
const {
  mapState: mapUserState,
  mapGetters: mapUserGetters,
  mapMutations: mapUserMutations,
  mapActions: mapUserActions
} = createNamespacedHelpers('user')

// 创建待办模块的辅助函数
const {
  mapState: mapTodoState,
  mapGetters: mapTodoGetters,
  mapActions: mapTodoActions
} = createNamespacedHelpers('todo')

export default {
  computed: {
    // 使用专门的辅助函数
    ...mapUserState(['profile', 'preferences']),
    ...mapUserGetters(['isLoggedIn', 'userName']),
    ...mapTodoState(['todos']),
    ...mapTodoGetters(['completedTodos', 'pendingTodos'])
  },
  
  methods: {
    ...mapUserMutations(['SET_PROFILE']),
    ...mapUserActions(['fetchProfile', 'updateProfile']),
    ...mapTodoActions(['fetchTodos', 'addTodo'])
  }
}
```

## 四、模块的局部状态

### 4.1 访问根状态和其他模块

```javascript
// store/modules/user.js
const userModule = {
  namespaced: true,
  
  state() {
    return {
      profile: null
    }
  },
  
  getters: {
    // 局部状态
    userName: (state) => state.profile?.name,
    
    // 访问根状态 (第三个参数)
    userWithAppInfo: (state, getters, rootState) => {
      return {
        ...state.profile,
        appVersion: rootState.appVersion,
        online: rootState.online
      }
    },
    
    // 访问其他模块 (第四个参数)
    userSummary: (state, getters, rootState, rootGetters) => {
      return {
        name: state.profile?.name,
        todoCount: rootGetters['todo/totalCount'],
        appVersion: rootState.appVersion
      }
    }
  },
  
  actions: {
    // 在 action 中访问根状态和其他模块
    async fetchUserData({ state, commit, rootState, dispatch }) {
      // 访问根状态
      console.log('App version:', rootState.appVersion)
      
      // 调用其他模块的 action
      await dispatch('todo/fetchTodos', null, { root: true })
      
      // 调用根模块的 action
      await dispatch('checkConnection', null, { root: true })
      
      // 提交根模块的 mutation
      commit('SET_ONLINE', true, { root: true })
      
      // 获取用户数据
      const response = await fetch('/api/user/profile')
      const profile = await response.json()
      commit('SET_PROFILE', profile)
    }
  }
}
```

### 4.2 模块内的嵌套结构

```javascript
// store/modules/user/index.js
import profile from './profile'
import preferences from './preferences'
import notifications from './notifications'

const userModule = {
  namespaced: true,
  
  modules: {
    profile,
    preferences,
    notifications
  },
  
  // 用户模块的根状态
  state() {
    return {
      isOnline: false,
      lastActivity: null
    }
  }
}

// store/modules/user/profile.js
export default {
  namespaced: true,
  
  state() {
    return {
      data: null,
      loading: false
    }
  },
  
  mutations: {
    SET_DATA(state, data) {
      state.data = data
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },
  
  actions: {
    async fetch({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await fetch('/api/user/profile')
        const data = await response.json()
        commit('SET_DATA', data)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}
```

```vue
<template>
  <div class="nested-modules">
    <p>用户在线: {{ $store.state.user.isOnline }}</p>
    <p>用户资料: {{ $store.state.user.profile.data?.name }}</p>
    <p>加载状态: {{ $store.state.user.profile.loading }}</p>
    
    <button @click="fetchProfile">获取资料</button>
  </div>
</template>

<script>
export default {
  methods: {
    fetchProfile() {
      // 访问嵌套模块的 action
      this.$store.dispatch('user/profile/fetch')
    }
  }
}
</script>
```

## 五、动态模块注册

### 5.1 注册和卸载模块

```javascript
// 动态模块管理
class ModuleManager {
  constructor(store) {
    this.store = store
    this.registeredModules = new Set()
  }
  
  // 注册模块
  registerModule(path, module) {
    if (this.isModuleRegistered(path)) {
      console.warn(`Module ${path} is already registered`)
      return
    }
    
    this.store.registerModule(path, module)
    this.registeredModules.add(path)
    
    console.log(`Module ${path} registered`)
  }
  
  // 卸载模块
  unregisterModule(path) {
    if (!this.isModuleRegistered(path)) {
      console.warn(`Module ${path} is not registered`)
      return
    }
    
    this.store.unregisterModule(path)
    this.registeredModules.delete(path)
    
    console.log(`Module ${path} unregistered`)
  }
  
  // 检查模块是否已注册
  isModuleRegistered(path) {
    return this.store.hasModule ? this.store.hasModule(path) : this.registeredModules.has(path)
  }
  
  // 条件性注册
  conditionalRegister(path, module, condition) {
    if (condition && !this.isModuleRegistered(path)) {
      this.registerModule(path, module)
    } else if (!condition && this.isModuleRegistered(path)) {
      this.unregisterModule(path)
    }
  }
}

// 使用示例
const moduleManager = new ModuleManager(store)

// 根据路由动态加载模块
router.beforeEach(async (to, from, next) => {
  // 管理员路由时加载管理模块
  if (to.path.startsWith('/admin')) {
    if (!moduleManager.isModuleRegistered('admin')) {
      const adminModule = await import('./modules/admin')
      moduleManager.registerModule('admin', adminModule.default)
    }
  }
  
  // 用户模块按需加载
  if (to.meta.requiresAuth && !moduleManager.isModuleRegistered('user')) {
    const userModule = await import('./modules/user')
    moduleManager.registerModule('user', userModule.default)
  }
  
  next()
})
```

### 5.2 模块热替换

```javascript
// 开发环境下的模块热替换
if (process.env.NODE_ENV === 'development' && module.hot) {
  // 接受更新的模块
  module.hot.accept(['./modules/user', './modules/todo'], () => {
    // 重新导入更新的模块
    const newUser = require('./modules/user').default
    const newTodo = require('./modules/todo').default
    
    // 热替换模块
    store.hotUpdate({
      modules: {
        user: newUser,
        todo: newTodo
      }
    })
  })
}
```

## 六、模块最佳实践

### 6.1 模块结构组织

```
store/
├── index.js          # 根 store
├── modules/
│   ├── auth/
│   │   ├── index.js
│   │   ├── actions.js
│   │   ├── mutations.js
│   │   ├── getters.js
│   │   └── state.js
│   ├── user/
│   │   ├── index.js
│   │   ├── profile.js
│   │   └── preferences.js
│   └── products/
│       ├── index.js
│       ├── list.js
│       └── cart.js
└── types.js          # mutation 类型常量
```

```javascript
// store/modules/auth/index.js
import state from './state'
import mutations from './mutations'
import actions from './actions'
import getters from './getters'

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

// store/modules/auth/state.js
export default () => ({
  user: null,
  token: null,
  refreshToken: null,
  permissions: [],
  loading: false,
  error: null
})

// store/modules/auth/mutations.js
export default {
  SET_USER(state, user) {
    state.user = user
  },
  
  SET_TOKEN(state, token) {
    state.token = token
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  CLEAR_AUTH(state) {
    state.user = null
    state.token = null
    state.refreshToken = null
    state.permissions = []
  }
}
```

### 6.2 模块间通信

```javascript
// 使用事件总线进行模块间通信
const eventBus = new Vue()

const userModule = {
  namespaced: true,
  
  actions: {
    login({ commit }, credentials) {
      // 登录逻辑
      const user = await api.login(credentials)
      commit('SET_USER', user)
      
      // 通知其他模块
      eventBus.$emit('user:login', user)
    },
    
    logout({ commit }) {
      commit('CLEAR_USER')
      
      // 通知其他模块清理数据
      eventBus.$emit('user:logout')
    }
  }
}

const cartModule = {
  namespaced: true,
  
  actions: {
    initialize({ dispatch }) {
      // 监听用户状态变化
      eventBus.$on('user:login', (user) => {
        dispatch('loadUserCart', user.id)
      })
      
      eventBus.$on('user:logout', () => {
        dispatch('clearCart')
      })
    }
  }
}
```

### 6.3 模块类型定义 (TypeScript)

```typescript
// types/store.ts
export interface RootState {
  version: string
  online: boolean
}

export interface UserState {
  profile: UserProfile | null
  preferences: UserPreferences
  loading: boolean
}

export interface UserProfile {
  id: number
  name: string
  email: string
  avatar?: string
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  notifications: boolean
}

// store/modules/user.ts
import { Module } from 'vuex'
import { RootState, UserState } from '@/types/store'

const userModule: Module<UserState, RootState> = {
  namespaced: true,
  
  state(): UserState {
    return {
      profile: null,
      preferences: {
        theme: 'light',
        language: 'zh-CN',
        notifications: true
      },
      loading: false
    }
  },
  
  mutations: {
    SET_PROFILE(state: UserState, profile: UserProfile) {
      state.profile = profile
    }
  },
  
  getters: {
    isLoggedIn: (state: UserState): boolean => !!state.profile,
    userName: (state: UserState): string => state.profile?.name || '游客'
  },
  
  actions: {
    async fetchProfile({ commit }): Promise<UserProfile> {
      const response = await fetch('/api/user/profile')
      const profile: UserProfile = await response.json()
      commit('SET_PROFILE', profile)
      return profile
    }
  }
}

export default userModule
```

## 参考资料

- [Vuex Modules 文档](https://vuex.vuejs.org/guide/modules.html)
- [命名空间](https://vuex.vuejs.org/guide/modules.html#namespacing)
- [动态模块注册](https://vuex.vuejs.org/guide/modules.html#dynamic-module-registration)

**下一节** → [第 31 节：插件系统](./31-vuex-plugins.md)
