# 类与样式绑定

> Vue 为 class 和 style 提供了增强的绑定语法，支持对象、数组和响应式数据。

## 核心概念

### 绑定 Class

#### 对象语法

```vue
<script setup>
const isActive = ref(true)
const hasError = ref(false)

const classObject = reactive({
  active: true,
  'text-danger': false
})
</script>

<template>
  <!-- 对象语法 -->
  <div :class="{ active: isActive, 'text-danger': hasError }"></div>
  
  <!-- 绑定响应式对象 -->
  <div :class="classObject"></div>
  
  <!-- 结合静态 class -->
  <div class="static" :class="{ active: isActive }"></div>
  <!-- 渲染结果：<div class="static active"></div> -->
</template>
```

#### 数组语法

```vue
<script setup>
const activeClass = ref('active')
const errorClass = ref('text-danger')

const classList = ref(['active', 'text-bold'])
</script>

<template>
  <!-- 数组语法 -->
  <div :class="[activeClass, errorClass]"></div>
  
  <!-- 数组中使用三元表达式 -->
  <div :class="[isActive ? activeClass : '', errorClass]"></div>
  
  <!-- 数组中使用对象语法 -->
  <div :class="[{ active: isActive }, errorClass]"></div>
  
  <!-- 绑定数组 -->
  <div :class="classList"></div>
</template>
```

#### 组件上使用 class

```vue
<!-- 子组件 MyComponent.vue -->
<template>
  <div class="component-root">
    内容
  </div>
</template>

<!-- 父组件 -->
<template>
  <!-- class 会被添加到子组件的根元素上 -->
  <MyComponent class="custom-class" />
  
  <!-- 渲染结果 -->
  <!-- <div class="component-root custom-class">内容</div> -->
</template>
```

**多根节点组件**：

```vue
<!-- 子组件 -->
<template>
  <div :class="$attrs.class">第一个根节点</div>
  <div>第二个根节点</div>
</template>

<!-- 父组件 -->
<template>
  <MyComponent class="custom" />
  <!-- class 不会自动应用，需要手动指定 -->
</template>
```

---

### 绑定 Style

#### 对象语法

```vue
<script setup>
const activeColor = ref('red')
const fontSize = ref(30)

const styleObject = reactive({
  color: 'red',
  fontSize: '13px'
})
</script>

<template>
  <!-- 对象语法 -->
  <div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
  
  <!-- 绑定对象 -->
  <div :style="styleObject"></div>
  
  <!-- CSS 属性名可以用驼峰或短横线（需要加引号） -->
  <div :style="{ fontSize: '20px' }"></div>
  <div :style="{ 'font-size': '20px' }"></div>
</template>
```

#### 数组语法

```vue
<script setup>
const baseStyles = { color: 'red' }
const overridingStyles = { fontSize: '20px' }
</script>

<template>
  <!-- 数组语法：合并多个样式对象 -->
  <div :style="[baseStyles, overridingStyles]"></div>
  <!-- 渲染结果：style="color: red; font-size: 20px;" -->
</template>
```

#### 自动前缀

Vue 会自动为需要[浏览器前缀](https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix)的 CSS 属性添加前缀。

```vue
<template>
  <!-- Vue 会自动检测并添加 -webkit-、-moz- 等前缀 -->
  <div :style="{ transform: 'rotate(30deg)' }"></div>
</template>
```

#### 样式多值

可以为一个样式属性提供多个（前缀）值，浏览器会选择支持的最后一个值。

```vue
<template>
  <div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }"></div>
  <!-- 浏览器会使用支持的最后一个值 -->
</template>
```

---

## CSS Modules

CSS Modules 提供局部作用域的类名，避免样式冲突。

```vue
<template>
  <div :class="$style.container">
    <p :class="$style.text">内容</p>
  </div>
</template>

<style module>
.container {
  padding: 20px;
}

.text {
  color: blue;
}
</style>
```

**自定义模块名**：

```vue
<template>
  <div :class="classes.container">内容</div>
</template>

<style module="classes">
.container {
  padding: 20px;
}
</style>
```

**在 script 中使用**：

