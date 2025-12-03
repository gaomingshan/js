// 第37章：3D变换
window.cssContentData_Section37 = {
    section: {
        id: 37,
        title: "3D变换",
        icon: "🎭",
        topics: [
            {
                id: "3d-transform-intro",
                title: "3D变换概述",
                type: "concept",
                content: {
                    description: "CSS 3D变换在2D变换的基础上增加了Z轴，可以在三维空间中操作元素，创造立体效果。",
                    keyPoints: [
                        "在X、Y轴基础上增加了Z轴（垂直屏幕方向）",
                        "需要设置perspective透视距离才能看到3D效果",
                        "transform-style决定子元素是否保留3D空间",
                        "backface-visibility控制元素背面是否可见",
                        "3D变换同样只触发合成，性能优秀",
                        "可以创建翻转、旋转、立方体等复杂3D效果"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform"
                }
            },
            {
                id: "perspective",
                title: "perspective 透视距离",
                type: "principle",
                content: {
                    description: "perspective定义观察者与Z=0平面的距离，是实现3D效果的关键属性。",
                    mechanism: "perspective模拟人眼观察3D物体的效果。值越小，透视效果越强烈（近大远小越明显）；值越大，透视效果越平缓。perspective可以作为属性应用在父元素上，也可以作为transform函数应用在元素本身。两者的透视中心不同。",
                    keyPoints: [
                        "perspective值通常在600px-1200px之间",
                        "值越小，3D效果越夸张",
                        "值越大，3D效果越平缓",
                        "perspective: none 关闭透视效果",
                        "perspective作为属性时影响所有子元素",
                        "perspective()函数只影响当前元素"
                    ]
                }
            },
            {
                id: "perspective-usage",
                title: "perspective 使用方式",
                type: "code-example",
                content: {
                    description: "perspective有两种使用方式，作为属性或作为transform函数，效果略有不同。",
                    examples: [
                        {
                            title: "1. 作为属性（推荐）",
                            code: '/* 应用在父元素上 */\n.container {\n  perspective: 1000px;\n  perspective-origin: center center;\n}\n\n.box {\n  transform: rotateY(45deg);\n}\n\n/* 多个子元素共享透视点 */\n.container .box1 { transform: rotateY(30deg); }\n.container .box2 { transform: rotateY(-30deg); }',
                            result: "所有子元素共享透视中心"
                        },
                        {
                            title: "2. 作为transform函数",
                            code: '/* 直接应用在元素上 */\n.box {\n  transform: perspective(1000px) rotateY(45deg);\n}\n\n/* 注意：perspective必须写在最前面 */\n.box {\n  transform: \n    perspective(1000px)\n    rotateY(45deg)\n    translateZ(100px);\n}',
                            result: "每个元素有独立的透视中心"
                        },
                        {
                            title: "3. perspective-origin",
                            code: '/* 改变透视中心点 */\n.container {\n  perspective: 1000px;\n  perspective-origin: left top; /* 从左上角观察 */\n}\n\n/* 使用百分比 */\n.container {\n  perspective: 1000px;\n  perspective-origin: 25% 75%;\n}',
                            result: "改变观察角度"
                        }
                    ]
                }
            },
            {
                id: "3d-rotate",
                title: "3D旋转变换",
                type: "code-example",
                content: {
                    description: "3D旋转可以绕X轴、Y轴或Z轴旋转，或绕任意向量旋转。",
                    examples: [
                        {
                            title: "1. 三轴旋转",
                            code: '/* 绕X轴旋转（上下翻转）*/\n.box {\n  transform: rotateX(45deg);\n}\n\n/* 绕Y轴旋转（左右翻转）*/\n.box {\n  transform: rotateY(45deg);\n}\n\n/* 绕Z轴旋转（平面旋转，等同于rotate）*/\n.box {\n  transform: rotateZ(45deg);\n}',
                            result: "分别控制三个轴向的旋转"
                        },
                        {
                            title: "2. 组合旋转",
                            code: '/* rotate3d(x, y, z, angle) */\n.box {\n  /* 绕向量(1, 1, 0)旋转45度 */\n  transform: rotate3d(1, 1, 0, 45deg);\n}\n\n/* 组合多个旋转 */\n.box {\n  transform: \n    rotateX(30deg)\n    rotateY(45deg)\n    rotateZ(15deg);\n}',
                            result: "创建复杂的3D旋转效果"
                        },
                        {
                            title: "3. 卡片翻转效果",
                            code: '.card {\n  transition: transform 0.6s;\n  transform-style: preserve-3d;\n}\n\n.card:hover {\n  transform: rotateY(180deg);\n}\n\n/* 卡片正反面 */\n.card-front,\n.card-back {\n  backface-visibility: hidden;\n}\n\n.card-back {\n  transform: rotateY(180deg);\n}',
                            result: "经典的卡片翻转动画"
                        }
                    ]
                }
            },
            {
                id: "3d-translate",
                title: "3D平移变换",
                type: "code-example",
                content: {
                    description: "3D平移在2D平移的基础上增加了Z轴，可以让元素在三维空间中移动。",
                    examples: [
                        {
                            title: "1. translateZ",
                            code: '/* Z轴平移（靠近或远离观察者）*/\n.box {\n  transform: translateZ(100px); /* 向前移动 */\n}\n\n.box {\n  transform: translateZ(-100px); /* 向后移动 */\n}\n\n/* 配合透视才能看到效果 */\n.container {\n  perspective: 1000px;\n}\n.box {\n  transform: translateZ(100px);\n}',
                            result: "元素看起来更大或更小"
                        },
                        {
                            title: "2. translate3d",
                            code: '/* translate3d(x, y, z) */\n.box {\n  transform: translate3d(50px, 100px, 150px);\n}\n\n/* 等同于 */\n.box {\n  transform: \n    translateX(50px)\n    translateY(100px)\n    translateZ(150px);\n}',
                            result: "一次性设置三轴平移"
                        },
                        {
                            title: "3. 性能优化技巧",
                            code: '/* 强制开启GPU加速 */\n.element {\n  transform: translateZ(0);\n  /* 或 */\n  transform: translate3d(0, 0, 0);\n}\n\n/* 这是一个常用hack，创建合成层 */\n.animated {\n  transform: translateZ(0);\n  will-change: transform;\n}',
                            result: "提升动画性能"
                        }
                    ]
                }
            },
            {
                id: "3d-scale",
                title: "3D缩放变换",
                type: "code-example",
                content: {
                    description: "3D缩放可以在三个轴向独立控制缩放比例。",
                    examples: [
                        {
                            title: "1. 三轴缩放",
                            code: '/* Z轴缩放 */\n.box {\n  transform: scaleZ(2);\n}\n\n/* scale3d(x, y, z) */\n.box {\n  transform: scale3d(1.5, 2, 0.5);\n}\n\n/* 注意：scaleZ通常需要配合其他3D变换才能看到效果 */\n.box {\n  transform: rotateY(45deg) scaleZ(2);\n}',
                            result: "三维空间的缩放"
                        }
                    ]
                }
            },
            {
                id: "transform-style",
                title: "transform-style 3D空间保留",
                type: "principle",
                content: {
                    description: "transform-style决定子元素是否在3D空间中渲染，是创建嵌套3D效果的关键。",
                    mechanism: "transform-style有两个值：flat（默认）和preserve-3d。flat会将所有子元素压平到父元素的平面上，preserve-3d会保留子元素在3D空间中的位置。如果要创建立方体、多层3D场景等效果，必须使用preserve-3d。",
                    keyPoints: [
                        "flat：默认值，子元素被压平到父元素平面",
                        "preserve-3d：子元素保留3D空间位置",
                        "创建嵌套3D效果必须使用preserve-3d",
                        "每个需要3D空间的父元素都要设置",
                        "某些CSS属性会强制transform-style: flat（如overflow、filter）",
                        "是创建立方体、3D场景的必需属性"
                    ]
                }
            },
            {
                id: "backface-visibility",
                title: "backface-visibility 背面可见性",
                type: "code-example",
                content: {
                    description: "backface-visibility控制元素背面是否可见，常用于翻转效果。",
                    examples: [
                        {
                            title: "1. 基本用法",
                            code: '/* 隐藏背面 */\n.card {\n  backface-visibility: hidden;\n}\n\n/* 显示背面（默认）*/\n.card {\n  backface-visibility: visible;\n}',
                            result: "控制元素旋转超过90度后是否显示"
                        },
                        {
                            title: "2. 翻转卡片完整示例",
                            code: '.flip-container {\n  perspective: 1000px;\n}\n\n.flipper {\n  transition: transform 0.6s;\n  transform-style: preserve-3d;\n  position: relative;\n}\n\n.flip-container:hover .flipper {\n  transform: rotateY(180deg);\n}\n\n.front, .back {\n  backface-visibility: hidden;\n  position: absolute;\n  top: 0;\n  left: 0;\n}\n\n.back {\n  transform: rotateY(180deg);\n}',
                            result: "创建完美的双面翻转效果"
                        }
                    ]
                }
            },
            {
                id: "3d-cube-example",
                title: "3D立方体实现",
                type: "code-example",
                content: {
                    description: "结合3D变换的各种技术，可以创建完整的3D立方体。",
                    examples: [
                        {
                            title: "3D立方体完整代码",
                            code: '/* HTML结构 */\n<div class="scene">\n  <div class="cube">\n    <div class="face front">Front</div>\n    <div class="face back">Back</div>\n    <div class="face right">Right</div>\n    <div class="face left">Left</div>\n    <div class="face top">Top</div>\n    <div class="face bottom">Bottom</div>\n  </div>\n</div>\n\n/* CSS */\n.scene {\n  perspective: 1000px;\n}\n\n.cube {\n  width: 200px;\n  height: 200px;\n  position: relative;\n  transform-style: preserve-3d;\n  transform: rotateX(-20deg) rotateY(30deg);\n  animation: rotate 10s infinite linear;\n}\n\n.face {\n  position: absolute;\n  width: 200px;\n  height: 200px;\n  border: 2px solid #000;\n  opacity: 0.8;\n}\n\n.front  { transform: rotateY(0deg)   translateZ(100px); }\n.back   { transform: rotateY(180deg) translateZ(100px); }\n.right  { transform: rotateY(90deg)  translateZ(100px); }\n.left   { transform: rotateY(-90deg) translateZ(100px); }\n.top    { transform: rotateX(90deg)  translateZ(100px); }\n.bottom { transform: rotateX(-90deg) translateZ(100px); }\n\n@keyframes rotate {\n  to { transform: rotateX(-20deg) rotateY(390deg); }\n}',
                            result: "一个完整的旋转3D立方体"
                        }
                    ]
                }
            },
            {
                id: "3d-best-practices",
                title: "3D变换最佳实践",
                type: "principle",
                content: {
                    description: "掌握3D变换的最佳实践，避免常见陷阱。",
                    mechanism: "3D变换虽然强大，但也容易出错。常见问题包括：忘记设置perspective、忘记使用preserve-3d、被overflow等属性破坏3D效果、Z轴层级混乱等。正确使用这些属性是关键。",
                    keyPoints: [
                        "必须设置perspective才能看到3D效果",
                        "嵌套3D需要transform-style: preserve-3d",
                        "overflow、filter等属性会破坏preserve-3d",
                        "使用backface-visibility优化翻转效果",
                        "合理使用translateZ避免Z轴冲突",
                        "3D变换同样只触发合成，性能优秀",
                        "移动端3D效果要谨慎使用，注意性能",
                        "测试时注意浏览器兼容性"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "2D变换", url: "36-2d-transform.html" },
        next: { title: "Filter滤镜", url: "38-filter.html" }
    }
};
