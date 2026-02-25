# 渲染函数与 JSX

> 渲染函数提供了完全的 JavaScript 编程能力，JSX 让渲染函数更具表达力。

## 核心概念

渲染函数是 Vue 模板的底层实现，提供了更灵活的组件渲染方式。

### h() 函数

```typescript
import { h } from 'vue'

// h(tag, props, children)
h('div', { id: 'app' }, 'Hello')

// 渲染结果
// <div id="app">Hello</div>
```

### 基础示例

```vue
<script setup>
import { h, ref } from 'vue'

const count = ref(0)

// 渲染函数
function render() {
  return h('div', { class: 'container' }, [
    h('h1', null, 'Counter'),
    h('p', null, `Count: ${count.value}`),
    h('button', {
      onClick: () => count.value++
    }, '+1')
  ])
}
</script>

<template>
  <!-- 使用渲染函数组件 -->
  <component :is="render()" />
</template>
```

---

## h() 函数详解

### 签名

```typescript
function h(
  type: string | Component,
  props?: object | null,
  children?: Children
): VNode

type Children = string | number | boolean | VNode | Children[]
```

### 参数说明

```typescript
import { h } from 'vue'

// 第一个参数：元素类型
h('div')                    // HTML 元素
h(MyComponent)              // 组件
h('svg')                    // SVG 元素

// 第二个参数：props
h('div', {
  id: 'app',
  class: 'container',
  style: { color: 'red' },
  onClick: () => {},
  'data-id': '123'
})

// 第三个参数：children
h('div', null, 'text')                    // 文本
h('div', null, 123)                       // 数字
h('div', null, [h('span'), h('span')])   // 子节点数组
h('div', null, [
  'text',
  h('span'),
  [h('div'), h('div')]                    // 嵌套数组会被拍平
])
```

### 省略 props

```typescript
// 如果不需要 props，可以省略
h('div', [
  h('span', 'Hello')
])

// 等价于
h('div', null, [
  h('span', null, 'Hello')
])
```

---

## VNode 类型

### 创建不同类型的 VNode

```typescript
import { h, Fragment, Text, Comment } from 'vue'

// 元素节点
h('div', 'content')

// 组件
h(MyComponent, { prop: 'value' })

// 文本节点
h(Text, 'text content')

// 注释节点
h(Comment, 'comment')

// Fragment（多个根节点）
h(Fragment, [
  h('div', 'first'),
  h('div', 'second')
])
```

### 条件渲染

```typescript
function render() {
  return h('div', [
    // if-else
    count.value > 10
      ? h('p', 'Greater than 10')
      : h('p', 'Less than or equal to 10'),
    
    // 条件显示
    count.value > 0 && h('span', 'Positive')
  ])
}
```

### 列表渲染

```typescript
function render() {
  return h('ul', 
    items.value.map(item =>
      h('li', { key: item.id }, item.text)
    )
  )
}
```

---

## Props 和事件

### 绑定 Props

```typescript
h('div', {
  // HTML attributes
  id: 'app',
  class: 'container',
  
  // DOM properties
  innerHTML: '<span>HTML</span>',
  
  // 样式
  style: {
    color: 'red',
    fontSize: '14px'
  },
  
  // class 绑定
  class: {
    active: true,
    disabled: false
  },
  
  // 或数组
  class: ['static', { dynamic: true }]
})
```

### 事件监听

```typescript
h('button', {
  // on + 事件名（驼峰）
  onClick: (event) => {
    console.log('clicked', event)
  },
  
  // 事件修饰符
  onClickCapture: () => {},  // capture
  onClickOnce: () => {},     // once
  onClickPassive: () => {},  // passive
  
  // 自定义事件（组件）
  onUpdateModelValue: (value) => {
    console.log('v-model updated:', value)
  }
})
```

---

## 插槽

### 使用插槽

