# 第 3 节：响应式基础

## 概述

响应式是 Vue 的核心特性：当数据变化时，视图自动更新。Vue 3 提供了 `ref` 和 `reactive` 两种创建响应式数据的方式，以及 `computed` 和 `watch` 用于派生和监听数据。

## 一、ref

### 1.1 基本用法

```vue
<template>
  <p>计数: {{ count }}</p>
  <button @click="increment">+1</button>
</template>

<script setup>
import { ref } from 'vue'

// 创建响应式引用
const count = ref(0)

function increment() {
  // 在 JS 中需要 .value 访问
  count.value++
}
// 在模板中自动解包，不需要 .value
</script>
```

### 1.2 ref 的特点

```javascript
import { ref } from 'vue'

// 可以包装任意类型
const num = ref(0)           // 数字
const str = ref('hello')     // 字符串
const bool = ref(true)       // 布尔
const obj = ref({ a: 1 })    // 对象
const arr = ref([1, 2, 3])   // 数组

// 访问和修改
num.value = 10
obj.value.a = 2
arr.value.push(4)
```

### 1.3 为什么需要 .value

```
┌─────────────────────────────────────────────────────────────┐
│   JavaScript 基本类型是按值传递，无法追踪变化                  │
│                                                             │
│   let count = 0                                             │
│   count = 1  // Vue 无法知道 count 变了                      │
│                                                             │
│   ref 用对象包装，追踪 .value 的变化                          │
│                                                             │
│   const count = ref(0)  // { value: 0 }                     │
│   count.value = 1       // Vue 可以追踪！                    │
└─────────────────────────────────────────────────────────────┘
```

## 二、reactive

### 2.1 基本用法

```vue
<template>
  <p>{{ state.name }} - {{ state.age }}岁</p>
  <button @click="state.age++">长大</button>
</template>

<script setup>
import { reactive } from 'vue'

// 创建响应式对象
const state = reactive({
  name: 'Vue',
  age: 3
})
// 直接访问属性，不需要 .value
</script>
```

### 2.2 reactive 的限制

```javascript
import { reactive } from 'vue'

// ✅ 只能用于对象类型
const obj = reactive({ count: 0 })
const arr = reactive([1, 2, 3])
const map = reactive(new Map())

// ❌ 不能用于基本类型
const num = reactive(0)  // 警告，不会是响应式的

// ❌ 不能替换整个对象（会丢失响应式）
let state = reactive({ count: 0 })
state = reactive({ count: 1 })  // 原来的响应式丢失

// ❌ 解构会丢失响应式
const { count } = reactive({ count: 0 })
// count 不是响应式的
```

## 三、ref vs reactive

### 3.1 对比

| 特性 | ref | reactive |
|------|-----|----------|
| 适用类型 | 任意类型 | 仅对象类型 |
| 访问方式 | `.value` | 直接访问 |
| 可替换整体 | ✅ 可以 | ❌ 会丢失响应式 |
| 解构 | 保持响应式 | 丢失响应式 |

### 3.2 选择建议

```javascript
// 推荐：基本类型用 ref
const count = ref(0)
const name = ref('Vue')

// 推荐：相关数据组合用 reactive
const form = reactive({
  username: '',
  password: '',
  remember: false
})

// 或者统一用 ref（风格一致）
const form = ref({
  username: '',
  password: ''
})
// 访问时 form.value.username
```

## 四、computed 计算属性

### 4.1 基本用法

```vue
<template>
  <p>名: {{ firstName }}</p>
  <p>姓: {{ lastName }}</p>
  <p>全名: {{ fullName }}</p>
</template>

<script setup>
import { ref, computed } from 'vue'

const firstName = ref('尤')
const lastName = ref('雨溪')

// 计算属性：基于依赖自动缓存
const fullName = computed(() => {
  return firstName.value + lastName.value
})
</script>
```

### 4.2 可写计算属性

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('尤')
const lastName = ref('雨溪')

const fullName = computed({
  get() {
    return firstName.value + lastName.value
  },
  set(value) {
    // 拆分全名
    [firstName.value, lastName.value] = value.split('')
  }
})

// 可以直接赋值
fullName.value = '张三'  // firstName = '张', lastName = '三'
</script>
```

### 4.3 computed vs 方法

```vue
<template>
  <!-- computed：缓存，依赖不变不重新计算 -->
  <p>{{ fullName }}</p>
  <p>{{ fullName }}</p>  <!-- 使用缓存 -->
  
  <!-- 方法：每次渲染都执行 -->
  <p>{{ getFullName() }}</p>
  <p>{{ getFullName() }}</p>  <!-- 再次执行 -->
