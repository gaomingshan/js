# 第 8 章：音频与视频 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 基础标签

### 题目
HTML5 中播放视频使用哪个标签？

**A.** `<video>` | **B.** `<media>` | **C.** `<movie>` | **D.** `<play>`

<details><summary>查看答案</summary>

### ✅ 答案：A

```html
<video src="video.mp4" controls></video>
```
</details>

---

## 第 2 题 🟢 | 音频标签

### 题目
`<audio>` 和 `<video>` 标签都支持 `controls` 属性。

**A.** ✅ 正确 | **B.** ❌ 错误

<details><summary>查看答案</summary>

### ✅ 答案：A（正确）

```html
<audio src="audio.mp3" controls></audio>
<video src="video.mp4" controls></video>
```
</details>

---

## 第 3 题 🟢 | 多格式支持

### 题目
为什么需要提供多种视频格式？

**A.** 提高画质 | **B.** 浏览器兼容性 | **C.** 减小文件大小 | **D.** 加快加载速度

<details><summary>查看答案</summary>

### ✅ 答案：B

```html
<video controls>
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
  您的浏览器不支持视频播放。
</video>
```

**格式支持：**
- WebM：Chrome、Firefox
- MP4：所有现代浏览器
- Ogg：Firefox、Chrome
</details>

---

## 第 4 题 🟡 | 常用属性

### 题目
以下哪些是 `<video>` 的有效属性？

**A.** `autoplay` | **B.** `loop` | **C.** `muted` | **D.** `poster`

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C, D（全部正确）

```html
<video 
  src="video.mp4"
  controls
  autoplay
  loop
  muted
  poster="poster.jpg"
  width="640"
  height="360">
</video>
```

**属性说明：**
- `controls`：显示控制栏
- `autoplay`：自动播放
- `loop`：循环播放
- `muted`：静音
- `poster`：封面图
- `preload`：预加载策略
</details>

---

## 第 5 题 🟡 | preload 属性

### 题目
`preload` 属性的三个值分别代表什么？

```html
<video preload="____">
```

**A.** `none`, `metadata`, `auto` | **B.** `no`, `yes`, `auto`  
**C.** `false`, `true`, `auto` | **D.** `lazy`, `eager`, `auto`

<details><summary>查看答案</summary>

### ✅ 答案：A

```html
<!-- 不预加载 -->
<video preload="none" src="video.mp4" controls></video>

<!-- 仅加载元数据（时长、尺寸） -->
<video preload="metadata" src="video.mp4" controls></video>

<!-- 预加载整个视频 -->
<video preload="auto" src="video.mp4" controls></video>
```

**使用建议：**
- `none`：节省带宽
- `metadata`：平衡性能
- `auto`：预期用户会播放
</details>

---

## 第 6 题 🟡 | 字幕

### 题目
如何为视频添加字幕？

**A.** `<caption>` | **B.** `<track>` | **C.** `<subtitle>` | **D.** `<cc>`

<details><summary>查看答案</summary>

### ✅ 答案：B

```html
<video controls>
  <source src="video.mp4" type="video/mp4">
  
  <!-- 字幕 -->
  <track 
    kind="subtitles" 
    src="subtitles-zh.vtt" 
    srclang="zh" 
    label="中文"
    default>
  
  <track 
    kind="subtitles" 
    src="subtitles-en.vtt" 
    srclang="en" 
    label="English">
</video>
```

**kind 类型：**
- `subtitles`：字幕
- `captions`：字幕（听障）
- `descriptions`：音频描述
- `chapters`：章节
- `metadata`：元数据
</details>

---

## 第 7 题 🟡 | 自动播放限制

### 题目
现代浏览器对自动播放有何限制？

**A.** 完全禁止 | **B.** 必须静音 | **C.** 需要用户交互 | **D.** B 或 C

<details><summary>查看答案</summary>

### ✅ 答案：D

```html
<!-- ✅ 允许：静音自动播放 -->
<video autoplay muted loop playsinline>
  <source src="bg-video.mp4">
</video>

<!-- ❌ 可能被阻止：有声自动播放 -->
<video autoplay controls>
  <source src="video.mp4">
</video>
```

**自动播放策略：**
1. 静音视频可以自动播放
2. 有声视频需要用户交互
3. 移动端使用 `playsinline`

```javascript
// 检测是否允许自动播放
video.play().then(() => {
  console.log('自动播放成功');
}).catch(err => {
  console.log('自动播放被阻止');
  // 显示播放按钮
});
```
</details>

---

## 第 8 题 🔴 | JavaScript 控制

### 题目
补全代码实现自定义视频播放器。

```html
<video id="myVideo">
  <source src="video.mp4">
</video>
<button id="playBtn">播放</button>
```

<details><summary>查看答案</summary>

### ✅ 答案

