# 第 4 章：基础样式属性

## 概述

掌握文本、字体、颜色、背景等基础样式属性，是创建美观网页的基础。本章介绍常用的样式属性及其应用。

---

## 一、文本样式

### 1.1 文本颜色

```css
.text {
  color: red;                    /* 关键字 */
  color: #333;                   /* 十六进制 */
  color: #333333;
  color: rgb(51, 51, 51);        /* RGB */
  color: rgba(51, 51, 51, 0.8);  /* RGBA (透明度) */
  color: hsl(0, 0%, 20%);        /* HSL */
  color: hsla(0, 0%, 20%, 0.8);  /* HSLA */
}
```

### 1.2 文本对齐

```css
.text {
  text-align: left;       /* 左对齐（默认） */
  text-align: right;      /* 右对齐 */
  text-align: center;     /* 居中 */
  text-align: justify;    /* 两端对齐 */
}

/* 垂直对齐 */
.inline {
  vertical-align: baseline;  /* 基线对齐（默认） */
  vertical-align: top;       /* 顶部对齐 */
  vertical-align: middle;    /* 中间对齐 */
  vertical-align: bottom;    /* 底部对齐 */
  vertical-align: 10px;      /* 数值偏移 */
}
```

### 1.3 文本装饰

```css
.text {
  /* 下划线 */
  text-decoration: underline;
  text-decoration: overline;        /* 上划线 */
  text-decoration: line-through;    /* 删除线 */
  text-decoration: none;            /* 无装饰 */
  
  /* CSS3 详细控制 */
  text-decoration-line: underline;
  text-decoration-color: red;
  text-decoration-style: wavy;      /* solid | double | dotted | dashed | wavy */
  text-decoration-thickness: 2px;
}

/* 链接去除下划线 */
a {
  text-decoration: none;
}
```

### 1.4 文本转换

```css
.text {
  text-transform: uppercase;     /* 大写 */
  text-transform: lowercase;     /* 小写 */
  text-transform: capitalize;    /* 首字母大写 */
  text-transform: none;          /* 无转换 */
}
```

### 1.5 文本缩进与间距

```css
.text {
  /* 首行缩进 */
  text-indent: 2em;
  
  /* 字符间距 */
  letter-spacing: 2px;
  letter-spacing: 0.1em;
  
  /* 单词间距 */
  word-spacing: 5px;
  
  /* 行高 */
  line-height: 1.6;      /* 相对值（推荐） */
  line-height: 24px;     /* 绝对值 */
  line-height: 150%;     /* 百分比 */
}
```

### 1.6 空白处理

```css
.text {
  white-space: normal;       /* 默认，合并空白 */
  white-space: nowrap;       /* 不换行 */
  white-space: pre;          /* 保留空白 */
  white-space: pre-wrap;     /* 保留空白，自动换行 */
  white-space: pre-line;     /* 合并空白，保留换行 */
}

/* 单词换行 */
.text {
  word-break: normal;        /* 默认 */
  word-break: break-all;     /* 任意位置断行 */
  word-break: keep-all;      /* 只在空格处断行 */
  
  overflow-wrap: break-word; /* 长单词换行 */
}
```

---

## 二、字体样式

### 2.1 字体族

```css
.text {
  /* 通用字体族 */
  font-family: serif;        /* 衬线字体 */
  font-family: sans-serif;   /* 无衬线字体 */
  font-family: monospace;    /* 等宽字体 */
  font-family: cursive;      /* 手写字体 */
  font-family: fantasy;      /* 艺术字体 */
  
  /* 具体字体 */
  font-family: Arial, Helvetica, sans-serif;
  font-family: "Times New Roman", Times, serif;
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
}
```

> 📌 **最佳实践**：始终提供后备字体，通用字体族作为最后选择。

### 2.2 字体大小

```css
.text {
  font-size: 16px;           /* 绝对单位 */
  font-size: 1em;            /* 相对父元素 */
  font-size: 1rem;           /* 相对根元素 */
  font-size: 100%;           /* 百分比 */
  font-size: larger;         /* 关键字 */
  font-size: smaller;
}
```

### 2.3 字体粗细

```css
.text {
  font-weight: normal;       /* 400 */
  font-weight: bold;         /* 700 */
  font-weight: lighter;      /* 更细 */
  font-weight: bolder;       /* 更粗 */
  font-weight: 100;          /* 100-900 */
}
```

### 2.4 字体样式

