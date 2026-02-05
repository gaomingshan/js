# 继承模式

> 掌握 JavaScript 的多种继承实现方式

---

## 概述

JavaScript 通过原型链实现继承，但有多种继承模式可供选择。理解各种继承模式的优缺点，是构建良好对象体系的基础。

本章将深入：
- 原型链继承
- 构造函数继承
- 组合继承
- 寄生组合继承
- ES6 Class 继承
- 多重继承与 Mixin

---

## 1. 原型链继承

### 1.1 基本实现

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ["red", "blue"];
}

Parent.prototype.getName = function() {
  return this.name;
};

function Child(age) {
  this.age = age;
}

// 继承：Child.prototype 指向 Parent 实例
Child.prototype = new Parent("Parent");

const child1 = new Child(10);
console.log(child1.getName());  // "Parent"（继承自 Parent）
```

### 1.2 优点

```javascript
// 1. 简单直观
// 2. 实现了原型链继承
// 3. 可以访问父类原型方法

const child = new Child(10);
console.log(child instanceof Child);   // true
console.log(child instanceof Parent);  // true
```

### 1.3 缺点

**问题 1：引用类型共享**

```javascript
function Parent() {
  this.colors = ["red", "blue"];
}

function Child() {}
Child.prototype = new Parent();

const child1 = new Child();
const child2 = new Child();

// 修改 child1 的 colors
child1.colors.push("green");

// child2 也被影响（共享引用）
console.log(child2.colors);  // ["red", "blue", "green"]
```

**问题 2：无法向父类传参**

```javascript
function Parent(name) {
  this.name = name;
}

function Child(age) {
  this.age = age;
}

// 继承时就已经实例化，无法传参
Child.prototype = new Parent();

const child = new Child(10);
console.log(child.name);  // undefined（无法传入 name）
```

---

## 2. 构造函数继承

### 2.1 基本实现

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ["red", "blue"];
}

Parent.prototype.getName = function() {
  return this.name;
};

function Child(name, age) {
  // 调用父类构造函数
  Parent.call(this, name);
  this.age = age;
}

const child1 = new Child("Alice", 10);
const child2 = new Child("Bob", 12);

// 引用类型独立
child1.colors.push("green");
console.log(child1.colors);  // ["red", "blue", "green"]
console.log(child2.colors);  // ["red", "blue"]
```

### 2.2 优点

```javascript
// 1. 可以向父类传参
const child = new Child("Alice", 10);
console.log(child.name);  // "Alice"

// 2. 避免引用类型共享
const child1 = new Child("Alice", 10);
const child2 = new Child("Bob", 12);
child1.colors.push("green");
console.log(child2.colors);  // ["red", "blue"]（不受影响）
```

### 2.3 缺点

**问题 1：无法继承原型方法**

```javascript
function Parent(name) {
  this.name = name;
}

Parent.prototype.getName = function() {
  return this.name;
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

const child = new Child("Alice", 10);
console.log(child.getName);  // undefined（无法访问原型方法）
```

**问题 2：方法必须在构造函数中定义**

```javascript
function Parent(name) {
  this.name = name;
  
  // 方法必须在构造函数中定义
  this.getName = function() {
    return this.name;
  };
}

// 每个实例都有独立的方法副本（浪费内存）
const parent1 = new Parent("Alice");
const parent2 = new Parent("Bob");
console.log(parent1.getName === parent2.getName);  // false
```

**问题 3：instanceof 失效**

```javascript
const child = new Child("Alice", 10);
console.log(child instanceof Child);   // true
console.log(child instanceof Parent);  // false（不在原型链上）
```

---

## 3. 组合继承

### 3.1 基本实现

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ["red", "blue"];
}

Parent.prototype.getName = function() {
  return this.name;
};

function Child(name, age) {
  // 第一次调用父类构造函数：继承属性
  Parent.call(this, name);
  this.age = age;
}

