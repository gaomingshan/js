# 第 4 章：函数与作用域 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 函数声明

### 题目

以下哪种函数定义方式存在函数提升？

**选项：**
- A. `function foo() {}`
- B. `const foo = function() {}`
- C. `const foo = () => {}`
- D. 都不会提升

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**只有函数声明（Function Declaration）会提升**

**函数声明（会提升）：**
```javascript
foo();  // 可以在声明前调用

function foo() {
  console.log('Hello');
}
```

**函数表达式（不会提升）：**
```javascript
foo();  // TypeError: foo is not a function

var foo = function() {
  console.log('Hello');
};

// 实际执行：
// var foo;  // 变量提升，值为 undefined
// foo();    // TypeError
// foo = function() {};
```

**箭头函数（不会提升）：**
```javascript
foo();  // ReferenceError: Cannot access 'foo' before initialization

const foo = () => {
  console.log('Hello');
};
```

---

**函数提升 vs 变量提升**

```javascript
// 函数提升优先级更高
console.log(foo);  // [Function: foo]
var foo = 'variable';
function foo() {}
console.log(foo);  // 'variable'

// 等价于：
function foo() {}  // 函数声明先提升
var foo;           // 变量声明提升（但不覆盖函数）
console.log(foo);  // [Function: foo]
foo = 'variable';  // 赋值
console.log(foo);  // 'variable'
```

**最佳实践：**
- ✅ 在使用前声明函数
- ✅ 使用 `const` 定义函数表达式
- ❌ 避免依赖函数提升

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 箭头函数

### 题目

箭头函数与普通函数的主要区别是什么？

**选项：**
- A. 箭头函数没有自己的 `this`
- B. 箭头函数不能用作构造函数
- C. 箭头函数没有 `arguments` 对象
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**箭头函数的特性（全部正确）**

**1. 没有自己的 this（A）**
```javascript
const obj = {
  name: 'Alice',
  
  // 普通函数：this 指向 obj
  sayHi: function() {
    console.log(this.name);
  },
  
  // 箭头函数：this 继承外层
  sayHello: () => {
    console.log(this.name);  // undefined（this 是全局对象）
  }
};

obj.sayHi();     // "Alice"
obj.sayHello();  // undefined
```

**2. 不能用作构造函数（B）**
```javascript
const Person = (name) => {
  this.name = name;
};

new Person('Alice');  // TypeError: Person is not a constructor
```

**3. 没有 arguments（C）**
```javascript
// 普通函数
function foo() {
  console.log(arguments);  // [Arguments] { '0': 1, '1': 2 }
}
foo(1, 2);

// 箭头函数
const bar = () => {
  console.log(arguments);  // ReferenceError: arguments is not defined
};
bar(1, 2);

// 使用剩余参数
const baz = (...args) => {
  console.log(args);  // [1, 2]
};
baz(1, 2);
```

---

**其他区别**

**4. 没有 prototype**
```javascript
function foo() {}
console.log(foo.prototype);  // { constructor: f }

const bar = () => {};
console.log(bar.prototype);  // undefined
```

**5. 不能使用 yield**
```javascript
// ❌ 箭头函数不能是生成器
const gen = *() => {};  // SyntaxError
```

**6. 简洁的语法**
```javascript
// 单个参数可以省略括号
const double = x => x * 2;

// 单行返回可以省略 return
const add = (a, b) => a + b;

// 返回对象需要括号
const getObj = () => ({ name: 'Alice' });
```

---

**使用场景**

**✅ 适合箭头函数：**
```javascript
// 数组方法
[1, 2, 3].map(x => x * 2);

// 简短的回调
setTimeout(() => console.log('Hello'), 1000);

// 保持外层 this
class Timer {
  constructor() {
    this.seconds = 0;
    setInterval(() => {
      this.seconds++;  // this 指向 Timer 实例
    }, 1000);
  }
}
```

