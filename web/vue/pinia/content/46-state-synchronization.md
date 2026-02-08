# 第 46 节：状态同步策略

## 概述

在多客户端、多标签页或分布式环境中，状态同步是确保数据一致性的关键。本节介绍各种状态同步策略及其实现方法。

## 一、同步策略概览

### 1.1 同步模式分类

```javascript
// 同步策略类型
const syncStrategies = {
  // 主动同步
  push: {
    description: '客户端主动推送状态变更',
    advantages: ['实时性好', '减少轮询开销'],
    disadvantages: ['需要可靠连接', '可能产生冲突'],
    scenarios: ['实时协作', '即时通讯']
  },
  
  // 被动同步  
  pull: {
    description: '客户端定期拉取状态更新',
    advantages: ['简单可靠', '容错性好'],
    disadvantages: ['延迟较高', '资源消耗大'],
    scenarios: ['定期更新', '离线优先应用']
  },
  
  // 混合同步
  hybrid: {
    description: '结合推送和拉取的优势',
    advantages: ['平衡实时性和可靠性'],
    disadvantages: ['实现复杂'],
    scenarios: ['大多数现代应用']
  }
}
```

### 1.2 冲突解决策略

```javascript
// 冲突解决机制
export class ConflictResolver {
  constructor(strategy = 'lastWriteWins') {
    this.strategy = strategy
    this.resolvers = new Map([
      ['lastWriteWins', this.lastWriteWins],
      ['firstWriteWins', this.firstWriteWins],
      ['merge', this.merge],
      ['manual', this.manual]
    ])
  }
  
  // 解决冲突
  resolve(local, remote, metadata) {
    const resolver = this.resolvers.get(this.strategy)
    if (!resolver) {
      throw new Error(`Unknown conflict resolution strategy: ${this.strategy}`)
    }
    
    return resolver.call(this, local, remote, metadata)
  }
  
  // 最后写入获胜
  lastWriteWins(local, remote, metadata) {
    return metadata.remoteTimestamp > metadata.localTimestamp ? remote : local
  }
  
  // 第一写入获胜
  firstWriteWins(local, remote, metadata) {
    return metadata.localTimestamp < metadata.remoteTimestamp ? local : remote
  }
  
  // 智能合并
  merge(local, remote, metadata) {
    if (typeof local !== 'object' || typeof remote !== 'object') {
      return this.lastWriteWins(local, remote, metadata)
    }
    
    const merged = { ...local }
    
    Object.keys(remote).forEach(key => {
      if (!(key in local)) {
        merged[key] = remote[key]
      } else if (local[key] !== remote[key]) {
        // 递归合并嵌套对象
        if (typeof local[key] === 'object' && typeof remote[key] === 'object') {
          merged[key] = this.merge(local[key], remote[key], metadata)
        } else {
          merged[key] = this.lastWriteWins(local[key], remote[key], metadata)
        }
      }
    })
    
    return merged
  }
  
  // 手动解决
  manual(local, remote, metadata) {
    return new Promise((resolve) => {
      this.emitConflict({
        local,
        remote,
        metadata,
        resolve
      })
    })
  }
  
  emitConflict(conflictInfo) {
    // 触发冲突解决界面
    window.dispatchEvent(new CustomEvent('stateConflict', {
      detail: conflictInfo
    }))
  }
}
```

## 二、客户端间同步

### 2.1 基于 BroadcastChannel 的标签页同步

