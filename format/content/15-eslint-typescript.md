# 第 15 章：TypeScript 与 ESLint

## 概述

TypeScript 项目需要特殊的 ESLint 配置来正确解析类型语法并启用类型感知的规则检查。本章详细介绍 typescript-eslint 的配置方法、常用规则及 TSLint 迁移策略。

## 一、typescript-eslint 简介

### 1.1 为什么需要 typescript-eslint

ESLint 默认解析器无法理解 TypeScript 语法：

```typescript
// ESLint 默认解析器无法解析
interface User {
  name: string;
  age: number;
}

const user: User = { name: 'Alice', age: 25 };
```

**typescript-eslint 提供：**
- TypeScript 代码解析器
- TypeScript 专用规则
- 类型信息感知的规则

### 1.2 核心包说明

```bash
npm install @typescript-eslint/parser @typescript-eslint/eslint-plugin -D
```

| 包名 | 作用 |
|------|------|
| `@typescript-eslint/parser` | TypeScript 解析器 |
| `@typescript-eslint/eslint-plugin` | TypeScript 规则集 |

## 二、基础配置

### 2.1 最小配置

```javascript
// .eslintrc.js
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  }
};
```

### 2.2 启用类型检查

需要类型信息的规则需要配置 `project`：

```javascript
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",  // 指向TS配置文件
    tsconfigRootDir: __dirname
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ]
};
```

> **⚠️ 注意**  
> 启用类型检查会增加 lint 时间，因为需要进行完整的类型分析。

### 2.3 配置文件解析范围

```javascript
parserOptions: {
  // 单个tsconfig
  project: "./tsconfig.json",
  
  // 多个tsconfig
  project: ["./tsconfig.json", "./tsconfig.node.json"],
  
  // 使用glob模式
  project: ["./packages/*/tsconfig.json"]
}
```

## 三、预设配置详解

### 3.1 预设级别

```javascript
// 基础推荐（不需要类型信息）
"plugin:@typescript-eslint/recommended"

// 需要类型信息的规则
"plugin:@typescript-eslint/recommended-requiring-type-checking"

// 严格模式
"plugin:@typescript-eslint/strict"

// 严格+类型检查
"plugin:@typescript-eslint/strict-type-checked"

// 风格规则
"plugin:@typescript-eslint/stylistic"
"plugin:@typescript-eslint/stylistic-type-checked"
```

### 3.2 预设对比

| 预设 | 类型检查 | 严格度 | 推荐场景 |
|------|----------|--------|----------|
| `recommended` | 否 | 中 | 大多数项目 |
| `recommended-requiring-type-checking` | 是 | 中 | 需要类型安全 |
| `strict` | 否 | 高 | 严格项目 |
| `strict-type-checked` | 是 | 最高 | 企业级项目 |

### 3.3 推荐配置组合

```javascript
// 标准项目
extends: [
  "eslint:recommended",
  "plugin:@typescript-eslint/recommended",
  "prettier"
]

// 严格项目
extends: [
  "eslint:recommended",
  "plugin:@typescript-eslint/strict-type-checked",
  "plugin:@typescript-eslint/stylistic-type-checked",
  "prettier"
]
```

## 四、核心规则详解

### 4.1 类型相关规则

```javascript
rules: {
  // any 类型控制
  "@typescript-eslint/no-explicit-any": "error",     // 禁止显式any
  "@typescript-eslint/no-unsafe-any": "error",       // 禁止使用any值
  "@typescript-eslint/no-unsafe-assignment": "error", // 禁止any赋值
  "@typescript-eslint/no-unsafe-call": "error",      // 禁止调用any
  "@typescript-eslint/no-unsafe-member-access": "error", // 禁止访问any成员
  "@typescript-eslint/no-unsafe-return": "error",    // 禁止返回any
  
  // 类型断言
  "@typescript-eslint/consistent-type-assertions": ["error", {
    "assertionStyle": "as",        // 使用as而非<>
    "objectLiteralTypeAssertions": "never"  // 禁止对象字面量断言
  }],
  
  // 类型导入
  "@typescript-eslint/consistent-type-imports": ["error", {
    "prefer": "type-imports"       // 优先type导入
  }]
}
```

### 4.2 代码质量规则

