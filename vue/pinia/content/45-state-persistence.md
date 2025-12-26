# 第 45 节：状态持久化

## 概述

状态持久化是现代应用的关键特性，确保用户数据在页面刷新、浏览器重启后得以保持。本节介绍多种持久化策略及其在状态管理中的应用。

## 一、持久化策略概览

### 1.1 存储方案对比

```javascript
// 不同存储方案的特性对比
const storageComparison = {
  localStorage: {
    capacity: '5-10MB',
    persistence: '永久（除非手动清除）',
    scope: '同源',
    synchronous: true,
    support: '现代浏览器全支持'
  },
  
  sessionStorage: {
    capacity: '5-10MB', 
    persistence: '会话期间',
    scope: '同标签页',
    synchronous: true,
    support: '现代浏览器全支持'
  },
  
  indexedDB: {
    capacity: '浏览器可用空间的50%',
    persistence: '永久（除非手动清除）',
    scope: '同源',
    synchronous: false,
    support: '现代浏览器全支持'
  },
  
  webSQL: {
    capacity: '5MB-50MB',
    persistence: '永久',
    scope: '同源',
    synchronous: false,
    support: '已废弃'
  },
  
  cookies: {
    capacity: '4KB',
    persistence: '可配置过期时间',
    scope: '同源（可配置域）',
    synchronous: true,
    support: '全浏览器支持'
  }
}
```

### 1.2 持久化架构设计

```javascript
// 持久化层架构
export class PersistenceLayer {
  constructor(options = {}) {
    this.adapters = new Map()
    this.defaultAdapter = options.defaultAdapter || 'localStorage'
    this.encryptionKey = options.encryptionKey
    
    this.registerDefaultAdapters()
  }
  
  // 注册默认适配器
  registerDefaultAdapters() {
    this.register('localStorage', new LocalStorageAdapter())
    this.register('sessionStorage', new SessionStorageAdapter())
    this.register('indexedDB', new IndexedDBAdapter())
    this.register('memory', new MemoryAdapter())
  }
  
  // 注册持久化适配器
  register(name, adapter) {
    this.adapters.set(name, adapter)
  }
  
  // 获取适配器
  getAdapter(name = this.defaultAdapter) {
    const adapter = this.adapters.get(name)
    if (!adapter) {
      throw new Error(`Adapter '${name}' not found`)
    }
    return adapter
  }
  
  // 保存数据
  async save(key, data, options = {}) {
    const adapter = this.getAdapter(options.adapter)
    const serializedData = this.serialize(data, options)
    
    return adapter.save(key, serializedData, options)
  }
  
  // 加载数据
  async load(key, options = {}) {
    const adapter = this.getAdapter(options.adapter)
    const serializedData = await adapter.load(key, options)
    
    return this.deserialize(serializedData, options)
  }
  
  // 删除数据
  async remove(key, options = {}) {
    const adapter = this.getAdapter(options.adapter)
    return adapter.remove(key, options)
  }
  
  // 序列化数据
  serialize(data, options) {
    let serialized = JSON.stringify(data)
    
    if (options.encrypt && this.encryptionKey) {
      serialized = this.encrypt(serialized)
    }
    
    if (options.compress) {
      serialized = this.compress(serialized)
    }
    
    return serialized
  }
  
  // 反序列化数据
  deserialize(data, options) {
    if (!data) return null
    
    let processed = data
    
    if (options.compress) {
      processed = this.decompress(processed)
    }
    
    if (options.encrypt && this.encryptionKey) {
      processed = this.decrypt(processed)
    }
    
    return JSON.parse(processed)
  }
}
```

## 二、localStorage 集成

### 2.1 基础 localStorage 适配器

