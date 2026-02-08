# Symbol 与元编程

> 理解 JavaScript 的唯一标识符和内置符号

---

## 概述

Symbol 是 ES6 引入的原始数据类型，用于创建唯一的标识符。它是 JavaScript 元编程的重要组成部分。

本章将深入：
- Symbol 基础
- Well-known Symbols
- 实际应用场景
- 元编程技巧

---

## 1. Symbol 基础

### 1.1 创建 Symbol

```javascript
// 创建唯一 Symbol
const s1 = Symbol();
const s2 = Symbol();

console.log(s1 === s2);  // false（每个都是唯一的）

// 带描述的 Symbol
const s3 = Symbol('description');
console.log(s3.toString());  // "Symbol(description)"
console.log(s3.description);  // "description"

// Symbol.for（全局注册）
const s4 = Symbol.for('shared');
const s5 = Symbol.for('shared');

console.log(s4 === s5);  // true（共享）

// Symbol.keyFor（获取键）
console.log(Symbol.keyFor(s4));  // "shared"
console.log(Symbol.keyFor(s1));  // undefined（非全局）
```

### 1.2 Symbol 作为属性键

```javascript
const id = Symbol('id');

const user = {
  name: 'Alice',
  [id]: 123  // Symbol 属性
};

console.log(user[id]);  // 123
console.log(user.id);   // undefined

// Symbol 属性不会出现在常规遍历中
console.log(Object.keys(user));      // ['name']
console.log(Object.values(user));    // ['Alice']
console.log(JSON.stringify(user));   // {"name":"Alice"}

// 获取 Symbol 属性
console.log(Object.getOwnPropertySymbols(user));  // [Symbol(id)]
console.log(Reflect.ownKeys(user));  // ['name', Symbol(id)]
```

---

## 2. Well-known Symbols

### 2.1 Symbol.iterator

```javascript
// 自定义迭代器
const range = {
  start: 1,
  end: 5,
  
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
};

for (const num of range) {
  console.log(num);  // 1, 2, 3, 4, 5
}

console.log([...range]);  // [1, 2, 3, 4, 5]
```

### 2.2 Symbol.toStringTag

```javascript
// 自定义对象类型标签
class MyClass {
  get [Symbol.toStringTag]() {
    return 'MyClass';
  }
}

const obj = new MyClass();
console.log(Object.prototype.toString.call(obj));
// "[object MyClass]"

// 内置类型
console.log(Object.prototype.toString.call(new Map()));
// "[object Map]"
```

### 2.3 Symbol.toPrimitive

```javascript
// 自定义类型转换
const obj = {
  [Symbol.toPrimitive](hint) {
    console.log('hint:', hint);
    
    if (hint === 'number') {
      return 42;
    } else if (hint === 'string') {
      return 'Hello';
    } else {  // default
      return true;
    }
  }
};

console.log(+obj);       // hint: number, 42
console.log(`${obj}`);   // hint: string, "Hello"
console.log(obj + '');   // hint: default, "true"
```

### 2.4 Symbol.hasInstance

```javascript
// 自定义 instanceof 行为
class MyArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance);
  }
}

console.log([] instanceof MyArray);  // true
console.log({} instanceof MyArray);  // false
```

### 2.5 Symbol.species

```javascript
// 自定义派生对象的构造函数
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array;  // 返回普通 Array
  }
}

const arr = new MyArray(1, 2, 3);
const mapped = arr.map(x => x * 2);

console.log(mapped instanceof MyArray);  // false
console.log(mapped instanceof Array);    // true
```

---

## 3. 实际应用

### 3.1 私有属性

```javascript
// 使用 Symbol 模拟私有属性
const _private = Symbol('private');

class User {
  constructor(name, secret) {
    this.name = name;
    this[_private] = secret;
  }
  
  getSecret() {
    return this[_private];
  }
}

const user = new User('Alice', 'password123');

console.log(user.name);          // "Alice"
console.log(user.getSecret());   // "password123"
console.log(user[_private]);     // undefined（外部无法访问）

// 注意：不是真正的私有（可通过 getOwnPropertySymbols 获取）
```

### 3.2 对象常量

```javascript
// 防止常量被覆盖
const COLOR_RED = Symbol('red');
const COLOR_GREEN = Symbol('green');
const COLOR_BLUE = Symbol('blue');

function getColor(color) {
  switch (color) {
    case COLOR_RED:
      return '#FF0000';
    case COLOR_GREEN:
      return '#00FF00';
    case COLOR_BLUE:
      return '#0000FF';
    default:
      throw new Error('Unknown color');
  }
}

console.log(getColor(COLOR_RED));  // "#FF0000"
```

