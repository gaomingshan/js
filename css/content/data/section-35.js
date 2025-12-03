// 第35章：动画性能优化
window.cssContentData_Section35 = {
    section: {
        id: 35,
        title: "动画性能优化",
        icon: "🚀",
        topics: [
            {
                id: "60fps-target",
                title: "60fps流畅动画目标",
                type: "concept",
                content: {
                    description: "流畅的动画需要达到60fps（每秒60帧），即每帧渲染时间不超过16.67ms。低于此帧率的动画会出现卡顿。",
                    keyPoints: [
                        "60fps是人眼感知流畅动画的标准",
                        "每帧预算：16.67ms（1000ms / 60 = 16.67ms）",
                        "实际可用时间约10-12ms（浏览器需要时间处理输入、合成等）",
                        "30fps以下会明显卡顿",
                        "某些高刷新率屏幕需要90fps或120fps",
                        "移动设备性能较弱，需要更多优化"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/Performance/Animation_performance_and_frame_rate"
                }
            },
            {
                id: "rendering-pipeline",
                title: "渲染管线与性能",
                type: "principle",
                content: {
                    description: "理解浏览器渲染管线有助于选择最优的动画实现方式，避免触发昂贵的渲染步骤。",
                    mechanism: "渲染管线包含五个主要步骤：JavaScript → Style → Layout → Paint → Composite。不同的CSS属性触发不同的步骤：1) transform/opacity只触发Composite（最快）；2) color/background等触发Paint+Composite；3) width/height等触发Layout+Paint+Composite（最慢）。",
                    steps: [
                        "1. JavaScript：执行JS代码，修改DOM或样式",
                        "2. Style：重新计算样式（Recalculate Style）",
                        "3. Layout：计算几何信息（Reflow/Layout）",
                        "4. Paint：绘制像素（Repaint）",
                        "5. Composite：合成图层（Composite Layers）"
                    ]
                }
            },
            {
                id: "requestAnimationFrame",
                title: "requestAnimationFrame的使用",
                type: "code-example",
                content: {
                    description: "requestAnimationFrame（RAF）是实现JavaScript动画的最佳方式，它会在浏览器重绘之前执行，保证动画流畅。",
                    examples: [
                        {
                            title: "1. 基本使用",
                            code: 'function animate() {\n  // 更新动画状态\n  element.style.transform = `translateX(${x}px)`;\n  x += 2;\n  \n  // 继续下一帧\n  if (x < 500) {\n    requestAnimationFrame(animate);\n  }\n}\n\n// 开始动画\nrequestAnimationFrame(animate);',
                            result: "与浏览器刷新率同步"
                        },
                        {
                            title: "2. 取消动画",
                            code: 'let rafId;\n\nfunction animate() {\n  element.style.transform = `translateX(${x}px)`;\n  x += 2;\n  rafId = requestAnimationFrame(animate);\n}\n\nrafId = requestAnimationFrame(animate);\n\n// 停止动画\ncancelAnimationFrame(rafId);',
                            result: "可以随时停止动画"
                        },
                        {
                            title: "3. 时间戳计算",
                            code: 'let startTime;\n\nfunction animate(timestamp) {\n  if (!startTime) startTime = timestamp;\n  const progress = timestamp - startTime;\n  \n  // 基于时间的动画，不依赖帧率\n  const x = Math.min(progress / 10, 500);\n  element.style.transform = `translateX(${x}px)`;\n  \n  if (progress < 5000) {\n    requestAnimationFrame(animate);\n  }\n}\n\nrequestAnimationFrame(animate);',
                            result: "时间基准更精确"
                        },
                        {
                            title: "4. RAF vs setTimeout",
                            code: '/* 不推荐：setTimeout */\nfunction animateBad() {\n  element.style.left = x + \'px\';\n  x += 2;\n  setTimeout(animateBad, 16);\n}\n\n/* 推荐：requestAnimationFrame */\nfunction animateGood() {\n  element.style.transform = `translateX(${x}px)`;\n  x += 2;\n  requestAnimationFrame(animateGood);\n}',
                            result: "RAF与屏幕刷新率同步，性能更好"
                        }
                    ]
                }
            },
            {
                id: "will-change-optimization",
                title: "will-change深度优化",
                type: "code-example",
                content: {
                    description: "合理使用will-change可以显著提升动画性能，但需要注意使用时机和清理。",
                    examples: [
                        {
                            title: "1. 交互前添加will-change",
                            code: 'const button = document.querySelector(\'.button\');\n\n// 鼠标进入时添加\nbutton.addEventListener(\'mouseenter\', () => {\n  button.style.willChange = \'transform, opacity\';\n});\n\n// 动画结束后移除\nbutton.addEventListener(\'transitionend\', () => {\n  button.style.willChange = \'auto\';\n});',
                            result: "提前优化，及时清理"
                        },
                        {
                            title: "2. 滚动优化",
                            code: '// 不要这样做：给所有元素添加\n* { will-change: transform; } /* 错误 */\n\n// 应该：只给需要动画的元素添加\n.scroll-item {\n  will-change: transform;\n}\n\n// 更好：动态添加和移除\nconst observer = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      entry.target.style.willChange = \'transform\';\n    } else {\n      entry.target.style.willChange = \'auto\';\n    }\n  });\n});',
                            result: "避免过度使用"
                        }
                    ]
                }
            },
            {
                id: "animation-best-practices",
                title: "动画性能最佳实践",
                type: "code-example",
                content: {
                    description: "遵循这些最佳实践可以确保动画流畅运行。",
                    examples: [
                        {
                            title: "1. 优先使用transform和opacity",
                            code: '/* 不好：触发Layout */\n@keyframes move {\n  to { left: 100px; width: 200px; }\n}\n\n/* 好：只触发Composite */\n@keyframes move {\n  to { \n    transform: translateX(100px) scaleX(2);\n  }\n}',
                            result: "避免Layout和Paint"
                        },
                        {
                            title: "2. 减少动画元素的复杂度",
                            code: '/* 不好：复杂内容动画 */\n.complex {\n  background: linear-gradient(...);\n  box-shadow: 0 10px 50px rgba(...);\n  animation: move 1s;\n}\n\n/* 好：简化动画元素 */\n.simple {\n  background: #fff;\n  animation: move 1s;\n}\n\n/* 或使用伪元素装饰 */\n.simple::before {\n  background: linear-gradient(...);\n  box-shadow: 0 10px 50px rgba(...);\n}',
                            result: "减少绘制时间"
                        },
                        {
                            title: "3. 使用contain限制影响范围",
                            code: '.animated-widget {\n  /* 隔离布局、样式、绘制 */\n  contain: layout style paint;\n  will-change: transform;\n}\n\n/* 或使用strict */\n.animated-widget {\n  contain: strict;\n}',
                            result: "防止动画影响其他元素"
                        },
                        {
                            title: "4. 避免同时动画大量元素",
                            code: '// 不好：同时动画1000个元素\nitems.forEach(item => {\n  item.style.animation = \'fade 1s\';\n});\n\n// 好：分批动画，使用延迟\nitems.forEach((item, i) => {\n  item.style.animation = `fade 1s ${i * 0.05}s`;\n});\n\n// 或使用虚拟列表，只动画可见元素',
                            result: "控制并发动画数量"
                        }
                    ]
                }
            },
            {
                id: "flip-technique",
                title: "FLIP动画技术",
                type: "principle",
                content: {
                    description: "FLIP是一种将布局改变转换为高性能transform动画的技术，可以实现流畅的复杂动画。",
                    mechanism: "FLIP代表First, Last, Invert, Play：1) First：记录元素初始状态（位置、尺寸）；2) Last：触发改变，记录最终状态；3) Invert：用transform将元素从最终状态倒退到初始状态；4) Play：移除transform，让元素以动画方式过渡到最终状态。这样就把布局改变转换成了transform动画。",
                    keyPoints: [
                        "FLIP可以将任何布局改变转换为transform动画",
                        "适合实现元素位置交换、大小改变等复杂动画",
                        "核心思想：用transform模拟布局改变",
                        "需要JavaScript配合实现",
                        "库：FLIP.js、React-FLIP-Move等",
                        "原理：transform性能远高于修改width/height/position"
                    ]
                }
            },
            {
                id: "performance-monitoring",
                title: "动画性能监控",
                type: "code-example",
                content: {
                    description: "使用浏览器工具和API监控动画性能，及时发现和解决问题。",
                    examples: [
                        {
                            title: "1. Chrome DevTools Performance",
                            code: '// 1. 打开DevTools → Performance\n// 2. 点击Record，执行动画\n// 3. 停止录制，查看火焰图\n// 4. 查看FPS、布局、绘制时间\n// 5. 找出性能瓶颈\n\n// 关注指标：\n// - FPS：应保持60fps\n// - Scripting：JS执行时间\n// - Rendering：布局+绘制时间\n// - Painting：绘制时间',
                            result: "可视化分析性能"
                        },
                        {
                            title: "2. FPS Meter",
                            code: '// 使用stats.js库\nconst stats = new Stats();\nstats.showPanel(0); // 0: fps, 1: ms, 2: mb\ndocument.body.appendChild(stats.dom);\n\nfunction animate() {\n  stats.begin();\n  // 你的动画代码\n  stats.end();\n  requestAnimationFrame(animate);\n}\n\nrequestAnimationFrame(animate);',
                            result: "实时显示FPS"
                        },
                        {
                            title: "3. Performance API",
                            code: '// 测量动画耗时\nconst start = performance.now();\n\n// 执行动画\nfor (let i = 0; i < 1000; i++) {\n  element.style.transform = `translateX(${i}px)`;\n}\n\nconst end = performance.now();\nconsole.log(`动画耗时: ${end - start}ms`);\n\n// 使用PerformanceObserver监控长任务\nconst observer = new PerformanceObserver((list) => {\n  for (const entry of list.getEntries()) {\n    if (entry.duration > 50) {\n      console.warn(\'Long task detected:\', entry);\n    }\n  }\n});\nobserver.observe({ entryTypes: [\'longtask\'] });',
                            result: "量化性能指标"
                        }
                    ]
                }
            },
            {
                id: "mobile-optimization",
                title: "移动端动画优化",
                type: "principle",
                content: {
                    description: "移动设备性能较弱，需要更激进的优化策略。",
                    mechanism: "移动端优化要点：1) CPU和GPU性能都较弱；2) 内存有限，避免创建过多图层；3) 电池续航是考虑因素，避免持续动画；4) 触摸交互延迟高，需要即时反馈；5) 屏幕尺寸小，简化动画效果。",
                    keyPoints: [
                        "严格使用transform和opacity，避免其他属性",
                        "减少动画元素数量和复杂度",
                        "避免box-shadow、gradient等昂贵效果",
                        "使用touchstart代替click减少延迟",
                        "合理使用will-change，及时清理",
                        "考虑使用prefers-reduced-motion媒体查询",
                        "测试低端设备性能",
                        "使用throttle/debounce限制动画频率"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "Transition与Animation原理", url: "34-transition-animation.html" },
        next: { title: "2D变换", url: "36-2d-transform.html" }
    }
};
