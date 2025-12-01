# 测试指南

## ✅ 所有文件已就绪！

所有24个数据文件和对应的HTML文件都已创建完成，可以直接在浏览器中测试。

## 📂 文件结构

```
interview/
├── basics/               # HTML文件（24个）
│   ├── 01-intro.html
│   ├── 01-variables.html
│   ├── 01-datatypes.html
│   ├── 01-type-conversion.html
│   ├── 02-operators.html
│   ├── 02-expressions.html
│   ├── 03-conditionals.html
│   ├── 03-loops.html
│   ├── 03-error-handling.html
│   ├── 04-function-basics.html
│   ├── 04-scope.html
│   ├── 04-closure.html
│   ├── 04-this.html
│   ├── 04-call-apply-bind.html
│   ├── 05-object-basics.html
│   ├── 05-arrays.html
│   ├── 05-prototype.html
│   ├── 05-constructor-new.html
│   ├── 05-inheritance.html
│   ├── 06-array-advanced.html
│   ├── 06-typed-array.html
│   ├── 07-strings.html
│   ├── 07-regex.html
│   └── 08-math-date.html
├── data/                 # 数据文件（24个）
│   ├── basics-01-intro.js
│   ├── basics-01-variables.js
│   ├── ... (所有24个数据文件)
│   └── basics-08-math-date.js
├── js/
│   └── quiz-renderer.js  # 渲染引擎
├── css/
│   └── quiz-common.css   # 通用样式
└── index.html            # 导航首页

```

## 🚀 如何测试

### 方法1：直接在浏览器打开（推荐）

1. **打开任意HTML文件**
   - 右键点击 `basics/` 目录下的任何 `.html` 文件
   - 选择"在浏览器中打开"或"Open with Live Server"
   - 例如：`basics/04-closure.html`

2. **查看效果**
   - 页面应该显示标题、描述和10道题目
   - 每道题有选项可以选择
   - 点击"提交答案"检查正误
   - 点击"查看解析"显示详细解析

3. **测试导航**
   - 点击页面底部的"上一节"/"下一节"按钮
   - 确认能正确跳转到相邻章节

### 方法2：使用本地服务器

如果需要更好的开发体验：

```bash
# 使用Python
cd c:/soft/work/code/js/自建/js/interview
python -m http.server 8000

# 或使用Node.js
npx http-server -p 8000

# 或使用VS Code的Live Server扩展
# 右键HTML文件 -> Open with Live Server
```

然后访问：`http://localhost:8000/basics/04-closure.html`

## 🧪 测试检查清单

### 基本功能测试
- [ ] 页面能正常加载
- [ ] 标题和描述显示正确
- [ ] 主题颜色应用正确
- [ ] 10道题目全部显示
- [ ] 难度标签显示正确（🟢简单 🟡中等 🔴困难）
- [ ] 标签（tags）显示正确

### 交互功能测试
- [ ] 点击选项能正常选中（高亮显示）
- [ ] "提交答案"按钮工作正常
- [ ] 正确答案显示绿色✅
- [ ] 错误答案显示红色❌
- [ ] "查看解析"按钮能展开/折叠解析
- [ ] 代码块格式显示正确
- [ ] 列表和段落格式正确

### 导航功能测试
- [ ] "← 返回面试题导航"链接工作
- [ ] 底部"上一节"链接工作
- [ ] 底部"下一节"链接工作
- [ ] 章节之间的跳转正确

## 📋 推荐测试顺序

### 第一批：核心功能（5个文件）
1. `04-closure.html` - 闭包（复杂解析）
2. `04-this.html` - this关键字（多示例）
3. `05-prototype.html` - 原型（图表说明）
4. `05-arrays.html` - 数组（代码密集）
5. `07-regex.html` - 正则（特殊字符）

### 第二批：基础内容（5个文件）
6. `01-intro.html` - JavaScript简介
7. `01-variables.html` - 变量声明
8. `02-operators.html` - 运算符
9. `03-loops.html` - 循环
10. `04-function-basics.html` - 函数基础

### 第三批：高级内容（剩余14个）
11-24. 其余所有文件

## 🐛 可能的问题及解决

### 问题1：页面显示"加载中..."不消失
**原因**：数据文件未正确加载
**解决**：
- 检查浏览器控制台（F12）查看错误
- 确认数据文件路径正确
- 确认数据文件中的全局变量名与HTML中的初始化代码匹配

### 问题2：样式不正常
**原因**：CSS文件未加载
**解决**：
- 确认 `css/quiz-common.css` 文件存在
- 检查路径 `../css/quiz-common.css` 是否正确

### 问题3：点击按钮无反应
**原因**：quiz-renderer.js未加载
**解决**：
- 确认 `js/quiz-renderer.js` 文件存在
- 检查浏览器控制台是否有JS错误

### 问题4：代码块显示为纯文本
**原因**：正常现象，保持代码原样显示
**说明**：代码块使用 `<pre>` 风格，保留格式和缩进

## 💡 验证数据完整性

每个数据文件应包含：
- ✅ config 配置（标题、图标、描述、颜色）
- ✅ questions 数组（10道题）
  - 2道简单题（difficulty: "easy"）
  - 4道中等题（difficulty: "medium"）
  - 4道困难题（difficulty: "hard"）
- ✅ navigation 导航（上一节、下一节）
- ✅ 详细的explanation解析
- ✅ 代码示例

## 📊 测试报告模板

可以创建一个简单的测试报告：

```
测试文件：basics/XX-XXXX.html
测试时间：2024-12-01
浏览器：Chrome 120 / Firefox 121 / Safari 17

✅ 页面加载正常
✅ 题目显示完整（10题）
✅ 交互功能正常
✅ 导航链接正确
⚠️ 发现问题：[描述问题]
💡 建议改进：[描述建议]
```

## 🎯 下一步

测试完成后，可以：
1. 修复发现的问题
2. 优化用户体验
3. 添加更多功能（如进度保存、收藏功能等）
4. 更新 `index.html` 导航页，添加所有新章节的链接

## 🎉 开始测试吧！

现在所有准备工作都已完成，可以直接在浏览器中打开任何HTML文件开始测试！

建议从 `basics/04-closure.html` 开始，这是一个典型的复杂题目，可以全面测试渲染效果。
