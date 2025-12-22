# 第 14 章：针对框架的配置

## 概述

现代前端开发离不开框架，而每个框架都有其独特的语法特性和最佳实践。本章详细介绍如何为 React、Vue、Angular 等主流框架配置 ESLint，确保框架特定的代码质量。

## 一、React 项目配置

### 1.1 基础配置

```bash
# 安装依赖
npm install eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y -D
```

```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: "latest",
    sourceType: "module"
  },
  settings: {
    react: {
      version: "detect"  // 自动检测React版本
    }
  }
};
```

### 1.2 核心规则说明

**React 规则：**
```javascript
rules: {
  // JSX 相关
  "react/jsx-uses-react": "error",       // 标记React已使用
  "react/jsx-uses-vars": "error",        // 标记JSX变量已使用
  "react/jsx-key": "error",              // 列表需要key
  "react/jsx-no-duplicate-props": "error", // 禁止重复props
  
  // 组件相关
  "react/prop-types": "error",           // 要求PropTypes
  "react/no-direct-mutation-state": "error", // 禁止直接修改state
  "react/no-unused-state": "warn",       // 未使用的state
  
  // React 17+ 可关闭
  "react/react-in-jsx-scope": "off",     // 不需要导入React
  "react/jsx-uses-react": "off"
}
```

**Hooks 规则：**
```javascript
rules: {
  // Hooks 规则（必须遵守）
  "react-hooks/rules-of-hooks": "error",   // Hook调用规则
  "react-hooks/exhaustive-deps": "warn"    // 依赖数组完整性
}
```

### 1.3 常见配置调整

```javascript
rules: {
  // 使用TypeScript时关闭PropTypes
  "react/prop-types": "off",
  "react/require-default-props": "off",
  
  // 允许JSX在.js文件中
  "react/jsx-filename-extension": ["error", {
    "extensions": [".js", ".jsx", ".tsx"]
  }],
  
  // 函数组件定义方式
  "react/function-component-definition": ["error", {
    "namedComponents": "arrow-function",
    "unnamedComponents": "arrow-function"
  }],
  
  // 放宽解构要求
  "react/destructuring-assignment": "off",
  
  // 允许展开props
  "react/jsx-props-no-spreading": "off"
}
```

### 1.4 React + TypeScript 完整配置

```javascript
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
    "plugin:jsx-a11y/recommended",
    "prettier"
  ],
  settings: {
    react: { version: "detect" }
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
};
```

## 二、Vue 项目配置

### 2.1 基础配置

```bash
npm install eslint-plugin-vue -D
```

```javascript
// Vue 3 项目
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  }
};
```

### 2.2 Vue 预设级别

```javascript
// 从宽松到严格
"plugin:vue/vue3-essential"          // 仅防止错误
"plugin:vue/vue3-strongly-recommended" // 提高可读性
"plugin:vue/vue3-recommended"        // 最佳实践

// Vue 2 对应版本
"plugin:vue/essential"
"plugin:vue/strongly-recommended"
"plugin:vue/recommended"
```

### 2.3 核心规则说明

```javascript
rules: {
  // 模板规则
  "vue/no-unused-vars": "error",           // 未使用变量
  "vue/no-unused-components": "error",     // 未使用组件
  "vue/no-v-html": "warn",                 // 警告v-html（XSS风险）
  "vue/require-v-for-key": "error",        // v-for需要key
  
  // 组件规则
  "vue/component-name-in-template-casing": ["error", "PascalCase"],
  "vue/component-definition-name-casing": ["error", "PascalCase"],
  "vue/multi-word-component-names": "error", // 多词组件名
  
  // 属性规则
  "vue/attribute-hyphenation": ["error", "always"],
  "vue/v-on-event-hyphenation": ["error", "always"],
  
  // 排序规则
  "vue/order-in-components": "error",      // 选项顺序
  "vue/attributes-order": "error"          // 属性顺序
}
```

### 2.4 常见配置调整

