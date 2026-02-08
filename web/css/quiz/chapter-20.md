# 第 20 章：定位详解 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** position 属性

### 题目

CSS 中有几种定位方式？

**选项：**
- A. 3种
- B. 4种
- C. 5种
- D. 6种

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**5种定位方式**

```css
/* 1. 静态定位（默认）*/
position: static;

/* 2. 相对定位 */
position: relative;

/* 3. 绝对定位 */
position: absolute;

/* 4. 固定定位 */
position: fixed;

/* 5. 粘性定位 */
position: sticky;
```

**特点对比：**

| 定位类型 | 脱离文档流 | 参照物 |
|---------|----------|--------|
| static | ❌ | 无 |
| relative | ❌ | 自身 |
| absolute | ✅ | 定位祖先 |
| fixed | ✅ | 视口 |
| sticky | ⚠️ 部分 | 滚动容器 |

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** relative 定位

### 题目

`position: relative` 的元素相对于什么定位？

**选项：**
- A. 父元素
- B. 视口
- C. 自身原始位置
- D. body元素

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**relative 相对自身定位**

```css
.box {
  position: relative;
  top: 20px;
  left: 30px;
}
```

**特点：**
- 相对于**自身原始位置**偏移
- 原始空间**保留**
- 不影响其他元素布局

**可视化：**
```
原始位置：
┌─────┐
│ box │ ← 空间保留
└─────┘

实际位置：
    ┌─────┐
    │ box │ ← 视觉偏移
    └─────┘
```

**示例：**
```html
<div class="a">A</div>
<div class="b">B</div>
<div class="c">C</div>
```

```css
.b {
  position: relative;
  top: 10px;
}
/* B 向下偏移，A 和 C 位置不变 */
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** absolute 定位

### 题目

`position: absolute` 的元素脱离文档流。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**absolute 脱离文档流**

```css
.box {
  position: absolute;
}
```

**特点：**
- ✅ 脱离文档流
- ✅ 不占据空间
- ✅ 其他元素无视它
- ✅ 相对定位祖先定位

**示例：**
```html
<div class="container">
  <div class="absolute">Absolute</div>
  <div class="normal">Normal</div>
</div>
```

```css
.absolute {
  position: absolute;
  top: 0;
}

.normal {
  /* 会占据原本 .absolute 的位置 */
}
```

**对比 relative：**
- relative：不脱离，保留空间
- absolute：脱离，不占空间

</details>

---

## 第 4 题 🟡

**类型：** 代码题  
**标签：** 定位参照物

### 题目

以下代码中，`.child` 相对于哪个元素定位？

```html
<div class="grandparent">
  <div class="parent">
    <div class="child"></div>
  </div>
</div>
```

```css
.grandparent { position: relative; }
.parent { }
.child { position: absolute; }
```

**选项：**
- A. grandparent
- B. parent
- C. body
- D. 视口

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**absolute 的定位参照物**

**规则：查找最近的 positioned 祖先**
```
positioned = position 不为 static
```

**本题查找过程：**
```
child (absolute) 向上查找
  ↓
parent (static) ❌ 跳过
  ↓
grandparent (relative) ✅ 找到
```

**结果：相对 grandparent 定位**

**如果 parent 也有定位：**
```css
.parent { position: relative; }
.child { position: absolute; }
/* child 相对 parent 定位 */
```

**如果都没有定位：**
```css
.grandparent { }
.parent { }
.child { position: absolute; }
/* child 相对初始包含块（视口）定位 */
```

**完整规则：**
```
absolute 查找顺序：
1. 向上查找 positioned 祖先（relative/absolute/fixed/sticky）
2. 找到则相对该祖先定位
3. 找不到则相对初始包含块定位
```

</details>

---

## 第 5 题 🟡

**类型：** 多选题  
**标签：** fixed 定位

### 题目

关于 `position: fixed`，以下说法正确的是？

**选项：**
- A. 相对视口定位
- B. 脱离文档流
- C. 不随页面滚动
- D. transform 祖先会改变其定位参照物

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**fixed 定位特性（全部正确）**

**✅ A. 相对视口定位**
```css
.fixed {
  position: fixed;
  top: 0;
  right: 0;
}
/* 固定在视口右上角 */
```

**✅ B. 脱离文档流**
```css
.fixed {
  position: fixed;
}
/* 不占据空间 */
```

**✅ C. 不随页面滚动**
```css
.header {
  position: fixed;
  top: 0;
  width: 100%;
}
/* 始终固定在顶部 */
```

**✅ D. transform 改变参照物**
```css
.parent {
  transform: translateZ(0);
}

