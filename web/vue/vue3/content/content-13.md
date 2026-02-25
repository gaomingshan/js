# 组件生命周期

> 理解组件生命周期钩子的执行时机和应用场景，掌握 Vue 3 组合式 API 的生命周期管理。

## 核心概念

生命周期钩子是在组件不同阶段自动调用的函数，允许我们在特定时机执行代码。

### Vue 3 生命周期钩子

```vue
<script setup>
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onActivated,
  onDeactivated
} from 'vue'

// 组件挂载前
onBeforeMount(() => {
  console.log('组件即将挂载')
})

// 组件挂载后
onMounted(() => {
  console.log('组件已挂载，可访问 DOM')
})

// 组件更新前
onBeforeUpdate(() => {
  console.log('组件即将更新')
})

// 组件更新后
onUpdated(() => {
  console.log('组件已更新')
})

// 组件卸载前
onBeforeUnmount(() => {
  console.log('组件即将卸载')
})

// 组件卸载后
onUnmounted(() => {
  console.log('组件已卸载')
})

// 捕获子组件错误
onErrorCaptured((err, instance, info) => {
  console.error('捕获到错误:', err, info)
  return false // 阻止错误继续传播
})

// KeepAlive 激活
onActivated(() => {
  console.log('组件被激活')
})

// KeepAlive 停用
onDeactivated(() => {
  console.log('组件被停用')
})
</script>
```

---

## 生命周期钩子详解

### onBeforeMount

组件挂载之前调用，此时模板已编译，但 DOM 尚未创建。

```vue
<script setup>
const data = ref([])

onBeforeMount(() => {
  // ✅ 可以：访问响应式数据
  console.log(data.value)
  
  // ❌ 不能：访问 DOM（尚未创建）
  // const el = document.querySelector('.my-element')
})
</script>
```

**使用场景**：
- 初始化非响应式数据
- 设置第三方库（不依赖 DOM）

### onMounted

组件挂载后调用，此时 DOM 已创建并插入到页面。

```vue
<script setup>
const chartRef = ref<HTMLElement>()

onMounted(() => {
  // ✅ 可以访问 DOM
  console.log(chartRef.value)
  
  // 初始化图表
  initChart(chartRef.value)
  
  // 添加事件监听
  window.addEventListener('resize', handleResize)
  
  // 发起 API 请求
  fetchData()
})
</script>

<template>
  <div ref="chartRef"></div>
</template>
```

**使用场景**：
- 访问和操作 DOM
- 初始化第三方库（需要 DOM）
- 发起网络请求
- 添加事件监听器

### onBeforeUpdate

响应式数据变化导致重新渲染之前调用。

```vue
<script setup>
const count = ref(0)

onBeforeUpdate(() => {
  // 可以访问更新前的 DOM 状态
  console.log('更新前的 DOM:', document.querySelector('.count')?.textContent)
})
</script>

<template>
  <div class="count">{{ count }}</div>
  <button @click="count++">+1</button>
</template>
```

**使用场景**：
- 在 DOM 更新前获取旧状态
- 调试（查看更新原因）

### onUpdated

DOM 更新完成后调用。

```vue
<script setup>
const list = ref([1, 2, 3])

onUpdated(() => {
  // ⚠️ 注意：避免在此修改响应式数据（可能导致无限循环）
  console.log('DOM 已更新')
  
  // ✅ 可以访问更新后的 DOM
  const items = document.querySelectorAll('.item')
  console.log('当前项数:', items.length)
})
</script>
```

**使用场景**：
- DOM 更新后的操作（如重新计算布局）
- 第三方库的更新

**⚠️ 注意**：不要在 `onUpdated` 中修改响应式数据，可能导致无限循环。

### onBeforeUnmount

组件卸载前调用。

```vue
<script setup>
let timer: number | null = null

onMounted(() => {
  timer = setInterval(() => {
    console.log('定时器执行')
  }, 1000)
})

onBeforeUnmount(() => {
  // 清理定时器
  if (timer) {
    clearInterval(timer)
  }
  
  // 此时 DOM 仍存在
  console.log('组件即将卸载')
})
</script>
```

**使用场景**：
- 清理资源前的准备工作
- 保存状态

### onUnmounted

组件卸载后调用。

```vue
<script setup>
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('resize', handleResize)
  
  // 取消网络请求
  abortController.abort()
  
  // 清理第三方库
  chart.destroy()
  
  // 此时 DOM 已被移除
})
</script>
```

**使用场景**：
- 清理事件监听器
- 取消网络请求
- 销毁第三方库实例
- 清理定时器和订阅

---

## 组合式 API vs 选项式 API

### 选项式 API 生命周期

