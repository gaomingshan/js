# 第 2 节：模板语法

## 概述

Vue 使用基于 HTML 的模板语法，允许你声明式地将组件实例的数据绑定到 DOM。模板会被编译成渲染函数，Vue 自动追踪依赖并高效更新 DOM。

## 一、文本插值

### 1.1 双大括号语法

```vue
<template>
  <p>消息: {{ message }}</p>
  <p>计算: {{ count + 1 }}</p>
  <p>方法: {{ formatDate(date) }}</p>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue!')
const count = ref(10)
const date = ref(new Date())

function formatDate(d) {
  return d.toLocaleDateString()
}
</script>
```

### 1.2 原始 HTML

```vue
<template>
  <!-- 输出纯文本 -->
  <p>{{ rawHtml }}</p>
  
  <!-- 输出 HTML（谨慎使用，防止 XSS） -->
  <p v-html="rawHtml"></p>
</template>

<script setup>
import { ref } from 'vue'
const rawHtml = ref('<span style="color: red">红色文字</span>')
</script>
```

> **⚠️ 安全提示**  
> `v-html` 会将内容作为 HTML 插入，可能导致 XSS 攻击。  
> 只对可信内容使用，永远不要用于用户输入。

## 二、指令系统

### 2.1 指令概览

| 指令 | 作用 | 简写 |
|------|------|------|
| `v-bind` | 绑定属性 | `:` |
| `v-on` | 绑定事件 | `@` |
| `v-if` | 条件渲染 | - |
| `v-for` | 列表渲染 | - |
| `v-model` | 双向绑定 | - |
| `v-show` | 显示/隐藏 | - |
| `v-slot` | 插槽 | `#` |

### 2.2 v-bind 属性绑定

```vue
<template>
  <!-- 完整语法 -->
  <img v-bind:src="imageUrl" />
  
  <!-- 简写（推荐） -->
  <img :src="imageUrl" />
  <a :href="link">链接</a>
  
  <!-- 动态属性名 -->
  <button :[attrName]="value">按钮</button>
  
  <!-- 绑定多个属性 -->
  <div v-bind="objectAttrs"></div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const imageUrl = ref('/logo.png')
const link = ref('https://vuejs.org')
const attrName = ref('disabled')
const value = ref(true)

const objectAttrs = reactive({
  id: 'container',
  class: 'wrapper'
})
</script>
```

### 2.3 v-on 事件绑定

```vue
<template>
  <!-- 完整语法 -->
  <button v-on:click="handleClick">点击</button>
  
  <!-- 简写（推荐） -->
  <button @click="handleClick">点击</button>
  
  <!-- 内联表达式 -->
  <button @click="count++">计数: {{ count }}</button>
  
  <!-- 传递参数 -->
  <button @click="greet('Vue')">问候</button>
  
  <!-- 访问原生事件 -->
  <button @click="handleEvent($event)">事件</button>
  
  <!-- 动态事件名 -->
  <button @[eventName]="handler">动态</button>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
const eventName = ref('click')

function handleClick() {
  console.log('clicked')
}

function greet(name) {
  console.log(`Hello ${name}`)
}

function handleEvent(event) {
  console.log(event.target)
}

function handler() {
  console.log('handled')
}
</script>
```

## 三、条件渲染

### 3.1 v-if / v-else-if / v-else

```vue
<template>
  <div v-if="score >= 90">优秀</div>
  <div v-else-if="score >= 60">及格</div>
  <div v-else>不及格</div>
  
  <!-- 在 template 上使用（不渲染额外元素） -->
  <template v-if="showDetails">
    <h2>标题</h2>
    <p>内容</p>
  </template>
</template>

<script setup>
import { ref } from 'vue'
const score = ref(85)
const showDetails = ref(true)
</script>
```

### 3.2 v-show

```vue
<template>
  <!-- v-show 只切换 display 属性 -->
  <div v-show="isVisible">内容</div>
</template>

<script setup>
import { ref } from 'vue'
const isVisible = ref(true)
</script>
```

### 3.3 v-if vs v-show

| 特性 | v-if | v-show |
|------|------|--------|
| 渲染方式 | 条件为假时不渲染 | 始终渲染，CSS 控制显隐 |
| 切换开销 | 高（销毁/重建） | 低（只改 CSS） |
| 初始开销 | 低（假时不渲染） | 高（始终渲染） |
| 适用场景 | 条件很少改变 | 频繁切换 |

## 四、列表渲染

### 4.1 v-for 基础

```vue
<template>
  <!-- 遍历数组 -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
  
  <!-- 带索引 -->
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      {{ index }}: {{ item.name }}
    </li>
  </ul>
  
  <!-- 遍历对象 -->
  <div v-for="(value, key, index) in object" :key="key">
    {{ index }}. {{ key }}: {{ value }}
  </div>
  
  <!-- 遍历数字范围 -->
  <span v-for="n in 10" :key="n">{{ n }}</span>
</template>

<script setup>
import { ref, reactive } from 'vue'

const items = ref([
  { id: 1, name: 'Vue' },
  { id: 2, name: 'React' },
  { id: 3, name: 'Angular' }
])

const object = reactive({
  name: 'Vue',
  version: '3.x',
  author: 'Evan You'
})
</script>
```

