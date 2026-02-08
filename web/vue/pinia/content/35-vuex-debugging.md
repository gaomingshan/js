# 第 35 节：调试技巧

## 概述

调试 Vuex 应用需要掌握多种工具和技巧。本节介绍如何有效调试 Vuex Store，包括使用 Vue DevTools、日志记录、状态快照和调试插件等方法。

## 一、Vue DevTools

### 1.1 基本使用

Vue DevTools 是调试 Vuex 最重要的工具，提供了完整的状态检查和时间旅行功能。

```javascript
// 确保在开发环境启用 DevTools
const store = createStore({
  // 启用 DevTools
  devtools: process.env.NODE_ENV !== 'production',
  
  state() {
    return {
      count: 0,
      user: null
    }
  },
  
  mutations: {
    INCREMENT(state) {
      state.count++
    }
  }
})
```

### 1.2 DevTools 高级功能

```javascript
// 为 mutations 添加更好的调试信息
const mutations = {
  // 使用描述性的命名
  INCREMENT_COUNTER(state) {
    state.count++
  },
  
  SET_USER_PROFILE(state, user) {
    state.user = user
  },
  
  // 添加调试注释
  UPDATE_COMPLEX_STATE(state, payload) {
    // DevTools 中会显示这个注释
    console.log('Updating complex state with:', payload)
    state.complexData = { ...state.complexData, ...payload }
  }
}

// 为 actions 添加调试信息
const actions = {
  async fetchUser({ commit }, userId) {
    console.log(`[Action] Fetching user ${userId}`)
    
    try {
      const user = await api.fetchUser(userId)
      console.log(`[Action] User fetched successfully:`, user)
      commit('SET_USER_PROFILE', user)
      return user
    } catch (error) {
      console.error(`[Action] Failed to fetch user ${userId}:`, error)
      throw error
    }
  }
}
```

## 二、日志调试

### 2.1 自定义日志插件

```javascript
// 创建详细的日志插件
const createLoggerPlugin = (options = {}) => {
  const {
    collapsed = true,
    filter = () => true,
    transformer = state => state,
    mutationTransformer = mut => mut,
    actionFilter = () => true,
    actionTransformer = act => act,
    logMutations = true,
    logActions = true,
    logStrictModeViolations = true,
    logger = console
  } = options
  
  return store => {
    let prevState = deepCopy(store.state)
    
    // 记录 mutations
    if (logMutations) {
      store.subscribe((mutation, state) => {
        const nextState = deepCopy(state)
        
        if (filter(mutation, prevState, nextState)) {
          const formattedTime = getFormattedTime()
          const formattedMutation = mutationTransformer(mutation)
          const message = `mutation ${mutation.type}${formattedTime}`
          
          const startMessage = collapsed
            ? logger.groupCollapsed.bind(logger, message)
            : logger.group.bind(logger, message)
          
          startMessage()
          
          logger.log('%c prev state', 'color: #9E9E9E; font-weight: bold', transformer(prevState))
          logger.log('%c mutation', 'color: #03A9F4; font-weight: bold', formattedMutation)
          logger.log('%c next state', 'color: #4CAF50; font-weight: bold', transformer(nextState))
          
          logger.groupEnd()
          
          prevState = nextState
        }
      })
    }
    
    // 记录 actions
    if (logActions) {
      store.subscribeAction({
        before: (action, state) => {
          if (actionFilter(action, state)) {
            const formattedTime = getFormattedTime()
            const formattedAction = actionTransformer(action)
            logger.log(`%c action ${action.type}${formattedTime}`, 'color: #FF9800; font-weight: bold', formattedAction)
          }
        },
        after: (action, state) => {
          // Action 完成后的日志
        },
        error: (action, state, error) => {
          logger.error(`Action ${action.type} failed:`, error)
        }
      })
    }
  }
}

// 工具函数
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function getFormattedTime() {
  const now = new Date()
  return ` @ ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`
}
```

### 2.2 条件日志记录

```javascript
// 基于条件的日志记录
const conditionalLogger = {
  logLevel: process.env.VUE_APP_LOG_LEVEL || 'info',
  
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  
  shouldLog(level) {
    return this.levels[level] >= this.levels[this.logLevel]
  },
  
  debug(...args) {
    if (this.shouldLog('debug')) {
      console.log('%c[DEBUG]', 'color: #999', ...args)
    }
  },
  
  info(...args) {
    if (this.shouldLog('info')) {
      console.log('%c[INFO]', 'color: #2196F3', ...args)
    }
  },
  
  warn(...args) {
    if (this.shouldLog('warn')) {
      console.warn('%c[WARN]', 'color: #FF9800', ...args)
    }
  },
  
  error(...args) {
    if (this.shouldLog('error')) {
      console.error('%c[ERROR]', 'color: #F44336', ...args)
    }
  }
}

// 在 store 中使用
const debugStore = createStore({
  plugins: [
    store => {
      store.subscribe((mutation, state) => {
        conditionalLogger.debug('Mutation:', mutation.type, mutation.payload)
      })
      
      store.subscribeAction({
        before: (action, state) => {
          conditionalLogger.info('Action started:', action.type)
        },
        error: (action, state, error) => {
          conditionalLogger.error('Action failed:', action.type, error)
        }
      })
    }
  ]
})
```

