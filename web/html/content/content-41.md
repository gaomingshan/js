# 表格与结构化数据

## 核心概念

HTML 表格（`<table>`）用于展示**二维结构化数据**。表格是 HTML 中语义最丰富的结构之一，拥有完整的行列模型、分组机制和可访问性支持。

**后端类比**：
- `<table>` ≈ 数据库查询结果集（ResultSet）
- `<thead>` ≈ 列定义（Schema）
- `<tbody>` ≈ 数据行（Rows）
- `<th>` ≈ 字段名（Column Name）
- `<td>` ≈ 字段值（Column Value）

**使用原则**：表格只用于展示**真正的表格数据**，不用于页面布局。

## 表格的完整语义结构

### 基础结构

```html
<table>
  <caption>2024 年季度营收报告</caption>
  
  <thead>
    <tr>
      <th>季度</th>
      <th>营收（万元）</th>
      <th>同比增长</th>
    </tr>
  </thead>
  
  <tbody>
    <tr>
      <td>Q1</td>
      <td>1,200</td>
      <td>+15%</td>
    </tr>
    <tr>
      <td>Q2</td>
      <td>1,580</td>
      <td>+23%</td>
    </tr>
    <tr>
      <td>Q3</td>
      <td>1,350</td>
      <td>+12%</td>
    </tr>
    <tr>
      <td>Q4</td>
      <td>1,890</td>
      <td>+31%</td>
    </tr>
  </tbody>
  
  <tfoot>
    <tr>
      <td>全年合计</td>
      <td>6,020</td>
      <td>+20%</td>
    </tr>
  </tfoot>
</table>
```

### 各元素职责

| 元素 | 语义 | 后端类比 |
|------|------|---------|
| `<table>` | 表格容器 | ResultSet |
| `<caption>` | 表格标题/说明 | 查询描述 |
| `<thead>` | 表头分组 | 列定义 |
| `<tbody>` | 表体分组（可多个） | 数据分区 |
| `<tfoot>` | 表尾分组（汇总行） | 聚合结果 |
| `<tr>` | 行 | 一条记录 |
| `<th>` | 表头单元格 | 字段名 |
| `<td>` | 数据单元格 | 字段值 |
| `<colgroup>` / `<col>` | 列分组/列定义 | 列属性 |

### `<caption>` 的重要性

```html
<!-- ✅ caption 让表格有明确的上下文 -->
<table>
  <caption>
    用户注册数据（2024年1月-3月）
    <p><small>数据来源：运营后台，更新时间：2024-03-31</small></p>
  </caption>
  <!-- ... -->
</table>
```

`<caption>` 是表格的**标题**，屏幕阅读器在进入表格前会先读出 caption，帮助用户判断是否需要阅读此表格。这与后端 API 返回数据时附带的 `description` 字段类似。

### `<colgroup>` 与 `<col>`：列级控制

```html
<table>
  <colgroup>
    <col>                               <!-- 第1列：默认 -->
    <col style="background: #f0f9ff;">  <!-- 第2列：浅蓝背景 -->
    <col span="2" class="highlight">    <!-- 第3-4列：应用 class -->
  </colgroup>
  <thead>
    <tr>
      <th>姓名</th>
      <th>部门</th>
      <th>Q1 业绩</th>
      <th>Q2 业绩</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>张三</td>
      <td>技术部</td>
      <td>95</td>
      <td>88</td>
    </tr>
  </tbody>
</table>
```

`<col>` 可以对整列设置样式或 class，而无需给每个 `<td>` 单独添加。

## 合并单元格

### rowspan：跨行合并