```javascript
// adapters/localStorageAdapter.js
export class LocalStorageAdapter {
  constructor(options = {}) {
    this.prefix = options.prefix || 'app:'
    this.version = options.version || '1.0'
  }
  
  // 生成完整键名
  getKey(key) {
    return `${this.prefix}${key}`
  }
  
  // 保存数据
  async save(key, data, options = {}) {
    try {
      const fullKey = this.getKey(key)
      const payload = {
        data,
        version: this.version,
        timestamp: Date.now(),
        expires: options.expires ? Date.now() + options.expires : null
      }
      
      localStorage.setItem(fullKey, JSON.stringify(payload))
      return true
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // 存储空间不足，尝试清理
        await this.cleanup()
        // 重试一次
        try {
          localStorage.setItem(this.getKey(key), JSON.stringify(payload))
          return true
        } catch (retryError) {
          throw new Error('Storage quota exceeded and cleanup failed')
        }
      }
      throw error
    }
  }
  
  // 加载数据
  async load(key) {
    try {
      const fullKey = this.getKey(key)
      const item = localStorage.getItem(fullKey)
      
      if (!item) return null
      
      const payload = JSON.parse(item)
      
      // 检查版本
      if (payload.version !== this.version) {
        console.warn(`Version mismatch for key ${key}. Expected ${this.version}, got ${payload.version}`)
        await this.remove(key)
        return null
      }
      
      // 检查过期时间
      if (payload.expires && Date.now() > payload.expires) {
        await this.remove(key)
        return null
      }
      
      return payload.data
    } catch (error) {
      console.error(`Failed to load data for key ${key}:`, error)
      return null
    }
  }
  
  // 删除数据
  async remove(key) {
    const fullKey = this.getKey(key)
    localStorage.removeItem(fullKey)
    return true
  }
  
  // 清理过期数据
  async cleanup() {
    const keysToRemove = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key)
          const payload = JSON.parse(item)
          
          // 清理过期或版本不匹配的数据
          if (
            (payload.expires && Date.now() > payload.expires) ||
            payload.version !== this.version
          ) {
            keysToRemove.push(key)
          }
        } catch (error) {
          // 清理损坏的数据
          keysToRemove.push(key)
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    return keysToRemove.length
  }
  
  // 获取存储使用情况
  getUsage() {
    let totalSize = 0
    const items = {}
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        const value = localStorage.getItem(key)
        const size = new Blob([value]).size
        totalSize += size
        items[key.replace(this.prefix, '')] = size
      }
    }
    
    return { totalSize, items }
  }
}
```

### 2.2 Pinia localStorage 插件

```javascript
// plugins/piniaLocalStorage.js
export function createLocalStoragePlugin(options = {}) {
  const {
    key = (storeId) => `pinia:${storeId}`,
    storage = localStorage,
    paths = null,
    beforeRestore = null,
    afterRestore = null,
    serializer = {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    }
  } = options
  
  return (context) => {
    const { store, options: storeOptions } = context
    
    // 检查是否启用持久化
    if (!storeOptions.persist) return
    
    const persistConfig = typeof storeOptions.persist === 'boolean' 
      ? {} 
      : storeOptions.persist
    
    const storageKey = typeof persistConfig.key === 'function'
      ? persistConfig.key(store.$id)
      : persistConfig.key || key(store.$id)
    
    const persistPaths = persistConfig.paths || paths
    const storageInstance = persistConfig.storage || storage
    
    // 恢复状态
    const restore = () => {
      try {
        beforeRestore?.(context)
        
        const saved = storageInstance.getItem(storageKey)
        if (saved) {
          const data = serializer.deserialize(saved)
          
          if (persistPaths) {
            // 只恢复指定路径
            const toRestore = {}
            persistPaths.forEach(path => {
              if (hasPath(data, path)) {
                setPath(toRestore, path, getPath(data, path))
              }
            })
            store.$patch(toRestore)
          } else {
            // 恢复整个状态
            store.$patch(data)
          }
        }
        
        afterRestore?.(context)
      } catch (error) {
        console.error('Failed to restore persisted state:', error)
      }
    }
    
    // 保存状态
    const save = () => {
      try {
        const state = store.$state
        const dataToPersist = persistPaths
          ? persistPaths.reduce((acc, path) => {
              if (hasPath(state, path)) {
                setPath(acc, path, getPath(state, path))
              }
              return acc
            }, {})
          : state
        
        storageInstance.setItem(storageKey, serializer.serialize(dataToPersist))
      } catch (error) {
        console.error('Failed to persist state:', error)
      }
    }
    
    // 初始恢复
    restore()
    
    // 监听状态变化
    store.$subscribe((mutation, state) => {
      save()
    })
  }
}

// 路径工具函数
function hasPath(obj, path) {
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current == null || !(key in current)) {
      return false
    }
    current = current[key]
  }
  
  return true
}

function getPath(obj, path) {
  const keys = path.split('.')
  return keys.reduce((current, key) => current?.[key], obj)
}

function setPath(obj, path, value) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  
  let current = obj
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[lastKey] = value
}
```

## 三、IndexedDB 集成

### 3.1 IndexedDB 适配器

