# 第 11 章：ESLint 配置文件详解

## 概述

ESLint 的强大之处在于其灵活的配置系统。掌握 `.eslintrc.*` 配置文件的结构和选项，是有效使用 ESLint 的关键。本章将深入解析配置文件的各个部分，帮助你构建适合项目需求的 ESLint 配置。

## 一、配置文件基础

### 1.1 配置文件格式

ESLint 支持多种配置文件格式，每种都有其适用场景：

```
.eslintrc.js      - JavaScript 模块格式，支持注释和动态配置
.eslintrc.cjs     - CommonJS 格式（ESM 项目中使用）
.eslintrc.yaml    - YAML 格式，简洁易读
.eslintrc.yml     - YAML 格式（同上）
.eslintrc.json    - JSON 格式，严格但不支持注释
.eslintrc         - 传统 JSON 格式（不推荐）
package.json      - 在 "eslintConfig" 字段中定义
```

**推荐使用顺序：**
1. `.eslintrc.js` - 最灵活，支持注释和动态逻辑
2. `.eslintrc.json` - 适合简单项目，IDE 支持好
3. `package.json` - 适合小型项目，减少文件数量

### 1.2 配置文件层级与继承

ESLint 使用层级配置系统，按以下顺序查找并合并配置（优先级从高到低）：

1. 行内配置（`/* eslint rule-name: value */`）
2. 命令行参数（`--rule`）
3. 项目配置文件（`.eslintrc.*`）
4. 父目录配置文件（向上查找）
5. 用户全局配置（`~/.eslintrc.*`）
6. ESLint 默认配置

**工作原理：**
```
项目根目录
├── .eslintrc.js      ← 基础配置
├── src/
│   ├── .eslintrc.js  ← 继承并覆盖基础配置
│   └── components/
│       └── .eslintrc.js  ← 继承并覆盖 src 配置
```

> **💡 提示**  
> 使用 `"root": true` 可以阻止向上查找，限制配置作用域。

```javascript
// 阻止向上查找父级配置
module.exports = {
  root: true,
  // 其他配置...
};
```

## 二、配置文件核心字段

### 2.1 基本配置字段

```javascript
module.exports = {
  root: true,           // 阻止向上查找
  env: {},              // 环境定义
  globals: {},          // 全局变量
  parser: "",           // 代码解析器
  parserOptions: {},    // 解析器选项
  plugins: [],          // 插件列表
  extends: [],          // 继承配置
  rules: {},            // 具体规则
  settings: {},         // 共享设置
  overrides: []         // 特定文件覆盖配置
};
```

### 2.2 env 环境配置

`env` 字段定义代码运行的环境，自动设置对应的全局变量：

```javascript
{
  "env": {
    "browser": true,     // 浏览器环境（window, document 等）
    "node": true,        // Node.js 环境（process, require 等）
    "es2022": true,      // ES2022 语法支持
    "jquery": true,      // jQuery 全局变量
    "jest": true,        // Jest 测试环境
    "mocha": true        // Mocha 测试环境
  }
}
```

**常见环境组合：**

| 项目类型 | 推荐环境配置 |
|---------|-------------|
| 前端应用 | `{ "browser": true, "es2022": true }` |
| Node.js | `{ "node": true, "es2022": true }` |
| 全栈应用 | `{ "browser": true, "node": true, "es2022": true }` |
| React Native | `{ "browser": true, "node": true, "react-native": true }` |

### 2.3 globals 全局变量

`globals` 字段定义自定义全局变量，避免 "未定义变量" 警告：

```javascript
{
  "globals": {
    "apiKey": "readonly",       // 只读全局变量
    "appConfig": "writable",    // 可写全局变量
    "process": "off"            // 禁用特定全局变量
  }
}
```

**访问级别：**
- `"readonly"` 或 `"const"` 或 `false` - 变量不可修改
- `"writable"` 或 `true` - 变量可读写
- `"off"` 或 `"none"` - 禁用此全局变量

### 2.4 parser 与 parserOptions

`parser` 字段指定代码解析器，默认使用 Espree：

```javascript
{
  "parser": "@typescript-eslint/parser",  // TypeScript 解析器
  "parserOptions": {
    "ecmaVersion": 2022,        // ES 版本
    "sourceType": "module",     // "module"(ESM) 或 "script"(传统脚本)
    "ecmaFeatures": {
      "jsx": true,              // 启用 JSX
      "globalReturn": false,    // 允许全局 return
      "impliedStrict": true     // 启用全局严格模式
    },
    "project": "./tsconfig.json" // TypeScript 项目配置
  }
}
```

