# 第 04 节：状态共享方案

## 概述

在 Vue 应用中，组件间的状态共享是常见需求。从简单的 Props/Events 到复杂的状态管理库，不同方案适用于不同的场景。理解各种共享方案的优缺点，有助于选择最合适的解决方案。

## 一、Props 和 Events

### 1.1 基本用法

```vue
<!-- 父组件 -->
<template>
  <div>
    <h1>用户列表</h1>
    <UserFilter 
      :filters="currentFilters"
      @update-filters="handleFiltersUpdate"
    />
    <UserList 
      :users="filteredUsers"
      :loading="loading"
      @select-user="handleUserSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentFilters = ref({
  role: '',
  status: 'active'
})

const users = ref([])
const loading = ref(false)

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    if (currentFilters.value.role && user.role !== currentFilters.value.role) {
      return false
    }
    if (user.status !== currentFilters.value.status) {
      return false
    }
    return true
  })
})

const handleFiltersUpdate = (newFilters) => {
  currentFilters.value = { ...currentFilters.value, ...newFilters }
}

const handleUserSelect = (user) => {
  console.log('选中用户:', user)
}
</script>
```

### 1.2 优缺点分析

```javascript
// 优点：
// 1. 简单直观，易于理解
// 2. 数据流清晰，便于调试
// 3. 组件解耦，可复用性强

// 缺点：
// 1. 层级过深时需要逐层传递（Props Drilling）
// 2. 兄弟组件通信复杂
// 3. 状态管理分散，难以维护

// 适用场景：
// - 父子组件直接通信
// - 组件层级不超过 3 层
// - 状态相对简单
```

## 二、v-model 双向绑定

### 2.1 单值绑定

```vue
<!-- 自定义输入组件 -->
<template>
  <div class="custom-input">
    <label>{{ label }}</label>
    <input 
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  label: String,
  placeholder: String
})

defineEmits(['update:modelValue'])
</script>
```

```vue
<!-- 使用组件 -->
<template>
  <form>
    <CustomInput 
      v-model="form.username"
      label="用户名"
      placeholder="请输入用户名"
    />
    <CustomInput 
      v-model="form.email"
      label="邮箱"
      placeholder="请输入邮箱"
    />
  </form>
</template>

<script setup>
const form = reactive({
  username: '',
  email: ''
})
</script>
```

### 2.2 多值绑定

```vue
<!-- 复杂表单组件 -->
<template>
  <div class="user-form">
    <input 
      :value="user.name"
      @input="updateUser('name', $event.target.value)"
      placeholder="姓名"
    />
    <input 
      :value="user.email"
      @input="updateUser('email', $event.target.value)"
      placeholder="邮箱"
    />
    <select 
      :value="user.role"
      @change="updateUser('role', $event.target.value)"
    >
      <option value="user">普通用户</option>
      <option value="admin">管理员</option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:user'])

const updateUser = (field, value) => {
  emit('update:user', {
    ...props.user,
    [field]: value
  })
}
</script>
```

## 三、Provide/Inject

### 3.1 基本使用

```vue
<!-- 祖先组件 -->
<template>
  <div class="app">
    <Header />
    <Router />
    <Footer />
  </div>
</template>

<script setup>
import { provide, reactive, readonly } from 'vue'

// 应用状态
const appState = reactive({
  theme: 'light',
  language: 'zh-CN',
  user: null
})

// 应用操作
const appActions = {
  setTheme(theme) {
    appState.theme = theme
    localStorage.setItem('theme', theme)
  },
  
  setLanguage(lang) {
    appState.language = lang
    localStorage.setItem('language', lang)
  },
  
  setUser(user) {
    appState.user = user
  }
}

// 提供只读状态和操作方法
provide('appState', readonly(appState))
provide('appActions', appActions)
</script>
```

```vue
<!-- 后代组件 -->
<template>
  <div class="theme-switcher">
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

const appState = inject('appState')
const { setTheme } = inject('appActions')

const themes = ['light', 'dark']
</script>
```

### 3.2 类型安全的 Provide/Inject

```typescript
// types/injection-keys.ts
import type { InjectionKey, Ref } from 'vue'

export interface AppState {
  theme: string
  language: string
  user: User | null
}

export interface AppActions {
  setTheme(theme: string): void
  setLanguage(lang: string): void
  setUser(user: User): void
}

export const appStateKey: InjectionKey<Readonly<AppState>> = Symbol('appState')
export const appActionsKey: InjectionKey<AppActions> = Symbol('appActions')
```

