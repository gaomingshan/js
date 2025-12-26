# 第 16 节：订阅机制

## 概述

Pinia 提供了强大的订阅机制，允许监听 Store 的状态变化和 Action 执行。通过 `$subscribe` 和 `$onAction`，开发者可以实现日志记录、数据同步、副作用处理等功能。

## 一、状态订阅 ($subscribe)

### 1.1 基本用法

```javascript
import { useUserStore } from '@/stores/user'

export default defineComponent({
  setup() {
    const userStore = useUserStore()
    
    // 订阅所有状态变化
    const unsubscribe = userStore.$subscribe((mutation, state) => {
      console.log('状态发生变化:', {
        type: mutation.type,        // 变化类型
        storeId: mutation.storeId, // Store ID
        payload: mutation.payload,  // 变化的数据
        events: mutation.events,    // 具体变化事件
        state: state               // 新的状态
      })
    })
    
    // 组件卸载时取消订阅
    onUnmounted(() => {
      unsubscribe()
    })
    
    return {}
  }
})
```

### 1.2 订阅参数详解

```javascript
export const useSubscriptionStore = defineStore('subscription', () => {
  const count = ref(0)
  const user = reactive({ name: '', age: 0 })
  const items = ref([])
  
  // 设置订阅
  const setupSubscription = () => {
    return this.$subscribe((mutation, state) => {
      console.log('=== 状态变化详情 ===')
      
      // mutation.type 变化类型
      console.log('变化类型:', mutation.type)
      // - 'direct': 直接修改状态 (store.count++)
      // - 'patch object': 通过 $patch 对象修改
      // - 'patch function': 通过 $patch 函数修改
      
      // mutation.storeId Store 标识
      console.log('Store ID:', mutation.storeId)
      
      // mutation.events 具体变化事件（仅 direct 类型有效）
      if (mutation.type === 'direct' && mutation.events) {
        mutation.events.forEach(event => {
          console.log('变化事件:', {
            key: event.key,        // 变化的属性名
            type: event.type,      // 'set', 'add', 'delete', 'clear'
            target: event.target,  // 目标对象
            oldValue: event.oldValue, // 旧值（如果有）
            newValue: event.newValue  // 新值
          })
        })
      }
      
      // mutation.payload $patch 的载荷数据
      if (mutation.payload) {
        console.log('变化载荷:', mutation.payload)
      }
      
      // state 完整的新状态
      console.log('新状态:', state)
    })
  }
  
  return {
    count, user, items,
    setupSubscription
  }
})
```

### 1.3 监听特定属性变化

```javascript
export const useFilteredSubscriptionStore = defineStore('filteredSubscription', () => {
  const profile = reactive({
    name: '',
    email: '',
    age: 0,
    preferences: {
      theme: 'light',
      language: 'zh-CN'
    }
  })
  
  const settings = reactive({
    notifications: true,
    autoSave: false
  })
  
  // 只监听特定属性的变化
  const setupFilteredSubscription = () => {
    return this.$subscribe((mutation, state) => {
      // 只处理 profile.name 的变化
      if (mutation.type === 'direct' && mutation.events) {
        const nameChanged = mutation.events.some(event => 
          event.key === 'name' && event.target === state.profile
        )
        
        if (nameChanged) {
          console.log('用户名发生变化:', state.profile.name)
          // 执行相关逻辑，如同步到服务器
          syncUserNameToServer(state.profile.name)
        }
      }
      
      // 监听嵌套对象变化
      if (mutation.type === 'direct' && mutation.events) {
        const preferencesChanged = mutation.events.some(event =>
          event.target === state.profile.preferences
        )
        
        if (preferencesChanged) {
          console.log('用户偏好设置发生变化')
          savePreferencesToLocal(state.profile.preferences)
        }
      }
    })
  }
  
  return {
    profile, settings,
    setupFilteredSubscription
  }
})

// 辅助函数
async function syncUserNameToServer(name) {
  try {
    await api.updateUserName(name)
  } catch (error) {
    console.error('同步用户名失败:', error)
  }
}

function savePreferencesToLocal(preferences) {
  localStorage.setItem('userPreferences', JSON.stringify(preferences))
}
```

## 二、Action 订阅 ($onAction)

