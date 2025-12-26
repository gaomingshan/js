# 第 18 节：TypeScript 支持

## 概述

Pinia 提供了出色的 TypeScript 支持，包括完整的类型推断、类型安全的 Store 定义和使用。本节将详细介绍如何在 TypeScript 项目中使用 Pinia，以及如何充分利用其类型系统。

## 一、基础类型定义

### 1.1 Options API 类型推断

```typescript
import { defineStore } from 'pinia'

// 接口定义
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  preferences: {
    theme: 'light' | 'dark'
    language: string
  }
}

interface UserState {
  currentUser: User | null
  users: User[]
  loading: boolean
  error: string | null
}

// Options API Store 自动类型推断
export const useUserStore = defineStore('user', {
  // State 类型推断
  state: (): UserState => ({
    currentUser: null,
    users: [],
    loading: false,
    error: null
  }),
  
  // Getters 类型推断
  getters: {
    // 返回类型自动推断为 boolean
    isLoggedIn: (state): boolean => !!state.currentUser,
    
    // 返回类型自动推断为 string
    userDisplayName: (state): string => {
      return state.currentUser?.name || '未登录用户'
    },
    
    // 参数化 getter，返回函数类型
    getUserById: (state) => {
      return (id: number): User | undefined => {
        return state.users.find(user => user.id === id)
      }
    },
    
    // 访问其他 getters
    adminUsers(): User[] {
      return this.users.filter(user => user.role === 'admin')
    }
  },
  
  // Actions 类型推断
  actions: {
    // 同步 action
    setUser(user: User): void {
      this.currentUser = user
      this.error = null
    },
    
    // 异步 action，返回 Promise
    async fetchUser(id: number): Promise<User> {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/users/${id}`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const user: User = await response.json()
        this.currentUser = user
        return user
      } catch (error) {
        this.error = error instanceof Error ? error.message : '未知错误'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 带返回值类型的 action
    async login(credentials: { username: string; password: string }): Promise<{
      success: boolean
      user?: User
      error?: string
    }> {
      // 实现登录逻辑
      try {
        const user = await this.fetchUser(1) // 示例
        return { success: true, user }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : '登录失败'
        }
      }
    }
  }
})

// Store 类型导出
export type UserStore = ReturnType<typeof useUserStore>
```

### 1.2 Setup API 类型定义

```typescript
import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'

// 产品相关类型
interface Product {
  id: number
  name: string
  price: number
  category: string
  tags: string[]
  inStock: boolean
  createdAt: Date
  updatedAt: Date
}

interface ProductFilters {
  category: string
  priceRange: [number, number]
  inStockOnly: boolean
  searchQuery: string
}

interface ProductStats {
  total: number
  inStock: number
  outOfStock: number
  averagePrice: number
  categories: string[]
}

// Setup API Store 明确类型
export const useProductStore = defineStore('product', () => {
  // 状态类型定义
  const products = ref<Product[]>([])
  const filters = reactive<ProductFilters>({
    category: '',
    priceRange: [0, 1000],
    inStockOnly: false,
    searchQuery: ''
  })
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  
  // 计算属性类型推断
  const filteredProducts = computed<Product[]>(() => {
    let result = products.value
    
    if (filters.category) {
      result = result.filter(p => p.category === filters.category)
    }
    
    if (filters.inStockOnly) {
      result = result.filter(p => p.inStock)
    }
    
    if (filters.searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )
    }
    
    return result.filter(p => 
      p.price >= filters.priceRange[0] && 
      p.price <= filters.priceRange[1]
    )
  })
  
  const productStats = computed<ProductStats>(() => {
    const prods = products.value
    return {
      total: prods.length,
      inStock: prods.filter(p => p.inStock).length,
      outOfStock: prods.filter(p => !p.inStock).length,
      averagePrice: prods.reduce((sum, p) => sum + p.price, 0) / prods.length || 0,
      categories: [...new Set(prods.map(p => p.category))]
    }
  })
  
  // Actions 类型定义
  async function fetchProducts(): Promise<Product[]> {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      
      const data: Product[] = await response.json()
      products.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取产品失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      if (!response.ok) throw new Error('Failed to create product')
      
      const newProduct: Product = await response.json()
      products.value.push(newProduct)
      return newProduct
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建产品失败'
      throw err
    }
  }
  
  function updateFilters(newFilters: Partial<ProductFilters>): void {
    Object.assign(filters, newFilters)
  }
  
  function getProductById(id: number): Product | undefined {
    return products.value.find(product => product.id === id)
  }
  
  // 泛型方法
  function findProducts<T extends keyof Product>(
    field: T, 
    value: Product[T]
  ): Product[] {
    return products.value.filter(product => product[field] === value)
  }
  
  return {
    // 状态
    products: readonly(products),
    filters,
    loading: readonly(loading),
    error: readonly(error),
    
    // 计算属性
    filteredProducts,
    productStats,
    
    // Actions
    fetchProducts,
    createProduct,
    updateFilters,
    getProductById,
    findProducts
  }
})

