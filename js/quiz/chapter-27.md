# 第 27 章：TC39 提案与未来特性 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** TC39 流程

### 题目

TC39 提案需要经过几个阶段？

**选项：**
- A. 3 个阶段
- B. 4 个阶段
- C. 5 个阶段
- D. 6 个阶段

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**TC39 五个阶段**

```
Stage 0: Strawperson（稻草人）
  - 初步想法
  - 任何人都可以提出

Stage 1: Proposal（提案）
  - 正式提案
  - 需要 Champion（负责人）
  - 描述问题和解决方案

Stage 2: Draft（草案）
  - 规范文本初稿
  - 语法和语义确定
  - 可能有实验性实现

Stage 3: Candidate（候选）
  - 规范完成
  - 需要实现和用户反馈
  - 只接受关键性修改

Stage 4: Finished（完成）
  - 准备纳入标准
  - 至少两个独立实现
  - 通过测试
```

**实例：可选链的演进**
```
2017-11: Stage 0
2018-01: Stage 1
2018-07: Stage 2
2019-06: Stage 3
2020-01: Stage 4 → ES2020
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 提案特性

### 题目

以下哪个特性已经是 Stage 4（已完成）？

**选项：**
- A. 装饰器（Decorators）
- B. 管道操作符（Pipeline Operator）
- C. 顶层 await（Top-level await）
- D. 模式匹配（Pattern Matching）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**Stage 4 特性（已完成）**

```javascript
// Top-level await（ES2022）
const data = await fetch('/api/data');

// Optional Chaining（ES2020）
const value = obj?.prop?.nested;

// Nullish Coalescing（ES2020）
const result = value ?? 'default';

// Promise.allSettled（ES2020）
const results = await Promise.allSettled(promises);

// Logical Assignment（ES2021）
x ??= 1;
x ||= 1;
x &&= 1;

// Private Fields（ES2022）
class C {
  #private = 1;
}
```

**Stage 3 特性（候选）**
```javascript
// Decorators（提案修改中）
@logged
class MyClass {}

// Import Assertions
import data from './data.json' assert { type: 'json' };
```

**Stage 2 特性（草案）**
```javascript
// Pipeline Operator
value |> fn1 |> fn2

