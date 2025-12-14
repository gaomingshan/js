# 第 7 章：字符串与正则表达式 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 字符串方法

### 题目

以下哪个字符串方法会改变原字符串？

**选项：**
- A. `toUpperCase()`
- B. `slice()`
- C. `replace()`
- D. 都不会

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**字符串是不可变的（Immutable）**

```javascript
const str = 'hello';

// 所有字符串方法都返回新字符串，不修改原字符串
const upper = str.toUpperCase();
console.log(str);    // "hello"（不变）
console.log(upper);  // "HELLO"（新字符串）

const sliced = str.slice(1, 4);
console.log(str);     // "hello"（不变）
console.log(sliced);  // "ell"

const replaced = str.replace('l', 'L');
console.log(str);       // "hello"（不变）
console.log(replaced);  // "heLlo"
```

**尝试修改字符串：**
```javascript
const str = 'hello';
str[0] = 'H';  // 静默失败（严格模式下不报错）
console.log(str);  // "hello"（不变）

// 真正修改需要重新赋值
let str2 = 'hello';
str2 = str2.toUpperCase();
console.log(str2);  // "HELLO"
```

**常用字符串方法：**
- `toUpperCase()` / `toLowerCase()` - 转换大小写
- `slice()` / `substring()` / `substr()` - 截取
- `replace()` / `replaceAll()` - 替换
- `trim()` / `trimStart()` / `trimEnd()` - 去空格
- `split()` - 分割成数组
- `concat()` - 拼接
- `repeat()` - 重复
- `padStart()` / `padEnd()` - 填充

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 模板字符串

### 题目

以下代码的输出是什么？

```javascript
const name = 'Alice';
const age = 25;
const str = `Hello, ${name}!
You are ${age} years old.`;
console.log(str);
```

**选项：**
- A. `"Hello, Alice! You are 25 years old."`
- B. `"Hello, ${name}!\nYou are ${age} years old."`
- C. 输出包含换行
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**模板字符串保留换行**

```javascript
const name = 'Alice';
const age = 25;

const str = `Hello, ${name}!
You are ${age} years old.`;

console.log(str);
// 输出：
// Hello, Alice!
// You are 25 years old.
```

**模板字符串的特性：**
1. 使用反引号 `` ` ``
2. 支持变量插值 `${expression}`
3. 保留多行格式
4. 可以嵌套
5. 支持表达式

**示例：**
```javascript
// 1. 表达式
const sum = `2 + 3 = ${2 + 3}`;  // "2 + 3 = 5"

// 2. 函数调用
const greeting = `Hello, ${getName()}!`;

// 3. 三元表达式
const status = `User is ${isOnline ? 'online' : 'offline'}`;

// 4. 嵌套模板
const html = `
  <div>
    ${items.map(item => `<span>${item}</span>`).join('')}
  </div>
`;

// 5. 标签函数
function tag(strings, ...values) {
  console.log(strings);  // 字符串数组
  console.log(values);   // 插值数组
}
tag`Hello ${name}, you are ${age}!`;
```

**对比普通字符串：**
```javascript
// 普通字符串需要手动换行和拼接
const str1 = 'Hello, ' + name + '!\n' +
             'You are ' + age + ' years old.';

// 模板字符串更简洁
const str2 = `Hello, ${name}!
You are ${age} years old.`;
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 字符串方法

### 题目

`includes()`、`startsWith()` 和 `endsWith()` 方法都支持第二个参数指定搜索起始位置。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**三个方法都支持第二个参数**

**includes(searchString, position)**
```javascript
const str = 'Hello World';

str.includes('World');      // true
str.includes('World', 0);   // true
str.includes('World', 6);   // true
str.includes('World', 7);   // false（从索引 7 开始没有 'World'）
```

**startsWith(searchString, position)**
```javascript
const str = 'Hello World';

str.startsWith('Hello');      // true
str.startsWith('World');      // false
str.startsWith('World', 6);   // true（从索引 6 开始）
```

**endsWith(searchString, length)**
```javascript
const str = 'Hello World';

str.endsWith('World');        // true
str.endsWith('Hello');        // false
str.endsWith('Hello', 5);     // true（只考虑前 5 个字符）
```

**注意 endsWith 的第二个参数是 length，不是 position！**

---

**详细说明**

**includes：从指定位置开始搜索**
```javascript
const str = 'abcabcabc';

str.includes('abc');     // true
str.includes('abc', 0);  // true（从索引 0）
str.includes('abc', 1);  // true（从索引 1，找到索引 3 的 'abc'）
str.includes('abc', 7);  // false（从索引 7 开始没有完整的 'abc'）
```

