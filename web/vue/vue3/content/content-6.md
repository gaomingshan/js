# 事件处理与表单绑定

> 深入理解事件处理机制和 v-model 双向绑定的原理与应用。

## 事件处理

### 监听事件

```vue
<script setup>
const count = ref(0)

function increment() {
  count.value++
}

function greet(name: string, event: MouseEvent) {
  console.log(`Hello ${name}`)
  console.log(event.target)
}
</script>

<template>
  <!-- 方法处理器 -->
  <button @click="increment">Count: {{ count }}</button>
  
  <!-- 内联处理器 -->
  <button @click="count++">Count: {{ count }}</button>
  
  <!-- 调用方法 -->
  <button @click="greet('Alice', $event)">Say Hi</button>
  
  <!-- 内联箭头函数 -->
  <button @click="(e) => console.log(e.target)">Log</button>
</template>
```

### 事件修饰符详解

#### 阻止默认行为

```vue
<template>
  <!-- 阻止表单提交的默认刷新 -->
  <form @submit.prevent="handleSubmit">
    <button type="submit">提交</button>
  </form>
  
  <!-- 阻止链接跳转 -->
  <a href="https://example.com" @click.prevent="handleClick">
    链接
  </a>
  
  <!-- 等价于 -->
  <a href="#" @click="(e) => { e.preventDefault(); handleClick() }">
</template>
```

#### 阻止事件冒泡

```vue
<template>
  <div @click="parentClick">
    <!-- 点击按钮不会触发 parentClick -->
    <button @click.stop="childClick">按钮</button>
    
    <!-- 等价于 -->
    <button @click="(e) => { e.stopPropagation(); childClick() }">
  </div>
</template>
```

#### 捕获模式

```vue
<template>
  <!-- 在捕获阶段监听（从外到内） -->
  <div @click.capture="outer">
    <div @click.capture="middle">
      <button @click="inner">按钮</button>
    </div>
  </div>
  
  <!-- 点击按钮触发顺序：outer → middle → inner -->
</template>
```

#### self 修饰符

```vue
<template>
  <!-- 只有点击元素自身时才触发（不包括子元素） -->
  <div @click.self="handleClick">
    <button>点击我不会触发外层</button>
    点击我会触发
  </div>
</template>
```

#### once 修饰符

```vue
<template>
  <!-- 只触发一次，之后自动移除监听器 -->
  <button @click.once="subscribe">订阅（只能点一次）</button>
  
  <!-- 组合使用 -->
  <form @submit.prevent.once="handleSubmit">
    提交后自动移除监听
  </form>
</template>
```

#### passive 修饰符

```vue
<template>
  <!-- 告诉浏览器不会调用 preventDefault -->
  <!-- 提升移动端滚动性能 -->
  <div @scroll.passive="onScroll">
    滚动内容
  </div>
  
  <!-- ⚠️ passive 和 prevent 不能一起使用 -->
  <div @scroll.passive.prevent="onScroll"> <!-- 错误 -->
</template>
```

### 按键修饰符

```vue
<template>
  <!-- 常用按键别名 -->
  <input @keyup.enter="submit">
  <input @keyup.tab="nextField">
  <input @keyup.delete="remove">  <!-- Delete 和 Backspace -->
  <input @keyup.esc="cancel">
  <input @keyup.space="pause">
  <input @keyup.up="moveUp">
  <input @keyup.down="moveDown">
  <input @keyup.left="moveLeft">
  <input @keyup.right="moveRight">
  
  <!-- 系统修饰键 -->
  <input @keyup.ctrl="onCtrl">
  <input @keyup.alt="onAlt">
  <input @keyup.shift="onShift">
  <input @keyup.meta="onMeta">  <!-- Mac Command / Windows 键 -->
  
  <!-- 组合按键 -->
  <input @keyup.ctrl.enter="submit">
  <input @keyup.alt.c="copy">
  
  <!-- exact 修饰符：精确匹配 -->
  <button @click.ctrl.exact="onCtrlClick">
    只有 Ctrl 时触发（不能有其他修饰键）
  </button>
  
  <button @click.exact="onClick">
    没有任何修饰键时触发
  </button>
</template>
```

### 鼠标按键修饰符

```vue
<template>
  <div @click.left="onLeftClick">左键</div>
  <div @click.right.prevent="onRightClick">右键（阻止菜单）</div>
  <div @click.middle="onMiddleClick">中键</div>
</template>
```

---

## v-model 原理与应用

### v-model 本质

`v-model` 是语法糖，结合了 `:value` 和 `@input`。

```vue
<template>
  <!-- v-model -->
  <input v-model="text">
  
  <!-- 等价于 -->
  <input
    :value="text"
    @input="text = $event.target.value"
  >
</template>
```

### 不同表单元素的 v-model

#### 文本输入

```vue
<script setup>
const text = ref('')
const textarea = ref('')
</script>

<template>
  <!-- 单行文本 -->
  <input v-model="text" type="text">
  
  <!-- 多行文本 -->
  <textarea v-model="textarea"></textarea>
  
  <!-- ⚠️ 插值在 textarea 中不生效 -->
  <textarea>{{ text }}</textarea> <!-- 错误 -->
</template>
```

