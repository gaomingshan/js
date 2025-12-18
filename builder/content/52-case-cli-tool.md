# 案例 3：CLI 工具打包

## 概述

CLI 工具（脚手架、代码生成器、发布工具、内部运维工具）是 **esbuild** 的典型主场。

原因很现实：

- 运行环境明确：Node
- 交付形态明确：`npx` / 全局安装 / 内部制品
- 产物诉求明确：启动快、发布简单、依赖可控

因此你在真实项目里经常会看到这样的组合：

- **esbuild**：负责把源码打成可发布的 CLI 产物（常见为单文件）
- **tsc（可选）**：负责类型检查（CLI 本身一般不需要发布 `.d.ts`，但工程需要类型正确）
- **lint/test**：作为质量门禁

---

## 一、业务背景与工程约束

一个典型的 CLI 工具往往需要：

1. 支持 `--help`、`--version`、子命令（如 `init/build/release`）
2. 支持模板拷贝/文件生成（涉及文件系统与资源文件）
3. 支持网络请求（可选）
4. 支持跨平台（Windows/macOS/Linux）

常见约束：

- Node 版本范围（例如企业内部统一 Node 18+）
- 是否允许把依赖打进 bundle（有些依赖含原生模块，需要 external）

> **关键点**
>
> CLI 工具的“构建难点”通常不是拆包，而是**发布契约**（bin 入口、shebang、资源文件、依赖 external）。

---

## 二、推荐目录结构（可用于生产）

```text
my-cli/
├── src/
│   ├── cli.ts          # bin 入口
│   └── commands/       # 子命令实现
├── assets/             # 模板/静态资源（可能需要复制到 dist）
├── scripts/
│   └── build.mjs       # esbuild 构建脚本
├── package.json
└── tsconfig.json
```

建议把 `cli.ts` 与业务逻辑分离：

- `cli.ts`：只做参数解析、命令分发
- `commands/*`：纯业务逻辑，方便测试

---

## 三、发布契约：package.json 的关键字段

### 3.1 bin 入口

```json
{
  "name": "my-cli",
  "bin": {
    "mycli": "./dist/cli.cjs"
  },
  "scripts": {
    "build": "node scripts/build.mjs",
    "typecheck": "tsc --noEmit"
  }
}
```

> **关键点**
>
> `bin` 指向的文件应该是“可直接执行”的 Node 脚本（通常需要 shebang），并且尽量把路径固定住（避免发布后结构变化）。

---

## 四、esbuild 构建方案：单文件 + Node 目标

### 4.1 构建脚本（示意，可落地）

```js
// scripts/build.mjs
import esbuild from 'esbuild';

const isProd = process.env.NODE_ENV === 'production';

await esbuild.build({
  entryPoints: ['src/cli.ts'],
  outfile: 'dist/cli.cjs',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: ['node18'],
  sourcemap: true,
  minify: isProd,
  banner: {
    js: '#!/usr/bin/env node\n',
  },
  external: [
    // Node 内置模块不需要打包
    'fs', 'path', 'os', 'url', 'child_process'
  ],
});
```

### 4.2 为什么 CLI 常选 CJS 产物

- Node 生态里大量工具/依赖仍以 CJS 为主
- `bin` 脚本用 CJS 往往兼容成本更低
- 即使你的 package 设为 `"type": "module"`，也可以用 `.cjs` 强制 CJS

> **关键点**
>
> 选 ESM/CJS 的原则不是“越新越好”，而是“你能控制的下游环境是什么”。

---

## 五、真实项目里的两个关键坑

### 5.1 shebang 与跨平台

- 发布到 npm 的 CLI 需要 shebang：`#!/usr/bin/env node`
- 用 esbuild 的 `banner` 注入最稳定

如果你忘了 shebang：

- macOS/Linux 下直接执行可能失败
- 通过 `node dist/cli.cjs` 还能跑，但用户体验差

### 5.2 动态 require / 资源文件

CLI 很常见的写法：

- 读取模板目录（`assets/`）
- 根据参数动态加载某个模块

这些行为可能导致 bundler 难以静态分析。

应对策略：

1. **资源文件不打进 bundle**：构建时把 `assets/` 复制到 `dist/`，运行时用相对路径读取。
2. **对动态加载的依赖 external**：让 Node 在运行时解析。
3. **避免“路径拼接 require”**：尽量改成显式 import/require（利于静态分析）。

---

## 六、构建与发布流程（建议）

1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck`（保证类型正确）
3. `pnpm test`（如果有）
4. `pnpm build`
5. `npm pack` 做一次本地安装验证（或用 `pnpm pack`）

验证点：

- `npx ./path/to/package.tgz mycli --help` 是否可用
- Windows/macOS/Linux 跑一遍核心命令

---

## 七、为什么这个场景不用“应用级工具”

你当然可以用 Vite/webpack 来打 CLI，但通常不划算：

- CLI 没有 dev server / HMR 的需求
- 产物策略相对简单（单文件或少量文件）
- 你更关心“构建快 + 产物稳定 + 发布简单”

因此直接用 esbuild 更贴合职责边界。

---

## 参考资料

- [esbuild](https://esbuild.github.io/)
- [Node.js - package.json bin](https://nodejs.org/api/packages.html#bin)
- [npm - Publishing packages](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages)
