// 第4章：文本内容标签 - 面试题
window.htmlQuizData_04 = {
    config: {
        title: "文本内容标签",
        icon: "📝",
        description: "测试你对HTML文本标签的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["标题标签", "语义"],
            question: "一个页面应该有几个<h1>标签？",
            options: [
                "有且只有一个",
                "可以有多个",
                "根据内容决定",
                "没有限制"
            ],
            correctAnswer: "C",
            explanation: {
                title: "<h1>标签使用",
                description: "HTML5改变了标题标签的使用规则。",
                sections: [
                    {
                        title: "HTML5之前",
                        points: [
                            "建议每页只有一个<h1>",
                            "<h1>代表页面的主标题",
                            "对SEO很重要"
                        ]
                    },
                    {
                        title: "HTML5大纲算法（已废弃）",
                        points: [
                            "HTML5曾计划支持多个<h1>",
                            "配合<section>、<article>使用",
                            "每个区块可以有自己的<h1>",
                            "但浏览器从未实现此算法"
                        ]
                    },
                    {
                        title: "当前最佳实践",
                        code: "<!-- 推荐：每页一个h1 -->\n<h1>页面主标题</h1>\n<h2>章节1</h2>\n<h3>子章节1.1</h3>\n<h2>章节2</h2>\n\n<!-- 可接受：语义化区块中的多个h1 -->\n<article>\n  <h1>文章标题</h1>\n</article>\n<article>\n  <h1>另一篇文章</h1>\n</article>",
                        points: [
                            "主页面：一个<h1>最安全",
                            "独立内容块：可以有自己的<h1>",
                            "保持标题层级有序（不要跳级）",
                            "SEO角度：单个<h1>更清晰"
                        ]
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "easy",
            tags: ["语义标签", "强调"],
            question: "<strong>和<b>、<em>和<i>有什么区别？",
            type: "multiple-choice",
            options: [
                "<strong>表示重要性，<b>仅表示视觉加粗",
                "<em>表示强调，<i>仅表示斜体",
                "<strong>和<em>有语义，<b>和<i>无语义",
                "它们完全相同"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "语义化文本标签",
                description: "语义标签和样式标签的区别。",
                sections: [
                    {
                        title: "<strong> vs <b>",
                        code: "<strong>重要内容</strong>  <!-- 语义：重要 -->\n<b>视觉加粗</b>  <!-- 样式：加粗，无特殊语义 -->",
                        points: [
                            "<strong>：表示内容很重要",
                            "<b>：仅视觉加粗，如关键词、产品名",
                            "屏幕阅读器会特别强调<strong>",
                            "SEO：<strong>权重可能更高"
                        ]
                    },
                    {
                        title: "<em> vs <i>",
                        code: "<em>强调的文字</em>  <!-- 语义：强调 -->\n<i>斜体文字</i>  <!-- 样式：斜体，如术语、外文 -->",
                        points: [
                            "<em>：表示强调语气",
                            "<i>：斜体显示，如专有名词、技术术语",
                            "屏幕阅读器会改变<em>的语调",
                            "用途：<i class='icon'>也常用于图标字体"
                        ]
                    },
                    {
                        title: "使用建议",
                        code: "<!-- 推荐 -->\n<p>这很<strong>重要</strong>！</p>\n<p>我<em>真的</em>很喜欢。</p>\n<p>书名：<i>红楼梦</i></p>\n<p>关键词：<b>HTML5</b></p>\n\n<!-- 不推荐 -->\n<p>这很<b>重要</b>！</p>  <!-- 应该用strong -->\n<p style='font-weight:bold'>重要</p>  <!-- 应该用标签 -->",
                        content: "优先使用语义标签，除非只是纯样式需求。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["引用标签", "语义"],
            question: "<blockquote>、<q>和<cite>有什么区别？",
            options: [
                "<blockquote>用于块级引用，<q>用于行内引用，<cite>标记作品标题",
                "它们功能完全相同",
                "<blockquote>只能用于引用文字",
                "<cite>用于引用代码"
            ],
            correctAnswer: "A",
            explanation: {
                title: "引用标签详解",
                description: "HTML提供了多种引用标签，各有用途。",
                sections: [
                    {
                        title: "<blockquote> - 块级引用",
                        code: '<blockquote cite="https://example.com/source">\n  <p>这是一段引用的文字。</p>\n  <footer>—— <cite>作者名</cite></footer>\n</blockquote>',
                        points: [
                            "用于长篇引用",
                            "块级元素，独立成段",
                            "cite属性指向引用来源URL",
                            "浏览器通常会缩进显示"
                        ]
                    },
                    {
                        title: "<q> - 行内引用",
                        code: '<p>孔子说<q>学而时习之，不亦说乎</q>。</p>',
                        points: [
                            "用于短引用",
                            "行内元素",
                            "浏览器会自动添加引号",
                            "也可以有cite属性"
                        ]
                    },
                    {
                        title: "<cite> - 作品标题",
                        code: '<p>我最喜欢的书是<cite>三体</cite>。</p>\n<blockquote>\n  <p>引用内容</p>\n  <cite>出自《三体》</cite>\n</blockquote>',
                        points: [
                            "标记作品标题（书、电影、文章等）",
                            "不是引用内容本身",
                            "默认斜体显示",
                            "可以独立使用或配合引用标签"
                        ]
                    },
                    {
                        title: "完整示例",
                        code: '<article>\n  <h2>文章标题</h2>\n  <p>正如<cite>《HTML权威指南》</cite>中所说：</p>\n  <blockquote cite="https://example.com/html-guide">\n    <p>语义化HTML是Web开发的基础。</p>\n  </blockquote>\n  <p>我认为<q>实践出真知</q>这句话很有道理。</p>\n</article>'
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["代码标签", "语义"],
            question: "<code>、<pre>、<kbd>、<samp>和<var>有什么区别？",
            type: "multiple-choice",
            options: [
                "<code>表示代码片段",
                "<pre>保留空白和换行",
                "<kbd>表示键盘输入",
                "<samp>表示计算机输出，<var>表示变量"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "代码相关标签",
                description: "HTML提供了多个语义化的代码标签。",
                sections: [
                    {
                        title: "<code> - 代码片段",
                        code: "<p>使用<code>console.log()</code>打印日志。</p>",
                        points: [
                            "行内元素",
                            "表示计算机代码",
                            "默认等宽字体",
                            "不保留空白"
                        ]
                    },
                    {
                        title: "<pre> - 预格式化文本",
                        code: "<pre><code>function hello() {\n  console.log('Hello');\n}</code></pre>",
                        points: [
                            "块级元素",
                            "保留所有空格和换行",
                            "常与<code>配合显示代码块",
                            "默认等宽字体"
                        ]
                    },
                    {
                        title: "<kbd> - 键盘输入",
                        code: "<p>按<kbd>Ctrl</kbd>+<kbd>C</kbd>复制。</p>",
                        points: [
                            "表示用户键盘输入",
                            "默认等宽字体",
                            "常用于快捷键说明",
                            "可以嵌套表示组合键"
                        ]
                    },
                    {
                        title: "<samp> - 程序输出",
                        code: "<p>终端显示：<samp>Error: File not found</samp></p>",
                        points: [
                            "表示程序或系统的输出",
                            "默认等宽字体",
                            "用于示例输出、错误信息等"
                        ]
                    },
                    {
                        title: "<var> - 变量",
                        code: "<p>方程：<var>x</var> + <var>y</var> = 10</p>",
                        points: [
                            "表示数学变量或程序变量",
                            "默认斜体",
                            "用于数学公式、代码说明"
                        ]
                    },
                    {
                        title: "完整示例",
                        code: "<article>\n  <h3>Git 基础命令</h3>\n  <p>在终端输入<kbd>git status</kbd>查看状态。</p>\n  <p>输出：</p>\n  <pre><samp>On branch main\nYour branch is up to date</samp></pre>\n  <p>使用<code>git commit -m <var>message</var></code>提交。</p>\n</article>"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["换行", "分隔"],
            question: "<br>和<hr>标签的正确用法是什么？",
            options: [
                "<br>用于换行，<hr>用于主题分隔",
                "<br>是空元素，不需要闭合标签",
                "<hr>表示段落级别的主题转换",
                "<br>可以用来增加段落间距"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "<br>和<hr>标签",
                description: "两个简单但容易误用的标签。",
                sections: [
                    {
                        title: "<br> - 换行",
                        code: "<p>\n  第一行<br>\n  第二行<br>\n  第三行\n</p>",
                        points: [
                            "用于文本内换行",
                            "空元素，无闭合标签",
                            "HTML5：<br>",
                            "XHTML：<br />",
                            "不要用于布局或增加间距"
                        ]
                    },
                    {
                        title: "<br>的正确用法",
                        code: "<!-- 正确：诗歌、地址 -->\n<p>\n  床前明月光<br>\n  疑是地上霜<br>\n</p>\n\n<address>\n  北京市朝阳区<br>\n  某某大厦10层<br>\n  邮编：100000\n</address>\n\n<!-- 错误：增加间距 -->\n<p>段落1</p>\n<br><br><br>  <!-- 不要这样做！ -->\n<p>段落2</p>",
                        content: "不要用<br>控制布局，应该用CSS（margin、padding）。"
                    },
                    {
                        title: "<hr> - 主题分隔",
                        code: "<section>\n  <h2>章节1</h2>\n  <p>内容...</p>\n  <hr>  <!-- 主题转换 -->\n  <h2>章节2</h2>\n  <p>内容...</p>\n</section>",
                        points: [
                            "表示段落级别的主题转换",
                            "不仅仅是视觉上的横线",
                            "有语义含义",
                            "默认显示为水平线",
                            "可以用CSS美化"
                        ]
                    },
                    {
                        title: "<hr>的语义",
                        code: "<!-- 正确：故事场景转换 -->\n<p>故事发生在春天...</p>\n<hr>\n<p>三年后的冬天...</p>\n\n<!-- 错误：纯装饰 -->\n<div class=\"section\">\n  <hr>  <!-- 如果只是装饰，用CSS border -->\n  <p>内容</p>\n</div>",
                        content: "如果只是需要视觉分隔线，用CSS的border更合适。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["标记标签", "语义"],
            question: "<mark>、<ins>、<del>标签的用途是什么？",
            type: "multiple-choice",
            options: [
                "<mark>用于高亮显示",
                "<ins>表示插入的内容",
                "<del>表示删除的内容",
                "它们都只是样式标签"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "文本标记标签",
                description: "这些标签用于标记文本的特殊状态。",
                sections: [
                    {
                        title: "<mark> - 高亮标记",
                        code: "<p>搜索<mark>HTML</mark>，找到3个结果。</p>",
                        points: [
                            "标记需要引起注意的文本",
                            "常用于搜索结果高亮",
                            "默认黄色背景",
                            "有语义：表示相关性或重要性"
                        ]
                    },
                    {
                        title: "<ins> - 插入内容",
                        code: "<p>\n  价格：<del>100元</del> <ins>80元</ins>\n</p>\n\n<ins cite=\"https://example.com\" datetime=\"2024-01-01\">\n  <p>新增的段落内容。</p>\n</ins>",
                        points: [
                            "表示文档中新插入的内容",
                            "常用于显示修改记录",
                            "默认下划线",
                            "可选属性：cite（修改说明URL）、datetime（时间戳）"
                        ]
                    },
                    {
                        title: "<del> - 删除内容",
                        code: "<p>\n  原价：<del>1000元</del><br>\n  现价：800元\n</p>\n\n<del cite=\"https://example.com\" datetime=\"2024-01-01\">\n  <p>被删除的内容。</p>\n</del>",
                        points: [
                            "表示文档中已删除的内容",
                            "常用于显示价格变更、内容修订",
                            "默认删除线",
                            "可选属性：cite、datetime"
                        ]
                    },
                    {
                        title: "<s> - 不再准确",
                        code: "<p>本周特价：<s>原价100元</s> 现价80元</p>",
                        points: [
                            "表示不再准确或不再相关的内容",
                            "与<del>的区别：<del>是删除，<s>是失效",
                            "默认删除线",
                            "用于打折、过期信息等"
                        ]
                    },
                    {
                        title: "实际应用",
                        code: "<!-- 文档修订 -->\n<article>\n  <h2>更新日志</h2>\n  <p>版本1.0</p>\n  <ins datetime=\"2024-01-15\">\n    <p>新增功能：支持暗黑模式</p>\n  </ins>\n  <del datetime=\"2024-01-15\">\n    <p>移除功能：旧版编辑器</p>\n  </del>\n</article>\n\n<!-- 搜索高亮 -->\n<p>在<mark>JavaScript</mark>中使用闭包...</p>\n\n<!-- 价格展示 -->\n<p>原价：<s>￥999</s> 限时特价：<strong>￥799</strong></p>"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["语义标签", "可访问性"],
            question: "<abbr>、<dfn>、<time>标签的作用是什么？",
            type: "multiple-choice",
            options: [
                "<abbr>用于缩写和首字母缩略词",
                "<dfn>用于定义术语",
                "<time>用于标记日期和时间",
                "这些都是HTML5废弃的标签"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "语义化辅助标签",
                description: "这些标签提供了更丰富的语义信息。",
                sections: [
                    {
                        title: "<abbr> - 缩写",
                        code: '<p>\n  <abbr title="HyperText Markup Language">HTML</abbr>是一种标记语言。\n</p>\n\n<p>\n  <abbr title="World Wide Web Consortium">W3C</abbr>制定Web标准。\n</p>',
                        points: [
                            "标记缩写和首字母缩略词",
                            "title属性包含完整形式",
                            "鼠标悬停显示完整内容",
                            "屏幕阅读器会读取title",
                            "默认带下划线虚线"
                        ]
                    },
                    {
                        title: "<dfn> - 术语定义",
                        code: '<p>\n  <dfn>HTML</dfn>（HyperText Markup Language）是一种用于创建网页的标准标记语言。\n</p>\n\n<p>\n  <dfn id="closure">闭包</dfn>是指函数可以访问其词法作用域外的变量。\n</p>',
                        points: [
                            "标记术语的定义实例",
                            "通常出现在术语首次定义处",
                            "默认斜体",
                            "可配合id属性用于交叉引用",
                            "提升文档语义"
                        ]
                    },
                    {
                        title: "<time> - 日期时间",
                        code: '<p>\n  发布时间：<time datetime=\"2024-01-15\">2024年1月15日</time>\n</p>\n\n<p>\n  会议时间：<time datetime=\"2024-01-20T14:00\">1月20日下午2点</time>\n</p>\n\n<p>\n  <time datetime=\"PT2H30M\">2小时30分钟</time>\n</p>',
                        points: [
                            "标记日期、时间或时长",
                            "datetime属性：机器可读的格式",
                            "内容：人类可读的格式",
                            "有助于搜索引擎理解",
                            "可用于日历应用"
                        ]
                    },
                    {
                        title: "datetime格式",
                        code: '<!-- 日期 -->\n<time datetime=\"2024-01-15\">2024年1月15日</time>\n\n<!-- 日期+时间 -->\n<time datetime=\"2024-01-15T14:30:00\">下午2:30</time>\n\n<!-- 时区 -->\n<time datetime=\"2024-01-15T14:30:00+08:00\">北京时间下午2:30</time>\n\n<!-- 时长 -->\n<time datetime=\"P3D\">3天</time>\n<time datetime=\"PT2H30M\">2小时30分钟</time>',
                        points: [
                            "日期：YYYY-MM-DD",
                            "时间：THH:MM:SS",
                            "时区：+HH:MM或Z（UTC）",
                            "时长：P开头（Period）"
                        ]
                    },
                    {
                        title: "实际应用",
                        code: '<article>\n  <h2>CSS Grid 布局详解</h2>\n  <p>\n    作者：张三 | \n    <time datetime=\"2024-01-15\" pubdate>2024年1月15日</time>\n  </p>\n  <p>\n    <dfn><abbr title=\"Cascading Style Sheets\">CSS</abbr> Grid</dfn>\n    是一个二维布局系统。\n  </p>\n</article>'
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["段落", "语义"],
            question: "什么时候应该使用<p>标签，什么时候使用<div>？",
            options: [
                "<p>用于文本段落，<div>用于通用容器",
                "<p>有语义，<div>无特定语义",
                "<p>不能包含块级元素，<div>可以",
                "完全可以互换使用"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "<p> vs <div>",
                description: "理解语义标签和容器标签的区别。",
                sections: [
                    {
                        title: "<p>标签特点",
                        points: [
                            "语义：表示文本段落",
                            "内容模型：只能包含短语内容（行内元素）",
                            "不能包含块级元素（<div>、<p>、<h1>等）",
                            "默认样式：上下margin",
                            "自动闭合：浏览器会自动修正嵌套错误"
                        ]
                    },
                    {
                        title: "<div>标签特点",
                        points: [
                            "语义：无特定语义，通用容器",
                            "内容模型：可以包含任何流式内容",
                            "可以包含块级元素和行内元素",
                            "默认样式：无特殊样式",
                            "用于布局和分组"
                        ]
                    },
                    {
                        title: "正确用法",
                        code: "<!-- 正确 -->\n<p>这是一段文字，包含<strong>加粗</strong>和<em>斜体</em>。</p>\n\n<div>\n  <h2>标题</h2>\n  <p>段落1</p>\n  <p>段落2</p>\n</div>\n\n<!-- 错误 -->\n<p>\n  <div>错误：p不能包含div</div>\n</p>\n\n<p>\n  <h2>错误：p不能包含h2</h2>\n</p>",
                        content: "记住：<p>只能包含行内内容。"
                    },
                    {
                        title: "使用建议",
                        code: "<!-- 文本段落：用<p> -->\n<article>\n  <p>第一段文字...</p>\n  <p>第二段文字...</p>\n</article>\n\n<!-- 布局容器：用<div> -->\n<div class=\"container\">\n  <div class=\"header\">...</div>\n  <div class=\"content\">...</div>\n</div>\n\n<!-- 更好：使用语义标签 -->\n<article>\n  <header>...</header>\n  <section>...</section>\n</article>",
                        content: "优先使用语义标签，实在没有合适的再用<div>。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["特殊字符", "实体"],
            question: "HTML实体的作用是什么？如何使用？",
            options: [
                "用于显示HTML保留字符",
                "用于显示特殊符号",
                "防止XSS攻击",
                "只是一种编码方式"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "HTML实体（HTML Entities）",
                description: "HTML实体是显示特殊字符的标准方式。",
                sections: [
                    {
                        title: "常用实体",
                        code: "&lt;    <!-- < 小于号 -->\n&gt;    <!-- > 大于号 -->\n&amp;   <!-- & 符号 -->\n&quot;  <!-- \" 双引号 -->\n&apos;  <!-- ' 单引号 -->\n&nbsp;  <!-- 不间断空格 -->\n&copy;  <!-- © 版权符号 -->\n&reg;   <!-- ® 注册商标 -->\n&trade; <!-- ™ 商标 -->",
                        points: [
                            "以&开头，;结尾",
                            "命名实体：&lt;、&gt;",
                            "数字实体：&#60;、&#62;（十进制）",
                            "十六进制：&#x3C;、&#x3E;"
                        ]
                    },
                    {
                        title: "为什么需要实体",
                        code: "<!-- 错误：会被解析为HTML标签 -->\n<p>使用<div>标签</p>\n\n<!-- 正确：使用实体 -->\n<p>使用&lt;div&gt;标签</p>",
                        points: [
                            "显示HTML保留字符（< > & \" '）",
                            "显示特殊符号",
                            "防止XSS攻击",
                            "确保内容正确显示"
                        ]
                    },
                    {
                        title: "XSS防护",
                        code: "// JavaScript中转义\nfunction escapeHtml(text) {\n  const map = {\n    '&': '&amp;',\n    '<': '&lt;',\n    '>': '&gt;',\n    '\"': '&quot;',\n    \"'\": '&#039;'\n  };\n  return text.replace(/[&<>\"']/g, m => map[m]);\n}\n\n// 用户输入\nconst userInput = '<script>alert(\"XSS\")</script>';\n// 转义后\nconst safe = escapeHtml(userInput);\n// &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;",
                        content: "永远不要直接输出用户输入，必须转义。"
                    },
                    {
                        title: "空格实体",
                        code: "&nbsp;   <!-- 不间断空格，不会被合并 -->\n&ensp;   <!-- 半角空格 -->\n&emsp;   <!-- 全角空格 -->\n&thinsp; <!-- 窄空格 -->\n\n<p>单词&nbsp;之间</p>  <!-- 强制不换行 -->\n<p>连续&nbsp;&nbsp;&nbsp;三个空格</p>",
                        points: [
                            "&nbsp; - 常用，宽度固定",
                            "&ensp; - 约为字体大小的一半",
                            "&emsp; - 约等于字体大小",
                            "&thinsp; - 很窄的空格"
                        ]
                    },
                    {
                        title: "常用符号实体",
                        code: "<!-- 货币符号 -->\n&yen;   <!-- ¥ 人民币 -->\n&euro;  <!-- € 欧元 -->\n&pound; <!-- £ 英镑 -->\n\n<!-- 数学符号 -->\n&times; <!-- × 乘号 -->\n&divide;<!-- ÷ 除号 -->\n&plusmn;<!-- ± 加减号 -->\n\n<!-- 箭头 -->\n&larr;  <!-- ← 左箭头 -->\n&rarr;  <!-- → 右箭头 -->\n&uarr;  <!-- ↑ 上箭头 -->\n&darr;  <!-- ↓ 下箭头 -->"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["上下标", "语义"],
            question: "<sup>和<sub>标签用于什么场景？",
            options: [
                "<sup>用于上标（如平方），<sub>用于下标（如化学式）",
                "它们只是样式标签，无语义",
                "可以用CSS完全替代",
                "主要用于数学和化学公式"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "D"],
            explanation: {
                title: "上标和下标",
                description: "<sup>和<sub>有明确的语义，不仅仅是样式。",
                sections: [
                    {
                        title: "<sup> - 上标",
                        code: "<p>面积：10平方米 = 10m<sup>2</sup></p>\n<p>E = mc<sup>2</sup></p>\n<p>2<sup>10</sup> = 1024</p>\n<p>脚注<sup>[1]</sup></p>",
                        points: [
                            "用于数学幂次",
                            "脚注引用",
                            "序数词（1<sup>st</sup>、2<sup>nd</sup>）",
                            "默认字体较小，向上偏移"
                        ]
                    },
                    {
                        title: "<sub> - 下标",
                        code: "<p>水的化学式：H<sub>2</sub>O</p>\n<p>CO<sub>2</sub>是二氧化碳</p>\n<p>数组：a<sub>1</sub>, a<sub>2</sub>, a<sub>3</sub></p>",
                        points: [
                            "用于化学式",
                            "数学下标（变量索引）",
                            "默认字体较小，向下偏移"
                        ]
                    },
                    {
                        title: "CSS替代方案",
                        code: "/* 可以用CSS实现相同效果 */\n.superscript {\n  vertical-align: super;\n  font-size: smaller;\n}\n\n.subscript {\n  vertical-align: sub;\n  font-size: smaller;\n}",
                        content: "虽然CSS可以实现，但<sup>/<sub>提供了语义，有助于可访问性和内容理解。"
                    },
                    {
                        title: "可访问性",
                        points: [
                            "屏幕阅读器会识别上下标",
                            "有助于正确朗读内容",
                            "搜索引擎能理解语义",
                            "优先使用语义标签而不是CSS"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        }
    ],
    navigation: {
        prev: { title: "头部元素详解", url: "03-head-elements-quiz.html" },
        next: { title: "列表与定义", url: "05-lists-quiz.html" }
    }
};
