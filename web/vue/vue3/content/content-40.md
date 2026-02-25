# ESLint 与代码规范

> 通过 ESLint 保证代码质量和团队协作效率。

## 核心概念

ESLint 是可扩展的 JavaScript 和 TypeScript 代码检查工具。

### 安装

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-vue
```

---

## 配置文件

### .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  
  plugins: [
    'vue',
    '@typescript-eslint'
  ],
  
  rules: {
    // Vue 规则
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    'vue/html-self-closing': ['error', {
      html: {
        void: 'always',
        normal: 'never',
        component: 'always'
      }
    }],
    
    // TypeScript 规则
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    
    // JavaScript 规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': 'off', // 使用 TypeScript 的规则
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    'indent': ['error', 2],
    'arrow-parens': ['error', 'always'],
    'object-curly-spacing': ['error', 'always']
  }
}
```

---

## Prettier 集成

### 安装

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

### .prettierrc.json

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "auto",
  "vueIndentScriptAndStyle": false
}
```

### .prettierignore

```
dist
node_modules
*.min.js
*.min.css
```

### ESLint 配置

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier' // 必须放在最后
  ],
  
  plugins: ['prettier'],
  
  rules: {
    'prettier/prettier': 'error'
  }
}
```

---

## Vue 专属规则

### 组件命名

```javascript
rules: {
  // 组件名必须多个单词
  'vue/multi-word-component-names': ['error', {
    ignores: ['index', 'App']
  }],
  
  // 组件名大小写
  'vue/component-name-in-template-casing': ['error', 'PascalCase', {
    registeredComponentsOnly: false
  }]
}
```

### 模板规则

```javascript
rules: {
  // 自闭合标签
  'vue/html-self-closing': ['error', {
    html: {
      void: 'always',
      normal: 'never',
      component: 'always'
    }
  }],
  
  // 属性顺序
  'vue/attributes-order': ['error', {
    order: [
      'DEFINITION',
      'LIST_RENDERING',
      'CONDITIONALS',
      'RENDER_MODIFIERS',
      'GLOBAL',
      'UNIQUE',
      'TWO_WAY_BINDING',
      'OTHER_DIRECTIVES',
      'OTHER_ATTR',
      'EVENTS',
      'CONTENT'
    ]
  }],
  
  // 每行最大属性数
  'vue/max-attributes-per-line': ['error', {
    singleline: 3,
    multiline: 1
  }],
  
  // 模板缩进
  'vue/html-indent': ['error', 2, {
    attribute: 1,
    baseIndent: 1,
    closeBracket: 0
  }]
}
```

### Script Setup 规则

```javascript
rules: {
  // 宏顺序
  'vue/block-order': ['error', {
    order: ['script', 'template', 'style']
  }],
  
  // defineEmits 和 defineProps 顺序
  'vue/component-api-style': ['error', ['script-setup']],
  
  // 组件选项顺序
  'vue/order-in-components': ['error', {
    order: [
      'name',
      'components',
      'props',
      'emits',
      'setup',
      'data',
      'computed',
      'watch',
      'methods',
      'lifecycle'
    ]
  }]
}
```

---

## TypeScript 规则

### 类型检查

```javascript
rules: {
  // any 类型警告
  '@typescript-eslint/no-explicit-any': 'warn',
  
  // 未使用的变量
  '@typescript-eslint/no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
    caughtErrorsIgnorePattern: '^_'
  }],
  
  // 空函数
  '@typescript-eslint/no-empty-function': ['error', {
    allow: ['arrowFunctions']
  }],
  
  // 类型断言
  '@typescript-eslint/consistent-type-assertions': ['error', {
    assertionStyle: 'as',
    objectLiteralTypeAssertions: 'allow'
  }]
}
```

### 命名规范

```javascript
rules: {
  '@typescript-eslint/naming-convention': [
    'error',
    // 变量使用 camelCase
    {
      selector: 'variable',
      format: ['camelCase', 'UPPER_CASE', 'PascalCase']
    },
    // 函数使用 camelCase
    {
      selector: 'function',
      format: ['camelCase', 'PascalCase']
    },
    // 类型使用 PascalCase
    {
      selector: 'typeLike',
      format: ['PascalCase']
    },
    // 接口使用 PascalCase
    {
      selector: 'interface',
      format: ['PascalCase'],
      custom: {
        regex: '^I[A-Z]',
        match: false
      }
    }
  ]
}
```

---

## 自定义规则

### 禁止特定导入

