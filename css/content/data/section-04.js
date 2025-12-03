// 第4章：基础样式属性
window.cssContentData_Section04 = {
    section: {
        id: 4,
        title: "基础样式属性",
        icon: "✏️",
        topics: [
            {
                id: "text-fonts",
                title: "文本与字体属性",
                type: "concept",
                content: {
                    description: "CSS提供了丰富的文本和字体控制属性，用于精确控制文字的显示效果。",
                    keyPoints: [
                        "font-family：字体族，优先级从左到右",
                        "font-size：字体大小，支持多种单位",
                        "font-weight：字体粗细（100-900或关键字）",
                        "font-style：字体风格（normal、italic、oblique）",
                        "line-height：行高，影响行间距"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/font"
                }
            },
            {
                id: "text-properties",
                title: "文本属性详解",
                type: "code-example",
                content: {
                    description: "控制文本布局和显示的核心属性。",
                    examples: [
                        {
                            title: "文本对齐",
                            code: '.text {\n  text-align: left | center | right | justify;\n  text-align-last: center; /* 最后一行对齐方式 */\n}',
                            result: "控制文本水平对齐"
                        },
                        {
                            title: "文本装饰",
                            code: '.link {\n  text-decoration: underline;\n  text-decoration-color: red;\n  text-decoration-style: wavy;\n  text-decoration-thickness: 2px;\n}',
                            result: "下划线、删除线等装饰"
                        },
                        {
                            title: "文本溢出",
                            code: '.ellipsis {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}',
                            result: "单行文本省略号"
                        }
                    ]
                }
            },
            {
                id: "color-values",
                title: "颜色表示法",
                type: "comparison",
                content: {
                    description: "CSS支持多种颜色表示方法，各有优劣。",
                    items: [
                        {
                            name: "关键字",
                            code: 'color: red;\ncolor: transparent;',
                            pros: ["简单易记", "语义清晰"],
                            cons: ["颜色有限", "不精确"]
                        },
                        {
                            name: "十六进制",
                            code: 'color: #ff0000;\ncolor: #f00; /* 简写 */',
                            pros: ["常用", "紧凑"],
                            cons: ["不直观", "难调整"]
                        },
                        {
                            name: "RGB/RGBA",
                            code: 'color: rgb(255, 0, 0);\ncolor: rgba(255, 0, 0, 0.5);',
                            pros: ["精确控制", "支持透明度"],
                            cons: ["书写较长"]
                        },
                        {
                            name: "HSL/HSLA",
                            code: 'color: hsl(0, 100%, 50%);\ncolor: hsla(0, 100%, 50%, 0.5);',
                            pros: ["直观", "易调整", "更符合人类认知"],
                            cons: ["兼容性需注意"]
                        }
                    ]
                }
            },
            {
                id: "background-basic",
                title: "背景属性基础",
                type: "interactive-demo",
                content: {
                    description: "background属性用于设置元素的背景效果。",
                    demo: {
                        html: '<div class="box">背景示例</div>',
                        css: '.box {\n  /* 背景颜色 */\n  background-color: #f0f0f0;\n  \n  /* 背景图片 */\n  background-image: url("image.jpg");\n  \n  /* 背景重复 */\n  background-repeat: no-repeat;\n  \n  /* 背景位置 */\n  background-position: center center;\n  \n  /* 背景大小 */\n  background-size: cover;\n  \n  /* 背景固定 */\n  background-attachment: fixed;\n  \n  /* 简写 */\n  background: #f0f0f0 url("image.jpg") no-repeat center / cover;\n}',
                        editable: true
                    }
                }
            },
            {
                id: "gradients",
                title: "CSS渐变",
                type: "code-example",
                content: {
                    description: "CSS渐变是background-image的一种，可以创建平滑的颜色过渡。",
                    examples: [
                        {
                            title: "线性渐变",
                            code: '/* 从上到下 */\nbackground: linear-gradient(to bottom, red, blue);\n\n/* 对角线 */\nbackground: linear-gradient(45deg, red, blue);\n\n/* 多色渐变 */\nbackground: linear-gradient(to right, \n  red 0%, orange 25%, yellow 50%, green 75%, blue 100%);',
                            result: "沿直线方向的颜色过渡"
                        },
                        {
                            title: "径向渐变",
                            code: '/* 圆形渐变 */\nbackground: radial-gradient(circle, red, blue);\n\n/* 椭圆渐变 */\nbackground: radial-gradient(ellipse at center, red, blue);\n\n/* 指定位置和大小 */\nbackground: radial-gradient(circle at 30% 40%, red 0%, blue 100%);',
                            result: "从中心点向外的颜色过渡"
                        },
                        {
                            title: "重复渐变",
                            code: '/* 重复线性渐变 */\nbackground: repeating-linear-gradient(\n  45deg, red, red 10px, blue 10px, blue 20px\n);\n\n/* 重复径向渐变 */\nbackground: repeating-radial-gradient(\n  circle, red, red 10px, blue 10px, blue 20px\n);',
                            result: "创建条纹等重复图案"
                        }
                    ]
                }
            },
            {
                id: "opacity-transparency",
                title: "透明度与opacity",
                type: "principle",
                content: {
                    description: "CSS提供多种方式控制元素的透明度。",
                    mechanism: "opacity影响整个元素及其子元素，而rgba/hsla只影响指定的颜色属性。",
                    steps: [
                        "opacity：0（完全透明）到1（完全不透明）",
                        "继承性：子元素会继承父元素的opacity",
                        "性能：opacity变化不触发重绘（只触发合成）",
                        "rgba/hsla：只影响当前属性，不影响子元素",
                        "transparent关键字：完全透明的黑色"
                    ],
                    code: '/* opacity - 影响整个元素 */\n.element {\n  opacity: 0.5; /* 元素和子元素都半透明 */\n}\n\n/* rgba - 只影响背景 */\n.element {\n  background-color: rgba(255, 0, 0, 0.5); /* 只有背景半透明 */\n  color: #000; /* 文字不透明 */\n}'
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第3章：盒模型基础", url: "03-box-model.html" },
        next: { title: "第5章：CSS解析机制", url: "05-css-parsing.html" }
    }
};
