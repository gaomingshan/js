# 第 10 章：DOM 操作与事件 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** DOM 基础

### 题目

以下哪个方法可以选择多个元素？

**选项：**
- A. `document.getElementById()`
- B. `document.querySelector()`
- C. `document.querySelectorAll()`
- D. `document.getElementsByClassName()`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C 和 D

### 📖 解析

**选择单个元素的方法：**
```javascript
// 返回单个元素或 null
document.getElementById('myId');
document.querySelector('.myClass');
document.querySelector('#myId');
```

**选择多个元素的方法：**
```javascript
// 返回 NodeList（静态）
document.querySelectorAll('.myClass');

// 返回 HTMLCollection（动态）
document.getElementsByClassName('myClass');
document.getElementsByTagName('div');
document.getElementsByName('username');
```

**NodeList vs HTMLCollection：**

| 特性 | NodeList | HTMLCollection |
|------|----------|----------------|
| 返回方法 | querySelectorAll | getElementsBy* |
| 是否动态 | 静态（不会自动更新） | 动态（自动更新） |
| 包含节点类型 | 所有节点 | 仅元素节点 |
| 可迭代 | ✅ | ❌（需转换） |

**动态 vs 静态示例：**
```javascript
const div = document.createElement('div');
div.className = 'item';

// HTMLCollection（动态）
const live = document.getElementsByClassName('item');
console.log(live.length);  // 0

document.body.appendChild(div);
console.log(live.length);  // 1（自动更新）

// NodeList（静态）
const static = document.querySelectorAll('.item');
console.log(static.length);  // 1

document.body.appendChild(div.cloneNode());
console.log(static.length);  // 1（不会更新）
```

**遍历集合：**
```javascript
// NodeList 可以直接用 forEach
document.querySelectorAll('.item').forEach(el => {
  console.log(el);
});

// HTMLCollection 需要转换
const items = document.getElementsByClassName('item');
Array.from(items).forEach(el => {
  console.log(el);
});

// 或使用 for...of
for (const el of items) {
  console.log(el);
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** DOM 操作

### 题目

以下哪个方法可以在元素内部的最前面插入内容？

**选项：**
- A. `appendChild()`
- B. `prepend()`
- C. `insertBefore()`
- D. `insertAdjacentHTML('afterbegin', html)`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B 和 D

### 📖 解析

**插入元素的方法：**

**1. appendChild（末尾插入）**
```javascript
const parent = document.getElementById('parent');
const child = document.createElement('div');
parent.appendChild(child);  // 插入到最后
```

**2. prepend（开头插入）**
```javascript
parent.prepend(child);  // 插入到最前面
// 可以插入多个
parent.prepend(child1, child2, 'text');
```

**3. insertBefore（指定位置之前）**
```javascript
const reference = parent.firstChild;
parent.insertBefore(child, reference);  // 插入到 reference 之前
```

**4. insertAdjacentHTML**
```javascript
const element = document.getElementById('myElement');

// 'beforebegin'：元素之前
element.insertAdjacentHTML('beforebegin', '<div>before</div>');

// 'afterbegin'：元素内部的最前面
element.insertAdjacentHTML('afterbegin', '<div>first child</div>');

// 'beforeend'：元素内部的最后面
element.insertAdjacentHTML('beforeend', '<div>last child</div>');

// 'afterend'：元素之后
element.insertAdjacentHTML('afterend', '<div>after</div>');
```

**可视化位置：**
```html
<!-- beforebegin -->
<div id="myElement">
  <!-- afterbegin -->
  内容
  <!-- beforeend -->
</div>
<!-- afterend -->
```

**现代方法对比：**
```javascript
const parent = document.getElementById('parent');

// 旧方法
parent.appendChild(child);
parent.insertBefore(child, parent.firstChild);

