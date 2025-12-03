// 第10章：单位与值转换
window.cssContentData_Section10 = {
    section: {
        id: 10,
        title: "单位与值转换",
        icon: "📐",
        topics: [
            {
                id: "absolute-units",
                title: "绝对单位",
                type: "comparison",
                content: {
                    description: "绝对单位的大小是固定的，不随其他因素变化。",
                    items: [
                        {name: "px（像素）", code: "width: 100px;", pros: ["精确控制", "常用"], cons: ["不利于响应式"]},
                        {name: "pt（点）", code: "font-size: 12pt;", pros: ["印刷单位", "1pt=1/72英寸"], cons: ["屏幕显示不准确"]},
                        {name: "cm/mm/in", code: "width: 10cm;", pros: ["物理单位"], cons: ["屏幕显示不可靠"]}
                    ]
                }
            },
            {
                id: "relative-units",
                title: "相对单位",
                type: "code-example",
                content: {
                    description: "相对单位相对于其他值计算，更灵活。",
                    examples: [
                        {title: "em", code: '.parent { font-size: 16px; }\n.child { \n  font-size: 2em; /* 32px */\n  padding: 1em;   /* 32px（相对自身font-size）*/\n}', result: "相对于父元素font-size或自身font-size"},
                        {title: "rem", code: 'html { font-size: 16px; }\n.element { \n  font-size: 2rem; /* 32px */\n  padding: 1rem;   /* 16px */\n}', result: "相对于根元素font-size"},
                        {title: "vw/vh", code: '.element {\n  width: 50vw;  /* 视口宽度的50% */\n  height: 100vh; /* 视口高度的100% */\n}', result: "相对于视口尺寸"},
                        {title: "%", code: '.parent { width: 400px; }\n.child { width: 50%; /* 200px */ }', result: "相对于父元素对应属性"}
                    ]
                }
            },
            {
                id: "calc",
                title: "calc()函数",
                type: "interactive-demo",
                content: {
                    description: "calc()允许进行数学计算，混合不同单位。",
                    demo: {
                        html: '<div class="box">calc示例</div>',
                        css: '.box {\n  /* 混合单位计算 */\n  width: calc(100% - 50px);\n  \n  /* 复杂计算 */\n  padding: calc(1em + 10px);\n  \n  /* 嵌套calc */\n  margin: calc(calc(100% / 3) - 20px);\n  \n  /* 变量计算 */\n  --spacing: 10px;\n  gap: calc(var(--spacing) * 2);\n}',
                        editable: true
                    }
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第9章：样式值计算", url: "09-computed-values.html" },
        next: { title: "第11章：包含块", url: "11-containing-block.html" }
    }
};
