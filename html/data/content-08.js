// 第8章：音频与视频 - 内容数据
window.htmlContentData_08 = {
    section: {
        title: "音频与视频",
        icon: "🎬"
    },
    topics: [
        {
            type: "concept",
            title: "HTML5音视频元素概述",
            content: {
                description: "HTML5引入了原生的<audio>和<video>元素，使得在网页中嵌入音视频内容变得简单，无需依赖Flash等插件。",
                keyPoints: [
                    "<audio>用于嵌入音频内容",
                    "<video>用于嵌入视频内容",
                    "支持多种格式和编解码器",
                    "提供JavaScript API进行控制",
                    "内置播放控件（controls属性）",
                    "支持字幕、多音轨等高级功能"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video"
            }
        },
        {
            type: "code-example",
            title: "<video>元素基础",
            content: {
                description: "学习video元素的基本用法和常用属性。",
                examples: [
                    {
                        title: "基本视频",
                        code: `<!-- 最简单的视频 -->
<video src="movie.mp4" controls></video>

<!-- 指定尺寸 -->
<video src="movie.mp4" 
       controls 
       width="640" 
       height="360">
</video>

<!-- 完整属性 -->
<video src="movie.mp4"
       controls
       width="800"
       height="450"
       poster="thumbnail.jpg"
       preload="metadata">
    您的浏览器不支持video标签。
</video>`,
                        notes: "controls显示播放控件，poster设置预览图"
                    },
                    {
                        title: "video常用属性",
                        code: `<video 
    src="movie.mp4"
    
    <!-- 显示控件 -->
    controls
    
    <!-- 自动播放（需谨慎使用） -->
    autoplay
    
    <!-- 静音（autoplay通常需要配合muted） -->
    muted
    
    <!-- 循环播放 -->
    loop
    
    <!-- 预览图 -->
    poster="poster.jpg"
    
    <!-- 预加载策略 -->
    preload="metadata"
    
    <!-- 内联播放（iOS） -->
    playsinline
    
    <!-- 尺寸 -->
    width="800"
    height="450">
    
    您的浏览器不支持HTML5视频。
</video>`,
                        notes: "根据需求选择合适的属性"
                    },
                    {
                        title: "preload属性详解",
                        code: `<!-- none: 不预加载任何数据 -->
<video src="movie.mp4" 
       controls 
       preload="none">
</video>

<!-- metadata: 预加载元数据（时长、尺寸等） -->
<video src="movie.mp4" 
       controls 
       preload="metadata">
</video>

<!-- auto: 预加载整个视频（默认） -->
<video src="movie.mp4" 
       controls 
       preload="auto">
</video>

<!-- 空字符串等同于auto -->
<video src="movie.mp4" 
       controls 
       preload="">
</video>`,
                        notes: "preload控制预加载行为，影响性能"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "多格式支持 - <source>元素",
            content: {
                description: "使用<source>元素提供多种格式，确保跨浏览器兼容性。",
                examples: [
                    {
                        title: "视频格式回退",
                        code: `<video controls width="800" height="450" poster="poster.jpg">
    <!-- WebM格式（Chrome, Firefox） -->
    <source src="movie.webm" type="video/webm">
    
    <!-- MP4格式（Safari, Edge） -->
    <source src="movie.mp4" type="video/mp4">
    
    <!-- Ogg格式（Firefox） -->
    <source src="movie.ogv" type="video/ogg">
    
    <!-- 回退内容 -->
    <p>
        您的浏览器不支持HTML5视频。
        <a href="movie.mp4">下载视频</a>
    </p>
</video>`,
                        notes: "浏览器会选择第一个支持的格式"
                    },
                    {
                        title: "指定编解码器",
                        code: `<video controls width="800">
    <!-- H.264视频 + AAC音频 -->
    <source src="movie.mp4" 
            type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'>
    
    <!-- VP9视频 + Opus音频 -->
    <source src="movie.webm" 
            type='video/webm; codecs="vp9, opus"'>
    
    <!-- VP8视频 + Vorbis音频 -->
    <source src="movie.webm" 
            type='video/webm; codecs="vp8, vorbis"'>
</video>`,
                        notes: "指定codecs帮助浏览器更准确地选择"
                    },
                    {
                        title: "推荐的视频格式",
                        code: `<!-- 推荐配置：WebM + MP4 -->
<video controls width="800" poster="poster.jpg">
    <!-- 现代浏览器 - WebM (VP9) -->
    <source src="movie.webm" type="video/webm">
    
    <!-- 兼容性 - MP4 (H.264) -->
    <source src="movie.mp4" type="video/mp4">
    
    您的浏览器不支持视频播放。
</video>

<!-- 格式说明：
     - WebM (VP9): 开源，压缩率高，质量好
     - MP4 (H.264): 兼容性最好
     - 建议同时提供两种格式
-->`,
                        notes: "WebM + MP4组合兼容性最好"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<audio>元素",
            content: {
                description: "<audio>元素用于嵌入音频内容，用法与video类似。",
                examples: [
                    {
                        title: "基本音频",
                        code: `<!-- 简单音频 -->
<audio src="music.mp3" controls></audio>

<!-- 完整属性 -->
<audio 
    src="music.mp3"
    controls
    autoplay
    loop
    muted
    preload="auto">
    您的浏览器不支持audio标签。
</audio>`,
                        notes: "audio和video的属性基本相同"
                    },
                    {
                        title: "音频格式回退",
                        code: `<audio controls>
    <!-- Opus格式（最优） -->
    <source src="audio.opus" type="audio/opus">
    
    <!-- Ogg Vorbis格式 -->
    <source src="audio.ogg" type="audio/ogg">
    
    <!-- MP3格式（最佳兼容性） -->
    <source src="audio.mp3" type="audio/mpeg">
    
    <!-- WAV格式（无损但文件大） -->
    <source src="audio.wav" type="audio/wav">
    
    您的浏览器不支持音频播放。
    <a href="audio.mp3">下载音频</a>
</audio>`,
                        notes: "推荐提供Opus和MP3格式"
                    },
                    {
                        title: "实际应用示例",
                        code: `<!-- 背景音乐 -->
<audio autoplay loop muted id="bgMusic">
    <source src="background.mp3" type="audio/mpeg">
</audio>

<!-- 音效 -->
<audio id="clickSound">
    <source src="click.mp3" type="audio/mpeg">
</audio>

<script>
    document.querySelector('button').addEventListener('click', () => {
        document.getElementById('clickSound').play();
    });
</script>

<!-- 播客播放器 -->
<audio controls preload="metadata">
    <source src="podcast-episode-01.mp3" type="audio/mpeg">
    您的浏览器不支持音频播放。
</audio>`,
                        notes: "根据用途选择合适的属性"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "字幕和多音轨 - <track>元素",
            content: {
                description: "<track>元素为视频添加字幕、说明文字或其他时间相关的文本内容。",
                examples: [
                    {
                        title: "添加字幕",
                        code: `<video controls width="800">
    <source src="movie.mp4" type="video/mp4">
    
    <!-- 中文字幕（默认） -->
    <track kind="subtitles" 
           src="subtitles-zh.vtt" 
           srclang="zh" 
           label="中文"
           default>
    
    <!-- 英文字幕 -->
    <track kind="subtitles" 
           src="subtitles-en.vtt" 
           srclang="en" 
           label="English">
    
    <!-- 日文字幕 -->
    <track kind="subtitles" 
           src="subtitles-ja.vtt" 
           srclang="ja" 
           label="日本語">
</video>`,
                        notes: "字幕文件使用WebVTT格式（.vtt）"
                    },
                    {
                        title: "track的kind属性",
                        code: `<video controls width="800">
    <source src="movie.mp4" type="video/mp4">
    
    <!-- subtitles: 字幕（翻译对话） -->
    <track kind="subtitles" 
           src="subtitles.vtt" 
           srclang="zh" 
           label="中文字幕">
    
    <!-- captions: 隐藏式字幕（包含音效描述） -->
    <track kind="captions" 
           src="captions.vtt" 
           srclang="zh" 
           label="完整字幕">
    
    <!-- descriptions: 视频描述（为视障用户） -->
    <track kind="descriptions" 
           src="descriptions.vtt" 
           srclang="zh">
    
    <!-- chapters: 章节标记 -->
    <track kind="chapters" 
           src="chapters.vtt" 
           srclang="zh">
    
    <!-- metadata: 元数据 -->
    <track kind="metadata" 
           src="metadata.vtt">
</video>`,
                        notes: "不同kind用于不同目的"
                    },
                    {
                        title: "WebVTT文件格式示例",
                        code: `<!-- subtitles.vtt 文件内容 -->
WEBVTT

00:00:00.000 --> 00:00:02.000
欢迎观看本视频教程

00:00:02.500 --> 00:00:05.000
今天我们将学习HTML5视频

00:00:05.500 --> 00:00:08.000
让我们开始吧

<!-- 带样式的字幕 -->
00:00:10.000 --> 00:00:12.000
<c.highlight>重要内容</c>会被高亮显示

<!-- 带位置的字幕 -->
00:00:15.000 --> 00:00:17.000 line:90% position:50%
底部居中的字幕`,
                        notes: "WebVTT支持时间戳和样式"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "JavaScript媒体API",
            content: {
                description: "使用JavaScript API可以完全控制音视频的播放。",
                examples: [
                    {
                        title: "基本播放控制",
                        code: `<video id="myVideo" width="800">
    <source src="movie.mp4" type="video/mp4">
</video>

<button onclick="playVideo()">播放</button>
<button onclick="pauseVideo()">暂停</button>
<button onclick="stopVideo()">停止</button>

<script>
    const video = document.getElementById('myVideo');
    
    function playVideo() {
        video.play();
    }
    
    function pauseVideo() {
        video.pause();
    }
    
    function stopVideo() {
        video.pause();
        video.currentTime = 0;
    }
</script>`,
                        notes: "play()和pause()是最基本的方法"
                    },
                    {
                        title: "控制音量和播放速度",
                        code: `<video id="video" src="movie.mp4" controls></video>

<label>
    音量: <input type="range" 
                 id="volumeSlider" 
                 min="0" max="1" 
                 step="0.1" 
                 value="1">
</label>

<label>
    速度: <select id="speedSelect">
        <option value="0.5">0.5x</option>
        <option value="1" selected>1x</option>
        <option value="1.5">1.5x</option>
        <option value="2">2x</option>
    </select>
</label>

<script>
    const video = document.getElementById('video');
    
    // 控制音量
    document.getElementById('volumeSlider')
        .addEventListener('input', (e) => {
            video.volume = e.target.value;
        });
    
    // 控制速度
    document.getElementById('speedSelect')
        .addEventListener('change', (e) => {
            video.playbackRate = e.target.value;
        });
</script>`,
                        notes: "volume范围0-1，playbackRate控制速度"
                    },
                    {
                        title: "监听媒体事件",
                        code: `<video id="video" src="movie.mp4" controls></video>
<div id="status"></div>

<script>
    const video = document.getElementById('video');
    const status = document.getElementById('status');
    
    // 开始播放
    video.addEventListener('play', () => {
        status.textContent = '正在播放';
    });
    
    // 暂停
    video.addEventListener('pause', () => {
        status.textContent = '已暂停';
    });
    
    // 播放结束
    video.addEventListener('ended', () => {
        status.textContent = '播放结束';
    });
    
    // 时间更新
    video.addEventListener('timeupdate', () => {
        const current = Math.floor(video.currentTime);
        const duration = Math.floor(video.duration);
        status.textContent = \`\${current} / \${duration} 秒\`;
    });
    
    // 加载元数据
    video.addEventListener('loadedmetadata', () => {
        console.log('视频时长:', video.duration);
        console.log('视频尺寸:', video.videoWidth, 'x', video.videoHeight);
    });
    
    // 缓冲进度
    video.addEventListener('progress', () => {
        if (video.buffered.length > 0) {
            const buffered = video.buffered.end(0);
            console.log('已缓冲:', buffered);
        }
    });
</script>`,
                        notes: "媒体元素提供丰富的事件"
                    },
                    {
                        title: "自定义播放器",
                        code: `<div class="video-player">
    <video id="customVideo" width="800">
        <source src="movie.mp4" type="video/mp4">
    </video>
    
    <div class="controls">
        <button id="playPauseBtn">▶️</button>
        <input type="range" id="seekBar" value="0">
        <span id="timeDisplay">0:00 / 0:00</span>
        <button id="muteBtn">🔊</button>
        <button id="fullscreenBtn">⛶</button>
    </div>
</div>

<script>
    const video = document.getElementById('customVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const seekBar = document.getElementById('seekBar');
    const timeDisplay = document.getElementById('timeDisplay');
    const muteBtn = document.getElementById('muteBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    // 播放/暂停
    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPauseBtn.textContent = '⏸️';
        } else {
            video.pause();
            playPauseBtn.textContent = '▶️';
        }
    });
    
    // 进度条
    video.addEventListener('timeupdate', () => {
        const percent = (video.currentTime / video.duration) * 100;
        seekBar.value = percent;
        
        const current = formatTime(video.currentTime);
        const duration = formatTime(video.duration);
        timeDisplay.textContent = \`\${current} / \${duration}\`;
    });
    
    seekBar.addEventListener('input', () => {
        const time = (seekBar.value / 100) * video.duration;
        video.currentTime = time;
    });
    
    // 静音
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? '🔇' : '🔊';
    });
    
    // 全屏
    fullscreenBtn.addEventListener('click', () => {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        }
    });
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
    }
</script>`,
                        notes: "可以创建完全自定义的播放器界面"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "音视频使用最佳实践",
            content: {
                description: "遵循这些最佳实践可以提供更好的媒体体验：",
                practices: [
                    {
                        title: "提供多种格式",
                        description: "确保跨浏览器兼容性。",
                        example: `<!-- 视频：WebM + MP4 -->
<video controls>
    <source src="video.webm" type="video/webm">
    <source src="video.mp4" type="video/mp4">
</video>

<!-- 音频：Opus + MP3 -->
<audio controls>
    <source src="audio.opus" type="audio/opus">
    <source src="audio.mp3" type="audio/mpeg">
</audio>`
                    },
                    {
                        title: "使用poster和preload优化加载",
                        description: "改善初始加载体验。",
                        example: `<video 
    controls
    poster="thumbnail.jpg"
    preload="metadata"
    width="800"
    height="450">
    <source src="video.mp4" type="video/mp4">
</video>`
                    },
                    {
                        title: "谨慎使用autoplay",
                        description: "自动播放要配合muted使用。",
                        example: `<!-- ✅ 可接受：静音自动播放 -->
<video autoplay muted loop playsinline>
    <source src="background.mp4" type="video/mp4">
</video>

<!-- ❌ 不好：有声自动播放 -->
<video autoplay>
    <source src="video.mp4" type="video/mp4">
</video>`
                    },
                    {
                        title: "添加字幕提高可访问性",
                        description: "为视频提供字幕和说明。",
                        example: `<video controls>
    <source src="video.mp4" type="video/mp4">
    <track kind="subtitles" 
           src="zh.vtt" 
           srclang="zh" 
           label="中文"
           default>
    <track kind="captions" 
           src="en.vtt" 
           srclang="en" 
           label="English">
</video>`
                    },
                    {
                        title: "提供回退内容",
                        description: "为不支持的浏览器提供替代方案。",
                        example: `<video controls>
    <source src="video.mp4" type="video/mp4">
    <p>
        您的浏览器不支持HTML5视频。
        <a href="video.mp4">下载视频</a>
    </p>
</video>`
                    },
                    {
                        title: "优化视频文件",
                        description: "压缩和优化媒体文件。",
                        example: `<!-- 建议：
     - 使用合适的分辨率（720p/1080p）
     - 压缩视频（H.264/VP9）
     - 控制比特率（视频: 2-5 Mbps）
     - 使用流式传输（HLS/DASH）
     - 考虑使用CDN
-->`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "音视频检查清单",
            content: {
                description: "使用这个清单确保音视频的正确实现：",
                items: [
                    { id: "check8-1", text: "提供了多种格式以确保兼容性" },
                    { id: "check8-2", text: "视频设置了poster预览图" },
                    { id: "check8-3", text: "使用了合适的preload策略" },
                    { id: "check8-4", text: "autoplay配合muted使用" },
                    { id: "check8-5", text: "提供了字幕文件（如需要）" },
                    { id: "check8-6", text: "提供了回退内容" },
                    { id: "check8-7", text: "视频文件已优化压缩" },
                    { id: "check8-8", text: "移动端视频添加了playsinline" },
                    { id: "check8-9", text: "为自定义控件添加了键盘支持" },
                    { id: "check8-10", text: "测试了在不同浏览器的播放效果" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "图片处理", url: "content.html?chapter=07" },
        next: { title: "iframe与嵌入内容", url: "content.html?chapter=09" }
    }
};
