// 第4章：Flexbox弹性布局 - 面试题（30题）
window.cssQuizData_Chapter04 = {
    config: {
        title: "Flexbox弹性布局",
        icon: "📐",
        description: "flex容器、flex项目、主轴交叉轴、对齐方式",
        primaryColor: "#8b5cf6",
        bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
    },
    questions: [
        // 简单题10题
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["Flexbox基础"],
            question: "如何创建一个flex容器？",
            options: ["display: flex", "flex: 1", "flex-direction: row", "align-items: center"],
            correctAnswer: "A",
            explanation: { title: "Flex容器", sections: [{ title: "创建", content: "display: flex 或 display: inline-flex" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["主轴方向"],
            question: "flex-direction的默认值是？",
            options: ["row", "column", "row-reverse", "column-reverse"],
            correctAnswer: "A",
            explanation: { title: "主轴方向", sections: [{ title: "默认", content: "row - 水平从左到右" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["flex属性"],
            question: "flex: 1 是 flex-grow: 1 的简写。",
            correctAnswer: "B",
            explanation: { title: "flex简写", sections: [{ title: "完整", content: "flex: 1 等于 flex: 1 1 0%（grow shrink basis）" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "easy",
            tags: ["对齐"],
            question: "以下哪些属性用于flex容器？（多选）",
            options: ["justify-content", "align-items", "flex-grow", "flex-wrap"],
            correctAnswer: ["A", "B", "D"],
            explanation: { title: "容器vs项目", sections: [{ title: "容器属性", content: "justify-content, align-items, flex-wrap等。flex-grow是项目属性" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["换行"],
            question: "如何让flex项目换行？",
            options: ["flex-wrap: wrap", "flex-break: wrap", "flex-line: wrap", "overflow: wrap"],
            correctAnswer: "A",
            explanation: { title: "换行", sections: [{ title: "属性", content: "flex-wrap: wrap | nowrap | wrap-reverse" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["主轴对齐"],
            question: "justify-content控制主轴方向的对齐。",
            correctAnswer: "A",
            explanation: { title: "对齐", sections: [{ title: "正确", content: "justify-content主轴，align-items交叉轴" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["flex-grow"],
            question: "flex-grow的默认值是？",
            options: ["0", "1", "auto", "none"],
            correctAnswer: "A",
            explanation: { title: "flex-grow", sections: [{ title: "默认", content: "0 - 不放大" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "easy",
            tags: ["对齐值"],
            question: "justify-content可以使用哪些值？（多选）",
            options: ["flex-start", "center", "space-between", "baseline"],
            correctAnswer: ["A", "B", "C"],
            explanation: { title: "justify-content", sections: [{ title: "常用值", content: "flex-start, center, flex-end, space-between, space-around, space-evenly。baseline是align-items的值" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["flex-basis"],
            question: "flex-basis定义项目在主轴上的初始大小。",
            correctAnswer: "A",
            explanation: { title: "flex-basis", sections: [{ title: "正确", content: "flex-basis设置主轴上的基准大小，默认auto" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["居中"],
            question: "如何让flex项目水平垂直居中？",
            options: [
                "justify-content: center; align-items: center",
                "text-align: center; vertical-align: middle",
                "margin: auto",
                "position: center"
            ],
            correctAnswer: "A",
            explanation: { title: "居中", sections: [{ title: "方法", content: "容器设置 justify-content: center 和 align-items: center" }] }
        },

        // 中等题10题
        {
            type: "code-output",
            difficulty: "medium",
            tags: ["flex计算"],
            question: "三个项目flex: 1, flex: 2, flex: 1，容器宽度400px，每个项目多宽？",
            options: ["100px, 200px, 100px", "133px, 134px, 133px", "150px, 100px, 150px"],
            correctAnswer: "A",
            explanation: { title: "flex分配", sections: [{ title: "计算", content: "总份数4，每份100px。1:2:1 = 100:200:100" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["flex简写"],
            question: "关于flex简写，以下正确的是？（多选）",
            options: [
                "flex: 1 = flex: 1 1 0%",
                "flex: auto = flex: 1 1 auto",
                "flex: none = flex: 0 0 auto",
                "flex: 0 = flex: 0 0 0%"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: { title: "flex简写", sections: [{ title: "常用值", content: "flex: 1 (1 1 0%), auto (1 1 auto), none (0 0 auto), initial (0 1 auto)" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["order"],
            question: "flex项目的order默认值是？",
            options: ["0", "1", "auto", "-1"],
            correctAnswer: "A",
            explanation: { title: "order", sections: [{ title: "排序", content: "默认0。数值越小越靠前，可以为负数" }] }
        },
        {
            type: "true-false",
            difficulty: "medium",
            tags: ["flex-shrink"],
            question: "flex-shrink: 0 表示项目不会缩小。",
            correctAnswer: "A",
            explanation: { title: "flex-shrink", sections: [{ title: "正确", content: "0不缩小，默认1会缩小" }] }
        },
        {
            type: "code-completion",
            difficulty: "medium",
            tags: ["gap"],
            question: "如何设置flex项目之间的间距？",
            code: `.container {\n  display: flex;\n  ______: 20px;\n}`,
            options: ["gap", "spacing", "margin", "padding"],
            correctAnswer: "A",
            explanation: { title: "gap", sections: [{ title: "间距", content: "gap(或row-gap/column-gap)设置项目间距" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["align-self"],
            question: "align-self的作用是？",
            options: [
                "单独设置某个项目的交叉轴对齐",
                "设置所有项目的交叉轴对齐",
                "设置主轴对齐",
                "设置容器对齐"
            ],
            correctAnswer: "A",
            explanation: { title: "align-self", sections: [{ title: "个性化对齐", content: "覆盖align-items，单独设置某项目" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["space分布"],
            question: "关于space-*值，以下正确的是？（多选）",
            options: [
                "space-between: 两端对齐，项目间等距",
                "space-around: 每个项目两侧等距",
                "space-evenly: 所有间距完全相等",
                "space-around的边缘间距是项目间距的一半"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "space分布", sections: [{ title: "对比", content: "between两端无间距，around边缘半间距，evenly完全等距" }] }
        },
        {
            type: "code-output",
            difficulty: "medium",
            tags: ["flex-basis"],
            question: "flex: 0 0 100px 的含义是？",
            options: [
                "固定100px，不放大不缩小",
                "可放大可缩小，基准100px",
                "只能放大，基准100px",
                "只能缩小，基准100px"
            ],
            correctAnswer: "A",
            explanation: { title: "flex: 0 0 100px", sections: [{ title: "固定宽度", content: "grow=0不放大，shrink=0不缩小，basis=100px" }] }
        },
        {
            type: "true-false",
            difficulty: "medium",
            tags: ["flex换行"],
            question: "flex-wrap: wrap 时，align-content控制行间距。",
            correctAnswer: "A",
            explanation: { title: "align-content", sections: [{ title: "正确", content: "多行时align-content控制行分布，align-items控制行内对齐" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["flex方向"],
            question: "flex-direction: column 时，主轴是？",
            options: ["垂直方向", "水平方向", "对角方向", "不确定"],
            correctAnswer: "A",
            explanation: { title: "主轴切换", sections: [{ title: "column", content: "column时主轴是垂直方向，交叉轴是水平方向" }] }
        },

        // 困难题10题
        {
            type: "code-output",
            difficulty: "hard",
            tags: ["flex计算"],
            question: "容器300px，三项目width: 150px, flex: 1 0 auto。最终宽度？",
            options: [
                "每个100px",
                "150px, 75px, 75px",
                "各150px，溢出",
                "100px, 100px, 100px"
            ],
            correctAnswer: "A",
            explanation: { title: "flex计算", sections: [{ title: "分析", content: "总需450px，超出150px。flex-shrink默认1，按比例缩小。3个项目等比缩，各缩50px，最终各100px" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["flex特性"],
            question: "关于Flexbox，以下正确的是？（多选）",
            options: [
                "float在flex项目上无效",
                "vertical-align在flex项目上无效",
                "flex项目的margin不会合并",
                "flex会创建BFC"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "Flex特性", sections: [{ title: "规则", content: "flex项目：float/vertical-align无效，margin不合并，创建BFC" }] }
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["flex-basis"],
            question: "flex-basis: 0 和 flex-basis: auto 的区别？",
            options: [
                "0忽略内容大小，auto考虑内容大小",
                "完全相同",
                "0是百分比，auto是像素",
                "0不可用"
            ],
            correctAnswer: "A",
            explanation: { title: "flex-basis", sections: [{ title: "对比", content: "0：完全按flex-grow分配。auto：先预留内容空间再分配剩余" }] }
        },
        {
            type: "code-completion",
            difficulty: "hard",
            tags: ["margin auto"],
            question: "如何让某个flex项目靠右对齐？",
            code: `.item {\n  ______: auto;\n}`,
            options: ["margin-left", "margin-right", "margin", "padding-left"],
            correctAnswer: "A",
            explanation: { title: "margin auto", sections: [{ title: "妙用", content: "flex项目的margin: auto会占据剩余空间，可实现分组对齐" }] }
        },
        {
            type: "true-false",
            difficulty: "hard",
            tags: ["min-width"],
            question: "flex项目的min-width默认值是auto，不是0。",
            correctAnswer: "A",
            explanation: { title: "min-width: auto", sections: [{ title: "正确", content: "flex/grid项目的min-width默认auto，会阻止缩小到内容以下。普通元素默认0" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["flex应用"],
            question: "Flexbox适合以下哪些场景？（多选）",
            options: [
                "一维布局（行或列）",
                "组件内部布局",
                "导航栏、工具栏",
                "整体页面布局"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: { title: "Flex vs Grid", sections: [{ title: "选择", content: "Flex适合一维布局和组件，Grid适合二维和页面级布局" }] }
        },
        {
            type: "code-output",
            difficulty: "hard",
            tags: ["flex嵌套"],
            question: "flex容器嵌套flex容器，内层项目会受外层影响吗？",
            options: ["不会，各自独立", "会，外层控制内层", "取决于设置", "只影响主轴"],
            correctAnswer: "A",
            explanation: { title: "flex嵌套", sections: [{ title: "独立", content: "每个flex容器独立管理自己的项目，嵌套不会相互影响" }] }
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["flex性能"],
            question: "频繁改变flex-grow会导致什么问题？",
            options: [
                "触发布局重排(reflow)",
                "触发重绘(repaint)",
                "无影响",
                "仅触发合成"
            ],
            correctAnswer: "A",
            explanation: { title: "性能", sections: [{ title: "影响", content: "flex-grow改变会触发布局重新计算。动画建议用transform" }] }
        },
        {
            type: "true-false",
            difficulty: "hard",
            tags: ["flex兼容"],
            question: "所有现代浏览器都完全支持Flexbox。",
            correctAnswer: "A",
            explanation: { title: "兼容性", sections: [{ title: "正确", content: "IE11+及所有现代浏览器支持。IE10需前缀-ms-" }] }
        },
        {
            type: "code-completion",
            difficulty: "hard",
            tags: ["flex居中"],
            question: "不定宽高元素完美居中的最简方案？",
            code: `.container {\n  display: flex;\n}\n.item {\n  ______: auto;\n}`,
            options: ["margin", "padding", "position", "align"],
            correctAnswer: "A",
            explanation: { title: "居中神器", sections: [{ title: "方法", content: "flex项目设置margin: auto，四个方向自动填充，实现完美居中" }] }
        }
    ],
    navigation: {
        prev: { title: "第3章：盒模型与布局", url: "03-box-model.html" },
        next: { title: "第5章：Grid布局", url: "05-grid.html" }
    }
};
