# 第 19 章：路由过渡动画

## 概述

路由过渡动画可以让页面切换更加平滑流畅，提升用户体验。Vue Router 与 Vue 的 `<Transition>` 组件完美配合，支持基于路由的动画效果。

## Transition 组件集成

### 基础用法

```vue
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade">
      <component :is="Component" />
    </transition>
  </router-view>
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

### 常用过渡效果

```vue
<style>
/* 1. 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 2. 滑动 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s;
}
.slide-left-enter-from {
  transform: translateX(100%);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}

/* 3. 缩放 */
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s;
}
.scale-enter-from {
  transform: scale(0.8);
}
.scale-leave-to {
  transform: scale(1.2);
}

/* 4. 旋转淡入 */
.rotate-fade-enter-active,
.rotate-fade-leave-active {
  transition: all 0.3s;
}
.rotate-fade-enter-from {
  opacity: 0;
  transform: rotate(-10deg);
}
.rotate-fade-leave-to {
  opacity: 0;
  transform: rotate(10deg);
}
</style>
```

## 基于路由的动画

### 根据路由 meta 配置

```javascript
const routes = [
  {
    path: '/',
    component: Home,
    meta: { transition: 'fade' }
  },
  {
    path: '/about',
    component: About,
    meta: { transition: 'slide-left' }
  },
  {
    path: '/contact',
    component: Contact,
    meta: { transition: 'scale' }
  }
]
```

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>
```

### 根据导航方向

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="transitionName">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script>
export default {
  data() {
    return {
      transitionName: 'slide-left'
    }
  },
  
  watch: {
    '$route'(to, from) {
      // 简单判断：基于路由深度
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length
      
      this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
    }
  }
}
</script>

<style>
/* 向左滑动（前进） */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-out;
  position: absolute;
  width: 100%;
}
.slide-left-enter-from {
  transform: translateX(100%);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}

/* 向右滑动（后退） */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease-out;
  position: absolute;
  width: 100%;
}
.slide-right-enter-from {
  transform: translateX(-100%);
}
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
```

### Composition API 实现

```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const transitionName = ref('fade')

// 路由层级映射
const routeLevels = {
  '/': 1,
  '/products': 2,
  '/products/:id': 3,
  '/cart': 2,
  '/checkout': 3
}

watch(
  () => route.path,
  (to, from) => {
    const toLevel = routeLevels[to] || 1
    const fromLevel = routeLevels[from] || 1
    
    if (toLevel > fromLevel) {
      transitionName.value = 'slide-left'
    } else if (toLevel < fromLevel) {
      transitionName.value = 'slide-right'
    } else {
      transitionName.value = 'fade'
    }
  }
)
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
```

## 动态过渡效果

### 基于用户偏好

```vue
<script setup>
import { ref } from 'vue'

const transitionEnabled = ref(
  localStorage.getItem('animationsEnabled') !== 'false'
)

const transitionName = computed(() => {
  return transitionEnabled.value ? 'fade' : ''
})

function toggleAnimations() {
  transitionEnabled.value = !transitionEnabled.value
  localStorage.setItem('animationsEnabled', transitionEnabled.value)
}
</script>

<template>
  <div>
    <button @click="toggleAnimations">
      {{ transitionEnabled ? '禁用' : '启用' }}动画
    </button>
    
    <router-view v-slot="{ Component }">
      <transition :name="transitionName" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
```

### 基于设备性能

```vue
<script setup>
import { ref, onMounted } from 'vue'

const useSimpleTransition = ref(false)

onMounted(() => {
  // 检测低性能设备
  const isLowPerformance = 
    navigator.hardwareConcurrency <= 2 ||
    /Android 4|iPhone 5/.test(navigator.userAgent)
  
  useSimpleTransition.value = isLowPerformance
})

const transitionName = computed(() => {
  return useSimpleTransition.value ? 'fade' : 'slide-fade'
})
</script>
```

### 根据网络状态

```vue
<script setup>
import { ref, onMounted } from 'vue'

const connection = ref(null)
const transitionName = ref('slide-left')

onMounted(() => {
  connection.value = navigator.connection

  if (connection.value) {
    const updateTransition = () => {
      // 慢速网络使用简单动画
      if (connection.value.effectiveType === '2g' || 
          connection.value.effectiveType === 'slow-2g') {
        transitionName.value = 'fade'
      } else {
        transitionName.value = 'slide-left'
      }
    }
    
    updateTransition()
    connection.value.addEventListener('change', updateTransition)
  }
})
</script>
```

## 嵌套路由的动画

### 父子路由独立动画

```vue
<!-- App.vue -->
<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<!-- ParentView.vue -->
<template>
  <div class="parent">
    <h1>父级页面</h1>
    
    <!-- 子路由也有独立的过渡 -->
    <router-view v-slot="{ Component }">
      <transition name="tab" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
