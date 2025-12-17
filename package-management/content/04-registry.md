# registry 与镜像源

## 概述

registry 是包管理器获取包的远程仓库。理解 registry 机制和镜像源配置，能够提升安装速度和解决网络问题。

## 一、什么是 npm registry

### 1.1 registry 的作用

**npm registry** 是存储和分发 npm 包的中央仓库：

```
开发者发布 → npm registry → 用户安装
    ↓                           ↑
package.json              npm install
```

**官方 registry：**
```
https://registry.npmjs.org/
```

### 1.2 registry 的工作流程

```bash
npm install lodash
```

**步骤：**

```
1. 查询包信息
   npm → GET https://registry.npmjs.org/lodash
   
2. 解析版本
   registry → 返回所有版本信息
   
3. 下载 tarball
   npm → GET https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz
   
4. 解压安装
```

### 1.3 查询 registry 信息

```bash
# 查看当前 registry
npm config get registry

# 查看包信息
npm view lodash

# 查看所有版本
npm view lodash versions

# 查看最新版本
npm view lodash version
```

**包信息 API：**

```bash
# 获取包元数据
curl https://registry.npmjs.org/lodash

# 返回 JSON
{
  "name": "lodash",
  "description": "Lodash modular utilities.",
  "dist-tags": {
    "latest": "4.17.21"
  },
  "versions": {
    "4.17.21": { ... }
  }
}
```

## 二、国内镜像源

### 2.1 为什么需要镜像源

**问题：**
- 🐌 官方 registry 在国内访问慢
- ❌ 网络不稳定，经常失败
- ⏰ 大量依赖安装耗时长

**解决：** 使用国内镜像源

### 2.2 常用镜像源

| 镜像源 | 地址 | 特点 |
|--------|------|------|
| **淘宝镜像（推荐）** | `https://registry.npmmirror.com` | ⚡ 快，同步及时 |
| 腾讯云镜像 | `https://mirrors.cloud.tencent.com/npm/` | ✅ 稳定 |
| 华为云镜像 | `https://repo.huaweicloud.com/repository/npm/` | ✅ 备选 |
| 官方源 | `https://registry.npmjs.org/` | 🌐 最全 |

**淘宝镜像说明：**

```bash
# 旧地址（已废弃）
https://registry.npm.taobao.org

# 新地址（2022年后）
https://registry.npmmirror.com
```

### 2.3 配置镜像源

**方法1：临时使用**

```bash
npm install lodash --registry=https://registry.npmmirror.com
```

**方法2：全局配置**

```bash
# 设置镜像源
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry

# 恢复官方源
npm config set registry https://registry.npmjs.org
```

**方法3：使用 nrm 工具**

```bash
# 安装 nrm
npm install -g nrm

# 列出可用源
nrm ls

# 切换到淘宝源
nrm use taobao

# 测试速度
nrm test

# 添加自定义源
nrm add custom https://registry.example.com
```

**方法4：.npmrc 文件配置**

```bash
# 项目根目录创建 .npmrc
echo "registry=https://registry.npmmirror.com" > .npmrc
```

## 三、.npmrc 配置文件

### 3.1 配置文件优先级

npm 配置有多个层级：

```
1. 命令行参数（最高优先级）
   npm install --registry=...
   
2. 项目级 .npmrc
   /path/to/project/.npmrc
   
3. 用户级 .npmrc
   ~/.npmrc
   
4. 全局 .npmrc
   /usr/local/etc/.npmrc
   
5. 内置默认配置（最低优先级）
```

### 3.2 项目级 .npmrc

**在项目根目录创建：**

```ini
# .npmrc
registry=https://registry.npmmirror.com

# 指定作用域的 registry
@mycompany:registry=https://npm.mycompany.com

# 设置代理
proxy=http://proxy.company.com:8080
https-proxy=http://proxy.company.com:8080

# 设置缓存目录
cache=/path/to/cache

# 设置日志级别
loglevel=warn

# 自动保存依赖
save=true
save-exact=false

# 引擎严格检查
engine-strict=true
```

### 3.3 用户级 .npmrc

```bash
# 编辑用户配置
npm config edit

# 或直接编辑文件
vim ~/.npmrc
```

**常用配置：**

```ini
# 默认 registry
registry=https://registry.npmmirror.com

# npm 初始化默认值
init-author-name=Your Name
init-author-email=your@email.com
init-license=MIT

# 全局安装目录
prefix=/usr/local
```

### 3.4 作用域包配置

**场景：** 公司私有包使用私有 registry，公共包使用官方源

```ini
# .npmrc
# 默认使用淘宝源
registry=https://registry.npmmirror.com

# @mycompany 作用域使用私有源
@mycompany:registry=https://npm.mycompany.com

# 认证信息
//npm.mycompany.com/:_authToken=your-token-here
```

**使用：**

```json
{
  "dependencies": {
    "lodash": "^4.17.21",           // 从淘宝源安装
    "@mycompany/utils": "^1.0.0"    // 从私有源安装
  }
}
```

## 四、私有 registry

### 4.1 为什么需要私有 registry

