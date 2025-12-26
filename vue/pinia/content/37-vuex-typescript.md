# 第 37 节：与 TypeScript

## 概述

TypeScript 为 Vuex 提供了强类型支持，能够在编译时捕获错误，提供更好的开发体验。本节介绍如何在 TypeScript 项目中正确使用 Vuex，包括类型定义、模块声明和最佳实践。

## 一、基础类型定义

### 1.1 状态类型定义

```typescript
// types/store.ts
export interface RootState {
  version: string
  online: boolean
}

export interface UserState {
  currentUser: User | null
  profile: UserProfile | null
  preferences: UserPreferences
  isLoading: boolean
  error: string | null
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  roles: string[]
}

export interface UserProfile {
  id: number
  bio: string
  location: string
  website?: string
  socialLinks: SocialLink[]
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications: boolean
  privacy: PrivacySettings
}

export interface SocialLink {
  platform: string
  url: string
}

export interface PrivacySettings {
  showEmail: boolean
  showProfile: boolean
  allowMessages: boolean
}
```

### 1.2 Store 模块类型化

```typescript
// store/modules/user.ts
import { Module, GetterTree, MutationTree, ActionTree } from 'vuex'
import { RootState, UserState, User } from '@/types/store'

const state: UserState = {
  currentUser: null,
  profile: null,
  preferences: {
    theme: 'light',
    language: 'zh-CN',
    notifications: true,
    privacy: {
      showEmail: false,
      showProfile: true,
      allowMessages: true
    }
  },
  isLoading: false,
  error: null
}

const getters: GetterTree<UserState, RootState> = {
  isLoggedIn: (state): boolean => !!state.currentUser,
  
  userName: (state): string => state.currentUser?.name || '游客',
  
  hasRole: (state) => (role: string): boolean => {
    return state.currentUser?.roles.includes(role) ?? false
  },
  
  isAdmin: (state, getters): boolean => {
    return getters.hasRole('admin')
  }
}

const mutations: MutationTree<UserState> = {
  SET_USER(state, user: User | null) {
    state.currentUser = user
  },
  
  SET_PROFILE(state, profile: UserProfile) {
    state.profile = profile
  },
  
  UPDATE_PREFERENCES(state, preferences: Partial<UserPreferences>) {
    state.preferences = { ...state.preferences, ...preferences }
  },
  
  SET_LOADING(state, loading: boolean) {
    state.isLoading = loading
  },
  
  SET_ERROR(state, error: string | null) {
    state.error = error
  }
}

const actions: ActionTree<UserState, RootState> = {
  async fetchUser({ commit }, userId: number): Promise<User> {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      
      const user: User = await response.json()
      commit('SET_USER', user)
      return user
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async updateProfile({ commit, state }, updates: Partial<UserProfile>): Promise<void> {
    if (!state.currentUser) {
      throw new Error('User not logged in')
    }
    
    commit('SET_LOADING', true)
    
    try {
      const response = await fetch(`/api/users/${state.currentUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      const updatedProfile: UserProfile = await response.json()
      commit('SET_PROFILE', updatedProfile)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const userModule: Module<UserState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

export default userModule
```

## 二、Store 类型增强

### 2.1 全局 Store 类型

```typescript
// store/index.ts
import { createStore, Store } from 'vuex'
import { InjectionKey } from 'vue'
import { RootState } from '@/types/store'
import userModule from './modules/user'
import todoModule from './modules/todo'

export const store = createStore<RootState>({
  state: {
    version: '1.0.0',
    online: navigator.onLine
  },
  
  mutations: {
    SET_ONLINE(state, online: boolean) {
      state.online = online
    }
  },
  
  modules: {
    user: userModule,
    todo: todoModule
  },
  
  strict: process.env.NODE_ENV !== 'production'
})

// 定义 injection key
export const key: InjectionKey<Store<RootState>> = Symbol('store')

// 类型增强的 useStore
export function useStore() {
  return baseUseStore(key)
}
```

### 2.2 Vue 组件中的类型支持

```vue
<template>
  <div class="user-profile">
    <div v-if="isLoading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="user">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      <div v-if="isAdmin" class="admin-panel">
        管理员面板
      </div>
    </div>
    
    <button @click="handleRefresh">刷新</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import type { User } from '@/types/store'

const store = useStore()

// 计算属性具有正确的类型推断
const user = computed((): User | null => store.state.user.currentUser)
const isLoading = computed((): boolean => store.state.user.isLoading)
const error = computed((): string | null => store.state.user.error)
const isAdmin = computed((): boolean => store.getters['user/isAdmin'])

// 方法也有类型检查
const handleRefresh = async (): Promise<void> => {
  if (user.value) {
    try {
      await store.dispatch('user/fetchUser', user.value.id)
    } catch (error) {
      console.error('刷新失败:', error)
    }
  }
}
</script>
```

## 三、高级类型特性

### 3.1 泛型模块工厂

```typescript
// helpers/createTypedModule.ts
import { Module, GetterTree, MutationTree, ActionTree } from 'vuex'

export interface BaseState {
  loading: boolean
  error: string | null
}

export interface CrudState<T> extends BaseState {
  items: T[]
  currentItem: T | null
}

export function createCrudModule<T extends { id: number }>(
  name: string,
  apiEndpoint: string
): Module<CrudState<T>, any> {
  
  const state: CrudState<T> = {
    items: [],
    currentItem: null,
    loading: false,
    error: null
  }
  
  const getters: GetterTree<CrudState<T>, any> = {
    getItemById: (state) => (id: number): T | undefined => {
      return state.items.find(item => item.id === id)
    },
    
    itemsCount: (state): number => state.items.length
  }
  
  const mutations: MutationTree<CrudState<T>> = {
    SET_ITEMS(state, items: T[]) {
      state.items = items
    },
    
    SET_CURRENT_ITEM(state, item: T | null) {
      state.currentItem = item
    },
    
    ADD_ITEM(state, item: T) {
      state.items.push(item)
    },
    
    UPDATE_ITEM(state, updatedItem: T) {
      const index = state.items.findIndex(item => item.id === updatedItem.id)
      if (index !== -1) {
        state.items[index] = updatedItem
      }
    },
    
    REMOVE_ITEM(state, id: number) {
      state.items = state.items.filter(item => item.id !== id)
    },
    
    SET_LOADING(state, loading: boolean) {
      state.loading = loading
    },
    
    SET_ERROR(state, error: string | null) {
      state.error = error
    }
  }
  
  const actions: ActionTree<CrudState<T>, any> = {
    async fetchItems({ commit }): Promise<T[]> {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await fetch(apiEndpoint)
        if (!response.ok) {
          throw new Error(`Failed to fetch ${name}`)
        }
        
        const items: T[] = await response.json()
        commit('SET_ITEMS', items)
        return items
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Fetch failed'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createItem({ commit }, itemData: Omit<T, 'id'>): Promise<T> {
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        })
        
        if (!response.ok) {
          throw new Error(`Failed to create ${name}`)
        }
        
        const newItem: T = await response.json()
        commit('ADD_ITEM', newItem)
        return newItem
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Create failed'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
  
  return {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
  }
}

// 使用泛型模块
interface Post {
  id: number
  title: string
  content: string
  authorId: number
  createdAt: string
}

const postModule = createCrudModule<Post>('posts', '/api/posts')
```

### 3.2 辅助函数类型增强

```typescript
// helpers/mappers.ts
import { Store } from 'vuex'
import { RootState } from '@/types/store'

// 类型安全的 mapState
export function typedMapState<T extends keyof RootState>(
  states: T[]
): { [K in T]: () => RootState[K] }

export function typedMapState<T extends string, K extends keyof RootState>(
  module: string,
  states: T[]
): { [P in T]: () => any }

export function typedMapState(moduleOrStates: any, states?: any) {
  // 实现逻辑...
}

// 类型安全的 getter 访问
export function createTypedGetters<T extends Record<string, any>>(
  store: Store<RootState>,
  module: string
) {
  return {
    get<K extends keyof T>(key: K): T[K] {
      return store.getters[`${module}/${key as string}`]
    }
  }
}

// 使用示例
const userGetters = createTypedGetters<{
  isLoggedIn: boolean
  userName: string
  hasRole: (role: string) => boolean
}>(store, 'user')

const isLoggedIn = userGetters.get('isLoggedIn') // 类型为 boolean
```

## 四、插件类型化

### 4.1 类型化插件

```typescript
// plugins/typedPersistence.ts
import { Store, Plugin } from 'vuex'

export interface PersistenceOptions<S = any> {
  key: string
  storage?: Storage
  paths?: Array<keyof S>
  reducer?: (state: S) => Partial<S>
  subscriber?: (store: Store<S>) => (handler: (mutation: any, state: S) => any) => void
}

export function createPersistencePlugin<S = any>(
  options: PersistenceOptions<S>
): Plugin<S> {
  return (store: Store<S>) => {
    const { key, storage = localStorage, paths, reducer } = options
    
    // 恢复状态
    const savedState = storage.getItem(key)
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        store.replaceState(Object.assign({}, store.state, parsedState))
      } catch (error) {
        console.error('Failed to restore state:', error)
      }
    }
    
    // 监听状态变化
    store.subscribe((mutation, state) => {
      const stateToSave = reducer ? reducer(state) : state
      
      let stateToPersist: Partial<S>
      if (paths) {
        stateToPersist = {} as Partial<S>
        paths.forEach(path => {
          stateToPersist[path] = state[path]
        })
      } else {
        stateToPersist = stateToSave
      }
      
      try {
        storage.setItem(key, JSON.stringify(stateToPersist))
      } catch (error) {
        console.error('Failed to persist state:', error)
      }
    })
  }
}

