# npm link 本地开发

## 概述

`npm link` 用于在本地开发和测试包时，将包链接到项目中，无需反复发布和安装。

## 一、基本用法

### 1.1 链接包到全局

```bash
# 在包目录
cd ~/packages/my-lib
npm link
```

### 1.2 在项目中使用

```bash
# 在项目目录
cd ~/projects/my-app
npm link my-lib
```

### 1.3 取消链接

```bash
# 取消项目链接
npm unlink my-lib

# 取消全局链接
cd ~/packages/my-lib
npm unlink
```

## 二、工作原理

**创建符号链接：**

```
全局: ~/.npm/lib/node_modules/my-lib → ~/packages/my-lib
项目: ~/projects/my-app/node_modules/my-lib → 全局链接
```

## 三、多包联调

```bash
# 链接多个包
cd ~/packages/package-a && npm link
cd ~/packages/package-b && npm link

# 在项目中使用
cd ~/my-app
npm link package-a package-b
```

## 四、常见问题

### 4.1 修改不生效

**解决：使用 watch 模式**

```bash
cd ~/packages/my-lib
npm run build -- --watch
```

### 4.2 TypeScript 类型问题

确保包的 `package.json` 配置正确：

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

## 五、替代方案

### 5.1 file: 协议

```json
{
  "dependencies": {
    "my-lib": "file:../packages/my-lib"
  }
}
```

### 5.2 Workspaces（推荐）

```json
{
  "workspaces": ["packages/*"]
}
```

## 参考资料

- [npm link 文档](https://docs.npmjs.com/cli/v9/commands/npm-link)

---

**导航**  
[上一章：依赖版本管理](./09-version-management.md) | [返回目录](../README.md) | [下一章：发布npm包](./11-publishing.md)
