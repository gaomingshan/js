# 第 2 章：选择器系统

## 概述

选择器是CSS的核心，用于定位要设置样式的HTML元素。掌握选择器系统是编写高效CSS的关键。

---

## 一、基础选择器

### 1.1 通配符选择器

```css
/* 选择所有元素 */
* {
  margin: 0;
  padding: 0;
}
```

> ⚠️ **性能警告**：避免过度使用通配符，会影响性能。

### 1.2 标签选择器

```css
p { color: #333; }
h1 { font-size: 2em; }
div { display: block; }
```

### 1.3 类选择器

```css
.container { max-width: 1200px; }
.active { color: red; }
.btn-primary { background: blue; }
```

### 1.4 ID选择器

```css
#header { height: 80px; }
#nav { background: #f5f5f5; }
```

> 📌 **最佳实践**：ID选择器权重过高，推荐使用类选择器。

### 1.5 属性选择器

```css
/* 存在属性 */
[disabled] { opacity: 0.5; }

/* 精确匹配 */
[type="text"] { border: 1px solid #ccc; }

/* 开头匹配 */
[href^="https"] { color: green; }

/* 结尾匹配 */
[href$=".pdf"] { color: red; }

/* 包含匹配 */
[class*="btn"] { padding: 10px; }

/* 词组匹配 */
[class~="active"] { font-weight: bold; }

/* 前缀匹配 */
[lang|="en"] { font-family: Arial; }
```

---

## 二、组合选择器

### 2.1 后代选择器（空格）

```css
/* 选择所有后代 */
.container p {
  line-height: 1.6;
}

div span {
  color: blue;
}
```

### 2.2 子代选择器（>）

```css
/* 只选择直接子元素 */
.nav > li {
  display: inline-block;
}

ul > li > a {
  text-decoration: none;
}
```

### 2.3 相邻兄弟选择器（+）

```css
/* 选择紧邻的下一个兄弟 */
h1 + p {
  margin-top: 0;
}

.active + li {
  border-left: 2px solid red;
}
```

### 2.4 通用兄弟选择器（~）

```css
/* 选择之后的所有兄弟 */
h1 ~ p {
  color: gray;
}
```

**对比示例**：

```html
<div>
  <h1>标题</h1>
  <p>段落1</p>  <!-- h1 + p 和 h1 ~ p 都匹配 -->
  <p>段落2</p>  <!-- 只有 h1 ~ p 匹配 -->
</div>
```

---

## 三、伪类选择器

### 3.1 动态伪类

```css
/* 链接状态 */
a:link { color: blue; }      /* 未访问 */
a:visited { color: purple; } /* 已访问 */
a:hover { color: red; }      /* 悬停 */
a:active { color: orange; }  /* 激活 */
a:focus { outline: 2px solid; } /* 聚焦 */

/* LVHA 顺序：Link > Visited > Hover > Active */
```

> 📌 **记忆口诀**：LoVe HAte（爱恨原则）

### 3.2 结构伪类

```css
/* 第一个/最后一个子元素 */
li:first-child { font-weight: bold; }
li:last-child { border: none; }

/* 第一个/最后一个类型 */
p:first-of-type { margin-top: 0; }
p:last-of-type { margin-bottom: 0; }

/* 第 n 个子元素 */
li:nth-child(2) { color: red; }        /* 第2个 */
li:nth-child(odd) { background: #f5f5f5; }  /* 奇数 */
li:nth-child(even) { background: #fff; }    /* 偶数 */
li:nth-child(3n) { color: blue; }      /* 3的倍数 */
li:nth-child(3n+1) { color: green; }   /* 3n+1 */

/* 从后往前数 */
li:nth-last-child(2) { color: orange; }

/* 唯一子元素 */
p:only-child { font-style: italic; }
p:only-of-type { text-align: center; }
```

### 3.3 否定伪类

```css
/* 排除某些元素 */
li:not(.active) { opacity: 0.6; }
input:not([type="submit"]) { width: 100%; }

/* CSS4: 支持多个选择器 */
p:not(.intro, .summary) { color: gray; }
```

### 3.4 其他伪类

```css
/* 空元素 */
div:empty { display: none; }

/* 根元素 */
:root { --main-color: blue; }

/* 目标元素（锚点） */
:target { background: yellow; }

/* 表单状态 */
input:disabled { opacity: 0.5; }
input:checked { background: green; }
input:required { border-color: red; }
input:valid { border-color: green; }
input:invalid { border-color: red; }

/* 语言 */
:lang(en) { quotes: '"' '"'; }
```

---

## 四、伪元素选择器

### 4.1 常用伪元素

