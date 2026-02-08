# 第 52 节：生态系统

## 概述

Vue 状态管理拥有丰富的生态系统，包括官方工具、社区插件、相关库等。了解生态系统有助于选择合适的工具和解决方案。

## 一、官方生态

### 1.1 Pinia 官方插件

**pinia-plugin-persistedstate**
```javascript
// 状态持久化插件
import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(createPersistedState())

// 使用
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    preferences: {}
  }),
  
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['name', 'preferences']
  }
})
```

**@pinia/nuxt**
```javascript
// Nuxt.js 集成
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate']
  }
})

// stores/counter.js
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  }
})

// 支持 HMR
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot))
}
```

### 1.2 Vue Router 集成

```javascript
// router/guards.js
import { useAuthStore } from '@/stores/auth'

export function setupRouterGuards(router) {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    
    // 检查认证状态
    if (!authStore.isAuthenticated) {
      await authStore.checkAuthStatus()
    }
    
    // 权限检查
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    if (to.meta.roles && !authStore.hasAnyRole(to.meta.roles)) {
      next('/forbidden')
      return
    }
    
    next()
  })
  
  // 全局后置钩子
  router.afterEach((to) => {
    const analyticsStore = useAnalyticsStore()
    analyticsStore.trackPageView(to.path)
  })
}
```

## 二、社区插件

### 2.1 状态管理增强

**pinia-plugin-history**
```javascript
// 历史记录插件
import { PiniaHistoryPlugin } from 'pinia-plugin-history'

const pinia = createPinia()
pinia.use(PiniaHistoryPlugin({
  maxHistoryLength: 50,
  serialize: JSON.stringify,
  deserialize: JSON.parse
}))

// 使用
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  
  actions: {
    increment() {
      this.count++
      this.$history.push() // 保存历史记录
    },
    
    undo() {
      this.$history.undo()
    },
    
    redo() {
      this.$history.redo()
    }
  },
  
  history: {
    enabled: true,
    maxLength: 20
  }
})
```

**pinia-plugin-logger**
```javascript
// 日志插件
import { createLogger } from 'pinia-plugin-logger'

const logger = createLogger({
  logActions: true,
  logMutations: true,
  loggedKeys: ['timestamp', 'action', 'prevState', 'nextState'],
  
  transformer: (logEntry) => ({
    ...logEntry,
    timestamp: new Date().toISOString()
  }),
  
  mutationTransformer: (mutation) => ({
    type: mutation.type,
    payload: mutation.payload
  })
})

pinia.use(logger)
```

### 2.2 开发工具集成

**@pinia/testing**
```javascript
// 测试工具
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'

describe('Component with Store', () => {
  it('should work with testing pinia', () => {
    const wrapper = mount(MyComponent, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              user: { name: 'Test User' }
            }
          })
        ]
      }
    })
    
    const store = useUserStore()
    expect(store.name).toBe('Test User')
  })
})
```

## 三、UI 库集成

### 3.1 Element Plus 集成

```vue
<!-- components/DataTable.vue -->
<template>
  <div>
    <el-table 
      :data="tableData" 
      :loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="editUser(scope.row)">编辑</el-button>
          <el-popconfirm 
            title="确定删除吗?" 
            @confirm="deleteUser(scope.row.id)"
          >
            <template #reference>
              <el-button type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const tableData = computed(() => userStore.paginatedUsers)
const loading = computed(() => userStore.loading)
const currentPage = computed({
  get: () => userStore.currentPage,
  set: (value) => userStore.setPage(value)
})
const pageSize = computed({
  get: () => userStore.pageSize,
  set: (value) => userStore.setPageSize(value)
})
const total = computed(() => userStore.totalUsers)

const handleSelectionChange = (selection) => {
  userStore.setSelectedUsers(selection)
}

const editUser = (user) => {
  userStore.setEditingUser(user)
}

const deleteUser = async (id) => {
  try {
    await userStore.deleteUser(id)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handlePageChange = (page) => {
  userStore.fetchUsers(page)
}
</script>
```

### 3.2 Vuetify 集成

