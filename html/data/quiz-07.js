// 第7章：图片处理 - 面试题
window.htmlQuizData_07 = {
    config: {
        title: "图片处理",
        icon: "🖼️",
        description: "测试你对HTML图片标签的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["img标签", "基础"],
            question: "<img>标签必须包含哪些属性？",
            options: [
                "src属性必须",
                "alt属性必须",
                "width和height可选",
                "title属性可选"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<img>标签属性",
                description: "正确使用img标签的属性对可访问性和性能都很重要。",
                sections: [
                    {
                        title: "src属性 - 必需",
                        code: '<img src="image.jpg" alt="描述">',
                        points: [
                            "指定图片来源",
                            "支持相对和绝对路径",
                            "支持data URL",
                            "没有src，图片不会显示"
                        ]
                    },
                    {
                        title: "alt属性 - 必需",
                        code: '<!-- 内容图片 -->\n<img src="cat.jpg" alt="一只橘色的猫坐在窗台上">\n\n<!-- 装饰图片 -->\n<img src="decoration.png" alt="">\n\n<!-- 功能图片 -->\n<img src="search-icon.svg" alt="搜索">',
                        points: [
                            "替代文本，图片无法显示时显示",
                            "屏幕阅读器会读取",
                            "装饰图片：alt=\"\"",
                            "SEO：搜索引擎使用alt",
                            "HTML5规范：alt是必需的"
                        ]
                    },
                    {
                        title: "width和height - 可选但推荐",
                        code: '<img src="photo.jpg" alt="风景" width="800" height="600">',
                        points: [
                            "指定图片尺寸",
                            "防止页面重排（CLS）",
                            "浏览器提前预留空间",
                            "可以用CSS覆盖",
                            "推荐设置，即使CSS会改变尺寸"
                        ]
                    },
                    {
                        title: "其他属性",
                        code: '<img src="photo.jpg" \n     alt="风景"\n     title="美丽的日落"  <!-- 鼠标悬停提示 -->\n     loading="lazy"  <!-- 懒加载 -->\n     decoding="async"  <!-- 异步解码 -->\n     srcset="..."  <!-- 响应式图片 -->\n     sizes="...">  <!-- 尺寸提示 -->',
                        content: "title、loading、srcset等都是可选的增强属性。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["alt属性", "可访问性"],
            question: "如何正确使用alt属性？",
            options: [
                "描述图片内容，而非图片本身",
                "装饰图片使用空alt",
                "功能图片描述功能而非外观",
                "alt文本越长越好"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "alt属性最佳实践",
                description: "正确的alt文本对可访问性至关重要。",
                sections: [
                    {
                        title: "内容图片",
                        code: '<!-- 好：描述内容和上下文 -->\n<img src="meeting.jpg" alt="团队在会议室讨论项目，白板上写着Q4目标">\n\n<!-- 不好：太简单 -->\n<img src="meeting.jpg" alt="会议">\n\n<!-- 不好：无关信息 -->\n<img src="meeting.jpg" alt="IMG_1234.jpg">',
                        points: [
                            "描述图片传达的信息",
                            "考虑上下文",
                            "不要包含'图片'、'照片'等词",
                            "简洁但完整"
                        ]
                    },
                    {
                        title: "装饰图片",
                        code: '<!-- 纯装饰：空alt -->\n<img src="decoration.png" alt="">\n\n<!-- 或使用CSS背景图 -->\n<div style="background-image: url(decoration.png)"></div>',
                        points: [
                            "装饰性图片：alt=\"\"",
                            "屏幕阅读器会跳过",
                            "不要省略alt属性",
                            "空alt和无alt不同"
                        ]
                    },
                    {
                        title: "功能图片",
                        code: '<!-- 好：描述功能 -->\n<button>\n  <img src="save.svg" alt="保存">\n</button>\n\n<!-- 不好：描述外观 -->\n<button>\n  <img src="save.svg" alt="软盘图标">\n</button>',
                        content: "功能图片的alt应该描述功能，而非外观。"
                    },
                    {
                        title: "图表和信息图",
                        code: '<!-- 简单图表 -->\n<img src="sales-chart.png" \n     alt="2024年销售额趋势图：第一季度100万，第二季度150万，第三季度180万，第四季度预计200万">\n\n<!-- 复杂图表：提供详细描述 -->\n<figure>\n  <img src="complex-chart.png" alt="详见下方数据表格">\n  <figcaption>\n    <details>\n      <summary>图表详细数据</summary>\n      <table>...</table>\n    </details>\n  </figcaption>\n</figure>',
                        content: "复杂图表可以配合长描述或数据表格。"
                    },
                    {
                        title: "链接中的图片",
                        code: '<!-- 好：描述链接目标 -->\n<a href="/products">\n  <img src="products.jpg" alt="浏览产品目录">\n</a>\n\n<!-- 不好：只描述图片 -->\n<a href="/products">\n  <img src="products.jpg" alt="产品照片">\n</a>',
                        content: "链接中的图片，alt应该描述链接去向。"
                    }
                ]
            },
            source: "WCAG 2.1"
        },
        {
            difficulty: "hard",
            tags: ["响应式图片", "srcset"],
            question: "srcset和sizes属性的作用是什么？",
            options: [
                "srcset定义不同分辨率的图片",
                "sizes定义图片在不同视口的显示尺寸",
                "浏览器自动选择最合适的图片",
                "可以节省带宽"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "响应式图片",
                description: "srcset和sizes让浏览器根据设备选择最优图片。",
                sections: [
                    {
                        title: "像素密度描述符",
                        code: '<img src="image-1x.jpg"\n     srcset="image-1x.jpg 1x,\n             image-2x.jpg 2x,\n             image-3x.jpg 3x"\n     alt="风景">',
                        points: [
                            "1x：普通屏幕",
                            "2x：Retina屏",
                            "3x：高分辨率屏",
                            "浏览器根据设备像素比选择"
                        ]
                    },
                    {
                        title: "宽度描述符",
                        code: '<img src="image-800.jpg"\n     srcset="image-400.jpg 400w,\n             image-800.jpg 800w,\n             image-1200.jpg 1200w,\n             image-1600.jpg 1600w"\n     sizes="(max-width: 600px) 100vw,\n            (max-width: 1200px) 50vw,\n            800px"\n     alt="风景">',
                        points: [
                            "w：图片实际宽度",
                            "sizes：告诉浏览器图片显示尺寸",
                            "浏览器计算并选择最优图片",
                            "节省带宽"
                        ]
                    },
                    {
                        title: "sizes属性详解",
                        code: '<!-- sizes语法 -->\nsizes="<media-condition> <length>, <default-length>"\n\n<!-- 示例 -->\nsizes="(max-width: 600px) 100vw,    /* 小屏：全宽 */\n       (max-width: 1200px) 50vw,     /* 中屏：半宽 */\n       800px"                        /* 大屏：固定800px */',
                        points: [
                            "从左到右匹配",
                            "第一个匹配的条件生效",
                            "最后一个是默认值",
                            "支持vw、px等单位"
                        ]
                    },
                    {
                        title: "浏览器如何选择",
                        code: '// 浏览器的选择算法：\n// 1. 确定视口宽度（如 600px）\n// 2. 根据sizes确定图片显示宽度（如 100vw = 600px）\n// 3. 考虑设备像素比（如 2x）\n// 4. 需要的图片宽度 = 600px * 2 = 1200px\n// 5. 从srcset选择 >= 1200w的最小图片\n\n<img srcset="img-400.jpg 400w,\n             img-800.jpg 800w,\n             img-1200.jpg 1200w,\n             img-1600.jpg 1600w"\n     sizes="100vw"\n     alt="示例">\n/* 在600px 2x屏幕上，选择 img-1200.jpg */',
                        content: "浏览器智能选择最接近所需尺寸的图片。"
                    },
                    {
                        title: "完整示例",
                        code: '<picture>\n  <!-- WebP格式 -->\n  <source type="image/webp"\n          srcset="image-400.webp 400w,\n                  image-800.webp 800w,\n                  image-1200.webp 1200w"\n          sizes="(max-width: 600px) 100vw, 50vw">\n  \n  <!-- JPEG回退 -->\n  <img src="image-800.jpg"\n       srcset="image-400.jpg 400w,\n               image-800.jpg 800w,\n               image-1200.jpg 1200w"\n       sizes="(max-width: 600px) 100vw, 50vw"\n       alt="风景">\n</picture>',
                        content: "配合<picture>使用可以实现格式选择和响应式。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["picture标签", "艺术指导"],
            question: "<picture>标签的用途是什么？",
            type: "multiple-choice",
            options: [
                "提供不同格式的图片",
                "实现艺术指导（不同尺寸显示不同图片）",
                "比srcset更灵活",
                "可以完全替代<img>"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "<picture>标签详解",
                description: "picture提供了比srcset更强大的图片控制。",
                sections: [
                    {
                        title: "基本结构",
                        code: '<picture>\n  <source srcset="image.webp" type="image/webp">\n  <source srcset="image.jpg" type="image/jpeg">\n  <img src="image.jpg" alt="描述">\n</picture>',
                        points: [
                            "<source>：不同的图片选项",
                            "<img>：回退和实际显示元素",
                            "必须包含<img>",
                            "浏览器选择第一个匹配的<source>"
                        ]
                    },
                    {
                        title: "格式选择",
                        code: '<picture>\n  <!-- 现代格式：AVIF -->\n  <source srcset="image.avif" type="image/avif">\n  \n  <!-- 次优格式：WebP -->\n  <source srcset="image.webp" type="image/webp">\n  \n  <!-- 回退格式：JPEG -->\n  <img src="image.jpg" alt="照片">\n</picture>',
                        points: [
                            "AVIF：最小体积，新浏览器支持",
                            "WebP：较小体积，广泛支持",
                            "JPEG/PNG：所有浏览器支持",
                            "浏览器选择第一个支持的格式"
                        ]
                    },
                    {
                        title: "艺术指导",
                        code: '<picture>\n  <!-- 移动端：竖版裁剪 -->\n  <source media="(max-width: 600px)"\n          srcset="image-portrait.jpg">\n  \n  <!-- 平板：方形裁剪 -->\n  <source media="(max-width: 1200px)"\n          srcset="image-square.jpg">\n  \n  <!-- 桌面：横版全景 -->\n  <img src="image-landscape.jpg" alt="风景">\n</picture>',
                        points: [
                            "不同屏幕显示不同构图",
                            "不是简单缩放，是不同图片",
                            "media属性控制何时使用",
                            "用于强调不同焦点"
                        ]
                    },
                    {
                        title: "结合srcset",
                        code: '<picture>\n  <!-- 移动端：多分辨率选择 -->\n  <source media="(max-width: 600px)"\n          srcset="mobile-400.jpg 400w,\n                  mobile-800.jpg 800w"\n          sizes="100vw">\n  \n  <!-- 桌面：多分辨率选择 -->\n  <source media="(min-width: 601px)"\n          srcset="desktop-800.jpg 800w,\n                  desktop-1200.jpg 1200w,\n                  desktop-1600.jpg 1600w"\n          sizes="(max-width: 1200px) 50vw, 800px">\n  \n  <img src="desktop-800.jpg" alt="照片">\n</picture>',
                        content: "可以在每个<source>中使用srcset和sizes。"
                    },
                    {
                        title: "暗黑模式适配",
                        code: '<picture>\n  <!-- 暗黑模式 -->\n  <source srcset="image-dark.jpg"\n          media="(prefers-color-scheme: dark)">\n  \n  <!-- 明亮模式 -->\n  <img src="image-light.jpg" alt="界面截图">\n</picture>',
                        content: "根据系统主题显示不同图片。"
                    },
                    {
                        title: "vs srcset",
                        points: [
                            "srcset：分辨率切换（相同图片，不同尺寸）",
                            "picture：艺术指导（不同图片，不同构图）",
                            "picture：格式选择（WebP、AVIF等）",
                            "picture：更复杂，仅在需要时使用",
                            "两者可以结合使用"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["loading属性", "性能"],
            question: "loading='lazy'的作用和注意事项是什么？",
            options: [
                "延迟加载图片，提升初始加载速度",
                "图片接近视口时才加载",
                "首屏图片不应该使用lazy",
                "所有浏览器都支持"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "图片懒加载",
                description: "原生懒加载可以显著提升页面性能。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<!-- 懒加载 -->\n<img src="image.jpg" alt="照片" loading="lazy">\n\n<!-- 立即加载（默认） -->\n<img src="hero.jpg" alt="首页大图" loading="eager">',
                        points: [
                            "lazy：接近视口时加载",
                            "eager：立即加载",
                            "auto：浏览器决定（默认）"
                        ]
                    },
                    {
                        title: "何时使用",
                        code: '<!-- 首屏：不要用lazy -->\n<img src="hero.jpg" alt="首页大图" loading="eager">\n\n<!-- 折叠下方：用lazy -->\n<div style="margin-top: 2000px">\n  <img src="image1.jpg" alt="图片" loading="lazy">\n  <img src="image2.jpg" alt="图片" loading="lazy">\n</div>',
                        points: [
                            "首屏图片：不用lazy",
                            "折叠下方图片：用lazy",
                            "LCP图片：必须eager",
                            "提升Core Web Vitals"
                        ]
                    },
                    {
                        title: "浏览器行为",
                        points: [
                            "Chrome/Edge：距离视口3000px时开始加载",
                            "Firefox/Safari：距离视口更近时加载",
                            "不同网速阈值不同",
                            "浏览器会预测滚动方向"
                        ]
                    },
                    {
                        title: "配合Intersection Observer",
                        code: '// 不支持loading的浏览器回退\nif ("loading" in HTMLImageElement.prototype) {\n  // 原生懒加载\n  const images = document.querySelectorAll("img[loading=lazy]");\n  images.forEach(img => {\n    img.src = img.dataset.src;\n  });\n} else {\n  // Intersection Observer回退\n  const observer = new IntersectionObserver((entries) => {\n    entries.forEach(entry => {\n      if (entry.isIntersecting) {\n        const img = entry.target;\n        img.src = img.dataset.src;\n        observer.unobserve(img);\n      }\n    });\n  });\n  \n  document.querySelectorAll("img[loading=lazy]").forEach(img => {\n    observer.observe(img);\n  });\n}',
                        content: "为旧浏览器提供回退方案。"
                    },
                    {
                        title: "注意事项",
                        code: '<!-- 错误：首屏图片用lazy -->\n<img src="hero.jpg" alt="首页大图" loading="lazy">\n<!-- 导致LCP延迟！ -->\n\n<!-- 正确：首屏eager，其他lazy -->\n<img src="hero.jpg" alt="首页大图" loading="eager">\n<img src="below-fold.jpg" alt="内容" loading="lazy">',
                        points: [
                            "不要对首屏图片使用lazy",
                            "可能影响LCP得分",
                            "SEO：搜索引擎爬虫可能看不到",
                            "设置width/height防止布局偏移"
                        ]
                    }
                ]
            },
            source: "Web性能最佳实践"
        },
        {
            difficulty: "medium",
            tags: ["decoding属性", "性能"],
            question: "decoding属性的作用是什么？",
            options: [
                "控制图片解码时机",
                "async表示异步解码",
                "sync表示同步解码",
                "auto让浏览器决定"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "图片解码控制",
                description: "decoding属性控制图片解码对渲染的影响。",
                sections: [
                    {
                        title: "三个值",
                        code: '<!-- 异步解码（推荐） -->\n<img src="large.jpg" alt="大图" decoding="async">\n\n<!-- 同步解码 -->\n<img src="important.jpg" alt="重要图片" decoding="sync">\n\n<!-- 浏览器决定（默认） -->\n<img src="image.jpg" alt="图片" decoding="auto">',
                        points: [
                            "async：异步解码，不阻塞渲染",
                            "sync：同步解码，完成后再渲染",
                            "auto：浏览器决定",
                            "默认是auto"
                        ]
                    },
                    {
                        title: "何时使用async",
                        code: '<!-- 大图片：异步解码 -->\n<img src="hero-large.jpg" \n     alt="首页大图"\n     decoding="async"\n     loading="eager">',
                        points: [
                            "大图片",
                            "非关键内容",
                            "避免阻塞页面渲染",
                            "配合loading='eager'使用"
                        ]
                    },
                    {
                        title: "何时使用sync",
                        code: '<!-- 关键小图：同步解码 -->\n<img src="logo.svg" \n     alt="公司Logo"\n     decoding="sync"\n     loading="eager">',
                        points: [
                            "小图片",
                            "关键内容（Logo、图标）",
                            "需要立即显示",
                            "避免闪烁"
                        ]
                    },
                    {
                        title: "图片解码过程",
                        code: '// 图片加载流程：\n// 1. 下载图片数据（src加载）\n// 2. 解码图片（压缩格式 -> 像素数据）\n// 3. 渲染到屏幕\n\n// decoding控制步骤2何时执行：\n// - async: 步骤2异步进行，不阻塞步骤3\n// - sync: 步骤2必须完成才能进行步骤3',
                        content: "解码是将JPEG/PNG等格式解压为像素数据的过程。"
                    },
                    {
                        title: "实际效果",
                        points: [
                            "async：页面可以先渲染文字等内容",
                            "async：图片解码完成后再显示",
                            "sync：等待图片解码完成后统一渲染",
                            "async改善FID和TTI指标",
                            "效果在大图片上更明显"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["图片格式", "性能"],
            question: "现代图片格式的特点和选择？",
            type: "multiple-choice",
            options: [
                "AVIF提供最好的压缩比",
                "WebP广泛支持且压缩比好",
                "JPEG XL是未来趋势",
                "应该总是使用最新格式"
            ],
            correctAnswer: ["A", "B"],
            explanation: {
                title: "图片格式选择",
                description: "选择合适的图片格式可以显著减小文件体积。",
                sections: [
                    {
                        title: "格式对比",
                        code: '// 相同质量下的文件大小对比（以100KB的JPEG为基准）：\n// JPEG:  100 KB  (基准)\n// PNG:   200 KB  (无损，更大)\n// WebP:  75 KB   (25%更小)\n// AVIF:  50 KB   (50%更小)\n// JPEG XL: 45 KB (55%更小，支持有限)',
                        points: [
                            "AVIF：最小，但编码慢",
                            "WebP：较小，编码快",
                            "JPEG：通用，体积中等",
                            "PNG：无损，体积大"
                        ]
                    },
                    {
                        title: "浏览器支持",
                        points: [
                            "JPEG/PNG：所有浏览器",
                            "WebP：Chrome 23+, Firefox 65+, Safari 14+",
                            "AVIF：Chrome 85+, Firefox 93+, Safari 16+",
                            "JPEG XL：支持有限，Chrome 91-110实验性",
                            "检查 Can I Use 获取最新支持情况"
                        ]
                    },
                    {
                        title: "渐进增强策略",
                        code: '<picture>\n  <!-- 优先：AVIF -->\n  <source srcset="image.avif" type="image/avif">\n  \n  <!-- 次优：WebP -->\n  <source srcset="image.webp" type="image/webp">\n  \n  <!-- 回退：JPEG -->\n  <img src="image.jpg" alt="照片">\n</picture>',
                        content: "提供多种格式，浏览器自动选择最优。"
                    },
                    {
                        title: "使用场景",
                        code: '// 照片类图片（渐变、色彩丰富）\n- 首选：AVIF (最小)\n- 次选：WebP (兼容性更好)\n- 回退：JPEG (渐进式JPEG更好)\n\n// 图标、Logo（色彩简单）\n- 首选：SVG (矢量，无限缩放)\n- 次选：WebP (小体积)\n- 回退：PNG (支持透明)\n\n// 需要透明通道\n- 首选：AVIF (支持透明)\n- 次选：WebP (支持透明)\n- 回退：PNG (通用)\n\n// 动画\n- 首选：WebP动画 (比GIF小很多)\n- 次选：AVIF动画\n- 回退：GIF (体积大)',
                        content: "根据内容类型选择格式。"
                    },
                    {
                        title: "生成工具",
                        code: '# 命令行工具\n\n# 生成WebP\ncwebp input.jpg -q 80 -o output.webp\n\n# 生成AVIF\navifenc --min 0 --max 63 -a end-usage=q -a cq-level=30 input.jpg output.avif\n\n# 批量转换（ImageMagick）\nmagick convert input.jpg -quality 80 output.webp\n\n# 在构建工具中自动生成\n// webpack: image-webpack-loader\n// vite: vite-plugin-imagemin',
                        content: "使用工具自动生成多种格式。"
                    },
                    {
                        title: "推荐策略",
                        points: [
                            "开发：使用原始JPEG/PNG",
                            "构建时：自动生成WebP和AVIF",
                            "HTML：使用<picture>提供多格式",
                            "服务器：根据Accept头动态返回",
                            "CDN：使用支持格式转换的CDN"
                        ]
                    }
                ]
            },
            source: "Web性能最佳实践"
        },
        {
            difficulty: "hard",
            tags: ["CLS", "性能"],
            question: "如何防止图片导致的布局偏移（CLS）？",
            type: "multiple-choice",
            options: [
                "设置width和height属性",
                "使用aspect-ratio CSS",
                "使用占位图",
                "完全不可避免"
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "防止图片CLS",
                description: "Cumulative Layout Shift是Core Web Vitals的重要指标。",
                sections: [
                    {
                        title: "问题",
                        code: '<!-- 不好：没有尺寸 -->\n<img src="image.jpg" alt="照片">\n<!-- 图片加载后，页面内容向下移动 -->',
                        points: [
                            "图片加载前占用0高度",
                            "加载后突然出现，推挤内容",
                            "影响用户体验",
                            "影响CLS得分"
                        ]
                    },
                    {
                        title: "方案1：设置width/height",
                        code: '<!-- 好：提前预留空间 -->\n<img src="image.jpg" \n     alt="照片"\n     width="800"\n     height="600">\n\n<style>\nimg {\n  max-width: 100%;\n  height: auto;  /* 保持宽高比 */\n}\n</style>',
                        points: [
                            "HTML设置width和height",
                            "CSS设置max-width: 100%",
                            "浏览器自动计算宽高比",
                            "即使CSS改变尺寸，空间已预留"
                        ]
                    },
                    {
                        title: "方案2：aspect-ratio",
                        code: '<img src="image.jpg" \n     alt="照片"\n     style="aspect-ratio: 16/9; width: 100%;">\n\n<!-- 或在CSS中 -->\n<style>\n.hero-image {\n  width: 100%;\n  aspect-ratio: 16 / 9;\n  object-fit: cover;\n}\n</style>',
                        points: [
                            "现代CSS属性",
                            "直接指定宽高比",
                            "不需要知道具体尺寸",
                            "浏览器支持：Chrome 88+, Safari 15+"
                        ]
                    },
                    {
                        title: "方案3：padding占位",
                        code: '<!-- 传统方案：padding技巧 -->\n<div class="image-container">\n  <img src="image.jpg" alt="照片">\n</div>\n\n<style>\n.image-container {\n  position: relative;\n  width: 100%;\n  padding-bottom: 56.25%; /* 16:9 = 9/16 = 56.25% */\n}\n\n.image-container img {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n</style>',
                        content: "旧浏览器的回退方案。"
                    },
                    {
                        title: "方案4：占位图",
                        code: '<!-- 低质量占位图（LQIP） -->\n<img src="data:image/svg+xml;base64,..." \n     alt="照片"\n     style="aspect-ratio: 16/9">\n\n<script>\n// 加载完成后替换\nimg.onload = () => {\n  img.src = "high-quality.jpg";\n};\n</script>\n\n<!-- 或使用blur-up技术 -->\n<div style="background: url(tiny-blur.jpg); filter: blur(20px);">\n  <img src="large.jpg" alt="照片">\n</div>',
                        content: "显示模糊的小图作为占位。"
                    },
                    {
                        title: "完整示例",
                        code: '<picture>\n  <source srcset="image.avif" type="image/avif">\n  <source srcset="image.webp" type="image/webp">\n  <img src="image.jpg" \n       alt="风景照片"\n       width="1600"\n       height="900"\n       loading="lazy"\n       decoding="async">\n</picture>\n\n<style>\nimg {\n  max-width: 100%;\n  height: auto;\n  display: block;\n}\n</style>',
                        content: "最佳实践：结合多种优化技术。"
                    }
                ]
            },
            source: "Core Web Vitals"
        },
        {
            difficulty: "medium",
            tags: ["figure标签", "语义"],
            question: "<figure>和<figcaption>的用途是什么？",
            options: [
                "<figure>包裹独立的内容单元",
                "<figcaption>提供说明文字",
                "只能用于图片",
                "有助于SEO和可访问性"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "D"],
            explanation: {
                title: "<figure>和<figcaption>",
                description: "语义化地标记独立内容及其说明。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<figure>\n  <img src="chart.jpg" alt="2024年销售数据">\n  <figcaption>图1：2024年各季度销售额对比</figcaption>\n</figure>',
                        points: [
                            "<figure>：独立的内容单元",
                            "<figcaption>：可选的说明文字",
                            "可以从主内容中移除而不影响理解",
                            "通常有编号和标题"
                        ]
                    },
                    {
                        title: "不仅限于图片",
                        code: '<!-- 代码块 -->\n<figure>\n  <pre><code>\nfunction hello() {\n  console.log("Hello");\n}\n  </code></pre>\n  <figcaption>代码1：Hello函数示例</figcaption>\n</figure>\n\n<!-- 引用 -->\n<figure>\n  <blockquote>\n    <p>学而时习之，不亦说乎。</p>\n  </blockquote>\n  <figcaption>—— 《论语》</figcaption>\n</figure>\n\n<!-- 表格 -->\n<figure>\n  <table>...</table>\n  <figcaption>表1：用户统计数据</figcaption>\n</figure>\n\n<!-- 视频 -->\n<figure>\n  <video src="demo.mp4" controls></video>\n  <figcaption>视频1：产品演示</figcaption>\n</figure>',
                        content: "可以包含图片、代码、引用、表格、视频等。"
                    },
                    {
                        title: "figcaption位置",
                        code: '<!-- 标题在上方 -->\n<figure>\n  <figcaption>图1：产品架构图</figcaption>\n  <img src="architecture.jpg" alt="系统架构">\n</figure>\n\n<!-- 标题在下方 -->\n<figure>\n  <img src="photo.jpg" alt="风景">\n  <figcaption>摄于黄山，2024年春</figcaption>\n</figure>',
                        content: "figcaption可以在内容前后，通常在后。"
                    },
                    {
                        title: "组合图片",
                        code: '<figure>\n  <img src="photo1.jpg" alt="照片1">\n  <img src="photo2.jpg" alt="照片2">\n  <img src="photo3.jpg" alt="照片3">\n  <figcaption>图1-3：项目施工过程</figcaption>\n</figure>',
                        content: "一个figure可以包含多个相关图片。"
                    },
                    {
                        title: "SEO和可访问性",
                        points: [
                            "figcaption增强图片的语义",
                            "搜索引擎会将caption与图片关联",
                            "屏幕阅读器会读取caption",
                            "比纯文本说明更有意义",
                            "支持图片索引和引用"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["Data URL", "技巧"],
            question: "Data URL的用途和注意事项？",
            options: [
                "将图片直接嵌入HTML",
                "减少HTTP请求",
                "增加HTML文件大小",
                "适合所有图片"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C"],
            explanation: {
                title: "Data URL",
                description: "将图片数据直接编码在URL中。",
                sections: [
                    {
                        title: "格式",
                        code: '<!-- 基本格式 -->\ndata:[<mediatype>][;base64],<data>\n\n<!-- SVG示例 -->\n<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E...%3C/svg%3E">\n\n<!-- PNG示例（Base64） -->\n<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...">\n\n<!-- JPEG示例 -->\n<img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...">',
                        points: [
                            "data: 协议前缀",
                            "MIME类型",
                            "base64编码（或URL编码）",
                            "图片数据"
                        ]
                    },
                    {
                        title: "优势",
                        points: [
                            "减少HTTP请求",
                            "图片随HTML一起缓存",
                            "无需额外文件",
                            "适合小图标、小图片"
                        ]
                    },
                    {
                        title: "劣势",
                        points: [
                            "Base64编码增大33%体积",
                            "无法单独缓存图片",
                            "增大HTML文件",
                            "不能被CDN单独加速",
                            "增加解析时间"
                        ]
                    },
                    {
                        title: "适用场景",
                        code: '<!-- 好：小图标（< 1KB） -->\n<img src="data:image/svg+xml,..." alt="图标">\n\n<!-- 好：关键小图 -->\n<img src="data:image/png;base64,..." \n     alt="Logo"\n     width="100"\n     height="50">\n\n<!-- 不好：大图片 -->\n<img src="data:image/jpeg;base64,..." \n     alt="大照片">  <!-- 几百KB的Base64！ -->',
                        content: "只对小于1-2KB的图片使用Data URL。"
                    },
                    {
                        title: "生成Data URL",
                        code: '// JavaScript\nfunction fileToDataURL(file) {\n  return new Promise((resolve) => {\n    const reader = new FileReader();\n    reader.onload = (e) => resolve(e.target.result);\n    reader.readAsDataURL(file);\n  });\n}\n\n// 使用\nconst input = document.querySelector(\'input[type="file"]\');\ninput.onchange = async () => {\n  const dataURL = await fileToDataURL(input.files[0]);\n  img.src = dataURL;\n};\n\n// Node.js\nconst fs = require("fs");\nconst image = fs.readFileSync("image.png");\nconst dataURL = `data:image/png;base64,${image.toString("base64")}`;',
                        content: "可以动态生成Data URL。"
                    },
                    {
                        title: "CSS中使用",
                        code: '/* 背景图 */\n.icon {\n  background-image: url(data:image/svg+xml,%3Csvg...);\n}\n\n/* 字体文件 */\n@font-face {\n  font-family: "CustomFont";\n  src: url(data:font/woff2;base64,...);\n}',
                        content: "Data URL也可以在CSS中使用。"
                    }
                ]
            },
            source: "RFC 2397"
        }
    ],
    navigation: {
        prev: { title: "链接与导航", url: "06-links-navigation-quiz.html" },
        next: { title: "多媒体标签", url: "08-multimedia-quiz.html" }
    }
};
