# 第 44 节：实时数据同步

## 概述

实时数据同步是现代应用的重要特性，包括 WebSocket、Server-Sent Events 和轮询等技术。本节介绍如何在状态管理中实现实时数据同步。

## 一、WebSocket 集成

### 1.1 WebSocket 状态管理

```javascript
// composables/useWebSocket.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useWebSocket(url, options = {}) {
  const {
    protocols = [],
    onOpen = () => {},
    onMessage = () => {},
    onError = () => {},
    onClose = () => {},
    heartbeat = false,
    heartbeatInterval = 30000,
    reconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000
  } = options

  const socket = ref(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const reconnectCount = ref(0)
  
  let heartbeatTimer = null
  let reconnectTimer = null

  const connect = () => {
    if (isConnecting.value || isConnected.value) return

    isConnecting.value = true
    socket.value = new WebSocket(url, protocols)

    socket.value.onopen = (event) => {
      isConnected.value = true
      isConnecting.value = false
      reconnectCount.value = 0
      
      if (heartbeat) {
        startHeartbeat()
      }
      
      onOpen(event)
    }

    socket.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data, event)
      } catch (error) {
        onMessage(event.data, event)
      }
    }

    socket.value.onerror = (event) => {
      onError(event)
    }

    socket.value.onclose = (event) => {
      isConnected.value = false
      isConnecting.value = false
      
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
      }
      
      onClose(event)
      
      if (reconnect && reconnectCount.value < maxReconnectAttempts) {
        scheduleReconnect()
      }
    }
  }

  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }
    
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
    }
    
    if (socket.value) {
      socket.value.close()
    }
  }

  const send = (data) => {
    if (!isConnected.value) {
      throw new Error('WebSocket is not connected')
    }
    
    const message = typeof data === 'string' ? data : JSON.stringify(data)
    socket.value.send(message)
  }

  const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => {
      if (isConnected.value) {
        send({ type: 'ping' })
      }
    }, heartbeatInterval)
  }

  const scheduleReconnect = () => {
    reconnectCount.value++
    
    reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect (${reconnectCount.value}/${maxReconnectAttempts})`)
      connect()
    }, reconnectInterval)
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    socket: readonly(socket),
    isConnected: readonly(isConnected),
    isConnecting: readonly(isConnecting),
    reconnectCount: readonly(reconnectCount),
    connect,
    disconnect,
    send
  }
}
```

### 1.2 WebSocket Store 集成

```javascript
// stores/realtime.js
export const useRealtimeStore = defineStore('realtime', {
  state: () => ({
    connection: null,
    isConnected: false,
    messages: [],
    users: new Map(),
    rooms: new Map(),
    notifications: []
  }),

  getters: {
    onlineUsers: (state) => Array.from(state.users.values()),
    unreadNotifications: (state) => state.notifications.filter(n => !n.read)
  },

  actions: {
    // 初始化 WebSocket 连接
    initConnection() {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
      
      this.connection = useWebSocket(wsUrl, {
        onOpen: () => {
          this.isConnected = true
          this.authenticate()
        },
        
        onMessage: (data) => {
          this.handleMessage(data)
        },
        
        onClose: () => {
          this.isConnected = false
        },
        
        onError: (error) => {
          console.error('WebSocket error:', error)
        },
        
        heartbeat: true,
        reconnect: true
      })
    },

    // 发送认证信息
    authenticate() {
      const userStore = useUserStore()
      if (userStore.user) {
        this.send({
          type: 'authenticate',
          token: userStore.token,
          userId: userStore.user.id
        })
      }
    },

    // 发送消息
    send(data) {
      if (this.connection && this.isConnected) {
        this.connection.send(data)
      }
    },

    // 处理接收到的消息
    handleMessage(data) {
      switch (data.type) {
        case 'user_online':
          this.users.set(data.user.id, data.user)
          break
          
        case 'user_offline':
          this.users.delete(data.userId)
          break
          
        case 'chat_message':
          this.messages.push(data.message)
          break
          
        case 'notification':
          this.notifications.push(data.notification)
          break
          
        case 'room_update':
          this.rooms.set(data.room.id, data.room)
          break
          
        case 'state_sync':
          this.handleStateSync(data.payload)
          break
      }
    },

    // 处理状态同步
    handleStateSync(payload) {
      Object.keys(payload).forEach(storeId => {
        const targetStore = this.getStore(storeId)
        if (targetStore) {
          targetStore.$patch(payload[storeId])
        }
      })
    },

    // 加入房间
    joinRoom(roomId) {
      this.send({
        type: 'join_room',
        roomId
      })
    },

    // 离开房间
    leaveRoom(roomId) {
      this.send({
        type: 'leave_room', 
        roomId
      })
    },

    // 发送聊天消息
    sendChatMessage(message, roomId = null) {
      this.send({
        type: 'chat_message',
        message,
        roomId
      })
    }
  }
})
```

## 二、Server-Sent Events (SSE)

### 2.1 SSE 实现

```javascript
// composables/useSSE.js
export function useSSE(url, options = {}) {
  const {
    withCredentials = true,
    onOpen = () => {},
    onMessage = () => {},
    onError = () => {}
  } = options

  const eventSource = ref(null)
  const isConnected = ref(false)
  const data = ref(null)
  const error = ref(null)

  const connect = () => {
    try {
      eventSource.value = new EventSource(url, { withCredentials })

      eventSource.value.onopen = (event) => {
        isConnected.value = true
        error.value = null
        onOpen(event)
      }

      eventSource.value.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data)
          data.value = parsedData
          onMessage(parsedData, event)
        } catch (e) {
          data.value = event.data
          onMessage(event.data, event)
        }
      }

      eventSource.value.onerror = (event) => {
        isConnected.value = false
        error.value = event
        onError(event)
      }
    } catch (e) {
      error.value = e
    }
  }

  const disconnect = () => {
    if (eventSource.value) {
      eventSource.value.close()
      isConnected.value = false
    }
  }

  // 监听特定事件类型
  const addEventListener = (eventType, handler) => {
    if (eventSource.value) {
      eventSource.value.addEventListener(eventType, handler)
    }
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return {
    isConnected: readonly(isConnected),
    data: readonly(data),
    error: readonly(error),
    connect,
    disconnect,
    addEventListener
  }
}

