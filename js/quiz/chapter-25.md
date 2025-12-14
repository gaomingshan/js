# 第 25 章：高级类型特性 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Symbol 基础

### 题目

Symbol 的主要用途是什么？

**选项：**
- A. 创建唯一标识符
- B. 加密数据
- C. 提高性能
- D. 类型转换

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Symbol 创建唯一标识符**

```javascript
// 每个 Symbol 都是唯一的
const sym1 = Symbol('desc');
const sym2 = Symbol('desc');
console.log(sym1 === sym2);  // false

// 用作对象属性
const obj = {
  [sym1]: 'value1',
  [sym2]: 'value2'
};

console.log(obj[sym1]);  // "value1"
console.log(obj[sym2]);  // "value2"
```

**主要用途：**

**1. 防止属性名冲突**
```javascript
const TYPE = Symbol('type');

class Animal {
  constructor(type) {
    this[TYPE] = type;
  }
}

// 不会与用户代码冲突
const dog = new Animal('dog');
dog.type = 'custom';  // 不影响 Symbol 属性
console.log(dog[TYPE]);  // "dog"
```

**2. 定义常量**
```javascript
const Status = {
  PENDING: Symbol('pending'),
  FULFILLED: Symbol('fulfilled'),
  REJECTED: Symbol('rejected')
};

function process(status) {
  switch (status) {
    case Status.PENDING:
      return 'waiting';
    case Status.FULFILLED:
      return 'done';
  }
}
```

**3. 内部方法**
```javascript
const _private = Symbol('private');

class MyClass {
  constructor() {
    this[_private] = 'secret';
  }
  
  getPrivate() {
    return this[_private];
  }
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** Well-Known Symbols

### 题目

`Symbol.iterator` 的作用是什么？

**选项：**
- A. 定义对象的迭代行为
- B. 创建唯一 ID
- C. 属性访问控制
- D. 类型检查

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Symbol.iterator 定义迭代行为**

```javascript
const iterable = {
  data: [1, 2, 3],
  
  [Symbol.iterator]() {
    let index = 0;
    const data = this.data;
    
    return {
      next() {
        if (index < data.length) {
          return {
            value: data[index++],
            done: false
          };
        }
        return { done: true };
      }
    };
  }
};

// for...of 使用 Symbol.iterator
for (const item of iterable) {
  console.log(item);  // 1, 2, 3
}

// 展开运算符也使用
console.log([...iterable]);  // [1, 2, 3]
```

**常用 Well-Known Symbols：**

```javascript
// Symbol.iterator - 迭代器
obj[Symbol.iterator]();

// Symbol.toStringTag - toString 返回值
class MyClass {
  get [Symbol.toStringTag]() {
    return 'MyClass';
  }
}
console.log(Object.prototype.toString.call(new MyClass()));
// "[object MyClass]"

// Symbol.hasInstance - instanceof 行为
class MyArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance);
  }
}
console.log([] instanceof MyArray);  // true

// Symbol.toPrimitive - 类型转换
const obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return 42;
    if (hint === 'string') return 'hello';
    return null;
  }
};
console.log(+obj);  // 42
console.log(`${obj}`);  // "hello"
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** Symbol 特性

### 题目

Symbol 属性不会出现在 `for...in` 循环中。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**Symbol 属性的特殊性**

```javascript
const sym = Symbol('test');
const obj = {
  name: 'Alice',
  age: 25,
  [sym]: 'symbol value'
};

// for...in 不包含 Symbol 属性
for (const key in obj) {
  console.log(key);  // "name", "age"
}

// Object.keys 不包含
console.log(Object.keys(obj));  // ["name", "age"]

// Object.getOwnPropertyNames 不包含
console.log(Object.getOwnPropertyNames(obj));  // ["name", "age"]

// JSON.stringify 不包含
console.log(JSON.stringify(obj));  // {"name":"Alice","age":25}
```

**获取 Symbol 属性：**

```javascript
// Object.getOwnPropertySymbols
console.log(Object.getOwnPropertySymbols(obj));  // [Symbol(test)]

// Reflect.ownKeys（包含所有属性）
console.log(Reflect.ownKeys(obj));  // ["name", "age", Symbol(test)]
```

**应用场景：**