```css
/* 首字母/首行 */
p::first-letter {
  font-size: 2em;
  float: left;
}

p::first-line {
  font-weight: bold;
}

/* 选中文本 */
::selection {
  background: yellow;
  color: black;
}
```

### 4.2 生成内容

```css
/* 前置/后置内容 */
.icon::before {
  content: "★";
  margin-right: 5px;
}

.external::after {
  content: " ↗";
}

/* 属性值 */
a::after {
  content: " (" attr(href) ")";
}

/* 计数器 */
h2::before {
  content: counter(chapter) ". ";
  counter-increment: chapter;
}
```

> 📌 **双冒号 vs 单冒号**：CSS3推荐伪元素使用`::`，伪类使用`:`。但浏览器兼容单冒号写法。

---

## 五、选择器权重计算

### 5.1 权重规则

```
内联样式     1000
ID选择器      100
类/伪类/属性   10
标签/伪元素     1
```

### 5.2 权重计算示例

```css
/* (0,0,0,1) = 1 */
p { color: black; }

/* (0,0,1,0) = 10 */
.text { color: blue; }

/* (0,1,0,0) = 100 */
#title { color: red; }

/* (0,0,1,2) = 12 */
ul li.active { color: green; }

/* (0,1,1,1) = 111 */
#nav .menu li { color: purple; }

/* (1,0,0,0) = 1000 */
style="color: orange;"

/* ∞ 无限大 */
color: yellow !important;
```

### 5.3 权重比较

```css
/* 权重: 111 */
#nav .menu li { color: red; }

/* 权重: 21 */
ul ul li li li { color: blue; }

/* 结果：red（111 > 21）*/
```

> ⚠️ **注意**：权重不是十进制，是分组比较！

---

## 六、选择器性能优化

### 6.1 性能最佳实践

```css
/* ✅ 好：使用类选择器 */
.nav-item { color: blue; }

/* ❌ 避免：过长的后代选择器 */
header nav ul li a span { color: blue; }

/* ✅ 好：直接定位 */
.item-link { color: blue; }

/* ❌ 避免：通配符在右侧 */
.container * { margin: 0; }

/* ✅ 好：具体选择器 */
.container > p { margin: 0; }
```

### 6.2 浏览器匹配机制

浏览器**从右向左**匹配选择器：

```css
/* 1. 先找所有 .item */
/* 2. 再找 li 的后代 */  
/* 3. 再找 ul 的后代 */
/* 4. 最后找 .nav 的后代 */
.nav ul li .item { }
```

**优化建议**：
- 避免右侧使用通配符
- 减少选择器层级
- 使用更具体的右侧选择器

---

## 七、现代选择器（CSS4）

### 7.1 :is() 伪类

```css
/* 简化多个选择器 */
/* 传统写法 */
header p, main p, footer p { margin: 1em; }

/* :is() 写法 */
:is(header, main, footer) p { margin: 1em; }
```

### 7.2 :where() 伪类

```css
/* 零权重选择器 */
:where(h1, h2, h3) { margin: 0; }

/* 权重为 0，容易覆盖 */
h1 { margin: 1em; } /* 生效 */
```

### 7.3 :has() 父选择器

```css
/* 包含特定子元素的父元素 */
div:has(> img) { border: 1px solid; }

/* 相邻元素 */
h2:has(+ p) { margin-bottom: 0.5em; }

/* 状态判断 */
form:has(:invalid) { border-color: red; }
```

---

## 八、选择器最佳实践

### 8.1 语义化命名

```css
/* ✅ 好：语义化 */
.header-nav { }
.article-title { }
.btn-primary { }

/* ❌ 避免：样式化命名 */
.red-text { }
.float-left { }
.margin-10 { }
```

### 8.2 BEM命名法

```css
/* Block（块） */
.menu { }

/* Element（元素） */
.menu__item { }
.menu__link { }

/* Modifier（修饰符） */
.menu--vertical { }
.menu__item--active { }
```

### 8.3 避免过度嵌套

```css
/* ❌ 不好：层级过深 */
.header .nav .menu .item .link { }

/* ✅ 好：扁平化 */
.nav-link { }
```

---

## 参考资料

- [MDN - CSS选择器](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Selectors)
- [Selectors Level 4](https://www.w3.org/TR/selectors-4/)
- [选择器性能优化](https://csswizardry.com/2011/09/writing-efficient-css-selectors/)

---

**导航**  
[上一章：第 1 章 - CSS核心概念](./01-basics.md)  
[返回目录](../README.md)  
[下一章：第 3 章 - 盒模型基础](./03-box-model.md)
