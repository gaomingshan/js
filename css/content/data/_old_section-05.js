// 第5章：Grid网格布局
window.cssContentData_Section05 = {
    section: {
        id: 5,
        title: "Grid网格布局",
        icon: "🔲",
        topics: [
            {
                id: "grid-intro",
                title: "Grid布局简介",
                type: "concept",
                content: {
                    description: "CSS Grid是最强大的二维布局系统，可以同时控制行和列，非常适合页面级布局。",
                    keyPoints: [
                        "二维布局：同时控制行和列",
                        "网格系统：基于行列的布局模型",
                        "灵活强大：支持复杂的布局需求",
                        "适用场景：页面布局、仪表板、图片画廊等",
                        "两个角色：grid容器和grid项目"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout"
                }
            },
            {
                id: "grid-container",
                title: "Grid容器基础",
                type: "code-example",
                content: {
                    description: "使用display: grid创建网格容器，然后定义行列。",
                    examples: [
                        {
                            title: "创建Grid容器",
                            code: '.container {\n  display: grid;  /* 或 inline-grid */\n}',
                            result: "子元素自动成为grid项目"
                        },
                        {
                            title: "定义列",
                            code: '.container {\n  display: grid;\n  grid-template-columns: 200px 1fr 200px;\n  /* 三列：固定 自适应 固定 */\n}',
                            result: "创建三列布局"
                        },
                        {
                            title: "定义行",
                            code: '.container {\n  display: grid;\n  grid-template-rows: 100px auto 100px;\n  /* 三行：固定 自适应 固定 */\n}',
                            result: "创建三行布局"
                        },
                        {
                            title: "使用repeat",
                            code: '.container {\n  grid-template-columns: repeat(3, 1fr);\n  /* 等同于: 1fr 1fr 1fr */\n}',
                            result: "重复创建相同轨道"
                        }
                    ]
                }
            },
            {
                id: "grid-gap",
                title: "网格间距",
                type: "interactive-demo",
                content: {
                    description: "使用gap设置网格项目之间的间距。",
                    demo: {
                        html: '<div class="grid">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n  <div class="item">4</div>\n  <div class="item">5</div>\n  <div class="item">6</div>\n</div>',
                        css: '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;  /* 行列间距 */\n  /* 或分别设置 */\n  /* row-gap: 20px; */\n  /* column-gap: 10px; */\n}\n\n.item {\n  background: lightblue;\n  padding: 20px;\n  text-align: center;\n}',
                        editable: true
                    }
                }
            },
            {
                id: "grid-fr",
                title: "fr单位和自适应",
                type: "principle",
                content: {
                    description: "fr（fraction）单位表示可用空间的份数，是Grid布局的核心特性。",
                    mechanism: "fr单位会自动计算可用空间并按比例分配，非常适合响应式布局。",
                    steps: [
                        "1fr表示1份可用空间",
                        "2fr表示2份，是1fr的两倍",
                        "先分配固定大小，剩余空间按fr比例分配",
                        "可与其他单位混用：200px 1fr 2fr",
                        "repeat(auto-fit, minmax(200px, 1fr))实现响应式"
                    ],
                    code: '.grid {\n  display: grid;\n  /* 1:2:1 比例 */\n  grid-template-columns: 1fr 2fr 1fr;\n}\n\n/* 固定+自适应 */\n.grid2 {\n  grid-template-columns: 200px 1fr 300px;\n  /* 200px固定 中间自适应 300px固定 */\n}'
                }
            },
            {
                id: "grid-placement",
                title: "网格项目定位",
                type: "code-example",
                content: {
                    description: "控制项目在网格中的位置和跨度。",
                    examples: [
                        {
                            title: "指定位置",
                            code: '.item {\n  grid-column: 2 / 4;  /* 从第2条线到第4条线 */\n  grid-row: 1 / 3;     /* 跨2行 */\n}',
                            result: "精确定位项目"
                        },
                        {
                            title: "使用span",
                            code: '.item {\n  grid-column: span 2;  /* 跨越2列 */\n  grid-row: span 3;     /* 跨越3行 */\n}',
                            result: "指定跨度"
                        },
                        {
                            title: "简写",
                            code: '.item {\n  grid-area: 1 / 2 / 3 / 4;\n  /* row-start / col-start / row-end / col-end */\n}',
                            result: "一次性设置四个值"
                        }
                    ]
                }
            },
            {
                id: "grid-template-areas",
                title: "网格区域命名",
                type: "interactive-demo",
                content: {
                    description: "使用命名区域创建直观的布局。",
                    demo: {
                        html: '<div class="grid">\n  <header>Header</header>\n  <aside>Sidebar</aside>\n  <main>Main Content</main>\n  <footer>Footer</footer>\n</div>',
                        css: '.grid {\n  display: grid;\n  grid-template-areas:\n    "header header header"\n    "sidebar main main"\n    "footer footer footer";\n  grid-template-columns: 200px 1fr 1fr;\n  grid-template-rows: 80px 1fr 60px;\n  gap: 10px;\n  height: 100vh;\n}\n\nheader { grid-area: header; background: #ff6b6b; }\naside { grid-area: sidebar; background: #4ecdc4; }\nmain { grid-area: main; background: #45b7d1; }\nfooter { grid-area: footer; background: #96ceb4; }',
                        editable: true
                    }
                }
            },
            {
                id: "grid-responsive",
                title: "响应式Grid",
                type: "code-example",
                content: {
                    description: "Grid的响应式设计技巧。",
                    examples: [
                        {
                            title: "auto-fill自动填充",
                            code: '.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n  /* 自动创建尽可能多的列 */\n}',
                            result: "列数自适应容器宽度"
                        },
                        {
                            title: "auto-fit自动适配",
                            code: '.grid {\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  /* 空轨道会折叠，已有轨道扩展 */\n}',
                            result: "更紧凑的响应式布局"
                        },
                        {
                            title: "minmax函数",
                            code: '.grid {\n  grid-template-columns: minmax(200px, 400px) 1fr;\n  /* 最小200px，最大400px */\n}',
                            result: "设置尺寸范围"
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第4章：Flexbox布局", url: "04-flexbox.html" },
        next: { title: "第6章：定位机制", url: "06-positioning.html" }
    }
};
