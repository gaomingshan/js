// 第33章：transform与opacity优化 - 面试题
window.cssQuizData_Chapter33 = {
    config: {
        title: "transform与opacity优化",
        icon: "⚡",
        description: "为什么不触发重排重绘",
        primaryColor: "#43e97b",
        bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["transform基础"], question: "transform会触发重排（Reflow）吗？", options: ["会", "不会", "有时会", "取决于变换类型"], correctAnswer: "B", explanation: {title: "transform不触发重排", sections: [{title: "正确答案", content: "transform不会触发重排，因为它在合成层上进行，不影响文档流中其他元素的布局。"}]}, source: "CSS Transforms"},
        {type: "single-choice", difficulty: "easy", tags: ["opacity基础"], question: "opacity会触发重绘（Repaint）吗？", options: ["会", "不会", "有时会", "取决于值"], correctAnswer: "B", explanation: {title: "opacity不触发重绘", sections: [{title: "正确答案", content: "opacity变化不会触发重绘，因为它在合成层上处理，直接由GPU合成，性能最佳。"}]}, source: "CSS opacity"},
        {type: "single-choice", difficulty: "medium", tags: ["性能对比"], question: "用transform还是left实现移动动画？", options: ["left性能更好", "transform性能更好", "性能一样", "取决于距离"], correctAnswer: "B", explanation: {title: "动画性能", sections: [{title: "正确答案", content: "transform: translate()性能远优于改变left，因为transform不触发重排重绘，在合成线程上运行。"}]}, source: "Web动画性能"},
        {type: "single-choice", difficulty: "medium", tags: ["硬件加速"], question: "transform: translateZ(0)的作用是？", options: ["3D移动", "强制硬件加速", "视觉效果", "浏览器hack"], correctAnswer: "B", explanation: {title: "强制硬件加速", sections: [{title: "正确答案", content: "translateZ(0)创建3D渲染上下文，强制提升到合成层并启用GPU加速，但应谨慎使用以避免层爆炸。"}]}, source: "CSS 3D Transforms"},
        {type: "single-choice", difficulty: "medium", tags: ["transform-origin"], question: "transform-origin会影响性能吗？", options: ["不影响", "略微影响", "严重影响", "取决于值"], correctAnswer: "A", explanation: {title: "transform-origin性能", sections: [{title: "正确答案", content: "transform-origin只改变变换的参考点，不影响性能。变换仍在合成层上进行。"}]}, source: "CSS Transforms"},
        {type: "single-choice", difficulty: "medium", tags: ["动画属性选择"], question: "实现淡入淡出，用opacity还是visibility？", options: ["opacity", "visibility", "一样", "取决于场景"], correctAnswer: "A", explanation: {title: "淡入淡出最佳实践", sections: [{title: "正确答案", content: "opacity可以GPU加速且支持过渡动画。visibility是离散属性，不能平滑过渡。通常用opacity实现淡入淡出。"}]}, source: "Web动画最佳实践"},
        {type: "single-choice", difficulty: "hard", tags: ["合成属性"], question: "为什么只有少数CSS属性可以GPU加速？", options: ["技术限制", "这些属性不影响布局", "只是偶然", "浏览器策略"], correctAnswer: "B", explanation: {title: "GPU加速条件", sections: [{title: "正确答案", content: "只有不影响布局的属性（transform、opacity等）可以在合成层独立处理，无需重新布局和绘制，因此可以GPU加速。"}]}, source: "浏览器渲染原理"},
        {type: "single-choice", difficulty: "hard", tags: ["transform限制"], question: "transform应用在inline元素上会生效吗？", options: ["会", "不会", "部分生效", "转为block后生效"], correctAnswer: "D", explanation: {title: "transform与display", sections: [{title: "正确答案", content: "transform应用在inline元素上，元素的display计算值会变为block，然后transform生效。类似于float的行为。"}]}, source: "CSS Transforms"},
        {type: "single-choice", difficulty: "hard", tags: ["性能陷阱"], question: "频繁修改transform会有性能问题吗？", options: ["不会", "会，因为重绘", "会，因为重排", "可能，取决于频率"], correctAnswer: "D", explanation: {title: "高频更新性能", sections: [{title: "正确答案", content: "虽然transform不触发重排重绘，但极高频率的更新（如每毫秒）仍可能超过GPU处理能力。应使用requestAnimationFrame节流。"}]}, source: "Web动画性能"},
        {type: "multiple-choice", difficulty: "hard", tags: ["优化综合"], question: "关于transform和opacity优化，以下说法正确的是？（多选）", options: ["不触发Layout和Paint", "在合成线程上运行", "可以结合will-change使用", "所有浏览器都支持GPU加速"], correctAnswer: ["A", "B", "C"], explanation: {title: "优化特性", sections: [{title: "正确答案", content: "A、B、C正确。D错误：GPU加速需要硬件和驱动支持，老设备可能不支持。"}]}, source: "浏览器性能优化"}
    ],
    navigation: {
        prev: { title: "图层与合成", url: "32-layer-composite.html" },
        next: { title: "Transition与Animation原理", url: "34-transition-animation.html" }
    }
};
