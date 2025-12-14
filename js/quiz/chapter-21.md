# 第 21 章：内存管理与垃圾回收 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 垃圾回收基础

### 题目

JavaScript 主要使用哪种垃圾回收算法？

**选项：**
- A. 引用计数
- B. 标记清除
- C. 分代回收
- D. 增量标记

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**标记清除（Mark-and-Sweep）**

这是 JavaScript 主要的垃圾回收算法。

**工作原理：**
```
1. 标记阶段（Mark）
   - 从根对象（全局对象、执行栈）开始
   - 递归标记所有可达对象

2. 清除阶段（Sweep）
   - 遍历堆中所有对象
   - 清除未被标记的对象
```

**示例：**
```javascript
// 可达对象（不会被回收）
let obj1 = { name: 'Alice' };
let obj2 = { ref: obj1 };

// 不可达对象（会被回收）
let obj3 = { name: 'Bob' };
obj3 = null;  // 失去引用，变为垃圾
```

**其他算法：**

**A. 引用计数（已废弃）**
```javascript
// 问题：循环引用无法回收
function problem() {
  const obj1 = {};
  const obj2 = {};
  
  obj1.ref = obj2;
  obj2.ref = obj1;
  
  // 函数结束，obj1 和 obj2 互相引用
  // 引用计数不为 0，无法回收
}
```

**C. 分代回收（V8 实现）**
```
新生代（Young Generation）
  - 存活时间短的对象
  - Scavenge 算法

老生代（Old Generation）
  - 存活时间长的对象
  - Mark-Sweep + Mark-Compact
```

**D. 增量标记（优化技术）**
```
将标记过程分成多个小步骤
避免长时间阻塞主线程
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 内存泄漏

### 题目

以下哪种情况会导致内存泄漏？

**选项：**
- A. 忘记清除定时器
- B. 使用闭包
- C. 使用 let 声明变量
- D. 使用 Promise

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**常见内存泄漏场景**

**A. 未清除的定时器**
```javascript
// ❌ 内存泄漏
function leak() {
  const data = new Array(1000000).fill('leak');
  
  setInterval(() => {
    console.log(data[0]);
  }, 1000);
  
  // 定时器未清除，data 无法被回收
}

// ✅ 正确做法
function noLeak() {
  const data = new Array(1000000).fill('data');
  
  const timer = setInterval(() => {
    console.log(data[0]);
  }, 1000);
  
  // 清除定时器
  return () => clearInterval(timer);
}

const cleanup = noLeak();
// 使用完毕后
cleanup();
```

**B. 闭包不一定泄漏**
```javascript
// ✅ 正常使用
function createCounter() {
  let count = 0;
  return () => ++count;
}

const counter = createCounter();
counter();  // 1
counter = null;  // 释放引用，可以被回收
```

**其他泄漏场景：**

**1. DOM 引用**
```javascript
// ❌ 泄漏
const elements = [];
document.querySelectorAll('button').forEach(btn => {
  elements.push(btn);
  btn.onclick = () => console.log('clicked');
});

// DOM 元素被移除，但 elements 仍持有引用
```

**2. 全局变量**
```javascript
// ❌ 意外的全局变量
function leak() {
  data = new Array(1000000);  // 忘记 var/let/const
}

// data 变成全局变量，永远不会被回收
```

**3. 事件监听器**
```javascript
// ❌ 未移除监听器
element.addEventListener('click', handler);
element.remove();  // 元素移除，但监听器仍存在

// ✅ 正确做法
element.removeEventListener('click', handler);
element.remove();
```

**4. 闭包引用大对象**
```javascript
// ❌ 泄漏
function outer() {
  const largeData = new Array(1000000);
  
  return function() {
    console.log('Hello');
    // 闭包引用了整个作用域，包括 largeData
  };
}