**❌ 不适合箭头函数：**
```javascript
// 对象方法（需要 this）
const obj = {
  value: 42,
  getValue: () => this.value  // ❌ this 不是 obj
};

// 需要 arguments
const sum = () => {
  return arguments[0] + arguments[1];  // ❌ 没有 arguments
};

// 构造函数
const Person = (name) => {
  this.name = name;  // ❌ 不能用 new
};
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 函数参数

### 题目

函数参数的默认值可以引用前面的参数。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**默认参数可以引用前面的参数**

```javascript
function greet(name, greeting = `Hello, ${name}`) {
  console.log(greeting);
}

greet('Alice');           // "Hello, Alice"
greet('Bob', 'Hi, Bob');  // "Hi, Bob"
```

**更多示例：**

**1. 计算默认值**
```javascript
function multiply(a, b = a * 2) {
  return a * b;
}

multiply(5);     // 50（5 * 10）
multiply(5, 3);  // 15（5 * 3）
```

**2. 函数调用**
```javascript
function getDefault() {
  return 'default';
}

function test(a = getDefault()) {
  console.log(a);
}

test();      // "default"
test('hi');  // "hi"
```

**3. 引用前面的参数**
```javascript
function createRange(start = 0, end = start + 10) {
  return { start, end };
}

createRange(5);      // { start: 5, end: 15 }
createRange(5, 20);  // { start: 5, end: 20 }
```

---

**注意事项**

**❌ 不能引用后面的参数（TDZ）**
```javascript
function foo(a = b, b = 1) {
  console.log(a, b);
}
foo();  // ReferenceError: Cannot access 'b' before initialization
```

**默认参数的作用域**
```javascript
let x = 1;

function foo(a = x) {
  let x = 2;
  console.log(a);
}

foo();  // 1（默认参数的 x 是外层的 x）
```

**默认参数的求值时机**
```javascript
function append(value, array = []) {
  array.push(value);
  return array;
}

append(1);  // [1]
append(2);  // [2]（每次调用都创建新数组）
```

**与解构结合：**
```javascript
function process({ x = 0, y = 0 } = {}) {
  return x + y;
}

process({ x: 3, y: 4 });  // 7
process({ x: 3 });        // 3
process({});              // 0
process();                // 0
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 闭包

### 题目

以下代码的输出是什么？

```javascript
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1.increment());
console.log(counter1.increment());
console.log(counter2.increment());
console.log(counter1.getCount());
```

**选项：**
- A. `1`, `2`, `3`, `3`
- B. `1`, `2`, `1`, `2`
- C. `1`, `2`, `3`, `2`
- D. `1`, `1`, `1`, `1`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**闭包创建独立的作用域**

```javascript
// counter1 和 counter2 是两个独立的实例
const counter1 = createCounter();  // 创建 count1 = 0
const counter2 = createCounter();  // 创建 count2 = 0

console.log(counter1.increment());  // 1（count1 变为 1）
console.log(counter1.increment());  // 2（count1 变为 2）
console.log(counter2.increment());  // 1（count2 变为 1）
console.log(counter1.getCount());   // 2（访问 count1）
```

**每次调用 `createCounter()` 都会：**
1. 创建新的 `count` 变量
2. 创建新的闭包环境
3. 返回新的对象

---

**闭包的核心概念**

**定义：** 函数可以访问其词法作用域外的变量

**1. 私有变量**
```javascript
function createPerson(name) {
  // name 是私有的
  return {
    getName: () => name,
    setName: (newName) => {
      name = newName;
    }
  };
}

const person = createPerson('Alice');
console.log(person.getName());  // "Alice"
person.setName('Bob');
console.log(person.getName());  // "Bob"
console.log(person.name);       // undefined（无法直接访问）
```

**2. 模块模式**
```javascript
const calculator = (function() {
  let result = 0;
  
  return {
    add(n) {
      result += n;
      return this;
    },
    subtract(n) {
      result -= n;
      return this;
    },
    getResult() {
      return result;
    }
  };
})();

calculator.add(5).add(3).subtract(2);
console.log(calculator.getResult());  // 6
```

**3. 函数工厂**
```javascript
function multiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

---

**闭包的内存模型**

```javascript
function outer() {
  let count = 0;
  
  function inner() {
    count++;
    console.log(count);
  }
  
  return inner;
}

