# 语法转换 vs API 垫片

## 核心概念

前端兼容性处理有两种截然不同的技术路径：

1. **语法转换（Transpilation）**：编译时将新语法转换为旧语法
2. **API 垫片（Polyfill）**：运行时填充缺失的 API 实现

理解二者的区别是掌握兼容性处理的关键。

---

## 语法转换（Transpilation）

### 定义

**Transpilation = Transformation + Compilation**

将高版本 JavaScript 语法编译为低版本浏览器能理解的语法，发生在**构建阶段**。

### 典型工具

- **Babel**：主流语法转换工具
- **TypeScript Compiler**：TS 转 JS，同时降级语法
- **SWC**：Rust 实现的高性能转换器

---

### 示例 1：箭头函数

**原始代码（ES6）**：
```javascript
const add = (a, b) => a + b;

const users = [1, 2, 3].map(x => x * 2);
```

**Babel 转换后（ES5）**：
```javascript
var add = function(a, b) {
  return a + b;
};

var users = [1, 2, 3].map(function(x) {
  return x * 2;
});
```

**关键点**：
- 语法结构变化：`=>` → `function`
- 语义保持一致
- 编译时完成，运行时无开销

---

### 示例 2：Class

**原始代码（ES6）**：
```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    return `Hello, ${this.name}`;
  }
}
```

**Babel 转换后（ES5）**：
```javascript
var Person = /*#__PURE__*/ function() {
  function Person(name) {
    this.name = name;
  }
  
  Person.prototype.greet = function greet() {
    return "Hello, " + this.name;
  };
  
  return Person;
}();
```

**关键点**：
- Class 转换为构造函数 + 原型链
- 继承通过原型链模拟
- 代码量增加，但逻辑等价

---

### 示例 3：解构赋值

**原始代码（ES6）**：
```javascript
const { name, age } = user;
const [first, ...rest] = arr;
```

**Babel 转换后（ES5）**：
```javascript
var name = user.name;
var age = user.age;

var first = arr[0];
var rest = arr.slice(1);
```

---

### 语法转换的局限性

**无法转换的语法特性**：

1. **Proxy**（ES6）
   ```javascript
   const proxy = new Proxy(target, handler);
   // 无法转换为 ES5 等价代码，功能无法完美模拟
   ```

2. **Generator 函数**（ES6）
   ```javascript
   function* gen() {
     yield 1;
     yield 2;
   }
   // 可以转换，但需要 regenerator-runtime（额外依赖）
   ```

---

## API 垫片（Polyfill）

### 定义

在运行时检测浏览器是否支持某个 API，如果不支持则提供 JavaScript 实现。

### 核心原理

```javascript
// Polyfill 的通用模式
if (!NativeAPI) {
  window.NativeAPI = function() {
    // JavaScript 实现
  };
}
```

---

### 示例 1：Array.prototype.includes

**Polyfill 实现**：
```javascript
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

**关键点**：
- 检测 `Array.prototype.includes` 是否存在
- 如果不存在，添加 JavaScript 实现
- 实现符合 ECMAScript 规范

---

### 示例 2：Promise

**Polyfill 实现**（简化版）：
```javascript
if (typeof Promise === 'undefined') {
  window.Promise = function(executor) {
    var state = 'pending';
    var value;
    var handlers = [];
    
    function resolve(result) {
      if (state !== 'pending') return;
      state = 'fulfilled';
      value = result;
      handlers.forEach(handle);
    }
    
    function reject(error) {
      if (state !== 'pending') return;
      state = 'rejected';
      value = error;
      handlers.forEach(handle);
    }
    
    this.then = function(onFulfilled, onRejected) {
      return new Promise(function(resolve, reject) {
        handle({
          onFulfilled: onFulfilled,
          onRejected: onRejected,
          resolve: resolve,
          reject: reject
        });
      });
    };
    
    function handle(handler) {
      if (state === 'pending') {
        handlers.push(handler);
      } else {
        // 处理 fulfilled/rejected 状态
      }
    }
    
    executor(resolve, reject);
  };
}
```

**关键点**：
- 完整实现需要数百行代码
- 运行时开销大
- 性能远低于原生实现

---

### API 垫片的局限性

**无法 Polyfill 的 API**：

1. **Proxy**（ES6）
   ```javascript
   // 无法完美 Polyfill：无法拦截所有操作
   const proxy = new Proxy(target, {
     get(target, prop) { /* ... */ }
   });
   ```

2. **Private Fields**（ES2022）
   ```javascript
   class User {
     #password; // 无法 Polyfill 真正的私有性
   }
   ```

3. **WeakMap/WeakSet**
   ```javascript
   // 无法模拟弱引用特性，只能近似实现
   const weakMap = new WeakMap();
   ```

---

## 语法转换 vs API 垫片对比

| 维度 | 语法转换 | API 垫片 |
|------|----------|----------|
| **时机** | 编译时（构建阶段） | 运行时（浏览器中） |
| **工具** | Babel、TypeScript | core-js、polyfill.io |
| **示例** | 箭头函数、class、解构 | Promise、fetch、includes |
| **体积影响** | 转换代码较小 | Polyfill 体积大 |
| **性能影响** | 无运行时开销 | 有运行时性能损失 |
| **可控性** | 完全可控 | 依赖浏览器环境 |

---

## 两者的本质区别

### 1. 语法特性是"语言结构"

**特点**：
- 无法在运行时添加或修改
- 必须在编译阶段转换
- 浏览器解析时就需要理解

**示例**：
```javascript
// 箭头函数是语法特性
const add = (a, b) => a + b; // IE11 直接解析错误