```vue
<script>
export default {
  beforeCreate() {
    // 实例初始化之后，数据观测和事件配置之前
  },
  
  created() {
    // 实例创建完成，数据观测和事件配置完成
  },
  
  beforeMount() {
    // 挂载开始之前
  },
  
  mounted() {
    // 挂载完成
  },
  
  beforeUpdate() {
    // 数据更新时，DOM 更新之前
  },
  
  updated() {
    // DOM 更新完成
  },
  
  beforeUnmount() {
    // 卸载开始之前
  },
  
  unmounted() {
    // 卸载完成
  }
}
</script>
```

### 对应关系

| 选项式 API | 组合式 API | 说明 |
|-----------|-----------|------|
| beforeCreate | - | setup() 内部 |
| created | - | setup() 内部 |
| beforeMount | onBeforeMount | 挂载前 |
| mounted | onMounted | 挂载后 |
| beforeUpdate | onBeforeUpdate | 更新前 |
| updated | onUpdated | 更新后 |
| beforeUnmount | onBeforeUnmount | 卸载前 |
| unmounted | onUnmounted | 卸载后 |

**注意**：`setup()` 等价于 `beforeCreate` 和 `created`，所以不需要对应的钩子。

---

## 父子组件生命周期执行顺序

### 挂载阶段

```
父 beforeMount
  → 子 beforeMount
  → 子 mounted
父 mounted
```

```vue
<!-- Parent.vue -->
<script setup>
console.log('父 setup')

onBeforeMount(() => {
  console.log('父 beforeMount')
})

onMounted(() => {
  console.log('父 mounted')
})
</script>

<template>
  <Child />
</template>

<!-- Child.vue -->
<script setup>
console.log('子 setup')

onBeforeMount(() => {
  console.log('子 beforeMount')
})

onMounted(() => {
  console.log('子 mounted')
})
</script>

<!-- 输出顺序 -->
<!-- 父 setup -->
<!-- 子 setup -->
<!-- 父 beforeMount -->
<!-- 子 beforeMount -->
<!-- 子 mounted -->
<!-- 父 mounted -->
```

### 更新阶段

```
父 beforeUpdate
  → 子 beforeUpdate
  → 子 updated
父 updated
```

### 卸载阶段

```
父 beforeUnmount
  → 子 beforeUnmount
  → 子 unmounted
父 unmounted
```

---

## KeepAlive 生命周期

### onActivated & onDeactivated

```vue
<script setup>
const data = ref([])

// 组件被激活时
onActivated(() => {
  console.log('组件激活')
  // 重新获取数据
  fetchData()
})

// 组件被停用时
onDeactivated(() => {
  console.log('组件停用')
  // 清理定时器等
  clearInterval(timer)
})

// 注意：mounted 只在首次挂载时调用
onMounted(() => {
  console.log('首次挂载')
})
</script>

<template>
  <div>{{ data }}</div>
</template>

<!-- 使用 KeepAlive -->
<template>
  <KeepAlive>
    <Component :is="currentComponent" />
  </KeepAlive>
</template>
```

**执行顺序**：
```
首次渲染：
  mounted → activated

切换走：
  deactivated

切换回来：
  activated（不触发 mounted）
```

---

## 错误处理钩子

### onErrorCaptured

捕获后代组件的错误。

```vue
<script setup>
onErrorCaptured((err, instance, info) => {
  console.error('捕获错误:', err)
  console.log('错误组件:', instance)
  console.log('错误信息:', info)
  
  // 返回 false 阻止错误继续传播
  // 返回 true 或不返回，错误会继续向上传播
  return false
})
</script>

<template>
  <ChildComponent />
</template>
```

**错误传播**：
1. 错误从子组件向上冒泡
2. 遇到 `onErrorCaptured` 时调用
3. 返回 `false` 阻止继续传播
4. 最终到达全局错误处理器

### 全局错误处理

```typescript
// main.ts
const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  // 发送到错误监控服务
  reportError(err, instance, info)
}
```

---

## 易错点与边界情况

### 1. 异步操作与生命周期

```vue
<script setup>
// ❌ 错误：异步后调用生命周期钩子
setTimeout(() => {
  onMounted(() => {
    // 不会执行！
  })
}, 1000)

// ✅ 正确：同步调用钩子
onMounted(() => {
  // 钩子内可以有异步操作
  setTimeout(() => {
    console.log('异步操作')
  }, 1000)
})
</script>
```

### 2. 多次调用同一钩子

```vue
<script setup>
// 多次调用会按顺序执行
onMounted(() => {
  console.log('第一个 onMounted')
})

onMounted(() => {
  console.log('第二个 onMounted')
})

// 输出：
// 第一个 onMounted
// 第二个 onMounted
</script>
```

### 3. 在 onUpdated 中修改状态

