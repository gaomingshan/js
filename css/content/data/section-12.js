// 第12章：正常流
window.cssContentData_Section12 = {
    section: {
        id: 12,
        title: "正常流",
        icon: "🌊",
        topics: [
            {
                id: "normal-flow-intro",
                title: "正常流概念",
                type: "concept",
                content: {
                    description: "正常流（Normal Flow）是CSS布局的默认方式，元素按照在文档中的顺序排列。",
                    keyPoints: [
                        "正常流是未应用特殊定位或浮动时的布局",
                        "块级元素垂直排列，独占一行",
                        "行内元素水平排列，直到换行",
                        "是最基础的布局流",
                        "float和position会脱离正常流"
                    ]
                }
            },
            {
                id: "box-types",
                title: "盒的类型",
                type: "comparison",
                content: {
                    description: "正常流中有三种主要的盒类型。",
                    items: [
                        {name: "块级盒", code: "display: block", pros: ["独占一行", "可设置宽高", "垂直排列"], cons: []},
                        {name: "行内盒", code: "display: inline", pros: ["水平排列", "宽高由内容决定"], cons: ["不能设置宽高"]},
                        {name: "行内块盒", code: "display: inline-block", pros: ["水平排列", "可设置宽高"], cons: ["基线对齐问题"]}
                    ]
                }
            },
            {
                id: "anonymous-box",
                title: "匿名盒",
                type: "principle",
                content: {
                    description: "浏览器会自动创建匿名盒来修正结构不完整的情况。",
                    mechanism: "当块级元素中直接包含文本时，浏览器会创建匿名块盒；当行内元素中包含块级元素时，会创建匿名行内盒。",
                    steps: [
                        "匿名块盒：包裹块级元素中的裸文本",
                        "匿名行内盒：包裹行内元素中的文本",
                        "无法通过CSS选择器选中",
                        "继承父元素的可继承属性",
                        "用于维护盒模型的一致性"
                    ],
                    code: '<div>\n  Text /* 被匿名块盒包裹 */\n  <p>Paragraph</p>\n  More text /* 被匿名块盒包裹 */\n</div>'
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第11章：包含块", url: "11-containing-block.html" },
        next: { title: "第13章：盒的生成与布局", url: "13-box-generation.html" }
    }
};
