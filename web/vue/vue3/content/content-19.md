# 模板引用：ref

> 掌握模板引用的使用，理解如何在组合式 API 中访问 DOM 元素和组件实例。

## 核心概念

模板引用（Template Refs）允许我们在渲染完成后直接访问 DOM 元素或子组件实例。

### 基础用法

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 创建 ref 引用
const inputRef = ref<HTMLInputElement>()

onMounted(() => {
  // 访问 DOM 元素
  inputRef.value?.focus()
})
</script>

<template>
  <!-- 通过 ref attribute 绑定 -->
  <input ref="inputRef">
</template>
```

**关键点**：
- ref 变量名必须与模板中的 ref attribute 值匹配
- 只能在组件挂载后访问
- 初始值为 `undefined`

---

## 访问 DOM 元素

### 基础元素引用

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const divRef = ref<HTMLDivElement>()
const inputRef = ref<HTMLInputElement>()
const buttonRef = ref<HTMLButtonElement>()

onMounted(() => {
  // 访问 DOM 属性
  console.log(divRef.value?.clientHeight)
  
  // 调用 DOM 方法
  inputRef.value?.focus()
  
  // 修改样式
  if (buttonRef.value) {
    buttonRef.value.style.color = 'red'
  }
})
</script>

<template>
  <div ref="divRef">内容</div>
  <input ref="inputRef" type="text">
  <button ref="buttonRef">按钮</button>
</template>
```

### 类型定义

```typescript
import { ref, Ref } from 'vue'

// 方式1：泛型指定类型
const inputRef = ref<HTMLInputElement>()

// 方式2：显式类型声明
const inputRef: Ref<HTMLInputElement | undefined> = ref()

// 访问时需要类型守卫
if (inputRef.value) {
  inputRef.value.focus() // 类型安全
}

// 或使用可选链
inputRef.value?.focus()
```

---

## 访问组件实例

### 子组件引用

```vue
<!-- Child.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

// 必须使用 defineExpose 暴露
defineExpose({
  count,
  increment
})
</script>

<template>
  <div>Count: {{ count }}</div>
</template>

<!-- Parent.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Child from './Child.vue'

const childRef = ref<InstanceType<typeof Child>>()

onMounted(() => {
  // 访问子组件暴露的内容
  console.log(childRef.value?.count)
  childRef.value?.increment()
})

function handleClick() {
  childRef.value?.increment()
}
</script>

<template>
  <Child ref="childRef" />
  <button @click="handleClick">父组件调用子方法</button>
</template>
```

### 组件类型推断

```typescript
// 获取组件实例类型
import MyComponent from './MyComponent.vue'

type MyComponentInstance = InstanceType<typeof MyComponent>

const componentRef = ref<MyComponentInstance>()

// 或使用 ComponentPublicInstance
import { ComponentPublicInstance } from 'vue'

interface MyComponentMethods {
  someMethod: () => void
}

const componentRef = ref<ComponentPublicInstance & MyComponentMethods>()
```

---

## v-for 中的 ref

### 数组引用

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const listRef = ref<HTMLLIElement[]>([])

onMounted(() => {
  // 访问所有列表项
  console.log(listRef.value.length)
  
  listRef.value.forEach((el, index) => {
    console.log(`Item ${index}:`, el.textContent)
  })
})
</script>

<template>
  <ul>
    <!-- ref 会自动收集到数组中 -->
    <li v-for="item in items" :key="item.id" ref="listRef">
      {{ item.text }}
    </li>
  </ul>
</template>
```

**注意**：
- ref 数组不保证顺序与源数组一致
- 每次更新时 ref 数组会被重置

### 组件数组引用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ItemComponent from './ItemComponent.vue'

type ItemInstance = InstanceType<typeof ItemComponent>

const itemRefs = ref<ItemInstance[]>([])

function focusItem(index: number) {
  itemRefs.value[index]?.focus()
}
</script>

<template>
  <ItemComponent
    v-for="item in items"
    :key="item.id"
    ref="itemRefs"
    :data="item"
  />
</template>
```

