# npm 面试题汇总

> 共 20 道题，涵盖基础概念、原理机制、工程实践三个层面

---

## 基础概念（6题）

### 1. npm 的三个核心组成部分是什么？它们各自的作用是什么？

**答案：**

npm 由三个核心部分组成：
1. **npm CLI（命令行工具）**：本地安装的命令行界面，用于执行包管理操作
2. **npm Registry（包仓库）**：存储和分发 JavaScript 包的在线数据库
3. **Package（包）**：可复用的代码模块，包含 package.json 描述文件

**原理分析：**

三者的协作关系：
- CLI 向 Registry 查询包信息
- Registry 返回包的元数据和下载地址
- CLI 下载并安装 Package 到本地
- Package 可以发布回 Registry 供他人使用

**实践建议：**

- 使用国内镜像加速 Registry 访问
- 了解 CLI 的常用命令和选项
- 掌握 Package 的基本结构和字段

**易错点：**

- 混淆 npm（工具）和 npmjs.org（网站）
- 认为 npm 只是一个命令行工具
- 不理解 Registry 可以有多个（官方、镜像、私有）

---

### 2. package.json 中 dependencies、devDependencies 和 peerDependencies 的区别是什么？分别在什么场景下使用？

**答案：**

- **dependencies**：生产环境运行时必需的依赖，任何环境都会安装
- **devDependencies**：仅开发和构建时需要的依赖，生产环境不安装（`npm install --production`）
- **peerDependencies**：声明宿主项目需要安装的依赖，用于插件模式

**原理分析：**

```json
// React 组件库
{
  "dependencies": {
    "prop-types": "^15.0.0"  // 运行时必需
  },
  "devDependencies": {
    "webpack": "^5.0.0",     // 仅构建时需要
    "@types/react": "^18.0.0" // 仅开发时需要类型定义
  },
  "peerDependencies": {
    "react": ">=16.8.0"      // 要求宿主项目提供
  }
}
```

**实践建议：**

- 构建工具、测试框架放 devDependencies
- 核心功能库放 dependencies
- 插件、组件库使用 peerDependencies 声明宿主依赖

**易错点：**

- 把构建工具放在 dependencies（导致生产包体积增大）
- 不理解 peerDependencies 在 npm 6 和 npm 7+ 的行为差异
- optionalDependencies 容易被忽略

---

### 3. `^1.2.3` 和 `~1.2.3` 在版本匹配上有什么区别？

**答案：**

- `^1.2.3`：允许次版本和修订号更新，匹配 `>=1.2.3 <2.0.0`
- `~1.2.3`：仅允许修订号更新，匹配 `>=1.2.3 <1.3.0`

**原理分析：**

```
^1.2.3 可以匹配：1.2.3, 1.2.4, 1.3.0, 1.9.9
不能匹配：2.0.0

~1.2.3 可以匹配：1.2.3, 1.2.4, 1.2.9
不能匹配：1.3.0

特殊情况（0.x.x）：
^0.2.3 → >=0.2.3 <0.3.0（次版本视为主版本）
^0.0.3 → >=0.0.3 <0.0.4（修订号视为主版本）
```

**实践建议：**

- 使用 `^` 平衡更新与稳定（npm 默认）
- 关键依赖使用 `~` 或精确版本
- 0.x.x 版本要格外小心，建议锁定版本

**易错点：**

- 认为 `^` 和 `~` 没有区别
- 不理解 0.x.x 版本的特殊规则
- 忽略 package-lock.json 的版本锁定作用

---

### 4. npm install 和 npm ci 的区别是什么？分别在什么场景使用？

**答案：**

| 特性 | npm install | npm ci |
|------|------------|--------|
| 速度 | 较慢 | 快 2-3 倍 |
| 依据 | package.json + lock | 仅 lock 文件 |
| 行为 | 可能更新 lock | 严格按 lock 安装 |
| node_modules | 增量更新 | 先删除再安装 |
| 适用场景 | 开发环境 | CI/CD 环境 |

**原理分析：**

