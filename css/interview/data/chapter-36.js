// 第36章：2D变换 - 面试题
window.cssQuizData_Chapter36 = {
    config: {
        title: "2D变换",
        icon: "🔄",
        description: "rotate、scale、translate、skew",
        primaryColor: "#f093fb",
        bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["transform基础"], question: "transform: rotate(45deg)中，正值表示？", options: ["顺时针", "逆时针", "不旋转", "取决于方向"], correctAnswer: "A", explanation: {title: "旋转方向", sections: [{title: "正确答案", content: "rotate()正值表示顺时针旋转，负值表示逆时针旋转。单位可以是deg（度）、rad（弧度）、turn（圈数）。"}]}, source: "CSS Transforms"},
        {type: "single-choice", difficulty: "easy", tags: ["translate"], question: "translate(50px, 100px)的作用是？", options: ["向右50px，向下100px", "向下50px，向右100px", "缩放", "旋转"], correctAnswer: "A", explanation: {title: "平移方向", sections: [{title: "正确答案", content: "translate(x, y)第一个参数是水平位移（正值向右），第二个是垂直位移（正值向下）。"}]}, source: "CSS Transforms"},
        {type: "single-choice", difficulty: "medium", tags: ["scale"], question: "scale(-1, 1)的效果是？", options: ["水平翻转", "垂直翻转", "180度旋转", "不变"], correctAnswer: "A", explanation: {title: "负值缩放", sections: [{title: "正确答案", content: "scale(-1, 1)在X轴方向缩放-1倍，实现水平翻转（镜像）。scale(1, -1)是垂直翻转。"}]}, source: "CSS Transforms"},
        {type: "single-choice", difficulty: "medium", tags: ["transform-origin"], question: "transform-origin的默认值是？", options: ["left top", "center center", "0 0", "50% 50%"], correctAnswer: "B", explanation: {title: "变换原点", sections: [{title: "正确答案", content: "transform-origin默认值是center center（50% 50%），即元素中心。可以用关键字、百分比或长度值设置。"}]}, source: "CSS Transforms"},
        {type: "single-choice", difficulty: "medium", tags: ["skew"], question: "skewX(30deg)会改变元素的？", options: ["高度", "宽度", "形状", "位置"], correctAnswer: "C", explanation: {title: "倾斜变换", sections: [{title: "正确答案", content: "skewX()使元素沿X轴倾斜，改变形状（平行四边形效果），但不改变元素所占空间的宽高。"}]}, source: "CSS Transforms"},
        {type: "single-choice", difficulty: "medium", tags: ["多重变换"], question: "transform: rotate(45deg) scale(2)的执行顺序是？", options: ["同时执行", "从左到右", "从右到左", "随机"], correctAnswer: "C", explanation: {title: "变换顺序", sections: [{title: "正确答案", content: "多个transform函数从右到左执行（或理解为后面的先应用）。这个例子先scale再rotate。顺序不同结果不同。"}]}, source: "CSS Transforms"},
        {type: "single-choice", difficulty: "hard", tags: ["matrix"], question: "matrix(a,b,c,d,e,f)中，e和f表示什么？", options: ["缩放", "旋转", "平移", "倾斜"], correctAnswer: "C", explanation: {title: "变换矩阵", sections: [{title: "正确答案", content: "matrix(a,b,c,d,e,f)是2D变换矩阵，e和f表示X和Y方向的平移。a,b,c,d控制缩放、旋转、倾斜的组合效果。"}]}, source: "CSS Transforms"},
        {type: "single-choice", difficulty: "hard", tags: ["百分比平移"], question: "translateX(50%)相对于什么计算？", options: ["父元素宽度", "元素自身宽度", "视口宽度", "包含块宽度"], correctAnswer: "B", explanation: {title: "百分比参考", sections: [{title: "正确答案", content: "translate的百分比相对于元素自身尺寸计算。translateX(50%)表示元素自身宽度的50%。这是与position偏移百分比的重要区别。"}]}, source: "CSS Transforms"},
        {type: "single-choice", difficulty: "hard", tags: ["变换坐标系"], question: "transform会创建新的层叠上下文吗？", options: ["不会", "会", "只有3D变换会", "取决于z-index"], correctAnswer: "B", explanation: {title: "层叠上下文", sections: [{title: "正确答案", content: "任何非none的transform值都会创建新的层叠上下文，即使是2D变换。这会影响子元素的z-index和定位。"}]}, source: "CSS层叠上下文"},
        {type: "multiple-choice", difficulty: "hard", tags: ["变换综合"], question: "关于2D变换，以下说法正确的是？（多选）", options: ["不影响文档流", "可以GPU加速", "会创建包含块", "百分比translate相对于自身"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "2D变换特性", sections: [{title: "正确答案", content: "四个都正确。transform不影响文档流，可以GPU加速，会创建包含块（影响fixed定位），translate百分比相对于元素自身。"}]}, source: "CSS Transforms"}
    ],
    navigation: {
        prev: { title: "动画性能优化", url: "35-animation-performance.html" },
        next: { title: "3D变换", url: "37-3d-transform.html" }
    }
};