---

## 函数型 ref

使用函数动态设置 ref。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
])

const itemRefs = new Map<number, HTMLElement>()

function setItemRef(el: HTMLElement | null, id: number) {
  if (el) {
    itemRefs.set(id, el)
  } else {
    itemRefs.delete(id)
  }
}

function scrollToItem(id: number) {
  const el = itemRefs.get(id)
  el?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div
    v-for="item in items"
    :key="item.id"
    :ref="(el) => setItemRef(el, item.id)"
  >
    {{ item.name }}
  </div>
  
  <button @click="scrollToItem(2)">滚动到 Item 2</button>
</template>
```

**函数型 ref 的参数**：
- `el`: 元素或组件实例（卸载时为 `null`）
- 可以接收额外的参数（通过箭头函数传递）

---

## 动态 ref

根据条件动态绑定 ref。

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref<'input' | 'textarea'>('input')

const inputRef = ref<HTMLInputElement>()
const textareaRef = ref<HTMLTextAreaElement>()

const currentRef = computed(() => {
  return activeTab.value === 'input' ? inputRef : textareaRef
})

function focusCurrent() {
  currentRef.value.value?.focus()
}
</script>

<template>
  <button @click="activeTab = 'input'">Input</button>
  <button @click="activeTab = 'textarea'">Textarea</button>
  
  <input v-if="activeTab === 'input'" ref="inputRef">
  <textarea v-else ref="textareaRef"></textarea>
  
  <button @click="focusCurrent">聚焦当前</button>
</template>
```

---

## ref 与 TypeScript

### 严格类型检查

```typescript
import { ref, Ref } from 'vue'

// 基础元素
const inputRef = ref<HTMLInputElement>()

onMounted(() => {
  // ✅ 类型安全
  if (inputRef.value) {
    inputRef.value.focus()
    const value = inputRef.value.value
  }
  
  // ❌ 类型错误
  inputRef.value.focus() // 可能为 undefined
})

// 自定义元素
interface CustomElement extends HTMLElement {
  customMethod(): void
}

const customRef = ref<CustomElement>()

// 组件实例
import MyComponent from './MyComponent.vue'

const componentRef = ref<InstanceType<typeof MyComponent>>()
```

### 泛型 ref 工具

```typescript
// 创建类型安全的 ref 工具
function useElementRef<T extends HTMLElement>() {
  const elementRef = ref<T>()
  
  function ensureElement(): T {
    if (!elementRef.value) {
      throw new Error('Element not mounted')
    }
    return elementRef.value
  }
  
  return {
    elementRef,
    ensureElement
  }
}

// 使用
const { elementRef: inputRef, ensureElement } = useElementRef<HTMLInputElement>()

function handleClick() {
  const input = ensureElement()
  input.focus() // 类型安全，确保不为 undefined
}
```

---

## 常见使用场景

### 1. 自动聚焦

```vue
<script setup>
const inputRef = ref<HTMLInputElement>()

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="inputRef" type="text">
</template>
```

### 2. 滚动到元素

```vue
<script setup>
const targetRef = ref<HTMLElement>()

function scrollToTarget() {
  targetRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })
}
</script>

<template>
  <button @click="scrollToTarget">滚动到目标</button>
  <!-- 很多内容 -->
  <div ref="targetRef">目标元素</div>
</template>
```

### 3. 测量元素尺寸

```vue
<script setup>
const boxRef = ref<HTMLDivElement>()
const dimensions = reactive({
  width: 0,
  height: 0
})

onMounted(() => {
  if (boxRef.value) {
    dimensions.width = boxRef.value.clientWidth
    dimensions.height = boxRef.value.clientHeight
  }
})

// 监听尺寸变化
const resizeObserver = new ResizeObserver((entries) => {
  const entry = entries[0]
  dimensions.width = entry.contentRect.width
  dimensions.height = entry.contentRect.height
})

onMounted(() => {
  if (boxRef.value) {
    resizeObserver.observe(boxRef.value)
  }
})

onUnmounted(() => {
  resizeObserver.disconnect()
})
</script>

<template>
  <div ref="boxRef">
    尺寸：{{ dimensions.width }} x {{ dimensions.height }}
  </div>
</template>
```

### 4. 第三方库集成

```vue
<script setup>
import Chart from 'chart.js/auto'

const canvasRef = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

onMounted(() => {
  if (canvasRef.value) {
    chartInstance = new Chart(canvasRef.value, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
          label: 'Votes',
          data: [12, 19, 3]
        }]
      }
    })
  }
})

onUnmounted(() => {
  chartInstance?.destroy()
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
```

### 5. 表单验证

```vue
<script setup>
const formRef = ref<HTMLFormElement>()

function validate() {
  if (formRef.value) {
    // 使用原生验证 API
    const isValid = formRef.value.checkValidity()
    
    if (!isValid) {
      formRef.value.reportValidity()
    }
    
    return isValid
  }
  return false
}

function handleSubmit() {
  if (validate()) {
    // 提交表单
  }
}
</script>

<template>
  <form ref="formRef" @submit.prevent="handleSubmit">
    <input required type="email">
    <button type="submit">提交</button>
  </form>
</template>
```

---

## 易错点与边界情况

### 1. 访问时机

```vue
<script setup>
const divRef = ref<HTMLDivElement>()

// ❌ 错误：setup 阶段元素还未挂载
console.log(divRef.value) // undefined

// ✅ 正确：在 onMounted 中访问
onMounted(() => {
  console.log(divRef.value) // <div>...</div>
})

// ✅ 也可以在方法中访问（事件触发时已挂载）
function handleClick() {
  console.log(divRef.value)
}
</script>
```

### 2. v-if 条件渲染

```vue
<script setup>
const show = ref(false)
const elementRef = ref<HTMLElement>()

watch(elementRef, (el) => {
  // ⚠️ v-if 为 false 时，ref 值为 undefined
  console.log(el)
})

function showElement() {
  show.value = true
  
  // ❌ 错误：立即访问（DOM 还未更新）
  console.log(elementRef.value) // undefined
  
  // ✅ 正确：等待 DOM 更新
  nextTick(() => {
    console.log(elementRef.value) // <div>...</div>
  })
}
</script>

<template>
  <div v-if="show" ref="elementRef">内容</div>
</template>
```

### 3. 组件 key 变化

```vue
<script setup>
const key = ref(0)
const componentRef = ref()

watch(key, () => {
  // ⚠️ key 变化会导致组件重新创建
  // ref 会指向新的组件实例
  console.log(componentRef.value)
})
</script>

<template>
  <Child :key="key" ref="componentRef" />
</template>
```

### 4. v-for 中的 ref 数组

```vue
<script setup>
const items = ref([1, 2, 3])
const itemRefs = ref<HTMLElement[]>([])

watch(itemRefs, (refs) => {
  // ⚠️ 顺序可能与 items 不一致
  console.log(refs.length) // 可能不等于 items.length
})

onBeforeUpdate(() => {
  // v-for 更新前，ref 数组会被清空
  itemRefs.value = []
})
</script>

<template>
  <div v-for="item in items" :key="item" ref="itemRefs">
    {{ item }}
  </div>
</template>
```

---

## 前端工程实践

### 示例 1：可复用的 ref composable

```typescript
// useTemplateRef.ts
import { ref, onBeforeUpdate, Ref } from 'vue'

export function useTemplateRef<T = HTMLElement>() {
  const templateRef = ref<T>()
  
  // 确保元素已挂载
  function ensureMounted(): T {
    if (!templateRef.value) {
      throw new Error('Template ref not mounted')
    }
    return templateRef.value
  }
  
  // 等待元素挂载
  async function waitForMount(): Promise<T> {
    return new Promise((resolve) => {
      const check = () => {
        if (templateRef.value) {
          resolve(templateRef.value)
        } else {
          requestAnimationFrame(check)
        }
      }
      check()
    })
  }
  
  return {
    templateRef,
    ensureMounted,
    waitForMount
  }
}

// 使用
<script setup>
const { templateRef: inputRef, ensureMounted } = useTemplateRef<HTMLInputElement>()

function handleClick() {
  const input = ensureMounted()
  input.focus()
}
</script>

<template>
  <input ref="inputRef">
  <button @click="handleClick">聚焦</button>
</template>
```

### 示例 2：自动聚焦指令

```typescript
// vFocus.ts
import { Directive } from 'vue'

export const vFocus: Directive = {
  mounted(el) {
    el.focus()
  }
}

// 使用
<script setup>
import { vFocus } from './directives/vFocus'
</script>

<template>
  <input v-focus>
</template>
```

### 示例 3：虚拟滚动

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Item {
  id: number
  text: string
}

const props = defineProps<{
  items: Item[]
  itemHeight: number
}>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(0)

// 可见项的索引范围
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const end = Math.ceil((scrollTop.value + containerHeight.value) / props.itemHeight)
  return { start, end }
})

