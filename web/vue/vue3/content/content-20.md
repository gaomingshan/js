# 自定义指令

> 自定义指令提供了直接操作 DOM 的能力，用于封装可复用的 DOM 操作逻辑。

## 核心概念

自定义指令是 Vue 提供的一种机制，用于对普通 DOM 元素进行底层操作。

### 基础定义

```vue
<script setup>
// 定义局部指令
const vFocus = {
  mounted(el) {
    el.focus()
  }
}
</script>

<template>
  <!-- 使用 v- 前缀 -->
  <input v-focus>
</template>
```

### 全局注册

```typescript
// main.ts
import { createApp } from 'vue'

const app = createApp(App)

// 全局注册指令
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

app.mount('#app')
```

---

## 指令钩子

自定义指令提供了以下钩子函数：

```typescript
const myDirective = {
  // 在绑定元素的 attribute 或事件监听器被应用之前调用
  created(el, binding, vnode, prevVnode) {
    console.log('created')
  },
  
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode, prevVnode) {
    console.log('beforeMount')
  },
  
  // 在绑定元素的父组件及他自己的所有子节点都挂载完成后调用
  mounted(el, binding, vnode, prevVnode) {
    console.log('mounted')
  },
  
  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {
    console.log('beforeUpdate')
  },
  
  // 在绑定元素的父组件及他自己的所有子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {
    console.log('updated')
  },
  
  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode, prevVnode) {
    console.log('beforeUnmount')
  },
  
  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode, prevVnode) {
    console.log('unmounted')
  }
}
```

### 钩子参数

```typescript
interface DirectiveBinding {
  value: any              // 传递给指令的值
  oldValue: any          // 之前的值（仅在 beforeUpdate 和 updated 中可用）
  arg: string | undefined // 传递给指令的参数
  modifiers: Record<string, boolean> // 修饰符对象
  instance: ComponentPublicInstance | null // 组件实例
  dir: ObjectDirective   // 指令定义对象
}
```

---

## 指令参数与修饰符

### 参数（arg）

```vue
<script setup>
const vColor = {
  mounted(el, binding) {
    // binding.arg = 'background'
    el.style[binding.arg] = binding.value
  }
}
</script>

<template>
  <!-- 使用冒号传递参数 -->
  <div v-color:background="'red'">红色背景</div>
  <div v-color:color="'blue'">蓝色文字</div>
</template>
```

### 修饰符（modifiers）

```vue
<script setup>
const vScroll = {
  mounted(el, binding) {
    const options = {
      behavior: binding.modifiers.smooth ? 'smooth' : 'auto',
      block: binding.modifiers.center ? 'center' : 'start'
    }
    
    el.scrollIntoView(options)
  }
}
</script>

<template>
  <!-- 使用点号传递修饰符 -->
  <div v-scroll.smooth.center>平滑滚动到中心</div>
</template>
```

### 动态参数

```vue
<script setup>
const vBind = {
  mounted(el, binding) {
    el.setAttribute(binding.arg, binding.value)
  }
}

const attrName = ref('title')
</script>

<template>
  <!-- 使用方括号传递动态参数 -->
  <div v-bind:[attrName]="'动态属性'">内容</div>
</template>
```

---

## 常见自定义指令

### v-focus - 自动聚焦

```typescript
// directives/focus.ts
import { Directive } from 'vue'

export const vFocus: Directive = {
  mounted(el) {
    el.focus()
  }
}

// 使用
<template>
  <input v-focus>
</template>
```

### v-click-outside - 点击外部

```typescript
// directives/clickOutside.ts
import { Directive } from 'vue'

export const vClickOutside: Directive = {
  mounted(el, binding) {
    el._clickOutside = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
    delete el._clickOutside
  }
}

// 使用
<script setup>
function handleClickOutside() {
  console.log('点击了外部')
}
</script>

<template>
  <div v-click-outside="handleClickOutside">
    点击外部会触发回调
  </div>
</template>
```

### v-lazy - 图片懒加载

