# 第 21 章：微数据

## 概述

微数据（Microdata）是 HTML5 的一项特性，通过添加特定属性来标记结构化数据，帮助搜索引擎更好地理解网页内容。

## 一、微数据基础

### 1.1 什么是微数据

```html
<!-- 无微数据 -->
<div>
  <h1>张三</h1>
  <p>前端工程师</p>
  <p>邮箱：zhangsan@example.com</p>
</div>

<!-- 有微数据 -->
<div itemscope itemtype="http://schema.org/Person">
  <h1 itemprop="name">张三</h1>
  <p itemprop="jobTitle">前端工程师</p>
  <p>邮箱：<span itemprop="email">zhangsan@example.com</span></p>
</div>
```

### 1.2 核心属性

| 属性 | 说明 |
|-----|------|
| `itemscope` | 定义数据项的作用域 |
| `itemtype` | 指定数据项的类型（Schema.org） |
| `itemprop` | 定义属性名 |
| `itemid` | 指定唯一标识符 |
| `itemref` | 引用其他元素 |

## 二、Schema.org 词汇表

### 2.1 Person（人物）

```html
<div itemscope itemtype="http://schema.org/Person">
  <img itemprop="image" src="photo.jpg" alt="头像">
  <h1 itemprop="name">张三</h1>
  
  <p itemprop="jobTitle">高级前端工程师</p>
  
  <p>
    <span itemprop="affiliation">某科技公司</span>
  </p>
  
  <p>
    邮箱：<a itemprop="email" href="mailto:zhangsan@example.com">zhangsan@example.com</a>
  </p>
  
  <p>
    网站：<a itemprop="url" href="https://zhangsan.com">https://zhangsan.com</a>
  </p>
  
  <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
    <span itemprop="addressLocality">北京</span>,
    <span itemprop="addressRegion">朝阳区</span>
  </div>
</div>
```

### 2.2 Article（文章）

```html
<article itemscope itemtype="http://schema.org/Article">
  <header>
    <h1 itemprop="headline">深入理解 JavaScript 闭包</h1>
    
    <p>
      作者：
      <span itemprop="author" itemscope itemtype="http://schema.org/Person">
        <span itemprop="name">张三</span>
      </span>
    </p>
    
    <p>
      发布时间：
      <time itemprop="datePublished" datetime="2024-01-15">
        2024年1月15日
      </time>
    </p>
    
    <p>
      更新时间：
      <time itemprop="dateModified" datetime="2024-01-20">
        2024年1月20日
      </time>
    </p>
  </header>
  
  <div itemprop="articleBody">
    <p>闭包是 JavaScript 的核心概念...</p>
  </div>
  
  <footer>
    <p>
      标签：
      <span itemprop="keywords">JavaScript, 闭包, 前端</span>
    </p>
  </footer>
</article>
```

### 2.3 Product（产品）

```html
<div itemscope itemtype="http://schema.org/Product">
  <img itemprop="image" src="iphone.jpg" alt="产品图片">
  
  <h1 itemprop="name">iPhone 15 Pro Max</h1>
  
  <p itemprop="description">
    最新款 iPhone，搭载 A17 Pro 芯片，钛金属设计。
  </p>
  
  <div itemprop="brand" itemscope itemtype="http://schema.org/Brand">
    <span itemprop="name">Apple</span>
  </div>
  
  <div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
    <span itemprop="price">9999</span>
    <span itemprop="priceCurrency">CNY</span>
    
    <link itemprop="availability" href="http://schema.org/InStock">
    库存状态：有货
  </div>
  
  <div itemprop="aggregateRating" itemscope itemtype="http://schema.org/AggregateRating">
    评分：<span itemprop="ratingValue">4.8</span>/5
    (<span itemprop="reviewCount">1234</span> 条评价)
  </div>
</div>
```

### 2.4 Recipe（食谱）