// 导出 Store 类型
export type ProductStore = ReturnType<typeof useProductStore>
```

## 二、高级类型技巧

### 2.1 泛型 Store

```typescript
// 通用资源管理 Store
interface Resource {
  id: number
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  data: T
  total?: number
  page?: number
}

function createResourceStore<T extends Resource>(
  storeName: string,
  apiEndpoint: string
) {
  return defineStore(storeName, () => {
    const items = ref<T[]>([])
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    
    const itemsById = computed<Record<number, T>>(() => {
      return items.value.reduce((acc, item) => {
        acc[item.id] = item
        return acc
      }, {} as Record<number, T>)
    })
    
    async function fetchAll(): Promise<T[]> {
      loading.value = true
      error.value = null
      
      try {
        const response = await fetch(apiEndpoint)
        const result: ApiResponse<T[]> = await response.json()
        items.value = result.data
        return result.data
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Fetch failed'
        throw err
      } finally {
        loading.value = false
      }
    }
    
    async function create(data: Omit<T, keyof Resource>): Promise<T> {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const newItem: T = await response.json()
      items.value.push(newItem)
      return newItem
    }
    
    function findById(id: number): T | undefined {
      return itemsById.value[id]
    }
    
    return {
      items: readonly(items),
      loading: readonly(loading),
      error: readonly(error),
      itemsById,
      fetchAll,
      create,
      findById
    }
  })
}

// 使用泛型 Store
interface Post extends Resource {
  title: string
  content: string
  authorId: number
}

interface Comment extends Resource {
  postId: number
  content: string
  authorId: number
}

export const usePostStore = createResourceStore<Post>('posts', '/api/posts')
export const useCommentStore = createResourceStore<Comment>('comments', '/api/comments')
```

### 2.2 类型安全的插件

```typescript
import type { PiniaPluginContext } from 'pinia'

// 插件选项类型
interface PersistOptions {
  key?: string
  storage?: Storage
  paths?: string[]
  serializer?: {
    serialize: (value: any) => string
    deserialize: (value: string) => any
  }
}

// 扩展 Store 类型
declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | PersistOptions
  }
  
  export interface PiniaCustomProperties {
    $persist: {
      save: () => void
      restore: () => void
      clear: () => void
    }
  }
}

