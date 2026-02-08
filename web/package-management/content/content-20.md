# Yarn 插件系统

## 插件架构设计

### Yarn Berry 的模块化设计

**核心理念**：将功能拆分为可选插件

**默认核心**：
```
@yarnpkg/cli            (命令行核心)
@yarnpkg/core           (依赖解析核心)
@yarnpkg/fslib          (文件系统抽象)
@yarnpkg/libzip         (ZIP 处理)
@yarnpkg/pnp            (PnP 解析器)
```

**可选插件**：
```
@yarnpkg/plugin-typescript      (TypeScript 支持)
@yarnpkg/plugin-workspace-tools (Workspace 工具)
@yarnpkg/plugin-interactive-tools (交互式命令)
@yarnpkg/plugin-version         (版本管理)
@yarnpkg/plugin-stage           (Git 暂存)
```

### 插件加载机制

**配置文件**（.yarnrc.yml）：
```yaml
plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-typescript.cjs
    spec: "@yarnpkg/plugin-typescript"
  - path: .yarn/plugins/@yarnpkg/plugin-workspace-tools.cjs
    spec: "@yarnpkg/plugin-workspace-tools"
```

**加载流程**：
```javascript
// 简化实现
async function loadPlugins(config) {
  const plugins = [];
  
  for (const pluginConfig of config.plugins) {
    const pluginModule = require(pluginConfig.path);
    
    // 验证插件接口
    if (!pluginModule.name || !pluginModule.factory) {
      throw new Error(`Invalid plugin: ${pluginConfig.path}`);
    }
    
    // 初始化插件
    const plugin = await pluginModule.factory({
      configuration: config,
      // ...其他上下文
    });
    
    plugins.push(plugin);
  }
  
  return plugins;
}
```

### 插件 API

**插件结构**：
```javascript
// my-plugin.js
module.exports = {
  name: '@my-org/plugin-custom',
  factory: (require) => {
    const { BaseCommand } = require('@yarnpkg/cli');
    
    class CustomCommand extends BaseCommand {
      static paths = [['custom']];
      
      async execute() {
        this.context.stdout.write('Custom command executed!\n');
      }
    }
    
    return {
      commands: [CustomCommand],
      hooks: {
        afterAllInstalled: async (project) => {
          // 安装后钩子
          console.log('All packages installed!');
        }
      }
    };
  }
};
```

---

## 常用官方插件

### @yarnpkg/plugin-typescript

**功能**：TypeScript 项目支持

**安装**：
```bash
yarn plugin import typescript
```

**提供的命令**：
```bash
# 生成 TypeScript SDK
yarn dlx @yarnpkg/sdks vscode
```

**生成文件**：
```
.vscode/
├── extensions.json
├── settings.json
└── ...

.yarn/sdks/
├── typescript/
│   ├── lib/
│   └── package.json
├── eslint/
└── prettier/
```

**效果**：
- VSCode 识别 PnP 解析
- TypeScript 类型推断正常工作
- ESLint/Prettier 集成

### @yarnpkg/plugin-workspace-tools

**功能**：Workspace 管理工具

**安装**：
```bash
yarn plugin import workspace-tools
```

**提供的命令**：
```bash
# 在所有 workspace 运行命令
yarn workspaces foreach run build

# 查看 workspace 拓扑
yarn workspaces list --verbose

# 查看 workspace 依赖关系
yarn workspaces list --json | jq
```

**高级用法**：
```bash
# 只在受影响的包运行
yarn workspaces foreach --since origin/main run test

# 按拓扑排序执行
yarn workspaces foreach -pt run build

# 并行执行
yarn workspaces foreach -p run test
```

### @yarnpkg/plugin-interactive-tools

**功能**：交互式命令增强

**安装**：
```bash
yarn plugin import interactive-tools
```

**提供的命令**：
```bash
# 交互式升级依赖
yarn upgrade-interactive

# 界面示例：
# ? Pick the packages you want to upgrade.
#   ❯◯ lodash        4.17.20  →  4.17.21
#    ◯ react         18.0.0   →  18.2.0
#    ◯ typescript    4.9.0    →  5.0.0
```

**特性**：
- 可视化选择
- 版本对比
- 批量操作

### @yarnpkg/plugin-version

**功能**：版本管理和发布

**安装**：
```bash
yarn plugin import version
```

**提供的命令**：
```bash
# 创建版本
yarn version patch   # 1.0.0 → 1.0.1
yarn version minor   # 1.0.1 → 1.1.0
yarn version major   # 1.1.0 → 2.0.0

# 应用延迟版本
yarn version apply --all
```

