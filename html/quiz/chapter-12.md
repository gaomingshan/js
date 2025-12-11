# 第 12 章：表格基础 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 表格结构

### 题目

HTML 表格的基本结构由哪些元素组成？

**选项：**
- A. `<table>`, `<tr>`, `<td>`
- B. `<table>`, `<row>`, `<cell>`
- C. `<grid>`, `<row>`, `<col>`
- D. `<table>`, `<thead>`, `<tbody>`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**表格的基本结构**

```html
<table>        <!-- 表格容器 -->
  <tr>         <!-- 表格行 (table row) -->
    <td>单元格</td>  <!-- 表格数据单元格 (table data) -->
    <td>单元格</td>
  </tr>
</table>
```

**完整的语义化表格：**

```html
<table>
  <caption>表格标题</caption>
  
  <thead>      <!-- 表头 -->
    <tr>
      <th>姓名</th>
      <th>年龄</th>
    </tr>
  </thead>
  
  <tbody>      <!-- 表格主体 -->
    <tr>
      <td>张三</td>
      <td>25</td>
    </tr>
  </tbody>
  
  <tfoot>      <!-- 表格页脚 -->
    <tr>
      <td>合计</td>
      <td>1人</td>
    </tr>
  </tfoot>
</table>
```

**元素说明：**
- `<table>`：表格容器
- `<tr>`：表格行（table row）
- `<td>`：数据单元格（table data）
- `<th>`：表头单元格（table header）
- `<thead>`：表头区域
- `<tbody>`：主体区域
- `<tfoot>`：页脚区域
- `<caption>`：表格标题

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 表头单元格

### 题目

`<th>` 和 `<td>` 的区别仅在于字体加粗。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**`<th>` vs `<td>` 的本质区别是语义，不仅仅是样式**

```html
<table>
  <thead>
    <tr>
      <!-- th：表头单元格，有语义 -->
      <th scope="col">姓名</th>
      <th scope="col">职位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <!-- td：数据单元格 -->
      <td>张三</td>
      <td>工程师</td>
    </tr>
  </tbody>
</table>
```

**主要区别：**

| 特性 | `<th>` | `<td>` |
|------|--------|--------|
| **语义** | 表头单元格 | 数据单元格 |
| **默认样式** | 加粗、居中 | 正常、左对齐 |
| **scope 属性** | 常用 | 不常用 |
| **可访问性** | 屏幕阅读器识别为表头 | 识别为数据 |

**可访问性示例：**

```html
<table>
  <tr>
    <!-- 列表头 -->
    <th scope="col">科目</th>
    <th scope="col">分数</th>
  </tr>
  <tr>
    <!-- 行表头 -->
    <th scope="row">数学</th>
    <td>95</td>
  </tr>
  <tr>
    <th scope="row">语文</th>
    <td>88</td>
  </tr>
</table>
```

**scope 属性：**
- `col`：列表头
- `row`：行表头
- `colgroup`：列组表头
- `rowgroup`：行组表头

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 表格标题

### 题目

如何为表格添加标题？

**选项：**
- A. `<title>` 标签
- B. `<caption>` 标签
- C. `<h1>` 标签
- D. `<label>` 标签

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**使用 `<caption>` 为表格添加标题**

```html
<table>
  <caption>2024年销售数据统计表</caption>
  <thead>
    <tr>
      <th>月份</th>
      <th>销售额</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1月</td>
      <td>50万</td>
    </tr>
  </tbody>
</table>
```

**caption 的特点：**
- 必须是 `<table>` 的第一个子元素
- 默认在表格上方居中显示
- 对可访问性很重要

**样式控制：**

```css
caption {
  caption-side: top;    /* 默认：上方 */
  caption-side: bottom; /* 底部 */
  text-align: left;     /* 左对齐 */
  font-weight: bold;
  margin-bottom: 0.5rem;
}
```

**完整示例：**

