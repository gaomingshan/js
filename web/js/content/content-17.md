# 高阶函数与函数式编程

> 掌握函数式编程的核心技术

---

## 概述

高阶函数（Higher-Order Function）是接收函数作为参数或返回函数的函数。函数式编程强调函数的组合、纯函数、不可变性等概念。

本章将深入：
- 高阶函数的定义与应用
- 常用高阶函数（map、filter、reduce）
- 函数组合与管道
- 柯里化与偏函数
- 纯函数与副作用
- 函数式编程实践

---

## 1. 高阶函数

### 1.1 定义

**高阶函数**：满足以下至少一个条件的函数：
1. 接收一个或多个函数作为参数
2. 返回一个函数

```javascript
// 接收函数作为参数
function executeOperation(fn, value) {
  return fn(value);
}

const double = x => x * 2;
console.log(executeOperation(double, 5));  // 10

// 返回函数
function createMultiplier(factor) {
  return function(x) {
    return x * factor;
  };
}

const triple = createMultiplier(3);
console.log(triple(5));  // 15
```

### 1.2 为什么使用高阶函数

```javascript
// 代码复用
function repeat(n, action) {
  for (let i = 0; i < n; i++) {
    action(i);
  }
}

repeat(3, console.log);
// 0
// 1
// 2

repeat(5, i => console.log(`Item ${i}`));
// Item 0
// Item 1
// ...

// 抽象控制流
function unless(condition, then) {
  if (!condition) then();
}

unless(false, () => console.log("Executed"));  // "Executed"
unless(true, () => console.log("Not executed"));
```

---

## 2. 数组的高阶方法

### 2.1 map()

```javascript
const numbers = [1, 2, 3, 4, 5];

// 基本用法
const doubled = numbers.map(x => x * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// 完整签名
const result = numbers.map((value, index, array) => {
  return value * index;
});
console.log(result);  // [0, 2, 6, 12, 20]

// 提取对象属性
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 }
];

const names = users.map(user => user.name);
console.log(names);  // ["Alice", "Bob"]

// 链式调用
const result = numbers
  .map(x => x * 2)
  .map(x => x + 1)
  .map(x => `#${x}`);
console.log(result);  // ["#3", "#5", "#7", "#9", "#11"]
```

### 2.2 filter()

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 基本用法
const evens = numbers.filter(x => x % 2 === 0);
console.log(evens);  // [2, 4, 6, 8, 10]

// 完整签名
const result = numbers.filter((value, index, array) => {
  return value > 5 && index < 8;
});
console.log(result);  // [6, 7, 8]

// 过滤对象
const users = [
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 30, active: false },
  { name: "Charlie", age: 35, active: true }
];

const activeUsers = users.filter(user => user.active);
console.log(activeUsers);
// [{ name: "Alice", ... }, { name: "Charlie", ... }]

// 结合 map
const activeNames = users
  .filter(user => user.active)
  .map(user => user.name);
console.log(activeNames);  // ["Alice", "Charlie"]
```

### 2.3 reduce()

```javascript
const numbers = [1, 2, 3, 4, 5];

// 基本用法：求和
const sum = numbers.reduce((acc, curr) => acc + curr, 0);
console.log(sum);  // 15

// 求积
const product = numbers.reduce((acc, curr) => acc * curr, 1);
console.log(product);  // 120

// 完整签名
const result = numbers.reduce((accumulator, currentValue, index, array) => {
  return accumulator + currentValue * index;
}, 0);
console.log(result);  // 40

// 无初始值（使用第一个元素）
const sum2 = numbers.reduce((acc, curr) => acc + curr);
console.log(sum2);  // 15

// 计数
const fruits = ["apple", "banana", "apple", "orange", "banana", "apple"];
const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log(count);  // { apple: 3, banana: 2, orange: 1 }

// 扁平化数组
const nested = [[1, 2], [3, 4], [5, 6]];
const flat = nested.reduce((acc, arr) => acc.concat(arr), []);
console.log(flat);  // [1, 2, 3, 4, 5, 6]

// 分组
const people = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 25 }
];

const grouped = people.reduce((acc, person) => {
  const key = person.age;
  if (!acc[key]) acc[key] = [];
  acc[key].push(person);
  return acc;
}, {});
console.log(grouped);
// {
//   25: [{ name: "Alice", age: 25 }, { name: "Charlie", age: 25 }],
//   30: [{ name: "Bob", age: 30 }]
// }
```

