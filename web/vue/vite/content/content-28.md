# CI/CD 集成

## 概述

持续集成/持续部署（CI/CD）可以自动化构建、测试和部署流程。本章介绍如何在 GitHub Actions、GitLab CI 等平台上集成 Vite 项目。

## GitHub Actions 配置

### 基础工作流

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Test
        run: npm test
```

### 使用 pnpm

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install
        run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm build
      
      - name: Test
        run: pnpm test
```

### 矩阵构建

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm test
```

## 构建缓存策略

### npm 缓存

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18'
    cache: 'npm'

- run: npm ci
```

### 自定义缓存

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      node_modules
      .vite
    key: ${{ runner.os }}-build-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-build-
      ${{ runner.os }}-

- run: npm install
- run: npm run build
```

### Turborepo 缓存

```yaml
- name: Setup Turborepo cache
  uses: actions/cache@v3
  with:
    path: .turbo
    key: ${{ runner.os }}-turbo-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-turbo-

- name: Build
  run: npm run build
```

## 环境变量管理

### GitHub Secrets

```yaml
# 设置: Settings → Secrets and variables → Actions

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_API_KEY: ${{ secrets.API_KEY }}
        run: npm run build
```

### 环境文件

```yaml
- name: Create env file
  run: |
    echo "VITE_API_URL=${{ secrets.API_URL }}" >> .env
    echo "VITE_APP_NAME=My App" >> .env

- name: Build
  run: npm run build
```

### 多环境配置

```yaml
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Build
        env:
          VITE_API_URL: ${{ secrets.STAGING_API_URL }}
        run: npm run build

  deploy-production:
    runs-on: ubuntu-latest
    environment: production
    needs: deploy-staging
    steps:
      - name: Build
        env:
          VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}
        run: npm run build
```

## 多环境部署

### 开发环境

```yaml
name: Deploy to Dev

on:
  push:
    branches: [ develop ]

jobs:
  deploy-dev:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        run: |
          npm install
          npm run build:dev
      
      - name: Deploy
        uses: easingthemes/ssh-deploy@v2
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_KEY }}
          REMOTE_HOST: ${{ secrets.DEV_HOST }}
          REMOTE_USER: ${{ secrets.DEV_USER }}
          TARGET: /var/www/dev
```

### 预发布环境

```yaml
name: Deploy to Staging

on:
  push:
    branches: [ staging ]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        env:
          VITE_API_URL: ${{ secrets.STAGING_API_URL }}
        run: |
          npm install
          npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./dist
```

### 生产环境

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        env:
          VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}
        run: |
          npm install
          npm run build
      
      - name: Deploy to S3
        uses: jakejarvis/s3-sync-action@v0.5.1
        with:
          args: --delete
        env:
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          SOURCE_DIR: 'dist'
```

## 增量构建优化

### 条件构建

```yaml
- name: Check for changes
  id: changes
  uses: dorny/paths-filter@v2
  with:
    filters: |
      src:
        - 'src/**'
      config:
        - 'vite.config.js'
        - 'package.json'

- name: Build
  if: steps.changes.outputs.src == 'true' || steps.changes.outputs.config == 'true'
  run: npm run build
```

### 仅构建变更的包（Monorepo）

```yaml
- name: Get changed packages
  id: packages
  run: |
    CHANGED=$(pnpm exec turbo run build --filter=...@HEAD --dry=json | jq -r '.packages[]')
    echo "changed=$CHANGED" >> $GITHUB_OUTPUT

- name: Build changed packages
  run: pnpm exec turbo run build --filter=...@HEAD
```

### 使用构建矩阵

```yaml
jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.filter.outputs.changes }}
    steps:
      - uses: actions/checkout@v3
      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            app: packages/app/**
            admin: packages/admin/**

  build:
    needs: changes
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: ${{ fromJSON(needs.changes.outputs.packages) }}
    steps:
      - name: Build ${{ matrix.package }}
        run: pnpm --filter ${{ matrix.package }} build
```

## 部署回滚方案

### 版本标记

```yaml
- name: Tag version
  run: |
    VERSION=$(node -p "require('./package.json').version")
    git tag "v$VERSION"
    git push origin "v$VERSION"
```

### 保存构建产物

```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v3
  with:
    name: dist-${{ github.sha }}
    path: dist/
    retention-days: 30
```

### 回滚脚本

```yaml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.inputs.version }}
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist-${{ github.event.inputs.version }}
          path: dist/
      
      - name: Deploy
        run: |
          # 部署旧版本
          ./deploy.sh
```

## GitLab CI 配置

### 基础配置

```yaml
# .gitlab-ci.yml
image: node:18

stages:
  - install
  - build
  - test
  - deploy

cache:
  paths:
    - node_modules/
    - .vite/

install:
  stage: install
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  script:
    - npm run test

deploy:
  stage: deploy
  script:
    - npm run deploy
  only:
    - main
```

### 多环境部署

```yaml
.deploy_template: &deploy_template
  image: node:18
  before_script:
    - npm ci
  script:
    - npm run build
    - npm run deploy

deploy_staging:
  <<: *deploy_template
  stage: deploy
  environment:
    name: staging
    url: https://staging.example.com
  variables:
    VITE_API_URL: $STAGING_API_URL
  only:
    - develop

deploy_production:
  <<: *deploy_template
  stage: deploy
  environment:
    name: production
    url: https://example.com
  variables:
    VITE_API_URL: $PRODUCTION_API_URL
  only:
    - main
  when: manual
```

## Docker 集成

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### CI 中构建 Docker

```yaml
- name: Build Docker image
  run: docker build -t myapp:${{ github.sha }} .

- name: Push to registry
  run: |
    docker tag myapp:${{ github.sha }} registry.example.com/myapp:latest
    docker push registry.example.com/myapp:latest
```

## 性能监控

### 构建时间统计

```yaml
- name: Build with timing
  run: |
    START_TIME=$(date +%s)
    npm run build
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    echo "Build took ${DURATION}s"
    echo "build_time=${DURATION}" >> $GITHUB_OUTPUT
```

### 产物大小分析

```yaml
- name: Analyze bundle size
  run: |
    BUNDLE_SIZE=$(du -sb dist | cut -f1)
    echo "Bundle size: $BUNDLE_SIZE bytes"
    
    # 与之前的版本对比
    if [ -f .bundle-size ]; then
      PREV_SIZE=$(cat .bundle-size)
      DIFF=$((BUNDLE_SIZE - PREV_SIZE))
      echo "Size change: $DIFF bytes"
    fi
    
    echo $BUNDLE_SIZE > .bundle-size
```

### Lighthouse CI

```yaml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://example.com
    uploadArtifacts: true
```

## 通知配置

### Slack 通知

```yaml
- name: Slack notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Build completed'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

### 企业微信通知

```yaml
- name: WeChat notification
  run: |
    curl -X POST ${{ secrets.WECHAT_WEBHOOK }} \
      -H 'Content-Type: application/json' \
      -d '{
        "msgtype": "text",
        "text": {
          "content": "构建完成: ${{ github.sha }}"
        }
      }'
```

## 实战配置模板

### 完整的 CI/CD 流程

```yaml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Cache Vite
        uses: actions/cache@v3
        with:
          path: node_modules/.vite
          key: ${{ runner.os }}-vite-${{ hashFiles('**/package-lock.json') }}
      
      - run: npm ci
      
      - name: Build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
        run: npm run build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./dist
```

## 参考资料

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [GitLab CI 文档](https://docs.gitlab.com/ee/ci/)
- [Vercel 部署](https://vercel.com/docs)
- [Netlify 部署](https://docs.netlify.com/)