```bash
# npm install 流程
1. 读取 package.json 和 package-lock.json
2. 解析依赖树（如果需要）
3. 检查 node_modules，增量更新
4. 可能修改 package-lock.json

# npm ci 流程
1. 检查 package-lock.json 是否存在（否则报错）
2. 检查与 package.json 是否一致（否则报错）
3. 删除整个 node_modules
4. 严格按 lock 文件安装
5. 不会修改任何文件
```

**实践建议：**

- CI/CD 环境使用 `npm ci`
- 开发环境添加新依赖时使用 `npm install`
- 首次克隆项目使用 `npm ci`（如果有 lock 文件）

**易错点：**

- 在 CI 中使用 npm install（不确定性、慢）
- npm ci 要求 lock 文件存在，否则报错
- 不理解 npm ci 的"干净安装"特性

---

### 5. package-lock.json 的作用是什么？为什么要提交到 Git？

**答案：**

package-lock.json 的作用：
1. **锁定依赖树**：记录所有依赖的精确版本和安装位置
2. **确保一致性**：保证团队成员和 CI/CD 安装相同版本
3. **提升安装速度**：跳过依赖解析，直接下载指定版本
4. **完整性校验**：记录 integrity 哈希，防止包被篡改

**原理分析：**

```json
{
  "packages": {
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-...",  // SHA-512 校验
      "dependencies": { ... }
    }
  }
}
```

没有 lock 文件的风险：
- 开发者 A 安装时 lodash@4.17.20
- 一周后 lodash 发布 4.17.21
- 开发者 B 安装时得到 4.17.21
- 可能导致不一致和 bug

**实践建议：**

- 始终提交 lock 文件到 Git
- 不要添加到 .gitignore
- lock 文件冲突时删除重建
- CI/CD 使用 `npm ci` 严格按 lock 安装

**易错点：**

- 认为 lock 文件不重要，不提交或删除
- lock 文件冲突时手动合并（容易出错）
- 不理解 lockfileVersion 的差异

---

### 6. npm scripts 的生命周期钩子有哪些？执行顺序是什么？

**答案：**

常用生命周期钩子：
- `preinstall`、`install`、`postinstall`
- `prepublish`（废弃）、`preprepare`、`prepare`、`postprepare`
- `prepublishOnly`、`prepack`、`postpack`
- `preversion`、`version`、`postversion`

**原理分析：**

```
npm install 执行顺序：
preinstall (根项目)
  → preinstall (各依赖)
  → install (各依赖)
  → postinstall (各依赖)
  → install (根项目)
  → postinstall (根项目)
  → preprepare → prepare → postprepare

npm publish 执行顺序：
prepublishOnly → prepack → prepare → postpack → publish → postpublish

npm version patch 执行顺序：
preversion → version → postversion
```

**实践建议：**

```json
{
  "scripts": {
    "prepare": "npm run build",           // Git clone 后自动构建
    "prepublishOnly": "npm test",         // 发布前强制测试
    "preversion": "npm test",             // 更新版本前测试
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags"
  }
}
```

**易错点：**

- 混淆 prepublish 和 prepublishOnly
- 不理解 prepare 在多个场景下都会执行
- postinstall 脚本可能被恶意利用（安全风险）

---

## 原理机制（8题）

### 7. npm 的依赖解析算法是如何工作的？扁平化安装带来了什么问题？

**答案：**

**npm v3+ 扁平化算法：**
1. 构建依赖树（递归解析所有依赖）
2. 按广度优先遍历
3. 尽可能将依赖提升到顶层 node_modules
4. 版本冲突时保留嵌套结构

**原理分析：**

```
项目依赖：
- A@1.0.0 → 依赖 C@1.0.0
- B@1.0.0 → 依赖 C@2.0.0

扁平化结果：
node_modules/
├── A@1.0.0/
├── B@1.0.0/
│   └── node_modules/
│       └── C@2.0.0/  # 版本冲突，嵌套
└── C@1.0.0/  # 先遇到的提升
```

**带来的问题：**

1. **幽灵依赖（Phantom Dependencies）**
   - 未声明的依赖可以被访问
   - 如果依赖被移除，代码会崩溃

2. **依赖分身（Doppelgangers）**
   - 同一个包被安装多次
   - 可能导致单例模式失效

3. **不确定性**
   - 安装顺序影响最终结构
   - 需要 lock 文件保证一致性