const fn = outer();
fn();  // 1
fn();  // 2
// count 变量被 fn 引用，不会被回收
```

**内存示意：**
```
[全局作用域]
  ↓
fn → [闭包作用域: count = 2]
  ↓
[inner 函数]
```

**注意内存泄漏：**
```javascript
function attach() {
  const largeData = new Array(1000000);
  
  return function() {
    console.log('done');
    // largeData 被闭包引用，无法释放
  };
}

// 解决：只引用需要的部分
function attach() {
  const largeData = new Array(1000000);
  const needed = largeData[0];
  
  return function() {
    console.log(needed);
    // largeData 可以被回收
  };
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** this 绑定

### 题目

以下代码的输出是什么？

```javascript
const obj = {
  name: 'Alice',
  greet: function() {
    console.log(this.name);
  }
};

const greet = obj.greet;
greet();
```

**选项：**
- A. `"Alice"`
- B. `undefined`
- C. 报错
- D. `""`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**this 的绑定规则**

```javascript
const obj = {
  name: 'Alice',
  greet: function() {
    console.log(this.name);
  }
};

// 方法调用：this 指向 obj
obj.greet();  // "Alice"

// 函数调用：this 指向 undefined（严格模式）或全局对象（非严格模式）
const greet = obj.greet;
greet();  // undefined（严格模式）或 undefined（全局对象没有 name 属性）
```

---

**this 绑定的四种规则**

**1. 默认绑定（独立函数调用）**
```javascript
function foo() {
  console.log(this);
}

foo();  // 非严格模式：window，严格模式：undefined
```

**2. 隐式绑定（方法调用）**
```javascript
const obj = {
  name: 'Alice',
  sayName() {
    console.log(this.name);
  }
};

obj.sayName();  // "Alice"（this 是 obj）

// 隐式绑定丢失
const fn = obj.sayName;
fn();  // undefined（this 不是 obj）
```

**3. 显式绑定（call/apply/bind）**
```javascript
function greet() {
  console.log(`Hello, ${this.name}`);
}

const person = { name: 'Bob' };

greet.call(person);   // "Hello, Bob"
greet.apply(person);  // "Hello, Bob"

const boundGreet = greet.bind(person);
boundGreet();  // "Hello, Bob"
```

**4. new 绑定（构造函数）**
```javascript
function Person(name) {
  this.name = name;
}

const p = new Person('Charlie');
console.log(p.name);  // "Charlie"
```

---

**优先级**

```
new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定
```

**测试优先级：**
```javascript
function foo() {
  console.log(this.a);
}

const obj1 = { a: 1, foo };
const obj2 = { a: 2 };

// 隐式绑定
obj1.foo();  // 1

// 显式绑定 > 隐式绑定
obj1.foo.call(obj2);  // 2

// new > 显式绑定
const bar = obj1.foo.bind(obj1);
const baz = new bar();  // undefined（new 创建的新对象没有 a 属性）
```

---

**箭头函数的 this**

```javascript
const obj = {
  name: 'Alice',
  
  // 普通函数：this 动态绑定
  greet: function() {
    setTimeout(function() {
      console.log(this.name);  // undefined（this 是全局）
    }, 100);
  },
  
  // 箭头函数：this 继承外层
  greetArrow: function() {
    setTimeout(() => {
      console.log(this.name);  // "Alice"（this 是 obj）
    }, 100);
  }
};

obj.greet();       // undefined
obj.greetArrow();  // "Alice"
```

---

**常见陷阱**

**1. 回调函数**
```javascript
const obj = {
  name: 'Alice',
  greet() {
    console.log(this.name);
  }
};

setTimeout(obj.greet, 100);  // undefined（this 丢失）

// 解决方案
setTimeout(() => obj.greet(), 100);  // "Alice"
setTimeout(obj.greet.bind(obj), 100);  // "Alice"
```

**2. 数组方法**
```javascript
const obj = {
  values: [1, 2, 3],
  double() {
    return this.values.map(function(v) {
      return v * 2;
    });
  }
};

obj.double();  // [2, 4, 6]

// 使用箭头函数保持 this
const obj2 = {
  values: [1, 2, 3],
  multiplier: 10,
  multiply() {
    return this.values.map(v => v * this.multiplier);
  }
};

obj2.multiply();  // [10, 20, 30]
```

</details>

---

## 第 6 题 🟡

**类型：** 代码输出题  
**标签：** 高阶函数

### 题目

以下代码的输出是什么？

```javascript
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}

const add1 = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const result = compose(square, double, add1)(2);
console.log(result);
```

**选项：**
- A. `18`
- B. `12`
- C. `36`
- D. `9`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**函数组合（compose）**

**执行过程：**
```javascript
compose(square, double, add1)(2)

// reduceRight 从右到左执行
// 1. add1(2) = 3
// 2. double(3) = 6
// 3. square(6) = 36

// 结果：36
```

**完整展开：**
```javascript
const result = compose(square, double, add1)(2);

// 等价于
const result = square(double(add1(2)));

// 步骤：
add1(2)      // 2 + 1 = 3
double(3)    // 3 * 2 = 6
square(6)    // 6 * 6 = 36
```

---

**compose 的实现**

**1. reduceRight 版本**
```javascript
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}
```

**2. reduce 版本（从左到右）**
```javascript
function pipe(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}

pipe(add1, double, square)(2);
// add1(2) = 3
// double(3) = 6
// square(6) = 36
```

**3. 递归版本**
```javascript
function compose(...fns) {
  if (fns.length === 0) return x => x;
  if (fns.length === 1) return fns[0];
  
  return fns.reduce((a, b) => (...args) => a(b(...args)));
}
```

---

**实际应用**

**1. 数据处理管道**
```javascript
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 35 }
];

const getNames = arr => arr.map(u => u.name);
const toUpper = arr => arr.map(s => s.toUpperCase());
const joinWith = sep => arr => arr.join(sep);

const processUsers = compose(
  joinWith(', '),
  toUpper,
  getNames
);

console.log(processUsers(users));
// "ALICE, BOB, CHARLIE"
```

**2. 验证器组合**
```javascript
const isString = x => typeof x === 'string';
const isNotEmpty = x => x.length > 0;
const isEmail = x => /\S+@\S+\.\S+/.test(x);

const validateEmail = compose(
  isEmail,
  isNotEmpty,
  isString
);

// 或使用 every
const validateAll = (...validators) => value =>
  validators.every(fn => fn(value));

const isValidEmail = validateAll(isString, isNotEmpty, isEmail);
```

**3. Redux 中间件**
```javascript
const logger = store => next => action => {
  console.log('dispatching', action);
  return next(action);
};

const thunk = store => next => action =>
  typeof action === 'function'
    ? action(store.dispatch, store.getState)
    : next(action);

const middleware = compose(logger, thunk);
```

---

**柯里化（Currying）**

```javascript
// 普通函数
function add(a, b, c) {
  return a + b + c;
}

// 柯里化版本
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

curriedAdd(1)(2)(3);  // 6

// 通用柯里化函数
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

const add = curry((a, b, c) => a + b + c);
add(1)(2)(3);      // 6
add(1, 2)(3);      // 6
add(1)(2, 3);      // 6
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 剩余参数

### 题目

以下代码的输出是什么？

```javascript
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

console.log(sum(1, 2, 3));
console.log(sum.length);
```

**选项：**
- A. `6`, `3`
- B. `6`, `0`
- C. `6`, `1`
- D. `6`, `Infinity`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**剩余参数与函数 length**

```javascript
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

// 调用
console.log(sum(1, 2, 3));  // 6

// function.length 不包含剩余参数
console.log(sum.length);  // 0
```

**function.length 的规则：**
- 返回第一个具有默认值的参数之前的参数个数
- 不包含剩余参数
- 不包含默认参数

---

**示例**

**1. 普通参数**
```javascript
function foo(a, b, c) {}
console.log(foo.length);  // 3
```

**2. 默认参数**
```javascript
function bar(a, b = 2, c) {}
console.log(bar.length);  // 1（只计算 a）
```

**3. 剩余参数**
```javascript
function baz(a, b, ...rest) {}
console.log(baz.length);  // 2（a 和 b）
```

**4. 混合**
```javascript
function mix(a, b = 2, ...rest) {}
console.log(mix.length);  // 1（只计算 a）
```

---

**剩余参数 vs arguments**

**剩余参数（推荐）：**
```javascript
function sum(...numbers) {
  console.log(Array.isArray(numbers));  // true
  return numbers.reduce((a, b) => a + b, 0);
}
```

**arguments 对象：**
```javascript
function sum() {
  console.log(Array.isArray(arguments));  // false
  return Array.from(arguments).reduce((a, b) => a + b, 0);
}
```

**对比：**
| 特性 | 剩余参数 | arguments |
|------|---------|-----------|
| 类型 | 真正的数组 | 类数组对象 |
| 箭头函数 | ✅ 支持 | ❌ 不支持 |
| 部分参数 | ✅ 可以 | ❌ 全部参数 |
| 命名 | ✅ 有意义的名称 | ❌ 固定名称 |

---

**实际应用**

**1. 不定参数求和**
```javascript
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4, 5);  // 15
```

**2. 组合前面的参数**
```javascript
function greet(greeting, ...names) {
  return names.map(name => `${greeting}, ${name}!`);
}

