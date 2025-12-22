# 第 6 节：Props 与 Emits

## 概述

Props 是父组件向子组件传递数据的方式，Emits 是子组件向父组件发送消息的方式。这是 Vue 中最基本的组件通信模式。

## 一、Props 基础

### 1.1 声明 Props

```vue
<!-- 子组件 ChildComponent.vue -->
<template>
  <div>
    <h2>{{ title }}</h2>
    <p>{{ content }}</p>
  </div>
</template>

<script setup>
// 方式一：数组形式
const props = defineProps(['title', 'content'])

// 方式二：对象形式（推荐，可以指定类型）
const props = defineProps({
  title: String,
  content: String
})
</script>
```

### 1.2 传递 Props

```vue
<!-- 父组件 -->
<template>
  <!-- 静态值 -->
  <ChildComponent title="Hello" content="World" />
  
  <!-- 动态值 -->
  <ChildComponent :title="titleText" :content="contentText" />
  
  <!-- 传递数字 -->
  <ChildComponent :count="42" />
  
  <!-- 传递布尔值 -->
  <ChildComponent :visible="true" />
  <ChildComponent visible />  <!-- 等价于 :visible="true" -->
  
  <!-- 传递数组 -->
  <ChildComponent :items="['a', 'b', 'c']" />
  
  <!-- 传递对象 -->
  <ChildComponent :user="{ name: 'Vue', age: 3 }" />
  
  <!-- 传递所有属性 -->
  <ChildComponent v-bind="post" />
  <!-- 等价于 :id="post.id" :title="post.title" -->
</template>

<script setup>
import { ref, reactive } from 'vue'
import ChildComponent from './ChildComponent.vue'

const titleText = ref('动态标题')
const contentText = ref('动态内容')
const post = reactive({ id: 1, title: '文章标题' })
</script>
```

### 1.3 Props 类型验证

```vue
<script setup>
const props = defineProps({
  // 基础类型
  propA: Number,
  
  // 多种类型
  propB: [String, Number],
  
  // 必填
  propC: {
    type: String,
    required: true
  },
  
  // 默认值
  propD: {
    type: Number,
    default: 100
  },
  
  // 对象/数组默认值（必须用工厂函数）
  propE: {
    type: Object,
    default: () => ({ message: 'hello' })
  },
  
  // 自定义验证
  propF: {
    type: String,
    validator: (value) => {
      return ['success', 'warning', 'error'].includes(value)
    }
  }
})
</script>
```

### 1.4 可用的类型

```javascript
String
Number
Boolean
Array
Object
Date
Function
Symbol
// 自定义类
class Person {}
defineProps({ author: Person })
```

## 二、Props 特性

### 2.1 单向数据流

```vue
<!-- ❌ 子组件不应直接修改 Props -->
<script setup>
const props = defineProps(['count'])

// 这会导致警告
props.count++
</script>

<!-- ✅ 如果需要修改，使用本地状态 -->
<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['initialCount'])

// 方式一：复制为本地状态
const count = ref(props.initialCount)

// 方式二：基于 prop 计算
const normalizedCount = computed(() => props.initialCount.trim().toLowerCase())
</script>
```

### 2.2 Props 响应式

```vue
<script setup>
import { computed, toRef, toRefs } from 'vue'

const props = defineProps(['user', 'count'])

// ❌ 解构会丢失响应式
const { user, count } = props

// ✅ 使用 toRef / toRefs 保持响应式
const userRef = toRef(props, 'user')
const { user: userRef2, count: countRef } = toRefs(props)

// ✅ 在 computed 中使用
const userName = computed(() => props.user.name)
</script>
```

### 2.3 Boolean 转换

```vue
<script setup>
defineProps({
  disabled: Boolean
})
</script>

<template>
  <!-- 以下写法 disabled 都是 true -->
  <MyButton disabled />
  <MyButton :disabled="true" />
  <MyButton disabled="true" />
  <MyButton disabled="" />
</template>
```

## 三、Emits 基础

### 3.1 声明 Emits

```vue
<!-- 子组件 -->
<template>
  <button @click="handleClick">点击</button>
</template>

<script setup>
// 方式一：数组形式
const emit = defineEmits(['update', 'delete'])

// 方式二：对象形式（可以验证参数）
const emit = defineEmits({
  // 无验证
  click: null,
  
  // 带验证
  submit: (payload) => {
    if (payload.email && payload.password) {
      return true
    }
    console.warn('Invalid submit payload')
    return false
  }
})

function handleClick() {
  emit('update', { id: 1, value: 'new' })
}
</script>
```