// 第二次调用父类构造函数：继承原型
Child.prototype = new Parent();
Child.prototype.constructor = Child;

Child.prototype.getAge = function() {
  return this.age;
};

const child1 = new Child("Alice", 10);
const child2 = new Child("Bob", 12);

// 引用类型独立
child1.colors.push("green");
console.log(child1.colors);  // ["red", "blue", "green"]
console.log(child2.colors);  // ["red", "blue"]

// 可以访问原型方法
console.log(child1.getName());  // "Alice"

// instanceof 正常
console.log(child1 instanceof Child);   // true
console.log(child1 instanceof Parent);  // true
```

### 3.2 优点

```javascript
// 1. 可以向父类传参
// 2. 引用类型独立
// 3. 可以继承原型方法
// 4. instanceof 正常
// 5. 方法可复用
```

### 3.3 缺点

**问题：父类构造函数调用两次**

```javascript
function Parent(name) {
  console.log("Parent constructor called");
  this.name = name;
}

function Child(name, age) {
  Parent.call(this, name);  // 第一次调用
  this.age = age;
}

Child.prototype = new Parent();  // 第二次调用
Child.prototype.constructor = Child;

const child = new Child("Alice", 10);
// 输出：
// Parent constructor called（设置原型时）
// Parent constructor called（创建实例时）

// 结果：Child.prototype 上有多余的属性
console.log(Child.prototype);
// Parent { name: undefined }（第二次调用产生的属性）
```

---

## 4. 原型式继承

### 4.1 基本实现

```javascript
// Douglas Crockford 提出
function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

// 使用
const parent = {
  name: "Parent",
  colors: ["red", "blue"]
};

const child1 = object(parent);
child1.name = "Child1";

const child2 = object(parent);
child2.name = "Child2";

// 引用类型共享（与原型链继承相同的问题）
child1.colors.push("green");
console.log(child2.colors);  // ["red", "blue", "green"]
```

### 4.2 ES5 规范化：Object.create()

```javascript
const parent = {
  name: "Parent",
  colors: ["red", "blue"],
  getName() {
    return this.name;
  }
};

const child = Object.create(parent);
child.name = "Child";

console.log(child.getName());  // "Child"
console.log(child.colors);     // ["red", "blue"]

// 指定属性描述符
const child2 = Object.create(parent, {
  name: {
    value: "Child2",
    writable: true,
    enumerable: true,
    configurable: true
  }
});
```

### 4.3 适用场景

```javascript
// 适合不需要单独创建构造函数，只是想让对象之间共享信息的场景

const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retry: 3
};

// 创建带默认配置的新配置
const devConfig = Object.create(config);
devConfig.apiUrl = "http://localhost:3000";

console.log(devConfig.apiUrl);   // "http://localhost:3000"（覆盖）
console.log(devConfig.timeout);  // 5000（继承）
```

---

## 5. 寄生式继承

### 5.1 基本实现

```javascript
function createChild(parent) {
  // 创建对象
  const clone = Object.create(parent);
  
  // 增强对象
  clone.sayHi = function() {
    console.log("Hi");
  };
  
  return clone;
}

const parent = {
  name: "Parent",
  colors: ["red", "blue"]
};

const child = createChild(parent);
child.sayHi();  // "Hi"
```

### 5.2 缺点

```javascript
// 与构造函数继承类似：方法无法复用
const child1 = createChild(parent);
const child2 = createChild(parent);

console.log(child1.sayHi === child2.sayHi);  // false（每次创建新函数）
```

---

## 6. 寄生组合继承

### 6.1 基本实现（推荐）

```javascript
function inheritPrototype(Child, Parent) {
  // 创建父类原型的副本
  const prototype = Object.create(Parent.prototype);
  
  // 修复 constructor
  prototype.constructor = Child;
  
  // 设置子类原型
  Child.prototype = prototype;
}