### 2.1 基本用法

```javascript
export const useActionSubscriptionStore = defineStore('actionSubscription', () => {
  const data = ref([])
  const loading = ref(false)
  
  async function fetchData(params) {
    loading.value = true
    try {
      const result = await api.fetchData(params)
      data.value = result
      return result
    } catch (error) {
      console.error('获取数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  // 设置 Action 订阅
  const setupActionSubscription = () => {
    return this.$onAction(({
      name,        // action 名称
      store,       // store 实例
      args,        // 传递给 action 的参数
      after,       // action 成功后的钩子
      onError      // action 失败时的钩子
    }) => {
      console.log(`Action "${name}" 开始执行`)
      console.log('参数:', args)
      
      const startTime = Date.now()
      
      // action 执行成功后
      after((result) => {
        const duration = Date.now() - startTime
        console.log(`Action "${name}" 执行成功`)
        console.log('耗时:', duration + 'ms')
        console.log('返回值:', result)
        
        // 记录成功日志
        logActionSuccess(name, args, result, duration)
      })
      
      // action 执行失败时
      onError((error) => {
        const duration = Date.now() - startTime
        console.error(`Action "${name}" 执行失败`)
        console.error('错误:', error)
        console.log('耗时:', duration + 'ms')
        
        // 记录错误日志
        logActionError(name, args, error, duration)
      })
    })
  }
  
  return {
    data, loading,
    fetchData,
    setupActionSubscription
  }
})

// 日志记录函数
function logActionSuccess(actionName, args, result, duration) {
  const log = {
    type: 'action_success',
    action: actionName,
    args,
    result,
    duration,
    timestamp: new Date().toISOString()
  }
  
  // 发送到日志服务
  sendToLogService(log)
}

function logActionError(actionName, args, error, duration) {
  const log = {
    type: 'action_error',
    action: actionName,
    args,
    error: error.message,
    duration,
    timestamp: new Date().toISOString()
  }
  
  // 发送到错误监控服务
  sendToErrorService(log)
}
```

### 2.2 Action 性能监控

```javascript
export const usePerformanceStore = defineStore('performance', () => {
  const metrics = reactive({
    actionCounts: {},      // Action 执行次数
    actionTimes: {},       // Action 执行时间统计
    slowActions: [],       // 慢查询记录
    errorCounts: {}        // 错误统计
  })
  
  const SLOW_ACTION_THRESHOLD = 1000 // 1秒阈值
  
  // 性能监控订阅
  const setupPerformanceMonitoring = () => {
    return this.$onAction(({ name, args, after, onError }) => {
      const startTime = performance.now()
      
      // 更新执行次数
      if (!metrics.actionCounts[name]) {
        metrics.actionCounts[name] = 0
      }
      metrics.actionCounts[name]++
      
      after(() => {
        const duration = performance.now() - startTime
        
        // 记录执行时间
        if (!metrics.actionTimes[name]) {
          metrics.actionTimes[name] = []
        }
        metrics.actionTimes[name].push(duration)
        
        // 记录慢查询
        if (duration > SLOW_ACTION_THRESHOLD) {
          metrics.slowActions.push({
            action: name,
            args,
            duration,
            timestamp: new Date()
          })
          
          console.warn(`慢查询检测: ${name} 耗时 ${duration.toFixed(2)}ms`)
        }
      })
      
      onError((error) => {
        // 统计错误
        if (!metrics.errorCounts[name]) {
          metrics.errorCounts[name] = 0
        }
        metrics.errorCounts[name]++
      })
    })
  }
  
  // 获取性能统计
  const getPerformanceStats = computed(() => {
    const stats = {}
    
    Object.keys(metrics.actionTimes).forEach(actionName => {
      const times = metrics.actionTimes[actionName]
      const count = metrics.actionCounts[actionName] || 0
      const errors = metrics.errorCounts[actionName] || 0
      
      stats[actionName] = {
        count,
        errors,
        errorRate: count > 0 ? (errors / count * 100).toFixed(2) + '%' : '0%',
        avgTime: times.length > 0 ? (times.reduce((sum, time) => sum + time, 0) / times.length).toFixed(2) : 0,
        maxTime: times.length > 0 ? Math.max(...times).toFixed(2) : 0,
        minTime: times.length > 0 ? Math.min(...times).toFixed(2) : 0
      }
    })
    
    return stats
  })
  
  return {
    metrics,
    setupPerformanceMonitoring,
    getPerformanceStats
  }
})
```

