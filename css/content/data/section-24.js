// 第24章：Flexbox布局算法
window.cssContentData_Section24 = {
    section: {
        id: 24,
        title: "Flexbox布局算法",
        icon: "📐",
        topics: [
            {
                id: "flexbox-model",
                title: "Flex布局模型",
                type: "concept",
                content: {
                    description: "Flexbox是一种一维布局模型，它能够高效地分配容器空间并对齐项目。Flex容器有主轴和交叉轴两个方向，项目沿主轴排列。",
                    keyPoints: [
                        "flex容器通过display:flex或display:inline-flex创建",
                        "主轴（main axis）：项目排列的方向，由flex-direction决定",
                        "交叉轴（cross axis）：垂直于主轴的方向",
                        "flex项目默认沿主轴排列，可以换行",
                        "flex布局是一维的，一次只处理一行或一列"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout"
                }
            },
            {
                id: "flex-sizing",
                title: "Flex尺寸计算算法",
                type: "principle",
                content: {
                    description: "Flexbox的核心是其尺寸计算算法，它决定了flex项目如何分配容器的可用空间。这个算法涉及基础尺寸、弹性增长和弹性收缩。",
                    mechanism: "Flex尺寸计算分三步：1) 确定每个项目的基础尺寸（flex-basis）；2) 如果有剩余空间，根据flex-grow按比例分配给各项目；3) 如果空间不足，根据flex-shrink按比例收缩各项目。最终尺寸 = 基础尺寸 + 弹性增长 或 基础尺寸 - 弹性收缩。",
                    keyPoints: [
                        "flex-basis定义项目的基础尺寸，默认为auto",
                        "flex-grow定义项目的扩展能力，默认为0（不扩展）",
                        "flex-shrink定义项目的收缩能力，默认为1（可收缩）",
                        "min-width/max-width会限制最终计算的尺寸",
                        "flex简写属性可以一次设置grow、shrink、basis"
                    ]
                }
            },
            {
                id: "flex-alignment",
                title: "Flex对齐算法",
                type: "principle",
                content: {
                    description: "Flexbox提供了强大的对齐能力，可以在主轴和交叉轴上精确控制项目的对齐方式。",
                    mechanism: "主轴对齐由justify-content控制，它分配主轴上的剩余空间；交叉轴对齐由align-items和align-content控制，前者对齐单行内的项目，后者对齐多行。align-self可以覆盖单个项目的align-items。对齐算法会考虑auto margin的特殊性：auto margin会吸收该方向上的所有剩余空间。",
                    keyPoints: [
                        "justify-content：主轴对齐（flex-start/center/space-between等）",
                        "align-items：交叉轴单行对齐（stretch/center/flex-start等）",
                        "align-content：交叉轴多行对齐，仅在换行时生效",
                        "align-self：单个项目的交叉轴对齐，覆盖align-items",
                        "auto margin可以实现特殊的对齐效果"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "清除浮动", url: "23-clearing-float.html" },
        next: { title: "Flex属性详解", url: "25-flex-properties.html" }
    }
};
