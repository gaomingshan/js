# 类型转换规则

> 掌握类型转换的完整规则，避免转换陷阱

---

## 概述

JavaScript 的类型转换分为**显式转换**和**隐式转换**。理解转换规则，尤其是 `==` 与 `===` 的区别，是避免 bug 的关键。

本章将深入：
- 显式转换：Number()、String()、Boolean()
- ToPrimitive 抽象操作
- == 与 === 的转换逻辑
- JSON.stringify 的转换规则
- 常见类型转换陷阱

---

## 1. 显式转换

### 1.1 转为数字（Number）

**Number() 函数**

```javascript
// 原始类型
Number(undefined)  // NaN
Number(null)       // 0
Number(true)       // 1
Number(false)      // 0
Number("")         // 0
Number("123")      // 123
Number("123abc")   // NaN
Number("  123  ")  // 123（去除首尾空白）

// Symbol 和 BigInt
Number(Symbol())   // ❌ TypeError
Number(123n)       // 123

// 对象
Number({})         // NaN
Number([])         // 0
Number([5])        // 5
Number([1, 2])     // NaN
```

**parseInt() 和 parseFloat()**

```javascript
// parseInt：逐个解析，遇到非数字停止
parseInt("123")      // 123
parseInt("123abc")   // 123
parseInt("abc123")   // NaN
parseInt("  123")    // 123
parseInt("0x10")     // 16（十六进制）

// 进制参数（推荐始终指定）
parseInt("10", 2)    // 2（二进制）
parseInt("10", 8)    // 8（八进制）
parseInt("10", 10)   // 10（十进制）
parseInt("10", 16)   // 16（十六进制）

// parseFloat：解析浮点数
parseFloat("3.14")      // 3.14
parseFloat("3.14abc")   // 3.14
parseFloat("3.14.15")   // 3.14（第二个点停止）
```

**一元加号运算符**

```javascript
+"123"      // 123
+"123abc"   // NaN
+true       // 1
+null       // 0
+undefined  // NaN
+[]         // 0
+{}         // NaN

// 等价于 Number()
+value === Number(value)  // true
```

### 1.2 转为字符串（String）

**String() 函数**

```javascript
// 原始类型
String(undefined)  // "undefined"
String(null)       // "null"
String(true)       // "true"
String(false)      // "false"
String(123)        // "123"
String(NaN)        // "NaN"
String(Infinity)   // "Infinity"

// Symbol
String(Symbol("foo"))  // "Symbol(foo)"
Symbol("foo") + ""     // ❌ TypeError（不允许隐式转换）

// BigInt
String(123n)  // "123"
123n + ""     // "123"

// 对象
String({})           // "[object Object]"
String([1, 2, 3])    // "1,2,3"
String([])           // ""
String(function(){}) // "function(){}"
```

**toString() 方法**

```javascript
// 数字的进制转换
(42).toString(2)   // "101010"（二进制）
(42).toString(8)   // "52"（八进制）
(42).toString(16)  // "2a"（十六进制）

// 数组的 toString
[1, 2, 3].toString()  // "1,2,3"

// 对象的 toString（可重写）
const obj = {
  toString() {
    return "custom string";
  }
};
obj.toString()  // "custom string"
String(obj)     // "custom string"
```

**模板字符串**

```javascript
`${123}`         // "123"
`${undefined}`   // "undefined"
`${null}`        // "null"
`${[1, 2]}`      // "1,2"

// 等价于 String()
`${value}` === String(value)  // true
```

### 1.3 转为布尔值（Boolean）

**Boolean() 函数**

```javascript
// 假值（Falsy）：只有 8 个
Boolean(false)      // false
Boolean(0)          // false
Boolean(-0)         // false
Boolean(0n)         // false（BigInt 的零）
Boolean("")         // false
Boolean(null)       // false
Boolean(undefined)  // false
Boolean(NaN)        // false

// 其他都是真值（Truthy）
Boolean(true)       // true
Boolean(1)          // true
Boolean(-1)         // true
Boolean("0")        // true（字符串 "0"）
Boolean("false")    // true（字符串 "false"）
Boolean([])         // true（空数组）
Boolean({})         // true（空对象）
Boolean(function(){})  // true
```

