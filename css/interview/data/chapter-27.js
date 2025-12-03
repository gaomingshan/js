// 第27章：Grid对齐与放置 - 面试题（待完善）
window.cssQuizData_Chapter27 = {
    config: {
        title: "Grid对齐与放置",
        icon: "🎚️",
        description: "对齐算法、自动放置算法详解",
        primaryColor: "#43e97b",
        bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
    questions: [
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["Grid对齐"],
            question: "justify-items和align-items在Grid中分别控制什么？",
            options: ["行内轴和块轴", "主轴和交叉轴", "水平和垂直", "列和行"],
            correctAnswer: "A",
            explanation: {
                title: "Grid对齐属性",
                sections: [{
                    title: "正确答案",
                    content: "justify-items控制行内轴（inline axis）对齐，align-items控制块轴（block axis）对齐。在水平书写模式下，行内轴是水平的，块轴是垂直的。"
                }]
            },
            source: "CSS Grid规范"
        }
    ],
    navigation: {
        prev: { title: "Grid布局算法", url: "26-grid-algorithm.html" },
        next: { title: "媒体查询原理", url: "28-media-queries.html" }
    }
};