```typescript
import { h } from 'vue'

// 默认插槽
h(MyComponent, null, {
  default: () => h('span', 'Default slot content')
})

// 具名插槽
h(MyComponent, null, {
  header: () => h('h1', 'Header'),
  default: () => h('p', 'Content'),
  footer: () => h('p', 'Footer')
})

// 作用域插槽
h(MyComponent, null, {
  default: (props) => h('span', `${props.text}`)
})
```

### 访问插槽

```typescript
import { h } from 'vue'

export default {
  setup(props, { slots }) {
    return () => h('div', [
      // 渲染默认插槽
      slots.default?.(),
      
      // 渲染具名插槽
      slots.header?.(),
      
      // 传递数据给作用域插槽
      slots.item?.({ text: 'Hello' })
    ])
  }
}
```

---

## 组件渲染函数

### 完整示例

```typescript
import { h, ref, computed } from 'vue'

export default {
  props: {
    level: {
      type: Number,
      required: true
    }
  },
  
  setup(props, { slots }) {
    return () => {
      const tag = `h${props.level}`
      
      return h(
        tag,
        { class: 'heading' },
        slots.default?.()
      )
    }
  }
}

// 使用
<template>
  <MyHeading :level="1">
    <span>Title</span>
  </MyHeading>
</template>

<!-- 渲染结果 -->
<h1 class="heading">
  <span>Title</span>
</h1>
```

### 动态组件

```typescript
export default {
  setup() {
    const type = ref('button')
    const tag = computed(() => type.value === 'link' ? 'a' : 'button')
    
    return () => h(
      tag.value,
      {
        class: 'btn',
        ...(tag.value === 'a' ? { href: '#' } : {})
      },
      'Click me'
    )
  }
}
```

---

## JSX 支持

### 安装配置

```bash
npm install @vitejs/plugin-vue-jsx -D
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
  ]
})
```

### JSX 基础语法

```tsx
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)
    
    return () => (
      <div class="container">
        <h1>Counter</h1>
        <p>Count: {count.value}</p>
        <button onClick={() => count.value++}>+1</button>
      </div>
    )
  }
})
```

### JSX Props

```tsx
// 静态 props
<MyComponent prop="value" />

// 动态 props
<MyComponent prop={dynamicValue} />

// 展开 props
<MyComponent {...props} />

// class 和 style
<div class="static" />
<div class={['static', { dynamic: true }]} />
<div style={{ color: 'red', fontSize: '14px' }} />
```

### JSX 事件

```tsx
// 事件监听
<button onClick={handleClick}>Click</button>

// 内联处理器
<button onClick={() => count.value++}>+1</button>

// 事件修饰符（需要手动处理）
<button
  onClick={(e) => {
    e.preventDefault()
    handleClick()
  }}
>
  Submit
</button>
```

### JSX 指令

```tsx
import { withDirectives, vShow } from 'vue'

// v-show
<div v-show={visible}>Content</div>

// v-model
<input v-model={text.value} />

// 自定义指令
{withDirectives(
  <div>Content</div>,
  [[vCustomDirective, value, arg, modifiers]]
)}
```

### JSX 插槽

```tsx
// 默认插槽
<MyComponent>
  <span>Slot content</span>
</MyComponent>

// 具名插槽
<MyComponent>
  {{
    header: () => <h1>Header</h1>,
    default: () => <p>Content</p>,
    footer: () => <p>Footer</p>
  }}
</MyComponent>

// 作用域插槽
<MyComponent>
  {{
    default: (props: any) => <span>{props.text}</span>
  }}
</MyComponent>
```

---

## 函数式组件

函数式组件是无状态的，只接收 props。

```typescript
import { h } from 'vue'

// 函数式组件
export default function MyComponent(props: any, { slots, emit, attrs }: any) {
  return h('div', { class: 'my-component' }, [
    h('h1', null, props.title),
    slots.default?.()
  ])
}

// 添加 props 定义
MyComponent.props = ['title']

// JSX 版本
export default function MyComponent(props: any) {
  return (
    <div class="my-component">
      <h1>{props.title}</h1>
    </div>
  )
}
```

---

## 渲染函数使用场景

### 1. 动态标签

