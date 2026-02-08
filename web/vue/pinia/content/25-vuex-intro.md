# 第 25 节：Vuex 简介

## 概述

Vuex 是 Vue.js 的官方状态管理库，专为大型应用程序设计。它采用集中式存储管理应用的所有组件状态，并以相应的规则保证状态以可预测的方式发生变化。本节将介绍 Vuex 的核心概念、安装配置和基本使用。

## 一、Vuex 特性

### 1.1 核心特性

```javascript
// Vuex 核心特性
const vuexFeatures = {
  // 集中式状态管理
  centralized: {
    description: '单一状态树，所有状态存储在一个对象中',
    benefits: ['状态可预测', '调试友好', '易于维护']
  },
  
  // 严格的变更规则
  predictable: {
    description: '只能通过 mutation 同步变更状态',
    benefits: ['状态变更可追踪', '调试工具支持', '时间旅行调试']
  },
  
  // 模块化
  modular: {
    description: '支持模块分割，避免单一状态树过于庞大',
    benefits: ['代码组织', '命名空间', '动态注册']
  },
  
  // 开发工具集成
  devtools: {
    description: '与 Vue DevTools 深度集成',
    benefits: ['状态检查', '变更历史', '时间旅行']
  }
}
```

### 1.2 设计原则

```javascript
// Vuex 设计原则
const vuexPrinciples = {
  // 1. 单向数据流
  unidirectionalDataFlow: {
    flow: 'State → View → Action → State',
    description: '确保数据流的可预测性'
  },
  
  // 2. 单一状态树
  singleStateTree: {
    concept: '一个应用只有一个 Store 实例',
    benefit: '便于调试和状态快照'
  },
  
  // 3. 状态只读
  readOnlyState: {
    rule: '不能直接修改状态，必须通过 mutation',
    purpose: '确保状态变更的可追踪性'
  },
  
  // 4. 纯函数变更
  pureFunctions: {
    requirement: 'Mutation 必须是同步的纯函数',
    reason: '保证状态变更的确定性'
  }
}
```

## 二、安装和配置

### 2.1 安装 Vuex

```bash
# Vue 2 项目
npm install vuex@3

# Vue 3 项目
npm install vuex@4

# 或使用 yarn
yarn add vuex@4

# CDN 引入
<script src="https://unpkg.com/vuex@4"></script>
```

### 2.2 Vue 2 配置

```javascript
// Vue 2 配置示例
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

// 安装 Vuex 插件
Vue.use(Vuex)

// 创建 Store 实例
const store = new Vuex.Store({
  state: {
    count: 0,
    todos: [],
    user: null
  },
  
  getters: {
    completedTodos: state => {
      return state.todos.filter(todo => todo.completed)
    },
    
    isLoggedIn: state => {
      return !!state.user
    }
  },
  
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
  
  actions: {
    increment({ commit }) {
      commit('INCREMENT')
    },
    
    async login({ commit }, credentials) {
      try {
        const user = await api.login(credentials)
        commit('SET_USER', user)
        return user
      } catch (error) {
        throw error
      }
    }
  }
})

export default store

// main.js
import Vue from 'vue'
import App from './App.vue'
import store from './store'

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
```

### 2.3 Vue 3 配置

