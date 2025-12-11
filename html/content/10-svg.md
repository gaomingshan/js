# 第 10 章：SVG 矢量图

## 概述

SVG（Scalable Vector Graphics）是基于 XML 的矢量图形格式，可以无限缩放而不失真。它是 Web 开发中图标、Logo、图表的首选格式。

## 一、SVG 基础

### 1.1 SVG 的三种使用方式

#### **1. 内联 SVG**

```html
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>
```

#### **2. 作为图片引用**

```html
<img src="icon.svg" alt="图标">
```

#### **3. 作为背景图**

```css
.icon {
  background-image: url('icon.svg');
}
```

> **💡 选择建议**
> 
> - **内联 SVG**：需要 CSS/JS 控制时
> - **`<img>`**：简单图标、Logo
> - **CSS 背景**：装饰性图形

### 1.2 基本结构

```html
<svg width="200" height="200" 
     viewBox="0 0 200 200"
     xmlns="http://www.w3.org/2000/svg">
  <!-- SVG 内容 -->
</svg>
```

**viewBox 说明：**
- `viewBox="x y width height"`
- 定义 SVG 的可视区域
- 实现响应式 SVG

```html
<!-- 固定尺寸 -->
<svg width="200" height="200">
  <circle cx="100" cy="100" r="50" />
</svg>

<!-- 响应式（保持宽高比） -->
<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="50" />
</svg>
```

## 二、基本图形

### 2.1 矩形 `<rect>`

```html
<svg width="300" height="200">
  <!-- 基本矩形 -->
  <rect x="10" y="10" width="100" height="50" fill="blue" />
  
  <!-- 圆角矩形 -->
  <rect x="120" y="10" width="100" height="50" 
        rx="10" ry="10" fill="green" />
  
  <!-- 描边矩形 -->
  <rect x="230" y="10" width="100" height="50" 
        fill="none" stroke="red" stroke-width="2" />
</svg>
```

### 2.2 圆形 `<circle>`

```html
<svg width="300" height="100">
  <circle cx="50" cy="50" r="40" fill="orange" />
  <circle cx="150" cy="50" r="40" fill="none" stroke="blue" stroke-width="3" />
</svg>
```

### 2.3 椭圆 `<ellipse>`

```html
<svg width="200" height="100">
  <ellipse cx="100" cy="50" rx="80" ry="30" fill="purple" />
</svg>
```

### 2.4 线条 `<line>`

```html
<svg width="200" height="200">
  <line x1="10" y1="10" x2="190" y2="190" 
        stroke="black" stroke-width="2" />
</svg>
```

### 2.5 折线 `<polyline>`

```html
<svg width="300" height="200">
  <polyline points="10,10 50,100 100,50 150,100 200,10" 
            fill="none" stroke="blue" stroke-width="2" />
</svg>
```

### 2.6 多边形 `<polygon>`

```html
<svg width="200" height="200">
  <!-- 三角形 -->
  <polygon points="100,10 190,190 10,190" fill="red" />
</svg>
```

## 三、路径 `<path>`

### 3.1 基本命令

```html
<svg width="200" height="200">
  <path d="M 10 10 L 100 100 L 10 100 Z" 
        fill="lightblue" stroke="blue" />
</svg>
```

**路径命令：**

| 命令 | 说明 | 示例 |
|-----|------|-----|
| `M x y` | 移动到 | `M 10 10` |
| `L x y` | 直线到 | `L 100 100` |
| `H x` | 水平线到 | `H 100` |
| `V y` | 垂直线到 | `V 100` |
| `Z` | 闭合路径 | `Z` |
| `C` | 三次贝塞尔曲线 | `C x1 y1 x2 y2 x y` |
| `Q` | 二次贝塞尔曲线 | `Q x1 y1 x y` |
| `A` | 弧线 | `A rx ry rotation large-arc sweep x y` |

> **💡 提示**  
> 大写命令使用绝对坐标，小写命令使用相对坐标。

