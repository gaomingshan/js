# 第 31 节：插件系统

## 概述

Vuex 的插件系统提供了扩展 Store 功能的机制。插件本质上是一个函数，接收 Store 作为唯一参数，可以监听 mutation，或者向 Store 添加额外的功能。

## 一、插件基础

### 1.1 基本插件结构

```javascript
// 基本插件模板
const basicPlugin = (store) => {
  // 插件初始化逻辑
  console.log('Plugin initialized')
  
  // 订阅 mutation 变化
  store.subscribe((mutation, state) => {
    console.log('Mutation:', mutation.type)
    console.log('Payload:', mutation.payload)
    console.log('State:', state)
  })
  
  // 订阅 action 分发
  store.subscribeAction({
    before: (action, state) => {
      console.log(`Action ${action.type} started`)
    },
    after: (action, state) => {
      console.log(`Action ${action.type} completed`)
    },
    error: (action, state, error) => {
      console.log(`Action ${action.type} failed:`, error)
    }
  })
}

// 使用插件
const store = createStore({
  // store 配置...
  plugins: [basicPlugin]
})
```

### 1.2 插件工厂函数

```javascript
// 可配置的插件工厂
const createLoggerPlugin = (options = {}) => {
  const {
    logMutations = true,
    logActions = true,
    logLevel = 'info',
    filter = () => true
  } = options
  
  return (store) => {
    if (logMutations) {
      store.subscribe((mutation, state) => {
        if (filter(mutation, state)) {
          console[logLevel](`[Mutation] ${mutation.type}`, mutation.payload)
        }
      })
    }
    
    if (logActions) {
      store.subscribeAction({
        before: (action, state) => {
          if (filter(action, state)) {
            console[logLevel](`[Action] ${action.type} started`)
          }
        }
      })
    }
  }
}

// 使用配置化插件
const store = createStore({
  plugins: [
    createLoggerPlugin({
      logLevel: 'debug',
      filter: (mutation) => !mutation.type.includes('INTERNAL_')
    })
  ]
})
```

## 二、常用插件实现

### 2.1 本地存储插件

```javascript
// 本地存储持久化插件
const createPersistencePlugin = (options = {}) => {
  const {
    storageKey = 'vuex',
    storage = localStorage,
    reducer = state => state,
    subscriber = store => handler => store.subscribe(handler)
  } = options
  
  return store => {
    // 从存储中恢复状态
    const savedState = storage.getItem(storageKey)
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        store.replaceState(Object.assign({}, store.state, parsedState))
      } catch (error) {
        console.error('Failed to restore state from storage:', error)
      }
    }
    
    // 监听状态变化并保存
    subscriber(store)((mutation, state) => {
      try {
        const stateToSave = reducer(state)
        storage.setItem(storageKey, JSON.stringify(stateToSave))
      } catch (error) {
        console.error('Failed to save state to storage:', error)
      }
    })
  }
}

// 高级持久化插件
const createAdvancedPersistencePlugin = (config) => {
  const {
    key = 'vuex',
    paths = [], // 要持久化的状态路径
    reducer = state => state,
    transformer = {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    },
    storage = localStorage,
    asyncStorage = false
  } = config
  
  return store => {
    // 获取需要持久化的状态部分
    const getStateToPersist = (state) => {
      if (paths.length === 0) return reducer(state)
      
      const result = {}
      paths.forEach(path => {
        const value = getNestedValue(state, path)
        if (value !== undefined) {
          setNestedValue(result, path, value)
        }
      })
      return reducer(result)
    }
    
    // 恢复状态
    const restoreState = async () => {
      try {
        let savedData
        if (asyncStorage) {
          savedData = await storage.getItem(key)
        } else {
          savedData = storage.getItem(key)
        }
        
        if (savedData) {
          const parsedState = transformer.deserialize(savedData)
          store.replaceState(Object.assign({}, store.state, parsedState))
        }
      } catch (error) {
        console.error('Failed to restore state:', error)
      }
    }
    
    // 保存状态
    const saveState = async (state) => {
      try {
        const stateToSave = getStateToPersist(state)
        const serializedState = transformer.serialize(stateToSave)
        
        if (asyncStorage) {
          await storage.setItem(key, serializedState)
        } else {
          storage.setItem(key, serializedState)
        }
      } catch (error) {
        console.error('Failed to save state:', error)
      }
    }
    
    // 初始化恢复
    restoreState()
    
    // 监听变化
    store.subscribe((mutation, state) => {
      saveState(state)
    })
  }
}

// 辅助函数
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current && current[key], obj)
}

const setNestedValue = (obj, path, value) => {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {}
    return current[key]
  }, obj)
  target[lastKey] = value
}
```

