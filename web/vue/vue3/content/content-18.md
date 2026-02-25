# 响应式 API 进阶

> 掌握 Vue 3 高级响应式 API，理解浅层响应式、只读、原始对象访问等概念。

## 核心概念

Vue 3 提供了一系列进阶响应式 API，用于优化性能和实现特殊需求。

---

## shallowRef 与 shallowReactive

### shallowRef

只有 `.value` 的访问是响应式的，`.value` 内部的属性不是响应式的。

```typescript
import { shallowRef, triggerRef } from 'vue'

const state = shallowRef({
  count: 0,
  nested: { value: 1 }
})

// ✅ 响应式：替换整个对象
state.value = { count: 1, nested: { value: 2 } }

// ❌ 不响应式：修改内部属性
state.value.count = 2 // 不会触发更新

// 手动触发更新
state.value.count = 2
triggerRef(state) // 强制触发更新
```

**使用场景**：
- 大型对象或数组（避免深层响应式的开销）
- 与外部库集成（不需要深层响应式）

```typescript
// 示例：大型数据列表
const largeList = shallowRef([
  { id: 1, name: 'Item 1', data: { /* 大量数据 */ } },
  // ... 10000 items
])

// 替换整个列表触发更新
largeList.value = newList

// 内部修改不触发更新（性能更好）
largeList.value[0].name = 'Updated' // 不触发
```

### shallowReactive

只有根级属性是响应式的，嵌套对象不是响应式的。

```typescript
import { shallowReactive } from 'vue'

const state = shallowReactive({
  count: 0,
  nested: { value: 1 }
})

// ✅ 响应式：根级属性
state.count = 1 // 触发更新

// ❌ 不响应式：嵌套属性
state.nested.value = 2 // 不触发更新

// ✅ 响应式：替换整个嵌套对象
state.nested = { value: 2 } // 触发更新
```

**对比**：

| API | ref | shallowRef | reactive | shallowReactive |
|-----|-----|-----------|----------|-----------------|
| 深层响应式 | ✅ | ❌ | ✅ | ❌ |
| `.value` 访问 | ✅ | ✅ | ❌ | ❌ |
| 性能 | 中 | 高 | 低 | 中 |

---

## readonly 与 shallowReadonly

### readonly

创建深层只读的响应式代理。

```typescript
import { reactive, readonly } from 'vue'

const original = reactive({
  count: 0,
  nested: { value: 1 }
})

const copy = readonly(original)

// ❌ 不能修改
copy.count = 1 // 警告
copy.nested.value = 2 // 警告

// ✅ 可以通过原始对象修改
original.count = 1 // copy.count 也会更新
```

**使用场景**：
- 防止子组件修改 props
- 共享只读状态
- 实现单向数据流

```typescript
// 示例：只读的全局配置
const config = reactive({
  apiUrl: 'https://api.example.com',
  timeout: 5000
})

// 导出只读版本
export const readonlyConfig = readonly(config)

// 其他模块无法修改配置
import { readonlyConfig } from './config'
readonlyConfig.apiUrl = '...' // 警告
```

### shallowReadonly

只有根级属性是只读的，嵌套对象可以修改。

```typescript
import { shallowReadonly } from 'vue'

const state = shallowReadonly({
  count: 0,
  nested: { value: 1 }
})

// ❌ 不能修改根级属性
state.count = 1 // 警告

// ✅ 可以修改嵌套属性
state.nested.value = 2 // 允许
```

---

## toRaw 与 markRaw

### toRaw

返回响应式代理的原始对象。

```typescript
import { reactive, toRaw } from 'vue'

const original = { count: 0 }
const state = reactive(original)

console.log(toRaw(state) === original) // true

// 使用场景：传递给不需要响应式的第三方库
const rawState = toRaw(state)
someLibrary.process(rawState) // 避免响应式开销
```

