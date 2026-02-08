# 第 24 节：核心原理

## 概述

深入了解 Pinia 的内部实现原理，有助于更好地理解和使用 Pinia，也能在遇到问题时快速定位和解决。本节将解析 Pinia 的核心机制、响应式系统、插件架构等。

## 一、Pinia 架构概览

### 1.1 核心组件

```javascript
// Pinia 核心架构
const piniaArchitecture = {
  // 1. Pinia 实例
  pinia: {
    install: '安装到 Vue 应用',
    _s: 'Store 注册表 Map',
    _e: '作用域 EffectScope',
    state: '全局状态响应式对象',
    _p: '插件列表',
    use: '注册插件方法'
  },
  
  // 2. Store 实例
  store: {
    $id: 'Store 唯一标识',
    $state: '状态对象',
    $patch: '状态更新方法',
    $reset: '重置方法',
    $subscribe: '订阅状态变化',
    $onAction: '订阅 Action 执行',
    $dispose: '销毁方法'
  },
  
  // 3. 响应式系统
  reactivity: {
    ref: '基本响应式',
    reactive: '对象响应式',
    computed: '计算属性',
    watch: '监听器',
    effectScope: '作用域管理'
  }
}
```

### 1.2 创建过程

```javascript
// createPinia 函数简化实现
function createPinia() {
  const scope = effectScope(true) // 创建独立作用域
  
  // 在作用域内创建状态
  const state = scope.run(() => ref({}))
  
  const pinia = markRaw({
    install(app) {
      // 设置全局属性
      setActivePinia(pinia)
      pinia._a = app
      
      // 注册全局属性
      app.provide(piniaSymbol, pinia)
      app.config.globalProperties.$pinia = pinia
      
      // 开发工具支持
      if (__DEV__) {
        registerPiniaDevtools(app, pinia)
      }
    },
    
    use(plugin) {
      if (!this._a && !isVue2) {
        // 延迟执行插件
        this._p.push(plugin)
      } else {
        // 立即执行插件
        this._p.push(plugin)
        this._s.forEach(store => plugin({ store, app: this._a, pinia: this, options: store.$options }))
      }
      return this
    },
    
    _p: [], // 插件列表
    _a: null, // Vue 应用实例
    _e: scope, // EffectScope
    _s: new Map(), // Store 注册表
    state, // 全局状态
  })
  
  return pinia
}
```

## 二、Store 创建机制

### 2.1 defineStore 实现原理

```javascript
// defineStore 简化实现
function defineStore(idOrOptions, setup, setupOptions) {
  let id, options
  
  // 处理参数重载
  if (typeof idOrOptions === 'string') {
    id = idOrOptions
    options = typeof setup === 'function' ? setupOptions || {} : setup
  } else {
    options = idOrOptions
    id = idOrOptions.id
  }
  
  // 返回 use 函数
  function useStore(pinia, hot) {
    // 获取当前组件实例
    const hasContext = hasInjectionContext()
    pinia = (pinia || (hasContext ? inject(piniaSymbol, null) : null))
    
    if (pinia) setActivePinia(pinia)
    
    pinia = activePinia
    
    // Store 是否已存在
    if (!pinia._s.has(id)) {
      // 创建 Store
      if (typeof setup === 'function') {
        createSetupStore(id, setup, options, pinia, hot, true)
      } else {
        createOptionsStore(id, options, pinia, hot)
      }
    }
    
    const store = pinia._s.get(id)
    
    // HMR 支持
    if (__DEV__ && hot) {
      handleHMRUpdate(store, hot)
    }
    
    return store
  }
  
  useStore.$id = id
  
  return useStore
}
```

### 2.2 Setup Store 创建