**与 changesets 集成**：
```bash
# .yarnrc.yml
plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-version.cjs
  - path: .yarn/plugins/@yarnpkg/plugin-changesets.cjs
```

### @yarnpkg/plugin-stage

**功能**：Git 集成

**安装**：
```bash
yarn plugin import stage
```

**提供的命令**：
```bash
# 自动暂存修改的文件
yarn stage

# 等价于
git add yarn.lock .yarnrc.yml package.json
```

**Git 钩子集成**：
```yaml
# .yarnrc.yml
plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-stage.cjs

enableScripts: true
```

---

## 自定义插件开发

### 插件开发流程

**1. 创建插件文件**：
```javascript
// .yarn/plugins/my-custom-plugin.js
module.exports = {
  name: '@my-org/plugin-custom',
  factory: (require) => {
    const { BaseCommand } = require('@yarnpkg/cli');
    const { Configuration, Project } = require('@yarnpkg/core');
    
    class CustomCommand extends BaseCommand {
      static paths = [['custom', 'hello']];
      static usage = Command.Usage({
        description: 'A custom command',
        examples: [
          ['Say hello', 'yarn custom hello']
        ]
      });
      
      async execute() {
        const configuration = await Configuration.find(
          this.context.cwd,
          this.context.plugins
        );
        
        const { project } = await Project.find(
          configuration,
          this.context.cwd
        );
        
        this.context.stdout.write(
          `Hello from ${project.topLevelWorkspace.manifest.name}!\n`
        );
      }
    }
    
    return {
      commands: [CustomCommand]
    };
  }
};
```

**2. 注册插件**：
```yaml
# .yarnrc.yml
plugins:
  - path: .yarn/plugins/my-custom-plugin.js
```

**3. 使用插件**：
```bash
yarn custom hello
# 输出：Hello from my-monorepo!
```

### 钩子系统

**可用钩子**：
```javascript
{
  hooks: {
    // 安装前
    beforeAllInstalled: async (project) => {
      console.log('About to install...');
    },
    
    // 安装后
    afterAllInstalled: async (project) => {
      console.log('Installation complete!');
    },
    
    // 解析包前
    beforeWorkspacePacking: async (workspace, rawManifest) => {
      // 修改 package.json
      rawManifest.scripts = rawManifest.scripts || {};
      rawManifest.scripts.prepack = 'yarn build';
    },
    
    // 依赖解析
    reduceDependency: async (dependency, project, locator, initialDependency, extra) => {
      // 修改依赖解析逻辑
      return dependency;
    },
    
    // 缓存验证
    validateProject: async (project, report) => {
      // 自定义验证逻辑
      for (const workspace of project.workspaces) {
        if (!workspace.manifest.license) {
          report.reportError(MessageName.UNNAMED, 
            `${workspace.relativeCwd}: Missing license field`
          );
        }
      }
    }
  }
}
```

### 插件工具函数

**访问配置**：
```javascript
const configuration = await Configuration.find(cwd, plugins);
const registryUrl = configuration.get('npmRegistryServer');
```

**访问项目**：
```javascript
const { project } = await Project.find(configuration, cwd);

// 遍历 workspace
for (const workspace of project.workspaces) {
  console.log(workspace.manifest.name);
}
```

**报告进度**：
```javascript
const report = await StreamReport.start({
  configuration,
  stdout: this.context.stdout
}, async (report) => {
  report.reportInfo(MessageName.UNNAMED, 'Processing...');
  report.reportProgress('Downloading packages');
  report.reportError(MessageName.UNNAMED, 'An error occurred');
});
```

---

## 企业级扩展实践

### 场景 1：自定义 lint 命令

**需求**：统一检查所有 workspace 的 package.json

**实现**：
```javascript
// .yarn/plugins/plugin-lint.js
module.exports = {
  name: '@my-org/plugin-lint',
  factory: (require) => {
    const { BaseCommand } = require('@yarnpkg/cli');
    const { Configuration, Project } = require('@yarnpkg/core');
    
    class LintCommand extends BaseCommand {
      static paths = [['lint', 'manifests']];
      
      async execute() {
        const configuration = await Configuration.find(
          this.context.cwd,
          this.context.plugins
        );
        
        const { project } = await Project.find(
          configuration,
          this.context.cwd
        );
        
        let hasErrors = false;
        
        for (const workspace of project.workspaces) {
          const manifest = workspace.manifest;
          
          // 检查必需字段
          const requiredFields = ['license', 'repository', 'author'];
          for (const field of requiredFields) {
            if (!manifest[field]) {
              this.context.stderr.write(
                `${workspace.relativeCwd}: Missing ${field}\n`
              );
              hasErrors = true;
            }
          }
          
          // 检查版本格式
          if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
            this.context.stderr.write(
              `${workspace.relativeCwd}: Invalid version format\n`
            );
            hasErrors = true;
          }
        }
        
        return hasErrors ? 1 : 0;
      }
    }
    
    return {
      commands: [LintCommand]
    };
  }
};
```

