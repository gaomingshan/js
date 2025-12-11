# 第 8 章：音频与视频

## 概述

HTML5 引入了原生的音频和视频支持，无需插件即可播放多媒体内容。掌握 `<audio>` 和 `<video>` 标签是现代 Web 开发的重要技能。

## 一、音频标签 `<audio>`

### 1.1 基本用法

```html
<audio src="music.mp3" controls></audio>
```

### 1.2 常用属性

```html
<audio src="music.mp3" 
       controls          <!-- 显示播放控件 -->
       autoplay          <!-- 自动播放 -->
       loop              <!-- 循环播放 -->
       muted             <!-- 静音 -->
       preload="auto">   <!-- 预加载 -->
</audio>
```

**preload 属性：**

| 值 | 说明 |
|---|---|
| `auto` | 预加载整个文件 |
| `metadata` | 仅预加载元数据（时长、比特率等） |
| `none` | 不预加载 |

> **⚠️ 注意**  
> 大多数浏览器限制自动播放，需要用户交互或静音。

### 1.3 多格式支持

```html
<audio controls>
  <source src="music.mp3" type="audio/mpeg">
  <source src="music.ogg" type="audio/ogg">
  <source src="music.wav" type="audio/wav">
  您的浏览器不支持音频播放。
</audio>
```

**常见音频格式：**

| 格式 | MIME 类型 | 浏览器支持 |
|-----|----------|----------|
| **MP3** | `audio/mpeg` | ✅ 所有现代浏览器 |
| **WAV** | `audio/wav` | ✅ 所有现代浏览器 |
| **OGG** | `audio/ogg` | ✅ Firefox、Chrome |
| **AAC** | `audio/aac` | ✅ Safari、Chrome |

## 二、视频标签 `<video>`

### 2.1 基本用法

```html
<video src="movie.mp4" controls width="640" height="360"></video>
```

### 2.2 常用属性

```html
<video src="movie.mp4"
       controls          <!-- 显示控件 -->
       autoplay          <!-- 自动播放 -->
       loop              <!-- 循环播放 -->
       muted             <!-- 静音 -->
       poster="thumb.jpg" <!-- 封面图 -->
       width="640"
       height="360"
       preload="metadata">
</video>
```

### 2.3 多格式支持

```html
<video controls width="640" height="360" poster="poster.jpg">
  <source src="movie.mp4" type="video/mp4">
  <source src="movie.webm" type="video/webm">
  <source src="movie.ogg" type="video/ogg">
  您的浏览器不支持视频播放。
</video>
```

**常见视频格式：**

| 格式 | MIME 类型 | 浏览器支持 |
|-----|----------|----------|
| **MP4** | `video/mp4` | ✅ 所有现代浏览器 |
| **WebM** | `video/webm` | ✅ Chrome、Firefox |
| **Ogg** | `video/ogg` | ✅ Firefox、Chrome |

> **💡 推荐格式**  
> 提供 MP4 和 WebM 两种格式，覆盖所有现代浏览器。

## 三、字幕和多轨道

### 3.1 `<track>` 元素

```html
<video controls>
  <source src="movie.mp4" type="video/mp4">
  
  <!-- 字幕轨道 -->
  <track src="subtitles-zh.vtt" 
         kind="subtitles" 
         srclang="zh" 
         label="中文字幕">
  
  <track src="subtitles-en.vtt" 
         kind="subtitles" 
         srclang="en" 
         label="English"
         default>
</video>
```

### 3.2 track 的 kind 属性

| 值 | 说明 |
|---|---|
| `subtitles` | 字幕（翻译） |
| `captions` | 说明文字（包含音效描述） |
| `descriptions` | 视觉描述（辅助功能） |
| `chapters` | 章节标题 |
| `metadata` | 元数据 |

### 3.3 WebVTT 格式

```vtt
WEBVTT

00:00:00.000 --> 00:00:05.000
这是第一句字幕

00:00:05.000 --> 00:00:10.000
这是第二句字幕
```

## 四、自定义播放器

### 4.1 JavaScript 控制

```html
<video id="myVideo" width="640" height="360">
  <source src="movie.mp4" type="video/mp4">
</video>

<div class="controls">
  <button onclick="playPause()">播放/暂停</button>
  <button onclick="stop()">停止</button>
  <input type="range" id="volume" min="0" max="1" step="0.1" value="1">
</div>

<script>
const video = document.getElementById('myVideo');

function playPause() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

function stop() {
  video.pause();
  video.currentTime = 0;
}

document.getElementById('volume').addEventListener('input', (e) => {
  video.volume = e.target.value;
});

// 监听事件
video.addEventListener('play', () => {
  console.log('视频开始播放');
});

video.addEventListener('pause', () => {
  console.log('视频暂停');
});

video.addEventListener('ended', () => {
  console.log('视频播放结束');
});
</script>
```