// 新方法（更直观）
parent.append(child);           // 末尾
parent.prepend(child);          // 开头
parent.before(child);           // 元素之前
parent.after(child);            // 元素之后
parent.replaceWith(newChild);   // 替换
```

**append vs appendChild：**
```javascript
// appendChild：只能插入节点，返回插入的节点
const node = parent.appendChild(child);

// append：可以插入多个，可以是字符串，无返回值
parent.append(child1, child2, 'text');
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 事件冒泡

### 题目

事件冒泡是指事件从目标元素向上传播到根元素。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**事件传播的三个阶段：**

```javascript
// HTML 结构
<div id="outer">
  <div id="inner">
    <button id="btn">Click</button>
  </div>
</div>

// 事件监听
document.getElementById('outer').addEventListener('click', () => {
  console.log('outer');
});

document.getElementById('inner').addEventListener('click', () => {
  console.log('inner');
});

document.getElementById('btn').addEventListener('click', () => {
  console.log('btn');
});

// 点击 button 输出：btn → inner → outer
```

**三个阶段：**

**1. 捕获阶段（Capturing）**
- 从根元素向下传播到目标元素
- 默认不触发事件处理

**2. 目标阶段（Target）**
- 到达目标元素
- 触发目标元素的事件处理

**3. 冒泡阶段（Bubbling）**
- 从目标元素向上传播到根元素
- 默认触发事件处理

**可视化：**
```
捕获阶段：window → document → html → body → outer → inner → btn
目标阶段：btn
冒泡阶段：btn → inner → outer → body → html → document → window
```

**监听捕获阶段：**
```javascript
// 第三个参数为 true，监听捕获阶段
element.addEventListener('click', handler, true);

// 或使用对象配置
element.addEventListener('click', handler, {
  capture: true
});

// 点击 button 输出：outer → inner → btn（捕获阶段）
document.getElementById('outer').addEventListener('click', () => {
  console.log('outer');
}, true);

document.getElementById('inner').addEventListener('click', () => {
  console.log('inner');
}, true);

document.getElementById('btn').addEventListener('click', () => {
  console.log('btn');
});
```

**阻止冒泡：**
```javascript
element.addEventListener('click', (e) => {
  e.stopPropagation();  // 阻止冒泡
  console.log('不会冒泡');
});

// stopImmediatePropagation：阻止冒泡和同元素其他监听器
element.addEventListener('click', (e) => {
  e.stopImmediatePropagation();
  console.log('第一个监听器');
});

element.addEventListener('click', () => {
  console.log('不会执行');  // 被阻止
});
```

**不冒泡的事件：**
```javascript
// 以下事件不冒泡
focus, blur, load, unload, scroll, mouseenter, mouseleave
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 事件委托

### 题目

以下代码中，点击 `<li>` 元素会输出什么？

```javascript
const ul = document.querySelector('ul');
ul.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log(e.target.textContent);
  }
});

// HTML: <ul><li>Item 1</li><li>Item 2</li></ul>
```

**选项：**
- A. 不会输出任何内容
- B. 输出对应 `<li>` 的文本
- C. 报错
- D. 输出 `undefined`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**事件委托原理**

```javascript
const ul = document.querySelector('ul');

// 在父元素上监听
ul.addEventListener('click', (e) => {
  // e.target：实际被点击的元素
  if (e.target.tagName === 'LI') {
    console.log(e.target.textContent);
    // 点击 Item 1 → 输出 "Item 1"
    // 点击 Item 2 → 输出 "Item 2"
  }
});
```

**e.target vs e.currentTarget：**
```javascript
ul.addEventListener('click', (e) => {
  console.log('target:', e.target.tagName);        // LI（被点击的元素）
  console.log('currentTarget:', e.currentTarget.tagName);  // UL（监听器绑定的元素）
});
```

**事件委托的优势：**

**1. 动态元素无需重新绑定**
```javascript
// ✅ 事件委托
ul.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log(e.target.textContent);
  }
});

// 动态添加的元素也能响应
const li = document.createElement('li');
li.textContent = 'New Item';
ul.appendChild(li);  // 点击也能触发

