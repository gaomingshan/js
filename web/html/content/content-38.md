# 图片与响应式媒体

## 核心概念

图片是 Web 中最常见的嵌入资源。HTML 提供了从基础 `<img>` 到高级 `<picture>` 的完整图片体系，解决三个核心问题：

1. **加载**：何时加载、加载什么格式
2. **适配**：不同屏幕尺寸和分辨率下展示合适的图片
3. **性能**：减少不必要的带宽消耗

**后端类比**：响应式图片 ≈ 内容协商（Content Negotiation），根据客户端能力返回最合适的资源。

## `<img>` 标签完整属性

### 基础属性

```html
<img
  src="photo.jpg"           
  alt="一只橘猫趴在键盘上"   
  width="800"               
  height="600"              
>
```

| 属性 | 作用 | 重要程度 |
|------|------|---------|
| `src` | 图片 URL | 必填 |
| `alt` | 替代文本（图片无法显示时、屏幕阅读器） | 必填 |
| `width` / `height` | 图片固有尺寸（像素） | 强烈建议 |

**为什么必须设置 `width` 和 `height`**：

浏览器在图片加载前不知道尺寸，会导致布局偏移（CLS，Cumulative Layout Shift）。设置固有尺寸后，浏览器可以预先分配空间。

```html
<!-- ❌ 不设尺寸：图片加载后页面内容突然下移 -->
<img src="photo.jpg" alt="照片">

<!-- ✅ 设尺寸：浏览器提前分配空间，无布局偏移 -->
<img src="photo.jpg" alt="照片" width="800" height="600">
```

现代 CSS 配合：

```css
img {
  max-width: 100%;
  height: auto;    /* 配合 HTML 的 width/height 实现响应式且无 CLS */
}
```

### alt 属性的正确写法

```html
<!-- ✅ 描述图片内容 -->
<img src="chart.png" alt="2024年Q1营收环比增长23%的柱状图">

<!-- ✅ 功能性图片描述功能 -->
<img src="search-icon.svg" alt="搜索">

<!-- ✅ 装饰性图片使用空 alt -->
<img src="decorative-line.svg" alt="">

<!-- ❌ 冗余描述 -->
<img src="photo.jpg" alt="图片">
<img src="logo.png" alt="logo的图片">

<!-- ❌ 缺失 alt -->
<img src="photo.jpg">
```

**判断原则**：
- 信息性图片 → 描述内容或数据
- 功能性图片 → 描述功能（如"搜索"、"关闭"）
- 装饰性图片 → `alt=""`（空字符串，非省略）

### loading 属性：原生懒加载

```html
<!-- 首屏图片：立即加载（默认行为） -->
<img src="hero.jpg" alt="首页大图" loading="eager">

<!-- 非首屏图片：滚动到视口附近时加载 -->
<img src="article-img.jpg" alt="文章配图" loading="lazy">
```

| 值 | 行为 | 使用场景 |
|----|------|---------|
| `eager` | 立即加载（默认） | 首屏关键图片 |
| `lazy` | 延迟加载 | 长页面中的非首屏图片 |

**工程建议**：
- 首屏可见图片（hero、logo）**不要**加 `loading="lazy"`，否则延迟首屏渲染
- 长列表、文章内图片统一加 `loading="lazy"`

### fetchpriority 属性：加载优先级

```html
<!-- LCP（最大内容绘制）图片：提高优先级 -->
<img src="hero.jpg" alt="首页大图" fetchpriority="high">

<!-- 非关键图片：降低优先级 -->
<img src="thumbnail.jpg" alt="缩略图" fetchpriority="low">
```

### decoding 属性：解码策略

```html
<!-- 异步解码，不阻塞主线程渲染 -->
<img src="large-photo.jpg" alt="大图" decoding="async">

<!-- 同步解码（默认），确保图片与文本同时展示 -->
<img src="inline-icon.svg" alt="图标" decoding="sync">
```

## 响应式图片：srcset 与 sizes

### 问题背景

同一张图片在不同设备上的需求完全不同：

| 设备 | 屏幕宽度 | DPR | 实际需要像素宽度 |
|------|---------|-----|---------------|
| 手机 | 375px | 2x | 750px |
| 平板 | 768px | 2x | 1536px |
| 桌面 | 1440px | 1x | 1440px |
| 4K 桌面 | 1920px | 2x | 3840px |

如果只提供一张 3840px 的大图，手机用户浪费 80% 以上的带宽。

### srcset + sizes：分辨率切换

```html
<img
  src="photo-800.jpg"
  srcset="
    photo-400.jpg   400w,
    photo-800.jpg   800w,
    photo-1200.jpg 1200w,
    photo-1600.jpg 1600w
  "
  sizes="
    (max-width: 600px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
  alt="风景照片"
  width="1600"
  height="900"
>
```

