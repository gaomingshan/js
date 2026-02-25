# 3.1 Store 组合与模块化

## 概述

Pinia 采用去中心化设计，每个 Store 都是独立的模块。本节介绍如何在多个 Store 之间进行组合、处理依赖关系，以及模块化组织的最佳实践。

## 跨 Store 访问与组合

### 基本跨 Store 访问

在一个 Store 中可以直接导入并使用另一个 Store：

```javascript
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    name: '',
    role: 'user' // 'user' | 'vip' | 'admin'
  }),
  
  getters: {
    isVip: (state) => state.role === 'vip',
    isAdmin: (state) => state.role === 'admin'
  }
})

// stores/cart.js
import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  
  getters: {
    // 访问 user Store 计算折扣
    discount() {
      const userStore = useUserStore()
      
      if (userStore.isAdmin) {
        return 0.5 // 管理员5折
      } else if (userStore.isVip) {
        return 0.8 // VIP 8折
      }
      return 1.0 // 无折扣
    },
    
    total() {
      const subtotal = this.items.reduce((sum, item) => sum + item.price, 0)
      return subtotal * this.discount
    }
  },
  
  actions: {
    async checkout() {
      const userStore = useUserStore()
      
      if (!userStore.id) {
        throw new Error('请先登录')
      }
      
      // 使用用户信息进行结算
      const order = {
        userId: userStore.id,
        userName: userStore.name,
        items: this.items,
        total: this.total
      }
      
      // 提交订单...
      return order
    }
  }
})
```

### Setup Store 中跨 Store 访问

```javascript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useProfileStore = defineStore('profile', () => {
  const bio = ref('')
  const avatar = ref('')
  
  // 在 computed 中访问其他 Store
  const displayName = computed(() => {
    const auth = useAuthStore()
    return auth.user?.name || '游客'
  })
  
  // 在 action 中访问其他 Store
  async function updateProfile(data) {
    const auth = useAuthStore()
    
    if (!auth.isAuthenticated) {
      throw new Error('未登录')
    }
    
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify(data)
    })
    
    const result = await response.json()
    bio.value = result.bio
    avatar.value = result.avatar
  }
  
  return {
    bio,
    avatar,
    displayName,
    updateProfile
  }
})
```

## Store 之间的依赖关系

### 单向依赖

最简单且推荐的模式：

```javascript
// stores/config.js - 基础 Store（无依赖）
export const useConfigStore = defineStore('config', {
  state: () => ({
    apiUrl: 'https://api.example.com',
    timeout: 5000
  })
})

// stores/api.js - 依赖 config
import { useConfigStore } from './config'

export const useApiStore = defineStore('api', {
  actions: {
    async request(endpoint) {
      const config = useConfigStore()
      
      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        timeout: config.timeout
      })
      
      return response.json()
    }
  }
})

// stores/user.js - 依赖 api
import { useApiStore } from './api'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: []
  }),
  
  actions: {
    async fetchUsers() {
      const api = useApiStore()
      this.users = await api.request('/users')
    }
  }
})
```

依赖关系图：
```
config (基础层)
  ↑
api (服务层)
  ↑
user (业务层)
```

### 多 Store 协作

实际应用中，多个 Store 需要协同工作：