**实践建议：**

- 使用 `npm ls` 检查依赖树
- 使用 depcheck 检测幽灵依赖
- 考虑使用 pnpm（严格依赖隔离）

**易错点：**

- 依赖未声明但能用（幽灵依赖）
- 不理解为什么有时 node_modules 结构不一样
- 忽略 package-lock.json 的重要性

---

### 8. npm 缓存机制是如何工作的？如何优化缓存使用？

**答案：**

**缓存工作原理：**

```
~/.npm/_cacache/
├── content-v2/    # 实际文件（内容寻址存储）
│   └── sha512/    # 按哈希值存储
└── index-v5/      # 索引数据
```

安装流程：
1. 计算包的 key（名称 + 版本 + integrity）
2. 在 index 中查找
3. 验证 integrity（SHA-512）
4. 缓存命中 → 直接读取
5. 缓存未命中 → 下载并缓存

**原理分析：**

```bash
# 首次安装
npm install lodash
1. 查询 registry
2. 下载 tarball
3. 计算 sha512
4. 保存到 _cacache/content-v2/sha512/...
5. 创建索引

# 再次安装（即使删除了 node_modules）
npm install lodash
1. 查询 registry（获取元数据）
2. 检查缓存（通过 integrity）
3. 从缓存读取（跳过下载）
4. 解压到 node_modules
```

**优化建议：**

1. **CI/CD 缓存：**
```yaml
# GitHub Actions
- uses: actions/setup-node@v3
  with:
    cache: 'npm'
```

2. **离线安装：**
```bash
npm install --prefer-offline  # 优先使用缓存
npm install --offline         # 完全离线
```

3. **定期维护：**
```bash
npm cache verify  # 验证完整性
```

**易错点：**

- 频繁清理缓存（`npm cache clean --force`）反而降低效率
- 不知道缓存位置和大小
- CI 中不利用缓存导致每次全量下载

---

### 9. 什么是幽灵依赖（Phantom Dependencies）？如何避免？

**答案：**

幽灵依赖是指项目可以访问未在 package.json 中声明的依赖，这些依赖通过扁平化安装被提升到了顶层 node_modules。

**原理分析：**

```json
// package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// express 依赖 body-parser
// 扁平化后：
node_modules/
├── express/
└── body-parser/  # 被提升

// 项目代码中可以使用（但不应该）
import bodyParser from 'body-parser';  // ⚠️ 幽灵依赖
```

**风险：**
- express 移除对 body-parser 的依赖 → 项目崩溃
- express 升级到不同版本的 body-parser → 行为变化
- 其他开发者不知道这个隐式依赖

**避免方法：**

1. **使用 depcheck 检测：**
```bash
npx depcheck
# 输出：Missing dependencies: body-parser
```

2. **显式声明所有使用的依赖：**
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "body-parser": "^1.20.0"  // ✅ 显式声明
  }
}
```

3. **使用 pnpm：**
```bash
pnpm install
# pnpm 严格隔离，不允许访问未声明的依赖
import bodyParser from 'body-parser';  // ❌ 报错
```

**易错点：**

- 本地开发正常，CI/CD 失败（不同的依赖树）
- 升级依赖后莫名其妙的错误
- 不理解为什么未安装的包也能用

---

### 10. npm 的 peer 依赖在 npm 6 和 npm 7+ 中有什么行为差异？

**答案：**

**npm 6 及更早：**
- 仅警告，不自动安装
- 需要手动安装 peer 依赖
- 版本冲突只警告不报错

**npm 7+：**
- 自动安装 peer 依赖
- 版本冲突时报错
- 需要使用 `--legacy-peer-deps` 降级到旧行为

**原理分析：**

```bash
# npm 6
npm install react-router

npm WARN react-router@5.0.0 requires a peer of react@>=16.8.0
# 需要手动安装
npm install react

# npm 7+
npm install react-router
# 自动安装 react 和 react-dom

# 如果版本冲突
npm ERR! Could not resolve dependency:
npm ERR! peer react@">=18.0.0" from some-package

