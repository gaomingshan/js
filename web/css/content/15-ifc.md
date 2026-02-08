# 第 15 章：IFC 行内格式化上下文

## 概述

IFC（Inline Formatting Context）决定行内元素的布局方式，理解IFC对于处理文本和行内元素至关重要。

---

## 一、什么是IFC

### 1.1 定义

IFC是行内元素的布局环境，决定行内盒子在行盒中的排列和对齐。

```html
<p>这是一段 <span>行内文本</span> 内容。</p>
```

**布局**：所有行内元素在同一行盒（Line Box）中水平排列。

---

## 二、IFC触发条件

### 2.1 创建IFC

**块容器内只包含行内元素时，创建IFC**

```html
<div>
  <span>行内1</span>
  <span>行内2</span>
  <!-- 创建IFC -->
</div>
```

---

## 三、行盒（Line Box）

### 3.1 行盒的生成

```html
<p>
  第一行文本内容
  第二行文本内容
</p>
```

**布局**：
```
行盒1: [第一行文本内容]
行盒2: [第二行文本内容]
```

### 3.2 行盒高度

**行盒高度 = 内部最高的行内盒的顶部到最低盒的底部**

```css
.line-box {
  /* 高度由内部元素决定 */
}
```

---

## 四、line-height 详解

### 4.1 作用

控制行内盒的高度和行间距。

```css
.text {
  font-size: 16px;
  line-height: 1.5;    /* 行高 = 24px */
  /* 行间距 = 24 - 16 = 8px */
  /* 上下各4px */
}
```

### 4.2 line-height值类型

```css
/* 数值（推荐） */
.text { line-height: 1.5; }     /* 1.5倍font-size */

/* 长度 */
.text { line-height: 24px; }

/* 百分比 */
.text { line-height: 150%; }    /* 相对font-size */

/* 关键字 */
.text { line-height: normal; }  /* 约1.2 */
```

### 4.3 继承差异

```css
/* 父元素 */
.parent {
  font-size: 16px;
  line-height: 1.5;      /* 子元素继承1.5 */
}

.child {
  font-size: 20px;
  /* line-height = 20 × 1.5 = 30px */
}
```

```css
/* 父元素 */
.parent {
  font-size: 16px;
  line-height: 24px;     /* 子元素继承24px */
}

.child {
  font-size: 20px;
  /* line-height = 24px（可能太小） */
}
```

> 📌 **最佳实践**：使用数值，避免继承固定值。

---

## 五、vertical-align 详解

### 5.1 对齐方式

```css
/* 基线对齐 */
.inline { vertical-align: baseline; }  /* 默认 */

/* 文本相关 */
.inline { vertical-align: top; }       /* 行盒顶部 */
.inline { vertical-align: bottom; }    /* 行盒底部 */
.inline { vertical-align: middle; }    /* 居中 */
.inline { vertical-align: text-top; }  /* 文字顶部 */
.inline { vertical-align: text-bottom; }

/* 上下标 */
.inline { vertical-align: super; }     /* 上标 */
.inline { vertical-align: sub; }       /* 下标 */

/* 数值 */
.inline { vertical-align: 10px; }      /* 向上10px */
.inline { vertical-align: -10px; }     /* 向下10px */
```

### 5.2 图片底部空隙问题

**问题**：图片下方有空隙

```html
<div>
  <img src="pic.jpg" alt="">
</div>
```

```css
div {
  border: 1px solid red;
  /* 图片底部有空隙 */
}
```

**原因**：图片默认`baseline`对齐，基线下方有空间。

**解决方案**：

```css
/* 方案1：改变对齐 */
img { vertical-align: top; }    /* 或middle、bottom */

/* 方案2：块级化 */
img { display: block; }

/* 方案3：父元素字体为0 */
div { font-size: 0; }

/* 方案4：父元素行高为0 */
div { line-height: 0; }
```

---

## 六、IFC布局规则

### 6.1 水平排列

```html
<span>A</span><span>B</span><span>C</span>
```

**布局**：行内盒在行盒中从左到右排列。

### 6.2 水平空白合并

```html
<span>A</span>  <span>B</span>
```

**布局**：多个空格合并为一个。

### 6.3 换行

```css
.text {
  white-space: normal;   /* 自动换行 */
  white-space: nowrap;   /* 不换行 */
  white-space: pre;      /* 保留换行 */
}
```

---

## 七、实用案例

### 7.1 文本垂直居中

```css
.container {
  height: 100px;
  line-height: 100px;    /* 单行文本垂直居中 */
}
```

### 7.2 图标与文字对齐

```html
<span class="icon">★</span>
<span class="text">文字</span>
```

```css
.icon,
.text {
  vertical-align: middle;
}
```

### 7.3 多行文本居中

```css
.container {
  display: table-cell;
  vertical-align: middle;
  height: 100px;
}
```

---

## 八、调试技巧

### 8.1 可视化行盒

```css
/* 查看行盒边界 */
.text {
  background: rgba(255, 0, 0, 0.1);
}

span {
  background: rgba(0, 0, 255, 0.1);
}
```

---

## 参考资料

- [MDN - Inline Formatting Context](https://developer.mozilla.org/en-US/docs/Web/CSS/Inline_formatting_context)
- [Deep dive CSS: font metrics, line-height and vertical-align](https://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align)

---

**导航**  
[上一章：第 14 章 - BFC块级格式化上下文](./14-bfc.md)  
[返回目录](../README.md)  
[下一章：第 16 章 - FFC弹性格式化上下文](./16-ffc.md)