**startsWith：检查从指定位置开始是否匹配**
```javascript
const str = 'Hello World';

str.startsWith('H');          // true
str.startsWith('W', 6);       // true（索引 6 是 'W'）
str.startsWith('World', 6);   // true
str.startsWith('Hello', 6);   // false
```

**endsWith：检查前 N 个字符是否以指定字符串结尾**
```javascript
const str = 'Hello World';

str.endsWith('World');        // true
str.endsWith('World', 11);    // true（前 11 个字符）
str.endsWith('Hello', 5);     // true（前 5 个字符 "Hello"）
str.endsWith('World', 5);     // false（前 5 个字符不是以 'World' 结尾）
```

---

**实际应用**

**1. 文件扩展名检查**
```javascript
function hasImageExt(filename) {
  return filename.endsWith('.jpg') ||
         filename.endsWith('.png') ||
         filename.endsWith('.gif');
}

hasImageExt('photo.jpg');  // true
hasImageExt('doc.pdf');    // false
```

**2. URL 协议检查**
```javascript
function isSecure(url) {
  return url.startsWith('https://');
}

isSecure('https://example.com');  // true
isSecure('http://example.com');   // false
```

**3. 关键词过滤**
```javascript
function containsBadWord(text, badWords) {
  return badWords.some(word => text.includes(word));
}

containsBadWord('This is bad', ['bad', 'evil']);  // true
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 正则表达式

### 题目

以下代码的输出是什么？

```javascript
const str = 'test test test';
const regex = /test/g;

console.log(regex.test(str));
console.log(regex.test(str));
console.log(regex.test(str));
console.log(regex.test(str));
```

**选项：**
- A. `true`, `true`, `true`, `true`
- B. `true`, `false`, `true`, `false`
- C. `true`, `true`, `true`, `false`
- D. `true`, `false`, `false`, `false`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**正则表达式的 lastIndex 属性**

```javascript
const str = 'test test test';
const regex = /test/g;  // 全局标志 g

// 第 1 次：从索引 0 开始，找到 'test'
console.log(regex.test(str));  // true
console.log(regex.lastIndex);  // 4

// 第 2 次：从索引 4 开始，找到 'test'
console.log(regex.test(str));  // true
console.log(regex.lastIndex);  // 9

// 第 3 次：从索引 9 开始，找到 'test'
console.log(regex.test(str));  // true
console.log(regex.lastIndex);  // 14

// 第 4 次：从索引 14 开始，没有匹配
console.log(regex.test(str));  // false
console.log(regex.lastIndex);  // 0（重置）
```

---

**g 标志的影响**

**有 g 标志：**
```javascript
const regex = /test/g;
regex.test('test');  // true（lastIndex: 4）
regex.test('test');  // false（从索引 4 开始，没有匹配）
regex.test('test');  // true（lastIndex 重置为 0）
```

**无 g 标志：**
```javascript
const regex = /test/;
regex.test('test');  // true（lastIndex 始终为 0）
regex.test('test');  // true
regex.test('test');  // true
```

---

**常见陷阱**

**1. 重复使用全局正则**
```javascript
const regex = /test/g;

// ❌ 错误用法
function isValid(str) {
  return regex.test(str);  // lastIndex 会累积
}

isValid('test');  // true
isValid('test');  // false（意外！）

// ✅ 正确用法
function isValid(str) {
  return /test/.test(str);  // 每次创建新正则
}

// ✅ 或重置 lastIndex
function isValid(str) {
  regex.lastIndex = 0;
  return regex.test(str);
}
```

**2. 循环中使用全局正则**
```javascript
const regex = /\d+/g;
const str = '1 2 3';

// ❌ 可能导致无限循环
while (regex.test(str)) {
  console.log('match');
  // test() 会移动 lastIndex，但没有重置
}

// ✅ 使用 match()
const matches = str.match(/\d+/g);
matches.forEach(m => console.log(m));

// ✅ 或使用 exec()
let match;
while ((match = regex.exec(str)) !== null) {
  console.log(match[0]);
}
```

---

**exec() vs test()**

```javascript
const str = 'test1 test2 test3';
const regex = /test(\d)/g;

// test()：只返回 boolean
console.log(regex.test(str));  // true（lastIndex: 5）

// exec()：返回匹配详情
regex.lastIndex = 0;  // 重置
let match;
while ((match = regex.exec(str)) !== null) {
  console.log(match[0]);  // 完整匹配
  console.log(match[1]);  // 捕获组
  console.log(match.index);  // 匹配位置
}
// 输出：
// test1, 1, 0
// test2, 2, 6
// test3, 3, 12
```

---

**最佳实践**

```javascript
// ✅ 不需要全局匹配时，不用 g 标志
function containsDigit(str) {
  return /\d/.test(str);
}

