# 动态导入机制

## 概述

动态导入（Dynamic Import）允许在运行时按需加载模块，是代码分割和性能优化的关键技术。

理解动态导入的关键在于：

- **返回 Promise**：`import()` 是一个返回 Promise 的函数
- **运行时加载**：可以在任何地方调用，不限于顶层
- **代码分割**：打包工具会自动分割动态导入的模块

---

## 一、基本语法

### 1.1 基本用法

```js
// 动态导入返回 Promise
import('./module.js')
  .then(module => {
    module.func();
  })
  .catch(err => {
    console.error('加载失败:', err);
  });

// 使用 async/await
const module = await import('./module.js');
module.func();

// 解构导入
const { func, value } = await import('./utils.js');
func();
```

### 1.2 与静态导入的区别

```js
// 静态导入（编译时）
import { func } from './module.js';  // 必须在顶层
// 始终加载
// 不能有条件或循环

// 动态导入（运行时）
if (condition) {
  const { func } = await import('./module.js');  // 可以在任何地方
}
// 按需加载
// 可以有条件、循环、变量路径
```

---

## 二、使用场景

### 2.1 路由懒加载

```js
// React Router 懒加载
const routes = [
  {
    path: '/home',
    component: React.lazy(() => import('./pages/Home'))
  },
  {
    path: '/about',
    component: React.lazy(() => import('./pages/About'))
  }
];

// Vue Router 懒加载
const routes = [
  {
    path: '/home',
    component: () => import('./pages/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./pages/About.vue')
  }
];
```

### 2.2 条件加载

```js
// 根据条件加载不同模块
async function loadFeature(type) {
  if (type === 'A') {
    const module = await import('./featureA.js');
    return module.default;
  } else {
    const module = await import('./featureB.js');
    return module.default;
  }
}

// 环境检测
if (process.env.NODE_ENV === 'development') {
  const devTools = await import('./devTools.js');
  devTools.init();
}
```

### 2.3 按需加载

```js
// 点击时加载
button.addEventListener('click', async () => {
  const { heavyFunction } = await import('./heavy.js');
  heavyFunction();
});

// 滚动到视口时加载
const observer = new IntersectionObserver(async (entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const { component } = await import('./component.js');
      component.render(entry.target);
    }
  }
});
```

### 2.4 国际化

```js
// 动态加载语言包
async function setLanguage(lang) {
  const messages = await import(`./i18n/${lang}.js`);
  i18n.setMessages(messages.default);
}

setLanguage('zh-CN');
```

---

## 三、错误处理

### 3.1 加载失败处理

```js
// 基本错误处理
try {
  const module = await import('./module.js');
} catch (error) {
  console.error('模块加载失败:', error);
}

// 重试机制
async function importWithRetry(path, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await import(path);
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`重试 ${i + 1}/${retries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3.2 超时处理

```js
// 添加超时控制
function importWithTimeout(path, timeout = 5000) {
  return Promise.race([
    import(path),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('加载超时')), timeout)
    )
  ]);
}

// 使用
try {
  const module = await importWithTimeout('./module.js', 3000);
} catch (error) {
  console.error('加载失败或超时:', error);
}
```

---

## 四、性能优化

### 4.1 预加载

```js
// 预加载（不执行）
const modulePromise = import('./module.js');

// 稍后使用
button.addEventListener('click', async () => {
  const module = await modulePromise;
  module.func();
});

// 使用 <link rel="modulepreload">
<link rel="modulepreload" href="/static/module.js">
```

### 4.2 预取

```js
// 使用 <link rel="prefetch">
<link rel="prefetch" href="/static/optional-module.js">

// 动态创建 prefetch
function prefetchModule(path) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
}

// 空闲时预取
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    prefetchModule('/static/optional.js');
  });
}
```

### 4.3 缓存策略

```js
// 手动缓存已加载的模块
const moduleCache = new Map();

async function cachedImport(path) {
  if (moduleCache.has(path)) {
    return moduleCache.get(path);
  }

  const module = await import(path);
  moduleCache.set(path, module);
  return module;
}
```

---

## 五、打包工具配置

### 5.1 Webpack

```js
// webpack.config.js
module.exports = {
  output: {
    chunkFilename: '[name].[contenthash].js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};

// 魔法注释
const module = await import(
  /* webpackChunkName: "my-chunk" */
  /* webpackPrefetch: true */
  './module.js'
);
```

### 5.2 Vite

```js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
};
```

---

## 六、最佳实践

1. **合理分割代码**：按路由、功能或大小分割。
2. **预加载关键资源**：提前加载可能需要的模块。
3. **错误处理**：始终处理加载失败的情况。
4. **缓存策略**：避免重复加载相同模块。
5. **性能监控**：监控动态导入的加载时间。

---

## 参考资料

- [TC39 - Dynamic Import](https://tc39.es/proposal-dynamic-import/)
- [MDN - import()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/import)
- [Webpack - Dynamic Imports](https://webpack.js.org/guides/code-splitting/#dynamic-imports)
