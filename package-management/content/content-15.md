# npm 配置体系

## 配置文件优先级（npmrc 层级）

### 配置层级

**npm 配置的 4 个层级**（优先级从高到低）：

```
1. 命令行参数（最高优先级）
   npm install --registry=https://custom.registry.com

2. 项目配置文件
   /path/to/project/.npmrc

3. 用户配置文件
   ~/.npmrc

4. 全局配置文件
   $PREFIX/etc/npmrc

5. npm 内置默认值（最低优先级）
```

### 优先级示例

**场景**：
```bash
# 全局配置
~/.npmrc:
registry=https://registry.npmjs.org

# 项目配置
.npmrc:
registry=https://npm.pkg.github.com

# 实际使用
npm install
# 使用项目配置：https://npm.pkg.github.com
```

**命令行覆盖**：
```bash
npm install --registry=https://custom.com
# 使用命令行指定：https://custom.com
```

### 查看配置

**查看所有配置**：
```bash
npm config list

# 输出示例：
# ; "cli" config from command line options
# registry = "https://custom.com"
# 
# ; "project" config from /path/to/project/.npmrc
# registry = "https://npm.pkg.github.com"
# 
# ; "user" config from ~/.npmrc
# registry = "https://registry.npmjs.org"
```

**查看特定配置**：
```bash
npm config get registry
# https://npm.pkg.github.com
```

**查看所有配置（包括默认值）**：
```bash
npm config list -l
```

---

## 常用配置项详解

### Registry 配置

**默认 registry**：
```bash
npm config set registry https://registry.npmmirror.com

# 或在 .npmrc
registry=https://registry.npmmirror.com
```

**Scope registry**：
```bash
npm config set @my-org:registry https://npm.pkg.github.com

# 或在 .npmrc
@my-org:registry=https://npm.pkg.github.com
```

**效果**：
```bash
npm install lodash
# 从 https://registry.npmmirror.com 下载

npm install @my-org/package
# 从 https://npm.pkg.github.com 下载
```

### 缓存配置

**缓存目录**：
```bash
npm config set cache /custom/cache/path

# 查看当前缓存目录
npm config get cache
```

**缓存验证**：
```bash
npm cache verify
```

**清理缓存**：
```bash
npm cache clean --force
```

### 网络配置

**代理设置**：
```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 或在 .npmrc
proxy=http://proxy.company.com:8080
https-proxy=http://proxy.company.com:8080
```

**超时设置**：
```bash
npm config set fetch-timeout 60000  # 60 秒
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 10000
npm config set fetch-retry-maxtimeout 60000
```

### 安装行为配置

**save 配置**：
```bash
npm config set save-exact true  # 精确版本
npm config set save-prefix '~'  # 默认使用 ~

# 效果
npm install lodash
# package.json: "lodash": "4.17.21" (精确版本)
```

**package-lock 配置**：
```bash
npm config set package-lock false  # 禁用 lockfile
```

**引擎严格检查**：
```bash
npm config set engine-strict true

# package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}

# Node.js 16 执行 npm install
# Error: Unsupported engine
```

---

## 环境变量与配置覆盖

### 环境变量映射

**规则**：`npm_config_<key>=<value>`

**示例**：
```bash
# 环境变量
export npm_config_registry=https://custom.com

# 等价于
npm config set registry https://custom.com

# 或命令行
npm install --registry=https://custom.com
```

**常用环境变量**：
```bash
export npm_config_loglevel=verbose
export npm_config_cache=/tmp/npm-cache
export npm_config_prefix=/usr/local
```

### CI 环境配置

**GitHub Actions**：
```yaml
env:
  NPM_CONFIG_REGISTRY: https://npm.pkg.github.com
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

steps:
  - name: Setup .npmrc
    run: |
      echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" > .npmrc
      echo "@my-org:registry=https://npm.pkg.github.com" >> .npmrc
```

**GitLab CI**：
```yaml
before_script:
  - echo "registry=https://registry.npmmirror.com" > .npmrc
  - echo "//npm.pkg.gitlab.com/:_authToken=${CI_JOB_TOKEN}" >> .npmrc
```

### 安全配置

**敏感信息处理**：
```bash
# ❌ 错误：直接写在 .npmrc（会提交到 Git）
.npmrc:
//registry.npmjs.org/:_authToken=npm_xxx

# ✅ 正确：使用环境变量
.npmrc:
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

**.gitignore**：
```
.npmrc
```

**团队共享配置**：
```bash
# .npmrc.example（提交到 Git）
registry=https://npm.pkg.github.com
@my-org:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}

# 团队成员复制并配置
cp .npmrc.example .npmrc
# 设置 NPM_TOKEN 环境变量
```

---

## 企业级配置最佳实践

### 企业私有 registry 配置

**场景**：公司内网 + 公网混合

**.npmrc**：
```
registry=https://registry.npm.company.com  # 默认私有源

# 公开包从官方源下载
@babel:registry=https://registry.npmjs.org
@types:registry=https://registry.npmjs.org
```

**Verdaccio 配置**：
```yaml
# config.yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  '@company/*':
    access: $authenticated
    publish: $authenticated
    
  '**':
    access: $all
    proxy: npmjs  # 其他包代理到官方源