// ❌ 直接绑定
document.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', () => {
    console.log(li.textContent);
  });
});
// 新添加的元素不会响应
```

**2. 减少内存占用**
```javascript
// ❌ 每个元素都绑定（1000 个监听器）
document.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', handler);
});

// ✅ 只在父元素绑定（1 个监听器）
ul.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    handler(e);
  }
});
```

**处理嵌套元素：**
```javascript
// HTML: <ul><li><span>Text</span></li></ul>

ul.addEventListener('click', (e) => {
  // 点击 span，e.target 是 span 而不是 li
  console.log(e.target.tagName);  // SPAN
  
  // 使用 closest 找到最近的 li
  const li = e.target.closest('li');
  if (li && ul.contains(li)) {
    console.log(li.textContent);
  }
});
```

**完整的事件委托封装：**
```javascript
function delegate(parent, selector, event, handler) {
  parent.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, e);
    }
  });
}

// 使用
delegate(ul, 'li', 'click', function(e) {
  console.log(this.textContent);  // this 指向 li
});
```

**实际应用：**
```javascript
// 表格行点击
const table = document.querySelector('table');
delegate(table, 'tr', 'click', function(e) {
  this.classList.toggle('selected');
});

// 删除按钮
delegate(document.body, '.delete-btn', 'click', function(e) {
  e.preventDefault();
  this.closest('.item').remove();
});

// 表单验证
delegate(form, 'input', 'blur', function(e) {
  validateField(this);
});
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** DOM 属性

### 题目

以下代码的输出是什么？

```javascript
const div = document.createElement('div');
div.setAttribute('data-id', '123');
div.dataset.name = 'test';

console.log(div.getAttribute('data-id'));
console.log(div.getAttribute('data-name'));
console.log(div.dataset.id);
console.log(div.dataset.name);
```

**选项：**
- A. `"123"`, `"test"`, `"123"`, `"test"`
- B. `"123"`, `null`, `"123"`, `"test"`
- C. `"123"`, `"test"`, `undefined`, `"test"`
- D. `"123"`, `null`, `undefined`, `"test"`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**dataset 与 data-* 属性**

```javascript
const div = document.createElement('div');

// 方式 1：setAttribute
div.setAttribute('data-id', '123');

// 方式 2：dataset（推荐）
div.dataset.name = 'test';

// 读取
console.log(div.getAttribute('data-id'));    // "123"
console.log(div.getAttribute('data-name'));  // "test"
console.log(div.dataset.id);                 // "123"
console.log(div.dataset.name);               // "test"
```

**dataset 命名转换：**
```javascript
// HTML 中的 kebab-case
<div data-user-id="123" data-user-name="Alice"></div>

// JavaScript 中的 camelCase
div.dataset.userId;     // "123"
div.dataset.userName;   // "Alice"

// 设置
div.dataset.userAge = '25';
// 结果：<div ... data-user-age="25"></div>
```

**getAttribute vs 属性访问：**
```javascript
const input = document.querySelector('input');

// HTML: <input id="myInput" value="hello" class="form-control">

// getAttribute：返回 HTML 属性值（字符串）
input.getAttribute('value');   // "hello"
input.getAttribute('class');   // "form-control"
input.getAttribute('checked'); // null（不存在）

// 属性访问：返回 DOM 属性值（可能不同类型）
input.value;     // "hello"（可能被用户修改）
input.className; // "form-control"
input.checked;   // false（布尔值）

// 修改后的差异
input.value = 'world';
input.getAttribute('value');  // "hello"（HTML 属性未变）
input.value;                  // "world"（DOM 属性已变）
```

**setAttribute vs 属性赋值：**
```javascript
const div = document.createElement('div');

// setAttribute：设置 HTML 属性（字符串）
div.setAttribute('data-value', 123);
console.log(div.getAttribute('data-value'));  // "123"（字符串）

// 属性赋值：设置 DOM 属性（保持类型）
div.customProp = 123;
console.log(div.customProp);  // 123（数字）
console.log(div.getAttribute('customProp'));  // null（不会同步到 HTML）
```

