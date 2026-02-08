# 音频与视频

## 核心概念

HTML5 引入 `<audio>` 和 `<video>` 元素，使浏览器原生支持媒体播放，不再依赖 Flash 等插件。

**后端类比**：
- `<video>` / `<audio>` ≈ 流式响应端点，浏览器负责解码和渲染
- `<source>` 多格式兜底 ≈ 内容协商（Content Negotiation）
- `<track>` 字幕 ≈ 多语言资源文件（i18n）

## `<video>` 元素

### 基本用法

```html
<video src="demo.mp4" controls width="640" height="360">
  您的浏览器不支持 video 标签。
</video>
```

标签内的文本仅在浏览器不支持 `<video>` 时显示，作为降级提示。

### 完整属性参考

```html
<video
  src="demo.mp4"
  controls          
  width="640"       
  height="360"      
  poster="cover.jpg"
  preload="metadata"
  autoplay          
  muted             
  loop              
  playsinline       
  crossorigin="anonymous"
>
</video>
```

| 属性 | 值 | 作用 |
|------|-----|------|
| `controls` | 布尔 | 显示浏览器默认播放控件 |
| `poster` | URL | 视频加载前的封面图 |
| `preload` | `none` / `metadata` / `auto` | 预加载策略 |
| `autoplay` | 布尔 | 自动播放（需配合 `muted`） |
| `muted` | 布尔 | 静音 |
| `loop` | 布尔 | 循环播放 |
| `playsinline` | 布尔 | iOS 内联播放（不全屏） |
| `crossorigin` | `anonymous` / `use-credentials` | 跨域资源策略 |

### preload 策略选择

```html
<!-- 用户很可能播放：预加载全部 -->
<video src="main-video.mp4" preload="auto" controls></video>

<!-- 可能播放：只加载元数据（时长、尺寸） -->
<video src="secondary.mp4" preload="metadata" controls></video>

<!-- 不太会播放：不预加载 -->
<video src="optional.mp4" preload="none" controls poster="thumbnail.jpg"></video>
```

**后端类比**：`preload` ≈ 数据库预热策略，按需决定是否提前加载。

### autoplay 的限制

现代浏览器对自动播放有严格限制（防止骚扰用户）：

```html
<!-- ❌ 有声自动播放：大多数浏览器会阻止 -->
<video src="ad.mp4" autoplay></video>

<!-- ✅ 静音自动播放：浏览器允许 -->
<video src="background.mp4" autoplay muted loop playsinline></video>
```

**规则**：
- 静音视频可自动播放
- 有声视频需要用户交互后才能播放
- 移动端更严格，iOS 还需要 `playsinline` 才能内联播放

## `<audio>` 元素

### 基本用法

```html
<audio src="music.mp3" controls>
  您的浏览器不支持 audio 标签。
</audio>
```

### 完整属性

```html
<audio
  src="podcast.mp3"
  controls
  preload="metadata"
  autoplay
  muted
  loop
  crossorigin="anonymous"
>
</audio>
```

`<audio>` 与 `<video>` 共享大部分属性，区别在于没有 `width`、`height`、`poster`、`playsinline`。

### 实用场景

```html
<!-- 播客播放器 -->
<article>
  <h2>第 42 期：前端工程化</h2>
  <audio src="ep42.mp3" controls preload="metadata"></audio>
  <p>时长：45:30 | 发布：2024-01-15</p>
</article>

<!-- 背景音乐（需用户触发） -->
<button id="play-bgm">播放背景音乐</button>
<audio id="bgm" src="bgm.mp3" loop></audio>

<script>
document.getElementById('play-bgm').addEventListener('click', () => {
  document.getElementById('bgm').play();
});
</script>
```

## 多格式兼容：`<source>` 元素

### 为什么需要多格式

不同浏览器支持的媒体格式不同：

| 格式 | MIME 类型 | Chrome | Firefox | Safari |
|------|----------|--------|---------|--------|
| MP4 (H.264) | `video/mp4` | ✅ | ✅ | ✅ |
| WebM (VP9) | `video/webm` | ✅ | ✅ | ❌ |
| MP3 | `audio/mpeg` | ✅ | ✅ | ✅ |
| OGG Vorbis | `audio/ogg` | ✅ | ✅ | ❌ |
| AAC | `audio/aac` | ✅ | ✅ | ✅ |

### 用法

