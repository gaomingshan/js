# ES6 Class 深入

> 掌握现代 JavaScript 的类语法

---

## 概述

ES6 Class 提供了更简洁、更接近传统面向对象语言的类语法。虽然本质上仍是基于原型，但 Class 语法让代码更清晰、更易维护。

本章将深入：
- Class 的基本语法
- 静态方法与静态属性
- 私有字段与方法
- getter/setter
- Class 的继承机制
- 装饰器（提案）

---

## 1. Class 基本语法

### 1.1 类的定义

```javascript
// 类声明
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
}

// 类表达式
const Person = class {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
};

// 命名类表达式
const Person = class PersonClass {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
};
```

### 1.2 类与函数的区别

```javascript
// 类必须使用 new 调用
class Person {}
Person();  // ❌ TypeError: Class constructor Person cannot be invoked without 'new'

// 函数可以直接调用
function Person() {}
Person();  // ✅

// 类声明不会提升
const p = new Person();  // ❌ ReferenceError
class Person {}

// 函数声明会提升
const p = new Person();  // ✅
function Person() {}

// 类内部默认严格模式
class Person {
  test() {
    console.log(this);  // 严格模式，this 可能是 undefined
  }
}

const p = new Person();
const test = p.test;
test();  // undefined（严格模式）
```

### 1.3 constructor 方法

```javascript
class Person {
  constructor(name, age) {
    // constructor 在 new 时自动调用
    this.name = name;
    this.age = age;
  }
}

const alice = new Person("Alice", 25);
console.log(alice.name);  // "Alice"

// 省略 constructor（默认空构造函数）
class Empty {
  // 等价于
  // constructor() {}
}

// constructor 返回非对象值会被忽略
class Test {
  constructor() {
    return 123;  // 忽略
  }
}
console.log(new Test() instanceof Test);  // true

// constructor 返回对象会覆盖
class Test {
  constructor() {
    return { custom: true };
  }
}
console.log(new Test() instanceof Test);  // false
```

---

## 2. 实例方法与属性

### 2.1 实例方法

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  
  // 实例方法（定义在原型上）
  greet() {
    console.log(`Hello, ${this.name}`);
  }
  
  // 等价于
  // Person.prototype.greet = function() { ... }
}

const alice = new Person("Alice");
const bob = new Person("Bob");

// 方法共享
console.log(alice.greet === bob.greet);  // true
```

### 2.2 实例属性

```javascript
class Person {
  // 类字段（实例属性）
  age = 0;
  
  constructor(name) {
    this.name = name;
  }
}

const alice = new Person("Alice");
console.log(alice.age);  // 0
alice.age = 25;

// 每个实例独立
const bob = new Person("Bob");
console.log(bob.age);  // 0
```

### 2.3 计算属性名

```javascript
const methodName = "greet";
const propName = "age";

class Person {
  [propName] = 0;
  
  [methodName]() {
    console.log(`Hello, I'm ${this.name}`);
  }
}

const alice = new Person();
alice[methodName]();  // "Hello, I'm undefined"
```

---

## 3. 静态方法与静态属性

### 3.1 静态方法

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  
  // 静态方法（定义在类上）
  static create(name) {
    return new Person(name);
  }
  
  static isValid(name) {
    return typeof name === 'string' && name.length > 0;
  }
}

// 通过类名调用
const alice = Person.create("Alice");

// 不能通过实例调用
console.log(alice.create);  // undefined

// 等价于
Person.create = function(name) {
  return new Person(name);
};
```

### 3.2 静态属性

```javascript
class Person {
  // 静态属性
  static species = "Human";
  static count = 0;
  
  constructor(name) {
    this.name = name;
    Person.count++;  // 访问静态属性
  }
  
  static getCount() {
    return Person.count;
  }
}

console.log(Person.species);  // "Human"
console.log(Person.count);    // 0

const alice = new Person("Alice");
console.log(Person.count);    // 1

const bob = new Person("Bob");
console.log(Person.getCount());  // 2
```

### 3.3 静态方法中的 this

```javascript
class Person {
  static count = 0;
  
  static increment() {
    // 静态方法中的 this 指向类本身
    this.count++;
  }
  
  static getCount() {
    return this.count;
  }
}

Person.increment();
console.log(Person.getCount());  // 1
```

---

## 4. 私有字段与方法

### 4.1 私有字段（ES2022）