# 降级到 npm 6 行为
npm install --legacy-peer-deps
```

**实践建议：**

1. **开发组件库时：**
```json
{
  "peerDependencies": {
    "react": ">=16.8.0"  // 宽松范围
  },
  "peerDependenciesMeta": {
    "react-native": {
      "optional": true  // 可选 peer 依赖
    }
  }
}
```

2. **处理冲突：**
```bash
# 方案 1：升级依赖
npm install react@^18.0.0

# 方案 2：使用 legacy 模式
npm install --legacy-peer-deps

# 方案 3：使用 overrides
{
  "overrides": {
    "react": "^18.0.0"
  }
}
```

**易错点：**

- 不理解为什么 npm 7 安装了额外的包
- peer 依赖冲突时不知道如何解决
- 混淆 peerDependencies 和 dependencies

---

### 11. package-lock.json 的 lockfileVersion 有什么区别？

**答案：**

**版本演变：**

- **Version 1**（npm 5-6）：扁平结构，仅 dependencies 字段
- **Version 2**（npm 7-8）：同时包含 v1 和 v2 格式（兼容性）
- **Version 3**（npm 9+）：仅 packages 格式，不向后兼容

**原理分析：**

```json
// Version 1
{
  "lockfileVersion": 1,
  "dependencies": {
    "lodash": {
      "version": "4.17.21",
      "resolved": "...",
      "integrity": "..."
    }
  }
}

// Version 2（向后兼容）
{
  "lockfileVersion": 2,
  "packages": {
    "node_modules/lodash": {
      "version": "4.17.21"
    }
  },
  "dependencies": {  // v1 格式，兼容性
    "lodash": { ... }
  }
}

