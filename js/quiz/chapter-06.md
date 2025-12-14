# 第 6 章：数组与常用方法 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 数组方法

### 题目

以下哪个数组方法会改变原数组？

**选项：**
- A. `map()`
- B. `filter()`
- C. `push()`
- D. `slice()`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**会改变原数组的方法（Mutating）**

```javascript
const arr = [1, 2, 3];

// push()：添加元素到末尾
arr.push(4);
console.log(arr);  // [1, 2, 3, 4]（原数组被修改）
```

**完整列表：**
- `push()` - 末尾添加
- `pop()` - 末尾删除
- `unshift()` - 开头添加
- `shift()` - 开头删除
- `splice()` - 添加/删除元素
- `reverse()` - 反转数组
- `sort()` - 排序
- `fill()` - 填充
- `copyWithin()` - 复制元素

---

**不会改变原数组的方法（Non-mutating）**

```javascript
const arr = [1, 2, 3];

// map()：返回新数组
const doubled = arr.map(x => x * 2);
console.log(doubled);  // [2, 4, 6]
console.log(arr);      // [1, 2, 3]（原数组不变）

// filter()：返回新数组
const evens = arr.filter(x => x % 2 === 0);
console.log(evens);  // [2]
console.log(arr);    // [1, 2, 3]（原数组不变）

// slice()：返回新数组
const sliced = arr.slice(0, 2);
console.log(sliced);  // [1, 2]
console.log(arr);     // [1, 2, 3]（原数组不变）
```

**完整列表：**
- `map()` - 映射
- `filter()` - 过滤
- `slice()` - 切片
- `concat()` - 合并
- `join()` - 转字符串
- `reduce()` - 归约
- `find()` - 查找元素
- `includes()` - 是否包含
- `some()` / `every()` - 测试

---

**避免意外修改**

```javascript
// ❌ sort() 会修改原数组
const nums = [3, 1, 2];
const sorted = nums.sort();
console.log(nums);    // [1, 2, 3]（被修改）
console.log(sorted);  // [1, 2, 3]（同一个数组）

// ✅ 先复制再排序
const nums2 = [3, 1, 2];
const sorted2 = [...nums2].sort();
console.log(nums2);    // [3, 1, 2]（不变）
console.log(sorted2);  // [1, 2, 3]
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** reduce

### 题目

以下代码的输出是什么？

```javascript
const arr = [1, 2, 3, 4];
const sum = arr.reduce((acc, val) => acc + val);
console.log(sum);
```

**选项：**
- A. `6`
- B. `10`
- C. `"1234"`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**reduce 的基本用法**

```javascript
const arr = [1, 2, 3, 4];

// 没有初始值，从第一个元素开始
const sum = arr.reduce((acc, val) => acc + val);

// 执行过程：
// acc = 1, val = 2 → 返回 3
// acc = 3, val = 3 → 返回 6
// acc = 6, val = 4 → 返回 10

console.log(sum);  // 10
```

---

**reduce 的完整形式**

```javascript
array.reduce((accumulator, currentValue, currentIndex, array) => {
  // 返回新的累加值
}, initialValue)
```

**参数说明：**
- `accumulator` - 累加器（上次返回的值）
- `currentValue` - 当前元素
- `currentIndex` - 当前索引（可选）
- `array` - 原数组（可选）
- `initialValue` - 初始值（可选）

---

**有无初始值的区别**

```javascript
const arr = [1, 2, 3, 4];

// 没有初始值：从索引 1 开始
arr.reduce((acc, val) => {
  console.log(acc, val);
  return acc + val;
});
// 1 2
// 3 3
// 6 4
// 返回：10

// 有初始值：从索引 0 开始
arr.reduce((acc, val) => {
  console.log(acc, val);
  return acc + val;
}, 0);
// 0 1
// 1 2
// 3 3
// 6 4
// 返回：10
```

**空数组的情况：**
```javascript
// 没有初始值 + 空数组 = 报错
[].reduce((acc, val) => acc + val);  // TypeError

// 有初始值 + 空数组 = 返回初始值
[].reduce((acc, val) => acc + val, 0);  // 0

// 单元素 + 无初始值 = 返回该元素
[5].reduce((acc, val) => acc + val);  // 5
```

---

**reduce 的常见用途**

**1. 求和**
```javascript
const sum = [1, 2, 3, 4].reduce((acc, val) => acc + val, 0);
// 10
```

**2. 求最大值**
```javascript
const max = [3, 1, 4, 1, 5].reduce((max, val) => Math.max(max, val));
// 5
```

**3. 数组扁平化**
```javascript
const nested = [[1, 2], [3, 4], [5]];
const flat = nested.reduce((acc, arr) => acc.concat(arr), []);
// [1, 2, 3, 4, 5]
```

**4. 计数**
```javascript
const fruits = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'];
const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
// { apple: 3, banana: 2, orange: 1 }
```

**5. 分组**
```javascript
const people = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 25 }
];

