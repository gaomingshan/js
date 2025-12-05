// 第35章：邮件HTML - 面试题
window.htmlQuizData_35 = {
    config: {
        title: "邮件HTML",
        icon: "📧",
        description: "测试你对邮件HTML编写的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "hard",
            tags: ["邮件", "表格布局"],
            question: "为什么邮件HTML要使用表格布局？",
            type: "single-choice",
            options: [
                "邮件客户端对CSS支持有限",
                "表格布局更好看",
                "邮件必须用表格",
                "历史原因"
            ],
            correctAnswer: "A",
            explanation: {
                title: "邮件HTML的特殊性",
                description: "邮件客户端的限制导致必须使用旧技术。",
                sections: [
                    {
                        title: "邮件客户端限制",
                        code: '/* 邮件客户端对CSS的支持 */\n\nOutlook (Windows):\n- 使用Word渲染引擎\n- 不支持: float, position, flexbox, grid\n- 不支持: background-image\n- 不支持: CSS3选择器\n\nGmail:\n- 移除<style>标签\n- 只支持内联样式\n- 不支持: margin\n- 部分支持: padding\n\niOS Mail:\n- 支持较好\n- 自动缩放\n\n因此使用表格布局最安全',
                        content: "各客户端支持差异大。"
                    },
                    {
                        title: "基本结构",
                        code: '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>邮件标题</title>\n</head>\n<body style="margin: 0; padding: 0;">\n  <!-- 外层容器表格 -->\n  <table border="0" cellpadding="0" cellspacing="0" width="100%">\n    <tr>\n      <td align="center">\n        <!-- 内容表格 -->\n        <table border="0" cellpadding="0" cellspacing="0" width="600">\n          <tr>\n            <td>\n              <!-- 邮件内容 -->\n            </td>\n          </tr>\n        </table>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>',
                        content: "表格嵌套布局。"
                    },
                    {
                        title: "重要属性",
                        code: '/* 表格必须的属性 */\n<table border="0"       <!-- 无边框 -->\n       cellpadding="0"  <!-- 内边距为0 -->\n       cellspacing="0"  <!-- 单元格间距为0 -->\n       width="600"      <!-- 固定宽度 -->\n       style="...">     <!-- 内联样式 -->\n\n/* td必须的属性 */\n<td align="center"      <!-- 水平对齐 -->\n    valign="top"        <!-- 垂直对齐 -->\n    style="...">        <!-- 内联样式 -->',
                        content: "必须的HTML属性。"
                    }
                ]
            },
            source: "Email HTML"
        },
        {
            difficulty: "medium",
            tags: ["内联样式", "CSS"],
            question: "邮件HTML中应该如何编写CSS？",
            type: "single-choice",
            options: [
                "使用内联样式",
                "使用外部CSS",
                "使用<style>标签",
                "不需要CSS"
            ],
            correctAnswer: "A",
            explanation: {
                title: "邮件CSS编写",
                description: "内联样式是最安全的方式。",
                sections: [
                    {
                        title: "内联样式",
                        code: '<!-- 所有样式写在style属性中 -->\n<table style="width: 600px; background-color: #f5f5f5;">\n  <tr>\n    <td style="padding: 20px; color: #333; font-size: 14px;">\n      内容\n    </td>\n  </tr>\n</table>\n\n<!-- 不要用简写 -->\n<!-- ❌ 不好 -->\n<td style="padding: 10px 20px;">\n\n<!-- ✅ 好 -->\n<td style="padding-top: 10px; padding-right: 20px; padding-bottom: 10px; padding-left: 20px;">',
                        content: "使用内联样式最安全。"
                    },
                    {
                        title: "工具自动转换",
                        code: '/* 先写<style>，再用工具转为内联 */\n\n<!-- 源码 -->\n<style>\n  .header {\n    background-color: #333;\n    color: #fff;\n    padding: 20px;\n  }\n</style>\n<table class="header">\n  <tr><td>标题</td></tr>\n</table>\n\n<!-- 工具转换后 -->\n<table style="background-color: #333; color: #fff; padding: 20px;">\n  <tr><td>标题</td></tr>\n</table>\n\n/* 常用工具 */\n- Premailer\n- Juice\n- Foundation for Emails (Inky)',
                        content: "使用工具提高效率。"
                    },
                    {
                        title: "支持的CSS属性",
                        code: '/* 安全的CSS属性 */\n\n✅ 支持良好:\n- color\n- font-family, font-size, font-weight\n- background-color (部分)\n- text-align\n- width, height\n- padding (部分)\n- border\n\n⚠️ 部分支持:\n- margin (Outlook不支持)\n- background-image (Outlook不支持)\n- border-radius\n\n❌ 不支持:\n- float, position\n- flexbox, grid\n- transform, animation\n- :hover, :focus等伪类\n- @media (部分客户端)',
                        content: "选择兼容性好的属性。"
                    }
                ]
            },
            source: "Email CSS"
        },
        {
            difficulty: "medium",
            tags: ["响应式", "移动端"],
            question: "如何实现响应式邮件？",
            type: "multiple-choice",
            options: [
                "使用媒体查询",
                "流式布局",
                "max-width设置",
                "条件注释"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "响应式邮件",
                description: "适配不同设备的邮件。",
                sections: [
                    {
                        title: "基础响应式",
                        code: '<!DOCTYPE html>\n<html>\n<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <style>\n    /* 媒体查询 */\n    @media only screen and (max-width: 600px) {\n      .content {\n        width: 100% !important;\n      }\n      \n      .mobile-hide {\n        display: none !important;\n      }\n      \n      .mobile-center {\n        text-align: center !important;\n      }\n    }\n  </style>\n</head>\n<body>\n  <table width="100%">\n    <tr>\n      <td align="center">\n        <table class="content" width="600">\n          <!-- 内容 -->\n        </table>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>',
                        content: "使用媒体查询。"
                    },
                    {
                        title: "流式表格",
                        code: '<!-- 桌面：固定600px，移动：100% -->\n<table width="600" \n       style="max-width: 600px; width: 100%;" \n       cellpadding="0" \n       cellspacing="0">\n  <tr>\n    <td>\n      内容\n    </td>\n  </tr>\n</table>\n\n<!-- 两列布局变单列 -->\n<table width="600">\n  <tr>\n    <td width="300" style="display: inline-block; width: 100%; max-width: 300px;">\n      列1\n    </td>\n    <td width="300" style="display: inline-block; width: 100%; max-width: 300px;">\n      列2\n    </td>\n  </tr>\n</table>',
                        content: "流式布局技巧。"
                    },
                    {
                        title: "Outlook条件注释",
                        code: '<!-- Outlook专用代码 -->\n<!--[if mso]>\n<table width="600">\n  <tr>\n    <td>\n<![endif]-->\n\n<!-- 其他客户端代码 -->\n<div style="max-width: 600px;">\n  内容\n</div>\n\n<!--[if mso]>\n    </td>\n  </tr>\n</table>\n<![endif]-->\n\n/* 常用条件 */\n<!--[if mso]>       <!-- 所有Outlook -->\n<!--[if gte mso 12]> <!-- Outlook 2007+ -->\n<!--[if !mso]><!-->  <!-- 非Outlook -->',
                        content: "Outlook特殊处理。"
                    }
                ]
            },
            source: "Responsive Email"
        },
        {
            difficulty: "easy",
            tags: ["图片", "优化"],
            question: "邮件中使用图片的注意事项？",
            type: "multiple-choice",
            options: [
                "提供alt文本",
                "使用绝对URL",
                "设置宽高",
                "优化文件大小"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "邮件图片",
                description: "正确使用图片的方法。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<img src="https://example.com/image.jpg" \n     alt="图片描述"\n     width="600" \n     height="300"\n     style="display: block; border: 0; outline: none; text-decoration: none;">',
                        points: [
                            "使用完整URL（https://）",
                            "设置alt属性（图片被屏蔽时显示）",
                            "明确设置width和height",
                            "display: block避免底部空隙",
                            "border: 0移除默认边框"
                        ]
                    },
                    {
                        title: "图片被屏蔽",
                        code: '/* 很多邮件客户端默认屏蔽图片 */\n\n<!-- 提供有意义的alt -->\n<img src="logo.png" \n     alt="公司Logo - 点击查看图片">\n\n<!-- 重要内容不用图片 -->\n<!-- ❌ 不好：纯图片 -->\n<img src="button.png" alt="点击购买">\n\n<!-- ✅ 好：HTML+CSS -->\n<table>\n  <tr>\n    <td style="background-color: #007bff; padding: 12px 24px;">\n      <a href="#" style="color: #fff; text-decoration: none;">\n        点击购买\n      </a>\n    </td>\n  </tr>\n</table>',
                        content: "应对图片屏蔽。"
                    },
                    {
                        title: "优化建议",
                        code: '/* 图片优化 */\n\n1. 文件大小\n   - 压缩图片\n   - 使用合适的格式（JPG/PNG）\n   - 总大小控制在100KB以内\n\n2. 尺寸\n   - 最大宽度600px\n   - 使用2倍图适配高清屏\n   - 设置max-width: 100%\n\n3. CDN\n   - 使用可靠的CDN\n   - HTTPS协议\n   - 永久链接\n\n<!-- 高清屏适配 -->\n<img src="image@2x.jpg" \n     width="300" \n     height="200"\n     style="max-width: 100%; height: auto;">',
                        content: "图片优化技巧。"
                    }
                ]
            },
            source: "Email Images"
        },
        {
            difficulty: "hard",
            tags: ["按钮", "链接"],
            question: "如何在邮件中创建兼容性好的按钮？",
            type: "single-choice",
            options: [
                "使用表格模拟按钮",
                "使用button标签",
                "使用div+a标签",
                "使用图片"
            ],
            correctAnswer: "A",
            explanation: {
                title: "邮件按钮",
                description: "创建跨客户端的按钮。",
                sections: [
                    {
                        title: "表格按钮",
                        code: '<!-- 基本按钮 -->\n<table border="0" cellpadding="0" cellspacing="0">\n  <tr>\n    <td style="background-color: #007bff; \n                border-radius: 4px; \n                text-align: center;">\n      <a href="https://example.com" \n         style="display: inline-block;\n                padding: 12px 24px;\n                color: #ffffff;\n                text-decoration: none;\n                font-size: 16px;\n                font-weight: bold;">\n        点击按钮\n      </a>\n    </td>\n  </tr>\n</table>',
                        content: "最兼容的按钮方案。"
                    },
                    {
                        title: "Outlook按钮",
                        code: '<!-- Outlook需要VML -->\n<table border="0" cellpadding="0" cellspacing="0">\n  <tr>\n    <td align="center" bgcolor="#007bff" style="border-radius: 4px;">\n      <!--[if mso]>\n      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" \n                   xmlns:w="urn:schemas-microsoft-com:office:word" \n                   href="https://example.com" \n                   style="height:40px;v-text-anchor:middle;width:200px;" \n                   arcsize="10%" \n                   strokecolor="#007bff" \n                   fillcolor="#007bff">\n        <w:anchorlock/>\n        <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">\n          点击按钮\n        </center>\n      </v:roundrect>\n      <![endif]-->\n      \n      <!--[if !mso]><!-->\n      <a href="https://example.com"\n         style="display: inline-block;\n                padding: 12px 24px;\n                color: #ffffff;\n                text-decoration: none;\n                font-size: 16px;\n                font-weight: bold;">\n        点击按钮\n      </a>\n      <!--<![endif]-->\n    </td>\n  </tr>\n</table>',
                        content: "兼容Outlook的按钮。"
                    },
                    {
                        title: "按钮样式",
                        code: '/* 常见按钮样式 */\n\n<!-- 主按钮 -->\n<td style="background-color: #007bff; border-radius: 4px;">\n  <a href="#" style="color: #fff; padding: 12px 24px; display: inline-block;">\n    主要操作\n  </a>\n</td>\n\n<!-- 次要按钮 -->\n<td style="border: 2px solid #007bff; border-radius: 4px;">\n  <a href="#" style="color: #007bff; padding: 12px 24px; display: inline-block;">\n    次要操作\n  </a>\n</td>\n\n<!-- 全宽按钮 -->\n<table width="100%">\n  <tr>\n    <td align="center" style="background-color: #007bff; border-radius: 4px;">\n      <a href="#" style="color: #fff; padding: 12px 0; display: block;">\n        全宽按钮\n      </a>\n    </td>\n  </tr>\n</table>',
                        content: "不同风格的按钮。"
                    }
                ]
            },
            source: "Email Buttons"
        },
        {
            difficulty: "medium",
            tags: ["字体", "样式"],
            question: "邮件HTML中如何设置字体？",
            type: "multiple-choice",
            options: [
                "使用系统字体",
                "font-family堆栈",
                "避免使用Web字体",
                "设置font-size"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "邮件字体",
                description: "设置兼容的字体样式。",
                sections: [
                    {
                        title: "安全字体",
                        code: '/* 推荐的字体堆栈 */\n\n/* 西文 */\nfont-family: Arial, Helvetica, sans-serif;\nfont-family: "Trebuchet MS", "Lucida Grande", sans-serif;\nfont-family: Georgia, Times, serif;\n\n/* 中文 */\nfont-family: "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;\nfont-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;\n\n/* 等宽字体 */\nfont-family: "Courier New", Courier, monospace;',
                        content: "使用系统字体最安全。"
                    },
                    {
                        title: "字体大小",
                        code: '/* 推荐的字体大小 */\n\nbody {\n  font-size: 14px;  /* 正文 */\n  line-height: 1.5;\n}\n\nh1 { font-size: 24px; }\nh2 { font-size: 20px; }\nh3 { font-size: 18px; }\n\n.small { font-size: 12px; }\n\n/* 注意 */\n- 不要使用rem、em\n- 使用px或pt\n- 移动端最小12px',
                        content: "字体大小建议。"
                    },
                    {
                        title: "Web字体问题",
                        code: '/* Web字体支持差 */\n\n<!-- ❌ 不推荐：Google Fonts -->\n<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">\n\n原因：\n1. Outlook不支持@font-face\n2. Gmail会移除<link>\n3. 增加加载时间\n4. 可能被屏蔽\n\n<!-- ✅ 推荐：系统字体 + 降级 -->\n<td style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif;">',
                        content: "避免使用Web字体。"
                    }
                ]
            },
            source: "Email Typography"
        },
        {
            difficulty: "hard",
            tags: ["暗黑模式", "深色"],
            question: "如何支持邮件的暗黑模式？",
            type: "multiple-choice",
            options: [
                "使用prefers-color-scheme",
                "设置文字颜色",
                "避免纯黑纯白",
                "测试各客户端"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "邮件暗黑模式",
                description: "适配暗黑模式的邮件。",
                sections: [
                    {
                        title: "媒体查询",
                        code: '<style>\n  /* 默认亮色模式 */\n  .content {\n    background-color: #ffffff;\n    color: #000000;\n  }\n  \n  /* 暗黑模式 */\n  @media (prefers-color-scheme: dark) {\n    .content {\n      background-color: #1a1a1a !important;\n      color: #ffffff !important;\n    }\n    \n    .light-only {\n      display: none !important;\n    }\n    \n    .dark-only {\n      display: block !important;\n    }\n  }\n</style>',
                        content: "使用CSS媒体查询。"
                    },
                    {
                        title: "颜色选择",
                        code: '/* 暗黑模式颜色建议 */\n\n<!-- ❌ 避免纯黑纯白 -->\nbackground: #000000;\ncolor: #ffffff;\n\n<!-- ✅ 使用柔和的颜色 -->\nbackground: #1a1a1a;  /* 深灰而非纯黑 */\ncolor: #e0e0e0;       /* 浅灰而非纯白 */\n\n/* 保持对比度 */\n- 文字与背景对比度至少4.5:1\n- 链接颜色在暗黑模式下调整\n- 边框颜色也要调整',
                        content: "选择合适的颜色。"
                    },
                    {
                        title: "透明度处理",
                        code: '/* 使用meta标签控制 */\n<meta name="color-scheme" content="light dark">\n<meta name="supported-color-schemes" content="light dark">\n\n/* 防止自动反色 */\n<style>\n  /* iOS Mail会自动反色 */\n  .no-dark-mode {\n    color-scheme: only light;\n  }\n</style>\n\n<!-- 图片在暗黑模式下调整 -->\n<img src="logo.png" \n     style="mix-blend-mode: multiply;"  <!-- 在暗黑模式下变暗 -->\n     alt="Logo">',
                        content: "处理自动反色。"
                    },
                    {
                        title: "测试",
                        code: '/* 需要测试的客户端 */\n\n1. iOS Mail (暗黑模式支持最好)\n2. macOS Mail\n3. Gmail (部分支持)\n4. Outlook (不支持)\n\n/* 测试要点 */\n- 文字可读性\n- 图片显示\n- 按钮对比度\n- Logo是否需要暗黑版本',
                        content: "全面测试。"
                    }
                ]
            },
            source: "Dark Mode Email"
        },
        {
            difficulty: "medium",
            tags: ["测试", "工具"],
            question: "如何测试邮件HTML的兼容性？",
            type: "multiple-choice",
            options: [
                "使用Litmus",
                "Email on Acid",
                "真实设备测试",
                "发送测试邮件"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "邮件测试",
                description: "测试邮件在各客户端的显示。",
                sections: [
                    {
                        title: "在线测试工具",
                        code: '/* Litmus */\nhttps://litmus.com\n- 截图测试\n- 支持70+客户端\n- 代码分析\n- 垃圾邮件检测\n\n/* Email on Acid */\nhttps://www.emailonacid.com\n- 邮件预览\n- 多客户端测试\n- 无障碍检查\n\n/* Mail Tester */\nhttps://www.mail-tester.com\n- 垃圾邮件评分\n- SPF/DKIM检查\n- 免费',
                        content: "专业测试服务。"
                    },
                    {
                        title: "必测客户端",
                        code: '/* 桌面客户端 */\n- Outlook 2016/2019 (Windows)\n- Apple Mail (macOS)\n- Thunderbird\n\n/* Web邮箱 */\n- Gmail (Chrome/Safari)\n- Outlook.com\n- Yahoo Mail\n\n/* 移动端 */\n- iOS Mail (iPhone/iPad)\n- Gmail App (iOS/Android)\n- Outlook App\n\n/* 市场份额 */\niPhone: 35%\nGmail: 30%\nOutlook: 10%\nApple Mail: 10%',
                        content: "优先测试主流客户端。"
                    },
                    {
                        title: "测试检查点",
                        code: '/* 测试清单 */\n\n1. 布局\n   - 宽度是否正确\n   - 响应式是否工作\n   - 两栏是否正常\n\n2. 样式\n   - 颜色是否正确\n   - 字体是否显示\n   - 间距是否合理\n\n3. 图片\n   - 图片是否显示\n   - alt文本是否显示\n   - 尺寸是否正确\n\n4. 链接\n   - 链接是否可点击\n   - 按钮是否正常\n   - 跟踪参数是否正确\n\n5. 其他\n   - 在垃圾箱中测试\n   - 文本版本\n   - 预览文本',
                        content: "全面的测试清单。"
                    }
                ]
            },
            source: "Email Testing"
        },
        {
            difficulty: "easy",
            tags: ["文本版本", "纯文本"],
            question: "为什么邮件需要提供纯文本版本？",
            type: "multiple-choice",
            options: [
                "某些客户端不支持HTML",
                "提高送达率",
                "无障碍访问",
                "用户偏好"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "纯文本版本",
                description: "HTML邮件的纯文本备份。",
                sections: [
                    {
                        title: "为什么需要",
                        code: '/* 纯文本版本的作用 */\n\n1. 兼容性\n   - 某些客户端只支持纯文本\n   - 命令行邮件客户端\n\n2. 垃圾邮件过滤\n   - 只有HTML版本可能被标记为垃圾邮件\n   - 同时提供两个版本提高送达率\n\n3. 用户偏好\n   - 部分用户禁用HTML\n   - 节省流量\n\n4. 无障碍\n   - 屏幕阅读器\n   - 盲人用户',
                        content: "多个重要原因。"
                    },
                    {
                        title: "如何创建",
                        code: '/* 邮件结构（MIME）*/\n\nContent-Type: multipart/alternative;\n\n--boundary\nContent-Type: text/plain; charset=UTF-8\n\n这是纯文本版本\n查看完整版本: https://example.com/view\n\n--boundary\nContent-Type: text/html; charset=UTF-8\n\n<html>\n  <body>\n    这是HTML版本\n  </body>\n</html>\n--boundary--',
                        content: "同时发送两个版本。"
                    },
                    {
                        title: "纯文本编写",
                        code: '/* 纯文本最佳实践 */\n\n主题：重要通知\n\n========================================\n\n亲爱的用户：\n\n这是一封重要通知邮件。\n\n查看详情：\nhttps://example.com/detail?id=123\n\n联系我们：\n电话：400-123-4567\n邮箱：support@example.com\n\n========================================\n公司名称\nhttps://example.com\n\n取消订阅：\nhttps://example.com/unsubscribe?id=123',
                        content: "纯文本编写示例。"
                    }
                ]
            },
            source: "Plain Text Email"
        },
        {
            difficulty: "hard",
            tags: ["垃圾邮件", "送达率"],
            question: "如何提高邮件的送达率，避免进入垃圾箱？",
            type: "multiple-choice",
            options: [
                "配置SPF和DKIM",
                "避免垃圾词汇",
                "平衡图片和文字",
                "提供退订链接"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "提高送达率",
                description: "避免邮件被标记为垃圾邮件。",
                sections: [
                    {
                        title: "技术配置",
                        code: '/* 1. SPF记录 */\nv=spf1 include:_spf.example.com ~all\n\n/* 2. DKIM签名 */\n- 域名密钥验证\n- 证明邮件未被篡改\n\n/* 3. DMARC */\nv=DMARC1; p=quarantine; rua=mailto:dmarc@example.com\n\n/* 4. 验证域名 */\n- 使用验证过的发件域名\n- 不要用免费邮箱发送营销邮件',
                        content: "配置邮件验证。"
                    },
                    {
                        title: "内容优化",
                        code: '/* 避免垃圾词汇 */\n\n❌ 避免:\n- 免费、赚钱、中奖\n- 全大写标题\n- 过多感叹号!!!\n- 点击这里、立即购买\n\n✅ 推荐:\n- 正常语言\n- 清晰的主题\n- 真实的公司信息\n- 明确的发件人\n\n/* 图片文字比例 */\n- 图片不要超过40%\n- 不要纯图片邮件\n- 提供alt文本',
                        content: "优化邮件内容。"
                    },
                    {
                        title: "用户体验",
                        code: '<!-- 必须提供退订链接 -->\n<table width="100%">\n  <tr>\n    <td align="center" style="font-size: 12px; color: #999;">\n      <p>\n        公司名称 | 地址 | 电话\n      </p>\n      <p>\n        <a href="https://example.com/unsubscribe?id=xxx" \n           style="color: #666; text-decoration: underline;">\n          取消订阅\n        </a>\n      </p>\n    </td>\n  </tr>\n</table>\n\n/* 其他建议 */\n- 提供在线查看链接\n- 清晰的发件人名称\n- 合理的发送频率\n- 不要买邮件列表',
                        content: "提供退订选项。"
                    }
                ]
            },
            source: "Email Deliverability"
        }
    ],
    navigation: {
        prev: { title: "打印优化", url: "quiz.html?chapter=34" },
        next: { title: "未来趋势", url: "quiz.html?chapter=36" }
    }
};
