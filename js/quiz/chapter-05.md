# 第 5 章：对象与原型 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 原型基础

### 题目

每个 JavaScript 对象都有一个内部属性 `[[Prototype]]`，通常可以通过哪个属性访问？

**选项：**
- A. `prototype`
- B. `__proto__`
- C. `constructor`
- D. `super`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**`__proto__` vs `prototype`**

**`__proto__`（实例属性）：**
```javascript
const obj = {};
console.log(obj.__proto__ === Object.prototype);  // true

const arr = [];
console.log(arr.__proto__ === Array.prototype);   // true
```

**`prototype`（函数属性）：**
```javascript
function Person(name) {
  this.name = name;
}

console.log(Person.prototype);  // { constructor: Person }

const p = new Person('Alice');
console.log(p.__proto__ === Person.prototype);  // true
```

---

**关键区别**

| 属性 | 存在于 | 作用 |
|------|--------|------|
| `__proto__` | 所有对象 | 指向对象的原型 |
| `prototype` | 函数对象 | 构造函数的原型对象 |

**关系图：**
```
Person.prototype ← p.__proto__
     ↓
Person.prototype.__proto__ === Object.prototype
     ↓
Object.prototype.__proto__ === null
```

---

**标准访问方式**

```javascript
// ✅ 推荐：使用 Object.getPrototypeOf()
const proto = Object.getPrototypeOf(obj);

// ✅ 推荐：使用 Object.setPrototypeOf()
Object.setPrototypeOf(obj, newProto);

// ⚠️ 不推荐：直接访问 __proto__（性能差）
obj.__proto__ = newProto;

// ✅ 创建时指定原型
const obj = Object.create(proto);
```

**示例：**
```javascript
const animal = {
  eat() {
    console.log('eating');
  }
};

const dog = Object.create(animal);
dog.bark = function() {
  console.log('woof');
};

console.log(Object.getPrototypeOf(dog) === animal);  // true
dog.eat();   // "eating"（继承自 animal）
dog.bark();  // "woof"（自身方法）
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** Class 语法

### 题目

ES6 的 Class 语法本质上是什么？

**选项：**
- A. 一种新的面向对象机制
- B. 原型继承的语法糖
- C. 基于类的继承
- D. 完全不同的实现方式

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Class 是原型继承的语法糖**

**Class 语法：**
```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  
  sayHi() {
    console.log(`Hi, I'm ${this.name}`);
  }
}

const p = new Person('Alice');
```

**等价的原型写法：**
```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const p = new Person('Alice');
```

---

**验证本质**

```javascript
class MyClass {}

// Class 本质上是函数
console.log(typeof MyClass);  // "function"

// 方法定义在原型上
class Person {
  sayHi() {}
}
console.log(Person.prototype.sayHi);  // [Function: sayHi]

// 继承仍是原型链
class Student extends Person {}
const s = new Student();
console.log(s.__proto__.__proto__ === Person.prototype);  // true
```

---

**Class 的特殊性**

**1. 必须使用 new 调用**
```javascript
class MyClass {}

MyClass();  // TypeError: Class constructor cannot be invoked without 'new'

// 普通函数可以不用 new
function MyFunc() {}
MyFunc();  // 正常执行
```

**2. 方法不可枚举**
```javascript
class Person {
  sayHi() {}
}

// Class 方法默认不可枚举
console.log(Object.keys(Person.prototype));  // []

// 原型方法默认可枚举
function Animal() {}
Animal.prototype.eat = function() {};
console.log(Object.keys(Animal.prototype));  // ["eat"]
```

**3. 严格模式**
```javascript
class MyClass {
  method() {
    // 自动在严格模式下
    console.log(this);  // undefined（非方法调用）
  }
}
```

**4. 类声明不提升**
```javascript
const p = new Person();  // ReferenceError
class Person {}

// 函数声明会提升
const f = new Func();  // 正常
function Func() {}
```

---

**Class 的优势**

```javascript
// ✅ 更清晰的继承
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  speak() {
    console.log(`${this.name} barks`);
  }
}

// ✅ 静态方法
class MathUtils {
  static add(a, b) {
    return a + b;
  }
}
MathUtils.add(1, 2);  // 3