**应用场景**：
```typescript
// 1. 性能优化：避免不必要的响应式追踪
function heavyComputation(data) {
  const raw = toRaw(data) // 使用原始数据，避免响应式开销
  // 大量计算...
  return result
}

// 2. 与第三方库集成
import Chart from 'chart.js'

const chartData = reactive({ /* ... */ })
const chart = new Chart(ctx, {
  data: toRaw(chartData) // 传递原始数据
})

// 3. 深拷贝
const original = reactive({ nested: { value: 1 } })
const clone = JSON.parse(JSON.stringify(toRaw(original)))
```

### markRaw

标记对象，使其永远不会被转换为响应式。

```typescript
import { reactive, markRaw, isReactive } from 'vue'

const obj = markRaw({ count: 0 })
const state = reactive({
  obj // obj 不会变成响应式
})

console.log(isReactive(state.obj)) // false

// 使用场景：第三方库实例
const chart = markRaw(new Chart(ctx, options))
const state = reactive({
  chart // chart 保持原样，不会被代理
})
```

**常见场景**：
```typescript
// 1. 第三方库实例
class ExternalLibrary {
  constructor() {
    this.instance = new SomeLibrary()
  }
}

const lib = markRaw(new ExternalLibrary())

const state = reactive({
  library: lib // 不会被代理
})

// 2. 大型不可变对象
const largeImmutableData = markRaw({
  // 大量只读数据
})

// 3. DOM 元素引用
const domElement = markRaw(document.querySelector('#app'))
```

---

## customRef

创建自定义的 ref，完全控制依赖追踪和触发更新。

```typescript
import { customRef } from 'vue'

function useDebouncedRef<T>(value: T, delay = 200) {
  let timeoutId: number | null = null
  
  return customRef((track, trigger) => ({
    get() {
      // 追踪依赖
      track()
      return value
    },
    set(newValue: T) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        value = newValue
        // 触发更新
        trigger()
      }, delay) as unknown as number
    }
  }))
}

// 使用
<script setup>
const searchText = useDebouncedRef('', 300)

watch(searchText, (newValue) => {
  // 300ms 后才会触发
  console.log('搜索:', newValue)
})
</script>

<template>
  <input v-model="searchText">
</template>
```

### 自定义 ref 示例

#### 1. 本地存储 ref

```typescript
function useStorageRef(key: string, defaultValue: any) {
  return customRef((track, trigger) => ({
    get() {
      track()
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : defaultValue
    },
    set(newValue) {
      localStorage.setItem(key, JSON.stringify(newValue))
      trigger()
    }
  }))
}

// 使用
const theme = useStorageRef('theme', 'light')
theme.value = 'dark' // 自动保存到 localStorage
```

#### 2. 验证 ref

```typescript
function useValidatedRef<T>(
  initialValue: T,
  validator: (value: T) => boolean
) {
  let value = initialValue
  
  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue: T) {
      if (validator(newValue)) {
        value = newValue
        trigger()
      } else {
        console.warn('验证失败:', newValue)
      }
    }
  }))
}

// 使用
const age = useValidatedRef(0, (v) => v >= 0 && v <= 120)
age.value = 25  // ✅
age.value = 150 // ❌ 验证失败，不更新
```

#### 3. 限流 ref

```typescript
function useThrottledRef<T>(value: T, delay = 200) {
  let lastTrigger = 0
  
  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue: T) {
      const now = Date.now()
      
      if (now - lastTrigger >= delay) {
        value = newValue
        lastTrigger = now
        trigger()
      }
    }
  }))
}
```

---

## effectScope

管理响应式副作用的作用域。

```typescript
import { effectScope, ref, watchEffect } from 'vue'

const scope = effectScope()

scope.run(() => {
  const count = ref(0)
  
  // 这些副作用会被收集到 scope 中
  watchEffect(() => {
    console.log(count.value)
  })
  
  watch(count, () => {
    console.log('count changed')
  })
})

// 停止 scope 中的所有副作用
scope.stop()
```

### 使用场景

#### 1. 插件系统

