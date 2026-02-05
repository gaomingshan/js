# V8 引擎优化

> 理解 JavaScript 引擎的优化机制

---

## 概述

V8 是 Chrome 和 Node.js 使用的 JavaScript 引擎。理解 V8 的优化机制，有助于编写高性能的 JavaScript 代码。

本章将深入：
- V8 的编译流程
- 隐藏类与内联缓存
- JIT 编译优化
- 去优化机制
- 编写引擎友好的代码

---

## 1. V8 编译流程

### 1.1 解析阶段

```javascript
// JavaScript 源码
function add(a, b) {
  return a + b;
}

// V8 处理流程：
// 1. 词法分析 → Token 流
// 2. 语法分析 → AST（抽象语法树）
// 3. 字节码生成 → Ignition 字节码
// 4. JIT 编译 → TurboFan 机器码（热代码）
```

### 1.2 Ignition 解释器

```javascript
// 代码首次执行时，由 Ignition 解释执行字节码
function calculate(n) {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += i;
  }
  return sum;
}

// 第一次调用：解释执行
calculate(10);
```

### 1.3 TurboFan 优化编译器

```javascript
// 热代码会被 TurboFan 优化为机器码
for (let i = 0; i < 10000; i++) {
  calculate(100);  // 频繁调用，触发优化
}

// TurboFan 会：
// 1. 收集类型反馈
// 2. 进行类型推断
// 3. 内联函数
// 4. 消除死代码
// 5. 生成优化的机器码
```

---

## 2. 隐藏类（Hidden Classes）

### 2.1 对象形状

```javascript
// V8 为对象创建隐藏类（Shape）
function Point(x, y) {
  this.x = x;  // 隐藏类 C0 → C1（添加 x）
  this.y = y;  // 隐藏类 C1 → C2（添加 y）
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);

// p1 和 p2 共享相同的隐藏类 C2
// 属性访问非常快（直接偏移量）
```

### 2.2 保持对象形状一致

```javascript
// ✅ 好：相同的形状
function createUser(name, age) {
  return { name, age };
}

const user1 = createUser("Alice", 25);
const user2 = createUser("Bob", 30);
// 共享隐藏类

// ❌ 差：不同的形状
function createUser(name, age) {
  const user = { name };
  if (age) {
    user.age = age;  // 不同的隐藏类
  }
  return user;
}

const user1 = createUser("Alice", 25);  // { name, age }
const user2 = createUser("Bob");        // { name }
// 不同的隐藏类，性能下降
```

### 2.3 属性添加顺序

```javascript
// ✅ 好：相同的顺序
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { a: 4, b: 5, c: 6 };
// 共享隐藏类

// ❌ 差：不同的顺序
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { b: 5, a: 4, c: 6 };
// 不同的隐藏类（即使属性相同）
```

### 2.4 避免删除属性

```javascript
// ❌ 差：删除属性
const obj = { a: 1, b: 2, c: 3 };
delete obj.b;  // 改变隐藏类，变为慢属性

// ✅ 好：设为 undefined
const obj = { a: 1, b: 2, c: 3 };
obj.b = undefined;  // 保持隐藏类不变
```

---

## 3. 内联缓存（Inline Caching）

### 3.1 单态（Monomorphic）

```javascript
// 单态：只有一种类型
function getProperty(obj) {
  return obj.x;
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// 始终传入 Point 实例
for (let i = 0; i < 10000; i++) {
  getProperty(new Point(i, i));
}

// V8 优化：记住 Point 的 x 属性位置
// 后续访问非常快
```

### 3.2 多态（Polymorphic）

```javascript
// 多态：多种类型（但数量有限）
function getProperty(obj) {
  return obj.x;
}

class Point { constructor(x, y) { this.x = x; this.y = y; } }
class Vector { constructor(x, y, z) { this.x = x; this.y = y; this.z = z; } }

// 传入两种类型
for (let i = 0; i < 10000; i++) {
  if (i % 2 === 0) {
    getProperty(new Point(i, i));
  } else {
    getProperty(new Vector(i, i, i));
  }
}

// V8 优化：缓存两种类型的属性位置
// 性能略降，但仍然不错
```

### 3.3 超态（Megamorphic）

```javascript
// 超态：太多类型
function getProperty(obj) {
  return obj.x;
}

// 传入很多种类型
for (let i = 0; i < 10000; i++) {
  getProperty({ x: i, [i]: i });  // 每次不同的隐藏类
}

// V8 无法优化：回退到慢速查找
// 性能显著下降
```

