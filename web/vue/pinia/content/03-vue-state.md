# 第 03 节：Vue 中的状态

## 概述

在 Vue 应用中，状态可以存在于不同的层次和作用域。理解各种状态类型及其适用场景，有助于设计更合理的应用架构和选择合适的状态管理方案。

## 一、组件状态 (Component State)

### 1.1 本地状态

```vue
<template>
  <div>
    <h2>计数器: {{ count }}</h2>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
    
    <!-- 表单状态 -->
    <form @submit.prevent="handleSubmit">
      <input v-model="formData.name" placeholder="姓名">
      <input v-model="formData.email" placeholder="邮箱">
      <button type="submit" :disabled="!isFormValid">提交</button>
    </form>
    
    <!-- UI 状态 -->
    <div v-if="showDetails">
      详细信息...
    </div>
    <button @click="toggleDetails">
      {{ showDetails ? '隐藏' : '显示' }}详情
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// 简单状态
const count = ref(0)
const showDetails = ref(false)

// 复杂状态对象
const formData = reactive({
  name: '',
  email: ''
})

// 计算状态
const isFormValid = computed(() => {
  return formData.name.length > 0 && formData.email.includes('@')
})

// 状态操作方法
const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const handleSubmit = () => {
  if (isFormValid.value) {
    console.log('提交表单:', formData)
    // 重置表单
    Object.assign(formData, { name: '', email: '' })
  }
}
</script>
```

### 1.2 组件状态的特点

```javascript
// 组件状态的生命周期与组件绑定
const MyComponent = defineComponent({
  setup() {
    // 组件创建时初始化状态
    const localState = ref('initial value')
    
    onMounted(() => {
      console.log('组件挂载，状态值:', localState.value)
    })
    
    onUnmounted(() => {
      console.log('组件卸载，状态会被自动清理')
    })
    
    return { localState }
  }
})

// 状态隔离 - 每个组件实例有独立的状态
const Counter = defineComponent({
  setup() {
    const count = ref(0) // 每个 Counter 实例都有独立的 count
    
    return {
      count,
      increment: () => count.value++
    }
  }
})

// 多个 Counter 实例互不影响
// <Counter /> <!-- count: 0 -->
// <Counter /> <!-- count: 0 -->
```

### 1.3 什么时候使用组件状态

```vue
<!-- 适合使用组件状态的场景 -->
<template>
  <div>
    <!-- 1. UI 交互状态 -->
    <Modal :visible="modalVisible" @close="modalVisible = false">
      <p>模态框内容</p>
    </Modal>
    
    <!-- 2. 表单状态 -->
    <ContactForm @submit="handleContactSubmit" />
    
    <!-- 3. 组件内部逻辑状态 -->
    <DataTable :data="tableData" />
  </div>
</template>

<script setup>
// 1. 模态框显示状态 - 只影响当前组件
const modalVisible = ref(false)

// 2. 表单处理 - 业务逻辑涉及外部
const handleContactSubmit = (formData) => {
  // 这里可能需要调用 API 或更新全局状态
  api.submitContact(formData)
}

// 3. 表格数据 - 可能来自全局状态或 API
const tableData = ref([])
</script>
```

## 二、父子组件状态

### 2.1 Props 数据流

```vue
<!-- 父组件 -->
<template>
  <div>
    <h1>用户管理</h1>
    <UserProfile 
      :user="currentUser"
      :editable="isEditable"
      @update-user="handleUserUpdate"
    />
  </div>
</template>

<script setup>
const currentUser = ref({
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin'
})

const isEditable = ref(true)

const handleUserUpdate = (updatedUser) => {
  // 更新父组件状态
  currentUser.value = { ...currentUser.value, ...updatedUser }
  
  // 可能需要同步到服务器
  api.updateUser(currentUser.value)
}
</script>
```

```vue
<!-- 子组件 -->
<template>
  <div class="user-profile">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
    
    <div v-if="editable">
      <input v-model="localName" />
      <button @click="saveChanges">保存</button>
      <button @click="cancelChanges">取消</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update-user'])

// 本地编辑状态
const localName = ref('')

// 监听 props 变化
watch(() => props.user.name, (newName) => {
  localName.value = newName
}, { immediate: true })

const saveChanges = () => {
  emit('update-user', {
    name: localName.value
  })
}

const cancelChanges = () => {
  localName.value = props.user.name
}
</script>
```

### 2.2 v-model 双向绑定

