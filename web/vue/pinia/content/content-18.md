# 5.3 从 Vuex 迁移到 Pinia

## 概述

Pinia 是 Vuex 的精神继承者，提供了更简洁的 API 和更好的 TypeScript 支持。本节介绍如何从 Vuex 平滑迁移到 Pinia。

## Vuex vs Pinia 核心差异

### 架构对比

| 特性 | Vuex 4 | Pinia |
|------|--------|-------|
| Mutations | 必需 | 无（直接在 Actions 中修改） |
| Modules | 嵌套模块 | 扁平化独立 Store |
| 命名空间 | `namespaced: true` | 自动隔离（通过 ID） |
| TypeScript | 需要复杂配置 | 开箱即用 |
| DevTools | 支持 | 深度集成 |
| 包体积 | ~22KB | ~15KB |
| 学习曲线 | 较陡 | 平缓 |

### API 对比

**Vuex**：
```javascript
// store/index.js
export default createStore({
  state: {
    count: 0
  },
  mutations: {
    INCREMENT(state) {
      state.count++
    }
  },
  actions: {
    increment({ commit }) {
      commit('INCREMENT')
    }
  },
  getters: {
    doubleCount: state => state.count * 2
  }
})
```

**Pinia**：
```javascript
// stores/counter.js
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  actions: {
    // 无需 mutations，直接修改
    increment() {
      this.count++
    }
  },
  getters: {
    doubleCount: state => state.count * 2
  }
})
```

## 迁移步骤与策略

### 第 1 步：安装 Pinia

```bash
npm install pinia
# 可以保留 vuex，逐步迁移
npm uninstall vuex  # 完全迁移后再删除
```

### 第 2 步：创建 Pinia 实例

```javascript
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { store } from './store' // Vuex store（可选，逐步迁移）

const app = createApp(App)

// 同时注册 Vuex 和 Pinia（过渡期）
app.use(store)  // Vuex
app.use(createPinia())  // Pinia

app.mount('#app')
```

### 第 3 步：迁移第一个模块

**Vuex 模块**：
```javascript
// store/modules/user.js (Vuex)
export default {
  namespaced: true,
  
  state: {
    user: null,
    token: null
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })
      const data = await response.json()
      
      commit('SET_USER', data.user)
      commit('SET_TOKEN', data.token)
    }
  },
  
  getters: {
    isLoggedIn: state => !!state.token
  }
}
```

**转换为 Pinia**：
```javascript
// stores/user.js (Pinia)
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null
  }),
  
  actions: {
    // 直接修改 state，无需 mutations
    async login(credentials) {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })
      const data = await response.json()
      
      this.user = data.user
      this.token = data.token
    }
  },
  
  getters: {
    isLoggedIn: state => !!state.token
  }
})
```

### 第 4 步：更新组件

**Vuex 用法**：
```vue
<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('user', ['user', 'token']),
    ...mapGetters('user', ['isLoggedIn'])
  },
  
  methods: {
    ...mapActions('user', ['login']),
    
    async handleLogin() {
      await this.login({ username: 'test', password: '123' })
    }
  }
}
</script>
```

**Pinia 用法（Options API）**：
```vue
<script>
import { mapStores, mapState, mapActions } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  computed: {
    ...mapState(useUserStore, ['user', 'token', 'isLoggedIn'])
  },
  
  methods: {
    ...mapActions(useUserStore, ['login']),
    
    async handleLogin() {
      await this.login({ username: 'test', password: '123' })
    }
  }
}
</script>
```

**Pinia 用法（Composition API）**：
```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

async function handleLogin() {
  await userStore.login({ username: 'test', password: '123' })
}
</script>

<template>
  <div v-if="userStore.isLoggedIn">
    Welcome {{ userStore.user.name }}
  </div>
</template>
```

## Modules 到多 Store 的转换

### Vuex 嵌套模块

```javascript
// store/index.js (Vuex)
import user from './modules/user'
import cart from './modules/cart'
import order from './modules/order'

export default createStore({
  modules: {
    user,
    cart,
    order: {
      namespaced: true,
      modules: {
        history: orderHistory,
        current: currentOrder
      }
    }
  }
})

// 使用
this.$store.state.user.profile
this.$store.state.order.history.items
```

### Pinia 扁平化 Store