## 三、状态快照与回放

### 3.1 状态快照系统

```javascript
// 状态快照管理器
class StateSnapshotManager {
  constructor(store, options = {}) {
    this.store = store
    this.snapshots = []
    this.maxSnapshots = options.maxSnapshots || 50
    this.currentIndex = -1
    
    this.init()
  }
  
  init() {
    // 记录初始状态
    this.takeSnapshot('INIT')
    
    // 监听所有 mutations
    this.store.subscribe((mutation, state) => {
      this.takeSnapshot(mutation.type)
    })
  }
  
  takeSnapshot(mutationType) {
    const snapshot = {
      id: Date.now(),
      mutation: mutationType,
      state: JSON.parse(JSON.stringify(this.store.state)),
      timestamp: new Date().toISOString()
    }
    
    // 移除当前位置之后的快照
    this.snapshots.splice(this.currentIndex + 1)
    
    // 添加新快照
    this.snapshots.push(snapshot)
    this.currentIndex = this.snapshots.length - 1
    
    // 限制快照数量
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift()
      this.currentIndex--
    }
    
    this.notifySnapshot(snapshot)
  }
  
  // 时间旅行功能
  travelTo(index) {
    if (index >= 0 && index < this.snapshots.length) {
      this.currentIndex = index
      const snapshot = this.snapshots[index]
      this.store.replaceState(snapshot.state)
      
      console.log(`Time traveled to: ${snapshot.mutation} at ${snapshot.timestamp}`)
      return snapshot
    }
  }
  
  undo() {
    if (this.currentIndex > 0) {
      return this.travelTo(this.currentIndex - 1)
    }
  }
  
  redo() {
    if (this.currentIndex < this.snapshots.length - 1) {
      return this.travelTo(this.currentIndex + 1)
    }
  }
  
  // 导出快照历史
  exportHistory() {
    return {
      snapshots: this.snapshots,
      currentIndex: this.currentIndex,
      exportedAt: new Date().toISOString()
    }
  }
  
  // 导入快照历史
  importHistory(historyData) {
    this.snapshots = historyData.snapshots
    this.currentIndex = historyData.currentIndex
    
    if (this.snapshots[this.currentIndex]) {
      this.store.replaceState(this.snapshots[this.currentIndex].state)
    }
  }
  
  notifySnapshot(snapshot) {
    // 发送到开发者工具或其他调试界面
    if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('vuex:snapshot', snapshot)
    }
  }
}

// 使用快照管理器
const snapshotPlugin = (store) => {
  if (process.env.NODE_ENV === 'development') {
    const manager = new StateSnapshotManager(store)
    
    // 将管理器暴露给全局，方便在控制台调试
    window.__VUEX_SNAPSHOT_MANAGER__ = manager
  }
}
```

## 四、性能调试

### 4.1 性能监控插件

