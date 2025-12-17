# 发布 npm 包

## 概述

发布 npm 包是将代码分享给社区的重要方式。本章介绍从注册账号到发布包的完整流程。

## 一、准备工作

### 1.1 注册 npm 账号

**访问官网注册：** https://www.npmjs.com/signup

```bash
# 验证账号
npm login
# 输入：Username, Password, Email, OTP（如果启用了2FA）

# 查看当前用户
npm whoami
```

### 1.2 配置 package.json

```json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "description": "A useful package",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": ["utility", "helper"],
  "author": "Your Name <your@email.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/my-awesome-package.git"
  },
  "bugs": {
    "url": "https://github.com/username/my-awesome-package/issues"
  },
  "homepage": "https://github.com/username/my-awesome-package#readme"
}
```

### 1.3 检查包名可用性

```bash
# 查看包名是否已被占用
npm view my-awesome-package

# 如果报错，说明可用
npm ERR! 404 'my-awesome-package' is not in this registry.
```

## 二、作用域包（Scoped Packages）

### 2.1 什么是作用域包

作用域包以 `@scope/name` 格式命名，避免命名冲突：

```json
{
  "name": "@mycompany/utils"
}
```

### 2.2 发布作用域包

**私有包（需付费）：**
```bash
npm publish
```

**公开包（免费）：**
```bash
npm publish --access public
```

### 2.3 使用作用域包

```bash
npm install @mycompany/utils
```

```javascript
import { helper } from '@mycompany/utils';
```

## 三、发布流程

### 3.1 构建项目

```bash
# 构建
npm run build

# 验证输出
ls dist/
```

### 3.2 测试包

```bash
# 本地测试
npm link
cd ~/test-project
npm link my-awesome-package

# 或使用 npm pack
npm pack
# 生成 my-awesome-package-1.0.0.tgz

# 在其他项目测试
npm install /path/to/my-awesome-package-1.0.0.tgz
```

### 3.3 发布

```bash
# 发布到 npm
npm publish

# 发布公开的作用域包
npm publish --access public

# 发布带 tag 的版本
npm publish --tag beta
```

**输出示例：**
```
+ my-awesome-package@1.0.0
```

### 3.4 验证发布

```bash
# 查看包信息
npm view my-awesome-package

# 在浏览器查看
https://www.npmjs.com/package/my-awesome-package
```

## 四、版本管理

### 4.1 更新版本号

```bash
# PATCH: 1.0.0 → 1.0.1
npm version patch

# MINOR: 1.0.0 → 1.1.0
npm version minor

# MAJOR: 1.0.0 → 2.0.0
npm version major

# 自动创建 git tag
```

### 4.2 发布新版本

```bash
# 1. 更新版本
npm version patch

# 2. 构建
npm run build

# 3. 发布
npm publish

# 4. 推送 tag
git push --follow-tags
```

### 4.3 发布预发布版本

```bash
# 发布 beta 版本
npm version prerelease --preid=beta
# 1.0.0 → 1.0.1-beta.0

npm publish --tag beta

# 用户安装
npm install my-package@beta
```

**版本标签：**
```bash
npm dist-tag ls my-package
# latest: 1.0.0
# beta: 1.0.1-beta.0
```

## 五、.npmignore 文件

### 5.1 控制发布内容

```
# .npmignore
src/
tests/
*.test.js
.github/
.vscode/
.gitignore
tsconfig.json
rollup.config.js
```

### 5.2 优先级

```
files 字段（最高优先级）
  ↓
.npmignore
  ↓
.gitignore（如果没有 .npmignore）
```

### 5.3 始终包含的文件

- `package.json`
- `README.md`
- `LICENSE`

### 5.4 始终排除的文件

- `node_modules/`
- `.git/`
- `.DS_Store`

## 六、发布前检查

### 6.1 使用 prepublishOnly 钩子

