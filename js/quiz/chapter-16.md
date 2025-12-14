# 第 16 章：类型系统与转换 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** ToPrimitive

### 题目

对象转换为基本类型时，会调用哪些方法？

**选项：**
- A. `toString()` → `valueOf()`
- B. `valueOf()` → `toString()`
- C. 取决于转换的目标类型（hint）
- D. 只调用 `toString()`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**ToPrimitive 转换规则**

转换顺序取决于 `hint`（期望的类型）。

**hint = "string"（字符串上下文）**
```javascript
const obj = {
  toString() {
    console.log('toString');
    return 'string';
  },
  valueOf() {
    console.log('valueOf');
    return 100;
  }
};

// 字符串上下文：toString → valueOf
String(obj);     // "toString" → "string"
`${obj}`;        // "toString" → "string"
obj + '';        // "toString" → "string"（特殊：先 valueOf）
```

**hint = "number"（数字上下文）**
```javascript
// 数字上下文：valueOf → toString
Number(obj);     // "valueOf" → 100
+obj;            // "valueOf" → 100
obj - 0;         // "valueOf" → 100
```

**hint = "default"（默认）**
```javascript
// 默认：valueOf → toString（同 number）
obj == 1;        // "valueOf" → false
obj + 1;         // "valueOf" → 101
```

---

**Symbol.toPrimitive 自定义转换**

```javascript
const obj = {
  [Symbol.toPrimitive](hint) {
    console.log('hint:', hint);
    
    if (hint === 'string') {
      return 'string';
    }
    if (hint === 'number') {
      return 100;
    }
    return null;  // default
  }
};

String(obj);   // hint: string → "string"
Number(obj);   // hint: number → 100
obj + '';      // hint: default → "null"
```

---

**完整的转换顺序**

```
1. 如果有 Symbol.toPrimitive 方法，调用它
2. 否则，根据 hint：
   - hint = "string": toString() → valueOf()
   - hint = "number": valueOf() → toString()
   - hint = "default": valueOf() → toString()
3. 如果返回的仍是对象，抛出 TypeError
```

**示例：**
```javascript
const obj = {
  valueOf() {
    return {};  // 返回对象
  },
  toString() {
    return {};  // 返回对象
  }
};

Number(obj);  // TypeError: Cannot convert object to primitive value
```

---

**Date 的特殊情况**

```javascript
const date = new Date();

// Date 的 hint 默认是 "string"
date + 1;  // 字符串拼接
date - 1;  // 数字运算

// 其他对象的 hint 默认是 "number"
const obj = {};
obj + 1;   // "[object Object]1"（先转为字符串）
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 相等比较

### 题目

`==` 和 `===` 的主要区别是什么？

**选项：**
- A. `==` 比较值，`===` 比较值和类型
- B. `==` 会进行类型转换，`===` 不会
- C. `==` 更快，`===` 更慢
- D. A 和 B 都对

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**== vs ===**

**`==`（宽松相等）：会进行类型转换**
```javascript
1 == '1';      // true（字符串转数字）
0 == false;    // true（布尔转数字）
null == undefined;  // true（特殊规则）

[] == 0;       // true
[] == '';      // true
```

**`===`（严格相等）：不进行类型转换**
```javascript
1 === '1';     // false
0 === false;   // false
null === undefined;  // false

[] === 0;      // false
```

---

**== 的类型转换规则**

| 比较 | 转换规则 |
|------|----------|
| 数字 == 字符串 | 字符串 → 数字 |
| 布尔 == 任意类型 | 布尔 → 数字 |
| 对象 == 基本类型 | 对象 → 基本类型 |
| null == undefined | true（特殊） |

```javascript
// 规则 1：字符串 → 数字
'123' == 123;  // true

// 规则 2：布尔 → 数字
true == 1;     // true
false == 0;    // true

// 规则 3：对象 → 基本类型
[1] == 1;      // true（[1].valueOf() → [1].toString() → "1" → 1）

