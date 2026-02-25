# 异步组件与代码分割

> 掌握异步组件的使用，利用代码分割优化应用性能和加载速度。

## 核心概念

异步组件允许将组件定义为一个异步加载的工厂函数，实现按需加载和代码分割。

### 基础用法

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 基础异步组件
const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)
</script>

<template>
  <AsyncComp />
</template>
```

**优势**：
- 减少初始包体积
- 按需加载组件
- 提升首屏加载速度
- 更好的代码组织

---

## defineAsyncComponent

### 简单形式

```typescript
import { defineAsyncComponent } from 'vue'

// 返回 Promise 的工厂函数
const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)

// 也可以是任何返回 Promise 的函数
const AsyncComp = defineAsyncComponent(() =>
  fetch('/api/component').then(res => res.json())
)
```

### 高级配置

```typescript
const AsyncComp = defineAsyncComponent({
  // 加载函数
  loader: () => import('./AsyncComponent.vue'),
  
  // 加载中显示的组件
  loadingComponent: LoadingComponent,
  
  // 加载失败显示的组件
  errorComponent: ErrorComponent,
  
  // 展示加载组件前的延迟时间（默认 200ms）
  delay: 200,
  
  // 超时时间（默认 Infinity）
  timeout: 3000,
  
  // 定义组件是否可挂起（默认 true）
  suspensible: true,
  
  // 错误时的回调
  onError(error, retry, fail, attempts) {
    if (error.message.match(/fetch/) && attempts <= 3) {
      // 重试加载
      retry()
    } else {
      // 失败
      fail()
    }
  }
})
```

---

## 加载状态处理

### 默认加载行为

```vue
<script setup>
const AsyncComp = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>

<template>
  <!-- 组件加载前不显示任何内容 -->
  <AsyncComp />
</template>
```

### 自定义加载组件

```vue
<!-- LoadingSpinner.vue -->
<template>
  <div class="loading">
    <div class="spinner"></div>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import LoadingSpinner from './LoadingSpinner.vue'

const AsyncComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200 // 200ms 后才显示加载组件
})
</script>

<template>
  <AsyncComp />
</template>
```

### 错误处理

```vue
<!-- ErrorDisplay.vue -->
<script setup>
defineProps<{
  error?: Error
}>()
</script>

<template>
  <div class="error">
    <h3>加载失败</h3>
    <p>{{ error?.message }}</p>
    <button @click="$emit('retry')">重试</button>
  </div>
</template>

<script setup>
import ErrorDisplay from './ErrorDisplay.vue'

const AsyncComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  errorComponent: ErrorDisplay,
  timeout: 5000,
  
  onError(error, retry, fail, attempts) {
    console.error('加载失败:', error)
    
    if (attempts <= 3) {
      console.log(`重试第 ${attempts} 次`)
      setTimeout(retry, 1000)
    } else {
      fail()
    }
  }
})
</script>
```

---

## 路由级代码分割

### Vue Router 懒加载

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      // 同步加载（打包在主 bundle）
      component: () => import('../views/Home.vue')
    },
    {
      path: '/about',
      name: 'About',
      // 异步加载（单独打包）
      component: () => import('../views/About.vue')
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      // 使用注释指定 chunk 名称
      component: () => import(
        /* webpackChunkName: "dashboard" */
        '../views/Dashboard.vue'
      )
    }
  ]
})
```

### 路由分组

将相关路由打包到同一个 chunk。

```typescript
// 管理员相关页面打包到一起
const routes = [
  {
    path: '/admin/users',
    component: () => import(
      /* webpackChunkName: "admin" */
      '../views/admin/Users.vue'
    )
  },
  {
    path: '/admin/settings',
    component: () => import(
      /* webpackChunkName: "admin" */
      '../views/admin/Settings.vue'
    )
  }
]
```

---

## 配合 Suspense 使用

Vue 3 的 `<Suspense>` 组件原生支持异步组件。

```vue
<template>
  <Suspense>
    <!-- 主要内容 -->
    <template #default>
      <AsyncComp />
    </template>
    
    <!-- 加载中的回退内容 -->
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<script setup>
const AsyncComp = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)
</script>
```

### 多个异步组件

```vue
<template>
  <Suspense>
    <template #default>
      <div>
        <!-- 等待所有异步组件加载完成 -->
        <AsyncComp1 />
        <AsyncComp2 />
        <AsyncComp3 />
      </div>
    </template>
    
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

---

## 预加载策略

### prefetch

浏览器空闲时预加载。

```vue
<script setup>
// Vite
const AsyncComp = defineAsyncComponent(() =>
  import(/* @vite-ignore */ './AsyncComponent.vue')
)

// Webpack
const AsyncComp = defineAsyncComponent(() =>
  import(
    /* webpackPrefetch: true */
    './AsyncComponent.vue'
  )
)
</script>
```

### preload

立即预加载。

```typescript
const AsyncComp = defineAsyncComponent(() =>
  import(
    /* webpackPreload: true */
    './AsyncComponent.vue'
  )
)
```

### 条件预加载

```vue
<script setup>
import { onMounted } from 'vue'

