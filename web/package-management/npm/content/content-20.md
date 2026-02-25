# npm 性能优化实践

## 安装速度优化

### 使用 npm ci

```bash
# CI/CD 环境
npm ci  # 比 npm install 快 2-3 倍
```

### 启用缓存

```bash
npm install --prefer-offline
```

### 使用镜像源

```ini
# .npmrc
registry=https://registry.npmmirror.com
```

### 并行安装

```ini
maxsockets=50  # 默认值，可适当增加
```

## node_modules 体积优化

### 生产依赖分离

```bash
npm install --production
```

### 清理未使用依赖

```bash
npm install -g depcheck
depcheck
```

### 使用 pnpm

```bash
npm install -g pnpm
pnpm install  # 节省 50%+ 磁盘空间
```

## 构建优化

### Tree Shaking

```javascript
// 使用具名导入
import { debounce } from 'lodash-es';  // ✅
import _ from 'lodash';  // ❌
```

### 动态导入

```javascript
// 代码分割
const module = await import('./heavy-module.js');
```

## 监控和分析

### 包体积分析

```bash
npm install -g cost-of-modules
cost-of-modules

# 或
npm install -g webpack-bundle-analyzer
```

### 依赖树分析

```bash
npm ls --depth=0
npm outdated
```

## 最佳实践

### 1. 定期更新依赖

```bash
npm outdated
npm update
```

### 2. 锁定关键依赖版本

```json
{
  "dependencies": {
    "critical-lib": "1.2.3"  // 精确版本
  }
}
```

### 3. 使用 .npmrc 统一配置

```ini
registry=https://registry.npmmirror.com
save-exact=false
engine-strict=true
```

## 参考资料

- [npm 性能优化](https://docs.npmjs.com/cli/v9/using-npm/config#performance)
- [pnpm 官网](https://pnpm.io/)

---

**上一章：**[Monorepo 与 npm workspaces](./content-19.md)  
**下一章：**[npm 常见问题与排查](./content-21.md)
