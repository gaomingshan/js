// 第2章：CSS选择器系统 - 面试题（30题）
window.cssQuizData_Chapter02 = {
    config: {
        title: "CSS选择器系统",
        icon: "🎯",
        description: "基础选择器、组合选择器、伪类、伪元素、选择器优先级",
        primaryColor: "#10b981",
        bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    questions: [
        // ===== 简单题 (10题) =====
        
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["基础选择器"],
            question: "以下哪个选择器的优先级最高？",
            options: [
                "ID选择器 #header",
                "类选择器 .header",
                "标签选择器 div",
                "通配符选择器 *"
            ],
            correctAnswer: "A",
            explanation: {
                title: "选择器优先级",
                sections: [
                    {
                        title: "优先级排序",
                        content: "从高到低：内联样式 > ID选择器 > 类选择器 > 标签选择器 > 通配符"
                    }
                ]
            },
            source: "CSS选择器规范"
        },

        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["组合选择器"],
            question: "CSS中的子选择器符号是？",
            options: [">", " ", "+", "~"],
            correctAnswer: "A",
            explanation: {
                title: "组合选择器",
                sections: [
                    {
                        title: "符号说明",
                        points: [
                            "> : 子选择器（直接子元素）",
                            "空格: 后代选择器（所有后代）",
                            "+ : 相邻兄弟选择器",
                            "~ : 通用兄弟选择器"
                        ]
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["伪类"],
            question: "以下哪个是伪类选择器？",
            options: [":hover", "::before", "::after", "::first-line"],
            correctAnswer: "A",
            explanation: {
                title: "伪类 vs 伪元素",
                sections: [
                    {
                        title: "区别",
                        content: "伪类用单冒号:，伪元素用双冒号::（CSS3规范）"
                    }
                ]
            }
        },

        {
            type: "multiple-choice",
            difficulty: "easy",
            tags: ["属性选择器"],
            question: "以下哪些是有效的CSS属性选择器？（多选）",
            options: [
                "[type='text']",
                "[href^='http']",
                "[class*='btn']",
                "[id$='footer']"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "属性选择器语法",
                sections: [
                    {
                        title: "常用形式",
                        points: [
                            "[attr] - 存在属性",
                            "[attr='value'] - 精确匹配",
                            "[attr^='value'] - 开头匹配",
                            "[attr$='value'] - 结尾匹配",
                            "[attr*='value'] - 包含匹配"
                        ]
                    }
                ]
            }
        },

        {
            type: "true-false",
            difficulty: "easy",
            tags: ["通配符选择器"],
            question: "通配符选择器 * 会匹配页面中的所有元素。",
            correctAnswer: "A",
            explanation: {
                title: "通配符选择器",
                sections: [
                    {
                        title: "正确",
                        content: "* 选择器会匹配文档中的每一个元素，但性能开销较大，应谨慎使用。"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["伪元素"],
            question: "::before 和 ::after 伪元素必须设置什么属性才能显示？",
            options: ["content", "display", "position", "width"],
            correctAnswer: "A",
            explanation: {
                title: "伪元素content属性",
                sections: [
                    {
                        title: "必需属性",
                        content: "::before 和 ::after 必须设置content属性（可以为空字符串''），否则不会显示。",
                        code: ".element::before {\n  content: ''; /* 必需 */\n  display: block;\n  width: 100px;\n}"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["选择器分组"],
            question: "如何同时为多个选择器应用相同的样式？",
            options: [
                "用逗号分隔：h1, h2, h3 { }",
                "用空格分隔：h1 h2 h3 { }",
                "用加号分隔：h1 + h2 + h3 { }",
                "用波浪号分隔：h1 ~ h2 ~ h3 { }"
            ],
            correctAnswer: "A",
            explanation: {
                title: "选择器分组",
                sections: [
                    {
                        title: "正确语法",
                        content: "使用逗号分隔多个选择器可以减少代码重复。",
                        code: "h1, h2, h3 {\n  color: blue;\n  font-weight: bold;\n}"
                    }
                ]
            }
        },

        {
            type: "multiple-choice",
            difficulty: "easy",
            tags: ["伪类"],
            question: "以下哪些是结构伪类选择器？（多选）",
            options: [
                ":first-child",
                ":nth-child(n)",
                ":hover",
                ":last-child"
            ],
            correctAnswer: ["A", "B", "D"],
            explanation: {
                title: "结构伪类",
                sections: [
                    {
                        title: "说明",
                        content: ":hover 是用户行为伪类，不是结构伪类。结构伪类基于元素在文档树中的位置。"
                    }
                ]
            }
        },

        {
            type: "true-false",
            difficulty: "easy",
            tags: ["类选择器"],
            question: "一个HTML元素可以同时拥有多个class。",
            correctAnswer: "A",
            explanation: {
                title: "多class用法",
                sections: [
                    {
                        title: "正确",
                        content: "元素可以有多个class，用空格分隔。",
                        code: "<div class=\"btn btn-primary btn-large\">按钮</div>\n\n.btn { padding: 10px; }\n.btn-primary { background: blue; }\n.btn-large { font-size: 20px; }"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["相邻兄弟选择器"],
            question: "选择器 h1 + p 会选中什么？",
            options: [
                "紧跟在h1后面的第一个p元素",
                "h1内部的所有p元素",
                "h1后面的所有p元素",
                "h1的父元素中的p元素"
            ],
            correctAnswer: "A",
            explanation: {
                title: "相邻兄弟选择器",
                sections: [
                    {
                        title: "说明",
                        content: "+ 选择紧邻其后的一个兄弟元素。",
                        code: "<h1>标题</h1>\n<p>这个会被选中</p>\n<p>这个不会被选中</p>"
                    }
                ]
            }
        },

        // ===== 中等题 (10题) =====

        {
            type: "code-output",
            difficulty: "medium",
            tags: ["选择器优先级"],
            question: "以下代码中，div的最终颜色是？",
            code: `div { color: red; }
.container div { color: blue; }
#main { color: green; }

<div id="main" class="container">文本</div>`,
            options: ["green", "blue", "red", "黑色"],
            correctAnswer: "A",
            explanation: {
                title: "优先级计算",
                sections: [
                    {
                        title: "分析",
                        points: [
                            "div { } - 权重: 0,0,0,1 = 1",
                            ".container div { } - 权重: 0,0,1,1 = 11",
                            "#main { } - 权重: 0,1,0,0 = 100"
                        ]
                    },
                    {
                        title: "结论",
                        content: "ID选择器权重最高，最终颜色为green。"
                    }
                ]
            }
        },

        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["nth-child"],
            question: "关于:nth-child()伪类，以下说法正确的是？（多选）",
            options: [
                ":nth-child(odd) 选择奇数位置的元素",
                ":nth-child(2n) 选择偶数位置的元素",
                ":nth-child(3n+1) 选择1, 4, 7, 10...位置的元素",
                ":nth-child(1) 等同于 :first-child"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: ":nth-child()详解",
                sections: [
                    {
                        title: "语法说明",
                        points: [
                            "odd = 2n+1 = 奇数位",
                            "even = 2n = 偶数位",
                            "an+b 公式：a是循环周期，b是起始偏移"
                        ]
                    },
                    {
                        title: "示例",
                        code: "li:nth-child(odd) { } /* 1, 3, 5, 7... */\nli:nth-child(2n) { } /* 2, 4, 6, 8... */\nli:nth-child(3n+1) { } /* 1, 4, 7, 10... */"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["属性选择器"],
            question: "[class~='btn'] 和 [class*='btn'] 的区别是什么？",
            options: [
                "~= 匹配完整单词，*= 匹配任意位置的子串",
                "*= 匹配完整单词，~= 匹配任意位置的子串",
                "两者完全相同",
                "~= 区分大小写，*= 不区分"
            ],
            correctAnswer: "A",
            explanation: {
                title: "属性选择器匹配规则",
                sections: [
                    {
                        title: "区别说明",
                        code: "/* ~= 匹配空格分隔的完整单词 */\n[class~='btn'] /* 匹配: 'btn' 'btn primary' 'primary btn' */\n/* 不匹配: 'button' 'btn-primary' */\n\n/* *= 匹配包含子串 */\n[class*='btn'] /* 匹配: 'btn' 'button' 'btn-primary' 'my-btn' */\n/* 只要包含'btn'就匹配 */"
                    }
                ]
            }
        },

        {
            type: "true-false",
            difficulty: "medium",
            tags: ["伪类"],
            question: ":first-child 和 :first-of-type 是完全相同的。",
            correctAnswer: "B",
            explanation: {
                title: ":first-child vs :first-of-type",
                sections: [
                    {
                        title: "错误",
                        content: "两者有重要区别。"
                    },
                    {
                        title: "对比",
                        code: "<div>\n  <span>A</span>\n  <p>B</p>\n  <p>C</p>\n</div>\n\np:first-child { } /* 不匹配任何元素，因为第一个子元素是span */\np:first-of-type { } /* 匹配B，是第一个p类型元素 */"
                    }
                ]
            }
        },

        {
            type: "code-completion",
            difficulty: "medium",
            tags: ["伪元素"],
            question: "如何选中输入框的占位符文本？",
            code: `input______ {
  color: gray;
}`,
            options: [
                "::placeholder",
                ":placeholder",
                "::input-placeholder",
                "[placeholder]"
            ],
            correctAnswer: "A",
            explanation: {
                title: "占位符伪元素",
                sections: [
                    {
                        title: "正确语法",
                        content: "使用 ::placeholder 伪元素选择器。",
                        code: "input::placeholder {\n  color: gray;\n  opacity: 0.5;\n}\n\n/* 兼容写法 */\ninput::-webkit-input-placeholder { color: gray; }\ninput::-moz-placeholder { color: gray; }"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["选择器性能"],
            question: "以下哪种选择器的匹配性能最差？",
            options: [
                "* html body div p",
                "#header .nav li",
                ".btn-primary",
                "#main"
            ],
            correctAnswer: "A",
            explanation: {
                title: "选择器性能",
                sections: [
                    {
                        title: "性能分析",
                        content: "浏览器从右向左匹配选择器。通配符*会匹配所有元素，嵌套越深性能越差。"
                    },
                    {
                        title: "性能排序",
                        points: [
                            "最快: ID选择器 #main",
                            "较快: 类选择器 .btn-primary",
                            "一般: 组合选择器 #header .nav li",
                            "最慢: 带通配符的深层嵌套 * html body div p"
                        ]
                    }
                ]
            }
        },

        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["伪类"],
            question: "以下哪些伪类与表单元素状态相关？（多选）",
            options: [
                ":checked",
                ":disabled",
                ":focus",
                ":hover"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "表单伪类",
                sections: [
                    {
                        title: "说明",
                        content: ":hover 是通用的用户行为伪类，不特定于表单。"
                    },
                    {
                        title: "表单专用伪类",
                        points: [
                            ":checked - 选中的单选框/复选框",
                            ":disabled - 禁用的表单元素",
                            ":enabled - 启用的表单元素",
                            ":focus - 获得焦点的元素",
                            ":valid/:invalid - 验证状态",
                            ":required/:optional - 必填/可选"
                        ]
                    }
                ]
            }
        },

        {
            type: "code-output",
            difficulty: "medium",
            tags: ["组合选择器"],
            question: "选择器 div ~ p 会选中多少个元素？",
            code: `<div class="box">
  <p>A</p>
  <span>B</span>
  <p>C</p>
</div>
<p>D</p>
<p>E</p>

div ~ p { color: red; }`,
            options: ["2个(D, E)", "3个(C, D, E)", "1个(D)", "5个(所有p)"],
            correctAnswer: "A",
            explanation: {
                title: "通用兄弟选择器",
                sections: [
                    {
                        title: "规则",
                        content: "~ 选择器选中同级别的、位于div之后的所有p元素。"
                    },
                    {
                        title: "分析",
                        points: [
                            "A和C在div内部，不是兄弟元素",
                            "D和E与div是兄弟元素，且在div之后",
                            "最终选中D和E，共2个元素"
                        ]
                    }
                ]
            }
        },

        {
            type: "true-false",
            difficulty: "medium",
            tags: ["伪元素"],
            question: "::first-letter 伪元素可以应用在任何元素上。",
            correctAnswer: "B",
            explanation: {
                title: "::first-letter 限制",
                sections: [
                    {
                        title: "错误",
                        content: "::first-letter 只能应用于块级元素。"
                    },
                    {
                        title: "可用元素",
                        points: [
                            "块级元素: div, p, h1-h6等",
                            "display: block的元素",
                            "display: list-item的元素"
                        ]
                    },
                    {
                        title: "不可用",
                        content: "内联元素(span, a等)、inline-block、flex容器等不支持。"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "medium",
            tags: [":not()"],
            question: ":not()伪类选择器可以接受什么类型的参数？",
            options: [
                "简单选择器",
                "任意复杂选择器",
                "只能是类选择器",
                "只能是ID选择器"
            ],
            correctAnswer: "A",
            explanation: {
                title: ":not()伪类",
                sections: [
                    {
                        title: "参数限制",
                        content: "CSS3中:not()只接受简单选择器，CSS4中可以接受选择器列表。",
                        code: "/* CSS3: 简单选择器 */\np:not(.special) { }\ninput:not([type='submit']) { }\n\n/* CSS4: 选择器列表 */\np:not(.special, .highlight) { }\np:not(.class1):not(.class2) { } /* CSS3兼容写法 */"
                    }
                ]
            }
        },

        // ===== 困难题 (10题) =====

        {
            type: "code-output",
            difficulty: "hard",
            tags: ["选择器优先级"],
            question: "以下代码中，p元素的最终字体大小是？",
            code: `div.container p { font-size: 16px; }
.container p.text { font-size: 18px; }
div p { font-size: 14px !important; }

<div class="container">
  <p class="text">文本</p>
</div>`,
            options: ["14px", "18px", "16px", "浏览器默认"],
            correctAnswer: "A",
            explanation: {
                title: "!important优先级",
                sections: [
                    {
                        title: "权重计算",
                        points: [
                            "div.container p - 权重: 0,0,1,2 = 12",
                            ".container p.text - 权重: 0,0,2,1 = 21",
                            "div p { !important } - !important最高"
                        ]
                    },
                    {
                        title: "结论",
                        content: "!important声明会覆盖所有正常声明，最终为14px。"
                    }
                ]
            }
        },

        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: [":nth-child"],
            question: "关于:nth-child()和:nth-of-type()，以下说法正确的是？（多选）",
            options: [
                ":nth-child()根据所有兄弟元素计数",
                ":nth-of-type()只计数相同类型的元素",
                ":nth-child()可以与类型选择器组合使用",
                "两者的索引都从1开始"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "结构伪类对比",
                sections: [
                    {
                        title: "详细对比",
                        code: "<div>\n  <p>1</p>\n  <span>2</span>\n  <p>3</p>\n  <span>4</span>\n</div>\n\np:nth-child(1) { } /* 选中第1个p，因为它是第1个子元素 */\np:nth-child(3) { } /* 选中第3个p */\np:nth-of-type(2) { } /* 选中第2个p类型元素，即第3个p */\n\nspan:nth-child(2) { } /* 选中第1个span */\nspan:nth-of-type(1) { } /* 选中第1个span类型元素 */"
                    }
                ]
            }
        },

        {
            type: "code-completion",
            difficulty: "hard",
            tags: ["属性选择器"],
            question: "如何选择所有外部链接（以http或https开头）？",
            code: `a______ {
  color: blue;
}`,
            options: [
                "[href^='http']",
                "[href*='http']",
                "[href~='http']",
                "[href|='http']"
            ],
            correctAnswer: "A",
            explanation: {
                title: "属性选择器高级用法",
                sections: [
                    {
                        title: "正确答案",
                        content: "^= 表示属性值以指定字符串开头。",
                        code: "/* 选择外部链接 */\na[href^='http'] { }\na[href^='https'] { }\n\n/* 同时匹配http和https */\na[href^='http://'],\na[href^='https://'] {\n  color: blue;\n}\n\n/* 或使用:not排除内部链接 */\na:not([href^='#']):not([href^='/']) { }"
                    }
                ]
            }
        },

        {
            type: "true-false",
            difficulty: "hard",
            tags: ["CSS特异性"],
            question: "选择器的特异性可以通过在选择器中多次重复同一个类来提高。",
            correctAnswer: "A",
            explanation: {
                title: "特异性累加",
                sections: [
                    {
                        title: "正确",
                        content: "重复同一个类会累加权重，但这是不推荐的hack方式。"
                    },
                    {
                        title: "示例",
                        code: "/* 权重: 0,0,1,0 = 10 */\n.btn { color: blue; }\n\n/* 权重: 0,0,2,0 = 20 */\n.btn.btn { color: red; }\n\n/* 权重: 0,0,3,0 = 30 */\n.btn.btn.btn { color: green; }\n\n/* 不推荐！应该使用ID或更具体的选择器 */"
                    },
                    {
                        title: "最佳实践",
                        content: "避免这种hack，通过合理的选择器结构来控制优先级。"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "hard",
            tags: [":has()"],
            question: "CSS4的:has()伪类选择器的作用是什么？",
            options: [
                "选择包含特定子元素的父元素",
                "选择包含特定属性的元素",
                "选择包含特定文本的元素",
                "选择包含特定类名的元素"
            ],
            correctAnswer: "A",
            explanation: {
                title: ":has()父级选择器",
                sections: [
                    {
                        title: "父级选择器",
                        content: ":has()允许根据子元素来选择父元素，这是CSS长期缺失的功能。"
                    },
                    {
                        title: "示例",
                        code: "/* 选择包含img的div */\ndiv:has(img) {\n  border: 1px solid red;\n}\n\n/* 选择包含.error类的表单 */\nform:has(.error) {\n  background: #fee;\n}\n\n/* 选择包含选中checkbox的label */\nlabel:has(input[type='checkbox']:checked) {\n  font-weight: bold;\n}\n\n/* 组合使用 */\nul:has(> li.active) {\n  /* 包含活动项的列表 */\n}"
                    },
                    {
                        title: "浏览器支持",
                        content: "现代浏览器已开始支持（Chrome 105+, Safari 15.4+）。"
                    }
                ]
            }
        },

        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["伪元素"],
            question: "关于CSS伪元素，以下说法正确的是？（多选）",
            options: [
                "每个元素最多只能有一个::before和一个::after",
                "伪元素默认是inline元素",
                "::first-line和::first-letter可以同时使用",
                "伪元素可以设置z-index"
            ],
            correctAnswer: ["A", "B", "D"],
            explanation: {
                title: "伪元素特性",
                sections: [
                    {
                        title: "选项分析",
                        points: [
                            "A正确: 每个元素只能有一个::before和一个::after",
                            "B正确: 伪元素默认display: inline",
                            "C错误: ::first-line和::first-letter不能同时应用",
                            "D正确: 设置position后可以使用z-index"
                        ]
                    },
                    {
                        title: "示例",
                        code: ".box::before {\n  content: '';\n  display: block; /* 通常需要改为block */\n  position: absolute;\n  z-index: -1; /* 可以设置层级 */\n}"
                    }
                ]
            }
        },

        {
            type: "code-output",
            difficulty: "hard",
            tags: ["选择器特异性"],
            question: "以下选择器的特异性值是多少？",
            code: `div#header.nav > ul li:nth-child(2) a[href]:hover`,
            options: [
                "(0,1,4,4)",
                "(0,1,3,4)",
                "(0,2,3,3)",
                "(0,1,5,3)"
            ],
            correctAnswer: "A",
            explanation: {
                title: "复杂选择器特异性计算",
                sections: [
                    {
                        title: "详细拆解",
                        code: "div#header.nav > ul li:nth-child(2) a[href]:hover\n\n分解:\n- div (标签: 1)\n- #header (ID: 1)\n- .nav (类: 1)\n- ul (标签: 1)\n- li (标签: 1)\n- :nth-child(2) (伪类: 1)\n- a (标签: 1)\n- [href] (属性: 1)\n- :hover (伪类: 1)\n\n总计:\n- ID: 1\n- 类/伪类/属性: 4 (.nav + :nth-child + [href] + :hover)\n- 标签: 4 (div + ul + li + a)\n\n结果: (0,1,4,4)"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["选择器性能"],
            question: "为什么不推荐使用后代选择器 div p 而是推荐 .content p ？",
            options: [
                "类选择器比标签选择器更高效",
                "后代选择器会匹配所有层级",
                "标签选择器权重太低",
                "div选择器不支持所有浏览器"
            ],
            correctAnswer: "A",
            explanation: {
                title: "选择器性能优化",
                sections: [
                    {
                        title: "性能原因",
                        content: "浏览器从右向左解析选择器。div p需要先找到所有p，再检查祖先是否有div；.content p先找所有p，再检查是否有.content类，类查找有hash优化更快。"
                    },
                    {
                        title: "性能对比",
                        points: [
                            "最快: ID选择器（hash查找）",
                            "很快: 类选择器（hash查找）",
                            "较慢: 标签选择器（需遍历）",
                            "最慢: 通配符、复杂后代选择器"
                        ]
                    },
                    {
                        title: "最佳实践",
                        code: "/* 不推荐 */\ndiv div div p { }\n\n/* 推荐 */\n.content p { }\n\n/* 更推荐：直接使用类 */\n.content-text { }"
                    }
                ]
            }
        },

        {
            type: "true-false",
            difficulty: "hard",
            tags: ["伪类"],
            question: ":empty伪类会匹配包含空格或换行的元素。",
            correctAnswer: "B",
            explanation: {
                title: ":empty伪类规则",
                sections: [
                    {
                        title: "错误",
                        content: ":empty只匹配完全没有内容的元素，空格和换行都算内容。"
                    },
                    {
                        title: "示例",
                        code: "<div></div>           <!-- 匹配:empty -->\n<div> </div>          <!-- 不匹配，有空格 -->\n<div>\n</div>                <!-- 不匹配，有换行 -->\n<div><!-- 注释 --></div> <!-- 匹配，注释不算内容 -->\n<div><span></span></div> <!-- 不匹配，有子元素 */"
                    },
                    {
                        title: "应用场景",
                        code: "/* 隐藏空的提示框 */\n.message:empty {\n  display: none;\n}\n\n/* 为空状态添加占位内容 */\n.list:empty::before {\n  content: '暂无数据';\n  color: gray;\n}"
                    }
                ]
            }
        },

        {
            type: "code-completion",
            difficulty: "hard",
            tags: ["选择器组合"],
            question: "如何选择同时具有.active和.primary类的元素？",
            code: `_______ {
  background: blue;
}`,
            options: [
                ".active.primary",
                ".active .primary",
                ".active, .primary",
                ".active + .primary"
            ],
            correctAnswer: "A",
            explanation: {
                title: "多类选择器",
                sections: [
                    {
                        title: "语法规则",
                        content: "选择器直接连写表示同一个元素必须同时满足所有条件。",
                        code: "/* 同时具有两个类 */\n.active.primary { }\n\n/* .active的后代.primary */\n.active .primary { }\n\n/* 分别匹配.active或.primary */\n.active, .primary { }\n\n/* .active后紧邻的.primary */\n.active + .primary { }"
                    },
                    {
                        title: "实际应用",
                        code: "<button class=\"btn active\">按钮1</button>\n<button class=\"btn primary\">按钮2</button>\n<button class=\"btn active primary\">按钮3</button>\n\n.btn.active.primary {\n  /* 只匹配按钮3 */\n  background: blue;\n}"
                    }
                ]
            }
        }
    ],
    navigation: {
        prev: {
            title: "第1章：CSS核心概念",
            url: "01-basics.html"
        },
        next: {
            title: "第3章：盒模型与布局",
            url: "03-box-model.html"
        }
    }
};
