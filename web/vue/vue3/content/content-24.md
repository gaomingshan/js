# Transition 过渡动画

> Transition 组件为元素的进入和离开提供过渡动画效果。

## 核心概念

`<Transition>` 是 Vue 提供的内置组件，用于在元素或组件进入/离开 DOM 时应用动画。

### 基础用法

```vue
<script setup>
const show = ref(true)
</script>

<template>
  <button @click="show = !show">Toggle</button>
  
  <Transition>
    <p v-if="show">Hello</p>
  </Transition>
</template>

<style>
/* 进入和离开的过渡 */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
```

---

## CSS 过渡类名

Vue 会在适当的时机添加/移除 CSS 类名：

### 进入过渡

1. **v-enter-from**：进入动画的起始状态
2. **v-enter-active**：进入动画的激活状态（整个过程）
3. **v-enter-to**：进入动画的结束状态

### 离开过渡

1. **v-leave-from**：离开动画的起始状态
2. **v-leave-active**：离开动画的激活状态（整个过程）
3. **v-leave-to**：离开动画的结束状态

### 时间轴

```
进入：
  v-enter-from + v-enter-active
    ↓ (下一帧)
  v-enter-active + v-enter-to
    ↓ (动画结束)
  移除所有类

离开：
  v-leave-from + v-leave-active
    ↓ (下一帧)
  v-leave-active + v-leave-to
    ↓ (动画结束)
  移除所有类 + 移除元素
```

---

## 自定义过渡类名

### name 属性

```vue
<template>
  <Transition name="fade">
    <p v-if="show">Hello</p>
  </Transition>
</template>

<style>
/* 使用 fade 前缀 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 自定义类名

```vue
<template>
  <Transition
    enter-active-class="animate__animated animate__fadeIn"
    leave-active-class="animate__animated animate__fadeOut"
  >
    <p v-if="show">Hello</p>
  </Transition>
</template>

<!-- 使用 Animate.css -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
/>
```

---

## CSS 过渡

### 基础过渡

```vue
<template>
  <Transition name="slide">
    <div v-if="show">Content</div>
  </Transition>
</template>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
```

### 多属性过渡

```vue
<style>
.complex-enter-active,
.complex-leave-active {
  transition: 
    opacity 0.3s ease,
    transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.complex-enter-from {
  opacity: 0;
  transform: scale(0.8) rotate(-10deg);
}

.complex-leave-to {
  opacity: 0;
  transform: scale(1.2) rotate(10deg);
}
</style>
```

---

## CSS 动画

### @keyframes 动画

```vue
<template>
  <Transition name="bounce">
    <div v-if="show">Bouncing!</div>
  </Transition>
</template>

<style>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-out 0.5s;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(0);
  }
}
</style>
```

### 同时使用过渡和动画

```vue
<style>
.combined-enter-active {
  /* 过渡 */
  transition: opacity 0.5s ease;
  /* 动画 */
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
</style>
```

---

## 过渡模式

控制进入和离开的时序。

### mode 属性

```vue
<template>
  <!-- 默认：同时进入和离开 -->
  <Transition>
    <component :is="currentView" />
  </Transition>
  
  <!-- out-in: 先离开，再进入 -->
  <Transition mode="out-in">
    <component :is="currentView" />
  </Transition>
  
  <!-- in-out: 先进入，再离开（很少使用） -->
  <Transition mode="in-out">
    <component :is="currentView" />
  </Transition>
</template>
```

**使用场景**：
- **out-in**：适合切换相同位置的元素，避免布局跳动
- **in-out**：很少使用，可能导致布局问题

---

## appear 初次渲染

元素初次挂载时也应用过渡。

```vue
<template>
  <!-- 初次渲染时应用过渡 -->
  <Transition appear>
    <div>Content</div>
  </Transition>
  
  <!-- 自定义初次渲染的类名 -->
  <Transition
    appear
    appear-active-class="custom-appear-active"
    appear-from-class="custom-appear-from"
    appear-to-class="custom-appear-to"
  >
    <div>Content</div>
  </Transition>
</template>
```

---

## JavaScript 钩子

通过 JavaScript 控制过渡。

### 基础钩子

```vue
<template>
  <Transition
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @enter-cancelled="onEnterCancelled"
    
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
    @leave-cancelled="onLeaveCancelled"
  >
    <div v-if="show">Content</div>
  </Transition>
</template>

<script setup>
function onBeforeEnter(el) {
  // 设置初始状态
  el.style.opacity = 0
}

function onEnter(el, done) {
  // 执行动画
  el.offsetHeight // 触发重排
  el.style.transition = 'opacity 0.5s'
  el.style.opacity = 1
  
  // 动画完成后调用 done
  setTimeout(done, 500)
}

function onAfterEnter(el) {
  // 清理工作
}

function onEnterCancelled(el) {
  // 进入被取消时调用
}

// 离开钩子类似...
</script>
```

### 仅使用 JavaScript 钩子

```vue
<template>
  <!-- :css="false" 跳过 CSS 检测 -->
  <Transition
    :css="false"
    @before-enter="beforeEnter"
    @enter="enter"
    @leave="leave"
  >
    <div v-if="show">Content</div>
  </Transition>
</template>

<script setup>
import gsap from 'gsap'

function beforeEnter(el) {
  gsap.set(el, { opacity: 0, scale: 0.5 })
}

function enter(el, done) {
  gsap.to(el, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    onComplete: done
  })
}