// ✅ 需要全局匹配时，使用 match()
function getAllDigits(str) {
  return str.match(/\d/g) || [];
}

// ✅ 需要详细信息时，使用 matchAll()
function getMatches(str) {
  return [...str.matchAll(/test(\d)/g)];
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** replace

### 题目

以下代码的输出是什么？

```javascript
const str = 'hello world';

console.log(str.replace('l', 'L'));
console.log(str.replace(/l/, 'L'));
console.log(str.replace(/l/g, 'L'));
```

**选项：**
- A. `"heLLo worLd"`, `"heLLo worLd"`, `"heLLo worLd"`
- B. `"heLlo world"`, `"heLlo world"`, `"heLLo worLd"`
- C. `"heLLo worLd"`, `"heLlo world"`, `"heLLo worLd"`
- D. `"heLlo world"`, `"heLlo world"`, `"heLlo world"`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**replace() 的替换规则**

```javascript
const str = 'hello world';

// 字符串参数：只替换第一个匹配
console.log(str.replace('l', 'L'));
// "heLlo world"

// 正则（无 g）：只替换第一个匹配
console.log(str.replace(/l/, 'L'));
// "heLlo world"

// 正则（有 g）：替换所有匹配
console.log(str.replace(/l/g, 'L'));
// "heLLo worLd"
```

---

**replace() 的参数**

**1. 字符串替换**
```javascript
const str = 'cat cat cat';

// 只替换第一个
str.replace('cat', 'dog');  // "dog cat cat"

// 替换所有需要用正则 + g
str.replace(/cat/g, 'dog');  // "dog dog dog"
```

**2. 使用特殊字符**
```javascript
const str = 'John Smith';

// $& - 匹配的字符串
str.replace(/\w+/g, '[$&]');  // "[John] [Smith]"

// $` - 匹配前的字符串
str.replace('Smith', '($`)');  // "John (John )"

// $' - 匹配后的字符串
str.replace('John', "($')");  // "( Smith) Smith"

// $n - 捕获组
str.replace(/(\w+) (\w+)/, '$2, $1');  // "Smith, John"
```

**3. 函数替换**
```javascript
const str = 'hello world';

// 回调函数
str.replace(/\w+/g, (match, index, input) => {
  console.log(match, index);
  return match.toUpperCase();
});
// 输出：hello 0
//      world 6
// 返回："HELLO WORLD"

// 实用示例：驼峰转换
'hello-world-foo'.replace(/-(\w)/g, (match, char) => {
  return char.toUpperCase();
});
// "helloWorldFoo"
```

---

**replaceAll()（ES2021）**

```javascript
const str = 'cat cat cat';

// 不需要正则的全局替换
str.replaceAll('cat', 'dog');  // "dog dog dog"

// 也支持正则（必须有 g 标志）
str.replaceAll(/cat/g, 'dog');  // "dog dog dog"

// ❌ 不能用没有 g 的正则
str.replaceAll(/cat/, 'dog');  // TypeError
```

---

**实际应用**

**1. 模板替换**
```javascript
const template = 'Hello, {{name}}! You are {{age}} years old.';
const data = { name: 'Alice', age: 25 };

const result = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
  return data[key] || match;
});
// "Hello, Alice! You are 25 years old."
```

**2. HTML 转义**
```javascript
function escapeHTML(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, char => map[char]);
}

escapeHTML('<script>alert("XSS")</script>');
// "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"
```

**3. 格式化数字**
```javascript
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

formatNumber(1234567);  // "1,234,567"
```

**4. 删除空格**
```javascript
// 删除所有空格
str.replace(/\s/g, '');

// 删除首尾空格
str.replace(/^\s+|\s+$/g, '');  // 或用 trim()

// 压缩多个空格为一个
str.replace(/\s+/g, ' ');
```

</details>

---

## 第 6 题 🟡

**类型：** 代码输出题  
**标签：** match

### 题目

以下代码的输出是什么？

```javascript
const str = 'test1 test2 test3';

console.log(str.match(/test\d/));
console.log(str.match(/test\d/g));
```

**选项：**
- A. `["test1"]`, `["test1", "test2", "test3"]`
- B. `["test1", index: 0, ...]`, `["test1", "test2", "test3"]`
- C. `null`, `null`
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**match() 返回值的差异**

**无 g 标志：返回详细信息**
```javascript
const str = 'test1 test2 test3';
const result = str.match(/test\d/);