```javascript
rules: {
  // 允许单词组件名（如 Index.vue）
  "vue/multi-word-component-names": "off",
  
  // 调整属性换行规则
  "vue/max-attributes-per-line": ["error", {
    "singleline": 3,
    "multiline": 1
  }],
  
  // 允许v-html
  "vue/no-v-html": "off",
  
  // 自闭合标签
  "vue/html-self-closing": ["error", {
    "html": { "void": "always", "normal": "never", "component": "always" },
    "svg": "always",
    "math": "always"
  }]
}
```

### 2.5 Vue + TypeScript 配置

```javascript
module.exports = {
  root: true,
  parser: "vue-eslint-parser",  // 使用vue解析器
  parserOptions: {
    parser: "@typescript-eslint/parser",  // TS作为脚本解析器
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
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "varsIgnorePattern": "^_"
    }]
  }
};
```

### 2.6 script setup 支持

```javascript
// Vue 3 <script setup> 语法支持
module.exports = {
  extends: ["plugin:vue/vue3-recommended"],
  rules: {
    // defineProps/defineEmits 自动导入
    "vue/define-macros-order": ["error", {
      "order": ["defineProps", "defineEmits"]
    }],
    
    // 组合式API规则
    "vue/define-props-declaration": ["error", "type-based"],
    "vue/define-emits-declaration": ["error", "type-based"]
  }
};
```

## 三、Angular 项目配置

### 3.1 基础配置

Angular CLI 项目通常自带 ESLint 配置：

```bash
# Angular 12+ 默认使用 ESLint
ng add @angular-eslint/schematics
```

```javascript
// .eslintrc.json
{
  "root": true,
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates"
      ],
      "rules": {
        "@angular-eslint/component-selector": ["error", {
          "type": "element",
          "prefix": "app",
          "style": "kebab-case"
        }],
        "@angular-eslint/directive-selector": ["error", {
          "type": "attribute",
          "prefix": "app",
          "style": "camelCase"
        }]
      }
    },
    {
      "files": ["*.html"],
      "extends": [
        "plugin:@angular-eslint/template/recommended"
      ]
    }
  ]
}
```

### 3.2 核心规则

```javascript
rules: {
  // 组件规则
  "@angular-eslint/component-class-suffix": "error",
  "@angular-eslint/directive-class-suffix": "error",
  "@angular-eslint/no-host-metadata-property": "error",
  "@angular-eslint/no-inputs-metadata-property": "error",
  
  // 模板规则
  "@angular-eslint/template/banana-in-box": "error",     // [()] 语法检查
  "@angular-eslint/template/no-negated-async": "error",  // 禁止 !async
  "@angular-eslint/template/eqeqeq": "error"             // 模板中使用===
}
```

## 四、Next.js 项目配置

### 4.1 基础配置

```bash
# Next.js 11+ 内置ESLint支持
npm install eslint-config-next -D
```

```javascript
// .eslintrc.js
module.exports = {
  extends: ["next/core-web-vitals"]
};
```

### 4.2 预设级别

```javascript
// 基础规则
extends: ["next"]

// 严格规则（推荐）
extends: ["next/core-web-vitals"]
```

### 4.3 核心规则

```javascript
// next/core-web-vitals 包含的规则
{
  // 图片优化
  "@next/next/no-img-element": "warn",           // 使用next/image
  
  // 字体优化
  "@next/next/google-font-display": "warn",
  "@next/next/google-font-preconnect": "warn",
  
  // 性能相关
  "@next/next/no-sync-scripts": "error",         // 禁止同步脚本
  "@next/next/no-html-link-for-pages": "error",  // 使用next/link
  
  // Head组件
  "@next/next/no-head-import-in-document": "error",
  "@next/next/no-document-import-in-page": "error"
}
```

### 4.4 完整配置示例

```javascript
module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  rules: {
    "@next/next/no-img-element": "off",  // 允许<img>
    "react/display-name": "off"
  }
};
```