```javascript
// stores/auth.js
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null
  }),
  
  actions: {
    async login(credentials) {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })
      
      const data = await response.json()
      this.user = data.user
      this.token = data.token
    },
    
    logout() {
      this.user = null
      this.token = null
    }
  }
})

// stores/cart.js
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  
  actions: {
    // 同步购物车到服务器
    async syncToServer() {
      const auth = useAuthStore()
      
      if (!auth.token) return
      
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(this.items)
      })
    }
  }
})

// stores/wishlist.js
import { useAuthStore } from './auth'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: []
  }),
  
  actions: {
    async syncToServer() {
      const auth = useAuthStore()
      
      if (!auth.token) return
      
      await fetch('/api/wishlist/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(this.items)
      })
    }
  }
})

// stores/app.js - 协调器
import { useAuthStore } from './auth'
import { useCartStore } from './cart'
import { useWishlistStore } from './wishlist'

export const useAppStore = defineStore('app', {
  actions: {
    // 用户登出时清理所有数据
    async logout() {
      const auth = useAuthStore()
      const cart = useCartStore()
      const wishlist = useWishlistStore()
      
      // 先同步数据
      await Promise.all([
        cart.syncToServer(),
        wishlist.syncToServer()
      ])
      
      // 再清理状态
      auth.logout()
      cart.$reset()
      wishlist.$reset()
    }
  }
})
```

## 循环依赖的处理

### 循环依赖问题

```javascript
// ❌ 错误：循环依赖
// stores/a.js
import { useBStore } from './b'

export const useAStore = defineStore('a', {
  actions: {
    doSomething() {
      const b = useBStore()
      b.doOther()
    }
  }
})

// stores/b.js
import { useAStore } from './a'

export const useBStore = defineStore('b', {
  actions: {
    doOther() {
      const a = useAStore()
      a.doSomething() // ❌ 循环依赖
    }
  }
})
```

### 解决方案 1：重构依赖关系

将共享逻辑提取到第三个 Store：

```javascript
// stores/shared.js
export const useSharedStore = defineStore('shared', {
  actions: {
    commonLogic() {
      // 共享逻辑
    }
  }
})

// stores/a.js
import { useSharedStore } from './shared'

export const useAStore = defineStore('a', {
  actions: {
    doSomething() {
      const shared = useSharedStore()
      shared.commonLogic()
    }
  }
})

// stores/b.js
import { useSharedStore } from './shared'

export const useBStore = defineStore('b', {
  actions: {
    doOther() {
      const shared = useSharedStore()
      shared.commonLogic()
    }
  }
})
```

### 解决方案 2：延迟导入

在函数内部导入，避免模块加载时的循环依赖：

```javascript
// stores/a.js
export const useAStore = defineStore('a', {
  actions: {
    async doSomething() {
      // 延迟导入
      const { useBStore } = await import('./b')
      const b = useBStore()
      b.doOther()
    }
  }
})
```

### 解决方案 3：事件总线

使用事件系统解耦 Store 之间的依赖：

```javascript
// utils/eventBus.js
import { ref } from 'vue'

const events = ref({})

export const eventBus = {
  on(event, callback) {
    if (!events.value[event]) {
      events.value[event] = []
    }
    events.value[event].push(callback)
  },
  
  emit(event, data) {
    if (events.value[event]) {
      events.value[event].forEach(callback => callback(data))
    }
  }
}

// stores/a.js
import { eventBus } from '@/utils/eventBus'

export const useAStore = defineStore('a', {
  actions: {
    doSomething() {
      // 发送事件，而不是直接调用 B
      eventBus.emit('a:something', { data: 'xxx' })
    }
  }
})

// stores/b.js
import { eventBus } from '@/utils/eventBus'

export const useBStore = defineStore('b', () => {
  // 监听事件
  eventBus.on('a:something', (data) => {
    console.log('收到事件:', data)
  })
  
  return {}
})
```

## 模块化组织最佳实践

### 目录结构

```
src/stores/
├── index.js              # 导出所有 Store
├── modules/              # Store 模块
│   ├── auth/            # 认证模块
│   │   ├── index.js
│   │   └── types.ts
│   ├── cart/            # 购物车模块
│   │   ├── index.js
│   │   └── helpers.js
│   └── user/            # 用户模块
│       ├── index.js
│       └── constants.js
└── shared/              # 共享 Store
    ├── app.js
    └── config.js
```

### 模块化示例

