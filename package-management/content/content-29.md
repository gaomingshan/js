# 私有包管理方案

## Verdaccio 私有 registry

### 快速搭建

**安装**：
```bash
# 全局安装
npm install -g verdaccio

# 或使用 Docker
docker run -it --rm --name verdaccio -p 4873:4873 verdaccio/verdaccio
```

**启动**：
```bash
verdaccio

# 输出：
# warn --- config file  - /home/user/.config/verdaccio/config.yaml
# warn --- http address - http://localhost:4873/ - verdaccio/5.0.0
```

**访问**：
```
http://localhost:4873
```

### 配置文件

**config.yaml**：
```yaml
# 存储路径
storage: ./storage

# 认证
auth:
  htpasswd:
    file: ./htpasswd
    max_users: -1  # 无限制

# 上游链路（代理到公共 registry）
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
  
  taobao:
    url: https://registry.npmmirror.com/

# 包访问控制
packages:
  '@my-company/*':
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated
  
  '**':
    access: $all
    publish: $authenticated
    proxy: npmjs

# 服务器配置
listen: 0.0.0.0:4873

# Web UI
web:
  title: My Company Registry
  
# 日志
logs: { type: stdout, format: pretty, level: http }
```

### 用户管理

**添加用户**：
```bash
npm adduser --registry http://localhost:4873

# 输入：
# Username: alice
# Password: ****
# Email: alice@company.com
```

**发布包**：
```bash
# 设置 registry
npm set registry http://localhost:4873

# 登录
npm login

# 发布
npm publish
```

---

## npm Enterprise vs Artifactory

### npm Enterprise

**功能**：
- 私有 registry
- 安全扫描
- 权限管理
- 审计日志

**价格**：
```
Team: $7/用户/月
Enterprise: 定制报价
```

**部署**：
```bash
# Docker 部署
docker run -d \
  -p 8080:8080 \
  -v /opt/npm-enterprise:/data \
  npmjs/npm-enterprise
```

**配置**：
```json
{
  "storage": {
    "type": "s3",
    "bucket": "my-npm-packages",
    "region": "us-east-1"
  },
  "auth": {
    "type": "oauth",
    "provider": "github"
  },
  "security": {
    "scanning": true,
    "vulnerabilityThreshold": "moderate"
  }
}
```

### JFrog Artifactory

**优势**：
- 支持多种包格式（npm, Maven, Docker等）
- 企业级高可用
- 细粒度权限控制
- 构建集成

**npm 配置**：
```yaml
# artifactory.yaml
repositories:
  npm-local:
    type: npm
    description: "Local NPM Repository"
    
  npm-remote:
    type: npm
    url: https://registry.npmjs.org
    description: "Remote NPM Repository"
  
  npm-virtual:
    type: npm-virtual
    repositories:
      - npm-local
      - npm-remote
    description: "Virtual NPM Repository"
```

**客户端配置**：
```
# .npmrc
registry=https://artifactory.company.com/artifactory/api/npm/npm-virtual/
//artifactory.company.com/artifactory/api/npm/:_authToken=${NPM_TOKEN}
```

### 对比

| 特性 | Verdaccio | npm Enterprise | Artifactory |
|------|-----------|----------------|-------------|
| 成本 | 免费 | $$$ | $$$$ |
| 部署 | 简单 | 中等 | 复杂 |
| 多格式支持 | ❌ | ❌ | ✅ |
| 企业集成 | 基础 | 良好 | 完善 |
| 高可用 | 需自建 | 支持 | 原生支持 |
| 适用场景 | 小团队 | 中型团队 | 大型企业 |

---

## scope 包的权限控制

### npm scope 机制

**scope 命名**：
```
@my-org/package-name
 ^^^^^^^ scope
        ^^^^^^^^^^^^^ package name
```

**优势**：
- 命名隔离（避免冲突）
- 权限控制（组织级别）
- 私有包标识

### 发布 scope 包

**创建 scope 包**：
```json
// package.json
{
  "name": "@my-company/utils",
  "version": "1.0.0",
  "publishConfig": {
    "access": "restricted",  // 或 "public"
    "registry": "https://registry.company.com"
  }
}
```