### 2.2 缓存插件

```javascript
// 智能缓存插件
const createCachePlugin = (options = {}) => {
  const {
    maxAge = 5 * 60 * 1000, // 5分钟
    maxSize = 100,
    storage = new Map()
  } = options
  
  return store => {
    // 为 store 添加缓存功能
    store.cache = {
      get(key) {
        const item = storage.get(key)
        if (!item) return null
        
        // 检查是否过期
        if (Date.now() - item.timestamp > maxAge) {
          storage.delete(key)
          return null
        }
        
        return item.data
      },
      
      set(key, data) {
        // 检查缓存大小
        if (storage.size >= maxSize) {
          // 删除最旧的项目
          const firstKey = storage.keys().next().value
          storage.delete(firstKey)
        }
        
        storage.set(key, {
          data,
          timestamp: Date.now()
        })
      },
      
      clear() {
        storage.clear()
      },
      
      delete(key) {
        storage.delete(key)
      }
    }
    
    // 定期清理过期缓存
    setInterval(() => {
      const now = Date.now()
      for (const [key, item] of storage.entries()) {
        if (now - item.timestamp > maxAge) {
          storage.delete(key)
        }
      }
    }, maxAge)
  }
}
```

### 2.3 网络状态插件

```javascript
// 网络状态监控插件
const createNetworkPlugin = () => {
  return store => {
    // 添加网络状态到 store
    if (!store.state.network) {
      store.registerModule('network', {
        state: {
          online: navigator.onLine,
          connectionType: null,
          lastOnlineAt: navigator.onLine ? new Date() : null,
          offlineActions: []
        },
        
        mutations: {
          SET_ONLINE_STATUS(state, online) {
            state.online = online
            if (online) {
              state.lastOnlineAt = new Date()
            }
          },
          
          SET_CONNECTION_TYPE(state, type) {
            state.connectionType = type
          },
          
          ADD_OFFLINE_ACTION(state, action) {
            if (!state.online) {
              state.offlineActions.push({
                ...action,
                timestamp: Date.now()
              })
            }
          },
          
          CLEAR_OFFLINE_ACTIONS(state) {
            state.offlineActions = []
          }
        },
        
        actions: {
          async processOfflineActions({ state, commit, dispatch }) {
            if (!state.online || state.offlineActions.length === 0) return
            
            const actions = [...state.offlineActions]
            commit('CLEAR_OFFLINE_ACTIONS')
            
            for (const action of actions) {
              try {
                await dispatch(action.type, action.payload, { root: true })
              } catch (error) {
                console.error('Failed to process offline action:', error)
                // 重新加入队列或记录错误
              }
            }
          }
        }
      })
    }
    
    // 监听网络状态变化
    const updateOnlineStatus = () => {
      store.commit('network/SET_ONLINE_STATUS', navigator.onLine)
      
      if (navigator.onLine) {
        store.dispatch('network/processOfflineActions')
      }
    }
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // 监听连接类型变化
    if ('connection' in navigator) {
      const connection = navigator.connection
      
      const updateConnectionType = () => {
        store.commit('network/SET_CONNECTION_TYPE', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        })
      }
      
      connection.addEventListener('change', updateConnectionType)
      updateConnectionType() // 初始设置
    }
    
    // 拦截离线时的 actions
    store.subscribeAction({
      before: (action, state) => {
        if (!state.network.online && action.type.includes('FETCH_')) {
          store.commit('network/ADD_OFFLINE_ACTION', action)
        }
      }
    })
  }
}
```

