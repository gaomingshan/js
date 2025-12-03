// 第11章：包含块 - 面试题（10题）
window.cssQuizData_Chapter11 = {
    config: {
        title: "包含块",
        icon: "📏",
        description: "包含块定义、不同定位的包含块",
        primaryColor: "#f97316",
        bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["包含块"], question: "包含块的作用是？", options: ["作为元素尺寸和位置计算的参照", "只影响元素的宽度", "只影响绝对定位元素", "没有实际作用"], correctAnswer: "A", explanation: {title: "包含块作用", sections: [{title: "说明", content: "包含块是元素尺寸（特别是百分比）和位置计算的参照框。"}]}},
        {type: "true-false", difficulty: "easy", tags: ["包含块"], question: "包含块一定是元素的父元素。", correctAnswer: "B", explanation: {title: "不一定", sections: [{title: "错误", content: "包含块不一定是父元素，取决于定位方式。如fixed定位的包含块是视口。"}]}},
        {type: "single-choice", difficulty: "easy", tags: ["static定位"], question: "static或relative定位的元素，其包含块是？", options: ["最近的块级祖先的内容区", "父元素", "视口", "根元素"], correctAnswer: "A", explanation: {title: "正常流", sections: [{title: "规则", content: "static和relative定位的包含块是最近的块级祖先元素的内容区。"}]}},
        {type: "single-choice", difficulty: "medium", tags: ["absolute定位"], question: "absolute定位元素的包含块是？", options: ["最近的非static定位祖先的padding区", "父元素", "视口", "根元素"], correctAnswer: "A", explanation: {title: "绝对定位", sections: [{title: "规则", content: "absolute定位的包含块是最近的position不为static的祖先元素的padding区。"}]}},
        {type: "code-output", difficulty: "medium", tags: ["百分比"], question: "padding: 10%相对于什么计算？", options: ["包含块的宽度", "包含块的高度", "元素自身宽度", "元素自身高度"], correctAnswer: "A", explanation: {title: "padding百分比", sections: [{title: "规则", content: "padding的百分比（包括上下左右）都相对于包含块的宽度计算，这是一个特殊规则。"}]}},
        {type: "multiple-choice", difficulty: "medium", tags: ["fixed定位"], question: "关于fixed定位的包含块，正确的是？", options: ["通常是视口", "transform祖先会改变包含块", "filter祖先会改变包含块", "始终是视口"], correctAnswer: ["A", "B", "C"], explanation: {title: "fixed包含块", sections: [{title: "例外", content: "fixed定位通常相对视口，但如果祖先有transform、filter等属性，包含块会变成该祖先。"}]}},
        {type: "code-completion", difficulty: "medium", tags: ["百分比高度"], question: "子元素height: 100%生效的条件？", code: ".parent { height: ____; }\\n.child { height: 100%; }", options: ["具体值（如500px）", "auto", "不设置", "inherit"], correctAnswer: "A", explanation: {title: "高度百分比", sections: [{title: "条件", content: "子元素的百分比高度要生效，包含块必须有明确的高度值，不能是auto。"}]}},
        {type: "true-false", difficulty: "hard", tags: ["transform影响"], question: "transform属性会改变absolute子元素的包含块。", correctAnswer: "A", explanation: {title: "正确", sections: [{title: "transform效应", content: "如果元素有transform（非none），它会成为absolute和fixed子元素的包含块，即使它是static定位。"}]}},
        {type: "multiple-choice", difficulty: "hard", tags: ["包含块属性"], question: "哪些属性会使元素成为包含块？", options: ["position: absolute/relative/fixed", "transform: translateX(0)", "filter: blur(1px)", "will-change: transform"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "创建包含块", sections: [{title: "全部正确", content: "position非static、transform、filter、will-change、perspective等都会创建包含块。"}]}},
        {type: "single-choice", difficulty: "hard", tags: ["初始包含块"], question: "初始包含块（ICB）是？", options: ["视口大小的矩形", "html元素", "body元素", "浏览器窗口"], correctAnswer: "A", explanation: {title: "ICB", sections: [{title: "定义", content: "初始包含块（Initial Containing Block）是一个视口大小的矩形，是根元素（html）的包含块。"}]}}
    ],
    navigation: {
        prev: { title: "第10章：单位与值转换", url: "10-units.html" },
        next: { title: "第12章：正常流", url: "12-normal-flow.html" }
    }
};
