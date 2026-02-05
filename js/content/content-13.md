# 原型与原型链

> 掌握 JavaScript 继承的核心机制

---

## 概述

原型（Prototype）是 JavaScript 实现继承的基础。理解原型链的工作原理，是掌握 JavaScript 对象模型的关键。

本章将深入：
- prototype 与 __proto__ 的区别
- 原型链的查找机制
- constructor 属性
- instanceof 的实现原理
- 原型链的终点

---

## 1. 原型的基本概念

### 1.1 什么是原型

**定义**：每个对象都有一个内部链接指向另一个对象，这个对象就是它的原型。

```javascript
const obj = {};

// obj 的原型是 Object.prototype
console.log(Object.getPrototypeOf(obj) === Object.prototype);  // true

// 原型也是对象，也有自己的原型
console.log(Object.getPrototypeOf(Object.prototype));  // null（原型链终点）
```

### 1.2 prototype 属性

**函数的 prototype 属性**：

```javascript
function Person(name) {
  this.name = name;
}

// 函数有 prototype 属性
console.log(typeof Person.prototype);  // "object"

// prototype 是一个对象
console.log(Person.prototype);
// {
//   constructor: [Function: Person],
//   __proto__: Object.prototype
// }

// 普通对象没有 prototype 属性
const obj = {};
console.log(obj.prototype);  // undefined
```

### 1.3 __proto__ 属性

**对象的 __proto__ 属性**：

```javascript
function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");

// __proto__ 指向构造函数的 prototype
console.log(alice.__proto__ === Person.prototype);  // true

// 推荐使用 Object.getPrototypeOf()
console.log(Object.getPrototypeOf(alice) === Person.prototype);  // true
```

**注意**：`__proto__` 是非标准属性（但广泛支持），推荐使用：
- `Object.getPrototypeOf(obj)` 获取原型
- `Object.setPrototypeOf(obj, proto)` 设置原型
- `Object.create(proto)` 创建指定原型的对象

---

## 2. 原型、构造函数、实例的关系

### 2.1 三者关系图

```
构造函数 Person
  │
  │ .prototype
  ↓
Person.prototype ←────┐
  │                   │ __proto__
  │ .constructor      │
  ↓                   │
构造函数 Person        │
                      │
实例 alice ───────────┘
```

### 2.2 关系验证

```javascript
function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");

// 1. 实例的 __proto__ 指向构造函数的 prototype
console.log(alice.__proto__ === Person.prototype);  // true
console.log(Object.getPrototypeOf(alice) === Person.prototype);  // true

// 2. prototype 的 constructor 指向构造函数
console.log(Person.prototype.constructor === Person);  // true

// 3. 实例可以通过 __proto__.constructor 访问构造函数
console.log(alice.constructor === Person);  // true
console.log(alice.__proto__.constructor === Person);  // true
```

### 2.3 完整示例

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log(`Hello, ${this.name}`);
};

const alice = new Person("Alice");
const bob = new Person("Bob");

// 共享原型方法
alice.greet();  // "Hello, Alice"
bob.greet();    // "Hello, Bob"

// 共享原型对象
console.log(alice.__proto__ === bob.__proto__);  // true
console.log(alice.__proto__ === Person.prototype);  // true

// 实例属性独立
alice.age = 25;
console.log(alice.age);  // 25
console.log(bob.age);    // undefined
```

---

## 3. 原型链

### 3.1 原型链的定义

**原型链**：对象通过 `__proto__` 连接起来的链条。

```javascript
function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");

// 原型链：
// alice → Person.prototype → Object.prototype → null

console.log(alice.__proto__);                    // Person.prototype
console.log(alice.__proto__.__proto__);          // Object.prototype
console.log(alice.__proto__.__proto__.__proto__); // null
```

### 3.2 属性查找机制

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.species = "Human";

const alice = new Person("Alice");
alice.age = 25;

// 查找 age：在实例上找到
console.log(alice.age);  // 25

// 查找 species：实例上没有，沿原型链找到 Person.prototype
console.log(alice.species);  // "Human"

// 查找 toString：沿原型链找到 Object.prototype
console.log(alice.toString);  // [Function: toString]

// 查找 notExist：沿原型链找不到
console.log(alice.notExist);  // undefined
```

**查找流程**：

```
1. 在实例 alice 上查找
   ↓ 没找到
2. 在 alice.__proto__（Person.prototype）上查找
   ↓ 没找到
3. 在 Person.prototype.__proto__（Object.prototype）上查找
   ↓ 没找到
4. 到达 null，返回 undefined
```

