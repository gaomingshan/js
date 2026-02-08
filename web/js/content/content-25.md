# 垃圾回收机制

> 理解 JavaScript 的内存管理

---

## 概述

垃圾回收（Garbage Collection, GC）是 JavaScript 自动内存管理的核心机制。理解 GC 的工作原理，有助于编写内存高效的代码，避免内存泄漏。

本章将深入：
- 内存生命周期
- 垃圾回收算法
- V8 的 GC 策略
- 内存泄漏的识别与防止
- 性能优化技巧

---

## 1. 内存生命周期

### 1.1 三个阶段

```javascript
// 1. 分配内存
let obj = { name: "Alice" };  // 在堆上分配对象

// 2. 使用内存
console.log(obj.name);  // 读取内存

// 3. 释放内存
obj = null;  // 解除引用，等待 GC 回收
```

### 1.2 栈与堆

```javascript
// 栈内存：基本类型、引用
function test() {
  let num = 42;        // 栈：数值
  let str = "hello";   // 栈：字符串指针，堆：字符串内容
  let obj = { x: 1 };  // 栈：对象指针，堆：对象内容
}

// 函数执行完毕，栈内存自动释放
// 堆内存由 GC 管理
```

---

## 2. 垃圾回收算法

### 2.1 引用计数（Reference Counting）

```javascript
// 原理：记录对象被引用的次数
let obj1 = { name: "Alice" };  // 引用计数 = 1
let obj2 = obj1;               // 引用计数 = 2

obj1 = null;  // 引用计数 = 1
obj2 = null;  // 引用计数 = 0 → 回收

// 问题：循环引用
function problem() {
  let obj1 = {};
  let obj2 = {};
  
  obj1.ref = obj2;  // obj2 引用计数 +1
  obj2.ref = obj1;  // obj1 引用计数 +1
  
  // 函数结束，但引用计数都不为 0
  // 造成内存泄漏
}

// 现代 JavaScript 不使用引用计数
```

### 2.2 标记清除（Mark-and-Sweep）

```javascript
// 原理：从根对象（全局、栈）出发，标记所有可达对象
// 未标记的对象即为垃圾

// 根对象
// ├─ window/global
// ├─ 调用栈中的局部变量
// └─ 闭包引用的变量

// 标记阶段：
// 1. 从根对象开始遍历
// 2. 标记所有可达对象
// 3. 未标记的对象视为垃圾

// 清除阶段：
// 4. 回收未标记的对象
// 5. 清除所有标记

// 优点：解决循环引用
let obj1 = {};
let obj2 = {};
obj1.ref = obj2;
obj2.ref = obj1;

obj1 = null;
obj2 = null;

// 两个对象都不可达，会被回收
```

---

## 3. V8 的垃圾回收策略

### 3.1 分代收集

```javascript
// V8 将堆分为两代：
// 1. 新生代（Young Generation）：存储新对象，频繁 GC
// 2. 老生代（Old Generation）：存储老对象，较少 GC

// 新生代
let temp = { temp: true };  // 分配在新生代

// 多次 GC 后存活的对象晋升到老生代
let permanent = { permanent: true };
// 使用一段时间后 → 晋升到老生代
```

### 3.2 Scavenge 算法（新生代）

```
新生代空间（分为两半）：
┌────────────┬────────────┐
│   From     │     To     │
│  (使用中)   │   (空闲)    │
└────────────┴────────────┘

GC 过程：
1. 标记 From 区的活对象
2. 复制活对象到 To 区
3. 清空 From 区
4. From 和 To 交换

优点：快速，适合短生命周期对象
缺点：浪费一半空间
```

### 3.3 Mark-Sweep 和 Mark-Compact（老生代）

```javascript
// Mark-Sweep（标记清除）
// 1. 标记活对象
// 2. 清除死对象
// 问题：产生内存碎片

// Mark-Compact（标记整理）
// 1. 标记活对象
// 2. 移动活对象到一端
// 3. 清理边界外的内存
// 优点：无碎片
// 缺点：慢
```

