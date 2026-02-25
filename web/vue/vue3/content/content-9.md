# 事件通信：Emits

> 事件是子组件向父组件通信的主要方式，defineEmits 提供了类型安全的事件声明。

## 核心概念

子组件通过触发事件向父组件传递消息或数据，父组件通过监听这些事件做出响应。

### 定义和触发事件

```vue
<!-- Child.vue -->
<script setup lang="ts">
// 定义事件
const emit = defineEmits<{
  'increment': []                      // 无参数
  'update': [value: number]            // 单个参数
  'submit': [data: FormData, id: number] // 多个参数
}>()

function handleClick() {
  emit('increment')
}

function handleUpdate(value: number) {
  emit('update', value)
}

function handleSubmit() {
  emit('submit', formData, userId)
}
</script>

<template>
  <button @click="handleClick">+1</button>
  <input @input="handleUpdate($event.target.value)">
  <button @click="handleSubmit">提交</button>
</template>
```

### 监听事件

```vue
<!-- Parent.vue -->
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const count = ref(0)

function handleIncrement() {
  count.value++
}

function handleUpdate(value: number) {
  console.log('Updated:', value)
}

function handleSubmit(data: FormData, id: number) {
  console.log('Submit:', data, id)
}
</script>

<template>
  <Child
    @increment="handleIncrement"
    @update="handleUpdate"
    @submit="handleSubmit"
  />
  
  <!-- 内联处理器 -->
  <Child
    @increment="count++"
    @update="value => console.log(value)"
  />
</template>
```

---

## defineEmits 的多种用法

### 运行时声明

```vue
<script setup>
// 数组形式
const emit = defineEmits(['change', 'update'])

// 对象形式（带验证）
const emit = defineEmits({
  // 无验证
  click: null,
  
  // 带验证函数
  submit: (payload: { email: string, password: string }) => {
    if (!payload.email || !payload.password) {
      console.warn('Invalid submit payload!')
      return false
    }
    return true
  }
})
</script>
```

### TypeScript 类型声明（推荐）

```vue
<script setup lang="ts">
// 类型声明
const emit = defineEmits<{
  // 事件名: 参数类型数组
  'change': [id: number]
  'update': [value: string]
  'submit': [data: FormData]
  'close': []  // 无参数
  
  // 支持重载
  'foo': [bar: string]
  'foo': [bar: number]
}>()

// 使用
emit('change', 123)
emit('update', 'hello')
emit('submit', formData)
emit('close')
</script>
```

### 结合运行时验证和类型

```vue
<script setup lang="ts">
// 同时提供类型和验证
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>({
  'update:modelValue': (value: string) => {
    return value.length > 0
  }
})
</script>
```

---

## 事件命名规范

### camelCase vs kebab-case

```vue
<!-- 子组件：使用 camelCase -->
<script setup lang="ts">
const emit = defineEmits<{
  'updateValue': [value: string]
  'submitForm': [data: FormData]
}>()
</script>

<!-- 父组件：使用 kebab-case -->
<template>
  <!-- 推荐：kebab-case -->
  <Child
    @update-value="handleUpdate"
    @submit-form="handleSubmit"
  />
  
  <!-- 也支持：camelCase -->
  <Child
    @updateValue="handleUpdate"
    @submitForm="handleSubmit"
  />
</template>
```

### 事件命名约定

```typescript
// ✅ 好的命名
'update:modelValue'  // v-model 约定
'click'              // 简洁明了
'submit'             // 动词
'change'             // 状态变化
'before-close'       // 生命周期钩子风格
'item-selected'      // 描述性

// ❌ 不好的命名
'onClick'            // 不要用 on 前缀
'UpdateValue'        // 不要用 PascalCase
'value_changed'      // 不要用下划线
'evt1'               // 无意义的名称
```

---

## v-model 的事件约定

### 基础 v-model

```vue
<!-- 子组件 -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  >
</template>

<!-- 父组件 -->
<template>
  <Child v-model="text" />
  
  <!-- 等价于 -->
  <Child
    :modelValue="text"
    @update:modelValue="text = $event"
  />
</template>
```

### 具名 v-model

```vue
<!-- 子组件 -->
<script setup lang="ts">
const props = defineProps<{
  firstName: string
  lastName: string
}>()

const emit = defineEmits<{
  'update:firstName': [value: string]
  'update:lastName': [value: string]
}>()
</script>

<template>
  <input
    :value="firstName"
    @input="emit('update:firstName', $event.target.value)"
  >
  <input
    :value="lastName"
    @input="emit('update:lastName', $event.target.value)"
  >
</template>

<!-- 父组件 -->
<template>
  <Child
    v-model:first-name="firstName"
    v-model:last-name="lastName"
  />
</template>
```

---

## 事件验证

### 验证参数