### 3.3 属性遮蔽（Shadowing）

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log("Hello from prototype");
};

const alice = new Person("Alice");

// 实例方法遮蔽原型方法
alice.greet = function() {
  console.log("Hello from instance");
};

alice.greet();  // "Hello from instance"（优先使用实例方法）

// 删除实例方法后，回退到原型方法
delete alice.greet;
alice.greet();  // "Hello from prototype"
```

### 3.4 原型链的性能

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.level1 = "L1";

function Employee(name, role) {
  Person.call(this, name);
  this.role = role;
}

Employee.prototype = Object.create(Person.prototype);
Employee.prototype.level2 = "L2";

const alice = new Employee("Alice", "Engineer");

// 查找层数越多，性能越差
console.log(alice.name);    // 查找 1 层（实例）
console.log(alice.level2);  // 查找 2 层（Employee.prototype）
console.log(alice.level1);  // 查找 3 层（Person.prototype）

// 优化：缓存常用属性
const level1 = alice.level1;  // 缓存到局部变量
```

---

## 4. constructor 属性

### 4.1 constructor 的作用

```javascript
function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");

// 通过 constructor 访问构造函数
console.log(alice.constructor === Person);  // true

// 通过 constructor 创建新实例
const bob = new alice.constructor("Bob");
console.log(bob instanceof Person);  // true
```

### 4.2 constructor 的易错点

**问题 1：重写 prototype 丢失 constructor**

```javascript
function Person(name) {
  this.name = name;
}

// ❌ 直接赋值新对象，丢失 constructor
Person.prototype = {
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

const alice = new Person("Alice");
console.log(alice.constructor === Person);  // false
console.log(alice.constructor === Object);  // true（指向 Object）

// ✅ 手动修复 constructor
Person.prototype = {
  constructor: Person,  // 修复
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

// 或使用 Object.defineProperty 设置为不可枚举
Person.prototype = {
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

Object.defineProperty(Person.prototype, "constructor", {
  value: Person,
  enumerable: false,  // 不可枚举
  writable: true,
  configurable: true
});
```

**问题 2：实例修改 constructor**

```javascript
function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");

// 修改实例的 constructor
alice.constructor = function() {};

// 不影响其他实例
const bob = new Person("Bob");
console.log(bob.constructor === Person);  // true

// 原型的 constructor 也没变
console.log(Person.prototype.constructor === Person);  // true
```

---

## 5. instanceof 操作符

### 5.1 基本用法

```javascript
function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");

console.log(alice instanceof Person);  // true
console.log(alice instanceof Object);  // true（继承自 Object）

// 数组
const arr = [];
console.log(arr instanceof Array);   // true
console.log(arr instanceof Object);  // true

// 函数
function foo() {}
console.log(foo instanceof Function);  // true
console.log(foo instanceof Object);    // true
```

### 5.2 instanceof 的原理

**手动实现 instanceof**：

```javascript
function myInstanceof(instance, Constructor) {
  // 获取实例的原型
  let proto = Object.getPrototypeOf(instance);
  
  // 获取构造函数的 prototype
  const prototype = Constructor.prototype;
  
  // 沿原型链查找
  while (proto !== null) {
    if (proto === prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  
  return false;
}

// 测试
function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");

console.log(myInstanceof(alice, Person));  // true
console.log(myInstanceof(alice, Object));  // true
console.log(myInstanceof(alice, Array));   // false
```

### 5.3 instanceof 的局限性

**问题 1：跨 iframe**

```javascript
// iframe 中的数组
const iframeArray = iframe.contentWindow.Array;
const arr = new iframeArray();

console.log(arr instanceof Array);  // false（不同的 Array 构造函数）
console.log(Array.isArray(arr));    // true（推荐）
```

**问题 2：修改 prototype**

```javascript
function Person() {}
const alice = new Person();

console.log(alice instanceof Person);  // true

// 修改构造函数的 prototype
Person.prototype = {};

console.log(alice instanceof Person);  // false（原型链断裂）
```

**问题 3：Object.create(null)**

```javascript
const obj = Object.create(null);

console.log(obj instanceof Object);  // false（无原型链）
```

---

## 6. 原型链的操作

### 6.1 获取原型

```javascript
const obj = {};

// 方式 1：Object.getPrototypeOf()（推荐）
console.log(Object.getPrototypeOf(obj) === Object.prototype);  // true

// 方式 2：__proto__（不推荐）
console.log(obj.__proto__ === Object.prototype);  // true

// 方式 3：constructor.prototype（不可靠）
console.log(obj.constructor.prototype === Object.prototype);  // true
```

