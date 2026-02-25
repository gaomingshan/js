# Suspense 异步组件

> Suspense 用于协调异步依赖的加载状态，提供统一的加载和错误处理。

## 核心概念

`<Suspense>` 是 Vue 3 的实验性特性，用于处理异步组件的加载状态。

### 基础用法

```vue
<template>
  <Suspense>
    <!-- 默认内容（异步组件） -->
    <template #default>
      <AsyncComponent />
    </template>
    
    <!-- 加载中的后备内容 -->
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>
```

---

## 异步 setup

组件的 `setup` 可以是异步的，Suspense 会等待它完成。

```vue
<!-- AsyncComponent.vue -->
<script setup>
// 顶层 await
const data = await fetch('/api/data').then(r => r.json())

// 或使用异步函数
const fetchData = async () => {
  const response = await fetch('/api/data')
  return response.json()
}

const result = await fetchData()
</script>

<template>
  <div>{{ data }}</div>
</template>

<!-- Parent.vue -->
<template>
  <Suspense>
    <AsyncComponent />
    
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
```

---

## 多个异步依赖

Suspense 会等待所有异步依赖完成。

```vue
<template>
  <Suspense>
    <template #default>
      <div>
        <!-- 等待所有组件加载完成 -->
        <AsyncComponent1 />
        <AsyncComponent2 />
        <AsyncComponent3 />
      </div>
    </template>
    
    <template #fallback>
      <div>加载所有组件中...</div>
    </template>
  </Suspense>
</template>
```

---

## 错误处理

### onErrorCaptured

```vue
<script setup>
import { onErrorCaptured } from 'vue'

const error = ref(null)

onErrorCaptured((err) => {
  error.value = err
  return false // 阻止错误继续传播
})
</script>

<template>
  <div v-if="error" class="error">
    <h3>加载失败</h3>
    <p>{{ error.message }}</p>
    <button @click="error = null">重试</button>
  </div>
  
  <Suspense v-else>
    <AsyncComponent />
    
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
```

### ErrorBoundary 组件

```vue
<!-- ErrorBoundary.vue -->
<script setup>
import { onErrorCaptured, ref } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err as Error
  return false
})

function retry() {
  error.value = null
}
</script>

<template>
  <div v-if="error" class="error-boundary">
    <slot name="error" :error="error" :retry="retry">
      <div class="error-content">
        <h3>出错了</h3>
        <p>{{ error.message }}</p>
        <button @click="retry">重试</button>
      </div>
    </slot>
  </div>
  
  <slot v-else></slot>
</template>

<!-- 使用 -->
<template>
  <ErrorBoundary>
    <Suspense>
      <AsyncComponent />
      
      <template #fallback>
        <div>加载中...</div>
      </template>
    </Suspense>
  </ErrorBoundary>
</template>
```

---

## Suspense 事件

监听异步状态变化。

```vue
<script setup>
function onPending() {
  console.log('开始加载')
}

function onResolve() {
  console.log('加载完成')
}

function onFallback() {
  console.log('显示 fallback')
}
</script>

<template>
  <Suspense
    @pending="onPending"
    @resolve="onResolve"
    @fallback="onFallback"
  >
    <AsyncComponent />
    
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

---

## 嵌套 Suspense

可以嵌套使用 Suspense。

```vue
<template>
  <Suspense>
    <template #default>
      <div>
        <AsyncParent />
        
        <!-- 嵌套的 Suspense -->
        <Suspense>
          <AsyncChild />
          
          <template #fallback>
            <div>加载子组件...</div>
          </template>
        </Suspense>
      </div>
    </template>
    
    <template #fallback>
      <div>加载父组件...</div>
    </template>
  </Suspense>
</template>
```

**加载顺序**：
1. 外层 Suspense 显示 fallback
2. AsyncParent 加载完成
3. 内层 Suspense 显示 fallback
4. AsyncChild 加载完成
5. 全部完成

---

## 配合路由使用

### 路由级 Suspense

```vue
<!-- App.vue -->
<template>
  <Suspense>
    <template #default>
      <router-view />
    </template>
    
    <template #fallback>
      <div class="loading">
        <div class="spinner"></div>
        <p>加载页面中...</p>
      </div>
    </template>
  </Suspense>
