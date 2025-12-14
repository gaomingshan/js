# 解构赋值的底层实现

## 概述

解构赋值是 ES6 引入的语法糖，允许从数组或对象中提取值并赋给变量。

理解解构赋值的关键在于：

- **数组解构**：基于迭代器协议（Iterator Protocol）
- **对象解构**：基于属性访问操作
- **默认值**：惰性求值，只有 `undefined` 时才生效

---

## 一、数组解构

### 1.1 基本原理

```js
const [a, b, c] = iterable;

// 等价于：
const iterator = iterable[Symbol.iterator]();
const a = iterator.next().value;
const b = iterator.next().value;
const c = iterator.next().value;
```

### 1.2 解构任何可迭代对象

```js
// 数组
const [a, b] = [1, 2];

// 字符串
const [x, y] = 'ab';

// Set
const [m, n] = new Set([1, 2]);

// Map
const [[k, v]] = new Map([['key', 'value']]);

// 生成器
function* gen() {
  yield 1;
  yield 2;
}
const [p, q] = gen();
```

### 1.3 跳过元素

```js
const [a, , c] = [1, 2, 3];
// a = 1, c = 3（跳过 2）
```

### 1.4 剩余元素

```js
const [a, ...rest] = [1, 2, 3, 4];
// a = 1, rest = [2, 3, 4]

// 底层实现：
// 1. 取第一个值
// 2. 将剩余所有值收集到新数组
```

### 1.5 默认值

```js
// 只有当对应值为 undefined 时，默认值才会生效
const [a = 10] = [undefined];  // a = 10
const [b = 10] = [null];       // b = null（不是 10！）

// 默认值是惰性求值的
function expensive() {
  console.log('expensive called');
  return 100;
}

const [c = expensive()] = [undefined];  // expensive called
const [d = expensive()] = [5];          // 不调用
```

---

## 二、对象解构

### 2.1 基本原理

```js
const { a, b, c } = obj;

// 等价于：
const a = obj.a;
const b = obj.b;
const c = obj.c;
```

### 2.2 属性重命名

```js
const { name: userName } = { name: 'Alice' };
// userName = 'Alice'

// 等价于：
const userName = obj.name;
```

### 2.3 嵌套解构

```js
const user = {
  profile: {
    name: 'Alice',
    address: {
      city: 'Beijing'
    }
  }
};

const { profile: { name, address: { city } } } = user;
// name = 'Alice', city = 'Beijing'

// ❌ 注意：如果中间层为 null/undefined，会抛出 TypeError
const user2 = { profile: null };
// const { profile: { name } } = user2;  // TypeError
```

### 2.4 计算属性名

```js
const key = 'name';
const { [key]: value } = { name: 'Alice' };
// value = 'Alice'
```

### 2.5 剩余属性

```js
const { a, ...rest } = { a: 1, b: 2, c: 3 };
// a = 1, rest = { b: 2, c: 3 }

// 底层实现类似于：
const rest = {};
for (const key in obj) {
  if (key !== 'a' && obj.hasOwnProperty(key)) {
    rest[key] = obj[key];
  }
}
```

---

## 三、解构的高级用法

### 3.1 函数参数解构

```js
// 对象参数解构
function createUser({ name, age = 18, role = 'user' }) {
  return { name, age, role };
}

createUser({ name: 'Alice' });
// { name: 'Alice', age: 18, role: 'user' }

// 数组参数解构
function sum([a, b]) {
  return a + b;
}

sum([1, 2]);  // 3
```

### 3.2 交换变量

```js
let a = 1, b = 2;
[a, b] = [b, a];
// a = 2, b = 1

// 底层实现：
const temp = [b, a];
a = temp[0];
b = temp[1];
```

### 3.3 从函数返回多个值

```js
function getCoordinates() {
  return { x: 10, y: 20 };
}

const { x, y } = getCoordinates();
```

### 3.4 提取对象的部分属性

```js
const user = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  password: 'secret'
};

// 提取需要的属性
const { name, email } = user;

// 排除敏感属性
const { password, ...publicInfo } = user;
// publicInfo = { id: 1, name: 'Alice', email: 'alice@example.com' }
```

---

## 四、性能考虑

### 4.1 对象解构的性能

- 对象解构本质是属性访问，性能接近直接访问
- 深层嵌套解构会有多次属性访问开销
- 现代引擎会优化常见模式

```js
// 浅层解构（快）
const { name, age } = user;

// 深层嵌套解构（较慢）
const { profile: { address: { city } } } = user;
```

### 4.2 数组解构的性能

- 数组解构使用迭代器，有一定开销
- 对于已知长度的数组，直接索引访问更快
- 但代码可读性更好

```js
// 解构（可读性好）
const [a, b] = arr;

// 直接访问（性能略好）
const a = arr[0];
const b = arr[1];
```

### 4.3 默认值的性能

```js
// ❌ 避免昂贵的默认值计算
const { config = computeExpensiveDefault() } = options;

// ✅ 先检查再计算
const config = options.config !== undefined 
  ? options.config 
  : computeExpensiveDefault();
```

---

## 五、常见陷阱

### 5.1 null 和 undefined 的处理

```js
// ❌ 会抛出 TypeError
// const { a } = null;
// const { b } = undefined;

// ✅ 提供默认值
const { a } = obj || {};
const { b } = obj ?? {};
```

### 5.2 已声明变量的解构

```js
let a, b;

// ❌ 语法错误（被解析为代码块）
// { a, b } = { a: 1, b: 2 };

// ✅ 需要括号
({ a, b } = { a: 1, b: 2 });
```

### 5.3 默认值与 null

```js
// 默认值只对 undefined 生效
const { a = 10 } = { a: null };
// a = null（不是 10！）

const { b = 10 } = { b: undefined };
// b = 10
```

---

## 六、规范细节

### 数组解构算法（简化）

```
1. 获取右侧值的迭代器
2. 对于每个解构目标：
   a. 调用 iterator.next()
   b. 如果是剩余元素，收集所有剩余值
   c. 如果有默认值且 value 为 undefined，使用默认值
   d. 赋值给目标变量
3. 如果有剩余元素未处理，调用 iterator.return()
```

### 对象解构算法（简化）

```
1. 将右侧值转换为对象（ToObject）
2. 对于每个解构属性：
   a. 获取属性值（[[Get]]）
   b. 如果有重命名，使用新名称
   c. 如果有默认值且 value 为 undefined，使用默认值
   d. 如果是嵌套解构，递归执行
   e. 赋值给目标变量
3. 如果有剩余属性，复制未解构的属性
```

---

## 七、最佳实践

1. **函数参数**：用对象解构提高可读性和灵活性。
2. **交换变量**：用数组解构简化代码。
3. **提取属性**：从大对象中提取需要的属性。
4. **默认值**：为可选参数提供默认值。
5. **重命名**：避免命名冲突。
6. **剩余属性**：过滤对象属性。

---

## 参考资料

- [ECMAScript - Destructuring Assignment](https://tc39.es/ecma262/#sec-destructuring-assignment)
- [MDN - 解构赋值](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