## 三、订阅选项和配置

### 3.1 分离订阅 (detached)

```javascript
export const useDetachedSubscriptionStore = defineStore('detachedSubscription', () => {
  const count = ref(0)
  
  // 普通订阅 - 会在组件卸载时自动取消
  const setupNormalSubscription = () => {
    return this.$subscribe((mutation, state) => {
      console.log('普通订阅:', state.count)
    })
  }
  
  // 分离订阅 - 不会随组件生命周期自动取消
  const setupDetachedSubscription = () => {
    return this.$subscribe(
      (mutation, state) => {
        console.log('分离订阅:', state.count)
        
        // 保存到全局存储
        localStorage.setItem('lastCount', state.count.toString())
      },
      { detached: true } // 关键配置
    )
  }
  
  return {
    count,
    setupNormalSubscription,
    setupDetachedSubscription
  }
})

// 在应用启动时设置全局订阅
export function setupGlobalSubscriptions() {
  const store = useDetachedSubscriptionStore()
  
  // 这个订阅会持续存在，不会随组件卸载
  store.setupDetachedSubscription()
}
```

### 3.2 条件订阅

```javascript
export const useConditionalStore = defineStore('conditional', () => {
  const user = reactive({ role: '', isActive: false })
  const debugMode = ref(false)
  
  // 条件订阅 - 只在特定条件下才订阅
  const setupConditionalSubscription = (condition) => {
    if (!condition()) return null
    
    return this.$subscribe((mutation, state) => {
      if (debugMode.value) {
        console.log('调试模式 - 状态变化:', mutation)
      }
      
      // 只为管理员记录详细日志
      if (state.user.role === 'admin') {
        logAdminActivity(mutation, state)
      }
    })
  }
  
  // 动态订阅管理
  const subscriptions = ref(new Set())
  
  const enableSubscription = (type) => {
    let unsubscribe
    
    switch (type) {
      case 'admin':
        unsubscribe = this.$subscribe((mutation, state) => {
          if (state.user.role === 'admin') {
            logAdminActivity(mutation, state)
          }
        })
        break
        
      case 'audit':
        unsubscribe = this.$subscribe((mutation, state) => {
          auditStateChange(mutation, state)
        })
        break
        
      default:
        return
    }
    
    subscriptions.value.add({ type, unsubscribe })
  }
  
  const disableSubscription = (type) => {
    for (const sub of subscriptions.value) {
      if (sub.type === type) {
        sub.unsubscribe()
        subscriptions.value.delete(sub)
        break
      }
    }
  }
  
  const clearAllSubscriptions = () => {
    subscriptions.value.forEach(sub => sub.unsubscribe())
    subscriptions.value.clear()
  }
  
  return {
    user, debugMode,
    setupConditionalSubscription,
    enableSubscription,
    disableSubscription,
    clearAllSubscriptions
  }
})
```

## 四、实际应用场景

### 4.1 数据同步

```javascript
// 自动数据同步 Store
export const useDataSyncStore = defineStore('dataSync', () => {
  const localData = ref({})
  const syncQueue = ref([])
  const isSyncing = ref(false)
  
  // 设置自动同步
  const setupAutoSync = () => {
    // 监听状态变化，加入同步队列
    this.$subscribe((mutation, state) => {
      if (mutation.type === 'direct') {
        const syncItem = {
          id: Date.now(),
          type: 'update',
          data: { ...state.localData },
          timestamp: new Date()
        }
        
        syncQueue.value.push(syncItem)
        
        // 防抖同步
        debouncedSync()
      }
    })
    
    // 监听网络状态
    window.addEventListener('online', () => {
      console.log('网络恢复，开始同步数据')
      processSyncQueue()
    })
  }
  
  // 防抖同步函数
  const debouncedSync = debounce(processSyncQueue, 2000)
  
  // 处理同步队列
  const processSyncQueue = async () => {
    if (isSyncing.value || syncQueue.value.length === 0) return
    
    isSyncing.value = true
    
    try {
      while (syncQueue.value.length > 0) {
        const item = syncQueue.value.shift()
        
        try {
          await api.syncData(item.data)
          console.log('数据同步成功:', item.id)
        } catch (error) {
          console.error('数据同步失败:', error)
          
          // 重新加入队列等待下次同步
          if (navigator.onLine) {
            syncQueue.value.unshift(item)
          }
          break
        }
      }
    } finally {
      isSyncing.value = false
    }
  }
  
  return {
    localData,
    syncQueue,
    isSyncing,
    setupAutoSync
  }
})
```