const showAsync = ref(false)

const AsyncComp = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)

onMounted(() => {
  // 用户交互后预加载
  document.addEventListener('mousemove', () => {
    // 提前加载组件
    import('./HeavyComponent.vue')
  }, { once: true })
})

function loadComponent() {
  showAsync.value = true
}
</script>

<template>
  <button @click="loadComponent">加载组件</button>
  <AsyncComp v-if="showAsync" />
</template>
```

---

## 性能优化

### 1. 合理的代码分割粒度

```typescript
// ❌ 过度分割：每个小组件都异步加载
const Button = defineAsyncComponent(() => import('./Button.vue'))
const Icon = defineAsyncComponent(() => import('./Icon.vue'))

// ✅ 合理分割：大组件或路由级组件异步加载
const Dashboard = defineAsyncComponent(() => import('./Dashboard.vue'))
const Chart = defineAsyncComponent(() => import('./Chart.vue'))
```

### 2. 组件分组

```typescript
// 将相关组件打包到一起
const AdminPanel = defineAsyncComponent(() =>
  import(/* webpackChunkName: "admin" */ './AdminPanel.vue')
)

const AdminSettings = defineAsyncComponent(() =>
  import(/* webpackChunkName: "admin" */ './AdminSettings.vue')
)
```

### 3. 延迟加载

```vue
<script setup>
const showModal = ref(false)

// 只在需要时定义异步组件
const Modal = computed(() => {
  if (showModal.value) {
    return defineAsyncComponent(() => import('./Modal.vue'))
  }
  return null
})
</script>

<template>
  <button @click="showModal = true">打开弹窗</button>
  <component :is="Modal" v-if="Modal" />
</template>
```

---

## 易错点与边界情况

### 1. 异步组件的 ref

```vue
<script setup>
const asyncRef = ref()

const AsyncComp = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)

onMounted(() => {
  // ⚠️ 组件可能还没加载完成
  console.log(asyncRef.value) // 可能是 undefined
})

// ✅ 使用 nextTick 等待
await nextTick()
console.log(asyncRef.value) // 组件实例
</script>

<template>
  <AsyncComp ref="asyncRef" />
</template>
```

### 2. defineAsyncComponent 的返回值

```typescript
// defineAsyncComponent 返回的是组件定义，不是 Promise
const AsyncComp = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)

// ❌ 错误：不能 await
await AsyncComp

// ✅ 正确：直接使用
<AsyncComp />
```

### 3. 循环依赖

```vue
<!-- A.vue -->
<script setup>
// ❌ 可能导致循环依赖
import B from './B.vue'
</script>

<!-- B.vue -->
<script setup>
// ❌ 可能导致循环依赖
import A from './A.vue'
</script>

<!-- ✅ 解决方案：至少一个使用异步组件 -->
<!-- A.vue -->
<script setup>
const B = defineAsyncComponent(() => import('./B.vue'))
</script>
```

### 4. SSR 中的异步组件

```vue
<script setup>
// SSR 中异步组件会等待加载完成
const AsyncComp = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)

// 可能影响服务端渲染性能
</script>
```

---

## 前端工程实践

### 示例 1：Modal 组件懒加载

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const showModal = ref(false)
const modalType = ref<'user' | 'settings' | null>(null)

// 根据类型动态加载不同的 Modal
const currentModal = computed(() => {
  if (!modalType.value) return null
  
  return defineAsyncComponent({
    loader: () => {
      if (modalType.value === 'user') {
        return import('./modals/UserModal.vue')
      } else if (modalType.value === 'settings') {
        return import('./modals/SettingsModal.vue')
      }
      return Promise.reject(new Error('Unknown modal type'))
    },
    loadingComponent: LoadingSpinner,
    delay: 200
  })
})

function openModal(type: 'user' | 'settings') {
  modalType.value = type
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  modalType.value = null
}
</script>

<template>
  <div>
    <button @click="openModal('user')">用户设置</button>
    <button @click="openModal('settings')">系统设置</button>
    
    <Teleport to="body">
      <component
        :is="currentModal"
        v-if="showModal && currentModal"
        @close="closeModal"
      />
    </Teleport>
  </div>
</template>
```

### 示例 2：Tab 组件懒加载

```vue
<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'

type TabName = 'profile' | 'settings' | 'security'

const activeTab = ref<TabName>('profile')

// 预定义所有 Tab 组件
const tabs = {
  profile: defineAsyncComponent(() =>
    import('./tabs/ProfileTab.vue')
  ),
  settings: defineAsyncComponent(() =>
    import('./tabs/SettingsTab.vue')
  ),
  security: defineAsyncComponent(() =>
    import('./tabs/SecurityTab.vue')
  )
}

const currentTab = computed(() => tabs[activeTab.value])

// 预加载下一个 Tab
function preloadTab(tabName: TabName) {
  if (tabName === 'profile') {
    import('./tabs/ProfileTab.vue')
  } else if (tabName === 'settings') {
    import('./tabs/SettingsTab.vue')
  } else if (tabName === 'security') {
    import('./tabs/SecurityTab.vue')
  }
}
</script>

<template>
  <div class="tabs">
    <button
      v-for="tab in ['profile', 'settings', 'security']"
      :key="tab"
      :class="{ active: activeTab === tab }"
      @click="activeTab = tab"
      @mouseenter="preloadTab(tab)"
    >
      {{ tab }}
    </button>
    
    <Suspense>
      <component :is="currentTab" />
      
      <template #fallback>
        <div>加载中...</div>
      </template>
    </Suspense>
  </div>
</template>
```

