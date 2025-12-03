// 第43章：图形函数 - 面试题
window.cssQuizData_Chapter43 = {
    config: {
        title: "图形函数",
        icon: "✂️",
        description: "clip-path、shape-outside",
        primaryColor: "#43e97b",
        bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
    questions: [
        {type: "single-choice", difficulty: "easy", tags: ["clip-path基础"], question: "clip-path的作用是？", options: ["裁剪路径", "绘制路径", "动画路径", "变换路径"], correctAnswer: "A", explanation: {title: "clip-path裁剪", sections: [{title: "正确答案", content: "clip-path定义元素的可见区域（裁剪路径），区域外的部分被裁剪掉。可以创建圆形、多边形等各种形状。"}]}, source: "CSS Masking"},
        {type: "single-choice", difficulty: "easy", tags: ["circle函数"], question: "clip-path: circle(50%)的效果是？", options: ["正方形", "圆形", "椭圆", "多边形"], correctAnswer: "B", explanation: {title: "circle裁剪", sections: [{title: "正确答案", content: "circle()创建圆形裁剪区域。50%是半径，默认圆心在元素中心。可以创建完美的圆形头像等效果。"}]}, source: "CSS Masking"},
        {type: "single-choice", difficulty: "medium", tags: ["polygon函数"], question: "polygon()至少需要几个点？", options: ["1个", "2个", "3个", "4个"], correctAnswer: "C", explanation: {title: "polygon多边形", sections: [{title: "正确答案", content: "polygon()至少需要3个点才能构成一个闭合多边形（三角形）。可以定义任意多边形，如clip-path: polygon(0 0, 100% 0, 50% 100%)创建三角形。"}]}, source: "CSS Masking"},
        {type: "single-choice", difficulty: "medium", tags: ["shape-outside"], question: "shape-outside的作用是？", options: ["裁剪元素", "定义文字环绕形状", "创建形状", "变换形状"], correctAnswer: "B", explanation: {title: "文字环绕", sections: [{title: "正确答案", content: "shape-outside定义浮动元素周围的文字环绕形状。可以创建圆形、多边形等形状的文字环绕效果，而不是默认的矩形。"}]}, source: "CSS Shapes"},
        {type: "single-choice", difficulty: "medium", tags: ["ellipse函数"], question: "ellipse()与circle()的区别？", options: ["没区别", "ellipse可以不同的横纵半径", "ellipse是矩形", "ellipse更快"], correctAnswer: "B", explanation: {title: "椭圆裁剪", sections: [{title: "正确答案", content: "ellipse()可以指定不同的横向和纵向半径，创建椭圆。circle()是ellipse()的特例（两个半径相等）。"}]}, source: "CSS Masking"},
        {type: "single-choice", difficulty: "medium", tags: ["inset函数"], question: "inset()裁剪的形状是？", options: ["圆形", "矩形", "三角形", "任意形状"], correctAnswer: "B", explanation: {title: "inset矩形裁剪", sections: [{title: "正确答案", content: "inset()创建矩形裁剪区域，可以指定四个方向的偏移量和圆角半径。如inset(10px 20px round 5px)。"}]}, source: "CSS Masking"},
        {type: "single-choice", difficulty: "hard", tags: ["SVG路径"], question: "clip-path可以引用SVG路径吗？", options: ["不可以", "可以用url()引用", "可以用path()函数", "两者都可以"], correctAnswer: "D", explanation: {title: "SVG路径裁剪", sections: [{title: "正确答案", content: "clip-path支持url(#svg-id)引用SVG中的<clipPath>，也支持path()函数直接使用SVG路径数据，实现复杂形状裁剪。"}]}, source: "CSS Masking"},
        {type: "single-choice", difficulty: "hard", tags: ["clip-path动画"], question: "clip-path可以动画过渡吗？", options: ["不可以", "可以，但有限制", "完全支持", "只支持某些函数"], correctAnswer: "B", explanation: {title: "clip-path动画", sections: [{title: "正确答案", content: "clip-path支持动画，但要求起始和结束形状使用相同的函数和相同数量的点。如polygon之间可以过渡，但polygon到circle不能直接过渡。"}]}, source: "CSS Masking"},
        {type: "single-choice", difficulty: "hard", tags: ["shape-margin"], question: "shape-margin的作用是？", options: ["元素外边距", "形状外边距", "文字与形状的距离", "裁剪边距"], correctAnswer: "C", explanation: {title: "shape-margin", sections: [{title: "正确答案", content: "shape-margin定义文字与shape-outside定义的形状之间的距离，类似margin但只影响文字环绕，不影响元素本身。"}]}, source: "CSS Shapes"},
        {type: "multiple-choice", difficulty: "hard", tags: ["图形函数综合"], question: "关于CSS图形函数，以下说法正确的是？（多选）", options: ["clip-path会影响元素的可点击区域", "shape-outside只对浮动元素有效", "可以用于创建非矩形布局", "支持响应式（使用百分比）"], correctAnswer: ["A", "B", "C", "D"], explanation: {title: "图形函数特性", sections: [{title: "正确答案", content: "四个都正确。clip-path裁剪后的不可见区域不可点击；shape-outside必须用于float元素；可以创建创意布局；支持百分比等响应式单位。"}]}, source: "CSS Masking & Shapes"}
    ],
    navigation: {
        prev: { title: "计算函数", url: "42-calc-functions.html" },
        next: { title: "CSS方法论", url: "44-css-methodology.html" }
    }
};
