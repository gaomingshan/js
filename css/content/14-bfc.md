# 第 14 章：BFC 块级格式化上下文

## 概述

BFC（Block Formatting Context）是CSS中最重要的布局概念之一，理解BFC是掌握复杂布局的关键。

---

## 一、什么是BFC

### 1.1 定义

BFC是一个独立的渲染区域，内部元素的布局不会影响外部元素。

**可以理解为**：一个隔离的容器，容器内外互不影响。

---

## 二、BFC触发条件

### 2.1 触发方式

```css
/* 1. 根元素 <html> */

/* 2. float */
.bfc { float: left; }        /* left | right */

/* 3. position */
.bfc { position: absolute; } /* absolute | fixed */

/* 4. overflow */
.bfc { overflow: hidden; }   /* hidden | auto | scroll */

/* 5. display */
.bfc { display: inline-block; }
.bfc { display: flex; }      /* flex | inline-flex */
.bfc { display: grid; }      /* grid | inline-grid */
.bfc { display: table-cell; }
.bfc { display: flow-root; } /* 专门用于创建BFC */
```

---

## 三、BFC特性

### 3.1 包含浮动元素

**问题**：父元素高度塌陷

```html
<div class="parent">
  <div class="float">浮动元素</div>
</div>
```

```css
.float {
  float: left;
  width: 200px;
  height: 100px;
}

.parent {
  border: 2px solid red;
  /* 高度塌陷为0 */
}
```

**解决**：触发BFC

```css
.parent {
  overflow: hidden;  /* 触发BFC，包含浮动 */
  /* 高度变为100px */
}
```

### 3.2 阻止外边距合并

**问题**：垂直外边距合并

```html
<div class="box1">Box 1</div>
<div class="box2">Box 2</div>
```

```css
.box1 { margin-bottom: 30px; }
.box2 { margin-top: 20px; }
/* 间距 = max(30px, 20px) = 30px */
```

**解决**：将其中一个放入BFC

```html
<div class="box1">Box 1</div>
<div class="bfc-wrapper">
  <div class="box2">Box 2</div>
</div>
```

```css
.bfc-wrapper {
  overflow: hidden;  /* 创建BFC */
}
/* 间距变为 50px */
```

### 3.3 阻止元素被浮动覆盖

**问题**：文字环绕浮动元素

```html
<div class="float">浮动</div>
<div class="content">长文本内容...</div>
```

```css
.float {
  float: left;
  width: 200px;
  background: lightblue;
}

.content {
  background: lightcoral;
  /* 被浮动元素覆盖 */
}
```

**解决**：content触发BFC

```css
.content {
  overflow: hidden;  /* 触发BFC */
  /* 自动避开浮动元素 */
}
```

---

## 四、BFC应用场景

### 4.1 清除浮动

```css
.clearfix {
  overflow: hidden;
  /* 或 */
  display: flow-root;
}
```

### 4.2 两栏布局

```html
<div class="sidebar">侧边栏</div>
<div class="main">主内容</div>
```

```css
.sidebar {
  float: left;
  width: 200px;
}

.main {
  overflow: hidden;  /* BFC，自适应宽度 */
  /* 或 */
  display: flow-root;
}
```

### 4.3 防止外边距塌陷

```html
<div class="parent">
  <div class="child">子元素</div>
</div>
```

```css
.parent {
  overflow: hidden;  /* 触发BFC */
  /* 子元素的margin不会传递给父元素 */
}

.child {
  margin-top: 20px;  /* 不会影响parent */
}
```

---

## 五、BFC布局规则

### 5.1 内部盒子垂直排列

```css
.bfc-container > div {
  /* 从上到下排列 */
}
```

### 5.2 垂直方向外边距合并

```css
/* BFC内部，垂直外边距仍会合并 */
.bfc > .box1 { margin-bottom: 20px; }
.bfc > .box2 { margin-top: 30px; }
/* 间距 = 30px */
```

### 5.3 计算高度包含浮动

```css
.bfc {
  /* 高度计算包含内部浮动元素 */
}
```

### 5.4 不与浮动元素重叠

```css
.bfc {
  /* 自动避开同级浮动元素 */
}
```

---

## 六、最佳实践

### 6.1 推荐方案

```css
/* ✅ 最佳：flow-root（无副作用） */
.bfc {
  display: flow-root;
}

/* ✅ 常用：overflow: hidden */
.bfc {
  overflow: hidden;
  /* 注意：可能裁剪溢出内容 */
}

/* ⚠️ 谨慎：float/position */
.bfc {
  float: left;       /* 会影响布局 */
  position: absolute; /* 脱离文档流 */
}
```

### 6.2 兼容性考虑

```css
/* 现代浏览器 */
.bfc {
  display: flow-root;
}

/* 兼容旧浏览器 */
.bfc {
  overflow: hidden;
}
```

---

## 七、常见问题

### 7.1 BFC vs 正常流

```
正常流：默认布局方式
BFC：正常流中的独立容器
```

### 7.2 为什么overflow: hidden能清除浮动？

因为触发了BFC，BFC会计算内部浮动元素的高度。

---

## 参考资料

- [MDN - Block Formatting Context](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context)
- [Understanding CSS Layout And BFC](https://www.smashingmagazine.com/2017/12/understanding-css-layout-block-formatting-context/)

---

**导航**  
[上一章：第 13 章 - 盒的生成与布局](./13-box-generation.md)  
[返回目录](../README.md)  
[下一章：第 15 章 - IFC行内格式化上下文](./15-ifc.md)
