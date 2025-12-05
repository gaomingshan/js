// 第22章：Canvas基础 - 面试题
window.htmlQuizData_22 = {
    config: {
        title: "Canvas基础",
        icon: "🎨",
        description: "测试你对Canvas的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["基础", "绘图"],
            question: "如何在Canvas上绘制基本图形？",
            type: "multiple-choice",
            options: [
                "获取2D上下文",
                "使用路径API",
                "填充或描边",
                "保存和恢复状态"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Canvas基本绘图",
                description: "Canvas 2D绘图API的基础使用。",
                sections: [
                    {
                        title: "获取上下文",
                        code: '<!-- HTML -->\n<canvas id="myCanvas" width="800" height="600"></canvas>\n\n<script>\nconst canvas = document.getElementById("myCanvas");\nconst ctx = canvas.getContext("2d");\n\n// 检查支持\nif (!ctx) {\n  console.log("浏览器不支持Canvas");\n}\n\n/* 设置canvas尺寸 */\n// ❌ 不好：CSS设置（会拉伸）\ncanvas.style.width = "800px";\ncanvas.style.height = "600px";\n\n// ✅ 好：属性设置\ncanvas.width = 800;\ncanvas.height = 600;\n\n/* 高DPI屏幕适配 */\nconst dpr = window.devicePixelRatio || 1;\ncanvas.width = 800 * dpr;\ncanvas.height = 600 * dpr;\ncanvas.style.width = "800px";\ncanvas.style.height = "600px";\nctx.scale(dpr, dpr);\n</script>',
                        points: [
                            "getContext('2d')获取上下文",
                            "width/height属性设置尺寸",
                            "不要用CSS设置（会拉伸）",
                            "高DPI屏幕需适配",
                            "scale缩放坐标系"
                        ]
                    },
                    {
                        title: "绘制矩形",
                        code: '/* 填充矩形 */\nctx.fillStyle = "blue";\nctx.fillRect(10, 10, 100, 50);\n// fillRect(x, y, width, height)\n\n/* 描边矩形 */\nctx.strokeStyle = "red";\nctx.lineWidth = 2;\nctx.strokeRect(120, 10, 100, 50);\n\n/* 清除矩形 */\nctx.clearRect(0, 0, canvas.width, canvas.height);\n// 清除整个画布\n\n/* 组合使用 */\nctx.fillStyle = "lightblue";\nctx.fillRect(50, 50, 200, 100);\n\nctx.strokeStyle = "navy";\nctx.lineWidth = 3;\nctx.strokeRect(50, 50, 200, 100);',
                        content: "矩形是最简单的图形。"
                    },
                    {
                        title: "路径绘制",
                        code: '/* 基本路径 */\nctx.beginPath();      // 开始路径\nctx.moveTo(50, 50);   // 移动到起点\nctx.lineTo(200, 50);  // 画线到\nctx.lineTo(200, 200); // 画线到\nctx.lineTo(50, 200);  // 画线到\nctx.closePath();      // 闭合路径\nctx.stroke();         // 描边\n// 或\nctx.fill();           // 填充\n\n/* 绘制三角形 */\nctx.beginPath();\nctx.moveTo(100, 50);\nctx.lineTo(150, 150);\nctx.lineTo(50, 150);\nctx.closePath();\nctx.fillStyle = "green";\nctx.fill();\n\n/* 绘制圆形 */\nctx.beginPath();\nctx.arc(100, 100, 50, 0, Math.PI * 2);\n// arc(x, y, radius, startAngle, endAngle, anticlockwise)\nctx.fillStyle = "orange";\nctx.fill();\n\n/* 绘制圆弧 */\nctx.beginPath();\nctx.arc(200, 200, 50, 0, Math.PI);  // 半圆\nctx.strokeStyle = "purple";\nctx.stroke();\n\n/* 贝塞尔曲线 */\n// 二次贝塞尔\nctx.beginPath();\nctx.moveTo(50, 50);\nctx.quadraticCurveTo(100, 0, 150, 50);\nctx.stroke();\n\n// 三次贝塞尔\nctx.beginPath();\nctx.moveTo(50, 100);\nctx.bezierCurveTo(100, 50, 150, 150, 200, 100);\nctx.stroke();',
                        content: "使用路径绘制复杂图形。"
                    },
                    {
                        title: "样式设置",
                        code: '/* 颜色 */\nctx.fillStyle = "red";           // 纯色\nctx.fillStyle = "#ff0000";       // 十六进制\nctx.fillStyle = "rgb(255,0,0)";  // RGB\nctx.fillStyle = "rgba(255,0,0,0.5)";  // RGBA\n\n/* 渐变 */\n// 线性渐变\nconst gradient = ctx.createLinearGradient(0, 0, 200, 0);\ngradient.addColorStop(0, "red");\ngradient.addColorStop(0.5, "yellow");\ngradient.addColorStop(1, "green");\nctx.fillStyle = gradient;\nctx.fillRect(0, 0, 200, 100);\n\n// 径向渐变\nconst radial = ctx.createRadialGradient(100, 100, 10, 100, 100, 100);\nradial.addColorStop(0, "white");\nradial.addColorStop(1, "black");\nctx.fillStyle = radial;\nctx.fillRect(0, 0, 200, 200);\n\n/* 图案 */\nconst img = new Image();\nimg.onload = () => {\n  const pattern = ctx.createPattern(img, "repeat");\n  // repeat, repeat-x, repeat-y, no-repeat\n  ctx.fillStyle = pattern;\n  ctx.fillRect(0, 0, 400, 400);\n};\nimg.src = "pattern.png";\n\n/* 线条样式 */\nctx.lineWidth = 10;           // 线宽\nctx.lineCap = "round";        // 线帽：butt, round, square\nctx.lineJoin = "round";       // 连接：miter, round, bevel\nctx.setLineDash([5, 10]);     // 虚线：[实线长度, 间隙长度]\nctx.lineDashOffset = 0;       // 虚线偏移\n\n/* 透明度 */\nctx.globalAlpha = 0.5;  // 全局透明度（0-1）',
                        content: "丰富的样式选项。"
                    },
                    {
                        title: "文本绘制",
                        code: '/* 绘制文本 */\nctx.font = "30px Arial";\nctx.fillStyle = "black";\nctx.fillText("Hello Canvas", 50, 50);\n// fillText(text, x, y, maxWidth)\n\n/* 描边文本 */\nctx.strokeStyle = "blue";\nctx.lineWidth = 2;\nctx.strokeText("Hello Canvas", 50, 100);\n\n/* 文本对齐 */\nctx.textAlign = "left";     // left, right, center, start, end\nctx.textBaseline = "top";   // top, middle, bottom, alphabetic, hanging\n\n/* 测量文本 */\nconst metrics = ctx.measureText("Hello");\nconsole.log(metrics.width);  // 文本宽度\n\n/* 完整示例 */\nctx.font = "bold 40px Arial";\nctx.textAlign = "center";\nctx.textBaseline = "middle";\n\n// 居中文本\nconst text = "居中文本";\nconst x = canvas.width / 2;\nconst y = canvas.height / 2;\n\nctx.fillStyle = "white";\nctx.fillText(text, x, y);\n\nctx.strokeStyle = "black";\nctx.lineWidth = 2;\nctx.strokeText(text, x, y);',
                        content: "绘制和设置文本。"
                    },
                    {
                        title: "状态保存",
                        code: '/* save/restore - 保存和恢复状态 */\n\n// 保存当前状态\nctx.save();\n\n// 修改状态\nctx.fillStyle = "red";\nctx.translate(100, 100);\nctx.rotate(Math.PI / 4);\n\n// 绘制\nctx.fillRect(0, 0, 100, 100);\n\n// 恢复之前的状态\nctx.restore();\n\n// 现在又是原来的状态了\nctx.fillRect(200, 200, 100, 100);\n\n/* 嵌套保存 */\nctx.save();  // 保存状态1\n  ctx.fillStyle = "red";\n  ctx.save();  // 保存状态2\n    ctx.fillStyle = "blue";\n  ctx.restore();  // 恢复状态2\n  // 现在是红色\nctx.restore();  // 恢复状态1\n// 现在是最初状态\n\n/* 保存的状态包括 */\n- fillStyle, strokeStyle\n- lineWidth, lineCap, lineJoin\n- globalAlpha\n- font, textAlign, textBaseline\n- transform（变换矩阵）\n- clip（裁剪区域）\n- 等等',
                        content: "保存和恢复绘图状态。"
                    }
                ]
            },
            source: "Canvas API"
        },
        {
            difficulty: "medium",
            tags: ["变换", "高级"],
            question: "Canvas的变换方法有哪些？",
            type: "multiple-choice",
            options: [
                "translate平移",
                "rotate旋转",
                "scale缩放",
                "transform矩阵变换"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Canvas变换",
                description: "使用变换创建复杂效果。",
                sections: [
                    {
                        title: "平移translate",
                        code: '/* translate(x, y) - 移动坐标原点 */\n\n// 不使用translate\nctx.fillRect(100, 100, 50, 50);\n\n// 使用translate\nctx.save();\nctx.translate(100, 100);  // 原点移到(100, 100)\nctx.fillRect(0, 0, 50, 50);  // 相对于新原点\nctx.restore();\n\n/* 实际应用：绘制多个相同图形 */\nfunction drawStar(ctx, x, y, size) {\n  ctx.save();\n  ctx.translate(x, y);\n  \n  // 绘制星星（相对于原点）\n  ctx.beginPath();\n  for (let i = 0; i < 5; i++) {\n    const angle = (i * 4 * Math.PI) / 5;\n    const x = Math.cos(angle) * size;\n    const y = Math.sin(angle) * size;\n    if (i === 0) {\n      ctx.moveTo(x, y);\n    } else {\n      ctx.lineTo(x, y);\n    }\n  }\n  ctx.closePath();\n  ctx.fill();\n  \n  ctx.restore();\n}\n\n// 绘制多个星星\ndrawStar(ctx, 100, 100, 30);\ndrawStar(ctx, 200, 150, 40);\ndrawStar(ctx, 300, 100, 25);',
                        content: "平移坐标原点。"
                    },
                    {
                        title: "旋转rotate",
                        code: '/* rotate(angle) - 旋转（弧度） */\n\n// 旋转45度\nctx.save();\nctx.translate(100, 100);  // 先移到旋转中心\nctx.rotate(Math.PI / 4);  // 旋转45度\nctx.fillRect(-25, -25, 50, 50);  // 绘制正方形\nctx.restore();\n\n/* 角度转弧度 */\nfunction degToRad(degrees) {\n  return degrees * Math.PI / 180;\n}\n\nctx.rotate(degToRad(45));  // 45度\n\n/* 动画旋转 */\nlet angle = 0;\n\nfunction animate() {\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n  \n  ctx.save();\n  ctx.translate(200, 200);\n  ctx.rotate(angle);\n  ctx.fillStyle = "blue";\n  ctx.fillRect(-50, -50, 100, 100);\n  ctx.restore();\n  \n  angle += 0.02;\n  requestAnimationFrame(animate);\n}\n\nanimate();\n\n/* 围绕中心旋转 */\nfunction drawRotated(x, y, width, height, angle) {\n  ctx.save();\n  ctx.translate(x + width / 2, y + height / 2);\n  ctx.rotate(angle);\n  ctx.fillRect(-width / 2, -height / 2, width, height);\n  ctx.restore();\n}',
                        content: "旋转坐标系。"
                    },
                    {
                        title: "缩放scale",
                        code: '/* scale(x, y) - 缩放 */\n\nctx.save();\nctx.scale(2, 2);  // 放大2倍\nctx.fillRect(10, 10, 50, 50);  // 实际大小100x100\nctx.restore();\n\n/* 不同方向缩放 */\nctx.save();\nctx.scale(2, 1);  // 水平2倍，垂直1倍\nctx.fillRect(10, 10, 50, 50);\nctx.restore();\n\n/* 镜像 */\nctx.save();\nctx.scale(-1, 1);  // 水平镜像\nctx.fillText("镜像文本", -200, 50);\nctx.restore();\n\n/* 高DPI适配 */\nconst dpr = window.devicePixelRatio || 1;\ncanvas.width = 800 * dpr;\ncanvas.height = 600 * dpr;\ncanvas.style.width = "800px";\ncanvas.style.height = "600px";\nctx.scale(dpr, dpr);\n\n/* 注意：scale会影响线宽 */\nctx.lineWidth = 1;\nctx.scale(2, 2);\nctx.strokeRect(10, 10, 50, 50);  // 线宽变成2',
                        content: "缩放坐标系。"
                    },
                    {
                        title: "组合变换",
                        code: '/* 变换顺序很重要 */\n\n// 顺序1：先平移后旋转\nctx.save();\nctx.translate(100, 100);\nctx.rotate(Math.PI / 4);\nctx.fillRect(0, 0, 50, 50);\nctx.restore();\n\n// 顺序2：先旋转后平移（结果不同）\nctx.save();\nctx.rotate(Math.PI / 4);\nctx.translate(100, 100);\nctx.fillRect(0, 0, 50, 50);\nctx.restore();\n\n/* 复杂变换示例 */\nfunction drawComplexShape(x, y, size, rotation) {\n  ctx.save();\n  \n  // 1. 平移到位置\n  ctx.translate(x, y);\n  \n  // 2. 旋转\n  ctx.rotate(rotation);\n  \n  // 3. 缩放\n  ctx.scale(size, size);\n  \n  // 4. 绘制（相对于原点）\n  ctx.fillStyle = "purple";\n  ctx.beginPath();\n  ctx.moveTo(0, -1);\n  ctx.lineTo(0.5, 0.5);\n  ctx.lineTo(-0.5, 0.5);\n  ctx.closePath();\n  ctx.fill();\n  \n  ctx.restore();\n}\n\ndrawComplexShape(200, 200, 50, Math.PI / 6);',
                        content: "组合使用变换。"
                    },
                    {
                        title: "transform和setTransform",
                        code: '/* transform(a, b, c, d, e, f) - 矩阵变换 */\n\n// 变换矩阵：\n// | a  c  e |\n// | b  d  f |\n// | 0  0  1 |\n\n// 水平缩放2倍\nctx.transform(2, 0, 0, 1, 0, 0);\n\n// 等同于\nctx.scale(2, 1);\n\n/* setTransform - 重置后设置 */\nctx.setTransform(1, 0, 0, 1, 0, 0);  // 重置为单位矩阵\n\n/* 重置变换 */\nctx.resetTransform();  // HTML5标准\n// 或\nctx.setTransform(1, 0, 0, 1, 0, 0);  // 兼容写法\n\n/* 获取当前变换 */\nconst matrix = ctx.getTransform();\nconsole.log(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);',
                        content: "矩阵变换。"
                    },
                    {
                        title: "实际应用",
                        code: '/* 时钟示例 */\nfunction drawClock() {\n  const now = new Date();\n  const hours = now.getHours() % 12;\n  const minutes = now.getMinutes();\n  const seconds = now.getSeconds();\n  \n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n  \n  ctx.save();\n  ctx.translate(200, 200);  // 移到中心\n  \n  // 表盘\n  ctx.beginPath();\n  ctx.arc(0, 0, 100, 0, Math.PI * 2);\n  ctx.strokeStyle = "black";\n  ctx.lineWidth = 5;\n  ctx.stroke();\n  \n  // 时针\n  ctx.save();\n  ctx.rotate((hours + minutes / 60) * Math.PI / 6);\n  ctx.beginPath();\n  ctx.moveTo(0, 0);\n  ctx.lineTo(0, -50);\n  ctx.lineWidth = 8;\n  ctx.stroke();\n  ctx.restore();\n  \n  // 分针\n  ctx.save();\n  ctx.rotate((minutes + seconds / 60) * Math.PI / 30);\n  ctx.beginPath();\n  ctx.moveTo(0, 0);\n  ctx.lineTo(0, -70);\n  ctx.lineWidth = 5;\n  ctx.stroke();\n  ctx.restore();\n  \n  // 秒针\n  ctx.save();\n  ctx.rotate(seconds * Math.PI / 30);\n  ctx.beginPath();\n  ctx.moveTo(0, 0);\n  ctx.lineTo(0, -90);\n  ctx.strokeStyle = "red";\n  ctx.lineWidth = 2;\n  ctx.stroke();\n  ctx.restore();\n  \n  ctx.restore();\n  \n  requestAnimationFrame(drawClock);\n}\n\ndrawClock();',
                        content: "时钟示例。"
                    }
                ]
            },
            source: "Canvas API"
        },
        {
            difficulty: "medium",
            tags: ["图像", "处理"],
            question: "如何在Canvas中处理图像？",
            type: "multiple-choice",
            options: [
                "drawImage绘制图像",
                "getImageData获取像素",
                "putImageData写入像素",
                "toDataURL导出图像"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Canvas图像处理",
                description: "绘制和处理图像。",
                sections: [
                    {
                        title: "绘制图像",
                        code: '/* drawImage - 绘制图像 */\n\nconst img = new Image();\nimg.onload = function() {\n  // 1. 原始大小\n  ctx.drawImage(img, 0, 0);\n  \n  // 2. 指定大小\n  ctx.drawImage(img, 0, 0, 200, 100);\n  // drawImage(image, x, y, width, height)\n  \n  // 3. 裁剪和缩放\n  ctx.drawImage(\n    img,\n    100, 100, 200, 200,  // 源图像区域\n    0, 0, 100, 100       // 目标区域\n  );\n  // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)\n};\nimg.src = "image.jpg";\n\n/* 跨域图像 */\nconst img = new Image();\nimg.crossOrigin = "anonymous";  // 允许跨域\nimg.onload = function() {\n  ctx.drawImage(img, 0, 0);\n};\nimg.src = "https://example.com/image.jpg";\n\n/* 绘制Canvas */\nconst otherCanvas = document.getElementById("other");\nctx.drawImage(otherCanvas, 0, 0);\n\n/* 绘制Video */\nconst video = document.getElementById("video");\nvideo.addEventListener("play", function() {\n  function drawFrame() {\n    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);\n    requestAnimationFrame(drawFrame);\n  }\n  drawFrame();\n});',
                        content: "绘制各种图像源。"
                    },
                    {
                        title: "获取像素数据",
                        code: '/* getImageData - 获取像素数据 */\n\nconst imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n// getImageData(x, y, width, height)\n\nconsole.log(imageData.width);   // 宽度\nconsole.log(imageData.height);  // 高度\nconsole.log(imageData.data);    // Uint8ClampedArray\n\n/* 像素数据格式 */\n// data数组：[R, G, B, A, R, G, B, A, ...]\n// 每4个值代表一个像素\n\n// 获取(x, y)位置的像素\nfunction getPixel(imageData, x, y) {\n  const index = (y * imageData.width + x) * 4;\n  return {\n    r: imageData.data[index],\n    g: imageData.data[index + 1],\n    b: imageData.data[index + 2],\n    a: imageData.data[index + 3]\n  };\n}\n\n// 设置(x, y)位置的像素\nfunction setPixel(imageData, x, y, r, g, b, a) {\n  const index = (y * imageData.width + x) * 4;\n  imageData.data[index] = r;\n  imageData.data[index + 1] = g;\n  imageData.data[index + 2] = b;\n  imageData.data[index + 3] = a;\n}',
                        content: "获取和操作像素数据。"
                    },
                    {
                        title: "图像处理",
                        code: '/* 灰度化 */\nfunction grayscale() {\n  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n  const data = imageData.data;\n  \n  for (let i = 0; i < data.length; i += 4) {\n    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;\n    data[i] = avg;      // R\n    data[i + 1] = avg;  // G\n    data[i + 2] = avg;  // B\n    // data[i + 3] 保持不变（Alpha）\n  }\n  \n  ctx.putImageData(imageData, 0, 0);\n}\n\n/* 反色 */\nfunction invert() {\n  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n  const data = imageData.data;\n  \n  for (let i = 0; i < data.length; i += 4) {\n    data[i] = 255 - data[i];      // R\n    data[i + 1] = 255 - data[i + 1];  // G\n    data[i + 2] = 255 - data[i + 2];  // B\n  }\n  \n  ctx.putImageData(imageData, 0, 0);\n}\n\n/* 亮度调整 */\nfunction brightness(value) {\n  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n  const data = imageData.data;\n  \n  for (let i = 0; i < data.length; i += 4) {\n    data[i] = Math.min(255, data[i] + value);\n    data[i + 1] = Math.min(255, data[i + 1] + value);\n    data[i + 2] = Math.min(255, data[i + 2] + value);\n  }\n  \n  ctx.putImageData(imageData, 0, 0);\n}\n\n/* 模糊（简单版）*/\nfunction blur() {\n  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n  const data = imageData.data;\n  const width = imageData.width;\n  const height = imageData.height;\n  const result = new Uint8ClampedArray(data);\n  \n  for (let y = 1; y < height - 1; y++) {\n    for (let x = 1; x < width - 1; x++) {\n      for (let c = 0; c < 3; c++) {  // RGB\n        let sum = 0;\n        for (let dy = -1; dy <= 1; dy++) {\n          for (let dx = -1; dx <= 1; dx++) {\n            const i = ((y + dy) * width + (x + dx)) * 4 + c;\n            sum += data[i];\n          }\n        }\n        const i = (y * width + x) * 4 + c;\n        result[i] = sum / 9;\n      }\n    }\n  }\n  \n  imageData.data.set(result);\n  ctx.putImageData(imageData, 0, 0);\n}',
                        content: "各种图像处理效果。"
                    },
                    {
                        title: "导出图像",
                        code: '/* toDataURL - 导出为Data URL */\n\n// PNG（默认）\nconst dataURL = canvas.toDataURL();\nconsole.log(dataURL);\n// "data:image/png;base64,iVBORw0KGgo..."\n\n// JPEG（可指定质量）\nconst jpegURL = canvas.toDataURL("image/jpeg", 0.8);\n// 第二个参数：质量（0-1）\n\n/* 下载图像 */\nfunction downloadCanvas() {\n  const link = document.createElement("a");\n  link.download = "canvas.png";\n  link.href = canvas.toDataURL();\n  link.click();\n}\n\n/* toBlob - 导出为Blob */\ncanvas.toBlob((blob) => {\n  // 上传到服务器\n  const formData = new FormData();\n  formData.append("image", blob, "canvas.png");\n  \n  fetch("/upload", {\n    method: "POST",\n    body: formData\n  });\n}, "image/png");\n\n/* 复制到剪贴板 */\ncanvas.toBlob(async (blob) => {\n  const item = new ClipboardItem({ "image/png": blob });\n  await navigator.clipboard.write([item]);\n  console.log("已复制到剪贴板");\n});',
                        content: "导出Canvas内容。"
                    },
                    {
                        title: "性能优化",
                        code: '/* 1. 离屏Canvas */\nconst offscreen = document.createElement("canvas");\noffscreen.width = 800;\noffscreen.height = 600;\nconst offCtx = offscreen.getContext("2d");\n\n// 在离屏canvas绘制复杂内容\noffCtx.fillStyle = "blue";\noffCtx.fillRect(0, 0, 100, 100);\n// ... 更多绘制 ...\n\n// 一次性复制到主canvas\nctx.drawImage(offscreen, 0, 0);\n\n/* 2. 缓存图像 */\nconst cache = {};\n\nfunction drawCachedImage(key, drawFn) {\n  if (!cache[key]) {\n    const canvas = document.createElement("canvas");\n    canvas.width = 100;\n    canvas.height = 100;\n    const ctx = canvas.getContext("2d");\n    drawFn(ctx);\n    cache[key] = canvas;\n  }\n  return cache[key];\n}\n\n// 使用\nconst star = drawCachedImage("star", (ctx) => {\n  // 绘制星星\n});\n\nctx.drawImage(star, 100, 100);\n\n/* 3. 分层渲染 */\n// 背景层（静态）\nconst bgCanvas = document.createElement("canvas");\n// 只绘制一次\n\n// 前景层（动态）\nconst fgCanvas = mainCanvas;\n\nfunction render() {\n  // 先绘制背景层\n  ctx.drawImage(bgCanvas, 0, 0);\n  // 再绘制动态内容\n  drawDynamicContent();\n}',
                        content: "优化Canvas性能。"
                    }
                ]
            },
            source: "Canvas API"
        }
    ],
    navigation: {
        prev: { title: "事件系统", url: "quiz.html?chapter=21" },
        next: { title: "SVG基础", url: "quiz.html?chapter=23" }
    }
};
