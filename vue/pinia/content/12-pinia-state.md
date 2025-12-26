# 第 12 节：State 状态

## 概述

State 是 Store 的核心，用于存储应用的响应式数据。在 Pinia 中，State 的定义和操作更加灵活和直观。本节将详细介绍如何定义、访问、修改和重置状态。

## 一、状态定义

### 1.1 Options API 中的 State

```javascript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  // state 必须是一个函数，返回初始状态对象
  state: () => ({
    // 基本类型
    id: null,
    name: '',
    age: 0,
    isActive: true,
    
    // 复杂类型
    profile: {
      avatar: '',
      bio: '',
      preferences: {
        theme: 'light',
        language: 'zh-CN'
      }
    },
    
    // 数组
    hobbies: [],
    friends: [],
    
    // 对象映射
    permissions: {},
    
    // UI 状态
    loading: false,
    error: null,
    lastUpdated: null
  })
})
```

### 1.2 Setup API 中的 State

```javascript
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 基本响应式状态
  const id = ref(null)
  const name = ref('')
  const age = ref(0)
  const isActive = ref(true)
  
  // 复杂对象状态
  const profile = reactive({
    avatar: '',
    bio: '',
    preferences: {
      theme: 'light',
      language: 'zh-CN'
    }
  })
  
  // 数组状态
  const hobbies = ref([])
  const friends = ref([])
  
  // Map/Set 等复杂数据结构
  const permissions = reactive(new Map())
  const tags = ref(new Set())
  
  // UI 状态
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)
  
  return {
    id, name, age, isActive,
    profile,
    hobbies, friends,
    permissions, tags,
    loading, error, lastUpdated
  }
})
```

## 二、状态访问

### 2.1 直接访问

```vue
<template>
  <div>
    <h1>{{ userStore.name }}</h1>
    <p>年龄: {{ userStore.age }}</p>
    <p>状态: {{ userStore.isActive ? '活跃' : '非活跃' }}</p>
    
    <!-- 嵌套对象访问 -->
    <div>
      <p>主题: {{ userStore.profile.preferences.theme }}</p>
      <img :src="userStore.profile.avatar" alt="头像" />
    </div>
    
    <!-- 数组访问 -->
    <ul>
      <li v-for="hobby in userStore.hobbies" :key="hobby">
        {{ hobby }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>
```

### 2.2 响应式解构访问

```vue
<template>
  <div>
    <h1>{{ name }}</h1>
    <p>年龄: {{ age }}</p>
    <p>爱好: {{ hobbies.join(', ') }}</p>
    
    <div v-if="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 使用 storeToRefs 保持响应性
const { 
  name, 
  age, 
  hobbies, 
  profile, 
  loading, 
  error 
} = storeToRefs(userStore)
</script>
```

## 三、状态修改

### 3.1 直接修改（推荐）

```vue
<template>
  <div>
    <input v-model="userStore.name" placeholder="姓名" />
    <input 
      v-model.number="userStore.age" 
      type="number" 
      placeholder="年龄" 
    />
    
    <label>
      <input 
        v-model="userStore.isActive" 
        type="checkbox"
      />
      是否活跃
    </label>
    
    <button @click="addHobby">添加爱好</button>
    <button @click="updateProfile">更新资料</button>
    <button @click="toggleTheme">切换主题</button>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const addHobby = () => {
  const hobby = prompt('请输入爱好:')
  if (hobby) {
    userStore.hobbies.push(hobby)
  }
}

const updateProfile = () => {
  // 直接修改嵌套对象
  userStore.profile.bio = '这是新的个人简介'
  userStore.profile.avatar = '/new-avatar.jpg'
  userStore.lastUpdated = new Date()
}

const toggleTheme = () => {
  // 修改深层嵌套属性
  const currentTheme = userStore.profile.preferences.theme
  userStore.profile.preferences.theme = currentTheme === 'light' ? 'dark' : 'light'
}
</script>
```

### 3.2 批量修改 $patch

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 对象形式的批量更新
const updateUserInfo = () => {
  userStore.$patch({
    name: '新姓名',
    age: 25,
    profile: {
      bio: '新的个人简介'
    }
  })
}

// 函数形式的批量更新（更复杂的逻辑）
const updateUserData = () => {
  userStore.$patch((state) => {
    state.name = '函数更新的姓名'
    state.age++
    state.hobbies.push('新爱好')
    
    // 复杂的条件更新
    if (state.profile.preferences.theme === 'light') {
      state.profile.preferences.theme = 'dark'
    }
    
    // 数组操作
    state.friends.splice(0, 1) // 删除第一个朋友
    state.lastUpdated = new Date()
  })
}