```html
<div itemscope itemtype="http://schema.org/Recipe">
  <h1 itemprop="name">宫保鸡丁</h1>
  
  <img itemprop="image" src="kungpao.jpg" alt="成品图">
  
  <p itemprop="description">经典川菜，香辣可口</p>
  
  <p>
    作者：
    <span itemprop="author">美食家张三</span>
  </p>
  
  <p>
    准备时间：<time itemprop="prepTime" datetime="PT15M">15分钟</time>
  </p>
  
  <p>
    烹饪时间：<time itemprop="cookTime" datetime="PT20M">20分钟</time>
  </p>
  
  <p>
    总时间：<time itemprop="totalTime" datetime="PT35M">35分钟</time>
  </p>
  
  <p>
    份量：<span itemprop="recipeYield">4人份</span>
  </p>
  
  <div>
    <h2>食材</h2>
    <ul>
      <li itemprop="recipeIngredient">鸡胸肉 300g</li>
      <li itemprop="recipeIngredient">花生米 100g</li>
      <li itemprop="recipeIngredient">干辣椒 10个</li>
    </ul>
  </div>
  
  <div itemprop="recipeInstructions" itemscope itemtype="http://schema.org/HowToSection">
    <h2>步骤</h2>
    <ol>
      <li itemprop="text">鸡肉切丁，腌制15分钟</li>
      <li itemprop="text">热油炒花生米至金黄</li>
      <li itemprop="text">炒鸡丁至变色</li>
      <li itemprop="text">加入调料翻炒均匀</li>
    </ol>
  </div>
</div>
```

### 2.5 Event（事件）

```html
<div itemscope itemtype="http://schema.org/Event">
  <h1 itemprop="name">2024前端技术大会</h1>
  
  <p itemprop="description">
    聚焦最新前端技术趋势，邀请业界专家分享经验
  </p>
  
  <div itemprop="location" itemscope itemtype="http://schema.org/Place">
    <span itemprop="name">北京国际会议中心</span>
    <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
      <span itemprop="addressLocality">北京</span>
      <span itemprop="streetAddress">朝阳区某某路123号</span>
    </div>
  </div>
  
  <p>
    开始时间：
    <time itemprop="startDate" datetime="2024-06-15T09:00">
      2024年6月15日 09:00
    </time>
  </p>
  
  <p>
    结束时间：
    <time itemprop="endDate" datetime="2024-06-15T18:00">
      2024年6月15日 18:00
    </time>
  </p>
  
  <div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
    <span itemprop="price">299</span>
    <span itemprop="priceCurrency">CNY</span>
    <link itemprop="availability" href="http://schema.org/InStock">
  </div>
</div>
```

## 三、嵌套数据

### 3.1 嵌套示例

```html
<div itemscope itemtype="http://schema.org/Organization">
  <h1 itemprop="name">某科技公司</h1>
  
  <!-- 嵌套地址 -->
  <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
    <p>
      <span itemprop="streetAddress">中关村大街1号</span>,
      <span itemprop="addressLocality">北京</span>,
      <span itemprop="postalCode">100000</span>
    </p>
  </div>
  
  <!-- 嵌套联系人 -->
  <div itemprop="employee" itemscope itemtype="http://schema.org/Person">
    <p>CEO：<span itemprop="name">张三</span></p>
    <p>邮箱：<span itemprop="email">ceo@example.com</span></p>
  </div>
</div>
```

## 四、itemref 引用

### 4.1 引用其他元素

```html
<div itemscope itemtype="http://schema.org/Person" itemref="contact">
  <h1 itemprop="name">张三</h1>
  <p itemprop="jobTitle">工程师</p>
</div>

<!-- 在其他位置定义的联系方式 -->
<div id="contact">
  <p itemprop="email">zhangsan@example.com</p>
  <p itemprop="telephone">138-0013-8000</p>
</div>
```

## 五、测试工具

### 5.1 Google 结构化数据测试工具

访问：https://search.google.com/test/rich-results

```html
<!-- 测试示例 -->
<div itemscope itemtype="http://schema.org/Article">
  <h1 itemprop="headline">文章标题</h1>
  <img itemprop="image" src="image.jpg" alt="图片">
  <p itemprop="author" itemscope itemtype="http://schema.org/Person">
    <span itemprop="name">张三</span>
  </p>
  <time itemprop="datePublished" datetime="2024-01-15">2024-01-15</time>
</div>
```

