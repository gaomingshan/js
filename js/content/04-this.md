# this 绑定规则

## 概述

`this` 是 JavaScript 最容易“看懂却用错”的概念之一。它的关键特征是：

- **不是词法绑定（lexical）**：普通函数的 `this` 由“调用方式（call-site）”决定
- **只有箭头函数是词法 this**

掌握 `this` 最有效的方法是记住一套优先级明确的规则。

---

## 一、五条绑定规则（按优先级）

### 1.1 new 绑定（最高优先级）

```js
function Person(name) {
  this.name = name;
}

const p = new Person('Alice');
```

`new` 会创建新对象并绑定到 `this`（并链接原型）。

### 1.2 显式绑定：call / apply / bind

```js
function f() {
  return this.x;
}

const obj = { x: 1 };

f.call(obj);  // 1
f.apply(obj); // 1
const g = f.bind(obj);
g();          // 1
```

- `call`：参数逐个传
- `apply`：参数数组传
- `bind`：返回新函数（绑定后的函数）

### 1.3 隐式绑定：作为对象方法调用

```js
const obj = {
  x: 1,
  getX() {
    return this.x;
  }
};

obj.getX(); // 1
```

### 1.4 默认绑定：普通函数调用

```js
function f() {
  return this;
}

f();
```

- 非严格模式：浏览器中通常是 `window`
- 严格模式：`this === undefined`

### 1.5 箭头函数：词法 this（不参与上述规则）

```js
const obj = {
  x: 1,
  f() {
    const arrow = () => this.x;
    return arrow();
  }
};

obj.f(); // 1
```

---

## 二、经典坑：方法“丢失 this”

```js
const obj = {
  x: 1,
  getX() {
    return this.x;
  }
};

const fn = obj.getX;
fn(); // 非严格：undefined 或 window.x；严格：TypeError
```

原因：调用点变成了普通函数调用（默认绑定），不再是 `obj.getX()`。

解决方式：

- `bind`
- 传入包装函数

```js
const fn2 = obj.getX.bind(obj);
fn2(); // 1
```

---

## 三、深入原理：this 为什么由调用点决定

可以用一句话概括：

> **同一个函数对象，不同调用方式 → 不同 this。**

原因在于运行时会基于“调用表达式”形成内部的引用关系（有 base value），从而计算出 `this`。

- `obj.getX()`：base 是 `obj`
- `fn()`：没有 base（走默认绑定）

这也是为什么“把方法提出来再调用”会丢失 this。

---

## 四、最佳实践

1. **对象方法优先用普通函数**：需要动态 this 时不要用箭头函数当方法。
2. **回调中使用 this 要谨慎**：常用 `bind` 或在外层保存 `const self = this`（旧写法）或用箭头函数包装。
3. **统一风格**：团队应明确约定 this 的使用方式与 ESLint 规则。

---

## 参考资料

- [MDN - this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
- [MDN - Function.prototype.bind](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_objects/Function/bind)
- [ECMA-262 - ThisKeyword](https://tc39.es/ecma262/#sec-this-keyword)