// 类型安全的插件实现
function createTypedPersistPlugin() {
  return function persistPlugin({ store, options }: PiniaPluginContext) {
    if (!options.persist) return
    
    const persistOptions: PersistOptions = typeof options.persist === 'object' 
      ? options.persist 
      : {}
    
    const {
      key = store.$id,
      storage = localStorage,
      paths,
      serializer = JSON
    } = persistOptions
    
    // 添加类型安全的持久化方法
    store.$persist = {
      save(): void {
        try {
          let stateToSave = store.$state
          
          if (paths) {
            stateToSave = paths.reduce((acc, path) => {
              acc[path] = getNestedValue(store.$state, path)
              return acc
            }, {} as any)
          }
          
          storage.setItem(key, serializer.serialize(stateToSave))
        } catch (error) {
          console.error('Failed to save state:', error)
        }
      },
      
      restore(): void {
        try {
          const saved = storage.getItem(key)
          if (saved) {
            const state = serializer.deserialize(saved)
            store.$patch(state)
          }
        } catch (error) {
          console.error('Failed to restore state:', error)
        }
      },
      
      clear(): void {
        storage.removeItem(key)
      }
    }
    
    // 初始化时恢复状态
    store.$persist.restore()
    
    // 监听变化并保存
    store.$subscribe(() => {
      store.$persist.save()
    })
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}
```

### 2.3 组合式函数类型

```typescript
// 类型安全的组合式函数
export function useStoreWithLoading<T extends Record<string, any>>(
  store: T
): T & {
  isLoading: ComputedRef<boolean>
  hasError: ComputedRef<boolean>
  errorMessage: ComputedRef<string | null>
} {
  const isLoading = computed(() => {
    return Object.keys(store).some(key => 
      key.includes('loading') && store[key] === true
    )
  })
  
  const hasError = computed(() => {
    return Object.keys(store).some(key => 
      key.includes('error') && store[key] !== null
    )
  })
  
  const errorMessage = computed(() => {
    const errorKey = Object.keys(store).find(key => 
      key.includes('error') && store[key] !== null
    )
    return errorKey ? store[errorKey] : null
  })
  
  return {
    ...store,
    isLoading,
    hasError,
    errorMessage
  }
}

// 使用示例
export function useEnhancedUserStore() {
  const userStore = useUserStore()
  return useStoreWithLoading(userStore)
}
```

## 三、组件中的类型使用

### 3.1 组合式 API 组件

```vue
<template>
  <div>
    <h1>用户列表</h1>
    
    <div v-if="userStore.loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="userStore.error" class="error">
      {{ userStore.error }}
    </div>
    
    <div v-else>
      <UserCard 
        v-for="user in filteredUsers"
        :key="user.id"
        :user="user"
        @update="handleUserUpdate"
        @delete="handleUserDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore, type User } from '@/stores/user'
import UserCard from '@/components/UserCard.vue'

// Store 实例
const userStore = useUserStore()

// 响应式解构（保持类型）
const { users, loading, error } = storeToRefs(userStore)

// 计算属性（类型推断）
const filteredUsers = computed<User[]>(() => {
  return users.value.filter(user => user.role !== 'admin')
})

// 事件处理器（明确类型）
const handleUserUpdate = async (user: User): Promise<void> => {
  try {
    await userStore.updateUser(user.id, user)
  } catch (error) {
    console.error('更新用户失败:', error)
  }
}

const handleUserDelete = async (userId: number): Promise<void> => {
  if (confirm('确定要删除这个用户吗？')) {
    try {
      await userStore.deleteUser(userId)
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }
}

// 生命周期钩子
onMounted(async () => {
  try {
    await userStore.fetchUsers()
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
})
</script>
```

### 3.2 类型安全的 Props 和 Emits

```vue
<template>
  <div class="user-card">
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    <p>角色: {{ user.role }}</p>
    
    <button @click="handleEdit">编辑</button>
    <button @click="handleDelete" class="danger">删除</button>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/stores/user'

// 类型安全的 Props
interface Props {
  user: User
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

// 类型安全的 Emits
interface Emits {
  update: [user: User]
  delete: [userId: number]
  edit: [user: User]
}

const emit = defineEmits<Emits>()

// 事件处理器
const handleEdit = (): void => {
  if (!props.readonly) {
    emit('edit', props.user)
  }
}

const handleDelete = (): void => {
  if (!props.readonly) {
    emit('delete', props.user.id)
  }
}
</script>
```

## 四、测试中的类型

### 4.1 类型安全的测试

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore, type User } from '@/stores/user'

describe('User Store 类型安全测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('应该正确处理用户类型', async () => {
    const store = useUserStore()
    
    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      preferences: {
        theme: 'light',
        language: 'zh-CN'
      }
    }
    
    // TypeScript 会检查类型匹配
    store.setUser(mockUser)
    
    expect(store.currentUser).toEqual(mockUser)
    expect(store.isLoggedIn).toBe(true)
  })
  
  it('应该处理 API 响应类型', async () => {
    const store = useUserStore()
    
    // Mock API 响应
    const mockApiResponse: User = {
      id: 1,
      name: 'API User',
      email: 'api@example.com',
      role: 'admin',
      preferences: {
        theme: 'dark',
        language: 'en-US'
      }
    }
    
    // 模拟 API 调用
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    })
    
    const result = await store.fetchUser(1)
    
    // TypeScript 确保返回类型正确
    expect(result.id).toBe(1)
    expect(result.role).toBe('admin')
  })
})
```

### 4.2 Mock 类型定义

```typescript
// test/types.ts
export interface MockUser extends User {
  __mock?: boolean
}

export type MockUserStore = {
  [K in keyof ReturnType<typeof useUserStore>]: 
    ReturnType<typeof useUserStore>[K] extends (...args: any[]) => any
      ? vi.MockedFunction<ReturnType<typeof useUserStore>[K]>
      : ReturnType<typeof useUserStore>[K]
}

// 创建类型安全的 Mock Store
export function createMockUserStore(): MockUserStore {
  return {
    currentUser: ref<User | null>(null),
    users: ref<User[]>([]),
    loading: ref<boolean>(false),
    error: ref<string | null>(null),
    
    isLoggedIn: computed(() => false),
    userDisplayName: computed(() => ''),
    
    setUser: vi.fn(),
    fetchUser: vi.fn(),
    login: vi.fn(),
    
    $patch: vi.fn(),
    $reset: vi.fn(),
    $subscribe: vi.fn(),
    $onAction: vi.fn(),
    $id: 'user'
  } as MockUserStore
}
```

## 五、类型声明文件

### 5.1 全局类型声明

```typescript
// types/global.d.ts
export {}

declare global {
  interface Window {
    __PINIA_DEVTOOLS__: any
  }
  
  // API 响应类型
  namespace API {
    interface Response<T = any> {
      data: T
      message: string
      success: boolean
      code: number
    }
    
    interface PaginatedResponse<T = any> extends Response<T[]> {
      pagination: {
        page: number
        pageSize: number
        total: number
        pages: number
      }
    }
    
    interface Error {
      message: string
      code: string
      details?: Record<string, any>
    }
  }
  
  // 环境变量类型
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      VITE_API_BASE_URL: string
      VITE_APP_TITLE: string
    }
  }
}
```

### 5.2 Store 类型扩展

```typescript
// types/stores.d.ts
import 'pinia'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    // 添加自定义属性
    $api: typeof api
    $router: Router
    $i18n: I18n
    
    // 添加工具方法
    $utils: {
      formatDate: (date: Date) => string
      formatCurrency: (amount: number) => string
    }
  }
  
  export interface PiniaCustomStateProperties {
    // 添加到所有 store state 的属性
    createdAt: Date
    updatedAt: Date
  }
}

// 扩展 Store 选项
declare module '@pinia/types' {
  export interface DefineStoreOptionsBase<S, Store> {
    // 自定义选项
    caching?: boolean
    syncToServer?: boolean
  }
}
```

## 六、最佳实践

### 6.1 类型组织

```typescript
// types/user.ts - 用户相关类型
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export type UserRole = 'admin' | 'user' | 'moderator'

export interface CreateUserRequest {
  name: string
  email: string
  role?: UserRole
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: number
}

// types/api.ts - API 相关类型
export interface ApiClient {
  get<T>(url: string): Promise<T>
  post<T>(url: string, data: any): Promise<T>
  put<T>(url: string, data: any): Promise<T>
  delete<T>(url: string): Promise<T>
}

// types/store.ts - Store 相关类型
export interface BaseStore {
  loading: boolean
  error: string | null
}

export interface CrudStore<T> extends BaseStore {
  items: T[]
  create: (item: Omit<T, 'id'>) => Promise<T>
  update: (id: number, updates: Partial<T>) => Promise<T>
  delete: (id: number) => Promise<void>
}
```

### 6.2 类型安全的配置

```typescript
// stores/config.ts
interface AppConfig {
  api: {
    baseUrl: string
    timeout: number
  }
  ui: {
    theme: 'light' | 'dark' | 'auto'
    language: string
  }
  features: {
    enableNotifications: boolean
    enableOfflineMode: boolean
  }
}

export const useConfigStore = defineStore('config', () => {
  const config = ref<AppConfig>({
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      timeout: 5000
    },
    ui: {
      theme: 'auto',
      language: navigator.language
    },
    features: {
      enableNotifications: true,
      enableOfflineMode: false
    }
  })
  
  function updateConfig<K extends keyof AppConfig>(
    section: K,
    updates: Partial<AppConfig[K]>
  ): void {
    config.value[section] = { ...config.value[section], ...updates }
  }
  
  function getConfigValue<K extends keyof AppConfig, T extends keyof AppConfig[K]>(
    section: K,
    key: T
  ): AppConfig[K][T] {
    return config.value[section][key]
  }
  
  return {
    config: readonly(config),
    updateConfig,
    getConfigValue
  }
})
```

## 参考资料

- [Pinia TypeScript Guide](https://pinia.vuejs.org/cookbook/typescript.html)
- [Vue TypeScript Support](https://vuejs.org/guide/typescript/overview.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

**下一节** → [第 19 节：SSR 支持](./19-pinia-ssr.md)
