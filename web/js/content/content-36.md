# 代码规范与质量

> 编写高质量、可维护的 JavaScript 代码

---

## 概述

代码规范和质量控制是团队协作的基础。统一的代码风格、严格的质量检查能够减少 bug，提高代码可读性和可维护性。

本章将深入：
- 命名规范
- 代码风格
- ESLint 配置
- 代码审查
- 最佳实践

---

## 1. 命名规范

### 1.1 变量和函数

```javascript
// ✅ 使用驼峰命名
const userName = 'Alice';
function getUserInfo() {}

// ✅ 常量使用大写下划线
const API_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;

// ✅ 私有变量使用下划线前缀
class User {
  constructor() {
    this._privateData = {};
  }
}

// ✅ 布尔值使用 is/has/can 前缀
const isActive = true;
const hasPermission = false;
const canEdit = true;

// ✅ 函数名使用动词
function fetchData() {}
function calculateTotal() {}
function validateEmail() {}

// ❌ 避免单字母变量（除循环）
const d = new Date();  // ❌
const currentDate = new Date();  // ✅

// ❌ 避免无意义的命名
const data = {};  // ❌
const userData = {};  // ✅
```

### 1.2 类和构造函数

```javascript
// ✅ 类名使用 PascalCase
class UserService {}
class ShoppingCart {}

// ✅ 接口使用 I 前缀（TypeScript）
interface IUserRepository {}

// ✅ 抽象类使用 Abstract 前缀
abstract class AbstractValidator {}

// ✅ 事件处理函数使用 handle 前缀
function handleClick() {}
function handleSubmit() {}
```

### 1.3 文件命名

```javascript
// ✅ 组件文件使用 PascalCase
UserProfile.jsx
ShoppingCart.vue

// ✅ 工具函数使用 kebab-case 或 camelCase
format-date.js
formatDate.js

// ✅ 常量文件
constants.js
config.js

// ✅ 类型文件
types.ts
interfaces.ts
```

---

## 2. 代码风格

### 2.1 缩进和空格

```javascript
// ✅ 使用 2 或 4 空格缩进（统一即可）
function example() {
  if (condition) {
    doSomething();
  }
}

// ✅ 操作符两侧加空格
const sum = a + b;
const result = condition ? value1 : value2;

// ✅ 逗号后加空格
const arr = [1, 2, 3];
const obj = { a: 1, b: 2 };

// ✅ 块级作用域空行
function example() {
  const a = 1;
  const b = 2;
  
  if (a > b) {
    return a;
  }
  
  return b;
}
```

### 2.2 引号和分号

```javascript
// ✅ 统一使用单引号或双引号
const name = 'Alice';  // 或
const name = "Alice";

// ✅ 模板字符串
const greeting = `Hello, ${name}!`;

// ✅ 分号（推荐）
const a = 1;
const b = 2;

// 或不使用分号（需要理解 ASI 规则）
const a = 1
const b = 2
```

### 2.3 对象和数组

```javascript
// ✅ 对象属性简写
const name = 'Alice';
const age = 25;

const user = { name, age };  // ✅
const user = { name: name, age: age };  // ❌

// ✅ 解构赋值
const { name, age } = user;
const [first, second] = array;

// ✅ 剩余参数
const { id, ...rest } = user;
const [first, ...others] = array;

// ✅ 对象方法简写
const obj = {
  method() {}  // ✅
};

const obj = {
  method: function() {}  // ❌
};
```

### 2.4 函数

```javascript
// ✅ 箭头函数（简洁）
const add = (a, b) => a + b;
const square = x => x * x;

// ✅ 参数默认值
function greet(name = 'Guest') {
  return `Hello, ${name}`;
}

// ✅ 剩余参数代替 arguments
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

// ❌ 避免使用 arguments
function sum() {
  return Array.from(arguments).reduce((a, b) => a + b, 0);
}
```

---

## 3. ESLint 配置

### 3.1 基础配置

```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'  // React 项目
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

### 3.2 Prettier 集成

```javascript
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 80,
  "arrowParens": "avoid"
}

// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended'  // Prettier 集成
  ]
};
```

### 3.3 自定义规则

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // 强制使用 === 和 !==
    'eqeqeq': ['error', 'always'],
    
    // 禁止使用 var
    'no-var': 'error',
    
    // 优先使用 const
    'prefer-const': 'error',
    
    // 禁止未使用的变量
    'no-unused-vars': ['error', {
      vars: 'all',
      args: 'after-used',
      ignoreRestSiblings: true
    }],
    
    // 强制箭头函数的箭头前后有空格
    'arrow-spacing': ['error', {
      before: true,
      after: true
    }],
    
    // 禁止在 return 语句中赋值
    'no-return-assign': 'error',
    
    // 要求使用模板字面量而非字符串连接
    'prefer-template': 'error',
    
    // 强制对象字面量属性名称使用引号
    'quote-props': ['error', 'as-needed']
  }
};
```

---

## 4. 代码质量检查

### 4.1 复杂度控制

