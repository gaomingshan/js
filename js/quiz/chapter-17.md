# 第 17 章：迭代器与生成器协议 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 迭代器基础

### 题目

迭代器协议要求对象必须实现哪个方法？

**选项：**
- A. `iterator()`
- B. `next()`
- C. `[Symbol.iterator]()`
- D. `hasNext()`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**迭代器协议（Iterator Protocol）**

迭代器对象必须实现 `next()` 方法。

```javascript
// 迭代器对象
const iterator = {
  next() {
    return {
      value: /* 当前值 */,
      done: /* 是否结束 */
    };
  }
};
```

---

**手动实现迭代器**

```javascript
function createIterator(arr) {
  let index = 0;
  
  return {
    next() {
      if (index < arr.length) {
        return {
          value: arr[index++],
          done: false
        };
      }
      return {
        value: undefined,
        done: true
      };
    }
  };
}

// 使用
const iterator = createIterator([1, 2, 3]);

console.log(iterator.next());  // { value: 1, done: false }
console.log(iterator.next());  // { value: 2, done: false }
console.log(iterator.next());  // { value: 3, done: false }
console.log(iterator.next());  // { value: undefined, done: true }
```

---

**可迭代协议 vs 迭代器协议**

**可迭代协议（Iterable Protocol）**
- 实现 `[Symbol.iterator]()` 方法
- 返回一个迭代器对象

```javascript
const iterable = {
  [Symbol.iterator]() {
    // 返回迭代器
    return iterator;
  }
};
```

**迭代器协议（Iterator Protocol）**
- 实现 `next()` 方法
- 返回 `{ value, done }` 对象

```javascript
const iterator = {
  next() {
    return { value: 1, done: false };
  }
};
```

---

**完整示例**

```javascript
// 可迭代对象
const range = {
  from: 1,
  to: 5,
  
  // 实现可迭代协议
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    
    // 返回迭代器对象
    return {
      // 实现迭代器协议
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

// 使用
for (const num of range) {
  console.log(num);  // 1, 2, 3, 4, 5
}

// 展开运算符
console.log([...range]);  // [1, 2, 3, 4, 5]
```

---

**内置可迭代对象**

```javascript
// Array
const arr = [1, 2, 3];
const arrIterator = arr[Symbol.iterator]();

// String
const str = 'abc';
const strIterator = str[Symbol.iterator]();

// Map
const map = new Map([['a', 1]]);
const mapIterator = map[Symbol.iterator]();

// Set
const set = new Set([1, 2, 3]);
const setIterator = set[Symbol.iterator]();

// 所有都有 next() 方法
arrIterator.next();  // { value: 1, done: false }
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 生成器基础

### 题目

生成器函数使用什么关键字定义？

**选项：**
- A. `generator`
- B. `function*`
- C. `async function`
- D. `yield`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**生成器函数（Generator Function）**

使用 `function*` 定义。

```javascript
// 生成器函数
function* generator() {
  yield 1;
  yield 2;
  yield 3;
}

// 调用生成器函数返回生成器对象
const gen = generator();

// 生成器对象是迭代器
console.log(gen.next());  // { value: 1, done: false }
console.log(gen.next());  // { value: 2, done: false }
console.log(gen.next());  // { value: 3, done: false }
console.log(gen.next());  // { value: undefined, done: true }
```

---

**生成器的语法形式**

```javascript
// 函数声明
function* gen1() {}

// 函数表达式
const gen2 = function*() {};

// 对象方法
const obj = {
  *gen3() {}
};

// 类方法
class MyClass {
  *gen4() {}
  static *gen5() {}
}
```

---

**yield 关键字**

```javascript
function* generator() {
  console.log('start');
  
  yield 1;  // 暂停，返回 1
  console.log('middle');
  
  yield 2;  // 暂停，返回 2
  console.log('end');
  
  return 3;  // 结束，返回 3
}

const gen = generator();

gen.next();  // "start" → { value: 1, done: false }
gen.next();  // "middle" → { value: 2, done: false }
gen.next();  // "end" → { value: 3, done: true }
```

---

**生成器 vs 普通函数**

```javascript
// 普通函数
function normal() {
  console.log(1);
  console.log(2);
  console.log(3);
}

normal();  // 一次性执行完
// 输出：1, 2, 3

// 生成器函数
function* generator() {
  console.log(1);
  yield;
  console.log(2);
  yield;
  console.log(3);
}