### 2.4 其他高阶方法

```javascript
const numbers = [1, 2, 3, 4, 5];

// find()：找到第一个满足条件的元素
const found = numbers.find(x => x > 3);
console.log(found);  // 4

// findIndex()：找到第一个满足条件的元素的索引
const index = numbers.findIndex(x => x > 3);
console.log(index);  // 3

// every()：所有元素都满足条件
const allPositive = numbers.every(x => x > 0);
console.log(allPositive);  // true

const allEven = numbers.every(x => x % 2 === 0);
console.log(allEven);  // false

// some()：至少一个元素满足条件
const hasEven = numbers.some(x => x % 2 === 0);
console.log(hasEven);  // true

// forEach()：遍历（无返回值）
numbers.forEach((value, index) => {
  console.log(`${index}: ${value}`);
});

// sort()：排序（会修改原数组）
const unsorted = [3, 1, 4, 1, 5, 9];
const sorted = [...unsorted].sort((a, b) => a - b);
console.log(sorted);  // [1, 1, 3, 4, 5, 9]
console.log(unsorted);  // [3, 1, 4, 1, 5, 9]（未改变）
```

---

## 3. 函数组合

### 3.1 基本概念

```javascript
// 函数组合：将多个函数组合成一个函数
const add1 = x => x + 1;
const double = x => x * 2;
const square = x => x ** 2;

// 手动组合
const result = square(double(add1(5)));
console.log(result);  // 144

// compose：从右到左执行
function compose(...fns) {
  return function(value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}

const calculate = compose(square, double, add1);
console.log(calculate(5));  // 144

// pipe：从左到右执行（更直观）
function pipe(...fns) {
  return function(value) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}

const calculate2 = pipe(add1, double, square);
console.log(calculate2(5));  // 144
```

### 3.2 实际应用

```javascript
// 数据处理管道
const users = [
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 30, active: false },
  { name: "Charlie", age: 35, active: true },
  { name: "David", age: 28, active: true }
];

const getActiveUserNames = pipe(
  users => users.filter(u => u.active),
  users => users.map(u => u.name),
  names => names.map(n => n.toUpperCase())
);

console.log(getActiveUserNames(users));
// ["ALICE", "CHARLIE", "DAVID"]

// 文本处理
const processText = pipe(
  str => str.trim(),
  str => str.toLowerCase(),
  str => str.replace(/\s+/g, '-'),
  str => str.replace(/[^\w-]/g, '')
);

console.log(processText("  Hello World! 123  "));
// "hello-world-123"
```

### 3.3 支持多参数的 compose

```javascript
function compose(...fns) {
  return fns.reduce((f, g) => (...args) => f(g(...args)));
}

const add = (a, b) => a + b;
const multiply = (a, b) => a * b;
const subtract = (a, b) => a - b;

// (5 + 3) * 2 - 1
const calculate = pipe(
  (a, b) => add(a, b),
  result => multiply(result, 2),
  result => subtract(result, 1)
);

console.log(calculate(5, 3));  // 15
```

---

## 4. 柯里化（Currying）

### 4.1 基本概念

```javascript
// 普通函数
function add(a, b, c) {
  return a + b + c;
}

console.log(add(1, 2, 3));  // 6

// 柯里化函数
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

console.log(curriedAdd(1)(2)(3));  // 6

// 箭头函数版本（更简洁）
const curriedAdd2 = a => b => c => a + b + c;
console.log(curriedAdd2(1)(2)(3));  // 6
```

### 4.2 通用柯里化函数

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      // 参数够了，执行函数
      return fn.apply(this, args);
    } else {
      // 参数不够，返回新函数
      return function(...moreArgs) {
        return curried.apply(this, args.concat(moreArgs));
      };
    }
  };
}

