# 第 20 章：定位原理

## 概述

CSS定位是布局的核心技术之一，理解各种定位算法能够精确控制元素位置。

---

## 一、定位类型

### 1.1 五种定位方式

```css
.box {
  position: static;      /* 静态（默认） */
  position: relative;    /* 相对定位 */
  position: absolute;    /* 绝对定位 */
  position: fixed;       /* 固定定位 */
  position: sticky;      /* 粘性定位 */
}
```

---

## 二、static - 静态定位

### 2.1 特点

- 默认值
- 按正常流布局
- top/right/bottom/left无效
- z-index无效

```css
.static {
  position: static;
  top: 100px;        /* 无效 */
}
```

---

## 三、relative - 相对定位

### 3.1 特点

- 相对自身原位置偏移
- 仍占据原空间
- 不影响其他元素布局

```css
.relative {
  position: relative;
  top: 20px;         /* 向下偏移 */
  left: 30px;        /* 向右偏移 */
}
```

### 3.2 应用场景

```css
/* 为absolute子元素创建包含块 */
.parent {
  position: relative;
}

.child {
  position: absolute;
  top: 0;
  left: 0;
}
```

---

## 四、absolute - 绝对定位

### 4.1 特点

- 脱离正常流
- 相对最近的非static祖先定位
- 不占据空间

```css
.absolute {
  position: absolute;
  top: 50px;
  left: 100px;
}
```

### 4.2 包含块

```css
/* 查找定位祖先 */
.grandparent { position: relative; }  /* 找到 */
.parent { /* static */ }
.child { position: absolute; }  /* 相对grandparent */
```

### 4.3 居中定位

```css
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 或使用margin */
.center {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}
```

---

## 五、fixed - 固定定位

### 5.1 特点

- 脱离正常流
- 相对视口定位
- 滚动时固定

```css
.fixed {
  position: fixed;
  top: 0;
  right: 0;
}
```

### 5.2 应用场景

```css
/* 固定导航 */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
}

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
```

### 5.3 transform陷阱

```css
.parent {
  transform: translateZ(0);  /* 改变fixed包含块！ */
}

.child {
  position: fixed;
  /* 现在相对parent，而非视口 */
}
```

---

## 六、sticky - 粘性定位

### 6.1 特点

- relative和fixed的混合
- 正常流中，到达阈值后固定

```css
.sticky {
  position: sticky;
  top: 0;            /* 距顶部0px时固定 */
}
```

### 6.2 工作原理

```
滚动前：position: relative
滚动中：position: fixed（到达top值）
滚动后：恢复relative
```

### 6.3 使用条件

```css
/* 必须指定至少一个阈值 */
.sticky {
  position: sticky;
  top: 0;            /* 必需 */
}

/* 父元素不能overflow: hidden */
.parent {
  /* overflow: hidden; */ /* ❌ sticky失效 */
}
```

### 6.4 应用场景

```css
/* 吸顶导航 */
.header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
}

/* 表格标题 */
thead th {
  position: sticky;
  top: 0;
  background: #f5f5f5;
}
```

---

## 七、偏移属性

### 7.1 top/right/bottom/left

```css
.positioned {
  position: absolute;
  top: 10px;         /* 距顶部 */
  right: 20px;       /* 距右边 */
  bottom: 30px;      /* 距底部 */
  left: 40px;        /* 距左边 */
}
```

### 7.2 同时设置对边

```css
/* 拉伸元素 */
.stretch {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  /* 充满包含块 */
}
```

---

## 八、定位与宽高

### 8.1 absolute宽度收缩

```css
/* 默认宽度收缩为内容宽度 */
.absolute {
  position: absolute;
  /* width: auto（收缩） */
}

/* 拉伸宽度 */
.stretch {
  position: absolute;
  left: 0;
  right: 0;
  /* width自动计算 */
}
```

---

## 九、实用案例

### 9.1 全屏遮罩

```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}
```

### 9.2 角标徽章

```css
.badge-container {
  position: relative;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: red;
  border-radius: 50%;
}
```

### 9.3 吸底按钮

```css
.footer-btn {
  position: sticky;
  bottom: 0;
  background: white;
}
```

---

## 参考资料

- [MDN - position](https://developer.mozilla.org/zh-CN/docs/Web/CSS/position)
- [CSS Positioned Layout](https://www.w3.org/TR/css-position-3/)

---

**导航**  
[上一章：第 19 章 - z-index详解](./19-z-index.md)  
[返回目录](../README.md)  
[下一章：第 21 章 - 偏移属性计算](./21-offset-properties.md)
