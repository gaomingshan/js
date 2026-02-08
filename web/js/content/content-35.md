# 模块化与工程实践

> 构建可维护的 JavaScript 项目

---

## 概述

模块化是现代 JavaScript 工程的基础。合理的模块划分和组织能够提高代码的可维护性、可测试性和可复用性。

本章将深入：
- 模块化设计原则
- 目录结构组织
- 依赖管理
- 代码分割策略
- 最佳实践

---

## 1. 模块化设计原则

### 1.1 单一职责

```javascript
// ❌ 一个模块做太多事
// user.js
export function createUser() {}
export function validateEmail() {}
export function sendEmail() {}
export function hashPassword() {}

// ✅ 职责分离
// user/create.js
export function createUser() {}

// validation/email.js
export function validateEmail() {}

// services/email.js
export function sendEmail() {}

// utils/crypto.js
export function hashPassword() {}
```

### 1.2 高内聚低耦合

```javascript
// ✅ 高内聚：相关功能放在一起
// cart/index.js
export class ShoppingCart {
  addItem(item) {}
  removeItem(itemId) {}
  calculateTotal() {}
  applyDiscount(code) {}
}

// ✅ 低耦合：最小化依赖
// order/create.js
import { ShoppingCart } from '../cart/index.js';

export function createOrder(cart) {
  // 只依赖必要的接口
  const total = cart.calculateTotal();
  return { total, items: cart.items };
}
```

### 1.3 接口隔离

```javascript
// ❌ 胖接口
export class UserService {
  createUser() {}
  deleteUser() {}
  sendEmail() {}
  generateReport() {}
  exportData() {}
}

// ✅ 接口分离
// services/user-crud.js
export class UserCRUD {
  create() {}
  read() {}
  update() {}
  delete() {}
}

// services/user-email.js
export class UserEmail {
  sendWelcome() {}
  sendReset() {}
}

// services/user-export.js
export class UserExport {
  generateReport() {}
  exportCSV() {}
}
```

---

## 2. 目录结构

### 2.1 按功能组织

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── cart/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── products/
│       ├── components/
│       ├── hooks/
│       └── services/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── config/
```

### 2.2 按类型组织

```
src/
├── components/
│   ├── common/
│   ├── layouts/
│   └── pages/
├── services/
│   ├── api.js
│   ├── auth.js
│   └── storage.js
├── hooks/
│   ├── useAuth.js
│   └── useFetch.js
├── utils/
│   ├── format.js
│   └── validate.js
└── config/
    └── constants.js
```

### 2.3 混合组织（推荐）

```
src/
├── features/           # 业务功能模块
│   ├── auth/
│   └── products/
├── components/         # 共享组件
│   ├── Button/
│   └── Modal/
├── services/          # 共享服务
│   ├── api.js
│   └── storage.js
├── hooks/             # 共享 Hooks
├── utils/             # 工具函数
├── types/             # TypeScript 类型
└── config/            # 配置文件
```

---

## 3. 模块导出模式

### 3.1 命名导出（推荐）

```javascript
// utils/format.js
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

export const DATE_FORMAT = 'YYYY-MM-DD';

// 使用
import { formatDate, formatCurrency } from './utils/format.js';
```

### 3.2 聚合导出

```javascript
// components/index.js
export { Button } from './Button/Button.js';
export { Input } from './Input/Input.js';
export { Modal } from './Modal/Modal.js';

// 或使用 export *
export * from './Button/Button.js';
export * from './Input/Input.js';

// 使用
import { Button, Input, Modal } from './components/index.js';
```

### 3.3 默认导出 + 命名导出

```javascript
// api/users.js
class UserAPI {
  getAll() {}
  getById(id) {}
  create(data) {}
}

export default UserAPI;

export const userAPI = new UserAPI();

// 使用
import UserAPI, { userAPI } from './api/users.js';
```

---

## 4. 依赖管理

### 4.1 循环依赖

```javascript
// ❌ 循环依赖
// a.js
import { b } from './b.js';
export const a = () => b();

// b.js
import { a } from './a.js';
export const b = () => a();

// ✅ 解决方案1：提取共同依赖
// common.js
export function shared() {}

// a.js
import { shared } from './common.js';
export const a = () => shared();

// b.js
import { shared } from './common.js';
export const b = () => shared();

// ✅ 解决方案2：依赖注入
// a.js
export const createA = (bFunc) => () => bFunc();

// b.js
export const createB = (aFunc) => () => aFunc();

// index.js
const a = createA(b);
const b = createB(a);
```

### 4.2 依赖倒置

```javascript
// ❌ 直接依赖具体实现
// order.js
import { MySQLDatabase } from './mysql.js';

export class OrderService {
  constructor() {
    this.db = new MySQLDatabase();
  }
}

// ✅ 依赖抽象接口
// order.js
export class OrderService {
  constructor(database) {
    this.db = database;  // 依赖注入
  }
  
  async create(order) {
    return this.db.insert('orders', order);
  }
}

// 使用
import { OrderService } from './order.js';
import { MySQLDatabase } from './mysql.js';

const db = new MySQLDatabase();
const orderService = new OrderService(db);
```

### 4.3 桶文件（Barrel）

```javascript
// features/auth/index.js
export { LoginForm } from './components/LoginForm.js';
export { RegisterForm } from './components/RegisterForm.js';
export { useAuth } from './hooks/useAuth.js';
export { authService } from './services/auth.js';

