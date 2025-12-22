# 第 4 节：事件与表单

## 概述

Vue 提供了简洁的事件绑定语法和强大的表单双向绑定。`v-on` 用于监听 DOM 事件，`v-model` 实现表单输入与数据的双向同步。

## 一、事件处理

### 1.1 基本事件绑定

```vue
<template>
  <!-- 完整写法 -->
  <button v-on:click="handleClick">点击</button>
  
  <!-- 简写（推荐） -->
  <button @click="handleClick">点击</button>
  
  <!-- 内联表达式 -->
  <button @click="count++">计数: {{ count }}</button>
  
  <!-- 内联调用方法 -->
  <button @click="say('hello')">Say Hello</button>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

function handleClick() {
  console.log('clicked')
}

function say(message) {
  alert(message)
}
</script>
```

### 1.2 访问事件对象

```vue
<template>
  <!-- 无参数时，自动传入 event -->
  <button @click="handleClick">点击</button>
  
  <!-- 有参数时，用 $event 传入 -->
  <button @click="handleWithArg('hello', $event)">点击</button>
</template>

<script setup>
function handleClick(event) {
  console.log(event.target)
}

function handleWithArg(msg, event) {
  console.log(msg, event.target)
}
</script>
```

### 1.3 事件修饰符

```vue
<template>
  <!-- .stop - 阻止冒泡 -->
  <div @click="outer">
    <button @click.stop="inner">不会触发 outer</button>
  </div>
  
  <!-- .prevent - 阻止默认行为 -->
  <form @submit.prevent="onSubmit">
    <button type="submit">提交</button>
  </form>
  
  <!-- .self - 只在元素自身触发 -->
  <div @click.self="handleSelf">
    <span>点击 span 不触发</span>
  </div>
  
  <!-- .once - 只触发一次 -->
  <button @click.once="doOnce">只触发一次</button>
  
  <!-- .capture - 捕获模式 -->
  <div @click.capture="handleCapture">捕获</div>
  
  <!-- .passive - 不阻止默认行为（提升滚动性能） -->
  <div @scroll.passive="onScroll">滚动</div>
  
  <!-- 修饰符可链式使用 -->
  <a @click.stop.prevent="handleLink">链接</a>
</template>
```

### 1.4 按键修饰符

```vue
<template>
  <!-- 按键别名 -->
  <input @keyup.enter="submit" />
  <input @keyup.tab="next" />
  <input @keyup.delete="remove" />  <!-- Delete 和 Backspace -->
  <input @keyup.esc="cancel" />
  <input @keyup.space="pause" />
  <input @keyup.up="up" />
  <input @keyup.down="down" />
  <input @keyup.left="left" />
  <input @keyup.right="right" />
  
  <!-- 系统修饰键 -->
  <input @keyup.ctrl.enter="save" />
  <input @keyup.alt.s="shortcut" />
  <input @keyup.shift.enter="newLine" />
  <input @keyup.meta.s="save" />  <!-- Mac: Command, Windows: Windows -->
  
  <!-- .exact - 精确匹配 -->
  <button @click.ctrl.exact="onCtrlClick">Ctrl + 点击</button>
</template>
```

### 1.5 鼠标按键修饰符

```vue
<template>
  <div @click.left="onLeftClick">左键点击</div>
  <div @click.right="onRightClick">右键点击</div>
  <div @click.middle="onMiddleClick">中键点击</div>
</template>
```

## 二、表单绑定

### 2.1 v-model 基础

```vue
<template>
  <!-- 文本输入 -->
  <input v-model="message" />
  <p>输入: {{ message }}</p>
  
  <!-- 多行文本 -->
  <textarea v-model="content"></textarea>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('')
const content = ref('')
</script>
```

### 2.2 v-model 原理

```vue
<template>
  <!-- v-model 是语法糖 -->
  <input v-model="message" />
  
  <!-- 等价于 -->
  <input :value="message" @input="message = $event.target.value" />
</template>
```

### 2.3 复选框

```vue
<template>
  <!-- 单个复选框：绑定布尔值 -->
  <input type="checkbox" id="agree" v-model="agreed" />
  <label for="agree">同意</label>
  <p>{{ agreed }}</p>
  
  <!-- 多个复选框：绑定数组 -->
  <input type="checkbox" id="vue" value="Vue" v-model="selected" />
  <label for="vue">Vue</label>
  
  <input type="checkbox" id="react" value="React" v-model="selected" />
  <label for="react">React</label>
  
  <p>选中: {{ selected }}</p>
</template>

<script setup>
import { ref } from 'vue'

const agreed = ref(false)
const selected = ref([])  // ['Vue', 'React']
</script>
```

### 2.4 单选框

