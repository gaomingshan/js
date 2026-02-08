# 第 22 节：模板编译

## 概述

Vue 的模板编译器将模板字符串转换为渲染函数。这个过程包括解析（parse）、转换（transform）、代码生成（generate）三个阶段。

## 一、编译流程

```
┌─────────────────────────────────────────────────────────────┐
│                   模板编译流程                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   模板字符串                                                 │
│   "<div>{{ msg }}</div>"                                    │
│           │                                                 │
│           │ parse（解析）                                   │
│           ↓                                                 │
│   AST（抽象语法树）                                          │
│   { type: 1, tag: 'div', children: [...] }                 │
│           │                                                 │
│           │ transform（转换）                               │
│           ↓                                                 │
│   优化后的 AST                                               │
│   添加 codegenNode、patchFlag 等信息                        │
│           │                                                 │
│           │ generate（生成）                                │
│           ↓                                                 │
│   渲染函数代码                                               │
│   "function render(_ctx) { return h('div', ...) }"        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 二、解析阶段（Parse）

### 2.1 词法分析

```javascript
// 模板字符串 → Tokens
const template = '<div class="app">{{ msg }}</div>'

// 识别的 Token：
// 1. 开始标签: <div
// 2. 属性: class="app"
// 3. 标签结束: >
// 4. 插值: {{ msg }}
// 5. 结束标签: </div>
```

### 2.2 语法分析

```javascript
// Tokens → AST
const ast = {
  type: 0,  // ROOT
  children: [{
    type: 1,  // ELEMENT
    tag: 'div',
    props: [{
      type: 6,  // ATTRIBUTE
      name: 'class',
      value: { content: 'app' }
    }],
    children: [{
      type: 5,  // INTERPOLATION
      content: {
        type: 4,  // SIMPLE_EXPRESSION
        content: 'msg'
      }
    }]
  }]
}
```

### 2.3 AST 节点类型

```javascript
// Vue 3 AST 节点类型
const NodeTypes = {
  ROOT: 0,
  ELEMENT: 1,
  TEXT: 2,
  COMMENT: 3,
  SIMPLE_EXPRESSION: 4,
  INTERPOLATION: 5,
  ATTRIBUTE: 6,
  DIRECTIVE: 7,
  // ...
}
```

## 三、转换阶段（Transform）

### 3.1 转换目的

```javascript
// 转换阶段的任务：
// 1. 分析节点，添加代码生成所需信息
// 2. 静态分析，标记静态节点
// 3. 优化标记，添加 patchFlag
// 4. 生成 codegenNode
```

### 3.2 转换插件

```javascript
// Vue 使用插件化的转换流程
const transforms = [
  transformElement,      // 处理元素
  transformText,         // 处理文本
  transformIf,          // 处理 v-if
  transformFor,         // 处理 v-for
  transformModel,       // 处理 v-model
  transformOn,          // 处理 v-on
  // ...
]

function transform(ast, options) {
  const context = createTransformContext(ast, options)
  traverseNode(ast, context)
  // 最终 AST 被增强
}
```

### 3.3 静态提升

```javascript
// 模板
<template>
  <div>
    <p>静态文本</p>
    <p>{{ dynamic }}</p>
  </div>
</template>

// 转换后标记
// 静态节点被标记为 hoisted
{
  type: 1,
  tag: 'p',
  children: [{ type: 2, content: '静态文本' }],
  codegenNode: {
    hoisted: true  // 标记为可提升
  }
}
```

### 3.4 PatchFlag 标记

```javascript
// 标记动态内容类型
const PatchFlags = {
  TEXT: 1,           // 动态文本
  CLASS: 2,          // 动态 class
  STYLE: 4,          // 动态 style
  PROPS: 8,          // 动态 props
  FULL_PROPS: 16,    // 需要完整对比
  HYDRATE_EVENTS: 32,
  STABLE_FRAGMENT: 64,
  KEYED_FRAGMENT: 128,
  UNKEYED_FRAGMENT: 256,
  NEED_PATCH: 512,
  DYNAMIC_SLOTS: 1024,
  HOISTED: -1,       // 静态提升
  BAIL: -2           // 退出优化
}

// 示例
<p :class="cls">{{ text }}</p>
// patchFlag = CLASS | TEXT = 2 | 1 = 3
```

## 四、代码生成（Generate）

### 4.1 生成渲染函数

```javascript
// AST → 渲染函数代码字符串

// 模板
<div class="app">
  <p>{{ msg }}</p>
</div>

// 生成的代码
const _Vue = Vue
const { createVNode: _createVNode } = _Vue

const _hoisted_1 = { class: "app" }

