# 第 28 章：CSS 命名规范

## 概述

CSS 命名规范是样式代码可维护性的基础。良好的命名能让代码自解释，降低维护成本，提高团队协作效率。本章介绍主流的 CSS 命名方法论及其在 Stylelint 中的配置。

## 一、BEM 命名法

### 1.1 BEM 概念

BEM（Block Element Modifier）是一种组件化的 CSS 命名方法：

```
.block {}
.block__element {}
.block--modifier {}
```

| 概念 | 说明 | 示例 |
|------|------|------|
| Block | 独立的组件 | `.card`, `.menu` |
| Element | 块的组成部分 | `.card__title`, `.menu__item` |
| Modifier | 块或元素的变体 | `.card--featured`, `.menu__item--active` |

### 1.2 BEM 示例

```html
<article class="card card--featured">
  <img class="card__image" src="..." alt="...">
  <div class="card__content">
    <h2 class="card__title">标题</h2>
    <p class="card__description">描述内容</p>
    <button class="card__button card__button--primary">操作</button>
  </div>
</article>
```

```scss
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  
  &__image {
    width: 100%;
    border-radius: 8px 8px 0 0;
  }
  
  &__content {
    padding: 16px;
  }
  
  &__title {
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  &__description {
    color: #666;
  }
  
  &__button {
    padding: 8px 16px;
    
    &--primary {
      background: #3498db;
      color: white;
    }
  }
  
  &--featured {
    border-color: #3498db;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}
```

### 1.3 Stylelint 配置 BEM

```javascript
{
  "rules": {
    // BEM 命名模式
    "selector-class-pattern": [
      // Block: lowercase with hyphens
      // Element: __element
      // Modifier: --modifier
      "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$",
      {
        "message": "类名应遵循 BEM 命名规范 (block__element--modifier)"
      }
    ]
  }
}
```

### 1.4 BEM 变体

**双连字符变体：**
```css
.block-name {}
.block-name__element-name {}
.block-name--modifier-name {}
```

**驼峰变体：**
```css
.blockName {}
.blockName__elementName {}
.blockName--modifierName {}
```

## 二、OOCSS 命名法

### 2.1 OOCSS 概念

OOCSS（Object-Oriented CSS）强调结构与皮肤分离、容器与内容分离：

```css
/* 结构 */
.btn {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
}

/* 皮肤 */
.btn-primary {
  background: #3498db;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}
```

### 2.2 OOCSS 示例

```html
<button class="btn btn-primary btn-large">
  主要按钮
</button>
```

```css
/* 基础对象 */
.media {
  display: flex;
  align-items: flex-start;
}

.media__img {
  margin-right: 16px;
}

.media__body {
  flex: 1;
}

/* 扩展对象 */
.media--reverse {
  flex-direction: row-reverse;
}

.media--center {
  align-items: center;
}
```

### 2.3 Stylelint 配置

```javascript
{
  "rules": {
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    "selector-max-compound-selectors": 3
  }
}
```

## 三、SMACSS 命名法

### 3.1 SMACSS 概念

SMACSS（Scalable and Modular Architecture for CSS）将样式分为五类：

| 类别 | 前缀 | 说明 |
|------|------|------|
| Base | 无 | 基础样式（元素选择器） |
| Layout | `l-` | 布局样式 |
| Module | 无 | 模块/组件样式 |
| State | `is-` | 状态样式 |
| Theme | `theme-` | 主题样式 |

### 3.2 SMACSS 示例

```css
/* Base */
body {
  font-family: sans-serif;
  line-height: 1.5;
}

/* Layout */
.l-header {
  position: fixed;
  top: 0;
  width: 100%;
}

.l-sidebar {
  width: 250px;
  float: left;
}

.l-main {
  margin-left: 250px;
}

/* Module */
.nav {
  list-style: none;
}

.nav-item {
  display: inline-block;
}

/* State */
.is-active {
  font-weight: bold;
}

.is-hidden {
  display: none;
}

.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Theme */
.theme-dark {
  background: #333;
  color: #fff;
}
```

### 3.3 Stylelint 配置

```javascript
{
  "rules": {
    "selector-class-pattern": [
      "^(l-|is-|theme-)?[a-z][a-z0-9]*(-[a-z0-9]+)*$",
      {
        "message": "类名应遵循 SMACSS 命名规范"
      }
    ]
  }
}
```

## 四、Atomic CSS / Utility-First

### 4.1 概念

原子化 CSS 使用单一功能的小类：

```html
<div class="d-flex justify-center align-center p-4 bg-blue-500 text-white rounded">
  内容
</div>
```

### 4.2 常见原子类

```css
/* 显示 */
.d-flex { display: flex; }
.d-block { display: block; }
.d-none { display: none; }

/* 间距 */
.m-0 { margin: 0; }
.m-1 { margin: 4px; }
.p-4 { padding: 16px; }

/* 文字 */
.text-center { text-align: center; }
.font-bold { font-weight: bold; }

/* 颜色 */
.text-white { color: white; }
.bg-blue-500 { background-color: #3498db; }
```

### 4.3 Tailwind CSS 集成

