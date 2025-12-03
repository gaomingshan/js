// 第23章：清除浮动
window.cssContentData_Section23 = {
    section: {
        id: 23,
        title: "清除浮动",
        icon: "🧹",
        topics: [
            {
                id: "clear-property",
                title: "clear属性原理",
                type: "concept",
                content: {
                    description: "clear属性用于指定元素的哪一侧不允许出现浮动元素。当元素设置clear属性后，它会被移动到浮动元素下方，确保其指定侧没有浮动元素。",
                    keyPoints: [
                        "clear可取值：none、left、right、both",
                        "clear:left 表示左侧不允许有浮动元素",
                        "clear:right 表示右侧不允许有浮动元素",
                        "clear:both 表示两侧都不允许有浮动元素",
                        "clear只影响应用该属性的元素本身，不影响其他元素"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/clear"
                }
            },
            {
                id: "clearfix-methods",
                title: "清除浮动的方法",
                type: "principle",
                content: {
                    description: "由于浮动会导致父元素高度塌陷，我们需要各种方法来清除浮动或闭合浮动，使父元素能够包含浮动子元素。",
                    mechanism: "清除浮动的本质是让父元素能够计算浮动子元素的高度。常用方法包括：1) 在浮动元素后添加清除浮动的元素；2) 使父元素形成BFC；3) 使用伪元素清除浮动。BFC方法通过创建新的格式化上下文，让浮动子元素参与父元素高度计算。",
                    keyPoints: [
                        "空div法：在浮动元素后添加<div style='clear:both'></div>",
                        "伪元素法：使用::after伪元素清除浮动（推荐）",
                        "overflow法：给父元素设置overflow:hidden创建BFC",
                        "浮动父元素：让父元素也浮动（不推荐）",
                        "绝对定位：让父元素绝对定位（不推荐）"
                    ]
                }
            },
            {
                id: "bfc-clearfix",
                title: "BFC清除浮动原理",
                type: "principle",
                content: {
                    description: "利用BFC（块级格式化上下文）是最常用和最推荐的清除浮动方法之一。BFC是一个独立的渲染区域，其中的浮动元素会参与高度计算。",
                    mechanism: "当父元素形成BFC后，它会包含内部的浮动元素。BFC的高度计算会包括浮动子元素的高度，从而解决高度塌陷问题。触发BFC的方式很多，最常用的是设置overflow:hidden或overflow:auto。现代最佳实践是使用display:flow-root明确创建BFC。",
                    keyPoints: [
                        "BFC会计算浮动元素的高度，解决高度塌陷",
                        "overflow:hidden/auto 可以触发BFC",
                        "display:flow-root 是专门用于创建BFC的现代方法",
                        "float、position:absolute 也会创建BFC但有副作用",
                        "flex/grid容器也会创建类似BFC的格式化上下文"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "浮动原理", url: "22-float.html" },
        next: { title: "Flexbox布局算法", url: "24-flexbox-algorithm.html" }
    }
};
