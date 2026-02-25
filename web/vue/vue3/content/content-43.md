# 性能优化策略

> 系统性优化 Vue 3 应用性能，提升用户体验。

## 性能指标

### Core Web Vitals

- **LCP (Largest Contentful Paint)**：最大内容绘制 < 2.5s
- **FID (First Input Delay)**：首次输入延迟 < 100ms
- **CLS (Cumulative Layout Shift)**：累积布局偏移 < 0.1

### 其他指标

- **FCP (First Contentful Paint)**：首次内容绘制
- **TTI (Time to Interactive)**：可交互时间
- **TBT (Total Blocking Time)**：总阻塞时间

---

## 代码分割

### 路由懒加载

```typescript
// ❌ 不推荐：同步导入
import Home from './views/Home.vue'
import About from './views/About.vue'

// ✅ 推荐：异步导入
const Home = () => import('./views/Home.vue')
const About = () => import('./views/About.vue')

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/about',
    component: About
  }
]
```

### 组件懒加载

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 基础用法
const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)

// 带选项
const AsyncComp = defineAsyncComponent({
  loader: () => import('./components/AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
</script>

<template>
  <Suspense>
    <AsyncComp />
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

### 动态导入

```typescript
// 条件导入
async function loadComponent() {
  if (condition) {
    const { Component } = await import('./HeavyComponent.vue')
    return Component
  }
}

// 并行导入
const [moduleA, moduleB] = await Promise.all([
  import('./moduleA'),
  import('./moduleB')
])

// Webpack 魔法注释
const Component = () => import(
  /* webpackChunkName: "my-chunk" */
  /* webpackPrefetch: true */
  './Component.vue'
)
```

---

## 虚拟滚动

### 基础实现

```vue
<script setup lang="ts">
interface Item {
  id: number
  content: string
}

const props = defineProps<{
  items: Item[]
  itemHeight: number
  visibleCount: number
}>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

const visibleData = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const end = start + props.visibleCount
  return props.items.slice(start, end + 1)
})

const offsetY = computed(() => {
  return Math.floor(scrollTop.value / props.itemHeight) * props.itemHeight
})

const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

function handleScroll(e: Event) {
  scrollTop.value = (e.target as HTMLElement).scrollTop
}
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-scroll-container"
    @scroll="handleScroll"
  >
    <div :style="{ height: totalHeight + 'px' }" class="scroll-content">
      <div
        :style="{ transform: `translateY(${offsetY}px)` }"
        class="visible-items"
      >
        <div
          v-for="item in visibleData"
          :key="item.id"
          :style="{ height: itemHeight + 'px' }"
          class="item"
        >
          {{ item.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-scroll-container {
  height: 500px;
  overflow-y: auto;
}

.scroll-content {
  position: relative;
}

.visible-items {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
</style>
```

### 使用 vue-virtual-scroller

```bash
npm install vue-virtual-scroller
```

```vue
<script setup>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const items = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  content: `Item ${i}`
})))
</script>

<template>
  <RecycleScroller
    :items="items"
    :item-size="50"
    key-field="id"
    class="scroller"
  >
    <template #default="{ item }">
      <div class="item">
        {{ item.content }}
      </div>
    </template>
  </RecycleScroller>
</template>
```

---

## 图片优化

### 懒加载

```vue
<script setup>
import { useIntersectionObserver } from '@vueuse/core'

const imgRef = ref<HTMLImageElement>()
const isVisible = ref(false)

useIntersectionObserver(
  imgRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      isVisible.value = true
    }
  }
)
</script>

<template>
  <img
    ref="imgRef"
    :src="isVisible ? actualSrc : placeholder"
    alt="Image"
  />
</template>
```

### 响应式图片

```vue
<template>
  <picture>
    <source
      media="(max-width: 768px)"
      srcset="image-mobile.jpg"
    />
    <source
      media="(max-width: 1200px)"
      srcset="image-tablet.jpg"
    />
    <img src="image-desktop.jpg" alt="Image" />
  </picture>
</template>
```

### WebP 支持

```vue
<template>
  <picture>
    <source srcset="image.webp" type="image/webp" />
    <source srcset="image.jpg" type="image/jpeg" />
    <img src="image.jpg" alt="Image" />
  </picture>
</template>
```

---

## 组件优化

### v-once

```vue
<template>
  <!-- 只渲染一次，后续更新跳过 -->
  <div v-once>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>
```

### v-memo

```vue
<script setup>
const items = ref([
  { id: 1, name: 'Item 1', selected: false },
  { id: 2, name: 'Item 2', selected: false }
])
</script>

<template>
  <!-- 只在 selected 变化时更新 -->
  <div
    v-for="item in items"
    :key="item.id"
    v-memo="[item.selected]"
  >
    <span>{{ item.name }}</span>
    <input v-model="item.selected" type="checkbox" />
  </div>
</template>
```

### KeepAlive

```vue
<template>
  <router-view v-slot="{ Component }">
    <KeepAlive :include="['Home', 'About']" :max="10">
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>
```

---

## 计算属性优化

### 避免副作用

```typescript
// ❌ 不推荐：有副作用
const computed1 = computed(() => {
  someArray.push(1) // 修改了外部状态
  return someArray.length
})

// ✅ 推荐：纯函数
const computed2 = computed(() => {
  return someArray.length
})
```

### 缓存复杂计算

```typescript
// ❌ 不推荐：每次都重新计算
const expensiveValue = computed(() => {
  return heavyComputation(data.value)
})

// ✅ 推荐：使用缓存
const cachedValues = new Map()

const expensiveValue = computed(() => {
  const key = JSON.stringify(data.value)
  if (cachedValues.has(key)) {
    return cachedValues.get(key)
  }
  const result = heavyComputation(data.value)
  cachedValues.set(key, result)
  return result
})
```

---

## 事件优化

### 事件委托

```vue
<script setup>
function handleClick(e: Event) {
  const target = e.target as HTMLElement
  if (target.tagName === 'BUTTON') {
    const id = target.dataset.id
    // 处理点击
  }
}
</script>

<template>
  <!-- ❌ 不推荐：每个按钮一个事件监听器 -->
  <div>
    <button v-for="item in items" :key="item.id" @click="handleClick(item)">
      {{ item.name }}
    </button>
  </div>

  <!-- ✅ 推荐：使用事件委托 -->
  <div @click="handleClick">
    <button v-for="item in items" :key="item.id" :data-id="item.id">
      {{ item.name }}
    </button>
  </div>
</template>
```

### 防抖和节流

```typescript
// composables/useDebounce.ts
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
) {
  let timeoutId: number
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay) as unknown as number
  }
}

// composables/useThrottle.ts
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
) {
  let lastCall = 0
  
  return function(...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

// 使用
<script setup>
const handleSearch = useDebounce((query: string) => {
  // 搜索逻辑
}, 300)

const handleScroll = useThrottle(() => {
  // 滚动逻辑
}, 100)
</script>
```

---

## 响应式优化

### shallowRef

```typescript
// ❌ 不推荐：深层响应式
const state = ref({
  user: {
    profile: {
      name: 'Alice',
      age: 25
    }
  }
})

// ✅ 推荐：浅层响应式（如果不需要深层响应）
const state = shallowRef({
  user: {
    profile: {
      name: 'Alice',
      age: 25
    }
  }
})

// 更新整个对象
state.value = { ...state.value }
```

### shallowReactive

```typescript
// ❌ 不推荐：深层响应式
const state = reactive({
  items: Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    data: { /* 大量数据 */ }
  }))
})

// ✅ 推荐：浅层响应式
const state = shallowReactive({
  items: Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    data: { /* 大量数据 */ }
  }))
})
```

### readonly

```typescript
// 不需要修改的数据使用 readonly
const config = readonly({
  apiUrl: 'https://api.example.com',
  timeout: 3000
})
```

---

## 列表渲染优化

### 正确使用 key

```vue
<!-- ❌ 不推荐：使用 index 作为 key -->
<div v-for="(item, index) in items" :key="index">
  {{ item.name }}
</div>

<!-- ✅ 推荐：使用唯一 id 作为 key -->
<div v-for="item in items" :key="item.id">
  {{ item.name }}
</div>
```

### 避免在 v-for 中使用 v-if

```vue
<!-- ❌ 不推荐 -->
<div v-for="item in items" :key="item.id" v-if="item.visible">
  {{ item.name }}
</div>

<!-- ✅ 推荐：先过滤再渲染 -->
<div v-for="item in visibleItems" :key="item.id">
  {{ item.name }}
</div>

<script setup>
const visibleItems = computed(() => {
  return items.value.filter(item => item.visible)
})
</script>
```

### 分页加载

```vue
<script setup>
const items = ref([])
const page = ref(1)
const pageSize = 20
const loading = ref(false)

const displayItems = computed(() => {
  return items.value.slice(0, page.value * pageSize)
})

async function loadMore() {
  if (loading.value) return
  
  loading.value = true
  try {
    const newItems = await fetchItems(page.value + 1)
    items.value.push(...newItems)
    page.value++
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-for="item in displayItems" :key="item.id">
    {{ item.name }}
  </div>
  <button @click="loadMore" :disabled="loading">
    加载更多
  </button>
</template>
```

---

## 网络优化

### 请求缓存

```typescript
// utils/cache.ts
class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private ttl = 5 * 60 * 1000 // 5分钟
  
  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
}

export const requestCache = new RequestCache()

// api/user.ts
export async function getUser(id: number) {
  const cacheKey = `user:${id}`
  const cached = requestCache.get(cacheKey)
  
  if (cached) return cached
  
  const user = await fetch(`/api/users/${id}`).then(r => r.json())
  requestCache.set(cacheKey, user)
  
  return user
}
```

### 请求合并

```typescript
// utils/batchRequest.ts
class BatchRequest {
  private pending = new Map<string, Promise<any>>()
  private queue: Array<() => void> = []
  private timer: number | null = null
  
  request<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key)!
    }
    
    const promise = new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fetcher()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.pending.delete(key)
        }
      })
    })
    
    this.pending.set(key, promise)
    this.scheduleFlush()
    
    return promise
  }
  
  private scheduleFlush() {
    if (this.timer) return
    
    this.timer = setTimeout(() => {
      this.flush()
    }, 10) as unknown as number
  }
  
  private flush() {
    const queue = this.queue.splice(0)
    this.timer = null
    
    // 批量执行
    Promise.all(queue.map(fn => fn()))
  }
}

export const batchRequest = new BatchRequest()
```

---

## 构建优化

### Tree Shaking

```typescript
// ❌ 不推荐：导入整个库
import _ from 'lodash'

// ✅ 推荐：按需导入
import debounce from 'lodash-es/debounce'
import throttle from 'lodash-es/throttle'
```

### 压缩

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    }
  }
})
```

### CDN 加速

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia'
        }
      }
    }
  }
})
```