// ✅ 优化
function outer() {
  const largeData = new Array(1000000);
  const needed = largeData[0];  // 只保留需要的
  
  return function() {
    console.log(needed);  // 只引用 needed
  };
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** WeakMap/WeakSet

### 题目

WeakMap 的键必须是对象，不能是基本类型。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**WeakMap 的特点**

```javascript
const wm = new WeakMap();

// ✅ 对象作为键
const obj = {};
wm.set(obj, 'value');

// ❌ 基本类型不能作为键
wm.set(1, 'value');      // TypeError
wm.set('key', 'value');  // TypeError
wm.set(true, 'value');   // TypeError
wm.set(Symbol(), 'value'); // TypeError
```

**WeakMap vs Map**

| 特性 | Map | WeakMap |
|------|-----|---------|
| 键类型 | 任意 | 只能是对象 |
| 可枚举 | ✅ | ❌ |
| 垃圾回收 | 强引用 | 弱引用 |
| size 属性 | ✅ | ❌ |

**弱引用的优势：**
```javascript
// Map：强引用，无法回收
const map = new Map();
let obj = { data: 'large' };
map.set(obj, 'metadata');
obj = null;  // obj 仍被 map 引用，无法回收

// WeakMap：弱引用，可以回收
const wm = new WeakMap();
let obj2 = { data: 'large' };
wm.set(obj2, 'metadata');
obj2 = null;  // obj2 可以被回收
```

**实际应用：**

**1. 私有数据**
```javascript
const privateData = new WeakMap();

class MyClass {
  constructor() {
    privateData.set(this, {
      secret: 'private'
    });
  }
  
  getSecret() {
    return privateData.get(this).secret;
  }
}

const instance = new MyClass();
console.log(instance.getSecret());  // "private"
// instance 被回收时，privateData 中的数据也会被回收
```

**2. DOM 元素关联数据**
```javascript
const metadata = new WeakMap();

function attachMetadata(element, data) {
  metadata.set(element, data);
}

const div = document.createElement('div');
attachMetadata(div, { id: 123 });

// div 被移除后，metadata 自动清理
```

**WeakSet 同理：**
```javascript
const ws = new WeakSet();

// ✅ 对象
const obj = {};
ws.add(obj);

// ❌ 基本类型
ws.add(1);  // TypeError
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 内存分配

### 题目

以下代码中，哪些对象会被分配到栈上，哪些在堆上？

```javascript
function test() {
  const num = 42;
  const str = 'hello';
  const obj = { x: 1 };
  const arr = [1, 2, 3];
}
```

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**栈 vs 堆**

```javascript
function test() {
  // 栈：基本类型
  const num = 42;           // 栈
  const str = 'hello';      // 栈（短字符串）
  
  // 堆：对象类型
  const obj = { x: 1 };     // 堆（引用在栈）
  const arr = [1, 2, 3];    // 堆（引用在栈）
}
```

**内存布局：**
```
栈（Stack）:
  num:  42
  str:  'hello'
  obj:  0x001  → 指向堆
  arr:  0x002  → 指向堆

堆（Heap）:
  0x001: { x: 1 }
  0x002: [1, 2, 3]
```

**详细说明：**

**栈内存：**
- 基本类型值
- 引用类型的引用
- 函数调用栈
- 自动管理，速度快

**堆内存：**
- 对象、数组、函数
- 需要垃圾回收
- 手动管理，速度慢

**示例：**
```javascript
// 基本类型：栈
let a = 10;
let b = a;  // 复制值
b = 20;
console.log(a);  // 10（互不影响）

// 引用类型：堆
let obj1 = { x: 1 };
let obj2 = obj1;  // 复制引用
obj2.x = 2;
console.log(obj1.x);  // 2（共享同一对象）
```

**字符串的特殊情况：**
```javascript
// 短字符串：可能在栈或字符串池
const short = 'hi';

// 长字符串：堆
const long = 'a'.repeat(10000);

// 字符串是不可变的
let str = 'hello';
str[0] = 'H';  // 无效
console.log(str);  // "hello"
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 分代回收

### 题目

V8 的分代回收机制是如何工作的？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**V8 分代回收**

```
内存分代：
┌─────────────────────────────────┐
│      新生代（Young Generation）    │
│  - 1~8MB                         │
│  - 生命周期短                     │
│  - Scavenge 算法                 │
│  - From Space + To Space        │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│      老生代（Old Generation）      │
│  - 较大空间                       │
│  - 生命周期长                     │
│  - Mark-Sweep + Mark-Compact    │
└─────────────────────────────────┘
```

**新生代 - Scavenge 算法：**

```
1. 初始状态
   From Space: [A, B, C, D]
   To Space:   []

2. GC 触发
   - 检查 From Space 中的对象
   - 将存活对象复制到 To Space
   
   From Space: [A, B, C(✗), D]  // C 已死
   To Space:   [A, B, D]

3. 交换空间
   From Space: [A, B, D]
   To Space:   []

4. 晋升条件
   - 经过两次 GC 仍存活
   - To Space 使用超过 25%
   
   → 晋升到老生代
```

**代码示例：**
```javascript
// 新生代对象（短期）
function createTemp() {
  const temp = { data: new Array(1000) };
  // 使用完立即丢弃
  return temp.data[0];
}

// 老生代对象（长期）
const cache = new Map();
function getData(key) {
  if (!cache.has(key)) {
    cache.set(key, loadData(key));
  }
  return cache.get(key);
}
// cache 长期存活，会晋升到老生代
```

**老生代 - Mark-Sweep：**
```javascript
// 1. 标记阶段
function mark(root) {
  if (root.marked) return;
  root.marked = true;
  
  for (const child of root.children) {
    mark(child);
  }
}

// 2. 清除阶段
function sweep(heap) {
  for (const obj of heap) {
    if (!obj.marked) {
      free(obj);  // 回收内存
    } else {
      obj.marked = false;  // 重置标记
    }
  }
}
```

**Mark-Compact（整理）：**
```
碎片整理：
Before: [A, _, B, _, _, C]  // _ 是空闲空间
After:  [A, B, C, _, _, _]  // 紧凑排列
```

**增量标记（Incremental Marking）：**
```javascript
// 传统标记：阻塞
function fullMark() {
  // 标记所有对象（可能需要 100ms）
  // 主线程阻塞
}

// 增量标记：分步
function incrementalMark() {
  // 标记一部分对象（5ms）
  // 让出主线程
  setTimeout(incrementalMark, 0);
  // 继续标记下一部分
}
```

**性能优化建议：**
```javascript
// ✅ 对象池（避免频繁创建）
class ObjectPool {
  constructor() {
    this.pool = [];
  }
  
  acquire() {
    return this.pool.pop() || {};
  }
  
  release(obj) {
    Object.keys(obj).forEach(key => delete obj[key]);
    this.pool.push(obj);
  }
}

// ✅ 避免创建大量临时对象
// ❌ 差
function process(items) {
  return items.map(item => ({ ...item, processed: true }));
}

// ✅ 好
function process(items) {
  for (let i = 0; i < items.length; i++) {
    items[i].processed = true;
  }
  return items;
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** 内存泄漏检测

### 题目

如何检测和定位 JavaScript 内存泄漏？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**检测内存泄漏的方法**

**1. Chrome DevTools**

```javascript
// 使用 Memory Profiler
// 1. 打开 DevTools → Memory
// 2. 拍摄堆快照（Heap Snapshot）
// 3. 执行操作
// 4. 再次拍摄快照
// 5. 对比两次快照

// 查找：
// - Detached DOM nodes（分离的 DOM 节点）
// - Shallow Size 大的对象
// - Retained Size 大的对象
```

**2. Performance Monitor**
```javascript
// 实时监控
if (performance.memory) {
  setInterval(() => {
    const used = performance.memory.usedJSHeapSize;
    const total = performance.memory.totalJSHeapSize;
    console.log(`Used: ${(used / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Total: ${(total / 1024 / 1024).toFixed(2)}MB`);
  }, 1000);
}
```

**3. 手动检测代码**
```javascript
class MemoryLeakDetector {
  constructor() {
    this.snapshots = [];
  }
  
  takeSnapshot() {
    if (performance.memory) {
      this.snapshots.push({
        time: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize
      });
    }
  }
  
  analyze() {
    if (this.snapshots.length < 2) return;
    
    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    
    const growth = last.used - first.used;
    const rate = growth / (last.time - first.time) * 1000;  // 每秒
    
    console.log(`Memory growth: ${(growth / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Growth rate: ${(rate / 1024).toFixed(2)}KB/s`);
    
    if (rate > 100 * 1024) {  // 超过 100KB/s
      console.warn('Potential memory leak detected!');
    }
  }
}

// 使用
const detector = new MemoryLeakDetector();

setInterval(() => {
  detector.takeSnapshot();
  detector.analyze();
}, 5000);
```

**4. 常见泄漏模式检测**
```javascript
// 检测未清除的定时器
const timers = new Set();

const originalSetInterval = window.setInterval;
window.setInterval = function(...args) {
  const id = originalSetInterval.apply(this, args);
  timers.add(id);
  return id;
};

const originalClearInterval = window.clearInterval;
window.clearInterval = function(id) {
  timers.delete(id);
  return originalClearInterval.call(this, id);
};

// 定期检查
setInterval(() => {
  console.log(`Active timers: ${timers.size}`);
  if (timers.size > 10) {
    console.warn('Too many active timers!');
  }
}, 10000);
```

**5. 事件监听器追踪**
```javascript
class EventListenerTracker {
  constructor() {
    this.listeners = new WeakMap();
    this.patchEventTarget();
  }
  
  patchEventTarget() {
    const original = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (!this._listeners) {
        this._listeners = new Map();
      }
      
      if (!this._listeners.has(type)) {
        this._listeners.set(type, new Set());
      }
      
      this._listeners.get(type).add(listener);
      
      return original.call(this, type, listener, options);
    };
  }
  
  getListeners(element) {
    return element._listeners || new Map();
  }
  
  report() {
    const elements = document.querySelectorAll('*');
    let total = 0;
    
    elements.forEach(el => {
      const listeners = this.getListeners(el);
      listeners.forEach(set => {
        total += set.size;
      });
    });
    
    console.log(`Total event listeners: ${total}`);
  }
}

