# 4.3 状态持久化

## 概述

状态持久化是将 Store 的状态保存到本地存储（localStorage、sessionStorage、IndexedDB 等），以便在页面刷新或重新访问时恢复状态。本节介绍持久化的实现原理和最佳实践。

## 持久化的实现原理

### 基本原理

1. **保存**：监听 Store 状态变化，序列化后保存到存储
2. **恢复**：应用启动时，从存储读取并恢复到 Store

```javascript
// 简单的持久化实现
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    token: null
  }),
  
  actions: {
    // 初始化：从 localStorage 恢复
    init() {
      const saved = localStorage.getItem('user')
      if (saved) {
        this.$patch(JSON.parse(saved))
      }
    },
    
    // 保存到 localStorage
    save() {
      localStorage.setItem('user', JSON.stringify(this.$state))
    }
  }
})

// 使用
const userStore = useUserStore()
userStore.init() // 恢复状态

// 监听变化并保存
userStore.$subscribe(() => {
  userStore.save()
})
```

### 自动化实现

使用 Pinia 插件自动化持久化：

```javascript
// plugins/persistence.js
export function persistencePlugin({ store }) {
  const key = `pinia-${store.$id}`
  
  // 1. 恢复状态
  const saved = localStorage.getItem(key)
  if (saved) {
    store.$patch(JSON.parse(saved))
  }
  
  // 2. 监听变化并保存
  store.$subscribe((mutation, state) => {
    localStorage.setItem(key, JSON.stringify(state))
  })
}

// main.js
import { createPinia } from 'pinia'
import { persistencePlugin } from './plugins/persistence'

const pinia = createPinia()
pinia.use(persistencePlugin)
```

## 使用 pinia-plugin-persistedstate

### 安装

```bash
npm install pinia-plugin-persistedstate
```

### 基本使用

```javascript
// main.js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

### Store 配置

```javascript
// stores/user.js
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    token: null,
    preferences: {}
  }),
  
  // 启用持久化
  persist: true
})

// 默认：
// - 存储到 localStorage
// - key 为 store.$id
// - 持久化整个 state
```

### 自定义配置

```javascript
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    token: null,
    tempData: null
  }),
  
  persist: {
    // 自定义 key
    key: 'my-user-store',
    
    // 使用 sessionStorage
    storage: sessionStorage,
    
    // 只持久化部分字段
    paths: ['name', 'token']
    // tempData 不会被持久化
  }
})
```

### 多存储策略

```javascript
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    tempSelection: null,
    wishlist: []
  }),
  
  persist: [
    {
      // 购物车保存到 localStorage
      key: 'cart-items',
      storage: localStorage,
      paths: ['items']
    },
    {
      // 心愿单保存到 sessionStorage
      key: 'wishlist',
      storage: sessionStorage,
      paths: ['wishlist']
    }
    // tempSelection 不持久化
  ]
})
```

## 自定义持久化策略

### 选择性持久化

```javascript
// plugins/customPersistence.js
export function createCustomPersistence(options = {}) {
  return function({ store }) {
    const {
      // 包含的 Store ID
      include = [],
      // 排除的 Store ID
      exclude = [],
      // 存储引擎
      storage = localStorage,
      // 序列化器
      serializer = JSON
    } = options
    
    // 判断是否需要持久化
    const shouldPersist = 
      (include.length === 0 || include.includes(store.$id)) &&
      !exclude.includes(store.$id)
    
    if (!shouldPersist) return
    
    const key = `store-${store.$id}`
    
    // 恢复
    try {
      const saved = storage.getItem(key)
      if (saved) {
        const data = serializer.parse(saved)
        store.$patch(data)
      }
    } catch (error) {
      console.error(`恢复 ${store.$id} 失败:`, error)
    }
    
    // 保存
    store.$subscribe(
      (mutation, state) => {
        try {
          storage.setItem(key, serializer.stringify(state))
        } catch (error) {
          console.error(`保存 ${store.$id} 失败:`, error)
        }
      },
      { detached: true }
    )
  }
}

// 使用
const pinia = createPinia()
pinia.use(createCustomPersistence({
  include: ['user', 'cart'],
  exclude: ['temp'],
  storage: localStorage
}))
```

### 防抖保存

避免频繁写入存储：

```javascript
import { debounce } from 'lodash-es'

export function debouncedPersistencePlugin({ store }) {
  const key = `store-${store.$id}`
  
  // 恢复
  const saved = localStorage.getItem(key)
  if (saved) {
    store.$patch(JSON.parse(saved))
  }
  
  // 防抖保存（1秒内多次修改只保存一次）
  const saveToStorage = debounce((state) => {
    localStorage.setItem(key, JSON.stringify(state))
  }, 1000)
  
  store.$subscribe((mutation, state) => {
    saveToStorage(state)
  })
}
```

### 版本控制

处理数据结构变化：

```javascript
export function versionedPersistencePlugin({ store }) {
  const key = `store-${store.$id}`
  const VERSION = 2 // 当前版本
  
  // 恢复
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      
      if (data.version === VERSION) {
        // 版本匹配，直接恢复
        store.$patch(data.state)
      } else if (data.version < VERSION) {
        // 版本过旧，执行迁移
        const migrated = migrate(data.state, data.version, VERSION)
        store.$patch(migrated)
      } else {
        // 版本过新，清除数据
        console.warn('数据版本过新，清除缓存')
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.error('恢复数据失败:', error)
    }
  }
  
  // 保存（带版本号）
  store.$subscribe((mutation, state) => {
    localStorage.setItem(key, JSON.stringify({
      version: VERSION,
      state,
      timestamp: Date.now()
    }))
  })
}