```javascript
rules: {
  // 替代ESLint规则（需要关闭原规则）
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": ["error", {
    "argsIgnorePattern": "^_",
    "varsIgnorePattern": "^_"
  }],
  
  "no-shadow": "off",
  "@typescript-eslint/no-shadow": "error",
  
  "no-use-before-define": "off",
  "@typescript-eslint/no-use-before-define": ["error", {
    "functions": false
  }],
  
  // TypeScript特有
  "@typescript-eslint/no-non-null-assertion": "warn",  // 警告非空断言!
  "@typescript-eslint/no-unnecessary-condition": "error", // 禁止恒真/假条件
  "@typescript-eslint/prefer-nullish-coalescing": "error", // 使用??
  "@typescript-eslint/prefer-optional-chain": "error"      // 使用?.
}
```

### 4.3 函数规则

```javascript
rules: {
  // 返回类型
  "@typescript-eslint/explicit-function-return-type": "off",  // 函数返回类型
  "@typescript-eslint/explicit-module-boundary-types": "off", // 导出函数返回类型
  
  // Promise处理
  "@typescript-eslint/no-floating-promises": "error",    // 必须处理Promise
  "@typescript-eslint/no-misused-promises": "error",     // Promise误用
  "@typescript-eslint/await-thenable": "error",          // 只await thenable
  "@typescript-eslint/promise-function-async": "error",  // 返回Promise的函数标记async
  
  // 方法签名
  "@typescript-eslint/method-signature-style": ["error", "property"]
}
```

### 4.4 命名规则

```javascript
rules: {
  "@typescript-eslint/naming-convention": [
    "error",
    // 变量：camelCase 或 UPPER_CASE
    {
      "selector": "variable",
      "format": ["camelCase", "UPPER_CASE"]
    },
    // 函数：camelCase
    {
      "selector": "function",
      "format": ["camelCase"]
    },
    // 类型：PascalCase
    {
      "selector": "typeLike",
      "format": ["PascalCase"]
    },
    // 接口：I前缀（可选）
    {
      "selector": "interface",
      "format": ["PascalCase"],
      "prefix": ["I"]  // 如果团队使用I前缀
    },
    // 私有成员：_前缀
    {
      "selector": "memberLike",
      "modifiers": ["private"],
      "format": ["camelCase"],
      "leadingUnderscore": "require"
    }
  ]
}
```

## 五、规则替代关系

ESLint 部分规则需要替换为 TypeScript 版本：

### 5.1 必须替换的规则

```javascript
rules: {
  // 关闭ESLint原规则，启用TS版本
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": "error",
  
  "no-shadow": "off",
  "@typescript-eslint/no-shadow": "error",
  
  "no-use-before-define": "off",
  "@typescript-eslint/no-use-before-define": "error",
  
  "no-useless-constructor": "off",
  "@typescript-eslint/no-useless-constructor": "error",
  
  "no-empty-function": "off",
  "@typescript-eslint/no-empty-function": "error",
  
  "no-redeclare": "off",
  "@typescript-eslint/no-redeclare": "error",
  
  "no-loop-func": "off",
  "@typescript-eslint/no-loop-func": "error",
  
  "no-dupe-class-members": "off",
  "@typescript-eslint/no-dupe-class-members": "error"
}
```

### 5.2 自动替换

使用 `recommended` 预设会自动处理替换：

```javascript
// 预设会自动关闭冲突的ESLint规则
extends: ["plugin:@typescript-eslint/recommended"]
```

## 六、常见配置示例

### 6.1 标准 TypeScript 项目

```javascript
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module"
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }],
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
};
```

### 6.2 严格 TypeScript 项目

```javascript
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module"
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "prettier"
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/strict-boolean-expressions": "error"
  }
};
```

### 6.3 Node.js + TypeScript

```javascript
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json"
  },
  env: {
    node: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:n/recommended",
    "prettier"
  ],
  rules: {
    "no-console": "off",
    "n/no-missing-import": "off",  // TS处理导入
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }]
  }
};
```

## 七、性能优化

### 7.1 parserOptions.project 的性能影响

类型检查显著增加 lint 时间：

