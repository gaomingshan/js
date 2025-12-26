# 第 28 节：Mutations 变更

## 概述

Mutations 是 Vuex 中唯一能够修改状态的方式。每个 Mutation 都有一个字符串的事件类型和一个回调函数，这个回调函数就是实际进行状态更改的地方，并且接受 state 作为第一个参数。

## 一、基本用法

### 1.1 定义 Mutations

```javascript
// store/index.js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      count: 0,
      message: '',
      todos: [],
      user: null,
      isLoading: false
    }
  },
  
  mutations: {
    // 基本 mutation
    INCREMENT(state) {
      state.count++
    },
    
    DECREMENT(state) {
      state.count--
    },
    
    // 带载荷的 mutation
    INCREMENT_BY(state, amount) {
      state.count += amount
    },
    
    SET_MESSAGE(state, message) {
      state.message = message
    },
    
    // 对象载荷
    SET_USER(state, user) {
      state.user = user
    },
    
    // 数组操作
    ADD_TODO(state, todo) {
      state.todos.push({
        id: Date.now(),
        text: todo.text,
        completed: false,
        createdAt: new Date(),
        ...todo
      })
    },
    
    REMOVE_TODO(state, todoId) {
      const index = state.todos.findIndex(todo => todo.id === todoId)
      if (index > -1) {
        state.todos.splice(index, 1)
      }
    },
    
    UPDATE_TODO(state, { id, updates }) {
      const todo = state.todos.find(todo => todo.id === id)
      if (todo) {
        Object.assign(todo, updates)
      }
    },
    
    TOGGLE_TODO(state, todoId) {
      const todo = state.todos.find(todo => todo.id === todoId)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    
    // 清空操作
    CLEAR_TODOS(state) {
      state.todos = []
    },
    
    // 批量操作
    SET_TODOS(state, todos) {
      state.todos = todos
    },
    
    // 加载状态
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading
    },
    
    // 重置状态
    RESET_STATE(state) {
      state.count = 0
      state.message = ''
      state.todos = []
      state.user = null
      state.isLoading = false
    }
  }
})

export default store
```

### 1.2 提交 Mutations

```vue
<template>
  <div class="mutations-example">
    <h2>Mutations 示例</h2>
    
    <!-- 计数器 -->
    <div class="counter">
      <p>计数: {{ $store.state.count }}</p>
      <button @click="increment">增加</button>
      <button @click="decrement">减少</button>
      <button @click="incrementBy(5)">增加5</button>
      <button @click="reset">重置</button>
    </div>
    
    <!-- 消息输入 -->
    <div class="message-input">
      <input v-model="newMessage" placeholder="输入消息" />
      <button @click="setMessage">设置消息</button>
      <p>当前消息: {{ $store.state.message }}</p>
    </div>
    
    <!-- 待办事项 -->
    <div class="todo-section">
      <h3>待办事项</h3>
      <div class="add-todo">
        <input v-model="newTodoText" placeholder="添加待办..." />
        <button @click="addTodo">添加</button>
      </div>
      
      <ul class="todo-list">
        <li v-for="todo in $store.state.todos" :key="todo.id" 
            :class="{ completed: todo.completed }">
          <span @click="toggleTodo(todo.id)">{{ todo.text }}</span>
          <button @click="removeTodo(todo.id)">删除</button>
        </li>
      </ul>
      
      <button @click="clearAllTodos">清空所有</button>
    </div>
    
    <!-- 用户信息 -->
    <div class="user-section">
      <h3>用户信息</h3>
      <div v-if="$store.state.user">
        <p>姓名: {{ $store.state.user.name }}</p>
        <p>邮箱: {{ $store.state.user.email }}</p>
        <button @click="logout">退出登录</button>
      </div>
      <div v-else>
        <button @click="login">模拟登录</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MutationsExample',
  
  data() {
    return {
      newMessage: '',
      newTodoText: ''
    }
  },
  
  methods: {
    // 基本提交
    increment() {
      this.$store.commit('INCREMENT')
    },
    
    decrement() {
      this.$store.commit('DECREMENT')
    },
    
    // 带载荷提交
    incrementBy(amount) {
      this.$store.commit('INCREMENT_BY', amount)
    },
    
    setMessage() {
      this.$store.commit('SET_MESSAGE', this.newMessage)
      this.newMessage = ''
    },
    
    // 对象风格提交
    addTodo() {
      if (this.newTodoText.trim()) {
        this.$store.commit({
          type: 'ADD_TODO',
          text: this.newTodoText.trim()
        })
        this.newTodoText = ''
      }
    },
    
    removeTodo(id) {
      this.$store.commit('REMOVE_TODO', id)
    },
    
    toggleTodo(id) {
      this.$store.commit('TOGGLE_TODO', id)
    },
    
    clearAllTodos() {
      this.$store.commit('CLEAR_TODOS')
    },
    
    login() {
      this.$store.commit('SET_USER', {
        name: 'John Doe',
        email: 'john@example.com',
        id: 1
      })
    },
    
    logout() {
      this.$store.commit('SET_USER', null)
    },
    
    reset() {
      this.$store.commit('RESET_STATE')
    }
  }
}
</script>

<style scoped>
.mutations-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.counter, .message-input, .todo-section, .user-section {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.counter button, .message-input button {
  margin: 0 5px;
}

.add-todo {
  margin-bottom: 15px;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.todo-list li.completed span {
  text-decoration: line-through;
  opacity: 0.6;
}

.todo-list li span {
  cursor: pointer;
  flex: 1;
}
</style>
```

