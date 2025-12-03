// 第5章：Grid网格布局 - 面试题（30题）
window.cssQuizData_Chapter05 = {
    config: {
        title: "Grid网格布局",
        icon: "🔲",
        description: "grid容器、网格线、网格轨道、区域布局",
        primaryColor: "#06b6d4",
        bgGradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
    },
    questions: [
        // 简单10题
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["Grid基础"],
            question: "如何创建grid容器？",
            options: ["display: grid", "grid: auto", "layout: grid", "flex: grid"],
            correctAnswer: "A",
            explanation: { title: "创建Grid", sections: [{ title: "属性", content: "display: grid 或 display: inline-grid" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["列定义"],
            question: "grid-template-columns: 100px 200px 100px 的含义？",
            options: ["三列，宽度分别为100px 200px 100px", "三行", "总宽400px", "三个网格"],
            correctAnswer: "A",
            explanation: { title: "列定义", sections: [{ title: "语法", content: "每个值定义一列的宽度" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["fr单位"],
            question: "fr是fraction（份数）的缩写，表示可用空间的份数。",
            correctAnswer: "A",
            explanation: { title: "fr单位", sections: [{ title: "正确", content: "1fr表示1份可用空间，grid-template-columns: 1fr 2fr 表示1:2分配" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "easy",
            tags: ["gap"],
            question: "以下哪些可以设置网格间距？（多选）",
            options: ["gap", "grid-gap", "row-gap", "column-gap"],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "间距", sections: [{ title: "属性", content: "gap是grid-gap的新名称。row-gap/column-gap分别设置行列间距" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["repeat"],
            question: "repeat(3, 100px)的含义？",
            options: ["重复3次100px", "100px重复", "3个100px的和", "无效语法"],
            correctAnswer: "A",
            explanation: { title: "repeat函数", sections: [{ title: "语法", content: "repeat(次数, 尺寸)，简化重复定义" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["对齐"],
            question: "justify-items控制网格项在单元格内的水平对齐。",
            correctAnswer: "A",
            explanation: { title: "对齐", sections: [{ title: "正确", content: "justify-items水平，align-items垂直" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["自动填充"],
            question: "auto-fill和auto-fit的共同点？",
            options: ["都用于自动填充轨道", "都是长度单位", "都用于对齐", "都是颜色值"],
            correctAnswer: "A",
            explanation: { title: "自动填充", sections: [{ title: "用途", content: "与repeat配合，自动计算列数" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "easy",
            tags: ["网格线"],
            question: "网格线编号的规则？（多选）",
            options: [
                "从1开始编号",
                "负数从末尾开始",
                "-1表示最后一条线",
                "可以命名"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "网格线", sections: [{ title: "规则", content: "1开始，-1结束，可命名：[name]" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["grid-column"],
            question: "grid-column: 1 / 3 表示跨越第1和第2列。",
            correctAnswer: "A",
            explanation: { title: "跨列", sections: [{ title: "正确", content: "从第1条线到第3条线，跨2列" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["minmax"],
            question: "minmax(100px, 1fr)的含义？",
            options: [
                "最小100px，最大1fr",
                "最小1fr，最大100px",
                "固定100px",
                "无效语法"
            ],
            correctAnswer: "A",
            explanation: { title: "minmax函数", sections: [{ title: "弹性尺寸", content: "定义尺寸范围，响应式必备" }] }
        },

        // 中等10题
        {
            type: "code-output",
            difficulty: "medium",
            tags: ["fr计算"],
            question: "grid-template-columns: 100px 1fr 2fr，容器600px，中间列多宽？",
            options: ["166.67px", "200px", "250px", "150px"],
            correctAnswer: "A",
            explanation: { title: "fr计算", sections: [{ title: "分析", content: "600-100=500px可用。1fr+2fr=3份，1份≈166.67px" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["grid-template-areas"],
            question: "关于grid-template-areas，以下正确的是？（多选）",
            options: [
                "可以直观定义布局",
                "使用字符串表示区域",
                "点号.表示空单元格",
                "区域必须是矩形"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "区域布局", sections: [{ title: "特性", content: "直观、强大，但必须是矩形区域" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["auto-fill vs auto-fit"],
            question: "auto-fill和auto-fit的主要区别？",
            options: [
                "auto-fit会折叠空轨道，auto-fill保留",
                "完全相同",
                "auto-fill更快",
                "auto-fit不支持fr"
            ],
            correctAnswer: "A",
            explanation: { title: "对比", sections: [{ title: "区别", content: "auto-fill保留空轨道，auto-fit折叠空轨道使已有轨道扩展" }] }
        },
        {
            type: "code-completion",
            difficulty: "medium",
            tags: ["span"],
            question: "如何让项目跨越3列？",
            code: `.item {\n  grid-column: ______;\n}`,
            options: ["span 3", "1 / 4", "3", "auto / span 3"],
            correctAnswer: "A",
            explanation: { title: "跨列", sections: [{ title: "方法", content: "span 3 或 1 / 4 或 1 / span 3" }] }
        },
        {
            type: "true-false",
            difficulty: "medium",
            tags: ["grid嵌套"],
            question: "Grid项目可以同时是Grid容器（嵌套Grid）。",
            correctAnswer: "A",
            explanation: { title: "嵌套", sections: [{ title: "正确", content: "Grid可以任意嵌套，subgrid让子网格继承父网格" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["dense"],
            question: "grid-auto-flow: dense的作用？",
            options: [
                "紧密填充，避免空隙",
                "增加间距",
                "改变方向",
                "无效果"
            ],
            correctAnswer: "A",
            explanation: { title: "dense", sections: [{ title: "紧密排列", content: "尝试填充前面的空隙，但可能改变视觉顺序" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["对齐"],
            question: "Grid中的对齐属性？（多选）",
            options: [
                "justify-items / justify-self",
                "align-items / align-self",
                "justify-content / align-content",
                "place-items / place-content"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "对齐系统", sections: [{ title: "完整", content: "items单元格内对齐，content网格对齐，place是简写" }] }
        },
        {
            type: "code-output",
            difficulty: "medium",
            tags: ["grid-auto-rows"],
            question: "grid-auto-rows: 100px的作用？",
            options: [
                "隐式行高度为100px",
                "所有行100px",
                "第一行100px",
                "无效果"
            ],
            correctAnswer: "A",
            explanation: { title: "隐式网格", sections: [{ title: "自动行", content: "未在template中定义的行使用auto-rows高度" }] }
        },
        {
            type: "true-false",
            difficulty: "medium",
            tags: ["重叠"],
            question: "Grid项目可以通过指定相同的网格线位置实现重叠。",
            correctAnswer: "A",
            explanation: { title: "重叠", sections: [{ title: "正确", content: "Grid允许项目重叠，用z-index控制层级" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["fit-content"],
            question: "fit-content(200px)的含义？",
            options: [
                "内容宽度，最大200px",
                "固定200px",
                "最小200px",
                "无效语法"
            ],
            correctAnswer: "A",
            explanation: { title: "fit-content", sections: [{ title: "自适应", content: "min(max-content, max(min-content, 参数))" }] }
        },

        // 困难10题
        {
            type: "code-output",
            difficulty: "hard",
            tags: ["复杂计算"],
            question: "grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))，容器500px，几列？",
            options: ["2列", "3列", "1列", "4列"],
            correctAnswer: "A",
            explanation: { title: "响应式网格", sections: [{ title: "计算", content: "auto-fit尽可能多列。500/200=2.5，取2列，每列250px" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["Grid特性"],
            question: "Grid相比Flexbox的优势？（多选）",
            options: [
                "二维布局更强大",
                "更精确的控制",
                "支持重叠布局",
                "更适合整体布局"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: { title: "Grid vs Flex", sections: [{ title: "选择", content: "Grid: 二维、页面级。Flex: 一维、组件级" }] }
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["subgrid"],
            question: "subgrid的作用？",
            options: [
                "让子网格继承父网格的轨道定义",
                "创建嵌套网格",
                "缩小网格",
                "无效属性"
            ],
            correctAnswer: "A",
            explanation: { title: "subgrid", sections: [{ title: "继承", content: "grid-template-columns: subgrid 继承父网格，实现跨层对齐" }] }
        },
        {
            type: "code-completion",
            difficulty: "hard",
            tags: ["命名线"],
            question: "如何使用命名网格线？",
            code: `grid-template-columns: [start] 1fr [middle] 1fr [end];\ngrid-column: ______ / ______;`,
            options: ["start / middle", "1 / 2", "[start] / [middle]", "start-1 / middle-1"],
            correctAnswer: "A",
            explanation: { title: "命名线", sections: [{ title: "使用", content: "定义时用[name]，使用时直接用name" }] }
        },
        {
            type: "true-false",
            difficulty: "hard",
            tags: ["性能"],
            question: "Grid布局比表格布局性能更好。",
            correctAnswer: "A",
            explanation: { title: "性能", sections: [{ title: "正确", content: "Grid是现代布局，比table语义更好、性能更优、更灵活" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["masonry"],
            question: "Grid的masonry（瀑布流）布局？（多选）",
            options: [
                "grid-template-rows: masonry",
                "需要JavaScript辅助",
                "Firefox实验性支持",
                "完全不支持"
            ],
            correctAnswer: ["A", "C"],
            explanation: { title: "masonry", sections: [{ title: "状态", content: "CSS Grid Level 3提案，Firefox实验性支持，其他浏览器需JS" }] }
        },
        {
            type: "code-output",
            difficulty: "hard",
            tags: ["grid-area"],
            question: "grid-area: 1 / 2 / 3 / 4的含义？",
            options: [
                "row-start / col-start / row-end / col-end",
                "top / right / bottom / left",
                "x / y / width / height",
                "无效语法"
            ],
            correctAnswer: "A",
            explanation: { title: "grid-area简写", sections: [{ title: "顺序", content: "grid-row-start / grid-column-start / grid-row-end / grid-column-end" }] }
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["兼容性"],
            question: "IE浏览器对Grid的支持？",
            options: [
                "IE10/11部分支持旧语法(-ms-)",
                "完全支持",
                "完全不支持",
                "只支持IE11"
            ],
            correctAnswer: "A",
            explanation: { title: "兼容性", sections: [{ title: "历史", content: "IE10/11支持旧语法-ms-grid。现代浏览器完全支持" }] }
        },
        {
            type: "true-false",
            difficulty: "hard",
            tags: ["margin auto"],
            question: "Grid项目使用margin: auto可以在单元格内居中。",
            correctAnswer: "A",
            explanation: { title: "居中", sections: [{ title: "正确", content: "Grid和Flex项目的margin: auto都可以实现居中" }] }
        },
        {
            type: "code-completion",
            difficulty: "hard",
            tags: ["响应式"],
            question: "12列响应式网格系统？",
            code: `.grid {\n  display: grid;\n  grid-template-columns: ______;\n}`,
            options: [
                "repeat(12, 1fr)",
                "repeat(12, auto)",
                "12 * 1fr",
                "1fr * 12"
            ],
            correctAnswer: "A",
            explanation: { title: "12列系统", sections: [{ title: "经典", content: "repeat(12, 1fr)创建12等分列，项目用span控制宽度" }] }
        }
    ],
    navigation: {
        prev: { title: "第4章：Flexbox布局", url: "04-flexbox.html" },
        next: { title: "第6章：定位机制", url: "06-positioning.html" }
    }
};
