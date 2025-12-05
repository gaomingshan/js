// 第14章：HTML5 API（下）- 面试题
window.htmlQuizData_14 = {
    config: {
        title: "HTML5 API（下）",
        icon: "🔥",
        description: "测试你对HTML5高级API的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "hard",
            tags: ["Service Worker", "PWA"],
            question: "Service Worker的生命周期有哪些阶段？",
            type: "multiple-choice",
            options: [
                "注册、安装、激活",
                "可以拦截网络请求",
                "支持离线缓存",
                "独立于页面运行"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Service Worker",
                description: "Service Worker是PWA的核心技术。",
                sections: [
                    {
                        title: "注册Service Worker",
                        code: '// main.js\nif ("serviceWorker" in navigator) {\n  navigator.serviceWorker.register("/sw.js")\n    .then(function(registration) {\n      console.log("注册成功:", registration.scope);\n    })\n    .catch(function(error) {\n      console.log("注册失败:", error);\n    });\n}',
                        points: [
                            "必须HTTPS（localhost除外）",
                            "scope决定控制范围",
                            "默认scope是sw.js所在目录",
                            "只注册一次"
                        ]
                    },
                    {
                        title: "安装阶段",
                        code: '// sw.js\nconst CACHE_NAME = "v1";\nconst urlsToCache = [\n  "/",\n  "/index.html",\n  "/styles.css",\n  "/script.js"\n];\n\nself.addEventListener("install", function(event) {\n  console.log("Service Worker 安装中");\n  \n  event.waitUntil(\n    caches.open(CACHE_NAME)\n      .then(function(cache) {\n        console.log("缓存已打开");\n        return cache.addAll(urlsToCache);\n      })\n  );\n  \n  // 立即激活\n  self.skipWaiting();\n});',
                        points: [
                            "install事件",
                            "预缓存资源",
                            "waitUntil确保完成",
                            "skipWaiting跳过等待"
                        ]
                    },
                    {
                        title: "激活阶段",
                        code: 'self.addEventListener("activate", function(event) {\n  console.log("Service Worker 激活");\n  \n  event.waitUntil(\n    caches.keys().then(function(cacheNames) {\n      return Promise.all(\n        cacheNames.map(function(cacheName) {\n          // 删除旧缓存\n          if (cacheName !== CACHE_NAME) {\n            console.log("删除旧缓存:", cacheName);\n            return caches.delete(cacheName);\n          }\n        })\n      );\n    })\n  );\n  \n  // 立即控制所有客户端\n  return self.clients.claim();\n});',
                        content: "激活时清理旧缓存。"
                    },
                    {
                        title: "拦截请求",
                        code: 'self.addEventListener("fetch", function(event) {\n  event.respondWith(\n    caches.match(event.request)\n      .then(function(response) {\n        // 缓存命中\n        if (response) {\n          return response;\n        }\n        \n        // 网络请求\n        return fetch(event.request)\n          .then(function(response) {\n            // 检查有效响应\n            if (!response || response.status !== 200) {\n              return response;\n            }\n            \n            // 克隆响应（只能读一次）\n            const responseToCache = response.clone();\n            \n            // 缓存新资源\n            caches.open(CACHE_NAME)\n              .then(function(cache) {\n                cache.put(event.request, responseToCache);\n              });\n            \n            return response;\n          });\n      })\n      .catch(function() {\n        // 网络失败，返回离线页面\n        return caches.match("/offline.html");\n      })\n  );\n});',
                        content: "缓存优先策略。"
                    },
                    {
                        title: "更新Service Worker",
                        code: '// 检查更新\nnavigator.serviceWorker.register("/sw.js")\n  .then(function(registration) {\n    // 检查更新\n    registration.update();\n    \n    // 监听更新\n    registration.addEventListener("updatefound", function() {\n      const newWorker = registration.installing;\n      \n      newWorker.addEventListener("statechange", function() {\n        if (newWorker.state === "installed" &&\n            navigator.serviceWorker.controller) {\n          // 新版本可用\n          console.log("新版本可用，请刷新");\n          \n          // 提示用户\n          if (confirm("发现新版本，是否刷新？")) {\n            window.location.reload();\n          }\n        }\n      });\n    });\n  });',
                        content: "处理Service Worker更新。"
                    },
                    {
                        title: "通信",
                        code: '// 页面向SW发送消息\nnavigator.serviceWorker.controller.postMessage({\n  type: "CACHE_URLS",\n  urls: ["/new-page.html"]\n});\n\n// SW监听消息\nself.addEventListener("message", function(event) {\n  if (event.data.type === "CACHE_URLS") {\n    event.waitUntil(\n      caches.open(CACHE_NAME)\n        .then(cache => cache.addAll(event.data.urls))\n    );\n  }\n});\n\n// SW向页面发送消息\nself.clients.matchAll().then(clients => {\n  clients.forEach(client => {\n    client.postMessage({type: "UPDATE_AVAILABLE"});\n  });\n});',
                        content: "页面与Service Worker双向通信。"
                    }
                ]
            },
            source: "Service Worker API"
        },
        {
            difficulty: "medium",
            tags: ["IndexedDB", "数据库"],
            question: "IndexedDB的特点？",
            options: [
                "NoSQL数据库",
                "支持事务",
                "异步API",
                "容量大"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "IndexedDB",
                description: "浏览器端的NoSQL数据库。",
                sections: [
                    {
                        title: "打开数据库",
                        code: 'const request = indexedDB.open("MyDatabase", 1);\n\n// 升级（创建表）\nrequest.onupgradeneeded = function(event) {\n  const db = event.target.result;\n  \n  // 创建对象仓库（表）\n  if (!db.objectStoreNames.contains("users")) {\n    const objectStore = db.createObjectStore("users", {\n      keyPath: "id",\n      autoIncrement: true\n    });\n    \n    // 创建索引\n    objectStore.createIndex("name", "name", {unique: false});\n    objectStore.createIndex("email", "email", {unique: true});\n  }\n};\n\n// 成功\nrequest.onsuccess = function(event) {\n  const db = event.target.result;\n  console.log("数据库打开成功");\n};\n\n// 失败\nrequest.onerror = function(event) {\n  console.error("数据库错误:", event.target.error);\n};',
                        points: [
                            "open()打开/创建数据库",
                            "版本号控制结构",
                            "onupgradeneeded创建表",
                            "异步回调"
                        ]
                    },
                    {
                        title: "增删改查",
                        code: 'const db = /* ... */;\n\n// 添加数据\nfunction addUser(user) {\n  const transaction = db.transaction(["users"], "readwrite");\n  const objectStore = transaction.objectStore("users");\n  const request = objectStore.add(user);\n  \n  request.onsuccess = function() {\n    console.log("添加成功");\n  };\n}\n\naddUser({name: "张三", email: "zhangsan@example.com"});\n\n// 读取数据\nfunction getUser(id) {\n  const transaction = db.transaction(["users"]);\n  const objectStore = transaction.objectStore("users");\n  const request = objectStore.get(id);\n  \n  request.onsuccess = function() {\n    console.log("用户:", request.result);\n  };\n}\n\ngetUser(1);\n\n// 更新数据\nfunction updateUser(user) {\n  const transaction = db.transaction(["users"], "readwrite");\n  const objectStore = transaction.objectStore("users");\n  const request = objectStore.put(user);\n  \n  request.onsuccess = function() {\n    console.log("更新成功");\n  };\n}\n\nupdateUser({id: 1, name: "李四", email: "lisi@example.com"});\n\n// 删除数据\nfunction deleteUser(id) {\n  const transaction = db.transaction(["users"], "readwrite");\n  const objectStore = transaction.objectStore("users");\n  const request = objectStore.delete(id);\n  \n  request.onsuccess = function() {\n    console.log("删除成功");\n  };\n}\n\ndeleteUser(1);',
                        content: "基本的CRUD操作。"
                    },
                    {
                        title: "查询和遍历",
                        code: '// 获取所有\nfunction getAllUsers() {\n  const transaction = db.transaction(["users"]);\n  const objectStore = transaction.objectStore("users");\n  const request = objectStore.getAll();\n  \n  request.onsuccess = function() {\n    console.log("所有用户:", request.result);\n  };\n}\n\n// 游标遍历\nfunction iterateUsers() {\n  const transaction = db.transaction(["users"]);\n  const objectStore = transaction.objectStore("users");\n  const request = objectStore.openCursor();\n  \n  request.onsuccess = function(event) {\n    const cursor = event.target.result;\n    if (cursor) {\n      console.log("用户:", cursor.value);\n      cursor.continue();  // 下一个\n    } else {\n      console.log("遍历完成");\n    }\n  };\n}\n\n// 使用索引查询\nfunction findByEmail(email) {\n  const transaction = db.transaction(["users"]);\n  const objectStore = transaction.objectStore("users");\n  const index = objectStore.index("email");\n  const request = index.get(email);\n  \n  request.onsuccess = function() {\n    console.log("找到:", request.result);\n  };\n}\n\nfindByEmail("zhangsan@example.com");',
                        content: "支持多种查询方式。"
                    },
                    {
                        title: "Promise封装",
                        code: 'class DB {\n  constructor(dbName, version) {\n    this.dbName = dbName;\n    this.version = version;\n  }\n  \n  open(onUpgrade) {\n    return new Promise((resolve, reject) => {\n      const request = indexedDB.open(this.dbName, this.version);\n      \n      request.onupgradeneeded = onUpgrade;\n      request.onsuccess = () => resolve(request.result);\n      request.onerror = () => reject(request.error);\n    });\n  }\n  \n  async add(storeName, data) {\n    const db = await this.open();\n    return new Promise((resolve, reject) => {\n      const transaction = db.transaction([storeName], "readwrite");\n      const store = transaction.objectStore(storeName);\n      const request = store.add(data);\n      \n      request.onsuccess = () => resolve(request.result);\n      request.onerror = () => reject(request.error);\n    });\n  }\n  \n  async get(storeName, key) {\n    const db = await this.open();\n    return new Promise((resolve, reject) => {\n      const transaction = db.transaction([storeName]);\n      const store = transaction.objectStore(storeName);\n      const request = store.get(key);\n      \n      request.onsuccess = () => resolve(request.result);\n      request.onerror = () => reject(request.error);\n    });\n  }\n}\n\n// 使用\nconst db = new DB("MyDatabase", 1);\nawait db.add("users", {name: "张三"});\nconst user = await db.get("users", 1);',
                        content: "Promise化IndexedDB API。"
                    }
                ]
            },
            source: "IndexedDB API"
        },
        {
            difficulty: "medium",
            tags: ["File API", "文件"],
            question: "如何使用File API读取文件？",
            type: "multiple-choice",
            options: [
                "FileReader读取文件内容",
                "支持多种读取方式",
                "可以读取文本和二进制",
                "异步操作"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "File API",
                description: "客户端文件操作API。",
                sections: [
                    {
                        title: "获取文件",
                        code: '<input type="file" id="fileInput" multiple>\n\n<script>\nconst fileInput = document.getElementById("fileInput");\n\nfileInput.addEventListener("change", function(e) {\n  const files = e.target.files;  // FileList\n  \n  for (const file of files) {\n    console.log("文件名:", file.name);\n    console.log("大小:", file.size, "字节");\n    console.log("类型:", file.type);\n    console.log("最后修改:", new Date(file.lastModified));\n  }\n});\n</script>',
                        points: [
                            "input[type=file]获取",
                            "拖放获取",
                            "File对象属性",
                            "FileList类数组"
                        ]
                    },
                    {
                        title: "读取文本文件",
                        code: 'function readTextFile(file) {\n  const reader = new FileReader();\n  \n  reader.onload = function(e) {\n    const content = e.target.result;\n    console.log("文件内容:", content);\n  };\n  \n  reader.onerror = function() {\n    console.error("读取失败");\n  };\n  \n  reader.readAsText(file, "UTF-8");\n}\n\nfileInput.addEventListener("change", function(e) {\n  const file = e.target.files[0];\n  if (file) {\n    readTextFile(file);\n  }\n});',
                        content: "readAsText读取文本。"
                    },
                    {
                        title: "读取图片",
                        code: '<input type="file" accept="image/*" id="imageInput">\n<img id="preview" style="max-width:300px">\n\n<script>\nconst imageInput = document.getElementById("imageInput");\nconst preview = document.getElementById("preview");\n\nimageInput.addEventListener("change", function(e) {\n  const file = e.target.files[0];\n  \n  if (file && file.type.startsWith("image/")) {\n    const reader = new FileReader();\n    \n    reader.onload = function(e) {\n      preview.src = e.target.result;  // Data URL\n    };\n    \n    reader.readAsDataURL(file);\n  }\n});\n</script>',
                        content: "readAsDataURL读取为Base64。"
                    },
                    {
                        title: "读取二进制",
                        code: 'function readBinaryFile(file) {\n  const reader = new FileReader();\n  \n  reader.onload = function(e) {\n    const arrayBuffer = e.target.result;\n    const uint8Array = new Uint8Array(arrayBuffer);\n    \n    console.log("字节数:", uint8Array.length);\n    console.log("前10字节:", uint8Array.slice(0, 10));\n    \n    // 处理二进制数据\n    processBuffer(arrayBuffer);\n  };\n  \n  reader.readAsArrayBuffer(file);\n}\n\n// 或使用readAsBinaryString（已废弃）\nreader.readAsBinaryString(file);',
                        content: "readAsArrayBuffer读取二进制。"
                    },
                    {
                        title: "进度监控",
                        code: 'function readWithProgress(file) {\n  const reader = new FileReader();\n  \n  reader.onloadstart = function() {\n    console.log("开始读取");\n  };\n  \n  reader.onprogress = function(e) {\n    if (e.lengthComputable) {\n      const percent = (e.loaded / e.total) * 100;\n      console.log(`进度: ${percent.toFixed(2)}%`);\n      updateProgressBar(percent);\n    }\n  };\n  \n  reader.onload = function() {\n    console.log("读取完成");\n  };\n  \n  reader.onerror = function() {\n    console.error("读取错误:", reader.error);\n  };\n  \n  reader.onabort = function() {\n    console.log("读取中止");\n  };\n  \n  reader.readAsArrayBuffer(file);\n}\n\n// 中止读取\nreader.abort();',
                        content: "监控读取进度。"
                    },
                    {
                        title: "分片读取大文件",
                        code: 'function readFileInChunks(file, chunkSize = 1024 * 1024) {\n  let offset = 0;\n  \n  function readNextChunk() {\n    const slice = file.slice(offset, offset + chunkSize);\n    const reader = new FileReader();\n    \n    reader.onload = function(e) {\n      const chunk = e.target.result;\n      \n      // 处理分片\n      processChunk(chunk);\n      \n      offset += chunkSize;\n      \n      if (offset < file.size) {\n        readNextChunk();  // 读取下一片\n      } else {\n        console.log("读取完成");\n      }\n    };\n    \n    reader.readAsArrayBuffer(slice);\n  }\n  \n  readNextChunk();\n}',
                        content: "分片读取避免内存溢出。"
                    }
                ]
            },
            source: "File API"
        },
        {
            difficulty: "hard",
            tags: ["Fetch API", "网络"],
            question: "Fetch API相比XMLHttpRequest的优势？",
            options: [
                "基于Promise",
                "更简洁的API",
                "支持Request/Response对象",
                "更好的流处理"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Fetch API",
                description: "现代化的网络请求API。",
                sections: [
                    {
                        title: "基本用法",
                        code: '// GET请求\nfetch("https://api.example.com/data")\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error(error));\n\n// async/await\nasync function fetchData() {\n  try {\n    const response = await fetch("https://api.example.com/data");\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error(error);\n  }\n}',
                        points: [
                            "返回Promise",
                            "默认GET请求",
                            "response.json()解析",
                            "支持async/await"
                        ]
                    },
                    {
                        title: "POST请求",
                        code: '// 发送JSON\nfetch("https://api.example.com/users", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    name: "张三",\n    age: 25\n  })\n})\n.then(response => response.json())\n.then(data => console.log(data));\n\n// 发送FormData\nconst formData = new FormData();\nformData.append("name", "张三");\nformData.append("file", fileInput.files[0]);\n\nfetch("/upload", {\n  method: "POST",\n  body: formData\n});',
                        content: "支持多种请求体格式。"
                    },
                    {
                        title: "Response对象",
                        code: 'const response = await fetch("/api/data");\n\n// 状态\nconsole.log(response.ok);         // 200-299为true\nconsole.log(response.status);     // 状态码\nconsole.log(response.statusText); // 状态文本\nconsole.log(response.headers);    // Headers对象\n\n// 解析响应体\nconst json = await response.json();       // JSON\nconst text = await response.text();       // 文本\nconst blob = await response.blob();       // Blob\nconst buffer = await response.arrayBuffer();  // ArrayBuffer\nconst formData = await response.formData();   // FormData\n\n// 克隆响应（body只能读一次）\nconst clone = response.clone();',
                        points: [
                            "ok: 200-299",
                            "status: 状态码",
                            "多种解析方式",
                            "body只能读一次"
                        ]
                    },
                    {
                        title: "错误处理",
                        code: 'async function fetchWithErrorHandling(url) {\n  try {\n    const response = await fetch(url);\n    \n    // fetch只在网络错误时reject\n    // 4xx、5xx不会reject，需要手动检查\n    if (!response.ok) {\n      throw new Error(`HTTP错误: ${response.status}`);\n    }\n    \n    return await response.json();\n  } catch (error) {\n    if (error.name === "TypeError") {\n      console.error("网络错误:", error);\n    } else {\n      console.error("其他错误:", error);\n    }\n    throw error;\n  }\n}',
                        content: "注意fetch的错误处理特点。"
                    },
                    {
                        title: "请求配置",
                        code: 'fetch(url, {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer token"\n  },\n  body: JSON.stringify(data),\n  \n  mode: "cors",        // cors | no-cors | same-origin\n  credentials: "include",  // omit | same-origin | include\n  cache: "no-cache",   // default | no-cache | reload | force-cache\n  redirect: "follow",  // follow | error | manual\n  referrer: "client",  // client | no-referrer | URL\n  \n  signal: abortController.signal  // 中止信号\n});',
                        content: "丰富的配置选项。"
                    },
                    {
                        title: "中止请求",
                        code: 'const controller = new AbortController();\nconst signal = controller.signal;\n\n// 5秒后中止\nsetTimeout(() => controller.abort(), 5000);\n\ntry {\n  const response = await fetch(url, { signal });\n  const data = await response.json();\n} catch (error) {\n  if (error.name === "AbortError") {\n    console.log("请求被中止");\n  }\n}\n\n// 手动中止\ncontroller.abort();',
                        content: "使用AbortController中止请求。"
                    },
                    {
                        title: "流式处理",
                        code: 'async function streamFetch(url) {\n  const response = await fetch(url);\n  const reader = response.body.getReader();\n  \n  while (true) {\n    const { done, value } = await reader.read();\n    \n    if (done) break;\n    \n    // value是Uint8Array\n    console.log("收到数据块:", value.length, "字节");\n    processChunk(value);\n  }\n}\n\n// 下载进度\nasync function downloadWithProgress(url) {\n  const response = await fetch(url);\n  const contentLength = response.headers.get("Content-Length");\n  const total = parseInt(contentLength, 10);\n  let loaded = 0;\n  \n  const reader = response.body.getReader();\n  const chunks = [];\n  \n  while (true) {\n    const { done, value } = await reader.read();\n    \n    if (done) break;\n    \n    chunks.push(value);\n    loaded += value.length;\n    \n    const progress = (loaded / total) * 100;\n    console.log(`进度: ${progress.toFixed(2)}%`);\n  }\n  \n  // 合并数据块\n  const blob = new Blob(chunks);\n  return blob;\n}',
                        content: "支持流式处理大文件。"
                    }
                ]
            },
            source: "Fetch API"
        },
        {
            difficulty: "medium",
            tags: ["WebSocket", "实时通信"],
            question: "WebSocket的特点和用法？",
            type: "multiple-choice",
            options: [
                "全双工通信",
                "基于TCP",
                "支持二进制和文本",
                "需要服务器支持"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "WebSocket",
                description: "实时双向通信协议。",
                sections: [
                    {
                        title: "建立连接",
                        code: 'const socket = new WebSocket("ws://localhost:8080");\n// 或WSS加密连接\nconst secureSocket = new WebSocket("wss://example.com/socket");\n\n// 连接打开\nsocket.addEventListener("open", function(event) {\n  console.log("连接已建立");\n  socket.send("Hello Server!");\n});\n\n// 接收消息\nsocket.addEventListener("message", function(event) {\n  console.log("收到消息:", event.data);\n});\n\n// 连接关闭\nsocket.addEventListener("close", function(event) {\n  console.log("连接已关闭", event.code, event.reason);\n});\n\n// 错误\nsocket.addEventListener("error", function(event) {\n  console.error("WebSocket错误");\n});',
                        points: [
                            "ws://或wss://协议",
                            "open事件：连接建立",
                            "message事件：收到消息",
                            "close事件：连接关闭"
                        ]
                    },
                    {
                        title: "发送数据",
                        code: '// 发送文本\nsocket.send("Hello");\nsocket.send(JSON.stringify({type: "message", content: "Hi"}));\n\n// 发送二进制\nconst buffer = new ArrayBuffer(8);\nsocket.send(buffer);\n\nconst blob = new Blob(["Hello"]);\nsocket.send(blob);\n\n// 检查连接状态\nif (socket.readyState === WebSocket.OPEN) {\n  socket.send("data");\n}\n\n// readyState:\n// 0 - CONNECTING: 连接中\n// 1 - OPEN: 已连接\n// 2 - CLOSING: 关闭中\n// 3 - CLOSED: 已关闭',
                        content: "支持文本和二进制数据。"
                    },
                    {
                        title: "心跳机制",
                        code: 'class WebSocketClient {\n  constructor(url) {\n    this.url = url;\n    this.pingInterval = null;\n    this.reconnectTimer = null;\n    this.connect();\n  }\n  \n  connect() {\n    this.socket = new WebSocket(this.url);\n    \n    this.socket.onopen = () => {\n      console.log("连接成功");\n      this.startHeartbeat();\n    };\n    \n    this.socket.onmessage = (event) => {\n      const data = JSON.parse(event.data);\n      \n      if (data.type === "pong") {\n        // 收到心跳响应\n        return;\n      }\n      \n      this.handleMessage(data);\n    };\n    \n    this.socket.onclose = () => {\n      console.log("连接关闭");\n      this.stopHeartbeat();\n      this.reconnect();\n    };\n  }\n  \n  startHeartbeat() {\n    this.pingInterval = setInterval(() => {\n      if (this.socket.readyState === WebSocket.OPEN) {\n        this.socket.send(JSON.stringify({type: "ping"}));\n      }\n    }, 30000);  // 30秒\n  }\n  \n  stopHeartbeat() {\n    if (this.pingInterval) {\n      clearInterval(this.pingInterval);\n    }\n  }\n  \n  reconnect() {\n    this.reconnectTimer = setTimeout(() => {\n      console.log("尝试重连...");\n      this.connect();\n    }, 5000);\n  }\n  \n  send(data) {\n    if (this.socket.readyState === WebSocket.OPEN) {\n      this.socket.send(JSON.stringify(data));\n    }\n  }\n  \n  close() {\n    this.stopHeartbeat();\n    clearTimeout(this.reconnectTimer);\n    this.socket.close();\n  }\n}',
                        content: "实现心跳和断线重连。"
                    },
                    {
                        title: "聊天室示例",
                        code: 'class ChatRoom {\n  constructor(url) {\n    this.socket = new WebSocket(url);\n    this.setupListeners();\n  }\n  \n  setupListeners() {\n    this.socket.onopen = () => {\n      this.onConnect();\n    };\n    \n    this.socket.onmessage = (event) => {\n      const message = JSON.parse(event.data);\n      this.handleMessage(message);\n    };\n  }\n  \n  sendMessage(content) {\n    const message = {\n      type: "message",\n      content,\n      timestamp: Date.now()\n    };\n    this.socket.send(JSON.stringify(message));\n  }\n  \n  handleMessage(message) {\n    switch (message.type) {\n      case "message":\n        this.displayMessage(message);\n        break;\n      case "user_joined":\n        this.showNotification(`${message.user}加入了`);\n        break;\n      case "user_left":\n        this.showNotification(`${message.user}离开了`);\n        break;\n    }\n  }\n  \n  displayMessage(message) {\n    const div = document.createElement("div");\n    div.textContent = message.content;\n    document.getElementById("messages").appendChild(div);\n  }\n}\n\n// 使用\nconst chat = new ChatRoom("ws://localhost:8080/chat");\n\ndocument.getElementById("send").onclick = () => {\n  const input = document.getElementById("input");\n  chat.sendMessage(input.value);\n  input.value = "";\n};',
                        content: "实现简单的聊天室。"
                    }
                ]
            },
            source: "WebSocket API"
        },
        {
            difficulty: "medium",
            tags: ["Clipboard API", "剪贴板"],
            question: "Clipboard API如何读写剪贴板？",
            type: "multiple-choice",
            options: [
                "需要用户授权",
                "支持文本和图片",
                "异步API",
                "HTTPS限制"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Clipboard API",
                description: "现代化的剪贴板操作API。",
                sections: [
                    {
                        title: "复制文本",
                        code: '// 方式1：Clipboard API\nasync function copyText(text) {\n  try {\n    await navigator.clipboard.writeText(text);\n    console.log("复制成功");\n  } catch (err) {\n    console.error("复制失败:", err);\n  }\n}\n\ncopyText("Hello World");\n\n// 方式2：旧方法（document.execCommand）\nfunction copyTextOld(text) {\n  const textarea = document.createElement("textarea");\n  textarea.value = text;\n  document.body.appendChild(textarea);\n  textarea.select();\n  document.execCommand("copy");\n  document.body.removeChild(textarea);\n}',
                        points: [
                            "writeText()复制文本",
                            "必须HTTPS",
                            "需要用户授权",
                            "异步操作"
                        ]
                    },
                    {
                        title: "粘贴文本",
                        code: '// 读取剪贴板\nasync function pasteText() {\n  try {\n    const text = await navigator.clipboard.readText();\n    console.log("剪贴板内容:", text);\n    return text;\n  } catch (err) {\n    console.error("读取失败:", err);\n  }\n}\n\n// 粘贴到输入框\ndocument.getElementById("paste").onclick = async () => {\n  const text = await pasteText();\n  document.getElementById("input").value = text;\n};',
                        content: "readText()读取文本。"
                    },
                    {
                        title: "复制图片",
                        code: '// 复制canvas为图片\nasync function copyCanvasAsImage(canvas) {\n  canvas.toBlob(async (blob) => {\n    const item = new ClipboardItem({\n      "image/png": blob\n    });\n    \n    try {\n      await navigator.clipboard.write([item]);\n      console.log("图片已复制");\n    } catch (err) {\n      console.error("复制失败:", err);\n    }\n  });\n}\n\n// 复制远程图片\nasync function copyImageFromURL(url) {\n  const response = await fetch(url);\n  const blob = await response.blob();\n  \n  const item = new ClipboardItem({\n    [blob.type]: blob\n  });\n  \n  await navigator.clipboard.write([item]);\n}',
                        content: "write()复制富内容。"
                    },
                    {
                        title: "读取图片",
                        code: '// 读取剪贴板图片\nasync function pasteImage() {\n  try {\n    const items = await navigator.clipboard.read();\n    \n    for (const item of items) {\n      // 检查类型\n      if (item.types.includes("image/png")) {\n        const blob = await item.getType("image/png");\n        const url = URL.createObjectURL(blob);\n        \n        const img = document.createElement("img");\n        img.src = url;\n        document.body.appendChild(img);\n      }\n    }\n  } catch (err) {\n    console.error("读取失败:", err);\n  }\n}\n\n// 监听粘贴事件\ndocument.addEventListener("paste", async (e) => {\n  e.preventDefault();\n  \n  const items = e.clipboardData.items;\n  \n  for (const item of items) {\n    if (item.type.startsWith("image/")) {\n      const file = item.getAsFile();\n      const url = URL.createObjectURL(file);\n      \n      const img = document.createElement("img");\n      img.src = url;\n      document.body.appendChild(img);\n    }\n  }\n});',
                        content: "read()读取富内容。"
                    },
                    {
                        title: "权限处理",
                        code: '// 检查权限\nasync function checkClipboardPermission() {\n  const result = await navigator.permissions.query({\n    name: "clipboard-read"\n  });\n  \n  console.log(result.state);\n  // "granted" | "denied" | "prompt"\n  \n  result.onchange = () => {\n    console.log("权限状态变化:", result.state);\n  };\n}\n\n// 写入不需要权限请求\n// 读取需要权限或用户手势',
                        content: "检查剪贴板权限。"
                    }
                ]
            },
            source: "Clipboard API"
        },
        {
            difficulty: "hard",
            tags: ["Broadcast Channel", "跨标签通信"],
            question: "Broadcast Channel API的用途？",
            options: [
                "跨标签页通信",
                "同源限制",
                "简单的API",
                "不依赖Service Worker"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Broadcast Channel API",
                description: "简单的跨标签页通信机制。",
                sections: [
                    {
                        title: "基本用法",
                        code: '// 页面A\nconst channel = new BroadcastChannel("my_channel");\n\n// 发送消息\nchannel.postMessage("Hello from Tab A");\nchannel.postMessage({type: "update", data: {id: 1}});\n\n// 接收消息\nchannel.onmessage = function(event) {\n  console.log("收到消息:", event.data);\n};\n\n// 页面B（相同频道）\nconst channel = new BroadcastChannel("my_channel");\n\nchannel.onmessage = function(event) {\n  console.log("收到消息:", event.data);\n};\n\nchannel.postMessage("Hello from Tab B");\n\n// 关闭频道\nchannel.close();',
                        points: [
                            "相同频道名通信",
                            "同源限制",
                            "所有标签页都能收到",
                            "发送者也会收到（需要过滤）"
                        ]
                    },
                    {
                        title: "实际应用",
                        code: '// 同步登录状态\nconst authChannel = new BroadcastChannel("auth");\n\n// 用户登录\nfunction login(user) {\n  localStorage.setItem("user", JSON.stringify(user));\n  authChannel.postMessage({type: "login", user});\n}\n\n// 用户登出\nfunction logout() {\n  localStorage.removeItem("user");\n  authChannel.postMessage({type: "logout"});\n}\n\n// 监听其他标签页的登录/登出\nauthChannel.onmessage = function(event) {\n  const { type, user } = event.data;\n  \n  if (type === "login") {\n    updateUI(user);\n  } else if (type === "logout") {\n    redirectToLogin();\n  }\n};',
                        content: "同步多标签页的登录状态。"
                    },
                    {
                        title: "主题切换同步",
                        code: 'const themeChannel = new BroadcastChannel("theme");\n\nfunction setTheme(theme) {\n  document.body.className = theme;\n  localStorage.setItem("theme", theme);\n  \n  // 通知其他标签页\n  themeChannel.postMessage({theme});\n}\n\nthemeChannel.onmessage = function(event) {\n  const { theme } = event.data;\n  document.body.className = theme;\n};',
                        content: "同步主题设置。"
                    },
                    {
                        title: "对比其他方案",
                        code: '// 1. localStorage + storage事件\n// 优点：更广泛支持\n// 缺点：只在其他标签页触发，当前页不触发\nwindow.addEventListener("storage", function(e) {\n  if (e.key === "user") {\n    // 处理\n  }\n});\n\n// 2. SharedWorker\n// 优点：可以保持状态\n// 缺点：复杂，支持较少\n\n// 3. Service Worker + postMessage\n// 优点：功能强大\n// 缺点：复杂，需要注册SW\n\n// 4. Broadcast Channel\n// 优点：简单直接\n// 缺点：较新API',
                        content: "Broadcast Channel最简单直接。"
                    }
                ]
            },
            source: "Broadcast Channel API"
        }
    ],
    navigation: {
        prev: { title: "HTML5 API（上）", url: "quiz.html?chapter=13" },
        next: { title: "可访问性", url: "quiz.html?chapter=15" }
    }
};
