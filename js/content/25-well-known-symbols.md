# Well-Known Symbols

## 概述

Well-Known Symbols 是语言内置的特殊 Symbol，用于自定义对象的内部行为。

理解 Well-Known Symbols 的关键在于：

- **内置行为自定义**：覆盖对象的默认行为
- **统一接口**：提供标准化的钩子
- **协议实现**：实现迭代器、转换等协议

---

## 一、常用 Well-Known Symbols

### 1.1 Symbol.iterator

```js
// 自定义迭代行为
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from;
    return {
      next: () => {
        if (current <= this.to) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
};

for (const num of range) {
  console.log(num);  // 1, 2, 3, 4, 5
}

// 解构、扩展运算符也会使用 Symbol.iterator
const arr = [...range];  // [1, 2, 3, 4, 5]
```

### 1.2 Symbol.toStringTag

```js
// 自定义 toString 输出
class MyClass {
  get [Symbol.toStringTag]() {
    return 'MyClass';
  }
}

const obj = new MyClass();
console.log(obj.toString());                    // "[object MyClass]"
console.log(Object.prototype.toString.call(obj)); // "[object MyClass]"

// 内置类型的 toStringTag
console.log(Object.prototype.toString.call([]));      // "[object Array]"
console.log(Object.prototype.toString.call(new Map())); // "[object Map]"
```

### 1.3 Symbol.toPrimitive

```js
// 自定义类型转换
const obj = {
  value: 100,

  [Symbol.toPrimitive](hint) {
    console.log('hint:', hint);
    if (hint === 'number') return this.value;
    if (hint === 'string') return `Value: ${this.value}`;
    return this.value;
  }
};

console.log(+obj);       // hint: number → 100
console.log(`${obj}`);   // hint: string → "Value: 100"
console.log(obj + 10);   // hint: default → 110
```

---

## 二、其他 Well-Known Symbols

### 2.1 Symbol.hasInstance

```js
// 自定义 instanceof 行为
class MyArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance);
  }
}

console.log([] instanceof MyArray);        // true
console.log([1, 2] instanceof MyArray);    // true
console.log({} instanceof MyArray);        // false
```

### 2.2 Symbol.species

```js
// 控制派生对象的构造函数
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

### 2.3 Symbol.isConcatSpreadable

```js
// 控制 concat 行为
const arr = [1, 2];
const obj = {
  0: 3,
  1: 4,
  length: 2,
  [Symbol.isConcatSpreadable]: true
};

console.log(arr.concat(obj));  // [1, 2, 3, 4]

// 禁止数组展开
const arr2 = [5, 6];
arr2[Symbol.isConcatSpreadable] = false;
console.log(arr.concat(arr2));  // [1, 2, [5, 6]]
```

### 2.4 Symbol.match / Symbol.search / Symbol.split / Symbol.replace

```js
// 自定义字符串方法行为
class MyMatcher {
  constructor(pattern) {
    this.pattern = pattern;
  }

  [Symbol.match](str) {
    const index = str.indexOf(this.pattern);
    return index !== -1 ? [this.pattern] : null;
  }

  [Symbol.search](str) {
    return str.indexOf(this.pattern);
  }
}

const matcher = new MyMatcher('test');
console.log('testing'.match(matcher));   // ['test']
console.log('testing'.search(matcher));  // 0
```

### 2.5 Symbol.unscopables

```js
// 控制 with 语句的作用域
const obj = {
  a: 1,
  b: 2,
  [Symbol.unscopables]: {
    b: true  // b 不会出现在 with 作用域中
  }
};

with (obj) {
  console.log(a);  // 1
  console.log(b);  // ReferenceError（如果外部没有 b）
}
```

---

## 三、完整列表

```js
// 所有 Well-Known Symbols
Symbol.asyncIterator      // 异步迭代器
Symbol.hasInstance        // instanceof 行为
Symbol.isConcatSpreadable // concat 展开行为
Symbol.iterator           // 迭代器
Symbol.match              // match() 行为
Symbol.matchAll           // matchAll() 行为
Symbol.replace            // replace() 行为
Symbol.search             // search() 行为
Symbol.species            // 派生对象构造函数
Symbol.split              // split() 行为
Symbol.toPrimitive        // 类型转换
Symbol.toStringTag        // toString() 输出
Symbol.unscopables        // with 语句作用域
```

---

## 四、实际应用

### 4.1 自定义迭代器

```js
class Fibonacci {
  constructor(max) {
    this.max = max;
  }

  [Symbol.iterator]() {
    let [prev, curr] = [0, 1];
    let count = 0;
    const max = this.max;

    return {
      next() {
        if (count++ < max) {
          [prev, curr] = [curr, prev + curr];
          return { value: prev, done: false };
        }
        return { done: true };
      }
    };
  }
}

const fib = new Fibonacci(10);
console.log([...fib]);  // [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
```

### 4.2 自定义类型转换

```js
class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === 'number') {
      return this.amount;
    }
    if (hint === 'string') {
      return `${this.currency} ${this.amount}`;
    }
    return this.amount;
  }

  get [Symbol.toStringTag]() {
    return 'Money';
  }
}

const price = new Money(100, 'USD');
console.log(+price);                // 100
console.log(`${price}`);            // "USD 100"
console.log(price.toString());      // "[object Money]"
```

---

## 五、最佳实践

1. **合理使用**：不要过度自定义，保持行为的可预测性。
2. **保持一致**：自定义行为应符合预期和语义。
3. **文档化**：清楚说明自定义行为的含义。
4. **性能考虑**：某些 Symbol 方法会频繁调用。
5. **兼容性**：检查环境是否支持。

---

## 参考资料

- [ECMAScript - Well-Known Symbols](https://tc39.es/ecma262/#sec-well-known-symbols)
- [MDN - Well-known symbols](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol#well-known_symbols)
