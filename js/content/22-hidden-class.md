# 隐藏类与内联缓存

## 概述

隐藏类（Hidden Class）和内联缓存（Inline Cache）是 V8 优化对象属性访问的核心机制。

理解隐藏类与内联缓存的关键在于：

- **隐藏类**：V8 为相同结构的对象生成共享的内部类型
- **内联缓存（IC）**：缓存属性访问的位置信息
- **单态 > 多态 > 超态**：IC 状态决定访问速度

---

## 一、隐藏类

### 1.1 基本原理

```js
// 相同结构的对象共享隐藏类
const obj1 = { x: 1, y: 2 };
const obj2 = { x: 3, y: 4 };
// obj1 和 obj2 共享同一个隐藏类

// 不同结构有不同隐藏类
const obj3 = { x: 1 };      // 隐藏类 A
const obj4 = { x: 1, y: 2 }; // 隐藏类 B
```

### 1.2 隐藏类转换

```js
// 动态添加属性会触发隐藏类转换
const obj = {};
// 隐藏类 C0（空对象）

obj.x = 1;
// 转换到隐藏类 C1（有属性 x）

obj.y = 2;
// 转换到隐藏类 C2（有属性 x, y）

// V8 会缓存这些转换路径，相同操作序列会复用
```

### 1.3 属性顺序的影响

```js
// ❌ 不同顺序导致不同隐藏类
const obj1 = {};
obj1.x = 1;
obj1.y = 2;
// 隐藏类路径：C0 → C1(x) → C2(x,y)

const obj2 = {};
obj2.y = 2;  // 顺序不同！
obj2.x = 1;
// 隐藏类路径：C0 → C3(y) → C4(y,x)

// obj1 和 obj2 的隐藏类不同！

// ✅ 相同顺序共享隐藏类
function Point(x, y) {
  this.x = x;  // 始终先 x
  this.y = y;  // 然后 y
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// p1 和 p2 共享隐藏类
```

---

## 二、内联缓存（IC）

### 2.1 工作原理

```js
// V8 缓存属性访问的位置
function getX(obj) {
  return obj.x;
}

// 第一次调用
getX({ x: 1, y: 2 });
// V8 记录：
// - 对象的隐藏类
// - x 属性在偏移量 0

// 第二次调用（相同隐藏类）
getX({ x: 3, y: 4 });
// IC 命中：直接从偏移量 0 读取（快！）

// 不同隐藏类
getX({ y: 1, x: 2 });
// IC 未命中：x 在不同位置
```

### 2.2 IC 状态

```js
// 单态（Monomorphic）- 最快
function getX(obj) {
  return obj.x;
}

// 始终是相同结构
getX({ x: 1, y: 2 });
getX({ x: 3, y: 4 });
getX({ x: 5, y: 6 });
// IC 状态：单态
// 属性访问速度：最快

// 多态（Polymorphic）- 较快（2-4种）
getX({ x: 1 });
getX({ x: 2, y: 3 });
getX({ x: 4, y: 5, z: 6 });
// IC 状态：多态
// 需要检查多种可能的隐藏类
// 属性访问速度：较快

// 超态（Megamorphic）- 慢（>4种）
getX({ a: 1, x: 1 });
getX({ b: 2, x: 2 });
getX({ c: 3, x: 3 });
getX({ d: 4, x: 4 });
getX({ e: 5, x: 5 });
// IC 状态：超态
// 太多种隐藏类，IC 放弃缓存
// 属性访问速度：慢（回退到哈希表查找）
```

---

## 三、优化技巧

### 3.1 使用类或构造函数

```js
// ✅ 好：使用类
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// 共享隐藏类

// ❌ 不好：对象字面量动态添加
const p1 = {};
p1.x = 1;
p1.y = 2;

const p2 = {};
p2.x = 3;
p2.y = 4;
// 虽然最终结构相同，但隐藏类转换路径可能不同
```

### 3.2 避免删除属性

```js
// ❌ 删除属性触发隐藏类转换
const obj = { x: 1, y: 2, z: 3 };
delete obj.z;  // 触发转换，性能差

// ✅ 设为 null 或 undefined
const obj = { x: 1, y: 2, z: 3 };
obj.z = null;  // 保持隐藏类不变
```

### 3.3 初始化所有属性

```js
// ❌ 条件性添加属性
function createConfig(debug) {
  const config = { host: 'localhost' };
  if (debug) {
    config.debug = true;  // 不同的隐藏类！
  }
  return config;
}

// ✅ 初始化所有属性
function createConfig(debug) {
  return {
    host: 'localhost',
    debug: debug || false  // 总是有 debug 属性
  };
}
```

### 3.4 保持对象结构一致

```js
// ❌ 结构不一致
function process(data) {
  return data.x;
}

process({ x: 1 });
process({ x: 2, y: 3 });
process({ x: 4, y: 5, z: 6 });
// 多态或超态，慢

// ✅ 结构一致
function process(data) {
  return data.x;
}

class Data {
  constructor(x, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

process(new Data(1));
process(new Data(2, 3));
process(new Data(4, 5, 6));
// 单态，快
```

---

## 四、性能对比

### 4.1 单态 vs 超态

```js
// 单态访问
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function getX(obj) {
  return obj.x;
}

// 预热
for (let i = 0; i < 1000; i++) {
  getX(new Point(i, i));
}

// 测试单态
console.time('monomorphic');
for (let i = 0; i < 1000000; i++) {
  getX(new Point(i, i));
}
console.timeEnd('monomorphic');
// 预期：非常快

// 超态访问
function getXMega(obj) {
  return obj.x;
}

// 创建多种结构
for (let i = 0; i < 10; i++) {
  const obj = {};
  for (let j = 0; j <= i; j++) {
    obj[`prop${j}`] = j;
  }
  obj.x = 1;
  getXMega(obj);
}

// 测试超态
console.time('megamorphic');
for (let i = 0; i < 1000000; i++) {
  getXMega({ x: i });
}
console.timeEnd('megamorphic');
// 预期：明显慢于单态
```

---

## 五、最佳实践

1. **使用类或构造函数**：保证对象结构一致。
2. **相同顺序初始化属性**：避免不同的隐藏类转换路径。
3. **避免删除属性**：设为 `null` 代替。
4. **避免动态添加属性**：一次性定义所有属性。
5. **保持对象结构一致**：避免超态 IC 状态。
6. **初始化所有可能的属性**：即使某些属性暂时为空。

---

## 参考资料

- [V8 Blog - Shapes and Inline Caches](https://mathiasbynens.be/notes/shapes-ics)
- [JavaScript engine fundamentals: optimizing prototypes](https://mathiasbynens.be/notes/prototypes)
