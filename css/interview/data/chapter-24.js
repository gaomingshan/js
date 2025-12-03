// 第24章：Flexbox布局算法 - 面试题（待完善）
window.cssQuizData_Chapter24 = {
    config: {
        title: "Flexbox布局算法",
        icon: "📐",
        description: "主轴交叉轴、弹性计算、对齐算法",
        primaryColor: "#667eea",
        bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    questions: [
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["Flex基础"],
            question: "flex-direction:column时，主轴方向是？",
            options: ["从左到右", "从右到左", "从上到下", "从下到上"],
            correctAnswer: "C",
            explanation: {
                title: "Flex主轴方向",
                sections: [{
                    title: "正确答案",
                    content: "flex-direction:column时，主轴方向是从上到下（垂直方向），交叉轴是水平方向。"
                }]
            },
            source: "CSS Flexbox规范"
        }
    ],
    navigation: {
        prev: { title: "清除浮动", url: "23-clearing-float.html" },
        next: { title: "Flex属性详解", url: "25-flex-properties.html" }
    }
};
