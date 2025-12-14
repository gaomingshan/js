# 第 15 章：原型系统深入 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 原型链基础

### 题目

`__proto__` 和 `prototype` 的区别是什么？

**选项：**
- A. 没有区别，可以互换使用
- B. `__proto__` 是实例属性，`prototype` 是构造函数属性
- C. `__proto__` 是标准属性，`prototype` 是非标准属性
- D. `__proto__` 只在浏览器中存在

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**`__proto__` vs `prototype`**

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

const person = new Person('Alice');

// prototype：构造函数的属性
console.log(Person.prototype);  // { sayHello: [Function], constructor: Person }

// __proto__：实例的内部属性，指向构造函数的 prototype
console.log(person.__proto__ === Person.prototype);  // true
```

---

**关系图**

```
Person (构造函数)
  └─ prototype ──┐
                 │
                 ↓
          { sayHello, constructor }
                 ↑
                 │
person (实例) ───┘
  └─ __proto__
```

---

**标准访问方式**

```javascript
// ❌ __proto__ 是非标准属性（但广泛支持）
person.__proto__;

// ✅ 标准方式
Object.getPrototypeOf(person);
Object.setPrototypeOf(person, newProto);

// 检查原型
Person.prototype.isPrototypeOf(person);  // true
```

---

**prototype 的属性**

```javascript
function Foo() {}

console.log(Foo.prototype);
// {
//   constructor: Foo,  // 指向构造函数
//   __proto__: Object.prototype
// }

// 添加方法
Foo.prototype.method = function() {};

// 实例可以访问
const foo = new Foo();
foo.method();  // ✅
```

---

**__proto__ 的本质**

```javascript
// __proto__ 实际上是 Object.prototype 的访问器属性
Object.getOwnPropertyDescriptor(Object.prototype, '__proto__');
// {
//   get: [Function: get __proto__],
//   set: [Function: set __proto__],
//   enumerable: false,
//   configurable: true
// }

// 等价于
person.__proto__;
Object.getPrototypeOf(person);
```

---

**函数的双重身份**

```javascript
function Foo() {}

// 作为函数对象
Foo.__proto__ === Function.prototype;  // true

// 作为构造函数
Foo.prototype;  // 用于创建实例的原型

// 实例
const foo = new Foo();
foo.__proto__ === Foo.prototype;  // true
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** new 操作符

### 题目

`new` 操作符做了哪些事情？

**选项：**
- A. 只是调用构造函数
- B. 创建对象、设置原型、绑定 this、返回对象
- C. 创建对象、调用构造函数
- D. 设置原型、绑定 this

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**new 操作符的四个步骤**

```javascript
function Person(name) {
  this.name = name;
}

const person = new Person('Alice');

// new 做了什么：
// 1. 创建空对象
// 2. 设置原型：obj.__proto__ = Person.prototype
// 3. 绑定 this 并执行构造函数
// 4. 返回对象（如果构造函数返回对象，则返回该对象）
```

---

**手动实现 new**

```javascript
function myNew(Constructor, ...args) {
  // 1. 创建空对象，设置原型
  const obj = Object.create(Constructor.prototype);
  
  // 2. 绑定 this 并执行构造函数
  const result = Constructor.apply(obj, args);
  
  // 3. 返回对象
  return result instanceof Object ? result : obj;
}

// 使用
function Person(name) {
  this.name = name;
}

const person = myNew(Person, 'Alice');
console.log(person.name);  // "Alice"
console.log(person instanceof Person);  // true
```

---

**详细步骤演示**

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

// 步骤 1：创建空对象
const obj = {};

// 步骤 2：设置原型
obj.__proto__ = Person.prototype;
// 或
Object.setPrototypeOf(obj, Person.prototype);

// 步骤 3：绑定 this 并执行
Person.call(obj, 'Alice', 25);

// 步骤 4：返回对象
const person = obj;

// 验证
person.sayHello();  // "Hello, Alice"
console.log(person instanceof Person);  // true
```

---

**构造函数返回值的影响**

```javascript
// 返回基本类型：忽略，返回 this
function Foo() {
  this.x = 1;
  return 10;
}

