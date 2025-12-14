# 第 8 章：内置对象与数据结构 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Map vs Object

### 题目

Map 和普通对象（Object）的主要区别是什么？

**选项：**
- A. Map 的键可以是任意类型，Object 的键只能是字符串或 Symbol
- B. Map 有序，Object 部分有序
- C. Map 有 size 属性，Object 需要手动计算
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Map vs Object（全部正确）**

**A. 键的类型**
```javascript
// Object：键只能是字符串或 Symbol
const obj = {};
obj[1] = 'one';
console.log(Object.keys(obj));  // ["1"]（转为字符串）

// Map：键可以是任意类型
const map = new Map();
map.set(1, 'one');
map.set({}, 'object');
console.log(map.size);  // 2
```

**B. 顺序**
```javascript
// Object：部分有序（整数键升序 → 其他键按插入顺序）
const obj = { 2: 'b', 1: 'a', c: 'c' };
console.log(Object.keys(obj));  // ["1", "2", "c"]

// Map：完全按插入顺序
const map = new Map([[2, 'b'], [1, 'a'], ['c', 'c']]);
console.log([...map.keys()]);  // [2, 1, "c"]
```

**C. size 属性**
```javascript
// Object：手动计算
console.log(Object.keys(obj).length);

// Map：内置 size
console.log(map.size);
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** Set

### 题目

以下代码的输出是什么？

```javascript
const set = new Set([1, 2, 3, 2, 1]);
console.log(set.size);
console.log([...set]);
```

**选项：**
- A. `5`, `[1, 2, 3, 2, 1]`
- B. `3`, `[1, 2, 3]`
- C. `3`, `[1, 2, 3, 2, 1]`
- D. `5`, `[1, 2, 3]`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Set 自动去重**

```javascript
const set = new Set([1, 2, 3, 2, 1]);
console.log(set.size);  // 3
console.log([...set]);  // [1, 2, 3]
```

**数组去重**
```javascript
const arr = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(arr)];  // [1, 2, 3, 4]
```

**集合运算**
```javascript
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

// 并集
const union = new Set([...a, ...b]);  // Set(4) {1, 2, 3, 4}

// 交集
const intersection = new Set([...a].filter(x => b.has(x)));  // Set(2) {2, 3}

// 差集
const difference = new Set([...a].filter(x => !b.has(x)));  // Set(1) {1}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** Math

### 题目

`Math.max()` 不传参数时返回 `-Infinity`。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**Math.max() 和 Math.min() 的默认值**

```javascript
Math.max();  // -Infinity
Math.min();  // Infinity
```

**常用 Math 方法**
```javascript
// 取整
Math.floor(4.7);   // 4（向下）
Math.ceil(4.1);    // 5（向上）
Math.round(4.5);   // 5（四舍五入）
Math.trunc(4.7);   // 4（截断）

// 随机数
Math.random();  // 0-1
Math.floor(Math.random() * 10);  // 0-9

// 幂和根
Math.pow(2, 3);  // 8
Math.sqrt(16);   // 4
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** Date

### 题目

以下代码的输出是什么？

```javascript
const date = new Date(2024, 0, 1);
console.log(date.getMonth());
console.log(date.getDate());
console.log(date.getDay());
```

**选项：**
- A. `1`, `1`, `1`
- B. `0`, `1`, `1`
- C. `0`, `1`, `0`
- D. `1`, `1`, `0`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Date 的月份和星期**

```javascript
const date = new Date(2024, 0, 1);  // 2024年1月1日

date.getMonth();  // 0（1月，月份 0-11）
date.getDate();   // 1（日期 1-31）
date.getDay();    // 1（周一，星期 0-6，0是周日）
```

**注意：** 月份从 0 开始！

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** WeakMap

### 题目

以下代码的输出是什么？

```javascript
let key = { id: 1 };
const wm = new WeakMap();
wm.set(key, 'value');

console.log(wm.has(key));
key = null;
console.log(wm.has(key));
```

**选项：**
- A. `true`, `true`
- B. `true`, `false`
- C. `false`, `false`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**WeakMap 的弱引用**

```javascript
console.log(wm.has(key));  // true
key = null;
console.log(wm.has(key));  // false（key 是 null）
```

**WeakMap 特性：**
- 键必须是对象
- 弱引用，不阻止 GC
- 不可迭代

**使用场景：私有数据**
```javascript
const privateData = new WeakMap();

