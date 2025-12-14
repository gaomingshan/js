# JavaScript 内存模型

## 概述

理解 JavaScript 的内存模型是优化性能和避免内存泄漏的关键。

理解内存模型的核心在于：

- **栈（Stack）**：基本类型值、引用地址、函数调用栈帧
- **堆（Heap）**：对象、数组、函数、大字符串
- **自动管理**：栈自动释放，堆需要垃圾回收器

---

## 一、内存结构

### 1.1 栈内存（Stack）

**存储内容**：

- 基本类型值（number, string, boolean, null, undefined, symbol, bigint）
- 引用类型的引用地址
- 函数调用栈帧

**特点**：

- 大小固定，空间连续
- 自动分配和释放
- 访问速度快
- LIFO（后进先出）

```js
function test() {
  let x = 1;           // x 存储在栈中
  let y = 2;           // y 存储在栈中
  let str = 'hello';   // 'hello' 存储在栈中
}

// 函数执行完毕，栈帧销毁，内存自动释放
```

### 1.2 堆内存（Heap）

**存储内容**：

- 对象（Object）
- 数组（Array）
- 函数（Function）
- 大字符串

**特点**：

- 大小不固定，动态分配
- 需要垃圾回收器管理
- 访问速度相对较慢
- 可以存储大量数据

```js
function test() {
  let obj = { x: 1 };  // 对象存储在堆中，obj 保存引用地址
  let arr = [1, 2, 3]; // 数组存储在堆中，arr 保存引用地址
}

// 函数执行完毕，栈中的引用被清除
// 但堆中的对象需要垃圾回收器处理
```

---

## 二、变量存储

### 2.1 基本类型

```js
// 基本类型直接存储值
let a = 1;
let b = a;    // 复制值
b = 2;

console.log(a);  // 1（a 不受影响）
console.log(b);  // 2

// 内存布局：
// 栈内存：
// a: 1
// b: 2
```

### 2.2 引用类型

```js
// 引用类型存储引用地址
let obj1 = { x: 1 };
let obj2 = obj1;  // 复制引用地址
obj2.x = 2;

console.log(obj1.x);  // 2（obj1 受影响）
console.log(obj2.x);  // 2

// 内存布局：
// 栈内存：
// obj1: 0x001（堆地址）
// obj2: 0x001（相同地址）
// 
// 堆内存：
// 0x001: { x: 2 }
```

### 2.3 深拷贝 vs 浅拷贝

```js
// 浅拷贝：只复制第一层
const obj1 = {
  x: 1,
  nested: { y: 2 }
};

const obj2 = { ...obj1 };  // 浅拷贝
obj2.x = 10;
obj2.nested.y = 20;

console.log(obj1.x);         // 1（不受影响）
console.log(obj1.nested.y);  // 20（受影响！）

// 深拷贝：递归复制所有层
const obj3 = JSON.parse(JSON.stringify(obj1));
obj3.nested.y = 30;

console.log(obj1.nested.y);  // 20（不受影响）
```

---

## 三、内存生命周期

### 3.1 分配内存

```js
// 1. 基本类型分配
let num = 42;           // 栈中分配 8 字节（64位）
let str = 'hello';      // 栈中分配引用，堆中分配字符串

// 2. 对象分配
let obj = {
  name: 'Alice',
  age: 25
};
// 堆中分配对象空间
// 栈中分配引用

// 3. 数组分配
let arr = new Array(1000);  // 堆中分配连续空间

// 4. 函数分配
function fn() {}       // 堆中分配函数对象
```

### 3.2 使用内存

```js
let obj = { x: 1 };

// 读取
console.log(obj.x);    // 访问堆内存

// 写入
obj.x = 2;             // 修改堆内存

// 传递引用
function modify(o) {
  o.x = 3;           // 修改同一个堆对象
}

modify(obj);
console.log(obj.x);    // 3
```

### 3.3 释放内存

```js
// 栈内存自动释放
function test() {
  let x = 1;
}  // x 的栈空间自动释放

// 堆内存需要垃圾回收
let obj = { x: 1 };
obj = null;  // 解除引用，等待垃圾回收

// 闭包导致内存保留
function outer() {
  let data = new Array(1000000);

  return function inner() {
    return data.length;  // data 被闭包引用，不会释放
  };
}
```

---

## 四、内存限制

### 4.1 V8 内存限制

```js
// V8 默认内存限制
// 64位系统：
// - 老生代（Old Generation）：约 1.4 GB
// - 新生代（New Generation）：约 32 MB
// 
// 32位系统：
// - 老生代：约 700 MB
// - 新生代：约 16 MB

// 查看内存使用（Node.js）
console.log(process.memoryUsage());
// {
//   rss: 总内存,
//   heapTotal: 堆总大小,
//   heapUsed: 已使用堆,
//   external: C++ 对象内存
// }
```

### 4.2 栈溢出

```js
// 栈空间有限，深度递归可能导致栈溢出
function recursion(n) {
  if (n === 0) return;
  recursion(n - 1);  // 每次调用占用栈空间
}

try {
  recursion(100000);  // RangeError: Maximum call stack size exceeded
} catch (e) {
  console.log('栈溢出');
}

// 解决方案：尾调用优化或改用迭代
```

---

## 五、字符串的特殊处理

### 5.1 字符串不可变性

```js
// JavaScript 字符串是不可变的
let str = 'hello';
str[0] = 'H';          // 无效操作
console.log(str);      // "hello"（未改变）

// 任何"修改"都会创建新字符串
str = str.toUpperCase();  // 创建新字符串 "HELLO"

// ❌ 低效：每次都创建新字符串
let result = '';
for (let i = 0; i < 10000; i++) {
  result += 'x';
}

// ✅ 优化：使用数组
let arr = [];
for (let i = 0; i < 10000; i++) {
  arr.push('x');
}
let result2 = arr.join('');  // 只创建一次最终字符串
```

### 5.2 字符串驻留（String Interning）

```js
// 相同的字符串字面量可能共享内存
let str1 = 'hello';
let str2 = 'hello';
console.log(str1 === str2);  // true（可能共享内存）

// 动态创建的字符串
let str3 = 'hel' + 'lo';
console.log(str1 === str3);  // true（引擎优化）
```

---

## 六、数组的内存布局

### 6.1 连续数组 vs 字典数组

```js
// V8 对数组有两种内存布局

// 1. 快速数组（连续内存）
const arr1 = [1, 2, 3, 4, 5];
// 内存：[1][2][3][4][5]（连续）

// 2. 稀疏数组（哈希表）
const arr2 = [];
arr2[0] = 1;
arr2[1000] = 2;
// 内存：{ 0: 1, 1000: 2 }（哈希表）
```

### 6.2 类型化数组

```js
// TypedArray 使用连续内存，性能更好
const int32Array = new Int32Array(1000);
// 每个元素固定 4 字节，总共 4000 字节

// 普通数组
const normalArray = new Array(1000);
// 每个元素可能是任意类型，需要额外信息
```

---

## 七、最佳实践

1. **避免意外的全局变量**：使用严格模式，正确声明变量。
2. **及时解除引用**：不再使用的大对象设为 `null`。
3. **字符串拼接优化**：大量拼接用数组 `join()`。
4. **避免深度递归**：改用迭代或尾递归优化。
5. **合理使用 TypedArray**：大量数值计算用类型化数组。

---

## 参考资料

- [V8 Memory Management](https://v8.dev/blog/trash-talk)
- [MDN - Memory Management](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management)