const grouped = people.reduce((acc, person) => {
  const key = person.age;
  (acc[key] = acc[key] || []).push(person);
  return acc;
}, {});
// {
//   25: [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 25 }],
//   30: [{ name: 'Bob', age: 30 }]
// }
```

**6. 管道（函数组合）**
```javascript
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

const add1 = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const process = pipe(add1, double, square);
console.log(process(5));  // ((5 + 1) * 2)^2 = 144
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 数组遍历

### 题目

`forEach()` 方法可以通过 `return` 提前终止循环。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**forEach 不能提前终止**

```javascript
const arr = [1, 2, 3, 4, 5];

arr.forEach(val => {
  if (val === 3) {
    return;  // 只是跳过当前迭代，不会终止循环
  }
  console.log(val);
});
// 输出：1, 2, 4, 5
```

**为什么 return 不能终止？**
- `forEach` 的回调函数是独立的函数调用
- `return` 只会退出当前回调函数
- 不影响后续迭代

---

**如何提前终止循环？**

**1. 使用 for 循环**
```javascript
const arr = [1, 2, 3, 4, 5];

for (let i = 0; i < arr.length; i++) {
  if (arr[i] === 3) {
    break;  // 终止循环
  }
  console.log(arr[i]);
}
// 输出：1, 2
```

**2. 使用 some()**
```javascript
const arr = [1, 2, 3, 4, 5];

arr.some(val => {
  if (val === 3) {
    return true;  // 终止循环
  }
  console.log(val);
  return false;
});
// 输出：1, 2
```

**3. 使用 every()**
```javascript
const arr = [1, 2, 3, 4, 5];

arr.every(val => {
  if (val === 3) {
    return false;  // 终止循环
  }
  console.log(val);
  return true;
});
// 输出：1, 2
```

**4. 使用 for...of**
```javascript
const arr = [1, 2, 3, 4, 5];

for (const val of arr) {
  if (val === 3) {
    break;
  }
  console.log(val);
}
// 输出：1, 2
```

**5. 使用 find() 或 findIndex()**
```javascript
const arr = [1, 2, 3, 4, 5];

arr.find(val => {
  console.log(val);
  return val === 3;  // 找到后停止
});
// 输出：1, 2, 3
```

---

**forEach vs 其他方法**

| 方法 | 可终止 | 返回值 | 可修改原数组 |
|------|--------|--------|-------------|
| `forEach` | ❌ | undefined | ✅ |
| `map` | ❌ | 新数组 | ❌ |
| `some` | ✅ | boolean | ❌ |
| `every` | ✅ | boolean | ❌ |
| `find` | ✅ | 元素/undefined | ❌ |
| `for` | ✅ | - | ✅ |
| `for...of` | ✅ | - | ✅ |

---

**forEach 的其他注意事项**

**1. 不能使用 async/await**
```javascript
// ❌ 不会按预期工作
arr.forEach(async (val) => {
  await someAsyncOperation(val);
});

// ✅ 使用 for...of
for (const val of arr) {
  await someAsyncOperation(val);
}

// ✅ 或使用 Promise.all
await Promise.all(arr.map(val => someAsyncOperation(val)));
```

**2. 在迭代中修改数组**
```javascript
const arr = [1, 2, 3, 4, 5];

arr.forEach((val, idx, array) => {
  if (val === 3) {
    array.splice(idx, 1);  // 删除当前元素
  }
  console.log(val);
});
// 输出：1, 2, 3, 5（跳过了 4）
// 因为删除 3 后，4 移到了索引 2，但迭代器已经到索引 3
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 数组方法链

### 题目

以下代码的输出是什么？

```javascript
const arr = [1, 2, 3, 4, 5];

const result = arr
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .reduce((acc, x) => acc + x, 0);

console.log(result);
```

**选项：**
- A. `6`
- B. `12`
- C. `30`
- D. `20`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**方法链的执行过程**

```javascript
const arr = [1, 2, 3, 4, 5];

// Step 1: filter(x => x % 2 === 0)
// [2, 4]

// Step 2: map(x => x * 2)
// [4, 8]

// Step 3: reduce((acc, x) => acc + x, 0)
// 0 + 4 = 4
// 4 + 8 = 12

console.log(result);  // 12
```

---

**方法链的优势**

**可读性高：**
```javascript
// ✅ 链式调用
const result = users
  .filter(u => u.age >= 18)
  .map(u => u.name)
  .join(', ');

// 比多个临时变量更清晰
const adults = users.filter(u => u.age >= 18);
const names = adults.map(u => u.name);
const result = names.join(', ');
```

---

**性能考虑**

**多次遍历 vs 单次遍历：**
```javascript
const arr = [1, 2, 3, 4, 5];

// ❌ 链式调用：遍历 3 次
arr
  .filter(x => x % 2 === 0)   // 遍历 1
  .map(x => x * 2)             // 遍历 2
  .reduce((acc, x) => acc + x, 0);  // 遍历 3

// ✅ 单次 reduce：遍历 1 次
arr.reduce((acc, x) => {
  if (x % 2 === 0) {
    return acc + x * 2;
  }
  return acc;
}, 0);
```

**大数据集的优化：**
```javascript
// 对于小数组，链式调用更清晰
const small = [1, 2, 3, 4, 5];
small.filter(...).map(...).reduce(...);