// Record & Tuple
const record = #{ x: 1, y: 2 };
const tuple = #[1, 2, 3];
```

**Stage 1 特性（提案）**
```javascript
// Pattern Matching
match (value) {
  when ({ type: 'number' }) -> handleNumber(),
  when ({ type: 'string' }) -> handleString()
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** Temporal

### 题目

Temporal API 旨在替代 Date 对象。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**Temporal API（Stage 3）**

Temporal 是新的日期时间 API，解决 Date 的诸多问题。

**Date 的问题：**
```javascript
// 1. 月份从 0 开始
const date = new Date(2024, 0, 1);  // 2024-01-01

// 2. 可变性
const d1 = new Date(2024, 0, 1);
d1.setMonth(1);  // 修改原对象

// 3. 时区处理困难
const d2 = new Date('2024-01-01');
console.log(d2.getTimezoneOffset());
```

**Temporal 的改进：**
```javascript
// 1. 月份从 1 开始
const date = Temporal.PlainDate.from({ year: 2024, month: 1, day: 1 });

// 2. 不可变
const d1 = Temporal.PlainDate.from('2024-01-01');
const d2 = d1.add({ months: 1 });  // 返回新对象

// 3. 明确的时区
const zoned = Temporal.ZonedDateTime.from({
  year: 2024,
  month: 1,
  day: 1,
  timeZone: 'Asia/Shanghai'
});

// 4. 多种类型
Temporal.PlainDate      // 日期
Temporal.PlainTime      // 时间
Temporal.PlainDateTime  // 日期时间
Temporal.ZonedDateTime  // 带时区
Temporal.Instant        // 时间戳
Temporal.Duration       // 时长
```

**实际应用：**
```javascript
// 日期计算
const start = Temporal.PlainDate.from('2024-01-01');
const end = start.add({ months: 6, days: 15 });
console.log(end.toString());  // "2024-07-16"

// 日期比较
const later = Temporal.PlainDate.compare(start, end);
console.log(later);  // -1

// 时区转换
const beijing = Temporal.ZonedDateTime.from({
  year: 2024,
  month: 1,
  day: 1,
  hour: 12,
  timeZone: 'Asia/Shanghai'
});

const newYork = beijing.withTimeZone('America/New_York');
console.log(newYork.toString());
```

</details>

---

## 第 4 题 🟡

**类型：** 代码分析题  
**标签：** Record & Tuple

### 题目

Record & Tuple 提案的特点是什么？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**Record & Tuple（Stage 2）**

不可变的数据结构。

**语法：**
```javascript
// Record（类似对象）
const record = #{
  x: 1,
  y: 2,
  nested: #{ z: 3 }
};

// Tuple（类似数组）
const tuple = #[1, 2, 3];
```

**特点：**

**1. 深度不可变**
```javascript
const rec = #{ x: 1 };
rec.x = 2;  // TypeError

const tup = #[1, 2, 3];
tup[0] = 10;  // TypeError
```

**2. 按值比较**
```javascript
// 对象按引用比较
const obj1 = { x: 1 };
const obj2 = { x: 1 };
console.log(obj1 === obj2);  // false

// Record 按值比较
const rec1 = #{ x: 1 };
const rec2 = #{ x: 1 };
console.log(rec1 === rec2);  // true
```

**3. 只能包含原始值**
```javascript
// ✅ 可以
const rec = #{
  num: 1,
  str: 'text',
  bool: true,
  nested: #{ x: 1 }
};

// ❌ 不可以
const invalid = #{
  obj: { x: 1 },      // 错误：普通对象
  fn: () => {},       // 错误：函数
  date: new Date()    // 错误：对象
};
```

**4. 可用作 Map/Set 键**
```javascript
const map = new Map();
const key1 = #{ x: 1, y: 2 };
const key2 = #{ x: 1, y: 2 };

map.set(key1, 'value');
console.log(map.get(key2));  // "value"（按值查找）

const set = new Set();
set.add(#[1, 2]);
set.add(#[1, 2]);
console.log(set.size);  // 1（去重）
```

**实际应用：**

```javascript
// 状态管理
const initialState = #{
  user: #{
    name: 'Alice',
    age: 25
  },
  settings: #{
    theme: 'dark'
  }
};

// 更新状态（返回新 Record）
function updateUser(state, updates) {
  return #{
    ...state,
    user: #{ ...state.user, ...updates }
  };
}

// React 优化
function Component({ data }) {
  // data 是 Record，按值比较
  // 相同值不会触发重渲染
  return <div>{data.value}</div>;
}

// 缓存键
const cache = new Map();
function memoize(fn) {
  return (...args) => {
    const key = #args;  // Tuple 作为键
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** Pipeline Operator

### 题目

Pipeline Operator 如何改善代码可读性？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**Pipeline Operator（Stage 2）**

链式调用的语法糖。

**传统写法：**
```javascript
// 嵌套函数调用
const result = fn3(fn2(fn1(value)));

// 中间变量
const step1 = fn1(value);
const step2 = fn2(step1);
const result = fn3(step2);
```

**Pipeline 写法：**
```javascript
const result = value
  |> fn1
  |> fn2
  |> fn3;
```

**实际应用：**

**1. 数据转换**
```javascript
// ❌ 传统
const result = JSON.parse(
  await fetchData(url)
);

// ✅ Pipeline
const result = url
  |> fetchData
  |> await
  |> JSON.parse;
```

**2. 字符串处理**
```javascript
// ❌ 传统
const processed = capitalize(
  trim(
    toLowerCase(input)
  )
);

// ✅ Pipeline
const processed = input
  |> toLowerCase
  |> trim
  |> capitalize;
```

**3. 数组操作**
```javascript
const numbers = [1, 2, 3, 4, 5];

// ❌ 传统
const result = numbers
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .reduce((a, b) => a + b, 0);

// ✅ Pipeline
const result = numbers
  |> (arr => arr.filter(x => x % 2 === 0))
  |> (arr => arr.map(x => x * 2))
  |> (arr => arr.reduce((a, b) => a + b, 0));
```

**4. React 组件**
```javascript
// HOC 组合
const Enhanced = compose(
  withAuth,
  withLoading,
  withError
)(Component);

// Pipeline
const Enhanced = Component
  |> withAuth
  |> withLoading
  |> withError;
```

**不同提案版本：**

**Hack 风格（当前）：**
```javascript
value
  |> fn(%)           // % 代表前面的值
  |> fn(%, arg)
  |> obj.method(%)
```

**F# 风格（早期）：**
```javascript
value
  |> fn
  |> fn(arg)
  |> (x => obj.method(x))
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** Decorators

### 题目

装饰器提案的最新语法是什么？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**Decorators（Stage 3）**

**类装饰器：**
```javascript
@logged
@sealed
class MyClass {
  constructor(name) {
    this.name = name;
  }
}

function logged(Class) {
  return class extends Class {
    constructor(...args) {
      console.log(`Creating ${Class.name}`);
      super(...args);
    }
  };
}

function sealed(Class) {
  Object.seal(Class);
  Object.seal(Class.prototype);
  return Class;
}
```

**方法装饰器：**
```javascript
class API {
  @cache
  @timeout(5000)
  async fetchData(url) {
    const response = await fetch(url);
    return response.json();
  }
}

function cache(method, context) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = method.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

function timeout(ms) {
  return function(method, context) {
    return async function(...args) {
      return Promise.race([
        method.apply(this, args),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), ms)
        )
      ]);
    };
  };
}
```

**字段装饰器：**
```javascript
class User {
  @readonly
  id = generateId();
  
  @validate(isEmail)
  email = '';
}

function readonly(value, context) {
  return function(initialValue) {
    let val = initialValue;
    return {
      get() { return val; },
      set() {
        throw new Error('Cannot modify readonly field');
      }
    };
  };
}

function validate(validator) {
  return function(value, context) {
    return function(initialValue) {
      let val = initialValue;
      return {
        get() { return val; },
        set(newValue) {
          if (!validator(newValue)) {
            throw new Error('Validation failed');
          }
          val = newValue;
        }
      };
    };
  };
}
```

**访问器装饰器：**
```javascript
class Temperature {
  #celsius = 0;
  
  @logged
  get celsius() {
    return this.#celsius;
  }
  
  set celsius(value) {
    this.#celsius = value;
  }
  
  get fahrenheit() {
    return this.#celsius * 9/5 + 32;
  }
}

function logged(accessor, context) {
  const { get, set } = accessor;
  
  return {
    get() {
      console.log(`Getting ${context.name}`);
      return get.call(this);
    },
    set(value) {
      console.log(`Setting ${context.name} to ${value}`);
      return set.call(this, value);
    }
  };
}
```

**实际应用：**

```javascript
// 权限检查
function requireAuth(method, context) {
  return function(...args) {
    if (!this.isAuthenticated) {
      throw new Error('Unauthorized');
    }
    return method.apply(this, args);
  };
}

// 性能监控
function measure(method, context) {
  return function(...args) {
    const start = performance.now();
    const result = method.apply(this, args);
    const duration = performance.now() - start;
    console.log(`${context.name} took ${duration}ms`);
    return result;
  };
}

// 重试机制
function retry(maxAttempts = 3) {
  return function(method, context) {
    return async function(...args) {
      let lastError;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          return await method.apply(this, args);
        } catch (error) {
          lastError = error;
          await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
      }
      throw lastError;
    };
  };
}

class API {
  @requireAuth
  @measure
  @retry(3)
  async updateUser(userId, data) {
    // ...
  }
}
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 未来特性

### 题目

以下哪些是 TC39 正在考虑的提案？

**选项：**
- A. Pattern Matching（模式匹配）
- B. Temporal（新日期 API）
- C. Import Assertions（导入断言）
- D. Operator Overloading（运算符重载）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**A. Pattern Matching（Stage 1）**
```javascript
match (value) {
  when ({ type: 'circle', radius }) -> Math.PI * radius ** 2,
  when ({ type: 'rectangle', width, height }) -> width * height,
  when ({ type: 'triangle', base, height }) -> base * height / 2
}
```

**B. Temporal（Stage 3）**
```javascript
const date = Temporal.PlainDate.from('2024-01-01');
const zoned = Temporal.ZonedDateTime.from({
  year: 2024,
  month: 1,
  day: 1,
  timeZone: 'Asia/Shanghai'
});
```

**C. Import Assertions（Stage 3）**
```javascript
import data from './data.json' assert { type: 'json' };
import css from './style.css' assert { type: 'css' };
```

**D. Operator Overloading（未提案）**
```javascript
// 目前没有运算符重载提案
// 但有 Symbol.operators 的早期讨论
```

**其他活跃提案：**

**Async Context（Stage 2）**
```javascript
const context = new AsyncContext.Variable();

context.run('value', () => {
  console.log(context.get());  // "value"
  setTimeout(() => {
    console.log(context.get());  // "value"（异步保持）
  }, 100);
});
```

**Error Cause（Stage 4 → ES2022）**
```javascript
try {
  doSomething();
} catch (error) {
  throw new Error('Operation failed', { cause: error });
}
```

**Array Grouping（Stage 3）**
```javascript
const grouped = Object.groupBy(array, item => item.category);

// { 
//   category1: [...],
//   category2: [...]
// }
```

**Array.fromAsync（Stage 3）**
```javascript
const array = await Array.fromAsync(asyncIterable);
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** Polyfill

### 题目

为 Stage 3 的 `Object.groupBy` 编写 polyfill。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
if (!Object.groupBy) {
  Object.groupBy = function(iterable, callback) {
    const groups = Object.create(null);
    
    let index = 0;
    for (const item of iterable) {
      const key = callback(item, index++);
      
      // 将 key 转换为字符串
      const stringKey = String(key);
      
      if (!(stringKey in groups)) {
        groups[stringKey] = [];
      }
      
      groups[stringKey].push(item);
    }
    
    return groups;
  };
}

// 测试
const items = [
  { category: 'fruit', name: 'apple' },
  { category: 'vegetable', name: 'carrot' },
  { category: 'fruit', name: 'banana' },
  { category: 'vegetable', name: 'lettuce' }
];

const grouped = Object.groupBy(items, item => item.category);

console.log(grouped);
// {
//   fruit: [
//     { category: 'fruit', name: 'apple' },
//     { category: 'fruit', name: 'banana' }
//   ],
//   vegetable: [
//     { category: 'vegetable', name: 'carrot' },
//     { category: 'vegetable', name: 'lettuce' }
//   ]
// }
```

**Map.groupBy polyfill：**

```javascript
if (!Map.groupBy) {
  Map.groupBy = function(iterable, callback) {
    const groups = new Map();
    
    let index = 0;
    for (const item of iterable) {
      const key = callback(item, index++);
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      
      groups.get(key).push(item);
    }
    
    return groups;
  };
}

// 测试（可以使用对象作为键）
const keyObj1 = { id: 1 };
const keyObj2 = { id: 2 };

const items = [
  { key: keyObj1, value: 'a' },
  { key: keyObj2, value: 'b' },
  { key: keyObj1, value: 'c' }
];

const grouped = Map.groupBy(items, item => item.key);

console.log(grouped.get(keyObj1));
// [{ key: {...}, value: 'a' }, { key: {...}, value: 'c' }]
```

**完整的特性检测：**

```javascript
// 检测并 polyfill
function polyfillGroupBy() {
  // 检测 Object.groupBy
  if (!Object.groupBy) {
    Object.groupBy = function(iterable, callback) {
      // 参数验证
      if (iterable == null) {
        throw new TypeError('iterable is null or undefined');
      }
      
      if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function');
      }
      
      const groups = Object.create(null);
      let index = 0;
      
      for (const item of iterable) {
        const key = callback(item, index++);
        const stringKey = String(key);
        
        if (!(stringKey in groups)) {
          groups[stringKey] = [];
        }
        
        groups[stringKey].push(item);
      }
      
      return groups;
    };
  }
  
  // 检测 Map.groupBy
  if (!Map.groupBy) {
    Map.groupBy = function(iterable, callback) {
      if (iterable == null) {
        throw new TypeError('iterable is null or undefined');
      }
      
      if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function');
      }
      
      const groups = new Map();
      let index = 0;
      
      for (const item of iterable) {
        const key = callback(item, index++);
        
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        
        groups.get(key).push(item);
      }
      
      return groups;
    };
  }
}

