# 数据类型概览

> 建立 JS 类型系统的整体认知

---

## 概述

JavaScript 有 **8 种数据类型**：7 种原始类型 + 1 种对象类型。

- **原始类型（Primitive）**：Undefined、Null、Boolean、Number、String、Symbol、BigInt
- **对象类型（Object）**：Object（包括 Array、Function、Date 等）

理解类型系统是掌握 JavaScript 的基础，尤其是原始值与引用值的差异。

---

## 1. 原始类型（Primitive Types）

### 1.1 Undefined

**定义**：表示"未定义"，只有一个值 `undefined`。

```javascript
let x;
console.log(x);  // undefined

let obj = {};
console.log(obj.notExist);  // undefined

function foo() {}
console.log(foo());  // undefined（无返回值）
```

**产生场景**：
1. 声明但未初始化的变量
2. 访问对象不存在的属性
3. 函数没有返回值
4. 函数参数未传递

**注意事项**：
```javascript
// undefined 可以被赋值（非严格模式）
var undefined = 123;  // ❌ 不要这样做
console.log(undefined);  // 123（混乱！）

// 安全的 undefined 判断
void 0 === undefined  // true（void 0 始终返回真正的 undefined）
```

### 1.2 Null

**定义**：表示"空对象指针"，只有一个值 `null`。

```javascript
let obj = null;  // 显式表示"无对象"
console.log(obj);  // null
```

**Null vs Undefined**

| 特性 | Undefined | Null |
|------|-----------|------|
| 含义 | 未定义 | 空值/无对象 |
| 类型 | `typeof` 返回 "undefined" | `typeof` 返回 "object"（bug） |
| 转为数字 | NaN | 0 |
| 使用场景 | 系统默认 | 程序员主动设置 |

```javascript
// 典型用法
let user = null;  // 用户未登录

// 清空引用
let obj = { data: "..." };
obj = null;  // 帮助垃圾回收
```

**历史 Bug**：
```javascript
typeof null  // "object"（应该是 "null"，但改不了了）

// 原因：JS 早期实现中，null 的类型标签与对象相同
// 详见：https://2ality.com/2013/10/typeof-null.html
```

### 1.3 Boolean

**定义**：表示逻辑值，只有两个值：`true` 和 `false`。

```javascript
let isActive = true;
let isDeleted = false;

console.log(typeof true);  // "boolean"
```

**转换规则**（重要！）

| 数据类型 | 转为 true | 转为 false |
|---------|----------|-----------|
| Boolean | true | false |
| String | 非空字符串 | ""（空字符串） |
| Number | 非零数字（包括 Infinity） | 0、-0、NaN |
| Object | 任何对象 | - |
| Undefined | - | undefined |
| Null | - | null |

```javascript
// 假值（Falsy Values）：转为 false 的值
Boolean(false)      // false
Boolean(0)          // false
Boolean(-0)         // false
Boolean(0n)         // false（BigInt 的零）
Boolean("")         // false
Boolean(null)       // false
Boolean(undefined)  // false
Boolean(NaN)        // false

// 其他都是真值
Boolean("0")        // true（字符串 "0"）
Boolean([])         // true（空数组也是对象）
Boolean({})         // true（空对象）
Boolean(function(){})  // true
```

### 1.4 Number

**定义**：IEEE 754 标准的 64 位双精度浮点数。

```javascript
let integer = 42;
let float = 3.14;
let negative = -10;
let exponential = 1.5e3;  // 1500

console.log(typeof 42);  // "number"
```

**特殊值**：
```javascript
// 正无穷
console.log(1 / 0);  // Infinity
console.log(Number.POSITIVE_INFINITY);  // Infinity

// 负无穷
console.log(-1 / 0);  // -Infinity
console.log(Number.NEGATIVE_INFINITY);  // -Infinity

// 非数字
console.log(0 / 0);  // NaN
console.log("abc" * 2);  // NaN
console.log(Number.NaN);  // NaN

// NaN 的特性
console.log(NaN === NaN);  // false（唯一不等于自己的值）
console.log(isNaN(NaN));  // true
console.log(Number.isNaN(NaN));  // true（更严格）
```

**数值范围**：
```javascript
Number.MAX_VALUE      // 1.7976931348623157e+308
Number.MIN_VALUE      // 5e-324（最小正数）
Number.MAX_SAFE_INTEGER  // 9007199254740991 (2^53 - 1)
Number.MIN_SAFE_INTEGER  // -9007199254740991
```

**精度问题**（重要！）

