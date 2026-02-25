# 3.3 插件系统

## 概述

Pinia 的插件系统允许扩展 Store 的功能，如添加持久化、日志记录、全局属性等。插件在 Store 创建时执行，可以访问和修改 Store。

## 插件机制原理

### 插件定义

插件是一个接收上下文对象的函数：

```javascript
function myPlugin(context) {
  // context 包含:
  // - pinia: Pinia 实例
  // - app: Vue 应用实例
  // - store: 当前 Store 实例
  // - options: defineStore 的选项
  
  console.log('Store ID:', context.store.$id)
  console.log('Store 选项:', context.options)
}

// 注册插件
import { createPinia } from 'pinia'

const pinia = createPinia()
pinia.use(myPlugin)
```

### 完整的插件上下文

```javascript
function pluginExample({ pinia, app, store, options }) {
  console.log('Pinia 实例:', pinia)
  console.log('Vue 应用:', app)
  console.log('Store 实例:', store)
  console.log('Store ID:', store.$id)
  console.log('定义选项:', options)
  console.log('State:', store.$state)
}
```

## 编写自定义插件

### 基础插件示例

```javascript
// plugins/logger.js
export function loggerPlugin({ store }) {
  // 在每个 Store 上添加方法
  store.$log = function(message) {
    console.log(`[${this.$id}]`, message)
  }
  
  // 监听 state 变化
  store.$subscribe((mutation, state) => {
    console.log(`[${store.$id}] State 变化:`, {
      type: mutation.type,
      state: JSON.stringify(state, null, 2)
    })
  })
  
  // 监听 actions
  store.$onAction(({ name, args }) => {
    console.log(`[${store.$id}] Action ${name} 被调用:`, args)
  })
}

// main.js
import { createPinia } from 'pinia'
import { loggerPlugin } from './plugins/logger'

const pinia = createPinia()
pinia.use(loggerPlugin)

// 使用
const store = useUserStore()
store.$log('这是一条日志') // [user] 这是一条日志
```

### 添加全局属性

```javascript
// plugins/api.js
import axios from 'axios'

export function apiPlugin({ store }) {
  // 为所有 Store 添加 $api 属性
  store.$api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000
  })
  
  // 添加请求拦截器
  store.$api.interceptors.request.use(config => {
    // 从 auth store 获取 token
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  })
}

// 使用
export const useUserStore = defineStore('user', {
  actions: {
    async fetchUsers() {
      // 使用插件提供的 $api
      const response = await this.$api.get('/users')
      return response.data
    }
  }
})
```

### 修改 Store 选项

```javascript
// plugins/defaults.js
export function defaultsPlugin({ options, store }) {
  // 为所有 Store 添加默认 state
  if (!options.state) return
  
  const originalState = options.state()
  
  // 添加通用字段
  store.$state = {
    ...originalState,
    _loading: false,
    _error: null,
    _lastUpdated: null
  }
  
  // 添加通用 actions
  store.setLoading = function(loading) {
    this._loading = loading
  }
  
  store.setError = function(error) {
    this._error = error
  }
  
  store.markUpdated = function() {
    this._lastUpdated = Date.now()
  }
}

// 使用
const store = useUserStore()
store.setLoading(true)
console.log(store._loading) // true
```

## 常用插件场景

### 场景 1：持久化插件

```javascript
// plugins/persistence.js
export function createPersistencePlugin(options = {}) {
  return function persistencePlugin({ store }) {
    const {
      key = store.$id,
      storage = localStorage,
      paths = null // 指定要持久化的路径
    } = options
    
    // 恢复保存的状态
    const savedState = storage.getItem(key)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        store.$patch(parsed)
      } catch (error) {
        console.error('恢复状态失败:', error)
      }
    }
    
    // 订阅变化并保存
    store.$subscribe(
      (mutation, state) => {
        let dataToSave = state
        
        // 如果指定了 paths，只保存部分数据
        if (paths) {
          dataToSave = {}
          paths.forEach(path => {
            dataToSave[path] = state[path]
          })
        }
        
        try {
          storage.setItem(key, JSON.stringify(dataToSave))
        } catch (error) {
          console.error('保存状态失败:', error)
        }
      },
      { detached: true }
    )
  }
}

// 使用
const pinia = createPinia()

// 全局持久化
pinia.use(createPersistencePlugin())

// 或针对特定 Store
pinia.use(({ store }) => {
  if (store.$id === 'user') {
    createPersistencePlugin({
      paths: ['token', 'user'] // 只持久化这些字段
    })({ store })
  }
})
```

