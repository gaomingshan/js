# 第 31 章：Monorepo 规范策略

## 概述

Monorepo 将多个项目或包存放在同一个代码仓库中，带来代码共享和统一管理的便利，但也增加了规范配置的复杂性。本章介绍如何在 Monorepo 中构建统一而灵活的代码规范体系。

## 一、Monorepo 规范挑战

### 1.1 常见问题

| 挑战 | 说明 |
|------|------|
| 配置分散 | 每个包独立配置导致不一致 |
| 规则冲突 | 不同包使用不同规则版本 |
| 执行效率 | 全量检查耗时过长 |
| 依赖管理 | lint 工具版本难以统一 |

### 1.2 解决思路

```
根目录
├── 统一的基础配置
├── 共享的规则包
└── 各包继承并按需扩展
```

## 二、目录结构设计

### 2.1 典型 Monorepo 结构

```
monorepo/
├── .eslintrc.js              # 根配置
├── .prettierrc               # Prettier 配置
├── .stylelintrc.js           # Stylelint 配置
├── package.json              # 工作区定义
├── packages/
│   ├── shared/               # 共享库
│   │   ├── package.json
│   │   └── .eslintrc.js      # 可选的扩展配置
│   ├── web/                  # Web 应用
│   │   ├── package.json
│   │   └── .eslintrc.js
│   ├── mobile/               # 移动端应用
│   │   └── package.json
│   └── server/               # 后端服务
│       ├── package.json
│       └── .eslintrc.js
└── tools/
    └── eslint-config/        # 自定义配置包
        ├── package.json
        ├── index.js
        └── rules/
```

### 2.2 配置包结构

```
tools/eslint-config/
├── package.json
├── index.js          # 基础配置
├── react.js          # React 项目配置
├── node.js           # Node.js 项目配置
└── typescript.js     # TypeScript 配置
```

## 三、ESLint 配置策略

### 3.1 根配置

```javascript
// 根目录 .eslintrc.js
module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  env: {
    es2021: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  ignorePatterns: [
    '**/dist/**',
    '**/build/**',
    '**/node_modules/**',
    '**/*.min.js'
  ],
  rules: {
    // 团队统一规则
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error'
  }
};
```

### 3.2 子包配置继承

```javascript
// packages/web/.eslintrc.js
module.exports = {
  extends: [
    '../../.eslintrc.js',  // 继承根配置
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  env: {
    browser: true
  },
  settings: {
    react: { version: 'detect' }
  },
  rules: {
    'react/react-in-jsx-scope': 'off'
  }
};
```

```javascript
// packages/server/.eslintrc.js
module.exports = {
  extends: ['../../.eslintrc.js'],
  env: {
    node: true
  },
  rules: {
    'no-console': 'off'
  }
};
```

### 3.3 使用内部配置包

```javascript
// tools/eslint-config/package.json
{
  "name": "@myorg/eslint-config",
  "version": "1.0.0",
  "main": "index.js",
  "files": ["*.js"],
  "peerDependencies": {
    "eslint": ">=8.0.0"
  }
}
```

```javascript
// tools/eslint-config/index.js
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error'
  }
};
```

```javascript
// tools/eslint-config/react.js
module.exports = {
  extends: [
    './index.js',
    'plugin:react/recommended'
  ],
  settings: {
    react: { version: 'detect' }
  }
};
```

```javascript
// packages/web/.eslintrc.js
module.exports = {
  extends: ['@myorg/eslint-config/react']
};
```

## 四、Prettier 配置策略

### 4.1 统一配置

Prettier 配置通常在根目录统一：

```json
// 根目录 .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 4.2 忽略文件

```gitignore
# 根目录 .prettierignore
**/dist
**/build
**/node_modules
**/*.min.js
**/pnpm-lock.yaml
**/package-lock.json
```

## 五、Stylelint 配置策略

### 5.1 根配置

```javascript
// 根目录 .stylelintrc.js
module.exports = {
  extends: ['stylelint-config-standard'],
  ignoreFiles: [
    '**/dist/**',
    '**/node_modules/**'
  ],
  overrides: [
    {
      files: ['**/*.scss'],
      extends: ['stylelint-config-standard-scss']
    },
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html'
    }
  ]
};
```

### 5.2 子包扩展

```javascript
// packages/web/.stylelintrc.js
module.exports = {
  extends: ['../../.stylelintrc.js'],
  rules: {
    'selector-class-pattern': null  // 特定包规则调整
  }
};
```

## 六、工作区脚本配置

### 6.1 npm workspaces

```json
// 根目录 package.json
{
  "name": "monorepo",
  "private": true,
  "workspaces": ["packages/*", "tools/*"],
  "scripts": {
    "lint": "npm run lint --workspaces --if-present",
    "lint:root": "eslint . --ext .js,.ts",
    "lint:fix": "npm run lint:fix --workspaces --if-present",
    "format": "prettier --write \"**/*.{js,ts,jsx,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,ts,jsx,tsx,json,md}\""
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "stylelint": "^15.0.0"
  }
}
```

### 6.2 pnpm workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'tools/*'
```

