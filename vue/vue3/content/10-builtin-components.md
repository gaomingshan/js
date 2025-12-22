# 第 10 节：内置组件

## 概述

Vue 提供了多个内置组件用于处理常见场景：Transition 处理过渡动画、KeepAlive 缓存组件状态、Teleport 传送 DOM、Suspense 处理异步依赖。

## 一、Transition

### 1.1 基本用法

```vue
<template>
  <button @click="show = !show">切换</button>
  
  <Transition name="fade">
    <p v-if="show">Hello Vue!</p>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
const show = ref(true)
</script>

<style>
/* 进入和离开的过渡 */
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

### 1.2 过渡类名

```
┌─────────────────────────────────────────────────────────────┐
│                    Transition 类名                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   进入过渡：                                                 │
│   v-enter-from → v-enter-active → v-enter-to               │
│   (初始状态)     (过渡中)          (结束状态)                │
│                                                             │
│   离开过渡：                                                 │
│   v-leave-from → v-leave-active → v-leave-to               │
│   (初始状态)     (过渡中)          (结束状态)                │
│                                                             │
│   使用 name="fade" 时，前缀变为 fade-                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 CSS 动画

```vue
<template>
  <Transition name="bounce">
    <p v-if="show">弹跳动画</p>
  </Transition>
</template>

<style>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
}
</style>
```

### 1.4 JavaScript 钩子

```vue
<template>
  <Transition
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
    :css="false"
  >
    <p v-if="show">内容</p>
  </Transition>
</template>

<script setup>
function onEnter(el, done) {
  // 使用 GSAP 等库
  gsap.to(el, {
    opacity: 1,
    duration: 0.5,
    onComplete: done
  })
}

function onLeave(el, done) {
  gsap.to(el, {
    opacity: 0,
    duration: 0.5,
    onComplete: done
  })
}
</script>
```

### 1.5 过渡模式

```vue
<template>
  <!-- 先离开再进入 -->
  <Transition name="fade" mode="out-in">
    <component :is="currentComponent" />
  </Transition>
  
  <!-- 先进入再离开 -->
  <Transition name="fade" mode="in-out">
    <component :is="currentComponent" />
  </Transition>
</template>
```

## 二、TransitionGroup

### 2.1 列表过渡

```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </TransitionGroup>
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 移动过渡 */
.list-move {
  transition: transform 0.5s ease;
}
</style>
```

### 2.2 交错过渡

```vue
<template>
  <TransitionGroup
    name="stagger"
    tag="ul"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
  >
    <li v-for="(item, index) in items" :key="item.id" :data-index="index">
      {{ item.text }}
    </li>
  </TransitionGroup>
</template>

<script setup>
function onBeforeEnter(el) {
  el.style.opacity = 0
  el.style.transform = 'translateY(20px)'
}

function onEnter(el, done) {
  const delay = el.dataset.index * 100
  setTimeout(() => {
    el.style.transition = 'all 0.3s ease'
    el.style.opacity = 1
    el.style.transform = 'translateY(0)'
    setTimeout(done, 300)
  }, delay)
}
</script>
```

## 三、KeepAlive

### 3.1 基本用法

```vue
<template>
  <button @click="currentTab = 'A'">Tab A</button>
  <button @click="currentTab = 'B'">Tab B</button>
  
  <!-- 缓存组件状态 -->
  <KeepAlive>
    <component :is="tabs[currentTab]" />
  </KeepAlive>
</template>

<script setup>
import { ref, shallowRef } from 'vue'
import TabA from './TabA.vue'
import TabB from './TabB.vue'

const currentTab = ref('A')
const tabs = { A: TabA, B: TabB }
</script>
```

### 3.2 Include / Exclude

```vue
<template>
  <!-- 只缓存指定组件 -->
  <KeepAlive include="TabA,TabB">
    <component :is="currentComponent" />
  </KeepAlive>
  
  <!-- 排除指定组件 -->
  <KeepAlive exclude="TabC">
    <component :is="currentComponent" />
  </KeepAlive>
  
  <!-- 正则表达式 -->
  <KeepAlive :include="/^Tab/">
    <component :is="currentComponent" />
  </KeepAlive>
  
  <!-- 数组 -->
  <KeepAlive :include="['TabA', 'TabB']">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

### 3.3 最大缓存数

```vue
<template>
  <!-- 最多缓存 10 个组件，LRU 策略 -->
  <KeepAlive :max="10">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

