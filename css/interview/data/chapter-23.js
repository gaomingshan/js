// 第23章：清除浮动 - 面试题（待完善）
window.cssQuizData_Chapter23 = {
    config: {
        title: "清除浮动",
        icon: "🧹",
        description: "清除浮动原理、BFC清除浮动方法",
        primaryColor: "#fa709a",
        bgGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    },
    questions: [
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["clear属性"],
            question: "clear:both的作用是？",
            options: ["清除自身浮动", "清除前面元素的浮动影响", "清除所有浮动", "让元素不浮动"],
            correctAnswer: "B",
            explanation: {
                title: "clear属性作用",
                sections: [{
                    title: "正确答案",
                    content: "clear:both表示元素两侧都不允许出现浮动元素，浏览器会将该元素移动到前面所有浮动元素的下方，从而清除浮动的影响。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["清除浮动基础"],
            question: "clearfix技术的核心原理是？",
            options: ["使用clear:both", "创建BFC", "使用伪元素清除浮动", "设置overflow"],
            correctAnswer: "C",
            explanation: {
                title: "clearfix原理",
                sections: [{
                    title: "正确答案",
                    content: "现代clearfix使用::after伪元素，设置content、display:table和clear:both，在父元素末尾插入一个清除浮动的元素。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["清除浮动方法"],
            question: "以下哪种方法不能清除浮动？",
            options: ["clear:both", "overflow:hidden", "display:flex", "position:static"],
            correctAnswer: "D",
            explanation: {
                title: "清除浮动方法",
                sections: [{
                    title: "正确答案",
                    content: "position:static是默认定位，不能清除浮动。前三种都可以：clear:both直接清除，overflow:hidden和display:flex创建BFC包含浮动。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["BFC清除浮动"],
            question: "为什么overflow:hidden可以清除浮动？",
            options: [
                "隐藏了浮动元素",
                "创建了BFC",
                "改变了浮动方向",
                "使浮动失效"
            ],
            correctAnswer: "B",
            explanation: {
                title: "BFC包含浮动",
                sections: [{
                    title: "正确答案",
                    content: "overflow:hidden（非visible）会创建新的块级格式化上下文（BFC），BFC会包含其内部的浮动元素，计算BFC高度时会包含浮动子元素的高度。"
                }]
            },
            source: "CSS BFC规范"
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["伪元素清除"],
            question: "使用::after伪元素清除浮动，必须设置哪些属性？",
            options: [
                "content和clear",
                "content、display和clear",
                "content、height和clear",
                "display和clear"
            ],
            correctAnswer: "B",
            explanation: {
                title: "伪元素清除浮动要点",
                sections: [{
                    title: "正确答案",
                    content: "需要设置：content（生成内容）、display:block/table（使伪元素成为块级）、clear:both（清除两侧浮动）。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["clear方向"],
            question: "clear:left对哪种浮动有效？",
            options: ["只对左浮动有效", "只对右浮动有效", "对左右浮动都有效", "对所有浮动都有效"],
            correctAnswer: "A",
            explanation: {
                title: "clear的方向性",
                sections: [{
                    title: "正确答案",
                    content: "clear:left只清除左侧的浮动元素影响，clear:right只清除右侧，clear:both清除两侧，clear:none不清除。"
                }]
            },
            source: "CSS浮动规范"
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["BFC创建"],
            question: "以下哪个属性值不会创建BFC？",
            options: ["overflow:auto", "display:inline-block", "float:left", "position:relative"],
            correctAnswer: "D",
            explanation: {
                title: "BFC触发条件",
                sections: [{
                    title: "正确答案",
                    content: "position:relative不创建BFC。创建BFC的条件包括：float非none、overflow非visible、display为inline-block/flex/grid等、position为absolute/fixed等。"
                }]
            },
            source: "CSS BFC规范"
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["清除浮动副作用"],
            question: "使用overflow:hidden清除浮动可能产生什么副作用？",
            options: [
                "浮动元素消失",
                "超出部分被裁剪",
                "z-index失效",
                "margin失效"
            ],
            correctAnswer: "B",
            explanation: {
                title: "overflow清除浮动的问题",
                sections: [{
                    title: "正确答案",
                    content: "overflow:hidden会裁剪超出容器的内容，如果子元素（如tooltip、下拉菜单）需要溢出显示，会被隐藏。这时应该使用其他方法如clearfix。"
                }]
            },
            source: "CSS overflow规范"
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["现代布局"],
            question: "为什么现代布局中很少使用浮动了？",
            options: [
                "浮动已被废弃",
                "有更好的布局方案",
                "浮动性能差",
                "浮动兼容性差"
            ],
            correctAnswer: "B",
            explanation: {
                title: "浮动的替代方案",
                sections: [{
                    title: "正确答案",
                    content: "Flexbox和Grid提供了更强大、更直观的布局能力，不需要清除浮动，也没有高度塌陷问题。浮动主要用于图文混排等特定场景。"
                }]
            },
            source: "CSS布局最佳实践"
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["清除浮动综合"],
            question: "以下哪些方法可以解决浮动导致的高度塌陷？（多选）",
            options: [
                "父元素设置overflow:hidden",
                "父元素使用clearfix伪元素",
                "父元素设置display:flex",
                "子元素设置clear:both"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "高度塌陷解决方案",
                sections: [{
                    title: "正确答案",
                    content: "A、B、C都可以。D错误：子元素自己清除浮动无法解决父元素的高度塌陷，需要在浮动元素之后添加清除浮动的元素。"
                }]
            },
            source: "CSS浮动规范"
        }
    ],
    navigation: {
        prev: { title: "浮动原理", url: "22-float.html" },
        next: { title: "Flexbox布局算法", url: "24-flexbox-algorithm.html" }
    }
};