### 4.2 常用 API

```javascript
// 播放控制
video.play();
video.pause();

// 属性
video.currentTime = 30;    // 跳转到30秒
video.volume = 0.5;        // 音量50%
video.playbackRate = 1.5;  // 1.5倍速

// 状态
video.paused;              // 是否暂停
video.duration;            // 总时长
video.ended;               // 是否结束

// 事件
video.addEventListener('loadedmetadata', () => {});
video.addEventListener('canplay', () => {});
video.addEventListener('timeupdate', () => {});
video.addEventListener('ended', () => {});
```

## 五、响应式视频

### 5.1 宽度自适应

```html
<video controls class="responsive-video">
  <source src="movie.mp4" type="video/mp4">
</video>

<style>
.responsive-video {
  max-width: 100%;
  height: auto;
}
</style>
```

### 5.2 保持宽高比

```html
<div class="video-container">
  <video controls>
    <source src="movie.mp4" type="video/mp4">
  </video>
</div>

<style>
.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 比例 */
  height: 0;
  overflow: hidden;
}

.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
```

## 六、嵌入第三方视频

### 6.1 YouTube

```html
<iframe width="560" 
        height="315" 
        src="https://www.youtube.com/embed/VIDEO_ID" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
</iframe>
```

### 6.2 响应式嵌入

```html
<div class="video-wrapper">
  <iframe src="https://www.youtube.com/embed/VIDEO_ID" 
          frameborder="0" 
          allowfullscreen>
  </iframe>
</div>

<style>
.video-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
```

## 七、性能优化

### 7.1 懒加载

```html
<!-- 视频懒加载 -->
<video controls preload="none" poster="poster.jpg">
  <source src="movie.mp4" type="video/mp4">
</video>
```

### 7.2 自动播放优化

```html
<!-- 自动播放必须静音 -->
<video autoplay muted loop playsinline>
  <source src="background.mp4" type="video/mp4">
</video>
```

> **📌 自动播放政策**
> 
> - 必须静音（`muted`）
> - 移动端需要 `playsinline`
> - 用户交互后才能播放有声视频

### 7.3 压缩和格式

```html
<!-- 提供多种格式和质量 -->
<video controls>
  <source src="movie-1080p.mp4" type="video/mp4" media="(min-width: 1920px)">
  <source src="movie-720p.mp4" type="video/mp4" media="(min-width: 1280px)">
  <source src="movie-480p.mp4" type="video/mp4">
</video>
```

## 八、可访问性

### 8.1 提供字幕

```html
<video controls>
  <source src="movie.mp4" type="video/mp4">
  <track src="captions.vtt" kind="captions" srclang="zh" label="中文" default>
</video>
```

### 8.2 音频描述

```html
<video controls>
  <source src="movie.mp4" type="video/mp4">
  <track src="descriptions.vtt" kind="descriptions" srclang="zh" label="音频描述">
</video>
```

### 8.3 键盘控制

原生控件支持键盘操作：
- 空格：播放/暂停
- ←/→：后退/前进
- ↑/↓：音量调整

## 九、实战示例

### 9.1 背景视频

```html
<div class="hero">
  <video autoplay muted loop playsinline class="hero-video">
    <source src="background.mp4" type="video/mp4">
    <source src="background.webm" type="video/webm">
  </video>
  
  <div class="hero-content">
    <h1>欢迎来到我们的网站</h1>
  </div>
</div>

<style>
.hero {
  position: relative;
  height: 100vh;
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
  z-index: -1;
}

.hero-content {
  position: relative;
  z-index: 1;
  color: white;
  text-align: center;
  padding-top: 40vh;
}
</style>
```

### 9.2 视频画廊

```html
<div class="video-gallery">
  <div class="video-item">
    <video controls poster="thumb1.jpg">
      <source src="video1.mp4" type="video/mp4">
    </video>
    <h3>视频标题1</h3>
  </div>
  
  <div class="video-item">
    <video controls poster="thumb2.jpg">
      <source src="video2.mp4" type="video/mp4">
    </video>
    <h3>视频标题2</h3>
  </div>
</div>
```

## 参考资料

- [MDN - `<audio>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/audio)
- [MDN - `<video>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video)
- [MDN - HTMLMediaElement API](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement)
- [WebVTT 规范](https://www.w3.org/TR/webvtt1/)

---

**上一章** ← [第 7 章：图片处理](./07-images.md)  
**下一章** → [第 9 章：Canvas 绘图](./09-canvas.md)