```javascript
// stores/user.js
export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null
  })
})

// stores/cart.js
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  })
})

// stores/orderHistory.js
export const useOrderHistoryStore = defineStore('orderHistory', {
  state: () => ({
    items: []
  })
})

// stores/currentOrder.js
export const useCurrentOrderStore = defineStore('currentOrder', {
  state: () => ({
    order: null
  })
})

// stores/index.js - 统一导出
export { useUserStore } from './user'
export { useCartStore } from './cart'
export { useOrderHistoryStore } from './orderHistory'
export { useCurrentOrderStore } from './currentOrder'

// 使用
import { useUserStore, useOrderHistoryStore } from '@/stores'

const user = useUserStore()
const orderHistory = useOrderHistoryStore()

console.log(user.profile)
console.log(orderHistory.items)
```

## Mutations 的替代方案

### Vuex Mutations 模式

```javascript
// Vuex
mutations: {
  SET_NAME(state, name) {
    state.name = name
  },
  SET_AGE(state, age) {
    state.age = age
  },
  UPDATE_USER(state, user) {
    state.user = user
  }
},

actions: {
  updateUser({ commit }, user) {
    commit('UPDATE_USER', user)
  }
}
```

### Pinia 直接修改

```javascript
// Pinia - 方式 1：直接修改
actions: {
  updateUser(user) {
    this.user = user
  },
  
  setName(name) {
    this.name = name
  }
}

// Pinia - 方式 2：使用 $patch
actions: {
  updateUser(user) {
    this.$patch({
      name: user.name,
      age: user.age
    })
  }
}

// Pinia - 方式 3：$patch 函数形式
actions: {
  updateUser(user) {
    this.$patch((state) => {
      state.name = user.name
      state.age = user.age
    })
  }
}
```

### 迁移 Mutations 的原则

1. **简单赋值**：直接在 Action 中修改
2. **批量修改**：使用 `$patch`
3. **复杂逻辑**：封装为独立的 Action

```javascript
// Vuex
mutations: {
  ADD_ITEM(state, item) {
    state.items.push(item)
    state.count++
    state.total += item.price
  }
}

// Pinia
actions: {
  addItem(item) {
    // 直接修改多个状态
    this.items.push(item)
    this.count++
    this.total += item.price
    
    // 或使用 $patch
    this.$patch((state) => {
      state.items.push(item)
      state.count++
      state.total += item.price
    })
  }
}
```

## 渐进式迁移实践

### 策略 1：按模块逐步迁移

```javascript
// 阶段 1：保留 Vuex，添加第一个 Pinia Store
// main.js
app.use(store)  // Vuex
app.use(createPinia())  // Pinia

// stores/user.js (Pinia)
export const useUserStore = defineStore('user', { /* ... */ })

// 组件中
import { useUserStore } from '@/stores/user'
const userStore = useUserStore() // 使用 Pinia

// 阶段 2：迁移更多模块
// stores/cart.js (Pinia)
// stores/order.js (Pinia)

// 阶段 3：完全移除 Vuex
// main.js
// app.use(store)  // 删除 Vuex
app.use(createPinia())
```

### 策略 2：新功能使用 Pinia

```javascript
// 旧功能：继续使用 Vuex
// store/modules/legacy.js (Vuex)

// 新功能：使用 Pinia
// stores/newFeature.js (Pinia)
export const useNewFeatureStore = defineStore('newFeature', {
  // 新功能的状态管理
})
```

### 策略 3：创建兼容层

```javascript
// utils/storeCompat.js
// 创建 Vuex 到 Pinia 的桥接

export function createVuexCompat(piniaStore) {
  return {
    state: piniaStore.$state,
    
    getters: new Proxy({}, {
      get(target, key) {
        return piniaStore[key]
      }
    }),
    
    commit(mutation, payload) {
      // 映射 Vuex mutations 到 Pinia actions
      const actionName = mutation.toLowerCase().replace('set_', 'set')
      if (piniaStore[actionName]) {
        piniaStore[actionName](payload)
      }
    },
    
    dispatch(action, payload) {
      if (piniaStore[action]) {
        return piniaStore[action](payload)
      }
    }
  }
}

// 使用
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const vuexCompat = createVuexCompat(userStore)

// 像使用 Vuex 一样使用
vuexCompat.commit('SET_USER', user)
vuexCompat.dispatch('login', credentials)
```

## 常见迁移问题

### 问题 1：访问根 State

**Vuex**：
```javascript
// 访问根 state
this.$store.state.rootProperty

// 在模块中访问根 state
getters: {
  someGetter(state, getters, rootState) {
    return rootState.someValue
  }
}
```

