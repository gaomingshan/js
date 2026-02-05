# 函数基础与特性

> 理解 JavaScript 函数的核心概念

---

## 概述

函数是 JavaScript 的一等公民（First-Class Citizen）。理解函数的特性、参数处理、返回值机制，是掌握 JavaScript 的关键。

本章将深入：
- 函数的定义方式
- 函数参数处理
- arguments 对象
- 剩余参数与展开运算符
- 默认参数
- 函数的 name 和 length 属性

---

## 1. 函数的定义方式

### 1.1 函数声明

```javascript
function add(a, b) {
  return a + b;
}

console.log(add(1, 2));  // 3

// 特点：函数提升
console.log(subtract(5, 3));  // 2

function subtract(a, b) {
  return a - b;
}
```

### 1.2 函数表达式

```javascript
// 匿名函数表达式
const add = function(a, b) {
  return a + b;
};

// 命名函数表达式
const multiply = function mult(a, b) {
  return a * b;
};

console.log(multiply.name);  // "mult"

// 特点：不提升
console.log(divide(10, 2));  // ❌ ReferenceError

const divide = function(a, b) {
  return a / b;
};
```

### 1.3 箭头函数

```javascript
// 基本语法
const add = (a, b) => a + b;

// 单参数可省略括号
const double = x => x * 2;

// 无参数需要括号
const getRandom = () => Math.random();

// 多行需要花括号和 return
const complex = (a, b) => {
  const sum = a + b;
  const product = a * b;
  return { sum, product };
};

// 返回对象字面量需要加括号
const createPerson = (name, age) => ({ name, age });
```

### 1.4 Function 构造函数

```javascript
// 不推荐（性能差、不安全）
const add = new Function('a', 'b', 'return a + b');

console.log(add(1, 2));  // 3

// 问题：
// 1. 每次执行都要解析字符串
// 2. 无法访问局部作用域
// 3. 安全风险（类似 eval）
```

### 1.5 方法定义

```javascript
const obj = {
  // ES5 方式
  method1: function() {
    console.log("method1");
  },
  
  // ES6 简写
  method2() {
    console.log("method2");
  },
  
  // 箭头函数（注意 this）
  method3: () => {
    console.log("method3");
  }
};
```

---

## 2. 函数是一等公民

### 2.1 赋值给变量

```javascript
function greet(name) {
  return `Hello, ${name}`;
}

const sayHello = greet;  // 函数赋值给变量
console.log(sayHello("Alice"));  // "Hello, Alice"
```

### 2.2 作为参数传递

```javascript
function execute(fn, value) {
  return fn(value);
}

function double(x) {
  return x * 2;
}

console.log(execute(double, 5));  // 10
```

### 2.3 作为返回值

```javascript
function createMultiplier(factor) {
  return function(x) {
    return x * factor;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

### 2.4 存储在数据结构中

```javascript
const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
};

console.log(operations.add(10, 5));      // 15
console.log(operations.multiply(10, 5)); // 50

// 数组中的函数
const functions = [
  x => x + 1,
  x => x * 2,
  x => x ** 2
];

const result = functions.reduce((value, fn) => fn(value), 5);
console.log(result);  // ((5 + 1) * 2) ** 2 = 144
```

---

## 3. 函数参数

### 3.1 形参与实参

```javascript
function greet(name, greeting) {  // name, greeting 是形参
  console.log(`${greeting}, ${name}`);
}

greet("Alice", "Hello");  // "Alice", "Hello" 是实参
```

### 3.2 参数传递

**基本类型：按值传递**

```javascript
function changeValue(x) {
  x = 10;
}

let num = 5;
changeValue(num);
console.log(num);  // 5（未改变）
```

**引用类型：按引用传递（引用的副本）**

```javascript
function changeProperty(obj) {
  obj.name = "Bob";  // 修改对象属性
}

function reassignObject(obj) {
  obj = { name: "Charlie" };  // 重新赋值
}

const person = { name: "Alice" };

changeProperty(person);
console.log(person.name);  // "Bob"（属性被修改）

reassignObject(person);
console.log(person.name);  // "Bob"（对象未被重新赋值）
```

### 3.3 参数数量不匹配

```javascript
function add(a, b) {
  console.log(`a: ${a}, b: ${b}`);
  return a + b;
}

// 参数少于形参
console.log(add(1));  // a: 1, b: undefined → NaN

// 参数多于形参
console.log(add(1, 2, 3, 4));  // a: 1, b: 2 → 3（多余参数被忽略）

