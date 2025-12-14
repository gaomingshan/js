# V8 内部机制

## 概述

V8 是 Google 开发的高性能 JavaScript 引擎，用于 Chrome 和 Node.js。

理解 V8 的核心在于：

- **Ignition 解释器**：快速启动，执行字节码
- **TurboFan 优化编译器**：将热点代码编译为优化的机器码
- **隐藏类（Hidden Classes）**：优化对象属性访问

---

## 一、V8 架构

### 1.1 主要组件

- **解析器（Parser）**：将 JavaScript 源码转换为 AST
- **解释器（Ignition）**：将 AST 转换为字节码并执行
- **优化编译器（TurboFan）**：将热点代码编译为优化的机器码
- **垃圾回收器（Orinoco）**：管理内存回收

### 1.2 执行流程

```js
// V8 执行 JavaScript 的流程

源代码
  ↓
解析器（Parser）
  ↓
抽象语法树（AST）
  ↓
解释器（Ignition）
  ↓
字节码（Bytecode）
  ↓ （热点代码）
优化编译器（TurboFan）
  ↓
优化的机器码（Optimized Machine Code）
```

---

## 二、Ignition 解释器

### 2.1 字节码

```js
// JavaScript 源码
function add(a, b) {
  return a + b;
}

// 对应的字节码（简化）
// LdaNamedProperty a  // 加载 a
// Star r0             // 存储到寄存器 r0
// LdaNamedProperty b  // 加载 b
// Add r0              // r0 + b
// Return              // 返回结果
```

### 2.2 字节码优势

**为什么使用字节码**：

- 减少内存占用（比机器码小）
- 加快启动速度（不需要完全编译）
- 简化编译流程
- 便于收集类型反馈

---

## 三、TurboFan 优化编译器

### 3.1 热点检测

```js
// V8 跟踪函数和循环的执行次数
function hotFunction() {
  // 函数被多次调用后：
  // 1. Ignition 执行字节码
  // 2. 收集类型反馈
  // 3. 达到阈值后，TurboFan 开始优化
  // 4. 生成优化的机器码
}

// 热点阈值（大约）：
// - 函数调用 ~1000 次
// - 循环迭代 ~10000 次
```

### 3.2 优化示例

```js
// 示例 1：类型特化
function add(a, b) {
  return a + b;
}

// 如果始终用数字调用
add(1, 2);
add(3, 4);
add(5, 6);
// TurboFan 优化为：直接的数字加法指令

// 如果后来用字符串调用
add('hello', 'world');
// 触发去优化（Deoptimization）

// 示例 2：函数内联
function square(x) {
  return x * x;
}

function sumOfSquares(a, b) {
  return square(a) + square(b);
}

// 优化后，square 可能被内联到 sumOfSquares 中
// 减少函数调用开销
```

### 3.3 去优化（Deoptimization）

```js
// 当优化的假设被打破时，触发去优化
function process(obj) {
  return obj.x + obj.y;
}

// 假设 obj 总是 { x: number, y: number }
process({ x: 1, y: 2 });
process({ x: 3, y: 4 });
// TurboFan 优化

// 但如果结构改变
process({ x: 1, y: 2, z: 3 });  // 可能触发去优化

// 或类型改变
process({ x: 'a', y: 'b' });    // 触发去优化

// 去优化代价高昂，应避免
```

---

## 四、隐藏类（Hidden Classes）

### 4.1 概念

```js
// JavaScript 对象是动态的，但 V8 使用隐藏类优化

// 相同结构的对象共享隐藏类
const obj1 = { x: 1, y: 2 };
const obj2 = { x: 3, y: 4 };
// obj1 和 obj2 共享同一个隐藏类

// 不同结构的对象有不同隐藏类
const obj3 = { x: 1 };      // 隐藏类 A
const obj4 = { x: 1, y: 2 }; // 隐藏类 B（不同）

// 隐藏类转换
const obj5 = {};
// 隐藏类 C0
obj5.x = 1;
// 转换到隐藏类 C1（有属性 x）
obj5.y = 2;
// 转换到隐藏类 C2（有属性 x, y）
```

### 4.2 优化技巧