// ✅ Getter/Setter
class Circle {
  constructor(radius) {
    this._radius = radius;
  }
  get area() {
    return Math.PI * this._radius ** 2;
  }
  set radius(value) {
    if (value < 0) throw new Error('Invalid radius');
    this._radius = value;
  }
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 对象创建

### 题目

使用 `Object.create(null)` 创建的对象没有原型。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**`Object.create(null)` 创建纯净对象**

```javascript
// 普通对象
const obj1 = {};
console.log(obj1.__proto__);  // Object.prototype
console.log(obj1.toString);   // [Function: toString]

// 无原型对象
const obj2 = Object.create(null);
console.log(obj2.__proto__);  // undefined
console.log(obj2.toString);   // undefined
```

---

**使用场景**

**1. 作为 Map 的替代（避免原型污染）**
```javascript
// ❌ 普通对象可能被原型污染
const map1 = {};
map1['toString'] = 'value';
console.log(map1.toString);  // "value"（覆盖了原型方法）

// ✅ 纯净对象
const map2 = Object.create(null);
map2['toString'] = 'value';
console.log(map2.toString);  // "value"（没有原型方法冲突）
```

**2. 字典对象**
```javascript
function createDict() {
  return Object.create(null);
}

const dict = createDict();
dict.hasOwnProperty = 'some value';  // 不会冲突
```

**3. 避免意外属性**
```javascript
const obj = Object.create(null);

// 没有继承的属性
console.log('constructor' in obj);     // false
console.log('hasOwnProperty' in obj);  // false
console.log('toString' in obj);        // false
```

---

**对比其他创建方式**

```javascript
// 1. 字面量（有原型）
const obj1 = {};
console.log(Object.getPrototypeOf(obj1));  // Object.prototype

// 2. Object.create(null)（无原型）
const obj2 = Object.create(null);
console.log(Object.getPrototypeOf(obj2));  // null

// 3. Object.create(proto)（指定原型）
const proto = { x: 1 };
const obj3 = Object.create(proto);
console.log(Object.getPrototypeOf(obj3));  // proto

// 4. new Object()（有原型）
const obj4 = new Object();
console.log(Object.getPrototypeOf(obj4));  // Object.prototype
```

---

**添加方法到无原型对象**

```javascript
const obj = Object.create(null);

// 手动添加需要的方法
obj.toString = Object.prototype.toString;
obj.hasOwnProperty = Object.prototype.hasOwnProperty;

// 或者使用 call
Object.prototype.hasOwnProperty.call(obj, 'key');
```

**最佳实践：**
- ✅ 用作字典/Map 时使用 `Object.create(null)`
- ✅ 需要原型方法时使用普通对象 `{}`
- ✅ 现代代码优先使用 `Map`/`Set`

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 原型链

### 题目

以下代码的输出是什么？

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function() {
  console.log(`Hi, ${this.name}`);
};

const p1 = new Person('Alice');
const p2 = new Person('Bob');

console.log(p1.sayHi === p2.sayHi);
console.log(p1.__proto__ === p2.__proto__);
```

**选项：**
- A. `true`, `true`
- B. `false`, `true`
- C. `true`, `false`
- D. `false`, `false`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**原型上的方法是共享的**

```javascript
// 所有实例共享原型上的方法
console.log(p1.sayHi === p2.sayHi);  // true
// 因为 p1.sayHi 和 p2.sayHi 都指向 Person.prototype.sayHi

// 所有实例的 __proto__ 都指向构造函数的 prototype
console.log(p1.__proto__ === p2.__proto__);  // true
// 都指向 Person.prototype
```

---

**原型链查找过程**

```javascript
p1.sayHi();

// 查找过程：
// 1. 查找 p1 自身 → 没有 sayHi
// 2. 查找 p1.__proto__（Person.prototype） → 找到 sayHi
// 3. 执行 Person.prototype.sayHi.call(p1)
```

**验证：**
```javascript
// 实例属性 vs 原型属性
function Person(name) {
  this.name = name;  // 实例属性
}
Person.prototype.age = 25;  // 原型属性

const p1 = new Person('Alice');
const p2 = new Person('Bob');

// 实例属性不共享
console.log(p1.name === p2.name);  // false

// 原型属性共享
console.log(p1.age === p2.age);  // true（都是 25）

// 修改原型属性影响所有实例
Person.prototype.age = 30;
console.log(p1.age);  // 30
console.log(p2.age);  // 30

// 给实例添加同名属性，会屏蔽原型属性
p1.age = 20;
console.log(p1.age);  // 20（实例属性）
console.log(p2.age);  // 30（原型属性）
```

---

**内存优化**

```javascript
// ❌ 不好：每个实例都有自己的方法（浪费内存）
function Person(name) {
  this.name = name;
  this.sayHi = function() {
    console.log(`Hi, ${this.name}`);
  };
}

const p1 = new Person('Alice');
const p2 = new Person('Bob');
console.log(p1.sayHi === p2.sayHi);  // false（两个不同的函数）

// ✅ 好：方法定义在原型上（共享，节省内存）
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  console.log(`Hi, ${this.name}`);
};