const foo = new Foo();
console.log(foo.x);  // 1（返回值被忽略）

// 返回对象：使用返回的对象
function Bar() {
  this.x = 1;
  return { y: 2 };
}

const bar = new Bar();
console.log(bar.x);  // undefined
console.log(bar.y);  // 2（使用返回的对象）
```

---

**不使用 new 的后果**

```javascript
function Person(name) {
  this.name = name;
}

// ❌ 不使用 new
const person1 = Person('Alice');
console.log(person1);  // undefined
console.log(window.name);  // "Alice"（污染全局）

// ✅ 使用 new
const person2 = new Person('Bob');
console.log(person2.name);  // "Bob"
```

---

**防御性构造函数**

```javascript
function Person(name) {
  // 检查是否使用 new
  if (!(this instanceof Person)) {
    return new Person(name);
  }
  
  this.name = name;
}

const person1 = new Person('Alice');  // ✅
const person2 = Person('Bob');        // ✅ 自动使用 new

console.log(person1 instanceof Person);  // true
console.log(person2 instanceof Person);  // true
```

---

**ES6 Class 的 new**

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}

// Class 必须使用 new
const person = new Person('Alice');  // ✅
// Person('Alice');  // TypeError: Class constructor cannot be invoked without 'new'
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 原型链终点

### 题目

所有原型链的终点都是 `Object.prototype`。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**原型链的终点是 `null`**

```javascript
const obj = {};

// 原型链
obj.__proto__ === Object.prototype;  // true
Object.prototype.__proto__ === null;  // true

// 完整原型链
obj → Object.prototype → null
```

---

**特殊情况：Object.create(null)**

```javascript
// 创建没有原型的对象
const obj = Object.create(null);

console.log(obj.__proto__);  // undefined
console.log(Object.getPrototypeOf(obj));  // null

// 没有继承任何方法
obj.toString();  // TypeError: obj.toString is not a function

// 原型链
obj → null
```

---

**不同类型的原型链**

**普通对象：**
```javascript
const obj = {};
obj → Object.prototype → null
```

**数组：**
```javascript
const arr = [];
arr → Array.prototype → Object.prototype → null
```

**函数：**
```javascript
function fn() {}
fn → Function.prototype → Object.prototype → null
```

**自定义构造函数：**
```javascript
function Person() {}
const person = new Person();
person → Person.prototype → Object.prototype → null
```

---

**Object.prototype 的特殊性**

```javascript
// Object.prototype 是唯一 __proto__ 为 null 的对象
console.log(Object.prototype.__proto__);  // null

// Object.prototype 上的方法
Object.prototype.toString();
Object.prototype.hasOwnProperty();
Object.prototype.isPrototypeOf();
Object.prototype.valueOf();
```

---

**修改原型链**

```javascript
function Animal() {}
function Dog() {}

// 设置继承关系
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const dog = new Dog();

// 原型链
dog → Dog.prototype → Animal.prototype → Object.prototype → null
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 原型链查找

### 题目

以下代码的输出是什么？

```javascript
function Parent() {
  this.x = 1;
}

Parent.prototype.x = 2;
Parent.prototype.y = 3;

const child = new Parent();
child.x = 4;

console.log(child.x);
console.log(child.y);
delete child.x;
console.log(child.x);
```

**选项：**
- A. `4`, `3`, `undefined`
- B. `4`, `3`, `1`
- C. `4`, `3`, `2`
- D. `1`, `3`, `2`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**属性查找规则**

```javascript
function Parent() {
  this.x = 1;  // 实例属性
}

Parent.prototype.x = 2;  // 原型属性
Parent.prototype.y = 3;

const child = new Parent();
// child.x = 1（实例属性，来自构造函数）

child.x = 4;  // 覆盖实例属性
// child.x = 4（实例属性）

console.log(child.x);  // 4（找到实例属性，停止查找）
console.log(child.y);  // 3（实例没有，查找原型）

delete child.x;  // 删除实例属性
// child.x 不存在（实例）

console.log(child.x);  // 2（实例没有，查找原型）
```

