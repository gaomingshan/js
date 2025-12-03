// 第14章：BFC - 面试题（10题）
window.cssQuizData_Chapter14 = {
    config: {
        title: "BFC块级格式化上下文",
        icon: "🔲",
        description: "BFC触发、特性、应用场景",
        primaryColor: "#ef4444",
        bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["BFC"], question: "BFC是什么？", options: ["块级格式化上下文", "块级浮动容器", "块级布局容器", "块级盒模型"], correctAnswer: "A", explanation: {title: "BFC", sections: [{title: "定义", content: "BFC（Block Formatting Context）是一个独立的渲染区域，有自己的布局规则。"}]}},
        {type: "multiple-choice", difficulty: "easy", tags: ["触发BFC"], question: "以下哪些可以触发BFC？", options: ["overflow: hidden", "float: left", "position: absolute", "display: block"], correctAnswer: ["A", "B", "C"], explanation: {title: "触发条件", sections: [{title: "常见方法", content: "overflow非visible、浮动、绝对定位、display: flow-root/flex/grid等都可触发BFC。display: block不触发。"}]}},
        {type: "true-false", difficulty: "easy", tags: ["BFC特性"], question: "BFC内的元素margin不会与外部元素合并。", correctAnswer: "A", explanation: {title: "正确", sections: [{title: "特性", content: "BFC是独立的布局区域，内部margin不会与外部发生合并。"}]}},
        {type: "single-choice", difficulty: "medium", tags: ["清除浮动"], question: "BFC如何清除浮动？", options: ["计算高度时包含浮动元素", "强制浮动元素下沉", "取消浮动效果", "浮动元素自动清除"], correctAnswer: "A", explanation: {title: "清除浮动", sections: [{title: "原理", content: "BFC在计算高度时会包含内部的浮动元素，从而解决高度塌陷问题。"}]}},
        {type: "code-output", difficulty: "medium", tags: ["margin合并"], question: "如何阻止两个div之间的margin合并？", options: ["给其中一个创建BFC", "设置padding", "设置border", "以上都可以"], correctAnswer: "D", explanation: {title: "阻止合并", sections: [{title: "方法", content: "创建BFC、添加padding、添加border都可以阻止margin合并。"}]}},
        {type: "multiple-choice", difficulty: "medium", tags: ["BFC应用"], question: "BFC可以解决哪些问题？", options: ["浮动高度塌陷", "margin合并", "自适应两栏布局", "元素居中"], correctAnswer: ["A", "B", "C"], explanation: {title: "应用场景", sections: [{title: "用途", content: "BFC可清除浮动、阻止margin合并、实现自适应布局。元素居中需要其他方法。"}]}},
        {type: "code-completion", difficulty: "medium", tags: ["flow-root"], question: "最推荐的创建BFC方法？", code: '.bfc {\n  display: ______;\n}', options: ["flow-root", "block", "inline-block", "flex"], correctAnswer: "A", explanation: {title: "flow-root", sections: [{title: "推荐", content: "display: flow-root是专门用来创建BFC的，没有副作用，推荐使用。"}]}},
        {type: "true-false", difficulty: "hard", tags: ["BFC与浮动"], question: "BFC区域不会与浮动元素重叠。", correctAnswer: "A", explanation: {title: "正确", sections: [{title: "特性", content: "BFC的区域不会与同级浮动元素重叠，可用于实现自适应两栏布局。"}]}},
        {type: "multiple-choice", difficulty: "hard", tags: ["格式化上下文"], question: "以下哪些会创建格式化上下文？", options: ["overflow: hidden (BFC)", "display: flex (FFC)", "display: grid (GFC)", "display: inline (IFC)"], correctAnswer: ["A", "B", "C"], explanation: {title: "格式化上下文", sections: [{title: "类型", content: "BFC（块级）、FFC（弹性）、GFC（网格）、IFC（行内）是四种格式化上下文。inline参与IFC但不创建。"}]}},
        {type: "single-choice", difficulty: "hard", tags: ["BFC布局规则"], question: "BFC内相邻块级盒的垂直margin会？", options: ["发生合并", "不合并", "取决于overflow", "相加"], correctAnswer: "A", explanation: {title: "BFC内部", sections: [{title: "规则", content: "BFC内部的块级盒仍遵循正常流规则，垂直margin会合并。BFC只是阻止与外部的合并。"}]}}
    ],
    navigation: {
        prev: { title: "第13章：盒的生成", url: "13-box-generation.html" },
        next: { title: "第15章：IFC", url: "15-ifc.html" }
    }
};
