# 第 28 章：Web Components

## 概述

Web Components 是一套浏览器原生的组件化技术，包括 Custom Elements、Shadow DOM 和 HTML Templates。

## 一、Custom Elements

### 1.1 定义自定义元素

```javascript
class MyButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', () => {
      alert('Clicked!');
    });
  }
  
  connectedCallback() {
    this.innerHTML = `<button>自定义按钮</button>`;
  }
}

customElements.define('my-button', MyButton);
```

```html
<my-button></my-button>
```

### 1.2 生命周期

```javascript
class MyElement extends HTMLElement {
  connectedCallback() {
    // 元素插入到 DOM
  }
  
  disconnectedCallback() {
    // 元素从 DOM 移除
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    // 属性变化
  }
  
  static get observedAttributes() {
    return ['color', 'size'];
  }
}
```

## 二、Shadow DOM

### 2.1 创建 Shadow DOM

```javascript
class MyCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        .card { padding: 20px; border: 1px solid #ddd; }
      </style>
      <div class="card">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('my-card', MyCard);
```

```html
<my-card>
  <h2>标题</h2>
  <p>内容</p>
</my-card>
```

## 三、HTML Templates

```html
<template id="my-template">
  <style>
    .item { padding: 10px; }
  </style>
  <div class="item">
    <slot name="title"></slot>
    <slot name="content"></slot>
  </div>
</template>

<script>
class MyItem extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('my-template');
    const clone = template.content.cloneNode(true);
    this.attachShadow({mode: 'open'}).appendChild(clone);
  }
}

customElements.define('my-item', MyItem);
</script>

<my-item>
  <span slot="title">标题</span>
  <span slot="content">内容</span>
</my-item>
```

## 参考资料

- [MDN - Web Components](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)

---

**上一章** ← [第 27 章：响应式设计](./27-responsive-design.md)  
**下一章** → [第 29 章：HTML5 API](./29-html5-api.md)