### 3.4 保持类型一致

```javascript
// ✅ 好：单态
function add(a, b) {
  return a + b;
}

for (let i = 0; i < 10000; i++) {
  add(i, i);  // 始终是数字
}

// ❌ 差：多态
function add(a, b) {
  return a + b;
}

add(1, 2);           // 数字
add("a", "b");       // 字符串
add(true, false);    // 布尔
// 多种类型，难以优化
```

---

## 4. JIT 优化技术

### 4.1 函数内联

```javascript
// 小函数会被内联
function square(x) {
  return x * x;
}

function sumOfSquares(a, b) {
  return square(a) + square(b);
}

// 优化后等价于：
function sumOfSquares(a, b) {
  return a * a + b * b;  // square 被内联
}
```

### 4.2 循环优化

```javascript
// 循环会被优化
function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}

// V8 优化：
// - 消除边界检查（确定数组长度不变）
// - 提升 arr.length
// - 向量化（SIMD）
```

### 4.3 逃逸分析

```javascript
// 不逃逸的对象可以在栈上分配
function calculate() {
  const point = { x: 1, y: 2 };  // 不逃逸
  return point.x + point.y;
}

// 优化后：point 可能在栈上分配，甚至被消除
// 等价于：
function calculate() {
  return 1 + 2;  // 直接计算
}
```

---

## 5. 去优化（Deoptimization）

### 5.1 类型改变

```javascript
function add(a, b) {
  return a + b;
}

// 优化为整数加法
for (let i = 0; i < 10000; i++) {
  add(i, i);
}

// 去优化：类型改变
add(1.5, 2.5);  // 浮点数
add("a", "b");  // 字符串

// V8 回退到通用代码
```

### 5.2 隐藏类改变

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function process(point) {
  return point.x + point.y;
}

// 优化
for (let i = 0; i < 10000; i++) {
  process(new Point(i, i));
}

// 去优化：添加新属性
const p = new Point(1, 2);
p.z = 3;  // 改变隐藏类
process(p);  // 触发去优化
```

### 5.3 避免去优化

```javascript
// ✅ 好：类型稳定
function add(a, b) {
  return a + b;
}

// 只用于数字
for (let i = 0; i < 10000; i++) {
  add(i, i);
}

// ❌ 差：类型不稳定
function add(a, b) {
  return a + b;
}

add(1, 2);       // 数字
add("a", "b");   // 字符串 → 去优化
add(1, 2);       // 重新优化
add(true, false); // 布尔 → 再次去优化
```

---

## 6. 数组优化

### 6.1 元素类型

```javascript
// ✅ 好：单一类型（SMI - 小整数）
const arr1 = [1, 2, 3, 4, 5];

// ✅ 好：单一类型（双精度浮点）
const arr2 = [1.5, 2.5, 3.5];

// ❌ 差：混合类型
const arr3 = [1, "two", 3, null, {}];
// 更慢，占用更多内存
```

### 6.2 数组长度

```javascript
// ✅ 好：预分配大小
const arr = new Array(1000);
for (let i = 0; i < 1000; i++) {
  arr[i] = i;
}

// ❌ 差：动态增长
const arr = [];
for (let i = 0; i < 1000; i++) {
  arr.push(i);  // 可能多次重新分配
}
```

### 6.3 稀疏数组

```javascript
// ✅ 好：密集数组
const arr = [1, 2, 3, 4, 5];

// ❌ 差：稀疏数组
const arr = [];
arr[0] = 1;
arr[1000] = 2;  // 变为稀疏数组（字典模式）
// 访问变慢
```

---

## 7. 编写引擎友好的代码

### 7.1 使用 Class

```javascript
// ✅ 好：Class
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  distance() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
}

