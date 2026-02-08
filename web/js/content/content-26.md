# 内存管理与优化

> 掌握 JavaScript 内存优化的实用技巧

---

## 概述

良好的内存管理是构建高性能应用的关键。本章将从实用角度出发，介绍内存优化的技巧和最佳实践。

本章将深入：
- 内存使用分析
- 常见内存优化技术
- 大数据处理策略
- 前端性能优化
- 实际案例分析

---

## 1. 内存使用分析

### 1.1 测量内存使用

```javascript
// 浏览器环境
if (performance.memory) {
  console.log({
    总内存: performance.memory.jsHeapSizeLimit / 1024 / 1024 + ' MB',
    已用内存: performance.memory.usedJSHeapSize / 1024 / 1024 + ' MB',
    堆大小: performance.memory.totalJSHeapSize / 1024 / 1024 + ' MB'
  });
}

// Node.js 环境
function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    堆使用: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100 + ' MB',
    堆总量: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100 + ' MB',
    RSS: Math.round(used.rss / 1024 / 1024 * 100) / 100 + ' MB',
    外部: Math.round(used.external / 1024 / 1024 * 100) / 100 + ' MB'
  };
}

console.log(getMemoryUsage());
```

### 1.2 内存快照对比

```javascript
// 监控内存增长
class MemoryMonitor {
  constructor() {
    this.baseline = null;
  }
  
  captureBaseline() {
    if (typeof process !== 'undefined') {
      this.baseline = process.memoryUsage().heapUsed;
    }
  }
  
  checkGrowth() {
    if (!this.baseline) return;
    
    const current = process.memoryUsage().heapUsed;
    const growth = current - this.baseline;
    
    console.log(`内存增长: ${Math.round(growth / 1024 / 1024 * 100) / 100} MB`);
    
    if (growth > 50 * 1024 * 1024) {  // 50MB
      console.warn('检测到大量内存增长！');
    }
  }
}

// 使用
const monitor = new MemoryMonitor();
monitor.captureBaseline();

// 执行操作
performOperations();

monitor.checkGrowth();
```

---

## 2. 对象优化

### 2.1 对象池模式

```javascript
// 复用对象，避免频繁创建和销毁
class Vector2DPool {
  constructor(size = 100) {
    this.pool = [];
    this.inUse = new Set();
    
    for (let i = 0; i < size; i++) {
      this.pool.push({ x: 0, y: 0 });
    }
  }
  
  acquire() {
    let vec;
    
    if (this.pool.length > 0) {
      vec = this.pool.pop();
    } else {
      vec = { x: 0, y: 0 };
    }
    
    this.inUse.add(vec);
    return vec;
  }
  
  release(vec) {
    vec.x = 0;
    vec.y = 0;
    this.inUse.delete(vec);
    this.pool.push(vec);
  }
  
  get available() {
    return this.pool.length;
  }
}

// 使用
const pool = new Vector2DPool(50);

function processVectors() {
  const vectors = [];
  
  for (let i = 0; i < 100; i++) {
    const vec = pool.acquire();
    vec.x = Math.random();
    vec.y = Math.random();
    vectors.push(vec);
  }
  
  // 处理完毕，释放回池
  vectors.forEach(vec => pool.release(vec));
}
```

### 2.2 减少对象创建

```javascript
// ❌ 频繁创建对象
function badExample(items) {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    value: item.value * 2
  }));
}

// ✅ 复用数组，原地修改
function goodExample(items) {
  for (let i = 0; i < items.length; i++) {
    items[i].value *= 2;
  }
  return items;
}

// ✅ 如果必须创建新对象，预分配
function betterExample(items) {
  const result = new Array(items.length);
  
  for (let i = 0; i < items.length; i++) {
    result[i] = {
      id: items[i].id,
      name: items[i].name,
      value: items[i].value * 2
    };
  }
  
  return result;
}
```

### 2.3 使用 TypedArray

```javascript
// ❌ 普通数组（每个元素是对象）
const arr1 = new Array(1000000).fill(0);

// ✅ TypedArray（连续内存，更高效）
const arr2 = new Float64Array(1000000);

// 性能对比
console.time('普通数组');
for (let i = 0; i < arr1.length; i++) {
  arr1[i] = i * 1.5;
}
console.timeEnd('普通数组');

console.time('TypedArray');
for (let i = 0; i < arr2.length; i++) {
  arr2[i] = i * 1.5;
}
console.timeEnd('TypedArray');
// TypedArray 更快且占用更少内存
```