```javascript
// 快速（不使用类型信息）
extends: ["plugin:@typescript-eslint/recommended"]

// 较慢（需要类型信息）
extends: ["plugin:@typescript-eslint/recommended-requiring-type-checking"]
parserOptions: {
  project: "./tsconfig.json"
}
```

### 7.2 优化策略

**创建专用 tsconfig：**

```json
// tsconfig.eslint.json
{
  "extends": "./tsconfig.json",
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    ".eslintrc.js"  // 包含配置文件
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts"  // 排除测试文件
  ]
}
```

```javascript
parserOptions: {
  project: "./tsconfig.eslint.json"
}
```

**使用缓存：**

```bash
# 启用缓存
npx eslint --cache src/

# 指定缓存位置
npx eslint --cache --cache-location .eslintcache src/
```

### 7.3 EXPERIMENTAL_useProjectService

ESLint 8+ 新特性，提升大型项目性能：

```javascript
parserOptions: {
  EXPERIMENTAL_useProjectService: true
}
```

## 八、TSLint 迁移

### 8.1 迁移工具

TSLint 已废弃，使用官方工具迁移：

```bash
npx tslint-to-eslint-config
```

这个命令会：
- 读取 `tslint.json`
- 生成 `.eslintrc.js`
- 映射规则到 ESLint 等效规则

### 8.2 常见规则映射

| TSLint 规则 | ESLint 规则 |
|-------------|-------------|
| `no-unused-variable` | `@typescript-eslint/no-unused-vars` |
| `no-any` | `@typescript-eslint/no-explicit-any` |
| `member-ordering` | `@typescript-eslint/member-ordering` |
| `typedef` | `@typescript-eslint/typedef` |
| `no-inferrable-types` | `@typescript-eslint/no-inferrable-types` |
| `await-promise` | `@typescript-eslint/await-thenable` |

### 8.3 无法迁移的规则

部分 TSLint 规则没有 ESLint 等效：

```javascript
// 可能需要自定义或放弃的规则
"completed-docs"           // 文档完整性
"no-import-side-effect"    // 部分支持
"strict-type-predicates"   // 需要TS编译器选项
```

## 九、常见问题

### 9.1 Parsing error: Cannot read file

```javascript
// 确保parserOptions.project正确指向tsconfig
parserOptions: {
  project: "./tsconfig.json",
  tsconfigRootDir: __dirname  // 指定根目录
}
```

### 9.2 文件不在 tsconfig 包含范围

```
Parsing error: "xxx.js" was not found by the project service.
```

**解决方案：**
```javascript
// 对非TS文件使用overrides
overrides: [
  {
    files: ["*.js"],
    extends: ["eslint:recommended"],
    parser: "espree"  // 使用默认解析器
  }
]
```

### 9.3 规则冲突

```javascript
// 关闭ESLint规则，使用TS版本
"no-unused-vars": "off",
"@typescript-eslint/no-unused-vars": "error"
```

### 9.4 any 类型过多警告

```javascript
// 渐进式处理
rules: {
  "@typescript-eslint/no-explicit-any": "warn",  // 先警告
  "@typescript-eslint/no-unsafe-any": "off"      // 暂时关闭
}
```

## 十、最佳实践

### 10.1 渐进式采用

```javascript
// 阶段1：基础配置
extends: ["plugin:@typescript-eslint/recommended"]

// 阶段2：添加类型检查
extends: [
  "plugin:@typescript-eslint/recommended",
  "plugin:@typescript-eslint/recommended-requiring-type-checking"
]

// 阶段3：严格模式
extends: ["plugin:@typescript-eslint/strict-type-checked"]
```

### 10.2 与 tsc 配合

ESLint 负责代码风格，tsc 负责类型检查：

```json
// package.json
{
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "check": "npm run typecheck && npm run lint"
  }
}
```

### 10.3 CI 配置

```yaml
# .github/workflows/lint.yml
jobs:
  lint:
    steps:
      - run: npm run typecheck
      - run: npm run lint
```

## 参考资料

- [typescript-eslint 官方文档](https://typescript-eslint.io/)
- [typescript-eslint 规则列表](https://typescript-eslint.io/rules/)
- [TSLint 迁移指南](https://typescript-eslint.io/linting/troubleshooting/)
- [TypeScript 编译选项](https://www.typescriptlang.org/tsconfig)
