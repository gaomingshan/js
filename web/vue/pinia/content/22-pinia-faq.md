# 第 22 节：常见问题

## 概述

本节整理了在使用 Pinia 过程中开发者经常遇到的问题和解决方案，涵盖了安装配置、使用方式、性能优化、调试技巧等各个方面。

## 一、安装和配置问题

### 1.1 Pinia 不工作或未注册

**问题**：Store 无法使用，报错 "getActivePinia was called with no active Pinia"

```javascript
// ❌ 问题代码
import { useUserStore } from '@/stores/user'

// 在 Vue 应用创建之前或外部调用
const userStore = useUserStore() // 错误！
```

**解决方案**：

```javascript
// ✅ 正确做法
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia) // 必须在使用 store 之前注册
app.mount('#app')

// 在组件或组合函数中使用
export default {
  setup() {
    const userStore = useUserStore() // ✅ 正确
    return { userStore }
  }
}
```

### 1.2 TypeScript 类型推断问题

**问题**：TypeScript 无法正确推断 Store 类型

```typescript
// ❌ 类型推断失败
export const useStore = defineStore('test', () => {
  const count = ref(0) // 类型可能推断为 any
  return { count }
})
```

**解决方案**：

```typescript
// ✅ 明确类型定义
export const useStore = defineStore('test', () => {
  const count = ref<number>(0) // 明确类型
  
  const increment = (): void => {
    count.value++
  }
  
  const doubleCount = computed<number>(() => count.value * 2)
  
  return {
    count: readonly(count),
    doubleCount,
    increment
  }
})

// 或者使用接口定义
interface StoreState {
  count: number
}

export const useStore = defineStore('test', (): {
  count: Readonly<Ref<number>>
  doubleCount: ComputedRef<number>
  increment: () => void
} => {
  const count = ref<number>(0)
  const doubleCount = computed(() => count.value * 2)
  const increment = () => { count.value++ }
  
  return { count: readonly(count), doubleCount, increment }
})
```

## 二、响应性问题

### 2.1 解构失去响应性

**问题**：从 Store 解构后失去响应性

```vue
<template>
  <div>{{ name }}</div> <!-- 不会响应更新 -->
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
// ❌ 直接解构失去响应性
const { name, email } = userStore
</script>
```

**解决方案**：

```vue
<template>
  <div>{{ name }}</div> <!-- ✅ 响应式更新 -->
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ✅ 使用 storeToRefs 保持响应性
const { name, email } = storeToRefs(userStore)

// ✅ 方法可以直接解构
const { updateUser, deleteUser } = userStore
</script>
```

### 2.2 异步数据不响应

**问题**：异步获取的数据不触发界面更新

```javascript
// ❌ 问题代码
export const useDataStore = defineStore('data', () => {
  let data = [] // 不是响应式
  
  const fetchData = async () => {
    const result = await api.getData()
    data = result // 不会触发响应式更新
  }
  
  return { data, fetchData }
})
```

**解决方案**：

```javascript
// ✅ 正确做法
export const useDataStore = defineStore('data', () => {
  const data = ref([]) // 使用 ref 创建响应式
  
  const fetchData = async () => {
    const result = await api.getData()
    data.value = result // 响应式更新
  }
  
  return { data, fetchData }
})
```

### 2.3 嵌套对象响应性问题

**问题**：嵌套对象的属性变更不响应

```javascript
// ❌ 浅层响应性
export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      profile: {
        name: '',
        preferences: {}
      }
    }
  }),
  
  actions: {
    updatePreference(key, value) {
      // 可能不会触发响应式更新
      this.user.profile.preferences[key] = value
    }
  }
})
```

**解决方案**：

```javascript
// ✅ 使用 reactive 或确保响应性
import { reactive } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = reactive({
    profile: {
      name: '',
      preferences: {}
    }
  })
  
  const updatePreference = (key, value) => {
    // ✅ 响应式更新
    user.profile.preferences[key] = value
  }
  
  // 或者使用 $patch
  const updatePreferenceAlt = (key, value) => {
    this.$patch({
      user: {
        profile: {
          preferences: {
            ...user.profile.preferences,
            [key]: value
          }
        }
      }
    })
  }
  
  return { user, updatePreference }
})
```

## 三、性能问题

### 3.1 过度渲染

**问题**：Store 状态变化导致不必要的组件重渲染

```vue
<template>
  <div>
    <UserProfile />
    <ProductList />
  </div>
</template>

<script setup>
// ❌ 两个组件都会在 store 任何变化时重渲染
const store = useAppStore() // 包含用户和产品数据
</script>
```

**解决方案**：

```vue
<template>
  <div>
    <UserProfile />
    <ProductList />
  </div>
</template>

<script setup>
// ✅ 分离关注点
const userStore = useUserStore()
const productStore = useProductStore()

// ✅ 或者只订阅需要的状态
const { user } = storeToRefs(useAppStore())
const { products } = storeToRefs(useAppStore())
</script>
```

### 3.2 大量计算导致性能问题