```html
<table>
  <thead>
    <tr>
      <th>部门</th>
      <th>姓名</th>
      <th>职位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="3">技术部</td>
      <td>张三</td>
      <td>前端工程师</td>
    </tr>
    <tr>
      <!-- 此行不需要第1列的 td -->
      <td>李四</td>
      <td>后端工程师</td>
    </tr>
    <tr>
      <td>王五</td>
      <td>架构师</td>
    </tr>
    <tr>
      <td rowspan="2">产品部</td>
      <td>赵六</td>
      <td>产品经理</td>
    </tr>
    <tr>
      <td>孙七</td>
      <td>UX 设计师</td>
    </tr>
  </tbody>
</table>
```

### colspan：跨列合并

```html
<table>
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
      <td>95</td>
      <td>88</td>
      <td>92</td>
      <td>96</td>
    </tr>
  </tbody>
</table>
```

### 复杂合并示例

```html
<!-- 课程表 -->
<table>
  <caption>计算机科学 2024 春季课程表</caption>
  <thead>
    <tr>
      <th>时间</th>
      <th>周一</th>
      <th>周二</th>
      <th>周三</th>
      <th>周四</th>
      <th>周五</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>08:00-09:30</td>
      <td rowspan="2">数据结构</td>
      <td>操作系统</td>
      <td rowspan="2">数据结构</td>
      <td>操作系统</td>
      <td>自习</td>
    </tr>
    <tr>
      <td>09:45-11:15</td>
      <!-- 数据结构跨行 -->
      <td>计算机网络</td>
      <!-- 数据结构跨行 -->
      <td>计算机网络</td>
      <td colspan="1">算法实验</td>
    </tr>
  </tbody>
</table>
```

## 表格的可访问性

### scope 属性

`scope` 告诉屏幕阅读器表头单元格关联的是行还是列：

```html
<table>
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
      <td>¥6,999</td>
      <td>128</td>
    </tr>
    <tr>
      <th scope="row">机械键盘</th>
      <td>¥599</td>
      <td>456</td>
    </tr>
  </tbody>
</table>
```

屏幕阅读器播报效果：
- 读到 `¥6,999` 时：**"产品：笔记本电脑，价格：¥6,999"**
- 没有 `scope` 时：**"¥6,999"**（丢失上下文）

### headers 属性（复杂表格）

当表格结构复杂（多级表头、合并单元格）时，`scope` 不够用，需要 `headers` 显式关联：

```html
<table>
  <thead>
    <tr>
      <th id="name" rowspan="2">姓名</th>
      <th id="h1" colspan="2">上半年</th>
      <th id="h2" colspan="2">下半年</th>
    </tr>
    <tr>
      <th id="q1" headers="h1">Q1</th>
      <th id="q2" headers="h1">Q2</th>
      <th id="q3" headers="h2">Q3</th>
      <th id="q4" headers="h2">Q4</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th id="zs" headers="name">张三</th>
      <td headers="zs h1 q1">95</td>
      <td headers="zs h1 q2">88</td>
      <td headers="zs h2 q3">92</td>
      <td headers="zs h2 q4">96</td>
    </tr>
  </tbody>
</table>
```

屏幕阅读器读到 `88` 时：**"张三，上半年，Q2：88"**。

### aria-describedby 与 aria-label

```html
<!-- 给表格额外的描述 -->
<p id="table-desc">以下表格展示各部门的 KPI 完成率，绿色表示达标。</p>
<table aria-describedby="table-desc">
  <!-- ... -->
</table>

<!-- 当 caption 不适合时用 aria-label -->
<table aria-label="用户权限矩阵">
  <!-- ... -->
</table>
```

## 响应式表格

表格在小屏幕上是经典难题——列数固定，手机屏幕放不下。

### 方案 1：水平滚动（最常用）

```html
<div class="table-wrapper" tabindex="0" role="region" aria-label="可滚动表格">
  <table>
    <!-- 正常表格结构 -->
  </table>
</div>
```

