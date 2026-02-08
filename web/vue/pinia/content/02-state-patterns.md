# 第 02 节：状态管理模式

## 概述

状态管理模式是解决复杂应用状态问题的经典设计思路。从 Flux 到 Redux，再到 Vuex 和 Pinia，每种模式都有其设计理念和适用场景。理解这些模式有助于选择合适的状态管理方案。

## 一、Flux 模式

### 1.1 Flux 架构

```javascript
/*
Flux 单向数据流架构：

┌─────────────────────────────────────────────────────────────┐
│                        Flux 架构                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐   Action   ┌──────────┐   Action   ┌─────────┐│
│   │  View   │───────────▶│Dispatcher│───────────▶│  Store  ││
│   │ (组件)  │            │ (调度器) │            │ (存储)  ││
│   └─────────┘            └──────────┘            └─────────┘│
│        ▲                                              │     │
│        │                                              │     │
│        └──────────────── Change Event ◀──────────────┘     │
│                         (变更事件)                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
*/

// Flux 实现示例
class Dispatcher {
  constructor() {
    this.callbacks = []
  }
  
  register(callback) {
    this.callbacks.push(callback)
  }
  
  dispatch(action) {
    this.callbacks.forEach(callback => callback(action))
  }
}

// 创建调度器
const dispatcher = new Dispatcher()

// Store
class TodoStore extends EventEmitter {
  constructor() {
    super()
    this.todos = []
    
    // 注册到调度器
    dispatcher.register(this.handleAction.bind(this))
  }
  
  handleAction(action) {
    switch (action.type) {
      case 'ADD_TODO':
        this.todos.push(action.todo)
        this.emit('change')
        break
      case 'REMOVE_TODO':
        this.todos = this.todos.filter(todo => todo.id !== action.id)
        this.emit('change')
        break
    }
  }
  
  getTodos() {
    return this.todos
  }
}

const todoStore = new TodoStore()
```

### 1.2 Action 创建器

```javascript
// Action 创建器
const TodoActions = {
  addTodo(text) {
    dispatcher.dispatch({
      type: 'ADD_TODO',
      todo: {
        id: Date.now(),
        text,
        completed: false
      }
    })
  },
  
  removeTodo(id) {
    dispatcher.dispatch({
      type: 'REMOVE_TODO',
      id
    })
  },
  
  async loadTodos() {
    dispatcher.dispatch({ type: 'LOAD_TODOS_START' })
    
    try {
      const todos = await api.fetchTodos()
      dispatcher.dispatch({
        type: 'LOAD_TODOS_SUCCESS',
        todos
      })
    } catch (error) {
      dispatcher.dispatch({
        type: 'LOAD_TODOS_ERROR',
        error
      })
    }
  }
}
```

## 二、Redux 模式

### 2.1 Redux 三大原则

```javascript
// 1. 单一数据源 (Single Source of Truth)
const store = createStore(rootReducer)
console.log(store.getState()) // 整个应用状态

// 2. 状态只读 (State is Read-Only)
// 错误做法
// state.todos.push(newTodo)

// 正确做法
store.dispatch({
  type: 'ADD_TODO',
  payload: newTodo
})

// 3. 纯函数修改 (Changes are Made with Pure Functions)
const todosReducer = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, action.payload] // 返回新状态
    case 'REMOVE_TODO':
      return state.filter(todo => todo.id !== action.payload.id)
    default:
      return state // 不识别的 action 返回原状态
  }
}
```

### 2.2 Redux 核心概念

```javascript
// Store: 状态容器
import { createStore, combineReducers } from 'redux'

const store = createStore(
  combineReducers({
    todos: todosReducer,
    user: userReducer
  })
)

// Reducer: 纯函数，描述状态如何变化
const counterReducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 }
    case 'DECREMENT':
      return { ...state, count: state.count - 1 }
    case 'SET_COUNT':
      return { ...state, count: action.payload }
    default:
      return state
  }
}

// Action: 描述发生了什么
const actions = {
  increment: () => ({ type: 'INCREMENT' }),
  decrement: () => ({ type: 'DECREMENT' }),
  setCount: (count) => ({ 
    type: 'SET_COUNT', 
    payload: count 
  })
}

// Action Creator: 创建异步 action
const fetchUser = (id) => {
  return async (dispatch, getState) => {
    dispatch({ type: 'FETCH_USER_START' })
    
    try {
      const user = await api.fetchUser(id)
      dispatch({ 
        type: 'FETCH_USER_SUCCESS', 
        payload: user 
      })
    } catch (error) {
      dispatch({ 
        type: 'FETCH_USER_ERROR', 
        payload: error.message 
      })
    }
  }
}
```

