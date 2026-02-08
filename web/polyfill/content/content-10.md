# browserslist 配置

## 核心概念

**browserslist** 是一个统一的**目标浏览器配置工具**，让 Babel、Autoprefixer、ESLint 等工具共享同一份目标环境配置。

核心价值：**一次配置，全局生效**

---

## browserslist 的作用

### 解决的问题

**传统方式**：每个工具单独配置

```javascript
// babel.config.js
{
  "targets": "> 0.5%, last 2 versions"
}

// postcss.config.js（Autoprefixer）
{
  "browsers": ["> 0.5%", "last 2 versions"]
}

// .eslintrc.js
{
  "env": {
    "browser": true
  }
}
```

**问题**：
- ❌ 配置重复
- ❌ 容易不一致
- ❌ 维护困难

---

### browserslist 方案

**统一配置**：
```json
// package.json
{
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "not dead"
  ]
}
```

**工具自动读取**：
- Babel 读取 browserslist → 转换语法
- Autoprefixer 读取 browserslist → 添加 CSS 前缀
- ESLint 读取 browserslist → 检查兼容性

---

## 配置语法

### 查询规则详解

#### 1. 使用率查询

```
> 1%              全球使用率 > 1%
> 5% in CN       中国使用率 > 5%
> 0.5% in my stats  根据自定义统计数据
```

---

#### 2. 版本查询

```
last 2 versions        每个浏览器最新 2 个版本
last 2 Chrome versions 仅 Chrome 最新 2 个版本
last 1 year            过去 1 年发布的版本
```

---

#### 3. 浏览器指定

```
chrome >= 80           Chrome 80 及以上
firefox > 75           Firefox 75 以上（不含）
safari 13              Safari 13
ie 11                  IE 11
ios 12                 iOS Safari 12
```

---

#### 4. 状态查询

```
dead                   官方已停止维护（如 IE 10）
not dead               排除已停止维护的浏览器
maintained node versions  维护中的 Node.js 版本
```

---

#### 5. 组合查询

```
> 0.5% and last 2 versions    使用率 > 0.5% 且最新 2 版本
> 1% or ie 11                 使用率 > 1% 或 IE 11
not ie 11                     排除 IE 11
```

---

### 常用查询示例

#### 现代浏览器

```
last 2 versions, > 0.5%, not dead
```

**覆盖**：
- Chrome 108, 107
- Firefox 107, 106
- Safari 16.1, 16.0
- Edge 108, 107

---

#### 兼容 IE11

```
> 0.5%, last 2 versions, ie 11
```

**覆盖**：现代浏览器 + IE 11

---

#### 移动端优先

```
last 2 ios_saf versions, last 2 and_chr versions
```

**覆盖**：
- iOS Safari 最新 2 版本
- Android Chrome 最新 2 版本

---

#### 极致现代

```
last 1 chrome version, last 1 firefox version, last 1 safari version
```

**覆盖**：仅最新版本（实验性项目）

---

## 配置文件位置

### 1. .browserslistrc（推荐）

```
# .browserslistrc

# 生产环境
> 0.5%
last 2 versions
not dead

# 开发环境
[development]
last 1 chrome version
last 1 firefox version
```

**优势**：
- ✅ 独立文件，清晰
- ✅ 支持注释
- ✅ 支持多环境

---

### 2. package.json

```json
{
  "name": "my-app",
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "not dead"
  ]
}
```

**优势**：
- ✅ 集中管理依赖和配置
- ✅ 无需额外文件

---

### 3. browserslist 字段（工具配置中）

```javascript
// babel.config.js
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "> 0.5%, last 2 versions, not dead"
    }]
  ]
}
```

**劣势**：
- ❌ 与其他工具不共享
- ❌ 不推荐

---

### 优先级

```
工具配置中的 targets
  ↓
.browserslistrc
  ↓
package.json 中的 browserslist
  ↓
默认值（defaults）
```

---

## 查询结果查看

### 命令行查看

```bash
# 安装 browserslist
npm install --save-dev browserslist

# 查看匹配的浏览器
npx browserslist
```

**输出示例**：
```
chrome 108
chrome 107
edge 108
edge 107
firefox 107
firefox 106
ios_saf 16.1
ios_saf 16.0
safari 16.1
safari 16.0
```

---

### 查看特定查询

```bash
# 查看 "> 1%" 匹配哪些浏览器
npx browserslist "> 1%"

# 查看多个查询
npx browserslist "> 1%, last 2 versions"

# 查看中国区数据
npx browserslist "> 1% in CN"
```

---

### 查看覆盖率

```bash
npx browserslist --coverage
```

**输出**：
```
These browsers account for 89.5% of all users globally
```

---

## 多环境配置

### 场景：开发 vs 生产

**配置**：
```
# .browserslistrc

# 生产环境（兼容范围广）
[production]
> 0.5%
last 2 versions
not dead

# 开发环境（仅现代浏览器，编译快）
[development]
last 1 chrome version
last 1 firefox version
```

---

### 使用环境变量

```bash
# 生产环境
NODE_ENV=production npm run build

# 开发环境
NODE_ENV=development npm start
```

**Babel 自动读取对应环境配置**