```vue
<!-- 提供方 -->
<script setup lang="ts">
import { provide, reactive, readonly } from 'vue'
import { appStateKey, appActionsKey } from '@/types/injection-keys'

const appState = reactive<AppState>({
  theme: 'light',
  language: 'zh-CN',
  user: null
})

const appActions: AppActions = {
  setTheme(theme: string) {
    appState.theme = theme
  },
  setLanguage(lang: string) {
    appState.language = lang
  },
  setUser(user: User) {
    appState.user = user
  }
}

provide(appStateKey, readonly(appState))
provide(appActionsKey, appActions)
</script>
```

```vue
<!-- 注入方 -->
<script setup lang="ts">
import { inject } from 'vue'
import { appStateKey, appActionsKey } from '@/types/injection-keys'

const appState = inject(appStateKey)!
const appActions = inject(appActionsKey)!

// 现在有完整的类型支持
</script>
```

## 四、Event Bus

### 4.1 传统 Event Bus

```javascript
// utils/eventBus.js
import mitt from 'mitt'

// 创建事件总线
export const eventBus = mitt()

// 事件类型定义
export const Events = {
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  NOTIFICATION_SHOW: 'notification:show',
  THEME_CHANGE: 'theme:change'
}
```

```vue
<!-- 发送事件的组件 -->
<template>
  <button @click="login">登录</button>
</template>

<script setup>
import { eventBus, Events } from '@/utils/eventBus'

const login = async () => {
  try {
    const user = await api.login(credentials)
    
    // 发送登录成功事件
    eventBus.emit(Events.USER_LOGIN, user)
  } catch (error) {
    console.error('登录失败:', error)
  }
}
</script>
```

```vue
<!-- 监听事件的组件 -->
<template>
  <div v-if="user">
    欢迎, {{ user.name }}!
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { eventBus, Events } from '@/utils/eventBus'

const user = ref(null)

const handleUserLogin = (userData) => {
  user.value = userData
}

const handleUserLogout = () => {
  user.value = null
}

onMounted(() => {
  // 监听事件
  eventBus.on(Events.USER_LOGIN, handleUserLogin)
  eventBus.on(Events.USER_LOGOUT, handleUserLogout)
})

onUnmounted(() => {
  // 清理监听器
  eventBus.off(Events.USER_LOGIN, handleUserLogin)
  eventBus.off(Events.USER_LOGOUT, handleUserLogout)
})
</script>
```

### 4.2 组合式 Event Bus

```javascript
// composables/useEventBus.js
import mitt from 'mitt'
import { getCurrentInstance, onUnmounted } from 'vue'

const emitter = mitt()

export function useEventBus() {
  const instance = getCurrentInstance()
  const listeners = new Set()
  
  const on = (event, handler) => {
    emitter.on(event, handler)
    listeners.add({ event, handler })
  }
  
  const off = (event, handler) => {
    emitter.off(event, handler)
    listeners.delete({ event, handler })
  }
  
  const emit = (event, payload) => {
    emitter.emit(event, payload)
  }
  
  // 自动清理
  if (instance) {
    onUnmounted(() => {
      listeners.forEach(({ event, handler }) => {
        emitter.off(event, handler)
      })
      listeners.clear()
    })
  }
  
  return {
    on,
    off,
    emit
  }
}
```

## 五、组合式函数 (Composables)

### 5.1 状态共享的 Composable

```javascript
// composables/useSharedCounter.js
import { ref } from 'vue'

// 共享状态（模块级别）
const count = ref(0)

export function useSharedCounter() {
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  const reset = () => {
    count.value = 0
  }
  
  // 返回响应式状态和操作方法
  return {
    count: readonly(count), // 只读，防止外部直接修改
    increment,
    decrement,
    reset
  }
}
```

```vue
<!-- 使用共享状态的组件A -->
<template>
  <div>
    <p>计数: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup>
import { useSharedCounter } from '@/composables/useSharedCounter'

const { count, increment } = useSharedCounter()
</script>
```

```vue
<!-- 使用共享状态的组件B -->
<template>
  <div>
    <p>当前值: {{ count }}</p>
    <button @click="decrement">-1</button>
    <button @click="reset">重置</button>
  </div>
</template>

<script setup>
import { useSharedCounter } from '@/composables/useSharedCounter'

const { count, decrement, reset } = useSharedCounter()
</script>
```

### 5.2 复杂状态管理的 Composable

```javascript
// composables/useUserManager.js
import { ref, reactive, computed } from 'vue'

// 共享状态
const users = ref([])
const currentUser = ref(null)
const loading = ref(false)
const error = ref(null)

export function useUserManager() {
  // 计算属性
  const isLoggedIn = computed(() => !!currentUser.value)
  const userCount = computed(() => users.value.length)
  
  // 操作方法
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
  
  const login = async (credentials) => {
    try {
      const user = await api.login(credentials)
      currentUser.value = user
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }
  
  const logout = () => {
    currentUser.value = null
  }
  
  const addUser = (user) => {
    users.value.push(user)
  }
  
  const removeUser = (userId) => {
    const index = users.value.findIndex(u => u.id === userId)
    if (index > -1) {
      users.value.splice(index, 1)
    }
  }
  
  return {
    // 状态
    users: readonly(users),
    currentUser: readonly(currentUser),
    loading: readonly(loading),
    error: readonly(error),
    
    // 计算属性
    isLoggedIn,
    userCount,
    
    // 操作方法
    fetchUsers,
    login,
    logout,
    addUser,
    removeUser
  }
}
```