**问题**：复杂计算阻塞界面

```javascript
// ❌ 同步的大量计算
export const useAnalyticsStore = defineStore('analytics', () => {
  const rawData = ref([])
  
  const processedData = computed(() => {
    // 大量计算，阻塞主线程
    return rawData.value.map(item => {
      return performComplexCalculation(item)
    })
  })
  
  return { rawData, processedData }
})
```

**解决方案**：

```javascript
// ✅ 使用 Web Worker 或分批处理
export const useAnalyticsStore = defineStore('analytics', () => {
  const rawData = ref([])
  const processedData = ref([])
  const processing = ref(false)
  
  // 分批处理
  const processDataInBatches = async () => {
    processing.value = true
    const batchSize = 100
    const result = []
    
    for (let i = 0; i < rawData.value.length; i += batchSize) {
      const batch = rawData.value.slice(i, i + batchSize)
      const processed = batch.map(performComplexCalculation)
      result.push(...processed)
      
      // 让出控制权
      await nextTick()
    }
    
    processedData.value = result
    processing.value = false
  }
  
  // 或使用 Web Worker
  const processWithWorker = async () => {
    const worker = new Worker('/workers/data-processor.js')
    
    return new Promise((resolve) => {
      worker.postMessage(rawData.value)
      worker.onmessage = (e) => {
        processedData.value = e.data
        resolve(e.data)
        worker.terminate()
      }
    })
  }
  
  return { 
    rawData, 
    processedData, 
    processing,
    processDataInBatches,
    processWithWorker
  }
})
```

## 四、SSR 相关问题

### 4.1 服务端客户端状态不同步

**问题**：服务端渲染的状态与客户端不一致

```javascript
// ❌ 问题代码
export const useThemeStore = defineStore('theme', () => {
  // 服务端无法访问 localStorage
  const theme = ref(localStorage.getItem('theme') || 'light')
  
  return { theme }
})
```

**解决方案**：

```javascript
// ✅ SSR 友好的实现
export const useThemeStore = defineStore('theme', () => {
  const theme = ref('light') // 默认值
  
  // 客户端初始化
  const initTheme = () => {
    if (process.client) {
      const saved = localStorage.getItem('theme')
      if (saved) {
        theme.value = saved
      }
    }
  }
  
  const setTheme = (newTheme) => {
    theme.value = newTheme
    
    if (process.client) {
      localStorage.setItem('theme', newTheme)
    }
  }
  
  return { theme, initTheme, setTheme }
})

// 在客户端挂载后初始化
// app.vue
onMounted(() => {
  const themeStore = useThemeStore()
  themeStore.initTheme()
})
```

### 4.2 Hydration 错误

**问题**：客户端水合失败

```javascript
// ❌ 服务端客户端渲染不一致
export const useTimeStore = defineStore('time', () => {
  const currentTime = ref(new Date()) // 服务端客户端时间不同
  
  return { currentTime }
})
```

**解决方案**：

```javascript
// ✅ 避免时间相关的响应式状态
export const useTimeStore = defineStore('time', () => {
  const currentTime = ref(null)
  const isClient = ref(false)
  
  const updateTime = () => {
    currentTime.value = new Date()
  }
  
  // 只在客户端更新时间
  const startTimer = () => {
    if (process.client) {
      isClient.value = true
      updateTime()
      setInterval(updateTime, 1000)
    }
  }
  
  return { 
    currentTime: readonly(currentTime), 
    isClient,
    startTimer 
  }
})
```

## 五、测试问题

### 5.1 测试环境 Store 不工作

**问题**：在测试中无法使用 Store

```javascript
// ❌ 测试失败
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  it('should work', () => {
    const store = useUserStore() // 错误：没有活动的 Pinia
    expect(store.user).toBe(null)
  })
})
```

**解决方案**：

```javascript
// ✅ 正确的测试设置
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  beforeEach(() => {
    // 每个测试前创建新的 Pinia 实例
    setActivePinia(createPinia())
  })
  
  it('should work', () => {
    const store = useUserStore() // ✅ 正常工作
    expect(store.user).toBe(null)
  })
})
```

### 5.2 Mock Store 问题

**问题**：无法正确 Mock Store

```javascript
// ❌ Mock 不生效
vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    user: { name: 'Mock User' }
  }))
}))
```

**解决方案**：

```javascript
// ✅ 正确的 Mock 方式
import { vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'

// 方式1：使用 testing-pinia
const wrapper = mount(Component, {
  global: {
    plugins: [createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        user: { user: { name: 'Test User' } }
      }
    })]
  }
})

// 方式2：手动创建 Mock Store
const createMockStore = () => {
  return {
    user: ref({ name: 'Mock User' }),
    loading: ref(false),
    fetchUser: vi.fn(),
    $patch: vi.fn(),
    $reset: vi.fn()
  }
}
```

## 六、开发工具问题

### 6.1 DevTools 不显示 Store

**问题**：Vue DevTools 中看不到 Pinia Stores

**解决方案**：

