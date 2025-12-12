# 第 9 章：样式值计算过程 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 值计算阶段

### 题目

CSS 值计算的六个阶段按顺序是？

**选项：**
- A. 声明值 → 层叠值 → 指定值 → 计算值 → 使用值 → 实际值
- B. 指定值 → 声明值 → 层叠值 → 计算值 → 使用值 → 实际值
- C. 层叠值 → 声明值 → 指定值 → 使用值 → 计算值 → 实际值
- D. 声明值 → 指定值 → 层叠值 → 计算值 → 使用值 → 实际值

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**CSS 值计算的六个阶段**

```
1. 声明值（Declared Value）
   ↓
2. 层叠值（Cascaded Value）
   ↓
3. 指定值（Specified Value）
   ↓
4. 计算值（Computed Value）
   ↓
5. 使用值（Used Value）
   ↓
6. 实际值（Actual Value）
```

**各阶段详解：**

**1. 声明值**
```css
.box { width: 50%; }    /* 所有声明的值 */
.box { width: 100px; }
```

**2. 层叠值**
```css
/* 经过层叠算法后的值 */
.box { width: 100px; }  /* 胜出 */
```

**3. 指定值**
```css
/* 层叠值或继承值或初始值 */
width: 100px;  /* 来自层叠 */
color: red;    /* 来自继承 */
```

**4. 计算值**
```css
/* 相对值转为绝对值（某些情况）*/
font-size: 1.5em;  → 24px
```

**5. 使用值**
```css
/* 实际布局使用的值 */
width: 50%;  → 500px（根据父元素）
```

**6. 实际值**
```css
/* 浏览器能够渲染的值 */
width: 500.5px;  → 500px（取整）
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 计算值

### 题目

`getComputedStyle()` 返回的是哪个阶段的值？

**选项：**
- A. 声明值
- B. 层叠值
- C. 计算值
- D. 使用值

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**getComputedStyle 返回计算值**

```javascript
const div = document.querySelector('.box');
const styles = getComputedStyle(div);

console.log(styles.width);      // 计算值
console.log(styles.fontSize);   // 计算值
```

**示例：**

```css
.box {
  width: 50%;           /* 声明值 */
  font-size: 1.5em;     /* 声明值 */
}
```

```javascript
const computed = getComputedStyle(box);

// 计算值（可能仍是相对值）
computed.width;      // "50%" 或 "500px"（取决于浏览器）
computed.fontSize;   // "24px"（已转为绝对值）
```

**计算值特点：**
- 相对单位转为绝对值（em → px）
- 百分比可能保留或转换
- 不依赖布局

**获取使用值：**
```javascript
// 使用值需要通过其他方式
const usedWidth = box.offsetWidth;  // 使用值（像素）
const usedHeight = box.offsetHeight;
```

**对比：**
```javascript
// 计算值
getComputedStyle(box).width;  // 可能是 "50%"

// 使用值
box.offsetWidth;              // 确定是像素，如 500
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 指定值

### 题目

如果一个属性没有声明值，也不能继承，那么它的指定值是初始值。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**指定值的确定规则**

**优先顺序：**
```
1. 有层叠值 → 使用层叠值
2. 可继承且有继承值 → 使用继承值
3. 其他 → 使用初始值
```

**示例：**

**情况1：有层叠值**
```css
.box { width: 100px; }
/* 指定值 = 100px（层叠值）*/
```

**情况2：可继承**
```css
.parent { color: red; }
.child { /* 未声明 color */ }
/* 指定值 = red（继承值）*/
```

**情况3：初始值**
```css
.box { /* 未声明 width */ }
/* width 不可继承，无层叠值 */
/* 指定值 = auto（初始值）✅ */
```

**完整示例：**
```css
.parent {
  color: red;
  width: 500px;
}

.child {
  /* color: 未声明，可继承 → red */
  /* width: 未声明，不可继承 → auto（初始值）*/
}
```

**初始值示例：**
```css
/* 常见属性的初始值 */
width: auto;
height: auto;
margin: 0;
padding: 0;
color: black;  /* 实际取决于浏览器 */
display: inline;
position: static;
```

</details>

---

## 第 4 题 🟡

