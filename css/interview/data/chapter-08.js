// 第8章：继承机制 - 面试题（10题）
window.cssQuizData_Chapter08 = {
    config: {
        title: "继承机制",
        icon: "🧬",
        description: "可继承属性、inherit/initial/unset",
        primaryColor: "#f59e0b",
        bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    questions: [
        {type: "true-false", difficulty: "easy", tags: ["继承"], question: "所有CSS属性都可以继承。", correctAnswer: "B", explanation: {title: "部分继承", sections: [{title: "错误", content: "只有部分属性可继承，主要是字体、文本、颜色等。盒模型和布局属性不可继承。"}]}},
        {type: "multiple-choice", difficulty: "easy", tags: ["可继承属性"], question: "以下哪些属性可以继承？", options: ["color", "font-size", "width", "text-align"], correctAnswer: ["A", "B", "D"], explanation: {title: "可继承", sections: [{title: "规则", content: "color、font-size、text-align可继承。width不可继承。"}]}},
        {type: "single-choice", difficulty: "easy", tags: ["inherit"], question: "inherit关键字的作用？", options: ["强制继承父元素的值", "使用初始值", "使用浏览器默认值", "取消继承"], correctAnswer: "A", explanation: {title: "inherit", sections: [{title: "作用", content: "inherit强制元素继承父元素的指定属性值。"}]}},
        {type: "single-choice", difficulty: "medium", tags: ["initial"], question: "initial关键字将属性值设置为？", options: ["CSS规范定义的初始值", "浏览器默认值", "父元素的值", "空值"], correctAnswer: "A", explanation: {title: "initial", sections: [{title: "说明", content: "initial将属性重置为CSS规范定义的初始值，不是浏览器默认值。"}]}},
        {type: "code-output", difficulty: "medium", tags: ["继承"], question: "以下代码子元素的font-size？", code: '.parent { font-size: 20px; }\n.child { /* 没有设置font-size */ }', options: ["20px", "16px", "取决于浏览器", "0"], correctAnswer: "A", explanation: {title: "继承", sections: [{title: "结果", content: "font-size可继承，子元素继承父元素的20px。"}]}},
        {type: "single-choice", difficulty: "medium", tags: ["unset"], question: "unset关键字的行为？", options: ["可继承属性用inherit，否则用initial", "总是用inherit", "总是用initial", "使用浏览器默认值"], correctAnswer: "A", explanation: {title: "unset", sections: [{title: "智能重置", content: "unset对可继承属性表现为inherit，对不可继承属性表现为initial。"}]}},
        {type: "multiple-choice", difficulty: "medium", tags: ["不可继承"], question: "以下哪些属性不可继承？", options: ["width", "padding", "border", "color"], correctAnswer: ["A", "B", "C"], explanation: {title: "不可继承", sections: [{title: "规则", content: "盒模型属性（width、padding、border）不可继承。color可继承。"}]}},
        {type: "true-false", difficulty: "hard", tags: ["继承优先级"], question: "继承的样式优先级低于直接定义的样式。", correctAnswer: "A", explanation: {title: "优先级", sections: [{title: "正确", content: "即使直接定义的样式特异性为0（如*），也优先于继承的样式。"}]}},
        {type: "single-choice", difficulty: "hard", tags: ["currentColor"], question: "currentColor关键字继承的是？", options: ["当前元素的color值", "父元素的color值", "根元素的color值", "浏览器默认color"], correctAnswer: "A", explanation: {title: "currentColor", sections: [{title: "说明", content: "currentColor代表当前元素的color计算值，常用于border、box-shadow等。"}]}},
        {type: "code-completion", difficulty: "hard", tags: ["all属性"], question: "如何重置元素的所有属性？", code: '.reset {\n  ______: unset;\n}', options: ["all", "reset", "properties", "everything"], correctAnswer: "A", explanation: {title: "all属性", sections: [{title: "用法", content: "all: unset重置所有属性。all可以取inherit、initial、unset、revert。"}]}}
    ],
    navigation: {
        prev: { title: "第7章：层叠算法", url: "07-cascade.html" },
        next: { title: "第9章：样式值计算", url: "09-computed-values.html" }
    }
};
