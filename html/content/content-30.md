# 组件化开发中的 HTML

## 核心概念

组件化将 HTML、CSS、JavaScript 封装为可复用单元。

## HTML 结构设计原则

```html
<!-- 单一职责 -->
<article class="card">
  <header class="card-header">
    <h3 class="card-title">标题</h3>
  </header>
  <div class="card-body">
    <p class="card-text">内容</p>
  </div>
  <footer class="card-footer">
    <button class="card-action">操作</button>
  </footer>
</article>
```

## Slot 与内容分发

### React Children

```jsx
function Card({ children, title }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

<Card title="标题">
  <p>内容</p>
</Card>
```

### Vue Slot

```vue
<template>
  <div class="card">
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
</template>

<Card>
  <template #header><h3>标题</h3></template>
  <p>内容</p>
  <template #footer><button>操作</button></template>
</Card>
```

### Web Components Slot

```html
<template id="card-template">
  <div class="card">
    <slot name="header"></slot>
    <slot></slot>
  </div>
</template>

<my-card>
  <h3 slot="header">标题</h3>
  <p>内容</p>
</my-card>
```

## HTML 在组件库中的抽象层次

```
低层次：原生 HTML
<button type="button">点击</button>

中层次：基础组件
<Button variant="primary">点击</Button>

高层次：业务组件
<SubmitButton loading={isLoading} />
```

**后端类比**：组件化 ≈ 面向对象编程的类层次结构。

## 参考资源

- [React - Composition](https://react.dev/learn/thinking-in-react)
- [Vue - Slots](https://vuejs.org/guide/components/slots.html)
