# SFC 语法特性

> 单文件组件（SFC）的语法特性和编译优化。

## 核心概念

单文件组件（Single-File Component）将模板、逻辑和样式封装在一个 `.vue` 文件中。

### 基础结构

```vue
<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script setup lang="ts">
const msg = ref('Hello Vue 3!')
</script>

<style scoped>
.hello {
  color: #42b983;
}
</style>
```

---

## `<script setup>`

### 优势

1. **更少的样板代码**：无需显式 return
2. **更好的类型推断**：TypeScript 支持更好
3. **更好的运行时性能**：编译优化
4. **顶层绑定自动暴露**：组件模板可直接使用

### 基础用法

```vue
<script setup>
import { ref, computed } from 'vue'
import MyComponent from './MyComponent.vue'

// 变量
const count = ref(0)

// 计算属性
const double = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}

// 导入的组件自动注册
// 无需 components 选项
</script>

<template>
  <div>
    <p>{{ count }} x 2 = {{ double }}</p>
    <button @click="increment">+1</button>
    <MyComponent />
  </div>
</template>
```

### 与普通 `<script>` 结合

```vue
<script>
// 普通 script：定义组件选项
export default {
  name: 'MyComponent',
  inheritAttrs: false
}
</script>

<script setup>
// script setup：组合式 API
const count = ref(0)
</script>

<!-- Vue 3.3+ 推荐方式 -->
<script setup>
defineOptions({
  name: 'MyComponent',
  inheritAttrs: false
})

const count = ref(0)
</script>
```

---

## `<template>` 特性

### 多根节点

```vue
<template>
  <!-- Vue 3 支持多根节点 -->
  <header>Header</header>
  <main>Main</main>
  <footer>Footer</footer>
</template>
```

### 注释

```vue
<template>
  <!-- HTML 注释 -->
  <div>Content</div>
  
  <!-- 
    多行注释
    会被编译器处理
  -->
</template>
```

### 预处理器

```vue
<template lang="pug">
div.container
  h1 {{ title }}
  p {{ content }}
</template>
```

---

## `<style>` 特性

### scoped 样式

```vue
<style scoped>
/* 只作用于当前组件 */
.button {
  color: red;
}
</style>

<!-- 编译后 -->
<style>
.button[data-v-f3f3eg9] {
  color: red;
}
</style>

<template>
  <button data-v-f3f3eg9>Click</button>
</template>
```

### 深度选择器

```vue
<style scoped>
/* Vue 3 语法 */
.parent :deep(.child) {
  color: red;
}

/* 旧语法（仍支持）*/
.parent >>> .child {
  color: red;
}

.parent /deep/ .child {
  color: red;
}
</style>
```

### 插槽选择器

```vue
<style scoped>
/* 作用于插槽内容 */
:slotted(.slot-content) {
  color: blue;
}
</style>
```

### 全局选择器

```vue
<style scoped>
/* 在 scoped 中定义全局样式 */
:global(.global-class) {
  color: green;
}
</style>
```

### CSS Modules

```vue
<template>
  <p :class="$style.red">Red text</p>
  <p :class="classes.bold">Bold text</p>
</template>

<style module>
.red {
  color: red;
}
</style>

<style module="classes">
.bold {
  font-weight: bold;
}
</style>

<script setup>
import { useCssModule } from 'vue'

// 访问默认 CSS Module
const styles = useCssModule()
console.log(styles.red)

// 访问命名 CSS Module
const classes = useCssModule('classes')
console.log(classes.bold)
</script>
```

### v-bind() in CSS

```vue
<script setup>
const theme = reactive({
  color: 'red',
  fontSize: '14px'
})
</script>

<style scoped>
.text {
  /* 在 CSS 中使用 JS 变量 */
  color: v-bind('theme.color');
  font-size: v-bind('theme.fontSize');
}
</style>
```

### 预处理器

```vue
<!-- SCSS -->
<style lang="scss" scoped>
$primary-color: #42b983;

.button {
  background: $primary-color;
  
  &:hover {
    background: darken($primary-color, 10%);
  }
}
</style>

<!-- Less -->
<style lang="less" scoped>
@primary-color: #42b983;

.button {
  background: @primary-color;
  
  &:hover {
    background: darken(@primary-color, 10%);
  }
}
</style>

<!-- Stylus -->
<style lang="stylus" scoped>
primary-color = #42b983

.button
  background primary-color
  
  &:hover
    background darken(primary-color, 10%)
</style>
```