// 性能优化：批量更新避免多次触发响应式更新
const bulkUpdate = () => {
  userStore.$patch((state) => {
    // 这里的所有修改会被批量处理，只触发一次更新
    state.name = 'Batch Update'
    state.age = 30
    state.hobbies = ['reading', 'coding', 'music']
    state.profile.bio = 'Updated bio'
    state.isActive = true
  })
}
</script>
```

### 3.3 在 Actions 中修改状态

```javascript
export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null
  }),
  
  actions: {
    // 单个状态修改
    setLoading(loading) {
      this.loading = loading
    },
    
    // 复杂状态更新
    async fetchUser(userId) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.fetchUser(userId)
        
        // 修改多个状态
        this.currentUser = response.data
        this.lastUpdated = new Date()
        
        // 更新用户列表中的对应项
        const index = this.users.findIndex(u => u.id === userId)
        if (index > -1) {
          this.users[index] = response.data
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    // 使用 $patch 在 action 中批量更新
    updateUserProfile(profileData) {
      this.$patch({
        currentUser: {
          ...this.currentUser,
          ...profileData
        },
        lastUpdated: new Date()
      })
    },
    
    // 数组操作
    addUser(user) {
      this.users.push(user)
    },
    
    removeUser(userId) {
      const index = this.users.findIndex(u => u.id === userId)
      if (index > -1) {
        this.users.splice(index, 1)
      }
    },
    
    updateUser(userId, updates) {
      const user = this.users.find(u => u.id === userId)
      if (user) {
        Object.assign(user, updates)
      }
    }
  }
})
```

## 四、状态重置

### 4.1 完整重置 $reset

```vue
<template>
  <div>
    <p>姓名: {{ userStore.name }}</p>
    <p>年龄: {{ userStore.age }}</p>
    
    <button @click="resetUser">重置用户信息</button>
    <button @click="resetToDefault">重置为默认值</button>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 重置为初始状态
const resetUser = () => {
  userStore.$reset()
}