```typescript
// directives/lazy.ts
import { Directive } from 'vue'

export const vLazy: Directive<HTMLImageElement> = {
  mounted(el, binding) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.src = binding.value
          observer.unobserve(el)
        }
      },
      {
        threshold: 0.1
      }
    )
    
    observer.observe(el)
    el._observer = observer
  },
  
  unmounted(el) {
    el._observer?.disconnect()
    delete el._observer
  }
}

// 使用
<template>
  <img v-lazy="imageUrl" alt="懒加载图片">
</template>
```

### v-permission - 权限控制

```typescript
// directives/permission.ts
import { Directive } from 'vue'

export const vPermission: Directive = {
  mounted(el, binding) {
    const userPermissions = getUserPermissions() // 获取用户权限
    const requiredPermission = binding.value
    
    if (!userPermissions.includes(requiredPermission)) {
      // 没有权限则移除元素
      el.parentNode?.removeChild(el)
    }
  }
}

// 使用
<template>
  <button v-permission="'delete'">删除</button>
  <button v-permission="'edit'">编辑</button>
</template>
```

### v-debounce - 防抖

```typescript
// directives/debounce.ts
import { Directive } from 'vue'

export const vDebounce: Directive = {
  mounted(el, binding) {
    let timeout: number | null = null
    const delay = binding.arg ? parseInt(binding.arg) : 300
    
    el.addEventListener('input', (event) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      
      timeout = setTimeout(() => {
        binding.value(event)
      }, delay) as unknown as number
    })
  }
}

// 使用
<script setup>
function handleInput(event) {
  console.log('输入:', event.target.value)
}
</script>

<template>
  <input v-debounce:500="handleInput">
</template>
```

### v-long-press - 长按

```typescript
// directives/longPress.ts
import { Directive } from 'vue'

export const vLongPress: Directive = {
  mounted(el, binding) {
    let pressTimer: number | null = null
    const duration = binding.arg ? parseInt(binding.arg) : 1000
    
    const start = () => {
      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          binding.value()
        }, duration) as unknown as number
      }
    }
    
    const cancel = () => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer)
        pressTimer = null
      }
    }
    
    el.addEventListener('mousedown', start)
    el.addEventListener('touchstart', start)
    el.addEventListener('mouseup', cancel)
    el.addEventListener('mouseleave', cancel)
    el.addEventListener('touchend', cancel)
    el.addEventListener('touchcancel', cancel)
    
    el._longPress = { start, cancel }
  },
  
  unmounted(el) {
    const { start, cancel } = el._longPress
    el.removeEventListener('mousedown', start)
    el.removeEventListener('touchstart', start)
    el.removeEventListener('mouseup', cancel)
    el.removeEventListener('mouseleave', cancel)
    el.removeEventListener('touchend', cancel)
    el.removeEventListener('touchcancel', cancel)
    delete el._longPress
  }
}

// 使用
<template>
  <button v-long-press:2000="handleLongPress">
    长按2秒
  </button>
</template>
```

---

## 组件上使用指令

```vue
<script setup>
const vFocus = {
  mounted(el) {
    // el 是组件的根元素
    el.querySelector('input')?.focus()
  }
}
</script>

<template>
  <!-- 指令应用在组件的根元素上 -->
  <MyComponent v-focus />
</template>
```

**注意**：
- 指令应用在组件的根元素上
- 不推荐在组件上使用指令（语义不清晰）
- 多根节点组件上使用指令会被忽略并发出警告

---

## 简化形式

如果指令只需要 `mounted` 和 `updated` 钩子，可以使用函数简写：

```typescript
// 完整形式
const vColor = {
  mounted(el, binding) {
    el.style.color = binding.value
  },
  updated(el, binding) {
    el.style.color = binding.value
  }
}

// 简写形式（自动应用到 mounted 和 updated）
const vColor = (el, binding) => {
  el.style.color = binding.value
}
```

---

## TypeScript 支持

