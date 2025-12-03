// 第3章：盒模型与布局基础
window.cssContentData_Section03 = {
    section: {
        id: 3,
        title: "盒模型与布局基础",
        icon: "📦",
        topics: [
            {
                id: "box-model-intro",
                title: "CSS盒模型概述",
                type: "concept",
                content: {
                    description: "CSS盒模型是理解布局的基础。每个元素都被视为一个矩形盒子，由内容、内边距、边框和外边距组成。",
                    keyPoints: [
                        "content（内容区）：显示文本和图片的区域",
                        "padding（内边距）：内容与边框之间的空间",
                        "border（边框）：围绕padding的边框线",
                        "margin（外边距）：元素与其他元素之间的距离",
                        "两种盒模型：标准盒模型（content-box）和IE盒模型（border-box）"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Box_Model"
                }
            },
            {
                id: "box-sizing",
                title: "box-sizing属性",
                type: "comparison",
                content: {
                    description: "box-sizing决定了width和height的计算方式。",
                    items: [
                        {
                            name: "content-box（默认）",
                            code: '.box {\n  box-sizing: content-box;\n  width: 200px;\n  padding: 20px;\n  border: 10px solid;\n  /* 实际宽度 = 200 + 20*2 + 10*2 = 260px */\n}',
                            pros: ["W3C标准", "符合数学直觉"],
                            cons: ["计算复杂", "难以控制实际尺寸"]
                        },
                        {
                            name: "border-box",
                            code: '.box {\n  box-sizing: border-box;\n  width: 200px;\n  padding: 20px;\n  border: 10px solid;\n  /* 实际宽度 = 200px（包含padding和border）*/\n}',
                            pros: ["更符合直觉", "布局计算简单", "响应式设计友好"],
                            cons: ["需要显式设置"]
                        }
                    ]
                }
            },
            {
                id: "box-sizing-demo",
                title: "盒模型对比演示",
                type: "interactive-demo",
                content: {
                    description: "直观对比两种盒模型的区别。",
                    demo: {
                        html: '<div class="content-box">content-box</div>\n<div class="border-box">border-box</div>',
                        css: 'div {\n  width: 200px;\n  padding: 20px;\n  border: 5px solid blue;\n  margin: 10px;\n  background: lightblue;\n}\n\n.content-box {\n  box-sizing: content-box;\n  /* 实际宽度: 250px */\n}\n\n.border-box {\n  box-sizing: border-box;\n  /* 实际宽度: 200px */\n}',
                        editable: true
                    }
                }
            },
            {
                id: "margin-collapse",
                title: "外边距合并",
                type: "principle",
                content: {
                    description: "垂直方向上相邻的margin会合并，取其中较大的值。这是CSS的特殊行为。",
                    mechanism: "只有垂直方向的margin会合并，水平方向不会。合并后的距离是较大的margin值，而不是相加。",
                    steps: [
                        "相邻兄弟元素：上元素的margin-bottom和下元素的margin-top合并",
                        "父子元素：父元素的margin-top和第一个子元素的margin-top合并",
                        "空元素：自身的margin-top和margin-bottom合并",
                        "合并规则：取较大的margin值"
                    ],
                    code: '/* 合并示例 */\n.box1 { margin-bottom: 30px; }\n.box2 { margin-top: 50px; }\n/* 实际间距：50px（不是80px）*/\n\n/* 阻止合并的方法 */\n.parent {\n  overflow: hidden;  /* 创建BFC */\n  /* 或 */\n  border-top: 1px solid transparent;\n  /* 或 */\n  padding-top: 1px;\n}'
                }
            },
            {
                id: "bfc",
                title: "BFC（块级格式化上下文）",
                type: "principle",
                content: {
                    description: "BFC是一个独立的渲染区域，内部元素的布局不会影响外部元素。",
                    mechanism: "BFC是页面上的一个隔离的独立容器，容器内部的子元素不会影响外面的元素。",
                    steps: [
                        "触发条件：根元素、float非none、position为absolute/fixed、overflow非visible、display为flex/grid/inline-block等",
                        "特性1：阻止margin合并",
                        "特性2：清除浮动（包含浮动元素）",
                        "特性3：阻止元素被浮动元素覆盖",
                        "应用：实现自适应两栏布局、清除浮动等"
                    ],
                    code: '/* 创建BFC的方法 */\n.bfc {\n  overflow: hidden;  /* 最常用 */\n  /* 或 */\n  display: flow-root; /* 现代浏览器 */\n  /* 或 */\n  float: left;\n  /* 或 */\n  position: absolute;\n}'
                }
            },
            {
                id: "display-types",
                title: "display属性",
                type: "code-example",
                content: {
                    description: "display决定了元素的显示类型和布局行为。",
                    examples: [
                        {
                            title: "block（块级）",
                            code: 'div { display: block; }\n/* 特点：\n- 独占一行\n- 可设置width和height\n- 默认宽度100%\n- 可包含块级和内联元素 */',
                            result: "div、p、h1-h6、ul、ol等默认都是block"
                        },
                        {
                            title: "inline（内联）",
                            code: 'span { display: inline; }\n/* 特点：\n- 不换行，在一行内排列\n- width/height无效\n- 只能包含内联元素\n- 垂直margin/padding不影响布局 */',
                            result: "span、a、strong、em等默认都是inline"
                        },
                        {
                            title: "inline-block",
                            code: 'img { display: inline-block; }\n/* 特点：\n- 不换行，在一行内排列\n- 可设置width和height\n- 结合了inline和block的优点 */',
                            result: "常用于按钮、图片等"
                        },
                        {
                            title: "none",
                            code: '.hidden { display: none; }\n/* 完全不显示，不占据空间 */',
                            result: "元素从文档流中移除"
                        }
                    ]
                }
            },
            {
                id: "width-height",
                title: "宽度和高度设置",
                type: "interactive-demo",
                content: {
                    description: "理解width、height及其相关属性。",
                    demo: {
                        html: '<div class="auto">width: auto</div>\n<div class="percent">width: 100%</div>\n<div class="fixed">width: 300px</div>\n<div class="fit">width: fit-content</div>',
                        css: 'div {\n  padding: 20px;\n  margin: 10px 0;\n  background: lightblue;\n  border: 2px solid blue;\n}\n\n.auto { width: auto; }\n.percent { width: 100%; }\n.fixed { width: 300px; }\n.fit { width: fit-content; }',
                        editable: true
                    }
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第2章：选择器系统", url: "02-selectors.html" },
        next: { title: "第4章：Flexbox布局", url: "04-flexbox.html" }
    }
};