function leave(el, done) {
  gsap.to(el, {
    opacity: 0,
    scale: 0.5,
    duration: 0.5,
    onComplete: done
  })
}
</script>
```

---

## 过渡时长

### 显式指定时长

```vue
<template>
  <!-- 单一时长 -->
  <Transition :duration="500">
    <div v-if="show">Content</div>
  </Transition>
  
  <!-- 分别指定进入和离开时长 -->
  <Transition :duration="{ enter: 500, leave: 800 }">
    <div v-if="show">Content</div>
  </Transition>
</template>
```

**使用场景**：
- CSS 过渡时长与实际不一致时
- 复杂动画需要精确控制时

---

## 组件过渡

### 过渡组件

```vue
<template>
  <Transition name="fade" mode="out-in">
    <MyComponent v-if="show" />
  </Transition>
</template>
```

### 动态组件

```vue
<template>
  <Transition name="fade" mode="out-in">
    <component :is="currentView" />
  </Transition>
</template>

<script setup>
const views = {
  Home,
  About,
  Contact
}

const currentView = ref('Home')
</script>
```

---

## 实用动画效果

### 淡入淡出

```vue
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 滑动

```vue
<style>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>
```

### 缩放

```vue
<style>
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0);
}
</style>
```

### 旋转淡入

```vue
<style>
.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.5s ease;
}

.rotate-enter-from {
  opacity: 0;
  transform: rotate(-180deg) scale(0.5);
}

.rotate-leave-to {
  opacity: 0;
  transform: rotate(180deg) scale(0.5);
}
</style>
```

---

## 前端工程实践

### 示例 1：Modal 动画

```vue
<script setup>
const showModal = ref(false)
</script>

<template>
  <button @click="showModal = true">打开弹窗</button>
  
  <Transition name="modal">
    <div v-if="showModal" class="modal-mask" @click="showModal = false">
      <div class="modal-container" @click.stop>
        <h3>Modal Title</h3>
        <p>Modal Content</p>
        <button @click="showModal = false">关闭</button>
      </div>
    </div>
  </Transition>
</template>

<style>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}
</style>
```

### 示例 2：路由过渡

```vue
<!-- App.vue -->
<template>
  <Transition name="fade" mode="out-in">
    <router-view />
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 示例 3：通知消息

```vue
<script setup>
const notifications = ref([])

function addNotification(message) {
  const id = Date.now()
  notifications.value.push({ id, message })
  
  setTimeout(() => {
    removeNotification(id)
  }, 3000)
}

function removeNotification(id) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="notifications">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
      >
        {{ notification.message }}
        <button @click="removeNotification(notification.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
.notifications {
  position: fixed;
  top: 20px;
  right: 20px;
}

.notification {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}
</style>
```

### 示例 4：加载动画

```vue
<script setup>
const loading = ref(false)

async function fetchData() {
  loading.value = true
  try {
    await api.getData()
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </Transition>
</template>

<style>
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

---

## 性能优化

### 1. 使用 transform 和 opacity

```vue
<style>
/* ✅ 好：只用 transform 和 opacity */
.good-enter-active {
  transition: 
    opacity 0.3s ease,
    transform 0.3s ease;
}

/* ❌ 差：使用 left/top 会触发重排 */
.bad-enter-active {
  transition: 
    left 0.3s ease,
    top 0.3s ease;
}
</style>
```

### 2. 使用 will-change

```vue
<style>
.transition-enter-active,
.transition-leave-active {
  will-change: transform, opacity;
  transition: all 0.3s ease;
}
</style>
```

### 3. 避免复杂选择器

```vue
<style>
/* ✅ 好：简单选择器 */
.fade-enter-active {
  transition: opacity 0.3s;
}

/* ❌ 差：复杂选择器 */
.container .wrapper .content .fade-enter-active {
  transition: opacity 0.3s;
}
</style>
```

---

## 最佳实践

1. **语义化命名**：使用有意义的 name
2. **合理的时长**：0.2-0.5s 通常足够
3. **使用 mode**：切换元素时使用 out-in
4. **性能优先**：优先使用 transform 和 opacity
5. **一致性**：保持应用内动画风格一致
6. **可访问性**：提供关闭动画的选项
7. **测试覆盖**：确保动画在各浏览器正常
8. **适度使用**：不要过度动画

---

## 参考资料

- [Transition](https://cn.vuejs.org/guide/built-ins/transition.html)
- [CSS 过渡](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Transitions)
- [CSS 动画](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Animations)
