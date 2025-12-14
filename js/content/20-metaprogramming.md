# 元编程实践

## 概述

元编程是指编写能够操作程序本身的代码。

理解元编程的关键在于：

- **代码即数据**：程序可以操作、生成其他程序
- **抽象层次**：从"写业务逻辑"到"写生成业务逻辑的逻辑"
- **实用场景**：框架开发、DSL、自动化工具

---

## 一、元编程概念

### 1.1 什么是元编程

**元编程（Metaprogramming）**：程序可以将其他程序（或自身）作为数据来处理、修改或生成。

JavaScript 的元编程能力：

- 动态属性访问
- 原型链操作
- Proxy 和 Reflect
- Symbol 定义内部行为
- 装饰器（提案阶段）

### 1.2 应用场景

- 框架和库开发（Vue、React 的响应式）
- API 封装（自动生成 API 方法）
- 验证和安全（运行时类型检查）
- 日志和监控（自动记录函数调用）
- ORM 和数据访问（动态生成查询）

---

## 二、动态属性访问

### 2.1 计算属性名

```js
const prefix = 'user_';

const obj = {
  [prefix + 'name']: 'Alice',
  [prefix + 'age']: 25,
  [`${prefix}email`]: 'alice@email.com'
};

obj.user_name;   // "Alice"
obj.user_age;    // 25
obj.user_email;  // "alice@email.com"
```

### 2.2 动态方法

```js
// 动态创建 API 方法
function createAPI(endpoints) {
  const api = {};

  endpoints.forEach(endpoint => {
    api[`get${capitalize(endpoint)}`] = function() {
      return fetch(`/api/${endpoint}`);
    };

    api[`post${capitalize(endpoint)}`] = function(data) {
      return fetch(`/api/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    };
  });

  return api;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 使用
const api = createAPI(['users', 'posts', 'comments']);
api.getUsers();    // GET /api/users
api.postPosts({});  // POST /api/posts
```

---

## 三、Proxy 高级应用

### 3.1 懒加载属性

```js
function lazyLoad(obj, props) {
  return new Proxy(obj, {
    get(target, property) {
      if (property in props && !(property in target)) {
        target[property] = props[property]();  // 计算
      }
      return Reflect.get(target, property);
    }
  });
}

// 使用
const user = lazyLoad({
  name: 'Alice'
}, {
  // 只在首次访问时计算
  expensiveData() {
    console.log('计算昂贵数据...');
    return Array(1000).fill(0).map((_, i) => i);
  }
});

user.name;          // "Alice"
user.expensiveData; // 计算昂贵数据... → [0, 1, ...]
user.expensiveData; // 直接返回（已缓存）
```

### 3.2 自动缓存

```js
function memoize(fn) {
  const cache = new Map();

  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);

      if (cache.has(key)) {
        console.log('从缓存返回');
        return cache.get(key);
      }

      console.log('计算结果');
      const result = Reflect.apply(target, thisArg, args);
      cache.set(key, result);
      return result;
    }
  });
}

// 使用
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(10);  // 计算
fibonacci(10);  // 从缓存返回
```

---

## 四、Symbol 元编程

### 4.1 自定义迭代器

```js
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;

    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
}

// 使用
for (const num of new Range(1, 5)) {
  console.log(num);  // 1, 2, 3, 4, 5
}
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
      return `${this.currency}${this.amount}`;
    }
    return this.amount;
  }
}

const money = new Money(100, '$');

+money;          // 100（number）
String(money);   // "$100"（string）
money + 50;      // 150（default → number）
```

### 4.3 对象字符串表示

```js
class Collection {
  get [Symbol.toStringTag]() {
    return 'Collection';
  }
}

const coll = new Collection();
Object.prototype.toString.call(coll);
// "[object Collection]"
```

---

## 五、函数式元编程

### 5.1 高阶函数

```js
function trace(fn) {
  return function(...args) {
    console.log(`调用 ${fn.name}(${args.join(', ')})`);
    const result = fn.apply(this, args);
    console.log(`返回 ${result}`);
    return result;
  };
}

// 使用
const add = trace(function add(a, b) {
  return a + b;
});

add(2, 3);
// 调用 add(2, 3)
// 返回 5
```

### 5.2 函数组合

```js
function compose(...fns) {
  return function(value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}

// 使用
const double = x => x * 2;
const addOne = x => x + 1;
const square = x => x * x;

const transform = compose(square, addOne, double);

transform(3);
// 3 → double → 6 → addOne → 7 → square → 49
```

---

## 六、最佳实践

1. **不要过度元编程**：可读性优先。
2. **明确抽象边界**：元编程适合框架层，不适合业务层。
3. **性能考虑**：Proxy 有开销，不要滥用。
4. **测试要充分**：元编程代码更难调试。
5. **文档要清晰**：解释"魔法"背后的机制。

---

## 参考资料

- [ECMAScript - Proxy](https://tc39.es/ecma262/#sec-proxy-objects)
- [ECMAScript - Reflect](https://tc39.es/ecma262/#sec-reflect-object)
- [MDN - Metaprogramming](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Meta_programming)
