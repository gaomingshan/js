// 第8章：多媒体标签 - 面试题
window.htmlQuizData_08 = {
    config: {
        title: "多媒体标签",
        icon: "🎬",
        description: "测试你对HTML音视频标签的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["video标签", "基础"],
            question: "<video>标签的基本属性有哪些？",
            type: "multiple-choice",
            options: [
                "src - 视频源",
                "controls - 显示控制条",
                "autoplay - 自动播放",
                "loop - 循环播放"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<video>标签属性",
                description: "HTML5提供了原生的视频播放支持。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<video src="movie.mp4" controls width="640" height="360">\n  您的浏览器不支持video标签。\n</video>',
                        points: [
                            "src：视频文件路径",
                            "controls：显示播放控制条",
                            "width/height：视频尺寸",
                            "回退内容：不支持video时显示"
                        ]
                    },
                    {
                        title: "常用属性",
                        code: '<video src="video.mp4"\n       controls\n       autoplay\n       muted\n       loop\n       poster="thumbnail.jpg"\n       preload="metadata"\n       width="640"\n       height="360">\n</video>',
                        points: [
                            "autoplay：自动播放",
                            "muted：静音",
                            "loop：循环播放",
                            "poster：封面图",
                            "preload：预加载策略"
                        ]
                    },
                    {
                        title: "preload属性",
                        code: '<!-- 不预加载 -->\n<video src="video.mp4" controls preload="none"></video>\n\n<!-- 只加载元数据 -->\n<video src="video.mp4" controls preload="metadata"></video>\n\n<!-- 加载整个视频 -->\n<video src="video.mp4" controls preload="auto"></video>',
                        points: [
                            "none：不预加载",
                            "metadata：只加载元数据（时长、尺寸）",
                            "auto：浏览器决定",
                            "默认：metadata"
                        ]
                    },
                    {
                        title: "多个视频源",
                        code: '<video controls width="640" height="360">\n  <source src="video.webm" type="video/webm">\n  <source src="video.mp4" type="video/mp4">\n  <source src="video.ogv" type="video/ogg">\n  您的浏览器不支持video标签。\n</video>',
                        content: "提供多种格式，浏览器选择第一个支持的。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["autoplay", "用户体验"],
            question: "autoplay自动播放的限制是什么？",
            options: [
                "必须静音才能自动播放",
                "用户必须与页面交互过",
                "某些浏览器完全禁止autoplay",
                "没有任何限制"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "Autoplay自动播放策略",
                description: "浏览器对自动播放有严格的限制。",
                sections: [
                    {
                        title: "基本规则",
                        code: '<!-- 不行：有声音的自动播放 -->\n<video src="video.mp4" autoplay></video>\n\n<!-- 可以：静音的自动播放 -->\n<video src="video.mp4" autoplay muted></video>',
                        points: [
                            "有声视频：通常被阻止",
                            "静音视频：通常允许",
                            "用户交互后：可以取消静音",
                            "不同浏览器策略不同"
                        ]
                    },
                    {
                        title: "Chrome的Autoplay策略",
                        points: [
                            "静音视频：允许autoplay",
                            "有声视频：用户必须先与页面交互",
                            "MEI（Media Engagement Index）：根据用户媒体使用习惯决定",
                            "用户可以在设置中控制autoplay"
                        ]
                    },
                    {
                        title: "检测Autoplay是否成功",
                        code: 'const video = document.querySelector("video");\n\nvideo.play().then(() => {\n  console.log("自动播放成功");\n}).catch((error) => {\n  console.log("自动播放被阻止:", error);\n  // 显示播放按钮提示用户\n  showPlayButton();\n});',
                        content: "使用Promise检测播放是否成功。"
                    },
                    {
                        title: "最佳实践",
                        code: '<!-- 推荐：静音 + 提供取消静音按钮 -->\n<video src="video.mp4" autoplay muted loop playsinline></video>\n<button id="unmute">开启声音</button>\n\n<script>\ndocument.getElementById("unmute").onclick = () => {\n  video.muted = false;\n};\n</script>',
                        points: [
                            "默认静音autoplay",
                            "提供明显的取消静音按钮",
                            "不要突然播放声音",
                            "考虑用户体验"
                        ]
                    },
                    {
                        title: "移动端特殊处理",
                        code: '<!-- iOS需要playsinline -->\n<video src="video.mp4" \n       autoplay \n       muted \n       playsinline>  <!-- 内联播放，不全屏 -->\n</video>',
                        content: "iOS Safari需要playsinline才能内联播放。"
                    }
                ]
            },
            source: "Chrome Autoplay Policy"
        },
        {
            difficulty: "medium",
            tags: ["audio标签", "音频"],
            question: "<audio>标签与<video>有什么区别？",
            options: [
                "audio用于音频，video用于视频",
                "audio没有width/height属性",
                "audio没有poster属性",
                "使用方式基本相同"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<audio>标签",
                description: "audio标签用于嵌入音频内容。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<audio src="music.mp3" controls>\n  您的浏览器不支持audio标签。\n</audio>\n\n<!-- 多个音频源 -->\n<audio controls>\n  <source src="music.ogg" type="audio/ogg">\n  <source src="music.mp3" type="audio/mpeg">\n  不支持audio标签。\n</audio>',
                        points: [
                            "类似video标签",
                            "没有视觉尺寸",
                            "显示为音频控制条"
                        ]
                    },
                    {
                        title: "共同属性",
                        code: '<audio src="music.mp3"\n       controls\n       autoplay\n       muted\n       loop\n       preload="metadata">\n</audio>',
                        points: [
                            "controls：显示控制条",
                            "autoplay：自动播放（同样有限制）",
                            "loop：循环播放",
                            "preload：预加载策略",
                            "muted：静音"
                        ]
                    },
                    {
                        title: "独有限制",
                        code: '<!-- audio没有这些属性 -->\n<audio src="music.mp3"\n       controls\n       width="300"      <!-- 无效 -->\n       height="50"      <!-- 无效 -->\n       poster="..."     <!-- 无效 -->\n       playsinline>     <!-- 无效 -->\n</audio>',
                        points: [
                            "无width/height",
                            "无poster",
                            "无playsinline",
                            "控制条样式由浏览器决定"
                        ]
                    },
                    {
                        title: "自定义音频播放器",
                        code: '<audio id="myAudio" src="music.mp3"></audio>\n\n<div class="custom-player">\n  <button id="play">▶</button>\n  <button id="pause">⏸</button>\n  <input type="range" id="progress" min="0" max="100" value="0">\n  <span id="time">0:00 / 0:00</span>\n</div>\n\n<script>\nconst audio = document.getElementById("myAudio");\nconst play = document.getElementById("play");\nconst pause = document.getElementById("pause");\n\nplay.onclick = () => audio.play();\npause.onclick = () => audio.pause();\n\naudio.ontimeupdate = () => {\n  const percent = (audio.currentTime / audio.duration) * 100;\n  progress.value = percent;\n};\n</script>',
                        content: "可以完全自定义音频播放器界面。"
                    },
                    {
                        title: "音频格式",
                        points: [
                            "MP3：最广泛支持",
                            "AAC：高质量，iOS首选",
                            "OGG Vorbis：开源格式",
                            "WAV：无损，体积大",
                            "FLAC：无损压缩，支持有限"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["track标签", "字幕"],
            question: "<track>标签的用途是什么？",
            type: "multiple-choice",
            options: [
                "为视频添加字幕",
                "支持多语言字幕",
                "可以添加章节标记",
                "提供视频描述"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<track>标签 - 字幕和时间文本",
                description: "track标签为视频提供字幕、标题、描述等时间同步文本。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<video src="movie.mp4" controls>\n  <track kind="subtitles" \n         src="subtitles-zh.vtt" \n         srclang="zh" \n         label="中文"\n         default>\n  <track kind="subtitles"\n         src="subtitles-en.vtt"\n         srclang="en"\n         label="English">\n</video>',
                        points: [
                            "kind：轨道类型",
                            "src：VTT文件路径",
                            "srclang：语言代码",
                            "label：显示给用户的标签",
                            "default：默认启用"
                        ]
                    },
                    {
                        title: "kind属性类型",
                        code: '<!-- 字幕（翻译对话） -->\n<track kind="subtitles" src="sub.vtt" srclang="zh" label="中文字幕">\n\n<!-- 说明（听力障碍辅助） -->\n<track kind="captions" src="cap.vtt" srclang="zh" label="中文说明">\n\n<!-- 描述（视力障碍辅助） -->\n<track kind="descriptions" src="desc.vtt" srclang="zh" label="视频描述">\n\n<!-- 章节 -->\n<track kind="chapters" src="chapters.vtt" srclang="zh" label="章节">\n\n<!-- 元数据 -->\n<track kind="metadata" src="meta.vtt">',
                        points: [
                            "subtitles：字幕（翻译）",
                            "captions：说明（包含声音效果）",
                            "descriptions：描述（盲人辅助）",
                            "chapters：章节导航",
                            "metadata：脚本使用的数据"
                        ]
                    },
                    {
                        title: "VTT文件格式",
                        code: 'WEBVTT\n\n00:00:00.000 --> 00:00:05.000\n这是第一句字幕\n\n00:00:05.500 --> 00:00:10.000\n这是第二句字幕\n\n00:00:10.500 --> 00:00:15.000 position:50% line:10%\n这是带样式的字幕\n\nNOTE 这是注释',
                        points: [
                            "WEBVTT文件头",
                            "时间范围",
                            "字幕文本",
                            "可以设置位置和样式",
                            "支持注释"
                        ]
                    },
                    {
                        title: "章节导航",
                        code: '<!-- chapters.vtt -->\nWEBVTT\n\n00:00:00.000 --> 00:05:00.000\n第一章：介绍\n\n00:05:00.000 --> 00:15:00.000\n第二章：基础知识\n\n00:15:00.000 --> 00:30:00.000\n第三章：高级技巧\n\n<!-- HTML -->\n<video src="tutorial.mp4" controls>\n  <track kind="chapters" src="chapters.vtt" srclang="zh" default>\n</video>\n\n<script>\nconst track = video.textTracks[0];\ntrack.addEventListener("cuechange", () => {\n  const cue = track.activeCues[0];\n  console.log("当前章节:", cue.text);\n});\n</script>',
                        content: "章节轨道可以用于视频导航。"
                    },
                    {
                        title: "JavaScript API",
                        code: 'const video = document.querySelector("video");\nconst tracks = video.textTracks;\n\n// 监听轨道加载\ntracks[0].addEventListener("load", () => {\n  console.log("字幕加载完成");\n});\n\n// 监听cue变化\ntracks[0].addEventListener("cuechange", () => {\n  const activeCues = tracks[0].activeCues;\n  for (let cue of activeCues) {\n    console.log(cue.text);  // 当前字幕文本\n  }\n});\n\n// 启用/禁用轨道\ntracks[0].mode = "showing";  // showing | hidden | disabled',
                        content: "可以通过JavaScript控制字幕轨道。"
                    },
                    {
                        title: "可访问性",
                        points: [
                            "captions对听力障碍者至关重要",
                            "descriptions对视力障碍者很重要",
                            "提供多语言字幕",
                            "符合WCAG可访问性标准",
                            "法律要求：某些国家要求视频必须有字幕"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["Media API", "JavaScript"],
            question: "HTMLMediaElement有哪些重要的API？",
            type: "multiple-choice",
            options: [
                "play()和pause()方法",
                "currentTime和duration属性",
                "事件监听（play、pause、ended等）",
                "playbackRate控制播放速度"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Media API详解",
                description: "video和audio都继承自HTMLMediaElement。",
                sections: [
                    {
                        title: "播放控制",
                        code: 'const video = document.querySelector("video");\n\n// 播放（返回Promise）\nvideo.play().then(() => {\n  console.log("播放开始");\n}).catch(error => {\n  console.log("播放失败:", error);\n});\n\n// 暂停\nvideo.pause();\n\n// 加载\nvideo.load();  // 重新加载视频',
                        points: [
                            "play()：开始播放",
                            "pause()：暂停",
                            "load()：重新加载",
                            "play()返回Promise"
                        ]
                    },
                    {
                        title: "时间控制",
                        code: '// 当前播放时间（秒）\nvideo.currentTime = 30;  // 跳转到30秒\nconsole.log(video.currentTime);\n\n// 总时长\nconsole.log(video.duration);\n\n// 已缓冲的时间范围\nfor (let i = 0; i < video.buffered.length; i++) {\n  console.log(\n    "缓冲区", i,\n    "从", video.buffered.start(i),\n    "到", video.buffered.end(i)\n  );\n}',
                        points: [
                            "currentTime：当前时间（可读写）",
                            "duration：总时长（只读）",
                            "buffered：已缓冲范围"
                        ]
                    },
                    {
                        title: "播放状态",
                        code: '// 是否暂停\nif (video.paused) {\n  video.play();\n} else {\n  video.pause();\n}\n\n// 是否结束\nif (video.ended) {\n  video.currentTime = 0;\n  video.play();\n}\n\n// 准备状态\nswitch (video.readyState) {\n  case 0: console.log("HAVE_NOTHING"); break;\n  case 1: console.log("HAVE_METADATA"); break;\n  case 2: console.log("HAVE_CURRENT_DATA"); break;\n  case 3: console.log("HAVE_FUTURE_DATA"); break;\n  case 4: console.log("HAVE_ENOUGH_DATA"); break;\n}',
                        points: [
                            "paused：是否暂停",
                            "ended：是否结束",
                            "readyState：准备状态",
                            "seeking：是否正在跳转"
                        ]
                    },
                    {
                        title: "音量和播放速度",
                        code: '// 音量（0.0 - 1.0）\nvideo.volume = 0.5;\n\n// 静音\nvideo.muted = true;\n\n// 播放速度\nvideo.playbackRate = 1.5;  // 1.5倍速\nvideo.playbackRate = 0.5;  // 0.5倍速\n\n// 默认播放速度\nvideo.defaultPlaybackRate = 1.0;',
                        points: [
                            "volume：音量（0-1）",
                            "muted：是否静音",
                            "playbackRate：当前播放速度",
                            "defaultPlaybackRate：默认速度"
                        ]
                    },
                    {
                        title: "常用事件",
                        code: 'const video = document.querySelector("video");\n\n// 播放开始\nvideo.addEventListener("play", () => {\n  console.log("开始播放");\n});\n\n// 暂停\nvideo.addEventListener("pause", () => {\n  console.log("暂停");\n});\n\n// 播放结束\nvideo.addEventListener("ended", () => {\n  console.log("播放结束");\n});\n\n// 时间更新\nvideo.addEventListener("timeupdate", () => {\n  console.log("当前时间:", video.currentTime);\n});\n\n// 元数据加载完成\nvideo.addEventListener("loadedmetadata", () => {\n  console.log("时长:", video.duration);\n});\n\n// 可以播放\nvideo.addEventListener("canplay", () => {\n  console.log("可以开始播放");\n});\n\n// 卡顿\nvideo.addEventListener("waiting", () => {\n  console.log("缓冲中...");\n});\n\n// 错误\nvideo.addEventListener("error", () => {\n  console.log("加载错误:", video.error);\n});',
                        content: "丰富的事件系统用于监听播放状态。"
                    },
                    {
                        title: "完整播放器示例",
                        code: 'class VideoPlayer {\n  constructor(videoElement) {\n    this.video = videoElement;\n    this.setupEvents();\n  }\n  \n  setupEvents() {\n    this.video.addEventListener("timeupdate", () => {\n      this.updateProgress();\n    });\n    \n    this.video.addEventListener("ended", () => {\n      this.onEnded();\n    });\n  }\n  \n  play() {\n    return this.video.play();\n  }\n  \n  pause() {\n    this.video.pause();\n  }\n  \n  seek(time) {\n    this.video.currentTime = time;\n  }\n  \n  setVolume(vol) {\n    this.video.volume = Math.max(0, Math.min(1, vol));\n  }\n  \n  setSpeed(rate) {\n    this.video.playbackRate = rate;\n  }\n  \n  updateProgress() {\n    const percent = (this.video.currentTime / this.video.duration) * 100;\n    // 更新进度条UI\n  }\n  \n  onEnded() {\n    // 播放结束处理\n  }\n}\n\nconst player = new VideoPlayer(document.querySelector("video"));',
                        content: "封装Media API创建自定义播放器。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["视频格式", "兼容性"],
            question: "如何选择视频格式以获得最佳兼容性？",
            options: [
                "MP4 (H.264)最广泛支持",
                "WebM (VP9)现代浏览器支持",
                "应该提供多种格式",
                "OGG已经过时"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "视频格式选择",
                description: "不同格式有不同的兼容性和压缩效率。",
                sections: [
                    {
                        title: "格式对比",
                        points: [
                            "MP4 (H.264)：最广泛支持，所有浏览器",
                            "WebM (VP8/VP9)：开源，Chrome/Firefox/Edge",
                            "WebM (AV1)：最新编码，压缩率最高",
                            "OGG (Theora)：开源，支持减少",
                            "MOV：Apple格式，Safari支持"
                        ]
                    },
                    {
                        title: "推荐策略",
                        code: '<video controls width="640" height="360">\n  <!-- 优先：AV1（最小体积） -->\n  <source src="video.av1.mp4" type="video/mp4; codecs=av01.0.05M.08">\n  \n  <!-- 次优：VP9 -->\n  <source src="video.webm" type="video/webm; codecs=vp9">\n  \n  <!-- 回退：H.264 -->\n  <source src="video.mp4" type="video/mp4; codecs=avc1.42E01E,mp4a.40.2">\n  \n  您的浏览器不支持video标签。\n</video>',
                        content: "提供多种格式，浏览器选择最优。"
                    },
                    {
                        title: "编码器选择",
                        points: [
                            "H.264：FFmpeg、x264",
                            "VP9：FFmpeg、libvpx",
                            "AV1：FFmpeg、libaom、SVT-AV1",
                            "推荐：使用FFmpeg批量转换",
                            "CDN：某些CDN支持自动格式转换"
                        ]
                    },
                    {
                        title: "FFmpeg转换示例",
                        code: '# H.264 (MP4)\nffmpeg -i input.mov -c:v libx264 -preset slow -crf 22 -c:a aac -b:a 128k output.mp4\n\n# VP9 (WebM)\nffmpeg -i input.mov -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus output.webm\n\n# AV1\nffmpeg -i input.mov -c:v libaom-av1 -crf 30 -b:v 0 -c:a libopus output-av1.mp4\n\n# 参数说明：\n# -crf: 质量（0-51，越小质量越高）\n# -preset: 编码速度（slow更慢但更小）\n# -b:v 0: VBR可变码率',
                        content: "使用FFmpeg生成不同格式。"
                    },
                    {
                        title: "文件大小对比",
                        code: '// 相同质量下的文件大小（以H.264为基准100MB）：\n// H.264:  100 MB  (基准)\n// VP9:    60 MB   (40%更小)\n// AV1:    45 MB   (55%更小)\n\n// 但编码时间：\n// H.264:  1x\n// VP9:    10x\n// AV1:    50x+',
                        content: "更高效的编码需要更长的编码时间。"
                    },
                    {
                        title: "实际建议",
                        points: [
                            "必备：H.264 MP4（所有浏览器）",
                            "推荐：VP9 WebM（现代浏览器）",
                            "可选：AV1（最新浏览器，体积最小）",
                            "自适应：使用HLS或DASH",
                            "CDN：利用CDN的格式转换功能"
                        ]
                    }
                ]
            },
            source: "Web视频最佳实践"
        },
        {
            difficulty: "hard",
            tags: ["HLS", "DASH", "流媒体"],
            question: "什么是HLS和DASH？如何使用？",
            options: [
                "HLS是Apple的流媒体协议",
                "DASH是通用的自适应流协议",
                "支持多码率自动切换",
                "HTML5原生支持"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "自适应流媒体",
                description: "HLS和DASH实现根据网速自动调整视频质量。",
                sections: [
                    {
                        title: "HLS (HTTP Live Streaming)",
                        code: '<!-- Safari原生支持 -->\n<video src="https://example.com/stream.m3u8" controls></video>\n\n<!-- 其他浏览器需要hls.js -->\n<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>\n<video id="video" controls></video>\n<script>\nif (Hls.isSupported()) {\n  const video = document.getElementById("video");\n  const hls = new Hls();\n  hls.loadSource("https://example.com/stream.m3u8");\n  hls.attachMedia(video);\n} else if (video.canPlayType("application/vnd.apple.mpegurl")) {\n  // Safari原生支持\n  video.src = "https://example.com/stream.m3u8";\n}\n</script>',
                        points: [
                            "Apple开发",
                            "Safari原生支持",
                            "其他浏览器需要hls.js",
                            "基于HTTP",
                            "M3U8播放列表"
                        ]
                    },
                    {
                        title: "DASH (Dynamic Adaptive Streaming over HTTP)",
                        code: '<!-- 使用dash.js -->\n<script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>\n<video id="video" controls></video>\n<script>\nconst video = document.getElementById("video");\nconst player = dashjs.MediaPlayer().create();\nplayer.initialize(video, "https://example.com/stream.mpd", true);\n</script>',
                        points: [
                            "MPEG标准",
                            "跨平台",
                            "需要dash.js库",
                            "MPD清单文件",
                            "更灵活的DRM支持"
                        ]
                    },
                    {
                        title: "工作原理",
                        code: '// 1. 视频被切分成多个小段（通常2-10秒）\n// 2. 每个段有多个质量版本\n// 3. 播放器根据网速选择合适的质量\n\n// HLS播放列表示例 (m3u8)\n#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360\nlow/index.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=1280x720\nmedium/index.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1920x1080\nhigh/index.m3u8',
                        content: "视频分段+多码率=自适应播放。"
                    },
                    {
                        title: "优势",
                        points: [
                            "自动适应网速",
                            "无缝切换质量",
                            "减少缓冲",
                            "支持直播和点播",
                            "使用普通HTTP服务器",
                            "CDN友好"
                        ]
                    },
                    {
                        title: "生成HLS",
                        code: '# 使用FFmpeg生成HLS\nffmpeg -i input.mp4 \\\n  -c:v libx264 -c:a aac \\\n  -hls_time 10 \\\n  -hls_playlist_type vod \\\n  -hls_segment_filename "segment%03d.ts" \\\n  playlist.m3u8\n\n# 生成多码率\nffmpeg -i input.mp4 \\\n  -filter_complex \\\n  "[0:v]split=3[v1][v2][v3]; \\\n   [v1]scale=w=640:h=360[v1out]; \\\n   [v2]scale=w=1280:h=720[v2out]; \\\n   [v3]scale=w=1920:h=1080[v3out]" \\\n  -map "[v1out]" -c:v:0 libx264 -b:v:0 800k \\\n  -map "[v2out]" -c:v:1 libx264 -b:v:1 1400k \\\n  -map "[v3out]" -c:v:2 libx264 -b:v:2 2800k \\\n  -var_stream_map "v:0,a:0 v:1,a:0 v:2,a:0" \\\n  -hls_time 10 \\\n  -master_pl_name master.m3u8 \\\n  stream_%v/index.m3u8',
                        content: "FFmpeg可以生成HLS流。"
                    },
                    {
                        title: "HLS vs DASH",
                        points: [
                            "HLS：iOS必需，简单",
                            "DASH：更灵活，标准化",
                            "实际：两者都提供",
                            "或使用云服务（AWS MediaConvert、Azure Media Services）",
                            "大多数视频平台同时支持两者"
                        ]
                    }
                ]
            },
            source: "流媒体技术"
        },
        {
            difficulty: "medium",
            tags: ["iframe", "嵌入视频"],
            question: "如何嵌入YouTube等第三方视频？",
            options: [
                "使用<iframe>标签",
                "YouTube提供嵌入代码",
                "可以自定义播放器参数",
                "需要API密钥"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "嵌入第三方视频",
                description: "使用iframe嵌入YouTube、Vimeo等视频平台的内容。",
                sections: [
                    {
                        title: "基本嵌入",
                        code: '<!-- YouTube -->\n<iframe width="560" height="315"\n  src="https://www.youtube.com/embed/VIDEO_ID"\n  frameborder="0"\n  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"\n  allowfullscreen>\n</iframe>\n\n<!-- Vimeo -->\n<iframe src="https://player.vimeo.com/video/VIDEO_ID"\n  width="640" height="360"\n  frameborder="0"\n  allow="autoplay; fullscreen; picture-in-picture"\n  allowfullscreen>\n</iframe>',
                        content: "视频平台提供现成的嵌入代码。"
                    },
                    {
                        title: "YouTube参数",
                        code: '<!-- 自动播放 + 静音 -->\n<iframe src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1"></iframe>\n\n<!-- 循环播放 -->\n<iframe src="https://www.youtube.com/embed/VIDEO_ID?loop=1&playlist=VIDEO_ID"></iframe>\n\n<!-- 隐藏控制条 -->\n<iframe src="https://www.youtube.com/embed/VIDEO_ID?controls=0"></iframe>\n\n<!-- 指定起始时间（90秒） -->\n<iframe src="https://www.youtube.com/embed/VIDEO_ID?start=90"></iframe>\n\n<!-- 多个参数 -->\n<iframe src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&controls=0&loop=1"></iframe>',
                        points: [
                            "autoplay=1：自动播放",
                            "mute=1：静音",
                            "loop=1：循环",
                            "controls=0：隐藏控制条",
                            "start=N：起始时间（秒）"
                        ]
                    },
                    {
                        title: "响应式嵌入",
                        code: '<!-- HTML -->\n<div class="video-container">\n  <iframe src="https://www.youtube.com/embed/VIDEO_ID"\n    frameborder="0"\n    allowfullscreen>\n  </iframe>\n</div>\n\n<!-- CSS -->\n<style>\n.video-container {\n  position: relative;\n  padding-bottom: 56.25%; /* 16:9 */\n  height: 0;\n  overflow: hidden;\n}\n\n.video-container iframe {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n</style>',
                        content: "使用padding技巧实现响应式。"
                    },
                    {
                        title: "延迟加载优化",
                        code: '<!-- 使用缩略图替代iframe -->\n<div class="video-thumb" data-video-id="VIDEO_ID">\n  <img src="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg" alt="视频">\n  <button class="play-button">▶</button>\n</div>\n\n<script>\ndocument.querySelectorAll(".video-thumb").forEach(thumb => {\n  thumb.addEventListener("click", function() {\n    const videoId = this.dataset.videoId;\n    const iframe = document.createElement("iframe");\n    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;\n    iframe.setAttribute("allowfullscreen", "");\n    this.replaceWith(iframe);\n  });\n});\n</script>',
                        content: "点击时才加载iframe，节省初始加载时间。"
                    },
                    {
                        title: "隐私增强模式",
                        code: '<!-- YouTube隐私增强模式 -->\n<iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID"></iframe>\n<!-- 使用youtube-nocookie.com，不设置跟踪Cookie -->',
                        content: "使用nocookie域名保护用户隐私。"
                    }
                ]
            },
            source: "YouTube API文档"
        },
        {
            difficulty: "hard",
            tags: ["Picture-in-Picture", "API"],
            question: "什么是Picture-in-Picture（画中画）API？",
            options: [
                "让视频浮动在其他窗口上方",
                "用户可以边看视频边做其他事",
                "需要JavaScript API",
                "所有浏览器都支持"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "Picture-in-Picture API",
                description: "画中画功能让视频可以浮动显示。",
                sections: [
                    {
                        title: "基本用法",
                        code: 'const video = document.querySelector("video");\nconst button = document.querySelector("button");\n\nbutton.addEventListener("click", async () => {\n  try {\n    if (document.pictureInPictureElement) {\n      // 退出画中画\n      await document.exitPictureInPicture();\n    } else {\n      // 进入画中画\n      await video.requestPictureInPicture();\n    }\n  } catch (error) {\n    console.error("画中画失败:", error);\n  }\n});',
                        points: [
                            "requestPictureInPicture()：进入",
                            "exitPictureInPicture()：退出",
                            "pictureInPictureElement：当前PiP元素",
                            "返回Promise"
                        ]
                    },
                    {
                        title: "事件监听",
                        code: 'video.addEventListener("enterpictureinpicture", () => {\n  console.log("进入画中画");\n  button.textContent = "退出画中画";\n});\n\nvideo.addEventListener("leavepictureinpicture", () => {\n  console.log("离开画中画");\n  button.textContent = "画中画";\n});',
                        content: "监听进入和离开画中画事件。"
                    },
                    {
                        title: "检测支持",
                        code: 'if ("pictureInPictureEnabled" in document) {\n  // 浏览器支持PiP\n  button.style.display = "block";\n} else {\n  console.log("不支持画中画");\n}\n\n// 检查视频是否禁用PiP\nif (video.disablePictureInPicture) {\n  console.log("该视频禁用了画中画");\n}',
                        content: "检测浏览器和视频的支持情况。"
                    },
                    {
                        title: "禁用画中画",
                        code: '<!-- HTML禁用 -->\n<video src="video.mp4" disablePictureInPicture></video>\n\n// JavaScript禁用\nvideo.disablePictureInPicture = true;',
                        content: "可以禁用特定视频的画中画功能。"
                    },
                    {
                        title: "浏览器支持",
                        points: [
                            "Chrome 70+",
                            "Edge 79+",
                            "Safari 13.1+",
                            "Firefox 支持但默认禁用",
                            "移动浏览器支持有限"
                        ]
                    },
                    {
                        title: "用户体验",
                        points: [
                            "用户可以边看视频边浏览其他内容",
                            "视频教程、直播很有用",
                            "浏览器会显示控制按钮",
                            "用户可以调整PiP窗口大小",
                            "可以拖动到任意位置"
                        ]
                    }
                ]
            },
            source: "Picture-in-Picture API"
        },
        {
            difficulty: "medium",
            tags: ["性能优化", "最佳实践"],
            question: "视频性能优化的最佳实践？",
            type: "multiple-choice",
            options: [
                "使用poster封面图",
                "设置preload='none'延迟加载",
                "提供多种格式和分辨率",
                "使用CDN分发"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "视频性能优化",
                description: "优化视频加载可以显著提升页面性能。",
                sections: [
                    {
                        title: "延迟加载",
                        code: '<!-- 不立即加载视频 -->\n<video src="video.mp4"\n       controls\n       preload="none"\n       poster="thumbnail.jpg">\n</video>\n\n<!-- 或使用Intersection Observer -->\n<video data-src="video.mp4" controls poster="thumb.jpg"></video>\n\n<script>\nconst observer = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      const video = entry.target;\n      video.src = video.dataset.src;\n      observer.unobserve(video);\n    }\n  });\n});\n\ndocument.querySelectorAll("video[data-src]").forEach(video => {\n  observer.observe(video);\n});\n</script>',
                        content: "视口外的视频不立即加载。"
                    },
                    {
                        title: "poster封面图",
                        code: '<video src="video.mp4"\n       controls\n       poster="high-quality-thumbnail.jpg"\n       preload="none">\n</video>',
                        points: [
                            "提供高质量的封面图",
                            "给用户视频内容预览",
                            "减少初始加载",
                            "优化LCP指标"
                        ]
                    },
                    {
                        title: "压缩和优化",
                        code: '# 压缩视频\nffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k output.mp4\n\n# 生成多分辨率\nffmpeg -i input.mp4 -vf scale=640:360 output-360p.mp4\nffmpeg -i input.mp4 -vf scale=1280:720 output-720p.mp4\nffmpeg -i input.mp4 -vf scale=1920:1080 output-1080p.mp4',
                        points: [
                            "选择合适的码率",
                            "CRF 18-28为佳",
                            "提供多种分辨率",
                            "移动端用低分辨率"
                        ]
                    },
                    {
                        title: "CDN分发",
                        code: '<!-- 使用CDN -->\n<video src="https://cdn.example.com/videos/video.mp4"\n       controls>\n</video>\n\n<!-- 或使用专业视频CDN -->\n<video src="https://stream.cloudflare.com/VIDEO_ID/manifest/video.m3u8"\n       controls>\n</video>',
                        points: [
                            "使用CDN加速",
                            "就近分发",
                            "减少源服务器负载",
                            "专业视频CDN（Cloudflare Stream、Mux等）"
                        ]
                    },
                    {
                        title: "流媒体vs下载",
                        code: '<!-- 短视频：渐进式下载 -->\n<video src="short-video.mp4" controls></video>\n\n<!-- 长视频：流媒体 -->\n<video src="long-video.m3u8" controls></video>\n<script src="hls.js"></script>',
                        points: [
                            "短视频（<5分钟）：MP4渐进式",
                            "长视频：HLS/DASH流媒体",
                            "直播：必须用流媒体",
                            "流媒体支持多码率"
                        ]
                    },
                    {
                        title: "其他优化",
                        points: [
                            "移除音频轨道（背景视频）",
                            "使用<video>替代GIF动画",
                            "考虑WebM格式",
                            "监控带宽使用",
                            "提供下载链接（大文件）"
                        ]
                    }
                ]
            },
            source: "Web性能最佳实践"
        }
    ],
    navigation: {
        prev: { title: "图片处理", url: "07-images-quiz.html" },
        next: { title: "表格", url: "09-tables-quiz.html" }
    }
};
