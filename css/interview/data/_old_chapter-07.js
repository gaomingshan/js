// 第7章：CSS动画与过渡 - 面试题（30题）
window.cssQuizData_Chapter07 = {
    config: {
        title: "CSS动画与过渡",
        icon: "✨",
        description: "transition过渡、animation动画、@keyframes、缓动函数",
        primaryColor: "#f59e0b",
        bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    questions: [
        // 简单题10题
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["transition"],
            question: "transition属性用于什么？",
            options: ["在两个状态之间平滑过渡", "创建循环动画", "定义关键帧", "控制元素位置"],
            correctAnswer: "A",
            explanation: { title: "Transition", sections: [{ title: "用途", content: "transition用于在CSS属性值改变时创建平滑的过渡效果" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["transition属性"],
            question: "transition简写属性的正确顺序是？",
            options: [
                "property duration timing-function delay",
                "duration property timing-function delay",
                "property timing-function duration delay",
                "timing-function duration property delay"
            ],
            correctAnswer: "A",
            explanation: { title: "简写顺序", sections: [{ title: "正确", content: "transition: property duration timing-function delay" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["animation"],
            question: "@keyframes用于定义动画的关键帧。",
            correctAnswer: "A",
            explanation: { title: "@keyframes", sections: [{ title: "正确", content: "@keyframes规则定义动画序列中的关键帧状态" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "easy",
            tags: ["timing-function"],
            question: "以下哪些是有效的缓动函数？（多选）",
            options: ["ease", "linear", "ease-in-out", "cubic-bezier()"],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "缓动函数", sections: [{ title: "类型", content: "ease、linear、ease-in、ease-out、ease-in-out、cubic-bezier()、steps()" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["animation循环"],
            question: "如何让动画无限循环？",
            options: [
                "animation-iteration-count: infinite",
                "animation-loop: infinite",
                "animation-repeat: forever",
                "animation-count: -1"
            ],
            correctAnswer: "A",
            explanation: { title: "循环", sections: [{ title: "属性", content: "animation-iteration-count: infinite 实现无限循环" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["transition触发"],
            question: "transition需要触发器（如:hover）才能生效。",
            correctAnswer: "A",
            explanation: { title: "触发", sections: [{ title: "正确", content: "transition需要CSS属性值变化作为触发条件，常用:hover、:focus等" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["animation-direction"],
            question: "animation-direction: alternate的作用？",
            options: ["动画交替反向播放", "反向播放", "正向播放", "随机播放"],
            correctAnswer: "A",
            explanation: { title: "alternate", sections: [{ title: "效果", content: "奇数次正向，偶数次反向，形成往返效果" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "easy",
            tags: ["@keyframes语法"],
            question: "@keyframes中可以使用哪些？（多选）",
            options: ["百分比（0%, 50%, 100%）", "from、to关键字", "小数（0.5）", "负数（-10%）"],
            correctAnswer: ["A", "B"],
            explanation: { title: "语法", sections: [{ title: "规则", content: "可用百分比0%-100%，或from(0%)、to(100%)关键字" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["性能"],
            question: "动画transform和opacity性能最好。",
            correctAnswer: "A",
            explanation: { title: "性能", sections: [{ title: "正确", content: "transform和opacity只触发合成，不触发布局和绘制，性能最优" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["animation-fill-mode"],
            question: "animation-fill-mode: forwards的作用？",
            options: [
                "动画结束后保持最后一帧状态",
                "动画开始前应用第一帧",
                "双向填充",
                "无效果"
            ],
            correctAnswer: "A",
            explanation: { title: "fill-mode", sections: [{ title: "forwards", content: "动画结束后元素保持最后一帧的样式" }] }
        },

        // 中等题10题
        {
            type: "code-output",
            difficulty: "medium",
            tags: ["transition"],
            question: "以下代码，过渡效果持续多久？",
            code: `.box {\n  transition: all 0.3s ease 0.2s;\n}\n.box:hover {\n  width: 200px;\n}`,
            options: ["0.3s", "0.2s", "0.5s", "0.1s"],
            correctAnswer: "A",
            explanation: { title: "duration", sections: [{ title: "解析", content: "第二个时间参数是duration，0.3s是过渡持续时间，0.2s是delay" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["animation属性"],
            question: "关于animation属性，正确的是？（多选）",
            options: [
                "可以同时应用多个动画，用逗号分隔",
                "animation-play-state可以暂停动画",
                "默认只播放一次",
                "animation是简写属性"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "animation特性", sections: [{ title: "全部正确", content: "animation支持多动画、可暂停、默认播放1次、是简写属性" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["cubic-bezier"],
            question: "cubic-bezier(0, 0, 1, 1)等同于？",
            options: ["linear", "ease", "ease-in", "ease-out"],
            correctAnswer: "A",
            explanation: { title: "贝塞尔曲线", sections: [{ title: "等价", content: "cubic-bezier(0, 0, 1, 1)是线性曲线，等同于linear" }] }
        },
        {
            type: "code-completion",
            difficulty: "medium",
            tags: ["@keyframes"],
            question: "如何定义50%关键帧？",
            code: `@keyframes slide {\n  0% { left: 0; }\n  ______ { left: 50px; }\n  100% { left: 100px; }\n}`,
            options: ["50%", "0.5", "half", "middle"],
            correctAnswer: "A",
            explanation: { title: "关键帧", sections: [{ title: "语法", content: "使用百分比表示时间点，50%表示动画进行到一半" }] }
        },
        {
            type: "true-false",
            difficulty: "medium",
            tags: ["transition-property"],
            question: "transition: all 会过渡所有可动画属性。",
            correctAnswer: "A",
            explanation: { title: "transition: all", sections: [{ title: "正确", content: "all会监听所有可动画属性的变化，但可能影响性能，建议指定具体属性" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["steps"],
            question: "steps(5)缓动函数的效果？",
            options: [
                "分5步完成，无过渡",
                "持续5秒",
                "重复5次",
                "延迟5秒"
            ],
            correctAnswer: "A",
            explanation: { title: "steps函数", sections: [{ title: "阶梯效果", content: "steps(n)将动画分为n个等距的跳跃步骤，适合逐帧动画" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["可动画属性"],
            question: "以下哪些属性可以过渡？（多选）",
            options: ["opacity", "transform", "display", "width"],
            correctAnswer: ["A", "B", "D"],
            explanation: { title: "可动画属性", sections: [{ title: "说明", content: "display不可动画，可用visibility、opacity替代。数值、颜色、transform等可动画" }] }
        },
        {
            type: "code-output",
            difficulty: "medium",
            tags: ["animation-delay"],
            question: "负的animation-delay会发生什么？",
            code: `.box {\n  animation: fade 2s ease -1s;\n}`,
            options: [
                "动画从1秒处开始播放",
                "延迟1秒播放",
                "无效",
                "反向播放"
            ],
            correctAnswer: "A",
            explanation: { title: "负延迟", sections: [{ title: "效果", content: "负delay让动画立即从中间状态开始，-1s表示从1秒处开始" }] }
        },
        {
            type: "true-false",
            difficulty: "medium",
            tags: ["animation和transition"],
            question: "一个元素可以同时使用transition和animation。",
            correctAnswer: "A",
            explanation: { title: "共存", sections: [{ title: "正确", content: "可以同时使用，但animation优先级更高，可能覆盖transition效果" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["will-change"],
            question: "will-change属性的作用？",
            options: [
                "提示浏览器优化即将变化的属性",
                "阻止属性变化",
                "设置变化延迟",
                "定义变化方向"
            ],
            correctAnswer: "A",
            explanation: { title: "will-change", sections: [{ title: "优化", content: "will-change提前告知浏览器哪些属性会变化，浏览器可提前优化" }] }
        },

        // 困难题10题
        {
            type: "code-output",
            difficulty: "hard",
            tags: ["animation-fill-mode"],
            question: "animation-fill-mode: both的效果？",
            options: [
                "动画前后都保持关键帧状态",
                "只在动画前保持",
                "只在动画后保持",
                "无效果"
            ],
            correctAnswer: "A",
            explanation: { title: "fill-mode: both", sections: [{ title: "效果", content: "both = backwards + forwards，动画前应用0%样式，动画后保持100%样式" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["性能优化"],
            question: "动画性能优化最佳实践？（多选）",
            options: [
                "优先使用transform和opacity",
                "避免动画width、height、margin等",
                "使用will-change提示",
                "减少动画元素数量"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "性能优化", sections: [{ title: "原则", content: "使用合成层属性(transform/opacity)、避免触发布局的属性、使用will-change、减少动画元素" }] }
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["animation-timing-function"],
            question: "animation-timing-function在@keyframes内部设置时？",
            options: [
                "控制每个关键帧之间的缓动",
                "控制整个动画的缓动",
                "无效",
                "覆盖外部设置"
            ],
            correctAnswer: "A",
            explanation: { title: "关键帧内timing", sections: [{ title: "作用", content: "@keyframes内部设置timing-function控制到下一关键帧的缓动，可为每段设置不同缓动" }] }
        },
        {
            type: "code-completion",
            difficulty: "hard",
            tags: ["paused"],
            question: "如何暂停正在播放的动画？",
            code: `.box {\n  animation: spin 2s infinite;\n}\n.box:hover {\n  ______: paused;\n}`,
            options: [
                "animation-play-state",
                "animation-status",
                "animation-pause",
                "animation-control"
            ],
            correctAnswer: "A",
            explanation: { title: "暂停动画", sections: [{ title: "属性", content: "animation-play-state: paused暂停，running继续" }] }
        },
        {
            type: "true-false",
            difficulty: "hard",
            tags: ["transform性能"],
            question: "transform动画不会触发reflow和repaint。",
            correctAnswer: "A",
            explanation: { title: "transform性能", sections: [{ title: "正确", content: "transform只触发composite（合成），不触发layout（回流）和paint（重绘），性能极佳" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["transition事件"],
            question: "CSS动画相关的JavaScript事件？（多选）",
            options: [
                "transitionend",
                "animationstart",
                "animationend",
                "animationiteration"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "动画事件", sections: [{ title: "事件", content: "transitionend、animationstart、animationend、animationiteration可监听动画状态" }] }
        },
        {
            type: "code-output",
            difficulty: "hard",
            tags: ["多动画"],
            question: "同时应用多个动画的语法？",
            code: `.box {\n  animation:\n    spin 2s linear infinite,\n    fade 1s ease-in;\n}`,
            options: ["两个动画同时播放", "只播放第一个", "只播放最后一个", "语法错误"],
            correctAnswer: "A",
            explanation: { title: "多动画", sections: [{ title: "语法", content: "用逗号分隔多个动画，它们会同时播放，独立控制" }] }
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["GPU加速"],
            question: "如何强制开启GPU加速？",
            options: [
                "transform: translateZ(0)",
                "will-change: transform",
                "animation: gpu",
                "以上都不对"
            ],
            correctAnswer: "A",
            explanation: { title: "GPU加速", sections: [{ title: "hack", content: "transform: translateZ(0)或translate3d(0,0,0)可触发GPU加速，创建新的合成层" }] }
        },
        {
            type: "true-false",
            difficulty: "hard",
            tags: ["animation-name"],
            question: "一个@keyframes可以被多个元素的animation-name引用。",
            correctAnswer: "A",
            explanation: { title: "复用", sections: [{ title: "正确", content: "@keyframes是全局的，可被多个元素复用，减少代码重复" }] }
        },
        {
            type: "code-completion",
            difficulty: "hard",
            tags: ["关键帧复用"],
            question: "如何让多个关键帧共享相同样式？",
            code: `@keyframes pulse {\n  ______, 100% {\n    transform: scale(1);\n  }\n  50% {\n    transform: scale(1.2);\n  }\n}`,
            options: ["0%", "from", "start", "begin"],
            correctAnswer: "A",
            explanation: { title: "共享关键帧", sections: [{ title: "语法", content: "用逗号分隔多个百分比，共享相同样式。如0%, 100% { ... }" }] }
        }
    ],
    navigation: {
        prev: { title: "第6章：定位机制", url: "06-positioning.html" },
        next: null
    }
};