```html
<table>
  <caption>
    员工信息表
    <span class="caption-desc">（截至2024年1月）</span>
  </caption>
  <thead>
    <tr>
      <th>工号</th>
      <th>姓名</th>
      <th>部门</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>001</td>
      <td>张三</td>
      <td>技术部</td>
    </tr>
  </tbody>
</table>
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 单元格合并

### 题目

关于单元格合并，以下说法正确的是？

**选项：**
- A. `colspan` 用于合并列
- B. `rowspan` 用于合并行
- C. 合并后的单元格会自动删除
- D. 合并单元格需要手动删除多余单元格

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, D

### 📖 解析

**单元格合并的两种方式**

**1. colspan - 跨列合并**

```html
<table border="1">
  <tr>
    <td colspan="2">合并两列</td>
    <!-- 注意：删除了一个 td -->
  </tr>
  <tr>
    <td>单元格1</td>
    <td>单元格2</td>
  </tr>
</table>
```

**2. rowspan - 跨行合并**

```html
<table border="1">
  <tr>
    <td rowspan="2">合并两行</td>
    <td>单元格1</td>
  </tr>
  <tr>
    <!-- 注意：第一列被上一行的 rowspan 占据 -->
    <td>单元格2</td>
  </tr>
</table>
```

**3. 同时使用 colspan 和 rowspan**

```html
<table border="1">
  <tr>
    <td colspan="2" rowspan="2">合并2列2行</td>
    <td>C1</td>
  </tr>
  <tr>
    <td>C2</td>
  </tr>
  <tr>
    <td>A3</td>
    <td>B3</td>
    <td>C3</td>
  </tr>
</table>
```

**复杂示例：课程表**

```html
<table border="1">
  <caption>课程表</caption>
  <thead>
    <tr>
      <th>时间</th>
      <th>周一</th>
      <th>周二</th>
      <th>周三</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>8:00-10:00</th>
      <td rowspan="2">数学<br>（连续两节）</td>
      <td>语文</td>
      <td>英语</td>
    </tr>
    <tr>
      <th>10:00-12:00</th>
      <!-- 第二列被 rowspan 占据 -->
      <td>物理</td>
      <td>化学</td>
    </tr>
    <tr>
      <th>14:00-16:00</th>
      <td colspan="3">体育（大课）</td>
      <!-- 删除了两个 td -->
    </tr>
  </tbody>
</table>
```

**注意事项：**
- 合并后需要手动删除多余的单元格
- 计算要准确，避免表格错位
- 使用 `border="1"` 调试时查看结构

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 列分组

### 题目

以下代码中 `<colgroup>` 的作用是什么？

```html
<table>
  <colgroup>
    <col style="background-color: #f0f0f0">
    <col span="2" style="background-color: #e0e0e0">
  </colgroup>
  <tr>
    <th>姓名</th>
    <th>数学</th>
    <th>语文</th>
  </tr>
</table>
```

**选项：**
- A. 为列添加样式
- B. 合并列
- C. 分组列数据
- D. 以上都不对

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**`<colgroup>` 和 `<col>` 用于为整列添加样式**

```html
<table border="1">
  <colgroup>
    <!-- 第一列：浅灰背景 -->
    <col style="background-color: #f0f0f0; width: 100px;">
    
    <!-- 第二、三列：浅蓝背景 -->
    <col span="2" style="background-color: #e3f2fd; width: 150px;">
  </colgroup>
  
  <thead>
    <tr>
      <th>姓名</th>
      <th>数学</th>
      <th>语文</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>张三</td>
      <td>95</td>
      <td>88</td>
    </tr>
    <tr>
      <td>李四</td>
      <td>87</td>
      <td>92</td>
    </tr>
  </tbody>
</table>
```

**使用场景：**

**1. 突出显示某些列**

```html
<colgroup>
  <col>  <!-- 普通列 -->
  <col class="highlight">  <!-- 高亮列 -->
  <col>