```typescript
export default defineComponent({
  props: {
    level: {
      type: Number,
      required: true,
      validator: (val: number) => val >= 1 && val <= 6
    }
  },
  
  setup(props, { slots }) {
    return () => h(
      `h${props.level}`,
      {},
      slots.default?.()
    )
  }
})

// JSX
export default defineComponent({
  props: ['level'],
  setup(props, { slots }) {
    const Tag = `h${props.level}` as any
    return () => <Tag>{slots.default?.()}</Tag>
  }
})
```

### 2. 递归组件

```tsx
import { defineComponent } from 'vue'

interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

export default defineComponent({
  name: 'TreeNode',
  props: {
    node: Object as PropType<TreeNode>
  },
  
  setup(props) {
    return () => (
      <li>
        <span>{props.node?.label}</span>
        {props.node?.children && (
          <ul>
            {props.node.children.map(child => (
              <TreeNode key={child.id} node={child} />
            ))}
          </ul>
        )}
      </li>
    )
  }
})
```

### 3. 高阶组件

```tsx
import { defineComponent, h } from 'vue'

// HOC: 添加加载状态
export function withLoading(Component: any) {
  return defineComponent({
    props: {
      loading: Boolean
    },
    
    setup(props, { attrs, slots }) {
      return () => {
        if (props.loading) {
          return <div class="loading">Loading...</div>
        }
        
        return h(Component, attrs, slots)
      }
    }
  })
}

// 使用
const MyComponentWithLoading = withLoading(MyComponent)

<MyComponentWithLoading loading={isLoading} />
```

### 4. 条件复杂的渲染

```tsx
export default defineComponent({
  setup() {
    const type = ref('list')
    const data = ref([])
    
    return () => {
      if (type.value === 'list') {
        return (
          <ul>
            {data.value.map(item => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        )
      }
      
      if (type.value === 'grid') {
        return (
          <div class="grid">
            {data.value.map(item => (
              <div key={item.id} class="grid-item">
                {item.text}
              </div>
            ))}
          </div>
        )
      }
      
      return <div>Unknown type</div>
    }
  }
})
```

---

## 性能优化

### 避免不必要的重渲染

```typescript
import { h, shallowRef } from 'vue'

// ❌ 每次都创建新函数
export default {
  setup() {
    return () => h('div', {
      onClick: () => console.log('click')  // 每次渲染创建新函数
    })
  }
}

// ✅ 缓存函数
export default {
  setup() {
    const handleClick = () => console.log('click')
    
    return () => h('div', {
      onClick: handleClick  // 复用同一函数
    })
  }
}
```

### 使用 shallowRef

```typescript
import { h, shallowRef } from 'vue'

export default {
  setup() {
    // 大型 VNode 树使用 shallowRef
    const vnode = shallowRef(h('div'))
    
    return () => vnode.value
  }
}
```

---

## render vs template

### 何时使用 render

| 场景 | 推荐 |
|------|------|
| 简单静态内容 | template |
| 动态标签 | render/JSX |
| 复杂条件逻辑 | render/JSX |
| 递归组件 | template 或 JSX |
| 高阶组件 | render/JSX |
| 包装组件 | render/JSX |

### 性能对比

- **template**：编译优化更好（静态提升、补丁标记）
- **render**：更灵活，但缺少编译优化
- **JSX**：介于两者之间

---

## 最佳实践

1. **优先使用 template**：除非需要 JS 的完全能力
2. **JSX 优于 h()**：更易读和维护
3. **缓存事件处理器**：避免每次创建新函数
4. **使用 key**：列表渲染时必须提供 key
5. **类型安全**：使用 TypeScript 定义 props
6. **避免过度使用**：保持简单
7. **注释说明**：渲染函数不如模板直观
8. **测试覆盖**：渲染函数更需要测试

---

## 参考资料

- [渲染函数 & JSX](https://cn.vuejs.org/guide/extras/render-function.html)
- [h() API](https://cn.vuejs.org/api/render-function.html#h)
- [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)
