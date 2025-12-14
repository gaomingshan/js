# 表达式与优先级

## 概述

表达式（Expression）是 JavaScript 的“求值单元”——执行后会产生一个值。

理解表达式的价值在于：

- 读懂复杂代码（特别是链式调用、短路、赋值表达式）
- 避免优先级陷阱
- 写出可维护的控制流

---

## 一、表达式的常见类别

### 1.1 主表达式（Primary Expressions）

- 字面量：`123`、`'hi'`、`true`、`null`
- 标识符：`x`
- `this`、`super`
- 数组/对象字面量：`[]`、`{}`
- 函数/类表达式：`function(){}`、`class {}`

### 1.2 左值表达式（LHS Expressions）

- 成员访问：`obj.a` / `obj[a]`
- 调用：`fn()` / `new C()`

> **提示**
>
> “左值表达式”强调：它能出现在赋值号左边（可被赋值/更新）。

### 1.3 赋值表达式

赋值在 JS 中是表达式（会产生一个值）：

```js
let x;
console.log((x = 10)); // 10
```

---

## 二、语句 vs 表达式

- **表达式**：产生值
- **语句**：执行动作（不一定产生值）

例如：

- `2 + 3` 是表达式
- `if (...) { ... }` 是语句

> **关键点**
>
> 某些语言结构“看起来像语句”，但 JS 里很多东西其实是表达式（例如函数表达式、赋值表达式、三元表达式）。

---

## 三、运算符优先级与结合性（最小够用版）

### 3.1 优先级：为什么 `2 + 3 * 4 === 14`

```js
2 + 3 * 4; // 14
(2 + 3) * 4; // 20
```

### 3.2 结合性：左结合 vs 右结合

- `a - b - c` 是左结合：`(a - b) - c`
- `a = b = c` 是右结合：`a = (b = c)`
- `a ** b ** c` 是右结合：`a ** (b ** c)`

---

## 四、常见优先级陷阱

### 4.1 `typeof` 的陷阱

```js
typeof 2 + 3;      // "number3"
typeof (2 + 3);    // "number"
```

原因：`typeof 2` 先求值 → 得到字符串 → 再与 `3` 拼接。

### 4.2 `new` 的陷阱

```js
new Date().getTime(); // ✅
// new Date.getTime(); // ❌ 相当于 new (Date.getTime)
```

### 4.3 `??` 与 `||/&&` 的混用

`??` 不能不加括号直接与 `||`、`&&` 混用：

```js
// (a ?? b) || c
```

---

## 五、求值顺序与副作用

### 5.1 “从左到右”与“短路”

大多数表达式的操作数按从左到右求值，但：

- `&&` / `||` / `??` 会短路

```js
function f(x) {
  console.log('f', x);
  return x;
}

f(0) && f(1); // 只打印 f 0
f(1) && f(2); // 打印 f 1, f 2
```

### 5.2 副作用（Side Effects）

以下表达式会改变程序状态：

- 赋值：`x = 1`
- 自增/自减：`x++`
- 调用有副作用的函数：`console.log()`
- 修改对象：`obj.a = 1`

> **警告**
>
> 避免在同一行里堆叠多个副作用（可读性与可调试性都会变差）。

---

## 六、最佳实践

1. **复杂表达式加括号**：用括号表达意图，而不是让读者猜优先级。
2. **拆分复杂表达式**：一行做一件事。
3. **避免“聪明写法”**：例如过度依赖逗号运算符或链式赋值。

---

## 参考资料

- [ECMA-262 - Expressions](https://tc39.es/ecma262/#sec-ecmascript-language-expressions)
- [MDN - 表达式和运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Expressions_and_Operators)
- [MDN - 运算符优先级](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)