</template>

<!-- 路由组件可以使用异步 setup -->
<!-- views/Home.vue -->
<script setup>
const data = await fetch('/api/home').then(r => r.json())
</script>

<template>
  <div>{{ data }}</div>
</template>
```

### 路由切换时显示加载

```vue
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const routeKey = computed(() => route.fullPath)
</script>

<template>
  <Suspense :key="routeKey">
    <template #default>
      <router-view />
    </template>
    
    <template #fallback>
      <LoadingBar />
    </template>
  </Suspense>
</template>
```

---

## 实战示例

### 示例 1：数据获取

```vue
<!-- UserProfile.vue -->
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
  avatar: string
}

const props = defineProps<{
  userId: number
}>()

// 顶层 await
const user = await fetch(`/api/users/${props.userId}`)
  .then(r => r.json()) as User
</script>

<template>
  <div class="user-profile">
    <img :src="user.avatar" :alt="user.name">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
  </div>
</template>

<!-- Parent.vue -->
<template>
  <Suspense>
    <UserProfile :user-id="1" />
    
    <template #fallback>
      <div class="skeleton">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
      </div>
    </template>
  </Suspense>
</template>

<style>
.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #e0e0e0;
}

.skeleton-text {
  height: 20px;
  margin: 10px 0;
  background: #e0e0e0;
  border-radius: 4px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
```

### 示例 2：多数据源

```vue
<!-- Dashboard.vue -->
<script setup>
// 并行获取多个数据源
const [users, posts, stats] = await Promise.all([
  fetch('/api/users').then(r => r.json()),
  fetch('/api/posts').then(r => r.json()),
  fetch('/api/stats').then(r => r.json())
])
</script>

<template>
  <div class="dashboard">
    <section>
      <h2>用户 ({{ users.length }})</h2>
      <UserList :users="users" />
    </section>
    
    <section>
      <h2>文章 ({{ posts.length }})</h2>
      <PostList :posts="posts" />
    </section>
    
    <section>
      <h2>统计</h2>
      <Stats :data="stats" />
    </section>
  </div>
</template>

<!-- 使用 -->
<template>
  <Suspense>
    <Dashboard />
    
    <template #fallback>
      <div class="loading-dashboard">
        <div class="loading-section"></div>
        <div class="loading-section"></div>
        <div class="loading-section"></div>
      </div>
    </template>
  </Suspense>
</template>
```

### 示例 3：条件加载

```vue
<script setup>
const showAdvanced = ref(false)

// 动态导入
const AdvancedComponent = defineAsyncComponent(async () => {
  if (!showAdvanced.value) {
    return { template: '<div></div>' }
  }
  return import('./AdvancedComponent.vue')
})
</script>

<template>
  <button @click="showAdvanced = !showAdvanced">
    切换高级功能
  </button>
  
  <Suspense>
    <AdvancedComponent v-if="showAdvanced" />
    
    <template #fallback>
      <div>加载高级功能...</div>
    </template>
  </Suspense>
</template>
```

### 示例 4：带重试的数据获取

```vue
<script setup>
const retryCount = ref(0)
const maxRetries = 3

async function fetchWithRetry(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  } catch (error) {
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.log(`重试 ${retryCount.value}/${maxRetries}`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return fetchWithRetry(url)
    }
    throw error
  }
}

const data = await fetchWithRetry('/api/data')
</script>

<template>
  <div>{{ data }}</div>
</template>
```

### 示例 5：进度指示

```vue
<script setup>
const loadingProgress = ref(0)
const loadingStages = [
  '初始化...',
  '加载配置...',
  '获取数据...',
  '渲染界面...'
]

