# 第 41 章：Vue 项目规范配置

## 概述

本章提供完整的 Vue 3 + TypeScript 项目代码规范配置方案，包含 ESLint、Prettier、Stylelint 的最佳实践配置。

## 一、依赖安装

```bash
# ESLint 相关
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-vue vue-eslint-parser

# Prettier 相关
npm install -D prettier eslint-config-prettier

# Stylelint 相关
npm install -D stylelint stylelint-config-standard-scss postcss-html

# Git Hooks
npm install -D husky lint-staged
```

## 二、ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    extraFileExtensions: ['.vue']
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    // Vue
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'off',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/define-macros-order': ['error', {
      order: ['defineProps', 'defineEmits']
    }],
    'vue/block-order': ['error', {
      order: ['script', 'template', 'style']
    }],
    'vue/attributes-order': ['error', {
      order: [
        'DEFINITION',
        'LIST_RENDERING',
        'CONDITIONALS',
        'RENDER_MODIFIERS',
        'GLOBAL',
        'UNIQUE',
        'TWO_WAY_BINDING',
        'OTHER_DIRECTIVES',
        'OTHER_ATTR',
        'EVENTS',
        'CONTENT'
      ]
    }],

    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_'
    }],
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports'
    }],

    // General
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error'
  },
  ignorePatterns: ['dist', 'node_modules', '*.config.js', '*.config.ts']
};
```

## 三、Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "vueIndentScriptAndStyle": false,
  "singleAttributePerLine": true,
  "endOfLine": "lf"
}
```

## 四、Stylelint 配置

```javascript
// .stylelintrc.js
module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-prettier'],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html'
    }
  ],
  rules: {
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [true, {
      ignorePseudoClasses: ['deep', 'global', 'slotted']
    }],
    'selector-pseudo-element-no-unknown': [true, {
      ignorePseudoElements: ['v-deep', 'v-global', 'v-slotted']
    }],
    'at-rule-no-unknown': [true, {
      ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'use', 'forward']
    }]
  },
  ignoreFiles: ['dist/**', 'node_modules/**']
}
```

## 五、package.json 脚本

```json
{
  "scripts": {
    "lint": "eslint . --ext .vue,.js,.ts,.jsx,.tsx",
    "lint:fix": "eslint . --ext .vue,.js,.ts,.jsx,.tsx --fix",
    "lint:css": "stylelint \"src/**/*.{vue,css,scss}\"",
    "format": "prettier --write \"src/**/*.{vue,ts,js,css,scss,json}\"",
    "typecheck": "vue-tsc --noEmit",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{vue,ts,js}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## 六、VS Code 配置

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  },
  "eslint.validate": ["javascript", "typescript", "vue"],
  "stylelint.validate": ["css", "scss", "vue"]
}
```

## 七、组件示例

```vue
<!-- src/components/UserCard.vue -->
<script setup lang="ts">
import type { User } from '@/types'

interface Props {
  user: User
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
})

const emit = defineEmits<{
  edit: [user: User]
  delete: [id: string]
}>()

const handleEdit = () => {
  emit('edit', props.user)
}

const handleDelete = () => {
  emit('delete', props.user.id)
}
</script>

<template>
  <div class="user-card">
    <img
      :src="user.avatar"
      :alt="user.name"
      class="user-card__avatar"
    >
    <div class="user-card__info">
      <h3 class="user-card__name">{{ user.name }}</h3>
      <p class="user-card__email">{{ user.email }}</p>
    </div>
    <div
      v-if="showActions"
      class="user-card__actions"
    >
      <button @click="handleEdit">编辑</button>
      <button @click="handleDelete">删除</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.user-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  &__info {
    flex: 1;
    margin-left: 12px;
  }

  &__name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  &__email {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 14px;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}
</style>
```

## 八、Composable 示例

```typescript
// src/composables/useFetch.ts
import { ref, shallowRef } from 'vue'

import type { Ref } from 'vue'

interface UseFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  isLoading: Ref<boolean>
  execute: () => Promise<void>
}

export function useFetch<T>(url: string): UseFetchReturn<T> {
  const data = shallowRef<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  const execute = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      data.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error')
    } finally {
      isLoading.value = false
    }
  }

  return { data, error, isLoading, execute }
}
```

## 参考资料

- [Vue 3 官方文档](https://vuejs.org/)
- [eslint-plugin-vue](https://eslint.vuejs.org/)
- [Volar](https://github.com/vuejs/language-tools)
