# 第 5 章：CSS 解析机制

## 概述

理解浏览器如何解析CSS是性能优化的基础。本章深入CSS解析的底层机制，包括词法分析、语法分析、CSSOM构建等核心流程。

---

## 一、CSS解析流程

### 1.1 整体流程

```
CSS文件/内联样式
    ↓
词法分析（Tokenization）
    ↓
语法分析（Parsing）
    ↓
CSSOM树构建
    ↓
样式计算
    ↓
渲染树
```

### 1.2 解析顺序

```css
/* 浏览器按顺序解析 */
@import url('base.css');     /* 1. 先处理 @import */
@charset "UTF-8";            /* 2. 字符集声明 */

/* 3. 解析规则集 */
body { margin: 0; }
.container { width: 100%; }
```

---

## 二、词法分析（Tokenization）

### 2.1 Token类型

CSS被分解为以下Token：

```css
.box { color: red; }

/* Token序列：
   1. DELIM (.)
   2. IDENT (box)
   3. { 
   4. IDENT (color)
   5. COLON (:)
   6. IDENT (red)
   7. SEMICOLON (;)
   8. }
*/
```

### 2.2 识别规则

```css
/* 各种Token示例 */
#id           /* HASH */
.class        /* DELIM + IDENT */
100px         /* NUMBER + DIMENSION */
"string"      /* STRING */
rgb(0,0,0)    /* FUNCTION */
!important    /* DELIM + IDENT */
```

---

## 三、语法分析（Parsing）

### 3.1 规则解析

```css
/* 选择器 + 声明块 */
h1, .title {
  color: blue;
  font-size: 2em;
}

/* 解析结果：
   Selector: h1, .title
   Declarations: [
     {property: 'color', value: 'blue'},
     {property: 'font-size', value: '2em'}
   ]
*/
```

### 3.2 容错机制

```css
/* 浏览器会忽略无效规则 */
.box {
  color: red;
  invalid-prop: value;  /* 忽略 */
  width: 100px;
}

/* 无效值也会被忽略 */
.box {
  width: invalid;       /* 忽略该声明 */
  width: 200px;         /* 使用此值 */
}
```

> 📌 **容错原则**：遇到错误时跳过，不影响后续解析。

### 3.3 !important处理

```css
.box {
  color: red !important;
  color: blue;          /* 不生效 */
}

/* 解析时标记 !important 优先级 */
```

---

## 四、CSSOM构建

### 4.1 CSSOM树结构

```css
body { font-size: 16px; }
.container { width: 80%; }
.container p { color: blue; }
```

```
StyleSheetList
├── StyleSheet
│   ├── CSSRule: body { font-size: 16px; }
│   ├── CSSRule: .container { width: 80%; }
│   └── CSSRule: .container p { color: blue; }
```

### 4.2 JavaScript访问CSSOM

```javascript
// 获取所有样式表
console.log(document.styleSheets);

// 访问规则
const sheet = document.styleSheets[0];
console.log(sheet.cssRules);

// 修改样式
sheet.cssRules[0].style.color = 'red';

// 添加规则
sheet.insertRule('.new { color: blue; }', 0);

// 删除规则
sheet.deleteRule(0);
```

---

## 五、@规则处理

### 5.1 @import

```css
@import url('base.css');
@import url('theme.css') screen;
@import url('print.css') print;
```

**解析顺序**：
1. @import必须在其他规则之前
2. 阻塞后续CSS解析
3. 串行加载（性能差）

> ⚠️ **性能问题**：@import会阻塞并行下载，推荐使用多个`<link>`。

### 5.2 @media

```css
@media screen and (min-width: 768px) {
  .container { width: 750px; }
}

/* 解析时构建条件规则 */
```

### 5.3 @font-face

```css
@font-face {
  font-family: 'MyFont';
  src: url('font.woff2') format('woff2');
}

/* 解析时注册字体，使用时下载 */
```

### 5.4 @keyframes