// 无法通过 JavaScript 代码"添加"箭头函数支持
```

---

### 2. API 特性是"运行时能力"

**特点**：
- 可以在运行时添加
- 本质是对象属性或方法
- 浏览器解析通过，执行时查找

**示例**：
```javascript
// Promise 是 API 特性
Promise.resolve(42); // IE11 解析通过，执行时找不到 Promise

// 可以通过 JavaScript 添加 Promise 实现
window.Promise = MyPromiseImplementation;
```

---

## 常见误区

### ❌ 误区 1：Babel 能处理所有兼容性问题

**错误代码**：
```javascript
// .babelrc
{
  "presets": ["@babel/preset-env"]
}

// 源码
const result = await Promise.all([fetch1(), fetch2()]);
```

**问题**：
- Babel 能转换 `async/await` 语法
- 但**无法添加** `Promise` 和 `fetch` API
- 需要配合 Polyfill 使用

---

### ❌ 误区 2：引入 Polyfill 就能支持所有新特性

**错误认知**：有了 core-js，所有 ES6+ 特性都能用

**真相**：
```javascript
// Proxy 无法完美 Polyfill
const proxy = new Proxy({}, {
  get(target, prop) {
    return target[prop];
  }
});

// Private Fields 无法 Polyfill
class User {
  #password; // 语法特性，Polyfill 无能为力
}
```

---

### ❌ 误区 3：转换后的代码和原生一样快

**性能对比**：
```javascript
// 原生 Promise（C++ 实现）
Promise.resolve(42).then(x => x * 2); // ~0.001ms

// Polyfill Promise（JS 实现）
Promise.resolve(42).then(x => x * 2); // ~0.01ms（慢10倍）
```

---

## 工程实践：组合使用

### 完整配置示例

**Babel 配置（语法转换）**：
```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.5%, last 2 versions, not dead',
      useBuiltIns: 'usage', // 自动注入 Polyfill
      corejs: 3
    }]
  ]
};
```

**效果**：
```javascript
// 源码
const add = (a, b) => a + b;
const result = await Promise.all([1, 2, 3]);

// 转换后
import "core-js/modules/es.promise.js"; // 自动注入 Promise Polyfill

var add = function(a, b) { return a + b; }; // 语法转换

var result = await Promise.all([1, 2, 3]); // await 也被转换
```

---

### 手动加载 Polyfill

**场景**：动态按需加载

```javascript
// main.js
async function loadPolyfills() {
  const tasks = [];
  
  // 检测并加载 Promise
  if (typeof Promise === 'undefined') {
    tasks.push(import('core-js/features/promise'));
  }
  
  // 检测并加载 fetch
  if (!('fetch' in window)) {
    tasks.push(import('whatwg-fetch'));
  }
  
  await Promise.all(tasks);
}

// 应用启动前加载
loadPolyfills().then(() => {
  // 启动应用
  import('./app');
});
```

---

## 实战案例：分析转换结果

### 工具：Babel REPL

访问：https://babeljs.io/repl

**输入**：
```javascript
class User {
  constructor(name) {
    this.name = name;
  }
  
  async greet() {
    const greeting = await fetchGreeting();
    return `${greeting}, ${this.name}`;
  }
}
```

**输出分析**：
- `class` 被转换为函数 + 原型
- `async/await` 被转换为 generator + regenerator-runtime
- 模板字符串被转换为字符串拼接
- `fetchGreeting` API **不会被处理**（需要 Polyfill）

---

## 关键要点

1. **语法转换**：编译时处理，无运行时开销，工具是 Babel
2. **API 垫片**：运行时填充，有性能开销，工具是 core-js
3. **本质区别**：语法是结构，API 是能力
4. **组合使用**：Babel + core-js 完整解决兼容性
5. **注意局限**：Proxy、Private Fields 等无法完美处理

---

## 下一步

下一章节将深入学习 **Babel 工作原理**，理解 AST 转换机制。