```vue
<!-- 父组件 -->
<template>
  <div>
    <SearchBox v-model:query="searchQuery" v-model:filters="searchFilters" />
    <p>搜索: {{ searchQuery }}</p>
    <p>过滤器: {{ JSON.stringify(searchFilters) }}</p>
  </div>
</template>

<script setup>
const searchQuery = ref('')
const searchFilters = ref({
  category: '',
  priceRange: [0, 1000]
})
</script>
```

```vue
<!-- 子组件 SearchBox -->
<template>
  <div class="search-box">
    <input 
      :value="query" 
      @input="$emit('update:query', $event.target.value)"
      placeholder="搜索..."
    />
    
    <select 
      :value="filters.category"
      @change="updateFilter('category', $event.target.value)"
    >
      <option value="">所有分类</option>
      <option value="electronics">电子产品</option>
      <option value="books">图书</option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps({
  query: String,
  filters: Object
})

const emit = defineEmits(['update:query', 'update:filters'])

const updateFilter = (key, value) => {
  emit('update:filters', {
    ...props.filters,
    [key]: value
  })
}
</script>
```

## 三、跨层级状态共享

### 3.1 Provide/Inject

```vue
<!-- 祖先组件 -->
<template>
  <div class="app">
    <Toolbar />
    <MainContent />
    <StatusBar />
  </div>
</template>

<script setup>
import { provide, reactive } from 'vue'

// 应用级别的状态
const appState = reactive({
  user: {
    id: 1,
    name: 'Alice',
    role: 'admin'
  },
  theme: 'light',
  language: 'zh-CN',
  notifications: []
})

// 提供状态和操作方法
provide('appState', appState)

provide('appActions', {
  setTheme(theme) {
    appState.theme = theme
  },
  
  setLanguage(lang) {
    appState.language = lang
  },
  
  addNotification(message) {
    appState.notifications.push({
      id: Date.now(),
      message,
      timestamp: new Date()
    })
  },
  
  removeNotification(id) {
    const index = appState.notifications.findIndex(n => n.id === id)
    if (index > -1) {
      appState.notifications.splice(index, 1)
    }
  }
})
</script>
```

```vue
<!-- 深层子组件 -->
<template>
  <div class="theme-selector">
    <button 
      v-for="theme in themes" 
      :key="theme"
      :class="{ active: appState.theme === theme }"
      @click="setTheme(theme)"
    >
      {{ theme }}
    </button>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// 注入状态和操作
const appState = inject('appState')
const { setTheme } = inject('appActions')

const themes = ['light', 'dark', 'auto']
</script>
```

### 3.2 组合式函数 (Composables)

```javascript
// composables/useAuth.js
import { ref, computed, reactive } from 'vue'

// 全局状态
const authState = reactive({
  user: null,
  token: localStorage.getItem('auth_token'),
  permissions: []
})

export function useAuth() {
  // 计算属性
  const isAuthenticated = computed(() => !!authState.user)
  const isAdmin = computed(() => 
    authState.permissions.includes('admin')
  )
  
  // 操作方法
  const login = async (credentials) => {
    try {
      const response = await api.login(credentials)
      authState.user = response.user
      authState.token = response.token
      authState.permissions = response.permissions
      
      localStorage.setItem('auth_token', response.token)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const logout = () => {
    authState.user = null
    authState.token = null
    authState.permissions = []
    
    localStorage.removeItem('auth_token')
  }
  
  const checkPermission = (permission) => {
    return authState.permissions.includes(permission)
  }
  
  return {
    // 状态（只读）
    user: readonly(toRef(authState, 'user')),
    isAuthenticated,
    isAdmin,
    
    // 操作
    login,
    logout,
    checkPermission
  }
}
```

```vue
<!-- 在组件中使用 -->
<template>
  <div>
    <div v-if="isAuthenticated">
      <h1>欢迎, {{ user.name }}!</h1>
      <button v-if="isAdmin" @click="goToAdmin">管理后台</button>
      <button @click="logout">退出</button>
    </div>
    
    <LoginForm v-else @login="handleLogin" />
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { user, isAuthenticated, isAdmin, login, logout } = useAuth()

const handleLogin = async (credentials) => {
  const result = await login(credentials)
  
  if (!result.success) {
    alert('登录失败: ' + result.error)
  }
}

const goToAdmin = () => {
  // 路由跳转
  router.push('/admin')
}
</script>
```

## 四、全局状态

### 4.1 应用状态的特征