greet('Hello', 'Alice', 'Bob', 'Charlie');
// ["Hello, Alice!", "Hello, Bob!", "Hello, Charlie!"]
```

**3. 转发参数**
```javascript
function wrapper(...args) {
  console.log('Before');
  const result = originalFunc(...args);
  console.log('After');
  return result;
}
```

**4. 收集其余参数**
```javascript
function destructure([first, second, ...rest]) {
  console.log(first);  // 1
  console.log(second); // 2
  console.log(rest);   // [3, 4, 5]
}

destructure([1, 2, 3, 4, 5]);
```

</details>

---

## 第 8 题 🔴

**类型：** 代码分析题  
**标签：** 作用域链

### 题目

以下代码的输出是什么？

```javascript
var x = 10;

function foo() {
  console.log(x);
  var x = 20;
  console.log(x);
  
  function bar() {
    var x = 30;
    console.log(x);
  }
  
  bar();
  console.log(x);
}

foo();
console.log(x);
```

**选项：**
- A. `10`, `20`, `30`, `20`, `10`
- B. `undefined`, `20`, `30`, `20`, `10`
- C. `10`, `20`, `30`, `30`, `10`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**作用域链和变量提升**

**执行过程：**

```javascript
var x = 10;  // 全局 x

function foo() {
  // 变量提升：var x; （值为 undefined）
  console.log(x);  // undefined（访问局部 x）
  
  var x = 20;  // 赋值
  console.log(x);  // 20
  
  function bar() {
    var x = 30;  // bar 的局部 x
    console.log(x);  // 30
  }
  
  bar();
  console.log(x);  // 20（foo 的 x）
}