```javascript
const video = document.getElementById('myVideo');
const playBtn = document.getElementById('playBtn');

playBtn.addEventListener('click', () => {
  if (video.paused) {
    video.play();
    playBtn.textContent = '暂停';
  } else {
    video.pause();
    playBtn.textContent = '播放';
  }
});

// 监听播放事件
video.addEventListener('play', () => {
  console.log('开始播放');
});

video.addEventListener('pause', () => {
  console.log('暂停播放');
});

video.addEventListener('ended', () => {
  console.log('播放结束');
  playBtn.textContent = '播放';
});
```

**完整自定义播放器：**

```html
<div class="video-player">
  <video id="video">
    <source src="video.mp4">
  </video>
  
  <div class="controls">
    <button id="playPause">▶️</button>
    <input type="range" id="progress" min="0" max="100" value="0">
    <span id="time">0:00 / 0:00</span>
    <input type="range" id="volume" min="0" max="100" value="100">
    <button id="fullscreen">全屏</button>
  </div>
</div>

<script>
const video = document.getElementById('video');
const playPause = document.getElementById('playPause');
const progress = document.getElementById('progress');
const timeDisplay = document.getElementById('time');
const volume = document.getElementById('volume');
const fullscreen = document.getElementById('fullscreen');

// 播放/暂停
playPause.onclick = () => {
  if (video.paused) {
    video.play();
    playPause.textContent = '⏸️';
  } else {
    video.pause();
    playPause.textContent = '▶️';
  }
};

// 进度条
video.ontimeupdate = () => {
  const percent = (video.currentTime / video.duration) * 100;
  progress.value = percent;
  
  const current = formatTime(video.currentTime);
  const total = formatTime(video.duration);
  timeDisplay.textContent = `${current} / ${total}`;
};

progress.oninput = () => {
  const time = (progress.value / 100) * video.duration;
  video.currentTime = time;
};

// 音量
volume.oninput = () => {
  video.volume = volume.value / 100;
};

// 全屏
fullscreen.onclick = () => {
  if (video.requestFullscreen) {
    video.requestFullscreen();
  }
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
</script>
```
</details>

---

## 第 9 题 🔴 | 视频优化

### 题目
关于视频性能优化，以下说法正确的是？

**A.** 使用适当的编码格式  
**B.** 设置合理的分辨率和比特率  
**C.** 使用 CDN 分发  
**D.** 提供多种格式

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C, D（全部正确）

**1. 编码格式**
```html
<video controls>
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
</video>
```

**2. 分辨率**
- 移动端：480p
- 桌面端：720p/1080p
- 根据网络自适应

**3. CDN**
```html
<video src="https://cdn.example.com/video.mp4" controls></video>
```

**4. 预加载策略**
```html
<!-- 非关键视频 -->
<video preload="none" controls>
  <source src="video.mp4">
</video>
```

**5. 懒加载**
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const video = entry.target;
      video.src = video.dataset.src;
      video.load();
      observer.unobserve(video);
    }
  });
});

document.querySelectorAll('video[data-src]').forEach(video => {
  observer.observe(video);
});
```

**6. 背景视频优化**
```html
<!-- 静音、循环、自动播放 -->
<video 
  autoplay 
  muted 
  loop 
  playsinline
  poster="poster.jpg">
  <source src="bg-video.mp4">
</video>
```
</details>

---

## 第 10 题 🔴 | 响应式视频

### 题目
创建一个 16:9 比例的响应式视频容器。

<details><summary>查看答案</summary>

### 📖 解析

**方法1：aspect-ratio（现代）**

```html
<div class="video-container">
  <video controls>
    <source src="video.mp4">
  </video>
</div>

<style>
.video-container {
  width: 100%;
  max-width: 800px;
}

.video-container video {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;
}
</style>
```

**方法2：padding-bottom（兼容）**

```html
<div class="video-wrapper">
  <video controls>
    <source src="video.mp4">
  </video>
</div>

<style>
.video-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 = 9/16 = 0.5625 */
  height: 0;
  overflow: hidden;
}

.video-wrapper video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
```

**方法3：iframe（YouTube/Vimeo）**

```html
<div class="embed-container">
  <iframe 
    src="https://www.youtube.com/embed/VIDEO_ID" 
    frameborder="0" 
    allowfullscreen>
  </iframe>
</div>

<style>
.embed-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
}

.embed-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
```

**常用比例：**
- 16:9 = 56.25%
- 4:3 = 75%
- 21:9 = 42.86%
</details>

---

**📌 本章总结**

- `<video>` 和 `<audio>` 支持多格式
- 常用属性：`controls`、`autoplay`、`loop`、`muted`
- `<track>` 添加字幕
- 自动播放需静音或用户交互
- JavaScript 可完全控制播放
- 性能优化：预加载策略、CDN、格式选择
- 响应式：`aspect-ratio` 或 `padding-bottom`

**上一章** ← [第 7 章：图片处理](./chapter-07.md)  
**下一章** → [第 9 章：Canvas 绘图](./chapter-09.md)