**类型：** 代码题  
**标签：** 计算值转换

### 题目

以下代码中，`<p>` 的 `font-size` 计算值是多少？

```css
body { font-size: 16px; }
div { font-size: 1.5em; }
p { font-size: inherit; }
```

```html
<body>
  <div>
    <p></p>
  </div>
</body>
```

**选项：**
- A. 1.5em
- B. 16px
- C. 24px
- D. inherit

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**计算值的转换**

**计算过程：**

```css
/* 1. body */
body { font-size: 16px; }
/* 计算值：16px */

/* 2. div */
div { font-size: 1.5em; }
/* 计算值：1.5 × 16px = 24px */

/* 3. p */
p { font-size: inherit; }
/* 继承 div 的计算值 */
/* 计算值：24px ✅ */
```

**关键点：**

**em 单位转换**
- 声明值：1.5em
- 计算值：24px（相对值转绝对值）

**inherit 继承**
- 继承的是**计算值**
- 不是相对值

**对比：**
```css
/* 如果不用 inherit */
div { font-size: 1.5em; }  /* 24px */
p { }
/* p 自动继承 div 的计算值：24px */

/* 使用 inherit */
div { font-size: 1.5em; }  /* 24px */
p { font-size: inherit; }
/* p 明确继承 div 的计算值：24px */
```

**计算值特点：**
- em/rem → 像素
- % → 可能转换或保留
- calc() → 计算结果

</details>

---

## 第 5 题 🟡

**类型：** 多选题  
**标签：** 使用值

### 题目

以下哪些情况会从计算值转换为使用值？

**选项：**
- A. 百分比宽度转换为像素
- B. `auto` 关键字转换为具体值
- C. `em` 单位转换为像素
- D. `calc()` 计算结果

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B

### 📖 解析

**计算值 → 使用值的转换**

**✅ A. 百分比转像素**
```css
.parent { width: 1000px; }
.child { width: 50%; }

/* 计算值：50% */
/* 使用值：500px ✅ */
```

**✅ B. auto 转具体值**
```css
.box { width: auto; }

/* 计算值：auto */
/* 使用值：具体像素（如 800px）✅ */
```

**❌ C. em 转换（错误）**
```css
.box { font-size: 1.5em; }

/* em → px 发生在计算值阶段 ❌ */
/* 计算值：24px */
/* 使用值：24px */
```

**❌ D. calc() 计算（错误）**
```css
.box { width: calc(100% - 50px); }

/* calc() 在计算值阶段求值 ❌ */
/* 计算值：calc(100% - 50px) 或具体值 */
/* 使用值：950px */
```

**计算值阶段转换：**
- em, rem → px
- calc() 求值（部分）
- inherit 解析

**使用值阶段转换：**
- % → px（需要布局信息）
- auto → px（需要布局信息）
- min-content/max-content → px

**示例对比：**

**font-size（计算值阶段）**
```css
.box { font-size: 1.5em; }
/* 计算值：24px（已转换）*/
/* 使用值：24px */
```

**width（使用值阶段）**
```css
.box { width: 50%; }
/* 计算值：50%（保留）*/
/* 使用值：500px（需要父元素宽度）*/
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 实际值

### 题目

使用值和实际值的主要区别是什么？

**选项：**
- A. 计算方式不同
- B. 实际值考虑了浏览器限制（如亚像素）
- C. 使用值是理论值，实际值是渲染值
- D. 没有区别

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B, C

### 📖 解析

**使用值 vs 实际值**

**使用值**
- 理论上应该使用的值
- 完成布局计算后的值
- 可能包含小数

**实际值**
- 浏览器实际渲染的值
- 考虑设备限制
- 通常取整

**示例：**

**小数像素**
```css
.box { width: 33.333%; }

/* 父元素 1000px */
/* 使用值：333.333px */
/* 实际值：333px 或 334px（浏览器取整）*/
```

**设备像素比**
```css
.box { width: 100.5px; }

/* 使用值：100.5px */
/* 实际值（1x 显示器）：100px 或 101px */
/* 实际值（2x 显示器）：100.5px（可以半像素）*/
```

**亚像素渲染**
```css
.text {
  font-size: 14.5px;
}