const tracker = new EventListenerTracker();
setInterval(() => tracker.report(), 10000);
```

**6. 自动化测试**
```javascript
// 使用 Puppeteer
const puppeteer = require('puppeteer');

async function detectMemoryLeak() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  
  // 初始快照
  const metrics1 = await page.metrics();
  console.log('Initial:', metrics1.JSHeapUsedSize);
  
  // 执行操作
  for (let i = 0; i < 100; i++) {
    await page.click('#button');
    await page.waitForTimeout(100);
  }
  
  // 强制 GC
  await page.evaluate(() => {
    if (global.gc) global.gc();
  });
  
  // 最终快照
  const metrics2 = await page.metrics();
  console.log('Final:', metrics2.JSHeapUsedSize);
  
  const growth = metrics2.JSHeapUsedSize - metrics1.JSHeapUsedSize;
  console.log(`Growth: ${(growth / 1024 / 1024).toFixed(2)}MB`);
  
  if (growth > 10 * 1024 * 1024) {  // 超过 10MB
    console.error('Memory leak detected!');
  }
  
  await browser.close();
}
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 内存优化

### 题目

以下哪些是有效的内存优化策略？

**选项：**
- A. 使用对象池
- B. 及时解除引用
- C. 避免创建大量临时对象
- D. 使用 WeakMap 存储元数据

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**A. 对象池**
```javascript
class ObjectPool {
  constructor(factory, reset, initialSize = 10) {
    this.factory = factory;
    this.reset = reset;
    this.pool = [];
    
    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }
  
  acquire() {
    return this.pool.length > 0 
      ? this.pool.pop() 
      : this.factory();
  }
  
  release(obj) {
    this.reset(obj);
    this.pool.push(obj);
  }
}

// 使用
const vectorPool = new ObjectPool(
  () => ({ x: 0, y: 0 }),
  (v) => { v.x = 0; v.y = 0; }
);

function process() {
  const v = vectorPool.acquire();
  v.x = 10;
  v.y = 20;
  // 使用 v
  vectorPool.release(v);
}
```