```javascript
// 浮点数精度问题
console.log(0.1 + 0.2);  // 0.30000000000000004（而非 0.3）
console.log(0.1 + 0.2 === 0.3);  // false

// 原因：二进制无法精确表示某些十进制小数
// 解决方案 1：整数运算
console.log((0.1 * 10 + 0.2 * 10) / 10);  // 0.3

// 解决方案 2：Number.EPSILON
function equal(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}
console.log(equal(0.1 + 0.2, 0.3));  // true

// 解决方案 3：toFixed（注意返回字符串）
console.log((0.1 + 0.2).toFixed(2));  // "0.30"
```

**大整数精度丢失**

```javascript
// 超过安全整数范围会丢失精度
console.log(9007199254740992);     // 9007199254740992
console.log(9007199254740993);     // 9007199254740992（精度丢失）
console.log(9007199254740992 === 9007199254740993);  // true（危险！）

// 使用 BigInt 解决（见下文）
```

### 1.5 String

**定义**：文本数据，由 16 位 Unicode 字符组成。

```javascript
let single = 'Hello';
let double = "World";
let template = `Hello ${name}`;  // 模板字符串

console.log(typeof "hello");  // "string"
```

**字符串的不可变性**

```javascript
let str = "Hello";
str[0] = "h";  // 无效操作（不报错）
console.log(str);  // "Hello"（未改变）

// 字符串方法返回新字符串
let upper = str.toUpperCase();  // "HELLO"
console.log(str);  // "Hello"（原字符串不变）
```

**长度与字符访问**

```javascript
let str = "Hello";
console.log(str.length);  // 5
console.log(str[0]);  // "H"
console.log(str.charAt(0));  // "H"
console.log(str.charCodeAt(0));  // 72（字符编码）
```

**Unicode 与 Emoji 的坑**

```javascript
// 基本字符
let str1 = "A";
console.log(str1.length);  // 1

// Emoji（可能占多个码元）
let str2 = "😀";
console.log(str2.length);  // 2（而非 1）
console.log([...str2].length);  // 1（正确）

// 复杂字符
let str3 = "👨‍👩‍👧‍👦";  // 家庭 emoji
console.log(str3.length);  // 11（由多个字符组成）
console.log([...str3].length);  // 7
```

### 1.6 Symbol（ES6）

**定义**：唯一且不可变的原始值，通常用作对象属性键。

```javascript
let sym1 = Symbol();
let sym2 = Symbol();
console.log(sym1 === sym2);  // false（每次都是唯一的）

// 带描述
let sym3 = Symbol("mySymbol");
console.log(sym3.toString());  // "Symbol(mySymbol)"
```

**应用场景 1：防止属性名冲突**

```javascript
// 第三方库 A
const KEY_A = Symbol("config");
obj[KEY_A] = { /*...*/ };

// 第三方库 B
const KEY_B = Symbol("config");  // 不会冲突
obj[KEY_B] = { /*...*/ };
```

**应用场景 2：私有属性模拟**

```javascript
const _private = Symbol("private");

class MyClass {
  constructor() {
    this[_private] = "secret";
  }
  
  getPrivate() {
    return this[_private];
  }
}

let obj = new MyClass();
console.log(obj.getPrivate());  // "secret"
console.log(Object.keys(obj));  // []（Symbol 属性不可枚举）
```

**内置 Symbol**

```javascript
// Symbol.iterator：定义对象的迭代器
let obj = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        return { value: i++, done: i > 3 };
      }
    };
  }
};

for (let val of obj) {
  console.log(val);  // 0, 1, 2
}
```

### 1.7 BigInt（ES2020）

**定义**：表示任意精度的整数。

```javascript
// 创建方式
let big1 = 9007199254740991n;  // 数字后加 n
let big2 = BigInt("9007199254740991");
let big3 = BigInt(9007199254740991);

console.log(typeof big1);  // "bigint"
```

**解决大整数精度问题**

```javascript
// Number 精度丢失
console.log(9007199254740992 === 9007199254740993);  // true（错误！）

// BigInt 精确
console.log(9007199254740992n === 9007199254740993n);  // false（正确）
```

**运算规则**

```javascript
// 只能与 BigInt 运算
console.log(1n + 2n);  // 3n
console.log(1n + 2);   // ❌ TypeError: Cannot mix BigInt and other types

// 需要显式转换
console.log(1n + BigInt(2));  // 3n
console.log(Number(1n) + 2);  // 3

// 除法向下取整
console.log(5n / 2n);  // 2n（而非 2.5）
```

**限制**

```javascript
// 不能用于 Math 方法
Math.sqrt(4n);  // ❌ TypeError

// 不能与 Number 比较（除了 == 和 !=）
console.log(1n == 1);   // true
console.log(1n === 1);  // false
console.log(1n < 2);    // true
```