function Parent(name) {
  this.name = name;
  this.colors = ["red", "blue"];
}

Parent.prototype.getName = function() {
  return this.name;
};

function Child(name, age) {
  // 继承属性
  Parent.call(this, name);
  this.age = age;
}

// 继承原型
inheritPrototype(Child, Parent);

Child.prototype.getAge = function() {
  return this.age;
};

const child1 = new Child("Alice", 10);
const child2 = new Child("Bob", 12);

// 引用类型独立
child1.colors.push("green");
console.log(child1.colors);  // ["red", "blue", "green"]
console.log(child2.colors);  // ["red", "blue"]

// 可以访问原型方法
console.log(child1.getName());  // "Alice"
console.log(child1.getAge());   // 10

// instanceof 正常
console.log(child1 instanceof Child);   // true
console.log(child1 instanceof Parent);  // true
```

### 6.2 优点

```javascript
// 1. 只调用一次父类构造函数
// 2. 原型链保持不变
// 3. instanceof 和 isPrototypeOf 正常
// 4. 没有多余的属性
// 5. 被认为是最理想的继承方式
```

### 6.3 完整示例

```javascript
// 工具函数
function inheritPrototype(Child, Parent) {
  const prototype = Object.create(Parent.prototype);
  prototype.constructor = Child;
  Child.prototype = prototype;
}

// 父类
function Animal(name) {
  this.name = name;
  this.sleeping = false;
}

Animal.prototype.eat = function(food) {
  console.log(`${this.name} is eating ${food}`);
};

Animal.prototype.sleep = function() {
  this.sleeping = true;
  console.log(`${this.name} is sleeping`);
};

// 子类 1
function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

inheritPrototype(Dog, Animal);

Dog.prototype.bark = function() {
  console.log(`${this.name} is barking`);
};

// 子类 2
function Cat(name, color) {
  Animal.call(this, name);
  this.color = color;
}

inheritPrototype(Cat, Animal);

Cat.prototype.meow = function() {
  console.log(`${this.name} is meowing`);
};

// 使用
const dog = new Dog("Buddy", "Golden Retriever");
dog.eat("bone");  // "Buddy is eating bone"
dog.bark();       // "Buddy is barking"

const cat = new Cat("Whiskers", "orange");
cat.eat("fish");  // "Whiskers is eating fish"
cat.meow();       // "Whiskers is meowing"
```

---

## 7. ES6 Class 继承

### 7.1 基本语法

```javascript
class Parent {
  constructor(name) {
    this.name = name;
    this.colors = ["red", "blue"];
  }
  
  getName() {
    return this.name;
  }
}

class Child extends Parent {
  constructor(name, age) {
    // 必须先调用 super()
    super(name);
    this.age = age;
  }
  
  getAge() {
    return this.age;
  }
  
  // 覆盖父类方法
  getName() {
    return `Child: ${super.getName()}`;
  }
}

const child = new Child("Alice", 10);
console.log(child.getName());  // "Child: Alice"
console.log(child.getAge());   // 10
```

### 7.2 super 关键字

```javascript
class Parent {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    return `Hello, ${this.name}`;
  }
}

class Child extends Parent {
  constructor(name, age) {
    // super() 作为函数：调用父类构造函数
    super(name);
    this.age = age;
  }
  
  greet() {
    // super 作为对象：访问父类方法
    return `${super.greet()}, I'm ${this.age} years old`;
  }
  
  static classMethod() {
    // 静态方法中的 super 指向父类
    return super.name;
  }
}

const child = new Child("Alice", 10);
console.log(child.greet());  // "Hello, Alice, I'm 10 years old"
```

### 7.3 Class 继承的本质

```javascript
// Class 继承本质上是寄生组合继承的语法糖
class Parent {}
class Child extends Parent {}

// 等价于
function Parent() {}
function Child() {
  Parent.call(this);
}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

