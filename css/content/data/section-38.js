// 第38章：Filter滤镜
window.cssContentData_Section38 = {
    section: {
        id: 38,
        title: "Filter滤镜",
        icon: "🌟",
        topics: [
            {
                id: "filter-intro",
                title: "CSS Filter 滤镜概述",
                type: "concept",
                content: {
                    description: "CSS Filter允许对元素应用图形效果，如模糊、颜色调整、亮度等，类似Photoshop的滤镜功能。",
                    keyPoints: [
                        "提供10+种内置滤镜函数",
                        "可以组合多个滤镜效果",
                        "支持动画和过渡",
                        "backdrop-filter可以对背景应用滤镜",
                        "滤镜会创建新的堆叠上下文",
                        "可能影响性能，需谨慎使用"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter"
                }
            },
            {
                id: "blur-filter",
                title: "blur() 模糊滤镜",
                type: "code-example",
                content: {
                    description: "blur()对元素应用高斯模糊效果，值越大越模糊。",
                    examples: [
                        {
                            title: "1. 基本模糊",
                            code: '/* 模糊5像素 */\n.blurred {\n  filter: blur(5px);\n}\n\n/* 强烈模糊 */\n.heavily-blurred {\n  filter: blur(20px);\n}\n\n/* 无模糊 */\n.sharp {\n  filter: blur(0);\n}',
                            result: "值越大越模糊，0表示无模糊"
                        },
                        {
                            title: "2. 悬停模糊效果",
                            code: '.image {\n  filter: blur(0);\n  transition: filter 0.3s;\n}\n\n.image:hover {\n  filter: blur(5px);\n}\n\n/* 反向：模糊变清晰 */\n.blurry-image {\n  filter: blur(10px);\n}\n\n.blurry-image:hover {\n  filter: blur(0);\n}',
                            result: "创建交互式模糊效果"
                        },
                        {
                            title: "3. 毛玻璃loading效果",
                            code: '.loading-overlay {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(255, 255, 255, 0.8);\n  backdrop-filter: blur(10px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}',
                            result: "backdrop-filter对背景模糊"
                        }
                    ]
                }
            },
            {
                id: "brightness-contrast",
                title: "brightness() 和 contrast() 滤镜",
                type: "code-example",
                content: {
                    description: "brightness()调整亮度，contrast()调整对比度，都使用百分比值。",
                    examples: [
                        {
                            title: "1. 亮度调整",
                            code: '/* 变暗 */\n.darker {\n  filter: brightness(50%);\n}\n\n/* 正常 */\n.normal {\n  filter: brightness(100%);\n}\n\n/* 变亮 */\n.brighter {\n  filter: brightness(150%);\n}',
                            result: "100%是原始亮度，0%是全黑"
                        },
                        {
                            title: "2. 对比度调整",
                            code: '/* 降低对比度 */\n.low-contrast {\n  filter: contrast(50%);\n}\n\n/* 增强对比度 */\n.high-contrast {\n  filter: contrast(200%);\n}',
                            result: "100%是原始对比度"
                        },
                        {
                            title: "3. 组合使用",
                            code: '/* 暗黑模式效果 */\n.dark-mode-image {\n  filter: brightness(0.8) contrast(1.2);\n}\n\n/* 悬停增亮 */\n.thumbnail {\n  filter: brightness(0.9);\n  transition: filter 0.3s;\n}\n\n.thumbnail:hover {\n  filter: brightness(1.1) contrast(1.1);\n}',
                            result: "创建视觉增强效果"
                        }
                    ]
                }
            },
            {
                id: "grayscale-sepia",
                title: "grayscale() 和 sepia() 色彩滤镜",
                type: "code-example",
                content: {
                    description: "grayscale()转换为灰度图，sepia()添加褐色调复古效果。",
                    examples: [
                        {
                            title: "1. 灰度滤镜",
                            code: '/* 完全灰度 */\n.grayscale {\n  filter: grayscale(100%);\n}\n\n/* 部分灰度 */\n.partial-gray {\n  filter: grayscale(50%);\n}\n\n/* 悬停恢复颜色 */\n.image {\n  filter: grayscale(100%);\n  transition: filter 0.3s;\n}\n\n.image:hover {\n  filter: grayscale(0);\n}',
                            result: "0%是彩色，100%是全灰度"
                        },
                        {
                            title: "2. 复古滤镜",
                            code: '/* 复古照片效果 */\n.vintage {\n  filter: sepia(100%);\n}\n\n/* 组合效果 */\n.old-photo {\n  filter: \n    sepia(80%)\n    brightness(0.9)\n    contrast(1.2);\n}',
                            result: "创造怀旧照片效果"
                        }
                    ]
                }
            },
            {
                id: "saturate-hue",
                title: "saturate() 和 hue-rotate() 滤镜",
                type: "code-example",
                content: {
                    description: "saturate()调整饱和度，hue-rotate()旋转色相。",
                    examples: [
                        {
                            title: "1. 饱和度调整",
                            code: '/* 降低饱和度 */\n.desaturated {\n  filter: saturate(50%);\n}\n\n/* 增强饱和度 */\n.vibrant {\n  filter: saturate(200%);\n}\n\n/* 完全去饱和（等同于grayscale(100%)）*/\n.no-color {\n  filter: saturate(0);\n}',
                            result: "100%是原始饱和度"
                        },
                        {
                            title: "2. 色相旋转",
                            code: '/* 旋转色相 */\n.hue-shift {\n  filter: hue-rotate(90deg);\n}\n\n/* 完整旋转 */\n.hue-shift-full {\n  filter: hue-rotate(360deg); /* 回到原色 */\n}\n\n/* 色相动画 */\n@keyframes hue-animation {\n  to { filter: hue-rotate(360deg); }\n}\n\n.rainbow {\n  animation: hue-animation 3s linear infinite;\n}',
                            result: "创建彩虹循环效果"
                        }
                    ]
                }
            },
            {
                id: "invert-opacity",
                title: "invert() 和 opacity() 滤镜",
                type: "code-example",
                content: {
                    description: "invert()反转颜色，opacity()调整透明度（类似opacity属性）。",
                    examples: [
                        {
                            title: "1. 颜色反转",
                            code: '/* 完全反转 */\n.inverted {\n  filter: invert(100%);\n}\n\n/* 部分反转 */\n.partial-invert {\n  filter: invert(50%);\n}\n\n/* 暗黑模式 */\n.dark-mode {\n  filter: invert(100%) hue-rotate(180deg);\n}',
                            result: "创建负片效果或暗黑模式"
                        },
                        {
                            title: "2. 透明度滤镜",
                            code: '/* 使用filter的opacity */\n.faded {\n  filter: opacity(50%);\n}\n\n/* 等同于opacity属性，但创建新堆叠上下文 */\n.faded-alt {\n  opacity: 0.5;\n}',
                            result: "filter: opacity()会创建新图层"
                        }
                    ]
                }
            },
            {
                id: "drop-shadow",
                title: "drop-shadow() 投影滤镜",
                type: "code-example",
                content: {
                    description: "drop-shadow()创建投影效果，与box-shadow不同，它跟随元素的实际形状。",
                    examples: [
                        {
                            title: "1. 基本投影",
                            code: '/* drop-shadow(offset-x offset-y blur-radius color) */\n.shadow {\n  filter: drop-shadow(5px 5px 10px rgba(0,0,0,0.3));\n}\n\n/* 多重投影 */\n.multi-shadow {\n  filter: \n    drop-shadow(2px 2px 4px rgba(0,0,0,0.2))\n    drop-shadow(-2px -2px 4px rgba(255,255,255,0.5));\n}',
                            result: "跟随透明区域形状"
                        },
                        {
                            title: "2. drop-shadow vs box-shadow",
                            code: '/* box-shadow：矩形阴影 */\n.box {\n  border-radius: 50%;\n  box-shadow: 5px 5px 10px rgba(0,0,0,0.5);\n  /* 阴影是矩形的 */\n}\n\n/* drop-shadow：跟随形状 */\n.circle {\n  border-radius: 50%;\n  filter: drop-shadow(5px 5px 10px rgba(0,0,0,0.5));\n  /* 阴影是圆形的 */\n}\n\n/* 对于PNG图片的透明区域 */\n.png-image {\n  /* box-shadow会给整个矩形区域加阴影 */\n  /* drop-shadow只给不透明部分加阴影 */\n  filter: drop-shadow(3px 3px 5px rgba(0,0,0,0.5));\n}',
                            result: "drop-shadow更适合非矩形元素"
                        }
                    ]
                }
            },
            {
                id: "backdrop-filter",
                title: "backdrop-filter 背景滤镜",
                type: "code-example",
                content: {
                    description: "backdrop-filter对元素背后的区域应用滤镜效果，常用于创建毛玻璃效果。",
                    examples: [
                        {
                            title: "1. 毛玻璃效果",
                            code: '/* 模糊背景 */\n.glass-card {\n  background: rgba(255, 255, 255, 0.2);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n}\n\n/* 增强效果 */\n.glass-card-enhanced {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: \n    blur(10px)\n    saturate(180%)\n    brightness(1.1);\n}',
                            result: "创建苹果风格的毛玻璃UI"
                        },
                        {
                            title: "2. 模态对话框背景",
                            code: '.modal-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.3);\n  backdrop-filter: blur(5px);\n}\n\n.modal {\n  background: rgba(255, 255, 255, 0.9);\n  backdrop-filter: blur(20px);\n  border-radius: 12px;\n}',
                            result: "模糊背景突出前景内容"
                        },
                        {
                            title: "3. 浏览器兼容性回退",
                            code: '.glass {\n  background: rgba(255, 255, 255, 0.8); /* 回退 */\n  backdrop-filter: blur(10px);\n}\n\n/* 或使用@supports */\n.glass {\n  background: rgba(255, 255, 255, 0.8);\n}\n\n@supports (backdrop-filter: blur(10px)) {\n  .glass {\n    background: rgba(255, 255, 255, 0.2);\n    backdrop-filter: blur(10px);\n  }\n}',
                            result: "提供优雅降级方案"
                        }
                    ]
                }
            },
            {
                id: "filter-combination",
                title: "滤镜组合与顺序",
                type: "code-example",
                content: {
                    description: "可以组合多个滤镜，应用顺序会影响最终效果。",
                    examples: [
                        {
                            title: "1. 组合多个滤镜",
                            code: '/* 复杂效果组合 */\n.enhanced-image {\n  filter: \n    contrast(110%)\n    brightness(1.05)\n    saturate(120%)\n    blur(0.5px);\n}\n\n/* Instagram风格滤镜 */\n.instagram-filter {\n  filter:\n    sepia(30%)\n    saturate(150%)\n    brightness(1.1)\n    contrast(1.1);\n}',
                            result: "创建复杂视觉效果"
                        },
                        {
                            title: "2. 顺序的影响",
                            code: '/* 先模糊后调色 */\n.effect-1 {\n  filter: blur(5px) grayscale(100%);\n}\n\n/* 先调色后模糊 */\n.effect-2 {\n  filter: grayscale(100%) blur(5px);\n}\n\n/* 结果可能略有不同 */\n/* 通常顺序：blur → color adjustments → shadows */\n.recommended-order {\n  filter:\n    blur(2px)\n    brightness(1.1)\n    saturate(120%)\n    drop-shadow(2px 2px 4px rgba(0,0,0,0.3));\n}',
                            result: "合理的顺序让效果更自然"
                        }
                    ]
                }
            },
            {
                id: "filter-performance",
                title: "滤镜性能考虑",
                type: "principle",
                content: {
                    description: "滤镜功能强大但可能影响性能，需要合理使用。",
                    mechanism: "滤镜会创建新的图层和堆叠上下文，某些滤镜（如blur）计算成本较高。backdrop-filter更是需要实时计算背景，性能开销大。在低端设备上大量使用滤镜可能导致卡顿。",
                    keyPoints: [
                        "滤镜会创建新的堆叠上下文",
                        "blur()和backdrop-filter性能开销较大",
                        "避免在大面积元素上使用复杂滤镜",
                        "滤镜动画可能导致性能问题",
                        "移动端需要更谨慎使用",
                        "可以使用will-change提前优化",
                        "考虑使用CSS变量动态控制滤镜强度",
                        "提供禁用滤镜的选项（无障碍考虑）"
                    ]
                }
            },
            {
                id: "filter-best-practices",
                title: "滤镜使用最佳实践",
                type: "code-example",
                content: {
                    description: "遵循最佳实践，创建高质量的滤镜效果。",
                    examples: [
                        {
                            title: "1. 使用CSS变量控制",
                            code: ':root {\n  --blur-amount: 0px;\n  --brightness: 100%;\n}\n\n.filtered {\n  filter: \n    blur(var(--blur-amount))\n    brightness(var(--brightness));\n  transition: filter 0.3s;\n}\n\n/* JavaScript动态调整 */\nelement.style.setProperty(\'--blur-amount\', \'10px\');',
                            result: "便于动态控制滤镜"
                        },
                        {
                            title: "2. 性能优化",
                            code: '/* 提前优化 */\n.animated-filter {\n  will-change: filter;\n}\n\n.animated-filter.active {\n  filter: blur(10px);\n}\n\n/* 动画结束后清理 */\n.animated-filter.done {\n  will-change: auto;\n}',
                            result: "提升动画性能"
                        },
                        {
                            title: "3. 渐进增强",
                            code: '/* 基础样式 */\n.card {\n  background: rgba(255, 255, 255, 0.9);\n  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n}\n\n/* 支持backdrop-filter时增强 */\n@supports (backdrop-filter: blur(10px)) {\n  .card {\n    background: rgba(255, 255, 255, 0.7);\n    backdrop-filter: blur(10px);\n  }\n}',
                            result: "确保向后兼容"
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "3D变换", url: "37-3d-transform.html" },
        next: { title: "混合模式", url: "39-blend-modes.html" }
    }
};
