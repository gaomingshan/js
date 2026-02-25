# 团队协作与工程化规范

## package.json 管理规范

### 字段规范

```json
{
  "name": "@company/project",
  "version": "1.0.0",
  "description": "明确的项目描述",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  }
}
```

### 依赖管理

```json
{
  "dependencies": {
    "react": "^18.2.0"  // 生产依赖
  },
  "devDependencies": {
    "vite": "^4.4.0"  // 开发依赖
  }
}
```

## lock 文件协作

### 提交规范

```bash
# 始终提交 lock 文件
git add package-lock.json
git commit -m "chore: update dependencies"
```

### 冲突解决

```bash
# 方案 1：使用主分支版本
git checkout main package-lock.json
npm install

# 方案 2：删除重建
rm package-lock.json
npm install
```

### CI/CD 使用

```yaml
# 使用 npm ci
- run: npm ci
```

## 依赖升级流程

### 定期检查

```bash
# 每月执行
npm outdated
npm audit
```

### 升级策略

```bash
# 1. 创建分支
git checkout -b chore/update-deps

# 2. 更新依赖
npm update

# 3. 测试
npm test

# 4. 提交 PR
git commit -am "chore: update dependencies"
```

### 重大更新

```bash
# 使用 ncu
npx npm-check-updates -i
npm install
npm test
```

## 发布流程规范

### 版本管理

```json
{
  "scripts": {
    "preversion": "npm test",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags"
  }
}
```

### 发布检查

```bash
# 1. 测试通过
npm test

# 2. 构建成功
npm run build

# 3. 更新版本
npm version patch

# 4. 发布
npm publish
```

## .npmrc 团队配置

### 项目配置

```ini
# .npmrc（提交到 Git）
registry=https://registry.npmmirror.com
engine-strict=true
save-exact=false
fund=false
```

### 用户配置

```ini
# ~/.npmrc（不提交）
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

## 代码审查清单

### package.json 审查

- [ ] 版本号是否正确递增
- [ ] dependencies 分类是否合理
- [ ] scripts 命名是否规范
- [ ] engines 是否设置

### lock 文件审查

- [ ] 是否包含不必要的大版本更新
- [ ] 是否有安全漏洞
- [ ] 变更是否合理

## 文档规范

### README

```markdown
# Project Name

## 环境要求
- Node.js >= 18
- npm >= 9

## 安装
\`\`\`bash
npm install
\`\`\`

## 开发
\`\`\`bash
npm run dev
\`\`\`

## 部署
\`\`\`bash
npm run build
\`\`\`
```

### CONTRIBUTING

```markdown
# 贡献指南

## 依赖管理
- 使用 `npm install` 安装依赖
- 始终提交 package-lock.json
- 升级依赖前先创建 PR

## 发布流程
1. 运行测试
2. 更新 CHANGELOG
3. 使用 npm version
4. 发布到 npm
```

## 最佳实践

### 1. 统一开发环境

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

### 2. 自动化检查

```json
{
  "scripts": {
    "precommit": "npm run lint && npm test",
    "prepush": "npm run build"
  }
}
```

### 3. 定期维护

```bash
# 每周检查
npm outdated
npm audit

# 每月更新
npm update
npm dedupe
```

## 参考资料

- [npm 最佳实践](https://docs.npmjs.com/cli/v9/using-npm/scripts#best-practices)
- [语义化版本](https://semver.org/lang/zh-CN/)

---

**上一章：**[npm 常见问题与排查](./content-21.md)  
**下一章：**[npm 与其他包管理器对比](./content-23.md)