```vue
<script setup>
const emit = defineEmits({
  // 验证单个参数
  'update': (value: number) => {
    if (value < 0) {
      console.warn('Value must be positive')
      return false
    }
    return true
  },
  
  // 验证多个参数
  'submit': (email: string, password: string) => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const passwordValid = password.length >= 6
    return emailValid && passwordValid
  },
  
  // 验证对象
  'save': (data: FormData) => {
    return data.name && data.email
  }
})
</script>
```

**验证失败时**：
- 开发模式：控制台警告
- 生产模式：静默失败
- 事件仍会被触发

---

## 事件修饰符

### .once

```vue
<!-- 父组件 -->
<template>
  <!-- 只触发一次 -->
  <Child @close.once="handleClose" />
</template>

<!-- 等价于手动处理 -->
<script setup>
let closed = false

function handleClose() {
  if (closed) return
  closed = true
  // 处理关闭逻辑
}
</script>
```

### 原生事件修饰符

```vue
<template>
  <!-- 组件上的原生事件需要 .native（Vue 2） -->
  <!-- Vue 3 不再需要 .native -->
  <Child @click="handleClick" />
</template>
```

---

## 透传 Attributes 与事件

### $attrs 包含未声明的 props 和事件

```vue
<!-- 子组件 -->
<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  'submit': []
}>()

// $attrs 会包含未声明的 props 和事件
</script>

<template>
  <div>
    <!-- 未声明的 props 和事件会透传到根元素 -->
  </div>
</template>

<!-- 父组件 -->
<template>
  <Child
    title="标题"          <!-- 声明的 prop -->
    class="custom"        <!-- $attrs -->
    @submit="handleSubmit" <!-- 声明的事件 -->
    @click="handleClick"  <!-- $attrs -->
  />
</template>
```

### 禁用 Attributes 继承

```vue
<script setup>
// 禁用自动继承
defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()
</script>

<template>
  <!-- 手动应用到指定元素 -->
  <div class="wrapper">
    <input v-bind="attrs" />
  </div>
</template>
```

---

## 易错点与边界情况

### 1. 事件名称大小写

```vue
<!-- ❌ 错误：HTML 不区分大小写 -->
<template>
  <Child @myEvent="handler" />
</template>

<!-- ✅ 正确：使用 kebab-case -->
<template>
  <Child @my-event="handler" />
</template>

<!-- 子组件 -->
<script setup>
// camelCase 定义
const emit = defineEmits<{
  'myEvent': []  // 或 'my-event'
}>()
</script>
```

### 2. 事件对象的传递

```vue
<!-- 子组件 -->
<script setup>
const emit = defineEmits<{
  'custom-click': [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  // 传递原生事件对象
  emit('custom-click', event)
}
</script>

<template>
  <button @click="handleClick">点击</button>
</template>

<!-- 父组件 -->
<script setup>
function handleCustomClick(event: MouseEvent) {
  console.log(event.target)
  event.stopPropagation()
}
</script>

<template>
  <Child @custom-click="handleCustomClick" />
</template>
```

### 3. 事件验证的返回值

```vue
<script setup>
const emit = defineEmits({
  'submit': (data: FormData) => {
    // 返回 false 不会阻止事件触发
    // 只是在开发模式下产生警告
    if (!data.email) {
      return false
    }
    return true
  }
})

// 事件仍然会被触发
emit('submit', invalidData) // 警告但仍触发
</script>
```

### 4. emit 的返回值

```vue
<script setup>
const emit = defineEmits<{
  'test': []
}>()

// emit 没有返回值（返回 undefined）
const result = emit('test')
console.log(result) // undefined

// 不能用于条件判断
if (emit('test')) { // ❌ 总是 false
  // 不会执行
}
</script>
```

---

## 前端工程实践

### 示例 1：表单组件事件

```vue
<!-- FormComponent.vue -->
<script setup lang="ts">
interface FormData {
  username: string
  password: string
}

interface ValidationError {
  field: string
  message: string
}

const emit = defineEmits<{
  'submit': [data: FormData]
  'cancel': []
  'validate': [field: string, isValid: boolean]
  'error': [errors: ValidationError[]]
  'change': [field: keyof FormData, value: string]
}>()

const form = reactive<FormData>({
  username: '',
  password: ''
})

function validateField(field: keyof FormData): boolean {
  const isValid = form[field].length > 0
  emit('validate', field, isValid)
  return isValid
}

function handleSubmit() {
  const errors: ValidationError[] = []
  
  if (!validateField('username')) {
    errors.push({ field: 'username', message: '用户名不能为空' })
  }
  
  if (!validateField('password')) {
    errors.push({ field: 'password', message: '密码不能为空' })
  }
  
  if (errors.length > 0) {
    emit('error', errors)
    return
  }
  
  emit('submit', { ...form })
}

function handleCancel() {
  emit('cancel')
}

function handleFieldChange(field: keyof FormData, value: string) {
  form[field] = value
  emit('change', field, value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input
      v-model="form.username"
      @input="handleFieldChange('username', $event.target.value)"
      @blur="validateField('username')"
    >
    
    <input
      v-model="form.password"
      type="password"
      @input="handleFieldChange('password', $event.target.value)"
      @blur="validateField('password')"
    >
    
    <button type="submit">提交</button>
    <button type="button" @click="handleCancel">取消</button>
  </form>
</template>

<!-- 使用 -->
<script setup>
function handleSubmit(data: FormData) {
  console.log('提交:', data)
}

function handleError(errors: ValidationError[]) {
  console.error('验证失败:', errors)
}

function handleChange(field: string, value: string) {
  console.log(`${field} changed to ${value}`)
}
</script>

<template>
  <FormComponent
    @submit="handleSubmit"
    @cancel="closeModal"
    @error="handleError"
    @change="handleChange"
  />
</template>
```

