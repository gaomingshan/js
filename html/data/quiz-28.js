// 第28章：离线应用 - 面试题
window.htmlQuizData_28 = {
    config: {
        title: "离线应用",
        icon: "📴",
        description: "测试你对Service Worker和PWA的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "medium",
            tags: ["Service Worker", "生命周期"],
            question: "Service Worker的生命周期状态？",
            type: "multiple-choice",
            options: [
                "installing 安装中",
                "waiting 等待激活",
                "activated 已激活",
                "redundant 废弃"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Service Worker生命周期",
                description: "理解SW的完整生命周期。",
                sections: [
                    {
                        title: "生命周期流程",
                        code: '/* Service Worker生命周期 */\n\n1. installing    - 安装中\n2. installed     - 已安装（waiting状态）\n3. activating    - 激活中\n4. activated     - 已激活\n5. redundant     - 废弃\n\n/* 完整流程 */\n注册 → installing → installed(waiting) → activating → activated\n                                              ↓\n                                          redundant\n\n/* 触发条件 */\ninstalling: 首次注册或发现新版本\nwaiting: 新版本等待旧版本释放\nactivating: 旧版本释放后\nactivated: 开始控制页面\nredundant: 被新版本替换或安装失败',
                        content: "完整的生命周期。"
                    },
                    {
                        title: "注册Service Worker",
                        code: '/* 注册SW */\nif ("serviceWorker" in navigator) {\n  window.addEventListener("load", async () => {\n    try {\n      const registration = await navigator.serviceWorker.register("/sw.js");\n      \n      console.log("SW注册成功:", registration.scope);\n      \n      // 监听更新\n      registration.addEventListener("updatefound", () => {\n        const newWorker = registration.installing;\n        console.log("发现新版本");\n        \n        newWorker.addEventListener("statechange", () => {\n          console.log("SW状态:", newWorker.state);\n          // installing → installed → activating → activated\n        });\n      });\n    } catch (error) {\n      console.error("SW注册失败:", error);\n    }\n  });\n}\n\n/* 检查SW状态 */\nnavigator.serviceWorker.ready.then((registration) => {\n  console.log("SW已就绪");\n});',
                        content: "注册和监听SW。"
                    }
                ]
            },
            source: "Service Worker API"
        },
        {
            difficulty: "hard",
            tags: ["Service Worker", "缓存"],
            question: "Service Worker的缓存策略有哪些？",
            type: "multiple-choice",
            options: [
                "Cache First 缓存优先",
                "Network First 网络优先",
                "Stale While Revalidate 后台更新",
                "Cache Only/Network Only"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "缓存策略",
                description: "不同场景的缓存策略。",
                sections: [
                    {
                        title: "Cache First",
                        code: '/* 缓存优先 - 适合静态资源 */\nself.addEventListener("fetch", (event) => {\n  event.respondWith(\n    caches.match(event.request)\n      .then((response) => {\n        // 缓存命中返回缓存\n        if (response) {\n          return response;\n        }\n        // 缓存未命中请求网络\n        return fetch(event.request);\n      })\n  );\n});',
                        content: "优先使用缓存。"
                    },
                    {
                        title: "Network First",
                        code: '/* 网络优先 - 适合动态内容 */\nself.addEventListener("fetch", (event) => {\n  event.respondWith(\n    fetch(event.request)\n      .then((response) => {\n        // 更新缓存\n        const cache = caches.open(CACHE_NAME);\n        cache.then(c => c.put(event.request, response.clone()));\n        return response;\n      })\n      .catch(() => {\n        // 网络失败返回缓存\n        return caches.match(event.request);\n      })\n  );\n});',
                        content: "优先请求网络。"
                    },
                    {
                        title: "Stale While Revalidate",
                        code: '/* 后台更新 - 返回缓存同时更新 */\nself.addEventListener("fetch", (event) => {\n  event.respondWith(\n    caches.open(CACHE_NAME).then((cache) => {\n      return cache.match(event.request).then((cachedResponse) => {\n        const fetchPromise = fetch(event.request).then(\n          (networkResponse) => {\n            // 后台更新缓存\n            cache.put(event.request, networkResponse.clone());\n            return networkResponse;\n          }\n        );\n        // 立即返回缓存，同时后台更新\n        return cachedResponse || fetchPromise;\n      });\n    })\n  );\n});',
                        content: "立即返回缓存并后台更新。"
                    }
                ]
            },
            source: "Caching Strategies"
        },
        {
            difficulty: "medium",
            tags: ["PWA", "Manifest"],
            question: "PWA的manifest.json包含哪些配置？",
            type: "multiple-choice",
            options: [
                "name和icons",
                "start_url启动URL",
                "display显示模式",
                "theme_color主题色"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "PWA Manifest",
                description: "PWA应用配置清单。",
                sections: [
                    {
                        title: "基本配置",
                        code: '/* manifest.json */\n{\n  "name": "我的应用",\n  "short_name": "应用",\n  "description": "应用描述",\n  "start_url": "/",\n  "display": "standalone",\n  "background_color": "#ffffff",\n  "theme_color": "#2196f3",\n  "orientation": "portrait",\n  "icons": [\n    {\n      "src": "/icons/icon-192.png",\n      "sizes": "192x192",\n      "type": "image/png"\n    },\n    {\n      "src": "/icons/icon-512.png",\n      "sizes": "512x512",\n      "type": "image/png"\n    }\n  ]\n}\n\n<!-- HTML引用 -->\n<link rel="manifest" href="/manifest.json">',
                        content: "Manifest配置文件。"
                    }
                ]
            },
            source: "Web App Manifest"
        },
        {
            difficulty: "easy",
            tags: ["离线检测", "online"],
            question: "如何检测网络连接状态？",
            type: "single-choice",
            options: [
                "navigator.onLine",
                "navigator.connection",
                "window.isOnline",
                "document.online"
            ],
            correctAnswer: "A",
            explanation: {
                title: "离线检测",
                description: "检测和监听网络状态。",
                sections: [
                    {
                        title: "基本检测",
                        code: '/* 检查在线状态 */\nif (navigator.onLine) {\n  console.log("在线");\n} else {\n  console.log("离线");\n}\n\n/* 监听网络变化 */\nwindow.addEventListener("online", () => {\n  console.log("网络已连接");\n  syncData();\n});\n\nwindow.addEventListener("offline", () => {\n  console.log("网络已断开");\n  showOfflineMode();\n});',
                        content: "在线离线检测。"
                    }
                ]
            },
            source: "Navigator.onLine"
        },
        {
            difficulty: "hard",
            tags: ["Service Worker", "更新"],
            question: "如何处理Service Worker的更新？",
            type: "multiple-choice",
            options: [
                "skipWaiting强制激活",
                "clients.claim立即控制",
                "监听controllerchange",
                "提示用户刷新"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "SW更新机制",
                description: "处理Service Worker更新。",
                sections: [
                    {
                        title: "自动更新",
                        code: '/* sw.js - 强制激活 */\nself.addEventListener("install", (event) => {\n  event.waitUntil(\n    caches.open(CACHE_NAME)\n      .then((cache) => cache.addAll(urlsToCache))\n      .then(() => self.skipWaiting()) // 跳过等待\n  );\n});\n\nself.addEventListener("activate", (event) => {\n  event.waitUntil(\n    self.clients.claim() // 立即控制所有页面\n  );\n});',
                        content: "强制更新策略。"
                    },
                    {
                        title: "提示用户更新",
                        code: '/* 页面监听更新 */\nnavigator.serviceWorker.addEventListener("controllerchange", () => {\n  if (confirm("发现新版本，是否刷新？")) {\n    window.location.reload();\n  }\n});\n\n/* SW发送消息 */\nself.addEventListener("message", (event) => {\n  if (event.data.type === "SKIP_WAITING") {\n    self.skipWaiting();\n  }\n});',
                        content: "用户确认更新。"
                    }
                ]
            },
            source: "SW Update"
        },
        {
            difficulty: "medium",
            tags: ["Cache API", "存储"],
            question: "Cache API的主要方法？",
            type: "multiple-choice",
            options: [
                "caches.open()",
                "cache.add()/addAll()",
                "cache.match()",
                "cache.delete()"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Cache API",
                description: "缓存存储API。",
                sections: [
                    {
                        title: "基本操作",
                        code: '/* 打开缓存 */\nconst cache = await caches.open("my-cache-v1");\n\n/* 添加资源 */\nawait cache.add("/index.html");\nawait cache.addAll(["/style.css", "/script.js"]);\n\n/* 查询缓存 */\nconst response = await cache.match("/index.html");\n\n/* 删除 */\nawait cache.delete("/old.js");\n\n/* 列出所有缓存 */\nconst names = await caches.keys();\n\n/* 删除缓存 */\nawait caches.delete("old-cache");',
                        content: "Cache API方法。"
                    }
                ]
            },
            source: "Cache API"
        },
        {
            difficulty: "medium",
            tags: ["Background Sync", "后台同步"],
            question: "Background Sync API的作用？",
            type: "single-choice",
            options: [
                "离线时延迟请求，在线后自动发送",
                "后台下载文件",
                "定时任务",
                "推送通知"
            ],
            correctAnswer: "A",
            explanation: {
                title: "后台同步",
                description: "离线数据同步。",
                sections: [
                    {
                        title: "注册同步",
                        code: '/* 注册后台同步 */\nnavigator.serviceWorker.ready.then((registration) => {\n  return registration.sync.register("sync-messages");\n});\n\n/* SW处理同步 */\nself.addEventListener("sync", (event) => {\n  if (event.tag === "sync-messages") {\n    event.waitUntil(syncMessages());\n  }\n});\n\nasync function syncMessages() {\n  const messages = await getQueuedMessages();\n  for (const msg of messages) {\n    await fetch("/api/messages", {\n      method: "POST",\n      body: JSON.stringify(msg)\n    });\n  }\n}',
                        content: "后台同步示例。"
                    }
                ]
            },
            source: "Background Sync API"
        },
        {
            difficulty: "easy",
            tags: ["安装提示", "beforeinstallprompt"],
            question: "如何自定义PWA安装提示？",
            type: "single-choice",
            options: [
                "监听beforeinstallprompt事件",
                "使用prompt()方法",
                "自动弹出",
                "无法自定义"
            ],
            correctAnswer: "A",
            explanation: {
                title: "安装提示",
                description: "控制PWA安装流程。",
                sections: [
                    {
                        title: "自定义安装",
                        code: 'let deferredPrompt;\n\nwindow.addEventListener("beforeinstallprompt", (e) => {\n  e.preventDefault();\n  deferredPrompt = e;\n  showInstallButton();\n});\n\ninstallBtn.addEventListener("click", async () => {\n  deferredPrompt.prompt();\n  const { outcome } = await deferredPrompt.userChoice;\n  console.log("用户选择:", outcome);\n  deferredPrompt = null;\n});',
                        content: "自定义安装提示。"
                    }
                ]
            },
            source: "Install Prompt"
        },
        {
            difficulty: "medium",
            tags: ["推送通知", "Push API"],
            question: "如何实现Web推送通知？",
            type: "multiple-choice",
            options: [
                "请求通知权限",
                "订阅推送",
                "SW监听push事件",
                "显示notification"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "推送通知",
                description: "Web Push Notifications。",
                sections: [
                    {
                        title: "完整流程",
                        code: '/* 1. 请求权限 */\nconst permission = await Notification.requestPermission();\n\n/* 2. 订阅推送 */\nconst registration = await navigator.serviceWorker.ready;\nconst subscription = await registration.pushManager.subscribe({\n  userVisibleOnly: true,\n  applicationServerKey: publicKey\n});\n\n/* 3. SW监听推送 */\nself.addEventListener("push", (event) => {\n  const data = event.data.json();\n  event.waitUntil(\n    self.registration.showNotification(data.title, {\n      body: data.body,\n      icon: "/icon.png"\n    })\n  );\n});',
                        content: "推送通知实现。"
                    }
                ]
            },
            source: "Push API"
        },
        {
            difficulty: "hard",
            tags: ["PWA", "最佳实践"],
            question: "PWA开发的最佳实践？",
            type: "multiple-choice",
            options: [
                "HTTPS部署",
                "响应式设计",
                "离线可用",
                "性能优化"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "PWA最佳实践",
                description: "开发高质量PWA应用。",
                sections: [
                    {
                        title: "核心要求",
                        code: '/* PWA检查清单 */\n\n✅ 必须：\n1. HTTPS部署\n2. Service Worker\n3. Web App Manifest\n4. 响应式设计\n\n✅ 推荐：\n5. 离线功能\n6. 快速加载（< 3秒）\n7. 安装提示\n8. 推送通知\n9. 主屏图标\n10. 全屏/独立显示\n\n/* 测试工具 */\n- Lighthouse\n- PWA Builder\n- Chrome DevTools',
                        content: "PWA开发标准。"
                    }
                ]
            },
            source: "PWA Best Practices"
        }
    ],
    navigation: {
        prev: { title: "多媒体控制", url: "27-media-quiz.html" },
        next: { title: "Web Workers", url: "29-workers-quiz.html" }
    }
};
