// 第11章：Canvas基础 - 内容数据
window.htmlContentData_11 = {
    section: {
        title: "Canvas基础",
        icon: "🖌️"
    },
    topics: [
        {
            type: "concept",
            title: "Canvas概述",
            content: {
                description: "<canvas>元素提供了一个通过JavaScript绘制图形的画布。与SVG不同，Canvas是基于像素的位图绘制，适合动态图形、游戏、数据可视化等场景。",
                keyPoints: [
                    "Canvas是HTML5引入的绘图API",
                    "基于像素的位图绘制",
                    "需要通过JavaScript API操作",
                    "适合动态图形和动画",
                    "支持2D和WebGL（3D）绘图",
                    "绘制后不保留对象引用，只是像素"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API"
            }
        },
        {
            type: "comparison",
            title: "Canvas vs SVG",
            content: {
                description: "选择Canvas还是SVG取决于具体应用场景。",
                items: [
                    {
                        name: "Canvas",
                        pros: [
                            "位图绘制，性能高",
                            "适合大量图形对象",
                            "适合动态内容和动画",
                            "适合像素级操作",
                            "游戏开发的首选",
                            "可以保存为图片"
                        ],
                        cons: [
                            "不支持事件处理器",
                            "缩放会失真",
                            "不利于SEO",
                            "文本渲染较弱",
                            "需要手动重绘"
                        ]
                    },
                    {
                        name: "SVG",
                        pros: [
                            "矢量图形，无限缩放",
                            "支持事件处理",
                            "可用CSS样式化",
                            "SEO友好",
                            "文本处理好",
                            "适合图标和UI"
                        ],
                        cons: [
                            "大量对象时性能差",
                            "不适合像素操作",
                            "不适合复杂动画",
                            "文件可能较大"
                        ]
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "Canvas基础设置",
            content: {
                description: "创建和初始化Canvas元素。",
                examples: [
                    {
                        title: "创建Canvas",
                        code: `<!-- HTML -->
<canvas id="myCanvas" width="800" height="600">
    您的浏览器不支持Canvas。
</canvas>

<script>
    // 获取canvas元素
    const canvas = document.getElementById('myCanvas');
    
    // 获取2D绘图上下文
    const ctx = canvas.getContext('2d');
    
    // 检查是否支持Canvas
    if (!ctx) {
        console.error('您的浏览器不支持Canvas');
    }
</script>`,
                        notes: "必须通过getContext获取绘图上下文"
                    },
                    {
                        title: "Canvas尺寸设置",
                        code: `<!-- ❌ 错误：用CSS设置尺寸会拉伸 -->
<canvas id="canvas" style="width: 800px; height: 600px;"></canvas>

<!-- ✅ 正确：用属性设置实际尺寸 -->
<canvas id="canvas" width="800" height="600"></canvas>

<script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // 或用JavaScript设置
    canvas.width = 800;
    canvas.height = 600;
    
    // 高DPI屏幕适配
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 800 * dpr;
    canvas.height = 600 * dpr;
    canvas.style.width = '800px';
    canvas.style.height = '600px';
    ctx.scale(dpr, dpr);
</script>`,
                        notes: "width/height属性设置画布分辨率"
                    },
                    {
                        title: "清空Canvas",
                        code: `const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 清空整个画布
ctx.clearRect(0, 0, canvas.width, canvas.height);

// 清空特定区域
ctx.clearRect(x, y, width, height);

// 完全重置画布（包括变换）
canvas.width = canvas.width;`,
                        notes: "clearRect清空指定矩形区域"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "绘制基本形状",
            content: {
                description: "Canvas提供了绘制基本图形的方法。",
                examples: [
                    {
                        title: "矩形",
                        code: `const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 填充矩形
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 100, 80);

// 描边矩形
ctx.strokeStyle = 'blue';
ctx.lineWidth = 2;
ctx.strokeRect(130, 10, 100, 80);

// 清空矩形区域
ctx.clearRect(50, 30, 40, 40);`,
                        notes: "矩形是Canvas中唯一的基本形状"
                    },
                    {
                        title: "路径绘制",
                        code: `const ctx = canvas.getContext('2d');

// 绘制三角形
ctx.beginPath();
ctx.moveTo(75, 50);
ctx.lineTo(100, 75);
ctx.lineTo(100, 25);
ctx.closePath();
ctx.fillStyle = 'green';
ctx.fill();

// 绘制直线
ctx.beginPath();
ctx.moveTo(10, 100);
ctx.lineTo(100, 100);
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;
ctx.stroke();

// 绘制折线
ctx.beginPath();
ctx.moveTo(10, 150);
ctx.lineTo(50, 130);
ctx.lineTo(90, 150);
ctx.lineTo(130, 130);
ctx.stroke();`,
                        notes: "beginPath开始新路径，closePath闭合路径"
                    },
                    {
                        title: "圆形和弧线",
                        code: `const ctx = canvas.getContext('2d');

// 完整的圆
ctx.beginPath();
ctx.arc(50, 50, 40, 0, Math.PI * 2);
ctx.fillStyle = 'blue';
ctx.fill();

// 半圆
ctx.beginPath();
ctx.arc(150, 50, 40, 0, Math.PI);
ctx.fillStyle = 'red';
ctx.fill();

// 扇形
ctx.beginPath();
ctx.moveTo(250, 50);
ctx.arc(250, 50, 40, 0, Math.PI * 0.5);
ctx.closePath();
ctx.fillStyle = 'green';
ctx.fill();

// 圆弧（不闭合）
ctx.beginPath();
ctx.arc(350, 50, 40, 0, Math.PI * 1.5, false);
ctx.strokeStyle = 'purple';
ctx.lineWidth = 3;
ctx.stroke();

// arc参数：(x, y, radius, startAngle, endAngle, anticlockwise)
// 角度以弧度为单位，0度在3点钟方向`,
                        notes: "arc方法绘制圆和弧线"
                    },
                    {
                        title: "曲线",
                        code: `const ctx = canvas.getContext('2d');

// 二次贝塞尔曲线
ctx.beginPath();
ctx.moveTo(10, 100);
ctx.quadraticCurveTo(50, 50, 100, 100);
ctx.stroke();

// 三次贝塞尔曲线
ctx.beginPath();
ctx.moveTo(10, 150);
ctx.bezierCurveTo(50, 100, 90, 200, 140, 150);
ctx.stroke();`,
                        notes: "quadraticCurveTo和bezierCurveTo绘制曲线"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "样式和颜色",
            content: {
                description: "设置填充和描边样式。",
                examples: [
                    {
                        title: "颜色设置",
                        code: `const ctx = canvas.getContext('2d');

// 颜色名称
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 50, 50);

// 十六进制
ctx.fillStyle = '#00FF00';
ctx.fillRect(70, 10, 50, 50);

// RGB
ctx.fillStyle = 'rgb(0, 0, 255)';
ctx.fillRect(130, 10, 50, 50);

// RGBA（带透明度）
ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
ctx.fillRect(190, 10, 50, 50);

// HSL
ctx.fillStyle = 'hsl(120, 100%, 50%)';
ctx.fillRect(250, 10, 50, 50);`,
                        notes: "fillStyle和strokeStyle支持多种颜色格式"
                    },
                    {
                        title: "渐变",
                        code: `const ctx = canvas.getContext('2d');

// 线性渐变
const linearGrad = ctx.createLinearGradient(0, 0, 200, 0);
linearGrad.addColorStop(0, 'red');
linearGrad.addColorStop(0.5, 'yellow');
linearGrad.addColorStop(1, 'green');
ctx.fillStyle = linearGrad;
ctx.fillRect(10, 10, 200, 100);

// 径向渐变
const radialGrad = ctx.createRadialGradient(150, 150, 10, 150, 150, 80);
radialGrad.addColorStop(0, 'white');
radialGrad.addColorStop(1, 'blue');
ctx.fillStyle = radialGrad;
ctx.fillRect(70, 70, 160, 160);`,
                        notes: "使用createLinearGradient和createRadialGradient"
                    },
                    {
                        title: "线条样式",
                        code: `const ctx = canvas.getContext('2d');

// 线宽
ctx.lineWidth = 5;

// 线帽样式
ctx.lineCap = 'round';  // butt, round, square

// 线连接样式
ctx.lineJoin = 'round';  // miter, round, bevel

// 虚线
ctx.setLineDash([10, 5]);  // [实线长度, 间隙长度]
ctx.lineDashOffset = 0;

// 绘制示例
ctx.beginPath();
ctx.moveTo(10, 10);
ctx.lineTo(100, 10);
ctx.lineTo(100, 100);
ctx.stroke();`,
                        notes: "lineWidth、lineCap、lineJoin控制线条样式"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "文本绘制",
            content: {
                description: "在Canvas上绘制和样式化文本。",
                examples: [
                    {
                        title: "基本文本",
                        code: `const ctx = canvas.getContext('2d');

// 设置字体
ctx.font = '30px Arial';

// 填充文本
ctx.fillStyle = 'black';
ctx.fillText('Hello Canvas', 10, 50);

// 描边文本
ctx.strokeStyle = 'blue';
ctx.lineWidth = 1;
ctx.strokeText('Hello Canvas', 10, 100);

// 同时填充和描边
ctx.fillStyle = 'red';
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;
ctx.fillText('Styled Text', 10, 150);
ctx.strokeText('Styled Text', 10, 150);`,
                        notes: "fillText填充文本，strokeText描边文本"
                    },
                    {
                        title: "文本对齐和基线",
                        code: `const ctx = canvas.getContext('2d');
ctx.font = '20px Arial';

// 水平对齐
ctx.textAlign = 'left';    // left, right, center, start, end
ctx.fillText('Left', 200, 50);

ctx.textAlign = 'center';
ctx.fillText('Center', 200, 80);

ctx.textAlign = 'right';
ctx.fillText('Right', 200, 110);

// 垂直基线
ctx.textBaseline = 'top';       // top, hanging, middle, alphabetic, ideographic, bottom
ctx.fillText('Top', 10, 150);

ctx.textBaseline = 'middle';
ctx.fillText('Middle', 100, 150);

ctx.textBaseline = 'bottom';
ctx.fillText('Bottom', 200, 150);`,
                        notes: "textAlign和textBaseline控制文本对齐"
                    },
                    {
                        title: "测量文本",
                        code: `const ctx = canvas.getContext('2d');
ctx.font = '20px Arial';

const text = 'Hello Canvas';
const metrics = ctx.measureText(text);

console.log('文本宽度:', metrics.width);
console.log('文本高度:', metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);

// 根据宽度居中
const x = (canvas.width - metrics.width) / 2;
ctx.fillText(text, x, 50);`,
                        notes: "measureText获取文本尺寸信息"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "图像操作",
            content: {
                description: "在Canvas中使用图像。",
                examples: [
                    {
                        title: "绘制图像",
                        code: `const ctx = canvas.getContext('2d');
const img = new Image();

img.onload = function() {
    // 原始大小
    ctx.drawImage(img, 0, 0);
    
    // 指定大小
    ctx.drawImage(img, 0, 0, 200, 150);
    
    // 裁剪并缩放
    // drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
    ctx.drawImage(
        img,
        50, 50, 100, 100,  // 源图像裁剪区域
        300, 0, 200, 200   // 目标画布区域
    );
};

img.src = 'photo.jpg';`,
                        notes: "drawImage可以绘制、缩放、裁剪图像"
                    },
                    {
                        title: "像素操作",
                        code: `const ctx = canvas.getContext('2d');

// 获取像素数据
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const pixels = imageData.data;  // Uint8ClampedArray [R,G,B,A, R,G,B,A, ...]

// 修改像素（灰度化）
for (let i = 0; i < pixels.length; i += 4) {
    const gray = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
    pixels[i] = gray;      // R
    pixels[i+1] = gray;    // G
    pixels[i+2] = gray;    // B
    // pixels[i+3] 是 Alpha，不变
}

// 写回画布
ctx.putImageData(imageData, 0, 0);`,
                        notes: "getImageData和putImageData操作像素数据"
                    },
                    {
                        title: "导出图像",
                        code: `const canvas = document.getElementById('myCanvas');

// 导出为Data URL
const dataURL = canvas.toDataURL('image/png');
console.log(dataURL);

// 导出为Blob（异步）
canvas.toBlob(function(blob) {
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas-image.png';
    a.click();
    URL.revokeObjectURL(url);
}, 'image/png', 0.95);  // type, quality

// 不同格式
canvas.toDataURL('image/jpeg', 0.8);  // JPEG, 80%质量
canvas.toDataURL('image/webp', 0.9);  // WebP, 90%质量`,
                        notes: "toDataURL和toBlob导出画布内容"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "简单动画",
            content: {
                description: "使用Canvas创建动画效果。",
                examples: [
                    {
                        title: "基本动画循环",
                        code: `const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let x = 0;
let y = 100;
const speed = 2;

function animate() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制
    ctx.fillStyle = 'blue';
    ctx.fillRect(x, y, 50, 50);
    
    // 更新位置
    x += speed;
    if (x > canvas.width) {
        x = -50;
    }
    
    // 继续动画
    requestAnimationFrame(animate);
}

// 开始动画
animate();`,
                        notes: "使用requestAnimationFrame实现动画"
                    },
                    {
                        title: "弹跳球动画",
                        code: `const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const ball = {
    x: 100,
    y: 100,
    radius: 20,
    dx: 3,
    dy: 2,
    color: 'red'
};

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制球
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
    
    // 移动球
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // 边界检测和反弹
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }
    
    requestAnimationFrame(draw);
}

draw();`,
                        notes: "简单的物理模拟动画"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "Canvas使用最佳实践",
            content: {
                description: "优化Canvas性能和代码质量：",
                practices: [
                    {
                        title: "使用离屏Canvas优化",
                        description: "预渲染复杂图形到离屏Canvas。",
                        example: `// 创建离屏canvas
const offscreen = document.createElement('canvas');
offscreen.width = 200;
offscreen.height = 200;
const offCtx = offscreen.getContext('2d');

// 预渲染复杂图形
offCtx.fillStyle = 'red';
offCtx.fillRect(0, 0, 200, 200);
// ...更多绘制

// 在主canvas中使用
const ctx = canvas.getContext('2d');
function render() {
    ctx.drawImage(offscreen, x, y);
}`
                    },
                    {
                        title: "批量绘制减少状态切换",
                        description: "合并相同样式的绘制操作。",
                        example: `// ❌ 不好：频繁切换样式
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 50, 50);
ctx.fillStyle = 'blue';
ctx.fillRect(70, 10, 50, 50);
ctx.fillStyle = 'red';
ctx.fillRect(130, 10, 50, 50);

// ✅ 好：批量绘制
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 50, 50);
ctx.fillRect(130, 10, 50, 50);
ctx.fillStyle = 'blue';
ctx.fillRect(70, 10, 50, 50);`
                    },
                    {
                        title: "避免浮点数坐标",
                        description: "使用整数坐标提升性能。",
                        example: `// ❌ 不好：浮点数坐标
ctx.fillRect(10.5, 20.7, 50.3, 60.8);

// ✅ 好：整数坐标
ctx.fillRect(Math.floor(10.5), Math.floor(20.7), 50, 60);
// 或
ctx.fillRect(10 | 0, 20 | 0, 50, 60);`
                    },
                    {
                        title: "只重绘需要更新的区域",
                        description: "使用局部重绘减少计算量。",
                        example: `// ❌ 不好：总是清空整个画布
ctx.clearRect(0, 0, canvas.width, canvas.height);

// ✅ 好：只清空需要更新的区域
ctx.clearRect(ball.x - ball.radius - 1, 
              ball.y - ball.radius - 1,
              ball.radius * 2 + 2,
              ball.radius * 2 + 2);`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "Canvas检查清单",
            content: {
                description: "确保Canvas的正确使用：",
                items: [
                    { id: "check11-1", text: "Canvas尺寸通过width/height属性设置" },
                    { id: "check11-2", text: "适配了高DPI屏幕" },
                    { id: "check11-3", text: "提供了不支持Canvas的回退内容" },
                    { id: "check11-4", text: "使用requestAnimationFrame而非setTimeout" },
                    { id: "check11-5", text: "批量处理相同样式的绘制" },
                    { id: "check11-6", text: "使用离屏Canvas预渲染复杂图形" },
                    { id: "check11-7", text: "避免频繁的像素操作" },
                    { id: "check11-8", text: "使用整数坐标" },
                    { id: "check11-9", text: "实现了局部重绘优化" },
                    { id: "check11-10", text: "测试了不同浏览器的性能" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "SVG基础", url: "content.html?chapter=10" },
        next: { title: "表格基础", url: "content.html?chapter=12" }
    }
};
