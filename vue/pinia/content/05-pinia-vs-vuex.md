# 第 05 节：Pinia vs Vuex

## 概述

Pinia 和 Vuex 都是 Vue 官方推荐的状态管理库。Pinia 是 Vue 3 时代的新选择，具有更简洁的 API 和更好的 TypeScript 支持，而 Vuex 则是久经考验的成熟方案。本节将详细对比两者的差异，帮助选择合适的状态管理方案。

## 一、基本架构对比

### 1.1 Vuex 架构

```javascript
// Vuex Store 结构
import { createStore } from 'vuex'

const store = createStore({
  // 状态
  state() {
    return {
      count: 0,
      user: null,
      todos: []
    }
  },
  
  // 计算属性
  getters: {
    doneTodos(state) {
      return state.todos.filter(todo => todo.done)
    },
    
    doneTodosCount(state, getters) {
      return getters.doneTodos.length
    }
  },
  
  // 同步修改
  mutations: {
    INCREMENT(state) {
      state.count++
    },
    
    SET_USER(state, user) {
      state.user = user
    },
    
    ADD_TODO(state, todo) {
      state.todos.push(todo)
    }
  },
  
  // 异步操作
  actions: {
    async fetchUser({ commit }, id) {
      const user = await api.fetchUser(id)
      commit('SET_USER', user)
    },
    
    async createTodo({ commit }, todoText) {
      const todo = await api.createTodo(todoText)
      commit('ADD_TODO', todo)
    }
  }
})

// 使用方式
store.commit('INCREMENT')
store.dispatch('fetchUser', 123)
```

### 1.2 Pinia 架构

```javascript
// Pinia Store 结构
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Option Store API (类似 Vuex)
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    user: null,
    todos: []
  }),
  
  getters: {
    doneTodos: (state) => state.todos.filter(todo => todo.done),
    doneTodosCount() {
      return this.doneTodos.length
    }
  },
  
  actions: {
    increment() {
      this.count++
    },
    
    async fetchUser(id) {
      this.user = await api.fetchUser(id)
    },
    
    async createTodo(todoText) {
      const todo = await api.createTodo(todoText)
      this.todos.push(todo)
    }
  }
})

// Setup Store API (Composition API 风格)
export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const user = ref(null)
  const todos = ref([])
  
  // Getters
  const doneTodos = computed(() => todos.value.filter(todo => todo.done))
  const doneTodosCount = computed(() => doneTodos.value.length)
  
  // Actions
  function increment() {
    count.value++
  }
  
  async function fetchUser(id) {
    user.value = await api.fetchUser(id)
  }
  
  async function createTodo(todoText) {
    const todo = await api.createTodo(todoText)
    todos.value.push(todo)
  }
  
  return {
    count, user, todos,
    doneTodos, doneTodosCount,
    increment, fetchUser, createTodo
  }
})

// 使用方式 - 更简洁
const store = useCounterStore()
store.increment()
store.fetchUser(123)
```

## 二、API 设计对比

### 2.1 状态定义

```javascript
// Vuex - 必须通过 mutations 修改状态
const vuexStore = createStore({
  state: () => ({ count: 0 }),
  mutations: {
    INCREMENT(state) {
      state.count++ // 只能在 mutations 中修改
    }
  }
})

// 使用
store.commit('INCREMENT')

// Pinia - 可以直接修改状态
const piniaStore = defineStore('counter', () => {
  const count = ref(0)
  
  function increment() {
    count.value++ // 直接修改，更简单
  }
  
  return { count, increment }
})

// 使用
const store = usePiniaStore()
store.increment()
// 或者直接修改（开发模式下可追踪）
store.count++
```

### 2.2 模块化对比

