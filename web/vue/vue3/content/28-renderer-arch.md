# 第 28 节：渲染器架构

## 概述

Vue 3 的渲染器采用平台无关设计，通过配置不同的平台 API，可以渲染到浏览器 DOM、服务端字符串、Canvas 等任意平台。

## 一、渲染器设计

### 1.1 平台无关架构

```
┌─────────────────────────────────────────────────────────────┐
│                   渲染器架构                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   @vue/runtime-core（平台无关）                              │
│   ├── createRenderer(options)                               │
│   ├── VNode 创建与处理                                      │
│   ├── 组件生命周期                                          │
│   └── Diff 算法                                             │
│                    ↓                                        │
│   平台特定实现                                               │
│   ├── @vue/runtime-dom (浏览器)                             │
│   ├── @vue/server-renderer (SSR)                           │
│   └── 自定义渲染器 (Canvas/WebGL/Native)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 createRenderer

```javascript
import { createRenderer } from '@vue/runtime-core'

// 创建自定义渲染器
const renderer = createRenderer({
  // 平台特定的 DOM 操作
  createElement(type) { },
  setElementText(el, text) { },
  insert(el, parent, anchor) { },
  remove(el) { },
  patchProp(el, key, prevValue, nextValue) { },
  // ...
})
```

## 二、渲染器选项

### 2.1 节点操作

```javascript
const nodeOps = {
  // 创建元素
  createElement(type) {
    return document.createElement(type)
  },
  
  // 创建文本节点
  createText(text) {
    return document.createTextNode(text)
  },
  
  // 创建注释节点
  createComment(text) {
    return document.createComment(text)
  },
  
  // 设置文本内容
  setText(node, text) {
    node.nodeValue = text
  },
  
  // 设置元素文本
  setElementText(el, text) {
    el.textContent = text
  },
  
  // 获取父节点
  parentNode(node) {
    return node.parentNode
  },
  
  // 获取下一个兄弟节点
  nextSibling(node) {
    return node.nextSibling
  },
  
  // 插入节点
  insert(child, parent, anchor = null) {
    parent.insertBefore(child, anchor)
  },
  
  // 移除节点
  remove(child) {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  }
}
```

### 2.2 属性处理

```javascript
const patchProp = (el, key, prevValue, nextValue) => {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, prevValue, nextValue)
  } else if (isOn(key)) {
    patchEvent(el, key, prevValue, nextValue)
  } else if (shouldSetAsProp(el, key)) {
    patchDOMProp(el, key, nextValue)
  } else {
    patchAttr(el, key, nextValue)
  }
}

function patchClass(el, value) {
  if (value == null) {
    el.removeAttribute('class')
  } else {
    el.className = value
  }
}

function patchStyle(el, prev, next) {
  const style = el.style
  
  // 添加新样式
  for (const key in next) {
    style[key] = next[key]
  }
  
  // 移除旧样式
  if (prev) {
    for (const key in prev) {
      if (next[key] == null) {
        style[key] = ''
      }
    }
  }
}

function patchEvent(el, key, prevValue, nextValue) {
  const name = key.slice(2).toLowerCase()
  
  if (prevValue) {
    el.removeEventListener(name, prevValue)
  }
  if (nextValue) {
    el.addEventListener(name, nextValue)
  }
}
```

## 三、DOM 渲染器

### 3.1 runtime-dom 实现

```javascript
// @vue/runtime-dom
import { createRenderer } from '@vue/runtime-core'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

// 创建 DOM 渲染器
const renderer = createRenderer({
  ...nodeOps,
  patchProp
})

// 导出 createApp
export function createApp(rootComponent) {
  const app = renderer.createApp(rootComponent)
  
  const { mount } = app
  app.mount = (containerOrSelector) => {
    const container = typeof containerOrSelector === 'string'
      ? document.querySelector(containerOrSelector)
      : containerOrSelector
    
    // 清空容器
    container.innerHTML = ''
    
    // 挂载
    mount(container)
  }
  
  return app
}
```

## 四、自定义渲染器示例

### 4.1 Canvas 渲染器

```javascript
import { createRenderer } from '@vue/runtime-core'