async function loadWithProgress() {
  for (let i = 0; i < loadingStages.length; i++) {
    loadingProgress.value = ((i + 1) / loadingStages.length) * 100
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  return fetch('/api/data').then(r => r.json())
}

const data = await loadWithProgress()
</script>

<template>
  <div>{{ data }}</div>
</template>

<!-- 父组件 -->
<template>
  <Suspense>
    <AsyncComponent />
    
    <template #fallback>
      <div class="progress-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: loadingProgress + '%' }"
          ></div>
        </div>
        <p>{{ loadingStages[Math.floor(loadingProgress / 25)] }}</p>
      </div>
    </template>
  </Suspense>
</template>
```

---

## SSR 注意事项

### 服务端数据获取

```vue
<script setup>
import { useSSRContext } from 'vue'

// 服务端：从 SSR 上下文获取数据
const ssrContext = import.meta.env.SSR ? useSSRContext() : null
const initialData = ssrContext?.initialData

// 客户端：从服务端注入的数据恢复
const data = initialData || await fetch('/api/data').then(r => r.json())
</script>

<template>
  <div>{{ data }}</div>
</template>
```

### 避免重复请求

```vue
<script setup>
// 使用状态管理避免重复请求
import { useDataStore } from './stores/data'

const store = useDataStore()

if (!store.data) {
  store.data = await fetch('/api/data').then(r => r.json())
}

const data = store.data
</script>
```

---

## 性能优化

### 1. 预加载

```vue
<script setup>
// 提前加载组件
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  delay: 200
})

// 预加载
onMounted(() => {
  import('./HeavyComponent.vue')
})
</script>
```

### 2. 缓存数据

```vue
<script setup>
const cache = new Map()

async function fetchWithCache(url: string) {
  if (cache.has(url)) {
    return cache.get(url)
  }
  
  const data = await fetch(url).then(r => r.json())
  cache.set(url, data)
  return data
}

const data = await fetchWithCache('/api/data')
</script>
```

### 3. 超时处理

```vue
<script setup>
async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    return response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时')
    }
    throw error
  }
}

const data = await fetchWithTimeout('/api/data', 3000)
</script>
```

---

## 易错点与注意事项

### 1. 实验性特性

```
⚠️ Suspense 仍是实验性特性
- API 可能变化
- 生产环境需谨慎使用
- 关注官方更新
```

### 2. 错误边界

```vue
<!-- ❌ 错误：没有错误处理 -->
<Suspense>
  <AsyncComponent />
  <template #fallback>Loading...</template>
</Suspense>

<!-- ✅ 正确：配合错误边界 -->
<ErrorBoundary>
  <Suspense>
    <AsyncComponent />
    <template #fallback>Loading...</template>
  </Suspense>
</ErrorBoundary>
```

### 3. 多次渲染

```vue
<script setup>
// ⚠️ 每次父组件更新都会重新执行
const data = await fetch('/api/data').then(r => r.json())

// ✅ 使用缓存避免重复请求
const cachedData = useCachedFetch('/api/data')
</script>
```

### 4. 与 KeepAlive 配合

```vue
<template>
  <!-- 缓存异步组件 -->
  <router-view v-slot="{ Component }">
    <KeepAlive>
      <Suspense>
        <component :is="Component" />
        <template #fallback>Loading...</template>
      </Suspense>
    </KeepAlive>
  </router-view>
</template>
```

---

## Suspense vs Loading State

| 方案 | 优点 | 缺点 |
|------|------|------|
| Suspense | 统一处理、代码简洁 | 实验性、不够灵活 |
| 手动 Loading | 灵活控制、稳定 | 代码冗余、维护成本 |

### 手动 Loading 方案

```vue
<script setup>
const loading = ref(true)
const data = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    data.value = await fetch('/api/data').then(r => r.json())
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>{{ data }}</div>
</template>
```

---

## 最佳实践

1. **错误处理**：配合 ErrorBoundary 使用
2. **加载状态**：提供有意义的 fallback
3. **性能优化**：缓存数据、避免重复请求
4. **超时处理**：设置合理的超时时间
5. **用户体验**：显示加载进度、骨架屏
6. **SSR 兼容**：处理服务端渲染场景
7. **谨慎使用**：注意实验性特性的风险
8. **降级方案**：提供手动 loading 备选

---

## 未来展望

Suspense 的潜在改进：
- 更好的错误处理机制
- 细粒度的加载状态控制
- 与 Streaming SSR 的集成
- 稳定的 API

---

## 参考资料

- [Suspense（实验性）](https://cn.vuejs.org/guide/built-ins/suspense.html)
- [异步组件](https://cn.vuejs.org/guide/components/async.html)
- [组合式 API FAQ](https://cn.vuejs.org/guide/extras/composition-api-faq.html#async-setup)
