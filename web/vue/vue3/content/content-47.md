# 移动端适配

> 构建响应式且性能优异的移动端 Vue 3 应用。

## 视口配置

### meta viewport

```html
<!-- index.html -->
<meta 
  name="viewport" 
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
>
```

### 禁用双击缩放

```css
* {
  touch-action: manipulation;
}
```

---

## 响应式布局

### 媒体查询

```css
/* 移动端优先 */
.container {
  padding: 10px;
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    padding: 20px;
  }
}

/* 桌面端 */
@media (min-width: 1024px) {
  .container {
    padding: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Flexbox 布局

```vue
<template>
  <div class="flex-container">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </div>
</template>

<style scoped>
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.flex-item {
  flex: 1 1 100%;
}

@media (min-width: 768px) {
  .flex-item {
    flex: 1 1 calc(50% - 10px);
  }
}

@media (min-width: 1024px) {
  .flex-item {
    flex: 1 1 calc(33.333% - 10px);
  }
}
</style>
```

### Grid 布局

```vue
<style scoped>
.grid-container {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

@media (min-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
```

---

## 单位转换

### rem 适配

```typescript
// utils/rem.ts
export function setRem() {
  const baseSize = 16 // 基准字号
  const scale = document.documentElement.clientWidth / 375 // 设计稿宽度
  
  document.documentElement.style.fontSize = baseSize * Math.min(scale, 2) + 'px'
}

// main.ts
setRem()
window.addEventListener('resize', setRem)
```

```css
/* 使用 rem */
.title {
  font-size: 1.5rem; /* 24px / 16px */
  margin: 1rem; /* 16px / 16px */
}
```

### vw/vh 适配

```css
.container {
  width: 100vw;
  height: 100vh;
  font-size: 4vw; /* 15px on 375px wide screen */
}
```

### PostCSS 插件

```bash
npm install -D postcss-pxtorem
```

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 16,
      propList: ['*'],
      selectorBlackList: ['.no-rem']
    }
  }
}
```

```css
/* 编译前 */
.title {
  font-size: 24px;
  margin: 16px;
}

/* 编译后 */
.title {
  font-size: 1.5rem;
  margin: 1rem;
}
```

---

## 触摸事件

### 基础事件

```vue
<script setup>
function handleTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  console.log('Touch start:', touch.clientX, touch.clientY)
}

function handleTouchMove(e: TouchEvent) {
  e.preventDefault() // 阻止滚动
  const touch = e.touches[0]
  console.log('Touch move:', touch.clientX, touch.clientY)
}

function handleTouchEnd(e: TouchEvent) {
  console.log('Touch end')
}
</script>

<template>
  <div
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    触摸区域
  </div>
</template>
```

### 滑动手势

```typescript
// composables/useSwipe.ts
export function useSwipe(
  target: Ref<HTMLElement | undefined>,
  options: {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
    threshold?: number
  }
) {
  const { threshold = 50 } = options
  
  let startX = 0
  let startY = 0
  
  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
  }
  
  function handleTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          options.onSwipeRight?.()
        } else {
          options.onSwipeLeft?.()
        }
      }
    } else {
      // 垂直滑动
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          options.onSwipeDown?.()
        } else {
          options.onSwipeUp?.()
        }
      }
    }
  }
  
  onMounted(() => {
    const el = target.value
    if (el) {
      el.addEventListener('touchstart', handleTouchStart)
      el.addEventListener('touchend', handleTouchEnd)
    }
  })
  
  onUnmounted(() => {
    const el = target.value
    if (el) {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  })
}

// 使用
<script setup>
const containerRef = ref<HTMLElement>()

useSwipe(containerRef, {
  onSwipeLeft: () => console.log('向左滑动'),
  onSwipeRight: () => console.log('向右滑动')
})
</script>

<template>
  <div ref="containerRef">滑动内容</div>
</template>
```

### 长按

```typescript
// composables/useLongPress.ts
export function useLongPress(
  callback: () => void,
  duration = 500
) {
  let timer: number
  
  function start() {
    timer = setTimeout(callback, duration) as unknown as number
  }
  
  function cancel() {
    clearTimeout(timer)
  }
  
  return {
    onTouchstart: start,
    onTouchend: cancel,
    onTouchmove: cancel
  }
}

// 使用
<script setup>
const longPress = useLongPress(() => {
  console.log('长按触发')
})
</script>

<template>
  <button v-bind="longPress">长按我</button>
</template>
```

---

## 下拉刷新

```vue
<script setup lang="ts">
const loading = ref(false)
const startY = ref(0)
const moveY = ref(0)
const containerRef = ref<HTMLElement>()

const pullDistance = computed(() => Math.max(0, moveY.value - startY.value))
const isPulling = computed(() => pullDistance.value > 0)
const canRefresh = computed(() => pullDistance.value > 60)

function handleTouchStart(e: TouchEvent) {
  if (containerRef.value?.scrollTop === 0) {
    startY.value = e.touches[0].clientY
  }
}

function handleTouchMove(e: TouchEvent) {
  if (startY.value === 0) return
  
  moveY.value = e.touches[0].clientY
  
  if (isPulling.value) {
    e.preventDefault()
  }
}

async function handleTouchEnd() {
  if (canRefresh.value && !loading.value) {
    loading.value = true
    
    try {
      await refresh()
    } finally {
      loading.value = false
    }
  }
  
  startY.value = 0
  moveY.value = 0
}

async function refresh() {
  // 刷新数据
  await new Promise(resolve => setTimeout(resolve, 1000))
}
</script>

<template>
  <div
    ref="containerRef"
    class="pull-refresh-container"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div
      class="pull-refresh-header"
      :style="{ height: pullDistance + 'px' }"
    >
      <div v-if="loading" class="loading">刷新中...</div>
      <div v-else-if="canRefresh">释放刷新</div>
      <div v-else-if="isPulling">下拉刷新</div>
    </div>
    
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.pull-refresh-container {
  height: 100vh;
  overflow-y: auto;
}

.pull-refresh-header {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 0.3s;
}
</style>
```

---

## 滚动优化

### 虚拟滚动

```vue
<script setup lang="ts">
interface Item {
  id: number
  content: string
}

const props = defineProps<{
  items: Item[]
  itemHeight: number
}>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(0)

const visibleStart = computed(() => 
  Math.floor(scrollTop.value / props.itemHeight)
)

const visibleEnd = computed(() => 
  Math.ceil((scrollTop.value + containerHeight.value) / props.itemHeight)
)

const visibleItems = computed(() => 
  props.items.slice(visibleStart.value, visibleEnd.value + 1)
)

const offsetY = computed(() => 
  visibleStart.value * props.itemHeight
)

function handleScroll(e: Event) {
  scrollTop.value = (e.target as HTMLElement).scrollTop
}

onMounted(() => {
  containerHeight.value = containerRef.value?.clientHeight || 0
})
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-scroll"
    @scroll="handleScroll"
  >
    <div :style="{ height: items.length * itemHeight + 'px' }">
      <div :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="item in visibleItems"
          :key="item.id"
          :style="{ height: itemHeight + 'px' }"
        >
          {{ item.content }}
        </div>
      </div>
    </div>
  </div>
</template>
```

### Passive 事件监听

```typescript
// 提升滚动性能
element.addEventListener('touchstart', handler, { passive: true })
element.addEventListener('touchmove', handler, { passive: true })
```

---

## 图片懒加载

```typescript
// directives/lazy.ts
export const vLazy = {
  mounted(el: HTMLImageElement, binding: any) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.src = binding.value
        observer.unobserve(el)
      }
    })
    
    observer.observe(el)
  }
}

// 使用
<template>
  <img v-lazy="imageUrl" alt="Lazy image" />
</template>
```

---

## 1px 问题

### viewport 方案

```html
<meta 
  name="viewport" 
  content="width=device-width, initial-scale=0.5, maximum-scale=0.5, user-scalable=no"
>
```

### transform 方案

```css
.border-1px {
  position: relative;
}

.border-1px::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #e5e5e5;
  transform: scaleY(0.5);
  transform-origin: 0 100%;
}

@media (-webkit-min-device-pixel-ratio: 2) {
  .border-1px::after {
    transform: scaleY(0.5);
  }
}

@media (-webkit-min-device-pixel-ratio: 3) {
  .border-1px::after {
    transform: scaleY(0.33);
  }
}
```

---

## 安全区域

### iOS 安全区域

```css
/* 适配 iPhone X 等机型 */
.container {
  padding-bottom: constant(safe-area-inset-bottom); /* iOS < 11.2 */
  padding-bottom: env(safe-area-inset-bottom); /* iOS >= 11.2 */
}

/* 全屏内容 */
.fullscreen {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

---

## PWA 支持

### manifest.json

```json
{
  "name": "My Vue App",
  "short_name": "Vue App",
  "description": "A progressive web app",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#42b983",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker

```bash
npm install -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My Vue App',
        short_name: 'Vue App',
        theme_color: '#42b983'
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1天
              }
            }
          }
        ]
      }
    })
  ]
})
```

---

## 调试工具

### vConsole

```bash
npm install vconsole
```

```typescript
// main.ts
if (import.meta.env.DEV) {
  import('vconsole').then(({ default: VConsole }) => {
    new VConsole()
  })
}
```

### Eruda

```bash
npm install eruda
```

```typescript
// main.ts
if (import.meta.env.DEV) {
  import('eruda').then(eruda => {
    eruda.default.init()
  })
}
```

---

## 性能优化

### 减少重绘重排

```vue
<script setup>
// ❌ 不推荐：频繁操作 DOM
function animate() {
  element.style.left = '100px'
  element.style.top = '100px'
}

// ✅ 推荐：使用 transform
function animate() {
  element.style.transform = 'translate(100px, 100px)'
}
</script>
```

### 图片压缩

```bash
npm install -D vite-plugin-imagemin
```

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    vue(),
    viteImagemin({
      mozjpeg: {
        quality: 80
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      }
    })
  ]
})
```

---

## UI 组件库

### Vant

```bash
npm install vant
```

```typescript
// main.ts
import { Button, Cell } from 'vant'
import 'vant/lib/index.css'

app.use(Button)
app.use(Cell)
```

### Ant Design Mobile

```bash
npm install antd-mobile
```

```vue
<script setup>
import { Button, List } from 'antd-mobile'
</script>

<template>
  <Button color="primary">按钮</Button>
  <List>
    <List.Item>列表项</List.Item>
  </List>
</template>
```

---

## 最佳实践

1. **移动优先**：从移动端开始设计
2. **触摸友好**：按钮足够大（44×44px）
3. **响应式布局**：适配各种屏幕
4. **性能优化**：减少重绘重排
5. **图片优化**：压缩、懒加载、WebP
6. **离线支持**：PWA
7. **测试覆盖**：真机测试
8. **用户体验**：快速响应、流畅动画

---

## 参考资料

- [移动端适配方案](https://github.com/amfe/article/issues/17)
- [Vant 文档](https://vant-ui.github.io/vant/)
- [PWA 指南](https://web.dev/progressive-web-apps/)
- [Mobile Web Best Practices](https://www.w3.org/TR/mobile-bp/)
