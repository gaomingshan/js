// 第10章：单位与值转换 - 面试题（10题）
window.cssQuizData_Chapter10 = {
    config: {
        title: "单位与值转换",
        icon: "📐",
        description: "绝对单位、相对单位、百分比、calc()",
        primaryColor: "#14b8a6",
        bgGradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["单位"], question: "px是什么类型的单位？", options: ["绝对单位", "相对单位", "百分比单位", "视口单位"], correctAnswer: "A", explanation: {title: "px", sections: [{title: "类型", content: "px是绝对单位，大小固定，不随其他因素变化。"}]}},
        {type: "multiple-choice", difficulty: "easy", tags: ["相对单位"], question: "以下哪些是相对单位？", options: ["em", "rem", "vw", "px"], correctAnswer: ["A", "B", "C"], explanation: {title: "相对单位", sections: [{title: "列表", content: "em、rem、vw/vh、%都是相对单位。px是绝对单位。"}]}},
        {type: "true-false", difficulty: "easy", tags: ["rem"], question: "rem相对于根元素（html）的font-size。", correctAnswer: "A", explanation: {title: "rem", sections: [{title: "正确", content: "rem（root em）相对于根元素的font-size，1rem = 根元素font-size。"}]}},
        {type: "code-output", difficulty: "medium", tags: ["em"], question: "以下代码padding的计算值？", code: '.element {\n  font-size: 20px;\n  padding: 2em;\n}', options: ["40px", "32px", "20px", "2em"], correctAnswer: "A", explanation: {title: "em计算", sections: [{title: "规则", content: "非font-size属性的em相对于元素自身的font-size。2em * 20px = 40px。"}]}},
        {type: "single-choice", difficulty: "medium", tags: ["vw/vh"], question: "100vw表示？", options: ["视口宽度的100%", "父元素宽度的100%", "根元素宽度的100%", "屏幕宽度的100%"], correctAnswer: "A", explanation: {title: "vw", sections: [{title: "定义", content: "vw（viewport width）相对于视口宽度，100vw = 视口宽度的100%。"}]}},
        {type: "code-output", difficulty: "medium", tags: ["calc"], question: "calc(100% - 50px)的作用？", options: ["父元素宽度减去50px", "100%或50px中的较小值", "150%", "语法错误"], correctAnswer: "A", explanation: {title: "calc", sections: [{title: "计算", content: "calc()可以混合不同单位进行计算，结果是父元素宽度减50px。"}]}},
        {type: "multiple-choice", difficulty: "medium", tags: ["百分比"], question: "关于百分比单位，正确的是？", options: ["width的%相对于父元素width", "height的%相对于父元素height", "padding的%相对于父元素width", "font-size的%相对于父元素font-size"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "百分比参照", sections: [{title: "全部正确", content: "注意：padding和margin的%都相对于父元素的width（包括垂直方向）。"}]}},
        {type: "true-false", difficulty: "hard", tags: ["em嵌套"], question: "em单位会累积计算（多层嵌套时）。", correctAnswer: "A", explanation: {title: "em累积", sections: [{title: "正确", content: "每层的em都相对于父元素font-size，会累积。如父16px，子1.5em=24px，孙1.5em=36px。这是em的缺点，rem不会累积。"}]}},
        {type: "single-choice", difficulty: "hard", tags: ["calc高级"], question: "calc()中必须在运算符两侧加空格的是？", options: ["+ 和 -", "* 和 /", "所有运算符", "不需要空格"], correctAnswer: "A", explanation: {title: "calc语法", sections: [{title: "规则", content: "+ 和 - 运算符两侧必须有空格，否则会被解析为正负号。* 和 / 可以不加空格。"}]}},
        {type: "code-completion", difficulty: "hard", tags: ["viewport单位"], question: "如何让元素占满整个视口？", code: '.fullscreen {\n  width: ______;\n  height: ______;\n}', options: ["100vw; 100vh", "100%; 100%", "100vw; 100%", "100%; 100vh"], correctAnswer: "A", explanation: {title: "全屏", sections: [{title: "方法", content: "100vw和100vh确保占满整个视口。100%依赖于父元素尺寸，可能不够。"}]}}
    ],
    navigation: {
        prev: { title: "第9章：样式值计算", url: "09-computed-values.html" },
        next: { title: "第11章：包含块", url: "11-containing-block.html" }
    }
};