console.log(result);
// [
//   "test1",           // 匹配的字符串
//   index: 0,          // 匹配位置
//   input: "test1 test2 test3",  // 原字符串
//   groups: undefined  // 命名捕获组
// ]

console.log(result[0]);      // "test1"
console.log(result.index);   // 0
console.log(result.input);   // "test1 test2 test3"
```

**有 g 标志：返回所有匹配**
```javascript
const result = str.match(/test\d/g);

console.log(result);
// ["test1", "test2", "test3"]（普通数组）

console.log(result[0]);      // "test1"
console.log(result.index);   // undefined（无此属性）
console.log(result.input);   // undefined（无此属性）
```

---

**捕获组的差异**

**无 g 标志：包含捕获组**
```javascript
const str = 'test1 test2';
const result = str.match(/test(\d)/);

console.log(result);
// [
//   "test1",  // 完整匹配
//   "1",      // 第 1 个捕获组
//   index: 0,
//   input: "test1 test2",
//   groups: undefined
// ]

console.log(result[0]);  // "test1"（完整匹配）
console.log(result[1]);  // "1"（捕获组）
```

**有 g 标志：不包含捕获组**
```javascript
const result = str.match(/test(\d)/g);

console.log(result);
// ["test1", "test2"]（只有完整匹配）

// 捕获组信息丢失！
```

---

**matchAll()：获取所有匹配的详细信息**

```javascript
const str = 'test1 test2 test3';
const matches = [...str.matchAll(/test(\d)/g)];

console.log(matches);
// [
//   ["test1", "1", index: 0, input: "...", groups: undefined],
//   ["test2", "2", index: 6, input: "...", groups: undefined],
//   ["test3", "3", index: 12, input: "...", groups: undefined]
// ]

matches.forEach(match => {
  console.log(match[0]);  // 完整匹配
  console.log(match[1]);  // 捕获组
  console.log(match.index);  // 位置
});
```

---

**命名捕获组**

```javascript
const str = 'John: 25, Jane: 30';
const regex = /(?<name>\w+): (?<age>\d+)/g;

const matches = [...str.matchAll(regex)];

matches.forEach(match => {
  console.log(match.groups);
  // { name: 'John', age: '25' }
  // { name: 'Jane', age: '30' }
});
```

---

**对比 exec()**

```javascript
const str = 'test1 test2 test3';
const regex = /test(\d)/g;

// matchAll()
const matches1 = [...str.matchAll(regex)];

// exec() 循环
const matches2 = [];
let match;
while ((match = regex.exec(str)) !== null) {
  matches2.push(match);
}

// 结果相同
console.log(matches1);
console.log(matches2);
```

---

**实际应用**

**1. 提取所有链接**
```javascript
const html = '<a href="/page1">Link1</a> <a href="/page2">Link2</a>';
const links = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
console.log(links);  // ["/page1", "/page2"]
```

**2. 解析查询字符串**
```javascript
const url = '?name=Alice&age=25&city=NYC';
const params = Object.fromEntries(
  [...url.matchAll(/(\w+)=(\w+)/g)].map(m => [m[1], m[2]])
);
console.log(params);  // { name: "Alice", age: "25", city: "NYC" }
```

**3. 提取所有邮箱**
```javascript
const text = 'Contact: alice@example.com or bob@test.com';
const emails = text.match(/\S+@\S+\.\S+/g);
console.log(emails);  // ["alice@example.com", "bob@test.com"]
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 正则标志

### 题目

以下哪些是正则表达式的有效标志？

**选项：**
- A. `g`（全局）、`i`（忽略大小写）、`m`（多行）
- B. `s`（dotAll）、`u`（Unicode）、`y`（粘连）
- C. `d`（hasIndices）
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**正则表达式的所有标志（全部正确）**

**A. 基础标志**

**g（global）- 全局匹配**
```javascript
const str = 'test test';
/test/.test(str);   // 匹配一次
/test/g.test(str);  // 匹配所有
```

**i（ignoreCase）- 忽略大小写**
```javascript
/hello/i.test('HELLO');  // true
/hello/.test('HELLO');   // false
```

**m（multiline）- 多行模式**
```javascript
const str = 'line1\nline2';

// 无 m：^ 和 $ 匹配整个字符串
/^line2/.test(str);   // false

// 有 m：^ 和 $ 匹配每一行
/^line2/m.test(str);  // true
```

---

**B. ES6+ 标志**

