# 第 14 节：过渡动画

## 概述

Vue Router 支持路由切换时的过渡动画，通过 `<transition>` 或 `<transition-group>` 组件包装 `<router-view>`，可以实现丰富的页面切换效果。

## 一、基础过渡

### 1.1 简单过渡动画

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
/* 淡入淡出动画 */
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

### 1.2 滑动过渡

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition name="slide" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
/* 滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* 容器需要相对定位 */
.slide-enter-active,
.slide-leave-active {
  position: absolute;
  width: 100%;
}
</style>
```

### 1.3 缩放过渡

```vue
<style>
/* 缩放动画 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(1.2);
}
</style>
```

## 二、动态过渡

### 2.1 基于路由的动态过渡

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="getTransitionName(route)" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const getTransitionName = (currentRoute) => {
  // 基于路由元信息
  if (currentRoute.meta?.transition) {
    return currentRoute.meta.transition
  }
  
  // 基于路由层级
  const depth = currentRoute.path.split('/').length
  if (depth <= 2) {
    return 'fade'
  } else if (depth === 3) {
    return 'slide-left'
  } else {
    return 'slide-up'
  }
}
</script>

<style>
/* 左滑动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
  position: absolute;
  width: 100%;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

/* 上滑动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
  position: absolute;
  width: 100%;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(-100%);
}
</style>
```

### 2.2 基于导航方向的过渡

```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const transitionName = ref('fade')
const routeHistory = ref([])

// 监听路由变化，判断导航方向
watch(route, (to, from) => {
  // 记录路由历史
  if (from && from.path !== to.path) {
    const fromIndex = routeHistory.value.indexOf(from.path)
    const toIndex = routeHistory.value.indexOf(to.path)
    
    if (fromIndex !== -1 && toIndex !== -1) {
      // 根据历史位置判断方向
      if (toIndex > fromIndex) {
        transitionName.value = 'slide-left'  // 前进
      } else {
        transitionName.value = 'slide-right' // 后退
      }
    } else {
      // 新页面
      routeHistory.value.push(to.path)
      transitionName.value = 'slide-left'
    }
  }
})

// 监听浏览器后退
window.addEventListener('popstate', () => {
  transitionName.value = 'slide-right'
})
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
/* 右滑动画（后退） */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
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

## 三、高级过渡效果

### 3.1 3D 翻转效果

```vue
<style>
/* 3D 翻转动画 */
.flip-enter-active,
.flip-leave-active {
  transition: all 0.6s ease;
  transform-style: preserve-3d;
}

.flip-enter-from {
  transform: rotateY(-90deg);
  opacity: 0;
}

.flip-leave-to {
  transform: rotateY(90deg);
  opacity: 0;
}

/* 容器需要设置透视 */
.router-container {
  perspective: 1000px;
}
</style>
```

### 3.2 分屏效果

```vue
<template>
  <div class="split-container">
    <router-view v-slot="{ Component, route }">
      <transition
        name="split"
        mode="out-in"
        @enter="onEnter"
        @leave="onLeave"
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
const onEnter = (el, done) => {
  // 自定义进入动画
  el.style.clipPath = 'polygon(0 0, 0 0, 0 100%, 0 100%)'
  
  el.animate([
    { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
    { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }
  ], {
    duration: 500,
    easing: 'ease-out'
  }).addEventListener('finish', done)
}

const onLeave = (el, done) => {
  // 自定义离开动画
  el.animate([
    { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
    { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }
  ], {
    duration: 500,
    easing: 'ease-in'
  }).addEventListener('finish', done)
}
</script>

<style>
.split-container {
  position: relative;
  overflow: hidden;
}

.split-enter-active,
.split-leave-active {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
```

### 3.3 粒子效果

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition
      name="particles"
      mode="out-in"
      @before-enter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
  
  <canvas ref="particleCanvas" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const particleCanvas = ref()
let ctx = null

onMounted(() => {
  ctx = particleCanvas.value.getContext('2d')
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})

const resizeCanvas = () => {
  particleCanvas.value.width = window.innerWidth
  particleCanvas.value.height = window.innerHeight
}