```css
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* 可选：渐变阴影提示可滚动 */
.table-wrapper {
  background: 
    linear-gradient(to right, white 30%, transparent),
    linear-gradient(to left, white 30%, transparent),
    linear-gradient(to right, rgba(0,0,0,.1), transparent 20px),
    linear-gradient(to left, rgba(0,0,0,.1), transparent 20px);
  background-position: left, right, left, right;
  background-repeat: no-repeat;
  background-size: 40px 100%, 40px 100%, 20px 100%, 20px 100%;
  background-attachment: local, local, scroll, scroll;
}
```

注意添加 `tabindex="0"` 和 `role="region"`，让键盘用户可以聚焦并滚动表格。

### 方案 2：卡片化堆叠

```css
@media (max-width: 640px) {
  table, thead, tbody, th, td, tr {
    display: block;
  }
  
  thead {
    position: absolute;
    left: -9999px;  /* 视觉隐藏但屏幕阅读器可读 */
  }
  
  tr {
    margin-bottom: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.5rem;
  }
  
  td {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border-bottom: 1px solid #f3f4f6;
  }
  
  td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #374151;
  }
}
```

```html
<!-- 需要在 td 上添加 data-label -->
<tbody>
  <tr>
    <td data-label="姓名">张三</td>
    <td data-label="部门">技术部</td>
    <td data-label="业绩">95</td>
  </tr>
</tbody>
```

### 方案 3：固定首列

```css
@media (max-width: 640px) {
  .table-wrapper {
    overflow-x: auto;
  }
  
  table th:first-child,
  table td:first-child {
    position: sticky;
    left: 0;
    background: white;
    z-index: 1;
    box-shadow: 2px 0 4px rgba(0,0,0,0.1);
  }
}
```

### 方案选型

| 方案 | 优势 | 劣势 | 适用场景 |
|------|------|------|---------|
| 水平滚动 | 简单、保持结构 | 用户需主动滚动 | 列数适中、数据密集 |
| 卡片化 | 移动端友好 | 不便比较行间数据 | 列数少、每行是独立实体 |
| 固定首列 | 保留行标识 | 实现稍复杂 | 首列是关键标识 |

## 表格排序与交互

### 可排序表头的 HTML 结构

```html
<table>
  <thead>
    <tr>
      <th scope="col">
        <button aria-sort="none">
          姓名
          <span aria-hidden="true">↕</span>
        </button>
      </th>
      <th scope="col">
        <button aria-sort="ascending">
          分数
          <span aria-hidden="true">↑</span>
        </button>
      </th>
      <th scope="col">
        <button aria-sort="none">
          日期
          <span aria-hidden="true">↕</span>
        </button>
      </th>
    </tr>
  </thead>
  <!-- ... -->
</table>
```

**关键**：
- 表头排序触发器用 `<button>`（可聚焦、可键盘操作）
- `aria-sort` 标记当前排序状态（`none` / `ascending` / `descending`）
- 排序图标用 `aria-hidden="true"` 对屏幕阅读器隐藏

## 工程实践

### 场景 1：后端数据渲染表格

```javascript
// Node.js / Express
function renderTable(columns, rows) {
  return `
    <div class="table-wrapper" tabindex="0" role="region" aria-label="数据表格">
      <table>
        <thead>
          <tr>
            ${columns.map(col => 
              `<th scope="col">${escapeHtml(col.label)}</th>`
            ).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.length === 0 
            ? `<tr><td colspan="${columns.length}">暂无数据</td></tr>`
            : rows.map(row => `
                <tr>
                  ${columns.map(col => 
                    `<td data-label="${escapeHtml(col.label)}">${escapeHtml(row[col.key])}</td>`
                  ).join('')}
                </tr>
              `).join('')
          }
        </tbody>
      </table>
    </div>
  `;
}

// 使用
renderTable(
  [
    { key: 'name', label: '姓名' },
    { key: 'dept', label: '部门' },
    { key: 'score', label: '评分' }
  ],
  [
    { name: '张三', dept: '技术部', score: '95' },
    { name: '李四', dept: '产品部', score: '88' }
  ]
);
```

### 场景 2：React / Vue 表格组件