**逻辑非运算符**

```javascript
!!value  // 等价于 Boolean(value)

!!0       // false
!!""      // false
!!null    // false
!![]      // true
!!{}      // true
```

**条件判断中的隐式转换**

```javascript
if (value) {
  // 等价于 if (Boolean(value))
}

while (condition) {
  // 等价于 while (Boolean(condition))
}

value ? a : b  // 等价于 Boolean(value) ? a : b
```

---

## 2. ToPrimitive 抽象操作

### 2.1 转换规则

**ToPrimitive(input, PreferredType)**

- 如果 `input` 是原始值，直接返回
- 如果 `input` 是对象：
  - 如果有 `[Symbol.toPrimitive]` 方法，调用它
  - 否则，根据 `PreferredType` 调用 `valueOf()` 或 `toString()`

**PreferredType 的影响**

| PreferredType | 调用顺序 |
|--------------|---------|
| "number" | valueOf() → toString() |
| "string" | toString() → valueOf() |
| 默认 | Date: toString() → valueOf()<br>其他: valueOf() → toString() |

### 2.2 默认转换行为

```javascript
// 对象默认转换
const obj = {
  valueOf() {
    console.log("valueOf");
    return 1;
  },
  toString() {
    console.log("toString");
    return "2";
  }
};

// 数字上下文：优先 valueOf
Number(obj);    // 输出 "valueOf"，返回 1
+obj;           // 输出 "valueOf"，返回 1
obj - 1;        // 输出 "valueOf"，返回 0

// 字符串上下文：优先 toString
String(obj);    // 输出 "toString"，返回 "2"
`${obj}`;       // 输出 "toString"，返回 "2"

// 混合上下文：优先 valueOf
obj + 1;        // 输出 "valueOf"，返回 2
obj == 1;       // 输出 "valueOf"，返回 true
```

### 2.3 Symbol.toPrimitive

**自定义转换行为**

```javascript
const obj = {
  [Symbol.toPrimitive](hint) {
    console.log("hint:", hint);
    
    if (hint === "number") {
      return 42;
    }
    if (hint === "string") {
      return "hello";
    }
    return true;  // default
  }
};

// 数字上下文
Number(obj);      // hint: number, 返回 42
+obj;             // hint: number, 返回 42

// 字符串上下文
String(obj);      // hint: string, 返回 "hello"
`${obj}`;         // hint: string, 返回 "hello"

// 默认上下文
obj + 1;          // hint: default, 返回 2（true + 1）
obj == true;      // hint: default, 返回 true
```

### 2.4 日期对象的特殊行为

```javascript
const date = new Date();

// Date 优先 toString
date + 1;           // 字符串拼接
date.valueOf();     // 时间戳（数字）
date.toString();    // 日期字符串

// 数字上下文强制使用 valueOf
Number(date);       // 时间戳
+date;              // 时间戳
date - 0;           // 时间戳
```

---

## 3. == 与 === 的区别

### 3.1 严格相等（===）

**不进行类型转换，类型和值都必须相同。**

```javascript
1 === 1           // true
1 === "1"         // false（类型不同）
true === 1        // false（类型不同）
null === undefined  // false（类型不同）

// 特殊情况
NaN === NaN       // false（NaN 不等于自己）
+0 === -0         // true（符号零相等）

// 对象比较引用
{} === {}         // false（不同引用）
[] === []         // false（不同引用）
```

### 3.2 相等（==）

**允许类型转换后比较。**

**转换规则**（简化）：

1. **类型相同**：直接比较（同 `===`）
2. **null == undefined**：返回 `true`
3. **数字与字符串**：字符串转为数字
4. **布尔值**：转为数字（true → 1, false → 0）
5. **对象与原始值**：对象调用 `ToPrimitive`

