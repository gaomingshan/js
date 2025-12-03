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
        }
    ],
    navigation: {
        prev: { title: "定位原理", url: "20-positioning.html" },
        next: { title: "浮动原理", url: "22-float.html" }
    }
};