// 对于大数组，考虑性能
const large = Array(1000000).fill(0).map((_, i) => i);

// 方案 1：链式（简洁但慢）
const result1 = large
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .reduce((acc, x) => acc + x, 0);

// 方案 2：单次遍历（快但复杂）
const result2 = large.reduce((acc, x) => {
  return x % 2 === 0 ? acc + x * 2 : acc;
}, 0);

// 方案 3：for 循环（最快）
let result3 = 0;
for (let i = 0; i < large.length; i++) {
  if (large[i] % 2 === 0) {
    result3 += large[i] * 2;
  }
}
```

---

**实际应用**

**1. 数据处理管道**
```javascript
const products = [
  { name: 'Laptop', price: 1000, inStock: true },
  { name: 'Phone', price: 500, inStock: false },
  { name: 'Tablet', price: 300, inStock: true }
];

const total = products
  .filter(p => p.inStock)
  .filter(p => p.price > 400)
  .map(p => p.price)
  .reduce((sum, price) => sum + price, 0);

console.log(total);  // 1000
```

**2. 复杂转换**
```javascript
const users = [
  { name: 'Alice', posts: [1, 2, 3] },
  { name: 'Bob', posts: [4, 5] },
  { name: 'Charlie', posts: [] }
];

const totalPosts = users
  .map(u => u.posts.length)
  .reduce((sum, count) => sum + count, 0);

console.log(totalPosts);  // 5
```

**3. 数据聚合**
```javascript
const transactions = [
  { type: 'income', amount: 100 },
  { type: 'expense', amount: 50 },
  { type: 'income', amount: 200 },
  { type: 'expense', amount: 75 }
];

const balance = transactions
  .map(t => t.type === 'income' ? t.amount : -t.amount)
  .reduce((acc, val) => acc + val, 0);

console.log(balance);  // 175
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** sort

### 题目

以下代码的输出是什么？

```javascript
const arr = [10, 5, 40, 25, 1000, 1];
arr.sort();
console.log(arr);
```

**选项：**
- A. `[1, 5, 10, 25, 40, 1000]`
- B. `[1, 10, 1000, 25, 40, 5]`
- C. `[1000, 40, 25, 10, 5, 1]`
- D. `[1, 5, 10, 25, 40, 1000]`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**sort() 的默认行为：按字符串排序**

```javascript
const arr = [10, 5, 40, 25, 1000, 1];
arr.sort();

// 默认将元素转换为字符串后比较
// "10", "5", "40", "25", "1000", "1"
// 按字典序排序：
// "1" < "10" < "1000" < "25" < "40" < "5"

console.log(arr);  // [1, 10, 1000, 25, 40, 5]
```

---

**数字排序的正确方式**

**升序：**
```javascript
const arr = [10, 5, 40, 25, 1000, 1];

arr.sort((a, b) => a - b);
console.log(arr);  // [1, 5, 10, 25, 40, 1000]
```

**降序：**
```javascript
arr.sort((a, b) => b - a);
console.log(arr);  // [1000, 40, 25, 10, 5, 1]
```

**比较函数规则：**
- 返回 `< 0`：a 排在 b 前面
- 返回 `= 0`：保持原顺序
- 返回 `> 0`：b 排在 a 前面

---

**复杂排序**

**1. 对象数组排序**
```javascript
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 20 }
];

// 按年龄升序
users.sort((a, b) => a.age - b.age);

// 按名字字母序
users.sort((a, b) => a.name.localeCompare(b.name));
```

**2. 多条件排序**
```javascript
const products = [
  { name: 'Laptop', price: 1000, rating: 4.5 },
  { name: 'Phone', price: 500, rating: 4.8 },
  { name: 'Tablet', price: 500, rating: 4.2 }
];

// 先按价格升序，价格相同则按评分降序
products.sort((a, b) => {
  if (a.price !== b.price) {
    return a.price - b.price;
  }
  return b.rating - a.rating;
});
```

**3. 中文排序**
```javascript
const names = ['张三', '李四', '王五', '赵六'];

// 错误：不支持中文
names.sort();

// 正确：使用 localeCompare
names.sort((a, b) => a.localeCompare(b, 'zh-CN'));
```

---

**稳定排序**

```javascript
const arr = [
  { value: 1, label: 'a' },
  { value: 2, label: 'b' },
  { value: 1, label: 'c' },
  { value: 2, label: 'd' }
];

// ES2019+ 保证稳定排序
arr.sort((a, b) => a.value - b.value);
// 结果：value 相同的元素保持原顺序
// [
//   { value: 1, label: 'a' },
//   { value: 1, label: 'c' },
//   { value: 2, label: 'b' },
//   { value: 2, label: 'd' }
// ]
```

---

**性能优化**

**1. 避免在比较函数中创建对象**
```javascript
// ❌ 每次比较都创建新对象（慢）
arr.sort((a, b) => {
  return new Date(a.date) - new Date(b.date);
});

// ✅ 预先转换（快）
const withTimestamp = arr.map(item => ({
  ...item,
  timestamp: new Date(item.date).getTime()
}));
withTimestamp.sort((a, b) => a.timestamp - b.timestamp);
```