```javascript
// 私有属性
const _private = Symbol('private');

class MyClass {
  constructor() {
    this[_private] = 'secret';
    this.public = 'public';
  }
  
  getPrivate() {
    return this[_private];
  }
}

const instance = new MyClass();

// 遍历时不会暴露私有属性
console.log(Object.keys(instance));  // ["public"]
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** Symbol.for

### 题目

以下代码的输出是什么？

```javascript
const sym1 = Symbol.for('key');
const sym2 = Symbol.for('key');
const sym3 = Symbol('key');

console.log(sym1 === sym2);
console.log(sym1 === sym3);
```

**选项：**
- A. `true`, `true`
- B. `false`, `false`
- C. `true`, `false`
- D. `false`, `true`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**Symbol.for 全局注册**

```javascript
// Symbol.for 在全局注册表中查找
const sym1 = Symbol.for('key');
const sym2 = Symbol.for('key');
console.log(sym1 === sym2);  // true（相同的 key）

// Symbol 每次都创建新的
const sym3 = Symbol('key');
console.log(sym1 === sym3);  // false（不同）
```

**Symbol.for vs Symbol：**

| 特性 | Symbol | Symbol.for |
|------|--------|------------|
| 唯一性 | 每次唯一 | 相同 key 返回相同 Symbol |
| 全局注册 | ❌ | ✅ |
| 跨 iframe | ❌ | ✅ |
| Symbol.keyFor | undefined | 返回 key |

**实际应用：**

```javascript
// 跨模块共享 Symbol
// moduleA.js
export const TYPE = Symbol.for('app.type');

// moduleB.js
export const TYPE = Symbol.for('app.type');

// main.js
import { TYPE as TYPE_A } from './moduleA';
import { TYPE as TYPE_B } from './moduleB';

console.log(TYPE_A === TYPE_B);  // true

// Symbol.keyFor 获取 key
console.log(Symbol.keyFor(TYPE_A));  // "app.type"
```

**全局 Symbol 注册表：**

```javascript
// 创建并注册
const sym1 = Symbol.for('app.id');

// 获取 key
const key = Symbol.keyFor(sym1);
console.log(key);  // "app.id"

// 通过 key 获取 Symbol
const sym2 = Symbol.for(key);
console.log(sym1 === sym2);  // true

// 非全局 Symbol
const sym3 = Symbol('local');
console.log(Symbol.keyFor(sym3));  // undefined
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** Symbol.toPrimitive

### 题目

使用 `Symbol.toPrimitive` 实现一个"智能"对象。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
class SmartNumber {
  constructor(value) {
    this.value = value;
  }
  
  [Symbol.toPrimitive](hint) {
    console.log('hint:', hint);
    
    switch (hint) {
      case 'number':
        return this.value;
      
      case 'string':
        return `SmartNumber(${this.value})`;
      
      case 'default':
        return this.value;
    }
  }
}

const num = new SmartNumber(42);

// number 上下文
console.log(+num);           // hint: number, 42
console.log(num - 0);        // hint: number, 42
console.log(num * 2);        // hint: number, 84

// string 上下文
console.log(`${num}`);       // hint: string, "SmartNumber(42)"
console.log(String(num));    // hint: string, "SmartNumber(42)"

// default 上下文
console.log(num + 10);       // hint: default, 52
console.log(num == 42);      // hint: default, true
```

**实际应用：金额类**

```javascript
class Money {
  constructor(cents) {
    this.cents = cents;
  }
  
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') {
      return this.cents / 100;  // 转为元
    }
    
    if (hint === 'string') {
      const dollars = Math.floor(this.cents / 100);
      const cents = this.cents % 100;
      return `$${dollars}.${cents.toString().padStart(2, '0')}`;
    }
    
    return this.cents;
  }
  
  add(other) {
    return new Money(this.cents + other.cents);
  }
  
  multiply(factor) {
    return new Money(Math.round(this.cents * factor));
  }
}

const price = new Money(1299);  // $12.99

console.log(String(price));     // "$12.99"
console.log(Number(price));     // 12.99
console.log(price + 100);       // 1399

const total = price.multiply(3);
console.log(String(total));     // "$38.97"
```

**实际应用：时间类**

```javascript
class Duration {
  constructor(milliseconds) {
    this.ms = milliseconds;
  }
  
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') {
      return this.ms;
    }
    
    if (hint === 'string') {
      const seconds = Math.floor(this.ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      }
      return `${seconds}s`;
    }
    
    return this.ms;
  }
}