---

**属性查找过程**

```javascript
// 1. 查找实例自身属性
child.hasOwnProperty('x');  // true
child.x;  // 返回实例的 x

// 2. 查找原型链
child.hasOwnProperty('y');  // false
child.y;  // 沿原型链查找

// 3. 完整查找路径
child.x
  → child 自身属性？✓ 返回 4
  
child.y
  → child 自身属性？✗
  → Parent.prototype 属性？✓ 返回 3
  
child.z
  → child 自身属性？✗
  → Parent.prototype 属性？✗
  → Object.prototype 属性？✗
  → 返回 undefined
```

---

**delete 操作符**

```javascript
const obj = { x: 1 };
Object.setPrototypeOf(obj, { x: 2, y: 3 });

console.log(obj.x);  // 1（实例）
delete obj.x;        // 删除实例属性
console.log(obj.x);  // 2（原型）

delete obj.x;        // 尝试删除原型属性（无效）
console.log(obj.x);  // 2（原型属性不能通过实例删除）

// 必须直接删除
delete Object.getPrototypeOf(obj).x;
console.log(obj.x);  // undefined
```

---

**属性遮蔽（Property Shadowing）**

```javascript
function Parent() {}
Parent.prototype.x = 1;

const child = new Parent();

console.log(child.x);  // 1（原型）

child.x = 2;  // 创建实例属性，遮蔽原型属性
console.log(child.x);  // 2（实例）

console.log(Parent.prototype.x);  // 1（原型不受影响）
```

---

**in vs hasOwnProperty**

```javascript
function Parent() {
  this.x = 1;
}
Parent.prototype.y = 2;

const child = new Parent();

// in：检查整个原型链
console.log('x' in child);  // true
console.log('y' in child);  // true
console.log('z' in child);  // false

// hasOwnProperty：只检查自身
console.log(child.hasOwnProperty('x'));  // true
console.log(child.hasOwnProperty('y'));  // false
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** constructor

### 题目

以下代码的输出是什么？

```javascript
function Person() {}
const person = new Person();

console.log(person.constructor === Person);
console.log(person.constructor === Object);

Person.prototype = {};
const person2 = new Person();

console.log(person2.constructor === Person);
console.log(person2.constructor === Object);
```

**选项：**
- A. `true`, `false`, `true`, `false`
- B. `true`, `false`, `false`, `true`
- C. `false`, `true`, `false`, `true`
- D. `true`, `false`, `false`, `false`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**constructor 属性**

```javascript
function Person() {}

// 默认 prototype 包含 constructor
console.log(Person.prototype.constructor === Person);  // true

const person = new Person();
console.log(person.constructor === Person);  // true
console.log(person.constructor === Object);  // false

// 重写 prototype
Person.prototype = {};  // 丢失 constructor

const person2 = new Person();
console.log(person2.constructor === Person);  // false
console.log(person2.constructor === Object);  // true（继承自 Object.prototype）
```

---

**constructor 查找过程**

```javascript
// person.constructor 查找路径
person.constructor
  → person 自身？✗
  → Person.prototype.constructor？✓ 返回 Person

// person2.constructor 查找路径
person2.constructor
  → person2 自身？✗
  → Person.prototype.constructor？✗（被重写为 {}）
  → Object.prototype.constructor？✓ 返回 Object
```

---

**正确重写 prototype**

```javascript
function Person() {}

// ❌ 错误：丢失 constructor
Person.prototype = {
  sayHello() {}
};

// ✅ 方法 1：手动设置 constructor
Person.prototype = {
  constructor: Person,
  sayHello() {}
};

// ✅ 方法 2：使用 Object.defineProperty
Person.prototype = {
  sayHello() {}
};
Object.defineProperty(Person.prototype, 'constructor', {
  value: Person,
  enumerable: false,  // 默认不可枚举
  writable: true,
  configurable: true
});

// ✅ 方法 3：单独添加方法
Person.prototype.sayHello = function() {};
```

---

**constructor 的作用**

```javascript
function Person(name) {
  this.name = name;
}

