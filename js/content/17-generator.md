# 生成器函数深入

## 概述

生成器（Generator）是 ES6 引入的一类特殊函数：

- 可以暂停执行（`yield`）
- 可以恢复执行（`next()`）
- 返回的对象同时实现：
  - 迭代器协议（`next/return/throw`）
  - 可迭代协议（`[Symbol.iterator]`）

它让“手写迭代器状态机”变得非常简单，也曾经是 async/await 出现前主流的异步控制流方案之一。

---

## 一、基本语法：`function*` 与 `yield`

```js
function* gen() {
  yield 1;
  yield 2;
  return 3;
}

const it = gen();
it.next(); // { value: 1, done: false }
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: true }
```

`yield` 的语义：

- 产出一个值
- 暂停函数执行

`return`：

- 结束生成器
- 让 `done: true`

> **提示**
>
> `for...of` 会忽略 `return` 的最终返回值，只遍历 `yield` 产出的值。

---

## 二、生成器对象是迭代器，也是可迭代对象

```js
function* numbers() {
  yield 1;
  yield 2;
}

for (const n of numbers()) {
  console.log(n);
}

[...numbers()]; // [1, 2]
```

原因：生成器对象实现了 `[Symbol.iterator]()`（通常返回其自身）。

---

## 三、`yield*`：委托与组合

### 3.1 委托给另一个生成器

```js
function* inner() {
  yield 2;
  yield 3;
  return 'inner done';
}

function* outer() {
  yield 1;
  const ret = yield* inner();
  yield 4;
  return ret;
}

[...outer()]; // [1, 2, 3, 4]
```

### 3.2 委托给任意可迭代对象

```js
function* g() {
  yield* [1, 2];
  yield* 'hi';
}

[...g()]; // [1, 2, 'h', 'i']
```

> **关键点**
>
> `yield*` 表达式本身的值是“被委托生成器的 return 值”。

---

## 四、双向通信：`next(value)`

`next(x)` 的参数会作为“上一个 yield 表达式”的结果返回给生成器内部。

```js
function* gen() {
  const x = yield 'x';
  const y = yield 'y';
  return x + y;
}

const g = gen();
g.next();      // 启动，产出 'x'
g.next(10);    // x = 10，产出 'y'
g.next(20);    // y = 20，done true，value 30
```

> **注意**
>
> 第一次 `next(arg)` 的参数会被忽略，因为生成器尚未停在 yield 上等待接收。

---

## 五、throw / return：控制错误与提前结束

### 5.1 `throw(err)`

```js
function* gen() {
  try {
    yield 1;
  } catch (e) {
    yield 'recovered';
  }
  yield 2;
}

const g = gen();
g.next();
g.throw('error');
```

### 5.2 `return(value)`

强制结束生成器：

```js
const g = gen();
g.return('end');
```

---

## 六、应用场景

### 6.1 写迭代器（Range / Tree Traversal）

```js
function* range(start, end, step = 1) {
  for (let i = start; i <= end; i += step) {
    yield i;
  }
}
```

### 6.2 惰性求值（lazy map/filter）

```js
function* lazyMap(iterable, fn) {
  for (const x of iterable) yield fn(x);
}

function* lazyFilter(iterable, pred) {
  for (const x of iterable) if (pred(x)) yield x;
}
```

### 6.3 曾经的异步控制流（理解历史）

生成器可以配合“执行器”把 yield 的 Promise 串起来（co 的思路），但现代开发通常直接用 `async/await`。

---

## 七、最佳实践

1. **生成器适合做自定义遍历与惰性序列**：尤其是“可能很大但不一定全消费”的场景。
2. **无限生成器要有边界消费**：不要直接 spread。
3. **需要清理资源时用 try/finally**：配合提前 break/return。
4. **异步优先 async/await**：生成器异步更多用于理解底层与历史实现。

---

## 参考资料

- [ECMAScript - Generator Functions](https://tc39.es/ecma262/#sec-generator-function-definitions)
- [MDN - Generator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator)