### 2.3 中间件系统

```javascript
// Redux 中间件
const loggerMiddleware = (store) => (next) => (action) => {
  console.log('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  return result
}

const thunkMiddleware = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState)
  }
  return next(action)
}

// 应用中间件
import { applyMiddleware, createStore } from 'redux'

const store = createStore(
  rootReducer,
  applyMiddleware(thunkMiddleware, loggerMiddleware)
)
```

## 三、Vuex 模式

### 3.1 Vuex 架构

```javascript
/*
Vuex 状态管理模式：

┌─────────────────────────────────────────────────────────────┐
│                        Vuex 架构                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐   dispatch   ┌─────────────┐             │
│   │ Vue组件     │─────────────▶│   Actions   │             │
│   │             │              │  (异步操作)  │             │
│   └─────────────┘              └─────────────┘             │
│          ▲                            │                    │
│          │                            │ commit              │
│          │                            ▼                    │
│          │                     ┌─────────────┐             │
│          │ render              │  Mutations  │             │
│          │                     │ (同步变更)   │             │
│          │                     └─────────────┘             │
│          │                            │                    │
│          │                            │ mutate              │
│          │                            ▼                    │
│     ┌─────────────┐              ┌─────────────┐           │
│     │   State     │◀─────────────│   State     │           │
│     │  (状态)     │   getters    │  (响应式)   │           │
│     └─────────────┘              └─────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
*/

import { createStore } from 'vuex'

const store = createStore({
  // State: 状态存储
  state: () => ({
    count: 0,
    todos: [],
    user: null
  }),
  
  // Getters: 派生状态
  getters: {
    doneTodos: state => state.todos.filter(todo => todo.done),
    
    doneTodosCount(state, getters) {
      return getters.doneTodos.length
    },
    
    getTodoById: (state) => (id) => {
      return state.todos.find(todo => todo.id === id)
    }
  },
  
  // Mutations: 同步状态变更
  mutations: {
    INCREMENT(state) {
      state.count++
    },
    
    ADD_TODO(state, todo) {
      state.todos.push(todo)
    },
    
    SET_USER(state, user) {
      state.user = user
    }
  },
  
  // Actions: 异步操作
  actions: {
    async fetchUser({ commit }, id) {
      const user = await api.fetchUser(id)
      commit('SET_USER', user)
    },
    
    async addTodo({ commit }, todoText) {
      const todo = await api.createTodo(todoText)
      commit('ADD_TODO', todo)
    }
  }
})
```

### 3.2 模块化

```javascript
// 用户模块
const userModule = {
  namespaced: true,
  
  state: () => ({
    profile: null,
    preferences: {}
  }),
  
  mutations: {
    SET_PROFILE(state, profile) {
      state.profile = profile
    }
  },
  
  actions: {
    async loadProfile({ commit }, id) {
      const profile = await api.fetchUserProfile(id)
      commit('SET_PROFILE', profile)
    }
  },
  
  getters: {
    isLoggedIn: state => !!state.profile,
    fullName: state => {
      if (!state.profile) return ''
      return `${state.profile.firstName} ${state.profile.lastName}`
    }
  }
}

// 商品模块
const productsModule = {
  namespaced: true,
  
  state: () => ({
    items: [],
    loading: false
  }),
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ITEMS(state, items) {
      state.items = items
    }
  },
  
  actions: {
    async fetchProducts({ commit }) {
      commit('SET_LOADING', true)
      try {
        const products = await api.fetchProducts()
        commit('SET_ITEMS', products)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}

// 组合模块
const store = createStore({
  modules: {
    user: userModule,
    products: productsModule
  }
})

// 使用命名空间
store.dispatch('user/loadProfile', 123)
store.commit('products/SET_LOADING', true)
```

## 四、Pinia 模式

### 4.1 Pinia 设计理念