// 严格检查参数数量
function strictAdd(a, b) {
  if (arguments.length !== 2) {
    throw new Error(`Expected 2 arguments, got ${arguments.length}`);
  }
  return a + b;
}
```

---

## 4. arguments 对象

### 4.1 基本用法

```javascript
function sum() {
  console.log(arguments);  // [Arguments] { '0': 1, '1': 2, '2': 3 }
  console.log(arguments.length);  // 3
  console.log(arguments[0]);      // 1
  
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

console.log(sum(1, 2, 3));  // 6
```

### 4.2 arguments 的特性

```javascript
function test(a, b) {
  console.log(Array.isArray(arguments));  // false（类数组对象）
  console.log(arguments instanceof Array); // false
  
  // 有 length 属性
  console.log(arguments.length);  // 实参个数
  
  // 可以通过索引访问
  console.log(arguments[0]);
  
  // 没有数组方法
  console.log(arguments.map);  // undefined
}

test(1, 2, 3);
```

### 4.3 arguments 与形参的绑定

```javascript
// 非严格模式：arguments 与形参绑定
function test(a) {
  console.log(a, arguments[0]);  // 1, 1
  
  a = 10;
  console.log(a, arguments[0]);  // 10, 10（同步改变）
  
  arguments[0] = 20;
  console.log(a, arguments[0]);  // 20, 20（同步改变）
}

test(1);

// 严格模式：不绑定
function strictTest(a) {
  "use strict";
  console.log(a, arguments[0]);  // 1, 1
  
  a = 10;
  console.log(a, arguments[0]);  // 10, 1（不同步）
}

strictTest(1);
```

### 4.4 转换为真正的数组

```javascript
function sum() {
  // 方式 1：Array.prototype.slice.call()
  const args1 = Array.prototype.slice.call(arguments);
  
  // 方式 2：Array.from()
  const args2 = Array.from(arguments);
  
  // 方式 3：展开运算符
  const args3 = [...arguments];
  
  return args3.reduce((acc, val) => acc + val, 0);
}

console.log(sum(1, 2, 3, 4));  // 10
```

### 4.5 箭头函数没有 arguments

```javascript
const sum = () => {
  console.log(arguments);  // ❌ ReferenceError: arguments is not defined
};

// 外层函数的 arguments
function outer() {
  const inner = () => {
    console.log(arguments);  // 访问 outer 的 arguments
  };
  inner();
}

outer(1, 2, 3);  // [Arguments] { '0': 1, '1': 2, '2': 3 }
```

---

## 5. 剩余参数（Rest Parameters）

### 5.1 基本用法

```javascript
function sum(...numbers) {
  console.log(Array.isArray(numbers));  // true（真正的数组）
  return numbers.reduce((acc, val) => acc + val, 0);
}

console.log(sum(1, 2, 3, 4));  // 10

// 箭头函数也支持
const multiply = (...nums) => nums.reduce((acc, val) => acc * val, 1);
console.log(multiply(2, 3, 4));  // 24
```

### 5.2 与其他参数结合

```javascript
function greet(greeting, ...names) {
  return `${greeting}, ${names.join(' and ')}!`;
}

console.log(greet("Hello", "Alice", "Bob", "Charlie"));
// "Hello, Alice and Bob and Charlie!"

// ❌ 剩余参数必须是最后一个参数
function invalid(...args, last) {  // SyntaxError
  // ...
}

// ❌ 只能有一个剩余参数
function invalid(...args1, ...args2) {  // SyntaxError
  // ...
}
```

### 5.3 剩余参数 vs arguments

```javascript
// arguments
function oldWay() {
  const args = Array.from(arguments);
  return args.reduce((acc, val) => acc + val, 0);
}

// 剩余参数（推荐）
function newWay(...args) {
  return args.reduce((acc, val) => acc + val, 0);
}

// 优点：
// 1. 真正的数组，有所有数组方法
// 2. 更清晰的语法
// 3. 箭头函数可用
// 4. 严格模式友好
```

---

## 6. 展开运算符（Spread Operator）

### 6.1 函数调用

```javascript
const numbers = [1, 2, 3, 4, 5];

// 传统方式
console.log(Math.max.apply(null, numbers));  // 5

// 展开运算符
console.log(Math.max(...numbers));  // 5

function sum(a, b, c) {
  return a + b + c;
}

const args = [1, 2, 3];
console.log(sum(...args));  // 6
```

### 6.2 与剩余参数的区别

```javascript
// 展开：将数组"展开"为独立参数
function sum(a, b, c) {
  return a + b + c;
}
const nums = [1, 2, 3];
sum(...nums);  // 展开：sum(1, 2, 3)

// 剩余：将多个参数"收集"为数组
function collect(...args) {
  console.log(args);  // [1, 2, 3]
}
collect(1, 2, 3);  // 收集：args = [1, 2, 3]
```

---

## 7. 默认参数

### 7.1 基本用法

```javascript
function greet(name = "Guest") {
  console.log(`Hello, ${name}`);
}

greet("Alice");  // "Hello, Alice"
greet();         // "Hello, Guest"
greet(undefined);  // "Hello, Guest"
greet(null);     // "Hello, null"（null 不触发默认值）
```

### 7.2 默认参数表达式

```javascript
// 默认参数可以是表达式
function createUser(name, id = Date.now()) {
  return { name, id };
}

console.log(createUser("Alice"));  // { name: 'Alice', id: 1234567890 }

// 默认参数可以引用其他参数
function greet(name, greeting = `Hello, ${name}`) {
  console.log(greeting);
}

greet("Alice");  // "Hello, Alice"

// 默认参数可以调用函数
function getDefaultName() {
  return "Guest";
}

function greet(name = getDefaultName()) {
  console.log(`Hello, ${name}`);
}

greet();  // "Hello, Guest"
```

### 7.3 默认参数的作用域

```javascript
let x = 1;

function test(a = x) {
  let x = 2;  // 内部变量
  console.log(a);
}

test();  // 1（默认参数使用外部 x）

// 默认参数不能引用函数体内的变量
function test(a = b) {  // ❌ ReferenceError
  let b = 2;
  console.log(a);
}
```

### 7.4 默认参数与解构

```javascript
function createUser({ name = "Guest", age = 0 } = {}) {
  return { name, age };
}

console.log(createUser());                    // { name: 'Guest', age: 0 }
console.log(createUser({ name: "Alice" }));   // { name: 'Alice', age: 0 }
console.log(createUser({ age: 25 }));         // { name: 'Guest', age: 25 }

// 数组解构
function sum([a = 0, b = 0] = []) {
  return a + b;
}

console.log(sum());        // 0
console.log(sum([1]));     // 1
console.log(sum([1, 2]));  // 3
```

---

## 8. 函数的属性

### 8.1 name 属性

```javascript
// 函数声明
function foo() {}
console.log(foo.name);  // "foo"

// 函数表达式
const bar = function() {};
console.log(bar.name);  // "bar"

// 命名函数表达式
const baz = function qux() {};
console.log(baz.name);  // "qux"

// 箭头函数
const arrow = () => {};
console.log(arrow.name);  // "arrow"

// bind 返回的函数
function original() {}
const bound = original.bind(null);
console.log(bound.name);  // "bound original"

// getter/setter
const obj = {
  get prop() {},
  set prop(value) {}
};
const descriptor = Object.getOwnPropertyDescriptor(obj, 'prop');
console.log(descriptor.get.name);  // "get prop"
console.log(descriptor.set.name);  // "set prop"

// Function 构造函数
const fn = new Function();
console.log(fn.name);  // "anonymous"
```

### 8.2 length 属性

```javascript
// length：期望的参数个数（不包括剩余参数和默认参数）
function f1(a, b) {}
console.log(f1.length);  // 2

function f2(a, b, c = 3) {}
console.log(f2.length);  // 2（默认参数不计入）

function f3(a, b, ...rest) {}
console.log(f3.length);  // 2（剩余参数不计入）

function f4(a = 1, b, c) {}
console.log(f4.length);  // 0（默认参数之后的都不计入）
```

---

## 9. 函数返回值

### 9.1 return 语句

```javascript
function add(a, b) {
  return a + b;  // 明确返回
}

function noReturn() {
  // 没有 return 语句
}

console.log(noReturn());  // undefined

function earlyReturn(x) {
  if (x < 0) {
    return;  // 提前返回（返回 undefined）
  }
  return x * 2;
}

console.log(earlyReturn(-5));  // undefined
console.log(earlyReturn(5));   // 10
```

### 9.2 返回多个值

```javascript
// 方式 1：数组
function getCoordinates() {
  return [10, 20];
}

const [x, y] = getCoordinates();

// 方式 2：对象（推荐，更清晰）
function getUserInfo() {
  return {
    name: "Alice",
    age: 25,
    email: "alice@example.com"
  };
}

const { name, age } = getUserInfo();
```

### 9.3 自动插入分号的陷阱

```javascript
function test() {
  return  // ❌ 自动插入分号
    {
      value: 42
    };
}

console.log(test());  // undefined

// ✅ 正确写法
function test() {
  return {
    value: 42
  };
}

console.log(test());  // { value: 42 }
```

---

## 10. 函数声明 vs 函数表达式

### 10.1 主要区别

```javascript
// 1. 提升
console.log(declared(5));  // ✅ 25（函数声明提升）
console.log(expressed(5)); // ❌ TypeError（变量提升但未赋值）

function declared(x) {
  return x ** 2;
}

const expressed = function(x) {
  return x ** 2;
};

// 2. 命名
function declared() {}
console.log(declared.name);  // "declared"

const anonymous = function() {};
console.log(anonymous.name);  // "anonymous"（ES6+）

// 3. 条件创建
if (true) {
  function foo() {  // 不推荐（行为不一致）
    return 1;
  }
}

// 推荐使用函数表达式
if (true) {
  const foo = function() {
    return 1;
  };
}
```

---

## 11. 立即执行函数表达式（IIFE）

### 11.1 基本语法

```javascript
// 方式 1：函数表达式外加括号
(function() {
  console.log("IIFE executed");
})();

// 方式 2：整个表达式加括号
(function() {
  console.log("IIFE executed");
}());

// 箭头函数 IIFE
(() => {
  console.log("Arrow IIFE");
})();
```

### 11.2 用途

```javascript
// 1. 创建私有作用域
(function() {
  const privateVar = "secret";
  console.log(privateVar);
})();

console.log(privateVar);  // ❌ ReferenceError

// 2. 避免全局污染
(function() {
  // 模块代码
  const helper = function() {};
  
  // 只暴露必要接口
  window.MyModule = {
    publicMethod: function() {}
  };
})();

// 3. 模块模式
const MyModule = (function() {
  let count = 0;  // 私有变量
  
  return {
    increment() {
      return ++count;
    },
    getCount() {
      return count;
    }
  };
})();

console.log(MyModule.increment());  // 1
console.log(MyModule.getCount());   // 1
console.log(MyModule.count);        // undefined
```

### 11.3 传参给 IIFE

```javascript
(function(global, $) {
  // 使用传入的参数
  global.MyApp = {
    version: "1.0.0"
  };
  
  $(".element").hide();
})(window, jQuery);

// 实际场景：兼容 undefined
(function(undefined) {
  console.log(undefined);  // 确保是真正的 undefined
})();
```

---

## 12. 工程实践

### 12.1 参数验证

```javascript
function required(param) {
  throw new Error(`Parameter ${param} is required`);
}

function createUser(
  name = required('name'),
  email = required('email')
) {
  return { name, email };
}

createUser("Alice", "alice@example.com");  // ✅
createUser("Alice");  // ❌ Error: Parameter email is required
```

### 12.2 函数重载模拟

```javascript
function createOverload(...handlers) {
  return function(...args) {
    const handler = handlers.find(h => h.length === args.length);
    if (handler) {
      return handler.apply(this, args);
    }
    throw new Error('No matching overload');
  };
}

const greet = createOverload(
  name => `Hello, ${name}`,
  (firstName, lastName) => `Hello, ${firstName} ${lastName}`
);

console.log(greet("Alice"));           // "Hello, Alice"
console.log(greet("Bob", "Smith"));    // "Hello, Bob Smith"
```

### 12.3 可选参数处理

```javascript
function fetchData(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    timeout = 5000
  } = options;
  
  console.log(`${method} ${url}`);
  console.log('Headers:', headers);
  console.log('Timeout:', timeout);
}

