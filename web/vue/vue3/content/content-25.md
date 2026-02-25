# TransitionGroup 列表过渡

> TransitionGroup 为列表中的多个元素提供过渡动画效果。

## 核心概念

`<TransitionGroup>` 用于对 `v-for` 列表中的元素进行过渡动画。

### 基础用法

```vue
<script setup>
const items = ref([
  { id: 1, text: 'Item 1' },
  { id: 2, text: 'Item 2' },
  { id: 3, text: 'Item 3' }
])

function addItem() {
  const id = Date.now()
  items.value.push({ id, text: `Item ${id}` })
}

function removeItem(id) {
  const index = items.value.findIndex(item => item.id === id)
  if (index > -1) {
    items.value.splice(index, 1)
  }
}
</script>

<template>
  <button @click="addItem">添加</button>
  
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
      <button @click="removeItem(item.id)">删除</button>
    </li>
  </TransitionGroup>
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

---

## TransitionGroup vs Transition

| 特性 | Transition | TransitionGroup |
|------|-----------|----------------|
| 用途 | 单个元素 | 多个元素列表 |
| 渲染 | 不渲染包裹元素 | 渲染包裹元素 |
| key | 可选 | **必须** |
| tag | 无 | 指定包裹元素标签 |
| 移动过渡 | 无 | **支持** |

---

## tag 属性

TransitionGroup 会渲染一个真实的 DOM 元素。

```vue
<template>
  <!-- 渲染为 <ul> -->
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </TransitionGroup>
  
  <!-- 渲染为 <div> -->
  <TransitionGroup name="list" tag="div">
    <div v-for="item in items" :key="item.id">
      {{ item.text }}
    </div>
  </TransitionGroup>
</template>
```

### 不渲染包裹元素

```vue
<template>
  <!-- Vue 3.5+ 不需要 tag 属性 -->
  <TransitionGroup name="list">
    <div v-for="item in items" :key="item.id">
      {{ item.text }}
    </div>
  </TransitionGroup>
  
  <!-- 渲染结果（无包裹元素） -->
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</template>
```

---

## 移动过渡

TransitionGroup 支持元素位置变化时的过渡。

### move-class

```vue
<script setup>
const items = ref([1, 2, 3, 4, 5])

function shuffle() {
  items.value = items.value.sort(() => Math.random() - 0.5)
}
</script>

<template>
  <button @click="shuffle">打乱顺序</button>
  
  <TransitionGroup name="list" tag="div">
    <div v-for="item in items" :key="item" class="item">
      {{ item }}
    </div>
  </TransitionGroup>
</template>

<style>
.item {
  transition: all 0.5s ease;
}

/* 移动过渡 */
.list-move {
  transition: transform 0.5s ease;
}

/* 进入/离开过渡 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 离开元素脱离文档流，避免影响其他元素 */
.list-leave-active {
  position: absolute;
}
</style>
```

---

## 交错过渡

为列表项添加延迟，创建交错效果。

### CSS 实现

```vue
<template>
  <TransitionGroup
    name="stagger"
    tag="ul"
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @leave="onLeave"
  >
    <li
      v-for="(item, index) in items"
      :key="item.id"
      :data-index="index"
    >
      {{ item.text }}
    </li>
  </TransitionGroup>
</template>

<script setup>
function onBeforeEnter(el) {
  el.style.opacity = 0
  el.style.transform = 'translateY(-30px)'
}

function onEnter(el, done) {
  const delay = el.dataset.index * 100
  
  setTimeout(() => {
    el.style.transition = 'all 0.5s ease'
    el.style.opacity = 1
    el.style.transform = 'translateY(0)'
    
    setTimeout(done, 500)
  }, delay)
}

function onLeave(el, done) {
  const delay = el.dataset.index * 50
  
  setTimeout(() => {
    el.style.transition = 'all 0.3s ease'
    el.style.opacity = 0
    el.style.transform = 'translateY(30px)'
    
    setTimeout(done, 300)
  }, delay)
}
</script>
```

### GSAP 实现

```vue
<template>
  <TransitionGroup
    name="stagger"
    tag="ul"
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @leave="onLeave"
  >
    <li v-for="(item, index) in items" :key="item.id">
      {{ item.text }}
    </li>
  </TransitionGroup>
</template>

<script setup>
import gsap from 'gsap'

function onBeforeEnter(el) {
  gsap.set(el, {
    opacity: 0,
    y: -30
  })
}

