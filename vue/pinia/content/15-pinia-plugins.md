# 第 15 节：插件系统

## 概述

Pinia 提供了强大的插件系统，允许开发者扩展 Store 的功能。插件可以添加全局属性、监听状态变化、实现持久化等功能。本节将详细介绍如何编写和使用 Pinia 插件。

## 一、插件基础

### 1.1 插件结构

```javascript
// 基本插件结构
function myPlugin(context) {
  // context 包含以下属性：
  // - pinia: Pinia 实例
  // - app: Vue 应用实例
  // - store: 当前 Store 实例
  // - options: defineStore 的选项
  
  console.log('插件被调用:', context.store.$id)
  
  // 可以在这里扩展 store
  context.store.customProperty = 'Hello from plugin'
  
  // 返回对象会被合并到 store 中
  return {
    pluginMethod() {
      console.log('这是插件添加的方法')
    }
  }
}

// 注册插件
import { createPinia } from 'pinia'

const pinia = createPinia()
pinia.use(myPlugin)

// 在 Vue 应用中使用
app.use(pinia)
```

### 1.2 插件执行时机

```javascript
// 插件会在每个 Store 创建时执行
function debugPlugin({ store, app, pinia, options }) {
  console.log(`Store "${store.$id}" 正在创建`)
  console.log('Store 选项:', options)
  
  // 在 store 创建后立即执行
  store.$subscribe((mutation, state) => {
    console.log(`[${store.$id}] 状态变更:`, mutation)
  })
  
  // 监听 action 执行
  store.$onAction(({ name, args, after, onError }) => {
    console.log(`[${store.$id}] Action "${name}" 开始执行, 参数:`, args)
    
    after((result) => {
      console.log(`[${store.$id}] Action "${name}" 执行完成, 结果:`, result)
    })
    
    onError((error) => {
      console.error(`[${store.$id}] Action "${name}" 执行失败:`, error)
    })
  })
}

pinia.use(debugPlugin)
```

## 二、常用插件开发

### 2.1 持久化插件

```javascript
// 简单的持久化插件
function createPersistPlugin(options = {}) {
  return function persistPlugin({ store, options: storeOptions }) {
    // 检查是否启用持久化
    const persistOptions = storeOptions.persist
    if (!persistOptions) return
    
    const {
      key = store.$id,
      storage = localStorage,
      paths,
      serializer = JSON
    } = typeof persistOptions === 'object' ? persistOptions : {}
    
    // 恢复状态
    function restore() {
      try {
        const stored = storage.getItem(key)
        if (stored) {
          const state = serializer.parse(stored)
          
          if (paths) {
            // 部分恢复
            paths.forEach(path => {
              if (path in state) {
                setNestedValue(store.$state, path, state[path])
              }
            })
          } else {
            // 完全恢复
            store.$patch(state)
          }
        }
      } catch (error) {
        console.error('恢复状态失败:', error)
      }
    }
    
    // 保存状态
    function persist() {
      try {
        let stateToSave = store.$state
        
        if (paths) {
          // 只保存指定路径
          stateToSave = {}
          paths.forEach(path => {
            stateToSave[path] = getNestedValue(store.$state, path)
          })
        }
        
        storage.setItem(key, serializer.stringify(stateToSave))
      } catch (error) {
        console.error('保存状态失败:', error)
      }
    }
    
    // 初始化时恢复状态
    restore()
    
    // 监听状态变化并持久化
    store.$subscribe((mutation, state) => {
      persist()
    })
  }
}

// 辅助函数
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {}
    return current[key]
  }, obj)
  target[lastKey] = value
}

// 使用持久化插件
pinia.use(createPersistPlugin())

// 在 Store 中启用持久化
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    settings: {}
  }),
  
  // 启用持久化
  persist: {
    key: 'user-store',
    storage: sessionStorage,
    paths: ['name'] // 只持久化 name 字段
  }
})
```

### 2.2 API 插件

