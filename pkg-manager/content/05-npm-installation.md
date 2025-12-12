# npm 安装与配置

## 概述

npm 随 Node.js 一起安装。掌握 Node.js 版本管理和 npm 配置，是高效使用包管理器的基础。

## 一、Node.js 安装

### 1.1 官方安装包

**下载地址：** https://nodejs.org/

- **LTS 版本**（推荐）：长期支持，稳定
- **Current 版本**：最新特性

```bash
# 验证安装
node -v    # v18.17.0
npm -v     # 9.6.7
```

### 1.2 不同版本的特点

| 版本 | 说明 | npm 版本 | 推荐场景 |
|------|------|----------|----------|
| **Node 16 LTS** | 长期支持 | npm 8.x | 生产环境 |
| **Node 18 LTS** | 当前 LTS | npm 9.x | ⭐ 推荐 |
| **Node 20 LTS** | 最新 LTS | npm 10.x | 新项目 |
| **Node 21+** | 实验版本 | npm 10.x | 尝鲜 |

## 二、Node.js 版本管理工具

### 2.1 nvm（Node Version Manager）⭐ 最流行

**安装（macOS/Linux）：**

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 或使用 wget
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重启终端或执行
source ~/.bashrc
```

**Windows：** 使用 nvm-windows  
https://github.com/coreybutler/nvm-windows

**常用命令：**

```bash
# 列出远程可用版本
nvm ls-remote

# 安装指定版本
nvm install 18.17.0
nvm install 16    # 安装最新的 16.x

# 列出本地已安装版本
nvm ls

# 切换版本
nvm use 18
nvm use 16

# 设置默认版本
nvm alias default 18

# 查看当前版本
nvm current

# 卸载版本
nvm uninstall 16
```

**项目级版本控制：**

```bash
# 创建 .nvmrc 文件
echo "18.17.0" > .nvmrc

# 自动使用项目指定的版本
nvm use
```

### 2.2 n（简洁的版本管理器）

**安装：**

```bash
npm install -g n
```

**使用：**

```bash
# 安装最新 LTS
n lts

# 安装最新版本
n latest

# 安装指定版本
n 18.17.0

# 列出已安装版本并切换
n

# 删除版本
n rm 16.0.0

# 清除所有版本（除当前）
n prune
```

### 2.3 fnm（Rust 编写，速度快）

**安装：**

```bash
# macOS/Linux
curl -fsSL https://fnm.vercel.app/install | bash

# Windows (使用 Scoop)
scoop install fnm
```

**使用：**

```bash
# 安装版本
fnm install 18

# 使用版本
fnm use 18

# 设置默认版本
fnm default 18

# 列出版本
fnm list

# 根据 .node-version 或 .nvmrc 自动切换
fnm use
```

### 2.4 版本管理工具对比

| 工具 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **nvm** | 功能全，生态好 | 速度较慢 | ⭐⭐⭐⭐⭐ |
| **n** | 简单易用 | 需要 Node.js | ⭐⭐⭐⭐ |
| **fnm** | 速度快，跨平台 | 社区较小 | ⭐⭐⭐⭐ |

## 三、npm 配置

### 3.1 配置层级

```
1. 命令行参数       npm install --registry=...
2. 项目 .npmrc      /project/.npmrc
3. 用户 .npmrc      ~/.npmrc
4. 全局 .npmrc      /usr/local/etc/.npmrc
5. 内置默认值
```

### 3.2 常用配置命令

```bash
# 查看所有配置
npm config list
npm config ls -l  # 显示所有（包括默认值）

# 查看单个配置
npm config get registry
npm config get prefix

# 设置配置
npm config set registry https://registry.npmmirror.com
npm config set save-exact true

# 删除配置
npm config delete registry

# 编辑配置文件
npm config edit        # 编辑用户配置
npm config edit -g     # 编辑全局配置
```

### 3.3 重要配置项

**registry（镜像源）：**

```bash
npm config set registry https://registry.npmmirror.com
```

**prefix（全局安装目录）：**

```bash
# 查看
npm config get prefix

