# npm 包发布完整流程

## 概述

发布 npm 包是将代码分享给社区的过程。了解完整的发布流程、版本管理和最佳实践，能确保包的质量和可维护性。

## 发布前准备

### 1. 创建 npm 账号

```bash
# 注册账号（浏览器）
https://www.npmjs.com/signup

# 或命令行
npm adduser
```

### 2. 登录

```bash
npm login

# 输入：
# Username: your-username
# Password: your-password
# Email: you@example.com

# 验证登录
npm whoami
```

### 3. package.json 配置

```json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "description": "A useful package",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build && npm test"
  },
  "keywords": ["utility", "helper"],
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo.git"
  }
}
```

## 发布流程

### 1. 构建包

```bash
npm run build
```

### 2. 测试

```bash
npm test
```

### 3. 预览发布内容

```bash
# 查看将要发布的文件
npm pack --dry-run

# 或实际打包
npm pack
# 生成 my-awesome-package-1.0.0.tgz
```

### 4. 发布

```bash
# 发布到 npm
npm publish

# 发布 scoped 包（公开）
npm publish --access public
```

### 5. 验证

```bash
# 查看包信息
npm view my-awesome-package

# 安装测试
npm install my-awesome-package
```

## 版本管理

### 语义化版本

```bash
# 补丁版本：1.0.0 → 1.0.1
npm version patch

# 次版本：1.0.1 → 1.1.0
npm version minor

# 主版本：1.1.0 → 2.0.0
npm version major
```

### 预发布版本

```bash
# 1.0.0 → 1.0.1-beta.0
npm version prerelease --preid=beta

# 发布到 beta tag
npm publish --tag beta
```

### 自动化版本发布

```json
{
  "scripts": {
    "preversion": "npm test",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags && npm publish"
  }
}
```

```bash
npm version patch  # 自动测试、构建、提交、推送、发布
```

## npm tags

### 使用 tags

```bash
# 发布到特定 tag
npm publish --tag beta

# 安装特定 tag
npm install my-package@beta

# 查看所有 tags
npm dist-tag ls my-package

# 添加 tag
npm dist-tag add my-package@1.0.0 stable

# 移动 latest tag
npm dist-tag add my-package@2.0.0 latest
```

### 常用 tags

- `latest`：默认，稳定版本
- `next`：下一个版本
- `beta`：测试版本
- `alpha`：内测版本
- `canary`：每日构建

## 发布检查清单

### 必需项

- [ ] package.json 配置完整
- [ ] README.md 文档清晰
- [ ] LICENSE 文件
- [ ] .npmignore 或 files 字段
- [ ] 测试通过
- [ ] 代码已构建

### 推荐项

- [ ] CHANGELOG.md
- [ ] TypeScript 类型定义
- [ ] 示例代码
- [ ] CI/CD 配置
- [ ] 代码覆盖率报告

## 最佳实践

### 1. 使用 prepublishOnly

```json
{
  "scripts": {
    "prepublishOnly": "npm run lint && npm test && npm run build"
  }
}
```

### 2. 配置 files 字段

```json
{
  "files": [
    "dist",
    "*.md"
  ]
}
```

### 3. 提供清晰的文档

```markdown
# my-package

## Installation
\`\`\`bash
npm install my-package
\`\`\`

## Usage
\`\`\`javascript
const myPackage = require('my-package');
\`\`\`

## API
...
```

### 4. 语义化版本

- 破坏性变更：主版本
- 新功能：次版本
- Bug 修复：补丁版本

## 更新和废弃

### 更新包

```bash
# 修改代码
# 更新版本
npm version patch

# 发布
npm publish
```

### 废弃包

```bash
# 废弃特定版本
npm deprecate my-package@1.0.0 "Use 2.0.0 instead"

# 废弃所有版本
npm deprecate my-package "No longer maintained"
```

### 撤销发布

```bash
# 仅 72 小时内可撤销
npm unpublish my-package@1.0.0

# 撤销整个包（慎用）
npm unpublish my-package --force
```

**注意：**
- unpublish 会影响依赖该包的用户
- 建议使用 deprecate 而非 unpublish

## 私有包发布

### npm 私有仓库

```bash
# 发布私有包
npm publish  # scoped 包默认私有

# 发布公开 scoped 包
npm publish --access public
```

### Verdaccio（自建）

```bash
# 安装
npm install -g verdaccio

# 启动
verdaccio

# 配置 registry
npm config set registry http://localhost:4873

# 发布
npm publish
```

## 参考资料

- [npm publish 文档](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [package.json 规范](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)

---

**上一章：**[npm 缓存机制与优化](./content-15.md)  
**下一章：**[npm 包发布最佳实践](./content-17.md)