```javascript
// null 和 undefined
null == undefined       // true
null == 0               // false
undefined == 0          // false

// 数字与字符串
1 == "1"                // true（"1" → 1）
0 == ""                 // true（"" → 0）
0 == "0"                // true（"0" → 0）

// 布尔值
true == 1               // true（true → 1）
false == 0              // true（false → 0）
true == "1"             // true（true → 1, "1" → 1）
false == ""             // true（false → 0, "" → 0）

// 对象
[] == 0                 // true（[] → "" → 0）
[1] == 1                // true（[1] → "1" → 1）
[1, 2] == "1,2"         // true（[1,2] → "1,2"）
```

### 3.3 复杂案例分析

**案例 1：[] == ![]**

```javascript
[] == ![]  // true

// 分析：
// 1. ![] → false（[] 是对象，转布尔为 true，取反为 false）
// 2. [] == false
// 3. [] → ""（ToPrimitive）
// 4. "" == false
// 5. "" → 0, false → 0
// 6. 0 == 0 → true
```

**案例 2：{} == "[object Object]"**

```javascript
{} == "[object Object]"  // true

// 分析：
// 1. {} → "[object Object]"（toString）
// 2. "[object Object]" == "[object Object]" → true
```

**案例 3：复杂对象比较**

```javascript
const obj = {
  valueOf() { return 1; },
  toString() { return "2"; }
};

obj == 1    // true（valueOf 优先，返回 1）
obj == "2"  // false（valueOf 返回 1，1 != "2"）
```

### 3.4 何时使用 == 和 ===

**推荐**：
- **默认使用 `===`**（严格相等）
- **仅在判断 null/undefined 时使用 `==`**

```javascript
// ✅ 推荐：检查 null 或 undefined
if (value == null) {  // 等价于 value === null || value === undefined
  // ...
}

// ✅ 其他情况使用 ===
if (value === 0) { }
if (type === "string") { }

// ❌ 避免：依赖 == 的隐式转换
if (value == 0) { }  // 可能匹配 "", false, "0" 等
```

---

## 4. 加号运算符的特殊性

### 4.1 字符串拼接 vs 数字相加

**规则**：如果任一操作数是字符串，执行拼接；否则执行数字相加。

```javascript
// 字符串拼接
"hello" + "world"  // "helloworld"
"3" + 4            // "34"
3 + "4"            // "34"
"" + 3             // "3"

// 数字相加
3 + 4              // 7
3 + true           // 4（true → 1）
3 + null           // 3（null → 0）
3 + undefined      // NaN（undefined → NaN）

// 对象参与
[] + []            // ""（[] → ""）
[] + {}            // "[object Object]"（[] → "", {} → "[object Object]"）
{} + []            // 0（{} 被当作代码块，实际是 +[]）
{} + {}            // "[object Object][object Object]"（浏览器）或 NaN（Node.js）

// 日期
new Date() + 1     // 字符串拼接（Date 优先 toString）
1 + new Date()     // 字符串拼接
```

### 4.2 避免意外的字符串拼接

```javascript
// ❌ 常见错误
const result = "The answer is " + 40 + 2;
console.log(result);  // "The answer is 402"

// ✅ 使用括号
const result = "The answer is " + (40 + 2);
console.log(result);  // "The answer is 42"

// ✅ 使用模板字符串
const result = `The answer is ${40 + 2}`;
console.log(result);  // "The answer is 42"
```

---

## 5. 其他算术运算符

### 5.1 减法、乘法、除法

**规则**：始终转换为数字。

```javascript
// 减法
"5" - 2       // 3
"5" - "2"     // 3
true - false  // 1
[] - 1        // -1（[] → 0）
[5] - [2]     // 3（[5] → 5, [2] → 2）

// 乘法
"3" * "4"     // 12
"3" * true    // 3
"3" * null    // 0
"3" * undefined  // NaN

// 除法
"8" / "2"     // 4
"8" / 0       // Infinity
"8" / -0      // -Infinity
"abc" / 2     // NaN
```

### 5.2 一元运算符

```javascript
// 一元加号：转为数字
+"123"        // 123
+true         // 1
+[]           // 0

// 一元减号：转为数字并取反
-"123"        // -123
-true         // -1
-[]           // -0

// 递增递减
let x = "5";
x++;          // 6（转为数字）
x--;          // 5
```

---

## 6. JSON.stringify 的转换规则

### 6.1 基本转换