**常见解析器：**
- `espree` - ESLint 默认解析器
- `@babel/eslint-parser` - Babel 解析器
- `@typescript-eslint/parser` - TypeScript 解析器
- `vue-eslint-parser` - Vue 单文件组件解析器

### 2.5 extends 配置继承

`extends` 字段用于继承其他配置，是复用配置的关键：

```javascript
{
  "extends": [
    "eslint:recommended",           // ESLint 推荐规则
    "plugin:react/recommended",     // React 推荐规则
    "airbnb",                       // Airbnb 风格
    "./base-rules.js",              // 本地配置文件
    "plugin:@typescript-eslint/recommended" // TS 推荐规则
  ]
}
```

**继承机制：**
1. 从左到右依次加载配置
2. 后加载的规则会覆盖先加载的
3. 本地规则最终覆盖所有继承规则

**常用预设配置：**
- `eslint:recommended` - ESLint 官方推荐
- `eslint:all` - 所有规则（不推荐直接使用）
- `airbnb` - Airbnb 严格规则集
- `airbnb-base` - Airbnb 不含 React 的规则
- `standard` - StandardJS 风格
- `google` - Google 风格
- `plugin:react/recommended` - React 推荐规则
- `plugin:vue/vue3-recommended` - Vue3 推荐规则
- `plugin:@typescript-eslint/recommended` - TS 推荐规则

### 2.6 plugins 插件配置

`plugins` 字段定义需要加载的插件，用于扩展 ESLint 能力：

```javascript
{
  "plugins": [
    "react",                // react 插件
    "@typescript-eslint",   // TypeScript 插件
    "import",               // import 语句检查插件
    "jsx-a11y"              // JSX 可访问性插件
  ]
}
```

> **⚠️ 注意**  
> 插件名称可以省略 `eslint-plugin-` 前缀，如 `eslint-plugin-react` 直接写 `react`。

**插件的作用：**
- 提供自定义规则
- 提供环境配置
- 提供配置预设（通过 `extends` 使用）
- 提供自定义处理器（如 Markdown 中的代码块）

## 三、rules 详细配置

### 3.1 规则基本结构

`rules` 字段是配置的核心，定义具体的代码检查规则：

```javascript
{
  "rules": {
    "semi": ["error", "always"],            // 必须使用分号
    "quotes": ["warn", "single"],           // 警告使用单引号
    "no-console": "error",                  // 禁止 console
    "react/prop-types": "off",              // 关闭 prop-types 检查
    "indent": ["error", 2, {                // 缩进配置
      "SwitchCase": 1
    }],
    "max-len": ["warn", {                   // 复杂规则配置
      "code": 80,
      "ignoreComments": true,
      "ignoreUrls": true
    }]
  }
}
```

### 3.2 规则错误等级

规则可配置三种错误级别：

- `"error"` 或 `2` - 违反规则视为错误，导致非零退出码
- `"warn"` 或 `1` - 违反规则视为警告，不影响退出码
- `"off"` 或 `0` - 禁用规则

```javascript
{
  "rules": {
    // 三种等效写法
    "semi": ["error", "always"],  // 数组形式
    "semi": "error",              // 仅指定错误级别
    "semi": 2                     // 使用数字表示
  }
}
```

### 3.3 常见核心规则分类

ESLint 内置规则可分为以下几类：

**代码风格规则：**
```javascript
{
  "rules": {
    "indent": ["error", 2],               // 缩进
    "quotes": ["error", "single"],        // 引号类型
    "semi": ["error", "always"],          // 分号
    "comma-dangle": ["error", "always-multiline"], // 尾随逗号
    "max-len": ["error", { "code": 80 }], // 行长度
    "brace-style": ["error", "1tbs"]      // 大括号风格
  }
}
```

**潜在错误规则：**
```javascript
{
  "rules": {
    "no-unused-vars": "error",          // 未使用的变量
    "no-undef": "error",                // 未定义的变量
    "no-dupe-keys": "error",            // 对象重复键名
    "no-unreachable": "error",          // 不可达代码
    "no-constant-condition": "error",   // 常量条件判断
    "no-console": "warn"                // 控制台日志
  }
}
```

**最佳实践规则：**
```javascript
{
  "rules": {
    "eqeqeq": ["error", "always"],      // 使用严格相等
    "curly": ["error", "all"],           // 始终使用大括号
    "no-eval": "error",                  // 禁止使用 eval
    "no-implied-eval": "error",          // 禁止使用隐式 eval
    "no-alert": "error",                 // 禁止使用 alert
    "radix": ["error", "always"]         // parseInt 必须指定基数
  }
}
```