```javascript
// Vue 3 配置示例
// store/index.js
import { createStore } from 'vuex'

// 创建 Store 实例
const store = createStore({
  state() {
    return {
      count: 0,
      todos: [],
      user: null
    }
  },
  
  getters: {
    completedTodos(state) {
      return state.todos.filter(todo => todo.completed)
    },
    
    todoCount(state) {
      return state.todos.length
    },
    
    completedCount(state, getters) {
      return getters.completedTodos.length
    },
    
    isLoggedIn(state) {
      return !!state.user
    }
  },
  
  mutations: {
    INCREMENT(state, payload = 1) {
      state.count += payload
    },
    
    DECREMENT(state, payload = 1) {
      state.count -= payload
    },
    
    SET_USER(state, user) {
      state.user = user
    },
    
    CLEAR_USER(state) {
      state.user = null
    },
    
    ADD_TODO(state, todo) {
      state.todos.push({
        id: Date.now(),
        text: todo.text,
        completed: false,
        createdAt: new Date(),
        ...todo
      })
    },
    
    UPDATE_TODO(state, { id, updates }) {
      const index = state.todos.findIndex(todo => todo.id === id)
      if (index !== -1) {
        Object.assign(state.todos[index], updates)
      }
    },
    
    REMOVE_TODO(state, id) {
      const index = state.todos.findIndex(todo => todo.id === id)
      if (index !== -1) {
        state.todos.splice(index, 1)
      }
    }
  },
  
  actions: {
    increment({ commit }, amount = 1) {
      commit('INCREMENT', amount)
    },
    
    decrement({ commit }, amount = 1) {
      commit('DECREMENT', amount)
    },
    
    async login({ commit }, credentials) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        })
        
        if (!response.ok) {
          throw new Error('登录失败')
        }
        
        const user = await response.json()
        commit('SET_USER', user)
        
        // 可选：保存到本地存储
        localStorage.setItem('user', JSON.stringify(user))
        
        return user
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },
    
    logout({ commit }) {
      commit('CLEAR_USER')
      localStorage.removeItem('user')
    },
    
    async addTodo({ commit }, todoText) {
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: todoText })
        })
        
        const todo = await response.json()
        commit('ADD_TODO', todo)
        return todo
      } catch (error) {
        console.error('Add todo error:', error)
        throw error
      }
    },
    
    async updateTodo({ commit }, { id, updates }) {
      try {
        const response = await fetch(`/api/todos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
        
        const updatedTodo = await response.json()
        commit('UPDATE_TODO', { id, updates: updatedTodo })
        return updatedTodo
      } catch (error) {
        console.error('Update todo error:', error)
        throw error
      }
    }
  }
})

export default store

// main.js
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

const app = createApp(App)
app.use(store)
app.mount('#app')
```

## 三、基本使用

### 3.1 在组件中访问 Store

```vue
<template>
  <div class="app">
    <div class="counter">
      <h2>计数器: {{ count }}</h2>
      <button @click="increment">增加</button>
      <button @click="decrement">减少</button>
      <button @click="incrementBy(5)">增加5</button>
    </div>
    
    <div class="user-info" v-if="isLoggedIn">
      <h3>欢迎, {{ user.name }}!</h3>
      <button @click="logout">退出登录</button>
    </div>
    
    <div class="login-form" v-else>
      <input v-model="username" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <button @click="handleLogin" :disabled="loginLoading">
        {{ loginLoading ? '登录中...' : '登录' }}
      </button>
    </div>
    
    <div class="todos">
      <h3>待办事项 ({{ todoCount }})</h3>
      
      <div class="todo-input">
        <input 
          v-model="newTodoText" 
          @keyup.enter="addTodo"
          placeholder="添加待办事项..."
        />
        <button @click="addTodo">添加</button>
      </div>
      
      <ul class="todo-list">
        <li 
          v-for="todo in todos" 
          :key="todo.id"
          :class="{ completed: todo.completed }"
        >
          <input 
            type="checkbox" 
            :checked="todo.completed"
            @change="toggleTodo(todo.id)"
          />
          <span>{{ todo.text }}</span>
          <button @click="removeTodo(todo.id)">删除</button>
        </li>
      </ul>
      
      <div class="todo-stats">
        <p>已完成: {{ completedCount }} / {{ todoCount }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  
  data() {
    return {
      username: '',
      password: '',
      newTodoText: '',
      loginLoading: false
    }
  },
  
  computed: {
    // 直接访问 state
    count() {
      return this.$store.state.count
    },
    
    user() {
      return this.$store.state.user
    },
    
    todos() {
      return this.$store.state.todos
    },
    
    // 访问 getters
    isLoggedIn() {
      return this.$store.getters.isLoggedIn
    },
    
    todoCount() {
      return this.$store.getters.todoCount
    },
    
    completedCount() {
      return this.$store.getters.completedCount
    },
    
    completedTodos() {
      return this.$store.getters.completedTodos
    }
  },
  
  methods: {
    // 提交 mutation
    increment() {
      this.$store.commit('INCREMENT')
    },
    
    decrement() {
      this.$store.commit('DECREMENT')
    },
    
    incrementBy(amount) {
      this.$store.commit('INCREMENT', amount)
    },
    
    // 分发 action
    async handleLogin() {
      if (!this.username || !this.password) {
        alert('请输入用户名和密码')
        return
      }
      
      this.loginLoading = true
      
      try {
        await this.$store.dispatch('login', {
          username: this.username,
          password: this.password
        })
        
        // 清空表单
        this.username = ''
        this.password = ''
      } catch (error) {
        alert('登录失败: ' + error.message)
      } finally {
        this.loginLoading = false
      }
    },
    
    logout() {
      this.$store.dispatch('logout')
    },
    
    async addTodo() {
      if (!this.newTodoText.trim()) return
      
      try {
        await this.$store.dispatch('addTodo', this.newTodoText.trim())
        this.newTodoText = ''
      } catch (error) {
        alert('添加失败: ' + error.message)
      }
    },
    
    async toggleTodo(id) {
      const todo = this.todos.find(t => t.id === id)
      if (!todo) return
      
      try {
        await this.$store.dispatch('updateTodo', {
          id,
          updates: { completed: !todo.completed }
        })
      } catch (error) {
        alert('更新失败: ' + error.message)
      }
    },
    
    removeTodo(id) {
      if (confirm('确定要删除这个待办事项吗？')) {
        this.$store.commit('REMOVE_TODO', id)
      }
    }
  },
  
  // 组件创建时初始化
  created() {
    // 从本地存储恢复用户信息
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        this.$store.commit('SET_USER', user)
      } catch (error) {
        console.error('Failed to restore user from localStorage:', error)
        localStorage.removeItem('user')
      }
    }
  }
}
</script>

