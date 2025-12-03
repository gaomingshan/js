// 第30章：渲染树构建 - 面试题
window.cssQuizData_Chapter30 = {
    config: {
        title: "渲染树构建",
        icon: "🌲",
        description: "DOM + CSSOM → Render Tree",
        primaryColor: "#667eea",
        bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["渲染树基础"], question: "渲染树由什么组成？", options: ["只有DOM", "只有CSSOM", "DOM和CSSOM的结合", "HTML和CSS"], correctAnswer: "C", explanation: {title: "渲染树构建", sections: [{title: "正确答案", content: "渲染树（Render Tree）由DOM树和CSSOM树合并而成，包含页面上所有可见元素及其样式信息。"}]}, source: "浏览器渲染原理"},
        {type: "single-choice", difficulty: "easy", tags: ["可见元素"], question: "以下哪个元素不会出现在渲染树中？", options: ["div", "display:none的元素", "visibility:hidden的元素", "opacity:0的元素"], correctAnswer: "B", explanation: {title: "渲染树节点", sections: [{title: "正确答案", content: "display:none的元素不会构建渲染树节点。visibility:hidden和opacity:0的元素仍在渲染树中，只是不可见。"}]}, source: "浏览器渲染原理"},
        {type: "single-choice", difficulty: "medium", tags: ["渲染树构建"], question: "CSSOM构建完成前，页面会渲染吗？", options: ["会", "不会", "部分渲染", "取决于浏览器"], correctAnswer: "B", explanation: {title: "CSS阻塞渲染", sections: [{title: "正确答案", content: "CSSOM构建会阻塞渲染。浏览器必须等待CSS文件加载并构建完CSSOM后，才能构建渲染树并渲染页面，避免FOUC（无样式内容闪烁）。"}]}, source: "浏览器渲染原理"},
        {type: "single-choice", difficulty: "medium", tags: ["渲染对象"], question: "渲染树中的节点称为什么？", options: ["DOM节点", "CSS节点", "渲染对象/帧", "布局节点"], correctAnswer: "C", explanation: {title: "渲染对象", sections: [{title: "正确答案", content: "渲染树中的节点称为渲染对象（Render Object）或帧（Frame），包含可见元素的几何信息和样式信息。"}]}, source: "浏览器渲染原理"},
        {type: "single-choice", difficulty: "medium", tags: ["伪元素"], question: "::before和::after伪元素在哪里生成？", options: ["DOM树", "CSSOM树", "渲染树", "布局树"], correctAnswer: "C", explanation: {title: "伪元素生成", sections: [{title: "正确答案", content: "伪元素不在DOM树中，而是在构建渲染树时根据CSSOM生成，成为渲染树的一部分。"}]}, source: "CSS伪元素规范"},
        {type: "single-choice", difficulty: "medium", tags: ["渲染阻塞"], question: "JavaScript会阻塞渲染树构建吗？", options: ["不会", "会，因为可能修改DOM和CSSOM", "只阻塞DOM", "只阻塞CSSOM"], correctAnswer: "B", explanation: {title: "JS阻塞渲染", sections: [{title: "正确答案", content: "JavaScript执行会阻塞DOM解析和渲染树构建，因为JS可能修改DOM和样式。这就是为什么script标签建议放在body底部或使用async/defer。"}]}, source: "浏览器渲染原理"},
        {type: "single-choice", difficulty: "hard", tags: ["渲染树优化"], question: "渲染树构建时，浏览器如何处理大量不可见元素？", options: ["全部构建", "跳过display:none", "延迟构建", "批量处理"], correctAnswer: "B", explanation: {title: "构建优化", sections: [{title: "正确答案", content: "浏览器在构建渲染树时会跳过display:none的元素及其子元素，因为它们不需要渲染。这是一种重要的性能优化。"}]}, source: "浏览器渲染优化"},
        {type: "single-choice", difficulty: "hard", tags: ["渲染树与DOM树"], question: "渲染树和DOM树的节点数量关系是？", options: ["完全相同", "渲染树更少", "渲染树更多", "不确定"], correctAnswer: "D", explanation: {title: "节点数量对比", sections: [{title: "正确答案", content: "渲染树可能更少（display:none元素不在渲染树中）或更多（伪元素、匿名盒子等在渲染树中但不在DOM中）。"}]}, source: "浏览器渲染原理"},
        {type: "single-choice", difficulty: "hard", tags: ["匿名盒子"], question: "什么是匿名盒子（Anonymous Box）？", options: ["没有class的元素", "不可见的元素", "渲染树中无对应DOM节点的盒子", "临时元素"], correctAnswer: "C", explanation: {title: "匿名盒子", sections: [{title: "正确答案", content: "匿名盒子是渲染树中存在但DOM中不存在的盒子，用于包裹行内元素、table布局中的匿名单元格等。"}]}, source: "CSS Box Model"},
        {type: "multiple-choice", difficulty: "hard", tags: ["渲染树综合"], question: "关于渲染树，以下说法正确的是？（多选）", options: ["渲染树包含页面所有可见元素", "head元素不在渲染树中", "渲染树构建需要等待所有CSS加载", "渲染树构建后页面立即可见"], correctAnswer: ["A", "B", "C"], explanation: {title: "渲染树特性", sections: [{title: "正确答案", content: "A、B、C正确。D错误：渲染树构建后还需要布局（Layout）和绘制（Paint）才能显示页面。"}]}, source: "浏览器渲染原理"}
    ],
    navigation: {
        prev: { title: "响应式单位", url: "29-responsive-units.html" },
        next: { title: "布局与绘制", url: "31-layout-paint.html" }
    }
};