const gen = generator();
gen.next();  // 输出 1，暂停
gen.next();  // 输出 2，暂停
gen.next();  // 输出 3，结束
```

---

**生成器的特点**

1. **惰性求值**
```javascript
function* infinite() {
  let i = 0;
  while (true) {
    yield i++;
  }
}

const gen = infinite();
gen.next().value;  // 0
gen.next().value;  // 1
// 不会无限循环
```

2. **可暂停和恢复**
```javascript
function* pausable() {
  console.log('start');
  yield;  // 暂停
  console.log('resume');
}

const gen = pausable();
gen.next();  // "start"
// ... 做其他事情
gen.next();  // "resume"
```

3. **状态保持**
```javascript
function* counter() {
  let count = 0;
  while (true) {
    yield count++;
  }
}

const gen = counter();
gen.next().value;  // 0
gen.next().value;  // 1
gen.next().value;  // 2
// count 状态被保持
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** for...of

### 题目

`for...of` 循环只能用于数组。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**for...of 可以遍历所有可迭代对象**

```javascript
// 数组
for (const item of [1, 2, 3]) {
  console.log(item);
}

// 字符串
for (const char of 'abc') {
  console.log(char);  // 'a', 'b', 'c'
}

// Set
for (const value of new Set([1, 2, 3])) {
  console.log(value);
}

// Map
for (const [key, value] of new Map([['a', 1]])) {
  console.log(key, value);
}

// 生成器
function* gen() {
  yield 1;
  yield 2;
}

for (const num of gen()) {
  console.log(num);
}

// arguments 对象
function foo() {
  for (const arg of arguments) {
    console.log(arg);
  }
}
foo(1, 2, 3);

// NodeList
for (const element of document.querySelectorAll('div')) {
  console.log(element);
}

// 自定义可迭代对象
const iterable = {
  *[Symbol.iterator]() {
    yield 1;
    yield 2;
  }
};

for (const value of iterable) {
  console.log(value);
}
```

---

**for...of vs for...in**

```javascript
const arr = [10, 20, 30];
arr.foo = 'bar';

// for...in：遍历键（包括继承的可枚举属性）
for (const key in arr) {
  console.log(key);  // "0", "1", "2", "foo"
}

// for...of：遍历值（只遍历可迭代对象的值）
for (const value of arr) {
  console.log(value);  // 10, 20, 30
}
```

---

**不可迭代的对象**

```javascript
// ❌ 普通对象不可迭代
const obj = { a: 1, b: 2 };
for (const item of obj) {  // TypeError
  console.log(item);
}

// ✅ 使用 Object.keys/values/entries
for (const key of Object.keys(obj)) {
  console.log(key);
}

for (const value of Object.values(obj)) {
  console.log(value);
}

for (const [key, value] of Object.entries(obj)) {
  console.log(key, value);
}
```

---

**提前退出循环**

```javascript
const arr = [1, 2, 3, 4, 5];

for (const num of arr) {
  if (num === 3) {
    break;  // 退出循环
  }
  console.log(num);  // 1, 2
}

for (const num of arr) {
  if (num === 3) {
    continue;  // 跳过当前迭代
  }
  console.log(num);  // 1, 2, 4, 5
}
```

---

**异步迭代**

```javascript
// for...of 不能直接处理 Promise
const promises = [
  Promise.resolve(1),
  Promise.resolve(2)
];

// ❌ 不会等待
for (const promise of promises) {
  console.log(promise);  // Promise 对象
}

// ✅ 使用 await
for (const promise of promises) {
  const value = await promise;
  console.log(value);  // 1, 2
}

// ✅ 或使用 for await...of
async function* asyncGen() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}

for await (const value of asyncGen()) {
  console.log(value);  // 1, 2
}
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** yield 表达式

### 题目

以下代码的输出是什么？

```javascript
function* gen() {
  const x = yield 1;
  console.log('x:', x);
  const y = yield 2;
  console.log('y:', y);
  return 3;
}

