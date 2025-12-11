# 第 12 章：表格基础

## 概述

表格用于展示二维数据。HTML 提供了完整的表格标签体系，合理使用能让数据清晰易读。

## 一、表格基本结构

### 1.1 最简单的表格

```html
<table>
  <tr>
    <td>行1列1</td>
    <td>行1列2</td>
  </tr>
  <tr>
    <td>行2列1</td>
    <td>行2列2</td>
  </tr>
</table>
```

**基本标签：**
- `<table>`：表格容器
- `<tr>`：表格行（table row）
- `<td>`：单元格（table data）

### 1.2 添加表头

```html
<table>
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
</table>
```

> **💡 提示**  
> `<th>` 表头单元格默认加粗居中，且有语义化优势。

## 二、表格结构化

### 2.1 完整表格结构

```html
<table>
  <thead>
    <tr>
      <th>产品</th>
      <th>价格</th>
      <th>数量</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>iPhone</td>
      <td>¥5999</td>
      <td>10</td>
    </tr>
    <tr>
      <td>iPad</td>
      <td>¥3999</td>
      <td>5</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="2">总计</td>
      <td>15</td>
    </tr>
  </tfoot>
</table>
```

**结构标签：**
- `<thead>`：表头区域
- `<tbody>`：表体区域
- `<tfoot>`：表尾区域

> **📌 好处**  
> - 语义化清晰
> - 方便 CSS 样式化
> - 打印时自动在每页重复表头

### 2.2 标题 `<caption>`

```html
<table>
  <caption>2024年销售数据</caption>
  <thead>
    <tr>
      <th>月份</th>
      <th>销售额</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1月</td>
      <td>¥100,000</td>
    </tr>
  </tbody>
</table>
```

## 三、单元格合并

### 3.1 跨列合并 `colspan`

```html
<table border="1">
  <tr>
    <th colspan="3">个人信息</th>
  </tr>
  <tr>
    <td>姓名</td>
    <td>年龄</td>
    <td>城市</td>
  </tr>
  <tr>
    <td>张三</td>
    <td>25</td>
    <td>北京</td>
  </tr>
</table>
```

### 3.2 跨行合并 `rowspan`

```html
<table border="1">
  <tr>
    <td rowspan="2">分类A</td>
    <td>产品1</td>
    <td>¥100</td>
  </tr>
  <tr>
    <td>产品2</td>
    <td>¥200</td>
  </tr>
  <tr>
    <td>分类B</td>
    <td>产品3</td>
    <td>¥150</td>
  </tr>
</table>
```

### 3.3 复杂合并

```html
<table border="1">
  <tr>
    <th rowspan="2">姓名</th>
    <th colspan="2">成绩</th>
  </tr>
  <tr>
    <th>语文</th>
    <th>数学</th>
  </tr>
  <tr>
    <td>张三</td>
    <td>90</td>
    <td>85</td>
  </tr>
</table>
```

## 四、表格属性

### 4.1 边框（已废弃，用 CSS）

```html
<!-- ❌ 不推荐：HTML 属性 -->
<table border="1" cellpadding="10" cellspacing="0">

<!-- ✅ 推荐：CSS -->
<table class="styled-table">
<style>
.styled-table {
  border-collapse: collapse;
  width: 100%;
}
.styled-table th,
.styled-table td {
  border: 1px solid #ddd;
  padding: 10px;
}
</style>
```

### 4.2 表格样式（CSS）

```html
<style>
table {
  width: 100%;
  border-collapse: collapse;  /* 边框合并 */
  border-spacing: 0;          /* 边框间距 */
  table-layout: fixed;        /* 固定布局 */
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #4CAF50;
  color: white;
  font-weight: bold;
}

tr:hover {
  background-color: #f5f5f5;
}

/* 斑马纹 */
tbody tr:nth-child(odd) {
  background-color: #f9f9f9;
}
</style>
```

## 五、列分组

### 5.1 `<colgroup>` 和 `<col>`

```html
<table>
  <colgroup>
    <col style="background-color: #f0f0f0;">
    <col span="2" style="background-color: #e0e0e0;">
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
      <td>iPhone</td>
      <td>¥5999</td>
      <td>100</td>
    </tr>
  </tbody>
</table>
```

> **💡 用途**  
> 为整列设置样式，避免为每个单元格单独设置。

## 六、可访问性

### 6.1 scope 属性

```html
<table>
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
</table>
```

**scope 值：**
- `col`：列表头
- `row`：行表头
- `colgroup`：列组表头
- `rowgroup`：行组表头

### 6.2 headers 属性

```html
<table>
  <tr>
    <th id="name">姓名</th>
    <th id="age">年龄</th>
  </tr>
  <tr>
    <td headers="name">张三</td>
    <td headers="age">25</td>
  </tr>
</table>
```