// 使用类型化插件
const persistencePlugin = createPersistencePlugin<RootState>({
  key: 'app-state',
  paths: ['user'],
  reducer: (state) => ({
    user: {
      currentUser: state.user.currentUser,
      preferences: state.user.preferences
    }
  })
})
```

## 五、组合式 API 集成

### 5.1 类型安全的 Composition API

```typescript
// composables/useTypedStore.ts
import { computed, ComputedRef } from 'vue'
import { useStore as baseUseStore } from 'vuex'
import { Store } from 'vuex'
import { RootState } from '@/types/store'
import { key } from '@/store'

export function useTypedStore(): Store<RootState> {
  return baseUseStore(key)
}

// 模块化的 composable
export function useUser() {
  const store = useTypedStore()
  
  const user = computed(() => store.state.user.currentUser)
  const isLoading = computed(() => store.state.user.isLoading)
  const error = computed(() => store.state.user.error)
  const isLoggedIn = computed(() => store.getters['user/isLoggedIn'])
  const isAdmin = computed(() => store.getters['user/isAdmin'])
  
  const fetchUser = (id: number) => store.dispatch('user/fetchUser', id)
  const updateProfile = (updates: any) => store.dispatch('user/updateProfile', updates)
  const logout = () => store.dispatch('user/logout')
  
  return {
    // 状态
    user: user as ComputedRef<typeof user.value>,
    isLoading: isLoading as ComputedRef<boolean>,
    error: error as ComputedRef<string | null>,
    
    // 计算属性
    isLoggedIn: isLoggedIn as ComputedRef<boolean>,
    isAdmin: isAdmin as ComputedRef<boolean>,
    
    // 方法
    fetchUser,
    updateProfile,
    logout
  }
}

