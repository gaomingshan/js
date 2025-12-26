# 第 20 节：开发工具

## 概述

Pinia 提供了强大的开发工具支持，包括 Vue DevTools 集成、调试功能、状态追踪等。本节将介绍如何有效使用这些开发工具来提升开发效率和调试体验。

## 一、Vue DevTools 集成

### 1.1 安装和设置

```bash
# 安装 Vue DevTools 浏览器扩展
# Chrome: https://chrome.google.com/webstore/detail/vuejs-devtools/
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/

# 或者使用独立应用
npm install -g @vue/devtools
vue-devtools
```

```javascript
// main.js - 开发环境配置
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// 开发环境启用 DevTools
if (process.env.NODE_ENV === 'development') {
  app.config.performance = true
}

app.use(pinia)
app.mount('#app')
```

### 1.2 DevTools 功能概览

```javascript
// DevTools 主要功能
const devToolsFeatures = {
  stores: {
    description: 'Store 状态查看和编辑',
    features: [
      '实时状态监控',
      '状态树结构展示',
      '直接编辑状态值',
      'Store 实例信息'
    ]
  },
  
  timeline: {
    description: '时间线事件追踪',
    features: [
      'Action 执行记录',
      '状态变更历史',
      '事件时间戳',
      '性能分析'
    ]
  },
  
  inspector: {
    description: '组件检查器',
    features: [
      'Store 使用情况',
      '组件与 Store 关联',
      'Props 和状态对比'
    ]
  }
}
```

## 二、调试技巧

### 2.1 状态调试

```javascript
// stores/debug.js
export const useDebugStore = defineStore('debug', () => {
  const debugMode = ref(process.env.NODE_ENV === 'development')
  const logs = ref([])
  
  // 调试工具方法
  const debug = {
    // 记录状态变化
    logStateChange(storeName, mutation, state) {
      if (!debugMode.value) return
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        store: storeName,
        type: 'state-change',
        mutation,
        state: JSON.parse(JSON.stringify(state))
      }
      
      logs.value.push(logEntry)
      console.group(`🔄 [${storeName}] State Change`)
      console.log('Mutation:', mutation)
      console.log('New State:', state)
      console.groupEnd()
    },
    
    // 记录 Action 执行
    logAction(storeName, actionName, args, result) {
      if (!debugMode.value) return
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        store: storeName,
        type: 'action',
        action: actionName,
        args,
        result
      }
      
      logs.value.push(logEntry)
      console.group(`🎬 [${storeName}] Action: ${actionName}`)
      console.log('Arguments:', args)
      console.log('Result:', result)
      console.groupEnd()
    },
    
    // 性能监控
    measurePerformance(name, fn) {
      if (!debugMode.value) return fn()
      
      const start = performance.now()
      const result = fn()
      const end = performance.now()
      
      console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`)
      return result
    }
  }
  
  return {
    debugMode,
    logs: readonly(logs),
    debug
  }
})
```

### 2.2 Store 调试插件

```javascript
// plugins/debug-plugin.js
export function createDebugPlugin() {
  return function debugPlugin({ store, app, pinia, options }) {
    if (process.env.NODE_ENV !== 'development') return
    
    const debugStore = useDebugStore()
    
    // 添加调试标识
    store._debug = {
      id: store.$id,
      created: new Date(),
      subscriptions: [],
      actions: []
    }
    
    // 监听状态变化
    const stateUnsubscribe = store.$subscribe((mutation, state) => {
      debugStore.debug.logStateChange(store.$id, mutation, state)
    })
    
    // 监听 Action 执行
    const actionUnsubscribe = store.$onAction(({ name, args, after, onError }) => {
      const startTime = performance.now()
      
      after((result) => {
        const duration = performance.now() - startTime
        debugStore.debug.logAction(store.$id, name, args, result)
        
        if (duration > 100) {
          console.warn(`⚠️ Slow action: ${store.$id}.${name} (${duration.toFixed(2)}ms)`)
        }
      })
      
      onError((error) => {
        console.error(`❌ Action failed: ${store.$id}.${name}`, error)
      })
    })
    
    store._debug.subscriptions.push(stateUnsubscribe, actionUnsubscribe)
    
    // 添加调试方法
    store.$debug = {
      // 获取状态快照
      snapshot() {
        return JSON.parse(JSON.stringify(store.$state))
      },
      
      // 状态历史
      getHistory() {
        return debugStore.logs.filter(log => log.store === store.$id)
      },
      
      // 性能统计
      getPerformanceStats() {
        const actions = debugStore.logs.filter(log => 
          log.store === store.$id && log.type === 'action'
        )
        
        const stats = {}
        actions.forEach(log => {
          if (!stats[log.action]) {
            stats[log.action] = { count: 0, totalTime: 0 }
          }
          stats[log.action].count++
        })
        
        return stats
      }
    }
  }
}

