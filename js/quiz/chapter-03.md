# 第 3 章：流程控制与异常处理 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** switch 语句

### 题目

以下代码的输出是什么？

```javascript
let day = 2;
switch (day) {
  case 1:
    console.log('Monday');
  case 2:
    console.log('Tuesday');
  case 3:
    console.log('Wednesday');
  default:
    console.log('Other');
}
```

**选项：**
- A. `Tuesday`
- B. `Tuesday`, `Wednesday`, `Other`
- C. `Tuesday`, `Other`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**switch 语句的穿透（fall-through）特性**

```javascript
// 没有 break，会继续执行后续 case
switch (day) {
  case 1:
    console.log('Monday');  // 不执行
  case 2:
    console.log('Tuesday');     // ✓ 执行（匹配）
  case 3:
    console.log('Wednesday');   // ✓ 执行（穿透）
  default:
    console.log('Other');       // ✓ 执行（穿透）
}
```

**正确写法（添加 break）：**
```javascript
switch (day) {
  case 1:
    console.log('Monday');
    break;
  case 2:
    console.log('Tuesday');
    break;  // 阻止穿透
  case 3:
    console.log('Wednesday');
    break;
  default:
    console.log('Other');
}
// 只输出：Tuesday
```

**利用穿透特性：**
```javascript
// 多个 case 共享逻辑
switch (month) {
  case 12:
  case 1:
  case 2:
    console.log('Winter');
    break;
  case 3:
  case 4:
  case 5:
    console.log('Spring');
    break;
}
```

**注意事项：**
- switch 使用 `===` 严格相等
- case 后可以是表达式
- default 可以省略

```javascript
switch (true) {
  case score >= 90:
    grade = 'A';
    break;
  case score >= 80:
    grade = 'B';
    break;
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 循环语句

### 题目

以下哪个循环语句可以在不知道循环次数时使用？

**选项：**
- A. `for` 循环
- B. `while` 循环
- C. `do...while` 循环
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**循环语句的选择**

**1. while 循环**
```javascript
// 适合不确定次数的循环
let num = 1;
while (num <= 100) {
  if (num % 7 === 0 && num % 5 === 0) {
    console.log(num);
    break;
  }
  num++;
}
```

**2. do...while 循环**
```javascript
// 至少执行一次
let input;
do {
  input = prompt('输入密码：');
} while (input !== '123456');
```

**3. for 循环**
```javascript
// 适合确定次数的循环
for (let i = 0; i < 10; i++) {
  console.log(i);
}
```

**对比：**
```javascript
// while：先判断，可能一次都不执行
let i = 10;
while (i < 5) {
  console.log(i);  // 不执行
}

// do...while：先执行，至少执行一次
let j = 10;
do {
  console.log(j);  // 执行一次（输出 10）
} while (j < 5);
```

**实际应用：**
```javascript
// 读取文件直到结束
while (!file.eof()) {
  processLine(file.readLine());
}

// 用户输入验证
do {
  age = getInput();
} while (age < 0 || age > 150);
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** break 和 continue

### 题目

`break` 和 `continue` 都可以用于终止整个循环。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**break vs continue**

**break：终止整个循环**
```javascript
for (let i = 0; i < 5; i++) {
  if (i === 3) {
    break;  // 终止循环
  }
  console.log(i);
}
// 输出：0, 1, 2
```

**continue：跳过当前迭代**
```javascript
for (let i = 0; i < 5; i++) {
  if (i === 3) {
    continue;  // 跳过本次，继续下次
  }
  console.log(i);
}
// 输出：0, 1, 2, 4
```

**在嵌套循环中：**
```javascript
// break 只终止最内层循环
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) break;
    console.log(i, j);
  }
}
// 输出：
// 0 0
// 1 0
// 2 0
```

**使用标签终止外层循环：**
```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) {
      break outer;  // 终止外层循环
    }
    console.log(i, j);
  }
}
// 输出：
// 0 0
// 0 1
// 0 2
// 1 0
```

**continue 与标签：**
```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) {
      continue outer;  // 跳到外层循环的下一次
    }
    console.log(i, j);
  }
}
// 输出：
// 0 0
// 1 0
// 2 0
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** for...in 循环

### 题目

以下代码的输出是什么？

```javascript
const arr = [10, 20, 30];
arr.foo = 'bar';