```javascript
rules: {
  'no-restricted-imports': ['error', {
    patterns: [
      {
        group: ['lodash'],
        message: '请使用 lodash-es 代替 lodash'
      }
    ]
  }]
}
```

### 文件命名规范

```javascript
// .eslintrc.cjs
rules: {
  'unicorn/filename-case': ['error', {
    cases: {
      kebabCase: true,
      pascalCase: true
    }
  }]
}
```

---

## 忽略配置

### .eslintignore

```
node_modules
dist
*.min.js
public
.vscode
.idea
*.d.ts
```

### 行内忽略

```typescript
// eslint-disable-next-line
const any: any = 'test'

/* eslint-disable */
// 多行代码
/* eslint-enable */

// 忽略整个文件
/* eslint-disable */

// 忽略特定规则
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = {}
```

---

## VS Code 集成

### settings.json

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "eslint.format.enable": true,
  "editor.formatOnSave": true,
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Git Hooks

### husky + lint-staged

```bash
npm install -D husky lint-staged
npx husky install
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less,vue}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

---

## 常用命令

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .vue,.js,.ts,.jsx,.tsx",
    "lint:fix": "eslint . --ext .vue,.js,.ts,.jsx,.tsx --fix",
    "format": "prettier --write \"./**/*.{vue,ts,tsx,js,jsx,css,less,scss,json,md}\""
  }
}
```

---

## 团队规范

### 规范文档

```markdown
# 代码规范

## 命名规范

- 组件名：PascalCase
- 文件名：kebab-case
- 变量名：camelCase
- 常量名：UPPER_CASE
- 类型名：PascalCase

## Vue 规范

- 组件名必须多个单词
- Props 定义必须详细
- 使用 script setup
- 单文件组件顺序：script -> template -> style

## TypeScript 规范

- 优先使用 interface 而非 type
- 避免使用 any
- 函数必须有返回类型

## 样式规范

- 使用 scoped 样式
- 类名使用 BEM 命名法
- 避免使用 !important
```

### Code Review 检查点

1. **代码风格**：是否符合 ESLint 规则
2. **类型安全**：是否有明确的类型定义
3. **组件设计**：是否符合单一职责原则
4. **性能考虑**：是否有不必要的计算
5. **可维护性**：代码是否易于理解和修改

---

## 常见问题

### 1. ESLint 与 Prettier 冲突

```bash
# 安装冲突解决插件
npm install -D eslint-config-prettier
```

```javascript
// .eslintrc.cjs
extends: [
  'eslint:recommended',
  'prettier' // 放在最后
]
```

### 2. Vue 文件无法识别

```javascript
// .eslintrc.cjs
parser: 'vue-eslint-parser',
parserOptions: {
  parser: '@typescript-eslint/parser'
}
```

### 3. TypeScript 路径别名

```javascript
// .eslintrc.cjs
settings: {
  'import/resolver': {
    typescript: {
      project: './tsconfig.json'
    }
  }
}
```

---

## 性能优化

### 缓存

```bash
# 使用缓存加速检查
eslint --cache --cache-location node_modules/.cache/eslint .
```

### 并行检查

```bash
npm install -D eslint-parallel
```

```json
{
  "scripts": {
    "lint": "eslint-parallel . --ext .vue,.js,.ts"
  }
}
```

---

## 迁移指南

### 从 Vue 2 迁移

```javascript
// 移除 Vue 2 规则
rules: {
  // Vue 2
  'vue/no-v-for-template-key': 'off',
  
  // Vue 3
  'vue/no-v-for-template-key-on-child': 'error'
}
```

### 从 JavaScript 迁移到 TypeScript

```javascript
// 逐步启用 TypeScript 规则
rules: {
  '@typescript-eslint/no-explicit-any': 'warn', // 先警告
  '@typescript-eslint/no-unused-vars': 'warn'
}

// 稳定后改为 error
rules: {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unused-vars': 'error'
}
```

---

## 最佳实践

1. **渐进式规则**：从警告开始，逐步升级为错误
2. **团队共识**：规则要团队讨论确定
3. **自动修复**：利用 --fix 自动修复问题
4. **持续集成**：在 CI 中运行 lint
5. **及时更新**：定期更新 ESLint 和插件
6. **文档化**：记录自定义规则的原因
7. **适度配置**：不要过度限制
8. **代码审查**：结合人工 Code Review

---

## 参考资料

- [ESLint 官方文档](https://eslint.org/)
- [eslint-plugin-vue](https://eslint.vuejs.org/)
- [@typescript-eslint](https://typescript-eslint.io/)
- [Prettier 官方文档](https://prettier.io/)