**2. 大数据集使用其他算法**
```javascript
// 对于超大数组，考虑：
// - 快速排序
// - 归并排序
// - 基数排序（特定场景）
```

---

**常见陷阱**

```javascript
// 1. 忘记返回值
[3, 1, 2].sort((a, b) => { a - b });  // ❌ 没有 return
[3, 1, 2].sort((a, b) => a - b);     // ✅

// 2. 字符串数字混合
['10', 5, '40'].sort();  // ["10", "40", 5]

// 3. undefined 值
[3, undefined, 1].sort((a, b) => a - b);
// [1, 3, undefined]（undefined 总是排在最后）

// 4. NaN 值
[3, NaN, 1].sort((a, b) => a - b);
// [1, 3, NaN] 或其他（NaN 比较始终返回 false）
```

</details>

---

## 第 6 题 🟡

**类型：** 代码输出题  
**标签：** flat

### 题目

以下代码的输出是什么？

```javascript
const arr = [1, [2, [3, [4, 5]]]];
console.log(arr.flat());
console.log(arr.flat(2));
console.log(arr.flat(Infinity));
```

**选项：**
- A. `[1, 2, [3, [4, 5]]]`, `[1, 2, 3, [4, 5]]`, `[1, 2, 3, 4, 5]`
- B. `[1, 2, 3, 4, 5]`, `[1, 2, 3, 4, 5]`, `[1, 2, 3, 4, 5]`
- C. `[1, 2, [3, [4, 5]]]`, `[1, 2, 3, 4, 5]`, `[1, 2, 3, 4, 5]`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**flat() 方法的深度参数**

```javascript
const arr = [1, [2, [3, [4, 5]]]];

// flat()：默认深度 1
console.log(arr.flat());
// [1, 2, [3, [4, 5]]]

// flat(2)：深度 2
console.log(arr.flat(2));
// [1, 2, 3, [4, 5]]

// flat(Infinity)：完全扁平化
console.log(arr.flat(Infinity));
// [1, 2, 3, 4, 5]
```

---

**flat() 的特性**

**1. 移除空项**
```javascript
const arr = [1, 2, , 4, 5];
console.log(arr.flat());  // [1, 2, 4, 5]
```

**2. 不修改原数组**
```javascript
const arr = [1, [2, 3]];
const flattened = arr.flat();
console.log(arr);        // [1, [2, 3]]（不变）
console.log(flattened);  // [1, 2, 3]
```

**3. 指定深度**
```javascript
const arr = [1, [2, [3, [4]]]];

arr.flat(0);        // [1, [2, [3, [4]]]]（无变化）
arr.flat(1);        // [1, 2, [3, [4]]]
arr.flat(2);        // [1, 2, 3, [4]]
arr.flat(3);        // [1, 2, 3, 4]
arr.flat(Infinity); // [1, 2, 3, 4]（完全扁平化）
```

---

**flatMap()：map + flat**

```javascript
const arr = [1, 2, 3];

// map + flat(1)
const result1 = arr.map(x => [x, x * 2]).flat();
console.log(result1);  // [1, 2, 2, 4, 3, 6]

// 等价的 flatMap
const result2 = arr.flatMap(x => [x, x * 2]);
console.log(result2);  // [1, 2, 2, 4, 3, 6]
```

**flatMap 只能扁平化一层：**
```javascript
const arr = [1, 2];

arr.flatMap(x => [[x * 2]]);
// [[2], [4]]（只扁平化一层）

arr.flatMap(x => [[x * 2]]).flat();
// [2, 4]（再扁平化一层）
```

---

**手动实现 flat**

**递归实现：**
```javascript
function flat(arr, depth = 1) {
  if (depth === 0) return arr;
  
  return arr.reduce((acc, val) => {
    if (Array.isArray(val)) {
      return acc.concat(flat(val, depth - 1));
    }
    return acc.concat(val);
  }, []);
}

const arr = [1, [2, [3, [4]]]];
console.log(flat(arr, 2));  // [1, 2, 3, [4]]
```

**迭代实现：**
```javascript
function flat(arr, depth = 1) {
  const stack = arr.map(item => [item, depth]);
  const result = [];
  
  while (stack.length) {
    const [item, d] = stack.pop();
    
    if (Array.isArray(item) && d > 0) {
      stack.push(...item.map(v => [v, d - 1]));
    } else {
      result.push(item);
    }
  }
  
  return result.reverse();
}
```

---

**实际应用**

**1. 处理嵌套响应**
```javascript
const response = {
  users: [
    { name: 'Alice', tags: ['js', 'react'] },
    { name: 'Bob', tags: ['python', 'django'] }
  ]
};

const allTags = response.users
  .flatMap(user => user.tags);
// ['js', 'react', 'python', 'django']
```

