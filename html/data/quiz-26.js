// 第26章：地理定位 - 面试题
window.htmlQuizData_26 = {
    config: {
        title: "地理定位",
        icon: "📍",
        description: "测试你对Geolocation API的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["Geolocation", "基础"],
            question: "如何获取用户的当前位置？",
            type: "single-choice",
            options: [
                "navigator.geolocation.getCurrentPosition()",
                "navigator.location.get()",
                "window.geolocation.getPosition()",
                "document.location.getCurrentPosition()"
            ],
            correctAnswer: "A",
            explanation: {
                title: "获取位置",
                description: "使用Geolocation API获取用户位置。",
                sections: [
                    {
                        title: "基本用法",
                        code: '/* 检查支持性 */\nif ("geolocation" in navigator) {\n  console.log("支持地理定位");\n} else {\n  console.log("不支持地理定位");\n}\n\n/* 获取当前位置 */\nnavigator.geolocation.getCurrentPosition(\n  // 成功回调\n  (position) => {\n    console.log("纬度:", position.coords.latitude);\n    console.log("经度:", position.coords.longitude);\n    console.log("精度:", position.coords.accuracy, "米");\n  },\n  // 错误回调\n  (error) => {\n    console.error("错误:", error.message);\n  },\n  // 选项\n  {\n    enableHighAccuracy: true,\n    timeout: 5000,\n    maximumAge: 0\n  }\n);',
                        content: "获取当前地理位置。"
                    }
                ]
            },
            source: "Geolocation API"
        },
        {
            difficulty: "medium",
            tags: ["Position", "坐标"],
            question: "Position对象包含哪些信息？",
            type: "multiple-choice",
            options: [
                "经纬度坐标",
                "精度信息",
                "海拔高度",
                "移动速度和方向"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Position对象",
                description: "位置对象的详细信息。",
                sections: [
                    {
                        title: "coords属性",
                        code: '/* Position对象结构 */\nnavigator.geolocation.getCurrentPosition((position) => {\n  const coords = position.coords;\n  \n  // 必有属性\n  console.log("纬度:", coords.latitude);      // -90 到 90\n  console.log("经度:", coords.longitude);     // -180 到 180\n  console.log("精度:", coords.accuracy);      // 米\n  \n  // 可选属性（可能为null）\n  console.log("海拔:", coords.altitude);      // 米\n  console.log("海拔精度:", coords.altitudeAccuracy);\n  console.log("方向:", coords.heading);       // 度，0-360\n  console.log("速度:", coords.speed);         // 米/秒\n  \n  // 时间戳\n  console.log("时间:", new Date(position.timestamp));\n});',
                        content: "Position对象的完整属性。"
                    },
                    {
                        title: "实际使用",
                        code: 'function showPosition(position) {\n  const { coords } = position;\n  \n  const info = `\n    位置: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}\n    精度: ${coords.accuracy.toFixed(0)}米\n    ${coords.altitude ? `海拔: ${coords.altitude.toFixed(0)}米` : ""}\n    ${coords.speed ? `速度: ${(coords.speed * 3.6).toFixed(1)}km/h` : ""}\n    ${coords.heading ? `方向: ${coords.heading.toFixed(0)}°` : ""}\n  `;\n  \n  console.log(info);\n}',
                        content: "格式化显示位置信息。"
                    }
                ]
            },
            source: "Position Interface"
        },
        {
            difficulty: "medium",
            tags: ["错误处理", "PositionError"],
            question: "Geolocation API的错误类型有哪些？",
            type: "multiple-choice",
            options: [
                "PERMISSION_DENIED 用户拒绝",
                "POSITION_UNAVAILABLE 无法获取",
                "TIMEOUT 超时",
                "以上都是"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "错误处理",
                description: "处理地理定位的各种错误。",
                sections: [
                    {
                        title: "错误类型",
                        code: '/* 错误代码 */\nPositionError.PERMISSION_DENIED = 1      // 用户拒绝授权\nPositionError.POSITION_UNAVAILABLE = 2   // 无法获取位置\nPositionError.TIMEOUT = 3                // 超时\n\n/* 错误处理 */\nnavigator.geolocation.getCurrentPosition(\n  successCallback,\n  (error) => {\n    switch(error.code) {\n      case error.PERMISSION_DENIED:\n        alert("请允许访问您的位置信息");\n        break;\n      \n      case error.POSITION_UNAVAILABLE:\n        alert("无法获取位置，请检查GPS设置");\n        break;\n      \n      case error.TIMEOUT:\n        alert("定位超时，请重试");\n        break;\n      \n      default:\n        alert("未知错误: " + error.message);\n    }\n  }\n);',
                        content: "完整的错误处理。"
                    },
                    {
                        title: "用户友好提示",
                        code: 'function getLocation() {\n  if (!navigator.geolocation) {\n    showError("您的浏览器不支持地理定位");\n    return;\n  }\n  \n  showLoading("正在获取位置...");\n  \n  navigator.geolocation.getCurrentPosition(\n    (position) => {\n      hideLoading();\n      showPosition(position);\n    },\n    (error) => {\n      hideLoading();\n      \n      const messages = {\n        1: "需要您的授权才能获取位置",\n        2: "暂时无法获取位置信息",\n        3: "定位请求超时，请重试"\n      };\n      \n      showError(messages[error.code] || "定位失败");\n    },\n    {\n      timeout: 10000\n    }\n  );\n}',
                        content: "友好的错误提示。"
                    }
                ]
            },
            source: "PositionError"
        },
        {
            difficulty: "hard",
            tags: ["配置", "选项"],
            question: "getCurrentPosition的选项参数作用？",
            type: "multiple-choice",
            options: [
                "enableHighAccuracy控制精度",
                "timeout设置超时时间",
                "maximumAge设置缓存时间",
                "都会影响性能和电量"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "配置选项",
                description: "优化定位的配置参数。",
                sections: [
                    {
                        title: "选项说明",
                        code: 'const options = {\n  // 高精度模式\n  enableHighAccuracy: true,  // true=GPS, false=网络定位\n  \n  // 超时时间（毫秒）\n  timeout: 5000,             // 0 = 无限等待\n  \n  // 缓存时间（毫秒）\n  maximumAge: 0              // 0 = 总是获取新位置\n};\n\nnavigator.geolocation.getCurrentPosition(\n  successCallback,\n  errorCallback,\n  options\n);',
                        content: "三个主要配置选项。"
                    },
                    {
                        title: "enableHighAccuracy",
                        code: '/* 高精度 vs 低精度 */\n\n// 高精度（GPS）\n{\n  enableHighAccuracy: true\n  // 优点：精度高（5-10米）\n  // 缺点：耗时长、耗电多、室内效果差\n}\n\n// 低精度（WiFi/基站）\n{\n  enableHighAccuracy: false\n  // 优点：快速、省电\n  // 缺点：精度低（100-1000米）\n}\n\n/* 根据场景选择 */\n// 导航应用：高精度\n// 天气应用：低精度\n// 附近商店：低精度',
                        content: "精度模式的选择。"
                    },
                    {
                        title: "timeout和maximumAge",
                        code: '/* timeout - 超时时间 */\n{\n  timeout: 10000  // 10秒后超时\n}\n// 建议：5-10秒\n\n/* maximumAge - 缓存有效期 */\n{\n  maximumAge: 0        // 总是获取新位置\n  maximumAge: 60000    // 接受1分钟内的缓存\n  maximumAge: Infinity // 永远使用缓存（仅首次获取）\n}\n\n/* 示例：快速定位 */\nnavigator.geolocation.getCurrentPosition(\n  callback,\n  errorCallback,\n  {\n    enableHighAccuracy: false,  // 快速\n    timeout: 3000,              // 3秒\n    maximumAge: 30000           // 接受30秒缓存\n  }\n);',
                        content: "超时和缓存设置。"
                    }
                ]
            },
            source: "PositionOptions"
        },
        {
            difficulty: "medium",
            tags: ["watchPosition", "持续监听"],
            question: "watchPosition和getCurrentPosition的区别？",
            type: "single-choice",
            options: [
                "watchPosition持续监听位置变化",
                "watchPosition只获取一次",
                "功能完全相同",
                "watchPosition不需要回调"
            ],
            correctAnswer: "A",
            explanation: {
                title: "持续监听位置",
                description: "实时追踪用户位置变化。",
                sections: [
                    {
                        title: "watchPosition用法",
                        code: '/* 开始监听 */\nconst watchId = navigator.geolocation.watchPosition(\n  (position) => {\n    console.log("位置更新:");\n    console.log("纬度:", position.coords.latitude);\n    console.log("经度:", position.coords.longitude);\n    console.log("速度:", position.coords.speed);\n    \n    updateMap(position.coords);\n  },\n  (error) => {\n    console.error("定位错误:", error.message);\n  },\n  {\n    enableHighAccuracy: true,\n    maximumAge: 0\n  }\n);\n\n/* 停止监听 */\nnavigator.geolocation.clearWatch(watchId);\nconsole.log("停止监听");',
                        content: "持续监听位置变化。"
                    },
                    {
                        title: "实时导航应用",
                        code: 'class LocationTracker {\n  constructor() {\n    this.watchId = null;\n    this.path = [];\n  }\n  \n  start() {\n    this.watchId = navigator.geolocation.watchPosition(\n      (position) => {\n        const point = {\n          lat: position.coords.latitude,\n          lng: position.coords.longitude,\n          timestamp: position.timestamp,\n          speed: position.coords.speed,\n          accuracy: position.coords.accuracy\n        };\n        \n        this.path.push(point);\n        this.onUpdate(point);\n      },\n      (error) => {\n        this.onError(error);\n      },\n      {\n        enableHighAccuracy: true,\n        maximumAge: 0\n      }\n    );\n  }\n  \n  stop() {\n    if (this.watchId !== null) {\n      navigator.geolocation.clearWatch(this.watchId);\n      this.watchId = null;\n    }\n  }\n  \n  onUpdate(point) {\n    console.log("新位置:", point);\n    // 更新地图标记\n    // 绘制路径\n  }\n  \n  onError(error) {\n    console.error("错误:", error);\n  }\n  \n  getDistance() {\n    // 计算总距离\n    let distance = 0;\n    for (let i = 1; i < this.path.length; i++) {\n      distance += this.calculateDistance(\n        this.path[i-1],\n        this.path[i]\n      );\n    }\n    return distance;\n  }\n  \n  calculateDistance(p1, p2) {\n    // 使用Haversine公式\n    // ...\n  }\n}\n\n// 使用\nconst tracker = new LocationTracker();\ntracker.start();\n// 运动结束后\ntracker.stop();\nconsole.log("总距离:", tracker.getDistance());',
                        content: "运动轨迹追踪。"
                    },
                    {
                        title: "页面卸载清理",
                        code: '/* 页面卸载时清除监听 */\nlet watchId;\n\nwindow.addEventListener("load", () => {\n  watchId = navigator.geolocation.watchPosition(\n    handlePosition,\n    handleError\n  );\n});\n\nwindow.addEventListener("beforeunload", () => {\n  if (watchId) {\n    navigator.geolocation.clearWatch(watchId);\n  }\n});\n\n/* 或使用类管理 */\nclass App {\n  constructor() {\n    this.watchId = null;\n  }\n  \n  init() {\n    this.startTracking();\n    window.addEventListener("beforeunload", () => this.cleanup());\n  }\n  \n  cleanup() {\n    if (this.watchId) {\n      navigator.geolocation.clearWatch(this.watchId);\n    }\n  }\n}',
                        content: "清理监听避免内存泄漏。"
                    }
                ]
            },
            source: "watchPosition"
        },
        {
            difficulty: "hard",
            tags: ["距离计算", "Haversine"],
            question: "如何计算两个经纬度之间的距离？",
            type: "single-choice",
            options: [
                "使用Haversine公式",
                "简单相减",
                "使用勾股定理",
                "API自动计算"
            ],
            correctAnswer: "A",
            explanation: {
                title: "距离计算",
                description: "计算地球表面两点间的距离。",
                sections: [
                    {
                        title: "Haversine公式",
                        code: '/* 计算两点距离（公里）*/\nfunction calculateDistance(lat1, lon1, lat2, lon2) {\n  const R = 6371; // 地球半径（公里）\n  \n  const dLat = toRad(lat2 - lat1);\n  const dLon = toRad(lon2 - lon1);\n  \n  const a = \n    Math.sin(dLat / 2) * Math.sin(dLat / 2) +\n    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *\n    Math.sin(dLon / 2) * Math.sin(dLon / 2);\n  \n  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));\n  const distance = R * c;\n  \n  return distance;\n}\n\nfunction toRad(degrees) {\n  return degrees * Math.PI / 180;\n}\n\n// 使用\nconst distance = calculateDistance(\n  39.9042, 116.4074,  // 北京\n  31.2304, 121.4737   // 上海\n);\nconsole.log(`距离: ${distance.toFixed(2)}公里`);',
                        content: "精确的距离计算。"
                    },
                    {
                        title: "查找附近地点",
                        code: '/* 查找附近的POI */\nasync function findNearby(type = "restaurant") {\n  // 获取当前位置\n  const position = await new Promise((resolve, reject) => {\n    navigator.geolocation.getCurrentPosition(resolve, reject);\n  });\n  \n  const { latitude, longitude } = position.coords;\n  \n  // 搜索附近的地点\n  const response = await fetch(\n    `/api/places/nearby?` +\n    `lat=${latitude}&` +\n    `lng=${longitude}&` +\n    `type=${type}&` +\n    `radius=1000`\n  );\n  \n  const places = await response.json();\n  \n  // 计算距离并排序\n  const placesWithDistance = places.map(place => ({\n    ...place,\n    distance: calculateDistance(\n      latitude, longitude,\n      place.lat, place.lng\n    )\n  })).sort((a, b) => a.distance - b.distance);\n  \n  return placesWithDistance;\n}\n\n// 使用\nfindNearby("restaurant").then(places => {\n  places.forEach(place => {\n    console.log(`${place.name} - ${place.distance.toFixed(2)}km`);\n  });\n});',
                        content: "附近地点搜索。"
                    }
                ]
            },
            source: "Haversine Formula"
        },
        {
            difficulty: "medium",
            tags: ["地理围栏", "Geofencing"],
            question: "如何实现地理围栏功能？",
            type: "multiple-choice",
            options: [
                "使用watchPosition监听",
                "计算到中心点距离",
                "判断是否在半径内",
                "触发进入/离开事件"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "地理围栏",
                description: "监控用户进出特定区域。",
                sections: [
                    {
                        title: "Geofence类",
                        code: 'class Geofence {\n  constructor(centerLat, centerLng, radius) {\n    this.center = { lat: centerLat, lng: centerLng };\n    this.radius = radius; // 米\n    this.watchId = null;\n    this.inside = false;\n  }\n  \n  start(onEnter, onLeave) {\n    this.onEnter = onEnter;\n    this.onLeave = onLeave;\n    \n    this.watchId = navigator.geolocation.watchPosition(\n      (position) => this.checkPosition(position),\n      (error) => console.error("定位错误:", error),\n      {\n        enableHighAccuracy: true,\n        maximumAge: 0\n      }\n    );\n  }\n  \n  checkPosition(position) {\n    const distance = this.calculateDistance(\n      this.center.lat,\n      this.center.lng,\n      position.coords.latitude,\n      position.coords.longitude\n    ) * 1000; // 转为米\n    \n    const wasInside = this.inside;\n    this.inside = distance <= this.radius;\n    \n    // 进入\n    if (this.inside && !wasInside) {\n      this.onEnter(position);\n    }\n    // 离开\n    else if (!this.inside && wasInside) {\n      this.onLeave(position);\n    }\n  }\n  \n  calculateDistance(lat1, lon1, lat2, lon2) {\n    const R = 6371;\n    const dLat = this.toRad(lat2 - lat1);\n    const dLon = this.toRad(lon2 - lon1);\n    const a = \n      Math.sin(dLat/2) * Math.sin(dLat/2) +\n      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *\n      Math.sin(dLon/2) * Math.sin(dLon/2);\n    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));\n    return R * c;\n  }\n  \n  toRad(deg) {\n    return deg * Math.PI / 180;\n  }\n  \n  stop() {\n    if (this.watchId) {\n      navigator.geolocation.clearWatch(this.watchId);\n      this.watchId = null;\n    }\n  }\n}',
                        content: "地理围栏实现。"
                    },
                    {
                        title: "使用示例",
                        code: '/* 创建围栏 */\nconst fence = new Geofence(\n  39.9042,  // 纬度\n  116.4074, // 经度\n  500       // 半径500米\n);\n\n/* 开始监控 */\nfence.start(\n  (position) => {\n    console.log("进入区域");\n    showNotification("您已进入目标区域");\n    playSound("enter.mp3");\n  },\n  (position) => {\n    console.log("离开区域");\n    showNotification("您已离开目标区域");\n    playSound("leave.mp3");\n  }\n);\n\n/* 停止监控 */\n// fence.stop();',
                        content: "监控特定区域。"
                    }
                ]
            },
            source: "Geofencing"
        },
        {
            difficulty: "easy",
            tags: ["权限", "隐私"],
            question: "Geolocation API的权限机制？",
            type: "multiple-choice",
            options: [
                "浏览器自动请求权限",
                "用户可以拒绝",
                "只在HTTPS下工作",
                "需要用户交互触发"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "权限和隐私",
                description: "地理定位的权限管理。",
                sections: [
                    {
                        title: "权限请求",
                        code: '/* 首次调用时浏览器会弹出权限请求 */\nnavigator.geolocation.getCurrentPosition(\n  success,\n  error\n);\n\n/* 用户选项 */\n1. 允许\n2. 拒绝\n3. 询问（每次）\n\n/* 权限状态检查 */\nnavigator.permissions.query({ name: "geolocation" })\n  .then((result) => {\n    console.log("权限状态:", result.state);\n    // "granted", "denied", "prompt"\n    \n    result.addEventListener("change", () => {\n      console.log("权限变更:", result.state);\n    });\n  });',
                        content: "权限请求流程。"
                    },
                    {
                        title: "HTTPS要求",
                        code: '/* Geolocation仅在安全上下文中工作 */\n\n✅ 可用：\n- https://example.com\n- http://localhost\n- http://127.0.0.1\n- file:///\n\n❌ 不可用：\n- http://example.com (非localhost的HTTP)\n\n/* 检测 */\nif (window.isSecureContext) {\n  console.log("安全上下文");\n} else {\n  console.log("非安全上下文，Geolocation不可用");\n}',
                        content: "必须是安全上下文。"
                    },
                    {
                        title: "隐私最佳实践",
                        code: '/* 1. 明确告知用途 */\n<button onclick="requestLocation()">\n  查找附近商店\n</button>\n\nfunction requestLocation() {\n  // 先显示说明\n  if (confirm("需要访问您的位置来显示附近的商店，是否允许？")) {\n    navigator.geolocation.getCurrentPosition(success, error);\n  }\n}\n\n/* 2. 最小权限原则 */\n// 只在需要时请求\n// 不需要时不请求\n\n/* 3. 提供降级方案 */\nfunction getLocation() {\n  navigator.geolocation.getCurrentPosition(\n    showNearbyStores,\n    () => {\n      // 用户拒绝或出错\n      showCitySelector(); // 手动选择城市\n    }\n  );\n}\n\n/* 4. 不存储敏感数据 */\n// 不要将精确位置发送到服务器\n// 只发送必要的信息（如城市级别）',
                        content: "保护用户隐私。"
                    }
                ]
            },
            source: "Privacy"
        },
        {
            difficulty: "medium",
            tags: ["地图集成", "实际应用"],
            question: "如何将Geolocation与地图API集成？",
            type: "multiple-choice",
            options: [
                "获取坐标",
                "传递给地图API",
                "显示标记",
                "绘制路线"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "地图集成",
                description: "与地图服务的集成应用。",
                sections: [
                    {
                        title: "Google Maps集成",
                        code: '/* 显示当前位置 */\nlet map;\n\nfunction initMap() {\n  // 默认位置\n  map = new google.maps.Map(document.getElementById("map"), {\n    center: { lat: 39.9042, lng: 116.4074 },\n    zoom: 15\n  });\n  \n  // 获取当前位置\n  navigator.geolocation.getCurrentPosition(\n    (position) => {\n      const pos = {\n        lat: position.coords.latitude,\n        lng: position.coords.longitude\n      };\n      \n      // 移动地图\n      map.setCenter(pos);\n      \n      // 添加标记\n      new google.maps.Marker({\n        position: pos,\n        map: map,\n        title: "您的位置"\n      });\n      \n      // 添加圆圈显示精度\n      new google.maps.Circle({\n        map: map,\n        center: pos,\n        radius: position.coords.accuracy,\n        fillColor: "#4285F4",\n        fillOpacity: 0.2,\n        strokeColor: "#4285F4",\n        strokeOpacity: 0.5\n      });\n    },\n    (error) => {\n      console.error("定位失败:", error);\n    }\n  );\n}',
                        content: "Google Maps集成。"
                    },
                    {
                        title: "实时导航",
                        code: '/* 实时更新位置 */\nlet watchId;\nlet marker;\nlet path = [];\nlet polyline;\n\nfunction startNavigation() {\n  watchId = navigator.geolocation.watchPosition(\n    (position) => {\n      const pos = {\n        lat: position.coords.latitude,\n        lng: position.coords.longitude\n      };\n      \n      // 更新标记位置\n      if (!marker) {\n        marker = new google.maps.Marker({\n          position: pos,\n          map: map,\n          icon: {\n            path: google.maps.SymbolPath.CIRCLE,\n            scale: 8,\n            fillColor: "#4285F4",\n            fillOpacity: 1,\n            strokeColor: "white",\n            strokeWeight: 2\n          }\n        });\n      } else {\n        marker.setPosition(pos);\n      }\n      \n      // 记录路径\n      path.push(pos);\n      \n      // 绘制路径\n      if (!polyline) {\n        polyline = new google.maps.Polyline({\n          path: path,\n          geodesic: true,\n          strokeColor: "#4285F4",\n          strokeOpacity: 1.0,\n          strokeWeight: 3,\n          map: map\n        });\n      } else {\n        polyline.setPath(path);\n      }\n      \n      // 地图跟随\n      map.panTo(pos);\n    },\n    (error) => {\n      console.error("定位错误:", error);\n    },\n    {\n      enableHighAccuracy: true,\n      maximumAge: 0\n    }\n  );\n}\n\nfunction stopNavigation() {\n  if (watchId) {\n    navigator.geolocation.clearWatch(watchId);\n  }\n}',
                        content: "实时导航功能。"
                    },
                    {
                        title: "反向地理编码",
                        code: '/* 坐标转地址 */\nfunction getAddress(lat, lng) {\n  const geocoder = new google.maps.Geocoder();\n  const latlng = { lat, lng };\n  \n  geocoder.geocode({ location: latlng }, (results, status) => {\n    if (status === "OK") {\n      if (results[0]) {\n        console.log("地址:", results[0].formatted_address);\n      }\n    }\n  });\n}\n\n/* 显示当前地址 */\nnavigator.geolocation.getCurrentPosition((position) => {\n  getAddress(\n    position.coords.latitude,\n    position.coords.longitude\n  );\n});',
                        content: "坐标转换为地址。"
                    }
                ]
            },
            source: "Maps Integration"
        },
        {
            difficulty: "easy",
            tags: ["兼容性", "降级"],
            question: "Geolocation API的浏览器兼容性？",
            type: "single-choice",
            options: [
                "现代浏览器都支持",
                "只有Chrome支持",
                "IE完全不支持",
                "需要polyfill"
            ],
            correctAnswer: "A",
            explanation: {
                title: "浏览器兼容性",
                description: "Geolocation的支持情况。",
                sections: [
                    {
                        title: "支持情况",
                        code: '/* 浏览器支持 */\n\n✅ 完全支持：\n- Chrome 5+\n- Firefox 3.5+\n- Safari 5+\n- Edge (所有版本)\n- iOS Safari 3.2+\n- Android Browser 2.1+\n\n⚠️ 部分支持：\n- IE 9+ (需要用户交互)\n\n/* 使用率 */\n全球：97%+\n中国：99%+\n\n/* 检测支持 */\nif ("geolocation" in navigator) {\n  // 支持\n} else {\n  // 不支持，提供替代方案\n  showCitySelector();\n}',
                        content: "广泛支持。"
                    },
                    {
                        title: "降级方案",
                        code: '/* 完整的降级策略 */\n\nfunction getLocation() {\n  // 1. 检查Geolocation支持\n  if (!("geolocation" in navigator)) {\n    return fallbackToIPLocation();\n  }\n  \n  // 2. 尝试获取位置\n  navigator.geolocation.getCurrentPosition(\n    (position) => {\n      useGeolocation(position);\n    },\n    (error) => {\n      // 3. 失败时降级\n      if (error.code === error.PERMISSION_DENIED) {\n        fallbackToIPLocation();\n      } else {\n        fallbackToDefaultLocation();\n      }\n    },\n    {\n      timeout: 5000\n    }\n  );\n}\n\n/* IP定位（降级方案1）*/\nfunction fallbackToIPLocation() {\n  fetch("https://ipapi.co/json/")\n    .then(res => res.json())\n    .then(data => {\n      console.log("IP位置:", data.city);\n      useLocation(data.latitude, data.longitude);\n    })\n    .catch(() => fallbackToDefaultLocation());\n}\n\n/* 默认位置（降级方案2）*/\nfunction fallbackToDefaultLocation() {\n  // 使用用户上次选择的位置\n  const saved = localStorage.getItem("lastLocation");\n  if (saved) {\n    const { lat, lng } = JSON.parse(saved);\n    useLocation(lat, lng);\n  } else {\n    // 让用户手动选择\n    showCitySelector();\n  }\n}',
                        content: "多层降级策略。"
                    }
                ]
            },
            source: "Browser Support"
        }
    ],
    navigation: {
        prev: { title: "拖放API", url: "25-drag-drop-quiz.html" },
        next: { title: "多媒体控制", url: "27-media-quiz.html" }
    }
};