### 3.2 曲线

```html
<svg width="300" height="200">
  <!-- 二次贝塞尔曲线 -->
  <path d="M 10 80 Q 95 10 180 80" 
        fill="none" stroke="blue" stroke-width="2" />
  
  <!-- 三次贝塞尔曲线 -->
  <path d="M 10 150 C 40 10 65 10 95 150 S 180 290 210 150" 
        fill="none" stroke="red" stroke-width="2" />
</svg>
```

### 3.3 弧线

```html
<svg width="200" height="200">
  <path d="M 50 50 A 40 40 0 0 1 150 50" 
        fill="none" stroke="green" stroke-width="3" />
</svg>
```

## 四、文本 `<text>`

### 4.1 基本文本

```html
<svg width="300" height="100">
  <text x="10" y="50" font-size="20" fill="black">
    Hello SVG
  </text>
</svg>
```

### 4.2 文本样式

```html
<svg width="300" height="200">
  <text x="10" y="30" 
        font-family="Arial" 
        font-size="24" 
        font-weight="bold" 
        fill="blue">
    粗体文本
  </text>
  
  <text x="10" y="70" 
        font-style="italic" 
        text-decoration="underline">
    斜体下划线
  </text>
  
  <text x="10" y="110" 
        text-anchor="middle">
    居中文本
  </text>
</svg>
```

### 4.3 沿路径文本

```html
<svg width="300" height="200">
  <defs>
    <path id="curve" d="M 50 100 Q 150 20 250 100" />
  </defs>
  
  <use href="#curve" fill="none" stroke="lightgray" />
  
  <text>
    <textPath href="#curve">
      这段文字沿着曲线排列
    </textPath>
  </text>
</svg>
```

## 五、样式和效果

### 5.1 填充和描边

```html
<svg width="200" height="200">
  <circle cx="100" cy="100" r="50" 
          fill="lightblue" 
          stroke="navy" 
          stroke-width="3" 
          stroke-dasharray="5,5"
          stroke-linecap="round" />
</svg>
```

### 5.2 渐变

#### **线性渐变**

```html
<svg width="200" height="100">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="200" height="100" fill="url(#grad1)" />
</svg>
```

#### **径向渐变**

```html
<svg width="200" height="200">
  <defs>
    <radialGradient id="grad2">
      <stop offset="0%" style="stop-color:white" />
      <stop offset="100%" style="stop-color:blue" />
    </radialGradient>
  </defs>
  
  <circle cx="100" cy="100" r="80" fill="url(#grad2)" />
</svg>
```

### 5.3 滤镜

```html
<svg width="200" height="200">
  <defs>
    <filter id="blur">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
    </filter>
    
    <filter id="shadow">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="black" />
    </filter>
  </defs>
  
  <circle cx="100" cy="100" r="50" fill="red" filter="url(#blur)" />
</svg>
```

## 六、变换

### 6.1 基本变换

```html
<svg width="300" height="200">
  <!-- 平移 -->
  <rect x="0" y="0" width="50" height="50" 
        fill="blue" transform="translate(10, 10)" />
  
  <!-- 旋转 -->
  <rect x="0" y="0" width="50" height="50" 
        fill="green" transform="rotate(45 100 100)" />
  
  <!-- 缩放 -->
  <rect x="150" y="50" width="50" height="50" 
        fill="red" transform="scale(1.5)" />
</svg>
```

### 6.2 组合变换

```html
<svg width="200" height="200">
  <rect x="0" y="0" width="50" height="50" 
        fill="purple" 
        transform="translate(100, 100) rotate(45) scale(1.2)" />
</svg>
```

## 七、分组和复用

### 7.1 `<g>` 分组

```html
<svg width="200" height="200">
  <g fill="blue" stroke="black" stroke-width="2">
    <circle cx="50" cy="50" r="20" />
    <circle cx="100" cy="50" r="20" />
    <circle cx="150" cy="50" r="20" />
  </g>
</svg>
```

