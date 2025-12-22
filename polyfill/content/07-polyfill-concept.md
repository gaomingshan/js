# 第 7 章：Polyfill 概念辨析

## 概述

Polyfill（垫片）是运行时补丁，用于在旧环境中模拟新 API 的行为。理解 Polyfill 与语法转换的区别，是正确处理兼容性的关键。

## 一、为什么需要 Polyfill

### 1.1 Babel 解决不了的问题

```javascript
// Babel 能转换语法
const fn = () => {};  // → function fn() {}

// Babel 不能创造 API
Promise.resolve(1);     // Promise 从哪来？
[1, 2].includes(1);     // includes 从哪来？
Array.from([1, 2, 3]);  // Array.from 从哪来？
```

> **💡 核心理解**  
> 语法是代码的**写法**，Babel 可以改写。  
> API 是运行时的**功能**，必须在运行时补充。

### 1.2 Polyfill 的作用

```javascript
// Polyfill 的本质：给全局对象添加缺失的方法

// 简化的 Array.prototype.includes polyfill
if (!Array.prototype.includes) {
  Array.prototype.includes = function(item) {
    return this.indexOf(item) !== -1;
  };
}

// 现在所有数组都有 includes 方法了
[1, 2, 3].includes(2);  // true
```

## 二、概念辨析

### 2.1 Polyfill vs Shim vs Ponyfill

| 术语 | 定义 | 特点 |
|------|------|------|
| **Polyfill** | 在旧环境模拟新 API | 修改全局对象 |
| **Shim** | 统一不同环境的 API | 兼容层/适配器 |
| **Ponyfill** | 不修改全局的 polyfill | 纯函数，显式导入 |

### 2.2 示例对比

```javascript
// Polyfill：修改全局
if (!Array.prototype.includes) {
  Array.prototype.includes = function() { /* ... */ };
}
[1, 2].includes(1);  // 直接使用

// Ponyfill：不修改全局
import includes from 'array-includes';
includes([1, 2], 1);  // 显式调用

// Shim：适配不同环境
import { fetch } from 'cross-fetch';  // 同时支持 Node/Browser
```

### 2.3 各自的适用场景

| 类型 | 适用场景 |
|------|----------|
| Polyfill | 应用项目，需要全局生效 |
| Ponyfill | 库开发，避免污染全局 |
| Shim | 跨环境代码（Node + 浏览器） |

## 三、常见需要 Polyfill 的 API

### 3.1 ES6+ 新增 API

```javascript
// Promise
Promise.resolve(1);
Promise.all([p1, p2]);
Promise.allSettled([p1, p2]);

// 数组方法
Array.from(arrayLike);
Array.of(1, 2, 3);
[].includes(item);
[].find(fn);
[].findIndex(fn);
[].flat();
[].flatMap(fn);

// 对象方法
Object.assign({}, obj);
Object.entries(obj);
Object.values(obj);
Object.fromEntries(entries);

// 字符串方法
'str'.includes('s');
'str'.startsWith('s');
'str'.padStart(5, '0');
```

### 3.2 ES2017+ 新增

```javascript
// async/await（语法由 Babel 转换，但需要 regenerator-runtime）
async function fn() {
  await promise;
}

// Object 静态方法
Object.getOwnPropertyDescriptors(obj);
```

### 3.3 Web API

```javascript
// 这些不在 core-js 中，需要单独的 polyfill
fetch('/api');           // whatwg-fetch
URL, URLSearchParams     // url-polyfill
IntersectionObserver     // intersection-observer
ResizeObserver           // resize-observer-polyfill
```

## 四、Polyfill 的实现原理

### 4.1 特性检测 + 补丁

```javascript
// 标准 polyfill 结构
(function() {
  // 1. 检测：如果已存在，不做任何事
  if (typeof Array.prototype.includes === 'function') {
    return;
  }
  
  // 2. 补丁：添加缺失的方法
  Array.prototype.includes = function(searchElement, fromIndex) {
    // 实现逻辑...
  };
})();
```

### 4.2 符合规范的实现

```javascript
// 来自 MDN 的 Array.prototype.includes polyfill
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var o = Object(this);
    var len = o.length >>> 0;

    if (len === 0) {
      return false;
    }

    var n = fromIndex | 0;
    var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    while (k < len) {
      if (o[k] === searchElement) {
        return true;
      }
      k++;
    }

    return false;
  };
}
```

### 4.3 为什么要符合规范

```javascript
// ❌ 简化实现可能有边界问题
Array.prototype.includes = function(item) {
  return this.indexOf(item) !== -1;
};

// 问题：indexOf 不能正确处理 NaN
[NaN].indexOf(NaN);   // -1
[NaN].includes(NaN);  // 应该是 true

// ✅ 规范实现处理了所有边界情况
```

## 五、全局污染问题

### 5.1 问题

```javascript
// Polyfill 修改全局对象
Array.prototype.includes = /* ... */;

// 可能的问题：
// 1. 与其他库冲突
// 2. 影响整个运行环境
// 3. 库的使用者可能不期望全局被修改
```

### 5.2 库开发应使用 Ponyfill

```javascript
// ❌ 库中不应该引入全局 polyfill
import 'core-js/stable';

// ✅ 使用 ponyfill 或 @babel/runtime
import includes from 'array-includes';
// 或
import { includes } from 'core-js-pure/actual/array/includes';
```

## 六、加载时机

### 6.1 同步加载（传统方式）

```html
<!-- 在应用代码之前加载 -->
<script src="polyfills.js"></script>
<script src="app.js"></script>
```

### 6.2 条件加载（推荐）

```html
<!-- 只在需要时加载 -->
<script>
  if (!('Promise' in window)) {
    document.write('<script src="promise-polyfill.js"><\/script>');
  }
</script>
<script src="app.js"></script>
```

### 6.3 动态加载

```javascript
// 按需动态加载
async function loadPolyfills() {
  const polyfills = [];
  
  if (!('fetch' in window)) {
    polyfills.push(import('whatwg-fetch'));
  }
  
  if (!('IntersectionObserver' in window)) {
    polyfills.push(import('intersection-observer'));
  }
  
  await Promise.all(polyfills);
}

loadPolyfills().then(() => {
  // 启动应用
  import('./app.js');
});
```

## 七、体积考量

### 7.1 全量引入的问题

```javascript
// ❌ 引入所有 polyfill
import 'core-js/stable';  // ~150KB+

// 问题：大部分 polyfill 可能不需要
```

### 7.2 按需引入

```javascript
// ✅ 只引入需要的
import 'core-js/actual/promise';
import 'core-js/actual/array/includes';
```

### 7.3 让 Babel 自动处理

```javascript
// babel.config.js
{
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',  // 按代码实际使用自动添加
      corejs: 3
    }]
  ]
}
```

## 八、总结

| 要点 | 说明 |
|------|------|
| 语法 vs API | Babel 转语法，Polyfill 补 API |
| Polyfill | 修改全局，适合应用 |
| Ponyfill | 不修改全局，适合库 |
| 体积 | 按需加载，避免全量引入 |
| 实现 | 应符合规范，处理边界情况 |

## 参考资料

- [MDN Polyfill](https://developer.mozilla.org/zh-CN/docs/Glossary/Polyfill)
- [core-js](https://github.com/zloirock/core-js)
- [Polyfill.io](https://polyfill.io/)

---

**下一章** → [第 8 章：core-js 深入解析](./08-core-js.md)
