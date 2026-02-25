# 私有 npm 仓库方案

## 概述

私有 npm 仓库用于管理公司内部包，保护代码安全，加速包安装。常见方案包括 Verdaccio、npm Enterprise、GitHub Packages 等。

## Verdaccio

### 安装和启动

```bash
# 全局安装
npm install -g verdaccio

# 启动服务
verdaccio

# 默认地址：http://localhost:4873
```

### 配置文件

```yaml
# ~/.config/verdaccio/config.yaml
storage: ./storage
auth:
  htpasswd:
    file: ./htpasswd

uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  '@company/*':
    access: $authenticated
    publish: $authenticated
    
  '**':
    access: $all
    publish: $authenticated
    proxy: npmjs
```

### 使用

```bash
# 设置 registry
npm config set registry http://localhost:4873

# 添加用户
npm adduser --registry http://localhost:4873

# 发布包
npm publish
```

## GitHub Packages

### 配置

```ini
# .npmrc
@myorg:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### 发布

```json
{
  "name": "@myorg/package",
  "repository": {
    "type": "git",
    "url": "https://github.com/myorg/repo.git"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

```bash
npm publish
```

## npm 私有仓库

### npm Enterprise

- 企业级解决方案
- 完整的权限管理
- 支持镜像和私有包

### 配置使用

```ini
# .npmrc
registry=https://npm.company.com
//npm.company.com/:_authToken=${NPM_TOKEN}
```

## 混合使用

### 配置不同 scope

```ini
# .npmrc
registry=https://registry.npmjs.org
@company:registry=https://npm.company.com
@myorg:registry=https://npm.pkg.github.com
```

## 最佳实践

### 1. 访问控制

```yaml
# Verdaccio
packages:
  '@company/*':
    access: $authenticated
    publish: $authenticated
```

### 2. 缓存公共包

```yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    cache: true
```

### 3. 备份策略

```bash
# 定期备份 storage 目录
tar -czf verdaccio-backup.tar.gz ~/.local/share/verdaccio/storage
```

## 参考资料

- [Verdaccio 文档](https://verdaccio.org/docs/what-is-verdaccio)
- [GitHub Packages](https://docs.github.com/en/packages)

---

**上一章：**[npm 包发布最佳实践](./content-17.md)  
**下一章：**[Monorepo 与 npm workspaces](./content-19.md)
