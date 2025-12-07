// 第5章：列表与定义 - 内容数据
window.htmlContentData_05 = {
    section: {
        title: "列表与定义",
        icon: "📋"
    },
    topics: [
        {
            type: "concept",
            title: "HTML列表类型",
            content: {
                description: "HTML提供了三种主要的列表类型，用于组织和展示相关的信息项。选择合适的列表类型可以使内容更加结构化和易于理解。",
                keyPoints: [
                    "无序列表（ul）：项目顺序不重要的列表",
                    "有序列表（ol）：项目有明确顺序的列表",
                    "定义列表（dl）：术语及其定义的列表",
                    "列表可以嵌套使用创建多层结构",
                    "列表是语义化标签，有助于SEO和可访问性"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element#列表"
            }
        },
        {
            type: "code-example",
            title: "无序列表<ul>",
            content: {
                description: "无序列表用于组织没有特定顺序的项目，默认显示为项目符号列表。",
                examples: [
                    {
                        title: "基本无序列表",
                        code: `<ul>
    <li>苹果</li>
    <li>香蕉</li>
    <li>橙子</li>
</ul>

<h3>购物清单</h3>
<ul>
    <li>牛奶</li>
    <li>面包</li>
    <li>鸡蛋</li>
    <li>黄油</li>
</ul>`,
                        notes: "ul默认使用实心圆点作为标记"
                    },
                    {
                        title: "修改列表样式",
                        code: `<!-- CSS改变项目符号 -->
<style>
    .circle { list-style-type: circle; }
    .square { list-style-type: square; }
    .none { list-style-type: none; }
</style>

<ul class="circle">
    <li>空心圆圈</li>
    <li>项目2</li>
</ul>

<ul class="square">
    <li>方块标记</li>
    <li>项目2</li>
</ul>

<ul class="none">
    <li>无标记</li>
    <li>项目2</li>
</ul>`,
                        notes: "list-style-type控制标记样式"
                    },
                    {
                        title: "实际应用场景",
                        code: `<!-- 导航菜单 -->
<nav>
    <ul>
        <li><a href="#home">首页</a></li>
        <li><a href="#products">产品</a></li>
        <li><a href="#about">关于</a></li>
        <li><a href="#contact">联系</a></li>
    </ul>
</nav>

<!-- 特性列表 -->
<h3>产品特点：</h3>
<ul>
    <li>高性能处理器</li>
    <li>超长续航</li>
    <li>精美外观设计</li>
    <li>专业级相机</li>
</ul>`,
                        notes: "无序列表常用于导航和特性展示"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "有序列表<ol>",
            content: {
                description: "有序列表用于组织有特定顺序或步骤的项目，默认使用数字编号。",
                examples: [
                    {
                        title: "基本有序列表",
                        code: `<ol>
    <li>第一步</li>
    <li>第二步</li>
    <li>第三步</li>
</ol>

<h3>制作蛋糕步骤：</h3>
<ol>
    <li>准备材料</li>
    <li>混合面粉和鸡蛋</li>
    <li>倒入烤盘</li>
    <li>放入烤箱</li>
    <li>烤制30分钟</li>
</ol>`,
                        notes: "ol默认使用阿拉伯数字编号"
                    },
                    {
                        title: "有序列表的属性",
                        code: `<!-- type: 编号类型 -->
<ol type="1"><!-- 默认，1,2,3... -->
    <li>阿拉伯数字</li>
</ol>

<ol type="A"><!-- A,B,C... -->
    <li>大写字母</li>
</ol>

<ol type="a"><!-- a,b,c... -->
    <li>小写字母</li>
</ol>

<ol type="I"><!-- I,II,III... -->
    <li>大写罗马数字</li>
</ol>

<ol type="i"><!-- i,ii,iii... -->
    <li>小写罗马数字</li>
</ol>

<!-- start: 起始编号 -->
<ol start="5">
    <li>从5开始</li>
    <li>这是6</li>
    <li>这是7</li>
</ol>

<!-- reversed: 倒序 -->
<ol reversed>
    <li>倒计时 3</li>
    <li>倒计时 2</li>
    <li>倒计时 1</li>
</ol>`,
                        notes: "type、start、reversed属性控制编号样式"
                    },
                    {
                        title: "自定义编号位置",
                        code: `<!-- value属性指定某项的编号 -->
<ol>
    <li>自动编号1</li>
    <li>自动编号2</li>
    <li value="10">强制设为10</li>
    <li>继续11</li>
    <li>继续12</li>
</ol>

<!-- 分段编号 -->
<h3>第一部分</h3>
<ol>
    <li>项目1</li>
    <li>项目2</li>
</ol>

<h3>第二部分</h3>
<ol start="3">
    <li>项目3（继续编号）</li>
    <li>项目4</li>
</ol>`,
                        notes: "value可以改变单个项目的编号"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "定义列表<dl>",
            content: {
                description: "定义列表用于展示术语及其定义，或键值对类型的数据。",
                examples: [
                    {
                        title: "基本定义列表",
                        code: `<dl>
    <dt>HTML</dt>
    <dd>超文本标记语言，用于创建网页的标准标记语言。</dd>
    
    <dt>CSS</dt>
    <dd>层叠样式表，用于描述HTML元素的样式。</dd>
    
    <dt>JavaScript</dt>
    <dd>一种高级的、解释型的编程语言。</dd>
    <dd>用于网页的动态交互。</dd>
</dl>`,
                        notes: "dt是术语，dd是定义，一个dt可以有多个dd"
                    },
                    {
                        title: "词汇表",
                        code: `<h2>技术词汇表</h2>
<dl>
    <dt>API</dt>
    <dd>
        应用程序编程接口（Application Programming Interface），
        是一些预先定义的函数和规范。
    </dd>
    
    <dt>SDK</dt>
    <dd>
        软件开发工具包（Software Development Kit），
        包含开发特定软件所需的工具和资源。
    </dd>
    
    <dt>IDE</dt>
    <dd>
        集成开发环境（Integrated Development Environment），
        提供程序开发环境的应用程序。
    </dd>
</dl>`,
                        notes: "定义列表非常适合词汇表"
                    },
                    {
                        title: "元数据展示",
                        code: `<dl>
    <dt>作者</dt>
    <dd>张三</dd>
    
    <dt>发布日期</dt>
    <dd>2024年1月15日</dd>
    
    <dt>标签</dt>
    <dd>HTML</dd>
    <dd>教程</dd>
    <dd>前端开发</dd>
    
    <dt>类别</dt>
    <dd>Web开发</dd>
</dl>

<!-- 产品规格 -->
<dl>
    <dt>品牌</dt>
    <dd>Apple</dd>
    
    <dt>型号</dt>
    <dd>iPhone 15 Pro</dd>
    
    <dt>存储</dt>
    <dd>256GB</dd>
    <dd>512GB</dd>
    <dd>1TB</dd>
    
    <dt>颜色</dt>
    <dd>原色钛金属</dd>
    <dd>黑色钛金属</dd>
</dl>`,
                        notes: "定义列表很适合展示结构化数据"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "嵌套列表",
            content: {
                description: "列表可以相互嵌套，创建多层级的结构。",
                examples: [
                    {
                        title: "嵌套无序列表",
                        code: `<ul>
    <li>水果
        <ul>
            <li>苹果</li>
            <li>香蕉</li>
            <li>橙子</li>
        </ul>
    </li>
    <li>蔬菜
        <ul>
            <li>西红柿</li>
            <li>黄瓜</li>
            <li>胡萝卜</li>
        </ul>
    </li>
</ul>`,
                        notes: "子列表放在父li标签内部"
                    },
                    {
                        title: "嵌套有序列表",
                        code: `<ol>
    <li>前端开发
        <ol type="a">
            <li>HTML基础</li>
            <li>CSS样式
                <ol type="i">
                    <li>选择器</li>
                    <li>布局</li>
                    <li>响应式设计</li>
                </ol>
            </li>
            <li>JavaScript编程</li>
        </ol>
    </li>
    <li>后端开发
        <ol type="a">
            <li>Node.js</li>
            <li>数据库</li>
            <li>API设计</li>
        </ol>
    </li>
</ol>`,
                        notes: "可以为不同层级设置不同的编号样式"
                    },
                    {
                        title: "混合嵌套",
                        code: `<ol>
    <li>准备工作
        <ul>
            <li>安装开发工具</li>
            <li>配置环境</li>
            <li>创建项目</li>
        </ul>
    </li>
    <li>开始开发
        <ul>
            <li>编写HTML</li>
            <li>添加CSS</li>
            <li>实现JavaScript功能</li>
        </ul>
    </li>
    <li>测试与发布
        <ul>
            <li>功能测试</li>
            <li>性能优化</li>
            <li>部署上线</li>
        </ul>
    </li>
</ol>`,
                        notes: "ol和ul可以混合嵌套使用"
                    }
                ]
            }
        },
        {
            type: "comparison",
            title: "列表类型对比",
            content: {
                description: "不同列表类型适用于不同的场景，选择正确的列表类型很重要。",
                items: [
                    {
                        name: "无序列表（ul）",
                        pros: [
                            "适合项目顺序不重要的情况",
                            "常用于导航菜单",
                            "适合特性、优势列表",
                            "购物清单、待办事项",
                            "相关链接列表"
                        ]
                    },
                    {
                        name: "有序列表（ol）",
                        pros: [
                            "适合步骤说明",
                            "操作指南、教程",
                            "排名、榜单",
                            "时间线事件",
                            "有明确顺序的内容"
                        ]
                    },
                    {
                        name: "定义列表（dl）",
                        pros: [
                            "术语和定义",
                            "FAQ问答",
                            "键值对数据",
                            "词汇表、词典",
                            "元数据展示",
                            "产品规格参数"
                        ]
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "列表使用最佳实践",
            content: {
                description: "遵循这些最佳实践可以创建更规范、更语义化的列表：",
                practices: [
                    {
                        title: "选择合适的列表类型",
                        description: "根据内容的性质选择最合适的列表类型。",
                        example: `<!-- ✅ 好：步骤用有序列表 -->
<h3>安装步骤：</h3>
<ol>
    <li>下载安装包</li>
    <li>运行安装程序</li>
    <li>完成配置</li>
</ol>

<!-- ❌ 不好：步骤用无序列表 -->
<h3>安装步骤：</h3>
<ul>
    <li>下载安装包</li>
    <li>运行安装程序</li>
    <li>完成配置</li>
</ul>`
                    },
                    {
                        title: "保持列表项的一致性",
                        description: "列表项应该在语法结构和内容层次上保持一致。",
                        example: `<!-- ✅ 好：语法一致 -->
<ul>
    <li>学习HTML</li>
    <li>学习CSS</li>
    <li>学习JavaScript</li>
</ul>

<!-- ❌ 不好：语法不一致 -->
<ul>
    <li>学习HTML</li>
    <li>CSS样式表</li>
    <li>要掌握JavaScript</li>
</ul>`
                    },
                    {
                        title: "只在li标签中放列表项内容",
                        description: "列表内容必须在li标签中，不能直接放在ul/ol中。",
                        example: `<!-- ✅ 正确 -->
<ul>
    <li>项目1</li>
    <li>项目2</li>
</ul>

<!-- ❌ 错误 -->
<ul>
    项目1
    <li>项目2</li>
</ul>`
                    },
                    {
                        title: "嵌套列表的正确写法",
                        description: "子列表应该放在父列表项的li标签内部。",
                        example: `<!-- ✅ 正确：子列表在li内 -->
<ul>
    <li>父项目1
        <ul>
            <li>子项目1</li>
            <li>子项目2</li>
        </ul>
    </li>
    <li>父项目2</li>
</ul>

<!-- ❌ 错误：子列表在li外 -->
<ul>
    <li>父项目1</li>
    <ul>
        <li>子项目1</li>
        <li>子项目2</li>
    </ul>
    <li>父项目2</li>
</ul>`
                    },
                    {
                        title: "合理使用定义列表",
                        description: "定义列表适合术语-定义的结构，不要滥用。",
                        example: `<!-- ✅ 好：术语和定义 -->
<dl>
    <dt>前端</dt>
    <dd>用户界面开发</dd>
    
    <dt>后端</dt>
    <dd>服务器端开发</dd>
</dl>

<!-- ❌ 不好：普通列表用dl -->
<dl>
    <dt>苹果</dt>
    <dt>香蕉</dt>
    <dt>橙子</dt>
</dl>`
                    },
                    {
                        title: "避免过深的嵌套",
                        description: "列表嵌套不要超过3-4层，否则影响可读性。",
                        example: `<!-- ⚠️ 注意：嵌套不要太深 -->
<ul>
    <li>第1层
        <ul>
            <li>第2层
                <ul>
                    <li>第3层</li>
                </ul>
            </li>
        </ul>
    </li>
</ul>

<!-- 建议：重新组织内容结构 -->`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "列表检查清单",
            content: {
                description: "使用这个清单确保列表的正确使用：",
                items: [
                    { id: "check5-1", text: "根据内容特性选择了正确的列表类型" },
                    { id: "check5-2", text: "列表项内容在li标签内" },
                    { id: "check5-3", text: "ul/ol的直接子元素只有li" },
                    { id: "check5-4", text: "列表项内容保持一致的语法结构" },
                    { id: "check5-5", text: "嵌套列表放在父li标签内部" },
                    { id: "check5-6", text: "定义列表的dt和dd配对正确" },
                    { id: "check5-7", text: "有序列表的编号类型合适" },
                    { id: "check5-8", text: "列表嵌套层级不超过3-4层" },
                    { id: "check5-9", text: "导航菜单使用了ul列表" },
                    { id: "check5-10", text: "必要时为列表添加了标题" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "文本内容标签", url: "content.html?chapter=04" },
        next: { title: "链接与导航", url: "content.html?chapter=06" }
    }
};