**B. 及时解除引用**
```javascript
// ✅ 正确
class Cache {
  constructor() {
    this.data = new Map();
  }
  
  clear() {
    this.data.clear();  // 清除所有引用
    this.data = null;   // 解除 Map 引用
  }
}

// ✅ 定时器清理
const timerId = setInterval(() => {}, 1000);
clearInterval(timerId);

// ✅ 事件监听器清理
element.addEventListener('click', handler);
element.removeEventListener('click', handler);

// ✅ DOM 引用清理
let element = document.querySelector('#app');
// 使用完毕
element = null;
```

**C. 避免临时对象**
```javascript
// ❌ 创建大量临时对象
function badProcess(items) {
  return items
    .map(item => ({ ...item }))      // 临时对象 1
    .filter(item => item.active)     // 临时数组
    .map(item => ({ ...item, processed: true })); // 临时对象 2
}

// ✅ 减少临时对象
function goodProcess(items) {
  const result = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.active) {
      item.processed = true;
      result.push(item);
    }
  }
  
  return result;
}

// ✅ 字符串拼接优化
// ❌ 差
let str = '';
for (let i = 0; i < 10000; i++) {
  str += i;  // 每次创建新字符串
}

// ✅ 好
const parts = [];
for (let i = 0; i < 10000; i++) {
  parts.push(i);
}
const str = parts.join('');
```

