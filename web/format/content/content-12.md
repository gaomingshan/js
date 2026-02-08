# 全栈项目与跨团队协作

## 概述

全栈项目需要统一前后端规范，跨团队协作需要解决规范冲突。理解跨栈协作的核心在于掌握规范统一策略、类型共享机制、跨团队协作模式。

**核心认知**：
- 前后端规范需要统一核心原则，同时允许技术栈差异
- TypeScript + OpenAPI 实现类型共享，减少联调成本
- 组织级规范是跨团队协作的基础

**后端类比**：
- 前后端规范统一 ≈ 微服务接口规范
- 类型共享 ≈ API 契约管理
- 跨团队协作 ≈ 服务网格治理

---

## 前后端分离项目的规范统一

### 前端规范 vs 后端规范的差异

**差异对比**：

| 维度 | 前端规范 | 后端规范 | 差异原因 |
|------|---------|---------|---------|
| 类型系统 | TypeScript（可选） | Java/Go（强制） | JavaScript 是弱类型 |
| 代码格式 | Prettier | gofmt/Google Java | 工具不同 |
| 命名规范 | camelCase | camelCase/snake_case | 语言习惯 |
| 文件组织 | 按组件 | 按层级 | 架构模式 |
| 异步处理 | Promise/async-await | Future/CompletableFuture | 语言特性 |

**核心原则统一**：
```
1. 代码可读性
2. 可维护性
3. 团队协作效率
4. 技术债控制
```

**工具差异允许**：
```
前端：ESLint + Prettier + TypeScript
后端：Checkstyle + gofmt + 编译器
```

---

### 接口契约与类型共享

**问题场景**：
```typescript
// 前端定义
interface User {
  name: string;
  age: number;
}

// 后端定义
class User {
  String name;
  Integer age;
}

// 不一致风险：
// 1. 字段名拼写不同
// 2. 类型不匹配
// 3. 字段新增/删除不同步
```

---

### 解决方案 1：OpenAPI（Swagger）

**后端定义 API**：
```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

paths:
  /api/users/{id}:
    get:
      summary: 获取用户信息
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: integer
        name:
          type: string
        age:
          type: integer
```

---

**前端生成类型**：
```bash
# 使用 openapi-typescript 生成 TypeScript 类型
npx openapi-typescript openapi.yaml --output types/api.ts
```

**生成的类型**：
```typescript
// types/api.ts
export interface User {
  id: number;
  name: string;
  age?: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}
```

**使用**：
```typescript
import { User } from './types/api';

async function getUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

**优势**：
- 类型自动同步
- 减少联调错误
- 接口文档自动生成

**后端类比**：Protocol Buffers 的类型定义。

---

### 解决方案 2：共享 TypeScript 类型

**Monorepo 结构**：
```
monorepo/
  ├── packages/
  │   ├── types/          # 共享类型包
  │   │   ├── user.ts
  │   │   └── product.ts
  │   ├── frontend/       # 前端项目
  │   └── backend/        # Node.js 后端
  └── package.json
```

**共享类型定义**：
```typescript
// packages/types/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}
```

**前端使用**：
```typescript
import { User, CreateUserRequest } from '@company/types';

async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}
```

**后端使用**（Node.js + TypeScript）：
```typescript
import { User, CreateUserRequest } from '@company/types';

async function createUser(req: CreateUserRequest): Promise<User> {
  // 类型安全
  const user = await db.users.create(req);
  return user;
}
```

**优势**：
- 类型定义唯一来源
- 前后端类型一致
- 重构安全

---

## Node.js 项目的规范

### 前端规范在 Node.js 中的适用性

**适用的规则**：
```json
{
  "extends": ["eslint:recommended", "prettier"],
  "rules": {
    "no-unused-vars": "error",
    "eqeqeq": "error",
    "no-var": "error"
  }
}
```

**不适用的规则**：
```json
{
  "rules": {
    // 浏览器特定规则（不适用）
    "no-alert": "off",
    "no-console": "off",  // 服务端需要日志
    
    // React 规则（不适用）
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "off"
  }
}
```

---

### 服务端代码的特殊规范

**Node.js 特定规则**：
```json
{
  "extends": ["plugin:node/recommended"],
  "rules": {
    "node/no-unsupported-features/es-syntax": ["error", {
      "version": ">=16.0.0"
    }],
    "node/no-missing-import": "error",
    "node/no-unpublished-import": "error",
    "node/process-exit-as-throw": "error"
  }
}
```

**示例**：
```javascript
// ❌ node/no-unsupported-features/es-syntax
// Node.js 12 不支持 top-level await
await someAsyncFunction();

// ✅ Node.js 16+ 支持
await someAsyncFunction();

// ❌ node/no-missing-import
const missing = require('missing-package');

// ✅
const express = require('express');  // 已安装
```

---

### 安全规则

**eslint-plugin-security**：
```json
{
  "extends": ["plugin:security/recommended"],
  "rules": {
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "error",
    "security/detect-eval-with-expression": "error"
  }
}
```

**示例**：
```javascript
// ❌ security/detect-eval-with-expression
const code = getUserInput();
eval(code);  // 安全风险

// ✅ 使用 JSON.parse
const data = JSON.parse(getUserInput());

// ❌ security/detect-object-injection
const obj = {};
obj[userInput] = value;  // 可能的原型污染

