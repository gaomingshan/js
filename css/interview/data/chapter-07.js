// 第7章：层叠算法详解 - 面试题（10题）
window.cssQuizData_Chapter07 = {
    config: {
        title: "层叠算法详解",
        icon: "🔗",
        description: "层叠规则、来源优先级、!important",
        primaryColor: "#ec4899",
        bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["层叠"], question: "层叠算法比较规则的第一优先级是？", options: ["来源和重要性", "特异性", "顺序", "继承"], correctAnswer: "A", explanation: {title: "层叠顺序", sections: [{title: "优先级", content: "层叠算法：来源和重要性 > 特异性 > 顺序"}]}},
        {type: "true-false", difficulty: "easy", tags: ["!important"], question: "!important可以提升声明的优先级。", correctAnswer: "A", explanation: {title: "!important", sections: [{title: "正确", content: "!important将声明提升到最高优先级，但用户!important优先于作者!important。"}]}},
        {type: "single-choice", difficulty: "easy", tags: ["样式来源"], question: "以下样式来源优先级最低的是？", options: ["用户代理样式", "用户样式", "作者样式", "内联样式"], correctAnswer: "A", explanation: {title: "来源", sections: [{title: "顺序", content: "浏览器默认 < 用户 < 作者 < 内联"}]}},
        {type: "code-output", difficulty: "medium", tags: ["层叠"], question: "以下代码最终文字颜色？", code: '.text { color: red; }\n.text { color: blue; }', options: ["blue", "red", "black", "取决于浏览器"], correctAnswer: "A", explanation: {title: "顺序规则", sections: [{title: "后者优先", content: "特异性相同时，后定义的规则覆盖先定义的。"}]}},
        {type: "multiple-choice", difficulty: "medium", tags: ["!important"], question: "关于!important，正确的是？", options: ["会破坏层叠的自然规则", "应该尽量避免使用", "只能用另一个!important覆盖", "用户!important优先于作者!important"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "!important特性", sections: [{title: "全部正确", content: "!important破坏层叠规则，难以维护，应避免使用。用户!important优先级最高。"}]}},
        {type: "single-choice", difficulty: "medium", tags: ["特异性"], question: "特异性相同时，决定因素是？", options: ["定义顺序", "选择器长度", "文件大小", "浏览器版本"], correctAnswer: "A", explanation: {title: "顺序", sections: [{title: "规则", content: "特异性相同时，后定义的规则优先级更高。"}]}},
        {type: "code-completion", difficulty: "medium", tags: ["层叠"], question: "如何覆盖!important声明？", code: 'color: red !important;\n/* 覆盖方法 */\ncolor: blue ______;', options: ["!important", "!!important", "override", "force"], correctAnswer: "A", explanation: {title: "覆盖", sections: [{title: "方法", content: "只能用另一个!important（且特异性更高或顺序更后）覆盖。"}]}},
        {type: "true-false", difficulty: "hard", tags: ["内联样式"], question: "内联样式的!important优先级最高。", correctAnswer: "B", explanation: {title: "用户优先", sections: [{title: "错误", content: "用户样式的!important优先于任何作者样式（包括内联样式的!important）。"}]}},
        {type: "multiple-choice", difficulty: "hard", tags: ["层叠上下文"], question: "层叠算法考虑哪些因素？", options: ["样式来源", "重要性（!important）", "特异性（Specificity）", "定义顺序"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "层叠因素", sections: [{title: "全部", content: "层叠算法综合考虑来源、重要性、特异性、顺序四个因素。"}]}},
        {type: "single-choice", difficulty: "hard", tags: ["继承vs层叠"], question: "继承的样式和层叠的样式冲突时？", options: ["层叠的样式优先", "继承的样式优先", "取决于特异性", "取决于顺序"], correctAnswer: "A", explanation: {title: "层叠优先", sections: [{title: "规则", content: "直接应用的样式（即使特异性为0）也优先于继承的样式。"}]}}
    ],
    navigation: {
        prev: { title: "第6章：样式表加载", url: "06-stylesheet-loading.html" },
        next: { title: "第8章：继承机制", url: "08-inheritance.html" }
    }
};
