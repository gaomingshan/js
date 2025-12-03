// 第15章：IFC行内格式化上下文
window.cssContentData_Section15 = {
    section: {
        id: 15,
        title: "IFC行内格式化上下文",
        icon: "📝",
        topics: [
            {
                id: "ifc-intro",
                title: "IFC概念",
                type: "concept",
                content: {
                    description: "IFC（Inline Formatting Context）是行内级元素的布局环境。",
                    keyPoints: [
                        "行内元素水平排列成行",
                        "line-height决定行高",
                        "vertical-align控制垂直对齐",
                        "空白符会影响布局",
                        "文本方向影响排列"
                    ]
                }
            },
            {
                id: "line-height",
                title: "line-height详解",
                type: "principle",
                content: {
                    description: "line-height决定行盒的高度，影响文本垂直间距。",
                    mechanism: "行高包括内容区、上下半行距。font-size和line-height共同决定行盒高度。",
                    steps: [
                        "行高 = font-size + 上半行距 + 下半行距",
                        "无单位数值：相对font-size",
                        "百分比：相对自身font-size",
                        "固定值：指定具体高度",
                        "normal：浏览器默认（通常1.2）"
                    ]
                }
            },
            {
                id: "vertical-align",
                title: "vertical-align对齐",
                type: "code-example",
                content: {
                    description: "vertical-align控制行内元素的垂直对齐方式。",
                    examples: [
                        {title: "基线对齐", code: "vertical-align: baseline; /* 默认 */", result: "对齐父元素基线"},
                        {title: "顶部对齐", code: "vertical-align: top;", result: "对齐行盒顶部"},
                        {title: "中线对齐", code: "vertical-align: middle;", result: "对齐父元素中线"},
                        {title: "百分比", code: "vertical-align: 50%;", result: "相对line-height偏移"}
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第14章：BFC", url: "14-bfc.html" },
        next: { title: "第16章：FFC", url: "16-ffc.html" }
    }
};