```json
// package.json
{
  "scripts": {
    "lint": "pnpm -r run lint",
    "lint:filter": "pnpm --filter @myorg/web run lint"
  }
}
```

### 6.3 Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "lint": {
      "outputs": [],
      "cache": true
    },
    "build": {
      "dependsOn": ["^build", "lint"],
      "outputs": ["dist/**"]
    }
  }
}
```

```bash
# 运行所有包的 lint
npx turbo lint

# 只运行变更包的 lint
npx turbo lint --filter=[HEAD^1]
```

## 七、增量检查策略

### 7.1 只检查变更文件

```json
{
  "scripts": {
    "lint:changed": "eslint $(git diff --name-only --diff-filter=ACMR HEAD | grep -E '\\.(js|ts|jsx|tsx)$' | xargs)"
  }
}
```

### 7.2 基于变更包检查

```bash
# Turborepo 变更检测
npx turbo lint --filter=[origin/main...HEAD]

# Lerna 变更检测
npx lerna run lint --since origin/main
```

### 7.3 lint-staged 配置

```json
// 根目录 package.json
{
  "lint-staged": {
    "packages/**/*.{js,ts,jsx,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "packages/**/*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}
```

## 八、CI/CD 配置

### 8.1 GitHub Actions

```yaml
# .github/workflows/lint.yml
name: Lint

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      
      - name: Lint affected packages
        run: npx turbo lint --filter=[origin/main...HEAD]
```

### 8.2 并行检查

```yaml
jobs:
  lint:
    strategy:
      matrix:
        package: [web, server, shared]
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm --filter @myorg/${{ matrix.package }} lint
```

## 九、依赖管理

### 9.1 统一版本

```json
// 根目录 package.json
{
  "devDependencies": {
    "eslint": "^8.50.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "prettier": "^3.0.0",
    "stylelint": "^15.0.0"
  }
}
```

### 9.2 pnpm 覆盖

```json
// package.json
{
  "pnpm": {
    "overrides": {
      "eslint": "^8.50.0"
    }
  }
}
```

### 9.3 共享配置包依赖

```json
// tools/eslint-config/package.json
{
  "name": "@myorg/eslint-config",
  "peerDependencies": {
    "eslint": ">=8.0.0"
  },
  "dependencies": {
    "eslint-config-prettier": "^9.0.0"
  }
}
```

## 十、完整配置示例

### 10.1 根目录配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  env: { es2021: true },
  ignorePatterns: ['**/dist/**', '**/node_modules/**'],
  overrides: [
    {
      files: ['packages/web/**/*.{ts,tsx}'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended'
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './packages/web/tsconfig.json'
      }
    },
    {
      files: ['packages/server/**/*.ts'],
      extends: ['plugin:@typescript-eslint/recommended'],
      parser: '@typescript-eslint/parser',
      env: { node: true }
    }
  ]
};
```

### 10.2 子包配置（可选扩展）

```javascript
// packages/web/.eslintrc.js
module.exports = {
  rules: {
    // 包特定规则调整
    'react/prop-types': 'off'
  }
};
```

## 十一、最佳实践

### 11.1 配置原则

| 原则 | 说明 |
|------|------|
| 集中管理 | 基础配置放根目录或配置包 |
| 按需扩展 | 子包只覆盖必要的差异规则 |
| 版本统一 | lint 工具版本在根目录管理 |
| 增量检查 | CI 中只检查变更的包 |

### 11.2 推荐做法

```
1. 创建内部 eslint-config 包
2. 根目录提供默认配置
3. 子包继承并最小化覆盖
4. 使用 Turborepo 实现增量检查
5. lint-staged 确保提交质量
```

## 参考资料

- [Turborepo](https://turbo.build/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [npm Workspaces](https://docs.npmjs.com/cli/using-npm/workspaces)
- [Lerna](https://lerna.js.org/)
