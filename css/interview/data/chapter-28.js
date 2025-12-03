// 第28章：媒体查询原理 - 面试题（待完善）
window.cssQuizData_Chapter28 = {
    config: {
        title: "媒体查询原理",
        icon: "📱",
        description: "媒体类型、媒体特性、断点设计策略",
        primaryColor: "#fa709a",
        bgGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    },
    questions: [
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["媒体查询"],
            question: "@media screen and (min-width: 768px)中，min-width是什么？",
            options: ["媒体类型", "媒体特性", "逻辑运算符", "断点值"],
            correctAnswer: "B",
            explanation: {
                title: "媒体查询组成",
                sections: [{
                    title: "正确答案",
                    content: "min-width是媒体特性，用于描述设备或环境的特征。screen是媒体类型，and是逻辑运算符，768px是特性值。"
                }]
            },
            source: "CSS媒体查询规范"
        }
    ],
    navigation: {
        prev: { title: "Grid对齐与放置", url: "27-grid-alignment.html" },
        next: { title: "响应式单位", url: "29-responsive-units.html" }
    }
};