```javascript
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-tailwindcss"
  ],
  "rules": {
    "at-rule-no-unknown": [true, {
      "ignoreAtRules": ["tailwind", "apply", "layer"]
    }]
  }
}
```

## 五、CSS 变量命名

### 5.1 命名规范

```css
:root {
  /* 颜色 */
  --color-primary: #3498db;
  --color-secondary: #2ecc71;
  --color-text: #333;
  --color-text-muted: #666;
  
  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* 字体 */
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 18px;
  
  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

### 5.2 Stylelint 配置

```javascript
{
  "rules": {
    "custom-property-pattern": [
      "^[a-z]+(-[a-z0-9]+)*$",
      {
        "message": "CSS 变量应使用 kebab-case 命名"
      }
    ]
  }
}
```

## 六、组件级命名

### 6.1 React 组件命名

```javascript
// Button.module.css
.button {
  padding: 8px 16px;
}

.buttonPrimary {
  background: #3498db;
}

.buttonLarge {
  padding: 12px 24px;
}
```

```javascript
{
  "rules": {
    "selector-class-pattern": "^[a-z][a-zA-Z0-9]+$"
  }
}
```

### 6.2 Vue 组件命名

```vue
<style scoped>
.user-card {
  border: 1px solid #ddd;
}

.user-card__avatar {
  width: 48px;
  height: 48px;
}

.user-card__name {
  font-weight: bold;
}
</style>
```

## 七、文件命名规范

### 7.1 目录结构

```
styles/
├── base/
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _variables.scss
├── components/
│   ├── _button.scss
│   ├── _card.scss
│   └── _modal.scss
├── layout/
│   ├── _header.scss
│   ├── _footer.scss
│   └── _grid.scss
├── pages/
│   ├── _home.scss
│   └── _about.scss
├── utils/
│   ├── _mixins.scss
│   └── _functions.scss
└── main.scss
```

### 7.2 文件命名规则

| 类型 | 规则 | 示例 |
|------|------|------|
| 部分文件 | 下划线前缀 | `_variables.scss` |
| 组件文件 | 组件名 | `Button.module.css` |
| 页面文件 | 页面名 | `home.scss` |
| 工具文件 | 功能名 | `_mixins.scss` |

## 八、命名最佳实践

### 8.1 命名原则

```css
/* ✅ 好的命名 */
.user-profile { }
.nav-item { }
.btn-primary { }
.is-active { }

/* ❌ 避免的命名 */
.red { }           /* 太具体，难以重用 */
.big { }           /* 含义模糊 */
.left { }          /* 与位置耦合 */
.style1 { }        /* 无意义 */
```

### 8.2 语义化命名

```css
/* ✅ 语义化 */
.alert-success { }
.alert-warning { }
.alert-error { }

/* ❌ 非语义化 */
.green-box { }
.yellow-box { }
.red-box { }
```

### 8.3 避免过深嵌套

```scss
// ❌ 避免
.header .nav .nav-list .nav-item .nav-link { }

// ✅ 推荐
.nav-link { }
.header .nav-link { }
```

## 九、团队规范配置

### 9.1 综合配置示例

```javascript
// stylelint.config.js
module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    // BEM 命名
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      {
        message: '类名应遵循 BEM 命名规范'
      }
    ],
    
    // CSS 变量命名
    'custom-property-pattern': '^[a-z]+(-[a-z0-9]+)*$',
    
    // 关键帧命名
    'keyframes-name-pattern': '^[a-z][a-zA-Z0-9]+$',
    
    // ID 选择器命名
    'selector-id-pattern': '^[a-z][a-zA-Z0-9]+$',
    
    // 限制
    'selector-max-id': 0,
    'selector-max-class': 4,
    'max-nesting-depth': 3
  }
};
```

### 9.2 规范文档模板

```markdown
# CSS 命名规范

## 类名命名
- 使用 BEM 命名法
- Block: 小写字母，单词用连字符分隔
- Element: 双下划线连接
- Modifier: 双连字符连接

## CSS 变量
- 使用 kebab-case
- 按类型分组（color、spacing、font）

## 禁止事项
- 禁止使用 ID 选择器
- 禁止超过 3 层嵌套
- 禁止使用非语义化的颜色类名
```

## 十、迁移策略

### 10.1 渐进式迁移

```javascript
{
  "rules": {
    // 阶段1：警告级别
    "selector-class-pattern": [
      "^[a-z][a-z0-9-_]+$",
      { "severity": "warning" }
    ]
  }
}

// 阶段2：错误级别
{
  "rules": {
    "selector-class-pattern": "^[a-z][a-z0-9-]+(__[a-z0-9-]+)?(--[a-z0-9-]+)?$"
  }
}
```

### 10.2 忽略旧代码

```css
/* stylelint-disable selector-class-pattern */
.legacyClassName { }
/* stylelint-enable selector-class-pattern */
```

## 参考资料

- [BEM 官方文档](https://getbem.com/)
- [SMACSS](http://smacss.com/)
- [OOCSS](https://www.smashingmagazine.com/2011/12/an-introduction-to-object-oriented-css-oocss/)
- [CSS Guidelines](https://cssguidelin.es/)
