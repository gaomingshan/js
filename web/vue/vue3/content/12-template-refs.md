# 第 12 节：模板引用

## 概述

模板引用（Template Refs）允许我们直接访问 DOM 元素或子组件实例。在需要直接操作 DOM 或调用组件方法时使用。

## 一、访问 DOM 元素

### 1.1 基本用法

```vue
<template>
  <input ref="inputRef" />
  <button @click="focusInput">聚焦输入框</button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 声明一个 ref 来存放元素引用
// 变量名必须与模板中的 ref 值一致
const inputRef = ref(null)

onMounted(() => {
  // mounted 后才能访问 DOM
  console.log(inputRef.value)  // <input>
})

function focusInput() {
  inputRef.value.focus()
}
</script>
```

### 1.2 为什么需要 onMounted

```vue
<script setup>
import { ref, onMounted } from 'vue'

const divRef = ref(null)

// ❌ setup 时 DOM 还未创建
console.log(divRef.value)  // null

// ✅ mounted 后 DOM 已创建
onMounted(() => {
  console.log(divRef.value)  // <div>
})
</script>

<template>
  <div ref="divRef">内容</div>
</template>
```

## 二、访问组件实例

### 2.1 基本用法

```vue
<!-- 父组件 -->
<template>
  <ChildComponent ref="childRef" />
  <button @click="callChildMethod">调用子组件方法</button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref(null)

onMounted(() => {
  console.log(childRef.value)  // 组件实例
})

function callChildMethod() {
  childRef.value.someMethod()
}
</script>
```

### 2.2 子组件需要 defineExpose

```vue
<!-- 子组件 ChildComponent.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)

function someMethod() {
  console.log('子组件方法被调用')
}

function increment() {
  count.value++
}

// 使用 <script setup> 时，组件默认是关闭的
// 必须用 defineExpose 暴露给父组件
defineExpose({
  someMethod,
  increment,
  count
})
</script>
```

## 三、v-for 中的 ref

### 3.1 收集多个引用

```vue
<template>
  <ul>
    <li v-for="item in list" :key="item.id" ref="itemRefs">
      {{ item.text }}
    </li>
  </ul>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const list = ref([
  { id: 1, text: 'A' },
  { id: 2, text: 'B' },
  { id: 3, text: 'C' }
])

// 存储所有 li 元素
const itemRefs = ref([])

onMounted(() => {
  console.log(itemRefs.value)  // [li, li, li]
})
</script>
```

### 3.2 函数形式的 ref

```vue
<template>
  <ul>
    <li 
      v-for="item in list" 
      :key="item.id"
      :ref="(el) => setItemRef(el, item.id)"
    >
      {{ item.text }}
    </li>
  </ul>
</template>

<script setup>
import { ref } from 'vue'

const list = ref([
  { id: 1, text: 'A' },
  { id: 2, text: 'B' }
])

const itemRefsMap = ref({})

function setItemRef(el, id) {
  if (el) {
    itemRefsMap.value[id] = el
  }
}

// 通过 id 访问特定元素
function scrollToItem(id) {
  itemRefsMap.value[id]?.scrollIntoView()
}
</script>
```

## 四、动态 ref

```vue
<template>
  <input :ref="(el) => dynamicRef = el" />
  
  <!-- 或者 -->
  <input :ref="setRef" />
</template>

<script setup>
import { ref } from 'vue'

let dynamicRef = null

function setRef(el) {
  dynamicRef = el
  // 可以在这里执行初始化逻辑
}
</script>
```

## 五、与 watchEffect 配合

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const inputRef = ref(null)

// watchEffect 会自动追踪依赖
// 第一次运行时 inputRef.value 是 null
// DOM 挂载后会再次运行
watchEffect(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
})
</script>

<template>
  <input ref="inputRef" />
</template>
```

## 六、实用示例

### 6.1 自动聚焦

```vue
<template>
  <input ref="inputRef" v-model="value" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const inputRef = ref(null)
const value = ref('')

onMounted(() => {
  inputRef.value?.focus()
})
</script>
```

### 6.2 滚动到元素

```vue
<template>
  <div>
    <button @click="scrollToBottom">滚动到底部</button>
    <div ref="containerRef" class="container">
      <div v-for="i in 100" :key="i">Item {{ i }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const containerRef = ref(null)

function scrollToBottom() {
  const el = containerRef.value
  el.scrollTop = el.scrollHeight
}
</script>
```

### 6.3 获取元素尺寸

```vue
<template>
  <div ref="boxRef">内容</div>
  <p>宽度: {{ width }}px, 高度: {{ height }}px</p>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const boxRef = ref(null)
const width = ref(0)
const height = ref(0)

let observer = null

onMounted(() => {
  observer = new ResizeObserver((entries) => {
    const entry = entries[0]
    width.value = entry.contentRect.width
    height.value = entry.contentRect.height
  })
  observer.observe(boxRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>
```

### 6.4 集成第三方库

```vue
<template>
  <div ref="chartRef" style="width: 600px; height: 400px;"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps(['data'])
const chartRef = ref(null)
let chart = null

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption({
    xAxis: { type: 'category', data: props.data.labels },
    yAxis: { type: 'value' },
    series: [{ data: props.data.values, type: 'bar' }]
  })
})

watch(() => props.data, (newData) => {
  chart?.setOption({
    xAxis: { data: newData.labels },
    series: [{ data: newData.values }]
  })
}, { deep: true })

onUnmounted(() => {
  chart?.dispose()
})
</script>
```

### 6.5 表单验证

```vue
<template>
  <form ref="formRef" @submit.prevent="handleSubmit">
    <input ref="nameRef" v-model="name" required />
    <input ref="emailRef" v-model="email" type="email" required />
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const formRef = ref(null)
const nameRef = ref(null)
const emailRef = ref(null)
const name = ref('')
const email = ref('')

function handleSubmit() {
  // 使用原生表单验证
  if (!formRef.value.checkValidity()) {
    // 聚焦第一个无效输入
    const firstInvalid = formRef.value.querySelector(':invalid')
    firstInvalid?.focus()
    return
  }
  
  // 提交表单...
}
</script>
```

## 七、注意事项

### 7.1 ref 的时机

```vue
<script setup>
import { ref, onMounted, nextTick } from 'vue'

const show = ref(false)
const divRef = ref(null)

async function showAndFocus() {
  show.value = true
  
  // ❌ DOM 还未更新
  console.log(divRef.value)  // null
  
  // ✅ 等待 DOM 更新
  await nextTick()
  console.log(divRef.value)  // <div>
}
</script>

<template>
  <div v-if="show" ref="divRef">内容</div>
</template>
```

### 7.2 避免在模板中滥用 ref

```vue
<!-- ❌ 不好：为了读取值使用 ref -->
<template>
  <div ref="divRef">{{ divRef?.textContent }}</div>
</template>

<!-- ✅ 好：使用响应式数据 -->
<template>
  <div>{{ content }}</div>
</template>
```

## 八、总结

| 场景 | 用法 |
|------|------|
| 访问 DOM | `ref="elementRef"` + `elementRef.value` |
| 访问子组件 | `ref="childRef"` + `defineExpose` |
| v-for 中 | 数组 ref 或函数 ref |
| 时机 | onMounted 后或 nextTick 后 |

## 参考资料

- [模板引用](https://vuejs.org/guide/essentials/template-refs.html)

---

**下一节** → [第 13 节：组合式函数](./13-composables.md)
