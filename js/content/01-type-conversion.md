# 类型转换与判断

## 概述

JavaScript 会在需要时自动进行类型转换（隐式转换/强制转换）。这既是灵活性的来源，也是许多 bug 的根源。

本章用“够用但不糊弄”的方式讲清两件事：

- 常见显式/隐式转换规则
- 规范中的关键抽象操作：`ToPrimitive` / `ToNumber` / `ToString` / `ToBoolean`

---

## 一、类型转换分类

### 1.1 显式转换（Explicit Conversion）

- `Number(x)` / `String(x)` / `Boolean(x)`
- `parseInt` / `parseFloat`（用于“解析字符串”，不是通用转换）

```js
Number('');        // 0
Number('  ');      // 0
Number('abc');     // NaN
parseInt('12px');  // 12
```

### 1.2 隐式转换（Implicit Conversion）

常见触发点：

- `+`（可能是拼接，也可能是加法）
- 算术运算：`- * / % **`（倾向数字）
- 比较运算：`< > <= >=`
- 宽松相等：`==`
- 条件判断：`if (x)`（转布尔）

---

## 二、深入原理：ToPrimitive（核心抽象操作）

对象转原始值通常遵循以下优先级：

1. 如果存在 `obj[Symbol.toPrimitive]`：优先调用
2. 否则根据 hint 决定 `valueOf`/`toString` 调用顺序

> **规范化理解（精简版）**
>
> - hint = `"string"`：先 `toString()` 再 `valueOf()`
> - hint = `"number"`/`"default"`：先 `valueOf()` 再 `toString()`

```js
const obj = {
  [Symbol.toPrimitive](hint) {
    return hint === 'number' ? 42 : 'hello';
  }
};

+obj;       // 42
String(obj); // "hello"
```

---

## 三、`+` 运算符：加法 vs 拼接

`+` 的规则可以概括为：

1. 两边先 `ToPrimitive`
2. 只要有一边是字符串（或能转成字符串优先路径），就走**拼接**
3. 否则走**数字相加**

```js
[] + [];   // ""（"" + ""）
1 + '2';   // "12"
'5' - 2;   // 3（减法倾向数字）
```

> **警告**
>
> `{} + []` 在不同位置可能产生语法歧义：`{}` 可能被当作代码块而不是对象字面量。

---

## 四、`==`：宽松相等的关键规则

你不需要背完整 10 步算法，但要记住高频规则：

- `null == undefined` 为 `true`（特殊规则）
- `Boolean` 会先转数字：`true → 1`，`false → 0`
- `String` 与 `Number` 比较时，字符串会转数字
- `Object` 与原始值比较时，对象先 `ToPrimitive`

经典题：

```js
[] == ![]; // true
```

简化推导：

- `![]` → `false`
- `[] == false` → `[] == 0`（false → 0）
- `[]` ToPrimitive → `''`
- `'' == 0` → `0 == 0` → `true`

---

## 五、ToBoolean：对象永远为真

`ToBoolean` 很简单：只有少数 falsy，其余都 truthy。

```js
Boolean([]);  // true
Boolean({});  // true
Boolean('0'); // true
Boolean(0);   // false
```

> **注意**
>
> ToBoolean 不会触发 `valueOf/toString`，对象不会因为“看起来空”就变成 false。

---

## 六、最佳实践（减少坑）

1. **比较优先用 `===` / `!==`**。
2. 需要转换就**显式转换**。
3. 判 `NaN` 用 `Number.isNaN`（不要用 `x === NaN`）。
4. 小心 `parseInt` + `map`：

```js
['1', '2', '3'].map(parseInt); // [1, NaN, NaN]
```

---

## 参考资料

- [ECMA-262 - Type Conversion](https://tc39.es/ecma262/#sec-type-conversion)
- [ECMA-262 - Abstract Equality Comparison](https://tc39.es/ecma262/#sec-abstract-equality-comparison)
- [MDN - Equality comparisons and sameness](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness)
