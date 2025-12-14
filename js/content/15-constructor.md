# 构造函数与 new 操作符

## 概述

构造函数（constructor function）是 JavaScript 创建对象的传统方式之一。

理解 `new` 的工作原理，你才能解释：

- 实例的原型从哪来
- 构造函数返回值什么时候会“覆盖 this”
- 为什么方法应该放在 `prototype` 上
- 为什么忘记 `new` 会产生严重 bug

---

## 一、构造函数是什么

构造函数本质是普通函数，只是约定：

- 函数名首字母大写
- 使用 `new` 调用

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const p = new Person('Alice', 25);
```

### 1.1 构造函数 vs 普通函数调用

```js
function Person(name) {
  this.name = name;
}

const p1 = new Person('Alice');

// 忘记 new：严格模式下 this 为 undefined，非严格可能污染全局
const p2 = Person('Bob');
```

---

## 二、`new` 的内部步骤（核心）

`new Ctor(...args)` 可以近似理解为：

1. 创建新对象 `obj`
2. 设置 `obj.[[Prototype]] = Ctor.prototype`
3. 执行 `Ctor.call(obj, ...args)`
4. 若构造函数显式返回对象，则返回该对象；否则返回 `obj`

### 2.1 手写一个 `new`

```js
function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype);
  const ret = Ctor.apply(obj, args);
  return ret instanceof Object ? ret : obj;
}
```

---

## 三、构造函数的返回值规则

### 3.1 默认返回 this

```js
function A() {
  this.x = 1;
}

new A().x; // 1
```

### 3.2 返回对象会覆盖 this

```js
function B() {
  this.x = 1;
  return { x: 2 };
}

new B().x; // 2
```

### 3.3 返回原始值会被忽略

```js
function C() {
  this.x = 1;
  return 123;
}

new C().x; // 1
```

> **建议**
>
> 构造函数通常不要显式 `return` 对象，除非你明确要改变实例形态。

---

## 四、`constructor` 属性与原型替换

`instance.constructor` 通常来自原型：

```js
function Person() {}
const p = new Person();

p.hasOwnProperty('constructor'); // false
p.constructor === Person; // true
```

### 4.1 替换 prototype 会导致 constructor 丢失

```js
function Person() {}

Person.prototype = {
  sayHi() {}
};

const p = new Person();
// p.constructor 可能变成 Object
```

修复方式：

```js
Person.prototype = {
  constructor: Person,
  sayHi() {}
};
```

---

## 五、`instanceof` 与构造函数

`obj instanceof Ctor` 检查：`Ctor.prototype` 是否在 `obj` 的原型链上。

因此：

- 替换 `Ctor.prototype` 会影响已有实例的 `instanceof` 结果
- 跨 iframe/realm 的 `instanceof` 可能失效（不同全局的构造函数不是同一个）

---

## 六、构造函数常见问题

### 6.1 方法重复创建

```js
function Person(name) {
  this.name = name;
  this.greet = function () {
    return 'hi';
  };
}

new Person('a').greet === new Person('b').greet; // false
```

更好的写法：把方法放在原型上共享：

```js
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  return 'hi';
};
```

### 6.2 忘记 new

常见应对：

- `instanceof` 自修复（老派）
- `new.target` 自修复（ES6）
- **直接用 `class`**（最推荐，语法强制 `new`）

---

## 七、最佳实践

1. **方法放在 `prototype`**：共享、节省内存。
2. **避免构造函数返回对象**：让类型与原型关系更清晰。
3. **避免忘记 new**：新代码优先用 `class`。
4. **不要频繁替换 prototype**：会影响 `constructor/instanceof` 与优化。

---

## 参考资料

- [ECMAScript - new Operator](https://tc39.es/ecma262/#sec-new-operator)
- [MDN - new 运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new)
