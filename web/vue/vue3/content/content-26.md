# Teleport 传送门

> Teleport 允许将组件的一部分模板"传送"到 DOM 的其他位置。

## 核心概念

`<Teleport>` 可以将组件内部的模板片段渲染到组件 DOM 树之外的位置。

### 基础用法

```vue
<script setup>
const showModal = ref(false)
</script>

<template>
  <button @click="showModal = true">打开弹窗</button>
  
  <!-- 将弹窗传送到 body -->
  <Teleport to="body">
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h2>Modal Title</h2>
        <p>Modal Content</p>
        <button @click="showModal = false">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<style>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
}
</style>
```

**渲染结果**：
```html
<body>
  <div id="app">
    <button>打开弹窗</button>
  </div>
  
  <!-- Modal 被传送到这里 -->
  <div class="modal">
    <div class="modal-content">...</div>
  </div>
</body>
```

---

## to 属性

指定传送的目标位置。

### CSS 选择器

```vue
<template>
  <!-- 传送到 body -->
  <Teleport to="body">
    <div>Content</div>
  </Teleport>
  
  <!-- 传送到 ID 选择器 -->
  <Teleport to="#modal-container">
    <div>Content</div>
  </Teleport>
  
  <!-- 传送到 class 选择器 -->
  <Teleport to=".teleport-target">
    <div>Content</div>
  </Teleport>
  
  <!-- 传送到属性选择器 -->
  <Teleport to="[data-teleport]">
    <div>Content</div>
  </Teleport>
</template>
```

### 动态目标

```vue
<script setup>
const target = ref('body')
</script>

<template>
  <Teleport :to="target">
    <div>Content</div>
  </Teleport>
  
  <button @click="target = '#container1'">Container 1</button>
  <button @click="target = '#container2'">Container 2</button>
</template>
```

---

## disabled 属性

禁用 Teleport 功能。

```vue
<script setup>
const isMobile = ref(false)
</script>

<template>
  <!-- 移动端不传送，PC 端传送到 body -->
  <Teleport to="body" :disabled="isMobile">
    <div class="sidebar">
      Sidebar Content
    </div>
  </Teleport>
</template>
```

**使用场景**：
- 响应式布局：移动端和桌面端不同行为
- SSR：服务端渲染时禁用
- 条件传送：根据状态决定是否传送

---

## 多个 Teleport 到同一目标

多个 Teleport 可以挂载到同一个目标元素。

```vue
<!-- ComponentA.vue -->
<template>
  <Teleport to="#modals">
    <div class="modal">Modal A</div>
  </Teleport>
</template>

<!-- ComponentB.vue -->
<template>
  <Teleport to="#modals">
    <div class="modal">Modal B</div>
  </Teleport>
</template>

<!-- 渲染结果 -->
<div id="modals">
  <div class="modal">Modal A</div>
  <div class="modal">Modal B</div>
</div>
```

**顺序**：按照组件挂载顺序排列。

---

## 组件状态保持

Teleport 不影响组件的逻辑关系。

```vue
<script setup>
const count = ref(0)
</script>

<template>
  <div class="app">
    <p>Count: {{ count }}</p>
    
    <!-- 虽然传送到 body，但仍可以访问父组件的状态 -->
    <Teleport to="body">
      <div class="panel">
        <p>Count in teleported content: {{ count }}</p>
        <button @click="count++">Increment</button>
      </div>
    </Teleport>
  </div>
</template>
```

**特性**：
- 保持响应式
- 可以访问父组件数据
- props、emits 正常工作
- Provide/Inject 正常工作

---

## 常见使用场景

### 1. Modal 弹窗

```vue
<script setup>
const showModal = ref(false)

function openModal() {
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  showModal.value = false
  document.body.style.overflow = ''
}
</script>

<template>
  <button @click="openModal">打开弹窗</button>
  
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showModal" class="modal-mask" @click="closeModal">
        <div class="modal-container" @click.stop>
          <slot name="header">
            <h3>Modal Title</h3>
          </slot>
          
          <slot>
            <p>Modal Content</p>
          </slot>
          
          <slot name="footer">
            <button @click="closeModal">关闭</button>
          </slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  max-height: 80vh;
  overflow: auto;
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
  transform: scale(0.9);
}
</style>
```

