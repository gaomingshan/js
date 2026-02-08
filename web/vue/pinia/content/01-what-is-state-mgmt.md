# 第 01 节：什么是状态管理

## 概述

状态管理是现代前端应用开发中的核心概念，它解决了组件间数据共享和应用状态维护的问题。理解状态管理的本质有助于构建更可维护和可扩展的应用。

## 一、状态的定义

### 1.1 什么是状态

```javascript
// 状态就是应用在特定时刻的数据快照
const appState = {
  // 用户状态
  user: {
    id: 1,
    name: 'Alice',
    isLoggedIn: true,
    permissions: ['read', 'write']
  },
  
  // UI 状态
  ui: {
    isLoading: false,
    activeTab: 'dashboard',
    sidebarCollapsed: false,
    theme: 'dark'
  },
  
  // 业务数据
  data: {
    products: [],
    cart: [],
    orders: []
  }
}
```

### 1.2 状态的特征

```javascript
// 状态具有以下特征：

// 1. 可变性 - 状态会随时间改变
let count = 0
count++ // 状态发生变化

// 2. 共享性 - 多个组件可能需要相同状态
const sharedCounter = reactive({ value: 0 })

// 3. 持久性 - 某些状态需要在页面刷新后保持
const persistentState = {
  userPreferences: localStorage.getItem('preferences'),
  authToken: sessionStorage.getItem('token')
}

// 4. 响应性 - 状态变化需要触发视图更新
const reactiveState = reactive({
  message: 'Hello'
})
```

## 二、为什么需要状态管理

### 2.1 组件通信的挑战

```vue
<!-- 传统的 Props Drilling 问题 -->
<template>
  <!-- 祖父组件 -->
  <Parent :user="user" :theme="theme" />
</template>

<script>
export default {
  data() {
    return {
      user: { name: 'Alice' },
      theme: 'dark'
    }
  }
}
</script>
```

```vue
<!-- 父组件 - 仅作为数据传递的中介 -->
<template>
  <Child :user="user" :theme="theme" />
</template>

<script>
export default {
  props: ['user', 'theme'] // 父组件不使用这些数据，只是传递
}
</script>
```

```vue
<!-- 子组件 - 真正使用数据的组件 -->
<template>
  <div :class="theme">
    Welcome, {{ user.name }}!
  </div>
</template>

<script>
export default {
  props: ['user', 'theme']
}
</script>
```

### 2.2 状态同步问题

```javascript
// 问题：多个组件需要同步相同的状态
// 组件 A
export default {
  data() {
    return {
      cartCount: 0 // 购物车数量
    }
  },
  methods: {
    addToCart() {
      this.cartCount++ // 只更新了组件 A
    }
  }
}

// 组件 B
export default {
  data() {
    return {
      cartCount: 0 // 独立的状态，无法同步
    }
  }
}

// 解决方案：共享状态
const cartStore = reactive({
  count: 0,
  addItem() {
    this.count++
  }
})
```

### 2.3 状态管理的必要性

```javascript
// 当应用变得复杂时，需要考虑：

// 1. 状态在哪里存储？
// 2. 谁可以修改状态？
// 3. 状态如何在组件间共享？
// 4. 状态变化如何被追踪？
// 5. 如何保证状态的一致性？

// 状态管理库解决了这些问题
const store = createStore({
  state: () => ({
    count: 0
  }),
  
  mutations: {
    increment(state) {
      state.count++ // 统一的状态修改方式
    }
  },
  
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment') // 可追踪的状态变更
      }, 1000)
    }
  }
})
```

## 三、状态管理的核心概念

### 3.1 单向数据流

```javascript
// 单向数据流模式
/*
┌─────────────────────────────────────────────────────────────┐
│                      单向数据流                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐    Action    ┌─────────┐    Mutation  ┌─────────┐
│   │  View   │──────────────▶│ Action  │──────────────▶│  State  │
│   │ (组件)  │               │ (动作)  │               │ (状态)  │
│   └─────────┘               └─────────┘               └─────────┘
│        ▲                                                   │
│        │                                                   │
│        └───────────────────  Render  ◀────────────────────┘
│                            (重新渲染)
│                                                             │
└─────────────────────────────────────────────────────────────┘
*/

// 实际代码示例
const useCounter = () => {
  const state = reactive({ count: 0 })
  
  // Action: 用户交互触发
  const increment = () => {
    // Mutation: 修改状态
    state.count++
  }
  
  return {
    state: readonly(state), // State: 只读状态
    increment
  }
}
```