```css
.text {
  font-style: normal;        /* 正常 */
  font-style: italic;        /* 斜体 */
  font-style: oblique;       /* 倾斜 */
}
```

### 2.5 字体简写

```css
/* font: style weight size/line-height family */
.text {
  font: italic bold 16px/1.6 Arial, sans-serif;
  font: 14px/1.5 "Microsoft YaHei", sans-serif;
}

/* 最简形式（必须包含 size 和 family） */
.text {
  font: 16px Arial;
}
```

### 2.6 自定义字体

```css
@font-face {
  font-family: 'MyFont';
  src: url('myfont.woff2') format('woff2'),
       url('myfont.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;        /* 字体加载策略 */
}

.custom {
  font-family: 'MyFont', sans-serif;
}
```

---

## 三、颜色系统

### 3.1 颜色表示方法

```css
.box {
  /* 关键字 */
  color: red;
  color: transparent;        /* 透明 */
  color: currentColor;       /* 当前文本颜色 */
  
  /* 十六进制 */
  color: #f00;               /* 简写 */
  color: #ff0000;
  color: #ff0000ff;          /* 带透明度 */
  
  /* RGB/RGBA */
  color: rgb(255, 0, 0);
  color: rgba(255, 0, 0, 0.5);
  
  /* HSL/HSLA */
  color: hsl(0, 100%, 50%);  /* 色相, 饱和度, 亮度 */
  color: hsla(0, 100%, 50%, 0.5);
}
```

### 3.2 透明度

```css
.box {
  /* 整体透明 */
  opacity: 0.5;              /* 0-1 */
  
  /* 颜色透明 */
  background: rgba(0, 0, 0, 0.5);
  color: hsla(120, 100%, 50%, 0.8);
}
```

> ⚠️ **区别**：`opacity` 影响整个元素及子元素，`rgba/hsla` 只影响特定属性。

---

## 四、背景样式

### 4.1 背景颜色

```css
.box {
  background-color: #f5f5f5;
  background-color: rgba(0, 0, 0, 0.1);
  background-color: transparent;
}
```

### 4.2 背景图片

```css
.box {
  background-image: url('bg.jpg');
  background-image: url('data:image/png;base64,...');
  
  /* 多背景 */
  background-image: url('fg.png'), url('bg.jpg');
}
```

### 4.3 背景重复

```css
.box {
  background-repeat: repeat;     /* 默认，平铺 */
  background-repeat: no-repeat;  /* 不重复 */
  background-repeat: repeat-x;   /* 水平重复 */
  background-repeat: repeat-y;   /* 垂直重复 */
  background-repeat: space;      /* 均匀分布 */
  background-repeat: round;      /* 拉伸平铺 */
}
```

### 4.4 背景位置

```css
.box {
  /* 关键字 */
  background-position: center;
  background-position: top left;
  background-position: right bottom;
  
  /* 数值 */
  background-position: 50% 50%;
  background-position: 10px 20px;
  
  /* 混合 */
  background-position: center top;
  background-position: right 10px bottom 20px;
}
```

### 4.5 背景尺寸

```css
.box {
  background-size: auto;         /* 默认 */
  background-size: 100px 50px;   /* 宽 高 */
  background-size: 50%;          /* 百分比 */
  background-size: cover;        /* 覆盖容器 */
  background-size: contain;      /* 完整显示 */
}
```

**cover vs contain**：
- `cover`：完全覆盖，可能裁剪
- `contain`：完整显示，可能留白

### 4.6 背景固定

```css
.box {
  background-attachment: scroll;  /* 默认，随内容滚动 */
  background-attachment: fixed;   /* 相对视口固定 */
  background-attachment: local;   /* 随元素内容滚动 */
}
```

### 4.7 背景裁剪与原点

```css
.box {
  /* 背景绘制区域 */
  background-clip: border-box;    /* 默认，包含边框 */
  background-clip: padding-box;   /* 不包含边框 */
  background-clip: content-box;   /* 仅内容区 */
  background-clip: text;          /* 文字裁剪 */
  
  /* 背景定位参考 */
  background-origin: padding-box; /* 默认 */
  background-origin: border-box;
  background-origin: content-box;
}
```

### 4.8 背景简写

```css
.box {
  /* background: color image repeat position / size attachment */
  background: #f5f5f5 url('bg.jpg') no-repeat center / cover fixed;
  
  /* 多背景 */
  background: 
    url('top.png') no-repeat top,
    url('bottom.png') no-repeat bottom,
    #fff;
}
```

---

## 五、渐变背景

