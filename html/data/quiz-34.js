// 第34章：打印优化 - 面试题
window.htmlQuizData_34 = {
    config: {
        title: "打印优化",
        icon: "🖨️",
        description: "测试你对网页打印优化的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "medium",
            tags: ["打印样式", "媒体查询"],
            question: "如何为打印设置专门的CSS样式？",
            type: "multiple-choice",
            options: [
                "使用@media print",
                "单独的打印样式表",
                "link标签media属性",
                "print特定的CSS规则"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "打印样式",
                description: "为打印设置专门的CSS。",
                sections: [
                    {
                        title: "方式1：@media print",
                        code: '/* 在主样式表中 */\n@media print {\n  /* 打印时的样式 */\n  body {\n    font-size: 12pt;\n    color: #000;\n  }\n  \n  /* 隐藏不需要打印的元素 */\n  .no-print {\n    display: none !important;\n  }\n  \n  /* 显示打印专用内容 */\n  .print-only {\n    display: block;\n  }\n}',
                        content: "在现有样式表中使用媒体查询。"
                    },
                    {
                        title: "方式2：单独样式表",
                        code: '<!-- 链接打印样式表 -->\n<link rel="stylesheet" href="print.css" media="print">\n\n/* print.css */\nbody {\n  font-size: 12pt;\n  line-height: 1.5;\n  color: #000;\n  background: #fff;\n}\n\n.header, .footer, .sidebar, .ad {\n  display: none;\n}\n\na[href]:after {\n  content: " (" attr(href) ")";\n}',
                        content: "使用专门的打印样式表。"
                    },
                    {
                        title: "方式3：media属性",
                        code: '<!-- 屏幕样式 -->\n<link rel="stylesheet" href="screen.css" media="screen">\n\n<!-- 打印样式 -->\n<link rel="stylesheet" href="print.css" media="print">\n\n<!-- 所有媒体 -->\n<link rel="stylesheet" href="common.css" media="all">',
                        content: "通过link标签的media属性。"
                    },
                    {
                        title: "打印单位",
                        code: '/* 打印推荐使用物理单位 */\n\n/* 推荐 */\nbody {\n  font-size: 12pt;    /* 点 */\n  margin: 1in;        /* 英寸 */\n  line-height: 1.5cm; /* 厘米 */\n}\n\n/* 不推荐 */\nbody {\n  font-size: 16px;  /* 像素（屏幕单位）*/\n}\n\n/* 单位换算 */\n1in = 2.54cm = 96px = 72pt\n1cm = 10mm = 0.39in\n1pt = 1/72in',
                        content: "使用物理单位更精确。"
                    }
                ]
            },
            source: "CSS打印"
        },
        {
            difficulty: "easy",
            tags: ["分页", "page-break"],
            question: "如何控制打印时的分页？",
            type: "multiple-choice",
            options: [
                "page-break-before",
                "page-break-after",
                "page-break-inside",
                "break-*属性"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "打印分页控制",
                description: "控制元素在打印时的分页行为。",
                sections: [
                    {
                        title: "page-break属性",
                        code: '/* 强制前面分页 */\n.chapter {\n  page-break-before: always;\n}\n\n/* 强制后面分页 */\n.section {\n  page-break-after: always;\n}\n\n/* 避免内部分页 */\n.table {\n  page-break-inside: avoid;\n}\n\n/* 属性值 */\nauto    - 自动（默认）\nalways  - 总是分页\navoid   - 避免分页\nleft    - 在左页分页\nright   - 在右页分页',
                        content: "传统分页属性。"
                    },
                    {
                        title: "break属性（新）",
                        code: '/* CSS3新标准 */\n\n/* 替代page-break-before */\n.chapter {\n  break-before: page;\n}\n\n/* 替代page-break-after */\n.section {\n  break-after: page;\n}\n\n/* 替代page-break-inside */\n.table {\n  break-inside: avoid;\n}\n\n/* 属性值 */\nauto    - 自动\navoid   - 避免\npage    - 分页\ncolumn  - 分栏\nregion  - 分区',
                        content: "现代分页属性。"
                    },
                    {
                        title: "实际应用",
                        code: '/* 章节总是新页开始 */\nh1 {\n  page-break-before: always;\n  break-before: page;\n}\n\n/* 避免标题孤立在页底 */\nh2, h3 {\n  page-break-after: avoid;\n  break-after: avoid;\n}\n\n/* 保持表格完整 */\ntable {\n  page-break-inside: avoid;\n  break-inside: avoid;\n}\n\n/* 保持图片和标题在一起 */\nfigure {\n  page-break-inside: avoid;\n  break-inside: avoid;\n}\n\n/* 代码块不分页 */\npre, code {\n  page-break-inside: avoid;\n  break-inside: avoid;\n  white-space: pre-wrap;\n}',
                        content: "常见分页场景。"
                    }
                ]
            },
            source: "CSS Paged Media"
        },
        {
            difficulty: "medium",
            tags: ["隐藏元素", "优化"],
            question: "打印时应该隐藏哪些元素？",
            type: "multiple-choice",
            options: [
                "导航栏和侧边栏",
                "广告和视频",
                "表单和按钮",
                "非必要的装饰"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "隐藏非打印元素",
                description: "优化打印内容，节省纸张和墨水。",
                sections: [
                    {
                        title: "常见隐藏元素",
                        code: '@media print {\n  /* 导航和菜单 */\n  nav, .navbar, .menu, .sidebar {\n    display: none;\n  }\n  \n  /* 页眉页脚 */\n  header, footer {\n    display: none;\n  }\n  \n  /* 广告和视频 */\n  .ad, .advertisement, video, iframe {\n    display: none;\n  }\n  \n  /* 表单元素 */\n  form, button, input, select, textarea {\n    display: none;\n  }\n  \n  /* 背景图片 */\n  * {\n    background-image: none !important;\n  }\n  \n  /* 阴影和圆角（节省墨水）*/\n  * {\n    box-shadow: none !important;\n    text-shadow: none !important;\n  }\n}',
                        content: "隐藏不必要的元素。"
                    },
                    {
                        title: "显示打印专用内容",
                        code: '/* 屏幕上隐藏 */\n.print-only {\n  display: none;\n}\n\n/* 打印时显示 */\n@media print {\n  .print-only {\n    display: block;\n  }\n}\n\n<!-- HTML -->\n<div class="print-only">\n  <p>打印时间: <script>document.write(new Date())</script></p>\n  <p>打印人: ________</p>\n</div>',
                        content: "显示打印专用信息。"
                    },
                    {
                        title: "工具类",
                        code: '/* Bootstrap风格的工具类 */\n.d-print-none {\n  display: none !important;\n}\n\n.d-print-block {\n  display: block !important;\n}\n\n.d-print-inline {\n  display: inline !important;\n}\n\n.d-print-inline-block {\n  display: inline-block !important;\n}\n\n@media print {\n  .d-print-none {\n    display: none !important;\n  }\n  \n  .d-print-block {\n    display: block !important;\n  }\n  \n  .d-print-inline {\n    display: inline !important;\n  }\n  \n  .d-print-inline-block {\n    display: inline-block !important;\n  }\n}\n\n<!-- 使用 -->\n<nav class="d-print-none">导航栏</nav>\n<div class="d-print-block">打印内容</div>',
                        content: "使用工具类控制显示。"
                    }
                ]
            },
            source: "打印优化"
        },
        {
            difficulty: "hard",
            tags: ["链接", "URL"],
            question: "如何在打印时显示链接的URL？",
            type: "single-choice",
            options: [
                "使用::after和attr()显示href",
                "JavaScript替换链接文本",
                "使用title属性",
                "无法实现"
            ],
            correctAnswer: "A",
            explanation: {
                title: "显示链接URL",
                description: "打印时显示链接地址。",
                sections: [
                    {
                        title: "基本方案",
                        code: '@media print {\n  /* 在链接后显示URL */\n  a[href]:after {\n    content: " (" attr(href) ")";\n  }\n}\n\n<!-- 效果 -->\n访问 <a href="https://example.com">官网</a>\n打印后：访问 官网 (https://example.com)',
                        content: "使用CSS显示URL。"
                    },
                    {
                        title: "优化方案",
                        code: '@media print {\n  /* 只显示外部链接 */\n  a[href^="http"]:after {\n    content: " (" attr(href) ")";\n  }\n  \n  /* 排除内部锚点 */\n  a[href^="#"]:after {\n    content: "";\n  }\n  \n  /* 排除JavaScript链接 */\n  a[href^="javascript:"]:after {\n    content: "";\n  }\n  \n  /* 排除邮箱链接 */\n  a[href^="mailto:"]:after {\n    content: " (" attr(href) ")";\n  }\n  \n  /* 缩写过长的URL */\n  a[href]:after {\n    word-wrap: break-word;\n    word-break: break-all;\n  }\n}',
                        content: "更精细的控制。"
                    },
                    {
                        title: "完整示例",
                        code: '@media print {\n  /* 外部链接显示完整URL */\n  a[href^="http"]:not([href*="yourdomain.com"]):after {\n    content: " (" attr(href) ")";\n    font-size: 0.8em;\n    color: #666;\n  }\n  \n  /* 邮箱链接 */\n  a[href^="mailto:"]:after {\n    content: " (" attr(href) ")";\n  }\n  \n  /* 电话链接 */\n  a[href^="tel:"]:after {\n    content: " (" attr(href) ")";\n  }\n  \n  /* 内部链接不显示 */\n  a[href^="/"]:after,\n  a[href^="#"]:after {\n    content: "";\n  }\n  \n  /* 图片链接不显示 */\n  a img:after {\n    content: "";\n  }\n}',
                        content: "完整的链接处理方案。"
                    }
                ]
            },
            source: "CSS Generated Content"
        },
        {
            difficulty: "medium",
            tags: ["@page", "页面设置"],
            question: "@page规则的作用？",
            type: "multiple-choice",
            options: [
                "设置页面尺寸",
                "设置页边距",
                "设置页眉页脚",
                "设置页面方向"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "@page规则",
                description: "控制打印页面的布局。",
                sections: [
                    {
                        title: "基本用法",
                        code: '@page {\n  /* 页面尺寸 */\n  size: A4;        /* A4, A3, letter, legal */\n  size: portrait;  /* 竖向 */\n  size: landscape; /* 横向 */\n  \n  /* 页边距 */\n  margin: 2cm;\n  margin: 2cm 3cm;  /* 上下 左右 */\n  margin: 2cm 3cm 2cm 3cm;  /* 上 右 下 左 */\n}\n\n/* 指定尺寸 */\n@page {\n  size: 210mm 297mm;  /* 宽 高 */\n}',
                        content: "设置页面尺寸和边距。"
                    },
                    {
                        title: "不同页面规则",
                        code: '/* 首页 */\n@page :first {\n  margin-top: 5cm;\n}\n\n/* 左页（偶数页）*/\n@page :left {\n  margin-left: 3cm;\n  margin-right: 2cm;\n}\n\n/* 右页（奇数页）*/\n@page :right {\n  margin-left: 2cm;\n  margin-right: 3cm;\n}\n\n/* 空白页 */\n@page :blank {\n  /* 空白页的样式 */\n}',
                        content: "针对不同页面设置。"
                    },
                    {
                        title: "页眉页脚",
                        code: '/* 页眉页脚（实验性）*/\n@page {\n  @top-center {\n    content: "公司名称";\n  }\n  \n  @bottom-right {\n    content: "第 " counter(page) " 页";\n  }\n  \n  @bottom-left {\n    content: "机密文件";\n  }\n}\n\n/* 页码计数器 */\nbody {\n  counter-reset: page;\n}\n\n@page {\n  @bottom-center {\n    content: counter(page);\n  }\n}',
                        content: "添加页眉页脚（支持有限）。"
                    },
                    {
                        title: "命名页面",
                        code: '/* 定义命名页面 */\n@page cover {\n  size: A4 landscape;\n  margin: 0;\n}\n\n@page content {\n  size: A4 portrait;\n  margin: 2cm;\n}\n\n/* 应用到元素 */\n.cover-page {\n  page: cover;\n}\n\n.content-page {\n  page: content;\n}',
                        content: "使用命名页面。"
                    }
                ]
            },
            source: "CSS Paged Media"
        },
        {
            difficulty: "easy",
            tags: ["颜色", "背景"],
            question: "打印时如何处理颜色和背景？",
            type: "multiple-choice",
            options: [
                "移除背景图片",
                "转换为黑白",
                "调整颜色对比度",
                "保留重要背景色"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "颜色和背景优化",
                description: "优化打印效果和节省墨水。",
                sections: [
                    {
                        title: "移除背景",
                        code: '@media print {\n  /* 移除所有背景图片 */\n  * {\n    background-image: none !important;\n  }\n  \n  /* 移除背景色 */\n  * {\n    background-color: transparent !important;\n  }\n  \n  /* 设置白色背景 */\n  body {\n    background: #fff;\n  }\n}',
                        content: "移除装饰性背景。"
                    },
                    {
                        title: "调整颜色",
                        code: '@media print {\n  /* 文字改为黑色 */\n  body {\n    color: #000;\n  }\n  \n  /* 链接改为黑色 */\n  a {\n    color: #000;\n    text-decoration: underline;\n  }\n  \n  /* 保留语义颜色（可选）*/\n  .error {\n    color: #000;\n    border: 2px solid #000;\n  }\n  \n  .warning {\n    color: #000;\n    border: 1px dashed #000;\n  }\n}',
                        content: "转换为黑白。"
                    },
                    {
                        title: "保留重要背景",
                        code: '@media print {\n  /* 默认移除背景 */\n  * {\n    background: none !important;\n  }\n  \n  /* 保留重要的背景色 */\n  .highlight {\n    background: #f0f0f0 !important;\n    -webkit-print-color-adjust: exact;\n    print-color-adjust: exact;\n  }\n  \n  /* 表格斑马纹 */\n  tr:nth-child(even) {\n    background: #f9f9f9 !important;\n    -webkit-print-color-adjust: exact;\n  }\n}',
                        content: "保留必要的背景。"
                    },
                    {
                        title: "print-color-adjust",
                        code: '/* 强制打印颜色 */\n.important-color {\n  background: #ffeb3b;\n  -webkit-print-color-adjust: exact;\n  print-color-adjust: exact;\n}\n\n/* 属性值 */\neconomy  - 节省墨水（默认）\nexact    - 精确打印颜色',
                        content: "控制颜色打印。"
                    }
                ]
            },
            source: "打印优化"
        },
        {
            difficulty: "medium",
            tags: ["表格", "优化"],
            question: "如何优化表格的打印效果？",
            type: "multiple-choice",
            options: [
                "重复表头",
                "避免分页",
                "调整宽度",
                "简化样式"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "表格打印优化",
                description: "优化表格的打印显示。",
                sections: [
                    {
                        title: "重复表头",
                        code: '/* 使用thead */\n<table>\n  <thead>\n    <tr>\n      <th>姓名</th>\n      <th>年龄</th>\n      <th>邮箱</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>张三</td>\n      <td>25</td>\n      <td>zhang@example.com</td>\n    </tr>\n  </tbody>\n</table>\n\n/* CSS */\n@media print {\n  thead {\n    display: table-header-group;\n  }\n  \n  tfoot {\n    display: table-footer-group;\n  }\n}',
                        content: "每页重复表头。"
                    },
                    {
                        title: "避免分页",
                        code: '@media print {\n  /* 保持表格完整 */\n  table {\n    page-break-inside: avoid;\n  }\n  \n  /* 保持行完整 */\n  tr {\n    page-break-inside: avoid;\n  }\n  \n  /* 如果表格太长 */\n  table.long-table {\n    page-break-inside: auto;\n  }\n  \n  table.long-table tr {\n    page-break-inside: avoid;\n  }\n}',
                        content: "控制表格分页。"
                    },
                    {
                        title: "调整样式",
                        code: '@media print {\n  table {\n    width: 100%;\n    border-collapse: collapse;\n  }\n  \n  th, td {\n    border: 1px solid #000;\n    padding: 8px;\n    font-size: 10pt;\n  }\n  \n  /* 简化样式 */\n  table {\n    box-shadow: none;\n  }\n  \n  /* 斑马纹 */\n  tr:nth-child(even) {\n    background: #f9f9f9;\n    -webkit-print-color-adjust: exact;\n  }\n}',
                        content: "优化表格样式。"
                    }
                ]
            },
            source: "表格打印"
        },
        {
            difficulty: "hard",
            tags: ["JavaScript", "window.print"],
            question: "如何通过JavaScript控制打印？",
            type: "multiple-choice",
            options: [
                "window.print()触发打印",
                "beforeprint事件",
                "afterprint事件",
                "打印特定元素"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "JavaScript打印控制",
                description: "使用JavaScript增强打印功能。",
                sections: [
                    {
                        title: "触发打印",
                        code: '/* 打印按钮 */\n<button onclick="window.print()">打印</button>\n\n/* 或 */\nconst printBtn = document.getElementById("print-btn");\nprintBtn.addEventListener("click", () => {\n  window.print();\n});\n\n/* 快捷键 */\ndocument.addEventListener("keydown", (e) => {\n  if (e.ctrlKey && e.key === "p") {\n    e.preventDefault();\n    window.print();\n  }\n});',
                        content: "触发打印对话框。"
                    },
                    {
                        title: "打印事件",
                        code: '/* beforeprint - 打印前 */\nwindow.addEventListener("beforeprint", () => {\n  console.log("准备打印");\n  \n  // 显示打印专用内容\n  document.body.classList.add("printing");\n  \n  // 展开所有折叠内容\n  const collapsed = document.querySelectorAll(".collapsed");\n  collapsed.forEach(el => el.classList.remove("collapsed"));\n});\n\n/* afterprint - 打印后 */\nwindow.addEventListener("afterprint", () => {\n  console.log("打印完成");\n  \n  // 恢复原状\n  document.body.classList.remove("printing");\n});\n\n/* 使用matchMedia */\nconst printMedia = window.matchMedia("print");\n\nprintMedia.addEventListener("change", (e) => {\n  if (e.matches) {\n    console.log("进入打印模式");\n  } else {\n    console.log("退出打印模式");\n  }\n});',
                        content: "监听打印事件。"
                    },
                    {
                        title: "打印特定元素",
                        code: '/* 打印指定内容 */\nfunction printElement(elementId) {\n  const element = document.getElementById(elementId);\n  const printWindow = window.open("", "_blank");\n  \n  printWindow.document.write(`\n    <!DOCTYPE html>\n    <html>\n    <head>\n      <title>打印</title>\n      <link rel="stylesheet" href="print.css">\n    </head>\n    <body>\n      ${element.innerHTML}\n    </body>\n    </html>\n  `);\n  \n  printWindow.document.close();\n  printWindow.focus();\n  \n  setTimeout(() => {\n    printWindow.print();\n    printWindow.close();\n  }, 250);\n}\n\n/* 使用 */\n<button onclick="printElement(\'content\')">打印内容</button>\n<div id="content">\n  <!-- 要打印的内容 -->\n</div>',
                        content: "只打印部分内容。"
                    },
                    {
                        title: "生成PDF",
                        code: '/* 使用库生成PDF */\n\n// jsPDF\nimport jsPDF from "jspdf";\n\nfunction generatePDF() {\n  const doc = new jsPDF();\n  \n  doc.text("Hello world!", 10, 10);\n  doc.save("document.pdf");\n}\n\n// html2canvas + jsPDF\nimport html2canvas from "html2canvas";\nimport jsPDF from "jspdf";\n\nasync function exportPDF() {\n  const element = document.getElementById("content");\n  const canvas = await html2canvas(element);\n  \n  const imgData = canvas.toDataURL("image/png");\n  const pdf = new jsPDF();\n  \n  pdf.addImage(imgData, "PNG", 0, 0);\n  pdf.save("download.pdf");\n}',
                        content: "生成PDF文件。"
                    }
                ]
            },
            source: "JavaScript打印"
        },
        {
            difficulty: "medium",
            tags: ["图片", "优化"],
            question: "打印时如何优化图片？",
            type: "multiple-choice",
            options: [
                "调整图片尺寸",
                "使用高分辨率图片",
                "转换为灰度",
                "避免图片分页"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "图片打印优化",
                description: "优化图片的打印效果。",
                sections: [
                    {
                        title: "调整尺寸",
                        code: '@media print {\n  img {\n    max-width: 100%;\n    height: auto;\n    page-break-inside: avoid;\n  }\n  \n  /* 大图片适配页面 */\n  img.large {\n    max-width: 100%;\n    max-height: 80vh;\n  }\n  \n  /* 小图标隐藏 */\n  img.icon {\n    display: none;\n  }\n}',
                        content: "调整图片大小。"
                    },
                    {
                        title: "高分辨率",
                        code: '<!-- 提供打印用高清图 -->\n<img src="image.jpg" \n     data-print-src="image-hires.jpg" \n     alt="图片">\n\n<script>\nwindow.addEventListener("beforeprint", () => {\n  const images = document.querySelectorAll("img[data-print-src]");\n  images.forEach(img => {\n    img.dataset.originalSrc = img.src;\n    img.src = img.dataset.printSrc;\n  });\n});\n\nwindow.addEventListener("afterprint", () => {\n  const images = document.querySelectorAll("img[data-original-src]");\n  images.forEach(img => {\n    img.src = img.dataset.originalSrc;\n  });\n});\n</script>',
                        content: "打印时使用高清图。"
                    },
                    {
                        title: "避免分页",
                        code: '@media print {\n  /* 图片不分页 */\n  img {\n    page-break-inside: avoid;\n    page-break-after: auto;\n  }\n  \n  /* 图片和标题保持一起 */\n  figure {\n    page-break-inside: avoid;\n  }\n  \n  figcaption {\n    page-break-before: avoid;\n  }\n}',
                        content: "保持图片完整。"
                    }
                ]
            },
            source: "打印优化"
        },
        {
            difficulty: "easy",
            tags: ["测试", "预览"],
            question: "如何测试打印样式？",
            type: "multiple-choice",
            options: [
                "浏览器打印预览",
                "DevTools模拟打印",
                "使用打印样式表",
                "实际打印测试"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "打印样式测试",
                description: "测试和调试打印样式。",
                sections: [
                    {
                        title: "浏览器预览",
                        code: '/* 1. 打开打印预览 */\nCtrl + P (Windows)\nCmd + P (Mac)\n\n/* 2. 查看效果 */\n- 检查分页\n- 检查隐藏元素\n- 检查样式\n- 调整设置',
                        content: "使用浏览器打印预览。"
                    },
                    {
                        title: "DevTools模拟",
                        code: '/* Chrome DevTools */\n1. F12打开开发者工具\n2. Ctrl + Shift + P\n3. 输入"Show Rendering"\n4. 勾选"Emulate CSS media type"\n5. 选择"print"\n\n/* 或 */\n1. 打开打印预览\n2. F12打开开发者工具\n3. 在打印预览状态下调试',
                        content: "使用开发者工具模拟。"
                    },
                    {
                        title: "实时预览",
                        code: '/* 添加切换按钮 */\n<button onclick="togglePrintMode()">切换打印模式</button>\n\n<script>\nfunction togglePrintMode() {\n  document.body.classList.toggle("print-preview");\n}\n</script>\n\n<style>\n/* 打印样式 */\n@media print {\n  .no-print { display: none; }\n}\n\n/* 预览模式使用相同样式 */\n.print-preview .no-print {\n  display: none;\n}\n</style>',
                        content: "实时切换预览。"
                    }
                ]
            },
            source: "测试工具"
        }
    ],
    navigation: {
        prev: { title: "设备适配", url: "quiz.html?chapter=33" },
        next: { title: "邮件HTML", url: "quiz.html?chapter=35" }
    }
};