### 3.2 状态的不可变性

```javascript
// 错误做法：直接修改状态
const state = { items: [1, 2, 3] }
state.items.push(4) // 直接修改原对象

// 正确做法：创建新的状态
const newState = {
  ...state,
  items: [...state.items, 4] // 创建新数组
}

// 使用 Immer 简化不可变更新
import { produce } from 'immer'

const newState = produce(state, draft => {
  draft.items.push(4) // 看起来是直接修改，实际创建新对象
})
```

### 3.3 状态的可预测性

```javascript
// 纯函数：相同输入总是产生相同输出
const reducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 }
    case 'DECREMENT':
      return { ...state, count: state.count - 1 }
    default:
      return state
  }
}

// 可预测的状态变更
console.log(reducer({ count: 0 }, { type: 'INCREMENT' })) 
// 总是返回 { count: 1 }

// 副作用应该被隔离
const incrementAsync = async (dispatch) => {
  const result = await api.increment() // 副作用
  dispatch({ type: 'INCREMENT', payload: result }) // 纯函数更新
}
```

## 四、状态的分类

### 4.1 按作用域分类

```javascript
// 1. 组件状态 (Component State)
const MyComponent = defineComponent({
  setup() {
    const localState = ref(0) // 只在当前组件使用
    return { localState }
  }
})

// 2. 应用状态 (Application State)
const useGlobalState = () => {
  const globalState = reactive({
    user: null,
    theme: 'light'
  })
  return globalState
}

// 3. 服务器状态 (Server State)
const useServerState = () => {
  const { data, loading, error } = useFetch('/api/users')
  return { data, loading, error }
}
```

### 4.2 按生命周期分类

```javascript
// 1. 瞬态状态 (Ephemeral State)
const form = reactive({
  name: '',
  email: '' // 表单提交后清空
})

// 2. 持久化状态 (Persistent State)
const settings = reactive({
  language: localStorage.getItem('language') || 'en',
  theme: localStorage.getItem('theme') || 'light'
})

// 3. 会话状态 (Session State)
const auth = reactive({
  token: sessionStorage.getItem('token'),
  user: null
})
```

### 4.3 按数据来源分类

```javascript
// 1. 客户端状态 (Client State)
const clientState = reactive({
  sidebarOpen: false,
  currentPage: 1,
  selectedItems: []
})

// 2. 服务器状态 (Server State)
const serverState = reactive({
  users: [],
  products: [],
  orders: []
})

// 3. URL 状态 (URL State)
const urlState = reactive({
  route: '/dashboard',
  query: { tab: 'overview' },
  params: { id: '123' }
})
```

## 五、状态管理的挑战

### 5.1 复杂性管理

```javascript
// 问题：状态结构变得复杂
const complexState = {
  users: {
    byId: {},
    allIds: [],
    loading: false,
    error: null
  },
  posts: {
    byId: {},
    allIds: [],
    byAuthor: {},
    loading: false,
    error: null
  },
  ui: {
    activeModal: null,
    notifications: [],
    theme: 'light'
  }
}

// 解决方案：模块化管理
const userModule = {
  state: () => ({
    byId: {},
    allIds: [],
    loading: false
  }),
  mutations: {
    setUsers(state, users) {
      // 用户相关的状态更新
    }
  }
}

const postModule = {
  state: () => ({
    byId: {},
    allIds: [],
    loading: false
  })
}
```

### 5.2 性能考量

```javascript
// 问题：不必要的重渲染
const BigState = defineComponent({
  setup() {
    const store = useStore()
    
    // 组件会在任何状态变化时重新渲染
    return { store }
  },
  template: `<div>{{ store.user.name }}</div>`
})

// 解决方案：精确订阅
const OptimizedComponent = defineComponent({
  setup() {
    const store = useStore()
    
    // 只订阅需要的状态
    const userName = computed(() => store.user.name)
    
    return { userName }
  },
  template: `<div>{{ userName }}</div>`
})
```

### 5.3 调试困难