for (let i in arr) {
  console.log(i);
}
```

**选项：**
- A. `10`, `20`, `30`
- B. `0`, `1`, `2`
- C. `0`, `1`, `2`, `"foo"`
- D. `"0"`, `"1"`, `"2"`, `"foo"`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**for...in 遍历可枚举属性（包括继承的）**

```javascript
const arr = [10, 20, 30];
arr.foo = 'bar';

// for...in 遍历所有可枚举属性
for (let i in arr) {
  console.log(i);
  // "0"（字符串）
  // "1"（字符串）
  // "2"（字符串）
  // "foo"（自定义属性）
}
```

**关键点：**
- `for...in` 遍历的是**键（key）**，不是值
- 数组索引会被转换为**字符串**
- 会包含**自定义属性**
- 可能遍历到**继承的属性**

---

**对比不同循环方式**

**1. for...in（遍历键）**
```javascript
const arr = [10, 20, 30];
for (let i in arr) {
  console.log(typeof i);  // "string"
  console.log(i);         // "0", "1", "2"
}
```

**2. for...of（遍历值）- 推荐**
```javascript
const arr = [10, 20, 30];
for (let val of arr) {
  console.log(val);  // 10, 20, 30
}
```

**3. forEach**
```javascript
const arr = [10, 20, 30];
arr.forEach((val, idx) => {
  console.log(idx, val);  // 0 10, 1 20, 2 30
});
```

**4. 传统 for**
```javascript
const arr = [10, 20, 30];
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);  // 10, 20, 30
}
```

---

**for...in 的陷阱**

**1. 会遍历原型链**
```javascript
Array.prototype.custom = 'value';
const arr = [1, 2, 3];

for (let i in arr) {
  console.log(i);  // "0", "1", "2", "custom"
}

// 解决：使用 hasOwnProperty
for (let i in arr) {
  if (arr.hasOwnProperty(i)) {
    console.log(i);  // "0", "1", "2"
  }
}
```

**2. 顺序不保证**
```javascript
const obj = { c: 3, a: 1, b: 2 };
for (let key in obj) {
  console.log(key);  // 顺序可能不同
}
```

**3. 数组空位**
```javascript
const arr = [1, , 3];  // 稀疏数组
for (let i in arr) {
  console.log(i);  // "0", "2"（跳过空位）
}

for (let val of arr) {
  console.log(val);  // 1, undefined, 3
}
```

---

**最佳实践**

```javascript
// ✅ 数组：使用 for...of
for (let item of array) {}

// ✅ 对象：使用 Object.keys/values/entries
for (let key of Object.keys(obj)) {}
for (let val of Object.values(obj)) {}
for (let [key, val] of Object.entries(obj)) {}

// ❌ 数组避免使用 for...in
for (let i in array) {}  // 不推荐
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** 异常处理

### 题目

以下代码的输出是什么？

```javascript
try {
  console.log('try');
  throw new Error('Error!');
  console.log('after throw');
} catch (e) {
  console.log('catch');
  return;
} finally {
  console.log('finally');
}
console.log('end');
```

**选项：**
- A. `try`, `catch`, `finally`, `end`
- B. `try`, `catch`, `finally`
- C. `try`, `after throw`, `catch`, `finally`
- D. `try`, `catch`, `end`, `finally`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**try...catch...finally 的执行顺序**

**执行流程：**
```javascript
try {
  console.log('try');        // 1. 执行
  throw new Error('Error!'); // 2. 抛出异常
  console.log('after throw');// 3. 不执行（已跳转）
} catch (e) {
  console.log('catch');      // 4. 捕获异常
  return;                    // 5. 返回（但先执行 finally）
} finally {
  console.log('finally');    // 6. 总是执行
}
console.log('end');          // 7. 不执行（已 return）
```

**输出：**
```
try
catch
finally
```

---

**关键知识点**

**1. throw 后的代码不执行**
```javascript
try {
  throw new Error();
  console.log('不会执行');
}
```