### 6.2 设置原型

```javascript
const proto = {
  greet() {
    console.log("Hello");
  }
};

// 方式 1：Object.create()（创建时指定，推荐）
const obj1 = Object.create(proto);
obj1.greet();  // "Hello"

// 方式 2：Object.setPrototypeOf()（运行时修改，性能差）
const obj2 = {};
Object.setPrototypeOf(obj2, proto);
obj2.greet();  // "Hello"

// 方式 3：__proto__（不推荐）
const obj3 = {};
obj3.__proto__ = proto;
obj3.greet();  // "Hello"
```

**性能警告**：

```javascript
// ❌ 性能差：运行时修改原型
const obj = {};
Object.setPrototypeOf(obj, proto);  // 触发去优化

// ✅ 性能好：创建时指定原型
const obj = Object.create(proto);
```

### 6.3 检查原型关系

```javascript
function Person() {}
const alice = new Person();

// 方式 1：instanceof
console.log(alice instanceof Person);  // true

// 方式 2：isPrototypeOf()
console.log(Person.prototype.isPrototypeOf(alice));  // true
console.log(Object.prototype.isPrototypeOf(alice));  // true

// 方式 3：Object.getPrototypeOf()
console.log(Object.getPrototypeOf(alice) === Person.prototype);  // true
```

---

## 7. 原型链的常见模式

### 7.1 原型方法共享

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// 所有实例共享方法
Person.prototype.greet = function() {
  console.log(`Hello, ${this.name}`);
};

Person.prototype.getInfo = function() {
  return `${this.name}, ${this.age}`;
};

const alice = new Person("Alice", 25);
const bob = new Person("Bob", 30);

// 方法共享（节省内存）
console.log(alice.greet === bob.greet);  // true
```

### 7.2 原型数据共享（陷阱）

```javascript
function Person(name) {
  this.name = name;
}

// ❌ 引用类型数据在原型上（所有实例共享）
Person.prototype.hobbies = [];

const alice = new Person("Alice");
const bob = new Person("Bob");

alice.hobbies.push("reading");
console.log(bob.hobbies);  // ["reading"]（被污染）

// ✅ 引用类型数据应在实例上
function Person(name) {
  this.name = name;
  this.hobbies = [];  // 每个实例独立
}
```

### 7.3 原型链继承

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

function Dog(name, breed) {
  Animal.call(this, name);  // 继承属性
  this.breed = breed;
}

// 继承方法
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log(`${this.name} is barking`);
};

const dog = new Dog("Buddy", "Golden Retriever");
dog.eat();   // "Buddy is eating"（继承自 Animal）
dog.bark();  // "Buddy is barking"（自身方法）
```

---

## 8. 原型污染

### 8.1 原型污染的风险

```javascript
// ❌ 危险操作：修改 Object.prototype
Object.prototype.customMethod = function() {
  console.log("Custom method");
};

// 影响所有对象
const obj = {};
obj.customMethod();  // "Custom method"

const arr = [];
arr.customMethod();  // "Custom method"

// 出现在 for...in 中
for (let key in obj) {
  console.log(key);  // "customMethod"
}
```

### 8.2 防止原型污染

```javascript
// 1. 使用 Object.create(null) 创建纯净对象
const pureObj = Object.create(null);
pureObj.toString = undefined;  // 不会污染原型

// 2. 使用 Object.defineProperty 设置不可枚举
Object.defineProperty(Object.prototype, "customMethod", {
  value: function() { /*...*/ },
  enumerable: false  // 不可枚举
});

// 3. 检查属性来源
for (let key in obj) {
  if (obj.hasOwnProperty(key)) {
    console.log(key);  // 只处理自身属性
  }
}

// 4. 使用 Object.keys()（只返回自身可枚举属性）
Object.keys(obj).forEach(key => {
  console.log(key);
});
```

### 8.3 实际安全问题

```javascript
// 原型污染攻击示例
function merge(target, source) {
  for (let key in source) {
    if (typeof source[key] === 'object') {
      target[key] = merge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 恶意输入
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
const user = {};

merge(user, malicious);

// 原型被污染
console.log({}.isAdmin);  // true（危险！）

// ✅ 安全的合并
function safeMerge(target, source) {
  for (let key in source) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;  // 跳过危险属性
    }
    if (typeof source[key] === 'object') {
      target[key] = safeMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
```

---

## 9. 原型链的调试

### 9.1 查看原型链

