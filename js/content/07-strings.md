# 字符串操作详解

## 概述

字符串（String）是 JavaScript 最常用的原始类型之一。很多“字符串小坑”其实来自底层事实：

- **字符串是不可变的**：任何“修改”都会创建新字符串
- JavaScript 字符串以 **UTF-16 码元（code unit）** 组织：`length` 和“字符数”不总一致

本章目标：用精简但够深入的方式掌握常用 API，并能解释 Unicode/性能等常见问题。

---

## 一、创建字符串

### 1.1 字面量与模板字符串

```js
const a = 'Hello';
const b = "World";
const name = 'Alice';
const c = `Hello ${name}`;
```

### 1.2 `String()` vs `new String()`

- `String(x)`：把 `x` 转为原始字符串（推荐）
- `new String(x)`：创建包装对象（一般不需要）

```js
typeof String(1);       // 'string'
typeof new String(1);   // 'object'
```

> **提示**
>
> 包装对象容易引入隐式转换与比较问题，业务代码中通常不使用。

---

## 二、访问与遍历

### 2.1 `str[i]` vs `charAt(i)`

```js
const s = 'Hi';

s[0];         // 'H'
s.charAt(0);  // 'H'

s[10];        // undefined
s.charAt(10); // ''
```

### 2.2 UTF-16：`length` 的陷阱

```js
'😊'.length; // 2（两个码元）
```

如果你想按“用户感知字符”遍历，优先：

```js
for (const ch of '😊a') {
  console.log(ch); // '😊', 'a'
}
```

### 2.3 `charCodeAt` vs `codePointAt`

- `charCodeAt`：返回码元（16-bit）
- `codePointAt`：返回码点（能正确处理代理对）

```js
'😀'.charCodeAt(0);  // 55357（不完整）
'😀'.codePointAt(0); // 128512（完整）
```

---

## 三、搜索与提取

### 3.1 搜索：`includes/startsWith/endsWith/indexOf`

```js
const s = 'Hello World';

s.includes('World');
s.startsWith('Hello');
s.endsWith('World');

s.indexOf('o');
s.lastIndexOf('o');
```

> **建议**
>
> - “是否包含”用 `includes`，避免 `indexOf(...) !== -1` 的可读性问题。

### 3.2 提取：`slice` vs `substring`

- `slice` 支持负数索引（更直觉）
- `substring` 不支持负数（会当 0）

```js
const s = 'Hello World';

s.slice(-5);      // 'World'
s.substring(-5);  // 'Hello World'
```

---

## 四、分割与替换

### 4.1 `split`

```js
'a,b,c'.split(',');
'a1b2c3'.split(/\d/);
```

### 4.2 `replace` / `replaceAll`

```js
'foo foo'.replace('foo', 'bar');      // 只替换第一个
'foo foo'.replace(/foo/g, 'bar');
'foo foo'.replaceAll('foo', 'bar');
```

> **提示（深入一点）**
>
> `replace` 的回调形式可用于复杂替换（如格式化、脱敏）。

---

## 五、模板字符串与标签模板

### 5.1 标签模板的本质

标签函数会接收：

- 字面量片段数组（strings）
- 插值表达式值（values）

```js
function safe(strings, ...values) {
  return strings.reduce((acc, s, i) => acc + s + (values[i] ?? ''), '');
}

safe`Hello ${'Alice'}`;
```

标签模板常用于：

- SQL/HTML 的安全拼接（配合转义）
- i18n
- DSL

---

## 六、Unicode 规范化（很多人忽略）

同一个“看起来一样”的字符可能有不同表示：

```js
const a = 'é';
const b = 'e\u0301';

a === b; // false

a.normalize('NFC') === b.normalize('NFC'); // true
```

> **建议**
>
> 处理用户输入、搜索、去重时，如果涉及重音符号/组合字符，考虑做 normalize。

---

## 七、性能提示（不过度优化）

- 字符串不可变，循环里大量 `+=` 可能产生很多临时对象
- 传统技巧：累积到数组再 `join('')`

```js
const parts = [];
for (let i = 0; i < 3; i++) parts.push(String(i));
const s = parts.join('');
```

> **注意**
>
> 现代引擎对拼接做了很多优化（如 rope/concat 优化），但在大循环/热点路径仍建议做简单评估。

---

## 参考资料

- [MDN - String](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String)
- [ECMA-262 - String Objects](https://tc39.es/ecma262/#sec-string-objects)
- [MDN - Unicode](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String#unicode_%E5%AD%97%E7%AC%A6%E9%9B%86)