.child {
  position: fixed;
  /* 相对 parent 定位，而非视口！*/
}
```

**transform 陷阱示例：**
```html
<div class="modal-wrapper">
  <div class="modal">Modal</div>
</div>
```

```css
.modal-wrapper {
  transform: scale(1);  /* 创建新的定位上下文 */
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  /* 相对 modal-wrapper，而非视口 ⚠️ */
}
```

**改变参照物的属性：**
```css
transform: any;
perspective: any;
filter: any;
will-change: transform/filter;
contain: paint/layout;
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** sticky 定位

### 题目

`position: sticky` 何时生效？

**选项：**
- A. 立即生效
- B. 滚动到指定位置时
- C. 鼠标悬停时
- D. 点击时

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**sticky 粘性定位**

```css
.sticky {
  position: sticky;
  top: 0;
}
```

**行为：**
- 默认：相对定位（在文档流中）
- 滚动到阈值：固定定位（粘住）
- 滚动回来：恢复相对定位

**阈值：**
```css
position: sticky;
top: 20px;  /* 距离顶部20px时粘住 */
```

**示例场景：**
```html
<div class="container">
  <div class="sticky-header">Sticky Header</div>
  <div class="content">Long content...</div>
</div>
```

```css
.sticky-header {
  position: sticky;
  top: 0;
  background: white;
}
/* 滚动时 header 粘在顶部 */
```

**生效条件：**
1. 必须指定 top/bottom/left/right 之一
2. 父元素不能有 `overflow: hidden/auto/scroll`
3. 父元素高度要大于 sticky 元素

**对比：**

| 阶段 | 定位方式 | 说明 |
|------|---------|------|
| 未滚动到阈值 | relative | 在文档流中 |
| 滚动到阈值 | fixed | 粘住 |
| 超出容器 | relative | 跟随容器 |

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 居中定位

### 题目

如何使用 absolute 实现元素水平垂直居中？

**选项：**
- A. `top: 50%; left: 50%;`
- B. `top: 50%; left: 50%; transform: translate(-50%, -50%);`
- C. `margin: auto;`
- D. `top: 0; bottom: 0; left: 0; right: 0; margin: auto;`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B, D

### 📖 解析

**absolute 居中方法**

**✅ 方法1：transform（推荐）**
```css
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**优点：**
- 不需要知道元素尺寸
- 兼容性好

**✅ 方法2：四方向 + margin auto**
```css
.center {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 200px;   /* 需要指定尺寸 */
  height: 100px;
}
```

**优点：**
- 不需要 transform
- 更稳定

**❌ 方法A（错误）**
```css
.center {
  top: 50%;
  left: 50%;
}
/* 元素左上角在中心，不是居中 ❌ */
```

**❌ 方法C（错误）**
```css
.center {
  position: absolute;
  margin: auto;
}
/* 单独 margin: auto 无效 ❌ */
```

**完整对比：**

**未知尺寸：**
```css
/* 推荐 */
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
```

**已知尺寸：**
```css
/* 方案1：负 margin */
position: absolute;
top: 50%;
left: 50%;
width: 200px;
height: 100px;
margin-left: -100px;
margin-top: -50px;

/* 方案2：四方向 + auto */
position: absolute;
top: 0;
right: 0;
bottom: 0;
left: 0;
width: 200px;
height: 100px;
margin: auto;
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 定位层级

### 题目

以下代码中，4个 div 的层叠顺序从下到上是？

```html
<div class="a">A</div>
<div class="b">B</div>
<div class="c">C</div>
<div class="d">D</div>
```

```css
.a { position: static; }
.b { position: relative; }
.c { position: absolute; }
.d { position: fixed; }
```

**选项：**
- A. a, b, c, d
- B. a, c, b, d
- C. a, b, d, c
- D. 按 DOM 顺序

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**定位类型不影响默认层叠顺序**

**规则：**
- 没有 z-index 时，按 DOM 顺序层叠
- 后面的元素在上面

**本题分析：**
```
所有元素都没有 z-index
按 DOM 顺序：a → b → c → d
层叠顺序：a < b < c < d
```

**如果添加 z-index：**
```css
.a { position: static; z-index: 999; }   /* 无效 */
.b { position: relative; z-index: 1; }   /* 有效 */
.c { position: absolute; z-index: 2; }   /* 有效 */
.d { position: fixed; z-index: 3; }      /* 有效 */
/* 顺序：a < b < c < d */
```