// Version 3（精简）
{
  "lockfileVersion": 3,
  "packages": {
    "node_modules/lodash": {
      "version": "4.17.21"
    }
  }
}
```

**兼容性：**
```
npm 5-6：只支持 v1
npm 7-8：支持 v1 和 v2，默认生成 v2
npm 9+：支持 v2 和 v3，默认生成 v3
```

**实践建议：**

- 团队统一 npm 版本
- 如需兼容旧版本 npm，锁定 lockfileVersion：
```bash
npm config set lockfileVersion 2
```

**易错点：**

- npm 9 生成的 v3 文件，npm 6 无法使用
- 不同版本 npm 导致 lock 文件频繁变动
- 合并冲突时不知道保留哪个版本

---

### 12. npm scripts 中的环境变量是如何传递的？npm_package_ 变量从哪里来？

**答案：**

npm 在运行脚本时，会自动将 package.json 的所有字段暴露为环境变量。

**原理分析：**

```json
{
  "name": "my-app",
  "version": "1.2.3",
  "config": {
    "port": "8080"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

```javascript
// server.js
console.log(process.env.npm_package_name);           // "my-app"
console.log(process.env.npm_package_version);        // "1.2.3"
console.log(process.env.npm_package_config_port);    // "8080"
console.log(process.env.npm_package_scripts_start);  // "node server.js"
```

**变量命名规则：**
```
npm_package_<field>_<subfield>

例如：
{
  "author": {
    "name": "John"
  }
}
→ npm_package_author_name = "John"
```

**npm config 变量：**
```ini
# .npmrc
custom_value=hello
```

```javascript
console.log(process.env.npm_config_custom_value);  // "hello"
```

**实践建议：**

```json
{
  "config": {
    "api_url": "https://api.example.com",
    "timeout": "5000"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

```javascript
// server.js
const apiUrl = process.env.npm_package_config_api_url;
const timeout = process.env.npm_package_config_timeout;
```

**易错点：**

- 字段名有 `-` 会被转换为 `_`
- 不是所有嵌套字段都能正确访问
- 环境变量只在 npm scripts 运行时存在

---

### 13. npm audit 的漏洞评分是如何计算的？如何处理无法自动修复的漏洞？

**答案：**

npm audit 使用 CVSS（Common Vulnerability Scoring System）评分系统。

**严重级别：**
- **Critical（严重）**：CVSS 9.0-10.0，立即可被利用
- **High（高危）**：CVSS 7.0-8.9，容易被利用
- **Moderate（中危）**：CVSS 4.0-6.9，需要特定条件
- **Low（低危）**：CVSS 0.1-3.9，难以利用

**原理分析：**

```bash
npm audit

# 输出示例
┌───────────────┬──────────────────────────────────┐
│ High          │ Prototype Pollution              │
├───────────────┼──────────────────────────────────┤
│ Package       │ minimist                         │
├───────────────┼──────────────────────────────────┤
│ Patched in    │ >=1.2.6                         │
├───────────────┼──────────────────────────────────┤
│ Dependency of │ webpack                          │
├───────────────┼──────────────────────────────────┤
│ Path          │ webpack > yargs > minimist       │
└───────────────┴──────────────────────────────────┘
```

**处理无法自动修复的漏洞：**

1. **使用 overrides（npm 8.3+）：**
```json
{
  "overrides": {
    "minimist": "1.2.6"  // 强制所有 minimist 使用安全版本
  }
}
```

2. **等待上游修复：**
```bash
# 关注上游仓库
# 提 issue 或 PR
```

3. **风险评估：**
```markdown
## 安全审计记录
- 漏洞：minimist CVE-2021-44906
- 评估：仅在构建时使用，不影响生产环境
- 决策：暂不修复，等待 webpack 更新
- 复查：每月检查
```

4. **寻找替代方案：**
```bash
# 如果上游长期不修复
# 考虑切换到其他工具
```

**实践建议：**

- CI/CD 集成 `npm audit`
- 设置合理的 audit-level
- 定期审查和更新依赖

**易错点：**

- 所有漏洞都用 `--force` 强制修复（可能破坏兼容性）
- 忽略开发依赖的漏洞（实际影响很小）
- 不评估风险就盲目升级

---

### 14. npm link 的工作原理是什么？有哪些替代方案？

**答案：**

npm link 通过创建符号链接（symlink）实现本地包的实时调试。

**原理分析：**

```bash
# 步骤 1：在包目录创建全局链接
cd ~/my-package
npm link
# 创建：/usr/local/lib/node_modules/my-package → ~/my-package

# 步骤 2：在项目中链接
cd ~/my-project
npm link my-package
# 创建：my-project/node_modules/my-package → 全局/my-package

# 最终链接链
my-project/node_modules/my-package → 全局 → ~/my-package
```

**工作流程：**
1. 修改 ~/my-package 源码
2. my-project 立即看到变化（无需重新安装）
3. 适合开发和调试

**替代方案：**

1. **yalc（推荐）：**
```bash
# 在包目录
yalc publish

# 在项目中
yalc add my-package

# 更新
yalc push  # 推送到所有使用的项目
```

优势：真实复制文件，避免符号链接问题

2. **npm workspaces：**
```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

优势：Monorepo 原生支持，自动链接

3. **file: 协议：**
```json
{
  "dependencies": {
    "my-package": "file:../my-package"
  }
}
```

4. **直接安装：**
```bash
npm install ../my-package
```

**实践建议：**

- 开发 npm 包时使用 link
- Monorepo 使用 workspaces
- 一次性测试使用 yalc

**易错点：**

- link 后修改不生效（需要重新构建）
- 路径问题（相对路径基于执行目录）
- peer 依赖冲突
- TypeScript 类型定义找不到

---

## 工程实践（6题）

### 15. 在 CI/CD 环境中，如何优化 npm 安装速度？

**答案：**

**优化策略：**

1. **使用 npm ci：**
```yaml
- run: npm ci  # 比 npm install 快 2-3 倍
```

2. **启用缓存：**
```yaml
# GitHub Actions
- uses: actions/setup-node@v3
  with:
    node-version: '18'
    cache: 'npm'  # 自动缓存
```

3. **使用镜像源：**
```yaml
- run: npm config set registry https://registry.npmmirror.com
- run: npm ci
```

4. **并行安装：**
```yaml
- run: npm ci --maxsockets=100
```

5. **仅安装生产依赖：**
```yaml
# 构建镜像时
- run: npm ci --production
```

**原理分析：**

```bash
# npm install（慢）
1. 读取 package.json 和 lock
2. 解析依赖树
3. 增量更新 node_modules
4. 可能修改 lock 文件

# npm ci（快）
1. 检查 lock 存在
2. 删除 node_modules
3. 严格按 lock 安装
4. 跳过依赖解析
```

**完整示例：**

```yaml
name: CI

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --prefer-offline
      
      - name: Run tests
        run: npm test
```

**实践建议：**

- 使用 npm ci 替代 npm install
- 配置缓存策略
- 使用国内镜像（国内 CI）
- 监控安装时间

**易错点：**

- 在 CI 中使用 npm install
- 不使用缓存
- 缓存 key 设置不当导致缓存失效
- 忘记提交 lock 文件

---

### 16. 如何在团队中管理 npm 依赖升级？有什么最佳实践？

**答案：**

**升级策略：**

1. **定期检查（每月）：**
```bash
npm outdated
npm audit
```

2. **分批升级：**
```bash
# 第一批：补丁版本（低风险）
npm update

# 第二批：次版本
npx npm-check-updates -i

# 第三批：主版本（高风险）
# 逐个评估和测试
```

3. **创建升级分支：**
```bash
git checkout -b chore/update-dependencies
npm update
npm test
git commit -am "chore: update dependencies"
```

4. **使用自动化工具：**

**Dependabot 配置：**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    reviewers:
      - "team-leads"
```

**Renovate 配置：**
```json
{
  "extends": ["config:base"],
  "schedule": ["before 5am on Monday"],
  "packageRules": [
    {
      "updateTypes": ["patch"],
      "automerge": true
    }
  ]
}
```

**实践建议：**

1. **升级前：**
   - 查看 CHANGELOG
   - 检查 Breaking Changes
   - 评估影响范围

2. **升级中：**
   - 运行完整测试套件
   - 检查包体积变化
   - 验证构建成功

3. **升级后：**
   - 更新文档
   - 提交 PR 由团队审查
   - 部署到测试环境验证

**文档化：**

```markdown
## 依赖更新日志

### 2024-01-15
**更新内容：**
- react: 18.0.0 → 18.2.0
- webpack: 5.70.0 → 5.88.0

**测试结果：**
- ✅ 单元测试通过
- ✅ E2E 测试通过
- ✅ 包体积减少 5%

**注意事项：**
- webpack 5.88 修复了 HMR 的 bug
- 无破坏性变更
```

**易错点：**

- 一次性更新所有依赖
- 不运行测试就合并
- 忽略 lock 文件变更审查
- 不记录更新原因和影响

---

### 17. Monorepo 项目中如何使用 npm workspaces？有哪些最佳实践？

**答案：**

**基本配置：**

```json
// 根 package.json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces --if-present"
  },
  "devDependencies": {
    "typescript": "^5.0.0",  // 共享依赖
    "eslint": "^8.0.0"
  }
}
```

**目录结构：**
```
monorepo/
├── package.json
├── package-lock.json
├── node_modules/
├── packages/
│   ├── utils/
│   │   └── package.json
│   └── components/
│       └── package.json
└── apps/
    └── web/
        └── package.json