**使用场景：**
- 🏢 企业内部包管理
- 🔒 代码保密
- 🎯 依赖控制
- 📦 包缓存代理

### 4.2 Verdaccio（轻量级私有源）

**安装：**

```bash
# 全局安装
npm install -g verdaccio

# 启动服务
verdaccio

# 访问 http://localhost:4873
```

**配置文件（~/.config/verdaccio/config.yaml）：**

```yaml
# 存储路径
storage: ./storage

# 认证
auth:
  htpasswd:
    file: ./htpasswd

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
    proxy: npmjs
```

**使用私有源：**

```bash
# 设置 registry
npm config set registry http://localhost:4873

# 添加用户
npm adduser --registry http://localhost:4873

# 发布包
npm publish

# 安装包
npm install @mycompany/my-package
```

### 4.3 其他私有 registry 方案

| 方案 | 特点 | 适用场景 |
|------|------|----------|
| **Verdaccio** | 轻量，易部署 | 小团队 |
| **Nexus** | 功能强大，支持多种仓库 | 企业级 |
| **JFrog Artifactory** | 商业方案，企业级 | 大企业 |
| **npm Enterprise** | 官方企业方案 | 大企业 |
| **GitHub Packages** | GitHub 集成 | 开源项目 |

## 五、代理与认证

### 5.1 设置代理

**公司网络需要代理时：**

```bash
# 设置 HTTP 代理
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 如果代理需要认证
npm config set proxy http://username:password@proxy.company.com:8080

# 取消代理
npm config delete proxy
npm config delete https-proxy
```

**环境变量方式：**

```bash
# Linux/macOS
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Windows
set HTTP_PROXY=http://proxy.company.com:8080
set HTTPS_PROXY=http://proxy.company.com:8080
```

### 5.2 认证配置

**私有 registry 认证：**

**方法1：使用 authToken**

```ini
# .npmrc
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=your-token-here
```

**方法2：使用 npm login**

```bash
npm login --registry=https://npm.mycompany.com

# 输入用户名、密码、邮箱
# 自动生成 authToken
```

**方法3：使用 base64 认证**

```bash
# 生成 base64
echo -n 'username:password' | base64

# 配置
//npm.mycompany.com/:_auth=dXNlcm5hbWU6cGFzc3dvcmQ=
```

### 5.3 环境变量中的敏感信息

**避免硬编码 token：**

```ini
# .npmrc
@mycompany:registry=https://npm.mycompany.com
//npm.mycompany.com/:_authToken=${NPM_TOKEN}
```

```bash
# CI/CD 中设置环境变量
export NPM_TOKEN=your-token-here

npm install
```

## 六、镜像源最佳实践

### 6.1 推荐配置（中国大陆）

**项目 .npmrc：**

```ini
# 使用淘宝镜像
registry=https://registry.npmmirror.com

# 私有包使用私有源
@mycompany:registry=https://npm.mycompany.com

# Electron 等二进制文件镜像
electron_mirror=https://npmmirror.com/mirrors/electron/
sass_binary_site=https://npmmirror.com/mirrors/node-sass/
phantomjs_cdnurl=https://npmmirror.com/mirrors/phantomjs/
chromedriver_cdnurl=https://npmmirror.com/mirrors/chromedriver/
```

### 6.2 不同工具的镜像配置

**Yarn：**

```bash
# 设置镜像
yarn config set registry https://registry.npmmirror.com

# 查看配置
yarn config get registry
```

**pnpm：**

```bash
# 设置镜像
pnpm config set registry https://registry.npmmirror.com

# 查看配置
pnpm config get registry
```

### 6.3 CI/CD 中的配置

**GitHub Actions：**

```yaml
# .github/workflows/ci.yml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: 18
    registry-url: https://registry.npmmirror.com

- name: Install dependencies
  run: npm ci
  env:
    NPM_CONFIG_REGISTRY: https://registry.npmmirror.com
```

**Docker：**

```dockerfile
FROM node:18

# 设置镜像源
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm ci --only=production
```

## 七、常见问题排查

### 7.1 网络问题

```bash
# 测试连接
curl https://registry.npmmirror.com

# 查看详细日志
npm install --loglevel verbose

# 清理缓存重试
npm cache clean --force
npm install
```

### 7.2 认证失败

```bash
# 检查认证配置
npm config list

# 重新登录
npm logout
npm login --registry=https://npm.mycompany.com
```

### 7.3 镜像源同步延迟

```bash
# 如果淘宝镜像没有最新版本，临时使用官方源
npm install package-name --registry=https://registry.npmjs.org
```

## 参考资料

- [npm registry 官方文档](https://docs.npmjs.com/cli/v9/using-npm/registry)
- [淘宝 npm 镜像](https://npmmirror.com/)
- [Verdaccio 官方文档](https://verdaccio.org/)
- [nrm - npm registry 管理工具](https://github.com/Pana/nrm)

---

**导航**  
[上一章：包管理器工作原理](./03-working-principle.md) | [返回目录](../README.md) | [下一章：npm安装与配置](./05-npm-installation.md)
