# npm registry 与包发布

## npm registry 架构

### Registry 的核心功能

**npm registry** 本质上是一个**包元数据数据库 + 静态文件服务器**。

**职责分离**：
```
registry.npmjs.org
├── 元数据 API（CouchDB）
│   └── GET /package-name  → package.json 历史版本
└── Tarball 存储（CDN）
    └── GET /package-name/-/package-name-1.0.0.tgz
```

### API 端点

**包元数据查询**：
```http
GET https://registry.npmjs.org/react

Response:
{
  "_id": "react",
  "name": "react",
  "dist-tags": {
    "latest": "18.2.0",
    "next": "18.3.0-next.1"
  },
  "versions": {
    "18.2.0": {
      "name": "react",
      "version": "18.2.0",
      "dist": {
        "tarball": "https://registry.npmjs.org/react/-/react-18.2.0.tgz",
        "shasum": "abc123...",
        "integrity": "sha512-..."
      },
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    }
  }
}
```

**搜索 API**：
```http
GET https://registry.npmjs.org/-/v1/search?text=react&size=20

Response:
{
  "objects": [
    {
      "package": {
        "name": "react",
        "version": "18.2.0",
        "description": "React is a JavaScript library..."
      },
      "score": {
        "final": 0.9,
        "detail": {
          "quality": 0.95,
          "popularity": 0.98,
          "maintenance": 0.99
        }
      }
    }
  ]
}
```

---

## 包的发布流程与版本管理

### 发布前的准备

**1. 登录 npm**：
```bash
npm login
# 输入用户名、密码、邮箱
```

**2. 初始化 package.json**：
```json
{
  "name": "my-awesome-lib",
  "version": "1.0.0",
  "description": "An awesome library",
  "main": "dist/index.js",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "prepublishOnly": "npm run test && npm run build"
  }
}
```

**3. 检查发布内容**：
```bash
# 预览将发布的文件
npm pack --dry-run

# 生成 tarball 检查
npm pack
tar -tzf my-awesome-lib-1.0.0.tgz
```

### 发布流程

**完整步骤**：
```bash
# 1. 运行测试
npm test

# 2. 构建产物
npm run build

# 3. 更新版本号
npm version patch  # 1.0.0 → 1.0.1

# 4. 发布到 registry
npm publish

# 5. 推送 Git 标签
git push --tags
```

**npm publish 内部流程**：
```javascript
1. 运行 prepublishOnly 脚本
2. 打包文件（根据 files 字段）
3. 生成 tarball
4. 计算 integrity (SHA-512)
5. 上传到 registry
6. 更新 dist-tags
7. 运行 postpublish 脚本
```

### 版本发布策略

**语义化版本升级**：
```bash
# 补丁版本（bug 修复）
npm version patch  # 1.0.0 → 1.0.1

# 次版本（新功能）
npm version minor  # 1.0.1 → 1.1.0

# 主版本（破坏性变更）
npm version major  # 1.1.0 → 2.0.0

# 预发布版本
npm version prerelease --preid=beta  # 1.0.0 → 1.0.1-beta.0
```

**发布预发布版本**：
```bash
# 发布到 next 标签
npm publish --tag next

# 用户安装
npm install my-lib@next
```

---

## scope 包与私有包

### Scoped Packages

**命名格式**：`@scope/package-name`

**优势**：
```
1. 命名空间隔离（避免冲突）
2. 组织管理（团队/公司包归类）
3. 访问控制（私有包）
```

**示例**：
```json
{
  "name": "@my-org/utils",
  "version": "1.0.0"
}
```

**安装**：
```bash
npm install @my-org/utils
```

**使用**：
```javascript
import { debounce } from '@my-org/utils';
```

### 私有包发布

**npm 付费账户**（$7/月）：
```bash
# 发布私有包
npm publish --access restricted

# 发布公开 scope 包
npm publish --access public
```

**package.json 配置**：
```json
{
  "name": "@my-org/private-lib",
  "private": true,
  "publishConfig": {
    "access": "restricted",
    "registry": "https://npm.pkg.github.com"
  }
}
```

### GitHub Packages Registry

**配置 .npmrc**：
```
@my-org:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**发布**：
```bash
npm publish
# 发布到 GitHub Packages
```

**安装**：
```bash
npm install @my-org/private-lib
# 需要 GITHUB_TOKEN 权限
```

---

## npm link 原理与本地开发

### npm link 的工作机制

**场景**：开发库的同时在应用中测试

**全局链接**：
```bash
# 在库项目目录
cd my-lib
npm link
# 创建符号链接：
# ~/.npm-global/lib/node_modules/my-lib → /path/to/my-lib
```

**本地链接**：
```bash
# 在应用项目目录
cd my-app
npm link my-lib
# 创建符号链接：
# my-app/node_modules/my-lib → ~/.npm-global/lib/node_modules/my-lib
```

**效果**：
```
my-app/node_modules/my-lib
  ↓ (符号链接)
