# 私有 npm registry

## 概述

企业内部通常需要私有 npm registry 来管理内部包、缓存公共包和控制依赖安全。

## 一、为什么需要私有 registry

### 1.1 使用场景

**内部包管理：**
- 私有代码不适合公开
- 企业级组件库
- 内部工具包

**依赖缓存：**
- 加速安装
- 避免外网依赖
- 离线环境使用

**安全控制：**
- 审查第三方包
- 防止供应链攻击
- 许可证合规

## 二、Verdaccio（轻量级方案）

### 2.1 安装

```bash
# 全局安装
npm install -g verdaccio

# 启动
verdaccio

# 访问 http://localhost:4873
```

### 2.2 配置

**config.yaml：**
```yaml
# 存储路径
storage: ./storage

# 认证
auth:
  htpasswd:
    file: ./htpasswd
    max_users: -1  # 无限制

# 上游 registry
uplinks:
  npmjs:
    url: https://registry.npmmirror.com

# 包访问控制
packages:
  '@mycompany/*':
    access: $authenticated
    publish: $authenticated
    
  '**':
    access: $all
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs

# 服务器
listen: 0.0.0.0:4873

# Web UI
web:
  title: My Private Registry
```

### 2.3 使用

**注册用户：**
```bash
npm adduser --registry http://localhost:4873
```

**发布包：**
```bash
npm publish --registry http://localhost:4873
```

**安装包：**
```bash
npm install @mycompany/utils --registry http://localhost:4873
```

**配置 .npmrc：**
```ini
registry=http://localhost:4873
```

## 三、Docker 部署

### 3.1 Dockerfile

```dockerfile
FROM verdaccio/verdaccio:5

# 自定义配置
COPY config.yaml /verdaccio/conf/config.yaml

# 暴露端口
EXPOSE 4873

# 启动
CMD ["verdaccio"]
```

### 3.2 docker-compose.yml

```yaml
version: '3.8'

services:
  verdaccio:
    image: verdaccio/verdaccio:5
    container_name: verdaccio
    ports:
      - "4873:4873"
    volumes:
      - "./storage:/verdaccio/storage"
      - "./config:/verdaccio/conf"
      - "./plugins:/verdaccio/plugins"
    restart: unless-stopped
```

**启动：**
```bash
docker-compose up -d
```

## 四、企业级方案

### 4.1 Nexus Repository

**特点：**
- 支持多种仓库类型
- 企业级功能
- 强大的管理界面

**配置：**
```bash
# Docker 运行
docker run -d -p 8081:8081 \
  -v nexus-data:/nexus-data \
  sonatype/nexus3
```

### 4.2 JFrog Artifactory

**特点：**
- 商业产品
- 功能最全
- 支持 Monorepo

### 4.3 GitHub Packages

**配置：**
```ini
# .npmrc
@mycompany:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**发布：**
```json
// package.json
{
  "name": "@mycompany/utils",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

## 五、代理配置

### 5.1 缓存公共包

**Verdaccio 配置：**
```yaml
uplinks:
  npmjs:
    url: https://registry.npmmirror.com
    cache: true

packages:
  '**':
    proxy: npmjs
```

**工作流程：**
```
1. 请求 lodash
2. 检查本地缓存
3. 未命中 → 从 npmjs 下载
4. 缓存到本地
5. 返回给用户
```

### 5.2 多个上游

```yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org
  taobao:
    url: https://registry.npmmirror.com
  internal:
    url: https://npm.company.com

packages:
  '@company/*':
    proxy: internal
  '*':
    proxy: taobao npmjs
```

## 六、权限管理

### 6.1 用户认证

**htpasswd 认证：**
```yaml
auth:
  htpasswd:
    file: ./htpasswd
```

```bash
# 添加用户
htpasswd -c ./htpasswd username
```

**LDAP 认证：**
```yaml
auth:
  ldap:
    url: "ldap://ldap.company.com"
    baseDN: 'dc=company,dc=com'
```

### 6.2 包权限

```yaml
packages:
  '@company-admin/*':
    access: admin
    publish: admin
    
  '@company/*':
    access: $authenticated
    publish: developer
    
  '**':
    access: $all
    publish: $authenticated
```

## 七、CI/CD 集成

### 7.1 GitHub Actions

```yaml
# .github/workflows/publish.yml
name: Publish to Private Registry

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
      
      - name: Configure npm
        run: |
          echo "//npm.company.com/:_authToken=${{ secrets.NPM_TOKEN }}" > ~/.npmrc
          
      - name: Publish
        run: npm publish --registry https://npm.company.com
```

### 7.2 设置镜像

**项目 .npmrc：**
```ini
registry=https://npm.company.com
@company:registry=https://npm.company.com
```

**全局配置：**
```bash
npm config set registry https://npm.company.com
```

## 八、安全最佳实践

### 8.1 HTTPS

```yaml
# config.yaml
https:
  key: ./certs/server.key
  cert: ./certs/server.crt

listen: https://0.0.0.0:4873
```

### 8.2 Token 管理

```bash
# 使用环境变量
NPM_TOKEN=xxx npm publish

# 不要提交 .npmrc 中的 token
echo ".npmrc" >> .gitignore
```

### 8.3 包签名

```bash
# 启用 2FA
npm profile enable-2fa

# 发布时验证
npm publish --otp=123456
```

## 九、监控和维护

### 9.1 存储清理

```bash
# Verdaccio 存储
du -sh ./storage

# 清理旧版本
rm -rf ./storage/@company/old-package
```

### 9.2 日志监控

```yaml
# config.yaml
logs:
  - { type: stdout, format: pretty, level: info }
  - { type: file, path: verdaccio.log, level: warn }
```

### 9.3 备份

```bash
# 备份脚本
#!/bin/bash
tar -czf backup-$(date +%Y%m%d).tar.gz \
  ./storage \
  ./config.yaml \
  ./htpasswd
```

## 十、常见问题

### 10.1 无法访问公共包

**检查：**
```yaml
uplinks:
  npmjs:
    url: https://registry.npmmirror.com

packages:
  '**':
    proxy: npmjs
```

### 10.2 权限不足

**解决：**
```bash
npm adduser --registry http://localhost:4873
```

### 10.3 缓存问题

**清理缓存：**
```bash
rm -rf ./storage/.cache
```

## 参考资料

- [Verdaccio 文档](https://verdaccio.org/)
- [Nexus Repository](https://help.sonatype.com/repomanager3)
- [GitHub Packages](https://docs.github.com/en/packages)

---

**导航**  
[上一章：Lerna与Monorepo管理](./31-lerna.md) | [返回目录](../README.md) | [下一章：包管理器性能优化](./33-performance-optimization.md)