### 7.2 `<defs>` 和 `<use>` 复用

```html
<svg width="300" height="100">
  <defs>
    <g id="star">
      <polygon points="0,-10 2,-2 10,-2 4,3 6,10 0,6 -6,10 -4,3 -10,-2 -2,-2" 
               fill="gold" stroke="orange" />
    </g>
  </defs>
  
  <use href="#star" x="50" y="50" />
  <use href="#star" x="150" y="50" />
  <use href="#star" x="250" y="50" />
</svg>
```

### 7.3 `<symbol>`

```html
<svg>
  <defs>
    <symbol id="icon" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" />
    </symbol>
  </defs>
  
  <use href="#icon" width="50" height="50" x="10" y="10" />
  <use href="#icon" width="100" height="100" x="70" y="10" />
</svg>
```

## 八、动画

### 8.1 SMIL 动画

```html
<svg width="200" height="200">
  <circle cx="50" cy="100" r="20" fill="red">
    <animate attributeName="cx" 
             from="50" to="150" 
             dur="2s" 
             repeatCount="indefinite" />
  </circle>
</svg>
```

### 8.2 CSS 动画

```html
<svg width="200" height="200">
  <circle cx="100" cy="100" r="50" class="pulse" />
</svg>

<style>
.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { fill: red; }
  50% { fill: yellow; }
}
</style>
```

### 8.3 JavaScript 动画

```html
<svg width="200" height="200">
  <circle id="ball" cx="50" cy="100" r="20" fill="blue" />
</svg>

<script>
const ball = document.getElementById('ball');
let x = 50;

function animate() {
  x += 2;
  if (x > 200) x = 0;
  ball.setAttribute('cx', x);
  requestAnimationFrame(animate);
}

animate();
</script>
```

## 九、实战示例

### 9.1 图标

```html
<svg width="24" height="24" viewBox="0 0 24 24">
  <!-- 菜单图标 -->
  <path d="M3 6h18M3 12h18M3 18h18" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" />
</svg>
```

### 9.2 Logo

```html
<svg width="100" height="100" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea" />
      <stop offset="100%" style="stop-color:#764ba2" />
    </linearGradient>
  </defs>
  
  <circle cx="50" cy="50" r="45" fill="url(#logoGrad)" />
  <text x="50" y="65" 
        text-anchor="middle" 
        font-size="40" 
        font-weight="bold" 
        fill="white">A</text>
</svg>
```

### 9.3 图表

```html
<svg width="300" height="200" viewBox="0 0 300 200">
  <!-- 简单饼图 -->
  <circle cx="150" cy="100" r="80" 
          fill="none" 
          stroke="blue" 
          stroke-width="80"
          stroke-dasharray="251.2 0"
          transform="rotate(-90 150 100)" />
  
  <circle cx="150" cy="100" r="80" 
          fill="none" 
          stroke="red" 
          stroke-width="80"
          stroke-dasharray="125.6 125.6"
          transform="rotate(0 150 100)" />
</svg>
```

## 十、SVG vs Canvas

| 特性 | SVG | Canvas |
|-----|-----|--------|
| **类型** | 矢量图 | 位图 |
| **缩放** | 无限缩放不失真 | 放大会模糊 |
| **DOM** | 每个元素是 DOM 节点 | 单个元素 |
| **事件** | 可以绑定事件到每个图形 | 只能绑定到 Canvas |
| **性能** | 元素多时性能下降 | 适合大量图形 |
| **适用** | 图标、Logo、图表 | 游戏、动画、图像处理 |

## 参考资料

- [MDN - SVG 教程](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial)
- [SVG 规范](https://www.w3.org/TR/SVG2/)
- [SVG Pocket Guide](http://svgpocketguide.com/)

---

**上一章** ← [第 9 章：Canvas 绘图](./09-canvas.md)  
**下一章** → [第 11 章：iframe 与嵌入](./11-iframe.md)