```jsx
// React
function DataTable({ columns, data, caption }) {
  return (
    <div className="table-wrapper" tabIndex={0} role="region" aria-label="数据表格">
      <table>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} scope="col">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map(col => (
                <td key={col.key} data-label={col.label}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 场景 3：数据库查询结果 → HTML 表格

```javascript
// 后端查询 → 前端表格的完整链路
// 1. 后端查询
const result = await db.query('SELECT name, dept, score FROM employees ORDER BY score DESC');

// 2. API 返回
res.json({
  columns: [
    { key: 'name', label: '姓名', sortable: true },
    { key: 'dept', label: '部门', sortable: false },
    { key: 'score', label: '评分', sortable: true }
  ],
  rows: result.rows,
  total: result.rowCount
});

// 3. 前端渲染为语义化表格
// 保持 columns 元数据 → <th>
// 保持 rows 数据 → <tr> + <td>
// total → 展示在 caption 或 tfoot 中
```

**关键认知**：数据库的 Schema（列定义）对应 `<thead>`，查询结果（行数据）对应 `<tbody>`，聚合结果（COUNT/SUM）对应 `<tfoot>`。表格的 HTML 结构天然映射关系型数据。

## 常见误区

### 误区 1：用表格做页面布局

```html
<!-- ❌ 2000 年代的做法：表格布局 -->
<table>
  <tr>
    <td>Logo</td>
    <td>导航菜单</td>
  </tr>
  <tr>
    <td>侧边栏</td>
    <td>主要内容</td>
  </tr>
</table>

<!-- ✅ 现代做法：CSS Grid / Flexbox -->
<div class="layout">
  <header>Logo + 导航</header>
  <aside>侧边栏</aside>
  <main>主要内容</main>
</div>
```

### 误区 2：省略 thead / tbody / tfoot

```html
<!-- ❌ 扁平结构：语义不清 -->
<table>
  <tr><th>名称</th><th>价格</th></tr>
  <tr><td>商品A</td><td>¥99</td></tr>
</table>

<!-- ✅ 完整结构 -->
<table>
  <thead>
    <tr><th scope="col">名称</th><th scope="col">价格</th></tr>
  </thead>
  <tbody>
    <tr><td>商品A</td><td>¥99</td></tr>
  </tbody>
</table>
```

即使浏览器会自动补全 `<tbody>`，显式声明仍然是最佳实践——语义清晰、CSS 选择器更精确、可访问性更好。

### 误区 3：忽略 scope 和 headers

```html
<!-- ❌ 屏幕阅读器无法关联表头和数据 -->
<th>价格</th>

<!-- ✅ 明确声明关联方向 -->
<th scope="col">价格</th>
```

### 误区 4：空单元格不处理

```html
<!-- ❌ 空 td：屏幕阅读器可能跳过或报"空" -->
<td></td>

<!-- ✅ 提供有意义的替代 -->
<td>—</td>
<!-- 或 -->
<td><span aria-label="无数据">—</span></td>
```

## 深入一点：表格与打印

表格在打印时有特殊行为——`<thead>` 和 `<tfoot>` 会在每页重复显示：

```css
@media print {
  thead {
    display: table-header-group;  /* 每页重复表头 */
  }
  tfoot {
    display: table-footer-group;  /* 每页重复表尾 */
  }
  tr {
    page-break-inside: avoid;     /* 避免行被分页截断 */
  }
}
```

这也是为什么 `<thead>` 和 `<tfoot>` 在语义上很重要的原因之一——它们不仅是视觉分组，还影响打印行为。

## 参考资源

- [HTML Living Standard - Tables](https://html.spec.whatwg.org/multipage/tables.html)
- [MDN - `<table>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table)
- [W3C - Tables Tutorial](https://www.w3.org/WAI/tutorials/tables/)
- [Adrian Roselli - Responsive Tables](https://adrianroselli.com/2017/11/a-responsive-accessible-table.html)
