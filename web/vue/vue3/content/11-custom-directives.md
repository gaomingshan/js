# 第 11 节：自定义指令

## 概述

除了内置指令（v-if、v-for 等），Vue 允许注册自定义指令。指令适用于需要直接操作 DOM 的场景。

## 一、基本用法

### 1.1 局部注册

```vue
<template>
  <input v-focus />
</template>

<script setup>
// 在 <script setup> 中，以 v 开头的变量可作为指令
const vFocus = {
  mounted: (el) => el.focus()
}
</script>
```

### 1.2 全局注册

```javascript
// main.js
import { createApp } from 'vue'

const app = createApp({})

app.directive('focus', {
  mounted: (el) => el.focus()
})

app.mount('#app')
```

## 二、指令钩子

### 2.1 钩子函数

```javascript
const myDirective = {
  // 元素绑定前
  created(el, binding, vnode, prevVnode) {},
  
  // 元素插入父节点前
  beforeMount(el, binding, vnode, prevVnode) {},
  
  // 元素插入父节点后
  mounted(el, binding, vnode, prevVnode) {},
  
  // 组件更新前
  beforeUpdate(el, binding, vnode, prevVnode) {},
  
  // 组件更新后
  updated(el, binding, vnode, prevVnode) {},
  
  // 元素卸载前
  beforeUnmount(el, binding, vnode, prevVnode) {},
  
  // 元素卸载后
  unmounted(el, binding, vnode, prevVnode) {}
}
```

### 2.2 钩子参数

```javascript
const vDemo = {
  mounted(el, binding, vnode, prevVnode) {
    // el: 指令绑定的 DOM 元素
    console.log(el)
    
    // binding 对象包含：
    console.log(binding.value)      // 指令的值
    console.log(binding.oldValue)   // 之前的值（仅在 updated 中可用）
    console.log(binding.arg)        // 指令参数
    console.log(binding.modifiers)  // 修饰符对象
    console.log(binding.instance)   // 组件实例
    console.log(binding.dir)        // 指令定义对象
    
    // vnode: 绑定元素的虚拟节点
    // prevVnode: 之前的虚拟节点（仅在 updated 中可用）
  }
}
```

### 2.3 使用示例

```vue
<template>
  <!-- 基本 -->
  <div v-demo>内容</div>
  
  <!-- 带值 -->
  <div v-demo="'hello'">内容</div>
  <div v-demo="{ color: 'red' }">内容</div>
  
  <!-- 带参数 -->
  <div v-demo:foo>内容</div>
  
  <!-- 带修饰符 -->
  <div v-demo.bar.baz>内容</div>
  
  <!-- 完整形式 -->
  <div v-demo:foo.bar="value">内容</div>
</template>
```

## 三、简写形式

```javascript
// 如果只需要 mounted 和 updated 且逻辑相同
app.directive('color', (el, binding) => {
  el.style.color = binding.value
})
```

```vue
<template>
  <p v-color="'red'">红色文字</p>
</template>
```

## 四、实用指令示例

### 4.1 v-click-outside（点击外部）

```javascript
// 点击元素外部时触发
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutsideHandler = (event) => {
      if (!el.contains(event.target)) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutsideHandler)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutsideHandler)
  }
}
```

```vue
<template>
  <div v-click-outside="closeDropdown" class="dropdown">
    下拉菜单内容
  </div>
</template>

<script setup>
const vClickOutside = { /* 上面的定义 */ }

function closeDropdown() {
  // 关闭下拉菜单
}
</script>
```

### 4.2 v-loading（加载状态）

```javascript
const vLoading = {
  mounted(el, binding) {
    const spinner = document.createElement('div')
    spinner.className = 'loading-spinner'
    spinner.innerHTML = '加载中...'
    spinner.style.display = binding.value ? 'block' : 'none'
    el.appendChild(spinner)
    el._spinner = spinner
  },
  updated(el, binding) {
    el._spinner.style.display = binding.value ? 'block' : 'none'
  },
  unmounted(el) {
    el._spinner.remove()
  }
}
```

```vue
<template>
  <div v-loading="isLoading">
    内容区域
  </div>
</template>
```

### 4.3 v-debounce（防抖）

```javascript
const vDebounce = {
  mounted(el, binding) {
    let timer = null
    const delay = binding.arg ? parseInt(binding.arg) : 300
    
    el._debounceHandler = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        binding.value()
      }, delay)
    }
    
    el.addEventListener('input', el._debounceHandler)
  },
  unmounted(el) {
    el.removeEventListener('input', el._debounceHandler)
  }
}
```

```vue
<template>
  <input v-debounce:500="search" placeholder="搜索..." />
</template>
```

### 4.4 v-permission（权限控制）

```javascript
const vPermission = {
  mounted(el, binding) {
    const { value } = binding
    const userPermissions = getUserPermissions()  // 获取用户权限
    
    if (!userPermissions.includes(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}
```

```vue
<template>
  <button v-permission="'admin:delete'">删除</button>
</template>
```

### 4.5 v-copy（复制文本）

```javascript
const vCopy = {
  mounted(el, binding) {
    el._copyHandler = async () => {
      try {
        await navigator.clipboard.writeText(binding.value)
        alert('复制成功')
      } catch (err) {
        console.error('复制失败', err)
      }
    }
    el.addEventListener('click', el._copyHandler)
  },
  updated(el, binding) {
    // 更新要复制的值
  },
  unmounted(el) {
    el.removeEventListener('click', el._copyHandler)
  }
}
```

```vue
<template>
  <button v-copy="textToCopy">复制</button>
</template>
```

### 4.6 v-lazy（图片懒加载）

```javascript
const vLazy = {
  mounted(el, binding) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.src = binding.value
        observer.unobserve(el)
      }
    })
    
    // 设置占位图
    el.src = 'placeholder.png'
    observer.observe(el)
    
    el._observer = observer
  },
  unmounted(el) {
    el._observer?.disconnect()
  }
}
```

```vue
<template>
  <img v-lazy="imageUrl" alt="懒加载图片" />
</template>
```

## 五、在组件上使用

```vue
<!-- 在组件上使用指令，会应用到组件的根元素 -->
<MyComponent v-demo />

<!-- 多根节点组件，指令会被忽略并警告 -->
```

## 六、动态参数

```vue
<template>
  <!-- 动态参数 -->
  <div v-demo:[arg]="value">内容</div>
</template>

<script setup>
import { ref } from 'vue'
const arg = ref('foo')
</script>
```

## 七、指令 vs 组合式函数

| 场景 | 推荐 |
|------|------|
| 纯 DOM 操作 | 指令 |
| 复杂逻辑 | 组合式函数 |
| 可复用状态逻辑 | 组合式函数 |
| 第三方库绑定 | 指令 |

```javascript
// 如果逻辑复杂，可能更适合用组合式函数
// useClickOutside.js
export function useClickOutside(elementRef, callback) {
  const handler = (event) => {
    if (!elementRef.value?.contains(event.target)) {
      callback(event)
    }
  }
  
  onMounted(() => document.addEventListener('click', handler))
  onUnmounted(() => document.removeEventListener('click', handler))
}
```

## 八、最佳实践

| 实践 | 说明 |
|------|------|
| 清理副作用 | 在 unmounted 中移除事件监听 |
| 命名规范 | 使用 v- 前缀（setup 中）或 kebab-case |
| 保持简单 | 复杂逻辑用组合式函数 |
| 类型安全 | TypeScript 中定义指令类型 |

## 参考资料

- [自定义指令](https://vuejs.org/guide/reusability/custom-directives.html)

---

**下一节** → [第 12 节：模板引用](./12-template-refs.md)