const duration = new Duration(7285000);  // 2h 1m 25s

console.log(String(duration));  // "2h 1m"
console.log(Number(duration));  // 7285000
console.log(duration > 7200000);  // true
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** Symbol.iterator 高级

### 题目

实现一个支持多种遍历方式的集合类。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
class Collection {
  constructor(items = []) {
    this.items = items;
  }
  
  // 默认迭代器：正向
  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }
  
  // 反向迭代
  *reverse() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      yield this.items[i];
    }
  }
  
  // 带索引迭代
  *entries() {
    for (let i = 0; i < this.items.length; i++) {
      yield [i, this.items[i]];
    }
  }
  
  // 过滤迭代
  *filter(predicate) {
    for (const item of this.items) {
      if (predicate(item)) {
        yield item;
      }
    }
  }
  
  // 映射迭代
  *map(fn) {
    for (const item of this.items) {
      yield fn(item);
    }
  }
  
  // 分块迭代
  *chunk(size) {
    for (let i = 0; i < this.items.length; i += size) {
      yield this.items.slice(i, i + size);
    }
  }
}

// 使用
const col = new Collection([1, 2, 3, 4, 5]);

// 正向
for (const item of col) {
  console.log(item);  // 1, 2, 3, 4, 5
}

// 反向
for (const item of col.reverse()) {
  console.log(item);  // 5, 4, 3, 2, 1
}

// 带索引
for (const [index, value] of col.entries()) {
  console.log(index, value);
}

// 过滤
for (const item of col.filter(x => x % 2 === 0)) {
  console.log(item);  // 2, 4
}

// 映射
for (const item of col.map(x => x * 2)) {
  console.log(item);  // 2, 4, 6, 8, 10
}

// 分块
for (const chunk of col.chunk(2)) {
  console.log(chunk);  // [1, 2], [3, 4], [5]
}
```

**链式操作：**

```javascript
class LazyCollection {
  constructor(iterable) {
    this.iterable = iterable;
  }
  
  [Symbol.iterator]() {
    return this.iterable[Symbol.iterator]();
  }
  
  map(fn) {
    const parent = this.iterable;
    const iterable = {
      *[Symbol.iterator]() {
        for (const item of parent) {
          yield fn(item);
        }
      }
    };
    return new LazyCollection(iterable);
  }
  
  filter(predicate) {
    const parent = this.iterable;
    const iterable = {
      *[Symbol.iterator]() {
        for (const item of parent) {
          if (predicate(item)) {
            yield item;
          }
        }
      }
    };
    return new LazyCollection(iterable);
  }
  
  take(n) {
    const parent = this.iterable;
    const iterable = {
      *[Symbol.iterator]() {
        let count = 0;
        for (const item of parent) {
          if (count++ >= n) break;
          yield item;
        }
      }
    };
    return new LazyCollection(iterable);
  }
  
  toArray() {
    return [...this];
  }
}

// 使用（惰性求值）
const result = new LazyCollection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .take(3)
  .toArray();

console.log(result);  // [4, 8, 12]
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** Symbol 应用场景

### 题目

Symbol 可以用于以下哪些场景？

**选项：**
- A. 定义私有属性
- B. 定义常量
- C. 定义元数据
- D. 自定义对象行为

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**A. 定义私有属性**
```javascript
const _private = Symbol('private');

class MyClass {
  constructor() {
    this[_private] = 'secret';
  }
  
  getPrivate() {
    return this[_private];
  }
}

const instance = new MyClass();
console.log(instance[_private]);  // undefined（外部无法访问）
```

**B. 定义常量**
```javascript
const Colors = {
  RED: Symbol('red'),
  GREEN: Symbol('green'),
  BLUE: Symbol('blue')
};

function getColorName(color) {
  switch (color) {
    case Colors.RED:
      return 'Red';
    case Colors.GREEN:
      return 'Green';
    case Colors.BLUE:
      return 'Blue';
  }
}
```

**C. 定义元数据**
```javascript
const metadata = Symbol('metadata');

class Component {
  constructor() {
    this[metadata] = {
      created: Date.now(),
      version: '1.0.0'
    };
  }
  
  getMetadata() {
    return this[metadata];
  }
}
```