```

**内部依赖：**
```json
// packages/components/package.json
{
  "name": "@myorg/components",
  "dependencies": {
    "@myorg/utils": "workspace:*"  // 引用内部包
  }
}
```

**常用命令：**

```bash
# 安装所有依赖（自动链接内部包）
npm install

# 在所有 workspace 运行脚本
npm run build --workspaces

# 在特定 workspace 运行
npm run test --workspace=packages/utils

# 为特定 workspace 添加依赖
npm install lodash --workspace=packages/utils

# 在所有 workspace 添加依赖
npm install vitest -D --workspaces
```

**最佳实践：**

1. **统一依赖版本：**
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",  // 根目录统一管理
    "eslint": "^8.0.0"
  }
}
```

2. **共享配置：**
```
monorepo/
├── tsconfig.base.json
├── .eslintrc.js
└── packages/
    ├── utils/
    │   └── tsconfig.json  // extends ../../tsconfig.base.json
    └── components/
        └── tsconfig.json
```

3. **版本同步：**
```bash
# 使用 lerna 管理版本
npx lerna version
npx lerna publish
```

4. **依赖拓扑排序：**
```json
{
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "build:utils": "npm run build --workspace=packages/utils",
    "build:components": "npm run build:utils && npm run build --workspace=packages/components"
  }
}
```

