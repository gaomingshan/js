// 第29章：响应式单位 - 面试题（待完善）
window.cssQuizData_Chapter29 = {
    config: {
        title: "响应式单位",
        icon: "📏",
        description: "viewport单位、rem/em计算、clamp()函数",
        primaryColor: "#667eea",
        bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    questions: [
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["响应式单位"],
            question: "1vw等于视口宽度的多少？",
            options: ["1%", "10%", "100%", "视具体情况而定"],
            correctAnswer: "A",
            explanation: {
                title: "vw单位",
                sections: [{
                    title: "正确答案",
                    content: "1vw等于视口宽度的1%，即vw = viewport width / 100。"
                }]
            },
            source: "CSS单位规范"
        }
    ],
    navigation: {
        prev: { title: "媒体查询原理", url: "28-media-queries.html" },
        next: null
    }
};
