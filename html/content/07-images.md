# 第 7 章：图片处理

## 概述

图片是网页的重要组成部分。合理使用图片标签和优化技术，可以提升用户体验和页面性能。

## 一、`<img>` 基础

### 1.1 基本语法

```html
<img src="image.jpg" alt="图片描述">
```

**必需属性：**
- `src`：图片路径
- `alt`：替代文本（可访问性必需）

### 1.2 图片路径

```html
<!-- 相对路径 -->
<img src="images/photo.jpg" alt="照片">
<img src="../images/photo.jpg" alt="照片">

<!-- 绝对路径 -->
<img src="/assets/images/photo.jpg" alt="照片">

<!-- 外部 URL -->
<img src="https://example.com/image.jpg" alt="外部图片">

<!-- Data URL -->
<img src="data:image/png;base64,iVBORw0KG..." alt="Base64图片">
```

## 二、图片属性

### 2.1 尺寸控制

```html
<!-- 指定宽高（像素） -->
<img src="photo.jpg" alt="照片" width="300" height="200">

<!-- 只指定宽度，高度自适应 -->
<img src="photo.jpg" alt="照片" width="300">
```

> **💡 最佳实践**  
> - 指定宽高可避免页面重排
> - 保持图片原始宽高比
> - 实际尺寸控制使用 CSS

```html
<!-- ✅ 推荐：HTML 设置原始尺寸，CSS 控制显示尺寸 -->
<img src="photo.jpg" alt="照片" width="1200" height="800" class="responsive">

<style>
.responsive {
  max-width: 100%;
  height: auto;
}
</style>
```

### 2.2 替代文本 alt

```html
<!-- ✅ 描述性 alt -->
<img src="product.jpg" alt="iPhone 15 Pro Max 深空黑色">

<!-- ✅ 装饰性图片：空 alt -->
<img src="decoration.png" alt="">

<!-- ❌ 无意义的 alt -->
<img src="photo.jpg" alt="图片">
<img src="photo.jpg" alt="IMG_1234">
```

**alt 文本原则：**
- 📝 描述图片内容和功能
- 🎯 简洁但有意义
- 🚫 装饰性图片使用空 alt
- ❌ 不要包含"图片"、"图像"等词

### 2.3 title 属性

```html
<!-- 鼠标悬停提示 -->
<img src="chart.jpg" 
     alt="2024年销售数据" 
     title="点击查看大图">
```

### 2.4 loading 属性（懒加载）

```html
<!-- 懒加载：接近视口时才加载 -->
<img src="image.jpg" alt="图片" loading="lazy">

<!-- 立即加载（默认） -->
<img src="hero.jpg" alt="首屏图片" loading="eager">
```

> **⚡ 性能优化**  
> 首屏图片使用 `eager`，非首屏图片使用 `lazy`。

### 2.5 decoding 属性

```html
<!-- 异步解码 -->
<img src="image.jpg" alt="图片" decoding="async">

<!-- 同步解码 -->
<img src="image.jpg" alt="图片" decoding="sync">

<!-- 自动（默认） -->
<img src="image.jpg" alt="图片" decoding="auto">
```

## 三、响应式图片

### 3.1 srcset 属性

```html
<!-- 不同分辨率 -->
<img src="small.jpg"
     srcset="small.jpg 480w,
             medium.jpg 768w,
             large.jpg 1200w"
     sizes="(max-width: 768px) 100vw, 50vw"
     alt="响应式图片">
```

**语法说明：**
- `480w`：图片宽度 480px
- `sizes`：告诉浏览器图片显示尺寸
- 浏览器根据设备选择最合适的图片

### 3.2 设备像素比

```html
<!-- 普通屏幕 vs 高清屏幕 -->
<img src="image.jpg"
     srcset="image.jpg 1x,
             image@2x.jpg 2x,
             image@3x.jpg 3x"
     alt="高清图片">
```

### 3.3 `<picture>` 元素

```html
<picture>
  <!-- WebP 格式（现代浏览器） -->
  <source srcset="image.webp" type="image/webp">
  
  <!-- AVIF 格式（更现代的浏览器） -->
  <source srcset="image.avif" type="image/avif">
  
  <!-- 回退到 JPG -->
  <img src="image.jpg" alt="图片">
</picture>
```

**艺术方向（不同布局不同图片）：**

```html
<picture>
  <!-- 移动端：竖版图片 -->
  <source media="(max-width: 768px)" srcset="mobile.jpg">
  
  <!-- 桌面端：横版图片 -->
  <source media="(min-width: 769px)" srcset="desktop.jpg">
  
  <img src="desktop.jpg" alt="响应式图片">
</picture>
```

## 四、图片格式

### 4.1 常见格式对比

| 格式 | 特点 | 适用场景 |
|-----|------|---------|
| **JPEG** | 有损压缩，体积小 | 照片、复杂图像 |
| **PNG** | 无损压缩，支持透明 | Logo、图标、截图 |
| **GIF** | 支持动画，256 色 | 简单动画 |
| **WebP** | 体积更小，支持透明和动画 | 所有场景（现代浏览器） |
| **AVIF** | 最小体积，最佳压缩 | 所有场景（最新浏览器） |
| **SVG** | 矢量图，无限缩放 | Logo、图标、简单图形 |