```html
<!-- 视频多格式 -->
<video controls width="640" height="360" poster="cover.jpg">
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
  <p>您的浏览器不支持 HTML5 视频，<a href="video.mp4">下载视频</a>。</p>
</video>

<!-- 音频多格式 -->
<audio controls>
  <source src="audio.ogg" type="audio/ogg">
  <source src="audio.mp3" type="audio/mpeg">
  <p>您的浏览器不支持 HTML5 音频。</p>
</audio>
```

浏览器从上到下逐个检查 `<source>`，选择第一个能播放的格式。`type` 属性让浏览器无需下载即可判断是否支持，**务必填写**。

### 带编解码器的 type 声明

```html
<video controls>
  <!-- 更精确的 MIME 类型 + 编解码器 -->
  <source src="video.webm" type='video/webm; codecs="vp9, opus"'>
  <source src="video.mp4"  type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'>
</video>
```

## 字幕与无障碍：`<track>` 元素

### 基本用法

```html
<video controls width="640" height="360">
  <source src="lecture.mp4" type="video/mp4">
  
  <!-- 中文字幕（默认） -->
  <track
    kind="subtitles"
    src="subs-zh.vtt"
    srclang="zh"
    label="中文"
    default
  >
  <!-- 英文字幕 -->
  <track
    kind="subtitles"
    src="subs-en.vtt"
    srclang="en"
    label="English"
  >
  <!-- 音频描述（为视觉障碍用户） -->
  <track
    kind="descriptions"
    src="descriptions.vtt"
    srclang="zh"
    label="音频描述"
  >
</video>
```

### track 的 kind 属性

| kind 值 | 用途 |
|---------|------|
| `subtitles` | 字幕（翻译/同语言字幕） |
| `captions` | 隐藏式字幕（含环境音描述，面向听障用户） |
| `descriptions` | 音频描述（面向视障用户） |
| `chapters` | 章节标题（用于媒体导航） |
| `metadata` | 元数据（不显示，供脚本使用） |

### WebVTT 字幕格式

```
WEBVTT

00:00:01.000 --> 00:00:04.000
欢迎来到 HTML 系统化学习课程

00:00:04.500 --> 00:00:08.000
今天我们讲解音视频标签的使用

00:00:08.500 --> 00:00:12.000
首先来看 <b>video</b> 元素的基本结构
```

WebVTT 是纯文本格式，后端可以动态生成（如自动语音转文字后输出 VTT）。

## 自定义播放器控件

原生 `controls` 样式不可定制，实际项目通常隐藏原生控件，用 HTML + CSS 构建自定义 UI。

### HTML 结构

```html
<div class="video-player">
  <!-- 视频元素（隐藏原生控件） -->
  <video id="player" width="640" height="360">
    <source src="video.mp4" type="video/mp4">
  </video>
  
  <!-- 自定义控件层 -->
  <div class="controls">
    <button class="play-btn" aria-label="播放">▶</button>
    
    <div class="progress-bar" role="slider" aria-label="播放进度"
         aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div class="progress-fill"></div>
    </div>
    
    <span class="time-display">
      <span class="current-time">0:00</span>
      /
      <span class="duration">0:00</span>
    </span>
    
    <div class="volume-control">
      <button class="mute-btn" aria-label="静音">🔊</button>
      <input type="range" class="volume-slider" 
             min="0" max="1" step="0.1" value="1"
             aria-label="音量">
    </div>
    
    <button class="fullscreen-btn" aria-label="全屏">⛶</button>
  </div>
</div>
```

### 关键 JavaScript API

```javascript
const video = document.getElementById('player');

// 播放/暂停
video.play();
video.pause();
video.paused;  // boolean

// 时间控制
video.currentTime;     // 当前时间（秒）
video.duration;        // 总时长（秒）
video.currentTime = 30; // 跳转到 30 秒

// 音量
video.volume = 0.5;    // 0~1
video.muted = true;

// 播放速率
video.playbackRate = 1.5;  // 1.5 倍速

// 全屏
video.requestFullscreen();
document.exitFullscreen();

// 核心事件
video.addEventListener('loadedmetadata', () => {
  console.log('时长:', video.duration);
});
video.addEventListener('timeupdate', () => {
  console.log('当前:', video.currentTime);
});
video.addEventListener('ended', () => {
  console.log('播放结束');
});
video.addEventListener('error', (e) => {
  console.error('播放错误:', video.error.code);
});
```

