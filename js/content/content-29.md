# 事件机制深入

> 理解浏览器事件系统的工作原理

---

## 概述

事件是 JavaScript 与用户交互的基础。深入理解事件机制，能够编写更高效、更可维护的交互代码。

本章将深入：
- 事件流（捕获与冒泡）
- 事件对象
- 事件委托
- 常用事件类型
- 最佳实践

---

## 1. 事件流

### 1.1 三个阶段

```javascript
// 事件流的三个阶段：
// 1. 捕获阶段（Capture Phase）：从 window 到目标元素
// 2. 目标阶段（Target Phase）：到达目标元素
// 3. 冒泡阶段（Bubble Phase）：从目标元素到 window

document.getElementById('parent').addEventListener('click', () => {
  console.log('父元素 - 捕获');
}, true);  // true = 捕获阶段

document.getElementById('child').addEventListener('click', () => {
  console.log('子元素 - 目标');
});

document.getElementById('parent').addEventListener('click', () => {
  console.log('父元素 - 冒泡');
});

// 点击子元素输出：
// 父元素 - 捕获
// 子元素 - 目标
// 父元素 - 冒泡
```

### 1.2 阻止传播

```javascript
element.addEventListener('click', (event) => {
  // 阻止冒泡
  event.stopPropagation();
  
  // 阻止捕获和冒泡
  event.stopImmediatePropagation();
});

// 阻止默认行为
element.addEventListener('click', (event) => {
  event.preventDefault();
});
```

---

## 2. 事件对象

### 2.1 常用属性

```javascript
element.addEventListener('click', (event) => {
  // 目标元素
  console.log(event.target);  // 触发事件的元素
  console.log(event.currentTarget);  // 绑定事件的元素
  
  // 事件类型
  console.log(event.type);  // 'click'
  
  // 时间戳
  console.log(event.timeStamp);
  
  // 阶段
  console.log(event.eventPhase);
  // 1: 捕获, 2: 目标, 3: 冒泡
  
  // 是否可取消
  console.log(event.cancelable);
  
  // 是否已阻止默认行为
  console.log(event.defaultPrevented);
});
```

### 2.2 鼠标事件

```javascript
element.addEventListener('click', (event) => {
  // 坐标（相对于视口）
  console.log(event.clientX, event.clientY);
  
  // 坐标（相对于页面）
  console.log(event.pageX, event.pageY);
  
  // 坐标（相对于屏幕）
  console.log(event.screenX, event.screenY);
  
  // 坐标（相对于目标元素）
  console.log(event.offsetX, event.offsetY);
  
  // 按键状态
  console.log(event.ctrlKey);   // Ctrl 键
  console.log(event.shiftKey);  // Shift 键
  console.log(event.altKey);    // Alt 键
  console.log(event.metaKey);   // Meta 键（Mac 的 Cmd）
  
  // 鼠标按键
  console.log(event.button);
  // 0: 左键, 1: 中键, 2: 右键
});
```

### 2.3 键盘事件

```javascript
document.addEventListener('keydown', (event) => {
  // 按键信息
  console.log(event.key);   // 'a', 'Enter', 'ArrowUp'
  console.log(event.code);  // 'KeyA', 'Enter', 'ArrowUp'
  console.log(event.keyCode);  // 已废弃
  
  // 修饰键
  console.log(event.ctrlKey);
  console.log(event.shiftKey);
  
  // 是否重复（按住不放）
  console.log(event.repeat);
  
  // 常用快捷键
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    console.log('保存');
  }
});
```

---

## 3. 事件委托

### 3.1 基本原理

```javascript
// ❌ 为每个元素添加监听器
const items = document.querySelectorAll('.item');
items.forEach(item => {
  item.addEventListener('click', handleClick);
});

// ✅ 事件委托（推荐）
document.getElementById('list').addEventListener('click', (event) => {
  if (event.target.matches('.item')) {
    handleClick(event);
  }
});

// 优点：
// 1. 只需一个监听器
// 2. 内存占用少
// 3. 动态元素也能响应
```

### 3.1 实用示例

```javascript
// 表格行点击
document.querySelector('table').addEventListener('click', (event) => {
  const row = event.target.closest('tr');
  if (row && row.parentElement.tagName === 'TBODY') {
    console.log('点击行:', row.rowIndex);
  }
});

// 动态列表
const list = document.getElementById('list');

list.addEventListener('click', (event) => {
  const target = event.target;
  
  if (target.matches('.delete-btn')) {
    target.closest('li').remove();
  } else if (target.matches('.edit-btn')) {
    const li = target.closest('li');
    const text = li.querySelector('.text');
    text.contentEditable = true;
    text.focus();
  }
});
```

---

## 4. 常用事件类型

### 4.1 表单事件

```javascript
const form = document.querySelector('form');
const input = document.querySelector('input');

// 提交
form.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log('表单提交');
});

// 输入
input.addEventListener('input', (event) => {
  console.log('实时输入:', event.target.value);
});

// 改变（失焦后）
input.addEventListener('change', (event) => {
  console.log('值改变:', event.target.value);
});

// 焦点
input.addEventListener('focus', () => {
  console.log('获得焦点');
});

input.addEventListener('blur', () => {
  console.log('失去焦点');
});
```

