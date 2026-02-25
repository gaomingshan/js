# 可访问性

> 构建无障碍的 Vue 3 应用，让所有用户都能使用。

## 核心概念

Web 可访问性（a11y）确保所有人，包括残障人士，都能访问和使用 Web 应用。

### WCAG 标准

- **可感知**：信息和界面组件必须以用户能感知的方式呈现
- **可操作**：界面组件和导航必须可操作
- **可理解**：信息和界面操作必须可理解
- **健壮**：内容必须足够健壮，能被各种用户代理解释

---

## 语义化 HTML

### 正确使用标签

```vue
<!-- ❌ 不推荐：使用 div -->
<div @click="handleClick">点击</div>

<!-- ✅ 推荐：使用 button -->
<button @click="handleClick">点击</button>

<!-- ❌ 不推荐：使用 div 作为链接 -->
<div @click="navigate">链接</div>

<!-- ✅ 推荐：使用 a 标签 -->
<a href="/page">链接</a>
<router-link to="/page">链接</router-link>
```

### 结构化内容

```vue
<template>
  <header>
    <nav>
      <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <article>
      <h1>文章标题</h1>
      <p>文章内容</p>
    </article>
  </main>
  
  <footer>
    <p>&copy; 2024</p>
  </footer>
</template>
```

---

## ARIA 属性

### 角色（role）

```vue
<template>
  <!-- 导航 -->
  <nav role="navigation">
    <ul>
      <li><a href="/">首页</a></li>
    </ul>
  </nav>
  
  <!-- 搜索 -->
  <div role="search">
    <input type="search" aria-label="搜索" />
    <button>搜索</button>
  </div>
  
  <!-- 警告 -->
  <div role="alert">
    操作成功！
  </div>
  
  <!-- 对话框 -->
  <div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
    <h2 id="dialog-title">对话框标题</h2>
    <p>对话框内容</p>
  </div>
</template>
```

### 状态（aria-*)

```vue
<script setup>
const expanded = ref(false)
const selected = ref(false)
const disabled = ref(false)
</script>

<template>
  <!-- 展开/折叠 -->
  <button
    @click="expanded = !expanded"
    :aria-expanded="expanded"
  >
    菜单
  </button>
  
  <!-- 选中状态 -->
  <div
    role="option"
    :aria-selected="selected"
  >
    选项
  </div>
  
  <!-- 禁用状态 -->
  <button :aria-disabled="disabled">
    按钮
  </button>
  
  <!-- 隐藏元素 -->
  <div aria-hidden="true">
    装饰性内容
  </div>
</template>
```

### 标签（aria-label）

```vue
<template>
  <!-- 无文本的按钮 -->
  <button aria-label="关闭">
    <svg><!-- 关闭图标 --></svg>
  </button>
  
  <!-- 描述性标签 -->
  <input
    type="search"
    aria-label="搜索用户"
    placeholder="输入用户名"
  />
  
  <!-- 标签引用 -->
  <label id="username-label">用户名</label>
  <input
    type="text"
    aria-labelledby="username-label"
  />
  
  <!-- 描述 -->
  <input
    type="password"
    aria-describedby="password-help"
  />
  <span id="password-help">
    密码至少8位
  </span>
</template>
```

---

## 键盘导航

### 焦点管理

```vue
<script setup>
const inputRef = ref<HTMLInputElement>()
const firstButtonRef = ref<HTMLButtonElement>()

function handleOpen() {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function handleClose() {
  firstButtonRef.value?.focus()
}

// 捕获焦点
function trapFocus(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    const focusableElements = container.value?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements) {
      const first = focusableElements[0] as HTMLElement
      const last = focusableElements[focusableElements.length - 1] as HTMLElement
      
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
}
</script>

<template>
  <div @keydown="trapFocus">
    <input ref="inputRef" />
    <button ref="firstButtonRef">确定</button>
  </div>
</template>
```

### 键盘快捷键

```vue
<script setup>
import { onKeyStroke } from '@vueuse/core'

// Ctrl+S 保存
onKeyStroke(['s', 'S'], (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    handleSave()
  }
})

// ESC 关闭
onKeyStroke('Escape', () => {
  handleClose()
})

// 方向键导航
onKeyStroke(['ArrowUp', 'ArrowDown'], (e) => {
  e.preventDefault()
  if (e.key === 'ArrowUp') {
    selectPrevious()
  } else {
    selectNext()
  }
})
</script>

<template>
  <div
    role="listbox"
    tabindex="0"
    @keydown.up.prevent="selectPrevious"
    @keydown.down.prevent="selectNext"
    @keydown.enter="selectCurrent"
  >
    <div
      v-for="item in items"
      :key="item.id"
      role="option"
      :aria-selected="item.selected"
    >
      {{ item.name }}
    </div>
  </div>
</template>
```

