// 第29章：响应式单位 - 面试题（待完善）
window.cssQuizData_Chapter29 = {
    config: {
        title: "响应式单位",
        icon: "📏",
        description: "viewport单位、rem/em计算、clamp()函数",
        primaryColor: "#667eea",
        bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["视口单位"], question: "1vw等于视口宽度的多少？", options: ["1%", "10%", "100%", "视具体情况而定"], correctAnswer: "A", explanation: {title: "vw单位", sections: [{title: "正确答案", content: "1vw等于视口宽度的1%，即vw = viewport width / 100。"}]}, source: "CSS单位规范"},
        {type: "single-choice", difficulty: "easy", tags: ["rem单位"], question: "rem单位相对于什么？", options: ["父元素字号", "根元素字号", "视口宽度", "浏览器默认字号"], correctAnswer: "B", explanation: {title: "rem相对单位", sections: [{title: "正确答案", content: "rem（root em）相对于根元素（html）的font-size计算。"}]}, source: "CSS单位规范"},
        {type: "single-choice", difficulty: "medium", tags: ["vmin/vmax"], question: "50vmin在宽度800px、高度600px的视口中等于多少px？", options: ["400px", "300px", "700px", "250px"], correctAnswer: "B", explanation: {title: "vmin计算", sections: [{title: "正确答案", content: "vmin取视口宽高中较小的值。600px < 800px，所以50vmin = 600 × 50% = 300px。"}]}, source: "CSS单位规范"},
        {type: "single-choice", difficulty: "medium", tags: ["em单位"], question: "元素font-size:16px，设置padding:2em，padding计算值是？", options: ["32px", "16px", "2px", "取决于父元素"], correctAnswer: "A", explanation: {title: "em计算", sections: [{title: "正确答案", content: "em相对于当前元素的font-size。padding:2em = 16px × 2 = 32px。"}]}, source: "CSS单位规范"},
        {type: "single-choice", difficulty: "medium", tags: ["百分比"], question: "absolute元素的top:50%相对于什么计算？", options: ["视口高度", "父元素高度", "定位祖先的padding box高度", "自身高度"], correctAnswer: "C", explanation: {title: "百分比参考", sections: [{title: "正确答案", content: "absolute元素的百分比相对于定位祖先的padding box计算。"}]}, source: "CSS定位规范"},
        {type: "single-choice", difficulty: "medium", tags: ["clamp函数"], question: "clamp(10px, 5vw, 50px)的含义是？", options: ["最小10px，首选5vw，最大50px", "10px或5vw或50px", "10px加5vw加50px", "10px到50px的5vw"], correctAnswer: "A", explanation: {title: "clamp函数", sections: [{title: "正确答案", content: "clamp(MIN, VAL, MAX)保证值在MIN和MAX之间，首选VAL。相当于max(MIN, min(VAL, MAX))。"}]}, source: "CSS Values规范"},
        {type: "single-choice", difficulty: "hard", tags: ["vh问题"], question: "移动端vh单位的常见问题是？", options: ["不支持vh", "vh会随地址栏显隐变化", "vh总是0", "vh等于vw"], correctAnswer: "B", explanation: {title: "移动端vh", sections: [{title: "正确答案", content: "移动浏览器的地址栏显隐会改变视口高度，导致vh动态变化。可以使用svh（Small Viewport Height）和lvh（Large Viewport Height）解决。"}]}, source: "CSS Viewport Units"},
        {type: "single-choice", difficulty: "hard", tags: ["容器查询单位"], question: "cqw单位相对于什么？", options: ["视口宽度", "容器宽度", "内容宽度", "父元素宽度"], correctAnswer: "B", explanation: {title: "容器查询单位", sections: [{title: "正确答案", content: "cqw（Container Query Width）相对于最近的容器查询容器的宽度。1cqw = 容器宽度的1%。"}]}, source: "CSS Container Queries"},
        {type: "single-choice", difficulty: "hard", tags: ["单位优先级"], question: "font-size同时设置为16px和1rem（假设根字号16px），哪个生效？", options: ["16px", "1rem", "后声明的", "优先级相同"], correctAnswer: "C", explanation: {title: "CSS级联", sections: [{title: "正确答案", content: "相同选择器和属性，遵循级联规则，后声明的覆盖先声明的，与单位类型无关。"}]}, source: "CSS级联规范"},
        {type: "multiple-choice", difficulty: "hard", tags: ["响应式单位综合"], question: "关于响应式单位，以下说法正确的是？（多选）", options: ["rem便于全局缩放", "vw/vh适合全屏布局", "em会级联累积", "clamp()可以实现流式排版"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "响应式单位特性", sections: [{title: "正确答案", content: "四个都正确。rem全局可控，vw/vh相对视口，em会累积，clamp实现自适应范围。"}]}, source: "CSS单位规范"}
    ],
    navigation: {
        prev: { title: "媒体查询原理", url: "28-media-queries.html" },
        next: null
    }
};