### 4.2 key 的作用

```vue
<template>
  <!-- ✅ 使用唯一 id 作为 key -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
  
  <!-- ❌ 避免使用 index 作为 key（除非列表是静态的） -->
  <li v-for="(item, index) in items" :key="index">
    {{ item.name }}
  </li>
</template>
```

> **💡 为什么需要 key**  
> key 帮助 Vue 识别节点身份，在列表变化时正确复用和重排 DOM。  
> 使用稳定唯一的 id 可以避免不必要的 DOM 操作。

### 4.3 v-for 与 v-if

```vue
<template>
  <!-- ❌ 不推荐：v-if 和 v-for 同时使用 -->
  <li v-for="item in items" v-if="item.active" :key="item.id">
    {{ item.name }}
  </li>
  
  <!-- ✅ 推荐：用 computed 过滤 -->
  <li v-for="item in activeItems" :key="item.id">
    {{ item.name }}
  </li>
  
  <!-- ✅ 或者用 template 包裹 -->
  <template v-for="item in items" :key="item.id">
    <li v-if="item.active">{{ item.name }}</li>
  </template>
</template>

<script setup>
import { ref, computed } from 'vue'

const items = ref([
  { id: 1, name: 'Vue', active: true },
  { id: 2, name: 'React', active: false }
])

const activeItems = computed(() => 
  items.value.filter(item => item.active)
)
</script>
```

## 五、Class 与 Style 绑定

### 5.1 Class 绑定

```vue
<template>
  <!-- 对象语法 -->
  <div :class="{ active: isActive, error: hasError }"></div>
  
  <!-- 数组语法 -->
  <div :class="[activeClass, errorClass]"></div>
  
  <!-- 混合使用 -->
  <div :class="[{ active: isActive }, errorClass]"></div>
  
  <!-- 绑定计算属性 -->
  <div :class="classObject"></div>
</template>

<script setup>
import { ref, computed } from 'vue'

const isActive = ref(true)
const hasError = ref(false)
const activeClass = ref('active')
const errorClass = ref('error')

const classObject = computed(() => ({
  active: isActive.value,
  error: hasError.value
}))
</script>
```

### 5.2 Style 绑定

```vue
<template>
  <!-- 对象语法（属性名用驼峰或引号包裹的短横线） -->
  <div :style="{ color: textColor, fontSize: fontSize + 'px' }"></div>
  <div :style="{ 'font-size': fontSize + 'px' }"></div>
  
  <!-- 绑定样式对象 -->
  <div :style="styleObject"></div>
  
  <!-- 数组语法（合并多个样式对象） -->
  <div :style="[baseStyles, overrideStyles]"></div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const textColor = ref('red')
const fontSize = ref(16)

const styleObject = reactive({
  color: 'blue',
  fontSize: '14px'
})

const baseStyles = reactive({ color: 'black' })
const overrideStyles = reactive({ fontWeight: 'bold' })
</script>
```

## 六、修饰符

### 6.1 事件修饰符

```vue
<template>
  <!-- 阻止默认行为 -->
  <form @submit.prevent="onSubmit"></form>
  
  <!-- 阻止冒泡 -->
  <div @click.stop="handleClick"></div>
  
  <!-- 只触发一次 -->
  <button @click.once="doOnce"></button>
  
  <!-- 捕获模式 -->
  <div @click.capture="handleCapture"></div>
  
  <!-- 只在 event.target 是元素本身时触发 -->
  <div @click.self="handleSelf"></div>
  
  <!-- 链式使用 -->
  <a @click.stop.prevent="handleClick"></a>
</template>
```

### 6.2 按键修饰符

```vue
<template>
  <!-- 按键别名 -->
  <input @keyup.enter="submit" />
  <input @keyup.esc="cancel" />
  
  <!-- 系统修饰键 -->
  <input @keyup.ctrl.enter="save" />
  <div @click.ctrl="handleCtrlClick"></div>
  
  <!-- 精确修饰符 -->
  <button @click.ctrl.exact="onCtrlClick"></button>
</template>
```

### 6.3 表单修饰符

```vue
<template>
  <!-- 在 change 事件后同步（而非 input） -->
  <input v-model.lazy="message" />
  
  <!-- 自动转换为数字 -->
  <input v-model.number="age" type="number" />
  
  <!-- 去除首尾空格 -->
  <input v-model.trim="name" />
</template>
```

## 七、总结

| 语法 | 用途 | 示例 |
|------|------|------|
| `{{ }}` | 文本插值 | `{{ message }}` |
| `v-bind` / `:` | 属性绑定 | `:href="url"` |
| `v-on` / `@` | 事件绑定 | `@click="handler"` |
| `v-if` | 条件渲染 | `v-if="show"` |
| `v-for` | 列表渲染 | `v-for="item in list"` |
| `v-model` | 双向绑定 | `v-model="value"` |

## 参考资料

- [Vue 模板语法](https://vuejs.org/guide/essentials/template-syntax.html)
- [条件渲染](https://vuejs.org/guide/essentials/conditional.html)
- [列表渲染](https://vuejs.org/guide/essentials/list.html)

---

**下一节** → [第 3 节：响应式基础](./03-reactivity-basics.md)
