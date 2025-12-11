# 第 3 章：盒模型基础

## 概述

盒模型是CSS布局的基础。每个HTML元素都被视为一个矩形盒子，理解盒模型对于精确控制元素尺寸和布局至关重要。

---

## 一、盒模型组成

### 1.1 四个区域

```
┌─────────────────────────────────┐
│         Margin（外边距）          │
│  ┌──────────────────────────┐   │
│  │   Border（边框）          │   │
│  │  ┌────────────────────┐  │   │
│  │  │ Padding（内边距）   │  │   │
│  │  │  ┌──────────────┐  │  │   │
│  │  │  │   Content    │  │  │   │
│  │  │  │  （内容区）   │  │  │   │
│  │  │  └──────────────┘  │  │   │
│  │  └────────────────────┘  │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

```css
.box {
  /* 内容区 */
  width: 200px;
  height: 100px;
  
  /* 内边距 */
  padding: 20px;
  
  /* 边框 */
  border: 5px solid #333;
  
  /* 外边距 */
  margin: 10px;
}
```

---

## 二、标准盒模型 vs 怪异盒模型

### 2.1 标准盒模型（content-box）

```css
.box {
  box-sizing: content-box; /* 默认值 */
  width: 200px;
  padding: 20px;
  border: 5px solid;
}

/* 实际宽度 = 200 + 20*2 + 5*2 = 250px */
```

**计算规则**：
- `width/height` 只包含内容区
- 实际宽度 = `width + padding*2 + border*2`

### 2.2 怪异盒模型（border-box）

```css
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid;
}

/* 实际宽度 = 200px */
/* 内容区宽度 = 200 - 20*2 - 5*2 = 150px */
```

**计算规则**：
- `width/height` 包含 content + padding + border
- 内容区自动调整

### 2.3 全局设置（推荐）

```css
/* 统一使用 border-box */
*, *::before, *::after {
  box-sizing: border-box;
}
```

> 📌 **最佳实践**：使用 `border-box` 更符合直觉，便于布局计算。

---

## 三、width 和 height

### 3.1 宽度属性

```css
.box {
  width: 200px;          /* 固定宽度 */
  min-width: 100px;      /* 最小宽度 */
  max-width: 500px;      /* 最大宽度 */
}

/* 百分比宽度 */
.container {
  width: 80%;            /* 相对父元素 */
}

/* 自适应 */
.auto {
  width: auto;           /* 默认值 */
}
```

### 3.2 高度属性

```css
.box {
  height: 100px;         /* 固定高度 */
  min-height: 50px;      /* 最小高度 */
  max-height: 200px;     /* 最大高度 */
}

/* 自适应内容 */
.content {
  height: auto;          /* 根据内容自动 */
}
```

### 3.3 特殊值

```css
/* fit-content：适应内容 */
.box {
  width: fit-content;
}

/* min-content：最小内容宽度 */
.box {
  width: min-content;
}

/* max-content：最大内容宽度 */
.box {
  width: max-content;
}
```

---

## 四、padding 内边距

### 4.1 基本用法

```css
/* 四个方向相同 */
.box { padding: 20px; }

/* 上下 | 左右 */
.box { padding: 10px 20px; }

/* 上 | 左右 | 下 */
.box { padding: 10px 20px 15px; }

/* 上 | 右 | 下 | 左 (顺时针) */
.box { padding: 10px 20px 15px 25px; }

/* 单独设置 */
.box {
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 15px;
  padding-left: 25px;
}
```

### 4.2 百分比 padding

```css
.box {
  width: 200px;
  padding: 10%; /* 相对于父元素宽度 */
}

/* 注意：padding 的百分比始终相对于宽度，包括 padding-top/bottom */
```

> 📌 **技巧**：利用 padding 百分比实现固定宽高比：

```css
/* 16:9 宽高比 */
.ratio-box {
  width: 100%;
  padding-bottom: 56.25%; /* 9/16 = 0.5625 */
  position: relative;
}
```

---

## 五、border 边框

### 5.1 边框属性

```css
.box {
  /* 简写 */
  border: 1px solid #333;
  
  /* 分别设置 */
  border-width: 1px;
  border-style: solid;
  border-color: #333;
}
```

### 5.2 边框样式

```css
.box {
  border-style: solid;   /* 实线 */
  border-style: dashed;  /* 虚线 */
  border-style: dotted;  /* 点线 */
  border-style: double;  /* 双线 */
  border-style: groove;  /* 凹槽 */
  border-style: ridge;   /* 凸起 */
  border-style: inset;   /* 嵌入 */
  border-style: outset;  /* 突出 */
  border-style: none;    /* 无边框 */
}
```

### 5.3 单边设置

```css
.box {
  border-top: 2px solid red;
  border-right: 1px dashed blue;
  border-bottom: 3px dotted green;
  border-left: 2px solid black;
}
```

### 5.4 圆角边框

```css
/* 四个角相同 */
.box { border-radius: 10px; }