// 初始化
polyfillGroupBy();
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** Pattern Matching

### 题目

Pattern Matching 提案如何改善条件判断？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**Pattern Matching（Stage 1）**

**传统写法：**
```javascript
function processMessage(msg) {
  if (msg.type === 'text') {
    return handleText(msg.content);
  } else if (msg.type === 'image') {
    return handleImage(msg.url, msg.alt);
  } else if (msg.type === 'video') {
    return handleVideo(msg.url, msg.duration);
  } else {
    return handleUnknown();
  }
}
```

**Pattern Matching 写法：**
```javascript
function processMessage(msg) {
  return match (msg) {
    when ({ type: 'text', content }) -> handleText(content),
    when ({ type: 'image', url, alt }) -> handleImage(url, alt),
    when ({ type: 'video', url, duration }) -> handleVideo(url, duration),
    when _ -> handleUnknown()
  };
}
```

**高级模式：**

**1. 数组模式**
```javascript
match (array) {
  when [] -> 'empty',
  when [x] -> `single: ${x}`,
  when [first, ...rest] -> `first: ${first}, rest: ${rest.length}`,
}
```

**2. 类型守卫**
```javascript
match (value) {
  when (Number) if (value > 0) -> 'positive number',
  when (Number) if (value < 0) -> 'negative number',
  when (String) -> 'string',
  when (null) -> 'null'
}
```

