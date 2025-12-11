# 第 7 章：图片处理 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**单选题 | 图片标签**

### 题目
以下哪个属性是 `<img>` 标签**必需的**？

**选项：**
- A. src
- B. alt
- C. src 和 alt
- D. width 和 height

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 解析
```html
<!-- ✅ 正确：必需属性 -->
<img src="photo.jpg" alt="照片描述">

<!-- ❌ 错误：缺少 alt -->
<img src="photo.jpg">

<!-- ❌ 错误：缺少 src -->
<img alt="照片描述">
```

**为什么两者都必需？**
- `src`：指定图片来源
- `alt`：可访问性，屏幕阅读器使用

**装饰性图片：**
```html
<img src="decoration.png" alt="">
```
</details>

---

## 第 2 题 🟢

**判断题 | 图片格式**

### 题目
WebP 格式的图片比 JPEG 和 PNG 文件更小，且所有浏览器都支持。

**选项：** A. ✅ 正确 | B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 解析
WebP 文件更小，但**不是所有浏览器都支持**。

```html
<!-- 使用 picture 提供备选 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="图片">
</picture>
```

**浏览器支持：**
- ✅ Chrome 23+
- ✅ Firefox 65+
- ✅ Edge 18+
- ❌ Safari < 14（旧版不支持）
</details>

---

## 第 3 题 🟢

**单选题 | 懒加载**

### 题目
原生图片懒加载使用哪个属性？

**选项：**
- A. `lazy="true"`
- B. `loading="lazy"`
- C. `defer`
- D. `async`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 解析
```html
<!-- 懒加载 -->
<img src="image.jpg" loading="lazy" alt="图片">

<!-- 立即加载 -->
<img src="hero.jpg" loading="eager" alt="首屏图片">
```

**浏览器支持：** Chrome 77+, Firefox 75+, Safari 15.4+
</details>

---

## 第 4 题 🟡

**多选题 | 响应式图片**

### 题目
实现响应式图片的方法有哪些？

**选项：**
- A. `srcset` 属性
- B. `<picture>` 元素
- C. `sizes` 属性
- D. CSS `background-image`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 解析

**1. srcset + sizes**
```html
<img 
  srcset="small.jpg 480w, large.jpg 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  src="large.jpg" 
  alt="响应式图片">
```

**2. picture**
```html
<picture>
  <source media="(max-width: 768px)" srcset="mobile.jpg">
  <source media="(min-width: 769px)" srcset="desktop.jpg">
  <img src="desktop.jpg" alt="图片">
</picture>
```

**3. CSS**
```css
.banner {
  background-image: image-set(
    "image.webp" type("image/webp"),
    "image.jpg" type("image/jpeg")
  );
}
```
</details>

---

## 第 5 题 🟡

**代码分析题 | srcset**

### 题目
以下代码中的 `480w` 和 `1200w` 代表什么？

```html
<img srcset="small.jpg 480w, large.jpg 1200w" src="large.jpg" alt="图片">
```

**选项：**
- A. 图片宽度（像素）
- B. 图片文件大小
- C. 屏幕分辨率
- D. DPR（设备像素比）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 解析
`w` 描述符表示图片的**固有宽度**（以像素为单位）。

```html
<!-- 浏览器根据视口宽度和 DPR 选择合适的图片 -->
<img 
  srcset="
    small.jpg 480w,    <!-- 图片宽度 480px -->
    medium.jpg 768w,   <!-- 图片宽度 768px -->
    large.jpg 1200w    <!-- 图片宽度 1200px -->
  "
  sizes="100vw"
  src="large.jpg" 
  alt="响应式图片">

<!-- 配合 sizes 使用 -->
<img 
  srcset="small.jpg 480w, large.jpg 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  src="large.jpg" 
  alt="图片">
```

**DPR 描述符（x）：**
```html
<img 
  srcset="image.jpg 1x, image@2x.jpg 2x, image@3x.jpg 3x"
  src="image.jpg" 
  alt="高清图片">
```
</details>

---