**使用**：
```bash
yarn lint manifests
```

### 场景 2：依赖版本统一检查

**需求**：确保所有 workspace 使用相同版本的 React

**实现**：
```javascript
module.exports = {
  name: '@my-org/plugin-version-check',
  factory: (require) => {
    const { Configuration, Project } = require('@yarnpkg/core');
    
    return {
      hooks: {
        afterAllInstalled: async (project) => {
          const reactVersions = new Map();
          
          for (const workspace of project.workspaces) {
            const reactDep = workspace.manifest.dependencies.get('react');
            if (reactDep) {
              const version = reactDep.range;
              if (!reactVersions.has(version)) {
                reactVersions.set(version, []);
              }
              reactVersions.get(version).push(workspace.relativeCwd);
            }
          }
          
          if (reactVersions.size > 1) {
            console.warn('Warning: Multiple React versions detected:');
            for (const [version, workspaces] of reactVersions) {
              console.warn(`  ${version}: ${workspaces.join(', ')}`);
            }
          }
        }
      }
    };
  }
};
```

### 场景 3：自动化发布前检查

**需求**：发布前自动运行测试和构建

**实现**：
```javascript
module.exports = {
  name: '@my-org/plugin-publish-guard',
  factory: (require) => {
    const { execute } = require('@yarnpkg/shell');
    
    return {
      hooks: {
        beforeWorkspacePacking: async (workspace, rawManifest) => {
          // 运行测试
          await execute('yarn test', [], {
            cwd: workspace.cwd,
            stdin: process.stdin,
            stdout: process.stdout,
            stderr: process.stderr
          });
          
          // 运行构建
          await execute('yarn build', [], {
            cwd: workspace.cwd,
            stdin: process.stdin,
            stdout: process.stdout,
            stderr: process.stderr
          });
          
          console.log(`✓ ${workspace.manifest.name} ready to publish`);
        }
      }
    };
  }
};
```

---

## 常见误区

### 误区 1：插件可以在运行时安装

**错误操作**：
```bash
yarn add -D @yarnpkg/plugin-typescript
# ❌ 插件不是 npm 包
```

**正确方式**：
```bash
yarn plugin import typescript
# ✅ 下载到 .yarn/plugins/
```

### 误区 2：所有功能都需要插件

**真相**：核心功能无需插件

**需要插件**：
- TypeScript SDK 生成
- 交互式命令
- 高级 workspace 工具

**无需插件**：
- 基本安装
- PnP
- Workspaces 基础功能

### 误区 3：插件可以修改已安装的依赖

**限制**：插件在依赖解析阶段生效，不能修改 node_modules

**可以做**：
- 修改依赖解析逻辑
- 添加钩子
- 提供新命令

**不能做**：
- 修改已安装的包内容
- 动态替换模块

---

## 深入一点

### 插件加载顺序

**优先级**：
```
1. 内置插件（@yarnpkg/core）
2. 配置文件插件（.yarnrc.yml）
3. 动态导入插件
```

**冲突解决**：
```javascript
// 后加载的插件覆盖先加载的
plugins.forEach(plugin => {
  if (plugin.commands) {
    commands = [...commands, ...plugin.commands];
  }
  
  if (plugin.hooks) {
    hooks = mergeHooks(hooks, plugin.hooks);
  }
});
```

### 插件的性能影响

**基准测试**：
```
无插件：     yarn install → 10 秒
+3 个插件：  yarn install → 10.5 秒（+5%）
+10 个插件： yarn install → 12 秒（+20%）
```

**优化建议**：
- 只启用必需插件
- 避免在钩子中执行耗时操作
- 使用缓存

### Yarn 插件 vs npm scripts

**插件优势**：
- 访问内部 API
- 钩子系统
- 类型安全（TypeScript）
- 可复用

**npm scripts 优势**：
- 简单直接
- 跨包管理器
- 无需学习成本

**选择建议**：
- 简单任务 → npm scripts
- 复杂逻辑 → Yarn 插件

---

## 参考资料

- [Yarn 插件 API](https://yarnpkg.com/api/)
- [官方插件列表](https://yarnpkg.com/api/modules/plugin_essentials)
- [插件开发指南](https://yarnpkg.com/advanced/plugin-tutorial)
- [插件示例仓库](https://github.com/yarnpkg/berry/tree/master/packages)