```vue
<script setup>
const count = ref(0)

onUpdated(() => {
  // ❌ 危险：可能导致无限循环
  if (count.value < 10) {
    count.value++
  }
  
  // ✅ 如果必须修改，使用 nextTick
  nextTick(() => {
    // 下一次更新后执行
  })
})
</script>
```

### 4. setup 的执行时机

```vue
<script setup>
// setup 中的代码等价于 beforeCreate + created
console.log('setup 执行')

// 此时 DOM 不存在
// const el = document.querySelector('.my-element') // null

// 响应式数据已准备好
const count = ref(0)
console.log(count.value) // 0
</script>
```

---

## 前端工程实践

### 示例 1：数据获取

```vue
<script setup lang="ts">
const data = ref<DataType[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    data.value = await fetchData()
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">错误：{{ error.message }}</div>
  <div v-else>
    <div v-for="item in data" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>
```

### 示例 2：事件监听管理

```vue
<script setup>
const windowSize = reactive({
  width: window.innerWidth,
  height: window.innerHeight
})

function handleResize() {
  windowSize.width = window.innerWidth
  windowSize.height = window.innerHeight
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 或使用 VueUse
import { useWindowSize } from '@vueuse/core'
const { width, height } = useWindowSize()
</script>
```

### 示例 3：定时器管理

```vue
<script setup>
const count = ref(0)
let timer: number | null = null

onMounted(() => {
  timer = setInterval(() => {
    count.value++
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

// 或使用 Composable
function useInterval(callback: () => void, delay: number) {
  let timer: number | null = null
  
  onMounted(() => {
    timer = setInterval(callback, delay) as unknown as number
  })
  
  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
    }
  })
}

useInterval(() => {
  count.value++
}, 1000)
</script>
```

### 示例 4：第三方库集成

```vue
<script setup>
import Chart from 'chart.js/auto'

const chartRef = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

onMounted(() => {
  if (chartRef.value) {
    chartInstance = new Chart(chartRef.value, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3]
        }]
      }
    })
  }
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

// 数据更新时同步图表
watch(chartData, (newData) => {
  if (chartInstance) {
    chartInstance.data = newData
    chartInstance.update()
  }
})
</script>

<template>
  <canvas ref="chartRef"></canvas>
</template>
```

### 示例 5：KeepAlive 组件数据刷新

```vue
<script setup>
const data = ref([])
const lastFetchTime = ref<Date | null>(null)

onMounted(() => {
  console.log('首次挂载，获取数据')
  fetchData()
})

onActivated(() => {
  console.log('组件激活')
  
  // 检查是否需要刷新数据
  const now = new Date()
  if (!lastFetchTime.value || 
      now.getTime() - lastFetchTime.value.getTime() > 60000) {
    console.log('数据过期，重新获取')
    fetchData()
  }
})

onDeactivated(() => {
  console.log('组件停用')
})

async function fetchData() {
  data.value = await api.getData()
  lastFetchTime.value = new Date()
}
</script>
```

### 示例 6：组件性能监控

```vue
<script setup>
import { onMounted, onUpdated, onUnmounted } from 'vue'

const componentName = 'MyComponent'
let mountTime = 0
let updateCount = 0

onBeforeMount(() => {
  mountTime = performance.now()
})

onMounted(() => {
  const duration = performance.now() - mountTime
  console.log(`${componentName} 挂载耗时: ${duration}ms`)
  
  // 发送到监控服务
  reportPerformance({
    component: componentName,
    type: 'mount',
    duration
  })
})

onBeforeUpdate(() => {
  updateCount++
})

onUpdated(() => {
  console.log(`${componentName} 已更新 ${updateCount} 次`)
})

onUnmounted(() => {
  console.log(`${componentName} 销毁，共更新 ${updateCount} 次`)
})
</script>
```

---

## 生命周期最佳实践

1. **清理副作用**：在 `onUnmounted` 中清理事件监听、定时器等
2. **避免在 onUpdated 修改状态**：防止无限循环
3. **异步操作使用 try-catch**：处理错误情况
4. **使用 Composables 封装**：复用生命周期逻辑
5. **KeepAlive 组件注意数据刷新**：在 `onActivated` 中检查
6. **不要在异步回调中注册钩子**：必须同步调用
7. **合理使用 nextTick**：需要等待 DOM 更新时
8. **错误处理**：使用 `onErrorCaptured` 捕获子组件错误

---

## 参考资料

- [生命周期钩子](https://cn.vuejs.org/guide/essentials/lifecycle.html)
- [组合式 API 生命周期钩子](https://cn.vuejs.org/api/composition-api-lifecycle.html)
- [选项式 API 生命周期选项](https://cn.vuejs.org/api/options-lifecycle.html)