**自定义 data 属性的应用：**
```javascript
// 存储额外信息
<button data-user-id="123" data-action="delete">Delete</button>

document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const userId = e.target.dataset.userId;
    const action = e.target.dataset.action;
    
    if (action === 'delete') {
      deleteUser(userId);
    }
  });
});

// 存储配置
<div data-config='{"speed": 1000, "loop": true}'></div>

const config = JSON.parse(element.dataset.config);
console.log(config.speed);  // 1000
```

**删除 data 属性：**
```javascript
// 删除 dataset
delete div.dataset.name;

// 删除属性
div.removeAttribute('data-name');

// 检查是否存在
if ('name' in div.dataset) {
  console.log('存在');
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码输出题  
**标签：** 事件对象

### 题目

以下代码中，点击按钮后会发生什么？

```javascript
const btn = document.querySelector('button');

btn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log('clicked');
});

document.body.addEventListener('click', () => {
  console.log('body clicked');
});
```

**选项：**
- A. 输出 `"clicked"` 和 `"body clicked"`
- B. 只输出 `"clicked"`
- C. 只输出 `"body clicked"`
- D. 不输出任何内容

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**事件对象的方法**

```javascript
btn.addEventListener('click', (e) => {
  // preventDefault：阻止默认行为
  e.preventDefault();
  
  // stopPropagation：阻止事件冒泡
  e.stopPropagation();
  
  console.log('clicked');  // 输出
});

document.body.addEventListener('click', () => {
  console.log('body clicked');  // 不会输出（冒泡被阻止）
});
```

**preventDefault 的应用：**
```javascript
// 阻止链接跳转
link.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('不会跳转');
});

// 阻止表单提交
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // 自定义提交逻辑
  submitForm();
});

// 阻止右键菜单
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// 阻止默认拖拽行为
div.addEventListener('dragover', (e) => {
  e.preventDefault();
});
```

**stopPropagation vs stopImmediatePropagation：**
```javascript
// stopPropagation：阻止冒泡，但当前元素的其他监听器仍会执行
btn.addEventListener('click', (e) => {
  e.stopPropagation();
  console.log('监听器 1');
});

btn.addEventListener('click', () => {
  console.log('监听器 2');  // 仍会执行
});

document.body.addEventListener('click', () => {
  console.log('body');  // 不会执行（冒泡被阻止）
});
// 输出：监听器 1, 监听器 2

// stopImmediatePropagation：阻止冒泡和当前元素的其他监听器
btn.addEventListener('click', (e) => {
  e.stopImmediatePropagation();
  console.log('监听器 1');
});

btn.addEventListener('click', () => {
  console.log('监听器 2');  // 不会执行
});

document.body.addEventListener('click', () => {
  console.log('body');  // 不会执行
});
// 输出：监听器 1
```

**事件对象的属性：**
```javascript
element.addEventListener('click', (e) => {
  // 事件类型
  console.log(e.type);  // "click"
  
  // 目标元素
  console.log(e.target);         // 实际被点击的元素
  console.log(e.currentTarget);  // 监听器绑定的元素
  
  // 鼠标位置
  console.log(e.clientX, e.clientY);  // 相对视口
  console.log(e.pageX, e.pageY);      // 相对文档
  console.log(e.screenX, e.screenY);  // 相对屏幕
  console.log(e.offsetX, e.offsetY);  // 相对目标元素
  
  // 修饰键
  console.log(e.ctrlKey);   // 是否按下 Ctrl
  console.log(e.shiftKey);  // 是否按下 Shift
  console.log(e.altKey);    // 是否按下 Alt
  console.log(e.metaKey);   // 是否按下 Meta（Mac: Command）
  
  // 按钮
  console.log(e.button);  // 0: 左键, 1: 中键, 2: 右键
  
  // 阻止方法
  e.preventDefault();           // 阻止默认行为
  e.stopPropagation();         // 阻止冒泡
  e.stopImmediatePropagation(); // 阻止冒泡和其他监听器
});
```

**检查默认行为是否被阻止：**
```javascript
element.addEventListener('click', (e) => {
  console.log(e.defaultPrevented);  // false
  
  e.preventDefault();
  
  console.log(e.defaultPrevented);  // true
});
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 事件监听器选项

