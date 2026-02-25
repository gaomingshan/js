# 2.3 Actions 业务逻辑

## 概述

Actions 是 Store 中处理业务逻辑的方法，可以包含异步操作、复杂的状态修改逻辑。相比 Vuex，Pinia 取消了 `mutations`，所有状态修改都在 Actions 中完成。

## Actions 定义与调用

### 基本定义

Actions 是普通的函数方法：

```javascript
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    history: []
  }),
  
  actions: {
    // 同步 action
    increment() {
      this.count++
      this.history.push({ type: 'increment', value: this.count })
    },
    
    // 带参数的 action
    incrementBy(amount) {
      this.count += amount
      this.history.push({ type: 'incrementBy', value: this.count, amount })
    },
    
    // 复杂逻辑
    reset() {
      this.count = 0
      this.history = []
    }
  }
})
```

### 调用 Actions

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

// 直接调用
function handleClick() {
  counter.increment()
  counter.incrementBy(10)
}
</script>

<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <button @click="counter.increment">+1</button>
    <button @click="counter.incrementBy(5)">+5</button>
    <button @click="counter.reset">重置</button>
  </div>
</template>
```

## 异步 Actions 处理

### 基本异步操作

Actions 天然支持 `async/await`：

```javascript
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchUser(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/users/${id}`)
        if (!response.ok) throw new Error('请求失败')
        
        const data = await response.json()
        this.user = data
        return data
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

### 在组件中使用异步 Action

```vue
<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userId = ref(1)

async function loadUser() {
  try {
    await userStore.fetchUser(userId.value)
    console.log('用户加载成功')
  } catch (error) {
    console.error('加载失败:', error)
  }
}
</script>

<template>
  <div>
    <button @click="loadUser" :disabled="userStore.loading">
      {{ userStore.loading ? '加载中...' : '加载用户' }}
    </button>
    
    <div v-if="userStore.error">错误: {{ userStore.error }}</div>
    <div v-else-if="userStore.user">
      {{ userStore.user.name }}
    </div>
  </div>
</template>
```

### 多个异步操作

```javascript
actions: {
  // 并行执行
  async loadAllData() {
    this.loading = true
    
    try {
      const [users, posts, comments] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/posts').then(r => r.json()),
        fetch('/api/comments').then(r => r.json())
      ])
      
      this.users = users
      this.posts = posts
      this.comments = comments
    } catch (error) {
      this.error = error.message
    } finally {
      this.loading = false
    }
  },
  
  // 串行执行
  async initializeApp() {
    await this.fetchConfig()
    await this.authenticateUser()
    await this.loadUserData()
  }
}
```

## Actions 中访问 State 和 Getters

### 访问 State

通过 `this` 访问 State：

```javascript
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    discount: 0
  }),
  
  getters: {
    total: (state) => {
      return state.items.reduce((sum, item) => sum + item.price, 0)
    }
  },
  
  actions: {
    addItem(item) {
      // 访问 state
      this.items.push(item)
      
      // 访问 getter
      console.log('当前总价:', this.total)
      
      // 修改 state
      if (this.total > 1000) {
        this.discount = 0.1 // 满1000打9折
      }
    },
    
    removeItem(id) {
      const index = this.items.findIndex(item => item.id === id)
      if (index !== -1) {
        this.items.splice(index, 1)
      }
    }
  }
})
```

### 访问 Getters

```javascript
actions: {
  checkout() {
    // 访问 getters
    const finalPrice = this.total * (1 - this.discount)
    const itemCount = this.itemCount
    
    console.log(`结算 ${itemCount} 件商品，总价 ¥${finalPrice}`)
    
    // 业务逻辑...
  }
}
```

## 调用其他 Store 的 Actions

### 导入其他 Store

```javascript
import { useUserStore } from './user'
import { useLogStore } from './log'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: []
  }),
  
  actions: {
    async createOrder(orderData) {
      // 获取其他 Store
      const userStore = useUserStore()
      const logStore = useLogStore()
      
      // 检查用户权限
      if (!userStore.isLoggedIn) {
        throw new Error('请先登录')
      }
      
      // 创建订单
      const order = {
        ...orderData,
        userId: userStore.user.id,
        createdAt: Date.now()
      }
      
      this.orders.push(order)
      
      // 记录日志
      logStore.addLog('订单已创建', order)
      
      return order
    }
  }
})
```

### Store 间协作示例

```javascript
// stores/auth.js
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null
  }),
  
  actions: {
    async login(credentials) {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })
      const { token, user } = await response.json()
      
      this.token = token
      this.user = user
    },
    
    logout() {
      this.token = null
      this.user = null
    }
  }
})