function onEnter(el, done) {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    delay: el.dataset.index * 0.1,
    onComplete: done
  })
}

function onLeave(el, done) {
  gsap.to(el, {
    opacity: 0,
    y: 30,
    duration: 0.3,
    delay: el.dataset.index * 0.05,
    onComplete: done
  })
}
</script>
```

---

## 常见动画效果

### 淡入淡出列表

```vue
<style>
.fade-list-enter-active,
.fade-list-leave-active {
  transition: all 0.5s ease;
}

.fade-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-list-move {
  transition: transform 0.5s ease;
}
</style>
```

### 缩放列表

```vue
<style>
.scale-list-enter-active,
.scale-list-leave-active {
  transition: all 0.3s ease;
}

.scale-list-enter-from {
  opacity: 0;
  transform: scale(0);
}

.scale-list-leave-to {
  opacity: 0;
  transform: scale(0);
}

.scale-list-move {
  transition: transform 0.3s ease;
}

.scale-list-leave-active {
  position: absolute;
}
</style>
```

### 翻转列表

```vue
<style>
.flip-list-enter-active,
.flip-list-leave-active {
  transition: all 0.5s ease;
}

.flip-list-enter-from {
  opacity: 0;
  transform: rotateY(90deg);
}

.flip-list-leave-to {
  opacity: 0;
  transform: rotateY(-90deg);
}

.flip-list-move {
  transition: transform 0.5s ease;
}
</style>
```

---

## 实战示例

### 示例 1：待办事项列表

```vue
<script setup lang="ts">
interface Todo {
  id: number
  text: string
  completed: boolean
}

const todos = ref<Todo[]>([
  { id: 1, text: '学习 Vue 3', completed: false },
  { id: 2, text: '写代码', completed: false }
])

const newTodo = ref('')

function addTodo() {
  if (!newTodo.value.trim()) return
  
  todos.value.push({
    id: Date.now(),
    text: newTodo.value,
    completed: false
  })
  
  newTodo.value = ''
}

function removeTodo(id: number) {
  const index = todos.value.findIndex(todo => todo.id === id)
  if (index > -1) {
    todos.value.splice(index, 1)
  }
}

function toggleTodo(id: number) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}
</script>

<template>
  <div class="todo-app">
    <input
      v-model="newTodo"
      @keyup.enter="addTodo"
      placeholder="添加待办事项"
    >
    <button @click="addTodo">添加</button>
    
    <TransitionGroup name="todo" tag="ul" class="todo-list">
      <li
        v-for="todo in todos"
        :key="todo.id"
        :class="{ completed: todo.completed }"
        class="todo-item"
      >
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="toggleTodo(todo.id)"
        >
        <span>{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">删除</button>
      </li>
    </TransitionGroup>
  </div>
</template>

<style>
.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  padding: 10px;
  margin: 5px 0;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.todo-item.completed span {
  text-decoration: line-through;
  opacity: 0.5;
}

.todo-enter-active,
.todo-leave-active {
  transition: all 0.3s ease;
}

.todo-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.todo-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.todo-move {
  transition: transform 0.3s ease;
}

.todo-leave-active {
  position: absolute;
}
</style>
```

### 示例 2：可拖拽排序列表

```vue
<script setup>
import { ref } from 'vue'
import draggable from 'vuedraggable'

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
  { id: 4, name: 'Item 4' }
])
</script>

<template>
  <draggable
    v-model="items"
    item-key="id"
    animation="200"
    ghost-class="ghost"
  >
    <template #item="{ element }">
      <div class="item">
        {{ element.name }}
      </div>
    </template>
  </draggable>
</template>