const g = gen();
console.log(g.next());
console.log(g.next(10));
console.log(g.next(20));
```

**选项：**
- A. `{ value: 1, done: false }`, `x: 10`, `{ value: 2, done: false }`, `y: 20`, `{ value: 3, done: true }`
- B. `{ value: 1, done: false }`, `{ value: 2, done: false }`, `{ value: 3, done: true }`
- C. `{ value: 1, done: false }`, `x: undefined`, `{ value: 2, done: false }`, `y: 10`, `{ value: 3, done: true }`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**yield 表达式的值**

`yield` 表达式的值由 `next()` 方法的参数决定。

```javascript
function* gen() {
  const x = yield 1;  // x = next() 的参数
  console.log('x:', x);
  const y = yield 2;  // y = next() 的参数
  console.log('y:', y);
  return 3;
}

const g = gen();

// 第一次 next()
g.next();
// 1. 执行到第一个 yield
// 2. 返回 { value: 1, done: false }
// 3. 暂停，x 还未赋值

// 第二次 next(10)
g.next(10);
// 1. 传入 10 作为第一个 yield 的值
// 2. x = 10
// 3. 输出 "x: 10"
// 4. 执行到第二个 yield
// 5. 返回 { value: 2, done: false }

// 第三次 next(20)
g.next(20);
// 1. 传入 20 作为第二个 yield 的值
// 2. y = 20
// 3. 输出 "y: 20"
// 4. 执行 return 3
// 5. 返回 { value: 3, done: true }
```

---

**完整输出**

```javascript
console.log(g.next());      
// { value: 1, done: false }

console.log(g.next(10));    
// "x: 10"
// { value: 2, done: false }

console.log(g.next(20));    
// "y: 20"
// { value: 3, done: true }
```

---

**第一次 next() 的参数被忽略**

```javascript
function* gen() {
  const x = yield 1;
  console.log('x:', x);
}

const g = gen();

// 第一次 next() 的参数被忽略
g.next(999);  // { value: 1, done: false }

g.next(10);   
// "x: 10"
// { value: undefined, done: true }

// 原因：第一次 next() 之前没有 yield 表达式
```

---

**yield 的双向通信**

```javascript
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    const reset = yield a;
    if (reset) {
      a = 0;
      b = 1;
    }
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();

console.log(fib.next().value);    // 0
console.log(fib.next().value);    // 1
console.log(fib.next().value);    // 1
console.log(fib.next().value);    // 2
console.log(fib.next(true).value); // 0（重置）
console.log(fib.next().value);    // 1
```

---

**实际应用：状态机**

```javascript
function* stateMachine() {
  while (true) {
    const action = yield 'idle';
    
    if (action === 'start') {
      const result = yield 'running';
      if (result === 'success') {
        yield 'success';
      } else {
        yield 'error';
      }
    }
  }
}

const machine = stateMachine();
console.log(machine.next().value);          // "idle"
console.log(machine.next('start').value);   // "running"
console.log(machine.next('success').value); // "success"
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** yield*

### 题目

以下代码的输出是什么？

```javascript
function* gen1() {
  yield 1;
  yield 2;
}

function* gen2() {
  yield* gen1();
  yield 3;
}

const g = gen2();
console.log([...g]);
```

**选项：**
- A. `[1, 2, 3]`
- B. `[[1, 2], 3]`
- C. `[gen1(), 3]`
- D. `[1, 3]`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**yield* 委托**

`yield*` 将迭代委托给另一个生成器或可迭代对象。

```javascript
function* gen1() {
  yield 1;
  yield 2;
}

function* gen2() {
  yield* gen1();  // 委托给 gen1
  yield 3;
}

const g = gen2();
console.log([...g]);  // [1, 2, 3]

// 等价于
function* gen2() {
  yield 1;  // 来自 gen1
  yield 2;  // 来自 gen1
  yield 3;
}
```

---

**yield vs yield***

```javascript
function* gen1() {
  yield 1;
  yield 2;
}

function* withYield() {
  yield gen1();  // 返回生成器对象
  yield 3;
}

function* withYieldStar() {
  yield* gen1();  // 委托，展开值
  yield 3;
}

console.log([...withYield()]);     // [gen1(), 3]
console.log([...withYieldStar()]); // [1, 2, 3]
```

---

**委托给可迭代对象**

```javascript
function* gen() {
  yield* [1, 2, 3];  // 委托给数组
  yield* 'abc';      // 委托给字符串
  yield* new Set([4, 5]);  // 委托给 Set
}

console.log([...gen()]);
// [1, 2, 3, 'a', 'b', 'c', 4, 5]
```

---

**yield* 的返回值**

