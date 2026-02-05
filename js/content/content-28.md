# DOM 操作详解

> 掌握文档对象模型的高效操作

---

## 概述

DOM（Document Object Model）是 HTML 和 XML 文档的编程接口。理解 DOM 操作是前端开发的核心技能。

本章将深入：
- DOM 节点类型
- 节点查询与遍历
- 节点创建与操作
- 事件处理
- 性能优化

---

## 1. DOM 节点类型

```javascript
// 元素节点
const div = document.createElement('div');
console.log(div.nodeType);  // 1 (ELEMENT_NODE)

// 文本节点
const text = document.createTextNode('Hello');
console.log(text.nodeType);  // 3 (TEXT_NODE)

// 注释节点
const comment = document.createComment('注释');
console.log(comment.nodeType);  // 8 (COMMENT_NODE)

// 文档节点
console.log(document.nodeType);  // 9 (DOCUMENT_NODE)

// 文档片段
const fragment = document.createDocumentFragment();
console.log(fragment.nodeType);  // 11 (DOCUMENT_FRAGMENT_NODE)
```

---

## 2. 节点查询

### 2.1 基本查询

```javascript
// ID 查询（最快）
const element = document.getElementById('myId');

// 类名查询（返回 HTMLCollection，实时更新）
const elements = document.getElementsByClassName('myClass');

// 标签名查询
const divs = document.getElementsByTagName('div');

// CSS 选择器（推荐）
const element = document.querySelector('.class');
const elements = document.querySelectorAll('.class');
```

### 2.2 节点关系

```javascript
const element = document.getElementById('myElement');

// 父节点
element.parentNode;
element.parentElement;

// 子节点
element.childNodes;  // 包含文本节点
element.children;    // 只包含元素节点

element.firstChild;  // 第一个子节点（可能是文本）
element.firstElementChild;  // 第一个元素子节点

element.lastChild;
element.lastElementChild;

// 兄弟节点
element.previousSibling;  // 前一个节点
element.previousElementSibling;  // 前一个元素

element.nextSibling;
element.nextElementSibling;
```

### 2.3 节点遍历

```javascript
// 遍历所有子元素
function traverseElements(element, callback) {
  callback(element);
  
  for (const child of element.children) {
    traverseElements(child, callback);
  }
}

// 使用
traverseElements(document.body, (el) => {
  console.log(el.tagName);
});

// TreeWalker（高级遍历）
const walker = document.createTreeWalker(
  document.body,
  NodeFilter.SHOW_ELEMENT,
  {
    acceptNode(node) {
      return node.classList.contains('target')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    }
  }
);

let node;
while (node = walker.nextNode()) {
  console.log(node);
}
```

---

## 3. 节点创建与操作

### 3.1 创建节点

```javascript
// 创建元素
const div = document.createElement('div');
div.className = 'container';
div.id = 'myDiv';

// 创建文本节点
const text = document.createTextNode('Hello World');

// 克隆节点
const clone = div.cloneNode(true);  // true: 深克隆
```

### 3.2 插入节点

```javascript
const parent = document.getElementById('parent');
const child = document.createElement('div');

// appendChild（末尾插入）
parent.appendChild(child);

// insertBefore（指定位置插入）
const reference = parent.children[0];
parent.insertBefore(child, reference);

// 现代方法
parent.append(child);  // 可插入多个节点或文本
parent.prepend(child);  // 插入到开头

// 相邻位置插入
element.insertAdjacentElement('beforebegin', newElement);
element.insertAdjacentElement('afterbegin', newElement);
element.insertAdjacentElement('beforeend', newElement);
element.insertAdjacentElement('afterend', newElement);
```

### 3.3 删除节点

```javascript
// 传统方法
const parent = element.parentNode;
parent.removeChild(element);

// 现代方法
element.remove();

// 清空所有子节点
element.innerHTML = '';  // 简单但可能有内存泄漏
element.textContent = '';

// 推荐：逐个删除
while (element.firstChild) {
  element.removeChild(element.firstChild);
}
```

### 3.4 替换节点

```javascript
// 传统方法
parent.replaceChild(newNode, oldNode);

// 现代方法
oldNode.replaceWith(newNode);
```

---

## 4. 属性操作

### 4.1 标准属性

```javascript
const input = document.querySelector('input');

// 读取
console.log(input.type);
console.log(input.value);

// 设置
input.type = 'text';
input.value = 'Hello';

// 布尔属性
input.disabled = true;
input.required = false;
```

### 4.2 自定义属性

```javascript
const div = document.querySelector('div');

// getAttribute/setAttribute
div.setAttribute('data-id', '123');
console.log(div.getAttribute('data-id'));

// dataset（推荐用于 data-* 属性）
div.dataset.id = '123';
div.dataset.userName = 'Alice';  // data-user-name
console.log(div.dataset.id);

// 删除属性
div.removeAttribute('data-id');
delete div.dataset.id;
```

