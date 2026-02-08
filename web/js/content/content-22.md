# Generator 与迭代器

> 掌握 JavaScript 的迭代协议与生成器函数

---

## 概述

Generator 和迭代器是 ES6 引入的强大特性。迭代器协议定义了遍历数据的标准方式，Generator 提供了创建迭代器的简便方法，同时支持暂停和恢复函数执行。

本章将深入：
- 迭代器协议
- 可迭代对象
- Generator 函数
- yield 表达式
- Generator 的应用场景

---

## 1. 迭代器协议

### 1.1 迭代器接口

```javascript
// 迭代器对象必须实现 next() 方法
const iterator = {
  next() {
    return {
      value: /* 当前值 */,
      done: /* 是否完成 */
    };
  }
};

// 手动实现迭代器
function createRangeIterator(start, end) {
  let current = start;
  
  return {
    next() {
      if (current <= end) {
        return { value: current++, done: false };
      } else {
        return { value: undefined, done: true };
      }
    }
  };
}

// 使用
const iterator = createRangeIterator(1, 3);

console.log(iterator.next());  // { value: 1, done: false }
console.log(iterator.next());  // { value: 2, done: false }
console.log(iterator.next());  // { value: 3, done: false }
console.log(iterator.next());  // { value: undefined, done: true }
```

### 1.2 可迭代协议

```javascript
// 可迭代对象必须实现 [Symbol.iterator] 方法
const iterable = {
  [Symbol.iterator]() {
    // 返回迭代器
    return createRangeIterator(1, 3);
  }
};

// 使用 for...of
for (const value of iterable) {
  console.log(value);  // 1, 2, 3
}

// 使用展开运算符
const array = [...iterable];
console.log(array);  // [1, 2, 3]

// 使用解构
const [a, b, c] = iterable;
console.log(a, b, c);  // 1, 2, 3
```

### 1.3 内置可迭代对象

```javascript
// Array
const arr = [1, 2, 3];
for (const value of arr) {
  console.log(value);
}

// String
const str = "Hello";
for (const char of str) {
  console.log(char);  // H, e, l, l, o
}

// Map
const map = new Map([['a', 1], ['b', 2]]);
for (const [key, value] of map) {
  console.log(key, value);
}

// Set
const set = new Set([1, 2, 3]);
for (const value of set) {
  console.log(value);
}

// arguments
function test() {
  for (const arg of arguments) {
    console.log(arg);
  }
}
test(1, 2, 3);

// NodeList
const elements = document.querySelectorAll('div');
for (const element of elements) {
  console.log(element);
}
```

---

## 2. 自定义可迭代对象

### 2.1 简单示例

```javascript
// 自定义范围对象
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
        } else {
          return { done: true };
        }
      }
    };
  }
}

// 使用
const range = new Range(1, 5);

for (const num of range) {
  console.log(num);  // 1, 2, 3, 4, 5
}

console.log([...range]);  // [1, 2, 3, 4, 5]
```

### 2.2 链表迭代器

```javascript
class LinkedListNode {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }
  
  add(value) {
    const node = new LinkedListNode(value);
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
  }
  
  [Symbol.iterator]() {
    let current = this.head;
    
    return {
      next() {
        if (current) {
          const value = current.value;
          current = current.next;
          return { value, done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
}

// 使用
const list = new LinkedList();
list.add(1);
list.add(2);
list.add(3);

for (const value of list) {
  console.log(value);  // 1, 2, 3
}
```

### 2.3 无限迭代器

```javascript
class Fibonacci {
  [Symbol.iterator]() {
    let prev = 0, curr = 1;
    
    return {
      next() {
        [prev, curr] = [curr, prev + curr];
        return { value: curr, done: false };
      }
    };
  }
}

// 使用（注意：需要手动终止）
const fib = new Fibonacci();
const iterator = fib[Symbol.iterator]();

for (let i = 0; i < 10; i++) {
  console.log(iterator.next().value);
}
// 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
```

---

## 3. Generator 函数

### 3.1 基本语法

