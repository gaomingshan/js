// 第13章：HTML5 API（上）- 面试题
window.htmlQuizData_13 = {
    config: {
        title: "HTML5 API（上）",
        icon: "⚡",
        description: "测试你对HTML5 API的掌握程度",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "medium",
            tags: ["Canvas", "绘图"],
            question: "Canvas的基本绘图方法有哪些？",
            type: "multiple-choice",
            options: [
                "绘制矩形、路径、文本",
                "支持2D和3D绘图",
                "可以导出图片",
                "支持动画"
            ],
            correctAnswer: ["A", "C", "D"],
            explanation: {
                title: "Canvas API",
                description: "Canvas提供了强大的2D绘图能力。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<canvas id="myCanvas" width="400" height="300"></canvas>\n\n<script>\nconst canvas = document.getElementById("myCanvas");\nconst ctx = canvas.getContext("2d");\n\n// 绘制矩形\nctx.fillStyle = "red";\nctx.fillRect(10, 10, 100, 50);\n\n// 绘制边框矩形\nctx.strokeStyle = "blue";\nctx.strokeRect(120, 10, 100, 50);\n\n// 清除矩形\nctx.clearRect(15, 15, 20, 20);\n</script>',
                        points: [
                            "getContext('2d')：获取2D绘图上下文",
                            "fillRect：填充矩形",
                            "strokeRect：边框矩形",
                            "clearRect：清除区域"
                        ]
                    },
                    {
                        title: "路径绘制",
                        code: 'const ctx = canvas.getContext("2d");\n\n// 开始路径\nctx.beginPath();\nctx.moveTo(50, 50);  // 移动到起点\nctx.lineTo(150, 50); // 画线到\nctx.lineTo(100, 150);\nctx.closePath();     // 闭合路径\nctx.stroke();        // 描边\n\n// 填充路径\nctx.beginPath();\nctx.arc(200, 100, 50, 0, Math.PI * 2);\nctx.fillStyle = "green";\nctx.fill();',
                        points: [
                            "beginPath()：开始新路径",
                            "moveTo/lineTo：移动/画线",
                            "arc：绘制圆弧",
                            "closePath：闭合路径",
                            "stroke/fill：描边/填充"
                        ]
                    },
                    {
                        title: "文本绘制",
                        code: 'ctx.font = "30px Arial";\nctx.fillStyle = "black";\nctx.fillText("Hello Canvas", 50, 50);\n\nctx.strokeStyle = "red";\nctx.strokeText("Outline Text", 50, 100);\n\n// 文本对齐\nctx.textAlign = "center";  // left | right | center\nctx.textBaseline = "middle";  // top | bottom | middle\nctx.fillText("Centered", 200, 150);',
                        content: "Canvas可以绘制文本和设置样式。"
                    },
                    {
                        title: "图片操作",
                        code: 'const img = new Image();\nimg.onload = function() {\n  // 绘制图片\n  ctx.drawImage(img, 0, 0);\n  \n  // 缩放图片\n  ctx.drawImage(img, 0, 0, 200, 100);\n  \n  // 裁剪并缩放\n  ctx.drawImage(\n    img,\n    50, 50, 100, 100,  // 源区域\n    0, 0, 200, 200     // 目标区域\n  );\n};\nimg.src = "image.jpg";',
                        content: "drawImage可以绘制和操作图片。"
                    },
                    {
                        title: "导出图片",
                        code: 'const canvas = document.getElementById("myCanvas");\n\n// 导出为DataURL\nconst dataURL = canvas.toDataURL("image/png");\nconst dataURLJpeg = canvas.toDataURL("image/jpeg", 0.8);\n\n// 下载图片\nconst link = document.createElement("a");\nlink.download = "canvas.png";\nlink.href = dataURL;\nlink.click();\n\n// 转为Blob\ncanvas.toBlob(function(blob) {\n  const url = URL.createObjectURL(blob);\n  // 使用blob url\n}, "image/png");',
                        content: "可以导出Canvas内容为图片。"
                    }
                ]
            },
            source: "Canvas API"
        },
        {
            difficulty: "hard",
            tags: ["Geolocation", "定位"],
            question: "如何使用Geolocation API获取用户位置？",
            options: [
                "需要用户授权",
                "可以监听位置变化",
                "返回经纬度信息",
                "支持高精度定位"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Geolocation API",
                description: "获取用户的地理位置信息。",
                sections: [
                    {
                        title: "获取当前位置",
                        code: 'if ("geolocation" in navigator) {\n  navigator.geolocation.getCurrentPosition(\n    // 成功回调\n    function(position) {\n      console.log("纬度:", position.coords.latitude);\n      console.log("经度:", position.coords.longitude);\n      console.log("精度:", position.coords.accuracy, "米");\n      console.log("海拔:", position.coords.altitude);\n      console.log("速度:", position.coords.speed);\n      console.log("方向:", position.coords.heading);\n      console.log("时间:", position.timestamp);\n    },\n    // 错误回调\n    function(error) {\n      switch(error.code) {\n        case error.PERMISSION_DENIED:\n          console.log("用户拒绝了定位请求");\n          break;\n        case error.POSITION_UNAVAILABLE:\n          console.log("位置信息不可用");\n          break;\n        case error.TIMEOUT:\n          console.log("请求超时");\n          break;\n      }\n    },\n    // 选项\n    {\n      enableHighAccuracy: true,  // 高精度\n      timeout: 5000,             // 超时时间\n      maximumAge: 0              // 缓存时间\n    }\n  );\n} else {\n  console.log("浏览器不支持地理定位");\n}',
                        points: [
                            "getCurrentPosition：获取一次位置",
                            "需要HTTPS或localhost",
                            "用户必须授权",
                            "返回Position对象"
                        ]
                    },
                    {
                        title: "监听位置变化",
                        code: 'const watchId = navigator.geolocation.watchPosition(\n  function(position) {\n    console.log("位置更新:", position.coords);\n    updateMap(position.coords);\n  },\n  function(error) {\n    console.error("定位错误:", error);\n  },\n  {\n    enableHighAccuracy: true,\n    timeout: 10000,\n    maximumAge: 0\n  }\n);\n\n// 停止监听\nnavigator.geolocation.clearWatch(watchId);',
                        content: "watchPosition持续监听位置变化。"
                    },
                    {
                        title: "选项说明",
                        code: '{\n  // 是否使用高精度（GPS）\n  enableHighAccuracy: true,  // 默认false\n  \n  // 超时时间（毫秒）\n  timeout: 5000,  // 默认Infinity\n  \n  // 缓存时间（毫秒）\n  // 0表示不使用缓存\n  maximumAge: 0  // 默认0\n}',
                        points: [
                            "enableHighAccuracy：GPS vs WiFi/基站",
                            "timeout：防止长时间等待",
                            "maximumAge：缓存位置信息",
                            "高精度消耗更多电量"
                        ]
                    },
                    {
                        title: "实际应用",
                        code: 'function showPositionOnMap(position) {\n  const { latitude, longitude } = position.coords;\n  \n  // 使用高德地图\n  const map = new AMap.Map("map", {\n    center: [longitude, latitude],\n    zoom: 15\n  });\n  \n  new AMap.Marker({\n    position: [longitude, latitude],\n    map: map\n  });\n}\n\n// 计算两点距离\nfunction calculateDistance(lat1, lon1, lat2, lon2) {\n  const R = 6371; // 地球半径（公里）\n  const dLat = (lat2 - lat1) * Math.PI / 180;\n  const dLon = (lon2 - lon1) * Math.PI / 180;\n  const a = \n    Math.sin(dLat/2) * Math.sin(dLat/2) +\n    Math.cos(lat1 * Math.PI / 180) *\n    Math.cos(lat2 * Math.PI / 180) *\n    Math.sin(dLon/2) * Math.sin(dLon/2);\n  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));\n  return R * c;\n}',
                        content: "集成地图API和距离计算。"
                    },
                    {
                        title: "隐私和安全",
                        points: [
                            "必须HTTPS（localhost除外）",
                            "用户必须明确授权",
                            "浏览器会记住授权选择",
                            "可以在设置中撤销",
                            "移动端定位更准确",
                            "注意电量消耗"
                        ]
                    }
                ]
            },
            source: "Geolocation API"
        },
        {
            difficulty: "medium",
            tags: ["Drag and Drop", "拖拽"],
            question: "HTML5拖放API的事件有哪些？",
            type: "multiple-choice",
            options: [
                "dragstart、drag、dragend",
                "dragenter、dragover、dragleave",
                "drop事件",
                "需要preventDefault阻止默认行为"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Drag and Drop API",
                description: "HTML5原生拖放功能。",
                sections: [
                    {
                        title: "可拖拽元素",
                        code: '<div draggable="true" id="drag1">\n  拖动我\n</div>\n\n<script>\nconst drag1 = document.getElementById("drag1");\n\n// 开始拖动\ndrag1.addEventListener("dragstart", function(e) {\n  e.dataTransfer.setData("text/plain", e.target.id);\n  e.dataTransfer.effectAllowed = "move";\n});\n\n// 拖动中\ndrag1.addEventListener("drag", function(e) {\n  console.log("正在拖动");\n});\n\n// 拖动结束\ndrag1.addEventListener("dragend", function(e) {\n  console.log("拖动结束");\n});\n</script>',
                        points: [
                            "draggable='true'：设为可拖拽",
                            "dragstart：开始拖动",
                            "drag：拖动中（持续触发）",
                            "dragend：拖动结束",
                            "dataTransfer：传输数据"
                        ]
                    },
                    {
                        title: "放置目标",
                        code: '<div id="dropZone" style="width:200px;height:200px;border:2px dashed #ccc;">\n  拖到这里\n</div>\n\n<script>\nconst dropZone = document.getElementById("dropZone");\n\n// 进入放置区\ndropZone.addEventListener("dragenter", function(e) {\n  e.preventDefault();\n  this.style.background = "#e0e0e0";\n});\n\n// 在放置区上方\ndropZone.addEventListener("dragover", function(e) {\n  e.preventDefault();  // 必须！\n  e.dataTransfer.dropEffect = "move";\n});\n\n// 离开放置区\ndropZone.addEventListener("dragleave", function(e) {\n  this.style.background = "";\n});\n\n// 放置\ndropZone.addEventListener("drop", function(e) {\n  e.preventDefault();\n  const data = e.dataTransfer.getData("text/plain");\n  const draggedElement = document.getElementById(data);\n  this.appendChild(draggedElement);\n  this.style.background = "";\n});\n</script>',
                        points: [
                            "dragenter：进入放置区",
                            "dragover：在放置区上方（必须preventDefault）",
                            "dragleave：离开放置区",
                            "drop：放置（必须preventDefault）"
                        ]
                    },
                    {
                        title: "DataTransfer对象",
                        code: '// 拖动源\nelement.addEventListener("dragstart", function(e) {\n  // 设置数据\n  e.dataTransfer.setData("text/plain", "纯文本");\n  e.dataTransfer.setData("text/html", "<b>HTML</b>");\n  e.dataTransfer.setData("application/json", JSON.stringify({id: 1}));\n  \n  // 设置拖动效果\n  e.dataTransfer.effectAllowed = "move";  // copy | move | link\n  \n  // 设置拖动图像\n  const img = new Image();\n  img.src = "icon.png";\n  e.dataTransfer.setDragImage(img, 0, 0);\n});\n\n// 放置目标\ntarget.addEventListener("drop", function(e) {\n  // 获取数据\n  const text = e.dataTransfer.getData("text/plain");\n  const html = e.dataTransfer.getData("text/html");\n  \n  // 获取文件\n  const files = e.dataTransfer.files;\n  for (const file of files) {\n    console.log(file.name);\n  }\n});',
                        content: "dataTransfer用于传递数据。"
                    },
                    {
                        title: "文件拖放",
                        code: '<div id="fileDropZone">\n  拖拽文件到这里\n</div>\n\n<script>\nconst zone = document.getElementById("fileDropZone");\n\nzone.addEventListener("dragover", function(e) {\n  e.preventDefault();\n});\n\nzone.addEventListener("drop", function(e) {\n  e.preventDefault();\n  \n  const files = e.dataTransfer.files;\n  \n  for (const file of files) {\n    console.log("文件名:", file.name);\n    console.log("大小:", file.size);\n    console.log("类型:", file.type);\n    \n    // 读取文件\n    const reader = new FileReader();\n    reader.onload = function(e) {\n      console.log("内容:", e.target.result);\n    };\n    \n    if (file.type.startsWith("image/")) {\n      reader.readAsDataURL(file);\n    } else {\n      reader.readAsText(file);\n    }\n  }\n});\n</script>',
                        content: "支持拖放文件上传。"
                    },
                    {
                        title: "完整示例",
                        code: '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .draggable {\n      padding: 10px;\n      margin: 5px;\n      background: #4CAF50;\n      color: white;\n      cursor: move;\n    }\n    \n    .dropzone {\n      min-height: 100px;\n      padding: 10px;\n      border: 2px dashed #ccc;\n      margin: 10px;\n    }\n    \n    .dropzone.dragover {\n      border-color: #4CAF50;\n      background: #f0f0f0;\n    }\n  </style>\n</head>\n<body>\n  <div class="draggable" draggable="true">项目1</div>\n  <div class="draggable" draggable="true">项目2</div>\n  \n  <div class="dropzone">放置区域</div>\n  \n  <script>\n    const draggables = document.querySelectorAll(".draggable");\n    const dropzones = document.querySelectorAll(".dropzone");\n    \n    draggables.forEach(draggable => {\n      draggable.addEventListener("dragstart", function(e) {\n        e.dataTransfer.effectAllowed = "move";\n        e.dataTransfer.setData("text/html", this.outerHTML);\n        this.classList.add("dragging");\n      });\n      \n      draggable.addEventListener("dragend", function() {\n        this.classList.remove("dragging");\n      });\n    });\n    \n    dropzones.forEach(zone => {\n      zone.addEventListener("dragover", function(e) {\n        e.preventDefault();\n        this.classList.add("dragover");\n      });\n      \n      zone.addEventListener("dragleave", function() {\n        this.classList.remove("dragover");\n      });\n      \n      zone.addEventListener("drop", function(e) {\n        e.preventDefault();\n        const data = e.dataTransfer.getData("text/html");\n        const dragging = document.querySelector(".dragging");\n        this.appendChild(dragging);\n        this.classList.remove("dragover");\n      });\n    });\n  </script>\n</body>\n</html>',
                        content: "完整的拖放实现。"
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["Web Storage", "存储"],
            question: "localStorage和sessionStorage的区别？",
            options: [
                "localStorage永久存储",
                "sessionStorage会话级别",
                "都只能存储字符串",
                "同源策略限制"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Web Storage API",
                description: "客户端存储数据的两种方式。",
                sections: [
                    {
                        title: "localStorage",
                        code: '// 存储数据\nlocalStorage.setItem("username", "张三");\nlocalStorage.setItem("age", "25");\n\n// 简写\nlocalStorage.username = "张三";\n\n// 读取数据\nconst username = localStorage.getItem("username");\nconsole.log(username);  // "张三"\n\n// 删除数据\nlocalStorage.removeItem("username");\n\n// 清空所有\nlocalStorage.clear();\n\n// 获取key\nconst key = localStorage.key(0);\n\n// 数量\nconsole.log(localStorage.length);',
                        points: [
                            "永久存储（除非手动删除）",
                            "5-10MB容量",
                            "同源共享",
                            "只能存储字符串"
                        ]
                    },
                    {
                        title: "sessionStorage",
                        code: '// API与localStorage完全相同\nsessionStorage.setItem("token", "abc123");\nconst token = sessionStorage.getItem("token");\nsessionStorage.removeItem("token");\nsessionStorage.clear();',
                        points: [
                            "会话级别（关闭标签页即清除）",
                            "同一标签页共享",
                            "新标签页不共享",
                            "刷新页面数据仍在"
                        ]
                    },
                    {
                        title: "存储对象",
                        code: '// 错误：直接存储对象\nconst user = {name: "张三", age: 25};\nlocalStorage.setItem("user", user);  // 存储为"[object Object]"\n\n// 正确：JSON序列化\nlocalStorage.setItem("user", JSON.stringify(user));\n\n// 读取并解析\nconst stored = localStorage.getItem("user");\nconst user = JSON.parse(stored);\n\n// 封装工具函数\nconst storage = {\n  set(key, value) {\n    localStorage.setItem(key, JSON.stringify(value));\n  },\n  get(key) {\n    const value = localStorage.getItem(key);\n    return value ? JSON.parse(value) : null;\n  },\n  remove(key) {\n    localStorage.removeItem(key);\n  },\n  clear() {\n    localStorage.clear();\n  }\n};',
                        content: "需要手动序列化和反序列化对象。"
                    },
                    {
                        title: "监听变化",
                        code: '// 监听storage事件（跨标签页）\nwindow.addEventListener("storage", function(e) {\n  console.log("键:", e.key);\n  console.log("旧值:", e.oldValue);\n  console.log("新值:", e.newValue);\n  console.log("URL:", e.url);\n  console.log("存储对象:", e.storageArea);\n});\n\n// 注意：当前页面修改不会触发自己的storage事件\n// 只有其他标签页修改才会触发',
                        content: "storage事件用于跨标签页通信。"
                    },
                    {
                        title: "对比Cookie",
                        code: '// Cookie\n// - 容量4KB\n// - 每次请求都发送\n// - 可设置过期时间\n// - 可设置path和domain\n// - httpOnly、secure等安全选项\n\n// localStorage\n// - 容量5-10MB\n// - 不会发送到服务器\n// - 永久存储\n// - 同源策略\n// - 更简单的API\n\n// sessionStorage\n// - 容量5-10MB\n// - 不会发送到服务器\n// - 会话级别\n// - 标签页隔离',
                        points: [
                            "Cookie：与服务器交互",
                            "Storage：纯客户端存储",
                            "Storage容量更大",
                            "Storage API更简单"
                        ]
                    },
                    {
                        title: "注意事项",
                        points: [
                            "同步API（可能阻塞）",
                            "不适合存储敏感信息",
                            "用户可以清除",
                            "隐私模式可能禁用",
                            "需要try-catch（可能满）",
                            "注意JSON序列化限制"
                        ]
                    }
                ]
            },
            source: "Web Storage API"
        },
        {
            difficulty: "hard",
            tags: ["History API", "路由"],
            question: "History API如何实现单页应用路由？",
            type: "multiple-choice",
            options: [
                "pushState添加历史记录",
                "replaceState替换当前记录",
                "popstate事件监听后退",
                "不会刷新页面"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "History API",
                description: "操作浏览器历史记录，实现SPA路由。",
                sections: [
                    {
                        title: "pushState",
                        code: '// 添加历史记录\nhistory.pushState(\n  {page: 1},           // state对象\n  "页面标题",           // title（多数浏览器忽略）\n  "/page1"             // URL\n);\n\n// URL变了，但页面不刷新\n// 浏览器地址栏：https://example.com/page1\n\n// state可以是任何可序列化对象\nhistory.pushState(\n  {\n    id: 123,\n    data: {name: "test"},\n    timestamp: Date.now()\n  },\n  "",\n  "/detail/123"\n);',
                        points: [
                            "添加新的历史记录",
                            "修改URL但不刷新",
                            "保存状态数据",
                            "可以前进/后退"
                        ]
                    },
                    {
                        title: "replaceState",
                        code: '// 替换当前历史记录\nhistory.replaceState(\n  {page: 2},\n  "",\n  "/page2"\n);\n\n// 不会新增历史记录\n// 适合修正URL或更新state',
                        content: "替换而不是添加历史记录。"
                    },
                    {
                        title: "popstate事件",
                        code: '// 监听前进/后退\nwindow.addEventListener("popstate", function(e) {\n  console.log("state:", e.state);\n  console.log("当前URL:", location.pathname);\n  \n  // 根据URL渲染页面\n  render(location.pathname, e.state);\n});\n\n// 注意：pushState/replaceState不会触发popstate\n// 只有用户点击前进/后退按钮才会触发',
                        content: "监听浏览器前进/后退按钮。"
                    },
                    {
                        title: "简单路由实现",
                        code: 'class Router {\n  constructor() {\n    this.routes = {};\n    this.init();\n  }\n  \n  init() {\n    // 监听popstate\n    window.addEventListener("popstate", (e) => {\n      this.handleRoute(location.pathname, e.state);\n    });\n    \n    // 拦截链接点击\n    document.addEventListener("click", (e) => {\n      if (e.target.tagName === "A") {\n        e.preventDefault();\n        const href = e.target.getAttribute("href");\n        this.push(href);\n      }\n    });\n    \n    // 处理初始路由\n    this.handleRoute(location.pathname);\n  }\n  \n  route(path, handler) {\n    this.routes[path] = handler;\n  }\n  \n  push(path, state = {}) {\n    history.pushState(state, "", path);\n    this.handleRoute(path, state);\n  }\n  \n  replace(path, state = {}) {\n    history.replaceState(state, "", path);\n    this.handleRoute(path, state);\n  }\n  \n  handleRoute(path, state) {\n    const handler = this.routes[path];\n    if (handler) {\n      handler(state);\n    } else {\n      this.routes["/404"]?.();\n    }\n  }\n}\n\n// 使用\nconst router = new Router();\n\nrouter.route("/", () => {\n  document.getElementById("app").innerHTML = "<h1>首页</h1>";\n});\n\nrouter.route("/about", () => {\n  document.getElementById("app").innerHTML = "<h1>关于</h1>";\n});\n\nrouter.route("/404", () => {\n  document.getElementById("app").innerHTML = "<h1>404</h1>";\n});',
                        content: "实现基本的SPA路由。"
                    },
                    {
                        title: "带参数的路由",
                        code: 'class Router {\n  route(pattern, handler) {\n    // 支持 /user/:id 格式\n    const regex = new RegExp(\n      "^" + pattern.replace(/:[^/]+/g, "([^/]+)") + "$"\n    );\n    this.routes.push({ regex, handler, pattern });\n  }\n  \n  handleRoute(path) {\n    for (const route of this.routes) {\n      const match = path.match(route.regex);\n      if (match) {\n        // 提取参数\n        const params = {};\n        const keys = route.pattern.match(/:[^/]+/g) || [];\n        keys.forEach((key, i) => {\n          params[key.slice(1)] = match[i + 1];\n        });\n        route.handler(params);\n        return;\n      }\n    }\n    this.handleNotFound();\n  }\n}\n\n// 使用\nrouter.route("/user/:id", (params) => {\n  console.log("用户ID:", params.id);\n  loadUser(params.id);\n});\n\nrouter.route("/post/:id/comment/:commentId", (params) => {\n  console.log(params.id, params.commentId);\n});',
                        content: "支持动态路由参数。"
                    },
                    {
                        title: "服务器配置",
                        code: '# Nginx配置\nlocation / {\n  try_files $uri $uri/ /index.html;\n}\n\n# Apache .htaccess\nRewriteEngine On\nRewriteBase /\nRewriteRule ^index\\\\.html$ - [L]\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule . /index.html [L]',
                        content: "SPA需要服务器配置，所有路由都返回index.html。"
                    }
                ]
            },
            source: "History API"
        },
        {
            difficulty: "medium",
            tags: ["Notification", "通知"],
            question: "如何使用Notification API发送桌面通知？",
            options: [
                "需要用户授权",
                "可以自定义图标和内容",
                "可以添加动作按钮",
                "有点击事件"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Notification API",
                description: "发送系统级桌面通知。",
                sections: [
                    {
                        title: "请求权限",
                        code: '// 检查是否支持\nif ("Notification" in window) {\n  // 检查权限状态\n  console.log(Notification.permission);\n  // "default" | "granted" | "denied"\n  \n  // 请求权限\n  Notification.requestPermission().then(function(permission) {\n    if (permission === "granted") {\n      console.log("用户授权了通知");\n    } else {\n      console.log("用户拒绝了通知");\n    }\n  });\n} else {\n  console.log("浏览器不支持通知");\n}',
                        points: [
                            "检查浏览器支持",
                            "检查权限状态",
                            "请求用户授权",
                            "用户只需授权一次"
                        ]
                    },
                    {
                        title: "发送通知",
                        code: '// 简单通知\nconst notification = new Notification("标题");\n\n// 带选项的通知\nconst notification = new Notification("新消息", {\n  body: "您有一条新消息",\n  icon: "/icon.png",\n  badge: "/badge.png",\n  image: "/image.jpg",\n  tag: "message-1",        // 通知标识\n  renotify: true,         // 相同tag是否重新通知\n  requireInteraction: false,  // 是否保持显示\n  silent: false,          // 是否静音\n  vibrate: [200, 100, 200],  // 震动模式\n  data: {id: 123}         // 自定义数据\n});',
                        points: [
                            "必须在授权后",
                            "title和body",
                            "icon、image、badge",
                            "tag用于更新通知"
                        ]
                    },
                    {
                        title: "事件处理",
                        code: 'const notification = new Notification("标题", {\n  body: "内容",\n  data: {id: 123}\n});\n\n// 显示时\nnotification.onshow = function() {\n  console.log("通知已显示");\n};\n\n// 点击时\nnotification.onclick = function(e) {\n  console.log("通知被点击", this.data);\n  window.focus();\n  this.close();\n};\n\n// 关闭时\nnotification.onclose = function() {\n  console.log("通知已关闭");\n};\n\n// 错误时\nnotification.onerror = function() {\n  console.log("通知出错");\n};',
                        content: "监听通知的各种事件。"
                    },
                    {
                        title: "动作按钮（Service Worker）",
                        code: '// 需要在Service Worker中\nself.registration.showNotification("新消息", {\n  body: "您有一条新消息",\n  icon: "/icon.png",\n  actions: [\n    {action: "reply", title: "回复", icon: "/reply.png"},\n    {action: "close", title: "关闭", icon: "/close.png"}\n  ]\n});\n\n// 监听动作\nself.addEventListener("notificationclick", function(e) {\n  e.notification.close();\n  \n  if (e.action === "reply") {\n    // 处理回复\n    clients.openWindow("/messages");\n  }\n});',
                        content: "Service Worker支持动作按钮。"
                    },
                    {
                        title: "更新通知",
                        code: '// 使用相同的tag更新\nnew Notification("消息", {\n  tag: "chat-123",\n  body: "1条新消息"\n});\n\n// 稍后更新（会替换上面的通知）\nnew Notification("消息", {\n  tag: "chat-123",\n  body: "3条新消息",\n  renotify: true  // 重新提醒\n});',
                        content: "相同tag会替换通知。"
                    },
                    {
                        title: "最佳实践",
                        code: 'class NotificationManager {\n  constructor() {\n    this.permission = Notification.permission;\n  }\n  \n  async requestPermission() {\n    if (this.permission === "granted") {\n      return true;\n    }\n    \n    this.permission = await Notification.requestPermission();\n    return this.permission === "granted";\n  }\n  \n  async notify(title, options = {}) {\n    if (this.permission !== "granted") {\n      const granted = await this.requestPermission();\n      if (!granted) return null;\n    }\n    \n    return new Notification(title, options);\n  }\n  \n  notifyWithClick(title, options, onClick) {\n    this.notify(title, options).then(notification => {\n      if (notification) {\n        notification.onclick = onClick;\n      }\n    });\n  }\n}\n\n// 使用\nconst nm = new NotificationManager();\nnm.notifyWithClick(\n  "新消息",\n  {body: "您有一条新消息"},\n  () => window.focus()\n);',
                        content: "封装通知管理器。"
                    }
                ]
            },
            source: "Notifications API"
        },
        {
            difficulty: "medium",
            tags: ["Page Visibility", "可见性"],
            question: "Page Visibility API的用途是什么？",
            options: [
                "检测页面是否可见",
                "可以暂停不必要的操作",
                "节省资源和电量",
                "用于视频自动暂停等"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Page Visibility API",
                description: "检测页面的可见性状态。",
                sections: [
                    {
                        title: "基本用法",
                        code: '// 检查当前状态\nif (document.hidden) {\n  console.log("页面不可见");\n} else {\n  console.log("页面可见");\n}\n\n// visibilityState\nconsole.log(document.visibilityState);\n// "visible" | "hidden" | "prerender"\n\n// 监听变化\ndocument.addEventListener("visibilitychange", function() {\n  if (document.hidden) {\n    console.log("页面被隐藏");\n  } else {\n    console.log("页面变为可见");\n  }\n});',
                        points: [
                            "document.hidden：是否隐藏",
                            "document.visibilityState：详细状态",
                            "visibilitychange事件",
                            "最小化、切换标签页会触发"
                        ]
                    },
                    {
                        title: "视频自动暂停",
                        code: 'const video = document.querySelector("video");\n\ndocument.addEventListener("visibilitychange", function() {\n  if (document.hidden) {\n    // 页面隐藏时暂停\n    if (!video.paused) {\n      video.pause();\n      video.dataset.autoPaused = "true";\n    }\n  } else {\n    // 页面显示时恢复（如果是自动暂停的）\n    if (video.dataset.autoPaused === "true") {\n      video.play();\n      delete video.dataset.autoPaused;\n    }\n  }\n});',
                        content: "页面隐藏时自动暂停视频。"
                    },
                    {
                        title: "暂停动画和轮询",
                        code: 'let animationId;\nlet pollInterval;\n\nfunction startAnimation() {\n  function animate() {\n    // 动画逻辑\n    animationId = requestAnimationFrame(animate);\n  }\n  animate();\n}\n\nfunction stopAnimation() {\n  cancelAnimationFrame(animationId);\n}\n\nfunction startPolling() {\n  pollInterval = setInterval(fetchData, 5000);\n}\n\nfunction stopPolling() {\n  clearInterval(pollInterval);\n}\n\ndocument.addEventListener("visibilitychange", function() {\n  if (document.hidden) {\n    // 页面隐藏：停止动画和轮询\n    stopAnimation();\n    stopPolling();\n  } else {\n    // 页面显示：恢复\n    startAnimation();\n    startPolling();\n    // 立即刷新一次数据\n    fetchData();\n  }\n});',
                        content: "节省CPU和网络资源。"
                    },
                    {
                        title: "统计用户行为",
                        code: 'let visibleTime = 0;\nlet lastVisibleTime = Date.now();\n\ndocument.addEventListener("visibilitychange", function() {\n  if (document.hidden) {\n    // 累计可见时长\n    visibleTime += Date.now() - lastVisibleTime;\n    \n    // 发送统计数据\n    sendAnalytics({\n      event: "page_hidden",\n      visibleTime: visibleTime\n    });\n  } else {\n    // 记录开始时间\n    lastVisibleTime = Date.now();\n    \n    sendAnalytics({\n      event: "page_visible"\n    });\n  }\n});\n\n// 页面卸载时\nwindow.addEventListener("beforeunload", function() {\n  if (!document.hidden) {\n    visibleTime += Date.now() - lastVisibleTime;\n  }\n  \n  sendAnalytics({\n    event: "page_unload",\n    totalVisibleTime: visibleTime\n  });\n});',
                        content: "精确统计页面实际可见时长。"
                    },
                    {
                        title: "游戏暂停",
                        code: 'class Game {\n  constructor() {\n    this.paused = false;\n    this.setupVisibilityListener();\n  }\n  \n  setupVisibilityListener() {\n    document.addEventListener("visibilitychange", () => {\n      if (document.hidden && !this.paused) {\n        this.pause();\n        this.autoPaused = true;\n      } else if (!document.hidden && this.autoPaused) {\n        this.resume();\n        this.autoPaused = false;\n      }\n    });\n  }\n  \n  pause() {\n    this.paused = true;\n    // 暂停游戏逻辑\n    this.showPauseScreen();\n  }\n  \n  resume() {\n    this.paused = false;\n    // 恢复游戏\n    this.hidePauseScreen();\n  }\n}',
                        content: "游戏自动暂停。"
                    },
                    {
                        title: "浏览器支持",
                        points: [
                            "所有现代浏览器支持",
                            "移动端也支持",
                            "切换标签页会触发",
                            "最小化窗口会触发",
                            "锁屏也可能触发"
                        ]
                    }
                ]
            },
            source: "Page Visibility API"
        },
        {
            difficulty: "hard",
            tags: ["Web Workers", "多线程"],
            question: "Web Workers的特点和限制？",
            type: "multiple-choice",
            options: [
                "在后台线程运行JavaScript",
                "不能访问DOM",
                "通过消息通信",
                "可以提升性能"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Web Workers",
                description: "JavaScript的多线程解决方案。",
                sections: [
                    {
                        title: "创建Worker",
                        code: '// worker.js\nself.addEventListener("message", function(e) {\n  console.log("Worker收到:", e.data);\n  \n  // 执行计算\n  const result = heavyCalculation(e.data);\n  \n  // 发送结果\n  self.postMessage(result);\n});\n\nfunction heavyCalculation(data) {\n  // 耗时计算\n  let sum = 0;\n  for (let i = 0; i < 1000000000; i++) {\n    sum += i;\n  }\n  return sum;\n}\n\n// main.js\nconst worker = new Worker("worker.js");\n\n// 发送消息\nworker.postMessage({type: "calculate", value: 100});\n\n// 接收消息\nworker.addEventListener("message", function(e) {\n  console.log("主线程收到:", e.data);\n});\n\n// 错误处理\nworker.addEventListener("error", function(e) {\n  console.error("Worker错误:", e.message);\n});\n\n// 终止Worker\nworker.terminate();',
                        points: [
                            "new Worker()创建",
                            "postMessage发送消息",
                            "message事件接收",
                            "terminate()终止"
                        ]
                    },
                    {
                        title: "Worker限制",
                        code: '// Worker中不能访问\n// - DOM (document, window)\n// - alert, confirm\n// - localStorage, sessionStorage\n\n// Worker中可以使用\n// - XMLHttpRequest / fetch\n// - setTimeout / setInterval\n// - navigator\n// - location (只读)\n// - importScripts()\n// - WebSocket\n// - IndexedDB',
                        points: [
                            "无法访问DOM",
                            "无法访问window对象",
                            "可以使用网络请求",
                            "可以使用定时器",
                            "独立的全局作用域"
                        ]
                    },
                    {
                        title: "传输数据",
                        code: '// 方式1：结构化克隆（复制）\nconst data = {name: "test", arr: [1, 2, 3]};\nworker.postMessage(data);\n// data被复制，修改不影响原对象\n\n// 方式2：Transferable Objects（转移所有权）\nconst buffer = new ArrayBuffer(1024);\nworker.postMessage(buffer, [buffer]);\n// buffer所有权转移给Worker\n// 主线程无法再访问\nconsole.log(buffer.byteLength);  // 0\n\n// 可转移的类型\n// - ArrayBuffer\n// - MessagePort\n// - ImageBitmap\n// - OffscreenCanvas',
                        content: "两种数据传输方式。"
                    },
                    {
                        title: "实际应用",
                        code: '// 图片处理Worker\n// imageWorker.js\nself.addEventListener("message", function(e) {\n  const {imageData, filter} = e.data;\n  \n  // 应用滤镜\n  const pixels = imageData.data;\n  for (let i = 0; i < pixels.length; i += 4) {\n    if (filter === "grayscale") {\n      const avg = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;\n      pixels[i] = pixels[i+1] = pixels[i+2] = avg;\n    }\n  }\n  \n  self.postMessage({imageData}, [imageData.data.buffer]);\n});\n\n// main.js\nconst canvas = document.getElementById("canvas");\nconst ctx = canvas.getContext("2d");\nconst imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n\nconst worker = new Worker("imageWorker.js");\nworker.postMessage({\n  imageData,\n  filter: "grayscale"\n}, [imageData.data.buffer]);\n\nworker.addEventListener("message", function(e) {\n  ctx.putImageData(e.data.imageData, 0, 0);\n});',
                        content: "使用Worker处理图片。"
                    },
                    {
                        title: "Shared Worker",
                        code: '// shared-worker.js\nconst connections = [];\n\nself.addEventListener("connect", function(e) {\n  const port = e.ports[0];\n  connections.push(port);\n  \n  port.addEventListener("message", function(e) {\n    // 广播给所有连接\n    connections.forEach(p => {\n      if (p !== port) {\n        p.postMessage(e.data);\n      }\n    });\n  });\n  \n  port.start();\n});\n\n// main.js\nconst worker = new SharedWorker("shared-worker.js");\n\nworker.port.addEventListener("message", function(e) {\n  console.log("收到消息:", e.data);\n});\n\nworker.port.start();\nworker.port.postMessage("Hello");',
                        content: "Shared Worker可在多个标签页间共享。"
                    }
                ]
            },
            source: "Web Workers API"
        },
        {
            difficulty: "medium",
            tags: ["Intersection Observer", "滚动"],
            question: "Intersection Observer API的用途？",
            options: [
                "监听元素可见性",
                "实现懒加载",
                "无限滚动",
                "性能优于scroll事件"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Intersection Observer API",
                description: "异步观察元素与视口的交叉状态。",
                sections: [
                    {
                        title: "基本用法",
                        code: 'const observer = new IntersectionObserver(\n  function(entries, observer) {\n    entries.forEach(entry => {\n      console.log("元素:", entry.target);\n      console.log("是否可见:", entry.isIntersecting);\n      console.log("可见比例:", entry.intersectionRatio);\n      console.log("边界:", entry.boundingClientRect);\n      console.log("视口:", entry.rootBounds);\n    });\n  },\n  {\n    root: null,           // 视口（null = 浏览器视口）\n    rootMargin: "0px",    // 视口边距\n    threshold: 0.5        // 触发阈值（50%可见）\n  }\n);\n\n// 观察元素\nconst target = document.querySelector(".target");\nobserver.observe(target);\n\n// 停止观察\nobserver.unobserve(target);\n\n// 停止所有观察\nobserver.disconnect();',
                        points: [
                            "异步回调",
                            "不阻塞主线程",
                            "threshold设置触发点",
                            "可以观察多个元素"
                        ]
                    },
                    {
                        title: "图片懒加载",
                        code: '<img data-src="image.jpg" alt="图片">\n\n<script>\nconst images = document.querySelectorAll("img[data-src]");\n\nconst imageObserver = new IntersectionObserver(\n  function(entries) {\n    entries.forEach(entry => {\n      if (entry.isIntersecting) {\n        const img = entry.target;\n        img.src = img.dataset.src;\n        img.removeAttribute("data-src");\n        imageObserver.unobserve(img);\n      }\n    });\n  },\n  {\n    rootMargin: "50px"  // 提前50px加载\n  }\n);\n\nimages.forEach(img => imageObserver.observe(img));\n</script>',
                        content: "进入视口才加载图片。"
                    },
                    {
                        title: "无限滚动",
                        code: '<div id="content">\n  <!-- 内容列表 -->\n</div>\n<div id="sentinel"></div>\n\n<script>\nlet page = 1;\nlet loading = false;\n\nconst sentinel = document.getElementById("sentinel");\nconst content = document.getElementById("content");\n\nconst sentinelObserver = new IntersectionObserver(\n  async function(entries) {\n    const entry = entries[0];\n    if (entry.isIntersecting && !loading) {\n      loading = true;\n      \n      // 加载更多数据\n      const data = await fetchData(page++);\n      content.innerHTML += renderItems(data);\n      \n      loading = false;\n    }\n  },\n  {threshold: 1.0}\n);\n\nsentinelObserver.observe(sentinel);\n</script>',
                        content: "滚动到底部自动加载。"
                    },
                    {
                        title: "曝光统计",
                        code: 'const items = document.querySelectorAll(".product-item");\n\nconst exposureObserver = new IntersectionObserver(\n  function(entries) {\n    entries.forEach(entry => {\n      if (entry.isIntersecting) {\n        // 曝光统计\n        const id = entry.target.dataset.id;\n        trackExposure(id);\n        \n        // 只统计一次\n        exposureObserver.unobserve(entry.target);\n      }\n    });\n  },\n  {\n    threshold: 0.5  // 50%可见才算曝光\n  }\n);\n\nitems.forEach(item => exposureObserver.observe(item));',
                        content: "统计元素曝光。"
                    },
                    {
                        title: "动画触发",
                        code: 'const animateElements = document.querySelectorAll(".animate-on-scroll");\n\nconst animationObserver = new IntersectionObserver(\n  function(entries) {\n    entries.forEach(entry => {\n      if (entry.isIntersecting) {\n        entry.target.classList.add("animated");\n        // 动画只执行一次\n        animationObserver.unobserve(entry.target);\n      }\n    });\n  },\n  {threshold: 0.2}\n);\n\nanimateElements.forEach(el => animationObserver.observe(el));',
                        content: "滚动到元素时触发动画。"
                    },
                    {
                        title: "multiple thresholds",
                        code: 'const observer = new IntersectionObserver(\n  function(entries) {\n    entries.forEach(entry => {\n      const ratio = entry.intersectionRatio;\n      console.log(`可见 ${(ratio * 100).toFixed(0)}%`);\n      \n      if (ratio >= 0.75) {\n        console.log("大部分可见");\n      } else if (ratio >= 0.5) {\n        console.log("一半可见");\n      } else if (ratio >= 0.25) {\n        console.log("少量可见");\n      }\n    });\n  },\n  {\n    threshold: [0, 0.25, 0.5, 0.75, 1.0]\n  }\n);\n\nobserver.observe(element);',
                        content: "多个阈值精确控制。"
                    }
                ]
            },
            source: "Intersection Observer API"
        }
    ],
    navigation: {
        prev: { title: "语义化标签", url: "quiz.html?chapter=12" },
        next: { title: "HTML5 API（下）", url: "quiz.html?chapter=14" }
    }
};