const createParticles = () => {
  const particles = []
  const particleCount = 50
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1.0
    })
  }
  
  return particles
}

const animateParticles = (particles, duration) => {
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = elapsed / duration
    
    ctx.clearRect(0, 0, particleCanvas.value.width, particleCanvas.value.height)
    
    particles.forEach(particle => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life = 1 - progress
      
      ctx.globalAlpha = particle.life
      ctx.fillStyle = '#007bff'
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      ctx.clearRect(0, 0, particleCanvas.value.width, particleCanvas.value.height)
    }
  }
  
  animate()
}

const beforeEnter = (el) => {
  el.style.opacity = '0'
}

const enter = (el, done) => {
  const particles = createParticles()
  animateParticles(particles, 800)
  
  setTimeout(() => {
    el.style.transition = 'opacity 0.3s ease'
    el.style.opacity = '1'
    setTimeout(done, 300)
  }, 400)
}

const leave = (el, done) => {
  const particles = createParticles()
  animateParticles(particles, 600)
  
  el.style.transition = 'opacity 0.3s ease'
  el.style.opacity = '0'
  setTimeout(done, 300)
}
</script>

<style>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1000;
}
</style>
```

## 四、过渡模式

### 4.1 过渡模式说明

```vue
<template>
  <!-- mode="out-in": 先离开，后进入 -->
  <transition name="fade" mode="out-in">
    <component :is="Component" :key="route.path" />
  </transition>
  
  <!-- mode="in-out": 先进入，后离开 -->
  <transition name="slide" mode="in-out">
    <component :is="Component" :key="route.path" />
  </transition>
  
  <!-- 默认: 同时进行 -->
  <transition name="scale">
    <component :is="Component" :key="route.path" />
  </transition>
</template>
```

### 4.2 自定义过渡时序

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition
      name="custom"
      @before-leave="beforeLeave"
      @leave="leave"
      @before-enter="beforeEnter"
      @enter="enter"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
let leavingElement = null

const beforeLeave = (el) => {
  leavingElement = el
  el.style.position = 'absolute'
  el.style.width = '100%'
}

const leave = (el, done) => {
  // 延迟离开动画
  setTimeout(() => {
    el.style.transition = 'transform 0.5s ease, opacity 0.5s ease'
    el.style.transform = 'translateX(-100%)'
    el.style.opacity = '0'
    
    el.addEventListener('transitionend', done)
  }, 100) // 延迟 100ms
}

const beforeEnter = (el) => {
  el.style.position = 'absolute'
  el.style.width = '100%'
  el.style.transform = 'translateX(100%)'
  el.style.opacity = '0'
}

const enter = (el, done) => {
  // 等待离开动画完成一半后开始进入
  setTimeout(() => {
    el.style.transition = 'transform 0.5s ease, opacity 0.5s ease'
    el.style.transform = 'translateX(0)'
    el.style.opacity = '1'
    
    el.addEventListener('transitionend', () => {
      el.style.position = ''
      done()
    })
  }, 250)
}
</script>
```

## 五、嵌套路由过渡

### 5.1 多级路由过渡

```vue
<!-- 父路由组件 -->
<template>
  <div class="parent-route">
    <header>导航栏</header>
    
    <!-- 子路由过渡 -->
    <router-view v-slot="{ Component, route }">
      <transition :name="getChildTransition(route)" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
const getChildTransition = (route) => {
  // 基于子路由路径决定过渡效果
  if (route.path.includes('/tab')) {
    return 'slide-horizontal'
  } else if (route.path.includes('/modal')) {
    return 'modal'
  } else {
    return 'fade'
  }
}
</script>
```

### 5.2 标签页过渡

