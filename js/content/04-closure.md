# 闭包原理与应用

## 概述

闭包（Closure）不是“某种语法”，而是一种由 **词法作用域（lexical scope）** 自然产生的现象：

> 当函数可以访问其外层作用域中的变量，并且在外层函数返回后仍然保持这种访问能力，就形成闭包。

掌握闭包需要同时理解：

- “变量是如何被捕获的”（捕获的是绑定，不是一次性拷贝）
- “为什么外层函数结束了变量还在”（可达性与 GC）

---

## 一、闭包是什么

### 1.1 最小示例

```js
function createCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}

const counter = createCounter();
counter(); // 1
counter(); // 2
```

这里返回的匿名函数引用了 `count`，即使 `createCounter` 已经执行完毕，`count` 仍然不会被释放。

---

## 二、闭包的常见应用

### 2.1 私有变量（模块化思路）

```js
function createStore() {
  let state = { count: 0 };

  return {
    getState() {
      return state;
    },
    inc() {
      state = { ...state, count: state.count + 1 };
    }
  };
}
```

### 2.2 函数工厂（参数预绑定）

```js
function multiplyBy(x) {
  return (y) => x * y;
}

const double = multiplyBy(2);
double(21); // 42
```

### 2.3 回调与事件处理

闭包常用于把上下文“带入回调”：

```js
function onClickFactory(id) {
  return () => console.log('clicked:', id);
}

button.addEventListener('click', onClickFactory(123));
```

---

## 三、常见坑与误解

### 3.1 循环 + var 的经典问题

```js
var fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => i);
}

fns[0](); // 3
```

原因：闭包捕获的是同一个 `i` 绑定。

解决方式：

- 使用 `let`（每次迭代创建新绑定）
- 或 IIFE

```js
for (let i = 0; i < 3; i++) {
  fns.push(() => i);
}
```

### 3.2 内存占用：闭包会“延长对象生命周期”

如果闭包引用了大对象，它会一直可达：

```js
function create() {
  const big = new Array(1e6).fill('x');
  return () => big.length;
}
```

> **建议**
>
> - 避免在长期存活的闭包里捕获大对象
> - 用完后显式断开引用（设为 `null`）

---

## 四、深入原理：闭包与词法环境

### 4.1 捕获发生在“函数创建时”

函数对象内部会记录其创建时的外层环境（可理解为 `[[Environment]]`）。因此：

- 闭包不是调用时才决定“能访问谁”
- 而是创建时就固定了词法外层（词法作用域）

### 4.2 为什么外层函数返回后变量还在

核心是**可达性（reachability）**：

- 垃圾回收器会回收“不可达”的对象/环境
- 如果返回的函数还可达，并且它引用了外层环境，那么外层环境也可达

> **一句话**
>
> 不是“变量被拷贝出去”，而是“环境仍然可达”。

---

## 五、最佳实践

1. **用闭包实现封装，但别滥用**：闭包是工具，不是目的。
2. **避免闭包里捕获过多状态**：让函数更轻量。
3. **回调长期存在时考虑清理**：事件监听要 `removeEventListener`。

---

## 参考资料

- [MDN - Closures](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
- [ECMA-262 - Lexical Environments](https://tc39.es/ecma262/#sec-lexical-environments)
