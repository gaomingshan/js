# 第 40 章：React 项目规范配置

## 概述

本章提供一个完整的 React + TypeScript 项目代码规范配置方案，涵盖 ESLint、Prettier、Stylelint 及相关工具的最佳实践配置。

## 一、项目结构

```
react-project/
├── .eslintrc.js
├── .prettierrc
├── .stylelintrc.js
├── .editorconfig
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── tsconfig.json
├── package.json
└── src/
    ├── components/
    ├── hooks/
    ├── pages/
    ├── utils/
    └── styles/
```

## 二、依赖安装

```bash
# ESLint 相关
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y
npm install -D eslint-plugin-import eslint-import-resolver-typescript

# Prettier 相关
npm install -D prettier eslint-config-prettier

# Stylelint 相关
npm install -D stylelint stylelint-config-standard stylelint-config-prettier

# Git Hooks
npm install -D husky lint-staged
```

## 三、ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import'],
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  },
  rules: {
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react/self-closing-comp': 'error',
    'react/jsx-sort-props': ['warn', {
      callbacksLast: true,
      shorthandFirst: true,
      reservedFirst: true
    }],

    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports'
    }],

    // Import
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling'],
        'index',
        'type'
      ],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true }
    }],
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'error',

    // General
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always']
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],
  ignorePatterns: ['dist', 'build', 'node_modules', '*.config.js']
};
```

## 四、Prettier 配置

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "jsxSingleQuote": false
}
```

```gitignore
# .prettierignore
dist
build
node_modules
*.min.js
*.min.css
package-lock.json
pnpm-lock.yaml
```

## 五、Stylelint 配置

```javascript
// .stylelintrc.js
module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  rules: {
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'color-hex-length': 'long',
    'declaration-block-no-redundant-longhand-properties': null
  },
  overrides: [
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss'
    }
  ],
  ignoreFiles: ['dist/**', 'node_modules/**']
};
```

## 六、TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

## 七、编辑器配置

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "stylelint.validate": ["css", "scss"],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "stylelint.vscode-stylelint"
  ]
}
```

```ini
# .editorconfig
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

## 八、Git Hooks 配置

```json
// package.json
{
  "scripts": {
    "lint": "eslint src/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
    "lint:css": "stylelint \"src/**/*.{css,scss}\"",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,scss,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,scss,json}\"",
    "typecheck": "tsc --noEmit",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# 初始化 Husky
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

## 九、代码规范示例

### 9.1 组件示例

```tsx
// src/components/Button/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    isLoading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} disabled={disabled || isLoading} {...props}>
      {isLoading ? <span className={styles.spinner} /> : children}
    </button>
  );
};
```

### 9.2 Hook 示例

```tsx
// src/hooks/useLocalStorage.ts
import { useCallback, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('useLocalStorage setValue error:', error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('useLocalStorage removeValue error:', error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
```

### 9.3 样式示例

```css
/* src/components/Button/Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Variants */
.primary {
  background-color: #3b82f6;
  color: #ffffff;
}

.primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.secondary {
  background-color: #6b7280;
  color: #ffffff;
}

/* Sizes */
.sm {
  padding: 4px 12px;
  font-size: 14px;
}

.md {
  padding: 8px 16px;
  font-size: 16px;
}

.lg {
  padding: 12px 24px;
  font-size: 18px;
}
```

## 十、检查清单

```markdown
# React 项目规范配置检查清单

## 工具安装
- [ ] ESLint 及相关插件
- [ ] Prettier 及 eslint-config-prettier
- [ ] Stylelint
- [ ] Husky 和 lint-staged

## 配置文件
- [ ] .eslintrc.js
- [ ] .prettierrc
- [ ] .stylelintrc.js
- [ ] tsconfig.json
- [ ] .editorconfig
- [ ] .vscode/settings.json

## 验证
- [ ] `npm run lint` 通过
- [ ] `npm run format:check` 通过
- [ ] `npm run typecheck` 通过
- [ ] Git commit 触发 lint-staged
- [ ] 编辑器保存时自动格式化
```

## 参考资料

- [Create React App 官方文档](https://create-react-app.dev/)
- [Vite React 模板](https://vitejs.dev/guide/)
- [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react)
- [typescript-eslint](https://typescript-eslint.io/)