```javascript
// Generator 函数定义（function*）
function* generatorFunction() {
  yield 1;
  yield 2;
  yield 3;
}

// 调用 Generator 函数返回 Generator 对象
const generator = generatorFunction();

console.log(generator.next());  // { value: 1, done: false }
console.log(generator.next());  // { value: 2, done: false }
console.log(generator.next());  // { value: 3, done: false }
console.log(generator.next());  // { value: undefined, done: true }

// Generator 对象是可迭代的
const gen = generatorFunction();
for (const value of gen) {
  console.log(value);  // 1, 2, 3
}
```

### 3.2 yield 表达式

```javascript
function* gen() {
  const a = yield 1;
  console.log('a:', a);
  
  const b = yield 2;
  console.log('b:', b);
  
  return 3;
}

const generator = gen();

console.log(generator.next());      // { value: 1, done: false }
console.log(generator.next('A'));   // a: A, { value: 2, done: false }
console.log(generator.next('B'));   // b: B, { value: 3, done: true }

// yield 表达式的值是 next() 传入的参数
```

### 3.3 yield*

```javascript
function* gen1() {
  yield 1;
  yield 2;
}

function* gen2() {
  yield 'a';
  yield* gen1();  // 委托给另一个 generator
  yield 'b';
}

const generator = gen2();

for (const value of generator) {
  console.log(value);  // a, 1, 2, b
}

// yield* 可以委托给任何可迭代对象
function* gen3() {
  yield* [1, 2, 3];
  yield* "Hello";
}

console.log([...gen3()]);
// [1, 2, 3, 'H', 'e', 'l', 'l', 'o']
```

---

## 4. Generator 实现迭代器

### 4.1 简化迭代器创建

```javascript
// 传统方式
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
        } else {
          return { done: true };
        }
      }
    };
  }
}

// Generator 方式（更简洁）
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

// 使用相同
const range = new Range(1, 5);
console.log([...range]);  // [1, 2, 3, 4, 5]
```

### 4.2 树的遍历

```javascript
class TreeNode {
  constructor(value, children = []) {
    this.value = value;
    this.children = children;
  }
  
  // 深度优先遍历
  *depthFirst() {
    yield this.value;
    for (const child of this.children) {
      yield* child.depthFirst();
    }
  }
  
  // 广度优先遍历
  *breadthFirst() {
    const queue = [this];
    
    while (queue.length > 0) {
      const node = queue.shift();
      yield node.value;
      queue.push(...node.children);
    }
  }
}

// 构建树
const tree = new TreeNode(1, [
  new TreeNode(2, [
    new TreeNode(4),
    new TreeNode(5)
  ]),
  new TreeNode(3, [
    new TreeNode(6),
    new TreeNode(7)
  ])
]);

console.log([...tree.depthFirst()]);
// [1, 2, 4, 5, 3, 6, 7]

console.log([...tree.breadthFirst()]);
// [1, 2, 3, 4, 5, 6, 7]
```

### 4.3 无限序列

```javascript
// 斐波那契数列
function* fibonacci() {
  let prev = 0, curr = 1;
  
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

// 取前 10 个
function* take(n, iterable) {
  let count = 0;
  for (const value of iterable) {
    if (count++ >= n) break;
    yield value;
  }
}

const fib = fibonacci();
console.log([...take(10, fib)]);
// [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]

// 随机数生成器
function* randomNumbers() {
  while (true) {
    yield Math.random();
  }
}

const random = randomNumbers();
console.log([...take(5, random)]);
// [0.123..., 0.456..., 0.789..., ...]
```

---

## 5. Generator 的控制流

### 5.1 return() 方法

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const generator = gen();

console.log(generator.next());      // { value: 1, done: false }
console.log(generator.return(99));  // { value: 99, done: true }
console.log(generator.next());      // { value: undefined, done: true }

// return() 提前终止 generator
```

### 5.2 throw() 方法

```javascript
function* gen() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } catch (e) {
    console.log('捕获错误:', e.message);
  }
}

const generator = gen();

