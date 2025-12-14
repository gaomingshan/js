# 箭头函数详解

## 概述

箭头函数（Arrow Function）是 ES6 引入的更简洁函数语法，但它不仅仅是“少写几个字”，而是带来了不同的语义：

- **没有自己的 `this`（词法 this）**
- **没有 `arguments`**
- **不能当构造函数（没有 `[[Construct]]`）**

理解这些差异，能避免“把箭头函数当普通函数用”的误区。

---

## 一、语法与返回值

### 1.1 典型写法

```js
const add = (a, b) => a + b;
```

### 1.2 返回对象字面量

```js
const make = () => ({ ok: true });
```

---

## 二、箭头函数与普通函数的关键差异

### 2.1 词法 this

箭头函数的 `this` 来自**外层最近的非箭头函数**（或全局）。

```js
const obj = {
  x: 1,
  f() {
    const g = () => this.x;
    return g();
  }
};

obj.f(); // 1
```

### 2.2 没有 arguments

```js
const f = () => {
  // console.log(arguments); // ReferenceError
};
```

需要可变参数时用 rest：

```js
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
```

### 2.3 不能作为构造函数

```js
const A = () => {};
// new A(); // TypeError
```

### 2.4 没有 prototype

这也是它不能 `new` 的一个外在表现。

---

## 三、何时使用箭头函数

### 3.1 适合：回调、函数式写法

```js
const ids = [1, 2, 3].map((x) => x * 2);
```

### 3.2 不适合：对象方法（需要动态 this）

```js
const obj = {
  x: 1,
  // 不推荐：
  getX: () => this.x
};
```

原因：这里的 `this` 不会指向 `obj`。

---

## 四、深入原理：箭头函数的 this 从哪里来

你可以把箭头函数理解为“没有 this 绑定能力的函数”。

- 普通函数：调用时根据规则生成 `this`
- 箭头函数：执行时沿词法环境向外查找 this

这让箭头函数非常适合写回调（尤其是事件循环/Promise 链中的回调），因为它避免了 `this` 被调用方改变。

---

## 五、最佳实践

1. 回调优先箭头函数（尤其需要使用外层 this 时）。
2. 需要方法的动态 this → 用普通函数。
3. 可变参数优先 rest，少用 `arguments`。

---

## 参考资料

- [MDN - Arrow function expressions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [ECMA-262 - ArrowFunction](https://tc39.es/ecma262/#sec-arrow-function-definitions)