```css
@keyframes slide {
  from { left: 0; }
  to { left: 100px; }
}

/* 解析时存储动画定义 */
```

### 5.5 @supports

```css
@supports (display: grid) {
  .grid { display: grid; }
}

/* 解析时检测特性支持 */
```

---

## 六、选择器解析

### 6.1 从右向左匹配

```css
.container .nav li a { color: blue; }

/* 匹配过程：
   1. 找到所有 <a>
   2. 检查是否是 <li> 的后代
   3. 检查是否是 .nav 的后代
   4. 检查是否是 .container 的后代
*/
```

**为什么从右向左？**
- 减少无效匹配
- 快速过滤不匹配的元素

### 6.2 选择器优化

```css
/* ❌ 低效：通配符在右侧 */
.container * { margin: 0; }

/* ✅ 高效：具体选择器 */
.container > * { margin: 0; }

/* ❌ 低效：层级过深 */
html body .wrapper .container .content p { }

/* ✅ 高效：扁平化 */
.content-text { }
```

---

## 七、样式计算

### 7.1 级联计算

```css
/* 多个来源的样式合并 */
/* 1. 浏览器默认样式 */
p { margin: 1em 0; }

/* 2. 用户样式 */
* { font-size: 16px; }

/* 3. 作者样式 */
p { color: blue; }

/* 最终计算值 = 合并所有来源 */
```

### 7.2 继承计算

```css
body {
  color: #333;      /* 继承给所有子元素 */
  border: 1px solid; /* 不继承 */
}

p {
  /* 继承 color: #333 */
  /* 不继承 border */
}
```

### 7.3 值的计算过程

```
声明值 (Declared Value)
    ↓
层叠值 (Cascaded Value)
    ↓
指定值 (Specified Value)
    ↓
计算值 (Computed Value)
    ↓
使用值 (Used Value)
    ↓
实际值 (Actual Value)
```

---

## 八、性能优化

### 8.1 减少解析时间

```css
/* ✅ 好：简洁选择器 */
.nav-item { }

/* ❌ 避免：复杂选择器 */
header nav > ul > li:nth-child(2) a:hover { }

/* ✅ 好：合并规则 */
.btn { padding: 10px; background: blue; }

/* ❌ 避免：分散规则 */
.btn { padding: 10px; }
.btn { background: blue; }
```

### 8.2 避免解析阻塞

```html
<!-- ✅ 好：使用 link -->
<link rel="stylesheet" href="style.css">

<!-- ❌ 避免：@import -->
<style>
  @import url('style.css');
</style>

<!-- ✅ 好：非关键CSS异步加载 -->
<link rel="preload" href="non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### 8.3 减少CSSOM重建

```javascript
// ❌ 低效：频繁修改样式
element.style.width = '100px';
element.style.height = '100px';
element.style.background = 'red';

// ✅ 高效：批量修改
element.className = 'new-style';

// ✅ 高效：使用 cssText
element.style.cssText = 'width:100px; height:100px; background:red;';
```

---

## 九、调试CSS解析

### 9.1 Chrome DevTools

```
1. 打开 DevTools → Performance
2. 录制页面加载
3. 查看 "Parse Stylesheet" 事件
4. 分析解析时间
```

### 9.2 查看CSSOM

```javascript
// 控制台执行
console.log(document.styleSheets);

// 遍历所有规则
for (let sheet of document.styleSheets) {
  for (let rule of sheet.cssRules) {
    console.log(rule.cssText);
  }
}
```

---

## 参考资料

- [CSS Syntax Module](https://www.w3.org/TR/css-syntax-3/)
- [CSSOM](https://www.w3.org/TR/cssom-1/)
- [How Browsers Work](https://web.dev/howbrowserswork/)

---

**导航**  
[上一章：第 4 章 - 基础样式属性](./04-basic-styles.md)  
[返回目录](../README.md)  
[下一章：第 6 章 - 样式表加载与阻塞](./06-stylesheet-loading.md)
