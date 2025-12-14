# 内存泄漏分析

## 概述

内存泄漏是指程序中已分配的内存无法被释放或回收，导致可用内存逐渐减少。

理解内存泄漏的关键在于：

- **什么是泄漏**：应该被回收但无法回收的内存
- **常见场景**：定时器、事件监听器、闭包、DOM 引用
- **排查工具**：Chrome DevTools 的 Memory Profiler

---

## 一、常见内存泄漏场景

### 1.1 意外的全局变量

```js
// ❌ 忘记声明变量导致全局变量
function leak() {
  name = 'Alice';  // 创建了全局变量 window.name
}

leak();
console.log(window.name);  // "Alice"（永远不会被回收）

// ✅ 修复：使用严格模式和正确声明
'use strict';
function fixed() {
  let name = 'Alice';  // 局部变量
}
```

### 1.2 未清理的定时器

```js
// ❌ 定时器引用的变量无法回收
function leak() {
  const data = new Array(10000).fill('x');

  setInterval(() => {
    console.log(data.length);  // 持续引用 data
  }, 1000);

  // 定时器永远不会停止，data 永远不会被回收
}

// ✅ 修复：清理定时器
function fixed() {
  const data = new Array(10000).fill('x');

  const timer = setInterval(() => {
    console.log(data.length);
  }, 1000);

  // 适当时机清理
  setTimeout(() => {
    clearInterval(timer);
  }, 10000);
}
```

### 1.3 未移除的事件监听器

```js
// ❌ 事件监听器持有引用
function leak() {
  const element = document.getElementById('button');
  const data = new Array(10000).fill('x');

  element.addEventListener('click', function() {
    console.log(data.length);  // 闭包引用 data
  });

  // element 被移除后，监听器仍在内存中
  element.remove();
}

// ✅ 修复：移除监听器
function fixed() {
  const element = document.getElementById('button');
  const data = new Array(10000).fill('x');

  function handler() {
    console.log(data.length);
  }

  element.addEventListener('click', handler);

  // 清理
  element.removeEventListener('click', handler);
  element.remove();
}
```

### 1.4 DOM 引用

```js
// ❌ 保持对已删除 DOM 的引用
const elements = {
  button: document.getElementById('button')
};

// 从 DOM 中删除
document.body.removeChild(elements.button);

// 但 elements.button 仍然引用该 DOM 节点
// 导致整个 DOM 子树无法回收

// ✅ 修复：清除引用
elements.button = null;
```

### 1.5 闭包引用

```js
// ❌ 闭包保持对大对象的引用
function leak() {
  const largeData = new Array(10000).fill('x');
  const smallData = 'y';

  return function() {
    return smallData;  // 只使用 smallData
  };

  // 但闭包会保持整个作用域，包括 largeData
}

// ✅ 修复：最小化闭包作用域
function fixed() {
  let largeData = new Array(10000).fill('x');
  const smallData = 'y';

  // 处理 largeData...

  // 解除引用
  largeData = null;

  return function() {
    return smallData;  // largeData 已被回收
  };
}
```

---

## 二、排查工具

### 2.1 Chrome DevTools

```js
// 1. Memory Profiler（内存分析器）

// Heap Snapshot（堆快照）
// - 记录当前时刻的内存状态
// - 查看对象数量和大小
// - 对比多个快照找出增长的对象

// Allocation Timeline（分配时间线）
// - 实时记录内存分配
// - 找出频繁分配的对象
// - 查看对象的保留路径

// Allocation Sampling（分配采样）
// - 低开销的采样
// - 找出内存热点

// 2. Performance Monitor（性能监视器）
// - 实时查看 JS 堆大小
// - DOM 节点数量
// - 监听器数量

// 3. Task Manager（任务管理器）
// - Shift + Esc 打开
// - 查看各标签页内存使用
```

### 2.2 排查步骤

```js
// 步骤 1：重现问题
// - 确定导致内存增长的操作
// - 重复执行该操作

// 步骤 2：记录堆快照
// 1. 操作前记录快照 A
// 2. 执行操作
// 3. 操作后记录快照 B
// 4. 再次执行操作
// 5. 再次记录快照 C

// 步骤 3：对比快照
// - 查看 B 和 A 的差异
// - 查看 C 和 B 的差异
// - 找出持续增长的对象

// 步骤 4：查看保留路径
// - 选择增长的对象
// - 查看 "Retainers"（保留者）
// - 找出是什么引用了该对象

// 步骤 5：定位代码
// - 根据保留路径找到代码位置
// - 分析为什么没有被回收
```

---

## 三、实际案例

### 3.1 案例1：定时器泄漏

```js
// ❌ 问题代码
class Component {
  constructor() {
    this.data = new Array(10000).fill('x');

    setInterval(() => {
      this.render();
    }, 1000);
  }

  render() {
    console.log(this.data.length);
  }

  destroy() {
    // 忘记清理定时器
  }
}

// 每次创建 Component 都泄漏内存
for (let i = 0; i < 10; i++) {
  new Component();
}

// ✅ 修复代码
class ComponentFixed {
  constructor() {
    this.data = new Array(10000).fill('x');

    this.timer = setInterval(() => {
      this.render();
    }, 1000);
  }

  render() {
    console.log(this.data.length);
  }

  destroy() {
    clearInterval(this.timer);  // 清理定时器
    this.data = null;            // 解除引用
  }
}
```

### 3.2 案例2：事件监听器泄漏

```js
// ❌ 问题代码
class ListView {
  constructor(items) {
    this.items = items;
    this.handlers = [];
    this.render();
  }

  render() {
    this.items.forEach((item, index) => {
      const element = document.createElement('div');

      // 每次 render 都添加新的监听器
      element.addEventListener('click', () => {
        this.handleClick(index);
      });

      document.body.appendChild(element);
    });
  }

  handleClick(index) {
    console.log('Clicked:', index);
  }
}

// ✅ 修复代码
class ListViewFixed {
  constructor(items) {
    this.items = items;
    this.handlers = new Map();
    this.render();
  }

  render() {
    this.items.forEach((item, index) => {
      const element = document.createElement('div');

      const handler = () => this.handleClick(index);
      this.handlers.set(element, handler);

      element.addEventListener('click', handler);
      document.body.appendChild(element);
    });
  }

  handleClick(index) {
    console.log('Clicked:', index);
  }

  destroy() {
    this.handlers.forEach((handler, element) => {
      element.removeEventListener('click', handler);
      element.remove();
    });
    this.handlers.clear();
  }
}
```

### 3.3 案例3：WeakMap 解决方案

```js
// 使用 WeakMap 避免泄漏
const cache = new WeakMap();

function process(element) {
  if (cache.has(element)) {
    return cache.get(element);
  }

  const result = heavyComputation(element);
  cache.set(element, result);
  return result;
}

// element 被 GC 回收时，cache 中的条目也会自动删除
```

---

## 四、最佳实践

1. **使用严格模式**：避免意外的全局变量。
2. **清理定时器**：`clearInterval`/`clearTimeout`。
3. **移除事件监听器**：`removeEventListener`。
4. **解除 DOM 引用**：不再使用的 DOM 设为 `null`。
5. **使用 WeakMap/WeakSet**：自动清理不再使用的对象。
6. **监控内存使用**：定期使用 DevTools 检查。
7. **代码审查**：关注闭包、定时器、监听器。

---

## 参考资料

- [Chrome DevTools - Memory Profiler](https://developer.chrome.com/docs/devtools/memory-problems/)
- [MDN - Memory Management](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management)
