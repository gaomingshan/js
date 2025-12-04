// 第5章：列表与定义 - 面试题
window.htmlQuizData_05 = {
    config: {
        title: "列表与定义",
        icon: "📋",
        description: "测试你对HTML列表标签的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["列表", "基础"],
            question: "HTML中有哪几种列表类型？",
            type: "multiple-choice",
            options: [
                "无序列表<ul>",
                "有序列表<ol>",
                "定义列表<dl>",
                "导航列表<nl>"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "HTML列表类型",
                description: "HTML提供三种标准列表类型。",
                points: [
                    "<ul>：无序列表（Unordered List），项目符号",
                    "<ol>：有序列表（Ordered List），数字或字母编号",
                    "<dl>：定义列表（Definition List），术语及其定义",
                    "没有<nl>标签",
                    "<menu>标签存在但很少使用"
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "easy",
            tags: ["有序列表", "属性"],
            question: "<ol>标签有哪些有用的属性？",
            type: "multiple-choice",
            options: [
                "type - 设置编号类型",
                "start - 设置起始编号",
                "reversed - 倒序编号",
                "style - 设置列表样式"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "<ol>标签属性",
                description: "有序列表有多个控制编号的属性。",
                sections: [
                    {
                        title: "type属性 - 编号类型",
                        code: '<ol type="1">  <!-- 数字：1, 2, 3... (默认) -->\n<ol type="A">  <!-- 大写字母：A, B, C... -->\n<ol type="a">  <!-- 小写字母：a, b, c... -->\n<ol type="I">  <!-- 大写罗马数字：I, II, III... -->\n<ol type="i">  <!-- 小写罗马数字：i, ii, iii... -->',
                        points: [
                            "控制编号样式",
                            "也可以用CSS的list-style-type",
                            "type属性更简洁"
                        ]
                    },
                    {
                        title: "start属性 - 起始值",
                        code: '<ol start="5">\n  <li>第5项</li>\n  <li>第6项</li>\n</ol>\n\n<ol type="A" start="3">\n  <li>C项</li>\n  <li>D项</li>\n</ol>',
                        points: [
                            "设置起始编号",
                            "必须是数字，即使type是字母",
                            "用于继续编号或跳过某些项"
                        ]
                    },
                    {
                        title: "reversed属性 - 倒序",
                        code: '<ol reversed>\n  <li>第3项</li>\n  <li>第2项</li>\n  <li>第1项</li>\n</ol>\n<!-- 显示为：3. 第3项  2. 第2项  1. 第1项 -->',
                        points: [
                            "倒序编号",
                            "布尔属性，不需要值",
                            "常用于倒计时、排行榜"
                        ]
                    },
                    {
                        title: "完整示例",
                        code: '<h3>Top 10排行榜（倒序显示）</h3>\n<ol reversed start="10">\n  <li value="10">第10名</li>\n  <li value="9">第9名</li>\n  <li value="8">第8名</li>\n</ol>'
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["列表项", "属性"],
            question: "<li>标签的value属性有什么作用？",
            options: [
                "只在<ol>中有效，设置当前项的编号",
                "在<ul>中也有效",
                "可以打乱编号顺序",
                "不存在这个属性"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "C"],
            explanation: {
                title: "<li>的value属性",
                description: "value属性允许自定义列表项的编号。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<ol>\n  <li value="1">第1项</li>\n  <li value="5">第5项</li>  <!-- 跳到5 -->\n  <li>第6项</li>  <!-- 自动继续 -->\n  <li value="10">第10项</li>  <!-- 跳到10 -->\n</ol>',
                        points: [
                            "只在<ol>中有效",
                            "后续项会从这个值继续",
                            "可以打乱顺序",
                            "在<ul>中无效"
                        ]
                    },
                    {
                        title: "使用场景",
                        code: '<!-- 场景1：跳过某些项 -->\n<ol>\n  <li>步骤1</li>\n  <li>步骤2</li>\n  <!-- 步骤3被删除 -->\n  <li value="4">步骤4</li>\n</ol>\n\n<!-- 场景2：分段列表 -->\n<h4>第一部分</h4>\n<ol>\n  <li>项目1</li>\n  <li>项目2</li>\n</ol>\n<p>说明文字...</p>\n<h4>第二部分</h4>\n<ol start="3">\n  <li>项目3</li>\n  <li>项目4</li>\n</ol>',
                        content: "用于在列表中插入其他内容时保持编号连续。"
                    },
                    {
                        title: "注意事项",
                        code: '<!-- value必须是整数 -->\n<li value="1.5">错误</li>\n<li value="abc">错误</li>\n<li value="5">正确</li>\n\n<!-- 即使type是字母，value仍然是数字 -->\n<ol type="A">\n  <li value="3">C</li>  <!-- 3对应字母C -->\n</ol>',
                        points: [
                            "value必须是整数",
                            "即使type是字母，value也是数字",
                            "数字会自动转换为对应的编号类型"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["定义列表", "语义"],
            question: "定义列表<dl>、<dt>、<dd>的正确用法是什么？",
            options: [
                "<dl>是容器，<dt>是术语，<dd>是定义",
                "一个<dt>可以对应多个<dd>",
                "多个<dt>可以共享一个<dd>",
                "只能用于词汇表"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "定义列表详解",
                description: "定义列表用于术语及其描述的配对。",
                sections: [
                    {
                        title: "基本结构",
                        code: '<dl>\n  <dt>HTML</dt>\n  <dd>超文本标记语言</dd>\n  \n  <dt>CSS</dt>\n  <dd>层叠样式表</dd>\n</dl>',
                        points: [
                            "<dl>：定义列表容器",
                            "<dt>：定义术语（Definition Term）",
                            "<dd>：定义描述（Definition Description）",
                            "dt和dd必须在dl内"
                        ]
                    },
                    {
                        title: "一对多关系",
                        code: '<!-- 一个术语，多个定义 -->\n<dl>\n  <dt>JavaScript</dt>\n  <dd>一种编程语言</dd>\n  <dd>运行在浏览器中</dd>\n  <dd>可以操作DOM</dd>\n</dl>',
                        content: "一个术语可以有多个定义/描述。"
                    },
                    {
                        title: "多对一关系",
                        code: '<!-- 多个术语，共享定义 -->\n<dl>\n  <dt>HTML</dt>\n  <dt>HyperText Markup Language</dt>\n  <dd>超文本标记语言，用于创建网页</dd>\n</dl>',
                        content: "多个相关术语可以共享一个定义。"
                    },
                    {
                        title: "使用场景",
                        code: '<!-- 元数据 -->\n<dl>\n  <dt>作者</dt>\n  <dd>张三</dd>\n  <dt>日期</dt>\n  <dd>2024-01-15</dd>\n  <dt>标签</dt>\n  <dd>HTML</dd>\n  <dd>CSS</dd>\n</dl>\n\n<!-- FAQ -->\n<dl>\n  <dt>如何注册账号？</dt>\n  <dd>点击右上角的注册按钮...</dd>\n  \n  <dt>忘记密码怎么办？</dt>\n  <dd>点击登录页面的忘记密码链接...</dd>\n</dl>\n\n<!-- 产品规格 -->\n<dl>\n  <dt>颜色</dt>\n  <dd>黑色</dd>\n  <dt>尺寸</dt>\n  <dd>14英寸</dd>\n  <dt>重量</dt>\n  <dd>1.5kg</dd>\n</dl>',
                        points: [
                            "词汇表、术语解释",
                            "元数据（作者、日期等）",
                            "FAQ问答",
                            "产品规格",
                            "对话（speaker+台词）"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["列表嵌套", "结构"],
            question: "列表可以嵌套吗？如何正确嵌套？",
            options: [
                "可以嵌套，在<li>内放置新的列表",
                "嵌套列表必须在<li>内",
                "可以无限嵌套",
                "不同类型的列表可以互相嵌套"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "列表嵌套",
                description: "列表可以嵌套，用于表示层级结构。",
                sections: [
                    {
                        title: "正确的嵌套",
                        code: '<ul>\n  <li>水果\n    <ul>\n      <li>苹果</li>\n      <li>香蕉</li>\n    </ul>\n  </li>\n  <li>蔬菜\n    <ul>\n      <li>白菜</li>\n      <li>萝卜</li>\n    </ul>\n  </li>\n</ul>',
                        points: [
                            "嵌套列表必须在<li>内",
                            "不能直接在<ul>/<ol>中嵌套",
                            "可以在<li>的任何位置"
                        ]
                    },
                    {
                        title: "错误的嵌套",
                        code: '<!-- 错误：直接在ul中嵌套 -->\n<ul>\n  <li>项目1</li>\n  <ul>  <!-- 错误！ -->\n    <li>子项目</li>\n  </ul>\n</ul>\n\n<!-- 正确写法 -->\n<ul>\n  <li>项目1\n    <ul>\n      <li>子项目</li>\n    </ul>\n  </li>\n</ul>',
                        content: "嵌套列表必须是某个<li>的子元素。"
                    },
                    {
                        title: "混合嵌套",
                        code: '<!-- ul中嵌套ol -->\n<ul>\n  <li>章节1\n    <ol>\n      <li>第1节</li>\n      <li>第2节</li>\n    </ol>\n  </li>\n</ul>\n\n<!-- ol中嵌套ul -->\n<ol>\n  <li>准备工作\n    <ul>\n      <li>安装Node.js</li>\n      <li>安装VS Code</li>\n    </ul>\n  </li>\n  <li>开始开发</li>\n</ol>',
                        content: "不同类型的列表可以互相嵌套。"
                    },
                    {
                        title: "多层嵌套",
                        code: '<ul>\n  <li>前端\n    <ul>\n      <li>HTML\n        <ul>\n          <li>标签</li>\n          <li>属性</li>\n        </ul>\n      </li>\n      <li>CSS</li>\n    </ul>\n  </li>\n</ul>',
                        content: "可以无限嵌套，但不要过深（影响可读性）。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["CSS", "样式"],
            question: "如何使用CSS自定义列表样式？",
            options: [
                "list-style-type改变标记类型",
                "list-style-image使用图片作为标记",
                "list-style-position控制标记位置",
                "::marker伪元素自定义标记样式"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "CSS列表样式",
                description: "CSS提供了丰富的列表样式控制。",
                sections: [
                    {
                        title: "list-style-type - 标记类型",
                        code: "/* 无序列表 */\nul {\n  list-style-type: disc;      /* 实心圆 */\n  list-style-type: circle;    /* 空心圆 */\n  list-style-type: square;    /* 方块 */\n  list-style-type: none;      /* 无标记 */\n}\n\n/* 有序列表 */\nol {\n  list-style-type: decimal;      /* 数字 */\n  list-style-type: upper-alpha;  /* 大写字母 */\n  list-style-type: lower-roman;  /* 小写罗马数字 */\n  list-style-type: cjk-ideographic; /* 中文数字 */\n}",
                        content: "list-style-type有20+种预定义值。"
                    },
                    {
                        title: "list-style-image - 图片标记",
                        code: "ul {\n  list-style-image: url('bullet.png');\n}\n\n/* 更好的方案：使用background */\nul {\n  list-style: none;\n}\nul li {\n  padding-left: 25px;\n  background: url('bullet.png') no-repeat left center;\n  background-size: 15px 15px;\n}",
                        content: "使用图片作为列表标记，但建议用background更灵活。"
                    },
                    {
                        title: "list-style-position - 标记位置",
                        code: "ul {\n  list-style-position: outside; /* 标记在li外（默认） */\n  list-style-position: inside;  /* 标记在li内 */\n}",
                        points: [
                            "outside：标记在内容框外",
                            "inside：标记在内容框内",
                            "影响文本对齐和换行"
                        ]
                    },
                    {
                        title: "::marker伪元素",
                        code: "/* 自定义标记样式 */\nli::marker {\n  color: red;\n  font-size: 1.2em;\n  content: '✓ ';  /* 自定义标记符号 */\n}\n\n/* 有序列表添加括号 */\nol li::marker {\n  content: counter(list-item) ') ';\n}\n\n/* 不同颜色的标记 */\nli:nth-child(1)::marker { color: red; }\nli:nth-child(2)::marker { color: blue; }",
                        content: "::marker是现代浏览器支持的强大特性。"
                    },
                    {
                        title: "完全自定义",
                        code: "/* 移除默认样式 */\nul {\n  list-style: none;\n  padding-left: 0;\n}\n\n/* 使用伪元素 */\nli::before {\n  content: '▶';\n  color: blue;\n  margin-right: 10px;\n}\n\n/* 计数器 */\nol {\n  list-style: none;\n  counter-reset: item;\n}\nol li::before {\n  counter-increment: item;\n  content: counter(item) '. ';\n  color: red;\n  font-weight: bold;\n}",
                        content: "使用伪元素和计数器可以实现完全自定义。"
                    }
                ]
            },
            source: "CSS规范"
        },
        {
            difficulty: "hard",
            tags: ["可访问性", "语义"],
            question: "列表的可访问性最佳实践是什么？",
            type: "multiple-choice",
            options: [
                "保持列表的语义结构",
                "不要用list-style:none移除标记后不提供替代",
                "使用适当的列表类型",
                "列表项要有意义的内容"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "列表可访问性",
                description: "正确使用列表标签对可访问性很重要。",
                sections: [
                    {
                        title: "保持语义结构",
                        code: "<!-- 正确：使用列表标签 -->\n<ul>\n  <li><a href=\"/home\">首页</a></li>\n  <li><a href=\"/about\">关于</a></li>\n</ul>\n\n<!-- 错误：用div模拟列表 -->\n<div class=\"list\">\n  <div class=\"item\">项目1</div>\n  <div class=\"item\">项目2</div>\n</div>",
                        points: [
                            "屏幕阅读器识别列表结构",
                            "会告知用户列表有多少项",
                            "用户可以快速跳转",
                            "不要用div模拟列表"
                        ]
                    },
                    {
                        title: "移除标记的问题",
                        code: "/* 问题：移除了视觉标记 */\nul {\n  list-style: none;\n}\n\n/* 方案1：保留语义，添加aria */\n<ul role=\"list\">\n  <li>项目1</li>\n</ul>\n\n/* 方案2：提供视觉替代 */\nli::before {\n  content: '• ';\n  color: blue;\n}",
                        points: [
                            "list-style:none可能影响可访问性",
                            "某些浏览器会移除列表语义",
                            "添加role='list'恢复语义",
                            "或提供其他视觉指示"
                        ]
                    },
                    {
                        title: "选择合适的列表类型",
                        code: "<!-- 正确：有顺序用ol -->\n<ol>\n  <li>第一步：登录</li>\n  <li>第二步：选择商品</li>\n  <li>第三步：付款</li>\n</ol>\n\n<!-- 正确：无顺序用ul -->\n<ul>\n  <li>苹果</li>\n  <li>香蕉</li>\n  <li>橙子</li>\n</ul>\n\n<!-- 正确：术语定义用dl -->\n<dl>\n  <dt>HTML</dt>\n  <dd>超文本标记语言</dd>\n</dl>",
                        content: "选择语义上正确的列表类型。"
                    },
                    {
                        title: "列表项内容",
                        code: "<!-- 好：有意义的内容 -->\n<ul>\n  <li>联系电话：123-456-7890</li>\n  <li>电子邮件：info@example.com</li>\n</ul>\n\n<!-- 不好：无意义的内容 -->\n<ul>\n  <li>•</li>  <!-- 空列表项 -->\n  <li><img src=\"icon.png\" alt=\"\"></li>  <!-- 无alt -->\n</ul>",
                        points: [
                            "列表项应包含有意义的内容",
                            "图片要有alt文本",
                            "避免空列表项"
                        ]
                    }
                ]
            },
            source: "WCAG 2.1"
        },
        {
            difficulty: "medium",
            tags: ["导航", "实践"],
            question: "为什么导航菜单通常使用列表标签？",
            options: [
                "提供语义化结构",
                "屏幕阅读器友好",
                "易于样式化",
                "这只是惯例，没有实际好处"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "导航列表最佳实践",
                description: "使用列表标签构建导航有多重好处。",
                sections: [
                    {
                        title: "基本结构",
                        code: "<nav>\n  <ul>\n    <li><a href=\"/\">首页</a></li>\n    <li><a href=\"/about\">关于</a></li>\n    <li><a href=\"/services\">服务</a></li>\n    <li><a href=\"/contact\">联系</a></li>\n  </ul>\n</nav>",
                        points: [
                            "语义清晰：导航是链接列表",
                            "结构化：便于理解和维护",
                            "可访问：屏幕阅读器友好"
                        ]
                    },
                    {
                        title: "可访问性优势",
                        points: [
                            "屏幕阅读器识别为列表",
                            "告知用户导航项数量",
                            "支持快捷键跳转",
                            "配合aria-label更好"
                        ]
                    },
                    {
                        title: "样式化",
                        code: "/* 水平导航 */\nnav ul {\n  list-style: none;\n  display: flex;\n  gap: 20px;\n}\n\n/* 垂直导航 */\nnav ul {\n  list-style: none;\n}\nnav li {\n  margin-bottom: 10px;\n}\n\n/* 下拉菜单 */\nnav ul ul {\n  display: none;\n  position: absolute;\n}\nnav li:hover > ul {\n  display: block;\n}",
                        content: "列表结构便于实现各种导航样式。"
                    },
                    {
                        title: "完整示例",
                        code: '<nav aria-label=\"主导航\">\n  <ul role=\"list\">\n    <li><a href=\"/\" aria-current=\"page\">首页</a></li>\n    <li>\n      <a href=\"/products\">产品</a>\n      <ul>\n        <li><a href=\"/products/web\">Web开发</a></li>\n        <li><a href=\"/products/mobile\">移动开发</a></li>\n      </ul>\n    </li>\n    <li><a href=\"/about\">关于我们</a></li>\n  </ul>\n</nav>',
                        points: [
                            "使用aria-label描述导航",
                            "aria-current标记当前页",
                            "role='list'确保语义",
                            "支持嵌套子菜单"
                        ]
                    }
                ]
            },
            source: "WAI-ARIA最佳实践"
        },
        {
            difficulty: "medium",
            tags: ["HTML5", "menu标签"],
            question: "<menu>标签的用途是什么？",
            options: [
                "用于创建菜单或工具栏",
                "已被废弃，不建议使用",
                "与<ul>功能类似但语义不同",
                "只能用于上下文菜单"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "C"],
            explanation: {
                title: "<menu>标签",
                description: "<menu>标签历史复杂，用途有限。",
                sections: [
                    {
                        title: "HTML5中的<menu>",
                        code: "<menu>\n  <li><button>新建</button></li>\n  <li><button>打开</button></li>\n  <li><button>保存</button></li>\n</menu>",
                        points: [
                            "用于工具栏或菜单列表",
                            "语义上与<ul>不同",
                            "<ul>是内容列表，<menu>是命令列表"
                        ]
                    },
                    {
                        title: "type属性（已废弃）",
                        code: "<!-- 这些type值已不再支持 -->\n<menu type=\"toolbar\">...</menu>\n<menu type=\"context\">...</menu>\n<menu type=\"list\">...</menu>",
                        content: "HTML5.2移除了type属性，现在<menu>等同于<ul>。"
                    },
                    {
                        title: "当前状态",
                        points: [
                            "HTML Living Standard中保留",
                            "但浏览器支持有限",
                            "默认样式与<ul>相同",
                            "实际开发中很少使用"
                        ]
                    },
                    {
                        title: "替代方案",
                        code: "<!-- 推荐：使用ul + role -->\n<ul role=\"menubar\">\n  <li role=\"menuitem\"><button>新建</button></li>\n  <li role=\"menuitem\"><button>打开</button></li>\n</ul>\n\n<!-- 或者直接使用ul -->\n<ul class=\"toolbar\">\n  <li><button>新建</button></li>\n  <li><button>打开</button></li>\n</ul>",
                        content: "实际开发中，使用<ul>配合ARIA角色更可靠。"
                    }
                ]
            },
            source: "HTML Living Standard"
        },
        {
            difficulty: "hard",
            tags: ["实践", "性能"],
            question: "大量列表项时，如何优化性能？",
            type: "multiple-choice",
            options: [
                "使用虚拟滚动技术",
                "分页加载",
                "懒加载",
                "减少DOM嵌套"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "大列表性能优化",
                description: "处理大量列表项需要特殊的优化技术。",
                sections: [
                    {
                        title: "问题",
                        points: [
                            "大量DOM节点影响渲染性能",
                            "初始加载时间长",
                            "滚动可能卡顿",
                            "内存占用高"
                        ]
                    },
                    {
                        title: "方案1：虚拟滚动",
                        code: "// 只渲染可见区域的项目\nclass VirtualList {\n  constructor(items, itemHeight) {\n    this.items = items;\n    this.itemHeight = itemHeight;\n    this.visibleCount = Math.ceil(window.innerHeight / itemHeight);\n  }\n  \n  getVisibleItems(scrollTop) {\n    const start = Math.floor(scrollTop / this.itemHeight);\n    return this.items.slice(start, start + this.visibleCount);\n  }\n}",
                        points: [
                            "只渲染可见区域的元素",
                            "滚动时动态更新",
                            "DOM节点数量固定",
                            "库：react-window、vue-virtual-scroller"
                        ]
                    },
                    {
                        title: "方案2：分页",
                        code: "<ul id=\"list\"></ul>\n<button id=\"loadMore\">加载更多</button>\n\n<script>\nlet page = 1;\nconst pageSize = 20;\n\nfunction loadPage() {\n  const items = fetchItems(page, pageSize);\n  items.forEach(item => {\n    const li = document.createElement('li');\n    li.textContent = item;\n    list.appendChild(li);\n  });\n  page++;\n}\n</script>",
                        points: [
                            "首次只加载一部分",
                            "用户触发加载更多",
                            "减少初始渲染时间"
                        ]
                    },
                    {
                        title: "方案3：Intersection Observer懒加载",
                        code: "const observer = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      loadMoreItems();\n    }\n  });\n});\n\nobserver.observe(document.querySelector('#sentinel'));",
                        points: [
                            "监听滚动到底部",
                            "自动加载下一批",
                            "无限滚动效果"
                        ]
                    },
                    {
                        title: "方案4：优化DOM结构",
                        code: "<!-- 不好：深层嵌套 -->\n<ul>\n  <li>\n    <div>\n      <div>\n        <span>内容</span>\n      </div>\n    </div>\n  </li>\n</ul>\n\n<!-- 好：扁平结构 -->\n<ul>\n  <li class=\"item\">内容</li>\n</ul>",
                        content: "减少不必要的嵌套，降低渲染复杂度。"
                    }
                ]
            },
            source: "Web性能最佳实践"
        }
    ],
    navigation: {
        prev: { title: "文本内容标签", url: "04-text-content-quiz.html" },
        next: { title: "链接与导航", url: "06-links-navigation-quiz.html" }
    }
};