```javascript
class Person {
  // 私有字段（以 # 开头）
  #age = 0;
  
  constructor(name, age) {
    this.name = name;
    this.#age = age;
  }
  
  getAge() {
    return this.#age;
  }
  
  setAge(age) {
    if (age >= 0) {
      this.#age = age;
    }
  }
}

const alice = new Person("Alice", 25);
console.log(alice.getAge());  // 25

// 无法直接访问私有字段
console.log(alice.#age);  // ❌ SyntaxError: Private field '#age' must be declared in an enclosing class
```

### 4.2 私有方法

```javascript
class Person {
  #name;
  
  constructor(name) {
    this.#name = name;
  }
  
  // 私有方法
  #validate() {
    return this.#name.length > 0;
  }
  
  greet() {
    if (this.#validate()) {
      console.log(`Hello, ${this.#name}`);
    }
  }
}

const alice = new Person("Alice");
alice.greet();  // "Hello, Alice"

// 无法访问私有方法
alice.#validate();  // ❌ SyntaxError
```

### 4.3 静态私有字段

```javascript
class Person {
  static #count = 0;
  
  constructor(name) {
    this.name = name;
    Person.#count++;
  }
  
  static getCount() {
    return Person.#count;
  }
}

const alice = new Person("Alice");
console.log(Person.getCount());  // 1

// 外部无法访问
console.log(Person.#count);  // ❌ SyntaxError
```

### 4.4 私有字段的检查

```javascript
class Person {
  #name;
  
  constructor(name) {
    this.#name = name;
  }
  
  static isPerson(obj) {
    // 使用 in 检查私有字段
    return #name in obj;
  }
}

const alice = new Person("Alice");
console.log(Person.isPerson(alice));  // true
console.log(Person.isPerson({}));     // false
```

---

## 5. getter 和 setter

### 5.1 基本用法

```javascript
class Person {
  constructor(firstName, lastName) {
    this._firstName = firstName;
    this._lastName = lastName;
  }
  
  // getter
  get fullName() {
    return `${this._firstName} ${this._lastName}`;
  }
  
  // setter
  set fullName(value) {
    const parts = value.split(' ');
    this._firstName = parts[0];
    this._lastName = parts[1];
  }
}

const alice = new Person("Alice", "Smith");

// 像访问属性一样使用
console.log(alice.fullName);  // "Alice Smith"（调用 getter）

// 像赋值一样使用
alice.fullName = "Bob Jones";  // 调用 setter
console.log(alice._firstName);  // "Bob"
console.log(alice._lastName);   // "Jones"
```

### 5.2 只读属性

```javascript
class Circle {
  constructor(radius) {
    this._radius = radius;
  }
  
  // 只有 getter，没有 setter（只读）
  get radius() {
    return this._radius;
  }
  
  get area() {
    return Math.PI * this._radius ** 2;
  }
}

const circle = new Circle(5);
console.log(circle.radius);  // 5
console.log(circle.area);    // 78.54

circle.radius = 10;  // 静默失败（严格模式报错）
console.log(circle.radius);  // 5（未改变）
```

### 5.3 数据验证

```javascript
class Person {
  #age;
  
  constructor(name, age) {
    this.name = name;
    this.age = age;  // 通过 setter 验证
  }
  
  get age() {
    return this.#age;
  }
  
  set age(value) {
    if (typeof value !== 'number' || value < 0 || value > 150) {
      throw new TypeError('Invalid age');
    }
    this.#age = value;
  }
}

const alice = new Person("Alice", 25);
console.log(alice.age);  // 25

alice.age = 30;  // ✅
alice.age = -5;  // ❌ TypeError: Invalid age
```

### 5.4 静态 getter/setter

```javascript
class Config {
  static #apiUrl = "https://api.example.com";
  
  static get apiUrl() {
    return Config.#apiUrl;
  }
  
  static set apiUrl(value) {
    if (!value.startsWith('https://')) {
      throw new Error('API URL must use HTTPS');
    }
    Config.#apiUrl = value;
  }
}

console.log(Config.apiUrl);  // "https://api.example.com"

Config.apiUrl = "https://newapi.com";  // ✅
Config.apiUrl = "http://insecure.com";  // ❌ Error
```

---

## 6. Class 继承

### 6.1 extends 关键字

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  eat(food) {
    console.log(`${this.name} is eating ${food}`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // 调用父类构造函数
    this.breed = breed;
  }
  
  bark() {
    console.log(`${this.name} is barking`);
  }
}

const dog = new Dog("Buddy", "Golden Retriever");
dog.eat("bone");  // "Buddy is eating bone"（继承）
dog.bark();       // "Buddy is barking"（自身）
```

### 6.2 super 关键字

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
    // 1. super() 调用父类构造函数
    super(name);
    this.age = age;
  }
  
  greet() {
    // 2. super.method() 调用父类方法
    return `${super.greet()}, I'm ${this.age} years old`;
  }
}

