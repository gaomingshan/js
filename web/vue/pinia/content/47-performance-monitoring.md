# 第 47 节：性能监控

## 概述

性能监控是状态管理的重要环节，帮助识别瓶颈、优化性能和提升用户体验。本节介绍如何实现全面的性能监控体系。

## 一、基础性能指标

### 1.1 核心指标定义

```javascript
// performance/metrics.js
export class PerformanceMetrics {
  constructor() {
    this.metrics = new Map()
    this.observers = []
    this.startTime = performance.now()
  }
  
  // 记录时间指标
  recordTiming(name, duration, metadata = {}) {
    const metric = {
      type: 'timing',
      name,
      duration,
      timestamp: Date.now(),
      metadata
    }
    
    this.addMetric(metric)
  }
  
  // 记录计数指标
  recordCount(name, count = 1, metadata = {}) {
    const existing = this.metrics.get(name)
    const newCount = existing ? existing.count + count : count
    
    const metric = {
      type: 'count',
      name,
      count: newCount,
      timestamp: Date.now(),
      metadata
    }
    
    this.addMetric(metric)
  }
  
  // 记录内存使用
  recordMemoryUsage(name, metadata = {}) {
    if (!performance.memory) return
    
    const metric = {
      type: 'memory',
      name,
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now(),
      metadata
    }
    
    this.addMetric(metric)
  }
  
  // 添加指标
  addMetric(metric) {
    const key = `${metric.name}:${metric.timestamp}`
    this.metrics.set(key, metric)
    
    // 通知观察者
    this.observers.forEach(observer => {
      try {
        observer(metric)
      } catch (error) {
        console.error('Error in metrics observer:', error)
      }
    })
  }
  
  // 获取指标
  getMetrics(filter = {}) {
    const results = Array.from(this.metrics.values())
    
    if (filter.type) {
      return results.filter(m => m.type === filter.type)
    }
    
    if (filter.name) {
      return results.filter(m => m.name === filter.name)
    }
    
    return results
  }
  
  // 计算统计
  getStats(name, type = 'timing') {
    const metrics = this.getMetrics({ name, type })
    
    if (metrics.length === 0) return null
    
    const values = type === 'timing' 
      ? metrics.map(m => m.duration)
      : metrics.map(m => m.count)
    
    return {
      count: metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      median: this.calculateMedian(values),
      p95: this.calculatePercentile(values, 95),
      p99: this.calculatePercentile(values, 99)
    }
  }
  
  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }
  
  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }
}

export const performanceMetrics = new PerformanceMetrics()
```

### 1.2 Store 性能监控

```javascript
// plugins/performancePlugin.js
export function createPerformancePlugin(options = {}) {
  const {
    sampleRate = 1.0,
    slowActionThreshold = 100,
    slowMutationThreshold = 16,
    trackMemory = false
  } = options
  
  return (context) => {
    const { store } = context
    
    // 监控 actions
    const actionTimes = new Map()
    
    store.subscribeAction({
      before: (action) => {
        if (Math.random() <= sampleRate) {
          actionTimes.set(action, performance.now())
          
          if (trackMemory) {
            performanceMetrics.recordMemoryUsage(`action:${action.type}:before`)
          }
        }
      },
      
      after: (action) => {
        const startTime = actionTimes.get(action)
        if (startTime) {
          const duration = performance.now() - startTime
          
          performanceMetrics.recordTiming(`action:${action.type}`, duration, {
            storeId: store.$id,
            payload: action.payload
          })
          
          // 记录慢操作
          if (duration > slowActionThreshold) {
            performanceMetrics.recordCount('slow-actions', 1, {
              storeId: store.$id,
              actionType: action.type,
              duration
            })
          }
          
          if (trackMemory) {
            performanceMetrics.recordMemoryUsage(`action:${action.type}:after`)
          }
          
          actionTimes.delete(action)
        }
      },
      
      error: (action, error) => {
        performanceMetrics.recordCount('action-errors', 1, {
          storeId: store.$id,
          actionType: action.type,
          error: error.message
        })
        
        actionTimes.delete(action)
      }
    })
    
    // 监控 mutations (Vuex)
    if (store.subscribe) {
      const mutationTimes = new Map()
      
      store.subscribe((mutation, state) => {
        const startTime = performance.now()
        
        // 使用 nextTick 测量 mutation 完成时间
        Promise.resolve().then(() => {
          const duration = performance.now() - startTime
          
          performanceMetrics.recordTiming(`mutation:${mutation.type}`, duration, {
            storeId: store.$id || 'root',
            payload: mutation.payload
          })
          
          if (duration > slowMutationThreshold) {
            performanceMetrics.recordCount('slow-mutations', 1, {
              storeId: store.$id || 'root',
              mutationType: mutation.type,
              duration
            })
          }
        })
      })
    }
    
    // 监控状态变化频率
    let changeCount = 0
    const resetInterval = 60000 // 1分钟
    
    const countChanges = () => {
      changeCount++
    }
    
    if (store.subscribe) {
      store.subscribe(countChanges)
    } else {
      store.$subscribe(countChanges)
    }
    
    setInterval(() => {
      performanceMetrics.recordCount(`state-changes:${store.$id}`, changeCount)
      changeCount = 0
    }, resetInterval)
  }
}
```

