// 第27章：多媒体控制 - 面试题
window.htmlQuizData_27 = {
    config: {
        title: "多媒体控制",
        icon: "🎬",
        description: "测试你对HTML5音视频API的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["audio", "video", "基础"],
            question: "HTML5的audio和video元素的基本属性？",
            type: "multiple-choice",
            options: [
                "controls显示控制条",
                "autoplay自动播放",
                "loop循环播放",
                "muted静音"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "音视频基础",
                description: "HTML5原生的音视频支持。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<!-- audio元素 -->\n<audio controls>\n  <source src="audio.mp3" type="audio/mpeg">\n  <source src="audio.ogg" type="audio/ogg">\n  您的浏览器不支持audio标签\n</audio>\n\n<!-- video元素 -->\n<video width="640" height="360" controls>\n  <source src="video.mp4" type="video/mp4">\n  <source src="video.webm" type="video/webm">\n  您的浏览器不支持video标签\n</video>\n\n/* 常用属性 */\ncontrols   - 显示播放控制条\nautoplay   - 自动播放\nloop       - 循环播放\nmuted      - 静音\npreload    - 预加载（none/metadata/auto）\nposter     - 视频封面图（仅video）',
                        content: "基本的音视频标签。"
                    },
                    {
                        title: "多格式支持",
                        code: '<!-- 提供多种格式以兼容不同浏览器 -->\n<video controls>\n  <source src="video.mp4" type="video/mp4">\n  <source src="video.webm" type="video/webm">\n  <source src="video.ogv" type="video/ogg">\n</video>\n\n/* 视频格式支持 */\nMP4 (H.264)  - 所有现代浏览器\nWebM (VP8/VP9) - Chrome, Firefox, Opera\nOgg (Theora) - Firefox, Opera\n\n/* 音频格式支持 */\nMP3  - 所有现代浏览器\nAAC  - 大多数浏览器\nOgg  - Firefox, Opera\nWAV  - 大多数浏览器',
                        content: "多格式兼容性。"
                    }
                ]
            },
            source: "HTML5 Media"
        },
        {
            difficulty: "medium",
            tags: ["JavaScript", "控制"],
            question: "如何用JavaScript控制视频播放？",
            type: "multiple-choice",
            options: [
                "play()播放",
                "pause()暂停",
                "load()重新加载",
                "currentTime跳转"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "JavaScript控制",
                description: "通过API控制音视频播放。",
                sections: [
                    {
                        title: "基本控制",
                        code: 'const video = document.querySelector("video");\n\n/* 播放控制 */\nvideo.play();   // 播放（返回Promise）\nvideo.pause();  // 暂停\nvideo.load();   // 重新加载\n\n// play()返回Promise\nvideo.play()\n  .then(() => {\n    console.log("开始播放");\n  })\n  .catch(error => {\n    console.error("播放失败:", error);\n  });\n\n/* 音量控制 */\nvideo.volume = 0.5;     // 0.0 - 1.0\nvideo.muted = true;     // 静音/取消静音\n\n/* 播放速度 */\nvideo.playbackRate = 1.0;  // 正常\nvideo.playbackRate = 2.0;  // 2倍速\nvideo.playbackRate = 0.5;  // 慢放',
                        content: "基本的播放控制API。"
                    },
                    {
                        title: "时间控制",
                        code: '/* 获取和设置播放位置 */\nconst video = document.querySelector("video");\n\n// 获取当前时间\nconsole.log(video.currentTime);  // 秒\n\n// 跳转到指定时间\nvideo.currentTime = 30;  // 跳到30秒\n\n// 获取总时长\nconsole.log(video.duration);  // 秒\n\n// 计算进度\nconst progress = (video.currentTime / video.duration) * 100;\nconsole.log(`播放进度: ${progress.toFixed(2)}%`);\n\n/* 格式化时间 */\nfunction formatTime(seconds) {\n  const h = Math.floor(seconds / 3600);\n  const m = Math.floor((seconds % 3600) / 60);\n  const s = Math.floor(seconds % 60);\n  \n  return [\n    h > 0 ? h : null,\n    m.toString().padStart(2, "0"),\n    s.toString().padStart(2, "0")\n  ].filter(Boolean).join(":");\n}\n\nconsole.log(formatTime(125));  // "2:05"',
                        content: "时间和进度控制。"
                    },
                    {
                        title: "状态检查",
                        code: 'const video = document.querySelector("video");\n\n/* 播放状态 */\nvideo.paused       // 是否暂停\nvideo.ended        // 是否结束\nvideo.seeking      // 是否正在跳转\nvideo.duration     // 总时长\nvideo.currentTime  // 当前时间\n\n/* 就绪状态 */\nvideo.readyState\n// 0 = HAVE_NOTHING      无信息\n// 1 = HAVE_METADATA    元数据已加载\n// 2 = HAVE_CURRENT_DATA 当前帧可用\n// 3 = HAVE_FUTURE_DATA  可以播放\n// 4 = HAVE_ENOUGH_DATA  足够数据\n\n/* 网络状态 */\nvideo.networkState\n// 0 = NETWORK_EMPTY     未初始化\n// 1 = NETWORK_IDLE      空闲\n// 2 = NETWORK_LOADING   加载中\n// 3 = NETWORK_NO_SOURCE 无资源',
                        content: "检查视频状态。"
                    }
                ]
            },
            source: "HTMLMediaElement"
        },
        {
            difficulty: "medium",
            tags: ["事件", "监听"],
            question: "视频播放的重要事件有哪些？",
            type: "multiple-choice",
            options: [
                "play/pause播放暂停",
                "timeupdate时间更新",
                "ended播放结束",
                "error播放错误"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "媒体事件",
                description: "监听视频播放的各种事件。",
                sections: [
                    {
                        title: "播放事件",
                        code: 'const video = document.querySelector("video");\n\n/* 播放相关 */\nvideo.addEventListener("play", () => {\n  console.log("开始播放");\n});\n\nvideo.addEventListener("pause", () => {\n  console.log("暂停");\n});\n\nvideo.addEventListener("ended", () => {\n  console.log("播放结束");\n});\n\nvideo.addEventListener("playing", () => {\n  console.log("正在播放");\n});\n\nvideo.addEventListener("waiting", () => {\n  console.log("等待数据");\n});',
                        content: "播放状态事件。"
                    },
                    {
                        title: "进度事件",
                        code: '/* 时间更新 */\nvideo.addEventListener("timeupdate", () => {\n  const percent = (video.currentTime / video.duration) * 100;\n  console.log(`进度: ${percent.toFixed(2)}%`);\n  updateProgressBar(percent);\n});\n\n/* 加载进度 */\nvideo.addEventListener("progress", () => {\n  if (video.buffered.length > 0) {\n    const buffered = video.buffered.end(0);\n    const percent = (buffered / video.duration) * 100;\n    console.log(`已缓冲: ${percent.toFixed(2)}%`);\n  }\n});\n\n/* 跳转事件 */\nvideo.addEventListener("seeking", () => {\n  console.log("开始跳转");\n});\n\nvideo.addEventListener("seeked", () => {\n  console.log("跳转完成");\n});',
                        content: "进度相关事件。"
                    },
                    {
                        title: "加载和错误事件",
                        code: '/* 加载事件 */\nvideo.addEventListener("loadstart", () => {\n  console.log("开始加载");\n});\n\nvideo.addEventListener("loadedmetadata", () => {\n  console.log("元数据加载完成");\n  console.log("时长:", video.duration);\n  console.log("尺寸:", video.videoWidth, "x", video.videoHeight);\n});\n\nvideo.addEventListener("loadeddata", () => {\n  console.log("首帧加载完成");\n});\n\nvideo.addEventListener("canplay", () => {\n  console.log("可以播放");\n});\n\nvideo.addEventListener("canplaythrough", () => {\n  console.log("可以流畅播放");\n});\n\n/* 错误处理 */\nvideo.addEventListener("error", (e) => {\n  console.error("播放错误");\n  \n  const error = video.error;\n  switch(error.code) {\n    case error.MEDIA_ERR_ABORTED:\n      console.error("播放被中止");\n      break;\n    case error.MEDIA_ERR_NETWORK:\n      console.error("网络错误");\n      break;\n    case error.MEDIA_ERR_DECODE:\n      console.error("解码错误");\n      break;\n    case error.MEDIA_ERR_SRC_NOT_SUPPORTED:\n      console.error("不支持的格式");\n      break;\n  }\n});',
                        content: "加载和错误事件。"
                    }
                ]
            },
            source: "Media Events"
        },
        {
            difficulty: "hard",
            tags: ["自定义播放器", "UI"],
            question: "如何创建自定义视频播放器？",
            type: "multiple-choice",
            options: [
                "隐藏原生controls",
                "自定义UI控件",
                "监听事件更新UI",
                "实现播放控制"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "自定义播放器",
                description: "从零实现视频播放器。",
                sections: [
                    {
                        title: "HTML结构",
                        code: '<!-- 自定义播放器 -->\n<div class="video-player">\n  <video id="video" width="640" height="360">\n    <source src="video.mp4" type="video/mp4">\n  </video>\n  \n  <div class="controls">\n    <button id="playPause">▶</button>\n    <input type="range" id="progress" min="0" max="100" value="0">\n    <span id="time">0:00 / 0:00</span>\n    <input type="range" id="volume" min="0" max="100" value="100">\n    <button id="fullscreen">⛶</button>\n  </div>\n</div>\n\n<style>\n.video-player {\n  position: relative;\n  max-width: 640px;\n}\n\nvideo {\n  width: 100%;\n  display: block;\n}\n\n.controls {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px;\n  background: rgba(0,0,0,0.7);\n  color: white;\n}\n\nbutton {\n  background: none;\n  border: none;\n  color: white;\n  font-size: 20px;\n  cursor: pointer;\n}\n\ninput[type="range"] {\n  flex: 1;\n}\n</style>',
                        content: "播放器结构。"
                    },
                    {
                        title: "JavaScript实现",
                        code: 'class VideoPlayer {\n  constructor(videoElement) {\n    this.video = videoElement;\n    this.playPauseBtn = document.getElementById("playPause");\n    this.progressBar = document.getElementById("progress");\n    this.timeDisplay = document.getElementById("time");\n    this.volumeBar = document.getElementById("volume");\n    this.fullscreenBtn = document.getElementById("fullscreen");\n    \n    this.init();\n  }\n  \n  init() {\n    // 播放/暂停\n    this.playPauseBtn.addEventListener("click", () => {\n      if (this.video.paused) {\n        this.video.play();\n        this.playPauseBtn.textContent = "⏸";\n      } else {\n        this.video.pause();\n        this.playPauseBtn.textContent = "▶";\n      }\n    });\n    \n    // 进度条\n    this.video.addEventListener("timeupdate", () => {\n      const percent = (this.video.currentTime / this.video.duration) * 100;\n      this.progressBar.value = percent;\n      this.updateTimeDisplay();\n    });\n    \n    this.progressBar.addEventListener("input", (e) => {\n      const time = (e.target.value / 100) * this.video.duration;\n      this.video.currentTime = time;\n    });\n    \n    // 音量\n    this.volumeBar.addEventListener("input", (e) => {\n      this.video.volume = e.target.value / 100;\n    });\n    \n    // 全屏\n    this.fullscreenBtn.addEventListener("click", () => {\n      if (this.video.requestFullscreen) {\n        this.video.requestFullscreen();\n      } else if (this.video.webkitRequestFullscreen) {\n        this.video.webkitRequestFullscreen();\n      }\n    });\n    \n    // 空格键播放/暂停\n    document.addEventListener("keydown", (e) => {\n      if (e.code === "Space") {\n        e.preventDefault();\n        this.playPauseBtn.click();\n      }\n    });\n  }\n  \n  updateTimeDisplay() {\n    const current = this.formatTime(this.video.currentTime);\n    const duration = this.formatTime(this.video.duration);\n    this.timeDisplay.textContent = `${current} / ${duration}`;\n  }\n  \n  formatTime(seconds) {\n    if (isNaN(seconds)) return "0:00";\n    const m = Math.floor(seconds / 60);\n    const s = Math.floor(seconds % 60);\n    return `${m}:${s.toString().padStart(2, "0")}`;\n  }\n}\n\n// 初始化\nconst player = new VideoPlayer(document.getElementById("video"));',
                        content: "完整的播放器实现。"
                    }
                ]
            },
            source: "Custom Video Player"
        },
        {
            difficulty: "medium",
            tags: ["格式检测", "canPlayType"],
            question: "如何检测浏览器支持的视频格式？",
            type: "single-choice",
            options: [
                "使用canPlayType()方法",
                "检查navigator对象",
                "尝试播放",
                "查看User-Agent"
            ],
            correctAnswer: "A",
            explanation: {
                title: "格式检测",
                description: "检测浏览器对媒体格式的支持。",
                sections: [
                    {
                        title: "canPlayType方法",
                        code: 'const video = document.createElement("video");\n\n/* 检测视频格式 */\nconst mp4 = video.canPlayType("video/mp4");\nconst webm = video.canPlayType("video/webm");\nconst ogg = video.canPlayType("video/ogg");\n\nconsole.log("MP4:", mp4);    // "probably" 或 "maybe" 或 ""\nconsole.log("WebM:", webm);\nconsole.log("Ogg:", ogg);\n\n/* 返回值 */\n"" - 不支持\n"maybe" - 可能支持\n"probably" - 很可能支持\n\n/* 带编解码器检测 */\nconst h264 = video.canPlayType(\'video/mp4; codecs="avc1.42E01E"\');\nconst vp9 = video.canPlayType(\'video/webm; codecs="vp9"\');\n\nconsole.log("H.264:", h264);\nconsole.log("VP9:", vp9);',
                        content: "检测格式支持。"
                    },
                    {
                        title: "选择最佳格式",
                        code: '/* 根据支持情况选择格式 */\nfunction getBestVideoFormat() {\n  const video = document.createElement("video");\n  \n  const formats = [\n    { type: "video/webm; codecs=vp9", src: "video.webm" },\n    { type: "video/mp4; codecs=avc1", src: "video.mp4" },\n    { type: "video/ogg", src: "video.ogv" }\n  ];\n  \n  for (const format of formats) {\n    const support = video.canPlayType(format.type);\n    if (support === "probably" || support === "maybe") {\n      return format.src;\n    }\n  }\n  \n  return null;\n}\n\n// 使用\nconst videoSrc = getBestVideoFormat();\nif (videoSrc) {\n  document.querySelector("video").src = videoSrc;\n} else {\n  console.error("不支持任何视频格式");\n}',
                        content: "智能选择格式。"
                    }
                ]
            },
            source: "canPlayType"
        },
        {
            difficulty: "hard",
            tags: ["画中画", "PiP"],
            question: "如何实现画中画（Picture-in-Picture）功能？",
            type: "multiple-choice",
            options: [
                "requestPictureInPicture()",
                "exitPictureInPicture()",
                "监听PiP事件",
                "检查支持性"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "画中画模式",
                description: "视频的画中画功能。",
                sections: [
                    {
                        title: "基本用法",
                        code: 'const video = document.querySelector("video");\n\n/* 进入画中画 */\nasync function enterPiP() {\n  try {\n    if (document.pictureInPictureEnabled) {\n      await video.requestPictureInPicture();\n      console.log("进入画中画");\n    } else {\n      console.log("不支持画中画");\n    }\n  } catch (error) {\n    console.error("画中画失败:", error);\n  }\n}\n\n/* 退出画中画 */\nasync function exitPiP() {\n  if (document.pictureInPictureElement) {\n    await document.exitPictureInPicture();\n    console.log("退出画中画");\n  }\n}\n\n/* 切换画中画 */\nasync function togglePiP() {\n  if (document.pictureInPictureElement) {\n    await exitPiP();\n  } else {\n    await enterPiP();\n  }\n}',
                        content: "进入和退出画中画。"
                    },
                    {
                        title: "事件监听",
                        code: '/* 监听画中画事件 */\nvideo.addEventListener("enterpictureinpicture", () => {\n  console.log("进入画中画");\n  pipButton.textContent = "退出画中画";\n});\n\nvideo.addEventListener("leavepictureinpicture", () => {\n  console.log("离开画中画");\n  pipButton.textContent = "画中画";\n});\n\n/* 检查当前状态 */\nif (document.pictureInPictureElement === video) {\n  console.log("当前在画中画模式");\n}\n\n/* 完整实现 */\nconst pipButton = document.getElementById("pipButton");\n\npipButton.addEventListener("click", async () => {\n  try {\n    if (document.pictureInPictureElement) {\n      await document.exitPictureInPicture();\n    } else {\n      await video.requestPictureInPicture();\n    }\n  } catch (error) {\n    console.error("PiP错误:", error);\n  }\n});',
                        content: "事件处理。"
                    },
                    {
                        title: "浏览器支持",
                        code: '/* 检查支持性 */\nif ("pictureInPictureEnabled" in document) {\n  console.log("支持画中画");\n} else {\n  console.log("不支持画中画");\n  pipButton.style.display = "none";\n}\n\n/* 浏览器支持 */\nChrome 70+\nEdge 79+\nSafari 13.1+\nOpera 57+\n\n/* 不支持 */\nFirefox (开发中)\nIE (不支持)',
                        content: "兼容性检查。"
                    }
                ]
            },
            source: "Picture-in-Picture API"
        },
        {
            difficulty: "medium",
            tags: ["字幕", "track"],
            question: "如何为视频添加字幕？",
            type: "multiple-choice",
            options: [
                "使用<track>元素",
                "WebVTT格式",
                "kind属性指定类型",
                "JavaScript控制显示"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "视频字幕",
                description: "添加和控制视频字幕。",
                sections: [
                    {
                        title: "添加字幕",
                        code: '<!-- 视频字幕 -->\n<video controls>\n  <source src="video.mp4" type="video/mp4">\n  \n  <!-- 字幕轨道 -->\n  <track kind="subtitles" \n         src="subtitles_zh.vtt" \n         srclang="zh" \n         label="中文"\n         default>\n  \n  <track kind="subtitles" \n         src="subtitles_en.vtt" \n         srclang="en" \n         label="English">\n  \n  <!-- 描述轨道 -->\n  <track kind="descriptions" \n         src="descriptions.vtt" \n         srclang="zh">\n</video>\n\n/* kind属性 */\nsubtitles     - 字幕\ncaptions      - 说明文字（含音效）\ndescriptions  - 视频描述\nchapters      - 章节标题\nmetadata      - 元数据',
                        content: "track元素添加字幕。"
                    },
                    {
                        title: "WebVTT格式",
                        code: '/* subtitles.vtt */\nWEBVTT\n\n00:00:00.000 --> 00:00:03.000\n欢迎观看本视频\n\n00:00:03.500 --> 00:00:07.000\n这是第二段字幕\n\n00:00:07.500 --> 00:00:10.000 align:start\n<i>斜体字幕</i>\n\n00:00:10.500 --> 00:00:15.000 position:50% align:middle\n<b>居中加粗</b>\n\n/* 样式标签 */\n<b>加粗</b>\n<i>斜体</i>\n<u>下划线</u>\n<c>类名</c>\n<v Speaker>说话者</v>',
                        content: "WebVTT字幕格式。"
                    },
                    {
                        title: "JavaScript控制",
                        code: 'const video = document.querySelector("video");\nconst tracks = video.textTracks;\n\n/* 获取字幕轨道 */\nfor (let track of tracks) {\n  console.log("语言:", track.language);\n  console.log("标签:", track.label);\n  console.log("类型:", track.kind);\n}\n\n/* 显示/隐藏字幕 */\nconst subtitleTrack = tracks[0];\nsubtitleTrack.mode = "showing";  // 显示\nsubtitleTrack.mode = "hidden";   // 隐藏\nsubtitleTrack.mode = "disabled"; // 禁用\n\n/* 监听字幕变化 */\nsubtitleTrack.addEventListener("cuechange", () => {\n  const cues = subtitleTrack.activeCues;\n  if (cues.length > 0) {\n    console.log("当前字幕:", cues[0].text);\n  }\n});\n\n/* 切换字幕语言 */\nfunction switchSubtitle(lang) {\n  for (let track of tracks) {\n    if (track.kind === "subtitles") {\n      track.mode = track.language === lang ? "showing" : "hidden";\n    }\n  }\n}',
                        content: "JavaScript控制字幕。"
                    }
                ]
            },
            source: "TextTrack API"
        },
        {
            difficulty: "hard",
            tags: ["视频截图", "canvas"],
            question: "如何截取视频的当前帧？",
            type: "single-choice",
            options: [
                "使用canvas绘制视频",
                "使用toDataURL()",
                "使用snapshot API",
                "无法实现"
            ],
            correctAnswer: "A",
            explanation: {
                title: "视频截图",
                description: "从视频中截取图片。",
                sections: [
                    {
                        title: "基本实现",
                        code: '/* 截取当前帧 */\nfunction captureFrame(video) {\n  const canvas = document.createElement("canvas");\n  canvas.width = video.videoWidth;\n  canvas.height = video.videoHeight;\n  \n  const ctx = canvas.getContext("2d");\n  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);\n  \n  return canvas.toDataURL("image/png");\n}\n\n// 使用\nconst video = document.querySelector("video");\nconst screenshot = captureFrame(video);\n\n// 显示截图\nconst img = document.createElement("img");\nimg.src = screenshot;\ndocument.body.appendChild(img);\n\n// 或下载\nconst link = document.createElement("a");\nlink.href = screenshot;\nlink.download = "screenshot.png";\nlink.click();',
                        content: "截取视频帧。"
                    },
                    {
                        title: "完整功能",
                        code: 'class VideoCapture {\n  constructor(video) {\n    this.video = video;\n    this.canvas = document.createElement("canvas");\n    this.ctx = this.canvas.getContext("2d");\n  }\n  \n  capture(format = "image/png", quality = 0.92) {\n    this.canvas.width = this.video.videoWidth;\n    this.canvas.height = this.video.videoHeight;\n    \n    this.ctx.drawImage(\n      this.video, \n      0, 0, \n      this.canvas.width, \n      this.canvas.height\n    );\n    \n    return this.canvas.toDataURL(format, quality);\n  }\n  \n  download(filename = "capture.png") {\n    const dataUrl = this.capture();\n    const link = document.createElement("a");\n    link.href = dataUrl;\n    link.download = filename;\n    link.click();\n  }\n  \n  async toBlob(format = "image/png", quality = 0.92) {\n    this.canvas.width = this.video.videoWidth;\n    this.canvas.height = this.video.videoHeight;\n    \n    this.ctx.drawImage(\n      this.video,\n      0, 0,\n      this.canvas.width,\n      this.canvas.height\n    );\n    \n    return new Promise(resolve => {\n      this.canvas.toBlob(resolve, format, quality);\n    });\n  }\n}\n\n// 使用\nconst capture = new VideoCapture(video);\n\n// 截图并显示\nconst img = capture.capture();\ndocument.getElementById("preview").src = img;\n\n// 下载\ncapture.download("screenshot.png");\n\n// 获取Blob\nconst blob = await capture.toBlob();\n// 上传到服务器\nconst formData = new FormData();\nformData.append("screenshot", blob);\nfetch("/upload", { method: "POST", body: formData });',
                        content: "封装截图功能。"
                    }
                ]
            },
            source: "Canvas API"
        },
        {
            difficulty: "medium",
            tags: ["Media Session", "通知"],
            question: "Media Session API的作用？",
            type: "multiple-choice",
            options: [
                "显示媒体通知",
                "控制锁屏播放",
                "处理硬件按键",
                "显示封面和标题"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Media Session API",
                description: "控制系统级媒体通知和控制。",
                sections: [
                    {
                        title: "设置元数据",
                        code: '/* 设置媒体信息 */\nif ("mediaSession" in navigator) {\n  navigator.mediaSession.metadata = new MediaMetadata({\n    title: "歌曲标题",\n    artist: "艺术家",\n    album: "专辑名称",\n    artwork: [\n      { \n        src: "cover-96.png", \n        sizes: "96x96", \n        type: "image/png" \n      },\n      { \n        src: "cover-256.png", \n        sizes: "256x256", \n        type: "image/png" \n      },\n      { \n        src: "cover-512.png", \n        sizes: "512x512", \n        type: "image/png" \n      }\n    ]\n  });\n}',
                        content: "设置媒体元数据。"
                    },
                    {
                        title: "处理控制",
                        code: '/* 处理媒体控制按钮 */\nconst audio = document.querySelector("audio");\n\nnavigator.mediaSession.setActionHandler("play", () => {\n  audio.play();\n});\n\nnavigator.mediaSession.setActionHandler("pause", () => {\n  audio.pause();\n});\n\nnavigator.mediaSession.setActionHandler("seekbackward", () => {\n  audio.currentTime = Math.max(audio.currentTime - 10, 0);\n});\n\nnavigator.mediaSession.setActionHandler("seekforward", () => {\n  audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);\n});\n\nnavigator.mediaSession.setActionHandler("previoustrack", () => {\n  playPreviousSong();\n});\n\nnavigator.mediaSession.setActionHandler("nexttrack", () => {\n  playNextSong();\n});',
                        content: "处理系统控制。"
                    },
                    {
                        title: "完整音乐播放器",
                        code: 'class MusicPlayer {\n  constructor() {\n    this.audio = document.querySelector("audio");\n    this.playlist = [];\n    this.currentIndex = 0;\n    this.init();\n  }\n  \n  init() {\n    if ("mediaSession" in navigator) {\n      this.setupMediaSession();\n    }\n  }\n  \n  setupMediaSession() {\n    const ms = navigator.mediaSession;\n    \n    ms.setActionHandler("play", () => this.play());\n    ms.setActionHandler("pause", () => this.pause());\n    ms.setActionHandler("previoustrack", () => this.previous());\n    ms.setActionHandler("nexttrack", () => this.next());\n    ms.setActionHandler("seekto", (details) => {\n      this.audio.currentTime = details.seekTime;\n    });\n  }\n  \n  play() {\n    this.audio.play();\n    this.updateMetadata();\n  }\n  \n  pause() {\n    this.audio.pause();\n  }\n  \n  next() {\n    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;\n    this.loadTrack();\n    this.play();\n  }\n  \n  previous() {\n    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;\n    this.loadTrack();\n    this.play();\n  }\n  \n  loadTrack() {\n    const track = this.playlist[this.currentIndex];\n    this.audio.src = track.src;\n  }\n  \n  updateMetadata() {\n    const track = this.playlist[this.currentIndex];\n    \n    navigator.mediaSession.metadata = new MediaMetadata({\n      title: track.title,\n      artist: track.artist,\n      album: track.album,\n      artwork: track.artwork\n    });\n  }\n}',
                        content: "音乐播放器集成。"
                    }
                ]
            },
            source: "Media Session API"
        },
        {
            difficulty: "easy",
            tags: ["性能", "优化"],
            question: "视频性能优化的方法？",
            type: "multiple-choice",
            options: [
                "使用preload控制预加载",
                "懒加载视频",
                "使用poster占位",
                "适配不同网络"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "视频优化",
                description: "优化视频加载和播放性能。",
                sections: [
                    {
                        title: "预加载策略",
                        code: '<!-- 不预加载 -->\n<video preload="none">\n  <!-- 节省带宽，点击时加载 -->\n</video>\n\n<!-- 只加载元数据 -->\n<video preload="metadata">\n  <!-- 加载时长、尺寸等信息 -->\n</video>\n\n<!-- 自动预加载 -->\n<video preload="auto">\n  <!-- 尽可能多地预加载 -->\n</video>\n\n/* 根据场景选择 */\n// 首屏视频: preload="auto"\n// 下方视频: preload="none" + 懒加载\n// 缩略图: preload="metadata"',
                        content: "预加载控制。"
                    },
                    {
                        title: "懒加载",
                        code: '/* Intersection Observer懒加载 */\nconst videos = document.querySelectorAll("video[data-src]");\n\nconst observer = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      const video = entry.target;\n      video.src = video.dataset.src;\n      video.load();\n      observer.unobserve(video);\n    }\n  });\n});\n\nvideos.forEach(video => observer.observe(video));\n\n<!-- HTML -->\n<video data-src="video.mp4" poster="poster.jpg"></video>',
                        content: "视频懒加载。"
                    },
                    {
                        title: "其他优化",
                        code: '/* 1. 使用poster */\n<video poster="poster.jpg">\n  <!-- 显示封面，减少首帧渲染 -->\n</video>\n\n/* 2. 压缩视频 */\n- 使用H.264编码\n- 适当降低码率\n- 裁剪到合适尺寸\n\n/* 3. 流媒体 */\n// 使用HLS或DASH\n<video>\n  <source src="video.m3u8" type="application/x-mpegURL">\n</video>\n\n/* 4. CDN */\n<video>\n  <source src="https://cdn.example.com/video.mp4">\n</video>\n\n/* 5. 根据网络调整质量 */\nconst connection = navigator.connection;\nif (connection) {\n  const effectiveType = connection.effectiveType;\n  \n  switch(effectiveType) {\n    case "4g":\n      video.src = "video-hd.mp4";\n      break;\n    case "3g":\n      video.src = "video-sd.mp4";\n      break;\n    default:\n      video.src = "video-low.mp4";\n  }\n}',
                        content: "综合优化策略。"
                    }
                ]
            },
            source: "Performance"
        }
    ],
    navigation: {
        prev: { title: "地理定位", url: "26-geolocation-quiz.html" },
        next: { title: "离线应用", url: "28-offline-quiz.html" }
    }
};
