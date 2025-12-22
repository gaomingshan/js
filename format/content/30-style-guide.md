# 第 30 章：团队样式指南

## 概述

团队样式指南是 CSS 规范的文档化呈现，将工具配置转化为人类可读的指导文档。本章介绍如何创建、维护和推广团队的 CSS 样式指南。

## 一、样式指南的价值

### 1.1 为什么需要样式指南

| 价值 | 说明 |
|------|------|
| 统一标准 | 团队成员遵循相同规范 |
| 降低沟通成本 | 减少代码评审中的风格争论 |
| 加速入职 | 新成员快速了解团队约定 |
| 提高质量 | 规范化带来可维护性提升 |

### 1.2 样式指南的组成

```
样式指南
├── 命名规范
├── 文件组织
├── 编写规则
├── 设计令牌
├── 组件规范
└── 工具配置
```

## 二、命名规范文档

### 2.1 类名命名

```markdown
# 类名命名规范

## 命名方法
采用 **BEM** 命名法：`block__element--modifier`

## 规则
- Block: 小写字母，单词用连字符分隔
- Element: 双下划线 `__` 连接
- Modifier: 双连字符 `--` 连接

## 示例

```css
/* Block */
.card { }

/* Element */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier */
.card--featured { }
.card__button--primary { }
```

## 禁止
- ❌ 使用 ID 选择器作为样式钩子
- ❌ 使用驼峰命名（CSS Modules 除外）
- ❌ 使用无意义的名称如 `.box1`, `.style2`
```

### 2.2 CSS 变量命名

```markdown
# CSS 变量命名规范

## 格式
`--{category}-{name}[-{variant}]`

## 分类

| 类别 | 前缀 | 示例 |
|------|------|------|
| 颜色 | `color-` | `--color-primary` |
| 间距 | `spacing-` | `--spacing-md` |
| 字体 | `font-` | `--font-size-lg` |
| 圆角 | `radius-` | `--radius-sm` |
| 阴影 | `shadow-` | `--shadow-md` |
| 层级 | `z-` | `--z-modal` |

## 示例

```css
:root {
  --color-primary: #3498db;
  --color-primary-light: #5dade2;
  --spacing-md: 16px;
  --font-size-base: 16px;
}
```
```

## 三、文件组织规范

### 3.1 目录结构

```markdown
# 样式文件组织

## 目录结构

```
styles/
├── base/               # 基础样式
│   ├── _reset.scss     # 重置样式
│   ├── _typography.scss # 排版
│   └── _variables.scss  # 变量定义
├── components/         # 组件样式
│   ├── _button.scss
│   ├── _card.scss
│   └── _modal.scss
├── layout/             # 布局样式
│   ├── _header.scss
│   ├── _footer.scss
│   └── _grid.scss
├── pages/              # 页面特定样式
│   └── _home.scss
├── utils/              # 工具类
│   ├── _mixins.scss
│   └── _helpers.scss
└── main.scss           # 入口文件
```

## 文件命名
- 部分文件使用下划线前缀：`_button.scss`
- 组件文件与组件同名
- 使用小写字母和连字符
```

### 3.2 导入顺序

```markdown
# 导入顺序规范

按以下顺序组织导入：

```scss
// 1. 变量和配置
@import 'base/variables';
@import 'base/mixins';

// 2. 重置和基础
@import 'base/reset';
@import 'base/typography';

// 3. 布局
@import 'layout/grid';
@import 'layout/header';
@import 'layout/footer';

// 4. 组件
@import 'components/button';
@import 'components/card';
@import 'components/modal';

// 5. 页面
@import 'pages/home';

// 6. 工具类
@import 'utils/helpers';
```
```

## 四、编写规则文档

### 4.1 属性顺序

