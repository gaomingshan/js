// 第6章：链接与导航 - 面试题
window.htmlQuizData_06 = {
    config: {
        title: "链接与导航",
        icon: "🔗",
        description: "测试你对HTML链接标签的掌握",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["链接", "基础"],
            question: "<a>标签的href属性可以接受哪些类型的URL？",
            type: "multiple-choice",
            options: [
                "绝对URL（https://example.com）",
                "相对URL（/page.html）",
                "锚点链接（#section）",
                "协议URL（mailto:、tel:）"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "href属性的URL类型",
                description: "href可以接受多种格式的URL。",
                sections: [
                    {
                        title: "绝对URL",
                        code: '<a href="https://example.com">外部链接</a>\n<a href="http://example.com/page.html">完整URL</a>',
                        points: [
                            "包含协议和域名",
                            "指向外部网站",
                            "跨域链接"
                        ]
                    },
                    {
                        title: "相对URL",
                        code: '<a href="/about.html">根路径</a>\n<a href="./page.html">相对路径</a>\n<a href="../parent/page.html">父目录</a>',
                        points: [
                            "/开头：从网站根目录开始",
                            "./开头：从当前目录开始",
                            "../：返回上级目录"
                        ]
                    },
                    {
                        title: "锚点链接",
                        code: '<a href="#section1">跳转到section1</a>\n<a href="page.html#section2">其他页面的锚点</a>\n\n<div id="section1">目标区域</div>',
                        points: [
                            "#id：跳转到页面内元素",
                            "可以跨页面使用",
                            "平滑滚动：CSS scroll-behavior"
                        ]
                    },
                    {
                        title: "协议URL",
                        code: '<a href="mailto:info@example.com">发邮件</a>\n<a href="tel:+8613800138000">打电话</a>\n<a href="sms:+8613800138000">发短信</a>\n<a href="javascript:void(0)">JavaScript（不推荐）</a>',
                        content: "不同协议触发不同的系统行为。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["target属性", "安全"],
            question: "target='_blank'有什么安全问题？如何解决？",
            options: [
                "可能导致窗口对象被篡改",
                "使用rel='noopener'防护",
                "使用rel='noreferrer'隐藏来源",
                "没有安全问题"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "target='_blank'安全问题",
                description: "新窗口打开链接存在安全风险。",
                sections: [
                    {
                        title: "安全问题",
                        code: '<!-- 有风险的链接 -->\n<a href="https://malicious.com" target="_blank">点击</a>\n\n<!-- 恶意页面可以：-->\n<script>\n// 访问父窗口\nwindow.opener.location = "https://phishing.com";\n// 篡改原页面\n</script>',
                        points: [
                            "新窗口可以访问window.opener",
                            "可以通过opener修改原页面",
                            "钓鱼攻击风险",
                            "性能问题：共享渲染进程"
                        ]
                    },
                    {
                        title: "解决方案：rel='noopener'",
                        code: '<a href="https://example.com" target="_blank" rel="noopener">安全链接</a>',
                        points: [
                            "阻止新窗口访问window.opener",
                            "window.opener === null",
                            "新窗口独立运行",
                            "现代浏览器默认行为"
                        ]
                    },
                    {
                        title: "rel='noreferrer'",
                        code: '<a href="https://example.com" target="_blank" rel="noreferrer">隐私链接</a>',
                        points: [
                            "包含noopener的效果",
                            "额外：不发送Referer头",
                            "目标网站无法知道来源",
                            "保护用户隐私"
                        ]
                    },
                    {
                        title: "最佳实践",
                        code: '<!-- 推荐：同时使用两个 -->\n<a href="https://example.com" \n   target="_blank" \n   rel="noopener noreferrer">外部链接</a>\n\n<!-- 内部链接不需要 -->\n<a href="/about.html">内部链接</a>',
                        points: [
                            "外部链接：加rel='noopener noreferrer'",
                            "内部链接：不需要",
                            "现代浏览器自动添加noopener",
                            "为兼容性最好显式声明"
                        ]
                    }
                ]
            },
            source: "OWASP"
        },
        {
            difficulty: "medium",
            tags: ["download属性", "功能"],
            question: "download属性的作用是什么？",
            options: [
                "提示浏览器下载而非打开",
                "可以指定下载文件名",
                "只对同源资源有效",
                "可以下载任何URL"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "download属性详解",
                description: "download属性控制链接的下载行为。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<!-- 下载文件 -->\n<a href="document.pdf" download>下载PDF</a>\n\n<!-- 指定文件名 -->\n<a href="file.pdf" download="说明书.pdf">下载</a>',
                        points: [
                            "浏览器会下载而不是打开",
                            "可以自定义下载文件名",
                            "文件名可以包含路径（但浏览器可能忽略）"
                        ]
                    },
                    {
                        title: "同源限制",
                        code: '<!-- 同源：有效 -->\n<a href="/files/document.pdf" download>下载</a>\n\n<!-- 跨域：download被忽略 -->\n<a href="https://other.com/file.pdf" download>下载</a>\n<!-- 浏览器会打开而非下载 -->',
                        points: [
                            "只对同源资源有效",
                            "跨域资源：download属性被忽略",
                            "安全原因：防止强制下载恶意文件"
                        ]
                    },
                    {
                        title: "支持的资源类型",
                        code: '<!-- 文档 -->\n<a href="doc.pdf" download>PDF</a>\n<a href="sheet.xlsx" download>Excel</a>\n\n<!-- 图片 -->\n<a href="image.jpg" download>图片</a>\n\n<!-- 音视频 -->\n<a href="audio.mp3" download>音频</a>\n\n<!-- 文本 -->\n<a href="data.json" download>JSON</a>',
                        content: "任何文件类型都可以使用download属性。"
                    },
                    {
                        title: "Data URLs",
                        code: '// 动态生成文件下载\nconst text = "Hello World";\nconst blob = new Blob([text], { type: "text/plain" });\nconst url = URL.createObjectURL(blob);\n\nconst a = document.createElement("a");\na.href = url;\na.download = "hello.txt";\na.click();\nURL.revokeObjectURL(url);  // 清理',
                        content: "可以用于下载JavaScript生成的内容。"
                    },
                    {
                        title: "注意事项",
                        points: [
                            "浏览器可能忽略文件名中的路径",
                            "用户可以修改文件名",
                            "某些浏览器可能有安全提示",
                            "不适用于跨域资源"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["rel属性", "链接关系"],
            question: "rel属性有哪些常用的值？",
            type: "multiple-choice",
            options: [
                "nofollow - 不传递权重",
                "noopener - 安全防护",
                "canonical - 规范链接",
                "alternate - 替代版本"
            ],
            correctAnswer: ["A", "B", "D"],
            explanation: {
                title: "rel属性详解",
                description: "rel定义当前文档与链接资源的关系。",
                sections: [
                    {
                        title: "nofollow - SEO相关",
                        code: '<a href="https://untrusted.com" rel="nofollow">不信任的链接</a>\n<a href="https://ad.com" rel="nofollow">广告链接</a>',
                        points: [
                            "告诉搜索引擎不要跟踪此链接",
                            "不传递PageRank权重",
                            "用于用户生成内容、付费链接",
                            "Google: 仍会爬取，但不传递权重"
                        ]
                    },
                    {
                        title: "noopener/noreferrer - 安全",
                        code: '<a href="https://external.com" target="_blank" rel="noopener noreferrer">外部链接</a>',
                        points: [
                            "noopener：防止window.opener访问",
                            "noreferrer：不发送Referer头",
                            "提升安全性和隐私"
                        ]
                    },
                    {
                        title: "alternate - 替代版本",
                        code: '<!-- 多语言版本 -->\n<link rel="alternate" hreflang="en" href="/en/">\n<link rel="alternate" hreflang="zh" href="/zh/">\n\n<!-- RSS订阅 -->\n<link rel="alternate" type="application/rss+xml" href="/feed.xml">\n\n<!-- 移动版 -->\n<link rel="alternate" media="only screen and (max-width: 640px)" href="/mobile/">',
                        points: [
                            "指向替代版本",
                            "多语言、RSS、移动版",
                            "帮助搜索引擎发现相关版本"
                        ]
                    },
                    {
                        title: "canonical - 规范URL",
                        code: '<link rel="canonical" href="https://example.com/page/">',
                        points: [
                            "只用于<link>，不用于<a>",
                            "指定页面的规范URL",
                            "解决重复内容问题",
                            "告诉搜索引擎首选版本"
                        ]
                    },
                    {
                        title: "其他常用rel值",
                        code: '<!-- prev/next：分页 -->\n<link rel="prev" href="/page/1">\n<link rel="next" href="/page/3">\n\n<!-- author：作者页面 -->\n<a rel="author" href="/about/author">作者</a>\n\n<!-- bookmark：永久链接 -->\n<a rel="bookmark" href="/post/123">固定链接</a>\n\n<!-- license：许可证 -->\n<a rel="license" href="/license">CC BY 4.0</a>\n\n<!-- tag：标签 -->\n<a rel="tag" href="/tags/html">HTML标签</a>',
                        points: [
                            "prev/next：分页导航",
                            "author：作者信息",
                            "bookmark：永久链接",
                            "license：版权许可",
                            "tag：分类标签"
                        ]
                    },
                    {
                        title: "UGC和Sponsored（新增）",
                        code: '<!-- 用户生成内容 -->\n<a href="comment-link" rel="ugc">用户链接</a>\n\n<!-- 赞助/付费链接 -->\n<a href="sponsor-link" rel="sponsored">赞助商</a>\n\n<!-- 可以组合使用 -->\n<a href="paid-ad" rel="nofollow sponsored">付费广告</a>',
                        points: [
                            "ugc：User Generated Content",
                            "sponsored：付费/赞助链接",
                            "Google 2019年引入",
                            "可以与nofollow组合"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["锚点", "平滑滚动"],
            question: "如何实现平滑滚动到锚点？",
            type: "multiple-choice",
            options: [
                "CSS scroll-behavior: smooth",
                "JavaScript scrollIntoView()",
                "使用第三方库",
                "HTML原生不支持"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "平滑滚动实现",
                description: "多种方式实现平滑滚动效果。",
                sections: [
                    {
                        title: "方案1：CSS scroll-behavior",
                        code: '/* 全局平滑滚动 */\nhtml {\n  scroll-behavior: smooth;\n}\n\n/* 或特定容器 */\n.scroll-container {\n  scroll-behavior: smooth;\n}\n\n<!-- HTML -->\n<a href="#section1">跳转</a>\n<div id="section1">目标</div>',
                        points: [
                            "最简单的方案",
                            "自动应用于所有锚点链接",
                            "浏览器原生支持",
                            "IE不支持"
                        ]
                    },
                    {
                        title: "方案2：scrollIntoView",
                        code: 'document.querySelector("#section1").scrollIntoView({\n  behavior: "smooth",\n  block: "start",\n  inline: "nearest"\n});\n\n// 配合链接使用\ndocument.querySelectorAll(\'a[href^="#"]\').forEach(anchor => {\n  anchor.addEventListener("click", function(e) {\n    e.preventDefault();\n    const target = document.querySelector(this.getAttribute("href"));\n    target.scrollIntoView({ behavior: "smooth" });\n  });\n});',
                        points: [
                            "JavaScript方式",
                            "更多控制选项",
                            "可编程触发",
                            "兼容性好"
                        ]
                    },
                    {
                        title: "方案3：window.scrollTo",
                        code: 'function smoothScrollTo(targetY, duration = 500) {\n  const startY = window.pageYOffset;\n  const diff = targetY - startY;\n  const startTime = performance.now();\n  \n  function step(currentTime) {\n    const elapsed = currentTime - startTime;\n    const progress = Math.min(elapsed / duration, 1);\n    // easeInOutQuad缓动函数\n    const easeProgress = progress < 0.5\n      ? 2 * progress * progress\n      : 1 - Math.pow(-2 * progress + 2, 2) / 2;\n    \n    window.scrollTo(0, startY + diff * easeProgress);\n    \n    if (progress < 1) {\n      requestAnimationFrame(step);\n    }\n  }\n  \n  requestAnimationFrame(step);\n}\n\n// 使用\nconst target = document.querySelector("#section1");\nsmoothScrollTo(target.offsetTop);',
                        content: "完全自定义的动画控制。"
                    },
                    {
                        title: "方案4：第三方库",
                        code: '// SmoothScroll库\nimport SmoothScroll from "smooth-scroll";\nconst scroll = new SmoothScroll(\'a[href*="#"]\', {\n  speed: 800,\n  easing: "easeInOutQuad"\n});\n\n// jQuery (传统)\n$(\'a[href^="#"]\').on("click", function(e) {\n  e.preventDefault();\n  $("html, body").animate({\n    scrollTop: $($(this).attr("href")).offset().top\n  }, 500);\n});',
                        points: [
                            "功能丰富",
                            "跨浏览器兼容",
                            "但增加体积"
                        ]
                    },
                    {
                        title: "带偏移量的滚动",
                        code: '// 考虑固定头部的偏移\nfunction scrollToWithOffset(element, offset = 80) {\n  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;\n  window.scrollTo({\n    top: targetPosition,\n    behavior: "smooth"\n  });\n}\n\n// 或使用scroll-margin-top\n#section1 {\n  scroll-margin-top: 80px;  /* 固定头部高度 */\n}',
                        content: "处理固定头部的情况。"
                    }
                ]
            },
            source: "MDN"
        },
        {
            difficulty: "medium",
            tags: ["邮件链接", "实践"],
            question: "mailto链接可以包含哪些参数？",
            type: "multiple-choice",
            options: [
                "subject - 邮件主题",
                "cc - 抄送",
                "body - 邮件正文",
                "attachment - 附件"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "mailto链接详解",
                description: "mailto可以预填充邮件的多个字段。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<!-- 简单邮件 -->\n<a href="mailto:info@example.com">发送邮件</a>\n\n<!-- 多个收件人 -->\n<a href="mailto:user1@example.com,user2@example.com">发送</a>',
                        content: "最基本的mailto链接。"
                    },
                    {
                        title: "添加主题",
                        code: '<a href="mailto:info@example.com?subject=咨询问题">咨询</a>\n\n<!-- 注意：空格和特殊字符需要URL编码 -->\n<a href="mailto:info@example.com?subject=%E5%92%A8%E8%AF%A2%E9%97%AE%E9%A2%98">咨询</a>',
                        points: [
                            "subject参数设置主题",
                            "使用?开始参数",
                            "中文需要URL编码"
                        ]
                    },
                    {
                        title: "抄送和密送",
                        code: '<!-- 抄送 -->\n<a href="mailto:to@example.com?cc=cc@example.com">抄送</a>\n\n<!-- 密送 -->\n<a href="mailto:to@example.com?bcc=bcc@example.com">密送</a>\n\n<!-- 多个抄送 -->\n<a href="mailto:to@example.com?cc=cc1@example.com,cc2@example.com">多个抄送</a>',
                        points: [
                            "cc：抄送（Carbon Copy）",
                            "bcc：密送（Blind Carbon Copy）",
                            "多个地址用逗号分隔"
                        ]
                    },
                    {
                        title: "邮件正文",
                        code: '<a href="mailto:info@example.com?body=您好，%0A%0A我想咨询...">带正文</a>\n\n<!-- %0A是换行符 -->',
                        points: [
                            "body参数设置正文",
                            "%0A：换行",
                            "%20：空格",
                            "正文会URL编码"
                        ]
                    },
                    {
                        title: "组合参数",
                        code: '<a href="mailto:support@example.com?subject=Bug报告&cc=dev@example.com&body=描述问题：%0A%0A">报告Bug</a>\n\n<!-- 多个参数用&连接 -->',
                        content: "可以组合多个参数，使用&连接。"
                    },
                    {
                        title: "JavaScript动态生成",
                        code: 'function createMailtoLink(to, subject, body) {\n  const params = new URLSearchParams();\n  if (subject) params.append("subject", subject);\n  if (body) params.append("body", body);\n  \n  return `mailto:${to}?${params.toString()}`;\n}\n\n// 使用\nconst link = createMailtoLink(\n  "info@example.com",\n  "咨询",\n  "您好\\n\\n我想了解..."\n);\ndocument.querySelector("a").href = link;',
                        content: "使用URLSearchParams自动处理编码。"
                    },
                    {
                        title: "注意事项",
                        points: [
                            "不能添加附件（安全限制）",
                            "依赖用户本地邮件客户端",
                            "移动设备可能打开邮件app",
                            "部分用户可能没有配置邮件客户端",
                            "考虑提供邮件地址的纯文本显示"
                        ]
                    }
                ]
            },
            source: "RFC 6068"
        },
        {
            difficulty: "medium",
            tags: ["电话链接", "移动端"],
            question: "tel:链接的用法和注意事项是什么？",
            options: [
                "在移动设备上可以直接拨打电话",
                "电话号码格式要规范",
                "桌面浏览器可能无响应",
                "可以添加扩展号码"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "电话链接详解",
                description: "tel:链接让移动设备可以直接拨打电话。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<!-- 基本格式 -->\n<a href="tel:+8613800138000">拨打电话</a>\n\n<!-- 显示格式友好，href规范 -->\n<a href="tel:+8613800138000">138-0013-8000</a>',
                        points: [
                            "移动设备：打开拨号界面",
                            "桌面设备：可能无响应或打开Skype等",
                            "显示文本可以格式化",
                            "href应使用国际格式"
                        ]
                    },
                    {
                        title: "国际格式",
                        code: '<!-- 推荐：国际格式 -->\n<a href="tel:+8613800138000">+86 138 0013 8000</a>\n<a href="tel:+12025551234">+1 (202) 555-1234</a>\n\n<!-- 不推荐：本地格式 -->\n<a href="tel:13800138000">138-0013-8000</a>',
                        points: [
                            "使用+和国家代码",
                            "中国：+86",
                            "美国：+1",
                            "便于国际拨打"
                        ]
                    },
                    {
                        title: "扩展号码",
                        code: '<!-- 分机号 -->\n<a href="tel:+861012345678,8001">拨打（分机8001）</a>\n\n<!-- 使用p表示暂停 -->\n<a href="tel:+861012345678p8001">拨打</a>\n\n<!-- 使用w表示等待 -->\n<a href="tel:+861012345678w8001">拨打</a>',
                        points: [
                            ",或;：立即拨分机号",
                            "p：暂停2秒后拨",
                            "w：等待用户确认",
                            "支持取决于设备"
                        ]
                    },
                    {
                        title: "响应式使用",
                        code: '<!-- 仅移动端显示为链接 -->\n<a href="tel:+8613800138000" class="phone-link">\n  138-0013-8000\n</a>\n\n<style>\n/* 桌面端：普通文本样式 */\n.phone-link {\n  color: inherit;\n  text-decoration: none;\n  pointer-events: none;\n}\n\n/* 移动端：链接样式 */\n@media (max-width: 768px) {\n  .phone-link {\n    color: blue;\n    text-decoration: underline;\n    pointer-events: auto;\n  }\n}\n</style>',
                        content: "可以根据设备类型决定是否激活链接。"
                    },
                    {
                        title: "JavaScript检测",
                        code: '// 检测是否支持tel链接\nfunction isTelSupported() {\n  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);\n}\n\nif (!isTelSupported()) {\n  // 移除tel链接\n  document.querySelectorAll(\'a[href^="tel:"]\').forEach(link => {\n    link.removeAttribute("href");\n    link.style.cursor = "text";\n  });\n}',
                        content: "在不支持的设备上禁用tel链接。"
                    },
                    {
                        title: "其他协议",
                        code: '<!-- 短信 -->\n<a href="sms:+8613800138000">发短信</a>\n<a href="sms:+8613800138000?body=你好">带内容的短信</a>\n\n<!-- FaceTime（iOS） -->\n<a href="facetime:user@example.com">FaceTime</a>\n\n<!-- Skype -->\n<a href="skype:username?call">Skype通话</a>',
                        content: "类似的通信协议链接。"
                    }
                ]
            },
            source: "RFC 3966"
        },
        {
            difficulty: "hard",
            tags: ["可访问性", "ARIA"],
            question: "如何提升链接的可访问性？",
            type: "multiple-choice",
            options: [
                "提供清晰的链接文本",
                "使用aria-label补充信息",
                "避免'点击这里'类的模糊文本",
                "区分外部链接和内部链接"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "链接可访问性最佳实践",
                description: "让所有用户都能有效使用链接。",
                sections: [
                    {
                        title: "清晰的链接文本",
                        code: '<!-- 不好 -->\n<a href="/report.pdf">点击这里</a>下载报告\n<a href="/about">更多</a>\n\n<!-- 好 -->\n<a href="/report.pdf">下载年度报告（PDF, 2MB）</a>\n<a href="/about">了解更多关于我们公司的信息</a>',
                        points: [
                            "链接文本应自解释",
                            "脱离上下文也能理解",
                            "屏幕阅读器用户常单独浏览链接列表",
                            "避免'点击这里'、'更多'等模糊文本"
                        ]
                    },
                    {
                        title: "使用aria-label",
                        code: '<!-- 图标链接 -->\n<a href="/settings" aria-label="打开设置页面">\n  <svg>...</svg>  <!-- 设置图标 -->\n</a>\n\n<!-- 图片链接 -->\n<a href="/profile" aria-label="查看个人资料">\n  <img src="avatar.jpg" alt="">\n</a>\n\n<!-- 补充信息 -->\n<a href="file.pdf" aria-label="下载产品手册 PDF文件 3MB">\n  产品手册\n</a>',
                        points: [
                            "为图标链接提供文本描述",
                            "补充文件类型和大小",
                            "aria-label会覆盖链接文本"
                        ]
                    },
                    {
                        title: "aria-describedby",
                        code: '<a href="/delete" \n   id="delete-link"\n   aria-describedby="delete-warning">\n  删除账户\n</a>\n<span id="delete-warning" hidden>\n  此操作不可逆，将永久删除您的所有数据\n</span>',
                        content: "为重要操作提供额外说明。"
                    },
                    {
                        title: "区分链接类型",
                        code: '<!-- 外部链接 -->\n<a href="https://example.com" \n   target="_blank"\n   rel="noopener noreferrer">\n  外部网站\n  <span aria-label="（在新窗口打开）\">↗</span>\n</a>\n\n<!-- 文件下载 -->\n<a href="/doc.pdf\" download>\n  文档.pdf\n  <span aria-label="（下载PDF文件，2MB）\">⬇</span>\n</a>',
                        points: [
                            "标识外部链接",
                            "说明新窗口打开",
                            "标注文件类型和大小",
                            "使用图标或文本说明"
                        ]
                    },
                    {
                        title: "键盘可访问性",
                        code: '/* 确保焦点可见 */\na:focus {\n  outline: 2px solid blue;\n  outline-offset: 2px;\n}\n\n/* 不要移除outline */\na:focus {\n  outline: none;  /* 不要这样做！ */\n}\n\n<!-- 跳过导航链接 -->\n<a href="#main-content" class="skip-link">\n  跳转到主内容\n</a>',
                        points: [
                            "保持焦点指示器可见",
                            "支持Tab键导航",
                            "提供跳过导航的快捷方式",
                            "不要禁用outline"
                        ]
                    },
                    {
                        title: "aria-current",
                        code: '<!-- 导航中标记当前页 -->\n<nav>\n  <a href="/" aria-current="page">首页</a>\n  <a href="/about">关于</a>\n  <a href="/contact">联系</a>\n</nav>\n\n<style>\n[aria-current="page"] {\n  font-weight: bold;\n  color: #000;\n}\n</style>',
                        content: "标识当前页面链接。"
                    }
                ]
            },
            source: "WCAG 2.1"
        },
        {
            difficulty: "medium",
            tags: ["ping属性", "隐私"],
            question: "ping属性的作用是什么？",
            options: [
                "用于链接点击追踪",
                "在用户点击时发送POST请求到指定URL",
                "隐私问题：用户可能被追踪",
                "已被所有浏览器禁用"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "ping属性详解",
                description: "ping属性用于链接点击追踪，但存在隐私争议。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<a href="https://example.com" \n   ping="https://analytics.com/track">\n  链接\n</a>\n\n<!-- 多个追踪地址 -->\n<a href="https://example.com"\n   ping="https://a.com/track https://b.com/track">\n  链接\n</a>',
                        points: [
                            "用户点击时，发送POST请求到ping指定的URL",
                            "请求体包含4个字段：ping-from、ping-to、ping-content-type",
                            "异步发送，不影响导航",
                            "可以指定多个URL"
                        ]
                    },
                    {
                        title: "发送的数据",
                        code: '// 点击时浏览器发送POST请求\nPOST /track HTTP/1.1\nHost: analytics.com\nPing-From: https://source.com/page\nPing-To: https://example.com\nContent-Type: text/ping\n\nPING',
                        points: [
                            "Ping-From：来源页面",
                            "Ping-To：目标URL",
                            "Content-Type：text/ping",
                            "请求体：PING"
                        ]
                    },
                    {
                        title: "优势",
                        points: [
                            "标准化的追踪机制",
                            "比JavaScript追踪更可靠",
                            "不会延迟页面跳转",
                            "浏览器可以统一控制（允许/禁止）"
                        ]
                    },
                    {
                        title: "隐私问题",
                        points: [
                            "用户行为被追踪",
                            "用户通常不知情",
                            "某些浏览器默认禁用",
                            "隐私浏览模式通常不发送ping"
                        ]
                    },
                    {
                        title: "浏览器支持",
                        code: '// 检测支持\nif ("ping" in document.createElement("a")) {\n  console.log("支持ping属性");\n}\n\n// Firefox默认禁用，需要在about:config启用：\n// browser.send_pings = true',
                        points: [
                            "Chrome/Safari：支持",
                            "Firefox：默认禁用",
                            "用户可以在设置中禁用",
                            "广告拦截器通常会阻止"
                        ]
                    },
                    {
                        title: "替代方案",
                        code: '// JavaScript追踪\nlink.addEventListener("click", (e) => {\n  navigator.sendBeacon("/track", JSON.stringify({\n    from: location.href,\n    to: link.href\n  }));\n  // 不阻止默认行为\n});',
                        content: "使用sendBeacon进行追踪，更灵活但需要JavaScript。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["链接预取", "性能"],
            question: "如何预取链接以提升导航速度？",
            type: "multiple-choice",
            options: [
                "使用<link rel='prefetch'>",
                "使用<link rel='prerender'>",
                "使用Speculation Rules API",
                "在链接hover时预取"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "链接预取优化",
                description: "提前加载链接资源可以加快页面导航速度。",
                sections: [
                    {
                        title: "prefetch - 预获取",
                        code: '<!-- 预获取下一页 -->\n<link rel="prefetch" href="/next-page.html">\n<link rel="prefetch" href="/next-page.css">\n<link rel="prefetch" href="/next-page.js">',
                        points: [
                            "在浏览器空闲时下载",
                            "优先级低",
                            "用于用户可能访问的页面",
                            "资源会缓存"
                        ]
                    },
                    {
                        title: "prerender - 预渲染",
                        code: '<!-- 预渲染整个页面 -->\n<link rel="prerender" href="/next-page.html">',
                        points: [
                            "不仅下载，还渲染页面",
                            "在后台标签页中渲染",
                            "用户点击时立即显示",
                            "消耗更多资源",
                            "Chrome支持，其他浏览器可能降级为prefetch"
                        ]
                    },
                    {
                        title: "Speculation Rules API（新）",
                        code: '<script type="speculationrules">\n{\n  "prerender": [\n    {\n      "source": "list",\n      "urls": ["/next-page.html", "/other-page.html"]\n    }\n  ],\n  "prefetch": [\n    {\n      "source": "document",\n      "where": {\n        "href_matches": "/articles/*"\n      }\n    }\n  ]\n}\n</script>',
                        points: [
                            "Chrome 108+新API",
                            "更灵活的预取规则",
                            "可以基于条件预取",
                            "支持列表和模式匹配"
                        ]
                    },
                    {
                        title: "hover时预取",
                        code: '// 鼠标悬停时预取\ndocument.querySelectorAll("a").forEach(link => {\n  link.addEventListener("mouseenter", function() {\n    const url = this.href;\n    // 创建prefetch\n    const prefetchLink = document.createElement("link");\n    prefetchLink.rel = "prefetch";\n    prefetchLink.href = url;\n    document.head.appendChild(prefetchLink);\n  });\n});\n\n// 或使用Intersection Observer\nconst observer = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      const url = entry.target.href;\n      // 预取可见链接\n    }\n  });\n});\n\ndocument.querySelectorAll("a").forEach(link => {\n  observer.observe(link);\n});',
                        content: "即时预取库（instant.page）使用此技术。"
                    },
                    {
                        title: "dns-prefetch和preconnect",
                        code: '<!-- DNS预解析 -->\n<link rel="dns-prefetch" href="//example.com">\n\n<!-- 预连接（包括DNS+TCP+TLS） -->\n<link rel="preconnect" href="//example.com">',
                        points: [
                            "提前解析域名",
                            "提前建立连接",
                            "减少跨域资源加载时间",
                            "适用于CDN、API等"
                        ]
                    },
                    {
                        title: "注意事项",
                        points: [
                            "不要过度预取（浪费带宽）",
                            "预测用户下一步操作",
                            "移动网络慎用预渲染",
                            "考虑用户流量成本",
                            "使用rel='prefetch'优先级最低"
                        ]
                    }
                ]
            },
            source: "Chrome Developers"
        }
    ],
    navigation: {
        prev: { title: "列表与定义", url: "05-lists-quiz.html" },
        next: { title: "图片处理", url: "07-images-quiz.html" }
    }
};
