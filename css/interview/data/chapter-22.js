// 第22章：浮动原理 - 面试题（待完善）
window.cssQuizData_Chapter22 = {
    config: {
        title: "浮动原理",
        icon: "🌊",
        description: "浮动规则、高度塌陷、浮动的包含块",
        primaryColor: "#43e97b",
        bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
    questions: [
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["浮动基础"],
            question: "浮动元素会脱离文档流吗？",
            options: ["完全脱离", "部分脱离", "不脱离", "取决于浮动方向"],
            correctAnswer: "B",
            explanation: {
                title: "浮动的文档流影响",
                sections: [{
                    title: "正确答案",
                    content: "浮动元素部分脱离文档流，它不再占据空间，但仍会影响行内内容的布局，形成文字环绕效果。"
                }]
            },
            source: "CSS浮动规范"
        }
    ],
    navigation: {
        prev: { title: "偏移属性计算", url: "21-offset-properties.html" },
        next: { title: "清除浮动", url: "23-clearing-float.html" }
    }
};
