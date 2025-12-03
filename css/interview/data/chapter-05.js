// 第5章：CSS解析机制 - 面试题（10题）
window.cssQuizData_Chapter05 = {
    config: {
        title: "CSS解析机制",
        icon: "🔍",
        description: "词法分析、CSSOM构建、@import处理",
        primaryColor: "#3b82f6",
        bgGradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
    },
    questions: [
        // 简单题3题
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["CSSOM"],
            question: "CSSOM的全称是？",
            options: ["CSS Object Model", "CSS Operation Model", "Cascading Style Object Model", "CSS Optimization Model"],
            correctAnswer: "A",
            explanation: { title: "CSSOM", sections: [{ title: "定义", content: "CSSOM（CSS Object Model）是CSS的对象模型，类似DOM是HTML的对象模型。" }] }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["@import"],
            question: "@import必须放在样式表的最前面。",
            correctAnswer: "A",
            explanation: { title: "@import位置", sections: [{ title: "正确", content: "@import规则必须在所有其他规则之前（@charset除外），否则会被忽略。" }] }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["CSS解析"],
            question: "CSS解析的第一步是？",
            options: ["词法分析", "语法分析", "CSSOM构建", "样式计算"],
            correctAnswer: "A",
            explanation: { title: "解析流程", sections: [{ title: "步骤", content: "CSS解析：词法分析（tokenization）→ 语法分析（parsing）→ CSSOM构建" }] }
        },

        // 中等题4题
        {
            type: "code-output",
            difficulty: "medium",
            tags: ["@import性能"],
            question: "@import相比<link>标签的劣势是？",
            options: [
                "阻塞渲染且串行加载",
                "不支持媒体查询",
                "兼容性差",
                "不能缓存"
            ],
            correctAnswer: "A",
            explanation: { title: "性能问题", sections: [{ title: "对比", content: "@import会阻塞渲染，且多个@import串行加载。<link>标签可并行加载，性能更好。" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["CSSOM"],
            question: "关于CSSOM，正确的是？",
            options: [
                "可通过JavaScript访问",
                "document.styleSheets返回样式表集合",
                "CSSOM与DOM结合生成渲染树",
                "CSSOM是异步构建的"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: { title: "CSSOM特性", sections: [{ title: "说明", content: "CSSOM可通过JS访问（document.styleSheets），与DOM结合生成渲染树。CSSOM构建会阻塞渲染，不是异步的。" }] }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["CSS选择器解析"],
            question: "浏览器解析CSS选择器的顺序是？",
            options: ["从右到左", "从左到右", "随机", "同时解析"],
            correctAnswer: "A",
            explanation: { title: "从右到左", sections: [{ title: "原因", content: "从右到左解析选择器可以快速过滤不匹配的元素，提高性能。如'.container .item'先找所有.item，再向上查找.container。" }] }
        },
        {
            type: "code-completion",
            difficulty: "medium",
            tags: ["document.styleSheets"],
            question: "如何获取页面的第一个样式表？",
            code: 'const sheet = ______[0];',
            options: ["document.styleSheets", "document.styles", "document.css", "window.styleSheets"],
            correctAnswer: "A",
            explanation: { title: "访问样式表", sections: [{ title: "API", content: "document.styleSheets返回StyleSheetList，包含所有样式表对象。" }] }
        },

        // 困难题3题
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["CSS解析性能"],
            question: "以下哪个选择器解析最快？",
            options: ["#id", ".class", "div", "*"],
            correctAnswer: "A",
            explanation: { title: "选择器性能", sections: [{ title: "排序", content: "ID选择器最快，因为ID是唯一的。性能排序：ID > 类 > 标签 > 通配符。但现代浏览器优化很好，差异不大。" }] }
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["CSSOM操作"],
            question: "通过CSSOM可以做什么？",
            options: [
                "动态添加/删除CSS规则",
                "修改现有规则的样式",
                "禁用整个样式表",
                "改变样式表的优先级"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: { title: "CSSOM操作", sections: [{ title: "能力", content: "可以通过sheet.insertRule()添加规则，修改rule.style，设置sheet.disabled禁用样式表。但不能直接改变优先级（由层叠算法决定）。" }] }
        },
        {
            type: "true-false",
            difficulty: "hard",
            tags: ["关键CSS"],
            question: "内联样式不会阻塞页面渲染。",
            correctAnswer: "A",
            explanation: { title: "内联样式", sections: [{ title: "正确", content: "内联样式（<style>标签）的CSS已在HTML中，不需要额外请求，不会阻塞渲染。但外部样式表会阻塞渲染。" }] }
        }
    ],
    navigation: {
        prev: { title: "第4章：基础样式属性", url: "04-basic-styles.html" },
        next: { title: "第6章：样式表加载", url: "06-stylesheet-loading.html" }
    }
};
