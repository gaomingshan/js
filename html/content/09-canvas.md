# 第 9 章：Canvas 绘图

## 概述

Canvas 是 HTML5 提供的位图绘图 API，可以通过 JavaScript 绘制 2D 图形、动画、游戏等。它是前端可视化的重要技术。

## 一、Canvas 基础

### 1.1 基本结构

```html
<canvas id="myCanvas" width="600" height="400">
  您的浏览器不支持 Canvas。
</canvas>

<script>
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 绘图代码
ctx.fillStyle = 'blue';
ctx.fillRect(10, 10, 100, 50);
</script>
```

> **⚠️ 注意**  
> - Canvas 尺寸用 HTML 属性（`width`/`height`）设置，不要用 CSS
> - CSS 设置会拉伸画布，导致模糊

### 1.2 坐标系统

```
(0,0) ───────────────→ X
  │
  │
  │
  ↓
  Y
```

左上角是原点 (0, 0)，X 轴向右，Y 轴向下。

## 二、绘制图形

### 2.1 矩形

```javascript
const ctx = canvas.getContext('2d');

// 填充矩形
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 100, 50);  // x, y, width, height

// 描边矩形
ctx.strokeStyle = 'blue';
ctx.lineWidth = 2;
ctx.strokeRect(150, 10, 100, 50);

// 清除矩形
ctx.clearRect(20, 20, 30, 20);
```

### 2.2 路径绘制

```javascript
// 绘制三角形
ctx.beginPath();
ctx.moveTo(50, 50);   // 起点
ctx.lineTo(100, 100); // 线条到
ctx.lineTo(0, 100);
ctx.closePath();      // 闭合路径
ctx.fill();           // 填充
// 或 ctx.stroke();  // 描边
```

### 2.3 圆形和弧线

```javascript
// 圆形
ctx.beginPath();
ctx.arc(100, 100, 50, 0, Math.PI * 2);  // x, y, 半径, 起始角, 结束角
ctx.fill();

// 半圆
ctx.beginPath();
ctx.arc(200, 100, 50, 0, Math.PI);
ctx.stroke();

// 扇形
ctx.beginPath();
ctx.moveTo(300, 100);
ctx.arc(300, 100, 50, 0, Math.PI * 0.5);
ctx.closePath();
ctx.fill();
```

### 2.4 贝塞尔曲线

```javascript
// 二次贝塞尔曲线
ctx.beginPath();
ctx.moveTo(50, 50);
ctx.quadraticCurveTo(100, 0, 150, 50);  // 控制点, 结束点
ctx.stroke();

// 三次贝塞尔曲线
ctx.beginPath();
ctx.moveTo(50, 100);
ctx.bezierCurveTo(75, 0, 125, 200, 150, 100);  // 控制点1, 控制点2, 结束点
ctx.stroke();
```

## 三、样式和颜色

### 3.1 颜色

```javascript
// 填充颜色
ctx.fillStyle = 'red';
ctx.fillStyle = '#ff0000';
ctx.fillStyle = 'rgb(255, 0, 0)';
ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';

// 描边颜色
ctx.strokeStyle = 'blue';
```

### 3.2 渐变

```javascript
// 线性渐变
const gradient = ctx.createLinearGradient(0, 0, 200, 0);  // 起点, 终点
gradient.addColorStop(0, 'red');
gradient.addColorStop(0.5, 'yellow');
gradient.addColorStop(1, 'blue');
ctx.fillStyle = gradient;
ctx.fillRect(10, 10, 200, 100);

// 径向渐变
const radial = ctx.createRadialGradient(100, 100, 10, 100, 100, 50);
radial.addColorStop(0, 'white');
radial.addColorStop(1, 'black');
ctx.fillStyle = radial;
ctx.arc(100, 100, 50, 0, Math.PI * 2);
ctx.fill();
```

### 3.3 线条样式

```javascript
ctx.lineWidth = 5;           // 线宽
ctx.lineCap = 'round';       // 线帽：butt, round, square
ctx.lineJoin = 'round';      // 连接：miter, round, bevel
ctx.setLineDash([5, 10]);    // 虚线：[实线长度, 间隙长度]
ctx.lineDashOffset = 0;      // 虚线偏移
```

## 四、文本绘制

### 4.1 基本文本

```javascript
// 填充文本
ctx.font = '30px Arial';
ctx.fillStyle = 'black';
ctx.fillText('Hello Canvas', 50, 50);

// 描边文本
ctx.strokeStyle = 'blue';
ctx.strokeText('Hello Canvas', 50, 100);
```

### 4.2 文本样式

```javascript
ctx.font = 'bold 40px Arial';        // 粗体
ctx.font = 'italic 30px Georgia';    // 斜体
ctx.textAlign = 'center';            // 对齐：left, center, right, start, end
ctx.textBaseline = 'middle';         // 基线：top, middle, bottom, alphabetic

// 测量文本
const metrics = ctx.measureText('Hello');
console.log(metrics.width);  // 文本宽度
```

## 五、图像操作

### 5.1 绘制图片

```javascript
const img = new Image();
img.onload = function() {
  // 绘制图片
  ctx.drawImage(img, 0, 0);
  
  // 缩放绘制
  ctx.drawImage(img, 0, 0, 200, 100);  // 指定宽高
  
  // 裁剪绘制
  ctx.drawImage(
    img, 
    50, 50, 100, 100,     // 源图裁剪区域
    0, 0, 200, 200        // 目标位置和尺寸
  );
};
img.src = 'image.jpg';
```

### 5.2 像素操作

