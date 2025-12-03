// 第25章：Flex属性详解
window.cssContentData_Section25 = {
    section: {
        id: 25,
        title: "Flex属性详解",
        icon: "🔧",
        topics: [
            {
                id: "flex-grow",
                title: "flex-grow扩展因子",
                type: "concept",
                content: {
                    description: "flex-grow属性定义了flex项目的扩展能力，即当容器有剩余空间时，项目如何分配这些额外空间。",
                    keyPoints: [
                        "flex-grow的值是一个数字，默认为0（不扩展）",
                        "如果所有项目的flex-grow都为1，它们将等分剩余空间",
                        "如果一个项目的flex-grow为2，其他为1，前者占据的剩余空间是其他项目的两倍",
                        "剩余空间按照flex-grow的比例分配，而不是总空间",
                        "flex-grow只在有剩余空间时才生效"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-grow"
                }
            },
            {
                id: "flex-shrink",
                title: "flex-shrink收缩因子",
                type: "concept",
                content: {
                    description: "flex-shrink属性定义了flex项目的收缩能力，即当容器空间不足时，项目如何收缩以适应容器。",
                    keyPoints: [
                        "flex-shrink的值是一个数字，默认为1（可以收缩）",
                        "flex-shrink为0的项目不会收缩，保持原始尺寸",
                        "收缩量 = 超出空间 × (项目flex-shrink × 项目基础尺寸) / 所有项目的(flex-shrink × 基础尺寸)之和",
                        "收缩计算会考虑项目的基础尺寸，大项目收缩更多",
                        "min-width可以阻止项目收缩到某个阈值以下"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-shrink"
                }
            },
            {
                id: "flex-basis",
                title: "flex-basis基础尺寸",
                type: "principle",
                content: {
                    description: "flex-basis定义了flex项目在分配多余空间之前的初始大小，它是flex尺寸计算的起点。",
                    mechanism: "flex-basis的优先级：flex-basis（非auto）> width/height > 内容尺寸。当flex-basis为auto时，会查看width/height属性；如果width/height也是auto，则使用内容的尺寸。flex-basis接受长度值、百分比或关键字（auto、content）。百分比相对于容器的主轴尺寸计算。",
                    keyPoints: [
                        "flex-basis定义主轴方向上的初始尺寸",
                        "flex-basis:auto 表示查看width/height属性",
                        "flex-basis:0 配合flex-grow可实现完全按比例分配",
                        "百分比flex-basis相对于容器主轴尺寸计算",
                        "min/max-width/height会限制最终尺寸，但不影响flex-basis",
                        "flex-basis优先级高于width/height"
                    ]
                }
            },
            {
                id: "flex-shorthand",
                title: "flex简写属性",
                type: "principle",
                content: {
                    description: "flex是flex-grow、flex-shrink和flex-basis的简写属性。使用简写属性可以更简洁地设置flex项目的弹性。",
                    mechanism: "flex简写有特殊的初始值规则：flex:1 等同于flex:1 1 0%（不是flex:1 1 auto）。单值语法中，无单位数字设置flex-grow，有单位值设置flex-basis。双值语法中，第一个必须是flex-grow，第二个可以是flex-shrink（无单位）或flex-basis（有单位）。",
                    keyPoints: [
                        "flex: initial 等同于 flex: 0 1 auto（默认值）",
                        "flex: auto 等同于 flex: 1 1 auto",
                        "flex: none 等同于 flex: 0 0 auto（不弹性）",
                        "flex: 1 等同于 flex: 1 1 0%（完全弹性）",
                        "推荐使用简写而不是分别设置三个属性",
                        "flex简写会重置未指定的值为初始值"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "Flexbox布局算法", url: "24-flexbox-algorithm.html" },
        next: { title: "Grid布局算法", url: "26-grid-algorithm.html" }
    }
};