### 4.3 类名操作

```javascript
const element = document.querySelector('.box');

// classList（推荐）
element.classList.add('active');
element.classList.remove('hidden');
element.classList.toggle('visible');
element.classList.contains('active');  // true/false

// 替换类名
element.classList.replace('old', 'new');

// className（字符串操作）
element.className = 'box active';
element.className += ' new-class';
```

### 4.4 样式操作

```javascript
const element = document.querySelector('.box');

// 内联样式
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.style.fontSize = '16px';

// 批量设置
element.style.cssText = 'color: red; background: blue;';

// 获取计算样式
const styles = window.getComputedStyle(element);
console.log(styles.color);
console.log(styles.width);
```

---

## 5. 内容操作

```javascript
const div = document.querySelector('div');

// textContent（纯文本，推荐）
div.textContent = 'Hello World';
console.log(div.textContent);

// innerHTML（HTML 内容，注意 XSS）
div.innerHTML = '<p>Hello</p>';

// innerText（考虑样式，较慢）
div.innerText = 'Visible Text';

// 安全插入 HTML
function safeHTML(html) {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

div.innerHTML = safeHTML(userInput);
```

---

## 6. 事件处理

### 6.1 添加事件监听

```javascript
const button = document.querySelector('button');

// addEventListener（推荐）
button.addEventListener('click', function(event) {
  console.log('点击', event.target);
});

// 箭头函数（注意 this）
button.addEventListener('click', (event) => {
  console.log(event.target);
});

// 选项
button.addEventListener('click', handler, {
  once: true,      // 只触发一次
  capture: true,   // 捕获阶段
  passive: true    // 不调用 preventDefault
});
```

### 6.2 事件委托

```javascript
// 利用事件冒泡，在父元素监听子元素事件
const list = document.getElementById('list');

list.addEventListener('click', (event) => {
  if (event.target.matches('li')) {
    console.log('点击了:', event.target.textContent);
  }
});

// 优点：
// 1. 只需一个监听器
// 2. 动态添加的元素也能响应
// 3. 内存占用少
```

### 6.3 自定义事件

```javascript
// 创建自定义事件
const event = new CustomEvent('myEvent', {
  detail: { message: 'Hello' },
  bubbles: true,
  cancelable: true
});

// 监听
element.addEventListener('myEvent', (e) => {
  console.log(e.detail.message);
});

// 触发
element.dispatchEvent(event);
```

---

## 7. 性能优化

### 7.1 DocumentFragment

```javascript
// ❌ 多次 DOM 操作（触发多次重排）
const list = document.getElementById('list');
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = i;
  list.appendChild(li);
}

// ✅ 使用 DocumentFragment（只触发一次重排）
const list = document.getElementById('list');
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = i;
  fragment.appendChild(li);
}

list.appendChild(fragment);
```

### 7.2 批量样式修改

```javascript
// ❌ 多次修改样式
element.style.width = '100px';
element.style.height = '100px';
element.style.background = 'red';

// ✅ 一次性修改
element.style.cssText = 'width: 100px; height: 100px; background: red;';

// ✅ 使用类名
element.classList.add('styled');
```

### 7.3 离线 DOM 操作

```javascript
// 从文档中移除，操作后再插入
const container = document.getElementById('container');
const parent = container.parentNode;

parent.removeChild(container);

// 批量操作
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  container.appendChild(div);
}

parent.appendChild(container);
```

### 7.4 避免强制同步布局

```javascript
// ❌ 强制同步布局（性能差）
for (let i = 0; i < 1000; i++) {
  elements[i].style.width = elements[i].offsetWidth + 10 + 'px';
  // 每次都触发布局计算
}

// ✅ 批量读取，批量写入
const widths = [];
for (let i = 0; i < 1000; i++) {
  widths[i] = elements[i].offsetWidth;
}

for (let i = 0; i < 1000; i++) {
  elements[i].style.width = widths[i] + 10 + 'px';
}
```

---

## 关键要点

1. **节点查询**
   - querySelector（推荐）
   - getElementById（最快）
   - 理解节点关系

2. **节点操作**
   - createElement
   - appendChild/insertBefore
   - remove/replaceWith

3. **属性操作**
   - dataset（data-* 属性）
   - classList（类名操作）
   - style（样式操作）

4. **事件处理**
   - addEventListener
   - 事件委托
   - 自定义事件

5. **性能优化**
   - DocumentFragment
   - 批量操作
   - 避免强制同步布局

---

## 参考资料

- [MDN: Document Object Model](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model)
- [DOM Performance](https://web.dev/dom-performance/)

---

**上一章**：[浏览器对象模型 BOM](./content-27.md)  
**下一章**：[事件机制深入](./content-29.md)