<style scoped>
.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.counter {
  text-align: center;
  margin-bottom: 30px;
}

.counter button {
  margin: 0 5px;
  padding: 5px 10px;
}

.user-info, .login-form {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.login-form input {
  margin-right: 10px;
  padding: 5px;
}

.todo-input {
  margin-bottom: 15px;
}

.todo-input input {
  width: 70%;
  padding: 5px;
  margin-right: 10px;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #999;
}

.todo-list li input[type="checkbox"] {
  margin-right: 10px;
}

.todo-list li span {
  flex: 1;
}

.todo-list li button {
  margin-left: 10px;
  padding: 2px 6px;
  font-size: 12px;
}

.todo-stats {
  margin-top: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}
</script>
```

### 3.2 Composition API 使用方式

```vue
<template>
  <div class="composition-example">
    <h2>Composition API 示例</h2>
    <p>计数: {{ count }}</p>
    <p>用户: {{ user?.name || '未登录' }}</p>
    <p>待办事项: {{ todoCount }}</p>
    
    <button @click="increment">增加</button>
    <button @click="login">模拟登录</button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'CompositionExample',
  
  setup() {
    const store = useStore()
    
    // 计算属性
    const count = computed(() => store.state.count)
    const user = computed(() => store.state.user)
    const todoCount = computed(() => store.getters.todoCount)
    
    // 方法
    const increment = () => {
      store.commit('INCREMENT')
    }
    
    const login = async () => {
      try {
        await store.dispatch('login', {
          username: 'demo',
          password: '123456'
        })
      } catch (error) {
        console.error('Login failed:', error)
      }
    }
    
    return {
      count,
      user,
      todoCount,
      increment,
      login
    }
  }
}
</script>
```

## 四、Store 结构

### 4.1 核心概念关系

```javascript
// Vuex 核心概念关系图
const vuexConcepts = {
  State: {
    role: '状态存储',
    access: '通过 this.$store.state 访问',
    rule: '只读，不能直接修改'
  },
  
  Getters: {
    role: '状态派生/计算',
    access: '通过 this.$store.getters 访问',
    feature: '类似 Vue 的 computed，有缓存'
  },
  
  Mutations: {
    role: '同步状态变更',
    trigger: '通过 this.$store.commit() 触发',
    rule: '必须是同步函数，用于状态变更追踪'
  },
  
  Actions: {
    role: '异步操作和业务逻辑',
    trigger: '通过 this.$store.dispatch() 触发',
    capability: '可以包含异步操作，最终通过 mutation 变更状态'
  },
  
  Modules: {
    role: '模块化管理',
    purpose: '拆分大型应用的状态管理',
    feature: '支持命名空间，避免命名冲突'
  }
}
```

### 4.2 数据流

```javascript
// Vuex 数据流示意
const vuexDataFlow = {
  // 1. 组件触发 Action
  component: 'dispatch(action)',
  
  // 2. Action 执行业务逻辑
  action: 'async logic → commit(mutation)',
  
  // 3. Mutation 同步变更状态
  mutation: 'state mutation',
  
  // 4. 状态变更通知组件
  state: 'trigger component update',
  
  // 5. 组件重新渲染
  render: 'component re-render'
}