```vue
<template>
  <input type="radio" id="one" value="One" v-model="picked" />
  <label for="one">One</label>
  
  <input type="radio" id="two" value="Two" v-model="picked" />
  <label for="two">Two</label>
  
  <p>选中: {{ picked }}</p>
</template>

<script setup>
import { ref } from 'vue'
const picked = ref('One')
</script>
```

### 2.5 选择框

```vue
<template>
  <!-- 单选 -->
  <select v-model="selected">
    <option disabled value="">请选择</option>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
  
  <!-- 多选 -->
  <select v-model="multiSelected" multiple>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
  
  <!-- 动态选项 -->
  <select v-model="selectedId">
    <option v-for="option in options" :key="option.id" :value="option.id">
      {{ option.name }}
    </option>
  </select>
</template>

<script setup>
import { ref } from 'vue'

const selected = ref('')
const multiSelected = ref([])
const selectedId = ref(1)
const options = ref([
  { id: 1, name: 'Vue' },
  { id: 2, name: 'React' },
  { id: 3, name: 'Angular' }
])
</script>
```

## 三、表单修饰符

### 3.1 .lazy

```vue
<template>
  <!-- 默认：每次 input 事件同步 -->
  <input v-model="message" />
  
  <!-- .lazy：在 change 事件后同步（失焦或按回车） -->
  <input v-model.lazy="message" />
</template>
```

### 3.2 .number

```vue
<template>
  <!-- 自动转换为数字 -->
  <input v-model.number="age" type="number" />
  
  <!-- typeof age === 'number' -->
</template>

<script setup>
import { ref } from 'vue'
const age = ref(18)
</script>
```

### 3.3 .trim

```vue
<template>
  <!-- 自动去除首尾空格 -->
  <input v-model.trim="name" />
</template>
```

### 3.4 组合使用

```vue
<template>
  <input v-model.lazy.trim="username" />
  <input v-model.number.lazy="price" type="number" />
</template>
```

## 四、组件上的 v-model

### 4.1 基本用法

```vue
<!-- 父组件 -->
<template>
  <CustomInput v-model="searchText" />
  <!-- 等价于 -->
  <CustomInput :modelValue="searchText" @update:modelValue="searchText = $event" />
</template>

<!-- 子组件 CustomInput.vue -->
<template>
  <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
</template>

<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>
```

### 4.2 自定义 v-model 参数

```vue
<!-- 父组件 -->
<template>
  <CustomInput v-model:title="pageTitle" />
</template>

<!-- 子组件 -->
<script setup>
defineProps(['title'])
defineEmits(['update:title'])
</script>

<template>
  <input :value="title" @input="$emit('update:title', $event.target.value)" />
</template>
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
<script setup>
defineProps(['firstName', 'lastName'])
defineEmits(['update:firstName', 'update:lastName'])
</script>

<template>
  <input :value="firstName" @input="$emit('update:firstName', $event.target.value)" />
  <input :value="lastName" @input="$emit('update:lastName', $event.target.value)" />
</template>
```

## 五、表单验证示例

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label>用户名</label>
      <input v-model.trim="form.username" />
      <span v-if="errors.username" class="error">{{ errors.username }}</span>
    </div>
    
    <div>
      <label>邮箱</label>
      <input v-model.trim="form.email" type="email" />
      <span v-if="errors.email" class="error">{{ errors.email }}</span>
    </div>
    
    <div>
      <label>密码</label>
      <input v-model="form.password" type="password" />
      <span v-if="errors.password" class="error">{{ errors.password }}</span>
    </div>
    
    <button type="submit" :disabled="!isValid">提交</button>
  </form>
</template>

<script setup>
import { reactive, computed } from 'vue'

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const errors = reactive({
  username: '',
  email: '',
  password: ''
})

function validate() {
  errors.username = form.username.length < 3 ? '用户名至少3个字符' : ''
  errors.email = !form.email.includes('@') ? '请输入有效邮箱' : ''
  errors.password = form.password.length < 6 ? '密码至少6个字符' : ''
}

const isValid = computed(() => {
  validate()
  return !errors.username && !errors.email && !errors.password
})

function handleSubmit() {
  if (isValid.value) {
    console.log('提交表单', form)
  }
}
</script>
```

## 六、总结

| 语法 | 用途 |
|------|------|
| `@event` | 监听 DOM 事件 |
| `@event.stop` | 阻止冒泡 |
| `@event.prevent` | 阻止默认行为 |
| `@keyup.enter` | 按键修饰符 |
| `v-model` | 双向绑定 |
| `v-model.lazy` | change 时同步 |
| `v-model.number` | 转换为数字 |
| `v-model.trim` | 去除空格 |

## 参考资料

- [事件处理](https://vuejs.org/guide/essentials/event-handling.html)
- [表单输入绑定](https://vuejs.org/guide/essentials/forms.html)

---

**下一节** → [第 5 节：组件基础](./05-component-basics.md)