// SSE Store 集成
export const useSSEStore = defineStore('sse', {
  state: () => ({
    connections: new Map(),
    streams: new Map()
  }),

  actions: {
    // 创建 SSE 连接
    createConnection(key, url, handlers = {}) {
      const connection = useSSE(url, {
        onMessage: (data) => {
          this.streams.set(key, data)
          handlers.onMessage?.(data)
        },
        onError: handlers.onError,
        onOpen: handlers.onOpen
      })

      this.connections.set(key, connection)
      return connection
    },

    // 获取流数据
    getStream(key) {
      return this.streams.get(key)
    },

    // 关闭连接
    closeConnection(key) {
      const connection = this.connections.get(key)
      if (connection) {
        connection.disconnect()
        this.connections.delete(key)
        this.streams.delete(key)
      }
    }
  }
})
```

## 三、轮询机制

### 3.1 智能轮询

```javascript
// composables/usePolling.js
export function usePolling(fetcher, options = {}) {
  const {
    interval = 5000,
    immediate = true,
    errorRetryCount = 3,
    backoffFactor = 1.5,
    maxInterval = 30000
  } = options

  const isPolling = ref(false)
  const data = ref(null)
  const error = ref(null)
  const retryCount = ref(0)
  
  let timerId = null
  let currentInterval = interval

  const poll = async () => {
    if (!isPolling.value) return

    try {
      const result = await fetcher()
      data.value = result
      error.value = null
      retryCount.value = 0
      currentInterval = interval

      // 成功后继续轮询
      scheduleNext()
    } catch (err) {
      error.value = err
      retryCount.value++

      if (retryCount.value <= errorRetryCount) {
        // 指数退避
        currentInterval = Math.min(
          interval * Math.pow(backoffFactor, retryCount.value),
          maxInterval
        )
        scheduleNext()
      } else {
        stop()
      }
    }
  }

  const scheduleNext = () => {
    timerId = setTimeout(poll, currentInterval)
  }

  const start = () => {
    if (isPolling.value) return

    isPolling.value = true
    retryCount.value = 0
    currentInterval = interval

    if (immediate) {
      poll()
    } else {
      scheduleNext()
    }
  }

  const stop = () => {
    isPolling.value = false
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  const restart = () => {
    stop()
    start()
  }

  onUnmounted(stop)

  return {
    isPolling: readonly(isPolling),
    data: readonly(data),
    error: readonly(error),
    retryCount: readonly(retryCount),
    start,
    stop,
    restart
  }
}

// 轮询 Store
export const usePollingStore = defineStore('polling', {
  state: () => ({
    pollers: new Map(),
    data: new Map()
  }),

  actions: {
    // 创建轮询器
    createPoller(key, fetcher, options = {}) {
      const poller = usePolling(fetcher, {
        ...options,
        onSuccess: (data) => {
          this.data.set(key, data)
          options.onSuccess?.(data)
        }
      })

      this.pollers.set(key, poller)
      return poller
    },

    // 启动轮询
    startPolling(key) {
      const poller = this.pollers.get(key)
      if (poller) {
        poller.start()
      }
    },

    // 停止轮询
    stopPolling(key) {
      const poller = this.pollers.get(key)
      if (poller) {
        poller.stop()
      }
    },

    // 获取数据
    getData(key) {
      return this.data.get(key)
    }
  }
})
```

## 四、数据冲突解决

### 4.1 乐观更新

```javascript
// utils/optimisticUpdates.js
export class OptimisticUpdateManager {
  constructor() {
    this.pendingUpdates = new Map()
    this.rollbackStack = []
  }

  // 乐观更新
  async optimisticUpdate(key, optimisticData, serverUpdate) {
    // 保存当前状态
    const currentState = this.getCurrentState(key)
    this.rollbackStack.push({ key, state: currentState })

    // 立即应用乐观更新
    this.applyUpdate(key, optimisticData)
    this.pendingUpdates.set(key, { optimisticData, timestamp: Date.now() })

    try {
      // 执行服务器更新
      const serverResult = await serverUpdate()
      
      // 应用服务器结果
      this.applyUpdate(key, serverResult)
      this.pendingUpdates.delete(key)
      
      return serverResult
    } catch (error) {
      // 回滚乐观更新
      this.rollback(key)
      throw error
    }
  }

  // 回滚更新
  rollback(key) {
    const rollbackData = this.rollbackStack
      .reverse()
      .find(item => item.key === key)

    if (rollbackData) {
      this.applyUpdate(key, rollbackData.state)
    }

    this.pendingUpdates.delete(key)
  }

  // 检查是否有待处理更新
  hasPendingUpdate(key) {
    return this.pendingUpdates.has(key)
  }
}

// 在 Store 中使用
export const useOptimisticStore = defineStore('optimistic', {
  state: () => ({
    items: [],
    optimisticManager: new OptimisticUpdateManager()
  }),

  actions: {
    // 乐观添加项目
    async addItemOptimistically(item) {
      const tempId = `temp_${Date.now()}`
      const optimisticItem = { ...item, id: tempId, pending: true }

      return this.optimisticManager.optimisticUpdate(
        'addItem',
        () => {
          this.items.push(optimisticItem)
        },
        async () => {
          const response = await fetch('/api/items', {
            method: 'POST',
            body: JSON.stringify(item)
          })
          const serverItem = await response.json()
          
          // 替换临时项目
          const index = this.items.findIndex(i => i.id === tempId)
          if (index !== -1) {
            this.items[index] = serverItem
          }
          
          return serverItem
        }
      )
    }
  }
})
```

### 4.2 版本控制

```javascript
// utils/versionControl.js
export class StateVersionControl {
  constructor() {
    this.versions = new Map()
    this.conflicts = []
  }

  // 设置版本
  setVersion(key, version, data) {
    if (!this.versions.has(key)) {
      this.versions.set(key, [])
    }
    
    this.versions.get(key).push({
      version,
      data: JSON.parse(JSON.stringify(data)),
      timestamp: Date.now()
    })
  }

  // 检查冲突
  checkConflict(key, incomingVersion, incomingData) {
    const versions = this.versions.get(key) || []
    const latestVersion = versions[versions.length - 1]

    if (!latestVersion) return false

    if (latestVersion.version !== incomingVersion) {
      this.conflicts.push({
        key,
        localVersion: latestVersion.version,
        remoteVersion: incomingVersion,
        localData: latestVersion.data,
        remoteData: incomingData,
        timestamp: Date.now()
      })
      return true
    }

    return false
  }

  // 合并冲突
  mergeConflict(conflictId, resolution) {
    const conflict = this.conflicts.find(c => c.id === conflictId)
    if (!conflict) return null

    switch (resolution.strategy) {
      case 'useLocal':
        return conflict.localData
      case 'useRemote':
        return conflict.remoteData
      case 'merge':
        return this.smartMerge(conflict.localData, conflict.remoteData)
      case 'custom':
        return resolution.data
    }
  }

  // 智能合并
  smartMerge(local, remote) {
    if (typeof local !== 'object' || typeof remote !== 'object') {
      return remote // 基本类型使用远程版本
    }

    const merged = { ...local }
    
    Object.keys(remote).forEach(key => {
      if (!(key in local)) {
        merged[key] = remote[key] // 新字段
      } else if (local[key] !== remote[key]) {
        // 冲突字段，可以根据业务逻辑处理
        merged[key] = remote[key] // 默认使用远程版本
      }
    })

    return merged
  }
}
```

## 五、性能优化

### 5.1 连接池管理

```javascript
// utils/connectionPool.js
export class ConnectionPool {
  constructor(options = {}) {
    this.maxConnections = options.maxConnections || 5
    this.connections = new Map()
    this.queue = []
  }

  // 获取连接
  async getConnection(url) {
    const existingConnection = this.connections.get(url)
    
    if (existingConnection && existingConnection.readyState === WebSocket.OPEN) {
      return existingConnection
    }

    if (this.connections.size >= this.maxConnections) {
      return new Promise((resolve) => {
        this.queue.push({ url, resolve })
      })
    }

    return this.createConnection(url)
  }

  // 创建连接
  createConnection(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url)
      
      ws.onopen = () => {
        this.connections.set(url, ws)
        resolve(ws)
      }

      ws.onerror = reject
      
      ws.onclose = () => {
        this.connections.delete(url)
        this.processQueue()
      }
    })
  }

  // 处理队列
  processQueue() {
    if (this.queue.length > 0 && this.connections.size < this.maxConnections) {
      const { url, resolve } = this.queue.shift()
      this.createConnection(url).then(resolve)
    }
  }
}

export const connectionPool = new ConnectionPool()
```

## 参考资料

- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [实时应用设计模式](https://web.dev/websockets/)

**下一节** → [第 45 节：状态持久化](./45-state-persistence.md)
