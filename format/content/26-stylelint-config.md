# 第 26 章：Stylelint 配置详解

## 概述

Stylelint 是现代 CSS 代码检查工具，能够帮助避免错误并强制执行样式约定。本章详细介绍 Stylelint 的配置方法、核心规则及与预处理器的集成。

## 一、安装与基础配置

### 1.1 安装

```bash
npm install stylelint stylelint-config-standard -D
```

### 1.2 配置文件格式

按优先级排序：

```
1. package.json 中的 "stylelint" 字段
2. .stylelintrc（JSON 或 YAML）
3. .stylelintrc.json
4. .stylelintrc.yaml / .stylelintrc.yml
5. .stylelintrc.js / .stylelintrc.cjs
6. stylelint.config.js / stylelint.config.cjs
```

### 1.3 基础配置示例

```json
// .stylelintrc.json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "color-hex-length": "long",
    "selector-class-pattern": null
  }
}
```

```javascript
// stylelint.config.js
module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'color-hex-length': 'long'
  }
};
```

## 二、配置字段详解

### 2.1 extends（继承配置）

```javascript
{
  // 单个配置
  "extends": "stylelint-config-standard",
  
  // 多个配置（后者优先级高）
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-prettier"
  ]
}
```

**常用预设配置：**

| 配置包 | 说明 |
|--------|------|
| `stylelint-config-standard` | 官方推荐规则 |
| `stylelint-config-recommended` | 基础推荐规则 |
| `stylelint-config-standard-scss` | SCSS 标准规则 |
| `stylelint-config-prettier` | 关闭与 Prettier 冲突的规则 |

### 2.2 plugins（插件）

```javascript
{
  "plugins": [
    "stylelint-scss",
    "stylelint-order"
  ],
  "rules": {
    "scss/dollar-variable-pattern": "^[a-z][a-zA-Z0-9]+$",
    "order/properties-alphabetical-order": true
  }
}
```

### 2.3 rules（规则）

```javascript
{
  "rules": {
    // 关闭规则
    "color-named": null,
    
    // 警告级别
    "max-nesting-depth": [3, { "severity": "warning" }],
    
    // 错误级别（默认）
    "color-no-invalid-hex": true,
    
    // 带选项的规则
    "selector-max-id": [0, { "message": "禁止使用 ID 选择器" }]
  }
}
```

**规则级别：**
- `true`：启用规则（错误级别）
- `null`：禁用规则
- `[value, options]`：带选项的规则配置

### 2.4 overrides（覆盖配置）

```javascript
{
  "extends": ["stylelint-config-standard"],
  "overrides": [
    {
      "files": ["*.scss", "**/*.scss"],
      "extends": ["stylelint-config-standard-scss"]
    },
    {
      "files": ["*.vue", "**/*.vue"],
      "customSyntax": "postcss-html"
    }
  ]
}
```

### 2.5 ignoreFiles（忽略文件）

```javascript
{
  "ignoreFiles": [
    "node_modules/**",
    "dist/**",
    "**/*.min.css",
    "vendor/**"
  ]
}
```

或使用 `.stylelintignore`：

```gitignore
# .stylelintignore
node_modules/
dist/
*.min.css
```

### 2.6 customSyntax（自定义语法）

```javascript
{
  // 全局设置
  "customSyntax": "postcss-scss",
  
  // 或在 overrides 中针对特定文件
  "overrides": [
    {
      "files": ["*.vue"],
      "customSyntax": "postcss-html"
    }
  ]
}
```

## 三、常用规则分类

### 3.1 可能的错误

```javascript
rules: {
  // 颜色
  "color-no-invalid-hex": true,                    // 禁止无效的十六进制颜色
  
  // 字体
  "font-family-no-duplicate-names": true,          // 禁止重复字体名
  "font-family-no-missing-generic-family-keyword": true, // 必须有通用字体族
  
  // 函数
  "function-calc-no-unspaced-operator": true,      // calc中运算符需要空格
  "function-linear-gradient-no-nonstandard-direction": true, // 标准渐变方向
  
  // 字符串
  "string-no-newline": true,                       // 字符串禁止换行
  
  // 选择器
  "selector-pseudo-class-no-unknown": true,        // 禁止未知伪类
  "selector-pseudo-element-no-unknown": true,      // 禁止未知伪元素
  "selector-type-no-unknown": true,                // 禁止未知类型选择器
  
  // 媒体查询
  "media-feature-name-no-unknown": true,           // 禁止未知媒体特性
  
  // 通用
  "no-duplicate-selectors": true,                  // 禁止重复选择器
  "no-empty-source": true,                         // 禁止空源文件
  "no-invalid-double-slash-comments": true         // 禁止无效双斜杠注释
}
```

### 3.2 限制约束

```javascript
rules: {
  // 颜色
  "color-named": "never",                          // 禁止命名颜色
  "color-no-hex": null,                            // 允许十六进制颜色
  
  // 选择器
  "selector-max-id": 0,                            // 禁止ID选择器
  "selector-max-class": 4,                         // 最多4个类选择器
  "selector-max-compound-selectors": 4,            // 最大复合选择器数
  "selector-max-specificity": "0,4,0",             // 最大特异性
  "selector-no-qualifying-type": true,             // 禁止类型限定选择器
  
  // 声明
  "declaration-no-important": true,                // 禁止!important
  "declaration-block-single-line-max-declarations": 1, // 单行最多声明数
  
  // 嵌套
  "max-nesting-depth": 3,                          // 最大嵌套深度
  
  // 属性
  "property-disallowed-list": ["float"],           // 禁止的属性
  "property-allowed-list": null                    // 允许的属性（白名单）
}
```

