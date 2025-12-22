# 第 42 章：小程序规范方案

## 概述

小程序开发有其特殊性，需要针对性地配置代码规范。本章介绍微信小程序、Taro 和 uni-app 等主流小程序框架的规范配置方案。

## 一、微信原生小程序

### 1.1 ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  globals: {
    wx: 'readonly',
    App: 'readonly',
    Page: 'readonly',
    Component: 'readonly',
    Behavior: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly'
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error'
  }
};
```

### 1.2 TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "ESNext",
    "lib": ["ES2017"],
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "types": ["miniprogram-api-typings"]
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 1.3 代码示例

```typescript
// pages/index/index.ts
interface PageData {
  userInfo: WechatMiniprogram.UserInfo | null
  loading: boolean
}

Page<PageData, WechatMiniprogram.Page.CustomOption>({
  data: {
    userInfo: null,
    loading: false,
  },

  onLoad() {
    this.loadUserInfo()
  },

  async loadUserInfo() {
    this.setData({ loading: true })
    try {
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善会员资料',
      })
      this.setData({ userInfo })
    } catch (error) {
      console.error('获取用户信息失败', error)
    } finally {
      this.setData({ loading: false })
    }
  },
})
```

## 二、Taro 项目

### 2.1 ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  extends: ['taro/react'],
  rules: {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_'
    }]
  }
};
```

### 2.2 组件示例

```tsx
// src/pages/index/index.tsx
import { View, Text, Button } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'

import './index.scss'

const Index = () => {
  const [count, setCount] = useState(0)

  useLoad(() => {
    console.log('Page loaded.')
  })

  const handleClick = () => {
    setCount((prev) => prev + 1)
    Taro.showToast({
      title: `点击了 ${count + 1} 次`,
      icon: 'none',
    })
  }

  return (
    <View className="index">
      <Text className="index__title">Hello Taro!</Text>
      <Button onClick={handleClick}>点击计数: {count}</Button>
    </View>
  )
}

export default Index
```

## 三、uni-app 项目

### 3.1 ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  globals: {
    uni: 'readonly',
    plus: 'readonly',
    wx: 'readonly'
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-console': 'off'
  }
};
```

### 3.2 组件示例

```vue
<!-- pages/index/index.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

const handleClick = () => {
  count.value++
  uni.showToast({
    title: `点击了 ${count.value} 次`,
    icon: 'none',
  })
}
</script>

<template>
  <view class="container">
    <text class="title">Hello uni-app!</text>
    <button @click="handleClick">点击计数: {{ count }}</button>
  </view>
</template>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
}
</style>
```

## 四、通用规范

### 4.1 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 页面目录 | kebab-case | `user-center` |
| 组件文件 | PascalCase | `UserCard.vue` |
| 样式类名 | BEM | `user-card__title` |
| API 方法 | camelCase | `getUserInfo` |

### 4.2 目录结构

```
src/
├── pages/           # 页面
├── components/      # 组件
├── utils/           # 工具函数
├── api/             # API 请求
├── stores/          # 状态管理
├── styles/          # 公共样式
└── types/           # 类型定义
```

### 4.3 样式规范

```scss
// 使用 rpx 单位
.container {
  padding: 20rpx;
  font-size: 28rpx;
}

// 避免深层嵌套
.card {
  &__header { }
  &__body { }
  &__footer { }
}
```

## 五、最佳实践

| 实践 | 说明 |
|------|------|
| 类型安全 | 使用 TypeScript 获得更好的开发体验 |
| 分包加载 | 大型项目使用分包优化加载速度 |
| 请求封装 | 统一封装 API 请求 |
| 状态管理 | 复杂应用使用 Pinia/Vuex |

## 参考资料

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Taro 官方文档](https://docs.taro.zone/)
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