</colgroup>

<style>
.highlight {
  background-color: #fff3cd;
}
</style>
```

**2. 设置列宽**

```html
<colgroup>
  <col style="width: 20%;">
  <col style="width: 30%;">
  <col style="width: 50%;">
</colgroup>
```

**3. 分组相关列**

```html
<table>
  <colgroup>
    <col>  <!-- 姓名 -->
  </colgroup>
  <colgroup class="scores">
    <col span="3">  <!-- 三个科目成绩 -->
  </colgroup>
  <colgroup>
    <col>  <!-- 总分 -->
  </colgroup>
  
  <tr>
    <th>姓名</th>
    <th>数学</th>
    <th>语文</th>
    <th>英语</th>
    <th>总分</th>
  </tr>
</table>

<style>
.scores {
  background-color: #f5f5f5;
}
</style>
```

**注意事项：**
- `<colgroup>` 必须在 `<caption>` 之后，其他内容之前
- `<col>` 只能设置有限的样式（边框、背景、宽度、可见性）
- 现代开发中可以用 CSS 的 `:nth-child()` 代替

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 可访问性

### 题目

以下哪种方式可以提升表格的可访问性？

**选项：**
- A. 使用 `scope` 属性
- B. 使用 `headers` 属性
- C. 使用 `<caption>` 标签
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**表格可访问性的多种方法**

**1. scope 属性（简单表格）**

```html
<table>
  <caption>学生成绩表</caption>
  <thead>
    <tr>
      <th scope="col">姓名</th>
      <th scope="col">数学</th>
      <th scope="col">语文</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">张三</th>
      <td>95</td>
      <td>88</td>
    </tr>
  </tbody>
</table>
```

**2. headers 属性（复杂表格）**

```html
<table>
  <caption>销售数据</caption>
  <tr>
    <th id="month">月份</th>
    <th id="region">地区</th>
    <th id="sales">销售额</th>
  </tr>
  <tr>
    <th id="jan" headers="month">1月</th>
    <td headers="jan region">北京</td>
    <td headers="jan sales">100万</td>
  </tr>
</table>
```

**3. caption 标签**

```html
<table>
  <caption>
    2024年第一季度销售数据
    <span class="sr-only">（包含月份、地区、销售额三列）</span>
  </caption>
  <!-- 表格内容 -->
</table>
```

**4. 摘要（summary 已废弃，用 caption 或 aria-describedby）**

```html
<p id="table-desc">
  以下表格显示了2024年各地区的销售数据，包括销售额和同比增长率。
</p>

<table aria-describedby="table-desc">
  <caption>2024年销售数据</caption>
  <!-- 表格内容 -->
</table>
```

**完整可访问表格示例：**

```html
<table>
  <caption>
    <strong>员工考勤统计表</strong>
    <span class="caption-date">（2024年1月）</span>
  </caption>
  
  <thead>
    <tr>
      <th scope="col" id="name">姓名</th>
      <th scope="col" id="dept">部门</th>
      <th scope="col" id="days">出勤天数</th>
      <th scope="col" id="late">迟到次数</th>
    </tr>
  </thead>
  
  <tbody>
    <tr>
      <th scope="row" headers="name">张三</th>
      <td headers="dept">技术部</td>
      <td headers="days">22</td>
      <td headers="late">0</td>
    </tr>
    <tr>
      <th scope="row" headers="name">李四</th>
      <td headers="dept">市场部</td>
      <td headers="days">20</td>
      <td headers="late">2</td>
    </tr>
  </tbody>
  
  <tfoot>
    <tr>
      <th scope="row" colspan="2">合计</th>
      <td>42天</td>
      <td>2次</td>
    </tr>
  </tfoot>