### 示例 2：异步操作事件

```vue
<!-- AsyncButton.vue -->
<script setup lang="ts">
const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  'click': [event: MouseEvent]
  'async-start': []
  'async-end': []
  'async-error': [error: Error]
}>()

const isLoading = ref(false)

async function handleClick(event: MouseEvent) {
  if (isLoading.value || props.loading) return
  
  emit('click', event)
  
  // 如果父组件返回 Promise，等待执行
  const result = emit('async-start')
  
  // 注意：emit 不返回值，需要其他方式处理异步
  // 这里仅作演示，实际应该通过 props 传入异步函数
}
</script>

<template>
  <button
    :disabled="isLoading || loading"
    @click="handleClick"
  >
    <span v-if="isLoading || loading">加载中...</span>
    <slot v-else />
  </button>
</template>

<!-- 正确的异步处理方式 -->
<script setup lang="ts">
const props = defineProps<{
  onClick?: (event: MouseEvent) => Promise<void>
}>()

const emit = defineEmits<{
  'success': []
  'error': [error: Error]
}>()

const loading = ref(false)

async function handleClick(event: MouseEvent) {
  if (!props.onClick) return
  
  loading.value = true
  
  try {
    await props.onClick(event)
    emit('success')
  } catch (error) {
    emit('error', error as Error)
  } finally {
    loading.value = false
  }
}
</script>
```

### 示例 3：事件总线模式

```typescript
// eventBus.ts
import { ref } from 'vue'

type EventHandler = (...args: any[]) => void

class EventBus {
  private events = new Map<string, Set<EventHandler>>()
  
  on(event: string, handler: EventHandler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(handler)
  }
  
  off(event: string, handler: EventHandler) {
    this.events.get(event)?.delete(handler)
  }
  
  emit(event: string, ...args: any[]) {
    this.events.get(event)?.forEach(handler => {
      handler(...args)
    })
  }
  
  once(event: string, handler: EventHandler) {
    const onceHandler = (...args: any[]) => {
      handler(...args)
      this.off(event, onceHandler)
    }
    this.on(event, onceHandler)
  }
}

export const eventBus = new EventBus()

// 使用
import { eventBus } from './eventBus'
import { onUnmounted } from 'vue'

// 组件 A
function handler(data: any) {
  console.log(data)
}

eventBus.on('custom-event', handler)

onUnmounted(() => {
  eventBus.off('custom-event', handler)
})

// 组件 B
eventBus.emit('custom-event', { message: 'Hello' })
```

### 示例 4：组件通信封装

```typescript
// useEmit.ts
import { getCurrentInstance } from 'vue'

export function useEmit<T extends Record<string, any[]>>() {
  const instance = getCurrentInstance()
  if (!instance) {
    throw new Error('useEmit must be called in setup()')
  }
  
  return instance.emit as {
    <K extends keyof T>(event: K, ...args: T[K]): void
  }
}

// 使用
interface Events {
  'update': [value: string]
  'submit': [data: FormData]
  'cancel': []
}

const emit = useEmit<Events>()

emit('update', 'hello')  // ✅ 类型安全
emit('submit', formData) // ✅ 类型安全
emit('cancel')           // ✅ 类型安全
emit('unknown')          // ❌ 类型错误
```

---

## 最佳实践

1. **使用 TypeScript 类型声明**：提供类型安全
2. **事件命名语义化**：清晰表达意图
3. **使用 kebab-case**：模板中的事件名
4. **避免过多事件**：考虑使用对象参数
5. **验证事件参数**：开发模式下捕获错误
6. **文档化事件**：注释说明事件用途和参数
7. **遵循 v-model 约定**：`update:xxx` 命名
8. **及时清理事件监听器**：防止内存泄漏

---

## 参考资料

- [组件事件](https://cn.vuejs.org/guide/components/events.html)
- [defineEmits API](https://cn.vuejs.org/api/sfc-script-setup.html#defineemits)
- [组件 v-model](https://cn.vuejs.org/guide/components/v-model.html)