```javascript
// createSetupStore 简化实现
function createSetupStore(id, setup, options = {}, pinia, hot, isOptionsStore) {
  let scope
  
  const optionsForPlugin = {
    id,
    options: __DEV__ ? { ...options } : options,
    pinia
  }
  
  // 创建响应式作用域
  scope = effectScope()
  
  const setupStore = scope.run(() => {
    // 执行 setup 函数
    return setup()
  })
  
  // 处理返回值
  for (const key in setupStore) {
    const prop = setupStore[key]
    
    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      // 状态属性
      if (!isOptionsStore) {
        // Setup Store 直接使用
        pinia.state.value[id] = pinia.state.value[id] || {}
        pinia.state.value[id][key] = prop
      }
    } else if (typeof prop === 'function') {
      // Action 方法
      const actionValue = __DEV__ ? wrapAction(key, prop) : prop
      setupStore[key] = actionValue
    }
  }
  
  // 创建 Store 实例
  const store = reactive({
    $id: id,
    $onAction: partial(addSubscription, actionSubscriptions),
    $patch: patchFunction,
    $reset: isOptionsStore ? optionsStoreReset : setupStoreReset,
    $subscribe: partial(addSubscription, stateSubscriptions),
    $dispose: disposeStore,
    ...setupStore
  })
  
  // 添加到 Pinia
  pinia._s.set(id, store)
  
  // 执行插件
  pinia._p.forEach(extender => {
    Object.assign(store, scope.run(() => 
      extender({
        store,
        app: pinia._a,
        pinia,
        options: optionsForPlugin
      })
    ))
  })
  
  return store
}
```

### 2.3 Action 包装

```javascript
// wrapAction 实现
function wrapAction(name, action) {
  return function() {
    setActivePinia(pinia)
    
    const args = Array.from(arguments)
    const afterCallbackList = []
    const onErrorCallbackList = []
    
    function after(callback) {
      afterCallbackList.push(callback)
    }
    
    function onError(callback) {
      onErrorCallbackList.push(callback)
    }
    
    // 触发 $onAction 订阅
    triggerSubscriptions(this.$onActionSubscriptions, {
      args,
      name,
      store: this,
      after,
      onError
    })
    
    let ret
    try {
      // 执行原始 action
      ret = action.apply(this && this.$id === id ? this : store, args)
    } catch (error) {
      // 触发错误回调
      triggerSubscriptions(onErrorCallbackList, error)
      throw error
    }
    
    // 处理 Promise
    if (ret instanceof Promise) {
      return ret
        .then(value => {
          triggerSubscriptions(afterCallbackList, value)
          return value
        })
        .catch(error => {
          triggerSubscriptions(onErrorCallbackList, error)
          return Promise.reject(error)
        })
    }
    
    // 同步执行后续回调
    triggerSubscriptions(afterCallbackList, ret)
    return ret
  }
}
```

## 三、响应式系统深入

### 3.1 状态响应式

```javascript
// 状态响应式实现原理
const createReactiveState = (initialState) => {
  // 使用 Vue 的响应式系统
  const state = reactive(initialState)
  
  // 状态代理，支持 devtools
  return new Proxy(state, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)
      
      // DevTools 追踪
      if (__DEV__) {
        trackStateAccess(key, result)
      }
      
      return result
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      
      // 触发变更通知
      if (result && oldValue !== value) {
        triggerStateChange(key, value, oldValue)
      }
      
      return result
    }
  })
}
```

### 3.2 $patch 实现

```javascript
// $patch 方法实现
function $patch(partialStateOrMutator) {
  let subscriptionMutation = {
    type: 'patch object',
    storeId: this.$id,
    payload: partialStateOrMutator
  }
  
  const isFunction = typeof partialStateOrMutator === 'function'
  
  if (isFunction) {
    // 函数形式的 patch
    subscriptionMutation.type = 'patch function'
    partialStateOrMutator(this.$state)
  } else {
    // 对象形式的 patch
    mergeReactiveObjects(this.$state, partialStateOrMutator)
  }
  
  // 触发订阅
  this.$subscribe && this.$subscribe.forEach(callback => {
    callback(subscriptionMutation, this.$state)
  })
}

// 合并响应式对象
function mergeReactiveObjects(target, patchToApply) {
  for (const key in patchToApply) {
    if (!patchToApply.hasOwnProperty(key)) continue
    
    const subPatch = patchToApply[key]
    const targetValue = target[key]
    
    if (isPlainObject(targetValue) && isPlainObject(subPatch) && 
        target.hasOwnProperty(key) && !isRef(subPatch) && !isReactive(subPatch)) {
      // 递归合并嵌套对象
      target[key] = mergeReactiveObjects(targetValue, subPatch)
    } else {
      // 直接赋值
      target[key] = subPatch
    }
  }
  
  return target
}
```

## 四、订阅系统