## 二、实时监控面板

### 2.1 监控控制台

```javascript
// monitoring/console.js
export class MonitoringConsole {
  constructor(options = {}) {
    this.options = options
    this.isVisible = false
    this.updateInterval = options.updateInterval || 1000
    this.maxDataPoints = options.maxDataPoints || 100
    
    this.data = {
      actions: [],
      mutations: [],
      memory: [],
      errors: []
    }
    
    this.createElement()
    this.startUpdating()
  }
  
  createElement() {
    this.element = document.createElement('div')
    this.element.id = 'performance-console'
    this.element.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 400px;
      height: 300px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      border-radius: 8px;
      padding: 16px;
      z-index: 10000;
      display: none;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `
    
    document.body.appendChild(this.element)
    
    // 添加切换快捷键
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        this.toggle()
      }
    })
  }
  
  toggle() {
    this.isVisible = !this.isVisible
    this.element.style.display = this.isVisible ? 'block' : 'none'
  }
  
  startUpdating() {
    setInterval(() => {
      if (this.isVisible) {
        this.updateDisplay()
      }
    }, this.updateInterval)
    
    // 监听性能指标
    performanceMetrics.observers.push((metric) => {
      this.handleMetric(metric)
    })
  }
  
  handleMetric(metric) {
    switch (metric.type) {
      case 'timing':
        if (metric.name.startsWith('action:')) {
          this.data.actions.push(metric)
        } else if (metric.name.startsWith('mutation:')) {
          this.data.mutations.push(metric)
        }
        break
        
      case 'memory':
        this.data.memory.push(metric)
        break
        
      case 'count':
        if (metric.name.includes('error')) {
          this.data.errors.push(metric)
        }
        break
    }
    
    // 限制数据点数量
    Object.keys(this.data).forEach(key => {
      if (this.data[key].length > this.maxDataPoints) {
        this.data[key] = this.data[key].slice(-this.maxDataPoints)
      }
    })
  }
  
  updateDisplay() {
    const html = `
      <h3>State Management Performance</h3>
      ${this.renderSummary()}
      ${this.renderRecentActions()}
      ${this.renderMemoryUsage()}
      ${this.renderErrors()}
    `
    
    this.element.innerHTML = html
  }
  
  renderSummary() {
    const actionStats = performanceMetrics.getStats('action:*', 'timing')
    const mutationStats = performanceMetrics.getStats('mutation:*', 'timing')
    
    return `
      <div style="margin-bottom: 16px; padding: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">
        <div><strong>Actions:</strong> ${actionStats?.count || 0} (avg: ${actionStats?.avg.toFixed(2) || 0}ms)</div>
        <div><strong>Mutations:</strong> ${mutationStats?.count || 0} (avg: ${mutationStats?.avg.toFixed(2) || 0}ms)</div>
        <div><strong>Memory:</strong> ${this.formatBytes(performance.memory?.usedJSHeapSize || 0)}</div>
      </div>
    `
  }
  
  renderRecentActions() {
    const recent = this.data.actions.slice(-5)
    
    return `
      <div style="margin-bottom: 16px;">
        <strong>Recent Actions:</strong>
        ${recent.map(action => `
          <div style="margin-left: 8px; color: ${action.duration > 100 ? '#ff6b6b' : '#51cf66'};">
            ${action.name.replace('action:', '')} - ${action.duration.toFixed(2)}ms
          </div>
        `).join('')}
      </div>
    `
  }
  
  renderMemoryUsage() {
    const recent = this.data.memory.slice(-1)[0]
    if (!recent) return ''
    
    const usagePercent = (recent.used / recent.limit * 100).toFixed(1)
    
    return `
      <div style="margin-bottom: 16px;">
        <strong>Memory Usage:</strong>
        <div style="margin-left: 8px;">
          Used: ${this.formatBytes(recent.used)} / ${this.formatBytes(recent.limit)} (${usagePercent}%)
        </div>
      </div>
    `
  }
  
  renderErrors() {
    const errorCount = this.data.errors.reduce((sum, error) => sum + error.count, 0)
    
    return `
      <div>
        <strong>Errors:</strong> ${errorCount}
        ${this.data.errors.slice(-3).map(error => `
          <div style="margin-left: 8px; color: #ff6b6b;">
            ${error.name} - ${error.count}
          </div>
        `).join('')}
      </div>
    `
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
```

## 三、性能分析工具

### 3.1 性能分析器

```javascript
// tools/profiler.js
export class StateProfiler {
  constructor() {
    this.profiles = new Map()
    this.isRecording = false
    this.recordingStart = 0
  }
  
  startRecording(name = 'profile') {
    if (this.isRecording) {
      console.warn('Already recording. Stop current recording first.')
      return
    }
    
    this.isRecording = true
    this.recordingStart = performance.now()
    
    const profile = {
      name,
      startTime: this.recordingStart,
      endTime: null,
      actions: [],
      mutations: [],
      stateSnapshots: [],
      memorySnapshots: []
    }
    
    this.profiles.set(name, profile)
    
    // 开始收集数据
    this.startDataCollection(profile)
    
    console.log(`Started profiling: ${name}`)
    return name
  }
  
  stopRecording(name) {
    if (!this.isRecording) {
      console.warn('No active recording')
      return null
    }
    
    const profile = this.profiles.get(name)
    if (!profile) {
      console.warn(`Profile ${name} not found`)
      return null
    }
    
    profile.endTime = performance.now()
    profile.duration = profile.endTime - profile.startTime
    
    this.isRecording = false
    
    // 生成分析报告
    const report = this.generateReport(profile)
    
    console.log(`Stopped profiling: ${name} (${profile.duration.toFixed(2)}ms)`)
    return report
  }
  
  startDataCollection(profile) {
    const originalConsoleLog = console.log
    
    // 拦截性能指标
    const metricsObserver = (metric) => {
      if (!this.isRecording) return
      
      const timestamp = performance.now() - profile.startTime
      
      switch (metric.type) {
        case 'timing':
          if (metric.name.startsWith('action:')) {
            profile.actions.push({ ...metric, relativeTime: timestamp })
          } else if (metric.name.startsWith('mutation:')) {
            profile.mutations.push({ ...metric, relativeTime: timestamp })
          }
          break
          
        case 'memory':
          profile.memorySnapshots.push({ ...metric, relativeTime: timestamp })
          break
      }
    }
    
    performanceMetrics.observers.push(metricsObserver)
    
    // 定期采集状态快照
    const snapshotInterval = setInterval(() => {
      if (!this.isRecording) {
        clearInterval(snapshotInterval)
        return
      }
      
      this.captureStateSnapshot(profile)
    }, 100) // 每100ms采集一次
  }
  
  captureStateSnapshot(profile) {
    const timestamp = performance.now() - profile.startTime
    
    // 这里需要访问所有活跃的 stores
    // 实际实现中需要维护一个 store 注册表
    const snapshot = {
      timestamp,
      stores: this.getAllStoreStates()
    }
    
    profile.stateSnapshots.push(snapshot)
  }
  
  getAllStoreStates() {
    // 模拟获取所有 store 状态
    // 实际实现需要与 store 管理器集成
    return {
      // storeId: state
    }
  }
  
  generateReport(profile) {
    const report = {
      name: profile.name,
      duration: profile.duration,
      summary: this.generateSummary(profile),
      timeline: this.generateTimeline(profile),
      hotspots: this.findHotspots(profile),
      memoryAnalysis: this.analyzeMemory(profile)
    }
    
    return report
  }
  
  generateSummary(profile) {
    return {
      totalActions: profile.actions.length,
      totalMutations: profile.mutations.length,
      avgActionTime: profile.actions.reduce((sum, a) => sum + a.duration, 0) / profile.actions.length || 0,
      avgMutationTime: profile.mutations.reduce((sum, m) => sum + m.duration, 0) / profile.mutations.length || 0,
      slowestAction: profile.actions.reduce((max, a) => a.duration > max.duration ? a : max, { duration: 0 }),
      slowestMutation: profile.mutations.reduce((max, m) => m.duration > max.duration ? m : max, { duration: 0 })
    }
  }
  
  generateTimeline(profile) {
    const events = []
    
    // 添加 actions
    profile.actions.forEach(action => {
      events.push({
        type: 'action',
        name: action.name,
        start: action.relativeTime,
        duration: action.duration,
        metadata: action.metadata
      })
    })
    
    // 添加 mutations
    profile.mutations.forEach(mutation => {
      events.push({
        type: 'mutation',
        name: mutation.name,
        start: mutation.relativeTime,
        duration: mutation.duration,
        metadata: mutation.metadata
      })
    })
    
    return events.sort((a, b) => a.start - b.start)
  }
  
  findHotspots(profile) {
    const actionHotspots = this.groupByName(profile.actions)
    const mutationHotspots = this.groupByName(profile.mutations)
    
    return {
      actions: Object.entries(actionHotspots)
        .map(([name, items]) => ({
          name,
          count: items.length,
          totalTime: items.reduce((sum, item) => sum + item.duration, 0),
          avgTime: items.reduce((sum, item) => sum + item.duration, 0) / items.length
        }))
        .sort((a, b) => b.totalTime - a.totalTime),
        
      mutations: Object.entries(mutationHotspots)
        .map(([name, items]) => ({
          name,
          count: items.length,
          totalTime: items.reduce((sum, item) => sum + item.duration, 0),
          avgTime: items.reduce((sum, item) => sum + item.duration, 0) / items.length
        }))
        .sort((a, b) => b.totalTime - a.totalTime)
    }
  }
  
  analyzeMemory(profile) {
    if (profile.memorySnapshots.length < 2) return null
    
    const first = profile.memorySnapshots[0]
    const last = profile.memorySnapshots[profile.memorySnapshots.length - 1]
    
    return {
      initialUsage: first.used,
      finalUsage: last.used,
      peakUsage: Math.max(...profile.memorySnapshots.map(s => s.used)),
      growth: last.used - first.used,
      growthRate: (last.used - first.used) / profile.duration * 1000 // bytes per second
    }
  }
  
  groupByName(items) {
    return items.reduce((groups, item) => {
      const name = item.name
      if (!groups[name]) {
        groups[name] = []
      }
      groups[name].push(item)
      return groups
    }, {})
  }
  
  exportReport(name, format = 'json') {
    const profile = this.profiles.get(name)
    if (!profile) return null
    
    const report = this.generateReport(profile)
    
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2)
      case 'csv':
        return this.exportCSV(report)
      default:
        return report
    }
  }
  
  exportCSV(report) {
    const timeline = report.timeline
    const headers = ['Type', 'Name', 'Start', 'Duration', 'StoreId']
    
    const rows = timeline.map(event => [
      event.type,
      event.name,
      event.start.toFixed(2),
      event.duration.toFixed(2),
      event.metadata?.storeId || ''
    ])
    
    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')
  }
}