**工作流程**：

1. 浏览器读取 `sizes`，根据当前视口宽度计算图片的 CSS 显示宽度
2. 结合设备 DPR，计算实际需要的像素宽度
3. 从 `srcset` 中选择最合适的图片 URL

```
示例：手机（375px 宽，2x DPR）
→ sizes 匹配 (max-width: 600px) 100vw → 显示宽度 375px
→ 实际需要 375 × 2 = 750px
→ srcset 中选择 photo-800.jpg（最接近的 ≥ 750w）
```

**后端类比**：类似于 CDN 根据 `Accept` 头返回不同格式，或根据 `Client-Hints` 返回不同尺寸。

### srcset + x 描述符：DPR 切换

```html
<!-- 固定尺寸图片（如 logo），只需适配不同 DPR -->
<img
  src="logo-1x.png"
  srcset="
    logo-1x.png 1x,
    logo-2x.png 2x,
    logo-3x.png 3x
  "
  alt="网站 Logo"
  width="200"
  height="60"
>
```

适用于图片在所有屏幕上显示尺寸相同，只需要不同清晰度的场景。

## `<picture>` 元素：艺术方向与格式适配

### 格式适配

```html
<picture>
  <!-- 优先使用 AVIF（体积最小） -->
  <source type="image/avif" srcset="photo.avif">
  <!-- 其次使用 WebP -->
  <source type="image/webp" srcset="photo.webp">
  <!-- 兜底使用 JPEG -->
  <img src="photo.jpg" alt="照片" width="800" height="600">
</picture>
```

浏览器从上到下检查 `<source>`，选择第一个支持的格式。**`<img>` 是必须的**，既作为兜底，也是 `alt`、`width`、`height` 等属性的载体。

### 艺术方向（Art Direction）

不同屏幕尺寸使用不同构图的图片：

```html
<picture>
  <!-- 手机：竖版裁切，突出主体 -->
  <source
    media="(max-width: 600px)"
    srcset="hero-mobile.jpg"
  >
  <!-- 平板：方形裁切 -->
  <source
    media="(max-width: 1024px)"
    srcset="hero-tablet.jpg"
  >
  <!-- 桌面：全景横版 -->
  <img src="hero-desktop.jpg" alt="产品展示" width="1920" height="600">
</picture>
```

### 格式 + 分辨率 + 艺术方向的完整组合

```html
<picture>
  <!-- 手机 + AVIF -->
  <source
    media="(max-width: 600px)"
    type="image/avif"
    srcset="hero-mobile.avif 400w, hero-mobile-2x.avif 800w"
    sizes="100vw"
  >
  <!-- 手机 + WebP -->
  <source
    media="(max-width: 600px)"
    type="image/webp"
    srcset="hero-mobile.webp 400w, hero-mobile-2x.webp 800w"
    sizes="100vw"
  >
  <!-- 手机 + JPEG 兜底 -->
  <source
    media="(max-width: 600px)"
    srcset="hero-mobile.jpg 400w, hero-mobile-2x.jpg 800w"
    sizes="100vw"
  >
  <!-- 桌面 + AVIF -->
  <source
    type="image/avif"
    srcset="hero-desktop.avif 1200w, hero-desktop-2x.avif 2400w"
    sizes="100vw"
  >
  <!-- 桌面 + WebP -->
  <source
    type="image/webp"
    srcset="hero-desktop.webp 1200w, hero-desktop-2x.webp 2400w"
    sizes="100vw"
  >
  <!-- 最终兜底 -->
  <img src="hero-desktop.jpg" alt="产品展示" width="1920" height="600">
</picture>
```

## SVG：内联 vs 外部引用

### 引用方式对比

```html
<!-- 方式 1：img 标签引用（外部文件） -->
<img src="icon.svg" alt="图标" width="24" height="24">

<!-- 方式 2：内联 SVG -->
<svg width="24" height="24" viewBox="0 0 24 24" aria-label="搜索">
  <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 
           6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79
           l5 4.99L20.49 19l-4.99-5z"/>
</svg>

<!-- 方式 3：CSS 背景 -->
<div class="icon" style="background-image: url('icon.svg');"></div>

<!-- 方式 4：object 标签 -->
<object type="image/svg+xml" data="chart.svg">
  <img src="chart.png" alt="图表备用">
</object>
```

### 选型指南

| 方式 | CSS 可控 | JS 可控 | 缓存 | 适用场景 |
|------|---------|---------|------|---------|
| `<img>` | ❌ | ❌ | ✅ | 静态图标、Logo |
| 内联 SVG | ✅ | ✅ | ❌ | 需要交互/动画的图标 |
| CSS 背景 | 部分 | ❌ | ✅ | 装饰性图形 |
| `<object>` | ❌ | ✅ | ✅ | 复杂交互式 SVG |

