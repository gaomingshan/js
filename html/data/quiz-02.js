// 第2章：文档结构与语法 - 面试题
window.htmlQuizData_02 = {
    config: {
        title: "文档结构与语法",
        icon: "🏗️",
        description: "测试你对HTML文档结构和语法规则的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["DOCTYPE", "文档声明"],
            question: "HTML5的DOCTYPE声明是什么？",
            options: [
                "<!DOCTYPE html>",
                "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 5.0//EN\">",
                "<html doctype='html5'>",
                "<!DOCTYPE HTML5>"
            ],
            correctAnswer: "A",
            explanation: {
                title: "HTML5 DOCTYPE",
                description: "HTML5大幅简化了DOCTYPE声明。",
                points: [
                    "HTML5：<!DOCTYPE html>（简洁明了）",
                    "HTML 4.01 Strict：需要完整的DTD声明，非常冗长",
                    "DOCTYPE不区分大小写：<!doctype html>也可以",
                    "DOCTYPE必须放在HTML文档的第一行",
                    "DOCTYPE不是HTML标签，而是文档类型声明"
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "easy",
            tags: ["文档结构", "必需元素"],
            question: "一个标准的HTML文档必须包含哪些元素？",
            type: "multiple-choice",
            options: [
                "<!DOCTYPE html>",
                "<html>",
                "<head>",
                "<body>"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "HTML文档基本结构",
                description: "一个完整的HTML文档需要这些基础元素。",
                code: "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>页面标题</title>\n</head>\n<body>\n    <!-- 页面内容 -->\n</body>\n</html>",
                points: [
                    "<!DOCTYPE html>：声明文档类型",
                    "<html>：根元素，包含整个HTML文档",
                    "<head>：头部，包含元数据",
                    "<body>：主体，包含可见内容",
                    "虽然某些元素在HTML5中可省略，但完整声明是最佳实践"
                ]
            },
            source: "MDN"
        },
        {
            difficulty: "medium",
            tags: ["html标签", "lang属性"],
            question: "为什么建议在<html>标签上设置lang属性？",
            type: "multiple-choice",
            options: [
                "帮助搜索引擎识别页面语言",
                "辅助技术（如屏幕阅读器）使用正确的发音",
                "浏览器可以应用正确的字体和排版规则",
                "提升页面加载速度"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "lang属性的重要性",
                description: "lang属性对可访问性和SEO都很重要。",
                sections: [
                    {
                        title: "SEO优化",
                        points: [
                            "搜索引擎根据lang属性识别页面语言",
                            "帮助搜索引擎将页面推送给正确语言的用户",
                            "多语言网站必须正确设置lang属性"
                        ]
                    },
                    {
                        title: "可访问性",
                        points: [
                            "屏幕阅读器根据lang属性选择正确的语音引擎",
                            "确保内容以正确的语言发音",
                            "提升视障用户体验"
                        ]
                    },
                    {
                        title: "浏览器行为",
                        points: [
                            "浏览器可应用语言特定的CSS规则",
                            "某些字体在不同语言下显示不同",
                            "连字符、换行规则依赖语言设置"
                        ]
                    },
                    {
                        title: "常见语言代码",
                        code: "<html lang=\"zh-CN\">  <!-- 简体中文 -->\n<html lang=\"zh-TW\">  <!-- 繁体中文 -->\n<html lang=\"en\">     <!-- 英语 -->\n<html lang=\"en-US\">  <!-- 美式英语 -->\n<html lang=\"ja\">     <!-- 日语 -->"
                    },
                    {
                        title: "性能影响",
                        content: "lang属性不影响页面加载速度，它是一个元数据属性。"
                    }
                ]
            },
            source: "W3C"
        },
        {
            difficulty: "medium",
            tags: ["标签规则", "语法"],
            question: "以下哪些是正确的HTML语法？",
            type: "multiple-choice",
            options: [
                "<br> 和 <br/>",
                "<img src='image.jpg'> 和 <img src='image.jpg'/>",
                "<input type='text'> 和 <input type='text'/>",
                "<p>文本</p> 和 <P>文本</P>"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "HTML语法灵活性",
                description: "HTML5语法比XHTML更宽松，提供了多种书写方式。",
                sections: [
                    {
                        title: "自闭合标签",
                        points: [
                            "HTML5：<br> 和 <br/> 都正确",
                            "HTML5：<img src='image.jpg'> 和 <img src='image.jpg'/> 都正确",
                            "推荐不使用斜杠：<br>、<img src='image.jpg'>",
                            "XHTML要求：必须使用<br />、<img src='image.jpg' />"
                        ]
                    },
                    {
                        title: "标签大小写",
                        points: [
                            "HTML5不区分大小写：<P>、<p>、<P>都有效",
                            "推荐使用小写：<p>、<div>、<span>",
                            "XHTML要求：必须全部小写"
                        ]
                    },
                    {
                        title: "属性引号",
                        points: [
                            "可以不加引号（如果值不包含空格）：<div class=box>",
                            "单引号：<div class='box'>",
                            "双引号：<div class=\"box\">",
                            "推荐始终使用双引号"
                        ]
                    },
                    {
                        title: "最佳实践",
                        code: "<!-- 推荐写法 -->\n<img src=\"image.jpg\" alt=\"描述\">\n<br>\n<input type=\"text\">\n<p>文本内容</p>",
                        content: "虽然HTML5语法宽松，但保持一致的编码风格有助于代码维护。"
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "medium",
            tags: ["字符编码", "meta标签"],
            question: "以下哪个<meta>标签声明是推荐的UTF-8编码方式？",
            options: [
                "<meta charset=\"UTF-8\">",
                "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">",
                "<meta encoding=\"UTF-8\">",
                "<charset>UTF-8</charset>"
            ],
            correctAnswer: "A",
            explanation: {
                title: "字符编码声明",
                description: "HTML5简化了字符编码的声明方式。",
                sections: [
                    {
                        title: "HTML5推荐",
                        code: "<meta charset=\"UTF-8\">",
                        content: "简洁明了，是HTML5的标准写法。"
                    },
                    {
                        title: "HTML4写法（仍然有效）",
                        code: "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">",
                        content: "这是HTML4的写法，HTML5仍然支持，但不推荐。"
                    },
                    {
                        title: "为什么需要声明编码",
                        points: [
                            "告诉浏览器如何解码文档",
                            "确保中文等非ASCII字符正确显示",
                            "防止出现乱码",
                            "必须与文件实际编码一致"
                        ]
                    },
                    {
                        title: "位置要求",
                        code: "<!DOCTYPE html>\n<html>\n<head>\n    <meta charset=\"UTF-8\">  <!-- 必须在<head>前1024字节内 -->\n    <title>标题</title>\n</head>",
                        content: "charset声明必须在<head>的前1024字节内，建议放在第一行。"
                    },
                    {
                        title: "UTF-8优势",
                        points: [
                            "支持所有Unicode字符",
                            "向后兼容ASCII",
                            "是Web的标准编码",
                            "几乎所有现代网站都使用UTF-8"
                        ]
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["嵌套规则", "语义"],
            question: "以下哪些HTML嵌套是错误的？",
            type: "multiple-choice",
            options: [
                "<p><div>内容</div></p>",
                "<a><a>链接</a></a>",
                "<ul><div><li>项目</li></div></ul>",
                "<h1><p>标题</p></h1>"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "HTML嵌套规则",
                description: "HTML对标签嵌套有严格的规则，违反规则会导致解析错误。",
                sections: [
                    {
                        title: "错误1：块级元素不能嵌套在行内元素中",
                        code: "<!-- 错误 -->\n<p><div>内容</div></p>\n\n<!-- 正确 -->\n<div><p>内容</p></div>",
                        points: [
                            "<p>是块级元素，但只能包含行内元素",
                            "<div>是块级元素，不能放在<p>中",
                            "<span>、<a>、<strong>等行内元素可以放在<p>中"
                        ]
                    },
                    {
                        title: "错误2：<a>标签不能嵌套<a>标签",
                        code: "<!-- 错误 -->\n<a href=\"#\"><a href=\"#\">链接</a></a>\n\n<!-- 正确 -->\n<a href=\"#\">链接</a>\n<a href=\"#\">另一个链接</a>",
                        points: [
                            "<a>标签不能包含另一个<a>标签",
                            "交互元素通常不能嵌套",
                            "<button>也不能嵌套<button>"
                        ]
                    },
                    {
                        title: "错误3：列表项必须是<ul>/<ol>的直接子元素",
                        code: "<!-- 错误 -->\n<ul><div><li>项目</li></div></ul>\n\n<!-- 正确 -->\n<ul>\n  <li><div>项目</div></li>\n</ul>",
                        points: [
                            "<li>必须是<ul>或<ol>的直接子元素",
                            "可以在<li>内部使用<div>",
                            "<ul>/<ol>只能包含<li>作为直接子元素"
                        ]
                    },
                    {
                        title: "错误4：标题不应包含段落",
                        code: "<!-- 错误 -->\n<h1><p>标题</p></h1>\n\n<!-- 正确 -->\n<h1>标题</h1>\n<p>段落内容</p>",
                        points: [
                            "<h1>~<h6>只应包含短语内容",
                            "不应包含<p>、<div>等块级元素",
                            "可以包含<span>、<strong>等行内元素"
                        ]
                    },
                    {
                        title: "常见的正确嵌套",
                        code: "<!-- 正确的嵌套示例 -->\n<div>\n  <p>段落 <strong>加粗</strong> 文本</p>\n  <ul>\n    <li>项目1</li>\n    <li>项目2</li>\n  </ul>\n</div>",
                        content: "遵循嵌套规则可以确保HTML被正确解析和渲染。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["注释", "条件注释"],
            question: "以下哪个是正确的HTML注释语法？",
            type: "multiple-choice",
            options: [
                "<!-- 这是注释 -->",
                "<!--[if IE]>这是IE条件注释<![endif]-->",
                "// 这是注释",
                "/* 这是注释 */"
            ],
            correctAnswer: ["A", "B"],
            explanation: {
                title: "HTML注释",
                description: "HTML有自己的注释语法，不同于CSS和JavaScript。",
                sections: [
                    {
                        title: "标准HTML注释",
                        code: "<!-- 这是单行注释 -->\n\n<!-- \n  这是\n  多行\n  注释\n-->",
                        points: [
                            "以<!--开始，以-->结束",
                            "可以跨多行",
                            "注释内容不会在页面上显示",
                            "但在源代码中可见（F12可以看到）"
                        ]
                    },
                    {
                        title: "IE条件注释（已废弃）",
                        code: "<!--[if IE]>\n  <p>你正在使用IE浏览器</p>\n<![endif]-->\n\n<!--[if lt IE 9]>\n  <script src=\"html5shiv.js\"></script>\n<![endif]-->",
                        points: [
                            "用于针对IE浏览器的特殊处理",
                            "只在IE中生效，其他浏览器视为普通注释",
                            "IE10+已不支持条件注释",
                            "现代开发中已很少使用"
                        ]
                    },
                    {
                        title: "错误的注释方式",
                        code: "// 这是JavaScript注释，不是HTML注释\n/* 这是CSS注释，不是HTML注释 */",
                        content: "不同语言有不同的注释语法，不能混用。"
                    },
                    {
                        title: "注释注意事项",
                        points: [
                            "注释中不能包含--（双横线）",
                            "注释不能嵌套",
                            "敏感信息不要放在注释中（源代码可见）",
                            "过多注释会增加HTML文件大小"
                        ]
                    },
                    {
                        title: "特殊注释",
                        code: "<!DOCTYPE html> <!-- 这不是注释，是文档类型声明 -->\n<![CDATA[ 这是XML的CDATA，HTML中一般不用 ]]>",
                        content: "DOCTYPE虽然以<!开头，但它是声明，不是注释。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["空白处理", "渲染"],
            question: "HTML如何处理连续的空格和换行？",
            options: [
                "连续的空格和换行会被合并为一个空格",
                "完全保留所有空格和换行",
                "删除所有空格和换行",
                "根据浏览器不同而不同"
            ],
            correctAnswer: "A",
            explanation: {
                title: "HTML空白字符处理",
                description: "HTML有自己的空白字符处理规则。",
                sections: [
                    {
                        title: "默认行为",
                        code: "<p>这里有    多个    空格</p>\n<!-- 渲染为：这里有 多个 空格 -->\n\n<p>第一行\n第二行\n第三行</p>\n<!-- 渲染为：第一行 第二行 第三行 -->",
                        points: [
                            "连续的空格被合并为一个空格",
                            "换行符被当作空格处理",
                            "制表符也被当作空格",
                            "这是HTML的标准行为"
                        ]
                    },
                    {
                        title: "保留空白：使用<pre>标签",
                        code: "<pre>\n这里的  空格\n和\n  换行\n    都会保留\n</pre>",
                        points: [
                            "<pre>标签会保留所有空格和换行",
                            "常用于显示代码",
                            "字体默认为等宽字体"
                        ]
                    },
                    {
                        title: "使用CSS控制",
                        code: "p {\n  white-space: pre;        /* 保留空白 */\n  white-space: pre-wrap;   /* 保留空白，自动换行 */\n  white-space: pre-line;   /* 保留换行，合并空格 */\n  white-space: nowrap;     /* 不换行 */\n}",
                        content: "white-space属性提供了更灵活的空白处理方式。"
                    },
                    {
                        title: "强制空格：HTML实体",
                        code: "<p>这里&nbsp;&nbsp;&nbsp;有三个不间断空格</p>\n<!-- &nbsp; = non-breaking space，不会被合并 -->",
                        points: [
                            "&nbsp; - 不间断空格",
                            "&ensp; - 半角空格",
                            "&emsp; - 全角空格",
                            "&thinsp; - 窄空格"
                        ]
                    },
                    {
                        title: "换行：使用<br>标签",
                        code: "<p>第一行<br>第二行<br>第三行</p>",
                        content: "<br>标签用于强制换行，不同于<p>标签。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["标签类型", "元素分类"],
            question: "HTML5中，元素分为哪几种内容模型（Content Model）？",
            options: [
                "块级元素和行内元素",
                "流式内容、短语内容、嵌入内容、交互内容等7种",
                "容器元素和空元素",
                "语义元素和非语义元素"
            ],
            correctAnswer: "B",
            explanation: {
                title: "HTML5内容模型",
                description: "HTML5用更精确的内容模型替代了简单的块级/行内分类。",
                sections: [
                    {
                        title: "7种主要内容模型",
                        points: [
                            "Flow content（流式内容）：大多数元素，如<div>、<p>、<span>",
                            "Phrasing content（短语内容）：文本和标记文本的元素，如<span>、<strong>",
                            "Embedded content（嵌入内容）：嵌入外部资源，如<img>、<video>、<iframe>",
                            "Interactive content（交互内容）：用于用户交互，如<a>、<button>、<input>",
                            "Heading content（标题内容）：<h1>到<h6>",
                            "Sectioning content（分节内容）：定义文档结构，如<article>、<section>",
                            "Metadata content（元数据内容）：<head>中的元素，如<title>、<meta>"
                        ]
                    },
                    {
                        title: "与旧分类的关系",
                        points: [
                            "旧分类：块级元素（block）、行内元素（inline）",
                            "HTML5废弃了这种简单分类",
                            "一个元素可能属于多个内容模型",
                            "例如<a>既是短语内容，也可能是交互内容"
                        ]
                    },
                    {
                        title: "为什么改变",
                        points: [
                            "块级/行内分类过于简单",
                            "不能准确描述元素的语义和嵌套规则",
                            "新分类更精确地描述元素的用途和行为",
                            "有助于浏览器和开发者正确使用元素"
                        ]
                    },
                    {
                        title: "实际影响",
                        content: "虽然规范改变了，但在CSS中仍然使用display: block和display: inline来控制元素的显示方式。这是两个不同的概念。"
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "medium",
            tags: ["解析", "容错"],
            question: "当HTML文档有语法错误时，浏览器会如何处理？",
            options: [
                "拒绝渲染页面",
                "显示错误信息",
                "尝试容错并继续渲染",
                "只渲染正确的部分"
            ],
            correctAnswer: "C",
            explanation: {
                title: "HTML容错机制",
                description: "浏览器对HTML具有强大的容错能力。",
                sections: [
                    {
                        title: "容错示例",
                        code: "<!-- 缺少闭合标签 -->\n<div>\n  <p>段落\n  <p>另一个段落\n</div>\n<!-- 浏览器会自动补全<p>标签 -->\n\n<!-- 标签嵌套错误 -->\n<b><i>文本</b></i>\n<!-- 浏览器会尝试修正为：<b><i>文本</i></b> -->",
                        points: [
                            "自动补全缺少的闭合标签",
                            "修正标签嵌套错误",
                            "忽略未知的标签",
                            "处理属性值中的特殊字符"
                        ]
                    },
                    {
                        title: "为什么容错",
                        points: [
                            "早期Web没有严格的HTML标准",
                            "很多网页存在语法错误",
                            "浏览器为了兼容性，必须容错",
                            "这是HTML与XML的重要区别（XML不容错）"
                        ]
                    },
                    {
                        title: "容错的问题",
                        points: [
                            "不同浏览器的容错方式可能不同",
                            "可能导致意外的渲染结果",
                            "难以调试问题",
                            "降低代码质量"
                        ]
                    },
                    {
                        title: "最佳实践",
                        points: [
                            "使用HTML验证工具检查错误",
                            "使用Linter工具",
                            "保持良好的编码习惯",
                            "不要依赖浏览器容错"
                        ]
                    },
                    {
                        title: "验证工具",
                        content: "W3C提供了在线HTML验证工具：https://validator.w3.org/"
                    }
                ]
            },
            source: "HTML解析规范"
        }
    ],
    navigation: {
        prev: { title: "HTML简介与历史", url: "01-html-intro-quiz.html" },
        next: { title: "头部元素详解", url: "03-head-elements-quiz.html" }
    }
};