**特殊情况：**
```css
.b { position: relative; z-index: 10; }
.c { position: absolute; z-index: 5; }
/* b 在 c 之上（z-index 决定）*/
```

**完整规则：**

**无 z-index：**
```
1. 按 DOM 顺序
2. 定位类型不影响
```

**有 z-index：**
```
1. 比较 z-index 值
2. static 的 z-index 无效
3. 其他定位类型的 z-index 有效
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** sticky 失效

### 题目

以下代码中，sticky 为什么失效？

```html
<div class="container">
  <div class="sticky">Sticky</div>
</div>
```

```css
.container {
  height: 500px;
  overflow: auto;
}

.sticky {
  position: sticky;
  top: 0;
}
```

**选项：**
- A. 没有设置高度
- B. overflow 属性导致
- C. 需要设置 z-index
- D. 代码正确，会生效

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**sticky 在滚动容器中的表现**

**本题代码是正确的！**

```css
.container {
  overflow: auto;  /* 创建滚动容器 */
}

.sticky {
  position: sticky;
  top: 0;
  /* 在 container 滚动时粘住 ✅ */
}
```

**sticky 生效条件：**

**✅ 正确情况：**
```css
/* 1. 指定阈值 */
position: sticky;
top: 0;  /* 必须 */

/* 2. 在滚动容器内 */
.container {
  overflow: auto;  /* 或 scroll */
}
```

**❌ 失效情况：**

**情况1：父元素 overflow: hidden**
```css
.parent {
  overflow: hidden;  /* ❌ */
}

.sticky {
  position: sticky;
  top: 0;
}
```

**情况2：未指定阈值**
```css
.sticky {
  position: sticky;
  /* 没有 top/bottom/left/right ❌ */
}
```

**情况3：父元素高度不够**
```css
.parent {
  height: 50px;  /* 太小 */
}

.sticky {
  height: 100px;
  position: sticky;
  top: 0;
  /* 无法粘住 ❌ */
}
```

**完整示例：**
```html
<div class="scroll-container">
  <div class="content">
    <div class="sticky-header">Header</div>
    <div class="long-content">...</div>
  </div>
</div>
```

```css
.scroll-container {
  height: 400px;
  overflow: auto;  /* 创建滚动容器 */
}

.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 定位最佳实践

### 题目

关于 CSS 定位，以下说法正确的是？

**选项：**
- A. relative 可以为 absolute 子元素提供定位参照
- B. fixed 元素适合做固定导航栏
- C. sticky 元素适合做吸顶效果
- D. absolute 元素宽度默认为 100%

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**定位最佳实践**

**✅ A. relative 作为参照**
```css
.parent {
  position: relative;  /* 定位参照 */
}

.child {
  position: absolute;
  top: 0;
  left: 0;
}
```

**✅ B. fixed 做固定导航**
```css
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}
```

**✅ C. sticky 做吸顶**
```css
.section-header {
  position: sticky;
  top: 0;
  background: white;
}
```

**❌ D. absolute 宽度（错误）**
```css
.absolute {
  position: absolute;
  /* 宽度由内容决定，不是 100% ❌ */
}
```

**详细说明：**

**absolute 的尺寸特性：**
```css
/* 默认：收缩包裹（fit-content）*/
.abs {
  position: absolute;
  /* width: fit-content; */
}

/* 拉伸：需要同时设置对边 */
.abs-stretch {
  position: absolute;
  left: 0;
  right: 0;
  /* width: 100% */
}
```

**定位选择指南：**

**relative：**
- 微调位置
- 作为定位参照
- 创建层叠上下文

**absolute：**
- 脱离文档流
- 相对定位
- 模态框、工具提示

**fixed：**
- 固定导航
- 回到顶部按钮
- 悬浮窗口

**sticky：**
- 吸顶标题
- 侧边栏跟随
- 表格表头

**性能优化：**
```css
/* 提升到合成层 */
.fixed-header {
  position: fixed;
  will-change: transform;
}

/* 避免回流 */
.absolute-box {
  position: absolute;
  /* 修改 top/left 不会触发回流 */
}
```

</details>

---

**导航**  
[上一章：第 19 章 - z-index详解](./chapter-19.md) | [返回目录](../README.md) | [下一章：第 21 章 - 浮动与清除](./chapter-21.md)
