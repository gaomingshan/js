# 类型判断方法

> 准确判断各种类型，避免判断陷阱

---

## 概述

JavaScript 提供了多种类型判断方法，每种都有其适用场景和局限性。掌握正确的类型判断方法，是编写健壮代码的基础。

本章将深入：
- `typeof` 运算符的原理与局限
- `instanceof` 的原理与边界情况
- `Object.prototype.toString` 的通用判断法
- 各种特殊类型的判断技巧
- 自定义类型判断函数

---

## 1. typeof 运算符

### 1.1 基本用法

```javascript
typeof 42                 // "number"
typeof "hello"            // "string"
typeof true               // "boolean"
typeof undefined          // "undefined"
typeof Symbol()           // "symbol"
typeof 123n               // "bigint"
typeof {}                 // "object"
typeof []                 // "object"
typeof null               // "object"（bug）
typeof function(){}       // "function"
```

### 1.2 返回值总结

| 值 | typeof 结果 |
|---|-------------|
| undefined | "undefined" |
| null | "object" ⚠️ |
| Boolean | "boolean" |
| Number | "number" |
| String | "string" |
| Symbol | "symbol" |
| BigInt | "bigint" |
| Function | "function" |
| 其他对象 | "object" |

### 1.3 使用场景

**✅ 适用于原始类型判断**

```javascript
function isNumber(value) {
  return typeof value === 'number';
}

function isString(value) {
  return typeof value === 'string';
}

function isUndefined(value) {
  return typeof value === 'undefined';
}
```

**✅ 安全检查未定义变量**

```javascript
// 不会抛出 ReferenceError
if (typeof someUndefinedVar === 'undefined') {
  console.log('变量未定义');
}

// 对比：直接访问会报错
if (someUndefinedVar === undefined) {  // ❌ ReferenceError
  // ...
}
```

### 1.4 局限性

**❌ 无法区分对象类型**

```javascript
typeof []        // "object"
typeof {}        // "object"
typeof new Date()  // "object"
typeof /regex/   // "object"
```

**❌ null 的 bug**

```javascript
typeof null  // "object"（应该是 "null"）

// 解决方案：显式检查
function isNull(value) {
  return value === null;
}

// 或者同时检查 null 和 undefined
function isNullish(value) {
  return value == null;  // null 和 undefined 都匹配
}
```

**❌ 特殊对象混淆**

```javascript
// 函数是对象，但返回 "function"
typeof function(){}  // "function"
typeof class {}      // "function"（class 本质是函数）

// document.all 的历史怪异行为
typeof document.all  // "undefined"（为了兼容旧代码）
```

---

## 2. instanceof 运算符

### 2.1 基本用法

**语法**：`object instanceof Constructor`

检查 `Constructor.prototype` 是否在 `object` 的原型链上。

```javascript
// 数组
[] instanceof Array        // true
[] instanceof Object       // true（Array 继承自 Object）

// 日期
new Date() instanceof Date      // true
new Date() instanceof Object    // true

// 函数
function fn() {}
fn instanceof Function     // true
fn instanceof Object       // true
```

### 2.2 原理与实现

**原型链查找**

```javascript
// 手写 instanceof
function myInstanceof(obj, Constructor) {
  // 原始值直接返回 false
  if (obj === null || typeof obj !== 'object') {
    return false;
  }
  
  // 获取对象的原型
  let proto = Object.getPrototypeOf(obj);
  const prototype = Constructor.prototype;
  
  // 沿原型链查找
  while (proto !== null) {
    if (proto === prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  
  return false;
}

// 测试
console.log(myInstanceof([], Array));  // true
console.log(myInstanceof([], Object));  // true
console.log(myInstanceof({}, Array));  // false
```

### 2.3 使用场景

**✅ 检查对象类型**

```javascript
if (value instanceof Array) {
  console.log('是数组');
}

if (value instanceof Date) {
  console.log('是日期对象');
}

if (error instanceof Error) {
  console.log('是错误对象');
}
```

**✅ 类型继承检查**

```javascript
class Animal {}
class Dog extends Animal {}

const dog = new Dog();
console.log(dog instanceof Dog);     // true
console.log(dog instanceof Animal);  // true（继承链）
console.log(dog instanceof Object);  // true（终点）
```

### 2.4 局限性

**❌ 原始值返回 false**

```javascript
"hello" instanceof String   // false（原始字符串）
new String("hello") instanceof String  // true（包装对象）

42 instanceof Number        // false
new Number(42) instanceof Number  // true
```