return function render(_ctx, _cache) {
  return (_createVNode("div", _hoisted_1, [
    _createVNode("p", null, _toDisplayString(_ctx.msg), 1 /* TEXT */)
  ]))
}
```

### 4.2 静态提升代码

```javascript
// 静态节点被提升到渲染函数外
const _hoisted_1 = _createVNode("p", null, "静态文本", -1 /* HOISTED */)
const _hoisted_2 = { class: "container" }

function render(_ctx) {
  return _createVNode("div", _hoisted_2, [
    _hoisted_1,  // 复用静态节点
    _createVNode("p", null, _toDisplayString(_ctx.dynamic), 1)
  ])
}
```

### 4.3 Block Tree

```javascript
// 使用 Block 收集动态节点
import { openBlock, createBlock, createVNode } from 'vue'

function render(_ctx) {
  return (openBlock(), createBlock("div", null, [
    _createVNode("p", null, "静态"),
    _createVNode("p", null, _ctx.msg, 1 /* TEXT */)
  ]))
}

// Block 的 dynamicChildren 只包含动态节点
// 更新时直接遍历 dynamicChildren，跳过静态节点
```

## 五、指令编译

### 5.1 v-if 编译

```vue
<!-- 模板 -->
<p v-if="show">Hello</p>
<p v-else>World</p>

<!-- 编译后 -->
function render(_ctx) {
  return _ctx.show
    ? _createVNode("p", null, "Hello")
    : _createVNode("p", null, "World")
}
```

### 5.2 v-for 编译

```vue
<!-- 模板 -->
<li v-for="item in items" :key="item.id">{{ item.name }}</li>

<!-- 编译后 -->
function render(_ctx) {
  return (_openBlock(true), _createBlock(_Fragment, null,
    _renderList(_ctx.items, (item) => {
      return (_openBlock(), _createBlock("li", { key: item.id },
        _toDisplayString(item.name), 1))
    }), 128 /* KEYED_FRAGMENT */
  ))
}
```

### 5.3 v-model 编译

```vue
<!-- 模板 -->
<input v-model="text" />

<!-- 编译后 -->
function render(_ctx) {
  return _createVNode("input", {
    modelValue: _ctx.text,
    "onUpdate:modelValue": $event => (_ctx.text = $event)
  }, null, 8 /* PROPS */, ["modelValue", "onUpdate:modelValue"])
}
```

### 5.4 v-on 编译

```vue
<!-- 模板 -->
<button @click="handleClick">点击</button>
<button @click="count++">+1</button>

<!-- 编译后 -->
function render(_ctx) {
  return [
    _createVNode("button", { onClick: _ctx.handleClick }, "点击"),
    _createVNode("button", {
      onClick: $event => (_ctx.count++)
    }, "+1")
  ]
}
```

## 六、编译时 vs 运行时

### 6.1 编译时机

```javascript
// 方式 1：构建时编译（推荐）
// .vue 文件由 vite/webpack 插件编译
// 生产包不包含编译器

// 方式 2：运行时编译
// 需要完整版 Vue
import { createApp } from 'vue/dist/vue.esm-bundler.js'

createApp({
  template: '<div>{{ msg }}</div>',  // 运行时编译
  data: () => ({ msg: 'Hello' })
})
```

### 6.2 包大小对比

```
vue.runtime.esm-bundler.js  ~30KB (不含编译器)
vue.esm-bundler.js          ~45KB (含编译器)
```

## 七、编译优化总结

| 优化 | 说明 | 效果 |
|------|------|------|
| 静态提升 | 静态节点只创建一次 | 减少创建开销 |
| PatchFlags | 标记动态类型 | 跳过不必要对比 |
| Block Tree | 收集动态节点 | 扁平化遍历 |
| 缓存事件处理 | 缓存内联事件 | 避免重复创建 |

## 八、查看编译结果

### 8.1 Vue SFC Playground

访问 [Vue SFC Playground](https://play.vuejs.org/) 可以实时查看模板编译结果。

### 8.2 @vue/compiler-sfc

```javascript
import { compile } from '@vue/compiler-sfc'

const { code } = compile(`
  <template>
    <div>{{ msg }}</div>
  </template>
`)

console.log(code)
```

## 九、总结

| 阶段 | 输入 | 输出 |
|------|------|------|
| Parse | 模板字符串 | AST |
| Transform | AST | 增强的 AST |
| Generate | 增强的 AST | 渲染函数代码 |

## 参考资料

- [Vue 编译器源码](https://github.com/vuejs/core/tree/main/packages/compiler-core)
- [Vue SFC Playground](https://play.vuejs.org/)

---

**下一节** → [第 23 节：生命周期执行](./23-lifecycle-execution.md)