### 5.1 线性渐变

```css
.box {
  /* 基本语法 */
  background: linear-gradient(direction, color1, color2, ...);
  
  /* 从上到下 */
  background: linear-gradient(to bottom, red, blue);
  background: linear-gradient(red, blue);  /* 简写 */
  
  /* 指定角度 */
  background: linear-gradient(45deg, red, blue);
  background: linear-gradient(to top right, red, blue);
  
  /* 多个颜色 */
  background: linear-gradient(red, yellow, green, blue);
  
  /* 色标位置 */
  background: linear-gradient(red 0%, yellow 50%, blue 100%);
  background: linear-gradient(red 20%, yellow 80%);
  
  /* 硬边 */
  background: linear-gradient(red 50%, blue 50%);
}
```

### 5.2 径向渐变

```css
.box {
  /* 基本语法 */
  background: radial-gradient(shape size at position, color1, color2);
  
  /* 圆形 */
  background: radial-gradient(circle, red, blue);
  
  /* 椭圆（默认） */
  background: radial-gradient(ellipse, red, blue);
  
  /* 指定位置 */
  background: radial-gradient(circle at center, red, blue);
  background: radial-gradient(at top left, red, blue);
  
  /* 指定大小 */
  background: radial-gradient(circle 100px, red, blue);
  background: radial-gradient(closest-side, red, blue);
  background: radial-gradient(farthest-corner, red, blue);
}
```

### 5.3 锥形渐变

```css
.box {
  /* 基本语法 */
  background: conic-gradient(from angle at position, color1, color2);
  
  /* 色轮 */
  background: conic-gradient(red, yellow, green, blue, red);
  
  /* 饼图 */
  background: conic-gradient(
    red 0deg 90deg,
    yellow 90deg 180deg,
    green 180deg 270deg,
    blue 270deg 360deg
  );
}
```

### 5.4 重复渐变

```css
.box {
  background: repeating-linear-gradient(45deg, 
    red 0px, red 10px,
    blue 10px, blue 20px
  );
  
  background: repeating-radial-gradient(circle,
    red 0px, red 10px,
    blue 10px, blue 20px
  );
}
```

---

## 六、阴影效果

### 6.1 文本阴影

```css
.text {
  /* text-shadow: x y blur color */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  
  /* 多重阴影 */
  text-shadow: 
    1px 1px 2px red,
    2px 2px 4px blue,
    3px 3px 6px green;
  
  /* 发光效果 */
  text-shadow: 0 0 10px #fff,
               0 0 20px #fff,
               0 0 30px #ff00de;
}
```

### 6.2 盒阴影

```css
.box {
  /* box-shadow: x y blur spread color inset */
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  
  /* 扩展半径 */
  box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.2);
  
  /* 内阴影 */
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
  
  /* 多重阴影 */
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.1);
}
```

---

## 七、列表样式

### 7.1 列表标记

```css
ul, ol {
  /* 标记类型 */
  list-style-type: disc;         /* 实心圆（默认 ul） */
  list-style-type: circle;       /* 空心圆 */
  list-style-type: square;       /* 方块 */
  list-style-type: decimal;      /* 数字（默认 ol） */
  list-style-type: lower-alpha;  /* 小写字母 */
  list-style-type: upper-roman;  /* 大写罗马数字 */
  list-style-type: none;         /* 无标记 */
  
  /* 标记位置 */
  list-style-position: outside;  /* 默认，标记在外 */
  list-style-position: inside;   /* 标记在内 */
  
  /* 自定义标记图片 */
  list-style-image: url('marker.png');
  
  /* 简写 */
  list-style: square inside url('marker.png');
}
```

---

## 八、实用技巧

### 8.1 文本省略

```css
/* 单行省略 */
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 多行省略（Webkit） */
.multi-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### 8.2 背景半透明

```css
/* 只让背景半透明，文字不透明 */
.box {
  background: rgba(0, 0, 0, 0.5);
  color: white;
}
```

### 8.3 渐变文字

```css
.gradient-text {
  background: linear-gradient(45deg, red, blue);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 参考资料

- [MDN - CSS 文本样式](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Text)
- [MDN - CSS 背景](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Backgrounds_and_Borders)
- [CSS Gradient Generator](https://cssgradient.io/)

---

**导航**  
[上一章：第 3 章 - 盒模型基础](./03-box-model.md)  
[返回目录](../README.md)  
[下一章：第 5 章 - CSS解析机制](./05-css-parsing.md)