**ES6 规则：**
```javascript
{
  "rules": {
    "arrow-body-style": ["error", "as-needed"], // 箭头函数简写
    "arrow-parens": ["error", "as-needed"],     // 箭头函数参数括号
    "no-var": "error",                          // 禁止使用 var
    "prefer-const": "error",                    // 优先使用 const
    "prefer-arrow-callback": "error",           // 优先使用箭头函数
    "prefer-template": "error"                  // 优先使用模板字符串
  }
}
```

### 3.4 规则选项

大多数规则支持自定义选项，通常以数组形式提供：

```javascript
{
  "rules": {
    // 简单选项规则
    "quotes": ["error", "single", { "avoidEscape": true }],
    
    // 复杂选项规则
    "complexity": ["warn", { "max": 10 }],
    
    // 多种选项
    "no-unused-vars": ["error", {
      "vars": "all",             // 检查所有变量
      "args": "after-used",      // 检查未使用的参数
      "ignoreRestSiblings": true // 忽略解构中的剩余变量
    }]
  }
}
```

### 3.5 插件规则

插件规则使用 `plugin-name/rule-name` 格式：

```javascript
{
  "plugins": ["react", "@typescript-eslint"],
  "rules": {
    "react/jsx-filename-extension": ["error", { "extensions": [".jsx", ".tsx"] }],
    "react/prop-types": "off",
    "@typescript-eslint/explicit-function-return-type": ["warn", {
      "allowExpressions": true,
      "allowTypedFunctionExpressions": true
    }],
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }]
  }
}
```

## 四、高级配置技巧

### 4.1 overrides 文件匹配配置

`overrides` 字段允许为特定文件设置不同的规则：

```javascript
{
  "rules": {
    "quotes": ["error", "single"]
  },
  "overrides": [
    {
      "files": ["*.test.js", "**/__tests__/**"],  // 测试文件匹配
      "env": {
        "jest": true                              // 启用 Jest 环境
      },
      "rules": {
        "no-unused-expressions": "off",           // 禁用特定规则
        "max-lines": "off",                       // 测试文件可以很长
        "max-nested-callbacks": "off"             // 允许嵌套回调
      }
    },
    {
      "files": ["*.jsx", "*.tsx"],                // React 文件
      "rules": {
        "react/jsx-uses-react": "error",          // 启用特定 React 规则
        "react/jsx-uses-vars": "error"
      }
    }
  ]
}
```

### 4.2 settings 共享设置

`settings` 字段用于共享配置信息，可被插件访问：

```javascript
{
  "settings": {
    "react": {
      "version": "detect",           // 自动检测 React 版本
      "pragma": "React",             // React 全局变量
      "flowVersion": "0.53"          // Flow 版本
    },
    "import/resolver": {             // import 解析配置
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      },
      "typescript": {
        "alwaysTryTypes": true,
        "project": "./tsconfig.json"
      }
    },
    "linkComponents": [              // 自定义链接组件
      { "name": "Link", "linkAttribute": "to" }
    ]
  }
}
```

### 4.3 ignorePatterns 忽略文件

`ignorePatterns` 字段用于排除特定文件，也可使用 `.eslintignore` 文件：

```javascript
{
  "ignorePatterns": [
    "dist/",           // 构建输出
    "node_modules/",   // 第三方库
    "*.min.js",        // 压缩文件
    "coverage/",       // 测试覆盖率报告
    "public/assets/"   // 静态资源
  ]
}
```

`.eslintignore` 文件语法同 `.gitignore`：

```
# 构建文件
dist/
build/

# 三方库
node_modules/

# 特定文件
*.min.js
*.spec.js
```

### 4.4 配置文件注释

在 JavaScript 格式配置中，可以使用注释增加可读性：

```javascript
module.exports = {
  // 阻止继续向父目录查找配置
  root: true,

  // 定义代码运行环境
  env: {
    browser: true,
    node: true,
    es2022: true,
  },

  // 使用共享配置
  extends: [
    // 推荐规则基线
    "eslint:recommended",
    
    // React 支持
    "plugin:react/recommended",
    
    // 处理 import 语句
    "plugin:import/errors",
    
    // 必须放在最后解决冲突
    "prettier"
  ]
};
```

### 4.5 动态配置

`.eslintrc.js` 允许使用动态逻辑生成配置：

```javascript
const path = require('path');
const production = process.env.NODE_ENV === 'production';

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    // 仅在生产环境启用更严格规则
    ...(production ? ['plugin:security/recommended'] : [])
  ],
  rules: {
    // 开发环境允许 console，生产环境禁止
    'no-console': production ? 'error' : 'warn',
    
    // 动态读取版本号
    'react/react-in-jsx-scope': 
      require('react').version.startsWith('17') ? 'off' : 'error'
  },
  overrides: [
    // 动态生成文件匹配规则
    {
      files: ['**/*.test.js'],
      env: { jest: true }
    },
    // 可以根据项目结构动态配置
    ...['components', 'pages', 'utils'].map(folder => ({
      files: [`src/${folder}/**/*.js`],
      rules: {
        // 每个目录可以有特定规则
      }
    }))
  ]
};
```

