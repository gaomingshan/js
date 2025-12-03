// 第22章：浮动原理 - 面试题（待完善）
window.cssQuizData_Chapter22 = {
    config: {
        title: "浮动原理",
        icon: "🌊",
        description: "浮动规则、高度塌陷、浮动的包含块",
        primaryColor: "#43e97b",
        bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
    questions: [
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["浮动基础"],
            question: "浮动元素会脱离文档流吗？",
            options: ["完全脱离", "部分脱离", "不脱离", "取决于浮动方向"],
            correctAnswer: "B",
            explanation: {
                title: "浮动的文档流影响",
                sections: [{
                    title: "正确答案",
                    content: "浮动元素部分脱离文档流，它不再占据空间，但仍会影响行内内容的布局，形成文字环绕效果。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["浮动方向"],
            question: "float属性有哪些有效值？",
            options: ["left/right", "left/right/none", "left/right/center", "left/right/none/inherit"],
            correctAnswer: "D",
            explanation: {
                title: "float属性值",
                sections: [{
                    title: "正确答案",
                    content: "float的有效值包括：left（左浮动）、right（右浮动）、none（不浮动，默认值）、inherit（继承父元素）。CSS3还增加了inline-start和inline-end值。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["浮动高度"],
            question: "父元素包含浮动子元素时，如果不清除浮动，父元素高度会如何？",
            options: ["自动撑开", "高度为0", "等于子元素高度", "保持原高度"],
            correctAnswer: "B",
            explanation: {
                title: "高度塌陷",
                sections: [{
                    title: "正确答案",
                    content: "浮动元素脱离文档流，不再参与父元素高度计算。如果父元素只包含浮动子元素且没有清除浮动，父元素高度会塌陷为0（假设没有padding/border）。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["浮动规则"],
            question: "两个相邻的左浮动元素，它们会如何排列？",
            options: ["重叠", "水平并排", "垂直堆叠", "第二个换行"],
            correctAnswer: "B",
            explanation: {
                title: "浮动排列规则",
                sections: [{
                    title: "正确答案",
                    content: "相同方向的浮动元素会水平并排排列，直到容器宽度不足，后续浮动元素才会换行。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["浮动与display"],
            question: "对inline元素设置float后，display的计算值会变成？",
            options: ["inline", "block", "inline-block", "flex"],
            correctAnswer: "B",
            explanation: {
                title: "浮动对display的影响",
                sections: [{
                    title: "正确答案",
                    content: "设置float后，元素的display计算值会变为block，即使原本是inline。这是因为浮动元素需要具有块级特性才能设置宽高。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["文字环绕"],
            question: "为什么浮动元素可以实现文字环绕效果？",
            options: [
                "浮动元素完全脱离文档流",
                "浮动元素会推开行盒子",
                "浮动元素有特殊的z-index",
                "浮动元素改变了文字的display"
            ],
            correctAnswer: "B",
            explanation: {
                title: "文字环绕原理",
                sections: [{
                    title: "正确答案",
                    content: "浮动元素虽然脱离文档流（不占位），但它会影响周围的行盒子（line box），使行盒子缩短以避开浮动元素，从而形成文字环绕效果。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["浮动包含块"],
            question: "浮动元素的包含块是？",
            options: ["最近的块级祖先的content box", "最近的定位祖先", "父元素", "视口"],
            correctAnswer: "A",
            explanation: {
                title: "浮动元素的包含块",
                sections: [{
                    title: "正确答案",
                    content: "浮动元素的包含块是最近的块级祖先元素的content box（内容框），浮动元素会在这个范围内向左或向右移动。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["浮动层叠"],
            question: "浮动元素和非定位块级元素发生重叠时，谁在上面？",
            options: ["浮动元素", "块级元素", "后定义的元素", "无法确定"],
            correctAnswer: "A",
            explanation: {
                title: "浮动层叠顺序",
                sections: [{
                    title: "正确答案",
                    content: "在层叠顺序中，浮动元素的层级高于非定位的块级元素，但低于定位元素（position非static）。所以浮动元素会覆盖在普通块级元素之上。"
                }]
            },
            source: "CSS层叠规范"
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["浮动边界"],
            question: "浮动元素的margin是否会发生外边距合并？",
            options: ["会", "不会", "有时会", "取决于方向"],
            correctAnswer: "B",
            explanation: {
                title: "浮动margin特性",
                sections: [{
                    title: "正确答案",
                    content: "浮动元素的margin不会与其他元素发生外边距合并（margin collapse）。这是因为浮动元素脱离了正常文档流。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["浮动综合"],
            question: "关于浮动，以下说法正确的是？（多选）",
            options: [
                "浮动元素不占据空间，但影响行内内容布局",
                "浮动元素的margin会发生外边距合并",
                "设置float会使display计算值变为block",
                "浮动元素可以设置负margin"
            ],
            correctAnswer: ["A", "C", "D"],
            explanation: {
                title: "浮动综合知识",
                sections: [{
                    title: "正确答案",
                    content: "A正确：浮动部分脱离文档流；C正确：浮动会改变display；D正确：可以使用负margin实现特殊布局。B错误：浮动元素margin不合并。"
                }]
            },
            source: "CSS浮动规范"
        }
    ],
    navigation: {
        prev: { title: "偏移属性计算", url: "21-offset-properties.html" },
        next: { title: "清除浮动", url: "23-clearing-float.html" }
    }
};