**发布**：
```bash
# 登录到私有 registry
npm login --registry=https://registry.company.com

# 发布
npm publish --access restricted
```

### 权限配置

**Verdaccio 配置**：
```yaml
packages:
  '@my-company/*':
    access: $authenticated
    publish: $authenticated
    unpublish: owner
  
  '@public/*':
    access: $all
    publish: $authenticated
  
  '@private/*':
    access: admin-group
    publish: admin-group
```

**团队权限**：
```bash
# npm Enterprise/Artifactory
npm team create my-org:developers
npm team add my-org:developers alice
npm team add my-org:developers bob

# 设置包权限
npm access grant read-write my-org:developers @my-org/utils
```

---

## 混合源配置策略

### 多 registry 配置

**问题**：需要从多个源安装包
```
公共包 → npm registry
私有包 → 公司 registry
特定包 → GitHub Packages
```

**解决方案 1**：scope-based registry

**.npmrc**：
```
# 默认源
registry=https://registry.npmjs.org/

# 私有包使用公司源
@my-company:registry=https://npm.company.com/

# GitHub 包
@github-org:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

# 公司源认证
//npm.company.com/:_authToken=${COMPANY_NPM_TOKEN}
```

**效果**：
```bash
# 自动路由
npm install lodash           # → registry.npmjs.org
npm install @my-company/util # → npm.company.com
npm install @github-org/pkg  # → npm.pkg.github.com
```

### 代理模式

**Verdaccio 代理配置**：
```yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
  
  github:
    url: https://npm.pkg.github.com/
    auth:
      type: bearer
      token: ${GITHUB_TOKEN}

packages:
  '@my-company/*':
    access: $authenticated
    publish: $authenticated
    # 不代理，只本地
  
  '@github-org/*':
    access: $all
    proxy: github
  
  '**':
    access: $all
    proxy: npmjs
```

**优势**：
- 统一入口
- 缓存优化
- 离线可用

**客户端配置**（简化）：
```
# .npmrc
registry=http://verdaccio.company.com:4873/
```

---

## 常见误区

### 误区 1：私有 registry 可以完全离线

**真相**：仍需要公共包

**实际场景**：
```yaml
# Verdaccio 配置
uplinks:
  npmjs:
    url: https://registry.npmjs.org/  # 需要联网

packages:
  '@my-company/*':
    # 私有包（本地）
  
  '**':
    proxy: npmjs  # 公共包（需要联网）
```

**完全离线方案**：
```bash
# 预先缓存所有包
npm install --prefer-offline

# 打包缓存
tar -czf npm-cache.tar.gz ~/.npm

# 离线环境
tar -xzf npm-cache.tar.gz
npm install --offline
```

### 误区 2：scope 包必须是私有的

**真相**：scope 包可以是公开的

**公开 scope 包**：
```bash
npm publish --access public
```

**示例**：
```
@babel/core     # 公开
@types/node     # 公开
@my-org/utils   # 可公开或私有
```

### 误区 3：混合源配置很复杂

**简化配置**：
```
# 方案 1：使用 Verdaccio 统一代理
registry=http://verdaccio.company.com/

# 方案 2：只配置 scope
@my-company:registry=https://npm.company.com/
```

---

## 工程实践

### 场景 1：小团队快速搭建

**使用 Verdaccio + Docker Compose**：

```yaml
# docker-compose.yml
version: '3'
services:
  verdaccio:
    image: verdaccio/verdaccio:5
    container_name: verdaccio
    ports:
      - "4873:4873"
    volumes:
      - ./verdaccio/storage:/verdaccio/storage
      - ./verdaccio/config:/verdaccio/conf
      - ./verdaccio/plugins:/verdaccio/plugins
    environment:
      - VERDACCIO_PORT=4873
    restart: unless-stopped
```

**启动**：
```bash
docker-compose up -d

# 访问
open http://localhost:4873
```