**D. WeakMap 存储元数据**
```javascript
// ✅ 使用 WeakMap
const metadata = new WeakMap();

class Component {
  constructor(element) {
    this.element = element;
    
    // 元数据不阻止 element 被回收
    metadata.set(element, {
      created: Date.now(),
      updates: 0
    });
  }
  
  destroy() {
    this.element.remove();
    this.element = null;
    // metadata 会自动清理
  }
}

// ❌ 使用 Map（会导致内存泄漏）
const badMetadata = new Map();

class BadComponent {
  constructor(element) {
    this.element = element;
    // element 无法被回收
    badMetadata.set(element, {});
  }
}
```

**其他优化策略：**

**1. 懒加载**
```javascript
class LazyData {
  constructor() {
    this._data = null;
  }
  
  get data() {
    if (!this._data) {
      this._data = loadLargeData();
    }
    return this._data;
  }
}
```

**2. 虚拟滚动**
```javascript
// 只渲染可见项
class VirtualList {
  constructor(items, itemHeight) {
    this.items = items;
    this.itemHeight = itemHeight;
  }
  
  getVisibleItems(scrollTop, viewportHeight) {
    const start = Math.floor(scrollTop / this.itemHeight);
    const end = Math.ceil((scrollTop + viewportHeight) / this.itemHeight);
    
    return this.items.slice(start, end);
  }
}
```

**3. 分片处理**
```javascript
async function processLargeData(data) {
  const chunkSize = 1000;
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await processChunk(chunk);
    
    // 让出主线程
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** LRU 缓存

### 题目

实现一个具有自动内存管理的 LRU（最近最少使用）缓存。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // 移到最后（最近使用）
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  set(key, value) {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // 添加到最后
    this.cache.set(key, value);
    
    // 超出容量，删除最旧的（第一个）
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  has(key) {
    return this.cache.has(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  get size() {
    return this.cache.size;
  }
}

// 使用
const cache = new LRUCache(3);

cache.set('a', 1);
cache.set('b', 2);
cache.set('c', 3);

console.log(cache.get('a'));  // 1（a 移到最后）

cache.set('d', 4);  // b 被淘汰（最久未使用）

console.log(cache.has('b'));  // false
console.log(cache.has('a'));  // true
```

