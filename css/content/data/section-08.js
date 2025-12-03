// 第8章：继承机制
window.cssContentData_Section08 = {
    section: {
        id: 8,
        title: "继承机制",
        icon: "🧬",
        topics: [
            {
                id: "inheritance-intro",
                title: "CSS继承原理",
                type: "concept",
                content: {
                    description: "CSS继承允许子元素继承父元素的某些属性值，减少代码重复。",
                    keyPoints: [
                        "继承是指子元素自动获得父元素的某些属性值",
                        "只有部分属性可继承（主要是文本相关）",
                        "继承的值优先级最低",
                        "可通过inherit关键字强制继承",
                        "继承简化了样式定义"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/inheritance"
                }
            },
            {
                id: "inheritable-properties",
                title: "可继承属性",
                type: "comparison",
                content: {
                    description: "并非所有CSS属性都可以继承。",
                    items: [
                        {name: "字体属性", code: "font-family, font-size, font-weight, line-height", pros: ["可继承"], cons: []},
                        {name: "文本属性", code: "color, text-align, text-indent, letter-spacing", pros: ["可继承"], cons: []},
                        {name: "盒模型", code: "width, height, margin, padding, border", pros: [], cons: ["不可继承"]},
                        {name: "布局属性", code: "display, position, float, flex", pros: [], cons: ["不可继承"]}
                    ]
                }
            },
            {
                id: "inherit-keywords",
                title: "继承关键字",
                type: "code-example",
                content: {
                    description: "CSS提供了控制继承的关键字。",
                    examples: [
                        {title: "inherit", code: '.child {\n  color: inherit; /* 强制继承父元素的color */\n}', result: "强制继承"},
                        {title: "initial", code: '.element {\n  color: initial; /* 重置为CSS规范的初始值 */\n}', result: "重置为初始值"},
                        {title: "unset", code: '.element {\n  color: unset; /* 可继承属性用inherit，否则用initial */\n}', result: "智能重置"},
                        {title: "revert", code: '.element {\n  color: revert; /* 重置为用户代理样式 */\n}', result: "恢复默认"}
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第7章：层叠算法", url: "07-cascade.html" },
        next: { title: "第9章：样式值计算", url: "09-computed-values.html" }
    }
};