```javascript
// 为所有 Store 添加 API 调用能力
function createApiPlugin(apiClient) {
  return function apiPlugin({ store }) {
    // 添加 API 实例到 store
    store.$api = apiClient
    
    // 添加通用 API 方法
    store.$fetch = async function(endpoint, options = {}) {
      const loadingKey = `loading_${endpoint.replace(/\W/g, '_')}`
      const errorKey = `error_${endpoint.replace(/\W/g, '_')}`
      
      // 设置加载状态
      if (!this[loadingKey]) {
        this.$patch({ [loadingKey]: false })
      }
      if (!this[errorKey]) {
        this.$patch({ [errorKey]: null })
      }
      
      this[loadingKey] = true
      this[errorKey] = null
      
      try {
        const response = await apiClient.request({
          url: endpoint,
          ...options
        })
        
        return response.data
      } catch (error) {
        this[errorKey] = error.message
        throw error
      } finally {
        this[loadingKey] = false
      }
    }
    
    // 添加资源管理方法
    store.$resource = function(resourceName) {
      return {
        list: (params) => this.$fetch(`/${resourceName}`, { params }),
        get: (id) => this.$fetch(`/${resourceName}/${id}`),
        create: (data) => this.$fetch(`/${resourceName}`, { method: 'POST', data }),
        update: (id, data) => this.$fetch(`/${resourceName}/${id}`, { method: 'PUT', data }),
        delete: (id) => this.$fetch(`/${resourceName}/${id}`, { method: 'DELETE' })
      }
    }
  }
}

// 使用 API 插件
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000
})

pinia.use(createApiPlugin(apiClient))

// 在 Store 中使用
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading_products: false,
    error_products: null
  }),
  
  actions: {
    async fetchProducts() {
      // 使用插件提供的方法
      const products = await this.$fetch('/products')
      this.products = products
      return products
    },
    
    async createProduct(productData) {
      // 使用资源管理器
      const resource = this.$resource('products')
      const newProduct = await resource.create(productData)
      this.products.push(newProduct)
      return newProduct
    }
  }
})
```

### 2.3 验证插件

```javascript
// 状态验证插件
function createValidationPlugin(schemas = {}) {
  return function validationPlugin({ store, options }) {
    const schema = schemas[store.$id]
    if (!schema) return
    
    // 添加验证方法
    store.$validate = function(state = this.$state) {
      const errors = {}
      
      Object.keys(schema).forEach(key => {
        const rules = schema[key]
        const value = state[key]
        
        rules.forEach(rule => {
          const error = validateField(value, rule)
          if (error) {
            if (!errors[key]) errors[key] = []
            errors[key].push(error)
          }
        })
      })
      
      return {
        valid: Object.keys(errors).length === 0,
        errors
      }
    }
    
    // 在状态变化时自动验证
    store.$subscribe((mutation, state) => {
      if (options.autoValidate !== false) {
        const validation = store.$validate(state)
        store.$validationErrors = validation.errors
        store.$isValid = validation.valid
      }
    })
    
    // 初始验证
    const initialValidation = store.$validate()
    store.$validationErrors = initialValidation.errors
    store.$isValid = initialValidation.valid
  }
}

// 验证规则
function validateField(value, rule) {
  switch (rule.type) {
    case 'required':
      if (value === null || value === undefined || value === '') {
        return rule.message || '此字段为必填项'
      }
      break
      
    case 'minLength':
      if (typeof value === 'string' && value.length < rule.value) {
        return rule.message || `最少需要 ${rule.value} 个字符`
      }
      break
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return rule.message || '请输入有效的邮箱地址'
      }
      break
      
    case 'custom':
      const customError = rule.validator(value)
      if (customError) {
        return rule.message || customError
      }
      break
  }
  
  return null
}

// 定义验证规则
const validationSchemas = {
  user: {
    name: [
      { type: 'required' },
      { type: 'minLength', value: 2, message: '姓名至少2个字符' }
    ],
    email: [
      { type: 'required' },
      { type: 'email' }
    ],
    age: [
      { 
        type: 'custom', 
        validator: (value) => value < 18 ? '年龄必须大于18岁' : null 
      }
    ]
  }
}

pinia.use(createValidationPlugin(validationSchemas))

// 在 Store 中使用验证
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    email: '',
    age: 0
  }),
  
  actions: {
    updateUser(userData) {
      // 更新前验证
      const tempState = { ...this.$state, ...userData }
      const validation = this.$validate(tempState)
      
      if (!validation.valid) {
        throw new Error('验证失败: ' + JSON.stringify(validation.errors))
      }
      
      this.$patch(userData)
    }
  }
}, {
  autoValidate: true // 启用自动验证
})
```