// ASCII 流程图
/*
┌─────────────┐    dispatch    ┌─────────────┐
│             │ ──────────────>│             │
│  Component  │                │   Actions   │
│             │<────────────── │             │
└─────────────┘    render      └─────────────┘
       ^                              │
       │                              │ commit
       │                              v
┌─────────────┐                ┌─────────────┐
│             │<───────────────│             │
│    State    │    mutate      │  Mutations  │
│             │                │             │
└─────────────┘                └─────────────┘
*/
```

## 五、与其他状态管理对比

### 5.1 Vuex vs Pinia

```javascript
// Vuex vs Pinia 对比
const vuexVsPinia = {
  // 语法复杂度
  syntax: {
    vuex: '需要定义 mutations, actions, getters',
    pinia: '更简洁，类似 Options API 或 Composition API'
  },
  
  // TypeScript 支持
  typescript: {
    vuex: '需要额外配置，类型推断较弱',
    pinia: '原生 TypeScript 支持，类型推断强'
  },
  
  // 模块化
  modules: {
    vuex: '通过 modules 属性，需要命名空间',
    pinia: '每个 store 天然独立，无需命名空间'
  },
  
  // DevTools
  devtools: {
    vuex: 'Vue DevTools 支持',
    pinia: '更好的 DevTools 支持'
  },
  
  // Bundle Size
  bundleSize: {
    vuex: '较大，包含更多概念',
    pinia: '更小，更轻量'
  },
  
  // 学习曲线
  learningCurve: {
    vuex: '概念较多，需要理解 mutations/actions 区别',
    pinia: '更简单，更接近 Vue 3 风格'
  }
}
```

### 5.2 使用场景建议

```javascript
// 选择建议
const usageRecommendations = {
  useVuex: [
    'Vue 2 项目',
    '已有大型 Vuex 项目需要维护',
    '团队熟悉 Vuex 模式',
    '需要严格的状态变更追踪'
  ],
  
  usePinia: [
    'Vue 3 新项目',
    '需要更好的 TypeScript 支持',
    '团队偏好更简洁的API',
    '需要更好的开发体验'
  ],
  
  migration: [
    'Vuex 到 Pinia 的迁移是可行的',
    '建议新功能使用 Pinia',
    '旧模块可以逐步迁移'
  ]
}
```

## 参考资料

- [Vuex 官方文档](https://vuex.vuejs.org/)
- [Vue 2 状态管理](https://v2.vuejs.org/v2/guide/state-management.html)
- [Vue 3 + Vuex 4](https://next.vuex.vuejs.org/)
- [Vuex 最佳实践](https://vuex.vuejs.org/guide/best-practices.html)

**下一节** → [第 26 节：State 状态](./26-vuex-state.md)
