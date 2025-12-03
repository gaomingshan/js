// 第6章：定位机制 - 面试题（30题）
window.cssQuizData_Chapter06 = {
    config: {
        title: "CSS定位机制",
        icon: "📍",
        description: "static、relative、absolute、fixed、sticky定位详解",
        primaryColor: "#ec4899",
        bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
    },
    questions: [
        // 简单10题
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["position"],
            question: "position的默认值是？",
            options: ["static", "relative", "absolute", "fixed"],
            correctAnswer: "A",
            explanation: { title: "默认定位", sections: [{ title: "static", content: "默认值，正常文档流，top/right/bottom/left无效" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["relative"],
            question: "position: relative 会脱离文档流。",
            correctAnswer: "B",
            explanation: { title: "relative", sections: [{ title: "错误", content: "relative不脱离文档流，保留原位置，相对原位置偏移" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["absolute"],
            question: "absolute定位相对于谁？",
            options: [
                "最近的非static定位祖先",
                "父元素",
                "body",
                "根元素"
            ],
            correctAnswer: "A",
            explanation: { title: "absolute", sections: [{ title: "定位参考", content: "最近的position非static的祖先元素，没有则相对于初始包含块" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "easy",
            tags: ["fixed"],
            question: "关于fixed定位，以下正确的是？（多选）",
            options: [
                "相对于视口定位",
                "脱离文档流",
                "不随页面滚动",
                "可以设置top/right/bottom/left"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "fixed", sections: [{ title: "特性", content: "视口定位，固定位置，不随滚动" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["z-index"],
            question: "z-index对哪些元素有效？",
            options: [
                "position非static的元素",
                "所有元素",
                "只有absolute和fixed",
                "只有block元素"
            ],
            correctAnswer: "A",
            explanation: { title: "z-index", sections: [{ title: "生效条件", content: "position: relative/absolute/fixed/sticky，或flex/grid项目" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["sticky"],
            question: "sticky是relative和fixed的结合。",
            correctAnswer: "A",
            explanation: { title: "sticky", sections: [{ title: "正确", content: "滚动到阈值前是relative，到达阈值后变fixed" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["定位坐标"],
            question: "top: 50px的含义？",
            options: [
                "距参考元素顶部50px",
                "从顶部移动50px",
                "高度50px",
                "margin-top: 50px"
            ],
            correctAnswer: "A",
            explanation: { title: "定位属性", sections: [{ title: "含义", content: "top/right/bottom/left定义距参考边的距离" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "easy",
            tags: ["脱离文档流"],
            question: "以下哪些会脱离文档流？（多选）",
            options: ["float", "position: absolute", "position: fixed", "position: relative"],
            correctAnswer: ["A", "B", "C"],
            explanation: { title: "文档流", sections: [{ title: "脱离", content: "float、absolute、fixed脱离。relative保留原位置" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["百分比"],
            question: "定位元素的百分比是相对于父元素的content区域。",
            correctAnswer: "B",
            explanation: { title: "百分比参考", sections: [{ title: "错误", content: "相对于定位父元素的padding区域（content + padding）" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["居中"],
            question: "绝对定位元素水平居中的方法？",
            options: [
                "left: 50%; transform: translateX(-50%)",
                "margin: 0 auto",
                "text-align: center",
                "justify-content: center"
            ],
            correctAnswer: "A",
            explanation: { title: "居中", sections: [{ title: "方法", content: "left: 50% + transform，或 left: 0; right: 0; margin: auto（需知宽度）" }] }
        },

        // 中等10题
        {
            type: "code-output",
            difficulty: "medium",
            tags: ["层叠顺序"],
            question: "同级元素，谁在最上层？A(z-index: 10)  B(z-index: 5)  C(无z-index)",
            options: ["A", "B", "C", "同层"],
            correctAnswer: "A",
            explanation: { title: "z-index", sections: [{ title: "比较", content: "有z-index > 无z-index，数值大的在上" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["层叠上下文"],
            question: "以下哪些会创建层叠上下文？（多选）",
            options: [
                "position非static且z-index非auto",
                "opacity < 1",
                "transform非none",
                "filter非none"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "层叠上下文", sections: [{ title: "触发", content: "定位+z-index、opacity、transform、filter等都会创建" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["sticky"],
            question: "sticky失效的常见原因？",
            options: [
                "父元素overflow: hidden",
                "z-index太小",
                "宽度不够",
                "颜色太淡"
            ],
            correctAnswer: "A",
            explanation: { title: "sticky问题", sections: [{ title: "失效", content: "父元素overflow非visible、未设置阈值、高度不够都会失效" }] }
        },
        {
            type: "code-completion",
            difficulty: "medium",
            tags: ["居中"],
            question: "已知宽高的absolute元素如何完美居中？",
            code: `.center {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  ______: translate(-50%, -50%);\n}`,
            options: ["transform", "margin", "padding", "offset"],
            correctAnswer: "A",
            explanation: { title: "居中方案", sections: [{ title: "transform", content: "translate百分比相对于自身尺寸，完美居中" }] }
        },
        {
            type: "true-false",
            difficulty: "medium",
            tags: ["fixed"],
            question: "fixed定位一定相对于视口，不会相对于父元素。",
            correctAnswer: "B",
            explanation: { title: "fixed特殊情况", sections: [{ title: "错误", content: "父元素有transform/filter等时，fixed会相对于父元素而非视口" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["absolute布局"],
            question: "设置left: 0; right: 0的absolute元素效果？",
            options: [
                "拉伸填满定位父元素宽度",
                "居中",
                "无效果",
                "报错"
            ],
            correctAnswer: "A",
            explanation: { title: "拉伸", sections: [{ title: "效果", content: "同时设置left和right会拉伸元素。top+bottom同理" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["定位应用"],
            question: "absolute定位的典型应用？（多选）",
            options: [
                "图标角标",
                "下拉菜单",
                "模态框",
                "工具提示"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "应用", sections: [{ title: "场景", content: "absolute适合脱离文档流的浮层、角标、提示等" }] }
        },
        {
            type: "code-output",
            difficulty: "medium",
            tags: ["包含块"],
            question: "子元素absolute，父元素relative，百分比宽度相对于？",
            options: [
                "父元素的padding box",
                "父元素的content box",
                "父元素的border box",
                "视口"
            ],
            correctAnswer: "A",
            explanation: { title: "包含块", sections: [{ title: "参考", content: "absolute百分比相对于定位父元素的padding box（content + padding）" }] }
        },
        {
            type: "true-false",
            difficulty: "medium",
            tags: ["relative"],
            question: "relative元素的top/left会影响其他元素的位置。",
            correctAnswer: "B",
            explanation: { title: "relative特性", sections: [{ title: "错误", content: "relative偏移是视觉偏移，不影响其他元素布局" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["sticky阈值"],
            question: "sticky的top: 20px含义？",
            options: [
                "距视口顶部20px时开始sticky",
                "距父元素顶部20px",
                "向下偏移20px",
                "无意义"
            ],
            correctAnswer: "A",
            explanation: { title: "sticky阈值", sections: [{ title: "定义", content: "top定义sticky生效的距离阈值" }] }
        },

        // 困难10题
        {
            type: "code-output",
            difficulty: "hard",
            tags: ["层叠上下文"],
            question: "父(z-index: 1)的子(z-index: 9999)，能覆盖父的兄弟(z-index: 2)吗？",
            options: ["不能", "能", "看情况", "会报错"],
            correctAnswer: "A",
            explanation: { title: "层叠上下文隔离", sections: [{ title: "规则", content: "子元素被限制在父元素的层叠上下文内，无法跨越父层级" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["定位细节"],
            question: "关于定位的特殊规则？（多选）",
            options: [
                "absolute会使元素变为块级",
                "定位元素的margin不会合并",
                "定位元素可以覆盖浮动元素",
                "relative的z-index默认为0"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: { title: "定位特性", sections: [{ title: "规则", content: "absolute/fixed块级化、margin不合并、可覆盖float。z-index默认auto不是0" }] }
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["transform与fixed"],
            question: "父元素有transform时，fixed子元素会？",
            options: [
                "相对于父元素定位",
                "相对于视口定位",
                "失效",
                "变为absolute"
            ],
            correctAnswer: "A",
            explanation: { title: "transform影响", sections: [{ title: "行为", content: "父元素transform会为fixed子元素创建新的包含块，改变定位参考" }] }
        },
        {
            type: "code-completion",
            difficulty: "hard",
            tags: ["层叠上下文"],
            question: "如何让relative元素创建层叠上下文？",
            code: `.box {\n  position: relative;\n  ______: 0;\n}`,
            options: ["z-index", "opacity", "transform", "filter"],
            correctAnswer: "A",
            explanation: { title: "创建层叠", sections: [{ title: "方法", content: "relative需要明确设置z-index（非auto）才创建层叠上下文" }] }
        },
        {
            type: "true-false",
            difficulty: "hard",
            tags: ["性能"],
            question: "频繁改变absolute元素的top/left会触发重排。",
            correctAnswer: "A",
            explanation: { title: "性能", sections: [{ title: "正确", content: "top/left触发layout。动画建议用transform: translate代替" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["sticky限制"],
            question: "sticky的使用限制？（多选）",
            options: [
                "父元素不能overflow: hidden",
                "必须指定阈值（top/left等）",
                "父元素高度要足够",
                "不能嵌套"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: { title: "sticky条件", sections: [{ title: "要求", content: "父元素overflow: visible、设置阈值、父元素高度足够。可以嵌套" }] }
        },
        {
            type: "code-output",
            difficulty: "hard",
            tags: ["absolute尺寸"],
            question: "absolute元素同时设置left: 0, right: 0, width: 100px，最终宽度？",
            options: ["100px", "充满", "0", "无效"],
            correctAnswer: "A",
            explanation: { title: "尺寸优先级", sections: [{ title: "规则", content: "width > left+right的拉伸效果。明确宽度优先级最高" }] }
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["初始包含块"],
            question: "初始包含块（initial containing block）是？",
            options: [
                "视口大小的矩形",
                "html元素",
                "body元素",
                "根元素"
            ],
            correctAnswer: "A",
            explanation: { title: "初始包含块", sections: [{ title: "定义", content: "视口大小的矩形，绝对定位找不到定位祖先时的参考" }] }
        },
        {
            type: "true-false",
            difficulty: "hard",
            tags: ["定位性能"],
            question: "使用transform代替top/left做动画，性能更好。",
            correctAnswer: "A",
            explanation: { title: "性能优化", sections: [{ title: "正确", content: "transform只触发合成，top/left触发布局重排。transform性能远优" }] }
        },
        {
            type: "code-completion",
            difficulty: "hard",
            tags: ["垂直居中"],
            question: "不定宽高absolute元素垂直居中最佳方案？",
            code: `.center {\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  ______: auto;\n}`,
            options: ["margin", "padding", "transform", "offset"],
            correctAnswer: "A",
            explanation: { title: "margin auto", sections: [{ title: "神器", content: "absolute + 四方向0 + margin: auto = 完美居中（需知宽高）" }] }
        }
    ],
    navigation: {
        prev: { title: "第5章：Grid布局", url: "05-grid.html" },
        next: { title: "第7章：CSS动画", url: "07-animation.html" }
    }
};