## 六、状态管理库

### 6.1 轻量级状态管理

```javascript
// store/simpleStore.js
import { reactive, readonly } from 'vue'

// 创建响应式状态
const state = reactive({
  count: 0,
  user: null,
  theme: 'light'
})

// 操作方法
const actions = {
  increment() {
    state.count++
  },
  
  setUser(user) {
    state.user = user
  },
  
  setTheme(theme) {
    state.theme = theme
  }
}

// 导出只读状态和操作
export const store = {
  state: readonly(state),
  ...actions
}
```

### 6.2 Pinia 状态管理

```javascript
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  return { count, doubleCount, increment }
})
```

```vue
<!-- 使用 Pinia store -->
<template>
  <div>
    <p>计数: {{ counter.count }}</p>
    <p>双倍: {{ counter.doubleCount }}</p>
    <button @click="counter.increment">+1</button>
  </div>
</template>

<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>
```

## 七、方案对比与选择

### 7.1 复杂度对比

```javascript
// 1. Props/Events - 最简单
// 适用：2-3层组件，简单数据传递

// 2. v-model - 简单
// 适用：表单组件，双向绑定

// 3. Provide/Inject - 中等
// 适用：跨多层级的配置或上下文

// 4. Event Bus - 中等
// 适用：解耦的组件通信

// 5. Composables - 中等到复杂
// 适用：逻辑复用和状态共享

// 6. 状态管理库 - 复杂
// 适用：大型应用，复杂状态管理
```

### 7.2 性能对比

```javascript
// 性能测试示例
const performanceTest = {
  // Props传递 - 性能最好
  propsPerformance: '★★★★★',
  
  // Provide/Inject - 性能良好
  provideInjectPerformance: '★★★★☆',
  
  // Event Bus - 性能一般（需要注意内存泄漏）
  eventBusPerformance: '★★★☆☆',
  
  // 状态管理库 - 性能优化程度取决于实现
  stateManagementPerformance: '★★★★☆'
}
```

### 7.3 选择决策树

```javascript
const chooseStateSolution = (requirements) => {
  if (requirements.componentLevels <= 2) {
    return 'Props/Events'
  }
  
  if (requirements.needTwoWayBinding) {
    return 'v-model'
  }
  
  if (requirements.crossComponentLevels && !requirements.complexLogic) {
    return 'Provide/Inject'
  }
  
  if (requirements.decoupledCommunication) {
    return 'Event Bus'
  }
  
  if (requirements.logicReuse || requirements.moderateComplexity) {
    return 'Composables'
  }
  
  if (requirements.largeApp || requirements.complexStateManagement) {
    return 'State Management Library'
  }
  
  return 'Props/Events' // 默认最简单方案
}
```

## 八、最佳实践

### 8.1 渐进式采用

```javascript
// 阶段1：使用 Props/Events
const Stage1Component = {
  // 简单的父子通信
}

// 阶段2：引入 Provide/Inject
const Stage2App = {
  // 跨层级的配置共享
}

// 阶段3：使用 Composables
const Stage3Logic = {
  // 逻辑复用和状态共享
}

// 阶段4：引入状态管理库
const Stage4Store = {
  // 复杂的全局状态管理
}
```

### 8.2 混合使用策略

```vue
<!-- 实际项目中的混合使用 -->
<template>
  <div>
    <!-- Props 传递简单数据 -->
    <UserAvatar :user="currentUser" />
    
    <!-- v-model 双向绑定 -->
    <SearchBox v-model="searchQuery" />
    
    <!-- Event Bus 解耦通信 -->
    <NotificationCenter />
    
    <!-- 状态管理库处理复杂状态 -->
    <ProductList />
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useEventBus } from '@/composables/useEventBus'

// 混合使用不同的状态管理方案
const userStore = useUserStore()
const { currentUser } = storeToRefs(userStore)

const searchQuery = ref('')
const { emit } = useEventBus()
</script>
```

## 参考资料

- [Vue Component Communication](https://vuejs.org/guide/components/events.html)
- [Provide/Inject](https://vuejs.org/guide/components/provide-inject.html)
- [Composition API](https://vuejs.org/guide/reusability/composables.html)
- [State Management Patterns](https://vuejs.org/guide/scaling-up/state-management.html)

**下一节** → [第 05 节：Pinia vs Vuex](./05-pinia-vs-vuex.md)
