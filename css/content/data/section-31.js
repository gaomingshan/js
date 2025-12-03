// 第31章：布局与绘制
window.cssContentData_Section31 = {
    section: {
        id: 31,
        title: "布局与绘制",
        icon: "🖼️",
        topics: [
            {
                id: "layout-process",
                title: "布局（Layout）过程详解",
                type: "principle",
                content: {
                    description: "布局（Layout），也称为重排（Reflow），是浏览器计算渲染树中每个节点的几何信息（位置和尺寸）的过程。",
                    mechanism: "布局过程：1) 从渲染树的根节点开始遍历；2) 计算每个节点的盒模型（content、padding、border、margin）；3) 根据CSS布局算法（正常流、浮动、定位、Flexbox、Grid等）确定元素位置；4) 处理百分比、auto等相对值；5) 生成布局树（Layout Tree），包含每个元素的精确坐标和尺寸。",
                    steps: [
                        "1. 全局布局（Global Layout）：首次渲染或窗口大小改变时触发",
                        "2. 增量布局（Incremental Layout）：只重新计算改变的部分",
                        "3. 脏标记系统（Dirty Bit System）：标记需要重新布局的节点",
                        "4. 布局队列（Layout Queue）：批量处理布局请求",
                        "5. 布局约束传播：父子元素相互影响的计算"
                    ]
                }
            },
            {
                id: "reflow-triggers",
                title: "触发重排（Reflow）的操作",
                type: "concept",
                content: {
                    description: "重排是一个昂贵的操作，了解哪些操作会触发重排有助于性能优化。",
                    keyPoints: [
                        "添加或删除可见的DOM元素",
                        "元素位置、尺寸改变（width、height、padding、margin、border等）",
                        "内容改变（文本改变或图片尺寸改变）",
                        "页面初始渲染",
                        "浏览器窗口尺寸改变（resize事件）",
                        "读取某些属性：offsetTop、scrollTop、clientTop、getComputedStyle等",
                        "修改字体、激活CSS伪类（:hover等）",
                        "计算offsetWidth、offsetHeight等布局属性"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Glossary/Reflow"
                }
            },
            {
                id: "paint-process",
                title: "绘制（Paint）过程详解",
                type: "principle",
                content: {
                    description: "绘制（Paint）是将渲染树中的每个节点转换为屏幕上的实际像素的过程，也称为栅格化（Rasterization）。",
                    mechanism: "绘制分为多个阶段：1) 背景绘制：背景色、背景图；2) 边框绘制：border样式；3) 内容绘制：文字、图片等；4) 轮廓绘制：outline（不占空间）；5) 绘制顺序遵循堆叠上下文规则。现代浏览器使用分层绘制，将页面分成多个图层（Layer），每个图层独立绘制，最后合成。",
                    keyPoints: [
                        "绘制不一定触发布局，但布局一定触发绘制",
                        "只改变颜色、背景等视觉属性会触发重绘（Repaint），不触发重排",
                        "绘制是按照堆叠上下文的顺序进行的",
                        "transform和opacity的改变可能只触发合成，不触发绘制",
                        "使用will-change可以提示浏览器创建独立图层"
                    ]
                }
            },
            {
                id: "repaint-triggers",
                title: "触发重绘（Repaint）的操作",
                type: "concept",
                content: {
                    description: "重绘是指元素外观改变但布局不变时，浏览器重新绘制元素的过程。重绘的代价比重排小，但仍需要优化。",
                    keyPoints: [
                        "颜色改变：color、background-color等",
                        "边框样式：border-style、border-color",
                        "阴影：box-shadow、text-shadow",
                        "轮廓：outline相关属性",
                        "可见性：visibility的改变（display:none会触发重排）",
                        "背景图：background-image、background-position",
                        "文本装饰：text-decoration",
                        "注意：不触发布局改变的样式才只触发重绘"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Glossary/Repaint"
                }
            },
            {
                id: "reflow-vs-repaint",
                title: "重排与重绘的关系",
                type: "comparison",
                content: {
                    description: "重排和重绘是浏览器渲染过程中的两个重要概念，理解它们的关系对性能优化至关重要。",
                    items: [
                        {
                            name: "重排（Reflow）",
                            pros: [
                                "改变元素几何属性（位置、尺寸）",
                                "影响布局，需要重新计算",
                                "代价大，影响性能",
                                "一定会触发重绘",
                                "示例：修改width、height、padding、margin、display等"
                            ]
                        },
                        {
                            name: "重绘（Repaint）",
                            pros: [
                                "只改变元素外观，不影响布局",
                                "不需要重新计算位置",
                                "代价较小",
                                "不一定触发重排",
                                "示例：修改color、background、visibility等"
                            ]
                        }
                    ]
                }
            },
            {
                id: "layout-optimization",
                title: "布局性能优化策略",
                type: "code-example",
                content: {
                    description: "通过合理的编码方式可以显著减少重排和重绘，提升页面性能。",
                    examples: [
                        {
                            title: "1. 批量修改样式",
                            code: '// 不好：多次修改样式，触发多次重排\nconst el = document.getElementById(\'box\');\nel.style.width = \'100px\';\nel.style.height = \'100px\';\nel.style.margin = \'10px\';\n\n// 好：使用cssText一次性修改\nel.style.cssText = \'width:100px;height:100px;margin:10px\';\n\n// 或使用class\nel.className = \'box-style\';',
                            result: "减少重排次数，提升性能"
                        },
                        {
                            title: "2. 离线操作DOM",
                            code: '// 不好：每次插入都触发重排\nfor (let i = 0; i < 1000; i++) {\n  const div = document.createElement(\'div\');\n  document.body.appendChild(div);\n}\n\n// 好：使用DocumentFragment\nconst fragment = document.createDocumentFragment();\nfor (let i = 0; i < 1000; i++) {\n  const div = document.createElement(\'div\');\n  fragment.appendChild(div);\n}\ndocument.body.appendChild(fragment);',
                            result: "批量操作，只触发一次重排"
                        },
                        {
                            title: "3. 避免频繁读取布局属性",
                            code: '// 不好：读写交替导致强制同步布局\nfor (let i = 0; i < elements.length; i++) {\n  const width = elements[i].offsetWidth; // 触发布局\n  elements[i].style.width = width + 10 + \'px\'; // 修改样式\n}\n\n// 好：分离读和写\nconst widths = [];\nfor (let i = 0; i < elements.length; i++) {\n  widths[i] = elements[i].offsetWidth; // 批量读取\n}\nfor (let i = 0; i < elements.length; i++) {\n  elements[i].style.width = widths[i] + 10 + \'px\'; // 批量写入\n}',
                            result: "避免强制同步布局（Forced Synchronous Layout）"
                        },
                        {
                            title: "4. 使用transform代替位置属性",
                            code: '// 不好：修改left/top触发重排\nel.style.left = \'100px\';\nel.style.top = \'100px\';\n\n// 好：使用transform只触发合成\nel.style.transform = \'translate(100px, 100px)\';',
                            result: "transform不触发重排，性能更好"
                        },
                        {
                            title: "5. 使用visibility代替display",
                            code: '// 不好：display:none触发重排\nel.style.display = \'none\';\n\n// 较好：visibility:hidden只触发重绘\nel.style.visibility = \'hidden\';\n\n// 最好：opacity配合pointer-events\nel.style.opacity = \'0\';\nel.style.pointerEvents = \'none\';',
                            result: "根据场景选择合适的隐藏方式"
                        }
                    ]
                }
            },
            {
                id: "forced-sync-layout",
                title: "强制同步布局（Layout Thrashing）",
                type: "principle",
                content: {
                    description: "强制同步布局是指在JavaScript中读取布局属性时，浏览器被迫立即执行布局计算，打断了正常的渲染流程。",
                    mechanism: "浏览器通常会批量处理布局计算以优化性能。但当JavaScript读取offsetTop、clientWidth等属性时，浏览器必须立即计算布局以返回最新值。如果在循环中交替读写样式，会导致每次读取都触发布局，造成严重的性能问题，这种现象称为Layout Thrashing（布局抖动）。",
                    keyPoints: [
                        "读取布局属性会触发强制布局：offsetTop、scrollTop、clientTop等",
                        "getComputedStyle()也会触发强制布局",
                        "getBoundingClientRect()会触发布局计算",
                        "避免读写交替，将读操作和写操作分离",
                        "使用requestAnimationFrame批量处理DOM操作",
                        "使用FastDOM等库自动优化读写顺序"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "渲染树构建", url: "30-render-tree.html" },
        next: { title: "图层与合成", url: "32-layer-composite.html" }
    }
};