---

## 2. 对象类型（Object Type）

### 2.1 Object 的本质

**定义**：属性的集合，属性可以是任何值（包括函数）。

```javascript
let obj = {
  name: "Alice",
  age: 30,
  greet() {
    console.log("Hello");
  }
};

console.log(typeof obj);  // "object"
```

### 2.2 对象的子类型

所有非原始值都是对象的子类型：

```javascript
// 普通对象
let obj = {};
console.log(typeof obj);  // "object"

// 数组
let arr = [1, 2, 3];
console.log(typeof arr);  // "object"
console.log(Array.isArray(arr));  // true

// 函数（特殊的对象）
function fn() {}
console.log(typeof fn);  // "function"
console.log(fn instanceof Object);  // true

// 日期
let date = new Date();
console.log(typeof date);  // "object"

// 正则
let regex = /abc/;
console.log(typeof regex);  // "object"
```

### 2.3 包装对象（Wrapper Objects）

**机制**：原始值调用方法时，临时转为包装对象。

```javascript
// 原始字符串
let str = "hello";
console.log(str.toUpperCase());  // "HELLO"

// 背后的过程（简化）
// 1. 创建临时包装对象：new String("hello")
// 2. 调用方法：toUpperCase()
// 3. 销毁包装对象

// 证明：无法添加属性
let str = "hello";
str.customProp = "value";
console.log(str.customProp);  // undefined（包装对象被销毁）
```

**包装对象的类型**

```javascript
// String
let strObj = new String("hello");
console.log(typeof strObj);  // "object"
console.log(strObj instanceof String);  // true

// Number
let numObj = new Number(42);
console.log(typeof numObj);  // "object"

// Boolean
let boolObj = new Boolean(true);
console.log(typeof boolObj);  // "object"

// Symbol 和 BigInt 没有包装对象构造器
// new Symbol();  // ❌ TypeError
// new BigInt(1); // ❌ TypeError
```

**陷阱：包装对象总是真值**

```javascript
let falseObj = new Boolean(false);
if (falseObj) {
  console.log("这会执行");  // 对象是真值！
}

// 避免使用包装对象
console.log(false == falseObj);   // true
console.log(false === falseObj);  // false
```

---

## 3. 原始值 vs 引用值

### 3.1 存储方式

**原始值**：存储在栈（Stack）中，按值访问。

```javascript
let a = 10;
let b = a;  // 复制值
b = 20;
console.log(a);  // 10（不受影响）
```

**引用值**：存储在堆（Heap）中，栈中存储引用（指针）。

```javascript
let obj1 = { value: 10 };
let obj2 = obj1;  // 复制引用
obj2.value = 20;
console.log(obj1.value);  // 20（受影响）
```

### 3.2 比较方式

**原始值**：按值比较

```javascript
console.log(1 === 1);  // true
console.log("a" === "a");  // true
```

**引用值**：按引用比较

```javascript
console.log({} === {});  // false（不同引用）
console.log([] === []);  // false

let obj1 = { value: 1 };
let obj2 = { value: 1 };
console.log(obj1 === obj2);  // false（内容相同但引用不同）

let obj3 = obj1;
console.log(obj1 === obj3);  // true（相同引用）
```

### 3.3 传递方式

**原始值**：按值传递

```javascript
function modify(x) {
  x = 100;
}

let num = 10;
modify(num);
console.log(num);  // 10（不受影响）
```

**引用值**：按引用传递（但引用本身是按值传递）

```javascript
function modify(obj) {
  obj.value = 100;  // 修改对象属性
}

let data = { value: 10 };
modify(data);
console.log(data.value);  // 100（受影响）

// 但重新赋值无效
function reassign(obj) {
  obj = { value: 999 };  // 改变局部变量的引用
}

reassign(data);
console.log(data.value);  // 100（不受影响）
```

---

## 4. 类型判断概览

### 4.1 typeof 运算符

```javascript
typeof undefined        // "undefined"
typeof null             // "object"（bug）
typeof true             // "boolean"
typeof 42               // "number"
typeof "hello"          // "string"
typeof Symbol()         // "symbol"
typeof 42n              // "bigint"
typeof {}               // "object"
typeof []               // "object"
typeof function(){}     // "function"
```

**局限性**：
- `typeof null` 返回 "object"
- 无法区分数组、对象、Date 等

### 4.2 instanceof 运算符

```javascript
[] instanceof Array          // true
[] instanceof Object         // true
function(){} instanceof Function  // true

// 原始值返回 false
"hello" instanceof String    // false
new String("hello") instanceof String  // true
```

### 4.3 完整判断（预览）

