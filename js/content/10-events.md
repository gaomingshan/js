# 事件系统详解

## 概述

事件是浏览器与用户交互的核心机制：点击、输入、滚动、网络状态变化……都以事件形式出现。

掌握事件系统，你需要回答三个问题：

1. **事件从哪里来，往哪里走**（捕获/目标/冒泡）
2. **监听器绑定在谁身上**（`currentTarget`）以及“真正触发”的是谁（`target`）
3. **如何写出高性能的事件代码**（委托、防抖/节流、passive、及时清理）

---

## 一、事件监听与移除

### 1.1 `addEventListener`（推荐）

```js
element.addEventListener('click', (event) => {
  console.log('clicked');
});
```

相比 `element.onclick = ...`：

- 可以绑定多个监听器
- 支持捕获/once/passive 等配置

### 1.2 移除监听器（必须同一函数引用）

```js
function handler(e) {
  console.log('handle');
}

element.addEventListener('click', handler);
element.removeEventListener('click', handler);
```

> **常见坑**
>
> 匿名函数没有引用，无法移除：
>
> ```js
> element.addEventListener('click', () => {});
> // removeEventListener 无法移除
> ```

---

## 二、事件流：捕获、目标、冒泡

### 2.1 三个阶段

- 捕获阶段：从 `window` 向下到目标
- 目标阶段：到达目标元素
- 冒泡阶段：从目标向上回到 `window`

### 2.2 捕获监听

```js
// 默认：冒泡
el.addEventListener('click', handler);

// 捕获
el.addEventListener('click', handler, true);
// 或
el.addEventListener('click', handler, { capture: true });
```

> **提示**
>
> 并非所有事件都会冒泡（如 `mouseenter`/`mouseleave`）。

---

## 三、Event 对象：你必须熟悉的字段

### 3.1 常用属性

- `event.type`：事件类型
- `event.target`：**触发事件**的元素（可能是子元素）
- `event.currentTarget`：**绑定监听器**的元素
- `event.eventPhase`：1 捕获 / 2 目标 / 3 冒泡
- `event.bubbles`：是否冒泡
- `event.cancelable`：是否可取消默认行为

### 3.2 常用方法

```js
event.preventDefault();

event.stopPropagation();

event.stopImmediatePropagation();
```

- `preventDefault`：阻止默认行为（例如 `a` 跳转、form 提交）
- `stopPropagation`：阻止继续传播（阻止冒泡/捕获链后续）
- `stopImmediatePropagation`：更强，连同元素上后续监听器也不再执行

---

## 四、常见事件类型

### 4.1 鼠标事件

- `click` / `dblclick`
- `mousedown` / `mouseup` / `mousemove`
- `mouseenter` / `mouseleave`（不冒泡）
- `mouseover` / `mouseout`（冒泡）

> **选型建议**
>
> 需要委托时，优先用会冒泡的 `mouseover/out` 或 `pointerover/out`；不需要委托且只关心进入/离开本元素，用 `mouseenter/leave`。

### 4.2 键盘事件

```js
element.addEventListener('keydown', (e) => {
  console.log(e.key);  // 'a' / 'Enter'
  console.log(e.code); // 'KeyA' / 'Enter'
  console.log(e.ctrlKey, e.shiftKey, e.altKey);
});
```

- `key`：语义键（受输入法/布局影响）
- `code`：物理键位（更稳定，做快捷键常用）

### 4.3 表单事件

- `submit`
- `input`：输入即触发（推荐做实时校验）
- `change`：值变化并失焦后触发（或 select 变化）
- `focus` / `blur`：不冒泡（可用 `focusin/focusout` 替代来支持委托）

### 4.4 文档/窗口事件

- `DOMContentLoaded`：DOM 解析完成
- `load`：所有资源加载完成
- `resize` / `scroll`

---

## 五、事件委托（高频工程技巧）

### 5.1 原理

利用冒泡：把监听器绑定在父元素上，通过 `event.target` 判断真正点击的子元素。

### 5.2 示例

```js
const list = document.querySelector('ul');

list.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li || !list.contains(li)) return;

  console.log('click item:', li.dataset.id);
});
```

优点：

- 减少监听器数量
- 动态插入的子元素无需重新绑定

---

## 六、自定义事件

### 6.1 `Event` vs `CustomEvent`

```js
const e1 = new Event('build');
const e2 = new CustomEvent('build', {
  detail: { time: Date.now() },
  bubbles: true,
  cancelable: true
});
```

### 6.2 触发与监听

```js
el.addEventListener('build', (e) => {
  console.log(e.detail);
});

el.dispatchEvent(e2);
```

---

## 七、事件性能优化

### 7.1 防抖（Debounce）

适合：输入框联想、窗口 resize 结束后计算布局。

```js
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

### 7.2 节流（Throttle）

适合：滚动/拖拽/鼠标移动等高频事件。

```js
function throttle(fn, delay) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}
```

### 7.3 `passive: true`

```js
el.addEventListener('touchstart', handler, { passive: true });
```

- 浏览器可提前进行滚动优化
- 代价：你不能再调用 `preventDefault()`

---

## 八、最佳实践

1. **尽量使用命名函数作为 handler**：便于移除与复用。
2. **优先事件委托**：列表/表格等场景最划算。
3. **高频事件使用节流/防抖**：避免卡顿。
4. **组件卸载时清理监听器/定时器**：避免内存泄漏。
5. **理解 target/currentTarget 区别**：这是调试事件 bug 的关键。

---

## 参考资料

- [DOM Standard - Events](https://dom.spec.whatwg.org/#events)
- [MDN - Events](https://developer.mozilla.org/zh-CN/docs/Web/Events)
