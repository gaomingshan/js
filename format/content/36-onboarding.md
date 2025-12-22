# 第 36 章：新成员培训

## 概述

新成员快速适应团队代码规范是规范落地的关键环节。系统化的培训流程能减少入职适应期，避免因规范不熟悉导致的反复修改。本章介绍如何设计新成员的规范培训体系。

## 一、培训目标

### 1.1 能力要求

| 阶段 | 时间 | 目标 |
|------|------|------|
| 基础 | 第1天 | 了解规范体系，配置开发环境 |
| 熟悉 | 第1周 | 能按规范编写代码，通过 lint 检查 |
| 掌握 | 第1月 | 理解规范原理，能进行代码评审 |

### 1.2 培训内容概览

```
Day 1: 环境配置 + 工具使用
Day 2-3: 命名规范 + 代码风格
Day 4-5: 框架规范 + 最佳实践
Week 2: 实战练习 + 代码评审
```

## 二、第一天：环境配置

### 2.1 开发环境清单

```markdown
# 新成员环境配置清单

## 必装软件
- [ ] Node.js 20.x
- [ ] VS Code
- [ ] Git

## VS Code 扩展
- [ ] ESLint
- [ ] Prettier
- [ ] Stylelint
- [ ] GitLens

## 项目配置
- [ ] 克隆项目仓库
- [ ] 运行 `npm install`
- [ ] 确认 `npm run lint` 通过
- [ ] 测试保存时自动格式化

## 验证步骤
1. 创建测试文件 `test.js`
2. 写入 `var x = 1`
3. 保存，确认自动改为 `const x = 1;`
4. 删除测试文件
```

### 2.2 常见配置问题

```markdown
# 环境配置常见问题

## Q: ESLint 扩展不工作
A: 检查以下项目：
1. VS Code 是否安装了 ESLint 扩展
2. 项目是否有 `node_modules`
3. 查看 VS Code 输出面板 → ESLint

## Q: 保存时不自动格式化
A: 确认 VS Code 设置：
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## Q: Git Hooks 不执行
A: 运行 `npm run prepare` 重新安装 Husky
```

## 三、命名规范培训

### 3.1 培训材料

```markdown
# 命名规范培训

## 学习目标
- 掌握变量、函数、组件的命名规则
- 理解命名背后的原则

## 核心原则
1. **清晰表达意图** - 看名字就知道用途
2. **一致性** - 同类事物用同样的命名模式
3. **适当长度** - 不过长也不过短

## 命名规则速查

| 类型 | 规则 | 示例 |
|------|------|------|
| 变量 | camelCase | `userName`, `isActive` |
| 常量 | UPPER_SNAKE | `MAX_COUNT`, `API_URL` |
| 函数 | camelCase + 动词 | `getUserById`, `handleClick` |
| 组件 | PascalCase | `UserProfile`, `Button` |
| CSS类 | kebab-case | `user-card`, `btn-primary` |
| 文件 | kebab-case 或 PascalCase | `user-utils.ts`, `UserCard.tsx` |

## 练习题
1. 给一个"获取用户列表"的函数命名
2. 给一个"是否显示弹窗"的变量命名
3. 给一个"用户头像"组件命名
```

### 3.2 命名练习

```markdown
# 命名练习

## 练习1：变量命名
将以下变量改为符合规范的命名：
```javascript
// 修改前
var x = 10;           // 数量
var flag = true;      // 是否已登录
var arr = [];         // 用户列表
var Obj = {};         // 配置项

// 修改后
const count = 10;
const isLoggedIn = true;
const userList = [];
const config = {};
```

## 练习2：函数命名
```javascript
// 修改前
function do(id) { }      // 获取用户
function check(data) { } // 验证表单
function fn(list) { }    // 过滤已删除项

// 修改后
function getUserById(id) { }
function validateForm(data) { }
function filterDeletedItems(list) { }
```
```

## 四、代码风格培训

### 4.1 ES6+ 规范

```markdown
# 现代 JavaScript 规范

## 变量声明
```javascript
// ✅ 使用 const 和 let
const name = 'Alice';
let count = 0;

// ❌ 不使用 var
var oldStyle = 'bad';
```

## 箭头函数
```javascript
// ✅ 简洁的箭头函数
const add = (a, b) => a + b;
const getUser = id => users.find(u => u.id === id);

// ✅ 复杂逻辑使用普通函数
function processData(data) {
  // 多行逻辑
}
```

## 解构赋值
```javascript
// ✅ 对象解构
const { name, age } = user;

// ✅ 数组解构
const [first, second] = items;

// ✅ 参数解构
function greet({ name, title }) {
  return `Hello, ${title} ${name}`;
}
```

## 模板字符串
```javascript
// ✅ 使用模板字符串
const message = `Hello, ${name}!`;

// ❌ 不使用字符串拼接
const message = 'Hello, ' + name + '!';
```
```

### 4.2 React 规范

