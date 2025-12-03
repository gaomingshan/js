// 第9章：样式值计算过程 - 面试题（10题）
window.cssQuizData_Chapter09 = {
    config: {
        title: "样式值计算过程",
        icon: "⚙️",
        description: "声明值→计算值→使用值→实际值",
        primaryColor: "#06b6d4",
        bgGradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["值阶段"], question: "CSS值计算的第一个阶段是？", options: ["声明值", "层叠值", "计算值", "使用值"], correctAnswer: "A", explanation: {title: "阶段", sections: [{title: "顺序", content: "声明值 → 层叠值 → 指定值 → 计算值 → 使用值 → 实际值"}]}},
        {type: "true-false", difficulty: "easy", tags: ["计算值"], question: "getComputedStyle()返回的是使用值。", correctAnswer: "B", explanation: {title: "计算值", sections: [{title: "错误", content: "getComputedStyle()返回计算值，不是使用值。计算值可能还包含相对单位或auto等关键字。"}]}},
        {type: "single-choice", difficulty: "easy", tags: ["使用值"], question: "使用值的特点是？", options: ["所有相对值都已解析为绝对值", "可能包含百分比", "可能包含auto", "保留em单位"], correctAnswer: "A", explanation: {title: "使用值", sections: [{title: "特点", content: "使用值是布局计算后的绝对数值，不包含任何相对值或关键字。"}]}},
        {type: "code-output", difficulty: "medium", tags: ["计算值"], question: "以下代码的计算值是？", code: '.element {\n  font-size: 16px;\n  padding: 2em;\n}', options: ["padding: 32px", "padding: 2em", "padding: auto", "无法确定"], correctAnswer: "A", explanation: {title: "em转换", sections: [{title: "计算", content: "计算值阶段会将em转换为px。2em * 16px = 32px。"}]}},
        {type: "multiple-choice", difficulty: "medium", tags: ["指定值"], question: "指定值可能来源于？", options: ["层叠值", "继承值", "初始值", "使用值"], correctAnswer: ["A", "B", "C"], explanation: {title: "指定值来源", sections: [{title: "三个来源", content: "指定值 = 层叠值（如果有）或 继承值（可继承属性）或 初始值（默认值）"}]}},
        {type: "single-choice", difficulty: "medium", tags: ["实际值"], question: "实际值与使用值的区别？", options: ["实际值是浏览器能渲染的值", "实际值包含小数", "实际值包含百分比", "没有区别"], correctAnswer: "A", explanation: {title: "实际值", sections: [{title: "调整", content: "实际值是浏览器能实际渲染的值，如小数可能被四舍五入为整数。"}]}},
        {type: "code-completion", difficulty: "medium", tags: ["getComputedStyle"], question: "如何获取元素的计算值？", code: 'const style = ______(element);', options: ["window.getComputedStyle", "element.getStyle", "document.getStyle", "element.computedStyle"], correctAnswer: "A", explanation: {title: "API", sections: [{title: "方法", content: "window.getComputedStyle(element)返回元素所有属性的计算值。"}]}},
        {type: "true-false", difficulty: "hard", tags: ["百分比"], question: "计算值阶段会将所有百分比转换为绝对值。", correctAnswer: "B", explanation: {title: "百分比保留", sections: [{title: "错误", content: "计算值通常保留百分比，在使用值阶段才转换为绝对值（依赖布局）。"}]}},
        {type: "multiple-choice", difficulty: "hard", tags: ["计算值特点"], question: "关于计算值，正确的是？", options: ["相对单位转为绝对值", "url()转为绝对路径", "百分比通常保留", "auto等关键字保留"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "计算值特性", sections: [{title: "全部正确", content: "计算值转换相对单位和url，但保留百分比和关键字（这些需要布局信息）。"}]}},
        {type: "single-choice", difficulty: "hard", tags: ["层叠值"], question: "如果一个属性没有任何声明，其指定值是？", options: ["继承值（可继承）或初始值", "空值", "undefined", "浏览器默认值"], correctAnswer: "A", explanation: {title: "指定值确定", sections: [{title: "规则", content: "无声明时：可继承属性使用继承值，不可继承属性使用初始值。"}]}}
    ],
    navigation: {
        prev: { title: "第8章：继承机制", url: "08-inheritance.html" },
        next: { title: "第10章：单位与值转换", url: "10-units.html" }
    }
};