### 可访问性要求

自定义控件必须保证键盘和屏幕阅读器可用：

```html
<!-- 播放按钮 -->
<button class="play-btn" aria-label="播放">▶</button>

<!-- 进度条使用 slider role -->
<div role="slider" tabindex="0"
     aria-label="播放进度"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-valuenow="35"
     aria-valuetext="35%，1分12秒">
</div>
```

## 工程实践

### 场景 1：视频懒加载

```html
<!-- 不预加载，只显示封面 -->
<video
  controls
  preload="none"
  poster="thumbnail.jpg"
  width="640"
  height="360"
>
  <source data-src="video.mp4" type="video/mp4">
</video>
```

```javascript
// Intersection Observer 实现视频懒加载
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const video = entry.target;
      const sources = video.querySelectorAll('source[data-src]');
      sources.forEach(source => {
        source.src = source.dataset.src;
        source.removeAttribute('data-src');
      });
      video.load();
      observer.unobserve(video);
    }
  });
}, { rootMargin: '200px' });

document.querySelectorAll('video').forEach(v => observer.observe(v));
```

### 场景 2：第三方视频嵌入

```html
<!-- YouTube -->
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="视频标题"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  loading="lazy"
></iframe>

<!-- 性能优化：点击后再加载 iframe -->
<div class="video-facade" data-video-id="VIDEO_ID">
  <img src="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg" 
       alt="视频标题" loading="lazy">
  <button aria-label="播放视频">▶</button>
</div>
```

Facade 模式：先展示静态封面图，用户点击后再加载 iframe，避免第三方脚本拖慢页面。

### 场景 3：背景视频

```html
<section class="hero">
  <video
    class="hero-video"
    autoplay
    muted
    loop
    playsinline
    poster="hero-poster.jpg"
  >
    <source src="hero-bg.webm" type="video/webm">
    <source src="hero-bg.mp4" type="video/mp4">
  </video>
  
  <div class="hero-content">
    <h1>产品标题</h1>
    <p>产品描述</p>
  </div>
</section>
```

```css
.hero {
  position: relative;
  overflow: hidden;
}
.hero-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  transform: translate(-50%, -50%);
  object-fit: cover;
}
.hero-content {
  position: relative;
  z-index: 1;
}
```

**注意**：背景视频必须 `autoplay muted`，移动端还需 `playsinline`。同时提供 `poster` 作为视频加载前的静态兜底。

### 场景 4：Media Session API（锁屏控制）

```javascript
// 为音频播放器添加系统级媒体控制
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: '第 42 期：前端工程化',
    artist: '技术播客',
    album: '前端深入系列',
    artwork: [
      { src: 'cover-96.png',  sizes: '96x96',   type: 'image/png' },
      { src: 'cover-256.png', sizes: '256x256', type: 'image/png' },
    ]
  });

  navigator.mediaSession.setActionHandler('play',          () => audio.play());
  navigator.mediaSession.setActionHandler('pause',         () => audio.pause());
  navigator.mediaSession.setActionHandler('seekbackward',  () => { audio.currentTime -= 10; });
  navigator.mediaSession.setActionHandler('seekforward',   () => { audio.currentTime += 10; });
}
```

## 常见误区

### 误区 1：不提供 poster

```html
<!-- ❌ 无 poster：视频加载前一片空白或黑屏 -->
<video src="demo.mp4" controls></video>

<!-- ✅ 提供 poster：加载前展示有意义的封面 -->
<video src="demo.mp4" controls poster="cover.jpg"></video>
```

### 误区 2：忽略 type 属性

```html
<!-- ❌ 无 type：浏览器需要逐个下载尝试 -->
<video controls>
  <source src="video.webm">
  <source src="video.mp4">
</video>

<!-- ✅ 有 type：浏览器直接跳过不支持的格式 -->
<video controls>
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
</video>
```

### 误区 3：自动播放有声视频

```html
<!-- ❌ 会被浏览器阻止 -->
<video src="intro.mp4" autoplay></video>

<!-- ✅ 静音自动播放 -->
<video src="intro.mp4" autoplay muted></video>
```

## 参考资源

- [HTML Living Standard - Media Elements](https://html.spec.whatwg.org/multipage/media.html)
- [MDN - `<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [MDN - `<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio)
- [MDN - WebVTT](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API)
- [Web.dev - Video and Audio](https://web.dev/media/)
- [MDN - Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API)
