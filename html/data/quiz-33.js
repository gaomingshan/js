// 第33章：设备适配 - 面试题
window.htmlQuizData_33 = {
    config: {
        title: "设备适配",
        icon: "📲",
        description: "测试你对移动端适配的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "medium",
            tags: ["移动端", "1px问题"],
            question: "如何解决移动端1px边框在高清屏显示过粗的问题？",
            type: "multiple-choice",
            options: [
                "使用transform scale缩放",
                "使用伪元素+缩放",
                "使用box-shadow",
                "使用border-image"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "1px边框问题",
                description: "在Retina屏幕上，1px的边框会显示为2px或3px。",
                sections: [
                    {
                        title: "问题原因",
                        code: '/* 设备像素比（DPR）*/\nwindow.devicePixelRatio\n// iPhone 6/7/8: 2\n// iPhone X/11/12: 3\n\n/* 1px问题 */\nCSS中的1px != 物理像素的1px\nDPR为2时，1px CSS = 2px 物理像素\nDPR为3时，1px CSS = 3px 物理像素',
                        content: "高清屏的1px会被放大。"
                    },
                    {
                        title: "方案1：transform scale",
                        code: '/* 单边框 */\n.border-bottom {\n  position: relative;\n}\n\n.border-bottom::after {\n  content: "";\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  width: 100%;\n  height: 1px;\n  background: #e5e5e5;\n  transform: scaleY(0.5);\n  transform-origin: 0 0;\n}\n\n/* 四边框 */\n.border {\n  position: relative;\n}\n\n.border::after {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 200%;\n  height: 200%;\n  border: 1px solid #e5e5e5;\n  transform: scale(0.5);\n  transform-origin: 0 0;\n  box-sizing: border-box;\n}\n\n/* DPR为3的设备 */\n@media (-webkit-min-device-pixel-ratio: 3) {\n  .border::after {\n    width: 300%;\n    height: 300%;\n    transform: scale(0.33);\n  }\n}',
                        content: "使用transform缩放。"
                    },
                    {
                        title: "方案2：box-shadow",
                        code: '.border-1px {\n  box-shadow: 0 1px 0 0 #e5e5e5;\n}\n\n/* 或使用内阴影 */\n.border-1px {\n  box-shadow: inset 0 -1px 0 0 #e5e5e5;\n}',
                        content: "使用阴影模拟边框。"
                    },
                    {
                        title: "方案3：viewport缩放",
                        code: '/* 根据DPR设置viewport */\nconst dpr = window.devicePixelRatio || 1;\nconst scale = 1 / dpr;\n\nconst viewport = document.querySelector("meta[name=viewport]");\nviewport.setAttribute("content", \n  `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, minimum-scale=${scale}`\n);\n\n/* 设置根字体大小 */\ndocument.documentElement.style.fontSize = dpr * 16 + "px";',
                        content: "缩放整个页面。"
                    },
                    {
                        title: "方案4：border-image",
                        code: '.border-1px {\n  border-bottom: 1px solid transparent;\n  border-image: url(data:image/png;base64,...) 2 repeat;\n}\n\n/* 使用SVG */\n.border-1px {\n  border-bottom: 1px solid transparent;\n  border-image-source: url("data:image/svg+xml,<svg>...</svg>");\n  border-image-slice: 2;\n}',
                        content: "使用图片边框。"
                    }
                ]
            },
            source: "移动端适配"
        },
        {
            difficulty: "easy",
            tags: ["rem", "适配"],
            question: "rem适配方案的原理？",
            type: "single-choice",
            options: [
                "根据屏幕宽度动态设置根字体大小",
                "根据屏幕高度设置字体大小",
                "固定根字体大小为16px",
                "使用vw单位"
            ],
            correctAnswer: "A",
            explanation: {
                title: "rem适配",
                description: "rem相对于根元素html的font-size。",
                sections: [
                    {
                        title: "rem原理",
                        code: '/* rem单位 */\nhtml {\n  font-size: 16px;\n}\n\n.box {\n  width: 10rem;  /* 10 * 16 = 160px */\n  height: 5rem;  /* 5 * 16 = 80px */\n}',
                        content: "1rem = html的font-size。"
                    },
                    {
                        title: "动态设置rem",
                        code: '/* 方案1：基于设计稿750px */\nfunction setRem() {\n  const baseSize = 75; // 设计稿750px，基准值75\n  const scale = document.documentElement.clientWidth / 750;\n  document.documentElement.style.fontSize = baseSize * scale + "px";\n}\n\nsetRem();\nwindow.addEventListener("resize", setRem);\n\n/* 设计稿中100px的元素 */\n// 100 / 75 = 1.33rem\n.box {\n  width: 1.33rem;\n}\n\n/* 方案2：flexible.js */\n(function(win, lib) {\n  const doc = win.document;\n  const docEl = doc.documentElement;\n  let dpr = 1;\n  let scale = 1;\n  \n  function setRemUnit() {\n    const rem = docEl.clientWidth / 10;\n    docEl.style.fontSize = rem + "px";\n  }\n  \n  setRemUnit();\n  win.addEventListener("resize", setRemUnit);\n  win.addEventListener("pageshow", function(e) {\n    if (e.persisted) {\n      setRemUnit();\n    }\n  });\n})(window);\n\n/* 方案3：vw方案 */\nhtml {\n  font-size: 13.33333vw; /* 750px设计稿：750/100=7.5，100/7.5=13.33333 */\n}\n\n/* 限制最大最小值 */\nhtml {\n  font-size: clamp(12px, 13.33333vw, 20px);\n}',
                        content: "动态计算根字体大小。"
                    },
                    {
                        title: "px转rem工具",
                        code: '/* postcss-pxtorem */\n// postcss.config.js\nmodule.exports = {\n  plugins: {\n    "postcss-pxtorem": {\n      rootValue: 75,\n      propList: ["*"],\n      selectorBlackList: [".no-rem"]\n    }\n  }\n};\n\n/* 编写时用px */\n.box {\n  width: 100px;  /* 设计稿尺寸 */\n}\n\n/* 自动转换为 */\n.box {\n  width: 1.33333rem;\n}\n\n/* 不转换 */\n.no-rem {\n  width: 100px;  /* 保持px */\n}',
                        content: "自动转换px为rem。"
                    }
                ]
            },
            source: "移动端适配"
        },
        {
            difficulty: "medium",
            tags: ["vw", "适配"],
            question: "vw适配方案相比rem的优势？",
            type: "multiple-choice",
            options: [
                "不需要JavaScript",
                "纯CSS实现",
                "更简单直观",
                "性能更好"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "vw适配方案",
                description: "使用视口单位进行适配。",
                sections: [
                    {
                        title: "vw单位",
                        code: '/* vw: 视口宽度的1% */\n1vw = 视口宽度 / 100\n\n/* 750px设计稿 */\n// 设计稿中100px的元素\n// 100px / 750px * 100 = 13.33333vw\n\n.box {\n  width: 13.33333vw;\n}',
                        content: "vw直接相对于视口。"
                    },
                    {
                        title: "px转vw",
                        code: '/* postcss-px-to-viewport */\n// postcss.config.js\nmodule.exports = {\n  plugins: {\n    "postcss-px-to-viewport": {\n      viewportWidth: 750,\n      unitPrecision: 5,\n      viewportUnit: "vw",\n      selectorBlackList: [],\n      minPixelValue: 1,\n      mediaQuery: false\n    }\n  }\n};\n\n/* 编写 */\n.box {\n  width: 100px;\n  font-size: 14px;\n}\n\n/* 转换后 */\n.box {\n  width: 13.33333vw;\n  font-size: 1.86667vw;\n}',
                        content: "自动转换px为vw。"
                    },
                    {
                        title: "限制最大最小值",
                        code: '/* 使用clamp */\n.box {\n  width: clamp(100px, 13.33333vw, 200px);\n  font-size: clamp(12px, 1.86667vw, 18px);\n}\n\n/* 或使用媒体查询 */\n.box {\n  width: 13.33333vw;\n}\n\n@media (min-width: 750px) {\n  .box {\n    width: 100px;  /* 超过750px固定 */\n  }\n}',
                        content: "控制最大最小值。"
                    }
                ]
            },
            source: "移动端适配"
        },
        {
            difficulty: "medium",
            tags: ["安全区", "刘海屏"],
            question: "如何适配iPhone X等刘海屏的安全区域？",
            type: "multiple-choice",
            options: [
                "viewport-fit=cover",
                "safe-area-inset-*",
                "env()或constant()",
                "padding-bottom适配"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "安全区域适配",
                description: "适配刘海屏、全面屏的安全区域。",
                sections: [
                    {
                        title: "viewport设置",
                        code: '/* viewport-fit=cover */\n<meta name="viewport" \n      content="width=device-width, \n               initial-scale=1.0, \n               viewport-fit=cover">',
                        content: "允许页面铺满整个屏幕。"
                    },
                    {
                        title: "安全区域变量",
                        code: '/* safe-area-inset-* */\nsafe-area-inset-top     - 顶部安全距离\nsafe-area-inset-right   - 右侧安全距离\nsafe-area-inset-bottom  - 底部安全距离（横屏时有刘海）\nsafe-area-inset-left    - 左侧安全距离\n\n/* 使用env()或constant() */\n.header {\n  padding-top: env(safe-area-inset-top);\n  padding-top: constant(safe-area-inset-top); /* iOS 11.0-11.2 */\n}\n\n.footer {\n  padding-bottom: env(safe-area-inset-bottom);\n  padding-bottom: constant(safe-area-inset-bottom);\n}\n\n/* 组合使用 */\n.fixed-bottom {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding-bottom: calc(20px + env(safe-area-inset-bottom));\n}',
                        content: "使用CSS变量获取安全距离。"
                    },
                    {
                        title: "完整示例",
                        code: '/* HTML */\n<meta name="viewport" \n      content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n\n/* CSS */\n:root {\n  --safe-area-inset-top: env(safe-area-inset-top);\n  --safe-area-inset-bottom: env(safe-area-inset-bottom);\n}\n\n/* 固定头部 */\n.header {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 44px;\n  padding-top: var(--safe-area-inset-top);\n  background: #fff;\n}\n\n/* 固定底部 */\n.footer {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  height: 50px;\n  padding-bottom: var(--safe-area-inset-bottom);\n  background: #fff;\n}\n\n/* 主内容区 */\n.main {\n  padding-top: calc(44px + var(--safe-area-inset-top));\n  padding-bottom: calc(50px + var(--safe-area-inset-bottom));\n}',
                        content: "完整的安全区域适配。"
                    }
                ]
            },
            source: "iOS适配"
        },
        {
            difficulty: "hard",
            tags: ["横竖屏", "适配"],
            question: "如何处理横竖屏切换？",
            type: "multiple-choice",
            options: [
                "监听orientationchange事件",
                "使用CSS媒体查询",
                "Screen Orientation API",
                "锁定屏幕方向"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "横竖屏适配",
                description: "处理设备方向变化。",
                sections: [
                    {
                        title: "CSS媒体查询",
                        code: '/* 竖屏 */\n@media (orientation: portrait) {\n  .container {\n    flex-direction: column;\n  }\n}\n\n/* 横屏 */\n@media (orientation: landscape) {\n  .container {\n    flex-direction: row;\n  }\n  \n  /* 横屏时提示 */\n  .landscape-tip {\n    display: block;\n  }\n}',
                        content: "CSS检测横竖屏。"
                    },
                    {
                        title: "JavaScript监听",
                        code: '/* orientationchange事件 */\nwindow.addEventListener("orientationchange", () => {\n  const orientation = window.orientation;\n  // 0: 竖屏，90: 向左横屏，-90: 向右横屏，180: 倒立\n  \n  if (orientation === 90 || orientation === -90) {\n    console.log("横屏");\n  } else {\n    console.log("竖屏");\n  }\n});\n\n/* resize事件（更可靠）*/\nwindow.addEventListener("resize", () => {\n  const isPortrait = window.innerHeight > window.innerWidth;\n  \n  if (isPortrait) {\n    console.log("竖屏");\n  } else {\n    console.log("横屏");\n  }\n});',
                        content: "监听方向变化。"
                    },
                    {
                        title: "Screen Orientation API",
                        code: '/* 获取当前方向 */\nconst orientation = screen.orientation.type;\n// "portrait-primary", "portrait-secondary",\n// "landscape-primary", "landscape-secondary"\n\n/* 监听方向变化 */\nscreen.orientation.addEventListener("change", () => {\n  console.log("方向:", screen.orientation.type);\n  console.log("角度:", screen.orientation.angle);\n});\n\n/* 锁定方向 */\nawait screen.orientation.lock("portrait");\n// "portrait", "landscape", "portrait-primary", etc.\n\n/* 解锁方向 */\nscreen.orientation.unlock();',
                        content: "现代方向API。"
                    },
                    {
                        title: "强制竖屏提示",
                        code: '/* HTML */\n<div class="rotate-tip">\n  <div class="phone-icon">📱</div>\n  <p>请竖屏浏览以获得最佳体验</p>\n</div>\n\n/* CSS */\n.rotate-tip {\n  display: none;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.9);\n  color: white;\n  text-align: center;\n  justify-content: center;\n  align-items: center;\n  flex-direction: column;\n  z-index: 9999;\n}\n\n@media (orientation: landscape) {\n  .rotate-tip {\n    display: flex;\n  }\n  \n  .phone-icon {\n    font-size: 80px;\n    animation: rotate 1.5s infinite;\n  }\n}\n\n@keyframes rotate {\n  0%, 100% { transform: rotate(0deg); }\n  50% { transform: rotate(90deg); }\n}',
                        content: "横屏时显示提示。"
                    }
                ]
            },
            source: "移动端适配"
        },
        {
            difficulty: "medium",
            tags: ["软键盘", "问题"],
            question: "如何处理移动端软键盘遮挡输入框问题？",
            type: "multiple-choice",
            options: [
                "监听resize事件",
                "使用scrollIntoView",
                "固定定位改为绝对定位",
                "调整页面布局"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "软键盘适配",
                description: "处理软键盘弹出的问题。",
                sections: [
                    {
                        title: "问题1：遮挡输入框",
                        code: '/* 输入框获得焦点时滚动到可视区 */\nconst input = document.querySelector("input");\n\ninput.addEventListener("focus", () => {\n  setTimeout(() => {\n    input.scrollIntoView({\n      behavior: "smooth",\n      block: "center"\n    });\n  }, 300); // 等待键盘弹出\n});\n\n/* 或使用scrollIntoViewIfNeeded */\ninput.addEventListener("focus", () => {\n  setTimeout(() => {\n    input.scrollIntoViewIfNeeded();\n  }, 300);\n});',
                        content: "滚动输入框到可视区域。"
                    },
                    {
                        title: "问题2：fixed元素错位",
                        code: '/* iOS fixed元素在键盘弹出时会错位 */\n\n/* 方案1：键盘弹出时改为absolute */\nlet isKeyboardShow = false;\n\nwindow.addEventListener("resize", () => {\n  const heightDiff = window.innerHeight - document.documentElement.clientHeight;\n  \n  if (heightDiff > 100) {\n    // 键盘弹出\n    isKeyboardShow = true;\n    document.body.classList.add("keyboard-show");\n  } else {\n    // 键盘收起\n    isKeyboardShow = false;\n    document.body.classList.remove("keyboard-show");\n  }\n});\n\n/* CSS */\n.footer {\n  position: fixed;\n  bottom: 0;\n}\n\n.keyboard-show .footer {\n  position: absolute;\n}\n\n/* 方案2：使用visualViewport API */\nwindow.visualViewport.addEventListener("resize", () => {\n  const footer = document.querySelector(".footer");\n  footer.style.bottom = window.innerHeight - visualViewport.height + "px";\n});',
                        content: "修复fixed定位问题。"
                    },
                    {
                        title: "问题3：页面被顶起",
                        code: '/* body高度被撑大 */\n\n/* 禁止页面滚动 */\nbody.keyboard-show {\n  position: fixed;\n  width: 100%;\n}\n\n/* 或限制body高度 */\nbody {\n  max-height: 100vh;\n  overflow: hidden;\n}\n\n.content {\n  height: 100vh;\n  overflow-y: auto;\n}',
                        content: "防止页面被顶起。"
                    }
                ]
            },
            source: "移动端开发"
        },
        {
            difficulty: "easy",
            tags: ["点击延迟", "300ms"],
            question: "移动端300ms点击延迟的原因和解决方案？",
            type: "single-choice",
            options: [
                "双击缩放导致，使用FastClick或viewport设置",
                "网络延迟导致",
                "浏览器性能问题",
                "JavaScript执行慢"
            ],
            correctAnswer: "A",
            explanation: {
                title: "300ms延迟",
                description: "移动端点击延迟问题。",
                sections: [
                    {
                        title: "延迟原因",
                        code: '/* 浏览器需要等待300ms判断用户是否双击缩放 */\n单击 → 等待300ms → 没有第二次点击 → 触发click事件\n\n双击 → 第二次点击在300ms内 → 触发缩放',
                        content: "为了支持双击缩放。"
                    },
                    {
                        title: "方案1：禁用缩放",
                        code: '/* viewport禁用缩放 */\n<meta name="viewport" \n      content="width=device-width, \n               initial-scale=1.0, \n               maximum-scale=1.0, \n               user-scalable=no">\n\n/* 缺点：影响无障碍 */',
                        content: "禁用缩放消除延迟。"
                    },
                    {
                        title: "方案2：CSS touch-action",
                        code: '/* 禁用双击缩放，保留其他手势 */\nhtml {\n  touch-action: manipulation;\n}\n\n/* 现代浏览器已默认 */',
                        content: "推荐方案。"
                    },
                    {
                        title: "方案3：FastClick",
                        code: '/* 引入FastClick库 */\nimport FastClick from "fastclick";\n\nFastClick.attach(document.body);\n\n/* 原理：监听touchend，立即触发点击 */\n\n/* 注意：现代浏览器已不需要 */',
                        content: "旧设备解决方案。"
                    }
                ]
            },
            source: "移动端开发"
        },
        {
            difficulty: "medium",
            tags: ["触摸事件", "滑动"],
            question: "移动端触摸事件的顺序？",
            type: "single-choice",
            options: [
                "touchstart → touchmove → touchend",
                "touchmove → touchstart → touchend",
                "touchstart → touchend → touchmove",
                "没有固定顺序"
            ],
            correctAnswer: "A",
            explanation: {
                title: "触摸事件",
                description: "移动端的触摸事件系统。",
                sections: [
                    {
                        title: "触摸事件顺序",
                        code: '/* 完整事件流 */\ntouchstart  → touchmove → touchmove → ... → touchend\n\n/* 取消触摸 */\ntouchstart → touchmove → touchcancel\n\n/* 点击（不移动）*/\ntouchstart → touchend → click (延迟300ms)',
                        content: "触摸事件的顺序。"
                    },
                    {
                        title: "事件对象",
                        code: 'element.addEventListener("touchstart", (e) => {\n  // 阻止默认（如滚动）\n  e.preventDefault();\n  \n  // 触摸点信息\n  const touch = e.touches[0];\n  \n  console.log("位置:", touch.clientX, touch.clientY);\n  console.log("相对页面:", touch.pageX, touch.pageY);\n  console.log("相对屏幕:", touch.screenX, touch.screenY);\n  console.log("触摸ID:", touch.identifier);\n});\n\n/* touches vs targetTouches vs changedTouches */\ne.touches         - 所有触摸点\ne.targetTouches   - 目标元素上的触摸点\ne.changedTouches  - 改变的触摸点',
                        content: "触摸事件对象。"
                    },
                    {
                        title: "实现滑动",
                        code: 'let startX = 0;\nlet startY = 0;\n\nelement.addEventListener("touchstart", (e) => {\n  const touch = e.touches[0];\n  startX = touch.clientX;\n  startY = touch.clientY;\n});\n\nelement.addEventListener("touchmove", (e) => {\n  const touch = e.touches[0];\n  const deltaX = touch.clientX - startX;\n  const deltaY = touch.clientY - startY;\n  \n  // 判断滑动方向\n  if (Math.abs(deltaX) > Math.abs(deltaY)) {\n    // 水平滑动\n    if (deltaX > 0) {\n      console.log("向右滑动");\n    } else {\n      console.log("向左滑动");\n    }\n  } else {\n    // 垂直滑动\n    if (deltaY > 0) {\n      console.log("向下滑动");\n    } else {\n      console.log("向上滑动");\n    }\n  }\n});\n\nelement.addEventListener("touchend", (e) => {\n  console.log("触摸结束");\n});',
                        content: "实现滑动检测。"
                    }
                ]
            },
            source: "Touch Events"
        },
        {
            difficulty: "hard",
            tags: ["iOS", "滚动"],
            question: "iOS滚动不流畅和回弹问题如何解决？",
            type: "multiple-choice",
            options: [
                "使用-webkit-overflow-scrolling",
                "momentum滚动",
                "touch-action设置",
                "阻止默认行为"
            ],
            correctAnswer: ["A", "B"],
            explanation: {
                title: "iOS滚动优化",
                description: "解决iOS滚动体验问题。",
                sections: [
                    {
                        title: "开启弹性滚动",
                        code: '/* iOS弹性滚动 */\n.scroll-container {\n  overflow-y: auto;\n  -webkit-overflow-scrolling: touch; /* 开启硬件加速 */\n}\n\n/* 注意：可能导致的问题 */\n1. 滚动时fixed元素抖动\n2. 滚动穿透\n3. 滚动卡顿',
                        content: "开启momentum滚动。"
                    },
                    {
                        title: "解决滚动穿透",
                        code: '/* 问题：弹窗内滚动到底部继续滑动，下层页面也滚动 */\n\n/* 方案1：阻止touchmove */\nconst modal = document.querySelector(".modal");\n\nmodal.addEventListener("touchmove", (e) => {\n  e.stopPropagation();\n}, { passive: false });\n\n/* 方案2：禁止body滚动 */\nfunction showModal() {\n  document.body.style.overflow = "hidden";\n  document.body.style.position = "fixed";\n  document.body.style.width = "100%";\n  document.body.style.top = -scrollY + "px";\n}\n\nfunction hideModal() {\n  const top = document.body.style.top;\n  document.body.style.overflow = "";\n  document.body.style.position = "";\n  document.body.style.width = "";\n  document.body.style.top = "";\n  window.scrollTo(0, -parseInt(top));\n}\n\n/* 方案3：检查滚动边界 */\nfunction preventScroll(e) {\n  const scrollTop = this.scrollTop;\n  const scrollHeight = this.scrollHeight;\n  const clientHeight = this.clientHeight;\n  const deltaY = e.deltaY || -e.detail || 0;\n  \n  // 到顶部且继续上滑\n  if (scrollTop === 0 && deltaY < 0) {\n    e.preventDefault();\n  }\n  \n  // 到底部且继续下滑\n  if (scrollTop + clientHeight >= scrollHeight && deltaY > 0) {\n    e.preventDefault();\n  }\n}',
                        content: "解决滚动穿透。"
                    },
                    {
                        title: "解决fixed抖动",
                        code: '/* iOS滚动时fixed元素抖动 */\n\n/* 方案1：改用absolute */\n.header {\n  position: absolute;\n  top: 0;\n}\n\n/* 方案2：使用transform */\n.header {\n  position: fixed;\n  transform: translateZ(0); /* 开启硬件加速 */\n}',
                        content: "修复fixed抖动。"
                    }
                ]
            },
            source: "iOS开发"
        },
        {
            difficulty: "medium",
            tags: ["禁止选择", "长按"],
            question: "如何禁止移动端长按选择文本和弹出菜单？",
            type: "multiple-choice",
            options: [
                "user-select: none",
                "-webkit-touch-callout: none",
                "阻止contextmenu事件",
                "pointer-events: none"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "禁止选择和菜单",
                description: "控制用户交互行为。",
                sections: [
                    {
                        title: "禁止文本选择",
                        code: '/* 禁止选择 */\n.no-select {\n  user-select: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n}\n\n/* 或全局禁止 */\n* {\n  user-select: none;\n}\n\n/* 特定元素允许 */\n.selectable {\n  user-select: text;\n}',
                        content: "禁止文本选择。"
                    },
                    {
                        title: "禁止长按菜单",
                        code: '/* iOS长按弹出菜单 */\n.no-callout {\n  -webkit-touch-callout: none;\n}\n\n/* 禁止长按保存图片 */\nimg {\n  -webkit-touch-callout: none;\n  pointer-events: none;\n}\n\n/* 如果需要图片可点击 */\nimg {\n  -webkit-touch-callout: none;\n  user-select: none;\n}',
                        content: "禁止iOS长按菜单。"
                    },
                    {
                        title: "禁止右键菜单",
                        code: '/* 阻止contextmenu事件 */\ndocument.addEventListener("contextmenu", (e) => {\n  e.preventDefault();\n});\n\n/* 或针对特定元素 */\nconst images = document.querySelectorAll("img");\nimages.forEach(img => {\n  img.addEventListener("contextmenu", (e) => {\n    e.preventDefault();\n  });\n});',
                        content: "禁止右键菜单。"
                    },
                    {
                        title: "完整方案",
                        code: '/* CSS */\nbody {\n  /* 禁止选择 */\n  user-select: none;\n  -webkit-user-select: none;\n  \n  /* 禁止iOS长按菜单 */\n  -webkit-touch-callout: none;\n  \n  /* 禁止点击高亮 */\n  -webkit-tap-highlight-color: transparent;\n}\n\nimg {\n  /* 禁止拖拽 */\n  -webkit-user-drag: none;\n  \n  /* 禁止长按保存 */\n  -webkit-touch-callout: none;\n  pointer-events: none;\n}\n\n/* JavaScript */\ndocument.addEventListener("contextmenu", (e) => {\n  e.preventDefault();\n});\n\n/* 允许特定元素选择 */\n.selectable {\n  user-select: text;\n  -webkit-user-select: text;\n}',
                        content: "综合禁止方案。"
                    }
                ]
            },
            source: "移动端开发"
        }
    ],
    navigation: {
        prev: { title: "响应式设计", url: "quiz.html?chapter=32" },
        next: { title: "打印优化", url: "quiz.html?chapter=34" }
    }
};
