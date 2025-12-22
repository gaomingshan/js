# 第 22 章：ESLint 集成方案

## 概述

ESLint 和 Prettier 各有所长：ESLint 擅长代码质量检查，Prettier 专注代码格式化。将两者正确集成，既能保证代码质量，又能统一代码风格，同时避免规则冲突。

## 一、为什么需要集成

### 1.1 职责划分

| 工具 | 职责 | 示例 |
|------|------|------|
| ESLint | 代码质量 | `no-unused-vars`, `no-undef` |
| ESLint | 最佳实践 | `eqeqeq`, `no-eval` |
| Prettier | 代码格式 | 缩进、换行、引号 |

### 1.2 冲突问题

不集成时可能出现的问题：

```javascript
// ESLint: 使用单引号 (quotes: ["error", "single"])
// Prettier: 使用双引号 (singleQuote: false)

// 结果：两个工具互相"修复"，陷入无限循环
```

### 1.3 集成目标

- **无冲突**：关闭 ESLint 中与 Prettier 冲突的规则
- **统一执行**：通过一个命令完成检查和格式化
- **编辑器友好**：保存时自动处理

## 二、集成方案对比

### 2.1 方案一：eslint-config-prettier（推荐）

关闭 ESLint 中与 Prettier 冲突的规则：

```bash
npm install eslint-config-prettier -D
```

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"  // 必须放最后
  ]
};
```

**优点：**
- 简单，只需添加一个 extends
- ESLint 和 Prettier 各自独立运行
- 推荐的官方方案

**工作流程：**
```bash
# 分别运行
npx eslint --fix src/   # 修复代码质量问题
npx prettier --write src/ # 格式化代码
```

### 2.2 方案二：eslint-plugin-prettier

将 Prettier 作为 ESLint 规则运行：

```bash
npm install eslint-plugin-prettier eslint-config-prettier -D
```

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended"  // 包含 config-prettier
  ]
};
```

**优点：**
- 一个命令完成所有检查
- 格式问题显示为 ESLint 错误

**缺点：**
- 较慢（Prettier 通过 ESLint 运行）
- 编辑器中红线过多

### 2.3 方案三：prettier-eslint

先 Prettier 后 ESLint：

```bash
npm install prettier-eslint prettier-eslint-cli -D
```

```bash
npx prettier-eslint --write "src/**/*.js"
```

**优点：**
- ESLint 规则优先级更高

**缺点：**
- 需要额外工具
- 配置复杂

### 2.4 推荐选择

| 场景 | 推荐方案 |
|------|----------|
| 大多数项目 | eslint-config-prettier |
| 希望统一命令 | eslint-plugin-prettier |
| ESLint 规则优先 | prettier-eslint |

## 三、eslint-config-prettier 详解

### 3.1 安装与配置

```bash
npm install eslint-config-prettier -D
```

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    // 其他配置放前面
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    
    // prettier 必须放最后
    "prettier"
  ]
};
```

### 3.2 关闭的规则

`eslint-config-prettier` 会关闭以下类别的规则：

**核心 ESLint 规则：**
```javascript
// 这些规则会被关闭
"array-bracket-newline", "array-bracket-spacing",
"array-element-newline", "arrow-parens", "arrow-spacing",
"block-spacing", "brace-style", "comma-dangle",
"comma-spacing", "comma-style", "computed-property-spacing",
"dot-location", "eol-last", "func-call-spacing",
"function-call-argument-newline", "function-paren-newline",
"generator-star-spacing", "implicit-arrow-linebreak",
"indent", "jsx-quotes", "key-spacing", "keyword-spacing",
"linebreak-style", "max-len", "multiline-ternary",
"newline-per-chained-call", "new-parens", "no-extra-parens",
"no-extra-semi", "no-floating-decimal", "no-mixed-operators",
"no-mixed-spaces-and-tabs", "no-multi-spaces",
"no-multiple-empty-lines", "no-tabs", "no-trailing-spaces",
"no-whitespace-before-property", "nonblock-statement-body-position",
"object-curly-newline", "object-curly-spacing",
"object-property-newline", "one-var-declaration-per-line",
"operator-linebreak", "padded-blocks", "quote-props",
"quotes", "rest-spread-spacing", "semi", "semi-spacing",
"semi-style", "space-before-blocks", "space-before-function-paren",
"space-in-parens", "space-infix-ops", "space-unary-ops",
"switch-colon-spacing", "template-curly-spacing",
"template-tag-spacing", "unicode-bom", "wrap-iife", "wrap-regex",
"yield-star-spacing"
```

**TypeScript 规则：**
```javascript
"@typescript-eslint/block-spacing",
"@typescript-eslint/brace-style",
"@typescript-eslint/comma-dangle",
"@typescript-eslint/comma-spacing",
"@typescript-eslint/func-call-spacing",
"@typescript-eslint/indent",
"@typescript-eslint/key-spacing",
"@typescript-eslint/keyword-spacing",
"@typescript-eslint/member-delimiter-style",
"@typescript-eslint/no-extra-parens",
"@typescript-eslint/no-extra-semi",
"@typescript-eslint/object-curly-spacing",
"@typescript-eslint/quotes",
"@typescript-eslint/semi",
"@typescript-eslint/space-before-blocks",
"@typescript-eslint/space-before-function-paren",
"@typescript-eslint/space-infix-ops",
"@typescript-eslint/type-annotation-spacing"
```

### 3.3 检查冲突

```bash
# 检查是否有冲突规则
npx eslint-config-prettier src/index.js
```

## 四、eslint-plugin-prettier 详解

### 4.1 安装与配置

```bash
npm install eslint-plugin-prettier eslint-config-prettier -D
```

```javascript
// .eslintrc.js
module.exports = {
  extends: ["plugin:prettier/recommended"]
};