/* 左上/右下 | 右上/左下 */
.box { border-radius: 10px 20px; }

/* 左上 | 右上/左下 | 右下 */
.box { border-radius: 10px 20px 15px; }

/* 左上 | 右上 | 右下 | 左下 */
.box { border-radius: 10px 20px 15px 25px; }

/* 椭圆角 */
.box { border-radius: 50px / 25px; }

/* 圆形 */
.circle { border-radius: 50%; }
```

---

## 六、margin 外边距

### 6.1 基本用法

```css
/* 语法同 padding */
.box { margin: 20px; }
.box { margin: 10px 20px; }
.box { margin: 10px 20px 15px; }
.box { margin: 10px 20px 15px 25px; }
```

### 6.2 auto 居中

```css
/* 水平居中 */
.center {
  width: 800px;
  margin: 0 auto;
}

/* 等同于 */
.center {
  margin-left: auto;
  margin-right: auto;
}
```

> ⚠️ **注意**：`margin: auto` 只能水平居中块级元素，垂直方向不生效。

### 6.3 负边距

```css
.box {
  margin-top: -10px;    /* 向上移动 */
  margin-left: -20px;   /* 向左移动 */
}

/* 应用：重叠效果 */
.overlap {
  margin-bottom: -50px;
}
```

### 6.4 外边距合并

```css
/* 垂直方向相邻元素的外边距会合并 */
.box1 { margin-bottom: 30px; }
.box2 { margin-top: 20px; }

/* 实际间距 = max(30px, 20px) = 30px */
```

**外边距合并场景**：
1. 相邻兄弟元素
2. 父子元素（无边框/内边距阻隔）
3. 空块级元素的上下外边距

**避免合并**：
```css
/* 方法1：使用 padding */
.parent { padding: 1px 0; }

/* 方法2：使用 border */
.parent { border: 1px solid transparent; }

/* 方法3：触发 BFC */
.parent { overflow: hidden; }
```

---

## 七、display 属性

### 7.1 块级元素（block）

```css
div, p, h1, ul, li {
  display: block;
}
```

**特点**：
- 独占一行
- 可设置宽高
- 默认宽度100%

### 7.2 行内元素（inline）

```css
span, a, strong, em {
  display: inline;
}
```

**特点**：
- 不独占一行
- 不可设置宽高
- 宽度由内容决定
- 垂直 padding/margin 不生效

### 7.3 行内块元素（inline-block）

```css
.box {
  display: inline-block;
}
```

**特点**：
- 不独占一行
- 可设置宽高
- 结合两者优点

**常见问题**：
```css
/* inline-block 间隙问题 */
.item { display: inline-block; }

/* 解决方案1：父元素 */
.parent { font-size: 0; }
.item { font-size: 16px; }

/* 解决方案2：注释 HTML */
<!-- <div>item1</div><!--
--><div>item2</div> -->
```

### 7.4 其他值

```css
.hide { display: none; }          /* 隐藏，不占空间 */
.flex { display: flex; }          /* 弹性布局 */
.grid { display: grid; }          /* 网格布局 */
.table { display: table; }        /* 表格布局 */
.inline-flex { display: inline-flex; }
```

---

## 八、overflow 溢出处理

### 8.1 overflow 属性

```css
.box {
  overflow: visible;  /* 默认，溢出可见 */
  overflow: hidden;   /* 隐藏溢出 */
  overflow: scroll;   /* 始终显示滚动条 */
  overflow: auto;     /* 需要时显示滚动条 */
}

/* 单独设置 */
.box {
  overflow-x: hidden;
  overflow-y: auto;
}
```

### 8.2 文本溢出

```css
/* 单行文本溢出 */
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 多行文本溢出 */
.multi-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 九、盒模型调试

### 9.1 Chrome DevTools

```
1. 右键 → 检查元素
2. 查看 Computed 标签页
3. 查看盒模型示意图
```

### 9.2 调试样式

```css
/* 查看所有元素边界 */
* {
  outline: 1px solid red;
}

/* 查看盒模型 */
.debug {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid red;
}
```

---

## 参考资料

- [MDN - 盒模型](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Box_Model)
- [CSS Box Model Specification](https://www.w3.org/TR/css-box-3/)

---

**导航**  
[上一章：第 2 章 - 选择器系统](./02-selectors.md)  
[返回目录](../README.md)  
[下一章：第 4 章 - 基础样式属性](./04-basic-styles.md)