```javascript
// Vuex - 需要显式的模块系统
const userModule = {
  namespaced: true,
  state: () => ({ profile: null }),
  mutations: {
    SET_PROFILE(state, profile) {
      state.profile = profile
    }
  },
  actions: {
    async fetchProfile({ commit }, id) {
      const profile = await api.fetchUser(id)
      commit('SET_PROFILE', profile)
    }
  }
}

const store = createStore({
  modules: {
    user: userModule
  }
})

// 使用时需要指定命名空间
store.dispatch('user/fetchProfile', 123)
store.commit('user/SET_PROFILE', profile)

// Pinia - 自然的模块分离
// stores/user.js
export const useUserStore = defineStore('user', () => {
  const profile = ref(null)
  
  async function fetchProfile(id) {
    profile.value = await api.fetchUser(id)
  }
  
  return { profile, fetchProfile }
})

// stores/todo.js  
export const useTodoStore = defineStore('todo', () => {
  const todos = ref([])
  
  function addTodo(todo) {
    todos.value.push(todo)
  }
  
  return { todos, addTodo }
})

// 使用 - 更直观
const userStore = useUserStore()
const todoStore = useTodoStore()

userStore.fetchProfile(123)
todoStore.addTodo({ text: 'Learn Pinia' })
```

## 三、TypeScript 支持对比

### 3.1 Vuex TypeScript

```typescript
// Vuex 需要大量类型定义
interface RootState {
  count: number
  user: User | null
}

interface UserState {
  profile: User | null
  preferences: UserPreferences
}

// 需要为 mutations 定义类型
interface Mutations {
  INCREMENT(state: RootState): void
  SET_USER(state: RootState, user: User): void
}

// 需要为 actions 定义类型
interface Actions {
  fetchUser(context: ActionContext<RootState, RootState>, id: number): Promise<void>
}

// Store 类型定义复杂
const store = createStore<RootState>({
  state: (): RootState => ({
    count: 0,
    user: null
  }),
  
  mutations: {
    INCREMENT(state) {
      state.count++ // 类型推断有限
    }
  } as MutationTree<RootState>
})

// 使用时类型支持不够完善
store.commit('INCREMENT') // 没有类型检查
store.dispatch('fetchUser', '123') // 参数类型错误无法检测
```

### 3.2 Pinia TypeScript

```typescript
// Pinia 完美的类型推断
export const useUserStore = defineStore('user', () => {
  const profile = ref<User | null>(null)
  const preferences = ref<UserPreferences>({})
  
  // 完美的类型推断
  const isAdmin = computed(() => profile.value?.role === 'admin')
  
  async function fetchUser(id: number): Promise<void> {
    profile.value = await api.fetchUser(id) // 自动类型检查
  }
  
  function updatePreferences(prefs: Partial<UserPreferences>) {
    preferences.value = { ...preferences.value, ...prefs }
  }
  
  return {
    profile,
    preferences,
    isAdmin,
    fetchUser,
    updatePreferences
  }
})

// 使用时有完整的类型支持
const userStore = useUserStore()

// 自动类型推断和检查
userStore.fetchUser(123) // ✓ 正确
userStore.fetchUser('123') // ✗ 类型错误，自动检测

// 完美的智能提示
userStore.profile?.name // 智能提示 User 的属性
```

## 四、开发体验对比

### 4.1 代码简洁性

```javascript
// Vuex - 较多样板代码
const ADD_TODO = 'ADD_TODO'
const REMOVE_TODO = 'REMOVE_TODO'

const store = createStore({
  state: () => ({ todos: [] }),
  
  mutations: {
    [ADD_TODO](state, todo) {
      state.todos.push(todo)
    },
    
    [REMOVE_TODO](state, id) {
      const index = state.todos.findIndex(t => t.id === id)
      if (index > -1) {
        state.todos.splice(index, 1)
      }
    }
  },
  
  actions: {
    addTodo({ commit }, todoText) {
      const todo = { id: Date.now(), text: todoText, done: false }
      commit(ADD_TODO, todo)
    },
    
    removeTodo({ commit }, id) {
      commit(REMOVE_TODO, id)
    }
  }
})

// 使用
store.dispatch('addTodo', 'Learn Vuex')
store.dispatch('removeTodo', 1)

// Pinia - 简洁直观
export const useTodoStore = defineStore('todo', () => {
  const todos = ref([])
  
  function addTodo(todoText) {
    todos.value.push({
      id: Date.now(),
      text: todoText,
      done: false
    })
  }
  
  function removeTodo(id) {
    const index = todos.value.findIndex(t => t.id === id)
    if (index > -1) {
      todos.value.splice(index, 1)
    }
  }
  
  return { todos, addTodo, removeTodo }
})

// 使用 - 更直接
const todoStore = useTodoStore()
todoStore.addTodo('Learn Pinia')
todoStore.removeTodo(1)
```

