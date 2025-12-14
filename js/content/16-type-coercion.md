# 类型强制转换规范

## 概述

类型强制转换（Type Coercion）是 JavaScript 语义的一部分：在特定语境下，值会被自动转换为期望类型。

理解规范里的抽象操作，可以把“反直觉结果”变成可解释的推导：

- `[] + {}` 为什么变成字符串
- `null >= 0` 为什么是 `true`
- `Boolean([])` 为什么是 `true`

---

## 一、规范中的抽象操作（抽象但很有用）

ECMAScript 用抽象操作描述转换规则：

- `ToPrimitive`：对象 → 原始值
- `ToBoolean`：任意值 → 布尔
- `ToNumber`：任意值 → 数字
- `ToString`：任意值 → 字符串
- `ToObject`：原始值 → 包装对象（装箱，见后续章节）

显式转换与隐式转换：

```js
// 显式
Number('123');
String(123);
Boolean(1);

// 隐式
'123' - 0;   // 123
123 + '';    // '123'
if ('x') {}  // true
```

---

## 二、ToPrimitive：对象如何变成原始值

### 2.1 hint（提示）与调用顺序

`ToPrimitive(input, hint)` 的关键在 `hint`：

- `number`：优先 `valueOf()`，再 `toString()`
- `string`：优先 `toString()`，再 `valueOf()`
- `default`：多数对象接近 `number`（Date 比较特殊，更偏 `string`）

```js
const obj = {
  valueOf() { return 100; },
  toString() { return 'object'; }
};

obj - 0;        // 100（number hint，走 valueOf）
String(obj);    // 'object'（string hint，走 toString）
obj + '';       // '100'（default hint，通常更偏 valueOf → 100 → '100'）
```

### 2.2 `Symbol.toPrimitive`（最高优先级）

```js
const obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return 1;
    if (hint === 'string') return 'one';
    return 'default';
  }
};

+obj;       // 1
String(obj); // 'one'
obj + '';    // 'default'
```

---

## 三、ToBoolean：只有 8 个 falsy

只有以下值会变成 `false`：

- `false`
- `0` / `-0`
- `0n`
- `''`
- `null`
- `undefined`
- `NaN`

其余全部为 truthy：

```js
Boolean('0');   // true
Boolean('false'); // true
Boolean([]);    // true
Boolean({});    // true
```

> **建议**
>
> 不要用 `if (arr)` 判断数组非空，应该用 `arr.length > 0`。

---

## 四、ToNumber：字符串/对象转换的高频坑

### 4.1 原始类型

```js
Number(undefined); // NaN
Number(null);      // 0
Number(true);      // 1
Number(false);     // 0
```

### 4.2 字符串

```js
Number('123');     // 123
Number('');        // 0
Number(' 123 ');   // 123
Number('0x10');    // 16
Number('123abc');  // NaN
```

### 4.3 数组与对象

对象转数字的过程是：`ToPrimitive(obj, 'number')` → `ToNumber(primitive)`。

```js
Number([]);      // 0（'' → 0）
Number([1]);     // 1（'1' → 1）
Number([1, 2]);  // NaN（'1,2' → NaN）
Number({});      // NaN
```

### 4.4 `parseInt` vs `Number`

- `Number('123abc')` 需要整串合法，否则 NaN
- `parseInt('123abc')` 会截断到非数字处

```js
Number('123abc');   // NaN
parseInt('123abc'); // 123
```

> **建议**
>
> 使用 `parseInt` 时总是传第二个参数（radix）。

---

## 五、ToString：对象/数组的字符串化

```js
String(undefined); // 'undefined'
String(null);      // 'null'
String([1,2,3]);   // '1,2,3'
String({});        // '[object Object]'
```

对象转字符串的过程：`ToPrimitive(obj, 'string')` → `ToString(primitive)`。

### 5.1 JSON.stringify 的特殊规则

```js
JSON.stringify(undefined);        // undefined
JSON.stringify({ x: undefined }); // '{}'
JSON.stringify([undefined]);      // '[null]'
JSON.stringify(NaN);              // 'null'
JSON.stringify(Infinity);         // 'null'
```

如果对象定义了 `toJSON`，会被优先调用。

---

## 六、运算符触发的转换

### 6.1 `+`：可能是拼接，也可能是相加

`+` 的规则是：

- 先对两边做 `ToPrimitive`
- **如果任一边是字符串**（或变成字符串），就做拼接

```js
'1' + 2;     // '12'
1 + '2';     // '12'
true + true; // 2

[1, 2] + [3, 4]; // '1,23,4'
```

### 6.2 `-`：总是数字运算

```js
'5' - 2;       // 3
5 - null;      // 5
5 - undefined; // NaN
```

### 6.3 关系运算符：字符串比较 vs 数字比较

```js
'2' > '12'; // true（字典序）
2 > '12';   // false（数字比较）
```

**经典陷阱**：`null >= 0` 为 `true`，但 `null == 0` 为 `false`。

原因：

- `>=` 走数值比较（`null → 0`）
- `==` 有自己的规则（`null` 只与 `undefined` 宽松相等）

---

## 七、[] 与 {} 的歧义

```js
[] + {}; // '[object Object]'
{} + []; // 0（{} 在语句开头可能被解析为代码块）

({}) + []; // '[object Object]'（用括号避免歧义）
```

---

## 八、NaN 的特殊性

```js
NaN === NaN; // false
Object.is(NaN, NaN); // true

Number.isNaN('abc'); // false（不做转换）
isNaN('abc');        // true（会先转数字）
```

---

## 九、最佳实践

1. **优先显式转换**：`Number/String/Boolean`。
2. **避免混用 `+`**：字符串拼接与数值运算混在一起最容易出 bug。
3. **比较优先 `===`**：`==` 的规则更难维护。
4. **检查 NaN 用 `Number.isNaN`**：避免 `isNaN` 的隐式转换。
5. **parseInt 传 radix**：`parseInt(str, 10)`。

---

## 参考资料

- [ECMAScript - Type Conversion](https://tc39.es/ecma262/#sec-type-conversion)
- [MDN - 数据类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures)
