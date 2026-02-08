# Canvas 基础绘图

## 核心概念

`<canvas>` 是 HTML5 提供的**位图绘制画布**，通过 JavaScript API 在像素级别绘制图形。与 SVG 的矢量方式不同，Canvas 是即时模式（Immediate Mode）渲染——绘制完成后只有像素数据，不保留图形对象。

**后端类比**：
- Canvas ≈ 服务端图像处理（如 Java 的 `BufferedImage`、Go 的 `image` 包）
- SVG ≈ XML 文档模型，保留结构可查询
- Canvas 绘图指令 ≈ SQL 写入操作（执行后数据落盘，指令本身不保留）

## Canvas vs SVG：选型指南

| 维度 | Canvas | SVG |
|------|--------|-----|
| 渲染模式 | 位图（像素） | 矢量（DOM 节点） |
| 性能 | 大量图形时更快 | 少量图形时更快 |
| 交互 | 需手动计算点击区域 | 原生支持事件绑定 |
| 缩放 | 放大会模糊 | 无限缩放不失真 |
| 可访问性 | 差（纯像素） | 好（DOM 可读） |
| SEO | 不可索引 | 可索引 |
| 动画 | 逐帧重绘 | CSS/SMIL 动画 |
| 适用场景 | 游戏、数据可视化、图像处理 | 图标、Logo、简单图表、地图 |

**选型原则**：
- 元素数量 > 1000 → Canvas
- 需要交互/可访问性 → SVG
- 需要像素操作 → Canvas
- 需要缩放不失真 → SVG

## HTML 中的 Canvas 元素

### 基本结构

```html
<canvas id="myCanvas" width="600" height="400">
  您的浏览器不支持 Canvas。
</canvas>
```

**关键注意**：`width` 和 `height` 是 Canvas 的**画布分辨率**（像素），不是 CSS 尺寸。

```html
<!-- ❌ 用 CSS 设置尺寸：画布拉伸变形 -->
<canvas id="c" style="width: 600px; height: 400px;"></canvas>
<!-- 实际画布默认 300×150，被拉伸到 600×400，图形模糊 -->

<!-- ✅ 用 HTML 属性设置画布分辨率 -->
<canvas id="c" width="600" height="400"></canvas>
```

### 高 DPI 适配

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;

// 设置实际像素分辨率
canvas.width = 600 * dpr;
canvas.height = 400 * dpr;

// CSS 显示尺寸不变
canvas.style.width = '600px';
canvas.style.height = '400px';

// 缩放绑定上下文，使绘图坐标与 CSS 像素一致
ctx.scale(dpr, dpr);
```

## 2D 上下文：基础绘图 API

### 获取上下文

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
// 也可获取 WebGL 上下文：canvas.getContext('webgl')
```

### 矩形

```javascript
// 填充矩形
ctx.fillStyle = '#3b82f6';
ctx.fillRect(10, 10, 200, 100);  // x, y, width, height

// 描边矩形
ctx.strokeStyle = '#ef4444';
ctx.lineWidth = 2;
ctx.strokeRect(10, 130, 200, 100);

// 清除矩形区域
ctx.clearRect(50, 50, 100, 50);
```

### 路径

路径是 Canvas 中绑制复杂图形的核心机制。

```javascript
// 三角形
ctx.beginPath();
ctx.moveTo(100, 10);     // 起点
ctx.lineTo(50, 100);     // 画线到
ctx.lineTo(150, 100);    // 画线到
ctx.closePath();          // 闭合路径
ctx.fillStyle = '#10b981';
ctx.fill();               // 填充
ctx.stroke();             // 描边

// 圆形
ctx.beginPath();
ctx.arc(200, 200, 50, 0, Math.PI * 2);  // x, y, radius, startAngle, endAngle
ctx.fillStyle = '#f59e0b';
ctx.fill();

// 圆弧
ctx.beginPath();
ctx.arc(350, 200, 50, 0, Math.PI * 1.5);  // 3/4 圆弧
ctx.stroke();

// 贝塞尔曲线
ctx.beginPath();
ctx.moveTo(50, 300);
ctx.quadraticCurveTo(200, 200, 350, 300);  // 二次贝塞尔
ctx.stroke();

ctx.beginPath();
ctx.moveTo(50, 350);
ctx.bezierCurveTo(100, 250, 300, 450, 350, 350);  // 三次贝塞尔
ctx.stroke();
```

### 文本