### 4.2 调试体验

```javascript
// Vuex DevTools
// 显示 mutation 历史
// COMMIT ADD_TODO { id: 1, text: 'Task 1' }
// COMMIT REMOVE_TODO 1

// Pinia DevTools - 更清晰
// 显示 action 历史，自动生成名称
// addTodo('Learn Pinia')
// removeTodo(1)
```

## 五、性能对比

### 5.1 包体积

```javascript
// 打包体积对比
const bundleSizeComparison = {
  vuex4: '~2.5KB (gzipped)',
  pinia: '~1.5KB (gzipped)'
}

// Pinia 更轻量，没有 mutations 层
```

### 5.2 运行时性能

```javascript
// Vuex - 多一层 mutations
store.dispatch('increment') // action → mutation → state

// Pinia - 直接修改
store.increment() // action → state

// 性能测试结果（仅供参考）
const performanceComparison = {
  vuex: '100ms (基准)',
  pinia: '85ms (提升 15%)'
}
```

## 六、生态系统对比

### 6.1 插件生态

```javascript
// Vuex 插件
import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

const store = createStore({
  // ...
  plugins: [createPersistedState()]
})

// Pinia 插件 - 更简洁
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Store 中使用
export const useUserStore = defineStore('user', 
  () => {
    const user = ref(null)
    return { user }
  },
  {
    persist: true // 自动持久化
  }
)
```

### 6.2 工具支持

```javascript
// DevTools 支持对比
const devToolsSupport = {
  vuex: {
    timeTravel: '✓',
    stateInspection: '✓',
    mutationTracking: '✓',
    hotReload: '✓'
  },
  
  pinia: {
    timeTravel: '✓',
    stateInspection: '✓',
    actionTracking: '✓ (更清晰)',
    hotReload: '✓',
    storeGraph: '✓ (可视化 store 关系)'
  }
}
```

## 七、迁移策略

### 7.1 从 Vuex 到 Pinia

```javascript
// Vuex Store
const userModule = {
  namespaced: true,
  state: () => ({
    profile: null,
    loading: false
  }),
  
  getters: {
    isLoggedIn: state => !!state.profile
  },
  
  mutations: {
    SET_PROFILE(state, profile) {
      state.profile = profile
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },
  
  actions: {
    async fetchProfile({ commit }, id) {
      commit('SET_LOADING', true)
      try {
        const profile = await api.fetchUser(id)
        commit('SET_PROFILE', profile)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}

// 迁移到 Pinia
export const useUserStore = defineStore('user', () => {
  // State
  const profile = ref(null)
  const loading = ref(false)
  
  // Getters
  const isLoggedIn = computed(() => !!profile.value)
  
  // Actions
  async function fetchProfile(id) {
    loading.value = true
    try {
      profile.value = await api.fetchUser(id)
    } finally {
      loading.value = false
    }
  }
  
  return {
    profile,
    loading,
    isLoggedIn,
    fetchProfile
  }
})
```

### 7.2 组件迁移

```vue
<!-- Vuex 版本 -->
<template>
  <div v-if="isLoggedIn">
    <h1>{{ profile.name }}</h1>
    <button @click="logout" :disabled="loading">
      {{ loading ? '退出中...' : '退出' }}
    </button>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('user', ['profile', 'loading']),
    ...mapGetters('user', ['isLoggedIn'])
  },
  
  methods: {
    ...mapActions('user', ['logout'])
  }
}
</script>
```

```vue
<!-- Pinia 版本 -->
<template>
  <div v-if="userStore.isLoggedIn">
    <h1>{{ userStore.profile.name }}</h1>
    <button @click="userStore.logout" :disabled="userStore.loading">
      {{ userStore.loading ? '退出中...' : '退出' }}
    </button>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>
```

