# 第 43 节：微前端状态共享

## 概述

微前端架构中的状态管理需要解决跨应用数据共享、状态同步和隔离等挑战。本节介绍如何在微前端环境中实现有效的状态共享策略。

## 一、微前端状态管理架构

### 1.1 状态共享层次

```javascript
// 微前端状态架构
const microfrontendStateArchitecture = {
  // 全局共享状态
  global: {
    user: '用户认证信息',
    theme: '主题配置',
    permissions: '权限数据',
    notifications: '全局通知'
  },
  
  // 应用间共享状态
  crossApp: {
    shoppingCart: '购物车数据',
    searchHistory: '搜索历史',
    preferences: '用户偏好'
  },
  
  // 应用内部状态
  local: {
    componentState: '组件状态',
    pageState: '页面状态',
    formData: '表单数据'
  }
}
```

### 1.2 通信模式

```javascript
// 微前端通信模式
export class MicrofrontendCommunicator {
  constructor() {
    this.eventBus = new EventTarget()
    this.subscribers = new Map()
    this.sharedState = new Proxy({}, {
      set: (target, key, value) => {
        target[key] = value
        this.notifyChange(key, value)
        return true
      }
    })
  }
  
  // 发布事件
  publish(event, data) {
    this.eventBus.dispatchEvent(new CustomEvent(event, { detail: data }))
  }
  
  // 订阅事件
  subscribe(event, callback) {
    const handler = (e) => callback(e.detail)
    this.eventBus.addEventListener(event, handler)
    
    // 返回取消订阅函数
    return () => this.eventBus.removeEventListener(event, handler)
  }
  
  // 设置共享状态
  setState(key, value) {
    this.sharedState[key] = value
  }
  
  // 获取共享状态
  getState(key) {
    return this.sharedState[key]
  }
  
  // 通知状态变化
  notifyChange(key, value) {
    this.publish('stateChange', { key, value })
  }
}

// 全局通信实例
export const globalCommunicator = new MicrofrontendCommunicator()
```

## 二、基于 CustomEvent 的状态共享

### 2.1 事件总线实现

```javascript
// shared/eventBus.js
class MicrofrontendEventBus {
  constructor() {
    this.events = new Map()
  }
  
  // 注册事件监听
  on(event, callback, options = {}) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    
    const listener = { callback, options }
    this.events.get(event).push(listener)
    
    // 返回取消监听函数
    return () => {
      const listeners = this.events.get(event)
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
  
  // 触发事件
  emit(event, data) {
    if (!this.events.has(event)) return
    
    const listeners = this.events.get(event)
    listeners.forEach(({ callback, options }) => {
      try {
        callback(data)
        
        // 一次性监听器
        if (options.once) {
          this.off(event, callback)
        }
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    })
  }
  
  // 移除监听器
  off(event, callback) {
    if (!this.events.has(event)) return
    
    const listeners = this.events.get(event)
    const index = listeners.findIndex(l => l.callback === callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
  
  // 清空所有监听器
  clear() {
    this.events.clear()
  }
}

export const eventBus = new MicrofrontendEventBus()

// 状态同步中间件
export function createStateSyncMiddleware(eventBus) {
  return (store) => {
    // 监听远程状态变化
    eventBus.on('state:update', ({ module, key, value }) => {
      if (store.hasModule && store.hasModule(module)) {
        store.commit(`${module}/SET_${key.toUpperCase()}`, value)
      }
    })
    
    // 监听本地状态变化并广播
    store.subscribe((mutation, state) => {
      const [module, mutationType] = mutation.type.split('/')
      
      if (mutationType?.startsWith('SET_')) {
        const key = mutationType.replace('SET_', '').toLowerCase()
        eventBus.emit('state:update', {
          module,
          key,
          value: mutation.payload
        })
      }
    })
  }
}
```

### 2.2 Pinia 跨应用状态同步

