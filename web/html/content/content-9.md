# 多媒体与嵌入内容

## 核心概念

HTML 的**嵌入内容**（Embedded Content）指从外部资源加载并显示的内容，包括图片、视频、音频、iframe 等。这些元素是**资源引用**而非内容本身。

```html
<!-- 图片：引用外部图片资源 -->
<img src="photo.jpg" alt="照片">

<!-- 视频：嵌入视频文件 -->
<video src="video.mp4" controls></video>

<!-- iframe：嵌入另一个HTML文档 -->
<iframe src="https://example.com"></iframe>
```

**后端类比**：
- `<img>` ≈ 静态资源引用（CDN链接）
- `<iframe>` ≈ 微服务调用（嵌入其他服务的页面）
- `<video>` ≈ 流媒体服务

## img、video、audio：资源加载与渲染

### img：图片元素

#### 基本用法

```html
<img 
  src="photo.jpg" 
  alt="照片描述" 
  width="800" 
  height="600"
  loading="lazy"
  decoding="async"
>
```

**必需属性**：
- `src`：图片 URL
- `alt`：替代文本（无障碍、SEO、加载失败时显示）

**可选属性**：
- `width`/`height`：预留空间，避免布局抖动
- `loading`：懒加载策略（`lazy`/`eager`）
- `decoding`：解码方式（`async`/`sync`/`auto`）

#### 响应式图片

```html
<!-- srcset：不同分辨率 -->
<img 
  src="photo-800.jpg"
  srcset="
    photo-400.jpg 400w,
    photo-800.jpg 800w,
    photo-1600.jpg 1600w
  "
  sizes="(max-width: 600px) 400px, 800px"
  alt="响应式图片"
>
```

**后端类比**：类似于根据客户端能力返回不同质量的数据。

### video：视频元素

```html
<video 
  src="video.mp4" 
  controls 
  width="800" 
  poster="thumbnail.jpg"
  preload="metadata"
>
  您的浏览器不支持视频播放。
</video>
```

### audio：音频元素

```html
<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
  <source src="audio.ogg" type="audio/ogg">
  您的浏览器不支持音频播放。
</audio>
```

## iframe：文档嵌套的安全边界

```html
<iframe 
  src="https://example.com" 
  width="800" 
  height="600"
  sandbox="allow-scripts allow-same-origin"
  loading="lazy"
></iframe>
```

**安全沙箱**：
- `sandbox`：限制权限
- `allow-scripts`：允许执行脚本
- `allow-same-origin`：允许同源访问

**后端类比**：类似于容器的权限控制。

## canvas、svg：图形渲染的两种范式

### canvas：像素绘制

```html
<canvas id="myCanvas" width="800" height="600"></canvas>

<script>
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'blue';
ctx.fillRect(10, 10, 100, 100);
</script>
```

**特点**：
- 像素级操作
- 性能高
- 适合游戏、动画

### svg：矢量图形

```html
<svg width="800" height="600">
  <rect x="10" y="10" width="100" height="100" fill="blue" />
  <circle cx="200" cy="200" r="50" fill="red" />
</svg>
```

**特点**：
- 矢量图形
- 可缩放
- 可交互

## 参考资源

- [MDN - Multimedia and Embedding](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding)
- [HTML Living Standard - Embedded Content](https://html.spec.whatwg.org/multipage/embedded-content.html)