</template>

<script setup>
import { ref, computed } from 'vue'

const firstName = ref('尤')
const lastName = ref('雨溪')

const fullName = computed(() => firstName.value + lastName.value)

function getFullName() {
  return firstName.value + lastName.value
}
</script>
```

> **💡 何时用 computed**  
> 当结果依赖其他响应式数据，且需要缓存时用 computed。  
> 如果不需要缓存或有副作用，用方法。

## 五、watch 侦听器

### 5.1 侦听 ref

```vue
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)

// 侦听单个 ref
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} → ${newVal}`)
})

// 带选项
watch(count, (newVal) => {
  console.log(newVal)
}, {
  immediate: true,  // 立即执行一次
  deep: false       // 深度监听（ref 基本类型不需要）
})
</script>
```

### 5.2 侦听 reactive

```vue
<script setup>
import { reactive, watch } from 'vue'

const state = reactive({ count: 0, name: 'Vue' })

// 侦听整个 reactive 对象（自动深度监听）
watch(state, (newVal) => {
  console.log(newVal)
})

// 侦听 reactive 的某个属性（用 getter 函数）
watch(
  () => state.count,
  (newVal) => {
    console.log('count:', newVal)
  }
)
</script>
```

### 5.3 侦听多个源

```vue
<script setup>
import { ref, watch } from 'vue'

const firstName = ref('尤')
const lastName = ref('雨溪')

watch(
  [firstName, lastName],
  ([newFirst, newLast], [oldFirst, oldLast]) => {
    console.log(`${oldFirst}${oldLast} → ${newFirst}${newLast}`)
  }
)
</script>
```

### 5.4 watchEffect

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const count = ref(0)
const name = ref('Vue')

// 自动追踪依赖，立即执行
watchEffect(() => {
  console.log(`count: ${count.value}, name: ${name.value}`)
})
// 首次立即执行，之后 count 或 name 变化时执行
</script>
```

### 5.5 watch vs watchEffect

| 特性 | watch | watchEffect |
|------|-------|-------------|
| 指定依赖 | 显式指定 | 自动追踪 |
| 立即执行 | 需要 `immediate: true` | 默认立即执行 |
| 访问旧值 | ✅ 可以 | ❌ 不可以 |
| 适用场景 | 需要旧值对比、条件执行 | 简单副作用 |

## 六、停止侦听

```vue
<script setup>
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)

// watch 返回停止函数
const stopWatch = watch(count, (val) => {
  console.log(val)
})

// watchEffect 也一样
const stopEffect = watchEffect(() => {
  console.log(count.value)
})

// 停止侦听
stopWatch()
stopEffect()
</script>
```

## 七、响应式工具函数

### 7.1 toRef / toRefs

```javascript
import { reactive, toRef, toRefs } from 'vue'

const state = reactive({
  name: 'Vue',
  version: 3
})

// toRef：创建单个属性的 ref
const nameRef = toRef(state, 'name')
nameRef.value = 'Vue 3'  // state.name 也会变

// toRefs：解构时保持响应式
const { name, version } = toRefs(state)
name.value = 'Vue 3'  // state.name 也会变
```

### 7.2 isRef / isReactive

```javascript
import { ref, reactive, isRef, isReactive } from 'vue'

const count = ref(0)
const state = reactive({ a: 1 })

isRef(count)       // true
isReactive(state)  // true
```

### 7.3 unref

```javascript
import { ref, unref } from 'vue'

const count = ref(0)

// 如果是 ref 则返回 .value，否则返回原值
unref(count)  // 0
unref(123)    // 123
```

## 八、总结

| API | 用途 | 访问方式 |
|-----|------|----------|
| `ref` | 创建响应式引用 | `.value` |
| `reactive` | 创建响应式对象 | 直接访问 |
| `computed` | 派生计算值（缓存） | `.value` |
| `watch` | 侦听数据变化 | 回调函数 |
| `watchEffect` | 自动追踪副作用 | 回调函数 |

## 参考资料

- [响应式基础](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [计算属性](https://vuejs.org/guide/essentials/computed.html)
- [侦听器](https://vuejs.org/guide/essentials/watchers.html)

---

**下一节** → [第 4 节：事件与表单](./04-events-forms.md)
