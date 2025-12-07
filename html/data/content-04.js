// 第4章：文本内容标签 - 内容数据
window.htmlContentData_04 = {
    section: {
        title: "文本内容标签",
        icon: "📝"
    },
    topics: [
        {
            type: "concept",
            title: "HTML文本元素概述",
            content: {
                description: "HTML提供了丰富的标签来标记和组织文本内容，从标题到段落，从强调到引用，每个标签都有其特定的语义含义。",
                keyPoints: [
                    "使用语义化标签而非纯样式标签",
                    "标题标签（h1-h6）定义内容层级",
                    "段落标签（p）组织文本块",
                    "格式化标签表达内容的强调和重要性",
                    "引用标签标记来自其他来源的内容",
                    "代码标签展示程序代码和计算机文本"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element#文本内容"
            }
        },
        {
            type: "code-example",
            title: "标题标签（h1-h6）",
            content: {
                description: "HTML提供了六级标题，用于建立文档的大纲结构。",
                examples: [
                    {
                        title: "标题层级",
                        code: `<h1>一级标题 - 页面主标题</h1>
<h2>二级标题 - 主要章节</h2>
<h3>三级标题 - 小节</h3>
<h4>四级标题</h4>
<h5>五级标题</h5>
<h6>六级标题</h6>`,
                        notes: "一个页面应该只有一个h1标签"
                    },
                    {
                        title: "正确的标题层级结构",
                        code: `<article>
    <h1>文章主标题</h1>
    <p>引言内容...</p>
    
    <h2>第一章</h2>
    <p>章节内容...</p>
    
    <h3>1.1 小节</h3>
    <p>小节内容...</p>
    
    <h3>1.2 小节</h3>
    <p>小节内容...</p>
    
    <h2>第二章</h2>
    <p>章节内容...</p>
</article>`,
                        notes: "标题应该按顺序递进，不要跳级"
                    },
                    {
                        title: "标题的常见错误",
                        code: `<!-- ❌ 错误：跳过h2直接用h3 -->
<h1>主标题</h1>
<h3>这是错误的</h3>

<!-- ❌ 错误：用标题仅为了样式 -->
<h1>这只是想要大字体</h1>

<!-- ❌ 错误：多个h1 -->
<h1>标题1</h1>
<h1>标题2</h1>

<!-- ✅ 正确 -->
<h1>主标题</h1>
<h2>章节标题</h2>
<h3>小节标题</h3>`,
                        notes: "标题应该反映内容层级，而非仅用于样式"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "段落和换行",
            content: {
                description: "段落是文本内容的基本组织单元。",
                examples: [
                    {
                        title: "段落标签<p>",
                        code: `<p>这是第一个段落。段落会自动在前后产生间距。</p>
<p>这是第二个段落。浏览器会忽略HTML代码中的换行和多余空格。</p>
<p>
    即使源代码中
    写成多行，
    浏览器也会合并成一行显示。
</p>`,
                        notes: "段落之间有默认的上下边距"
                    },
                    {
                        title: "换行标签<br>",
                        code: `<p>
    第一行<br>
    第二行<br>
    第三行
</p>

<!-- 地址示例 -->
<address>
    北京市朝阳区<br>
    某某街道123号<br>
    邮编：100000
</address>`,
                        notes: "br用于强制换行，但不产生段落间距"
                    },
                    {
                        title: "水平线<hr>",
                        code: `<p>第一段内容</p>
<hr>
<p>第二段内容，与上一段有明显分隔</p>

<section>
    <h2>章节一</h2>
    <p>内容...</p>
</section>

<hr>

<section>
    <h2>章节二</h2>
    <p>内容...</p>
</section>`,
                        notes: "hr表示主题的转换或段落级别的分隔"
                    }
                ]
            }
        },
        {
            type: "comparison",
            title: "强调与重要性：<em> vs <strong>",
            content: {
                description: "em和strong都表示强调，但语义和强调程度不同。",
                items: [
                    {
                        name: "<em>（强调）",
                        pros: [
                            "表示强调（emphasis）",
                            "改变句子的语义重点",
                            "默认样式为斜体",
                            "屏幕阅读器会以重读的方式读出",
                            "可以嵌套使用增强强调程度"
                        ]
                    },
                    {
                        name: "<strong>（重要）",
                        pros: [
                            "表示内容的重要性（importance）",
                            "标记严重性或紧急性",
                            "默认样式为粗体",
                            "比em的重要程度更高",
                            "可嵌套表示更高级别的重要性"
                        ]
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "文本格式化标签",
            content: {
                description: "HTML提供了多种文本格式化标签，每个都有特定的语义。",
                examples: [
                    {
                        title: "语义化的强调标签",
                        code: `<!-- 强调 -->
<p>这件事<em>非常</em>重要。</p>

<!-- 重要性 -->
<p><strong>警告：</strong>请勿触摸高压线！</p>

<!-- 标记/高亮 -->
<p>搜索结果：找到<mark>HTML</mark>相关内容。</p>

<!-- 小号文本 -->
<p>价格：$99 <small>(含税)</small></p>

<!-- 删除和插入 -->
<p>原价：<del>$199</del> 现价：<ins>$99</ins></p>

<!-- 下划线（不推荐用于强调） -->
<p>这是<u>拼写错误</u>的标记。</p>`,
                        notes: "选择标签应基于语义而非样式"
                    },
                    {
                        title: "上标和下标",
                        code: `<!-- 上标 -->
<p>E = mc<sup>2</sup></p>
<p>10<sup>th</sup> 第10位</p>

<!-- 下标 -->
<p>H<sub>2</sub>O 水分子</p>
<p>x<sub>1</sub>, x<sub>2</sub>, x<sub>3</sub></p>

<!-- 化学方程式 -->
<p>2H<sub>2</sub> + O<sub>2</sub> → 2H<sub>2</sub>O</p>`,
                        notes: "sup和sub常用于数学、化学公式"
                    },
                    {
                        title: "其他格式化标签",
                        code: `<!-- 斜体（语气、技术术语） -->
<p><i>Homo sapiens</i>（智人）</p>
<p>电影<i>阿凡达</i>很精彩</p>

<!-- 粗体（关键词、产品名） -->
<p><b>注意：</b>以下内容很重要。</p>

<!-- 缩写 -->
<p><abbr title="HyperText Markup Language">HTML</abbr></p>
<p><abbr title="Cascading Style Sheets">CSS</abbr></p>

<!-- 定义术语 -->
<p><dfn>HTML</dfn>是超文本标记语言。</p>`,
                        notes: "i和b是样式标签，优先使用语义标签"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "引用标签",
            content: {
                description: "HTML提供了多种引用标签来标记来自其他来源的内容。",
                examples: [
                    {
                        title: "块级引用<blockquote>",
                        code: `<blockquote cite="https://example.com/source">
    <p>生存还是毁灭，这是一个值得考虑的问题。</p>
    <footer>
        —— <cite>莎士比亚《哈姆雷特》</cite>
    </footer>
</blockquote>

<blockquote>
    <p>
        不要问你的国家能为你做什么，
        而要问你能为你的国家做什么。
    </p>
    <footer>
        —— <cite>约翰·F·肯尼迪</cite>
    </footer>
</blockquote>`,
                        notes: "blockquote用于长引用，cite属性指向来源"
                    },
                    {
                        title: "行内引用<q>",
                        code: `<p>孔子说过：<q>学而时习之，不亦说乎？</q></p>

<p>正如爱因斯坦所言：<q cite="https://example.com">
想象力比知识更重要</q>。</p>

<p>
    <q>HTML</q>是<q>超文本标记语言</q>的缩写。
</p>`,
                        notes: "q用于短引用，浏览器会自动添加引号"
                    },
                    {
                        title: "引用来源<cite>",
                        code: `<p>我最喜欢的书是<cite>三体</cite>。</p>

<p>根据<cite>人民日报</cite>报道...</p>

<blockquote>
    <p>引用内容...</p>
    <cite>《作品名称》</cite>
</blockquote>`,
                        notes: "cite用于标记作品标题或引用来源"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "代码相关标签",
            content: {
                description: "用于展示计算机代码、键盘输入、程序输出等。",
                examples: [
                    {
                        title: "代码<code>",
                        code: `<p>使用<code>console.log()</code>输出日志。</p>

<p>
    在HTML中，使用<code>&lt;p&gt;</code>标签创建段落。
</p>

<p>
    JavaScript变量声明：
    <code>let name = "张三";</code>
</p>`,
                        notes: "code用于行内代码片段"
                    },
                    {
                        title: "代码块<pre>",
                        code: `<pre><code>function greet(name) {
    console.log("Hello, " + name);
}

greet("World");</code></pre>

<pre><code>&lt;div class="container"&gt;
    &lt;h1&gt;标题&lt;/h1&gt;
    &lt;p&gt;段落&lt;/p&gt;
&lt;/div&gt;</code></pre>`,
                        notes: "pre保留空格和换行，常与code配合使用"
                    },
                    {
                        title: "其他计算机文本",
                        code: `<!-- 键盘输入 -->
<p>按<kbd>Ctrl</kbd> + <kbd>C</kbd>复制</p>
<p>输入<kbd>npm install</kbd>安装依赖</p>

<!-- 程序输出 -->
<p>运行结果：<samp>Hello, World!</samp></p>
<p><samp>Error: File not found</samp></p>

<!-- 变量 -->
<p>计算<var>x</var> + <var>y</var>的和</p>
<p>设<var>a</var> = 5, <var>b</var> = 3</p>`,
                        notes: "kbd、samp、var各有不同的语义"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "其他文本语义标签",
            content: {
                description: "还有一些特殊用途的文本标签：",
                examples: [
                    {
                        title: "时间和日期<time>",
                        code: `<!-- 日期 -->
<time datetime="2024-01-15">2024年1月15日</time>

<!-- 时间 -->
<time datetime="14:30">下午2:30</time>

<!-- 完整日期时间 -->
<time datetime="2024-01-15T14:30:00">
    2024年1月15日下午2:30
</time>

<!-- 持续时间 -->
<time datetime="PT2H30M">2小时30分钟</time>`,
                        notes: "datetime属性提供机器可读的格式"
                    },
                    {
                        title: "地址<address>",
                        code: `<address>
    <strong>联系我们：</strong><br>
    公司名称<br>
    北京市朝阳区某某街123号<br>
    电话：<a href="tel:+861012345678">010-12345678</a><br>
    邮箱：<a href="mailto:info@example.com">info@example.com</a>
</address>

<article>
    <h1>文章标题</h1>
    <address>
        作者：<a href="mailto:author@example.com">张三</a>
    </address>
</article>`,
                        notes: "address表示联系信息，不仅限于物理地址"
                    },
                    {
                        title: "双向文本<bdi>和<bdo>",
                        code: `<!-- bdi: 隔离双向文本 -->
<p>用户<bdi>مرحبا</bdi>发表了评论</p>

<!-- bdo: 覆盖文本方向 -->
<p>这段文本<bdo dir="rtl">从右到左显示</bdo>。</p>

<!-- 示例 -->
<ul>
    <li>第1名：<bdi>张三</bdi></li>
    <li>第2名：<bdi>אליס</bdi></li>
    <li>第3名：<bdi>李四</bdi></li>
</ul>`,
                        notes: "处理混合语言文本时很有用"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "文本标签使用最佳实践",
            content: {
                description: "正确使用文本标签可以提高内容的语义性和可访问性：",
                practices: [
                    {
                        title: "语义优先于样式",
                        description: "根据内容的语义选择标签，而不是根据想要的样式。",
                        example: `<!-- ✅ 好：根据语义选择 -->
<p><strong>警告：</strong>此操作不可撤销！</p>
<p>我<em>真的</em>很喜欢这个。</p>

<!-- ❌ 不好：仅为样式选择 -->
<p><b>警告：</b>此操作不可撤销！</p>
<p>我<i>真的</i>很喜欢这个。</p>

<!-- CSS可以改变任何标签的样式 -->
<style>
    em { font-weight: bold; font-style: normal; }
</style>`
                    },
                    {
                        title: "保持标题层级",
                        description: "标题应该按顺序递进，形成清晰的文档大纲。",
                        example: `<!-- ✅ 好：清晰的层级 -->
<h1>文档标题</h1>
<h2>第一章</h2>
<h3>1.1节</h3>
<h3>1.2节</h3>
<h2>第二章</h2>

<!-- ❌ 不好：跳级使用 -->
<h1>文档标题</h1>
<h3>跳过了h2</h3>
<h2>顺序混乱</h2>`
                    },
                    {
                        title: "合理使用引用",
                        description: "为引用内容标注来源，增强可信度。",
                        example: `<!-- ✅ 好：标注来源 -->
<blockquote cite="https://example.com/article">
    <p>引用内容...</p>
    <footer>
        —— <cite>来源名称</cite>
    </footer>
</blockquote>

<!-- ❌ 不好：无来源 -->
<blockquote>
    <p>引用内容...</p>
</blockquote>`
                    },
                    {
                        title: "代码展示要转义",
                        description: "在HTML中显示代码时要转义特殊字符。",
                        example: `<!-- ✅ 好：HTML实体转义 -->
<code>&lt;div class="container"&gt;&lt;/div&gt;</code>

<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;/html&gt;</code></pre>

<!-- ❌ 错误：未转义，会被解析为HTML -->
<code><div class="container"></div></code>`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "文本内容检查清单",
            content: {
                description: "确保文本内容的标记符合最佳实践：",
                items: [
                    { id: "check4-1", text: "每个页面只有一个h1标签" },
                    { id: "check4-2", text: "标题层级按顺序递进，没有跳级" },
                    { id: "check4-3", text: "使用em/strong而非i/b表示强调" },
                    { id: "check4-4", text: "引用内容使用blockquote或q标签" },
                    { id: "check4-5", text: "代码片段使用code标签" },
                    { id: "check4-6", text: "显示HTML代码时进行了实体转义" },
                    { id: "check4-7", text: "时间日期使用time标签" },
                    { id: "check4-8", text: "联系信息使用address标签" },
                    { id: "check4-9", text: "缩写词使用abbr标签并提供title" },
                    { id: "check4-10", text: "文本标签的选择基于语义而非样式" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "头部元素详解", url: "content.html?chapter=03" },
        next: { title: "列表与定义", url: "content.html?chapter=05" }
    }
};
