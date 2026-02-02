# 语义化版本（semver）规范

## semver 版本号结构与语义

### 基本格式

```
主版本号.次版本号.修订号
MAJOR.MINOR.PATCH
```

**示例**：`react@18.2.0`
- **MAJOR (18)**：不兼容的 API 变更
- **MINOR (2)**：向后兼容的功能新增
- **PATCH (0)**：向后兼容的问题修复

### 语义约定

**MAJOR 升级场景**：
```javascript
// v1.x.x
function fetchData(url) { ... }

// v2.0.0 - 破坏性变更
async function fetchData(url, options) { ... }  // 新增必需参数
```

**MINOR 升级场景**：
```javascript
// v1.1.0 - 新增功能，不影响现有 API
function fetchData(url, options = {}) { ... }  // 可选参数
```

**PATCH 升级场景**：
```javascript
// v1.1.1 - 修复 bug
function fetchData(url, options = {}) {
  // 修复了内存泄漏问题
  ...
}
```

---

## 版本范围表达式

### 常用符号

**^ (Caret) - 兼容版本范围**：
```json
{
  "dependencies": {
    "react": "^18.2.0"
  }
}
```

**匹配规则**：
```
^18.2.0  →  >=18.2.0 <19.0.0
^0.2.3   →  >=0.2.3 <0.3.0   (0.x 特殊处理)
^0.0.3   →  >=0.0.3 <0.0.4   (0.0.x 严格锁定)
```

**设计初衷**：允许自动升级次版本和修订版，假设遵循 semver 不会引入破坏性变更。

**~ (Tilde) - 补丁版本范围**：
```json
{
  "dependencies": {
    "lodash": "~4.17.0"
  }
}
```

**匹配规则**：
```
~4.17.0  →  >=4.17.0 <4.18.0
~4.17    →  >=4.17.0 <4.18.0
~4       →  >=4.0.0 <5.0.0
```

**使用场景**：更保守的升级策略，只允许修复性更新。

### 比较运算符

**精确匹配**：
```json
{
  "react": "18.2.0"  // 只安装 18.2.0
}
```

**范围匹配**：
```json
{
  "express": ">=4.16.0 <5.0.0",
  "koa": ">2.0.0",
  "webpack": "5.x"
}
```

**逻辑或 (||)**：
```json
{
  "node-sass": "^4.0.0 || ^5.0.0 || ^6.0.0"
}
```

### 特殊符号

**通配符 (*)**：
```json
{
  "babel-core": "*"  // 任意版本（不推荐）
}
```

**最新标签 (latest)**：
```bash
npm install react@latest
```

---

## 预发布版本与构建元数据

### 预发布版本

**格式**：`MAJOR.MINOR.PATCH-prerelease`

**常见标识**：
```
1.0.0-alpha.1    # Alpha 版（内部测试）
1.0.0-beta.2     # Beta 版（公开测试）
1.0.0-rc.1       # Release Candidate（候选版本）
1.0.0-next.3     # Next 版（实验性功能）
```

**版本排序**：
```
1.0.0-alpha.1 < 1.0.0-alpha.2 < 1.0.0-beta.1 < 1.0.0-rc.1 < 1.0.0
```

**安装预发布版本**：
```bash
# 显式指定
npm install react@18.3.0-next.1

# 使用标签
npm install react@next
```

**package.json 中的声明**：
```json
{
  "dependencies": {
    "react": "18.3.0-next.1",      // 固定预发布版本
    "vue": "^3.3.0-beta.1"         // ⚠️ ^ 不会匹配预发布版本
  }
}
```

### 构建元数据

**格式**：`MAJOR.MINOR.PATCH+metadata`

**示例**：
```
1.0.0+20231201
1.0.0+build.123
1.0.0-beta.1+exp.sha.5114f85
```

**关键特性**：
- 构建元数据不参与版本比较
- `1.0.0+build.1` == `1.0.0+build.2`
- npm 会忽略构建元数据

---

## 版本解析与兼容性判断

### 解析算法

**输入**：版本范围表达式
**输出**：匹配的版本列表

```javascript
// 伪代码
function resolveVersion(packageName, versionRange) {
  // 1. 查询 registry 获取所有可用版本
  const availableVersions = await fetchVersions(packageName);
  
  // 2. 过滤满足范围的版本
  const matched = availableVersions.filter(v => 
    semver.satisfies(v, versionRange)
  );
  
  // 3. 返回最高版本
  return semver.maxSatisfying(matched, versionRange);
}
```

**示例**：
```
可用版本：[18.0.0, 18.1.0, 18.2.0, 18.2.1, 19.0.0]
范围：^18.2.0
结果：18.2.1  ← 最高的兼容版本
```

### 兼容性判断

**语义化版本的承诺**：
```
如果 A 依赖 B@^1.2.0，则：
- B@1.2.1 应该可以安全替换 B@1.2.0
- B@1.3.0 应该可以安全替换 B@1.2.0
- B@2.0.0 不能替换 B@1.2.0
```

**现实问题**：
```javascript
// lodash@4.17.20 有一个函数
_.get(obj, 'a.b.c')

// lodash@4.17.21 修复了边界情况
_.get(null, 'a.b.c')  // 行为可能改变

// 虽然是 PATCH 版本，但可能破坏现有代码
```

