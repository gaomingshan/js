# 模板语法与指令系统

> Vue 的模板语法提供了声明式地将组件状态渲染到 DOM 的能力，指令系统是模板的核心特性。

## 核心概念

Vue 使用基于 HTML 的模板语法，允许你声明式地将渲染的 DOM 绑定到组件实例的数据。所有的 Vue 模板都是语法上合法的 HTML。

### 插值表达式

```vue
<script setup>
const message = ref('Hello Vue 3')
const count = ref(42)
const user = reactive({ name: 'Alice' })
</script>

<template>
  <!-- 文本插值 -->
  <p>{{ message }}</p>
  
  <!-- 表达式 -->
  <p>{{ count * 2 }}</p>
  
  <!-- 对象属性 -->
  <p>{{ user.name }}</p>
  
  <!-- JavaScript 表达式 -->
  <p>{{ message.split('').reverse().join('') }}</p>
  
  <!-- 三元运算符 -->
  <p>{{ count > 10 ? '大于10' : '小于等于10' }}</p>
</template>
```

**限制**：
- 只能是**单一表达式**
- 不能使用语句（if、for、var 等）
- 只能访问[受限的全局对象列表](https://github.com/vuejs/core/blob/main/packages/shared/src/globalsWhitelist.ts)

---

## 指令解析机制

指令是带有 `v-` 前缀的特殊 attribute。指令的职责是在其表达式值变化时响应式地更新 DOM。

### 指令的组成

```html
v-指令名:参数.修饰符1.修饰符2="表达式"
```

**示例**：
```html
<a v-bind:href.sync="url">链接</a>
   ↓     ↓     ↓      ↓
 指令  参数  修饰符  表达式
```

---

## 常用内置指令

### v-bind - 动态绑定属性

```vue
<script setup>
const imageUrl = ref('/logo.png')
const isDisabled = ref(false)
const dynamicAttr = ref('placeholder')
</script>

<template>
  <!-- 绑定 attribute -->
  <img v-bind:src="imageUrl">
  
  <!-- 简写形式 -->
  <img :src="imageUrl">
  
  <!-- 绑定布尔 attribute -->
  <button :disabled="isDisabled">按钮</button>
  
  <!-- 绑定多个 attribute -->
  <div v-bind="{ id: 'container', class: 'wrapper' }"></div>
  
  <!-- 动态 attribute 名 -->
  <input :[dynamicAttr]="'请输入内容'">
</template>
```

**特殊处理**：
- `class` 和 `style` 有增强的绑定语法
- 布尔 attribute（disabled、readonly）在值为 `false` 时会被移除

### v-on - 事件监听

```vue
<script setup>
const count = ref(0)

function increment() {
  count.value++
}

function greet(name: string) {
  alert(`Hello ${name}`)
}

function handleClick(event: MouseEvent) {
  console.log(event.target)
}
</script>

<template>
  <!-- 方法处理器 -->
  <button v-on:click="increment">+1</button>
  
  <!-- 简写形式 -->
  <button @click="increment">+1</button>
  
  <!-- 内联处理器 -->
  <button @click="count++">+1</button>
  
  <!-- 传递参数 -->
  <button @click="greet('Alice')">打招呼</button>
  
  <!-- 访问事件对象 -->
  <button @click="handleClick">点击</button>
  
  <!-- 内联访问事件对象 -->
  <button @click="(event) => console.log(event)">点击</button>
  
  <!-- 特殊的 $event 变量 -->
  <button @click="greet('Bob', $event)">打招呼</button>
  
  <!-- 动态事件名 -->
  <button @[eventName]="handleEvent">动态事件</button>
</template>
```

### v-model - 双向绑定

```vue
<script setup>
const text = ref('')
const checked = ref(false)
const selected = ref('')
const multiSelect = ref([])
</script>

<template>
  <!-- 文本输入 -->
  <input v-model="text">
  
  <!-- 等价于 -->
  <input 
    :value="text" 
    @input="event => text = event.target.value"
  >
  
  <!-- 复选框 -->
  <input type="checkbox" v-model="checked">
  
  <!-- 单选框 -->
  <input type="radio" value="A" v-model="selected">
  <input type="radio" value="B" v-model="selected">
  
  <!-- 下拉框 -->
  <select v-model="selected">
    <option value="A">选项A</option>
    <option value="B">选项B</option>
  </select>
  
  <!-- 多选下拉框 -->
  <select v-model="multiSelect" multiple>
    <option value="1">选项1</option>
    <option value="2">选项2</option>
  </select>
</template>
```

---

## 指令修饰符

### 事件修饰符

```vue
<template>
  <!-- 阻止默认行为 -->
  <form @submit.prevent="handleSubmit">
  
  <!-- 阻止事件冒泡 -->
  <button @click.stop="doThis">点击</button>
  
  <!-- 捕获阶段监听 -->
  <div @click.capture="doThis">
  
  <!-- 只触发一次 -->
  <button @click.once="doThis">只能点一次</button>
  
  <!-- 事件目标是元素本身时触发 -->
  <div @click.self="doThis">
  
  <!-- 修饰符可以串联 -->
  <form @submit.prevent.once="handleSubmit">
</template>
```

**passive 修饰符**：
```vue
<!-- 告诉浏览器不会调用 preventDefault -->
<div @scroll.passive="onScroll">滚动内容</div>
```

### 按键修饰符

```vue
<template>
  <!-- 按键别名 -->
  <input @keyup.enter="submit">
  <input @keyup.tab="nextField">
  <input @keyup.delete="remove">
  <input @keyup.esc="cancel">
  <input @keyup.space="pause">
  <input @keyup.up="moveUp">
  <input @keyup.down="moveDown">
  <input @keyup.left="moveLeft">
  <input @keyup.right="moveRight">
  
  <!-- 按键码（不推荐） -->
  <input @keyup.13="submit">
  
  <!-- 自定义按键别名 -->
  <input @keyup.page-down="onPageDown">
</template>
```

### 系统修饰键

```vue
<template>
  <!-- Ctrl + Click -->
  <button @click.ctrl="doThis">Ctrl+点击</button>
  
  <!-- Alt + Enter -->
  <input @keyup.alt.enter="submit">
  
  <!-- Shift + 鼠标点击 -->
  <button @click.shift="doThis">Shift+点击</button>
  
  <!-- Meta (Mac的Command键或Windows键) -->
  <button @click.meta="doThis">Command/Win+点击</button>
  
  <!-- exact 修饰符：精确匹配 -->
  <button @click.ctrl.exact="onCtrlClick">只能Ctrl</button>
  <button @click.exact="onClick">没有任何系统修饰键</button>
</template>
```

### 鼠标按钮修饰符

```vue
<template>
  <button @click.left="leftClick">左键</button>
  <button @click.right="rightClick">右键</button>
  <button @click.middle="middleClick">中键</button>
</template>
```

### v-model 修饰符

```vue
<script setup>
const message = ref('')
const age = ref(0)
const description = ref('')
</script>

<template>
  <!-- lazy: 在 change 事件后同步（而非 input） -->
  <input v-model.lazy="message">
  
  <!-- number: 自动转换为数字 -->
  <input v-model.number="age" type="number">
  
  <!-- trim: 自动去除首尾空格 -->
  <input v-model.trim="description">
  
  <!-- 修饰符可以组合 -->
  <input v-model.lazy.trim="message">
</template>
```

---

## 指令简写

Vue 提供了两个常用指令的简写语法：

```vue
<template>
  <!-- v-bind 简写为 : -->
  <img v-bind:src="url">
  <img :src="url">
  
  <!-- v-on 简写为 @ -->
  <button v-on:click="doThis">
  <button @click="doThis">
  
  <!-- v-slot 简写为 # -->
  <template v-slot:header>
  <template #header>
</template>
```

---

## 易错点与边界情况

### 1. 插值中的限制

```vue
<script setup>
const count = ref(0)
</script>

<template>
  <!-- ❌ 不能使用语句 -->
  <p>{{ var a = 1 }}</p>
  <p>{{ if (count > 10) { return 'yes' } }}</p>
  
  <!-- ✅ 使用表达式 -->
  <p>{{ count > 10 ? 'yes' : 'no' }}</p>
  
  <!-- ❌ 不能访问用户定义的全局变量 -->
  <p>{{ window.location.href }}</p>
  
  <!-- ✅ 使用组件内的数据 -->
  <script setup>
  const url = window.location.href
  </script>
  <p>{{ url }}</p>
</template>
```

### 2. 动态参数的限制

```vue
<script setup>
const attrName = ref('href')
const eventName = ref('click')
</script>

<template>
  <!-- ✅ 正确 -->
  <a :[attrName]="url">链接</a>
  <button @[eventName]="doThis">按钮</button>
  
  <!-- ❌ 动态参数值必须是字符串或 null -->
  <a :[someObject]="url">
  
  <!-- ❌ 动态参数表达式中不能有空格和引号 -->
  <a :['foo' + bar]="url">
  
  <!-- ✅ 使用计算属性替代 -->
  <script setup>
  const attrName = computed(() => 'foo' + bar.value)
  </script>
  <a :[attrName]="url">
</template>
```

### 3. v-model 在组件上的陷阱

```vue
<!-- 父组件 -->
<script setup>
const modelValue = ref('')
</script>

<template>
  <!-- v-model 在组件上 -->
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

---

## 前端工程实践

### 示例 1：表单验证

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const email = ref('')
const password = ref('')

const emailError = computed(() => {
  if (!email.value) return ''
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email.value) ? '' : '邮箱格式不正确'
})

const passwordError = computed(() => {
  if (!password.value) return ''
  return password.value.length >= 6 ? '' : '密码至少6位'
})

const canSubmit = computed(() => {
  return email.value && password.value && !emailError.value && !passwordError.value
})

function handleSubmit() {
  if (canSubmit.value) {
    console.log('提交表单', { email: email.value, password: password.value })
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <input
        v-model.trim="email"
        type="email"
        placeholder="邮箱"
        @blur="() => emailError"
      >
      <span v-if="emailError" class="error">{{ emailError }}</span>
    </div>
    
    <div>
      <input
        v-model="password"
        type="password"
        placeholder="密码"
      >
      <span v-if="passwordError" class="error">{{ passwordError }}</span>
    </div>
    
    <button type="submit" :disabled="!canSubmit">登录</button>
  </form>
</template>
```

### 示例 2：动态表单字段

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Field {
  type: 'text' | 'number' | 'select'
  name: string
  label: string
  options?: string[]
}

const fields: Field[] = [
  { type: 'text', name: 'username', label: '用户名' },
  { type: 'number', name: 'age', label: '年龄' },
  { type: 'select', name: 'city', label: '城市', options: ['北京', '上海', '广州'] }
]

const formData = ref<Record<string, any>>({})
</script>

<template>
  <form>
    <div v-for="field in fields" :key="field.name">
      <label>{{ field.label }}</label>
      
      <input
        v-if="field.type === 'text'"
        v-model="formData[field.name]"
        type="text"
      >
      
      <input
        v-else-if="field.type === 'number'"
        v-model.number="formData[field.name]"
        type="number"
      >
      
      <select
        v-else-if="field.type === 'select'"
        v-model="formData[field.name]"
      >
        <option v-for="opt in field.options" :key="opt" :value="opt">
          {{ opt }}
        </option>
      </select>
    </div>
  </form>
</template>
```

### 示例 3：快捷键系统

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const shortcuts = {
  'ctrl+s': save,
  'ctrl+p': print,
  'esc': close
}

function handleKeydown(event: KeyboardEvent) {
  const key = [
    event.ctrlKey && 'ctrl',
    event.altKey && 'alt',
    event.shiftKey && 'shift',
    event.key.toLowerCase()
  ].filter(Boolean).join('+')
  
  const handler = shortcuts[key]
  if (handler) {
    event.preventDefault()
    handler()
  }
}

function save() {
  console.log('保存')
}

function print() {
  console.log('打印')
}

function close() {
  console.log('关闭')
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div>
    <p>快捷键：</p>
    <ul>
      <li>Ctrl+S - 保存</li>
      <li>Ctrl+P - 打印</li>
      <li>Esc - 关闭</li>
    </ul>
  </div>
</template>
```

---

## 最佳实践

1. **优先使用简写**：`:` 和 `@` 更简洁
2. **合理使用修饰符**：提升代码可读性
3. **避免复杂表达式**：使用计算属性
4. **v-model 配合修饰符**：自动处理类型和格式
5. **动态参数谨慎使用**：注意命名限制

---

## 参考资料

- [Vue 3 模板语法](https://cn.vuejs.org/guide/essentials/template-syntax.html)
- [事件处理](https://cn.vuejs.org/guide/essentials/event-handling.html)
- [表单输入绑定](https://cn.vuejs.org/guide/essentials/forms.html)