### 3.4 增量标记（Incremental Marking）

```javascript
// 问题：Full GC 会阻塞主线程（Stop-The-World）

// 解决：增量标记
// 1. 将标记工作拆分为多个小步骤
// 2. 与 JavaScript 执行交替进行
// 3. 减少单次暂停时间

// 例如：
// 执行 JS → 标记一部分 → 执行 JS → 标记一部分 → ...
```

### 3.5 并发标记（Concurrent Marking）

```javascript
// 在后台线程进行标记，不阻塞主线程
// 主线程可以继续执行 JavaScript

// 并发 GC 流程：
// 主线程：执行 JavaScript
// GC 线程：并发标记对象

// 只在必要时短暂暂停主线程
```

---

## 4. 内存泄漏

### 4.1 常见原因

**1. 全局变量**

```javascript
// ❌ 意外的全局变量
function createLeak() {
  leak = "I'm global";  // 未声明，变为全局变量
}

createLeak();
console.log(window.leak);  // "I'm global"

// ✅ 使用严格模式
"use strict";
function noLeak() {
  leak = "Error";  // ReferenceError
}
```

**2. 遗忘的定时器**

```javascript
// ❌ 未清理的定时器
const data = fetchLargeData();

setInterval(() => {
  console.log(data);  // data 永远不会被回收
}, 1000);

// ✅ 清理定时器
const data = fetchLargeData();
const timer = setInterval(() => {
  console.log(data);
}, 1000);

// 不再需要时清理
clearInterval(timer);
```

**3. 事件监听器**

```javascript
// ❌ 未移除的事件监听器
const element = document.getElementById('button');
const data = fetchLargeData();

element.addEventListener('click', function handler() {
  console.log(data);  // data 被闭包引用，不会被回收
});

// ✅ 移除事件监听器
const element = document.getElementById('button');
const data = fetchLargeData();

function handler() {
  console.log(data);
}

element.addEventListener('click', handler);

// 不再需要时移除
element.removeEventListener('click', handler);
```

**4. 闭包**

```javascript
// ❌ 意外的闭包引用
function createClosure() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    console.log('Hello');
    // largeData 被闭包保留，但未使用
  };
}

const fn = createClosure();
// largeData 无法被回收

// ✅ 只引用需要的变量
function createClosure() {
  const largeData = new Array(1000000).fill('data');
  const needed = largeData[0];
  
  return function() {
    console.log(needed);
    // 只保留 needed，largeData 可以被回收
  };
}
```

**5. DOM 引用**

```javascript
// ❌ 保留 DOM 引用
const elements = document.querySelectorAll('.item');
const cache = Array.from(elements);

// 从 DOM 中移除元素
elements.forEach(el => el.remove());

// cache 仍然引用 DOM 元素，无法回收

// ✅ 清理引用
const elements = document.querySelectorAll('.item');
let cache = Array.from(elements);

elements.forEach(el => el.remove());
cache = null;  // 清理引用
```

**6. 控制台日志**

```javascript
// ❌ 控制台保留引用
const largeData = new Array(1000000).fill('data');
console.log(largeData);

// 控制台打开时，largeData 被保留
// 生产环境应移除 console.log
```

### 4.2 检测内存泄漏