const p1 = new Person('Alice');
const p2 = new Person('Bob');
console.log(p1.sayHi === p2.sayHi);  // true（共享同一个函数）
```

---

**完整的原型链**

```javascript
function Person(name) {
  this.name = name;
}

const p = new Person('Alice');

// 原型链：
p.__proto__ === Person.prototype  // true
Person.prototype.__proto__ === Object.prototype  // true
Object.prototype.__proto__ === null  // true

// 图示：
// p → Person.prototype → Object.prototype → null
```

**hasOwnProperty 检查：**
```javascript
console.log(p.hasOwnProperty('name'));    // true（实例属性）
console.log(p.hasOwnProperty('sayHi'));   // false（原型属性）

// 检查属性是否在原型链上
console.log('sayHi' in p);  // true
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** new 操作符

### 题目

以下代码的输出是什么？

```javascript
function Person(name) {
  this.name = name;
  return { age: 25 };
}

const p = new Person('Alice');
console.log(p.name);
console.log(p.age);
```

**选项：**
- A. `"Alice"`, `undefined`
- B. `undefined`, `25`
- C. `"Alice"`, `25`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**new 操作符的执行过程**

```javascript
function Person(name) {
  this.name = name;
  return { age: 25 };  // 显式返回对象
}

const p = new Person('Alice');
// p = { age: 25 }（返回的对象）
// 而不是 this（包含 name 的对象）

console.log(p.name);  // undefined
console.log(p.age);   // 25
```

---

**new 的内部步骤**

```javascript
function myNew(Constructor, ...args) {
  // 1. 创建新对象
  const obj = {};
  
  // 2. 设置原型
  Object.setPrototypeOf(obj, Constructor.prototype);
  
  // 3. 执行构造函数，绑定 this
  const result = Constructor.apply(obj, args);
  
  // 4. 返回对象
  // 如果构造函数返回对象，使用该对象
  // 否则返回新创建的对象
  return result instanceof Object ? result : obj;
}

// 使用
function Person(name) {
  this.name = name;
  return { age: 25 };
}

const p = myNew(Person, 'Alice');
console.log(p);  // { age: 25 }
```

---

**返回值规则**

**1. 返回对象：使用返回的对象**
```javascript
function Test() {
  this.x = 1;
  return { y: 2 };  // 返回对象
}

const t = new Test();
console.log(t);  // { y: 2 }
console.log(t.x);  // undefined
```

**2. 返回基本类型：忽略，返回 this**
```javascript
function Test() {
  this.x = 1;
  return 'string';  // 返回基本类型
}

const t = new Test();
console.log(t);  // Test { x: 1 }
console.log(t.x);  // 1
```

**3. 不返回：默认返回 this**
```javascript
function Test() {
  this.x = 1;
  // 没有 return
}

const t = new Test();
console.log(t);  // Test { x: 1 }
```

---

**实际应用**

**工厂模式：**
```javascript
function createUser(name, role) {
  // 根据角色返回不同对象
  if (role === 'admin') {
    return {
      name,
      role,
      permissions: ['read', 'write', 'delete']
    };
  }
  return {
    name,
    role,
    permissions: ['read']
  };
}

// 注意：这不适合用 new
const user = createUser('Alice', 'admin');
```

**单例模式：**
```javascript
function Singleton() {
  if (Singleton.instance) {
    return Singleton.instance;  // 返回已存在的实例
  }
  this.value = Math.random();
  Singleton.instance = this;
}

const s1 = new Singleton();
const s2 = new Singleton();
console.log(s1 === s2);  // true
```

---

**最佳实践**

```javascript
// ✅ 构造函数不应该显式返回对象
function Person(name) {
  this.name = name;
  // 不要 return 对象
}

// ✅ 工厂函数不需要 new
function createPerson(name) {
  return {
    name,
    sayHi() {
      console.log(`Hi, ${this.name}`);
    }
  };
}

// ✅ Class 的构造器
class Person {
  constructor(name) {
    this.name = name;
    // return 会报错或被忽略
  }
}
```

