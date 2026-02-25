# npm 与其他包管理器对比

## 三大包管理器对比

### npm
**优势:**
- Node.js 默认集成
- 生态最成熟
- 文档最完善

**劣势:**
- 安装速度较慢
- 存在幽灵依赖
- 磁盘占用大

### yarn
**优势:**
- 安装速度快
- 离线模式
- workspaces 支持好

**劣势:**
- 额外安装
- yarn 1.x vs 2.x 不兼容
- 社区分裂

### pnpm
**优势:**
- 最快的安装速度
- 最小的磁盘占用
- 严格的依赖隔离

**劣势:**
- 生态兼容性问题
- 学习曲线
- 部分工具不支持

## 性能对比

| 指标 | npm | yarn | pnpm |
|------|-----|------|------|
| **首次安装** | 20s | 15s | 12s |
| **有缓存** | 8s | 5s | 3s |
| **磁盘占用** | 100% | 100% | 30% |
| **node_modules大小** | 500MB | 500MB | 150MB |

## 功能对比

| 功能 | npm | yarn | pnpm |
|------|-----|------|------|
| **workspaces** | ✅ | ✅ | ✅ |
| **离线安装** | ⚠️ | ✅ | ✅ |
| **并行安装** | ✅ | ✅ | ✅ |
| **严格依赖** | ❌ | ❌ | ✅ |
| **PnP模式** | ❌ | ✅ | ❌ |

## 选型建议

### 选择 npm
- 简单项目
- 不追求极致性能
- 需要最好的兼容性

### 选择 yarn
- 需要更好的性能
- 使用 yarn 2+ PnP 模式
- 已有 yarn 项目

### 选择 pnpm
- Monorepo 项目
- 磁盘空间受限
- 需要严格依赖隔离

## 迁移指南

### npm → yarn

```bash
# 安装 yarn
npm install -g yarn

# 生成 yarn.lock
yarn import

# 安装依赖
yarn install
```

### npm → pnpm

```bash
# 安装 pnpm
npm install -g pnpm

# 生成 pnpm-lock.yaml
pnpm import

# 安装依赖
pnpm install
```

### 回退到 npm

```bash
# 删除其他 lock 文件
rm yarn.lock pnpm-lock.yaml

# 重新安装
npm install
```

## 命令对照表

| 操作 | npm | yarn | pnpm |
|------|-----|------|------|
| **安装所有** | `npm install` | `yarn` | `pnpm install` |
| **添加依赖** | `npm install pkg` | `yarn add pkg` | `pnpm add pkg` |
| **移除依赖** | `npm uninstall pkg` | `yarn remove pkg` | `pnpm remove pkg` |
| **更新依赖** | `npm update` | `yarn upgrade` | `pnpm update` |
| **运行脚本** | `npm run script` | `yarn script` | `pnpm script` |
| **全局安装** | `npm install -g` | `yarn global add` | `pnpm add -g` |

## 参考资料

- [yarn 官网](https://yarnpkg.com/)
- [pnpm 官网](https://pnpm.io/)
- [包管理器基准测试](https://github.com/pnpm/benchmarks-of-javascript-package-managers)

---

**上一章：**[团队协作与工程化规范](./content-22.md)  
**下一章：**[npm 常用命令速查](./content-24.md)
