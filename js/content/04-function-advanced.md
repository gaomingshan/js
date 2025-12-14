# 高阶函数与柯里化

## 概述

高阶函数（Higher-Order Function）是 JavaScript 函数“一等公民”特性最直接的体现：

- **接收函数作为参数**，或
- **返回一个函数**

柯里化（Currying）则是建立在闭包之上的一种函数变换技巧，用于提升组合与复用能力。

---

## 一、高阶函数：接收函数 / 返回函数

### 1.1 接收函数作为参数（回调模式）

```js
function repeat(n, fn) {
  for (let i = 0; i < n; i++) fn(i);
}

repeat(3, (i) => console.log(i));
```

### 1.2 返回函数（函数工厂）

```js
function withPrefix(prefix) {
  return (msg) => `${prefix}${msg}`;
}

const info = withPrefix('[info] ');
info('hello');
```

> **深入一点**
>
> “返回函数”几乎一定依赖闭包：返回的函数会捕获外层的 `prefix`。

---

## 二、柯里化（Currying）

### 2.1 什么是柯里化

把 `f(a, b, c)` 变为 `f(a)(b)(c)`。

```js
const curryAdd = (a) => (b) => (c) => a + b + c;

curryAdd(1)(2)(3); // 6
```

### 2.2 柯里化 vs 部分应用（Partial Application）

- 柯里化：把多参函数变为“链式单参”
- 部分应用：预先固定一部分参数，返回“更少参数”的函数

```js
function add(a, b, c) {
  return a + b + c;
}

function partial(fn, ...fixed) {
  return (...rest) => fn(...fixed, ...rest);
}

const add1 = partial(add, 1);
add1(2, 3); // 6
```

---

## 三、组合（composition）与管道（pipeline）

### 3.1 组合

```js
const compose = (f, g) => (x) => f(g(x));

const double = (x) => x * 2;
const inc = (x) => x + 1;

const f = compose(double, inc);
f(3); // double(inc(3)) = 8
```

组合的价值：把复杂逻辑拆成可复用的小函数。

---

## 四、深入原理：为什么这些技巧在 JS 里天然成立

核心原因只有一个：

> **函数是对象，并且函数创建时会捕获词法环境（闭包）。**

因此你可以：

- 把函数当数据传递（高阶函数）
- 在返回函数中“携带状态”（闭包）
- 把流程拆成可组合的小单元（组合/管道）

---

## 五、常见坑

1. **滥用柯里化导致可读性下降**：业务代码优先清晰。
2. **捕获大对象**：高阶函数返回的闭包长期存在时要注意内存。
3. **this 丢失**：把对象方法当回调传递时要考虑绑定（见 `this` 章节）。

---

## 参考资料

- [MDN - Higher-order functions](https://developer.mozilla.org/zh-CN/docs/Glossary/First-class_Function)
- [MDN - Closures](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