```javascript
// 问题：状态变化难以追踪
let state = { count: 0 }

// 在某个地方
state.count++

// 在另一个地方
state.count += 5

// 很难知道 count 是如何变成当前值的

// 解决方案：可追踪的状态变更
const store = createStore({
  state: { count: 0 },
  mutations: {
    increment(state) {
      state.count++ // 在 DevTools 中可见
    },
    add(state, value) {
      state.count += value // 记录了具体的变更
    }
  }
})
```

## 六、状态管理的收益

### 6.1 可维护性提升

```javascript
// 集中的状态管理使代码更易维护
const store = {
  // 所有状态定义在一处
  state: {
    users: [],
    currentUser: null
  },
  
  // 所有状态变更逻辑在一处
  mutations: {
    setUsers(state, users) {
      state.users = users
    },
    setCurrentUser(state, user) {
      state.currentUser = user
    }
  }
}
```

### 6.2 可测试性增强

```javascript
// 状态管理使测试更容易
import { mutations } from './store'

describe('store mutations', () => {
  it('should set users correctly', () => {
    const state = { users: [] }
    const users = [{ id: 1, name: 'Alice' }]
    
    mutations.setUsers(state, users)
    
    expect(state.users).toEqual(users)
  })
})
```

### 6.3 开发体验改善

```javascript
// 时间旅行调试
store.dispatch('increment')
store.dispatch('increment')
store.dispatch('decrement')

// 可以回退到任意状态点
// DevTools 显示完整的 action 历史
```

## 七、何时使用状态管理

### 7.1 简单应用

```javascript
// 对于简单应用，组件状态足够
const SimpleApp = defineComponent({
  setup() {
    const count = ref(0)
    
    return {
      count,
      increment: () => count.value++
    }
  }
})
```

### 7.2 复杂应用的信号

```javascript
// 当出现以下情况时，考虑使用状态管理：

// 1. 多层级组件需要共享状态
const GrandParent = { /* 需要传递数据到孙组件 */ }

// 2. 兄弟组件需要通信
const ComponentA = { /* 需要通知 ComponentB */ }
const ComponentB = { /* 需要响应 ComponentA 的变化 */ }

// 3. 状态需要持久化
const persistentData = {
  userPreferences: {},
  shoppingCart: []
}

// 4. 状态变更需要被记录/撤销
const undoableState = {
  history: [],
  currentIndex: 0
}
```

## 八、最佳实践

### 8.1 状态设计原则

```javascript
// 1. 最小化状态
// 避免存储可以计算出的数据
const store = {
  state: {
    items: [
      { id: 1, price: 10, quantity: 2 },
      { id: 2, price: 20, quantity: 1 }
    ]
    // 不要存储 total，而是计算它
  },
  getters: {
    total: state => {
      return state.items.reduce((sum, item) => 
        sum + item.price * item.quantity, 0
      )
    }
  }
}

// 2. 扁平化状态结构
// 好的设计
const goodState = {
  users: { 1: { id: 1, name: 'Alice' } },
  posts: { 1: { id: 1, authorId: 1, title: 'Post 1' } }
}

// 避免深层嵌套
const badState = {
  users: [
    {
      id: 1,
      name: 'Alice',
      posts: [
        { id: 1, title: 'Post 1' } // 嵌套太深
      ]
    }
  ]
}
```

### 8.2 状态更新策略

```javascript
// 1. 批量更新
const batchUpdate = (updates) => {
  batch(() => {
    updates.forEach(update => {
      store.commit(update.mutation, update.payload)
    })
  })
}

// 2. 乐观更新
const optimisticUpdate = async (action) => {
  // 立即更新 UI
  store.commit('updateOptimistically', action.payload)
  
  try {
    // 发送请求
    await api.update(action.payload)
  } catch (error) {
    // 回滚更新
    store.commit('revertOptimisticUpdate')
    throw error
  }
}
```

## 参考资料

- [Flux Architecture](https://facebook.github.io/flux/docs/in-depth-overview/)
- [Redux Fundamentals](https://redux.js.org/tutorials/fundamentals/part-1-overview)
- [Vue 3 State Management](https://vuejs.org/guide/scaling-up/state-management.html)
- [When do you need a state management library?](https://kentcdodds.com/blog/application-state-management-with-react)

**下一节** → [第 02 节：状态管理模式](./02-state-patterns.md)
