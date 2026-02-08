# 第 42 节：TypeScript 集成

## 概述

TypeScript 为状态管理提供了强类型支持，能够在编译时捕获错误，提供更好的开发体验。本节介绍如何在 TypeScript 项目中高效使用 Pinia 和 Vuex。

## 一、Pinia TypeScript 集成

### 1.1 基本类型定义

```typescript
// types/user.ts
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  roles: Role[]
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
}

export interface Permission {
  id: number
  name: string
  resource: string
  action: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    profileVisible: boolean
    emailVisible: boolean
  }
}

// API 响应类型
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
```

### 1.2 类型化 Store

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import type { User, UserPreferences, ApiResponse } from '@/types/user'

interface UserState {
  currentUser: User | null
  preferences: UserPreferences
  users: User[]
  loading: boolean
  error: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    preferences: {
      theme: 'light',
      language: 'zh-CN',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profileVisible: true,
        emailVisible: false
      }
    },
    users: [],
    loading: false,
    error: null
  }),

  getters: {
    // 基本 getter，自动类型推断
    isLoggedIn: (state): boolean => !!state.currentUser,
    
    // 返回用户名，处理空值
    userName: (state): string => state.currentUser?.name ?? '游客',
    
    // 检查用户角色
    hasRole: (state) => (roleName: string): boolean => {
      return state.currentUser?.roles.some(role => role.name === roleName) ?? false
    },
    
    // 获取用户权限
    userPermissions: (state): Permission[] => {
      if (!state.currentUser) return []
      
      return state.currentUser.roles.flatMap(role => role.permissions)
    },
    
    // 检查特定权限
    hasPermission: (state) => (resource: string, action: string): boolean => {
      if (!state.currentUser) return false
      
      return state.currentUser.roles.some(role =>
        role.permissions.some(permission =>
          permission.resource === resource && permission.action === action
        )
      )
    }
  },

  actions: {
    // 设置用户信息
    setUser(user: User | null): void {
      this.currentUser = user
    },

    // 更新用户偏好
    updatePreferences(preferences: Partial<UserPreferences>): void {
      this.preferences = { ...this.preferences, ...preferences }
    },

    // 获取用户信息
    async fetchUser(id: number): Promise<User> {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`/api/users/${id}`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result: ApiResponse<User> = await response.json()
        
        if (!result.success) {
          throw new Error(result.message)
        }

        this.setUser(result.data)
        return result.data
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取用户信息失败'
        this.error = message
        throw new Error(message)
      } finally {
        this.loading = false
      }
    },

    // 获取用户列表
    async fetchUsers(params?: {
      page?: number
      pageSize?: number
      search?: string
    }): Promise<PaginatedResponse<User>> {
      this.loading = true
      
      try {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.set('page', params.page.toString())
        if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
        if (params?.search) searchParams.set('search', params.search)

        const response = await fetch(`/api/users?${searchParams}`)
        const result: PaginatedResponse<User> = await response.json()
        
        this.users = result.data
        return result
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取用户列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新用户资料
    async updateProfile(updates: Partial<Pick<User, 'name' | 'email' | 'avatar'>>): Promise<User> {
      if (!this.currentUser) {
        throw new Error('用户未登录')
      }

      this.loading = true

      try {
        const response = await fetch(`/api/users/${this.currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        })

        const result: ApiResponse<User> = await response.json()
        
        if (!result.success) {
          throw new Error(result.message)
        }

        this.setUser(result.data)
        return result.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新资料失败'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// 类型化的 composable
export function useUser() {
  const store = useUserStore()
  
  return {
    // 状态
    user: computed(() => store.currentUser),
    users: computed(() => store.users),
    preferences: computed(() => store.preferences),
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    
    // 计算属性
    isLoggedIn: computed(() => store.isLoggedIn),
    userName: computed(() => store.userName),
    userPermissions: computed(() => store.userPermissions),
    
    // 方法
    setUser: store.setUser,
    fetchUser: store.fetchUser,
    fetchUsers: store.fetchUsers,
    updateProfile: store.updateProfile,
    updatePreferences: store.updatePreferences,
    hasRole: store.hasRole,
    hasPermission: store.hasPermission
  }
}
```

## 二、高级 TypeScript 特性

### 2.1 泛型 Store 工厂

```typescript
// utils/createCrudStore.ts
import { defineStore } from 'pinia'

interface BaseEntity {
  id: number | string
  createdAt?: string
  updatedAt?: string
}

interface CrudState<T extends BaseEntity> {
  items: T[]
  currentItem: T | null
  loading: boolean
  error: string | null
}

interface CrudActions<T extends BaseEntity> {
  setItems(items: T[]): void
  setCurrentItem(item: T | null): void
  addItem(item: T): void
  updateItem(item: T): void
  removeItem(id: T['id']): void
  fetchItems(): Promise<T[]>
  fetchItem(id: T['id']): Promise<T>
  createItem(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  updateItemById(id: T['id'], data: Partial<T>): Promise<T>
  deleteItem(id: T['id']): Promise<void>
}

interface CrudGetters<T extends BaseEntity> {
  getItemById: (id: T['id']) => T | undefined
  itemsCount: number
  hasItems: boolean
}

export function createCrudStore<T extends BaseEntity>(
  name: string,
  apiEndpoint: string
) {
  return defineStore(name, {
    state: (): CrudState<T> => ({
      items: [],
      currentItem: null,
      loading: false,
      error: null
    }),

    getters: {
      getItemById: (state) => (id: T['id']): T | undefined => {
        return state.items.find(item => item.id === id)
      },
      
      itemsCount: (state): number => state.items.length,
      
      hasItems: (state): boolean => state.items.length > 0
    } as CrudGetters<T>,

    actions: {
      setItems(items: T[]): void {
        this.items = items
      },

      setCurrentItem(item: T | null): void {
        this.currentItem = item
      },

      addItem(item: T): void {
        this.items.push(item)
      },

      updateItem(item: T): void {
        const index = this.items.findIndex(i => i.id === item.id)
        if (index !== -1) {
          this.items[index] = item
        }
      },

      removeItem(id: T['id']): void {
        this.items = this.items.filter(item => item.id !== id)
      },

      async fetchItems(): Promise<T[]> {
        this.loading = true
        try {
          const response = await fetch(apiEndpoint)
          const items: T[] = await response.json()
          this.setItems(items)
          return items
        } catch (error) {
          this.error = error instanceof Error ? error.message : 'Fetch failed'
          throw error
        } finally {
          this.loading = false
        }
      },

      async fetchItem(id: T['id']): Promise<T> {
        this.loading = true
        try {
          const response = await fetch(`${apiEndpoint}/${id}`)
          const item: T = await response.json()
          this.setCurrentItem(item)
          return item
        } catch (error) {
          this.error = error instanceof Error ? error.message : 'Fetch failed'
          throw error
        } finally {
          this.loading = false
        }
      },

      async createItem(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
        this.loading = true
        try {
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          const item: T = await response.json()
          this.addItem(item)
          return item
        } catch (error) {
          this.error = error instanceof Error ? error.message : 'Create failed'
          throw error
        } finally {
          this.loading = false
        }
      },

      async updateItemById(id: T['id'], data: Partial<T>): Promise<T> {
        this.loading = true
        try {
          const response = await fetch(`${apiEndpoint}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          const item: T = await response.json()
          this.updateItem(item)
          return item
        } catch (error) {
          this.error = error instanceof Error ? error.message : 'Update failed'
          throw error
        } finally {
          this.loading = false
        }
      },

      async deleteItem(id: T['id']): Promise<void> {
        this.loading = true
        try {
          await fetch(`${apiEndpoint}/${id}`, { method: 'DELETE' })
          this.removeItem(id)
        } catch (error) {
          this.error = error instanceof Error ? error.message : 'Delete failed'
          throw error
        } finally {
          this.loading = false
        }
      }
    } as CrudActions<T>
  })
}

