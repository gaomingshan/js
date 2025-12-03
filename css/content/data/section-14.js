// 第14章：BFC块级格式化上下文
window.cssContentData_Section14 = {
    section: {
        id: 14,
        title: "BFC块级格式化上下文",
        icon: "🔲",
        topics: [
            {
                id: "bfc-intro",
                title: "BFC概念",
                type: "concept",
                content: {
                    description: "BFC（Block Formatting Context）是一个独立的渲染区域，内部元素的布局不受外部影响。",
                    keyPoints: [
                        "独立的布局环境",
                        "内部块级盒垂直排列",
                        "margin不会与外部元素合并",
                        "不会与浮动元素重叠",
                        "计算高度时包含浮动元素"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context"
                }
            },
            {
                id: "bfc-trigger",
                title: "触发BFC的条件",
                type: "code-example",
                content: {
                    description: "多种方式可以创建BFC。",
                    examples: [
                        {title: "overflow", code: ".bfc {\n  overflow: hidden; /* 或auto、scroll */\n}", result: "最常用方法"},
                        {title: "浮动", code: ".bfc {\n  float: left; /* 或right */\n}", result: "浮动元素创建BFC"},
                        {title: "定位", code: ".bfc {\n  position: absolute; /* 或fixed */\n}", result: "绝对定位创建BFC"},
                        {title: "display", code: ".bfc {\n  display: flow-root; /* 或flex、grid、inline-block */\n}", result: "特殊display值"}
                    ]
                }
            },
            {
                id: "bfc-applications",
                title: "BFC应用场景",
                type: "principle",
                content: {
                    description: "BFC可以解决多种布局问题。",
                    mechanism: "利用BFC的特性解决margin合并、浮动高度塌陷、元素重叠等问题。",
                    steps: [
                        "清除浮动：包含浮动元素",
                        "阻止margin合并：创建新BFC",
                        "自适应两栏布局：BFC不与浮动重叠",
                        "防止元素被浮动覆盖",
                        "包含内部浮动元素高度"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第13章：盒的生成", url: "13-box-generation.html" },
        next: { title: "第15章：IFC", url: "15-ifc.html" }
    }
};