~/.npm-global/lib/node_modules/my-lib
  ↓ (符号链接)
/path/to/my-lib  (实际源码)
```

### 常见问题与解决

**问题 1：React Hook 冲突**
```
Error: Invalid hook call. Hooks can only be called inside the body of a function component.
```

**原因**：my-lib 和 my-app 使用了两份不同的 React

**解决**：
```bash
# 在库项目中，链接到应用的 React
cd my-lib
npm link ../my-app/node_modules/react
```

**问题 2：TypeScript 类型不更新**

**解决**：
```bash
# 库项目开启 watch 模式
npm run build -- --watch
```

**问题 3：取消链接**
```bash
# 在应用项目
npm unlink my-lib

# 在库项目
npm unlink -g
```

---

## 常见误区

### 误区 1：发布后立即可用

**真相**：CDN 缓存延迟

```bash
npm publish
# 立即安装
npm install my-lib@latest  # 可能仍是旧版本
```

**CDN 缓存时间**：5-10 分钟

**强制刷新**：
```bash
npm install my-lib@1.0.1  # 指定精确版本
```

### 误区 2：package.json 中的所有文件都会发布

**默认行为**：
```
默认包含：
- package.json
- README.md
- LICENSE

默认排除：
- .git/
- node_modules/
- *.log
```

**显式控制**：
```json
{
  "files": [
    "dist",
    "src"
  ]
}
```

**检查**：
```bash
npm pack --dry-run
# 显示将打包的文件列表
```

### 误区 3：unpublish 可以随时撤销

**npm 限制**：
```bash
# 发布后 72 小时内可撤销
npm unpublish my-lib@1.0.0

# 超过 72 小时
Error: Cannot unpublish package published more than 72 hours ago
```

**替代方案**：
```bash
# 废弃版本（不删除）
npm deprecate my-lib@1.0.0 "This version has critical bugs"
```

---

## 工程实践

### 场景 1：自动化发布流程

**使用 semantic-release**：
```bash
npm install --save-dev semantic-release
```

**配置**：
```json
// package.json
{
  "scripts": {
    "semantic-release": "semantic-release"
  }
}
```

**.releaserc.json**：
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github"
  ]
}
```

**CI 配置**：
```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 场景 2：Monorepo 发布

**Lerna 配置**：
```json
// lerna.json
{
  "version": "independent",
  "npmClient": "npm",
  "command": {
    "publish": {
      "conventionalCommits": true,
      "message": "chore(release): publish"
    }
  }
}
```

**发布**：
```bash
lerna publish
# 自动识别变更的包并发布
```

### 场景 3：Beta 版本管理

**发布流程**：
```bash
# 1. 创建 beta 版本
npm version prerelease --preid=beta
# 1.0.0 → 1.0.1-beta.0

# 2. 发布到 beta 标签
npm publish --tag beta

# 3. 用户测试
npm install my-lib@beta

# 4. 稳定后发布正式版
npm version patch  # 1.0.1-beta.0 → 1.0.1
npm publish
```

**dist-tags 管理**：
```bash
# 查看所有标签
npm dist-tag ls my-lib

# 添加标签
npm dist-tag add my-lib@1.0.0 stable

# 删除标签
npm dist-tag rm my-lib beta
```

---

## 深入一点

### registry 的高可用架构

**npm 官方架构**：
```
用户请求
  ↓
Fastly CDN（全球分布）
  ↓
Origin Server（AWS）
  ↓
CouchDB（元数据）+ S3（tarball）
```

**性能优化**：
- 元数据缓存：5 分钟
- Tarball 缓存：1 年
- Gzip 压缩传输

### 私有 registry 方案对比

| 方案 | 适用场景 | 成本 | 优势 |
|------|---------|------|------|
| Verdaccio | 小团队 | 免费 | 轻量、易部署 |
| npm Enterprise | 大企业 | 付费 | 官方支持 |
| Artifactory | 跨语言 | 付费 | 统一管理 |
| GitHub Packages | GitHub 用户 | 免费/付费 | CI 集成 |

### npm token 安全实践

**Token 类型**：
```bash
# 只读 token
npm token create --read-only

# CI 专用 token（不能 unpublish）
npm token create --cidr=0.0.0.0/0

# 全权限 token
npm token create
```

**环境变量配置**：
```bash
# .npmrc（不提交到 Git）
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

**CI 中使用**：
```yaml
env:
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 参考资料

- [npm publish 文档](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [Verdaccio 私有 registry](https://verdaccio.org/)
- [semantic-release](https://github.com/semantic-release/semantic-release)