### 6.3 表格摘要

```html
<!-- ❌ summary 已废弃 -->
<table summary="2024年销售数据">

<!-- ✅ 使用 caption 或 aria-describedby -->
<p id="summary">本表格显示2024年各月销售数据</p>
<table aria-describedby="summary">
  <caption>2024年销售数据</caption>
  <!-- 表格内容 -->
</table>
```

## 七、响应式表格

### 7.1 横向滚动

```html
<div class="table-container">
  <table>
    <!-- 表格内容 -->
  </table>
</div>

<style>
.table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  min-width: 600px;
}
</style>
```

### 7.2 堆叠显示（移动端）

```html
<style>
@media (max-width: 768px) {
  table, thead, tbody, th, td, tr {
    display: block;
  }
  
  thead tr {
    display: none;
  }
  
  tr {
    margin-bottom: 15px;
    border: 1px solid #ddd;
  }
  
  td {
    text-align: right;
    padding-left: 50%;
    position: relative;
  }
  
  td::before {
    content: attr(data-label);
    position: absolute;
    left: 10px;
    font-weight: bold;
  }
}
</style>

<table>
  <thead>
    <tr>
      <th>姓名</th>
      <th>年龄</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-label="姓名">张三</td>
      <td data-label="年龄">25</td>
    </tr>
  </tbody>
</table>
```

## 八、实战示例

### 8.1 数据表格

```html
<table class="data-table">
  <caption>员工信息表</caption>
  <thead>
    <tr>
      <th scope="col">ID</th>
      <th scope="col">姓名</th>
      <th scope="col">部门</th>
      <th scope="col">职位</th>
      <th scope="col">薪资</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>001</td>
      <td>张三</td>
      <td>技术部</td>
      <td>工程师</td>
      <td>¥15,000</td>
    </tr>
    <tr>
      <td>002</td>
      <td>李四</td>
      <td>市场部</td>
      <td>经理</td>
      <td>¥20,000</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th colspan="4">总薪资</th>
      <td>¥35,000</td>
    </tr>
  </tfoot>
</table>

<style>
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
}

.data-table caption {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.data-table th {
  background-color: #2c3e50;
  color: white;
  padding: 12px;
  text-align: left;
}

.data-table td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.data-table tbody tr:hover {
  background-color: #f5f5f5;
}

.data-table tfoot th,
.data-table tfoot td {
  background-color: #ecf0f1;
  font-weight: bold;
}
</style>
```

### 8.2 价格对比表

```html
<table class="pricing-table">
  <thead>
    <tr>
      <th>功能</th>
      <th>基础版</th>
      <th>专业版</th>
      <th>企业版</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">用户数</th>
      <td>1</td>
      <td>5</td>
      <td>无限</td>
    </tr>
    <tr>
      <th scope="row">存储空间</th>
      <td>10GB</td>
      <td>100GB</td>
      <td>1TB</td>
    </tr>
    <tr>
      <th scope="row">技术支持</th>
      <td>邮件</td>
      <td>邮件+电话</td>
      <td>24/7专属</td>
    </tr>
    <tr>
      <th scope="row">价格</th>
      <td><strong>免费</strong></td>
      <td><strong>¥99/月</strong></td>
      <td><strong>¥999/月</strong></td>
    </tr>
  </tbody>
</table>
```

## 九、表格最佳实践

> **📌 表格使用原则**
> 
> 1. **仅用于表格数据**：不要用于布局
> 2. **使用结构标签**：`<thead>`, `<tbody>`, `<tfoot>`
> 3. **添加 caption**：说明表格内容
> 4. **使用 scope**：提升可访问性
> 5. **响应式处理**：移动端友好
> 6. **避免嵌套**：表格不嵌套表格
> 7. **样式用 CSS**：不用 HTML 属性

```html
<!-- ❌ 错误：用表格布局 -->
<table>
  <tr>
    <td>导航栏</td>
  </tr>
  <tr>
    <td>
      <table>
        <tr>
          <td>侧边栏</td>
          <td>内容</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- ✅ 正确：用于表格数据 -->
<table>
  <caption>销售数据</caption>
  <thead>
    <tr>
      <th scope="col">月份</th>
      <th scope="col">销售额</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1月</td>
      <td>¥100,000</td>
    </tr>
  </tbody>
</table>
```

## 参考资料

- [MDN - `<table>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/table)
- [MDN - 表格基础](https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Tables/Basics)
- [W3C - Tables](https://html.spec.whatwg.org/#tables)

---

**上一章** ← [第 11 章：iframe 与嵌入](./11-iframe.md)  
**下一章** → [第 13 章：表单基础](./13-forms-basic.md)