---

## 3. 数组优化

### 3.1 预分配大小

```javascript
// ❌ 动态增长
const arr1 = [];
for (let i = 0; i < 100000; i++) {
  arr1.push(i);  // 可能多次重新分配内存
}

// ✅ 预分配
const arr2 = new Array(100000);
for (let i = 0; i < 100000; i++) {
  arr2[i] = i;  // 一次分配
}
```

### 3.2 避免稀疏数组

```javascript
// ❌ 稀疏数组（性能差）
const sparse = [];
sparse[0] = 1;
sparse[10000] = 2;  // 变为字典模式

// ✅ 密集数组
const dense = new Array(10001);
dense[0] = 1;
dense[10000] = 2;
```

### 3.3 数组清空

```javascript
// ✅ 方法1：长度设为0（推荐）
arr.length = 0;

// ✅ 方法2：赋值新数组（如果其他地方没引用）
arr = [];

// ❌ 方法3：splice（慢）
arr.splice(0, arr.length);

// ❌ 方法4：pop循环（最慢）
while (arr.length > 0) {
  arr.pop();
}
```

---

## 4. 字符串优化

### 4.1 字符串拼接

```javascript
// ❌ 循环中拼接（慢，产生大量临时字符串）
let str1 = '';
for (let i = 0; i < 10000; i++) {
  str1 += i;
}

// ✅ 数组join（快）
const parts = [];
for (let i = 0; i < 10000; i++) {
  parts.push(i);
}
const str2 = parts.join('');

// ✅ 模板字符串（适合少量拼接）
const str3 = `Hello ${name}, you are ${age} years old`;
```

### 4.2 字符串缓存

```javascript
// 字符串是不可变的，可以安全缓存
const stringCache = new Map();

function processString(str) {
  if (stringCache.has(str)) {
    return stringCache.get(str);
  }
  
  const result = expensiveStringOperation(str);
  stringCache.set(str, result);
  return result;
}
```

---

## 5. 闭包优化

### 5.1 避免不必要的闭包

```javascript
// ❌ 每次都创建新闭包
class Component {
  render() {
    return items.map(item => {
      return <div onClick={() => this.handleClick(item)}>
        {item.name}
      </div>;
    });
  }
}

// ✅ 复用处理函数
class Component {
  render() {
    return items.map(item => {
      return <div onClick={this.handleClick} data-id={item.id}>
        {item.name}
      </div>;
    });
  }
  
  handleClick = (e) => {
    const id = e.target.dataset.id;
    // 处理点击
  }
}
```

### 5.2 及时解除闭包引用

```javascript
// ❌ 闭包保留大对象
function createHandler() {
  const largeData = fetchLargeData();
  
  return function() {
    console.log('Handler called');
    // largeData 被保留但未使用
  };
}

// ✅ 只保留需要的数据
function createHandler() {
  const largeData = fetchLargeData();
  const needed = largeData.summary;
  
  return function() {
    console.log('Handler called:', needed);
    // 只保留 needed，largeData 可以被回收
  };
}
```

---

## 6. DOM 操作优化

### 6.1 批量操作

```javascript
// ❌ 逐个添加（触发多次重排）
const container = document.getElementById('container');
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  container.appendChild(div);  // 每次都重排
}

// ✅ 使用 DocumentFragment（只触发一次重排）
const container = document.getElementById('container');
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  fragment.appendChild(div);
}

container.appendChild(fragment);  // 一次重排
```

### 6.2 清理 DOM 引用

```javascript
// ❌ 保留 DOM 引用
class Component {
  constructor() {
    this.elements = document.querySelectorAll('.item');
  }
  
  destroy() {
    this.elements.forEach(el => el.remove());
    // elements 仍然引用 DOM，造成内存泄漏
  }
}

// ✅ 清理引用
class Component {
  constructor() {
    this.elements = document.querySelectorAll('.item');
  }
  
  destroy() {
    this.elements.forEach(el => el.remove());
    this.elements = null;  // 清理引用
  }
}
```

### 6.3 虚拟滚动