const child = new Child("Alice", 10);
console.log(child.greet());
// "Hello, Alice, I'm 10 years old"
```

### 6.3 静态方法继承

```javascript
class Parent {
  static parentMethod() {
    return "Parent static";
  }
}

class Child extends Parent {
  static childMethod() {
    // 调用父类静态方法
    return `${super.parentMethod()} + Child static`;
  }
}

console.log(Child.parentMethod());  // "Parent static"（继承）
console.log(Child.childMethod());   // "Parent static + Child static"
```

### 6.4 私有字段不继承

```javascript
class Parent {
  #privateField = "parent private";
  
  getPrivate() {
    return this.#privateField;
  }
}

class Child extends Parent {
  #privateField = "child private";  // 不同的私有字段
  
  getOwnPrivate() {
    return this.#privateField;
  }
}

const child = new Child();
console.log(child.getPrivate());     // "parent private"
console.log(child.getOwnPrivate());  // "child private"
```

---

## 7. 抽象类模拟

### 7.1 禁止实例化基类

```javascript
class AbstractClass {
  constructor() {
    if (new.target === AbstractClass) {
      throw new Error("Cannot instantiate abstract class");
    }
  }
  
  // 抽象方法（需要子类实现）
  abstractMethod() {
    throw new Error("Abstract method must be implemented");
  }
}

class ConcreteClass extends AbstractClass {
  abstractMethod() {
    console.log("Implemented");
  }
}

new AbstractClass();  // ❌ Error: Cannot instantiate abstract class
new ConcreteClass();  // ✅
```

### 7.2 检查必需方法

```javascript
class Shape {
  constructor() {
    if (this.getArea === undefined) {
      throw new Error("Subclass must implement getArea method");
    }
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  
  getArea() {
    return this.width * this.height;
  }
}

class InvalidShape extends Shape {
  // 未实现 getArea
}

new Rectangle(10, 5);  // ✅
new InvalidShape();    // ❌ Error: Subclass must implement getArea method
```

---

## 8. Class 的本质

### 8.1 Class 是函数

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}

console.log(typeof Person);  // "function"
console.log(Person.prototype.constructor === Person);  // true
```

### 8.2 Class 语法糖

```javascript
// ES6 Class
class Person {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    console.log(`Hello, ${this.name}`);
  }
}

// 大致等价于
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log(`Hello, ${this.name}`);
};

// 但有区别：
// 1. Class 必须用 new 调用
// 2. Class 方法不可枚举
// 3. Class 内部严格模式
```

### 8.3 方法不可枚举

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    console.log(`Hello, ${this.name}`);
  }
}

const alice = new Person("Alice");

// Class 方法不可枚举
for (let key in alice) {
  console.log(key);  // 只输出 "name"（不包含 greet）
}

console.log(Object.keys(alice));  // ["name"]

// 传统构造函数的方法可枚举
function OldPerson(name) {
  this.name = name;
}

OldPerson.prototype.greet = function() {
  console.log(`Hello, ${this.name}`);
};

const bob = new OldPerson("Bob");
for (let key in bob) {
  console.log(key);  // 输出 "name" 和 "greet"
}
```

---

## 9. 装饰器（提案）

### 9.1 类装饰器

```javascript
// 装饰器是函数
function log(target) {
  console.log(`Class ${target.name} created`);
  return target;
}

@log
class Person {
  constructor(name) {
    this.name = name;
  }
}
// 输出："Class Person created"