// 使用
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3));    // 6
console.log(curriedAdd(1, 2)(3));    // 6
console.log(curriedAdd(1)(2, 3));    // 6
console.log(curriedAdd(1, 2, 3));    // 6
```

### 4.3 实际应用

```javascript
// 配置函数
const log = curry((level, message, timestamp) => {
  console.log(`[${timestamp}] ${level}: ${message}`);
});

const logError = log("ERROR");
const logInfo = log("INFO");

logError("Database connection failed", "2024-01-01 10:00:00");
logInfo("User logged in", "2024-01-01 10:01:00");

// 数据处理
const map = curry((fn, array) => array.map(fn));
const filter = curry((fn, array) => array.filter(fn));

const double = x => x * 2;
const isEven = x => x % 2 === 0;

const doubleAll = map(double);
const filterEvens = filter(isEven);

const numbers = [1, 2, 3, 4, 5];
console.log(doubleAll(numbers));      // [2, 4, 6, 8, 10]
console.log(filterEvens(numbers));    // [2, 4]

// 组合使用
const processNumbers = pipe(
  filterEvens,
  doubleAll
);

console.log(processNumbers(numbers)); // [4, 8]

// 事件处理
const on = curry((event, element, handler) => {
  element.addEventListener(event, handler);
});

const onClick = on("click");
const onHover = on("mouseenter");

// onClick(button, handleClick);
// onHover(element, handleHover);
```

---

## 5. 偏函数（Partial Application）

### 5.1 基本概念

```javascript
// 偏函数：固定部分参数
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

function greet(greeting, name, punctuation) {
  return `${greeting}, ${name}${punctuation}`;
}

const sayHello = partial(greet, "Hello");
console.log(sayHello("Alice", "!"));  // "Hello, Alice!"
console.log(sayHello("Bob", "."));    // "Hello, Bob."

const sayHelloExcited = partial(greet, "Hello", "Charlie");
console.log(sayHelloExcited("!!!"));  // "Hello, Charlie!!!"
```

### 5.2 柯里化 vs 偏函数

```javascript
// 柯里化：将多参数函数转为单参数函数链
const curriedAdd = a => b => c => a + b + c;
curriedAdd(1)(2)(3);

// 偏函数：固定部分参数，返回接受剩余参数的函数
const add = (a, b, c) => a + b + c;
const add1 = partial(add, 1);
add1(2, 3);  // 6

// 柯里化自动支持偏应用
const curriedAdd = curry(add);
const add1 = curriedAdd(1);        // 偏应用
const add1and2 = curriedAdd(1, 2); // 偏应用
add1and2(3);  // 6
```

### 5.3 占位符偏函数

```javascript
const _ = Symbol('placeholder');

function partialWithPlaceholder(fn, ...presetArgs) {
  return function(...laterArgs) {
    const args = [...presetArgs];
    let laterIndex = 0;
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === _) {
        args[i] = laterArgs[laterIndex++];
      }
    }
    
    return fn(...args, ...laterArgs.slice(laterIndex));
  };
}

function greet(greeting, name, punctuation) {
  return `${greeting}, ${name}${punctuation}`;
}

const greetAlice = partialWithPlaceholder(greet, _, "Alice");
console.log(greetAlice("Hello", "!"));  // "Hello, Alice!"
console.log(greetAlice("Hi", "."));     // "Hi, Alice."

const excitedGreet = partialWithPlaceholder(greet, _, _, "!!!");
console.log(excitedGreet("Hello", "Bob"));  // "Hello, Bob!!!"
```

---

## 6. 纯函数

### 6.1 定义

**纯函数**满足两个条件：
1. 相同输入总是产生相同输出
2. 没有副作用

```javascript
// ✅ 纯函数
function add(a, b) {
  return a + b;
}

console.log(add(2, 3));  // 5
console.log(add(2, 3));  // 5（总是相同）

// ❌ 非纯函数（依赖外部状态）
let factor = 2;
function multiply(x) {
  return x * factor;  // 依赖外部变量
}

console.log(multiply(5));  // 10
factor = 3;
console.log(multiply(5));  // 15（输出改变）

// ❌ 非纯函数（有副作用）
const numbers = [];
function addNumber(num) {
  numbers.push(num);  // 修改外部状态
  return numbers;
}

