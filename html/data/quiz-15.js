// 第15章：可访问性 - 面试题
window.htmlQuizData_15 = {
    config: {
        title: "可访问性",
        icon: "♿",
        description: "测试你对Web可访问性的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["ARIA", "基础"],
            question: "什么是WAI-ARIA？它的作用是什么？",
            type: "multiple-choice",
            options: [
                "Web可访问性标准",
                "增强语义化",
                "帮助屏幕阅读器",
                "改善键盘导航"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "WAI-ARIA",
                description: "Web Accessibility Initiative - Accessible Rich Internet Applications。",
                sections: [
                    {
                        title: "什么是ARIA",
                        content: "ARIA是W3C制定的技术规范，通过添加属性来增强HTML的可访问性。",
                        points: [
                            "为动态内容提供语义",
                            "补充HTML语义不足",
                            "帮助辅助技术理解页面",
                            "不影响视觉呈现"
                        ]
                    },
                    {
                        title: "三类ARIA属性",
                        code: '<!-- 1. Roles（角色） -->\n<div role="navigation">导航</div>\n<div role="banner">横幅</div>\n<div role="dialog">对话框</div>\n\n<!-- 2. Properties（属性） -->\n<input aria-label="搜索" type="search">\n<button aria-pressed="true">已按下</button>\n\n<!-- 3. States（状态） -->\n<button aria-expanded="false">展开</button>\n<div aria-hidden="true">隐藏</div>',
                        points: [
                            "role：元素的角色",
                            "aria-*：额外的语义信息",
                            "aria-*：动态状态",
                            "都以aria-为前缀"
                        ]
                    },
                    {
                        title: "何时使用ARIA",
                        code: '<!-- 不推荐：有原生语义 -->\n<div role="button">点击</div>  <!-- 应该用<button> -->\n\n<!-- 推荐：原生标签 -->\n<button>点击</button>\n\n<!-- 必要：原生标签不够 -->\n<div role="tablist">\n  <button role="tab" aria-selected="true">标签1</button>\n  <button role="tab" aria-selected="false">标签2</button>\n</div>\n<div role="tabpanel">内容1</div>',
                        points: [
                            "第一原则：能用原生标签就用原生标签",
                            "ARIA是补充，不是替代",
                            "过度使用反而有害",
                            "动态组件常需要ARIA"
                        ]
                    }
                ]
            },
            source: "WAI-ARIA规范"
        },
        {
            difficulty: "medium",
            tags: ["语义化", "可访问性"],
            question: "如何让图片对屏幕阅读器友好？",
            options: [
                "使用alt属性",
                "装饰图片用空alt",
                "复杂图片用aria-describedby",
                "figure+figcaption"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "图片可访问性",
                description: "正确处理图片的替代文本。",
                sections: [
                    {
                        title: "alt属性",
                        code: '<!-- 内容图片 -->\n<img src="product.jpg" alt="红色连衣裙，长袖，棉质">\n\n<!-- 功能性图片（如按钮） -->\n<a href="/search">\n  <img src="search-icon.svg" alt="搜索">\n</a>\n\n<!-- 装饰性图片 -->\n<img src="decoration.png" alt="">\n<!-- 或 -->\n<img src="decoration.png" role="presentation">',
                        points: [
                            "alt描述图片内容",
                            "功能性图片描述功能",
                            "装饰性图片用空alt",
                            "不要省略alt属性"
                        ]
                    },
                    {
                        title: "复杂图片",
                        code: '<!-- 图表 -->\n<img src="chart.png" \n     alt="2024年销售趋势图"\n     aria-describedby="chart-desc">\n<div id="chart-desc">\n  <p>该图表显示2024年第一季度销售额从100万增长到150万，\n  增长率50%。</p>\n</div>\n\n<!-- 使用figure -->\n<figure>\n  <img src="architecture.png" alt="系统架构图">\n  <figcaption>\n    系统采用微服务架构，包含前端层、API网关、\n    业务服务层和数据层。\n  </figcaption>\n</figure>',
                        content: "复杂图片需要详细描述。"
                    },
                    {
                        title: "SVG可访问性",
                        code: '<!-- 内联SVG -->\n<svg role="img" aria-labelledby="title">\n  <title id="title">公司Logo</title>\n  <path d="..."/>\n</svg>\n\n<!-- 装饰性SVG -->\n<svg aria-hidden="true">\n  <path d="..."/>\n</svg>\n\n<!-- 带描述的SVG -->\n<svg role="img" aria-labelledby="title desc">\n  <title id="title">饼图</title>\n  <desc id="desc">销售占比：产品A 40%，产品B 35%，产品C 25%</desc>\n  <!-- SVG内容 -->\n</svg>',
                        content: "SVG也需要替代文本。"
                    },
                    {
                        title: "背景图片",
                        code: '<!-- 背景图是内容 -->\n<div style="background-image: url(logo.png)"\n     role="img"\n     aria-label="公司Logo">\n</div>\n\n<!-- 背景图是装饰 -->\n<div style="background-image: url(pattern.png)">\n  <h1>标题</h1>\n</div>',
                        content: "背景图如果有意义，需要添加aria-label。"
                    },
                    {
                        title: "最佳实践",
                        points: [
                            "alt应简洁但完整",
                            '不要以"图片"、"照片"开头',
                            "装饰图用空alt而非删除",
                            "图表等复杂图用aria-describedby",
                            "测试：关闭图片看是否能理解"
                        ]
                    }
                ]
            },
            source: "WCAG 2.1"
        },
        {
            difficulty: "medium",
            tags: ["表单", "可访问性"],
            question: "如何提升表单的可访问性？",
            type: "multiple-choice",
            options: [
                "label正确关联",
                "提供清晰的错误提示",
                "fieldset和legend分组",
                "required和aria-required"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "表单可访问性",
                description: "让所有人都能使用表单。",
                sections: [
                    {
                        title: "label关联",
                        code: '<!-- 显式关联 -->\n<label for="username">用户名：</label>\n<input type="text" id="username" name="username">\n\n<!-- 隐式关联 -->\n<label>\n  用户名：\n  <input type="text" name="username">\n</label>\n\n<!-- 不可见label（但屏幕阅读器能读） -->\n<label for="search" class="sr-only">搜索：</label>\n<input type="search" id="search" placeholder="搜索...">\n\n<style>\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0,0,0,0);\n  border: 0;\n}\n</style>',
                        points: [
                            "每个输入都应有label",
                            "for和id必须匹配",
                            "不要只用placeholder",
                            "视觉隐藏label用sr-only"
                        ]
                    },
                    {
                        title: "错误提示",
                        code: '<!-- 错误提示关联 -->\n<label for="email">邮箱：</label>\n<input type="email" \n       id="email"\n       aria-invalid="true"\n       aria-describedby="email-error">\n<span id="email-error" role="alert">\n  请输入有效的邮箱地址\n</span>\n\n<!-- 实时验证 -->\n<script>\nconst emailInput = document.getElementById("email");\nconst errorSpan = document.getElementById("email-error");\n\nemailInput.addEventListener("blur", function() {\n  if (!this.validity.valid) {\n    this.setAttribute("aria-invalid", "true");\n    errorSpan.textContent = "请输入有效的邮箱地址";\n  } else {\n    this.setAttribute("aria-invalid", "false");\n    errorSpan.textContent = "";\n  }\n});\n</script>',
                        points: [
                            "aria-invalid标记错误",
                            "aria-describedby关联错误信息",
                            "role='alert'自动通知",
                            "清晰描述如何修正"
                        ]
                    },
                    {
                        title: "表单分组",
                        code: '<!-- 单选框分组 -->\n<fieldset>\n  <legend>选择性别：</legend>\n  <label>\n    <input type="radio" name="gender" value="male">\n    男\n  </label>\n  <label>\n    <input type="radio" name="gender" value="female">\n    女\n  </label>\n</fieldset>\n\n<!-- 复选框分组 -->\n<fieldset>\n  <legend>兴趣爱好：</legend>\n  <label>\n    <input type="checkbox" name="hobby" value="reading">\n    阅读\n  </label>\n  <label>\n    <input type="checkbox" name="hobby" value="sports">\n    运动\n  </label>\n</fieldset>',
                        content: "相关字段用fieldset分组。"
                    },
                    {
                        title: "必填标记",
                        code: '<!-- HTML5 required -->\n<label for="name">姓名<abbr title="必填">*</abbr>：</label>\n<input type="text" id="name" required>\n\n<!-- ARIA -->\n<label for="email">邮箱：</label>\n<input type="email" \n       id="email"\n       aria-required="true">\n\n<!-- 明确提示 -->\n<form>\n  <p>标记<abbr title="必填" aria-label="必填">*</abbr>的为必填项</p>\n  \n  <label for="username">用户名 *：</label>\n  <input type="text" id="username" required>\n</form>',
                        content: "明确标识必填字段。"
                    },
                    {
                        title: "自动完成",
                        code: '<form>\n  <label for="name">姓名：</label>\n  <input type="text" \n         id="name"\n         autocomplete="name">\n  \n  <label for="email">邮箱：</label>\n  <input type="email" \n         id="email"\n         autocomplete="email">\n  \n  <label for="tel">电话：</label>\n  <input type="tel" \n         id="tel"\n         autocomplete="tel">\n  \n  <label for="address">地址：</label>\n  <input type="text" \n         id="address"\n         autocomplete="street-address">\n</form>',
                        content: "autocomplete帮助用户快速填写。"
                    }
                ]
            },
            source: "WCAG 2.1"
        },
        {
            difficulty: "hard",
            tags: ["键盘导航", "焦点管理"],
            question: "如何确保键盘可访问性？",
            options: [
                "所有交互元素可聚焦",
                "合理的tab顺序",
                "可见的焦点指示器",
                "支持键盘快捷键"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "键盘可访问性",
                description: "确保所有功能都能通过键盘操作。",
                sections: [
                    {
                        title: "可聚焦元素",
                        code: '<!-- 原生可聚焦元素 -->\n<a href="/page">链接</a>\n<button>按钮</button>\n<input type="text">\n<textarea></textarea>\n<select></select>\n\n<!-- 自定义可聚焦元素 -->\n<div tabindex="0" role="button">可聚焦的div</div>\n\n<!-- tabindex值 -->\n<button tabindex="0">正常顺序</button>\n<button tabindex="-1">可编程聚焦，不在tab顺序</button>\n<button tabindex="1">优先聚焦（不推荐）</button>',
                        points: [
                            "原生元素自动可聚焦",
                            "tabindex='0'加入tab顺序",
                            "tabindex='-1'可编程聚焦",
                            "避免使用正数tabindex"
                        ]
                    },
                    {
                        title: "焦点样式",
                        code: '/* 不要移除焦点样式！ */\nbutton:focus {\n  outline: 2px solid #4CAF50;\n  outline-offset: 2px;\n}\n\n/* 自定义焦点样式 */\n.button:focus {\n  outline: none;  /* 移除默认 */\n  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.5);\n}\n\n/* focus-visible（仅键盘聚焦） */\nbutton:focus-visible {\n  outline: 2px solid #4CAF50;\n}\n\n/* 移除鼠标点击的焦点样式 */\nbutton:focus:not(:focus-visible) {\n  outline: none;\n}',
                        points: [
                            "永远不要outline: none",
                            "提供清晰的焦点指示",
                            "focus-visible区分键盘和鼠标",
                            "高对比度的焦点样式"
                        ]
                    },
                    {
                        title: "键盘事件",
                        code: '<!-- 自定义按钮 -->\n<div role="button" \n     tabindex="0"\n     onclick="handleClick()"\n     onkeydown="handleKeydown(event)">\n  点击我\n</div>\n\n<script>\nfunction handleClick() {\n  console.log("点击");\n}\n\nfunction handleKeydown(event) {\n  // Enter或Space触发\n  if (event.key === "Enter" || event.key === " ") {\n    event.preventDefault();\n    handleClick();\n  }\n}\n</script>\n\n<!-- 更好的方式：直接用button -->\n<button onclick="handleClick()">点击我</button>',
                        content: "自定义元素需要实现键盘支持。"
                    },
                    {
                        title: "焦点管理",
                        code: '// 打开模态框时\nfunction openModal() {\n  const modal = document.getElementById("modal");\n  const firstFocusable = modal.querySelector("button");\n  \n  // 保存当前焦点\n  previousFocus = document.activeElement;\n  \n  modal.hidden = false;\n  \n  // 移动焦点到模态框\n  firstFocusable.focus();\n  \n  // 限制焦点在模态框内\n  modal.addEventListener("keydown", trapFocus);\n}\n\n// 关闭模态框时\nfunction closeModal() {\n  const modal = document.getElementById("modal");\n  modal.hidden = true;\n  \n  // 恢复焦点\n  previousFocus.focus();\n}\n\n// 焦点陷阱\nfunction trapFocus(e) {\n  if (e.key !== "Tab") return;\n  \n  const modal = document.getElementById("modal");\n  const focusable = modal.querySelectorAll(\n    \'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])\'\n  );\n  const first = focusable[0];\n  const last = focusable[focusable.length - 1];\n  \n  if (e.shiftKey) {  // Shift+Tab\n    if (document.activeElement === first) {\n      last.focus();\n      e.preventDefault();\n    }\n  } else {  // Tab\n    if (document.activeElement === last) {\n      first.focus();\n      e.preventDefault();\n    }\n  }\n}',
                        content: "模态框需要焦点管理。"
                    },
                    {
                        title: "跳过导航",
                        code: '<!-- 跳过链接 -->\n<a href="#main-content" class="skip-link">\n  跳到主内容\n</a>\n\n<nav>...</nav>\n\n<main id="main-content" tabindex="-1">\n  <!-- 主内容 -->\n</main>\n\n<style>\n.skip-link {\n  position: absolute;\n  top: -40px;\n  left: 0;\n  z-index: 100;\n}\n\n.skip-link:focus {\n  top: 0;\n}\n</style>',
                        content: "提供跳过重复内容的链接。"
                    },
                    {
                        title: "组件键盘支持",
                        code: '// Tab组件\nclass Tabs {\n  constructor(tablist) {\n    this.tablist = tablist;\n    this.tabs = tablist.querySelectorAll("[role=tab]");\n    this.setupKeyboard();\n  }\n  \n  setupKeyboard() {\n    this.tablist.addEventListener("keydown", (e) => {\n      const currentIndex = Array.from(this.tabs)\n        .indexOf(document.activeElement);\n      \n      switch (e.key) {\n        case "ArrowRight":\n          e.preventDefault();\n          const nextIndex = (currentIndex + 1) % this.tabs.length;\n          this.tabs[nextIndex].focus();\n          break;\n        case "ArrowLeft":\n          e.preventDefault();\n          const prevIndex = \n            (currentIndex - 1 + this.tabs.length) % this.tabs.length;\n          this.tabs[prevIndex].focus();\n          break;\n        case "Home":\n          e.preventDefault();\n          this.tabs[0].focus();\n          break;\n        case "End":\n          e.preventDefault();\n          this.tabs[this.tabs.length - 1].focus();\n          break;\n      }\n    });\n  }\n}',
                        content: "遵循WAI-ARIA设计模式。"
                    }
                ]
            },
            source: "WCAG 2.1"
        },
        {
            difficulty: "hard",
            tags: ["ARIA live regions", "动态内容"],
            question: "如何让动态内容对屏幕阅读器友好？",
            options: [
                "使用aria-live",
                "role='status'和role='alert'",
                "aria-atomic控制播报方式",
                "aria-relevant指定变化类型"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "ARIA Live Regions",
                description: "让屏幕阅读器通知动态内容变化。",
                sections: [
                    {
                        title: "aria-live",
                        code: '<!-- 礼貌播报（不打断） -->\n<div aria-live="polite">\n  已保存\n</div>\n\n<!-- 强势播报（立即打断） -->\n<div aria-live="assertive">\n  错误：网络连接失败！\n</div>\n\n<!-- 关闭播报 -->\n<div aria-live="off">\n  此内容变化不会被播报\n</div>',
                        points: [
                            "polite：等待当前播报完成",
                            "assertive：立即播报",
                            "off：不播报",
                            "默认off"
                        ]
                    },
                    {
                        title: "预定义角色",
                        code: '<!-- status（相当于aria-live="polite"） -->\n<div role="status">\n  加载中...\n</div>\n\n<!-- alert（相当于aria-live="assertive"） -->\n<div role="alert">\n  表单验证失败！\n</div>\n\n<!-- log（聊天记录等） -->\n<div role="log">\n  <div>用户A：你好</div>\n  <div>用户B：你好</div>\n</div>\n\n<!-- timer（倒计时等） -->\n<div role="timer">剩余时间：3:25</div>',
                        content: "role自动设置aria-live。"
                    },
                    {
                        title: "aria-atomic",
                        code: '<!-- 播报整个区域 -->\n<div aria-live="polite" aria-atomic="true">\n  <span id="hours">3</span>小时\n  <span id="minutes">25</span>分钟\n</div>\n<!-- 任何变化都播报"3小时25分钟" -->\n\n<!-- 只播报变化部分 -->\n<div aria-live="polite" aria-atomic="false">\n  <span id="hours">3</span>小时\n  <span id="minutes">25</span>分钟\n</div>\n<!-- 只播报变化的数字 -->',
                        points: [
                            "atomic='true'：播报整个区域",
                            "atomic='false'：只播报变化部分",
                            "默认false"
                        ]
                    },
                    {
                        title: "aria-relevant",
                        code: '<!-- 指定关注的变化类型 -->\n<div aria-live="polite"\n     aria-relevant="additions">\n  <!-- 只播报新增内容 -->\n</div>\n\n<div aria-live="polite"\n     aria-relevant="removals">\n  <!-- 只播报删除内容 -->\n</div>\n\n<div aria-live="polite"\n     aria-relevant="additions text">\n  <!-- 播报新增和文本变化 -->\n</div>\n\n<div aria-live="polite"\n     aria-relevant="all">\n  <!-- 播报所有变化 -->\n</div>',
                        points: [
                            "additions：新增元素",
                            "removals：删除元素",
                            "text：文本变化",
                            "all：所有变化",
                            "默认'additions text'"
                        ]
                    },
                    {
                        title: "实际应用",
                        code: '<!-- 表单验证 -->\n<form>\n  <label for="email">邮箱：</label>\n  <input type="email" id="email">\n  \n  <div role="alert" aria-live="assertive" id="email-error">\n    <!-- 错误信息动态插入这里 -->\n  </div>\n</form>\n\n<script>\nconst emailInput = document.getElementById("email");\nconst errorDiv = document.getElementById("email-error");\n\nemailInput.addEventListener("blur", function() {\n  if (!this.validity.valid) {\n    errorDiv.textContent = "请输入有效的邮箱地址";\n  } else {\n    errorDiv.textContent = "";\n  }\n});\n</script>\n\n<!-- 加载状态 -->\n<div role="status" aria-live="polite">\n  <span id="loading-message"></span>\n</div>\n\n<script>\nconst loadingMessage = document.getElementById("loading-message");\n\nloadingMessage.textContent = "正在加载...";\n\n// 加载完成\nloadingMessage.textContent = "加载完成，共10条结果";\n</script>\n\n<!-- 通知 -->\n<div role="region" aria-live="polite" aria-label="通知">\n  <div id="notification"></div>\n</div>\n\n<script>\nfunction showNotification(message) {\n  const notification = document.getElementById("notification");\n  notification.textContent = message;\n  \n  setTimeout(() => {\n    notification.textContent = "";\n  }, 5000);\n}\n\nshowNotification("消息已发送");\n</script>',
                        content: "常见的Live Region应用场景。"
                    },
                    {
                        title: "注意事项",
                        points: [
                            "Live Region要在DOM加载时就存在",
                            "不要过度使用assertive",
                            "内容变化要有意义",
                            "考虑用户体验",
                            "测试不同屏幕阅读器"
                        ]
                    }
                ]
            },
            source: "WAI-ARIA"
        },
        {
            difficulty: "medium",
            tags: ["color", "对比度"],
            question: "颜色和对比度的可访问性要求？",
            type: "multiple-choice",
            options: [
                "不能仅用颜色传达信息",
                "文本对比度至少4.5:1",
                "大文本对比度至少3:1",
                "使用工具检测对比度"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "颜色与对比度",
                description: "确保视觉内容的可访问性。",
                sections: [
                    {
                        title: "不依赖颜色",
                        code: '<!-- 错误：仅用颜色 -->\n<style>\n.error { color: red; }\n.success { color: green; }\n</style>\n<p class="error">错误</p>\n<p class="success">成功</p>\n\n<!-- 正确：颜色+图标/文本 -->\n<p class="error">\n  <svg aria-hidden="true">...</svg>\n  <span>错误：</span>操作失败\n</p>\n<p class="success">\n  <svg aria-hidden="true">...</svg>\n  <span>成功：</span>操作成功\n</p>\n\n<!-- 表单错误 -->\n<input type="email" \n       aria-invalid="true"\n       aria-describedby="email-error">\n<span id="email-error">\n  ❌ 请输入有效的邮箱\n</span>',
                        content: "不要仅靠颜色区分信息。"
                    },
                    {
                        title: "对比度要求",
                        code: '/* WCAG AA级别 */\n/* 普通文本：4.5:1 */\nbody {\n  color: #333;  /* 对比度 12.63:1 */\n  background: #fff;\n}\n\n/* 大文本（18pt+或14pt粗体）：3:1 */\nh1 {\n  color: #666;  /* 对比度 5.74:1 */\n  background: #fff;\n  font-size: 24px;\n  font-weight: bold;\n}\n\n/* WCAG AAA级别 */\n/* 普通文本：7:1 */\n/* 大文本：4.5:1 */',
                        points: [
                            "AA级别：普通文本4.5:1",
                            "AA级别：大文本3:1",
                            "AAA级别：普通文本7:1",
                            "AAA级别：大文本4.5:1"
                        ]
                    },
                    {
                        title: "链接对比度",
                        code: '/* 链接与周围文本 */\np {\n  color: #333;\n}\n\na {\n  color: #0066cc;  /* 与文本对比度3:1+ */\n  text-decoration: underline;  /* 加下划线更好 */\n}\n\na:hover, a:focus {\n  color: #004080;\n  text-decoration: underline;\n}',
                        content: "链接应该易于识别。"
                    },
                    {
                        title: "检测工具",
                        code: '// 浏览器DevTools\n// Chrome: Lighthouse > Accessibility\n// Firefox: Accessibility Inspector\n\n// 在线工具\n// - WebAIM Contrast Checker\n// - Contrast Ratio (Lea Verou)\n// - Color Oracle（色盲模拟）\n\n// 自动化测试\nconst contrastRatio = require("wcag-contrast");\n\nconst ratio = contrastRatio.hex("#333", "#fff");\nconsole.log(ratio);  // 12.63\n\nconst passesAA = contrastRatio.score(ratio);\nconsole.log(passesAA);  // AAA',
                        content: "使用工具验证对比度。"
                    },
                    {
                        title: "色盲友好",
                        code: '/* 不要用红绿区分 */\n/* 错误 */\n.positive { color: green; }\n.negative { color: red; }\n\n/* 改进 */\n.positive {\n  color: #0066cc;  /* 蓝色 */\n}\n.positive::before {\n  content: "▲ ";\n}\n\n.negative {\n  color: #cc6600;  /* 橙色 */\n}\n.negative::before {\n  content: "▼ ";\n}',
                        content: "考虑色盲用户。"
                    },
                    {
                        title: "暗黑模式",
                        code: '@media (prefers-color-scheme: dark) {\n  body {\n    color: #e0e0e0;\n    background: #121212;\n  }\n  \n  a {\n    color: #64b5f6;  /* 保持足够对比度 */\n  }\n}',
                        content: "暗黑模式也要保证对比度。"
                    }
                ]
            },
            source: "WCAG 2.1"
        },
        {
            difficulty: "hard",
            tags: ["测试", "工具"],
            question: "如何测试网页的可访问性？",
            options: [
                "自动化测试工具",
                "键盘导航测试",
                "屏幕阅读器测试",
                "真实用户测试"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "可访问性测试",
                description: "全面测试网页的可访问性。",
                sections: [
                    {
                        title: "自动化工具",
                        code: '// Lighthouse (Chrome DevTools)\n// 1. 打开DevTools\n// 2. Lighthouse标签\n// 3. 选择Accessibility\n// 4. Generate report\n\n// axe DevTools\n// Chrome/Firefox扩展\n// 自动检测违规项\n\n// WAVE\n// https://wave.webaim.org/\n// 在线检测工具\n\n// Pa11y\nnpm install -g pa11y\npa11y https://example.com\n\n// axe-core\nconst { AxePuppeteer } = require("@axe-core/puppeteer");\nconst puppeteer = require("puppeteer");\n\nconst browser = await puppeteer.launch();\nconst page = await browser.newPage();\nawait page.goto("https://example.com");\n\nconst results = await new AxePuppeteer(page).analyze();\nconsole.log(results.violations);',
                        content: "自动化工具快速发现问题。"
                    },
                    {
                        title: "键盘测试",
                        points: [
                            "拔掉鼠标，只用键盘",
                            "Tab：前进",
                            "Shift+Tab：后退",
                            "Enter：激活链接/按钮",
                            "Space：激活按钮/选中复选框",
                            "方向键：在组件内导航",
                            "Esc：关闭对话框",
                            "检查焦点是否可见",
                            "检查tab顺序是否合理",
                            "所有功能都能访问"
                        ]
                    },
                    {
                        title: "屏幕阅读器测试",
                        code: '// Windows: NVDA（免费）\n// https://www.nvaccess.org/\n\n// Windows: JAWS（收费）\n// https://www.freedomscientific.com/products/software/jaws/\n\n// macOS: VoiceOver（内置）\n// Cmd+F5开启\n\n// 常用命令（NVDA）：\n// - Ctrl：停止朗读\n// - Insert+Down：连续阅读\n// - Insert+F7：元素列表\n// - H：下一个标题\n// - K：下一个链接\n// - F：下一个表单元素',
                        content: "测试屏幕阅读器体验。"
                    },
                    {
                        title: "检查清单",
                        points: [
                            "✓ 所有图片有alt",
                            "✓ 所有表单控件有label",
                            "✓ 标题层级正确（h1-h6）",
                            "✓ 链接文本有意义",
                            "✓ 颜色对比度足够",
                            "✓ 不仅依赖颜色",
                            "✓ 键盘可导航",
                            "✓ 焦点可见",
                            "✓ ARIA使用正确",
                            "✓ 动态内容可感知",
                            "✓ 页面有语言声明",
                            "✓ 跳过导航链接"
                        ]
                    },
                    {
                        title: "持续集成",
                        code: '// package.json\n{\n  "scripts": {\n    "test:a11y": "pa11y-ci"\n  },\n  "devDependencies": {\n    "pa11y-ci": "^3.0.0"\n  }\n}\n\n// .pa11yci\n{\n  "urls": [\n    "http://localhost:3000",\n    "http://localhost:3000/about",\n    "http://localhost:3000/contact"\n  ],\n  "standard": "WCAG2AA"\n}\n\n// GitHub Actions\nname: Accessibility Tests\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - run: npm install\n      - run: npm start &\n      - run: npm run test:a11y',
                        content: "在CI/CD中集成可访问性测试。"
                    }
                ]
            },
            source: "WCAG 2.1"
        },
        {
            difficulty: "medium",
            tags: ["最佳实践", "标准"],
            question: "WCAG 2.1的四大原则是什么？",
            type: "multiple-choice",
            options: [
                "可感知（Perceivable）",
                "可操作（Operable）",
                "可理解（Understandable）",
                "稳健性（Robust）"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "WCAG四大原则（POUR）",
                description: "Web内容可访问性指南的核心原则。",
                sections: [
                    {
                        title: "1. 可感知（Perceivable）",
                        points: [
                            "信息和UI组件必须以用户能感知的方式呈现",
                            "提供替代文本（图片、视频等）",
                            "提供字幕和音频描述",
                            "内容可以不同方式呈现",
                            "足够的颜色对比度",
                            "文本可调整大小"
                        ],
                        code: '<!-- 示例 -->\n<img src="chart.png" alt="2024年销售趋势图">\n\n<video controls>\n  <source src="video.mp4">\n  <track kind="captions" src="captions.vtt">\n  <track kind="descriptions" src="descriptions.vtt">\n</video>\n\n<style>\nbody {\n  color: #333;  /* 对比度足够 */\n  font-size: 16px;  /* 可缩放 */\n}\n</style>'
                    },
                    {
                        title: "2. 可操作（Operable）",
                        points: [
                            "所有功能可通过键盘操作",
                            "给用户足够的时间",
                            "不使用引发癫痫的内容",
                            "提供导航和定位帮助",
                            "可见的焦点指示器"
                        ],
                        code: '<!-- 示例 -->\n<button>可键盘操作的按钮</button>\n\n<!-- 跳过导航 -->\n<a href="#main" class="skip-link">跳到主内容</a>\n\n<!-- 面包屑 -->\n<nav aria-label="面包屑">\n  <a href="/">首页</a> >\n  <a href="/products">产品</a> >\n  <span aria-current="page">详情</span>\n</nav>'
                    },
                    {
                        title: "3. 可理解（Understandable）",
                        points: [
                            "文本可读且可理解",
                            "内容以可预测的方式出现和操作",
                            "帮助用户避免和纠正错误",
                            "页面有语言声明",
                            "清晰的说明和标签"
                        ],
                        code: '<!-- 示例 -->\n<!DOCTYPE html>\n<html lang="zh-CN">\n<head>...</head>\n<body>\n  <form>\n    <label for="email">邮箱：</label>\n    <input type="email" \n           id="email"\n           aria-describedby="email-help">\n    <span id="email-help">\n      请输入有效的邮箱地址\n    </span>\n    \n    <div role="alert" id="error">\n      <!-- 错误提示 -->\n    </div>\n  </form>\n</body>\n</html>'
                    },
                    {
                        title: "4. 稳健性（Robust）",
                        points: [
                            "内容能被各种用户代理解析",
                            "兼容辅助技术",
                            "有效的HTML",
                            "正确使用ARIA",
                            "向后兼容"
                        ],
                        code: '<!-- 示例：有效的HTML -->\n<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width">\n  <title>页面标题</title>\n</head>\n<body>\n  <main>\n    <h1>主标题</h1>\n    <p>段落内容</p>\n  </main>\n</body>\n</html>\n\n<!-- 验证：https://validator.w3.org/ -->'
                    },
                    {
                        title: "符合等级",
                        points: [
                            "A级：最基本",
                            "AA级：推荐目标（对比度4.5:1）",
                            "AAA级：最高级别（对比度7:1）",
                            "多数网站应达到AA级"
                        ]
                    }
                ]
            },
            source: "WCAG 2.1"
        }
    ],
    navigation: {
        prev: { title: "HTML5 API（下）", url: "14-html5-api-2-quiz.html" },
        next: { title: "SEO优化", url: "16-seo-quiz.html" }
    }
};