```typescript
import { Directive, DirectiveBinding } from 'vue'

// 定义指令类型
interface FocusDirective extends Directive<HTMLElement, boolean> {}

export const vFocus: FocusDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding<boolean>) {
    if (binding.value) {
      el.focus()
    }
  }
}

// 扩展元素类型
declare module '@vue/runtime-dom' {
  interface HTMLElement {
    _clickOutside?: (event: Event) => void
    _observer?: IntersectionObserver
  }
}
```

---

## 易错点与边界情况

### 1. 指令执行时机

```typescript
const vExample = {
  created(el) {
    // ❌ DOM 还未插入，某些操作可能失败
    console.log(el.offsetHeight) // 可能为 0
  },
  
  mounted(el) {
    // ✅ DOM 已插入，可以安全访问
    console.log(el.offsetHeight) // 正确的值
  }
}
```

### 2. 内存泄漏

```typescript
const vBad = {
  mounted(el) {
    // ❌ 没有清理事件监听器
    window.addEventListener('resize', handler)
  }
}

const vGood = {
  mounted(el) {
    const handler = () => {}
    window.addEventListener('resize', handler)
    el._handler = handler
  },
  
  unmounted(el) {
    // ✅ 清理事件监听器
    window.removeEventListener('resize', el._handler)
    delete el._handler
  }
}
```

### 3. 组件更新

```typescript
const vExample = {
  mounted(el, binding) {
    // 初始化
    initSomething(el, binding.value)
  },
  
  updated(el, binding) {
    // ⚠️ 每次组件更新都会调用，需要判断值是否改变
    if (binding.value !== binding.oldValue) {
      updateSomething(el, binding.value)
    }
  }
}
```

---

## 前端工程实践

### 示例 1：拖拽指令

```typescript
// directives/draggable.ts
import { Directive } from 'vue'

export const vDraggable: Directive = {
  mounted(el: HTMLElement) {
    let isDragging = false
    let startX = 0
    let startY = 0
    let initialX = 0
    let initialY = 0
    
    el.style.position = 'absolute'
    el.style.cursor = 'move'
    
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      
      const rect = el.getBoundingClientRect()
      initialX = rect.left
      initialY = rect.top
      
      el.style.userSelect = 'none'
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      
      el.style.left = initialX + deltaX + 'px'
      el.style.top = initialY + deltaY + 'px'
    }
    
    const handleMouseUp = () => {
      isDragging = false
      el.style.userSelect = ''
    }
    
    el.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    el._draggable = { handleMouseDown, handleMouseMove, handleMouseUp }
  },
  
  unmounted(el: HTMLElement) {
    const { handleMouseDown, handleMouseMove, handleMouseUp } = el._draggable
    el.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    delete el._draggable
  }
}
```

### 示例 2：水印指令

```typescript
// directives/watermark.ts
import { Directive } from 'vue'

interface WatermarkOptions {
  text: string
  fontSize?: number
  color?: string
  rotate?: number
}

export const vWatermark: Directive<HTMLElement, WatermarkOptions> = {
  mounted(el, binding) {
    const { text, fontSize = 16, color = 'rgba(0,0,0,0.1)', rotate = -20 } = binding.value
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = 200
    canvas.height = 150
    
    ctx.rotate((rotate * Math.PI) / 180)
    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    
    el.style.backgroundImage = `url(${canvas.toDataURL()})`
    el.style.backgroundRepeat = 'repeat'
  }
}

// 使用
<template>
  <div v-watermark="{ text: '机密文件', fontSize: 20 }">
    内容区域
  </div>
</template>
```

### 示例 3：复制到剪贴板

```typescript
// directives/copy.ts
import { Directive } from 'vue'

export const vCopy: Directive = {
  mounted(el, binding) {
    el.style.cursor = 'pointer'
    
    el.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(binding.value)
        
        // 显示提示
        const tooltip = document.createElement('div')
        tooltip.textContent = '已复制'
        tooltip.style.cssText = `
          position: absolute;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          pointer-events: none;
          z-index: 9999;
        `
        
        const rect = el.getBoundingClientRect()
        tooltip.style.left = rect.left + 'px'
        tooltip.style.top = rect.bottom + 5 + 'px'
        
        document.body.appendChild(tooltip)
        
        setTimeout(() => {
          document.body.removeChild(tooltip)
        }, 2000)
      } catch (err) {
        console.error('复制失败:', err)
      }
    })
  }
}

// 使用
<template>
  <div v-copy="'要复制的文本'">点击复制</div>
</template>
```

