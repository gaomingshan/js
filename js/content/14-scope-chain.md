# 作用域链的本质

## 概述

作用域链（Scope Chain）回答一个核心问题：

> 当你在某个位置访问变量名 `x` 时，JavaScript **到底去哪里找**？

它直接决定：

- 词法作用域（静态作用域）行为
- 闭包能访问外部变量
- `let/const` 的块级作用域与 TDZ
- 深层嵌套与性能问题

---

## 一、作用域基础

### 1.1 作用域类型

- **全局作用域**
- **函数作用域**
- **块级作用域**（ES6+：`let/const/class`）

### 1.2 词法作用域（静态作用域）

JavaScript 采用词法作用域：作用域由**代码书写位置**决定，而不是调用位置。

```js
var value = 1;

function foo() {
  console.log(value);
}

function bar() {
  var value = 2;
  foo();
}

bar(); // 1
```

原因：`foo` 定义在全局，它的外部环境引用在“定义时”就确定了。

---

## 二、作用域链是什么

你可以把作用域链理解为一个“环境列表”：

```text
[当前环境, 外层环境, ..., 全局环境]
```

示例：

```js
var global = 'G';

function outer() {
  var outerVar = 'O';

  function inner() {
    var innerVar = 'I';
    console.log(innerVar, outerVar, global);
  }

  inner();
}
```

`inner` 的作用域链（概念上）：

```text
[innerEnv, outerEnv, globalEnv]
```

---

## 三、[[Scope]]：函数“记住外部环境”的关键

函数创建时，会保存一个内部的外部环境引用（历史上常被描述为 `[[Scope]]`）。

```js
function createFunction() {
  var local = 'local';
  return function inner() {
    console.log(local);
  };
}

const fn = createFunction();
fn(); // 'local'
```

重点：

- 外层函数执行完毕后，**只要内层函数还活着**，它引用的外部环境也不能被回收
- 这就是闭包的根

---

## 四、变量查找机制（从近到远）

```js
var a = 1;

function foo() {
  var b = 2;

  function bar() {
    var c = 3;
    console.log(a + b + c);
  }

  bar();
}

foo();
```

查找顺序：

1. 在 `bar` 自己的环境里找 `c`
2. 找不到再去 `foo` 的环境里找 `b`
3. 再找不到去全局环境找 `a`
4. 直到外部环境为 `null`：找不到就 ReferenceError

---

## 五、块级作用域与 TDZ

### 5.1 var 没有块级作用域

```js
{
  var x = 1;
}
console.log(x); // 1
```

### 5.2 let/const 有块级作用域

```js
{
  let y = 2;
}
// console.log(y); // ReferenceError
```

### 5.3 for 循环中的 let

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 3,3,3

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 0,1,2
```

关键在于：`let i` 每次迭代都会创建“新的迭代环境”。

### 5.4 暂时性死区（TDZ）

```js
{
  // console.log(x); // ReferenceError
  let x = 1;
}
```

TDZ 的意义：

- 强制你在声明后使用变量
- 避免 `var` 提升导致的“读到 undefined”隐性 bug

---

## 六、性能与可维护性

### 6.1 深层嵌套会变长作用域链

作用域链越长，变量查找路径越长（引擎有优化，但这仍是坏味道）。

### 6.2 缓存外层变量

```js
function process() {
  const el = document.getElementById('result');
  let html = '';

  for (let i = 0; i < 1000; i++) {
    html += i;
  }

  el.innerHTML = html;
}
```

### 6.3 避免 with / eval

- `with` 会破坏可预测的查找规则
- `eval` 可能引入动态声明，影响优化与安全

---

## 七、最佳实践

1. **优先用 `let/const`**：作用域更清晰。
2. **少用全局变量**：降低耦合与查找成本。
3. **避免深层嵌套**：用函数拆分/提前 return。
4. **闭包只捕获必要变量**：否则会保留大作用域导致内存问题（下一章）。

---

## 参考资料

- [ECMAScript - Lexical Environments](https://tc39.es/ecma262/#sec-lexical-environments)
- [MDN - 闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