```vue
<script setup>
import { useCssModule } from 'vue'

// 默认模块
const styles = useCssModule()

// 命名模块
const classes = useCssModule('classes')

console.log(styles.container) // "_container_1a2b3c"
</script>
```

---

## Scoped 样式

`scoped` 属性使样式只作用于当前组件。

```vue
<template>
  <div class="example">内容</div>
</template>

<style scoped>
.example {
  color: red;
}
</style>

<!-- 编译后 -->
<!-- <div class="example" data-v-f3f3eg9>内容</div> -->
<!-- <style>
.example[data-v-f3f3eg9] {
  color: red;
}
</style> -->
```

### 深度选择器

```vue
<style scoped>
/* 影响子组件的根元素 */
.parent :deep(.child) {
  color: red;
}

/* Vue 2 语法（已废弃但仍可用） */
.parent >>> .child { }
.parent /deep/ .child { }
.parent ::v-deep .child { }
</style>
```

### 插槽选择器

```vue
<style scoped>
/* 作用于插槽内容 */
:slotted(.slot-content) {
  color: red;
}
</style>
```

### 全局选择器

```vue
<style scoped>
/* 全局样式 */
:global(.global-class) {
  color: red;
}
</style>
```

---

## v-bind() 在 CSS 中

Vue 3.2+ 支持在 CSS 中绑定响应式变量。

```vue
<script setup>
const theme = ref({
  color: 'red',
  fontSize: '14px'
})

const color = ref('blue')
</script>

<template>
  <div class="text">动态颜色</div>
</template>

<style scoped>
.text {
  /* 绑定响应式变量 */
  color: v-bind(color);
  font-size: v-bind('theme.fontSize');
  
  /* 使用 JavaScript 表达式（需要引号） */
  margin: v-bind('theme.fontSize + "px"');
}
</style>
```

**原理**：编译为 CSS 变量

```css
/* 编译后 */
.text {
  color: var(--7a7a7a);
  font-size: var(--7a7a7b);
}
```

```javascript
// JavaScript 中设置
el.style.setProperty('--7a7a7a', color.value)
```

---

## 易错点与边界情况

### 1. Class 优先级

```vue
<template>
  <!-- 静态 class 和动态 class 会合并 -->
  <div class="static" :class="{ dynamic: true }"></div>
  <!-- 结果：class="static dynamic" -->
  
  <!-- 重复的 class 只保留一个 -->
  <div class="foo" :class="['foo', 'bar']"></div>
  <!-- 结果：class="foo bar" -->
</template>
```

### 2. Style 对象的响应式

```vue
<script setup>
// ❌ 不推荐：修改对象内部属性
const style = { color: 'red' }
style.color = 'blue' // 不响应式

// ✅ 推荐：使用 reactive
const style = reactive({ color: 'red' })
style.color = 'blue' // 响应式

// ✅ 推荐：使用 ref 包装整个对象
const style = ref({ color: 'red' })
style.value = { color: 'blue' } // 响应式
</script>
```

### 3. CSS Modules 与 Scoped 的区别

```vue
<!-- CSS Modules：生成唯一的 class 名 -->
<style module>
.button { /* 编译为 .button_abc123 */ }
</style>

<!-- Scoped：添加属性选择器 -->
<style scoped>
.button { /* 编译为 .button[data-v-xyz] */ }
</style>
```

**性能对比**：
- CSS Modules：类名更短，性能更好
- Scoped：兼容性更好，更常用

### 4. v-bind() 的限制

```vue
<script setup>
const size = ref(14)
</script>

<style scoped>
.text {
  /* ✅ 正确 */
  font-size: v-bind(size + 'px');
  
  /* ❌ 不能用于选择器 */
  .v-bind(className) { }
  
  /* ❌ 不能用于媒体查询 */
  @media (min-width: v-bind(breakpoint)) { }
}
</style>
```

---

## 前端工程实践

### 示例 1：主题切换

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