### 题目

`addEventListener` 的第三个参数（options）可以包含哪些选项？

**选项：**
- A. `capture` - 是否在捕获阶段触发
- B. `once` - 是否只触发一次
- C. `passive` - 是否不调用 preventDefault
- D. `signal` - 用于移除监听器的 AbortSignal

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**addEventListener 的完整选项**

```javascript
element.addEventListener('click', handler, {
  capture: false,   // 是否在捕获阶段触发
  once: false,      // 是否只触发一次
  passive: false,   // 是否不调用 preventDefault
  signal: undefined // AbortSignal 对象
});
```

**A. capture（捕获阶段）**
```javascript
// 默认：冒泡阶段
element.addEventListener('click', handler, { capture: false });

// 捕获阶段
element.addEventListener('click', handler, { capture: true });
// 简写
element.addEventListener('click', handler, true);
```

**B. once（只触发一次）**
```javascript
button.addEventListener('click', () => {
  console.log('只触发一次');
}, { once: true });

// 点击后自动移除监听器
button.click();  // 输出
button.click();  // 不输出
```

**C. passive（提升滚动性能）**
```javascript
// passive: true 表示不会调用 preventDefault
element.addEventListener('touchstart', (e) => {
  // e.preventDefault();  // 无效，不会阻止默认行为
  console.log('touch');
}, { passive: true });

// 应用场景：提升滚动性能
document.addEventListener('wheel', handler, { passive: true });
document.addEventListener('touchmove', handler, { passive: true });
```

**D. signal（使用 AbortController 移除）**
```javascript
const controller = new AbortController();

// 添加监听器
element.addEventListener('click', handler, {
  signal: controller.signal
});

// 移除监听器
controller.abort();

// 一次性移除多个监听器
const controller = new AbortController();
const { signal } = controller;

element1.addEventListener('click', handler1, { signal });
element2.addEventListener('click', handler2, { signal });
element3.addEventListener('click', handler3, { signal });

// 一次性全部移除
controller.abort();
```

**综合示例：**
```javascript
const controller = new AbortController();

element.addEventListener('scroll', (e) => {
  console.log('scroll');
}, {
  capture: false,   // 冒泡阶段
  once: false,      // 可多次触发
  passive: true,    // 不阻止默认行为（提升性能）
  signal: controller.signal  // 可通过 controller 移除
});

// 移除
controller.abort();
```

**传统移除方式 vs AbortController：**
```javascript
// ❌ 传统方式：需要保存函数引用
const handler = () => console.log('click');
element.addEventListener('click', handler);
element.removeEventListener('click', handler);

// ✅ AbortController：不需要保存引用
const controller = new AbortController();
element.addEventListener('click', () => {
  console.log('click');
}, { signal: controller.signal });
controller.abort();

// ✅ 批量移除
const controller = new AbortController();
elements.forEach(el => {
  el.addEventListener('click', handler, {
    signal: controller.signal
  });
});
controller.abort();  // 一次性全部移除
```

**passive 的性能优化：**
```javascript
// 浏览器需要等待 handler 执行完才能决定是否滚动
document.addEventListener('touchmove', (e) => {
  // 可能调用 e.preventDefault()
}, { passive: false });

// 浏览器可以立即滚动，不需要等待
document.addEventListener('touchmove', (e) => {
  // 不会调用 e.preventDefault()
}, { passive: true });

// 检测是否支持 passive
let passiveSupported = false;
try {
  const options = {
    get passive() {
      passiveSupported = true;
      return false;
    }
  };
  window.addEventListener('test', null, options);
  window.removeEventListener('test', null, options);
} catch (err) {
  passiveSupported = false;
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** 事件总线

### 题目

实现一个简单的事件总线（Event Bus）。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

**事件总线实现**

```javascript
class EventBus {
  constructor() {
    this.events = {};
  }
  