```javascript
// 通用类型判断
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

console.log(getType(null));      // "Null"
console.log(getType([]));        // "Array"
console.log(getType(new Date())); // "Date"
```

---

## 5. 后端开发者常见误解

### 5.1 "弱类型 = 无类型" ❌

```javascript
// JavaScript 有类型，只是动态检查
let x = "hello";
x.toFixed();  // ❌ TypeError: x.toFixed is not a function
```

### 5.2 "对象 = Java/Python 的字典" ❌

```javascript
// JS 对象有原型链
let obj = {};
console.log(obj.toString);  // [Function: toString]（继承自原型）

// Python 字典没有继承
// dict = {}
// dict.toString  # AttributeError
```

### 5.3 "数组 = 传统数组" ❌

```javascript
// JS 数组是对象，可以稀疏
let arr = [];
arr[0] = "a";
arr[2] = "c";  // 跳过索引 1
console.log(arr);  // ["a", empty, "c"]
console.log(arr.length);  // 3

// 可以添加非数字属性
arr.name = "myArray";
console.log(arr.name);  // "myArray"
```

---

## 6. 前端工程实践

### 6.1 类型安全的函数

```javascript
// ✅ 参数校验
function calculateArea(width, height) {
  if (typeof width !== 'number' || typeof height !== 'number') {
    throw new TypeError('Width and height must be numbers');
  }
  return width * height;
}

// ✅ 使用 TypeScript
function calculateArea(width: number, height: number): number {
  return width * height;
}
```

### 6.2 避免隐式转换陷阱

```javascript
// ❌ 危险的用法
if (value == null) {  // 同时匹配 null 和 undefined
  // ...
}

// ✅ 明确的判断
if (value === null || value === undefined) {
  // ...
}

// ✅ 空值合并
const result = value ?? defaultValue;  // 只有 null/undefined 才用默认值
```

### 6.3 数据序列化

```javascript
// BigInt 和 Symbol 无法序列化
JSON.stringify({ 
  big: 9007199254740991n,  // ❌ TypeError
  sym: Symbol("key")       // 会被忽略
});

// 自定义序列化
const data = {
  big: 9007199254740991n,
  toJSON() {
    return {
      big: this.big.toString()  // 转为字符串
    };
  }
};
console.log(JSON.stringify(data));  // {"big":"9007199254740991"}
```

---

## 关键要点

1. **8 种数据类型**
   - 7 种原始类型：Undefined、Null、Boolean、Number、String、Symbol、BigInt
   - 1 种对象类型：Object（包括 Array、Function 等）

2. **原始类型特点**
   - 不可变（Immutable）
   - 按值存储和传递
   - 调用方法时自动装箱（包装对象）

3. **对象类型特点**
   - 可变（Mutable）
   - 按引用存储和传递
   - 所有非原始值都是对象

4. **特殊类型**
   - **Symbol**：唯一标识符，用于私有属性
   - **BigInt**：任意精度整数，解决大数问题

5. **类型判断**
   - `typeof`：快速判断，但有局限（null、数组）
   - `instanceof`：检查原型链
   - `Object.prototype.toString`：通用方法

6. **常见陷阱**
   - `typeof null === "object"`（历史 bug）
   - 浮点数精度问题（0.1 + 0.2 !== 0.3）
   - 包装对象总是真值
   - 引用类型的共享修改

---

## 深入一点

### 类型的内部表示

JavaScript 引擎使用类型标签（Type Tag）标识值的类型：

| 类型 | 标签 | 备注 |
|------|------|------|
| Object | 000 | 对象指针 |
| Int | 1 | 整数 |
| Double | - | 浮点数 |
| String | 100 | 字符串 |
| Boolean | 110 | 布尔值 |

**为什么 `typeof null === "object"`？**

null 在 JS 早期实现中表示为全零的指针（0x00），其类型标签也是 000，因此被误判为对象。

### Number 的存储格式（IEEE 754）

```
64位：1位符号 + 11位指数 + 52位尾数

符号位  指数        尾数
│       │           │
0 10000000011 1000000000000000000000000000000000000000000000000000
```

**结果**：
- 整数精度：53 位（约 16 位十进制）
- 浮点精度：有限
- 特殊值：Infinity、-Infinity、NaN

---

## 参考资料

- [MDN: JavaScript 数据类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures)
- [ECMAScript 类型规范](https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values)
- [IEEE 754 浮点数标准](https://en.wikipedia.org/wiki/IEEE_754)
- [2ality: typeof null](https://2ality.com/2013/10/typeof-null.html)

---

**上一章**：[变量声明与作用域基础](./content-2.md)  
**下一章**：[类型系统深入](./content-4.md)