```javascript
// 原始类型
JSON.stringify(undefined)  // undefined（返回 undefined，而非字符串）
JSON.stringify(null)       // "null"
JSON.stringify(true)       // "true"
JSON.stringify(123)        // "123"
JSON.stringify("hello")    // '"hello"'

// 对象
JSON.stringify({ a: 1 })   // '{"a":1}'
JSON.stringify([1, 2, 3])  // '[1,2,3]'

// 函数和 Symbol 被忽略
JSON.stringify({ a: 1, b: function(){}, c: Symbol() })  // '{"a":1}'
JSON.stringify([1, function(){}, Symbol(), 4])  // '[1,null,null,4]'
```

### 6.2 特殊值的处理

```javascript
// NaN 和 Infinity 转为 null
JSON.stringify(NaN)        // "null"
JSON.stringify(Infinity)   // "null"

// Date 转为 ISO 字符串
JSON.stringify(new Date())  // '"2024-01-01T00:00:00.000Z"'

// BigInt 报错
JSON.stringify(123n)  // ❌ TypeError: Do not know how to serialize a BigInt
```

### 6.3 toJSON 方法

```javascript
const obj = {
  value: 42,
  toJSON() {
    return this.value * 2;
  }
};

JSON.stringify(obj);  // "84"

// Date 的 toJSON
const date = new Date();
date.toJSON()  // "2024-01-01T00:00:00.000Z"
JSON.stringify(date)  // '"2024-01-01T00:00:00.000Z"'
```

### 6.4 replacer 和 space 参数

```javascript
const obj = { a: 1, b: 2, c: 3 };

// 过滤属性
JSON.stringify(obj, ["a", "b"]);  // '{"a":1,"b":2}'

// 转换函数
JSON.stringify(obj, (key, value) => {
  return typeof value === 'number' ? value * 2 : value;
});  // '{"a":2,"b":4,"c":6}'

// 格式化输出
JSON.stringify(obj, null, 2);
// {
//   "a": 1,
//   "b": 2,
//   "c": 3
// }
```

---

## 7. 常见类型转换陷阱

### 7.1 数组转换

```javascript
// 空数组
+[]           // 0
[] + []       // ""
[] == 0       // true
[] == ""      // true
[] == false   // true

// 单元素数组
+[5]          // 5
[5] == 5      // true
[5] + [5]     // "55"

// 多元素数组
+[1, 2]       // NaN
[1, 2] == "1,2"  // true
```

### 7.2 对象转换

```javascript
// 空对象
+{}           // NaN
{} + {}       // "[object Object][object Object]"（或 NaN）
{} == "[object Object]"  // true

// 注意：{} 在语句开头会被解析为代码块
{} + []       // 0（{} 是代码块，实际执行 +[]）
({} + [])     // "[object Object]"（括号强制为表达式）
```

### 7.3 比较运算

```javascript
// 字符串比较（字典序）
"10" > "9"    // false（"1" < "9"）
"10" > 9      // true（"10" → 10）

// 类型不一致的比较
null > 0      // false（null → 0）
null == 0     // false（特殊规则）
null >= 0     // true（null → 0）

// undefined 的比较
undefined > 0   // false（undefined → NaN）
undefined < 0   // false
undefined == 0  // false
```

### 7.4 布尔值陷阱

```javascript
// 对象总是真值
if ([]) {
  console.log("空数组是真值");  // 执行
}

if ({}) {
  console.log("空对象是真值");  // 执行
}

// 但比较时会转换
[] == false   // true（[] → "" → 0, false → 0）
{} == false   // false（{} → "[object Object]" → NaN）
```

---

## 8. 前端工程实践

### 8.1 安全的类型转换

```javascript
// ✅ 显式转换
const num = Number(input);
const str = String(value);
const bool = Boolean(flag);

// ✅ 提供默认值
const num = Number(input) || 0;
const str = String(value) || "";

// ✅ 使用严格相等
if (value === 0) { }
if (value === "") { }

// ✅ 空值检查
const result = value ?? defaultValue;  // 只有 null/undefined 才用默认值
```

### 8.2 输入验证