## 二、使用 mapMutations 辅助函数

### 2.1 基本映射

```vue
<template>
  <div class="map-mutations-example">
    <h2>MapMutations 示例</h2>
    
    <div class="counter">
      <p>计数: {{ $store.state.count }}</p>
      <!-- 使用映射的方法 -->
      <button @click="increment">增加</button>
      <button @click="decrement">减少</button>
      <button @click="incrementBy(10)">增加10</button>
      <button @click="add(3)">增加3</button>
    </div>
    
    <div class="form-section">
      <input v-model="message" placeholder="输入消息" />
      <button @click="updateMessage">更新消息</button>
      
      <input v-model="userName" placeholder="用户名" />
      <button @click="setUserInfo">设置用户</button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'MapMutationsExample',
  
  data() {
    return {
      message: '',
      userName: ''
    }
  },
  
  methods: {
    // 数组语法：方法名与 mutation 类型相同
    ...mapMutations([
      'INCREMENT',    // 映射 this.INCREMENT() 为 this.$store.commit('INCREMENT')
      'DECREMENT',
      'INCREMENT_BY',
      'RESET_STATE'
    ]),
    
    // 对象语法：重命名方法
    ...mapMutations({
      add: 'INCREMENT_BY',        // 映射 this.add(amount) 为 this.$store.commit('INCREMENT_BY', amount)
      setMessage: 'SET_MESSAGE',
      setUser: 'SET_USER'
    }),
    
    // 包装的方法
    increment() {
      this.INCREMENT() // 调用映射的 mutation
    },
    
    decrement() {
      this.DECREMENT()
    },
    
    incrementBy(amount) {
      this.INCREMENT_BY(amount)
    },
    
    updateMessage() {
      this.setMessage(this.message)
      this.message = ''
    },
    
    setUserInfo() {
      this.setUser({
        name: this.userName,
        email: `${this.userName}@example.com`
      })
      this.userName = ''
    }
  }
}
</script>
```

### 2.2 模块化 Mutations 映射

```javascript
// store/modules/user.js
export default {
  namespaced: true,
  
  state() {
    return {
      profile: null,
      preferences: {
        theme: 'light',
        language: 'zh'
      }
    }
  },
  
  mutations: {
    SET_PROFILE(state, profile) {
      state.profile = profile
    },
    
    UPDATE_PROFILE(state, updates) {
      if (state.profile) {
        Object.assign(state.profile, updates)
      }
    },
    
    SET_PREFERENCE(state, { key, value }) {
      state.preferences[key] = value
    },
    
    RESET_PREFERENCES(state) {
      state.preferences = {
        theme: 'light',
        language: 'zh'
      }
    }
  }
}
```

