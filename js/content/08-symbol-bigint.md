# Symbol 与 BigInt

## 概述

Symbol（ES6）与 BigInt（ES2020）都是原始类型，但用途完全不同：

- **Symbol**：制造“绝对不会冲突的键/标识”
- **BigInt**：突破 Number 安全整数限制的“大整数”

---

## 一、Symbol

### 1.1 唯一性

```js
Symbol() === Symbol(); // false
Symbol('x') === Symbol('x'); // false
```

### 1.2 作为对象属性键（避免冲突 + 默认不可枚举）

```js
const ID = Symbol('id');
const obj = { [ID]: 1, name: 'Alice' };

Object.keys(obj); // ['name']
Object.getOwnPropertySymbols(obj); // [Symbol(id)]
Reflect.ownKeys(obj); // ['name', Symbol(id)]
```

> **提示**
>
> Symbol 属性不会被 `JSON.stringify` 序列化。

### 1.3 全局注册表：`Symbol.for` / `Symbol.keyFor`

```js
const a = Symbol.for('app.id');
const b = Symbol.for('app.id');

a === b; // true
Symbol.keyFor(a); // 'app.id'
```

适合：跨模块共享同一 Symbol（例如框架内部约定）。

### 1.4 Well-known Symbols（深入原理入口）

这些 Symbol 可以改变对象在语言层的行为：

- `Symbol.iterator`：让对象可迭代（支持 `for...of`）
- `Symbol.toPrimitive`：控制对象到原始值转换
- `Symbol.toStringTag`：影响 `Object.prototype.toString`
- `Symbol.hasInstance`：自定义 `instanceof`

例：自定义 ToPrimitive：

```js
const obj = {
  [Symbol.toPrimitive](hint) {
    return hint === 'number' ? 1 : 'one';
  }
};

+obj;       // 1
String(obj); // 'one'
```

---

## 二、BigInt

### 2.1 为什么需要 BigInt

Number 的安全整数上限：

```js
Number.MAX_SAFE_INTEGER; // 2^53 - 1
```

超过后会失真：

```js
9007199254740992 + 1 === 9007199254740992 + 2; // true
```

BigInt 解决“整数精度”问题：

```js
9007199254740992n + 1n === 9007199254740992n + 2n; // false
```

### 2.2 创建与运算规则

- `123n` 或 `BigInt('123')`
- 不能与 Number 混算（必须显式转换）
- 除法会向下取整

```js
10n / 3n; // 3n
// 10n + 10; // TypeError
10n + BigInt(10); // 20n
```

### 2.3 序列化与边界

- BigInt 不能被 JSON 直接序列化（会抛错）
- 需要转字符串：

```js
JSON.stringify({ x: 10n.toString() });
```

---

## 三、最佳实践

- Symbol：用于“内部协议/避免冲突/元编程”，对外 API 谨慎暴露 Symbol。
- BigInt：用于整数域（ID、计数、纳秒时间、金额的最小单位），避免与浮点混用。

---

## 参考资料

- [MDN - Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [MDN - BigInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
- [ECMA-262 - Symbol Objects](https://tc39.es/ecma262/#sec-symbol-objects)
- [ECMA-262 - BigInt Objects](https://tc39.es/ecma262/#sec-bigint-objects)