# 修改（避免权限问题）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# 添加到 PATH
export PATH=~/.npm-global/bin:$PATH
```

**cache（缓存目录）：**

```bash
npm config set cache ~/.npm-cache
```

**init 默认值：**

```bash
npm config set init-author-name "Your Name"
npm config set init-author-email "your@email.com"
npm config set init-license "MIT"
```

**save 配置：**

```bash
npm config set save true           # 自动保存到 dependencies
npm config set save-exact true     # 保存精确版本
npm config set save-prefix "~"     # 默认使用 ~ 而不是 ^
```

## 四、推荐配置

### 4.1 用户 .npmrc（~/.npmrc）

```ini
# 镜像源
registry=https://registry.npmmirror.com

# 初始化默认值
init-author-name=Your Name
init-author-email=your@email.com
init-license=MIT
init-version=0.1.0

# 自动保存依赖
save=true
save-exact=false
save-prefix=^

# 全局安装目录
prefix=~/.npm-global

# 日志级别
loglevel=warn

# 进度条
progress=true

# 引擎严格检查
engine-strict=false
```

### 4.2 项目 .npmrc

```ini
# 镜像源
registry=https://registry.npmmirror.com

# 私有包
@mycompany:registry=https://npm.mycompany.com

# Node.js 版本要求
engine-strict=true

# 保存精确版本
save-exact=true

# 二进制文件镜像
electron_mirror=https://npmmirror.com/mirrors/electron/
sass_binary_site=https://npmmirror.com/mirrors/node-sass/
```

### 4.3 团队统一配置

**在项目中提交 .npmrc：**

```bash
# 团队成员拉取代码后，配置自动生效
git clone project
cd project
npm install  # 使用项目的 .npmrc 配置
```

## 五、环境变量

### 5.1 npm 相关环境变量

```bash
# npm 配置（优先级最高）
NPM_CONFIG_REGISTRY=https://registry.npmmirror.com npm install

# 代理
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080

# 认证 Token
NPM_TOKEN=your-token-here

# Node 路径
NODE_PATH=/usr/local/lib/node_modules
```

### 5.2 设置环境变量

**Linux/macOS：**

```bash
# 临时设置
export NPM_CONFIG_REGISTRY=https://registry.npmmirror.com

# 永久设置（~/.bashrc 或 ~/.zshrc）
echo 'export NPM_CONFIG_REGISTRY=https://registry.npmmirror.com' >> ~/.bashrc
source ~/.bashrc
```

**Windows：**

```cmd
# 临时设置
set NPM_CONFIG_REGISTRY=https://registry.npmmirror.com

# 永久设置（系统环境变量）
setx NPM_CONFIG_REGISTRY "https://registry.npmmirror.com"
```

## 六、常见问题

### 6.1 权限问题（macOS/Linux）

**问题：** `npm install -g` 需要 sudo

**解决方案：**

```bash
# 修改全局安装目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# 添加到 PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 现在可以无 sudo 安装
npm install -g typescript
```

### 6.2 切换 Node 版本后 npm 丢失

**问题：** 使用 nvm 切换版本后，全局安装的包不见了

**原因：** 每个 Node 版本有独立的全局目录

**解决：**

```bash
# 重新安装全局包
npm install -g typescript eslint prettier

# 或使用 nvm 的包迁移功能
nvm reinstall-packages <old-version>
```

### 6.3 清理与重置

```bash
# 清理 npm 缓存
npm cache clean --force

# 重置配置
npm config delete registry
npm config list  # 验证

# 完全重新安装
rm -rf node_modules package-lock.json
npm install
```

## 参考资料

- [Node.js 官网](https://nodejs.org/)
- [nvm GitHub](https://github.com/nvm-sh/nvm)
- [npm config 文档](https://docs.npmjs.com/cli/v9/commands/npm-config)

---

**导航**  
[上一章：registry与镜像源](./04-registry.md) | [返回目录](../README.md) | [下一章：package.json详解](./06-package-json.md)