**2. 展开选项**
```javascript
const options = [
  { label: 'Fruits', items: ['Apple', 'Banana'] },
  { label: 'Vegetables', items: ['Carrot', 'Lettuce'] }
];

const allItems = options.flatMap(opt => opt.items);
// ['Apple', 'Banana', 'Carrot', 'Lettuce']
```

**3. 过滤 + 映射**
```javascript
const numbers = [1, 2, 3, 4, 5];

// 只保留偶数，并加倍
const result = numbers.flatMap(n =>
  n % 2 === 0 ? [n * 2] : []
);
// [4, 8]
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 数组去重

### 题目

以下哪些方法可以实现数组去重？

**选项：**
- A. `[...new Set(array)]`
- B. `array.filter((v, i, arr) => arr.indexOf(v) === i)`
- C. `array.reduce((acc, v) => acc.includes(v) ? acc : [...acc, v], [])`
- D. 以上都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**数组去重的多种方法（全部正确）**

**A. Set（最简洁）**
```javascript
const arr = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(arr)];
console.log(unique);  // [1, 2, 3, 4]

// 或使用 Array.from
const unique2 = Array.from(new Set(arr));
```

**B. filter + indexOf**
```javascript
const arr = [1, 2, 2, 3, 3, 4];
const unique = arr.filter((v, i, arr) => arr.indexOf(v) === i);
console.log(unique);  // [1, 2, 3, 4]

// 原理：indexOf 返回第一次出现的索引
// 如果当前索引等于 indexOf 返回的索引，说明是首次出现
```

**C. reduce + includes**
```javascript
const arr = [1, 2, 2, 3, 3, 4];
const unique = arr.reduce((acc, v) =>
  acc.includes(v) ? acc : [...acc, v]
, []);
console.log(unique);  // [1, 2, 3, 4]
```

---

**对象数组去重**

**1. 根据属性去重**
```javascript
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Alice' }  // 重复
];

// 使用 Map
const uniqueUsers = Array.from(
  new Map(users.map(u => [u.id, u])).values()
);

// 使用 filter
const uniqueUsers2 = users.filter((u, i, arr) =>
  arr.findIndex(user => user.id === u.id) === i
);

// 使用 reduce
const uniqueUsers3 = users.reduce((acc, u) => {
  if (!acc.find(user => user.id === u.id)) {
    acc.push(u);
  }
  return acc;
}, []);
```

**2. JSON.stringify（简单对象）**
```javascript
const arr = [
  { x: 1, y: 2 },
  { x: 1, y: 2 },  // 重复
  { x: 2, y: 3 }
];

const unique = Array.from(
  new Set(arr.map(JSON.stringify))
).map(JSON.parse);
```

---

**性能对比**

```javascript
const arr = Array(10000).fill(0).map(() => Math.floor(Math.random() * 1000));

// 1. Set（最快）- O(n)
console.time('Set');
const unique1 = [...new Set(arr)];
console.timeEnd('Set');  // ~1ms

// 2. filter + indexOf（慢）- O(n²)
console.time('filter');
const unique2 = arr.filter((v, i) => arr.indexOf(v) === i);
console.timeEnd('filter');  // ~100ms

// 3. reduce + includes（最慢）- O(n²)
console.time('reduce');
const unique3 = arr.reduce((acc, v) =>
  acc.includes(v) ? acc : [...acc, v]
, []);
console.timeEnd('reduce');  // ~200ms
```

---

**特殊情况处理**

**1. NaN 去重**
```javascript
const arr = [1, 2, NaN, NaN, 3];

// Set 可以去重 NaN
[...new Set(arr)];  // [1, 2, NaN, 3]

// indexOf 不能识别 NaN
arr.filter((v, i) => arr.indexOf(v) === i);  // [1, 2, NaN, NaN, 3]
```

**2. 对象引用**
```javascript
const obj = { x: 1 };
const arr = [obj, obj, { x: 1 }];

// Set 基于引用相等
[...new Set(arr)];  // [obj, { x: 1 }]（两个元素）

// 需要深度比较
function deepUnique(arr) {
  return arr.filter((v, i) =>
    arr.findIndex(item => JSON.stringify(item) === JSON.stringify(v)) === i
  );
}
```

**3. 保持顺序**
```javascript
const arr = [3, 1, 2, 1, 3, 2];

// Set 保持插入顺序
[...new Set(arr)];  // [3, 1, 2]
```

---

**实际应用**

**1. 合并去重**
```javascript
const arr1 = [1, 2, 3];
const arr2 = [2, 3, 4];

const merged = [...new Set([...arr1, ...arr2])];
// [1, 2, 3, 4]
```

**2. 求交集**
```javascript
const arr1 = [1, 2, 3, 4];
const arr2 = [3, 4, 5, 6];

const intersection = arr1.filter(v => arr2.includes(v));
// [3, 4]

// 去重
const uniqueIntersection = [...new Set(intersection)];
```

**3. 求差集**
```javascript
const arr1 = [1, 2, 3, 4];
const arr2 = [3, 4, 5, 6];

const difference = arr1.filter(v => !arr2.includes(v));
// [1, 2]
```

</details>

---

## 第 8 题 🔴

**类型：** 代码分析题  
**标签：** 稀疏数组

### 题目

以下代码的输出是什么？

```javascript
const arr = [1, , 3];

