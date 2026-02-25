# 3.4 TypeScript 集成

## 概述

Pinia 从设计之初就完全支持 TypeScript，提供了出色的类型推导和类型安全。无需额外配置，即可获得完整的类型提示。

## Store 的类型推导

### 自动类型推导

Pinia 会自动推导 State、Getters 和 Actions 的类型：

```typescript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null as number | null,
    name: '',
    age: 0,
    roles: [] as string[]
  }),
  
  getters: {
    // 自动推导返回类型为 string
    greeting: (state) => `Hello, ${state.name}!`,
    
    // 自动推导返回类型为 boolean
    isAdult: (state) => state.age >= 18,
    
    // 自动推导返回类型为 number
    roleCount(): number {
      return this.roles.length
    }
  },
  
  actions: {
    // 自动推导参数和返回类型
    updateName(name: string) {
      this.name = name
    },
    
    async fetchUser(id: number): Promise<void> {
      const response = await fetch(`/api/users/${id}`)
      const data = await response.json()
      this.id = data.id
      this.name = data.name
      this.age = data.age
    }
  }
})

// 使用时自动推导类型
const store = useUserStore()
store.name // 类型: string
store.age // 类型: number
store.greeting // 类型: string
store.isAdult // 类型: boolean
store.updateName('Alice') // ✅ 正确
store.updateName(123) // ❌ 类型错误
```

### Setup Store 类型推导

Setup Store 的类型推导更加直观：

```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  // State - 自动推导为 Ref<number>
  const count = ref(0)
  const name = ref('Counter')
  
  // Getter - 自动推导为 ComputedRef<number>
  const doubleCount = computed(() => count.value * 2)
  
  // Action - 自动推导参数和返回类型
  function increment(): void {
    count.value++
  }
  
  function incrementBy(amount: number): void {
    count.value += amount
  }
  
  return {
    count,
    name,
    doubleCount,
    increment,
    incrementBy
  }
})

// 使用
const store = useCounterStore()
store.count // 类型: number（自动解包 Ref）
store.doubleCount // 类型: number（自动解包 ComputedRef）
store.increment() // ✅
store.incrementBy(10) // ✅
store.incrementBy('10') // ❌ 类型错误
```

## 定义 State 类型

### 接口定义

使用接口明确定义 State 类型：

```typescript
interface UserState {
  id: number | null
  name: string
  email: string
  profile: {
    avatar: string
    bio: string
  }
  roles: string[]
  permissions: Set<string>
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: null,
    name: '',
    email: '',
    profile: {
      avatar: '',
      bio: ''
    },
    roles: [],
    permissions: new Set()
  })
})
```

### 类型断言

```typescript
interface Product {
  id: number
  name: string
  price: number
}

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Product[],
    selectedId: null as number | null,
    filters: {
      category: '' as string,
      priceRange: [0, 1000] as [number, number]
    }
  })
})
```

### 复杂类型

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error'

interface ApiResponse<T> {
  data: T
  message: string
  code: number
}

interface DataState<T> {
  items: T[]
  status: Status
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

export const useDataStore = defineStore('data', {
  state: (): DataState<Product> => ({
    items: [],
    status: 'idle',
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    }
  })
})
```

## 为 Getters 和 Actions 添加类型

### Getters 类型标注

```typescript
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[]
  }),
  
  getters: {
    // 显式返回类型
    total(): number {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },
    
    // 箭头函数 + 显式类型
    itemCount: (state): number => {
      return state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    
    // 返回函数的 getter
    getItemById: (state) => {
      return (id: number): CartItem | undefined => {
        return state.items.find(item => item.id === id)
      }
    },
    
    // 复杂类型
    summary(): CartSummary {
      return {
        itemCount: this.itemCount,
        total: this.total,
        discount: this.calculateDiscount(),
        finalTotal: this.total - this.calculateDiscount()
      }
    }
  }
})
```

### Actions 类型标注

```typescript
interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  token: string
  user: User
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as User | null
  }),
  
  actions: {
    // 显式参数和返回类型
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })
      
      if (!response.ok) {
        throw new Error('登录失败')
      }
      
      const data: LoginResponse = await response.json()
      this.token = data.token
      this.user = data.user
      
      return data
    },
    
    logout(): void {
      this.token = null
      this.user = null
    },
    
    // 可选参数
    updateProfile(updates: Partial<User>): void {
      if (this.user) {
        this.user = { ...this.user, ...updates }
      }
    }
  }
})
```

## 使用泛型增强类型安全

### 泛型 Store

```typescript
// 创建泛型 Store 工厂
function createEntityStore<T extends { id: number }>(name: string) {
  return defineStore(name, {
    state: () => ({
      items: [] as T[],
      loading: false,
      error: null as string | null
    }),
    
    getters: {
      getById: (state) => {
        return (id: number): T | undefined => {
          return state.items.find(item => item.id === id)
        }
      },
      
      count: (state): number => state.items.length
    },
    
    actions: {
      async fetchAll(): Promise<T[]> {
        this.loading = true
        this.error = null
        
        try {
          const response = await fetch(`/api/${name}`)
          const data: T[] = await response.json()
          this.items = data
          return data
        } catch (error) {
          this.error = (error as Error).message
          throw error
        } finally {
          this.loading = false
        }
      },
      
      add(item: T): void {
        this.items.push(item)
      },
      
      update(id: number, updates: Partial<T>): void {
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index] = { ...this.items[index], ...updates }
        }
      }
    }
  })
}

// 使用泛型工厂
interface User {
  id: number
  name: string
  email: string
}