// 额外：Class 继承还会继承静态方法
Object.setPrototypeOf(Child, Parent);
```

### 7.4 必须先调用 super()

```javascript
class Parent {
  constructor(name) {
    this.name = name;
  }
}

class Child extends Parent {
  constructor(name, age) {
    // ❌ 错误：使用 this 前必须先调用 super()
    // this.age = age;  // ReferenceError
    
    super(name);  // ✅ 先调用 super()
    this.age = age;
  }
}
```

### 7.5 静态方法继承

```javascript
class Parent {
  static staticMethod() {
    return "Parent static method";
  }
}

class Child extends Parent {
  static staticMethod() {
    return `${super.staticMethod()} + Child static method`;
  }
}

console.log(Child.staticMethod());
// "Parent static method + Child static method"
```

---

## 8. 多重继承与 Mixin

### 8.1 JavaScript 不支持多重继承

```javascript
// ❌ 不支持
class A {}
class B {}
class C extends A, B {}  // SyntaxError
```

### 8.2 Mixin 模式

```javascript
// Mixin 1
const CanEat = {
  eat(food) {
    console.log(`${this.name} is eating ${food}`);
  }
};

// Mixin 2
const CanWalk = {
  walk() {
    console.log(`${this.name} is walking`);
  }
};

// Mixin 3
const CanSwim = {
  swim() {
    console.log(`${this.name} is swimming`);
  }
};

// 应用 Mixin
class Animal {
  constructor(name) {
    this.name = name;
  }
}

Object.assign(Animal.prototype, CanEat, CanWalk);

class Fish extends Animal {
  constructor(name) {
    super(name);
  }
}

Object.assign(Fish.prototype, CanSwim);

// 使用
const fish = new Fish("Nemo");
fish.eat("plankton");  // "Nemo is eating plankton"
fish.swim();           // "Nemo is swimming"
```

### 8.3 Mixin 工厂函数

```javascript
function mix(...mixins) {
  class Mix {
    constructor() {
      for (let mixin of mixins) {
        copyProperties(this, new mixin());
      }
    }
  }
  
  for (let mixin of mixins) {
    copyProperties(Mix, mixin);
    copyProperties(Mix.prototype, mixin.prototype);
  }
  
  return Mix;
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}

// 使用
class CanFly {
  fly() {
    console.log("Flying");
  }
}

class CanRun {
  run() {
    console.log("Running");
  }
}

class Bird extends mix(CanFly, CanRun) {
  constructor(name) {
    super();
    this.name = name;
  }
}

const bird = new Bird("Tweety");
bird.fly();  // "Flying"
bird.run();  // "Running"
```

### 8.4 现代 Mixin：函数式

```javascript
// Mixin 作为函数
const withEat = (Base) => class extends Base {
  eat(food) {
    console.log(`${this.name} is eating ${food}`);
  }
};

const withWalk = (Base) => class extends Base {
  walk() {
    console.log(`${this.name} is walking`);
  }
};

const withSwim = (Base) => class extends Base {
  swim() {
    console.log(`${this.name} is swimming`);
  }
};

// 组合 Mixin
class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Duck extends withEat(withWalk(withSwim(Animal))) {
  quack() {
    console.log(`${this.name} is quacking`);
  }
}

const duck = new Duck("Donald");
duck.eat("bread");  // "Donald is eating bread"
duck.walk();        // "Donald is walking"
duck.swim();        // "Donald is swimming"
duck.quack();       // "Donald is quacking"
```

---

## 9. 继承模式对比

### 9.1 对比表

| 模式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 原型链继承 | 简单 | 引用类型共享、无法传参 | 不推荐 |
| 构造函数继承 | 可传参、引用独立 | 无法继承原型方法 | 不推荐 |
| 组合继承 | 综合前两者优点 | 调用两次构造函数 | 较常用 |
| 原型式继承 | 简单 | 引用类型共享 | 简单对象继承 |
| 寄生式继承 | 可增强对象 | 方法无法复用 | 特殊场景 |
| **寄生组合继承** | 完美解决所有问题 | 实现稍复杂 | **最推荐** |
| **ES6 Class** | 语法简洁、易读 | 本质仍是原型 | **最推荐** |

### 9.2 选择建议

```javascript
// ✅ 推荐：ES6 Class（现代项目）
class Parent {}
class Child extends Parent {}