// 等同于：
module.exports = {
  extends: ["prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off"
  }
};
```

### 4.2 自定义 Prettier 配置

```javascript
// .eslintrc.js
module.exports = {
  extends: ["plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": ["error", {
      "singleQuote": true,
      "semi": false
    }]
  }
};
```

或使用独立的 `.prettierrc`：

```javascript
rules: {
  "prettier/prettier": ["error", {}, {
    "usePrettierrc": true  // 使用 .prettierrc 配置
  }]
}
```

### 4.3 与其他插件配合

```javascript
// React + TypeScript
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended"  // 始终放最后
  ]
};
```

## 五、完整配置示例

### 5.1 React + TypeScript 项目

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    ecmaFeatures: { jsx: true }
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  settings: {
    react: { version: "detect" }
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
};
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all"
}
```

```json
// package.json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "check": "npm run lint && prettier --check src/"
  }
}
```

### 5.2 Vue 3 + TypeScript 项目

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    project: "./tsconfig.json",
    extraFileExtensions: [".vue"]
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "prettier"
  ],
  rules: {
    "vue/multi-word-component-names": "off"
  }
};
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "vueIndentScriptAndStyle": false,
  "singleAttributePerLine": true
}
```

### 5.3 Node.js 项目

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "prettier"
  ],
  rules: {
    "no-console": "off"
  }
};
```

## 六、工作流配置

### 6.1 lint-staged 配置

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "prettier --write"
    ],
    "*.{json,md,yaml}": [
      "prettier --write"
    ]
  }
}
```

### 6.2 VS Code 配置

```json
// .vscode/settings.json
{
  // ESLint
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  
  // Prettier
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  
  // 保存时操作
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  
  // 特定语言配置
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 6.3 CI 配置

```yaml
# .github/workflows/lint.yml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - name: ESLint
        run: npm run lint
      
      - name: Prettier
        run: npx prettier --check src/
```

## 七、常见问题

### 7.1 规则冲突

**问题：** ESLint 和 Prettier 对同一问题有不同处理

**解决：** 确保 `prettier` 配置在 extends 最后

```javascript
extends: [
  "eslint:recommended",
  "prettier"  // 必须最后
]
```

### 7.2 格式化后 ESLint 报错

**问题：** Prettier 格式化后出现 ESLint 错误

**解决：** 可能遗漏了某些插件的 prettier 配置

```javascript
extends: [
  "plugin:@typescript-eslint/recommended",
  "prettier"  // 会关闭 @typescript-eslint 格式规则
]
```

### 7.3 保存时格式化不生效

**检查清单：**
1. VS Code 是否安装了 ESLint 和 Prettier 扩展
2. 检查 `settings.json` 配置
3. 查看 VS Code 输出面板的错误信息

```json
// 确保配置正确
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### 7.4 某些文件不应用 Prettier

```json
// .prettierignore
dist/
build/
*.min.js

// 或在 eslint 中忽略
{
  "ignorePatterns": ["dist/", "build/"]
}
```

## 八、最佳实践

### 8.1 配置原则

1. **ESLint 只管代码质量**：关闭所有格式规则
2. **Prettier 只管格式**：不做代码质量检查
3. **各司其职**：避免职责重叠

### 8.2 团队协作

```
推荐工作流：
1. 编辑器保存时：Prettier 格式化 + ESLint 修复
2. 提交前：lint-staged 检查
3. CI：完整检查（lint + format check）
```

### 8.3 迁移策略

```bash
# 1. 安装依赖
npm install eslint-config-prettier -D

# 2. 更新 ESLint 配置
# extends 末尾添加 "prettier"

# 3. 一次性格式化所有代码
npx prettier --write "src/**/*.{js,ts,jsx,tsx}"

# 4. 提交格式化变更
git add -A && git commit -m "style: apply prettier formatting"
```

## 参考资料

- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
- [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)
- [Prettier vs ESLint](https://prettier.io/docs/en/comparison.html)
