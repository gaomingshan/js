# Pinia 插件系统

> Pinia 插件用于扩展 store 的功能，如持久化、日志记录等。

## 核心概念

Pinia 插件是一个函数，接收一个 context 参数。

### 基础插件

```typescript
import { PiniaPluginContext } from 'pinia'

function myPlugin(context: PiniaPluginContext) {
  // context.pinia - Pinia 实例
  // context.app - Vue 应用实例
  // context.store - 当前 store
  // context.options - store 的选项
  
  console.log('Plugin initialized for', context.store.$id)
}

// 使用插件
const pinia = createPinia()
pinia.use(myPlugin)
```

---

## 持久化插件

### 基础持久化

```typescript
// plugins/persist.ts
import { PiniaPluginContext } from 'pinia'

export function persistPlugin(context: PiniaPluginContext) {
  const { store } = context
  
  // 从 localStorage 恢复状态
  const saved = localStorage.getItem(store.$id)
  if (saved) {
    store.$patch(JSON.parse(saved))
  }
  
  // 监听状态变化并保存
  store.$subscribe((mutation, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state))
  })
}

// 使用
const pinia = createPinia()
pinia.use(persistPlugin)
```

### 高级持久化

```typescript
// plugins/persist.ts
import { PiniaPluginContext } from 'pinia'

interface PersistOptions {
  key?: string
  storage?: Storage
  paths?: string[]
  serializer?: {
    serialize: (value: any) => string
    deserialize: (value: string) => any
  }
}

export function createPersistPlugin(options: PersistOptions = {}) {
  return function(context: PiniaPluginContext) {
    const { store } = context
    const {
      key = store.$id,
      storage = localStorage,
      paths,
      serializer = {
        serialize: JSON.stringify,
        deserialize: JSON.parse
      }
    } = options
    
    // 恢复状态
    try {
      const saved = storage.getItem(key)
      if (saved) {
        const state = serializer.deserialize(saved)
        
        if (paths) {
          // 只恢复指定的路径
          const partialState: any = {}
          paths.forEach(path => {
            partialState[path] = state[path]
          })
          store.$patch(partialState)
        } else {
          store.$patch(state)
        }
      }
    } catch (error) {
      console.error('恢复状态失败:', error)
    }
    
    // 保存状态
    store.$subscribe((mutation, state) => {
      try {
        let toSave = state
        
        if (paths) {
          // 只保存指定的路径
          toSave = {}
          paths.forEach(path => {
            toSave[path] = state[path]
          })
        }
        
        storage.setItem(key, serializer.serialize(toSave))
      } catch (error) {
        console.error('保存状态失败:', error)
      }
    })
  }
}

// 使用
const pinia = createPinia()
pinia.use(createPersistPlugin({
  storage: sessionStorage,
  paths: ['user', 'token']
}))
```

### pinia-plugin-persistedstate

使用官方持久化插件：

```bash
npm install pinia-plugin-persistedstate
```

```typescript
// main.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// stores/user.ts
export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    user: null
  }),
  persist: true // 开启持久化
})

// 自定义配置
export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    user: null,
    preferences: {}
  }),
  persist: {
    key: 'user-storage',
    storage: sessionStorage,
    paths: ['token', 'user'] // 只持久化部分状态
  }
})
```

---

## 日志插件

```typescript
// plugins/logger.ts
import { PiniaPluginContext } from 'pinia'

export function loggerPlugin(context: PiniaPluginContext) {
  const { store } = context
  
  // 记录 action 调用
  store.$onAction(({ name, args, after, onError }) => {
    const startTime = Date.now()
    
    console.log(`[${store.$id}] Action "${name}" called with:`, args)
    
    after((result) => {
      console.log(
        `[${store.$id}] Action "${name}" finished in ${Date.now() - startTime}ms`,
        'Result:', result
      )
    })
    
    onError((error) => {
      console.error(
        `[${store.$id}] Action "${name}" failed after ${Date.now() - startTime}ms`,
        'Error:', error
      )
    })
  })
  
  // 记录状态变更
  store.$subscribe((mutation, state) => {
    console.log(`[${store.$id}] State changed:`, {
      type: mutation.type,
      storeId: mutation.storeId,
      payload: mutation.payload,
      state: JSON.parse(JSON.stringify(state))
    })
  })
}
```

---

## 扩展 Store

### 添加全局方法

```typescript
// plugins/reset.ts
import { PiniaPluginContext } from 'pinia'

export function resetPlugin(context: PiniaPluginContext) {
  const { store } = context
  const initialState = JSON.parse(JSON.stringify(store.$state))
  
  store.$reset = () => {
    store.$patch(initialState)
  }
}

// 类型扩展
declare module 'pinia' {
  export interface PiniaCustomProperties {
    $reset: () => void
  }
}
```

### 添加响应式属性

