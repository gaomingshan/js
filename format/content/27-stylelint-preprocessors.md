# 第 27 章：处理预处理器

## 概述

CSS 预处理器（如 SCSS、Less、Stylus）扩展了 CSS 的能力，但也带来了额外的语法需要检查。本章介绍如何配置 Stylelint 以支持各种预处理器，确保样式代码质量。

## 一、SCSS 支持

### 1.1 安装配置

```bash
npm install stylelint-config-standard-scss -D
```

```json
// .stylelintrc.json
{
  "extends": ["stylelint-config-standard-scss"]
}
```

### 1.2 SCSS 专用规则

```javascript
{
  "extends": ["stylelint-config-standard-scss"],
  "rules": {
    // 变量命名
    "scss/dollar-variable-pattern": "^[a-z][a-zA-Z0-9]+$",
    "scss/dollar-variable-colon-space-after": "always",
    "scss/dollar-variable-colon-space-before": "never",
    
    // Mixin
    "scss/at-mixin-pattern": "^[a-z][a-zA-Z0-9]+$",
    "scss/at-mixin-argumentless-call-parentheses": "never",
    
    // 函数
    "scss/at-function-pattern": "^[a-z][a-zA-Z0-9]+$",
    
    // 导入
    "scss/at-import-partial-extension": "never",
    "scss/at-import-no-partial-leading-underscore": true,
    
    // 选择器
    "scss/selector-no-redundant-nesting-selector": true,
    
    // 注释
    "scss/double-slash-comment-whitespace-inside": "always",
    
    // 操作符
    "scss/operator-no-unspaced": true
  }
}
```

### 1.3 常用 SCSS 规则说明

| 规则 | 说明 | 示例 |
|------|------|------|
| `scss/dollar-variable-pattern` | 变量命名规则 | `$primaryColor` |
| `scss/at-mixin-pattern` | mixin 命名规则 | `@mixin flexCenter` |
| `scss/no-duplicate-mixins` | 禁止重复 mixin | - |
| `scss/no-global-function-names` | 禁止全局函数 | 使用 `math.div()` |
| `scss/at-extend-no-missing-placeholder` | extend 必须是占位符 | `@extend %placeholder` |

### 1.4 SCSS 嵌套控制

```javascript
{
  "rules": {
    // 最大嵌套深度
    "max-nesting-depth": [3, {
      "ignore": ["pseudo-classes"],
      "ignoreAtRules": ["media", "include"]
    }],
    
    // 禁止冗余嵌套选择器
    "scss/selector-no-redundant-nesting-selector": true
  }
}
```

```scss
// ❌ 冗余嵌套
.parent {
  & .child { }  // & 是冗余的
}

// ✅ 正确写法
.parent {
  .child { }
}

// ✅ 必要的 & 使用
.button {
  &:hover { }
  &--primary { }
}
```

## 二、Less 支持

### 2.1 安装配置

```bash
npm install postcss-less -D
```

```json
{
  "extends": ["stylelint-config-standard"],
  "customSyntax": "postcss-less"
}
```

### 2.2 Less 特有配置

```javascript
{
  "extends": ["stylelint-config-standard"],
  "customSyntax": "postcss-less",
  "rules": {
    // 禁用与 Less 冲突的规则
    "no-invalid-double-slash-comments": null,
    "no-descending-specificity": null,
    
    // 函数相关
    "function-no-unknown": [true, {
      "ignoreFunctions": ["fade", "darken", "lighten", "saturate"]
    }],
    
    // 选择器
    "selector-class-pattern": null
  }
}
```

### 2.3 Less 变量和混合

```less
// 变量
@primary-color: #3498db;
@font-size-base: 14px;

// 混合
.flex-center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  .flex-center();
  color: @primary-color;
}
```

## 三、PostCSS 支持

### 3.1 现代 CSS 特性

```bash
npm install postcss -D
```

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    // 允许自定义属性
    "custom-property-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    
    // 允许 CSS 变量
    "value-keyword-case": ["lower", {
      "ignoreKeywords": ["currentColor"]
    }]
  }
}
```

### 3.2 CSS Modules

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    // CSS Modules 使用 camelCase 类名
    "selector-class-pattern": "^[a-z][a-zA-Z0-9]+$",
    
    // 允许 :global 和 :local
    "selector-pseudo-class-no-unknown": [true, {
      "ignorePseudoClasses": ["global", "local"]
    }]
  }
}
```

### 3.3 CSS-in-JS

```bash
npm install postcss-syntax @stylelint/postcss-css-in-js -D
```

```json
{
  "extends": ["stylelint-config-standard"],
  "overrides": [
    {
      "files": ["*.js", "*.jsx", "*.ts", "*.tsx"],
      "customSyntax": "@stylelint/postcss-css-in-js"
    }
  ]
}
```

## 四、Vue 单文件组件

### 4.1 基础配置

```bash
npm install postcss-html -D
```

```json
{
  "extends": ["stylelint-config-standard"],
  "overrides": [
    {
      "files": ["*.vue", "**/*.vue"],
      "customSyntax": "postcss-html"
    }
  ]
}
```

### 4.2 Vue + SCSS

```json
{
  "extends": ["stylelint-config-standard-scss"],
  "overrides": [
    {
      "files": ["*.vue", "**/*.vue"],
      "customSyntax": "postcss-html"
    }
  ],
  "rules": {
    "selector-class-pattern": null
  }
}
```

### 4.3 处理 scoped 样式

```json
{
  "rules": {
    // 忽略 Vue scoped 生成的属性选择器
    "selector-pseudo-class-no-unknown": [true, {
      "ignorePseudoClasses": ["deep", "global", "slotted"]
    }]
  }
}
```

