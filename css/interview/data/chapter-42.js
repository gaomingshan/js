// 第42章：计算函数 - 面试题
window.cssQuizData_Chapter42 = {
    config: {
        title: "计算函数",
        icon: "🔢",
        description: "calc()、min()、max()、clamp()",
        primaryColor: "#4facfe",
        bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["calc基础"], question: "calc()的作用是？", options: ["计算颜色", "计算长度值", "计算时间", "计算数值"], correctAnswer: "B", explanation: {title: "calc函数", sections: [{title: "正确答案", content: "calc()用于计算CSS长度值，可以混合不同单位，如width: calc(100% - 20px)。支持+、-、*、/运算。"}]}, source: "CSS Values and Units"},
        {type: "single-choice", difficulty: "easy", tags: ["min函数"], question: "min(100px, 50%)会选择什么？", options: ["100px", "50%", "两者中较小的", "两者中较大的"], correctAnswer: "C", explanation: {title: "min函数", sections: [{title: "正确答案", content: "min()返回多个值中的最小值。会在运行时计算，如果50%小于100px就选50%，否则选100px。常用于响应式设计。"}]}, source: "CSS Values and Units Level 4"},
        {type: "single-choice", difficulty: "medium", tags: ["calc运算符"], question: "calc(10px+5px)有效吗？", options: ["有效", "无效，运算符两侧需要空格", "有效但不推荐", "取决于浏览器"], correctAnswer: "B", explanation: {title: "calc语法", sections: [{title: "正确答案", content: "calc()的+和-运算符两侧必须有空格。应该写calc(10px + 5px)。*和/不强制要求空格，但推荐添加以提高可读性。"}]}, source: "CSS Values and Units"},
        {type: "single-choice", difficulty: "medium", tags: ["clamp函数"], question: "clamp(10px, 5vw, 50px)表示什么？", options: ["固定10px", "固定50px", "5vw，但不小于10px不大于50px", "随机值"], correctAnswer: "C", explanation: {title: "clamp函数", sections: [{title: "正确答案", content: "clamp(最小值, 首选值, 最大值)返回限制在最小和最大值之间的首选值。是响应式设计的强大工具，相当于max(最小值, min(首选值, 最大值))。"}]}, source: "CSS Values and Units Level 4"},
        {type: "single-choice", difficulty: "medium", tags: ["max函数"], question: "max(10px, 20px, 30px)返回什么？", options: ["10px", "20px", "30px", "60px"], correctAnswer: "C", explanation: {title: "max函数", sections: [{title: "正确答案", content: "max()返回多个值中的最大值，这里是30px。可以接受任意数量的参数，常用于设置最小尺寸限制。"}]}, source: "CSS Values and Units Level 4"},
        {type: "single-choice", difficulty: "medium", tags: ["calc嵌套"], question: "calc()可以嵌套吗？", options: ["不可以", "可以", "只能一层", "只在某些属性"], correctAnswer: "B", explanation: {title: "calc嵌套", sections: [{title: "正确答案", content: "calc()可以嵌套，如calc(calc(100% / 2) - 10px)。也可以嵌套min/max/clamp，如calc(100% - max(10px, 5%))。"}]}, source: "CSS Values and Units"},
        {type: "single-choice", difficulty: "hard", tags: ["calc除法"], question: "calc(100% / 3)中除数可以是百分比吗？", options: ["可以", "不可以，除数必须是无单位数值", "只在某些属性", "取决于被除数"], correctAnswer: "B", explanation: {title: "除法限制", sections: [{title: "正确答案", content: "calc()中除法的除数必须是无单位数值。calc(100% / 3)正确，calc(100% / 3%)错误。这是为了避免单位转换的歧义。"}]}, source: "CSS Values and Units"},
        {type: "single-choice", difficulty: "hard", tags: ["性能对比"], question: "calc()会影响性能吗？", options: ["不影响", "略微影响", "严重影响", "只在动画时"], correctAnswer: "B", explanation: {title: "calc性能", sections: [{title: "正确答案", content: "calc()需要运行时计算，有轻微性能开销，但通常可以忽略。在动画中频繁重计算时可能有影响。现代浏览器对calc()优化良好。"}]}, source: "CSS性能优化"},
        {type: "single-choice", difficulty: "hard", tags: ["单位混合"], question: "calc(1em + 10px)有效吗？", options: ["无效，单位必须相同", "有效，会转换单位", "只在某些属性有效", "取决于浏览器"], correctAnswer: "B", explanation: {title: "单位混合", sections: [{title: "正确答案", content: "calc()可以混合不同单位，浏览器会在计算时转换。这是calc()的强大之处，可以实现预处理器无法做到的运行时计算。"}]}, source: "CSS Values and Units"},
        {type: "multiple-choice", difficulty: "hard", tags: ["计算函数综合"], question: "关于CSS计算函数，以下说法正确的是？（多选）", options: ["可以用于任何接受长度的属性", "可以与CSS变量结合", "支持四则运算", "min/max/clamp是CSS4新特性"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "计算函数特性", sections: [{title: "正确答案", content: "四个都正确。计算函数支持所有长度属性，可以与CSS变量结合，支持四则运算，min/max/clamp是CSS Values Level 4引入的。"}]}, source: "CSS Values and Units"}
    ],
    navigation: {
        prev: { title: "动态主题实现", url: "41-theme-implementation.html" },
        next: { title: "图形函数", url: "43-shape-functions.html" }
    }
};