<style>
.item {
  padding: 10px;
  margin: 5px 0;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: move;
  transition: all 0.3s ease;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
```

### 示例 3：搜索过滤列表

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' }
])

const searchQuery = ref('')

const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})
</script>

<template>
  <input
    v-model="searchQuery"
    placeholder="搜索用户..."
  >
  
  <TransitionGroup name="list" tag="div" class="user-list">
    <div
      v-for="user in filteredUsers"
      :key="user.id"
      class="user-card"
    >
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
    </div>
  </TransitionGroup>
  
  <p v-if="!filteredUsers.length">没有找到匹配的用户</p>
</template>

<style>
.user-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.user-card {
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
```

### 示例 4：消息列表

```vue
<script setup lang="ts">
interface Message {
  id: number
  text: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
}

const messages = ref<Message[]>([])

function addMessage(text: string, type: Message['type'] = 'info') {
  const id = Date.now()
  messages.value.push({
    id,
    text,
    type,
    timestamp: new Date()
  })
  
  // 3秒后自动移除
  setTimeout(() => {
    removeMessage(id)
  }, 3000)
}

function removeMessage(id: number) {
  const index = messages.value.findIndex(m => m.id === id)
  if (index > -1) {
    messages.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="message-container">
    <TransitionGroup
      name="message"
      tag="div"
      class="messages"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', `message-${message.type}`]"
      >
        <span>{{ message.text }}</span>
        <button @click="removeMessage(message.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
  
  <div class="controls">
    <button @click="addMessage('信息消息', 'info')">Info</button>
    <button @click="addMessage('成功消息', 'success')">Success</button>
    <button @click="addMessage('警告消息', 'warning')">Warning</button>
    <button @click="addMessage('错误消息', 'error')">Error</button>
  </div>
</template>

<style>
.message-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
}

.message-info { background: #e3f2fd; color: #1976d2; }
.message-success { background: #e8f5e9; color: #388e3c; }
.message-warning { background: #fff3e0; color: #f57c00; }
.message-error { background: #ffebee; color: #d32f2f; }

.message-enter-active {
  transition: all 0.3s ease;
}

.message-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}

.message-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.message-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.message-move {
  transition: transform 0.3s ease;
}
</style>
```

---

## 性能优化

### 1. 使用 key

```vue
<!-- ❌ 错误：没有 key -->
<TransitionGroup name="list">
  <div v-for="item in items">
    {{ item }}
  </div>
</TransitionGroup>

<!-- ✅ 正确：必须有 key -->
<TransitionGroup name="list">
  <div v-for="item in items" :key="item.id">
    {{ item }}
  </div>
</TransitionGroup>
```

### 2. 大列表虚拟滚动

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref(Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  text: `Item ${i}`
})))

const visibleRange = ref({ start: 0, end: 20 })

const visibleItems = computed(() => {
  return items.value.slice(
    visibleRange.value.start,
    visibleRange.value.end
  )
})
</script>

<template>
  <!-- 只渲染可见的项 -->
  <TransitionGroup name="list" tag="div">
    <div
      v-for="item in visibleItems"
      :key="item.id"
    >
      {{ item.text }}
    </div>
  </TransitionGroup>
</template>
```

### 3. 减少过渡时长

```vue
<style>
/* 大量元素时使用较短的过渡时长 */
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease; /* 从 0.5s 减到 0.2s */
}
</style>
```

---

## 易错点与注意事项

### 1. 必须提供 key

```vue
<!-- ❌ 会报警告 -->
<TransitionGroup name="list">
  <div v-for="item in items">{{ item }}</div>
</TransitionGroup>

<!-- ✅ 正确 -->
<TransitionGroup name="list">
  <div v-for="item in items" :key="item.id">{{ item }}</div>
</TransitionGroup>
```

### 2. 移动过渡需要 position

```vue
<style>
/* 移动过渡需要离开的元素脱离文档流 */
.list-leave-active {
  position: absolute;
}

.list-move {
  transition: transform 0.5s;
}
</style>
```

### 3. 不要在过渡元素上使用 v-show

```vue
<!-- ❌ 错误：v-show 不会触发过渡 -->
<TransitionGroup name="list">
  <div v-for="item in items" :key="item.id" v-show="item.visible">
    {{ item }}
  </div>
</TransitionGroup>

<!-- ✅ 正确：使用 v-if 或过滤数组 -->
<TransitionGroup name="list">
  <div v-for="item in visibleItems" :key="item.id">
    {{ item }}
  </div>
</TransitionGroup>
```

---

## 最佳实践

1. **始终提供 key**：必须且唯一
2. **合理的过渡时长**：避免过长影响体验
3. **position: absolute**：移动过渡时离开元素脱离文档流
4. **性能考虑**：大列表使用虚拟滚动
5. **测试边界情况**：空列表、单项、大量项
6. **可访问性**：减弱动画选项
7. **一致性**：保持应用内列表动画风格一致
8. **渐进增强**：不支持动画时也能正常使用

---

## 参考资料

- [TransitionGroup](https://cn.vuejs.org/guide/built-ins/transition-group.html)
- [列表过渡](https://cn.vuejs.org/guide/built-ins/transition-group.html#move-transitions)
- [FLIP 动画技术](https://aerotwist.com/blog/flip-your-animations/)
