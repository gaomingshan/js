// 第36章：2D变换
window.cssContentData_Section36 = {
    section: {
        id: 36,
        title: "2D变换",
        icon: "🔄",
        topics: [
            {
                id: "transform-basics",
                title: "transform 2D变换概述",
                type: "concept",
                content: {
                    description: "CSS 2D变换允许你在二维平面上对元素进行旋转、缩放、平移和倾斜操作，而不影响文档流。",
                    keyPoints: [
                        "transform不触发重排，只触发合成，性能极佳",
                        "变换不会改变元素在文档流中的位置，只改变视觉呈现",
                        "可以组合多个变换函数，按从左到右的顺序应用",
                        "变换原点默认为元素中心(50% 50%)，可通过transform-origin调整",
                        "支持transition和animation，可以创建流畅的动画效果",
                        "所有现代浏览器都支持，无需前缀"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform"
                }
            },
            {
                id: "translate-function",
                title: "translate() 平移变换",
                type: "code-example",
                content: {
                    description: "translate()函数用于在二维平面上移动元素，是实现元素位置动画的首选方法。",
                    examples: [
                        {
                            title: "1. 基本平移",
                            code: '/* 水平和垂直平移 */\n.box {\n  transform: translate(50px, 100px);\n}\n\n/* 只水平平移 */\n.box {\n  transform: translateX(50px);\n}\n\n/* 只垂直平移 */\n.box {\n  transform: translateY(100px);\n}',
                            result: "元素向右移动50px，向下移动100px"
                        },
                        {
                            title: "2. 使用百分比",
                            code: '/* 相对于元素自身尺寸 */\n.box {\n  /* 向右移动自身宽度的50% */\n  transform: translateX(50%);\n  \n  /* 水平垂直居中技巧 */\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}',
                            result: "百分比相对于元素自身尺寸计算"
                        },
                        {
                            title: "3. translate vs position",
                            code: '/* 不推荐：使用position */\n.box {\n  position: relative;\n  left: 50px;\n  top: 100px;\n}\n\n/* 推荐：使用transform */\n.box {\n  transform: translate(50px, 100px);\n}',
                            result: "transform性能更好，不触发重排"
                        }
                    ]
                }
            },
            {
                id: "rotate-function",
                title: "rotate() 旋转变换",
                type: "code-example",
                content: {
                    description: "rotate()函数围绕变换原点旋转元素，支持正负角度值。",
                    examples: [
                        {
                            title: "1. 基本旋转",
                            code: '/* 顺时针旋转45度 */\n.box {\n  transform: rotate(45deg);\n}\n\n/* 逆时针旋转45度 */\n.box {\n  transform: rotate(-45deg);\n}\n\n/* 使用其他单位 */\n.box {\n  transform: rotate(0.25turn); /* 90度 */\n  transform: rotate(100grad);\n  transform: rotate(1.57rad);\n}',
                            result: "元素围绕中心点旋转"
                        },
                        {
                            title: "2. 改变旋转中心",
                            code: '/* 围绕左上角旋转 */\n.box {\n  transform: rotate(45deg);\n  transform-origin: left top;\n}\n\n/* 围绕右下角旋转 */\n.box {\n  transform: rotate(45deg);\n  transform-origin: right bottom;\n}\n\n/* 围绕自定义点旋转 */\n.box {\n  transform: rotate(45deg);\n  transform-origin: 30px 40px;\n}',
                            result: "改变transform-origin影响旋转效果"
                        },
                        {
                            title: "3. 旋转动画",
                            code: '/* 持续旋转动画 */\n@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n\n.spinner {\n  animation: spin 2s linear infinite;\n}',
                            result: "创建持续旋转的loading动画"
                        }
                    ]
                }
            },
            {
                id: "scale-function",
                title: "scale() 缩放变换",
                type: "code-example",
                content: {
                    description: "scale()函数改变元素的尺寸，可以分别控制宽度和高度的缩放比例。",
                    examples: [
                        {
                            title: "1. 基本缩放",
                            code: '/* 等比例放大2倍 */\n.box {\n  transform: scale(2);\n}\n\n/* 等比例缩小到一半 */\n.box {\n  transform: scale(0.5);\n}\n\n/* 分别控制宽高 */\n.box {\n  transform: scale(2, 1.5); /* 宽2倍，高1.5倍 */\n}',
                            result: "scale(1)表示原始大小"
                        },
                        {
                            title: "2. 单轴缩放",
                            code: '/* 只水平缩放 */\n.box {\n  transform: scaleX(2);\n}\n\n/* 只垂直缩放 */\n.box {\n  transform: scaleY(1.5);\n}\n\n/* 镜像翻转 */\n.box {\n  transform: scaleX(-1); /* 水平翻转 */\n  transform: scaleY(-1); /* 垂直翻转 */\n}',
                            result: "负值可以实现镜像效果"
                        },
                        {
                            title: "3. 悬停缩放效果",
                            code: '.card {\n  transition: transform 0.3s;\n  transform: scale(1);\n}\n\n.card:hover {\n  transform: scale(1.05);\n  /* 略微放大，创造浮起效果 */\n}\n\n/* 配合阴影更真实 */\n.card:hover {\n  transform: scale(1.05);\n  box-shadow: 0 10px 30px rgba(0,0,0,0.2);\n}',
                            result: "常用于卡片交互效果"
                        }
                    ]
                }
            },
            {
                id: "skew-function",
                title: "skew() 倾斜变换",
                type: "code-example",
                content: {
                    description: "skew()函数沿X轴或Y轴倾斜元素，创造斜切效果。",
                    examples: [
                        {
                            title: "1. 基本倾斜",
                            code: '/* 水平和垂直倾斜 */\n.box {\n  transform: skew(20deg, 10deg);\n}\n\n/* 只水平倾斜 */\n.box {\n  transform: skewX(20deg);\n}\n\n/* 只垂直倾斜 */\n.box {\n  transform: skewY(10deg);\n}',
                            result: "创建平行四边形效果"
                        },
                        {
                            title: "2. 倾斜的视觉效果",
                            code: '/* 创建斜角标签 */\n.tag {\n  transform: skewX(-10deg);\n  background: #667eea;\n  color: white;\n  padding: 5px 15px;\n}\n\n/* 倾斜的分隔线 */\n.divider {\n  height: 2px;\n  transform: skewY(-2deg);\n  background: #ddd;\n}',
                            result: "可用于创建独特的UI元素"
                        }
                    ]
                }
            },
            {
                id: "transform-combination",
                title: "变换组合与顺序",
                type: "principle",
                content: {
                    description: "可以在一个transform属性中组合多个变换函数，变换的应用顺序会影响最终效果。",
                    mechanism: "变换函数从左到右依次应用。例如，transform: translate(100px, 0) rotate(45deg)会先平移再旋转，而transform: rotate(45deg) translate(100px, 0)会先旋转再平移，产生不同的结果。这是因为每个变换都基于当前的坐标系统。",
                    keyPoints: [
                        "变换从左到右依次应用，顺序很重要",
                        "每个变换都基于前一个变换后的坐标系",
                        "通常顺序：translate → rotate → scale",
                        "先旋转后平移 vs 先平移后旋转会产生完全不同的效果",
                        "建议使用matrix()进行复杂的组合变换优化",
                        "可以通过多个transform分步应用于父子元素"
                    ]
                }
            },
            {
                id: "transform-origin",
                title: "transform-origin 变换原点",
                type: "code-example",
                content: {
                    description: "transform-origin定义变换的参考点，默认为元素中心，改变它会影响旋转、缩放等变换的效果。",
                    examples: [
                        {
                            title: "1. 预定义位置",
                            code: '/* 中心（默认）*/\ntransform-origin: center center; /* 或 50% 50% */\n\n/* 左上角 */\ntransform-origin: left top; /* 或 0 0 */\n\n/* 右下角 */\ntransform-origin: right bottom; /* 或 100% 100% */\n\n/* 混合使用 */\ntransform-origin: left center; /* 左边中间 */\ntransform-origin: center bottom; /* 底部中间 */',
                            result: "关键字更直观易读"
                        },
                        {
                            title: "2. 自定义位置",
                            code: '/* 使用像素值 */\n.box {\n  transform-origin: 20px 30px;\n}\n\n/* 使用百分比 */\n.box {\n  transform-origin: 25% 75%;\n}\n\n/* 混合单位 */\n.box {\n  transform-origin: 50px 50%;\n}',
                            result: "可以精确控制变换原点"
                        },
                        {
                            title: "3. 实际应用示例",
                            code: '/* 门旋转效果 */\n.door {\n  transform-origin: left center;\n  transform: rotateY(90deg);\n}\n\n/* 指针旋转 */\n.pointer {\n  transform-origin: center bottom;\n  transform: rotate(45deg);\n}\n\n/* 缩放从角落开始 */\n.card {\n  transform-origin: top left;\n  transform: scale(0);\n}',
                            result: "不同原点创造不同效果"
                        }
                    ]
                }
            },
            {
                id: "matrix-function",
                title: "matrix() 矩阵变换",
                type: "principle",
                content: {
                    description: "matrix()是所有2D变换的底层实现，使用6个参数定义一个变换矩阵。理解矩阵有助于优化复杂变换。",
                    mechanism: "matrix(a, b, c, d, tx, ty)定义一个2D变换矩阵。其中a和d控制缩放，b和c控制倾斜和旋转，tx和ty控制平移。所有的translate、rotate、scale、skew最终都会转换为matrix。浏览器在渲染时会合并多个变换为一个矩阵运算。",
                    keyPoints: [
                        "matrix(a, b, c, d, tx, ty)是最底层的变换函数",
                        "所有其他变换函数都可以用matrix表示",
                        "a和d：缩放（scaleX和scaleY）",
                        "b和c：倾斜和旋转",
                        "tx和ty：平移（translateX和translateY）",
                        "多个变换最终会合并为一个矩阵运算",
                        "通常不需要手写matrix，浏览器会自动优化"
                    ]
                }
            },
            {
                id: "transform-best-practices",
                title: "2D变换最佳实践",
                type: "code-example",
                content: {
                    description: "掌握2D变换的最佳实践，可以创建高性能、美观的动画和交互效果。",
                    examples: [
                        {
                            title: "1. 性能优化",
                            code: '/* 使用translate代替定位 */\n/* 不推荐 */\n.box {\n  position: relative;\n  left: 100px;\n  transition: left 0.3s;\n}\n\n/* 推荐 */\n.box {\n  transform: translateX(100px);\n  transition: transform 0.3s;\n}',
                            result: "transform只触发合成，性能更好"
                        },
                        {
                            title: "2. 提前优化",
                            code: '/* 提示浏览器创建图层 */\n.animated {\n  will-change: transform;\n  /* 或使用 */\n  transform: translateZ(0);\n}\n\n/* 动画结束后清理 */\n.animated.done {\n  will-change: auto;\n}',
                            result: "提前优化动画性能"
                        },
                        {
                            title: "3. 组合变换的合理顺序",
                            code: '/* 推荐顺序：translate → rotate → scale */\n.element {\n  transform: \n    translate(100px, 50px)\n    rotate(45deg)\n    scale(1.2);\n}\n\n/* 等同于分步应用 */\n.wrapper {\n  transform: translate(100px, 50px);\n}\n.wrapper > .inner {\n  transform: rotate(45deg);\n}\n.wrapper > .inner > .content {\n  transform: scale(1.2);\n}',
                            result: "合理的顺序让效果更可预测"
                        },
                        {
                            title: "4. 避免模糊",
                            code: '/* 在某些浏览器中，非整数平移可能导致模糊 */\n/* 不好 */\n.box {\n  transform: translate(10.5px, 20.3px);\n}\n\n/* 好：使用整数值 */\n.box {\n  transform: translate(10px, 20px);\n}\n\n/* 或使用backface-visibility */\n.box {\n  backface-visibility: hidden;\n}',
                            result: "保持图像清晰"
                        }
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "动画性能优化", url: "35-animation-performance.html" },
        next: { title: "3D变换", url: "37-3d-transform.html" }
    }
};
