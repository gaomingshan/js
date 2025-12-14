# 原型与原型链

## 概述

JavaScript 的继承机制基于**原型（prototype）**：对象在访问属性时，如果自身没有，会沿着原型链向上查找。

理解原型链的意义不止是“会用 class”，更重要的是：你能解释 `instanceof`、方法共享、属性遮蔽、以及很多看似“诡异”的行为（例如 `toString` 从哪里来的）。

---

## 一、三个关键概念

### 1.1 `prototype`（函数的原型对象）

- 只有**函数**才有 `prototype` 属性（箭头函数除外）。
- `prototype` 用来作为实例对象的“原型”。

### 1.2 `[[Prototype]]`（对象的原型引用）

- 每个对象内部都有一个 `[[Prototype]]` 内部槽位。
- `__proto__` 是历史遗留访问器（不推荐依赖）。

推荐使用：

- `Object.getPrototypeOf(obj)`
- `Object.setPrototypeOf(obj, proto)`（不推荐频繁使用）

### 1.3 `constructor`

- `Ctor.prototype.constructor` 默认指回构造函数本身。
- 如果你手动替换了 `Ctor.prototype`，通常要手动修复 `constructor`。

关系图（记住这三条就够）：

```text
Ctor.prototype  -->  原型对象
instance.[[Prototype]]  -->  Ctor.prototype
Ctor.prototype.constructor  -->  Ctor
```

---

## 二、属性查找机制（你必须会解释）

### 2.1 读取属性：沿原型链查找

访问 `obj.x` 时：

1. 先查 `obj` 自身有没有 `x`
2. 没有则查 `obj.[[Prototype]]`
3. 一直找到 `null` 为止

### 2.2 写入属性：通常写到“自身”

- `obj.x = 1` 一般会在 `obj` 上创建/修改自有属性 `x`
- 如果原型上有只读属性（`writable: false` 或只有 getter），赋值可能失败（严格模式抛错）

### 2.3 判断属性来源

- `Object.hasOwn(obj, key)`：只看自有属性（推荐，ES2022）
- `key in obj`：会沿原型链查找

---

## 三、创建对象的常见方式

### 3.1 字面量

```js
const obj = { a: 1 };
```

### 3.2 构造函数 + new

```js
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function () {
  return `Hi ${this.name}`;
};

const p = new Person('Alice');
```

### 3.3 `Object.create(proto)`

```js
const proto = { greet() { return 'hello'; } };
const obj = Object.create(proto);
```

> **提示**
>
> `Object.create(null)` 可以创建“无原型对象”，适合做纯字典（避免 `toString` 等原型属性干扰）。

---

## 四、深入原理：`new` 到底做了什么

可以把 `new Ctor(...args)` 近似理解为四步：

1. 创建空对象 `obj`
2. 设置 `obj.[[Prototype]] = Ctor.prototype`
3. 执行 `Ctor.call(obj, ...args)`
4. 如果构造函数显式返回对象，则返回它；否则返回 `obj`

这解释了：

- 为什么把方法放在 `prototype` 上可以被实例共享
- 为什么 `instanceof` 与 `Ctor.prototype` 有关

---

## 五、原型链继承的最小实现

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.eat = function () {
  return `${this.name} eats`;
};

function Dog(name) {
  Animal.call(this, name);
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function () {
  return `${this.name} barks`;
};
```

---

## 六、常见坑（高频）

1. **把实例可变对象放在原型上**：会被所有实例共享导致相互污染。
2. **for...in 会枚举原型链上的可枚举属性**：遍历对象时要谨慎。
3. **原型污染（prototype pollution）**：避免把不可信输入直接写入对象（例如合并对象时包含 `__proto__`）。
4. **跨 realm 的 instanceof**：不同 iframe/worker 里 `Array` 不是同一个构造函数。

---

## 参考资料

- [MDN - Inheritance and the prototype chain](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [ECMA-262 - OrdinaryGetPrototypeOf](https://tc39.es/ecma262/#sec-ordinarygetprototypeof)
- [MDN - Object.getPrototypeOf](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf)
