// 第10章：SVG基础 - 内容数据
window.htmlContentData_10 = {
    section: {
        title: "SVG基础",
        icon: "🎨"
    },
    topics: [
        {
            type: "concept",
            title: "SVG概述",
            content: {
                description: "SVG（Scalable Vector Graphics，可缩放矢量图形）是基于XML的矢量图形格式，可以无损缩放，非常适合图标、图表和简单图形。",
                keyPoints: [
                    "SVG是基于XML的矢量图形格式",
                    "可以无限缩放而不失真",
                    "文件体积小，适合网络传输",
                    "可以通过CSS和JavaScript控制",
                    "支持动画和交互",
                    "SEO友好，可被搜索引擎索引"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/SVG"
            }
        },
        {
            type: "code-example",
            title: "SVG使用方式",
            content: {
                description: "SVG可以通过多种方式在HTML中使用。",
                examples: [
                    {
                        title: "内联SVG",
                        code: `<!-- 直接在HTML中嵌入SVG代码 -->
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" 
            fill="blue" 
            stroke="black" 
            stroke-width="2"/>
</svg>

<!-- 更复杂的SVG -->
<svg width="200" height="200" viewBox="0 0 200 200">
    <rect x="10" y="10" width="180" height="180" 
          fill="#f0f0f0" 
          stroke="#333" 
          stroke-width="2"/>
    <circle cx="100" cy="100" r="50" fill="red"/>
    <text x="100" y="110" 
          text-anchor="middle" 
          font-size="20"
          fill="white">
        SVG
    </text>
</svg>`,
                        notes: "内联SVG可以直接用CSS和JS控制"
                    },
                    {
                        title: "作为图片引入",
                        code: `<!-- img标签 -->
<img src="logo.svg" alt="Logo" width="200" height="100">

<!-- CSS背景 -->
<div class="icon" style="
    background-image: url('icon.svg');
    width: 50px;
    height: 50px;
    background-size: contain;
"></div>

<!-- picture元素 -->
<picture>
    <source srcset="icon.svg" type="image/svg+xml">
    <img src="icon.png" alt="图标">
</picture>`,
                        notes: "作为图片使用时无法用外部CSS/JS控制"
                    },
                    {
                        title: "iframe/object/embed方式",
                        code: `<!-- object（推荐，有回退） -->
<object data="image.svg" 
        type="image/svg+xml"
        width="300"
        height="300">
    <img src="fallback.png" alt="回退图片">
</object>

<!-- iframe -->
<iframe src="image.svg" 
        width="300" 
        height="300"
        title="SVG图形">
</iframe>

<!-- embed -->
<embed src="image.svg" 
       type="image/svg+xml"
       width="300"
       height="300">`,
                        notes: "这些方式可以操作SVG，但比较复杂"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "SVG基本形状",
            content: {
                description: "SVG提供了多种基本形状元素。",
                examples: [
                    {
                        title: "矩形和圆形",
                        code: `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
    <!-- 矩形 -->
    <rect x="10" y="10" 
          width="100" height="80" 
          fill="lightblue" 
          stroke="navy" 
          stroke-width="2"/>
    
    <!-- 圆角矩形 -->
    <rect x="130" y="10" 
          width="100" height="80" 
          rx="10" ry="10"
          fill="lightgreen"/>
    
    <!-- 圆形 -->
    <circle cx="290" cy="50" r="40" 
            fill="coral" 
            stroke="red" 
            stroke-width="2"/>
    
    <!-- 椭圆 -->
    <ellipse cx="350" cy="50" 
             rx="40" ry="25" 
             fill="gold"/>
</svg>`,
                        notes: "rect、circle、ellipse是最基本的形状"
                    },
                    {
                        title: "线条和多边形",
                        code: `<svg width="400" height="200">
    <!-- 直线 -->
    <line x1="10" y1="10" 
          x2="100" y2="100" 
          stroke="black" 
          stroke-width="2"/>
    
    <!-- 折线 -->
    <polyline points="120,10 150,50 180,10 210,50" 
              fill="none" 
              stroke="blue" 
              stroke-width="2"/>
    
    <!-- 多边形（自动闭合） -->
    <polygon points="250,10 280,50 310,10 295,60 235,60" 
             fill="lightcoral" 
             stroke="darkred" 
             stroke-width="2"/>
</svg>`,
                        notes: "polyline和polygon通过points定义点坐标"
                    },
                    {
                        title: "路径（path）",
                        code: `<svg width="400" height="200">
    <!-- 简单路径 -->
    <path d="M 10 10 L 100 10 L 100 100 Z" 
          fill="lightblue" 
          stroke="blue" 
          stroke-width="2"/>
    
    <!-- 曲线路径 -->
    <path d="M 150 50 Q 175 10 200 50 T 250 50" 
          fill="none" 
          stroke="red" 
          stroke-width="2"/>
    
    <!-- 贝塞尔曲线 -->
    <path d="M 10 150 C 40 110 70 190 100 150" 
          fill="none" 
          stroke="green" 
          stroke-width="2"/>
    
    <!-- 圆弧 -->
    <path d="M 150 150 A 40 40 0 0 1 230 150" 
          fill="none" 
          stroke="purple" 
          stroke-width="2"/>
</svg>

<!-- path命令：
     M = moveto（移动到）
     L = lineto（画线到）
     H = horizontal lineto（水平线）
     V = vertical lineto（垂直线）
     C = curveto（三次贝塞尔曲线）
     S = smooth curveto（平滑三次贝塞尔曲线）
     Q = quadratic Bézier curve（二次贝塞尔曲线）
     T = smooth quadratic Bézier curveto
     A = elliptical Arc（椭圆弧）
     Z = closepath（闭合路径）
-->`,
                        notes: "path是最灵活强大的SVG元素"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "SVG样式和填充",
            content: {
                description: "SVG元素可以通过多种方式设置样式。",
                examples: [
                    {
                        title: "填充和描边",
                        code: `<svg width="400" height="200">
    <!-- 基本填充 -->
    <circle cx="50" cy="50" r="40" fill="red"/>
    
    <!-- 描边 -->
    <circle cx="150" cy="50" r="40" 
            fill="lightblue" 
            stroke="darkblue" 
            stroke-width="4"/>
    
    <!-- 虚线描边 -->
    <circle cx="250" cy="50" r="40" 
            fill="none" 
            stroke="green" 
            stroke-width="2"
            stroke-dasharray="5,5"/>
    
    <!-- 透明度 -->
    <circle cx="350" cy="50" r="40" 
            fill="purple" 
            fill-opacity="0.5"
            stroke="darkpurple" 
            stroke-opacity="0.8"/>
</svg>`,
                        notes: "fill控制填充，stroke控制描边"
                    },
                    {
                        title: "使用CSS样式",
                        code: `<style>
    .shape {
        fill: lightcoral;
        stroke: darkred;
        stroke-width: 2;
        transition: all 0.3s;
    }
    
    .shape:hover {
        fill: red;
        stroke-width: 4;
    }
</style>

<svg width="200" height="200">
    <rect class="shape" x="10" y="10" width="180" height="180"/>
    <circle class="shape" cx="100" cy="100" r="50"/>
</svg>`,
                        notes: "可以用CSS控制SVG样式"
                    },
                    {
                        title: "渐变填充",
                        code: `<svg width="400" height="200">
    <defs>
        <!-- 线性渐变 -->
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(255,255,0);"/>
            <stop offset="100%" style="stop-color:rgb(255,0,0);"/>
        </linearGradient>
        
        <!-- 径向渐变 -->
        <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:white;"/>
            <stop offset="100%" style="stop-color:blue;"/>
        </radialGradient>
    </defs>
    
    <!-- 使用渐变 -->
    <rect x="10" y="10" width="180" height="180" fill="url(#grad1)"/>
    <circle cx="290" cy="100" r="80" fill="url(#grad2)"/>
</svg>`,
                        notes: "在defs中定义渐变，然后引用"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "SVG文本和图标",
            content: {
                description: "SVG中的文本可以自由变换和样式化。",
                examples: [
                    {
                        title: "基本文本",
                        code: `<svg width="400" height="200">
    <!-- 基本文本 -->
    <text x="10" y="30" 
          font-family="Arial" 
          font-size="20"
          fill="black">
        Hello SVG
    </text>
    
    <!-- 样式文本 -->
    <text x="10" y="70" 
          font-size="24"
          font-weight="bold"
          fill="blue"
          text-decoration="underline">
        Styled Text
    </text>
    
    <!-- 居中对齐 -->
    <text x="200" y="110" 
          text-anchor="middle"
          font-size="20"
          fill="red">
        Centered
    </text>
    
    <!-- 旋转文本 -->
    <text x="100" y="150" 
          font-size="20"
          fill="green"
          transform="rotate(30 100 150)">
        Rotated
    </text>
</svg>`,
                        notes: "text-anchor控制对齐方式"
                    },
                    {
                        title: "简单图标示例",
                        code: `<!-- 对勾图标 -->
<svg width="50" height="50" viewBox="0 0 50 50">
    <circle cx="25" cy="25" r="24" 
            fill="green" 
            stroke="darkgreen" 
            stroke-width="2"/>
    <path d="M 15 25 L 22 32 L 35 18" 
          fill="none" 
          stroke="white" 
          stroke-width="3"
          stroke-linecap="round"/>
</svg>

<!-- 关闭图标 -->
<svg width="50" height="50" viewBox="0 0 50 50">
    <circle cx="25" cy="25" r="24" 
            fill="red" 
            stroke="darkred" 
            stroke-width="2"/>
    <line x1="15" y1="15" x2="35" y2="35" 
          stroke="white" 
          stroke-width="3"
          stroke-linecap="round"/>
    <line x1="35" y1="15" x2="15" y2="35" 
          stroke="white" 
          stroke-width="3"
          stroke-linecap="round"/>
</svg>

<!-- 菜单图标 -->
<svg width="50" height="50" viewBox="0 0 50 50">
    <line x1="10" y1="15" x2="40" y2="15" 
          stroke="black" 
          stroke-width="3"/>
    <line x1="10" y1="25" x2="40" y2="25" 
          stroke="black" 
          stroke-width="3"/>
    <line x1="10" y1="35" x2="40" y2="35" 
          stroke="black" 
          stroke-width="3"/>
</svg>`,
                        notes: "viewBox使SVG可缩放"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "SVG使用最佳实践",
            content: {
                description: "优化SVG使用可以提升性能和可维护性：",
                practices: [
                    {
                        title: "使用viewBox而非固定尺寸",
                        description: "viewBox使SVG真正可缩放。",
                        example: `<!-- ✅ 好：使用viewBox -->
<svg viewBox="0 0 100 100" width="200">
    <circle cx="50" cy="50" r="40"/>
</svg>

<!-- ❌ 不好：固定尺寸 -->
<svg width="100" height="100">
    <circle cx="50" cy="50" r="40"/>
</svg>`
                    },
                    {
                        title: "优化和压缩SVG",
                        description: "使用工具移除不必要的代码。",
                        example: `<!-- 工具推荐：
     - SVGO（命令行工具）
     - SVGOMG（在线工具）
     - 设计工具导出优化选项
-->

<!-- 优化前 -->
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     version="1.1" id="Layer_1" x="0px" y="0px"
     width="100px" height="100px"
     viewBox="0 0 100 100">
    <!-- ... -->
</svg>

<!-- 优化后 -->
<svg viewBox="0 0 100 100">
    <!-- ... -->
</svg>`
                    },
                    {
                        title: "使用symbols复用元素",
                        description: "定义可复用的SVG符号。",
                        example: `<svg style="display: none;">
    <symbol id="icon-star" viewBox="0 0 24 24">
        <path d="M12 2L15 9L22 9L17 14L19 21L12 17L5 21L7 14L2 9L9 9Z"/>
    </symbol>
</svg>

<!-- 使用symbol -->
<svg width="30" height="30">
    <use href="#icon-star" fill="gold"/>
</svg>
<svg width="50" height="50">
    <use href="#icon-star" fill="silver"/>
</svg>`
                    },
                    {
                        title: "为SVG添加可访问性",
                        description: "确保SVG对所有用户可访问。",
                        example: `<svg role="img" aria-labelledby="starTitle starDesc">
    <title id="starTitle">五角星</title>
    <desc id="starDesc">一个金色的五角星图标</desc>
    <path d="..."/>
</svg>

<!-- 装饰性SVG -->
<svg aria-hidden="true">
    <path d="..."/>
</svg>`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "SVG检查清单",
            content: {
                description: "确保SVG的正确使用和优化：",
                items: [
                    { id: "check10-1", text: "使用了viewBox属性" },
                    { id: "check10-2", text: "移除了不必要的元数据" },
                    { id: "check10-3", text: "为有意义的SVG添加了title和desc" },
                    { id: "check10-4", text: "装饰性SVG使用了aria-hidden" },
                    { id: "check10-5", text: "SVG文件已经过优化压缩" },
                    { id: "check10-6", text: "使用symbol复用重复元素" },
                    { id: "check10-7", text: "文本使用text元素而非路径" },
                    { id: "check10-8", text: "测试了不同尺寸下的显示效果" },
                    { id: "check10-9", text: "考虑了浏览器兼容性" },
                    { id: "check10-10", text: "为图标提供了PNG回退（如需要）" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "iframe与嵌入内容", url: "content.html?chapter=09" },
        next: { title: "Canvas基础", url: "content.html?chapter=11" }
    }
};
