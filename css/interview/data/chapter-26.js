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
        {type: "single-choice", difficulty: "easy", tags: ["Grid基础"], question: "Grid布局中，fr单位表示什么？", options: ["固定像素", "百分比", "可用空间的分数", "字体大小"], correctAnswer: "C", explanation: {title: "fr单位", sections: [{title: "正确答案", content: "fr单位表示可用空间的分数（fraction），用于在Grid布局中按比例分配剩余空间。"}]}, source: "CSS Grid规范"},
        {type: "single-choice", difficulty: "easy", tags: ["网格线"], question: "3列网格有多少条网格线？", options: ["2条", "3条", "4条", "6条"], correctAnswer: "C", explanation: {title: "网格线数量", sections: [{title: "正确答案", content: "N列网格有N+1条垂直网格线。3列网格有4条垂直网格线（编号1-4），加上水平网格线。"}]}, source: "CSS Grid规范"},
        {type: "single-choice", difficulty: "medium", tags: ["repeat函数"], question: "repeat(3, 1fr)等同于什么？", options: ["3fr", "1fr 1fr 1fr", "repeat(1fr, 3)", "1fr * 3"], correctAnswer: "B", explanation: {title: "repeat展开", sections: [{title: "正确答案", content: "repeat(3, 1fr)是grid-template-columns: 1fr 1fr 1fr的简写，创建3个等宽列。"}]}, source: "CSS Grid规范"},
        {type: "single-choice", difficulty: "medium", tags: ["auto-fill"], question: "auto-fill和auto-fit的区别是？", options: ["没有区别", "auto-fill保留空轨道", "auto-fit保留空轨道", "auto-fill性能更好"], correctAnswer: "B", explanation: {title: "auto-fill vs auto-fit", sections: [{title: "正确答案", content: "auto-fill保留空的重复轨道，auto-fit会折叠空轨道使其宽度为0。在有剩余空间时表现不同。"}]}, source: "CSS Grid规范"},
        {type: "single-choice", difficulty: "medium", tags: ["minmax"], question: "minmax(100px, 1fr)的含义是？", options: ["最小100px，最大1fr", "固定100px或1fr", "平均100px到1fr", "100px加1fr"], correctAnswer: "A", explanation: {title: "minmax函数", sections: [{title: "正确答案", content: "minmax(min, max)定义轨道尺寸范围，最小100px，最大为1个fr单位（可增长）。"}]}, source: "CSS Grid规范"},
        {type: "single-choice", difficulty: "medium", tags: ["隐式网格"], question: "隐式网格是如何产生的？", options: ["grid-template定义的", "项目超出显式网格时自动创建", "grid-auto创建的", "浏览器默认生成"], correctAnswer: "B", explanation: {title: "隐式网格", sections: [{title: "正确答案", content: "当网格项目放置在显式网格之外时，浏览器会自动创建隐式网格轨道。grid-auto-rows/columns控制隐式轨道尺寸。"}]}, source: "CSS Grid规范"},
        {type: "single-choice", difficulty: "hard", tags: ["fr计算"], question: "grid-template-columns: 100px 1fr 2fr，容器宽度500px，第二列宽度是？", options: ["133px", "100px", "200px", "150px"], correctAnswer: "A", explanation: {title: "fr分配计算", sections: [{title: "正确答案", content: "剩余空间=500-100=400px，总fr=3，第二列=400×(1/3)≈133px。"}]}, source: "CSS Grid规范"},
        {type: "single-choice", difficulty: "hard", tags: ["网格项目放置"], question: "grid-column: 1 / 3表示什么？", options: ["第1列和第3列", "从第1列到第3列", "第1列或第3列", "第1、2、3列"], correctAnswer: "B", explanation: {title: "网格线跨越", sections: [{title: "正确答案", content: "grid-column: 1 / 3表示从第1条网格线到第3条网格线，跨越2列（第1列和第2列）。"}]}, source: "CSS Grid规范"},
        {type: "single-choice", difficulty: "hard", tags: ["grid-auto-flow"], question: "grid-auto-flow: dense的作用是？", options: ["增加密度", "填充空隙", "压缩网格", "删除空白"], correctAnswer: "B", explanation: {title: "dense算法", sections: [{title: "正确答案", content: "dense关键字让自动放置算法尝试填充网格中较早出现的空隙，可能改变项目的视觉顺序。"}]}, source: "CSS Grid规范"},
        {type: "multiple-choice", difficulty: "hard", tags: ["Grid综合"], question: "关于Grid，以下说法正确的是？（多选）", options: ["fr单位在分配前会排除固定尺寸", "可以用负数网格线索引", "grid-gap不影响网格容器尺寸", "Grid项目可以重叠"], correctAnswer: ["A", "B", "D"], explanation: {title: "Grid特性", sections: [{title: "正确答案", content: "A、B、D正确。C错误：grid-gap会增加容器尺寸。负数索引从末尾开始计数。"}]}, source: "CSS Grid规范"}
    ],
    navigation: {
        prev: { title: "Flex属性详解", url: "25-flex-properties.html" },
        next: { title: "Grid对齐与放置", url: "27-grid-alignment.html" }
    }
};
