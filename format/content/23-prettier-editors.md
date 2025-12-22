# 第 23 章：编辑器集成

## 概述

编辑器集成是 Prettier 发挥最大价值的关键。正确配置后，保存文件即可自动格式化，让开发者专注于代码逻辑而非格式调整。

## 一、VS Code 集成

### 1.1 安装扩展

在扩展市场搜索并安装：**Prettier - Code formatter** (esbenp.prettier-vscode)

### 1.2 基础配置

```json
// .vscode/settings.json
{
  // 设置 Prettier 为默认格式化器
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  
  // 保存时自动格式化
  "editor.formatOnSave": true
}
```

### 1.3 针对特定语言配置

```json
{
  // 全局默认
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  
  // JavaScript/TypeScript
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // JSON
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // CSS/SCSS
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // HTML/Vue
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // Markdown
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.wordWrap": "on"
  }
}
```

### 1.4 与 ESLint 配合

```json
{
  // Prettier 格式化
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  
  // ESLint 修复
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  
  // ESLint 验证范围
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ]
}
```

### 1.5 扩展配置选项

```json
{
  // 使用项目本地的 Prettier
  "prettier.resolveGlobalModules": false,
  
  // 配置文件路径（通常自动检测）
  "prettier.configPath": ".prettierrc",
  
  // 忽略文件路径
  "prettier.ignorePath": ".prettierignore",
  
  // 需要配置文件才格式化
  "prettier.requireConfig": true,
  
  // 启用调试日志
  "prettier.enableDebugLogs": false
}
```

### 1.6 团队共享配置

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

## 二、WebStorm/IntelliJ 集成

### 2.1 启用 Prettier

1. **打开设置**：File → Settings (Ctrl+Alt+S)
2. **导航到**：Languages & Frameworks → JavaScript → Prettier
3. **配置**：
   - Prettier package：选择 `node_modules/prettier`
   - Run on save：勾选
   - Run for files：`{**/*,*}.{js,ts,jsx,tsx,vue,css,scss,json,md}`

### 2.2 配置选项

```
☑ Automatic Prettier configuration
   或
☐ Manual configuration
   Prettier package: ~/project/node_modules/prettier
   
☑ Run on save
☑ Run on 'Reformat Code' action

Run for files: {**/*,*}.{js,ts,jsx,tsx,vue,css,scss,html,json,md,yaml}
```

### 2.3 快捷键

- **格式化文件**：Ctrl+Alt+Shift+P (Windows/Linux) / ⌥⇧⌘P (macOS)
- **或使用 Reformat Code**：Ctrl+Alt+L / ⌥⌘L

### 2.4 与 ESLint 配合

1. **启用 ESLint**：Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. **选择**：Automatic ESLint configuration
3. **勾选**：Run eslint --fix on save

## 三、Vim/Neovim 集成

### 3.1 使用 vim-prettier

```vim
" 使用 vim-plug
Plug 'prettier/vim-prettier', { 'do': 'npm install' }

" 配置
let g:prettier#autoformat = 1
let g:prettier#autoformat_require_pragma = 0
```

### 3.2 使用 coc-prettier (推荐)

```vim
" 安装 coc.nvim 后
:CocInstall coc-prettier
```

```json
// coc-settings.json
{
  "prettier.enable": true,
  "prettier.formatOnSaveMode": "file",
  "coc.preferences.formatOnSave": true
}
```

### 3.3 使用 null-ls (Neovim)

```lua
-- 使用 nvim-lspconfig + null-ls
local null_ls = require("null-ls")

null_ls.setup({
  sources = {
    null_ls.builtins.formatting.prettier,
  },
})

-- 保存时格式化
vim.cmd([[autocmd BufWritePre * lua vim.lsp.buf.format()]])
```

### 3.4 使用 conform.nvim (Neovim)

```lua
require("conform").setup({
  formatters_by_ft = {
    javascript = { "prettier" },
    typescript = { "prettier" },
    javascriptreact = { "prettier" },
    typescriptreact = { "prettier" },
    css = { "prettier" },
    html = { "prettier" },
    json = { "prettier" },
    yaml = { "prettier" },
    markdown = { "prettier" },
  },
  format_on_save = {
    timeout_ms = 500,
    lsp_fallback = true,
  },
})
```