fetchData('/api/users');
fetchData('/api/users', { method: 'POST' });
fetchData('/api/users', { 
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
```

---

## 关键要点

1. **函数定义**
   - 函数声明：提升
   - 函数表达式：不提升
   - 箭头函数：简洁语法、词法 this
   - 方法定义：对象方法的简写

2. **参数处理**
   - arguments：类数组对象（传统）
   - 剩余参数：真正的数组（推荐）
   - 展开运算符：展开数组为参数
   - 默认参数：提供默认值

3. **函数属性**
   - name：函数名称
   - length：期望参数个数

4. **返回值**
   - 没有 return 返回 undefined
   - 可以返回任何类型
   - 注意自动插入分号

5. **最佳实践**
   - 优先使用箭头函数（简短回调）
   - 优先使用剩余参数（代替 arguments）
   - 使用默认参数（代替 || 判断）
   - 参数验证和类型检查

---

## 深入一点

### 函数参数的求值时机

```javascript
let i = 0;

function test(x = i++) {
  console.log(x);
}

test();  // 0（i++ 执行，i 变为 1）
test();  // 1（i++ 再次执行，i 变为 2）
test(5); // 5（不使用默认值，i++ 不执行）
```

### 尾调用与尾递归

```javascript
// 尾调用：函数的最后一步是调用另一个函数
function f(x) {
  return g(x);  // 尾调用
}

// 非尾调用
function f(x) {
  const y = g(x);
  return y;  // 不是尾调用（最后一步是 return）
}

function f(x) {
  return g(x) + 1;  // 不是尾调用（还有加法操作）
}
```

---

## 参考资料

- [MDN: Functions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions)
- [MDN: Rest parameters](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/rest_parameters)
- [MDN: Default parameters](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Default_parameters)

---

**上一章**：[ES6 Class 深入](./content-15.md)  
**下一章**：[高阶函数与函数式编程](./content-17.md)