**s（dotAll）- 点号匹配所有字符**
```javascript
const str = 'hello\nworld';

// 无 s：. 不匹配换行符
/hello.world/.test(str);   // false

// 有 s：. 匹配包括换行符
/hello.world/s.test(str);  // true
```

**u（unicode）- Unicode 模式**
```javascript
// 正确处理 Unicode 字符
const str = '𝟘𝟙𝟚';  // 数学数字（两个 UTF-16 单元）

/^.{3}$/.test(str);   // false（识别为 6 个字符）
/^.{3}$/u.test(str);  // true（正确识别为 3 个字符）

// Unicode 属性转义
/\p{Script=Han}/u.test('中');  // true（汉字）
/\p{Emoji}/u.test('😀');      // true（表情）
```

**y（sticky）- 粘连匹配**
```javascript
const str = 'test1 test2 test3';
const regex = /test\d/y;

regex.lastIndex = 0;
console.log(regex.exec(str));  // ["test1"]（从索引 0 开始）

regex.lastIndex = 6;
console.log(regex.exec(str));  // ["test2"]（从索引 6 开始）

regex.lastIndex = 7;
console.log(regex.exec(str));  // null（必须从 lastIndex 开始匹配）
```

---

**C. ES2022 标志**

**d（hasIndices）- 生成索引**
```javascript
const str = 'test123';
const regex = /test(\d+)/d;
const match = str.match(regex);

console.log(match.indices);
// [
//   [0, 7],    // 完整匹配的起止位置
//   [4, 7]     // 捕获组的起止位置
// ]
```

---

**标志组合**

```javascript
// 多个标志可以组合
const regex1 = /pattern/gi;     // 全局 + 忽略大小写
const regex2 = /pattern/gim;    // 全局 + 忽略大小写 + 多行
const regex3 = /pattern/gimsuy; // 所有标志
```

---

**实际应用**

**1. 全局替换（忽略大小写）**
```javascript
const str = 'Hello HELLO hello';
str.replace(/hello/gi, 'Hi');
// "Hi Hi Hi"
```

**2. 多行文本处理**
```javascript
const text = `
line 1
line 2
line 3
`;

// 匹配每行开头的数字
text.match(/^\d+/gm);
```

**3. Unicode 字符处理**
```javascript
// 匹配所有中文字符
const text = 'Hello 世界 World';
text.match(/\p{Script=Han}+/gu);  // ["世界"]

// 匹配所有表情
const text2 = 'Hello 😀 World 👍';
text2.match(/\p{Emoji}/gu);  // ["😀", "👍"]
```

**4. 粘连匹配（词法分析）**
```javascript
const tokens = ['var', 'x', '=', '10', ';'];
const str = 'var x = 10;';
const regex = /\w+|[^\w\s]/y;

let match;
let index = 0;
while ((match = regex.exec(str)) !== null) {
  console.log(match[0]);
  index = regex.lastIndex;
  // 跳过空格
  while (str[index] === ' ') {
    regex.lastIndex = ++index;
  }
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码分析题  
**标签：** 正则性能

### 题目

以下哪个正则表达式可能导致灾难性回溯（Catastrophic Backtracking）？

**选项：**
- A. `/^[a-z]+$/`
- B. `/(a+)+b/`
- C. `/\d{3}-\d{4}/`
- D. `/hello|world/`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**灾难性回溯（Catastrophic Backtracking）**

**B 选项：`/(a+)+b/` 有严重性能问题**

```javascript
const regex = /(a+)+b/;

// 短字符串：正常
regex.test('aaab');  // true，很快

// 长字符串（无匹配）：非常慢！
regex.test('a'.repeat(20));  // 需要几秒
regex.test('a'.repeat(30));  // 可能挂起浏览器
```

**为什么会慢？**
```
对于输入 "aaaa"（无 b）：
引擎尝试所有可能的分组方式：
- (aaaa)
- (aaa)(a)
- (aa)(aa)
- (aa)(a)(a)
- (a)(aaa)
- (a)(aa)(a)
- (a)(a)(aa)
- (a)(a)(a)(a)
...
复杂度：O(2^n)
```

---

**识别危险模式**

**1. 嵌套量词**
```javascript
// ❌ 危险
/(a+)+/
/(a*)*/
/(a+)*/
/(\w+)+/

// 每个量词都会尝试不同的匹配长度
// 组合起来是指数级复杂度
```

**2. 交替 + 量词**
```javascript
// ❌ 危险
/(a|a)+b/
/(a|ab)+c/

// 多个路径 × 多次重复 = 指数爆炸
```

**3. 重叠的量词**
```javascript
// ❌ 危险
/.*.*=/
/.+.+:/