</details>

---

## 第 6 题 🟡

**类型：** 多选题  
**标签：** 对象方法

### 题目

以下哪些方法可以用来检查对象是否拥有某个属性？

**选项：**
- A. `hasOwnProperty()`
- B. `in` 操作符
- C. `Object.hasOwn()`
- D. `Object.keys()`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**检查属性存在的多种方法**

**A. hasOwnProperty()（自身属性）**
```javascript
const obj = { a: 1 };
Object.prototype.b = 2;

console.log(obj.hasOwnProperty('a'));  // true
console.log(obj.hasOwnProperty('b'));  // false（原型属性）
console.log(obj.hasOwnProperty('c'));  // false

// 安全调用（对象可能重写了 hasOwnProperty）
Object.prototype.hasOwnProperty.call(obj, 'a');  // true
```

**B. in 操作符（自身 + 原型）**
```javascript
const obj = { a: 1 };
Object.prototype.b = 2;

console.log('a' in obj);  // true
console.log('b' in obj);  // true（原型属性也返回 true）
console.log('c' in obj);  // false
```

**C. Object.hasOwn()（ES2022，推荐）**
```javascript
const obj = { a: 1 };
Object.prototype.b = 2;

console.log(Object.hasOwn(obj, 'a'));  // true
console.log(Object.hasOwn(obj, 'b'));  // false（原型属性）
console.log(Object.hasOwn(obj, 'c'));  // false

// 优势：更安全，即使对象没有原型也能工作
const nullObj = Object.create(null);
nullObj.a = 1;
// nullObj.hasOwnProperty('a');  // TypeError
Object.hasOwn(nullObj, 'a');  // true
```

**D. Object.keys()（可枚举的自身属性）**
```javascript
const obj = { a: 1, b: 2 };
Object.defineProperty(obj, 'c', {
  value: 3,
  enumerable: false
});

console.log(Object.keys(obj));  // ['a', 'b']（不包含 c）
console.log(Object.keys(obj).includes('a'));  // true
console.log(Object.keys(obj).includes('c'));  // false
```

---

**对比总结**

| 方法 | 自身属性 | 原型属性 | 不可枚举 | 安全性 |
|------|---------|---------|----------|--------|
| `hasOwnProperty()` | ✅ | ❌ | ✅ | ⚠️ 可能被重写 |
| `in` | ✅ | ✅ | ✅ | ✅ |
| `Object.hasOwn()` | ✅ | ❌ | ✅ | ✅ 最安全 |
| `Object.keys()` | ✅ | ❌ | ❌ | ✅ |

---

**更多属性检查方法**

**Object.getOwnPropertyNames()（包含不可枚举）**
```javascript
const obj = { a: 1 };
Object.defineProperty(obj, 'b', {
  value: 2,
  enumerable: false
});

console.log(Object.keys(obj));                    // ['a']
console.log(Object.getOwnPropertyNames(obj));     // ['a', 'b']
```

**Object.getOwnPropertyDescriptor()**
```javascript
const obj = { a: 1 };

const desc = Object.getOwnPropertyDescriptor(obj, 'a');
console.log(desc);
// {
//   value: 1,
//   writable: true,
//   enumerable: true,
//   configurable: true
// }

console.log(Object.getOwnPropertyDescriptor(obj, 'b'));  // undefined
```

**Reflect.has()（类似 in）**
```javascript
const obj = { a: 1 };
Object.prototype.b = 2;

console.log(Reflect.has(obj, 'a'));  // true
console.log(Reflect.has(obj, 'b'));  // true
console.log(Reflect.has(obj, 'c'));  // false
```

---

**实际应用**

**1. 安全地检查属性**
```javascript
function hasProperty(obj, prop) {
  return Object.hasOwn(obj, prop);  // ES2022+
  // 或
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
```

**2. 遍历自身可枚举属性**
```javascript
const obj = { a: 1, b: 2 };
Object.prototype.c = 3;

// ✅ 使用 for...in + hasOwnProperty
for (let key in obj) {
  if (Object.hasOwn(obj, key)) {
    console.log(key, obj[key]);
  }
}

// ✅ 或直接使用 Object.keys()
Object.keys(obj).forEach(key => {
  console.log(key, obj[key]);
});
```