// 规则 4：null 和 undefined
null == undefined;  // true
null == 0;          // false
undefined == 0;     // false
```

---

**常见陷阱**

```javascript
// [] == ![]
// 1. ![] → false
// 2. [] == false
// 3. false → 0
// 4. [] → "" → 0
// 5. 0 == 0 → true
[] == ![];  // true

// 其他陷阱
'' == 0;           // true
' ' == 0;          // true
'0' == 0;          // true
'\n' == 0;         // true

false == '0';      // true
false == '';       // true
false == [];       // true

null == false;     // false（特殊规则）
undefined == false;  // false
```

---

**Object.is（更严格的比较）**

```javascript
// Object.is vs ===

// NaN
NaN === NaN;           // false
Object.is(NaN, NaN);   // true

// +0 vs -0
+0 === -0;             // true
Object.is(+0, -0);     // false

// 其他情况相同
Object.is(1, 1);       // true
Object.is('a', 'a');   // true
```

---

**最佳实践**

```javascript
// ✅ 推荐：使用 ===
if (x === y) {}

// ❌ 避免：使用 ==
if (x == y) {}

// ✅ 例外：检查 null/undefined
if (x == null) {  // 等同于 x === null || x === undefined
  // x 是 null 或 undefined
}

// ✅ 使用 Object.is 处理特殊值
if (Object.is(x, NaN)) {}
if (Object.is(x, -0)) {}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 装箱拆箱

### 题目

基本类型可以调用方法，是因为 JavaScript 会自动进行装箱操作。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**装箱（Boxing）**

当基本类型调用方法时，JavaScript 会临时创建对应的包装对象。

```javascript
const str = 'hello';

// 调用方法时自动装箱
str.toUpperCase();  // "HELLO"

// 等价于
String(str).toUpperCase();
// 或
new String(str).toUpperCase();
```

---

**自动装箱过程**

```javascript
'hello'.charAt(0);

// 1. 创建 String 包装对象
const temp = new String('hello');

// 2. 调用方法
const result = temp.charAt(0);

// 3. 销毁临时对象
// temp 被回收

// 4. 返回结果
return result;  // "h"
```

---

**包装对象类型**

```javascript
// Number
const num = 123;
num.toFixed(2);  // "123.00"

// String
const str = 'hello';
str.substring(0, 2);  // "he"

// Boolean
const bool = true;
bool.toString();  // "true"

// Symbol（ES6）
const sym = Symbol('foo');
sym.toString();  // "Symbol(foo)"

// BigInt（ES2020）
const big = 123n;
big.toString();  // "123"
```

---

**显式装箱**

```javascript
// ❌ 不推荐：使用 new
const strObj = new String('hello');
typeof strObj;  // "object"
strObj instanceof String;  // true

// ✅ 推荐：不使用 new
const str = String('hello');
typeof str;  // "string"
```

---

**拆箱（Unboxing）**

包装对象转换为基本类型。

```javascript
const strObj = new String('hello');

// 自动拆箱
strObj + ' world';  // "hello world"
String(strObj);     // "hello"

// 显式拆箱
strObj.valueOf();   // "hello"
```

---

**装箱的限制**

```javascript
// 无法给基本类型添加属性
const str = 'hello';
str.prop = 'value';  // 装箱 → 赋值 → 拆箱（临时对象销毁）
console.log(str.prop);  // undefined

// 包装对象可以
const strObj = new String('hello');
strObj.prop = 'value';
console.log(strObj.prop);  // "value"
```

---

**null 和 undefined 的特殊性**

```javascript
// null 和 undefined 没有包装对象
null.toString();       // TypeError
undefined.toString();  // TypeError

// 无法装箱
Number(null);       // 0
Number(undefined);  // NaN
String(null);       // "null"
String(undefined);  // "undefined"
```

---

**性能考虑**

