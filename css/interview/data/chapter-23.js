// 第23章：清除浮动 - 面试题（待完善）
window.cssQuizData_Chapter23 = {
    config: {
        title: "清除浮动",
        icon: "🧹",
        description: "清除浮动原理、BFC清除浮动方法",
        primaryColor: "#fa709a",
        bgGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    },
    questions: [
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["清除浮动"],
            question: "以下哪种方法不能清除浮动？",
            options: ["clear:both", "overflow:hidden", "display:flex", "position:static"],
            correctAnswer: "D",
            explanation: {
                title: "清除浮动方法",
                sections: [{
                    title: "正确答案",
                    content: "position:static是默认定位，不能清除浮动。前三种方法都可以：clear:both直接清除，overflow:hidden和display:flex创建BFC来包含浮动。"
                }]
            },
            source: "CSS浮动规范"
        }
    ],
    navigation: {
        prev: { title: "浮动原理", url: "22-float.html" },
        next: { title: "Flexbox布局算法", url: "24-flexbox-algorithm.html" }
    }
};
