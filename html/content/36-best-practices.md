# 第 36 章：最佳实践

## 概述

综合前面所学，总结 HTML 开发的最佳实践。

## 一、代码规范

### 1.1 基本规范

```html
<!-- ✅ 推荐 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题</title>
</head>
<body>
  <header>
    <h1>网站标题</h1>
    <nav>
      <ul>
        <li><a href="/">首页</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <article>
      <h2>文章标题</h2>
      <p>内容...</p>
    </article>
  </main>
  
  <footer>
    <p>&copy; 2024 网站名称</p>
  </footer>
</body>
</html>
```

### 1.2 代码风格

```html
<!-- ✅ 推荐 -->
- 使用小写标签和属性
- 属性值用双引号
- 2或4空格缩进
- 合理换行
- 添加注释

<!-- ❌ 避免 -->
<DIV Class='container'>
<P>内容</P></DIV>
```

## 二、语义化

```html
<!-- ✅ 语义化 -->
<article>
  <header>
    <h1>文章标题</h1>
    <time datetime="2024-01-15">2024年1月15日</time>
  </header>
  <section>
    <h2>第一部分</h2>
    <p>内容...</p>
  </section>
</article>

<!-- ❌ 不语义化 -->
<div class="article">
  <div class="title">文章标题</div>
  <div class="date">2024年1月15日</div>
  <div class="content">内容...</div>
</div>
```

## 三、可访问性

```html
<!-- ✅ 可访问性好 -->
<form>
  <label for="email">邮箱：</label>
  <input type="email" id="email" required>
  
  <button type="submit">提交</button>
</form>

<img src="photo.jpg" alt="产品照片 - iPhone 15">

<nav aria-label="主导航">
  <ul>...</ul>
</nav>
```

## 四、性能优化

```html
<head>
  <!-- 预连接 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="font.woff2" as="font" crossorigin>
  
  <!-- 关键 CSS 内联 -->
  <style>/* 首屏样式 */</style>
  
  <!-- 非关键 CSS 延迟 -->
  <link rel="stylesheet" href="style.css" media="print" onload="this.media='all'">
</head>

<body>
  <!-- 懒加载图片 -->
  <img src="image.jpg" loading="lazy" alt="图片">
  
  <!-- 脚本延迟 -->
  <script src="app.js" defer></script>
</body>
```

## 五、SEO 优化

```html
<head>
  <title>页面标题 - 网站名称</title>
  <meta name="description" content="页面描述，150-160字符">
  <link rel="canonical" href="https://example.com/page">
  
  <!-- 结构化数据 -->
  <script type="application/ld+json">
  {
    "@context": "http://schema.org",
    "@type": "Article",
    "headline": "文章标题"
  }
  </script>
</head>

<body>
  <article>
    <h1>唯一的 h1 标题</h1>
    <img src="image.jpg" alt="描述性文字">
  </article>
</body>
```

## 六、安全

```html
<!-- CSP -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' https://trusted.com">

<!-- 外部链接 -->
<a href="https://external.com" 
   target="_blank" 
   rel="noopener noreferrer">
  外部链接
</a>
```

```javascript
// 输出转义
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

element.textContent = userInput;  // ✅ 安全
```

## 七、响应式

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<picture>
  <source media="(max-width: 768px)" srcset="mobile.jpg">
  <source media="(min-width: 769px)" srcset="desktop.jpg">
  <img src="desktop.jpg" alt="响应式图片">
</picture>
```

## 八、开发工作流

### 8.1 项目结构

```
project/
├── src/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── images/
├── dist/
├── package.json
└── README.md
```

### 8.2 自动化

```json
{
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack serve",
    "lint": "htmlhint src/**/*.html",
    "test": "jest"
  }
}
```

## 九、检查清单

> **📋 HTML 开发清单**
> 
> **基础**
> - [ ] DOCTYPE 声明
> - [ ] lang 属性
> - [ ] 字符编码
> - [ ] 视口设置
> - [ ] 有意义的 title
> 
> **语义化**
> - [ ] 使用语义标签
> - [ ] 合理的标题层级
> - [ ] 每页一个 h1
> 
> **可访问性**
> - [ ] 图片 alt 属性
> - [ ] 表单标签关联
> - [ ] ARIA 属性
> - [ ] 键盘可操作
> 
> **SEO**
> - [ ] meta description
> - [ ] 结构化数据
> - [ ] 语义化标签
> - [ ] 图片优化
> 
> **性能**
> - [ ] 资源压缩
> - [ ] 图片懒加载
> - [ ] 关键资源预加载
> - [ ] 脚本异步加载
> 
> **安全**
> - [ ] CSP 设置
> - [ ] 输出转义
> - [ ] 外部链接安全
> 
> **兼容性**
> - [ ] 跨浏览器测试
> - [ ] 移动端测试
> - [ ] 渐进增强
> 
> **代码质量**
> - [ ] HTML 验证
> - [ ] 代码格式化
> - [ ] 注释清晰
> - [ ] 无控制台错误

## 十、持续学习

### 10.1 学习资源

- **MDN Web Docs**: 权威文档
- **Web.dev**: Google 官方指南
- **W3C**: 标准规范
- **CSS-Tricks**: 实用技巧

### 10.2 实践项目

1. 个人博客
2. 产品展示页
3. 响应式网站
4. PWA 应用

### 10.3 关注技术

- Web Components
- HTML 新特性
- 浏览器 API
- 性能优化
- 可访问性

## 总结

HTML 是 Web 的基石，掌握 HTML 的最佳实践能够：

- ✅ 提升代码质量
- ✅ 改善用户体验
- ✅ 提高搜索排名
- ✅ 增强可维护性
- ✅ 确保可访问性

持续学习，不断实践，成为优秀的前端开发者！

## 参考资料

- [MDN Web Docs](https://developer.mozilla.org/zh-CN/)
- [Web.dev](https://web.dev/)
- [W3C Standards](https://www.w3.org/standards/)
- [HTML Living Standard](https://html.spec.whatwg.org/)

---

**上一章** ← [第 35 章：测试](./35-testing.md)

---

🎉 **恭喜！HTML 学习体系全部 36 章已完成！**

---

## 学习路线图

**第一部分：HTML 基础（1-6 章）**
✅ HTML 简介、文档结构、头部元素、文本标签、列表、链接

**第二部分：媒体与嵌入（7-11 章）**
✅ 图片、音视频、Canvas、SVG、iframe

**第三部分：表格与表单（12-17 章）**
✅ 表格、表单基础、表单控件、验证、样式、提交

**第四部分：语义化 HTML（18-22 章）**
✅ 语义标签、文档大纲、ARIA、微数据、SEO

**第五部分：安全与性能（23-27 章）**
✅ XSS、CSRF、性能优化、资源加载、响应式

**第六部分：现代 HTML 特性（28-32 章）**
✅ Web Components、HTML5 API、离线应用、PWA、WebAssembly

**第七部分：工程化与最佳实践（33-36 章）**
✅ 模板引擎、构建工具、测试、最佳实践