**3. 检查对象是否为空**
```javascript
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

console.log(isEmpty({}));        // true
console.log(isEmpty({ a: 1 }));  // false
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 继承

### 题目

以下代码的输出是什么？

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  speak() {
    super.speak();
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog('Buddy');
dog.speak();
```

**选项：**
- A. `"Buddy barks"`
- B. `"Buddy makes a sound"`, `"Buddy barks"`
- C. `"Buddy makes a sound"`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**super 关键字的使用**

```javascript
class Dog extends Animal {
  speak() {
    super.speak();  // 调用父类的 speak 方法
    console.log(`${this.name} barks`);
  }
}

dog.speak();
// 输出：
// "Buddy makes a sound"（父类方法）
// "Buddy barks"（子类方法）
```

---

**super 的两种用法**

**1. super() 调用父类构造器**
```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // 必须先调用 super()
    this.breed = breed;
  }
}

const dog = new Dog('Buddy', 'Golden Retriever');
console.log(dog.name);   // "Buddy"
console.log(dog.breed);  // "Golden Retriever"
```

**2. super.method() 调用父类方法**
```javascript
class Animal {
  eat() {
    console.log('eating');
  }
}

class Dog extends Animal {
  eat() {
    super.eat();  // 调用父类的 eat
    console.log('bone');
  }
}

const dog = new Dog();
dog.eat();
// eating
// bone
```

---

**super 的注意事项**

**1. 必须在使用 this 之前调用 super()**
```javascript
class Dog extends Animal {
  constructor(name) {
    this.name = name;  // ❌ ReferenceError
    super(name);
  }
}

// ✅ 正确
class Dog extends Animal {
  constructor(name) {
    super(name);
    this.breed = 'Unknown';
  }
}
```

**2. super 只能在 class 中使用**
```javascript
// ❌ 错误
function Dog() {
  super();  // SyntaxError
}
```

**3. 静态方法中的 super**
```javascript
class Animal {
  static create() {
    return new this();
  }
}

class Dog extends Animal {
  static create() {
    const dog = super.create();
    dog.breed = 'Unknown';
    return dog;
  }
}

const dog = Dog.create();
```

---

**方法覆盖与 super**

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  describe() {
    return `I am ${this.name}`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  
  // 完全覆盖
  describe() {
    return `I am ${this.name}, a ${this.breed}`;
  }
  
  // 扩展父类方法
  fullDescription() {
    return super.describe() + `, breed: ${this.breed}`;
  }
}

const dog = new Dog('Buddy', 'Golden Retriever');
console.log(dog.describe());         // "I am Buddy, a Golden Retriever"
console.log(dog.fullDescription());  // "I am Buddy, breed: Golden Retriever"
```

---

**原型链视角**

```javascript
class Animal {
  speak() {
    console.log('animal sound');
  }
}

class Dog extends Animal {
  speak() {
    super.speak();  // 等价于 Animal.prototype.speak.call(this)
    console.log('bark');
  }
}

// 原型链
const dog = new Dog();
dog.__proto__ === Dog.prototype  // true
Dog.prototype.__proto__ === Animal.prototype  // true
```

**等价的 ES5 实现：**
```javascript
function Animal() {}
Animal.prototype.speak = function() {
  console.log('animal sound');
};

function Dog() {}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.speak = function() {
  Animal.prototype.speak.call(this);  // 相当于 super.speak()
  console.log('bark');
};
```

</details>

---

## 第 8 题 🔴

**类型：** 代码分析题  
**标签：** 原型污染

### 题目

以下代码存在什么安全问题？

```javascript
function merge(target, source) {
  for (let key in source) {
    target[key] = source[key];
  }
  return target;
}

const obj = {};
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
merge(obj, malicious);

const user = {};
console.log(user.isAdmin);
```

**选项：**
- A. 没有问题
- B. 原型污染
- C. 内存泄漏
- D. 类型错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**原型污染（Prototype Pollution）**

```javascript
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
merge(obj, malicious);

// 污染了 Object.prototype
console.log(Object.prototype.isAdmin);  // true

// 所有对象都受影响
const user = {};
console.log(user.isAdmin);  // true（继承自 Object.prototype）
```

---

**原型污染的危害**

**1. 权限绕过**
```javascript
// 攻击者注入
merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));

// 系统检查权限
function checkAdmin(user) {
  return user.isAdmin === true;  // 绕过！
}