```javascript
// 确保正确安装和配置
// 1. 检查 Vue DevTools 版本（需要 6.0+）
// 2. 确保在开发环境
// 3. 检查 Pinia 版本

// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

// 开发环境启用 devtools
if (process.env.NODE_ENV === 'development') {
  app.config.devtools = true
}

app.use(pinia)
app.mount('#app')
```

### 6.2 热重载不工作

**问题**：Store 修改后页面不热重载

**解决方案**：

```javascript
// vite.config.js
export default {
  plugins: [
    vue(),
    // 确保正确配置 HMR
  ],
  
  // 确保包含 store 文件
  optimizeDeps: {
    include: ['pinia']
  }
}

// 或在 Store 中手动处理 HMR
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
```

## 七、部署问题

### 7.1 生产环境错误

**问题**：生产环境 Store 报错但开发环境正常

**排查步骤**：

```javascript
// 1. 检查环境变量
console.log('Environment:', process.env.NODE_ENV)

// 2. 检查构建配置
// vite.config.js
export default {
  define: {
    __DEV__: process.env.NODE_ENV === 'development'
  }
}

// 3. 添加错误边界
const pinia = createPinia()

pinia.use(({ store }) => {
  store.$onAction(({ name, onError }) => {
    onError((error) => {
      console.error(`Action ${name} failed:`, error)
      // 发送到错误监控服务
      errorReporting.captureException(error)
    })
  })
})
```

### 7.2 代码分割问题

**问题**：Store 在代码分割后无法正常工作

**解决方案**：

```javascript
// 确保 Store 在正确的 chunk 中
// router/index.js
const routes = [
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'),
    beforeEnter: () => {
      // 预加载相关 Store
      return import('@/stores/admin')
    }
  }
]

// 或使用动态导入
// stores/index.js
export const loadUserStore = () => import('./user')
export const loadAdminStore = () => import('./admin')

// 在组件中
const { useUserStore } = await loadUserStore()
const userStore = useUserStore()
```

## 八、迁移问题

### 8.1 从 Vuex 迁移遇到问题

**常见问题和解决方案**：

```javascript
// Vuex modules 命名空间问题
// ❌ Vuex 方式
this.$store.dispatch('user/fetchUser', id)
this.$store.getters['user/isLoggedIn']

// ✅ Pinia 方式
const userStore = useUserStore()
await userStore.fetchUser(id)
const isLoggedIn = userStore.isLoggedIn

// 全局状态访问问题
// ❌ Vuex 全局状态
this.$store.state.global.loading

// ✅ Pinia 组合多个 Store
const globalStore = useGlobalStore()
const userStore = useUserStore()
const loading = computed(() => 
  globalStore.loading || userStore.loading
)
```

### 8.2 版本升级问题

**Pinia 版本升级检查清单**：

```javascript
// 1. 检查破坏性变更
// package.json
{
  "dependencies": {
    "pinia": "^2.0.0", // 检查版本兼容性
    "vue": "^3.0.0"
  }
}

// 2. 更新插件
// 检查插件是否兼容新版本
pinia.use(plugin) // 确保插件 API 兼容

// 3. 测试关键功能
// 运行完整测试套件
npm run test

// 4. 检查 TypeScript 类型
// 确保类型定义正确
const store: ReturnType<typeof useUserStore> = useUserStore()
```

## 九、调试技巧

### 9.1 状态追踪

```javascript
// 添加调试信息
export const useDebugStore = defineStore('debug', () => {
  const logs = ref([])
  
  const logStateChange = (storeName, mutation, state) => {
    logs.value.push({
      timestamp: new Date().toISOString(),
      store: storeName,
      mutation,
      state: JSON.parse(JSON.stringify(state))
    })
    
    console.group(`🔄 [${storeName}] State Change`)
    console.log('Mutation:', mutation)
    console.log('State:', state)
    console.groupEnd()
  }
  
  return { logs, logStateChange }
})

// 在其他 Store 中使用
export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const debugStore = useDebugStore()
  
  watch(user, (newUser, oldUser) => {
    debugStore.logStateChange('user', 
      { type: 'user-changed', oldUser, newUser }, 
      { user: newUser }
    )
  }, { deep: true })
  
  return { user }
})
```

### 9.2 性能监控

```javascript
// 添加性能监控
export const usePerformanceStore = defineStore('performance', () => {
  const metrics = ref(new Map())
  
  const measureAction = (storeName, actionName, fn) => {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    const key = `${storeName}.${actionName}`
    if (!metrics.value.has(key)) {
      metrics.value.set(key, [])
    }
    
    metrics.value.get(key).push(end - start)
    
    if (end - start > 100) {
      console.warn(`⚠️ Slow action: ${key} (${(end - start).toFixed(2)}ms)`)
    }
    
    return result
  }
  
  return { metrics, measureAction }
})
```

## 参考资料

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Pinia GitHub Issues](https://github.com/vuejs/pinia/issues)
- [Vue DevTools](https://devtools.vuejs.org/)

**下一节** → [第 23 节：实战案例](./23-pinia-case-studies.md)