```markdown
# CSS 属性顺序

按功能分组，遵循从外到内的顺序：

## 顺序

1. **定位属性**
   - position, top, right, bottom, left, z-index

2. **盒模型**
   - display, flex, grid, width, height
   - margin, padding
   - overflow

3. **视觉样式**
   - background, border, border-radius
   - box-shadow

4. **文字样式**
   - font, line-height, text-align
   - color

5. **其他**
   - cursor, transition, animation

## 示例

```css
.element {
  /* 定位 */
  position: relative;
  top: 0;
  z-index: 10;
  
  /* 盒模型 */
  display: flex;
  width: 100%;
  margin: 16px;
  padding: 8px;
  
  /* 视觉 */
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  
  /* 文字 */
  font-size: 14px;
  color: #333;
  
  /* 其他 */
  transition: all 0.2s;
}
```
```

### 4.2 选择器规范

```markdown
# 选择器使用规范

## 推荐
- ✅ 类选择器 `.button`
- ✅ 属性选择器 `[type="text"]`
- ✅ 伪类选择器 `:hover`, `:focus`

## 限制
- ⚠️ 后代选择器最多 3 层
- ⚠️ 特异性尽量保持在 0,2,0 以下

## 禁止
- ❌ ID 选择器 `#header`
- ❌ 通配选择器 `*`（reset 除外）
- ❌ !important（特殊情况除外）

## 特异性示例

```css
/* 好 - 特异性 0,1,0 */
.button { }

/* 好 - 特异性 0,2,0 */
.card .button { }

/* 避免 - 特异性过高 */
.header .nav .nav-list .nav-item .nav-link { }
```
```

### 4.3 值和单位

```markdown
# 值和单位规范

## 单位选择

| 场景 | 推荐单位 |
|------|----------|
| 字体大小 | rem |
| 间距 | px 或 rem |
| 行高 | 无单位数字 |
| 边框 | px |
| 宽高固定 | px |
| 宽高响应 | %, vw, vh |

## 颜色格式
- 优先使用 CSS 变量
- 十六进制使用小写：`#3498db`
- 需要透明度时使用 rgba

## 数值规范
- 零值不带单位：`margin: 0`
- 小数省略前导零：`opacity: .5`
- 避免魔法数字

## 示例

```css
.element {
  /* 好 */
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  opacity: .8;
  
  /* 避免 */
  font-size: 16px;
  line-height: 24px;
  margin: 0px;
  opacity: 0.8;
}
```
```

## 五、组件规范文档

### 5.1 按钮组件

```markdown
# 按钮组件规范

## 类名

| 类名 | 说明 |
|------|------|
| `.btn` | 基础按钮 |
| `.btn--primary` | 主要按钮 |
| `.btn--secondary` | 次要按钮 |
| `.btn--sm` | 小尺寸 |
| `.btn--lg` | 大尺寸 |

## 状态

- `:hover` - 悬停状态
- `:active` - 激活状态
- `:disabled` - 禁用状态
- `.is-loading` - 加载状态

## 使用示例

```html
<button class="btn btn--primary">主要按钮</button>
<button class="btn btn--secondary btn--sm">小型次要按钮</button>
<button class="btn btn--primary" disabled>禁用状态</button>
```

## 样式变量

```css
--btn-padding-x: var(--spacing-md);
--btn-padding-y: var(--spacing-sm);
--btn-font-size: var(--font-size-sm);
--btn-border-radius: var(--radius-md);
```
```

### 5.2 表单组件

```markdown
# 表单组件规范

## 输入框

```html
<div class="form-group">
  <label class="form-label" for="email">邮箱</label>
  <input class="form-input" type="email" id="email">
  <span class="form-hint">请输入有效的邮箱地址</span>
</div>
```

## 状态类

| 类名 | 说明 |
|------|------|
| `.is-invalid` | 验证失败 |
| `.is-valid` | 验证成功 |
| `.is-disabled` | 禁用状态 |

## 间距规范

- 表单组之间：`var(--spacing-lg)`
- 标签与输入框：`var(--spacing-xs)`
- 输入框与提示：`var(--spacing-xs)`
```

## 六、工具配置文档

### 6.1 Stylelint 配置

```markdown
# Stylelint 配置说明

## 安装

```bash
npm install stylelint stylelint-config-standard-scss -D
```