```javascript
function* gen1() {
  yield 1;
  yield 2;
  return 'done';
}

function* gen2() {
  const result = yield* gen1();
  console.log('result:', result);  // "result: done"
  yield 3;
}

const g = gen2();
console.log([...g]);  // [1, 2, 3]
```

---

**嵌套委托**

```javascript
function* gen1() {
  yield 1;
}

function* gen2() {
  yield* gen1();
  yield 2;
}

function* gen3() {
  yield* gen2();
  yield 3;
}

console.log([...gen3()]);  // [1, 2, 3]
```

---

**实际应用：树遍历**

```javascript
class Tree {
  constructor(value, left = null, right = null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
  
  *[Symbol.iterator]() {
    // 中序遍历
    if (this.left) {
      yield* this.left;  // 委托给左子树
    }
    yield this.value;
    if (this.right) {
      yield* this.right;  // 委托给右子树
    }
  }
}

const tree = new Tree(
  2,
  new Tree(1),
  new Tree(3)
);

console.log([...tree]);  // [1, 2, 3]
```

---

**递归生成器**

```javascript
function* flatten(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flatten(item);  // 递归委托
    } else {
      yield item;
    }
  }
}

const nested = [1, [2, [3, [4]]], 5];
console.log([...flatten(nested)]);  // [1, 2, 3, 4, 5]
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** 生成器控制

### 题目

生成器的 `return()` 和 `throw()` 方法有什么作用？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**生成器的三个方法**

```javascript
function* gen() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } catch (e) {
    console.log('Caught:', e);
  }
}

const g = gen();

// next()：恢复执行
g.next();  // { value: 1, done: false }

// return()：提前结束
g.return(99);  // { value: 99, done: true }

// throw()：抛出错误
g.throw(new Error('error'));
```

---

**return() 方法**

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const g = gen();

g.next();    // { value: 1, done: false }
g.return(99);  // { value: 99, done: true }（提前结束）
g.next();    // { value: undefined, done: true }（已结束）
```

**与 finally 的交互：**
```javascript
function* gen() {
  try {
    yield 1;
    yield 2;
  } finally {
    console.log('cleanup');
    yield 'cleanup';
  }
}

const g = gen();
g.next();       // { value: 1, done: false }
g.return(99);   
// "cleanup"
// { value: 'cleanup', done: false }（先执行 finally）

g.next();       
// { value: 99, done: true }（然后 return）
```

---

**throw() 方法**

```javascript
function* gen() {
  try {
    yield 1;
    yield 2;
  } catch (e) {
    console.log('Caught:', e.message);
    yield 'error handled';
  }
  yield 3;
}

const g = gen();

g.next();  // { value: 1, done: false }

g.throw(new Error('Something wrong'));
// "Caught: Something wrong"
// { value: 'error handled', done: false }

g.next();  // { value: 3, done: false }
```

**未捕获的错误：**
```javascript
function* gen() {
  yield 1;
  yield 2;  // 没有 try-catch
}

const g = gen();
g.next();  // { value: 1, done: false }

try {
  g.throw(new Error('error'));  // 抛出到外部
} catch (e) {
  console.log('External catch:', e.message);
}
// "External catch: error"
```

---

**实际应用：取消操作**

```javascript
function* fetchData() {
  try {
    console.log('Fetching...');
    yield fetch('/api/data');
    console.log('Processing...');
    yield processData();
    console.log('Done');
  } finally {
    console.log('Cleanup');
  }
}

const task = fetchData();
task.next();  // 开始

// 取消操作
task.return();  
// "Cleanup"
// 任务被取消
```

---

**实际应用：错误重试**

```javascript
function* retryableTask() {
  let attempts = 0;
  
  while (attempts < 3) {
    try {
      attempts++;
      console.log(`Attempt ${attempts}`);
      
      const result = yield fetch('/api/data');
      return result;
      
    } catch (e) {
      console.log(`Failed: ${e.message}`);
      
      if (attempts >= 3) {
        throw e;  // 超过重试次数
      }
      
      yield new Promise(resolve => 
        setTimeout(resolve, 1000)  // 延迟重试
      );
    }
  }
}

const task = retryableTask();

// 模拟失败
task.next();
task.throw(new Error('Network error'));  // 第一次失败，重试
task.next();
task.throw(new Error('Network error'));  // 第二次失败，重试
task.next();
task.throw(new Error('Network error'));  // 第三次失败，抛出
```

---

**生成器状态管理**