```

### 多环境配置

**开发环境**：
```bash
# .npmrc.dev
registry=https://registry.npmmirror.com  # 国内镜像
loglevel=verbose
```

**生产环境**：
```bash
# .npmrc.prod
registry=https://npm.pkg.company.com
loglevel=error
save-exact=true
engine-strict=true
```

**切换环境**：
```bash
# package.json
{
  "scripts": {
    "setup:dev": "cp .npmrc.dev .npmrc",
    "setup:prod": "cp .npmrc.prod .npmrc"
  }
}
```

### 团队规范配置

**强制配置**：
```bash
# .npmrc（提交到 Git）
save-exact=true
engine-strict=true
package-lock=true
```

**package.json 校验**：
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "packageManager": "npm@9.5.0"
}
```

**pre-commit 钩子**：
```bash
#!/bin/sh
# .husky/pre-commit

# 检查 .npmrc 是否存在
if [ ! -f .npmrc ]; then
  echo "Error: .npmrc not found"
  exit 1
fi

# 检查 package-lock.json
if [ ! -f package-lock.json ]; then
  echo "Error: package-lock.json not found"
  exit 1
fi
```

---

## 常见误区

### 误区 1：全局配置适用于所有项目

**问题**：
```bash
# 全局配置淘宝镜像
npm config set registry https://registry.npmmirror.com --global

# 私有包项目无法访问
npm install @my-company/private-pkg
# Error: 404 Not Found
```

**解决**：
```bash
# 项目级配置（覆盖全局）
echo "registry=https://npm.pkg.company.com" > .npmrc
```

### 误区 2：.npmrc 可以提交敏感信息

**危险**：
```bash
# .npmrc
//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxx

# 提交到 Git
git add .npmrc
git commit -m "Add .npmrc"
# ❌ token 泄露！
```

**正确做法**：
```bash
# .npmrc
//registry.npmjs.org/:_authToken=${NPM_TOKEN}

# .gitignore
.npmrc

# .npmrc.example（示例配置）
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

### 误区 3：忽略 package-lock.json 的配置影响

**问题**：
```bash
# 开发环境
npm config set registry https://registry.npmmirror.com
npm install  # 生成 package-lock.json

# CI 环境（官方源）
npm ci
# Error: integrity checksum failed
# 因为 lockfile 记录的 resolved 是镜像源
```

**解决**：
```bash
# 统一配置
.npmrc:
registry=https://registry.npmjs.org
```

---

## 工程实践

### 场景 1：本地开发优化

**.npmrc**：
```
# 使用国内镜像
registry=https://registry.npmmirror.com

# 缓存优化
cache=/tmp/npm-cache
prefer-offline=true

# 日志详细
loglevel=verbose

# 并发下载
maxsockets=20
```

### 场景 2：CI/CD 配置

**GitHub Actions**：
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18'
    registry-url: 'https://npm.pkg.github.com'
    scope: '@my-org'

- name: Install dependencies
  run: npm ci
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**动态生成 .npmrc**：
```yaml
- name: Create .npmrc
  run: |
    cat << EOF > .npmrc
    registry=https://registry.npmjs.org
    @my-org:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
    EOF
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 场景 3：诊断配置问题

**步骤**：
```bash
# 1. 查看当前有效配置
npm config list

# 2. 查看特定配置来源
npm config get registry -l

# 3. 查看所有配置文件
cat ~/.npmrc
cat .npmrc
cat $PREFIX/etc/npmrc

# 4. 测试配置
npm install --dry-run --loglevel=verbose
```

---

## 深入一点

### npm config 的实现

**配置合并逻辑**：
```javascript
function loadConfig() {
  const configs = [
    loadBuiltinConfig(),
    loadGlobalConfig(),
    loadUserConfig(),
    loadProjectConfig(),
    loadCliConfig()
  ];
  
  // 从低优先级到高优先级合并
  return configs.reduce((merged, config) => ({
    ...merged,
    ...config
  }), {});
}
```

**环境变量解析**：
```javascript
function resolveEnvVars(config) {
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' && value.includes('${')) {
      config[key] = value.replace(/\${(\w+)}/g, (_, envVar) => {
        return process.env[envVar] || '';
      });
    }
  }
  return config;
}
```

### .npmrc 文件格式

**INI 格式**：
```ini
; 注释
registry=https://registry.npmjs.org

; Scope registry
@my-org:registry=https://npm.pkg.github.com

; 认证
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}

; 布尔值
save-exact=true
package-lock=false
```

**特殊语法**：
```
${VAR}         # 环境变量
$(command)     # 不支持命令替换
~              # 用户主目录
```

### 配置的性能影响

**缓存配置**：
```bash
# 默认缓存
cache=~/.npm
# 安装时间：60 秒

# 临时缓存（SSD）
cache=/tmp/npm-cache
# 安装时间：45 秒（提升 25%）

# 禁用缓存
cache=false
# 安装时间：90 秒（降低 50%）
```

**并发配置**：
```bash
# 默认
maxsockets=50

# 高并发（网络好）
maxsockets=100
# 下载时间：减少 30%

# 低并发（网络差，避免超时）
maxsockets=10
# 稳定性提升
```

---

## 参考资料

- [npm config 文档](https://docs.npmjs.com/cli/v9/using-npm/config)
- [npmrc 文件格式](https://docs.npmjs.com/cli/v9/configuring-npm/npmrc)
- [npm 环境变量](https://docs.npmjs.com/cli/v9/using-npm/config#environment-variables)