  // 监听事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // 返回取消函数
    return () => this.off(event, callback);
  }
  
  // 监听一次
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
  
  // 触发事件
  emit(event, ...args) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      callback(...args);
    });
  }
  
  // 取消监听
  off(event, callback) {
    if (!this.events[event]) return;
    
    if (!callback) {
      // 取消所有监听
      delete this.events[event];
    } else {
      // 取消指定监听
      this.events[event] = this.events[event].filter(
        cb => cb !== callback
      );
    }
  }
  
  // 清空所有事件
  clear() {
    this.events = {};
  }
}
```

**使用示例：**
```javascript
const bus = new EventBus();

// 监听事件
bus.on('userLogin', (user) => {
  console.log('用户登录:', user);
});

bus.on('userLogin', (user) => {
  console.log('记录日志:', user);
});

// 触发事件
bus.emit('userLogin', { id: 1, name: 'Alice' });
// 输出：
// 用户登录: { id: 1, name: 'Alice' }
// 记录日志: { id: 1, name: 'Alice' }

// 监听一次
bus.once('firstVisit', () => {
  console.log('首次访问');
});

bus.emit('firstVisit');  // 输出：首次访问
bus.emit('firstVisit');  // 不输出

// 取消监听
const handler = () => console.log('test');
bus.on('test', handler);
bus.off('test', handler);
bus.emit('test');  // 不输出

// 取消所有监听
bus.off('userLogin');

// 使用取消函数
const cancel = bus.on('message', (msg) => {
  console.log(msg);
});
cancel();  // 取消监听
```

**进阶版本：支持命名空间**
```javascript
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    const [name, namespace] = this._parseEvent(event);
    const key = namespace ? `${name}.${namespace}` : name;
    
    if (!this.events[key]) {
      this.events[key] = [];
    }
    this.events[key].push(callback);
  }
  
  emit(event, ...args) {
    const [name] = this._parseEvent(event);
    
    // 触发所有匹配的事件
    Object.keys(this.events).forEach(key => {
      if (key === name || key.startsWith(`${name}.`)) {
        this.events[key].forEach(callback => {
          callback(...args);
        });
      }
    });
  }
  
  off(event, callback) {
    if (!event) {
      // 取消所有
      this.events = {};
      return;
    }
    
    const [name, namespace] = this._parseEvent(event);
    
    if (namespace) {
      // 取消特定命名空间
      const key = `${name}.${namespace}`;
      if (callback) {
        this.events[key] = this.events[key].filter(cb => cb !== callback);
      } else {
        delete this.events[key];
      }
    } else {
      // 取消所有同名事件
      Object.keys(this.events).forEach(key => {
        if (key === name || key.startsWith(`${name}.`)) {
          delete this.events[key];
        }
      });
    }
  }
  
  _parseEvent(event) {
    const parts = event.split('.');
    return [parts[0], parts[1]];
  }
}

// 使用
const bus = new EventBus();

bus.on('click.button', () => console.log('button click'));
bus.on('click.link', () => console.log('link click'));

bus.emit('click');  // 触发所有 click 事件
bus.off('click.button');  // 只取消 button 的监听
```

**实际应用：组件通信**
```javascript
// 全局事件总线
const globalBus = new EventBus();

// 组件 A
class ComponentA {
  constructor() {
    globalBus.on('dataUpdate', this.handleUpdate.bind(this));
  }
  
  handleUpdate(data) {
    console.log('Component A received:', data);
  }
  
  destroy() {
    globalBus.off('dataUpdate', this.handleUpdate);
  }
}

// 组件 B
class ComponentB {
  updateData() {
    globalBus.emit('dataUpdate', { value: 42 });
  }
}

