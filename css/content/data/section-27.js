// 第27章：Grid对齐与放置
window.cssContentData_Section27 = {
    section: {
        id: 27,
        title: "Grid对齐与放置",
        icon: "🎚️",
        topics: [
            {
                id: "grid-alignment",
                title: "Grid对齐属性",
                type: "concept",
                content: {
                    description: "Grid布局提供了强大的对齐能力，可以在容器和单元格两个层面控制项目的对齐。对齐属性继承自Flexbox的Box Alignment规范。",
                    keyPoints: [
                        "justify-items：容器内所有项目的行内轴对齐",
                        "align-items：容器内所有项目的块轴对齐",
                        "justify-self：单个项目的行内轴对齐",
                        "align-self：单个项目的块轴对齐",
                        "justify-content/align-content：整个网格在容器中的对齐"
                    ],
                    mdn: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout/Box_Alignment_in_CSS_Grid_Layout"
                }
            },
            {
                id: "grid-placement",
                title: "Grid项目放置",
                type: "principle",
                content: {
                    description: "Grid允许精确控制项目在网格中的位置和跨度，可以使用线号、线名称或区域名称来定位项目。",
                    mechanism: "项目放置使用grid-column和grid-row属性，它们是start和end的简写。可以使用网格线号（从1开始）、线名称或span关键字。负数表示从网格末尾反向计数。grid-area可以同时设置行和列的位置。命名网格区域提供了更直观的布局方式。",
                    keyPoints: [
                        "grid-column: start / end 定义列位置",
                        "grid-row: start / end 定义行位置",
                        "span关键字表示跨越的轨道数",
                        "负数从网格末尾反向计数",
                        "grid-area可以使用命名区域或线号"
                    ]
                }
            },
            {
                id: "named-grid",
                title: "命名网格线与区域",
                type: "principle",
                content: {
                    description: "Grid支持为网格线和区域命名，使布局代码更具可读性和可维护性。",
                    mechanism: "在grid-template-rows/columns中使用[name]语法命名网格线，一条线可以有多个名称。使用grid-template-areas定义命名区域，通过ASCII艺术的方式直观地展示布局结构。命名区域会自动创建对应的网格线名称（area-start/area-end）。",
                    keyPoints: [
                        "使用[line-name]为网格线命名",
                        "一条线可以有多个名称",
                        "grid-template-areas定义命名区域",
                        "命名区域自动创建start/end网格线",
                        "句点(.)表示空单元格"
                    ]
                }
            }
        ]
    },
    navigation: {
        prev: { title: "Grid布局算法", url: "26-grid-algorithm.html" },
        next: { title: "媒体查询原理", url: "28-media-queries.html" }
    }
};