```javascript
// utils/tabSync.js
export class TabSyncManager {
  constructor(options = {}) {
    this.channelName = options.channelName || 'app-sync'
    this.channel = new BroadcastChannel(this.channelName)
    this.listeners = new Map()
    this.isLeader = false
    this.heartbeatInterval = options.heartbeatInterval || 1000
    
    this.setupLeaderElection()
    this.setupMessageHandling()
  }
  
  // 设置领导者选举
  setupLeaderElection() {
    const tabId = `tab-${Date.now()}-${Math.random()}`
    localStorage.setItem('leader-election', JSON.stringify({
      id: tabId,
      timestamp: Date.now()
    }))
    
    // 检查是否成为领导者
    setTimeout(() => {
      const current = JSON.parse(localStorage.getItem('leader-election') || '{}')
      if (current.id === tabId) {
        this.isLeader = true
        this.startHeartbeat()
      }
    }, 100)
    
    // 监听存储变化
    window.addEventListener('storage', (e) => {
      if (e.key === 'leader-election') {
        const data = JSON.parse(e.newValue || '{}')
        this.isLeader = data.id === tabId
      }
    })
  }
  
  // 启动心跳
  startHeartbeat() {
    const heartbeat = () => {
      if (this.isLeader) {
        localStorage.setItem('leader-heartbeat', Date.now().toString())
        setTimeout(heartbeat, this.heartbeatInterval)
      }
    }
    
    heartbeat()
  }
  
  // 设置消息处理
  setupMessageHandling() {
    this.channel.onmessage = (event) => {
      const { type, data, source } = event.data
      
      // 忽略自己发送的消息
      if (source === this.getTabId()) return
      
      const listeners = this.listeners.get(type) || []
      listeners.forEach(callback => {
        try {
          callback(data, event)
        } catch (error) {
          console.error('Error in sync listener:', error)
        }
      })
    }
  }
  
  // 广播消息
  broadcast(type, data) {
    this.channel.postMessage({
      type,
      data,
      source: this.getTabId(),
      timestamp: Date.now()
    })
  }
  
  // 监听消息
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type).push(callback)
    
    return () => {
      const callbacks = this.listeners.get(type) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
  
  // 获取标签页ID
  getTabId() {
    if (!this._tabId) {
      this._tabId = `tab-${Date.now()}-${Math.random()}`
    }
    return this._tabId
  }
  
  // 同步状态
  syncState(storeName, state) {
    this.broadcast('state-sync', { storeName, state })
  }
  
  // 清理资源
  destroy() {
    this.channel.close()
    this.listeners.clear()
  }
}

// Pinia 标签页同步插件
export function createTabSyncPlugin(options = {}) {
  const syncManager = new TabSyncManager(options)
  
  return (context) => {
    const { store } = context
    
    // 监听状态同步消息
    syncManager.on('state-sync', (data) => {
      if (data.storeName === store.$id) {
        store.$patch(data.state)
      }
    })
    
    // 监听状态变化并广播
    store.$subscribe((mutation, state) => {
      if (!options.debounce) {
        syncManager.syncState(store.$id, state)
      } else {
        // 防抖处理
        clearTimeout(store._syncTimeout)
        store._syncTimeout = setTimeout(() => {
          syncManager.syncState(store.$id, state)
        }, options.debounce)
      }
    })
  }
}
```

### 2.2 基于 SharedWorker 的多标签页通信

