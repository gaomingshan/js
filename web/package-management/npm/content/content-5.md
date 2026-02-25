# 语义化版本（SemVer）深入理解

## 概述

语义化版本（Semantic Versioning，简称 SemVer）是一套版本号命名规范，通过版本号传达代码变更的性质和影响范围。理解 SemVer 对于管理依赖、控制风险、避免破坏性更新至关重要。

## SemVer 基础规则

### 版本号格式

```
主版本号.次版本号.修订号
  MAJOR . MINOR . PATCH
```

**示例：**
```
1.2.3
│ │ │
│ │ └─ 修订号（Patch）：向下兼容的问题修正
│ └─── 次版本号（Minor）：向下兼容的功能新增
└───── 主版本号（Major）：不兼容的 API 修改
```

### 版本递增规则

**MAJOR（主版本号）：**
- 不兼容的 API 修改
- 破坏性变更（Breaking Changes）
- 示例：1.9.0 → 2.0.0

**MINOR（次版本号）：**
- 向下兼容的功能新增
- 废弃已有功能（但未删除）
- 示例：1.2.0 → 1.3.0

**PATCH（修订号）：**
- 向下兼容的问题修正
- 安全漏洞修复
- 示例：1.2.3 → 1.2.4

### 实际案例

**主版本更新（Breaking Change）：**
```javascript
// v1.x.x
function getData(callback) {
  callback(null, data);
}

// v2.0.0（破坏性变更）
async function getData() {
  return data;  // 改为 Promise，不兼容
}
```

**次版本更新（New Feature）：**
```javascript
// v1.2.0
class Database {
  query(sql) { }
}

// v1.3.0（新增方法，向下兼容）
class Database {
  query(sql) { }
  transaction(callback) { }  // 新增
}
```

**修订号更新（Bug Fix）：**
```javascript
// v1.2.3
function add(a, b) {
  return a - b;  // Bug
}

// v1.2.4（修复 Bug）
function add(a, b) {
  return a + b;  // 修复
}
```

## 版本范围符号

### ^ 符号（插入符）

**规则：**
- 允许不修改最左边非零数字的版本更新
- 最常用的版本范围

**示例：**
```json
{
  "dependencies": {
    "package": "^1.2.3"
  }
}
```

**匹配范围：**
```
^1.2.3 → >=1.2.3 <2.0.0
  允许：1.2.3, 1.2.4, 1.3.0, 1.9.9
  禁止：2.0.0

^0.2.3 → >=0.2.3 <0.3.0
  允许：0.2.3, 0.2.4
  禁止：0.3.0

^0.0.3 → >=0.0.3 <0.0.4
  允许：0.0.3
  禁止：0.0.4
```

**特殊情况：**
```
^1.x → >=1.0.0 <2.0.0
^0.x → >=0.0.0 <1.0.0
```

### ~ 符号（波浪符）

**规则：**
- 允许修订号（PATCH）更新
- 如果指定了次版本号，锁定次版本号
- 如果只指定了主版本号，允许次版本号更新

**示例：**
```json
{
  "dependencies": {
    "package": "~1.2.3"
  }
}
```

**匹配范围：**
```
~1.2.3 → >=1.2.3 <1.3.0
  允许：1.2.3, 1.2.4, 1.2.9
  禁止：1.3.0

~1.2 → >=1.2.0 <1.3.0
  允许：1.2.0, 1.2.9
  禁止：1.3.0

~1 → >=1.0.0 <2.0.0
  允许：1.0.0, 1.9.9
  禁止：2.0.0
```

### 比较运算符

**>、>=、<、<=、=**
```json
{
  "dependencies": {
    "package-a": ">1.2.3",   // 大于
    "package-b": ">=1.2.3",  // 大于等于
    "package-c": "<2.0.0",   // 小于
    "package-d": "<=1.9.9",  // 小于等于
    "package-e": "=1.2.3"    // 精确版本
  }
}
```

### 连字符范围

```json
{
  "dependencies": {
    "package": "1.2.3 - 2.3.4"
  }
}
```

**等价于：**
```
>=1.2.3 <=2.3.4
```

**省略版本号：**
```
1.2 - 2 → >=1.2.0 <=2.9.9
1.2.3 - 2 → >=1.2.3 <3.0.0
```

### || 运算符（或）

```json
{
  "dependencies": {
    "package": "^1.2.0 || ^2.0.0"
  }
}
```

**匹配范围：**
```
(>=1.2.0 <2.0.0) || (>=2.0.0 <3.0.0)
允许：1.2.3, 1.9.9, 2.0.0, 2.5.0
禁止：0.9.0, 3.0.0
```

### 通配符 * 和 x

```json
{
  "dependencies": {
    "package-a": "*",      // 任意版本
    "package-b": "1.x",    // 1.x.x
    "package-c": "1.2.x"   // 1.2.x
  }
}
```

