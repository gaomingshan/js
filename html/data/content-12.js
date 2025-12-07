// 第12章：表格基础 - 内容数据
window.htmlContentData_12 = {
    section: {
        title: "表格基础",
        icon: "📊"
    },
    topics: [
        {
            type: "concept",
            title: "HTML表格概述",
            content: {
                description: "HTML表格用于以行和列的形式展示结构化数据。虽然现代网页布局不再使用表格，但表格对于展示数据仍然是最佳选择。",
                keyPoints: [
                    "表格用于展示表格数据，而非布局",
                    "基本结构：table > tr > td/th",
                    "语义化标签：thead、tbody、tfoot",
                    "支持单元格合并",
                    "可访问性需要正确的标记",
                    "响应式表格需要特殊处理"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/table"
            }
        },
        {
            type: "code-example",
            title: "基本表格结构",
            content: {
                description: "学习创建最基本的HTML表格。",
                examples: [
                    {
                        title: "简单表格",
                        code: `<table>
    <tr>
        <th>姓名</th>
        <th>年龄</th>
        <th>城市</th>
    </tr>
    <tr>
        <td>张三</td>
        <td>25</td>
        <td>北京</td>
    </tr>
    <tr>
        <td>李四</td>
        <td>30</td>
        <td>上海</td>
    </tr>
    <tr>
        <td>王五</td>
        <td>28</td>
        <td>广州</td>
    </tr>
</table>`,
                        notes: "th是表头单元格，td是数据单元格"
                    },
                    {
                        title: "带边框的表格",
                        code: `<style>
    table {
        border-collapse: collapse;
        width: 100%;
    }
    
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    
    th {
        background-color: #f2f2f2;
        font-weight: bold;
    }
    
    tr:hover {
        background-color: #f5f5f5;
    }
</style>

<table>
    <tr>
        <th>产品</th>
        <th>价格</th>
        <th>库存</th>
    </tr>
    <tr>
        <td>笔记本电脑</td>
        <td>¥5,999</td>
        <td>10</td>
    </tr>
    <tr>
        <td>鼠标</td>
        <td>¥99</td>
        <td>50</td>
    </tr>
</table>`,
                        notes: "border-collapse控制边框合并"
                    },
                    {
                        title: "表格的基本元素",
                        code: `<table>
    <!-- 表格标题 -->
    <caption>员工信息表</caption>
    
    <!-- 表头 -->
    <tr>
        <th>工号</th>
        <th>姓名</th>
        <th>部门</th>
        <th>职位</th>
    </tr>
    
    <!-- 数据行 -->
    <tr>
        <td>001</td>
        <td>张三</td>
        <td>技术部</td>
        <td>工程师</td>
    </tr>
    <tr>
        <td>002</td>
        <td>李四</td>
        <td>市场部</td>
        <td>经理</td>
    </tr>
</table>`,
                        notes: "caption为表格提供标题"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "表格结构化 - thead, tbody, tfoot",
            content: {
                description: "使用语义化标签组织表格内容。",
                examples: [
                    {
                        title: "完整的表格结构",
                        code: `<table>
    <caption>季度销售报表</caption>
    
    <!-- 表头部分 -->
    <thead>
        <tr>
            <th>月份</th>
            <th>销售额</th>
            <th>增长率</th>
        </tr>
    </thead>
    
    <!-- 表体部分 -->
    <tbody>
        <tr>
            <td>1月</td>
            <td>¥100,000</td>
            <td>+10%</td>
        </tr>
        <tr>
            <td>2月</td>
            <td>¥120,000</td>
            <td>+20%</td>
        </tr>
        <tr>
            <td>3月</td>
            <td>¥110,000</td>
            <td>-8%</td>
        </tr>
    </tbody>
    
    <!-- 表尾部分 -->
    <tfoot>
        <tr>
            <th>总计</th>
            <td>¥330,000</td>
            <td>+7.3%</td>
        </tr>
    </tfoot>
</table>`,
                        notes: "thead、tbody、tfoot提供语义化结构"
                    },
                    {
                        title: "多个tbody",
                        code: `<table>
    <thead>
        <tr>
            <th>姓名</th>
            <th>科目</th>
            <th>分数</th>
        </tr>
    </thead>
    
    <!-- 第一组学生 -->
    <tbody>
        <tr>
            <td>张三</td>
            <td>数学</td>
            <td>90</td>
        </tr>
        <tr>
            <td>张三</td>
            <td>英语</td>
            <td>85</td>
        </tr>
    </tbody>
    
    <!-- 第二组学生 -->
    <tbody>
        <tr>
            <td>李四</td>
            <td>数学</td>
            <td>88</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>英语</td>
            <td>92</td>
        </tr>
    </tbody>
</table>

<style>
    tbody:nth-child(even) {
        background-color: #f9f9f9;
    }
</style>`,
                        notes: "可以有多个tbody来分组数据"
                    },
                    {
                        title: "thead和tfoot的位置",
                        code: `<!-- tfoot可以在tbody之前或之后 -->

<!-- 方式1：tfoot在最后（推荐） -->
<table>
    <thead>...</thead>
    <tbody>...</tbody>
    <tfoot>...</tfoot>
</table>

<!-- 方式2：tfoot在tbody之前（旧规范） -->
<table>
    <thead>...</thead>
    <tfoot>...</tfoot>
    <tbody>...</tbody>
</table>

<!-- 浏览器会自动调整tfoot的显示位置到底部 -->`,
                        notes: "HTML5推荐将tfoot放在最后"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "单元格合并",
            content: {
                description: "使用colspan和rowspan合并单元格。",
                examples: [
                    {
                        title: "列合并（colspan）",
                        code: `<table border="1">
    <tr>
        <th>姓名</th>
        <th colspan="2">联系方式</th>
    </tr>
    <tr>
        <td>张三</td>
        <td>电话</td>
        <td>138****1234</td>
    </tr>
    <tr>
        <td>李四</td>
        <td>邮箱</td>
        <td>li@example.com</td>
    </tr>
</table>

<!-- colspan="2" 表示该单元格占据2列 -->`,
                        notes: "colspan横向合并单元格"
                    },
                    {
                        title: "行合并（rowspan）",
                        code: `<table border="1">
    <tr>
        <th>部门</th>
        <th>姓名</th>
        <th>职位</th>
    </tr>
    <tr>
        <td rowspan="2">技术部</td>
        <td>张三</td>
        <td>工程师</td>
    </tr>
    <tr>
        <!-- 注意：这里没有第一个td，因为被上面的rowspan占据 -->
        <td>李四</td>
        <td>架构师</td>
    </tr>
    <tr>
        <td rowspan="2">市场部</td>
        <td>王五</td>
        <td>经理</td>
    </tr>
    <tr>
        <td>赵六</td>
        <td>专员</td>
    </tr>
</table>`,
                        notes: "rowspan纵向合并单元格"
                    },
                    {
                        title: "复杂合并示例",
                        code: `<table border="1" style="border-collapse: collapse;">
    <tr>
        <th colspan="3">课程表</th>
    </tr>
    <tr>
        <th>时间</th>
        <th>周一</th>
        <th>周二</th>
    </tr>
    <tr>
        <td>8:00-9:00</td>
        <td rowspan="2">数学</td>
        <td>英语</td>
    </tr>
    <tr>
        <td>9:00-10:00</td>
        <!-- 第二列被rowspan占据 -->
        <td>物理</td>
    </tr>
    <tr>
        <td>10:00-11:00</td>
        <td colspan="2">体育</td>
    </tr>
</table>`,
                        notes: "可以组合使用colspan和rowspan"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "表格的scope属性",
            content: {
                description: "scope属性提高表格的可访问性，帮助屏幕阅读器理解表格结构。",
                examples: [
                    {
                        title: "scope基本用法",
                        code: `<table>
    <thead>
        <tr>
            <th scope="col">产品</th>
            <th scope="col">价格</th>
            <th scope="col">库存</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">笔记本电脑</th>
            <td>¥5,999</td>
            <td>10</td>
        </tr>
        <tr>
            <th scope="row">鼠标</th>
            <td>¥99</td>
            <td>50</td>
        </tr>
    </tbody>
</table>

<!-- scope属性值：
     - col: 列标题
     - row: 行标题
     - colgroup: 列组标题
     - rowgroup: 行组标题
-->`,
                        notes: "scope帮助屏幕阅读器识别标题作用范围"
                    },
                    {
                        title: "复杂表格的scope",
                        code: `<table>
    <thead>
        <tr>
            <th scope="col">科目</th>
            <th scope="colgroup" colspan="2">第一学期</th>
            <th scope="colgroup" colspan="2">第二学期</th>
        </tr>
        <tr>
            <th scope="col">　</th>
            <th scope="col">期中</th>
            <th scope="col">期末</th>
            <th scope="col">期中</th>
            <th scope="col">期末</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">数学</th>
            <td>85</td>
            <td>90</td>
            <td>88</td>
            <td>92</td>
        </tr>
        <tr>
            <th scope="row">英语</th>
            <td>78</td>
            <td>82</td>
            <td>85</td>
            <td>88</td>
        </tr>
    </tbody>
</table>`,
                        notes: "colgroup和rowgroup用于跨越多列/行的标题"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "表格样式化",
            content: {
                description: "使用CSS美化表格外观。",
                examples: [
                    {
                        title: "斑马纹表格",
                        code: `<style>
    table {
        width: 100%;
        border-collapse: collapse;
    }
    
    th {
        background-color: #4CAF50;
        color: white;
        padding: 12px;
        text-align: left;
    }
    
    td {
        padding: 10px;
        border-bottom: 1px solid #ddd;
    }
    
    /* 斑马纹效果 */
    tbody tr:nth-child(odd) {
        background-color: #f9f9f9;
    }
    
    tbody tr:nth-child(even) {
        background-color: #ffffff;
    }
    
    /* 鼠标悬停效果 */
    tbody tr:hover {
        background-color: #e8f5e9;
    }
</style>

<table>
    <thead>
        <tr>
            <th>姓名</th>
            <th>邮箱</th>
            <th>电话</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>张三</td>
            <td>zhang@example.com</td>
            <td>138****1234</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>li@example.com</td>
            <td>139****5678</td>
        </tr>
        <tr>
            <td>王五</td>
            <td>wang@example.com</td>
            <td>137****9012</td>
        </tr>
    </tbody>
</table>`,
                        notes: "nth-child创建斑马纹效果"
                    },
                    {
                        title: "固定表头",
                        code: `<style>
    .table-container {
        max-height: 300px;
        overflow-y: auto;
        position: relative;
    }
    
    table {
        width: 100%;
        border-collapse: collapse;
    }
    
    thead {
        position: sticky;
        top: 0;
        background-color: #333;
        color: white;
        z-index: 10;
    }
    
    th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }
</style>

<div class="table-container">
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>姓名</th>
                <th>部门</th>
            </tr>
        </thead>
        <tbody>
            <!-- 很多行数据 -->
            <tr><td>1</td><td>张三</td><td>技术部</td></tr>
            <tr><td>2</td><td>李四</td><td>市场部</td></tr>
            <!-- ... 更多行 ... -->
        </tbody>
    </table>
</div>`,
                        notes: "position: sticky创建固定表头"
                    },
                    {
                        title: "响应式表格",
                        code: `<style>
    /* 桌面端 */
    table {
        width: 100%;
        border-collapse: collapse;
    }
    
    th, td {
        padding: 12px;
        border: 1px solid #ddd;
        text-align: left;
    }
    
    /* 移动端 */
    @media screen and (max-width: 768px) {
        /* 方法1：横向滚动 */
        .table-wrapper {
            overflow-x: auto;
        }
        
        /* 方法2：堆叠显示 */
        table, thead, tbody, th, td, tr {
            display: block;
        }
        
        thead tr {
            position: absolute;
            top: -9999px;
            left: -9999px;
        }
        
        tr {
            margin-bottom: 15px;
            border: 1px solid #ddd;
        }
        
        td {
            border: none;
            position: relative;
            padding-left: 50%;
        }
        
        td:before {
            content: attr(data-label);
            position: absolute;
            left: 10px;
            font-weight: bold;
        }
    }
</style>

<div class="table-wrapper">
    <table>
        <thead>
            <tr>
                <th>姓名</th>
                <th>年龄</th>
                <th>城市</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td data-label="姓名">张三</td>
                <td data-label="年龄">25</td>
                <td data-label="城市">北京</td>
            </tr>
        </tbody>
    </table>
</div>`,
                        notes: "移动端可以用堆叠布局或横向滚动"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "表格使用最佳实践",
            content: {
                description: "遵循这些最佳实践创建可访问、易用的表格：",
                practices: [
                    {
                        title: "使用表格展示数据，而非布局",
                        description: "表格应该只用于表格数据，不要用于页面布局。",
                        example: `<!-- ❌ 错误：用表格布局 -->
<table>
    <tr>
        <td>导航栏</td>
        <td>内容区</td>
        <td>侧边栏</td>
    </tr>
</table>

<!-- ✅ 正确：用表格展示数据 -->
<table>
    <thead>
        <tr>
            <th>产品</th>
            <th>价格</th>
            <th>库存</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>商品A</td>
            <td>¥99</td>
            <td>10</td>
        </tr>
    </tbody>
</table>`
                    },
                    {
                        title: "使用语义化标签",
                        description: "使用thead、tbody、tfoot组织表格内容。",
                        example: `<!-- ✅ 好：语义化结构 -->
<table>
    <caption>销售数据</caption>
    <thead>
        <tr><th>月份</th><th>销售额</th></tr>
    </thead>
    <tbody>
        <tr><td>1月</td><td>¥10,000</td></tr>
    </tbody>
    <tfoot>
        <tr><th>总计</th><td>¥10,000</td></tr>
    </tfoot>
</table>`
                    },
                    {
                        title: "为表格添加标题",
                        description: "使用caption元素提供表格说明。",
                        example: `<!-- ✅ 好：有描述性标题 -->
<table>
    <caption>2024年第一季度销售报表</caption>
    <!-- ... -->
</table>

<!-- 或使用aria-labelledby -->
<h3 id="table-title">员工信息表</h3>
<table aria-labelledby="table-title">
    <!-- ... -->
</table>`
                    },
                    {
                        title: "正确使用scope属性",
                        description: "为th元素添加scope属性提高可访问性。",
                        example: `<table>
    <thead>
        <tr>
            <th scope="col">姓名</th>
            <th scope="col">年龄</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">张三</th>
            <td>25</td>
        </tr>
    </tbody>
</table>`
                    },
                    {
                        title: "提供响应式方案",
                        description: "确保表格在小屏幕上可用。",
                        example: `<!-- 方法1：横向滚动 -->
<div style="overflow-x: auto;">
    <table>...</table>
</div>

<!-- 方法2：堆叠布局（CSS媒体查询） -->
<!-- 方法3：隐藏次要列 -->
<!-- 方法4：使用data-label属性 -->`
                    },
                    {
                        title: "避免过度嵌套",
                        description: "不要在表格单元格中嵌套表格。",
                        example: `<!-- ❌ 不好：嵌套表格 -->
<table>
    <tr>
        <td>
            <table>
                <tr><td>嵌套内容</td></tr>
            </table>
        </td>
    </tr>
</table>

<!-- ✅ 好：重新设计数据结构 -->
<table>
    <tr>
        <td>单层数据</td>
    </tr>
</table>`
                    }
                ]
            }
        },
        {
            type: "accessibility",
            title: "表格可访问性",
            content: {
                description: "确保表格对所有用户都可访问，包括使用辅助技术的用户。",
                guidelines: [
                    "使用caption或aria-labelledby提供表格标题",
                    "为所有th元素添加scope属性",
                    "复杂表格使用headers和id关联",
                    "避免合并单元格造成理解困难",
                    "提供表格数据的文字摘要",
                    "确保表格在键盘导航下可用"
                ],
                examples: [
                    {
                        title: "基本可访问性",
                        code: `<table>
    <caption>员工基本信息表</caption>
    <thead>
        <tr>
            <th scope="col">工号</th>
            <th scope="col">姓名</th>
            <th scope="col">部门</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">001</th>
            <td>张三</td>
            <td>技术部</td>
        </tr>
    </tbody>
</table>`,
                        explanation: "caption、scope提供结构信息"
                    },
                    {
                        title: "复杂表格的headers",
                        code: `<table>
    <thead>
        <tr>
            <th id="name">姓名</th>
            <th id="math">数学</th>
            <th id="english">英语</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th id="student1" headers="name">张三</th>
            <td headers="student1 math">90</td>
            <td headers="student1 english">85</td>
        </tr>
        <tr>
            <th id="student2" headers="name">李四</th>
            <td headers="student2 math">88</td>
            <td headers="student2 english">92</td>
        </tr>
    </tbody>
</table>`,
                        explanation: "headers属性明确单元格与标题的关系"
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "表格检查清单",
            content: {
                description: "使用这个清单确保表格的正确实现：",
                items: [
                    { id: "check12-1", text: "表格只用于展示表格数据" },
                    { id: "check12-2", text: "使用了thead、tbody、tfoot结构" },
                    { id: "check12-3", text: "添加了caption或aria-labelledby" },
                    { id: "check12-4", text: "th元素包含scope属性" },
                    { id: "check12-5", text: "单元格合并合理且易于理解" },
                    { id: "check12-6", text: "表格在移动端有响应式方案" },
                    { id: "check12-7", text: "表格样式清晰易读" },
                    { id: "check12-8", text: "复杂表格使用headers关联" },
                    { id: "check12-9", text: "避免了嵌套表格" },
                    { id: "check12-10", text: "测试了键盘导航和屏幕阅读器" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "Canvas基础", url: "content.html?chapter=11" },
        next: { title: "表格高级特性", url: "content.html?chapter=13" }
    }
};