// 使用泛型 Store
interface Post extends BaseEntity {
  id: number
  title: string
  content: string
  authorId: number
  published: boolean
}

export const usePostStore = createCrudStore<Post>('posts', '/api/posts')
```

### 2.2 类型安全的插件

```typescript
// plugins/typedPersistence.ts
import type { PiniaPluginContext } from 'pinia'

interface PersistenceOptions {
  key?: string
  storage?: Storage
  paths?: string[]
  beforeRestore?: (context: PiniaPluginContext) => void
  afterRestore?: (context: PiniaPluginContext) => void
}

export function createTypedPersistence(options: PersistenceOptions = {}) {
  return (context: PiniaPluginContext) => {
    const {
      key = context.store.$id,
      storage = localStorage,
      paths,
      beforeRestore,
      afterRestore
    } = options

    // 恢复状态
    const restore = () => {
      try {
        beforeRestore?.(context)
        
        const saved = storage.getItem(key)
        if (saved) {
          const data = JSON.parse(saved)
          
          if (paths) {
            // 只恢复指定路径
            paths.forEach(path => {
              if (path in data) {
                context.store.$patch({ [path]: data[path] })
              }
            })
          } else {
            // 恢复整个状态
            context.store.$patch(data)
          }
        }
        
        afterRestore?.(context)
      } catch (error) {
        console.error('Failed to restore state:', error)
      }
    }

    // 保存状态
    const save = () => {
      try {
        const state = context.store.$state
        const dataToSave = paths
          ? paths.reduce((acc, path) => {
              if (path in state) {
                acc[path] = state[path as keyof typeof state]
              }
              return acc
            }, {} as Record<string, any>)
          : state

        storage.setItem(key, JSON.stringify(dataToSave))
      } catch (error) {
        console.error('Failed to save state:', error)
      }
    }

    // 初始恢复
    restore()

    // 监听变化并保存
    context.store.$subscribe((mutation, state) => {
      save()
    })
  }
}