## 配置文件

```json
{
  "extends": [
    "stylelint-config-standard-scss",
    "stylelint-config-prettier"
  ],
  "rules": {
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+)?(--[a-z0-9]+)?$",
    "max-nesting-depth": 3,
    "selector-max-id": 0
  }
}
```

## 命令

```bash
# 检查
npm run lint:css

# 修复
npm run lint:css:fix
```

## 禁用规则

```css
/* stylelint-disable-next-line declaration-no-important */
.override {
  color: red !important;
}
```
```

### 6.2 编辑器配置

```markdown
# 编辑器配置

## VS Code 扩展

必装扩展：
- Stylelint
- Prettier

## 工作区配置

```json
// .vscode/settings.json
{
  "stylelint.validate": ["css", "scss", "vue"],
  "editor.codeActionsOnSave": {
    "source.fixAll.stylelint": true
  }
}
```
```

## 七、实践示例库

### 7.1 代码示例

```markdown
# 代码示例

## 好的实践

```scss
// 清晰的 BEM 结构
.card {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  
  &__header {
    margin-bottom: var(--spacing-sm);
  }
  
  &__title {
    font-size: var(--font-size-lg);
    color: var(--color-text);
  }
  
  &--featured {
    border: 2px solid var(--color-primary);
  }
}
```

## 避免的实践

```scss
// ❌ 过深嵌套
.page .content .sidebar .widget .title { }

// ❌ 使用 ID
#header { }

// ❌ 硬编码值
.element {
  color: #333;
  padding: 17px;
}

// ❌ 滥用 !important
.button {
  background: red !important;
}
```
```

## 八、指南维护

### 8.1 版本管理

```markdown
# 更新日志

## v2.0.0 (2024-01-15)
- 采用 CSS 变量替代 SCSS 变量
- 更新间距系统为 4px 基础
- 新增暗色主题支持

## v1.1.0 (2023-10-01)
- 新增表单组件规范
- 调整颜色命名

## v1.0.0 (2023-06-01)
- 初始版本发布
```

### 8.2 反馈机制

```markdown
# 规范反馈

## 提出建议
1. 在项目仓库创建 Issue
2. 标签选择 `style-guide`
3. 描述建议内容和原因

## 评审流程
1. 团队讨论
2. 投票决定
3. 更新文档
4. 更新 Stylelint 配置

## 联系人
- 前端架构师：xxx
- 设计系统负责人：xxx
```

## 九、推广与培训

### 9.1 入职培训

```markdown
# 新成员 CSS 规范培训

## 培训内容
1. 命名规范 (30min)
2. 文件组织 (15min)
3. 工具使用 (30min)
4. 实践练习 (45min)

## 检查清单
- [ ] 阅读样式指南文档
- [ ] 配置开发环境
- [ ] 完成练习任务
- [ ] 通过代码评审
```

### 9.2 规范检查清单

```markdown
# 代码评审检查清单

## 命名
- [ ] 类名遵循 BEM 规范
- [ ] CSS 变量命名正确
- [ ] 无无意义的命名

## 结构
- [ ] 嵌套不超过 3 层
- [ ] 无 ID 选择器
- [ ] 属性顺序正确

## 值
- [ ] 使用设计令牌
- [ ] 无硬编码颜色值
- [ ] 无 !important

## 工具
- [ ] Stylelint 检查通过
- [ ] Prettier 格式化
```

## 十、样式指南工具

### 10.1 文档生成工具

```bash
# Storybook - 组件文档
npm install @storybook/react -D

# Fractal - 样式指南
npm install @frctl/fractal -D

# Styleguidist - React 组件文档
npm install react-styleguidist -D
```

### 10.2 在线样式指南

```javascript
// Storybook 配置
// .storybook/main.js
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y'
  ]
};
```

## 参考资料

- [Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)
- [Airbnb CSS Style Guide](https://github.com/airbnb/css)
- [CSS Guidelines](https://cssguidelin.es/)
- [Storybook](https://storybook.js.org/)