```javascript
function* saga() {
  try {
    yield 'step1';
    yield 'step2';
    yield 'step3';
  } catch (e) {
    yield 'rollback';  // 回滚
  }
  return 'complete';
}

const task = saga();

task.next();  // { value: 'step1', done: false }
task.next();  // { value: 'step2', done: false }

// 出错，触发回滚
task.throw(new Error('Failed'));
// { value: 'rollback', done: false }

task.next();  // { value: 'complete', done: true }
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 异步迭代器

### 题目

关于异步迭代器，以下说法正确的是？

**选项：**
- A. 使用 `[Symbol.asyncIterator]` 实现
- B. `next()` 方法返回 Promise
- C. 可以使用 `for await...of` 遍历
- D. 不能用于同步数据

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**异步迭代器协议**

**A 正确：Symbol.asyncIterator**
```javascript
const asyncIterable = {
  [Symbol.asyncIterator]() {
    return {
      async next() {
        // 返回 Promise
      }
    };
  }
};
```

**B 正确：next() 返回 Promise**
```javascript
const asyncIterator = {
  async next() {
    return {
      value: await fetchData(),
      done: false
    };
  }
};
```

**C 正确：for await...of**
```javascript
async function process() {
  for await (const item of asyncIterable) {
    console.log(item);
  }
}
```

**D 错误：也可用于同步数据**
```javascript
const syncAsAsync = {
  [Symbol.asyncIterator]() {
    let i = 0;
    return {
      async next() {
        if (i < 3) {
          return { value: i++, done: false };
        }
        return { done: true };
      }
    };
  }
};

for await (const num of syncAsAsync) {
  console.log(num);  // 0, 1, 2
}
```

---

**异步生成器**

```javascript
async function* asyncGen() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

// 使用
for await (const num of asyncGen()) {
  console.log(num);  // 1, 2, 3
}
```

---

**实际应用：分页数据**

```javascript
async function* fetchPages(url) {
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();
    
    yield data.items;
    
    hasMore = data.hasMore;
    page++;
  }
}

// 使用
for await (const items of fetchPages('/api/users')) {
  console.log('Page:', items);
}
```

---

**实际应用：流式数据**

```javascript
async function* readStream(stream) {
  const reader = stream.getReader();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

// 使用
const response = await fetch('/api/large-file');
for await (const chunk of readStream(response.body)) {
  console.log('Chunk:', chunk);
}
```

---

**异步迭代器 vs 同步迭代器**

| 特性 | 同步迭代器 | 异步迭代器 |
|------|-----------|-----------|
| 协议 | `Symbol.iterator` | `Symbol.asyncIterator` |
| next() | 同步 | 返回 Promise |
| 遍历 | `for...of` | `for await...of` |
| 函数 | `function*` | `async function*` |

```javascript
// 同步迭代器
function* syncGen() {
  yield 1;
  yield 2;
}

for (const num of syncGen()) {
  console.log(num);
}

// 异步迭代器
async function* asyncGen() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}

for await (const num of asyncGen()) {
  console.log(num);
}
```

---

**转换同步迭代器为异步**

```javascript
async function* toAsync(syncIterable) {
  for (const item of syncIterable) {
    yield item;
  }
}