const person = new Person('Alice');

// 1. 判断类型（不可靠）
console.log(person.constructor === Person);  // true

// 2. 创建同类型实例
const person2 = new person.constructor('Bob');
console.log(person2.name);  // "Bob"

// 3. 获取构造函数名
console.log(person.constructor.name);  // "Person"
```

---

**constructor 的限制**

```javascript
function Person() {}
const person = new Person();

// ❌ constructor 可以被修改
Person.prototype.constructor = Array;
console.log(person.constructor === Array);  // true

// ❌ constructor 可以被覆盖
person.constructor = String;
console.log(person.constructor === String);  // true

// ✅ instanceof 更可靠
console.log(person instanceof Person);  // true
console.log(person instanceof Array);   // false
```

---

**内置类型的 constructor**

```javascript
const arr = [];
console.log(arr.constructor === Array);  // true

const obj = {};
console.log(obj.constructor === Object);  // true

const fn = function() {};
console.log(fn.constructor === Function);  // true

const str = 'hello';
console.log(str.constructor === String);  // true
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** 继承实现

### 题目

实现一个完整的寄生组合式继承。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

**寄生组合式继承**

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  // 继承属性
  Parent.call(this, name);
  this.age = age;
}

// 继承方法
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

Child.prototype.sayAge = function() {
  console.log(this.age);
};

// 使用
const child1 = new Child('Alice', 25);
child1.sayName();  // "Alice"
child1.sayAge();   // 25

const child2 = new Child('Bob', 30);
child1.colors.push('green');
console.log(child1.colors);  // ["red", "blue", "green"]
console.log(child2.colors);  // ["red", "blue"]（独立）
```

---

**封装继承函数**

```javascript
function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
}

// 使用
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

inherit(Dog, Animal);

Dog.prototype.bark = function() {
  console.log('Woof!');
};

const dog = new Dog('Max', 'Labrador');
dog.eat();   // "Max is eating"
dog.bark();  // "Woof!"
```

---

**各种继承方式对比**

**1. 原型链继承（有缺陷）**
```javascript
function Parent() {
  this.colors = ['red'];
}

function Child() {}
Child.prototype = new Parent();

const child1 = new Child();
const child2 = new Child();

child1.colors.push('blue');
console.log(child2.colors);  // ["red", "blue"]（共享问题）
```

**2. 构造函数继承（有缺陷）**
```javascript
function Parent() {
  this.colors = ['red'];
}

Parent.prototype.getColors = function() {
  return this.colors;
};

function Child() {
  Parent.call(this);
}

const child = new Child();
child.getColors();  // TypeError（无法继承原型方法）
```

**3. 组合继承（调用两次父构造函数）**
```javascript
function Parent(name) {
  this.name = name;
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);  // 第一次调用
  this.age = age;
}

Child.prototype = new Parent();  // 第二次调用（浪费）
Child.prototype.constructor = Child;
```

**4. 寄生组合式继承（最佳）**
```javascript
function Parent(name) {
  this.name = name;
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);  // 只调用一次
  this.age = age;
}

Child.prototype = Object.create(Parent.prototype);  // 不调用构造函数
Child.prototype.constructor = Child;
```

---

**ES6 Class 继承**

```javascript
class Parent {
  constructor(name) {
    this.name = name;
  }
  
  sayName() {
    console.log(this.name);
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name);  // 调用父类构造函数
    this.age = age;
  }
  
  sayAge() {
    console.log(this.age);
  }
}

const child = new Child('Alice', 25);
child.sayName();  // "Alice"
child.sayAge();   // 25
```

---

**完整的继承工具**

```javascript
function extend(Child, Parent) {
  // 继承原型
  const prototype = Object.create(Parent.prototype);
  prototype.constructor = Child;
  Child.prototype = prototype;
  
  // 保存父类引用
  Child.super = Parent;
  
  // 静态方法继承
  Object.setPrototypeOf(Child, Parent);
}

// 使用
function Animal(name) {
  this.name = name;
}

Animal.staticMethod = function() {
  console.log('Static method');
};

