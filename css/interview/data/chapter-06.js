// 第6章：样式表加载与阻塞 - 面试题（10题）
window.cssQuizData_Chapter06 = {
    config: {
        title: "样式表加载与阻塞",
        icon: "📊",
        description: "CSS加载时机、渲染阻塞、关键CSS",
        primaryColor: "#8b5cf6",
        bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
    },
    questions: [
        {type: "true-false", difficulty: "easy", tags: ["CSS阻塞"], question: "CSS会阻塞HTML的解析。", correctAnswer: "B", explanation: {title: "不阻塞", sections: [{title: "说明", content: "CSS不会阻塞HTML解析，但会阻塞渲染。浏览器可以边下载CSS边解析HTML。"}]}},
        {type: "single-choice", difficulty: "easy", tags: ["渲染阻塞"], question: "CSS被称为渲染阻塞资源的原因？", options: ["必须等CSS加载完才能渲染", "阻塞HTML解析", "阻塞图片加载", "阻塞DOM构建"], correctAnswer: "A", explanation: {title: "渲染阻塞", sections: [{title: "原因", content: "浏览器需要CSSOM和DOM才能构建渲染树，所以CSS加载会阻塞渲染。"}]}},
        {type: "single-choice", difficulty: "easy", tags: ["关键CSS"], question: "关键CSS指的是？", options: ["首屏渲染必需的CSS", "所有CSS", "最重要的CSS", "最大的CSS文件"], correctAnswer: "A", explanation: {title: "关键CSS", sections: [{title: "定义", content: "关键CSS是首屏内容渲染所必需的最小CSS集合。"}]}},
        {type: "multiple-choice", difficulty: "medium", tags: ["CSS与JS"], question: "CSS对JavaScript的影响？", options: ["CSS会阻塞后续script标签执行", "async脚本不受CSS影响", "内联script会被CSS阻塞", "defer脚本不受CSS影响"], correctAnswer: ["A", "C"], explanation: {title: "CSS阻塞JS", sections: [{title: "原因", content: "因为JS可能访问CSSOM，所以CSS会阻塞后续JS执行。async和defer脚本不受影响。"}]}},
        {type: "code-output", difficulty: "medium", tags: ["媒体查询"], question: "以下哪个CSS不会阻塞渲染？", code: '<link rel="stylesheet" href="A.css">\n<link rel="stylesheet" href="B.css" media="print">', options: ["B.css", "A.css", "都会阻塞", "都不阻塞"], correctAnswer: "A", explanation: {title: "media属性", sections: [{title: "说明", content: "media='print'的样式表只在打印时使用，不会阻塞屏幕渲染。"}]}},
        {type: "single-choice", difficulty: "medium", tags: ["preload"], question: "rel='preload'的作用？", options: ["提前加载资源但不阻塞渲染", "预加载并立即应用", "延迟加载", "条件加载"], correctAnswer: "A", explanation: {title: "preload", sections: [{title: "用途", content: "preload提前加载资源，但不会立即应用，不阻塞渲染，适合异步加载CSS。"}]}},
        {type: "code-completion", difficulty: "medium", tags: ["异步CSS"], question: "如何异步加载CSS？", code: '<link rel="______" href="style.css" as="style" onload="this.rel=\'stylesheet\'">', options: ["preload", "async", "defer", "prefetch"], correctAnswer: "A", explanation: {title: "异步加载", sections: [{title: "方法", content: "使用preload预加载，onload时改为stylesheet应用样式，实现异步加载。"}]}},
        {type: "true-false", difficulty: "hard", tags: ["CSSOM"], question: "CSSOM构建会阻塞DOM构建。", correctAnswer: "B", explanation: {title: "不阻塞", sections: [{title: "说明", content: "CSSOM和DOM可以并行构建，CSS不阻塞HTML解析。但CSSOM会阻塞渲染树构建。"}]}},
        {type: "multiple-choice", difficulty: "hard", tags: ["性能优化"], question: "优化CSS加载的方法？", options: ["内联关键CSS", "异步加载非关键CSS", "使用media查询", "压缩CSS文件"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "优化策略", sections: [{title: "全部正确", content: "内联关键CSS加速首屏，异步加载非关键CSS，media查询避免不必要的阻塞，压缩减小文件大小。"}]}},
        {type: "single-choice", difficulty: "hard", tags: ["渲染路径"], question: "关键渲染路径中，CSS在哪个阶段？", options: ["CSSOM构建", "DOM构建", "JavaScript执行", "绘制"], correctAnswer: "A", explanation: {title: "关键渲染路径", sections: [{title: "顺序", content: "DOM构建 + CSSOM构建 → 渲染树 → 布局 → 绘制 → 合成"}]}}
    ],
    navigation: {
        prev: { title: "第5章：CSS解析机制", url: "05-css-parsing.html" },
        next: { title: "第7章：层叠算法", url: "07-cascade.html" }
    }
};