**团队配置**：
```bash
# 每个开发者配置
npm set registry http://verdaccio.company.com:4873
npm adduser

# 发布包
npm publish
```

### 场景 2：企业级高可用部署

**架构**：
```
Load Balancer
├─ Artifactory Node 1
├─ Artifactory Node 2
└─ Artifactory Node 3
   ↓
Shared Storage (S3/NFS)
```

**Nginx 配置**：
```nginx
upstream npm_registry {
  least_conn;
  server artifactory-1:8081;
  server artifactory-2:8081;
  server artifactory-3:8081;
}

server {
  listen 443 ssl;
  server_name npm.company.com;
  
  ssl_certificate /etc/ssl/certs/npm.crt;
  ssl_certificate_key /etc/ssl/private/npm.key;
  
  location / {
    proxy_pass http://npm_registry;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### 场景 3：CI/CD 集成

**GitLab CI**：
```yaml
variables:
  NPM_CONFIG_REGISTRY: "https://npm.company.com"
  NPM_TOKEN: "${CI_NPM_TOKEN}"

before_script:
  - echo "//npm.company.com/:_authToken=${NPM_TOKEN}" > .npmrc

stages:
  - build
  - test
  - publish

build:
  stage: build
  script:
    - npm ci
    - npm run build

publish:
  stage: publish
  only:
    - tags
  script:
    - npm publish
```

**GitHub Actions**：
```yaml
- name: Setup .npmrc
  run: |
    echo "registry=https://npm.company.com" >> .npmrc
    echo "//npm.company.com/:_authToken=${{ secrets.NPM_TOKEN }}" >> .npmrc

- name: Install dependencies
  run: npm ci

- name: Publish package
  run: npm publish
```

---

## 深入一点

### registry 的协议实现

**npm registry HTTP API**：
```
GET  /{package}              # 获取包元数据
GET  /{package}/{version}    # 获取特定版本
GET  /{package}/-/{tarball}  # 下载 tarball
PUT  /{package}              # 发布包
DELETE /{package}/-/{version} # 删除版本
```

**示例请求**：
```bash
# 获取包信息
curl https://registry.npmjs.org/lodash

# 下载 tarball
curl https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz -o lodash.tgz

# 发布包（需认证）
curl -X PUT \
  -H "Authorization: Bearer ${NPM_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @package.json \
  https://registry.npmjs.org/@my-org/my-package
```

### Verdaccio 的插件系统

**自定义认证插件**：
```javascript
// verdaccio-ldap-auth.js
module.exports = function(config, stuff) {
  return {
    authenticate: async (user, password, callback) => {
      try {
        const ldapUser = await ldap.authenticate(user, password);
        if (ldapUser) {
          callback(null, [user]);
        } else {
          callback(new Error('Invalid credentials'));
        }
      } catch (error) {
        callback(error);
      }
    },
    
    adduser: async (user, password, callback) => {
      // LDAP 不支持添加用户
      callback(new Error('Not implemented'));
    }
  };
};
```

**配置**：
```yaml
auth:
  verdaccio-ldap-auth:
    url: ldap://ldap.company.com
    baseDN: dc=company,dc=com
```

### 私有包的成本分析

**存储成本**：
```
假设：
- 100 个私有包
- 平均大小：5 MB
- 版本数：平均 10 个/包

总存储：100 × 5 MB × 10 = 5 GB

AWS S3 成本：
- 存储：$0.023/GB/月 × 5 GB = $0.115/月
- 传输：可忽略（内网）

自建服务器：
- 硬件：$500（一次性）
- 运维：$2000/月
```

**ROI 分析**：
```
云服务（npm Enterprise）：
- 成本：$7/用户/月 × 50 人 = $350/月

自建（Verdaccio）：
- 成本：$100/月（服务器 + 存储）
- 节省：$250/月 = $3000/年
```

---

## 参考资料

- [Verdaccio 官方文档](https://verdaccio.org/)
- [npm Enterprise](https://www.npmjs.com/products/enterprise)
- [JFrog Artifactory](https://jfrog.com/artifactory/)
- [GitHub Packages](https://docs.github.com/en/packages)