// 使用调试插件
const pinia = createPinia()
pinia.use(createDebugPlugin())
```

## 三、时间旅行调试

### 3.1 状态历史管理

```javascript
// stores/time-travel.js
export const useTimeTravelStore = defineStore('timeTravel', () => {
  const history = ref([])
  const currentIndex = ref(-1)
  const maxHistorySize = ref(50)
  const isReplaying = ref(false)
  
  // 记录状态快照
  const recordSnapshot = (storeId, state, action = null) => {
    if (isReplaying.value) return
    
    const snapshot = {
      id: Date.now(),
      timestamp: new Date(),
      storeId,
      state: JSON.parse(JSON.stringify(state)),
      action
    }
    
    // 如果当前不在历史末尾，删除后面的记录
    if (currentIndex.value < history.value.length - 1) {
      history.value.splice(currentIndex.value + 1)
    }
    
    history.value.push(snapshot)
    currentIndex.value = history.value.length - 1
    
    // 限制历史大小
    if (history.value.length > maxHistorySize.value) {
      history.value.shift()
      currentIndex.value--
    }
  }
  
  // 时间旅行到指定索引
  const travelTo = (index) => {
    if (index < 0 || index >= history.value.length) return false
    
    isReplaying.value = true
    currentIndex.value = index
    
    const snapshot = history.value[index]
    
    // 恢复状态
    const targetStore = useNuxtApp().$pinia._s.get(snapshot.storeId)
    if (targetStore) {
      targetStore.$patch(snapshot.state)
    }
    
    isReplaying.value = false
    return true
  }
  
  // 前进/后退
  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)
  
  const undo = () => {
    if (canUndo.value) {
      travelTo(currentIndex.value - 1)
    }
  }
  
  const redo = () => {
    if (canRedo.value) {
      travelTo(currentIndex.value + 1)
    }
  }
  
  // 清除历史
  const clearHistory = () => {
    history.value = []
    currentIndex.value = -1
  }
  
  return {
    history: readonly(history),
    currentIndex: readonly(currentIndex),
    canUndo,
    canRedo,
    recordSnapshot,
    travelTo,
    undo,
    redo,
    clearHistory
  }
})
```

### 3.2 时间旅行 UI 组件

```vue
<template>
  <div class="time-travel-debugger">
    <div class="controls">
      <button @click="undo" :disabled="!canUndo" title="撤销">
        ⏪
      </button>
      
      <button @click="redo" :disabled="!canRedo" title="重做">
        ⏩
      </button>
      
      <button @click="clearHistory" title="清除历史">
        🗑️
      </button>
      
      <span class="current-position">
        {{ currentIndex + 1 }} / {{ history.length }}
      </span>
    </div>
    
    <div class="timeline">
      <div 
        v-for="(snapshot, index) in history"
        :key="snapshot.id"
        :class="[
          'timeline-item',
          { active: index === currentIndex }
        ]"
        @click="travelTo(index)"
      >
        <div class="timestamp">
          {{ formatTime(snapshot.timestamp) }}
        </div>
        
        <div class="action">
          {{ snapshot.action || 'Initial State' }}
        </div>
        
        <div class="store">
          {{ snapshot.storeId }}
        </div>
      </div>
    </div>
    
    <div class="state-viewer" v-if="currentSnapshot">
      <h4>状态详情</h4>
      <pre>{{ JSON.stringify(currentSnapshot.state, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTimeTravelStore } from '@/stores/time-travel'

const timeTravelStore = useTimeTravelStore()

const {
  history,
  currentIndex,
  canUndo,
  canRedo
} = storeToRefs(timeTravelStore)

const {
  travelTo,
  undo,
  redo,
  clearHistory
} = timeTravelStore

const currentSnapshot = computed(() => {
  return history.value[currentIndex.value] || null
})

const formatTime = (date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  }).format(date)
}
</script>

<style scoped>
.time-travel-debugger {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 300px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  z-index: 9999;
}