### 3.3 风格规则

```javascript
rules: {
  // 颜色
  "color-hex-case": "lower",                       // 十六进制小写
  "color-hex-length": "short",                     // 十六进制简写
  
  // 字体
  "font-family-name-quotes": "always-where-recommended", // 字体引号
  "font-weight-notation": "numeric",               // 字体粗细数字表示
  
  // 函数
  "function-name-case": "lower",                   // 函数名小写
  "function-url-quotes": "always",                 // URL引号
  
  // 数值
  "number-leading-zero": "always",                 // 小数点前的零
  "number-no-trailing-zeros": true,                // 禁止尾随零
  
  // 字符串
  "string-quotes": "single",                       // 字符串引号
  
  // 单位
  "length-zero-no-unit": true,                     // 零值无单位
  
  // 选择器
  "selector-attribute-quotes": "always",           // 属性选择器引号
  "selector-pseudo-element-colon-notation": "double", // 伪元素双冒号
  "selector-type-case": "lower"                    // 类型选择器小写
}
```

### 3.4 命名规则

```javascript
rules: {
  // 选择器命名模式（BEM风格）
  "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$",
  
  // ID选择器命名
  "selector-id-pattern": "^[a-z][a-zA-Z0-9]+$",
  
  // 关键帧命名
  "keyframes-name-pattern": "^[a-z][a-zA-Z0-9]+$",
  
  // 自定义属性命名
  "custom-property-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$"
}
```

## 四、预设配置

### 4.1 stylelint-config-standard

```bash
npm install stylelint-config-standard -D
```

```json
{
  "extends": ["stylelint-config-standard"]
}
```

**包含的规则特点：**
- 检测可能的错误
- 强制一致的代码风格
- 基于社区最佳实践

### 4.2 stylelint-config-recommended

更宽松的推荐配置：

```bash
npm install stylelint-config-recommended -D
```

```json
{
  "extends": ["stylelint-config-recommended"]
}
```

### 4.3 与 Prettier 集成

```bash
npm install stylelint-config-prettier -D
```

```json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-prettier"  // 放最后
  ]
}
```

## 五、属性排序

### 5.1 使用 stylelint-order

```bash
npm install stylelint-order -D
```

```javascript
// stylelint.config.js
module.exports = {
  plugins: ['stylelint-order'],
  rules: {
    'order/properties-order': [
      // 布局
      'display',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      
      // 盒模型
      'width',
      'height',
      'margin',
      'padding',
      
      // 视觉
      'background',
      'border',
      'color',
      
      // 文字
      'font',
      'text-align',
      'line-height',
      
      // 其他
      'transition',
      'animation'
    ]
  }
};
```

### 5.2 使用预设排序

```bash
npm install stylelint-config-recess-order -D
```

```json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-recess-order"
  ]
}
```

## 六、完整配置示例

### 6.1 纯 CSS 项目

```json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-prettier"
  ],
  "rules": {
    "color-hex-length": "long",
    "selector-class-pattern": null,
    "no-descending-specificity": null
  }
}
```

### 6.2 SCSS 项目

```bash
npm install stylelint-config-standard-scss -D
```

```json
{
  "extends": [
    "stylelint-config-standard-scss",
    "stylelint-config-prettier"
  ],
  "rules": {
    "scss/dollar-variable-pattern": "^[a-z][a-zA-Z0-9]+$",
    "scss/at-mixin-pattern": "^[a-z][a-zA-Z0-9]+$",
    "max-nesting-depth": 4
  }
}
```

### 6.3 Vue 项目

```bash
npm install postcss-html -D
```

```json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-prettier"
  ],
  "overrides": [
    {
      "files": ["*.vue", "**/*.vue"],
      "customSyntax": "postcss-html"
    }
  ]
}
```

### 6.4 React + CSS Modules

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "selector-class-pattern": "^[a-z][a-zA-Z0-9]+$",
    "value-keyword-case": ["lower", {
      "camelCaseSvgKeywords": true
    }]
  }
}
```

## 七、命令行使用

### 7.1 基础命令

```bash
# 检查文件
npx stylelint "src/**/*.css"

# 修复问题
npx stylelint "src/**/*.css" --fix

# 检查SCSS
npx stylelint "src/**/*.scss"

# 指定配置文件
npx stylelint "src/**/*.css" --config .stylelintrc.json
```

### 7.2 npm scripts

```json
{
  "scripts": {
    "lint:css": "stylelint \"src/**/*.{css,scss,vue}\"",
    "lint:css:fix": "stylelint \"src/**/*.{css,scss,vue}\" --fix"
  }
}
```

## 八、常见问题

### 8.1 Unknown word 错误

```javascript
// 处理 CSS-in-JS 或特殊语法
{
  "rules": {
    "no-invalid-double-slash-comments": null
  }
}
```

### 8.2 与 Tailwind CSS 冲突

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

### 8.3 忽略特定行

```css
/* stylelint-disable-next-line declaration-no-important */
.override {
  color: red !important;
}

/* stylelint-disable */
.legacy {
  float: left;
}
/* stylelint-enable */
```

## 参考资料

- [Stylelint 官方文档](https://stylelint.io/)
- [Stylelint 规则列表](https://stylelint.io/user-guide/rules)
- [stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard)
- [stylelint-order](https://github.com/hudochenkov/stylelint-order)
