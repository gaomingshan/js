# JavaScript 面试题汇总

> 涵盖 JavaScript 核心知识点的 100 道精选面试题

---

## 使用说明

本面试题汇总精选了 100 道 JavaScript 面试题，按照知识模块分类，难度从基础到高级递进。每道题目都包含：
- 问题描述
- 参考答案
- 知识点解析
- 相关章节链接

---

## 目录

1. [语言基础（10题）](#语言基础)
2. [类型系统（10题）](#类型系统)
3. [执行模型（15题）](#执行模型)
4. [对象与原型（10题）](#对象与原型)
5. [函数（10题）](#函数)
6. [异步编程（15题）](#异步编程)
7. [引擎与性能（10题）](#引擎与性能)
8. [浏览器 API（10题）](#浏览器api)
9. [现代特性（10题）](#现代特性)
10. [工程实践（10题）](#工程实践)

---

## 语言基础

### 1. JavaScript 的主要特点是什么？

**答案：**
1. **动态类型**：变量类型在运行时确定
2. **弱类型**：类型转换灵活
3. **单线程**：同一时间只执行一个任务
4. **事件驱动**：基于事件循环的异步模型
5. **原型继承**：基于原型链的继承机制
6. **函数一等公民**：函数可以作为值传递

**相关章节：** [JavaScript 语言特性与设计理念](../content/content-1.md)

---

### 2. var、let、const 的区别？

**答案：**

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 提升且初始化为 undefined | 提升但不初始化（TDZ）| 提升但不初始化（TDZ）|
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 全局对象属性 | 是 | 否 | 否 |

**示例：**
```javascript
// var：函数作用域
function test() {
  if (true) {
    var x = 1;
  }
  console.log(x);  // 1（可访问）
}

// let：块级作用域
function test() {
  if (true) {
    let x = 1;
  }
  console.log(x);  // ReferenceError
}

// const：不可重新赋值
const obj = { a: 1 };
obj.a = 2;  // ✅ 可以修改属性
obj = {};   // ❌ 不能重新赋值
```

**相关章节：** [变量声明与作用域基础](../content/content-2.md)

---

### 3. JavaScript 有哪些数据类型？

**答案：**

**8 种数据类型：**
1. **原始类型（7种）：**
   - `Number`：数字
   - `String`：字符串
   - `Boolean`：布尔值
   - `undefined`：未定义
   - `null`：空值
   - `Symbol`：唯一标识符（ES6）
   - `BigInt`：大整数（ES2020）

2. **引用类型（1种）：**
   - `Object`：对象（包括 Array、Function、Date、RegExp 等）

**检测方法：**
```javascript
typeof 123                    // "number"
typeof "hello"                // "string"
typeof true                   // "boolean"
typeof undefined              // "undefined"
typeof null                   // "object"（历史遗留bug）
typeof Symbol()               // "symbol"
typeof 123n                   // "bigint"
typeof {}                     // "object"
typeof []                     // "object"
typeof function() {}          // "function"

// 准确判断
Object.prototype.toString.call([])  // "[object Array]"
Array.isArray([])                   // true
```

**相关章节：** [数据类型概览](../content/content-3.md)

---

### 4. null 和 undefined 的区别？

**答案：**

| 特性 | undefined | null |
|------|-----------|------|
| 含义 | 未定义、未初始化 | 空值、无对象 |
| 类型 | undefined | object（历史bug）|
| 转为数字 | NaN | 0 |
| 转为布尔 | false | false |
| 使用场景 | 变量未赋值、函数无返回值 | 主动表示"空" |

**示例：**
```javascript
let a;
console.log(a);  // undefined（声明但未赋值）

const obj = { b: null };
console.log(obj.b);  // null（明确设置为空）

function test() {}
console.log(test());  // undefined（无返回值）

// 判断
a === undefined  // true
a === null       // false

// 非严格相等
a == null        // true（undefined == null）
```

**相关章节：** [数据类型概览](../content/content-3.md)

---

### 5. == 和 === 的区别？

**答案：**

- `==`：相等运算符，会进行类型转换
- `===`：严格相等运算符，不进行类型转换

**类型转换规则（==）：**
```javascript
// 1. null == undefined
null == undefined  // true

// 2. 字符串 == 数字：字符串转数字
"42" == 42  // true
"0" == 0    // true

// 3. 布尔值 == 其他：布尔值转数字
true == 1   // true
false == 0  // true

// 4. 对象 == 原始值：对象转原始值
[] == 0     // true（[] -> "" -> 0）
[1] == 1    // true（[1] -> "1" -> 1）

// 严格相等（===）
"42" === 42  // false
null === undefined  // false
```

**最佳实践：**
```javascript
// ✅ 推荐使用 ===
if (value === null) {}

// ❌ 避免使用 ==
if (value == null) {}  // 可以同时检查 null 和 undefined

// 例外：检查 null 和 undefined
if (value == null) {  // 等价于 value === null || value === undefined
  // value 是 null 或 undefined
}
```

**相关章节：** [类型转换规则](../content/content-6.md)

---

### 6. 如何判断数组？

**答案：**

**推荐方法：**
```javascript
// 1. Array.isArray（最佳）
Array.isArray([])       // true
Array.isArray({})       // false

// 2. Object.prototype.toString
Object.prototype.toString.call([])  // "[object Array]"

// 3. instanceof（注意跨 iframe 问题）
[] instanceof Array  // true

// 4. constructor
[].constructor === Array  // true
```

**为什么不用 typeof：**
```javascript
typeof []  // "object"（不准确）
```

**跨 iframe 问题：**
```javascript
// iframe 中的数组在父页面中
const iframeArray = iframe.contentWindow.Array;
const arr = new iframeArray();

arr instanceof Array  // false（不同的 Array 构造函数）
Array.isArray(arr)    // true（推荐）
```

**相关章节：** [类型判断方法](../content/content-5.md)

---

### 7. 什么是暂时性死区（TDZ）？

**答案：**

暂时性死区（Temporal Dead Zone）是指在代码块中，使用 `let` 或 `const` 声明的变量在声明之前的区域。

**特点：**
- 变量已提升，但未初始化
- 访问会抛出 `ReferenceError`
- 从块开始到声明语句之间

**示例：**
```javascript
console.log(x);  // ReferenceError: Cannot access 'x' before initialization
let x = 1;

// TDZ 范围
{
  // TDZ 开始
  console.log(y);  // ReferenceError
  
  let y = 2;  // TDZ 结束
  
  console.log(y);  // 2
}

// 对比 var（没有 TDZ）
console.log(a);  // undefined（变量提升）
var a = 1;
```

**为什么设计 TDZ：**
1. 避免在声明前使用变量（更安全）
2. 捕获编程错误
3. 与 const 行为一致

**相关章节：** [变量声明与作用域基础](../content/content-2.md)

---

### 8. JavaScript 中的包装对象是什么？

**答案：**

包装对象是原始值的对象形式，JavaScript 会在需要时自动进行包装和拆箱。

**三种包装对象：**
- `Number`：包装数字
- `String`：包装字符串
- `Boolean`：包装布尔值

**自动装箱：**
```javascript
const str = "hello";
console.log(str.length);        // 5
console.log(str.toUpperCase()); // "HELLO"

// 实际执行过程：
// 1. 创建临时包装对象：new String("hello")
// 2. 调用方法：wrapper.toUpperCase()
// 3. 销毁包装对象
```

**手动创建包装对象：**
```javascript
const num = 123;
const obj = new Number(123);

console.log(typeof num);  // "number"
console.log(typeof obj);  // "object"

console.log(num === obj);  // false（类型不同）
console.log(num == obj);   // true（自动拆箱）
```

**注意事项：**
```javascript
// ❌ 不要手动创建包装对象
const bool = new Boolean(false);
if (bool) {
  console.log("执行");  // 会执行（对象总是 truthy）
}

// ✅ 使用原始值
const bool = false;
if (bool) {
  console.log("不执行");
}
```

**相关章节：** [数据类型概览](../content/content-3.md)

---

### 9. Symbol 的作用是什么？

**答案：**

Symbol 是 ES6 引入的原始数据类型，用于创建唯一的标识符。

**主要用途：**

1. **创建唯一属性键**
```javascript
const id = Symbol('id');
const obj = {
  name: 'Alice',
  [id]: 123
};

console.log(obj[id]);  // 123
console.log(obj.id);   // undefined
```

2. **避免属性名冲突**
```javascript
// 多个库可以安全地扩展对象
const lib1 = Symbol('lib1');
const lib2 = Symbol('lib2');

Object.prototype[lib1] = function() { return 'Library 1'; };
Object.prototype[lib2] = function() { return 'Library 2'; };
```

3. **定义私有属性**
```javascript
const _private = Symbol('private');

class User {
  constructor(name) {
    this.name = name;
    this[_private] = 'secret';
  }
}

// Symbol 属性不会出现在常规遍历中
const user = new User('Alice');
console.log(Object.keys(user));  // ['name']
```

4. **Well-known Symbols**
```javascript
// Symbol.iterator：自定义迭代
const range = {
  start: 1,
  end: 5,
  [Symbol.iterator]() {
    let current = this.start;
    return {
      next: () => ({
        value: current,
        done: current++ > this.end
      })
    };
  }
};

for (const num of range) {
  console.log(num);  // 1, 2, 3, 4, 5
}
```

**相关章节：** [Symbol 与元编程](../content/content-33.md)

---

### 10. BigInt 是什么？如何使用？

**答案：**

BigInt 是 ES2020 引入的数据类型，用于表示任意精度的整数。

**创建方式：**
```javascript
// 1. 字面量（加 n 后缀）
const big1 = 123n;

// 2. BigInt 函数
const big2 = BigInt(123);
const big3 = BigInt("9007199254740991");

// 不能用 new
const big4 = new BigInt(123);  // ❌ TypeError
```

**使用场景：**
```javascript
// 1. 超出 Number 范围的整数
const maxSafeInt = Number.MAX_SAFE_INTEGER;  // 9007199254740991
console.log(maxSafeInt + 1);  // 9007199254740992
console.log(maxSafeInt + 2);  // 9007199254740992（精度丢失）

const big = BigInt(maxSafeInt);
console.log(big + 1n);  // 9007199254740992n
console.log(big + 2n);  // 9007199254740993n（精确）

// 2. 大数运算
const a = 123456789012345678901234567890n;
const b = 987654321098765432109876543210n;
console.log(a * b);  // 精确结果
```

**注意事项：**
```javascript
// 1. 不能与 Number 混用
1n + 2    // ❌ TypeError
1n + 2n   // ✅ 3n

// 2. 不支持一元 +
+123n  // ❌ TypeError

// 3. 不能用于 Math 方法
Math.sqrt(4n)  // ❌ TypeError

// 4. 除法向下取整
7n / 2n  // 3n（不是 3.5n）

// 5. 比较运算
1n === 1   // false（严格不等）
1n == 1    // true（宽松相等）
1n < 2     // true（可以比较）
```

**相关章节：** [数据类型概览](../content/content-3.md)

---

## 类型系统

### 11. 类型转换的规则是什么？

**答案：**

**ToPrimitive 抽象操作：**

对象转换为原始值时，按以下顺序尝试：
1. 调用 `[Symbol.toPrimitive](hint)` 方法（如果存在）
2. hint 为 "string"：调用 `toString()`，失败则调用 `valueOf()`
3. hint 为 "number"：调用 `valueOf()`，失败则调用 `toString()`

**常见转换：**
```javascript
// 转为字符串
String(123)      // "123"
String(true)     // "true"
String(null)     // "null"
String(undefined) // "undefined"
String([1, 2])   // "1,2"
String({ a: 1 }) // "[object Object]"

// 转为数字
Number("123")    // 123
Number("12.5")   // 12.5
Number("")       // 0
Number("abc")    // NaN
Number(true)     // 1
Number(false)    // 0
Number(null)     // 0
Number(undefined) // NaN
Number([])       // 0
Number([5])      // 5
Number([1, 2])   // NaN

// 转为布尔值
Boolean(0)       // false
Boolean("")      // false
Boolean(null)    // false
Boolean(undefined) // false
Boolean(NaN)     // false
Boolean({})      // true
Boolean([])      // true
```

**隐式转换陷阱：**
```javascript
// 加号运算符
"1" + 2        // "12"（字符串拼接）
1 + "2"        // "12"
1 + 2 + "3"    // "33"（从左到右）
"1" + 2 + 3    // "123"

// 减号运算符
"5" - 2        // 3（数字运算）
"5" - "2"      // 3

// 比较运算符
"10" > 9       // true（转为数字）
"10" > "9"     // false（字符串比较）

// 对象转换
[] + []        // ""（"" + "" = ""）
[] + {}        // "[object Object]"
{} + []        // 0（{} 被当作代码块，+[] = 0）
({}) + []      // "[object Object]"
```

**相关章节：** [类型转换规则](../content/content-6.md)

---

### 12. 如何准确判断对象类型？

**答案：**

**推荐方法：Object.prototype.toString**
```javascript
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

getType([])              // "Array"
getType({})              // "Object"
getType(null)            // "Null"
getType(undefined)       // "Undefined"
getType(123)             // "Number"
getType("abc")           // "String"
getType(true)            // "Boolean"
getType(Symbol())        // "Symbol"
getType(123n)            // "BigInt"
getType(function() {})   // "Function"
getType(new Date())      // "Date"
getType(/regex/)         // "RegExp"
getType(new Map())       // "Map"
getType(new Set())       // "Set"
```

**其他方法对比：**
```javascript
// typeof：适合原始类型
typeof 123           // "number"
typeof null          // "object"（bug）
typeof []            // "object"（不准确）

// instanceof：适合对象类型
[] instanceof Array  // true
({}) instanceof Object  // true

// Array.isArray：专门判断数组
Array.isArray([])    // true

// constructor：可以判断
[].constructor === Array  // true
```

**相关章节：** [类型判断方法](../content/content-5.md)

---

由于篇幅限制，我将继续生成剩余的面试题...

<function_calls>
<invoke name="edit">
<parameter name="file_path">c:\soft\work\code\js\user\js\js\quiz\quiz.md
