# Polyfill 的本质与实现

## 核心概念

**Polyfill**（垫片）是一段代码，用于在不支持某个 API 的浏览器中**提供该 API 的 JavaScript 实现**。

本质：**检测 + 模拟实现**

---

## Polyfill 的定义

### 术语来源

**Polyfill** 一词由 Remy Sharp 于 2010 年创造：
> "A polyfill is a piece of code that provides the technology that you expect the browser to provide natively."

类比：就像墙上的填充材料（filler），填补浏览器功能的"空洞"。

---

## 实现原理

### 通用模式

```javascript
// 1. 检测特性是否存在
if (!NativeAPI) {
  // 2. 如果不存在，提供 JavaScript 实现
  window.NativeAPI = function() {
    // 模拟实现
  };
}
```

---

## 手写 Polyfill 示例

### 示例 1：Array.prototype.includes

**需求**：支持 IE11（不支持 includes）

**实现**：
```javascript
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    'use strict';
    
    // 1. 处理 this 为 null/undefined
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }
    
    // 2. 转换为对象
    var o = Object(this);
    
    // 3. 获取数组长度（无符号右移确保为正整数）
    var len = o.length >>> 0;
    
    // 4. 空数组直接返回 false
    if (len === 0) {
      return false;
    }
    
    // 5. 处理起始索引
    var n = fromIndex | 0; // 转换为整数
    var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    
    // 6. 循环查找（使用 === 严格相等）
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

**测试**：
```javascript
[1, 2, 3].includes(2); // true
[1, 2, 3].includes(4); // false
[1, 2, NaN].includes(NaN); // true
```

---

### 示例 2：Object.assign

**需求**：支持 IE11（不支持 Object.assign）

**实现**：
```javascript
if (typeof Object.assign !== 'function') {
  Object.assign = function(target) {
    'use strict';
    
    // 1. 检查 target
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    
    var to = Object(target);
    
    // 2. 遍历所有 source 对象
    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];
      
      if (nextSource != null) {
        // 3. 复制可枚举的自有属性
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    
    return to;
  };
}
```

**测试**：
```javascript
const target = { a: 1 };
const source = { b: 2, c: 3 };
Object.assign(target, source);
// target: { a: 1, b: 2, c: 3 }
```

---

### 示例 3：Promise（简化版）

**完整实现需要数百行，这里展示核心逻辑**：

```javascript
if (typeof Promise === 'undefined') {
  function Promise(executor) {
    var self = this;
    self.state = 'pending'; // pending, fulfilled, rejected
    self.value = undefined;
    self.handlers = [];
    
    function resolve(result) {
      if (self.state !== 'pending') return;
      self.state = 'fulfilled';
      self.value = result;
      self.handlers.forEach(handle);
    }
    
    function reject(error) {
      if (self.state !== 'pending') return;
      self.state = 'rejected';
      self.value = error;
      self.handlers.forEach(handle);
    }
    
    function handle(handler) {
      if (self.state === 'pending') {
        self.handlers.push(handler);
      } else {
        if (self.state === 'fulfilled' && handler.onFulfilled) {
          handler.onFulfilled(self.value);
        }
        if (self.state === 'rejected' && handler.onRejected) {
          handler.onRejected(self.value);
        }
      }
    }
    
    this.then = function(onFulfilled, onRejected) {
      return new Promise(function(resolve, reject) {
        handle({
          onFulfilled: function(value) {
            try {
              resolve(onFulfilled ? onFulfilled(value) : value);
            } catch (error) {
              reject(error);
            }
          },
          onRejected: function(error) {
            try {
              if (onRejected) {
                resolve(onRejected(error));
              } else {
                reject(error);
              }
            } catch (e) {
              reject(e);
            }
          }
        });
      });
    };
    
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  Promise.resolve = function(value) {
    return new Promise(function(resolve) {
      resolve(value);
    });
  };
  
  Promise.reject = function(error) {
    return new Promise(function(resolve, reject) {
      reject(error);
    });
  };
  
  window.Promise = Promise;
}
```

**关键点**：
- 状态机：pending → fulfilled/rejected
- then 链式调用
- 异步执行（实际需要 setTimeout/setImmediate）

---

## Polyfill 的局限性

### 1. 无法 Polyfill 的特性

#### Proxy（ES6）

**原因**：无法拦截原生对象的所有操作

```javascript
// 原生 Proxy
const proxy = new Proxy(target, {
  get(target, prop) {
    console.log(`访问 ${prop}`);
    return target[prop];
  },
  set(target, prop, value) {
    console.log(`设置 ${prop} = ${value}`);
    target[prop] = value;
    return true;
  }
});

// Polyfill 无法完美实现：
// - 无法拦截 in 操作符
// - 无法拦截 delete 操作符
// - 无法拦截 Object.keys()
```

---

#### WeakMap/WeakSet

**原因**：无法模拟弱引用特性

```javascript
// 原生 WeakMap：键被回收时，自动删除条目
const weakMap = new WeakMap();
let key = {};
weakMap.set(key, 'value');
key = null; // 键对象被回收，WeakMap 自动删除

// Polyfill 无法实现：JavaScript 无法监听垃圾回收
```

---

#### Private Fields（ES2022）

**原因**：私有字段是语法特性，不是 API

```javascript
class User {
  #password; // 真正的私有字段，无法从外部访问
  
  constructor(password) {
    this.#password = password;
  }
}

// Polyfill 只能模拟，但无法实现真正的私有性
```

---

### 2. 性能损失

**原生实现 vs Polyfill 性能对比**：

```javascript
// 测试：Array.prototype.map（1000万次）
const arr = [1, 2, 3, 4, 5];

// 原生 map（C++ 实现）
console.time('native');
arr.map(x => x * 2); // ~50ms
console.timeEnd('native');

// Polyfill map（JavaScript 实现）
console.time('polyfill');
arr.customMap(x => x * 2); // ~200ms（慢4倍）
console.timeEnd('polyfill');
```

**原因**：
- 原生实现由 C++ 编写，深度优化
- Polyfill 是纯 JavaScript，无法利用引擎优化

---

### 3. 可能存在细微差异

**示例**：Date 解析差异

```javascript
// 标准规范
new Date('2023-01-01'); // 应该返回 UTC 时间

// 某些 Polyfill 实现可能使用本地时间
```

---

## 性能影响分析

### 包体积增加

**示例**：引入 core-js Polyfill

| Polyfill | 大小 |
|----------|------|
| Promise | ~6 KB |
| fetch | ~10 KB |
| Array.prototype.includes | ~1 KB |
| Object.assign | ~0.5 KB |
| **全量 core-js** | **~90 KB** |

---

### 运行时开销

**初始化开销**：
```javascript
// Polyfill 需要在运行时检测并注入
if (!Array.prototype.includes) {
  Array.prototype.includes = function() { /* ... */ };
}
// 每次页面加载都需要执行检测逻辑
```

**执行开销**：
```javascript
// Polyfill 实现通常比原生慢 2-10 倍
[1, 2, 3].includes(2); // 原生：0.001ms，Polyfill：0.005ms
```

---

## 工程实践：按需引入 Polyfill

### 方式 1：手动引入

```javascript
// utils/polyfills.js
import 'core-js/features/promise';
import 'core-js/features/array/includes';
import 'core-js/features/object/assign';

// main.js
import './utils/polyfills';
import './app';
```

**优势**：完全可控
**劣势**：手动维护，容易遗漏

---

### 方式 2：Babel 自动注入（推荐）

```javascript
// babel.config.js
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3
    }]
  ]
}

