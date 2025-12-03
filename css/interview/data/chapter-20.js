// 第20章：定位原理 - 面试题（待完善）
window.cssQuizData_Chapter20 = {
    config: {
        title: "定位原理",
        icon: "📍",
        description: "static、relative、absolute、fixed、sticky定位机制",
        primaryColor: "#f093fb",
        bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    questions: [
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["定位基础"],
            question: "CSS中哪个定位值是元素的默认定位方式？",
            options: ["static", "relative", "absolute", "fixed"],
            correctAnswer: "A",
            explanation: {
                title: "默认定位",
                sections: [{
                    title: "正确答案",
                    content: "static是元素的默认定位方式，元素按照正常文档流布局，top/right/bottom/left/z-index属性无效。"
                }]
            },
            source: "CSS定位规范"
        }
    ],
    navigation: {
        prev: { title: "z-index详解", url: "19-z-index.html" },
        next: { title: "偏移属性计算", url: "21-offset-properties.html" }
    }
};
