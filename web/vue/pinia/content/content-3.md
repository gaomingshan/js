# 1.3 定义 Store 的基础方式

## 概述

Pinia 提供了灵活的 Store 定义方式，本节介绍使用 Options API 风格定义 Store 的基础方法，包括 `defineStore` 的核心用法、Store ID 规范，以及 State、Getters、Actions 的基础使用。

## defineStore 核心 API

### 基本语法

```javascript
import { defineStore } from 'pinia'

export const useXxxStore = defineStore(id, options)
```

**参数说明**：
- `id`（必需）：字符串类型，Store 的唯一标识符
- `options`（必需）：配置对象，包含 `state`、`getters`、`actions`

### 基础示例

```javascript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  // 状态
  state: () => ({
    name: 'Alice',
    age: 25,
    isLoggedIn: false
  }),
  
  // 计算属性
  getters: {
    greeting: (state) => `Hello, ${state.name}!`,
    isAdult: (state) => state.age >= 18
  },
  
  // 方法
  actions: {
    login(username) {
      this.name = username
      this.isLoggedIn = true
    },
    logout() {
      this.name = ''
      this.isLoggedIn = false
    }
  }
})
```

## Store ID 的命名规范与作用

### 命名规范

**推荐命名方式**：
```javascript
// ✅ 推荐：小写短横线分隔
defineStore('user-profile', {})
defineStore('shopping-cart', {})
defineStore('todo-list', {})

// ✅ 可接受：驼峰命名
defineStore('userProfile', {})
defineStore('shoppingCart', {})

// ❌ 不推荐：大写、特殊字符
defineStore('USER', {})
defineStore('user@profile', {})
```

**Hook 命名规范**：
```javascript
// Store ID: 'user'
export const useUserStore = defineStore('user', {})

// Store ID: 'shopping-cart'
export const useShoppingCartStore = defineStore('shopping-cart', {})

// Store ID: 'todo-list'
export const useTodoListStore = defineStore('todo-list', {})
```

### Store ID 的作用

1. **唯一标识**：区分不同的 Store
2. **DevTools 显示**：在 Vue DevTools 中显示的名称
3. **插件识别**：插件通过 ID 识别和操作 Store
4. **调试信息**：错误日志和警告中显示的标识

```javascript
// DevTools 中显示
[Pinia] Store "user" 已初始化

// 插件中使用
pinia.use(({ store }) => {
  if (store.$id === 'user') {
    // 针对 user Store 的特殊处理
  }
})
```

## Options API 方式定义 Store

### 完整示例

```javascript
import { defineStore } from 'pinia'

export const useTodoStore = defineStore('todo', {
  // 1. State：定义状态
  state: () => ({
    todos: [],
    filter: 'all', // 'all' | 'active' | 'completed'
    nextId: 1
  }),
  
  // 2. Getters：计算属性
  getters: {
    // 过滤后的待办事项
    filteredTodos: (state) => {
      switch (state.filter) {
        case 'active':
          return state.todos.filter(todo => !todo.completed)
        case 'completed':
          return state.todos.filter(todo => todo.completed)
        default:
          return state.todos
      }
    },
    
    // 统计信息
    todoCount: (state) => state.todos.length,
    completedCount: (state) => state.todos.filter(t => t.completed).length,
    activeCount: (state) => state.todos.filter(t => !t.completed).length,
    
    // 访问其他 getters
    progress() {
      return this.todoCount === 0 
        ? 0 
        : Math.round((this.completedCount / this.todoCount) * 100)
    }
  },
  
  // 3. Actions：业务逻辑
  actions: {
    // 添加待办
    addTodo(text) {
      this.todos.push({
        id: this.nextId++,
        text,
        completed: false,
        createdAt: Date.now()
      })
    },
    
    // 切换完成状态
    toggleTodo(id) {
      const todo = this.todos.find(t => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    
    // 删除待办
    removeTodo(id) {
      const index = this.todos.findIndex(t => t.id === id)
      if (index !== -1) {
        this.todos.splice(index, 1)
      }
    },
    
    // 设置过滤器
    setFilter(filter) {
      this.filter = filter
    },
    
    // 清空已完成
    clearCompleted() {
      this.todos = this.todos.filter(t => !t.completed)
    }
  }
})
```

## State、Getters、Actions 基础用法

### 1. State（状态）

**定义规则**：
- 必须是函数，返回初始状态对象
- 支持任意 JavaScript 类型
- 返回的对象会被转换为响应式

```javascript
state: () => ({
  // 基本类型
  count: 0,
  name: 'Alice',
  isActive: true,
  
  // 引用类型
  user: { id: 1, name: 'Bob' },
  items: [1, 2, 3],
  config: new Map(),
  
  // null/undefined
  data: null,
  error: undefined
})
```

**访问 State**：
```javascript
const store = useUserStore()

// 直接访问
console.log(store.count)
console.log(store.name)

// 在模板中
<template>
  <div>{{ store.count }}</div>
</template>
```

