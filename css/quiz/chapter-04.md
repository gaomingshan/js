# 第 4 章：基础样式属性 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 文本属性

### 题目

`text-align: center` 能够使哪种元素居中？

**选项：**
- A. 块级元素本身
- B. 块级元素内的行内内容
- C. 浮动元素
- D. 绝对定位元素

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**text-align 作用对象**

**✅ 行内内容（文本、行内元素）**
```css
.container {
  text-align: center;
}
```

```html
<div class="container">
  这段文字会居中 ✅
  <span>行内元素也会居中 ✅</span>
  <img src="pic.jpg"> <!-- 图片（行内）也会居中 ✅ -->
</div>
```

**❌ 不能使块级元素本身居中**
```html
<div class="parent" style="text-align: center;">
  <div class="child" style="width: 200px; background: red;">
    <!-- child 本身不会居中，但内部文字会居中 ❌ -->
  </div>
</div>
```

**块级元素居中方法：**
```css
/* 方法1：margin auto */
.block {
  width: 200px;
  margin: 0 auto;
}

/* 方法2：flexbox */
.parent {
  display: flex;
  justify-content: center;
}

/* 方法3：grid */
.parent {
  display: grid;
  place-items: center;
}
```

**text-align 其他值：**
```css
text-align: left;      /* 左对齐（默认）*/
text-align: right;     /* 右对齐 */
text-align: center;    /* 居中 */
text-align: justify;   /* 两端对齐 */
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 字体属性

### 题目

`font` 属性的简写顺序是？

**选项：**
- A. `font: size family style weight`
- B. `font: style weight size/line-height family`
- C. `font: family size weight style`
- D. `font: weight size family`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**font 简写语法**

**正确顺序：**
```css
font: [font-style] [font-weight] font-size[/line-height] font-family;
```

**示例：**
```css
/* 完整写法 */
font: italic bold 16px/1.5 Arial, sans-serif;
```

**分解：**
```css
font-style: italic;
font-weight: bold;
font-size: 16px;
line-height: 1.5;
font-family: Arial, sans-serif;
```

**必需属性：**
- `font-size` - 必需
- `font-family` - 必需

**可选属性（必须在 size 之前）：**
- `font-style` - 可选
- `font-weight` - 可选
- `font-variant` - 可选

**注意事项：**
```css
/* ✅ 正确 */
font: 16px Arial;
font: bold 16px/1.5 Arial;
font: italic bold 16px Georgia;

