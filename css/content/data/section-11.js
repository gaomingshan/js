// 第11章：包含块
window.cssContentData_Section11 = {
    section: {
        id: 11,
        title: "包含块",
        icon: "📏",
        topics: [
            {
                id: "containing-block-intro",
                title: "包含块概念",
                type: "concept",
                content: {
                    description: "包含块（Containing Block）是CSS中用于计算元素位置和尺寸的参照元素。",
                    keyPoints: [
                        "包含块决定元素的百分比尺寸计算",
                        "不同定位方式有不同的包含块",
                        "包含块不一定是父元素",
                        "position、float、绝对定位都依赖包含块",
                        "理解包含块是掌握布局的关键"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Containing_block"
                }
            },
            {
                id: "containing-block-determination",
                title: "包含块的确定",
                type: "comparison",
                content: {
                    description: "不同定位方式下，包含块的确定规则不同。",
                    items: [
                        {name: "static/relative", code: "position: static/relative", pros: ["最近的块级祖先的内容区"], cons: []},
                        {name: "absolute", code: "position: absolute", pros: ["最近的非static定位祖先的padding区"], cons: []},
                        {name: "fixed", code: "position: fixed", pros: ["viewport（视口）"], cons: []},
                        {name: "absolute + transform", code: "position: absolute\n祖先有transform", pros: ["最近的有transform祖先"], cons: []}
                    ]
                }
            },
            {
                id: "percentage-calculation",
                title: "百分比计算规则",
                type: "principle",
                content: {
                    description: "元素的百分比值相对于包含块计算。",
                    mechanism: "width/height的百分比相对于包含块的宽高，margin/padding的百分比都相对于包含块的宽度。",
                    steps: [
                        "width: 50% → 包含块宽度的50%",
                        "height: 50% → 包含块高度的50%",
                        "padding: 10% → 包含块宽度的10%（四个方向都是）",
                        "margin: 10% → 包含块宽度的10%（四个方向都是）",
                        "top/bottom: 10% → 包含块高度的10%",
                        "left/right: 10% → 包含块宽度的10%"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第10章：单位与值转换", url: "10-units.html" },
        next: { title: "第12章：正常流", url: "12-normal-flow.html" }
    }
};
