# 第 23 章：ES6+ 新特性深入 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 解构赋值

### 题目

以下解构赋值的输出是什么？

```javascript
const { x, y = 5 } = { x: 1 };
console.log(x, y);
```

**选项：**
- A. `1`, `undefined`
- B. `1`, `5`
- C. `undefined`, `5`
- D. `1`, `null`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**解构默认值**

```javascript
const { x, y = 5 } = { x: 1 };
console.log(x, y);  // 1, 5
// x 存在，使用实际值
// y 不存在，使用默认值 5

// 只有 undefined 才使用默认值
const { a = 1 } = { a: undefined };
console.log(a);  // 1

const { b = 1 } = { b: null };
console.log(b);  // null（null 不触发默认值）

const { c = 1 } = { c: 0 };
console.log(c);  // 0（0 不触发默认值）
```

**嵌套解构：**
```javascript
const user = {
  name: 'Alice',
  address: {
    city: 'Beijing'
  }
};

const { name, address: { city } } = user;
console.log(name, city);  // "Alice", "Beijing"

// 默认值
const { profile: { age = 25 } = {} } = {};
console.log(age);  // 25
```

**数组解构：**
```javascript
const [a, b = 2] = [1];
console.log(a, b);  // 1, 2

const [x, , z] = [1, 2, 3];
console.log(x, z);  // 1, 3

// 剩余元素
const [first, ...rest] = [1, 2, 3, 4];
console.log(first, rest);  // 1, [2, 3, 4]
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 扩展运算符

### 题目

扩展运算符 `...` 对对象进行的是什么操作？

**选项：**
- A. 深拷贝
- B. 浅拷贝
- C. 引用传递
- D. 移动操作

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**扩展运算符是浅拷贝**

```javascript
const obj1 = {
  name: 'Alice',
  address: {
    city: 'Beijing'
  }
};

const obj2 = { ...obj1 };

// 第一层是新对象
obj2.name = 'Bob';
console.log(obj1.name);  // "Alice"

// 嵌套对象是引用
obj2.address.city = 'Shanghai';
console.log(obj1.address.city);  // "Shanghai"（被修改）
```

**数组扩展：**
```javascript
const arr1 = [1, 2, [3, 4]];
const arr2 = [...arr1];

arr2[0] = 10;
console.log(arr1[0]);  // 1（不影响）

arr2[2][0] = 30;
console.log(arr1[2][0]);  // 30（嵌套数组被修改）
```

**对象合并：**
```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };

const merged = { ...obj1, ...obj2 };
console.log(merged);  // { a: 1, b: 3, c: 4 }
// 后面的覆盖前面的
```

**数组合并：**
```javascript
const arr1 = [1, 2];
const arr2 = [3, 4];

const merged = [...arr1, ...arr2];
console.log(merged);  // [1, 2, 3, 4]
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 可选链

### 题目

可选链 `?.` 遇到 `null` 或 `undefined` 会返回 `undefined`。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**可选链操作符**

```javascript
const user = {
  name: 'Alice',
  address: {
    city: 'Beijing'
  }
};

// ✅ 安全访问
console.log(user?.address?.city);  // "Beijing"
console.log(user?.profile?.age);   // undefined

// ❌ 不使用可选链
console.log(user.profile.age);  // TypeError

// 等价于
console.log(
  user !== null && user !== undefined &&
  user.profile !== null && user.profile !== undefined
    ? user.profile.age
    : undefined
);
```

**可选链的场景：**

**1. 对象属性**
```javascript
const value = obj?.prop;
```

**2. 数组元素**
```javascript
const item = arr?.[0];
```

**3. 函数调用**
```javascript
const result = func?.();

// 实际应用
const onClick = button.onClick?.();
```

**4. 与空值合并配合**
```javascript
const value = obj?.prop ?? 'default';
console.log(value);  // 如果 obj?.prop 是 null/undefined，返回 'default'
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 模板字符串标签函数

### 题目

以下代码的输出是什么？

```javascript
function tag(strings, ...values) {
  console.log(strings);
  console.log(values);
}

const name = 'Alice';
const age = 25;