```typescript
import { ref, Ref } from 'vue'
import { PiniaPluginContext } from 'pinia'

export function loadingPlugin(context: PiniaPluginContext) {
  const { store } = context
  
  // 为每个 store 添加 loading 状态
  const loading = ref(false)
  
  store.$onAction(({ after, onError }) => {
    loading.value = true
    
    after(() => {
      loading.value = false
    })
    
    onError(() => {
      loading.value = false
    })
  })
  
  return { loading }
}

// 类型扩展
declare module 'pinia' {
  export interface PiniaCustomProperties {
    loading: Ref<boolean>
  }
}

// 使用
const store = useUserStore()
console.log(store.loading) // true/false
```

---

## 调试插件

```typescript
// plugins/debug.ts
import { PiniaPluginContext } from 'pinia'

export function debugPlugin(context: PiniaPluginContext) {
  const { store, options } = context
  
  if (import.meta.env.DEV) {
    // 添加调试方法
    store.$debug = () => {
      console.group(`Store: ${store.$id}`)
      console.log('State:', store.$state)
      console.log('Options:', options)
      console.groupEnd()
    }
    
    // 监听所有变化
    store.$subscribe((mutation, state) => {
      console.log(`[DEBUG] ${store.$id}:`, mutation.type, mutation.payload)
    })
    
    // 性能监控
    store.$onAction(({ name, after }) => {
      const start = performance.now()
      after(() => {
        const duration = performance.now() - start
        if (duration > 100) {
          console.warn(`[PERF] ${store.$id}.${name} took ${duration}ms`)
        }
      })
    })
  }
}

// 类型扩展
declare module 'pinia' {
  export interface PiniaCustomProperties {
    $debug?: () => void
  }
}
```

---

## 插件组合

```typescript
// plugins/index.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { loggerPlugin } from './logger'
import { resetPlugin } from './reset'
import { debugPlugin } from './debug'

export function setupPinia() {
  const pinia = createPinia()
  
  // 注册插件
  pinia.use(piniaPluginPersistedstate)
  
  if (import.meta.env.DEV) {
    pinia.use(loggerPlugin)
    pinia.use(debugPlugin)
  }
  
  pinia.use(resetPlugin)
  
  return pinia
}

// main.ts
import { setupPinia } from './plugins'

const app = createApp(App)
app.use(setupPinia())
```

---

## 实战示例

### 示例 1：请求去重插件

```typescript
// plugins/dedupe.ts
import { PiniaPluginContext } from 'pinia'

const pendingRequests = new Map<string, Promise<any>>()

export function dedupePlugin(context: PiniaPluginContext) {
  const { store } = context
  
  store.$onAction(({ name, args, after, onError }) => {
    // 只处理异步 action
    const key = `${store.$id}:${name}:${JSON.stringify(args)}`
    
    if (pendingRequests.has(key)) {
      // 返回已有的 Promise
      return pendingRequests.get(key)
    }
    
    const promise = new Promise((resolve, reject) => {
      after(resolve)
      onError(reject)
    })
    
    pendingRequests.set(key, promise)
    
    promise.finally(() => {
      pendingRequests.delete(key)
    })
  })
}
```

### 示例 2：错误追踪插件

```typescript
// plugins/errorTracking.ts
import { PiniaPluginContext } from 'pinia'

interface ErrorLog {
  storeId: string
  action: string
  error: Error
  timestamp: Date
  state: any
}

const errorLogs: ErrorLog[] = []

export function errorTrackingPlugin(context: PiniaPluginContext) {
  const { store } = context
  
  store.$onAction(({ name, onError }) => {
    onError((error) => {
      const log: ErrorLog = {
        storeId: store.$id,
        action: name,
        error: error as Error,
        timestamp: new Date(),
        state: JSON.parse(JSON.stringify(store.$state))
      }
      
      errorLogs.push(log)
      
      // 发送到错误追踪服务
      sendToErrorTracking(log)
      
      // 保留最近100条
      if (errorLogs.length > 100) {
        errorLogs.shift()
      }
    })
  })
  
  // 添加查看错误日志的方法
  store.$getErrors = () => {
    return errorLogs.filter(log => log.storeId === store.$id)
  }
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $getErrors: () => ErrorLog[]
  }
}
```

### 示例 3：Undo/Redo 插件

```typescript
// plugins/history.ts
import { PiniaPluginContext } from 'pinia'

interface HistoryState {
  past: any[]
  future: any[]
}

export function historyPlugin(context: PiniaPluginContext) {
  const { store } = context
  
  const history: HistoryState = {
    past: [],
    future: []
  }
  
  // 保存初始状态
  history.past.push(JSON.parse(JSON.stringify(store.$state)))
  
  store.$subscribe((mutation, state) => {
    // 保存当前状态到历史
    history.past.push(JSON.parse(JSON.stringify(state)))
    
    // 清空 future
    history.future = []
    
    // 限制历史记录数量
    if (history.past.length > 50) {
      history.past.shift()
    }
  })
  
  store.$undo = () => {
    if (history.past.length > 1) {
      // 保存当前状态到 future
      const current = history.past.pop()
      history.future.push(current!)
      
      // 恢复上一个状态
      const previous = history.past[history.past.length - 1]
      store.$patch(previous)
    }
  }
  
  store.$redo = () => {
    if (history.future.length > 0) {
      const next = history.future.pop()
      history.past.push(next!)
      store.$patch(next)
    }
  }
  
  store.$canUndo = () => history.past.length > 1
  store.$canRedo = () => history.future.length > 0
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $undo: () => void
    $redo: () => void
    $canUndo: () => boolean
    $canRedo: () => boolean
  }
}
```