const a = new ComponentA();
const b = new ComponentB();
b.updateData();  // Component A received: { value: 42 }
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** DocumentFragment

### 题目

使用 DocumentFragment 批量插入 1000 个 DOM 元素的优势是什么？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**DocumentFragment 的优势**

**1. 减少重排和重绘**
```javascript
// ❌ 低效：每次插入都触发重排
const container = document.getElementById('container');
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  container.appendChild(div);  // 触发 1000 次重排
}

// ✅ 高效：只触发一次重排
const container = document.getElementById('container');
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  fragment.appendChild(div);  // 不触发重排
}

container.appendChild(fragment);  // 只触发一次重排
```

**2. 性能对比**
```javascript
// 测试 1：直接插入
console.time('direct');
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  container.appendChild(div);
}
console.timeEnd('direct');  // ~100ms

// 测试 2：DocumentFragment
console.time('fragment');
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
container.appendChild(fragment);
console.timeEnd('fragment');  // ~10ms
```

**3. DocumentFragment 特性**
```javascript
const fragment = document.createDocumentFragment();

// 可以像普通节点一样操作
fragment.appendChild(div1);
fragment.appendChild(div2);

// 插入后，fragment 会被清空
console.log(fragment.childNodes.length);  // 2
container.appendChild(fragment);
console.log(fragment.childNodes.length);  // 0（已清空）
```

**4. 实际应用**
```javascript
// 渲染列表
function renderList(data) {
  const fragment = document.createDocumentFragment();
  
  data.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    li.dataset.id = item.id;
    fragment.appendChild(li);
  });
  
  ul.appendChild(fragment);
}

// 表格渲染
function renderTable(rows) {
  const fragment = document.createDocumentFragment();
  
  rows.forEach(row => {
    const tr = document.createElement('tr');
    Object.values(row).forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    });
    fragment.appendChild(tr);
  });
  
  tbody.appendChild(fragment);
}
```

**5. 其他优化方法**
```javascript
// 方法 1：innerHTML（最快，但不安全）
container.innerHTML = items.map(item => 
  `<div>${item}</div>`
).join('');

// 方法 2：insertAdjacentHTML
items.forEach(item => {
  container.insertAdjacentHTML('beforeend', `<div>${item}</div>`);
});

// 方法 3：克隆模板
const template = document.getElementById('template');
const fragment = document.createDocumentFragment();

items.forEach(item => {
  const clone = template.content.cloneNode(true);
  clone.querySelector('.name').textContent = item.name;
  fragment.appendChild(clone);
});

container.appendChild(fragment);

// 方法 4：离线操作
const container = document.getElementById('container');
const clone = container.cloneNode(false);

items.forEach(item => {
  const div = document.createElement('div');
  div.textContent = item;
  clone.appendChild(div);
});

container.parentNode.replaceChild(clone, container);
```

**6. 性能对比总结**

| 方法 | 性能 | 安全性 | 推荐度 |
|------|------|--------|--------|
| 直接插入 | ⭐ | ⭐⭐⭐ | ❌ |
| DocumentFragment | ⭐⭐⭐ | ⭐⭐⭐ | ✅ |
| innerHTML | ⭐⭐⭐⭐⭐ | ⭐ | ⚠️ |
| insertAdjacentHTML | ⭐⭐⭐⭐ | ⭐ | ⚠️ |
| 克隆模板 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ |

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 自定义事件

### 题目

如何创建和触发自定义事件？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**创建自定义事件**

**1. CustomEvent**
```javascript
// 创建自定义事件
const event = new CustomEvent('userLogin', {
  detail: {
    userId: 123,
    username: 'Alice'
  },
  bubbles: true,      // 是否冒泡
  cancelable: true,   // 是否可取消
  composed: false     // 是否穿透 Shadow DOM
});

// 监听事件
element.addEventListener('userLogin', (e) => {
  console.log(e.detail);  // { userId: 123, username: 'Alice' }
});

// 触发事件
element.dispatchEvent(event);
```