```javascript
// 只渲染可见区域的元素
class VirtualList {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.startIndex = 0;
    
    this.render();
    this.container.addEventListener('scroll', () => this.handleScroll());
  }
  
  handleScroll() {
    const scrollTop = this.container.scrollTop;
    const newStartIndex = Math.floor(scrollTop / this.itemHeight);
    
    if (newStartIndex !== this.startIndex) {
      this.startIndex = newStartIndex;
      this.render();
    }
  }
  
  render() {
    const endIndex = Math.min(
      this.startIndex + this.visibleCount + 1,
      this.items.length
    );
    
    const fragment = document.createDocumentFragment();
    
    for (let i = this.startIndex; i < endIndex; i++) {
      const div = document.createElement('div');
      div.style.height = `${this.itemHeight}px`;
      div.textContent = this.items[i];
      fragment.appendChild(div);
    }
    
    this.container.innerHTML = '';
    this.container.appendChild(fragment);
    
    // 设置总高度
    this.container.style.height = `${this.items.length * this.itemHeight}px`;
  }
}

// 只渲染可见的元素，大幅减少内存使用
```

---

## 7. 大数据处理

### 7.1 分批处理

```javascript
// 处理大量数据，避免阻塞 UI
async function processBigData(data, batchSize = 1000) {
  const results = [];
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    // 处理批次
    const batchResults = batch.map(processItem);
    results.push(...batchResults);
    
    // 让出控制权，避免阻塞 UI
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
}

// 使用
const largeDataset = new Array(100000).fill(0).map((_, i) => i);
const results = await processBigData(largeDataset);
```

### 7.2 流式处理

```javascript
// 使用 Stream 处理大文件（Node.js）
const fs = require('fs');
const readline = require('readline');

async function processLargeFile(filename) {
  const fileStream = fs.createReadStream(filename);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  for await (const line of rl) {
    // 逐行处理，不加载整个文件到内存
    processLine(line);
  }
}

// 只在内存中保持一行数据
```

### 7.3 Web Worker 卸载计算

```javascript
// main.js
const worker = new Worker('worker.js');

worker.postMessage({
  type: 'process',
  data: largeDataset
});

worker.onmessage = (e) => {
  console.log('处理完成:', e.data);
};

// worker.js
self.onmessage = (e) => {
  if (e.data.type === 'process') {
    const result = heavyComputation(e.data.data);
    self.postMessage(result);
  }
};

function heavyComputation(data) {
  // 耗时计算
  return data.map(x => x * 2);
}

// Worker 在独立线程运行，不阻塞主线程
```

---

## 8. 缓存策略

### 8.1 LRU 缓存

```javascript
// 最近最少使用缓存
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
  
  put(key, value) {
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
}

// 使用
const cache = new LRUCache(100);

function fetchData(id) {
  const cached = cache.get(id);
  if (cached) return cached;
  
  const data = expensiveFetch(id);
  cache.put(id, data);
  return data;
}
```

### 8.2 WeakMap 缓存

```javascript
// 自动清理的缓存
const cache = new WeakMap();

function getData(obj) {
  if (cache.has(obj)) {
    return cache.get(obj);
  }
  
  const data = computeExpensiveData(obj);
  cache.set(obj, data);
  return data;
}

// obj 被回收时，缓存自动清理
```

---

## 9. 实际案例

### 9.1 图片懒加载

```javascript
class LazyImageLoader {
  constructor() {
    this.observer = new IntersectionObserver(
      entries => this.handleIntersection(entries),
      { rootMargin: '50px' }
    );
  }
  
  observe(images) {
    images.forEach(img => {
      this.observer.observe(img);
    });
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        this.observer.unobserve(img);
      }
    });
  }
}

// 使用
const loader = new LazyImageLoader();
const images = document.querySelectorAll('img[data-src]');
loader.observe(images);

// 只加载可见的图片，节省内存
```

### 9.2 无限滚动优化

```javascript
class InfiniteScroll {
  constructor(container, loadMore) {
    this.container = container;
    this.loadMore = loadMore;
    this.loading = false;
    this.maxItems = 1000;  // 限制最大项数
    
    this.container.addEventListener('scroll', () => this.handleScroll());
  }
  
  async handleScroll() {
    if (this.loading) return;
    
    const { scrollTop, scrollHeight, clientHeight } = this.container;
    
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      this.loading = true;
      
      await this.loadMore();
      
      // 删除旧元素，保持在限制内
      this.trimOldItems();
      
      this.loading = false;
    }
  }
  
  trimOldItems() {
    const items = this.container.children;
    
    while (items.length > this.maxItems) {
      items[0].remove();  // 删除最旧的元素
    }
  }
}

// 防止无限增长导致内存问题
```

