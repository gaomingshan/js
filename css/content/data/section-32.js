// 第32章：图层与合成
window.cssContentData_Section32 = {
    section: {
        id: 32,
        title: "图层与合成",
        icon: "🎞️",
        topics: [
            {
                id: "compositing-intro",
                title: "合成（Compositing）概念",
                type: "concept",
                content: {
                    description: "合成是浏览器将页面分成多个图层（Layer），分别绘制后再组合成最终页面的技术。这是现代浏览器实现高性能渲染的关键。",
                    keyPoints: [
                        "页面被分割成多个图层（Layer/Compositor Layer）",
                        "每个图层独立绘制，可以并行处理",
                        "图层的合成由GPU加速完成",
                        "某些CSS属性只触发合成，不触发布局和绘制",
                        "合成是渲染流程的最后一步",
                        "理解图层是优化动画性能的关键"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/Performance/How_browsers_work#合成"
                }
            },
            {
                id: "layer-creation",
                title: "图层创建条件",
                type: "principle",
                content: {
                    description: "浏览器会根据特定条件自动将元素提升为独立的合成层，了解这些条件有助于控制图层的创建。",
                    mechanism: "浏览器会为以下情况创建合成层：1) 根元素（html）；2) position:fixed/sticky；3) 3D transform或perspective；4) will-change指定的属性；5) video、canvas、iframe等元素；6) 有CSS滤镜的元素；7) 有transform动画、opacity动画的元素；8) 需要裁剪的元素（overflow且有子元素）。",
                    keyPoints: [
                        "3D变换：transform: translateZ(0) 或 translate3d(0,0,0)",
                        "will-change属性：will-change: transform, opacity",
                        "video、canvas、iframe元素会自动创建图层",
                        "CSS滤镜：filter属性",
                        "position: fixed（某些浏览器）",
                        "opacity < 1 且有动画",
                        "z-index不为auto的定位元素（在某些情况下）"
                    ]
                }
            },
            {
                id: "compositor-only-properties",
                title: "仅触发合成的属性",
                type: "concept",
                content: {
                    description: "某些CSS属性的改变只会触发合成阶段，不需要重新布局和绘制，因此性能最好。",
                    keyPoints: [
                        "transform：平移、旋转、缩放、倾斜（2D和3D）",
                        "opacity：透明度改变",
                        "filter：某些滤镜效果（在独立图层上）",
                        "这些属性的动画非常流畅，可达60fps",
                        "推荐在动画中优先使用这些属性",
                        "配合will-change可进一步优化"
                    ],
                    mdn: "https://csstriggers.com/"
                }
            },
            {
                id: "gpu-acceleration",
                title: "GPU加速原理",
                type: "principle",
                content: {
                    description: "GPU加速是指将某些图形处理任务从CPU转移到GPU，利用GPU的并行计算能力加速渲染。",
                    mechanism: "当元素被提升为合成层后，该层的内容会作为纹理（Texture）上传到GPU。后续该层的transform或opacity改变只需要GPU重新合成纹理，无需CPU参与布局和绘制。GPU擅长并行处理大量简单运算，如矩阵变换、透明度混合等，比CPU快得多。",
                    steps: [
                        "1. 创建合成层：满足特定条件的元素被提升",
                        "2. 绘制到纹理：层的内容绘制成位图，上传到GPU",
                        "3. 纹理缓存：GPU缓存纹理，避免重复绘制",
                        "4. 合成变换：GPU对纹理进行transform、opacity等操作",
                        "5. 最终合成：GPU将所有层合成为最终画面"
                    ]
                }
            },
            {
                id: "will-change",
                title: "will-change属性详解",
                type: "code-example",
                content: {
                    description: "will-change是CSS的性能优化提示，告诉浏览器哪些属性即将改变，让浏览器提前做优化准备。",
                    examples: [
                        {
                            title: "1. 基本用法",
                            code: '.box {\n  /* 提示浏览器transform将改变 */\n  will-change: transform;\n}\n\n.box:hover {\n  transform: scale(1.2);\n}',
                            result: "浏览器会提前创建合成层"
                        },
                        {
                            title: "2. 指定多个属性",
                            code: '.box {\n  will-change: transform, opacity;\n}\n\n/* 或使用auto */\n.box {\n  will-change: auto; /* 让浏览器自动优化 */\n}',
                            result: "可以同时优化多个属性"
                        },
                        {
                            title: "3. 动态添加和移除",
                            code: '// 动画开始前添加\nelement.style.willChange = \'transform\';\n\n// 执行动画\nelement.style.transform = \'translateX(100px)\';\n\n// 动画结束后移除\nelement.addEventListener(\'transitionend\', () => {\n  element.style.willChange = \'auto\';\n});',
                            result: "避免长期占用资源"
                        },
                        {
                            title: "4. 不要滥用",
                            code: '/* 不好：过度使用 */\n* {\n  will-change: transform, opacity;\n}\n\n/* 好：只对需要优化的元素使用 */\n.animated-box {\n  will-change: transform;\n}',
                            result: "过度使用会消耗内存，降低性能"
                        }
                    ]
                }
            },
            {
                id: "layer-problems",
                title: "图层相关问题与优化",
                type: "principle",
                content: {
                    description: "虽然图层可以提升性能，但不当使用也会带来问题。",
                    mechanism: "每个合成层都会占用内存（纹理缓存），创建过多图层会导致内存压力。层爆炸（Layer Explosion）是指因为层叠上下文规则，一个元素被提升后，它上面的所有元素也被迫提升，导致图层数量激增。",
                    keyPoints: [
                        "层爆炸：一个元素提升导致大量其他元素也提升",
                        "内存占用：每个层都需要内存存储纹理",
                        "绘制时间：初始绘制层到纹理需要时间",
                        "不要过度使用will-change和transform: translateZ(0)",
                        "使用Chrome DevTools的Layers面板分析图层",
                        "合理使用z-index控制层叠顺序",
                        "必要时使用contain属性限制影响范围"
                    ]
                }
            },
            {
                id: "compositing-optimization",
                title: "合成优化最佳实践",
                type: "code-example",
                content: {
                    description: "掌握合成优化技巧，可以显著提升页面性能，特别是动画性能。",
                    examples: [
                        {
                            title: "1. 使用transform代替位置属性",
                            code: '/* 不好：触发布局 */\n.box {\n  position: absolute;\n  left: 0;\n  animation: move 1s;\n}\n@keyframes move {\n  to { left: 100px; }\n}\n\n/* 好：只触发合成 */\n.box {\n  transform: translateX(0);\n  animation: move 1s;\n}\n@keyframes move {\n  to { transform: translateX(100px); }\n}',
                            result: "transform动画性能更好"
                        },
                        {
                            title: "2. 降低层的复杂度",
                            code: '/* 简化层内容，减少绘制时间 */\n.layer {\n  will-change: transform;\n  /* 避免复杂的渐变、阴影等 */\n  background: #fff; /* 简单背景 */\n  /* 而不是复杂的渐变 */\n  /* background: linear-gradient(...); */\n}',
                            result: "减少层的初始绘制时间"
                        },
                        {
                            title: "3. 使用contain属性",
                            code: '.widget {\n  /* 限制布局、样式、绘制的影响范围 */\n  contain: layout style paint;\n  /* 或使用content包含所有 */\n  contain: content;\n}',
                            result: "隔离渲染，提升性能"
                        },
                        {
                            title: "4. 分析图层状态",
                            code: '// 使用Chrome DevTools:\n// 1. 打开DevTools → More tools → Layers\n// 2. 查看图层树和内存占用\n// 3. 分析哪些元素创建了图层\n// 4. 检查是否有不必要的图层\n\n// 或使用Rendering面板:\n// More tools → Rendering → Layer borders',
                            result: "可视化分析图层问题"
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "布局与绘制", url: "31-layout-paint.html" },
        next: { title: "transform与opacity优化", url: "33-transform-opacity.html" }
    }
};