**扩展：带过期时间的 LRU**
```javascript
class LRUCacheWithTTL {
  constructor(capacity, defaultTTL = 60000) {
    this.capacity = capacity;
    this.defaultTTL = defaultTTL;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    const item = this.cache.get(key);
    
    // 检查是否过期
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }
    
    // 更新访问时间
    item.lastAccess = Date.now();
    
    // 移到最后
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.value;
  }
  
  set(key, value, ttl = this.defaultTTL) {
    const item = {
      value,
      expires: Date.now() + ttl,
      lastAccess: Date.now()
    };
    
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    this.cache.set(key, item);
    
    // 清理过期项
    this.cleanup();
    
    // 超出容量
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  cleanup() {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
  
  startAutoCleanup(interval = 60000) {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, interval);
  }
  
  stopAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

// 使用
const cache = new LRUCacheWithTTL(100, 5000);
cache.startAutoCleanup(10000);

cache.set('key', 'value', 5000);  // 5 秒后过期

setTimeout(() => {
  console.log(cache.get('key'));  // undefined（已过期）
}, 6000);
```

**扩展：支持权重的 LRU**
```javascript
class WeightedLRUCache {
  constructor(maxWeight) {
    this.maxWeight = maxWeight;
    this.currentWeight = 0;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    const item = this.cache.get(key);
    
    // 移到最后
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.value;
  }
  
  set(key, value, weight = 1) {
    // 删除旧项
    if (this.cache.has(key)) {
      const oldItem = this.cache.get(key);
      this.currentWeight -= oldItem.weight;
      this.cache.delete(key);
    }
    
    // 腾出空间
    while (this.currentWeight + weight > this.maxWeight && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value;
      const firstItem = this.cache.get(firstKey);
      this.currentWeight -= firstItem.weight;
      this.cache.delete(firstKey);
    }
    
    // 添加新项
    if (weight <= this.maxWeight) {
      this.cache.set(key, { value, weight });
      this.currentWeight += weight;
    }
  }
  
  getStats() {
    return {
      size: this.cache.size,
      weight: this.currentWeight,
      maxWeight: this.maxWeight,
      utilization: (this.currentWeight / this.maxWeight * 100).toFixed(2) + '%'
    };
  }
}

// 使用
const cache = new WeightedLRUCache(100);

cache.set('small', 'data', 10);   // 权重 10
cache.set('large', 'data', 50);   // 权重 50

console.log(cache.getStats());
// { size: 2, weight: 60, maxWeight: 100, utilization: '60.00%' }
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** 循环引用

### 题目

如何检测和处理对象之间的循环引用？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**检测循环引用**

```javascript
function hasCycle(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }
  
  if (seen.has(obj)) {
    return true;  // 发现循环
  }
  
  seen.add(obj);
  
  for (const key in obj) {
    if (hasCycle(obj[key], seen)) {
      return true;
    }
  }
  
  return false;
}

// 测试
const obj1 = { name: 'obj1' };
const obj2 = { name: 'obj2' };

obj1.ref = obj2;
obj2.ref = obj1;  // 循环引用

console.log(hasCycle(obj1));  // true
```

**深拷贝（处理循环引用）**

```javascript
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 检查是否已克隆
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
  // 创建新对象
  const clone = Array.isArray(obj) ? [] : {};
  
  // 记录映射
  hash.set(obj, clone);
  
  // 递归克隆
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], hash);
    }
  }
  
  return clone;
}

// 测试
const original = { name: 'obj' };
original.self = original;  // 自引用

const cloned = deepClone(original);
console.log(cloned.self === cloned);  // true
console.log(cloned !== original);     // true
```

**JSON 序列化（检测循环）**

```javascript
function safeStringify(obj, indent = 2) {
  const seen = new WeakSet();
  
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }, indent);
}

// 测试
const obj = { name: 'test' };
obj.self = obj;

