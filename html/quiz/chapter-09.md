# 第 9 章：Canvas 绘图 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

由于本章节主要涉及 JavaScript API 操作，题目已精简为核心概念。完整 Canvas 内容请参考 JavaScript 章节。

---

## 第 1-10 题：核心概念速查

### 1️⃣ Canvas 基础 🟢
**Q:** Canvas 元素的默认尺寸是？  
**A:** 300x150 像素

```html
<canvas id="myCanvas" width="800" height="600"></canvas>
```

### 2️⃣ 获取上下文 🟢
**Q:** 如何获取 2D 绘图上下文？  
**A:** `canvas.getContext('2d')`

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
```

### 3️⃣ 绘制矩形 🟢
**Q:** 绘制填充矩形的方法是？  
**A:** `fillRect(x, y, width, height)`

```javascript
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 100, 50);
```

### 4️⃣ 绘制路径 🟡
**Q:** Canvas 路径绘制的基本步骤？  
**A:** beginPath() → moveTo/lineTo → stroke/fill

```javascript
ctx.beginPath();
ctx.moveTo(50, 50);
ctx.lineTo(150, 50);
ctx.lineTo(100, 150);
ctx.closePath();
ctx.stroke();
```

### 5️⃣ 绘制圆形 🟡
**Q:** 绘制圆形使用哪个方法？  
**A:** `arc(x, y, radius, startAngle, endAngle)`

```javascript
ctx.beginPath();
ctx.arc(100, 100, 50, 0, Math.PI * 2);
ctx.fill();
```

### 6️⃣ 文本绘制 🟡
**Q:** Canvas 绘制文本的两个方法？  
**A:** `fillText()` 和 `strokeText()`

```javascript
ctx.font = '30px Arial';
ctx.fillText('Hello', 50, 50);
ctx.strokeText('World', 50, 100);
```

### 7️⃣ 图像操作 🟡
**Q:** 如何在 Canvas 上绘制图片？  
**A:** `drawImage(image, x, y)`

```javascript
const img = new Image();
img.onload = () => {
  ctx.drawImage(img, 0, 0);
};
img.src = 'image.jpg';
```

### 8️⃣ 变换操作 🔴
**Q:** Canvas 的变换方法有哪些？  
**A:** `translate()`, `rotate()`, `scale()`, `transform()`

```javascript
ctx.translate(100, 100);
ctx.rotate(Math.PI / 4);
ctx.scale(2, 2);
```

### 9️⃣ 保存和恢复 🔴
**Q:** 如何保存和恢复 Canvas 状态？  
**A:** `save()` 和 `restore()`

```javascript
ctx.save();
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 100, 100);
ctx.restore(); // 恢复之前的状态
```

### 🔟 导出图像 🔴
**Q:** 如何将 Canvas 导出为图片？  
**A:** `toDataURL()` 或 `toBlob()`

```javascript
// Base64
const dataURL = canvas.toDataURL('image/png');

// Blob
canvas.toBlob(blob => {
  const url = URL.createObjectURL(blob);
  // 下载或显示
});
```

---

**📌 快速参考**

**基本形状：**
- 矩形：`fillRect()`, `strokeRect()`, `clearRect()`
- 圆形：`arc()`, `arcTo()`
- 路径：`moveTo()`, `lineTo()`, `bezierCurveTo()`

**样式：**
- 填充：`fillStyle`
- 描边：`strokeStyle`, `lineWidth`
- 渐变：`createLinearGradient()`, `createRadialGradient()`

**变换：**
- 平移：`translate()`
- 旋转：`rotate()`
- 缩放：`scale()`
- 矩阵：`transform()`, `setTransform()`

**性能优化：**
- 离屏 Canvas
- 减少状态改变
- 批量绘制
- 使用 `requestAnimationFrame`

**上一章** ← [第 8 章：音频与视频](./chapter-08.md)  
**下一章** → [第 10 章：SVG 矢量图](./chapter-10.md)
