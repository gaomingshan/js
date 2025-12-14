# 性能优化指南

## 概述

性能优化是前端开发的重要环节，直接影响用户体验和应用质量。

---

## 一、代码层面优化

### 1.1 避免不必要的计算

```js
// ❌ 每次都计算
function render(items) {
  for (let i = 0; i < items.length; i++) {
    const len = items.length;  // 重复计算
    // ...
  }
}

// ✅ 缓存计算结果
function render(items) {
  const len = items.length;
  for (let i = 0; i < len; i++) {
    // ...
  }
}
```

### 1.2 使用高效的数据结构

```js
// ❌ 数组查找（O(n)）
const arr = [1, 2, 3, 4, 5];
arr.includes(3);  // 需要遍历

// ✅ Set 查找（O(1)）
const set = new Set([1, 2, 3, 4, 5]);
set.has(3);  // 直接查找

// ❌ 对象键值查找（可能慢）
const obj = {};
for (const item of items) {
  obj[item.id] = item;
}

// ✅ Map 更适合动态键值对
const map = new Map();
for (const item of items) {
  map.set(item.id, item);
}
```

### 1.3 避免内存泄漏

```js
// ❌ 未清理的事件监听器
element.addEventListener('click', handler);

// ✅ 记得移除
element.removeEventListener('click', handler);

// ❌ 未清理的定时器
const timer = setInterval(() => {}, 1000);

// ✅ 清理定时器
clearInterval(timer);

// ✅ 使用 WeakMap/WeakSet
const cache = new WeakMap();
cache.set(obj, data);  // obj 被垃圾回收时，data 也会被清理
```

---

## 二、DOM 操作优化

### 2.1 减少 DOM 操作

```js
// ❌ 多次操作 DOM
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  container.appendChild(div);
}

// ✅ 批量操作
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  fragment.appendChild(div);
}
container.appendChild(fragment);
```

### 2.2 避免强制同步布局

```js
// ❌ 导致回流
element.style.width = '100px';
const width = element.offsetWidth;  // 强制回流
element.style.height = '100px';

// ✅ 批量读取，批量写入
const width = element.offsetWidth;
const height = element.offsetHeight;

element.style.width = '100px';
element.style.height = '100px';
```

### 2.3 使用事件委托

```js
// ❌ 为每个元素添加监听器
items.forEach(item => {
  item.addEventListener('click', handler);
});

// ✅ 事件委托
container.addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handler(e);
  }
});
```

---

## 三、函数优化

### 3.1 防抖（Debounce）

限制函数执行频率，只在最后一次调用后执行。

```js
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 使用场景：搜索输入
const search = debounce((query) => {
  console.log('搜索:', query);
}, 300);

input.addEventListener('input', (e) => {
  search(e.target.value);
});
```

### 3.2 节流（Throttle）

限制函数执行频率，在指定时间内只执行一次。

```js
function throttle(fn, delay) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

// 使用场景：滚动事件
const handleScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY);
}, 100);

window.addEventListener('scroll', handleScroll);
```

### 3.3 记忆化（Memoization）

缓存函数结果，避免重复计算。

```js
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 使用场景：昂贵的计算
const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(40);  // 第一次计算
fibonacci(40);  // 从缓存返回
```

---

## 四、加载优化

### 4.1 代码分割（Code Splitting）

```js
// 动态导入
const loadModule = async () => {
  const module = await import('./heavy-module.js');
  module.init();
};

// 路由懒加载
const routes = [
  {
    path: '/home',
    component: () => import('./Home.vue')
  },
  {
    path: '/about',
    component: () => import('./About.vue')
  }
];
```

### 4.2 懒加载（Lazy Loading）

```js
// 图片懒加载
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```

### 4.3 预加载和预取

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="critical.js" as="script">

<!-- 预取下一页资源 -->
<link rel="prefetch" href="next-page.js">

<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">
```

---

## 五、运行时优化

### 5.1 使用 requestAnimationFrame

```js
// ❌ 直接操作可能卡顿
function animate() {
  element.style.left = position + 'px';
  position += 5;
}
setInterval(animate, 16);

// ✅ 使用 requestAnimationFrame
function animate() {
  element.style.left = position + 'px';
  position += 5;
  if (position < 500) {
    requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);
```

### 5.2 Web Workers

```js
// main.js
const worker = new Worker('worker.js');

worker.postMessage({ data: largeArray });

worker.onmessage = (e) => {
  console.log('计算结果:', e.data);
};

// worker.js
onmessage = (e) => {
  const result = heavyComputation(e.data.data);
  postMessage(result);
};
```

### 5.3 虚拟滚动

```js
// 只渲染可见区域的元素
class VirtualScroll {
  constructor(items, itemHeight, containerHeight) {
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(containerHeight / itemHeight);
    this.startIndex = 0;
  }

  getVisibleItems() {
    return this.items.slice(
      this.startIndex,
      this.startIndex + this.visibleCount
    );
  }

  onScroll(scrollTop) {
    this.startIndex = Math.floor(scrollTop / this.itemHeight);
  }
}
```

---

## 六、网络优化

### 6.1 减少请求数量

```js
// ❌ 多次请求
const user = await fetch('/api/user');
const posts = await fetch('/api/posts');
const comments = await fetch('/api/comments');

// ✅ 并行请求
const [user, posts, comments] = await Promise.all([
  fetch('/api/user'),
  fetch('/api/posts'),
  fetch('/api/comments')
]);

// ✅ 批量请求
const data = await fetch('/api/batch', {
  method: 'POST',
  body: JSON.stringify({
    requests: ['user', 'posts', 'comments']
  })
});
```

### 6.2 使用缓存

```js
// HTTP 缓存头
fetch('/api/data', {
  cache: 'force-cache'  // 使用缓存
});

// 手动缓存
const cache = new Map();

async function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  const data = await fetch(url).then(r => r.json());
  cache.set(url, data);
  return data;
}
```

---

## 七、打包优化

### 7.1 Tree Shaking

```js
// 只导入需要的部分
import { debounce } from 'lodash-es';

// ❌ 导入整个库
import _ from 'lodash';
```

### 7.2 压缩和混淆

```js
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  }
};
```

### 7.3 代码分割

```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20
        }
      }
    }
  }
};
```

---

## 八、性能监控

### 8.1 Performance API

```js
// 测量性能
performance.mark('start');
doSomething();
performance.mark('end');
performance.measure('doSomething', 'start', 'end');

const measure = performance.getEntriesByName('doSomething')[0];
console.log('耗时:', measure.duration);
```

### 8.2 Lighthouse

```bash
# 使用 Lighthouse CLI
npx lighthouse https://example.com --view
```

---

## 九、最佳实践

1. **性能预算**：设定性能目标并监控。
2. **首屏优化**：优先加载首屏内容。
3. **懒加载**：非关键资源延迟加载。
4. **缓存策略**：合理使用浏览器和服务端缓存。
5. **监控告警**：持续监控性能指标。

---

## 参考资料

- [Web.dev - Performance](https://web.dev/performance/)
- [MDN - Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