## 八、选择指导

### 8.1 选择 Pinia 的场景

```javascript
const choosePinia = {
  // 新项目
  newProjects: true,
  
  // Vue 3 项目
  vue3Projects: true,
  
  // 重视 TypeScript 支持
  typeScriptProjects: true,
  
  // 偏好简洁 API
  preferSimpleAPI: true,
  
  // 团队熟悉 Composition API
  compositionAPITeam: true
}
```

### 8.2 选择 Vuex 的场景

```javascript
const chooseVuex = {
  // Vue 2 项目
  vue2Projects: true,
  
  // 大型既有项目
  legacyProjects: true,
  
  // 团队已熟悉 Vuex
  experiencedVuexTeam: true,
  
  // 需要时间旅行调试的复杂场景
  complexDebuggingNeeds: true,
  
  // 严格的状态修改控制
  strictStateMutation: true
}
```

### 8.3 决策矩阵

```javascript
const decisionMatrix = {
  criteria: {
    learningCurve: { pinia: 9, vuex: 6 },
    typeScriptSupport: { pinia: 10, vuex: 6 },
    bundleSize: { pinia: 9, vuex: 7 },
    devExperience: { pinia: 9, vuex: 7 },
    ecosystem: { pinia: 8, vuex: 9 },
    stability: { pinia: 8, vuex: 10 }
  },
  
  recommendation: {
    newProject: 'Pinia',
    vue3Project: 'Pinia', 
    vue2Project: 'Vuex',
    enterprise: '根据团队经验决定',
    learning: 'Pinia'
  }
}
```

## 九、最佳实践对比

### 9.1 状态结构设计

```javascript
// Vuex - 扁平化模块
const store = createStore({
  modules: {
    user: userModule,
    products: productsModule,
    cart: cartModule
  }
})

// Pinia - 自然的 store 分离
// stores/user.js
export const useUserStore = defineStore('user', () => {
  // 用户相关状态和逻辑
})

// stores/products.js  
export const useProductsStore = defineStore('products', () => {
  // 商品相关状态和逻辑
})

// stores/cart.js
export const useCartStore = defineStore('cart', () => {
  // 购物车相关状态和逻辑
  
  // 可以使用其他 store
  const userStore = useUserStore()
  const productsStore = useProductsStore()
  
  // 组合逻辑
})
```

### 9.2 错误处理

```javascript
// Vuex 错误处理
const actions = {
  async fetchData({ commit }) {
    try {
      commit('SET_LOADING', true)
      const data = await api.fetchData()
      commit('SET_DATA', data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

// Pinia 错误处理 - 更直观
export const useDataStore = defineStore('data', () => {
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  async function fetchData() {
    loading.value = true
    error.value = null
    
    try {
      data.value = await api.fetchData()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  return { data, loading, error, fetchData }
})
```

## 十、总结

### 10.1 核心差异

| 特性 | Pinia | Vuex |
|------|-------|------|
| **API 风格** | 简洁直观 | 传统 Flux 模式 |
| **TypeScript** | 原生支持 | 需要额外配置 |
| **包体积** | 更小 (~1.5KB) | 较大 (~2.5KB) |
| **学习曲线** | 更平缓 | 较陡峭 |
| **生态成熟度** | 较新但快速发展 | 成熟稳定 |

### 10.2 推荐建议

- **新项目 + Vue 3**：强烈推荐 Pinia
- **Vue 2 项目**：继续使用 Vuex 4
- **大型既有项目**：评估迁移成本，可考虑渐进式迁移
- **学习目的**：优先学习 Pinia，了解 Vuex 概念

## 参考资料

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vuex 官方文档](https://vuex.vuejs.org/)
- [从 Vuex 迁移到 Pinia](https://pinia.vuejs.org/cookbook/migration-vuex.html)
- [Vue 状态管理对比](https://vuejs.org/guide/scaling-up/state-management.html)

**下一节** → [第 06 节：其他状态管理库](./06-other-solutions.md)
