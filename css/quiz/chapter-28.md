# 第 28 章：Container Queries 容器查询 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 容器查询基础

### 题目

Container Queries 的优势是？

**选项：**
- A. 基于视口响应
- B. 基于容器尺寸响应
- C. 提高性能
- D. 减少代码

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Container Queries 容器查询**

```css
.container {
  container-type: inline-size;
}

.card {
  /* 基于容器宽度响应 */
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

**对比媒体查询：**

**媒体查询（视口）：**
```css
@media (min-width: 768px) {
  .card { /* 基于视口 */ }
}
```

**容器查询（容器）：**
```css
@container (min-width: 400px) {
  .card { /* 基于容器 */ }
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** container-type

### 题目

`container-type` 的有效值有哪些？

**选项：**
- A. width, height
- B. inline-size, block-size, size
- C. normal, size
- D. auto, manual

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**container-type 属性值**

```css
/* 内联尺寸（通常是宽度）*/
container-type: inline-size;

/* 块尺寸（通常是高度）*/
container-type: block-size;

/* 两个方向 */
container-type: size;

/* 正常，不创建容器 */
container-type: normal;
```

**推荐用法：**
```css
.container {
  container-type: inline-size;
  /* 最常用，查询宽度 */
}
```

**注意事项：**
- `size` 会阻止内容撑开容器
- 需要明确设置容器尺寸

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 容器命名

### 题目

容器可以命名以便精确查询。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**container-name 命名容器**

```css
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

.main {
  container-type: inline-size;
  container-name: main;
}

/* 查询特定容器 */
@container sidebar (min-width: 300px) {
  .widget {
    /* 只在 sidebar 容器中应用 */
  }
}

@container main (min-width: 600px) {
  .article {
    /* 只在 main 容器中应用 */
  }
}
```

**简写语法：**
```css
/* 分开写 */
container-type: inline-size;
container-name: sidebar;

/* 简写 */
container: sidebar / inline-size;
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 容器查询单位

### 题目

容器查询单位包括？

**选项：**
- A. `cqw` - 容器宽度
- B. `cqh` - 容器高度
- C. `cqi` - 容器内联尺寸
- D. `cqb` - 容器块尺寸

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**容器查询单位（全部正确）**

**✅ 物理单位：**
```css
.card {
  font-size: 5cqw;   /* 容器宽度的5% */
  padding: 2cqh;     /* 容器高度的2% */
  margin: 1cqmin;    /* min(cqw, cqh) */
  gap: 2cqmax;       /* max(cqw, cqh) */
}
```

**✅ 逻辑单位：**
```css
.card {
  font-size: 3cqi;   /* 容器内联尺寸的3% */
  padding: 2cqb;     /* 容器块尺寸的2% */
}
```

**实用示例：**
```css
.container {
  container-type: inline-size;
}

.card-title {
  font-size: clamp(1rem, 5cqw, 2rem);
  /* 响应容器宽度 */
}
```

**对比表：**

| 单位 | 参考对象 | 示例 |
|------|---------|------|
| vw/vh | 视口 | `5vw` |
| cqw/cqh | 容器 | `5cqw` |
| % | 父元素 | `50%` |
| rem | 根元素字体 | `2rem` |

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 响应式组件

### 题目

如何创建响应式卡片组件？

**选项：**
- A. 使用媒体查询
- B. 使用容器查询
- C. 使用 JavaScript
- D. B 更好

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**容器查询实现响应式组件**

```html
<div class="grid">
  <div class="card-container">
    <div class="card">Card 1</div>
  </div>
  <div class="card-container">
    <div class="card">Card 2</div>
  </div>
</div>
```

**❌ 媒体查询（基于视口）：**
```css
.card {
  /* 所有卡片同时响应 */
}

@media (min-width: 768px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

**✅ 容器查询（基于容器）：**
```css
.card-container {
  container-type: inline-size;
}

.card {
  padding: 1rem;
}

/* 容器宽度 ≥ 400px */
@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2cqw;
  }
}

/* 容器宽度 ≥ 600px */
@container (min-width: 600px) {
  .card {
    grid-template-columns: 1fr 3fr;
  }
}
```

**优势：**
- 每个卡片独立响应
- 真正的组件化
- 可复用性更强

**完整示例：**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card-container {
  container: card / inline-size;
}

.card {
  background: white;
  border-radius: 8px;
}

/* 紧凑布局 */
@container card (max-width: 399px) {
  .card {
    padding: 1rem;
  }
  
  .card-image {
    width: 100%;
  }
  
  .card-title {
    font-size: 4cqw;
  }
}

/* 标准布局 */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
    padding: 1.5rem;
  }
  
  .card-title {
    font-size: 3cqw;
  }
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 样式查询

### 题目

CSS 样式查询（Style Queries）可以查询什么？

**选项：**
- A. 容器的尺寸
- B. 容器的 CSS 自定义属性
- C. 容器的颜色
- D. 容器的字体

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**样式查询（实验性）**

```css
.container {
  --theme: dark;
}

/* 查询自定义属性 */
@container style(--theme: dark) {
  .card {
    background: #333;
    color: white;
  }
}

@container style(--theme: light) {
  .card {
    background: white;
    color: #333;
  }
}
```

**实用场景：**

**主题切换：**
```css
.theme-container {
  --mode: light;
}

.theme-container.dark {
  --mode: dark;
}

@container style(--mode: dark) {
  .component {
    /* 暗色主题样式 */
  }
}
```

**状态查询：**
```css
.card {
  --state: normal;
}

.card.active {
  --state: active;
}

@container style(--state: active) {
  .card-content {
    /* 激活状态样式 */
  }
}
```

**浏览器支持：**
- 实验性特性
- Chrome 111+ (flag)
- 需要开启实验性功能

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 嵌套容器

### 题目

容器查询可以嵌套吗？

**选项：**
- A. 不可以
- B. 可以，每层独立查询
- C. 需要特殊配置
- D. 只能嵌套一层

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**嵌套容器查询**

```html
<div class="page-container">
  <div class="sidebar-container">
    <div class="widget">Widget</div>
  </div>
</div>
```

```css
/* 外层容器 */
.page-container {
  container: page / inline-size;
}

/* 内层容器 */
.sidebar-container {
  container: sidebar / inline-size;
}

/* 查询外层 */
@container page (min-width: 1024px) {
  .sidebar-container {
    width: 300px;
  }
}

/* 查询内层 */
@container sidebar (min-width: 250px) {
  .widget {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

**查询最近的容器：**
```css
/* 不指定名称，查询最近的容器 */
@container (min-width: 400px) {
  .card {
    /* 应用于最近的容器 */
  }
}
```

**组合查询：**
```css
@container page (min-width: 800px) {
  @container sidebar (min-width: 200px) {
    .widget {
      /* 两个条件都满足时应用 */
    }
  }
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 性能优化

### 题目

容器查询的性能考虑？

**选项：**
- A. 比媒体查询慢
- B. 性能相近
- C. 避免过深嵌套
- D. B 和 C

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**容器查询性能**

**✅ B. 性能相近**
- 现代浏览器优化良好
- 不会显著影响性能

**✅ C. 避免过深嵌套**
```css
/* ❌ 过深嵌套 */
.a { container-type: inline-size; }
  .b { container-type: inline-size; }
    .c { container-type: inline-size; }
      .d { container-type: inline-size; }

/* ✅ 合理层级 */
.page { container-type: inline-size; }
.section { container-type: inline-size; }
```

**优化建议：**

**1. 明确容器：**
```css
/* ✅ 只在需要的地方创建容器 */
.card-wrapper {
  container-type: inline-size;
}

/* ❌ 避免到处都是容器 */
div {
  container-type: inline-size;  /* 过度使用 */
}
```

**2. 使用 inline-size：**
```css
/* ✅ 推荐：只查询宽度 */
container-type: inline-size;

/* ⚠️ 谨慎：查询两个方向 */
container-type: size;
/* 会阻止内容撑开 */
```

**3. 合理命名：**
```css
.sidebar {
  container: sidebar / inline-size;
}

@container sidebar (min-width: 300px) {
  /* 明确指定，减少查找 */
}
```

**4. 避免循环依赖：**
```css
/* ❌ 可能导致问题 */
.container {
  container-type: inline-size;
  width: 50cqw;  /* 依赖自身 */
}
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 降级方案

### 题目

如何为不支持容器查询的浏览器提供降级？

**选项：**
- A. 使用 @supports
- B. 使用媒体查询作为降级
- C. 使用 JavaScript 检测
- D. A 和 B

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**容器查询降级策略**

**✅ A. @supports 检测**
```css
/* 降级：媒体查询 */
@media (min-width: 768px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}

/* 渐进增强：容器查询 */
@supports (container-type: inline-size) {
  .card-container {
    container-type: inline-size;
  }
  
  @container (min-width: 400px) {
    .card {
      display: grid;
      grid-template-columns: 1fr 2fr;
    }
  }
}
```

**✅ B. 媒体查询降级**
```css
/* 基础样式 */
.card {
  padding: 1rem;
}

/* 降级：媒体查询 */
@media (min-width: 600px) {
  .card {
    display: flex;
  }
}

/* 增强：容器查询（覆盖） */
@container (min-width: 400px) {
  .card {
    display: grid;
  }
}
```

**完整降级方案：**

```css
/* 1. 移动端基础样式 */
.card {
  display: block;
  padding: 1rem;
}

.card-image {
  width: 100%;
}

/* 2. 媒体查询降级 */
@media (min-width: 768px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}

/* 3. 容器查询增强 */
@supports (container-type: inline-size) {
  .card-container {
    container-type: inline-size;
  }
  
  /* 重置媒体查询 */
  .card {
    display: block;
  }
  
  /* 应用容器查询 */
  @container (min-width: 400px) {
    .card {
      display: grid;
      grid-template-columns: 150px 1fr;
    }
  }
  
  @container (min-width: 600px) {
    .card {
      grid-template-columns: 200px 1fr;
    }
  }
}
```

**JavaScript 检测：**
```javascript
if ('container' in document.documentElement.style) {
  document.body.classList.add('container-queries-supported');
}
```

```css
.card {
  /* 默认样式 */
}

.container-queries-supported .card {
  /* 支持容器查询的样式 */
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 最佳实践

### 题目

容器查询的最佳实践有？

**选项：**
- A. 组件化设计
- B. 使用语义化容器名称
- C. 优先使用 inline-size
- D. 替代所有媒体查询

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**容器查询最佳实践**

**✅ A. 组件化设计**
```css
/* 每个组件定义自己的响应式行为 */
.card-container {
  container: card / inline-size;
}

@container card (min-width: 400px) {
  .card {
    /* 组件内部响应 */
  }
}
```

**✅ B. 语义化命名**
```css
/* ✅ 清晰的命名 */
container: sidebar / inline-size;
container: main-content / inline-size;
container: product-card / inline-size;

/* ❌ 模糊的命名 */
container: c1 / inline-size;
container: box / inline-size;
```

**✅ C. 优先 inline-size**
```css
/* ✅ 推荐：查询宽度 */
container-type: inline-size;

/* ⚠️ 谨慎：size 会影响布局 */
container-type: size;
```

**❌ D. 不替代所有媒体查询**
```css
/* 媒体查询：页面级布局 */
@media (min-width: 1024px) {
  .page-layout {
    display: grid;
    grid-template-columns: 250px 1fr 250px;
  }
}

/* 容器查询：组件级响应 */
@container (min-width: 400px) {
  .card {
    /* 组件响应 */
  }
}
```

**组合使用示例：**
```css
/* 页面布局：媒体查询 */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 组件响应：容器查询 */
.card-wrapper {
  container: card / inline-size;
}

@container card (min-width: 300px) {
  .card {
    display: flex;
  }
}

@container card (min-width: 500px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

**完整工作流：**

1. **设计组件响应式行为**
2. **创建容器**
3. **定义查询断点**
4. **使用容器单位**
5. **提供降级方案**

</details>

---

**导航**  
[上一章：第 27 章 - 响应式布局单位](./chapter-27.md) | [返回目录](../README.md) | [下一章：第 29 章 - 现代布局技巧](./chapter-29.md)