### 4.2 撤销/重做功能

```javascript
export const useHistoryStore = defineStore('history', () => {
  const currentState = ref({})
  const history = ref([])
  const historyIndex = ref(-1)
  const maxHistorySize = ref(50)
  
  // 设置历史记录
  const setupHistory = () => {
    // 记录状态变化到历史
    this.$subscribe((mutation, state) => {
      // 跳过撤销/重做操作本身产生的变化
      if (mutation.skipHistory) return
      
      const snapshot = {
        timestamp: Date.now(),
        state: JSON.parse(JSON.stringify(state.currentState)),
        mutation: {
          type: mutation.type,
          payload: mutation.payload
        }
      }
      
      // 如果当前不在历史末尾，删除后面的历史
      if (historyIndex.value < history.value.length - 1) {
        history.value.splice(historyIndex.value + 1)
      }
      
      // 添加新的历史记录
      history.value.push(snapshot)
      historyIndex.value = history.value.length - 1
      
      // 限制历史记录大小
      if (history.value.length > maxHistorySize.value) {
        history.value.shift()
        historyIndex.value--
      }
    })
  }
  
  // 撤销操作
  const undo = () => {
    if (!canUndo.value) return false
    
    historyIndex.value--
    const prevState = history.value[historyIndex.value]
    
    // 恢复状态，标记跳过历史记录
    restoreState(prevState.state, true)
    return true
  }
  
  // 重做操作
  const redo = () => {
    if (!canRedo.value) return false
    
    historyIndex.value++
    const nextState = history.value[historyIndex.value]
    
    // 恢复状态，标记跳过历史记录
    restoreState(nextState.state, true)
    return true
  }
  
  // 恢复状态
  const restoreState = (state, skipHistory = false) => {
    if (skipHistory) {
      // 使用特殊的 patch 方法，跳过历史记录
      this.$patch((currentState) => {
        Object.assign(currentState.currentState, state)
      })
      
      // 手动标记，让订阅知道跳过历史
      this.$patch.$skipHistory = true
    } else {
      this.$patch({ currentState: state })
    }
  }
  
  // 计算属性
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)
  
  // 清除历史
  const clearHistory = () => {
    history.value = []
    historyIndex.value = -1
  }
  
  return {
    currentState,
    history: readonly(history),
    canUndo,
    canRedo,
    setupHistory,
    undo,
    redo,
    clearHistory
  }
})
```

### 4.3 实时协作

```javascript
export const useCollaborationStore = defineStore('collaboration', () => {
  const document = reactive({ content: '', cursors: {} })
  const localUserId = ref(null)
  const socket = ref(null)
  
  // 设置实时协作
  const setupCollaboration = (userId, socketInstance) => {
    localUserId.value = userId
    socket.value = socketInstance
    
    // 监听本地状态变化，广播给其他用户
    this.$subscribe((mutation, state) => {
      if (mutation.local) return // 跳过来自远程的变化
      
      const changeEvent = {
        type: 'state-change',
        userId: localUserId.value,
        mutation: {
          type: mutation.type,
          payload: mutation.payload,
          timestamp: Date.now()
        },
        state: state.document
      }
      
      socket.value.emit('document-change', changeEvent)
    })
    
    // 监听来自其他用户的变化
    socket.value.on('document-change', (changeEvent) => {
      if (changeEvent.userId === localUserId.value) return
      
      // 应用远程变化，标记为本地变化避免重复广播
      applyRemoteChange(changeEvent, true)
    })
    
    // 监听用户光标位置
    socket.value.on('cursor-update', (cursorData) => {
      if (cursorData.userId !== localUserId.value) {
        document.cursors[cursorData.userId] = cursorData.position
      }
    })
  }
  
  // 应用远程变化
  const applyRemoteChange = (changeEvent, isLocal = true) => {
    const patch = {
      document: changeEvent.state,
      __meta: { local: isLocal } // 元数据标记
    }
    
    this.$patch(patch)
  }
  
  // 更新光标位置
  const updateCursor = (position) => {
    socket.value.emit('cursor-update', {
      userId: localUserId.value,
      position,
      timestamp: Date.now()
    })
  }
  
  // 冲突解决（简单的最后写入获胜策略）
  const resolveConflict = (localChange, remoteChange) => {
    if (remoteChange.timestamp > localChange.timestamp) {
      return remoteChange.state
    }
    return localChange.state
  }
  
  return {
    document,
    localUserId,
    setupCollaboration,
    updateCursor,
    resolveConflict
  }
})
```

