# 第 28 章：Web Components - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 定义
### 题目
Web Components 包含哪些技术？**（多选）**

**A.** Custom Elements | **B.** Shadow DOM | **C.** HTML Templates | **D.** React

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C
**来源：** Web Components 规范
</details>

---

## 第 2 题 🟢 | Custom Elements
### 题目
如何定义自定义元素？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
class MyElement extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.innerHTML = '<p>Hello World</p>';
  }
}

customElements.define('my-element', MyElement);
```
```html
<my-element></my-element>
```
**来源：** Custom Elements
</details>

---

## 第 3 题 🟢 | Shadow DOM
### 题目
Shadow DOM 的作用？

<details><summary>查看答案</summary>
### ✅ 答案
封装样式和结构，避免冲突
```javascript
class MyElement extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>p { color: red; }</style>
      <p>Shadow DOM</p>
    `;
  }
}
```
**来源：** Shadow DOM
</details>

---

## 第 4 题 🟡 | template 标签
### 题目
`<template>` 的用法？

<details><summary>查看答案</summary>
### ✅ 答案
```html
<template id="my-template">
  <style>
    p { color: blue; }
  </style>
  <p>Template Content</p>
</template>

<script>
const template = document.getElementById('my-template');
const clone = template.content.cloneNode(true);
document.body.appendChild(clone);
</script>
```
**来源：** HTML Templates
</details>

---

## 第 5 题 🟡 | slot
### 题目
`<slot>` 的作用？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
class MyCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <div class="card">
        <slot name="title"></slot>
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('my-card', MyCard);
```
```html
<my-card>
  <h2 slot="title">标题</h2>
  <p>内容</p>
</my-card>
```
**来源：** Slots
</details>

---

## 第 6 题 🟡 | 生命周期
### 题目
Custom Elements 的生命周期？**（多选）**

**A.** connectedCallback | **B.** disconnectedCallback | **C.** attributeChangedCallback | **D.** adoptedCallback

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D
```javascript
class MyElement extends HTMLElement {
  static get observedAttributes() {
    return ['color'];
  }
  
  connectedCallback() {
    console.log('元素插入DOM');
  }
  
  disconnectedCallback() {
    console.log('元素移除DOM');
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`属性${name}从${oldValue}变为${newValue}`);
  }
  
  adoptedCallback() {
    console.log('元素移动到新文档');
  }
}
```
**来源：** Custom Elements Lifecycle
</details>

---

## 第 7 题 🟡 | 属性与特性
### 题目
如何同步属性和特性？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
class MyButton extends HTMLElement {
  static get observedAttributes() {
    return ['disabled'];
  }
  
  get disabled() {
    return this.hasAttribute('disabled');
  }
  
  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'disabled') {
      this.updateDisabled();
    }
  }
  
  updateDisabled() {
    this.shadowRoot.querySelector('button').disabled = this.disabled;
  }
}
```
**来源：** Attributes and Properties
</details>

---

## 第 8 题 🔴 | 完整组件
### 题目
创建一个完整的自定义组件。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
class CounterButton extends HTMLElement {
  static get observedAttributes() {
    return ['count'];
  }
  
  constructor() {
    super();
    
    const shadow = this.attachShadow({mode: 'open'});
    
    shadow.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        button {
          padding: 10px 20px;
          font-size: 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background: #2563eb;
        }
        .count {
          margin-left: 10px;
          font-weight: bold;
        }
      </style>
      <button>
        <slot>点击</slot>
        <span class="count">0</span>
      </button>
    `;
    
    this._count = 0;
    
    shadow.querySelector('button').addEventListener('click', () => {
      this.count++;
      this.dispatchEvent(new CustomEvent('countchange', {
        detail: { count: this.count }
      }));
    });
  }
  
  get count() {
    return this._count;
  }
  
  set count(val) {
    this._count = val;
    this.setAttribute('count', val);
    this.shadowRoot.querySelector('.count').textContent = val;
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'count') {
      this._count = parseInt(newValue) || 0;
      this.shadowRoot.querySelector('.count').textContent = this._count;
    }
  }
}

customElements.define('counter-button', CounterButton);
```

```html
<counter-button count="5">
  增加计数
</counter-button>

<script>
const counter = document.querySelector('counter-button');
counter.addEventListener('countchange', (e) => {
  console.log('新计数：', e.detail.count);
});
</script>
```
**来源：** Web Components 实践
</details>

---

## 第 9 题 🔴 | 样式穿透
### 题目
如何让外部样式影响 Shadow DOM？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
class StyledCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    
    shadow.innerHTML = `
      <style>
        /* CSS 变量可以穿透 */
        .card {
          background: var(--card-bg, white);
          color: var(--card-color, black);
          padding: var(--card-padding, 20px);
        }
        
        /* ::part 允许外部样式化 */
        .title {
          font-size: 1.5rem;
        }
        
        /* ::slotted 样式化插槽内容 */
        ::slotted(p) {
          margin: 0;
        }
      </style>
      <div class="card" part="card">
        <h2 class="title" part="title">
          <slot name="title"></slot>
        </h2>
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('styled-card', StyledCard);
```

```html
<style>
/* CSS 变量 */
styled-card {
  --card-bg: #f0f0f0;
  --card-color: #333;
  --card-padding: 30px;
}

/* ::part 选择器 */
styled-card::part(title) {
  color: #3b82f6;
}
</style>

<styled-card>
  <span slot="title">卡片标题</span>
  <p>卡片内容</p>
</styled-card>
```
**来源：** Shadow DOM Styling
</details>

---

## 第 10 题 🔴 | 最佳实践
### 题目
Web Components 的最佳实践？

<details><summary>查看答案</summary>
### ✅ 答案

**1. 命名规范**
```javascript
// ✅ 必须包含连字符
customElements.define('my-button', MyButton);

// ❌ 不能是单个单词
// customElements.define('button', MyButton);
```

**2. 封装性**
```javascript
class MyComponent extends HTMLElement {
  constructor() {
    super();
    // ✅ 使用 Shadow DOM 封装
    this.attachShadow({mode: 'open'});
  }
}
```

**3. 可访问性**
```javascript
class AccessibleButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    
    shadow.innerHTML = `
      <button 
        role="button"
        aria-label="${this.getAttribute('label') || 'Button'}">
        <slot></slot>
      </button>
    `;
  }
}
```

**4. 性能**
```javascript
// ✅ 延迟渲染
class LazyComponent extends HTMLElement {
  connectedCallback() {
    // 使用 IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.render();
        observer.disconnect();
      }
    });
    observer.observe(this);
  }
}
```

**5. 兼容性**
```javascript
// 检测支持
if ('customElements' in window) {
  customElements.define('my-element', MyElement);
} else {
  // Polyfill
  import('@webcomponents/webcomponentsjs');
}
```

**来源：** Web Components 最佳实践
</details>

---

**📌 本章总结**
- Web Components = Custom Elements + Shadow DOM + Templates
- Custom Elements：定义自定义元素
- Shadow DOM：样式和结构封装
- template/slot：内容复用和分发
- 生命周期：connected, disconnected, attributeChanged
- 样式穿透：CSS变量、::part
- 最佳实践：命名、封装、可访问性

**上一章** ← [第 27 章：响应式设计](./chapter-27.md)  
**下一章** → [第 29 章：HTML5 API](./chapter-29.md)
