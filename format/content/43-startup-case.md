# 第 43 章：初创团队渐进方案

## 概述

初创团队资源有限、迭代快速，代码规范需要平衡规范性和开发效率。本章介绍适合小团队的轻量级规范实施方案。

## 一、初创团队特点

### 1.1 常见挑战

| 挑战 | 影响 |
|------|------|
| 人员少 | 难以投入专人维护规范 |
| 迭代快 | 规范可能阻碍开发速度 |
| 技术栈多变 | 规范需要灵活调整 |
| 经验参差 | 规范执行难度大 |

### 1.2 实施原则

```
1. 简单优先 - 使用成熟的预设配置
2. 自动化 - 减少人工检查
3. 渐进式 - 逐步增加规则
4. 务实 - 聚焦最重要的规则
```

## 二、最小化配置

### 2.1 快速启动（5分钟）

```bash
# 一键安装
npm install -D eslint prettier eslint-config-prettier husky lint-staged
```

```javascript
// .eslintrc.js - 最简配置
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  env: { browser: true, es2021: true, node: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
};
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true
}
```

### 2.2 Git Hooks

```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

```bash
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

## 三、分阶段实施

### 3.1 第一阶段：基础（第1-2周）

**目标**：自动格式化 + 基础检查

```javascript
// 仅启用关键规则
rules: {
  'no-debugger': 'error',
  'no-unused-vars': 'warn',
  'no-console': 'warn'
}
```

**团队行动**：
- 安装 VS Code 扩展
- 启用保存时格式化
- 配置 Git Hooks

### 3.2 第二阶段：规范化（第3-4周）

**目标**：统一代码风格

```javascript
// 添加风格规则
rules: {
  'prefer-const': 'error',
  'no-var': 'error',
  'eqeqeq': 'error'
}
```

**团队行动**：
- 运行一次全量修复
- 建立简单的规范文档

### 3.3 第三阶段：专业化（第2个月）

**目标**：引入框架规则

```javascript
// React 项目
extends: [
  'eslint:recommended',
  'plugin:react/recommended',
  'plugin:react-hooks/recommended',
  'prettier'
]
```

**团队行动**：
- 添加框架特定规则
- 引入 TypeScript（如适用）

## 四、推荐配置

### 4.1 React 项目快速配置

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off'
  }
};
```

### 4.2 Vue 项目快速配置

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  rules: {
    'vue/multi-word-component-names': 'off'
  }
};
```

## 五、效率优化

### 5.1 只检查变更文件

```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": "eslint --fix"
  }
}
```

### 5.2 使用缓存

```json
{
  "scripts": {
    "lint": "eslint --cache src/"
  }
}
```

### 5.3 跳过检查（紧急情况）

```bash
git commit --no-verify -m "hotfix: urgent fix"
```

## 六、团队协作

### 6.1 简单的规范文档

```markdown
# 代码规范（简版）

## 工具
- ESLint + Prettier（保存时自动格式化）

## 命名
- 变量/函数：camelCase
- 组件：PascalCase
- 常量：UPPER_SNAKE_CASE

## 提交
- 提交前自动检查
- 格式：`type: message`
```

### 6.2 入职指南

```markdown
# 新成员指南

1. 安装 VS Code 扩展：ESLint、Prettier
2. 克隆项目后运行 `npm install`
3. 测试：创建文件，保存，确认自动格式化
4. 阅读 README.md 了解项目
```

## 七、常见问题处理

### 7.1 规则冲突

```javascript
// 优先使用 Prettier，关闭 ESLint 格式规则
extends: [..., 'prettier']  // prettier 放最后
```

### 7.2 旧代码过多警告

```javascript
// 暂时降级为警告
rules: {
  'no-unused-vars': 'warn'  // 而非 error
}
```

### 7.3 特殊文件处理

```javascript
overrides: [
  {
    files: ['*.config.js'],
    env: { node: true }
  }
]
```

## 八、成本效益

| 投入 | 收益 |
|------|------|
| 初始配置 2小时 | 减少格式讨论 |
| 每人学习 30分钟 | 代码风格统一 |
| 每次提交多几秒 | 避免低级错误 |

## 九、成功指标

| 指标 | 目标 |
|------|------|
| lint 通过率 | > 95% |
| 格式化覆盖 | 100% |
| 团队满意度 | 无明显抱怨 |

## 十、进阶路径

```
初始 → 基础格式化
  ↓
3个月 → 完整 ESLint 规则
  ↓
6个月 → TypeScript 严格模式
  ↓
1年 → 完整规范体系
```

## 参考资料

- [ESLint Getting Started](https://eslint.org/docs/user-guide/getting-started)
- [Prettier Installation](https://prettier.io/docs/en/install.html)