### 5.2 Schema.org 验证器

使用浏览器开发者工具验证微数据：

```javascript
// 提取微数据
function extractMicrodata() {
  const items = document.querySelectorAll('[itemscope]');
  const data = [];
  
  items.forEach(item => {
    const type = item.getAttribute('itemtype');
    const props = {};
    
    item.querySelectorAll('[itemprop]').forEach(prop => {
      const name = prop.getAttribute('itemprop');
      const value = prop.textContent || prop.getAttribute('content');
      props[name] = value;
    });
    
    data.push({ type, props });
  });
  
  console.log(JSON.stringify(data, null, 2));
}

extractMicrodata();
```

## 六、微数据 vs JSON-LD

### 6.1 微数据

```html
<div itemscope itemtype="http://schema.org/Person">
  <span itemprop="name">张三</span>
  <span itemprop="jobTitle">工程师</span>
</div>
```

### 6.2 JSON-LD（推荐）

```html
<script type="application/ld+json">
{
  "@context": "http://schema.org",
  "@type": "Person",
  "name": "张三",
  "jobTitle": "工程师"
}
</script>
```

**JSON-LD 优势：**
- ✅ 代码分离，不影响 HTML 结构
- ✅ 更易维护
- ✅ Google 推荐

## 七、实战示例

### 7.1 博客文章

```html
<article itemscope itemtype="http://schema.org/BlogPosting">
  <header>
    <h1 itemprop="headline">深入理解闭包</h1>
    
    <div itemprop="author" itemscope itemtype="http://schema.org/Person">
      <img itemprop="image" src="avatar.jpg" alt="作者头像">
      <span itemprop="name">张三</span>
    </div>
    
    <time itemprop="datePublished" datetime="2024-01-15">
      2024年1月15日
    </time>
  </header>
  
  <div itemprop="articleBody">
    <p>闭包是JavaScript的核心概念...</p>
  </div>
  
  <footer>
    <div itemprop="publisher" itemscope itemtype="http://schema.org/Organization">
      <span itemprop="name">技术博客</span>
      <link itemprop="logo" href="logo.png">
    </div>
  </footer>
</article>
```

### 7.2 电商产品

```html
<div itemscope itemtype="http://schema.org/Product">
  <h1 itemprop="name">MacBook Pro 14"</h1>
  
  <div itemprop="brand" itemscope itemtype="http://schema.org/Brand">
    <span itemprop="name">Apple</span>
  </div>
  
  <img itemprop="image" src="macbook.jpg" alt="MacBook Pro">
  
  <p itemprop="description">
    M3 Pro 芯片，18GB 内存，512GB 存储
  </p>
  
  <div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
    <span itemprop="price">14999</span>
    <span itemprop="priceCurrency">CNY</span>
    <link itemprop="availability" href="http://schema.org/InStock">
    <span>有货</span>
  </div>
  
  <div itemprop="aggregateRating" itemscope itemtype="http://schema.org/AggregateRating">
    <span itemprop="ratingValue">4.9</span>
    <span itemprop="reviewCount">328</span>
  </div>
</div>
```

## 八、最佳实践

> **📌 微数据使用建议**
> 
> 1. **考虑使用 JSON-LD**：更易维护
> 2. **遵循 Schema.org**：使用标准词汇
> 3. **完整性**：提供所有必需属性
> 4. **测试验证**：使用工具验证
> 5. **保持更新**：跟随 Schema.org 更新

## 参考资料

- [Schema.org](https://schema.org/)
- [Google 结构化数据指南](https://developers.google.com/search/docs/appearance/structured-data)
- [MDN - Microdata](https://developer.mozilla.org/en-US/docs/Web/HTML/Microdata)

---

**上一章** ← [第 20 章：WAI-ARIA 基础](./20-aria-basics.md)  
**下一章** → [第 22 章：SEO 优化](./22-seo-optimization.md)