```javascript
// ❌ 创建大量临时对象
for (let i = 0; i < 1000000; i++) {
  const str = 'hello';
  str.toUpperCase();  // 每次都装箱
}

// ✅ 避免不必要的装箱
const str = 'hello';
const upper = str.toUpperCase();
for (let i = 0; i < 1000000; i++) {
  console.log(upper);  // 只装箱一次
}
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 隐式转换

### 题目

以下代码的输出是什么？

```javascript
console.log([] + []);
console.log([] + {});
console.log({} + []);
console.log({} + {});
```

**选项：**
- A. `""`, `"[object Object]"`, `"[object Object]"`, `"[object Object][object Object]"`
- B. `""`, `"[object Object]"`, `0`, `"[object Object][object Object]"`
- C. `0`, `0`, `0`, `0`
- D. `""`, `"[object Object]"`, `"[object Object]"`, `"NaN"`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（在浏览器控制台）

### 📖 解析

**对象相加的转换规则**

```javascript
// [] + []
// 1. [] → "" (toString)
// 2. "" + "" → ""
console.log([] + []);  // ""

// [] + {}
// 1. [] → ""
// 2. {} → "[object Object]"
// 3. "" + "[object Object]" → "[object Object]"
console.log([] + {});  // "[object Object]"

// {} + []
// ⚠️ 浏览器：{} 被解析为代码块，实际是 +[]
// +[] → 0
console.log({} + []);  // 0

// 在表达式中：
console.log(({} + []));  // "[object Object]"

// {} + {}
// 浏览器：{} 是代码块，+{} → NaN
console.log({} + {});  // NaN

// 在表达式中：
console.log(({} + {}));  // "[object Object][object Object]"
```

---

**详细转换步骤**

**数组转字符串：**
```javascript
[].toString();      // ""
[1, 2].toString();  // "1,2"
[[]].toString();    // ""
[[1]].toString();   // "1"
```

**对象转字符串：**
```javascript
({}).toString();    // "[object Object]"
```

**对象转数字：**
```javascript
Number([]);         // 0
Number([1]);        // 1
Number([1, 2]);     // NaN
Number({});         // NaN
```

---

**运算符重载陷阱**

```javascript
// + 运算符
1 + 2;              // 3（数字相加）
'1' + '2';          // "12"（字符串拼接）
1 + '2';            // "12"（一个字符串则拼接）
[] + {};            // "[object Object]"

// 其他运算符：转换为数字
[] - 0;             // 0
{} - 0;             // NaN
[] * 2;             // 0
{} * 2;             // NaN
```

---

**valueOf vs toString**

```javascript
const obj = {
  valueOf() {
    console.log('valueOf');
    return 100;
  },
  toString() {
    console.log('toString');
    return 'string';
  }
};

// + 运算符：特殊处理
obj + 1;  
// "valueOf" → 101

// String()：调用 toString
String(obj);
// "toString" → "string"

// Number()：调用 valueOf
Number(obj);
// "valueOf" → 100
```

---

**实际应用：避免陷阱**

```javascript
// ❌ 容易出错
const result = [] + {};
const result2 = {} + [];

// ✅ 明确意图
const result = String([]) + String({});
const result2 = String({}) + String([]);

// ✅ 使用模板字符串
const result = `${[]}${{}}`; // "[object Object]"

// ✅ 使用 JSON.stringify
const result = JSON.stringify([]) + JSON.stringify({});  // "[]{}"`
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** 类型转换优先级

### 题目

以下代码的输出是什么？

```javascript
const a = {
  valueOf() { return 1; },
  toString() { return '2'; }
};

console.log(a + 3);
console.log(String(a));
console.log(Number(a));
```

**选项：**
- A. `4`, `"2"`, `1`
- B. `"23"`, `"2"`, `1`
- C. `4`, `"1"`, `1`
- D. `"13"`, `"2"`, `1`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**转换方法的调用顺序**

```javascript
const a = {
  valueOf() {
    console.log('valueOf');
    return 1;
  },
  toString() {
    console.log('toString');
    return '2';
  }
};

// + 运算符：hint = "default" → valueOf
a + 3;
// "valueOf" → 1 + 3 = 4

// String()：hint = "string" → toString
String(a);
// "toString" → "2"

// Number()：hint = "number" → valueOf
Number(a);
// "valueOf" → 1
```

---

**不同场景的 hint**

**hint = "string"**
```javascript
String(a);          // toString → valueOf
`${a}`;             // toString → valueOf
a + '';             // 特殊：valueOf → toString
```