</table>
```

**CSS 辅助：**

```css
/* 视觉隐藏但屏幕阅读器可读 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 响应式表格

### 题目

实现响应式表格的方法有哪些？

**选项：**
- A. 横向滚动
- B. 隐藏次要列
- C. 卡片布局
- D. 堆叠显示

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**响应式表格的多种实现方案**

**方案1：横向滚动（推荐）**

```html
<div class="table-wrapper">
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
</div>

<style>
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
}

table {
  min-width: 600px; /* 最小宽度 */
  width: 100%;
}
</style>
```

**方案2：隐藏次要列**

```html
<table>
  <thead>
    <tr>
      <th>姓名</th>
      <th class="optional">部门</th>
      <th>职位</th>
      <th class="optional">邮箱</th>
    </tr>
  </thead>
  <!-- tbody -->
</table>

<style>
@media (max-width: 768px) {
  .optional {
    display: none;
  }
}
</style>
```

**方案3：卡片布局**

```html
<div class="table-cards">
  <div class="card">
    <h3>张三</h3>
    <dl>
      <dt>部门：</dt><dd>技术部</dd>
      <dt>职位：</dt><dd>工程师</dd>
      <dt>邮箱：</dt><dd>zhangsan@example.com</dd>
    </dl>
  </div>
  <!-- 更多卡片 -->
</div>

<style>
@media (max-width: 768px) {
  table {
    display: none;
  }
  
  .table-cards {
    display: block;
  }
  
  .card {
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
  }
}
</style>
```

**方案4：堆叠显示（纯 CSS）**

```html
<table class="responsive-table">
  <thead>
    <tr>
      <th>姓名</th>
      <th>部门</th>
      <th>职位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-label="姓名">张三</td>
      <td data-label="部门">技术部</td>
      <td data-label="职位">工程师</td>
    </tr>
  </tbody>
</table>

