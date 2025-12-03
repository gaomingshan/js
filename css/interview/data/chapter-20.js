// 第20章：定位原理 - 面试题（待完善）
window.cssQuizData_Chapter20 = {
    config: {
        title: "定位原理",
        icon: "📍",
        description: "static、relative、absolute、fixed、sticky定位机制",
        primaryColor: "#f093fb",
        bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    questions: [
        // Q1: 简单 - 单选
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["定位基础"],
            question: "CSS中哪个定位值是元素的默认定位方式？",
            options: ["static", "relative", "absolute", "fixed"],
            correctAnswer: "A",
            explanation: {
                title: "默认定位",
                sections: [{
                    title: "正确答案",
                    content: "static是元素的默认定位方式，元素按照正常文档流布局，top/right/bottom/left/z-index属性无效。"
                }]
            },
            source: "CSS定位规范"
        },

        // Q2: 简单 - 单选
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["relative定位"],
            question: "relative定位的元素，其偏移是相对于什么？",
            options: ["相对于父元素", "相对于自身原本位置", "相对于视口", "相对于最近的定位祖先"],
            correctAnswer: "B",
            explanation: {
                title: "relative定位参考",
                sections: [{
                    title: "正确答案",
                    content: "relative定位的元素相对于自身原本位置进行偏移，但原本占据的空间仍然保留，不会影响其他元素的布局。"
                }]
            },
            source: "CSS定位规范"
        },

        // Q3: 中等 - 单选
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["absolute定位"],
            question: "对于absolute定位的元素，如果所有祖先元素都是static定位，它会相对于谁定位？",
            options: ["body元素", "html元素", "初始包含块", "视口"],
            correctAnswer: "C",
            explanation: {
                title: "absolute定位的包含块",
                sections: [{
                    title: "正确答案",
                    content: "当所有祖先元素都是static定位时，absolute定位的元素会相对于初始包含块（initial containing block）定位，在连续媒体中，初始包含块的尺寸等于视口的尺寸。"
                }, {
                    title: "关键点",
                    points: [
                        "初始包含块是所有固定定位元素的默认参考",
                        "在浏览器中，初始包含块通常就是视口",
                        "找不到定位祖先时，absolute元素会一直向上查找到初始包含块"
                    ]
                }]
            },
            source: "CSS定位规范"
        },

        // Q4: 中等 - 单选
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["fixed定位"],
            question: "以下哪个CSS属性会导致fixed定位的元素不再相对于视口定位？",
            options: ["opacity", "transform", "overflow", "display"],
            correctAnswer: "B",
            explanation: {
                title: "fixed定位的包含块变化",
                sections: [{
                    title: "正确答案",
                    content: "transform属性（非none值）会为fixed和absolute定位的后代元素创建新的包含块，导致fixed元素不再相对于视口定位，而是相对于设置了transform的祖先元素定位。"
                }, {
                    title: "其他影响fixed的属性",
                    points: [
                        "transform: 创建新包含块",
                        "filter: 创建新包含块",
                        "perspective: 创建新包含块",
                        "will-change: 如果值为transform/filter/perspective也会创建"
                    ]
                }]
            },
            source: "CSS Transforms规范"
        },

        // Q5: 中等 - 单选
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["sticky定位"],
            question: "sticky定位元素必须满足哪个条件才能生效？",
            options: [
                "父元素必须设置overflow:hidden",
                "必须指定至少一个阈值属性（top/right/bottom/left）",
                "必须设置width和height",
                "父元素必须是relative定位"
            ],
            correctAnswer: "B",
            explanation: {
                title: "sticky定位的必要条件",
                sections: [{
                    title: "正确答案",
                    content: "sticky定位元素必须指定至少一个阈值属性（top、right、bottom或left），这些属性定义了触发粘性效果的滚动位置。"
                }, {
                    title: "sticky失效的常见原因",
                    points: [
                        "未设置阈值属性（top/right/bottom/left）",
                        "父元素设置了overflow:hidden/auto/scroll",
                        "父元素高度不足，没有足够的滚动空间",
                        "sticky元素高度超过父容器"
                    ]
                }]
            },
            source: "CSS定位规范"
        },

        // Q6: 中等 - 单选  
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["定位对比"],
            question: "以下关于relative和absolute定位的说法，错误的是？",
            options: [
                "relative保留原本空间，absolute脱离文档流",
                "relative相对自身定位，absolute相对定位祖先定位",
                "两者都可以使用z-index",
                "两者设置后display都会变为block"
            ],
            correctAnswer: "D",
            explanation: {
                title: "定位对display的影响",
                sections: [{
                    title: "正确答案",
                    content: "只有absolute和fixed定位会导致元素的display计算值变为block（内联元素变块级），而relative定位不会改变元素的display值。"
                }, {
                    title: "定位对display的影响",
                    points: [
                        "absolute/fixed: display计算值会变为block",
                        "relative: display值保持不变",
                        "sticky: display值保持不变",
                        "float也会导致display变为block"
                    ]
                }]
            },
            source: "CSS定位规范"
        },

        // Q7: 困难 - 单选
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["定位层叠"],
            question: "两个absolute定位的元素，都没有设置z-index，后面的元素一定会覆盖前面的吗？",
            options: ["一定会", "一定不会", "取决于DOM结构", "取决于定位方式"],
            correctAnswer: "C",
            explanation: {
                title: "定位元素的层叠规则",
                sections: [{
                    title: "正确答案",
                    content: "当定位元素都没有设置z-index时，层叠顺序由DOM树中的位置决定，后面的元素会覆盖前面的元素。但如果它们处于不同的层叠上下文中，层叠规则会更复杂。"
                }, {
                    title: "层叠顺序规则",
                    points: [
                        "同一层叠上下文中，后来居上（DOM顺序）",
                        "定位元素的z-index默认为auto，不创建新层叠上下文",
                        "z-index不为auto时，会创建新的层叠上下文",
                        "不同层叠上下文之间，由父级层叠上下文决定"
                    ]
                }]
            },
            source: "CSS层叠规范"
        },

        // Q8: 困难 - 单选
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["sticky原理"],
            question: "sticky定位的元素在什么时候表现为relative，什么时候表现为fixed？",
            options: [
                "总是relative，滚动时变fixed",
                "未达到阈值时relative，达到后fixed",
                "父容器内relative，超出后fixed",
                "根据滚动方向动态切换"
            ],
            correctAnswer: "B",
            explanation: {
                title: "sticky的行为机制",
                sections: [{
                    title: "正确答案",
                    content: "sticky元素在未达到设定的阈值（如top:10px）之前，表现为relative定位；当滚动使元素达到该阈值时，元素会固定在该位置，表现为fixed定位。但它始终受限于父容器，当父容器滚出视口时，sticky元素也会跟随移出。"
                }, {
                    title: "sticky工作流程",
                    points: [
                        "初始状态：表现为relative，正常文档流中",
                        "滚动到阈值：固定在设定位置，表现为fixed",
                        "父容器边界：跟随父容器移动，不会超出父容器",
                        "回滚：当滚动位置回到阈值内，恢复relative行为"
                    ]
                }]
            },
            source: "CSS定位规范"
        },

        // Q9: 困难 - 单选
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["定位包含块"],
            question: "对于百分比宽高，absolute定位元素的包含块是？",
            options: [
                "最近的块级祖先的content box",
                "最近的定位祖先的padding box",
                "最近的定位祖先的border box",
                "最近的定位祖先的content box"
            ],
            correctAnswer: "B",
            explanation: {
                title: "absolute元素的包含块",
                sections: [{
                    title: "正确答案",
                    content: "对于absolute定位的元素，其包含块是最近的非static定位祖先元素的padding box（内边距框）。这意味着百分比宽高相对于祖先的padding box计算，不包括border。"
                }, {
                    title: "包含块详解",
                    points: [
                        "static/relative: 包含块是最近块级祖先的content box",
                        "absolute: 包含块是最近定位祖先的padding box",
                        "fixed: 包含块通常是视口（或transform祖先）",
                        "百分比宽高都相对于包含块计算"
                    ]
                }]
            },
            source: "CSS定位规范"
        },

        // Q10: 困难 - 多选
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["定位综合"],
            question: "以下哪些说法是正确的？（多选）",
            options: [
                "relative定位元素可以作为absolute元素的定位参考",
                "sticky定位元素会脱离文档流",
                "absolute定位元素的width:100%相对于定位祖先的padding box计算",
                "fixed定位元素的z-index一定比absolute大"
            ],
            correctAnswer: ["A", "C"],
            explanation: {
                title: "定位综合知识",
                sections: [{
                    title: "正确选项",
                    content: "A正确：relative是非static定位，可以作为absolute的定位参考；C正确：absolute的百分比宽高相对于定位祖先的padding box计算。"
                }, {
                    title: "错误选项",
                    content: "B错误：sticky不脱离文档流，它只是在达到阈值时固定位置；D错误：z-index的层叠顺序与定位方式无关，取决于z-index值和层叠上下文。"
                }]
            },
            source: "CSS定位规范"
        }
    ],
    navigation: {
        prev: { title: "z-index详解", url: "19-z-index.html" },
        next: { title: "偏移属性计算", url: "21-offset-properties.html" }
    }
};