**Pinia 解决方案**：
```javascript
// 创建专门的根 Store
export const useAppStore = defineStore('app', {
  state: () => ({
    rootProperty: ''
  })
})

// 在其他 Store 中访问
export const useUserStore = defineStore('user', {
  getters: {
    someGetter() {
      const app = useAppStore()
      return app.rootProperty
    }
  }
})
```

### 问题 2：全局 Plugins

**Vuex**：
```javascript
// store/index.js
export default createStore({
  plugins: [myPlugin]
})
```

**Pinia**：
```javascript
// main.js
const pinia = createPinia()
pinia.use(myPiniaPlugin)
```

### 问题 3：严格模式

**Vuex**：
```javascript
export default createStore({
  strict: process.env.NODE_ENV !== 'production'
})
```

**Pinia**：
```javascript
// Pinia 默认在开发模式下启用严格检查
// 无需配置
```

### 问题 4：动态注册模块

**Vuex**：
```javascript
store.registerModule('dynamicModule', {
  // ...
})
```

**Pinia**：
```javascript
// Pinia Store 本身就是动态的
// 首次调用 useXxxStore() 时自动注册

// 按需导入
async function loadModule() {
  const { useDynamicStore } = await import('@/stores/dynamic')
  const store = useDynamicStore()
  return store
}
```

## 迁移检查清单

### 代码迁移

- [ ] 安装 Pinia
- [ ] 创建 Pinia 实例并注册
- [ ] 将 Vuex modules 转换为 Pinia stores
- [ ] 移除所有 mutations，逻辑移到 actions
- [ ] 更新组件中的 Store 使用方式
- [ ] 更新路由守卫中的 Store 访问
- [ ] 迁移插件系统
- [ ] 更新测试代码

### 功能验证

- [ ] 状态读写正常
- [ ] Actions 执行正确
- [ ] Getters 计算准确
- [ ] 跨 Store 访问正常
- [ ] DevTools 集成工作
- [ ] 持久化功能正常
- [ ] SSR 场景正常（如适用）

### 性能检查

- [ ] 包体积减小
- [ ] 首屏加载时间
- [ ] 运行时性能
- [ ] 内存占用

## 关键点总结

1. **无 Mutations**：直接在 Actions 中修改 State
2. **扁平化**：每个 Store 独立，无嵌套模块
3. **自动类型推导**：TypeScript 开箱即用
4. **渐进迁移**：可与 Vuex 共存，逐步迁移
5. **更简洁的 API**：减少样板代码

## 深入一点

### 完整的迁移示例

**Vuex 版本**：
```javascript
// store/modules/todo.js
export default {
  namespaced: true,
  
  state: {
    todos: [],
    filter: 'all'
  },
  
  mutations: {
    ADD_TODO(state, todo) {
      state.todos.push(todo)
    },
    REMOVE_TODO(state, id) {
      const index = state.todos.findIndex(t => t.id === id)
      state.todos.splice(index, 1)
    },
    SET_FILTER(state, filter) {
      state.filter = filter
    }
  },
  
  actions: {
    addTodo({ commit }, text) {
      commit('ADD_TODO', {
        id: Date.now(),
        text,
        done: false
      })
    },
    removeTodo({ commit }, id) {
      commit('REMOVE_TODO', id)
    },
    setFilter({ commit }, filter) {
      commit('SET_FILTER', filter)
    }
  },
  
  getters: {
    filteredTodos(state) {
      if (state.filter === 'active') {
        return state.todos.filter(t => !t.done)
      } else if (state.filter === 'completed') {
        return state.todos.filter(t => t.done)
      }
      return state.todos
    }
  }
}
```

**Pinia 版本**：
```javascript
// stores/todo.js
export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [],
    filter: 'all'
  }),
  
  actions: {
    addTodo(text) {
      this.todos.push({
        id: Date.now(),
        text,
        done: false
      })
    },
    
    removeTodo(id) {
      const index = this.todos.findIndex(t => t.id === id)
      this.todos.splice(index, 1)
    },
    
    setFilter(filter) {
      this.filter = filter
    }
  },
  
  getters: {
    filteredTodos(state) {
      if (state.filter === 'active') {
        return state.todos.filter(t => !t.done)
      } else if (state.filter === 'completed') {
        return state.todos.filter(t => t.done)
      }
      return state.todos
    }
  }
})
```

对比可见，Pinia 版本：
- 减少了约 40% 的代码
- 无需 mutations 层
- 无需 `namespaced: true`
- 直接使用 `this` 访问 state

## 参考资料

- [Pinia 迁移指南](https://pinia.vuejs.org/cookbook/migration-vuex.html)
- [Vuex 文档](https://vuex.vuejs.org/)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