```vue
<template>
  <div class="module-mutations">
    <h2>模块 Mutations</h2>
    
    <div class="profile-section">
      <h3>用户资料</h3>
      <input v-model="name" placeholder="姓名" />
      <input v-model="email" placeholder="邮箱" />
      <button @click="saveProfile">保存资料</button>
      <button @click="updateName">只更新姓名</button>
    </div>
    
    <div class="preferences-section">
      <h3>用户偏好</h3>
      <select v-model="selectedTheme" @change="changeTheme">
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
      
      <select v-model="selectedLanguage" @change="changeLanguage">
        <option value="zh">中文</option>
        <option value="en">英文</option>
      </select>
      
      <button @click="resetPrefs">重置偏好</button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'ModuleMutations',
  
  data() {
    return {
      name: '',
      email: '',
      selectedTheme: 'light',
      selectedLanguage: 'zh'
    }
  },
  
  methods: {
    // 映射模块的 mutations
    ...mapMutations('user', [
      'SET_PROFILE',
      'UPDATE_PROFILE',
      'SET_PREFERENCE',
      'RESET_PREFERENCES'
    ]),
    
    // 重命名模块 mutations
    ...mapMutations('user', {
      resetPrefs: 'RESET_PREFERENCES'
    }),
    
    saveProfile() {
      this.SET_PROFILE({
        name: this.name,
        email: this.email,
        updatedAt: new Date()
      })
      this.clearForm()
    },
    
    updateName() {
      this.UPDATE_PROFILE({ name: this.name })
      this.name = ''
    },
    
    changeTheme() {
      this.SET_PREFERENCE({
        key: 'theme',
        value: this.selectedTheme
      })
    },
    
    changeLanguage() {
      this.SET_PREFERENCE({
        key: 'language',
        value: this.selectedLanguage
      })
    },
    
    clearForm() {
      this.name = ''
      this.email = ''
    }
  }
}
</script>
```

## 三、Mutations 设计模式

### 3.1 常量类型

```javascript
// store/mutation-types.js
// 导出常量
export const INCREMENT = 'INCREMENT'
export const DECREMENT = 'DECREMENT'
export const SET_USER = 'SET_USER'
export const ADD_TODO = 'ADD_TODO'
export const REMOVE_TODO = 'REMOVE_TODO'
export const UPDATE_TODO = 'UPDATE_TODO'
export const SET_LOADING = 'SET_LOADING'
export const SET_ERROR = 'SET_ERROR'

// store/index.js
import * as types from './mutation-types'

const store = createStore({
  state() {
    return {
      count: 0,
      user: null,
      todos: [],
      loading: false,
      error: null
    }
  },
  
  mutations: {
    // 使用常量类型
    [types.INCREMENT](state) {
      state.count++
    },
    
    [types.DECREMENT](state) {
      state.count--
    },
    
    [types.SET_USER](state, user) {
      state.user = user
    },
    
    [types.ADD_TODO](state, todo) {
      state.todos.push(todo)
    },
    
    [types.REMOVE_TODO](state, id) {
      const index = state.todos.findIndex(todo => todo.id === id)
      if (index > -1) {
        state.todos.splice(index, 1)
      }
    },
    
    [types.UPDATE_TODO](state, { id, updates }) {
      const todo = state.todos.find(todo => todo.id === id)
      if (todo) {
        Object.assign(todo, updates)
      }
    },
    
    [types.SET_LOADING](state, loading) {
      state.loading = loading
    },
    
    [types.SET_ERROR](state, error) {
      state.error = error
    }
  }
})
```

### 3.2 规范化 Mutations

```javascript
// 规范化的 mutation 模式
const normalizedMutations = {
  mutations: {
    // 1. SET_ 前缀用于设置状态
    SET_USERS(state, users) {
      state.users = users
    },
    
    SET_CURRENT_USER(state, user) {
      state.currentUser = user
    },
    
    // 2. ADD_ 前缀用于添加单项
    ADD_USER(state, user) {
      state.users.push(user)
    },
    
    // 3. UPDATE_ 前缀用于更新
    UPDATE_USER(state, { id, updates }) {
      const index = state.users.findIndex(user => user.id === id)
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...updates }
      }
    },
    
    // 4. REMOVE_ 前缀用于删除
    REMOVE_USER(state, userId) {
      const index = state.users.findIndex(user => user.id === userId)
      if (index !== -1) {
        state.users.splice(index, 1)
      }
    },
    
    // 5. CLEAR_ 前缀用于清空
    CLEAR_USERS(state) {
      state.users = []
    },
    
    // 6. TOGGLE_ 前缀用于切换布尔值
    TOGGLE_SIDEBAR(state) {
      state.ui.sidebarOpen = !state.ui.sidebarOpen
    },
    
    // 7. RESET_ 前缀用于重置
    RESET_FILTERS(state) {
      state.filters = {
        category: '',
        search: '',
        sortBy: 'name'
      }
    }
  }
}
```

