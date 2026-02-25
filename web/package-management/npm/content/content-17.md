# npm 包发布最佳实践

## 包结构优化

### 最小化包体积

```json
{
  "files": [
    "dist",
    "README.md"
  ]
}
```

### 使用 .npmignore

```
# .npmignore
src/
tests/
*.test.js
.github/
.vscode/
```

## 文档完善

### README 模板

```markdown
# Package Name

[![npm version](https://badge.fury.io/js/package.svg)](https://www.npmjs.com/package/package)
[![License](https://img.shields.io/npm/l/package.svg)](https://github.com/user/repo/blob/main/LICENSE)

## Installation
\`\`\`bash
npm install package
\`\`\`

## Quick Start
\`\`\`javascript
const pkg = require('package');
pkg.doSomething();
\`\`\`

## API
### method(param)
Description...

## License
MIT
```

### CHANGELOG

```markdown
# Changelog

## [1.1.0] - 2024-01-15
### Added
- New feature X

### Changed
- Improved performance

### Fixed
- Bug in Y
```

## 版本管理

### 使用 standard-version

```bash
npm install -D standard-version
```

```json
{
  "scripts": {
    "release": "standard-version"
  }
}
```

### Commit 规范

```
feat: add new feature
fix: resolve bug
docs: update README
chore: update dependencies
```

## 测试覆盖

### 配置测试

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "prepublishOnly": "npm test"
  }
}
```

## TypeScript 支持

### 类型定义

```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  }
}
```

## CI/CD 自动发布

### GitHub Actions

```yaml
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

## 参考资料

- [npm 发布最佳实践](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

---

**上一章：**[npm 包发布完整流程](./content-16.md)  
**下一章：**[私有 npm 仓库方案](./content-18.md)
