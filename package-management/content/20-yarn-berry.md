# Yarn Berry 高级特性

## 概述

Yarn Berry（v2+）不仅带来了 PnP，还引入了 Constraints、Protocols、Plugins 等现代化特性。

## 一、Constraints（约束）

### 1.1 什么是 Constraints

使用 Prolog 语法定义项目规则：

```prolog
% .yarn/constraints.pro

% 所有 workspace 必须使用 MIT 许可证
gen_enforced_field(WorkspaceCwd, 'license', 'MIT').

% 所有 workspace 必须有 repository 字段
gen_enforced_field(WorkspaceCwd, 'repository.type', 'git').

% React 版本必须一致
gen_enforced_dependency(WorkspaceCwd, DependencyIdent, 'workspace:^', DependencyType) :-
  workspace_has_dependency(WorkspaceCwd, DependencyIdent, _, DependencyType),
  DependencyIdent = 'react'.
```

### 1.2 检查约束

```bash
# 检查违规
yarn constraints

# 自动修复
yarn constraints --fix
```

### 1.3 常用约束示例

**统一版本：**
```prolog
% 确保所有 workspace 使用相同的 TypeScript 版本
gen_enforced_dependency(WorkspaceCwd, 'typescript', '5.0.0', DependencyType) :-
  workspace_has_dependency(WorkspaceCwd, 'typescript', _, DependencyType).
```

**禁止特定依赖：**
```prolog
% 禁止使用 moment.js（推荐使用 day.js）
gen_enforced_dependency(WorkspaceCwd, 'moment', null, _) :-
  \+ workspace_ident(WorkspaceCwd, 'my-legacy-package').
```

## 二、Protocols（协议）

### 2.1 patch: 协议

**打补丁：**

```bash
# 生成补丁文件
yarn patch lodash

# 编辑文件
# .../lodash/index.js

# 提交补丁
yarn patch-commit -s /tmp/.yarn/patches/lodash-...
```

**使用补丁：**
```json
{
  "dependencies": {
    "lodash": "patch:lodash@npm:4.17.21#./patches/lodash.patch"
  }
}
```

### 2.2 portal: 协议

**本地开发：**
```json
{
  "dependencies": {
    "my-lib": "portal:../my-lib"
  }
}
```

**特点：**
- 实时同步（不需要重新安装）
- 适合本地联调

### 2.3 workspace: 协议

```json
{
  "dependencies": {
    "package-a": "workspace:^",
    "package-b": "workspace:*"
  }
}
```

### 2.4 自定义协议

```javascript
// .yarn/plugins/plugin-custom.cjs
module.exports = {
  name: 'custom-protocol',
  factory: require => ({
    protocols: [{
      protocol: 'custom:',
      resolver: {
        async getCandidates(descriptor) {
          // 解析逻辑
        }
      }
    }]
  })
};
```

## 三、Plugins（插件）

### 3.1 内置插件

```bash
# TypeScript 支持
yarn plugin import typescript

# Workspace Tools
yarn plugin import workspace-tools

# Interactive Tools
yarn plugin import interactive-tools

# 列出插件
yarn plugin list
```

### 3.2 开发插件

```javascript
// my-plugin.js
module.exports = {
  name: 'my-plugin',
  factory: require => ({
    hooks: {
      afterAllInstalled() {
        console.log('安装完成！');
      }
    }
  })
};
```

**使用：**
```yaml
# .yarnrc.yml
plugins:
  - path: .yarn/plugins/my-plugin.js
```

## 四、高级配置

### 4.1 .yarnrc.yml 完整配置

```yaml
# Node 链接器
nodeLinker: pnp  # pnp | pnpm | node-modules

# PnP 模式
pnpMode: strict  # strict | loose

# 镜像源
npmRegistryServer: "https://registry.npmmirror.com"

# 缓存
enableGlobalCache: false
compressionLevel: mixed

# 插件
plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-typescript.cjs
    spec: "@yarnpkg/plugin-typescript"

# Constraints
enableConstraintsChecks: true

# Telemetry
enableTelemetry: false
```

### 4.2 依赖元数据

```json
{
  "dependenciesMeta": {
    "problematic-package": {
      "built": false,          # 跳过构建
      "unplugged": true,       # 解压到 .yarn/unplugged
      "optional": true         # 可选依赖
    }
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  }
}
```

## 五、性能优化

### 5.1 缓存策略

```yaml
# .yarnrc.yml
# 启用全局缓存
enableGlobalCache: true

# 缓存压缩
compressionLevel: mixed  # mixed | 0-9
```

### 5.2 并行安装

```yaml
# 网络并发
httpsCaFilePath: null
httpProxy: null
httpsProxy: null
networkConcurrency: 50
```

### 5.3 离线镜像

```yaml
# 使用离线镜像
enableMirror: true
```

## 六、版本管理

### 6.1 使用 Version Plugin

```bash
yarn plugin import version

# 交互式更新版本
yarn version check --interactive

# 应用版本变更
yarn version apply --all
```

### 6.2 版本策略

```yaml
# .yarn/versions/<hash>.yml
releases:
  package-a: minor
  package-b: patch
```

## 七、实战技巧

### 7.1 迁移到 Berry

```bash
# 1. 升级
yarn set version stable

# 2. 安装依赖
yarn install

# 3. 检查兼容性
yarn dlx @yarnpkg/doctor

# 4. 配置 IDE
yarn dlx @yarnpkg/sdks vscode

# 5. 启用 Zero-Install（可选）
git add .yarn/cache .pnp.cjs
```

### 7.2 CI/CD 配置

```yaml
# .github/workflows/ci.yml
- name: Enable Corepack
  run: corepack enable

- name: Get Yarn cache
  id: yarn-cache
  run: echo "::set-output name=dir::$(yarn config get cacheFolder)"

- uses: actions/cache@v3
  with:
    path: ${{ steps.yarn-cache.outputs.dir }}
    key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}

- run: yarn install --immutable
```

## 八、对比 Yarn Classic

| 特性 | Yarn Classic | Yarn Berry |
|------|-------------|------------|
| **node_modules** | ✅ | 🚫（可选） |
| **PnP** | ❌ | ✅ |
| **零安装** | ❌ | ✅ |
| **Constraints** | ❌ | ✅ |
| **Protocols** | ❌ | ✅ |
| **Plugins** | 有限 | 强大 |
| **兼容性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## 参考资料

- [Yarn Berry 文档](https://yarnpkg.com/)
- [Constraints 指南](https://yarnpkg.com/features/constraints)
- [Protocols 文档](https://yarnpkg.com/features/protocols)

---

**导航**  
[上一章：Yarn Plug'n'Play](./19-yarn-pnp.md) | [返回目录](../README.md) | [下一章：pnpm原理与优势](./21-pnpm-principle.md)