### tabindex

```vue
<template>
  <!-- 可聚焦 -->
  <div tabindex="0">可聚焦的 div</div>
  
  <!-- 不可聚焦但可通过 JS 聚焦 -->
  <div tabindex="-1">跳过 Tab 键</div>
  
  <!-- 自定义 Tab 顺序（不推荐） -->
  <input tabindex="1" />
  <input tabindex="2" />
</template>
```

---

## 表单可访问性

### 标签关联

```vue
<template>
  <!-- 显式关联 -->
  <label for="username">用户名</label>
  <input id="username" type="text" />
  
  <!-- 隐式关联 -->
  <label>
    用户名
    <input type="text" />
  </label>
  
  <!-- 使用 aria-labelledby -->
  <span id="username-label">用户名</span>
  <input type="text" aria-labelledby="username-label" />
</template>
```

### 错误提示

```vue
<script setup>
const email = ref('')
const emailError = ref('')

function validateEmail() {
  if (!email.value) {
    emailError.value = '邮箱不能为空'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = '邮箱格式不正确'
  } else {
    emailError.value = ''
  }
}
</script>

<template>
  <label for="email">邮箱</label>
  <input
    id="email"
    v-model="email"
    type="email"
    :aria-invalid="!!emailError"
    :aria-describedby="emailError ? 'email-error' : undefined"
    @blur="validateEmail"
  />
  <div
    v-if="emailError"
    id="email-error"
    role="alert"
    aria-live="polite"
  >
    {{ emailError }}
  </div>
</template>
```

### 必填字段

```vue
<template>
  <label for="username">
    用户名
    <span aria-label="必填">*</span>
  </label>
  <input
    id="username"
    type="text"
    required
    aria-required="true"
  />
</template>
```

---

## 颜色与对比度

### 对比度标准

WCAG AA 级别：
- 普通文本：4.5:1
- 大文本（18pt+）：3:1
- UI 组件：3:1

```css
/* ✅ 足够对比度 */
.text {
  color: #333;
  background: #fff;
  /* 对比度: 12.6:1 */
}

/* ❌ 对比度不足 */
.text-low-contrast {
  color: #999;
  background: #fff;
  /* 对比度: 2.8:1 */
}
```

### 不仅依赖颜色

```vue
<template>
  <!-- ❌ 仅用颜色表示状态 -->
  <span :class="{ 'text-red': hasError }">
    {{ message }}
  </span>
  
  <!-- ✅ 使用图标和文本 -->
  <span :class="{ 'text-red': hasError }">
    <svg v-if="hasError" aria-hidden="true"><!-- 错误图标 --></svg>
    {{ message }}
    <span v-if="hasError" class="sr-only">错误：</span>
  </span>
</template>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

---

## 动态内容

### Live Regions

```vue
<script setup>
const notifications = ref<string[]>([])

function addNotification(message: string) {
  notifications.value.push(message)
  
  // 3秒后移除
  setTimeout(() => {
    notifications.value.shift()
  }, 3000)
}
</script>

<template>
  <!-- 礼貌提示 -->
  <div aria-live="polite" aria-atomic="true">
    <div v-for="(notification, index) in notifications" :key="index">
      {{ notification }}
    </div>
  </div>
  
  <!-- 立即提示 -->
  <div aria-live="assertive" role="alert">
    {{ urgentMessage }}
  </div>
</template>
```

### 加载状态

```vue
<script setup>
const loading = ref(false)
</script>

<template>
  <button
    @click="handleSubmit"
    :disabled="loading"
    :aria-busy="loading"
  >
    <span v-if="loading" aria-hidden="true">⏳</span>
    {{ loading ? '加载中...' : '提交' }}
  </button>
  
  <!-- 加载指示器 -->
  <div
    v-if="loading"
    role="status"
    aria-live="polite"
    aria-label="正在加载"
  >
    <div class="spinner" aria-hidden="true"></div>
    <span class="sr-only">正在加载...</span>
  </div>
</template>
```

---

## 模态框可访问性

```vue
<script setup lang="ts">
const isOpen = ref(false)
const modalRef = ref<HTMLElement>()
const closeButtonRef = ref<HTMLButtonElement>()
const triggerRef = ref<HTMLButtonElement>()

function open() {
  isOpen.value = true
  nextTick(() => {
    closeButtonRef.value?.focus()
  })
}

function close() {
  isOpen.value = false
  nextTick(() => {
    triggerRef.value?.focus()
  })
}

// 捕获焦点
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close()
  }
}