```javascript
// adapters/indexedDBAdapter.js
export class IndexedDBAdapter {
  constructor(options = {}) {
    this.dbName = options.dbName || 'AppStorage'
    this.version = options.version || 1
    this.storeName = options.storeName || 'keyValueStore'
    this.db = null
  }
  
  // 初始化数据库
  async init() {
    if (this.db) return this.db
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('expires', 'expires', { unique: false })
        }
      }
    })
  }
  
  // 保存数据
  async save(key, data, options = {}) {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      const record = {
        key,
        value: data,
        timestamp: Date.now(),
        expires: options.expires ? Date.now() + options.expires : null,
        metadata: options.metadata || {}
      }
      
      const request = store.put(record)
      
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }
  
  // 加载数据
  async load(key) {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)
      
      request.onsuccess = () => {
        const record = request.result
        
        if (!record) {
          resolve(null)
          return
        }
        
        // 检查过期时间
        if (record.expires && Date.now() > record.expires) {
          this.remove(key)
          resolve(null)
          return
        }
        
        resolve(record.value)
      }
      
      request.onerror = () => reject(request.error)
    })
  }
  
  // 删除数据
  async remove(key) {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)
      
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }
  
  // 清理过期数据
  async cleanup() {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('expires')
      
      const request = index.openCursor(IDBKeyRange.upperBound(Date.now()))
      const deletedKeys = []
      
      request.onsuccess = (event) => {
        const cursor = event.target.result
        
        if (cursor) {
          deletedKeys.push(cursor.value.key)
          cursor.delete()
          cursor.continue()
        } else {
          resolve(deletedKeys)
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }
  
  // 查询数据
  async query(options = {}) {
    await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      
      let request
      if (options.index && options.range) {
        const index = store.index(options.index)
        request = index.getAll(options.range)
      } else {
        request = store.getAll()
      }
      
      request.onsuccess = () => {
        let results = request.result
        
        // 过滤过期数据
        results = results.filter(record => 
          !record.expires || Date.now() <= record.expires
        )
        
        // 应用过滤器
        if (options.filter) {
          results = results.filter(options.filter)
        }
        
        // 排序
        if (options.sort) {
          results.sort(options.sort)
        }
        
        // 限制数量
        if (options.limit) {
          results = results.slice(0, options.limit)
        }
        
        resolve(results)
      }
      
      request.onerror = () => reject(request.error)
    })
  }
}
```

## 四、数据压缩与加密

### 4.1 压缩实现

```javascript
// utils/compression.js
export class CompressionUtils {
  // LZ字符串压缩
  static lzwCompress(str) {
    const dict = {}
    const data = (str + '').split('')
    const out = []
    let currChar
    let phrase = data[0]
    let code = 256
    
    for (let i = 1; i < data.length; i++) {
      currChar = data[i]
      if (dict[phrase + currChar] != null) {
        phrase += currChar
      } else {
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0))
        dict[phrase + currChar] = code
        code++
        phrase = currChar
      }
    }
    
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0))
    
    return out
  }
  
  // LZ字符串解压
  static lzwDecompress(data) {
    const dict = {}
    const result = []
    let entry = String.fromCharCode(data[0])
    let currCode = data[0]
    result.push(entry)
    
    for (let i = 1; i < data.length; i++) {
      const code = data[i]
      let w
      
      if (dict[code]) {
        w = dict[code]
      } else if (code === result.length) {
        w = entry + entry.charAt(0)
      } else {
        throw new Error('Invalid compressed data')
      }
      
      result.push(w)
      dict[currCode] = entry + w.charAt(0)
      currCode++
      entry = w
    }
    
    return result.join('')
  }
  
  // 简单 RLE 压缩
  static rleCompress(str) {
    let compressed = ''
    let count = 1
    
    for (let i = 0; i < str.length; i++) {
      if (i + 1 < str.length && str[i] === str[i + 1]) {
        count++
      } else {
        compressed += count > 1 ? `${count}${str[i]}` : str[i]
        count = 1
      }
    }
    
    return compressed
  }
}
```

### 4.2 加密实现

