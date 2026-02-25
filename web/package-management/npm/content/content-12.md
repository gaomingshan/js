# .npmrc 配置文件详解

## 概述

.npmrc 是 npm 的配置文件，用于设置 registry 地址、代理、认证信息等。理解配置文件的优先级和常用选项，对于团队协作和 CI/CD 环境配置至关重要。

## 配置文件位置与优先级

### 四个级别

**优先级从高到低：**
```
1. 项目配置：/path/to/project/.npmrc
2. 用户配置：~/.npmrc
3. 全局配置：$PREFIX/etc/npmrc
4. 内置配置：/path/to/npm/npmrc
```

**查看配置位置：**
```bash
# 查看所有配置文件路径
npm config list --location

# 查看当前生效配置
npm config list
```

### 配置合并规则

```ini
# 项目 .npmrc
registry=https://registry.npmmirror.com

# 用户 ~/.npmrc  
registry=https://registry.npmjs.org
proxy=http://proxy.company.com:8080

# 最终生效：
# registry: 项目的（优先级高）
# proxy: 用户的（项目未设置）
```

## 基本配置

### registry（镜像源）

**官方源：**
```ini
registry=https://registry.npmjs.org
```

**国内镜像：**
```ini
# 淘宝镜像（推荐）
registry=https://registry.npmmirror.com

# 华为云镜像
registry=https://repo.huaweicloud.com/repository/npm/

# 腾讯云镜像
registry=https://mirrors.cloud.tencent.com/npm/
```

**切换命令：**
```bash
# 临时使用
npm install --registry=https://registry.npmmirror.com

# 永久设置
npm config set registry https://registry.npmmirror.com

# 恢复官方源
npm config set registry https://registry.npmjs.org
```

### 作用域 registry

**为不同作用域设置不同源：**
```ini
# 默认源
registry=https://registry.npmjs.org

# 公司私有源
@company:registry=https://npm.company.com

# GitHub Packages
@myorg:registry=https://npm.pkg.github.com
```

**使用：**
```bash
# @company 下的包从私有源安装
npm install @company/utils

# 其他包从官方源安装
npm install lodash
```

### proxy（代理设置）

**HTTP 代理：**
```ini
proxy=http://proxy.company.com:8080
https-proxy=http://proxy.company.com:8080
```

**带认证的代理：**
```ini
proxy=http://username:password@proxy.company.com:8080
```

**SOCKS 代理：**
```ini
proxy=socks5://127.0.0.1:1080
```

**命令行设置：**
```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 删除代理
npm config delete proxy
npm config delete https-proxy
```

### 认证配置

**Token 认证：**
```ini
//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxx
```

**Basic 认证：**
```ini
//registry.company.com/:_auth=base64encodedauth
```

**用户名密码（不推荐）：**
```ini
//registry.company.com/:username=myuser
//registry.company.com/:_password=base64password
//registry.company.com/:email=user@example.com
```

**安全建议：**
```bash
# 使用 npm login
npm login --registry=https://registry.company.com

# npm 会自动将 token 写入 ~/.npmrc
```

## 常用配置选项

### save-exact

```ini
# 安装时保存精确版本
save-exact=true
```

**效果：**
```json
// save-exact=false（默认）
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}

// save-exact=true
{
  "dependencies": {
    "lodash": "4.17.21"
  }
}
```

### save-prefix

```ini
# 默认版本前缀
save-prefix=~
```

**可选值：**
- `^`（默认）：兼容次版本
- `~`：兼容修订版本
- ``（空）：精确版本

### engine-strict

```ini
# 严格检查 Node.js 和 npm 版本
engine-strict=true
```

**配合 package.json：**
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

```bash
# engine-strict=true 时，版本不符合会报错
npm install
npm ERR! The engine "node" is incompatible
```

### legacy-peer-deps

```ini
# 忽略 peer 依赖冲突（npm 7+ 降级到 npm 6 行为）
legacy-peer-deps=true
```

### fund

```ini
# 禁用捐赠信息
fund=false
```

### audit

```ini
# 安装时自动运行安全审计
audit=true

# 设置审计级别
audit-level=moderate
```

### package-lock