// Setup API 中需要手动实现 $reset
const useUserStoreWithReset = defineStore('user', () => {
  const name = ref('')
  const age = ref(0)
  const hobbies = ref([])
  
  // 初始状态
  const initialState = {
    name: '',
    age: 0,
    hobbies: []
  }
  
  // 手动重置函数
  function $reset() {
    name.value = initialState.name
    age.value = initialState.age
    hobbies.value = [...initialState.hobbies]
  }
  
  return {
    name, age, hobbies,
    $reset
  }
})
</script>
```

### 4.2 部分重置

```javascript
export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户数据
    id: null,
    name: '',
    email: '',
    
    // UI 状态
    loading: false,
    error: null,
    showModal: false
  }),
  
  actions: {
    // 重置用户数据，保留UI状态
    resetUserData() {
      this.$patch({
        id: null,
        name: '',
        email: ''
        // 不重置 loading, error, showModal
      })
    },
    
    // 重置UI状态，保留用户数据
    resetUIState() {
      this.$patch({
        loading: false,
        error: null,
        showModal: false
        // 不重置用户数据
      })
    },
    
    // 重置特定字段
    resetField(fieldName) {
      const initialState = this.$state.constructor()
      this[fieldName] = initialState[fieldName]
    }
  }
})
```

## 五、状态持久化

### 5.1 手动持久化

```javascript
export const useUserStore = defineStore('user', () => {
  // 从 localStorage 恢复状态
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem('user-state')
      return saved ? JSON.parse(saved) : getDefaultState()
    } catch {
      return getDefaultState()
    }
  }
  
  const getDefaultState = () => ({
    name: '',
    preferences: { theme: 'light' }
  })
  
  // 初始化状态
  const userData = reactive(getInitialState())
  
  // 监听状态变化并保存
  watch(
    userData,
    (newState) => {
      localStorage.setItem('user-state', JSON.stringify(newState))
    },
    { deep: true }
  )
  
  return { userData }
})
```

### 5.2 使用持久化插件

```javascript
// 安装 pinia-plugin-persistedstate
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Store 中启用持久化
export const useUserStore = defineStore('user', 
  () => {
    const name = ref('')
    const preferences = reactive({ theme: 'light' })
    
    return { name, preferences }
  },
  {
    persist: {
      // 自定义持久化配置
      key: 'user-storage',
      storage: sessionStorage, // 默认是 localStorage
      
      // 部分持久化
      paths: ['name', 'preferences.theme'],
      
      // 序列化配置
      serializer: {
        deserialize: JSON.parse,
        serialize: JSON.stringify
      }
    }
  }
)
```

## 六、复杂状态管理

### 6.1 规范化状态结构

```javascript
// 推荐：规范化的状态结构
export const useDataStore = defineStore('data', () => {
  // 实体存储（规范化）
  const users = ref(new Map()) // id -> user
  const posts = ref(new Map()) // id -> post
  const comments = ref(new Map()) // id -> comment
  
  // 关系映射
  const userPosts = ref(new Map()) // userId -> Set(postIds)
  const postComments = ref(new Map()) // postId -> Set(commentIds)
  
  // UI 状态
  const selectedUserId = ref(null)
  const currentPage = ref(1)
  
  // 添加用户
  function addUser(user) {
    users.value.set(user.id, user)
    if (!userPosts.value.has(user.id)) {
      userPosts.value.set(user.id, new Set())
    }
  }
  
  // 添加帖子
  function addPost(post) {
    posts.value.set(post.id, post)
    
    // 更新关系
    if (userPosts.value.has(post.authorId)) {
      userPosts.value.get(post.authorId).add(post.id)
    }
    
    if (!postComments.value.has(post.id)) {
      postComments.value.set(post.id, new Set())
    }
  }
  
  // 获取用户的帖子
  const getUserPosts = computed(() => (userId) => {
    const postIds = userPosts.value.get(userId) || new Set()
    return Array.from(postIds).map(id => posts.value.get(id)).filter(Boolean)
  })
  
  return {
    users, posts, comments,
    userPosts, postComments,
    selectedUserId, currentPage,
    addUser, addPost,
    getUserPosts
  }
})
```

### 6.2 状态派生和计算

```javascript
export const useShoppingStore = defineStore('shopping', () => {
  const items = ref([])
  const discounts = ref([])
  const taxRate = ref(0.08)
  const currency = ref('USD')
  
  // 基础计算
  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  
  // 折扣计算
  const totalDiscount = computed(() =>
    discounts.value.reduce((sum, discount) => {
      if (discount.type === 'percentage') {
        return sum + (subtotal.value * discount.value / 100)
      } else {
        return sum + discount.value
      }
    }, 0)
  )
  
  // 税费计算
  const tax = computed(() => 
    (subtotal.value - totalDiscount.value) * taxRate.value
  )
  
  // 最终总价
  const total = computed(() => 
    subtotal.value - totalDiscount.value + tax.value
  )
  
  // 格式化价格
  const formattedTotal = computed(() => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.value
    })
    return formatter.format(total.value)
  })
  
  // 统计信息
  const stats = computed(() => ({
    itemCount: items.value.length,
    totalQuantity: items.value.reduce((sum, item) => sum + item.quantity, 0),
    averageItemPrice: subtotal.value / items.value.length || 0,
    hasDiscounts: discounts.value.length > 0
  }))
  
  return {
    items, discounts, taxRate, currency,
    subtotal, totalDiscount, tax, total,
    formattedTotal, stats
  }
})
```

## 七、性能优化

### 7.1 大数据集优化

```javascript
export const useLargeDataStore = defineStore('largeData', () => {
  // 使用 shallowRef 避免深度响应式
  const largeDataset = shallowRef([])
  
  // 分页数据
  const pageSize = ref(100)
  const currentPage = ref(1)
  
  // 分页显示数据
  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return largeDataset.value.slice(start, end)
  })
  
  // 更新大数据集（替换整个引用）
  function updateDataset(newData) {
    largeDataset.value = newData
  }
  
  // 添加单个项目
  function addItem(item) {
    // 创建新数组而不是修改现有数组
    largeDataset.value = [...largeDataset.value, item]
  }
  
  // 删除项目
  function removeItem(id) {
    largeDataset.value = largeDataset.value.filter(item => item.id !== id)
  }
  
  return {
    largeDataset: readonly(largeDataset),
    pageSize, currentPage,
    paginatedData,
    updateDataset, addItem, removeItem
  }
})
```

### 7.2 状态更新优化

```javascript
export const useOptimizedStore = defineStore('optimized', () => {
  const items = ref([])
  
  // 批量更新函数
  function batchUpdate(updates) {
    // 使用 batch 函数（如果可用）或手动优化
    const newItems = [...items.value]
    
    updates.forEach(update => {
      const index = newItems.findIndex(item => item.id === update.id)
      if (index !== -1) {
        newItems[index] = { ...newItems[index], ...update }
      }
    })
    
    items.value = newItems
  }
  
  // 防抖更新
  const debouncedUpdate = debounce((id, data) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...data }
    }
  }, 300)
  
  return {
    items,
    batchUpdate,
    debouncedUpdate
  }
})
```

## 参考资料

- [Pinia State](https://pinia.vuejs.org/core-concepts/state.html)
- [Vue Reactivity](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [State Management Patterns](https://vuejs.org/guide/scaling-up/state-management.html)

**下一节** → [第 13 节：Getters 计算属性](./13-pinia-getters.md)
