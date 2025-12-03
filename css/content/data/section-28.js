// 第28章：媒体查询原理
window.cssContentData_Section28 = {
    section: {
        id: 28,
        title: "媒体查询原理",
        icon: "📱",
        topics: [
            {
                id: "media-query-syntax",
                title: "媒体查询语法",
                type: "concept",
                content: {
                    description: "媒体查询（Media Queries）允许根据设备特性应用不同的CSS样式，是响应式设计的核心技术。",
                    keyPoints: [
                        "@media规则用于定义媒体查询",
                        "媒体类型：all、screen、print、speech",
                        "媒体特性：width、height、orientation等",
                        "逻辑操作符：and、or（逗号）、not、only",
                        "范围查询：可以使用比较运算符（>=、<=等）"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Media_Queries"
                }
            },
            {
                id: "media-features",
                title: "常用媒体特性",
                type: "concept",
                content: {
                    description: "媒体特性是媒体查询的核心，它们描述了用户代理、输出设备或环境的特定特征。",
                    keyPoints: [
                        "width/height：视口尺寸（可加min-/max-前缀）",
                        "device-width/height：设备屏幕尺寸（已废弃）",
                        "orientation：portrait（竖屏）或landscape（横屏）",
                        "resolution：设备分辨率（dpi、dpcm、dppx）",
                        "aspect-ratio：视口宽高比",
                        "hover：设备是否支持悬停",
                        "prefers-color-scheme：用户偏好的配色方案"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/@media"
                }
            },
            {
                id: "breakpoint-strategy",
                title: "断点设计策略",
                type: "principle",
                content: {
                    description: "断点（breakpoint）是媒体查询中定义样式切换的关键点。合理的断点设计是响应式布局成功的关键。",
                    mechanism: "现代断点设计倾向于基于内容而非具体设备。常用方法是从移动优先（mobile-first）或桌面优先（desktop-first）出发，逐步添加断点。移动优先使用min-width，桌面优先使用max-width。常见断点范围：小屏(<640px)、中屏(640-768px)、大屏(1024px)、超大屏(1280px+)。但具体断点应根据内容和设计需求确定。",
                    keyPoints: [
                        "移动优先：使用min-width，从小屏向大屏扩展",
                        "桌面优先：使用max-width，从大屏向小屏适配",
                        "基于内容而非设备：在内容需要调整时添加断点",
                        "避免过多断点：3-5个主要断点通常足够",
                        "使用em单位定义断点，更好支持字体缩放"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "Grid对齐与放置", url: "27-grid-alignment.html" },
        next: { title: "响应式单位", url: "29-responsive-units.html" }
    }
};
