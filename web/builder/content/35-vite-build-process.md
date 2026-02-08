# Vite 生产构建流程

## 概述

Vite 的开发体验建立在“ESM Dev + 按需 transform”之上；但到了生产环境，目标变成了：**输出可部署、可缓存、可按需加载的资源集合**。

因此 `vite build` 并不是“把 dev 的结果压缩一下”，而是一次完整的生产构建流程（通常由 Rollup 承担 bundling 的核心工作）。

理解生产构建建议抓住 4 个关键词：

- **入口**：`index.html` 是一等公民
- **依赖图**：从入口解析出完整模块图
- **chunk/asset**：把模块图组织成可加载的产物
- **缓存策略**：hash、拆包、manifest

---

## 一、从 `vite build` 到 `dist/`：宏观流程

一个简化的流程可以理解为：

```text
1) 读取配置与插件（根据 mode）
2) 处理 index.html（注入/转换/收集入口）
3) 交给 Rollup 构建：
   - resolve → transform → treeshake → chunk
4) 输出产物到 dist/（hash、css、assets）
5) 可选：生成 manifest、sourcemap
```

> **关键点**
>
> 开发阶段“浏览器决定加载什么模块”；生产阶段“构建工具决定输出哪些 chunk”。

---

## 二、Rollup 在 Vite build 里的角色

Vite build 很多能力来自 Rollup：

- 解析模块图（依赖分析）
- Tree Shaking（基于 ESM 静态结构）
- 代码分割（`import()` → chunk）
- 产物输出（多 chunk、多 asset）

你会在配置里看到：

```ts
export default {
  build: {
    rollupOptions: {
      // 这里就是 Rollup 的配置入口
    }
  }
}
```

> **深入一点**
>
> Vite 插件在 build 阶段的语义会尽量贴近 Rollup 插件（resolve/transform 等），这是 Vite 统一 dev/build 行为的重要设计点。

---

## 三、产物结构：你会在 `dist/` 看到什么

典型输出结构（示意）：

```text
dist/
├── index.html
└── assets/
    ├── index.[hash].js
    ├── vendor.[hash].js
    ├── index.[hash].css
    └── logo.[hash].svg
```

关键点：

- `assets/` 下文件名带内容 hash：利于 CDN 强缓存
- JS/CSS/静态资源都可能被重新命名（fingerprint）
- `index.html` 会被重写，注入最终的资源引用

---

## 四、代码分割与 chunk 策略

### 4.1 动态导入是拆包入口

```ts
const Editor = await import('./features/editor');
```

这会在构建期生成独立 chunk，实现按需加载。

### 4.2 手动拆包（常见于 vendor 拆分）

在大型应用里，你可能希望把某些依赖拆到固定 chunk（提升长期缓存命中率）：

```ts
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom']
        }
      }
    }
  }
};
```

> **关键点**
>
> 拆包的目标不是“chunk 越多越好”，而是让“稳定的大依赖”和“频繁变化的业务代码”分离。

---

## 五、常用构建选项（只讲关键）

```ts
export default {
  base: '/app/',
  build: {
    target: 'es2018',
    sourcemap: true,
    minify: 'esbuild',
    cssCodeSplit: true,
    manifest: true
  }
};
```

- **`base`**：部署在子路径时必须正确设置，否则 chunk 可能 404
- **`target`**：决定语法输出目标（影响体积与兼容）
- **`sourcemap`**：线上排障需要，但注意泄露风险与上传策略
- **`minify`**：默认 esbuild 足够快；极端需求再评估 terser
- **`manifest`**：当你需要服务端注入资源、或做更复杂的部署映射时很有用

---

## 六、生产构建常见问题（排障方向）

### 6.1 chunk 404 / 资源路径错

优先检查：

- `base` 是否与部署路径一致
- CDN/publicPath 是否正确
- 是否有反向代理重写导致路径变化

### 6.2 产物变大

优先检查：

- 是否引入了大依赖（富文本/图表）但未做按需加载
- 是否 tree shaking 失效（CJS 依赖、副作用标注错误）
- 是否拆包策略导致 vendor 反复失效

### 6.3 sourcemap 的安全

- sourcemap 对调试很有价值
- 但也可能暴露源码与路径信息

常见策略：

- 构建生成 sourcemap
- 上传到错误追踪系统
- 线上静态资源不公开 sourcemap（或做权限控制）

---

## 参考资料

- [Vite - Build](https://vite.dev/guide/build.html)
- [Vite - Static Asset Handling](https://vite.dev/guide/assets.html)
- [Rollup - Code Splitting](https://rollupjs.org/tutorial/#code-splitting)
