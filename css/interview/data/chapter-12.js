// 第12章：正常流 - 面试题（10题）
window.cssQuizData_Chapter12 = {
    config: {
        title: "正常流",
        icon: "🌊",
        description: "块级盒、行内盒、匿名盒",
        primaryColor: "#0ea5e9",
        bgGradient: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["正常流"], question: "正常流是指？", options: ["元素按文档顺序排列的默认布局", "浮动布局", "定位布局", "弹性布局"], correctAnswer: "A", explanation: {title: "正常流", sections: [{title: "定义", content: "正常流是CSS默认布局方式，元素按照在HTML中的顺序排列。"}]}},
        {type: "multiple-choice", difficulty: "easy", tags: ["脱离正常流"], question: "以下哪些会脱离正常流？", options: ["float", "position: absolute", "position: fixed", "position: relative"], correctAnswer: ["A", "B", "C"], explanation: {title: "脱离正常流", sections: [{title: "说明", content: "float、absolute、fixed会脱离正常流。relative仍在正常流中，只是视觉位置偏移。"}]}},
        {type: "true-false", difficulty: "easy", tags: ["块级盒"], question: "块级盒会独占一行。", correctAnswer: "A", explanation: {title: "正确", sections: [{title: "块级盒特性", content: "块级盒会在垂直方向排列，每个块级盒独占一行（除非设置float或inline-block）。"}]}},
        {type: "single-choice", difficulty: "medium", tags: ["行内盒"], question: "行内盒不能设置的属性是？", options: ["width和height", "padding", "margin", "color"], correctAnswer: "A", explanation: {title: "行内盒限制", sections: [{title: "说明", content: "行内盒不能设置width和height，宽高由内容决定。可以设置padding和左右margin，但垂直margin无效。"}]}},
        {type: "code-output", difficulty: "medium", tags: ["匿名盒"], question: "以下代码会产生几个匿名盒？", code: '<div>\n  Text1\n  <p>Para</p>\n  Text2\n</div>', options: ["2个", "1个", "0个", "3个"], correctAnswer: "A", explanation: {title: "匿名块盒", sections: [{title: "分析", content: "Text1和Text2各被一个匿名块盒包裹，共2个匿名盒。"}]}},
        {type: "multiple-choice", difficulty: "medium", tags: ["inline-block"], question: "inline-block的特点？", options: ["水平排列", "可以设置宽高", "有基线对齐问题", "独占一行"], correctAnswer: ["A", "B", "C"], explanation: {title: "inline-block", sections: [{title: "特性", content: "inline-block结合了inline和block的特点：水平排列但可设置宽高，会有基线对齐问题。"}]}},
        {type: "code-completion", difficulty: "medium", tags: ["vertical-align"], question: "如何解决inline-block底部空隙？", code: '.inline-block {\n  display: inline-block;\n  vertical-align: ______;\n}', options: ["top", "bottom", "baseline", "middle"], correctAnswer: "A", explanation: {title: "基线对齐", sections: [{title: "解决方案", content: "inline-block默认基线对齐，可用vertical-align: top/bottom/middle解决底部空隙。"}]}},
        {type: "true-false", difficulty: "hard", tags: ["匿名盒"], question: "匿名盒可以通过CSS选择器选中。", correctAnswer: "B", explanation: {title: "无法选中", sections: [{title: "错误", content: "匿名盒是浏览器自动生成的，无法通过任何CSS选择器选中，但会继承父元素的可继承属性。"}]}},
        {type: "multiple-choice", difficulty: "hard", tags: ["BFC"], question: "以下哪些会创建新的BFC？", options: ["float: left", "position: absolute", "overflow: hidden", "display: inline"], correctAnswer: ["A", "B", "C"], explanation: {title: "BFC触发", sections: [{title: "条件", content: "float、absolute/fixed定位、overflow非visible都会创建BFC。display: inline不会。"}]}},
        {type: "single-choice", difficulty: "hard", tags: ["containing block"], question: "正常流中，元素的包含块是？", options: ["最近的块级祖先的内容区", "父元素", "根元素", "视口"], correctAnswer: "A", explanation: {title: "包含块", sections: [{title: "规则", content: "正常流中（static/relative），包含块是最近的块级祖先元素的内容区（不含padding）。"}]}}
    ],
    navigation: {
        prev: { title: "第11章：包含块", url: "11-containing-block.html" },
        next: { title: "第13章：盒的生成与布局", url: "13-box-generation.html" }
    }
};
