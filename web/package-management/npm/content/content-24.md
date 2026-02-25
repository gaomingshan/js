# npm 常用命令速查

## 安装命令

```bash
# 安装所有依赖
npm install
npm i

# 安装特定包
npm install <package>
npm install <package>@<version>
npm install <package>@latest

# 安装到不同依赖类型
npm install <package> --save-dev (-D)
npm install <package> --save-optional (-O)
npm install <package> --global (-g)

# 特殊安装
npm install --production          # 仅生产依赖
npm ci                            # CI环境（快速、严格）
npm install --legacy-peer-deps   # 忽略peer依赖冲突
```

## 卸载命令

```bash
npm uninstall <package>
npm uninstall <package> -D        # 从devDependencies移除
npm uninstall <package> -g        # 卸载全局包
```

## 更新命令

```bash
npm update                        # 更新所有包
npm update <package>              # 更新特定包
npm outdated                      # 查看过时的包
```

## 查看命令

```bash
npm list                          # 查看依赖树
npm list --depth=0                # 仅直接依赖
npm list <package>                # 查看特定包
npm view <package>                # 查看包信息
npm view <package> versions       # 查看所有版本
```

## 脚本命令

```bash
npm run <script>                  # 运行脚本
npm run                           # 列出所有脚本
npm test                          # 运行测试
npm start                         # 启动应用
```

## 发布命令

```bash
npm login                         # 登录
npm whoami                        # 查看当前用户
npm publish                       # 发布包
npm publish --access public       # 发布公开scoped包
npm version patch|minor|major     # 更新版本
npm deprecate <pkg> <message>     # 废弃包
```

## 配置命令

```bash
npm config list                   # 查看配置
npm config get <key>              # 获取配置项
npm config set <key> <value>      # 设置配置项
npm config delete <key>           # 删除配置项
```

## 缓存命令

```bash
npm cache verify                  # 验证缓存
npm cache clean --force           # 清理缓存
```

## 审计命令

```bash
npm audit                         # 安全审计
npm audit fix                     # 自动修复
npm audit fix --force             # 强制修复
```

## link命令

```bash
npm link                          # 创建全局链接
npm link <package>                # 链接包到项目
npm unlink <package>              # 取消链接
```

## 其他命令

```bash
npm init                          # 初始化项目
npm init -y                       # 快速初始化
npm doctor                        # 检查环境
npm help <command>                # 查看帮助
npm repo <package>                # 打开仓库
npm bugs <package>                # 打开issue页面
npm docs <package>                # 打开文档
```

## 快捷键

```bash
npm i     = npm install
npm un    = npm uninstall
npm up    = npm update
npm t     = npm test
npm r     = npm run
npm ls    = npm list
```

## 常用选项

```bash
-D, --save-dev                    # 保存到devDependencies
-O, --save-optional               # 保存到optionalDependencies
-g, --global                      # 全局操作
--production                      # 仅生产依赖
--dry-run                         # 模拟执行
--verbose                         # 详细输出
--force                           # 强制执行
--legacy-peer-deps                # 忽略peer冲突
--ignore-scripts                  # 跳过脚本
```

## 环境变量

```bash
NPM_TOKEN                         # npm认证token
NODE_ENV                          # 环境标识
npm_package_name                  # 包名
npm_package_version               # 版本号
npm_config_registry               # registry地址
```

## 常用组合

```bash
# 清理重装
rm -rf node_modules package-lock.json && npm install

# 更新并测试
npm update && npm test

# 构建并发布
npm run build && npm version patch && npm publish

# 检查并修复安全问题
npm audit && npm audit fix

# 离线安装
npm ci --prefer-offline
```

## 参考资料

- [npm CLI 文档](https://docs.npmjs.com/cli/v9/commands)
- [npm 配置选项](https://docs.npmjs.com/cli/v9/using-npm/config)

---

**上一章：**[npm 与其他包管理器对比](./content-23.md)  
**返回目录：**[回到大纲](../content-outline.md)
