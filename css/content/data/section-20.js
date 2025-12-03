// 第20章：定位原理
window.cssContentData_Section20 = {
    section: {
        id: 20,
        title: "定位原理",
        icon: "📍",
        topics: [
            {
                id: "position-types",
                title: "定位类型详解",
                type: "concept",
                content: {
                    description: "CSS提供了五种定位方式：static（静态定位）、relative（相对定位）、absolute（绝对定位）、fixed（固定定位）和sticky（粘性定位）。每种定位方式都有其特定的布局规则和适用场景。",
                    keyPoints: [
                        "static：默认定位，元素按正常文档流布局，top/right/bottom/left无效",
                        "relative：相对于元素原本位置定位，但原本空间仍被保留",
                        "absolute：相对于最近的非static定位祖先定位，脱离文档流",
                        "fixed：相对于视口定位，固定在屏幕位置，脱离文档流",
                        "sticky：相对和固定的结合，在阈值内表现为relative，超出后变为fixed"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/position"
                }
            },
            {
                id: "positioning-context",
                title: "定位上下文与包含块",
                type: "principle",
                content: {
                    description: "定位元素的最终位置由其定位上下文（包含块）决定。不同的position值会导致不同的包含块确定规则。",
                    mechanism: "relative定位的包含块与static相同，由最近的块级祖先决定；absolute定位的包含块是最近的position非static祖先的padding box；fixed定位的包含块通常是视口，但transform/filter/perspective等属性会创建新的包含块；sticky定位依赖于最近的滚动祖先。",
                    keyPoints: [
                        "包含块决定了定位元素的坐标参考系和百分比计算基准",
                        "absolute寻找最近的非static定位祖先，找不到则相对于初始包含块",
                        "transform/filter等CSS属性会为fixed和absolute创建新的包含块",
                        "sticky的包含块受overflow属性影响，父元素不能设置overflow:hidden",
                        "理解包含块是掌握定位布局的关键"
                    ]
                }
            },
            {
                id: "sticky-positioning",
                title: "sticky粘性定位原理",
                type: "principle",
                content: {
                    description: "sticky定位是CSS3新增的定位方式，它结合了relative和fixed的特性，创建了一种在滚动到特定阈值时粘住的效果。",
                    mechanism: "元素在未达到阈值前表现为relative定位，当滚动到设定的阈值（top/right/bottom/left）时，元素会固定在该位置，表现为fixed定位。但它始终限制在父容器范围内，当父容器滚出视口时，sticky元素也会跟随移出。",
                    keyPoints: [
                        "必须指定至少一个阈值属性（top/right/bottom/left）",
                        "sticky元素始终在其父容器的内容区域内",
                        "父元素或祖先元素不能设置overflow:hidden/auto/scroll（除了滚动容器）",
                        "需要有足够的滚动空间才能触发sticky效果",
                        "常用于导航栏、表格标题等需要保持可见的场景"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "z-index详解", url: "19-z-index.html" },
        next: { title: "偏移属性计算", url: "21-offset-properties.html" }
    }
};