/* ❌ 错误 */
font: Arial 16px;           /* 顺序错误 */
font: 16px bold Arial;      /* weight 应在 size 前 */
font: 16px/1.5;             /* 缺少 family */
```

**实用示例：**
```css
body {
  font: 14px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

</details>

---

## 第 3 题 🟢

**类型：** 多选题  
**标签：** 颜色表示

### 题目

以下哪些是 CSS 中有效的颜色表示方式？

**选项：**
- A. `#fff`
- B. `rgb(255, 0, 0)`
- C. `hsl(120, 100%, 50%)`
- D. `color: red`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**CSS 颜色表示方式（全部正确）**

**A. 十六进制（Hex）**
```css
color: #ff0000;     /* 红色（完整） */
color: #f00;        /* 红色（简写） */
color: #ff0000ff;   /* 红色 + alpha */
color: #f00f;       /* 红色 + alpha（简写） */
```

**B. RGB**
```css
color: rgb(255, 0, 0);           /* 红色 */
color: rgb(255 0 0);             /* 空格分隔（新语法） */
color: rgba(255, 0, 0, 0.5);     /* 半透明红色 */
color: rgb(255 0 0 / 50%);       /* 新语法 */
```

**C. HSL**
```css
color: hsl(0, 100%, 50%);        /* 红色 */
color: hsl(0 100% 50%);          /* 新语法 */
color: hsla(0, 100%, 50%, 0.5);  /* 半透明 */
color: hsl(0 100% 50% / 50%);    /* 新语法 */
```

**D. 颜色关键字**
```css
color: red;
color: blue;
color: transparent;  /* 透明 */
color: currentColor; /* 当前颜色 */
```

**其他格式：**
```css
/* HWB（色相、白度、黑度）*/
color: hwb(0 0% 0%);

/* LAB/LCH（高级颜色空间）*/
color: lab(50% 40 60);
color: lch(50% 70 120);
```

</details>

---

## 第 4 题 🟡

**类型：** 代码题  
**标签：** 文本省略

### 题目

以下代码实现的效果是？

```css
.text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

**选项：**
- A. 文本换行
- B. 单行文本省略（...）
- C. 多行文本省略
- D. 隐藏文本

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**单行文本省略**

**三个必需属性：**
```css
.ellipsis {
  white-space: nowrap;      /* 不换行 */
  overflow: hidden;         /* 隐藏溢出 */
  text-overflow: ellipsis;  /* 显示省略号 */
}
```

**效果：**
```
原文本：这是一段很长的文本内容
显示为：这是一段很长的文...
```

**多行文本省略（Webkit）：**
```css
.multi-line-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 3;           /* 显示3行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

**兼容性更好的多行省略：**
```css
.ellipsis-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

/* 降级方案 */
@supports not (-webkit-line-clamp: 3) {
  .ellipsis-3 {
    max-height: 4.5em;  /* line-height × 3 */
    line-height: 1.5em;
  }
  
  .ellipsis-3::after {
    content: '...';
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
```

**注意事项：**
- 单行省略需要固定宽度
- 多行省略主要支持 Webkit 内核
- 纯 CSS 多行省略兼容性有限

</details>

---

## 第 5 题 🟡

**类型：** 单选题  
**标签：** 渐变

### 题目

`linear-gradient()` 的默认方向是？

**选项：**
- A. 从左到右
- B. 从上到下
- C. 从左上到右下
- D. 从中心向外

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**linear-gradient 默认方向**

**默认：从上到下**
```css
background: linear-gradient(red, blue);
/* = linear-gradient(to bottom, red, blue) */
/* = linear-gradient(180deg, red, blue) */
```

**指定方向：**

**关键字方向**
```css
background: linear-gradient(to right, red, blue);      /* 左→右 */
background: linear-gradient(to bottom, red, blue);     /* 上→下 */
background: linear-gradient(to top, red, blue);        /* 下→上 */
background: linear-gradient(to left, red, blue);       /* 右→左 */

/* 对角线 */
background: linear-gradient(to bottom right, red, blue);
```

**角度方向**
```css
background: linear-gradient(0deg, red, blue);     /* 下→上 */
background: linear-gradient(90deg, red, blue);    /* 左→右 */
background: linear-gradient(180deg, red, blue);   /* 上→下 */
background: linear-gradient(270deg, red, blue);   /* 右→左 */
background: linear-gradient(45deg, red, blue);    /* 对角 */
```

**多色渐变：**
```css
background: linear-gradient(
  to right,
  red 0%,
  yellow 50%,
  blue 100%
);
```

**其他渐变类型：**
```css
/* 径向渐变 */
background: radial-gradient(circle, red, blue);

/* 圆锥渐变 */
background: conic-gradient(red, yellow, blue);

/* 重复渐变 */
background: repeating-linear-gradient(
  45deg,
  red 0px,
  red 10px,
  blue 10px,
  blue 20px
);
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 阴影

### 题目

`box-shadow: 2px 4px 6px 1px rgba(0,0,0,0.3)` 中的 `1px` 表示什么？

**选项：**
- A. 阴影水平偏移
- B. 阴影垂直偏移
- C. 模糊半径
- D. 扩展半径

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**box-shadow 语法**

**完整语法：**
```css
box-shadow: offset-x offset-y blur-radius spread-radius color;
```

**本题分解：**
```css
box-shadow: 2px 4px 6px 1px rgba(0,0,0,0.3);
/*          ↑   ↑   ↑   ↑   ↑
            水平 垂直 模糊 扩展 颜色
            X    Y   blur spread color
*/
```

**参数说明：**
- `2px` - 水平偏移（X轴，正值向右）
- `4px` - 垂直偏移（Y轴，正值向下）
- `6px` - 模糊半径（值越大越模糊）
- `1px` - **扩展半径（阴影扩大）** ← 答案
- `rgba(...)` - 阴影颜色

**扩展半径效果：**
```css
/* 无扩展 */
box-shadow: 0 0 10px 0 red;

/* 扩展 5px */
box-shadow: 0 0 10px 5px red;  /* 阴影更大 */

/* 负值收缩 */
box-shadow: 0 0 10px -2px red; /* 阴影更小 */
```

**常用示例：**

**卡片阴影**
```css
.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

**浮起效果**
```css
.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
```

**内阴影**
```css
.inset {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

**多重阴影**
```css
.multi-shadow {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.1);
}
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 列表样式

### 题目

关于 `list-style`，以下说法正确的是？

**选项：**
- A. 可以使用自定义图片作为标记
- B. `list-style-position: inside` 标记在内容内部
- C. 可以完全移除列表标记
- D. 只能用于 `<ul>` 和 `<ol>` 元素

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**list-style 属性详解**

**✅ A. 自定义图片标记**
```css
ul {
  list-style-image: url('marker.png');
}
```

**✅ B. 标记位置**
```css
/* outside - 标记在外部（默认）*/
ul {
  list-style-position: outside;
}

/* inside - 标记在内容内部 */
ul {
  list-style-position: inside;
}
```

**效果对比：**
```
outside:
  • 文本内容
    第二行对齐

inside:
  • 文本内容
  第二行不对齐
```

**✅ C. 移除标记**
```css
ul {
  list-style: none;
  /* 或 */
  list-style-type: none;
}
```

**❌ D. 不限于 ul/ol**
```css
/* 任何元素都可以设置 */
div {
  display: list-item;
  list-style: disc;
}
```

**list-style 简写：**
```css
/* 完整语法 */
list-style: type position image;

/* 示例 */
list-style: circle inside url('marker.png');
```

**list-style-type 值：**
```css
/* 无序列表 */
list-style-type: disc;         /* 实心圆 */
list-style-type: circle;       /* 空心圆 */
list-style-type: square;       /* 方块 */

/* 有序列表 */
list-style-type: decimal;      /* 1, 2, 3 */
list-style-type: lower-alpha;  /* a, b, c */
list-style-type: upper-roman;  /* I, II, III */

/* 无标记 */
list-style-type: none;
```

**现代方案（::marker）：**
```css
li::marker {
  content: '✓ ';
  color: green;
  font-size: 1.2em;
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 字体回退

### 题目

以下字体声明的回退顺序是什么？

```css
font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
```

**选项：**
- A. 从左到右依次尝试
- B. 从右到左依次尝试
- C. 随机选择
- D. 只使用第一个

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**字体回退机制**

**查找顺序（从左到右）：**
```css
font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
/*           ↓                 ↓          ↓      ↓
            1. 优先尝试        2. 次选    3. 再次 4. 通用字体
*/
```

**查找过程：**
```
1. 查找 "Helvetica Neue"
   ├─ 找到 → 使用 ✅
   └─ 未找到 → 继续

2. 查找 "Helvetica"
   ├─ 找到 → 使用 ✅
   └─ 未找到 → 继续

3. 查找 "Arial"
   ├─ 找到 → 使用 ✅
   └─ 未找到 → 继续

4. 使用 sans-serif（系统默认无衬线字体）✅
```

**字体分类：**

**特定字体：**
```css
font-family: "Helvetica Neue";  /* 特定字体名 */
```

**通用字体族（必须放最后）：**
```css
serif        /* 衬线字体（宋体类）*/
sans-serif   /* 无衬线字体（黑体类）*/
monospace    /* 等宽字体（代码字体）*/
cursive      /* 手写体 */
fantasy      /* 装饰字体 */
```

**最佳实践：**

**1. 跨平台字体栈**
```css
/* 系统字体栈 */
font-family: -apple-system, BlinkMacSystemFont, 
             "Segoe UI", Roboto, "Helvetica Neue",
             Arial, sans-serif;
```

**2. 中文字体**
```css
font-family: "PingFang SC", "Microsoft YaHei", 
             "Hiragino Sans GB", sans-serif;
```

**3. 等宽字体（代码）**
```css
font-family: "Fira Code", "Consolas", "Monaco",
             "Courier New", monospace;
```

**注意事项：**
- 包含空格的字体名需要引号
- 通用字体族不需要引号
- 始终提供通用字体族作为最后回退

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 渐变技巧

### 题目

如何创建一个颜色突变（无渐变过渡）的背景？

**选项：**
- A. 使用 `linear-gradient` 设置相同颜色位置
- B. 使用 `solid-gradient`
- C. 使用两个 `background-color`
- D. 无法实现

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**颜色突变技巧**

**方法：相同位置设置不同颜色**
```css
.sharp {
  background: linear-gradient(
    to right,
    red 0%,
    red 50%,     /* 红色到50%停止 */
    blue 50%,    /* 蓝色从50%开始 */
    blue 100%
  );
}
```

**效果：**
```
┌───────────┬───────────┐
│    红色   │   蓝色    │
│  (无渐变) │ (无渐变)  │
└───────────┴───────────┘
```

**简化写法：**
```css
.sharp {
  background: linear-gradient(
    to right,
    red 50%,
    blue 50%
  );
}
```

**实用场景：**

**1. 条纹背景**
```css
.stripes {
  background: linear-gradient(
    90deg,
    red 0%, red 25%,
    blue 25%, blue 50%,
    red 50%, red 75%,
    blue 75%, blue 100%
  );
}
```

**2. 网格背景**
```css
.grid {
  background:
    linear-gradient(white 1px, transparent 1px),
    linear-gradient(90deg, white 1px, transparent 1px),
    #f0f0f0;
  background-size: 20px 20px;
}
```

**3. 棋盘格**
```css
.checkerboard {
  background:
    linear-gradient(45deg, #000 25%, transparent 25%),
    linear-gradient(-45deg, #000 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #000 75%),
    linear-gradient(-45deg, transparent 75%, #000 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  background-color: #fff;
}
```

**4. 进度条分段**
```css
.progress {
  background: linear-gradient(
    to right,
    green 0%, green 33%,
    yellow 33%, yellow 66%,
    red 66%, red 100%
  );
}
```

**repeating-linear-gradient：**
```css
/* 重复条纹 */
.repeating-stripes {
  background: repeating-linear-gradient(
    90deg,
    red 0px, red 10px,
    blue 10px, blue 20px
  );
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 综合应用

### 题目

关于 `currentColor` 关键字，以下说法正确的是？

**选项：**
- A. 继承当前元素的 `color` 值
- B. 可用于 `border-color`、`box-shadow` 等属性
- C. 会随 `color` 值变化而自动更新
- D. 只能用于颜色属性

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**currentColor 详解**

**✅ A. 继承 color 值**
```css
.box {
  color: red;
  border: 2px solid currentColor;  /* = red */
}
```

**✅ B. 用于各种颜色属性**
```css
.box {
  color: blue;
  
  /* 边框 */
  border-color: currentColor;
  
  /* 阴影 */
  box-shadow: 0 0 10px currentColor;
  
  /* 背景 */
  background: currentColor;
  
  /* SVG */
  fill: currentColor;
  stroke: currentColor;
}
```

**✅ C. 自动更新**
```css
.box {
  color: red;
  border: 2px solid currentColor;
}

.box:hover {
  color: blue;
  /* border 自动变为 blue ✅ */
}
```

**❌ D. 不限于颜色属性**
```css
/* SVG 属性也可用 */
svg {
  fill: currentColor;
  stroke: currentColor;
}
```

**实用场景：**

**1. 图标颜色继承**
```css
.icon {
  fill: currentColor;  /* SVG 图标颜色跟随文字 */
}

.button {
  color: blue;
}

.button:hover {
  color: red;  /* 图标自动变红 */
}
```

**2. 统一主题色**
```css
.card {
  color: #3b82f6;
  border: 1px solid currentColor;
  box-shadow: 0 0 10px currentColor;
}
```

**3. 按钮状态**
```css
.btn {
  color: white;
  background: blue;
  border: 2px solid currentColor;
}

.btn:hover {
  color: blue;
  background: white;
  /* border 自动变蓝 */
}
```

**4. 装饰元素**
```css
.decorated::before {
  content: '';
  border-top: 2px solid currentColor;
}

.success {
  color: green;  /* ::before 边框自动变绿 */
}
```

**兼容性：**
- 所有现代浏览器支持
- IE9+ 支持

**对比 inherit：**
```css
/* inherit - 继承父元素的属性值 */
.child {
  color: inherit;  /* 继承父元素的 color */
}

/* currentColor - 使用当前元素的 color 值 */
.box {
  color: red;
  border: 1px solid currentColor;  /* 使用自己的 red */
}
```

</details>

---

**导航**  
[上一章：第 3 章 - 盒模型基础](./chapter-03.md) | [返回目录](../README.md) | [下一章：第 5 章 - CSS解析机制](./chapter-05.md)