**hint = "number"**
```javascript
Number(a);          // valueOf → toString
+a;                 // valueOf → toString
a - 0;              // valueOf → toString
```

**hint = "default"**
```javascript
a + 3;              // valueOf → toString
a == 1;             // valueOf → toString
```

---

**Symbol.toPrimitive 优先级最高**

```javascript
const obj = {
  [Symbol.toPrimitive](hint) {
    console.log('toPrimitive:', hint);
    return 999;
  },
  valueOf() {
    console.log('valueOf');
    return 1;
  },
  toString() {
    console.log('toString');
    return '2';
  }
};

obj + 3;      // "toPrimitive: default" → 1002
String(obj);  // "toPrimitive: string" → "999"
Number(obj);  // "toPrimitive: number" → 999
```

---

**覆盖转换方法**

```javascript
// 自定义 Date 转换
Date.prototype[Symbol.toPrimitive] = function(hint) {
  if (hint === 'string') {
    return this.toDateString();
  }
  return this.getTime();
};

const date = new Date('2024-01-01');
String(date);  // "Mon Jan 01 2024"
Number(date);  // 1704067200000
date + 0;      // 1704067200000
```

---

**返回值类型的影响**

```javascript
const obj = {
  valueOf() {
    return {};  // 返回对象
  },
  toString() {
    return 100;  // 返回数字
  }
};

// valueOf 返回对象，继续调用 toString
obj + 1;  // 101

const obj2 = {
  valueOf() {
    return {};
  },
  toString() {
    return {};  // 也返回对象
  }
};

// 都返回对象，抛出错误
obj2 + 1;  // TypeError
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** SameValue vs SameValueZero

### 题目

`Object.is()`、`===` 和 `==` 对 `NaN` 和 `+0/-0` 的处理有什么区别？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**三种比较方式的区别**

| 比较 | `==` | `===` | `Object.is()` |
|------|------|-------|---------------|
| `NaN == NaN` | false | false | **true** |
| `+0 == -0` | true | true | **false** |
| `undefined == null` | **true** | false | false |

```javascript
// NaN
NaN == NaN;           // false
NaN === NaN;          // false
Object.is(NaN, NaN);  // true ✓

// +0 vs -0
+0 == -0;             // true
+0 === -0;            // true
Object.is(+0, -0);    // false ✓

// null vs undefined
null == undefined;    // true ✓
null === undefined;   // false
Object.is(null, undefined);  // false
```

---

**检测 NaN 的方法**

```javascript
const num = NaN;

// ❌ 直接比较
num === NaN;          // false

// ✅ Object.is
Object.is(num, NaN);  // true

// ✅ Number.isNaN
Number.isNaN(num);    // true

// ✅ isNaN（不推荐，会类型转换）
isNaN(num);           // true
isNaN('abc');         // true（会转换）

// ✅ 自比较
num !== num;          // true（只有 NaN 不等于自己）
```

---

**检测 +0 vs -0**

```javascript
function isNegativeZero(num) {
  return num === 0 && 1 / num === -Infinity;
}

isNegativeZero(0);    // false
isNegativeZero(-0);   // true

// 或使用 Object.is
Object.is(num, -0);
```

---

**SameValue vs SameValueZero**

ECMAScript 定义了两种相等算法：

**SameValue（Object.is）**
- `NaN` 等于 `NaN`
- `+0` 不等于 `-0`

**SameValueZero（Set、Map 的键比较）**
- `NaN` 等于 `NaN`
- `+0` 等于 `-0`

```javascript
// Set 使用 SameValueZero
const set = new Set([NaN, NaN, +0, -0]);
console.log(set.size);  // 2（NaN 去重，+0 和 -0 去重）

// Map 使用 SameValueZero
const map = new Map();
map.set(NaN, 'a');
map.set(NaN, 'b');  // 覆盖
console.log(map.size);  // 1

map.set(+0, 'c');
map.set(-0, 'd');  // 覆盖
console.log(map.size);  // 2
```

---

**实际应用**

```javascript
// 查找数组中的 NaN
function findNaN(arr) {
  return arr.findIndex(item => Object.is(item, NaN));
}

