# 第 26 节：History 实现原理

## 概述

Vue Router 的 History 模块是路由系统的核心底层实现，负责管理浏览器历史记录和URL状态。理解其实现原理有助于深入掌握现代前端路由的工作机制。

## 一、History 抽象接口

### 1.1 通用 History 接口

```javascript
// History 基础接口定义
interface RouterHistory {
  readonly location: HistoryLocation
  readonly state: HistoryState
  
  // 核心导航方法
  push(to: string, data?: HistoryState): void
  replace(to: string, data?: HistoryState): void
  go(delta: number): void
  
  // 事件监听
  listen(callback: NavigationCallback): () => void
  
  // 销毁方法
  destroy(): void
}

// 历史状态类型
interface HistoryState {
  [x: number]: HistoryStateValue
  [x: string]: HistoryStateValue
}

// 位置信息类型
interface HistoryLocation {
  fullPath: string
  path: string
  query?: LocationQuery
  hash?: string
}
```

### 1.2 实现策略模式

```javascript
// 策略工厂函数
export function createHistory(type, base) {
  switch (type) {
    case 'hash':
      return createWebHashHistory(base)
    case 'history':
      return createWebHistory(base)
    case 'memory':
      return createMemoryHistory()
    default:
      throw new Error(`Unknown history type: ${type}`)
  }
}
```

## 二、HTML5 History 实现

### 2.1 核心实现

```javascript
// createWebHistory 源码简化版本
export function createWebHistory(base) {
  const historyNavigation = useHistoryNavigation(base)
  const historyListeners = useHistoryListeners(
    base,
    historyNavigation.state,
    historyNavigation.location,
    historyNavigation.replace
  )
  
  function go(delta, triggerListeners = true) {
    if (!triggerListeners) historyListeners.pauseListeners()
    history.go(delta)
  }
  
  const routerHistory = Object.assign({
    // 位置信息
    location: historyNavigation.location.value,
    state: historyNavigation.state.value,
    
    // 核心方法
    push: historyNavigation.push,
    replace: historyNavigation.replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    
    // 事件管理
    listen: historyListeners.listen,
    createHref: createHref.bind(null, base),
    
    // 销毁方法
    destroy: historyListeners.destroy
  })
  
  return routerHistory
}
```

### 2.2 导航状态管理

```javascript
// useHistoryNavigation 实现
function useHistoryNavigation(base) {
  const { history, location } = window
  
  // 当前状态
  const currentLocation = ref(createCurrentLocation(base, location))
  const historyState = ref(createHistoryState())
  
  function createCurrentLocation(base, location) {
    const { pathname, search, hash } = location
    const fullPath = pathname + search + hash
    
    return {
      fullPath,
      path: stripBase(fullPath, base),
      query: parseQuery(search),
      hash
    }
  }
  
  function push(to, data) {
    // 1. 构建完整URL
    const targetLocation = resolveLocation(to, currentLocation.value)
    const url = createHref(targetLocation)
    
    // 2. 准备状态数据
    const historyStateValue = Object.assign(
      {},
      historyState.value,
      { forward: null, current: targetLocation.fullPath },
      data
    )
    
    try {
      // 3. 推送到浏览器历史
      history.pushState(historyStateValue, '', url)
      
      // 4. 更新内部状态
      currentLocation.value = targetLocation
      historyState.value = historyStateValue
      
    } catch (err) {
      // 5. 回退到 location.href
      location.assign(url)
    }
  }
  
  function replace(to, data) {
    const targetLocation = resolveLocation(to, currentLocation.value)
    const url = createHref(targetLocation)
    
    const historyStateValue = Object.assign(
      {},
      historyState.value,
      { current: targetLocation.fullPath },
      data
    )
    
    try {
      history.replaceState(historyStateValue, '', url)
      currentLocation.value = targetLocation
      historyState.value = historyStateValue
    } catch (err) {
      location.replace(url)
    }
  }
  
  return {
    location: currentLocation,
    state: historyState,
    push,
    replace
  }
}
```

### 2.3 事件监听机制

