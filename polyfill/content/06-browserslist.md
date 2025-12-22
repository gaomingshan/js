# 第 6 章：browserslist 入门

## 概述

browserslist 是一个共享目标浏览器配置的工具。Babel、PostCSS、ESLint 等工具都读取它，实现"一处配置，多处生效"。

## 一、为什么需要 browserslist

### 1.1 问题：配置分散

```javascript
// ❌ 没有 browserslist 时，各工具分别配置
// babel.config.js
{ targets: { chrome: '80', firefox: '78' } }

// postcss.config.js
{ overrideBrowserslist: ['Chrome >= 80', 'Firefox >= 78'] }

// 问题：配置重复、容易不一致
```

### 1.2 解决：统一配置

```ini
# .browserslistrc
Chrome >= 80
Firefox >= 78

# Babel、PostCSS、autoprefixer 自动读取
# 一处配置，多处生效
```

## 二、配置方式

### 2.1 package.json（推荐）

```json
{
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "not dead"
  ]
}
```

### 2.2 .browserslistrc 文件

```ini
# .browserslistrc
> 0.5%
last 2 versions
not dead
```

### 2.3 环境区分

```ini
# .browserslistrc
[production]
> 0.5%
not dead

[development]
last 1 chrome version
last 1 firefox version
```

```json
// package.json
{
  "browserslist": {
    "production": ["> 0.5%", "not dead"],
    "development": ["last 1 chrome version"]
  }
}
```

## 三、查询语法

### 3.1 基础查询

| 查询 | 含义 |
|------|------|
| `> 1%` | 全球市场份额 > 1% |
| `last 2 versions` | 每个浏览器的最后 2 个版本 |
| `not dead` | 排除已停止更新的浏览器 |
| `not IE 11` | 排除 IE 11 |
| `Chrome >= 80` | Chrome 80 及以上 |

### 3.2 浏览器名称

| 名称 | 浏览器 |
|------|--------|
| `chrome` | Google Chrome |
| `firefox` / `ff` | Mozilla Firefox |
| `safari` | Safari |
| `edge` | Microsoft Edge |
| `ie` | Internet Explorer |
| `ios_saf` | iOS Safari |
| `android` | Android WebView |
| `samsung` | Samsung Internet |
| `op_mini` | Opera Mini |

### 3.3 组合查询

```ini
# 并集（OR）：用逗号或换行
> 1%, last 2 versions
# 等价于
> 1%
last 2 versions

# 交集（AND）：用 and
last 2 versions and > 1%

# 排除：用 not
> 1%, not IE 11
```

### 3.4 常用查询示例

```ini
# 现代浏览器
defaults and supports es6-module

# 兼容较旧浏览器（含 IE 11）
> 0.5%, last 2 versions, not dead, IE 11

# 只支持主流现代浏览器
Chrome >= 80, Firefox >= 78, Safari >= 14, Edge >= 88

# 移动端
iOS >= 12, Android >= 8

# Node.js
node 14
node >= 12
current node
```

## 四、特殊查询

### 4.1 defaults

```ini
# defaults 等价于：
> 0.5%, last 2 versions, Firefox ESR, not dead

# 推荐作为基础
defaults
not IE 11
```

### 4.2 supports

```ini
# 只选择支持某特性的浏览器
supports es6-module
supports css-grid
supports flexbox
```

### 4.3 dead

```ini
# dead 指以下浏览器：
# - IE (所有版本)
# - Blackberry
# - 停止更新 24 个月以上的版本

not dead  # 排除这些
```

## 五、调试与验证

### 5.1 命令行查看

```bash
# 查看匹配的浏览器列表
npx browserslist

# 指定查询
npx browserslist "> 1%, not dead"

# 查看覆盖率
npx browserslist --coverage
```

### 5.2 输出示例

```
and_chr 100
chrome 100
chrome 99
edge 100
firefox 98
ios_saf 15.4
safari 15.4
samsung 16.0
```

### 5.3 在线工具

- [browsersl.ist](https://browsersl.ist/) - 可视化查询结果

## 六、与工具集成

### 6.1 Babel

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      // 不写 targets，自动读取 browserslist
    }]
  ]
};
```

### 6.2 PostCSS / autoprefixer

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    'autoprefixer'  // 自动读取 browserslist
  ]
};
```

### 6.3 ESLint

```javascript
// .eslintrc.js
module.exports = {
  // eslint-plugin-compat 使用 browserslist
  plugins: ['compat'],
  extends: ['plugin:compat/recommended']
};
```

### 6.4 Vite

```javascript
// vite.config.js
export default {
  build: {
    target: 'es2015'  // 或使用 browserslist
  }
};
```

## 七、最佳实践

### 7.1 推荐配置

```json
// package.json - 现代项目
{
  "browserslist": [
    "defaults",
    "not IE 11",
    "not op_mini all"
  ]
}
```

```json
// package.json - 需要兼容旧浏览器
{
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "not dead"
  ]
}
```

### 7.2 区分环境

```json
{
  "browserslist": {
    "production": [
      "> 0.5%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version"
    ]
  }
}
```

### 7.3 定期更新

```bash
# 更新 caniuse-lite 数据
npx update-browserslist-db@latest
```

## 八、常见问题

### 8.1 配置不生效？

```bash
# 1. 检查配置文件位置
# browserslist 从当前目录向上查找

# 2. 检查语法
npx browserslist

# 3. 设置环境变量
BROWSERSLIST_ENV=production npx browserslist
```

### 8.2 覆盖率太低？

```bash
# 查看覆盖率
npx browserslist --coverage

# 调整查询条件放宽
```

## 九、总结

| 要点 | 说明 |
|------|------|
| 位置 | package.json 或 .browserslistrc |
| 作用 | Babel、PostCSS、ESLint 共享配置 |
| 语法 | 市场份额、版本号、排除条件 |
| 调试 | `npx browserslist` 查看结果 |
| 更新 | 定期更新 caniuse-lite 数据 |

## 参考资料

- [browserslist GitHub](https://github.com/browserslist/browserslist)
- [browsersl.ist](https://browsersl.ist/) - 在线查询工具
- [Can I Use](https://caniuse.com/) - 浏览器支持数据

---

**下一章** → [第 7 章：Polyfill 概念辨析](./07-polyfill-concept.md)