console.log(arr.length);
console.log(arr.map(x => x * 2));
console.log(arr.filter(x => true));
console.log([...arr]);
```

**选项：**
- A. `3`, `[2, undefined, 6]`, `[1, undefined, 3]`, `[1, undefined, 3]`
- B. `3`, `[2, , 6]`, `[1, 3]`, `[1, undefined, 3]`
- C. `2`, `[2, 6]`, `[1, 3]`, `[1, 3]`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**稀疏数组（Sparse Array）的特殊行为**

```javascript
const arr = [1, , 3];  // 中间有空位

// 1. length 包含空位
console.log(arr.length);  // 3

// 2. map 跳过空位
console.log(arr.map(x => x * 2));  // [2, , 6]（空位保留）

// 3. filter 移除空位
console.log(arr.filter(x => true));  // [1, 3]（空位被移除）

// 4. 展开运算符将空位转为 undefined
console.log([...arr]);  // [1, undefined, 3]
```

---

**不同方法对空位的处理**

**跳过空位：**
```javascript
const arr = [1, , 3];

arr.forEach(x => console.log(x));  // 1, 3
arr.map(x => x * 2);               // [2, , 6]
arr.filter(x => true);             // [1, 3]
arr.reduce((acc, x) => acc + x, 0); // 4
arr.every(x => x > 0);             // true
arr.some(x => x > 0);              // true
arr.find(x => x > 0);              // 1
arr.findIndex(x => x > 0);         // 0
```

**不跳过空位：**
```javascript
const arr = [1, , 3];

arr.entries();         // Iterator [[0, 1], [1, undefined], [2, 3]]
arr.keys();            // Iterator [0, 1, 2]
Array.from(arr);       // [1, undefined, 3]
[...arr];              // [1, undefined, 3]
arr.join(',');         // "1,,3"
```

---

**创建稀疏数组**

**1. 数组字面量**
```javascript
const arr = [1, , 3];  // 逗号之间没有值
```

**2. Array 构造函数**
```javascript
const arr = new Array(3);  // [, , ,]（3 个空位）
console.log(arr.length);   // 3
console.log(0 in arr);     // false（空位不存在）
```

**3. delete 操作符**
```javascript
const arr = [1, 2, 3];
delete arr[1];
console.log(arr);  // [1, , 3]
```

**4. length 赋值**
```javascript
const arr = [1, 2, 3];
arr.length = 5;
console.log(arr);  // [1, 2, 3, , ,]
```

---

**检测空位**

```javascript
const arr = [1, , 3];

// 1. in 操作符
console.log(0 in arr);  // true（索引 0 存在）
console.log(1 in arr);  // false（索引 1 是空位）
console.log(2 in arr);  // true

// 2. hasOwnProperty
console.log(arr.hasOwnProperty(0));  // true
console.log(arr.hasOwnProperty(1));  // false
console.log(arr.hasOwnProperty(2));  // true

// 3. 遍历检查
function hasHoles(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (!(i in arr)) return true;
  }
  return false;
}

console.log(hasHoles([1, 2, 3]));  // false
console.log(hasHoles([1, , 3]));   // true
```

---

**空位 vs undefined**

```javascript
// 空位
const arr1 = [1, , 3];
console.log(arr1[1]);  // undefined
console.log(1 in arr1); // false

// 显式 undefined
const arr2 = [1, undefined, 3];
console.log(arr2[1]);  // undefined
console.log(1 in arr2); // true

// 行为差异
arr1.map(x => x * 2);  // [2, , 6]（跳过空位）
arr2.map(x => x * 2);  // [2, NaN, 6]（处理 undefined）
```

---

**填充空位**

```javascript
const arr = [1, , 3];

// 1. Array.from
Array.from(arr);  // [1, undefined, 3]

// 2. 展开运算符
[...arr];  // [1, undefined, 3]

// 3. map 不行（跳过空位）
arr.map(x => x);  // [1, , 3]

// 4. fill（ES6）
arr.fill(0, 1, 2);  // [1, 0, 3]

// 5. 自定义函数
function fillHoles(arr, value = undefined) {
  return Array.from(arr, x => x === undefined ? value : x);
}
```

---

**最佳实践**

```javascript
// ❌ 避免创建稀疏数组
const arr1 = new Array(3);  // 不好
const arr2 = [1, , 3];      // 不好

// ✅ 创建密集数组
const arr3 = Array(3).fill(0);           // [0, 0, 0]
const arr4 = Array.from({ length: 3 });  // [undefined, undefined, undefined]
const arr5 = [...Array(3)];              // [undefined, undefined, undefined]

