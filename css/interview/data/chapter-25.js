// 第25章：Flex属性详解 - 面试题（待完善）
window.cssQuizData_Chapter25 = {
    config: {
        title: "Flex属性详解",
        icon: "🔧",
        description: "flex-grow、flex-shrink、flex-basis计算规则",
        primaryColor: "#f093fb",
        bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    questions: [
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["Flex属性"],
            question: "flex:1等同于哪个完整写法？",
            options: ["flex:1 1 auto", "flex:1 1 0%", "flex:1 0 auto", "flex:1 1 100%"],
            correctAnswer: "B",
            explanation: {
                title: "flex简写",
                sections: [{
                    title: "正确答案",
                    content: "flex:1等同于flex:1 1 0%，表示项目可以扩展和收缩，基础尺寸为0，会完全根据flex-grow比例分配空间。"
                }]
            },
            source: "CSS Flexbox规范"
        }
    ],
    navigation: {
        prev: { title: "Flexbox布局算法", url: "24-flexbox-algorithm.html" },
        next: { title: "Grid布局算法", url: "26-grid-algorithm.html" }
    }
};