**D. 自定义对象行为**
```javascript
class MyArray extends Array {
  get [Symbol.toStringTag]() {
    return 'MyArray';
  }
  
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') {
      return this.length;
    }
    return this.join(',');
  }
}

const arr = new MyArray(1, 2, 3);
console.log(Object.prototype.toString.call(arr));  // "[object MyArray]"
console.log(+arr);  // 3
console.log(`${arr}`);  // "1,2,3"
```

**其他应用：**

**单例模式**
```javascript
const instance = Symbol('instance');

class Singleton {
  static [instance] = null;
  
  constructor() {
    if (Singleton[instance]) {
      return Singleton[instance];
    }
    Singleton[instance] = this;
  }
}
```

**命名空间**
```javascript
const namespace = Symbol('app.namespace');

window[namespace] = {
  config: {},
  utils: {}
};
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** 私有字段实现

### 题目

使用 Symbol 实现真正的私有字段。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
// 方案 1：闭包 + Symbol
function createClass() {
  const privateField = Symbol('private');
  const privateMethod = Symbol('privateMethod');
  
  return class MyClass {
    constructor(value) {
      this[privateField] = value;
    }
    
    [privateMethod]() {
      return this[privateField] * 2;
    }
    
    getDouble() {
      return this[privateMethod]();
    }
    
    getValue() {
      return this[privateField];
    }
    
    setValue(value) {
      this[privateField] = value;
    }
  };
}

const MyClass = createClass();
const instance = new MyClass(10);

console.log(instance.getValue());  // 10
console.log(instance.getDouble());  // 20

// 无法直接访问私有字段
console.log(Object.getOwnPropertySymbols(instance));  // []
```

**方案 2：WeakMap + Symbol**
```javascript
const privateData = new WeakMap();
const privateSymbols = new WeakMap();

class SecureClass {
  constructor(value) {
    // 为每个实例生成唯一的 Symbol
    const symbols = {
      value: Symbol('value'),
      secret: Symbol('secret')
    };
    
    privateSymbols.set(this, symbols);
    
    // 使用 Symbol 存储数据
    this[symbols.value] = value;
    this[symbols.secret] = 'secret';
  }
  
  getValue() {
    const symbols = privateSymbols.get(this);
    return this[symbols.value];
  }
  
  getSecret() {
    const symbols = privateSymbols.get(this);
    return this[symbols.secret];
  }
}

const instance = new SecureClass(42);
console.log(instance.getValue());  // 42

// 无法通过 Symbol 访问
console.log(Object.getOwnPropertySymbols(instance));  // 无法获取内部 Symbol
```

**方案 3：完整的私有API**
```javascript
class PrivateClass {
  static #privateSymbols = new WeakMap();
  
  constructor(data) {
    const symbols = {
      data: Symbol('data'),
      timestamp: Symbol('timestamp')
    };
    
    PrivateClass.#privateSymbols.set(this, symbols);
    
    this[symbols.data] = data;
    this[symbols.timestamp] = Date.now();
  }
  
  static #getSymbols(instance) {
    return this.#privateSymbols.get(instance);
  }
  
  getData() {
    const symbols = PrivateClass.#getSymbols(this);
    return this[symbols.data];
  }
  
  getAge() {
    const symbols = PrivateClass.#getSymbols(this);
    return Date.now() - this[symbols.timestamp];
  }
  
  updateData(newData) {
    const symbols = PrivateClass.#getSymbols(this);
    this[symbols.data] = newData;
  }
}

const instance = new PrivateClass({ value: 42 });
console.log(instance.getData());  // { value: 42 }

setTimeout(() => {
  console.log(instance.getAge());  // 时间差
}, 1000);
```

**方案 4：装饰器模式**
```javascript
function Private(target, key) {
  const symbol = Symbol(key);
  
  Object.defineProperty(target, key, {
    get() {
      return this[symbol];
    },
    set(value) {
      this[symbol] = value;
    },
    enumerable: false,
    configurable: false
  });
}

class MyClass {
  @Private
  secret = 'private';
  
  public = 'public';
}

const instance = new MyClass();
console.log(instance.public);  // "public"
console.log(Object.keys(instance));  // ["public"]
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** Symbol.species

### 题目

`Symbol.species` 的作用是什么？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**Symbol.species 定义派生对象的构造函数**

```javascript
class MyArray extends Array {
  // 默认返回 Array
  static get [Symbol.species]() {
    return Array;
  }
}

const myArr = new MyArray(1, 2, 3);
const mapped = myArr.map(x => x * 2);

