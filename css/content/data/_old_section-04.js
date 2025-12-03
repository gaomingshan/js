// 第4章：Flexbox弹性布局
window.cssContentData_Section04 = {
    section: {
        id: 4,
        title: "Flexbox弹性布局",
        icon: "📐",
        topics: [
            {
                id: "flex-intro",
                title: "Flexbox简介",
                type: "concept",
                content: {
                    description: "Flexbox（弹性盒子布局）是一种一维布局模型，主要用于在容器内排列项目，提供强大的对齐和空间分配能力。",
                    keyPoints: [
                        "一维布局：沿主轴方向排列元素（行或列）",
                        "自动分配空间：项目可以自动伸缩填充可用空间",
                        "强大对齐：提供多种对齐方式",
                        "适用场景：导航栏、工具栏、卡片布局、居中对齐等",
                        "两个角色：flex容器（container）和flex项目（items）"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout"
                }
            },
            {
                id: "flex-container",
                title: "Flex容器属性",
                type: "code-example",
                content: {
                    description: "设置display: flex将元素变为flex容器，其直接子元素自动成为flex项目。",
                    examples: [
                        {
                            title: "创建flex容器",
                            code: '.container {\n  display: flex;  /* 或 inline-flex */\n}',
                            result: "子元素自动变为flex项目"
                        },
                        {
                            title: "flex-direction（主轴方向）",
                            code: '.container {\n  flex-direction: row;         /* 水平，默认 */\n  /* flex-direction: column;    垂直 */\n  /* flex-direction: row-reverse;    水平反向 */\n  /* flex-direction: column-reverse; 垂直反向 */\n}',
                            result: "控制主轴方向"
                        },
                        {
                            title: "flex-wrap（换行）",
                            code: '.container {\n  flex-wrap: nowrap;  /* 不换行，默认 */\n  /* flex-wrap: wrap;      允许换行 */\n  /* flex-wrap: wrap-reverse; 反向换行 */\n}',
                            result: "控制是否换行"
                        }
                    ]
                }
            },
            {
                id: "justify-align",
                title: "对齐属性",
                type: "interactive-demo",
                content: {
                    description: "justify-content控制主轴对齐，align-items控制交叉轴对齐。",
                    demo: {
                        html: '<div class="container">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n</div>',
                        css: '.container {\n  display: flex;\n  height: 200px;\n  background: #f0f0f0;\n  /* 主轴对齐 */\n  justify-content: center;\n  /* flex-start | flex-end | center | space-between | space-around | space-evenly */\n  \n  /* 交叉轴对齐 */\n  align-items: center;\n  /* flex-start | flex-end | center | baseline | stretch */\n}\n\n.item {\n  width: 80px;\n  height: 80px;\n  background: lightblue;\n  margin: 5px;\n}',
                        editable: true
                    }
                }
            },
            {
                id: "flex-items",
                title: "Flex项目属性",
                type: "principle",
                content: {
                    description: "flex项目可以通过flex属性控制伸缩行为。",
                    mechanism: "flex是flex-grow、flex-shrink和flex-basis的简写，控制项目如何分配空间。",
                    steps: [
                        "flex-grow：放大比例，默认0（不放大）",
                        "flex-shrink：缩小比例，默认1（允许缩小）",
                        "flex-basis：主轴上的初始大小，默认auto",
                        "flex: 1 = flex: 1 1 0%（平均分配空间）",
                        "flex: auto = flex: 1 1 auto（考虑内容大小）",
                        "flex: none = flex: 0 0 auto（固定大小）"
                    ],
                    code: '.item {\n  flex: 1;  /* 平均分配 */\n}\n\n.item1 { flex: 1; }  /* 占1份 */\n.item2 { flex: 2; }  /* 占2份 */\n.item3 { flex: 1; }  /* 占1份 */\n/* 比例 1:2:1 */'
                }
            },
            {
                id: "flex-demo",
                title: "Flex实战示例",
                type: "interactive-demo",
                content: {
                    description: "常见的Flexbox布局模式。",
                    demo: {
                        html: '<div class="navbar">\n  <div class="logo">Logo</div>\n  <div class="nav-items">\n    <a href="#">首页</a>\n    <a href="#">产品</a>\n    <a href="#">关于</a>\n  </div>\n  <div class="user">用户</div>\n</div>',
                        css: '.navbar {\n  display: flex;\n  align-items: center;\n  padding: 10px 20px;\n  background: #333;\n  color: white;\n}\n\n.logo {\n  font-weight: bold;\n  font-size: 20px;\n}\n\n.nav-items {\n  flex: 1;  /* 占据剩余空间 */\n  display: flex;\n  justify-content: center;\n  gap: 20px;\n}\n\n.nav-items a {\n  color: white;\n  text-decoration: none;\n}\n\n.user {\n  /* 固定宽度 */\n}',
                        editable: true
                    }
                }
            },
            {
                id: "flex-tips",
                title: "Flex常用技巧",
                type: "code-example",
                content: {
                    description: "Flexbox的实用技巧和模式。",
                    examples: [
                        {
                            title: "完美居中",
                            code: '.center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}',
                            result: "水平垂直居中"
                        },
                        {
                            title: "等高列",
                            code: '.container {\n  display: flex;\n}\n\n.column {\n  flex: 1;  /* 自动等高 */\n}',
                            result: "所有列自动等高"
                        },
                        {
                            title: "固定+自适应",
                            code: '.container {\n  display: flex;\n}\n\n.sidebar {\n  width: 200px;  /* 固定宽度 */\n}\n\n.main {\n  flex: 1;  /* 填充剩余空间 */\n}',
                            result: "两栏布局"
                        },
                        {
                            title: "margin auto妙用",
                            code: '.container {\n  display: flex;\n}\n\n.item:last-child {\n  margin-left: auto;  /* 推到最右边 */\n}',
                            result: "项目分组对齐"
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第3章：盒模型与布局", url: "03-box-model.html" },
        next: { title: "第5章：Grid布局", url: "05-grid.html" }
    }
};