## 五、Nuxt.js 项目配置

### 5.1 Nuxt 3 配置

```bash
npm install @nuxt/eslint-config -D
```

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: ["@nuxt/eslint-config"]
};
```

### 5.2 完整配置

```javascript
module.exports = {
  root: true,
  extends: [
    "@nuxt/eslint-config",
    "plugin:vue/vue3-recommended",
    "prettier"
  ],
  rules: {
    "vue/multi-word-component-names": "off",
    "vue/no-multiple-template-root": "off"  // Nuxt 3支持多根节点
  }
};
```

## 六、小程序项目配置

### 6.1 微信小程序

```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es6: true
  },
  globals: {
    // 小程序全局变量
    wx: "readonly",
    App: "readonly",
    Page: "readonly",
    Component: "readonly",
    getApp: "readonly",
    getCurrentPages: "readonly"
  },
  extends: ["eslint:recommended"],
  rules: {
    "no-console": "off"
  }
};
```

### 6.2 Taro 项目

```javascript
module.exports = {
  extends: ["taro/react"],  // 或 "taro/vue3"
  rules: {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off"
  }
};
```

### 6.3 uni-app 项目

```javascript
module.exports = {
  env: {
    browser: true,
    node: true
  },
  globals: {
    uni: "readonly",
    plus: "readonly",
    wx: "readonly"
  },
  extends: [
    "plugin:vue/vue3-recommended"
  ]
};
```

## 七、配置最佳实践

### 7.1 分层配置策略

```
项目根目录/
├── .eslintrc.js          # 基础配置
├── packages/
│   ├── web/
│   │   └── .eslintrc.js  # React 特定配置
│   ├── mobile/
│   │   └── .eslintrc.js  # React Native 配置
│   └── server/
│       └── .eslintrc.js  # Node.js 配置
```

**根配置：**
```javascript
// 根目录 .eslintrc.js
module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  env: { es2021: true }
};
```

**子项目配置：**
```javascript
// packages/web/.eslintrc.js
module.exports = {
  extends: [
    "../../.eslintrc.js",  // 继承根配置
    "plugin:react/recommended"
  ],
  env: { browser: true }
};
```

### 7.2 overrides 精细控制

```javascript
module.exports = {
  extends: ["eslint:recommended"],
  overrides: [
    {
      // React 组件文件
      files: ["src/components/**/*.{jsx,tsx}"],
      extends: ["plugin:react/recommended"],
      rules: {
        "react/prop-types": "off"
      }
    },
    {
      // 测试文件
      files: ["**/*.test.{js,ts}", "**/*.spec.{js,ts}"],
      env: { jest: true },
      rules: {
        "no-console": "off"
      }
    },
    {
      // 配置文件
      files: ["*.config.{js,ts}"],
      env: { node: true }
    }
  ]
};
```

### 7.3 常见问题解决

**问题1：JSX 报错 'React' is not defined**
```javascript
// React 17+ 解决方案
rules: {
  "react/react-in-jsx-scope": "off"
}
```

**问题2：Vue 单词组件名报错**
```javascript
rules: {
  "vue/multi-word-component-names": "off"
}
```

**问题3：TypeScript any 类型报错**
```javascript
rules: {
  "@typescript-eslint/no-explicit-any": "warn"  // 降级为警告
}
```

**问题4：解析 .vue 文件中的 TypeScript 失败**
```javascript
// 确保使用正确的解析器配置
parser: "vue-eslint-parser",
parserOptions: {
  parser: "@typescript-eslint/parser",
  extraFileExtensions: [".vue"]
}
```

## 参考资料

- [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react)
- [eslint-plugin-vue](https://eslint.vuejs.org/)
- [angular-eslint](https://github.com/angular-eslint/angular-eslint)
- [Next.js ESLint](https://nextjs.org/docs/basic-features/eslint)
- [Nuxt ESLint](https://nuxt.com/docs/guide/concepts/code-style)
