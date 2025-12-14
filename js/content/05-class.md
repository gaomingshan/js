# Class 语法详解

## 概述

ES6 的 `class` 语法让面向对象写法更接近传统语言，但它**本质仍是基于原型的语法糖**。

想“真正理解 class”，需要把它拆成两层：

- **语法层**：更清晰的声明、继承、静态方法
- **机制层（深入原理）**：构造函数 + 原型链 + `[[HomeObject]]` + `super`

---

## 一、基本语法

### 1.1 类声明

```js
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}
```

### 1.2 class 的几个“与函数不同”的点

- **不提升**：存在 TDZ（声明前使用会报错）
- **类体默认严格模式**
- **必须用 `new` 调用**（否则 TypeError）
- **类方法默认不可枚举**（更接近“真正的方法”概念）

---

## 二、实例方法、静态方法与字段

### 2.1 实例方法（放在原型上）

```js
class Counter {
  inc() { /* ... */ }
}
```

> **深入一点**
>
> `Counter.prototype.inc` 才是方法的实际存放位置，因此所有实例共享同一份方法实现。

### 2.2 静态方法与静态字段

```js
class MathUtil {
  static add(a, b) {
    return a + b;
  }

  static version = '1.0.0';
}

MathUtil.add(1, 2);
```

静态成员属于“类本身”，不属于实例。

### 2.3 公共字段与私有字段（#）

```js
class BankAccount {
  #balance = 0;

  deposit(n) {
    this.#balance += n;
  }

  getBalance() {
    return this.#balance;
  }
}
```

> **关键点**
>
> - `#` 私有字段是语法级私有：外部无法通过 `obj['#balance']` 或反射访问。
> - 它不是“约定私有”（如 `_balance`），而是真正的封装。

---

## 三、继承：extends 与 super

### 3.1 extends

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name);
  }
}
```

### 3.2 super 的两种用法

- `super(...)`：调用父类构造函数（子类构造器里必须先调用，否则不能用 `this`）
- `super.method()`：调用父类原型方法

---

## 四、深入原理：class 仍然是原型系统

### 4.1 class 是什么

`typeof Person === 'function'` 仍为真。

class 本质上是一个构造函数对象：

- 实例的 `[[Prototype]]` 指向 `Person.prototype`
- `extends` 会把子类的原型链连接到父类

### 4.2 `super.method()` 为什么能工作

`super` 的方法解析依赖内部机制：方法拥有 `[[HomeObject]]`（“它属于哪个对象”）。

简化理解：

- `super.method()` 实际上是从“父类原型”上找方法，并以当前 `this` 调用
- 这也是为什么“把方法提出来单独调用”会丢失语义（类似 this 章节的 call-site 问题）

---

## 五、最佳实践

1. **能用组合就少用深继承**：继承层级太深会让行为分散、难维护。
2. **把不变规则放到私有字段/私有方法里**：用封装保证一致性。
3. **不要在 constructor 里随意 bind**：会导致每个实例产生新函数，丢失方法共享优势。

---

## 参考资料

- [MDN - Classes](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)
- [ECMA-262 - Class Definitions](https://tc39.es/ecma262/#sec-class-definitions)
- [TC39 - Class Fields](https://github.com/tc39/proposal-class-fields)
