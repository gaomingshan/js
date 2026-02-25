# 3.2 订阅机制与监听

## 概述

Pinia 提供了强大的订阅机制，允许监听 Store 的状态变化和 Action 调用。这对于实现日志记录、持久化、调试等功能非常有用。

## $subscribe 订阅 State 变化

### 基本用法

`$subscribe()` 方法用于监听 State 的变化：

```javascript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 订阅 state 变化
userStore.$subscribe((mutation, state) => {
  console.log('State 发生变化')
  console.log('mutation 类型:', mutation.type)
  console.log('新状态:', state)
})

// 修改 state 会触发订阅
userStore.name = 'Alice' // 触发订阅回调
```

### Mutation 对象

`$subscribe` 的第一个参数包含变更信息：

```javascript
userStore.$subscribe((mutation, state) => {
  console.log('mutation 对象:', {
    type: mutation.type,        // 变更类型
    storeId: mutation.storeId,  // Store ID
    events: mutation.events,    // 变更事件（仅 dev）
    payload: mutation.payload   // $patch 传入的数据
  })
})
```

### Mutation 类型

Pinia 有三种 mutation 类型：

```javascript
userStore.$subscribe((mutation, state) => {
  switch (mutation.type) {
    case 'direct':
      // 直接修改：store.name = 'Alice'
      console.log('直接修改 state')
      break
      
    case 'patch object':
      // $patch 对象：store.$patch({ name: 'Alice' })
      console.log('使用 $patch 对象修改')
      console.log('payload:', mutation.payload)
      break
      
    case 'patch function':
      // $patch 函数：store.$patch((state) => { state.name = 'Alice' })
      console.log('使用 $patch 函数修改')
      break
  }
})
```

### 实际应用示例

**持久化到 localStorage**：

```javascript
const cartStore = useCartStore()

cartStore.$subscribe((mutation, state) => {
  // 每次 state 变化时保存到 localStorage
  localStorage.setItem('cart', JSON.stringify(state))
})
```

**同步到服务器**：

```javascript
import { debounce } from 'lodash-es'

const todoStore = useTodoStore()

// 使用防抖避免频繁请求
const syncToServer = debounce(async (state) => {
  await fetch('/api/todos/sync', {
    method: 'POST',
    body: JSON.stringify(state)
  })
}, 1000)

todoStore.$subscribe((mutation, state) => {
  syncToServer(state)
})
```

**记录变更日志**：

```javascript
const userStore = useUserStore()

userStore.$subscribe((mutation, state) => {
  const log = {
    timestamp: Date.now(),
    type: mutation.type,
    storeId: mutation.storeId,
    snapshot: JSON.parse(JSON.stringify(state))
  }
  
  console.log('State 变更日志:', log)
  
  // 可以发送到日志服务
  // logService.send(log)
})
```

## $onAction 监听 Actions

### 基本用法

`$onAction()` 方法用于监听 Action 的调用：

```javascript
const userStore = useUserStore()

userStore.$onAction(({
  name,        // action 名称
  store,       // store 实例
  args,        // action 参数
  after,       // action 成功后的钩子
  onError      // action 失败时的钩子
}) => {
  console.log(`Action ${name} 开始执行`)
  console.log('参数:', args)
  
  // action 执行成功后
  after((result) => {
    console.log(`Action ${name} 执行成功`)
    console.log('返回值:', result)
  })
  
  // action 执行失败时
  onError((error) => {
    console.error(`Action ${name} 执行失败`)
    console.error('错误:', error)
  })
})

// 调用 action 会触发监听
userStore.fetchUser(123)
```

### 监听特定 Action

```javascript
userStore.$onAction(({ name, args, after, onError }) => {
  // 只监听特定 action
  if (name === 'login') {
    console.log('用户登录:', args[0].username)
    
    after((result) => {
      console.log('登录成功:', result)
      // 可以执行额外操作，如埋点
      analytics.track('user_login', { userId: result.id })
    })
    
    onError((error) => {
      console.error('登录失败:', error)
      // 错误上报
      errorReporter.send(error)
    })
  }
})
```