```vue
<template>
  <div class="tabs-container">
    <nav class="tabs">
      <router-link 
        v-for="tab in tabs" 
        :key="tab.name"
        :to="tab.path"
        class="tab"
        active-class="active"
      >
        {{ tab.label }}
      </router-link>
    </nav>
    
    <div class="tab-content">
      <router-view v-slot="{ Component, route }">
        <transition :name="getTabTransition(route)" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
const tabs = [
  { name: 'profile', label: '个人信息', path: '/user/profile' },
  { name: 'settings', label: '设置', path: '/user/settings' },
  { name: 'security', label: '安全', path: '/user/security' }
]

const getTabTransition = (route) => {
  const currentIndex = tabs.findIndex(tab => tab.path === route.path)
  const prevRoute = router.options.history.state?.back
  const prevIndex = tabs.findIndex(tab => tab.path === prevRoute)
  
  if (currentIndex > prevIndex) {
    return 'slide-left'
  } else if (currentIndex < prevIndex) {
    return 'slide-right'
  } else {
    return 'fade'
  }
}
</script>

<style>
.tab-content {
  position: relative;
  overflow: hidden;
}

/* 标签页滑动动画 */
.slide-horizontal-enter-active,
.slide-horizontal-leave-active {
  transition: transform 0.3s ease;
  position: absolute;
  width: 100%;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
```

## 六、性能优化

### 6.1 CSS Transform 优化

```vue
<style>
/* ✅ 使用 transform，触发硬件加速 */
.optimized-slide-enter-active,
.optimized-slide-leave-active {
  transition: transform 0.3s ease;
  will-change: transform; /* 提前告知浏览器 */
}

.optimized-slide-enter-from {
  transform: translate3d(100%, 0, 0); /* 强制3D加速 */
}

.optimized-slide-leave-to {
  transform: translate3d(-100%, 0, 0);
}

/* ❌ 避免使用 position 变化 */
.slow-slide-enter-active,
.slow-slide-leave-active {
  transition: left 0.3s ease; /* 会触发重排 */
}
</style>
```

### 6.2 减少重绘重排

```vue
<template>
  <div class="transition-container">
    <router-view v-slot="{ Component, route }">
      <transition
        name="optimized"
        mode="out-in"
        @before-enter="beforeEnter"
        @after-enter="afterEnter"
        @before-leave="beforeLeave"
        @after-leave="afterLeave"
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
const beforeEnter = (el) => {
  // 预设样式，避免闪烁
  el.style.willChange = 'transform, opacity'
  el.style.transform = 'translateX(100%)'
  el.style.opacity = '0'
}

const afterEnter = (el) => {
  // 清理 will-change
  el.style.willChange = ''
}

const beforeLeave = (el) => {
  el.style.willChange = 'transform, opacity'
}

const afterLeave = (el) => {
  el.style.willChange = ''
}
</script>

<style>
.transition-container {
  position: relative;
  /* 创建新的层叠上下文 */
  transform: translateZ(0);
}

.optimized-enter-active,
.optimized-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
  /* 使用 GPU 加速 */
  backface-visibility: hidden;
}
</style>
```

## 七、响应式过渡

### 7.1 基于屏幕尺寸的过渡

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const screenSize = ref('desktop')
const transitionName = ref('fade')

const updateScreenSize = () => {
  const width = window.innerWidth
  
  if (width < 768) {
    screenSize.value = 'mobile'
    transitionName.value = 'slide-up' // 移动端使用上滑
  } else if (width < 1024) {
    screenSize.value = 'tablet'
    transitionName.value = 'slide-left' // 平板使用左滑
  } else {
    screenSize.value = 'desktop'
    transitionName.value = 'fade' // 桌面使用淡入淡出
  }
}

onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>
```

### 7.2 基于网络状况的过渡

```vue
<script setup>
import { ref, onMounted } from 'vue'

const connectionSpeed = ref('fast')
const transitionDuration = ref('0.3s')

const checkNetworkSpeed = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  
  if (connection) {
    const effectiveType = connection.effectiveType
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        connectionSpeed.value = 'slow'
        transitionDuration.value = '0.15s' // 慢网络使用快速过渡
        break
      case '3g':
        connectionSpeed.value = 'medium'
        transitionDuration.value = '0.2s'
        break
      default:
        connectionSpeed.value = 'fast'
        transitionDuration.value = '0.3s'
    }
  }
}