foo();
console.log(x);  // 10（全局 x）
```

**输出：**
```
undefined
20
30
20
10
```

---

**作用域链的查找规则**

**1. 词法作用域（静态作用域）**
```javascript
let a = 'global';

function outer() {
  let a = 'outer';
  
  function inner() {
    console.log(a);  // "outer"（查找外层作用域）
  }
  
  return inner;
}

const fn = outer();
fn();  // "outer"
```

**2. 作用域链示意**
```
[bar 作用域: x = 30]
    ↑
[foo 作用域: x = 20]
    ↑
[全局作用域: x = 10]
```

**3. 查找顺序**
```javascript
function test() {
  let x = 1;
  
  function inner() {
    let x = 2;
    
    function innermost() {
      console.log(x);  // 2（最近的 x）
    }
    
    innermost();
  }
  
  inner();
}

test();
```

---

**变量提升的影响**

**示例 1：**
```javascript
console.log(x);  // undefined（不是 ReferenceError）
var x = 10;

// 等价于
var x;
console.log(x);
x = 10;
```

**示例 2：**
```javascript
var x = 1;

function foo() {
  console.log(x);  // undefined（局部 x 提升）
  if (false) {
    var x = 2;  // 即使不执行，声明也会提升
  }
}

foo();
```

**示例 3：使用 let 避免问题**
```javascript
let x = 1;