```javascript
// 全局状态通常包含：

// 1. 用户信息
const userState = {
  profile: null,
  preferences: {},
  permissions: []
}

// 2. 应用配置
const appConfig = {
  theme: 'light',
  language: 'zh-CN',
  apiBaseUrl: 'https://api.example.com'
}

// 3. 缓存数据
const dataCache = {
  users: new Map(),
  products: new Map(),
  lastUpdated: null
}

// 4. UI 状态
const uiState = {
  sidebarCollapsed: false,
  activeModal: null,
  loading: false,
  notifications: []
}
```

### 4.2 全局状态管理方案

```javascript
// 1. 简单的全局状态
// globalState.js
import { reactive } from 'vue'

export const globalState = reactive({
  user: null,
  theme: 'light',
  notifications: []
})

export const globalActions = {
  setUser(user) {
    globalState.user = user
  },
  
  setTheme(theme) {
    globalState.theme = theme
    document.documentElement.setAttribute('data-theme', theme)
  },
  
  addNotification(notification) {
    globalState.notifications.push({
      id: Date.now(),
      ...notification
    })
  }
}

// 在组件中使用
import { globalState, globalActions } from '@/state/globalState'

const MyComponent = defineComponent({
  setup() {
    return {
      globalState,
      ...globalActions
    }
  }
})
```

```javascript
// 2. 使用状态管理库
// store/user.js (Pinia)
export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const preferences = ref({})
  
  const isLoggedIn = computed(() => !!user.value)
  
  async function fetchUser(id) {
    const userData = await api.fetchUser(id)
    user.value = userData
  }
  
  function updatePreferences(newPrefs) {
    preferences.value = { ...preferences.value, ...newPrefs }
  }
  
  return {
    user,
    preferences,
    isLoggedIn,
    fetchUser,
    updatePreferences
  }
})

// store/app.js
export const useAppStore = defineStore('app', () => {
  const theme = ref('light')
  const language = ref('zh-CN')
  const sidebarCollapsed = ref(false)
  
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  function setTheme(newTheme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
  }
  
  return {
    theme,
    language,
    sidebarCollapsed,
    toggleSidebar,
    setTheme
  }
})
```

## 五、服务器状态

### 5.1 服务器状态的特点

```javascript
// 服务器状态具有以下特点：
// 1. 异步获取
// 2. 可能过时
// 3. 需要缓存策略
// 4. 需要错误处理

// 传统处理方式
export const useUserData = () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await api.fetchUsers()
      users.value = data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  return {
    users: readonly(users),
    loading: readonly(loading),
    error: readonly(error),
    fetchUsers,
    refetch: fetchUsers
  }
}
```

### 5.2 现代服务器状态管理

```javascript
// 使用 VueQuery 处理服务器状态
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

// 查询数据
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.fetchUsers(),
    staleTime: 5 * 60 * 1000, // 5 分钟内不重新获取
    cacheTime: 10 * 60 * 1000, // 缓存 10 分钟
  })
}

// 修改数据
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userData) => api.createUser(userData),
    onSuccess: () => {
      // 成功后刷新用户列表
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      // 错误处理
      console.error('创建用户失败:', error)
    }
  })
}

// 在组件中使用
const UserList = defineComponent({
  setup() {
    const { data: users, isLoading, error, refetch } = useUsers()
    const createUserMutation = useCreateUser()
    
    const handleCreateUser = async (userData) => {
      try {
        await createUserMutation.mutateAsync(userData)
        // 用户创建成功，列表会自动更新
      } catch (error) {
        // 处理错误
        alert('创建失败: ' + error.message)
      }
    }
    
    return {
      users,
      isLoading,
      error,
      refetch,
      handleCreateUser,
      isCreating: createUserMutation.isLoading
    }
  }
})
```

## 六、状态同步策略

### 6.1 乐观更新

```javascript
// 乐观更新示例
export const useOptimisticTodo = () => {
  const todos = ref([])
  
  const addTodoOptimistic = async (todoText) => {
    // 1. 立即更新 UI
    const optimisticTodo = {
      id: `temp-${Date.now()}`,
      text: todoText,
      completed: false,
      pending: true // 标记为待确认
    }
    
    todos.value.push(optimisticTodo)
    
    try {
      // 2. 发送请求
      const realTodo = await api.createTodo(todoText)
      
      // 3. 用真实数据替换乐观数据
      const index = todos.value.findIndex(t => t.id === optimisticTodo.id)
      if (index > -1) {
        todos.value[index] = realTodo
      }
    } catch (error) {
      // 4. 失败时回滚
      const index = todos.value.findIndex(t => t.id === optimisticTodo.id)
      if (index > -1) {
        todos.value.splice(index, 1)
      }
      
      throw error
    }
  }
  
  return {
    todos,
    addTodoOptimistic
  }
}
```