**2. finally 总是执行**
```javascript
// 即使 return 也会执行 finally
function test() {
  try {
    return 'try';
  } finally {
    console.log('finally');  // 总是执行
  }
}
test();
// 输出：finally
// 返回："try"
```

**3. finally 可以覆盖返回值**
```javascript
function test() {
  try {
    return 'try';
  } finally {
    return 'finally';  // 覆盖返回值
  }
}
console.log(test());  // "finally"
```

**4. 多个 catch（ES2019 之前不支持）**
```javascript
try {
  // code
} catch (e) {
  if (e instanceof TypeError) {
    // 处理类型错误
  } else if (e instanceof ReferenceError) {
    // 处理引用错误
  } else {
    // 其他错误
  }
}
```

---

**实际应用**

**1. 资源清理**
```javascript
let file;
try {
  file = openFile('data.txt');
  processFile(file);
} catch (e) {
  console.error('处理失败:', e);
} finally {
  if (file) {
    file.close();  // 确保资源释放
  }
}
```

**2. 异步操作**
```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (e) {
    console.error('请求失败:', e);
    return null;
  } finally {
    hideLoading();  // 总是隐藏加载动画
  }
}
```

**3. 重新抛出异常**
```javascript
try {
  riskyOperation();
} catch (e) {
  console.error('捕获到错误:', e);
  throw e;  // 重新抛出
} finally {
  cleanup();
}
```

</details>

---

## 第 6 题 🟡

**类型：** 多选题  
**标签：** Error 对象

### 题目

以下哪些是 JavaScript 的内置错误类型？

**选项：**
- A. `TypeError`, `ReferenceError`, `SyntaxError`
- B. `RangeError`, `URIError`
- C. `EvalError`, `InternalError`
- D. `NetworkError`, `FileError`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**JavaScript 内置错误类型**

**1. 常见错误（A）**

**TypeError（类型错误）**
```javascript
null.foo();  // TypeError: Cannot read properties of null
undefined();  // TypeError: undefined is not a function
```

**ReferenceError（引用错误）**
```javascript
console.log(x);  // ReferenceError: x is not defined
```

**SyntaxError（语法错误）**
```javascript
eval('var a =');  // SyntaxError: Unexpected end of input
```

---

**2. 其他错误（B, C）**

**RangeError（范围错误）**
```javascript
new Array(-1);  // RangeError: Invalid array length
(123).toFixed(101);  // RangeError: toFixed() digits argument must be between 0 and 100
```

**URIError（URI 错误）**
```javascript
decodeURIComponent('%');  // URIError: URI malformed
```

**EvalError（eval 错误）**
```javascript
// 现代浏览器很少抛出此错误
// 主要用于向后兼容
```

**InternalError（内部错误）- 非标准**
```javascript
// 递归过深
function recursion() {
  recursion();
}
recursion();  // InternalError: too much recursion（Firefox）
```

---

**3. Error 基类**

```javascript
// 所有错误都继承自 Error
const err = new Error('错误信息');
console.log(err.name);     // "Error"
console.log(err.message);  // "错误信息"
console.log(err.stack);    // 调用栈
```

---

**自定义错误**

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class DatabaseError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
  }
}

// 使用
try {
  throw new ValidationError('邮箱格式错误');
} catch (e) {
  if (e instanceof ValidationError) {
    console.log('验证错误:', e.message);
  }
}
```

---

**错误处理最佳实践**

```javascript
// ✅ 明确错误类型
try {
  JSON.parse(invalidJSON);
} catch (e) {
  if (e instanceof SyntaxError) {
    console.error('JSON 格式错误');
  } else {
    console.error('未知错误:', e);
  }
}

// ✅ 提供错误上下文
throw new Error(`无法加载用户 ${userId} 的数据`);

// ✅ 不要吞掉错误
try {
  riskyOperation();
} catch (e) {
  // ❌ 错误：什么都不做
}

