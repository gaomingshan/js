# 案例 1：中后台管理系统

## 概述

中后台（Admin）系统的典型特征是：

- 页面多、表单多、列表多
- 业务迭代频繁（“改完马上要看效果”）
- 运行时性能通常不是极致瓶颈，**开发效率与可维护性**更关键

因此它非常适合用 **Vite（平台层）+ 现代框架（React/Vue）**作为主构建方案：

- 开发期：ESM 按需加载 + HMR，反馈快
- 生产期：Rollup 打包，产物可控（拆包/缓存）

---

## 一、业务背景与工程约束（真实项目常见）

- 需要登录鉴权、权限路由、菜单动态下发
- API 代理、多环境（dev/test/pre/prod）
- UI 框架（Ant Design/Element Plus）体积大
- 需要“稳定的长期缓存策略”，避免每次发布全量刷新
- 需要质量门禁（lint/typecheck/test）与 CI 构建可观测

> **关键点**
>
> 中后台的复杂度更多来自“工程组织与协作”，而不是 bundling 技术本身。

---

## 二、目标与非目标

### 2.1 目标

1. **快速启动与迭代**：冷启动可接受、HMR 稳定。
2. **配置可维护**：环境分层、约定清晰，避免“配置泥球”。
3. **产物可控**：vendor 拆分、hash、publicPath、资源目录结构。
4. **可扩展**：未来接入微前端、模块联邦或多入口不会推倒重来。

### 2.2 非目标

- 不追求极致的“零配置”，但追求“少而清晰的配置”。

---

## 三、推荐工具链（可用于生产）

- **应用构建**：Vite
- **语言/框架**：React + TypeScript（或 Vue3 + TS）
- **代码规范**：ESLint + Prettier
- **类型检查**：`tsc --noEmit`
- **测试**：Vitest / Jest（按团队习惯）
- **部署**：静态资源（Nginx / CDN）

> **关键点**
>
> 让 Vite 负责“平台体验”，让 TypeScript/ESLint/Test 负责“质量门禁”，不要把质量问题寄希望于 bundler。

---

## 四、项目结构（示意，可落地）

```text
src/
├── app/                 # 应用壳（路由、鉴权、布局）
├── pages/               # 页面（路由级代码分割）
├── features/            # 业务域模块（按领域切分）
├── components/          # 通用组件
├── services/            # API 请求、数据访问
├── store/               # 状态管理
├── assets/              # 静态资源
├── styles/              # 全局样式
└── main.tsx

vite.config.ts
.env
.env.development
.env.production
```

> **经验建议**
>
> 中后台更适合按“业务域/功能域”拆分（`features/`），避免按技术分层过度导致跨目录跳转频繁。

---

## 五、关键配置点：把“工程语义”放在正确的位置

### 5.1 环境变量：区分“构建期”与“运行期”

Vite 默认只注入 `VITE_` 前缀变量：

- `.env.development`：本地开发
- `.env.production`：生产构建

> **关键点**
>
> 注入到客户端的变量等同于公开信息，不能放密钥；真正的密钥必须在服务端。

### 5.2 API 代理：让本地开发接近真实环境

```ts
// vite.config.ts（示意）
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### 5.3 依赖预构建治理：解决“巨型依赖导致的冷启动慢”

中后台常见依赖：

- UI 组件库
- 图表库
- 富文本编辑器

冷启动慢时的排查方向：

- `optimizeDeps` 是否命中（首次预构建耗时是否可接受）
- 是否存在“动态 require / 非标准入口”阻碍预构建

你可以选择性把确定的大依赖加入 `optimizeDeps.include`。

### 5.4 产物拆分：让缓存策略稳定

Vite build 基于 Rollup，你可以用 `manualChunks` 让 vendor 更稳定：

```ts
// vite.config.ts（示意）
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        react: ['react', 'react-dom'],
      },
    },
  },
}
```

> **关键点**
>
> 拆包的目的不是“越细越好”，而是“让变化局部化”，提高缓存命中率。

---

## 六、构建与部署流程（CI 视角）

推荐的 CI 顺序（精简）：

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck`（`tsc --noEmit`）
4. `pnpm test`
5. `pnpm build`
6. 上传产物到静态服务器/CDN

> **深入一点**
>
> “构建快”不是 Vite 一个人的功劳：依赖锁定、缓存命中、质量门禁前置，都会显著影响 CI 的稳定性与吞吐。

---

## 七、常见踩坑与规避

1. **publicPath/资源路径配置错误**
   - 现象：线上 chunk 404。
   - 排查：`base`、部署路径、CDN 路径。

2. **路由懒加载切分过碎**
   - 现象：首屏/跳转请求过多。
   - 规避：按路由组/业务域合并切分。

3. **依赖预构建反复失效**
   - 现象：每次启动都很慢。
   - 排查：lockfile 波动、pnpm store、Vite 缓存目录被清理。

---

## 参考资料

- [Vite](https://vite.dev/)
- [Vite - Dep pre-bundling](https://vite.dev/guide/dep-pre-bundling.html)
- [Rollup - Code Splitting](https://rollupjs.org/)