## 三、开发工具插件

### 3.1 调试插件

```javascript
// 开发环境调试插件
const createDebugPlugin = (options = {}) => {
  const {
    logMutations = true,
    logActions = true,
    logTimeTravel = true,
    maxHistoryLength = 100
  } = options
  
  if (process.env.NODE_ENV !== 'development') {
    return () => {} // 生产环境不启用
  }
  
  return store => {
    const history = []
    let currentIndex = -1
    
    // 记录状态历史
    const recordState = (mutation, state) => {
      const snapshot = {
        mutation: {
          type: mutation.type,
          payload: mutation.payload
        },
        state: JSON.parse(JSON.stringify(state)),
        timestamp: Date.now()
      }
      
      // 移除当前位置之后的历史
      history.splice(currentIndex + 1)
      
      // 添加新状态
      history.push(snapshot)
      currentIndex = history.length - 1
      
      // 限制历史长度
      if (history.length > maxHistoryLength) {
        history.shift()
        currentIndex--
      }
    }
    
    // 时间旅行功能
    store.timeTravel = {
      canUndo: () => currentIndex > 0,
      canRedo: () => currentIndex < history.length - 1,
      
      undo() {
        if (this.canUndo()) {
          currentIndex--
          const snapshot = history[currentIndex]
          store.replaceState(snapshot.state)
          
          if (logTimeTravel) {
            console.log('🔄 Time travel: UNDO to', snapshot.mutation.type)
          }
        }
      },
      
      redo() {
        if (this.canRedo()) {
          currentIndex++
          const snapshot = history[currentIndex]
          store.replaceState(snapshot.state)
          
          if (logTimeTravel) {
            console.log('🔄 Time travel: REDO to', snapshot.mutation.type)
          }
        }
      },
      
      getHistory: () => [...history],
      jumpTo(index) {
        if (index >= 0 && index < history.length) {
          currentIndex = index
          const snapshot = history[index]
          store.replaceState(snapshot.state)
          
          if (logTimeTravel) {
            console.log('🔄 Time travel: JUMP to', snapshot.mutation.type)
          }
        }
      }
    }
    
    // 记录初始状态
    recordState({ type: 'INIT', payload: null }, store.state)
    
    // 监听 mutations
    store.subscribe((mutation, state) => {
      recordState(mutation, state)
      
      if (logMutations) {
        console.group(`🔄 ${mutation.type}`)
        console.log('Payload:', mutation.payload)
        console.log('State:', state)
        console.groupEnd()
      }
    })
    
    // 监听 actions
    if (logActions) {
      store.subscribeAction({
        before: (action, state) => {
          console.time(`⚡ ${action.type}`)
          console.log(`⚡ Action ${action.type} started`, action.payload)
        },
        after: (action, state) => {
          console.timeEnd(`⚡ ${action.type}`)
          console.log(`✅ Action ${action.type} completed`)
        },
        error: (action, state, error) => {
          console.timeEnd(`⚡ ${action.type}`)
          console.error(`❌ Action ${action.type} failed:`, error)
        }
      })
    }
  }
}
```

### 3.2 性能监控插件