## 三、第三方插件

### 3.1 Pinia Plugin Persistedstate

```javascript
// 安装和配置 pinia-plugin-persistedstate
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 使用方式 1：自动持久化所有状态
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    language: 'zh-CN'
  }),
  
  persist: true // 简单启用
})

// 使用方式 2：自定义持久化配置
export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    preferences: {},
    temporaryData: {}
  }),
  
  persist: {
    key: 'user-storage',
    storage: sessionStorage,
    paths: ['profile', 'preferences'], // 只持久化指定字段
    
    // 自定义序列化
    serializer: {
      deserialize: JSON.parse,
      serialize: JSON.stringify
    },
    
    // 数据迁移
    migrate: (persistedState, version) => {
      if (version < 2) {
        // 从版本 1 升级到版本 2
        persistedState.newField = 'default value'
      }
      return persistedState
    },
    
    debug: true // 开发环境调试
  }
})

// 使用方式 3：多存储配置
export const useComplexStore = defineStore('complex', {
  state: () => ({
    userSettings: {},
    appState: {},
    cache: {}
  }),
  
  persist: [
    {
      key: 'user-settings',
      storage: localStorage,
      paths: ['userSettings']
    },
    {
      key: 'app-state',
      storage: sessionStorage,
      paths: ['appState']
    }
    // cache 不持久化
  ]
})
```

### 3.2 开发工具插件

```javascript
// 增强开发工具的插件
function createDevToolsPlugin() {
  return function devToolsPlugin({ store, app }) {
    if (process.env.NODE_ENV !== 'development') return
    
    // 添加调试信息
    store.$debug = {
      // 状态快照
      takeSnapshot() {
        return JSON.parse(JSON.stringify(store.$state))
      },
      
      // 状态历史
      history: [],
      maxHistory: 50,
      
      // 性能监控
      performance: {
        actionTimes: new Map(),
        getterAccess: new Map()
      }
    }
    
    // 记录状态变化历史
    store.$subscribe((mutation, state) => {
      const snapshot = {
        timestamp: Date.now(),
        mutation,
        state: JSON.parse(JSON.stringify(state))
      }
      
      store.$debug.history.push(snapshot)
      
      if (store.$debug.history.length > store.$debug.maxHistory) {
        store.$debug.history.shift()
      }
    })
    
    // 监控 action 性能
    store.$onAction(({ name, args, after, onError }) => {
      const startTime = performance.now()
      
      after(() => {
        const duration = performance.now() - startTime
        const times = store.$debug.performance.actionTimes.get(name) || []
        times.push(duration)
        store.$debug.performance.actionTimes.set(name, times)
        
        if (duration > 100) {
          console.warn(`[${store.$id}] Action "${name}" took ${duration.toFixed(2)}ms`)
        }
      })
      
      onError((error) => {
        console.error(`[${store.$id}] Action "${name}" failed:`, error)
      })
    })
    
    // 添加调试方法
    store.$debugMethods = {
      // 重播状态变化
      replay(index) {
        if (index < store.$debug.history.length) {
          const snapshot = store.$debug.history[index]
          store.$patch(snapshot.state)
        }
      },
      
      // 获取性能统计
      getPerformanceStats() {
        const stats = {}
        store.$debug.performance.actionTimes.forEach((times, actionName) => {
          stats[actionName] = {
            count: times.length,
            avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
            maxTime: Math.max(...times),
            minTime: Math.min(...times)
          }
        })
        return stats
      },
      
      // 导出状态历史
      exportHistory() {
        return JSON.stringify(store.$debug.history, null, 2)
      }
    }
    
    // 全局暴露调试接口
    if (typeof window !== 'undefined') {
      if (!window.__PINIA_STORES__) {
        window.__PINIA_STORES__ = {}
      }
      window.__PINIA_STORES__[store.$id] = store
    }
  }
}

pinia.use(createDevToolsPlugin())
```

