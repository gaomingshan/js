# Git 工作流与 CI/CD

> 通过规范的 Git 工作流和 CI/CD 流程提升团队协作效率。

## Git 工作流

### Git Flow

```
master (生产)
  └─ hotfix/* (紧急修复)
     └─ merge → master + develop
develop (开发)
  └─ release/* (发布)
     └─ merge → master + develop
  └─ feature/* (功能)
     └─ merge → develop
```

### 分支命名规范

```bash
# 功能分支
git checkout -b feature/user-login
git checkout -b feature/shopping-cart

# 修复分支
git checkout -b fix/login-bug
git checkout -b fix/payment-error

# 发布分支
git checkout -b release/v1.0.0

# 热修复分支
git checkout -b hotfix/critical-bug
```

---

## Commit 规范

### Conventional Commits

```bash
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）**：
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具链

**示例**：
```bash
feat(auth): 添加用户登录功能

- 实现登录表单
- 添加表单验证
- 集成后端 API

Closes #123
```

### Commitlint

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert'
      ]
    ],
    'subject-case': [0],
    'subject-max-length': [2, 'always', 100]
  }
}
```

```bash
# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no-install commitlint --edit $1
```

---

## GitHub Actions

### 基础工作流

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run ESLint
        run: npm run lint
        
      - name: Run Prettier
        run: npm run format:check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:unit
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

### 自动部署

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### 自动发布

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
          
      - name: Upload Release Assets
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: ./dist.zip
          asset_name: dist.zip
          asset_content_type: application/zip
```

---

## GitLab CI/CD

### .gitlab-ci.yml

```yaml
stages:
  - install
  - lint
  - test
  - build
  - deploy

cache:
  paths:
    - node_modules/

install:
  stage: install
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/

lint:
  stage: lint
  script:
    - npm run lint

test:
  stage: test
  script:
    - npm run test:unit
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:production:
  stage: deploy
  script:
    - npm run deploy:prod
  only:
    - main
  environment:
    name: production
    url: https://example.com

deploy:staging:
  stage: deploy
  script:
    - npm run deploy:staging
  only:
    - develop
  environment:
    name: staging
    url: https://staging.example.com
```

---

## Docker 部署

### Dockerfile

```dockerfile
# 构建阶段
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    image: backend:latest
    ports:
      - "8080:8080"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

---

## 版本管理

### Semantic Versioning

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1 (补丁)
1.0.1 → 1.1.0 (次版本)
1.1.0 → 2.0.0 (主版本)
```

### standard-version

```bash
npm install -D standard-version
```

```json
// package.json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major"
  }
}
```

```javascript
// .versionrc.js
module.exports = {
  types: [
    { type: 'feat', section: '✨ Features' },
    { type: 'fix', section: '🐛 Bug Fixes' },
    { type: 'docs', section: '📝 Documentation' },
    { type: 'style', section: '💄 Styles' },
    { type: 'refactor', section: '♻️ Code Refactoring' },
    { type: 'perf', section: '⚡ Performance Improvements' },
    { type: 'test', section: '✅ Tests' },
    { type: 'chore', section: '🔧 Chores' }
  ]
}
```

### CHANGELOG.md

```markdown
# Changelog

## [1.0.0] - 2024-01-01

### ✨ Features
- **auth**: 添加用户登录功能
- **cart**: 实现购物车功能

### 🐛 Bug Fixes
- **payment**: 修复支付失败的问题

### 📝 Documentation
- 更新 README
- 添加 API 文档

### ♻️ Code Refactoring
- 重构用户模块
```

---

## 环境管理

### 多环境配置

```bash
# .env.development
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=My App (Dev)

# .env.staging
VITE_API_URL=https://staging-api.example.com
VITE_APP_TITLE=My App (Staging)

# .env.production
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
```

### 部署脚本

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:prod": "vite build --mode production",
    "deploy:staging": "npm run build:staging && sh scripts/deploy-staging.sh",
    "deploy:prod": "npm run build:prod && sh scripts/deploy-prod.sh"
  }
}
```

```bash
#!/bin/bash
# scripts/deploy-prod.sh

echo "开始部署到生产环境..."

# 构建
npm run build:prod

# 上传到服务器
scp -r dist/* user@server:/var/www/html/

# 重启 Nginx
ssh user@server 'sudo systemctl reload nginx'

echo "部署完成！"
```

---

## 代码审查

### PR 模板

```markdown
<!-- .github/pull_request_template.md -->
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 变更描述


## 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试通过

## 截图（如适用）


## 相关 Issue
Closes #

## Checklist
- [ ] 代码符合项目规范
- [ ] 已添加/更新测试
- [ ] 已更新文档
- [ ] 无 console.log 等调试代码
- [ ] 已进行自测
```

### 代码审查清单

```markdown
# Code Review Checklist

## 功能
- [ ] 实现符合需求
- [ ] 边界情况处理
- [ ] 错误处理完善

## 代码质量
- [ ] 代码清晰易懂
- [ ] 命名规范
- [ ] 无重复代码
- [ ] 注释合理

## 性能
- [ ] 无明显性能问题
- [ ] 合理使用缓存
- [ ] 避免不必要的计算

## 安全
- [ ] 输入验证
- [ ] XSS 防护
- [ ] 敏感信息保护

## 测试
- [ ] 测试覆盖充分
- [ ] 测试用例合理
- [ ] 测试通过
```

---

## 监控与告警

### Sentry 集成

```bash
npm install @sentry/vue
```

```typescript
// src/main.ts
import * as Sentry from '@sentry/vue'

const app = createApp(App)

if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router)
      }),
      new Sentry.Replay()
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  })
}
```

### 性能监控

```typescript
// src/utils/monitor.ts
export function reportPerformance() {
  if (!window.performance) return
  
  window.addEventListener('load', () => {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    
    // 发送到监控平台
    sendToMonitor({
      metric: 'page_load_time',
      value: pageLoadTime,
      page: window.location.pathname
    })
  })
}
```

---

## 最佳实践

### Git 操作

```bash
# 保持本地分支最新
git pull --rebase origin main

# 合并多个提交
git rebase -i HEAD~3

# 清理本地分支
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# 暂存当前工作
git stash
git stash pop

# 修改最后一次提交
git commit --amend
```

### CI/CD 优化

1. **缓存依赖**：加速构建
2. **并行任务**：提高效率
3. **增量构建**：只构建变更部分
4. **分层部署**：先部署到测试环境
5. **自动回滚**：部署失败自动回滚
6. **通知机制**：部署状态及时通知

### 团队协作

1. **代码审查**：至少一人审查
2. **分支保护**：禁止直接推送到主分支
3. **自动化测试**：PR 必须通过测试
4. **文档更新**：功能变更同步更新文档
5. **定期同步**：及时合并主分支
6. **沟通协作**：及时沟通避免冲突

---

## 故障排查

### 构建失败

```bash
# 清除缓存
rm -rf node_modules package-lock.json
npm install

# 检查 Node.js 版本
node -v

# 查看详细日志
npm run build --verbose
```

### 部署失败

```bash
# 检查环境变量
echo $VITE_API_URL

# 验证构建产物
ls -la dist/

# 测试生产构建
npm run preview
```

---

## 参考资料

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [Docker](https://docs.docker.com/)
- [Semantic Versioning](https://semver.org/)