```javascript
// Pinia 采用更直观的 API 设计
import { defineStore } from 'pinia'

// Option Store 语法（类似 Vuex）
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  actions: {
    increment() {
      this.count++
    },
    
    async fetchCount() {
      const data = await api.getCount()
      this.count = data.count
    }
  }
})

// Setup Store 语法（Composition API 风格）
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  async function fetchCount() {
    const data = await api.getCount()
    count.value = data.count
  }
  
  return { count, doubleCount, increment, fetchCount }
})
```

### 4.2 Pinia 特性

```javascript
// 1. 更好的 TypeScript 支持
interface User {
  id: number
  name: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const users = ref<User[]>([])
  
  // TypeScript 会自动推断类型
  const userName = computed(() => user.value?.name ?? 'Guest')
  
  async function fetchUser(id: number): Promise<void> {
    const data = await api.fetchUser(id)
    user.value = data // 类型安全
  }
  
  return { user, users, userName, fetchUser }
})

// 2. 扁平化结构，无需 mutations
export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])
  
  // 直接修改状态，无需 commit
  function addTodo(text: string) {
    todos.value.push({
      id: Date.now(),
      text,
      completed: false
    })
  }
  
  // 异步操作也很简单
  async function loadTodos() {
    const data = await api.fetchTodos()
    todos.value = data
  }
  
  return { todos, addTodo, loadTodos }
})

// 3. 模块化更自然
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  
  const isLoggedIn = computed(() => !!token.value)
  
  async function login(credentials: LoginCredentials) {
    const response = await api.login(credentials)
    token.value = response.token
    user.value = response.user
  }
  
  function logout() {
    token.value = null
    user.value = null
  }
  
  return { token, user, isLoggedIn, login, logout }
})
```

## 五、状态管理模式对比

### 5.1 复杂度对比

```javascript
// Redux - 较复杂
// Action Types
const ADD_TODO = 'ADD_TODO'

// Action Creators
const addTodo = (text) => ({
  type: ADD_TODO,
  payload: { text }
})

// Reducer
const todosReducer = (state = [], action) => {
  switch (action.type) {
    case ADD_TODO:
      return [...state, action.payload]
    default:
      return state
  }
}

// Vuex - 中等复杂度
const store = createStore({
  state: () => ({ todos: [] }),
  mutations: {
    ADD_TODO(state, todo) {
      state.todos.push(todo)
    }
  },
  actions: {
    addTodo({ commit }, text) {
      commit('ADD_TODO', { text })
    }
  }
})

// Pinia - 简单直观
export const useTodoStore = defineStore('todo', () => {
  const todos = ref([])
  
  function addTodo(text) {
    todos.value.push({ text })
  }
  
  return { todos, addTodo }
})
```

### 5.2 TypeScript 支持对比

```typescript
// Redux + TypeScript - 需要大量类型定义
interface RootState {
  todos: Todo[]
  user: User | null
}

type ActionType = 'ADD_TODO' | 'SET_USER'

interface Action {
  type: ActionType
  payload?: any
}

const reducer = (state: RootState, action: Action): RootState => {
  // 需要手动类型断言
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload as Todo]
      }
  }
}

// Vuex + TypeScript - 类型支持有限
interface RootState {
  todos: Todo[]
}

const store = createStore<RootState>({
  // 类型推断不够完善
})

// Pinia + TypeScript - 完美的类型推断
export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])
  
  // 自动推断返回类型
  function addTodo(todo: Todo) {
    todos.value.push(todo)
  }
  
  return { todos, addTodo }
})

// 使用时的类型安全
const todoStore = useTodoStore()
todoStore.addTodo({ /* 自动提示 Todo 类型 */ })
```

### 5.3 开发体验对比

```javascript
// Redux DevTools - 功能强大但复杂
store.dispatch(addTodo('Learn Redux'))
// DevTools 显示: ADD_TODO action

// Vuex DevTools - 清晰的 mutation 记录
store.commit('ADD_TODO', todo)
// DevTools 显示: ADD_TODO mutation

// Pinia DevTools - 最直观的体验
todoStore.addTodo('Learn Pinia')
// DevTools 显示: addTodo action，自动生成
```

## 六、现代状态管理趋势

### 6.1 服务器状态管理

