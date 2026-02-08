# 自定义元素与 Web Components

## 核心概念

Web Components 允许创建可复用的自定义 HTML 元素，实现真正的组件封装。

```javascript
// 定义自定义元素
class MyButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        button { background: blue; color: white; }
      </style>
      <button><slot></slot></button>
    `;
  }
}

customElements.define('my-button', MyButton);
```

```html
<!-- 使用 -->
<my-button>点击我</my-button>
```

## Shadow DOM

**作用**：样式和 DOM 隔离

```javascript
class MyCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    
    shadow.innerHTML = `
      <style>
        /* 样式不会泄漏到外部 */
        .card { border: 1px solid #ddd; padding: 16px; }
      </style>
      <div class="card">
        <slot name="header"></slot>
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('my-card', MyCard);
```

```html
<my-card>
  <h3 slot="header">卡片标题</h3>
  <p>卡片内容</p>
</my-card>
```

## HTML Templates

```html
<template id="card-template">
  <div class="card">
    <h3 class="title"></h3>
    <p class="content"></p>
  </div>
</template>

<script>
const template = document.getElementById('card-template');
const clone = template.content.cloneNode(true);
clone.querySelector('.title').textContent = '标题';
clone.querySelector('.content').textContent = '内容';
document.body.appendChild(clone);
</script>
```

**后端类比**：Web Components ≈ 微服务架构，每个组件独立封装。

## 参考资源

- [MDN - Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