/* 页面级过渡 */
.page-enter-active,
.page-leave-active {
  transition: all 0.5s;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* 标签页过渡 */
.tab-enter-active,
.tab-leave-active {
  transition: opacity 0.3s;
}
.tab-enter-from,
.tab-leave-to {
  opacity: 0;
}
</style>
```

### 避免过渡冲突

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition 
      :name="getTransitionName(route)"
      mode="out-in"
      @before-enter="onBeforeEnter"
      @after-leave="onAfterLeave"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script>
export default {
  data() {
    return {
      isTransitioning: false
    }
  },
  
  methods: {
    getTransitionName(route) {
      // 嵌套路由不使用动画（避免冲突）
      if (route.matched.length > 2) {
        return ''
      }
      return route.meta.transition || 'fade'
    },
    
    onBeforeEnter() {
      this.isTransitioning = true
    },
    
    onAfterLeave() {
      this.isTransitioning = false
    }
  }
}
</script>
```

## 性能优化考虑

### 使用 CSS transform 和 opacity

```css
/* ✅ 推荐：使用 transform 和 opacity（GPU 加速） */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s, opacity 0.3s;
}
.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* ❌ 不推荐：使用 width、height、left 等（重排） */
.slide-bad-enter-active,
.slide-bad-leave-active {
  transition: left 0.3s;
}
.slide-bad-enter-from {
  left: 100%;
}
```

### 避免过长的过渡时间

```vue
<script setup>
const transitionDuration = computed(() => {
  // 移动端使用更短的过渡时间
  return isMobile.value ? 200 : 300
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition 
      :name="transitionName"
      :duration="transitionDuration"
    >
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition-duration: var(--transition-duration, 0.3s);
}
</style>
```

### 禁用不必要的动画

```vue
<script setup>
// 检测用户偏好
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

const transitionName = computed(() => {
  return prefersReducedMotion ? '' : 'slide-fade'
})
</script>
```

### 使用 will-change

```css
.page-enter-active,
.page-leave-active {
  will-change: transform, opacity;
  transition: transform 0.3s, opacity 0.3s;
}

/* 过渡结束后移除 will-change */
.page-enter-to,
.page-leave-from {
  will-change: auto;
}
```

## 高级过渡技巧

### 交错过渡（列表项）

```vue
<template>
  <transition-group
    name="list"
    tag="ul"
    @before-enter="beforeEnter"
    @enter="enter"
  >
    <li
      v-for="(item, index) in items"
      :key="item.id"
      :data-index="index"
    >
      {{ item.title }}
    </li>
  </transition-group>
</template>

<script>
export default {
  methods: {
    beforeEnter(el) {
      el.style.opacity = 0
      el.style.transform = 'translateY(30px)'
    },
    
    enter(el, done) {
      const delay = el.dataset.index * 100
      
      setTimeout(() => {
        el.style.transition = 'all 0.4s'
        el.style.opacity = 1
        el.style.transform = 'translateY(0)'
        
        setTimeout(done, 400)
      }, delay)
    }
  }
}
</script>
```

### 路径动画

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="transitionName"
      mode="out-in"
      @enter="onEnter"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script>
export default {
  methods: {
    onEnter(el) {
      // 绘制路径动画
      const path = document.querySelector('.transition-path')
      if (path) {
        path.classList.add('animate')
        setTimeout(() => {
          path.classList.remove('animate')
        }, 300)
      }
    }
  }
}
</script>

<style>
.transition-path {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(to right, #42b983, #35495e);
  transition: width 0.3s ease-out;
}

.transition-path.animate {
  width: 100%;
}
</style>
```

### 共享元素过渡

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="transitionName"
      @before-leave="beforeLeave"
      @enter="enter"
    >
      <component 
        :is="Component" 
        :key="route.path"
        :shared-element="sharedElement"
      />
    </transition>
  </router-view>
</template>

<script>
export default {
  data() {
    return {
      sharedElement: null
    }
  },
  
  methods: {
    beforeLeave(el) {
      // 记录共享元素位置
      const shared = el.querySelector('[data-shared]')
      if (shared) {
        const rect = shared.getBoundingClientRect()
        this.sharedElement = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }
      }
    },
    
    enter(el) {
      // 使用共享元素位置创建过渡
      const shared = el.querySelector('[data-shared]')
      if (shared && this.sharedElement) {
        const rect = shared.getBoundingClientRect()
        
        // 从旧位置过渡到新位置
        shared.style.transform = `
          translate(
            ${this.sharedElement.left - rect.left}px,
            ${this.sharedElement.top - rect.top}px
          )
          scale(
            ${this.sharedElement.width / rect.width},
            ${this.sharedElement.height / rect.height}
          )
        `
        
        requestAnimationFrame(() => {
          shared.style.transition = 'transform 0.3s'
          shared.style.transform = 'none'
        })
      }
    }
  }
}
</script>
```

## 关键点总结

1. **Transition 组件**：与 `<router-view>` 配合实现路由过渡
2. **基于路由的动画**：通过 meta 或导航方向动态设置过渡
3. **性能优化**：使用 transform/opacity，避免重排，考虑用户偏好
4. **嵌套路由**：注意父子路由动画的协调
5. **高级技巧**：交错过渡、路径动画、共享元素过渡

## 深入一点：过渡模式

```vue
<template>
  <!-- mode="out-in": 先离开再进入（默认行为是同时） -->
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<!-- 对比 -->

<!-- 无 mode：同时过渡（可能导致布局问题） -->
<transition name="fade">
  <component :is="Component" />
</transition>

<!-- mode="out-in"：先离开再进入（推荐） -->
<transition name="fade" mode="out-in">
  <component :is="Component" />
</transition>

<!-- mode="in-out"：先进入再离开（很少使用） -->
<transition name="fade" mode="in-out">
  <component :is="Component" />
</transition>
```

**使用建议：**
- 页面切换：使用 `mode="out-in"`
- 列表项：不使用 mode（使用 `<transition-group>`）
- 模态框：根据需求选择

## 参考资料

- [Vue - Transition](https://cn.vuejs.org/guide/built-ins/transition.html)
- [Vue Router - 过渡动效](https://router.vuejs.org/zh/guide/advanced/transitions.html)
- [CSS Triggers](https://csstriggers.com/) - 查看哪些 CSS 属性会触发重排