**等价范围：**
```
* → >=0.0.0
1.x → >=1.0.0 <2.0.0
1.2.x → >=1.2.0 <1.3.0
```

## 版本范围对比

| 符号 | 范围 | 风险 | 适用场景 |
|------|------|------|----------|
| `^1.2.3` | 1.2.3 - 1.x.x | 中等 | **推荐**，平衡更新与稳定 |
| `~1.2.3` | 1.2.3 - 1.2.x | 低 | 保守更新，仅修复 Bug |
| `1.2.3` | 精确版本 | 最低 | 关键依赖，锁定版本 |
| `>=1.2.3` | 无上限 | 高 | 不推荐，可能引入破坏性更新 |
| `*` | 任意版本 | 最高 | **禁止**，完全不可控 |

## 预发布版本

### 格式规范

```
主.次.修订-预发布标识.编号

1.0.0-alpha.1
1.0.0-beta.2
1.0.0-rc.1
```

### 预发布阶段

**alpha（内测版）：**
```
1.0.0-alpha.1
1.0.0-alpha.2
```
- 功能不完整
- 仅内部测试
- 可能有严重 Bug

**beta（公测版）：**
```
1.0.0-beta.1
1.0.0-beta.2
```
- 功能基本完整
- 公开测试
- 修复 Bug，优化性能

**rc（候选版本，Release Candidate）：**
```
1.0.0-rc.1
1.0.0-rc.2
```
- 准备发布
- 最后的测试
- 无重大问题即正式发布

### 版本优先级

```
1.0.0-alpha.1
< 1.0.0-alpha.2
< 1.0.0-beta.1
< 1.0.0-beta.2
< 1.0.0-rc.1
< 1.0.0-rc.2
< 1.0.0
< 1.0.1
```

### npm 安装预发布版本

```bash
# 默认安装稳定版
npm install package-name

# 安装最新版本（包括预发布）
npm install package-name@next

# 安装特定预发布版本
npm install package-name@1.0.0-beta.1

# 版本范围不匹配预发布版
npm install package-name@^1.0.0
# 不会安装 1.0.0-beta.1

# 明确指定预发布
npm install package-name@^1.0.0-beta
```

### 发布预发布版本

```bash
# 发布 alpha 版本
npm version prerelease --preid=alpha
# 1.0.0 → 1.0.1-alpha.0

# 发布 beta 版本
npm version prerelease --preid=beta
# 1.0.1-alpha.0 → 1.0.1-beta.0

# 发布 rc 版本
npm version prerelease --preid=rc
# 1.0.1-beta.0 → 1.0.1-rc.0

# 发布到特定 tag
npm publish --tag beta
```

## 构建元数据

### 格式

```
版本号+构建元数据

1.0.0+20230715
1.0.0+build.123
1.0.0-beta.1+exp.sha.5114f85
```

### 特点

**不影响版本优先级：**
```
1.0.0+build.1 === 1.0.0+build.2
```

**使用场景：**
- CI/CD 构建号
- Git commit hash
- 时间戳

**示例：**
```bash
# 在 CI/CD 中
VERSION=1.0.0+build.${BUILD_NUMBER}
npm version $VERSION
```

## 版本锁定策略

### 策略对比

**策略 1：完全锁定**
```json
{
  "dependencies": {
    "react": "18.2.0",
    "axios": "1.4.0"
  }
}
```
- ✅ 最稳定，完全可控
- ❌ 无法自动获取安全更新
- ❌ 需要手动升级

**策略 2：锁定次版本（推荐）**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.4.0"
  }
}
```
- ✅ 平衡稳定性与更新
- ✅ 自动获取 Bug 修复
- ⚠️ 依赖库遵循 SemVer

**策略 3：锁定修订号**
```json
{
  "dependencies": {
    "react": "~18.2.0",
    "axios": "~1.4.0"
  }
}
```
- ✅ 更保守
- ✅ 仅安全更新和 Bug 修复
- ❌ 错过新功能

**策略 4：宽松范围（不推荐）**
```json
{
  "dependencies": {
    "react": ">=18.0.0",
    "axios": "*"
  }
}
```
- ❌ 不可控，风险高
- ❌ 可能引入破坏性更新

### 最佳实践

**根据包的性质选择策略：**

```json
{
  "dependencies": {
    "react": "^18.2.0",           // 核心库：锁定次版本
    "lodash": "^4.17.21",         // 工具库：锁定次版本
    "@company/internal": "1.0.0", // 内部库：精确版本
    "experimental-pkg": "~0.5.0"  // 实验性：锁定修订号
  }
}
```

## 深入一点：0.x.x 版本的特殊性

### 规则差异

**标准版本：**
```
^1.2.3 → >=1.2.3 <2.0.0
```

**0.x.x 版本：**
```
^0.2.3 → >=0.2.3 <0.3.0  // 次版本视为主版本
^0.0.3 → >=0.0.3 <0.0.4  // 修订号视为主版本
```

**原因：**
- 0.x.x 表示不稳定版本
- 任何更新都可能破坏兼容性
- 更保守的更新策略

### 实际影响

**package.json：**
```json
{
  "dependencies": {
    "stable-pkg": "^1.2.3",    // 允许 1.x.x
    "unstable-pkg": "^0.2.3"   // 仅允许 0.2.x
  }
}
```

**建议：**
- 尽快发布 1.0.0
- 0.x.x 期间明确标注不稳定
- 使用 `~` 更保守

## 版本冲突解决

### 冲突场景

```
项目依赖：
- A@1.0.0 → 依赖 C@^1.0.0
- B@1.0.0 → 依赖 C@^2.0.0