const normalUser = { name: 'Alice' };
console.log(checkAdmin(normalUser));  // true（危险！）
```

**2. 拒绝服务（DoS）**
```javascript
merge({}, JSON.parse('{"__proto__": {"toString": null}}'));

const obj = {};
obj.toString();  // TypeError: obj.toString is not a function
```

**3. 远程代码执行（RCE）**
```javascript
// 在某些环境中可能导致代码执行
merge({}, {
  __proto__: {
    polluted: true
  }
});
```

---

**防护措施**

**1. 使用 Object.create(null)**
```javascript
function safeMerge(target, source) {
  const safeTarget = Object.create(null);
  for (let key in source) {
    safeTarget[key] = source[key];
  }
  return safeTarget;
}
```

**2. 检查键名**
```javascript
function safeMerge(target, source) {
  for (let key in source) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;  // 跳过危险键
    }
    target[key] = source[key];
  }
  return target;
}
```

**3. 使用 hasOwnProperty**
```javascript
function safeMerge(target, source) {
  for (let key in source) {
    if (Object.hasOwn(source, key)) {
      target[key] = source[key];
    }
  }
  return target;
}
```

**4. 使用 Object.assign()（内置保护）**
```javascript
const obj = {};
Object.assign(obj, JSON.parse('{"__proto__": {"isAdmin": true}}'));

// Object.assign 不会污染原型
console.log(obj.__proto__);  // Object.prototype（未被修改）
```

**5. 冻结原型**
```javascript
Object.freeze(Object.prototype);

// 尝试污染
const obj = {};
obj.__proto__.isAdmin = true;

console.log(Object.prototype.isAdmin);  // undefined（失败）
```

---

**检测原型污染**

```javascript
function detectPrototypePollution() {
  const testKey = '__protoPollutionTest__' + Date.now();
  
  // 创建测试对象
  const obj1 = {};
  const obj2 = {};
  
  // 尝试通过 obj1 污染原型
  try {
    obj1.__proto__[testKey] = true;
  } catch(e) {}
  
  // 检查 obj2 是否被影响
  if (obj2[testKey] === true) {
    console.warn('检测到原型污染！');
    delete Object.prototype[testKey];
    return true;
  }
  
  return false;
}
```

---

**实际案例**

**lodash < 4.17.11 原型污染漏洞：**
```javascript
// 漏洞代码示例（已修复）
const _ = require('lodash');

const payload = JSON.parse('{"__proto__": {"polluted": true}}');
_.merge({}, payload);

console.log({}.polluted);  // true
```

**修复方法：**
```javascript
// lodash 现在会检查这些键
function merge(object, source) {
  for (let key in source) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    // ...
  }
}
```

---

**最佳实践**

```javascript
// ✅ 安全的对象合并
function secureMerge(target, source) {
  if (!target || typeof target !== 'object') {
    throw new TypeError('Target must be an object');
  }
  
  if (!source || typeof source !== 'object') {
    return target;
  }
  
  for (const key of Object.keys(source)) {
    // 只处理自身可枚举属性
    if (Object.hasOwn(source, key)) {
      const value = source[key];
      
      // 递归处理嵌套对象
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        target[key] = target[key] || {};
        secureMerge(target[key], value);
      } else {
        target[key] = value;
      }
    }
  }
  
  return target;
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码输出题  
**标签：** instanceof

### 题目

以下代码的输出是什么？

```javascript
function Foo() {}
const f = new Foo();

console.log(f instanceof Foo);
console.log(f instanceof Object);

Foo.prototype = {};
const f2 = new Foo();

console.log(f instanceof Foo);
console.log(f2 instanceof Foo);
```

**选项：**
- A. `true`, `true`, `true`, `true`
- B. `true`, `true`, `false`, `true`
- C. `true`, `true`, `false`, `false`
- D. `false`, `true`, `false`, `true`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**instanceof 的工作原理**

```javascript
// instanceof 检查原型链
f instanceof Foo
// 等价于检查：Foo.prototype 是否在 f 的原型链上

function myInstanceof(obj, Constructor) {
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    if (proto === Constructor.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
```

**逐步分析：**