tag`Hello ${name}, you are ${age} years old`;
```

<details>
<summary>查看答案</summary>

### ✅ 答案

```
["Hello ", ", you are ", " years old"]
["Alice", 25]
```

### 📖 解析

**标签模板**

```javascript
function tag(strings, ...values) {
  // strings: 字符串片段数组
  // values: 插值表达式的值
  
  console.log(strings);
  // ["Hello ", ", you are ", " years old"]
  // strings.raw: ["Hello ", ", you are ", " years old"]
  
  console.log(values);
  // ["Alice", 25]
  
  // 拼接结果
  let result = '';
  for (let i = 0; i < values.length; i++) {
    result += strings[i] + values[i];
  }
  result += strings[strings.length - 1];
  
  return result;
}
```

**实际应用：**

**1. SQL 安全查询**
```javascript
function sql(strings, ...values) {
  const escaped = values.map(v => 
    typeof v === 'string' ? v.replace(/'/g, "''") : v
  );
  
  let query = strings[0];
  for (let i = 0; i < escaped.length; i++) {
    query += escaped[i] + strings[i + 1];
  }
  
  return query;
}

const username = "Alice'; DROP TABLE users; --";
const query = sql`SELECT * FROM users WHERE name = '${username}'`;
// 自动转义危险字符
```

**2. HTML 转义**
```javascript
function html(strings, ...values) {
  const escape = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  
  return strings.reduce((result, str, i) => 
    result + str + (values[i] ? escape(values[i]) : ''), 
  '');
}

const userInput = '<script>alert("XSS")</script>';
const safe = html`<div>${userInput}</div>`;
// <div>&lt;script&gt;alert("XSS")&lt;/script&gt;</div>
```

**3. 国际化**
```javascript
function i18n(strings, ...values) {
  const translations = {
    'Hello': '你好',
    'you are': '你',
    'years old': '岁'
  };
  
  return strings.reduce((result, str, i) => {
    const translated = translations[str.trim()] || str;
    return result + translated + (values[i] || '');
  }, '');
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** Proxy 与 Reflect

### 题目

以下代码实现了什么功能？

```javascript
const obj = new Proxy({}, {
  get(target, prop) {
    if (!(prop in target)) {
      console.log(`Warning: ${prop} is not defined`);
    }
    return Reflect.get(target, prop);
  }
});
```

<details>
<summary>查看答案</summary>

### ✅ 答案：访问未定义属性时发出警告

### 📖 解析

**属性访问监控**

```javascript
const obj = new Proxy({}, {
  get(target, prop) {
    if (!(prop in target)) {
      console.log(`Warning: ${prop} is not defined`);
    }
    return Reflect.get(target, prop);
  }
});

obj.name = 'Alice';
console.log(obj.name);  // "Alice"
console.log(obj.age);   // Warning: age is not defined, undefined
```

**扩展应用：**

**1. 默认值**
```javascript
const withDefaults = new Proxy({}, {
  get(target, prop) {
    return prop in target 
      ? target[prop] 
      : 'default value';
  }
});

console.log(withDefaults.anything);  // "default value"
```

**2. 负数索引**
```javascript
const arr = new Proxy([1, 2, 3, 4, 5], {
  get(target, prop) {
    const index = Number(prop);
    if (index < 0) {
      return target[target.length + index];
    }
    return Reflect.get(target, prop);
  }
});

console.log(arr[-1]);  // 5
console.log(arr[-2]);  // 4
```

**3. 链式调用**
```javascript
const chain = new Proxy({}, {
  get(target, prop) {
    if (prop === 'result') {
      return target.value;
    }
    
    return (value) => {
      target.value = target.value || value;
      target.value = target.value[prop](value);
      return chain;
    };
  }
});

// 使用
const result = chain
  .toUpperCase()('hello')
  .split()('')
  .result;
```

**4. 数据验证**
```javascript
function validate(obj, schema) {
  return new Proxy(obj, {
    set(target, prop, value) {
      const validator = schema[prop];
      
      if (validator && !validator(value)) {
        throw new Error(`Invalid value for ${prop}`);
      }
      
      return Reflect.set(target, prop, value);
    }
  });
}

const user = validate({}, {
  age: v => typeof v === 'number' && v >= 0,
  email: v => /^[\w.-]+@[\w.-]+\.\w+$/.test(v)
});

user.age = 25;      // ✅
user.age = -1;      // ❌ Error
user.email = 'a@b'; // ❌ Error
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** BigInt

### 题目

BigInt 与 Number 的区别和使用场景是什么？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**BigInt 特点**

```javascript
// Number 最大安全整数
console.log(Number.MAX_SAFE_INTEGER);  // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER + 1);  // 9007199254740992
console.log(Number.MAX_SAFE_INTEGER + 2);  // 9007199254740992（精度丢失）

// BigInt 无限制
const big = 9007199254740991n + 2n;
console.log(big);  // 9007199254740993n
```

**创建 BigInt：**
```javascript
// 字面量
const big1 = 123n;

// 构造函数
const big2 = BigInt(123);
const big3 = BigInt('123456789012345678901234567890');

// 不能用小数
// const bad = BigInt(1.5);  // Error
```

**运算规则：**
```javascript
// 同类型运算
console.log(10n + 20n);  // 30n
console.log(10n * 2n);   // 20n
console.log(10n / 3n);   // 3n（整数除法）

// 不能混用
// console.log(10n + 5);  // TypeError

// 需要转换
console.log(10n + BigInt(5));  // 15n
console.log(Number(10n) + 5);  // 15
```

**比较操作：**
```javascript
console.log(10n === 10);   // false（严格相等）
console.log(10n == 10);    // true（宽松相等）
console.log(10n < 20);     // true
console.log(10n > 5n);     // true
```

**实际应用：**

**1. 大整数计算**
```javascript
function factorial(n) {
  let result = 1n;
  for (let i = 2n; i <= n; i++) {
    result *= i;
  }
  return result;
}

console.log(factorial(20n));
// 2432902008176640000n（Number 会溢出）
```

**2. 精确货币计算**
```javascript
// 以分为单位存储
class Money {
  constructor(cents) {
    this.cents = BigInt(cents);
  }
  
  add(other) {
    return new Money(this.cents + other.cents);
  }
  
  multiply(factor) {
    return new Money(this.cents * BigInt(factor));
  }
  
  toString() {
    const dollars = this.cents / 100n;
    const cents = this.cents % 100n;
    return `$${dollars}.${cents.toString().padStart(2, '0')}`;
  }
}

const price = new Money(1099);  // $10.99
const total = price.multiply(3);
console.log(total.toString());  // $32.97
```

**3. 时间戳（纳秒）**
```javascript
const nanoTimestamp = BigInt(Date.now()) * 1000000n;
console.log(nanoTimestamp);
```

**限制：**
```javascript
// 不能用于 Math 对象
// Math.sqrt(4n);  // TypeError

// 不能序列化为 JSON
// JSON.stringify({ big: 123n });  // TypeError

// 自定义序列化
JSON.stringify({ big: 123n }, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
);
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** ES2020+ 特性

### 题目

ES2020 引入了哪些新特性？

**选项：**
- A. 可选链 `?.`
- B. 空值合并 `??`
- C. `Promise.allSettled`
- D. `globalThis`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**A. 可选链 `?.`**
```javascript
const value = obj?.prop?.nested;
const item = arr?.[0];
const result = func?.();
```

**B. 空值合并 `??`**
```javascript
const value = input ?? 'default';

// 与 || 的区别
console.log(0 || 'default');    // "default"
console.log(0 ?? 'default');    // 0

console.log('' || 'default');   // "default"
console.log('' ?? 'default');   // ""
```

**C. Promise.allSettled**
```javascript
const promises = [
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
];

Promise.allSettled(promises).then(results => {
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      console.log('Success:', result.value);
    } else {
      console.log('Error:', result.reason);
    }
  });
});
```

**D. globalThis**
```javascript
// 统一的全局对象引用
console.log(globalThis);
// 浏览器：window
// Node.js：global
// Web Worker：self
```

**其他 ES2020 特性：**

**5. String.prototype.matchAll**
```javascript
const str = 'test1 test2 test3';
const regex = /test(\d)/g;

for (const match of str.matchAll(regex)) {
  console.log(match[0], match[1]);
}
// test1 1
// test2 2
// test3 3
```

**6. import.meta**
```javascript
// 模块元信息
console.log(import.meta.url);
```

**7. BigInt**
```javascript
const big = 123n;
```

**8. Dynamic Import**
```javascript
const module = await import('./module.js');
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** 私有字段

### 题目

使用 ES2022 私有字段实现一个银行账户类。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
class BankAccount {
  // 私有字段
  #balance = 0;
  #transactions = [];
  #accountNumber;
  
  // 静态私有字段
  static #accounts = new Map();
  
  constructor(accountNumber, initialBalance = 0) {
    this.#accountNumber = accountNumber;
    this.#balance = initialBalance;
    
    // 注册账户
    BankAccount.#accounts.set(accountNumber, this);
    
    this.#addTransaction('Initial deposit', initialBalance);
  }
  
  // 私有方法
  #addTransaction(type, amount) {
    this.#transactions.push({
      type,
      amount,
      balance: this.#balance,
      timestamp: new Date()
    });
  }
  
  #validateAmount(amount) {
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid amount');
    }
  }
  
  // 公共方法
  deposit(amount) {
    this.#validateAmount(amount);
    this.#balance += amount;
    this.#addTransaction('Deposit', amount);
    return this.#balance;
  }
  
  withdraw(amount) {
    this.#validateAmount(amount);
    
    if (amount > this.#balance) {
      throw new Error('Insufficient funds');
    }
    
    this.#balance -= amount;
    this.#addTransaction('Withdrawal', -amount);
    return this.#balance;
  }
  
  getBalance() {
    return this.#balance;
  }
  
  getTransactionHistory() {
    // 返回副本，防止修改
    return [...this.#transactions];
  }
  
  // 静态方法
  static getAccount(accountNumber) {
    return this.#accounts.get(accountNumber);
  }
  
  static getTotalAccounts() {
    return this.#accounts.size;
  }
  
  // Getter
  get accountNumber() {
    return this.#accountNumber;
  }
}

// 使用
const account = new BankAccount('123456', 1000);

account.deposit(500);
console.log(account.getBalance());  // 1500

account.withdraw(200);
console.log(account.getBalance());  // 1300

// 无法访问私有字段
// console.log(account.#balance);  // SyntaxError

// 静态方法
const found = BankAccount.getAccount('123456');
console.log(found === account);  // true
console.log(BankAccount.getTotalAccounts());  // 1
```

**扩展：私有字段的检测**
```javascript
class MyClass {
  #privateField;
  
  hasPrivateField() {
    return #privateField in this;  // ES2022
  }
  
  static hasPrivateField(obj) {
    try {
      obj.#privateField;
      return true;
    } catch {
      return false;
    }
  }
}
```

**私有字段 vs WeakMap**
```javascript
// 旧方式：WeakMap
const privateData = new WeakMap();

class OldClass {
  constructor() {
    privateData.set(this, { secret: 'value' });
  }
  
  getSecret() {
    return privateData.get(this).secret;
  }
}

// 新方式：私有字段（更简洁）
class NewClass {
  #secret = 'value';
  
  getSecret() {
    return this.#secret;
  }
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** 逻辑赋值

### 题目

ES2021 引入的逻辑赋值运算符有什么用途？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**逻辑赋值运算符**

**1. `||=`（逻辑或赋值）**
```javascript
let x = null;
x ||= 10;
console.log(x);  // 10

// 等价于
x || (x = 10);
// 或
if (!x) x = 10;

// 应用：设置默认值
function loadConfig(options = {}) {
  options.timeout ||= 5000;
  options.retries ||= 3;
  return options;
}
```

**2. `&&=`（逻辑与赋值）**
```javascript
let user = { name: 'Alice', admin: true };
user.admin &&= 'superadmin';
console.log(user.admin);  // "superadmin"

// 等价于
user.admin && (user.admin = 'superadmin');

// 应用：条件更新
function updateIfExists(obj, key, value) {
  obj[key] &&= value;
}
```

**3. `??=`（空值合并赋值）**
```javascript
let config = { timeout: 0 };
config.timeout ??= 5000;
console.log(config.timeout);  // 0（不覆盖 0）

config.retries ??= 3;
console.log(config.retries);  // 3

// 等价于
config.retries ?? (config.retries = 3);

// 与 ||= 的区别
let value1 = 0;
value1 ||= 10;   // 10（覆盖 0）

let value2 = 0;
value2 ??= 10;   // 0（保留 0）
```

**实际应用：**

**缓存初始化**
```javascript
class Cache {
  #cache = new Map();
  
  get(key, factory) {
    return this.#cache.get(key) ?? (
      this.#cache.set(key, factory()).get(key)
    );
  }
  
  // 使用 ??=
  getOrCreate(key, factory) {
    let value = this.#cache.get(key);
    value ??= factory();
    this.#cache.set(key, value);
    return value;
  }
}
```

**配置合并**
```javascript
function mergeConfig(defaults, user) {
  const config = { ...defaults };
  
  // 只覆盖未定义的值
  for (const key in user) {
    config[key] ??= user[key];
  }
  
  return config;
}
```

**惰性求值**
```javascript
class LazyValue {
  #value;
  #factory;
  
  constructor(factory) {
    this.#factory = factory;
  }
  
  get value() {
    this.#value ??= this.#factory();
    return this.#value;
  }
}

const expensive = new LazyValue(() => {
  console.log('Computing...');
  return 42;
});

console.log(expensive.value);  // Computing... 42
console.log(expensive.value);  // 42（不再计算）
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** ES6+ 特性总结

### 题目

总结 ES6+ 的主要特性和使用场景。

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**ES6+ 特性汇总**

**ES6 (2015)**
```javascript
// let/const
let x = 1;
const y = 2;

// 箭头函数
const fn = (a, b) => a + b;

// 模板字符串
const str = `Hello ${name}`;

// 解构
const { a, b } = obj;
const [x, y] = arr;

// 默认参数
function fn(a = 1) {}

// 剩余参数
function fn(...args) {}

// 扩展运算符
const arr = [...arr1, ...arr2];

// 类
class MyClass {}

// Promise
Promise.resolve(1);

// 模块
import { fn } from './module';
export { fn };
```

**ES2016**
```javascript
// 指数运算符
2 ** 3;  // 8

// Array.includes
[1, 2, 3].includes(2);  // true
```

**ES2017**
```javascript
// async/await
async function fn() {
  const result = await promise;
}

// Object.entries/values
Object.entries({ a: 1 });
Object.values({ a: 1 });

// String padding
'x'.padStart(3, '0');  // "00x"
```

**ES2018**
```javascript
// 对象 rest/spread
const { x, ...rest } = obj;
const obj = { ...obj1, ...obj2 };

// Promise.finally
promise.finally(() => {});

// 异步迭代
for await (const item of asyncIterable) {}
```

**ES2019**
```javascript
// Array.flat/flatMap
[1, [2, 3]].flat();  // [1, 2, 3]

// Object.fromEntries
Object.fromEntries([['a', 1]]);

// String.trimStart/trimEnd
'  x  '.trimStart();  // "x  "

// catch 可选绑定
try {} catch {}
```

**ES2020**
```javascript
// 可选链
obj?.prop;

// 空值合并
value ?? 'default';

// BigInt
123n;

// Promise.allSettled
Promise.allSettled(promises);

// globalThis
globalThis;

// Dynamic import
await import('./module.js');
```

**ES2021**
```javascript
// 逻辑赋值
x ||= 1;
x &&= 1;
x ??= 1;

// 数字分隔符
1_000_000;

// String.replaceAll
'aaa'.replaceAll('a', 'b');  // "bbb"

// Promise.any
Promise.any(promises);

// WeakRef
new WeakRef(obj);
```

**ES2022**
```javascript
// 类私有字段
class C { #x; }

// Top-level await
const data = await fetch(url);

// .at()
arr.at(-1);  // 最后一个元素

// Object.hasOwn
Object.hasOwn(obj, 'prop');

// Error cause
new Error('msg', { cause: error });
```

**ES2023**
```javascript
// Array.findLast/findLastIndex
arr.findLast(x => x > 5);

// Array.toSorted/toReversed
arr.toSorted();  // 不改变原数组

// Hashbang
#!/usr/bin/env node

// Symbol.metadata
```

**选择使用建议：**
- 基础特性：let/const、箭头函数、解构
- 异步：async/await、Promise 方法
- 安全访问：可选链、空值合并
- 类型：BigInt、私有字段
- 数组：flat、includes、at
- 对象：Object.entries、spread
- 字符串：模板字符串、replaceAll

</details>

---

**本章总结：**
- ✅ 解构赋值机制
- ✅ 扩展运算符
- ✅ 可选链操作符
- ✅ 模板字符串标签
- ✅ Proxy 与 Reflect
- ✅ BigInt 类型
- ✅ ES2020+ 特性
- ✅ 私有字段
- ✅ 逻辑赋值运算符
- ✅ ES6+ 特性总结

**下一章：** [第 24 章：模块加载机制](./chapter-24.md)