Animal.prototype.eat = function() {
  console.log('Eating');
};

function Dog(name, breed) {
  Dog.super.call(this, name);
  this.breed = breed;
}

extend(Dog, Animal);

Dog.prototype.bark = function() {
  console.log('Woof!');
};

// 实例方法
const dog = new Dog('Max', 'Labrador');
dog.eat();   // "Eating"
dog.bark();  // "Woof!"

// 静态方法
Dog.staticMethod();  // "Static method"
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** instanceof

### 题目

关于 `instanceof` 操作符，以下说法正确的是？

**选项：**
- A. `instanceof` 检查原型链
- B. `[] instanceof Array` 返回 `true`
- C. `instanceof` 可以跨 iframe 使用
- D. `instanceof` 可以被自定义

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, D

### 📖 解析

**A 正确：instanceof 检查原型链**

```javascript
function Parent() {}
function Child() {}
Child.prototype = Object.create(Parent.prototype);

const child = new Child();

child instanceof Child;   // true
child instanceof Parent;  // true
child instanceof Object;  // true

// 原型链
child → Child.prototype → Parent.prototype → Object.prototype
```

---

**B 正确：[] instanceof Array**

```javascript
const arr = [];
console.log(arr instanceof Array);   // true
console.log(arr instanceof Object);  // true

// 原型链
arr → Array.prototype → Object.prototype
```

---

**C 错误：跨 iframe 问题**

```javascript
// iframe 中的数组
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const iframeArray = iframe.contentWindow.Array;

const arr = new iframeArray();
console.log(arr instanceof Array);  // false（不同的 Array 构造函数）
console.log(Array.isArray(arr));    // true（推荐使用）

// 不同 iframe 有不同的全局对象
iframe.contentWindow.Array !== window.Array;  // true
```

---

**D 正确：自定义 instanceof**

```javascript
class MyClass {
  static [Symbol.hasInstance](instance) {
    // 自定义 instanceof 行为
    return instance.constructor.name === 'MyClass';
  }
}

const obj = { constructor: { name: 'MyClass' } };
console.log(obj instanceof MyClass);  // true（自定义行为）
```

---

**instanceof 原理**

```javascript
function myInstanceof(obj, Constructor) {
  // 获取对象的原型
  let proto = Object.getPrototypeOf(obj);
  
  // 获取构造函数的 prototype
  const prototype = Constructor.prototype;
  
  // 沿原型链查找
  while (proto) {
    if (proto === prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  
  return false;
}

// 测试
function Person() {}
const person = new Person();

console.log(myInstanceof(person, Person));  // true
console.log(myInstanceof(person, Object));  // true
console.log(myInstanceof(person, Array));   // false
```

---

**instanceof 的限制**

```javascript
// 1. 基本类型
console.log(1 instanceof Number);  // false
console.log('a' instanceof String);  // false
console.log(true instanceof Boolean);  // false

// 包装对象
console.log(new Number(1) instanceof Number);  // true

// 2. null 和 undefined
console.log(null instanceof Object);  // false
console.log(undefined instanceof Object);  // false

// 3. 原型被修改
function Foo() {}
const foo = new Foo();
console.log(foo instanceof Foo);  // true

Foo.prototype = {};
console.log(foo instanceof Foo);  // false（原型已改变）

// 4. Object.create(null)
const obj = Object.create(null);
console.log(obj instanceof Object);  // false（没有原型）
```

---

**类型检测的最佳实践**

```javascript
// 数组
Array.isArray(arr);

// 对象
Object.prototype.toString.call(obj) === '[object Object]';

// null
obj === null;

// undefined
typeof obj === 'undefined';

// 函数
typeof fn === 'function';

// 基本类型
typeof num === 'number';
typeof str === 'string';
typeof bool === 'boolean';

// Symbol
typeof sym === 'symbol';

// BigInt
typeof big === 'bigint';

// 自定义类型
obj instanceof MyClass;
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** Object.create

### 题目

手动实现 `Object.create()` 方法。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

**Object.create 实现**

```javascript
function myCreate(proto, propertiesObject) {
  // 参数验证
  if (typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null');
  }
  
  // 创建空函数
  function F() {}
  
  // 设置原型
  F.prototype = proto;
  
  // 创建实例
  const obj = new F();
  
  // 添加属性
  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }
  
  return obj;
}