```javascript
// shared/crossAppStore.js
import { defineStore } from 'pinia'
import { eventBus } from './eventBus'

export const useCrossAppStore = defineStore('crossApp', {
  state: () => ({
    user: null,
    theme: 'light',
    notifications: [],
    sharedData: {}
  }),
  
  actions: {
    // 初始化跨应用通信
    initCrossAppCommunication() {
      // 监听其他应用的状态变化
      eventBus.on('cross-app:state-change', (data) => {
        this.handleRemoteStateChange(data)
      })
      
      // 监听用户状态变化
      eventBus.on('user:login', (user) => {
        this.setUser(user)
      })
      
      eventBus.on('user:logout', () => {
        this.setUser(null)
      })
    },
    
    // 设置用户信息
    setUser(user) {
      this.user = user
      this.broadcastStateChange('user', user)
    },
    
    // 设置主题
    setTheme(theme) {
      this.theme = theme
      this.broadcastStateChange('theme', theme)
      
      // 更新 DOM
      document.documentElement.setAttribute('data-theme', theme)
    },
    
    // 添加通知
    addNotification(notification) {
      const id = Date.now()
      const fullNotification = { id, timestamp: new Date(), ...notification }
      
      this.notifications.push(fullNotification)
      this.broadcastStateChange('notifications', this.notifications)
      
      return id
    },
    
    // 移除通知
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
      this.broadcastStateChange('notifications', this.notifications)
    },
    
    // 设置共享数据
    setSharedData(key, value) {
      this.sharedData[key] = value
      this.broadcastStateChange('sharedData', this.sharedData)
    },
    
    // 广播状态变化
    broadcastStateChange(key, value) {
      eventBus.emit('cross-app:state-change', {
        source: window.__MICRO_APP_NAME__ || 'unknown',
        key,
        value,
        timestamp: Date.now()
      })
    },
    
    // 处理远程状态变化
    handleRemoteStateChange({ source, key, value, timestamp }) {
      // 避免循环更新
      if (source === (window.__MICRO_APP_NAME__ || 'unknown')) return
      
      // 更新本地状态
      switch (key) {
        case 'user':
          this.$patch({ user: value })
          break
        case 'theme':
          this.$patch({ theme: value })
          document.documentElement.setAttribute('data-theme', value)
          break
        case 'notifications':
          this.$patch({ notifications: value })
          break
        case 'sharedData':
          this.$patch({ sharedData: value })
          break
      }
    }
  }
})
```

## 三、基于 localStorage 的状态共享

### 3.1 存储同步机制

```javascript
// shared/storageSync.js
export class StorageSync {
  constructor(options = {}) {
    this.prefix = options.prefix || 'mf:'
    this.storage = options.storage || localStorage
    this.subscribers = new Map()
    
    this.setupStorageListener()
  }
  
  // 监听 storage 变化
  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith(this.prefix)) {
        const key = e.key.replace(this.prefix, '')
        const newValue = e.newValue ? JSON.parse(e.newValue) : null
        const oldValue = e.oldValue ? JSON.parse(e.oldValue) : null
        
        this.notifySubscribers(key, newValue, oldValue)
      }
    })
  }
  
  // 设置值
  set(key, value) {
    const fullKey = this.prefix + key
    const serializedValue = JSON.stringify({
      value,
      timestamp: Date.now(),
      source: window.__MICRO_APP_NAME__ || 'unknown'
    })
    
    this.storage.setItem(fullKey, serializedValue)
  }
  
  // 获取值
  get(key) {
    const fullKey = this.prefix + key
    const item = this.storage.getItem(fullKey)
    
    if (!item) return null
    
    try {
      const parsed = JSON.parse(item)
      return parsed.value
    } catch (error) {
      console.error('Failed to parse storage item:', error)
      return null
    }
  }
  
  // 订阅变化
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, [])
    }
    
    this.subscribers.get(key).push(callback)
    
    return () => {
      const callbacks = this.subscribers.get(key)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
  
  // 通知订阅者
  notifySubscribers(key, newValue, oldValue) {
    const callbacks = this.subscribers.get(key) || []
    callbacks.forEach(callback => {
      try {
        callback(newValue, oldValue, key)
      } catch (error) {
        console.error('Error in storage subscriber:', error)
      }
    })
  }
  
  // 清理过期数据
  cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24小时
    const now = Date.now()
    
    Object.keys(this.storage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(this.storage.getItem(key))
          if (now - item.timestamp > maxAge) {
            this.storage.removeItem(key)
          }
        } catch (error) {
          // 清理损坏的数据
          this.storage.removeItem(key)
        }
      }
    })
  }
}

export const storageSync = new StorageSync()

// Pinia 插件
export function createStorageSyncPlugin(keys = []) {
  return (context) => {
    const { store } = context
    
    // 恢复状态
    keys.forEach(key => {
      const value = storageSync.get(`${store.$id}.${key}`)
      if (value !== null) {
        store.$patch({ [key]: value })
      }
    })
    
    // 监听变化并同步
    store.$subscribe((mutation, state) => {
      keys.forEach(key => {
        if (key in state) {
          storageSync.set(`${store.$id}.${key}`, state[key])
        }
      })
    })
    
    // 监听远程变化
    keys.forEach(key => {
      storageSync.subscribe(`${store.$id}.${key}`, (newValue) => {
        store.$patch({ [key]: newValue })
      })
    })
  }
}
```