```javascript
// 传统方式 - 在状态管理中处理服务器数据
const store = createStore({
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchUsers({ commit }) {
      commit('SET_LOADING', true)
      try {
        const users = await api.fetchUsers()
        commit('SET_USERS', users)
      } catch (error) {
        commit('SET_ERROR', error)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
})

// 现代方式 - 专门的服务器状态库
import { useQuery } from '@tanstack/vue-query'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.fetchUsers(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// 在组件中使用
const { data: users, isLoading, error } = useUsers()
```

### 6.2 原子化状态管理

```javascript
// Jotai 风格的原子化状态
import { atom } from 'jotai'

// 原子状态
const countAtom = atom(0)
const usernameAtom = atom('')

// 派生状态
const doubleCountAtom = atom((get) => get(countAtom) * 2)

// 异步原子状态
const userAtom = atom(async (get) => {
  const username = get(usernameAtom)
  if (!username) return null
  return await api.fetchUser(username)
})

// 在组件中使用
const [count, setCount] = useAtom(countAtom)
const [doubleCount] = useAtom(doubleCountAtom)
```

### 6.3 轻量级状态管理

```javascript
// Zustand 风格的简单状态管理
import { create } from 'zustand'

const useStore = create((set, get) => ({
  count: 0,
  users: [],
  
  increment: () => set((state) => ({ count: state.count + 1 })),
  
  fetchUsers: async () => {
    const users = await api.fetchUsers()
    set({ users })
  },
  
  reset: () => set({ count: 0, users: [] })
}))

// 使用
const { count, increment, users, fetchUsers } = useStore()
```

## 七、选择指导原则

### 7.1 按应用复杂度选择

```javascript
// 简单应用 - 组件状态足够
const SimpleComponent = defineComponent({
  setup() {
    const count = ref(0)
    return { count }
  }
})

// 中等复杂度 - Pinia 或轻量级方案
export const useAppStore = defineStore('app', () => {
  const user = ref(null)
  const theme = ref('light')
  
  return { user, theme }
})

// 复杂应用 - Vuex 或 Redux
const complexStore = createStore({
  modules: {
    user: userModule,
    products: productsModule,
    orders: ordersModule,
    analytics: analyticsModule
  }
})
```

### 7.2 按团队技能选择

```javascript
// 团队熟悉 Options API - Vuex
const store = createStore({
  state: () => ({ /* ... */ }),
  mutations: { /* ... */ },
  actions: { /* ... */ }
})

// 团队使用 Composition API - Pinia
export const useStore = defineStore('main', () => {
  // Composition API 风格
  const state = ref(initialState)
  const actions = {
    // actions
  }
  return { state, ...actions }
})

// 团队有 Redux 经验 - 可以选择 Redux Toolkit
import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1 // Immer 内部处理不可变性
    }
  }
})
```

## 八、最佳实践

### 8.1 状态设计模式

```javascript
// 1. 规范化状态结构
const normalizedState = {
  users: {
    byId: {
      1: { id: 1, name: 'Alice' },
      2: { id: 2, name: 'Bob' }
    },
    allIds: [1, 2]
  }
}

// 2. 分离关注点
const uiStore = defineStore('ui', () => {
  const loading = ref(false)
  const error = ref(null)
  return { loading, error }
})

const dataStore = defineStore('data', () => {
  const users = ref([])
  const posts = ref([])
  return { users, posts }
})

// 3. 使用枚举定义状态
enum LoadingState {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error'
}

const useAsyncStore = defineStore('async', () => {
  const status = ref(LoadingState.Idle)
  
  return { status, LoadingState }
})
```

### 8.2 性能优化模式

```javascript
// 1. 选择性订阅
const Component = defineComponent({
  setup() {
    const store = useStore()
    
    // 只订阅需要的数据
    const userName = computed(() => store.user.name)
    
    return { userName }
  }
})

// 2. 批量更新
const batchUpdates = (updates) => {
  batch(() => {
    updates.forEach(update => update())
  })
}

// 3. 缓存计算结果
const expensiveGetter = computed(() => {
  return store.largeArray.reduce((acc, item) => {
    return acc + complexCalculation(item)
  }, 0)
})
```

## 参考资料

- [Flux Architecture](https://facebook.github.io/flux/)
- [Redux Fundamentals](https://redux.js.org/tutorials/fundamentals/part-1-overview)
- [Vuex 4 Documentation](https://vuex.vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [State Management Patterns](https://refactoring.guru/design-patterns/state)

**下一节** → [第 03 节：Vue 中的状态](./03-vue-state.md)