<style>
@media (max-width: 768px) {
  .responsive-table thead {
    display: none;
  }
  
  .responsive-table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  
  .responsive-table td {
    display: block;
    text-align: right;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .responsive-table td:last-child {
    border-bottom: none;
  }
  
  .responsive-table td::before {
    content: attr(data-label);
    float: left;
    font-weight: bold;
  }
}
</style>
```

**方案5：优先级列（渐进显示）**

```css
@media (max-width: 480px) {
  .priority-3,
  .priority-4,
  .priority-5 {
    display: none;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .priority-4,
  .priority-5 {
    display: none;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .priority-5 {
    display: none;
  }
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码补全题  
**标签：** 复杂表格

### 题目

创建一个包含多层表头的复杂表格，显示各地区不同季度的销售数据。

<details>
<summary>查看答案</summary>

### ✅ 正确答案

```html
<table border="1">
  <caption>2024年销售数据统计表</caption>
  
  <thead>
    <tr>
      <!-- 行表头占 2 行 -->
      <th rowspan="2">地区</th>
      
      <!-- 第一季度占 3 列 -->
      <th colspan="3">第一季度</th>
      
      <!-- 第二季度占 3 列 -->
      <th colspan="3">第二季度</th>
      
      <!-- 合计占 2 行 -->
      <th rowspan="2">合计</th>
    </tr>
    
    <tr>
      <!-- 第一季度子列 -->
      <th>1月</th>
      <th>2月</th>
      <th>3月</th>
      
      <!-- 第二季度子列 -->
      <th>4月</th>
      <th>5月</th>
      <th>6月</th>
    </tr>
  </thead>
  
  <tbody>
    <tr>
      <th scope="row">北京</th>
      <td>100</td>
      <td>120</td>
      <td>110</td>
      <td>130</td>
      <td>140</td>
      <td>125</td>
      <td>725</td>
    </tr>
    <tr>
      <th scope="row">上海</th>
      <td>90</td>
      <td>95</td>
      <td>100</td>
      <td>105</td>
      <td>110</td>
      <td>115</td>
      <td>615</td>
    </tr>
  </tbody>
  
  <tfoot>
    <tr>
      <th scope="row">总计</th>
      <td>190</td>
      <td>215</td>
      <td>210</td>
      <td>235</td>
      <td>250</td>
      <td>240</td>
      <td>1340</td>
    </tr>
  </tfoot>
</table>
```

### 📖 解析

**多层表头的关键点：**

**1. 使用 colspan 和 rowspan 组合**

```html
<!-- 跨 3 列的表头 -->
<th colspan="3">第一季度</th>

<!-- 跨 2 行的表头 -->
<th rowspan="2">地区</th>

<!-- 同时跨行跨列 -->
<th colspan="2" rowspan="2">总计</th>
```

**2. 计算要准确**

```
第一行：
- 地区 (rowspan=2)：占 1 列 2 行
- Q1 (colspan=3)：占 3 列 1 行
- Q2 (colspan=3)：占 3 列 1 行
- 合计 (rowspan=2)：占 1 列 2 行
总计：8 列

第二行：
- （地区占据）
- 1月、2月、3月：各占 1 列
- 4月、5月、6月：各占 1 列
- （合计占据）
总计：8 列（与第一行对齐）
```

**3. 添加样式**

```css
table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

thead th {
  background-color: #4CAF50;
  color: white;
}

tbody th {
  background-color: #f2f2f2;
  text-align: left;
}

tfoot {
  background-color: #e8e8e8;
  font-weight: bold;
}
```

**完整的可访问版本：**

```html
<table>
  <caption>
    2024年上半年各地区销售数据统计
    <span class="sr-only">（包含北京、上海两个地区，第一、第二季度每月销售额及合计）</span>
  </caption>
  
  <thead>
    <tr>
      <th scope="col" rowspan="2" id="region">地区</th>
      <th scope="colgroup" colspan="3" id="q1">第一季度</th>
      <th scope="colgroup" colspan="3" id="q2">第二季度</th>
      <th scope="col" rowspan="2" id="total">合计</th>
    </tr>
    <tr>
      <th scope="col" headers="q1">1月</th>
      <th scope="col" headers="q1">2月</th>
      <th scope="col" headers="q1">3月</th>
      <th scope="col" headers="q2">4月</th>
      <th scope="col" headers="q2">5月</th>
      <th scope="col" headers="q2">6月</th>
    </tr>
  </thead>
  
  <tbody>
    <tr>
      <th scope="row" headers="region">北京</th>
      <td headers="q1">100</td>
      <td headers="q1">120</td>
      <td headers="q1">110</td>
      <td headers="q2">130</td>
      <td headers="q2">140</td>
      <td headers="q2">125</td>
      <td headers="total">725</td>
    </tr>
  </tbody>
  
  <tfoot>
    <tr>
      <th scope="row">总计</th>
      <td>190</td>
      <td>215</td>
      <td>210</td>
      <td>235</td>
      <td>250</td>
      <td>240</td>
      <td>1340</td>
    </tr>
  </tfoot>
</table>
```

</details>

---

## 第 9 题 🔴

**类型：** 多选题  
**标签：** 表格样式

### 题目

关于表格样式，以下说法正确的是？

**选项：**
- A. `border-collapse: collapse` 合并边框
- B. `border-spacing` 在 collapse 模式下无效
- C. `vertical-align` 可以控制单元格内容垂直对齐
- D. `text-align` 可以控制单元格内容水平对齐

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**表格样式完全解析（全部正确）**

**1. border-collapse（A 正确）**

```css
table {
  /* 分离边框（默认） */
  border-collapse: separate;
  
  /* 合并边框 */
  border-collapse: collapse;
}
```

```html
<!-- separate：双边框 -->
<table style="border-collapse: separate; border: 1px solid #000;">
  <tr>
    <td style="border: 1px solid #000;">单元格</td>
  </tr>
</table>

<!-- collapse：单边框 -->
<table style="border-collapse: collapse; border: 1px solid #000;">
  <tr>
    <td style="border: 1px solid #000;">单元格</td>
  </tr>
</table>
```

**2. border-spacing（B 正确）**

```css
table {
  border-collapse: separate;
  border-spacing: 10px;  /* 有效 */
  border-spacing: 10px 5px;  /* 水平 10px，垂直 5px */
}

table {
  border-collapse: collapse;
  border-spacing: 10px;  /* 无效！ */
}
```

**3. vertical-align（C 正确）**

```css
td {
  vertical-align: top;     /* 顶部对齐 */
  vertical-align: middle;  /* 中间对齐（默认） */
  vertical-align: bottom;  /* 底部对齐 */
}
```

```html
<table>
  <tr style="height: 100px;">
    <td style="vertical-align: top;">顶部</td>
    <td style="vertical-align: middle;">中间</td>
    <td style="vertical-align: bottom;">底部</td>
  </tr>
</table>
```

**4. text-align（D 正确）**

```css
th {
  text-align: center;  /* 表头居中（默认） */
}

td {
  text-align: left;    /* 数据左对齐（默认） */
  text-align: right;   /* 右对齐（数字推荐） */
  text-align: center;  /* 居中 */
}
```

**完整样式示例：**

```css
/* 基础样式 */
table {
  border-collapse: collapse;
  width: 100%;
  font-family: Arial, sans-serif;
}

/* 边框 */
th, td {
  border: 1px solid #ddd;
  padding: 12px;
}

/* 表头 */
thead th {
  background-color: #4CAF50;
  color: white;
  text-align: left;
  font-weight: bold;
}

/* 数据行 */
tbody tr:nth-child(even) {
  background-color: #f2f2f2;
}

tbody tr:hover {
  background-color: #ddd;
}

/* 对齐 */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* 数字列右对齐 */
.number {
  text-align: right;
  font-family: 'Courier New', monospace;
}

/* 页脚 */
tfoot {
  background-color: #e8e8e8;
  font-weight: bold;
}

/* 响应式 */
@media (max-width: 768px) {
  table {
    font-size: 14px;
  }
  
  th, td {
    padding: 8px;
  }
}
```

**高级样式：**

```css
/* 条纹表格 */
tbody tr:nth-child(odd) {
  background-color: #fff;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* 悬停效果 */
tbody tr:hover {
  background-color: #f5f5f5;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 固定表头 */
thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #4CAF50;
}

/* 表格阴影 */
table {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}
```

</details>

---

## 第 10 题 🔴

**类型：** 综合分析题  
**标签：** 最佳实践

### 题目

对比以下两种表格实现方式，说明哪种更好，为什么？

```html
<!-- 方式 A -->
<table>
  <tr>
    <td><b>姓名</b></td>
    <td><b>年龄</b></td>
  </tr>
  <tr>
    <td>张三</td>
    <td>25</td>
  </tr>
</table>

<!-- 方式 B -->
<table>
  <caption>员工信息</caption>
  <thead>
    <tr>
      <th scope="col">姓名</th>
      <th scope="col">年龄</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>张三</td>
      <td>25</td>
    </tr>
  </tbody>
</table>
```

<details>
<summary>查看答案</summary>

### 📖 解析

**方式 B 明显更优**

**对比分析：**

| 特性 | 方式 A | 方式 B |
|------|-------|-------|
| **语义化** | ❌ 无 | ✅ 清晰 |
| **可访问性** | ❌ 差 | ✅ 好 |
| **SEO** | ❌ 无帮助 | ✅ 有帮助 |
| **样式控制** | ❌ 困难 | ✅ 容易 |
| **维护性** | ❌ 差 | ✅ 好 |

**1. 语义化**

```html
<!-- 方式 A：无语义 -->
<td><b>姓名</b></td>  <!-- 只是加粗的单元格 -->

<!-- 方式 B：有语义 -->
<th scope="col">姓名</th>  <!-- 明确是列表头 -->
```

**2. 可访问性**

```
方式 A 屏幕阅读器读取：
"单元格：姓名，单元格：年龄，单元格：张三，单元格：25"

方式 B 屏幕阅读器读取：
"表格：员工信息
表头：姓名，表头：年龄
行1：姓名 张三，年龄 25"
```

**3. 样式控制**

```css
/* 方式 A：需要特殊处理 */
table tr:first-child td {
  font-weight: bold;
  background-color: #f0f0f0;
}

/* 方式 B：直接使用语义 */
thead th {
  font-weight: bold;
  background-color: #4CAF50;
  color: white;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
```

**最佳实践完整示例：**

```html
<table>
  <!-- 1. 添加标题 -->
  <caption>
    <strong>2024年员工信息统计表</strong>
    <span class="caption-date">（截至1月15日）</span>
  </caption>
  
  <!-- 2. 列样式 -->
  <colgroup>
    <col style="width: 30%;">
    <col style="width: 20%;">
    <col style="width: 30%;">
    <col style="width: 20%;">
  </colgroup>
  
  <!-- 3. 表头 -->
  <thead>
    <tr>
      <th scope="col">姓名</th>
      <th scope="col">年龄</th>
      <th scope="col">部门</th>
      <th scope="col">职位</th>
    </tr>
  </thead>
  
  <!-- 4. 表体 -->
  <tbody>
    <tr>
      <th scope="row">张三</th>
      <td>25</td>
      <td>技术部</td>
      <td>工程师</td>
    </tr>
    <tr>
      <th scope="row">李四</th>
      <td>28</td>
      <td>市场部</td>
      <td>经理</td>
    </tr>
  </tbody>
  
  <!-- 5. 页脚 -->
  <tfoot>
    <tr>
      <th scope="row" colspan="2">合计</th>
      <td colspan="2">2人</td>
    </tr>
  </tfoot>
</table>

<style>
/* 基础样式 */
table {
  border-collapse: collapse;
  width: 100%;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 标题 */
caption {
  caption-side: top;
  padding: 10px;
  font-size: 1.2em;
  text-align: left;
}

.caption-date {
  font-size: 0.9em;
  color: #666;
}

/* 单元格 */
th, td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

/* 表头 */
thead th {
  background-color: #4CAF50;
  color: white;
}

/* 行表头 */
tbody th {
  background-color: #f2f2f2;
  font-weight: normal;
}

/* 条纹 */
tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* 悬停 */
tbody tr:hover {
  background-color: #e8f5e9;
}

/* 页脚 */
tfoot {
  background-color: #e8e8e8;
  font-weight: bold;
}

/* 响应式 */
@media (max-width: 768px) {
  table {
    font-size: 14px;
  }
  
  th, td {
    padding: 8px;
  }
}
</style>
```

**避免的错误：**
- ❌ 使用表格布局页面
- ❌ 不使用 `<thead>`, `<tbody>`, `<tfoot>`
- ❌ 表头使用 `<td>` 而非 `<th>`
- ❌ 缺少 `scope` 或 `headers` 属性
- ❌ 缺少 `<caption>` 标题
- ❌ 过度合并单元格导致混乱

</details>

---

**📌 本章总结**

- 表格基本结构：`<table>`, `<tr>`, `<td>`, `<th>`
- 语义化结构：`<thead>`, `<tbody>`, `<tfoot>`, `<caption>`
- 单元格合并：`colspan`（列）和 `rowspan`（行）
- 可访问性：`scope`, `headers` 属性
- 列样式：`<colgroup>` 和 `<col>`
- 响应式：横向滚动、隐藏列、卡片布局、堆叠
- 样式：`border-collapse`, `border-spacing`, 对齐方式
- 最佳实践：语义化、可访问性、避免布局用表格

**上一章** ← [第 11 章：iframe 与嵌入](./chapter-11.md)  
**下一章** → [第 13 章：表单基础](./chapter-13.md)