## 四、qiankun 集成方案

### 4.1 主应用状态管理

```javascript
// 主应用 main-app/src/store/index.js
import { createPinia } from 'pinia'
import { createApp } from 'vue'

export const mainPinia = createPinia()

// 全局状态管理
export const useGlobalStore = defineStore('global', {
  state: () => ({
    user: null,
    permissions: [],
    theme: 'light',
    microApps: new Map()
  }),
  
  actions: {
    // 注册微应用
    registerMicroApp(name, instance) {
      this.microApps.set(name, instance)
    },
    
    // 注销微应用
    unregisterMicroApp(name) {
      this.microApps.delete(name)
    },
    
    // 向所有微应用广播状态变化
    broadcastToMicroApps(event, data) {
      this.microApps.forEach((instance, name) => {
        if (instance.globalEventBus) {
          instance.globalEventBus.emit(event, data)
        }
      })
    },
    
    // 设置用户信息
    setUser(user) {
      this.user = user
      this.broadcastToMicroApps('user:change', user)
    },
    
    // 设置权限
    setPermissions(permissions) {
      this.permissions = permissions
      this.broadcastToMicroApps('permissions:change', permissions)
    },
    
    // 切换主题
    setTheme(theme) {
      this.theme = theme
      document.documentElement.setAttribute('data-theme', theme)
      this.broadcastToMicroApps('theme:change', theme)
    }
  }
})

// qiankun 配置
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'micro-app-1',
    entry: '//localhost:3001',
    container: '#micro-app-container',
    activeRule: '/micro-app-1',
    props: {
      globalStore: useGlobalStore(),
      globalEventBus: eventBus
    }
  }
])

start()
```

### 4.2 微应用状态同步

```javascript
// 微应用 micro-app/src/store/index.js
export function createMicroAppStore(props = {}) {
  const pinia = createPinia()
  
  // 全局状态同步 store
  const useGlobalSyncStore = defineStore('globalSync', {
    state: () => ({
      user: null,
      permissions: [],
      theme: 'light'
    }),
    
    actions: {
      // 初始化与主应用的同步
      initSync() {
        const { globalStore, globalEventBus } = props
        
        if (!globalEventBus) return
        
        // 监听主应用状态变化
        globalEventBus.on('user:change', (user) => {
          this.user = user
        })
        
        globalEventBus.on('permissions:change', (permissions) => {
          this.permissions = permissions
        })
        
        globalEventBus.on('theme:change', (theme) => {
          this.theme = theme
          document.documentElement.setAttribute('data-theme', theme)
        })
        
        // 同步初始状态
        if (globalStore) {
          this.user = globalStore.user
          this.permissions = globalStore.permissions
          this.theme = globalStore.theme
        }
      },
      
      // 向主应用发送事件
      notifyMainApp(event, data) {
        const { globalEventBus } = props
        if (globalEventBus) {
          globalEventBus.emit(`micro:${event}`, {
            source: window.__MICRO_APP_NAME__,
            data
          })
        }
      }
    }
  })
  
  return { pinia, useGlobalSyncStore }
}

// 微应用入口
export async function mount(props) {
  const { pinia, useGlobalSyncStore } = createMicroAppStore(props)
  
  const app = createApp(App)
  app.use(pinia)
  
  // 初始化状态同步
  const globalSyncStore = useGlobalSyncStore()
  globalSyncStore.initSync()
  
  app.mount(props.container)
  
  return { app, pinia }
}
```

