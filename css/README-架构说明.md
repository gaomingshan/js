# CSS学习平台 - 架构说明

## ✅ 已完成的基础架构

### 目录结构
```
css/
├── index.html                              # ✅ 总导航页（内容/面试题入口）
├── CSS学习体系设计.md                       # ✅ 完整大纲（52节，520题）
├── 内容生成加速方案.md                      # ✅ 加速方案文档
├── README-架构说明.md                       # ✅ 本文件
│
├── content/                                # 📘 内容学习部分
│   ├── index.html                          # ✅ 内容导航页
│   ├── js/
│   │   └── content-renderer.js             # ✅ 内容渲染引擎
│   ├── css/
│   │   └── content-common.css              # ✅ 内容通用样式
│   ├── templates/
│   │   └── content-template.html           # ✅ 内容通用模板
│   └── data/                               # 📂 待生成：内容数据文件（JSON）
│
└── interview/                              # 📝 面试题部分
    ├── index.html                          # ✅ 面试题导航页
    ├── js/
    │   └── quiz-renderer.js                # ✅ 题目渲染引擎
    ├── css/
    │   └── quiz-common.css                 # ✅ 题目通用样式
    ├── templates/
    │   └── quiz-template.html              # ✅ 题目通用模板
    └── data/                               # 📂 待生成：题目数据文件（JSON）
```

---

## 🎯 工作原理

### 内容学习部分

**数据格式**（JSON）：
```javascript
window.cssContentData_Section01 = {
  section: {
    id: 1,
    title: "CSS基础与引入方式",
    icon: "📖",
    topics: [
      {
        id: "what-is-css",
        title: "什么是CSS",
        type: "concept",  // 类型：concept / interactive-demo / comparison / principle / code-example
        content: {
          description: "...",
          keyPoints: ["要点1", "要点2"],
          mdn: "MDN链接"
        }
      }
    ]
  },
  navigation: {
    prev: { title: "...", url: "..." },
    next: { title: "...", url: "..." }
  }
};
```

**支持的内容类型**：
1. **concept** - 概念解释（文字说明 + 核心要点）
2. **interactive-demo** - 交互演示（可编辑的HTML/CSS/JS示例）
3. **comparison** - 对比分析（多种方案的优缺点对比）
4. **principle** - 原理解析（工作机制 + 执行步骤 + 图示）
5. **code-example** - 代码示例（多个代码示例 + 效果说明）

---

### 面试题部分

**数据格式**（JSON）：
```javascript
window.cssQuizData_Chapter01 = {
  config: {
    title: "CSS基础与语法",
    icon: "📖",
    description: "CSS简介、语法结构、引入方式",
    primaryColor: "#667eea",
    bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  questions: [
    {
      type: "single-choice",  // 类型：single-choice / multiple-choice / code-output / true-false / code-completion
      difficulty: "easy",     // 难度：easy / medium / hard
      tags: ["CSS基础", "语法"],
      question: "CSS代表什么？",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      explanation: {
        title: "解析标题",
        sections: [...]
      },
      source: "MDN / W3C / 其他"
    }
  ],
  navigation: {
    prev: { title: "...", url: "..." },
    next: { title: "...", url: "..." }
  }
};
```

**支持的题型**：
1. **single-choice** - 单选题
2. **multiple-choice** - 多选题
3. **code-output** - 代码输出题
4. **true-false** - 判断题
5. **code-completion** - 代码补全题

---

## 🚀 生成流程

### 方案：批量生成 + 数据与渲染分离

**第一步：我批量生成数据文件**
- 一次生成**整章内容**（3个小节，每节若干知识点）
- 一次生成**整章题目**（30道题，2简单+4中等+4困难）
- 输出为JSON数据文件

**第二步：您创建对应的HTML页面**
- 复制模板文件
- 修改数据文件引用
- 渲染器自动处理显示

**效率提升**：
- 内容学习：从手写1000行HTML → 只需200行JSON（**5倍速度**）
- 面试题库：从逐题编写 → 批量30题（**3-5倍速度**）

---

## 📋 接下来的工作

### 立即开始生成第1章

**第1章：CSS核心概念（3节）**
1. CSS基础与引入方式
2. CSS语法结构
3. CSS工作流程概览

**我将一次性生成**：
- ✅ `content/data/section-01.js` - 内容学习数据
- ✅ `interview/data/chapter-01.js` - 面试题数据（30题）

**您只需**：
- 复制模板创建HTML文件
- 引用对应的数据文件

---

## 💡 示例：如何使用模板

### 创建内容学习页面
```html
<!-- 复制 content/templates/content-template.html -->
<!-- 重命名为 01-basics.html -->
<!-- 修改第26行的数据文件引用 -->
<script src="data/section-01.js"></script>
```

### 创建面试题页面
```html
<!-- 复制 interview/templates/quiz-template.html -->
<!-- 重命名为 01-basics.html -->
<!-- 修改第39行的数据文件引用 -->
<script src="data/chapter-01.js"></script>
```

---

## ✨ 准备就绪

基础架构已全部完成！现在可以开始批量生成内容了！

**请确认是否开始生成第1章？**
