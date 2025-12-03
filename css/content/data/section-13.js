// 第13章：盒的生成与布局
window.cssContentData_Section13 = {
    section: {
        id: 13,
        title: "盒的生成与布局",
        icon: "🎁",
        topics: [
            {
                id: "display-property",
                title: "display属性详解",
                type: "concept",
                content: {
                    description: "display属性决定元素如何生成盒以及如何参与布局。",
                    keyPoints: [
                        "控制元素的盒类型和布局模式",
                        "外部显示类型（block/inline）",
                        "内部显示类型（flow/flex/grid）",
                        "display: none不生成盒",
                        "新语法：display: block flow"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/display"
                }
            },
            {
                id: "box-generation",
                title: "盒的生成规则",
                type: "principle",
                content: {
                    description: "不同display值会生成不同类型的盒。",
                    mechanism: "display控制元素生成主盒、匿名盒等，影响布局计算。",
                    steps: [
                        "block：生成块级盒",
                        "inline：生成行内盒",
                        "inline-block：生成行内块盒",
                        "flex：生成弹性容器盒",
                        "grid：生成网格容器盒",
                        "none：不生成盒，不占空间"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第12章：正常流", url: "12-normal-flow.html" },
        next: { title: "第14章：BFC", url: "14-bfc.html" }
    }
};
