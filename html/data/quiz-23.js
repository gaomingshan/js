// 第23章：SVG基础 - 面试题
window.htmlQuizData_23 = {
    config: {
        title: "SVG基础",
        icon: "📐",
        description: "测试你对SVG的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["基础", "图形"],
            question: "SVG的基本图形元素有哪些？",
            type: "multiple-choice",
            options: [
                "rect矩形",
                "circle圆形",
                "line直线",
                "path路径"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "SVG基本图形",
                description: "SVG提供丰富的图形元素。",
                sections: [
                    {
                        title: "SVG vs Canvas",
                        code: '/* SVG优势 */\n1. 矢量图形，无限缩放\n2. DOM元素，可用CSS和JS\n3. 可访问性好\n4. 事件处理简单\n5. 文件小（简单图形）\n\n/* Canvas优势 */\n1. 像素操作\n2. 高性能（大量图形）\n3. 复杂效果\n4. 游戏、数据可视化\n\n/* 选择 */\nSVG：图标、图表、动画、交互\nCanvas：游戏、实时渲染、大量元素',
                        content: "SVG和Canvas的区别。"
                    },
                    {
                        title: "矩形rect",
                        code: '<!-- 基本矩形 -->\n<svg width="200" height="200">\n  <rect x="10" y="10" width="100" height="50" fill="blue" />\n</svg>\n\n<!-- 圆角矩形 -->\n<rect x="10" y="70" width="100" height="50" \n      rx="10" ry="10" \n      fill="green" />\n\n<!-- 描边 -->\n<rect x="10" y="130" width="100" height="50"\n      fill="none"\n      stroke="red"\n      stroke-width="3" />\n\n<!-- 填充和描边 -->\n<rect x="120" y="10" width="100" height="50"\n      fill="lightblue"\n      stroke="navy"\n      stroke-width="2" />',
                        content: "绘制矩形。"
                    },
                    {
                        title: "圆形circle和椭圆ellipse",
                        code: '<!-- 圆形 -->\n<svg width="200" height="200">\n  <circle cx="50" cy="50" r="40" fill="orange" />\n  <!-- cx, cy: 圆心坐标 -->\n  <!-- r: 半径 -->\n</svg>\n\n<!-- 椭圆 -->\n<ellipse cx="150" cy="50" rx="60" ry="30" fill="purple" />\n<!-- rx: 水平半径 -->\n<!-- ry: 垂直半径 -->\n\n<!-- 描边圆形 -->\n<circle cx="50" cy="150" r="40"\n        fill="none"\n        stroke="green"\n        stroke-width="3" />',
                        content: "绘制圆形和椭圆。"
                    },
                    {
                        title: "线line和折线polyline",
                        code: '<!-- 直线 -->\n<svg width="200" height="200">\n  <line x1="10" y1="10" x2="190" y2="190"\n        stroke="black"\n        stroke-width="2" />\n</svg>\n\n<!-- 折线（不闭合）-->\n<polyline points="10,10 50,50 90,10 130,50"\n          fill="none"\n          stroke="blue"\n          stroke-width="2" />\n\n<!-- 多边形（闭合）-->\n<polygon points="100,10 150,50 125,100 75,100 50,50"\n         fill="lightgreen"\n         stroke="green"\n         stroke-width="2" />\n\n<!-- 虚线 -->\n<line x1="10" y1="100" x2="190" y2="100"\n      stroke="red"\n      stroke-width="2"\n      stroke-dasharray="5,5" />',
                        content: "绘制线条。"
                    },
                    {
                        title: "路径path",
                        code: '<!-- path - 最强大的元素 -->\n<svg width="200" height="200">\n  <!-- M: moveTo -->\n  <!-- L: lineTo -->\n  <!-- H: 水平线 -->\n  <!-- V: 垂直线 -->\n  <!-- Z: 闭合路径 -->\n  \n  <!-- 三角形 -->\n  <path d="M 10 10 L 50 50 L 10 90 Z"\n        fill="blue" />\n  \n  <!-- 曲线 -->\n  <!-- C: 三次贝塞尔曲线 -->\n  <path d="M 10 100 C 40 50, 70 150, 100 100"\n        fill="none"\n        stroke="red"\n        stroke-width="2" />\n  \n  <!-- Q: 二次贝塞尔曲线 -->\n  <path d="M 110 100 Q 140 50 170 100"\n        fill="none"\n        stroke="green"\n        stroke-width="2" />\n  \n  <!-- A: 弧线 -->\n  <path d="M 10 150 A 40 40 0 0 1 90 150"\n        fill="none"\n        stroke="purple"\n        stroke-width="2" />\n</svg>\n\n/* path命令（大写绝对，小写相对） */\nM/m - moveTo移动\nL/l - lineTo直线\nH/h - 水平线\nV/v - 垂直线\nC/c - 三次贝塞尔\nQ/q - 二次贝塞尔\nA/a - 弧线\nZ/z - 闭合路径',
                        content: "强大的path元素。"
                    },
                    {
                        title: "文本text",
                        code: '<!-- 基本文本 -->\n<svg width="300" height="200">\n  <text x="10" y="30" font-size="20" fill="black">\n    Hello SVG\n  </text>\n</svg>\n\n<!-- 文本样式 -->\n<text x="10" y="60"\n      font-family="Arial"\n      font-size="24"\n      font-weight="bold"\n      fill="blue"\n      text-decoration="underline">\n  样式文本\n</text>\n\n<!-- 文本路径 -->\n<defs>\n  <path id="curve" d="M 10 100 Q 150 50 290 100" />\n</defs>\n<text font-size="16" fill="red">\n  <textPath href="#curve">\n    文本沿路径排列\n  </textPath>\n</text>\n\n<!-- 垂直文本 -->\n<text x="10" y="10" writing-mode="tb">\n  垂直文本\n</text>\n\n<!-- tspan（文本段落）-->\n<text x="10" y="150" font-size="18">\n  这是\n  <tspan fill="red" font-weight="bold">红色粗体</tspan>\n  文本\n</text>',
                        content: "文本处理。"
                    }
                ]
            },
            source: "SVG规范"
        },
        {
            difficulty: "medium",
            tags: ["样式", "高级"],
            question: "如何设置SVG的样式？",
            type: "multiple-choice",
            options: [
                "属性设置",
                "CSS样式",
                "渐变和图案",
                "滤镜效果"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "SVG样式",
                description: "多种方式设置SVG样式。",
                sections: [
                    {
                        title: "属性 vs CSS",
                        code: '<!-- 1. 属性设置 -->\n<rect x="10" y="10" width="100" height="50"\n      fill="blue"\n      stroke="red"\n      stroke-width="2" />\n\n<!-- 2. CSS设置 -->\n<style>\n.my-rect {\n  fill: blue;\n  stroke: red;\n  stroke-width: 2;\n}\n</style>\n<rect class="my-rect" x="10" y="10" width="100" height="50" />\n\n<!-- 3. style属性 -->\n<rect x="10" y="10" width="100" height="50"\n      style="fill: blue; stroke: red; stroke-width: 2;" />\n\n/* CSS优先级 */\ninline style > CSS规则 > 属性\n\n/* 可用CSS的属性（presentation attributes）*/\nfill, stroke, stroke-width\nopacity, fill-opacity, stroke-opacity\nfont-family, font-size, font-weight\ntransform\n等等',
                        content: "三种设置样式的方式。"
                    },
                    {
                        title: "渐变",
                        code: '<!-- 线性渐变 -->\n<svg width="200" height="200">\n  <defs>\n    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">\n      <stop offset="0%" style="stop-color:rgb(255,0,0);stop-opacity:1" />\n      <stop offset="100%" style="stop-color:rgb(0,0,255);stop-opacity:1" />\n    </linearGradient>\n  </defs>\n  \n  <rect x="10" y="10" width="180" height="80" fill="url(#grad1)" />\n</svg>\n\n<!-- 径向渐变 -->\n<defs>\n  <radialGradient id="grad2" cx="50%" cy="50%" r="50%">\n    <stop offset="0%" style="stop-color:white;stop-opacity:1" />\n    <stop offset="100%" style="stop-color:blue;stop-opacity:1" />\n  </radialGradient>\n</defs>\n<circle cx="100" cy="150" r="50" fill="url(#grad2)" />\n\n<!-- 多色渐变 -->\n<linearGradient id="rainbow">\n  <stop offset="0%" stop-color="red" />\n  <stop offset="20%" stop-color="orange" />\n  <stop offset="40%" stop-color="yellow" />\n  <stop offset="60%" stop-color="green" />\n  <stop offset="80%" stop-color="blue" />\n  <stop offset="100%" stop-color="purple" />\n</linearGradient>',
                        content: "线性和径向渐变。"
                    },
                    {
                        title: "图案pattern",
                        code: '<!-- 图案填充 -->\n<svg width="200" height="200">\n  <defs>\n    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">\n      <circle cx="10" cy="10" r="5" fill="red" />\n    </pattern>\n  </defs>\n  \n  <rect x="0" y="0" width="200" height="200" fill="url(#dots)" />\n</svg>\n\n<!-- 条纹图案 -->\n<pattern id="stripes" width="10" height="10" patternUnits="userSpaceOnUse">\n  <rect x="0" y="0" width="5" height="10" fill="lightblue" />\n  <rect x="5" y="0" width="5" height="10" fill="darkblue" />\n</pattern>\n\n<!-- 图像图案 -->\n<pattern id="image" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">\n  <image href="pattern.png" width="100" height="100" />\n</pattern>',
                        content: "使用图案填充。"
                    },
                    {
                        title: "滤镜filter",
                        code: '<!-- 模糊滤镜 -->\n<svg width="200" height="200">\n  <defs>\n    <filter id="blur">\n      <feGaussianBlur in="SourceGraphic" stdDeviation="5" />\n    </filter>\n  </defs>\n  \n  <rect x="10" y="10" width="100" height="100" \n        fill="blue" filter="url(#blur)" />\n</svg>\n\n<!-- 阴影 -->\n<filter id="shadow">\n  <feGaussianBlur in="SourceAlpha" stdDeviation="3" />\n  <feOffset dx="5" dy="5" result="offsetblur" />\n  <feMerge>\n    <feMergeNode in="offsetblur" />\n    <feMergeNode in="SourceGraphic" />\n  </feMerge>\n</filter>\n\n<!-- 颜色矩阵（灰度）-->\n<filter id="grayscale">\n  <feColorMatrix type="saturate" values="0" />\n</filter>\n\n<!-- 发光效果 -->\n<filter id="glow">\n  <feGaussianBlur stdDeviation="4" result="coloredBlur" />\n  <feMerge>\n    <feMergeNode in="coloredBlur" />\n    <feMergeNode in="SourceGraphic" />\n  </feMerge>\n</filter>\n\n<!-- 使用 -->\n<circle cx="100" cy="100" r="50" \n        fill="yellow" \n        filter="url(#glow)" />',
                        content: "丰富的滤镜效果。"
                    },
                    {
                        title: "裁剪和蒙版",
                        code: '<!-- clipPath - 裁剪 -->\n<svg width="200" height="200">\n  <defs>\n    <clipPath id="clip-circle">\n      <circle cx="100" cy="100" r="80" />\n    </clipPath>\n  </defs>\n  \n  <image href="photo.jpg" \n         width="200" height="200"\n         clip-path="url(#clip-circle)" />\n</svg>\n\n<!-- mask - 蒙版 -->\n<defs>\n  <mask id="mask1">\n    <!-- 白色：显示 -->\n    <!-- 黑色：隐藏 -->\n    <!-- 灰色：半透明 -->\n    <circle cx="100" cy="100" r="80" fill="white" />\n    <circle cx="120" cy="80" r="30" fill="black" />\n  </mask>\n</defs>\n\n<rect x="0" y="0" width="200" height="200"\n      fill="blue"\n      mask="url(#mask1)" />',
                        content: "裁剪和蒙版。"
                    },
                    {
                        title: "标记marker",
                        code: '<!-- 箭头标记 -->\n<svg width="300" height="100">\n  <defs>\n    <marker id="arrow" markerWidth="10" markerHeight="10" \n            refX="5" refY="5" orient="auto">\n      <polygon points="0,0 10,5 0,10" fill="red" />\n    </marker>\n  </defs>\n  \n  <line x1="10" y1="50" x2="290" y2="50"\n        stroke="black"\n        stroke-width="2"\n        marker-end="url(#arrow)" />\n</svg>\n\n<!-- 起点、中点、终点标记 -->\n<marker id="dot" markerWidth="6" markerHeight="6" refX="3" refY="3">\n  <circle cx="3" cy="3" r="3" fill="blue" />\n</marker>\n\n<polyline points="10,10 50,50 90,10 130,50"\n          fill="none"\n          stroke="black"\n          marker-start="url(#dot)"\n          marker-mid="url(#dot)"\n          marker-end="url(#arrow)" />',
                        content: "箭头和标记。"
                    }
                ]
            },
            source: "SVG规范"
        },
        {
            difficulty: "hard",
            tags: ["动画", "交互"],
            question: "SVG有哪些动画方式？",
            type: "multiple-choice",
            options: [
                "SMIL动画",
                "CSS动画",
                "JavaScript动画",
                "Web Animations API"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "SVG动画",
                description: "多种方式实现SVG动画。",
                sections: [
                    {
                        title: "SMIL动画",
                        code: '<!-- animate - 属性动画 -->\n<svg width="200" height="200">\n  <circle cx="100" cy="100" r="30" fill="blue">\n    <animate attributeName="r"\n             from="30"\n             to="80"\n             dur="2s"\n             repeatCount="indefinite" />\n  </circle>\n</svg>\n\n<!-- animateTransform - 变换动画 -->\n<rect x="50" y="50" width="100" height="100" fill="green">\n  <animateTransform attributeName="transform"\n                    type="rotate"\n                    from="0 100 100"\n                    to="360 100 100"\n                    dur="3s"\n                    repeatCount="indefinite" />\n</rect>\n\n<!-- animateMotion - 路径动画 -->\n<circle cx="0" cy="0" r="10" fill="red">\n  <animateMotion dur="5s" repeatCount="indefinite">\n    <mpath href="#path1" />\n  </animateMotion>\n</circle>\n<path id="path1" d="M 10 100 Q 150 50 290 100" \n      fill="none" stroke="lightgray" />\n\n<!-- set - 设置值 -->\n<text x="50" y="50" font-size="20">\n  文本\n  <set attributeName="fill" to="red" begin="2s" />\n</text>\n\n注意：SMIL在某些浏览器可能被废弃',
                        content: "SMIL动画元素。"
                    },
                    {
                        title: "CSS动画",
                        code: '<!-- CSS动画（推荐）-->\n<style>\n@keyframes rotate {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.rotating {\n  transform-origin: center;\n  animation: rotate 2s linear infinite;\n}\n\n@keyframes pulse {\n  0%, 100% {\n    opacity: 1;\n    transform: scale(1);\n  }\n  50% {\n    opacity: 0.5;\n    transform: scale(1.2);\n  }\n}\n\n.pulsing {\n  transform-origin: center;\n  animation: pulse 1s ease-in-out infinite;\n}\n</style>\n\n<svg width="200" height="200">\n  <circle class="rotating pulsing" \n          cx="100" cy="100" r="50" \n          fill="orange" />\n</svg>\n\n<!-- CSS过渡 -->\n<style>\n.interactive-rect {\n  fill: blue;\n  transition: fill 0.3s, transform 0.3s;\n}\n\n.interactive-rect:hover {\n  fill: red;\n  transform: scale(1.2);\n}\n</style>\n\n<rect class="interactive-rect" \n      x="50" y="50" width="100" height="100" />',
                        content: "使用CSS动画。"
                    },
                    {
                        title: "JavaScript动画",
                        code: '<!-- JavaScript控制 -->\n<svg id="svg" width="200" height="200">\n  <circle id="circle" cx="100" cy="100" r="50" fill="blue" />\n</svg>\n\n<script>\nconst circle = document.getElementById("circle");\nlet angle = 0;\n\nfunction animate() {\n  angle += 0.02;\n  \n  // 修改属性\n  const r = 50 + Math.sin(angle) * 20;\n  circle.setAttribute("r", r);\n  \n  // 修改填充\n  const hue = (angle * 50) % 360;\n  circle.setAttribute("fill", `hsl(${hue}, 70%, 50%)`);\n  \n  requestAnimationFrame(animate);\n}\n\nanimate();\n</script>\n\n/* 使用GSAP库 */\n<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js"></script>\n<script>\ngsap.to("#circle", {\n  duration: 2,\n  attr: { r: 100 },\n  fill: "red",\n  repeat: -1,\n  yoyo: true,\n  ease: "power2.inOut"\n});\n</script>',
                        content: "JavaScript动画控制。"
                    },
                    {
                        title: "交互动画",
                        code: '<!-- SVG交互 -->\n<svg width="300" height="200">\n  <style>\n  .button-rect {\n    fill: #4CAF50;\n    cursor: pointer;\n    transition: all 0.3s;\n  }\n  \n  .button-rect:hover {\n    fill: #45a049;\n    transform: translateY(-2px);\n  }\n  \n  .button-rect:active {\n    transform: translateY(0);\n  }\n  \n  .button-text {\n    fill: white;\n    font-size: 18px;\n    pointer-events: none;\n    user-select: none;\n  }\n  </style>\n  \n  <g class="button" onclick="handleClick()">\n    <rect class="button-rect" \n          x="50" y="50" width="200" height="60" \n          rx="10" />\n    <text class="button-text" \n          x="150" y="85" \n          text-anchor="middle">\n      点击我\n    </text>\n  </g>\n</svg>\n\n<script>\nfunction handleClick() {\n  console.log("按钮被点击");\n  \n  // 动画反馈\n  const rect = document.querySelector(".button-rect");\n  rect.style.fill = "#2196F3";\n  setTimeout(() => {\n    rect.style.fill = "#4CAF50";\n  }, 200);\n}\n</script>',
                        content: "创建交互式SVG。"
                    },
                    {
                        title: "路径动画",
                        code: '<!-- 描边动画 -->\n<svg width="400" height="200">\n  <style>\n  .animated-path {\n    stroke-dasharray: 1000;\n    stroke-dashoffset: 1000;\n    animation: draw 3s ease-in-out forwards;\n  }\n  \n  @keyframes draw {\n    to {\n      stroke-dashoffset: 0;\n    }\n  }\n  </style>\n  \n  <path class="animated-path"\n        d="M 10 100 Q 200 50 390 100"\n        fill="none"\n        stroke="blue"\n        stroke-width="3" />\n</svg>\n\n<!-- JavaScript控制路径动画 -->\n<script>\nconst path = document.querySelector(".path");\nconst length = path.getTotalLength();\n\n// 设置初始状态\npath.style.strokeDasharray = length;\npath.style.strokeDashoffset = length;\n\n// 动画\nlet offset = length;\nfunction animate() {\n  offset -= 2;\n  if (offset < 0) offset = length;\n  path.style.strokeDashoffset = offset;\n  requestAnimationFrame(animate);\n}\nanimate();\n</script>',
                        content: "路径描边动画。"
                    },
                    {
                        title: "复杂动画示例",
                        code: '<!-- 加载动画 -->\n<svg width="100" height="100" viewBox="0 0 100 100">\n  <style>\n  .spinner {\n    transform-origin: center;\n    animation: spin 1s linear infinite;\n  }\n  \n  @keyframes spin {\n    to { transform: rotate(360deg); }\n  }\n  \n  .spinner circle {\n    fill: none;\n    stroke: #3498db;\n    stroke-width: 8;\n    stroke-linecap: round;\n    stroke-dasharray: 200;\n    animation: dash 1.5s ease-in-out infinite;\n  }\n  \n  @keyframes dash {\n    0% {\n      stroke-dashoffset: 200;\n    }\n    50% {\n      stroke-dashoffset: 50;\n      transform: rotate(135deg);\n    }\n    100% {\n      stroke-dashoffset: 200;\n      transform: rotate(450deg);\n    }\n  }\n  </style>\n  \n  <g class="spinner">\n    <circle cx="50" cy="50" r="40" />\n  </g>\n</svg>\n\n<!-- 波浪动画 -->\n<svg width="400" height="200" viewBox="0 0 400 200">\n  <style>\n  .wave {\n    animation: wave 2s linear infinite;\n  }\n  \n  @keyframes wave {\n    0% { d: path("M0,100 Q100,80 200,100 T400,100"); }\n    50% { d: path("M0,100 Q100,120 200,100 T400,100"); }\n    100% { d: path("M0,100 Q100,80 200,100 T400,100"); }\n  }\n  </style>\n  \n  <path class="wave"\n        d="M0,100 Q100,80 200,100 T400,100"\n        fill="none"\n        stroke="blue"\n        stroke-width="3" />\n</svg>',
                        content: "复杂动画效果。"
                    }
                ]
            },
            source: "SVG规范"
        },
        {
            difficulty: "medium",
            tags: ["优化", "实践"],
            question: "如何优化SVG性能？",
            type: "multiple-choice",
            options: [
                "简化路径",
                "删除无用元素",
                "使用symbols复用",
                "压缩优化"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "SVG优化",
                description: "提升SVG性能和文件大小。",
                sections: [
                    {
                        title: "SVGO优化",
                        code: '/* SVGO - SVG优化工具 */\n\n// 安装\nnpm install -g svgo\n\n// 使用\nsvgo input.svg -o output.svg\n\n// 配置文件 svgo.config.js\nmodule.exports = {\n  plugins: [\n    {\n      name: "removeViewBox",\n      active: false  // 保留viewBox\n    },\n    {\n      name: "removeDimensions",\n      active: true  // 删除width/height（响应式）\n    },\n    "removeDoctype",\n    "removeComments",\n    "removeMetadata",\n    "removeEditorsNSData",\n    "cleanupIDs",\n    "minifyStyles",\n    "convertColors",\n    "convertPathData",\n    "mergePaths",\n    "removeEmptyContainers",\n    "removeUnusedNS"\n  ]\n};\n\n/* 优化效果 */\n优化前：10KB\n优化后：3KB（节省70%）',
                        content: "使用SVGO压缩。"
                    },
                    {
                        title: "复用元素",
                        code: '<!-- ❌ 不好：重复代码 -->\n<svg>\n  <circle cx="50" cy="50" r="20" fill="blue" />\n  <circle cx="100" cy="50" r="20" fill="blue" />\n  <circle cx="150" cy="50" r="20" fill="blue" />\n</svg>\n\n<!-- ✅ 好：使用symbol -->\n<svg>\n  <defs>\n    <symbol id="dot" viewBox="0 0 40 40">\n      <circle cx="20" cy="20" r="20" fill="blue" />\n    </symbol>\n  </defs>\n  \n  <use href="#dot" x="30" y="30" width="40" height="40" />\n  <use href="#dot" x="80" y="30" width="40" height="40" />\n  <use href="#dot" x="130" y="30" width="40" height="40" />\n</svg>\n\n<!-- 图标系统 -->\n<svg style="display: none">\n  <symbol id="icon-heart" viewBox="0 0 24 24">\n    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>\n  </symbol>\n  \n  <symbol id="icon-star" viewBox="0 0 24 24">\n    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>\n  </symbol>\n</svg>\n\n<!-- 使用图标 -->\n<svg width="24" height="24"><use href="#icon-heart" /></svg>\n<svg width="24" height="24"><use href="#icon-star" /></svg>',
                        content: "复用减少代码量。"
                    },
                    {
                        title: "简化路径",
                        code: '<!-- ❌ 复杂路径 -->\n<path d="M 10.234567 20.123456 L 30.456789 20.234567 L 30.567890 40.345678 L 10.678901 40.456789 Z" />\n\n<!-- ✅ 简化路径 -->\n<path d="M 10 20 L 30 20 L 30 40 L 10 40 Z" />\n\n<!-- 或使用简单形状 -->\n<rect x="10" y="20" width="20" height="20" />\n\n/* 路径简化技巧 */\n1. 合并重复点\n2. 删除小数位数\n3. 使用相对命令\n4. 转换为简单图形\n\n<!-- 相对命令更短 -->\n<!-- 绝对命令 -->\n<path d="M 10 10 L 20 10 L 20 20 L 10 20 Z" />\n\n<!-- 相对命令 -->\n<path d="M 10 10 h 10 v 10 h -10 Z" />',
                        content: "简化路径数据。"
                    },
                    {
                        title: "性能优化",
                        code: '/* 1. 减少DOM节点 */\n// ❌ 大量circle\nfor (let i = 0; i < 1000; i++) {\n  svg.innerHTML += `<circle cx="${i}" cy="50" r="2" />`;\n}\n\n// ✅ 使用path\nlet d = "";\nfor (let i = 0; i < 1000; i++) {\n  d += `M ${i} 50 m -2,0 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0 `;\n}\nsvg.innerHTML = `<path d="${d}" />`;\n\n/* 2. 使用CSS而非属性 */\n<!-- ❌ -->\n<circle fill="red" stroke="blue" stroke-width="2" />\n\n<!-- ✅ -->\n<style>.circle { fill: red; stroke: blue; stroke-width: 2; }</style>\n<circle class="circle" />\n\n/* 3. 避免过度使用滤镜 */\n// 滤镜很消耗性能\n// 尽量用CSS实现\n\n/* 4. 合理使用viewBox */\n<svg viewBox="0 0 100 100" width="100%" height="100%">\n  <!-- 响应式，无需width/height属性 -->\n</svg>\n\n/* 5. 延迟加载 */\n<img data-src="icon.svg" loading="lazy" alt="Icon">',
                        content: "性能优化技巧。"
                    },
                    {
                        title: "工具和库",
                        code: '/* 1. SVGO - 优化 */\nhttps://github.com/svg/svgo\n\n/* 2. SVGOMG - 在线优化 */\nhttps://jakearchibald.github.io/svgomg/\n\n/* 3. SVG.js - JavaScript库 */\nimport { SVG } from "@svgdotjs/svg.js";\n\nconst draw = SVG().addTo("body").size(300, 300);\nconst circle = draw.circle(100).fill("#f06");\ncircle.animate().move(150, 150);\n\n/* 4. Snap.svg - 动画库 */\nconst s = Snap("#svg");\nconst circle = s.circle(50, 50, 40);\ncircle.animate({ r: 80 }, 1000);\n\n/* 5. D3.js - 数据可视化 */\nimport * as d3 from "d3";\n\nconst svg = d3.select("svg");\nsvg.append("circle")\n   .attr("cx", 50)\n   .attr("cy", 50)\n   .attr("r", 40);\n\n/* 6. Vivus - 描边动画 */\nnew Vivus("my-svg", { duration: 200 });',
                        content: "SVG工具和库。"
                    }
                ]
            },
            source: "SVG优化"
        }
    ],
    navigation: {
        prev: { title: "Canvas基础", url: "22-canvas-quiz.html" },
        next: { title: "Web存储", url: "24-storage-quiz.html" }
    }
};