// 简化导入
import { LoginForm, useAuth, authService } from './features/auth/index.js';
```

---

## 5. 代码分割

### 5.1 路由级分割

```javascript
// router.js
const routes = [
  {
    path: '/home',
    component: () => import('./pages/Home.js')
  },
  {
    path: '/about',
    component: () => import('./pages/About.js')
  },
  {
    path: '/profile',
    component: () => import('./pages/Profile.js')
  }
];

// 每个路由独立打包，按需加载
```

### 5.2 组件级分割

```javascript
// Modal.js
export default function Modal({ isOpen, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      {children}
    </div>
  );
}

// App.js
import { lazy, Suspense } from 'react';

const Modal = lazy(() => import('./Modal.js'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Modal isOpen={showModal}>
        Content
      </Modal>
    </Suspense>
  );
}
```

### 5.3 库级分割

```javascript
// ❌ 导入整个库
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ 只导入需要的函数
import debounce from 'lodash/debounce';
debounce(fn, 300);

// 或使用树摇优化
import { debounce } from 'lodash-es';
```

---

## 6. 模块模式

### 6.1 单例模式

```javascript
// config.js
class Config {
  constructor() {
    if (Config.instance) {
      return Config.instance;
    }
    
    this.apiUrl = process.env.API_URL;
    this.debug = process.env.DEBUG === 'true';
    
    Config.instance = this;
  }
}

export const config = new Config();
```

### 6.2 工厂模式

```javascript
// logger-factory.js
export function createLogger(options = {}) {
  const { prefix = '', level = 'info' } = options;
  
  return {
    info(message) {
      if (level === 'info' || level === 'debug') {
        console.log(`[${prefix}] INFO:`, message);
      }
    },
    
    error(message) {
      console.error(`[${prefix}] ERROR:`, message);
    },
    
    debug(message) {
      if (level === 'debug') {
        console.log(`[${prefix}] DEBUG:`, message);
      }
    }
  };
}

// 使用
const logger = createLogger({ prefix: 'APP', level: 'debug' });
```

### 6.3 策略模式

```javascript
// validators.js
export const validators = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^\d{10}$/.test(value),
  required: (value) => value !== null && value !== undefined && value !== ''
};

// form-validator.js
export class FormValidator {
  constructor(schema) {
    this.schema = schema;
  }
  
  validate(data) {
    const errors = {};
    
    for (const [field, rules] of Object.entries(this.schema)) {
      for (const rule of rules) {
        if (!validators[rule](data[field])) {
          errors[field] = `${field} 验证失败: ${rule}`;
        }
      }
    }
    
    return { valid: Object.keys(errors).length === 0, errors };
  }
}
```

---

## 7. 最佳实践

### 7.1 明确的模块边界

```javascript
// ✅ 清晰的接口
// user-service.js
export class UserService {
  async getUser(id) {
    return this._fetch(`/users/${id}`);
  }
  
  async createUser(data) {
    return this._fetch('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  // 私有方法（约定）
  async _fetch(url, options) {
    const response = await fetch(url, options);
    return response.json();
  }
}
```

### 7.2 避免副作用

```javascript
// ❌ 模块导入时有副作用
// config.js
export const config = {
  apiUrl: process.env.API_URL
};

// 初始化副作用
initializeApp(config);  // 导入时就执行

// ✅ 显式初始化
// config.js
export const config = {
  apiUrl: process.env.API_URL
};

export function initialize() {
  initializeApp(config);
}

// main.js
import { config, initialize } from './config.js';
initialize();  // 显式调用
```

### 7.3 文档和类型

```javascript
/**
 * 创建用户
 * @param {Object} userData - 用户数据
 * @param {string} userData.name - 用户名
 * @param {string} userData.email - 邮箱
 * @returns {Promise<User>} 创建的用户对象
 */
export async function createUser(userData) {
  // 实现
}

// TypeScript
export interface User {
  id: number;
  name: string;
  email: string;
}

export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  // 实现
}
```

---

## 8. 性能优化

### 8.1 Tree Shaking

```javascript
// ✅ 支持 Tree Shaking
// utils.js
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }
export function multiply(a, b) { return a * b; }

// main.js
import { add } from './utils.js';  // 只打包 add

// ❌ 不支持 Tree Shaking
// utils.js
export default {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b
};

// main.js
import utils from './utils.js';  // 打包整个对象
utils.add(1, 2);
```

### 8.2 预加载

```javascript
// 预加载关键路由
const routes = [
  {
    path: '/dashboard',
    component: () => import(
      /* webpackPrefetch: true */
      './pages/Dashboard.js'
    )
  }
];

// Link 组件预加载
<Link to="/dashboard" onMouseEnter={() => {
  import('./pages/Dashboard.js');
}}>
  Dashboard
</Link>
```

---

## 关键要点

1. **设计原则**
   - 单一职责
   - 高内聚低耦合
   - 依赖倒置

2. **目录结构**
   - 按功能组织（大项目）
   - 按类型组织（小项目）
   - 混合组织（推荐）

3. **模块导出**
   - 优先命名导出
   - 使用聚合导出
   - 避免默认导出

4. **代码分割**
   - 路由级分割
   - 组件级分割
   - 按需加载

5. **最佳实践**
   - 明确边界
   - 避免副作用
   - 完善文档

---

## 参考资料

- [JavaScript Modules](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

**上一章**：[装饰器提案](./content-34.md)  
**下一章**：[代码规范与质量](./content-36.md)
