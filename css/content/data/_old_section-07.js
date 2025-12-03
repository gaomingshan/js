// 第7章：CSS动画与过渡
window.cssContentData_Section07 = {
    section: {
        id: 7,
        title: "CSS动画与过渡",
        icon: "✨",
        topics: [
            {
                id: "transition-intro",
                title: "CSS过渡（Transition）",
                type: "concept",
                content: {
                    description: "CSS过渡允许CSS属性值在指定的时间内平滑地从一个值变化到另一个值，创建简单的动画效果。",
                    keyPoints: [
                        "transition-property：指定要过渡的CSS属性",
                        "transition-duration：过渡持续时间",
                        "transition-timing-function：速度曲线函数",
                        "transition-delay：延迟开始时间",
                        "可以简写为：transition: property duration timing-function delay"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/transition"
                }
            },
            {
                id: "transition-demo",
                title: "过渡实战示例",
                type: "interactive-demo",
                content: {
                    description: "通过实例感受过渡效果的魅力。",
                    demo: {
                        html: '<button class="btn">悬停查看效果</button>\n<div class="box">移动的盒子</div>\n<div class="card">卡片效果</div>',
                        css: '.btn {\n  padding: 15px 30px;\n  background: #3b82f6;\n  color: white;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  /* 过渡效果 */\n  transition: all 0.3s ease;\n}\n\n.btn:hover {\n  background: #2563eb;\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0,0,0,0.15);\n}\n\n.box {\n  width: 100px;\n  height: 100px;\n  background: lightblue;\n  margin: 20px 0;\n  transition: transform 0.5s ease-in-out;\n}\n\n.box:hover {\n  transform: translateX(100px) rotate(45deg);\n}\n\n.card {\n  padding: 20px;\n  background: white;\n  border: 2px solid #e5e7eb;\n  border-radius: 12px;\n  margin-top: 20px;\n  transition: border-color 0.3s, box-shadow 0.3s;\n}\n\n.card:hover {\n  border-color: #3b82f6;\n  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);\n}',
                        editable: true
                    }
                }
            },
            {
                id: "timing-functions",
                title: "缓动函数（Timing Functions）",
                type: "comparison",
                content: {
                    description: "缓动函数决定了过渡动画的速度曲线。",
                    items: [
                        {
                            name: "ease（默认）",
                            code: 'transition: all 0.5s ease;',
                            pros: ["慢速开始，加速，然后慢速结束", "最自然的效果"],
                            cons: []
                        },
                        {
                            name: "linear",
                            code: 'transition: all 0.5s linear;',
                            pros: ["匀速运动", "适合旋转、滚动"],
                            cons: ["机械感强，不够自然"]
                        },
                        {
                            name: "ease-in",
                            code: 'transition: all 0.5s ease-in;',
                            pros: ["慢速开始，然后加速", "适合淡出效果"],
                            cons: []
                        },
                        {
                            name: "ease-out",
                            code: 'transition: all 0.5s ease-out;',
                            pros: ["快速开始，然后减速", "适合淡入效果"],
                            cons: []
                        },
                        {
                            name: "cubic-bezier()",
                            code: 'transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);',
                            pros: ["自定义曲线", "可实现弹簧、回弹等效果"],
                            cons: ["需要理解贝塞尔曲线"]
                        }
                    ]
                }
            },
            {
                id: "animation-intro",
                title: "CSS动画（Animation）",
                type: "concept",
                content: {
                    description: "CSS动画比过渡更强大，可以创建复杂的多帧动画，无需JavaScript即可实现丰富的动画效果。",
                    keyPoints: [
                        "使用@keyframes定义动画序列",
                        "animation-name：指定动画名称",
                        "animation-duration：动画持续时间",
                        "animation-iteration-count：播放次数（infinite为无限循环）",
                        "animation-direction：播放方向（normal、reverse、alternate）",
                        "可以在多个时间点定义不同的样式"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation"
                }
            },
            {
                id: "keyframes",
                title: "@keyframes关键帧",
                type: "code-example",
                content: {
                    description: "使用@keyframes定义动画的每个阶段。",
                    examples: [
                        {
                            title: "基础语法（from-to）",
                            code: '@keyframes fade {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n.element {\n  animation: fade 1s ease-in;\n}',
                            result: "淡入效果"
                        },
                        {
                            title: "百分比语法",
                            code: '@keyframes slide {\n  0% {\n    transform: translateX(0);\n  }\n  50% {\n    transform: translateX(100px);\n  }\n  100% {\n    transform: translateX(0);\n  }\n}\n\n.element {\n  animation: slide 2s infinite;\n}',
                            result: "来回滑动"
                        },
                        {
                            title: "多属性动画",
                            code: '@keyframes bounce {\n  0%, 100% {\n    transform: translateY(0);\n    opacity: 1;\n  }\n  50% {\n    transform: translateY(-30px);\n    opacity: 0.5;\n  }\n}\n\n.element {\n  animation: bounce 1s ease-in-out infinite;\n}',
                            result: "弹跳效果"
                        }
                    ]
                }
            },
            {
                id: "animation-properties",
                title: "动画属性详解",
                type: "principle",
                content: {
                    description: "CSS动画提供了丰富的控制属性。",
                    mechanism: "animation属性是多个子属性的简写，可以精确控制动画的各个方面。",
                    steps: [
                        "animation-name：@keyframes名称",
                        "animation-duration：持续时间，如2s、500ms",
                        "animation-timing-function：缓动函数",
                        "animation-delay：延迟时间",
                        "animation-iteration-count：次数（数字或infinite）",
                        "animation-direction：normal、reverse、alternate、alternate-reverse",
                        "animation-fill-mode：forwards、backwards、both",
                        "animation-play-state：running、paused"
                    ],
                    code: '/* 完整写法 */\n.element {\n  animation-name: slide;\n  animation-duration: 2s;\n  animation-timing-function: ease-in-out;\n  animation-delay: 0.5s;\n  animation-iteration-count: infinite;\n  animation-direction: alternate;\n  animation-fill-mode: forwards;\n}\n\n/* 简写 */\n.element {\n  animation: slide 2s ease-in-out 0.5s infinite alternate forwards;\n}'
                }
            },
            {
                id: "animation-demo",
                title: "动画实战演示",
                type: "interactive-demo",
                content: {
                    description: "常见的CSS动画效果。",
                    demo: {
                        html: '<div class="spinner">Loading...</div>\n<div class="pulse">脉冲效果</div>\n<div class="shake">摇晃效果</div>',
                        css: '/* 旋转加载动画 */\n@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n\n.spinner {\n  width: 50px;\n  height: 50px;\n  border: 4px solid #f3f3f3;\n  border-top-color: #3b82f6;\n  border-radius: 50%;\n  animation: spin 1s linear infinite;\n}\n\n/* 脉冲动画 */\n@keyframes pulse {\n  0%, 100% {\n    transform: scale(1);\n    opacity: 1;\n  }\n  50% {\n    transform: scale(1.1);\n    opacity: 0.7;\n  }\n}\n\n.pulse {\n  padding: 20px;\n  background: #3b82f6;\n  color: white;\n  border-radius: 8px;\n  margin: 20px 0;\n  animation: pulse 2s ease-in-out infinite;\n}\n\n/* 摇晃动画 */\n@keyframes shake {\n  0%, 100% { transform: translateX(0); }\n  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }\n  20%, 40%, 60%, 80% { transform: translateX(10px); }\n}\n\n.shake {\n  padding: 20px;\n  background: #ef4444;\n  color: white;\n  border-radius: 8px;\n  animation: shake 0.5s ease-in-out;\n}\n\n.shake:hover {\n  animation: shake 0.5s ease-in-out;\n}',
                        editable: true
                    }
                }
            },
            {
                id: "transition-vs-animation",
                title: "过渡 vs 动画",
                type: "comparison",
                content: {
                    description: "选择使用transition还是animation？",
                    items: [
                        {
                            name: "Transition（过渡）",
                            code: '.element {\n  transition: all 0.3s ease;\n}\n.element:hover {\n  transform: scale(1.2);\n}',
                            pros: ["简单易用", "只需两个状态", "自动触发", "性能好"],
                            cons: ["只能定义起始和结束", "需要触发器（如:hover）", "无法循环"]
                        },
                        {
                            name: "Animation（动画）",
                            code: '@keyframes bounce {\n  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-20px); }\n}\n.element {\n  animation: bounce 1s infinite;\n}',
                            pros: ["可以定义多个关键帧", "自动播放", "可循环", "更强大的控制"],
                            cons: ["相对复杂", "代码量大"]
                        }
                    ]
                }
            },
            {
                id: "performance",
                title: "动画性能优化",
                type: "principle",
                content: {
                    description: "不同的CSS属性对性能的影响差异很大。",
                    mechanism: "浏览器渲染分为Layout、Paint、Composite三个阶段。只触发Composite的属性性能最好。",
                    steps: [
                        "最优：transform、opacity（只触发合成）",
                        "较差：width、height、padding、margin（触发布局）",
                        "中等：color、background-color（触发绘制）",
                        "使用will-change提示浏览器优化",
                        "避免在动画中修改会触发回流的属性"
                    ],
                    code: '/* 好的做法：使用transform */\n.element {\n  transition: transform 0.3s;\n}\n.element:hover {\n  transform: translateX(100px);\n}\n\n/* 不好的做法：修改left */\n.element {\n  position: relative;\n  transition: left 0.3s;\n}\n.element:hover {\n  left: 100px; /* 触发布局重排 */\n}\n\n/* 优化提示 */\n.animated {\n  will-change: transform, opacity;\n}'
                }
            },
            {
                id: "practical-examples",
                title: "实用动画库",
                type: "code-example",
                content: {
                    description: "常用的动画效果集合。",
                    examples: [
                        {
                            title: "淡入淡出",
                            code: '@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n@keyframes fadeOut {\n  from { opacity: 1; }\n  to { opacity: 0; }\n}\n\n.fade-in { animation: fadeIn 0.5s; }\n.fade-out { animation: fadeOut 0.5s; }',
                            result: "页面元素显示/隐藏"
                        },
                        {
                            title: "滑入滑出",
                            code: '@keyframes slideInLeft {\n  from { transform: translateX(-100%); }\n  to { transform: translateX(0); }\n}\n\n@keyframes slideInRight {\n  from { transform: translateX(100%); }\n  to { transform: translateX(0); }\n}\n\n.slide-in-left { animation: slideInLeft 0.5s; }',
                            result: "侧边栏、抽屉菜单"
                        },
                        {
                            title: "缩放效果",
                            code: '@keyframes zoomIn {\n  from {\n    opacity: 0;\n    transform: scale(0.3);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n\n.zoom-in { animation: zoomIn 0.3s; }',
                            result: "模态框、弹窗"
                        },
                        {
                            title: "打字机效果",
                            code: '@keyframes typing {\n  from { width: 0; }\n  to { width: 100%; }\n}\n\n@keyframes blink {\n  50% { border-color: transparent; }\n}\n\n.typewriter {\n  overflow: hidden;\n  border-right: 2px solid;\n  white-space: nowrap;\n  animation:\n    typing 3s steps(40, end),\n    blink 0.75s step-end infinite;\n}',
                            result: "文字逐字显示"
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第6章：定位机制", url: "06-positioning.html" },
        next: null
    }
};