/* 使用值：14.5px */
/* 实际值：取决于浏览器和设备
   - Chrome：可能渲染 14.5px
   - 其他：可能取整为 14px 或 15px
*/
```

**浏览器限制：**
```css
/* 1. 最小字体 */
font-size: 8px;
/* 使用值：8px */
/* 实际值：12px（浏览器最小字体限制）*/

/* 2. 颜色精度 */
color: rgba(255, 0, 0, 0.333);
/* 使用值：rgba(255, 0, 0, 0.333) */
/* 实际值：rgba(255, 0, 0, 0.33)（精度限制）*/
```

**获取实际值：**
```javascript
// 使用值
const computed = getComputedStyle(element);
computed.width;  // "333.333px"

// 实际值（近似）
element.offsetWidth;  // 333（浏览器取整）
```

</details>

---

## 第 7 题 🟡

**类型：** 单选题  
**标签：** 层叠值

### 题目

以下哪个不会产生层叠值？

**选项：**
- A. CSS 文件中的声明
- B. 内联样式
- C. 浏览器默认样式
- D. JavaScript 读取的样式

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**层叠值的来源**

**✅ 产生层叠值：**

**A. CSS 文件**
```css
.box { color: red; }
/* 参与层叠 ✅ */
```

**B. 内联样式**
```html
<div style="color: blue;">
<!-- 参与层叠 ✅ -->
```

**C. 浏览器默认**
```css
/* User Agent Stylesheet */
a { color: blue; }
/* 参与层叠 ✅ */
```

**❌ D. JavaScript 读取**
```javascript
const color = getComputedStyle(element).color;
/* 只是读取，不参与层叠 ❌ */
```

**层叠值的确定：**
```
1. 收集所有声明值
2. 按来源和重要性排序
3. 比较特异性
4. 比较顺序
5. 确定层叠值
```

**JavaScript 的作用：**
```javascript
// 读取（不影响层叠）
getComputedStyle(element).color;

// 设置（参与层叠）
element.style.color = 'red';  /* 等同于内联样式 */
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 复杂计算

### 题目

以下代码中，`.box` 的最终宽度（使用值）是多少？

```css
.container { width: 1000px; }
.box {
  width: calc(50% + 2em);
  font-size: 16px;
  padding: 10px;
  box-sizing: border-box;
}
```

**选项：**
- A. 500px
- B. 532px
- C. 512px
- D. 552px

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**复杂值计算过程**

**第一步：计算 calc() 表达式**
```css
width: calc(50% + 2em);

/* 50% = 1000px × 50% = 500px */
/* 2em = 16px × 2 = 32px */
/* 结果：500px + 32px = 532px */
```

**第二步：考虑 box-sizing**
```css
box-sizing: border-box;
padding: 10px;

/* border-box：width 包含 padding */
/* 总宽度 = 532px ✅ */
/* content 宽度 = 532 - 10×2 = 512px */
```

**如果是 content-box：**
```css
box-sizing: content-box;  /* 假设 */
padding: 10px;

/* content-box：width 只是内容 */
/* content = 532px */
/* 总宽度 = 532 + 10×2 = 552px */
```

**完整计算：**
```
1. 声明值：calc(50% + 2em)
2. 计算值：calc(50% + 32px)（em转px）
3. 使用值：532px（%转px，calc求值）
4. 实际值：532px

box-sizing: border-box
→ 总宽度 = 532px ✅
→ content = 532 - 20 = 512px
```

**详细分解：**
```css
/* 父元素 */
.container { width: 1000px; }

/* 子元素 */
.box {
  /* 1. 计算 2em */
  font-size: 16px;
  /* 2em = 32px */
  
  /* 2. 计算 50% */
  /* 50% = 500px */
  
  /* 3. calc() 求值 */
  width: calc(500px + 32px);
  /* = 532px */
  
  /* 4. box-sizing */
  box-sizing: border-box;
  /* 总宽度 = 532px（包含padding）*/
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 继承计算值

### 题目

以下代码中，`getComputedStyle(span).lineHeight` 返回什么？

```css
div {
  font-size: 16px;
  line-height: 1.5;
}

span {
  font-size: 20px;
}
```

```html
<div>
  <span>Text</span>