**❌ 跨 iframe 或跨 Realm 问题**

```javascript
// iframe 中的数组
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const iframeArray = iframe.contentWindow.Array;

const arr = new iframeArray();
console.log(arr instanceof Array);  // false（不同的 Array 构造函数）
console.log(Array.isArray(arr));    // true（正确方法）
```

**❌ 可以被伪造**

```javascript
class Fake {
  static [Symbol.hasInstance](obj) {
    return true;  // 总是返回 true
  }
}

console.log({} instanceof Fake);  // true（被伪造）
console.log(123 instanceof Fake);  // true
```

**❌ 原型链被修改**

```javascript
function MyClass() {}
const obj = new MyClass();

console.log(obj instanceof MyClass);  // true

// 修改原型链
Object.setPrototypeOf(obj, null);
console.log(obj instanceof MyClass);  // false
```

---

## 3. Object.prototype.toString

### 3.1 通用判断法

**原理**：返回 `[object Type]` 格式的字符串。

```javascript
Object.prototype.toString.call(null)       // "[object Null]"
Object.prototype.toString.call(undefined)  // "[object Undefined]"
Object.prototype.toString.call(42)         // "[object Number]"
Object.prototype.toString.call("hello")    // "[object String]"
Object.prototype.toString.call(true)       // "[object Boolean]"
Object.prototype.toString.call(Symbol())   // "[object Symbol]"
Object.prototype.toString.call(123n)       // "[object BigInt]"
Object.prototype.toString.call({})         // "[object Object]"
Object.prototype.toString.call([])         // "[object Array]"
Object.prototype.toString.call(function(){})  // "[object Function]"
Object.prototype.toString.call(new Date())    // "[object Date]"
Object.prototype.toString.call(/regex/)       // "[object RegExp]"
Object.prototype.toString.call(new Map())     // "[object Map]"
Object.prototype.toString.call(new Set())     // "[object Set]"
Object.prototype.toString.call(new Promise(() => {}))  // "[object Promise]"
```

### 3.2 提取类型字符串

```javascript
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

console.log(getType(null));       // "Null"
console.log(getType([]));         // "Array"
console.log(getType(new Date())); // "Date"
console.log(getType(/regex/));    // "RegExp"
```

### 3.3 为什么使用 call？

```javascript
// 直接调用可能被覆盖
const arr = [];
arr.toString = function() {
  return "我是数组";
};

console.log(arr.toString());  // "我是数组"（被覆盖）
console.log(Object.prototype.toString.call(arr));  // "[object Array]"（正确）
```

### 3.4 自定义类型标签

```javascript
class MyClass {
  get [Symbol.toStringTag]() {
    return 'MyClass';
  }
}

const obj = new MyClass();
console.log(Object.prototype.toString.call(obj));  // "[object MyClass]"
```

---

## 4. 数组判断

### 4.1 Array.isArray（推荐）

```javascript
Array.isArray([])           // true
Array.isArray(new Array())  // true
Array.isArray({ length: 0 })  // false（类数组不是数组）

// 跨 iframe 也能正确判断
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const iframeArray = new iframe.contentWindow.Array();
console.log(Array.isArray(iframeArray));  // true
```

### 4.2 其他方法对比

```javascript
const arr = [1, 2, 3];

// typeof：不准确
typeof arr  // "object"

// instanceof：跨 iframe 失败
arr instanceof Array  // true（同一 Realm）

// constructor：可能被修改
arr.constructor === Array  // true（但不可靠）

// toString：准确但繁琐
Object.prototype.toString.call(arr) === '[object Array]'  // true
```

---

## 5. 类数组判断

### 5.1 类数组的特征

```javascript
// 类数组：有 length 属性，可以用索引访问
const arrayLike = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3
};

// 常见类数组
arguments           // 函数参数
document.querySelectorAll('div')  // NodeList
document.getElementsByTagName('div')  // HTMLCollection
```

### 5.2 判断函数

```javascript
function isArrayLike(value) {
  // 不是 null 或 undefined
  if (value == null) {
    return false;
  }
  
  // 不是函数（函数也有 length）
  if (typeof value === 'function') {
    return false;
  }
  
  // 有数字 length 属性
  const length = value.length;
  return typeof length === 'number' && length >= 0 && length % 1 === 0;
}

console.log(isArrayLike([1, 2, 3]));  // true
console.log(isArrayLike({ 0: 'a', length: 1 }));  // true
console.log(isArrayLike("hello"));  // true（字符串也是类数组）
console.log(isArrayLike({ a: 1 }));  // false
```