冲突：C 需要同时满足 ^1.0.0 和 ^2.0.0
```

### 解决方案

**方案 1：overrides（npm 8.3+）**
```json
{
  "overrides": {
    "C": "^2.0.0"
  }
}
```

**方案 2：resolutions（yarn）**
```json
{
  "resolutions": {
    "C": "2.0.0"
  }
}
```

**方案 3：pnpm.overrides**
```json
{
  "pnpm": {
    "overrides": {
      "C": "2.0.0"
    }
  }
}
```

**方案 4：升级依赖**
```bash
# 升级 A 到兼容 C@2.0.0 的版本
npm update A
```

## 实用工具

### npm version 命令

```bash
# 自动递增版本号
npm version patch  # 1.2.3 → 1.2.4
npm version minor  # 1.2.4 → 1.3.0
npm version major  # 1.3.0 → 2.0.0

# 预发布版本
npm version prepatch  # 1.2.3 → 1.2.4-0
npm version preminor  # 1.2.3 → 1.3.0-0
npm version premajor  # 1.2.3 → 2.0.0-0

# 指定预发布标识
npm version prerelease --preid=beta
# 1.2.3 → 1.2.4-beta.0

# 自定义版本
npm version 2.0.0-rc.1
```

### semver 命令行工具

```bash
# 安装
npm install -g semver

# 比较版本
semver 1.2.3 1.2.4  # 1.2.3 < 1.2.4

# 检查范围
semver 1.2.4 -r "^1.2.0"  # true
semver 2.0.0 -r "^1.2.0"  # false

# 查找最大满足版本
semver -r "^1.2.0" 1.2.3 1.3.0 2.0.0  # 1.3.0
```

### npm outdated

```bash
# 查看过时依赖
npm outdated

# 输出示例
Package    Current  Wanted  Latest  Location
react      18.0.0   18.2.0  18.2.0  project
lodash     4.17.20  4.17.21 4.17.21 project
webpack    5.70.0   5.70.0  5.88.0  project
```

- **Current**：当前安装版本
- **Wanted**：满足 package.json 范围的最新版本
- **Latest**：registry 最新版本

## 常见陷阱

### 陷阱 1：过于信任 SemVer

**问题：**
不是所有包都严格遵循 SemVer。

```json
{
  "dependencies": {
    "some-pkg": "^1.2.0"
  }
}
```

**风险：**
```
some-pkg@1.3.0 可能引入破坏性变更
但作者标记为次版本更新
```

**建议：**
- 重要依赖锁定精确版本
- 升级前查看 CHANGELOG
- 在测试环境先验证

### 陷阱 2：忽略 package-lock.json

**场景：**
```bash
# 开发者 A
npm install
# 安装 lodash@4.17.20（当时最新）

# 一周后，开发者 B
npm install
# 安装 lodash@4.17.21（新版本发布）

# 可能导致不一致
```

**解决：**
```bash
# 使用 npm ci 而非 npm install
npm ci  # 严格按照 lock 文件安装
```

### 陷阱 3：^ 的隐式风险

```json
{
  "dependencies": {
    "pkg": "^1.0.0"
  }
}
```

**问题：**
```
pkg@1.9.9 相比 1.0.0 可能变化巨大
虽然理论上向下兼容，但风险仍存在
```

**建议：**
- 关键依赖使用 `~` 或精确版本
- 定期小步更新，而非跳跃式更新

### 陷阱 4：预发布版本陷阱

```bash
npm install pkg@1.0.0-beta.1

# 后续 npm update 不会更新到 1.0.0
# 因为 beta.1 < 1.0.0
```

**解决：**
```bash
# 手动更新到稳定版
npm install pkg@latest
```

## 参考资料

- [Semantic Versioning 官方规范](https://semver.org/)
- [npm semver 计算器](https://semver.npmjs.com/)
- [node-semver 库](https://github.com/npm/node-semver)
- [npm version 文档](https://docs.npmjs.com/cli/v9/commands/npm-version)

---

**上一章：**[依赖类型与使用场景](./content-4.md)  
**下一章：**[依赖解析算法与扁平化机制](./content-6.md)