```typescript
class PluginManager {
  private scopes = new Map<string, EffectScope>()
  
  install(pluginId: string, plugin: Plugin) {
    // 为每个插件创建独立的作用域
    const scope = effectScope()
    
    scope.run(() => {
      plugin.setup()
    })
    
    this.scopes.set(pluginId, scope)
  }
  
  uninstall(pluginId: string) {
    const scope = this.scopes.get(pluginId)
    if (scope) {
      // 清理插件的所有副作用
      scope.stop()
      this.scopes.delete(pluginId)
    }
  }
}
```

#### 2. 可分离的 Composable

```typescript
function useFeature() {
  // 创建独立的作用域
  const scope = effectScope()
  
  const state = scope.run(() => {
    const count = ref(0)
    
    watchEffect(() => {
      console.log('count:', count.value)
    })
    
    return { count }
  })
  
  function dispose() {
    scope.stop()
  }
  
  return {
    ...state,
    dispose
  }
}

// 使用
const feature = useFeature()
feature.count.value++

// 不再需要时清理
feature.dispose()
```

#### 3. 分离的响应式上下文

```typescript
function createReactiveContext() {
  const scope = effectScope(true) // true = 可分离
  
  const context = scope.run(() => {
    const state = reactive({
      users: [],
      loading: false
    })
    
    async function fetchUsers() {
      state.loading = true
      try {
        state.users = await api.getUsers()
      } finally {
        state.loading = false
      }
    }
    
    // 自动获取数据
    watchEffect(() => {
      fetchUsers()
    })
    
    return {
      state: readonly(state),
      fetchUsers
    }
  })
  
  return {
    ...context,
    dispose: () => scope.stop()
  }
}
```

---

## isRef、isReactive、isReadonly、isProxy

检查值的响应式状态。

```typescript
import {
  ref,
  reactive,
  readonly,
  isRef,
  isReactive,
  isReadonly,
  isProxy
} from 'vue'

const refValue = ref(0)
const reactiveValue = reactive({})
const readonlyValue = readonly({})

console.log(isRef(refValue)) // true
console.log(isReactive(reactiveValue)) // true
console.log(isReadonly(readonlyValue)) // true
console.log(isProxy(reactiveValue)) // true
console.log(isProxy(readonlyValue)) // true

// 使用场景：类型守卫
function processValue(value: any) {
  if (isRef(value)) {
    console.log(value.value)
  } else if (isReactive(value)) {
    console.log(value)
  }
}
```

---

## 前端工程实践

### 示例 1：大数据性能优化

```typescript
// useLargeList.ts
import { shallowRef, triggerRef } from 'vue'

export function useLargeList<T>(initialData: T[] = []) {
  // 使用 shallowRef 避免深层响应式
  const list = shallowRef<T[]>(initialData)
  
  function addItem(item: T) {
    list.value.push(item)
    // 手动触发更新
    triggerRef(list)
  }
  
  function updateItem(index: number, item: T) {
    list.value[index] = item
    triggerRef(list)
  }
  
  function removeItem(index: number) {
    list.value.splice(index, 1)
    triggerRef(list)
  }
  
  function replaceAll(newList: T[]) {
    // 替换整个数组自动触发更新
    list.value = newList
  }
  
  return {
    list,
    addItem,
    updateItem,
    removeItem,
    replaceAll
  }
}
```

### 示例 2：状态快照

```typescript
// useSnapshot.ts
import { toRaw, reactive } from 'vue'

export function useSnapshot<T extends object>(initialState: T) {
  const state = reactive(initialState)
  const snapshots: T[] = []
  let currentIndex = -1
  
  function takeSnapshot() {
    // 使用 toRaw 获取原始对象并深拷贝
    const snapshot = JSON.parse(JSON.stringify(toRaw(state)))
    
    // 清除之后的快照
    snapshots.splice(currentIndex + 1)
    snapshots.push(snapshot)
    currentIndex++
  }
  
  function undo() {
    if (currentIndex > 0) {
      currentIndex--
      Object.assign(state, snapshots[currentIndex])
    }
  }
  
  function redo() {
    if (currentIndex < snapshots.length - 1) {
      currentIndex++
      Object.assign(state, snapshots[currentIndex])
    }
  }
  
  const canUndo = computed(() => currentIndex > 0)
  const canRedo = computed(() => currentIndex < snapshots.length - 1)
  
  // 初始快照
  takeSnapshot()
  
  return {
    state,
    takeSnapshot,
    undo,
    redo,
    canUndo,
    canRedo
  }
}

// 使用
<script setup>
const { state, takeSnapshot, undo, redo, canUndo, canRedo } = useSnapshot({
  text: '',
  count: 0
})

function handleChange() {
  // 每次修改后保存快照
  takeSnapshot()
}
</script>

<template>
  <input v-model="state.text" @change="handleChange">
  <button @click="undo" :disabled="!canUndo">撤销</button>
  <button @click="redo" :disabled="!canRedo">重做</button>
</template>
```

