# 第 29 章：与设计系统集成

## 概述

设计系统为产品提供一致的视觉语言和组件规范。将 Stylelint 与设计系统集成，可以自动化检查样式是否符合设计规范，确保设计到代码的一致性。

## 一、设计系统与代码规范的关系

### 1.1 设计系统的组成

```
设计系统
├── 设计令牌 (Design Tokens)
│   ├── 颜色
│   ├── 字体
│   ├── 间距
│   └── 阴影
├── 组件规范
│   ├── 按钮
│   ├── 表单
│   └── 卡片
└── 使用指南
    ├── 布局规则
    └── 交互模式
```

### 1.2 代码规范的作用

| 设计系统规范 | 对应的 Stylelint 规则 |
|--------------|----------------------|
| 颜色值限制 | `color-named`, `color-no-hex` |
| 字体规范 | `font-family-name-quotes` |
| 间距系统 | 自定义规则检查值 |
| 组件命名 | `selector-class-pattern` |

## 二、设计令牌集成

### 2.1 定义设计令牌

```scss
// tokens/_colors.scss
$color-primary: #3498db;
$color-primary-light: #5dade2;
$color-primary-dark: #2980b9;

$color-success: #2ecc71;
$color-warning: #f39c12;
$color-error: #e74c3c;

$color-gray-100: #f7f9fc;
$color-gray-200: #edf2f7;
$color-gray-300: #e2e8f0;
$color-gray-400: #cbd5e0;
$color-gray-500: #a0aec0;
```

```scss
// tokens/_spacing.scss
$spacing-unit: 4px;
$spacing-xs: $spacing-unit;      // 4px
$spacing-sm: $spacing-unit * 2;  // 8px
$spacing-md: $spacing-unit * 4;  // 16px
$spacing-lg: $spacing-unit * 6;  // 24px
$spacing-xl: $spacing-unit * 8;  // 32px
```

### 2.2 CSS 变量方式

```css
:root {
  /* Colors */
  --color-primary: #3498db;
  --color-primary-light: #5dade2;
  --color-primary-dark: #2980b9;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}
```

### 2.3 Stylelint 验证令牌

```javascript
// stylelint.config.js
module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    // 禁止直接使用颜色值，强制使用变量
    'color-named': 'never',
    
    // 自定义属性命名规范
    'custom-property-pattern': '^(color|spacing|font|radius|shadow)-[a-z]+(-[a-z0-9]+)*$',
    
    // 禁止硬编码的像素值（通过插件或自定义规则）
    'declaration-property-value-allowed-list': {
      '/^margin/': ['/^var\\(--spacing/'],
      '/^padding/': ['/^var\\(--spacing/'],
      'font-size': ['/^var\\(--font-size/']
    }
  }
};
```

## 三、颜色规范

### 3.1 颜色值限制

```javascript
{
  "rules": {
    // 禁止命名颜色
    "color-named": "never",
    
    // 十六进制颜色规范
    "color-hex-case": "lower",
    "color-hex-length": "long",
    
    // 禁止无效颜色
    "color-no-invalid-hex": true
  }
}
```

### 3.2 使用 stylelint-declaration-strict-value

```bash
npm install stylelint-declaration-strict-value -D
```

```javascript
{
  "plugins": ["stylelint-declaration-strict-value"],
  "rules": {
    "scale-unlimited/declaration-strict-value": [
      ["/color$/", "fill", "stroke"],
      {
        "ignoreValues": ["currentColor", "inherit", "transparent"]
      }
    ]
  }
}
```

```css
/* ❌ 报错 */
.element {
  color: #333;
  background-color: red;
}

/* ✅ 通过 */
.element {
  color: var(--color-text);
  background-color: var(--color-primary);
}
```

## 四、间距规范

### 4.1 间距系统

```scss
// 4px 基础单位系统
$spacing-scale: (
  '0': 0,
  '1': 4px,
  '2': 8px,
  '3': 12px,
  '4': 16px,
  '5': 20px,
  '6': 24px,
  '8': 32px,
  '10': 40px,
  '12': 48px,
  '16': 64px
);
```

### 4.2 验证间距值

```javascript
{
  "plugins": ["stylelint-declaration-strict-value"],
  "rules": {
    "scale-unlimited/declaration-strict-value": [
      ["margin", "padding", "gap"],
      {
        "ignoreValues": ["0", "auto", "inherit"]
      }
    ]
  }
}
```

## 五、字体规范

### 5.1 字体系统