// stores/cart.js
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', {
  actions: {
    async syncCart() {
      const authStore = useAuthStore()
      
      if (!authStore.token) {
        console.log('未登录，跳过同步')
        return
      }
      
      // 同步购物车到服务器
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(this.items)
      })
    }
  }
})
```

## Actions 的错误处理

### 基本错误处理

```javascript
actions: {
  async fetchData(id) {
    try {
      const response = await fetch(`/api/data/${id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      this.data = data
      return data
      
    } catch (error) {
      // 记录错误
      this.error = error.message
      
      // 可选：上报错误
      console.error('获取数据失败:', error)
      
      // 重新抛出，让调用者处理
      throw error
    }
  }
}
```

### 统一错误处理

```javascript
export const useApiStore = defineStore('api', {
  state: () => ({
    errors: []
  }),
  
  actions: {
    // 通用请求方法
    async request(url, options = {}) {
      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        })
        
        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`)
        }
        
        return await response.json()
        
      } catch (error) {
        // 统一错误处理
        this.errors.push({
          message: error.message,
          url,
          timestamp: Date.now()
        })
        
        throw error
      }
    }
  }
})

// 其他 Store 中使用
export const useUserStore = defineStore('user', {
  actions: {
    async loadUser(id) {
      const apiStore = useApiStore()
      const user = await apiStore.request(`/api/users/${id}`)
      this.user = user
    }
  }
})
```

### 重试机制

```javascript
actions: {
  async fetchWithRetry(url, maxRetries = 3) {
    let lastError
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url)
        return await response.json()
      } catch (error) {
        lastError = error
        console.log(`重试 ${i + 1}/${maxRetries}...`)
        
        // 等待后重试（指数退避）
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
      }
    }
    
    throw lastError
  }
}
```

## 关键点总结

1. **Actions 是普通函数**：可以是同步或异步
2. **直接修改 State**：无需 mutations，直接 `this.xxx = value`
3. **支持 async/await**：天然支持异步操作
4. **访问其他 Store**：导入后直接使用
5. **错误处理**：使用 try/catch，记录错误状态

## 深入一点

### Actions 返回值

Actions 可以返回任何值，包括 Promise：

```javascript
actions: {
  // 返回数据
  increment() {
    this.count++
    return this.count
  },
  
  // 返回 Promise
  async fetchData() {
    const data = await fetch('/api/data').then(r => r.json())
    this.data = data
    return data
  },
  
  // 返回布尔值
  addItem(item) {
    if (this.items.length >= 10) {
      return false // 已满
    }
    this.items.push(item)
    return true
  }
}

// 使用返回值
const newCount = store.increment()
const success = store.addItem(item)
const data = await store.fetchData()
```

### 订阅 Actions

```javascript
const store = useUserStore()

// 监听所有 actions
store.$onAction(({ name, args, after, onError }) => {
  console.log(`Action ${name} 开始，参数:`, args)
  
  after((result) => {
    console.log(`Action ${name} 完成，结果:`, result)
  })
  
  onError((error) => {
    console.error(`Action ${name} 失败:`, error)
  })
})
```

### TypeScript 类型支持

```typescript
interface UserState {
  users: User[]
  currentUser: User | null
}

interface User {
  id: number
  name: string
  email: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    currentUser: null
  }),
  
  actions: {
    // 参数和返回值都有类型
    async fetchUser(id: number): Promise<User> {
      const response = await fetch(`/api/users/${id}`)
      const user: User = await response.json()
      this.currentUser = user
      return user
    },
    
    addUser(user: User): void {
      this.users.push(user)
    }
  }
})
```

## 参考资料

- [Pinia Actions 文档](https://pinia.vuejs.org/core-concepts/actions.html)
- [JavaScript Async/Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