export const stateProfiler = new StateProfiler()
```

## 四、性能优化建议

### 4.1 自动化性能建议

```javascript
// analysis/advisor.js
export class PerformanceAdvisor {
  constructor(thresholds = {}) {
    this.thresholds = {
      slowAction: 100,
      slowMutation: 16,
      highFrequencyMutation: 50, // per second
      memoryGrowth: 1024 * 1024, // 1MB per minute
      ...thresholds
    }
  }
  
  analyze(profile) {
    const suggestions = []
    
    // 分析慢操作
    suggestions.push(...this.analyzeSlowOperations(profile))
    
    // 分析频繁操作
    suggestions.push(...this.analyzeHighFrequencyOperations(profile))
    
    // 分析内存使用
    suggestions.push(...this.analyzeMemoryUsage(profile))
    
    // 分析状态结构
    suggestions.push(...this.analyzeStateStructure(profile))
    
    return suggestions
  }
  
  analyzeSlowOperations(profile) {
    const suggestions = []
    
    // 检查慢 actions
    const slowActions = profile.actions.filter(a => a.duration > this.thresholds.slowAction)
    if (slowActions.length > 0) {
      suggestions.push({
        type: 'performance',
        level: 'warning',
        title: '发现慢操作',
        description: `${slowActions.length} 个 action 执行时间超过 ${this.thresholds.slowAction}ms`,
        recommendations: [
          '考虑将长时间运行的操作拆分为多个步骤',
          '使用异步处理避免阻塞 UI',
          '添加加载状态提升用户体验'
        ],
        details: slowActions.map(a => ({ name: a.name, duration: a.duration }))
      })
    }
    
    // 检查慢 mutations
    const slowMutations = profile.mutations.filter(m => m.duration > this.thresholds.slowMutation)
    if (slowMutations.length > 0) {
      suggestions.push({
        type: 'performance',
        level: 'error',
        title: '发现慢状态变更',
        description: `${slowMutations.length} 个 mutation 执行时间超过 ${this.thresholds.slowMutation}ms`,
        recommendations: [
          '避免在 mutation 中进行复杂计算',
          '考虑使用 getter 进行状态派生',
          '优化状态数据结构'
        ],
        details: slowMutations.map(m => ({ name: m.name, duration: m.duration }))
      })
    }
    
    return suggestions
  }
  
