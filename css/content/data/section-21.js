// 第21章：偏移属性计算
window.cssContentData_Section21 = {
    section: {
        id: 21,
        title: "偏移属性计算",
        icon: "🎯",
        topics: [
            {
                id: "offset-properties",
                title: "偏移属性基础",
                type: "concept",
                content: {
                    description: "top、right、bottom、left四个偏移属性用于设置定位元素相对于其包含块的偏移距离。这些属性只对非static定位的元素有效。",
                    keyPoints: [
                        "偏移属性的值可以是长度、百分比或auto",
                        "百分比相对于包含块的对应方向尺寸计算",
                        "正值表示向包含块内部偏移，负值表示向外偏移",
                        "偏移属性不影响文档流中其他元素的布局",
                        "对于static定位的元素，偏移属性完全无效"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/top"
                }
            },
            {
                id: "offset-calculation",
                title: "偏移值计算规则",
                type: "principle",
                content: {
                    description: "偏移属性的计算涉及包含块尺寸、元素自身尺寸以及定位类型。不同定位方式下，偏移的计算基准和表现都不相同。",
                    mechanism: "对于absolute和fixed定位，偏移值相对于包含块的边界计算；对于relative定位，偏移值相对于元素自身的原始位置计算；对于sticky定位，偏移值定义了触发粘性效果的阈值。百分比偏移量的计算基于包含块的对应维度：top/bottom基于高度，left/right基于宽度。",
                    keyPoints: [
                        "absolute：相对包含块padding box的边界计算偏移",
                        "relative：相对自身原始位置计算，不改变文档流",
                        "fixed：相对视口边界计算（或最近的transform祖先）",
                        "百分比值：top/bottom相对包含块高度，left/right相对宽度",
                        "同时设置对边属性时，元素尺寸会被拉伸"
                    ]
                }
            },
            {
                id: "offset-conflicts",
                title: "偏移冲突处理",
                type: "principle",
                content: {
                    description: "当同时设置对边的偏移属性（如top和bottom，或left和right）时，会出现冲突情况。CSS有特定的规则来处理这些冲突。",
                    mechanism: "对于水平方向，在ltr（从左到右）的文档中，left优先级高于right；在rtl（从右到左）的文档中，right优先级高于left。对于垂直方向，top的优先级始终高于bottom。当两个对边都设置非auto值时，元素会被拉伸以同时满足两个约束。",
                    keyPoints: [
                        "水平冲突：ltr文档中left优先，rtl文档中right优先",
                        "垂直冲突：top始终优先于bottom",
                        "两个对边都设置时，元素尺寸会被拉伸填充空间",
                        "auto值会让位给明确指定的值",
                        "可以通过设置width/height限制拉伸行为"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "定位原理", url: "20-positioning.html" },
        next: { title: "浮动原理", url: "22-float.html" }
    }
};