.controls {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 5px;
}

.timeline {
  max-height: 200px;
  overflow-y: auto;
}

.timeline-item {
  padding: 5px 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  font-size: 12px;
}

.timeline-item:hover {
  background: #f5f5f5;
}

.timeline-item.active {
  background: #e3f2fd;
}

.state-viewer {
  padding: 10px;
  border-top: 1px solid #eee;
  max-height: 200px;
  overflow-y: auto;
}

.state-viewer pre {
  font-size: 10px;
  margin: 0;
}
</style>
```

## 四、性能分析

### 4.1 性能监控

```javascript
// utils/performance-monitor.js
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = []
  }
  
  // 开始性能测量
  start(name) {
    this.metrics.set(name, {
      start: performance.now(),
      end: null,
      duration: null
    })
  }
  
  // 结束性能测量
  end(name) {
    const metric = this.metrics.get(name)
    if (metric) {
      metric.end = performance.now()
      metric.duration = metric.end - metric.start
      
      // 通知观察者
      this.observers.forEach(observer => {
        observer(name, metric)
      })
    }
  }
  
  // 添加观察者
  subscribe(callback) {
    this.observers.push(callback)
    
    return () => {
      const index = this.observers.indexOf(callback)
      if (index > -1) {
        this.observers.splice(index, 1)
      }
    }
  }
  
  // 获取统计信息
  getStats() {
    const stats = {}
    
    this.metrics.forEach((metric, name) => {
      if (metric.duration !== null) {
        if (!stats[name]) {
          stats[name] = {
            count: 0,
            total: 0,
            average: 0,
            min: Infinity,
            max: 0
          }
        }
        
        const stat = stats[name]
        stat.count++
        stat.total += metric.duration
        stat.average = stat.total / stat.count
        stat.min = Math.min(stat.min, metric.duration)
        stat.max = Math.max(stat.max, metric.duration)
      }
    })
    
    return stats
  }
  
  // 清除数据
  clear() {
    this.metrics.clear()
  }
}

// 创建全局性能监控器
export const performanceMonitor = new PerformanceMonitor()

// 性能监控插件
export function createPerformancePlugin() {
  return function performancePlugin({ store }) {
    // 监控 Action 性能
    store.$onAction(({ name, after, onError }) => {
      const actionKey = `${store.$id}.${name}`
      
      performanceMonitor.start(actionKey)
      
      after(() => {
        performanceMonitor.end(actionKey)
      })
      
      onError(() => {
        performanceMonitor.end(actionKey)
      })
    })
    
    // 添加性能相关方法
    store.$performance = {
      getStats() {
        return performanceMonitor.getStats()
      },
      
      measure(name, fn) {
        performanceMonitor.start(name)
        const result = fn()
        performanceMonitor.end(name)
        return result
      },
      
      async measureAsync(name, asyncFn) {
        performanceMonitor.start(name)
        try {
          const result = await asyncFn()
          return result
        } finally {
          performanceMonitor.end(name)
        }
      }
    }
  }
}
```

### 4.2 内存使用监控

```javascript
// utils/memory-monitor.js
export class MemoryMonitor {
  constructor() {
    this.samples = []
    this.isMonitoring = false
    this.interval = null
  }
  
  // 开始监控
  start(intervalMs = 1000) {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.interval = setInterval(() => {
      this.takeSample()
    }, intervalMs)
  }
  
  // 停止监控
  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.isMonitoring = false
  }
  
  // 采集样本
  takeSample() {
    if (performance.memory) {
      const sample = {
        timestamp: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      }
      
      this.samples.push(sample)
      
      // 保留最近100个样本
      if (this.samples.length > 100) {
        this.samples.shift()
      }
    }
  }
  
  // 获取内存统计
  getStats() {
    if (this.samples.length === 0) return null
    
    const latest = this.samples[this.samples.length - 1]
    const oldest = this.samples[0]
    
    return {
      current: {
        used: this.formatBytes(latest.used),
        total: this.formatBytes(latest.total),
        usage: ((latest.used / latest.total) * 100).toFixed(2) + '%'
      },
      
      growth: {
        absolute: latest.used - oldest.used,
        percentage: (((latest.used - oldest.used) / oldest.used) * 100).toFixed(2) + '%'
      },
      
      samples: this.samples
    }
  }
  
  // 格式化字节
  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
}

