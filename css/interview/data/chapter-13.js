// 第13章：盒的生成与布局 - 面试题（10题）
window.cssQuizData_Chapter13 = {
    config: {
        title: "盒的生成与布局",
        icon: "🎁",
        description: "display对盒生成的影响",
        primaryColor: "#a855f7",
        bgGradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["display"], question: "display: none的效果是？", options: ["不生成盒，不占空间", "生成盒但不可见", "占空间但不可见", "只隐藏内容"], correctAnswer: "A", explanation: {title: "display: none", sections: [{title: "说明", content: "display: none不会生成盒，元素完全从布局中移除，不占任何空间。"}]}},
        {type: "multiple-choice", difficulty: "easy", tags: ["display类型"], question: "以下哪些是块级display值？", options: ["block", "flex", "grid", "inline"], correctAnswer: ["A", "B", "C"], explanation: {title: "块级值", sections: [{title: "说明", content: "block、flex、grid都生成块级盒，在垂直方向排列。inline生成行内盒。"}]}},
        {type: "true-false", difficulty: "easy", tags: ["visibility"], question: "visibility: hidden不占空间。", correctAnswer: "B", explanation: {title: "错误", sections: [{title: "区别", content: "visibility: hidden元素不可见但仍占据空间。display: none才不占空间。"}]}},
        {type: "code-output", difficulty: "medium", tags: ["inline-block"], question: "inline-block元素之间为什么有间隙？", options: ["HTML中的空白符被渲染", "CSS默认margin", "浏览器bug", "字体大小影响"], correctAnswer: "A", explanation: {title: "空白符", sections: [{title: "原因", content: "HTML中元素之间的换行、空格被当作空白符渲染成间隙。解决方法：父元素font-size: 0或元素写在一行。"}]}},
        {type: "single-choice", difficulty: "medium", tags: ["display新语法"], question: "display: block flow中，block是？", options: ["外部显示类型", "内部显示类型", "布局模式", "盒类型"], correctAnswer: "A", explanation: {title: "新语法", sections: [{title: "说明", content: "新语法：display: <外部> <内部>。block是外部显示类型（如何在父容器中排列），flow是内部显示类型（内部内容如何布局）。"}]}},
        {type: "multiple-choice", difficulty: "medium", tags: ["display对比"], question: "关于display: none和visibility: hidden，正确的是？", options: ["none不占空间，hidden占空间", "none不触发事件，hidden可以", "none影响子元素，hidden可被子元素覆盖", "none性能更好"], correctAnswer: ["A", "B", "C"], explanation: {title: "对比", sections: [{title: "区别", content: "none完全移除，hidden占位且可被子元素的visibility: visible覆盖。"}]}},
        {type: "code-completion", difficulty: "medium", tags: ["隐藏元素"], question: "如何隐藏元素但仍能被屏幕阅读器访问？", code: '.sr-only {\n  position: ______;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n}', options: ["absolute", "fixed", "relative", "static"], correctAnswer: "A", explanation: {title: "可访问性隐藏", sections: [{title: "方法", content: "用absolute定位移出屏幕或设置极小尺寸，避免用display: none，保证可访问性。"}]}},
        {type: "true-false", difficulty: "hard", tags: ["display继承"], question: "display属性可以被继承。", correctAnswer: "B", explanation: {title: "不可继承", sections: [{title: "错误", content: "display不是可继承属性，每个元素有独立的display值。"}]}},
        {type: "multiple-choice", difficulty: "hard", tags: ["display影响"], question: "哪些属性会使float失效？", options: ["display: flex", "display: inline-block", "position: absolute", "display: grid"], correctAnswer: ["A", "C", "D"], explanation: {title: "float失效", sections: [{title: "规则", content: "flex、grid容器的子元素以及绝对定位元素的float会被忽略。inline-block不影响。"}]}},
        {type: "single-choice", difficulty: "hard", tags: ["contents"], question: "display: contents的效果是？", options: ["元素的盒被移除，子元素提升", "只显示内容区", "显示所有内容", "无效果"], correctAnswer: "A", explanation: {title: "contents", sections: [{title: "说明", content: "display: contents使元素的盒消失，其子元素就像父元素不存在一样参与布局，常用于消除不必要的包装元素。"}]}}
    ],
    navigation: {
        prev: { title: "第12章：正常流", url: "12-normal-flow.html" },
        next: { title: "第14章：BFC", url: "14-bfc.html" }
    }
};