### 实际应用示例

**性能监控**：

```javascript
const apiStore = useApiStore()

apiStore.$onAction(({ name, after }) => {
  const startTime = performance.now()
  
  after(() => {
    const duration = performance.now() - startTime
    console.log(`Action ${name} 耗时: ${duration.toFixed(2)}ms`)
    
    // 上报性能数据
    if (duration > 1000) {
      console.warn(`Action ${name} 执行时间过长`)
    }
  })
})
```

**请求拦截和日志**：

```javascript
const userStore = useUserStore()

userStore.$onAction(({ name, args, after, onError }) => {
  // 请求开始日志
  console.log(`[${new Date().toISOString()}] Action: ${name}`, args)
  
  after((result) => {
    // 成功日志
    console.log(`[${new Date().toISOString()}] Action ${name} 成功`, result)
  })
  
  onError((error) => {
    // 失败日志
    console.error(`[${new Date().toISOString()}] Action ${name} 失败`, error)
    
    // 全局错误处理
    if (error.message.includes('401')) {
      // 未授权，跳转登录
      router.push('/login')
    }
  })
})
```

**加载状态管理**：

```javascript
import { ref } from 'vue'

const loadingActions = ref(new Set())

const userStore = useUserStore()

userStore.$onAction(({ name, after, onError }) => {
  // 开始时添加到加载集合
  loadingActions.value.add(name)
  
  const cleanup = () => {
    loadingActions.value.delete(name)
  }
  
  after(cleanup)
  onError(cleanup)
})

// 在组件中使用
const isLoading = computed(() => loadingActions.value.size > 0)
```

## 订阅的生命周期管理

### 自动清理

在组件中订阅时，组件卸载时会自动清理：

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ✅ 组件卸载时自动取消订阅
userStore.$subscribe((mutation, state) => {
  console.log('state changed')
})
</script>
```

### 手动清理

在某些场景下需要手动控制订阅的生命周期：

```javascript
const userStore = useUserStore()

// 订阅返回取消函数
const unsubscribe = userStore.$subscribe((mutation, state) => {
  console.log('state changed')
})

// 手动取消订阅
setTimeout(() => {
  unsubscribe()
  console.log('订阅已取消')
}, 5000)
```

### 持久化订阅

在组件外订阅时，默认会在组件卸载时清理。如果需要持久化订阅，使用第二个参数：

```javascript
// 在 setup 外部订阅
const userStore = useUserStore()

// ❌ 组件卸载时会被清理
userStore.$subscribe((mutation, state) => {
  localStorage.setItem('user', JSON.stringify(state))
})

// ✅ 持久化订阅，不会被清理
userStore.$subscribe(
  (mutation, state) => {
    localStorage.setItem('user', JSON.stringify(state))
  },
  { detached: true } // 持久化选项
)
```

### 订阅选项

```javascript
userStore.$subscribe(
  (mutation, state) => {
    // 订阅回调
  },
  {
    detached: true,  // 是否持久化（不自动清理）
    flush: 'post',   // 触发时机：'pre' | 'post' | 'sync'
    deep: true       // 是否深度监听（默认 false）
  }
)
```

## 使用场景与最佳实践

### 场景 1：状态持久化

```javascript
// plugins/persistence.js
export function persistencePlugin({ store }) {
  // 从 localStorage 恢复
  const saved = localStorage.getItem(store.$id)
  if (saved) {
    store.$patch(JSON.parse(saved))
  }
  
  // 订阅变化并保存
  store.$subscribe((mutation, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state))
  })
}

// main.js
import { createPinia } from 'pinia'
import { persistencePlugin } from './plugins/persistence'