  analyzeHighFrequencyOperations(profile) {
    const suggestions = []
    const duration = profile.duration / 1000 // 转换为秒
    
    // 分析高频 mutations
    const mutationGroups = this.groupByName(profile.mutations)
    
    Object.entries(mutationGroups).forEach(([name, mutations]) => {
      const frequency = mutations.length / duration
      
      if (frequency > this.thresholds.highFrequencyMutation) {
        suggestions.push({
          type: 'optimization',
          level: 'info',
          title: '高频状态变更',
          description: `${name} 每秒触发 ${frequency.toFixed(1)} 次`,
          recommendations: [
            '考虑使用防抖或节流',
            '批量更新状态',
            '检查是否存在不必要的更新'
          ],
          details: { name, frequency, count: mutations.length }
        })
      }
    })
    
    return suggestions
  }
  
  analyzeMemoryUsage(profile) {
    const suggestions = []
    const memoryAnalysis = this.analyzeMemory(profile)
    
    if (memoryAnalysis && memoryAnalysis.growthRate > this.thresholds.memoryGrowth / 60) {
      suggestions.push({
        type: 'memory',
        level: 'warning',
        title: '内存增长过快',
        description: `内存使用每秒增长 ${this.formatBytes(memoryAnalysis.growthRate)}`,
        recommendations: [
          '检查是否存在内存泄漏',
          '清理不必要的状态数据',
          '优化状态数据结构'
        ],
        details: memoryAnalysis
      })
    }
    
    return suggestions
  }
  
