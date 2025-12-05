// 第9章：表格 - 面试题
window.htmlQuizData_09 = {
    config: {
        title: "表格",
        icon: "📊",
        description: "测试你对HTML表格标签的掌握",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["table标签", "基础"],
            question: "HTML表格的基本结构包含哪些标签？",
            type: "multiple-choice",
            options: [
                "<table> - 表格容器",
                "<tr> - 表格行",
                "<td> - 单元格",
                "<th> - 表头单元格"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "表格基本结构",
                description: "HTML表格由多个嵌套标签组成。",
                sections: [
                    {
                        title: "最简单的表格",
                        code: '<table>\n  <tr>\n    <td>单元格1</td>\n    <td>单元格2</td>\n  </tr>\n  <tr>\n    <td>单元格3</td>\n    <td>单元格4</td>\n  </tr>\n</table>',
                        points: [
                            "<table>：表格容器",
                            "<tr>：表格行（table row）",
                            "<td>：数据单元格（table data）",
                            "从上到下、从左到右构建"
                        ]
                    },
                    {
                        title: "带表头的表格",
                        code: '<table>\n  <tr>\n    <th>姓名</th>\n    <th>年龄</th>\n    <th>城市</th>\n  </tr>\n  <tr>\n    <td>张三</td>\n    <td>25</td>\n    <td>北京</td>\n  </tr>\n  <tr>\n    <td>李四</td>\n    <td>30</td>\n    <td>上海</td>\n  </tr>\n</table>',
                        points: [
                            "<th>：表头单元格（table header）",
                            "语义化：标识表头",
                            "默认加粗居中",
                            "有助于可访问性"
                        ]
                    },
                    {
                        title: "CSS美化",
                        code: '<style>\ntable {\n  border-collapse: collapse;\n  width: 100%;\n}\n\nth, td {\n  border: 1px solid #ddd;\n  padding: 8px;\n  text-align: left;\n}\n\nth {\n  background-color: #4CAF50;\n  color: white;\n}\n\ntr:nth-child(even) {\n  background-color: #f2f2f2;\n}\n</style>',
                        content: "使用CSS美化表格样式。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["语义结构", "thead tbody tfoot"],
            question: "<thead>、<tbody>和<tfoot>的作用是什么？",
            type: "multiple-choice",
            options: [
                "<thead>定义表头区域",
                "<tbody>定义表格主体",
                "<tfoot>定义表尾",
                "它们都是可选的"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "表格语义结构",
                description: "thead、tbody、tfoot提供了更好的语义和功能。",
                sections: [
                    {
                        title: "完整结构",
                        code: '<table>\n  <thead>\n    <tr>\n      <th>姓名</th>\n      <th>分数</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>张三</td>\n      <td>85</td>\n    </tr>\n    <tr>\n      <td>李四</td>\n      <td>92</td>\n    </tr>\n  </tbody>\n  <tfoot>\n    <tr>\n      <td>平均分</td>\n      <td>88.5</td>\n    </tr>\n  </tfoot>\n</table>',
                        points: [
                            "<thead>：表头部分",
                            "<tbody>：数据主体",
                            "<tfoot>：表脚（汇总、合计等）",
                            "提高可读性和可维护性"
                        ]
                    },
                    {
                        title: "优势",
                        points: [
                            "语义清晰：明确各部分用途",
                            "打印：thead和tfoot可在每页重复",
                            "滚动：thead可固定在顶部",
                            "样式：便于分别设置样式",
                            "可访问性：屏幕阅读器识别"
                        ]
                    },
                    {
                        title: "固定表头",
                        code: '<style>\ntable {\n  height: 300px;\n  overflow-y: auto;\n  display: block;\n}\n\nthead {\n  position: sticky;\n  top: 0;\n  background: white;\n  z-index: 1;\n}\n\ntbody {\n  display: block;\n  max-height: 250px;\n  overflow-y: auto;\n}\n\ntr {\n  display: table;\n  width: 100%;\n  table-layout: fixed;\n}\n</style>',
                        content: "使用sticky实现滚动时表头固定。"
                    },
                    {
                        title: "多个tbody",
                        code: '<table>\n  <thead>\n    <tr><th>姓名</th><th>分数</th></tr>\n  </thead>\n  <tbody>  <!-- 第一组 -->\n    <tr><td>组1</td><td></td></tr>\n    <tr><td>张三</td><td>85</td></tr>\n    <tr><td>李四</td><td>92</td></tr>\n  </tbody>\n  <tbody>  <!-- 第二组 -->\n    <tr><td>组2</td><td></td></tr>\n    <tr><td>王五</td><td>88</td></tr>\n    <tr><td>赵六</td><td>95</td></tr>\n  </tbody>\n</table>',
                        content: "可以有多个tbody分组数据。"
                    },
                    {
                        title: "HTML5中的tfoot位置",
                        code: '<!-- HTML5允许tfoot在tbody之后 -->\n<table>\n  <thead>...</thead>\n  <tbody>...</tbody>\n  <tfoot>...</tfoot>  <!-- 可以放最后 -->\n</table>\n\n<!-- 传统HTML要求tfoot在tbody之前 -->\n<table>\n  <thead>...</thead>\n  <tfoot>...</tfoot>  <!-- 必须在tbody前 -->\n  <tbody>...</tbody>\n</table>',
                        content: "HTML5更灵活，tfoot可以在任意位置。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["colspan rowspan", "合并单元格"],
            question: "colspan和rowspan属性的作用是什么？",
            options: [
                "colspan合并列（水平方向）",
                "rowspan合并行（垂直方向）",
                "可以同时使用",
                "值必须大于0"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "单元格合并",
                description: "colspan和rowspan用于合并单元格。",
                sections: [
                    {
                        title: "colspan - 跨列",
                        code: '<table border="1">\n  <tr>\n    <td colspan="2">跨2列</td>\n  </tr>\n  <tr>\n    <td>单元格1</td>\n    <td>单元格2</td>\n  </tr>\n</table>',
                        points: [
                            "colspan=\"2\"：占据2列",
                            "后续列会被占用",
                            "该行其他td减少",
                            "默认值是1"
                        ]
                    },
                    {
                        title: "rowspan - 跨行",
                        code: '<table border="1">\n  <tr>\n    <td rowspan="2">跨2行</td>\n    <td>单元格1</td>\n  </tr>\n  <tr>\n    <td>单元格2</td>\n  </tr>\n</table>',
                        points: [
                            "rowspan=\"2\"：占据2行",
                            "下一行该位置被占用",
                            "下行td数量减少",
                            "默认值是1"
                        ]
                    },
                    {
                        title: "同时使用",
                        code: '<table border="1">\n  <tr>\n    <td colspan="2" rowspan="2">跨2列2行</td>\n    <td>A</td>\n  </tr>\n  <tr>\n    <td>B</td>\n  </tr>\n  <tr>\n    <td>C</td>\n    <td>D</td>\n    <td>E</td>\n  </tr>\n</table>',
                        content: "可以同时跨列和跨行。"
                    },
                    {
                        title: "复杂示例",
                        code: '<table border="1">\n  <tr>\n    <th colspan="3">课程表</th>\n  </tr>\n  <tr>\n    <th>时间</th>\n    <th>周一</th>\n    <th>周二</th>\n  </tr>\n  <tr>\n    <td rowspan="2">上午</td>\n    <td>语文</td>\n    <td>数学</td>\n  </tr>\n  <tr>\n    <td>英语</td>\n    <td>物理</td>\n  </tr>\n  <tr>\n    <td>下午</td>\n    <td colspan="2">体育</td>\n  </tr>\n</table>',
                        content: "课程表常用到单元格合并。"
                    },
                    {
                        title: "注意事项",
                        points: [
                            "合并后要相应减少td数量",
                            "值不能为0",
                            "值过大会被忽略",
                            "计算要准确，避免错位",
                            "复杂表格建议用可视化工具生成"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["caption", "可访问性"],
            question: "<caption>标签的作用和位置？",
            options: [
                "为表格提供标题",
                "必须是table的第一个子元素",
                "有助于可访问性",
                "可以用CSS控制位置"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<caption>表格标题",
                description: "caption为表格提供描述性标题。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<table>\n  <caption>2024年销售数据</caption>\n  <thead>\n    <tr><th>季度</th><th>销售额</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Q1</td><td>100万</td></tr>\n    <tr><td>Q2</td><td>150万</td></tr>\n  </tbody>\n</table>',
                        points: [
                            "描述表格内容",
                            "必须是<table>的第一个子元素",
                            "在thead之前",
                            "语义化标题"
                        ]
                    },
                    {
                        title: "可访问性",
                        points: [
                            "屏幕阅读器会首先读取caption",
                            "帮助用户快速了解表格内容",
                            "比单独的标题更好",
                            "caption与table明确关联",
                            "WCAG推荐使用"
                        ]
                    },
                    {
                        title: "CSS样式",
                        code: '<style>\ncaption {\n  caption-side: top;    /* 默认 */\n  caption-side: bottom; /* 底部 */\n  \n  /* 其他样式 */\n  font-weight: bold;\n  font-size: 1.2em;\n  padding: 10px;\n  text-align: left;\n}\n</style>',
                        points: [
                            "caption-side控制位置",
                            "top：表格上方（默认）",
                            "bottom：表格下方",
                            "可以设置其他CSS样式"
                        ]
                    },
                    {
                        title: "vs 标题标签",
                        code: '<!-- 不推荐：用h2作标题 -->\n<h2>销售数据</h2>\n<table>...</table>\n\n<!-- 推荐：用caption -->\n<table>\n  <caption>销售数据</caption>\n  ...\n</table>\n\n<!-- 或结合使用 -->\n<figure>\n  <figcaption>图1：销售数据</figcaption>\n  <table>\n    <caption>2024年各季度销售额对比</caption>\n    ...\n  </table>\n</figure>',
                        content: "caption与表格的关联更明确。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["scope", "headers", "可访问性"],
            question: "如何提升表格的可访问性？",
            type: "multiple-choice",
            options: [
                "使用scope属性标识表头范围",
                "使用headers和id关联",
                "使用<th>而不是<td>作表头",
                "提供caption"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "表格可访问性",
                description: "正确的标记让屏幕阅读器能理解表格结构。",
                sections: [
                    {
                        title: "简单表格：scope属性",
                        code: '<table>\n  <tr>\n    <th scope="col">姓名</th>\n    <th scope="col">年龄</th>\n    <th scope="col">城市</th>\n  </tr>\n  <tr>\n    <th scope="row">张三</th>\n    <td>25</td>\n    <td>北京</td>\n  </tr>\n  <tr>\n    <th scope="row">李四</th>\n    <td>30</td>\n    <td>上海</td>\n  </tr>\n</table>',
                        points: [
                            "scope=\"col\"：列表头",
                            "scope=\"row\"：行表头",
                            "scope=\"colgroup\"：列组表头",
                            "scope=\"rowgroup\"：行组表头",
                            "屏幕阅读器读取时会关联数据"
                        ]
                    },
                    {
                        title: "复杂表格：headers和id",
                        code: '<table>\n  <tr>\n    <th id="name">姓名</th>\n    <th id="math">数学</th>\n    <th id="english">英语</th>\n  </tr>\n  <tr>\n    <th id="zhang" headers="name">张三</th>\n    <td headers="zhang math">85</td>\n    <td headers="zhang english">90</td>\n  </tr>\n  <tr>\n    <th id="li" headers="name">李四</th>\n    <td headers="li math">92</td>\n    <td headers="li english">88</td>\n  </tr>\n</table>',
                        points: [
                            "给表头设置id",
                            "数据单元格用headers引用",
                            "可以引用多个id（空格分隔）",
                            "适用于复杂的多级表头"
                        ]
                    },
                    {
                        title: "多级表头",
                        code: '<table>\n  <thead>\n    <tr>\n      <th rowspan="2" scope="col">姓名</th>\n      <th colspan="2" scope="colgroup">成绩</th>\n    </tr>\n    <tr>\n      <th scope="col">数学</th>\n      <th scope="col">英语</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th scope="row">张三</th>\n      <td>85</td>\n      <td>90</td>\n    </tr>\n  </tbody>\n</table>',
                        content: "使用colgroup和rowgroup处理多级表头。"
                    },
                    {
                        title: "其他可访问性增强",
                        code: '<table>\n  <caption>\n    学生成绩表\n    <details>\n      <summary>表格说明</summary>\n      <p>本表显示了学生的各科成绩，包括数学和英语两门课程。</p>\n    </details>\n  </caption>\n  <thead>...</thead>\n  <tbody>...</tbody>\n</table>',
                        points: [
                            "使用caption提供标题",
                            "提供详细说明",
                            "确保对比度足够",
                            "不要只用颜色传达信息",
                            "提供排序和过滤的键盘访问"
                        ]
                    },
                    {
                        title: "ARIA属性",
                        code: '<!-- 对于布局表格（不推荐） -->\n<table role="presentation">\n  <!-- 纯布局用，无语义 -->\n</table>\n\n<!-- 数据表格增强 -->\n<table aria-labelledby="table-title">\n  <caption id="table-title">销售数据</caption>\n  ...\n</table>',
                        content: "使用ARIA增强可访问性（但原生HTML更好）。"
                    }
                ]
            },
            source: "WCAG 2.1"
        },
        {
            difficulty: "medium",
            tags: ["colgroup col", "列样式"],
            question: "<colgroup>和<col>的用途是什么？",
            options: [
                "为整列设置样式",
                "定义列的属性",
                "必须在thead之前",
                "可以跨多列"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<colgroup>和<col>",
                description: "为表格的列定义属性和样式。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<table>\n  <colgroup>\n    <col style="background-color: #f0f0f0">\n    <col style="background-color: #e0e0e0">\n    <col style="background-color: #d0d0d0">\n  </colgroup>\n  <thead>\n    <tr>\n      <th>列1</th>\n      <th>列2</th>\n      <th>列3</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>数据1</td>\n      <td>数据2</td>\n      <td>数据3</td>\n    </tr>\n  </tbody>\n</table>',
                        points: [
                            "<colgroup>：列组容器",
                            "<col>：单个列",
                            "必须在thead之前",
                            "为整列设置属性"
                        ]
                    },
                    {
                        title: "span属性",
                        code: '<table>\n  <colgroup>\n    <col>  <!-- 第1列 -->\n    <col span="2" style="background: yellow">  <!-- 第2-3列 -->\n    <col>  <!-- 第4列 -->\n  </colgroup>\n  ...\n</table>',
                        content: "span属性让一个col应用于多列。"
                    },
                    {
                        title: "列组",
                        code: '<table>\n  <colgroup span="2" class="group1"></colgroup>\n  <colgroup span="3" class="group2"></colgroup>\n  <thead>\n    <tr>\n      <th colspan="2">组1</th>\n      <th colspan="3">组2</th>\n    </tr>\n  </thead>\n  ...\n</table>',
                        content: "colgroup可以分组多列。"
                    },
                    {
                        title: "样式限制",
                        code: '<style>\n/* 可以设置的属性（有限）：*/\ncol {\n  background-color: yellow;  /* ✓ */\n  width: 200px;              /* ✓ */\n  border: 1px solid red;     /* ✓（但效果有限） */\n  visibility: collapse;      /* ✓ */\n}\n\n/* 不能设置的：*/\ncol {\n  padding: 10px;     /* ✗ 无效 */\n  text-align: left;  /* ✗ 无效 */\n  font-size: 14px;   /* ✗ 无效 */\n}\n</style>',
                        points: [
                            "只有部分CSS属性有效",
                            "主要：background、width、border、visibility",
                            "不支持：padding、text-align、font等",
                            "实用性有限"
                        ]
                    },
                    {
                        title: "实际应用",
                        code: '<table>\n  <colgroup>\n    <col style="width: 30%">\n    <col style="width: 50%">\n    <col style="width: 20%">\n  </colgroup>\n  ...\n</table>\n\n<style>\n/* 或用CSS */\ntable col:nth-child(1) { width: 30%; }\ntable col:nth-child(2) { width: 50%; }\ntable col:nth-child(3) { width: 20%; }\n</style>',
                        content: "主要用于设置列宽，但CSS类选择器更灵活。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["布局", "反模式"],
            question: "为什么不应该用表格做网页布局？",
            type: "multiple-choice",
            options: [
                "表格是用于数据展示的",
                "不利于响应式设计",
                "影响可访问性",
                "HTML5已完全禁止"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "表格布局的问题",
                description: "表格应该用于表格数据，而不是布局。",
                sections: [
                    {
                        title: "历史背景",
                        points: [
                            "90年代：CSS不成熟",
                            "用表格实现复杂布局",
                            "嵌套表格创建网格",
                            "当时的常见做法",
                            "现在不应该再用"
                        ]
                    },
                    {
                        title: "表格布局的问题",
                        points: [
                            "语义错误：table是数据表格，不是布局工具",
                            "可访问性差：屏幕阅读器误读为数据表",
                            "不响应式：难以适配不同屏幕",
                            "性能差：浏览器必须等整个表格加载完才能渲染",
                            "难维护：嵌套表格代码复杂",
                            "SEO不友好：搜索引擎难以理解"
                        ]
                    },
                    {
                        title: "错误示例",
                        code: '<!-- 不要这样做！ -->\n<table>\n  <tr>\n    <td colspan="3"><!-- 页头 --></td>\n  </tr>\n  <tr>\n    <td><!-- 侧边栏 --></td>\n    <td><!-- 主内容 --></td>\n    <td><!-- 右侧栏 --></td>\n  </tr>\n  <tr>\n    <td colspan="3"><!-- 页脚 --></td>\n  </tr>\n</table>',
                        content: "这是1990年代的做法，现在是错误的。"
                    },
                    {
                        title: "正确的布局方式",
                        code: '<!-- 使用语义化HTML + CSS -->\n<header>...</header>\n<div class="container">\n  <aside>侧边栏</aside>\n  <main>主内容</main>\n  <aside>右侧栏</aside>\n</div>\n<footer>...</footer>\n\n<style>\n/* Flexbox布局 */\n.container {\n  display: flex;\n}\n\n/* 或Grid布局 */\n.container {\n  display: grid;\n  grid-template-columns: 200px 1fr 200px;\n}\n</style>',
                        content: "使用Flexbox或Grid进行布局。"
                    },
                    {
                        title: "例外情况",
                        code: '<!-- 唯一可接受的布局表格：HTML邮件 -->\n<!-- 因为邮件客户端CSS支持有限 -->\n<table role="presentation" style="width:100%">\n  <tr>\n    <td>内容</td>\n  </tr>\n</table>',
                        points: [
                            "HTML邮件：可以用表格布局",
                            "原因：邮件客户端CSS支持差",
                            "添加role='presentation'",
                            "这是唯一的例外情况"
                        ]
                    }
                ]
            },
            source: "Web标准"
        },
        {
            difficulty: "hard",
            tags: ["响应式", "移动端"],
            question: "如何让表格响应式（移动端友好）？",
            type: "multiple-choice",
            options: [
                "横向滚动",
                "转换为卡片布局",
                "隐藏次要列",
                "使用CSS Grid重排"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "响应式表格",
                description: "表格在小屏幕上很难显示，需要特殊处理。",
                sections: [
                    {
                        title: "方案1：横向滚动",
                        code: '<div class="table-container">\n  <table>...</table>\n</div>\n\n<style>\n.table-container {\n  overflow-x: auto;\n  -webkit-overflow-scrolling: touch;\n}\n\ntable {\n  min-width: 600px;  /* 保持最小宽度 */\n}\n</style>',
                        points: [
                            "最简单的方案",
                            "保持表格结构",
                            "用户可以横向滚动",
                            "适合列不多的表格"
                        ]
                    },
                    {
                        title: "方案2：隐藏次要列",
                        code: '<table>\n  <thead>\n    <tr>\n      <th>姓名</th>\n      <th>邮箱</th>\n      <th class="hide-mobile">电话</th>\n      <th class="hide-mobile">地址</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>张三</td>\n      <td>zhang@example.com</td>\n      <td class="hide-mobile">1380013800</td>\n      <td class="hide-mobile">北京</td>\n    </tr>\n  </tbody>\n</table>\n\n<style>\n@media (max-width: 768px) {\n  .hide-mobile {\n    display: none;\n  }\n}\n</style>',
                        content: "小屏幕只显示核心信息。"
                    },
                    {
                        title: "方案3：转换为卡片布局",
                        code: '<table>\n  <thead>\n    <tr>\n      <th>姓名</th>\n      <th>邮箱</th>\n      <th>电话</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td data-label="姓名">张三</td>\n      <td data-label="邮箱">zhang@example.com</td>\n      <td data-label="电话">1380013800</td>\n    </tr>\n  </tbody>\n</table>\n\n<style>\n@media (max-width: 768px) {\n  thead {\n    display: none;\n  }\n  \n  tr {\n    display: block;\n    margin-bottom: 20px;\n    border: 1px solid #ddd;\n    padding: 10px;\n  }\n  \n  td {\n    display: block;\n    text-align: right;\n    padding: 5px;\n  }\n  \n  td::before {\n    content: attr(data-label);\n    float: left;\n    font-weight: bold;\n  }\n}\n</style>',
                        content: "小屏幕将每行变为卡片。"
                    },
                    {
                        title: "方案4：使用Grid重排",
                        code: '<style>\n@media (max-width: 768px) {\n  table, thead, tbody, tr, th, td {\n    display: block;\n  }\n  \n  thead tr {\n    position: absolute;\n    top: -9999px;\n    left: -9999px;\n  }\n  \n  tr {\n    display: grid;\n    grid-template-columns: repeat(2, 1fr);\n    gap: 10px;\n    padding: 10px;\n    border: 1px solid #ddd;\n    margin-bottom: 10px;\n  }\n  \n  td {\n    position: relative;\n    padding-left: 50%;\n  }\n  \n  td::before {\n    content: attr(data-label);\n    position: absolute;\n    left: 0;\n    width: 45%;\n    font-weight: bold;\n  }\n}\n</style>',
                        content: "使用CSS Grid重新布局。"
                    },
                    {
                        title: "方案5：JavaScript展开/收起",
                        code: '<table>\n  <tr>\n    <td>张三</td>\n    <td>zhang@example.com</td>\n    <td class="expandable">\n      <button>详情</button>\n      <div class="details" hidden>\n        <p>电话：1380013800</p>\n        <p>地址：北京市朝阳区</p>\n      </div>\n    </td>\n  </tr>\n</table>\n\n<script>\ndocument.querySelectorAll(".expandable button").forEach(btn => {\n  btn.onclick = function() {\n    const details = this.nextElementSibling;\n    details.hidden = !details.hidden;\n  };\n});\n</script>',
                        content: "在移动端提供展开按钮查看详细信息。"
                    },
                    {
                        title: "最佳实践",
                        points: [
                            "优先考虑数据重要性",
                            "简单表格：横向滚动",
                            "复杂表格：转换布局",
                            "提供筛选和搜索功能",
                            "考虑用图表替代表格",
                            "测试真实移动设备"
                        ]
                    }
                ]
            },
            source: "响应式设计最佳实践"
        },
        {
            difficulty: "medium",
            tags: ["CSS", "样式"],
            question: "border-collapse属性的作用？",
            options: [
                "控制表格边框是否合并",
                "collapse合并边框",
                "separate分离边框",
                "影响border-spacing"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "border-collapse",
                description: "控制表格单元格边框的渲染方式。",
                sections: [
                    {
                        title: "两个值",
                        code: '<style>\n/* 合并边框（常用） */\ntable {\n  border-collapse: collapse;\n}\n\n/* 分离边框（默认） */\ntable {\n  border-collapse: separate;\n}\n</style>',
                        points: [
                            "collapse：相邻边框合并为一条",
                            "separate：边框分离显示",
                            "默认：separate"
                        ]
                    },
                    {
                        title: "collapse效果",
                        code: '<style>\ntable {\n  border-collapse: collapse;\n}\n\nth, td {\n  border: 1px solid black;\n  padding: 8px;\n}\n</style>\n\n<table>\n  <tr>\n    <td>A</td>\n    <td>B</td>\n  </tr>\n  <tr>\n    <td>C</td>\n    <td>D</td>\n  </tr>\n</table>\n<!-- 边框合并，看起来更整洁 -->',
                        content: "collapse让表格边框看起来是单线。"
                    },
                    {
                        title: "separate + border-spacing",
                        code: '<style>\ntable {\n  border-collapse: separate;\n  border-spacing: 10px 5px;  /* 水平 垂直 */\n}\n\nth, td {\n  border: 1px solid black;\n}\n</style>',
                        points: [
                            "separate时可以用border-spacing",
                            "设置单元格间距",
                            "第一个值：水平间距",
                            "第二个值：垂直间距",
                            "collapse时border-spacing无效"
                        ]
                    },
                    {
                        title: "empty-cells（separate专用）",
                        code: '<style>\ntable {\n  border-collapse: separate;\n  empty-cells: hide;  /* 或 show */\n}\n</style>\n\n<table>\n  <tr>\n    <td>有内容</td>\n    <td></td>  <!-- 空单元格 -->\n  </tr>\n</table>',
                        points: [
                            "empty-cells控制空单元格",
                            "show：显示边框（默认）",
                            "hide：隐藏边框",
                            "只在separate时有效"
                        ]
                    },
                    {
                        title: "实际应用",
                        code: '/* 现代简洁样式：使用collapse */\ntable {\n  border-collapse: collapse;\n  width: 100%;\n}\n\nth, td {\n  border: 1px solid #ddd;\n  padding: 12px;\n  text-align: left;\n}\n\nth {\n  background-color: #4CAF50;\n  color: white;\n}\n\ntr:hover {\n  background-color: #f5f5f5;\n}',
                        content: "多数情况下使用collapse。"
                    }
                ]
            },
            source: "CSS规范"
        },
        {
            difficulty: "hard",
            tags: ["性能", "优化"],
            question: "大型表格的性能优化方法？",
            type: "multiple-choice",
            options: [
                "虚拟滚动",
                "分页",
                "延迟渲染",
                "简化DOM结构"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "表格性能优化",
                description: "大量数据时需要特殊的优化技术。",
                sections: [
                    {
                        title: "问题",
                        points: [
                            "大量DOM节点影响性能",
                            "初始渲染慢",
                            "滚动卡顿",
                            "内存占用高",
                            "一般超过1000行就需要优化"
                        ]
                    },
                    {
                        title: "方案1：分页",
                        code: '<table id="dataTable"></table>\n<div class="pagination">\n  <button id="prev">上一页</button>\n  <span id="pageInfo"></span>\n  <button id="next">下一页</button>\n</div>\n\n<script>\nconst data = [...];  // 全部数据\nconst pageSize = 50;\nlet currentPage = 1;\n\nfunction renderPage(page) {\n  const start = (page - 1) * pageSize;\n  const end = start + pageSize;\n  const pageData = data.slice(start, end);\n  \n  // 渲染pageData到表格\n  renderTable(pageData);\n  \n  // 更新页码\n  pageInfo.textContent = `${page} / ${Math.ceil(data.length / pageSize)}`;\n}\n</script>',
                        content: "最简单有效的方案。"
                    },
                    {
                        title: "方案2：虚拟滚动",
                        code: '// 只渲染可见行\nclass VirtualTable {\n  constructor(data, rowHeight) {\n    this.data = data;\n    this.rowHeight = rowHeight;\n    this.visibleRows = Math.ceil(window.innerHeight / rowHeight) + 2;\n  }\n  \n  getVisibleData(scrollTop) {\n    const startIndex = Math.floor(scrollTop / this.rowHeight);\n    const endIndex = startIndex + this.visibleRows;\n    return {\n      data: this.data.slice(startIndex, endIndex),\n      offset: startIndex * this.rowHeight\n    };\n  }\n}\n\n// 监听滚动\ncontainer.addEventListener("scroll", () => {\n  const { data, offset } = virtualTable.getVisibleData(container.scrollTop);\n  tbody.style.transform = `translateY(${offset}px)`;\n  renderRows(data);\n});',
                        content: "只渲染可见的行，其他行用空白占位。"
                    },
                    {
                        title: "方案3：延迟渲染",
                        code: '// 分批渲染\nfunction renderLargeTable(data) {\n  const batchSize = 100;\n  let index = 0;\n  \n  function renderBatch() {\n    const batch = data.slice(index, index + batchSize);\n    batch.forEach(row => {\n      const tr = createTableRow(row);\n      tbody.appendChild(tr);\n    });\n    \n    index += batchSize;\n    if (index < data.length) {\n      requestIdleCallback(renderBatch);  // 空闲时继续\n    }\n  }\n  \n  renderBatch();\n}',
                        content: "使用requestIdleCallback分批渲染。"
                    },
                    {
                        title: "方案4：简化结构",
                        code: '<!-- 不要过度嵌套 -->\n<table>\n  <tr>\n    <td>\n      <div>\n        <span>内容</span>  <!-- 不必要的嵌套 -->\n      </div>\n    </td>\n  </tr>\n</table>\n\n<!-- 简化 -->\n<table>\n  <tr>\n    <td>内容</td>\n  </tr>\n</table>',
                        content: "减少不必要的DOM节点。"
                    },
                    {
                        title: "方案5：使用库",
                        code: '// React Virtual: react-window\nimport { FixedSizeList } from "react-window";\n\n<FixedSizeList\n  height={600}\n  itemCount={data.length}\n  itemSize={50}\n  width="100%">\n  {Row}\n</FixedSizeList>\n\n// AG Grid: 专业表格库\nimport { AgGridReact } from "ag-grid-react";\n\n<AgGridReact\n  rowData={data}\n  columnDefs={columns}\n  pagination={true}\n  paginationPageSize={50}\n/>',
                        content: "使用专业的表格库。"
                    },
                    {
                        title: "其他优化",
                        points: [
                            "使用CSS transform而不是改变position",
                            "避免在滚动时频繁重绘",
                            "使用will-change提示浏览器",
                            "考虑Web Worker处理数据",
                            "提供搜索和筛选减少显示数据",
                            "使用CSS contain控制重绘范围"
                        ]
                    }
                ]
            },
            source: "Web性能最佳实践"
        }
    ],
    navigation: {
        prev: { title: "多媒体标签", url: "quiz.html?chapter=08" },
        next: { title: "表单基础", url: "quiz.html?chapter=10" }
    }
};