// 数据迁移函数
function migrate(state, fromVersion, toVersion) {
  let migrated = { ...state }
  
  if (fromVersion === 1 && toVersion === 2) {
    // v1 -> v2: 添加新字段
    migrated.newField = 'default'
  }
  
  return migrated
}
```

### 过期时间

```javascript
export function expiringPersistencePlugin({ store }) {
  const key = `store-${store.$id}`
  const TTL = 7 * 24 * 60 * 60 * 1000 // 7天
  
  // 恢复（检查过期）
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      const { state, timestamp } = JSON.parse(saved)
      const age = Date.now() - timestamp
      
      if (age < TTL) {
        store.$patch(state)
      } else {
        console.log('缓存已过期，清除')
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.error('恢复失败:', error)
    }
  }
  
  // 保存（带时间戳）
  store.$subscribe((mutation, state) => {
    localStorage.setItem(key, JSON.stringify({
      state,
      timestamp: Date.now()
    }))
  })
}
```

## 加密与安全考虑

### 敏感数据加密

```javascript
import CryptoJS from 'crypto-js'

export function encryptedPersistencePlugin({ store }) {
  const key = `store-${store.$id}`
  const SECRET_KEY = import.meta.env.VITE_ENCRYPT_KEY
  
  // 解密恢复
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      const decrypted = CryptoJS.AES.decrypt(saved, SECRET_KEY).toString(CryptoJS.enc.Utf8)
      const data = JSON.parse(decrypted)
      store.$patch(data)
    } catch (error) {
      console.error('解密失败:', error)
    }
  }
  
  // 加密保存
  store.$subscribe((mutation, state) => {
    const json = JSON.stringify(state)
    const encrypted = CryptoJS.AES.encrypt(json, SECRET_KEY).toString()
    localStorage.setItem(key, encrypted)
  })
}
```

### 敏感字段过滤

```javascript
export function filteredPersistencePlugin({ store }) {
  const key = `store-${store.$id}`
  
  // 敏感字段列表
  const sensitiveFields = ['password', 'creditCard', 'ssn']
  
  // 恢复
  const saved = localStorage.getItem(key)
  if (saved) {
    store.$patch(JSON.parse(saved))
  }
  
  // 保存（过滤敏感字段）
  store.$subscribe((mutation, state) => {
    const filtered = Object.keys(state).reduce((acc, key) => {
      if (!sensitiveFields.includes(key)) {
        acc[key] = state[key]
      }
      return acc
    }, {})
    
    localStorage.setItem(key, JSON.stringify(filtered))
  })
}
```

### 安全最佳实践

1. **不要存储敏感信息**：密码、信用卡号、身份证号
2. **使用 sessionStorage**：对于临时敏感数据
3. **加密存储**：对必须存储的敏感数据加密
4. **设置过期时间**：定期清理过期数据
5. **验证数据完整性**：使用签名或哈希验证

```javascript
// 示例：安全的 token 存储
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    refreshToken: null,
    user: null
  }),
  
  persist: {
    // token 使用 sessionStorage（关闭浏览器即清除）
    storage: sessionStorage,
    // 只持久化 token 和 user，不持久化 refreshToken
    paths: ['token', 'user'],
    // 添加加密
    serializer: {
      serialize: (state) => {
        const encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(state),
          SECRET_KEY
        )
        return encrypted.toString()
      },
      deserialize: (value) => {
        const decrypted = CryptoJS.AES.decrypt(value, SECRET_KEY)
        return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
      }
    }
  }
})
```

## 关键点总结

1. **插件实现**：使用 Pinia 插件自动化持久化
2. **pinia-plugin-persistedstate**：官方推荐的持久化插件
3. **选择性持久化**：只保存需要的字段
4. **安全考虑**：加密敏感数据，设置过期时间
5. **版本管理**：处理数据结构变更

## 深入一点

### IndexedDB 持久化

对于大量数据，使用 IndexedDB：

```javascript
// utils/indexedDB.js
class IndexedDBStorage {
  constructor(dbName = 'pinia-store', storeName = 'state') {
    this.dbName = dbName
    this.storeName = storeName
    this.db = null
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })
  }
  
  async getItem(key) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  
  async setItem(key, value) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(value, key)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// 使用
const indexedDBStorage = new IndexedDBStorage()

pinia.use(createCustomPersistence({
  storage: indexedDBStorage
}))
```

### 跨标签页同步

```javascript
export function crossTabSyncPlugin({ store }) {
  const key = `store-${store.$id}`
  
  // 监听其他标签页的更改
  window.addEventListener('storage', (event) => {
    if (event.key === key && event.newValue) {
      const newState = JSON.parse(event.newValue)
      store.$patch(newState)
    }
  })
  
  // 保存并通知其他标签页
  store.$subscribe((mutation, state) => {
    localStorage.setItem(key, JSON.stringify(state))
  })
}
```

### 压缩存储

```javascript
import pako from 'pako'

export function compressedPersistencePlugin({ store }) {
  const key = `store-${store.$id}`
  
  // 解压恢复
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      const compressed = Uint8Array.from(atob(saved), c => c.charCodeAt(0))
      const decompressed = pako.inflate(compressed, { to: 'string' })
      store.$patch(JSON.parse(decompressed))
    } catch (error) {
      console.error('解压失败:', error)
    }
  }
  
  // 压缩保存
  store.$subscribe((mutation, state) => {
    const json = JSON.stringify(state)
    const compressed = pako.deflate(json)
    const base64 = btoa(String.fromCharCode.apply(null, compressed))
    localStorage.setItem(key, base64)
  })
}
```

## 参考资料

- [pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [CryptoJS](https://cryptojs.gitbook.io/docs/)