**易错点：**

- 忘记设置 `"private": true`
- 内部包版本冲突
- 循环依赖
- workspace 命令参数错误

---

### 18. 如何发布一个高质量的 npm 包？发布前的检查清单有哪些？

**答案：**

**发布前检查清单：**

**1. package.json 配置完整：**
```json
{
  "name": "@myorg/package",
  "version": "1.0.0",
  "description": "清晰的描述",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": ["utility", "helper"],
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo.git"
  },
  "bugs": "https://github.com/username/repo/issues",
  "homepage": "https://github.com/username/repo#readme"
}
```

**2. 文档齐全：**
- README.md（安装、使用、API）
- CHANGELOG.md（版本变更记录）
- LICENSE（开源许可证）
- 示例代码

**3. 测试和质量：**
```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src",
    "build": "tsc",
    "prepublishOnly": "npm run lint && npm test && npm run build"
  }
}
```

**4. TypeScript 支持：**
```json
{
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  }
}
```

**5. 包体积优化：**
```json
{
  "files": [
    "dist"  // 只发布必要文件
  ]
}
```

```bash
# 检查将要发布的内容
npm pack --dry-run

# 分析包大小
npx package-size my-package
```

**6. 版本管理：**
```bash
# 语义化版本
npm version patch  # Bug 修复
npm version minor  # 新功能
npm version major  # 破坏性变更

# 自动化发布
{
  "scripts": {
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish"
  }
}
```

**发布流程：**

```bash
# 1. 运行测试
npm test

# 2. 构建
npm run build

# 3. 检查包内容
npm pack --dry-run

# 4. 登录 npm
npm login

# 5. 发布
npm publish

# 或发布 scoped 包
npm publish --access public
```

**发布后验证：**

```bash
# 查看包信息
npm view @myorg/package

# 测试安装
npm install @myorg/package

# 检查文档
npm docs @myorg/package
```

**CI/CD 自动发布：**

```yaml
# .github/workflows/publish.yml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**易错点：**

- 忘记运行 build
- files 字段配置错误，发布了源码
- 版本号没有递增
- 敏感信息泄露（.env、私钥等）
- 不提供 TypeScript 类型定义

---

### 19. 如何搭建和使用私有 npm 仓库？有哪些方案？

**答案：**

**方案对比：**

| 方案 | 优势 | 劣势 | 适用场景 |
|------|------|------|----------|
| **Verdaccio** | 免费、易部署 | 功能基础 | 中小团队 |
| **npm Enterprise** | 功能完整 | 付费、贵 | 大型企业 |
| **GitHub Packages** | 集成 GitHub | 绑定 GitHub | GitHub 用户 |
| **Nexus/Artifactory** | 多语言支持 | 配置复杂 | 多技术栈 |

**Verdaccio 搭建：**

```bash
# 1. 安装
npm install -g verdaccio

# 2. 启动
verdaccio
# 默认地址：http://localhost:4873

# 3. 配置（~/.config/verdaccio/config.yaml）
storage: ./storage
auth:
  htpasswd:
    file: ./htpasswd

uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  '@company/*':
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated
    
  '**':
    access: $all
    publish: $authenticated
    proxy: npmjs
```

**使用：**

```bash
# 设置 registry
npm config set registry http://localhost:4873

# 添加用户
npm adduser --registry http://localhost:4873

# 发布私有包
npm publish

# 安装包（自动代理到 npmjs.org）
npm install lodash
```

**混合使用公共和私有仓库：**

```ini
# .npmrc
registry=https://registry.npmjs.org
@company:registry=http://npm.company.com
//npm.company.com/:_authToken=${NPM_TOKEN}
```

**Docker 部署：**

```dockerfile
FROM verdaccio/verdaccio

COPY config.yaml /verdaccio/conf/config.yaml

EXPOSE 4873

CMD ["verdaccio"]
```

```bash
docker run -d \
  -p 4873:4873 \
  -v $(pwd)/storage:/verdaccio/storage \
  verdaccio/verdaccio
```

**最佳实践：**

1. **访问控制：**
```yaml
packages:
  '@company/private-*':
    access: $authenticated
    publish: $authenticated
