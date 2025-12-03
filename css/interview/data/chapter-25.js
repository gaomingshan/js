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
        {type: "single-choice", difficulty: "easy", tags: ["flex简写"], question: "flex属性是哪三个属性的简写？", options: ["grow/shrink/basis", "direction/wrap/flow", "items/content/self", "start/center/end"], correctAnswer: "A", explanation: {title: "flex简写", sections: [{title: "正确答案", content: "flex是flex-grow、flex-shrink和flex-basis的简写属性。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "easy", tags: ["flex-grow"], question: "flex-grow:1的含义是？", options: ["固定宽度1px", "占比为1", "分配剩余空间的比例为1", "优先级为1"], correctAnswer: "C", explanation: {title: "flex-grow作用", sections: [{title: "正确答案", content: "flex-grow定义项目分配剩余空间的比例，值为1表示该项目会获得1份剩余空间。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "medium", tags: ["flex简写"], question: "flex:1等同于哪个完整写法？", options: ["flex:1 1 auto", "flex:1 1 0%", "flex:1 0 auto", "flex:1 1 100%"], correctAnswer: "B", explanation: {title: "flex:1展开", sections: [{title: "正确答案", content: "flex:1等同于flex:1 1 0%，表示可扩展和收缩，基础尺寸为0，完全根据grow比例分配空间。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "medium", tags: ["flex-basis"], question: "flex-basis:auto与flex-basis:0的区别是？", options: ["没有区别", "auto基于内容，0忽略内容", "auto固定，0弹性", "auto无效，0有效"], correctAnswer: "B", explanation: {title: "basis计算基准", sections: [{title: "正确答案", content: "auto以项目内容尺寸为基准，0则忽略内容尺寸，完全由flex-grow/shrink决定最终尺寸。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "medium", tags: ["flex-shrink"], question: "flex-shrink:0的作用是？", options: ["项目不收缩", "项目不扩展", "项目隐藏", "项目换行"], correctAnswer: "A", explanation: {title: "防止收缩", sections: [{title: "正确答案", content: "flex-shrink:0表示项目不参与收缩，空间不足时保持原始尺寸，可能导致溢出。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "medium", tags: ["flex关键字"], question: "flex:auto等同于什么？", options: ["flex:0 0 auto", "flex:1 1 auto", "flex:0 1 auto", "flex:1 0 auto"], correctAnswer: "B", explanation: {title: "flex:auto", sections: [{title: "正确答案", content: "flex:auto等同于flex:1 1 auto，项目可扩展可收缩，基础尺寸根据内容计算。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "hard", tags: ["flex计算"], question: "三个项目flex-grow分别为1、2、2，剩余空间300px，第一个项目会分配多少空间？", options: ["100px", "60px", "150px", "120px"], correctAnswer: "B", explanation: {title: "grow分配计算", sections: [{title: "正确答案", content: "总比例=1+2+2=5，第一个项目分配300×(1/5)=60px剩余空间。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "hard", tags: ["flex优先级"], question: "同时设置flex和width，哪个优先级更高？", options: ["width", "flex", "两者等同", "取决于值"], correctAnswer: "B", explanation: {title: "flex优先级", sections: [{title: "正确答案", content: "flex属性（特别是flex-basis）会覆盖width。但min-width/max-width仍会作为约束条件。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "hard", tags: ["flex-basis单位"], question: "flex-basis可以使用哪些单位？", options: ["只能用px", "只能用百分比", "可以用任何长度单位", "不能用单位"], correctAnswer: "C", explanation: {title: "basis单位", sections: [{title: "正确答案", content: "flex-basis可以使用任何CSS长度单位（px、em、%等）、auto或content关键字。"}]}, source: "CSS Flexbox规范"},
        {type: "multiple-choice", difficulty: "hard", tags: ["flex综合"], question: "关于flex属性，以下说法正确的是？（多选）", options: ["flex:none等于flex:0 0 auto", "flex-shrink默认值为1", "flex-basis支持calc()计算", "单独设置flex-grow会重置flex-basis为0"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "flex属性特性", sections: [{title: "正确答案", content: "四个都正确。flex:none固定尺寸；shrink默认1；basis支持calc；单独设grow会重置basis。"}]}, source: "CSS Flexbox规范"}
    ],
    navigation: {
        prev: { title: "Flexbox布局算法", url: "24-flexbox-algorithm.html" },
        next: { title: "Grid布局算法", url: "26-grid-algorithm.html" }
    }
};
