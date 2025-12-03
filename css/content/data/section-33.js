// 第33章：transform与opacity优化
window.cssContentData_Section33 = {
    section: {
        id: 33,
        title: "transform与opacity优化",
        icon: "⚡",
        topics: [
            {
                id: "why-fast",
                title: "为什么transform和opacity性能好",
                type: "principle",
                content: {
                    description: "transform和opacity是CSS中性能最好的两个动画属性，它们的改变只触发合成阶段，完全跳过了布局和绘制。",
                    mechanism: "当元素使用transform或opacity时，浏览器会将其提升为独立的合成层。该层的内容会被绘制为纹理并上传到GPU。后续transform或opacity的改变只需要GPU对纹理进行变换或混合，无需CPU参与，因此非常快速。整个过程：创建层 → 绘制到纹理 → GPU缓存 → GPU变换/混合 → 合成输出。",
                    keyPoints: [
                        "不触发布局（Layout/Reflow）：不改变元素几何信息",
                        "不触发绘制（Paint）：不需要重新绘制像素",
                        "只触发合成（Composite）：GPU直接处理",
                        "GPU硬件加速：利用GPU并行计算能力",
                        "独立图层：不影响其他元素的渲染",
                        "60fps流畅动画：计算成本极低"
                    ]
                }
            },
            {
                id: "transform-properties",
                title: "transform的高性能属性",
                type: "concept",
                content: {
                    description: "transform提供了多种变换函数，所有这些变换都只触发合成，性能极佳。",
                    keyPoints: [
                        "translate(x, y)：平移，替代left/top修改位置",
                        "translate3d(x, y, z)：3D平移，强制开启GPU加速",
                        "translateZ(0)：常用hack，创建合成层",
                        "scale(x, y)：缩放，替代width/height修改尺寸",
                        "rotate(angle)：旋转",
                        "skew(x, y)：倾斜",
                        "matrix()：矩阵变换，可组合多种变换",
                        "所有transform变换都只触发合成"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform"
                }
            },
            {
                id: "transform-vs-position",
                title: "transform vs position/size",
                type: "comparison",
                content: {
                    description: "使用transform实现位移和缩放比修改position和size属性性能好得多。",
                    items: [
                        {
                            name: "position/size属性（低性能）",
                            code: '/* 修改位置：触发布局 */\n.box {\n  position: absolute;\n  left: 100px;\n  top: 100px;\n}\n\n/* 修改尺寸：触发布局 */\n.box {\n  width: 200px;\n  height: 200px;\n}',
                            cons: [
                                "触发布局（Reflow）：重新计算几何信息",
                                "触发绘制（Repaint）：重新绘制像素",
                                "影响周围元素：可能导致整个页面重排",
                                "CPU密集：计算和绘制都在CPU上",
                                "动画卡顿：帧率低"
                            ]
                        },
                        {
                            name: "transform属性（高性能）",
                            code: '/* 修改位置：只触发合成 */\n.box {\n  transform: translate(100px, 100px);\n  /* 或3D版本 */\n  transform: translate3d(100px, 100px, 0);\n}\n\n/* 修改尺寸：只触发合成 */\n.box {\n  transform: scale(2);\n}',
                            pros: [
                                "不触发布局：不计算几何信息",
                                "不触发绘制：不重新绘制像素",
                                "独立图层：不影响其他元素",
                                "GPU加速：GPU并行处理",
                                "流畅动画：轻松达到60fps"
                            ]
                        }
                    ]
                }
            },
            {
                id: "opacity-optimization",
                title: "opacity透明度优化",
                type: "principle",
                content: {
                    description: "opacity属性控制元素透明度，也是只触发合成的高性能属性。",
                    mechanism: "当opacity小于1时，元素会被提升为合成层（如果还未提升）。GPU会对该层的纹理进行alpha混合（Alpha Blending），这是GPU的原生操作，非常快速。opacity的改变不会触发重绘，因为像素内容不变，只是改变了透明度。",
                    keyPoints: [
                        "opacity < 1 会创建合成层（某些情况下）",
                        "opacity动画只触发合成，性能极佳",
                        "替代visibility实现淡入淡出效果",
                        "配合pointer-events: none可完全隐藏元素",
                        "opacity影响整个元素包括子元素",
                        "使用rgba()只改变背景透明度，不创建图层"
                    ]
                }
            },
            {
                id: "best-practices",
                title: "动画性能最佳实践",
                type: "code-example",
                content: {
                    description: "使用transform和opacity实现高性能动画的最佳实践。",
                    examples: [
                        {
                            title: "1. 位移动画：使用translate",
                            code: '/* 不推荐：使用left/top */\n@keyframes move-bad {\n  from { left: 0; }\n  to { left: 100px; }\n}\n\n/* 推荐：使用transform */\n@keyframes move-good {\n  from { transform: translateX(0); }\n  to { transform: translateX(100px); }\n}\n\n.box {\n  animation: move-good 1s;\n}',
                            result: "transform性能是left/top的几十倍"
                        },
                        {
                            title: "2. 缩放动画：使用scale",
                            code: '/* 不推荐：修改width/height */\n@keyframes zoom-bad {\n  from { width: 100px; height: 100px; }\n  to { width: 200px; height: 200px; }\n}\n\n/* 推荐：使用scale */\n@keyframes zoom-good {\n  from { transform: scale(1); }\n  to { transform: scale(2); }\n}\n\n.box {\n  animation: zoom-good 1s;\n}',
                            result: "scale不触发布局，性能极佳"
                        },
                        {
                            title: "3. 淡入淡出：使用opacity",
                            code: '/* 不推荐：使用visibility */\n.fade-bad {\n  visibility: hidden;\n  transition: visibility 0.3s;\n}\n\n/* 推荐：使用opacity */\n.fade-good {\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity 0.3s;\n}\n\n.fade-good.show {\n  opacity: 1;\n  pointer-events: auto;\n}',
                            result: "opacity支持平滑过渡"
                        },
                        {
                            title: "4. 组合变换",
                            code: '/* 可以组合多个变换 */\n.box {\n  transform: \n    translateX(100px) \n    rotate(45deg) \n    scale(1.5);\n  transition: transform 0.3s;\n}\n\n/* 注意：变换顺序很重要 */\n/* translate → rotate → scale */\n/* 不同的顺序产生不同的效果 */',
                            result: "所有变换组合仍只触发合成"
                        },
                        {
                            title: "5. 使用will-change提前优化",
                            code: '.animated-box {\n  /* 提示浏览器即将动画 */\n  will-change: transform, opacity;\n}\n\n.animated-box:hover {\n  transform: translateY(-10px) scale(1.1);\n  opacity: 0.8;\n  transition: all 0.3s;\n}\n\n/* 动画结束后移除 */\n.animated-box.done {\n  will-change: auto;\n}',
                            result: "提前创建图层，动画更流畅"
                        }
                    ]
                }
            },
            {
                id: "transform-origin",
                title: "transform-origin变换原点",
                type: "code-example",
                content: {
                    description: "transform-origin控制变换的参考点，默认是元素中心，修改它可以创建不同的变换效果。",
                    examples: [
                        {
                            title: "1. 不同的变换原点",
                            code: '/* 默认：中心点 */\n.box {\n  transform-origin: center center; /* 或 50% 50% */\n  transform: rotate(45deg);\n}\n\n/* 左上角 */\n.box {\n  transform-origin: left top; /* 或 0 0 */\n  transform: rotate(45deg);\n}\n\n/* 右下角 */\n.box {\n  transform-origin: right bottom; /* 或 100% 100% */\n  transform: scale(2);\n}',
                            result: "不同原点产生不同的变换效果"
                        },
                        {
                            title: "2. 3D变换原点",
                            code: '/* 2D: x y */\ntransform-origin: 50% 50%;\n\n/* 3D: x y z */\ntransform-origin: 50% 50% 100px;\n\n/* 配合3D变换 */\n.box {\n  transform-origin: center center -100px;\n  transform: rotateY(45deg);\n}',
                            result: "可以设置Z轴的变换原点"
                        }
                    ]
                }
            },
            {
                id: "common-mistakes",
                title: "常见性能陷阱",
                type: "principle",
                content: {
                    description: "虽然transform和opacity性能很好，但某些使用方式仍可能导致性能问题。",
                    mechanism: "常见陷阱包括：1) 过度使用will-change导致内存占用过高；2) 在transform动画中同时修改其他触发重排的属性；3) 图层过多导致内存压力；4) 动画元素内容过于复杂导致初始绘制慢；5) 没有使用硬件加速（忘记添加translateZ(0)或will-change）。",
                    keyPoints: [
                        "不要滥用will-change，用完就移除",
                        "避免在动画中混用transform和position属性",
                        "控制图层数量，避免层爆炸",
                        "简化动画元素的内容（避免复杂渐变、阴影等）",
                        "使用translate3d而不是translate强制GPU加速",
                        "注意transform对布局的影响（不脱离文档流但视觉上移动）",
                        "opacity为0的元素仍可交互，需配合pointer-events"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "图层与合成", url: "32-layer-composite.html" },
        next: { title: "Transition与Animation原理", url: "34-transition-animation.html" }
    }
};
