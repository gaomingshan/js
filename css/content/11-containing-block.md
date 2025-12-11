# 第 11 章：包含块

## 概述

包含块（Containing Block）是CSS定位和尺寸计算的参考框。理解包含块对于掌握定位和百分比计算至关重要。

---

## 一、包含块定义

### 1.1 什么是包含块

包含块是元素布局的参考区域，用于：
- 计算百分比宽高
- 确定定位元素的位置
- 计算auto值

```css
.parent { width: 1000px; }
.child {
  width: 50%;  /* 相对包含块：500px */
}
```

---

## 二、包含块的确定

### 2.1 static/relative定位

**包含块 = 最近的块级祖先元素的内容区**

```html
<div class="grandparent">
  <div class="parent">
    <div class="child"></div>
  </div>
</div>
```

```css
.parent {
  width: 800px;
  padding: 20px;
}

.child {
  position: static;  /* 或 relative */
  width: 50%;        /* 包含块 = parent的内容区 = 800px */
                     /* 实际宽度 = 400px */
}
```

### 2.2 absolute定位

**包含块 = 最近的非static定位祖先元素的padding区**

```css
.grandparent {
  position: relative;  /* 非static */
  width: 1000px;
  padding: 50px;
}

.parent {
  /* position: static（默认） */
  width: 800px;
}

.child {
  position: absolute;
  width: 50%;        /* 包含块 = grandparent的padding区 */
                     /* 包含块宽度 = 1000px + 50*2 = 1100px */
                     /* 实际宽度 = 550px */
}
```

### 2.3 fixed定位

**包含块 = 视口（viewport）**

```css
.child {
  position: fixed;
  width: 50%;        /* 包含块 = 视口 */
                     /* 宽度 = 视口宽度的50% */
  top: 0;            /* 相对视口定位 */
}
```

### 2.4 特殊情况：transform/filter

**包含块 = 该祖先元素的padding区**

```css
.parent {
  transform: translateZ(0);  /* 创建新包含块 */
  width: 800px;
}

.child {
  position: fixed;   /* 通常相对视口 */
  width: 50%;        /* 但现在相对parent = 400px */
}
```

---

## 三、包含块与百分比

### 3.1 宽度百分比

```css
.parent { width: 1000px; }
.child {
  width: 50%;        /* 相对包含块宽度 */
  padding: 10%;      /* 相对包含块宽度（注意！） */
}
```

### 3.2 高度百分比

```css
.parent {
  height: 500px;     /* 必须有明确高度 */
}

.child {
  height: 50%;       /* 250px */
}

/* 如果parent没有明确高度 */
.parent { height: auto; }
.child { height: 50%; }  /* 无效，auto */
```

### 3.3 padding/margin百分比

```css
.parent { width: 1000px; }
.child {
  padding-top: 10%;     /* 100px（相对宽度！） */
  padding-left: 10%;    /* 100px */
  margin-bottom: 5%;    /* 50px（相对宽度！） */
}
```

> 📌 **重点**：padding和margin的百分比始终相对包含块的**宽度**。

---

## 四、包含块与定位

### 4.1 absolute定位示例

```html
<div class="container">
  <div class="wrapper">
    <div class="box"></div>
  </div>
</div>
```

```css
.container {
  position: relative;
  width: 1000px;
  padding: 50px;
}

.wrapper {
  /* static定位，不创建包含块 */
  width: 800px;
}

.box {
  position: absolute;
  left: 10%;         /* 相对container的padding区 */
                     /* = (1000 + 100) * 10% = 110px */
  width: 50%;        /* = 550px */
}
```

### 4.2 多层嵌套

```css
.grandparent { position: relative; width: 1000px; }
.parent { position: relative; width: 800px; }
.child { position: absolute; width: 50%; }

/* child的包含块 = parent（最近的非static） = 400px */
```

---

## 五、初始包含块

### 5.1 定义

html元素的包含块称为**初始包含块**，大小等于视口。

```css
html {
  /* 包含块 = 初始包含块（视口） */
  width: 100%;       /* = 视口宽度 */
}
```

---

## 六、实用案例

### 6.1 居中定位

```css
.parent {
  position: relative;
  width: 1000px;
  height: 500px;
}

.child {
  position: absolute;
  left: 50%;                    /* 相对包含块 */
  top: 50%;
  transform: translate(-50%, -50%);  /* 相对自身 */
}
```

### 6.2 固定宽高比

```css
.box {
  width: 100%;
  padding-bottom: 56.25%;  /* 16:9（相对宽度） */
  position: relative;
}

.content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

### 6.3 全屏遮罩

```css
.overlay {
  position: fixed;   /* 包含块 = 视口 */
  top: 0;
  left: 0;
  width: 100%;       /* 视口宽度 */
  height: 100%;      /* 视口高度 */
}
```

---

## 七、调试技巧

### 7.1 可视化包含块

```css
/* 临时添加边框查看包含块 */
.parent {
  position: relative;
  border: 2px solid red;  /* 查看边界 */
}
```

### 7.2 Chrome DevTools

```
1. 检查元素
2. Computed → 查看width/height计算值
3. 追踪百分比来源
```

---

## 八、常见陷阱

### 8.1 高度百分比失效

```css
/* ❌ 不生效 */
.parent { height: auto; }
.child { height: 50%; }  /* auto，因为parent高度未定 */

/* ✅ 解决方案 */
.parent { height: 500px; }
.child { height: 50%; }  /* 250px */
```

### 8.2 transform改变包含块

```css
.parent { transform: translateZ(0); }
.child { position: fixed; }
/* child的包含块变为parent，而非视口！ */
```

---

## 参考资料

- [MDN - 包含块](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Containing_block)
- [CSS Positioning Specification](https://www.w3.org/TR/CSS2/visudet.html)

---

**导航**  
[上一章：第 10 章 - 单位与值转换](./10-units.md)  
[返回目录](../README.md)  
[下一章：第 12 章 - 正常流](./12-normal-flow.md)