**3. 嵌套模式**
```javascript
match (data) {
  when ({ user: { role: 'admin', permissions } }) -> {
    return `Admin with ${permissions.length} permissions`;
  },
  when ({ user: { role: 'user' } }) -> 'Regular user',
  when ({ guest: true }) -> 'Guest'
}
```

**4. 或模式**
```javascript
match (status) {
  when 'pending' | 'processing' -> showLoading(),
  when 'success' | 'completed' -> showSuccess(),
  when 'error' | 'failed' -> showError()
}
```

**实际应用：**

**Redux Reducer：**
```javascript
function reducer(state, action) {
  return match (action) {
    when ({ type: 'ADD_TODO', text }) -> {
      return {
        ...state,
        todos: [...state.todos, { id: Date.now(), text }]
      };
    },
    when ({ type: 'REMOVE_TODO', id }) -> {
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== id)
      };
    },
    when ({ type: 'TOGGLE_TODO', id }) -> {
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      };
    },
    when _ -> state
  };
}
```

**HTTP 响应处理：**
```javascript
async function handleResponse(response) {
  return match (response) {
    when ({ status: 200, data }) -> data,
    when ({ status: 201, data }) -> {
      showNotification('Created successfully');
      return data;
    },
    when ({ status: 404 }) -> {
      throw new Error('Not found');
    },
    when ({ status }) if (status >= 500) -> {
      throw new Error('Server error');
    },
    when _ -> {
      throw new Error('Unknown error');
    }
  };
}
```

