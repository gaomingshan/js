# 函数基础

## 概述

函数（Function）是 JavaScript 的核心抽象：它既是可调用的代码单元，也是可以被传递、返回、存储的“一等公民”。

理解函数时建议同时掌握两层：

- **语法层**：声明、参数、返回值
- **运行时层（深入原理）**：调用栈、执行上下文、词法环境

---

## 一、函数的定义方式

### 1.1 函数声明（Function Declaration）

```js
function add(a, b) {
  return a + b;
}
```

特点：

- 有函数名
- 会被提升（hoisting），可以在声明前调用

### 1.2 函数表达式（Function Expression）

```js
const add = function (a, b) {
  return a + b;
};
```

特点：

- “表达式求值结果是一个函数对象”
- 是否能在声明前使用取决于变量声明方式（例如 `const`/`let` 有 TDZ）

> **提示**
>
> 函数表达式也可以具名：
>
> ```js
> const f = function inner() {};
> ```
>
> 具名有利于调试栈信息（并且 `inner` 仅在函数体内可见）。

---

## 二、参数、默认值与剩余参数

### 2.1 默认参数

```js
function greet(name = 'Guest') {
  return `Hello, ${name}`;
}
```

### 2.2 剩余参数（rest）

```js
function sum(...nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}
```

### 2.3 `arguments` vs rest

- `arguments` 是“类数组”，存在于非箭头函数中
- rest 是真正数组，更推荐

```js
function f() {
  console.log(arguments.length);
}
```

---

## 三、返回值与 `return`

### 3.1 return 的语义

- 不写 `return` 等价于 `return undefined`
- `return expr` 会返回表达式的值

### 3.2 ASI（自动分号插入）陷阱

```js
function bad() {
  return
  { ok: true };
}

bad(); // undefined
```

原因：`return` 后换行触发 ASI。

---

## 四、作用域：函数是“作用域边界”

- 函数会创建自己的局部作用域
- `var` 以函数为作用域边界
- `let/const` 以块为作用域边界

---

## 五、深入原理：函数调用发生了什么

你可以把一次函数调用理解为“创建并入栈一个执行上下文”。

### 5.1 调用栈（Call Stack）

```js
function a() {
  b();
}
function b() {
  c();
}
function c() {
  console.log('c');
}

a();
```

调用过程（简化）：

- 全局执行上下文入栈
- 调用 `a` → `a` 的执行上下文入栈
- 调用 `b` → `b` 的执行上下文入栈
- 调用 `c` → `c` 的执行上下文入栈
- `c` 返回，依次出栈

### 5.2 词法环境与变量解析

函数对象在创建时会记住其外层词法环境（闭包基础），使得函数执行时能沿着“词法环境链”解析标识符。

> **要点**
>
> - **函数创建时**确定外层环境（词法作用域）
> - **函数调用时**创建执行上下文（运行时状态）

---

## 六、最佳实践

1. **命名要表达意图**：函数名优先动词/动宾结构。
2. **参数不要过多**：超过 3 个参数时考虑对象参数（便于扩展）。
3. **尽量保持纯函数**：减少副作用，有利测试与复用。
4. **避免把业务逻辑藏在复杂表达式里**：提高可读性。

---

## 参考资料

- [MDN - Functions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions)
- [ECMA-262 - Function Definitions](https://tc39.es/ecma262/#sec-function-definitions)