### 3.4 生命周期钩子

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

// 组件被激活时（从缓存恢复）
onActivated(() => {
  console.log('组件被激活')
  // 可以刷新数据
})

// 组件被停用时（进入缓存）
onDeactivated(() => {
  console.log('组件被缓存')
})
</script>
```

## 四、Teleport

### 4.1 基本用法

```vue
<template>
  <button @click="showModal = true">打开弹窗</button>
  
  <!-- 将内容传送到 body -->
  <Teleport to="body">
    <div v-if="showModal" class="modal">
      <h2>弹窗标题</h2>
      <button @click="showModal = false">关闭</button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(false)
</script>
```

### 4.2 目标选择器

```vue
<template>
  <!-- CSS 选择器 -->
  <Teleport to="body">...</Teleport>
  <Teleport to="#modal-container">...</Teleport>
  <Teleport to=".modals">...</Teleport>
  
  <!-- 禁用传送 -->
  <Teleport to="body" :disabled="isMobile">
    <div class="modal">...</div>
  </Teleport>
</template>
```

### 4.3 多个 Teleport 到同一目标

```vue
<template>
  <!-- 按顺序追加 -->
  <Teleport to="#modals">
    <div>A</div>
  </Teleport>
  <Teleport to="#modals">
    <div>B</div>
  </Teleport>
  
  <!-- #modals 中：<div>A</div><div>B</div> -->
</template>
```

## 五、Suspense

### 5.1 基本用法

```vue
<template>
  <Suspense>
    <!-- 异步组件 -->
    <template #default>
      <AsyncComponent />
    </template>
    
    <!-- 加载中显示 -->
    <template #fallback>
      <div class="loading">加载中...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>
```

### 5.2 async setup

```vue
<!-- AsyncUserProfile.vue -->
<script setup>
// 组件有 async setup，Suspense 会等待
const user = await fetchUser()
</script>

<template>
  <div>{{ user.name }}</div>
</template>

<!-- 父组件 -->
<template>
  <Suspense>
    <AsyncUserProfile />
    <template #fallback>加载用户信息...</template>
  </Suspense>
</template>
```

### 5.3 错误处理

```vue
<template>
  <Suspense @pending="onPending" @resolve="onResolve" @fallback="onFallback">
    <AsyncComponent />
    <template #fallback>加载中...</template>
  </Suspense>
</template>

<script setup>
import { onErrorCaptured, ref } from 'vue'

const error = ref(null)

onErrorCaptured((err) => {
  error.value = err
  return false  // 阻止错误继续传播
})
</script>
```

### 5.4 嵌套 Suspense

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncOuter>
        <Suspense>
          <template #default>
            <AsyncInner />
          </template>
          <template #fallback>
            内部加载中...
          </template>
        </Suspense>
      </AsyncOuter>
    </template>
    <template #fallback>
      外部加载中...
    </template>
  </Suspense>
</template>
```

## 六、组合使用

### 6.1 Transition + KeepAlive

```vue
<template>
  <KeepAlive>
    <Transition name="fade" mode="out-in">
      <component :is="currentComponent" />
    </Transition>
  </KeepAlive>
</template>
```

### 6.2 Suspense + Transition

```vue
<template>
  <Suspense>
    <template #default>
      <Transition name="fade" mode="out-in">
        <AsyncComponent :key="componentKey" />
      </Transition>
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

## 七、总结

| 组件 | 用途 | 关键特性 |
|------|------|----------|
| Transition | 单元素过渡 | CSS 类名、JS 钩子、mode |
| TransitionGroup | 列表过渡 | move 类、tag 属性 |
| KeepAlive | 组件缓存 | include、exclude、max |
| Teleport | DOM 传送 | to、disabled |
| Suspense | 异步依赖 | default、fallback 插槽 |

## 参考资料

- [Transition](https://vuejs.org/guide/built-ins/transition.html)
- [TransitionGroup](https://vuejs.org/guide/built-ins/transition-group.html)
- [KeepAlive](https://vuejs.org/guide/built-ins/keep-alive.html)
- [Teleport](https://vuejs.org/guide/built-ins/teleport.html)
- [Suspense](https://vuejs.org/guide/built-ins/suspense.html)

---

**下一节** → [第 11 节：自定义指令](./11-custom-directives.md)