console.log(generator.next());           // { value: 1, done: false }
console.log(generator.throw(new Error('出错了')));
// 捕获错误: 出错了
// { value: undefined, done: true }
```

### 5.3 try-finally

```javascript
function* gen() {
  try {
    yield 1;
    yield 2;
  } finally {
    console.log('清理资源');
  }
}

const generator = gen();

console.log(generator.next());    // { value: 1, done: false }
console.log(generator.return());  // 清理资源, { value: undefined, done: true }

// finally 块总是会执行
```

---

## 6. Generator 的应用

### 6.1 状态机

```javascript
function* trafficLight() {
  while (true) {
    yield 'red';
    yield 'yellow';
    yield 'green';
  }
}

const light = trafficLight();

console.log(light.next().value);  // red
console.log(light.next().value);  // yellow
console.log(light.next().value);  // green
console.log(light.next().value);  // red
// ...循环
```

### 6.2 异步流程控制（co 库原理）

```javascript
function* fetchUser() {
  const user = yield fetch('/api/user').then(r => r.json());
  console.log('用户:', user);
  
  const posts = yield fetch(`/api/posts/${user.id}`).then(r => r.json());
  console.log('文章:', posts);
  
  return { user, posts };
}

// 简化的 co 实现
function co(generator) {
  const gen = generator();
  
  function step(value) {
    const result = gen.next(value);
    
    if (result.done) {
      return Promise.resolve(result.value);
    }
    
    return Promise.resolve(result.value).then(step);
  }
  
  return step();
}

// 使用
co(fetchUser).then(data => {
  console.log('完成:', data);
});
```

### 6.3 延迟计算

```javascript
// 延迟生成数据
function* lazyMap(iterable, fn) {
  for (const value of iterable) {
    yield fn(value);
  }
}

function* lazyFilter(iterable, predicate) {
  for (const value of iterable) {
    if (predicate(value)) {
      yield value;
    }
  }
}

// 使用
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = lazyFilter(
  lazyMap(numbers, x => x * 2),
  x => x > 10
);

// 数据按需生成，不创建中间数组
console.log([...result]);  // [12, 14, 16, 18, 20]
```

### 6.4 分页数据获取

```javascript
function* fetchPages(baseUrl) {
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = yield fetch(`${baseUrl}?page=${page}`);
    const data = yield response.json();
    
    yield data.items;
    
    hasMore = data.hasMore;
    page++;
  }
}

// 使用（配合 co）
async function getAllItems(baseUrl) {
  const items = [];
  const generator = fetchPages(baseUrl);
  
  let result = generator.next();
  
  while (!result.done) {
    if (result.value instanceof Promise) {
      result = generator.next(await result.value);
    } else if (Array.isArray(result.value)) {
      items.push(...result.value);
      result = generator.next();
    }
  }
  
  return items;
}
```

---

## 7. 迭代器工具函数

### 7.1 map、filter、reduce

```javascript
function* map(iterable, fn) {
  for (const value of iterable) {
    yield fn(value);
  }
}

function* filter(iterable, predicate) {
  for (const value of iterable) {
    if (predicate(value)) {
      yield value;
    }
  }
}

function reduce(iterable, fn, initial) {
  let accumulator = initial;
  
  for (const value of iterable) {
    accumulator = fn(accumulator, value);
  }
  
  return accumulator;
}

// 使用
const numbers = [1, 2, 3, 4, 5];

const doubled = map(numbers, x => x * 2);
const evens = filter(doubled, x => x % 2 === 0);
const sum = reduce(evens, (a, b) => a + b, 0);

console.log(sum);  // 30 (2 + 4 + 6 + 8 + 10)
```

### 7.2 take、skip、zip

```javascript
function* take(n, iterable) {
  let count = 0;
  for (const value of iterable) {
    if (count++ >= n) break;
    yield value;
  }
}

function* skip(n, iterable) {
  let count = 0;
  for (const value of iterable) {
    if (count++ < n) continue;
    yield value;
  }
}

function* zip(...iterables) {
  const iterators = iterables.map(it => it[Symbol.iterator]());
  
  while (true) {
    const results = iterators.map(it => it.next());
    
    if (results.some(r => r.done)) break;
    
    yield results.map(r => r.value);
  }
}