const pinia = createPinia()
pinia.use(persistencePlugin)
```

### 场景 2：状态同步

```javascript
// plugins/sync.js
export function syncPlugin({ store }) {
  // 只同步特定 Store
  if (!['user', 'cart', 'settings'].includes(store.$id)) {
    return
  }
  
  store.$subscribe(
    debounce(async (mutation, state) => {
      try {
        await fetch(`/api/sync/${store.$id}`, {
          method: 'POST',
          body: JSON.stringify(state)
        })
      } catch (error) {
        console.error('同步失败:', error)
      }
    }, 2000),
    { detached: true }
  )
}
```

### 场景 3：时间旅行调试

```javascript
// plugins/timeTravel.js
import { ref } from 'vue'

const history = ref([])
const currentIndex = ref(-1)

export function timeTravelPlugin({ store }) {
  store.$subscribe((mutation, state) => {
    // 保存快照
    history.value.push({
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state)),
      mutation
    })
    currentIndex.value = history.value.length - 1
  })
  
  // 添加时间旅行方法
  store.$timeTravel = {
    undo() {
      if (currentIndex.value > 0) {
        currentIndex.value--
        const snapshot = history.value[currentIndex.value]
        store.$patch(snapshot.state)
      }
    },
    
    redo() {
      if (currentIndex.value < history.value.length - 1) {
        currentIndex.value++
        const snapshot = history.value[currentIndex.value]
        store.$patch(snapshot.state)
      }
    },
    
    history: history.value
  }
}
```

### 场景 4：性能分析

```javascript
// plugins/performance.js
export function performancePlugin({ store }) {
  const metrics = {
    actionCalls: {},
    actionDurations: {}
  }
  
  store.$onAction(({ name, after }) => {
    const startTime = performance.now()
    
    // 记录调用次数
    metrics.actionCalls[name] = (metrics.actionCalls[name] || 0) + 1
    
    after(() => {
      const duration = performance.now() - startTime
      
      // 记录执行时间
      if (!metrics.actionDurations[name]) {
        metrics.actionDurations[name] = []
      }
      metrics.actionDurations[name].push(duration)
      
      // 计算平均时间
      const avg = metrics.actionDurations[name].reduce((a, b) => a + b, 0) / 
                  metrics.actionDurations[name].length
      
      console.log(`Action ${name}:`, {
        calls: metrics.actionCalls[name],
        lastDuration: duration.toFixed(2) + 'ms',
        avgDuration: avg.toFixed(2) + 'ms'
      })
    })
  })
  
  // 暴露性能数据
  store.$metrics = metrics
}
```

## 关键点总结

1. **$subscribe**：监听 State 变化，三种 mutation 类型
2. **$onAction**：监听 Action 调用，支持 after/onError 钩子
3. **自动清理**：组件内订阅会自动清理
4. **持久化订阅**：使用 `{ detached: true }` 选项
5. **实际应用**：持久化、同步、日志、性能监控

## 深入一点

### 订阅 vs Watch

```javascript
import { watch } from 'vue'
import { storeToRefs } from 'pinia'

const store = useUserStore()
const { name } = storeToRefs(store)

// 使用 watch（只监听特定属性）
watch(name, (newVal, oldVal) => {
  console.log(`name 从 ${oldVal} 变为 ${newVal}`)
})

// 使用 $subscribe（监听整个 store）
store.$subscribe((mutation, state) => {
  console.log('整个 store 发生变化')
})
```

### 组合多个订阅

```javascript
const userStore = useUserStore()

// 多个订阅可以并存
const unsubscribe1 = userStore.$subscribe((mutation, state) => {
  console.log('订阅1: 保存到 localStorage')
  localStorage.setItem('user', JSON.stringify(state))
})

const unsubscribe2 = userStore.$subscribe((mutation, state) => {
  console.log('订阅2: 发送分析数据')
  analytics.track('state_change', state)
})

// 统一清理
function cleanup() {
  unsubscribe1()
  unsubscribe2()
}
```

## 参考资料

- [Pinia Subscriptions 文档](https://pinia.vuejs.org/core-concepts/state.html#subscribing-to-the-state)
- [Vue 3 Watch API](https://vuejs.org/api/reactivity-core.html#watch)
- [性能监控最佳实践](https://web.dev/performance/)