## 第 6 题 🟡

**单选题 | 图片格式**

### 题目
以下哪种格式支持透明背景？

**选项：**
- A. JPEG
- B. PNG 和 WebP
- C. GIF 和 SVG
- D. B 和 C 都对

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 解析

**支持透明：**
- ✅ PNG（Alpha 通道）
- ✅ WebP（支持透明）
- ✅ GIF（索引透明）
- ✅ SVG（矢量图形）

**不支持：**
- ❌ JPEG（不支持透明）

**使用场景：**
```html
<!-- Logo -->
<img src="logo.png" alt="Logo">

<!-- 图标 -->
<img src="icon.webp" alt="图标">

<!-- 矢量图标 -->
<img src="icon.svg" alt="图标">
```
</details>

---

## 第 7 题 🟡

**多选题 | 图片优化**

### 题目
图片优化的最佳实践包括？

**选项：**
- A. 使用适当的图片格式
- B. 压缩图片
- C. 使用 CDN
- D. 懒加载非首屏图片

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 解析

**1. 选择格式**
- 照片 → JPEG/WebP
- 图标/Logo → PNG/SVG
- 动画 → GIF/WebP/视频

**2. 压缩**
```bash
# 工具
- TinyPNG
- ImageOptim
- Sharp (Node.js)
```

**3. CDN**
```html
<img src="https://cdn.example.com/image.jpg" alt="图片">
```

**4. 懒加载**
```html
<img src="image.jpg" loading="lazy" alt="图片">
```

**5. 响应式**
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="图片">
</picture>
```
</details>

---

## 第 8 题 🔴

**代码补全题 | picture**

### 题目
创建一个在移动端显示竖版图片，桌面端显示横版图片的 picture 元素。

<details>
<summary>查看答案</summary>

### ✅ 正确答案

```html
<picture>
  <!-- 移动端：竖版图片 -->
  <source 
    media="(max-width: 768px)" 
    srcset="portrait.jpg">
  
  <!-- 桌面端：横版图片 -->
  <source 
    media="(min-width: 769px)" 
    srcset="landscape.jpg">
  
  <!-- 备选 -->
  <img src="landscape.jpg" alt="响应式图片">
</picture>
```

### 解析

**完整示例：**
```html
<picture>
  <!-- WebP 格式（移动端） -->
  <source 
    media="(max-width: 768px)" 
    srcset="portrait.webp" 
    type="image/webp">
  
  <!-- JPEG 格式（移动端） -->
  <source 
    media="(max-width: 768px)" 
    srcset="portrait.jpg">
  
  <!-- WebP 格式（桌面端） -->
  <source 
    media="(min-width: 769px)" 
    srcset="landscape.webp" 
    type="image/webp">
  
  <!-- JPEG 格式（桌面端） -->
  <source 
    media="(min-width: 769px)" 
    srcset="landscape.jpg">
  
  <!-- 备选 -->
  <img src="landscape.jpg" alt="响应式图片">
</picture>
```

**艺术指导（Art Direction）：**
```html
<picture>
  <!-- 移动端：裁剪版本 -->
  <source 
    media="(max-width: 768px)" 
    srcset="hero-mobile.jpg">
  
  <!-- 平板：中等裁剪 -->
  <source 
    media="(max-width: 1024px)" 
    srcset="hero-tablet.jpg">
  
  <!-- 桌面：完整版本 -->
  <source 
    media="(min-width: 1025px)" 
    srcset="hero-desktop.jpg">
  
  <img src="hero-desktop.jpg" alt="英雄图片">
</picture>
```
</details>

---

## 第 9 题 🔴

**多选题 | 图片性能**

### 题目
关于图片性能优化，以下说法正确的是？

**选项：**
- A. 首屏图片应使用 `loading="eager"`
- B. `decoding="async"` 可以异步解码图片
- C. 使用 `<link rel="preload">` 预加载关键图片
- D. 图片宽高应该在 CSS 中设置而非 HTML 属性

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 解析

**1. loading（A 正确）**
```html
<!-- 首屏：立即加载 -->
<img src="hero.jpg" loading="eager" alt="首屏">

