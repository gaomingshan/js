# 第 1 章：CSS 核心概念

## 概述

CSS（Cascading Style Sheets，层叠样式表）是用于描述HTML文档呈现方式的样式语言。理解CSS的核心概念是掌握前端样式开发的基础。

---

## 一、CSS 是什么

### 1.1 定义

CSS 是一种样式语言，用于控制网页的外观和布局。它将内容（HTML）与表现（样式）分离。

```css
/* CSS 基本语法 */
selector {
  property: value;
}
```

### 1.2 CSS 发展史

- **CSS1 (1996)**：基础样式（颜色、字体、对齐）
- **CSS2 (1998)**：定位、z-index、媒体类型
- **CSS2.1 (2011)**：修正CSS2的错误
- **CSS3 (2011至今)**：模块化开发（选择器、盒模型、背景、过渡、动画等）
- **CSS4+**：持续演进中（容器查询、:has()、层叠层等）

> **关键特性**：CSS3采用模块化，每个模块独立演进，不再有统一的版本号。

---

## 二、CSS 引入方式

### 2.1 外部样式表（推荐）

```html
<link rel="stylesheet" href="styles.css">
```

**优点**：
- 样式复用
- 缓存优化
- 维护方便

### 2.2 内部样式表

```html
<style>
  body {
    margin: 0;
    padding: 0;
  }
</style>
```

**适用场景**：单页面特定样式

### 2.3 内联样式

```html
<div style="color: red; font-size: 16px;">文本</div>
```

**缺点**：
- 不可复用
- 优先级过高
- 难以维护

### 2.4 @import 导入

```css
@import url('base.css');
@import url('components.css');
```

> ⚠️ **性能问题**：@import会阻塞并行下载，不推荐使用。优先使用多个`<link>`标签。

---

## 三、CSS 语法结构

### 3.1 基本语法

```css
/* 选择器 */
h1 {
  /* 属性: 值; */
  color: blue;
  font-size: 24px;
}

/* 多个选择器 */
h1, h2, h3 {
  margin: 0;
}

/* 后代选择器 */
.container p {
  line-height: 1.6;
}
```

### 3.2 注释

```css
/* 单行注释 */

/* 
  多行注释
  详细说明
*/
```

### 3.3 值的类型

```css
.box {
  /* 关键字 */
  display: block;
  
  /* 长度 */
  width: 100px;
  height: 50%;
  
  /* 颜色 */
  color: #333;
  background: rgb(255, 0, 0);
  border-color: rgba(0, 0, 0, 0.5);
  
  /* 函数 */
  transform: rotate(45deg);
  background: linear-gradient(to right, red, blue);
}
```

---

## 四、CSS 工作流程

### 4.1 浏览器解析流程

```
HTML → DOM树
  ↓
CSS → CSSOM树
  ↓
DOM + CSSOM → 渲染树
  ↓
Layout（布局）
  ↓
Paint（绘制）
  ↓
Composite（合成）
```

### 4.2 选择器匹配

浏览器从**右向左**匹配选择器：

```css
/* 从右向左：先找所有 p，再筛选 .container 的后代 */
.container p {
  color: red;
}
```

> **为什么从右向左？**  
> 减少匹配次数。先匹配最具体的元素，再向上查找祖先，可以快速排除不匹配的分支。

---

## 五、CSS 特性

### 5.1 层叠（Cascade）

当多个规则作用于同一元素时，按优先级决定：

```css
/* 优先级：内联 > ID > 类 > 标签 */
p { color: black; }        /* 权重: 1 */
.text { color: blue; }     /* 权重: 10 */
#title { color: red; }     /* 权重: 100 */
```

### 5.2 继承（Inheritance）

某些属性会从父元素继承到子元素：

```css
body {
  color: #333;        /* 继承 */
  font-size: 16px;    /* 继承 */
  border: 1px solid;  /* 不继承 */
}
```

**可继承属性**：文本、字体、颜色、列表  
**不可继承属性**：盒模型、定位、背景

### 5.3 特异性（Specificity）

选择器权重计算：

```css
/* (内联, ID, 类/伪类/属性, 标签/伪元素) */
*                {}  /* (0,0,0,0) */
li               {}  /* (0,0,0,1) */
.list            {}  /* (0,0,1,0) */
ul li            {}  /* (0,0,0,2) */
ul li.active     {}  /* (0,0,1,2) */
#nav .list li    {}  /* (0,1,1,1) */
style=""             /* (1,0,0,0) */
```

---

## 六、CSS 最佳实践

### 6.1 命名规范

```css
/* BEM 命名 */
.block {}
.block__element {}
.block--modifier {}

/* 语义化命名 */
.header {}
.nav {}
.content {}
.footer {}
```

### 6.2 代码组织

```css
/* 1. 重置样式 */
* { margin: 0; padding: 0; }

/* 2. 全局样式 */
body { font-family: Arial; }

/* 3. 布局 */
.container { max-width: 1200px; }

/* 4. 组件 */
.button { padding: 10px 20px; }

/* 5. 页面特定样式 */
.home-banner { background: blue; }
```

### 6.3 性能优化

```css
/* ✅ 好：简洁选择器 */
.nav-item { color: blue; }

/* ❌ 避免：过度具体 */
header nav ul li a.nav-item { color: blue; }

/* ✅ 好：使用类 */
.active { color: red; }

/* ❌ 避免：通配符 */
* { box-sizing: border-box; } /* 仅全局使用 */
```

---

## 参考资料

- [MDN - CSS](https://developer.mozilla.org/zh-CN/docs/Web/CSS)
- [CSS规范](https://www.w3.org/Style/CSS/)
- [Can I Use](https://caniuse.com/) - 浏览器兼容性查询

---

**导航**  
上一章：无  
[返回目录](../README.md)  
下一章：[第 2 章 - 选择器系统](./02-selectors.md)
