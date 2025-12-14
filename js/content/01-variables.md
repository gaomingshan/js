# 变量声明（var / let / const）

## 概述

JavaScript 提供 `var`、`let`、`const` 三种声明方式，它们在**作用域、提升（hoisting）、重复声明、全局绑定**等方面差异巨大。

这不是“语法风格”问题，而是与引擎的执行模型（词法环境、环境记录、TDZ）紧密相关。

---

## 一、`var` 声明

### 1.1 基本特性

- **函数作用域**：在函数内有效（没有块级作用域）
- **提升**：声明会被提升到作用域顶部，初始化为 `undefined`
- **可重复声明**：同一作用域内允许重复 `var x`
- **全局 var 变成全局对象属性**：浏览器中 `var x` 会成为 `window.x`

### 1.2 经典陷阱：循环 + 异步

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 3 3 3
```

原因：`var i` 只有一个绑定，异步回调执行时循环已结束。

---

## 二、`let` 声明（ES6）

### 2.1 基本特性

- **块级作用域**：`{ ... }` 内有效
- **暂时性死区（TDZ）**：声明前访问会抛 `ReferenceError`
- **不可重复声明**：同一作用域内重复声明会报错
- **全局 let 不挂到 window**

### 2.2 循环中的“每次迭代绑定”（深入原理点）

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 0 1 2
```

> **规范层理解（精简版）**
>
> `for (let i = ...)` 会为每次迭代创建新的词法环境（Per-Iteration Environment），因此每个回调捕获的是不同的 `i`。

---

## 三、`const` 声明（ES6）

### 3.1 基本特性

- 拥有 `let` 的所有特性（块级作用域、TDZ、不可重复声明）
- **必须初始化**
- **不可重新赋值**（绑定不可变）

```js
const n = 1;
// n = 2; // TypeError

const obj = { a: 1 };
obj.a = 2; // 允许：引用不变，内容可变
```

如需“深度不可变”，需要额外手段：

```js
const frozen = Object.freeze({ a: 1 });
// frozen.a = 2; // 严格模式下 TypeError
```

---

## 四、深入原理：提升、TDZ 与词法环境

### 4.1 `var` 的提升到底是什么

- 执行上下文创建阶段会为 `var` 创建绑定
- 绑定初始值为 `undefined`

因此：

```js
console.log(x); // undefined
var x = 1;
```

### 4.2 `let/const` 为什么有 TDZ

`let/const` 也会“提升”（创建绑定），但在真正执行到声明语句前处于**未初始化状态**。

```js
// console.log(y); // ReferenceError
let y = 1;
```

> **提示**
>
> TDZ 的价值是：让“先用后声明”直接失败，减少隐式 bug（尤其在大型代码中）。

### 4.3 全局环境差异：为什么 var 会挂到 window

浏览器全局环境包含两类记录：

- 对象环境记录（与 `window` 关联）
- 声明式环境记录（用于 `let/const/class`）

因此 `var` 进入对象环境记录，而 `let/const` 不会成为 `window` 属性。

---

## 五、最佳实践（精简但可执行）

1. **优先 `const`**：默认不可变绑定，减少误改。
2. **需要重新赋值才用 `let`**。
3. **避免 `var`**：除非在非常明确的遗留代码/兼容场景。

---

## 参考资料

- [MDN - var](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/var)
- [MDN - let](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/let)
- [MDN - const](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/const)
- [ECMA-262 - Let and Const Declarations](https://tc39.es/ecma262/#sec-let-and-const-declarations)