const arr = [1, 2, 3];
for await (const num of toAsync(arr)) {
  console.log(num);
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** 自定义可迭代对象

### 题目

实现一个支持正向和反向迭代的可迭代对象。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

**双向迭代器**

```javascript
class BiDirectionalIterable {
  constructor(data) {
    this.data = data;
  }
  
  // 正向迭代
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
  
  // 反向迭代
  reverse() {
    const data = this.data;
    let index = data.length - 1;
    
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        if (index >= 0) {
          return {
            value: data[index--],
            done: false
          };
        }
        return { done: true };
      }
    };
  }
}

// 使用
const iterable = new BiDirectionalIterable([1, 2, 3, 4, 5]);

// 正向
console.log([...iterable]);  // [1, 2, 3, 4, 5]

// 反向
console.log([...iterable.reverse()]);  // [5, 4, 3, 2, 1]
```

---

**带索引的迭代器**

```javascript
class IndexedIterable {
  constructor(data) {
    this.data = data;
  }
  
  *[Symbol.iterator]() {
    for (let i = 0; i < this.data.length; i++) {
      yield [i, this.data[i]];
    }
  }
  
  *entries() {
    yield* this[Symbol.iterator]();
  }
  
  *keys() {
    for (let i = 0; i < this.data.length; i++) {
      yield i;
    }
  }
  
  *values() {
    yield* this.data;
  }
}

const iterable = new IndexedIterable(['a', 'b', 'c']);

for (const [index, value] of iterable) {
  console.log(index, value);  // 0 'a', 1 'b', 2 'c'
}

console.log([...iterable.keys()]);    // [0, 1, 2]
console.log([...iterable.values()]);  // ['a', 'b', 'c']
```

---

**可过滤的迭代器**

```javascript
class FilterableIterable {
  constructor(data) {
    this.data = data;
  }
  
  *[Symbol.iterator]() {
    yield* this.data;
  }
  
  *filter(predicate) {
    for (const item of this.data) {
      if (predicate(item)) {
        yield item;
      }
    }
  }
  
  *map(fn) {
    for (const item of this.data) {
      yield fn(item);
    }
  }
  
  *take(n) {
    let count = 0;
    for (const item of this.data) {
      if (count++ >= n) break;
      yield item;
    }
  }
  
  *skip(n) {
    let count = 0;
    for (const item of this.data) {
      if (count++ < n) continue;
      yield item;
    }
  }
}

const iterable = new FilterableIterable([1, 2, 3, 4, 5]);

console.log([...iterable.filter(x => x % 2 === 0)]);  // [2, 4]
console.log([...iterable.map(x => x * 2)]);           // [2, 4, 6, 8, 10]
console.log([...iterable.take(3)]);                   // [1, 2, 3]
console.log([...iterable.skip(2)]);                   // [3, 4, 5]
```

---

**惰性迭代器**

```javascript
class LazyIterable {
  constructor(source) {
    this.source = source;
  }
  
  *[Symbol.iterator]() {
    yield* this.source;
  }
  
  map(fn) {
    const source = this.source;
    return new LazyIterable(function*() {
      for (const item of source) {
        yield fn(item);
      }
    }());
  }
  
  filter(predicate) {
    const source = this.source;
    return new LazyIterable(function*() {
      for (const item of source) {
        if (predicate(item)) {
          yield item;
        }
      }
    }());
  }
  
  take(n) {
    const source = this.source;
    return new LazyIterable(function*() {
      let count = 0;
      for (const item of source) {
        if (count++ >= n) break;
        yield item;
      }
    }());
  }
  
  toArray() {
    return [...this];
  }
}

// 使用（惰性求值）
const iterable = new LazyIterable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

const result = iterable
  .filter(x => x % 2 === 0)  // 不立即执行
  .map(x => x * 2)           // 不立即执行
  .take(3)                   // 不立即执行
  .toArray();                // 此时才执行

console.log(result);  // [4, 8, 12]
```

---

**无限迭代器**

```javascript
class InfiniteIterable {
  static *range(start = 0, step = 1) {
    let current = start;
    while (true) {
      yield current;
      current += step;
    }
  }
  
  static *repeat(value) {
    while (true) {
      yield value;
    }
  }
  
  static *cycle(iterable) {
    const saved = [...iterable];
    while (true) {
      yield* saved;
    }
  }
}

// 使用
const range = InfiniteIterable.range(1);
for (const num of range) {
  if (num > 5) break;
  console.log(num);  // 1, 2, 3, 4, 5
}

const repeat = InfiniteIterable.repeat('x');
console.log([...new LazyIterable(repeat).take(3)]);  // ['x', 'x', 'x']

const cycle = InfiniteIterable.cycle([1, 2, 3]);
console.log([...new LazyIterable(cycle).take(7)]);  // [1, 2, 3, 1, 2, 3, 1]
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** 生成器协程

### 题目

如何使用生成器实现协程（Coroutine）？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**生成器实现协程**

协程是可以暂停和恢复的函数，生成器天然支持这一特性。

```javascript
function* task1() {
  console.log('Task 1: Step 1');
  yield;
  console.log('Task 1: Step 2');
  yield;
  console.log('Task 1: Step 3');
}

function* task2() {
  console.log('Task 2: Step 1');
  yield;
  console.log('Task 2: Step 2');
  yield;
  console.log('Task 2: Step 3');
}

// 调度器
function* scheduler(tasks) {
  const generators = tasks.map(task => task());
  
  while (true) {
    let allDone = true;
    
    for (const gen of generators) {
      const { done } = gen.next();
      if (!done) {
        allDone = false;
      }
    }
    
    if (allDone) break;
    yield;  // 让出控制权
  }
}

// 运行
const tasks = scheduler([task1, task2]);
while (!tasks.next().done) {
  // 继续调度
}

// 输出（交替执行）：
// Task 1: Step 1
// Task 2: Step 1
// Task 1: Step 2
// Task 2: Step 2
// Task 1: Step 3
// Task 2: Step 3
```

---

**异步协程**

```javascript
function run(generator) {
  const gen = generator();
  
  function handle(result) {
    if (result.done) return Promise.resolve(result.value);
    
    return Promise.resolve(result.value)
      .then(
        res => handle(gen.next(res)),
        err => handle(gen.throw(err))
      );
  }
  
  return handle(gen.next());
}

// 使用
function* fetchData() {
  try {
    const user = yield fetch('/api/user');
    console.log('User:', user);
    
    const posts = yield fetch(`/api/posts/${user.id}`);
    console.log('Posts:', posts);
    
    return posts;
  } catch (error) {
    console.error('Error:', error);
  }
}

run(fetchData);
// 类似 async/await，但用生成器实现
```

---

**Co 库的简化实现**

```javascript
function co(generator) {
  return new Promise((resolve, reject) => {
    const gen = generator();
    
    function step(nextFn) {
      let result;
      
      try {
        result = nextFn();
      } catch (e) {
        return reject(e);
      }
      
      if (result.done) {
        return resolve(result.value);
      }
      
      Promise.resolve(result.value)
        .then(
          value => step(() => gen.next(value)),
          err => step(() => gen.throw(err))
        );
    }
    
    step(() => gen.next());
  });
}

// 使用
co(function*() {
  const a = yield Promise.resolve(1);
  const b = yield Promise.resolve(2);
  const c = yield Promise.resolve(3);
  return a + b + c;
}).then(result => {
  console.log(result);  // 6
});
```

---

**生成器实现 async/await**

```javascript
// 模拟 async
function async(generator) {
  return function(...args) {
    return co(generator.bind(this, ...args));
  };
}

// 使用
const fetchUser = async(function*() {
  const response = yield fetch('/api/user');
  const user = yield response.json();
  return user;
});

fetchUser().then(user => {
  console.log(user);
});

// 等价于真正的 async/await
async function fetchUser() {
  const response = await fetch('/api/user');
  const user = await response.json();
  return user;
}
```

---

**实际应用：任务队列**

```javascript
class TaskQueue {
  constructor() {
    this.tasks = [];
    this.running = false;
  }
  
  *run() {
    this.running = true;
    
    while (this.tasks.length > 0) {
      const task = this.tasks.shift();
      
      try {
        yield task();
      } catch (error) {
        console.error('Task error:', error);
      }
    }
    
    this.running = false;
  }
  
  add(task) {
    this.tasks.push(task);
    
    if (!this.running) {
      const gen = this.run();
      const execute = () => {
        const { done } = gen.next();
        if (!done) {
          setTimeout(execute, 0);  // 下一个事件循环
        }
      };
      execute();
    }
  }
}

// 使用
const queue = new TaskQueue();

queue.add(function*() {
  console.log('Task 1');
  yield;
});

queue.add(function*() {
  console.log('Task 2');
  yield;
});
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 迭代器实际应用

### 题目

使用迭代器和生成器实现一个数据流处理管道。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

**数据流处理管道**

```javascript
class Pipeline {
  constructor(source) {
    this.source = source;
  }
  
  static from(iterable) {
    return new Pipeline(function*() {
      yield* iterable;
    }());
  }
  
  *[Symbol.iterator]() {
    yield* this.source;
  }
  
  map(fn) {
    const source = this.source;
    return new Pipeline(function*() {
      for (const item of source) {
        yield fn(item);
      }
    }());
  }
  
  filter(predicate) {
    const source = this.source;
    return new Pipeline(function*() {
      for (const item of source) {
        if (predicate(item)) {
          yield item;
        }
      }
    }());
  }
  
  flatMap(fn) {
    const source = this.source;
    return new Pipeline(function*() {
      for (const item of source) {
        yield* fn(item);
      }
    }());
  }
  
  take(n) {
    const source = this.source;
    return new Pipeline(function*() {
      let count = 0;
      for (const item of source) {
        if (count++ >= n) break;
        yield item;
      }
    }());
  }
  
  skip(n) {
    const source = this.source;
    return new Pipeline(function*() {
      let count = 0;
      for (const item of source) {
        if (count++ < n) continue;
        yield item;
      }
    }());
  }
  
  reduce(fn, initial) {
    let accumulator = initial;
    for (const item of this.source) {
      accumulator = fn(accumulator, item);
    }
    return accumulator;
  }
  
  toArray() {
    return [...this.source];
  }
  
  forEach(fn) {
    for (const item of this.source) {
      fn(item);
    }
  }
}

// 使用
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = Pipeline.from(data)
  .filter(x => x % 2 === 0)      // [2, 4, 6, 8, 10]
  .map(x => x * 2)               // [4, 8, 12, 16, 20]
  .take(3)                       // [4, 8, 12]
  .toArray();

console.log(result);  // [4, 8, 12]
```

---

**异步数据流管道**

```javascript
class AsyncPipeline {
  constructor(source) {
    this.source = source;
  }
  
  static from(asyncIterable) {
    return new AsyncPipeline(async function*() {
      yield* asyncIterable;
    }());
  }
  
  async *[Symbol.asyncIterator]() {
    yield* this.source;
  }
  
  map(fn) {
    const source = this.source;
    return new AsyncPipeline(async function*() {
      for await (const item of source) {
        yield await fn(item);
      }
    }());
  }
  
  filter(predicate) {
    const source = this.source;
    return new AsyncPipeline(async function*() {
      for await (const item of source) {
        if (await predicate(item)) {
          yield item;
        }
      }
    }());
  }
  
  take(n) {
    const source = this.source;
    return new AsyncPipeline(async function*() {
      let count = 0;
      for await (const item of source) {
        if (count++ >= n) break;
        yield item;
      }
    }());
  }
  
  async toArray() {
    const result = [];
    for await (const item of this.source) {
      result.push(item);
    }
    return result;
  }
  
  async forEach(fn) {
    for await (const item of this.source) {
      await fn(item);
    }
  }
}

// 使用
async function* fetchPages() {
  for (let page = 1; page <= 5; page++) {
    yield await fetch(`/api/data?page=${page}`).then(r => r.json());
  }
}

async function process() {
  const result = await AsyncPipeline.from(fetchPages())
    .filter(data => data.length > 0)
    .map(data => data[0])
    .take(3)
    .toArray();
  
  console.log(result);
}
```

---

**实际应用：日志处理**

```javascript
class LogProcessor {
  static *readLogs(file) {
    // 模拟读取日志文件
    const lines = [
      '[ERROR] Failed to connect',
      '[INFO] Server started',
      '[ERROR] Database error',
      '[WARN] High memory usage',
      '[INFO] Request processed'
    ];
    yield* lines;
  }
  
  static process(logs) {
    return Pipeline.from(logs)
      .filter(line => line.includes('[ERROR]'))
      .map(line => ({
        level: 'ERROR',
        message: line.replace('[ERROR]', '').trim(),
        timestamp: new Date()
      }))
      .toArray();
  }
}

const errors = LogProcessor.process(
  LogProcessor.readLogs('app.log')
);

console.log(errors);
// [
//   { level: 'ERROR', message: 'Failed to connect', timestamp: ... },
//   { level: 'ERROR', message: 'Database error', timestamp: ... }
// ]
```

---

**实际应用：ETL 数据处理**

```javascript
async function* extract(source) {
  // 提取数据
  for await (const batch of source) {
    yield batch;
  }
}

async function* transform(data) {
  // 转换数据
  for await (const item of data) {
    yield {
      ...item,
      processed: true,
      timestamp: Date.now()
    };
  }
}

async function load(data) {
  // 加载数据
  const items = [];
  for await (const item of data) {
    items.push(item);
  }
  // 批量插入数据库
  await database.insert(items);
}

// ETL 流程
async function etl(source) {
  await load(transform(extract(source)));
}
```

</details>

---

**本章总结：**
- ✅ 迭代器协议
- ✅ 生成器函数
- ✅ for...of 循环
- ✅ yield 表达式
- ✅ yield* 委托
- ✅ 生成器控制方法
- ✅ 异步迭代器
- ✅ 自定义可迭代对象
- ✅ 生成器协程
- ✅ 数据流管道

**下一章：** [第 18 章：Promise 规范与实现](./chapter-18.md)