### 4.1 状态订阅实现

```javascript
// 状态订阅系统
function createSubscription() {
  const subscriptions = []
  
  function $subscribe(callback, options = {}) {
    const { detached, flush = 'sync' } = options
    
    const removeSubscription = addSubscription(
      subscriptions,
      callback,
      detached,
      () => stopWatcher?.()
    )
    
    // 创建 watcher 监听状态变化
    const stopWatcher = watchEffect(() => {
      // 这里的实现会根据状态变化触发回调
      callback(mutationObject, this.$state)
    }, {
      flush
    })
    
    return removeSubscription
  }
  
  return {
    $subscribe,
    subscriptions
  }
}

// 添加订阅
function addSubscription(subscriptions, callback, detached, onCleanup) {
  subscriptions.push(callback)
  
  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback)
    if (idx > -1) {
      subscriptions.splice(idx, 1)
      onCleanup?.()
    }
  }
  
  // 组件卸载时自动清理
  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription)
  }
  
  return removeSubscription
}
```

### 4.2 Action 订阅实现

```javascript
// Action 订阅系统
function createActionSubscription() {
  const actionSubscriptions = []
  
  function $onAction(callback, detached = false) {
    return addSubscription(
      actionSubscriptions,
      callback,
      detached
    )
  }
  
  // 触发 Action 订阅
  function triggerActionSubscriptions(context) {
    actionSubscriptions.forEach(callback => {
      try {
        callback(context)
      } catch (error) {
        console.error('Error in action subscription:', error)
      }
    })
  }
  
  return {
    $onAction,
    triggerActionSubscriptions
  }
}
```

## 五、插件系统深入

### 5.1 插件执行机制

```javascript
// 插件执行系统
function createPluginSystem(pinia) {
  const plugins = []
  
  // 注册插件
  function use(plugin) {
    plugins.push(plugin)
    
    // 对已存在的 Store 执行插件
    pinia._s.forEach(store => {
      executePlugin(plugin, store, pinia)
    })
    
    return pinia
  }
  
  // 执行插件
  function executePlugin(plugin, store, pinia) {
    const context = {
      app: pinia._a,
      pinia,
      store,
      options: store.$options || {}
    }
    
    try {
      // 执行插件并合并返回值
      const pluginResult = plugin(context)
      
      if (pluginResult && typeof pluginResult === 'object') {
        Object.assign(store, pluginResult)
      }
    } catch (error) {
      console.error(`Plugin error in store ${store.$id}:`, error)
    }
  }
  
  // Store 创建时执行所有插件
  function applyPluginsToStore(store) {
    plugins.forEach(plugin => {
      executePlugin(plugin, store, pinia)
    })
  }
  
  return {
    use,
    applyPluginsToStore
  }
}
```

### 5.2 上下文扩展

```javascript
// 插件上下文扩展
function extendStoreContext(store, extensions) {
  // 扩展 Store 原型
  const storePrototype = Object.getPrototypeOf(store)
  
  Object.keys(extensions).forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(extensions, key)
    
    if (descriptor) {
      // 保持属性描述符
      Object.defineProperty(store, key, descriptor)
    } else {
      // 简单属性
      store[key] = extensions[key]
    }
  })
  
  // 支持响应式扩展
  if (extensions.__reactiveExtensions) {
    const reactiveExt = reactive(extensions.__reactiveExtensions)
    Object.assign(store, reactiveExt)
  }
}
```

## 六、DevTools 集成

### 6.1 DevTools 通信