export const memoryMonitor = new MemoryMonitor()
```

## 五、自定义开发工具

### 5.1 Store Inspector

```vue
<template>
  <div class="store-inspector">
    <div class="header">
      <h3>Store Inspector</h3>
      <button @click="refresh">刷新</button>
    </div>
    
    <div class="store-list">
      <div 
        v-for="store in stores"
        :key="store.id"
        :class="['store-item', { active: selectedStore?.id === store.id }]"
        @click="selectStore(store)"
      >
        <div class="store-name">{{ store.id }}</div>
        <div class="store-info">
          <span class="state-count">{{ Object.keys(store.state).length }} 状态</span>
          <span class="action-count">{{ store.actions.length }} 方法</span>
        </div>
      </div>
    </div>
    
    <div v-if="selectedStore" class="store-details">
      <div class="tabs">
        <button 
          :class="{ active: activeTab === 'state' }"
          @click="activeTab = 'state'"
        >
          状态
        </button>
        <button 
          :class="{ active: activeTab === 'getters' }"
          @click="activeTab = 'getters'"
        >
          计算属性
        </button>
        <button 
          :class="{ active: activeTab === 'actions' }"
          @click="activeTab = 'actions'"
        >
          方法
        </button>
      </div>
      
      <div class="tab-content">
        <StateViewer 
          v-if="activeTab === 'state'"
          :state="selectedStore.state"
          @update="updateState"
        />
        
        <GettersViewer 
          v-if="activeTab === 'getters'"
          :getters="selectedStore.getters"
        />
        
        <ActionsViewer 
          v-if="activeTab === 'actions'"
          :actions="selectedStore.actions"
          @execute="executeAction"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getActivePinia } from 'pinia'

const stores = ref([])
const selectedStore = ref(null)
const activeTab = ref('state')

// 获取所有 Store 信息
const refresh = () => {
  const pinia = getActivePinia()
  if (!pinia) return
  
  stores.value = Array.from(pinia._s.values()).map(store => ({
    id: store.$id,
    state: store.$state,
    getters: extractGetters(store),
    actions: extractActions(store),
    instance: store
  }))
}

const selectStore = (store) => {
  selectedStore.value = store
}

const updateState = (path, value) => {
  if (!selectedStore.value) return
  
  const store = selectedStore.value.instance
  
  // 更新状态
  const keys = path.split('.')
  let target = store.$state
  
  for (let i = 0; i < keys.length - 1; i++) {
    target = target[keys[i]]
  }
  
  target[keys[keys.length - 1]] = value
  
  // 刷新显示
  refresh()
}

const executeAction = (actionName, args) => {
  if (!selectedStore.value) return
  
  const store = selectedStore.value.instance
  const result = store[actionName](...args)
  
  console.log(`Action ${actionName} executed:`, result)
  
  // 刷新显示
  setTimeout(refresh, 100)
}

// 提取 getters 信息
const extractGetters = (store) => {
  const getters = []
  const keys = Object.keys(store)
  
  keys.forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(store, key)
    if (descriptor && descriptor.get) {
      getters.push({
        name: key,
        value: store[key]
      })
    }
  })
  
  return getters
}

// 提取 actions 信息
const extractActions = (store) => {
  const actions = []
  const keys = Object.keys(store)
  
  keys.forEach(key => {
    if (typeof store[key] === 'function' && !key.startsWith('$')) {
      actions.push({
        name: key,
        fn: store[key]
      })
    }
  })
  
  return actions
}

onMounted(() => {
  refresh()
  
  // 定期刷新
  setInterval(refresh, 2000)
})
</script>

<style scoped>
.store-inspector {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: monospace;
}

.header {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.store-list {
  flex: 1;
  overflow-y: auto;
  border-right: 1px solid #ccc;
}

.store-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.store-item:hover {
  background: #f5f5f5;
}

.store-item.active {
  background: #e3f2fd;
}

.store-details {
  flex: 2;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #ccc;
}

.tabs button {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
}

.tabs button.active {
  background: #e3f2fd;
}

.tab-content {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}
</style>
```

## 参考资料

- [Vue DevTools Guide](https://devtools.vuejs.org/)
- [Pinia DevTools](https://pinia.vuejs.org/cookbook/devtools.html)
- [Browser DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Vue Performance Optimization](https://vuejs.org/guide/best-practices/performance.html)

**下一节** → [第 21 节：最佳实践](./21-pinia-best-practices.md)
