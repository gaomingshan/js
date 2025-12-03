// 第26章：Grid布局算法 - 面试题（待完善）
window.cssQuizData_Chapter26 = {
    config: {
        title: "Grid布局算法",
        icon: "🔲",
        description: "网格轨道大小、fr单位、auto-fill/auto-fit",
        primaryColor: "#4facfe",
        bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    questions: [
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["Grid基础"],
            question: "Grid布局中，fr单位表示什么？",
            options: ["固定像素", "百分比", "可用空间的分数", "字体大小"],
            correctAnswer: "C",
            explanation: {
                title: "fr单位",
                sections: [{
                    title: "正确答案",
                    content: "fr单位表示可用空间的分数（fraction），用于在Grid布局中按比例分配剩余空间。"
                }]
            },
            source: "CSS Grid规范"
        }
    ],
    navigation: {
        prev: { title: "Flex属性详解", url: "25-flex-properties.html" },
        next: { title: "Grid对齐与放置", url: "27-grid-alignment.html" }
    }
};
