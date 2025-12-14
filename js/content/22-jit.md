# JIT 编译优化

## 概述

JIT（Just-In-Time）即时编译是 V8 提升 JavaScript 性能的核心技术。

理解 JIT 的关键在于：

- **热点检测**：识别频繁执行的代码
- **类型反馈**：基于运行时类型信息优化
- **去优化**：假设失败时回退到解释执行

---

## 一、JIT 编译原理

### 1.1 编译流程

```js
// V8 的 JIT 编译流程

解释执行（Ignition）
  ↓
收集类型反馈
  ↓
检测热点代码
  ↓
优化编译（TurboFan）
  ↓
执行优化后的机器码
  ↓
类型假设失败？
  ↓
去优化，回到解释执行
```

### 1.2 为什么需要 JIT

**传统方式**：

- **纯解释**：慢，但启动快
- **AOT 编译**：快，但启动慢，占用空间大

**JIT 优势**：

- 启动快（先解释执行）
- 运行快（热点代码编译）
- 动态优化（基于实际类型）

---

## 二、类型反馈

### 2.1 收集类型信息

```js
// V8 在解释执行时收集类型信息
function add(a, b) {
  return a + b;
}

// 调用 1：数字
add(1, 2);
// V8 记录：a 和 b 是数字

// 调用 2：还是数字
add(3, 4);
// V8 确认：总是数字

// TurboFan 优化：生成针对数字的优化代码
// 直接的整数加法指令，无需类型检查

// 调用 3：字符串
add('hello', 'world');
// 类型假设失败，去优化
```

### 2.2 内联缓存（IC）

```js
// IC 记录属性访问的类型信息
function getX(obj) {
  return obj.x;
}

// 调用 1
getX({ x: 1, y: 2 });
// IC 记录：x 在偏移量 0

// 调用 2（相同结构）
getX({ x: 3, y: 4 });
// IC 命中，快速访问

// IC 状态：
// - Uninitialized: 未初始化
// - Monomorphic: 单一类型（最快）
// - Polymorphic: 多种类型（2-4种）
// - Megamorphic: 太多类型（>4种，慢）
```

---

## 三、优化技术

### 3.1 函数内联

```js
// 内联：将函数调用替换为函数体
function square(x) {
  return x * x;
}

function sumOfSquares(a, b) {
  return square(a) + square(b);
}

// 优化前：
// - 调用 square(a)
// - 调用 square(b)
// - 相加

// 优化后（内联）：
// return a * a + b * b
// 消除函数调用开销

// 内联条件：
// - 函数小（通常 <600 字节）
// - 调用频繁
// - 不是递归函数
```

### 3.2 循环优化

```js
// 循环展开
function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}

// 优化前：每次迭代检查边界
// 优化后：可能展开为
// total += arr[0];
// total += arr[1];
// total += arr[2];
// total += arr[3];
// ...

// 其他循环优化：
// - 边界检查消除
// - 循环不变代码外提
// - 强度削减
```

### 3.3 逃逸分析

```js
// 逃逸分析：对象是否逃出函数作用域
function createPoint(x, y) {
  const point = { x, y };
  return point.x + point.y;
}

// point 没有逃逸（不返回对象本身）
// 优化：在栈上分配，不在堆上
// 更快，无需 GC

function createAndReturn(x, y) {
  const point = { x, y };
  return point;
}

// point 逃逸了（返回对象）
// 必须在堆上分配
```

### 3.4 标量替换

```js
// 标量替换：用局部变量替换对象
function distance(p1, p2) {
  return Math.sqrt(
    (p1.x - p2.x) ** 2 + 
    (p1.y - p2.y) ** 2
  );
}

// 优化前：访问对象属性
// 优化后：替换为局部变量
// let dx = p1x - p2x;
// let dy = p1y - p2y;
// return Math.sqrt(dx * dx + dy * dy);
```

---

## 四、去优化（Deoptimization）

### 4.1 触发原因

```js
// 去优化的常见原因

// 1. 类型改变
function process(x) {
  return x * 2;
}

process(10);      // 优化为数字运算
process('5');     // 类型改变，去优化

// 2. 隐藏类改变
function Point(x, y) {
  this.x = x;
  this.y = y;
}

const p = new Point(1, 2);
delete p.x;       // 隐藏类改变，去优化

// 3. 数组类型改变
const arr = [1, 2, 3];     // SMI 数组
arr.push(1.1);             // 转换为 Double
arr.push('4');             // 转换为混合数组，去优化

// 4. 超出优化假设
function bounded(arr) {
  for (let i = 0; i < arr.length; i++) {
    // 假设 arr[i] 总是数字
  }
}

bounded([1, 2, 3]);
bounded([1, 'string', 3]); // 去优化
```

### 4.2 去优化代价

```js
// 去优化很昂贵
// 1. 丢弃优化的机器码
// 2. 回到解释执行
// 3. 重新收集类型信息
// 4. 可能再次优化

// 避免去优化：
// - 保持类型一致
// - 不要改变对象结构
// - 预热后再执行关键代码
```

---

## 五、优化示例

### 5.1 数字运算

```js
// 优化良好的数字运算
function calculate(a, b) {
  return (a + b) * (a - b);
}

// 始终用数字调用
for (let i = 0; i < 10000; i++) {
  calculate(i, i + 1);
}

// TurboFan 优化：
// - 类型特化（只处理数字）
// - 内联运算
// - 寄存器分配

// 性能接近原生 C++ 代码
```

### 5.2 对象访问

```js
// 单态对象访问
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function magnitude(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

// 始终用 Vector 实例调用
for (let i = 0; i < 10000; i++) {
  const v = new Vector(i, i + 1);
  magnitude(v);
}

// TurboFan 优化：
// - 隐藏类检查
// - 直接偏移量访问（无哈希查找）
// - 可能内联 magnitude
```

### 5.3 数组操作

```js
// 类型化数组的优化
const arr = new Float64Array(1000);

function processArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// TurboFan 优化：
// - 已知元素类型（Double）
// - 消除边界检查
// - 向量化（SIMD）
// - 循环展开
```

---

## 六、性能基准

### 6.1 预热效果

```js
// 演示预热效果
function benchmark(fn, iterations) {
  // 预热
  for (let i = 0; i < 1000; i++) {
    fn(i);
  }

  // 测试
  console.time('optimized');
  for (let i = 0; i < iterations; i++) {
    fn(i);
  }
  console.timeEnd('optimized');
}

// 使用
function calculate(x) {
  return x * x + x * 2 + 1;
}

benchmark(calculate, 1000000);
```

---

## 七、最佳实践

1. **类型一致**：同一函数避免混合类型。
2. **预热代码**：关键代码先执行多次。
3. **避免去优化**：不要改变对象结构和类型。
4. **使用 TypedArray**：大量数值计算优先使用。
5. **小函数**：便于内联优化。

---

## 参考资料

- [V8 Blog - JIT](https://v8.dev/blog/turbofan-jit)
- [Understanding V8's Bytecode](https://medium.com/dailyjs/understanding-v8s-bytecode-317d46c94775)
