# 继承模式演进史

## 概述

JavaScript 的“继承”本质是**原型委托**。在 ES6 `class` 出现之前，社区发展出多种组合方式来实现“像传统 OOP 一样的继承体验”。

理解这些模式的意义在于：

- 你能读懂老代码
- 你能解释 `class extends` 的底层逻辑
- 你能在工程上做更好的选型：继承 vs 组合

---

## 一、原型链继承

### 1.1 写法

```js
function Parent() {
  this.colors = ['red', 'blue'];
}
Parent.prototype.getName = function () {
  return 'Parent';
};

function Child() {}
Child.prototype = new Parent();
```

### 1.2 问题

- 引用类型共享：`colors` 会被所有子实例共享
- 无法向 Parent 传参
- `constructor` 丢失（需修复）

---

## 二、借用构造函数（Constructor Stealing）

### 2.1 写法

```js
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}
```

### 2.2 特点

- ✅ 解决引用共享
- ✅ 可以传参
- ❌ 不能继承 Parent.prototype 上的方法（只继承“实例属性”）
- ❌ 可能导致方法重复创建

---

## 三、组合继承（经典方案）

### 3.1 写法

```js
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}
Parent.prototype.getName = function () {
  return this.name;
};

function Child(name, age) {
  Parent.call(this, name); // 第一次
  this.age = age;
}

Child.prototype = new Parent(); // 第二次
Child.prototype.constructor = Child;
```

### 3.2 问题

- 父类构造函数被调用两次
- 子类原型上出现多余的父类实例属性（浪费）

---

## 四、原型式继承（Object.create 思路）

```js
const parent = {
  colors: ['red', 'blue'],
  getName() { return 'Parent'; }
};

const child = Object.create(parent);
```

特点：

- ✅ 简洁
- ❌ 引用类型共享依旧存在

---

## 五、寄生式继承

在原型式继承基础上“增强对象”：

```js
function createChild(original) {
  const clone = Object.create(original);
  clone.sayHello = function () {};
  return clone;
}
```

问题：

- 方法不共享（每次 create 都创建新函数）

---

## 六、寄生组合式继承（ES5 最佳实践）

核心目标：

- 只调用一次 Parent
- 子类原型正确指向 Parent.prototype

```js
function inheritPrototype(Child, Parent) {
  const proto = Object.create(Parent.prototype);
  proto.constructor = Child;
  Child.prototype = proto;
}

function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}
Parent.prototype.getName = function () {
  return this.name;
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

inheritPrototype(Child, Parent);
```

---

## 七、ES6 class extends

```js
class Parent {
  constructor(name) {
    this.name = name;
    this.colors = ['red', 'blue'];
  }
  getName() {
    return this.name;
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name);
    this.age = age;
  }
}
```

你需要记住的几个机制点：

- `extends` 连接原型链
- 子类构造器必须先 `super()` 才能使用 `this`
- `super.method()` 调用父类原型方法

---

## 八、怎么选：继承 vs 组合

工程上通常推荐：

- 业务组件/领域对象：优先组合（composition）
- 框架底层抽象：少量、浅层继承可接受

原因：

- 深继承层级会把行为分散到多个父类，调试困难
- 组合更显式、耦合更低

---

## 九、最佳实践

1. **现代项目优先 `class extends`**：语义清晰、工具友好。
2. **老项目理解寄生组合式继承**：这是 ES5 时代最合理的实现。
3. **避免深继承**：优先组合与分层设计。
4. **原型上不要放可变引用类型**：例如数组/对象，避免共享污染。

---

## 参考资料

- [ECMAScript - Class Definitions](https://tc39.es/ecma262/#sec-class-definitions)
- [MDN - Classes](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)