```ini
# 禁用 package-lock.json
package-lock=false
```

**不推荐：**
会失去版本锁定能力。

### scripts-prepend-node-path

```ini
# 自动将 Node.js 添加到 PATH
scripts-prepend-node-path=true
```

### progress

```ini
# 禁用进度条（CI 环境）
progress=false
```

### loglevel

```ini
# 日志级别
loglevel=warn
```

**可选值：**
- `silent`：无输出
- `error`：仅错误
- `warn`：警告及以上
- `notice`：通知及以上（默认）
- `http`：HTTP 请求
- `timing`：性能计时
- `info`：详细信息
- `verbose`：非常详细
- `silly`：所有信息

## 团队协作配置

### 项目 .npmrc

**推荐配置：**
```ini
# 强制使用特定源（统一团队环境）
registry=https://registry.npmmirror.com

# 严格版本检查
engine-strict=true

# 禁用捐赠信息（减少输出干扰）
fund=false

# 自动审计
audit=true
audit-level=moderate

# 锁定 lockfile 版本
lockfile-version=2
```

**提交到 Git：**
```bash
git add .npmrc
git commit -m "chore: add project npmrc"
```

### 用户 .npmrc

**个人配置（不提交）：**
```ini
# 私有 token
//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxx

# 代理设置
proxy=http://proxy.company.com:8080

# Git 配置
git-tag-version=true
message="chore: release %s"
```

### .npmrc.example

**提供配置模板：**
```ini
# .npmrc.example
# registry=https://registry.npmmirror.com
# proxy=http://your-proxy:8080
# //registry.company.com/:_authToken=YOUR_TOKEN_HERE
```

**团队成员操作：**
```bash
cp .npmrc.example .npmrc
# 编辑 .npmrc，填入实际值
```

**.gitignore：**
```gitignore
.npmrc
!.npmrc.example
```

## 私有 registry 配置

### 完整示例

```ini
# 默认使用官方源
registry=https://registry.npmjs.org

# 公司私有包使用私有源
@company:registry=https://npm.company.com

# 私有源认证
//npm.company.com/:_authToken=${NPM_TOKEN}

# 总是使用私有源的 SSL
strict-ssl=true
ca=/path/to/company-ca.crt
```

### 环境变量

**使用环境变量保护敏感信息：**
```ini
# .npmrc
//npm.company.com/:_authToken=${NPM_TOKEN}
```

```bash
# 设置环境变量
export NPM_TOKEN=npm_xxxxxxxxxxxxx

# npm 自动替换 ${NPM_TOKEN}
npm install
```

**CI/CD 配置：**
```yaml
# GitHub Actions
env:
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

- name: Install dependencies
  run: npm ci
```

### SSL 配置

```ini
# 禁用 SSL 验证（不推荐）
strict-ssl=false

# 指定 CA 证书
ca=/path/to/ca.crt
ca[]=/path/to/ca1.crt
ca[]=/path/to/ca2.crt

# 指定客户端证书
cert=/path/to/client.crt
key=/path/to/client.key
```

## 高级配置

### 缓存配置

```ini
# 缓存目录
cache=/path/to/custom/cache

# 缓存最小时间（秒）
cache-min=10

# 缓存最大时间（秒）
cache-max=3600

# 离线模式
prefer-offline=true
offline=false
```

### 网络配置

```ini
# 超时设置（毫秒）
timeout=60000

# 重试次数
fetch-retries=2

# 重试间隔（毫秒）
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000

# 最大并发连接数
maxsockets=50
```

### 包配置

```ini
# 默认作者
init-author-name=Your Name
init-author-email=you@example.com
init-author-url=https://yoursite.com

# 默认许可证
init-license=MIT

# 默认版本
init-version=1.0.0
```

### 发布配置

```ini
# 发布前检查
prepublish=true

# Git tag
git-tag-version=true
tag-version-prefix=v

# 提交信息
message=chore: release %s

# 访问级别
access=public
```

## 命令行操作

### 查看配置

```bash
# 查看所有配置
npm config list

# 查看长格式（包含默认值）
npm config list -l

# JSON 格式
npm config list --json

# 查看特定配置
npm config get registry
npm config get proxy
```