### 4.2 文档事件

```javascript
// DOM 加载完成（不等待样式、图片）
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 就绪');
});

// 页面完全加载（包括图片）
window.addEventListener('load', () => {
  console.log('页面加载完成');
});

// 页面卸载前
window.addEventListener('beforeunload', (event) => {
  event.preventDefault();
  event.returnValue = '';  // 显示确认对话框
});

// 页面卸载
window.addEventListener('unload', () => {
  console.log('页面卸载');
});
```

### 4.3 触摸事件

```javascript
element.addEventListener('touchstart', (event) => {
  const touch = event.touches[0];
  console.log('触摸开始:', touch.clientX, touch.clientY);
});

element.addEventListener('touchmove', (event) => {
  event.preventDefault();  // 阻止滚动
  const touch = event.touches[0];
  console.log('触摸移动:', touch.clientX, touch.clientY);
});

element.addEventListener('touchend', (event) => {
  console.log('触摸结束');
});
```

### 4.4 滚动事件

```javascript
// 节流优化
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      console.log('滚动位置:', window.scrollY);
      ticking = false;
    });
    ticking = true;
  }
});

// 滚动到底部检测
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    console.log('到达底部');
  }
});
```

---

## 5. 自定义事件

### 5.1 创建和触发

```javascript
// 创建自定义事件
const myEvent = new CustomEvent('myCustomEvent', {
  detail: { message: 'Hello', timestamp: Date.now() },
  bubbles: true,
  cancelable: true
});

// 监听
element.addEventListener('myCustomEvent', (event) => {
  console.log(event.detail.message);
});

// 触发
element.dispatchEvent(myEvent);
```

### 5.2 事件总线

```javascript
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  off(event, callback) {
    if (!this.events[event]) return;
    
    this.events[event] = this.events[event].filter(
      cb => cb !== callback
    );
  }
  
  emit(event, data) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      callback(data);
    });
  }
  
  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// 使用
const bus = new EventBus();

bus.on('userLogin', (user) => {
  console.log('用户登录:', user.name);
});

bus.emit('userLogin', { name: 'Alice' });
```

---

## 6. 性能优化

### 6.1 节流（Throttle）

```javascript
function throttle(fn, delay) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 使用
window.addEventListener('scroll', throttle(() => {
  console.log('滚动事件');
}, 200));
```

### 6.2 防抖（Debounce）

```javascript
function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    clearTimeout(timer);
    
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 使用
input.addEventListener('input', debounce((event) => {
  console.log('搜索:', event.target.value);
}, 300));
```

### 6.3 被动监听器

```javascript
// 提升滚动性能
element.addEventListener('touchstart', handler, {
  passive: true  // 不会调用 preventDefault
});

// 滚动和触摸事件推荐使用 passive
window.addEventListener('scroll', handler, { passive: true });
```

---

## 7. 最佳实践

### 7.1 移除事件监听

```javascript
class Component {
  constructor(element) {
    this.element = element;
    this.handleClick = this.handleClick.bind(this);
  }
  
  mount() {
    this.element.addEventListener('click', this.handleClick);
  }
  
  unmount() {
    // 必须移除监听器，防止内存泄漏
    this.element.removeEventListener('click', this.handleClick);
  }
  
  handleClick(event) {
    console.log('Clicked');
  }
}
```

### 7.2 once 选项

```javascript
// 只触发一次
button.addEventListener('click', handler, { once: true });

// 等价于
button.addEventListener('click', function handler(event) {
  // 处理事件
  button.removeEventListener('click', handler);
});
```

### 7.3 避免内存泄漏

```javascript
// ❌ 闭包导致内存泄漏
function attachHandler() {
  const largeData = new Array(1000000).fill('data');
  
  button.addEventListener('click', () => {
    console.log(largeData.length);
  });
}

// ✅ 只保留需要的数据
function attachHandler() {
  const largeData = new Array(1000000).fill('data');
  const count = largeData.length;
  
  button.addEventListener('click', () => {
    console.log(count);
  });
}
```

---

## 关键要点

1. **事件流**
   - 捕获 → 目标 → 冒泡
   - stopPropagation
   - preventDefault

2. **事件对象**
   - target vs currentTarget
   - 鼠标坐标
   - 键盘按键

3. **事件委托**
   - 利用冒泡
   - 减少监听器数量
   - 支持动态元素

4. **性能优化**
   - 节流和防抖
   - passive 监听器
   - 及时移除监听器

5. **最佳实践**
   - 使用事件委托
   - 避免内存泄漏
   - 合理使用 once

---

## 参考资料

- [MDN: Event reference](https://developer.mozilla.org/zh-CN/docs/Web/Events)
- [Event delegation](https://javascript.info/event-delegation)

---

**上一章**：[DOM 操作详解](./content-28.md)  
**下一章**：[Web API 实践](./content-30.md)