// 类型安全的使用
export const userStore = defineStore('user', {
  state: () => ({ /* ... */ }),
  // ...
}, {
  persist: createTypedPersistence({
    key: 'user-store',
    paths: ['currentUser', 'preferences']
  })
})
```

## 三、组合式 API 集成

### 3.1 类型化 Composables

```typescript
// composables/useApi.ts
interface UseApiOptions {
  immediate?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

interface UseApiReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  execute: () => Promise<T>
  reset: () => void
}

export function useApi<T>(
  url: string | Ref<string>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (): Promise<T> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(unref(url))
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result: T = await response.json()
      data.value = result

      options.onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed'
      error.value = errorMessage
      options.onError?.(new Error(errorMessage))
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }

  if (options.immediate !== false) {
    execute()
  }

  return {
    data: data as Ref<T | null>,
    loading,
    error,
    execute,
    reset
  }
}

// 状态管理集成
export function useStoreApi<T>(
  storeName: string,
  actionName: string,
  ...args: any[]
): UseApiReturn<T> {
  const store = useStore(storeName)
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (): Promise<T> => {
    loading.value = true
    error.value = null

    try {
      const result = await store[actionName](...args)
      data.value = result
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }

  return { data, loading, error, execute, reset }
}
```

### 3.2 响应式类型处理

```typescript
// composables/useReactiveState.ts
import type { UnwrapRef, DeepReadonly } from 'vue'

interface ReactiveStateOptions<T> {
  deep?: boolean
  readonly?: boolean
  validator?: (value: T) => boolean
}

export function useReactiveState<T>(
  initialValue: T,
  options: ReactiveStateOptions<T> = {}
) {
  const { deep = true, readonly = false, validator } = options
  
  const state = deep ? reactive(initialValue) : shallowReactive(initialValue)
  
  const setState = (newValue: T | ((prev: T) => T)) => {
    const value = typeof newValue === 'function'
      ? (newValue as (prev: T) => T)(state as T)
      : newValue
    
    if (validator && !validator(value)) {
      throw new Error('State validation failed')
    }
    
    if (deep) {
      Object.assign(state, value)
    } else {
      Object.keys(state).forEach(key => {
        delete (state as any)[key]
      })
      Object.assign(state, value)
    }
  }
  
  const readonlyState = readonly ? shallowReadonly(state) : state
  
  return [readonlyState, setState] as const
}

// 使用示例
export function useCounter(initialValue = 0) {
  const [count, setCount] = useReactiveState(initialValue, {
    validator: (value) => typeof value === 'number' && value >= 0
  })
  
  const increment = () => setCount(prev => prev + 1)
  const decrement = () => setCount(prev => Math.max(0, prev - 1))
  const reset = () => setCount(initialValue)
  
  return {
    count: readonly(count),
    increment,
    decrement,
    reset
  }
}
```

## 四、测试类型支持

### 4.1 类型化测试工具

```typescript
// test-utils/store.ts
import { setActivePinia, createPinia } from 'pinia'
import type { Store, StoreDefinition } from 'pinia'

interface MockStoreOptions<T = any> {
  initialState?: Partial<T>
  stubActions?: boolean
}

export function createMockStore<T extends StoreDefinition>(
  useStore: T,
  options: MockStoreOptions<ReturnType<T>['$state']> = {}
): ReturnType<T> {
  const { initialState, stubActions = true } = options
  
  setActivePinia(createPinia())
  const store = useStore()
  
  // 设置初始状态
  if (initialState) {
    store.$patch(initialState)
  }
  
  // 存根 actions
  if (stubActions) {
    Object.keys(store).forEach(key => {
      if (typeof store[key] === 'function' && !key.startsWith('$')) {
        store[key] = vi.fn()
      }
    })
  }
  
  return store
}

// 测试类型断言工具
export function expectType<T>(): <U extends T>(value: U) => U
export function expectType<T>(value: T): T
export function expectType<T>(value?: T) {
  return value
}

export function expectError<T>(fn: () => T): void {
  try {
    fn()
    throw new Error('Expected function to throw')
  } catch {
    // 预期的错误
  }
}
```

### 4.2 组件测试集成

```typescript
// test-utils/component.ts
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { DefineComponent, App } from 'vue'

interface MountOptions {
  initialStoreState?: Record<string, any>
  stubActions?: string[]
  provide?: Record<string | symbol, any>
}

export function mountWithStore<T extends DefineComponent>(
  component: T,
  options: MountOptions = {}
): VueWrapper<InstanceType<T>> {
  const { initialStoreState, stubActions, provide } = options
  
  const pinia = createPinia()
  setActivePinia(pinia)
  
  // 设置初始状态
  if (initialStoreState) {
    Object.entries(initialStoreState).forEach(([storeName, state]) => {
      const store = pinia._s.get(storeName)
      if (store) {
        store.$patch(state)
      }
    })
  }
  
  // 存根指定的 actions
  if (stubActions) {
    stubActions.forEach(actionPath => {
      const [storeName, actionName] = actionPath.split('.')
      const store = pinia._s.get(storeName)
      if (store && actionName in store) {
        store[actionName] = vi.fn()
      }
    })
  }
  
  return mount(component, {
    global: {
      plugins: [pinia],
      provide
    }
  })
}

// 使用示例测试
describe('UserProfile Component', () => {
  it('should display user name when logged in', () => {
    const wrapper = mountWithStore(UserProfile, {
      initialStoreState: {
        user: {
          currentUser: { id: 1, name: 'John Doe', email: 'john@example.com' }
        }
      }
    })
    
    expect(wrapper.find('[data-test="user-name"]').text()).toBe('John Doe')
  })
  
  it('should call fetchUser action on mount', () => {
    const wrapper = mountWithStore(UserProfile, {
      stubActions: ['user.fetchUser']
    })
    
    const userStore = useUserStore()
    expect(userStore.fetchUser).toHaveBeenCalled()
  })
})
```

## 五、开发工具配置

### 5.1 TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    
    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/stores/*": ["src/stores/*"],
      "@/types/*": ["src/types/*"],
      "@/composables/*": ["src/composables/*"]
    },
    
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 5.2 IDE 配置优化

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "vetur.validation.template": false,
  "vetur.validation.script": false,
  "vetur.validation.style": false
}

// .vscode/extensions.json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

## 参考资料

- [Pinia TypeScript 支持](https://pinia.vuejs.org/cookbook/composing-stores.html#typescript)
- [Vue 3 TypeScript 指南](https://vuejs.org/guide/typescript/overview.html)
- [TypeScript 高级类型](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)

**下一节** → [第 43 节：微前端状态共享](./43-microfrontend-state-sharing.md)