### 场景 2：日志插件

```javascript
// plugins/logging.js
export function loggingPlugin({ store }) {
  const logs = []
  
  // 记录 action 调用
  store.$onAction(({ name, args, after, onError }) => {
    const startTime = Date.now()
    const logEntry = {
      type: 'action',
      name,
      args,
      timestamp: startTime,
      storeId: store.$id
    }
    
    after((result) => {
      logEntry.duration = Date.now() - startTime
      logEntry.result = result
      logEntry.status = 'success'
      logs.push(logEntry)
    })
    
    onError((error) => {
      logEntry.duration = Date.now() - startTime
      logEntry.error = error.message
      logEntry.status = 'error'
      logs.push(logEntry)
    })
  })
  
  // 记录 state 变化
  store.$subscribe((mutation, state) => {
    logs.push({
      type: 'mutation',
      mutationType: mutation.type,
      timestamp: Date.now(),
      storeId: store.$id,
      state: JSON.parse(JSON.stringify(state))
    })
  })
  
  // 暴露日志
  store.$getLogs = () => logs
  store.$clearLogs = () => logs.length = 0
}
```

### 场景 3：同步插件

```javascript
// plugins/sync.js
import { debounce } from 'lodash-es'

export function syncPlugin({ store }) {
  // 只同步特定 Store
  const syncableStores = ['user', 'cart', 'settings']
  
  if (!syncableStores.includes(store.$id)) {
    return
  }
  
  // 防抖同步函数
  const syncToServer = debounce(async (state) => {
    try {
      await fetch(`/api/sync/${store.$id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      })
      
      console.log(`[${store.$id}] 同步成功`)
    } catch (error) {
      console.error(`[${store.$id}] 同步失败:`, error)
    }
  }, 2000)
  
  // 订阅变化
  store.$subscribe(
    (mutation, state) => {
      syncToServer(state)
    },
    { detached: true }
  )
  
  // 添加手动同步方法
  store.$sync = () => syncToServer.flush()
}
```

### 场景 4：重置插件

```javascript
// plugins/reset.js
export function resetPlugin({ store, options }) {
  // 保存初始状态
  const initialState = options.state ? options.state() : {}
  
  // 添加重置方法（Setup Store 不自带 $reset）
  if (!store.$reset) {
    store.$reset = function() {
      this.$patch(($state) => {
        Object.assign($state, initialState)
      })
    }
  }
  
  // 添加部分重置方法
  store.$resetField = function(field) {
    if (field in initialState) {
      this[field] = initialState[field]
    }
  }
}
```

## 插件的执行顺序与上下文

### 执行顺序

插件按注册顺序执行：

```javascript
const pinia = createPinia()

// 插件1：最先执行
pinia.use(plugin1)

// 插件2：第二执行
pinia.use(plugin2)

// 插件3：最后执行
pinia.use(plugin3)
```

### 插件间通信

插件可以通过 Store 实例共享数据：

```javascript
// 插件1：设置数据
function plugin1({ store }) {
  store._pluginData = {
    initialized: true,
    timestamp: Date.now()
  }
}

// 插件2：使用数据
function plugin2({ store }) {
  if (store._pluginData?.initialized) {
    console.log('Store 已被插件1初始化')
  }
}