interface Post {
  id: number
  title: string
  content: string
}

export const useUserStore = createEntityStore<User>('users')
export const usePostStore = createEntityStore<Post>('posts')

// 类型安全使用
const userStore = useUserStore()
userStore.add({ id: 1, name: 'Alice', email: 'alice@example.com' }) // ✅
userStore.add({ id: 1, title: 'Post' }) // ❌ 类型错误
```

### 泛型 Actions

```typescript
export const useApiStore = defineStore('api', {
  actions: {
    // 泛型 action
    async request<T>(url: string, options?: RequestInit): Promise<T> {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return response.json() as Promise<T>
    },
    
    async get<T>(endpoint: string): Promise<T> {
      return this.request<T>(`/api${endpoint}`)
    },
    
    async post<T, D = unknown>(endpoint: string, data: D): Promise<T> {
      return this.request<T>(`/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    }
  }
})

// 使用
const api = useApiStore()

interface User {
  id: number
  name: string
}

// 自动推导为 Promise<User>
const user = await api.get<User>('/users/1')

// 自动推导为 Promise<User>
const newUser = await api.post<User, { name: string }>('/users', {
  name: 'Alice'
})
```

## 常见 TypeScript 问题与解决

### 问题 1：State 类型丢失

```typescript
// ❌ 错误：类型推导为 never[]
state: () => ({
  items: []
})

// ✅ 正确：使用类型断言
state: () => ({
  items: [] as Product[]
})

// ✅ 正确：使用接口
interface State {
  items: Product[]
}

state: (): State => ({
  items: []
})
```

### 问题 2：Getter 中访问 this

```typescript
getters: {
  // ❌ 箭头函数无法访问 this
  summary: (state) => {
    return this.total // 错误：this 类型不正确
  },
  
  // ✅ 使用普通函数
  summary(): string {
    return `Total: ${this.total}`
  }
}
```

### 问题 3：Setup Store 返回类型

```typescript
export const useStore = defineStore('store', () => {
  const count = ref(0)
  
  function increment() {
    count.value++
  }
  
  // ✅ 显式声明返回类型
  return {
    count,
    increment
  } as const // 使用 const 断言保持精确类型
})
```

### 问题 4：跨 Store 类型

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null
  })
})

// stores/profile.ts
import { useAuthStore } from './auth'

export const useProfileStore = defineStore('profile', {
  getters: {
    userName(): string {
      const auth = useAuthStore()
      // ✅ 类型安全访问
      return auth.user?.name ?? 'Guest'
    }
  }
})
```

### 问题 5：插件类型扩展

```typescript
// plugins/api.ts
import { PiniaPluginContext } from 'pinia'
import axios, { AxiosInstance } from 'axios'

// 扩展 Pinia 类型
declare module 'pinia' {
  export interface PiniaCustomProperties {
    $api: AxiosInstance
  }
}

export function apiPlugin({ store }: PiniaPluginContext) {
  store.$api = axios.create({
    baseURL: '/api'
  })
}

// 使用时有完整类型提示
const store = useUserStore()
store.$api.get('/users') // ✅ 类型安全
```

## 关键点总结

1. **自动类型推导**：Pinia 自动推导 State、Getters、Actions 类型
2. **接口定义**：使用接口明确 State 结构
3. **类型标注**：为 Getters 和 Actions 添加显式类型
4. **泛型支持**：利用泛型创建可复用的 Store
5. **类型扩展**：通过模块声明扩展 Pinia 类型

## 深入一点

### 完整的 TypeScript Store 示例

```typescript
// types/todo.ts
export interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: number
}

export type TodoFilter = 'all' | 'active' | 'completed'

export interface TodoState {
  todos: Todo[]
  filter: TodoFilter
  nextId: number
}

// stores/todo.ts
import { defineStore } from 'pinia'
import type { Todo, TodoFilter, TodoState } from '@/types/todo'

export const useTodoStore = defineStore('todo', {
  state: (): TodoState => ({
    todos: [],
    filter: 'all',
    nextId: 1
  }),
  
  getters: {
    filteredTodos(state): Todo[] {
      switch (state.filter) {
        case 'active':
          return state.todos.filter(t => !t.completed)
        case 'completed':
          return state.todos.filter(t => t.completed)
        default:
          return state.todos
      }
    },
    
    stats(): { total: number; active: number; completed: number } {
      return {
        total: this.todos.length,
        active: this.todos.filter(t => !t.completed).length,
        completed: this.todos.filter(t => t.completed).length
      }
    }
  },
  
  actions: {
    addTodo(text: string): Todo {
      const todo: Todo = {
        id: this.nextId++,
        text,
        completed: false,
        createdAt: Date.now()
      }
      this.todos.push(todo)
      return todo
    },
    
    toggleTodo(id: number): void {
      const todo = this.todos.find(t => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    
    setFilter(filter: TodoFilter): void {
      this.filter = filter
    }
  }
})
```

### 类型守卫

```typescript
export const useDataStore = defineStore('data', {
  state: () => ({
    data: null as unknown
  }),
  
  actions: {
    // 类型守卫
    isUserData(data: unknown): data is User {
      return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'name' in data
      )
    },
    
    processData(): void {
      if (this.isUserData(this.data)) {
        // 这里 this.data 被推导为 User 类型
        console.log(this.data.name)
      }
    }
  }
})
```

## 参考资料

- [Pinia TypeScript 文档](https://pinia.vuejs.org/core-concepts/state.html#typescript)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vue 3 TypeScript 支持](https://vuejs.org/guide/typescript/overview.html)