**工程建议**：
- 图标系统 → 内联 SVG（配合 SVG sprite 或组件化）
- 静态插图 → `<img>` 引用
- 装饰性背景 → CSS 背景图

### SVG Sprite 实践

```html
<!-- 定义 Sprite（通常放在 body 开头或独立文件） -->
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <symbol id="icon-search" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27..."/>
  </symbol>
  <symbol id="icon-close" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59..."/>
  </symbol>
</svg>

<!-- 使用 -->
<svg width="24" height="24" aria-label="搜索">
  <use href="#icon-search"/>
</svg>

<svg width="24" height="24" aria-label="关闭">
  <use href="#icon-close"/>
</svg>
```

## 图片性能优化实践

### 完整的优化清单

```html
<!-- 优化后的图片标签 -->
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="产品展示图"
  width="1200"
  height="800"
  loading="lazy"
  decoding="async"
>
```

### 占位符策略

```html
<!-- 方式 1：CSS 背景色占位 -->
<img
  src="photo.jpg"
  alt="照片"
  width="800"
  height="600"
  loading="lazy"
  style="background-color: #e5e7eb;"
>

<!-- 方式 2：低质量占位图（LQIP） -->
<!-- 先加载极小的模糊图，再替换为高清图 -->
<img
  src="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  data-src="photo-hd.jpg"
  alt="照片"
  width="800"
  height="600"
  class="lazyload"
>

<!-- 方式 3：SVG 轮廓占位 -->
<img
  src="data:image/svg+xml,..."
  data-src="photo.jpg"
  alt="照片"
  width="800"
  height="600"
>
```

### 首屏关键图片预加载

```html
<head>
  <!-- 预加载 LCP 图片 -->
  <link
    rel="preload"
    as="image"
    href="hero.jpg"
    imagesrcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w"
    imagesizes="100vw"
  >
</head>
```

## 常见误区

### 误区 1：所有图片都用 loading="lazy"

```html
<!-- ❌ 首屏图片不应懒加载 -->
<img src="hero.jpg" alt="首页大图" loading="lazy">

<!-- ✅ 首屏图片用 eager + 高优先级 -->
<img src="hero.jpg" alt="首页大图" loading="eager" fetchpriority="high">
```

### 误区 2：只提供一种图片格式

```html
<!-- ❌ 只用 PNG，体积过大 -->
<img src="photo.png" alt="照片">

<!-- ✅ 使用 picture 提供现代格式 -->
<picture>
  <source type="image/avif" srcset="photo.avif">
  <source type="image/webp" srcset="photo.webp">
  <img src="photo.jpg" alt="照片">
</picture>
```

**格式体积对比**（同质量下）：
- AVIF < WebP < JPEG < PNG

### 误区 3：忽略图片的固有尺寸

```html
<!-- ❌ 无尺寸，导致 CLS -->
<img src="photo.jpg" alt="照片">

<!-- ✅ 声明固有尺寸 -->
<img src="photo.jpg" alt="照片" width="800" height="600">

<!-- ✅ CSS 也可以用 aspect-ratio -->
<img src="photo.jpg" alt="照片" style="aspect-ratio: 4/3; width: 100%;">
```

## 工程实践

### 场景：SSR 页面的图片输出

```javascript
// Node.js 生成响应式图片标签
function renderImage({ src, alt, width, height, lazy = true }) {
  const baseName = src.replace(/\.\w+$/, '');
  const ext = src.match(/\.(\w+)$/)[1];
  
  return `
    <picture>
      <source
        type="image/avif"
        srcset="${baseName}-400.avif 400w, ${baseName}-800.avif 800w, ${baseName}-1200.avif 1200w"
        sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
      >
      <source
        type="image/webp"
        srcset="${baseName}-400.webp 400w, ${baseName}-800.webp 800w, ${baseName}-1200.webp 1200w"
        sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
      >
      <img
        src="${src}"
        srcset="${baseName}-400.${ext} 400w, ${baseName}-800.${ext} 800w, ${baseName}-1200.${ext} 1200w"
        sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt="${escapeHtml(alt)}"
        width="${width}"
        height="${height}"
        loading="${lazy ? 'lazy' : 'eager'}"
        decoding="${lazy ? 'async' : 'auto'}"
      >
    </picture>
  `;
}
```

## 参考资源

- [HTML Living Standard - Embedded Content](https://html.spec.whatwg.org/multipage/embedded-content.html)
- [MDN - Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Web.dev - Optimize Images](https://web.dev/fast/#optimize-your-images)
- [Smashing Magazine - A Guide To The Responsive Images Syntax](https://www.smashingmagazine.com/2014/05/responsive-images-done-right-guide-picture-srcset/)
