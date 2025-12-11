# 第 10 章：SVG 矢量图 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1-10 题：核心知识点

### 1️⃣ SVG vs Canvas 🟢
**Q:** SVG 和 Canvas 的主要区别？  
**A:** SVG 是矢量（可缩放），Canvas 是位图（像素）

| 特性 | SVG | Canvas |
|------|-----|--------|
| 类型 | 矢量 | 位图 |
| 缩放 | 无损 | 有损 |
| DOM | 可操作 | 不可操作 |
| 性能 | 元素少时好 | 像素多时好 |

### 2️⃣ 内联 SVG 🟢
**Q:** 如何在 HTML 中内联 SVG？  
**A:** 直接使用 `<svg>` 标签

```html
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>
```

### 3️⃣ SVG 基本形状 🟢
**Q:** SVG 有哪些基本形状元素？  
**A:** `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polyline>`, `<polygon>`

```html
<svg width="200" height="200">
  <!-- 矩形 -->
  <rect x="10" y="10" width="80" height="60" fill="blue" />
  
  <!-- 圆形 -->
  <circle cx="150" cy="40" r="30" fill="red" />
  
  <!-- 线条 -->
  <line x1="10" y1="100" x2="190" y2="100" stroke="black" stroke-width="2" />
</svg>
```

### 4️⃣ SVG Path 🟡
**Q:** SVG `<path>` 的 `d` 属性命令有哪些？  
**A:** M(moveto), L(lineto), H(水平), V(垂直), C(曲线), Z(闭合)

```html
<svg width="200" height="200">
  <path d="M 10 10 L 100 10 L 100 100 Z" fill="green" />
</svg>
```

### 5️⃣ SVG 样式 🟡
**Q:** SVG 如何设置填充和描边？  
**A:** `fill` 和 `stroke` 属性

```html
<svg>
  <circle 
    cx="50" cy="50" r="40"
    fill="blue"
    stroke="red"
    stroke-width="3" />
</svg>
```

### 6️⃣ SVG 渐变 🟡
**Q:** SVG 渐变有哪两种类型？  
**A:** 线性渐变 `<linearGradient>` 和径向渐变 `<radialGradient>`

```html
<svg width="200" height="200">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgb(255,255,0)" />
      <stop offset="100%" style="stop-color:rgb(255,0,0)" />
    </linearGradient>
  </defs>
  <rect width="200" height="100" fill="url(#grad)" />
</svg>
```

### 7️⃣ SVG 变换 🟡
**Q:** SVG 变换使用什么属性？  
**A:** `transform` 属性

```html
<svg>
  <rect 
    x="10" y="10" 
    width="50" height="50"
    transform="rotate(45 35 35)" />
</svg>
```

**变换类型：**
- `translate(x, y)`
- `rotate(angle, cx, cy)`
- `scale(x, y)`
- `skewX(angle)`, `skewY(angle)`

### 8️⃣ SVG 动画 🔴
**Q:** SVG 动画有哪些方式？  
**A:** SMIL 动画、CSS 动画、JavaScript

```html
<!-- SMIL 动画 -->
<svg>
  <circle cx="50" cy="50" r="20" fill="red">
    <animate 
      attributeName="cx" 
      from="50" 
      to="150" 
      dur="2s" 
      repeatCount="indefinite" />
  </circle>
</svg>

<!-- CSS 动画 -->
<style>
@keyframes move {
  to { transform: translateX(100px); }
}
circle { animation: move 2s infinite; }
</style>
```

### 9️⃣ SVG 优化 🔴
**Q:** SVG 优化的方法？  
**A:** 移除不必要的元素、压缩、使用符号复用

```html
<!-- 使用 <symbol> 和 <use> 复用 -->
<svg style="display: none;">
  <symbol id="icon-star" viewBox="0 0 32 32">
    <path d="M16 0l4.9 10 11.1 1.6-8 7.8 1.9 11-9.9-5.2-9.9 5.2 1.9-11-8-7.8 11.1-1.6z"/>
  </symbol>
</svg>

<svg width="32" height="32">
  <use href="#icon-star" fill="gold" />
</svg>
```

**优化工具：** SVGO, SVGOMG

### 🔟 SVG vs 图片 🔴
**Q:** 何时使用 SVG，何时使用位图？  
**A:** 

**使用 SVG：**
- ✅ Logo、图标
- ✅ 图表、数据可视化
- ✅ 需要缩放的图形
- ✅ 简单图形

**使用位图（JPEG/PNG/WebP）：**
- ✅ 照片
- ✅ 复杂图像
- ✅ 大量细节

```html
<!-- SVG：Logo -->
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#3b82f6" />
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="24">
    LOGO
  </text>
</svg>

<!-- 图片：照片 -->
<img src="photo.jpg" alt="照片">
```

---

**📌 SVG 完整示例**

```html
<svg width="400" height="300" viewBox="0 0 400 300">
  <!-- 定义 -->
  <defs>
    <!-- 渐变 -->
    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#87CEEB" />
      <stop offset="100%" style="stop-color:#E0F6FF" />
    </linearGradient>
    
    <!-- 滤镜 -->
    <filter id="shadow">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="400" height="300" fill="url(#skyGradient)" />
  
  <!-- 太阳 -->
  <circle cx="320" cy="80" r="40" fill="yellow" filter="url(#shadow)" />
  
  <!-- 房子 -->
  <rect x="100" y="150" width="150" height="100" fill="brown" />
  <polygon points="100,150 175,100 250,150" fill="red" />
  <rect x="140" y="180" width="30" height="50" fill="blue" />
  
  <!-- 树 -->
  <rect x="300" y="200" width="20" height="50" fill="brown" />
  <circle cx="310" cy="190" r="30" fill="green" />
</svg>
```

---

**📌 本章总结**

- SVG 是可缩放矢量图形
- 基本形状：rect, circle, line, path
- 可以内联到 HTML 中
- 支持 CSS 和 JavaScript 操作
- 适合 Logo、图标、图表
- 使用 viewBox 实现响应式

**上一章** ← [第 9 章：Canvas 绘图](./chapter-09.md)  
**下一章** → [第 11 章：iframe 与嵌入](./chapter-11.md)
