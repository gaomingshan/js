# DOM 树与节点操作

## 概述

DOM（Document Object Model）是浏览器把 HTML 文档暴露给 JavaScript 的编程接口。它将页面表示为一棵**节点树**：

- 读取属性：从节点自身开始查找
- 修改结构：增删改节点
- 修改表现：改变 class / style

理解 DOM 的关键不在 API 背诵，而在两点：

- **节点（Node） vs 元素（Element）**：很多属性/遍历结果不一样
- **读写代价**：DOM 操作会触发布局计算/重排/重绘，批量更新要有策略

---

## 一、DOM 树结构

### 1.1 节点类型（常用）

| 节点类型 | nodeType | 说明 |
| --- | ---:| --- |
| Element | 1 | 元素节点（`<div>`） |
| Attr | 2 | 属性节点（现代开发很少直接用） |
| Text | 3 | 文本节点 |
| Comment | 8 | 注释节点 |
| Document | 9 | 文档节点（`document`） |
| DocumentFragment | 11 | 文档片段（离线容器） |

> **记忆点**
>
> `children` 只包含 Element；`childNodes` 包含所有 Node（包括 Text/Comment），因此实际遍历 UI 节点时更常用 `children`。

---

## 二、选择元素

### 2.1 单个元素

```js
// getElementById
const el = document.getElementById('app');

// querySelector：返回第一个匹配
const first = document.querySelector('.item');
const byCss = document.querySelector('div > p');
```

### 2.2 多个元素

```js
// HTMLCollection（实时）
const list1 = document.getElementsByClassName('item');
const list2 = document.getElementsByTagName('div');

// NodeList（静态，常见于 querySelectorAll）
const list3 = document.querySelectorAll('.item');
```

### 2.3 HTMLCollection vs NodeList（核心差异）

- **实时性**：`getElementsBy*` 返回的 HTMLCollection 往往会随着 DOM 变化自动更新；`querySelectorAll` 返回静态 NodeList。
- **迭代能力**：NodeList 通常支持 `forEach`；HTMLCollection 没有 `forEach`（但可 `for...of`）。

建议：

```js
const arr = Array.from(document.getElementsByClassName('item'));
```

---

## 三、节点属性与内容

### 3.1 基本属性

```js
const el = document.getElementById('myDiv');

el.nodeType;  // 1
el.nodeName;  // 'DIV'
el.tagName;   // 'DIV'
el.nodeValue; // null（元素节点无值）
```

### 3.2 内容属性：`textContent` / `innerHTML` / `innerText`

- `textContent`：纯文本，不解析 HTML（更可控、更快，常用）
- `innerHTML`：解析 HTML（方便但有 XSS 风险，且可能导致原事件监听器失效）
- `innerText`：更接近“可见文本”，会考虑 CSS，可能触发布局

```js
el.textContent = 'Hello';
el.innerHTML = '<span>Hello</span>';
el.innerText = 'Hello';
```

> **安全提示**
>
> 任何包含用户输入的内容都不要直接拼进 `innerHTML`。

---

## 四、属性操作：Attribute vs Property

### 4.1 `getAttribute` / `setAttribute`

```js
el.getAttribute('data-id');
el.setAttribute('data-id', '123');
el.removeAttribute('data-id');
el.hasAttribute('data-id');
```

### 4.2 `dataset`（操作 `data-*`）

```js
el.dataset.id;        // 读取 data-id
el.dataset.id = '1';  // 设置 data-id
```

### 4.3 Property（直接属性）

```js
el.id = 'myId';
el.className = 'box';
el.classList.add('active');
```

> **Attribute vs Property**
>
> Attribute 是 HTML 上的“标记”；Property 是 DOM 对象上的“运行时状态”。两者有时同步、有时不完全同步（例如表单控件的 `value`）。

---

## 五、节点关系（遍历 DOM）

### 5.1 父子

```js
el.parentNode;
el.parentElement;

el.childNodes;        // NodeList：包含文本节点
el.children;          // HTMLCollection：只有元素

el.firstChild;
el.firstElementChild;
```

### 5.2 兄弟

```js
el.nextSibling;
el.previousSibling;

el.nextElementSibling;
el.previousElementSibling;
```

---

## 六、创建与插入节点

### 6.1 创建

```js
const div = document.createElement('div');
const text = document.createTextNode('Hello');
const fragment = document.createDocumentFragment();
```

### 6.2 插入（经典 + 现代）

```js
parent.appendChild(child);
parent.insertBefore(newNode, refNode);

parent.append(child1, child2, 'text');
parent.prepend(child);

el.before(newEl);
el.after(newEl);
```

### 6.3 `innerHTML` vs `createElement`

- `innerHTML`
  - 优点：写起来快
  - 缺点：XSS 风险、可能整体重建节点导致监听器失效
- `createElement`
  - 优点：更安全、可控、批量操作时更友好

---

## 七、删除 / 替换 / 克隆

```js
parent.removeChild(child);
el.remove();

parent.replaceChild(newChild, oldChild);
oldEl.replaceWith(newEl);

const shallow = el.cloneNode(false);
const deep = el.cloneNode(true);
```

> **注意**
>
> `cloneNode(true)` 会复制子树结构，但不会复制通过 `addEventListener` 绑定的事件监听器。

---

## 八、样式操作

### 8.1 class

```js
el.className = 'a b';

el.classList.add('active');
el.classList.remove('active');
el.classList.toggle('active');
el.classList.contains('active');
```

### 8.2 style

```js
el.style.color = 'red';
el.style.backgroundColor = 'blue';
el.style.cssText = 'color: red; font-size: 16px;';

const style = getComputedStyle(el);
style.color;
```

> **实践建议**
>
> 大多数情况下优先“切换 class”，让样式逻辑回到 CSS，而不是大量写内联 style。

---

## 九、性能优化：DocumentFragment 与读写分离

### 9.1 使用 DocumentFragment 批量插入

```js
const frag = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  frag.appendChild(li);
}

ul.appendChild(frag);
```

### 9.2 读写分离，避免布局抖动（layout thrashing）

- “读布局信息”（如 `offsetWidth`、`getComputedStyle`）可能触发强制同步布局
- “写样式/结构”会使布局失效

建议把读和写分开批处理，必要时用 `requestAnimationFrame`。

---

## 十、最佳实践

1. **缓存 DOM 查询结果**：避免重复 `querySelector`。
2. **避免把用户输入直接写入 `innerHTML`**：必要时做转义或使用安全模板。
3. **批量更新 DOM**：使用 fragment 或一次性替换。
4. **用事件委托减少监听器数量**（见下一章）。
5. **尽量用 class 驱动样式**：保持逻辑/表现分离。

---

## 参考资料

- [DOM Standard](https://dom.spec.whatwg.org/)
- [MDN - Document Object Model](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model)
