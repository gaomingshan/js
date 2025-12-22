# 第 13 章：主流配置预设

## 概述

从零配置 ESLint 规则既耗时又容易遗漏，因此社区涌现出多种经过实践检验的配置预设。选择合适的预设作为起点，再根据团队需求微调，是最高效的配置策略。

## 一、什么是配置预设

### 1.1 预设的本质

配置预设是一组预定义的 ESLint 规则集合，通过 `extends` 字段继承：

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    "eslint:recommended",        // 官方推荐
    "airbnb-base",               // 社区预设
    "plugin:react/recommended"   // 插件预设
  ]
};
```

### 1.2 预设命名规范

```javascript
// npm 包名规范
"eslint-config-airbnb"     // 完整包名
"airbnb"                   // extends 中的简写

"eslint-config-standard"   // 完整包名
"standard"                 // extends 中的简写

// 插件预设
"eslint-plugin-react"      // 插件包
"plugin:react/recommended" // 插件内置预设
```

## 二、官方预设

### 2.1 eslint:recommended

ESLint 内置的推荐规则集，涵盖最基础的代码质量检查：

```javascript
module.exports = {
  extends: ["eslint:recommended"]
};
```

**特点：**
- 仅包含发现潜在错误的规则
- 不包含代码风格规则
- 保守稳定，很少变化
- 适合作为基础层

**包含的典型规则：**
```javascript
{
  "no-debugger": "error",
  "no-dupe-keys": "error",
  "no-unreachable": "error",
  "no-unused-vars": "error",
  "no-undef": "error",
  "use-isnan": "error"
}
```

### 2.2 eslint:all

启用所有 ESLint 规则（不推荐直接使用）：

```javascript
// ⚠️ 仅用于测试或探索规则
module.exports = {
  extends: ["eslint:all"]
};
```

> **⚠️ 警告**  
> `eslint:all` 会启用所有规则，包括相互冲突的规则，实际项目中不应使用。

## 三、Airbnb 配置

### 3.1 概述

Airbnb 配置是最流行的社区预设之一，以严格著称：

```bash
# 基础版（纯 JavaScript）
npm install eslint-config-airbnb-base eslint-plugin-import -D

# 完整版（含 React）
npm install eslint-config-airbnb eslint-plugin-import eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y -D
```

### 3.2 配置使用

```javascript
// 纯 JavaScript 项目
module.exports = {
  extends: ["airbnb-base"]
};

// React 项目
module.exports = {
  extends: ["airbnb"]
};

// React + TypeScript
module.exports = {
  extends: [
    "airbnb",
    "airbnb-typescript"
  ],
  parserOptions: {
    project: "./tsconfig.json"
  }
};
```

### 3.3 核心规则特点

```javascript
// Airbnb 典型规则
{
  // 强制要求
  "semi": ["error", "always"],           // 必须分号
  "quotes": ["error", "single"],         // 单引号
  "indent": ["error", 2],                // 2空格缩进
  "comma-dangle": ["error", "always-multiline"], // 尾逗号
  
  // 严格限制
  "no-plusplus": "error",                // 禁止++/--
  "no-param-reassign": "error",          // 禁止修改参数
  "prefer-destructuring": "error",       // 强制解构
  "import/prefer-default-export": "error" // 优先默认导出
}
```

### 3.4 常见调整

```javascript
module.exports = {
  extends: ["airbnb-base"],
  rules: {
    // 放宽过严规则
    "no-plusplus": "off",                    // 允许++
    "no-param-reassign": ["error", {         // 允许修改props属性
      "props": true,
      "ignorePropertyModificationsFor": ["state", "acc", "e"]
    }],
    "import/prefer-default-export": "off",   // 允许命名导出
    "no-underscore-dangle": "off",           // 允许下划线
    
    // 调整换行规则
    "implicit-arrow-linebreak": "off",
    "function-paren-newline": "off"
  }
};
```

## 四、Standard 配置

### 4.1 概述

Standard 以"零配置"为卖点，主张无需任何配置即可使用：

```bash
npm install eslint-config-standard eslint-plugin-import eslint-plugin-n eslint-plugin-promise -D
```

### 4.2 配置使用

```javascript
module.exports = {
  extends: ["standard"]
};