### 3.3 复杂状态更新

```javascript
// 处理复杂状态更新的 mutations
const complexMutations = {
  mutations: {
    // 深度更新对象
    UPDATE_USER_PROFILE(state, { userId, profileData }) {
      const user = state.users.find(u => u.id === userId)
      if (user) {
        user.profile = {
          ...user.profile,
          ...profileData,
          updatedAt: new Date().toISOString()
        }
      }
    },
    
    // 批量操作
    BATCH_UPDATE_TODOS(state, updates) {
      updates.forEach(({ id, changes }) => {
        const todo = state.todos.find(t => t.id === id)
        if (todo) {
          Object.assign(todo, changes)
        }
      })
    },
    
    // 排序操作
    SORT_TODOS(state, { field, order = 'asc' }) {
      state.todos.sort((a, b) => {
        const aVal = a[field]
        const bVal = b[field]
        
        if (order === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    },
    
    // 过滤后的批量操作
    MARK_COMPLETED_TODOS(state, completed = true) {
      state.todos
        .filter(todo => todo.completed !== completed)
        .forEach(todo => {
          todo.completed = completed
          todo.updatedAt = new Date().toISOString()
        })
    },
    
    // 嵌套数组操作
    ADD_COMMENT_TO_POST(state, { postId, comment }) {
      const post = state.posts.find(p => p.id === postId)
      if (post) {
        if (!post.comments) {
          post.comments = []
        }
        post.comments.push({
          ...comment,
          id: Date.now(),
          createdAt: new Date().toISOString()
        })
      }
    },
    
    // 关系数据更新
    UPDATE_USER_POSTS(state, { userId, postIds }) {
      // 更新用户的文章列表
      const userPostsIndex = state.userPosts.findIndex(up => up.userId === userId)
      
      if (userPostsIndex !== -1) {
        state.userPosts[userPostsIndex].postIds = postIds
      } else {
        state.userPosts.push({ userId, postIds })
      }
      
      // 更新文章的作者信息
      postIds.forEach(postId => {
        const post = state.posts.find(p => p.id === postId)
        if (post) {
          post.authorId = userId
        }
      })
    }
  }
}
```

## 四、Mutations 最佳实践

### 4.1 保持纯函数

```javascript
// ✅ 正确：纯函数 mutation
const goodMutations = {
  mutations: {
    ADD_TODO(state, todo) {
      state.todos.push({
        ...todo,
        id: Date.now(), // 可接受的副作用
        completed: false
      })
    },
    
    SET_USER_DATA(state, userData) {
      state.user = { ...userData }
    }
  }
}

// ❌ 错误：包含异步操作
const badMutations = {
  mutations: {
    // ❌ 不要在 mutation 中进行异步操作
    async BAD_FETCH_USER(state, userId) {
      const user = await api.fetchUser(userId) // 异步操作
      state.user = user
    },
    
    // ❌ 不要在 mutation 中访问外部变量
    BAD_UPDATE_TIME(state) {
      state.currentTime = new Date() // 非确定性
    },
    
    // ❌ 不要在 mutation 中调用其他 mutation
    BAD_COMPLEX_UPDATE(state) {
      this.commit('SET_LOADING', true) // 不要这样做
      state.data = newData
    }
  }
}
```

### 4.2 状态不可变性

```javascript
// 确保状态不可变性的 mutations
const immutableMutations = {
  mutations: {
    // ✅ 正确：创建新对象
    UPDATE_USER(state, updates) {
      state.user = {
        ...state.user,
        ...updates,
        updatedAt: new Date().toISOString()
      }
    },
    
    // ✅ 正确：创建新数组
    ADD_TAG(state, tag) {
      state.tags = [...state.tags, tag]
    },
    
    // ✅ 正确：更新数组中的对象
    UPDATE_TODO(state, { id, updates }) {
      const index = state.todos.findIndex(todo => todo.id === id)
      if (index !== -1) {
        state.todos = [
          ...state.todos.slice(0, index),
          { ...state.todos[index], ...updates },
          ...state.todos.slice(index + 1)
        ]
      }
    },
    
    // ✅ 正确：深度更新嵌套对象
    UPDATE_USER_PREFERENCES(state, { key, value }) {
      state.user = {
        ...state.user,
        preferences: {
          ...state.user.preferences,
          [key]: value
        }
      }
    }
  }
}
```