// ✅ 至少记录日志
try {
  riskyOperation();
} catch (e) {
  console.error('操作失败:', e);
  // 或重新抛出
  throw e;
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 循环与闭包

### 题目

以下代码的输出是什么？

```javascript
const funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(() => console.log(i));
}
funcs.forEach(f => f());
```

**选项：**
- A. `0`, `1`, `2`
- B. `3`, `3`, `3`
- C. `undefined`, `undefined`, `undefined`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**经典的循环闭包问题**

**问题原因：**
```javascript
// var 没有块级作用域
for (var i = 0; i < 3; i++) {
  funcs.push(() => console.log(i));
  // 所有箭头函数都引用同一个 i
}
// 循环结束后，i = 3

funcs.forEach(f => f());
// 执行时，i 已经是 3
// 输出：3, 3, 3
```

---

**解决方案**

**方案 1：使用 let（最简单）**
```javascript
const funcs = [];
for (let i = 0; i < 3; i++) {
  funcs.push(() => console.log(i));
  // 每次迭代创建新的 i
}
funcs.forEach(f => f());
// 输出：0, 1, 2
```

**方案 2：IIFE**
```javascript
const funcs = [];
for (var i = 0; i < 3; i++) {
  (function(j) {
    funcs.push(() => console.log(j));
  })(i);
}
funcs.forEach(f => f());
// 输出：0, 1, 2
```

**方案 3：额外函数**
```javascript
function createFunc(val) {
  return () => console.log(val);
}

const funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(createFunc(i));
}
funcs.forEach(f => f());
// 输出：0, 1, 2
```

**方案 4：bind**
```javascript
const funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(console.log.bind(null, i));
}
funcs.forEach(f => f());
// 输出：0, 1, 2
```

---

**深入理解**

**为什么 var 有问题？**
```javascript
// var 的实际执行
var i;
const funcs = [];
for (i = 0; i < 3; i++) {
  funcs.push(() => console.log(i));
}
// i = 3
funcs.forEach(f => f());
// 所有函数引用同一个 i
```

**let 如何解决？**
```javascript
// let 为每次迭代创建新作用域
{
  let i = 0;
  funcs.push(() => console.log(i));
}
{
  let i = 1;
  funcs.push(() => console.log(i));
}
{
  let i = 2;
  funcs.push(() => console.log(i));
}
```

---

**实际场景**

**1. 事件监听**
```javascript
// ❌ 错误
for (var i = 0; i < buttons.length; i++) {
  buttons[i].onclick = function() {
    console.log(i);  // 总是最后一个值
  };
}

// ✅ 正确
for (let i = 0; i < buttons.length; i++) {
  buttons[i].onclick = function() {
    console.log(i);  // 正确的索引
  };
}
```

**2. 定时器**
```javascript
// ❌ 错误
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出：3, 3, 3

// ✅ 正确
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出：0, 1, 2
```

</details>

---

## 第 8 题 🔴

**类型：** 代码分析题  
**标签：** 异常传播

### 题目

以下代码的输出是什么？

```javascript
function a() {
  try {
    b();
  } catch (e) {
    console.log('caught in a');
  }
}

function b() {
  c();
}

function c() {
  throw new Error('Error in c');
}

try {
  a();
  console.log('after a');
} catch (e) {
  console.log('caught outside');
}
```

**选项：**
- A. `caught in a`, `after a`
- B. `caught outside`
- C. `caught in a`, `caught outside`
- D. `Error in c`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**异常的传播和捕获**

**执行流程：**
```javascript
1. 调用 a()
2. a() 的 try 块调用 b()
3. b() 调用 c()
4. c() 抛出异常
5. 异常沿调用栈向上传播：c() → b() → a()
6. a() 的 catch 块捕获异常
7. 输出："caught in a"
8. a() 正常返回
9. 继续执行：console.log('after a')
10. 输出："after a"
```

**调用栈示意：**
```
异常抛出点：
c() throw Error
  ↓
b() 无 try...catch，向上传播
  ↓
a() try...catch 捕获 ✓
  ↓
外层 try...catch（不会到达）
```

---

**关键知识点**

**1. 异常向上传播**
```javascript
function level3() {
  throw new Error('Error');
}

function level2() {
  level3();  // 无 try...catch，继续传播
}

function level1() {
  try {
    level2();
  } catch (e) {
    console.log('在 level1 捕获');
  }
}

level1();  // "在 level1 捕获"
```

**2. 捕获后停止传播**
```javascript
function inner() {
  try {
    throw new Error('Error');
  } catch (e) {
    console.log('inner caught');
    // 不重新抛出，异常停止传播
  }
}

function outer() {
  try {
    inner();
  } catch (e) {
    console.log('outer caught');  // 不会执行
  }
}

outer();
// 只输出："inner caught"
```

**3. 重新抛出异常**
```javascript
function process() {
  try {
    riskyOperation();
  } catch (e) {
    console.log('记录错误:', e.message);
    throw e;  // 重新抛出，继续传播
  }
}

try {
  process();
} catch (e) {
  console.log('外层捕获:', e.message);
}
```

---

**实际应用场景**

**1. 分层错误处理**
```javascript
// 数据层
function fetchData() {
  try {
    return database.query();
  } catch (e) {
    throw new DatabaseError('查询失败', e);
  }
}

// 业务层
function getUser(id) {
  try {
    return fetchData(`SELECT * FROM users WHERE id=${id}`);
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw new BusinessError('用户不存在');
    }
    throw e;
  }
}

// 表现层
try {
  const user = getUser(123);
  render(user);
} catch (e) {
  if (e instanceof BusinessError) {
    showError(e.message);
  } else {
    showError('系统错误，请稍后重试');
  }
}
```

**2. 异步错误传播**
```javascript
async function processData() {
  try {
    const data = await fetchData();
    await validateData(data);
    await saveData(data);
  } catch (e) {
    console.error('处理失败:', e);
    throw e;
  }
}

// 调用
try {
  await processData();
} catch (e) {
  handleError(e);
}
```

**3. Promise 错误链**
```javascript
fetchUser()
  .then(user => fetchOrders(user.id))
  .then(orders => processOrders(orders))
  .catch(e => {
    // 捕获整个链中的任何错误
    console.error('流程失败:', e);
  });
```

</details>

---

## 第 9 题 🔴

**类型：** 代码输出题  
**标签：** for...of 与迭代器

### 题目

以下代码的输出是什么？

```javascript
const obj = {
  a: 1,
  b: 2,
  c: 3
};

for (let val of obj) {
  console.log(val);
}
```

**选项：**
- A. `1`, `2`, `3`
- B. `"a"`, `"b"`, `"c"`
- C. `["a", 1]`, `["b", 2]`, `["c", 3]`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**for...of 要求对象可迭代**

```javascript
const obj = { a: 1, b: 2, c: 3 };

for (let val of obj) {
  console.log(val);
}
// TypeError: obj is not iterable
```

**原因：**
- 普通对象不是可迭代对象（Iterable）
- 没有实现 `Symbol.iterator` 方法
- `for...of` 只能遍历可迭代对象

---

**可迭代对象**

**内置可迭代对象：**
```javascript
// 数组
for (let val of [1, 2, 3]) {
  console.log(val);  // 1, 2, 3
}

// 字符串
for (let char of 'abc') {
  console.log(char);  // 'a', 'b', 'c'
}

// Map
const map = new Map([['a', 1], ['b', 2]]);
for (let [key, val] of map) {
  console.log(key, val);  // 'a' 1, 'b' 2
}

// Set
const set = new Set([1, 2, 3]);
for (let val of set) {
  console.log(val);  // 1, 2, 3
}
```

---

**遍历对象的正确方式**

**1. Object.keys()**
```javascript
const obj = { a: 1, b: 2, c: 3 };

for (let key of Object.keys(obj)) {
  console.log(key);  // 'a', 'b', 'c'
}
```

**2. Object.values()**
```javascript
for (let val of Object.values(obj)) {
  console.log(val);  // 1, 2, 3
}
```

**3. Object.entries()**
```javascript
for (let [key, val] of Object.entries(obj)) {
  console.log(key, val);  // 'a' 1, 'b' 2, 'c' 3
}
```

---

**使对象可迭代**

```javascript
const obj = {
  a: 1,
  b: 2,
  c: 3,
  [Symbol.iterator]() {
    const keys = Object.keys(this);
    let index = 0;
    return {
      next: () => {
        if (index < keys.length) {
          const key = keys[index++];
          return { value: this[key], done: false };
        }
        return { done: true };
      }
    };
  }
};

for (let val of obj) {
  console.log(val);  // 1, 2, 3
}
```

**简化版（使用生成器）：**
```javascript
const obj = {
  a: 1,
  b: 2,
  c: 3,
  *[Symbol.iterator]() {
    for (let key of Object.keys(this)) {
      yield this[key];
    }
  }
};

for (let val of obj) {
  console.log(val);  // 1, 2, 3
}
```

---

**迭代器协议**

**可迭代协议（Iterable Protocol）：**
- 对象必须实现 `@@iterator` 方法（`Symbol.iterator`）
- 该方法返回一个迭代器对象

**迭代器协议（Iterator Protocol）：**
- 必须有 `next()` 方法
- `next()` 返回 `{ value, done }`

```javascript
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        return i < 3
          ? { value: i++, done: false }
          : { done: true };
      }
    };
  }
};

for (let val of iterable) {
  console.log(val);  // 0, 1, 2
}
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 标签语句

### 题目

以下代码的输出是什么？

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) {
      continue outer;
    }
    console.log(i, j);
  }
}
```

**选项：**
- A. 输出 0-0 到 2-2 的所有组合，跳过 1-1
- B. 输出 0-0, 0-1, 0-2, 1-0
- C. 输出 0-0, 0-1, 0-2, 1-0, 2-0, 2-1, 2-2
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**标签语句与 continue/break**

**执行过程：**
```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) {
      continue outer;  // 跳到外层循环的下一次
    }
    console.log(i, j);
  }
}
```

**逐步分析：**
```
i=0, j=0: 输出 0 0
i=0, j=1: 输出 0 1
i=0, j=2: 输出 0 2
i=1, j=0: 输出 1 0
i=1, j=1: continue outer（跳到 i=2）
i=2, j=0: 输出 2 0
i=2, j=1: 输出 2 1
i=2, j=2: 输出 2 2
```

**输出：**
```
0 0
0 1
0 2
1 0
2 0
2 1
2 2
```

---

**标签语句的使用**

**1. break 标签**
```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) {
      break outer;  // 终止外层循环
    }
    console.log(i, j);
  }
}
// 输出：
// 0 0
// 0 1
// 0 2
// 1 0
```

**2. continue 标签**
```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) {
      continue outer;  // 跳到外层的下一次迭代
    }
    console.log(i, j);
  }
}
// 输出：
// 0 0
// 1 0
// 2 0
```

---

**对比普通 continue/break**

**普通 continue（只影响内层）：**
```javascript
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) {
      continue;  // 跳过 j=1，继续 j=2
    }
    console.log(i, j);
  }
}
// 输出：
// 0 0, 0 2
// 1 0, 1 2
// 2 0, 2 2
```

**标签 continue（跳到外层）：**
```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) {
      continue outer;  // 跳到外层的 i++
    }
    console.log(i, j);
  }
}
// 输出：
// 0 0
// 1 0
// 2 0
```

---

**实际应用**

**1. 二维数组搜索**
```javascript
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

search: for (let i = 0; i < matrix.length; i++) {
  for (let j = 0; j < matrix[i].length; j++) {
    if (matrix[i][j] === 5) {
      console.log(`找到了！位置：[${i}, ${j}]`);
      break search;  // 找到后退出所有循环
    }
  }
}
```

**2. 多层验证**
```javascript
validation: {
  if (!username) {
    error = 'Username required';
    break validation;
  }
  if (!email) {
    error = 'Email required';
    break validation;
  }
  if (!password) {
    error = 'Password required';
    break validation;
  }
  // 验证通过
  submit();
}
if (error) {
  showError(error);
}
```

**注意：**
- 标签可以用于任何语句块，不只是循环
- 但过度使用会降低代码可读性
- 优先考虑函数返回、重构等方式

</details>

---

**本章总结：**
- ✅ 条件语句（if/switch）
- ✅ 循环语句（for/while/do...while）
- ✅ break 和 continue
- ✅ for...in 和 for...of
- ✅ 异常处理（try...catch...finally）
- ✅ Error 对象和自定义错误
- ✅ 标签语句

**下一章：** [第 4 章：函数与作用域](./chapter-04.md)