### 设置配置

```bash
# 设置配置
npm config set registry https://registry.npmmirror.com

# 设置数组
npm config set ca /path/to/ca1.crt
npm config set ca /path/to/ca2.crt --add

# 设置到特定位置
npm config set registry https://example.com --location=project
npm config set proxy http://proxy:8080 --location=user
npm config set loglevel silent --location=global
```

### 删除配置

```bash
# 删除配置
npm config delete proxy
npm config delete https-proxy

# 删除特定位置的配置
npm config delete registry --location=project
```

### 编辑配置

```bash
# 直接编辑配置文件
npm config edit

# 编辑特定位置
npm config edit --location=global
npm config edit --location=user
```

## 常见配置场景

### 场景 1：使用国内镜像

```bash
npm config set registry https://registry.npmmirror.com
```

**或在项目中：**
```ini
# .npmrc
registry=https://registry.npmmirror.com
```

### 场景 2：公司内网开发

```ini
# .npmrc
registry=https://npm.company.com
proxy=http://proxy.company.com:8080
https-proxy=http://proxy.company.com:8080
strict-ssl=false
```

### 场景 3：混合使用公共和私有包

```ini
# .npmrc
registry=https://registry.npmjs.org
@company:registry=https://npm.company.com
//npm.company.com/:_authToken=${NPM_TOKEN}
```

### 场景 4：CI/CD 环境

```ini
# .npmrc（项目）
registry=https://registry.npmmirror.com
package-lock=true
progress=false
fund=false
audit-level=moderate
engine-strict=true
```

### 场景 5：开发 npm 包

```ini
# .npmrc（用户）
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
git-tag-version=true
message="chore: release v%s"
access=public
```

## 安全最佳实践

### 1. 不提交敏感信息

**.gitignore：**
```gitignore
.npmrc
```

**使用环境变量：**
```ini
# .npmrc
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

### 2. 使用 .npmrc.example

**提供模板：**
```ini
# .npmrc.example
# registry=https://registry.npmmirror.com
# //npm.company.com/:_authToken=YOUR_TOKEN_HERE
```

### 3. 定期轮换 token

```bash
# 登出
npm logout

# 重新登录（生成新 token）
npm login

# 删除旧 token
npm token revoke <token-id>
```

### 4. 使用只读 token（CI）

```bash
# 创建只读 token
npm token create --read-only

# 在 CI 中使用
# 即使泄露也无法发布包
```

## 故障排查

### 问题 1：配置未生效

```bash
# 查看实际生效配置
npm config list

# 检查优先级
npm config list --location

# 可能原因：被更高优先级配置覆盖
```

### 问题 2：registry 连接失败

```bash
# 测试连接
npm ping

# 检查 registry 配置
npm config get registry

# 尝试重置
npm config delete registry
```

### 问题 3：代理问题

```bash
# 检查代理配置
npm config get proxy
npm config get https-proxy

# 测试代理
curl -x http://proxy:8080 https://registry.npmjs.org

# 删除代理
npm config delete proxy
npm config delete https-proxy
```

### 问题 4：认证失败

```bash
# 检查 token
npm whoami

# 重新登录
npm logout
npm login
```

## 工具推荐

### nrm（registry 管理）

```bash
# 安装
npm install -g nrm

# 列出可用源
nrm ls

# 切换源
nrm use taobao
nrm use npm

# 添加自定义源
nrm add company https://npm.company.com

# 测试速度
nrm test
```

### nnrm（新版 registry 管理）

```bash
# 安装
npm install -g nnrm

# 功能更强大，支持 pnpm、yarn
nnrm ls
nnrm use taobao
```

## 参考资料

- [npm config 文档](https://docs.npmjs.com/cli/v9/commands/npm-config)
- [.npmrc 配置选项](https://docs.npmjs.com/cli/v9/configuring-npm/npmrc)
- [npm 配置最佳实践](https://docs.npmjs.com/cli/v9/using-npm/config)

---

**上一章：**[npm audit 安全审计机制](./content-11.md)  
**下一章：**[npm scripts 脚本系统](./content-13.md)