### 3.3 国际化插件

```javascript
// 国际化插件
function createI18nPlugin(i18n) {
  return function i18nPlugin({ store }) {
    // 添加翻译方法到 store
    store.$t = (key, params) => {
      return i18n.global.t(key, params)
    }
    
    // 添加多语言支持的响应式 getter
    store.$tReactive = (key, params) => {
      return computed(() => i18n.global.t(key, params))
    }
    
    // 监听语言变化
    watch(
      () => i18n.global.locale.value,
      (newLocale) => {
        // 可以在这里触发 store 的多语言更新逻辑
        if (store.onLanguageChange) {
          store.onLanguageChange(newLocale)
        }
      }
    )
  }
}

// 使用国际化插件
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      user: {
        name: '姓名',
        email: '邮箱'
      }
    },
    'en-US': {
      user: {
        name: 'Name',
        email: 'Email'
      }
    }
  }
})

pinia.use(createI18nPlugin(i18n))

// 在 Store 中使用
export const useFormStore = defineStore('form', {
  state: () => ({
    errors: {}
  }),
  
  getters: {
    // 多语言错误信息
    localizedErrors() {
      const localized = {}
      Object.keys(this.errors).forEach(field => {
        localized[field] = this.$t(`errors.${this.errors[field]}`)
      })
      return localized
    }
  },
  
  actions: {
    // 语言变化时的处理
    onLanguageChange(newLocale) {
      // 重新验证表单以获取新语言的错误信息
      this.validateForm()
    }
  }
})
```

## 四、插件测试

### 4.1 插件单元测试

```javascript
// 测试插件功能
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, defineStore } from 'pinia'
import { createApp } from 'vue'

function createTestPlugin() {
  return function testPlugin({ store }) {
    store.pluginMethod = () => 'plugin method called'
    store.pluginProperty = 'plugin property'
  }
}

describe('Test Plugin', () => {
  let app, pinia
  
  beforeEach(() => {
    app = createApp({})
    pinia = createPinia()
    pinia.use(createTestPlugin())
    app.use(pinia)
  })
  
  it('should add plugin methods to store', () => {
    const useTestStore = defineStore('test', {
      state: () => ({ value: 0 })
    })
    
    const store = useTestStore(pinia)
    
    expect(store.pluginMethod).toBeDefined()
    expect(store.pluginMethod()).toBe('plugin method called')
    expect(store.pluginProperty).toBe('plugin property')
  })
})

// 测试持久化插件
describe('Persist Plugin', () => {
  let mockStorage
  
  beforeEach(() => {
    mockStorage = {
      data: {},
      getItem: vi.fn((key) => mockStorage.data[key] || null),
      setItem: vi.fn((key, value) => { mockStorage.data[key] = value }),
      removeItem: vi.fn((key) => { delete mockStorage.data[key] })
    }
    
    global.localStorage = mockStorage
  })
  
  it('should persist and restore state', async () => {
    const pinia = createPinia()
    pinia.use(createPersistPlugin())
    
    const useTestStore = defineStore('persist-test', {
      state: () => ({ count: 0 }),
      persist: true
    })
    
    // 创建 store 并修改状态
    const store = useTestStore(pinia)
    store.count = 5
    
    // 验证状态已保存
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'persist-test',
      '{"count":5}'
    )
    
    // 模拟应用重启，创建新的 store 实例
    const newPinia = createPinia()
    newPinia.use(createPersistPlugin())
    
    const newStore = useTestStore(newPinia)
    
    // 验证状态已恢复
    expect(newStore.count).toBe(5)
  })
})
```

### 4.2 插件集成测试

