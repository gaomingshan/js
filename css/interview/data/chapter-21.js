// 第21章：偏移属性计算 - 面试题（待完善）
window.cssQuizData_Chapter21 = {
    config: {
        title: "偏移属性计算",
        icon: "🎯",
        description: "top、right、bottom、left计算规则",
        primaryColor: "#4facfe",
        bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    questions: [
        // Q1-Q2: 简单题
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["偏移属性"],
            question: "absolute定位的偏移属性是相对于什么计算的？",
            options: ["视口", "父元素", "最近的非static定位祖先", "body元素"],
            correctAnswer: "C",
            explanation: {
                title: "absolute偏移参考",
                sections: [{
                    title: "正确答案",
                    content: "absolute定位的偏移属性相对于最近的非static定位祖先元素的padding box计算。"
                }]
            },
            source: "CSS定位规范"
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["偏移基础"],
            question: "对于static定位的元素，设置top/left属性会有效果吗？",
            options: ["有效", "无效", "有时有效", "取决于父元素"],
            correctAnswer: "B",
            explanation: {
                title: "static定位限制",
                sections: [{
                    title: "正确答案",
                    content: "static是默认定位，top/right/bottom/left偏移属性对static定位的元素完全无效。只有非static定位（relative/absolute/fixed/sticky）的元素才能使用偏移属性。"
                }]
            },
            source: "CSS定位规范"
        },

        // Q3-Q6: 中等题
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["百分比偏移"],
            question: "absolute元素设置top:50%，这个50%相对于什么计算？",
            options: ["包含块的宽度", "包含块的高度", "元素自身高度", "视口高度"],
            correctAnswer: "B",
            explanation: {
                title: "偏移百分比计算",
                sections: [{
                    title: "正确答案",
                    content: "top和bottom的百分比值相对于包含块的高度计算，left和right的百分比值相对于包含块的宽度计算。"
                }]
            },
            source: "CSS定位规范"
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["偏移冲突"],
            question: "同时设置top:0和bottom:0会发生什么？",
            options: ["bottom无效", "top无效", "元素被拉伸", "两者都无效"],
            correctAnswer: "C",
            explanation: {
                title: "对边偏移冲突",
                sections: [{
                    title: "正确答案",
                    content: "当同时设置top和bottom（或left和right）时，元素会被拉伸以同时满足两个约束，除非设置了width/height限制。"
                }]
            },
            source: "CSS定位规范"
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["relative偏移"],
            question: "relative定位元素设置top:20px，其他元素的布局会受影响吗？",
            options: ["会", "不会", "有时会", "取决于z-index"],
            correctAnswer: "B",
            explanation: {
                title: "relative偏移不影响布局",
                sections: [{
                    title: "正确答案",
                    content: "relative定位的元素偏移后，原本占据的空间仍然保留，其他元素的布局不受影响。元素只是视觉上发生了位移。"
                }]
            },
            source: "CSS定位规范"
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["偏移计算"],
            question: "fixed元素设置right:10%，这个10%相对于什么？",
            options: ["父元素宽度", "body宽度", "视口宽度", "html宽度"],
            correctAnswer: "C",
            explanation: {
                title: "fixed偏移参考",
                sections: [{
                    title: "正确答案",
                    content: "fixed定位元素的偏移百分比相对于视口（viewport）计算，除非有transform等属性改变了包含块。"
                }]
            },
            source: "CSS定位规范"
        },

        // Q7-Q10: 困难题
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["偏移优先级"],
            question: "在ltr文档中，同时设置left:0和right:0，哪个生效？",
            options: ["left", "right", "都生效（拉伸）", "都不生效"],
            correctAnswer: "C",
            explanation: {
                title: "对边偏移处理",
                sections: [{
                    title: "正确答案",
                    content: "当同时设置left和right时，在没有width约束的情况下，元素会被拉伸以同时满足两者。如果设置了width，在ltr中left优先，在rtl中right优先。"
                }]
            },
            source: "CSS定位规范"
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["负偏移"],
            question: "absolute元素设置top:-10px的效果是？",
            options: ["向下移动10px", "向上移动10px", "无效", "报错"],
            correctAnswer: "B",
            explanation: {
                title: "负值偏移",
                sections: [{
                    title: "正确答案",
                    content: "偏移属性可以使用负值。top:-10px表示元素顶边在包含块顶边上方10px的位置，即向上移动。负值常用于让元素部分超出包含块。"
                }]
            },
            source: "CSS定位规范"
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["auto值"],
            question: "absolute元素只设置left:0，right为auto，width也为auto，元素宽度会如何？",
            options: ["填满包含块", "内容宽度", "0", "100%"],
            correctAnswer: "B",
            explanation: {
                title: "auto值的计算",
                sections: [{
                    title: "正确答案",
                    content: "当只设置一个方向的偏移，其他为auto时，元素会根据内容自适应宽度（shrink-to-fit），不会自动填满包含块。"
                }]
            },
            source: "CSS定位规范"
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["偏移综合"],
            question: "以下哪些说法正确？（多选）",
            options: [
                "top的百分比相对于包含块高度",
                "sticky的top定义粘性阈值，不是偏移量",
                "relative的偏移会脱离文档流",
                "同时设置四个偏移可以控制元素尺寸"
            ],
            correctAnswer: ["A", "B", "D"],
            explanation: {
                title: "偏移属性综合",
                sections: [{
                    title: "正确答案",
                    content: "A、B、D正确。C错误：relative偏移不脱离文档流，原空间保留。"
                }]
            },
            source: "CSS定位规范"
        }
    ],
    navigation: {
        prev: { title: "定位原理", url: "20-positioning.html" },
        next: { title: "浮动原理", url: "22-float.html" }
    }
};