## 四、Sublime Text 集成

### 4.1 安装插件

1. 打开 Package Control (Ctrl+Shift+P)
2. 选择 "Install Package"
3. 搜索并安装 "JsPrettier"

### 4.2 配置

```json
// Preferences → Package Settings → JsPrettier → Settings
{
  "auto_format_on_save": true,
  "auto_format_on_save_excludes": [
    "*/node_modules/*",
    "*/.git/*"
  ],
  "prettier_cli_path": "",
  "prettier_options": {
    "singleQuote": true,
    "trailingComma": "all"
  }
}
```

## 五、Atom 集成

### 5.1 安装

```bash
apm install prettier-atom
```

### 5.2 配置

```cson
# config.cson
"prettier-atom":
  formatOnSaveOptions:
    enabled: true
    showInStatusBar: true
  prettierOptions:
    singleQuote: true
    trailingComma: "all"
```

## 六、命令行集成

### 6.1 基本命令

```bash
# 格式化文件
npx prettier --write src/index.js

# 格式化目录
npx prettier --write "src/**/*.{js,ts,jsx,tsx}"

# 检查格式（不修改）
npx prettier --check src/

# 查看差异
npx prettier --write --list-different src/
```

### 6.2 npm scripts

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{js,ts,jsx,tsx,css,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,ts,jsx,tsx,css,json,md}\""
  }
}
```

### 6.3 配合 Git Hooks

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx,css,json,md}": "prettier --write"
  }
}
```

## 七、在线编辑器

### 7.1 Prettier Playground

官方在线工具：https://prettier.io/playground/

- 实时预览格式化效果
- 调试配置选项
- 分享配置链接

### 7.2 CodeSandbox

自动支持 Prettier，在设置中启用：

```
Preferences → Editor → Format On Save
```

### 7.3 StackBlitz

内置 Prettier 支持：

```
Settings → Editor → Format on Save
```

## 八、调试与故障排除

### 8.1 VS Code 调试

```json
// 启用调试日志
{
  "prettier.enableDebugLogs": true
}
```

查看输出：View → Output → 选择 "Prettier"

### 8.2 常见问题

**问题1：格式化不生效**

检查清单：
1. 是否安装了 Prettier 扩展
2. 是否设置为默认格式化器
3. 项目是否有 `.prettierrc` 配置
4. 文件是否在 `.prettierignore` 中

```bash
# 检查 Prettier 是否能找到配置
npx prettier --find-config-path src/index.js
```

**问题2：使用了错误的 Prettier 版本**

```json
// 强制使用项目本地版本
{
  "prettier.resolveGlobalModules": false
}
```

**问题3：与其他格式化器冲突**

```json
// 明确指定格式化器
{
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**问题4：某些文件不格式化**

```bash
# 检查文件是否被忽略
npx prettier --check src/problem-file.js
```

### 8.3 性能问题

```json
// 限制文件大小
{
  "prettier.documentSelectors": ["**/*.{js,ts,jsx,tsx}"]
}
```

## 九、最佳实践

### 9.1 项目配置清单

```
项目根目录/
├── .prettierrc              # Prettier 配置
├── .prettierignore          # 忽略文件
├── .eslintrc.js             # ESLint 配置（含 prettier）
├── .vscode/
│   ├── settings.json        # 编辑器配置
│   └── extensions.json      # 推荐扩展
└── package.json             # scripts 和 lint-staged
```

### 9.2 推荐配置模板

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact", 
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 9.3 团队协作建议

1. **统一编辑器配置**：提交 `.vscode/settings.json`
2. **推荐扩展**：提交 `.vscode/extensions.json`
3. **强制检查**：CI 中运行 `prettier --check`
4. **Git Hooks**：使用 lint-staged 确保提交前格式化

## 参考资料

- [Prettier Editor Integration](https://prettier.io/docs/en/editors.html)
- [VS Code Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [WebStorm Prettier](https://www.jetbrains.com/help/webstorm/prettier.html)