---

## 常见误区

### 误区 1：semver 保证绝对兼容

**真相**：semver 是**约定**，不是**保证**。

**反例**：
```json
{
  "name": "bad-package",
  "version": "1.2.0"  // 声称是次版本更新
}
```

```javascript
// 但实际上引入了破坏性变更
module.exports = function(config) {
  // 新版本要求 config.apiKey 必须存在
  if (!config.apiKey) throw new Error('apiKey required');
}
```

**防御策略**：
- 使用锁文件固定版本
- CI 中运行完整测试套件
- 关注包的 CHANGELOG

### 误区 2：^ 和 ~ 可以互换

**对比**：
```
版本：1.2.3

^1.2.3  →  >=1.2.3 <2.0.0  (允许次版本更新)
~1.2.3  →  >=1.2.3 <1.3.0  (只允许补丁更新)

实际安装：
^1.2.3  可能安装 1.9.0
~1.2.3  只会安装 1.2.x
```

**选择建议**：
- 库项目：使用 ~（保守）
- 应用项目：使用 ^（激进）
- 关键依赖：精确版本

### 误区 3：0.x 版本遵循正常规则

**特殊处理**：
```
^0.2.3  →  >=0.2.3 <0.3.0  (MINOR 被视为 MAJOR)
^0.0.3  →  >=0.0.3 <0.0.4  (PATCH 被视为 MAJOR)
```

**原因**：0.x 版本表示不稳定，任何更新都可能破坏性变更。

**实践建议**：
```json
{
  "dependencies": {
    "some-0x-lib": "0.2.3"  // 固定版本，避免意外更新
  }
}
```

---

## 工程实践

### 场景 1：库的版本发布策略

**发布流程**：
```bash
# 1. 修复 bug
npm version patch  # 1.2.3 → 1.2.4

# 2. 新增功能
npm version minor  # 1.2.4 → 1.3.0

# 3. 破坏性变更
npm version major  # 1.3.0 → 2.0.0

# 4. 推送标签
git push --tags
npm publish
```

**自动化版本管理**：
```json
// package.json
{
  "scripts": {
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish",
    "release:major": "npm version major && npm publish"
  }
}
```

### 场景 2：依赖版本锁定策略

**应用项目**：
```json
{
  "dependencies": {
    "react": "18.2.0",        // 精确版本
    "axios": "^1.4.0",        // 允许次版本更新
    "lodash": "~4.17.21"      // 只允许补丁更新
  }
}
```

**库项目**：
```json
{
  "peerDependencies": {
    "react": ">=16.8.0"       // 宽松范围
  },
  "devDependencies": {
    "react": "18.2.0"         // 开发时固定版本
  }
}
```

### 场景 3：Monorepo 版本管理

**固定版本模式**（Babel 风格）：
```json
// lerna.json
{
  "version": "7.0.0",  // 所有包使用同一版本
  "packages": ["packages/*"]
}
```

**独立版本模式**（Yarn Workspaces）：
```json
// packages/core/package.json
{ "version": "2.1.0" }

// packages/utils/package.json
{ "version": "1.3.2" }
```

**工具**：
- Lerna：`lerna version`
- Changesets：`changeset version`

---

## 深入一点

### semver 的数学模型

**版本号的全序关系**：
```
∀ a, b ∈ Versions, 有且仅有一种关系成立：
a < b  或  a = b  或  a > b
```

**比较算法**：
```javascript
function compare(v1, v2) {
  const [major1, minor1, patch1] = parse(v1);
  const [major2, minor2, patch2] = parse(v2);
  
  if (major1 !== major2) return major1 - major2;
  if (minor1 !== minor2) return minor1 - minor2;
  return patch1 - patch2;
}
```

### 不同语言的版本规范

**Python (PEP 440)**：
```
1.2.3.dev1     # 开发版
1.2.3a1        # Alpha
1.2.3b1        # Beta
1.2.3rc1       # Release Candidate
1.2.3          # 正式版
1.2.3.post1    # 后续修复
```

**Ruby (Gem::Version)**：
```
1.2.3.pre
1.2.3.beta
1.2.3
```

**Rust (Cargo)**：
```toml
[dependencies]
serde = "1.0"       # >=1.0.0 <2.0.0
regex = "~1.5.4"    # >=1.5.4 <1.6.0
```

### npm 的版本解析优化

**缓存机制**：
```
第一次解析：查询 registry → 200ms
后续解析：读取本地缓存 → 5ms
```

**延迟加载**：
```javascript
// 只解析当前需要的依赖
const resolved = await resolveVersion('react', '^18.0.0');

// 不会预先解析所有可能的版本
```

**并行解析**：
```
react@^18.0.0    ┐
vue@^3.0.0       ├→ 并行查询 registry
lodash@^4.17.0   ┘
```

---

## 参考资料

- [Semantic Versioning 2.0.0](https://semver.org/)
- [npm semver 计算器](https://semver.npmjs.com/)
- [node-semver 源码](https://github.com/npm/node-semver)
