// 第29章：响应式单位
window.cssContentData_Section29 = {
    section: {
        id: 29,
        title: "响应式单位",
        icon: "📏",
        topics: [
            {
                id: "viewport-units",
                title: "视口单位详解",
                type: "concept",
                content: {
                    description: "视口单位是相对于浏览器视口尺寸的CSS单位，它们随视口大小变化而变化，是实现响应式设计的重要工具。",
                    keyPoints: [
                        "vw：视口宽度的1%（1vw = 视口宽度/100）",
                        "vh：视口高度的1%（1vh = 视口高度/100）",
                        "vmin：vw和vh中较小的那个",
                        "vmax：vw和vh中较大的那个",
                        "移动端vh存在地址栏显隐问题，需谨慎使用"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/length"
                }
            },
            {
                id: "rem-em-units",
                title: "rem与em单位",
                type: "principle",
                content: {
                    description: "rem和em都是相对字体单位，但它们的参考基准不同。理解它们的区别和使用场景对于构建可扩展的布局非常重要。",
                    mechanism: "em相对于当前元素的font-size计算，如果当前元素没有设置font-size，则继承父元素。这意味着em会层层叠加，可能导致意外的复合效果。rem（root em）相对于根元素（html）的font-size计算，避免了em的复合问题。通常设置html { font-size: 62.5% }（即10px），使1rem = 10px便于计算。",
                    keyPoints: [
                        "em相对于当前元素的font-size",
                        "rem相对于根元素（html）的font-size",
                        "em会层层叠加，可能产生复合效果",
                        "rem避免了em的复合问题，更可预测",
                        "使用rem便于实现整体缩放",
                        "em适合组件内部相对尺寸，rem适合全局尺寸"
                    ]
                }
            },
            {
                id: "clamp-function",
                title: "clamp()响应式函数",
                type: "principle",
                content: {
                    description: "clamp()是CSS的一个数学函数，它可以在一个范围内动态调整值，非常适合创建流体排版和响应式尺寸。",
                    mechanism: "clamp(MIN, VAL, MAX)接受三个参数：最小值、首选值、最大值。它返回的值永远在MIN和MAX之间。当VAL在MIN和MAX之间时返回VAL；当VAL小于MIN时返回MIN；当VAL大于MAX时返回MAX。常用于字体大小：clamp(1rem, 2.5vw, 2rem)会随视口变化，但不会小于1rem或大于2rem。",
                    keyPoints: [
                        "语法：clamp(最小值, 首选值, 最大值)",
                        "返回值始终在最小值和最大值之间",
                        "首选值通常使用vw等相对单位",
                        "一行代码实现响应式尺寸，无需媒体查询",
                        "适用于font-size、width、padding等任何长度属性",
                        "IE不支持，需要考虑降级方案"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "媒体查询原理", url: "28-media-queries.html" },
        next: null
    }
};