### 6.2 悲观更新

```javascript
// 悲观更新示例
export const usePessimisticTodo = () => {
  const todos = ref([])
  const loading = ref(false)
  
  const addTodo = async (todoText) => {
    loading.value = true
    
    try {
      // 先发送请求
      const newTodo = await api.createTodo(todoText)
      
      // 成功后更新 UI
      todos.value.push(newTodo)
      
      return newTodo
    } catch (error) {
      // 错误处理
      throw error
    } finally {
      loading.value = false
    }
  }
  
  return {
    todos,
    loading,
    addTodo
  }
}
```

## 七、状态持久化

### 7.1 本地存储

```javascript
// 自动持久化状态
export const usePersistentState = (key, defaultValue) => {
  const storedValue = localStorage.getItem(key)
  const state = ref(
    storedValue ? JSON.parse(storedValue) : defaultValue
  )
  
  // 监听状态变化并持久化
  watch(state, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })
  
  return state
}

// 使用示例
const userPreferences = usePersistentState('userPrefs', {
  theme: 'light',
  language: 'zh-CN'
})

// 状态变化会自动保存到 localStorage
userPreferences.value.theme = 'dark'
```

### 7.2 会话存储

```javascript
// 会话级别的状态
export const useSessionState = (key, defaultValue) => {
  const storedValue = sessionStorage.getItem(key)
  const state = ref(
    storedValue ? JSON.parse(storedValue) : defaultValue
  )
  
  watch(state, (newValue) => {
    sessionStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })
  
  // 页面刷新时恢复状态
  onMounted(() => {
    const stored = sessionStorage.getItem(key)
    if (stored) {
      state.value = JSON.parse(stored)
    }
  })
  
  return state
}

// 表单草稿自动保存
const formDraft = useSessionState('contactFormDraft', {
  name: '',
  email: '',
  message: ''
})
```

## 八、最佳实践

### 8.1 状态设计原则

```javascript
// 1. 最小化状态
// 不要存储可以计算出的值
const store = defineStore('products', () => {
  const products = ref([])
  
  // 不要存储 filteredProducts，而是计算它
  const filteredProducts = computed(() => {
    return products.value.filter(p => p.active)
  })
  
  return { products, filteredProducts }
})

// 2. 单一数据源
// 避免状态重复
const userStore = defineStore('user', () => {
  const user = ref(null)
  return { user }
})

// 其他地方不要再存储 user 信息
// 通过 computed 获取需要的数据
const userName = computed(() => userStore.user?.name)

// 3. 状态扁平化
// 好的设计
const state = {
  users: { 1: { id: 1, name: 'Alice' } },
  posts: { 1: { id: 1, authorId: 1, title: 'Post 1' } }
}

// 避免深层嵌套
const badState = {
  users: [
    { id: 1, posts: [{ title: 'Post 1' }] } // 嵌套太深
  ]
}
```

### 8.2 状态更新模式

```javascript
// 1. 批量更新
const batchUpdate = (updates) => {
  batch(() => {
    updates.forEach(update => {
      update()
    })
  })
}

// 2. 事务性更新
const updateUserProfile = async (userId, profileData) => {
  const originalUser = { ...getUser(userId) }
  
  try {
    // 乐观更新
    updateUserInState(userId, profileData)
    
    // 发送到服务器
    await api.updateUser(userId, profileData)
  } catch (error) {
    // 回滚到原始状态
    updateUserInState(userId, originalUser)
    throw error
  }
}

// 3. 防抖更新
import { debounce } from 'lodash-es'

const debouncedSave = debounce(async (data) => {
  await api.saveDraft(data)
}, 1000)

// 在表单输入时使用
watch(formData, (newData) => {
  debouncedSave(newData)
}, { deep: true })
```

## 参考资料

- [Vue 3 Reactivity](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [State Management](https://vuejs.org/guide/scaling-up/state-management.html)
- [VueQuery Documentation](https://vue-query.vercel.app/)

**下一节** → [第 04 节：状态共享方案](./04-state-sharing.md)