**AST 遍历：**
```javascript
function transform(node) {
  return match (node) {
    when ({ type: 'BinaryExpression', operator: '+', left, right }) -> {
      return {
        type: 'CallExpression',
        callee: { name: 'add' },
        arguments: [transform(left), transform(right)]
      };
    },
    when ({ type: 'Literal', value }) -> node,
    when ({ type: 'Identifier' }) -> node,
    when _ -> {
      throw new Error(`Unknown node type: ${node.type}`);
    }
  };
}
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 提案跟踪

### 题目

如何跟踪和使用 TC39 提案？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**跟踪 TC39 提案**

**1. 官方资源**
```
- TC39 GitHub: github.com/tc39/proposals
- TC39 会议记录: github.com/tc39/notes
- ECMA-262 规范: tc39.es/ecma262
- Proposal 仓库: github.com/tc39/proposal-*
```

**2. 提案阶段查询**
```javascript
// 在浏览器中检测特性
const features = {
  // Stage 4
  topLevelAwait: typeof (async () => {})() !== 'undefined',
  privateFields: (() => {
    try {
      eval('class C { #x }');
      return true;
    } catch {
      return false;
    }
  })(),
  
  // Stage 3
  decorators: (() => {
    try {
      eval('@decorator class C {}');
      return true;
    } catch {
      return false;
    }
  })(),
  
  // 检测对象方法
  groupBy: typeof Object.groupBy === 'function',
  temporal: typeof Temporal !== 'undefined'
};