---

## 6. 空对象判断

### 6.1 多种方法

```javascript
const obj = {};

// 方法 1：Object.keys
Object.keys(obj).length === 0  // true

// 方法 2：for...in
function isEmpty(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

// 方法 3：JSON.stringify
JSON.stringify(obj) === '{}'  // true（但性能差，且不准确）

// 方法 4：Object.getOwnPropertyNames
Object.getOwnPropertyNames(obj).length === 0  // true
```

### 6.2 注意 Symbol 属性

```javascript
const obj = {};
obj[Symbol('key')] = 'value';

console.log(Object.keys(obj).length);  // 0（Symbol 属性不可枚举）
console.log(Object.getOwnPropertySymbols(obj).length);  // 1

// 完整判断
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 
    && Object.getOwnPropertySymbols(obj).length === 0;
}
```

---

## 7. 特殊值判断

### 7.1 NaN 判断

```javascript
// NaN 的特性：不等于自己
console.log(NaN === NaN);  // false

// 方法 1：isNaN（不准确）
isNaN(NaN)      // true
isNaN("hello")  // true（会先转换为 Number）
isNaN({})       // true

// 方法 2：Number.isNaN（推荐）
Number.isNaN(NaN)      // true
Number.isNaN("hello")  // false（不会转换）
Number.isNaN({})       // false

// 方法 3：自身比较
function isNaNValue(value) {
  return value !== value;
}
```

### 7.2 Infinity 判断

```javascript
// 方法 1：全局 isFinite（会转换）
isFinite(Infinity)   // false
isFinite("123")      // true（转换为数字）

// 方法 2：Number.isFinite（推荐）
Number.isFinite(Infinity)  // false
Number.isFinite("123")     // false（不转换）
Number.isFinite(123)       // true

// 方法 3：直接比较
value === Infinity || value === -Infinity
```

### 7.3 整数判断

```javascript
// 方法 1：Number.isInteger（推荐）
Number.isInteger(42)      // true
Number.isInteger(42.0)    // true（42.0 === 42）
Number.isInteger(42.5)    // false
Number.isInteger("42")    // false（不转换）

// 方法 2：模运算
function isInteger(value) {
  return typeof value === 'number' && value % 1 === 0;
}

// 方法 3：安全整数
Number.isSafeInteger(9007199254740991)   // true
Number.isSafeInteger(9007199254740992)   // false
```

---

## 8. 自定义类型判断函数

### 8.1 通用类型判断

```javascript
function getType(value) {
  // null
  if (value === null) {
    return 'null';
  }
  
  // undefined
  if (value === undefined) {
    return 'undefined';
  }
  
  // 原始类型
  const primitiveType = typeof value;
  if (primitiveType !== 'object') {
    return primitiveType;
  }
  
  // 对象类型：使用 toString
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

console.log(getType(null));       // "null"
console.log(getType([]));         // "array"
console.log(getType(new Date())); // "date"
console.log(getType(/regex/));    // "regexp"
```

### 8.2 类型检查工具库

```javascript
const is = {
  // 原始类型
  null: value => value === null,
  undefined: value => value === undefined,
  boolean: value => typeof value === 'boolean',
  number: value => typeof value === 'number' && !Number.isNaN(value),
  string: value => typeof value === 'string',
  symbol: value => typeof value === 'symbol',
  bigint: value => typeof value === 'bigint',
  
  // 对象类型
  object: value => value !== null && typeof value === 'object',
  plainObject: value => Object.prototype.toString.call(value) === '[object Object]',
  array: value => Array.isArray(value),
  function: value => typeof value === 'function',
  date: value => value instanceof Date && !Number.isNaN(value.getTime()),
  regexp: value => value instanceof RegExp,
  error: value => value instanceof Error,
  
  // 特殊判断
  nan: value => Number.isNaN(value),
  finite: value => Number.isFinite(value),
  integer: value => Number.isInteger(value),
  safeInteger: value => Number.isSafeInteger(value),
  
  // 空值
  nullish: value => value == null,
  empty: value => {
    if (value == null) return true;
    if (Array.isArray(value) || typeof value === 'string') {
      return value.length === 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }
    return false;
  },
  
  // 类数组
  arrayLike: value => {
    if (value == null || typeof value === 'function') {
      return false;
    }
    const length = value.length;
    return typeof length === 'number' && length >= 0 && length % 1 === 0;
  },
  
  // Promise
  promise: value => value instanceof Promise || (
    value !== null &&
    typeof value === 'object' &&
    typeof value.then === 'function'
  ),
  
  // 可迭代
  iterable: value => {
    if (value == null) return false;
    return typeof value[Symbol.iterator] === 'function';
  }
};

// 使用
console.log(is.array([1, 2, 3]));  // true
console.log(is.empty([]));         // true
console.log(is.promise(Promise.resolve()));  // true
```

