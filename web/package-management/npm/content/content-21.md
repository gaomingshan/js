# npm 常见问题与排查

## 安装问题

### 权限错误

```bash
# 错误
npm ERR! Error: EACCES: permission denied

# 解决
sudo npm install -g package  # Unix/Linux
# 或配置 npm prefix
npm config set prefix ~/.npm-global
```

### 网络超时

```bash
# 增加超时时间
npm config set timeout 60000

# 使用镜像
npm config set registry https://registry.npmmirror.com
```

### 依赖冲突

```bash
# peer 依赖冲突
npm install --legacy-peer-deps

# 或使用 overrides
{
  "overrides": {
    "package": "version"
  }
}
```

## 版本问题

### package-lock 冲突

```bash
# 删除重建
rm -rf node_modules package-lock.json
npm install
```

### 幽灵依赖

```bash
# 检测
npx depcheck

# 解决：显式声明依赖
npm install missing-package
```

### 循环依赖

```bash
# 检测
npm ls package-name

# 重构代码避免循环依赖
```

## 缓存问题

### 缓存损坏

```bash
npm cache verify
npm cache clean --force
```

### 缓存过大

```bash
# 查看大小
du -sh ~/.npm

# 清理
npm cache clean --force
```

## 构建问题

### node-gyp 编译失败

```bash
# 安装编译工具
# Windows: npm install -g windows-build-tools
# macOS: xcode-select --install
# Linux: apt-get install build-essential
```

### postinstall 脚本失败

```bash
# 跳过脚本
npm install --ignore-scripts
```

## 发布问题

### 401 认证失败

```bash
npm logout
npm login
```

### 包名冲突

```bash
# 使用 scoped 包
npm init --scope=@myorg
```

## 排查工具

### npm doctor

```bash
npm doctor
# 检查 npm 环境
```

### 详细日志

```bash
npm install --verbose
npm install --loglevel silly
```

### 清理环境

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 最佳实践

### 1. 定期维护

```bash
npm outdated
npm audit
npm dedupe
```

### 2. 使用 .nvmrc

```bash
echo "18" > .nvmrc
nvm use
```

### 3. 文档化问题

```markdown
# 已知问题

## package-xyz 安装失败
**原因**: 需要 Python 2.7
**解决**: npm install --python=python2.7
```

## 参考资料

- [npm 故障排查](https://docs.npmjs.com/cli/v9/using-npm/troubleshooting)
- [常见错误代码](https://docs.npmjs.com/cli/v9/using-npm/errors)

---

**上一章：**[npm 性能优化实践](./content-20.md)  
**下一章：**[团队协作与工程化规范](./content-22.md)
