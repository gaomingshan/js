// 第9章：样式值计算过程
window.cssContentData_Section09 = {
    section: {
        id: 9,
        title: "样式值计算过程",
        icon: "⚙️",
        topics: [
            {
                id: "value-stages",
                title: "值的计算阶段",
                type: "principle",
                content: {
                    description: "CSS属性值从声明到最终使用经历6个阶段的转换。",
                    mechanism: "每个阶段将上一阶段的值进一步精确化，直到得到可用于布局和绘制的实际值。",
                    steps: [
                        "1. 声明值（Declared Value）：CSS中声明的原始值",
                        "2. 层叠值（Cascaded Value）：层叠算法后的胜出值",
                        "3. 指定值（Specified Value）：确定后的值（层叠值或继承值或初始值）",
                        "4. 计算值（Computed Value）：相对值转为绝对值（如em→px）",
                        "5. 使用值（Used Value）：布局计算后的实际值（如auto→具体px）",
                        "6. 实际值（Actual Value）：浏览器能渲染的最终值（如小数→整数）"
                    ],
                    code: '/* 示例 */\nwidth: 50%; /* 声明值 */\n/* 假设父元素宽度400px */\n/* 计算值: 50% */\n/* 使用值: 200px */\n/* 实际值: 200px */'
                }
            },
            {
                id: "computed-value",
                title: "计算值（Computed Value）",
                type: "concept",
                content: {
                    description: "计算值是尽可能不依赖布局的绝对值，但可能仍包含相对单位。",
                    keyPoints: [
                        "相对单位转换为绝对值（如em转px）",
                        "url()转换为绝对路径",
                        "关键字保持不变（如auto）",
                        "百分比通常保持不变",
                        "getComputedStyle()返回计算值"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/computed_value"
                }
            },
            {
                id: "used-value",
                title: "使用值（Used Value）",
                type: "comparison",
                content: {
                    description: "使用值是布局计算后的最终数值，所有相对值都已解析。",
                    items: [
                        {name: "计算值", code: "width: 50%", pros: ["保留相对值", "不依赖布局"], cons: ["可能还需计算"]},
                        {name: "使用值", code: "width: 200px", pros: ["绝对数值", "可直接使用"], cons: ["依赖布局计算"]}
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第8章：继承机制", url: "08-inheritance.html" },
        next: { title: "第10章：单位与值转换", url: "10-units.html" }
    }
};
