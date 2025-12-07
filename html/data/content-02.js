// 第2章：文档结构与语法 - 内容数据
window.htmlContentData_02 = {
    section: {
        title: "文档结构与语法",
        icon: "📐"
    },
    topics: [
        {
            type: "concept",
            title: "HTML文档的基本结构",
            content: {
                description: "每个HTML文档都遵循固定的结构模式，由DOCTYPE声明和根元素组成。理解这个结构是编写规范HTML的基础。",
                keyPoints: [
                    "DOCTYPE声明必须位于文档第一行，告诉浏览器使用哪种HTML版本",
                    "<html>是根元素，包含整个HTML文档",
                    "<head>包含元数据，不会直接显示在页面上",
                    "<body>包含页面的可见内容",
                    "正确的嵌套和闭合标签是必需的"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Introduction_to_HTML/Getting_started"
            }
        },
        {
            type: "code-example",
            title: "标准HTML5文档结构",
            content: {
                description: "HTML5简化了DOCTYPE声明，使用统一的标准结构：",
                examples: [
                    {
                        title: "完整的HTML5文档模板",
                        code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="页面描述">
    <meta name="keywords" content="关键词1,关键词2">
    <title>页面标题</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <!-- 页眉内容 -->
    </header>
    
    <main>
        <!-- 主要内容 -->
    </main>
    
    <footer>
        <!-- 页脚内容 -->
    </footer>
    
    <script src="script.js"></script>
</body>
</html>`,
                        notes: "这是推荐的现代HTML5文档结构"
                    },
                    {
                        title: "DOCTYPE的演变",
                        code: `<!-- HTML5 (推荐) -->
<!DOCTYPE html>

<!-- HTML 4.01 Strict -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" 
"http://www.w3.org/TR/html4/strict.dtd">

<!-- XHTML 1.0 Strict -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">`,
                        notes: "HTML5的DOCTYPE大大简化了声明方式"
                    }
                ]
            }
        },
        {
            type: "principle",
            title: "HTML语法规则",
            content: {
                description: "HTML有一套明确的语法规则，遵循这些规则可以确保浏览器正确解析和渲染页面。",
                keyPoints: [
                    "标签名不区分大小写（推荐小写）",
                    "大多数元素需要成对出现（开始标签和结束标签）",
                    "空元素（如<img>、<br>）不需要结束标签",
                    "属性值推荐使用双引号包裹",
                    "元素必须正确嵌套，不能交叉",
                    "布尔属性可以省略值（如disabled、checked）",
                    "注释使用<!-- 注释内容 -->格式"
                ]
            }
        },
        {
            type: "code-example",
            title: "正确与错误的HTML写法",
            content: {
                description: "通过对比学习正确的HTML语法：",
                examples: [
                    {
                        title: "标签嵌套",
                        code: `<!-- ✅ 正确：标签正确嵌套 -->
<div>
    <p>段落文本</p>
</div>

<!-- ❌ 错误：标签交叉嵌套 -->
<div>
    <p>段落文本</div>
</p>

<!-- ✅ 正确：行内元素包含文本 -->
<p>这是<strong>加粗</strong>的文字</p>

<!-- ❌ 错误：块级元素不应放在行内元素中 -->
<span>
    <div>块级元素</div>
</span>`,
                        notes: "始终保持标签的正确嵌套关系"
                    },
                    {
                        title: "属性写法",
                        code: `<!-- ✅ 推荐：属性值用双引号 -->
<input type="text" name="username" id="user">

<!-- ⚠️ 可以但不推荐：单引号 -->
<input type='text' name='username'>

<!-- ⚠️ 可以但不推荐：无引号（属性值无空格时） -->
<input type=text name=username>

<!-- ✅ 布尔属性 -->
<input type="checkbox" checked>
<input type="text" disabled>
<button autofocus>按钮</button>

<!-- ❌ 不必要的写法 -->
<input type="checkbox" checked="checked">`,
                        notes: "推荐使用双引号包裹属性值"
                    },
                    {
                        title: "自闭合标签",
                        code: `<!-- HTML5中的空元素（两种写法都可以） -->
<img src="image.jpg" alt="描述">
<img src="image.jpg" alt="描述" />

<br>
<br />

<hr>
<hr />

<input type="text">
<input type="text" />

<meta charset="UTF-8">
<meta charset="UTF-8" />`,
                        notes: "HTML5中斜杠是可选的，但推荐保持一致"
                    }
                ]
            }
        },
        {
            type: "concept",
            title: "HTML元素的分类",
            content: {
                description: "HTML元素根据显示方式和内容模型分为不同类型，理解这些分类有助于正确使用元素。",
                keyPoints: [
                    "块级元素：独占一行，可设置宽高（如div、p、h1）",
                    "行内元素：不换行，宽高由内容决定（如span、a、strong）",
                    "行内块元素：不换行但可设置宽高（如img、input）",
                    "HTML5内容分类：流内容、短语内容、嵌入内容等",
                    "替换元素：内容来自外部资源（如img、video、iframe）"
                ]
            }
        },
        {
            type: "comparison",
            title: "块级元素 vs 行内元素",
            content: {
                description: "块级元素和行内元素是HTML中最基本的两种元素类型，它们在布局和行为上有明显区别。",
                items: [
                    {
                        name: "块级元素（Block-level）",
                        pros: [
                            "独占一行，前后自动换行",
                            "可以设置width、height、margin、padding",
                            "可以包含块级元素和行内元素",
                            "默认宽度占满父元素",
                            "常用于结构布局"
                        ],
                        cons: [
                            "如果只需要包裹少量文本，会造成空间浪费"
                        ]
                    },
                    {
                        name: "行内元素（Inline）",
                        pros: [
                            "在同一行内显示，不会换行",
                            "宽度由内容决定",
                            "节省空间",
                            "适合文本样式修饰"
                        ],
                        cons: [
                            "不能设置width和height",
                            "垂直方向的margin和padding效果有限",
                            "不能包含块级元素",
                            "不适合复杂布局"
                        ]
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "元素分类示例",
            content: {
                description: "常见HTML元素的分类和使用：",
                examples: [
                    {
                        title: "块级元素",
                        code: `<!-- 常见块级元素 -->
<div>通用容器</div>
<p>段落</p>
<h1>标题</h1>
<ul><li>列表项</li></ul>
<section>章节</section>
<article>文章</article>
<header>页眉</header>
<footer>页脚</footer>
<nav>导航</nav>
<form>表单</form>
<table>表格</table>`,
                        notes: "块级元素主要用于页面结构"
                    },
                    {
                        title: "行内元素",
                        code: `<!-- 常见行内元素 -->
<span>通用行内容器</span>
<a href="#">链接</a>
<strong>加粗</strong>
<em>斜体</em>
<code>代码</code>
<label>标签</label>
<abbr title="缩写">ABBR</abbr>
<time>时间</time>`,
                        notes: "行内元素主要用于文本修饰"
                    },
                    {
                        title: "行内块元素",
                        code: `<!-- 行内块元素（inline-block） -->
<img src="image.jpg" alt="图片">
<input type="text">
<button>按钮</button>
<select><option>选项</option></select>
<textarea></textarea>`,
                        notes: "行内块元素结合了两者的特点"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "HTML编写最佳实践",
            content: {
                description: "遵循这些最佳实践可以写出更规范、更易维护的HTML代码：",
                practices: [
                    {
                        title: "使用语义化标签",
                        description: "选择能够表达内容含义的标签，而不是仅考虑样式。",
                        example: `<!-- ✅ 好 -->
<article>
    <h1>文章标题</h1>
    <p>文章内容...</p>
</article>

<!-- ❌ 不好 -->
<div class="article">
    <div class="title">文章标题</div>
    <div class="content">文章内容...</div>
</div>`
                    },
                    {
                        title: "保持一致的缩进",
                        description: "使用2或4个空格缩进，整个项目保持一致。",
                        example: `<nav>
    <ul>
        <li><a href="#home">首页</a></li>
        <li><a href="#about">关于</a></li>
    </ul>
</nav>`
                    },
                    {
                        title: "小写标签和属性名",
                        description: "虽然HTML不区分大小写，但小写是约定俗成的标准。",
                        example: `<!-- ✅ 推荐 -->
<div class="container" id="main"></div>

<!-- ❌ 不推荐 -->
<DIV CLASS="container" ID="main"></DIV>`
                    },
                    {
                        title: "省略可选的结束标签要谨慎",
                        description: "某些标签的结束标签是可选的，但明确写出更清晰。",
                        example: `<!-- 可选但推荐写完整 -->
<ul>
    <li>项目1</li>
    <li>项目2</li>
</ul>

<!-- HTML5中可以省略，但不推荐 -->
<ul>
    <li>项目1
    <li>项目2
</ul>`
                    },
                    {
                        title: "适当添加注释",
                        description: "为复杂的结构添加注释，但避免过度注释。",
                        example: `<!-- 主导航栏 -->
<nav class="main-nav">
    <!-- 导航项 -->
    <ul>
        <li><a href="#home">首页</a></li>
    </ul>
</nav>
<!-- /主导航栏 -->`
                    },
                    {
                        title: "避免内联样式",
                        description: "将样式定义在CSS文件中，保持HTML的纯净。",
                        example: `<!-- ✅ 推荐 -->
<div class="card">内容</div>

<!-- ❌ 不推荐 -->
<div style="padding:10px;background:#fff;border:1px solid #ccc">内容</div>`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "HTML文档结构检查清单",
            content: {
                description: "使用这个清单确保你的HTML文档结构正确：",
                items: [
                    { id: "check2-1", text: "文档以<!DOCTYPE html>开头" },
                    { id: "check2-2", text: "<html>标签包含lang属性" },
                    { id: "check2-3", text: "<head>中设置了字符编码（UTF-8）" },
                    { id: "check2-4", text: "<head>中包含<title>标签" },
                    { id: "check2-5", text: "移动端页面设置了viewport" },
                    { id: "check2-6", text: "所有标签正确闭合" },
                    { id: "check2-7", text: "标签嵌套关系正确" },
                    { id: "check2-8", text: "属性值使用引号包裹" },
                    { id: "check2-9", text: "使用语义化标签" },
                    { id: "check2-10", text: "代码通过W3C验证器检查" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "HTML简介与历史", url: "content.html?chapter=01" },
        next: { title: "头部元素详解", url: "content.html?chapter=03" }
    }
};