```javascript
// ❌ 高复杂度
function processUser(user) {
  if (user.age > 18) {
    if (user.hasPermission) {
      if (user.isActive) {
        if (user.credits > 0) {
          return 'approved';
        }
      }
    }
  }
  return 'rejected';
}

// ✅ 降低复杂度
function processUser(user) {
  // 提前返回
  if (user.age <= 18) return 'rejected';
  if (!user.hasPermission) return 'rejected';
  if (!user.isActive) return 'rejected';
  if (user.credits <= 0) return 'rejected';
  
  return 'approved';
}

// ✅ 提取函数
function isEligible(user) {
  return user.age > 18 &&
         user.hasPermission &&
         user.isActive &&
         user.credits > 0;
}

function processUser(user) {
  return isEligible(user) ? 'approved' : 'rejected';
}
```

### 4.2 函数长度

```javascript
// ❌ 过长的函数
function processOrder(order) {
  // 验证订单
  if (!order.items || order.items.length === 0) {
    throw new Error('订单为空');
  }
  
  // 计算总价
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }
  
  // 应用折扣
  if (order.coupon) {
    total *= (1 - order.coupon.discount);
  }
  
  // 计算税费
  const tax = total * 0.1;
  total += tax;
  
  // 创建订单记录
  // ... 更多代码
}

// ✅ 拆分为小函数
function validateOrder(order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('订单为空');
  }
}

function calculateTotal(items) {
  return items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
}

function applyDiscount(total, coupon) {
  return coupon ? total * (1 - coupon.discount) : total;
}

function calculateTax(total) {
  return total * 0.1;
}

function processOrder(order) {
  validateOrder(order);
  
  let total = calculateTotal(order.items);
  total = applyDiscount(total, order.coupon);
  total += calculateTax(total);
  
  return createOrderRecord(order, total);
}
```

---

## 5. 注释规范

### 5.1 JSDoc

```javascript
/**
 * 计算两个数的和
 * @param {number} a - 第一个数
 * @param {number} b - 第二个数
 * @returns {number} 两数之和
 * @example
 * add(1, 2); // 3
 */
function add(a, b) {
  return a + b;
}

/**
 * 用户类
 * @class
 */
class User {
  /**
   * 创建用户实例
   * @param {string} name - 用户名
   * @param {number} age - 年龄
   */
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  /**
   * 获取用户信息
   * @returns {Object} 用户信息对象
   */
  getInfo() {
    return {
      name: this.name,
      age: this.age
    };
  }
}
```

### 5.2 TODO 注释

```javascript
// TODO: 添加错误处理
// FIXME: 修复边界情况
// HACK: 临时解决方案，需要重构
// NOTE: 重要说明

function processData(data) {
  // TODO: 添加数据验证
  
  // FIXME: 处理空数组情况
  return data.map(item => item.value);
}
```

---

## 6. 代码审查

### 6.1 审查清单

```
功能性：
□ 代码是否实现了需求
□ 边界情况是否处理
□ 错误处理是否完善

可读性：
□ 命名是否清晰
□ 逻辑是否易懂
□ 注释是否充分

性能：
□ 是否有性能问题
□ 是否有内存泄漏
□ 算法是否高效

安全性：
□ 是否有安全漏洞
□ 输入是否验证
□ 敏感信息是否保护

可维护性：
□ 是否遵循代码规范
□ 是否有重复代码
□ 是否易于测试
```

### 6.2 常见问题

```javascript
// ❌ 魔法数字
if (user.age > 18) {}

// ✅ 使用常量
const ADULT_AGE = 18;
if (user.age > ADULT_AGE) {}

// ❌ 嵌套过深
if (a) {
  if (b) {
    if (c) {
      // ...
    }
  }
}

// ✅ 提前返回
if (!a) return;
if (!b) return;
if (!c) return;

// ❌ 重复代码
function getUserName() {
  return user.firstName + ' ' + user.lastName;
}

function getAuthorName() {
  return author.firstName + ' ' + author.lastName;
}

// ✅ 提取公共函数
function getFullName(person) {
  return `${person.firstName} ${person.lastName}`;
}
```

---

## 7. 测试规范

### 7.1 单元测试

```javascript
// sum.test.js
import { sum } from './sum';

describe('sum', () => {
  it('should add two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
  
  it('should handle negative numbers', () => {
    expect(sum(-1, -2)).toBe(-3);
  });
  
  it('should handle zero', () => {
    expect(sum(0, 5)).toBe(5);
  });
});
```

### 7.2 测试覆盖率

```javascript
// package.json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

---

## 关键要点

1. **命名规范**
   - 驼峰命名
   - 常量大写
   - 布尔值前缀
   - 有意义的命名

2. **代码风格**
   - 统一缩进
   - 统一引号
   - 简洁语法
   - 合理空行

3. **ESLint**
   - 配置规则
   - Prettier 集成
   - 自动修复

4. **代码质量**
   - 降低复杂度
   - 函数拆分
   - 避免重复

5. **代码审查**
   - 审查清单
   - 持续改进
   - 知识共享

---

## 参考资料

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

**上一章**：[模块化与工程实践](./content-35.md)  
**下一章**：[性能优化实践](./content-37.md)
