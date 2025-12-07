// 第13章：表格高级特性 - 内容数据
window.htmlContentData_13 = {
    section: {
        title: "表格高级特性",
        icon: "📈"
    },
    topics: [
        {
            type: "concept",
            title: "colgroup和col元素",
            content: {
                description: "<colgroup>和<col>元素允许你为表格的列定义样式和属性，而无需为每个单元格单独设置。",
                keyPoints: [
                    "colgroup用于对表格列进行分组",
                    "col定义单个列或列组的属性",
                    "可以设置列的宽度和样式",
                    "必须放在caption之后、thead之前",
                    "span属性指定列的数量",
                    "现代开发中CSS更常用，但col仍有用途"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/colgroup"
            }
        },
        {
            type: "code-example",
            title: "使用colgroup和col",
            content: {
                description: "学习如何使用col元素为列设置属性。",
                examples: [
                    {
                        title: "基本colgroup",
                        code: `<table>
    <caption>产品价格表</caption>
    
    <!-- 列组定义 -->
    <colgroup>
        <col style="background-color: #f0f0f0;">
        <col style="background-color: #e8f5e9;">
        <col style="background-color: #fff3e0;">
    </colgroup>
    
    <thead>
        <tr>
            <th>产品</th>
            <th>价格</th>
            <th>库存</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>笔记本</td>
            <td>¥5,999</td>
            <td>10</td>
        </tr>
        <tr>
            <td>鼠标</td>
            <td>¥99</td>
            <td>50</td>
        </tr>
    </tbody>
</table>`,
                        notes: "每个col对应一列"
                    },
                    {
                        title: "使用span属性",
                        code: `<table>
    <colgroup>
        <!-- 第一列 -->
        <col style="width: 150px;">
        <!-- 第二、三列（共2列） -->
        <col span="2" style="width: 100px;">
        <!-- 第四列 -->
        <col style="width: 200px;">
    </colgroup>
    
    <thead>
        <tr>
            <th>产品名称</th>
            <th>规格</th>
            <th>价格</th>
            <th>描述</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>产品A</td>
            <td>标准</td>
            <td>¥99</td>
            <td>这是一个很长的产品描述...</td>
        </tr>
    </tbody>
</table>`,
                        notes: "span指定col作用于几列"
                    },
                    {
                        title: "分组样式",
                        code: `<style>
    .group1 {
        background-color: #e3f2fd;
    }
    .group2 {
        background-color: #f3e5f5;
    }
</style>

<table>
    <colgroup>
        <col>
        <col span="2" class="group1">
        <col span="2" class="group2">
    </colgroup>
    
    <thead>
        <tr>
            <th>姓名</th>
            <th colspan="2">上半年</th>
            <th colspan="2">下半年</th>
        </tr>
        <tr>
            <th></th>
            <th>Q1</th>
            <th>Q2</th>
            <th>Q3</th>
            <th>Q4</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>张三</td>
            <td>90</td>
            <td>95</td>
            <td>88</td>
            <td>92</td>
        </tr>
    </tbody>
</table>`,
                        notes: "可以为列组设置不同样式"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "响应式表格方案",
            content: {
                description: "多种方法让表格在移动设备上可用。",
                examples: [
                    {
                        title: "方案1：横向滚动",
                        code: `<style>
    .table-responsive {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
    
    .table-responsive table {
        min-width: 600px;
        width: 100%;
    }
</style>

<div class="table-responsive">
    <table>
        <thead>
            <tr>
                <th>列1</th>
                <th>列2</th>
                <th>列3</th>
                <th>列4</th>
                <th>列5</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>数据1</td>
                <td>数据2</td>
                <td>数据3</td>
                <td>数据4</td>
                <td>数据5</td>
            </tr>
        </tbody>
    </table>
</div>`,
                        notes: "简单但可能影响用户体验"
                    },
                    {
                        title: "方案2：隐藏次要列",
                        code: `<style>
    /* 默认显示所有列 */
    table {
        width: 100%;
    }
    
    /* 移动端隐藏次要列 */
    @media (max-width: 768px) {
        .hide-mobile {
            display: none;
        }
    }
</style>

<table>
    <thead>
        <tr>
            <th>姓名</th>
            <th>电话</th>
            <th class="hide-mobile">邮箱</th>
            <th class="hide-mobile">地址</th>
            <th class="hide-mobile">备注</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>张三</td>
            <td>138****1234</td>
            <td class="hide-mobile">zhang@example.com</td>
            <td class="hide-mobile">北京市朝阳区</td>
            <td class="hide-mobile">VIP客户</td>
        </tr>
    </tbody>
</table>`,
                        notes: "移动端只显示重要信息"
                    },
                    {
                        title: "方案3：卡片布局",
                        code: `<style>
    /* 桌面端：普通表格 */
    table {
        width: 100%;
        border-collapse: collapse;
    }
    
    th, td {
        padding: 10px;
        border: 1px solid #ddd;
        text-align: left;
    }
    
    /* 移动端：卡片布局 */
    @media (max-width: 768px) {
        table, thead, tbody, th, td, tr {
            display: block;
        }
        
        thead tr {
            position: absolute;
            top: -9999px;
            left: -9999px;
        }
        
        tr {
            margin-bottom: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 10px;
        }
        
        td {
            border: none;
            position: relative;
            padding-left: 50%;
            min-height: 30px;
        }
        
        td:before {
            content: attr(data-label);
            position: absolute;
            left: 10px;
            width: 45%;
            padding-right: 10px;
            white-space: nowrap;
            font-weight: bold;
        }
    }
</style>

<table>
    <thead>
        <tr>
            <th>姓名</th>
            <th>年龄</th>
            <th>职位</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td data-label="姓名">张三</td>
            <td data-label="年龄">28</td>
            <td data-label="职位">工程师</td>
        </tr>
        <tr>
            <td data-label="姓名">李四</td>
            <td data-label="年龄">32</td>
            <td data-label="职位">经理</td>
        </tr>
    </tbody>
</table>`,
                        notes: "移动端完全重新布局，使用data-label"
                    },
                    {
                        title: "方案4：翻转表格",
                        code: `<style>
    @media (max-width: 768px) {
        /* 翻转表格，行变列 */
        .flip-table {
            display: flex;
            overflow-x: auto;
        }
        
        .flip-table thead {
            display: flex;
            flex-direction: column;
        }
        
        .flip-table tbody {
            display: flex;
        }
        
        .flip-table tr {
            display: flex;
            flex-direction: column;
            min-width: 150px;
        }
        
        .flip-table th,
        .flip-table td {
            display: block;
            padding: 10px;
            border: 1px solid #ddd;
        }
    }
</style>

<table class="flip-table">
    <thead>
        <tr>
            <th>指标</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>销售额</td>
            <td>成本</td>
            <td>利润</td>
        </tr>
        <tr>
            <td>¥100万</td>
            <td>¥60万</td>
            <td>¥40万</td>
        </tr>
    </tbody>
</table>`,
                        notes: "适合数据较少但列很多的表格"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "交互式表格功能",
            content: {
                description: "使用JavaScript增强表格功能。",
                examples: [
                    {
                        title: "排序功能",
                        code: `<table id="sortable-table">
    <thead>
        <tr>
            <th onclick="sortTable(0)">姓名 ⬍</th>
            <th onclick="sortTable(1)">年龄 ⬍</th>
            <th onclick="sortTable(2)">分数 ⬍</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>张三</td>
            <td>25</td>
            <td>85</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>30</td>
            <td>92</td>
        </tr>
        <tr>
            <td>王五</td>
            <td>28</td>
            <td>78</td>
        </tr>
    </tbody>
</table>

<script>
function sortTable(columnIndex) {
    const table = document.getElementById('sortable-table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // 切换排序方向
    const isAscending = tbody.dataset.sortDir !== 'asc';
    tbody.dataset.sortDir = isAscending ? 'asc' : 'desc';
    
    // 排序
    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent;
        const bText = b.cells[columnIndex].textContent;
        
        // 尝试数字比较
        const aNum = parseFloat(aText);
        const bNum = parseFloat(bText);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return isAscending ? aNum - bNum : bNum - aNum;
        }
        
        // 字符串比较
        return isAscending 
            ? aText.localeCompare(bText)
            : bText.localeCompare(aText);
    });
    
    // 重新插入排序后的行
    rows.forEach(row => tbody.appendChild(row));
}
</script>`,
                        notes: "点击表头排序"
                    },
                    {
                        title: "搜索过滤",
                        code: `<input type="text" 
       id="searchInput" 
       placeholder="搜索..." 
       onkeyup="filterTable()">

<table id="data-table">
    <thead>
        <tr>
            <th>姓名</th>
            <th>部门</th>
            <th>职位</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>张三</td>
            <td>技术部</td>
            <td>工程师</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>市场部</td>
            <td>经理</td>
        </tr>
        <tr>
            <td>王五</td>
            <td>技术部</td>
            <td>架构师</td>
        </tr>
    </tbody>
</table>

<script>
function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const table = document.getElementById('data-table');
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toUpperCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}
</script>`,
                        notes: "实时搜索过滤表格数据"
                    },
                    {
                        title: "分页功能",
                        code: `<table id="paged-table">
    <thead>
        <tr><th>ID</th><th>姓名</th><th>邮箱</th></tr>
    </thead>
    <tbody>
        <!-- 数据行 -->
    </tbody>
</table>

<div id="pagination"></div>

<script>
class TablePagination {
    constructor(tableId, rowsPerPage = 10) {
        this.table = document.getElementById(tableId);
        this.tbody = this.table.querySelector('tbody');
        this.allRows = Array.from(this.tbody.querySelectorAll('tr'));
        this.rowsPerPage = rowsPerPage;
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.allRows.length / rowsPerPage);
        
        this.showPage(1);
        this.renderPagination();
    }
    
    showPage(pageNum) {
        this.currentPage = pageNum;
        const start = (pageNum - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        
        this.allRows.forEach((row, index) => {
            row.style.display = (index >= start && index < end) ? '' : 'none';
        });
    }
    
    renderPagination() {
        const container = document.getElementById('pagination');
        let html = '';
        
        for (let i = 1; i <= this.totalPages; i++) {
            html += \`<button onclick="pagination.showPage(\${i})">\${i}</button>\`;
        }
        
        container.innerHTML = html;
    }
}

// 初始化
const pagination = new TablePagination('paged-table', 10);
</script>`,
                        notes: "分页显示大量数据"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "表格性能优化",
            content: {
                description: "优化大型表格的性能：",
                practices: [
                    {
                        title: "虚拟滚动",
                        description: "只渲染可见区域的行。",
                        example: `// 使用虚拟滚动库
// - react-virtualized
// - vue-virtual-scroller
// - 自定义实现

class VirtualTable {
    constructor(data, container, rowHeight = 50) {
        this.data = data;
        this.container = container;
        this.rowHeight = rowHeight;
        this.visibleRows = Math.ceil(container.clientHeight / rowHeight);
        this.render();
    }
    
    render() {
        // 只渲染可见行及缓冲区
        // ...
    }
}`
                    },
                    {
                        title: "延迟渲染",
                        description: "分批渲染大量数据。",
                        example: `function renderLargeTable(data, batchSize = 100) {
    const tbody = document.querySelector('tbody');
    let index = 0;
    
    function renderBatch() {
        const fragment = document.createDocumentFragment();
        const end = Math.min(index + batchSize, data.length);
        
        for (let i = index; i < end; i++) {
            const row = document.createElement('tr');
            // 创建行...
            fragment.appendChild(row);
        }
        
        tbody.appendChild(fragment);
        index = end;
        
        if (index < data.length) {
            requestAnimationFrame(renderBatch);
        }
    }
    
    renderBatch();
}`
                    },
                    {
                        title: "使用DocumentFragment",
                        description: "批量DOM操作减少重排。",
                        example: `// ❌ 不好：逐行插入
data.forEach(item => {
    const row = createRow(item);
    tbody.appendChild(row);  // 每次都触发重排
});

// ✅ 好：使用DocumentFragment
const fragment = document.createDocumentFragment();
data.forEach(item => {
    const row = createRow(item);
    fragment.appendChild(row);
});
tbody.appendChild(fragment);  // 只触发一次重排`
                    },
                    {
                        title: "避免复杂的CSS选择器",
                        description: "简化表格样式选择器。",
                        example: `/* ❌ 不好：复杂选择器 */
table tbody tr:nth-child(odd) td:first-child {
    background: #f0f0f0;
}

/* ✅ 好：使用类名 */
.odd-row .first-cell {
    background: #f0f0f0;
}`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "表格高级特性检查清单",
            content: {
                description: "确保表格的高级功能正确实现：",
                items: [
                    { id: "check13-1", text: "合理使用colgroup定义列样式" },
                    { id: "check13-2", text: "实现了移动端响应式方案" },
                    { id: "check13-3", text: "大型表格考虑了性能优化" },
                    { id: "check13-4", text: "排序功能可访问（键盘操作）" },
                    { id: "check13-5", text: "搜索过滤提供即时反馈" },
                    { id: "check13-6", text: "分页功能正常工作" },
                    { id: "check13-7", text: "使用DocumentFragment批量操作" },
                    { id: "check13-8", text: "避免了不必要的DOM操作" },
                    { id: "check13-9", text: "表格在不同设备上测试通过" },
                    { id: "check13-10", text: "考虑了数据导出功能" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "表格基础", url: "content.html?chapter=12" },
        next: { title: "表单基础", url: "content.html?chapter=14" }
    }
};
