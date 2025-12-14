# 相等性比较算法

## 概述

JavaScript 的“相等”不是一个操作，而是一组算法：

- `==`：Abstract Equality（宽松相等，带类型转换）
- `===`：Strict Equality（严格相等，不做类型转换）
- `Object.is`：SameValue（更“数学”）
- SameValueZero：用于 `Set/Map/includes`（NaN 相等，±0 也相等）

理解这些算法能避免大量比较陷阱。

---

## 一、快速对比

```js
5 === '5'; // false
5 == '5';  // true

NaN === NaN;        // false
Object.is(NaN, NaN); // true

+0 === -0;          // true
Object.is(+0, -0);  // false
```

---

## 二、`==`（宽松相等）的核心规则

### 2.1 相同类型

相同类型时行为接近 `===`；对象仍然按引用比较。

```js
{} == {}; // false
```

### 2.2 不同类型（高频规则）

- `null == undefined` 为 `true`（特殊规则）
- Number vs String：String → Number
- Boolean：Boolean → Number
- Object：Object → Primitive（ToPrimitive）

例子：

```js
null == undefined; // true

5 == '5';   // true
0 == '';    // true

true == 1;  // true
false == 0; // true

[1] == 1;   // true（[1] → '1' → 1）
```

### 2.3 经典陷阱

```js
'0' == 0;   // true
0 == '';    // true
'0' == '';  // false（传递性失效）

[] == ![];  // true
// ![] → false
// [] == false → '' == 0 → 0 == 0
```

> **结论**
>
> 依赖 `==` 的隐式转换非常脆弱，读代码时很难在脑中“跑完规则”。

---

## 三、`===`（严格相等）

规则：

- 类型不同直接 `false`
- 类型相同按值比较
- 对象按引用比较

特殊点：

- `NaN !== NaN`
- `+0 === -0`

```js
NaN === NaN; // false
+0 === -0;   // true
```

---

## 四、`Object.is`（SameValue）

它基本等同于 `===`，但修正两个点：

- `Object.is(NaN, NaN) === true`
- `Object.is(+0, -0) === false`

polyfill（示意）：

```js
if (!Object.is) {
  Object.is = function (x, y) {
    if (x === y) return x !== 0 || 1 / x === 1 / y;
    return x !== x && y !== y; // NaN
  };
}
```

---

## 五、SameValueZero：Set/Map/includes 的比较

SameValueZero 的特点：

- `NaN` 等于 `NaN`
- `+0` 与 `-0` 也视为相等

```js
new Set([NaN, NaN]).size; // 1

[NaN].includes(NaN); // true
[NaN].indexOf(NaN);  // -1（indexOf 用严格相等，找不到 NaN）
```

---

## 六、对象的“内容相等”不是内建能力

```js
{ x: 1 } === { x: 1 }; // false
```

如需深度相等，只能自己实现或用库。

简化版示意：

```js
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;

  for (const k of ka) {
    if (!Object.hasOwn(b, k)) return false;
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}
```

> **注意**
>
> 真实深度相等需要处理：循环引用、Date/RegExp/Map/Set/TypedArray 等类型。

---

## 七、最佳实践

1. **默认使用 `===`**。
2. **`==` 仅用于 `null` 检查**（可选风格）：`if (x == null)` 同时涵盖 `null/undefined`。
3. **NaN 检查**：用 `Number.isNaN(x)` 或 `Object.is(x, NaN)`。
4. **数组查找优先 `includes`**：能正确处理 NaN。
5. **对象内容比较用深度相等工具**：不要幻想 `===` 能比较内容。

---

## 参考资料

- [ECMAScript - Abstract Equality](https://tc39.es/ecma262/#sec-abstract-equality-comparison)
- [ECMAScript - Strict Equality](https://tc39.es/ecma262/#sec-strict-equality-comparison)
- [MDN - 相等性判断](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness)