```javascript
// useHistoryListeners 实现
function useHistoryListeners(base, historyState, location, replace) {
  let listeners = []
  let teardowns = []
  let pauseState = null
  
  const popStateHandler = ({ state }) => {
    const to = createCurrentLocation(base, window.location)
    const from = location.value
    const fromState = historyState.value
    
    // 更新内部状态
    location.value = to
    historyState.value = state
    
    // 如果监听被暂停，缓存状态变化
    if (pauseState && pauseState.current === to.fullPath) {
      pauseState.position = getScrollPosition()
      return
    }
    
    // 触发监听器
    listeners.forEach(listener => {
      listener(to, from, {
        delta: getHistoryStatePosition(state) - getHistoryStatePosition(fromState),
        type: NavigationType.pop,
        direction: HistoryDirection.unknown
      })
    })
  }
  
  function pauseListeners() {
    pauseState = {
      current: location.value.fullPath,
      position: getScrollPosition()
    }
  }
  
  function listen(callback) {
    // 添加监听器
    listeners.push(callback)
    
    // 第一次添加时绑定事件
    if (teardowns.length === 0) {
      window.addEventListener('popstate', popStateHandler)
      window.addEventListener('beforeunload', beforeUnloadHandler)
    }
    
    teardowns.push(() => removeFromArray(listeners, callback))
    
    return () => {
      const index = teardowns.indexOf(callback)
      if (index > -1) teardowns[index]()
      
      // 清理事件监听
      if (!listeners.length) {
        window.removeEventListener('popstate', popStateHandler)
        window.removeEventListener('beforeunload', beforeUnloadHandler)
        teardowns = []
      }
    }
  }
  
  function destroy() {
    for (const teardown of teardowns) teardown()
    teardowns = []
    listeners = []
  }
  
  return {
    pauseListeners,
    listen,
    destroy
  }
}
```

## 三、Hash History 实现

### 3.1 核心差异

```javascript
// createWebHashHistory 实现
export function createWebHashHistory(base) {
  base = location.host ? base || location.pathname + location.search : ''
  if (!base.includes('#')) base += '#'
  
  const historyNavigation = useHistoryNavigation(base)
  const historyListeners = useHashHistoryListeners(
    base,
    historyNavigation.state,
    historyNavigation.location,
    historyNavigation.replace
  )
  
  function createHref(location) {
    return base.replace(/#.*$/, '') + '#' + location.fullPath
  }
  
  function go(delta, triggerListeners = true) {
    if (!triggerListeners) historyListeners.pauseListeners()
    history.go(delta)
  }
  
  return Object.assign({
    // Hash 特有的位置处理
    location: historyNavigation.location.value,
    state: historyNavigation.state.value,
    
    push: historyNavigation.push,
    replace: historyNavigation.replace,
    go,
    
    listen: historyListeners.listen,
    createHref,
    destroy: historyListeners.destroy
  })
}
```

### 3.2 Hash 监听实现

```javascript
function useHashHistoryListeners(base, historyState, location, replace) {
  let listeners = []
  
  const hashChangeHandler = () => {
    const newLocation = createCurrentLocation(base, window.location)
    
    // 检查是否为同一位置
    if (newLocation.fullPath === location.value.fullPath) return
    
    const oldLocation = location.value
    location.value = newLocation
    
    listeners.forEach(listener => {
      listener(newLocation, oldLocation, {
        type: NavigationType.pop,
        direction: HistoryDirection.unknown
      })
    })
  }
  
  function listen(callback) {
    listeners.push(callback)
    
    // 监听 hashchange 而不是 popstate
    window.addEventListener('hashchange', hashChangeHandler)
    
    return () => {
      removeFromArray(listeners, callback)
      if (!listeners.length) {
        window.removeEventListener('hashchange', hashChangeHandler)
      }
    }
  }
  
  return { listen, destroy: () => listeners = [] }
}
```

## 四、Memory History 实现

### 4.1 内存存储实现

```javascript
// createMemoryHistory 实现
export function createMemoryHistory(base) {
  let listeners = []
  let queue = [START_LOCATION_NORMALIZED]
  let position = 0
  
  const historyState = ref({})
  const location = ref(queue[position])
  
  function setLocation(to) {
    position++
    if (position === queue.length) {
      // 在末尾添加新条目
      queue.push(to)
    } else {
      // 替换当前位置之后的所有条目
      queue.splice(position)
      queue.push(to)
    }
  }
  
  function triggerListeners(to, from, { direction, type }) {
    const info = { direction, type }
    
    listeners.forEach(listener => {
      listener(to, from, info)
    })
  }
  
  function push(to, data) {
    const targetLocation = resolveLocation(to, location.value)
    
    setLocation(targetLocation)
    location.value = targetLocation
    historyState.value = data || {}
    
    triggerListeners(targetLocation, location.value, {
      direction: HistoryDirection.forward,
      type: NavigationType.push
    })
  }
  
  function replace(to, data) {
    const targetLocation = resolveLocation(to, location.value)
    
    queue[position] = targetLocation
    location.value = targetLocation
    historyState.value = data || {}
  }
  
  function go(delta, triggerListeners = true) {
    const from = location.value
    const direction = delta < 0 ? HistoryDirection.back : HistoryDirection.forward
    const newPosition = Math.max(0, Math.min(position + delta, queue.length - 1))
    
    if (newPosition === position) return
    
    position = newPosition
    location.value = queue[position]
    
    if (triggerListeners) {
      triggerListeners(location.value, from, {
        direction,
        type: NavigationType.pop
      })
    }
  }
  
  function listen(callback) {
    listeners.push(callback)
    return () => removeFromArray(listeners, callback)
  }
  
  return {
    location: readonly(location),
    state: readonly(historyState),
    push,
    replace,
    go,
    listen,
    destroy: () => listeners = [],
    createHref: location => location.fullPath
  }
}
```