```vue
<!-- components/UserManagement.vue -->
<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="users"
      :loading="loading"
      :server-items-length="totalItems"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      @update:options="updateOptions"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>用户管理</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openCreateDialog">
            <v-icon left>mdi-plus</v-icon>
            新增用户
          </v-btn>
        </v-toolbar>
      </template>
      
      <template v-slot:item.status="{ item }">
        <v-chip 
          :color="item.status === 'active' ? 'green' : 'red'"
          text-color="white"
          small
        >
          {{ item.status }}
        </v-chip>
      </template>
    </v-data-table>
    
    <!-- 创建/编辑对话框 -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editingUser ? '编辑用户' : '新增用户' }}</v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-text-field
              v-model="userForm.name"
              :rules="nameRules"
              label="姓名"
              required
            ></v-text-field>
            <v-text-field
              v-model="userForm.email"
              :rules="emailRules"
              label="邮箱"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">取消</v-btn>
          <v-btn color="primary" :disabled="!valid" @click="saveUser">
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const headers = [
  { title: '姓名', key: 'name' },
  { title: '邮箱', key: 'email' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'actions', sortable: false }
]

const users = computed(() => userStore.users)
const loading = computed(() => userStore.loading)
const totalItems = computed(() => userStore.totalUsers)
const page = computed({
  get: () => userStore.currentPage,
  set: (value) => userStore.setPage(value)
})
const itemsPerPage = computed({
  get: () => userStore.pageSize,
  set: (value) => userStore.setPageSize(value)
})

// 表单相关
const showDialog = ref(false)
const valid = ref(false)
const editingUser = computed(() => userStore.editingUser)
const userForm = ref({
  name: '',
  email: ''
})

const nameRules = [
  v => !!v || '姓名不能为空',
  v => v.length <= 50 || '姓名不能超过50个字符'
]

const emailRules = [
  v => !!v || '邮箱不能为空',
  v => /.+@.+\..+/.test(v) || '邮箱格式不正确'
]

const updateOptions = (options) => {
  userStore.updateTableOptions(options)
}

const openCreateDialog = () => {
  userStore.setEditingUser(null)
  userForm.value = { name: '', email: '' }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  userForm.value = { name: '', email: '' }
}

const saveUser = async () => {
  if (editingUser.value) {
    await userStore.updateUser({ ...editingUser.value, ...userForm.value })
  } else {
    await userStore.createUser(userForm.value)
  }
  closeDialog()
}
</script>
```

## 四、状态管理模式库

### 4.1 领域驱动设计模式

```javascript
// patterns/domain/User.js
export class User {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.email = data.email
    this.status = data.status || 'active'
    this.createdAt = new Date(data.createdAt || Date.now())
  }
  
  // 业务逻辑方法
  activate() {
    this.status = 'active'
  }
  
  deactivate() {
    this.status = 'inactive'
  }
  
  updateProfile(profile) {
    this.name = profile.name || this.name
    this.email = profile.email || this.email
  }
  
  // 验证方法
  isValid() {
    return this.name && this.email && this.validateEmail()
  }
  
  validateEmail() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)
  }
  
  // 序列化
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      status: this.status,
      createdAt: this.createdAt.toISOString()
    }
  }
}

// stores/userDomain.js
import { User } from '@/patterns/domain/User'

export const useUserDomainStore = defineStore('userDomain', {
  state: () => ({
    users: new Map(),
    loading: false,
    error: null
  }),
  
  getters: {
    activeUsers: (state) => {
      return Array.from(state.users.values())
        .filter(user => user.status === 'active')
    },
    
    getUserById: (state) => (id) => {
      return state.users.get(id)
    }
  },
  
  actions: {
    async createUser(userData) {
      const user = new User(userData)
      
      if (!user.isValid()) {
        throw new Error('Invalid user data')
      }
      
      try {
        this.loading = true
        const response = await api.post('/users', user.toJSON())
        const savedUser = new User(response.data)
        
        this.users.set(savedUser.id, savedUser)
        return savedUser
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateUser(id, updates) {
      const user = this.users.get(id)
      if (!user) {
        throw new Error('User not found')
      }
      
      user.updateProfile(updates)
      
      try {
        this.loading = true
        const response = await api.put(`/users/${id}`, user.toJSON())
        const updatedUser = new User(response.data)
        
        this.users.set(id, updatedUser)
        return updatedUser
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
```

### 4.2 命令查询分离 (CQRS) 模式