```javascript
// DevTools 集成实现
function setupDevtools(app, pinia) {
  if (!__DEV__ || !window.__VUE_DEVTOOLS_GLOBAL_HOOK__) return
  
  const devtools = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
  
  // 注册 Pinia
  devtools.emit('app:init', app, app.version, {
    id: 'pinia',
    label: 'Pinia',
    logo: 'https://pinia.vuejs.org/logo.svg',
    packageName: 'pinia',
    homepage: 'https://pinia.vuejs.org',
    componentStateTypes: ['🍍 Pinia']
  })
  
  // 监听 Store 变化
  pinia._s.forEach(store => {
    registerStoreWithDevtools(store, devtools)
  })
  
  // 新 Store 自动注册
  const originalSet = pinia._s.set
  pinia._s.set = function(id, store) {
    originalSet.call(this, id, store)
    registerStoreWithDevtools(store, devtools)
  }
}

function registerStoreWithDevtools(store, devtools) {
  // 状态变化追踪
  store.$subscribe((mutation, state) => {
    devtools.emit('mutation', {
      type: mutation.type,
      payload: mutation.payload,
      storeId: store.$id,
      state
    })
  })
  
  // Action 执行追踪
  store.$onAction(({ name, args, after, onError }) => {
    const actionId = Date.now()
    
    devtools.emit('action:start', {
      id: actionId,
      name,
      args,
      storeId: store.$id
    })
    
    after((result) => {
      devtools.emit('action:end', {
        id: actionId,
        result
      })
    })
    
    onError((error) => {
      devtools.emit('action:error', {
        id: actionId,
        error
      })
    })
  })
}
```

## 七、性能优化机制

### 7.1 计算属性缓存

```javascript
// 计算属性缓存优化
function createOptimizedComputed(getter, debuggerOptions) {
  // 使用 Vue 的计算属性缓存
  const computedRef = computed(getter, debuggerOptions)
  
  // 添加缓存统计
  let hitCount = 0
  let missCount = 0
  
  return new Proxy(computedRef, {
    get(target, key) {
      if (key === 'value') {
        // 检查是否命中缓存
        const isDirty = target.effect?.dirty
        
        if (isDirty) {
          missCount++
        } else {
          hitCount++
        }
        
        // 开发环境显示缓存统计
        if (__DEV__ && Math.random() < 0.01) {
          console.log(`Computed cache stats: ${hitCount} hits, ${missCount} misses`)
        }
      }
      
      return Reflect.get(target, key)
    }
  })
}
```

### 7.2 批量更新

```javascript
// 批量更新优化
function createBatchedUpdates() {
  let pendingUpdates = new Set()
  let flushScheduled = false
  
  function scheduleUpdate(fn) {
    pendingUpdates.add(fn)
    
    if (!flushScheduled) {
      flushScheduled = true
      nextTick(flushUpdates)
    }
  }
  
  function flushUpdates() {
    const updates = Array.from(pendingUpdates)
    pendingUpdates.clear()
    flushScheduled = false
    
    // 批量执行更新
    updates.forEach(update => {
      try {
        update()
      } catch (error) {
        console.error('Batch update error:', error)
      }
    })
  }
  
  return { scheduleUpdate }
}
```

## 八、内存管理

### 8.1 作用域管理

```javascript
// EffectScope 管理
function createScopeManager() {
  const scopes = new WeakMap()
  
  function createStoreScope(store) {
    const scope = effectScope()
    scopes.set(store, scope)
    
    return scope
  }
  
  function disposeStore(store) {
    const scope = scopes.get(store)
    
    if (scope) {
      scope.stop() // 停止所有副作用
      scopes.delete(store)
    }
    
    // 清理订阅
    store._subscriptions?.forEach(unsubscribe => unsubscribe())
    store._actionSubscriptions?.forEach(unsubscribe => unsubscribe())
    
    // 从 Pinia 中移除
    store._pinia?._s.delete(store.$id)
  }
  
  return {
    createStoreScope,
    disposeStore
  }
}
```

### 8.2 内存泄漏防护

```javascript
// 内存泄漏检测
function createMemoryLeakDetection() {
  const storeRefs = new WeakRef()
  const cleanupTasks = new Set()
  
  function trackStore(store) {
    const ref = new WeakRef(store)
    storeRefs.add(ref)
    
    // 定期清理无效引用
    const cleanup = () => {
      if (!ref.deref()) {
        storeRefs.delete(ref)
        cleanupTasks.delete(cleanup)
      }
    }
    
    cleanupTasks.add(cleanup)
  }
  
  // 定期检查
  setInterval(() => {
    cleanupTasks.forEach(cleanup => cleanup())
  }, 30000) // 30秒检查一次
  
  return { trackStore }
}
```

## 参考资料

- [Pinia 源码分析](https://github.com/vuejs/pinia)
- [Vue 3 响应式原理](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [Vue DevTools 架构](https://devtools.vuejs.org/guide/contributing.html)
- [JavaScript 内存管理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management)

---

**🎉 第二部分：Pinia 状态管理 完成！**