const renderer = createRenderer({
  createElement(type) {
    // 返回一个虚拟的 Canvas 元素对象
    return {
      type,
      props: {},
      children: [],
      bindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindbindBindbindbindbindBindBindbindBindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bind    }
  },
  
  setElementText(el, text) {
    el.text = text
  },
  
  insert(el, parent) {
    parent.children.push(el)
    // 触发重绘
    if (parent.bindbindbindbindBindbindbindBindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bind bindBindbind bindcanvas bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bind bind bindBindbind bindBindbind bind bind bindBindbind bindBindbind bind) {
bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bind      bindBindbind bindBindbind bindredraw(parentbindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bind.bindBindbind bindBindbind bindBindbind bindcanvasbindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bind,bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bindBindbind bind parentbindBindbind bindBindbind bindBindbind bind)
bindBindbind bindBindbind bindBindbind bind    }
bindBindbind bindBindbind bindBindbind bind  },bindBindbind bindBindbind bindBindbind bind
  
  patchProp(el, key, prev, next) {
    el.props[key] = next
  }
})

// 绘制函数
function redraw(canvas, root) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  function draw(node, x = 0, y = 0) {
    if (node.type === 'rect') {
      ctx.fillStyle = node.props.color || 'black'
      ctx.fillRect(x, y, node.props.width, node.props.height)
    }
    // ... 其他图形
  }
  
  draw(root)
}
```

### 4.2 使用自定义渲染器

```javascript
const { createApp } = renderer

const App = {
  setup() {
    const width = ref(100)
    
    return () => h('rect', {
      x: 10,
      y: 10,
      width: width.value,
      height: 50,
      color: 'blue'
    })
  }
}

createApp(App).mount(canvasElement)
```

## 五、渲染器核心流程

### 5.1 render 函数

```javascript
function baseCreateRenderer(options) {
  const {
    createElement,
    setElementText,
    insert,
    remove,
    patchProp
  } = options
  
  function render(vnode, container) {
    if (vnode == null) {
      // 卸载
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      // 挂载或更新
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }
  
  function patch(n1, n2, container, anchor) {
    // 类型不同，卸载旧节点
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }
    
    const { type, shapeFlag } = n2
    
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      case Fragment:
        processFragment(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container, anchor)
        }
    }
  }
  
  // ... 其他函数
  
  return { render, createApp: createAppAPI(render) }
}
```

### 5.2 ShapeFlags

```javascript
const ShapeFlags = {
  ELEMENT: 1,                    // 普通元素
  FUNCTIONAL_COMPONENT: 2,       // 函数组件
  STATEFUL_COMPONENT: 4,         // 有状态组件
  TEXT_CHILDREN: 8,              // 子节点是文本
  ARRAY_CHILDREN: 16,            // 子节点是数组
  SLOTS_CHILDREN: 32,            // 子节点是插槽
  TELEPORT: 64,
  SUSPENSE: 128,
  COMPONENT_SHOULD_KEEP_ALIVE: 256,
  COMPONENT_KEPT_ALIVE: 512,
  COMPONENT: 6  // STATEFUL | FUNCTIONAL
}

// 使用位运算判断
if (shapeFlag & ShapeFlags.ELEMENT) {
  // 是元素
}
if (shapeFlag & ShapeFlags.COMPONENT) {
  // 是组件
}
```

## 六、服务端渲染

### 6.1 SSR 渲染器

```javascript
// @vue/server-renderer
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'

const app = createSSRApp(App)
const html = await renderToString(app)
```

### 6.2 Hydration

```javascript
// 客户端激活
import { createSSRApp } from 'vue'

const app = createSSRApp(App)
// 激活服务端渲染的 HTML
app.mount('#app')

// hydration 过程：
// 1. 复用服务端渲染的 DOM
// 2. 添加事件监听
// 3. 建立响应式连接
```

## 七、总结

| 概念 | 说明 |
|------|------|
| createRenderer | 创建平台特定渲染器 |
| nodeOps | 节点操作 API |
| patchProp | 属性更新 API |
| ShapeFlags | 节点类型标记 |
| SSR | 服务端渲染 |
| Hydration | 客户端激活 |

## 参考资料

- [Vue 3 runtime-core 源码](https://github.com/vuejs/core/tree/main/packages/runtime-core)
- [自定义渲染器](https://vuejs.org/api/custom-renderer.html)

---

**下一节** → [第 29 节：Diff 算法实现](./29-diff-impl.md)
