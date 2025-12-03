// 第6章：CSS定位机制
window.cssContentData_Section06 = {
    section: {
        id: 6,
        title: "CSS定位机制",
        icon: "📍",
        topics: [
            {
                id: "position-intro",
                title: "定位机制概述",
                type: "concept",
                content: {
                    description: "CSS定位允许我们精确控制元素的位置，脱离正常文档流或相对于某个参考点定位。",
                    keyPoints: [
                        "static：默认值，正常文档流",
                        "relative：相对定位，相对于自身原位置",
                        "absolute：绝对定位，相对于最近的定位祖先",
                        "fixed：固定定位，相对于视口",
                        "sticky：粘性定位，relative和fixed的结合"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/position"
                }
            },
            {
                id: "position-comparison",
                title: "定位类型对比",
                type: "comparison",
                content: {
                    description: "不同定位类型的特点和使用场景。",
                    items: [
                        {
                            name: "static（静态定位）",
                            code: '.element {\n  position: static;  /* 默认值 */\n}',
                            pros: ["正常文档流", "默认行为"],
                            cons: ["top/right/bottom/left无效", "z-index无效"]
                        },
                        {
                            name: "relative（相对定位）",
                            code: '.element {\n  position: relative;\n  top: 20px;\n  left: 30px;\n}',
                            pros: ["保留原空间", "可使用偏移", "可作为absolute的参考"],
                            cons: ["偏移不影响其他元素", "可能造成重叠"]
                        },
                        {
                            name: "absolute（绝对定位）",
                            code: '.element {\n  position: absolute;\n  top: 0;\n  right: 0;\n}',
                            pros: ["完全脱离文档流", "精确定位", "不占空间"],
                            cons: ["需要定位父元素", "可能溢出"]
                        },
                        {
                            name: "fixed（固定定位）",
                            code: '.element {\n  position: fixed;\n  bottom: 20px;\n  right: 20px;\n}',
                            pros: ["相对视口定位", "不随滚动移动", "适合固定元素"],
                            cons: ["脱离文档流", "transform会影响参考点"]
                        }
                    ]
                }
            },
            {
                id: "relative-demo",
                title: "相对定位示例",
                type: "interactive-demo",
                content: {
                    description: "relative定位相对于自身原位置偏移。",
                    demo: {
                        html: '<div class="box">正常盒子</div>\n<div class="box relative">相对定位</div>\n<div class="box">正常盒子</div>',
                        css: '.box {\n  width: 100px;\n  height: 100px;\n  background: lightblue;\n  margin: 10px;\n  border: 2px solid blue;\n}\n\n.relative {\n  position: relative;\n  top: 20px;  /* 向下偏移 */\n  left: 30px; /* 向右偏移 */\n  background: lightcoral;\n  /* 原位置仍被保留 */\n}',
                        editable: true
                    }
                }
            },
            {
                id: "absolute-demo",
                title: "绝对定位示例",
                type: "interactive-demo",
                content: {
                    description: "absolute相对于最近的非static定位祖先元素定位。",
                    demo: {
                        html: '<div class="parent">\n  <div class="child">绝对定位</div>\n</div>',
                        css: '.parent {\n  position: relative;  /* 作为定位参考 */\n  width: 300px;\n  height: 200px;\n  background: #f0f0f0;\n  border: 2px solid #999;\n}\n\n.child {\n  position: absolute;\n  top: 20px;     /* 距离父元素顶部20px */\n  right: 20px;   /* 距离父元素右侧20px */\n  width: 100px;\n  height: 80px;\n  background: lightblue;\n  border: 2px solid blue;\n}',
                        editable: true
                    }
                }
            },
            {
                id: "centering",
                title: "定位居中技巧",
                type: "code-example",
                content: {
                    description: "使用定位实现元素居中的多种方法。",
                    examples: [
                        {
                            title: "transform居中（不定宽高）",
                            code: '.center {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}',
                            result: "最常用的居中方法"
                        },
                        {
                            title: "margin auto居中（已知宽高）",
                            code: '.center {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  width: 200px;\n  height: 100px;\n  margin: auto;\n}',
                            result: "经典居中方法"
                        },
                        {
                            title: "calc计算居中",
                            code: '.center {\n  position: absolute;\n  width: 200px;\n  height: 100px;\n  top: calc(50% - 50px);\n  left: calc(50% - 100px);\n}',
                            result: "使用calc函数"
                        }
                    ]
                }
            },
            {
                id: "fixed-demo",
                title: "固定定位应用",
                type: "interactive-demo",
                content: {
                    description: "fixed定位常用于创建固定导航、返回顶部按钮等。",
                    demo: {
                        html: '<div class="fixed-nav">固定导航栏</div>\n<div class="content">\n  <p>页面内容...</p>\n  <p>滚动页面，导航栏保持固定</p>\n</div>\n<button class="back-to-top">↑</button>',
                        css: '.fixed-nav {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  background: #333;\n  color: white;\n  padding: 15px;\n  z-index: 100;\n}\n\n.content {\n  margin-top: 60px;\n  padding: 20px;\n}\n\n.back-to-top {\n  position: fixed;\n  bottom: 20px;\n  right: 20px;\n  width: 50px;\n  height: 50px;\n  background: #007bff;\n  color: white;\n  border: none;\n  border-radius: 50%;\n  cursor: pointer;\n}',
                        editable: true
                    }
                }
            },
            {
                id: "sticky",
                title: "粘性定位（sticky）",
                type: "principle",
                content: {
                    description: "sticky是relative和fixed的混合体，在阈值前是relative，达到阈值后变为fixed。",
                    mechanism: "元素根据正常文档流定位，当滚动到指定位置时固定在容器内。",
                    steps: [
                        "必须指定阈值（top/right/bottom/left中至少一个）",
                        "父元素不能有overflow: hidden/auto/scroll",
                        "父元素高度要大于sticky元素",
                        "常用于表格标题、侧边栏等"
                    ],
                    code: '.sticky-header {\n  position: sticky;\n  top: 0;  /* 滚动到顶部时固定 */\n  background: white;\n  z-index: 10;\n}\n\n/* 示例：粘性侧边栏 */\n.sidebar {\n  position: sticky;\n  top: 20px;  /* 距离顶部20px时固定 */\n}'
                }
            },
            {
                id: "z-index",
                title: "z-index层叠控制",
                type: "code-example",
                content: {
                    description: "z-index控制定位元素的层叠顺序。",
                    examples: [
                        {
                            title: "基本用法",
                            code: '.element1 {\n  position: relative;\n  z-index: 10;  /* 较高 */\n}\n\n.element2 {\n  position: relative;\n  z-index: 5;   /* 较低 */\n}',
                            result: "数值大的在上层"
                        },
                        {
                            title: "注意事项",
                            code: '/* z-index只对定位元素有效 */\n.static-element {\n  position: static;\n  z-index: 100;  /* 无效！ */\n}\n\n/* 需要设置position */\n.positioned {\n  position: relative;\n  z-index: 100;  /* 有效 */\n}',
                            result: "必须配合position使用"
                        },
                        {
                            title: "层叠上下文",
                            code: '/* 创建层叠上下文的方法 */\n.context {\n  position: relative;\n  z-index: 1;  /* 创建新的层叠上下文 */\n  /* 或 */\n  opacity: 0.99;\n  /* 或 */\n  transform: translateZ(0);\n}',
                            result: "层叠上下文隔离z-index"
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第5章：Grid布局", url: "05-grid.html" },
        next: null
    }
};
