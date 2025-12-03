// 第39章：混合模式
window.cssContentData_Section39 = {
    section: {
        id: 39,
        title: "混合模式",
        icon: "🎨",
        topics: [
            {
                id: "blend-mode-intro",
                title: "CSS混合模式概述",
                type: "concept",
                content: {
                    description: "CSS混合模式控制元素的颜色如何与背景混合，类似Photoshop的图层混合模式。",
                    keyPoints: [
                        "mix-blend-mode：控制元素与背景的混合",
                        "background-blend-mode：控制背景层之间的混合",
                        "提供16种混合模式",
                        "isolation属性可以创建混合隔离",
                        "可以创建双色调图像等创意效果",
                        "所有现代浏览器都支持"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/mix-blend-mode"
                }
            },
            {
                id: "mix-blend-mode",
                title: "mix-blend-mode 元素混合",
                type: "code-example",
                content: {
                    description: "mix-blend-mode定义元素的内容如何与其背后的内容混合。",
                    examples: [
                        {
                            title: "1. 基本混合模式",
                            code: '/* normal：默认，不混合 */\n.element { mix-blend-mode: normal; }\n\n/* multiply：正片叠底，变暗效果 */\n.element { mix-blend-mode: multiply; }\n\n/* screen：滤色，变亮效果 */\n.element { mix-blend-mode: screen; }\n\n/* overlay：叠加 */\n.element { mix-blend-mode: overlay; }',
                            result: "不同模式产生不同视觉效果"
                        },
                        {
                            title: "2. 文字混合效果",
                            code: '/* 文字镂空效果 */\n.text-cutout {\n  background: url(\'image.jpg\');\n  background-size: cover;\n  color: white;\n}\n\n.text-cutout h1 {\n  mix-blend-mode: multiply;\n  /* 文字显示背景图案 */\n}\n\n/* 发光文字 */\n.glow-text {\n  color: white;\n  mix-blend-mode: difference;\n}',
                            result: "创造独特的文字效果"
                        },
                        {
                            title: "3. 图片双色调效果",
                            code: '.duotone-image {\n  position: relative;\n}\n\n.duotone-image img {\n  display: block;\n  filter: grayscale(100%);\n}\n\n.duotone-image::before {\n  content: \'\';\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: linear-gradient(45deg, blue, red);\n  mix-blend-mode: multiply;\n}',
                            result: "将图片转为双色调"
                        }
                    ]
                }
            },
            {
                id: "blend-modes-list",
                title: "16种混合模式详解",
                type: "principle",
                content: {
                    description: "CSS提供16种混合模式，每种都有独特的视觉效果。",
                    mechanism: "混合模式基于不同的数学公式混合颜色。multiply（正片叠底）将两个颜色相乘后除以255；screen（滤色）反转颜色后相乘再反转；overlay（叠加）根据背景亮度选择multiply或screen；difference（差值）计算颜色差值；等等。",
                    keyPoints: [
                        "normal：正常，无混合",
                        "multiply：正片叠底，变暗",
                        "screen：滤色，变亮",
                        "overlay：叠加，增强对比",
                        "darken：变暗，选择较暗颜色",
                        "lighten：变亮，选择较亮颜色",
                        "color-dodge：颜色减淡",
                        "color-burn：颜色加深",
                        "hard-light：强光",
                        "soft-light：柔光",
                        "difference：差值",
                        "exclusion：排除",
                        "hue：色相",
                        "saturation：饱和度",
                        "color：颜色",
                        "luminosity：明度"
                    ]
                }
            },
            {
                id: "background-blend-mode",
                title: "background-blend-mode 背景混合",
                type: "code-example",
                content: {
                    description: "background-blend-mode控制背景层（背景图和背景色）之间的混合。",
                    examples: [
                        {
                            title: "1. 图片与颜色混合",
                            code: '/* 为图片添加色调 */\n.tinted-image {\n  background: \n    url(\'photo.jpg\'),\n    linear-gradient(to right, #667eea, #764ba2);\n  background-size: cover;\n  background-blend-mode: multiply;\n}\n\n/* 双色调效果 */\n.duotone {\n  background:\n    url(\'photo.jpg\'),\n    linear-gradient(to bottom, blue, red);\n  background-size: cover;\n  background-blend-mode: screen;\n}',
                            result: "创造丰富的图片效果"
                        },
                        {
                            title: "2. 多层背景混合",
                            code: '.complex-bg {\n  background:\n    url(\'texture.png\'),\n    url(\'photo.jpg\'),\n    linear-gradient(45deg, #f093fb, #f5576c);\n  background-blend-mode: overlay, multiply;\n  /* 第一个模式应用于前两层 */\n  /* 第二个模式应用于第二层和第三层 */\n}',
                            result: "创建多层混合效果"
                        },
                        {
                            title: "3. 动态混合效果",
                            code: '.hover-effect {\n  background:\n    url(\'image.jpg\'),\n    #667eea;\n  background-size: cover;\n  background-blend-mode: normal;\n  transition: background-blend-mode 0.3s;\n}\n\n.hover-effect:hover {\n  background-blend-mode: multiply;\n}',
                            result: "悬停时改变混合模式"
                        }
                    ]
                }
            },
            {
                id: "isolation",
                title: "isolation 混合隔离",
                type: "code-example",
                content: {
                    description: "isolation属性决定元素是否创建新的堆叠上下文，隔离混合模式的影响。",
                    examples: [
                        {
                            title: "1. isolation基本用法",
                            code: '/* auto：默认，不创建隔离 */\n.container {\n  isolation: auto;\n}\n\n/* isolate：创建新的堆叠上下文 */\n.container {\n  isolation: isolate;\n}\n\n/* 子元素的mix-blend-mode只在容器内混合 */\n.container {\n  isolation: isolate;\n  background: white;\n}\n\n.child {\n  mix-blend-mode: multiply;\n  /* 只与容器内的元素混合，不与容器外混合 */\n}',
                            result: "控制混合的影响范围"
                        },
                        {
                            title: "2. 隔离组件混合",
                            code: '/* 防止组件内的混合影响外部 */\n.card {\n  isolation: isolate;\n  background: white;\n  padding: 20px;\n}\n\n.card__overlay {\n  mix-blend-mode: overlay;\n  /* 只与卡片内容混合 */\n}\n\n/* 不使用isolation，overlay会与页面背景混合 */',
                            result: "组件封装混合效果"
                        }
                    ]
                }
            },
            {
                id: "blend-mode-use-cases",
                title: "混合模式实际应用",
                type: "code-example",
                content: {
                    description: "混合模式在实际项目中的创意应用。",
                    examples: [
                        {
                            title: "1. 图片滤镜效果",
                            code: '/* 复古滤镜 */\n.vintage-filter {\n  position: relative;\n}\n\n.vintage-filter::before {\n  content: \'\';\n  position: absolute;\n  inset: 0;\n  background: radial-gradient(\n    circle at center,\n    transparent 50%,\n    rgba(0,0,0,0.3)\n  );\n  mix-blend-mode: multiply;\n}\n\n.vintage-filter::after {\n  content: \'\';\n  position: absolute;\n  inset: 0;\n  background: linear-gradient(\n    to bottom,\n    rgba(255,200,0,0.2),\n    rgba(255,150,0,0.1)\n  );\n  mix-blend-mode: overlay;\n}',
                            result: "创建Instagram风格滤镜"
                        },
                        {
                            title: "2. 文字效果",
                            code: '/* 彩虹渐变文字 */\n.rainbow-text {\n  background: linear-gradient(\n    to right,\n    red, orange, yellow, green, blue, purple\n  );\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n}\n\n/* 配合混合模式的文字 */\n.blend-text {\n  background: url(\'texture.jpg\');\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: white;\n  mix-blend-mode: multiply;\n}',
                            result: "创意文字效果"
                        },
                        {
                            title: "3. Logo颜色适配",
                            code: '/* Logo根据背景自动变色 */\n.logo {\n  mix-blend-mode: difference;\n  /* 在深色背景上显示浅色，浅色背景上显示深色 */\n}\n\n/* 或使用multiply */\n.logo-dark {\n  filter: invert(1);\n  mix-blend-mode: multiply;\n}',
                            result: "自适应背景的Logo"
                        },
                        {
                            title: "4. 加载动画效果",
                            code: '.loading {\n  width: 100px;\n  height: 100px;\n  background: linear-gradient(\n    45deg,\n    transparent 30%,\n    white 50%,\n    transparent 70%\n  );\n  mix-blend-mode: screen;\n  animation: loading 2s infinite;\n}\n\n@keyframes loading {\n  to {\n    transform: translateX(200%);\n  }\n}',
                            result: "炫酷的loading效果"
                        }
                    ]
                }
            },
            {
                id: "blend-mode-best-practices",
                title: "混合模式最佳实践",
                type: "principle",
                content: {
                    description: "掌握混合模式的最佳实践，创造优秀的视觉效果。",
                    mechanism: "混合模式虽然强大，但也需要谨慎使用。过度使用可能导致视觉混乱，影响可读性。性能方面，混合模式会创建新的堆叠上下文，在某些情况下可能影响性能。需要在视觉效果和性能之间找到平衡。",
                    keyPoints: [
                        "混合模式会创建新的堆叠上下文",
                        "注意文字可读性，避免过度使用",
                        "在深色和浅色背景上都要测试效果",
                        "使用isolation控制混合范围",
                        "提供无混合模式的回退方案",
                        "移动端性能影响较大，需谨慎使用",
                        "可以与filter、transform结合创造丰富效果",
                        "考虑无障碍访问，确保对比度足够",
                        "使用CSS变量便于统一管理混合效果"
                    ]
                }
            },
            {
                id: "blend-mode-compatibility",
                title: "浏览器兼容性与回退",
                type: "code-example",
                content: {
                    description: "处理混合模式的浏览器兼容性问题。",
                    examples: [
                        {
                            title: "1. 渐进增强",
                            code: '/* 基础样式（所有浏览器）*/\n.card {\n  background: rgba(255, 255, 255, 0.9);\n  color: #333;\n}\n\n/* 支持混合模式时增强 */\n@supports (mix-blend-mode: multiply) {\n  .card {\n    background: white;\n    mix-blend-mode: multiply;\n  }\n}',
                            result: "优雅降级"
                        },
                        {
                            title: "2. 特性检测",
                            code: '// JavaScript检测\nif (CSS.supports(\'mix-blend-mode\', \'multiply\')) {\n  element.classList.add(\'blend-supported\');\n}\n\n// CSS\n.image-effect {\n  /* 回退样式 */\n  filter: grayscale(100%);\n}\n\n.blend-supported .image-effect {\n  filter: none;\n  mix-blend-mode: luminosity;\n}',
                            result: "根据支持情况应用不同样式"
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "Filter滤镜", url: "38-filter.html" },
        next: { title: "自定义属性", url: "40-custom-properties.html" }
    }
};