```javascript
// patterns/cqrs/commands.js
export class CreateUserCommand {
  constructor(userData) {
    this.userData = userData
    this.timestamp = new Date()
    this.id = `cmd-${Date.now()}`
  }
}

export class UpdateUserCommand {
  constructor(userId, updates) {
    this.userId = userId
    this.updates = updates
    this.timestamp = new Date()
    this.id = `cmd-${Date.now()}`
  }
}

// patterns/cqrs/commandHandlers.js
export class UserCommandHandler {
  constructor(store, eventBus) {
    this.store = store
    this.eventBus = eventBus
  }
  
  async handle(command) {
    switch (command.constructor.name) {
      case 'CreateUserCommand':
        return this.handleCreateUser(command)
      case 'UpdateUserCommand':
        return this.handleUpdateUser(command)
      default:
        throw new Error(`Unknown command: ${command.constructor.name}`)
    }
  }
  
  async handleCreateUser(command) {
    const user = await this.store.createUser(command.userData)
    
    this.eventBus.emit('UserCreated', {
      userId: user.id,
      userData: command.userData,
      timestamp: command.timestamp
    })
    
    return user
  }
  
  async handleUpdateUser(command) {
    const user = await this.store.updateUser(command.userId, command.updates)
    
    this.eventBus.emit('UserUpdated', {
      userId: command.userId,
      updates: command.updates,
      timestamp: command.timestamp
    })
    
    return user
  }
}

// patterns/cqrs/queries.js
export class GetUsersQuery {
  constructor(filters = {}) {
    this.filters = filters
    this.timestamp = new Date()
  }
}

export class GetUserByIdQuery {
  constructor(userId) {
    this.userId = userId
    this.timestamp = new Date()
  }
}

// patterns/cqrs/queryHandlers.js
export class UserQueryHandler {
  constructor(readStore) {
    this.readStore = readStore
  }
  
  async handle(query) {
    switch (query.constructor.name) {
      case 'GetUsersQuery':
        return this.handleGetUsers(query)
      case 'GetUserByIdQuery':
        return this.handleGetUserById(query)
      default:
        throw new Error(`Unknown query: ${query.constructor.name}`)
    }
  }
  
  async handleGetUsers(query) {
    return this.readStore.getUsers(query.filters)
  }
  
  async handleGetUserById(query) {
    return this.readStore.getUserById(query.userId)
  }
}
```

## 五、第三方集成

### 5.1 GraphQL 集成

```javascript
// apollo/client.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { useAuthStore } from '@/stores/auth'

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql'
})

const authLink = setContext((_, { headers }) => {
  const authStore = useAuthStore()
  const token = authStore.token
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === 'development'
})

// stores/apolloStore.js
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export const useApolloUserStore = defineStore('apolloUser', () => {
  const GET_USERS = gql`
    query GetUsers($first: Int, $after: String) {
      users(first: $first, after: $after) {
        edges {
          node {
            id
            name
            email
            status
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `
  
  const CREATE_USER = gql`
    mutation CreateUser($input: UserInput!) {
      createUser(input: $input) {
        id
        name
        email
        status
      }
    }
  `
  
  const { result, loading, error, fetchMore } = useQuery(GET_USERS, {
    first: 10
  })
  
  const { mutate: createUser } = useMutation(CREATE_USER)
  
  const users = computed(() => {
    return result.value?.users?.edges?.map(edge => edge.node) || []
  })
  
  const loadMore = () => {
    if (result.value?.users?.pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: result.value.users.pageInfo.endCursor
        }
      })
    }
  }
  
  return {
    users,
    loading,
    error,
    createUser,
    loadMore
  }
})
```

### 5.2 WebSocket 实时数据

```javascript
// plugins/websocket.js
import { useWebSocketStore } from '@/stores/websocket'

export class WebSocketPlugin {
  constructor(url, options = {}) {
    this.url = url
    this.options = options
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }
  
  install(app) {
    this.connect()
    
    app.config.globalProperties.$ws = this
    app.provide('websocket', this)
  }
  
  connect() {
    this.ws = new WebSocket(this.url)
    
    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
      
      const wsStore = useWebSocketStore()
      wsStore.setConnectionStatus('connected')
    }
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      
      const wsStore = useWebSocketStore()
      wsStore.setConnectionStatus('disconnected')
      
      this.reconnect()
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      
      const wsStore = useWebSocketStore()
      wsStore.setConnectionStatus('error')
    }
  }
  
  handleMessage(data) {
    const { type, payload } = data
    
    switch (type) {
      case 'USER_UPDATED':
        const userStore = useUserStore()
        userStore.updateUser(payload.id, payload.data)
        break
      case 'NOTIFICATION':
        const notificationStore = useNotificationStore()
        notificationStore.addNotification(payload)
        break
      default:
        console.warn('Unknown WebSocket message type:', type)
    }
  }
  
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
  
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++
        this.connect()
      }, Math.pow(2, this.reconnectAttempts) * 1000)
    }
  }
}

// stores/websocket.js
export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    connectionStatus: 'disconnected',
    lastMessage: null,
    messageHistory: []
  }),
  
  actions: {
    setConnectionStatus(status) {
      this.connectionStatus = status
    },
    
    addMessage(message) {
      this.lastMessage = message
      this.messageHistory.push({
        ...message,
        timestamp: new Date().toISOString()
      })
      
      // 保留最近100条消息
      if (this.messageHistory.length > 100) {
        this.messageHistory = this.messageHistory.slice(-100)
      }
    }
  }
})
```

## 参考资料

- [Pinia Ecosystem](https://pinia.vuejs.org/ecosystem.html)
- [Vue Router](https://router.vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Vuetify](https://vuetifyjs.com/)

**下一节** → [第 53 节：最佳实践总结](./53-best-practices.md)