### 9.3 数据表格优化

```javascript
// 大数据表格（虚拟化）
class VirtualTable {
  constructor(container, data, rowHeight = 40) {
    this.container = container;
    this.data = data;
    this.rowHeight = rowHeight;
    this.visibleRows = Math.ceil(container.clientHeight / rowHeight);
    this.startRow = 0;
    
    this.setupScrollContainer();
    this.render();
    
    this.container.addEventListener('scroll', () => this.handleScroll());
  }
  
  setupScrollContainer() {
    this.container.style.height = `${this.container.clientHeight}px`;
    this.container.style.overflow = 'auto';
    
    // 创建占位符
    const placeholder = document.createElement('div');
    placeholder.style.height = `${this.data.length * this.rowHeight}px`;
    this.container.appendChild(placeholder);
    
    // 创建可见区域
    this.viewport = document.createElement('div');
    this.viewport.style.position = 'absolute';
    this.viewport.style.top = '0';
    this.container.appendChild(this.viewport);
  }
  
  handleScroll() {
    const scrollTop = this.container.scrollTop;
    const newStartRow = Math.floor(scrollTop / this.rowHeight);
    
    if (newStartRow !== this.startRow) {
      this.startRow = newStartRow;
      this.render();
    }
  }
  
  render() {
    const endRow = Math.min(
      this.startRow + this.visibleRows + 1,
      this.data.length
    );
    
    const fragment = document.createDocumentFragment();
    
    for (let i = this.startRow; i < endRow; i++) {
      const row = document.createElement('div');
      row.style.height = `${this.rowHeight}px`;
      row.style.position = 'absolute';
      row.style.top = `${i * this.rowHeight}px`;
      row.textContent = this.data[i].join(', ');
      fragment.appendChild(row);
    }
    
    this.viewport.innerHTML = '';
    this.viewport.appendChild(fragment);
  }
}

// 只渲染可见行，支持百万级数据
```

---

## 关键要点

1. **对象优化**
   - 对象池复用
   - 减少创建
   - 使用 TypedArray

2. **数组优化**
   - 预分配大小
   - 避免稀疏数组
   - 高效清空

3. **字符串优化**
   - 数组 join
   - 字符串缓存
   - 避免循环拼接

4. **DOM 优化**
   - 批量操作
   - 清理引用
   - 虚拟滚动

5. **大数据处理**
   - 分批处理
   - 流式处理
   - Web Worker

6. **缓存策略**
   - LRU 缓存
   - WeakMap 缓存
   - 限制缓存大小

---

## 深入一点

### 内存泄漏检测清单

```javascript
// 1. 检查全局变量
console.log(Object.keys(window).filter(k => !k.startsWith('webkit')));

// 2. 检查事件监听器
getEventListeners(document.body);

// 3. 检查定时器
// 记录所有 setTimeout/setInterval 的 ID
const timers = new Set();
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(...args) {
  const id = originalSetTimeout(...args);
  timers.add(id);
  return id;
};

// 4. 检查 DOM 节点引用
// 使用 Chrome DevTools Memory > Detached DOM tree

// 5. 检查闭包
// 使用 Chrome DevTools Memory > Heap Snapshot
```

### 性能预算

```javascript
// 设置性能预算
const PERFORMANCE_BUDGET = {
  maxMemory: 50 * 1024 * 1024,  // 50MB
  maxDOMNodes: 1000,
  maxEventListeners: 100
};

function checkPerformance() {
  if (performance.memory) {
    const used = performance.memory.usedJSHeapSize;
    if (used > PERFORMANCE_BUDGET.maxMemory) {
      console.warn('超出内存预算！');
    }
  }
  
  const domNodes = document.querySelectorAll('*').length;
  if (domNodes > PERFORMANCE_BUDGET.maxDOMNodes) {
    console.warn('DOM 节点过多！');
  }
}
```

---

## 参考资料

- [Web Performance Working Group](https://www.w3.org/webperf/)
- [JavaScript Memory Profiling](https://developer.chrome.com/docs/devtools/memory-problems/)
- [Fix Memory Problems](https://web.dev/memory/)

---

**上一章**：[垃圾回收机制](./content-25.md)  
**下一章**：[浏览器对象模型 BOM](./content-27.md)