---

## 9. 前端工程实践

### 9.1 参数校验

```javascript
function fetchUser(id) {
  // 参数校验
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new TypeError('ID must be a positive safe integer');
  }
  
  return fetch(`/api/users/${id}`);
}

function processData(data) {
  if (!Array.isArray(data)) {
    throw new TypeError('Data must be an array');
  }
  
  if (data.length === 0) {
    throw new Error('Data cannot be empty');
  }
  
  // 处理逻辑
}
```

### 9.2 类型守卫（TypeScript）

```typescript
// 类型谓词
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

// 使用
function process(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase());  // TS 知道这里是 string
  } else if (isArray(value)) {
    console.log(value.length);  // TS 知道这里是 array
  }
}
```

### 9.3 运行时类型检查库

```javascript
// 使用 Zod
import { z } from 'zod';

const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().min(0).max(150).optional()
});

// 验证
const result = userSchema.safeParse({
  id: 1,
  name: "Alice",
  email: "alice@example.com"
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

---

## 10. 易错点与最佳实践

### 10.1 避免使用 constructor

```javascript
// ❌ 不可靠
[].constructor === Array  // true，但可以被修改

const arr = [];
arr.constructor = Object;
console.log(arr.constructor === Array);  // false

// ✅ 使用 Array.isArray
console.log(Array.isArray(arr));  // true
```

### 10.2 null 和 undefined 的统一判断

```javascript
// ❌ 分别判断繁琐
if (value === null || value === undefined) {
  // ...
}

// ✅ 使用 ==（少数推荐使用 == 的场景）
if (value == null) {  // 同时匹配 null 和 undefined
  // ...
}

// ✅ 使用空值合并
const result = value ?? defaultValue;
```

### 10.3 typeof 的安全性

```javascript
// ✅ 检查全局变量是否存在
if (typeof window !== 'undefined') {
  // 浏览器环境
}

if (typeof process !== 'undefined') {
  // Node.js 环境
}

// ✅ 检查 API 是否存在
if (typeof fetch === 'function') {
  // 支持 fetch API
}
```

---

## 关键要点

1. **typeof 运算符**
   - 适用于原始类型和函数
   - 局限：`null` 返回 "object"，无法区分对象类型
   - 优势：安全检查未定义变量

2. **instanceof 运算符**
   - 检查原型链
   - 局限：跨 iframe 失败，原始值返回 false
   - 优势：支持继承检查

3. **Object.prototype.toString**
   - 最通用的判断方法
   - 返回 `[object Type]` 格式
   - 推荐用于对象类型判断

4. **特定类型判断**
   - 数组：`Array.isArray()`
   - NaN：`Number.isNaN()`
   - 整数：`Number.isInteger()`
   - 有限数：`Number.isFinite()`

5. **最佳实践**
   - 根据场景选择合适的判断方法
   - 优先使用专用方法（如 `Array.isArray`）
   - 需要跨 iframe 时避免 `instanceof`
   - 编写类型判断工具函数

---

## 深入一点

### typeof 的实现原理

在 V8 引擎中，`typeof` 通过检查值的类型标签实现：

```c
// 伪代码
function typeof(value) {
  if (value is null) return "object";  // bug
  
  let tag = getTypeTag(value);
  switch (tag) {
    case SMI_TAG:
    case HEAP_NUMBER_TAG:
      return "number";
    case STRING_TAG:
      return "string";
    case FUNCTION_TAG:
      return "function";
    // ...
  }
}
```

### Symbol.hasInstance 自定义

```javascript
class MyArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance);
  }
}

console.log([] instanceof MyArray);  // true
console.log({} instanceof MyArray);  // false
```

---

## 参考资料

- [MDN: typeof](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/typeof)
- [MDN: instanceof](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/instanceof)
- [MDN: Object.prototype.toString](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)
- [You Don't Know JS: Types & Grammar](https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/types-grammar)

---

**上一章**：[类型系统深入](./content-4.md)  
**下一章**：[类型转换规则](./content-6.md)