```

2. **缓存公共包：**
```yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    cache: true
```

3. **备份策略：**
```bash
# 定期备份 storage 目录
tar -czf verdaccio-backup.tar.gz ~/.local/share/verdaccio/storage
```

4. **HTTPS 配置：**
```yaml
https:
  key: /path/to/key.pem
  cert: /path/to/cert.pem
```

**易错点：**

- 忘记配置 .npmrc
- 认证 token 过期
- 权限配置错误
- 没有备份策略

---

### 20. 在实际项目中遇到 npm 安装失败，如何系统性地排查问题？

**答案：**

**排查流程：**

**1. 查看错误信息：**

```bash
npm install --verbose
# 或
npm install --loglevel silly
```

**2. 常见错误类型和解决方案：**

**A. 权限错误（EACCES）：**
```bash
npm ERR! Error: EACCES: permission denied

# 解决
sudo npm install -g package  # Unix/Linux
# 或配置 npm prefix
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

**B. 网络错误（ETIMEDOUT）：**
```bash
npm ERR! network timeout

# 解决 1：使用镜像
npm config set registry https://registry.npmmirror.com

# 解决 2：增加超时
npm config set timeout 60000

# 解决 3：配置代理
npm config set proxy http://proxy.company.com:8080
```

**C. peer 依赖冲突：**
```bash
npm ERR! peer dep missing

# 解决 1：安装缺失依赖
npm install react@^18.0.0

# 解决 2：使用 legacy 模式
npm install --legacy-peer-deps

# 解决 3：使用 overrides
{
  "overrides": {
    "react": "^18.0.0"
  }
}
```

**D. 缓存损坏：**
```bash
npm ERR! integrity check failed

# 解决
npm cache verify
npm cache clean --force
npm install
```

**E. lock 文件冲突：**
```bash
npm ERR! The package-lock.json file is outdated

# 解决
rm -rf node_modules package-lock.json
npm install
```

**F. node-gyp 编译失败：**
```bash
npm ERR! gyp ERR! build error

# Windows
npm install -g windows-build-tools

# macOS
xcode-select --install

# Linux
sudo apt-get install build-essential
```

**3. 系统性排查步骤：**

```bash
# 步骤 1：检查环境
node -v  # Node.js 版本
npm -v   # npm 版本
npm config list  # 配置信息

# 步骤 2：清理环境
rm -rf node_modules package-lock.json
npm cache clean --force

# 步骤 3：重新安装
npm install

# 步骤 4：检查具体包
npm install problem-package --verbose

# 步骤 5：使用 npm doctor
npm doctor
```

**4. 收集诊断信息：**

```bash
# 生成诊断报告
npm install --verbose > install.log 2>&1

# 查看日志
cat ~/.npm/_logs/*.log
```

**5. 终极解决方案：**

```bash
# 完全重置
rm -rf node_modules package-lock.json ~/.npm
npm cache clean --force
npm install
```

**预防措施：**

1. **锁定 Node.js 版本：**
```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

```bash
# .nvmrc
18
```

2. **提交 lock 文件：**
```bash
git add package-lock.json
```

3. **CI/CD 使用 npm ci：**
```yaml
- run: npm ci
```

4. **定期维护：**
```bash
npm outdated
npm audit
npm dedupe
```

**易错点：**

- 直接删除 node_modules 不删除 lock 文件
- 不查看详细日志就乱尝试
- 在不同 Node.js 版本间切换
- 混用 npm、yarn、pnpm

---

## 总结

本面试题汇总涵盖了 npm 的核心知识点：

**基础概念（6题）：**
- npm 组成和基本概念
- package.json 配置
- 版本管理和依赖类型
- lock 文件和 scripts

**原理机制（8题）：**
- 依赖解析算法
- 缓存机制
- 幽灵依赖和 peer 依赖
- lock 文件版本
- 环境变量和安全审计
- link 机制

**工程实践（6题）：**
- CI/CD 优化
- 团队依赖管理
- Monorepo 实践
- 包发布流程
- 私有仓库搭建
- 问题排查

掌握这些知识点，能够应对大部分 npm 相关的面试问题和实际工作挑战。
