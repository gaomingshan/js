// 第36章：未来趋势 - 面试题
window.htmlQuizData_36 = {
    config: {
        title: "未来趋势",
        icon: "🚀",
        description: "测试你对HTML未来发展的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "medium",
            tags: ["容器查询", "CSS"],
            question: "什么是容器查询（Container Queries）？",
            type: "single-choice",
            options: [
                "根据父容器尺寸应用样式",
                "根据视口尺寸应用样式",
                "查询DOM容器",
                "容器的媒体查询"
            ],
            correctAnswer: "A",
            explanation: {
                title: "容器查询",
                description: "下一代响应式设计技术。",
                sections: [
                    {
                        title: "媒体查询的局限",
                        code: '/* 传统媒体查询 - 基于视口 */\n@media (min-width: 768px) {\n  .card {\n    display: flex;\n  }\n}\n\n/* 问题：组件无法感知自己的容器大小 */\n<div class="sidebar">  <!-- 300px宽 -->\n  <div class="card">...</div>  <!-- 仍按视口宽度应用样式 -->\n</div>\n\n<div class="main">  <!-- 900px宽 -->\n  <div class="card">...</div>  <!-- 样式相同 -->\n</div>',
                        content: "媒体查询只能基于视口。"
                    },
                    {
                        title: "容器查询",
                        code: '/* 定义容器 */\n.card-container {\n  container-type: inline-size;\n  container-name: card;\n}\n\n/* 根据容器宽度应用样式 */\n@container card (min-width: 400px) {\n  .card {\n    display: flex;\n  }\n}\n\n@container card (min-width: 600px) {\n  .card {\n    flex-direction: row;\n  }\n}\n\n/* HTML */\n<div class="card-container">  <!-- 容器 -->\n  <div class="card">         <!-- 根据容器宽度响应 -->\n    <img src="image.jpg">\n    <div class="content">...</div>\n  </div>\n</div>',
                        content: "基于容器尺寸的响应式。"
                    },
                    {
                        title: "实际应用",
                        code: '/* 卡片组件 */\n.card-wrapper {\n  container-type: inline-size;\n}\n\n.card {\n  display: grid;\n}\n\n/* 小容器 - 竖向布局 */\n@container (max-width: 399px) {\n  .card {\n    grid-template-columns: 1fr;\n  }\n  \n  .card img {\n    width: 100%;\n  }\n}\n\n/* 中等容器 - 横向布局 */\n@container (min-width: 400px) and (max-width: 599px) {\n  .card {\n    grid-template-columns: 150px 1fr;\n  }\n}\n\n/* 大容器 - 宽松布局 */\n@container (min-width: 600px) {\n  .card {\n    grid-template-columns: 250px 1fr;\n    gap: 20px;\n  }\n}',
                        content: "真正的组件化响应式。"
                    },
                    {
                        title: "浏览器支持",
                        code: '/* 浏览器支持 (2024+) */\nChrome 105+\nEdge 105+\nSafari 16+\nFirefox 110+\n\n/* 特性检测 */\n@supports (container-type: inline-size) {\n  .card-wrapper {\n    container-type: inline-size;\n  }\n  \n  @container (min-width: 400px) {\n    .card {\n      display: flex;\n    }\n  }\n}',
                        content: "现代浏览器已支持。"
                    }
                ]
            },
            source: "CSS Containment"
        },
        {
            difficulty: "hard",
            tags: ["has选择器", "CSS"],
            question: ":has()伪类选择器的作用？",
            type: "multiple-choice",
            options: [
                "选择包含特定子元素的父元素",
                "父选择器",
                "条件样式",
                "关系选择器"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: ":has()选择器",
                description: "CSS的父选择器和条件样式。",
                sections: [
                    {
                        title: "基本用法",
                        code: '/* 选择包含img的li */\nli:has(img) {\n  padding: 20px;\n}\n\n/* 选择包含h2的article */\narticle:has(h2) {\n  border-top: 2px solid #ccc;\n}\n\n/* 选择不包含p的div */\ndiv:not(:has(p)) {\n  display: none;\n}',
                        content: "选择包含特定元素的父元素。"
                    },
                    {
                        title: "实际应用",
                        code: '/* 1. 表单验证样式 */\nform:has(input:invalid) .submit-btn {\n  opacity: 0.5;\n  pointer-events: none;\n}\n\n/* 2. 购物车状态 */\n.cart:has(.item) .empty-message {\n  display: none;\n}\n\n.cart:not(:has(.item)) .checkout-btn {\n  display: none;\n}\n\n/* 3. 图片加载状态 */\nfigure:has(img[src=""]) {\n  background: #f0f0f0;\n}\n\n/* 4. 卡片变体 */\n.card:has(.icon) .title {\n  padding-left: 40px;\n}\n\n/* 5. 导航激活状态 */\nnav:has(a.active) {\n  background: #f5f5f5;\n}',
                        content: "强大的实际应用。"
                    },
                    {
                        title: "组合使用",
                        code: '/* 选择紧邻h2的p */\nh2:has(+ p) {\n  margin-bottom: 0;\n}\n\n/* 选择包含特定类的父元素的兄弟 */\n.section:has(.highlight) + .section {\n  margin-top: 40px;\n}\n\n/* 复杂条件 */\nul:has(> li:nth-child(n+5)) {\n  columns: 2;\n}',
                        content: "与其他选择器组合。"
                    }
                ]
            },
            source: "CSS Selectors Level 4"
        },
        {
            difficulty: "medium",
            tags: ["View Transitions", "动画"],
            question: "View Transitions API的用途？",
            type: "multiple-choice",
            options: [
                "页面间过渡动画",
                "SPA路由切换",
                "元素位置动画",
                "跨页面动画"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "View Transitions API",
                description: "原生的页面过渡动画。",
                sections: [
                    {
                        title: "基本用法",
                        code: '/* SPA路由切换动画 */\nasync function navigate(url) {\n  // 检查支持\n  if (!document.startViewTransition) {\n    // 降级方案\n    loadPage(url);\n    return;\n  }\n  \n  // 启动过渡\n  const transition = document.startViewTransition(() => {\n    // 更新DOM\n    loadPage(url);\n  });\n  \n  await transition.finished;\n}\n\n/* 默认淡入淡出动画 */\n::view-transition-old(root),\n::view-transition-new(root) {\n  animation-duration: 0.3s;\n}',
                        content: "简单的页面切换动画。"
                    },
                    {
                        title: "自定义动画",
                        code: '/* 定义过渡名称 */\n.hero {\n  view-transition-name: hero-image;\n}\n\n.title {\n  view-transition-name: title;\n}\n\n/* 自定义动画 */\n::view-transition-old(hero-image) {\n  animation: fade-out 0.3s ease-out;\n}\n\n::view-transition-new(hero-image) {\n  animation: fade-in 0.3s ease-in;\n}\n\n@keyframes fade-out {\n  to { opacity: 0; }\n}\n\n@keyframes fade-in {\n  from { opacity: 0; }\n}',
                        content: "自定义过渡效果。"
                    },
                    {
                        title: "跨页面过渡",
                        code: '/* MPA跨页面过渡（实验性）*/\n\n<!-- 页面1 -->\n<img src="product.jpg" \n     style="view-transition-name: product-image;">\n\n<!-- 页面2 -->\n<img src="product.jpg" \n     style="view-transition-name: product-image;">\n\n/* CSS */\n@view-transition {\n  navigation: auto;\n}\n\n::view-transition-old(product-image),\n::view-transition-new(product-image) {\n  animation-duration: 0.5s;\n  animation-timing-function: ease-in-out;\n}',
                        content: "跨页面元素动画。"
                    }
                ]
            },
            source: "View Transitions API"
        },
        {
            difficulty: "easy",
            tags: ["Popover API", "弹窗"],
            question: "原生Popover API的优势？",
            type: "multiple-choice",
            options: [
                "无需JavaScript",
                "自动管理层级",
                "内置焦点管理",
                "无障碍支持"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Popover API",
                description: "原生的弹出层API。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<!-- HTML -->\n<button popovertarget="my-popover">打开弹窗</button>\n\n<div id="my-popover" popover>\n  <h2>弹窗标题</h2>\n  <p>弹窗内容</p>\n  <button popovertarget="my-popover" popovertargetaction="hide">\n    关闭\n  </button>\n</div>\n\n/* CSS */\n[popover] {\n  padding: 20px;\n  border: 1px solid #ccc;\n  border-radius: 8px;\n  box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n}\n\n[popover]::backdrop {\n  background: rgba(0,0,0,0.5);\n}',
                        content: "无需JavaScript的弹窗。"
                    },
                    {
                        title: "JavaScript控制",
                        code: '/* API方法 */\nconst popover = document.getElementById("my-popover");\n\n// 显示\npopover.showPopover();\n\n// 隐藏\npopover.hidePopover();\n\n// 切换\npopover.togglePopover();\n\n/* 事件 */\npopover.addEventListener("toggle", (e) => {\n  if (e.newState === "open") {\n    console.log("弹窗打开");\n  } else {\n    console.log("弹窗关闭");\n  }\n});\n\npopover.addEventListener("beforetoggle", (e) => {\n  // 可以阻止\n  if (shouldPrevent) {\n    e.preventDefault();\n  }\n});',
                        content: "JavaScript API控制。"
                    },
                    {
                        title: "popover类型",
                        code: '<!-- auto（默认）- 点击外部自动关闭 -->\n<div popover="auto">自动弹窗</div>\n\n<!-- manual - 必须手动关闭 -->\n<div popover="manual">手动弹窗</div>\n\n/* 自动特性 */\n1. 自动管理z-index（顶层）\n2. Esc键关闭\n3. 点击外部关闭\n4. 焦点管理\n5. 无障碍属性',
                        content: "不同类型的popover。"
                    }
                ]
            },
            source: "Popover API"
        },
        {
            difficulty: "medium",
            tags: ["Anchor Positioning", "定位"],
            question: "CSS Anchor Positioning的作用？",
            type: "single-choice",
            options: [
                "相对于锚点元素定位",
                "绝对定位",
                "固定定位",
                "相对定位"
            ],
            correctAnswer: "A",
            explanation: {
                title: "锚点定位",
                description: "相对于其他元素的定位方式。",
                sections: [
                    {
                        title: "基本概念",
                        code: '/* 传统定位的问题 */\n<button id="btn">按钮</button>\n<div class="tooltip">提示</div>\n\n/* 需要JavaScript计算位置 */\nconst btn = document.getElementById("btn");\nconst tooltip = document.querySelector(".tooltip");\n\nconst rect = btn.getBoundingClientRect();\ntooltip.style.top = rect.bottom + "px";\ntooltip.style.left = rect.left + "px";',
                        content: "传统方式需要JavaScript。"
                    },
                    {
                        title: "Anchor Positioning",
                        code: '/* 定义锚点 */\n.button {\n  anchor-name: --my-anchor;\n}\n\n/* 相对锚点定位 */\n.tooltip {\n  position: absolute;\n  position-anchor: --my-anchor;\n  \n  /* 位于锚点下方 */\n  top: anchor(bottom);\n  left: anchor(left);\n  \n  /* 或使用inset */\n  inset-block-start: anchor(end);\n  inset-inline-start: anchor(start);\n}\n\n/* 自动翻转 */\n.tooltip {\n  position-try-fallbacks: flip-block, flip-inline;\n}',
                        content: "纯CSS锚点定位。"
                    },
                    {
                        title: "实际应用",
                        code: '/* 下拉菜单 */\n.menu-button {\n  anchor-name: --menu-anchor;\n}\n\n.dropdown {\n  position: absolute;\n  position-anchor: --menu-anchor;\n  top: anchor(bottom);\n  left: anchor(left);\n  min-width: anchor-size(width);\n}\n\n/* 工具提示 */\n.icon {\n  anchor-name: --icon;\n}\n\n.tooltip {\n  position: absolute;\n  position-anchor: --icon;\n  bottom: anchor(top);\n  left: anchor(center);\n  transform: translateX(-50%);\n}',
                        content: "常见应用场景。"
                    }
                ]
            },
            source: "CSS Anchor Positioning"
        },
        {
            difficulty: "hard",
            tags: ["WebGPU", "图形"],
            question: "WebGPU相比WebGL的优势？",
            type: "multiple-choice",
            options: [
                "更现代的API",
                "更好的性能",
                "支持计算着色器",
                "更接近底层"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "WebGPU",
                description: "下一代Web图形API。",
                sections: [
                    {
                        title: "WebGPU vs WebGL",
                        code: '/* WebGL（基于OpenGL ES）*/\n- 2011年发布\n- 单线程\n- 功能有限\n- API复杂\n\n/* WebGPU（基于Vulkan/Metal/DirectX 12）*/\n- 2023+\n- 多线程\n- 计算着色器\n- 更现代的API\n- 更好的性能',
                        content: "WebGPU是WebGL的继任者。"
                    },
                    {
                        title: "基本示例",
                        code: '/* 获取GPU设备 */\nconst adapter = await navigator.gpu.requestAdapter();\nconst device = await adapter.requestDevice();\n\n/* 创建画布上下文 */\nconst canvas = document.querySelector("canvas");\nconst context = canvas.getContext("webgpu");\n\nconst format = navigator.gpu.getPreferredCanvasFormat();\ncontext.configure({\n  device,\n  format\n});\n\n/* 创建渲染管线 */\nconst pipeline = device.createRenderPipeline({\n  vertex: {\n    module: device.createShaderModule({\n      code: vertexShaderCode\n    }),\n    entryPoint: "main"\n  },\n  fragment: {\n    module: device.createShaderModule({\n      code: fragmentShaderCode\n    }),\n    entryPoint: "main",\n    targets: [{ format }]\n  }\n});',
                        content: "WebGPU基本用法。"
                    },
                    {
                        title: "应用场景",
                        code: '/* WebGPU适用于 */\n\n1. 3D游戏\n   - 复杂场景渲染\n   - 实时光线追踪\n\n2. 机器学习\n   - GPU加速计算\n   - 神经网络训练\n\n3. 科学计算\n   - 物理模拟\n   - 数据可视化\n\n4. 视频处理\n   - 实时滤镜\n   - 编解码\n\n/* 浏览器支持 */\nChrome 113+\nEdge 113+\nSafari 18+ (实验性)\nFirefox (开发中)',
                        content: "WebGPU的应用领域。"
                    }
                ]
            },
            source: "WebGPU API"
        },
        {
            difficulty: "medium",
            tags: ["Web Components", "组件化"],
            question: "Web Components的未来发展方向？",
            type: "multiple-choice",
            options: [
                "更好的框架集成",
                "声明式Shadow DOM",
                "CSS Module Scripts",
                "原生模板语法"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Web Components未来",
                description: "Web组件化的发展趋势。",
                sections: [
                    {
                        title: "声明式Shadow DOM",
                        code: '<!-- 声明式创建Shadow DOM -->\n<template shadowrootmode="open">\n  <style>\n    :host {\n      display: block;\n      padding: 20px;\n    }\n  </style>\n  <slot></slot>\n</template>\n\n/* 优势 */\n1. 服务端渲染友好\n2. 无需JavaScript\n3. 更快的首次渲染',
                        content: "HTML中直接声明Shadow DOM。"
                    },
                    {
                        title: "CSS Module Scripts",
                        code: '/* 导入CSS作为模块 */\nimport styles from "./styles.css" assert { type: "css" };\n\nclass MyElement extends HTMLElement {\n  constructor() {\n    super();\n    const shadow = this.attachShadow({ mode: "open" });\n    shadow.adoptedStyleSheets = [styles];\n  }\n}\n\n/* 优势 */\n1. CSS模块化\n2. 可共享样式\n3. 更好的性能',
                        content: "CSS模块导入。"
                    },
                    {
                        title: "框架集成",
                        code: '/* React中使用Web Components */\nimport "./my-component.js";\n\nfunction App() {\n  return <my-component prop="value" />;\n}\n\n/* Vue中使用 */\n<template>\n  <my-component :prop="value" />\n</template>\n\n/* 互操作性改进 */\n- 更好的属性传递\n- 事件处理\n- 生命周期集成',
                        content: "与框架更好集成。"
                    }
                ]
            },
            source: "Web Components"
        },
        {
            difficulty: "easy",
            tags: ["Progressive Enhancement", "渐进增强"],
            question: "现代Web开发的渐进增强策略？",
            type: "multiple-choice",
            options: [
                "核心功能优先",
                "特性检测",
                "优雅降级",
                "无障碍为先"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "渐进增强",
                description: "面向未来的开发策略。",
                sections: [
                    {
                        title: "核心原则",
                        code: '/* 1. HTML基础层 */\n<form action="/search" method="GET">\n  <input name="q" type="search">\n  <button>搜索</button>\n</form>\n<!-- 无JavaScript也能工作 -->\n\n/* 2. CSS增强层 */\n@supports (container-type: inline-size) {\n  .card {\n    container-type: inline-size;\n  }\n}\n\n/* 3. JavaScript交互层 */\nif ("IntersectionObserver" in window) {\n  // 使用懒加载\n} else {\n  // 直接加载\n}',
                        content: "分层增强策略。"
                    },
                    {
                        title: "特性检测",
                        code: '/* CSS特性检测 */\n@supports (display: grid) {\n  .layout {\n    display: grid;\n  }\n}\n\n@supports not (display: grid) {\n  .layout {\n    display: flex;\n  }\n}\n\n/* JavaScript特性检测 */\nif ("serviceWorker" in navigator) {\n  navigator.serviceWorker.register("/sw.js");\n}\n\nif (window.matchMedia("(prefers-color-scheme: dark)").matches) {\n  document.body.classList.add("dark-mode");\n}\n\n/* 推荐工具 */\n- Modernizr\n- @supports\n- feature queries',
                        content: "检测而非假设。"
                    },
                    {
                        title: "最佳实践",
                        code: '/* 1. 语义化HTML */\n<article>\n  <header>\n    <h1>标题</h1>\n  </header>\n  <section>内容</section>\n</article>\n\n/* 2. 渐进增强的表单 */\n<form>\n  <input type="email" required>\n  <!-- HTML5验证 -->\n  \n  <button type="submit">\n    提交\n  </button>\n</form>\n\n<script>\n// JavaScript增强验证\nif ("noValidate" in form) {\n  form.noValidate = true;\n  // 自定义验证\n}\n</script>\n\n/* 3. 无障碍优先 */\n<button aria-label="关闭对话框">\n  ×\n</button>',
                        content: "面向所有用户。"
                    }
                ]
            },
            source: "Progressive Enhancement"
        },
        {
            difficulty: "medium",
            tags: ["性能", "Core Web Vitals"],
            question: "Core Web Vitals的三个核心指标？",
            type: "multiple-choice",
            options: [
                "LCP - 最大内容绘制",
                "FID/INP - 交互延迟",
                "CLS - 累积布局偏移",
                "三者都要优化"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Web核心指标",
                description: "Google的用户体验指标。",
                sections: [
                    {
                        title: "三大指标",
                        code: '/* 1. LCP（Largest Contentful Paint）*/\n最大内容绘制\n- 目标：< 2.5秒\n- 测量：页面主要内容加载时间\n- 优化：\n  * 优化服务器响应\n  * 预加载关键资源\n  * 优化CSS\n  * 使用CDN\n\n/* 2. FID/INP（First Input Delay / Interaction to Next Paint）*/\n首次输入延迟 / 交互到下次绘制\n- 目标：< 100ms / < 200ms\n- 测量：用户交互响应时间\n- 优化：\n  * 减少JavaScript执行\n  * 代码分割\n  * Web Workers\n\n/* 3. CLS（Cumulative Layout Shift）*/\n累积布局偏移\n- 目标：< 0.1\n- 测量：视觉稳定性\n- 优化：\n  * 图片设置尺寸\n  * 避免动态插入内容\n  * 使用transform动画',
                        content: "核心性能指标。"
                    },
                    {
                        title: "测量工具",
                        code: '/* 1. Lighthouse */\nChrome DevTools > Lighthouse\n\n/* 2. Web Vitals库 */\nimport {onCLS, onFID, onLCP} from "web-vitals";\n\nonCLS(console.log);\nonFID(console.log);\nonLCP(console.log);\n\n/* 3. Performance API */\nconst observer = new PerformanceObserver((list) => {\n  for (const entry of list.getEntries()) {\n    console.log(entry);\n  }\n});\n\nobserver.observe({ entryTypes: ["largest-contentful-paint"] });\n\n/* 4. Google Search Console */\n查看真实用户数据',
                        content: "监控和测量工具。"
                    },
                    {
                        title: "优化建议",
                        code: '/* LCP优化 */\n<link rel="preload" href="hero.jpg" as="image">\n<img src="hero.jpg" width="1200" height="600" loading="eager">\n\n/* INP优化 */\n// 延迟非关键脚本\n<script src="analytics.js" defer></script>\n\n// 使用Web Worker\nconst worker = new Worker("heavy-task.js");\n\n/* CLS优化 */\n<!-- 设置图片尺寸 -->\n<img src="image.jpg" width="800" height="600" alt="...">\n\n<!-- 使用aspect-ratio -->\nimg {\n  aspect-ratio: 16 / 9;\n  width: 100%;\n  height: auto;\n}',
                        content: "实际优化方案。"
                    }
                ]
            },
            source: "Core Web Vitals"
        },
        {
            difficulty: "hard",
            tags: ["无障碍", "A11y"],
            question: "现代Web无障碍的最佳实践？",
            type: "multiple-choice",
            options: [
                "语义化HTML",
                "ARIA属性",
                "键盘导航",
                "颜色对比度"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Web无障碍",
                description: "让所有人都能使用Web。",
                sections: [
                    {
                        title: "语义化优先",
                        code: '<!-- ❌ 不好 -->\n<div onclick="submit()">提交</div>\n\n<!-- ✅ 好 -->\n<button type="submit">提交</button>\n\n<!-- ❌ 不好 -->\n<div class="header">标题</div>\n\n<!-- ✅ 好 -->\n<h1>标题</h1>\n\n/* 为什么重要 */\n1. 屏幕阅读器理解\n2. 键盘导航\n3. SEO友好\n4. 代码更清晰',
                        content: "使用正确的HTML元素。"
                    },
                    {
                        title: "ARIA增强",
                        code: '<!-- 当HTML不够用时使用ARIA -->\n\n<!-- 复杂组件 -->\n<div role="tablist">\n  <button role="tab" \n          aria-selected="true" \n          aria-controls="panel-1">\n    标签1\n  </button>\n  <button role="tab" \n          aria-selected="false"\n          aria-controls="panel-2">\n    标签2\n  </button>\n</div>\n\n<div id="panel-1" role="tabpanel" aria-labelledby="tab-1">\n  内容1\n</div>\n\n<!-- 实时更新 -->\n<div role="alert" aria-live="assertive">\n  表单提交成功！\n</div>\n\n<!-- 状态 -->\n<button aria-pressed="false">\n  切换\n</button>',
                        content: "适当使用ARIA。"
                    },
                    {
                        title: "键盘导航",
                        code: '/* 1. 焦点可见 */\n:focus-visible {\n  outline: 2px solid #007bff;\n  outline-offset: 2px;\n}\n\n/* 2. 跳过导航 */\n<a href="#main-content" class="skip-link">\n  跳到主内容\n</a>\n\n<main id="main-content">\n  <!-- 主内容 -->\n</main>\n\n/* 3. 键盘事件 */\nbutton.addEventListener("keydown", (e) => {\n  if (e.key === "Enter" || e.key === " ") {\n    e.preventDefault();\n    handleClick();\n  }\n});\n\n/* 4. tabindex */\n<div tabindex="0">可聚焦</div>\n<div tabindex="-1">不可tab但可编程聚焦</div>',
                        content: "完整的键盘支持。"
                    },
                    {
                        title: "测试工具",
                        code: '/* 1. 自动化测试 */\n- axe DevTools\n- Lighthouse\n- WAVE\n\n/* 2. 手动测试 */\n- 只用键盘导航\n- 屏幕阅读器（NVDA/JAWS/VoiceOver）\n- 缩放到200%\n- 禁用图片\n\n/* 3. 检查清单 */\n✓ 所有图片有alt\n✓ 表单有label\n✓ 颜色对比度够\n✓ 键盘可访问\n✓ 焦点可见\n✓ ARIA使用正确\n✓ 语义化HTML\n✓ 视频有字幕',
                        content: "测试和验证。"
                    }
                ]
            },
            source: "Web Accessibility"
        }
    ],
    navigation: {
        prev: { title: "邮件HTML", url: "35-email-quiz.html" },
        next: null
    }
};