const themeColors = computed(() => {
  return theme.value === 'light' 
    ? {
        background: '#ffffff',
        text: '#000000',
        primary: '#42b983'
      }
    : {
        background: '#1a1a1a',
        text: '#ffffff',
        primary: '#42b983'
      }
})

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <div class="app">
    <button @click="toggleTheme">切换主题</button>
    <div class="content">内容区域</div>
  </div>
</template>

<style scoped>
.app {
  background: v-bind('themeColors.background');
  color: v-bind('themeColors.text');
  min-height: 100vh;
  transition: all 0.3s;
}

.content {
  border: 2px solid v-bind('themeColors.primary');
}
</style>
```

### 示例 2：条件样式组合

```vue
<script setup lang="ts">
interface ButtonProps {
  type?: 'primary' | 'success' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'primary',
  size: 'medium'
})

const buttonClass = computed(() => ({
  [`btn-${props.type}`]: true,
  [`btn-${props.size}`]: true,
  'btn-disabled': props.disabled,
  'btn-loading': props.loading
}))
</script>

<template>
  <button :class="buttonClass" :disabled="disabled || loading">
    <span v-if="loading" class="spinner"></span>
    <slot />
  </button>
</template>

<style scoped>
.btn-primary { background: #409eff; }
.btn-success { background: #67c23a; }
.btn-danger { background: #f56c6c; }

.btn-small { padding: 5px 10px; font-size: 12px; }
.btn-medium { padding: 10px 20px; font-size: 14px; }
.btn-large { padding: 15px 30px; font-size: 16px; }

.btn-disabled { opacity: 0.5; cursor: not-allowed; }
.btn-loading { position: relative; }
</style>
```

### 示例 3：响应式样式

```vue
<script setup>
import { ref, computed } from 'vue'

const windowWidth = ref(window.innerWidth)

window.addEventListener('resize', () => {
  windowWidth.value = window.innerWidth
})

const containerClass = computed(() => ({
  'container-mobile': windowWidth.value < 768,
  'container-tablet': windowWidth.value >= 768 && windowWidth.value < 1024,
  'container-desktop': windowWidth.value >= 1024
}))

const fontSize = computed(() => {
  if (windowWidth.value < 768) return '14px'
  if (windowWidth.value < 1024) return '16px'
  return '18px'
})
</script>

<template>
  <div :class="containerClass" class="container">
    <p class="text">响应式文本</p>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
}

.container-mobile { max-width: 100%; }
.container-tablet { max-width: 720px; margin: 0 auto; }
.container-desktop { max-width: 1140px; margin: 0 auto; }

.text {
  font-size: v-bind(fontSize);
  transition: font-size 0.3s;
}
</style>
```

### 示例 4：动画状态类

```vue
<script setup>
const isVisible = ref(false)
const isAnimating = ref(false)

async function toggle() {
  if (isVisible.value) {
    // 淡出
    isAnimating.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    isVisible.value = false
    isAnimating.value = false
  } else {
    // 淡入
    isVisible.value = true
    isAnimating.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    isAnimating.value = false
  }
}
</script>

<template>
  <button @click="toggle">切换</button>
  
  <div
    v-if="isVisible"
    :class="{
      'fade-in': isAnimating && isVisible,
      'fade-out': isAnimating && !isVisible
    }"
    class="box"
  >
    内容
  </div>
</template>

<style scoped>
.box {
  padding: 20px;
  background: #42b983;
}

.fade-in {
  animation: fadeIn 0.3s;
}

.fade-out {
  animation: fadeOut 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
}
</style>
```

---

## 最佳实践

1. **Class 优先于 Style**：更易维护和复用
2. **使用 CSS Modules 或 Scoped**：避免样式冲突
3. **计算属性管理复杂逻辑**：保持模板简洁
4. **v-bind() 用于主题变量**：响应式主题切换
5. **避免内联样式**：除非动态计算的值
6. **使用 CSS 变量**：更灵活的主题系统

---

## 参考资料

- [Class 与 Style 绑定](https://cn.vuejs.org/guide/essentials/class-and-style.html)
- [SFC CSS 特性](https://cn.vuejs.org/api/sfc-css-features.html)
- [状态驱动的动态 CSS](https://cn.vuejs.org/api/sfc-css-features.html#v-bind-in-css)