### 4.3 错误处理

```javascript
// 带错误处理的 mutations
const errorHandlingMutations = {
  mutations: {
    SET_ERROR(state, { module, error }) {
      if (!state.errors[module]) {
        state.errors[module] = []
      }
      
      state.errors[module].push({
        message: error.message,
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : null
      })
    },
    
    CLEAR_ERROR(state, module) {
      if (state.errors[module]) {
        delete state.errors[module]
      }
    },
    
    // 带验证的 mutation
    SET_USER_EMAIL(state, email) {
      // 基本验证
      if (typeof email !== 'string' || !email.includes('@')) {
        console.error('Invalid email format:', email)
        return
      }
      
      if (state.user) {
        state.user.email = email.toLowerCase().trim()
      }
    },
    
    // 安全的数组操作
    SAFE_REMOVE_ITEM(state, { collection, id }) {
      if (!state[collection] || !Array.isArray(state[collection])) {
        console.error(`Collection ${collection} not found or not an array`)
        return
      }
      
      const index = state[collection].findIndex(item => item.id === id)
      if (index !== -1) {
        state[collection].splice(index, 1)
      }
    }
  }
}
```

## 五、调试和测试

### 5.1 Mutation 测试

```javascript
// mutations.test.js
import { describe, it, expect } from 'vitest'
import mutations from '@/store/mutations'

describe('Store Mutations', () => {
  it('should increment count', () => {
    const state = { count: 0 }
    mutations.INCREMENT(state)
    expect(state.count).toBe(1)
  })
  
  it('should increment by amount', () => {
    const state = { count: 5 }
    mutations.INCREMENT_BY(state, 3)
    expect(state.count).toBe(8)
  })
  
  it('should add todo', () => {
    const state = { todos: [] }
    const todo = { text: 'Test todo' }
    
    mutations.ADD_TODO(state, todo)
    
    expect(state.todos).toHaveLength(1)
    expect(state.todos[0].text).toBe('Test todo')
    expect(state.todos[0].completed).toBe(false)
    expect(state.todos[0].id).toBeDefined()
  })
  
  it('should update todo', () => {
    const state = {
      todos: [
        { id: 1, text: 'Old text', completed: false }
      ]
    }
    
    mutations.UPDATE_TODO(state, {
      id: 1,
      updates: { text: 'New text', completed: true }
    })
    
    expect(state.todos[0].text).toBe('New text')
    expect(state.todos[0].completed).toBe(true)
  })
  
  it('should handle non-existent todo update gracefully', () => {
    const state = { todos: [] }
    
    // 不应该抛出错误
    expect(() => {
      mutations.UPDATE_TODO(state, {
        id: 999,
        updates: { text: 'New text' }
      })
    }).not.toThrow()
    
    expect(state.todos).toHaveLength(0)
  })
})
```

### 5.2 Mutation 调试

```javascript
// 调试增强的 mutations
const debugMutations = (mutations) => {
  const wrappedMutations = {}
  
  Object.keys(mutations).forEach(key => {
    wrappedMutations[key] = (state, payload) => {
      if (process.env.NODE_ENV === 'development') {
        console.group(`🔄 Mutation: ${key}`)
        console.log('Payload:', payload)
        console.log('State before:', JSON.parse(JSON.stringify(state)))
      }
      
      const result = mutations[key](state, payload)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('State after:', JSON.parse(JSON.stringify(state)))
        console.groupEnd()
      }
      
      return result
    }
  })
  
  return wrappedMutations
}

// 使用调试包装
const store = createStore({
  state: () => ({ count: 0 }),
  mutations: debugMutations({
    INCREMENT(state) {
      state.count++
    }
  })
})
```

## 参考资料

- [Vuex Mutations 文档](https://vuex.vuejs.org/guide/mutations.html)
- [Mutation 必须是同步函数](https://vuex.vuejs.org/guide/mutations.html#mutations-must-be-synchronous-functions)
- [mapMutations 辅助函数](https://vuex.vuejs.org/guide/mutations.html#committing-mutations-in-components)

**下一节** → [第 29 节：Actions 动作](./29-vuex-actions.md)