console.log(myArr instanceof MyArray);  // true
console.log(mapped instanceof MyArray);  // false
console.log(mapped instanceof Array);   // true
```

**自定义返回类型：**

```javascript
class MyArray extends Array {
  static get [Symbol.species]() {
    return MyArray;  // 返回自身
  }
}

const myArr = new MyArray(1, 2, 3);
const mapped = myArr.map(x => x * 2);

console.log(mapped instanceof MyArray);  // true
```

**实际应用：**

```javascript
class ValidatedArray extends Array {
  static get [Symbol.species]() {
    return ValidatedArray;
  }
  
  push(...items) {
    // 验证
    const validItems = items.filter(item => typeof item === 'number');
    return super.push(...validItems);
  }
}

const arr = new ValidatedArray(1, 2, 3);
const filtered = arr.filter(x => x > 1);

console.log(filtered instanceof ValidatedArray);  // true
filtered.push('invalid', 4);  // 只添加 4
console.log(filtered);  // [2, 3, 4]
```

**Promise 中的应用：**

```javascript
class MyPromise extends Promise {
  static get [Symbol.species]() {
    return MyPromise;
  }
  
  success(callback) {
    return this.then(callback);
  }
}

const promise = MyPromise.resolve(42);
const chained = promise.then(x => x * 2);

console.log(chained instanceof MyPromise);  // true
console.log(chained.success);  // function
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** Symbol 高级特性

### 题目

总结 Symbol 的所有应用场景和最佳实践。

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**Symbol 完整应用指南**

**1. Well-Known Symbols**

```javascript
// Symbol.iterator - 自定义迭代
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  
  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) {
      yield i;
    }
  }
}

// Symbol.asyncIterator - 异步迭代
class AsyncRange {
  *[Symbol.asyncIterator]() {
    for (let i = 0; i < 3; i++) {
      yield Promise.resolve(i);
    }
  }
}

// Symbol.toStringTag - 类型标签
class MyClass {
  get [Symbol.toStringTag]() {
    return 'MyClass';
  }
}

// Symbol.toPrimitive - 类型转换
class Money {
  [Symbol.toPrimitive](hint) {
    return hint === 'number' ? this.cents : this.toString();
  }
}

// Symbol.hasInstance - instanceof 行为
class MyArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance);
  }
}

// Symbol.species - 派生对象构造函数
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array;
  }
}
```

**2. 私有属性**

```javascript
const _private = Symbol('private');

class SecureClass {
  constructor() {
    this[_private] = 'secret';
  }
  
  getPrivate() {
    return this[_private];
  }
}
```

**3. 元数据**

```javascript
const metadata = Symbol.for('metadata');

class Component {
  static [metadata] = {
    version: '1.0',
    author: 'Alice'
  };
}
```

**4. 常量枚举**

```javascript
const Status = Object.freeze({
  PENDING: Symbol('pending'),
  RUNNING: Symbol('running'),
  DONE: Symbol('done')
});
```

**5. 单例模式**

```javascript
const instance = Symbol('instance');

class Singleton {
  static [instance] = null;
  
  constructor() {
    if (Singleton[instance]) {
      return Singleton[instance];
    }
    Singleton[instance] = this;
  }
}
```

**最佳实践：**

```javascript
// ✅ 使用 Symbol.for 跨模块共享
export const TYPE = Symbol.for('app.type');

// ✅ 使用描述便于调试
const sym = Symbol('descriptive name');

// ✅ 集中管理 Symbol
const Symbols = {
  PRIVATE: Symbol('private'),
  METADATA: Symbol('metadata')
};

// ✅ 文档化 Symbol 用途
/**
 * @symbol {Symbol} _cache
 * @private
 * Internal cache storage
 */
const _cache = Symbol('cache');

// ❌ 避免过度使用
// 不要为了用而用，评估是否真的需要
```

</details>

---

**本章总结：**
- ✅ Symbol 基本概念
- ✅ Well-Known Symbols
- ✅ Symbol 特性
- ✅ Symbol.for 全局注册
- ✅ Symbol.toPrimitive
- ✅ Symbol.iterator 高级
- ✅ Symbol 应用场景
- ✅ 私有字段实现
- ✅ Symbol.species
- ✅ Symbol 最佳实践

**下一章：** [第 26 章：共享内存与原子操作](./chapter-26.md)