console.log(safeStringify(obj));
// {
//   "name": "test",
//   "self": "[Circular]"
// }
```

**解除循环引用**

```javascript
function breakCycles(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') {
    return;
  }
  
  if (seen.has(obj)) {
    return;  // 已访问，跳过
  }
  
  seen.add(obj);
  
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        obj[key] = null;  // 解除循环引用
      } else {
        breakCycles(value, seen);
      }
    }
  }
}

// 测试
const obj1 = { name: 'obj1' };
const obj2 = { name: 'obj2' };

obj1.ref = obj2;
obj2.ref = obj1;

breakCycles(obj1);

console.log(obj1.ref.ref);  // null（循环被打破）
```

**实际应用：组件销毁**

```javascript
class Component {
  constructor() {
    this.children = [];
    this.parent = null;
  }
  
  addChild(child) {
    this.children.push(child);
    child.parent = this;
  }
  
  destroy() {
    // 1. 解除父引用
    if (this.parent) {
      const index = this.parent.children.indexOf(this);
      if (index > -1) {
        this.parent.children.splice(index, 1);
      }
      this.parent = null;
    }
    
    // 2. 销毁子组件
    this.children.forEach(child => child.destroy());
    this.children = [];
    
    // 3. 清理其他引用
    this.cleanup();
  }
  
  cleanup() {
    // 清理事件监听器、定时器等
  }
}
```

**检测工具**

```javascript
class CycleDetector {
  static detect(obj, path = []) {
    const results = [];
    
    function traverse(current, currentPath) {
      if (current === null || typeof current !== 'object') {
        return;
      }
      
      // 检查循环
      const cycleIndex = currentPath.indexOf(current);
      if (cycleIndex !== -1) {
        results.push({
          cycle: currentPath.slice(cycleIndex).map(o => o.name || 'unnamed'),
          path: currentPath.map(o => o.name || 'unnamed')
        });
        return;
      }
      
      currentPath.push(current);
      
      for (const key in current) {
        traverse(current[key], [...currentPath]);
      }
    }
    
    traverse(obj, path);
    return results;
  }
  
  static report(obj) {
    const cycles = this.detect(obj);
    
    if (cycles.length === 0) {
      console.log('No cycles detected');
      return;
    }
    
    console.log(`Found ${cycles.length} cycle(s):`);
    cycles.forEach((cycle, i) => {
      console.log(`${i + 1}. ${cycle.path.join(' → ')}`);
    });
  }
}

// 使用
const obj = { name: 'root' };
obj.child = { name: 'child', parent: obj };

CycleDetector.report(obj);
// Found 1 cycle(s):
// 1. root → child → root
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 内存管理实践

### 题目

实现一个内存监控和管理系统。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
class MemoryManager {
  constructor(options = {}) {
    this.options = {
      warningThreshold: options.warningThreshold || 0.8,  // 80%
      criticalThreshold: options.criticalThreshold || 0.9, // 90%
      checkInterval: options.checkInterval || 5000,
      maxCacheSize: options.maxCacheSize || 100,
      ...options
    };
    
    this.caches = new Map();
    this.timers = new Set();
    this.listeners = new Map();
    this.checkTimer = null;
    
    this.startMonitoring();
  }
  
  // 监控内存
  startMonitoring() {
    this.checkTimer = setInterval(() => {
      this.checkMemory();
    }, this.options.checkInterval);
  }
  