**2. Event 构造函数**
```javascript
// 简单事件（无附加数据）
const event = new Event('change', {
  bubbles: true,
  cancelable: true
});

element.dispatchEvent(event);
```

**3. 创建不同类型的事件**
```javascript
// 鼠标事件
const clickEvent = new MouseEvent('click', {
  bubbles: true,
  cancelable: true,
  clientX: 100,
  clientY: 200
});

// 键盘事件
const keyEvent = new KeyboardEvent('keydown', {
  bubbles: true,
  cancelable: true,
  key: 'Enter',
  code: 'Enter',
  keyCode: 13
});

// 输入事件
const inputEvent = new InputEvent('input', {
  bubbles: true,
  cancelable: true,
  data: 'hello'
});
```

**4. 实际应用：组件通信**
```javascript
class Component {
  constructor(element) {
    this.element = element;
  }
  
  // 触发自定义事件
  emit(eventName, data) {
    const event = new CustomEvent(eventName, {
      detail: data,
      bubbles: true,
      cancelable: true
    });
    this.element.dispatchEvent(event);
  }
  
  // 监听自定义事件
  on(eventName, handler) {
    this.element.addEventListener(eventName, handler);
  }
}

// 使用
const comp = new Component(document.getElementById('myComponent'));

comp.on('dataChange', (e) => {
  console.log('数据变化:', e.detail);
});

comp.emit('dataChange', { value: 42 });
```

**5. 实际应用：表单验证**
```javascript
class FormValidator {
  constructor(form) {
    this.form = form;
    this.setupListeners();
  }
  
  setupListeners() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.validate();
    });
  }
  
  validate() {
    const isValid = this.checkFields();
    
    // 触发验证事件
    const event = new CustomEvent('validationComplete', {
      detail: {
        isValid,
        errors: this.errors
      }
    });
    
    this.form.dispatchEvent(event);
  }
  
  checkFields() {
    // 验证逻辑
    return true;
  }
}

// 使用
const validator = new FormValidator(form);

form.addEventListener('validationComplete', (e) => {
  if (e.detail.isValid) {
    console.log('验证通过');
  } else {
    console.log('错误:', e.detail.errors);
  }
});
```

**6. 模拟原生事件**
```javascript
// 模拟点击
function simulateClick(element) {
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(event);
}

// 模拟输入
function simulateInput(element, value) {
  element.value = value;
  
  const event = new InputEvent('input', {
    bubbles: true,
    cancelable: true
  });
  
  element.dispatchEvent(event);
}

// 模拟键盘
function simulateKeyPress(element, key) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true
  });
  
  element.dispatchEvent(event);
}
```

**7. 事件委托 + 自定义事件**
```javascript
class DataTable {
  constructor(table) {
    this.table = table;
    this.setupEvents();
  }
  
  setupEvents() {
    // 使用事件委托
    this.table.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      if (row) {
        // 触发自定义行点击事件
        const event = new CustomEvent('rowClick', {
          detail: {
            row,
            data: this.getRowData(row)
          },
          bubbles: true
        });
        this.table.dispatchEvent(event);
      }
    });
  }
  
  getRowData(row) {
    // 获取行数据
    return { id: row.dataset.id };
  }
}

// 使用
const table = new DataTable(document.querySelector('table'));

table.table.addEventListener('rowClick', (e) => {
  console.log('点击行:', e.detail.data);
});
```

</details>

---

**本章总结：**
- ✅ DOM 选择器方法
- ✅ DOM 元素插入
- ✅ 事件冒泡机制
- ✅ 事件委托
- ✅ dataset 与 data-* 属性
- ✅ 事件对象方法
- ✅ addEventListener 选项
- ✅ 事件总线实现
- ✅ DocumentFragment 优化
- ✅ 自定义事件

**下一章：** [第 11 章：BOM 与浏览器 API](./chapter-11.md)