```javascript
// stores/modules/auth/index.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token')
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  
  actions: {
    async login(credentials) {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })
      
      const data = await response.json()
      this.user = data.user
      this.token = data.token
      
      localStorage.setItem('token', data.token)
    },
    
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})

// stores/modules/cart/index.js
import { defineStore } from 'pinia'
import { useAuthStore } from '../auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  
  getters: {
    total: (state) => {
      return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }
  },
  
  actions: {
    addItem(product) {
      const existing = this.items.find(item => item.id === product.id)
      
      if (existing) {
        existing.quantity++
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
      
      this.syncToServer()
    },
    
    async syncToServer() {
      const auth = useAuthStore()
      
      if (!auth.isAuthenticated) return
      
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(this.items)
      })
    }
  }
})

// stores/index.js - 统一导出
export { useAuthStore } from './modules/auth'
export { useCartStore } from './modules/cart'
export { useUserStore } from './modules/user'
export { useAppStore } from './shared/app'
export { useConfigStore } from './shared/config'

// 也可以导出 pinia 实例
import { createPinia } from 'pinia'
export const pinia = createPinia()
```

### 分层架构

```javascript
// 第一层：基础配置 Store
// stores/base/config.js
export const useConfigStore = defineStore('config', {
  state: () => ({
    apiUrl: import.meta.env.VITE_API_URL,
    appName: 'My App'
  })
})

// 第二层：服务层 Store
// stores/services/api.js
import { useConfigStore } from '../base/config'

export const useApiStore = defineStore('api', {
  actions: {
    async request(endpoint, options) {
      const config = useConfigStore()
      const response = await fetch(`${config.apiUrl}${endpoint}`, options)
      return response.json()
    }
  }
})

// 第三层：业务层 Store
// stores/features/user.js
import { useApiStore } from '../services/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: []
  }),
  actions: {
    async fetchUsers() {
      const api = useApiStore()
      this.users = await api.request('/users')
    }
  }
})
```

## 关键点总结

1. **直接导入使用**：在 Store 中直接 `import` 其他 Store
2. **单向依赖优先**：避免循环依赖，保持清晰的依赖层次
3. **延迟导入**：解决循环依赖的有效方式
4. **模块化组织**：按功能模块组织 Store 文件
5. **分层架构**：基础层 → 服务层 → 业务层

## 深入一点

### 组合式 Store 模式

将相关的 Store 组合成一个聚合 Store：

```javascript
// stores/ecommerce.js
import { useAuthStore } from './auth'
import { useCartStore } from './cart'
import { useOrderStore } from './order'
import { useProductStore } from './product'

export function useEcommerceStores() {
  const auth = useAuthStore()
  const cart = useCartStore()
  const order = useOrderStore()
  const product = useProductStore()
  
  return {
    auth,
    cart,
    order,
    product
  }
}

// 在组件中使用
import { useEcommerceStores } from '@/stores/ecommerce'

const stores = useEcommerceStores()
stores.auth.login()
stores.cart.addItem()
```

### Store 工厂模式

动态创建 Store 实例：

```javascript
// stores/factory/createEntityStore.js
import { defineStore } from 'pinia'

export function createEntityStore(entityName) {
  return defineStore(`${entityName}`, {
    state: () => ({
      items: [],
      loading: false,
      error: null
    }),
    
    actions: {
      async fetchAll() {
        this.loading = true
        try {
          const response = await fetch(`/api/${entityName}`)
          this.items = await response.json()
        } catch (error) {
          this.error = error.message
        } finally {
          this.loading = false
        }
      }
    }
  })
}

// 使用工厂创建多个 Store
export const useUserStore = createEntityStore('users')
export const usePostStore = createEntityStore('posts')
export const useCommentStore = createEntityStore('comments')
```

## 参考资料

- [Pinia 组合 Store](https://pinia.vuejs.org/core-concepts/#using-the-store)
- [JavaScript 模块系统](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [循环依赖问题](https://stackoverflow.com/questions/10869276/how-to-deal-with-cyclic-dependencies-in-node-js)
