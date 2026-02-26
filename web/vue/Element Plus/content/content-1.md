# Element Plus 简介与安装配置

## 概述

Element Plus 是饿了么团队开源的基于 Vue 3 的桌面端组件库，是 Element UI 的 Vue 3 升级版本。它提供了一套完整的中后台组件解决方案，帮助开发者快速搭建企业级应用。

### Element Plus vs Element UI

| 特性 | Element Plus | Element UI |
|------|-------------|-----------|
| Vue 版本 | Vue 3 | Vue 2 |
| 组合式 API | ✅ 完全支持 | ❌ 不支持 |
| TypeScript | ✅ 完整类型支持 | ⚠️ 部分支持 |
| 打包工具 | Vite 优先 | Webpack |
| 按需引入 | 更优化 | 需要插件 |
| 性能 | 更优（Vue 3） | 较好 |

### 技术栈组合

```
Vue 3 + Element Plus + Vite + TypeScript + Pinia
```

这是目前最推荐的中后台开发技术栈。

---

## 安装方式

### 1. npm 安装（推荐）

```bash
# 使用 npm
npm install element-plus --save

# 使用 yarn
yarn add element-plus

# 使用 pnpm（推荐，更快）
pnpm install element-plus
```

### 2. CDN 引入（不推荐生产环境）

```html
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css" />
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-plus"></script>
```

---

## 完整引入 vs 按需引入

### 方式一：完整引入（快速开发）

**优点**：配置简单，所有组件都可用  
**缺点**：打包体积大（~2MB），首屏加载慢

```ts
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')
```

### 方式二：按需引入（生产推荐）

**优点**：打包体积小，按需加载  
**缺点**：需要额外配置

#### 手动按需引入

```ts
// main.ts
import { createApp } from 'vue'
import { ElButton, ElSelect } from 'element-plus'
import App from './App.vue'

const app = createApp(App)

app.use(ElButton)
app.use(ElSelect)
app.mount('#app')
```

#### 自动按需引入（推荐）

使用 `unplugin-vue-components` 和 `unplugin-auto-import` 插件。

---

## Vite 配置实战样例

### 1. 安装依赖

```bash
pnpm install element-plus
pnpm install -D unplugin-vue-components unplugin-auto-import
```

### 2. 配置 vite.config.ts

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    // 自动导入 Element Plus 组件
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    // 自动注册组件
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

### 3. 直接使用组件（无需手动导入）

```vue
<template>
  <el-button type="primary">主要按钮</el-button>
  <el-input v-model="input" placeholder="请输入内容" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
</script>
```

**配置完成后**：
- ✅ 组件自动按需导入
- ✅ 样式自动按需加载
- ✅ 无需手动 import 组件
- ✅ 打包体积最小化

---

## Webpack 配置实战样例

### 1. 安装依赖

```bash
npm install element-plus
npm install -D unplugin-vue-components unplugin-auto-import
```

### 2. 配置 vue.config.js

```js
// vue.config.js
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = {
  configureWebpack: {
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  },
}
```

---

## 国际化配置

### 默认中文配置

```ts
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import App from './App.vue'

const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn,
})
app.mount('#app')
```

### 英文配置

```ts
import ElementPlus from 'element-plus'
import en from 'element-plus/dist/locale/en.mjs'

app.use(ElementPlus, {
  locale: en,
})
```

### 与 Vue I18n 集成

```ts
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

const i18n = createI18n({
  locale: 'zh-cn',
  messages: {
    'zh-cn': {
      el: zhCn.el,
      // 自定义翻译
    },
    en: {
      el: en.el,
    },
  },
})

const app = createApp(App)
app.use(i18n)
app.use(ElementPlus, {
  locale: i18n.global.messages.value[i18n.global.locale.value].el,
})
```

---

## 完整项目初始化样例

### 1. 创建项目

```bash
# 使用 Vite 创建 Vue 3 项目
pnpm create vite my-element-plus-app --template vue-ts
cd my-element-plus-app
pnpm install
```

### 2. 安装 Element Plus

```bash
pnpm install element-plus
pnpm install -D unplugin-vue-components unplugin-auto-import
```

### 3. 配置 vite.config.ts

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

### 4. 测试组件（App.vue）

```vue
<template>
  <div class="app">
    <h1>Element Plus 快速开始</h1>
    <el-button type="primary" @click="handleClick">点击测试</el-button>
    <el-input v-model="text" placeholder="请输入内容" style="width: 200px; margin-left: 10px;" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const text = ref('')

const handleClick = () => {
  ElMessage.success('Element Plus 配置成功！')
}
</script>

<style scoped>
.app {
  padding: 20px;
}
</style>
```

### 5. 运行项目

```bash
pnpm dev
```

打开浏览器访问 `http://localhost:5173`，如果看到按钮和输入框，说明配置成功。

---

## 常见踩坑

### 1. 样式未生效

**问题**：组件渲染了但没有样式

**原因**：未引入样式文件或自动导入插件配置错误

**解决方案**：
```ts
// 完整引入时，确保导入样式
import 'element-plus/dist/index.css'

// 或确保 unplugin-vue-components 配置正确
Components({
  resolvers: [ElementPlusResolver()], // 会自动导入样式
})
```

### 2. 组件未注册

**问题**：`[Vue warn]: Failed to resolve component: el-button`

**原因**：组件未注册或自动导入插件未生效

**解决方案**：
- 检查 vite.config.ts 配置是否正确
- 重启开发服务器
- 手动导入组件测试

### 3. TypeScript 类型报错

**问题**：组件 Props 类型报错

**解决方案**：
```ts
// tsconfig.json 添加类型声明
{
  "compilerOptions": {
    "types": ["element-plus/global"]
  }
}
```

### 4. Vite 开发服务器慢

**原因**：首次启动需要预构建依赖

**解决方案**：
```ts
// vite.config.ts 添加优化配置
export default defineConfig({
  optimizeDeps: {
    include: ['element-plus'],
  },
})
```

---

## 最佳实践

### 1. 按需引入优先

生产环境必须使用按需引入，可减少 60%+ 的打包体积。

### 2. 使用自动导入插件

`unplugin-vue-components` + `unplugin-auto-import` 是最佳组合，无需手动导入。

### 3. 国际化配置

如果项目需要多语言，初始化时就配置好 i18n。

### 4. TypeScript 支持

新项目推荐使用 TypeScript，Element Plus 提供完整类型支持。

### 5. 样式定制

提前规划主题色，使用 CSS 变量方式定制（后续章节详解）。

---

## 参考资料

- [Element Plus 官方文档](https://element-plus.org/)
- [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components)
- [Vite 官方文档](https://vitejs.dev/)
- [Vue 3 官方文档](https://cn.vuejs.org/)

---

## 下一步

配置完成后，进入下一章节学习第一个完整组件应用：[快速上手与第一个组件](./content-2.md)