### 3.3 单例模式

```javascript
// 使用 Symbol.for 实现全局单例
class Database {
  constructor() {
    const instance = Symbol.for('Database.instance');
    
    if (global[instance]) {
      return global[instance];
    }
    
    this.connection = null;
    global[instance] = this;
  }
  
  connect() {
    if (!this.connection) {
      this.connection = 'Connected';
    }
    return this.connection;
  }
}

const db1 = new Database();
const db2 = new Database();

console.log(db1 === db2);  // true（同一实例）
```

### 3.4 扩展内置类型

```javascript
// 为数组添加自定义方法
const last = Symbol('last');

Array.prototype[last] = function() {
  return this[this.length - 1];
};

const arr = [1, 2, 3, 4, 5];
console.log(arr[last]());  // 5

// 不会影响常规遍历
console.log(Object.keys(arr));  // ['0', '1', '2', '3', '4']
```

---

## 4. 元编程技巧

### 4.1 自定义迭代行为

```javascript
class Collection {
  constructor(items) {
    this.items = items;
  }
  
  // 默认迭代器
  [Symbol.iterator]() {
    let index = 0;
    const items = this.items;
    
    return {
      next() {
        if (index < items.length) {
          return { value: items[index++], done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
  
  // 反向迭代器
  *reverse() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      yield this.items[i];
    }
  }
}

const col = new Collection([1, 2, 3, 4, 5]);

console.log([...col]);            // [1, 2, 3, 4, 5]
console.log([...col.reverse()]);  // [5, 4, 3, 2, 1]
```

### 4.2 链式调用

```javascript
const END = Symbol('END');

class Chain {
  constructor(value) {
    this.value = value;
  }
  
  add(n) {
    this.value += n;
    return this;
  }
  
  multiply(n) {
    this.value *= n;
    return this;
  }
  
  [END]() {
    return this.value;
  }
}

const result = new Chain(5)
  .add(3)
  .multiply(2)
  [END]();

console.log(result);  // 16
```

### 4.3 观察者模式

```javascript
const OBSERVERS = Symbol('observers');

class Observable {
  constructor() {
    this[OBSERVERS] = new Set();
  }
  
  observe(fn) {
    this[OBSERVERS].add(fn);
  }
  
  unobserve(fn) {
    this[OBSERVERS].delete(fn);
  }
  
  notify(data) {
    this[OBSERVERS].forEach(fn => fn(data));
  }
}

const observable = new Observable();

observable.observe(data => console.log('观察者1:', data));
observable.observe(data => console.log('观察者2:', data));

observable.notify({ message: 'Hello' });
// 观察者1: { message: 'Hello' }
// 观察者2: { message: 'Hello' }
```

---

## 5. Symbol 与安全性

### 5.1 防止属性冲突

```javascript
// 多个库可能添加相同名称的方法
// 使用 Symbol 避免冲突

// 库 A
const myMethod = Symbol('myMethod');
Object.prototype[myMethod] = function() {
  return 'Library A';
};

// 库 B
const myMethod2 = Symbol('myMethod');
Object.prototype[myMethod2] = function() {
  return 'Library B';
};

// 两个方法互不影响
const obj = {};
console.log(obj[myMethod]());   // "Library A"
console.log(obj[myMethod2]());  // "Library B"
```

### 5.2 隐藏内部实现

```javascript
const _state = Symbol('state');
const _render = Symbol('render');

class Component {
  constructor() {
    this[_state] = { count: 0 };
  }
  
  increment() {
    this[_state].count++;
    this[_render]();
  }
  
  [_render]() {
    console.log('Count:', this[_state].count);
  }
}

const comp = new Component();
comp.increment();  // Count: 1

// 外部无法直接访问内部方法
console.log(comp._state);   // undefined
console.log(comp._render);  // undefined
```

---

## 关键要点

1. **Symbol 特性**
   - 唯一性
   - 作为属性键
   - 不可枚举

2. **Well-known Symbols**
   - Symbol.iterator：迭代器
   - Symbol.toStringTag：类型标签
   - Symbol.toPrimitive：类型转换
   - Symbol.hasInstance：instanceof

3. **实际应用**
   - 私有属性
   - 对象常量
   - 单例模式
   - 扩展内置类型

4. **元编程**
   - 自定义迭代
   - 链式调用
   - 观察者模式

5. **安全性**
   - 避免属性冲突
   - 隐藏内部实现
   - 全局注册

---

## 参考资料

- [MDN: Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [Well-known Symbols](https://tc39.es/ecma262/#sec-well-known-symbols)

---

**上一章**：[Proxy 与 Reflect](./content-32.md)  
**下一章**：[装饰器提案](./content-34.md)