```javascript
// workers/sharedSync.js
class SharedSyncWorker {
  constructor() {
    this.connections = new Set()
    this.state = new Map()
    this.version = new Map()
  }
  
  onconnect(event) {
    const port = event.ports[0]
    this.connections.add(port)
    
    port.onmessage = (e) => {
      this.handleMessage(port, e.data)
    }
    
    port.onclose = () => {
      this.connections.delete(port)
    }
    
    // 发送当前状态
    port.postMessage({
      type: 'init',
      state: Object.fromEntries(this.state)
    })
  }
  
  handleMessage(sender, message) {
    const { type, storeId, data, version } = message
    
    switch (type) {
      case 'setState':
        this.setState(sender, storeId, data, version)
        break
      case 'getState':
        this.getState(sender, storeId)
        break
      case 'subscribe':
        // 订阅处理已在连接时设置
        break
    }
  }
  
  setState(sender, storeId, data, version) {
    const currentVersion = this.version.get(storeId) || 0
    
    if (version > currentVersion) {
      this.state.set(storeId, data)
      this.version.set(storeId, version)
      
      // 广播给其他连接
      this.broadcast({
        type: 'stateChanged',
        storeId,
        data,
        version
      }, sender)
    }
  }
  
  getState(sender, storeId) {
    sender.postMessage({
      type: 'state',
      storeId,
      data: this.state.get(storeId),
      version: this.version.get(storeId) || 0
    })
  }
  
  broadcast(message, exclude = null) {
    this.connections.forEach(port => {
      if (port !== exclude) {
        try {
          port.postMessage(message)
        } catch (error) {
          // 连接已关闭，清理
          this.connections.delete(port)
        }
      }
    })
  }
}

// 在 SharedWorker 中运行
if (typeof SharedWorkerGlobalScope !== 'undefined') {
  const syncWorker = new SharedSyncWorker()
  self.onconnect = syncWorker.onconnect.bind(syncWorker)
}

// 客户端连接器
export class SharedWorkerSync {
  constructor() {
    this.worker = new SharedWorker('/workers/sharedSync.js')
    this.port = this.worker.port
    this.listeners = new Map()
    this.version = new Map()
    
    this.setupMessageHandling()
    this.port.start()
  }
  
  setupMessageHandling() {
    this.port.onmessage = (event) => {
      const { type, storeId, data, version } = event.data
      
      switch (type) {
        case 'init':
          this.handleInit(data)
          break
        case 'stateChanged':
          this.handleStateChanged(storeId, data, version)
          break
        case 'state':
          this.handleState(storeId, data, version)
          break
      }
    }
  }
  
  handleInit(states) {
    Object.entries(states).forEach(([storeId, data]) => {
      this.notifyListeners(storeId, data)
    })
  }
  
  handleStateChanged(storeId, data, version) {
    const currentVersion = this.version.get(storeId) || 0
    
    if (version > currentVersion) {
      this.version.set(storeId, version)
      this.notifyListeners(storeId, data)
    }
  }
  
  setState(storeId, data) {
    const version = (this.version.get(storeId) || 0) + 1
    this.version.set(storeId, version)
    
    this.port.postMessage({
      type: 'setState',
      storeId,
      data,
      version
    })
  }
  
  subscribe(storeId, callback) {
    if (!this.listeners.has(storeId)) {
      this.listeners.set(storeId, [])
    }
    this.listeners.get(storeId).push(callback)
    
    return () => {
      const callbacks = this.listeners.get(storeId) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
  
  notifyListeners(storeId, data) {
    const callbacks = this.listeners.get(storeId) || []
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error in sync listener:', error)
      }
    })
  }
}
```

## 三、服务端同步

### 3.1 基于 WebSocket 的实时同步

```javascript
// sync/websocketSync.js
export class WebSocketSync {
  constructor(url, options = {}) {
    this.url = url
    this.options = options
    this.socket = null
    this.isConnected = false
    this.syncQueue = []
    this.listeners = new Map()
    this.conflictResolver = new ConflictResolver()
    
    this.connect()
  }
  
  connect() {
    this.socket = new WebSocket(this.url)
    
    this.socket.onopen = () => {
      this.isConnected = true
      this.authenticate()
      this.processQueue()
    }
    
    this.socket.onmessage = (event) => {
      this.handleMessage(JSON.parse(event.data))
    }
    
    this.socket.onclose = () => {
      this.isConnected = false
      this.scheduleReconnect()
    }
    
    this.socket.onerror = (error) => {
      console.error('WebSocket sync error:', error)
    }
  }
  
  authenticate() {
    this.send({
      type: 'auth',
      token: this.getAuthToken()
    })
  }
  
  handleMessage(message) {
    switch (message.type) {
      case 'sync':
        this.handleSyncMessage(message)
        break
      case 'conflict':
        this.handleConflict(message)
        break
      case 'ack':
        this.handleAcknowledgment(message)
        break
    }
  }
  
  handleSyncMessage(message) {
    const { storeId, data, version, timestamp } = message
    
    this.notifyListeners('sync', {
      storeId,
      remoteData: data,
      remoteVersion: version,
      remoteTimestamp: timestamp
    })
  }
  
  handleConflict(message) {
    const { storeId, localData, remoteData, metadata } = message
    
    const resolution = this.conflictResolver.resolve(
      localData,
      remoteData,
      metadata
    )
    
    if (resolution instanceof Promise) {
      resolution.then(resolved => {
        this.send({
          type: 'resolve-conflict',
          storeId,
          data: resolved,
          conflictId: message.conflictId
        })
      })
    } else {
      this.send({
        type: 'resolve-conflict',
        storeId,
        data: resolution,
        conflictId: message.conflictId
      })
    }
  }
  
  sync(storeId, data, version) {
    const message = {
      type: 'sync',
      storeId,
      data,
      version,
      timestamp: Date.now()
    }
    
    if (this.isConnected) {
      this.send(message)
    } else {
      this.syncQueue.push(message)
    }
  }
  
  send(message) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(message))
    }
  }
  
  processQueue() {
    while (this.syncQueue.length > 0) {
      const message = this.syncQueue.shift()
      this.send(message)
    }
  }
  
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
    
    return () => {
      const callbacks = this.listeners.get(event) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
  
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event) || []
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in ${event} listener:`, error)
      }
    })
  }
  
  scheduleReconnect() {
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect()
      }
    }, this.options.reconnectDelay || 3000)
  }
  
  getAuthToken() {
    return localStorage.getItem('auth-token') || ''
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close()
    }
  }
}
```

## 四、离线同步策略

### 4.1 离线队列管理

```javascript
// sync/offlineSync.js
export class OfflineSync {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'offline-sync-queue'
    this.maxQueueSize = options.maxQueueSize || 1000
    this.retryAttempts = options.retryAttempts || 3
    this.retryDelay = options.retryDelay || 1000
    