```javascript
// utils/encryption.js
export class EncryptionUtils {
  constructor(secretKey) {
    this.key = secretKey
  }
  
  // 简单 XOR 加密（仅演示用）
  encrypt(text) {
    let result = ''
    
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length)
      )
    }
    
    return btoa(result) // Base64 编码
  }
  
  // 简单 XOR 解密
  decrypt(encryptedText) {
    const decoded = atob(encryptedText) // Base64 解码
    let result = ''
    
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length)
      )
    }
    
    return result
  }
  
  // 使用 Web Crypto API 进行 AES 加密
  async encryptAES(text) {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.key.slice(0, 32).padEnd(32, '0')),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )
    
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )
    
    const result = new Uint8Array(iv.length + encrypted.byteLength)
    result.set(iv)
    result.set(new Uint8Array(encrypted), iv.length)
    
    return btoa(String.fromCharCode(...result))
  }
  
  // 使用 Web Crypto API 进行 AES 解密
  async decryptAES(encryptedText) {
    const data = new Uint8Array(
      atob(encryptedText).split('').map(char => char.charCodeAt(0))
    )
    
    const iv = data.slice(0, 12)
    const encrypted = data.slice(12)
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.key.slice(0, 32).padEnd(32, '0')),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )
    
    return new TextDecoder().decode(decrypted)
  }
}
```

## 五、高级持久化特性

### 5.1 多层存储策略

```javascript
// strategies/tieredStorage.js
export class TieredStorageStrategy {
  constructor() {
    this.tiers = [
      { name: 'memory', adapter: new MemoryAdapter(), priority: 1 },
      { name: 'localStorage', adapter: new LocalStorageAdapter(), priority: 2 },
      { name: 'indexedDB', adapter: new IndexedDBAdapter(), priority: 3 }
    ]
  }
  
  // 保存数据到所有层级
  async save(key, data, options = {}) {
    const results = await Promise.allSettled(
      this.tiers.map(tier => 
        tier.adapter.save(key, data, { ...options, tier: tier.name })
      )
    )
    
    return results.some(result => result.status === 'fulfilled')
  }
  
  // 从最高优先级层级加载数据
  async load(key, options = {}) {
    for (const tier of this.tiers) {
      try {
        const data = await tier.adapter.load(key, options)
        if (data !== null) {
          // 回写到更高优先级的层级
          this.backfill(key, data, tier.priority)
          return data
        }
      } catch (error) {
        console.warn(`Failed to load from ${tier.name}:`, error)
      }
    }
    
    return null
  }
  
  // 回写数据到更高优先级的层级
  async backfill(key, data, fromPriority) {
    const higherTiers = this.tiers.filter(tier => tier.priority < fromPriority)
    
    await Promise.allSettled(
      higherTiers.map(tier => tier.adapter.save(key, data))
    )
  }
}
```

### 5.2 智能缓存策略

```javascript
// strategies/smartCache.js
export class SmartCacheStrategy {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 10 * 1024 * 1024 // 10MB
    this.maxAge = options.maxAge || 24 * 60 * 60 * 1000 // 24小时
    this.accessTracker = new Map()
    this.sizeTracker = new Map()
  }
  
  // 记录访问
  recordAccess(key, size) {
    const now = Date.now()
    const access = this.accessTracker.get(key) || { count: 0, lastAccess: now, firstAccess: now }
    
    access.count++
    access.lastAccess = now
    
    this.accessTracker.set(key, access)
    this.sizeTracker.set(key, size)
  }
  
  // 计算缓存分数
  calculateScore(key) {
    const access = this.accessTracker.get(key)
    if (!access) return 0
    
    const now = Date.now()
    const age = now - access.firstAccess
    const recency = now - access.lastAccess
    const frequency = access.count
    const size = this.sizeTracker.get(key) || 1
    
    // 综合分数：频率高、最近访问、存在时间长、体积小的项目分数高
    return (frequency * 1000 + (this.maxAge - recency)) / (age + size)
  }
  
  // 清理低分数缓存
  async cleanup(targetSize = this.maxSize * 0.8) {
    const entries = Array.from(this.accessTracker.keys()).map(key => ({
      key,
      score: this.calculateScore(key),
      size: this.sizeTracker.get(key) || 0
    }))
    
    // 按分数排序
    entries.sort((a, b) => a.score - b.score)
    
    let currentSize = Array.from(this.sizeTracker.values()).reduce((a, b) => a + b, 0)
    const toRemove = []
    
    for (const entry of entries) {
      if (currentSize <= targetSize) break
      
      toRemove.push(entry.key)
      currentSize -= entry.size
      this.accessTracker.delete(entry.key)
      this.sizeTracker.delete(entry.key)
    }
    
    return toRemove
  }
}
```

## 参考资料

- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

**下一节** → [第 46 节：状态同步策略](./46-state-synchronization.md)