// 在组件中使用
export default defineComponent({
  setup() {
    const { user, isLoading, isAdmin, fetchUser } = useUser()
    
    const handleRefresh = async () => {
      if (user.value) {
        await fetchUser(user.value.id)
      }
    }
    
    return {
      user,
      isLoading,
      isAdmin,
      handleRefresh
    }
  }
})
```

## 六、测试中的 TypeScript

### 6.1 类型化测试

```typescript
// tests/store/user.test.ts
import { Store, createStore } from 'vuex'
import userModule from '@/store/modules/user'
import { RootState, UserState, User } from '@/types/store'

describe('User Module', () => {
  let store: Store<{ user: UserState }>
  
  beforeEach(() => {
    store = createStore({
      modules: {
        user: userModule
      }
    })
  })
  
  it('should set user correctly', () => {
    const testUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      roles: ['user']
    }
    
    store.commit('user/SET_USER', testUser)
    
    expect(store.state.user.currentUser).toEqual(testUser)
    expect(store.getters['user/isLoggedIn']).toBe(true)
  })
  
  it('should handle async actions with proper types', async () => {
    // Mock fetch
    const mockUser: User = {
      id: 1,
      name: 'Mocked User',
      email: 'mock@example.com',
      roles: ['user']
    }
    
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    })
    
    const result = await store.dispatch('user/fetchUser', 1)
    
    expect(result).toEqual(mockUser)
    expect(store.state.user.currentUser).toEqual(mockUser)
  })
})
```

## 七、开发工具配置

### 7.1 IDE 配置

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "vetur.validation.template": false,
  "vetur.validation.script": false,
  "vetur.validation.style": false
}
```

### 7.2 TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "Node",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/store": ["src/store"],
      "@/types/*": ["src/types/*"]
    },
    "types": ["vite/client", "vue", "vuex"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],
  "exclude": ["node_modules"]
}
```

## 参考资料

- [Vuex TypeScript 支持](https://vuex.vuejs.org/guide/typescript-support.html)
- [Vue 3 TypeScript 指南](https://vuejs.org/guide/typescript/overview.html)
- [TypeScript 深入理解](https://www.typescriptlang.org/docs/)

**下一节** → [第 38 节：性能优化](./38-vuex-performance.md)
