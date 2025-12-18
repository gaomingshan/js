# Vite 项目结构设计

## 概述

一个“可用于真实项目”的 Vite 工程，核心不是 `vite.config.ts` 写得多复杂，而是：

- 目录结构能否支撑长期迭代（规模增长、多人协作）
- 配置是否能分层（默认值、环境差异、业务差异）
- 工程约束是否清晰（路由边界、模块边界、依赖边界）

这篇给出一个偏通用的 **现代 Web 应用（React/Vue 都适用）** 结构范式：

- 既能快速启动
- 又能在规模变大后不失控

---

## 一、目录设计的三条原则

### 1.1 先按“变化频率”分层

- **业务代码**：变化频繁（`src/features/*`）
- **通用基础设施**：变化较慢（`src/shared/*`、`src/app/*`）
- **构建与脚本**：极慢变化（`scripts/*`、`config/*`）

> **关键点**
>
> 变化频率不同的东西放在一起，项目很快会变成“到处都能改，没人敢改”。

### 1.2 模块边界要“可执行”

- `shared` 只能被业务层依赖（不反向依赖）
- `features` 之间尽量通过 `shared` 或接口协作
- `app` 负责组装（路由、全局 Provider、全局样式）

### 1.3 为“构建/部署”留清晰入口

- 环境变量集中管理
- API 地址/静态资源 base 可追踪
- 产物目录结构稳定（便于 CDN 缓存与回滚）

---

## 二、推荐项目结构（可落地）

```text
project/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env
├── .env.development
├── .env.production
├── public/
│   └── favicon.svg
├── scripts/
│   ├── check-types.ts
│   └── release.mjs
├── src/
│   ├── main.tsx              # 入口：挂载应用
│   ├── app/                  # 应用组装层（路由/全局 Provider/全局样式）
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── app.css
│   ├── shared/               # 可复用基础设施（与业务无关）
│   │   ├── api/              # http client、拦截器、类型
│   │   ├── config/           # 运行时配置读取（env、feature flags）
│   │   ├── lib/              # 工具函数（严格控制依赖）
│   │   ├── ui/               # 通用 UI 组件（按钮/弹窗/表格等）
│   │   └── types/            # 通用类型
│   ├── features/             # 按业务域拆分（推荐）
│   │   ├── auth/
│   │   ├── user/
│   │   └── dashboard/
│   └── pages/                # 路由页面（薄层：组装 features）
│       ├── LoginPage.tsx
│       └── DashboardPage.tsx
└── tests/
    └── ...
```

> **直觉理解**
>
> `pages` 尽量“薄”，把复杂逻辑沉到 `features`；`shared` 只放跨业务复用的能力。

---

## 三、Vite 配置分层：从“能跑”到“可维护”

### 3.1 推荐把配置分成三类

- **不随环境变化的基础配置**：alias、插件、资源规则
- **随环境变化的配置**：base、sourcemap、proxy、define
- **随项目变化的配置**：构建产物策略（chunk、external、legacy）

Vite 支持用函数形式按 mode 返回配置：

```ts
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    base: env.VITE_BASE || '/',
  };
});
```

> **关键点**
>
> 配置分层的本质是：把“工程规则”与“部署差异”拆开，避免以后每改一个环境就改坏整个构建。

---

## 四、环境变量：不要把 `.env` 当成随手塞字符串的地方

### 4.1 Vite 的约定

- 只有以 `VITE_` 开头的变量会暴露给客户端
- 通过 `import.meta.env` 读取

```ts
const apiBase = import.meta.env.VITE_API_BASE;
```

### 4.2 推荐实践

- `.env`：所有环境共享默认值
- `.env.development`：本地开发覆盖
- `.env.production`：生产覆盖

并把“运行时配置读取”集中到 `src/shared/config/*`，避免在业务里到处散落 `import.meta.env`。

---

## 五、真实项目需要的几个“工程入口”

### 5.1 类型检查与质量门禁

Vite 的转译不会替你做完整类型检查（尤其当你追求速度时）。建议把类型检查变成单独脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

### 5.2 API 代理（开发期）

- 代理配置属于“开发环境差异”，不要混在业务逻辑里
- 把后端地址抽象成 `VITE_API_BASE`，线上走真实域名

---

## 六、实践清单（精简版）

1. **目录按业务域拆分**：`features/*`。
2. **环境变量集中读取**：不要散落在页面里。
3. **类型检查独立执行**：`tsc --noEmit`。
4. **构建策略可追踪**：base/publicPath、chunk 拆分要有文档。

---

## 参考资料

- [Vite - Env Variables and Modes](https://vite.dev/guide/env-and-mode)
- [Vite - Features](https://vite.dev/guide/features)
- [TypeScript - `tsc --noEmit`](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