```javascript
function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");

// 方式 1：console.dir()
console.dir(alice);

// 方式 2：递归打印
function printPrototypeChain(obj) {
  const chain = [];
  let current = obj;
  
  while (current !== null) {
    chain.push(current);
    current = Object.getPrototypeOf(current);
  }
  
  chain.forEach((item, index) => {
    console.log(`Level ${index}:`, item);
  });
}

printPrototypeChain(alice);
// Level 0: Person { name: 'Alice' }
// Level 1: Person {}
// Level 2: {}
// Level 3: null
```

### 9.2 检查属性来源

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.species = "Human";

const alice = new Person("Alice");

// 检查属性是否在实例上
console.log(alice.hasOwnProperty("name"));     // true
console.log(alice.hasOwnProperty("species"));  // false

// 检查属性是否在原型链上
console.log("name" in alice);     // true
console.log("species" in alice);  // true

// 区分实例属性和原型属性
function isOwnProperty(obj, prop) {
  return obj.hasOwnProperty(prop);
}

function isPrototypeProperty(obj, prop) {
  return !obj.hasOwnProperty(prop) && (prop in obj);
}

console.log(isOwnProperty(alice, "name"));       // true
console.log(isPrototypeProperty(alice, "species")); // true
```

---

## 10. 工程实践

### 10.1 原型方法的命名空间

```javascript
// ✅ 使用命名空间避免冲突
Function.prototype.myLibrary = {
  method1() { /*...*/ },
  method2() { /*...*/ }
};

// 使用
function foo() {}
foo.myLibrary.method1();
```

### 10.2 原型链的优化

```javascript
// ❌ 深度嵌套原型链（性能差）
function A() {}
function B() {}
B.prototype = new A();
function C() {}
C.prototype = new B();
function D() {}
D.prototype = new C();

// ✅ 扁平化原型链
function Base() {}
Base.prototype.commonMethod = function() {};

function Derived1() {}
Derived1.prototype = Object.create(Base.prototype);

function Derived2() {}
Derived2.prototype = Object.create(Base.prototype);
```

### 10.3 Mixin 模式

```javascript
// 通过混入扩展对象
const canEat = {
  eat(food) {
    console.log(`${this.name} is eating ${food}`);
  }
};

const canWalk = {
  walk() {
    console.log(`${this.name} is walking`);
  }
};

function Person(name) {
  this.name = name;
}

// 混入多个能力
Object.assign(Person.prototype, canEat, canWalk);

const alice = new Person("Alice");
alice.eat("pizza");  // "Alice is eating pizza"
alice.walk();        // "Alice is walking"
```

---

## 关键要点

1. **原型的两个属性**
   - `prototype`：函数的属性，指向原型对象
   - `__proto__`：对象的属性，指向其原型

2. **原型链**
   - 对象通过 `__proto__` 连接成链
   - 属性查找沿原型链向上
   - 终点是 `null`

3. **三者关系**
   - 实例的 `__proto__` → 构造函数的 `prototype`
   - `prototype` 的 `constructor` → 构造函数
   - 实例可通过 `constructor` 访问构造函数

4. **instanceof**
   - 检查构造函数的 `prototype` 是否在实例的原型链上
   - 可以手动实现
   - 有局限性（跨 iframe、修改 prototype）

5. **最佳实践**
   - 方法放在原型上（共享）
   - 数据放在实例上（独立）
   - 不要修改内置对象的原型
   - 注意原型污染风险

---

## 深入一点

### 原型链的内存布局

```
内存中的对象关系：

实例 alice
  ├─ 自身属性：name, age
  └─ [[Prototype]] → Person.prototype
                      ├─ 原型方法：greet, getInfo
                      └─ [[Prototype]] → Object.prototype
                                          ├─ toString, valueOf, ...
                                          └─ [[Prototype]] → null
```

### Function 和 Object 的特殊关系

```javascript
// Function 是函数，也是对象
console.log(Function instanceof Object);  // true
console.log(Object instanceof Function);  // true

// Function.prototype 是函数
console.log(typeof Function.prototype);  // "function"

// Function.__proto__ === Function.prototype
console.log(Function.__proto__ === Function.prototype);  // true

// Object.__proto__ === Function.prototype
console.log(Object.__proto__ === Function.prototype);  // true
```

---

## 参考资料

- [MDN: 继承与原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [MDN: Object.prototype](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/prototype)
- [You Don't Know JS: this & Object Prototypes](https://github.com/getify/You-Dont-Know-JS/tree/1st-ed/this%20%26%20object%20prototypes)

---

**上一章**：[对象模型深入](./content-12.md)  
**下一章**：[继承模式](./content-14.md)