```javascript
// 填充文本
ctx.font = '24px Arial';
ctx.fillStyle = '#1f2937';
ctx.textAlign = 'center';       // left | center | right
ctx.textBaseline = 'middle';    // top | middle | bottom
ctx.fillText('Hello Canvas', 300, 200);

// 描边文本
ctx.strokeStyle = '#3b82f6';
ctx.lineWidth = 1;
ctx.strokeText('Hello Canvas', 300, 250);

// 测量文本宽度
const metrics = ctx.measureText('Hello Canvas');
console.log('文本宽度:', metrics.width);
```

### 样式与渐变

```javascript
// 线性渐变
const gradient = ctx.createLinearGradient(0, 0, 400, 0);
gradient.addColorStop(0, '#3b82f6');
gradient.addColorStop(1, '#8b5cf6');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 400, 100);

// 径向渐变
const radial = ctx.createRadialGradient(200, 200, 20, 200, 200, 100);
radial.addColorStop(0, '#fbbf24');
radial.addColorStop(1, '#ef4444');
ctx.fillStyle = radial;
ctx.beginPath();
ctx.arc(200, 200, 100, 0, Math.PI * 2);
ctx.fill();

// 阴影
ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 5;
ctx.shadowOffsetY = 5;
ctx.fillRect(50, 50, 150, 100);
```

### 状态保存与恢复

```javascript
ctx.save();  // 保存当前状态（样式、变换矩阵等）

ctx.fillStyle = 'red';
ctx.translate(100, 100);
ctx.rotate(Math.PI / 4);
ctx.fillRect(0, 0, 50, 50);

ctx.restore();  // 恢复到 save 时的状态

// 此时 fillStyle 和变换矩阵都恢复了
ctx.fillRect(0, 0, 50, 50);  // 黑色，原始位置
```

**后端类比**：`save()` / `restore()` ≈ 数据库事务的 Savepoint，可以回滚到之前的状态。

## 像素操作与图像处理

### 绘制图像

```javascript
const img = new Image();
img.onload = () => {
  // 基本绘制
  ctx.drawImage(img, 0, 0);

  // 指定尺寸
  ctx.drawImage(img, 0, 0, 300, 200);

  // 裁切源图的一部分绘制到画布
  // drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
  ctx.drawImage(img, 50, 50, 200, 150, 0, 0, 400, 300);
};
img.src = 'photo.jpg';
```

### 像素级操作

```javascript
// 获取像素数据
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data;  // Uint8ClampedArray [R,G,B,A, R,G,B,A, ...]

// 灰度滤镜
for (let i = 0; i < data.length; i += 4) {
  const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
  data[i]     = avg;  // R
  data[i + 1] = avg;  // G
  data[i + 2] = avg;  // B
  // data[i + 3] 是 Alpha，保持不变
}

// 写回画布
ctx.putImageData(imageData, 0, 0);
```

### 导出图像

```javascript
// 导出为 Data URL
const dataUrl = canvas.toDataURL('image/png');
// "data:image/png;base64,iVBORw0KGgo..."

// 导出为 Blob（用于上传）
canvas.toBlob((blob) => {
  const formData = new FormData();
  formData.append('image', blob, 'canvas.png');
  fetch('/api/upload', { method: 'POST', body: formData });
}, 'image/png');
```

## Canvas 动画

### 基本动画循环

```javascript
let x = 0;

function animate() {
  // 1. 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. 绘制当前帧
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(x, 200, 30, 0, Math.PI * 2);
  ctx.fill();

  // 3. 更新状态
  x += 2;
  if (x > canvas.width) x = 0;

  // 4. 请求下一帧
  requestAnimationFrame(animate);
}

animate();
```

**为什么用 `requestAnimationFrame` 而非 `setInterval`**：
- 自动匹配显示器刷新率（通常 60fps）
- 页面不可见时自动暂停，节省性能
- 浏览器可以优化合成

### 带时间控制的动画

