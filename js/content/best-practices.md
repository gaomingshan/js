# 最佳实践与代码规范

## 概述

遵循最佳实践和代码规范可以提高代码质量、可维护性和团队协作效率。

---

## 一、命名规范

### 1.1 变量和函数

```js
// ✅ 使用 camelCase
const userName = 'Alice';
function getUserInfo() {}

// ❌ 不推荐
const user_name = 'Alice';
const UserName = 'Alice';
```

### 1.2 类和构造函数

```js
// ✅ 使用 PascalCase
class UserManager {}
function Constructor() {}

// ❌ 不推荐
class userManager {}
```

### 1.3 常量

```js
// ✅ 使用 UPPER_SNAKE_CASE
const MAX_COUNT = 100;
const API_BASE_URL = 'https://api.example.com';

// ❌ 不推荐
const maxCount = 100;
```

### 1.4 私有字段

```js
// ✅ 使用 # 私有字段
class User {
  #password;
  
  constructor(password) {
    this.#password = password;
  }
}

// ✅ 或使用 _ 前缀（约定）
class User {
  constructor() {
    this._internal = 'internal';
  }
}
```

---

## 二、变量声明

### 2.1 优先使用 const 和 let

```js
// ✅ 推荐
const MAX = 100;
let count = 0;

// ❌ 避免使用 var
var x = 10;
```

### 2.2 一次声明一个变量

```js
// ✅ 推荐
const a = 1;
const b = 2;

// ❌ 不推荐
const a = 1, b = 2;
```

---

## 三、函数

### 3.1 使用箭头函数

```js
// ✅ 简短的函数使用箭头函数
const double = (x) => x * 2;

// ✅ 多行使用大括号
const process = (data) => {
  const result = transform(data);
  return result;
};

// ❌ 不必要的 function
const double = function(x) {
  return x * 2;
};
```

### 3.2 函数参数

```js
// ✅ 使用默认参数
function greet(name = 'Guest') {
  return `Hello, ${name}`;
}

// ✅ 使用解构
function getUserInfo({ name, age, email }) {
  return `${name}, ${age}, ${email}`;
}

// ❌ 参数过多
function createUser(name, age, email, phone, address, role) {}

// ✅ 使用对象
function createUser(options) {
  const { name, age, email, phone, address, role } = options;
}
```

---

## 四、字符串

### 4.1 使用模板字符串

```js
const name = 'Alice';
const age = 25;

// ✅ 推荐
const message = `Hello, ${name}! You are ${age} years old.`;

// ❌ 不推荐
const message = 'Hello, ' + name + '! You are ' + age + ' years old.';
```

### 4.2 多行字符串

```js
// ✅ 使用模板字符串
const html = `
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
`;

// ❌ 字符串拼接
const html = '<div>\n' +
  '  <h1>Title</h1>\n' +
  '  <p>Content</p>\n' +
  '</div>';
```

---

## 五、对象和数组

### 5.1 使用解构赋值

```js
// ✅ 对象解构
const { name, age } = user;

// ✅ 数组解构
const [first, second] = array;

// ✅ 函数参数解构
function render({ title, content }) {}

// ❌ 不必要的临时变量
const name = user.name;
const age = user.age;
```

### 5.2 使用扩展运算符

```js
// ✅ 数组复制
const copy = [...original];

// ✅ 数组合并
const merged = [...arr1, ...arr2];

// ✅ 对象复制
const copy = { ...original };

// ✅ 对象合并
const merged = { ...defaults, ...options };
```

### 5.3 使用简洁语法

```js
// ✅ 属性简写
const name = 'Alice';
const user = { name };

// ✅ 方法简写
const obj = {
  getValue() {
    return this.value;
  }
};

// ❌ 冗长写法
const user = { name: name };
const obj = {
  getValue: function() {
    return this.value;
  }
};
```

---

## 六、条件和循环

### 6.1 使用三元运算符

```js
// ✅ 简单条件
const status = isActive ? 'active' : 'inactive';

// ❌ 简单条件不需要 if-else
let status;
if (isActive) {
  status = 'active';
} else {
  status = 'inactive';
}
```

### 6.2 使用可选链和空值合并

```js
// ✅ 安全访问
const city = user?.profile?.address?.city;

// ✅ 默认值
const count = value ?? 0;

// ❌ 冗长的检查
const city = user && user.profile && user.profile.address && user.profile.address.city;
```

### 6.3 使用 for...of 和数组方法

```js
// ✅ for...of
for (const item of items) {
  console.log(item);
}

// ✅ 数组方法
const doubled = numbers.map(x => x * 2);
const evens = numbers.filter(x => x % 2 === 0);
const sum = numbers.reduce((a, b) => a + b, 0);

// ❌ 传统 for 循环（除非需要索引）
for (let i = 0; i < items.length; i++) {
  console.log(items[i]);
}
```

---

## 七、异步编程

### 7.1 使用 async/await

```js
// ✅ async/await
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

// ❌ Promise 链
function fetchData() {
  return fetch('/api/data')
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error(error));
}
```

### 7.2 错误处理

```js
// ✅ 始终处理错误
async function loadData() {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    throw error;
  }
}

// ❌ 忽略错误
async function loadData() {
  const data = await fetchData();
  return data;
}
```

---

## 八、模块化

### 8.1 使用 ES6 模块

```js
// ✅ 命名导出
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// ✅ 默认导出
export default class User {}

// ✅ 导入
import User from './User.js';
import { add, subtract } from './math.js';

// ❌ CommonJS（Node.js 除外）
const User = require('./User');
```

### 8.2 组织文件

```
src/
├── components/
│   ├── User.js
│   └── Profile.js
├── utils/
│   ├── math.js
│   └── string.js
└── index.js
```

---

## 九、代码风格

### 9.1 缩进和空格

```js
// ✅ 使用 2 或 4 个空格缩进
function example() {
  if (condition) {
    doSomething();
  }
}

// ✅ 运算符周围加空格
const sum = a + b;

// ✅ 逗号后加空格
const arr = [1, 2, 3];
```

### 9.2 分号

```js
// ✅ 始终使用分号
const x = 10;
const y = 20;

// ⚠️ 或完全不用（需要 ESLint 配置）
const x = 10
const y = 20
```

### 9.3 引号

```js
// ✅ 统一使用单引号或双引号
const str = 'Hello';
const str2 = "World";

// ✅ 模板字符串用反引号
const message = `Hello, ${name}`;
```

---

## 十、工具配置

### 10.1 ESLint

```js
// .eslintrc.js
module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error'
  }
};
```

### 10.2 Prettier

```js
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## 参考资料

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