```js
// ✅ 好的做法
// 1. 相同顺序初始化
function Point(x, y) {
  this.x = x;  // 始终先 x
  this.y = y;  // 然后 y
}

// 2. 避免动态添加属性
const obj = { x: 1, y: 2, z: 3 };  // 一次性定义

// 3. 使用构造函数或类
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}

// ❌ 不好的做法
// 1. 不同顺序初始化
const obj1 = {};
obj1.x = 1;
obj1.y = 2;

const obj2 = {};
obj2.y = 2;  // 顺序不同！
obj2.x = 1;

// 2. 删除属性
delete obj.x;  // 触发隐藏类转换，性能差

// 3. 动态添加属性
obj.newProp = 3;  // 隐藏类转换
```

---

## 五、内联缓存（Inline Caching）

### 5.1 工作原理

```js
// V8 缓存属性访问的位置

function getX(obj) {
  return obj.x;
}

// 第一次调用
getX({ x: 1 });
// V8 记录：x 在偏移量 0

// 第二次调用（相同结构）
getX({ x: 2 });
// 直接从偏移量 0 读取（快！）

// 不同结构
getX({ y: 1, x: 2 });
// x 在不同位置，缓存失效
```

### 5.2 单态、多态、超态

```js
// 单态（Monomorphic）：一种类型
function process(obj) {
  return obj.x;
}

process({ x: 1, y: 2 });
process({ x: 3, y: 4 });
// 始终是相同结构，单态，最快

// 多态（Polymorphic）：少数几种类型（2-4种）
process({ x: 1 });
process({ x: 2, y: 3 });
process({ x: 4, y: 5, z: 6 });
// 多种结构，多态，较快

// 超态（Megamorphic）：很多种类型（>4种）
process({ a: 1 });
process({ b: 2 });
process({ c: 3 });
process({ d: 4 });
process({ e: 5 });
// 太多结构，超态，慢

// 优化建议：保持对象结构一致
```

---

## 六、数组优化

### 6.1 数组元素类型

```js
// V8 对数组有特殊优化

// 1. SMI 数组（Small Integer）
const arr1 = [1, 2, 3, 4, 5];
// 最快，元素是小整数

// 2. Double 数组
const arr2 = [1.1, 2.2, 3.3];
// 较快，元素是浮点数

// 3. 对象数组
const arr3 = [{ x: 1 }, { x: 2 }];
// 较慢，元素是对象引用

// 4. 混合数组
const arr4 = [1, 'string', { x: 1 }];
// 最慢，元素类型不一致

// 类型转换（不可逆）
const arr = [1, 2, 3];      // SMI
arr.push(1.1);              // 转换为 Double
arr.push('string');         // 转换为混合（不能再优化）
```

### 6.2 稀疏数组

```js
// 密集数组 vs 稀疏数组

// 密集数组（快）
const dense = [1, 2, 3, 4, 5];
// 连续内存

// 稀疏数组（慢）
const sparse = [];
sparse[0] = 1;
sparse[1000] = 2;
// 哈希表存储

// ❌ 避免创建稀疏数组
const arr = [];
arr[100] = 1;

// ✅ 使用密集数组
const arr2 = new Array(101).fill(0);
arr2[100] = 1;
```

---

## 七、性能优化建议

### 7.1 对象优化

```js
// 1. 使用构造函数或类
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// 2. 相同顺序初始化属性
// 3. 避免删除属性（设为 null 代替）
// 4. 避免动态添加属性
// 5. 保持对象结构一致
```

### 7.2 函数优化

```js
// 1. 保持参数类型一致
function add(a, b) {
  return a + b;
}

// ✅ 始终用数字调用
add(1, 2);
add(3, 4);

// ❌ 混合类型
add(1, 2);
add('a', 'b');  // 触发去优化

// 2. 避免 arguments 对象（使用剩余参数）
// ❌ 不好
function sum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

// ✅ 好
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
```

---

## 八、最佳实践

1. **使用类和构造函数**：保持对象结构一致。
2. **类型一致**：同一函数避免混合类型。
3. **避免删除属性**：设为 `null` 代替。
4. **预热代码**：关键代码先执行多次再计时。
5. **使用 TypedArray**：大量数值计算优先使用。

---

## 参考资料

- [V8 Blog](https://v8.dev/blog)
- [JavaScript engine fundamentals](https://mathiasbynens.be/notes/shapes-ics)