```javascript
let lastTime = 0;

function animate(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // 基于时间的匀速运动（不依赖帧率）
  const speed = 200;  // 像素/秒
  x += speed * (deltaTime / 1000);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(x, 200, 30, 0, Math.PI * 2);
  ctx.fill();

  if (x > canvas.width) x = 0;
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

## 工程实践

### 场景 1：简单柱状图

```javascript
function drawBarChart(canvas, data) {
  const ctx = canvas.getContext('2d');
  const padding = 40;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;
  const barWidth = chartWidth / data.length * 0.7;
  const gap = chartWidth / data.length * 0.3;
  const maxValue = Math.max(...data.map(d => d.value));

  // 清除
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制坐标轴
  ctx.strokeStyle = '#d1d5db';
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // 绘制柱状
  data.forEach((item, i) => {
    const x = padding + i * (barWidth + gap) + gap / 2;
    const barHeight = (item.value / maxValue) * chartHeight;
    const y = canvas.height - padding - barHeight;

    // 渐变填充
    const grad = ctx.createLinearGradient(x, y, x, canvas.height - padding);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, barHeight);

    // 标签
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(item.label, x + barWidth / 2, canvas.height - padding + 20);

    // 数值
    ctx.fillText(item.value, x + barWidth / 2, y - 8);
  });
}

// 使用
drawBarChart(document.getElementById('chart'), [
  { label: '1月', value: 120 },
  { label: '2月', value: 200 },
  { label: '3月', value: 150 },
  { label: '4月', value: 280 },
]);
```

### 场景 2：图片水印

```javascript
function addWatermark(canvas, text) {
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.font = '24px Arial';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';

  // 旋转平铺水印
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 6);

  for (let y = -canvas.height; y < canvas.height; y += 80) {
    for (let x = -canvas.width; x < canvas.width; x += 200) {
      ctx.fillText(text, x, y);
    }
  }

  ctx.restore();
}

// 先绘制图片，再添加水印
const img = new Image();
img.onload = () => {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  addWatermark(canvas, '© 2024 MyCompany');
};
img.src = 'photo.jpg';
```

### 场景 3：签名板

```html
<canvas id="signature" width="400" height="200" 
        style="border: 1px solid #ccc; cursor: crosshair;"></canvas>
<button id="clear">清除</button>
<button id="save">保存签名</button>
```

```javascript
const canvas = document.getElementById('signature');
const ctx = canvas.getContext('2d');
let isDrawing = false;

ctx.strokeStyle = '#1f2937';
ctx.lineWidth = 2;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

canvas.addEventListener('pointerdown', (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('pointermove', (e) => {
  if (!isDrawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener('pointerup', () => { isDrawing = false; });
canvas.addEventListener('pointerleave', () => { isDrawing = false; });

document.getElementById('clear').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('save').addEventListener('click', () => {
  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append('signature', blob, 'signature.png');
    fetch('/api/signature', { method: 'POST', body: formData });
  });
});
```

使用 `pointer` 事件而非 `mouse` 事件，可同时兼容鼠标和触摸屏。

## Canvas 的可访问性

Canvas 本身对屏幕阅读器不可见，需要额外处理：

```html
<!-- 方式 1：Canvas 内放置降级内容 -->
<canvas id="chart" width="600" height="400" role="img" aria-label="2024年季度营收柱状图">
  <table>
    <caption>2024年季度营收</caption>
    <tr><th>Q1</th><td>120万</td></tr>
    <tr><th>Q2</th><td>200万</td></tr>
    <tr><th>Q3</th><td>150万</td></tr>
    <tr><th>Q4</th><td>280万</td></tr>
  </table>
</canvas>

<!-- 方式 2：使用 aria-label 提供描述 -->
<canvas id="signature" role="img" aria-label="用户手写签名"></canvas>
```

## 常见误区

### 误区 1：用 CSS 设置 Canvas 尺寸

```html
<!-- ❌ CSS 尺寸 ≠ 画布分辨率 -->
<canvas style="width: 600px; height: 400px;"></canvas>

<!-- ✅ 用 HTML 属性设置分辨率 -->
<canvas width="600" height="400"></canvas>
```

### 误区 2：忽略高 DPI 屏幕

在 2x 屏幕上，300×150 的 Canvas 显示为 CSS 300×150 像素，但实际只有 300 物理像素，图形会模糊。必须根据 `devicePixelRatio` 放大画布分辨率。

### 误区 3：每帧不清除画布

```javascript
// ❌ 不清除：图形叠加残留
function animate() {
  ctx.fillRect(x++, 100, 50, 50);
  requestAnimationFrame(animate);
}

// ✅ 每帧清除后重绘
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(x++, 100, 50, 50);
  requestAnimationFrame(animate);
}
```

## 参考资源

- [HTML Living Standard - The canvas element](https://html.spec.whatwg.org/multipage/canvas.html)
- [MDN - Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MDN - Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Web.dev - Canvas Performance](https://web.dev/canvas-performance/)