onMounted(() => {
  checkNetworkSpeed()
})
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition 
      name="adaptive"
      mode="out-in"
      :duration="parseInt(transitionDuration) * 1000"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
.adaptive-enter-active,
.adaptive-leave-active {
  transition-duration: v-bind(transitionDuration);
  transition-property: opacity, transform;
  transition-timing-function: ease;
}
</style>
```

## 八、调试与测试

### 8.1 过渡调试工具

```vue
<script setup>
const debugTransition = process.env.NODE_ENV === 'development'

const logTransition = (phase, el, route) => {
  if (debugTransition) {
    console.log(`[Transition] ${phase}:`, {
      route: route?.path,
      element: el.tagName,
      timestamp: Date.now()
    })
  }
}

const onBeforeEnter = (el) => {
  logTransition('beforeEnter', el, route)
}

const onEnter = (el, done) => {
  logTransition('enter', el, route)
  done()
}

const onAfterEnter = (el) => {
  logTransition('afterEnter', el, route)
}

const onBeforeLeave = (el) => {
  logTransition('beforeLeave', el, route)
}

const onLeave = (el, done) => {
  logTransition('leave', el, route)
  done()
}

const onAfterLeave = (el) => {
  logTransition('afterLeave', el, route)
}
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition
      name="debug"
      mode="out-in"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @before-leave="onBeforeLeave"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>
```

### 8.2 性能监控

```vue
<script setup>
const performanceMonitor = {
  start: null,
  
  startTransition() {
    this.start = performance.now()
  },
  
  endTransition() {
    if (this.start) {
      const duration = performance.now() - this.start
      console.log(`过渡动画耗时: ${duration.toFixed(2)}ms`)
      
      if (duration > 500) {
        console.warn('过渡动画耗时过长，可能影响用户体验')
      }
      
      this.start = null
    }
  }
}

const onBeforeEnter = () => {
  performanceMonitor.startTransition()
}

const onAfterEnter = () => {
  performanceMonitor.endTransition()
}
</script>
```

## 九、最佳实践

### 9.1 过渡选择原则

```javascript
// ✅ 好的过渡选择
const transitionRules = {
  // 层级导航：使用滑动
  hierarchical: 'slide',
  
  // 标签切换：使用淡入淡出
  tabs: 'fade',
  
  // 模态框：使用缩放
  modal: 'scale',
  
  // 移动端：使用简单过渡
  mobile: 'fade',
  
  // 慢网络：使用快速过渡
  slowNetwork: 'fast-fade'
}

// ❌ 避免的做法
const badTransitions = {
  // 过度复杂的动画
  complex: '3d-flip-with-particles',
  
  // 过长的动画时间
  slow: 'slide-2s',
  
  // 不一致的动画风格
  inconsistent: 'random'
}
```

### 9.2 无障碍考虑

```vue
<script setup>
import { ref, onMounted } from 'vue'

const prefersReducedMotion = ref(false)

onMounted(() => {
  // 检查用户是否偏好减少动画
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = mediaQuery.matches
  
  mediaQuery.addEventListener('change', (e) => {
    prefersReducedMotion.value = e.matches
  })
})

const transitionName = computed(() => {
  // 如果用户偏好减少动画，使用简单过渡
  if (prefersReducedMotion.value) {
    return 'fade-fast'
  }
  return 'slide'
})
</script>

<style>
/* 快速淡入淡出，尊重用户偏好 */
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.1s ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}
</style>
```

## 十、总结

| 过渡类型 | 适用场景 | 性能影响 |
|----------|----------|----------|
| 淡入淡出 | 通用、无障碍 | 低 |
| 滑动 | 层级导航、移动端 | 中 |
| 缩放 | 模态框、弹窗 | 中 |
| 3D效果 | 特殊场景 | 高 |
| 自定义JS | 复杂动画 | 高 |

## 参考资料

- [Vue过渡和动画](https://vuejs.org/guide/built-ins/transition.html)
- [路由过渡动效](https://router.vuejs.org/guide/advanced/transitions.html)

---

**下一节** → [第 15 节：嵌套路由](./15-nested-routes.md)