### 示例 3：条件加载重组件

```vue
<script setup lang="ts">
import { ref } from 'vue'

const showChart = ref(false)
const chartData = ref([])

// 只在需要时加载图表组件
const ChartComponent = computed(() => {
  if (!showChart.value) return null
  
  return defineAsyncComponent({
    loader: () => import('./Chart.vue'),
    loadingComponent: {
      template: '<div>加载图表...</div>'
    }
  })
})

async function loadChartData() {
  const data = await fetchChartData()
  chartData.value = data
  showChart.value = true
}
</script>

<template>
  <div>
    <button @click="loadChartData">显示图表</button>
    
    <component
      :is="ChartComponent"
      v-if="ChartComponent"
      :data="chartData"
    />
  </div>
</template>
```

### 示例 4：列表项懒加载

```vue
<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'

interface Item {
  id: number
  type: 'image' | 'video' | 'text'
}

const items = ref<Item[]>([
  { id: 1, type: 'image' },
  { id: 2, type: 'video' },
  { id: 3, type: 'text' }
])

// 根据类型加载不同组件
function getItemComponent(type: Item['type']) {
  return defineAsyncComponent(() => {
    if (type === 'image') {
      return import('./items/ImageItem.vue')
    } else if (type === 'video') {
      return import('./items/VideoItem.vue')
    } else {
      return import('./items/TextItem.vue')
    }
  })
}
</script>

<template>
  <div class="list">
    <div v-for="item in items" :key="item.id">
      <component :is="getItemComponent(item.type)" :item="item" />
    </div>
  </div>
</template>
```

### 示例 5：重试机制

```vue
<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'

const retryCount = ref(0)
const maxRetries = 3

const AsyncComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  
  loadingComponent: {
    template: '<div>加载中...（尝试 {{ count }}/{{ max }}）</div>',
    setup() {
      return {
        count: retryCount,
        max: maxRetries
      }
    }
  },
  
  errorComponent: {
    template: `
      <div>
        <p>加载失败</p>
        <button @click="$emit('retry')">重试</button>
      </div>
    `
  },
  
  onError(error, retry, fail, attempts) {
    retryCount.value = attempts
    
    if (attempts <= maxRetries) {
      console.log(`重试第 ${attempts} 次...`)
      // 指数退避
      const delay = Math.min(1000 * Math.pow(2, attempts - 1), 10000)
      setTimeout(retry, delay)
    } else {
      console.error('达到最大重试次数')
      fail()
    }
  }
})
</script>

<template>
  <AsyncComp />
</template>
```

### 示例 6：进度条

```vue
<script setup lang="ts">
import { ref } from 'vue'

const loadingProgress = ref(0)

const AsyncComp = defineAsyncComponent({
  loader: () => {
    return new Promise((resolve) => {
      // 模拟加载进度
      const interval = setInterval(() => {
        loadingProgress.value += 10
        if (loadingProgress.value >= 90) {
          clearInterval(interval)
        }
      }, 100)
      
      import('./HeavyComponent.vue').then((module) => {
        loadingProgress.value = 100
        setTimeout(() => {
          resolve(module)
        }, 200)
      })
    })
  },
  
  loadingComponent: {
    template: `
      <div class="progress-bar">
        <div class="progress" :style="{ width: progress + '%' }"></div>
        <span>{{ progress }}%</span>
      </div>
    `,
    props: ['progress']
  }
})
</script>

<template>
  <AsyncComp :progress="loadingProgress" />
</template>
```

---

## 打包分析

### Vite

```bash
# 生成打包分析报告
npm run build
npx vite-bundle-visualizer
```

### Webpack

```typescript
// vue.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  configureWebpack: {
    plugins: [
      new BundleAnalyzerPlugin()
    ]
  }
}
```

---

## 最佳实践

1. **路由级代码分割**：每个路由单独打包
2. **大组件异步加载**：超过 50KB 的组件考虑异步
3. **配置加载状态**：提供良好的用户体验
4. **错误处理与重试**：网络不稳定时自动重试
5. **合理的分组**：相关组件打包到一起
6. **预加载策略**：用户可能访问的页面提前加载
7. **避免过度分割**：小组件不需要异步加载
8. **监控打包大小**：定期分析 bundle 大小

---

## 参考资料

- [异步组件](https://cn.vuejs.org/guide/components/async.html)
- [defineAsyncComponent API](https://cn.vuejs.org/api/general.html#defineasynccomponent)
- [Vue Router 懒加载](https://router.vuejs.org/guide/advanced/lazy-loading.html)
