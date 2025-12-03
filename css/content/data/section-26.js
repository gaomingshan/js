// 第26章：Grid布局算法
window.cssContentData_Section26 = {
    section: {
        id: 26,
        title: "Grid布局算法",
        icon: "🔲",
        topics: [
            {
                id: "grid-model",
                title: "Grid布局模型",
                type: "concept",
                content: {
                    description: "CSS Grid是一个二维布局系统，可以同时处理行和列。Grid容器被划分为行和列的网格，子元素可以放置在这些网格区域中。",
                    keyPoints: [
                        "Grid通过display:grid或display:inline-grid创建",
                        "网格由行（rows）和列（columns）组成",
                        "网格线（grid lines）用于定位网格项目",
                        "网格轨道（grid track）是两条网格线之间的空间",
                        "网格单元（grid cell）是最小的网格单位"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout"
                }
            },
            {
                id: "grid-track-sizing",
                title: "网格轨道尺寸算法",
                type: "principle",
                content: {
                    description: "Grid的轨道尺寸计算是其最复杂的部分，涉及固定尺寸、弹性尺寸、内容尺寸等多种因素。",
                    mechanism: "Grid轨道尺寸计算分为几个阶段：1) 解析轨道列表，识别固定、弹性(fr)和自动尺寸；2) 计算固定轨道和内容轨道的尺寸；3) 分配剩余空间给fr单位轨道；4) 考虑min/max约束调整轨道尺寸。fr单位表示可用空间的分数，所有fr轨道按比例分配剩余空间。",
                    keyPoints: [
                        "固定尺寸（px、em等）优先计算",
                        "fr单位按比例分配剩余空间",
                        "auto根据内容自动调整",
                        "minmax()函数定义尺寸范围",
                        "min-content/max-content关键字基于内容确定尺寸"
                    ]
                }
            },
            {
                id: "auto-placement",
                title: "自动放置算法",
                type: "principle",
                content: {
                    description: "Grid的自动放置算法决定了没有明确位置的网格项目如何在网格中排列。",
                    mechanism: "自动放置算法按照以下规则：1) 显式放置的项目先占据位置；2) 未放置的项目按照文档流顺序依次放置；3) grid-auto-flow控制放置方向（row/column）和是否密集填充（dense）；4) dense模式会尝试填充前面留下的空隙；5) 跨多个轨道的项目需要找到足够大的空间。",
                    keyPoints: [
                        "grid-auto-flow:row 按行填充（默认）",
                        "grid-auto-flow:column 按列填充",
                        "grid-auto-flow:dense 密集填充，填补空隙",
                        "grid-auto-rows/columns 定义隐式轨道尺寸",
                        "order属性可以改变项目的放置顺序"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "Flex属性详解", url: "25-flex-properties.html" },
        next: { title: "Grid对齐与放置", url: "27-grid-alignment.html" }
    }
};