// ❌ 非纯函数（不确定性）
function getRandom() {
  return Math.random();  // 每次不同
}

function getTime() {
  return Date.now();  // 每次不同
}
```

### 6.2 纯函数的优点

```javascript
// 1. 可测试性
function add(a, b) {
  return a + b;
}

// 测试简单
console.assert(add(2, 3) === 5);
console.assert(add(-1, 1) === 0);

// 2. 可缓存性
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalculation = memoize(function(n) {
  console.log(`Calculating for ${n}`);
  let result = 0;
  for (let i = 0; i < n; i++) {
    result += i;
  }
  return result;
});

console.log(expensiveCalculation(1000));  // "Calculating for 1000" → 499500
console.log(expensiveCalculation(1000));  // 499500（从缓存返回）

// 3. 并行执行
// 纯函数可以安全地并行执行，无需担心竞态条件
```

### 6.3 副作用

```javascript
// 常见副作用：
// 1. 修改全局变量
let count = 0;
function increment() {
  count++;  // 副作用
}

// 2. 修改参数
function addToArray(arr, item) {
  arr.push(item);  // 副作用
  return arr;
}

// ✅ 无副作用版本
function addToArray(arr, item) {
  return [...arr, item];  // 返回新数组
}

// 3. I/O 操作
function saveToFile(data) {
  fs.writeFileSync('data.txt', data);  // 副作用
}

// 4. 网络请求
function fetchData(url) {
  return fetch(url);  // 副作用
}

// 5. DOM 操作
function updateTitle(title) {
  document.title = title;  // 副作用
}

// 注意：副作用不可避免，但应该：
// - 隔离副作用（放在边界）
// - 明确标识有副作用的函数
// - 尽可能使用纯函数
```

---

## 7. 不可变性

### 7.1 避免修改原数据

```javascript
// ❌ 修改原数组
const numbers = [1, 2, 3];
numbers.push(4);  // 修改原数组

// ✅ 返回新数组
const numbers = [1, 2, 3];
const newNumbers = [...numbers, 4];  // 不修改原数组

// ❌ 修改原对象
const user = { name: "Alice", age: 25 };
user.age = 26;  // 修改原对象

// ✅ 返回新对象
const user = { name: "Alice", age: 25 };
const updatedUser = { ...user, age: 26 };  // 不修改原对象
```

### 7.2 不可变数据操作

```javascript
// 数组操作
const numbers = [1, 2, 3, 4, 5];

// 添加
const added = [...numbers, 6];  // [1, 2, 3, 4, 5, 6]

// 删除
const removed = numbers.filter(x => x !== 3);  // [1, 2, 4, 5]

// 更新
const updated = numbers.map(x => x === 3 ? 30 : x);  // [1, 2, 30, 4, 5]

// 对象操作
const user = {
  name: "Alice",
  age: 25,
  address: {
    city: "Beijing",
    country: "China"
  }
};

// 更新顶层属性
const updated1 = { ...user, age: 26 };

// 更新嵌套属性
const updated2 = {
  ...user,
  address: {
    ...user.address,
    city: "Shanghai"
  }
};

// 删除属性
const { age, ...rest } = user;
console.log(rest);  // { name: "Alice", address: {...} }
```

### 7.3 深度不可变更新

```javascript
// 手动实现
function updateNested(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  const result = { ...obj };
  let current = result;
  
  for (let key of keys) {
    current[key] = { ...current[key] };
    current = current[key];
  }
  
  current[lastKey] = value;
  return result;
}

const user = {
  name: "Alice",
  profile: {
    email: "alice@example.com",
    settings: {
      theme: "dark"
    }
  }
};

const updated = updateNested(user, "profile.settings.theme", "light");
console.log(updated.profile.settings.theme);  // "light"
console.log(user.profile.settings.theme);     // "dark"（未改变）

// 使用 Immer 库（推荐）
// import { produce } from 'immer';
// 
// const updated = produce(user, draft => {
//   draft.profile.settings.theme = "light";
// });
```

---

## 8. 函数式工具库

### 8.1 常用工具函数

```javascript
// identity：返回参数本身
const identity = x => x;

// constant：返回常量函数
const constant = x => () => x;
const always5 = constant(5);
console.log(always5());  // 5