// 阻止背景滚动
watch(isOpen, (value) => {
  if (value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <button ref="triggerRef" @click="open">
    打开模态框
  </button>
  
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="modal-overlay"
      @click="close"
    >
      <div
        ref="modalRef"
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        @click.stop
        @keydown="handleKeydown"
      >
        <h2 id="modal-title">模态框标题</h2>
        <p id="modal-description">模态框描述</p>
        
        <button
          ref="closeButtonRef"
          @click="close"
          aria-label="关闭模态框"
        >
          关闭
        </button>
      </div>
    </div>
  </Teleport>
</template>
```

---

## 图片可访问性

### alt 文本

```vue
<template>
  <!-- 内容图片 -->
  <img src="user.jpg" alt="用户头像" />
  
  <!-- 装饰性图片 -->
  <img src="decoration.svg" alt="" />
  
  <!-- 复杂图片 -->
  <figure>
    <img
      src="chart.png"
      alt="2024年销售趋势图"
      aria-describedby="chart-description"
    />
    <figcaption id="chart-description">
      销售额从1月的10万增长到12月的50万
    </figcaption>
  </figure>
  
  <!-- 链接图片 -->
  <a href="/profile">
    <img src="avatar.jpg" alt="查看个人资料" />
  </a>
</template>
```

### 响应式图片

```vue
<template>
  <picture>
    <source
      media="(min-width: 1200px)"
      srcset="large.jpg"
    />
    <source
      media="(min-width: 768px)"
      srcset="medium.jpg"
    />
    <img
      src="small.jpg"
      alt="风景照片"
    />
  </picture>
</template>
```

---

## 国际化与本地化

### 语言属性

```vue
<script setup>
const locale = ref('zh-CN')
</script>

<template>
  <html :lang="locale">
    <body>
      <p>中文内容</p>
      <p lang="en">English content</p>
    </body>
  </html>
</template>
```

### 方向性

```vue
<script setup>
const direction = ref<'ltr' | 'rtl'>('ltr')
</script>

<template>
  <div :dir="direction">
    <p>文本内容</p>
  </div>
</template>
```

---

## 测试工具

### 自动化测试

```typescript
// tests/a11y.spec.ts
import { mount } from '@vue/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import MyComponent from './MyComponent.vue'

expect.extend(toHaveNoViolations)

describe('Accessibility', () => {
  it('should not have a11y violations', async () => {
    const wrapper = mount(MyComponent)
    const results = await axe(wrapper.element)
    
    expect(results).toHaveNoViolations()
  })
})
```

### 浏览器工具

- **Chrome DevTools**：Lighthouse 审计
- **axe DevTools**：浏览器扩展
- **WAVE**：Web 可访问性评估工具

### 屏幕阅读器测试

- **NVDA**（Windows，免费）
- **JAWS**（Windows）
- **VoiceOver**（macOS/iOS）
- **TalkBack**（Android）

---

## 实战组件

### 可访问的按钮

```vue
<script setup lang="ts">
interface Props {
  disabled?: boolean
  loading?: boolean
  ariaLabel?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(e: MouseEvent) {
  if (props.disabled || props.loading) {
    e.preventDefault()
    return
  }
  emit('click', e)
}
</script>

<template>
  <button
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <span v-if="loading" aria-hidden="true">⏳</span>
    <slot></slot>
  </button>
</template>
```

### 可访问的下拉菜单

```vue
<script setup lang="ts">
const isOpen = ref(false)
const selectedIndex = ref(-1)
const items = ['选项1', '选项2', '选项3']

function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, items.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      if (selectedIndex.value >= 0) {
        selectItem(selectedIndex.value)
      }
      break
    case 'Escape':
      isOpen.value = false
      break
  }
}
</script>

<template>
  <div class="dropdown">
    <button
      @click="isOpen = !isOpen"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
    >
      选择选项
    </button>
    
    <ul
      v-if="isOpen"
      role="listbox"
      @keydown="handleKeydown"
    >
      <li
        v-for="(item, index) in items"
        :key="index"
        role="option"
        :aria-selected="index === selectedIndex"
        @click="selectItem(index)"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>
```

---

## 最佳实践

1. **语义化 HTML**：使用正确的标签
2. **键盘导航**：所有功能可通过键盘访问
3. **ARIA 属性**：适当使用 ARIA
4. **焦点管理**：明确的焦点指示和顺序
5. **颜色对比**：足够的对比度
6. **替代文本**：为图片提供 alt
7. **错误提示**：清晰的错误信息
8. **自动化测试**：集成可访问性测试
9. **真实测试**：使用屏幕阅读器测试
10. **持续改进**：定期审查和优化

---

## 参考资料

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Vue Accessibility Guide](https://vuejs.org/guide/best-practices/accessibility.html)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