// 两个贪婪量词竞争匹配
```

---

**安全的替代方案**

**1. 使用占有量词（部分引擎支持）**
```javascript
// JavaScript 不直接支持，但可以用原子组模拟
/(?>a+)+b/  // 占有量词（不支持）

// 替代：明确匹配
/a+b/
```

**2. 使用非贪婪量词**
```javascript
// ❌ 危险
/(a+)+b/

// ✅ 安全
/a+?b/
```

**3. 限制重复次数**
```javascript
// ❌ 危险（无限重复）
/(a+)+/

// ✅ 安全（限制重复）
/(a+){1,5}/
/(a{1,10})+/
```

**4. 使用更精确的模式**
```javascript
// ❌ 危险
/.*@.*\.com/

// ✅ 安全
/[^@]+@[^.]+\.com/
```

---

**测试正则性能**

```javascript
function testRegexPerformance(regex, input) {
  const start = performance.now();
  try {
    regex.test(input);
    const end = performance.now();
    console.log(`Time: ${(end - start).toFixed(2)}ms`);
  } catch (e) {
    console.error('Timeout or error');
  }
}

// 测试
const dangerous = /(a+)+b/;
const safe = /a+b/;

testRegexPerformance(dangerous, 'a'.repeat(20));  // 很慢
testRegexPerformance(safe, 'a'.repeat(20));       // 很快
```

---

**实际案例**

**1. URL 验证（危险）**
```javascript
// ❌ 危险
/^(https?:\/\/)?([\w.-]+)+([\w\/.-]*)?$/

// ✅ 安全
/^https?:\/\/[\w.-]+[\w\/.-]*$/
```

**2. 邮箱验证（危险）**
```javascript
// ❌ 危险
/^[\w.]+@([\w-]+\.)+[\w-]+$/

// ✅ 安全
/^[\w.]+@[\w-]+\.[\w-]+$/
```

**3. HTML 标签匹配（危险）**
```javascript
// ❌ 危险
/<.*>.*<\/.*>/

// ✅ 安全
/<([a-z]+)>.*?<\/\1>/
```

---

**防护措施**

**1. 设置超时**
```javascript
function safeRegexTest(regex, str, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Regex timeout'));
    }, timeout);
    
    try {
      const result = regex.test(str);
      clearTimeout(timer);
      resolve(result);
    } catch (e) {
      clearTimeout(timer);
      reject(e);
    }
  });
}
```

**2. 使用安全的正则库**
```javascript
// safe-regex 库可以检测危险模式
import safeRegex from 'safe-regex';