### 3.2 监听事件

```vue
<!-- 父组件 -->
<template>
  <ChildComponent 
    @update="handleUpdate"
    @delete="handleDelete"
  />
</template>

<script setup>
function handleUpdate(payload) {
  console.log('更新:', payload)
}

function handleDelete(id) {
  console.log('删除:', id)
}
</script>
```

### 3.3 TypeScript 类型

```vue
<script setup lang="ts">
// 使用泛型定义 emits 类型
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()

// Vue 3.3+ 更简洁的语法
const emit = defineEmits<{
  change: [id: number]
  update: [value: string]
}>()
</script>
```

## 四、v-model 与组件

### 4.1 基本用法

```vue
<!-- 父组件 -->
<template>
  <CustomInput v-model="searchText" />
  
  <!-- 等价于 -->
  <CustomInput 
    :modelValue="searchText"
    @update:modelValue="searchText = $event"
  />
</template>

<!-- 子组件 CustomInput.vue -->
<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>
```

### 4.2 使用 computed 简化

```vue
<!-- 子组件 -->
<template>
  <input v-model="value" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>
```

### 4.3 多个 v-model

```vue
<!-- 父组件 -->
<template>
  <UserForm
    v-model:firstName="first"
    v-model:lastName="last"
  />
</template>

<!-- 子组件 UserForm.vue -->
<template>
  <input :value="firstName" @input="$emit('update:firstName', $event.target.value)" />
  <input :value="lastName" @input="$emit('update:lastName', $event.target.value)" />
</template>

<script setup>
defineProps(['firstName', 'lastName'])
defineEmits(['update:firstName', 'update:lastName'])
</script>
```

### 4.4 v-model 修饰符

```vue
<!-- 父组件 -->
<template>
  <CustomInput v-model.capitalize="text" />
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps({
  modelValue: String,
  modelModifiers: { default: () => ({}) }
})
const emit = defineEmits(['update:modelValue'])

function handleInput(e) {
  let value = e.target.value
  if (props.modelModifiers.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }
  emit('update:modelValue', value)
}
</script>

<template>
  <input :value="modelValue" @input="handleInput" />
</template>
```

## 五、透传属性

### 5.1 自动透传

```vue
<!-- 父组件 -->
<template>
  <MyButton class="large" @click="onClick" />
</template>

<!-- 子组件 MyButton.vue -->
<!-- class 和 @click 会自动应用到根元素 -->
<template>
  <button>按钮</button>
</template>
```

### 5.2 禁用透传

```vue
<script setup>
defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <div class="wrapper">
    <!-- 手动绑定到指定元素 -->
    <button v-bind="$attrs">按钮</button>
  </div>
</template>
```

### 5.3 访问透传属性

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
console.log(attrs.class, attrs.onClick)
</script>
```

## 六、通信模式总结

```
┌─────────────────────────────────────────────────────────────┐
│                    父子组件通信                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   父组件                                                    │
│   ┌─────────────────────────────────────┐                  │
│   │  <Child :msg="msg" @update="fn" />  │                  │
│   └──────────────┬──────────────────────┘                  │
│                  │                                          │
│        Props ↓   │   ↑ Emits                                │
│                  │                                          │
│   ┌──────────────▼──────────────────────┐                  │
│   │  子组件                              │                  │
│   │  props.msg                          │                  │
│   │  emit('update', data)               │                  │
│   └─────────────────────────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 七、最佳实践

| 实践 | 说明 |
|------|------|
| Props 类型验证 | 始终定义类型，便于维护 |
| 单向数据流 | 不直接修改 props |
| 命名规范 | props 用 camelCase，模板用 kebab-case |
| 必要性 | 只传递必要的数据 |
| emit 声明 | 显式声明所有事件 |

## 参考资料

- [Props](https://vuejs.org/guide/components/props.html)
- [Events](https://vuejs.org/guide/components/events.html)
- [v-model](https://vuejs.org/guide/components/v-model.html)

---

**下一节** → [第 7 节：插槽机制](./07-slots.md)