    this.queue = this.loadQueue()
    this.isOnline = navigator.onLine
    this.isSyncing = false
    
    this.setupNetworkListeners()
  }
  
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processQueue()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }
  
  // 添加到同步队列
  enqueue(operation) {
    const queueItem = {
      id: `${Date.now()}-${Math.random()}`,
      operation,
      timestamp: Date.now(),
      attempts: 0,
      status: 'pending'
    }
    
    this.queue.push(queueItem)
    
    // 限制队列大小
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift()
    }
    
    this.saveQueue()
    
    if (this.isOnline && !this.isSyncing) {
      this.processQueue()
    }
    
    return queueItem.id
  }
  
  // 处理同步队列
  async processQueue() {
    if (this.isSyncing || !this.isOnline) return
    
    this.isSyncing = true
    
    try {
      const pendingItems = this.queue.filter(item => 
        item.status === 'pending' && item.attempts < this.retryAttempts
      )
      
      for (const item of pendingItems) {
        try {
          await this.executeOperation(item)
          item.status = 'completed'
        } catch (error) {
          item.attempts++
          item.lastError = error.message
          
          if (item.attempts >= this.retryAttempts) {
            item.status = 'failed'
          }
          
          console.warn(`Sync operation failed (attempt ${item.attempts}):`, error)
        }
      }
      
      // 清理已完成和失败的项目
      this.queue = this.queue.filter(item => 
        item.status === 'pending' && item.attempts < this.retryAttempts
      )
      
      this.saveQueue()
    } finally {
      this.isSyncing = false
    }
  }
  
  // 执行同步操作
  async executeOperation(item) {
    const { operation } = item
    
    switch (operation.type) {
      case 'create':
        return this.handleCreate(operation)
      case 'update':
        return this.handleUpdate(operation)
      case 'delete':
        return this.handleDelete(operation)
      default:
        throw new Error(`Unknown operation type: ${operation.type}`)
    }
  }
  
  async handleCreate(operation) {
    const response = await fetch(operation.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...operation.headers
      },
      body: JSON.stringify(operation.data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  async handleUpdate(operation) {
    const response = await fetch(operation.url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...operation.headers
      },
      body: JSON.stringify(operation.data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  async handleDelete(operation) {
    const response = await fetch(operation.url, {
      method: 'DELETE',
      headers: operation.headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return true
  }
  
  // 保存队列到本地存储
  saveQueue() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue))
    } catch (error) {
      console.warn('Failed to save sync queue:', error)
    }
  }
  
  // 从本地存储加载队列
  loadQueue() {
    try {
      const saved = localStorage.getItem(this.storageKey)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.warn('Failed to load sync queue:', error)
      return []
    }
  }
  
  // 获取队列状态
  getQueueStatus() {
    const pending = this.queue.filter(item => item.status === 'pending').length
    const failed = this.queue.filter(item => item.status === 'failed').length
    
    return {
      total: this.queue.length,
      pending,
      failed,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing
    }
  }
  
  // 清空队列
  clearQueue() {
    this.queue = []
    this.saveQueue()
  }
}
```

## 参考资料

- [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- [SharedWorker API](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

**下一节** → [第 47 节：性能监控](./47-performance-monitoring.md)