console.table(features);
```

**3. 使用 Babel 插件**
```javascript
// .babelrc
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "> 0.25%, not dead"
    }]
  ],
  "plugins": [
    // Stage 3
    ["@babel/plugin-proposal-decorators", { "version": "2023-05" }],
    "@babel/plugin-proposal-pipeline-operator",
    
    // Stage 2
    "@babel/plugin-proposal-record-and-tuple"
  ]
}
```

**4. TypeScript 支持**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2023",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

**5. 特性检测库**
```javascript
class FeatureDetector {
  static check(featureName) {
    const tests = {
      optionalChaining: () => {
        try {
          eval('({ a: 1 })?.a');
          return true;
        } catch {
          return false;
        }
      },
      
      nullishCoalescing: () => {
        try {
          eval('null ?? 1');
          return true;
        } catch {
          return false;
        }
      },
      
      topLevelAwait: () => {
        try {
          eval('await Promise.resolve()');
          return true;
        } catch {
          return false;
        }
      },
      
      privateFields: () => {
        try {
          eval('class C { #x }');
          return true;
        } catch {
          return false;
        }
      }
    };
    
    return tests[featureName] ? tests[featureName]() : false;
  }
  
  static getSupport() {
    return {
      // ES2020
      optionalChaining: this.check('optionalChaining'),
      nullishCoalescing: this.check('nullishCoalescing'),
      
      // ES2022
      topLevelAwait: this.check('topLevelAwait'),
      privateFields: this.check('privateFields'),
      
      // Stage 3+
      temporal: typeof Temporal !== 'undefined',
      groupBy: typeof Object.groupBy === 'function'
    };
  }
}

console.table(FeatureDetector.getSupport());
```

**6. 实践建议**

```javascript
// ✅ 使用 Stage 4 特性（安全）
const value = obj?.prop ?? 'default';

// ✅ 使用 Stage 3 特性（带 polyfill）
if (!Object.groupBy) {
  // polyfill
}
const groups = Object.groupBy(items, item => item.type);

// ⚠️ 使用 Stage 2 特性（实验性）
// 需要编译器支持
const record = #{ x: 1, y: 2 };

// ❌ 避免使用 Stage 1 以下（不稳定）
// 语法可能变化
```

**7. 持续学习**

```javascript
// 订阅更新
const resources = {
  twitter: [
    '@TC39',
    '@babeljs',
    '@typescript'
  ],
  blogs: [
    '2ality.com',
    'v8.dev/blog',
    'tc39.es/blog'
  ],
  newsletters: [
    'JavaScript Weekly',
    'Frontend Focus'
  ]
};

// 定期检查
setInterval(() => {
  checkTC39Proposals();
  checkBrowserSupport();
  updateDependencies();
}, 30 * 24 * 60 * 60 * 1000);  // 每月
```

</details>

---

**本章总结：**
- ✅ TC39 流程
- ✅ 提案阶段
- ✅ Temporal API
- ✅ Record & Tuple
- ✅ Pipeline Operator
- ✅ Decorators 最新语法
- ✅ 活跃提案
- ✅ Polyfill 编写
- ✅ Pattern Matching
- ✅ 提案跟踪方法

---

**🎉 深入原理篇完成！**

**全书总结：**

**基础篇（第 1-8 章）：** 80 题 ✅
**进阶篇（第 9-13 章）：** 50 题 ✅
**深入原理篇（第 14-27 章）：** 140 题 ✅

**总计：270 道高质量 JavaScript 面试题！**

涵盖从基础语法到深入原理的完整知识体系，每题都包含详细解析和代码示例。