function foo() {
  console.log(x);  // ReferenceError（TDZ）
  let x = 2;
}

foo();
```

---

**闭包与作用域链**

```javascript
function createCounter() {
  let count = 0;
  
  return {
    increment() {
      count++;
      console.log(count);
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
counter.increment();  // 1
counter.increment();  // 2
console.log(counter.getCount());  // 2

// count 变量在闭包中，无法直接访问
console.log(count);  // ReferenceError
```

**作用域链保留：**
```
[counter.increment 作用域]
    ↑
[createCounter 作用域: count = 2]
    ↑
[全局作用域]
```

</details>

---

## 第 9 题 🔴

**类型：** 代码输出题  
**标签：** 函数柯里化

### 题目

实现一个 add 函数，使其支持以下调用方式：

```javascript
add(1)(2)(3)() // 6
add(1, 2)(3)() // 6
add(1)(2, 3)() // 6
```

以下哪个实现是正确的？

**选项：**
```javascript
// A
function add(...args) {
  let sum = args.reduce((a, b) => a + b, 0);
  return function(...nextArgs) {
    if (nextArgs.length === 0) return sum;
    sum += nextArgs.reduce((a, b) => a + b, 0);
    return arguments.callee;
  };
}

// B
function add(...args) {
  const sum = args.reduce((a, b) => a + b, 0);
  const fn = (...nextArgs) => {
    if (nextArgs.length === 0) return sum;
    return add(sum, ...nextArgs);
  };
  return fn;
}

// C 和 D
```

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**柯里化的实现**

**正确实现（B）：**
```javascript
function add(...args) {
  const sum = args.reduce((a, b) => a + b, 0);
  
  const fn = (...nextArgs) => {
    if (nextArgs.length === 0) {
      return sum;  // 终止条件
    }
    return add(sum, ...nextArgs);  // 递归累加
  };
  
  return fn;
}

// 使用
add(1)(2)(3)();     // 6
add(1, 2)(3)();     // 6
add(1)(2, 3)();     // 6
add(1, 2, 3)();     // 6
```

**为什么 A 选项错误？**
- `arguments.callee` 在严格模式下不可用
- 箭头函数没有 `arguments`

---

**更完善的实现**

**1. 支持 toString**
```javascript
function add(...args) {
  const sum = args.reduce((a, b) => a + b, 0);
  
  const fn = (...nextArgs) => {
    if (nextArgs.length === 0) return sum;
    return add(sum, ...nextArgs);
  };
  
  fn.toString = () => sum;
  fn.valueOf = () => sum;
  
  return fn;
}

console.log(add(1)(2)(3).toString());  // "6"
console.log(+add(1)(2)(3));            // 6
```

**2. 通用柯里化函数**
```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

// 使用
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));      // 6
console.log(curriedAdd(1, 2)(3));      // 6
console.log(curriedAdd(1)(2, 3));      // 6
console.log(curriedAdd(1, 2, 3));      // 6
```

---

**实际应用**

**1. 参数复用**
```javascript
// 普通函数
function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

// 柯里化
const curriedGreet = curry(greet);
const sayHello = curriedGreet('Hello');

sayHello('Alice');  // "Hello, Alice!"
sayHello('Bob');    // "Hello, Bob!"
```

**2. 延迟执行**
```javascript
const multiply = curry((a, b, c) => a * b * c);
const double = multiply(2);
const doubleAndTriple = double(3);

console.log(doubleAndTriple(4));  // 24
```

**3. 函数组合**
```javascript
const map = curry((fn, arr) => arr.map(fn));
const filter = curry((fn, arr) => arr.filter(fn));

const numbers = [1, 2, 3, 4, 5];

const doubleEven = compose(
  map(x => x * 2),
  filter(x => x % 2 === 0)
);

console.log(doubleEven(numbers));  // [4, 8]
```

**4. 偏函数应用**
```javascript
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

function add(a, b, c) {
  return a + b + c;
}

const add5 = partial(add, 5);
console.log(add5(3, 2));  // 10
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 递归与尾调用优化

### 题目

以下关于尾调用优化（TCO）的说法，哪个是正确的？

**选项：**
- A. 所有递归函数都会被自动优化
- B. 只有尾递归可以被优化
- C. 尾调用优化在所有 JavaScript 引擎中都支持
- D. 尾调用优化可以防止栈溢出

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B, D

### 📖 解析

**尾调用优化（Tail Call Optimization）**

**尾调用：** 函数的最后一步是调用另一个函数

**B 正确：只有尾递归可以被优化**
```javascript
// ✅ 尾递归（可优化）
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc);  // 尾调用
}

// ❌ 非尾递归（不可优化）
function factorial2(n) {
  if (n <= 1) return 1;
  return n * factorial2(n - 1);  // 不是尾调用（还要乘 n）
}
```

**D 正确：可以防止栈溢出**
```javascript
// 非尾递归：栈溢出
factorial2(10000);  // RangeError: Maximum call stack size exceeded

// 尾递归：不会栈溢出（如果引擎支持 TCO）
factorial(10000);   // 正常执行（理论上）
```

---

**为什么其他选项错误？**

**A 错误：** 不是所有递归都会被优化
```javascript
// 这不是尾递归
function sum(n) {
  if (n === 0) return 0;
  return n + sum(n - 1);  // 返回后还要加 n
}
```

**C 错误：** 大多数 JavaScript 引擎不支持 TCO
- 目前只有 Safari（JavaScriptCore）部分支持
- Chrome、Firefox、Node.js 都不支持

---

**尾递归改写**

**1. 阶乘**
```javascript
// 非尾递归
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// 尾递归
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc);
}
```

**2. 斐波那契**
```javascript
// 非尾递归
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// 尾递归
function fib(n, a = 0, b = 1) {
  if (n === 0) return a;
  return fib(n - 1, b, a + b);
}
```

**3. 数组求和**
```javascript
// 非尾递归
function sum(arr) {
  if (arr.length === 0) return 0;
  return arr[0] + sum(arr.slice(1));
}

// 尾递归
function sum(arr, acc = 0) {
  if (arr.length === 0) return acc;
  return sum(arr.slice(1), acc + arr[0]);
}
```

---

**替代方案（因为 TCO 支持差）**

**1. 循环**
```javascript
function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

**2. 蹦床函数（Trampoline）**
```javascript
function trampoline(fn) {
  while (typeof fn === 'function') {
    fn = fn();
  }
  return fn;
}

function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return () => factorial(n - 1, n * acc);
}