#### 复选框

```vue
<script setup>
// 单个复选框 - 布尔值
const checked = ref(false)

// 多个复选框 - 数组
const checkedNames = ref<string[]>([])
</script>

<template>
  <!-- 单个复选框 -->
  <input type="checkbox" v-model="checked">
  <p>Checked: {{ checked }}</p>
  
  <!-- 多个复选框 -->
  <input type="checkbox" value="Alice" v-model="checkedNames">
  <input type="checkbox" value="Bob" v-model="checkedNames">
  <input type="checkbox" value="Charlie" v-model="checkedNames">
  <p>Checked names: {{ checkedNames }}</p>
  
  <!-- 自定义值（true-value / false-value） -->
  <input
    type="checkbox"
    v-model="toggle"
    true-value="yes"
    false-value="no"
  >
</template>
```

#### 单选按钮

```vue
<script setup>
const picked = ref('')
</script>

<template>
  <input type="radio" value="One" v-model="picked">
  <input type="radio" value="Two" v-model="picked">
  <p>Picked: {{ picked }}</p>
</template>
```

#### 选择框

```vue
<script setup>
const selected = ref('')
const multiSelected = ref<string[]>([])
</script>

<template>
  <!-- 单选 -->
  <select v-model="selected">
    <option disabled value="">请选择</option>
    <option value="A">选项 A</option>
    <option value="B">选项 B</option>
    <option value="C">选项 C</option>
  </select>
  
  <!-- 多选 -->
  <select v-model="multiSelected" multiple>
    <option value="A">选项 A</option>
    <option value="B">选项 B</option>
    <option value="C">选项 C</option>
  </select>
  
  <!-- 动态选项 -->
  <select v-model="selected">
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.text }}
    </option>
  </select>
</template>
```

### v-model 修饰符

#### .lazy

```vue
<template>
  <!-- 默认：在 input 事件时同步 -->
  <input v-model="text">
  
  <!-- lazy：在 change 事件时同步（失去焦点或按回车） -->
  <input v-model.lazy="text">
</template>
```

#### .number

```vue
<script setup>
const age = ref(0)
</script>

<template>
  <!-- 自动转换为数字 -->
  <input v-model.number="age" type="number">
  
  <!-- 等价于 -->
  <input
    :value="age"
    @input="age = Number($event.target.value)"
  >
</template>
```

#### .trim

```vue
<template>
  <!-- 自动去除首尾空格 -->
  <input v-model.trim="text">
  
  <!-- 组合使用 -->
  <input v-model.lazy.trim="text">
</template>
```

---

## 组件上的 v-model

### 基础用法

```vue
<!-- 父组件 -->
<script setup>
const modelValue = ref('')
</script>

<template>
  <CustomInput v-model="modelValue" />
  
  <!-- 等价于 -->
  <CustomInput
    :modelValue="modelValue"
    @update:modelValue="modelValue = $event"
  />
</template>

<!-- 子组件 CustomInput.vue -->
<script setup>
defineProps<{
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
```

### 多个 v-model 绑定

```vue
<!-- 父组件 -->
<script setup>
const firstName = ref('')
const lastName = ref('')
</script>

<template>
  <UserName
    v-model:first-name="firstName"
    v-model:last-name="lastName"
  />
</template>

<!-- 子组件 UserName.vue -->
<script setup>
defineProps<{
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
```

### 自定义 v-model 修饰符

```vue
<!-- 父组件 -->
<template>
  <CustomInput v-model.capitalize="text" />
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps<{
  modelValue: string
  modelModifiers?: { capitalize?: boolean }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function emitValue(e: Event) {
  let value = (e.target as HTMLInputElement).value
  
  if (props.modelModifiers?.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }
  
  emit('update:modelValue', value)
}
</script>

<template>
  <input
    :value="modelValue"
    @input="emitValue"
  >
</template>
```

### 带参数的自定义修饰符

```vue
<!-- 父组件 -->
<template>
  <UserName
    v-model:first-name.capitalize="firstName"
    v-model:last-name.uppercase="lastName"
  />
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps<{
  firstName: string
  lastName: string
  firstNameModifiers?: { capitalize?: boolean }
  lastNameModifiers?: { uppercase?: boolean }
}>()

const emit = defineEmits<{
  'update:firstName': [value: string]
  'update:lastName': [value: string]
}>()

function handleFirstName(e: Event) {
  let value = (e.target as HTMLInputElement).value
  if (props.firstNameModifiers?.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }
  emit('update:firstName', value)
}

function handleLastName(e: Event) {
  let value = (e.target as HTMLInputElement).value
  if (props.lastNameModifiers?.uppercase) {
    value = value.toUpperCase()
  }
  emit('update:lastName', value)
}
</script>

<template>
  <input :value="firstName" @input="handleFirstName">
  <input :value="lastName" @input="handleLastName">
</template>
```

---

## 易错点与边界情况

### 1. v-model 与 computed

```vue
<script setup>
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// ✅ 使用计算属性的 getter/setter
const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <!-- 可以直接绑定计算属性 -->
  <input v-model="value">
</template>
```