---

## `<script>` 特性

### TypeScript

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface User {
  id: number
  name: string
}

const user = ref<User>({
  id: 1,
  name: 'Alice'
})

function updateUser(newUser: User) {
  user.value = newUser
}
</script>
```

### 泛型组件

```vue
<script setup lang="ts" generic="T extends string | number">
defineProps<{
  value: T
  items: T[]
}>()
</script>

<template>
  <div>Value: {{ value }}</div>
  <div v-for="item in items" :key="item">
    {{ item }}
  </div>
</template>
```

---

## 自定义块

### i18n 块

```vue
<i18n>
{
  "en": {
    "hello": "Hello"
  },
  "zh": {
    "hello": "你好"
  }
}
</i18n>

<template>
  <p>{{ $t('hello') }}</p>
</template>
```

### docs 块

```vue
<docs>
# MyComponent

这是一个示例组件。

## Props
- title: string
- count: number

## Events
- update: 触发更新
</docs>

<template>
  <div>Component</div>
</template>
```

---

## src 导入

可以将各个部分拆分到单独文件。

```vue
<template src="./template.html"></template>
<script src="./script.js"></script>
<style src="./style.css"></style>
```

**使用场景**：
- 大型组件拆分
- 团队协作（设计师负责模板，开发者负责逻辑）
- 代码复用

---

## 编译优化

### 静态提升

```vue
<template>
  <div>
    <!-- 静态内容会被提升 -->
    <h1>Title</h1>
    
    <!-- 动态内容 -->
    <p>{{ message }}</p>
  </div>
</template>
```

编译后：

```javascript
const _hoisted_1 = /*#__PURE__*/createElementVNode("h1", null, "Title", -1)

export function render(_ctx, _cache) {
  return (openBlock(), createElementBlock("div", null, [
    _hoisted_1, // 静态节点被提升
    createElementVNode("p", null, toDisplayString(_ctx.message), 1)
  ]))
}
```

### 补丁标记

```vue
<template>
  <div :class="dynamicClass">
    <p>Static text</p>
    <p>{{ dynamicText }}</p>
  </div>
</template>
```

编译后：

```javascript
export function render(_ctx, _cache) {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(_ctx.dynamicClass)
  }, [
    _hoisted_1, // 静态 <p>
    createElementVNode("p", null, toDisplayString(_ctx.dynamicText), 1 /* TEXT */)
  ], 2 /* CLASS */))
}
```

**补丁标记类型**：
- `1`: TEXT - 动态文本
- `2`: CLASS - 动态 class
- `4`: STYLE - 动态 style
- `8`: PROPS - 动态 props
- `16`: FULL_PROPS - 有 key 的动态 props
- `32`: HYDRATE_EVENTS - 有事件监听器

### 缓存事件处理器

```vue
<template>
  <!-- 事件处理器会被缓存 -->
  <button @click="handleClick">Click</button>
