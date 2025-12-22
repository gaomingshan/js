# 第 34 章：规范文档建设

## 概述

代码规范工具配置只是规范落地的一部分，完善的文档体系才能让团队成员理解规范背后的原因，自觉遵守而非被动应付。本章介绍如何构建可维护、易理解的规范文档。

## 一、文档体系结构

### 1.1 文档层次

```
规范文档体系
├── 快速开始指南          # 5分钟上手
├── 规范详细说明          # 完整规则解释
├── 示例代码库            # 好/坏代码对比
├── 常见问题FAQ           # 疑难解答
├── 工具配置指南          # 环境搭建
└── 更新日志              # 版本变化
```

### 1.2 文档目录结构

```
docs/
├── README.md              # 文档首页
├── getting-started.md     # 快速开始
├── rules/
│   ├── javascript.md      # JS 规范
│   ├── typescript.md      # TS 规范
│   ├── react.md           # React 规范
│   ├── css.md             # CSS 规范
│   └── naming.md          # 命名规范
├── tools/
│   ├── eslint.md          # ESLint 配置
│   ├── prettier.md        # Prettier 配置
│   └── editor.md          # 编辑器配置
├── examples/              # 示例代码
├── faq.md                 # 常见问题
└── changelog.md           # 更新日志
```

## 二、快速开始指南

### 2.1 文档模板

```markdown
# 代码规范快速开始

## 环境准备

### 1. 克隆项目后自动安装依赖
```bash
npm install
```

### 2. 配置编辑器
安装以下 VS Code 扩展：
- ESLint
- Prettier

### 3. 验证配置
```bash
npm run lint
```

## 开发流程

1. 编写代码
2. 保存文件（自动格式化）
3. 提交代码（自动检查）

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run lint` | 检查代码规范 |
| `npm run lint:fix` | 自动修复问题 |
| `npm run format` | 格式化代码 |

## 遇到问题？
查看 [FAQ](./faq.md) 或联系 @frontend-team
```

### 2.2 检查清单

```markdown
# 新成员入职检查清单

- [ ] 阅读本快速开始指南
- [ ] 安装推荐的编辑器扩展
- [ ] 运行 `npm run lint` 确认环境正常
- [ ] 阅读 [命名规范](./rules/naming.md)
- [ ] 完成一次代码提交，确认 Git Hooks 生效
```

## 三、规范详细说明

### 3.1 规则文档模板

```markdown
# JavaScript 代码规范

## 变量声明

### 规则：优先使用 const

**原因**：const 声明表明变量不会被重新赋值，提高代码可读性。

**配置**：
```json
{
  "prefer-const": "error",
  "no-var": "error"
}
```

**示例**：
```javascript
// ✅ 正确
const name = 'Alice';
const items = [];
items.push('item');  // 修改内容可以

// ❌ 错误
var name = 'Alice';
let count = 10;  // 如果不会重新赋值，应该用 const
```

### 规则：使用全等比较

**原因**：`===` 避免类型转换带来的意外结果。

**配置**：
```json
{
  "eqeqeq": ["error", "always"]
}
```

**示例**：
```javascript
// ✅ 正确
if (value === null) { }
if (count === 0) { }

// ❌ 错误
if (value == null) { }
if (count == '0') { }
```

**例外**：
```javascript
// 允许使用 == null 同时检查 null 和 undefined
if (value == null) { }  // eslint-disable-line eqeqeq
```
```

### 3.2 规则分类

```markdown
# 规则分类

## 必须遵守（Error）
这些规则违反会导致严重问题，必须修复：
- `no-debugger` - 禁止 debugger
- `no-unused-vars` - 禁止未使用变量
- `no-undef` - 禁止未定义变量

## 强烈建议（Warning）
这些规则有助于代码质量，建议遵守：
- `prefer-const` - 优先使用 const
- `no-console` - 避免 console

## 风格建议（Info）
这些规则主要影响代码风格：
- `quotes` - 引号风格
- `semi` - 分号风格
```

## 四、示例代码库

### 4.1 好坏代码对比

```markdown
# 代码示例

## 函数命名

### ❌ 不推荐
```javascript
// 命名不清晰
function fn(d) {
  return d.filter(i => i.a > 0);
}

// 过于简短
function calc(a, b) {
  return a + b;
}
```

### ✅ 推荐
```javascript
// 清晰的命名
function filterActiveUsers(users) {
  return users.filter(user => user.isActive);
}

// 描述性命名
function calculateTotalPrice(items, taxRate) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 + taxRate);
}
```

## 组件结构

### ❌ 不推荐
```jsx
function Card(props) {
  return <div style={{padding: '16px', border: '1px solid #ddd'}}>
    <h2>{props.title}</h2>
    <p>{props.description}</p>
    {props.showButton && <button onClick={() => props.onAction()}>Action</button>}
  </div>
}
```

### ✅ 推荐
```jsx
function Card({ title, description, showButton, onAction }) {
  return (
    <div className="card">
      <h2 className="card__title">{title}</h2>
      <p className="card__description">{description}</p>
      {showButton && (
        <button className="card__button" onClick={onAction}>
          Action
        </button>
      )}
    </div>
  );
}
```
```

### 4.2 真实项目示例

```markdown
# 项目示例