```css
:root {
  /* Font Family */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', Consolas, monospace;
  
  /* Font Size */
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  
  /* Font Weight */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Height */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### 5.2 字体规则配置

```javascript
{
  "rules": {
    "font-family-name-quotes": "always-where-recommended",
    "font-family-no-duplicate-names": true,
    "font-family-no-missing-generic-family-keyword": true,
    "font-weight-notation": "numeric"
  }
}
```

## 六、组件样式规范

### 6.1 按钮组件规范

```scss
// components/_button.scss
.btn {
  // 基础样式
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: all 0.2s;
  
  // 尺寸变体
  &--sm {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
  
  &--lg {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-base);
  }
  
  // 颜色变体
  &--primary {
    background: var(--color-primary);
    color: white;
  }
  
  &--secondary {
    background: var(--color-gray-200);
    color: var(--color-gray-700);
  }
}
```

### 6.2 组件命名规则

```javascript
{
  "rules": {
    "selector-class-pattern": [
      // 组件: btn, card, modal 等
      // 修饰符: --primary, --sm 等
      "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$",
      {
        "message": "组件类名应遵循 BEM 规范"
      }
    ]
  }
}
```

## 七、响应式设计规范

### 7.1 断点系统

```scss
// tokens/_breakpoints.scss
$breakpoints: (
  'sm': 640px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px,
  '2xl': 1536px
);

@mixin respond-to($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}
```

### 7.2 媒体查询规范

```javascript
{
  "rules": {
    "media-feature-name-no-unknown": true,
    "media-feature-range-notation": "prefix"
  }
}
```

```css
/* 规范的媒体查询 */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}
```

## 八、设计系统工具集成

### 8.1 Style Dictionary

将设计令牌转换为多平台格式：

```json
// tokens.json
{
  "color": {
    "primary": {
      "value": "#3498db",
      "type": "color"
    },
    "secondary": {
      "value": "#2ecc71",
      "type": "color"
    }
  },
  "spacing": {
    "sm": {
      "value": "8px",
      "type": "spacing"
    },
    "md": {
      "value": "16px",
      "type": "spacing"
    }
  }
}
```

```javascript
// style-dictionary.config.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables'
      }]
    },
    scss: {
      transformGroup: 'scss',
      buildPath: 'build/scss/',
      files: [{
        destination: '_variables.scss',
        format: 'scss/variables'
      }]
    }
  }
};
```

### 8.2 Figma 令牌同步

```javascript
// 使用 Figma Tokens 插件导出
// 生成 tokens.json 后使用 Style Dictionary 转换
```

## 九、完整配置示例

### 9.1 设计系统 Stylelint 配置

```javascript
// stylelint.config.js
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-prettier'
  ],
  plugins: [
    'stylelint-order',
    'stylelint-declaration-strict-value'
  ],
  rules: {
    // 强制使用设计令牌
    'scale-unlimited/declaration-strict-value': [
      ['/color$/', 'fill', 'stroke', 'background-color'],
      {
        ignoreValues: ['currentColor', 'inherit', 'transparent', 'none']
      }
    ],
    
    // 颜色规范
    'color-named': 'never',
    'color-hex-case': 'lower',
    
    // 字体规范
    'font-family-no-missing-generic-family-keyword': true,
    'font-weight-notation': 'numeric',
    
    // 命名规范
    'selector-class-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+)?(--[a-z0-9]+)?$',
    'custom-property-pattern': '^(color|spacing|font|radius|shadow|z)-[a-z]+(-[a-z0-9]+)*$',
    
    // 属性排序
    'order/properties-order': [
      'display',
      'position',
      'top', 'right', 'bottom', 'left',
      'width', 'height',
      'margin', 'padding',
      'background', 'border',
      'font', 'color'
    ],
    
    // 限制
    'selector-max-id': 0,
    'max-nesting-depth': 3,
    'declaration-no-important': true
  }
};
```

### 9.2 CI 验证

```yaml
# .github/workflows/design-system.yml
name: Design System Check

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm ci
      
      - name: Stylelint Check
        run: npx stylelint "src/**/*.{css,scss}"
      
      - name: Build Design Tokens
        run: npx style-dictionary build
```

## 十、最佳实践

### 10.1 设计与开发协作

```
1. 设计师在 Figma 中定义令牌
2. 使用 Figma Tokens 导出 JSON
3. Style Dictionary 转换为 CSS/SCSS
4. Stylelint 验证代码使用正确的令牌
5. CI 自动化检查
```

### 10.2 文档化

```markdown
# 设计系统使用指南

## 颜色
- 主色调: `var(--color-primary)`
- 禁止直接使用十六进制颜色值

## 间距
- 使用 4px 倍数系统
- 可用值: xs(4px), sm(8px), md(16px), lg(24px), xl(32px)

## 组件
- 遵循 BEM 命名规范
- 组件样式必须使用设计令牌
```

## 参考资料

- [Style Dictionary](https://amzn.github.io/style-dictionary/)
- [Design Tokens](https://www.designtokens.org/)
- [Figma Tokens](https://www.figma.com/community/plugin/843461159747178978)
- [stylelint-declaration-strict-value](https://github.com/AndyOGo/stylelint-declaration-strict-value)
