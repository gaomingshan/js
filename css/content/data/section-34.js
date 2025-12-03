// 第34章：Transition与Animation原理
window.cssContentData_Section34 = {
    section: {
        id: 34,
        title: "Transition与Animation原理",
        icon: "🔄",
        topics: [
            {
                id: "transition-basics",
                title: "CSS Transition过渡原理",
                type: "principle",
                content: {
                    description: "CSS Transition（过渡）是在CSS属性值改变时，提供平滑的动画效果，而不是瞬间改变。",
                    mechanism: "Transition工作原理：1) 监听属性变化：当指定的CSS属性值改变时触发；2) 计算插值：根据过渡函数（timing function）在起始值和结束值之间生成中间值序列；3) 逐帧应用：在每一帧（约16.67ms）应用计算出的中间值；4) 触发渲染：根据属性类型触发合成、绘制或布局。",
                    steps: [
                        "1. 属性改变：DOM样式或class改变导致CSS属性值变化",
                        "2. 触发过渡：浏览器检测到transition属性指定的属性改变",
                        "3. 计算时长：根据transition-duration确定总时长",
                        "4. 插值计算：根据transition-timing-function计算每帧的值",
                        "5. 应用动画：每帧更新属性值，触发渲染",
                        "6. 完成回调：动画结束时触发transitionend事件"
                    ]
                }
            },
            {
                id: "transition-properties",
                title: "Transition属性详解",
                type: "code-example",
                content: {
                    description: "CSS Transition由四个子属性组成，可以精确控制过渡效果。",
                    examples: [
                        {
                            title: "1. transition-property：指定过渡的属性",
                            code: '/* 单个属性 */\ntransition-property: opacity;\n\n/* 多个属性 */\ntransition-property: opacity, transform;\n\n/* 所有可过渡属性 */\ntransition-property: all;\n\n/* 不应用过渡 */\ntransition-property: none;',
                            result: "控制哪些属性应用过渡"
                        },
                        {
                            title: "2. transition-duration：过渡时长",
                            code: '/* 秒 */\ntransition-duration: 1s;\n\n/* 毫秒 */\ntransition-duration: 300ms;\n\n/* 多个属性不同时长 */\ntransition-property: opacity, transform;\ntransition-duration: 0.3s, 0.6s;',
                            result: "定义动画持续时间"
                        },
                        {
                            title: "3. transition-timing-function：缓动函数",
                            code: '/* 预定义缓动 */\ntransition-timing-function: ease; /* 默认 */\ntransition-timing-function: linear;\ntransition-timing-function: ease-in;\ntransition-timing-function: ease-out;\ntransition-timing-function: ease-in-out;\n\n/* 贝塞尔曲线 */\ntransition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n\n/* 步进函数 */\ntransition-timing-function: steps(4, end);',
                            result: "控制动画速度曲线"
                        },
                        {
                            title: "4. transition-delay：延迟时间",
                            code: '/* 延迟0.5秒后开始 */\ntransition-delay: 0.5s;\n\n/* 立即开始 */\ntransition-delay: 0s;\n\n/* 负延迟：从中间开始 */\ntransition-delay: -0.5s;',
                            result: "控制动画开始时机"
                        },
                        {
                            title: "5. transition简写",
                            code: '/* 完整语法：property duration timing-function delay */\ntransition: opacity 0.3s ease-in-out 0s;\n\n/* 简写：只指定时长 */\ntransition: 0.3s;\n\n/* 多个属性 */\ntransition: \n  opacity 0.3s ease-out,\n  transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);',
                            result: "简洁的过渡定义"
                        }
                    ]
                }
            },
            {
                id: "animation-basics",
                title: "CSS Animation动画原理",
                type: "principle",
                content: {
                    description: "CSS Animation提供了更强大的动画能力，可以定义多个关键帧，实现复杂的动画序列。",
                    mechanism: "Animation工作原理：1) 定义关键帧：使用@keyframes定义动画的起点、终点和中间状态；2) 应用动画：通过animation属性将关键帧应用到元素；3) 时间线计算：浏览器根据animation-duration将关键帧分布在时间线上；4) 插值渲染：在关键帧之间插值，生成平滑过渡；5) 循环控制：根据animation-iteration-count控制播放次数。",
                    keyPoints: [
                        "@keyframes定义动画序列，可以有多个中间状态",
                        "animation-name关联@keyframes规则",
                        "支持循环播放、反向播放、延迟等",
                        "可以监听animationstart、animationend、animationiteration事件",
                        "animation比transition更灵活，但语法更复杂",
                        "animation可以自动执行，transition需要触发"
                    ]
                }
            },
            {
                id: "keyframes",
                title: "@keyframes关键帧定义",
                type: "code-example",
                content: {
                    description: "@keyframes定义动画的各个阶段，浏览器会在关键帧之间进行插值。",
                    examples: [
                        {
                            title: "1. 基本关键帧定义",
                            code: '/* 使用from/to */\n@keyframes fade {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n/* 使用百分比 */\n@keyframes slide {\n  0% { transform: translateX(0); }\n  100% { transform: translateX(100px); }\n}',
                            result: "定义起点和终点"
                        },
                        {
                            title: "2. 多个关键帧",
                            code: '@keyframes bounce {\n  0% { transform: translateY(0); }\n  25% { transform: translateY(-30px); }\n  50% { transform: translateY(0); }\n  75% { transform: translateY(-15px); }\n  100% { transform: translateY(0); }\n}',
                            result: "实现弹跳效果"
                        },
                        {
                            title: "3. 多属性动画",
                            code: '@keyframes complex {\n  0% {\n    opacity: 0;\n    transform: translateY(-20px) scale(0.8);\n  }\n  100% {\n    opacity: 1;\n    transform: translateY(0) scale(1);\n  }\n}',
                            result: "同时动画多个属性"
                        },
                        {
                            title: "4. 相同百分比的多个关键帧",
                            code: '@keyframes pulse {\n  0%, 100% {\n    transform: scale(1);\n  }\n  50% {\n    transform: scale(1.1);\n  }\n}',
                            result: "起点和终点相同"
                        }
                    ]
                }
            },
            {
                id: "animation-properties",
                title: "Animation属性详解",
                type: "code-example",
                content: {
                    description: "CSS Animation提供了丰富的控制选项，可以实现各种动画效果。",
                    examples: [
                        {
                            title: "1. 基本动画应用",
                            code: '.box {\n  animation-name: slide;\n  animation-duration: 1s;\n  animation-timing-function: ease-in-out;\n  animation-delay: 0.5s;\n}',
                            result: "应用动画到元素"
                        },
                        {
                            title: "2. 循环控制",
                            code: '/* 播放3次 */\nanimation-iteration-count: 3;\n\n/* 无限循环 */\nanimation-iteration-count: infinite;\n\n/* 默认播放1次 */\nanimation-iteration-count: 1;',
                            result: "控制播放次数"
                        },
                        {
                            title: "3. 播放方向",
                            code: '/* 正常播放 */\nanimation-direction: normal;\n\n/* 反向播放 */\nanimation-direction: reverse;\n\n/* 交替播放 */\nanimation-direction: alternate;\n\n/* 反向交替 */\nanimation-direction: alternate-reverse;',
                            result: "控制播放方向"
                        },
                        {
                            title: "4. 填充模式",
                            code: '/* 不填充 */\nanimation-fill-mode: none;\n\n/* 保持结束状态 */\nanimation-fill-mode: forwards;\n\n/* 应用起始状态 */\nanimation-fill-mode: backwards;\n\n/* 两端都应用 */\nanimation-fill-mode: both;',
                            result: "控制动画前后的样式"
                        },
                        {
                            title: "5. 播放状态",
                            code: '/* 运行中 */\nanimation-play-state: running;\n\n/* 暂停 */\nanimation-play-state: paused;\n\n/* 鼠标悬停时暂停 */\n.box:hover {\n  animation-play-state: paused;\n}',
                            result: "控制播放/暂停"
                        },
                        {
                            title: "6. animation简写",
                            code: '/* 完整语法 */\nanimation: name duration timing-function delay iteration-count direction fill-mode play-state;\n\n/* 示例 */\nanimation: slide 1s ease-in-out 0.5s infinite alternate both running;\n\n/* 简写 */\nanimation: slide 1s infinite;',
                            result: "简洁的动画定义"
                        }
                    ]
                }
            },
            {
                id: "transition-vs-animation",
                title: "Transition与Animation对比",
                type: "comparison",
                content: {
                    description: "Transition和Animation都能实现CSS动画，但它们的使用场景和能力不同。",
                    items: [
                        {
                            name: "Transition过渡",
                            pros: [
                                "简单易用，适合简单的状态切换",
                                "需要触发器（hover、class改变等）",
                                "只能定义起点和终点",
                                "自动计算反向过渡",
                                "适合交互式动画（悬停、点击等）"
                            ],
                            cons: [
                                "不能循环播放",
                                "不能定义中间状态",
                                "不能自动执行",
                                "控制选项较少"
                            ]
                        },
                        {
                            name: "Animation动画",
                            pros: [
                                "功能强大，适合复杂动画",
                                "可以自动执行，无需触发",
                                "支持多个关键帧（中间状态）",
                                "支持循环、反向、延迟等",
                                "可以精确控制动画时间线"
                            ],
                            cons: [
                                "语法较复杂",
                                "需要定义@keyframes",
                                "反向动画需要单独定义"
                            ]
                        }
                    ]
                }
            },
            {
                id: "timing-functions",
                title: "缓动函数（Timing Function）详解",
                type: "principle",
                content: {
                    description: "缓动函数控制动画在时间轴上的速度变化，创造不同的运动感觉。",
                    mechanism: "缓动函数是一个数学函数，将时间进度（0到1）映射为动画进度（0到1）。贝塞尔曲线（Cubic Bezier）是最常用的缓动函数，通过四个控制点定义曲线形状。Steps函数则创建阶梯式动画，适合逐帧动画。",
                    keyPoints: [
                        "ease：慢速开始，加速，然后慢速结束（cubic-bezier(0.25, 0.1, 0.25, 1)）",
                        "linear：匀速运动（cubic-bezier(0, 0, 1, 1)）",
                        "ease-in：慢速开始，加速结束（cubic-bezier(0.42, 0, 1, 1)）",
                        "ease-out：快速开始，慢速结束（cubic-bezier(0, 0, 0.58, 1)）",
                        "ease-in-out：慢速开始和结束（cubic-bezier(0.42, 0, 0.58, 1)）",
                        "cubic-bezier(x1, y1, x2, y2)：自定义贝塞尔曲线",
                        "steps(n, start/end)：阶梯函数，适合逐帧动画"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "transform与opacity优化", url: "33-transform-opacity.html" },
        next: { title: "动画性能优化", url: "35-animation-performance.html" }
    }
};
