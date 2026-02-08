# DOM 树的构建与特性

## 核心概念

**DOM**（Document Object Model）是 HTML 在内存中的对象表示，是浏览器提供的编程接口。

```
HTML 文档 → 解析 → DOM 树（内存对象）

<html>
  <body>
    <h1>Hello</h1>
  </body>
</html>

→

Document
└── html (HTMLHtmlElement)
    └── body (HTMLBodyElement)
        └── h1 (HTMLHeadingElement)
            └── "Hello" (Text)
```

**后端类比**：
- DOM ≈ ORM 模型（数据库表 → 对象）
- DOM 操作 ≈ 对象属性修改

## DOM ≈ 内存对象模型

### DOM 节点类型

```javascript
// 元素节点（Element）
const div = document.createElement('div');
console.log(div.nodeType);  // 1

// 文本节点（Text）
const text = document.createTextNode('Hello');
console.log(text.nodeType);  // 3

// 注释节点（Comment）
const comment = document.createComment('注释');
console.log(comment.nodeType);  // 8

// 文档节点（Document）
console.log(document.nodeType);  // 9
```

### DOM 树形结构

```javascript
// 访问父节点
element.parentNode
element.parentElement

// 访问子节点
element.childNodes      // 所有子节点（包括文本）
element.children        // 所有子元素（不包括文本）
element.firstChild
element.lastChild
element.firstElementChild
element.lastElementChild

// 访问兄弟节点
element.nextSibling
element.previousSibling
element.nextElementSibling
element.previousElementSibling
```

**后端类比**：类似于树形数据结构的遍历。

## DOM API 与 HTML 的映射关系

### 属性映射

```html
<div id="box" class="container" data-user="123"></div>
```

```javascript
const div = document.querySelector('#box');

// HTML 属性 → DOM 属性
div.id;             // "box"
div.className;      // "container"
div.dataset.user;   // "123"

// 修改 DOM 属性 → 更新 HTML
div.id = 'newBox';  // <div id="newBox">
```

### 方法映射

```javascript
// 查询
document.getElementById('box')
document.querySelector('.container')
document.querySelectorAll('div')

// 创建
document.createElement('div')
document.createTextNode('text')

// 修改
element.setAttribute('class', 'active')
element.classList.add('show')
element.innerHTML = '<p>content</p>'

// 删除
element.remove()
parent.removeChild(child)
```

**后端类比**：类似于 ORM 的 CRUD 操作。

## DOM 的性能边界

### 为什么频繁操作很慢

```javascript
// ❌ 慢：每次都触发重排
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  document.body.appendChild(div);  // 1000 次重排
}

// ✅ 快：批量操作
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  fragment.appendChild(div);
}
document.body.appendChild(fragment);  // 1 次重排
```

**性能瓶颈**：
1. DOM 操作触发重排（Reflow）
2. 跨越 JS 引擎和渲染引擎边界
3. 内存分配和垃圾回收

**后端类比**：类似于数据库批量操作 vs 逐条插入。

### 优化策略

```javascript
// 1. 缓存 DOM 查询
const box = document.getElementById('box');
for (let i = 0; i < 100; i++) {
  box.style.left = i + 'px';  // 使用缓存
}

// 2. 批量修改样式
element.style.cssText = 'width: 100px; height: 100px; background: red;';

// 3. 离线操作
const clone = element.cloneNode(true);
// 修改 clone
element.parentNode.replaceChild(clone, element);

// 4. 使用 CSS class
element.classList.add('active');  // 而非多次修改 style
```

## 参考资源

- [MDN - DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
- [HTML Living Standard - DOM](https://dom.spec.whatwg.org/)