// TypeScript 版本
module.exports = {
  extends: ["standard-with-typescript"],
  parserOptions: {
    project: "./tsconfig.json"
  }
};
```

### 4.3 核心规则特点

```javascript
// Standard 典型规则
{
  // 风格特点
  "semi": ["error", "never"],            // 无分号
  "quotes": ["error", "single"],         // 单引号
  "indent": ["error", 2],                // 2空格
  "comma-dangle": ["error", "never"],    // 无尾逗号
  "space-before-function-paren": ["error", "always"], // 函数括号前空格
  
  // 宽松限制
  "no-unused-vars": ["error", {
    "args": "none"                       // 允许未使用参数
  }]
}
```

### 4.4 Airbnb vs Standard

| 方面 | Airbnb | Standard |
|------|--------|----------|
| 分号 | 必须 | 禁止 |
| 尾逗号 | 多行必须 | 禁止 |
| 函数括号空格 | 无空格 | 有空格 |
| 严格程度 | 非常严格 | 相对宽松 |
| 规则数量 | 多 | 少 |
| 适用场景 | 大型团队 | 快速开发 |

## 五、Google 配置

### 5.1 概述

Google JavaScript 风格指南的 ESLint 实现：

```bash
npm install eslint-config-google -D
```

### 5.2 配置使用

```javascript
module.exports = {
  extends: ["google"],
  parserOptions: {
    ecmaVersion: 2020
  }
};
```

### 5.3 核心规则特点

```javascript
// Google 典型规则
{
  "indent": ["error", 2],
  "quotes": ["error", "single"],
  "semi": ["error", "always"],
  "max-len": ["error", { "code": 80 }],        // 80字符限制
  "require-jsdoc": "error",                    // 要求JSDoc
  "valid-jsdoc": "error",                      // JSDoc格式检查
  "camelcase": "error"                         // 驼峰命名
}
```

## 六、框架专用预设

### 6.1 React 预设

```javascript
// 安装
// npm install eslint-plugin-react eslint-plugin-react-hooks -D

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  settings: {
    react: {
      version: "detect"
    }
  }
};
```

### 6.2 Vue 预设

```javascript
// 安装
// npm install eslint-plugin-vue -D

// Vue 3
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended"
  ]
};

// Vue 2
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:vue/recommended"
  ]
};
```

**Vue 预设级别：**
```javascript
// 严格程度递增
"plugin:vue/vue3-essential"     // 防止错误
"plugin:vue/vue3-strongly-recommended"  // 提高可读性
"plugin:vue/vue3-recommended"   // 社区最佳实践
```

### 6.3 Node.js 预设

```javascript
// 安装
// npm install eslint-plugin-n -D

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:n/recommended"
  ],
  env: {
    node: true
  }
};
```

## 七、TypeScript 预设

### 7.1 官方推荐配置

```bash
npm install @typescript-eslint/parser @typescript-eslint/eslint-plugin -D
```

```javascript
module.exports = {
  parser: "@typescript-eslint/parser",
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

### 7.2 严格模式

```javascript
module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict"
  ],
  parserOptions: {
    project: "./tsconfig.json"
  }
};
```

**预设级别对比：**

| 预设 | 说明 |
|------|------|
| `recommended` | 基础推荐规则 |
| `recommended-requiring-type-checking` | 需要类型信息的规则 |
| `strict` | 更严格的最佳实践 |

## 八、预设组合策略

### 8.1 推荐组合顺序

```javascript
module.exports = {
  extends: [
    // 1. ESLint 基础
    "eslint:recommended",
    
    // 2. TypeScript 规则
    "plugin:@typescript-eslint/recommended",
    
    // 3. 框架规则
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    
    // 4. 社区预设（可选）
    "airbnb-typescript",
    
    // 5. Prettier（必须最后）
    "prettier"
  ]
};
```

### 8.2 完整项目示例

**React + TypeScript 项目：**

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
    "react/react-in-jsx-scope": "off",  // React 17+
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
};
```

**Vue 3 + TypeScript 项目：**

```javascript
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

## 九、选择建议

### 9.1 决策树

```
你的项目类型？
├─ 纯 JavaScript
│  ├─ 追求严格 → Airbnb-base
│  └─ 追求简洁 → Standard
├─ TypeScript
│  └─ @typescript-eslint/recommended + 框架预设
├─ React
│  ├─ 大型团队 → Airbnb
│  └─ 中小团队 → plugin:react/recommended
└─ Vue
   └─ plugin:vue/vue3-recommended
```

### 9.2 团队建议

| 团队规模 | 推荐策略 |
|----------|----------|
| 个人项目 | Standard 或 eslint:recommended |
| 小团队 | eslint:recommended + 框架预设 |
| 中型团队 | Airbnb 或定制配置 |
| 大型团队 | 基于 Airbnb 定制 + 发布为私有包 |

### 9.3 迁移策略

```javascript
// 阶段1：最小配置
extends: ["eslint:recommended"]

// 阶段2：添加框架支持
extends: ["eslint:recommended", "plugin:react/recommended"]

// 阶段3：引入社区预设
extends: ["airbnb", "prettier"]

// 阶段4：团队定制
extends: ["@mycompany/eslint-config"]
```

## 参考资料

- [eslint-config-airbnb](https://github.com/airbnb/javascript)
- [eslint-config-standard](https://github.com/standard/eslint-config-standard)
- [eslint-config-google](https://github.com/google/eslint-config-google)
- [typescript-eslint](https://typescript-eslint.io/)
- [eslint-plugin-vue](https://eslint.vuejs.org/)