```javascript
// 性能监控插件
const createPerformancePlugin = (options = {}) => {
  const {
    measureMutations = true,
    measureActions = true,
    slowThreshold = 16, // 16ms
    reportInterval = 10000 // 10秒
  } = options
  
  return store => {
    const metrics = {
      mutations: new Map(),
      actions: new Map(),
      slowOperations: []
    }
    
    // 测量 mutation 性能
    if (measureMutations) {
      store.subscribe((mutation, state) => {
        const start = performance.now()
        
        // 使用 nextTick 确保 DOM 更新完成后测量
        Vue.nextTick(() => {
          const duration = performance.now() - start
          
          // 记录性能数据
          const mutationType = mutation.type
          if (!metrics.mutations.has(mutationType)) {
            metrics.mutations.set(mutationType, {
              count: 0,
              totalTime: 0,
              maxTime: 0,
              minTime: Infinity
            })
          }
          
          const stat = metrics.mutations.get(mutationType)
          stat.count++
          stat.totalTime += duration
          stat.maxTime = Math.max(stat.maxTime, duration)
          stat.minTime = Math.min(stat.minTime, duration)
          
          // 记录慢操作
          if (duration > slowThreshold) {
            metrics.slowOperations.push({
              type: 'mutation',
              name: mutationType,
              duration,
              timestamp: Date.now(),
              payload: mutation.payload
            })
          }
        })
      })
    }
    
    // 测量 action 性能
    if (measureActions) {
      const actionTimes = new Map()
      
      store.subscribeAction({
        before: (action, state) => {
          actionTimes.set(action, performance.now())
        },
        after: (action, state) => {
          const startTime = actionTimes.get(action)
          if (startTime) {
            const duration = performance.now() - startTime
            actionTimes.delete(action)
            
            // 记录性能数据
            const actionType = action.type
            if (!metrics.actions.has(actionType)) {
              metrics.actions.set(actionType, {
                count: 0,
                totalTime: 0,
                maxTime: 0,
                minTime: Infinity
              })
            }
            
            const stat = metrics.actions.get(actionType)
            stat.count++
            stat.totalTime += duration
            stat.maxTime = Math.max(stat.maxTime, duration)
            stat.minTime = Math.min(stat.minTime, duration)
            
            // 记录慢操作
            if (duration > slowThreshold) {
              metrics.slowOperations.push({
                type: 'action',
                name: actionType,
                duration,
                timestamp: Date.now(),
                payload: action.payload
              })
            }
          }
        }
      })
    }
    
    // 添加性能报告方法
    store.performance = {
      getReport() {
        const report = {
          mutations: {},
          actions: {},
          slowOperations: [...metrics.slowOperations]
        }
        
        // 生成 mutation 报告
        for (const [type, stat] of metrics.mutations.entries()) {
          report.mutations[type] = {
            ...stat,
            avgTime: stat.totalTime / stat.count
          }
        }
        
        // 生成 action 报告
        for (const [type, stat] of metrics.actions.entries()) {
          report.actions[type] = {
            ...stat,
            avgTime: stat.totalTime / stat.count
          }
        }
        
        return report
      },
      
      clearMetrics() {
        metrics.mutations.clear()
        metrics.actions.clear()
        metrics.slowOperations.length = 0
      },
      
      getSlowOperations() {
        return metrics.slowOperations.slice()
      }
    }
    
    // 定期报告
    if (reportInterval > 0) {
      setInterval(() => {
        const report = store.performance.getReport()
        console.log('📊 Vuex Performance Report:', report)
      }, reportInterval)
    }
  }
}
```

## 四、第三方插件集成

### 4.1 WebSocket 插件

```javascript
// WebSocket 集成插件
const createWebSocketPlugin = (url, options = {}) => {
  const {
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    messageHandler = () => {},
    protocols = []
  } = options
  
  return store => {
    let socket = null
    let reconnectAttempts = 0
    
    const connect = () => {
      socket = new WebSocket(url, protocols)
      
      socket.onopen = () => {
        console.log('WebSocket connected')
        reconnectAttempts = 0
        store.commit('websocket/SET_CONNECTION_STATUS', 'connected')
      }
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          messageHandler(data, store)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      socket.onclose = () => {
        console.log('WebSocket disconnected')
        store.commit('websocket/SET_CONNECTION_STATUS', 'disconnected')
        
        // 自动重连
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts++
            connect()
          }, reconnectInterval)
        }
      }
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        store.commit('websocket/SET_ERROR', error)
      }
    }
    
    // 注册 WebSocket 模块
    store.registerModule('websocket', {
      state: {
        connectionStatus: 'disconnected',
        error: null
      },
      
      mutations: {
        SET_CONNECTION_STATUS(state, status) {
          state.connectionStatus = status
        },
        
        SET_ERROR(state, error) {
          state.error = error
        }
      },
      
      actions: {
        send({ state }, message) {
          if (state.connectionStatus === 'connected' && socket) {
            socket.send(JSON.stringify(message))
          }
        },
        
        disconnect() {
          if (socket) {
            socket.close()
          }
        }
      }
    })
    
    // 建立连接
    connect()
    
    // 清理
    store.websocketCleanup = () => {
      if (socket) {
        socket.close()
      }
    }
  }
}
```

