// 第2章：CSS选择器系统
window.cssContentData_Section02 = {
    section: {
        id: 2,
        title: "CSS选择器系统",
        icon: "🎯",
        topics: [
            {
                id: "basic-selectors",
                title: "基础选择器",
                type: "concept",
                content: {
                    description: "CSS选择器用于选取HTML元素并为其应用样式。基础选择器是最常用的选择方式。",
                    keyPoints: [
                        "标签选择器：直接使用HTML标签名，如 p { }",
                        "类选择器：使用.class名称，如 .container { }",
                        "ID选择器：使用#id名称，如 #header { }",
                        "通配符选择器：使用*匹配所有元素",
                        "属性选择器：根据属性选择元素，如 [type='text'] { }"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Selectors"
                }
            },
            {
                id: "selector-demo",
                title: "选择器示例",
                type: "interactive-demo",
                content: {
                    description: "通过实例了解不同选择器的作用范围和优先级。",
                    demo: {
                        html: '<div class="container">\n  <h1 id="title">标题</h1>\n  <p class="text">段落1</p>\n  <p>段落2</p>\n  <input type="text" placeholder="输入框">\n</div>',
                        css: '/* 标签选择器 */\np { color: blue; }\n\n/* 类选择器 */\n.text { font-weight: bold; }\n\n/* ID选择器 */\n#title { color: red; }\n\n/* 属性选择器 */\n[type="text"] { border: 2px solid green; }',
                        editable: true
                    }
                }
            },
            {
                id: "combinator-selectors",
                title: "组合选择器",
                type: "comparison",
                content: {
                    description: "组合选择器通过不同的连接符号表达元素之间的关系。",
                    items: [
                        {
                            name: "后代选择器（空格）",
                            code: 'div p { color: red; }',
                            pros: ["选择所有后代元素", "适用于深层嵌套"],
                            cons: ["性能较差", "选择范围过广"]
                        },
                        {
                            name: "子选择器（>）",
                            code: 'div > p { color: blue; }',
                            pros: ["只选择直接子元素", "性能更好"],
                            cons: ["不能选择孙元素"]
                        },
                        {
                            name: "相邻兄弟（+）",
                            code: 'h1 + p { margin-top: 0; }',
                            pros: ["精确选择紧邻元素", "常用于首段特殊样式"],
                            cons: ["只能选择一个元素"]
                        },
                        {
                            name: "通用兄弟（~）",
                            code: 'h1 ~ p { color: gray; }',
                            pros: ["选择所有后续兄弟", "灵活性高"],
                            cons: ["不包含前面的兄弟"]
                        }
                    ]
                }
            },
            {
                id: "pseudo-classes",
                title: "伪类选择器",
                type: "code-example",
                content: {
                    description: "伪类用于定义元素的特殊状态，使用单冒号(:)语法。",
                    examples: [
                        {
                            title: "用户行为伪类",
                            code: 'a:hover { color: red; }\na:active { color: blue; }\ninput:focus { border-color: green; }',
                            result: "鼠标悬停、点击、获得焦点时改变样式"
                        },
                        {
                            title: "结构伪类",
                            code: 'li:first-child { font-weight: bold; }\nli:last-child { border: none; }\nli:nth-child(odd) { background: #f0f0f0; }',
                            result: "选择第一个、最后一个、奇数位置的元素"
                        },
                        {
                            title: "表单伪类",
                            code: 'input:checked { outline: 2px solid blue; }\ninput:disabled { opacity: 0.5; }\ninput:valid { border-color: green; }',
                            result: "选中、禁用、验证通过的表单元素"
                        }
                    ]
                }
            },
            {
                id: "pseudo-elements",
                title: "伪元素选择器",
                type: "interactive-demo",
                content: {
                    description: "伪元素用于创建虚拟元素，使用双冒号(::)语法。",
                    demo: {
                        html: '<p class="quote">这是一段引用文本</p>\n<p class="note">重要提示内容</p>',
                        css: '/* 在前面插入内容 */\n.quote::before {\n  content: "📌 ";\n  color: blue;\n}\n\n/* 在后面插入内容 */\n.quote::after {\n  content: " ✓";\n  color: green;\n}\n\n/* 首字母样式 */\n.note::first-letter {\n  font-size: 2em;\n  color: red;\n}',
                        editable: true
                    }
                }
            },
            {
                id: "specificity",
                title: "选择器优先级（特异性）",
                type: "principle",
                content: {
                    description: "当多个规则应用到同一元素时，特异性决定哪个规则生效。",
                    mechanism: "特异性用四元组(a,b,c,d)表示，按从左到右比较，数值大的优先级高。",
                    steps: [
                        "a: 内联样式（style属性），值为1或0",
                        "b: ID选择器的数量",
                        "c: 类选择器、属性选择器、伪类的数量",
                        "d: 标签选择器、伪元素的数量",
                        "!important 优先级最高，覆盖所有规则"
                    ],
                    code: '/* (0,0,0,1) = 1 */\np { color: red; }\n\n/* (0,0,1,1) = 11 */\np.text { color: blue; }\n\n/* (0,1,0,1) = 101 */\n#main p { color: green; }\n\n/* (1,0,0,0) = 1000 */\n<p style="color: yellow;">最高优先级</p>\n\n/* 最高优先级 */\np { color: purple !important; }'
                }
            },
            {
                id: "attribute-selectors",
                title: "属性选择器高级用法",
                type: "code-example",
                content: {
                    description: "属性选择器可以根据属性值的不同匹配方式选择元素。",
                    examples: [
                        {
                            title: "精确匹配",
                            code: '[type="text"] { border: 1px solid blue; }\n[class="btn"] { padding: 10px; }',
                            result: "完全匹配属性值"
                        },
                        {
                            title: "开头匹配",
                            code: '[href^="https"] { color: green; }\n[class^="btn-"] { border-radius: 4px; }',
                            result: "匹配以指定值开头的属性"
                        },
                        {
                            title: "结尾匹配",
                            code: '[href$=".pdf"] { background: url(pdf-icon.png); }\n[src$=".png"] { border: 1px solid gray; }',
                            result: "匹配以指定值结尾的属性"
                        },
                        {
                            title: "包含匹配",
                            code: '[class*="btn"] { cursor: pointer; }\n[title*="重要"] { color: red; }',
                            result: "包含指定子串即可匹配"
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "第1章：CSS核心概念", url: "01-basics.html" },
        next: { title: "第3章：盒模型与布局", url: "03-box-model.html" }
    }
};