```javascript
// 完整的插件集成测试
describe('Plugin Integration', () => {
  let app, pinia
  
  beforeEach(() => {
    app = createApp({})
    pinia = createPinia()
    
    // 注册多个插件
    pinia.use(createPersistPlugin())
    pinia.use(createValidationPlugin({
      testStore: {
        name: [{ type: 'required' }]
      }
    }))
    pinia.use(createApiPlugin({
      request: vi.fn().mockResolvedValue({ data: { id: 1 } })
    }))
    
    app.use(pinia)
  })
  
  it('should work with multiple plugins', async () => {
    const useTestStore = defineStore('testStore', {
      state: () => ({
        name: '',
        data: null
      }),
      
      actions: {
        async loadData() {
          this.data = await this.$fetch('/api/data')
        }
      }
    }, {
      persist: true
    })
    
    const store = useTestStore(pinia)
    
    // 测试验证插件
    expect(store.$validate).toBeDefined()
    const validation = store.$validate()
    expect(validation.valid).toBe(false) // name 是必填的
    
    // 测试 API 插件
    expect(store.$fetch).toBeDefined()
    await store.loadData()
    expect(store.data).toEqual({ id: 1 })
    
    // 测试持久化插件（通过检查是否调用了存储方法）
    store.name = 'test'
    expect(localStorage.setItem).toHaveBeenCalled()
  })
})
```

## 五、最佳实践

### 5.1 插件开发原则

```javascript
// 好的插件设计原则
const pluginBestPractices = {
  // 1. 命名空间 - 避免冲突
  namespaced: function namespacePlugin({ store }) {
    // 使用前缀避免命名冲突
    store.$myPlugin = {
      method1() {},
      method2() {},
      data: {}
    }
  },
  
  // 2. 可配置性 - 允许用户自定义
  configurable: function createConfigurablePlugin(options = {}) {
    const defaults = {
      enable: true,
      debug: false,
      prefix: '$plugin'
    }
    
    const config = { ...defaults, ...options }
    
    return function configurablePlugin({ store }) {
      if (!config.enable) return
      
      store[`${config.prefix}Method`] = () => {
        if (config.debug) console.log('Plugin method called')
      }
    }
  },
  
  // 3. 错误处理 - 优雅降级
  errorHandling: function safePlugin({ store }) {
    try {
      // 插件逻辑
      store.$safeMethod = () => {}
    } catch (error) {
      console.warn('Plugin failed to initialize:', error)
      // 提供默认实现或跳过
      store.$safeMethod = () => console.warn('Plugin method not available')
    }
  },
  
  // 4. 性能考虑 - 避免影响应用性能
  performant: function performantPlugin({ store }) {
    // 使用 WeakMap 避免内存泄漏
    const privateData = new WeakMap()
    
    store.$setPrivateData = (data) => {
      privateData.set(store, data)
    }
    
    store.$getPrivateData = () => {
      return privateData.get(store)
    }
  }
}
```

### 5.2 插件组合和依赖

```javascript
// 插件依赖管理
function createPluginManager() {
  const registeredPlugins = new Map()
  const dependencies = new Map()
  
  return {
    register(name, plugin, deps = []) {
      registeredPlugins.set(name, plugin)
      dependencies.set(name, deps)
    },
    
    install(pinia) {
      // 拓扑排序确保依赖顺序
      const sorted = topologicalSort(dependencies)
      
      sorted.forEach(pluginName => {
        const plugin = registeredPlugins.get(pluginName)
        if (plugin) {
          pinia.use(plugin)
        }
      })
    }
  }
}

// 使用插件管理器
const pluginManager = createPluginManager()

pluginManager.register('persist', createPersistPlugin())
pluginManager.register('api', createApiPlugin(apiClient))
pluginManager.register('validation', createValidationPlugin(schemas), ['api'])

// 按正确顺序安装所有插件
pluginManager.install(pinia)
```

## 参考资料

- [Pinia Plugins](https://pinia.vuejs.org/core-concepts/plugins.html)
- [Pinia Plugin Persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate)
- [Plugin Development Best Practices](https://pinia.vuejs.org/cookbook/plugins.html)

**下一节** → [第 16 节：订阅机制](./16-pinia-subscriptions.md)