### 2. IME 输入法问题

对于中文、日文、韩文等需要输入法的语言，v-model 在输入法组合期间不会更新。

```vue
<template>
  <!-- v-model 在输入法组合期间不更新 -->
  <input v-model="text">
  
  <!-- 解决方案：手动监听 input 事件 -->
  <input
    :value="text"
    @input="text = $event.target.value"
  >
</template>
```

### 3. checkbox 的值绑定

```vue
<script setup>
const toggle = ref(false)
</script>

<template>
  <!-- 默认：true / false -->
  <input type="checkbox" v-model="toggle">
  
  <!-- 自定义值 -->
  <input
    type="checkbox"
    v-model="toggle"
    :true-value="1"
    :false-value="0"
  >
  <!-- toggle 的值将是 1 或 0 -->
  
  <!-- 动态值 -->
  <input
    type="checkbox"
    v-model="toggle"
    :true-value="dynamicTrueValue"
    :false-value="dynamicFalseValue"
  >
</template>
```

---

## 前端工程实践

### 示例 1：表单验证

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  agree: false
})

const errors = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail() {
  if (!form.value.email) {
    errors.value.email = '邮箱不能为空'
  } else if (!emailRegex.test(form.value.email)) {
    errors.value.email = '邮箱格式不正确'
  } else {
    errors.value.email = ''
  }
}

function validatePassword() {
  if (!form.value.password) {
    errors.value.password = '密码不能为空'
  } else if (form.value.password.length < 6) {
    errors.value.password = '密码至少6位'
  } else {
    errors.value.password = ''
  }
}

function validateConfirmPassword() {
  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = '两次密码不一致'
  } else {
    errors.value.confirmPassword = ''
  }
}

const canSubmit = computed(() => {
  return (
    form.value.email &&
    form.value.password &&
    form.value.confirmPassword &&
    form.value.agree &&
    !errors.value.email &&
    !errors.value.password &&
    !errors.value.confirmPassword
  )
})

async function handleSubmit() {
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  
  if (canSubmit.value) {
    // 提交表单
    console.log('提交:', form.value)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label>邮箱</label>
      <input
        v-model.trim="form.email"
        type="email"
        @blur="validateEmail"
      >
      <span v-if="errors.email" class="error">{{ errors.email }}</span>
    </div>
    
    <div>
      <label>密码</label>
      <input
        v-model="form.password"
        type="password"
        @blur="validatePassword"
      >
      <span v-if="errors.password" class="error">{{ errors.password }}</span>
    </div>
    
    <div>
      <label>确认密码</label>
      <input
        v-model="form.confirmPassword"
        type="password"
        @blur="validateConfirmPassword"
      >
      <span v-if="errors.confirmPassword" class="error">
        {{ errors.confirmPassword }}
      </span>
    </div>
    
    <div>
      <label>
        <input type="checkbox" v-model="form.agree">
        我同意服务条款
      </label>
    </div>
    
    <button type="submit" :disabled="!canSubmit">注册</button>
  </form>
</template>
```

### 示例 2：自定义输入组件

```vue
<!-- MoneyInput.vue - 货币输入组件 -->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  currency?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const displayValue = computed({
  get() {
    return props.modelValue.toFixed(2)
  },
  set(value: string) {
    const num = parseFloat(value) || 0
    emit('update:modelValue', num)
  }
})
</script>

<template>
  <div class="money-input">
    <span class="currency">{{ currency || '$' }}</span>
    <input
      v-model.number="displayValue"
      type="number"
      step="0.01"
      min="0"
    >
  </div>
</template>

<!-- 使用 -->
<script setup>
const price = ref(99.99)
</script>

<template>
  <MoneyInput v-model="price" currency="¥" />
  <p>价格: {{ price }}</p>
</template>
```

### 示例 3：防抖输入

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const searchText = ref('')
const debouncedText = ref('')

let timeoutId: number | null = null

watch(searchText, (newValue) => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  
  timeoutId = setTimeout(() => {
    debouncedText.value = newValue
    performSearch(newValue)
  }, 300) as unknown as number
})

function performSearch(query: string) {
  console.log('搜索:', query)
}
</script>

<template>
  <input v-model="searchText" placeholder="搜索...">
  <p>实时输入: {{ searchText }}</p>
  <p>防抖后: {{ debouncedText }}</p>
</template>
```

---

## 最佳实践

1. **合理使用修饰符**：简化代码，提升可读性
2. **表单验证及时反馈**：失焦或输入时验证
3. **自定义组件实现 v-model**：提供统一的双向绑定接口
4. **使用 computed 包装 v-model**：添加额外逻辑
5. **防抖/节流搜索输入**：减少请求次数
6. **类型安全**：配合 TypeScript 定义 props 和 emits

---

## 参考资料

- [事件处理](https://cn.vuejs.org/guide/essentials/event-handling.html)
- [表单输入绑定](https://cn.vuejs.org/guide/essentials/forms.html)
- [组件 v-model](https://cn.vuejs.org/guide/components/v-model.html)