### 2. Drawer 抽屉

```vue
<script setup lang="ts">
interface Props {
  show: boolean
  placement?: 'left' | 'right' | 'top' | 'bottom'
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'right'
})

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

function close() {
  emit('update:show', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="show" class="drawer-mask" @click="close">
        <div
          :class="['drawer', `drawer-${placement}`]"
          @click.stop
        >
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.drawer-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.drawer {
  position: fixed;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  overflow: auto;
}

.drawer-left {
  left: 0;
  top: 0;
  bottom: 0;
  width: 300px;
}

.drawer-right {
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
}

.drawer-top {
  left: 0;
  right: 0;
  top: 0;
  height: 300px;
}

.drawer-bottom {
  left: 0;
  right: 0;
  bottom: 0;
  height: 300px;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .drawer,
.drawer-leave-active .drawer {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-left,
.drawer-leave-to .drawer-left {
  transform: translateX(-100%);
}

.drawer-enter-from .drawer-right,
.drawer-leave-to .drawer-right {
  transform: translateX(100%);
}

.drawer-enter-from .drawer-top,
.drawer-leave-to .drawer-top {
  transform: translateY(-100%);
}

.drawer-enter-from .drawer-bottom,
.drawer-leave-to .drawer-bottom {
  transform: translateY(100%);
}
</style>
```

### 3. Notification 通知

```vue
<script setup lang="ts">
interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

const notifications = ref<Notification[]>([])

function addNotification(message: string, type: Notification['type'] = 'info') {
  const id = Date.now()
  notifications.value.push({ id, message, type })
  
  setTimeout(() => {
    removeNotification(id)
  }, 3000)
}

function removeNotification(id: number) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

defineExpose({
  addNotification
})
</script>

<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification', `notification-${notification.type}`]"
        >
          <span>{{ notification.message }}</span>
          <button @click="removeNotification(notification.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification {
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
}

.notification-success {
  background: #f0f9ff;
  color: #1e40af;
  border-left: 4px solid #3b82f6;
}

.notification-error {
  background: #fef2f2;
  color: #991b1b;
  border-left: 4px solid #ef4444;
}

.notification-warning {
  background: #fffbeb;
  color: #92400e;
  border-left: 4px solid #f59e0b;
}

.notification-info {
  background: #f0f9ff;
  color: #1e3a8a;
  border-left: 4px solid #3b82f6;
}

.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
```

### 4. FullScreen Loading

```vue
<script setup>
const loading = ref(false)
const loadingText = ref('加载中...')

function show(text = '加载中...') {
  loading.value = true
  loadingText.value = text
}

function hide() {
  loading.value = false
}

defineExpose({
  show,
  hide
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="loading" class="loading-mask">
        <div class="loading-spinner"></div>
        <p>{{ loadingText }}</p>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.loading-mask {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top-color: #3498db;
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

### 5. Tooltip 提示框

```vue
<script setup lang="ts">
interface Props {
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top'
})

const show = ref(false)
const triggerRef = ref<HTMLElement>()
const tooltipStyle = ref({})

function updatePosition() {
  if (!triggerRef.value) return
  
  const rect = triggerRef.value.getBoundingClientRect()
  const offset = 10
  
  let top = 0
  let left = 0
  
  switch (props.placement) {
    case 'top':
      top = rect.top - offset
      left = rect.left + rect.width / 2
      break
    case 'bottom':
      top = rect.bottom + offset
      left = rect.left + rect.width / 2
      break
    case 'left':
      top = rect.top + rect.height / 2
      left = rect.left - offset
      break
    case 'right':
      top = rect.top + rect.height / 2
      left = rect.right + offset
      break
  }
  
  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  }
}

function handleMouseEnter() {
  show.value = true
  nextTick(updatePosition)
}

function handleMouseLeave() {
  show.value = false
}
</script>