</div>
```

**选项：**
- A. "1.5"
- B. "24px"
- C. "30px"
- D. "normal"

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**line-height 继承特性**

**无单位数值的继承：**
```css
div {
  font-size: 16px;
  line-height: 1.5;  /* 无单位数值 */
}

span {
  font-size: 20px;
  /* 继承的是数值 1.5，而非计算值 */
}
```

**计算过程：**
```
1. div 的 line-height
   声明值：1.5
   计算值：1.5（保留数值）
   使用值：24px（1.5 × 16px）

2. span 继承
   继承值：1.5（数值本身）
   计算值：1.5
   使用值：30px（1.5 × 20px）
```

**getComputedStyle 返回：**
```javascript
getComputedStyle(span).lineHeight;
// 返回："1.5"（计算值）✅
// 不是："30px"（使用值）
```

**对比不同单位：**

**无单位数值**
```css
div { line-height: 1.5; }
/* 计算值：1.5 */
/* 子元素继承：1.5（数值）*/
```

**百分比**
```css
div {
  font-size: 16px;
  line-height: 150%;
}
/* 计算值：150% 或 24px */
/* 子元素继承：24px（计算后的像素值）*/
```

**像素值**
```css
div { line-height: 24px; }
/* 计算值：24px */
/* 子元素继承：24px */
```

**em 单位**
```css
div {
  font-size: 16px;
  line-height: 1.5em;
}
/* 计算值：24px（1.5 × 16）*/
/* 子元素继承：24px */
```

**最佳实践：**
```css
/* ✅ 推荐：使用无单位数值 */
body { line-height: 1.6; }
/* 子元素自动根据自己的 font-size 计算 */

/* ❌ 避免：固定像素 */
body { line-height: 24px; }
/* 子元素继承固定值，可能不合适 */
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 综合应用

### 题目

关于 CSS 值计算，以下说法正确的是？

**选项：**
- A. 计算值阶段会解析相对单位
- B. 使用值阶段需要布局信息
- C. 实际值可能与使用值不同
- D. 声明值总是字符串

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**CSS 值计算综合分析**

**✅ A. 计算值解析相对单位**
```css
.box {
  font-size: 1.5em;
}

/* 声明值：1.5em */
/* 计算值：24px（相对单位转绝对）✅ */
```

**✅ B. 使用值需要布局**
```css
.box {
  width: 50%;
}

/* 计算值：50%（保留）*/
/* 使用值：500px（需要知道父元素宽度）✅ */
```

**✅ C. 实际值可能不同**
```css
.box {
  width: 33.333%;
}

/* 使用值：333.333px */
/* 实际值：333px（浏览器取整）✅ */
```

**❌ D. 声明值不总是字符串（错误）**
```javascript
// CSSOM 中的声明值
const rule = styleSheet.cssRules[0];
rule.style.width;  // 可能是字符串或对象
```

**完整示例：**

```css
.parent {
  width: 1000px;
  font-size: 16px;
}

.child {
  width: 50%;
  font-size: 1.5em;
  margin: auto;
}
```

**width 计算：**
```
声明值：50%
层叠值：50%
指定值：50%
计算值：50%（保留）
使用值：500px（需要父元素）✅
实际值：500px
```

**font-size 计算：**
```
声明值：1.5em
层叠值：1.5em
指定值：1.5em
计算值：24px（相对转绝对）✅
使用值：24px
实际值：24px
```

**margin 计算：**
```
声明值：auto
层叠值：auto
指定值：auto
计算值：auto
使用值：250px（居中计算）✅
实际值：250px
```

**关键区别：**

| 阶段 | 特点 | 示例 |
|------|------|------|
| 声明值 | 所有声明 | 50%, 100px |
| 层叠值 | 层叠后的值 | 100px |
| 指定值 | 确定的值 | 100px |
| 计算值 | 解析相对值 | 1.5em → 24px |
| 使用值 | 布局后的值 | 50% → 500px |
| 实际值 | 渲染的值 | 500.5px → 500px |

</details>

---

**导航**  
[上一章：第 8 章 - 继承机制](./chapter-08.md) | [返回目录](../README.md) | [下一章：第 10 章 - 单位与值转换](./chapter-10.md)