### 4.2 路由同步插件

```javascript
// Vue Router 同步插件
const createRouterSyncPlugin = (router) => {
  return store => {
    // 注册路由模块
    store.registerModule('route', {
      state: {
        current: null,
        history: [],
        params: {},
        query: {}
      },
      
      mutations: {
        SET_CURRENT_ROUTE(state, route) {
          state.current = route
          state.params = route.params || {}
          state.query = route.query || {}
        },
        
        ADD_TO_HISTORY(state, route) {
          state.history.push({
            ...route,
            timestamp: Date.now()
          })
          
          // 限制历史长度
          if (state.history.length > 50) {
            state.history.shift()
          }
        }
      }
    })
    
    // 监听路由变化
    router.beforeEach((to, from, next) => {
      store.commit('route/SET_CURRENT_ROUTE', to)
      if (from.name) {
        store.commit('route/ADD_TO_HISTORY', from)
      }
      next()
    })
    
    // 初始化当前路由
    if (router.currentRoute.value) {
      store.commit('route/SET_CURRENT_ROUTE', router.currentRoute.value)
    }
  }
}
```

## 五、插件开发最佳实践

### 5.1 插件测试

```javascript
// 插件测试示例
import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'vuex'

describe('Logger Plugin', () => {
  let store
  let logs
  
  beforeEach(() => {
    logs = []
    
    // 创建测试插件
    const testLoggerPlugin = (store) => {
      store.subscribe((mutation, state) => {
        logs.push({
          type: mutation.type,
          payload: mutation.payload,
          state: JSON.parse(JSON.stringify(state))
        })
      })
    }
    
    // 创建测试 store
    store = createStore({
      state: { count: 0 },
      mutations: {
        INCREMENT(state) {
          state.count++
        }
      },
      plugins: [testLoggerPlugin]
    })
  })
  
  it('should log mutations', () => {
    store.commit('INCREMENT')
    
    expect(logs).toHaveLength(1)
    expect(logs[0].type).toBe('INCREMENT')
    expect(logs[0].state.count).toBe(1)
  })
})
```

### 5.2 插件文档

```javascript
/**
 * Vuex 持久化插件
 * 
 * @description 自动保存和恢复 Vuex 状态到本地存储
 * 
 * @param {Object} options 配置选项
 * @param {string} options.key 存储键名，默认 'vuex'
 * @param {Storage} options.storage 存储对象，默认 localStorage
 * @param {string[]} options.paths 要持久化的状态路径
 * @param {Function} options.reducer 状态缩减函数
 * @param {Object} options.transformer 序列化/反序列化函数
 * 
 * @example
 * import { createStore } from 'vuex'
 * import { createPersistencePlugin } from './plugins/persistence'
 * 
 * const store = createStore({
 *   // store 配置...
 *   plugins: [
 *     createPersistencePlugin({
 *       key: 'my-app-state',
 *       paths: ['user', 'settings']
 *     })
 *   ]
 * })
 * 
 * @returns {Function} Vuex 插件函数
 */
const createPersistencePlugin = (options = {}) => {
  // 插件实现...
}
```

## 参考资料

- [Vuex Plugins 文档](https://vuex.vuejs.org/guide/plugins.html)
- [官方 Logger 插件](https://github.com/vuejs/vuex/tree/dev/src/plugins)
- [Vue DevTools](https://devtools.vuejs.org/)

**下一节** → [第 32 节：严格模式](./32-vuex-strict-mode.md)