<template>
  <span
    ref="triggerRef"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot></slot>
  </span>
  
  <Teleport to="body">
    <Transition name="tooltip">
      <div
        v-if="show"
        class="tooltip"
        :class="`tooltip-${placement}`"
        :style="tooltipStyle"
      >
        {{ content }}
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 9999;
}

.tooltip-top,
.tooltip-bottom {
  transform: translateX(-50%);
}

.tooltip-left,
.tooltip-right {
  transform: translateY(-50%);
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>
```

---

## SSR 注意事项

### 服务端渲染问题

```vue
<script setup>
import { ref, onMounted } from 'vue'

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <!-- SSR 时禁用 Teleport -->
  <Teleport to="body" :disabled="!isMounted">
    <div class="modal">Modal Content</div>
  </Teleport>
</template>
```

### ClientOnly 组件

```vue
<template>
  <ClientOnly>
    <Teleport to="body">
      <div>Content</div>
    </Teleport>
  </ClientOnly>
</template>
```

---

## 易错点与注意事项

### 1. 目标元素必须存在

```vue
<!-- ❌ 错误：目标不存在 -->
<Teleport to="#non-existent">
  <div>Content</div>
</Teleport>

<!-- ✅ 正确：确保目标存在 -->
<div id="modal-container"></div>

<Teleport to="#modal-container">
  <div>Content</div>
</Teleport>
```

### 2. Teleport 在组件挂载后才生效

```vue
<script setup>
// ❌ setup 阶段目标可能还不存在
const target = document.querySelector('#target')

onMounted(() => {
  // ✅ mounted 阶段目标已存在
  const target = document.querySelector('#target')
})
</script>
```

### 3. 样式作用域

```vue
<style scoped>
/* ⚠️ scoped 样式不会应用到 Teleport 的内容 */
.modal {
  background: white;
}
</style>

<!-- 解决方案 1：使用全局样式 -->
<style>
.modal {
  background: white;
}
</style>

<!-- 解决方案 2：使用 :deep() -->
<style scoped>
:deep(.modal) {
  background: white;
}
</style>
```

### 4. 事件冒泡

```vue
<template>
  <div @click="handleParentClick">
    Parent
    
    <!-- Teleport 的内容不会触发父元素的点击事件 -->
    <Teleport to="body">
      <button @click="handleChildClick">
        Child（不会冒泡到 Parent）
      </button>
    </Teleport>
  </div>
</template>
```

---

## 性能优化

### 1. 按需渲染

```vue
<script setup>
const showModal = ref(false)
</script>

<template>
  <!-- 只在需要时传送 -->
  <Teleport to="body" v-if="showModal">
    <div class="modal">Heavy Modal Content</div>
  </Teleport>
</template>
```

### 2. 复用目标容器

```vue
<!-- index.html -->
<div id="app"></div>
<div id="modals"></div>
<div id="notifications"></div>
<div id="tooltips"></div>

<!-- 所有 Modal 传送到同一容器 -->
<Teleport to="#modals">
  <Modal1 />
</Teleport>

<Teleport to="#modals">
  <Modal2 />
</Teleport>
```

---

## 最佳实践

1. **语义化目标**：使用有意义的 ID
2. **提供降级方案**：目标不存在时的处理
3. **SSR 兼容**：服务端渲染时禁用
4. **样式隔离**：注意 scoped 样式的限制
5. **清理副作用**：关闭时清理 body 样式等
6. **可访问性**：确保键盘导航和焦点管理
7. **z-index 管理**：统一管理层级
8. **文档化**：说明传送的目标和用途

---

## Teleport vs Portal

| 特性 | Vue Teleport | React Portal |
|------|-------------|-------------|
| API | `<Teleport to="selector">` | `createPortal(child, container)` |
| 语法 | 声明式 | 命令式 |
| 目标 | CSS 选择器 | DOM 节点 |
| 禁用 | `:disabled` | - |
| SSR | 需要手动处理 | 需要手动处理 |

---

## 参考资料

- [Teleport](https://cn.vuejs.org/guide/built-ins/teleport.html)
- [Teleport API](https://cn.vuejs.org/api/built-in-components.html#teleport)
- [SSR 与 Teleport](https://cn.vuejs.org/guide/scaling-up/ssr.html#teleports)