```javascript
function safeParseInt(input, defaultValue = 0) {
  const num = parseInt(input, 10);
  return Number.isNaN(num) ? defaultValue : num;
}

function safeParseFloat(input, defaultValue = 0) {
  const num = parseFloat(input);
  return Number.isNaN(num) ? defaultValue : num;
}

// 使用
const age = safeParseInt(userInput, 0);
const price = safeParseFloat(userInput, 0);
```

### 8.3 JSON 序列化安全

```javascript
// ✅ 处理特殊值
function safeStringify(obj) {
  return JSON.stringify(obj, (key, value) => {
    // 处理 BigInt
    if (typeof value === 'bigint') {
      return value.toString();
    }
    // 处理函数
    if (typeof value === 'function') {
      return value.toString();
    }
    // 处理 undefined
    if (value === undefined) {
      return null;
    }
    return value;
  });
}

// ✅ 处理循环引用
function safeStringifyCircular(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  });
}
```

---

## 9. ESLint 规则推荐

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'eqeqeq': ['error', 'always'],  // 强制使用 ===
    'no-implicit-coercion': 'error',  // 禁止隐式转换
    'radix': 'error',  // parseInt 必须指定进制
  }
};
```

---

## 关键要点

1. **显式转换**
   - `Number()`、`String()`、`Boolean()` 是最明确的方式
   - `parseInt()`、`parseFloat()` 用于解析字符串
   - 一元运算符 `+`、`!!` 是快捷方式

2. **ToPrimitive 转换**
   - 对象转原始值会调用 `valueOf()` 或 `toString()`
   - `Symbol.toPrimitive` 可以自定义转换行为
   - Date 对象优先调用 `toString()`

3. **== vs ===**
   - `===` 不进行类型转换（推荐默认使用）
   - `==` 允许类型转换（仅用于 `value == null`）
   - 理解 `==` 的转换规则，避免意外行为

4. **加号运算符**
   - 任一操作数是字符串 → 字符串拼接
   - 否则 → 数字相加
   - 对象参与时调用 ToPrimitive

5. **JSON.stringify**
   - `undefined`、函数、Symbol 会被忽略或转为 `null`
   - `NaN`、`Infinity` 转为 `null`
   - 可以自定义 `toJSON()` 方法

6. **最佳实践**
   - 优先使用显式转换
   - 始终使用 `===`（除了检查 null/undefined）
   - 避免依赖隐式转换
   - 使用 TypeScript 或 ESLint 规则

---

## 深入一点

### 抽象操作的完整规则

**ToNumber 算法**（简化）：

```
ToNumber(undefined) → NaN
ToNumber(null) → +0
ToNumber(true) → 1
ToNumber(false) → +0
ToNumber(string) → 解析数字或 NaN
ToNumber(symbol) → TypeError
ToNumber(object) → ToNumber(ToPrimitive(object, "number"))
```

**ToString 算法**（简化）：

```
ToString(undefined) → "undefined"
ToString(null) → "null"
ToString(boolean) → "true" 或 "false"
ToString(number) → 数字的字符串表示
ToString(symbol) → TypeError（显式调用 String() 除外）
ToString(object) → ToString(ToPrimitive(object, "string"))
```

### 性能考量

```javascript
// 性能测试：转为数字的不同方式
const iterations = 1000000;

console.time("Number()");
for (let i = 0; i < iterations; i++) {
  Number("123");
}
console.timeEnd("Number()");

console.time("parseInt()");
for (let i = 0; i < iterations; i++) {
  parseInt("123", 10);
}
console.timeEnd("parseInt()");

console.time("+ operator");
for (let i = 0; i < iterations; i++) {
  +"123";
}
console.timeEnd("+ operator");

// 结果：+ 运算符通常最快，但差异不大
```

---

## 参考资料

- [ECMAScript 规范：类型转换](https://tc39.es/ecma262/#sec-type-conversion)
- [MDN: 相等比较和全等比较](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness)
- [MDN: JSON.stringify](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
- [JavaScript 中的相等性判断](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness)

---

**上一章**：[类型判断方法](./content-5.md)  
**下一章**：[执行上下文与作用域链](./content-7.md)