```javascript
// Chrome DevTools Memory Profiler
// 1. 打开 DevTools → Memory
// 2. 取堆快照（Heap Snapshot）
// 3. 执行操作
// 4. 再次取快照
// 5. 对比快照，查找增长的对象

// Node.js 内存监控
setInterval(() => {
  const used = process.memoryUsage();
  console.log(`
    堆使用: ${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB
    堆总量: ${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB
    外部: ${Math.round(used.external / 1024 / 1024 * 100) / 100} MB
  `);
}, 1000);
```

---

## 5. WeakMap 和 WeakSet

### 5.1 WeakMap

```javascript
// 弱引用：不阻止垃圾回收
const cache = new WeakMap();

let obj = { data: 'value' };
cache.set(obj, 'cached data');

obj = null;
// obj 可以被回收，cache 中的条目也会自动删除

// 用途：缓存
class DataCache {
  constructor() {
    this.cache = new WeakMap();
  }
  
  get(obj) {
    if (this.cache.has(obj)) {
      return this.cache.get(obj);
    }
    
    const data = this.computeExpensiveData(obj);
    this.cache.set(obj, data);
    return data;
  }
  
  computeExpensiveData(obj) {
    // 复杂计算
    return `processed: ${obj.value}`;
  }
}

// obj 被回收时，缓存自动清理
```

### 5.2 WeakSet

```javascript
// 弱引用集合
const visited = new WeakSet();

function traverse(node) {
  if (visited.has(node)) return;
  
  visited.add(node);
  
  // 处理节点
  if (node.children) {
    node.children.forEach(traverse);
  }
}

// node 被回收时，visited 中的引用也会被清理
```

### 5.3 WeakRef（ES2021）

```javascript
// 创建弱引用
let obj = { data: 'value' };
const weakRef = new WeakRef(obj);

// 访问对象
const deref = weakRef.deref();
if (deref) {
  console.log(deref.data);
} else {
  console.log('对象已被回收');
}

obj = null;
// 之后 GC 可能回收对象
```

---

## 6. 性能优化

### 6.1 减少对象创建

```javascript
// ❌ 频繁创建对象
function process(items) {
  return items.map(item => ({
    id: item.id,
    value: item.value * 2
  }));
}

// ✅ 复用对象
function process(items) {
  const result = new Array(items.length);
  for (let i = 0; i < items.length; i++) {
    result[i] = {
      id: items[i].id,
      value: items[i].value * 2
    };
  }
  return result;
}

// ✅ 使用对象池
class ObjectPool {
  constructor(factory, size = 10) {
    this.factory = factory;
    this.pool = Array.from({ length: size }, factory);
    this.inUse = new Set();
  }
  
  acquire() {
    const obj = this.pool.pop() || this.factory();
    this.inUse.add(obj);
    return obj;
  }
  
  release(obj) {
    this.inUse.delete(obj);
    this.pool.push(obj);
  }
}
```

### 6.2 及时释放引用

```javascript
// ✅ 清理大对象
function processLargeData() {
  let largeData = fetchLargeData();
  
  const result = process(largeData);
  
  largeData = null;  // 及时释放
  
  return result;
}

// ✅ 清理事件监听
class Component {
  constructor() {
    this.handler = this.handleClick.bind(this);
  }
  
  mount() {
    this.element.addEventListener('click', this.handler);
  }
  
  unmount() {
    this.element.removeEventListener('click', this.handler);
    this.element = null;
  }
  
  handleClick() {
    // 处理点击
  }
}
```

### 6.3 避免内存碎片

```javascript
// ✅ 预分配大小
const arr = new Array(1000);
for (let i = 0; i < 1000; i++) {
  arr[i] = i;
}

// ❌ 动态增长（可能产生碎片）
const arr = [];
for (let i = 0; i < 1000; i++) {
  arr.push(i);  // 可能多次重新分配
}
```

---

## 7. 监控和调试

### 7.1 浏览器工具

```javascript
// Chrome DevTools
// 1. Memory > Heap Snapshot：查看内存使用
// 2. Memory > Allocation Timeline：查看内存分配
// 3. Performance > Memory：查看内存趋势

// 手动触发 GC（Chrome）
// --expose-gc 标志启动
if (global.gc) {
  global.gc();
}
```

### 7.2 Node.js 监控

```javascript
// 查看内存使用
console.log(process.memoryUsage());
// {
//   rss: 物理内存
//   heapTotal: 堆总量
//   heapUsed: 堆使用
//   external: C++ 对象
//   arrayBuffers: ArrayBuffer
// }

// 手动触发 GC
// node --expose-gc app.js
if (global.gc) {
  global.gc();
  console.log('GC 完成');
}

// 监控 GC 事件
const v8 = require('v8');
v8.setFlagsFromString('--trace-gc');
```

### 7.3 性能分析

```javascript
// 内存泄漏检测
class LeakDetector {
  constructor() {
    this.snapshots = [];
  }
  
  takeSnapshot() {
    if (typeof window !== 'undefined') {
      // 浏览器环境
      console.log('手动取堆快照');
    } else {
      // Node.js 环境
      const v8 = require('v8');
      const snapshot = v8.writeHeapSnapshot();
      this.snapshots.push(snapshot);
      console.log(`快照保存: ${snapshot}`);
    }
  }
}

const detector = new LeakDetector();

// 操作前
detector.takeSnapshot();

// 执行操作
performOperations();

// 操作后
detector.takeSnapshot();

// 对比快照查找泄漏
```

---

## 8. 最佳实践

### 8.1 避免全局变量

```javascript
// ❌ 全局变量
var globalData = fetchData();

// ✅ 模块作用域
(function() {
  const moduleData = fetchData();
  // 使用 moduleData
})();

// ✅ ES6 模块
// data.js
const data = fetchData();
export { data };
```

### 8.2 使用严格模式

```javascript
"use strict";

function test() {
  leak = "value";  // ReferenceError（防止意外全局变量）
}
```

### 8.3 清理资源

```javascript
class Resource {
  constructor() {
    this.data = fetchLargeData();
    this.timers = [];
  }
  
  startTimers() {
    this.timers.push(setInterval(() => {
      console.log(this.data);
    }, 1000));
  }
  
  dispose() {
    // 清理定时器
    this.timers.forEach(clearInterval);
    this.timers = [];
    
    // 清理数据
    this.data = null;
  }
}

// 使用
const resource = new Resource();
resource.startTimers();

// 不再需要时清理
resource.dispose();
```

---

## 关键要点

1. **垃圾回收算法**
   - 标记清除：主流算法
   - 解决循环引用
   - 自动内存管理

2. **V8 GC 策略**
   - 分代收集
   - 新生代：Scavenge
   - 老生代：Mark-Sweep/Compact
   - 增量/并发标记

3. **内存泄漏**
   - 全局变量
   - 遗忘的定时器
   - 未移除的事件监听
   - 闭包引用
   - DOM 引用

4. **弱引用**
   - WeakMap/WeakSet
   - 不阻止 GC
   - 适合缓存

5. **最佳实践**
   - 及时释放引用
   - 清理事件监听
   - 使用对象池
   - 避免全局变量

---

## 深入一点

### GC 的性能影响

```javascript
// Full GC 会暂停 JavaScript 执行
// 典型暂停时间：
// - Scavenge: 1-10ms
// - Mark-Sweep: 10-100ms
// - Mark-Compact: 100-1000ms

// 优化建议：
// 1. 减少对象创建
// 2. 复用对象
// 3. 避免大对象
// 4. 使用对象池
```

### 内存限制

```javascript
// V8 默认内存限制：
// - 64位系统：约 1.4GB
// - 32位系统：约 700MB

// Node.js 调整内存限制：
// node --max-old-space-size=4096 app.js  // 4GB
```

---

## 参考资料

- [V8: Trash talk](https://v8.dev/blog/trash-talk)
- [MDN: Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [4 Types of Memory Leaks in JavaScript](https://auth0.com/blog/four-types-of-leaks-in-your-javascript-code-and-how-to-get-rid-of-them/)

---

**上一章**：[V8 引擎优化](./content-24.md)  
**下一章**：[内存管理与优化](./content-26.md)