// noop：空函数
const noop = () => {};

// once：只执行一次
function once(fn) {
  let called = false;
  let result;
  
  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

const initialize = once(() => {
  console.log("Initializing...");
  return { initialized: true };
});

initialize();  // "Initializing..."
initialize();  // 不输出（不再执行）

// flip：翻转参数顺序
const flip = fn => (a, b) => fn(b, a);

const divide = (a, b) => a / b;
const flippedDivide = flip(divide);

console.log(divide(10, 2));         // 5
console.log(flippedDivide(10, 2));  // 0.2
```

### 8.2 函数式编程库

```javascript
// Lodash/FP
// import _ from 'lodash/fp';
// 
// const processUsers = _.flow([
//   _.filter(user => user.active),
//   _.map(user => user.name),
//   _.map(_.toUpper),
//   _.take(5)
// ]);

// Ramda
// import R from 'ramda';
// 
// const processUsers = R.pipe(
//   R.filter(R.prop('active')),
//   R.map(R.prop('name')),
//   R.map(R.toUpper),
//   R.take(5)
// );
```

---

## 9. 工程实践

### 9.1 数据转换管道

```javascript
// API 响应处理
const processApiResponse = pipe(
  response => response.data,
  data => data.filter(item => item.status === 'active'),
  items => items.map(item => ({
    id: item.id,
    name: item.name,
    createdAt: new Date(item.created_at)
  })),
  items => items.sort((a, b) => b.createdAt - a.createdAt)
);

// 使用
// const processed = processApiResponse(apiResponse);
```

### 9.2 配置管理

```javascript
// 柯里化配置
const createLogger = curry((level, prefix, message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] [${prefix}] ${message}`);
});

const appLogger = createLogger('INFO', 'APP');
const dbLogger = createLogger('DEBUG', 'DB');

appLogger('Application started');
dbLogger('Connection established');
```

### 9.3 React 中的函数式编程

```javascript
// 高阶组件
const withLoading = Component => props => {
  if (props.loading) {
    return <div>Loading...</div>;
  }
  return <Component {...props} />;
};

const UserList = ({ users }) => (
  <ul>
    {users.map(user => <li key={user.id}>{user.name}</li>)}
  </ul>
);

const UserListWithLoading = withLoading(UserList);

// Hooks
const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
};
```

---

## 关键要点

1. **高阶函数**
   - 接收函数作为参数
   - 返回函数
   - 代码复用和抽象

2. **常用高阶方法**
   - map：转换
   - filter：过滤
   - reduce：聚合
   - 链式调用

3. **函数组合**
   - compose：从右到左
   - pipe：从左到右
   - 构建数据处理管道

4. **柯里化与偏函数**
   - 柯里化：单参数函数链
   - 偏函数：固定部分参数
   - 提高函数复用性

5. **纯函数**
   - 相同输入相同输出
   - 无副作用
   - 可测试、可缓存

6. **不可变性**
   - 不修改原数据
   - 返回新数据
   - 避免副作用

---

## 深入一点

### Transducer（转换器）

```javascript
// 高效的数据转换
const map = fn => reducer => (acc, val) => reducer(acc, fn(val));
const filter = pred => reducer => (acc, val) => 
  pred(val) ? reducer(acc, val) : acc;

const transduce = (xform, reducer, initial, collection) => {
  const transformedReducer = xform(reducer);
  return collection.reduce(transformedReducer, initial);
};

// 使用
const double = x => x * 2;
const isEven = x => x % 2 === 0;

const xform = pipe(
  filter(isEven),
  map(double)
);

const result = transduce(
  xform,
  (acc, val) => [...acc, val],
  [],
  [1, 2, 3, 4, 5]
);
console.log(result);  // [4, 8]
```

---

## 参考资料

- [MDN: Array methods](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [Functional Programming in JavaScript](https://github.com/getify/Functional-Light-JS)
- [Professor Frisby's Mostly Adequate Guide to Functional Programming](https://mostly-adequate.gitbook.io/mostly-adequate-guide/)

---

**上一章**：[函数基础与特性](./content-16.md)  
**下一章**：[函数式编程进阶](./content-18.md)
