# 第 9 节：生命周期

## 概述

每个 Vue 组件实例在创建时都会经历一系列初始化步骤，Vue 在这些阶段暴露了生命周期钩子，让我们可以在特定时机执行代码。

## 一、生命周期图示

```
┌─────────────────────────────────────────────────────────────┐
│                    Vue 3 生命周期                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   创建阶段                                                   │
│   ┌─────────────┐                                          │
│   │   setup()   │  ← 组合式 API 入口                        │
│   └──────┬──────┘                                          │
│          ↓                                                  │
│   ┌─────────────┐                                          │
│   │ beforeCreate│  ← 选项式 API（setup 之后）               │
│   └──────┬──────┘                                          │
│          ↓                                                  │
│   ┌─────────────┐                                          │
│   │   created   │  ← 响应式数据已就绪                       │
│   └──────┬──────┘                                          │
│          ↓                                                  │
│   挂载阶段                                                   │
│   ┌─────────────┐                                          │
│   │ beforeMount │  ← 即将挂载到 DOM                         │
│   └──────┬──────┘                                          │
│          ↓                                                  │
│   ┌─────────────┐                                          │
│   │   mounted   │  ← 已挂载，可访问 DOM                      │
│   └──────┬──────┘                                          │
│          ↓                                                  │
│   更新阶段（数据变化时）                                      │
│   ┌─────────────┐                                          │
│   │beforeUpdate │  ← DOM 更新前                             │
│   └──────┬──────┘                                          │
│          ↓                                                  │
│   ┌─────────────┐                                          │
│   │   updated   │  ← DOM 已更新                             │
│   └──────┬──────┘                                          │
│          ↓                                                  │
│   卸载阶段                                                   │
│   ┌─────────────┐                                          │
│   │beforeUnmount│  ← 即将卸载                               │
│   └──────┬──────┘                                          │
│          ↓                                                  │
│   ┌─────────────┐                                          │
│   │  unmounted  │  ← 已卸载，清理完成                        │
│   └─────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 二、组合式 API 钩子

### 2.1 基本用法

```vue
<script setup>
import { 
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

// 挂载前
onBeforeMount(() => {
  console.log('beforeMount: DOM 还未创建')
})

// 挂载后（最常用）
onMounted(() => {
  console.log('mounted: DOM 已创建，可以访问')
  // 常用于：获取 DOM、初始化第三方库、发起请求
})

// 更新前
onBeforeUpdate(() => {
  console.log('beforeUpdate: 数据变了，DOM 还没更新')
})

// 更新后
onUpdated(() => {
  console.log('updated: DOM 已更新')
})

// 卸载前
onBeforeUnmount(() => {
  console.log('beforeUnmount: 即将卸载')
  // 常用于：清理定时器、取消订阅
})

// 卸载后
onUnmounted(() => {
  console.log('unmounted: 已卸载')
})
</script>
```

### 2.2 setup 相当于 created

```vue
<script setup>
import { ref } from 'vue'

// setup 中的代码相当于在 created 钩子中执行
// 响应式数据已就绪，但 DOM 还未创建

const count = ref(0)

// 这里可以：
// - 初始化响应式数据
// - 发起不依赖 DOM 的请求
// - 设置计算属性和侦听器

console.log('setup: 响应式数据已就绪')
</script>
```

## 三、常用场景

### 3.1 获取 DOM 元素

```vue
<template>
  <div ref="containerRef">内容</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const containerRef = ref(null)

// ❌ setup 中 DOM 还不存在
console.log(containerRef.value)  // null

// ✅ mounted 中 DOM 已创建
onMounted(() => {
  console.log(containerRef.value)  // <div>内容</div>
  containerRef.value.style.color = 'red'
})
</script>
```

### 3.2 初始化第三方库

```vue
<template>
  <div ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let chart = null

onMounted(() => {
  // DOM 就绪后初始化图表
  chart = echarts.init(chartRef.value)
  chart.setOption({
    // 配置...
  })
})

onUnmounted(() => {
  // 销毁时清理
  chart?.dispose()
})
</script>
```

### 3.3 数据请求

```vue
<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(true)

// 方式一：在 setup 中请求（不依赖 DOM）
fetchUsers()

// 方式二：在 onMounted 中请求
onMounted(async () => {
  await fetchUsers()
})

async function fetchUsers() {
  loading.value = true
  try {
    const res = await fetch('/api/users')
    users.value = await res.json()
  } finally {
    loading.value = false
  }
}
</script>
```

### 3.4 清理副作用

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const windowWidth = ref(window.innerWidth)

function handleResize() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  // 添加事件监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('resize', handleResize)
})
</script>
```

### 3.5 定时器清理

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const count = ref(0)
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    count.value++
  }, 1000)
})