### 2. Getters（计算属性）

**定义规则**：
- 接收 `state` 作为第一个参数
- 类似 Vue 的 `computed`，具有缓存特性
- 可以访问其他 getters

```javascript
getters: {
  // 基础用法：接收 state
  doubleCount: (state) => state.count * 2,
  
  // 访问其他 getters（使用 this）
  message() {
    return `Count is ${this.doubleCount}`
  },
  
  // 返回函数（不缓存，可传参）
  getTodoById: (state) => {
    return (id) => state.todos.find(todo => todo.id === id)
  },
  
  // TypeScript 类型标注
  username: (state): string => state.user?.name ?? 'Guest'
}
```

**使用 Getters**：
```javascript
const store = useTodoStore()

// 像访问属性一样
console.log(store.doubleCount)

// 调用返回函数的 getter
const todo = store.getTodoById(1)
```

### 3. Actions（方法）

**定义规则**：
- 可以是同步或异步函数
- 通过 `this` 访问 Store 实例
- 支持任意参数

```javascript
actions: {
  // 同步 action
  increment() {
    this.count++
  },
  
  incrementBy(amount) {
    this.count += amount
  },
  
  // 异步 action
  async fetchUser(id) {
    try {
      const response = await fetch(`/api/users/${id}`)
      const user = await response.json()
      this.user = user
    } catch (error) {
      this.error = error.message
    }
  },
  
  // 调用其他 actions
  async fetchAndProcess(id) {
    await this.fetchUser(id)
    this.processUser()
  },
  
  processUser() {
    this.user.name = this.user.name.toUpperCase()
  }
}
```

**调用 Actions**：
```javascript
const store = useUserStore()

// 同步调用
store.increment()
store.incrementBy(10)

// 异步调用
await store.fetchUser(1)

// 在模板中
<button @click="store.increment">+1</button>
```

## 关键点总结

1. **defineStore**：两个参数 —— Store ID + Options 对象
2. **Store ID**：唯一标识，推荐小写短横线命名
3. **State**：必须是返回对象的函数，会自动转为响应式
4. **Getters**：类似 computed，有缓存，可访问其他 getters
5. **Actions**：支持同步/异步，通过 `this` 访问 Store

## 深入一点

### State 为什么必须是函数？

```javascript
// ❌ 错误：对象会被所有实例共享（如果有多个 Pinia 实例）
state: {
  count: 0
}

// ✅ 正确：每次调用返回新对象
state: () => ({
  count: 0
})
```

这与 Vue 组件的 `data` 选项是同样的原因：确保每个实例拥有独立的状态副本。

### Getters 的缓存机制

```javascript
getters: {
  // ✅ 有缓存：只在依赖变化时重新计算
  expensiveGetter: (state) => {
    console.log('计算中...')
    return state.items.reduce((sum, item) => sum + item.price, 0)
  },
  
  // ❌ 无缓存：每次访问都会执行
  getTodoById: (state) => {
    return (id) => {
      console.log('查找中...')
      return state.todos.find(todo => todo.id === id)
    }
  }
}
```

### Actions 中的 this 指向

```javascript
actions: {
  // ✅ 普通函数：this 指向 Store 实例
  increment() {
    console.log(this.count) // 正确访问
  },
  
  // ❌ 箭头函数：this 不指向 Store
  decrement: () => {
    console.log(this.count) // undefined
  },
  
  // ✅ 异步函数中的 this
  async fetchData() {
    const data = await api.get()
    this.data = data // 正确
  }
}
```

### 完整的 Store 使用示例

```vue
<script setup>
import { useTodoStore } from '@/stores/todo'
import { storeToRefs } from 'pinia'

const todoStore = useTodoStore()

// 解构 state 和 getters（保持响应式）
const { todos, filter, filteredTodos, progress } = storeToRefs(todoStore)

// 解构 actions（不需要 storeToRefs）
const { addTodo, toggleTodo, setFilter } = todoStore

function handleAdd() {
  addTodo('New Task')
}
</script>

<template>
  <div>
    <h2>进度: {{ progress }}%</h2>
    
    <select v-model="filter">
      <option value="all">全部</option>
      <option value="active">未完成</option>
      <option value="completed">已完成</option>
    </select>
    
    <ul>
      <li v-for="todo in filteredTodos" :key="todo.id">
        <input type="checkbox" :checked="todo.completed" @change="toggleTodo(todo.id)">
        {{ todo.text }}
      </li>
    </ul>
    
    <button @click="handleAdd">添加</button>
  </div>
</template>
```

## 参考资料

- [Pinia 核心概念](https://pinia.vuejs.org/core-concepts/)
- [defineStore API](https://pinia.vuejs.org/api/modules/pinia.html#definestore)
- [State 文档](https://pinia.vuejs.org/core-concepts/state.html)
- [Getters 文档](https://pinia.vuejs.org/core-concepts/getters.html)
- [Actions 文档](https://pinia.vuejs.org/core-concepts/actions.html)