```json
{
  "scripts": {
    "prepublishOnly": "npm run lint && npm test && npm run build"
  }
}
```

**执行顺序：**
```bash
npm publish
# → prepublishOnly → publish → postpublish
```

### 6.2 使用 np 工具

```bash
# 安装
npm install -g np

# 发布（交互式）
np
```

**np 会自动：**
- ✅ 运行测试
- ✅ 构建项目
- ✅ 更新版本
- ✅ 创建 git tag
- ✅ 发布到 npm
- ✅ 推送到 GitHub

## 七、撤销发布

### 7.1 撤销版本（72小时内）

```bash
# 撤销特定版本
npm unpublish my-package@1.0.1

# 撤销整个包（慎用）
npm unpublish my-package --force
```

**限制：**
- ⚠️ 只能撤销 72 小时内发布的版本
- ⚠️ 撤销后不能再发布相同版本号

### 7.2 废弃版本（推荐）

```bash
# 标记版本为废弃
npm deprecate my-package@1.0.0 "此版本有安全漏洞，请升级到 1.0.1"

# 废弃所有版本
npm deprecate my-package "包已不再维护"
```

**效果：**
```bash
npm install my-package@1.0.0
# npm WARN deprecated my-package@1.0.0: 此版本有安全漏洞，请升级到 1.0.1
```

## 八、发布到私有 registry

### 8.1 配置私有源

```bash
# 全局配置
npm config set registry https://npm.mycompany.com

# 或在 .npmrc
registry=https://npm.mycompany.com
```

### 8.2 作用域包私有源

```bash
# 只对作用域包使用私有源
npm config set @mycompany:registry https://npm.mycompany.com
```

```json
{
  "name": "@mycompany/utils",
  "publishConfig": {
    "registry": "https://npm.mycompany.com"
  }
}
```

### 8.3 认证

```bash
# 登录私有源
npm login --registry=https://npm.mycompany.com

# 或配置 token
echo "//npm.mycompany.com/:_authToken=YOUR_TOKEN" >> ~/.npmrc
```

## 九、发布最佳实践

### 9.1 发布前清单

```markdown
- [ ] 代码已提交到 git
- [ ] 测试全部通过
- [ ] 构建成功
- [ ] 更新 CHANGELOG.md
- [ ] 更新 README.md
- [ ] 检查 package.json 配置
- [ ] 本地测试包可用
```

### 9.2 语义化版本规范

```bash
# Bug 修复
npm version patch  # 1.0.0 → 1.0.1

# 新增功能（向后兼容）
npm version minor  # 1.0.0 → 1.1.0

# 破坏性变更
npm version major  # 1.0.0 → 2.0.0
```

### 9.3 自动化发布流程

```json
{
  "scripts": {
    "release:patch": "npm version patch && npm publish && git push --follow-tags",
    "release:minor": "npm version minor && npm publish && git push --follow-tags",
    "release:major": "npm version major && npm publish && git push --follow-tags"
  }
}
```

### 9.4 使用 GitHub Actions

```yaml
# .github/workflows/publish.yml
name: Publish Package

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 十、常见问题

### 10.1 包名已被占用

**解决：**
- 使用作用域包：`@username/package-name`
- 选择其他名称
- 联系现有包作者转让（如果包已废弃）

### 10.2 发布失败

```bash
# 查看详细错误
npm publish --loglevel verbose

# 常见原因：
# 1. 未登录
# 2. 版本号已存在
# 3. 权限不足
# 4. 网络问题
```

### 10.3 忘记构建就发布了

```bash
# 撤销版本
npm unpublish my-package@1.0.1

# 重新构建和发布
npm run build
npm version patch
npm publish
```

## 参考资料

- [npm 发布文档](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [np - 更好的发布工具](https://github.com/sindresorhus/np)

---

**导航**  
[上一章：npm link本地开发](./10-npm-link.md) | [返回目录](../README.md) | [下一章：npm包开发最佳实践](./12-package-development.md)