  stopMonitoring() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }
  
  checkMemory() {
    if (!performance.memory) {
      return;
    }
    
    const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
    const usage = usedJSHeapSize / jsHeapSizeLimit;
    
    console.log(`Memory usage: ${(usage * 100).toFixed(2)}%`);
    
    if (usage >= this.options.criticalThreshold) {
      console.error('Critical memory usage!');
      this.handleCriticalMemory();
    } else if (usage >= this.options.warningThreshold) {
      console.warn('High memory usage!');
      this.handleWarning();
    }
  }
  
  handleWarning() {
    // 清理缓存
    this.caches.forEach((cache, name) => {
      if (cache.size > this.options.maxCacheSize / 2) {
        const toDelete = cache.size - this.options.maxCacheSize / 2;
        let deleted = 0;
        
        for (const key of cache.keys()) {
          if (deleted >= toDelete) break;
          cache.delete(key);
          deleted++;
        }
        
        console.log(`Cleaned ${deleted} items from cache: ${name}`);
      }
    });
  }
  
  handleCriticalMemory() {
    // 清理所有缓存
    this.caches.forEach((cache, name) => {
      const size = cache.size;
      cache.clear();
      console.log(`Cleared cache: ${name} (${size} items)`);
    });
    
    // 清理定时器
    this.timers.forEach(timer => {
      clearInterval(timer);
      clearTimeout(timer);
    });
    this.timers.clear();
    
    // 触发垃圾回收（如果可用）
    if (global.gc) {
      console.log('Triggering GC...');
      global.gc();
    }
  }
  
  // 注册缓存
  registerCache(name, cache) {
    this.caches.set(name, cache);
  }
  
  unregisterCache(name) {
    this.caches.delete(name);
  }
  
  // 注册定时器
  registerTimer(timer) {
    this.timers.add(timer);
    return timer;
  }
  
  unregisterTimer(timer) {
    this.timers.delete(timer);
  }
  
  // 注册事件监听器
  registerListener(element, type, listener) {
    const key = `${element}_${type}`;
    
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key).add(listener);
    element.addEventListener(type, listener);
  }
  
  unregisterListener(element, type, listener) {
    const key = `${element}_${type}`;
    const listeners = this.listeners.get(key);
    
    if (listeners) {
      listeners.delete(listener);
      element.removeEventListener(type, listener);
    }
  }
  
  // 清理所有资源
  cleanup() {
    this.stopMonitoring();
    
    // 清理缓存
    this.caches.forEach(cache => cache.clear());
    this.caches.clear();
    
    // 清理定时器
    this.timers.forEach(timer => {
      clearInterval(timer);
      clearTimeout(timer);
    });
    this.timers.clear();
    
    // 清理监听器
    this.listeners.forEach((listeners, key) => {
      const [element, type] = key.split('_');
      listeners.forEach(listener => {
        element.removeEventListener(type, listener);
      });
    });
    this.listeners.clear();
  }
  
  // 获取统计信息
  getStats() {
    const stats = {
      caches: {},
      timers: this.timers.size,
      listeners: 0
    };
    
    this.caches.forEach((cache, name) => {
      stats.caches[name] = cache.size;
    });
    
    this.listeners.forEach(listeners => {
      stats.listeners += listeners.size;
    });
    
    if (performance.memory) {
      const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
      stats.memory = {
        used: (usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
        limit: (jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB',
        usage: ((usedJSHeapSize / jsHeapSizeLimit) * 100).toFixed(2) + '%'
      };
    }
    
    return stats;
  }
}

// 使用示例
const memoryManager = new MemoryManager({
  warningThreshold: 0.7,
  criticalThreshold: 0.9,
  checkInterval: 3000
});

// 注册缓存
const cache = new Map();
memoryManager.registerCache('dataCache', cache);

// 注册定时器
const timer = memoryManager.registerTimer(
  setInterval(() => {
    // 定时任务
  }, 1000)
);

// 注册事件监听器
const button = document.querySelector('#button');
const handler = () => console.log('clicked');
memoryManager.registerListener(button, 'click', handler);

// 查看统计
console.log(memoryManager.getStats());

// 清理
memoryManager.cleanup();
```

</details>

---

**本章总结：**
- ✅ 垃圾回收算法
- ✅ 内存泄漏场景
- ✅ WeakMap/WeakSet
- ✅ 栈 vs 堆
- ✅ 分代回收机制
- ✅ 内存泄漏检测
- ✅ 内存优化策略
- ✅ LRU 缓存实现
- ✅ 循环引用处理
- ✅ 内存管理系统

**下一章：** [第 22 章：V8 引擎优化](./chapter-22.md)