// 测试
const proto = {
  sayHello() {
    console.log('Hello');
  }
};

const obj = myCreate(proto, {
  name: {
    value: 'Alice',
    writable: true,
    enumerable: true,
    configurable: true
  }
});

console.log(obj.name);  // "Alice"
obj.sayHello();  // "Hello"
console.log(Object.getPrototypeOf(obj) === proto);  // true
```

---

**Object.create 的用途**

**1. 创建纯净对象**
```javascript
// 没有任何原型方法
const obj = Object.create(null);

console.log(obj.toString);  // undefined
console.log(obj.hasOwnProperty);  // undefined

// 用作 Map
obj.key1 = 'value1';
obj.key2 = 'value2';

// 不用担心属性名冲突
obj['toString'] = 'safe';  // ✅ 安全
```

**2. 实现继承**
```javascript
function Parent() {
  this.x = 1;
}

Parent.prototype.sayHello = function() {
  console.log('Hello');
};

function Child() {
  Parent.call(this);
  this.y = 2;
}

// 设置原型链
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

const child = new Child();
child.sayHello();  // "Hello"
```

**3. 创建临时对象**
```javascript
const原obj = {
  x: 1,
  y: 2
};

// 创建临时对象，不影响原对象
const temp = Object.create(obj);
temp.z = 3;

console.log(temp.x);  // 1（继承）
console.log(temp.z);  // 3（自有）
console.log(obj.z);   // undefined（不影响原对象）
```

**4. 实现对象工厂**
```javascript
const personProto = {
  sayHello() {
    console.log(`Hello, ${this.name}`);
  }
};

function createPerson(name, age) {
  return Object.create(personProto, {
    name: {
      value: name,
      writable: true,
      enumerable: true
    },
    age: {
      value: age,
      writable: true,
      enumerable: true
    }
  });
}

const person = createPerson('Alice', 25);
person.sayHello();  // "Hello, Alice"
```

---

**Object.create vs new**

```javascript
// new：调用构造函数
function Person(name) {
  this.name = name;
}

const person1 = new Person('Alice');
// 1. 创建对象
// 2. 设置原型
// 3. 执行构造函数
// 4. 返回对象

// Object.create：只设置原型
const person2 = Object.create(Person.prototype);
// 1. 创建对象
// 2. 设置原型
// 没有执行构造函数

console.log(person1.name);  // "Alice"
console.log(person2.name);  // undefined
```

---

**Object.create vs 字面量**

```javascript
// 字面量：原型是 Object.prototype
const obj1 = {};
console.log(Object.getPrototypeOf(obj1) === Object.prototype);  // true

// Object.create：自定义原型
const proto = { x: 1 };
const obj2 = Object.create(proto);
console.log(Object.getPrototypeOf(obj2) === proto);  // true

// Object.create(null)：没有原型
const obj3 = Object.create(null);
console.log(Object.getPrototypeOf(obj3));  // null
```

---

**属性描述符**

```javascript
const obj = Object.create({}, {
  // 数据属性
  name: {
    value: 'Alice',
    writable: true,      // 可写
    enumerable: true,    // 可枚举
    configurable: true   // 可配置
  },
  
  // 访问器属性
  fullName: {
    get() {
      return this.firstName + ' ' + this.lastName;
    },
    set(value) {
      [this.firstName, this.lastName] = value.split(' ');
    },
    enumerable: true,
    configurable: true
  }
});

obj.fullName = 'Alice Smith';
console.log(obj.firstName);  // "Alice"
console.log(obj.lastName);   // "Smith"
console.log(obj.fullName);   // "Alice Smith"
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** 原型污染

### 题目

什么是原型污染？如何防御？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**原型污染（Prototype Pollution）**

原型污染是指攻击者通过修改对象原型，影响所有继承该原型的对象。

