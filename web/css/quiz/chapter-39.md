# 第 39 章：混合模式 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** mix-blend-mode

### 题目

`mix-blend-mode` 的作用是？

**选项：**
- A. 混合颜色
- B. 元素与背景的混合模式
- C. 透明度
- D. 滤镜

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

```css
.overlay {
  mix-blend-mode: multiply;
  /* 元素与下方内容混合 */
}
```

**常用混合模式：**
```css
mix-blend-mode: normal;      /* 正常 */
mix-blend-mode: multiply;    /* 正片叠底 */
mix-blend-mode: screen;      /* 滤色 */
mix-blend-mode: overlay;     /* 叠加 */
mix-blend-mode: difference;  /* 差值 */
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** background-blend-mode

### 题目

`background-blend-mode` 作用于？

**选项：**
- A. 元素与背景
- B. 多个背景图层之间
- C. 文本与背景
- D. 边框与背景

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

```css
.box {
  background: 
    url('pattern.png'),
    linear-gradient(to right, red, blue);
  background-blend-mode: multiply;
  /* 背景图与渐变混合 */
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** isolation

### 题目

`isolation: isolate` 可以创建新的层叠上下文。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

```css
.container {
  isolation: isolate;
  /* 创建新的层叠上下文，隔离混合效果 */
}
```

**用途：限制 mix-blend-mode 的影响范围**
```css
.parent {
  isolation: isolate;
}

.child {
  mix-blend-mode: multiply;
  /* 只与 parent 内的元素混合 */
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 混合模式类型

### 题目

混合模式包括哪些类型？

**选项：**
- A. multiply, screen, overlay
- B. darken, lighten, color-dodge
- C. difference, exclusion, hue
- D. saturation, color, luminosity

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**所有混合模式（全部正确）**

**✅ A. 基础混合**
```css
multiply      /* 正片叠底 */
screen        /* 滤色 */
overlay       /* 叠加 */
```

**✅ B. 变暗/变亮**
```css
darken        /* 变暗 */
lighten       /* 变亮 */
color-dodge   /* 颜色减淡 */
color-burn    /* 颜色加深 */
```

**✅ C. 对比**
```css
difference    /* 差值 */
exclusion     /* 排除 */
hue           /* 色相 */
```

**✅ D. 颜色**
```css
saturation    /* 饱和度 */
color         /* 颜色 */
luminosity    /* 明度 */
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 文本混合

### 题目

如何实现文字与背景图片混合？

**选项：**
- A. color + mix-blend-mode
- B. background-clip + mix-blend-mode
- C. filter
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
.text-blend {
  background: url('image.jpg');
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  mix-blend-mode: multiply;
}
```

**或者：**
```css
.text-overlay {
  position: relative;
  color: white;
  mix-blend-mode: difference;
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 双色调效果

### 题目

使用混合模式实现双色调图片？

**选项：**
- A. filter
- B. background-blend-mode
- C. mix-blend-mode
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
.duotone {
  background-image: 
    linear-gradient(to right, #ff0080, #00ffff),
    url('photo.jpg');
  background-size: cover;
  background-blend-mode: multiply;
}
```

**高级双色调：**
```css
.duotone-advanced {
  background: 
    linear-gradient(to right, #ff0080, #00ffff),
    url('photo.jpg');
  background-size: cover;
  background-blend-mode: screen;
  filter: grayscale(100%) contrast(1.2);
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 实用场景

### 题目

mix-blend-mode 的实用场景？

**选项：**
- A. 文字效果
- B. 图片叠加
- C. 按钮效果
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**实用场景（全部正确）**

**A. 文字效果：**
```css
.title {
  color: white;
  mix-blend-mode: difference;
  /* 根据背景自动反色 */
}
```

**B. 图片叠加：**
```css
.image-overlay {
  position: absolute;
  background: rgba(255, 0, 0, 0.5);
  mix-blend-mode: multiply;
}
```

**C. 按钮效果：**
```css
.button::before {
  content: '';
  background: white;
  mix-blend-mode: overlay;
  opacity: 0;
  transition: opacity 0.3s;
}

.button:hover::before {
  opacity: 1;
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 性能影响

### 题目

混合模式对性能的影响？

**选项：**
- A. 无影响
- B. 创建合成层，GPU加速
- C. 可能影响绘制性能
- D. B和C

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**性能特点**

**✅ 创建合成层**
```css
.blend {
  mix-blend-mode: multiply;
  /* 创建独立合成层 */
}
```

**⚠️ 绘制开销**
```css
/* 复杂混合模式计算量大 */
mix-blend-mode: overlay;
mix-blend-mode: color-dodge;
```

**优化建议：**
```css
/* 1. 限制使用范围 */
.small-area {
  mix-blend-mode: multiply;
}

/* 2. 避免大面积使用 */
/* ❌ */
body {
  mix-blend-mode: multiply;
}

/* 3. 静态使用，避免动画 */
/* ❌ */
@keyframes blendAnimation {
  from { mix-blend-mode: normal; }
  to { mix-blend-mode: multiply; }
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 浏览器兼容性

### 题目

混合模式的兼容性如何？

**选项：**
- A. 所有浏览器都支持
- B. 现代浏览器支持，需要降级方案
- C. 不支持
- D. B 正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**降级方案**

```css
.blend-effect {
  /* 降级：使用透明度 */
  background: rgba(255, 0, 0, 0.5);
}

/* 渐进增强 */
@supports (mix-blend-mode: multiply) {
  .blend-effect {
    background: red;
    mix-blend-mode: multiply;
  }
}
```

**检测支持：**
```javascript
if (CSS.supports('mix-blend-mode', 'multiply')) {
  element.classList.add('supports-blend-mode');
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 最佳实践

### 题目

使用混合模式的最佳实践？

**选项：**
- A. 小范围使用
- B. 提供降级方案
- C. 避免动画
- D. 使用 isolation 隔离

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**最佳实践（全部正确）**

**✅ A. 小范围使用**
```css
.icon {
  mix-blend-mode: multiply;
}
```

**✅ B. 降级方案**
```css
.effect {
  opacity: 0.8;
}

@supports (mix-blend-mode: multiply) {
  .effect {
    opacity: 1;
    mix-blend-mode: multiply;
  }
}
```

**✅ C. 避免动画**
```css
/* ✅ 静态使用 */
.blend {
  mix-blend-mode: multiply;
}

/* ❌ 避免动画 */
.blend {
  transition: mix-blend-mode 0.3s;
}
```

**✅ D. 使用 isolation**
```css
.container {
  isolation: isolate;
}

.child {
  mix-blend-mode: multiply;
  /* 只在容器内混合 */
}
```

</details>

---

**导航**  
[上一章：第 38 章 - Filter滤镜](./chapter-38.md) | [返回目录](../README.md) | [下一章：第 40 章 - 自定义属性](./chapter-40.md)