## 五、状态管理优化

### 5.1 滚动位置管理

```javascript
// 滚动位置保存和恢复
function useScrollBehavior(router, history) {
  let saveScrollPosition = null
  
  const scrollBehavior = router.options.scrollBehavior
  const supportsScroll = 'scrollRestoration' in window.history
  
  if (supportsScroll) {
    window.history.scrollRestoration = 'manual'
  }
  
  // 保存滚动位置
  function saveScroll() {
    saveScrollPosition = {
      x: window.pageXOffset,
      y: window.pageYOffset
    }
  }
  
  // 恢复滚动位置
  function restoreScroll(to, from, savedPosition) {
    if (!scrollBehavior) return
    
    const position = scrollBehavior(to, from, savedPosition)
    
    if (position) {
      if ('behavior' in position) {
        window.scrollTo(position)
      } else {
        window.scrollTo(position.left || 0, position.top || 0)
      }
    }
  }
  
  // 集成到 history
  const originalPush = history.push
  const originalReplace = history.replace
  
  history.push = function(to, data) {
    saveScroll()
    return originalPush.call(this, to, {
      ...data,
      scroll: saveScrollPosition
    })
  }
  
  history.replace = function(to, data) {
    saveScroll()
    return originalReplace.call(this, to, {
      ...data,
      scroll: saveScrollPosition
    })
  }
  
  return { restoreScroll }
}
```

### 5.2 性能优化策略

```javascript
// History 操作防抖
function debounceHistoryOperation(fn, delay = 16) {
  let timeoutId = null
  
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 批量状态更新
function batchStateUpdates(history) {
  let pendingUpdates = []
  let flushId = null
  
  function flush() {
    const updates = pendingUpdates.slice()
    pendingUpdates = []
    flushId = null
    
    // 批量执行更新
    updates.forEach(update => update())
  }
  
  function scheduleUpdate(updateFn) {
    pendingUpdates.push(updateFn)
    
    if (!flushId) {
      flushId = requestAnimationFrame(flush)
    }
  }
  
  return { scheduleUpdate }
}
```

## 六、兼容性处理

### 6.1 降级策略

```javascript
// 检测和降级
function createHistoryWithFallback(options) {
  const { type, base } = options
  
  // 检查浏览器支持
  if (type === 'history' && !supportsPushState()) {
    console.warn('浏览器不支持 History API，降级到 Hash 模式')
    return createWebHashHistory(base)
  }
  
  if (type === 'hash' && typeof window === 'undefined') {
    console.warn('服务端环境，使用 Memory 模式')
    return createMemoryHistory()
  }
  
  return createHistory(type, base)
}

function supportsPushState() {
  return !!(
    typeof window !== 'undefined' &&
    window.history &&
    'pushState' in window.history
  )
}
```

### 6.2 错误边界

```javascript
// History 错误处理
function wrapHistoryMethod(method, fallback) {
  return function(...args) {
    try {
      return method.apply(this, args)
    } catch (error) {
      console.error(`History operation failed:`, error)
      
      if (fallback) {
        return fallback.apply(this, args)
      }
      
      throw error
    }
  }
}
```

## 七、最佳实践

### 7.1 History 选择指南

```javascript
// 不同场景的 History 选择
function selectHistoryType(environment) {
  if (environment.isSSR) {
    return 'memory'  // 服务端渲染
  }
  
  if (environment.isElectron) {
    return 'hash'    // Electron 应用
  }
  
  if (environment.needsSEO && environment.canConfigureServer) {
    return 'history' // 需要 SEO 且可配置服务器
  }
  
  return 'hash'      // 默认降级
}
```

### 7.2 内存管理

- **及时清理**：销毁时清理所有事件监听器
- **避免内存泄漏**：正确移除回调引用
- **限制历史长度**：Memory模式下控制队列大小

## 参考资料

- [MDN - History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API)
- [Vue Router History 源码](https://github.com/vuejs/router/tree/main/packages/router/src/history)
- [浏览器历史管理最佳实践](https://web.dev/history-api/)

**下一节** → [第 27 节：路由守卫机制](./27-guard-mechanism.md)