---

### 验证不同环境

```bash
# 查看生产环境配置
NODE_ENV=production npx browserslist

# 查看开发环境配置
NODE_ENV=development npx browserslist
```

---

## 与 Babel 集成

### 自动读取 browserslist

```javascript
// babel.config.js
{
  "presets": ["@babel/preset-env"] // 自动读取 browserslist
}

// .browserslistrc
> 0.5%
last 2 versions
not dead
```

**效果**：Babel 根据 browserslist 决定转换哪些语法

---

### 覆盖 browserslist

```javascript
// babel.config.js（仅 Babel 使用此配置）
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "chrome >= 80" // 覆盖 browserslist
    }]
  ]
}
```

**使用场景**：
- Babel 需要特殊配置
- 不希望影响其他工具

---

## 实战案例：优化构建速度

### 问题：开发环境编译慢

**原因**：配置兼容旧浏览器，转换代码过多

```
# .browserslistrc
> 0.5%, last 2 versions, ie 11
```

**结果**：
- 开发环境编译：10 秒
- 每次修改保存：5 秒热更新

---

### 解决：开发环境仅支持现代浏览器

```
# .browserslistrc

[production]
> 0.5%
last 2 versions
ie 11

[development]
last 1 chrome version
```

**效果**：
- 开发环境编译：2 秒（快 5 倍）
- 每次修改保存：0.5 秒热更新（快 10 倍）

---

## 自定义统计数据

### 使用场景

**问题**：全球数据不代表你的用户

**示例**：
- 全球 Chrome 占比：65%
- 你的用户 Chrome 占比：90%

**需求**：根据实际用户数据配置

---

### 配置自定义数据

**1. 导出 Google Analytics 数据**：
```bash
npx browserslist-ga
```

**2. 生成 browserslist-stats.json**：
```json
{
  "chrome": {
    "108": 0.45,
    "107": 0.32,
    "106": 0.15
  },
  "safari": {
    "16.1": 0.05,
    "16.0": 0.03
  }
}
```

**3. 使用自定义数据**：
```
# .browserslistrc
> 1% in my stats
```

---

## 常见陷阱

### ❌ 陷阱 1：查询语法错误

```
# ❌ 错误
chrome 80          # 缺少比较符
> 1 %              # 多余空格

# ✅ 正确
chrome >= 80
> 1%
```

---

### ❌ 陷阱 2：配置过宽

```
# ❌ 包含已停止维护的浏览器
> 0.1%

# ✅ 排除已停止维护的浏览器
> 0.5%, not dead
```

---

### ❌ 陷阱 3：多处配置不一致

```javascript
// ❌ browserslist 和 Babel 配置不一致
// .browserslistrc
> 1%

// babel.config.js
{
  "targets": "ie 11" // 与 browserslist 不一致
}
```

**解决**：删除 Babel 中的 targets，统一使用 browserslist

---

## 调试技巧

### 查看 Babel 实际使用的配置

```javascript
// babel.config.js
{
  "presets": [
    ["@babel/preset-env", {
      "debug": true // 输出详细信息
    }]
  ]
}
```

**输出**：
```
@babel/preset-env: `DEBUG` option

Using targets:
{
  "chrome": "107",
  "edge": "107",
  "firefox": "106",
  "safari": "16.0"
}
```

---

### 对比不同查询结果

```bash
# 对比查询
npx browserslist "> 1%"
npx browserslist "last 2 versions"
npx browserslist "> 1%, last 2 versions"
```

---

## 推荐配置模板

### 现代前端项目

```
# .browserslistrc

[production]
> 0.5%
last 2 versions
not dead
not op_mini all

[development]
last 1 chrome version
last 1 firefox version
last 1 safari version
```

---

### 企业内部系统

```
# .browserslistrc
chrome >= 80
firefox >= 75
safari >= 13
edge >= 18
```

---

### 移动端项目

```
# .browserslistrc
last 2 ios_saf versions
last 2 and_chr versions
last 2 and_ff versions
```

---

### 兼容 IE11 项目

```
# .browserslistrc

[production]
> 0.5%
last 2 versions
ie 11
not dead

[development]
last 1 chrome version
```

---

## 性能影响对比

### 不同配置的编译结果

**配置 1**：现代浏览器
```
chrome >= 80, firefox >= 75, safari >= 13
```
- 包体积：450 KB
- 编译时间：2 秒

---

**配置 2**：广泛兼容
```
> 0.5%, last 2 versions, not dead
```
- 包体积：480 KB
- 编译时间：3 秒

---

**配置 3**：兼容 IE11
```
> 0.5%, ie 11
```
- 包体积：550 KB
- 编译时间：5 秒

---

## 关键要点

1. **browserslist 作用**：统一目标环境配置，工具共享
2. **配置文件**：推荐使用 `.browserslistrc` 独立文件
3. **常用查询**：`> 0.5%, last 2 versions, not dead`
4. **多环境**：生产环境兼容范围广，开发环境仅现代浏览器
5. **查询结果**：使用 `npx browserslist` 查看匹配的浏览器

---

## 下一步

下一章节将学习 **目标环境与转换策略**，理解不同配置对包体积的影响。