## 五、配置迁移与版本管理

### 5.1 配置文件迁移

**从 ESLint v6 迁移到 v7+：**

```javascript
// ESLint v6
module.exports = {
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true // 已移除
    }
  },
  rules: {
    "indent": ["error", 2] 
  }
};

// ESLint v7+
module.exports = {
  parserOptions: {
    // experimentalObjectRestSpread 已移除，默认支持
  },
  rules: {
    "indent": ["error", 2, { "SwitchCase": 1 }] // 推荐显式配置
  }
};
```

### 5.2 版本锁定

在团队项目中，推荐锁定 ESLint 和插件的版本：

```json
{
  "devDependencies": {
    "eslint": "^8.38.0",
    "eslint-config-airbnb": "19.0.4",
    "eslint-plugin-import": "^2.27.5",
    "eslint-plugin-jsx-a11y": "^6.7.1",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

使用 `package-lock.json` 或 `yarn.lock` 确保团队使用相同版本。

### 5.3 多包共享配置

对于 Monorepo 或多项目设置，可创建共享配置包：

```
项目结构
├── packages/
│   ├── eslint-config-company/       # 共享 ESLint 配置
│   │   ├── package.json
│   │   ├── index.js                 # 基础配置
│   │   ├── react.js                 # React 配置
│   │   └── typescript.js            # TypeScript 配置
│   ├── app1/
│   │   └── .eslintrc.js             # 使用共享配置
│   └── app2/
│       └── .eslintrc.js             # 使用共享配置
```

```javascript
// packages/eslint-config-company/index.js
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    // 公司基础规则
  }
};

// packages/eslint-config-company/react.js
module.exports = {
  extends: [
    './index.js',
    'plugin:react/recommended'
  ],
  rules: {
    // React 特定规则
  }
};

// packages/app1/.eslintrc.js
module.exports = {
  extends: ['company/react'],
  rules: {
    // 项目特定规则
  }
};
```

## 六、实用配置示例

### 6.1 基本 JavaScript 项目

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
  ],
  rules: {
    // 代码风格
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    
    // 错误预防
    'no-console': 'warn',
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    
    // 最佳实践
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
  },
  ignorePatterns: ['dist/', 'node_modules/']
};
```

### 6.2 React + TypeScript 项目

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'prettier', // 放在最后
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'import',
    'jsx-a11y',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    // React 规则
    'react/react-in-jsx-scope': 'off', // React 17+
    'react/prop-types': 'off', // 使用 TypeScript 类型
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // TypeScript 规则
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
      'destructuredArrayIgnorePattern': '^_',
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // 导入规则
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
    }],
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}', '**/__tests__/**'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', 'build/', 'coverage/'],
};
```

### 6.3 Node.js 项目

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    'node',
    'security',
  ],
  rules: {
    'node/exports-style': ['error', 'module.exports'],
    'node/file-extension-in-import': ['error', 'always'],
    'node/prefer-global/buffer': ['error', 'always'],
    'node/prefer-global/console': ['error', 'always'],
    'node/prefer-global/process': ['error', 'always'],
    'node/no-unpublished-require': 'off',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-object-injection': 'warn',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-unsafe-regex': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/tests/**', '**/scripts/**'],
      rules: {
        'node/no-unpublished-require': 'off',
        'security/detect-object-injection': 'off',
      },
    },
  ],
};
```

## 总结

ESLint 配置文件是一个强大而灵活的系统，通过合理的配置可以大幅提高代码质量和团队协作效率。关键要点：

1. 选择合适的配置文件格式，推荐 `.eslintrc.js`
2. 理解并利用配置继承机制，避免重复配置
3. 合理使用预设配置如 `eslint:recommended`
4. 根据项目需求调整规则严格度
5. 使用 `overrides` 为不同类型的文件配置特定规则
6. 将共享配置抽取为单独的包，提高复用性

掌握 ESLint 配置是前端工程化的重要环节，合理的配置可以在提高代码质量的同时，避免过度限制开发效率。

## 参考资料

- [ESLint 配置文档](https://eslint.org/docs/latest/use/configure/)
- [Configuring ESLint](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Rules Reference](https://eslint.org/docs/latest/rules/)
- [Shareable Configs](https://eslint.org/docs/latest/developer-guide/shareable-configs)
- [eslint-config-airbnb](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb)
- [eslint-config-standard](https://github.com/standard/eslint-config-standard)

---

**下一章** → [第 12 章：ESLint 规则系统详解](./12-eslint-rules.md)