class Person {
  constructor(name) {
    privateData.set(this, { name });
  }
  getName() {
    return privateData.get(this).name;
  }
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码输出题  
**标签：** Symbol

### 题目

以下代码的输出是什么？

```javascript
const s1 = Symbol('key');
const s2 = Symbol('key');
const s3 = Symbol.for('key');
const s4 = Symbol.for('key');

console.log(s1 === s2);
console.log(s3 === s4);
console.log(Symbol.keyFor(s1));
console.log(Symbol.keyFor(s3));
```

**选项：**
- A. `false`, `true`, `undefined`, `"key"`
- B. `true`, `true`, `"key"`, `"key"`
- C. `false`, `false`, `undefined`, `undefined`
- D. `false`, `true`, `"key"`, `"key"`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Symbol() vs Symbol.for()**

```javascript
// Symbol()：每次创建唯一 Symbol
const s1 = Symbol('key');
const s2 = Symbol('key');
console.log(s1 === s2);  // false

// Symbol.for()：全局注册表
const s3 = Symbol.for('key');
const s4 = Symbol.for('key');
console.log(s3 === s4);  // true

// Symbol.keyFor()：返回全局 Symbol 的键
Symbol.keyFor(s1);  // undefined
Symbol.keyFor(s3);  // "key"
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** BigInt

### 题目

以下关于 BigInt 的说法，哪些是正确的？

**选项：**
- A. BigInt 可以表示任意大小的整数
- B. BigInt 和 Number 可以混合运算
- C. BigInt 不能用于 `Math` 对象的方法
- D. BigInt 可以用 `typeof` 检测

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, C, D

### 📖 解析

**BigInt 特性**

**A 正确：任意大小**
```javascript
const big = 9007199254740991n + 1n;  // OK
```

**B 错误：不能混合**
```javascript
1n + 1;  // TypeError
1n + BigInt(1);  // 2n（需转换）
```

**C 正确：不支持 Math**
```javascript
Math.max(1n, 2n);  // TypeError
```

**D 正确：typeof**
```javascript
typeof 123n;  // "bigint"
```

</details>

---

## 第 8 题 🔴

**类型：** 代码分析题  
**标签：** Map 迭代

### 题目

以下代码的输出是什么？

```javascript
const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
map.set('d', 4);
map.delete('b');

const iterator = map.keys();
console.log(iterator.next().value);
map.set('e', 5);
console.log(iterator.next().value);
console.log([...iterator]);
```

**选项：**
- A. `"a"`, `"c"`, `["d", "e"]`
- B. `"a"`, `"c"`, `["d"]`
- C. `"a"`, `"d"`, `["e"]`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Map 迭代器反映实时修改**

```javascript
// 当前: a, c, d
const iterator = map.keys();
iterator.next().value;  // "a"

map.set('e', 5);
// 当前: a, c, d, e
iterator.next().value;  // "c"
[...iterator];  // ["d", "e"]
```

</details>

---

## 第 9 题 🔴

**类型：** 代码输出题  
**标签：** 精度问题

### 题目

以下代码的输出是什么？

```javascript
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);
```

**选项：**
- A. `0.3`, `true`, `true`
- B. `0.30000000000000004`, `false`, `true`
- C. `0.3`, `false`, `true`
- D. `0.30000000000000004`, `false`, `false`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**浮点数精度问题**

```javascript
0.1 + 0.2;  // 0.30000000000000004
0.1 + 0.2 === 0.3;  // false
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON;  // true
```

**解决方案**
```javascript
// 使用 Number.EPSILON
function almostEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}

// 转为整数计算
(0.1 * 10 + 0.2 * 10) / 10;  // 0.3

// toFixed
Number((0.1 + 0.2).toFixed(2));  // 0.3
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** Intl

### 题目

`Intl.NumberFormat` 可以格式化哪些类型？

**选项：**
- A. 只能格式化普通数字
- B. 可以格式化货币和百分比
- C. 可以格式化单位（如长度、重量）
- D. B 和 C 都正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Intl.NumberFormat 的用途**

**货币格式**
```javascript
new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY'
}).format(1234.56);
// "¥1,234.56"
```

**百分比格式**
```javascript
new Intl.NumberFormat('en-US', {
  style: 'percent'
}).format(0.85);
// "85%"
```

**单位格式**
```javascript
new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'kilometer-per-hour'
}).format(120);
// "120 km/h"
```

**其他 Intl API**
```javascript
// 日期格式化
new Intl.DateTimeFormat('zh-CN').format(new Date());

// 字符串排序
['张三', '李四'].sort(new Intl.Collator('zh-CN').compare);

// 相对时间
new Intl.RelativeTimeFormat('zh-CN').format(-1, 'day');
// "1天前"
```

</details>

---

**本章总结：**
- ✅ Map vs Object
- ✅ Set 去重和集合运算
- ✅ Math 常用方法
- ✅ Date 时间处理
- ✅ WeakMap/WeakSet 弱引用
- ✅ Symbol 唯一标识
- ✅ BigInt 大整数
- ✅ Map/Set 迭代
- ✅ 浮点数精度
- ✅ Intl 国际化

**基础篇完成！下一步：** [第 9 章：异步编程](./chapter-09.md)