## 五、Module Federation 状态共享

### 5.1 共享状态模块

```javascript
// shared-state/webpack.config.js
const ModuleFederationPlugin = require('@module-federation/webpack')

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'sharedState',
      filename: 'remoteEntry.js',
      exposes: {
        './store': './src/store',
        './eventBus': './src/eventBus'
      },
      shared: {
        vue: { singleton: true },
        pinia: { singleton: true }
      }
    })
  ]
}

// shared-state/src/store.js
import { defineStore } from 'pinia'

export const useSharedStore = defineStore('shared', {
  state: () => ({
    user: null,
    theme: 'light',
    language: 'zh-CN',
    globalNotifications: []
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.user,
    currentTheme: (state) => state.theme
  },
  
  actions: {
    setUser(user) {
      this.user = user
      this.notifyChange('user', user)
    },
    
    setTheme(theme) {
      this.theme = theme
      this.notifyChange('theme', theme)
    },
    
    addGlobalNotification(notification) {
      const id = Date.now()
      this.globalNotifications.push({ ...notification, id })
      this.notifyChange('notifications', this.globalNotifications)
      return id
    },
    
    notifyChange(key, value) {
      window.dispatchEvent(new CustomEvent('sharedStateChange', {
        detail: { key, value }
      }))
    }
  }
})
```

### 5.2 消费应用集成

```javascript
// consumer-app/webpack.config.js
const ModuleFederationPlugin = require('@module-federation/webpack')

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'consumerApp',
      remotes: {
        sharedState: 'sharedState@http://localhost:3000/remoteEntry.js'
      },
      shared: {
        vue: { singleton: true },
        pinia: { singleton: true }
      }
    })
  ]
}

// consumer-app/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 动态导入共享状态
const loadSharedState = async () => {
  try {
    const { useSharedStore } = await import('sharedState/store')
    return useSharedStore
  } catch (error) {
    console.warn('Failed to load shared state:', error)
    return null
  }
}

export async function createAppWithSharedState() {
  const app = createApp(App)
  const pinia = createPinia()
  
  app.use(pinia)
  
  // 加载共享状态
  const useSharedStore = await loadSharedState()
  
  if (useSharedStore) {
    // 监听共享状态变化
    window.addEventListener('sharedStateChange', (event) => {
      const { key, value } = event.detail
      console.log(`Shared state changed: ${key}`, value)
    })
  }
  
  return { app, useSharedStore }
}
```

## 六、性能优化策略

### 6.1 状态更新优化

```javascript
// 防抖状态同步
export function createDebouncedSync(syncFunction, delay = 100) {
  let timeoutId = null
  const pendingUpdates = new Map()
  
  return (key, value) => {
    pendingUpdates.set(key, value)
    
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      const updates = Object.fromEntries(pendingUpdates)
      pendingUpdates.clear()
      syncFunction(updates)
    }, delay)
  }
}

// 批量状态更新
export function createBatchUpdater(store, batchSize = 10, delay = 50) {
  const updateQueue = []
  let timeoutId = null
  
  const processQueue = () => {
    const batch = updateQueue.splice(0, batchSize)
    
    if (batch.length > 0) {
      store.$patch((state) => {
        batch.forEach(({ key, value }) => {
          state[key] = value
        })
      })
      
      if (updateQueue.length > 0) {
        timeoutId = setTimeout(processQueue, delay)
      }
    }
  }
  
  return (key, value) => {
    updateQueue.push({ key, value })
    
    if (!timeoutId) {
      timeoutId = setTimeout(processQueue, delay)
    }
  }
}
```

## 参考资料

- [qiankun 微前端](https://qiankun.umijs.org/)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)
- [微前端架构设计](https://micro-frontends.org/)

**下一节** → [第 44 节：实时数据同步](./44-realtime-data-sync.md)