```vue
<style scoped>
/* Vue 3 深度选择器 */
:deep(.child) {
  color: red;
}

/* Vue 2 深度选择器 */
::v-deep .child {
  color: red;
}
</style>
```

## 五、React 样式

### 5.1 CSS Modules

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "selector-class-pattern": "^[a-z][a-zA-Z0-9]+$"
  }
}
```

### 5.2 styled-components

```bash
npm install postcss-styled-syntax -D
```

```json
{
  "extends": ["stylelint-config-standard"],
  "overrides": [
    {
      "files": ["*.js", "*.jsx", "*.ts", "*.tsx"],
      "customSyntax": "postcss-styled-syntax"
    }
  ]
}
```

```javascript
// 可以检查的代码
const Button = styled.button`
  display: flex;
  padding: 8px 16px;
  background-color: #3498db;
`;
```

### 5.3 Emotion

同样使用 `postcss-styled-syntax`：

```javascript
import { css } from '@emotion/react';

const style = css`
  display: flex;
  align-items: center;
`;
```

## 六、Tailwind CSS

### 6.1 安装配置

```bash
npm install stylelint-config-tailwindcss -D
```

```json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-tailwindcss"
  ]
}
```

### 6.2 处理 @apply 指令

```json
{
  "rules": {
    "at-rule-no-unknown": [true, {
      "ignoreAtRules": [
        "tailwind",
        "apply",
        "variants",
        "responsive",
        "screen",
        "layer"
      ]
    }]
  }
}
```

```css
/* Tailwind CSS */
@tailwind base;
@tailwind components;
@tailwind utilities;

.btn {
  @apply px-4 py-2 bg-blue-500 text-white rounded;
}
```

## 七、Angular 样式

### 7.1 组件样式

```json
{
  "extends": ["stylelint-config-standard"],
  "overrides": [
    {
      "files": ["*.scss"],
      "extends": ["stylelint-config-standard-scss"]
    }
  ],
  "rules": {
    // 允许 :host 和 ::ng-deep
    "selector-pseudo-element-no-unknown": [true, {
      "ignorePseudoElements": ["ng-deep"]
    }],
    "selector-pseudo-class-no-unknown": [true, {
      "ignorePseudoClasses": ["host", "host-context"]
    }]
  }
}
```

### 7.2 处理 ::ng-deep

```scss
// Angular 组件样式
:host {
  display: block;
}

::ng-deep .child-component {
  color: red;
}
```

## 八、Svelte 样式

### 8.1 配置

```bash
npm install postcss-html -D
```

```json
{
  "extends": ["stylelint-config-standard"],
  "overrides": [
    {
      "files": ["*.svelte"],
      "customSyntax": "postcss-html"
    }
  ]
}
```

### 8.2 处理 :global

```json
{
  "rules": {
    "selector-pseudo-class-no-unknown": [true, {
      "ignorePseudoClasses": ["global"]
    }]
  }
}
```

## 九、完整配置示例

### 9.1 大型项目配置

```javascript
// stylelint.config.js
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-prettier'
  ],
  plugins: ['stylelint-order'],
  rules: {
    // 属性排序
    'order/properties-alphabetical-order': true,
    
    // 通用规则
    'color-hex-length': 'long',
    'max-nesting-depth': 4,
    'selector-max-id': 0,
    'declaration-no-important': true
  },
  overrides: [
    // SCSS 文件
    {
      files: ['*.scss', '**/*.scss'],
      extends: ['stylelint-config-standard-scss'],
      rules: {
        'scss/dollar-variable-pattern': '^[a-z][a-zA-Z0-9]+$'
      }
    },
    // Vue 文件
    {
      files: ['*.vue', '**/*.vue'],
      customSyntax: 'postcss-html',
      rules: {
        'selector-class-pattern': null
      }
    },
    // CSS-in-JS
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      customSyntax: 'postcss-styled-syntax'
    }
  ],
  ignoreFiles: [
    'node_modules/**',
    'dist/**',
    '**/*.min.css'
  ]
};
```

### 9.2 Monorepo 配置

```javascript
// 根目录 stylelint.config.js
module.exports = {
  extends: ['stylelint-config-standard'],
  overrides: [
    {
      files: ['packages/web/**/*.scss'],
      extends: ['stylelint-config-standard-scss']
    },
    {
      files: ['packages/mobile/**/*.css'],
      rules: {
        'selector-class-pattern': null
      }
    }
  ]
};
```

## 十、常见问题

### 10.1 CssSyntaxError

```
CssSyntaxError: Unknown word
```

**解决：** 配置正确的 `customSyntax`

```json
{
  "customSyntax": "postcss-scss"
}
```

### 10.2 Unknown at-rule

```
Unexpected unknown at-rule "@include"
```

**解决：** 使用 SCSS 配置

```json
{
  "extends": ["stylelint-config-standard-scss"]
}
```

### 10.3 Function 未知错误

```json
{
  "rules": {
    "function-no-unknown": [true, {
      "ignoreFunctions": ["theme", "screen"]
    }]
  }
}
```

### 10.4 禁用特定文件检查

```css
/* stylelint-disable */
.legacy-code {
  float: left;
}
/* stylelint-enable */

/* 或禁用特定规则 */
/* stylelint-disable declaration-no-important */
.override {
  color: red !important;
}
```

## 参考资料

- [Stylelint 自定义语法](https://stylelint.io/user-guide/configure#customsyntax)
- [stylelint-config-standard-scss](https://github.com/stylelint-scss/stylelint-config-standard-scss)
- [postcss-html](https://github.com/gucong3000/postcss-html)
- [postcss-styled-syntax](https://github.com/hudochenkov/postcss-styled-syntax)