```markdown
# React 代码规范

## 组件定义
```jsx
// ✅ 函数组件 + TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  onClick,
}) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

## Hooks 使用
```jsx
// ✅ 正确的依赖数组
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// ✅ 使用 useCallback 优化
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []);
```

## 条件渲染
```jsx
// ✅ 简洁的条件渲染
{isVisible && <Modal />}
{items.length > 0 ? <List items={items} /> : <Empty />}

// ❌ 避免复杂的三元表达式
{condition1 ? (condition2 ? <A /> : <B />) : <C />}
```
```

## 五、实战练习

### 5.1 练习任务

```markdown
# 规范实战练习

## 任务1：重构遗留代码
将以下代码改为符合规范的写法：

```javascript
// 原始代码
var getUserData = function(id, callback) {
  var url = '/api/user/' + id;
  fetch(url).then(function(res) {
    return res.json();
  }).then(function(data) {
    callback(null, data);
  }).catch(function(err) {
    callback(err);
  });
}
```

## 任务2：编写新组件
创建一个 `UserCard` 组件：
- Props: `user` (包含 name, avatar, role)
- 显示头像、姓名、角色
- 使用 BEM 命名 CSS
- 添加 TypeScript 类型

## 任务3：代码评审
评审以下 PR，找出不符合规范的地方：
[练习 PR 链接]
```

### 5.2 评审标准

```markdown
# 练习评审标准

## 命名（30分）
- 变量命名清晰：10分
- 函数命名规范：10分
- 组件命名正确：10分

## 代码风格（30分）
- 使用 const/let：10分
- 使用解构：10分
- 使用模板字符串：10分

## React 规范（30分）
- TypeScript 类型完整：10分
- Hooks 使用正确：10分
- 组件结构合理：10分

## 额外加分（10分）
- 代码简洁优雅：5分
- 添加适当注释：5分
```

## 六、培训评估

### 6.1 知识测验

```markdown
# 代码规范知识测验

## 选择题

1. 以下哪种变量声明方式是推荐的？
   A. var count = 0
   B. let count = 0
   C. const count = 0
   D. 视情况用 B 或 C

2. React 组件命名应该使用：
   A. camelCase
   B. PascalCase
   C. kebab-case
   D. UPPER_CASE

## 代码题

3. 修正以下代码中的规范问题：
```javascript
var userList = []
function get_users(cb) {
  fetch('/api/users').then(res => {
    return res.json()
  }).then(data => {
    userList = data
    cb(data)
  })
}
```

## 答案
1. D
2. B
3. （参考答案见培训材料）
```

### 6.2 代码提交评估

```markdown
# 首次代码提交评估

## 评估标准
- [ ] Lint 检查通过
- [ ] PR 描述清晰
- [ ] 代码符合命名规范
- [ ] 没有被评审指出规范问题

## 评估结果
- 通过：可以独立开发
- 需改进：指出具体问题，继续学习
```

## 七、培训资源

### 7.1 学习路径

```markdown
# 推荐学习路径

## 必读文档
1. [快速开始指南](./getting-started.md) - 30分钟
2. [命名规范](./rules/naming.md) - 1小时
3. [JavaScript 规范](./rules/javascript.md) - 2小时
4. [React 规范](./rules/react.md) - 2小时

## 推荐阅读
- Airbnb JavaScript Style Guide
- React 官方文档 - Hooks 章节

## 视频教程
- ESLint 配置与使用 - 内部录制
- 代码评审实战 - 内部录制
```

### 7.2 求助渠道

```markdown
# 求助渠道

## 即时沟通
- Slack: #frontend-help
- 企业微信: 前端技术群

## 导师制度
新成员入职后分配一位导师：
- 解答规范相关问题
- 指导前几次代码评审
- 定期 1:1 沟通

## 文档反馈
发现文档问题请提 Issue：
[规范文档仓库链接]
```

## 八、培训清单模板

```markdown
# 新成员培训检查清单

姓名：___________  入职日期：___________

## Day 1
- [ ] 完成环境配置
- [ ] 阅读快速开始指南
- [ ] 确认 lint 和格式化工作正常

## Day 2-3
- [ ] 学习命名规范
- [ ] 完成命名练习
- [ ] 学习 JavaScript 规范

## Day 4-5
- [ ] 学习 React 规范
- [ ] 学习 CSS 规范
- [ ] 完成知识测验

## Week 2
- [ ] 完成实战练习任务
- [ ] 提交首个功能 PR
- [ ] 参与一次代码评审

## 签字确认
新成员：___________  日期：___________
导师：___________  日期：___________
```

## 九、最佳实践

| 实践 | 说明 |
|------|------|
| 渐进式学习 | 不要一次灌输太多内容 |
| 动手实践 | 阅读文档后立即练习 |
| 及时反馈 | 练习后及时评审和反馈 |
| 导师支持 | 分配导师解答疑问 |
| 持续改进 | 收集反馈优化培训内容 |

## 参考资料

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