```javascript
function Foo() {}
const f = new Foo();

// 1. f instanceof Foo
console.log(f instanceof Foo);  // true
// f.__proto__ === Foo.prototype ✓

// 2. f instanceof Object
console.log(f instanceof Object);  // true
// f.__proto__.__proto__ === Object.prototype ✓

// 修改 Foo.prototype
Foo.prototype = {};  // 新对象
const f2 = new Foo();

// 3. f instanceof Foo
console.log(f instanceof Foo);  // false
// f.__proto__ 仍是旧的 Foo.prototype
// 但现在 Foo.prototype 是新对象
// f.__proto__ !== Foo.prototype ✗

// 4. f2 instanceof Foo
console.log(f2 instanceof Foo);  // true
// f2.__proto__ === 新的 Foo.prototype ✓
```

---

**原型链示意**

**初始状态：**
```
f.__proto__ → 旧 Foo.prototype → Object.prototype → null
Foo.prototype → 旧 Foo.prototype
```

**修改后：**
```
f.__proto__ → 旧 Foo.prototype → Object.prototype → null
Foo.prototype → 新 Foo.prototype
f2.__proto__ → 新 Foo.prototype → Object.prototype → null
```

---

**instanceof 的陷阱**

**1. 跨 iframe**
```javascript
// iframe 中的数组
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const iframeArray = iframe.contentWindow.Array;

const arr = new iframeArray();
console.log(arr instanceof Array);  // false
console.log(Array.isArray(arr));    // true（推荐）
```

**2. 修改 prototype**
```javascript
function Foo() {}
const f = new Foo();

console.log(f instanceof Foo);  // true

// 断开原型链
Object.setPrototypeOf(f, null);
console.log(f instanceof Foo);  // false
```

**3. Symbol.hasInstance**
```javascript
class MyClass {
  static [Symbol.hasInstance](obj) {
    return obj.custom === true;
  }
}

console.log({ custom: true } instanceof MyClass);   // true
console.log({ custom: false } instanceof MyClass);  // false
```

---

**类型检查的最佳实践**

```javascript
// ✅ 检查数组
Array.isArray(value)

// ✅ 检查基本类型
typeof value === 'string'
typeof value === 'number'

// ✅ 检查 null
value === null

// ✅ 检查对象类型
Object.prototype.toString.call(value) === '[object Object]'
Object.prototype.toString.call(value) === '[object Array]'

// ✅ 检查自定义类
value instanceof MyClass

// ✅ 检查原型链
MyClass.prototype.isPrototypeOf(value)
```

**完整的类型检查函数：**
```javascript
function getType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  const type = typeof value;
  if (type !== 'object') return type;
  
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

console.log(getType([]));           // "array"
console.log(getType({}));           // "object"
console.log(getType(new Date()));   // "date"
console.log(getType(/regex/));      // "regexp"
console.log(getType(null));         // "null"
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 对象属性描述符

### 题目

以下代码的输出是什么？

```javascript
const obj = {};

Object.defineProperty(obj, 'x', {
  value: 1,
  writable: false,
  enumerable: false,
  configurable: false
});

obj.x = 2;
console.log(obj.x);

delete obj.x;
console.log(obj.x);

for (let key in obj) {
  console.log(key);
}

console.log(Object.keys(obj));
```

**选项：**
- A. `2`, `undefined`, 不输出, `[]`
- B. `1`, `1`, 不输出, `[]`
- C. `1`, `undefined`, `"x"`, `["x"]`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**属性描述符（Property Descriptor）**

```javascript
Object.defineProperty(obj, 'x', {
  value: 1,
  writable: false,     // 不可写
  enumerable: false,   // 不可枚举
  configurable: false  // 不可配置
});

// 1. 尝试修改（writable: false）
obj.x = 2;
console.log(obj.x);  // 1（修改失败，严格模式会报错）

// 2. 尝试删除（configurable: false）
delete obj.x;
console.log(obj.x);  // 1（删除失败）

// 3. for...in 遍历（enumerable: false）
for (let key in obj) {
  console.log(key);  // 不输出（不可枚举）
}

// 4. Object.keys()（enumerable: false）
console.log(Object.keys(obj));  // []（不可枚举）
```

---

**属性描述符的两种类型**

**1. 数据描述符（Data Descriptor）**
```javascript
const obj = {};
Object.defineProperty(obj, 'prop', {
  value: 42,           // 属性值
  writable: true,      // 可写
  enumerable: true,    // 可枚举
  configurable: true   // 可配置
});
```

**2. 访问器描述符（Accessor Descriptor）**
```javascript
const obj = {};
Object.defineProperty(obj, 'prop', {
  get() {              // getter
    return this._prop;
  },
  set(value) {         // setter
    this._prop = value;
  },
  enumerable: true,
  configurable: true
});
```

---

**各属性的作用**

**writable：是否可修改**
```javascript
const obj = {};
Object.defineProperty(obj, 'x', {
  value: 1,
  writable: false
});

