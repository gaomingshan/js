// 第43章：图形函数
window.cssContentData_Section43 = {
    section: {
        id: 43,
        title: "图形函数",
        icon: "✂️",
        topics: [
            {
                id: "shape-functions-intro",
                title: "CSS图形函数概述",
                type: "concept",
                content: {
                    description: "CSS图形函数允许你创建复杂的形状和路径，用于裁剪元素或定义文本环绕路径。",
                    keyPoints: [
                        "clip-path：裁剪元素显示区域",
                        "shape-outside：定义文本环绕形状",
                        "支持基本形状函数（circle、ellipse、polygon等）",
                        "支持SVG路径",
                        "可以创建复杂的非矩形布局",
                        "所有现代浏览器都支持"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Shapes"
                }
            },
            {
                id: "clip-path-basics",
                title: "clip-path 裁剪路径",
                type: "code-example",
                content: {
                    description: "clip-path定义元素的可见区域，区域外的部分会被裁剪掉。",
                    examples: [
                        {
                            title: "1. 基本形状 - 圆形",
                            code: '/* 圆形裁剪 */\n.circle {\n  /* 半径50%，圆心在中心 */\n  clip-path: circle(50%);\n}\n\n/* 指定圆心位置 */\n.circle-offset {\n  /* 半径40%，圆心在30% 40%位置 */\n  clip-path: circle(40% at 30% 40%);\n}\n\n/* 使用像素值 */\n.circle-px {\n  clip-path: circle(100px at center);\n}',
                            result: "创建圆形图片"
                        },
                        {
                            title: "2. 基本形状 - 椭圆",
                            code: '/* 椭圆裁剪 */\n.ellipse {\n  /* 水平半径50%，垂直半径30% */\n  clip-path: ellipse(50% 30%);\n}\n\n/* 指定椭圆中心 */\n.ellipse-offset {\n  clip-path: ellipse(40% 30% at 50% 50%);\n}\n\n/* 创建横向椭圆 */\n.ellipse-wide {\n  clip-path: ellipse(60% 40% at center);\n}',
                            result: "创建椭圆形状"
                        },
                        {
                            title: "3. inset矩形裁剪",
                            code: '/* inset(top right bottom left) */\n.inset {\n  /* 四边各内缩20px */\n  clip-path: inset(20px);\n}\n\n/* 不同的内缩值 */\n.inset-custom {\n  clip-path: inset(10px 20px 30px 40px);\n}\n\n/* 带圆角的inset */\n.inset-rounded {\n  clip-path: inset(10px round 10px);\n}',
                            result: "矩形区域裁剪"
                        },
                        {
                            title: "4. polygon多边形",
                            code: '/* 三角形 */\n.triangle {\n  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);\n}\n\n/* 五边形 */\n.pentagon {\n  clip-path: polygon(\n    50% 0%,\n    100% 38%,\n    82% 100%,\n    18% 100%,\n    0% 38%\n  );\n}\n\n/* 箭头形状 */\n.arrow {\n  clip-path: polygon(\n    0% 20%,\n    60% 20%,\n    60% 0%,\n    100% 50%,\n    60% 100%,\n    60% 80%,\n    0% 80%\n  );\n}\n\n/* 对话气泡 */\n.speech-bubble {\n  clip-path: polygon(\n    0% 0%,\n    100% 0%,\n    100% 75%,\n    75% 75%,\n    75% 100%,\n    50% 75%,\n    0% 75%\n  );\n}',
                            result: "创建各种多边形形状"
                        }
                    ]
                }
            },
            {
                id: "clip-path-advanced",
                title: "clip-path 高级用法",
                type: "code-example",
                content: {
                    description: "clip-path的高级应用和动画效果。",
                    examples: [
                        {
                            title: "1. SVG路径裁剪",
                            code: '/* 使用SVG path */\n.svg-clip {\n  clip-path: path(\'M 0,0 L 100,0 L 50,100 Z\');\n}\n\n/* 复杂的心形 */\n.heart {\n  clip-path: path(\n    \'M140,20 C73,20 20,74 20,140 \' +\n    \'C20,275 156,310 200,330 \' +\n    \'C244,310 380,275 380,140 \' +\n    \'C380,74 327,20 260,20 \' +\n    \'C234,20 211,30 200,48 \' +\n    \'C189,30 166,20 140,20 Z\'\n  );\n}',
                            result: "使用SVG路径创建复杂形状"
                        },
                        {
                            title: "2. 裁剪动画",
                            code: '/* 展开动画 */\n@keyframes reveal {\n  from {\n    clip-path: circle(0% at 50% 50%);\n  }\n  to {\n    clip-path: circle(100% at 50% 50%);\n  }\n}\n\n.reveal-animation {\n  animation: reveal 1s ease-out;\n}\n\n/* 侧滑展开 */\n@keyframes slide-reveal {\n  from {\n    clip-path: inset(0 100% 0 0);\n  }\n  to {\n    clip-path: inset(0 0 0 0);\n  }\n}\n\n/* 悬停效果 */\n.card {\n  clip-path: polygon(\n    0 0, 100% 0, 100% 90%, 0 100%\n  );\n  transition: clip-path 0.3s;\n}\n\n.card:hover {\n  clip-path: polygon(\n    0 0, 100% 0, 100% 100%, 0 100%\n  );\n}',
                            result: "动态裁剪效果"
                        },
                        {
                            title: "3. 响应式裁剪",
                            code: '/* 移动端使用圆形 */\n.profile-image {\n  clip-path: circle(50%);\n}\n\n/* 桌面端使用圆角矩形 */\n@media (min-width: 768px) {\n  .profile-image {\n    clip-path: inset(0 round 10px);\n  }\n}\n\n/* 使用CSS变量控制 */\n:root {\n  --clip-shape: circle(50%);\n}\n\n@media (min-width: 768px) {\n  :root {\n    --clip-shape: polygon(\n      0 0, 100% 0, 100% 90%, 0 100%\n    );\n  }\n}\n\n.clipped {\n  clip-path: var(--clip-shape);\n}',
                            result: "根据屏幕大小调整形状"
                        }
                    ]
                }
            },
            {
                id: "shape-outside",
                title: "shape-outside 文本环绕",
                type: "code-example",
                content: {
                    description: "shape-outside定义浮动元素的形状，让文本沿着该形状环绕。",
                    examples: [
                        {
                            title: "1. 基本文本环绕",
                            code: '/* 圆形文本环绕 */\n.float-image {\n  float: left;\n  width: 200px;\n  height: 200px;\n  shape-outside: circle(50%);\n  clip-path: circle(50%);\n  margin-right: 20px;\n}\n\n/* 椭圆文本环绕 */\n.float-ellipse {\n  float: right;\n  width: 300px;\n  height: 200px;\n  shape-outside: ellipse(50% 40%);\n  clip-path: ellipse(50% 40%);\n  margin-left: 20px;\n}',
                            result: "文本沿形状流动"
                        },
                        {
                            title: "2. polygon文本环绕",
                            code: '/* 三角形环绕 */\n.triangle-float {\n  float: left;\n  width: 200px;\n  height: 200px;\n  shape-outside: polygon(50% 0%, 0% 100%, 100% 100%);\n  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);\n  margin-right: 20px;\n}\n\n/* 不规则多边形 */\n.irregular-shape {\n  float: right;\n  shape-outside: polygon(\n    0% 0%, 100% 0%, 100% 75%,\n    75% 75%, 75% 100%, 50% 75%,\n    0% 75%\n  );\n  clip-path: polygon(\n    0% 0%, 100% 0%, 100% 75%,\n    75% 75%, 75% 100%, 50% 75%,\n    0% 75%\n  );\n}',
                            result: "复杂形状的文本环绕"
                        },
                        {
                            title: "3. 使用图片的alpha通道",
                            code: '/* 使用PNG图片的透明度定义形状 */\n.shape-from-image {\n  float: left;\n  width: 300px;\n  height: 300px;\n  shape-outside: url(\'shape.png\');\n  shape-image-threshold: 0.5; /* alpha阈值 */\n  shape-margin: 20px; /* 形状外边距 */\n}\n\n/* HTML */\n<img src="shape.png" class="shape-from-image" />\n<p>文本会沿着图片的不透明区域环绕...</p>',
                            result: "基于图片形状的文本流动"
                        },
                        {
                            title: "4. shape-margin 形状边距",
                            code: '.shaped-float {\n  float: left;\n  width: 200px;\n  height: 200px;\n  \n  /* 定义形状 */\n  shape-outside: circle(50%);\n  clip-path: circle(50%);\n  \n  /* 形状外的额外间距 */\n  shape-margin: 20px;\n  \n  /* 这会在圆形外增加20px的环绕间距 */\n}',
                            result: "控制文本与形状的距离"
                        }
                    ]
                }
            },
            {
                id: "shape-practical-examples",
                title: "实际应用示例",
                type: "code-example",
                content: {
                    description: "图形函数在实际项目中的创意应用。",
                    examples: [
                        {
                            title: "1. 杂志风格布局",
                            code: '/* 文章中的图片 */\n.article-image {\n  float: left;\n  width: 300px;\n  margin-right: 30px;\n  margin-bottom: 20px;\n  shape-outside: polygon(\n    0 0, 100% 0,\n    100% 80%, 80% 100%,\n    0 100%\n  );\n  clip-path: polygon(\n    0 0, 100% 0,\n    100% 80%, 80% 100%,\n    0 100%\n  );\n}\n\n.article-content {\n  font-size: 18px;\n  line-height: 1.6;\n}\n\n/* HTML */\n<article>\n  <img src="photo.jpg" class="article-image" />\n  <div class="article-content">\n    <p>文章内容...</p>\n  </div>\n</article>',
                            result: "创造独特的编辑设计"
                        },
                        {
                            title: "2. 产品展示卡片",
                            code: '.product-card {\n  position: relative;\n  overflow: hidden;\n}\n\n.product-image {\n  width: 100%;\n  transition: clip-path 0.5s;\n  clip-path: polygon(\n    0 0, 100% 0, 100% 85%, 0 100%\n  );\n}\n\n.product-card:hover .product-image {\n  clip-path: polygon(\n    0 0, 100% 0, 100% 100%, 0 100%\n  );\n}\n\n.product-info {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding: 20px;\n  background: linear-gradient(\n    to top,\n    rgba(0,0,0,0.8),\n    transparent\n  );\n  color: white;\n}',
                            result: "交互式产品展示"
                        },
                        {
                            title: "3. 创意头像展示",
                            code: '/* 六边形头像 */\n.hexagon-avatar {\n  width: 200px;\n  height: 200px;\n  clip-path: polygon(\n    30% 0%, 70% 0%,\n    100% 30%, 100% 70%,\n    70% 100%, 30% 100%,\n    0% 70%, 0% 30%\n  );\n  transition: clip-path 0.3s;\n}\n\n.hexagon-avatar:hover {\n  clip-path: circle(50%);\n}\n\n/* 钻石形头像 */\n.diamond-avatar {\n  width: 200px;\n  height: 200px;\n  clip-path: polygon(\n    50% 0%,\n    100% 50%,\n    50% 100%,\n    0% 50%\n  );\n}',
                            result: "独特的头像样式"
                        },
                        {
                            title: "4. 页面转场效果",
                            code: '/* 圆形展开转场 */\n@keyframes circle-reveal {\n  from {\n    clip-path: circle(0% at 50% 50%);\n  }\n  to {\n    clip-path: circle(150% at 50% 50%);\n  }\n}\n\n.page-transition {\n  animation: circle-reveal 0.8s ease-out;\n}\n\n/* 从点击位置展开 */\n.page-transition-from-click {\n  /* JavaScript动态设置clip-path */\n  animation: circle-reveal 0.8s ease-out;\n}\n\n/* JS代码 */\n/*\nelement.addEventListener(\'click\', (e) => {\n  const x = (e.clientX / window.innerWidth) * 100;\n  const y = (e.clientY / window.innerHeight) * 100;\n  element.style.clipPath = `circle(0% at ${x}% ${y}%)`;\n  // 触发动画...\n});\n*/',
                            result: "动态页面过渡"
                        }
                    ]
                }
            },
            {
                id: "browser-compatibility",
                title: "浏览器兼容性处理",
                type: "code-example",
                content: {
                    description: "处理图形函数的浏览器兼容性问题。",
                    examples: [
                        {
                            title: "1. 特性检测和回退",
                            code: '/* 提供回退样式 */\n.element {\n  /* 不支持clip-path的浏览器 */\n  border-radius: 50%;\n  overflow: hidden;\n}\n\n/* 支持clip-path的浏览器 */\n@supports (clip-path: circle(50%)) {\n  .element {\n    border-radius: 0;\n    overflow: visible;\n    clip-path: circle(50%);\n  }\n}',
                            result: "优雅降级"
                        },
                        {
                            title: "2. JavaScript检测",
                            code: '// 检测是否支持clip-path\nfunction supportsClipPath() {\n  return CSS.supports(\'clip-path\', \'circle(50%)\');\n}\n\nif (supportsClipPath()) {\n  // 使用clip-path\n  element.style.clipPath = \'circle(50%)\';\n} else {\n  // 使用传统方法\n  element.style.borderRadius = \'50%\';\n  element.style.overflow = \'hidden\';\n}',
                            result: "根据支持情况选择方案"
                        }
                    ]
                }
            },
            {
                id: "best-practices",
                title: "图形函数最佳实践",
                type: "principle",
                content: {
                    description: "使用图形函数的最佳实践和注意事项。",
                    mechanism: "图形函数功能强大，但需要合理使用。clip-path会影响元素的点击区域，裁剪后的区域无法接收事件。shape-outside只对浮动元素有效。复杂的路径可能影响性能。需要考虑无障碍访问。",
                    keyPoints: [
                        "clip-path会改变元素的可点击区域",
                        "shape-outside必须配合float使用",
                        "clip-path和shape-outside通常一起使用",
                        "使用shape-margin控制文本与形状的距离",
                        "复杂路径可能影响性能，移动端需谨慎",
                        "提供回退方案确保兼容性",
                        "使用CSS变量便于动态控制形状",
                        "考虑无障碍：确保内容可访问",
                        "测试不同屏幕尺寸下的效果",
                        "使用在线工具（Clippy等）辅助生成复杂形状"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "计算函数", url: "42-calc-functions.html" },
        next: { title: "CSS方法论", url: "44-css-methodology.html" }
    }
};