**攻击示例：**
```javascript
// 危险的合并函数
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      target[key] = merge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 攻击代码
const malicious = JSON.parse('{"__proto__": {"polluted": "yes"}}');
const obj = {};
merge(obj, malicious);

// 所有对象都被污染
const clean = {};
console.log(clean.polluted);  // "yes"（被污染）
```

---

**真实攻击场景**

**1. JSON 解析**
```javascript
const userInput = '{"__proto__": {"isAdmin": true}}';
const obj = JSON.parse(userInput);

// 修改 Object.prototype
Object.assign({}, obj);

// 所有对象都被污染
const user = { name: 'Alice' };
console.log(user.isAdmin);  // true（危险！）
```

**2. 查询参数**
```javascript
// URL: ?__proto__[isAdmin]=true
const query = parseQuery(location.search);
Object.assign({}, query);

// 全局污染
const user = {};
console.log(user.isAdmin);  // true
```

---

**防御措施**

**1. 过滤危险键**
```javascript
function safeMerge(target, source) {
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  
  for (const key in source) {
    if (dangerousKeys.includes(key)) {
      continue;  // 跳过危险键
    }
    
    if (typeof source[key] === 'object') {
      target[key] = safeMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  
  return target;
}

// 安全
const obj = {};
safeMerge(obj, { __proto__: { polluted: 'yes' } });
console.log({}.polluted);  // undefined（未被污染）
```

**2. 使用 Object.create(null)**
```javascript
// 创建没有原型的对象
const safeObj = Object.create(null);

// 无法污染
safeObj.__proto__ = { polluted: 'yes' };
console.log({}.polluted);  // undefined

// 作为配置对象
const config = Object.create(null);
config.apiUrl = 'https://api.example.com';
```

**3. Object.freeze 冻结原型**
```javascript
// 冻结 Object.prototype
Object.freeze(Object.prototype);

// 尝试污染
Object.prototype.polluted = 'yes';
console.log({}.polluted);  // undefined（失败）

// 注意：可能影响其他代码
```

**4. 使用 Map 代替对象**
```javascript
// ❌ 对象容易被污染
const obj = {};
obj['__proto__'] = { polluted: 'yes' };

// ✅ Map 安全
const map = new Map();
map.set('__proto__', { polluted: 'yes' });
console.log(map.get('__proto__'));  // { polluted: 'yes' }
console.log({}.polluted);  // undefined
```

**5. 使用 hasOwnProperty**
```javascript
function safeMerge(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key) && key !== '__proto__') {
      target[key] = source[key];
    }
  }
  return target;
}

// 或使用静态方法
Object.hasOwn(source, key);  // ES2022
```

**6. 库的防护**
```javascript
// Lodash 4.17.11+ 已修复
_.merge({}, malicious);  // 安全

// 检查库版本
npm audit

// 更新依赖
npm update
```

---

**检测原型污染**

```javascript
// 检测函数
function isPrototypePolluted() {
  const obj = {};
  return obj.polluted !== undefined;
}

// 清理污染
function cleanPrototype() {
  delete Object.prototype.polluted;
  delete Object.prototype.isAdmin;
  // ... 清理已知污染
}

// 监控
setInterval(() => {
  if (isPrototypePolluted()) {
    console.warn('检测到原型污染！');
    cleanPrototype();
  }
}, 1000);
```

---

**安全的对象操作**

```javascript
// ✅ 安全的对象创建
const obj = Object.create(null);

// ✅ 安全的属性设置
Object.defineProperty(obj, key, {
  value: value,
  writable: true,
  enumerable: true,
  configurable: true
});

// ✅ 安全的属性复制
Object.assign(
  Object.create(null),
  source
);

// ✅ 安全的键遍历
Object.keys(source).forEach(key => {
  if (key !== '__proto__') {
    target[key] = source[key];
  }
});
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 原型链完整分析

### 题目

分析并画出以下代码的完整原型链。

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayName = function() {
  console.log(this.name);
};

const person = new Person('Alice');
```

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**完整原型链图**