// 使用
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log([...take(3, numbers)]);
// [1, 2, 3]

console.log([...skip(7, numbers)]);
// [8, 9, 10]

console.log([...zip([1, 2, 3], ['a', 'b', 'c'])]);
// [[1, 'a'], [2, 'b'], [3, 'c']]
```

### 7.3 chain、flat

```javascript
function* chain(...iterables) {
  for (const iterable of iterables) {
    yield* iterable;
  }
}

function* flat(iterable, depth = 1) {
  for (const value of iterable) {
    if (depth > 0 && value[Symbol.iterator]) {
      yield* flat(value, depth - 1);
    } else {
      yield value;
    }
  }
}

// 使用
console.log([...chain([1, 2], [3, 4], [5, 6])]);
// [1, 2, 3, 4, 5, 6]

console.log([...flat([[1, 2], [3, [4, 5]], 6])]);
// [1, 2, 3, [4, 5], 6]

console.log([...flat([[1, 2], [3, [4, 5]], 6], 2)]);
// [1, 2, 3, 4, 5, 6]
```

---

## 8. 性能考虑

### 8.1 惰性求值

```javascript
// ✅ Generator 惰性求值（高效）
function* lazyRange(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

const large = lazyRange(1, 1000000);
const first10 = [...take(10, large)];
// 只生成前 10 个数字

// ❌ 立即求值（低效）
function eagerRange(start, end) {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

const large2 = eagerRange(1, 1000000);  // 立即创建 100 万个元素
const first10_2 = large2.slice(0, 10);
```

### 8.2 内存效率

```javascript
// 处理大文件
function* readLargeFile(filename) {
  // 逐行读取，不加载整个文件
  const lines = fs.readFileSync(filename, 'utf-8').split('\n');
  
  for (const line of lines) {
    yield line;
  }
}

// 使用
for (const line of readLargeFile('huge.txt')) {
  processLine(line);
  // 只在内存中保存一行
}
```

---

## 关键要点

1. **迭代器协议**
   - next() 方法返回 { value, done }
   - 迭代器可以手动创建
   - 用于自定义遍历逻辑

2. **可迭代协议**
   - [Symbol.iterator] 方法返回迭代器
   - 可用于 for...of、展开运算符
   - 内置类型大多可迭代

3. **Generator 函数**
   - function* 定义
   - yield 产生值
   - yield* 委托
   - 可暂停和恢复

4. **Generator 应用**
   - 简化迭代器创建
   - 状态机
   - 异步流程控制
   - 延迟计算

5. **性能优势**
   - 惰性求值
   - 内存高效
   - 按需生成数据

---

## 深入一点

### Generator 的内部状态

```javascript
function* gen() {
  console.log('状态 1');
  yield 1;
  
  console.log('状态 2');
  yield 2;
  
  console.log('状态 3');
  return 3;
}

const g = gen();

g.next();  // 状态 1, { value: 1, done: false }
g.next();  // 状态 2, { value: 2, done: false }
g.next();  // 状态 3, { value: 3, done: true }

// Generator 内部维护执行状态，可以暂停和恢复
```

### Generator 实现协程

```javascript
// 协程：多个函数协作执行
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
function schedule(...tasks) {
  const iterators = tasks.map(t => t());
  
  while (iterators.length > 0) {
    for (let i = 0; i < iterators.length; i++) {
      const result = iterators[i].next();
      
      if (result.done) {
        iterators.splice(i, 1);
        i--;
      }
    }
  }
}

schedule(task1, task2);
// Task 1: Step 1
// Task 2: Step 1
// Task 1: Step 2
// Task 2: Step 2
// Task 1: Step 3
// Task 2: Step 3
```

---

## 参考资料

- [MDN: Iterators and generators](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Iterators_and_Generators)
- [MDN: Iteration protocols](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols)
- [Exploring ES6: Generators](https://exploringjs.com/es6/ch_generators.html)

---

**上一章**：[事件循环机制](./content-21.md)  
**下一章**：[并发模式与实践](./content-23.md)