### 示例 4：无限滚动

```typescript
// directives/infiniteScroll.ts
import { Directive } from 'vue'

interface InfiniteScrollOptions {
  callback: () => void
  distance?: number
}

export const vInfiniteScroll: Directive<HTMLElement, InfiniteScrollOptions> = {
  mounted(el, binding) {
    const { callback, distance = 100 } = binding.value
    
    const handleScroll = () => {
      const scrollTop = el.scrollTop
      const scrollHeight = el.scrollHeight
      const clientHeight = el.clientHeight
      
      if (scrollHeight - scrollTop - clientHeight < distance) {
        callback()
      }
    }
    
    el.addEventListener('scroll', handleScroll)
    el._infiniteScroll = handleScroll
  },
  
  unmounted(el) {
    el.removeEventListener('scroll', el._infiniteScroll)
    delete el._infiniteScroll
  }
}

// 使用
<script setup>
function loadMore() {
  console.log('加载更多数据')
}
</script>

<template>
  <div v-infinite-scroll="{ callback: loadMore, distance: 50 }">
    <!-- 列表内容 -->
  </div>
</template>
```

### 示例 5：元素可见性监听

```typescript
// directives/visible.ts
import { Directive } from 'vue'

interface VisibleOptions {
  callback: (isVisible: boolean) => void
  threshold?: number
}

export const vVisible: Directive<HTMLElement, VisibleOptions> = {
  mounted(el, binding) {
    const { callback, threshold = 0.5 } = binding.value
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting)
      },
      { threshold }
    )
    
    observer.observe(el)
    el._observer = observer
  },
  
  unmounted(el) {
    el._observer?.disconnect()
    delete el._observer
  }
}

// 使用
<script setup>
function handleVisibilityChange(isVisible: boolean) {
  console.log('元素可见:', isVisible)
}
</script>

<template>
  <div v-visible="{ callback: handleVisibilityChange, threshold: 0.8 }">
    内容
  </div>
</template>
```

---

## 指令库整合

### 统一导出

```typescript
// directives/index.ts
import type { App } from 'vue'
import { vFocus } from './focus'
import { vClickOutside } from './clickOutside'
import { vLazy } from './lazy'
import { vPermission } from './permission'

export const directives = {
  focus: vFocus,
  clickOutside: vClickOutside,
  lazy: vLazy,
  permission: vPermission
}

export function setupDirectives(app: App) {
  Object.entries(directives).forEach(([name, directive]) => {
    app.directive(name, directive)
  })
}

// main.ts
import { setupDirectives } from './directives'

const app = createApp(App)
setupDirectives(app)
app.mount('#app')
```

---

## 最佳实践

1. **命名规范**：使用 `v-` 前缀，语义化命名
2. **单一职责**：每个指令只做一件事
3. **清理资源**：在 `unmounted` 钩子中清理
4. **性能优化**：避免在 `updated` 中做重复操作
5. **TypeScript 支持**：提供类型定义
6. **错误处理**：捕获并处理可能的错误
7. **文档化**：注释说明指令的用法和参数
8. **优先组件**：能用组件解决的不用指令

---

## 指令 vs 组件

| 场景 | 推荐方案 |
|------|---------|
| DOM 操作 | 指令 |
| 复杂交互 | 组件 |
| 样式控制 | 指令或组件 |
| 状态管理 | 组件 |
| 可复用 UI | 组件 |
| 底层优化 | 指令 |

---

## 参考资料

- [自定义指令](https://cn.vuejs.org/guide/reusability/custom-directives.html)
- [指令 API](https://cn.vuejs.org/api/application.html#app-directive)
- [内置指令](https://cn.vuejs.org/api/built-in-directives.html)