// ✅ 推荐：寄生组合继承（ES5 项目）
function inheritPrototype(Child, Parent) {
  const prototype = Object.create(Parent.prototype);
  prototype.constructor = Child;
  Child.prototype = prototype;
}

// ❌ 不推荐：其他模式（有明显缺陷）
```

---

## 10. 工程实践

### 10.1 继承的最佳实践

```javascript
// ✅ 优先使用组合而非继承
class Logger {
  log(message) {
    console.log(`[LOG] ${message}`);
  }
}

class UserService {
  constructor() {
    this.logger = new Logger();  // 组合
  }
  
  createUser(name) {
    this.logger.log(`Creating user: ${name}`);
    // ...
  }
}

// 而非
class UserService extends Logger {  // 继承（不推荐）
  createUser(name) {
    this.log(`Creating user: ${name}`);
    // ...
  }
}
```

### 10.2 避免深层继承

```javascript
// ❌ 深层继承（难以维护）
class A {}
class B extends A {}
class C extends B {}
class D extends C {}
class E extends D {}

// ✅ 扁平化
class Base {
  // 共同功能
}

class Feature1 extends Base {}
class Feature2 extends Base {}
class Feature3 extends Base {}
```

### 10.3 TypeScript 中的继承

```typescript
// TypeScript 提供更好的类型支持
interface Eatable {
  eat(food: string): void;
}

interface Walkable {
  walk(): void;
}

class Animal {
  constructor(public name: string) {}
}

class Dog extends Animal implements Eatable, Walkable {
  eat(food: string): void {
    console.log(`${this.name} is eating ${food}`);
  }
  
  walk(): void {
    console.log(`${this.name} is walking`);
  }
}
```

---

## 关键要点

1. **继承模式演进**
   - 原型链继承 → 构造函数继承 → 组合继承
   - → 寄生组合继承 → ES6 Class

2. **推荐方案**
   - 现代项目：ES6 Class
   - ES5 项目：寄生组合继承
   - 简单场景：Object.create()

3. **核心问题**
   - 引用类型共享
   - 父类构造函数调用次数
   - 原型方法继承
   - instanceof 和原型链

4. **多重继承**
   - JavaScript 不支持
   - 使用 Mixin 模拟
   - 函数式 Mixin 更优雅

5. **最佳实践**
   - 优先组合而非继承
   - 避免深层继承
   - 使用 TypeScript 获得类型安全

---

## 深入一点

### ES6 Class 的内部实现

```javascript
// ES6 Class
class Child extends Parent {
  constructor(name, age) {
    super(name);
    this.age = age;
  }
}

// 大致等价于（简化版）
function Child(name, age) {
  // 调用父类构造函数
  Parent.call(this, name);
  this.age = age;
}

// 继承实例属性
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

// 继承静态属性（Class 特有）
Object.setPrototypeOf(Child, Parent);
```

### super 的实现原理

```javascript
class Parent {
  greet() {
    return "Hello";
  }
}

class Child extends Parent {
  greet() {
    return super.greet() + " World";
  }
}

// super.greet() 大致等价于
// Parent.prototype.greet.call(this)
```

---

## 参考资料

- [MDN: 继承与原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [MDN: Class](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)
- [JavaScript 高级程序设计：继承](https://www.ituring.com.cn/book/2472)

---

**上一章**：[原型与原型链](./content-13.md)  
**下一章**：[ES6 Class 深入](./content-15.md)