const arr = [1, NaN, 3];
findNaN(arr);  // 1

// includes 使用 SameValueZero
[NaN].includes(NaN);  // true
[NaN].indexOf(NaN);   // -1（indexOf 使用 ===）

// 安全的缓存键
const cache = new Map();
cache.set(NaN, 'value');
cache.has(NaN);  // true（SameValueZero）

// 区分 +0 和 -0
const data = new Map([[+0, 'positive'], [-0, 'negative']]);
data.get(+0);  // "negative"（-0 覆盖了 +0）
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 类型检测

### 题目

以下哪些方法可以准确判断数组类型？

**选项：**
- A. `typeof arr === 'object'`
- B. `arr instanceof Array`
- C. `Array.isArray(arr)`
- D. `Object.prototype.toString.call(arr) === '[object Array]'`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C, D

### 📖 解析

**数组类型检测方法**

**A 不准确：typeof**
```javascript
typeof [];    // "object"（无法区分数组和对象）
typeof {};    // "object"
typeof null;  // "object"（历史遗留问题）
```

**B 有缺陷：instanceof**
```javascript
[] instanceof Array;  // true

// ❌ 跨 iframe 问题
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const iframeArray = iframe.contentWindow.Array;

const arr = new iframeArray();
arr instanceof Array;  // false（不同的 Array 构造函数）
```

**C 推荐：Array.isArray**
```javascript
Array.isArray([]);     // true
Array.isArray({});     // false
Array.isArray(null);   // false

// ✅ 跨 iframe 可用
const iframeArr = iframe.contentWindow.Array.from([1, 2]);
Array.isArray(iframeArr);  // true
```

**D 准确：Object.prototype.toString**
```javascript
Object.prototype.toString.call([]);     // "[object Array]"
Object.prototype.toString.call({});     // "[object Object]"
Object.prototype.toString.call(null);   // "[object Null]"

// ✅ 跨 iframe 可用
Object.prototype.toString.call(iframeArr);  // "[object Array]"
```

---

**完整的类型检测函数**

```javascript
function getType(value) {
  // null 特殊处理
  if (value === null) return 'null';
  
  // 基本类型
  const type = typeof value;
  if (type !== 'object') return type;
  
  // 对象类型
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

// 测试
getType([]);           // "array"
getType({});           // "object"
getType(null);         // "null"
getType(undefined);    // "undefined"
getType(new Date());   // "date"
getType(/regex/);      // "regexp"
getType(new Map());    // "map"
getType(new Set());    // "set"
```

---

**各种类型的 toString 结果**

```javascript
const types = [
  [],
  {},
  null,
  undefined,
  123,
  'string',
  true,
  Symbol(),
  123n,
  function() {},
  new Date(),
  /regex/,
  new Error(),
  new Map(),
  new Set(),
  new WeakMap(),
  new WeakSet(),
  Promise.resolve(),
  new Int8Array()
];

types.forEach(item => {
  console.log(Object.prototype.toString.call(item));
});

// [object Array]
// [object Object]
// [object Null]
// [object Undefined]
// [object Number]
// [object String]
// [object Boolean]
// [object Symbol]
// [object BigInt]
// [object Function]
// [object Date]
// [object RegExp]
// [object Error]
// [object Map]
// [object Set]
// [object WeakMap]
// [object WeakSet]
// [object Promise]
// [object Int8Array]
```

---

**自定义 toString 标签**

```javascript
class MyClass {
  get [Symbol.toStringTag]() {
    return 'MyClass';
  }
}

const obj = new MyClass();
Object.prototype.toString.call(obj);  // "[object MyClass]"
```

---

**类型检测最佳实践**