pinia.use(plugin1)
pinia.use(plugin2)
```

### 访问 Pinia 实例

```javascript
function globalPlugin({ pinia, store }) {
  // 在 pinia 实例上存储全局数据
  if (!pinia._customGlobal) {
    pinia._customGlobal = {
      stores: [],
      totalActions: 0
    }
  }
  
  // 记录所有 Store
  pinia._customGlobal.stores.push(store.$id)
  
  // 统计 action 调用
  store.$onAction(() => {
    pinia._customGlobal.totalActions++
  })
}
```

## 关键点总结

1. **插件是函数**：接收 `{ pinia, app, store, options }` 参数
2. **注册方式**：`pinia.use(plugin)`
3. **扩展能力**：添加属性、方法、订阅变化
4. **常用场景**：持久化、日志、同步、重置
5. **执行顺序**：按注册顺序依次执行

## 深入一点

### TypeScript 插件

```typescript
import { PiniaPluginContext } from 'pinia'

// 声明插件添加的类型
declare module 'pinia' {
  export interface PiniaCustomProperties {
    $api: AxiosInstance
    $log: (message: string) => void
  }
  
  export interface PiniaCustomStateProperties {
    _loading: boolean
    _error: string | null
  }
}

// 插件实现
export function apiPlugin({ store }: PiniaPluginContext) {
  store.$api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
  })
  
  store.$log = function(message: string) {
    console.log(`[${this.$id}] ${message}`)
  }
}
```

### 条件插件

```javascript
export function conditionalPlugin({ store }) {
  // 只对特定 Store 生效
  if (store.$id === 'user') {
    // 用户 Store 专用逻辑
    store.$subscribe((mutation, state) => {
      // 保存到 sessionStorage
      sessionStorage.setItem('user', JSON.stringify(state))
    })
  } else if (store.$id.startsWith('cache-')) {
    // 缓存 Store 专用逻辑
    const maxAge = 5 * 60 * 1000 // 5分钟
    let timestamp = Date.now()
    
    store.$subscribe(() => {
      timestamp = Date.now()
    })
    
    store.$isStale = () => Date.now() - timestamp > maxAge
  }
}
```

### 插件工厂模式

```javascript
// 创建可配置的插件
export function createPlugin(options) {
  return function plugin({ store }) {
    const {
      enableLogging = false,
      enablePersistence = false,
      persistenceKey = store.$id
    } = options
    
    if (enableLogging) {
      store.$onAction(({ name }) => {
        console.log(`Action: ${name}`)
      })
    }
    
    if (enablePersistence) {
      const saved = localStorage.getItem(persistenceKey)
      if (saved) {
        store.$patch(JSON.parse(saved))
      }
      
      store.$subscribe((mutation, state) => {
        localStorage.setItem(persistenceKey, JSON.stringify(state))
      })
    }
  }
}

// 使用
pinia.use(createPlugin({
  enableLogging: true,
  enablePersistence: true,
  persistenceKey: 'my-app-state'
}))
```

### 异步插件初始化

```javascript
export function asyncPlugin({ store }) {
  // 标记为正在初始化
  store._initializing = true
  
  // 异步初始化
  Promise.resolve().then(async () => {
    try {
      // 从服务器加载初始数据
      const response = await fetch(`/api/init/${store.$id}`)
      const data = await response.json()
      
      store.$patch(data)
      store._initializing = false
      store._initialized = true
    } catch (error) {
      console.error('初始化失败:', error)
      store._initializing = false
      store._initError = error
    }
  })
}
```

### 热更新支持

```javascript
export function hmrPlugin({ store, app }) {
  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      console.log(`Store ${store.$id} 热更新`)
    })
    
    // 保留状态
    import.meta.hot.dispose(() => {
      const state = store.$state
      import.meta.hot?.data.set(store.$id, state)
    })
    
    // 恢复状态
    const savedState = import.meta.hot?.data.get(store.$id)
    if (savedState) {
      store.$patch(savedState)
    }
  }
}
```

## 参考资料

- [Pinia Plugins 文档](https://pinia.vuejs.org/core-concepts/plugins.html)
- [pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate)
- [编写 Vue 插件](https://vuejs.org/guide/reusability/plugins.html)