// 可见的项
const visibleItems = computed(() => {
  return props.items.slice(
    visibleRange.value.start,
    visibleRange.value.end
  )
})

function handleScroll() {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
  }
}

onMounted(() => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-list"
    @scroll="handleScroll"
  >
    <div :style="{ height: items.length * itemHeight + 'px' }">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        :style="{
          position: 'absolute',
          top: (visibleRange.start + item.id) * itemHeight + 'px',
          height: itemHeight + 'px'
        }"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>
```

### 示例 4：拖拽排序

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Item {
  id: number
  text: string
}

const items = ref<Item[]>([
  { id: 1, text: 'Item 1' },
  { id: 2, text: 'Item 2' },
  { id: 3, text: 'Item 3' }
])

const itemRefs = ref<HTMLElement[]>([])
let draggedIndex: number | null = null

function handleDragStart(index: number) {
  draggedIndex = index
}

function handleDragOver(event: DragEvent, index: number) {
  event.preventDefault()
  
  if (draggedIndex === null || draggedIndex === index) return
  
  // 交换元素
  const draggedItem = items.value[draggedIndex]
  items.value.splice(draggedIndex, 1)
  items.value.splice(index, 0, draggedItem)
  
  draggedIndex = index
}

function handleDragEnd() {
  draggedIndex = null
}
</script>

<template>
  <div
    v-for="(item, index) in items"
    :key="item.id"
    ref="itemRefs"
    draggable="true"
    @dragstart="handleDragStart(index)"
    @dragover="handleDragOver($event, index)"
    @dragend="handleDragEnd"
    class="item"
  >
    {{ item.text }}
  </div>
</template>
```

---

## 最佳实践

1. **类型安全**：使用 TypeScript 泛型指定 ref 类型
2. **访问时机**：在 `onMounted` 或事件处理中访问
3. **空值检查**：使用可选链或类型守卫
4. **及时清理**：在 `onUnmounted` 中清理相关资源
5. **避免过度使用**：优先使用声明式方法
6. **组件暴露**：使用 `defineExpose` 明确暴露接口
7. **函数型 ref**：处理动态场景
8. **Composable 封装**：提取可复用的 ref 逻辑

---

## ref vs 自定义指令

| 场景 | 推荐方案 |
|------|---------|
| 简单 DOM 操作 | 自定义指令 |
| 需要访问组件逻辑 | ref |
| 第三方库集成 | ref |
| 可复用的 DOM 行为 | 自定义指令 |
| 需要精确控制时机 | ref |

---

## 参考资料

- [模板引用](https://cn.vuejs.org/guide/essentials/template-refs.html)
- [ref API](https://cn.vuejs.org/api/reactivity-core.html#ref)
- [TypeScript 与组合式 API](https://cn.vuejs.org/guide/typescript/composition-api.html)