trampoline(factorial(10000));  // 不会栈溢出
```

**3. Y 组合子**
```javascript
const Y = fn => (x => fn(v => x(x)(v)))(x => fn(v => x(x)(v)));

const factorial = Y(fn => n =>
  n <= 1 ? 1 : n * fn(n - 1)
);

factorial(5);  // 120
```

---

**判断是否为尾调用**

```javascript
// ✅ 尾调用
function a() {
  return b();
}

// ✅ 尾调用（条件表达式的两个分支都是）
function a(x) {
  return x ? b() : c();
}

// ❌ 不是尾调用（还要加 1）
function a() {
  return 1 + b();
}

// ❌ 不是尾调用（还要访问属性）
function a() {
  return b().property;
}

// ❌ 不是尾调用（还要等待 Promise）
async function a() {
  return await b();
}
```

</details>

---

**本章总结：**
- ✅ 函数声明与函数表达式
- ✅ 箭头函数特性
- ✅ 函数参数（默认参数、剩余参数）
- ✅ 闭包原理与应用
- ✅ this 绑定规则
- ✅ 高阶函数与函数组合
- ✅ 柯里化与偏函数
- ✅ 作用域链
- ✅ 递归与尾调用优化

**下一章：** [第 5 章：对象与原型](./chapter-05.md)