```javascript
// 获取像素数据
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const pixels = imageData.data;  // RGBA 数组

// 修改像素（灰度效果）
for (let i = 0; i < pixels.length; i += 4) {
  const gray = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
  pixels[i] = gray;      // R
  pixels[i+1] = gray;    // G
  pixels[i+2] = gray;    // B
  // pixels[i+3] 是 alpha
}

// 写回像素
ctx.putImageData(imageData, 0, 0);
```

## 六、变换

### 6.1 平移、旋转、缩放

```javascript
// 平移
ctx.translate(100, 100);

// 旋转（弧度）
ctx.rotate(Math.PI / 4);  // 旋转45度

// 缩放
ctx.scale(2, 2);  // 水平和垂直缩放2倍

// 绘制
ctx.fillRect(0, 0, 50, 50);
```

### 6.2 保存和恢复状态

```javascript
ctx.fillStyle = 'red';
ctx.save();  // 保存状态

ctx.fillStyle = 'blue';
ctx.translate(100, 100);
ctx.fillRect(0, 0, 50, 50);  // 蓝色矩形

ctx.restore();  // 恢复状态
ctx.fillRect(200, 0, 50, 50);  // 红色矩形
```

### 6.3 变换矩阵

```javascript
// transform(a, b, c, d, e, f)
// a: 水平缩放, b: 水平倾斜
// c: 垂直倾斜, d: 垂直缩放
// e: 水平移动, f: 垂直移动
ctx.transform(1, 0, 0, 1, 100, 100);

// 重置变换
ctx.setTransform(1, 0, 0, 1, 0, 0);
```

## 七、合成和裁剪

### 7.1 全局透明度

```javascript
ctx.globalAlpha = 0.5;  // 50% 透明
ctx.fillRect(10, 10, 100, 100);
```

### 7.2 合成操作

```javascript
ctx.globalCompositeOperation = 'source-over';  // 默认：后绘覆盖先绘
ctx.globalCompositeOperation = 'destination-over';  // 先绘覆盖后绘
ctx.globalCompositeOperation = 'multiply';     // 正片叠底
ctx.globalCompositeOperation = 'screen';       // 滤色
```

### 7.3 裁剪

```javascript
// 创建裁剪区域
ctx.beginPath();
ctx.arc(100, 100, 50, 0, Math.PI * 2);
ctx.clip();

// 只在裁剪区域内绘制
ctx.fillRect(0, 0, 200, 200);
```

## 八、动画

### 8.1 基本动画

```javascript
let x = 0;

function animate() {
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制
  ctx.fillRect(x, 100, 50, 50);
  
  // 更新
  x += 2;
  if (x > canvas.width) x = 0;
  
  // 下一帧
  requestAnimationFrame(animate);
}

animate();
```

### 8.2 时间控制

```javascript
let lastTime = 0;

function animate(currentTime) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  // 基于时间的移动
  x += 100 * (deltaTime / 1000);  // 每秒移动100像素
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(x, 100, 50, 50);
  
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

## 九、实战示例

### 9.1 绘制图表

```javascript
// 简单柱状图
const data = [50, 100, 75, 125, 90];
const barWidth = 40;
const gap = 10;

data.forEach((value, index) => {
  const x = index * (barWidth + gap) + 20;
  const y = canvas.height - value - 20;
  
  ctx.fillStyle = 'steelblue';
  ctx.fillRect(x, y, barWidth, value);
  
  ctx.fillStyle = 'black';
  ctx.fillText(value, x + barWidth/2 - 10, y - 5);
});
```

### 9.2 时钟

```javascript
function drawClock() {
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(150, 150);
  
  // 表盘
  ctx.beginPath();
  ctx.arc(0, 0, 100, 0, Math.PI * 2);
  ctx.stroke();
  
  // 时针
  ctx.save();
  ctx.rotate((hours + minutes/60) * Math.PI / 6);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -50);
  ctx.stroke();
  ctx.restore();
  
  // 分针
  ctx.save();
  ctx.rotate(minutes * Math.PI / 30);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -70);
  ctx.stroke();
  ctx.restore();
  
  // 秒针
  ctx.save();
  ctx.rotate(seconds * Math.PI / 30);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -85);
  ctx.stroke();
  ctx.restore();
  
  ctx.translate(-150, -150);
  
  requestAnimationFrame(drawClock);
}

drawClock();
```

## 十、性能优化

> **⚡ 优化技巧**
> 
> 1. **分层 Canvas**：静态内容和动态内容分开
> 2. **局部重绘**：只清除和重绘变化区域
> 3. **离屏 Canvas**：复杂图形先绘制到离屏 Canvas
> 4. **批量操作**：减少状态切换
> 5. **避免浮点坐标**：使用整数坐标
> 6. **使用 Web Worker**：计算密集任务移到 Worker

```javascript
// 分层 Canvas
const bgCanvas = document.getElementById('bg');
const fgCanvas = document.getElementById('fg');
const bgCtx = bgCanvas.getContext('2d');
const fgCtx = fgCanvas.getContext('2d');

// 背景只绘制一次
bgCtx.fillStyle = 'lightgray';
bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

// 前景动画
function animate() {
  fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
  // 绘制动态内容
  requestAnimationFrame(animate);
}
```

## 参考资料

- [MDN - Canvas API](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
- [MDN - Canvas 教程](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial)
- [HTML5 Canvas Deep Dive](http://joshondesign.com/p/books/canvasdeepdive/toc.html)

---

**上一章** ← [第 8 章：音频与视频](./08-audio-video.md)  
**下一章** → [第 10 章：SVG 矢量图](./10-svg.md)