### 示例 4：同步插件

```typescript
// plugins/sync.ts
import { PiniaPluginContext } from 'pinia'

export function syncPlugin(options: {
  channel: BroadcastChannel
}) {
  return function(context: PiniaPluginContext) {
    const { store } = context
    const { channel } = options
    
    // 监听本地变化，广播给其他标签页
    store.$subscribe((mutation, state) => {
      channel.postMessage({
        type: 'state-update',
        storeId: store.$id,
        state: JSON.parse(JSON.stringify(state))
      })
    })
    
    // 接收其他标签页的变化
    channel.onmessage = (event) => {
      if (event.data.type === 'state-update' && event.data.storeId === store.$id) {
        store.$patch(event.data.state)
      }
    }
  }
}

// 使用
const channel = new BroadcastChannel('app-sync')
const pinia = createPinia()
pinia.use(syncPlugin({ channel }))
```

---

## 插件配置选项

```typescript
// 插件工厂函数模式
interface PluginOptions {
  enabled?: boolean
  debounce?: number
  exclude?: string[]
}

export function createMyPlugin(options: PluginOptions = {}) {
  const {
    enabled = true,
    debounce = 0,
    exclude = []
  } = options
  
  return function(context: PiniaPluginContext) {
    if (!enabled) return
    
    const { store } = context
    
    // 排除特定 store
    if (exclude.includes(store.$id)) return
    
    // 防抖处理
    let timer: number
    store.$subscribe((mutation, state) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        // 处理逻辑
      }, debounce) as unknown as number
    })
  }
}

// 使用
pinia.use(createMyPlugin({
  enabled: true,
  debounce: 300,
  exclude: ['temp']
}))
```

---

## 测试插件

```typescript
import { describe, it, expect } from 'vitest'
import { createPinia, defineStore } from 'pinia'
import { myPlugin } from './myPlugin'

describe('myPlugin', () => {
  it('should add custom property', () => {
    const pinia = createPinia()
    pinia.use(myPlugin)
    
    const useStore = defineStore('test', {
      state: () => ({ count: 0 })
    })
    
    const store = useStore(pinia)
    
    expect(store.$customProperty).toBeDefined()
  })
  
  it('should persist state', () => {
    const pinia = createPinia()
    pinia.use(persistPlugin)
    
    const useStore = defineStore('test', {
      state: () => ({ count: 0 })
    })
    
    const store = useStore(pinia)
    store.count = 5
    
    // 验证 localStorage
    const saved = localStorage.getItem('test')
    expect(JSON.parse(saved!).count).toBe(5)
  })
})
```

---

## 性能优化

### 批量更新

```typescript
export function batchPlugin(context: PiniaPluginContext) {
  const { store } = context
  
  let batchedUpdates: any[] = []
  let timer: number
  
  const originalPatch = store.$patch
  
  store.$patch = function(partialStateOrMutator: any) {
    batchedUpdates.push(partialStateOrMutator)
    
    clearTimeout(timer)
    timer = setTimeout(() => {
      originalPatch.call(store, (state: any) => {
        batchedUpdates.forEach(update => {
          if (typeof update === 'function') {
            update(state)
          } else {
            Object.assign(state, update)
          }
        })
      })
      batchedUpdates = []
    }, 0) as unknown as number
  }
}
```

---

## 最佳实践

1. **插件顺序**：注意插件注册顺序
2. **性能考虑**：避免在 subscribe 中执行耗时操作
3. **错误处理**：捕获插件中的错误
4. **类型安全**：扩展 Pinia 类型
5. **可配置性**：使用工厂函数创建插件
6. **条件执行**：根据环境决定是否启用
7. **清理资源**：在适当时候清理监听器
8. **文档化**：说明插件的用途和配置

---

## 插件生态

常用的 Pinia 插件：

- **pinia-plugin-persistedstate**：状态持久化
- **pinia-plugin-history**：Undo/Redo 功能
- **pinia-orm**：ORM 数据管理
- **pinia-plugin-logger**：日志记录
- **pinia-shared-state**：跨标签页同步

---

## 参考资料

- [Pinia 插件](https://pinia.vuejs.org/core-concepts/plugins.html)
- [pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate)
- [插件 API](https://pinia.vuejs.org/api/interfaces/pinia.PiniaPlugin.html)
