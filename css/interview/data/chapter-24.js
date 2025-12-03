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
                sections: [{title: "正确答案", content: "flex-direction:column时，主轴方向是从上到下（垂直方向），交叉轴是水平方向。"}]
            },
            source: "CSS Flexbox规范"
        },
        {type: "single-choice", difficulty: "easy", tags: ["Flex容器"], question: "display:flex会将子元素转换为什么？", options: ["块级元素", "内联元素", "flex项目", "grid项目"], correctAnswer: "C", explanation: {title: "Flex项目", sections: [{title: "正确答案", content: "设置display:flex后，子元素会成为flex项目（flex item），按flex布局规则排列。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "medium", tags: ["主轴对齐"], question: "justify-content控制的是哪个轴的对齐？", options: ["主轴", "交叉轴", "两个轴", "取决于方向"], correctAnswer: "A", explanation: {title: "主轴对齐", sections: [{title: "正确答案", content: "justify-content控制主轴（main axis）上flex项目的对齐方式，align-items控制交叉轴（cross axis）。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "medium", tags: ["flex-wrap"], question: "flex-wrap:wrap的作用是？", options: ["强制单行", "允许换行", "反向换行", "禁止换行"], correctAnswer: "B", explanation: {title: "flex换行", sections: [{title: "正确答案", content: "flex-wrap:wrap允许flex项目在主轴方向换行；nowrap（默认）强制单行；wrap-reverse反向换行。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "medium", tags: ["交叉轴"], question: "单行flex容器中，align-items:stretch的效果是？", options: ["项目居中", "项目拉伸填满交叉轴", "项目顶部对齐", "项目底部对齐"], correctAnswer: "B", explanation: {title: "stretch拉伸", sections: [{title: "正确答案", content: "align-items:stretch（默认值）会使flex项目在交叉轴方向拉伸以填满容器高度（如果项目未设置高度）。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "medium", tags: ["多行对齐"], question: "align-content属性对什么情况有效？", options: ["单行flex容器", "多行flex容器", "所有flex容器", "grid容器"], correctAnswer: "B", explanation: {title: "align-content作用", sections: [{title: "正确答案", content: "align-content只对多行flex容器有效（flex-wrap:wrap），控制多行在交叉轴上的分布。单行容器中该属性无效。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "hard", tags: ["flex方向"], question: "flex-direction:row-reverse会影响哪些属性的行为？", options: ["只影响排列顺序", "影响排列和对齐", "不影响任何属性", "只影响margin"], correctAnswer: "B", explanation: {title: "reverse影响", sections: [{title: "正确答案", content: "row-reverse会反转主轴方向，影响flex-start/flex-end的含义，也影响order排序和margin:auto的行为。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "hard", tags: ["flex基线"], question: "align-items:baseline时，flex项目按什么对齐？", options: ["顶部边缘", "底部边缘", "第一行文字基线", "中心点"], correctAnswer: "C", explanation: {title: "基线对齐", sections: [{title: "正确答案", content: "baseline对齐会将所有flex项目的第一行文字基线对齐，常用于包含文字的项目保持文本对齐。"}]}, source: "CSS Flexbox规范"},
        {type: "single-choice", difficulty: "hard", tags: ["flex算法"], question: "flex项目的最终尺寸计算顺序是？", options: ["min/max → flex-basis → flex-grow/shrink", "flex-basis → min/max → flex-grow/shrink", "flex-basis → flex-grow/shrink → min/max", "flex-grow/shrink → flex-basis → min/max"], correctAnswer: "C", explanation: {title: "尺寸计算顺序", sections: [{title: "正确答案", content: "Flex布局算法：1.确定flex-basis；2.根据grow/shrink分配剩余/压缩空间；3.应用min-width/max-width约束。"}]}, source: "CSS Flexbox规范"},
        {type: "multiple-choice", difficulty: "hard", tags: ["flex综合"], question: "关于Flexbox，以下说法正确的是？（多选）", options: ["flex项目的margin不会合并", "flex项目可以使用order改变视觉顺序", "float对flex项目无效", "vertical-align对flex项目无效"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "Flex特性", sections: [{title: "正确答案", content: "四个选项都正确。Flex项目margin不合并，order控制顺序，float和vertical-align在flex项目上失效。"}]}, source: "CSS Flexbox规范"}
    ],
    navigation: {
        prev: { title: "清除浮动", url: "23-clearing-float.html" },
        next: { title: "Flex属性详解", url: "25-flex-properties.html" }
    }
};