```javascript
// Vuex 性能监控
const createPerformancePlugin = (options = {}) => {
  const {
    measureThreshold = 16, // 16ms 阈值
    logSlowOperations = true,
    trackMemoryUsage = false
  } = options
  
  return store => {
    const performanceData = {
      mutations: new Map(),
      actions: new Map(),
      slowOperations: []
    }
    
    // 监控 mutations 性能
    store.subscribe((mutation, state) => {
      const start = performance.now()
      
      // 使用 requestAnimationFrame 确保 DOM 更新完成
      requestAnimationFrame(() => {
        const end = performance.now()
        const duration = end - start
        
        recordPerformance('mutation', mutation.type, duration, performanceData)
        
        if (duration > measureThreshold && logSlowOperations) {
          console.warn(`Slow mutation detected: ${mutation.type} took ${duration.toFixed(2)}ms`)
        }
      })
    })
    
    // 监控 actions 性能
    const actionStartTimes = new Map()
    
    store.subscribeAction({
      before: (action, state) => {
        actionStartTimes.set(action, performance.now())
        
        if (trackMemoryUsage) {
          recordMemoryUsage(`action-start-${action.type}`)
        }
      },
      after: (action, state) => {
        const startTime = actionStartTimes.get(action)
        if (startTime) {
          const duration = performance.now() - startTime
          recordPerformance('action', action.type, duration, performanceData)
          actionStartTimes.delete(action)
          
          if (duration > measureThreshold && logSlowOperations) {
            console.warn(`Slow action detected: ${action.type} took ${duration.toFixed(2)}ms`)
          }
          
          if (trackMemoryUsage) {
            recordMemoryUsage(`action-end-${action.type}`)
          }
        }
      }
    })
    
    // 暴露性能数据
    store.$performance = performanceData
    window.__VUEX_PERFORMANCE__ = performanceData
  }
}

function recordPerformance(type, name, duration, data) {
  const map = data[`${type}s`]
  
  if (!map.has(name)) {
    map.set(name, {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      maxTime: 0,
      minTime: Infinity
    })
  }
  
  const stats = map.get(name)
  stats.count++
  stats.totalTime += duration
  stats.avgTime = stats.totalTime / stats.count
  stats.maxTime = Math.max(stats.maxTime, duration)
  stats.minTime = Math.min(stats.minTime, duration)
}

function recordMemoryUsage(label) {
  if (performance.memory) {
    console.log(`${label} Memory:`, {
      used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`
    })
  }
}
```

## 五、错误追踪

### 5.1 错误边界和追踪

```javascript
// Vuex 错误追踪插件
const createErrorTrackingPlugin = (options = {}) => {
  const {
    onError = (error, context) => console.error(error),
    captureStackTrace = true,
    maxErrorHistory = 10
  } = options
  
  return store => {
    const errorHistory = []
    
    // 包装 commit 方法
    const originalCommit = store.commit
    store.commit = function(type, payload, options) {
      try {
        return originalCommit.call(this, type, payload, options)
      } catch (error) {
        const errorInfo = {
          type: 'mutation',
          name: type,
          payload,
          error: error.message,
          stack: captureStackTrace ? error.stack : null,
          timestamp: new Date().toISOString(),
          state: JSON.parse(JSON.stringify(store.state))
        }
        
        errorHistory.push(errorInfo)
        if (errorHistory.length > maxErrorHistory) {
          errorHistory.shift()
        }
        
        onError(error, errorInfo)
        throw error
      }
    }
    
    // 包装 dispatch 方法
    const originalDispatch = store.dispatch
    store.dispatch = function(type, payload) {
      const promise = originalDispatch.call(this, type, payload)
      
      return promise.catch(error => {
        const errorInfo = {
          type: 'action',
          name: type,
          payload,
          error: error.message,
          stack: captureStackTrace ? error.stack : null,
          timestamp: new Date().toISOString(),
          state: JSON.parse(JSON.stringify(store.state))
        }
        
        errorHistory.push(errorInfo)
        if (errorHistory.length > maxErrorHistory) {
          errorHistory.shift()
        }
        
        onError(error, errorInfo)
        throw error
      })
    }
    
    // 暴露错误历史
    store.$errorHistory = errorHistory
  }
}
```

## 六、调试技巧汇总

### 6.1 常用调试命令

```javascript
// 在浏览器控制台中使用的调试命令

// 1. 检查当前状态
console.log('Current state:', this.$store.state)

// 2. 触发 mutation
this.$store.commit('INCREMENT')

// 3. 分发 action
this.$store.dispatch('fetchUser', 1)

// 4. 检查 getters
console.log('All getters:', this.$store.getters)

// 5. 监听状态变化
const unsubscribe = this.$store.subscribe((mutation, state) => {
  console.log('State changed:', mutation, state)
})

// 6. 检查模块状态
console.log('User module:', this.$store.state.user)

// 7. 查看性能数据（如果启用了性能插件）
console.log('Performance:', window.__VUEX_PERFORMANCE__)

// 8. 时间旅行（如果启用了快照管理器）
window.__VUEX_SNAPSHOT_MANAGER__.undo()
window.__VUEX_SNAPSHOT_MANAGER__.redo()
```

### 6.2 调试最佳实践

```javascript
// 调试友好的 Store 设置
const createDebuggableStore = (config) => {
  const isDev = process.env.NODE_ENV !== 'production'
  
  return createStore({
    ...config,
    strict: isDev,
    devtools: isDev,
    plugins: [
      ...(config.plugins || []),
      ...(isDev ? [
        createLoggerPlugin({
          collapsed: false,
          filter: (mutation, stateBefore, stateAfter) => {
            // 过滤掉频繁的 mutations
            return !mutation.type.includes('UPDATE_SCROLL_POSITION')
          }
        }),
        createPerformancePlugin({
          measureThreshold: 10,
          logSlowOperations: true
        }),
        createErrorTrackingPlugin({
          onError: (error, context) => {
            // 发送到错误追踪服务
            console.group('Vuex Error')
            console.error('Error:', error)
            console.log('Context:', context)
            console.groupEnd()
          }
        })
      ] : [])
    ]
  })
}

// 使用示例
const store = createDebuggableStore({
  state: () => ({
    count: 0
  }),
  mutations: {
    INCREMENT(state) {
      state.count++
    }
  }
})
```

### 6.3 生产环境监控

```javascript
// 生产环境的轻量级监控
const createProductionMonitor = () => {
  if (process.env.NODE_ENV === 'production') {
    return store => {
      // 只记录关键错误
      const originalDispatch = store.dispatch
      store.dispatch = function(type, payload) {
        return originalDispatch.call(this, type, payload).catch(error => {
          // 发送到错误追踪服务
          if (window.ErrorTracking) {
            window.ErrorTracking.captureException(error, {
              extra: {
                actionType: type,
                payload,
                state: store.state
              }
            })
          }
          
          throw error
        })
      }
    }
  }
  
  return () => {} // 开发环境返回空函数
}
```

## 参考资料

- [Vue DevTools](https://devtools.vuejs.org/)
- [Vuex DevTools Guide](https://vuex.vuejs.org/guide/debugging.html)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

**下一节** → [第 36 节：最佳实践](./36-vuex-best-practices.md)