obj.x = 2;
console.log(obj.x);  // 1（非严格模式：静默失败）

'use strict';
obj.x = 2;  // TypeError: Cannot assign to read only property
```

**enumerable：是否可枚举**
```javascript
const obj = { a: 1 };
Object.defineProperty(obj, 'b', {
  value: 2,
  enumerable: false
});

console.log(Object.keys(obj));                    // ['a']
console.log(Object.getOwnPropertyNames(obj));     // ['a', 'b']

for (let key in obj) {
  console.log(key);  // 只输出 'a'
}

console.log(JSON.stringify(obj));  // '{"a":1}'（b 不被序列化）
```

**configurable：是否可配置**
```javascript
const obj = {};
Object.defineProperty(obj, 'x', {
  value: 1,
  configurable: false
});

// 不能删除
delete obj.x;
console.log(obj.x);  // 1

// 不能修改描述符
Object.defineProperty(obj, 'x', {
  enumerable: true  // TypeError: Cannot redefine property
});

// 但 writable 可以从 true 改为 false
Object.defineProperty(obj, 'y', {
  value: 2,
  writable: true,
  configurable: false
});
Object.defineProperty(obj, 'y', {
  writable: false  // 允许
});
```

---

**实际应用**

**1. 创建常量**
```javascript
const constants = {};
Object.defineProperty(constants, 'PI', {
  value: 3.14159,
  writable: false,
  configurable: false
});

constants.PI = 3;
console.log(constants.PI);  // 3.14159（不可修改）
```

**2. 隐藏属性**
```javascript
const user = { name: 'Alice' };
Object.defineProperty(user, '_id', {
  value: 12345,
  enumerable: false
});

console.log(user);  // { name: 'Alice' }（_id 不显示）
console.log(user._id);  // 12345（但可以访问）
```

**3. 计算属性**
```javascript
const circle = { radius: 5 };

Object.defineProperty(circle, 'area', {
  get() {
    return Math.PI * this.radius ** 2;
  },
  enumerable: true
});

console.log(circle.area);  // 78.54
circle.radius = 10;
console.log(circle.area);  // 314.16
```

**4. 防止对象被修改**
```javascript
// 1. 防止扩展（不能添加新属性）
Object.preventExtensions(obj);

// 2. 密封（不能添加/删除属性）
Object.seal(obj);

// 3. 冻结（不能添加/删除/修改属性）
Object.freeze(obj);

// 检查
console.log(Object.isExtensible(obj));
console.log(Object.isSealed(obj));
console.log(Object.isFrozen(obj));
```

---

**获取属性描述符**

```javascript
const obj = { a: 1 };

// 获取单个属性的描述符
const desc = Object.getOwnPropertyDescriptor(obj, 'a');
console.log(desc);
// {
//   value: 1,
//   writable: true,
//   enumerable: true,
//   configurable: true
// }

// 获取所有属性的描述符
const descs = Object.getOwnPropertyDescriptors(obj);
console.log(descs);
// {
//   a: {
//     value: 1,
//     writable: true,
//     enumerable: true,
//     configurable: true
//   }
// }
```

**复制对象（包括描述符）：**
```javascript
const source = { a: 1 };
Object.defineProperty(source, 'b', {
  value: 2,
  enumerable: false
});

// 浅拷贝（不保留描述符）
const copy1 = { ...source };
console.log(Object.keys(copy1));  // ['a']

// 完整拷贝（保留描述符）
const copy2 = Object.create(
  Object.getPrototypeOf(source),
  Object.getOwnPropertyDescriptors(source)
);
console.log(Object.getOwnPropertyNames(copy2));  // ['a', 'b']
```

</details>

---

**本章总结：**
- ✅ 原型和原型链
- ✅ `__proto__` vs `prototype`
- ✅ Class 语法与继承
- ✅ new 操作符原理
- ✅ 对象属性检查方法
- ✅ super 关键字
- ✅ 原型污染与防护
- ✅ instanceof 原理
- ✅ 属性描述符

**下一章：** [第 6 章：数组与常用方法](./chapter-06.md)
