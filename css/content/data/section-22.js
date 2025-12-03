// 第22章：浮动原理
window.cssContentData_Section22 = {
    section: {
        id: 22,
        title: "浮动原理",
        icon: "🌊",
        topics: [
            {
                id: "float-basics",
                title: "浮动的本质",
                type: "concept",
                content: {
                    description: "浮动（float）最初设计用于实现文字环绕图片的效果，后来被广泛用于布局。浮动元素会脱离正常文档流，向左或向右移动，直到碰到包含块边界或另一个浮动元素。",
                    keyPoints: [
                        "浮动元素脱离文档流，但不完全脱离，仍会影响行内内容",
                        "float值可以是left、right或none",
                        "浮动元素会尽可能向指定方向移动，直到遇到边界",
                        "浮动元素会变成块级元素，display计算值会改变",
                        "浮动元素可以相互堆叠，但不会重叠"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/float"
                }
            },
            {
                id: "float-layout-rules",
                title: "浮动布局规则",
                type: "principle",
                content: {
                    description: "浮动元素的布局遵循一套复杂的规则，这些规则决定了浮动元素的位置和对周围元素的影响。",
                    mechanism: "浮动元素会从正常文档流中移除，向左或向右移动，直到外边缘碰到包含块或另一个浮动元素的边缘。浮动元素会被尽可能地放置在高位置。如果水平方向没有足够空间，浮动元素会下移到有空间的地方。浮动元素之间不会重叠，会依次排列。",
                    keyPoints: [
                        "浮动元素脱离文档流，父元素高度塌陷",
                        "行内元素会围绕浮动元素排列，形成文字环绕效果",
                        "块级元素会忽略浮动元素，但其内容会避开浮动元素",
                        "浮动元素会尽量向上浮动，受前面浮动元素影响",
                        "清除浮动可以防止元素位于浮动元素旁边"
                    ]
                }
            },
            {
                id: "float-stacking",
                title: "浮动元素的堆叠",
                type: "principle",
                content: {
                    description: "多个浮动元素会按照特定规则进行排列和堆叠，理解这些规则对于实现复杂的浮动布局至关重要。",
                    mechanism: "同方向的浮动元素会依次排列，如果一行空间不够，后续元素会换行。不同方向的浮动元素会从两端向中间排列。浮动元素的顶部不能高于其前面元素的顶部（包括块级和浮动元素）。浮动元素不会重叠，会自动调整位置避开其他浮动元素。",
                    keyPoints: [
                        "同向浮动元素依次排列，空间不足时换行",
                        "左浮动和右浮动可以共存，分别从两端排列",
                        "后面的浮动元素不能比前面的更高",
                        "浮动元素会自动避让，不会发生重叠",
                        "可以使用clear属性控制浮动元素的排列"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "偏移属性计算", url: "21-offset-properties.html" },
        next: { title: "清除浮动", url: "23-clearing-float.html" }
    }
};