<!-- 非首屏：懒加载 -->
<img src="image.jpg" loading="lazy" alt="图片">
```

**2. decoding（B 正确）**
```html
<img src="large.jpg" decoding="async" alt="大图">
```
- `sync`：同步解码（阻塞）
- `async`：异步解码（不阻塞）
- `auto`：浏览器决定

**3. 预加载（C 正确）**
```html
<link rel="preload" href="hero.jpg" as="image">
```

**4. 宽高（D 错误）**
```html
<!-- ✅ 推荐：HTML 属性（防止布局偏移） -->
<img src="image.jpg" width="800" height="600" alt="图片">

<!-- CSS 设置实际显示大小 -->
<style>
img {
  max-width: 100%;
  height: auto;
}
</style>
```

**完整优化：**
```html
<link rel="preload" href="hero.webp" as="image" type="image/webp">

<picture>
  <source srcset="hero.webp" type="image/webp">
  <img 
    src="hero.jpg" 
    alt="英雄图片"
    width="1920" 
    height="1080"
    loading="eager"
    decoding="async">
</picture>
```
</details>

---

## 第 10 题 🔴

**综合分析题 | 最佳实践**

### 题目
设计一个性能优化的响应式图片方案，要求：
1. 支持 WebP 和 JPEG
2. 移动端和桌面端不同图片
3. 懒加载
4. 防止布局偏移

<details>
<summary>查看答案</summary>

### 📖 解析

**完整方案：**

```html
<!-- 关键图片（首屏） -->
<link rel="preload" 
      href="hero-desktop.webp" 
      as="image" 
      type="image/webp"
      media="(min-width: 769px)">

<link rel="preload" 
      href="hero-mobile.webp" 
      as="image" 
      type="image/webp"
      media="(max-width: 768px)">

<!-- 英雄图片 -->
<picture>
  <!-- 移动端 WebP -->
  <source 
    media="(max-width: 768px)"
    srcset="hero-mobile.webp"
    type="image/webp">
  
  <!-- 移动端 JPEG -->
  <source 
    media="(max-width: 768px)"
    srcset="hero-mobile.jpg">
  
  <!-- 桌面端 WebP -->
  <source 
    media="(min-width: 769px)"
    srcset="hero-desktop.webp"
    type="image/webp">
  
  <!-- 桌面端 JPEG -->
  <source 
    media="(min-width: 769px)"
    srcset="hero-desktop.jpg">
  
  <!-- 备选 + 性能优化 -->
  <img 
    src="hero-desktop.jpg" 
    alt="英雄图片"
    width="1920"
    height="1080"
    loading="eager"
    decoding="async">
</picture>

<!-- 非首屏图片 -->
<picture>
  <source srcset="content.webp" type="image/webp">
  <img 
    src="content.jpg" 
    alt="内容图片"
    width="800"
    height="600"
    loading="lazy"
    decoding="async">
</picture>

<!-- CSS -->
<style>
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* 防止布局偏移 */
picture {
  display: block;
}
</style>
```

**性能检查清单：**
- ✅ 使用现代格式（WebP）
- ✅ 提供备选格式（JPEG）
- ✅ 响应式图片
- ✅ 懒加载非首屏
- ✅ 预加载关键图片
- ✅ 设置宽高（防止 CLS）
- ✅ 异步解码
- ✅ 压缩图片
- ✅ 使用 CDN
</details>

---

**📌 本章总结**

- `<img>` 的 `src` 和 `alt` 都是必需的
- 响应式图片：`srcset`、`sizes`、`<picture>`
- 懒加载：`loading="lazy"`
- 图片格式：JPEG/PNG/WebP/SVG
- 性能优化：压缩、CDN、预加载、异步解码
- 防止布局偏移：设置 `width` 和 `height`

**上一章** ← [第 6 章：链接与导航](./chapter-06.md)  
**下一章** → [第 8 章：音频与视频](./chapter-08.md)