### 示例 3：第三方库集成

```typescript
// useChart.ts
import { shallowRef, watch, markRaw, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'

export function useChart(
  canvasRef: Ref<HTMLCanvasElement | undefined>,
  options: ChartConfiguration
) {
  // 使用 markRaw 防止 Chart 实例被代理
  const chartInstance = shallowRef<Chart | null>(null)
  
  watch(canvasRef, (canvas) => {
    if (canvas) {
      // 清理旧实例
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }
      
      // 创建新实例
      chartInstance.value = markRaw(new Chart(canvas, options))
    }
  })
  
  function updateData(newData: any) {
    if (chartInstance.value) {
      chartInstance.value.data = newData
      chartInstance.value.update()
    }
  }
  
  onUnmounted(() => {
    if (chartInstance.value) {
      chartInstance.value.destroy()
    }
  })
  
  return {
    chartInstance: readonly(chartInstance),
    updateData
  }
}
```

### 示例 4：访问控制

```typescript
// useAccessControl.ts
import { reactive, readonly, toRaw } from 'vue'

export function useAccessControl<T extends object>(data: T) {
  const state = reactive(data)
  
  // 创建只读副本供外部使用
  const readonlyState = readonly(state)
  
  // 提供受控的修改方法
  function update(updater: (draft: T) => void) {
    // 使用 toRaw 避免响应式追踪
    updater(toRaw(state))
  }
  
  function reset() {
    Object.assign(state, data)
  }
  
  return {
    state: readonlyState,
    update,
    reset
  }
}

// 使用
<script setup>
const { state, update } = useAccessControl({
  count: 0,
  name: 'Vue'
})

// ❌ 不能直接修改
state.count++ // 警告

// ✅ 通过 update 方法修改
update((draft) => {
  draft.count++
  draft.name = 'Vue 3'
})
</script>
```

---

## 性能对比

```typescript
// 测试：10000 个对象的响应式转换
const data = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  nested: { value: i }
}))

// 1. reactive: 深层响应式（最慢）
const reactive1 = reactive(data)

// 2. shallowReactive: 浅层响应式（较快）
const reactive2 = shallowReactive(data)

// 3. shallowRef: 只有 .value 响应式（最快）
const reactive3 = shallowRef(data)

// 4. markRaw: 不响应式（最快，但不响应）
const reactive4 = markRaw(data)
```

**建议**：
- 小数据：使用 `reactive` 或 `ref`
- 大数据只读：使用 `readonly`
- 大数据可变：使用 `shallowRef` + `triggerRef`
- 第三方库：使用 `markRaw`

---

## 最佳实践

1. **优先使用基础 API**：ref、reactive 足够应对大多数场景
2. **性能优化时使用浅层 API**：大数据或频繁更新时
3. **使用 readonly 防止意外修改**：提供只读视图
4. **第三方库使用 markRaw**：避免不必要的代理
5. **customRef 用于特殊需求**：防抖、节流、验证等
6. **effectScope 管理复杂副作用**：插件系统、可分离逻辑
7. **使用检查函数做类型守卫**：isRef、isReactive 等
8. **toRaw 用于性能敏感操作**：大量计算、深拷贝

---

## 参考资料

- [响应式 API：进阶](https://cn.vuejs.org/api/reactivity-advanced.html)
- [响应式 API：工具](https://cn.vuejs.org/api/reactivity-utilities.html)
- [深入响应式系统](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)