```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-router@4/dist/vue-router.global.prod.js"></script>
```

---

## 性能监控

### Performance API

```typescript
// utils/performance.ts
export function measurePerformance(name: string, fn: () => void) {
  performance.mark(`${name}-start`)
  fn()
  performance.mark(`${name}-end`)
  performance.measure(name, `${name}-start`, `${name}-end`)
  
  const measure = performance.getEntriesByName(name)[0]
  console.log(`${name}: ${measure.duration}ms`)
}

// 使用
measurePerformance('render', () => {
  // 渲染逻辑
})
```

### 自定义监控

```typescript
// composables/usePerformanceMonitor.ts
export function usePerformanceMonitor() {
  const metrics = ref({
    lcp: 0,
    fid: 0,
    cls: 0
  })
  
  onMounted(() => {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      metrics.value.lcp = lastEntry.renderTime || lastEntry.loadTime
    }).observe({ entryTypes: ['largest-contentful-paint'] })
    
    // FID
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        metrics.value.fid = entry.processingStart - entry.startTime
      })
    }).observe({ entryTypes: ['first-input'] })
    
    // CLS
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          metrics.value.cls = clsValue
        }
      }
    }).observe({ entryTypes: ['layout-shift'] })
  })
  
  return { metrics }
}
```

---

## 最佳实践

1. **按需加载**：路由和组件懒加载
2. **虚拟滚动**：大列表使用虚拟滚动
3. **图片优化**：懒加载、WebP、响应式
4. **缓存策略**：合理使用缓存
5. **代码分割**：分离第三方库
6. **Tree Shaking**：按需导入
7. **性能监控**：持续监控关键指标
8. **渐进增强**：基础功能优先加载

---

## 参考资料

- [Vue 3 性能优化](https://vuejs.org/guide/best-practices/performance.html)
- [Web Vitals](https://web.dev/vitals/)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