</template>
```

编译后：

```javascript
export function render(_ctx, _cache) {
  return (openBlock(), createElementBlock("button", {
    onClick: _cache[0] || (_cache[0] = (...args) => (_ctx.handleClick(...args)))
  }, "Click"))
}
```

---

## 实战示例

### 示例 1：完整的表单组件

```vue
<template>
  <form @submit.prevent="handleSubmit" class="form">
    <div class="form-group">
      <label :for="fieldId('email')">邮箱</label>
      <input
        :id="fieldId('email')"
        v-model="form.email"
        type="email"
        required
        :class="{ error: errors.email }"
      >
      <span v-if="errors.email" class="error-message">
        {{ errors.email }}
      </span>
    </div>
    
    <div class="form-group">
      <label :for="fieldId('password')">密码</label>
      <input
        :id="fieldId('password')"
        v-model="form.password"
        type="password"
        required
        :class="{ error: errors.password }"
      >
      <span v-if="errors.password" class="error-message">
        {{ errors.password }}
      </span>
    </div>
    
    <button type="submit" :disabled="loading">
      {{ loading ? '提交中...' : '提交' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface FormData {
  email: string
  password: string
}

interface Errors {
  email?: string
  password?: string
}

const form = reactive<FormData>({
  email: '',
  password: ''
})

const errors = reactive<Errors>({})
const loading = ref(false)

const emit = defineEmits<{
  submit: [data: FormData]
}>()

function fieldId(name: string) {
  return `field-${name}-${Math.random().toString(36).slice(2)}`
}

function validate(): boolean {
  errors.email = ''
  errors.password = ''
  
  if (!form.email) {
    errors.email = '邮箱不能为空'
    return false
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '邮箱格式不正确'
    return false
  }
  
  if (!form.password) {
    errors.password = '密码不能为空'
    return false
  }
  
  if (form.password.length < 6) {
    errors.password = '密码至少6位'
    return false
  }
  
  return true
}

async function handleSubmit() {
  if (!validate()) return
  
  loading.value = true
  try {
    emit('submit', { ...form })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
$primary-color: #42b983;
$error-color: #f56c6c;

.form {
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
  }
  
  input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: border-color 0.3s;
    
    &:focus {
      outline: none;
      border-color: $primary-color;
    }
    
    &.error {
      border-color: $error-color;
    }
  }
}

.error-message {
  display: block;
  margin-top: 5px;
  color: $error-color;
  font-size: 12px;
}

button {
  width: 100%;
  padding: 10px;
  background: $primary-color;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s;
  
  &:hover:not(:disabled) {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
```

### 示例 2：使用 CSS Modules 的卡片组件

```vue
<template>
  <div :class="[$style.card, { [$style.hoverable]: hoverable }]">
    <div v-if="$slots.header" :class="$style.header">
      <slot name="header"></slot>
    </div>
    
    <div :class="$style.body">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" :class="$style.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hoverable?: boolean
}>()
</script>

<style module>
.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.card.hoverable:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header {
  padding: 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.body {
  padding: 16px;
}

.footer {
  padding: 16px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}
</style>
```

### 示例 3：动态主题

```vue
<template>
  <div :class="$style.container">
    <button @click="toggleTheme" :class="$style.button">
      切换主题
    </button>
    <p :class="$style.text">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
const theme = reactive({
  primaryColor: '#42b983',
  textColor: '#333',
  backgroundColor: '#fff'
})

const message = ref('Hello Vue 3!')

function toggleTheme() {
  if (theme.primaryColor === '#42b983') {
    theme.primaryColor = '#ff6b6b'
    theme.textColor = '#fff'
    theme.backgroundColor = '#333'
  } else {
    theme.primaryColor = '#42b983'
    theme.textColor = '#333'
    theme.backgroundColor = '#fff'
  }
}
</script>

<style module>
.container {
  padding: 20px;
  background: v-bind('theme.backgroundColor');
  color: v-bind('theme.textColor');
  transition: all 0.3s;
}

.button {
  padding: 10px 20px;
  background: v-bind('theme.primaryColor');
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.button:hover {
  opacity: 0.8;
}

.text {
  margin-top: 20px;
  font-size: 18px;
}
</style>
```

---

## 性能优化技巧

### 1. 使用 v-once

```vue
<template>
  <!-- 只渲染一次，后续更新忽略 -->
  <div v-once>
    <h1>{{ expensiveComputation }}</h1>
  </div>
</template>
```

### 2. 使用 v-memo

```vue
<template>
  <!-- 依赖项不变时跳过更新 -->
  <div v-memo="[value1, value2]">
    <ExpensiveComponent :data="data" />
  </div>
</template>
```

### 3. 拆分大组件

```vue
<!-- ❌ 大组件 -->
<template>
  <div>
    <!-- 1000+ 行模板 -->
  </div>
</template>

<!-- ✅ 拆分成小组件 -->
<template>
  <div>
    <HeaderSection />
    <ContentSection />
    <FooterSection />
  </div>
</template>
```

### 4. 异步组件

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>
```

---

## 最佳实践

1. **使用 `<script setup>`**：更简洁、性能更好
2. **合理使用 scoped**：避免样式污染
3. **语义化类名**：使用 BEM 或其他规范
4. **TypeScript**：提供类型安全
5. **组件拆分**：保持组件简单
6. **CSS 预处理器**：提升样式开发效率
7. **性能优化**：使用 v-once、v-memo 等
8. **代码组织**：按功能分组，而非按类型

---

## 参考资料

- [SFC 语法定义](https://cn.vuejs.org/api/sfc-spec.html)
- [script setup](https://cn.vuejs.org/api/sfc-script-setup.html)
- [CSS 功能](https://cn.vuejs.org/api/sfc-css-features.html)