const regex = /(a+)+b/;
console.log(safeRegex(regex));  // false（危险）
```

**3. 限制输入长度**
```javascript
function validate(input) {
  if (input.length > 1000) {
    throw new Error('Input too long');
  }
  return /pattern/.test(input);
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码输出题  
**标签：** Unicode

### 题目

以下代码的输出是什么？

```javascript
const str = '😀';

console.log(str.length);
console.log(str.charCodeAt(0));
console.log([...str].length);
console.log(str.codePointAt(0));
```

**选项：**
- A. `1`, `128512`, `1`, `128512`
- B. `2`, `55357`, `1`, `128512`
- C. `1`, `55357`, `2`, `128512`
- D. `2`, `128512`, `1`, `55357`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Unicode 和 UTF-16 编码**

```javascript
const str = '😀';  // U+1F600

// length：UTF-16 代码单元数量
console.log(str.length);  // 2（代理对，两个 16 位单元）

// charCodeAt(0)：第一个代码单元
console.log(str.charCodeAt(0));  // 55357（高代理）

// [...str]：展开为 Unicode 字符
console.log([...str].length);  // 1（一个字符）

// codePointAt(0)：完整的 Unicode 码点
console.log(str.codePointAt(0));  // 128512（U+1F600）
```

---

**UTF-16 代理对**

**基本多文种平面（BMP）：U+0000 到 U+FFFF**
```javascript
const str1 = 'A';  // U+0041
console.log(str1.length);          // 1
console.log(str1.charCodeAt(0));   // 65
console.log(str1.codePointAt(0));  // 65
```

**补充平面：U+10000 到 U+10FFFF（需要代理对）**
```javascript
const str2 = '😀';  // U+1F600（补充平面）

// 高代理（0xD800-0xDBFF）+ 低代理（0xDC00-0xDFFF）
console.log(str2.length);  // 2
console.log(str2.charCodeAt(0));  // 0xD83D（高代理）
console.log(str2.charCodeAt(1));  // 0xDE00（低代理）

// 完整码点
console.log(str2.codePointAt(0));  // 0x1F600
```

---

**正确处理 Unicode**

**1. 字符串长度**
```javascript
const str = 'A😀B';

// ❌ 错误：length 是代码单元数
console.log(str.length);  // 4（A=1, 😀=2, B=1）

// ✅ 正确：使用展开运算符
console.log([...str].length);  // 3

// ✅ 或使用 Array.from
console.log(Array.from(str).length);  // 3
```

**2. 字符串遍历**
```javascript
const str = 'A😀B';

// ❌ 错误：for 循环
for (let i = 0; i < str.length; i++) {
  console.log(str[i]);
}
// A, �, �, B（表情被拆分）

// ✅ 正确：for...of
for (const char of str) {
  console.log(char);
}
// A, 😀, B

// ✅ 或展开
[...str].forEach(char => console.log(char));
```

**3. 字符串截取**
```javascript
const str = '你好😀世界';

// ❌ 错误：slice 按代码单元
str.slice(0, 3);  // "你好�"（表情被截断）

// ✅ 正确：先转数组再截取
[...str].slice(0, 3).join('');  // "你好😀"
```

**4. 字符串反转**
```javascript
const str = 'A😀B';

// ❌ 错误
str.split('').reverse().join('');  // "B��A"（表情被拆分）

// ✅ 正确
[...str].reverse().join('');  // "B😀A"
```

---

**Unicode 正则表达式**

```javascript
const str = '😀😁😂';

// ❌ 错误：. 匹配一个代码单元
str.match(/./g);  // 6 个元素（每个表情 2 个）

// ✅ 正确：使用 u 标志
str.match(/./gu);  // 3 个元素

// ✅ 匹配任意表情
str.match(/\p{Emoji}/gu);  // ["😀", "😁", "😂"]

// ✅ 匹配中文
'Hello 世界'.match(/\p{Script=Han}/gu);  // ["世", "界"]
```

---

**String 方法对比**

| 方法 | 返回值 | 支持代理对 |
|------|--------|-----------|
| `length` | 代码单元数 | ❌ |
| `charAt(i)` | 代码单元 | ❌ |
| `charCodeAt(i)` | 代码单元值 | ❌ |
| `codePointAt(i)` | 完整码点 | ✅ |
| `[...str]` | 字符数组 | ✅ |
| `for...of` | 遍历字符 | ✅ |
| `/./gu` | 匹配字符 | ✅ |

---

**实际应用**

**1. 限制字符数（而非字节数）**
```javascript
function limitLength(str, maxLen) {
  const chars = [...str];
  if (chars.length > maxLen) {
    return chars.slice(0, maxLen).join('') + '...';
  }
  return str;
}

limitLength('Hello😀World', 7);  // "Hello😀..."
```

**2. 验证用户名（支持 Unicode）**
```javascript
function isValidUsername(name) {
  // 允许字母、数字、下划线、中文
  return /^[\p{L}\p{N}_]+$/u.test(name);
}

isValidUsername('用户123');  // true
isValidUsername('user_123');  // true
isValidUsername('😀');        // false
```

**3. 计算显示宽度**
```javascript
function displayWidth(str) {
  let width = 0;
  for (const char of str) {
    const code = char.codePointAt(0);
    // 中文、日文、韩文等占2个宽度
    if ((code >= 0x4E00 && code <= 0x9FFF) ||  // CJK
        (code >= 0x3040 && code <= 0x309F) ||  // 平假名
        (code >= 0x30A0 && code <= 0x30FF)) {  // 片假名
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

displayWidth('Hello世界');  // 9（5 + 2 + 2）
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 正则优化

### 题目

如何优化以下正则表达式的性能？

```javascript
// 匹配 HTML 标签
const regex = /<([^>]+)>.*<\/\1>/;
const html = '<div>' + 'x'.repeat(10000) + '</div>';
console.time('test');
regex.test(html);
console.timeEnd('test');  // 很慢
```

**选项：**
- A. 使用非贪婪量词 `/<([^>]+)>.*?<\/\1>/`
- B. 使用更精确的字符类 `/<([^>]+)>[^<]*<\/\1>/`
- C. 限制重复次数 `/<([^>]+)>.{0,1000}<\/\1>/`
- D. 以上都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**原正则的问题：贪婪量词导致回溯**

```javascript
const regex = /<([^>]+)>.*<\/\1>/;

// .* 贪婪匹配，会先吃掉所有字符
// 然后回溯尝试匹配 <\/\1>
// 对于长字符串，回溯次数非常多
```

---

**优化方案**

**A. 使用非贪婪量词（有效）**
```javascript
const regex = /<([^>]+)>.*?<\/\1>/;

// .*? 非贪婪，尽可能少匹配
// 减少回溯次数

console.time('test');
regex.test(html);
console.timeEnd('test');  // 更快
```

**B. 使用精确的字符类（最优）**
```javascript
const regex = /<([^>]+)>[^<]*<\/\1>/;

// [^<]* 不匹配 <，避免过度匹配
// 不需要回溯

console.time('test');
regex.test(html);
console.timeEnd('test');  // 最快
```

**C. 限制重复次数（可行）**
```javascript
const regex = /<([^>]+)>.{0,1000}<\/\1>/;

// 限制最大匹配长度
// 防止过度回溯

console.time('test');
regex.test(html);
console.timeEnd('test');  // 快（但可能不匹配长内容）
```

---

**正则优化通用原则**

**1. 使用精确的字符类**
```javascript
// ❌ 太宽泛
/.*@.*/

// ✅ 精确
/[^@]+@[^@]+/
```

**2. 避免嵌套量词**
```javascript
// ❌ 指数复杂度
/(a+)+/

// ✅ 简化
/a+/
```

**3. 使用非贪婪量词**
```javascript
// ❌ 贪婪回溯
/".*"/

// ✅ 非贪婪
/".*?"/

// ✅✅ 最优（使用否定字符类）
/"[^"]*"/
```

**4. 使用锚点限制搜索范围**
```javascript
// ❌ 搜索整个字符串
/\d{3}-\d{4}/