```
person (实例对象)
  |
  | __proto__
  ↓
Person.prototype (原型对象)
  {
    sayName: Function,
    constructor: Person,
    __proto__: Object.prototype
  }
  |
  | __proto__
  ↓
Object.prototype (根原型)
  {
    toString: Function,
    hasOwnProperty: Function,
    ...
    __proto__: null
  }
  |
  | __proto__
  ↓
null (原型链终点)
```

---

**构造函数的原型链**

```
Person (构造函数)
  |
  | __proto__
  ↓
Function.prototype
  {
    call: Function,
    apply: Function,
    bind: Function,
    __proto__: Object.prototype
  }
  |
  | __proto__
  ↓
Object.prototype
  |
  | __proto__
  ↓
null
```

---

**完整关系图**

```
               Person (Function)
              /      |      \
    prototype/       |__proto__\Function.prototype
            /        |          \
           ↓         |           ↓
Person.prototype  <--|      Function.prototype
    |                |           |
    |constructor     |           |__proto__
    |                |           ↓
    ↓                |      Object.prototype
  Person             |           |
                     |           |__proto__
    person           |           ↓
      |              |         null
      |__proto__     |
      ↓              |
Person.prototype <---|
      |
      |__proto__
      ↓
Object.prototype
      |
      |__proto__
      ↓
    null
```

---

**属性查找过程**

```javascript
// 1. person.name
person.name
→ person 自身属性 ✓
→ 返回 "Alice"

// 2. person.sayName
person.sayName
→ person 自身属性 ✗
→ Person.prototype.sayName ✓
→ 返回 Function

// 3. person.toString
person.toString
→ person 自身属性 ✗
→ Person.prototype.toString ✗
→ Object.prototype.toString ✓
→ 返回 Function

// 4. person.notExist
person.notExist
→ person 自身属性 ✗
→ Person.prototype.notExist ✗
→ Object.prototype.notExist ✗
→ null（原型链终点）
→ 返回 undefined
```

---

**关系验证**

```javascript
// 实例 → 原型
person.__proto__ === Person.prototype;  // true
Object.getPrototypeOf(person) === Person.prototype;  // true

// 原型 → 根原型
Person.prototype.__proto__ === Object.prototype;  // true

// 根原型 → null
Object.prototype.__proto__ === null;  // true

// 构造函数 → 原型
Person.prototype.constructor === Person;  // true

// 实例 → 构造函数
person.constructor === Person;  // true

// 构造函数 → Function
Person.__proto__ === Function.prototype;  // true

// Function → Object
Function.prototype.__proto__ === Object.prototype;  // true
```

---

**特殊情况**

**Function 的原型**
```javascript
// Function 是自己的实例
Function.__proto__ === Function.prototype;  // true

// Function.prototype 是函数
typeof Function.prototype;  // "function"

// 其他构造函数的 prototype 是对象
typeof Object.prototype;  // "object"
typeof Array.prototype;  // "object"
```

**Object 的原型**
```javascript
// Object 是 Function 的实例
Object.__proto__ === Function.prototype;  // true

// Object.prototype 是普通对象
typeof Object.prototype;  // "object"

// Object.prototype 没有原型
Object.prototype.__proto__ === null;  // true
```

---

**完整的原型链关系**

```javascript
// 实例
person instanceof Person;  // true
person instanceof Object;  // true

// 构造函数
Person instanceof Function;  // true
Person instanceof Object;   // true

// 原型对象
Person.prototype instanceof Object;  // true

// 内置对象
Function instanceof Object;  // true
Object instanceof Function;  // true

// 循环关系
Function instanceof Function;  // true
Object instanceof Object;     // true
```

</details>

---

**本章总结：**
- ✅ `__proto__` vs `prototype`
- ✅ `new` 操作符原理
- ✅ 原型链终点
- ✅ 原型链查找
- ✅ `constructor` 属性
- ✅ 继承实现
- ✅ `instanceof` 原理
- ✅ `Object.create` 实现
- ✅ 原型污染防御
- ✅ 原型链完整分析

**下一章：** [第 16 章：类型系统与转换](./chapter-16.md)