  analyzeStateStructure(profile) {
    const suggestions = []
    
    // 分析状态快照
    if (profile.stateSnapshots.length > 0) {
      const lastSnapshot = profile.stateSnapshots[profile.stateSnapshots.length - 1]
      
      // 检查状态深度
      const depth = this.calculateMaxDepth(lastSnapshot.stores)
      if (depth > 5) {
        suggestions.push({
          type: 'structure',
          level: 'info',
          title: '状态嵌套过深',
          description: `状态对象最大嵌套深度为 ${depth}`,
          recommendations: [
            '考虑扁平化状态结构',
            '使用归一化数据结构',
            '将复杂状态拆分为多个 store'
          ],
          details: { maxDepth: depth }
        })
      }
    }
    
    return suggestions
  }
  
  calculateMaxDepth(obj, currentDepth = 0) {
    if (typeof obj !== 'object' || obj === null) {
      return currentDepth
    }
    
    let maxDepth = currentDepth
    
    Object.values(obj).forEach(value => {
      const depth = this.calculateMaxDepth(value, currentDepth + 1)
      maxDepth = Math.max(maxDepth, depth)
    })
    
    return maxDepth
  }
  
  groupByName(items) {
    return items.reduce((groups, item) => {
      const name = item.name
      if (!groups[name]) {
        groups[name] = []
      }
      groups[name].push(item)
      return groups
    }, {})
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const performanceAdvisor = new PerformanceAdvisor()
```

## 参考资料

- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [User Timing API](https://developer.mozilla.org/en-US/docs/Web/API/User_Timing_API)
- [Memory API](https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory)

**下一节** → [第 48 节：错误处理与监控](./48-error-handling.md)