// 源码
Promise.resolve(42);
[1, 2, 3].includes(2);

// Babel 自动注入
import "core-js/modules/es.promise.js";
import "core-js/modules/es.array.includes.js";
Promise.resolve(42);
[1, 2, 3].includes(2);
```

---

### 方式 3：动态加载

```javascript
// 仅在需要时加载 Polyfill
async function loadPolyfills() {
  const tasks = [];
  
  if (typeof Promise === 'undefined') {
    tasks.push(import('core-js/features/promise'));
  }
  
  if (!Array.prototype.includes) {
    tasks.push(import('core-js/features/array/includes'));
  }
  
  await Promise.all(tasks);
}

// 应用启动
loadPolyfills().then(() => {
  import('./app');
});
```

---

## 编写高质量 Polyfill 的原则

### 1. 严格遵循规范

**参考**：ECMAScript 规范文档

```javascript
// ✅ 正确：遵循规范
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    // 规范：https://tc39.es/ecma262/#sec-array.prototype.includes
    // 按规范逐步实现
  };
}

// ❌ 错误：简化实现，可能不符合规范
Array.prototype.includes = function(item) {
  return this.indexOf(item) !== -1; // 无法处理 NaN
};
```

---

### 2. 边界情况处理

```javascript
// 处理 this 为 null/undefined
if (this == null) {
  throw new TypeError();
}

// 处理空数组
if (len === 0) {
  return false;
}

// 处理 NaN 比较
if (Number.isNaN(searchElement) && Number.isNaN(o[k])) {
  return true;
}
```

---

### 3. 性能优化

```javascript
// ✅ 优化：提前计算长度
var len = o.length >>> 0;
while (k < len) { /* ... */ }

// ❌ 低效：每次循环都访问 length
while (k < o.length) { /* ... */ }
```

---

### 4. 避免全局污染

```javascript
// ❌ 污染全局
window.myUtil = function() {};

// ✅ 仅填充标准 API
if (!Array.prototype.includes) {
  Array.prototype.includes = function() {};
}
```

---

## 常见陷阱

### ❌ 陷阱 1：覆盖原生实现

```javascript
// ❌ 错误：强制覆盖
Array.prototype.includes = function() {
  // 自定义实现
};

// ✅ 正确：仅在不存在时填充
if (!Array.prototype.includes) {
  Array.prototype.includes = function() {};
}
```

---

### ❌ 陷阱 2：不符合规范

```javascript
// ❌ 错误：简化实现
Array.prototype.includes = function(item) {
  return this.indexOf(item) !== -1;
};

// 问题：无法处理 NaN
[1, 2, NaN].includes(NaN); // false（错误），应该是 true
```

---

### ❌ 陷阱 3：忘记处理边界情况

```javascript
// ❌ 错误：未处理 this 为 null
Array.prototype.includes = function(item) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === item) return true;
  }
  return false;
};

// 问题
Array.prototype.includes.call(null, 1); // 应该抛出 TypeError
```

---

## 实战案例：完整的 Polyfill 包

### 创建自定义 Polyfill 包

```javascript
// polyfills/index.js
import './array-includes';
import './object-assign';
import './promise';

// polyfills/array-includes.js
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    // 完整实现
  };
}

// 使用
import './polyfills';
```

---

## 关键要点

1. **Polyfill 本质**：检测 + JavaScript 模拟实现
2. **局限性**：Proxy、WeakMap、Private Fields 无法完美 Polyfill
3. **性能开销**：Polyfill 比原生慢 2-10 倍
4. **按需引入**：使用 Babel 的 `useBuiltIns: 'usage'` 自动注入
5. **编写原则**：严格遵循规范、处理边界、避免污染

---

## 下一步

下一章节将学习 **core-js 详解**，理解标准库 Polyfill 集合的使用。