## 五、订阅管理最佳实践

### 5.1 订阅生命周期管理

```javascript
// 订阅管理器
export class SubscriptionManager {
  constructor() {
    this.subscriptions = new Map()
  }
  
  // 添加订阅
  add(key, unsubscribeFn) {
    if (this.subscriptions.has(key)) {
      this.remove(key) // 移除旧的订阅
    }
    this.subscriptions.set(key, unsubscribeFn)
  }
  
  // 移除订阅
  remove(key) {
    const unsubscribe = this.subscriptions.get(key)
    if (unsubscribe) {
      unsubscribe()
      this.subscriptions.delete(key)
    }
  }
  
  // 清除所有订阅
  clear() {
    this.subscriptions.forEach(unsubscribe => unsubscribe())
    this.subscriptions.clear()
  }
  
  // 获取订阅数量
  get size() {
    return this.subscriptions.size
  }
}

// 在组合式函数中使用
export function useStoreSubscriptions() {
  const subscriptionManager = new SubscriptionManager()
  
  // 自动清理
  onUnmounted(() => {
    subscriptionManager.clear()
  })
  
  const subscribeToStore = (store, callback, options = {}) => {
    const key = `${store.$id}-${Date.now()}`
    const unsubscribe = store.$subscribe(callback, options)
    subscriptionManager.add(key, unsubscribe)
    return key
  }
  
  const subscribeToAction = (store, callback) => {
    const key = `action-${store.$id}-${Date.now()}`
    const unsubscribe = store.$onAction(callback)
    subscriptionManager.add(key, unsubscribe)
    return key
  }
  
  return {
    subscribeToStore,
    subscribeToAction,
    removeSubscription: (key) => subscriptionManager.remove(key),
    clearAllSubscriptions: () => subscriptionManager.clear()
  }
}
```

### 5.2 性能优化

```javascript
// 优化订阅性能
export function createOptimizedSubscription() {
  return {
    // 防抖订阅
    debounced(store, callback, delay = 100) {
      const debouncedCallback = debounce(callback, delay)
      return store.$subscribe(debouncedCallback)
    },
    
    // 节流订阅
    throttled(store, callback, limit = 100) {
      const throttledCallback = throttle(callback, limit)
      return store.$subscribe(throttledCallback)
    },
    
    // 批量处理订阅
    batched(store, callback) {
      const batchedChanges = []
      
      const processbatch = debounce(() => {
        if (batchedChanges.length > 0) {
          callback(batchedChanges.splice(0))
        }
      }, 50)
      
      return store.$subscribe((mutation, state) => {
        batchedChanges.push({ mutation, state })
        processBatch()
      })
    },
    
    // 过滤订阅
    filtered(store, callback, filterFn) {
      return store.$subscribe((mutation, state) => {
        if (filterFn(mutation, state)) {
          callback(mutation, state)
        }
      })
    }
  }
}
```

## 参考资料

- [Pinia Subscriptions](https://pinia.vuejs.org/core-concepts/subscriptions.html)
- [Vue Watch API](https://vuejs.org/api/reactivity-core.html#watch)
- [Performance Best Practices](https://pinia.vuejs.org/cookbook/performance.html)

**下一节** → [第 17 节：测试](./17-pinia-testing.md)