// ✅ 检查并处理空位
function safeMap(arr, fn) {
  return Array.from(arr, (v, i) =>
    i in arr ? fn(v) : v
  );
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码输出题  
**标签：** TypedArray

### 题目

以下关于 TypedArray 的说法，哪个是正确的？

**选项：**
- A. TypedArray 可以存储任意类型的数据
- B. TypedArray 的长度可以动态改变
- C. TypedArray 基于 ArrayBuffer
- D. TypedArray 可以使用所有数组方法

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**TypedArray 的特性**

**C 正确：TypedArray 基于 ArrayBuffer**

```javascript
// 创建 ArrayBuffer（原始二进制数据）
const buffer = new ArrayBuffer(16);  // 16 字节

// 创建视图（TypedArray）
const int8 = new Int8Array(buffer);    // 8 位有符号整数
const int16 = new Int16Array(buffer);  // 16 位有符号整数
const int32 = new Int32Array(buffer);  // 32 位有符号整数

console.log(int8.length);   // 16（16 个 8 位整数）
console.log(int16.length);  // 8（8 个 16 位整数）
console.log(int32.length);  // 4（4 个 32 位整数）
```

---

**为什么其他选项错误？**

**A 错误：只能存储特定类型的数字**
```javascript
const uint8 = new Uint8Array(4);

uint8[0] = 255;    // ✓ 有效（0-255）
uint8[1] = 256;    // ✗ 溢出，变成 0
uint8[2] = -1;     // ✗ 溢出，变成 255
uint8[3] = 'abc';  // ✗ 转换为 0

console.log(uint8);  // Uint8Array(4) [255, 0, 255, 0]
```

**B 错误：长度固定**
```javascript
const arr = new Uint8Array(4);

// ❌ 不能 push/pop
arr.push(5);  // TypeError

// ❌ 不能修改 length
arr.length = 10;  // 无效，length 仍是 4
```

**D 错误：不支持某些方法**
```javascript
const arr = new Uint8Array([1, 2, 3]);

// ✓ 支持
arr.map(x => x * 2);
arr.filter(x => x > 1);
arr.reduce((a, b) => a + b);

// ✗ 不支持
arr.concat([4, 5]);  // TypeError
arr.push(4);         // TypeError
arr.pop();           // TypeError
```

---

**TypedArray 类型**

**有符号整数：**
- `Int8Array` - 8 位（-128 到 127）
- `Int16Array` - 16 位（-32768 到 32767）
- `Int32Array` - 32 位（-2³¹ 到 2³¹-1）

**无符号整数：**
- `Uint8Array` - 8 位（0 到 255）
- `Uint16Array` - 16 位（0 到 65535）
- `Uint32Array` - 32 位（0 到 2³²-1）
- `Uint8ClampedArray` - 8 位，溢出时截断到 0-255

**浮点数：**
- `Float32Array` - 32 位浮点
- `Float64Array` - 64 位浮点

**大整数：**
- `BigInt64Array` - 64 位有符号 BigInt
- `BigUint64Array` - 64 位无符号 BigInt

---

**创建 TypedArray**

**1. 指定长度**
```javascript
const arr = new Uint8Array(10);  // 10 个元素，初始值为 0
```

**2. 从数组创建**
```javascript
const arr = new Uint8Array([1, 2, 3, 4]);
```

**3. 从 ArrayBuffer**
```javascript
const buffer = new ArrayBuffer(8);
const arr = new Uint8Array(buffer);
```

**4. 从另一个 TypedArray**
```javascript
const arr1 = new Uint8Array([1, 2, 3]);
const arr2 = new Uint16Array(arr1);  // 复制并转换类型
```

---

**实际应用**

**1. 处理二进制数据**
```javascript
// 从文件读取二进制数据
const blob = new Blob([data]);
const buffer = await blob.arrayBuffer();
const uint8 = new Uint8Array(buffer);
```

**2. Canvas 图像处理**
```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// imageData.data 是 Uint8ClampedArray
const pixels = imageData.data;  // [R, G, B, A, R, G, B, A, ...]

// 转灰度
for (let i = 0; i < pixels.length; i += 4) {
  const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
  pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
}

ctx.putImageData(imageData, 0, 0);
```

**3. WebSocket 二进制通信**
```javascript
const socket = new WebSocket('ws://localhost:8080');
socket.binaryType = 'arraybuffer';

socket.onmessage = (event) => {
  const data = new Uint8Array(event.data);
  console.log(data);
};

// 发送二进制数据
const data = new Uint8Array([1, 2, 3, 4]);
socket.send(data.buffer);
```

**4. 音频处理**
```javascript
const audioContext = new AudioContext();

audioContext.decodeAudioData(arrayBuffer, (buffer) => {
  const channelData = buffer.getChannelData(0);  // Float32Array
  // 处理音频数据
});
```

---

**性能优势**

```javascript
// 普通数组
const arr1 = new Array(1000000);
for (let i = 0; i < arr1.length; i++) {
  arr1[i] = i;
}

// TypedArray（更快）
const arr2 = new Uint32Array(1000000);
for (let i = 0; i < arr2.length; i++) {
  arr2[i] = i;
}

// TypedArray 优势：
// 1. 固定类型，无需类型检查
// 2. 连续内存，缓存友好
// 3. 没有装箱/拆箱开销
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 数组性能

### 题目

在处理大数组时，以下哪种方式性能最好？

```javascript
// 场景：从 100 万个数字中找出所有偶数并加倍

// A
arr.filter(x => x % 2 === 0).map(x => x * 2);

// B
arr.reduce((acc, x) => {
  if (x % 2 === 0) acc.push(x * 2);
  return acc;
}, []);

// C
const result = [];
for (let i = 0; i < arr.length; i++) {
  if (arr[i] % 2 === 0) {
    result.push(arr[i] * 2);
  }
}

// D
arr.flatMap(x => x % 2 === 0 ? [x * 2] : []);
```

**选项：**
- A. A（链式调用）
- B. B（reduce）
- C. C（for 循环）
- D. D（flatMap）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**性能对比**

```javascript
const arr = Array(1000000).fill(0).map((_, i) => i);

// A: filter + map（慢）
// 遍历 2 次，创建 2 个中间数组
console.time('A');
const resultA = arr.filter(x => x % 2 === 0).map(x => x * 2);
console.timeEnd('A');  // ~50ms

// B: reduce（中等）
// 遍历 1 次，但 push 有开销
console.time('B');
const resultB = arr.reduce((acc, x) => {
  if (x % 2 === 0) acc.push(x * 2);
  return acc;
}, []);
console.timeEnd('B');  // ~30ms

// C: for 循环（最快）
// 遍历 1 次，最少的开销
console.time('C');
const resultC = [];
for (let i = 0; i < arr.length; i++) {
  if (arr[i] % 2 === 0) {
    resultC.push(arr[i] * 2);
  }
}
console.timeEnd('C');  // ~15ms

// D: flatMap（最慢）
// 遍历 1 次 + 扁平化开销
console.time('D');
const resultD = arr.flatMap(x => x % 2 === 0 ? [x * 2] : []);
console.timeEnd('D');  // ~80ms
```

---

**性能优化技巧**

**1. 预分配数组大小**
```javascript
// ❌ 动态增长（慢）
const result = [];
for (let i = 0; i < 1000000; i++) {
  result.push(i);
}

// ✅ 预分配（快）
const result = new Array(1000000);
for (let i = 0; i < result.length; i++) {
  result[i] = i;
}
```

**2. 避免多次遍历**
```javascript
// ❌ 链式调用：遍历 4 次
arr
  .filter(x => x > 0)
  .map(x => x * 2)
  .filter(x => x < 100)
  .map(x => x + 1);

// ✅ 单次遍历
const result = [];
for (let i = 0; i < arr.length; i++) {
  const x = arr[i];
  if (x > 0) {
    const doubled = x * 2;
    if (doubled < 100) {
      result.push(doubled + 1);
    }
  }
}
```

**3. 使用 TypedArray**
```javascript
// 处理数字时使用 TypedArray
const arr = new Uint32Array(1000000);
for (let i = 0; i < arr.length; i++) {
  arr[i] = i * 2;
}
```

**4. 避免创建中间数组**
```javascript
// ❌ 创建临时数组
const temp = arr.filter(x => x % 2 === 0);
const result = temp.map(x => x * 2);

// ✅ 直接生成结果
const result = [];
for (const x of arr) {
  if (x % 2 === 0) result.push(x * 2);
}
```

---

**何时使用何种方式？**

**小数组（< 1000）：**
```javascript
// 优先可读性
arr
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .slice(0, 10);
```

**中等数组（1000 - 10000）：**
```javascript
// 平衡性能和可读性
arr.reduce((acc, x) => {
  if (x % 2 === 0) acc.push(x * 2);
  return acc;
}, []);
```

**大数组（> 10000）：**
```javascript
// 优先性能
const result = [];
for (let i = 0; i < arr.length; i++) {
  if (arr[i] % 2 === 0) {
    result.push(arr[i] * 2);
  }
}
```

---

**实际优化案例**

**优化前：**
```javascript
function processUsers(users) {
  return users
    .filter(u => u.active)
    .map(u => u.email)
    .filter(email => email.includes('@'))
    .map(email => email.toLowerCase());
}
```

**优化后：**
```javascript
function processUsers(users) {
  const result = [];
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user.active) {
      const email = user.email;
      if (email.includes('@')) {
        result.push(email.toLowerCase());
      }
    }
  }
  return result;
}
```

**性能提升：** 约 3-5 倍

---

**性能测试建议**

```javascript
// 使用 performance.now() 精确测量
function benchmark(fn, iterations = 1000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  return end - start;
}

// 测试
const time1 = benchmark(() => method1(arr));
const time2 = benchmark(() => method2(arr));
console.log(`Method 1: ${time1}ms, Method 2: ${time2}ms`);
```

</details>

---

**本章总结：**
- ✅ 数组方法分类（mutating vs non-mutating）
- ✅ reduce 的强大应用
- ✅ forEach 的限制
- ✅ 方法链的使用
- ✅ sort 的陷阱
- ✅ flat/flatMap 扁平化
- ✅ 数组去重方案
- ✅ 稀疏数组特性
- ✅ TypedArray 应用
- ✅ 数组性能优化

**下一章：** [第 7 章：字符串与正则表达式](./chapter-07.md)