### 4.2 格式选择

```html
<!-- 照片：优先 WebP/AVIF，回退 JPEG -->
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg" alt="照片">
</picture>

<!-- Logo：SVG 优先 -->
<img src="logo.svg" alt="公司Logo">

<!-- 带透明的图标：WebP 或 PNG -->
<picture>
  <source srcset="icon.webp" type="image/webp">
  <img src="icon.png" alt="图标">
</picture>
```

## 五、图片优化

### 5.1 压缩

```html
<!-- 使用工具压缩 -->
- TinyPNG (https://tinypng.com/)
- Squoosh (https://squoosh.app/)
- ImageOptim (Mac)
```

### 5.2 预加载关键图片

```html
<head>
  <!-- 预加载首屏关键图片 -->
  <link rel="preload" as="image" href="hero.jpg">
</head>
```

### 5.3 图片 CDN

```html
<!-- 使用 CDN 加速 -->
<img src="https://cdn.example.com/image.jpg?w=800&q=80" alt="CDN图片">
```

## 六、图片与 CSS

### 6.1 CSS 背景图片 vs HTML 图片

```html
<!-- ✅ 内容图片：使用 <img> -->
<img src="product.jpg" alt="产品图片">

<!-- ✅ 装饰性图片：使用 CSS -->
<div class="hero" style="background-image: url('hero.jpg')"></div>
```

**选择原则：**
- 📄 **内容图片**：`<img>`（SEO、可访问性）
- 🎨 **装饰图片**：CSS `background-image`

### 6.2 object-fit

```html
<img src="image.jpg" alt="图片" class="cover">

<style>
.cover {
  width: 300px;
  height: 200px;
  object-fit: cover;      /* 裁剪填充 */
  object-fit: contain;    /* 完整显示 */
  object-fit: fill;       /* 拉伸填充 */
  object-fit: none;       /* 原始尺寸 */
  object-fit: scale-down; /* 缩小但不放大 */
}
</style>
```

## 七、图片可访问性

### 7.1 alt 文本最佳实践

```html
<!-- ✅ 信息性图片 -->
<img src="chart.jpg" alt="2024年Q1销售额增长30%的柱状图">

<!-- ✅ 功能性图片 -->
<a href="search.html">
  <img src="search-icon.png" alt="搜索">
</a>

<!-- ✅ 装饰性图片 -->
<img src="divider.png" alt="" role="presentation">

<!-- ✅ 复杂图片：使用 longdesc 或 figure -->
<figure>
  <img src="complex-chart.jpg" alt="市场份额饼图">
  <figcaption>
    2024年市场份额：A公司40%，B公司30%，C公司20%，其他10%
  </figcaption>
</figure>
```

### 7.2 图片加载失败

```html
<img src="image.jpg" 
     alt="产品图片" 
     onerror="this.src='placeholder.jpg'">
```

## 八、实战示例

### 8.1 产品图片

```html
<figure class="product-image">
  <picture>
    <source srcset="product.avif" type="image/avif">
    <source srcset="product.webp" type="image/webp">
    <img src="product.jpg" 
         alt="iPhone 15 Pro Max 深空黑色 256GB"
         width="800"
         height="800"
         loading="lazy">
  </picture>
  <figcaption>iPhone 15 Pro Max - 深空黑色</figcaption>
</figure>
```

### 8.2 响应式图片画廊

```html
<div class="gallery">
  <img src="thumb.jpg"
       srcset="thumb.jpg 300w,
               medium.jpg 768w,
               large.jpg 1200w"
       sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
       alt="画廊图片"
       loading="lazy">
</div>
```

### 8.3 Hero 图片

```html
<picture>
  <!-- 移动端 -->
  <source media="(max-width: 768px)" 
          srcset="hero-mobile.jpg 768w,
                  hero-mobile@2x.jpg 1536w">
  
  <!-- 桌面端 -->
  <source media="(min-width: 769px)" 
          srcset="hero-desktop.jpg 1920w,
                  hero-desktop@2x.jpg 3840w">
  
  <img src="hero-desktop.jpg" 
       alt="欢迎来到我们的网站"
       width="1920"
       height="600"
       loading="eager">
</picture>
```

## 九、性能检查清单

> **✅ 图片优化清单**
> 
> - [ ] 压缩所有图片
> - [ ] 使用现代格式（WebP/AVIF）
> - [ ] 提供响应式图片（srcset）
> - [ ] 非首屏图片懒加载（loading="lazy"）
> - [ ] 指定图片尺寸（width/height）
> - [ ] 所有图片有 alt 文本
> - [ ] 关键图片预加载
> - [ ] 使用 CDN

## 参考资料

- [MDN - `<img>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/img)
- [MDN - 响应式图片](https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Web.dev - 图片优化](https://web.dev/fast/#optimize-your-images)

---

**上一章** ← [第 6 章：链接与导航](./06-links-navigation.md)  
**下一章** → [第 8 章：音频与视频](./08-audio-video.md)