```javascript
// 数组
Array.isArray(value);

// 普通对象
Object.prototype.toString.call(value) === '[object Object]';

// null
value === null;

// undefined
typeof value === 'undefined';
value === undefined;

// 函数
typeof value === 'function';

// 基本类型
typeof value === 'string';
typeof value === 'number';
typeof value === 'boolean';
typeof value === 'symbol';
typeof value === 'bigint';

// Date
value instanceof Date;
Object.prototype.toString.call(value) === '[object Date]';

// RegExp
value instanceof RegExp;
Object.prototype.toString.call(value) === '[object RegExp]';
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** 类型转换函数

### 题目

实现一个安全的类型转换函数，处理各种边界情况。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

**安全类型转换工具**

```javascript
class TypeConverter {
  // 转换为数字
  static toNumber(value, defaultValue = 0) {
    // null → 0
    if (value === null) return 0;
    
    // undefined → NaN → defaultValue
    if (value === undefined) return defaultValue;
    
    // 布尔值
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    
    // 字符串
    if (typeof value === 'string') {
      // 空字符串 → 0
      if (value.trim() === '') return 0;
      
      const num = Number(value);
      return Number.isNaN(num) ? defaultValue : num;
    }
    
    // Symbol/BigInt 无法转换
    if (typeof value === 'symbol' || typeof value === 'bigint') {
      return defaultValue;
    }
    
    // 对象
    if (typeof value === 'object') {
      const primitive = this.toPrimitive(value, 'number');
      return this.toNumber(primitive, defaultValue);
    }
    
    // 其他
    const num = Number(value);
    return Number.isNaN(num) ? defaultValue : num;
  }
  
  // 转换为字符串
  static toString(value, defaultValue = '') {
    // null/undefined
    if (value == null) return defaultValue;
    
    // Symbol
    if (typeof value === 'symbol') {
      return value.toString();
    }
    
    // 其他
    return String(value);
  }
  
  // 转换为布尔值
  static toBoolean(value) {
    return Boolean(value);
  }
  
  // 转换为整数
  static toInteger(value, defaultValue = 0) {
    const num = this.toNumber(value, defaultValue);
    
    // 特殊值
    if (!Number.isFinite(num)) return defaultValue;
    
    // 取整
    return Math.trunc(num);
  }
  
  // 安全的 JSON 解析
  static parseJSON(str, defaultValue = null) {
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  }
  
  // 转换为基本类型
  static toPrimitive(value, hint = 'default') {
    if (value == null || typeof value !== 'object') {
      return value;
    }
    
    // Symbol.toPrimitive
    const exoticToPrim = value[Symbol.toPrimitive];
    if (exoticToPrim !== undefined) {
      const result = exoticToPrim.call(value, hint);
      if (typeof result !== 'object') return result;
      throw new TypeError('Cannot convert object to primitive value');
    }
    
    // 默认转换
    if (hint === 'string') {
      return this._ordinaryToPrimitive(value, ['toString', 'valueOf']);
    }
    return this._ordinaryToPrimitive(value, ['valueOf', 'toString']);
  }
  
  // 辅助方法
  static _ordinaryToPrimitive(obj, methods) {
    for (const method of methods) {
      const func = obj[method];
      if (typeof func === 'function') {
        const result = func.call(obj);
        if (typeof result !== 'object') return result;
      }
    }
    throw new TypeError('Cannot convert object to primitive value');
  }
}

// 测试
console.log(TypeConverter.toNumber('123'));      // 123
console.log(TypeConverter.toNumber('abc', -1));  // -1
console.log(TypeConverter.toNumber(null));       // 0
console.log(TypeConverter.toNumber(undefined, -1)); // -1

console.log(TypeConverter.toString(123));        // "123"
console.log(TypeConverter.toString(null, 'N/A')); // "N/A"

console.log(TypeConverter.toInteger(3.14));      // 3
console.log(TypeConverter.toInteger('3.14'));    // 3

console.log(TypeConverter.parseJSON('{"x":1}')); // {x: 1}
console.log(TypeConverter.parseJSON('invalid', {})); // {}
```

---

**扩展：类型验证**

```javascript
class TypeValidator {
  static isNumber(value) {
    return typeof value === 'number' && !Number.isNaN(value);
  }
  
  static isInteger(value) {
    return Number.isInteger(value);
  }
  
  static isPositive(value) {
    return this.isNumber(value) && value > 0;
  }
  
  static isInRange(value, min, max) {
    return this.isNumber(value) && value >= min && value <= max;
  }
  