// ❌ 差：对象字面量（每次创建新隐藏类）
function createPoint(x, y) {
  return {
    x,
    y,
    distance() {
      return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
  };
}
```

### 7.2 避免 try-catch 在热路径

```javascript
// ❌ 差：热路径中的 try-catch
function process(data) {
  try {
    return heavyComputation(data);
  } catch (e) {
    return null;
  }
}

// ✅ 好：隔离 try-catch
function safeProcess(data) {
  try {
    return process(data);
  } catch (e) {
    return null;
  }
}

function process(data) {
  return heavyComputation(data);  // 可以被优化
}
```

### 7.3 避免 arguments 对象

```javascript
// ❌ 差：使用 arguments
function sum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

// ✅ 好：使用剩余参数
function sum(...numbers) {
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total;
}
```

### 7.4 使用现代语法

```javascript
// ✅ 好：let/const
for (let i = 0; i < 1000; i++) {
  const value = i * 2;
  process(value);
}

// ❌ 差：var
for (var i = 0; i < 1000; i++) {
  var value = i * 2;
  process(value);
}
```

---

## 8. 性能测试

### 8.1 基准测试

```javascript
// 使用 console.time
console.time('test');
for (let i = 0; i < 1000000; i++) {
  // 测试代码
}
console.timeEnd('test');

// 使用 performance.now()
const start = performance.now();
for (let i = 0; i < 1000000; i++) {
  // 测试代码
}
const end = performance.now();
console.log(`耗时: ${end - start}ms`);

// 使用 Benchmark.js
// const Benchmark = require('benchmark');
// const suite = new Benchmark.Suite;
// 
// suite
//   .add('方法1', function() {
//     // 测试代码
//   })
//   .add('方法2', function() {
//     // 测试代码
//   })
//   .on('complete', function() {
//     console.log('最快的是 ' + this.filter('fastest').map('name'));
//   })
//   .run();
```

### 8.2 V8 性能分析

```javascript
// Node.js 性能分析
// node --prof app.js
// node --prof-process isolate-*.log

// Chrome DevTools
// 1. Performance 面板
// 2. 记录性能
// 3. 分析火焰图
```

---

## 9. 常见性能陷阱

### 9.1 对象属性访问

```javascript
// ❌ 差：重复访问
function process(obj) {
  console.log(obj.data.user.name);
  console.log(obj.data.user.age);
  console.log(obj.data.user.email);
}

// ✅ 好：缓存
function process(obj) {
  const user = obj.data.user;
  console.log(user.name);
  console.log(user.age);
  console.log(user.email);
}
```

### 9.2 循环中的函数创建

```javascript
// ❌ 差：每次创建新函数
for (let i = 0; i < 1000; i++) {
  setTimeout(function() {
    console.log(i);
  }, i);
}

// ✅ 好：复用函数
function log(i) {
  console.log(i);
}

for (let i = 0; i < 1000; i++) {
  setTimeout(log.bind(null, i), i);
}
```

### 9.3 字符串拼接

```javascript
// ❌ 差：多次拼接
let str = "";
for (let i = 0; i < 1000; i++) {
  str += i;  // 每次创建新字符串
}

// ✅ 好：数组 join
const parts = [];
for (let i = 0; i < 1000; i++) {
  parts.push(i);
}
const str = parts.join('');
```

---

## 关键要点

1. **隐藏类**
   - 保持对象形状一致
   - 相同的属性顺序
   - 避免删除属性
   - 使用 Class

2. **内联缓存**
   - 保持类型单态
   - 避免多态和超态
   - 类型一致性

3. **JIT 优化**
   - 函数内联
   - 循环优化
   - 逃逸分析
   - 类型特化

4. **避免去优化**
   - 类型稳定
   - 隐藏类不变
   - 避免混合类型

5. **最佳实践**
   - 使用现代语法
   - 避免 try-catch 在热路径
   - 预分配数组大小
   - 单一类型数组

---

## 深入一点

### V8 的内存布局

```
对象在内存中的表示：
┌─────────────────┐
│   Hidden Class  │ ← 隐藏类指针
├─────────────────┤
│   Properties    │ ← 属性存储
├─────────────────┤
│   Elements      │ ← 数组元素
└─────────────────┘
```

### 优化层级

```
代码执行路径：
1. Ignition（解释器）
   ↓ 热代码
2. TurboFan（优化编译器）
   ↓ 类型改变
3. 去优化 → 回到 Ignition
   ↓ 重新收集反馈
4. 再次优化
```

---

## 参考资料

- [V8 官方博客](https://v8.dev/blog)
- [How JavaScript works: inside the V8 engine](https://blog.sessionstack.com/how-javascript-works-inside-the-v8-engine-5-tips-on-how-to-write-optimized-code-ac089e62b12e)
- [JavaScript engine fundamentals: Shapes and Inline Caches](https://mathiasbynens.be/notes/shapes-ics)

---

**上一章**：[并发模式与实践](./content-23.md)  
**下一章**：[垃圾回收机制](./content-25.md)