## 目录结构
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx        # 组件实现
│   │   ├── Button.module.css # 样式
│   │   ├── Button.test.tsx   # 测试
│   │   └── index.ts          # 导出
│   └── Card/
├── hooks/
│   └── useAuth.ts
├── utils/
│   └── format.ts
└── pages/
    └── Home/
```

## 组件文件示例

```typescript
// components/Button/Button.tsx
import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}) => {
  const className = `${styles.button} ${styles[variant]} ${styles[size]}`;

  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
};
```
```

## 五、常见问题 FAQ

### 5.1 FAQ 文档模板

```markdown
# 常见问题

## ESLint 相关

### Q: 保存时不自动修复怎么办？
**A:** 检查 VS Code 设置：
1. 确认安装了 ESLint 扩展
2. 检查 `.vscode/settings.json` 配置
3. 查看 VS Code 输出面板的 ESLint 日志

### Q: 如何临时禁用某条规则？
**A:** 使用注释禁用：
```javascript
// 禁用下一行
// eslint-disable-next-line no-console
console.log('debug');

// 禁用整个文件
/* eslint-disable no-console */
```

### Q: 为什么有些规则不能自动修复？
**A:** 涉及代码逻辑的规则（如 `no-unused-vars`）需要人工判断，无法自动修复。

## Prettier 相关

### Q: Prettier 和 ESLint 冲突怎么办？
**A:** 确保配置了 `eslint-config-prettier`：
```javascript
extends: ['eslint:recommended', 'prettier']  // prettier 放最后
```

### Q: 如何让某些文件不被格式化？
**A:** 添加到 `.prettierignore`：
```
dist/
*.min.js
```

## Git Hooks 相关

### Q: 如何跳过 pre-commit 检查？
**A:** 使用 `--no-verify` 参数（仅紧急情况）：
```bash
git commit --no-verify -m "hotfix"
```

### Q: lint-staged 报错怎么处理？
**A:** 
1. 运行 `npm run lint:fix` 修复问题
2. 如无法自动修复，手动修改后重新提交
```

## 六、工具配置指南

### 6.1 编辑器配置文档

```markdown
# 编辑器配置指南

## VS Code

### 必装扩展
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Stylelint** - 样式检查

### 配置文件
项目已包含 `.vscode/settings.json`，克隆后自动生效。

手动配置：
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

## WebStorm

### 配置步骤
1. Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. 选择 "Automatic ESLint configuration"
3. 勾选 "Run eslint --fix on save"

### Prettier 配置
1. Settings → Languages & Frameworks → JavaScript → Prettier
2. 勾选 "Run on save"
```

## 七、更新日志

### 7.1 更新日志模板

```markdown
# 更新日志

## [2.0.0] - 2024-01-15

### 重大变更
- 升级 ESLint 到 v9，采用 flat config 格式
- 移除对 Node.js 14 的支持

### 新增
- 添加 `@typescript-eslint/strict` 规则集
- 新增 React Hooks 相关规则

### 变更
- `no-console` 从 error 降级为 warn
- 调整 `max-len` 从 80 改为 100

### 修复
- 修复 Vue SFC 解析问题

---

## [1.2.0] - 2023-10-01

### 新增
- 添加 Stylelint 配置
- 新增 CSS 命名规范文档

### 变更
- 更新 Prettier 配置，启用尾逗号

---

## [1.0.0] - 2023-06-01
- 初始版本发布
```

## 八、文档维护

### 8.1 文档更新流程

```markdown
# 文档更新流程

## 触发条件
- 新增/修改规则
- 工具版本升级
- 团队反馈需求

## 更新步骤
1. 在 `docs/` 目录修改相关文档
2. 更新 `changelog.md`
3. 提交 PR，标记为 `docs`
4. 团队评审后合并

## 文档规范
- 使用 Markdown 格式
- 代码示例需可运行
- 包含"好"与"坏"的对比示例
```

### 8.2 文档生成工具

```bash
# 使用 VitePress 构建文档站点
npm install vitepress -D
```

```javascript
// docs/.vitepress/config.js
export default {
  title: '前端代码规范',
  themeConfig: {
    nav: [
      { text: '指南', link: '/getting-started' },
      { text: '规则', link: '/rules/javascript' }
    ],
    sidebar: [
      { text: '快速开始', link: '/getting-started' },
      {
        text: '规则',
        items: [
          { text: 'JavaScript', link: '/rules/javascript' },
          { text: 'TypeScript', link: '/rules/typescript' }
        ]
      }
    ]
  }
};
```

## 九、最佳实践

| 实践 | 说明 |
|------|------|
| 简洁明了 | 避免冗长描述，直接给出规则和示例 |
| 解释原因 | 每条规则说明"为什么" |
| 代码示例 | 用实际代码展示好坏对比 |
| 及时更新 | 规则变更时同步更新文档 |
| 易于搜索 | 使用清晰的标题和关键词 |

## 参考资料

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [VitePress](https://vitepress.dev/)