  static isString(value) {
    return typeof value === 'string';
  }
  
  static isNonEmptyString(value) {
    return this.isString(value) && value.trim().length > 0;
  }
  
  static isArray(value) {
    return Array.isArray(value);
  }
  
  static isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  }
  
  static isFunction(value) {
    return typeof value === 'function';
  }
  
  static isDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime());
  }
}
```

---

**实际应用：表单验证**

```javascript
function validateForm(data) {
  const errors = {};
  
  // 年龄：必须是 18-100 的整数
  const age = TypeConverter.toInteger(data.age, -1);
  if (!TypeValidator.isInRange(age, 18, 100)) {
    errors.age = '年龄必须在 18-100 之间';
  }
  
  // 姓名：非空字符串
  const name = TypeConverter.toString(data.name).trim();
  if (!TypeValidator.isNonEmptyString(name)) {
    errors.name = '姓名不能为空';
  }
  
  // 邮箱：可选，但格式正确
  if (data.email) {
    const email = TypeConverter.toString(data.email);
    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(email)) {
      errors.email = '邮箱格式不正确';
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** 复杂类型转换

### 题目

分析以下表达式的执行过程和结果。

```javascript
(![] + [])[+[]] +
(![] + [])[+!+[]] +
([![]] + [][[]])[+!+[] + [+[]]] +
(![] + [])[!+[] + !+[]]
```

<details>
<summary>查看答案</summary>

### ✅ 答案：`"fail"`

### 📖 解析

**逐步解析**

```javascript
// 基础转换
![]          // false（空数组是真值）
+[]          // 0（数组转数字）
+!+[]        // 1（!+[] = true，+true = 1）
[][[]]       // undefined（访问不存在的属性）

// 第一部分：(![] + [])[+[]]
![] + []     // "false"（false + "" = "false"）
+[]          // 0
"false"[0]   // "f"

// 第二部分：(![] + [])[+!+[]]
![] + []     // "false"
+!+[]        // 1
"false"[1]   // "a"

// 第三部分：([![]] + [][[]])[+!+[] + [+[]]]
![[]]        // false
[![]]        // [false]
[][[]]       // undefined
[false] + undefined  // "falseundefined"

+!+[]        // 1
[+[]]        // [0]
1 + [0]      // "10"
"falseundefined"[10]  // "i"

// 第四部分：(![] + [])[!+[] + !+[]]
![] + []     // "false"
!+[]         // true
!+[] + !+[]  // 2
"false"[2]   // "l"

// 结果："f" + "a" + "i" + "l" = "fail"
```

---

**类似的技巧**

```javascript
// 获取字符串 "true"
(!![] + [])[+[]]        // "t"
(!![] + [])[+!+[]]      // "r"
(!![] + [])[!+[] + !+[]] // "u"

// 获取字符串 "undefined"
([][[]]+[])[+[]]        // "u"

// 获取字符串 "NaN"
(+[![]]+[])[+[]]        // "N"

// 获取字符串 "Infinity"
((+!![]/+[])+[])[+[]]   // "I"
```

---

**JavaScript 混淆的原理**

这类代码利用了：
1. 类型转换规则
2. 运算符优先级
3. 字符串索引访问

```javascript
// 清晰版本
const falseStr = String(false);  // "false"
const result = 
  falseStr[0] +  // "f"
  falseStr[1] +  // "a"
  falseStr[2] +  // "i"
  falseStr[2];   // "l"
// "fail"

// 混淆版本
(![] + [])[+[]] +
(![] + [])[+!+[]] +
([![]] + [][[]])[+!+[] + [+[]]] +
(![] + [])[!+[] + !+[]];
```

---

**实际应用（反面教材）**

```javascript
// ❌ 不要这样写
const url = ([![]]+[])[+!+[]]+([![]]+[])[+!+[]]+...;

// ✅ 正常写法
const url = 'http://example.com';

// 但可以用于：
// 1. 代码混淆（保护源码）
// 2. CTF 题目
// 3. 理解类型转换机制
```

---

**防御混淆代码**

```javascript
// 检测可疑代码
function detectObfuscation(code) {
  const patterns = [
    /\[\!\[\]\]/,     // [![]]
    /\+\!\+\[\]/,     // +!+[]
    /\[\]\[\[\]\]/,   // [][[]]
  ];
  
  return patterns.some(pattern => pattern.test(code));
}

// 使用
const code = '(![] + [])[+[]]';
if (detectObfuscation(code)) {
  console.warn('检测到混淆代码');
}
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 类型系统总结

### 题目

JavaScript 的类型系统包括哪些内容？各有什么特点？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**JavaScript 类型系统概览**

**1. 基本类型（Primitive Types）**
```javascript
// 7 种基本类型
undefined
null
boolean
number
string
symbol (ES6)
bigint (ES2020)

// 特点：
// - 不可变
// - 按值传递
// - 存储在栈中
```

**2. 对象类型（Object Types）**
```javascript
// 对象
{}
[]
function() {}
new Date()
/regex/
...

// 特点：
// - 可变
// - 按引用传递
// - 存储在堆中
```

---

**类型转换总结**

**显式转换：**
```javascript
// 转数字
Number(value)
parseInt(value)
parseFloat(value)
+value

// 转字符串
String(value)
value.toString()
`${value}`

// 转布尔
Boolean(value)
!!value
```

**隐式转换：**
```javascript
// 数学运算
value - 0    // 转数字
value + ''   // 转字符串
!value       // 转布尔

// 比较
value == 1   // 类型转换
```

---

**类型检测方法**

```javascript
// typeof
typeof value

// instanceof
value instanceof Constructor

// Object.prototype.toString
Object.prototype.toString.call(value)

// Array.isArray
Array.isArray(value)

// Number.isNaN
Number.isNaN(value)

// Number.isFinite
Number.isFinite(value)

// Number.isInteger
Number.isInteger(value)
```

---

**特殊值处理**

```javascript
// NaN
Number.isNaN(value)
Object.is(value, NaN)
value !== value

// Infinity
Number.isFinite(value)
value === Infinity

// null vs undefined
value == null  // 都为 true
value === null
value === undefined

// +0 vs -0
Object.is(value, -0)
1 / value === -Infinity
```

---

**类型转换规则表**

| 原始值 | Number | String | Boolean |
|--------|--------|--------|---------|
| `undefined` | `NaN` | `"undefined"` | `false` |
| `null` | `0` | `"null"` | `false` |
| `true` | `1` | `"true"` | `true` |
| `false` | `0` | `"false"` | `false` |
| `""` | `0` | `""` | `false` |
| `"123"` | `123` | `"123"` | `true` |
| `"abc"` | `NaN` | `"abc"` | `true` |
| `0` | `0` | `"0"` | `false` |
| `NaN` | `NaN` | `"NaN"` | `false` |
| `Infinity` | `Infinity` | `"Infinity"` | `true` |
| `[]` | `0` | `""` | `true` |
| `[1]` | `1` | `"1"` | `true` |
| `[1,2]` | `NaN` | `"1,2"` | `true` |
| `{}` | `NaN` | `"[object Object]"` | `true` |

---

**最佳实践**

```javascript
// ✅ 使用严格相等
value === expected

// ✅ 显式类型转换
Number(value)
String(value)
Boolean(value)

// ✅ 类型检查
if (typeof value === 'string') {}
if (Array.isArray(value)) {}

// ✅ 防御性编程
const num = Number(value) || 0;
const str = String(value) || '';

// ❌ 避免隐式转换
value == expected  // 除非检查 null/undefined
value + ''         // 使用 String(value)
+value             // 使用 Number(value)
```

</details>

---

**本章总结：**
- ✅ ToPrimitive 转换
- ✅ 相等比较规则
- ✅ 装箱拆箱
- ✅ 隐式转换陷阱
- ✅ 转换优先级
- ✅ SameValue 算法
- ✅ 类型检测方法
- ✅ 安全类型转换
- ✅ 复杂类型转换
- ✅ 类型系统总结

**下一章：** [第 17 章：迭代器与生成器协议](./chapter-17.md)
