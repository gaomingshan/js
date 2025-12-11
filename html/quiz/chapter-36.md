# 第 36 章：最佳实践 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 代码规范
### 题目
代码规范工具？**（多选）**

**A.** ESLint | **B.** Prettier | **C.** Stylelint | **D.** HTMLHint

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D
**来源：** 代码规范工具
</details>

---

## 第 2 题 🟢 | Git 规范
### 题目
Git Commit 规范？

<details><summary>查看答案</summary>
### ✅ 答案
```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型：**
- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建

**示例：**
```
feat(auth): add login functionality

- Add login form component
- Implement JWT authentication
- Add login API endpoint

Closes #123
```
**来源：** Conventional Commits
</details>

---

## 第 3 题 🟢 | 文档
### 题目
项目文档包含什么？**（多选）**

**A.** README | **B.** API 文档 | **C.** 开发指南 | **D.** 部署文档

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D
**来源：** 项目文档
</details>

---

## 第 4 题 🟡 | 项目结构
### 题目
合理的项目结构？

<details><summary>查看答案</summary>
### ✅ 答案
```
project/
├── src/
│   ├── components/    # 组件
│   ├── pages/         # 页面
│   ├── utils/         # 工具
│   ├── services/      # API
│   ├── styles/        # 样式
│   ├── assets/        # 资源
│   └── index.js       # 入口
├── public/            # 静态文件
├── tests/             # 测试
├── docs/              # 文档
├── .env.example       # 环境变量示例
├── .eslintrc.js       # ESLint 配置
├── .prettierrc        # Prettier 配置
├── .gitignore
├── package.json
└── README.md
```
**来源：** 项目结构
</details>

---

## 第 5 题 🟡 | 命名规范
### 题目
命名约定？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 变量：camelCase
const userName = 'John';
const isActive = true;

// 常量：UPPER_SNAKE_CASE
const MAX_COUNT = 100;
const API_BASE_URL = 'https://api.example.com';

// 类：PascalCase
class UserService {}
class ApiClient {}

// 文件：kebab-case
// user-profile.js
// api-client.js

// 组件：PascalCase
// UserProfile.jsx
// LoginForm.jsx

// CSS 类：kebab-case
.user-profile {}
.login-form {}

// BEM 命名
.block {}
.block__element {}
.block--modifier {}
```
**来源：** 命名规范
</details>

---

## 第 6 题 🟡 | 性能最佳实践
### 题目
性能优化清单？**（多选）**

**A.** 代码分割 | **B.** 懒加载 | **C.** 缓存 | **D.** 压缩

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D

**完整清单：**
1. 资源优化
2. 代码分割
3. 懒加载
4. 缓存策略
5. 压缩
6. CDN
7. 预加载
8. Web Vitals

**来源：** 性能优化
</details>

---

## 第 7 题 🟡 | 安全清单
### 题目
前端安全检查项？**（多选）**

**A.** XSS 防护 | **B.** CSRF Token | **C.** HTTPS | **D.** CSP

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D

**安全清单：**
- XSS：转义输出
- CSRF：Token 验证
- HTTPS：加密传输
- CSP：内容安全策略
- SameSite Cookie
- 输入验证
- 依赖安全扫描

**来源：** Web 安全
</details>

---

## 第 8 题 🔴 | CI/CD
### 题目
配置完整的 CI/CD 流程。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
  
  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: dist
      - name: Deploy to Production
        run: |
          # 部署到服务器
          echo "Deploying..."
```
**来源：** GitHub Actions
</details>

---

## 第 9 题 🔴 | 代码审查
### 题目
代码审查要点？

<details><summary>查看答案</summary>
### ✅ 答案

**审查清单：**

**1. 功能**
- 是否实现需求
- 是否有 bug
- 边界情况处理

**2. 代码质量**
- 可读性
- 命名规范
- 注释充分
- 无重复代码

**3. 性能**
- 算法效率
- 不必要的渲染
- 内存泄漏

**4. 安全**
- XSS/CSRF 防护
- 输入验证
- 敏感信息

**5. 测试**
- 单元测试覆盖
- 测试用例充分
- 测试可维护

**6. 架构**
- 符合设计模式
- 模块化
- 可扩展性

**来源：** Code Review
</details>

---

## 第 10 题 🔴 | 完整项目模板
### 题目
创建生产级项目模板。

<details><summary>查看答案</summary>
### ✅ 答案

**package.json：**
```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .js,.jsx",
    "lint:fix": "eslint src --ext .js,.jsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\"",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "prepare": "husky install"
  },
  "dependencies": {},
  "devDependencies": {
    "vite": "^4.0.0",
    "eslint": "^8.0.0",
    "prettier": "^2.8.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0",
    "vitest": "^0.30.0",
    "@vitest/ui": "^0.30.0"
  }
}
```

**.eslintrc.js：**
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
};
```

**.prettierrc：**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**.husky/pre-commit：**
```bash
#!/bin/sh
npm run lint
npm run test
```

**.gitignore：**
```
node_modules/
dist/
.env.local
coverage/
*.log
```

**README.md：**
```markdown
# 项目名称

## 简介
项目描述

## 技术栈
- Vite
- React
- ESLint
- Prettier

## 开发
npm install
npm run dev

## 构建
npm run build

## 测试
npm test

## 部署
详见 docs/deployment.md
```

**来源：** 项目模板最佳实践
</details>

---

**📌 本章总结**
- 代码规范：ESLint, Prettier, 命名约定
- Git 规范：Conventional Commits
- 项目结构：模块化、清晰的目录
- 文档：README, API, 开发指南
- 性能：优化清单
- 安全：防护清单
- CI/CD：自动化流程
- 代码审查：质量保证
- 项目模板：生产级配置

**上一章** ← [第 35 章：测试](./chapter-35.md)  
**完成** → 所有36章已完成！🎉
