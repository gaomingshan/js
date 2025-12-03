// 第3章：盒模型与布局基础 - 面试题（30题）
window.cssQuizData_Chapter03 = {
    config: {
        title: "盒模型与布局基础",
        icon: "📦",
        description: "标准盒模型、怪异盒模型、BFC、IFC、外边距合并",
        primaryColor: "#f59e0b",
        bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    questions: [
        // ===== 简单题 (10题) =====
        
        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["盒模型"],
            question: "CSS盒模型由哪些部分组成？",
            options: [
                "content、padding、border、margin",
                "width、height、color、background",
                "top、right、bottom、left",
                "position、display、float、z-index"
            ],
            correctAnswer: "A",
            explanation: {
                title: "CSS盒模型组成",
                sections: [
                    {
                        title: "四个组成部分",
                        points: [
                            "<strong>content</strong>: 内容区域",
                            "<strong>padding</strong>: 内边距",
                            "<strong>border</strong>: 边框",
                            "<strong>margin</strong>: 外边距"
                        ]
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["box-sizing"],
            question: "box-sizing: border-box 的含义是？",
            options: [
                "width包含padding和border",
                "width只包含content",
                "width包含margin",
                "width包含所有四个部分"
            ],
            correctAnswer: "A",
            explanation: {
                title: "box-sizing属性",
                sections: [
                    {
                        title: "两种模式",
                        code: "/* content-box (默认) */\n.box1 {\n  box-sizing: content-box;\n  width: 200px; /* 只是内容宽度 */\n  padding: 20px;\n  border: 10px solid;\n  /* 实际宽度 = 200 + 20*2 + 10*2 = 260px */\n}\n\n/* border-box */\n.box2 {\n  box-sizing: border-box;\n  width: 200px; /* 包含padding和border */\n  padding: 20px;\n  border: 10px solid;\n  /* 实际宽度 = 200px，内容宽度 = 200 - 20*2 - 10*2 = 140px */\n}"
                    }
                ]
            }
        },

        {
            type: "true-false",
            difficulty: "easy",
            tags: ["margin"],
            question: "垂直方向上相邻的两个margin会发生合并。",
            correctAnswer: "A",
            explanation: {
                title: "外边距合并",
                sections: [
                    {
                        title: "正确",
                        content: "垂直方向上相邻的margin会合并，取较大值。水平方向不会合并。",
                        code: ".box1 { margin-bottom: 20px; }\n.box2 { margin-top: 30px; }\n/* 实际间距是30px，不是50px */\n\n.left { margin-right: 20px; }\n.right { margin-left: 30px; }\n/* 水平间距是50px，不会合并 */"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["padding"],
            question: "padding可以设置负值吗？",
            options: ["不可以", "可以", "只有padding-top可以", "需要浏览器支持"],
            correctAnswer: "A",
            explanation: {
                title: "padding取值",
                sections: [
                    {
                        title: "规则",
                        content: "padding不能为负值，只能为0或正值。margin可以为负值。",
                        code: ".box {\n  padding: 20px;  /* ✓ 正确 */\n  padding: 0;     /* ✓ 正确 */\n  padding: -10px; /* ✗ 无效 */\n  \n  margin: -10px;  /* ✓ margin可以为负 */\n}"
                    }
                ]
            }
        },

        {
            type: "multiple-choice",
            difficulty: "easy",
            tags: ["display"],
            question: "以下哪些是块级元素的特征？（多选）",
            options: [
                "独占一行",
                "可以设置width和height",
                "默认宽度100%",
                "不能包含其他元素"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "块级元素特征",
                sections: [
                    {
                        title: "正确特征",
                        points: [
                            "独占一行，前后自动换行",
                            "可以设置width、height、margin、padding",
                            "默认宽度是父元素的100%",
                            "可以包含行内元素和块级元素"
                        ]
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["行内元素"],
            question: "行内元素可以设置哪些属性？",
            options: [
                "水平方向的margin和padding",
                "width和height",
                "垂直方向的margin",
                "以上都可以"
            ],
            correctAnswer: "A",
            explanation: {
                title: "行内元素特性",
                sections: [
                    {
                        title: "可设置属性",
                        points: [
                            "✓ 水平margin和padding",
                            "✓ 垂直padding（不影响布局）",
                            "✗ width和height无效",
                            "✗ 垂直margin无效"
                        ]
                    },
                    {
                        title: "示例",
                        code: "span {\n  margin: 0 10px;      /* ✓ 水平有效 */\n  padding: 5px 10px;   /* ✓ 都有效 */\n  width: 100px;        /* ✗ 无效 */\n  height: 50px;        /* ✗ 无效 */\n}"
                    }
                ]
            }
        },

        {
            type: "true-false",
            difficulty: "easy",
            tags: ["box-sizing"],
            question: "设置 * { box-sizing: border-box; } 是推荐的全局重置方式。",
            correctAnswer: "A",
            explanation: {
                title: "全局box-sizing",
                sections: [
                    {
                        title: "正确",
                        content: "border-box使盒模型计算更直观，是现代CSS的最佳实践。",
                        code: "/* 推荐的全局设置 */\n*, *::before, *::after {\n  box-sizing: border-box;\n}\n\n/* 或继承方式 */\nhtml {\n  box-sizing: border-box;\n}\n*, *::before, *::after {\n  box-sizing: inherit;\n}"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["width"],
            question: "如何让一个块级元素的宽度由内容决定？",
            options: [
                "width: fit-content 或 display: inline-block",
                "width: auto",
                "width: 100%",
                "width: inherit"
            ],
            correctAnswer: "A",
            explanation: {
                title: "内容自适应宽度",
                sections: [
                    {
                        title: "方法",
                        code: "/* 方法1: fit-content */\n.box {\n  width: fit-content;\n}\n\n/* 方法2: inline-block */\n.box {\n  display: inline-block;\n}\n\n/* 方法3: float */\n.box {\n  float: left;\n}\n\n/* width: auto 对块级元素是100%宽度 */"
                    }
                ]
            }
        },

        {
            type: "multiple-choice",
            difficulty: "easy",
            tags: ["margin"],
            question: "以下哪些情况会发生margin合并？（多选）",
            options: [
                "相邻兄弟元素的垂直margin",
                "父元素与第一个/最后一个子元素的margin",
                "空块元素自身的margin-top和margin-bottom",
                "水平方向的margin"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "margin合并场景",
                sections: [
                    {
                        title: "三种合并情况",
                        points: [
                            "相邻兄弟元素: 上下margin合并",
                            "父子元素: 父元素与首/尾子元素margin合并",
                            "空元素: 自身top和bottom margin合并"
                        ]
                    },
                    {
                        title: "阻止合并",
                        code: "/* 父子margin合并的解决方案 */\n.parent {\n  overflow: hidden;  /* 创建BFC */\n  /* 或 */\n  border-top: 1px solid transparent;\n  /* 或 */\n  padding-top: 1px;\n}"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "easy",
            tags: ["inline-block"],
            question: "inline-block元素之间的空白间隙是如何产生的？",
            options: [
                "HTML中的空格和换行符导致",
                "CSS默认设置",
                "浏览器bug",
                "margin的默认值"
            ],
            correctAnswer: "A",
            explanation: {
                title: "inline-block空白问题",
                sections: [
                    {
                        title: "原因",
                        content: "HTML中的空格、换行会被渲染为一个空白字符。"
                    },
                    {
                        title: "解决方案",
                        code: "/* 方法1: 移除HTML空格 */\n<div>A</div><div>B</div>\n\n/* 方法2: font-size: 0 */\n.parent {\n  font-size: 0;\n}\n.child {\n  font-size: 16px;\n}\n\n/* 方法3: margin负值 */\n.child {\n  margin-right: -4px;\n}\n\n/* 方法4: flex布局 */\n.parent {\n  display: flex;\n}"
                    }
                ]
            }
        },

        // ===== 中等题 (10题) =====

        {
            type: "code-output",
            difficulty: "medium",
            tags: ["盒模型计算"],
            question: "以下元素的实际宽度是多少？",
            code: `.box {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  border: 5px solid;
  margin: 10px;
}`,
            options: ["250px", "200px", "270px", "280px"],
            correctAnswer: "A",
            explanation: {
                title: "盒模型宽度计算",
                sections: [
                    {
                        title: "content-box模式",
                        content: "实际宽度 = width + padding×2 + border×2",
                        code: "width: 200px\npadding: 20px × 2 = 40px\nborder: 5px × 2 = 10px\n————————————————\n实际宽度 = 200 + 40 + 10 = 250px\n\n注意: margin不计入实际宽度"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["BFC"],
            question: "什么是BFC（块级格式化上下文）？",
            options: [
                "一个独立的渲染区域，内部元素不影响外部",
                "一种新的布局方式",
                "一个CSS属性",
                "浏览器的渲染模式"
            ],
            correctAnswer: "A",
            explanation: {
                title: "BFC详解",
                sections: [
                    {
                        title: "定义",
                        content: "BFC是一个独立的布局环境，内部元素布局不会影响外部元素。"
                    },
                    {
                        title: "触发条件",
                        points: [
                            "根元素(html)",
                            "float不为none",
                            "position为absolute或fixed",
                            "display为inline-block、flex、grid等",
                            "overflow不为visible"
                        ]
                    },
                    {
                        title: "BFC特性",
                        points: [
                            "阻止margin合并",
                            "清除浮动",
                            "阻止元素被浮动元素覆盖"
                        ]
                    }
                ]
            }
        },

        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["BFC"],
            question: "以下哪些方式可以创建BFC？（多选）",
            options: [
                "overflow: hidden",
                "float: left",
                "display: flex",
                "position: relative"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "创建BFC的方法",
                sections: [
                    {
                        title: "常用方法",
                        code: "/* overflow */\n.bfc { overflow: hidden; } /* 或auto、scroll */\n\n/* float */\n.bfc { float: left; } /* 或right */\n\n/* display */\n.bfc { display: flex; } /* 或inline-block、grid */\n\n/* position */\n.bfc { position: absolute; } /* 或fixed */\n\n/* position: relative 不创建BFC */"
                    }
                ]
            }
        },

        {
            type: "true-false",
            difficulty: "medium",
            tags: ["margin合并"],
            question: "创建BFC可以阻止父子元素之间的margin合并。",
            correctAnswer: "A",
            explanation: {
                title: "BFC阻止margin合并",
                sections: [
                    {
                        title: "正确",
                        content: "BFC内部元素与外部隔离，可以阻止margin合并。"
                    },
                    {
                        title: "示例",
                        code: "/* 问题：父子margin合并 */\n.parent {\n  background: blue;\n}\n.child {\n  margin-top: 20px; /* 会与父元素合并 */\n}\n\n/* 解决：创建BFC */\n.parent {\n  background: blue;\n  overflow: hidden; /* 创建BFC */\n}\n.child {\n  margin-top: 20px; /* 不再合并 */\n}"
                    }
                ]
            }
        },

        {
            type: "code-output",
            difficulty: "medium",
            tags: ["margin合并"],
            question: "以下两个div之间的实际间距是多少？",
            code: `.box1 { margin-bottom: 30px; }
.box2 { margin-top: 50px; }`,
            options: ["50px", "80px", "30px", "40px"],
            correctAnswer: "A",
            explanation: {
                title: "margin合并规则",
                sections: [
                    {
                        title: "取较大值",
                        content: "垂直方向相邻的margin会合并，取其中较大的值。",
                        code: "margin-bottom: 30px\nmargin-top: 50px\n————————————————\n实际间距 = max(30px, 50px) = 50px"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["负margin"],
            question: "设置负margin会有什么效果？",
            options: [
                "元素向相反方向移动或扩大可用空间",
                "元素消失",
                "触发错误",
                "无任何效果"
            ],
            correctAnswer: "A",
            explanation: {
                title: "负margin用法",
                sections: [
                    {
                        title: "效果",
                        points: [
                            "margin-top/left负值：元素向上/左移动",
                            "margin-bottom/right负值：后续元素向上/左移动",
                            "可以实现元素重叠、超出父容器等效果"
                        ]
                    },
                    {
                        title: "应用",
                        code: "/* 元素重叠 */\n.box {\n  margin-left: -20px; /* 向左移动20px */\n}\n\n/* 取消列表缩进 */\nul {\n  margin-left: -40px;\n}\n\n/* 负margin布局 */\n.row {\n  margin: 0 -10px; /* 抵消列的padding */\n}\n.col {\n  padding: 0 10px;\n}"
                    }
                ]
            }
        },

        {
            type: "code-completion",
            difficulty: "medium",
            tags: ["清除浮动"],
            question: "如何清除浮动影响？",
            code: `.clearfix______ {
  content: '';
  display: table;
  clear: both;
}`,
            options: ["::after", "::before", ":after", ".after"],
            correctAnswer: "A",
            explanation: {
                title: "清除浮动方法",
                sections: [
                    {
                        title: "clearfix技术",
                        code: ".clearfix::after {\n  content: '';\n  display: table;\n  clear: both;\n}\n\n/* 使用 */\n<div class=\"clearfix\">\n  <div style=\"float: left;\">浮动元素</div>\n</div>"
                    },
                    {
                        title: "其他方法",
                        points: [
                            "overflow: hidden（创建BFC）",
                            "display: flow-root（现代方案）",
                            "在末尾添加clear: both的空元素"
                        ]
                    }
                ]
            }
        },

        {
            type: "multiple-choice",
            difficulty: "medium",
            tags: ["display"],
            question: "关于display属性，以下说法正确的是？（多选）",
            options: [
                "display: none 会使元素完全不占据空间",
                "display: inline-block 可以设置宽高",
                "display: flex 会创建弹性容器",
                "display: table 会使元素表现为表格"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "display属性详解",
                sections: [
                    {
                        title: "常用值",
                        code: "/* 基础值 */\nblock, inline, inline-block, none\n\n/* 布局值 */\nflex, inline-flex, grid, inline-grid\n\n/* 表格值 */\ntable, table-cell, table-row\n\n/* 其他 */\nflow-root, contents"
                    }
                ]
            }
        },

        {
            type: "true-false",
            difficulty: "medium",
            tags: ["width"],
            question: "width: 100% 和 width: auto 对块级元素的效果完全相同。",
            correctAnswer: "B",
            explanation: {
                title: "width: 100% vs auto",
                sections: [
                    {
                        title: "错误",
                        content: "两者处理padding和border的方式不同。"
                    },
                    {
                        title: "对比",
                        code: "/* width: auto（默认）*/\n.box {\n  width: auto;\n  padding: 20px;\n  /* 宽度自动调整，不会溢出父元素 */\n}\n\n/* width: 100% */\n.box {\n  width: 100%;\n  padding: 20px;\n  /* 宽度100% + padding，可能溢出父元素 */\n  /* 需要box-sizing: border-box解决 */\n}"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "medium",
            tags: ["IFC"],
            question: "什么是IFC（行内格式化上下文）？",
            options: [
                "行内元素在一行内的布局规则",
                "一种新的CSS布局方式",
                "块级元素的布局上下文",
                "浮动元素的布局规则"
            ],
            correctAnswer: "A",
            explanation: {
                title: "IFC详解",
                sections: [
                    {
                        title: "定义",
                        content: "IFC是行内元素按行排列的布局规则。"
                    },
                    {
                        title: "IFC特性",
                        points: [
                            "行内元素水平排列",
                            "vertical-align控制垂直对齐",
                            "line-height决定行高",
                            "text-align控制水平对齐",
                            "空格和换行会产生间隙"
                        ]
                    }
                ]
            }
        },

        // ===== 困难题 (10题) =====

        {
            type: "code-output",
            difficulty: "hard",
            tags: ["盒模型"],
            question: "以下代码中，.child的margin-top会产生什么效果？",
            code: `<div class="parent" style="background: blue;">
  <div class="child" style="margin-top: 50px;">内容</div>
</div>`,
            options: [
                "parent整体向下移动50px（margin合并）",
                "child在parent内向下移动50px",
                "无效果",
                "child向上移动50px"
            ],
            correctAnswer: "A",
            explanation: {
                title: "父子margin合并",
                sections: [
                    {
                        title: "现象",
                        content: "父元素没有border、padding或创建BFC时，子元素的margin-top会与父元素合并，导致父元素整体下移。"
                    },
                    {
                        title: "解决方案",
                        code: "/* 方法1: 创建BFC */\n.parent { overflow: hidden; }\n\n/* 方法2: 添加border */\n.parent { border-top: 1px solid transparent; }\n\n/* 方法3: 添加padding */\n.parent { padding-top: 1px; }\n\n/* 方法4: 使用flexbox */\n.parent { display: flex; }"
                    }
                ]
            }
        },

        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["BFC应用"],
            question: "BFC可以解决哪些布局问题？（多选）",
            options: [
                "清除浮动",
                "阻止margin合并",
                "防止元素被浮动元素覆盖",
                "实现多栏布局"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "BFC的应用场景",
                sections: [
                    {
                        title: "1. 清除浮动",
                        code: ".container {\n  overflow: hidden; /* 创建BFC */\n}\n.float {\n  float: left;\n}"
                    },
                    {
                        title: "2. 阻止margin合并",
                        code: ".parent {\n  overflow: hidden; /* BFC */\n}\n.child {\n  margin-top: 20px; /* 不会与父元素合并 */\n}"
                    },
                    {
                        title: "3. 自适应两栏布局",
                        code: ".sidebar {\n  float: left;\n  width: 200px;\n}\n.main {\n  overflow: hidden; /* BFC，不被sidebar覆盖 */\n}"
                    }
                ]
            }
        },

        {
            type: "code-completion",
            difficulty: "hard",
            tags: ["box-sizing"],
            question: "如何让所有元素默认使用border-box模型？",
            code: `html {
  box-sizing: border-box;
}
______ {
  box-sizing: inherit;
}`,
            options: [
                "*, *::before, *::after",
                "*",
                "body, div",
                "all"
            ],
            correctAnswer: "A",
            explanation: {
                title: "全局box-sizing最佳实践",
                sections: [
                    {
                        title: "推荐方式",
                        content: "使用inherit方式，便于局部覆盖。",
                        code: "html {\n  box-sizing: border-box;\n}\n\n*, *::before, *::after {\n  box-sizing: inherit;\n}\n\n/* 优势：可以局部改变 */\n.content-box-section {\n  box-sizing: content-box;\n  /* 后代元素会继承content-box */\n}"
                    }
                ]
            }
        },

        {
            type: "true-false",
            difficulty: "hard",
            tags: ["浮动"],
            question: "浮动元素会脱离文档流，但仍占据文档流中的空间。",
            correctAnswer: "B",
            explanation: {
                title: "浮动元素特性",
                sections: [
                    {
                        title: "错误",
                        content: "浮动元素完全脱离文档流，不占据文档流空间，但文本会环绕。"
                    },
                    {
                        title: "浮动行为",
                        points: [
                            "脱离文档流，不占空间",
                            "文本和行内元素会环绕",
                            "父元素高度塌陷",
                            "浮动元素之间水平排列"
                        ]
                    },
                    {
                        title: "对比",
                        code: "/* position: relative */\n/* 不脱离文档流，保留原位置 */\n\n/* float */\n/* 脱离文档流，不保留原位置 */\n\n/* position: absolute */\n/* 完全脱离文档流，文本也不环绕 */"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["margin负值"],
            question: "以下代码会产生什么效果？",
            code: `.box {
  width: 100px;
  margin-left: -50px;
}`,
            options: [
                "元素向左移动50px，可能超出父容器",
                "元素宽度变为150px",
                "无效果",
                "元素向右移动50px"
            ],
            correctAnswer: "A",
            explanation: {
                title: "负margin的行为",
                sections: [
                    {
                        title: "效果",
                        content: "负margin会使元素向相反方向移动，可以产生重叠效果。"
                    },
                    {
                        title: "四个方向",
                        code: "/* top/left负值：元素向上/左移动 */\n.box {\n  margin-top: -20px;  /* 向上移动 */\n  margin-left: -20px; /* 向左移动 */\n}\n\n/* bottom/right负值：影响后续元素 */\n.box {\n  margin-bottom: -20px; /* 后续元素向上移动 */\n  margin-right: -20px;  /* 右侧元素向左移动 */\n}"
                    }
                ]
            }
        },

        {
            type: "multiple-choice",
            difficulty: "hard",
            tags: ["height"],
            question: "关于height: 100%，以下说法正确的是？（多选）",
            options: [
                "父元素必须有明确的高度",
                "百分比相对于父元素的content高度",
                "可以使用vh单位替代",
                "绝对定位元素的百分比高度相对于定位父元素"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "百分比高度详解",
                sections: [
                    {
                        title: "基本规则",
                        code: "/* 父元素必须有高度 */\n.parent {\n  height: 500px; /* 明确高度 */\n}\n.child {\n  height: 100%; /* = 500px */\n}\n\n/* 父元素height: auto，子元素100%无效 */\n.parent {\n  height: auto; /* 默认值 */\n}\n.child {\n  height: 100%; /* 无效 */\n}"
                    },
                    {
                        title: "解决方案",
                        code: "/* 方法1: 使用vh */\n.full-height {\n  height: 100vh;\n}\n\n/* 方法2: 设置html和body */\nhtml, body {\n  height: 100%;\n}\n.child {\n  height: 100%;\n}\n\n/* 方法3: 绝对定位 */\n.child {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n}"
                    }
                ]
            }
        },

        {
            type: "code-output",
            difficulty: "hard",
            tags: ["vertical-align"],
            question: "inline-block元素默认的vertical-align是什么？",
            options: ["baseline", "top", "middle", "bottom"],
            correctAnswer: "A",
            explanation: {
                title: "vertical-align基线对齐",
                sections: [
                    {
                        title: "默认值",
                        content: "inline和inline-block元素默认vertical-align: baseline，这会导致底部出现空隙。"
                    },
                    {
                        title: "空隙问题",
                        code: "<div>\n  <img src=\"image.jpg\"> <!-- 底部有空隙 -->\n</div>\n\n/* 解决方案 */\nimg {\n  vertical-align: top;    /* 或middle、bottom */\n  /* 或 */\n  display: block;         /* 改为块级 */\n}"
                    }
                ]
            }
        },

        {
            type: "true-false",
            difficulty: "hard",
            tags: ["min-width"],
            question: "min-width的优先级高于width和max-width。",
            correctAnswer: "A",
            explanation: {
                title: "尺寸优先级",
                sections: [
                    {
                        title: "正确",
                        content: "优先级：min-width > max-width > width"
                    },
                    {
                        title: "示例",
                        code: ".box {\n  width: 300px;\n  min-width: 400px; /* 实际宽度400px */\n  max-width: 200px; /* 被min-width覆盖 */\n}\n\n/* 实际宽度 = 400px */\n/* min-width最高优先级 */"
                    },
                    {
                        title: "应用",
                        code: "/* 响应式容器 */\n.container {\n  width: 80%;\n  min-width: 320px; /* 最小宽度 */\n  max-width: 1200px; /* 最大宽度 */\n}"
                    }
                ]
            }
        },

        {
            type: "single-choice",
            difficulty: "hard",
            tags: ["替换元素"],
            question: "什么是CSS中的替换元素？",
            options: [
                "内容由外部资源决定的元素，如img、video",
                "可以被其他元素替换的元素",
                "需要JavaScript动态替换的元素",
                "display可以改变的元素"
            ],
            correctAnswer: "A",
            explanation: {
                title: "替换元素详解",
                sections: [
                    {
                        title: "定义",
                        content: "替换元素的内容不受CSS控制，由外部资源决定。"
                    },
                    {
                        title: "常见替换元素",
                        points: [
                            "<strong>img</strong>：图片",
                            "<strong>video, audio</strong>：媒体",
                            "<strong>iframe</strong>：嵌入内容",
                            "<strong>input</strong>：表单控件",
                            "<strong>select, textarea</strong>：表单元素"
                        ]
                    },
                    {
                        title: "特性",
                        points: [
                            "有内在尺寸（intrinsic dimensions）",
                            "可以设置width和height",
                            "vertical-align默认为baseline",
                            "不会产生::before和::after伪元素"
                        ]
                    }
                ]
            }
        },

        {
            type: "code-completion",
            difficulty: "hard",
            tags: ["aspect-ratio"],
            question: "如何保持元素的宽高比为16:9？",
            code: `.video-container {
  width: 100%;
  ______: 16 / 9;
}`,
            options: [
                "aspect-ratio",
                "ratio",
                "proportion",
                "scale"
            ],
            correctAnswer: "A",
            explanation: {
                title: "aspect-ratio属性",
                sections: [
                    {
                        title: "现代方案",
                        code: ".video {\n  width: 100%;\n  aspect-ratio: 16 / 9; /* CSS属性 */\n}"
                    },
                    {
                        title: "兼容方案",
                        code: "/* padding-top百分比技巧 */\n.video-container {\n  position: relative;\n  width: 100%;\n  padding-top: 56.25%; /* 9/16 * 100% */\n}\n.video {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}"
                    }
                ]
            }
        }
    ],
    navigation: {
        prev: {
            title: "第2章：选择器系统",
            url: "02-selectors.html"
        },
        next: {
            title: "第4章：Flexbox布局",
            url: "04-flexbox.html"
        }
    }
};