// ✅ 使用 Map
const map = new Map();
map.set(userInput, value);
```

**后端类比**：SQL 注入防护规则。

---

## Monorepo 全栈规范管理

### 目录结构

```
monorepo/
  ├── .eslintrc.json          # 根配置（通用规则）
  ├── packages/
  │   ├── types/              # 共享类型
  │   ├── web/                # 前端（React）
  │   │   └── .eslintrc.json  # 继承根配置 + React
  │   ├── mobile/             # 移动端（React Native）
  │   │   └── .eslintrc.json  # 继承根配置 + RN
  │   ├── api/                # 后端（Node.js）
  │   │   └── .eslintrc.json  # 继承根配置 + Node
  │   └── admin/              # 管理后台（Vue）
  │       └── .eslintrc.json  # 继承根配置 + Vue
  └── package.json
```

---

### 根配置（通用规则）

```json
// .eslintrc.json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "env": {
    "es2021": true
  },
  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "eqeqeq": "error",
    "no-var": "error"
  }
}
```

---

### 前端配置（packages/web/.eslintrc.json）

```json
{
  "extends": [
    "../../.eslintrc.json",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "env": {
    "browser": true
  },
  "rules": {
    "no-console": "warn",
    "react/prop-types": "off"
  }
}
```

---

### 后端配置（packages/api/.eslintrc.json）

```json
{
  "extends": [
    "../../.eslintrc.json",
    "plugin:node/recommended"
  ],
  "env": {
    "node": true
  },
  "rules": {
    "no-console": "off",  // 服务端允许 console
    "node/no-unsupported-features/es-syntax": ["error", {
      "version": ">=16.0.0"
    }]
  }
}
```

---

## 跨团队规范协作

### 不同团队规范的冲突

**场景**：
```
组织内有 3 个团队：
- 前端团队：使用 Airbnb 规范
- 后端团队：使用 Google Java 规范
- 移动端团队：使用 StandardJS
```

**问题**：
1. 规范不统一，协作困难
2. 跨团队Code Review 标准不一致
3. 人员流动成本高

---

### 规范的协商与妥协

**协商流程**：
```
1. 识别冲突点
   - 单引号 vs 双引号
   - 分号 vs 无分号
   - 缩进（2 空格 vs 4 空格）

2. 评估影响
   - 技术影响：无差异
   - 习惯影响：团队偏好不同

3. 协商策略
   - 优先：技术标准（有技术依据的优先）
   - 次选：行业标准（Airbnb、Google）
   - 最后：投票表决（少数服从多数）

4. 达成共识
   - 统一核心规则
   - 允许技术栈差异
```

**示例**：
```
冲突：单引号 vs 双引号

技术评估：
- 功能无差异
- 性能无差异
- 可读性主观

解决方案：
- 交给 Prettier 决定（默认单引号）
- 全组织统一使用
```

---

### 组织级规范的制定

**组织架构**：
```
@company/eslint-config          # 组织级（核心规则）
  ├── @company/eslint-config-web       # 前端团队
  ├── @company/eslint-config-node      # 后端团队
  └── @company/eslint-config-mobile    # 移动端团队
```

**组织级规范（核心规则）**：
```javascript
// @company/eslint-config/index.js
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'no-unused-vars': 'error',
    'eqeqeq': 'error',
    'no-var': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

**团队扩展（技术栈特定规则）**：
```javascript
// @company/eslint-config-web/index.js
module.exports = {
  extends: [
    '@company/eslint-config',
    'plugin:react/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    'react/prop-types': 'off'
  }
};
```

---

### 规范治理委员会

**组织结构**：
```
规范治理委员会
  ├── 前端代表（2 人）
  ├── 后端代表（2 人）
  ├── 移动端代表（1 人）
  └── 技术委员会（1 人）
```

**职责**：
1. 制定组织级规范
2. 审核团队级规范
3. 处理规范冲突
4. 推动规范演进

**决策机制**：
```
1. 提案（任何人可提出）
2. 讨论（委员会评审）
3. 投票（2/3 多数通过）
4. 执行（全组织推广）
```

**后端类比**：技术委员会的治理模式。

---

## 深入一点：跨栈协作的文化建设

### 打破部门墙

**问题**：
```
前端团队：后端接口不规范
后端团队：前端不懂性能优化
→ 相互指责，协作困难
```

**解决方案**：
```
1. 建立共同语言
   - 统一术语（API、接口、契约）
   - 统一流程（Code Review、发布）

2. 跨团队 Code Review
   - 前端 Review 后端代码
   - 后端 Review 前端代码
   - 相互学习

3. 技术分享
   - 前端分享：浏览器渲染原理
   - 后端分享：数据库优化
   - 全栈视角

4. 共同目标
   - 用户体验
   - 系统性能
   - 代码质量
```

---

## 工程实践案例

### 案例：某公司的全栈规范统一

**背景**：
- 5 个团队，各用各的规范
- 跨团队协作困难
- 规范维护成本高

**改进方案**：

**阶段 1：建立组织级规范（Month 1-2）**
```
1. 成立规范治理委员会
2. 制定核心规则（80%）
3. 发布 @company/eslint-config
```

**阶段 2：团队扩展规范（Month 3-4）**
```
1. 各团队扩展技术栈规则（20%）
2. 发布团队级配置包
3. 试点运行
```

**阶段 3：全面推广（Month 5-6）**
```
1. 所有项目统一规范
2. CI 强制验证
3. 持续优化
```

**效果**：
```
规范统一性：40% → 90%
跨团队 Code Review 时间：-50%
人员流动成本：-40%
团队满意度：60% → 85%
```

---

## 参考资料

- [OpenAPI Specification](https://swagger.io/specification/)
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [eslint-plugin-node](https://github.com/mysticatea/eslint-plugin-node)
- [eslint-plugin-security](https://github.com/nodesecurity/eslint-plugin-security)
- [Monorepo Tools](https://monorepo.tools/)