onUnmounted(() => {
  // 必须清理，否则内存泄漏
  clearInterval(timer)
})
</script>
```

## 四、其他钩子

### 4.1 错误捕获

```vue
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.error('捕获到错误:', err)
  console.log('来自组件:', instance)
  console.log('错误信息:', info)
  
  // 返回 false 阻止错误继续向上传播
  return false
})
</script>
```

### 4.2 渲染追踪（调试用）

```vue
<script setup>
import { onRenderTracked, onRenderTriggered } from 'vue'

// 追踪依赖
onRenderTracked((event) => {
  console.log('依赖被追踪:', event)
})

// 触发更新
onRenderTriggered((event) => {
  console.log('更新被触发:', event)
})
</script>
```

### 4.3 服务端渲染钩子

```vue
<script setup>
import { onServerPrefetch } from 'vue'

// 仅在服务端渲染时执行
onServerPrefetch(async () => {
  // 预取数据
  await fetchData()
})
</script>
```

## 五、KeepAlive 钩子

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

// 组件被 KeepAlive 缓存激活时
onActivated(() => {
  console.log('组件被激活')
  // 可以刷新数据
})

// 组件被 KeepAlive 缓存停用时
onDeactivated(() => {
  console.log('组件被停用')
  // 可以暂停某些操作
})
</script>
```

## 六、执行顺序

### 6.1 父子组件顺序

```
挂载时：
父 beforeMount → 子 beforeMount → 子 mounted → 父 mounted

更新时：
父 beforeUpdate → 子 beforeUpdate → 子 updated → 父 updated

卸载时：
父 beforeUnmount → 子 beforeUnmount → 子 unmounted → 父 unmounted
```

### 6.2 验证代码

```vue
<!-- Parent.vue -->
<script setup>
import { onMounted, onUnmounted } from 'vue'
import Child from './Child.vue'

onMounted(() => console.log('Parent mounted'))
onUnmounted(() => console.log('Parent unmounted'))
</script>

<template>
  <Child />
</template>

<!-- Child.vue -->
<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(() => console.log('Child mounted'))
onUnmounted(() => console.log('Child unmounted'))
</script>
```

## 七、Vue 2 vs Vue 3 钩子对比

| Vue 2 (选项式) | Vue 3 (选项式) | Vue 3 (组合式) |
|---------------|---------------|---------------|
| beforeCreate | beforeCreate | setup() |
| created | created | setup() |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestroy | beforeUnmount | onBeforeUnmount |
| destroyed | unmounted | onUnmounted |
| activated | activated | onActivated |
| deactivated | deactivated | onDeactivated |

## 八、最佳实践

| 场景 | 推荐钩子 |
|------|----------|
| 数据初始化 | setup / onMounted |
| DOM 操作 | onMounted |
| 第三方库初始化 | onMounted |
| 事件监听 | onMounted + onUnmounted |
| 定时器 | onMounted + onUnmounted |
| 数据请求 | setup / onMounted |
| 清理工作 | onBeforeUnmount / onUnmounted |

## 参考资料

- [生命周期钩子](https://vuejs.org/guide/essentials/lifecycle.html)
- [组合式 API 生命周期](https://vuejs.org/api/composition-api-lifecycle.html)

---

**下一节** → [第 10 节：内置组件](./10-builtin-components.md)