// ✅ 锚定位置
/^\d{3}-\d{4}$/
```

**5. 提取公共部分**
```javascript
// ❌ 重复模式
/https?:\/\/\w+|https?:\/\/[\w.]+/

// ✅ 提取公共部分
/https?:\/\/(\w+|[\w.]+)/

// ✅✅ 简化
/https?:\/\/[\w.]+/
```

---

**性能测试框架**

```javascript
function benchmarkRegex(regexes, input, iterations = 1000) {
  const results = [];
  
  for (const [name, regex] of Object.entries(regexes)) {
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      regex.test(input);
    }
    
    const end = performance.now();
    const time = end - start;
    
    results.push({ name, time });
  }
  
  return results.sort((a, b) => a.time - b.time);
}

// 使用
const results = benchmarkRegex({
  'greedy': /<([^>]+)>.*<\/\1>/,
  'non-greedy': /<([^>]+)>.*?<\/\1>/,
  'precise': /<([^>]+)>[^<]*<\/\1>/
}, html);

console.table(results);
```

---

**实际案例**

**1. 邮箱验证优化**
```javascript
// ❌ 慢（过度回溯）
/^[\w.+-]+@[\w.-]+\.[a-z]+$/i

// ✅ 快（精确字符类）
/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i
```

**2. URL 提取优化**
```javascript
// ❌ 慢
/https?:\/\/.*/

// ✅ 快
/https?:\/\/[^\s]+/

// ✅✅ 更快（精确结束条件）
/https?:\/\/[^\s<>"]+/
```

**3. HTML 清理优化**
```javascript
// ❌ 慢（贪婪 + 回溯）
/<script>.*<\/script>/g

// ✅ 快（非贪婪）
/<script>.*?<\/script>/g

// ✅✅ 最快（精确）
/<script>[^<]*<\/script>/g
```

---

**避免正则的情况**

某些场景下，字符串方法比正则更快：

```javascript
// 简单搜索
str.includes('hello')  // 比 /hello/.test(str) 快

// 前缀/后缀检查
str.startsWith('http')  // 比 /^http/.test(str) 快
str.endsWith('.jpg')    // 比 /\.jpg$/.test(str) 快

// 简单替换
str.replace('old', 'new')  // 比 /old/.replace(...) 快

// 分割
str.split(',')  // 比 /,/.split(...) 快
```

**何时使用正则：**
- 复杂模式匹配
- 需要捕获组
- 需要全局匹配
- 需要忽略大小写
- 字符串方法无法实现的场景

</details>

---

**本章总结：**
- ✅ 字符串不可变性
- ✅ 模板字符串特性
- ✅ includes/startsWith/endsWith
- ✅ 正则表达式 lastIndex
- ✅ replace/replaceAll 用法
- ✅ match/matchAll 差异
- ✅ 正则标志（g/i/m/s/u/y/d）
- ✅ 灾难性回溯
- ✅ Unicode 处理
- ✅ 正则性能优化

**下一章：** [第 8 章：内置对象与数据结构](./chapter-08.md)
