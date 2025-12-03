// 第4章：基础样式属性 - 面试题（10题）
window.cssQuizData_Chapter04 = {
    config: {
        title: "基础样式属性",
        icon: "✏️",
        description: "文本字体、颜色背景、渐变",
        primaryColor: "#10b981",
        bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    questions: [
        // 简单题3题
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["font-family"],
            question: "font-family属性的作用是？",
            options: ["设置字体族", "设置字体大小", "设置字体粗细", "设置字体颜色"],
            correctAnswer: "A",
            explanation: {
                title: "字体族",
                sections: [{
                    title: "说明",
                    content: "font-family指定字体名称列表，浏览器按顺序查找可用字体。建议最后加上通用字体族（serif、sans-serif等）作为后备。"
                }]
            }
        },
        {
            type: "true-false",
            difficulty: "easy",
            tags: ["line-height"],
            question: "line-height可以使用无单位数值，这个数值是相对于元素自身font-size的倍数。",
            correctAnswer: "A",
            explanation: {
                title: "行高",
                sections: [{
                    title: "正确",
                    content: "line-height: 1.5表示行高是字体大小的1.5倍。无单位数值的好处是子元素会继承这个倍数，而不是计算后的固定值。"
                }]
            }
        },
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["颜色"],
            question: "以下哪个不是有效的CSS颜色表示法？",
            options: ["#ff0000", "rgb(255, 0, 0)", "rgba(255, 0, 0, 0.5)", "color(255, 0, 0)"],
            correctAnswer: "D",
            explanation: {
                title: "颜色表示法",
                sections: [{
                    title: "说明",
                    content: "CSS支持关键字、十六进制、rgb()、rgba()、hsl()、hsla()，但没有color()函数。"
                }]
            }
        },

        // 中等题4题
        {
            type: "code-output",
            difficulty: "medium",
            tags: ["text-overflow"],
            question: "要实现单行文本省略号效果，需要哪些属性组合？",
            options: [
                "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;",
                "overflow: ellipsis; white-space: nowrap;",
                "text-overflow: ellipsis; display: block;",
                "overflow: hidden; text-overflow: ellipsis;"
            ],
            correctAnswer: "A",
            explanation: {
                title: "文本省略",
                sections: [{
                    title: "三个条件",
                    content: "1. overflow: hidden 隐藏溢出\n2. white-space: nowrap 不换行\n3. text-overflow: ellipsis 显示省略号\n三者缺一不可。"
                }]
            }
        },
        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["opacity", "rgba"],
            question: "关于opacity和rgba的区别，正确的是？",
            options: [
                "opacity影响整个元素及其子元素",
                "rgba只影响指定的颜色属性",
                "opacity可以被子元素覆盖",
                "opacity变化只触发合成，性能更好"
            ],
            correctAnswer: ["A", "B", "D"],
            explanation: {
                title: "透明度对比",
                sections: [{
                    title: "区别",
                    content: "opacity影响整个元素树，无法被子元素覆盖。rgba只影响当前属性（如背景色），不影响子元素。opacity变化属于合成层属性，性能优于rgba。"
                }]
            }
        },
        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["linear-gradient"],
            question: "linear-gradient(to right, red, blue)中，'to right'表示？",
            options: [
                "渐变方向从左到右",
                "渐变方向从右到左",
                "渐变方向从上到下",
                "渐变方向从下到上"
            ],
            correctAnswer: "A",
            explanation: {
                title: "渐变方向",
                sections: [{
                    title: "说明",
                    content: "to right表示渐变从左到右。也可以用角度：0deg是向上，90deg是向右，180deg是向下，270deg是向左。"
                }]
            }
        },
        {
            type: "code-completion",
            difficulty: "medium",
            tags: ["background简写"],
            question: "background简写属性的正确语法是？",
            code: 'background: ______ url() ______ ______ / ______ ______;',
            options: [
                "color url repeat position / size attachment",
                "url color repeat position size attachment",
                "color url position repeat size attachment",
                "url repeat position size color attachment"
            ],
            correctAnswer: "A",
            explanation: {
                title: "background简写",
                sections: [{
                    title: "顺序",
                    content: "background: color image repeat position / size attachment;\n注意：size必须在position后面，用/分隔。"
                }]
            }
        },

        // 困难题3题
        {
            type: "code-output",
            difficulty: "hard",
            tags: ["font-weight"],
            question: "以下代码中，实际显示的font-weight是？",
            code: '.parent { font-weight: 400; }\n.child { font-weight: bolder; }',
            options: ["500", "600", "700", "取决于字体"],
            correctAnswer: "D",
            explanation: {
                title: "相对粗细",
                sections: [{
                    title: "bolder/lighter",
                    content: "bolder和lighter是相对值，相对于继承的font-weight。具体增加多少取决于字体文件支持的粗细级别。大多数情况下，bolder会增加300（400→700），但不绝对。"
                }]
            }
        },
        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["渐变高级"],
            question: "关于CSS渐变，正确的是？",
            options: [
                "渐变是background-image类型，不是background-color",
                "可以设置多个渐变，用逗号分隔",
                "渐变的颜色停止位置可以用百分比或长度单位",
                "repeating-linear-gradient创建重复的渐变图案"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "渐变特性",
                sections: [{
                    title: "全部正确",
                    content: "渐变是生成的图像，属于background-image。支持多层渐变叠加，支持颜色停止点，repeating系列用于创建重复图案（如条纹）。"
                }]
            }
        },
        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["currentColor"],
            question: "currentColor关键字的作用是？",
            options: [
                "使用当前元素的color属性值",
                "使用父元素的color属性值",
                "使用根元素的color属性值",
                "使用浏览器默认颜色"
            ],
            correctAnswer: "A",
            explanation: {
                title: "currentColor",
                sections: [{
                    title: "说明",
                    content: "currentColor是一个关键字，代表当前元素的color属性的计算值。常用于border、box-shadow等需要与文字颜色保持一致的场景。"
                }, {
                    title: "示例",
                    content: ".element {\n  color: red;\n  border: 1px solid currentColor; /* 边框也是红色 */\n}"
                }]
            }
        }
    ],
    navigation: {
        prev: { title: "第3章：盒模型基础", url: "03-box-model.html" },
        next: { title: "第5章：CSS解析机制", url: "05-css-parsing.html" }
    }
};