// 等价于
Person = log(Person);
```

### 9.2 方法装饰器

```javascript
function readonly(target, name, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

class Person {
  @readonly
  name() {
    return "Alice";
  }
}

const person = new Person();
person.name = function() {};  // 静默失败（严格模式报错）
```

### 9.3 属性装饰器

```javascript
function validate(target, name) {
  let value;
  
  return {
    get() {
      return value;
    },
    set(newValue) {
      if (typeof newValue !== 'string') {
        throw new TypeError('Must be a string');
      }
      value = newValue;
    }
  };
}

class Person {
  @validate
  name;
}

const person = new Person();
person.name = "Alice";  // ✅
person.name = 123;      // ❌ TypeError
```

### 9.4 装饰器工厂

```javascript
function log(prefix) {
  return function(target, name, descriptor) {
    const original = descriptor.value;
    
    descriptor.value = function(...args) {
      console.log(`${prefix} ${name}:`, args);
      return original.apply(this, args);
    };
    
    return descriptor;
  };
}

class Calculator {
  @log('Calculating')
  add(a, b) {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(1, 2);  // 输出："Calculating add: [1, 2]"，返回 3
```

---

## 10. 工程实践

### 10.1 单例模式

```javascript
class Singleton {
  static #instance;
  
  constructor() {
    if (Singleton.#instance) {
      return Singleton.#instance;
    }
    Singleton.#instance = this;
  }
  
  static getInstance() {
    if (!Singleton.#instance) {
      Singleton.#instance = new Singleton();
    }
    return Singleton.#instance;
  }
}

const s1 = new Singleton();
const s2 = new Singleton();
console.log(s1 === s2);  // true
```

### 10.2 工厂模式

```javascript
class User {
  constructor(name, role) {
    this.name = name;
    this.role = role;
  }
}

class UserFactory {
  static createAdmin(name) {
    return new User(name, 'admin');
  }
  
  static createEditor(name) {
    return new User(name, 'editor');
  }
  
  static createViewer(name) {
    return new User(name, 'viewer');
  }
}

const admin = UserFactory.createAdmin("Alice");
const editor = UserFactory.createEditor("Bob");
```

### 10.3 建造者模式

```javascript
class Person {
  constructor(builder) {
    this.name = builder.name;
    this.age = builder.age;
    this.email = builder.email;
  }
  
  static get Builder() {
    class Builder {
      setName(name) {
        this.name = name;
        return this;
      }
      
      setAge(age) {
        this.age = age;
        return this;
      }
      
      setEmail(email) {
        this.email = email;
        return this;
      }
      
      build() {
        return new Person(this);
      }
    }
    return Builder;
  }
}

const person = new Person.Builder()
  .setName("Alice")
  .setAge(25)
  .setEmail("alice@example.com")
  .build();

console.log(person);
```

### 10.4 TypeScript 中的 Class

```typescript
class Person {
  // 访问修饰符
  private age: number;
  protected name: string;
  public email: string;
  
  constructor(name: string, age: number, email: string) {
    this.name = name;
    this.age = age;
    this.email = email;
  }
  
  // 抽象方法（需要子类实现）
  abstract greet(): void;
}
```

---

## 关键要点

1. **Class 基本特性**
   - 必须用 new 调用
   - 不会提升
   - 内部严格模式
   - 本质是函数（语法糖）

2. **实例与静态**
   - 实例方法/属性：定义在原型/实例上
   - 静态方法/属性：定义在类上

3. **私有字段**
   - 以 # 开头
   - 外部无法访问
   - 不继承

4. **getter/setter**
   - 像属性一样使用
   - 可以添加验证逻辑
   - 可以创建只读属性

5. **继承**
   - extends 继承
   - super() 调用父类构造函数
   - super.method() 调用父类方法
   - 静态方法也会继承

---

## 深入一点

### Class 字段的初始化顺序

```javascript
class Parent {
  parentField = console.log('Parent field');
  
  constructor() {
    console.log('Parent constructor');
  }
}

class Child extends Parent {
  childField = console.log('Child field');
  
  constructor() {
    super();
    console.log('Child constructor');
  }
}

new Child();
// 输出顺序：
// Parent field
// Parent constructor
// Child field
// Child constructor
```

### new.target

```javascript
class Person {
  constructor() {
    console.log(new.target.name);
  }
}

class Employee extends Person {}

new Person();    // "Person"
new Employee();  // "Employee"
```

---

## 参考资料

- [MDN: Class](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)
- [MDN: 私有类字段](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
- [TC39: Class 提案](https://github.com/tc39/proposals)

---

**上一章**：[继承模式](./content-14.md)  
**下一章**：[函数基础与特性](./content-16.md)
