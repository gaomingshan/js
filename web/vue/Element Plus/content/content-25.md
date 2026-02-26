# 主题定制与样式覆盖

## 概述

Element Plus 支持主题定制和样式覆盖，可以通过 CSS 变量、SCSS 变量或自定义主题包实现品牌化定制。本章介绍各种主题定制方案和最佳实践。

## 核心方案

### 1. CSS 变量定制（推荐）

Element Plus 使用 CSS 变量实现主题，可以通过覆盖 CSS 变量快速定制主题。

**主要 CSS 变量：**

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `--el-color-primary` | 主题色 | `#409eff` |
| `--el-color-success` | 成功色 | `#67c23a` |
| `--el-color-warning` | 警告色 | `#e6a23c` |
| `--el-color-danger` | 危险色 | `#f56c6c` |
| `--el-color-info` | 信息色 | `#909399` |
| `--el-border-radius-base` | 圆角 | `4px` |
| `--el-font-size-base` | 字体大小 | `14px` |

### 2. SCSS 变量定制

通过 SCSS 变量在编译时定制主题。

### 3. 自定义主题包

使用在线主题编辑器或 CLI 工具生成完整主题包。

## 完整实战样例

### 示例 1：CSS 变量快速定制

通过 CSS 变量实现主题切换。

```vue
<template>
  <div class="theme-demo">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>主题定制示例</span>
          <el-space>
            <el-button size="small" @click="applyTheme('default')">
              默认主题
            </el-button>
            <el-button size="small" type="primary" @click="applyTheme('blue')">
              蓝色主题
            </el-button>
            <el-button size="small" type="success" @click="applyTheme('green')">
              绿色主题
            </el-button>
            <el-button size="small" type="danger" @click="applyTheme('red')">
              红色主题
            </el-button>
            <el-button size="small" @click="applyTheme('dark')">
              深色主题
            </el-button>
          </el-space>
        </div>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="20">
        <!-- 按钮展示 -->
        <el-card shadow="never">
          <template #header>
            <span>按钮组件</span>
          </template>
          <el-space wrap>
            <el-button type="primary">主要按钮</el-button>
            <el-button type="success">成功按钮</el-button>
            <el-button type="warning">警告按钮</el-button>
            <el-button type="danger">危险按钮</el-button>
            <el-button type="info">信息按钮</el-button>
          </el-space>
        </el-card>

        <!-- 标签展示 -->
        <el-card shadow="never">
          <template #header>
            <span>标签组件</span>
          </template>
          <el-space wrap>
            <el-tag type="primary">Primary</el-tag>
            <el-tag type="success">Success</el-tag>
            <el-tag type="warning">Warning</el-tag>
            <el-tag type="danger">Danger</el-tag>
            <el-tag type="info">Info</el-tag>
          </el-space>
        </el-card>

        <!-- 表单组件 -->
        <el-card shadow="never">
          <template #header>
            <span>表单组件</span>
          </template>
          <el-form :model="form" label-width="100px">
            <el-form-item label="输入框">
              <el-input v-model="form.input" placeholder="请输入内容" />
            </el-form-item>
            <el-form-item label="选择器">
              <el-select v-model="form.select" placeholder="请选择">
                <el-option label="选项1" value="1" />
                <el-option label="选项2" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="开关">
              <el-switch v-model="form.switch" />
            </el-form-item>
            <el-form-item label="滑块">
              <el-slider v-model="form.slider" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-space>
    </el-card>

    <!-- 自定义主题配置 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <span>自定义主题配置</span>
      </template>

      <el-form label-width="120px">
        <el-form-item label="主题色">
          <el-color-picker v-model="customTheme.primary" @change="applyCustomTheme" />
          <span style="margin-left: 12px">{{ customTheme.primary }}</span>
        </el-form-item>
        <el-form-item label="成功色">
          <el-color-picker v-model="customTheme.success" @change="applyCustomTheme" />
          <span style="margin-left: 12px">{{ customTheme.success }}</span>
        </el-form-item>
        <el-form-item label="警告色">
          <el-color-picker v-model="customTheme.warning" @change="applyCustomTheme" />
          <span style="margin-left: 12px">{{ customTheme.warning }}</span>
        </el-form-item>
        <el-form-item label="危险色">
          <el-color-picker v-model="customTheme.danger" @change="applyCustomTheme" />
          <span style="margin-left: 12px">{{ customTheme.danger }}</span>
        </el-form-item>
        <el-form-item label="圆角大小">
          <el-slider
            v-model="customTheme.borderRadius"
            :min="0"
            :max="20"
            @change="applyCustomTheme"
          />
          <span style="margin-left: 12px">{{ customTheme.borderRadius }}px</span>
        </el-form-item>
        <el-form-item label="字体大小">
          <el-slider
            v-model="customTheme.fontSize"
            :min="12"
            :max="18"
            @change="applyCustomTheme"
          />
          <span style="margin-left: 12px">{{ customTheme.fontSize }}px</span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const form = ref({
  input: '',
  select: '',
  switch: false,
  slider: 50
})

// 预设主题
const themes = {
  default: {
    primary: '#409eff',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    info: '#909399',
    borderRadius: '4',
    fontSize: '14'
  },
  blue: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#f5222d',
    info: '#8c8c8c',
    borderRadius: '4',
    fontSize: '14'
  },
  green: {
    primary: '#00b96b',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#ff4d4f',
    info: '#8c8c8c',
    borderRadius: '6',
    fontSize: '14'
  },
  red: {
    primary: '#f5222d',
    success: '#52c41a',
    warning: '#fa8c16',
    danger: '#cf1322',
    info: '#8c8c8c',
    borderRadius: '8',
    fontSize: '14'
  },
  dark: {
    primary: '#177ddc',
    success: '#49aa19',
    warning: '#d89614',
    danger: '#d32029',
    info: '#434343',
    borderRadius: '2',
    fontSize: '14'
  }
}

const customTheme = ref({
  primary: '#409eff',
  success: '#67c23a',
  warning: '#e6a23c',
  danger: '#f56c6c',
  borderRadius: 4,
  fontSize: 14
})

const applyTheme = (themeName: keyof typeof themes) => {
  const theme = themes[themeName]
  
  // 设置 CSS 变量
  document.documentElement.style.setProperty('--el-color-primary', theme.primary)
  document.documentElement.style.setProperty('--el-color-success', theme.success)
  document.documentElement.style.setProperty('--el-color-warning', theme.warning)
  document.documentElement.style.setProperty('--el-color-danger', theme.danger)
  document.documentElement.style.setProperty('--el-color-info', theme.info)
  document.documentElement.style.setProperty('--el-border-radius-base', `${theme.borderRadius}px`)
  document.documentElement.style.setProperty('--el-font-size-base', `${theme.fontSize}px`)
  
  // 同步到自定义主题配置
  customTheme.value = {
    primary: theme.primary,
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
    borderRadius: parseInt(theme.borderRadius),
    fontSize: parseInt(theme.fontSize)
  }
  
  ElMessage.success(`已应用${themeName}主题`)
}

const applyCustomTheme = () => {
  document.documentElement.style.setProperty('--el-color-primary', customTheme.value.primary)
  document.documentElement.style.setProperty('--el-color-success', customTheme.value.success)
  document.documentElement.style.setProperty('--el-color-warning', customTheme.value.warning)
  document.documentElement.style.setProperty('--el-color-danger', customTheme.value.danger)
  document.documentElement.style.setProperty('--el-border-radius-base', `${customTheme.value.borderRadius}px`)
  document.documentElement.style.setProperty('--el-font-size-base', `${customTheme.value.fontSize}px`)
}
</script>

<style scoped>
.theme-demo {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

**运行效果：**
- 切换预设主题（默认、蓝色、绿色、红色、深色）
- 实时预览主题效果
- 自定义主题色和样式参数
- 使用颜色选择器和滑块调整主题

---

### 示例 2：深度样式覆盖

针对特定组件进行样式定制。

```vue
<template>
  <div class="custom-style-demo">
    <el-card class="custom-card">
      <template #header>
        <span>深度样式覆盖示例</span>
      </template>

      <!-- 自定义按钮 -->
      <div style="margin-bottom: 20px">
        <h4>自定义按钮样式</h4>
        <el-space wrap>
          <el-button class="gradient-button" type="primary">
            渐变按钮
          </el-button>
          <el-button class="rounded-button" type="success">
            圆角按钮
          </el-button>
          <el-button class="shadow-button" type="warning">
            阴影按钮
          </el-button>
        </el-space>
      </div>

      <!-- 自定义输入框 -->
      <div style="margin-bottom: 20px">
        <h4>自定义输入框样式</h4>
        <el-input class="custom-input" v-model="input1" placeholder="自定义边框和背景" />
      </div>

      <!-- 自定义表格 -->
      <div style="margin-bottom: 20px">
        <h4>自定义表格样式</h4>
        <el-table :data="tableData" class="custom-table">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="age" label="年龄" />
          <el-table-column prop="address" label="地址" />
        </el-table>
      </div>

      <!-- 自定义对话框 -->
      <div>
        <h4>自定义对话框样式</h4>
        <el-button @click="dialogVisible = true">打开自定义对话框</el-button>
        <el-dialog
          v-model="dialogVisible"
          title="自定义对话框"
          width="500px"
          class="custom-dialog"
        >
          <p>这是一个自定义样式的对话框</p>
          <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="dialogVisible = false">确定</el-button>
          </template>
        </el-dialog>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input1 = ref('')
const dialogVisible = ref(false)
const tableData = ref([
  { name: '张三', age: 28, address: '北京' },
  { name: '李四', age: 32, address: '上海' }
])
</script>

<style scoped>
.custom-style-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.custom-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h4 {
  margin: 0 0 12px 0;
  color: #606266;
}

/* 自定义按钮 */
.gradient-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.gradient-button:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.rounded-button {
  border-radius: 20px;
}

.shadow-button {
  box-shadow: 0 4px 8px rgba(230, 162, 60, 0.4);
}

/* 自定义输入框 */
.custom-input {
  --el-input-border-color: #667eea;
  --el-input-focus-border-color: #764ba2;
}

.custom-input :deep(.el-input__wrapper) {
  background: linear-gradient(90deg, #f5f7fa 0%, #fff 100%);
  border-radius: 8px;
}

/* 自定义表格 */
.custom-table {
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(.el-table__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.custom-table :deep(.el-table__header th) {
  background: transparent;
  color: #fff;
  font-weight: bold;
}

.custom-table :deep(.el-table__row:nth-child(even)) {
  background: #f5f7fa;
}

.custom-table :deep(.el-table__row:hover) {
  background: #e6f7ff !important;
}

/* 自定义对话框 */
.custom-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 20px;
  margin: 0;
  border-radius: 8px 8px 0 0;
}

.custom-dialog :deep(.el-dialog__title) {
  color: #fff;
}

.custom-dialog :deep(.el-dialog__close) {
  color: #fff;
}

.custom-dialog :deep(.el-dialog__body) {
  padding: 30px;
}
</style>
```

**运行效果：**
- 渐变色按钮
- 自定义边框和背景的输入框
- 渐变表头和斑马纹表格
- 自定义头部的对话框

---

### 示例 3：暗黑模式切换

实现完整的暗黑模式。

```vue
<template>
  <div :class="['dark-mode-demo', { 'dark': isDark }]">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>暗黑模式切换</span>
          <el-switch
            v-model="isDark"
            active-text="暗黑模式"
            inactive-text="明亮模式"
            @change="toggleDarkMode"
          />
        </div>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="20">
        <el-card shadow="never">
          <h4>组件展示</h4>
          <el-space wrap>
            <el-button type="primary">Primary</el-button>
            <el-button type="success">Success</el-button>
            <el-button type="warning">Warning</el-button>
            <el-button type="danger">Danger</el-button>
          </el-space>
        </el-card>

        <el-card shadow="never">
          <h4>表单组件</h4>
          <el-form label-width="100px">
            <el-form-item label="输入框">
              <el-input v-model="input" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="选择器">
              <el-select v-model="select" placeholder="请选择">
                <el-option label="选项1" value="1" />
                <el-option label="选项2" value="2" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never">
          <h4>数据表格</h4>
          <el-table :data="tableData" border>
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="role" label="角色" />
          </el-table>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isDark = ref(false)
const input = ref('')
const select = ref('')
const tableData = ref([
  { name: '张三', role: '管理员' },
  { name: '李四', role: '编辑' }
])

const toggleDarkMode = (value: boolean) => {
  if (value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
</script>

<style scoped>
.dark-mode-demo {
  max-width: 1000px;
  margin: 0 auto;
  transition: all 0.3s;
}

/* 暗黑模式样式 */
.dark-mode-demo.dark {
  --el-bg-color: #1a1a1a;
  --el-bg-color-page: #0a0a0a;
  --el-text-color-primary: #e5eaf3;
  --el-text-color-regular: #cfd3dc;
  --el-border-color: #4c4d4f;
  --el-fill-color-blank: #2b2b2b;
}

.dark-mode-demo.dark :deep(.el-card) {
  background-color: var(--el-fill-color-blank);
  border-color: var(--el-border-color);
}

.dark-mode-demo.dark :deep(.el-input__wrapper) {
  background-color: #2b2b2b;
}

.dark-mode-demo.dark :deep(.el-table) {
  --el-table-bg-color: #2b2b2b;
  --el-table-tr-bg-color: #2b2b2b;
  --el-table-header-bg-color: #1a1a1a;
}

h4 {
  margin: 0 0 16px 0;
}
</style>
```

**运行效果：**
- 一键切换暗黑/明亮模式
- 所有组件自适应主题
- 平滑过渡动画

---

## 常见踩坑

### 1. CSS 变量优先级问题

**问题：** 设置 CSS 变量后不生效。

**解决：** 在 `:root` 或 `html` 上设置变量。

```css
/* ✅ 正确 */
:root {
  --el-color-primary: #1890ff;
}

/* ❌ 错误 - 作用域太小 */
.my-app {
  --el-color-primary: #1890ff;
}
```

---

### 2. 深度选择器失效

**问题：** 使用 `:deep()` 后样式不生效。

**解决：** 检查选择器层级和specificity。

```vue
<style scoped>
/* ✅ 正确 */
.my-button :deep(.el-button) {
  background: red;
}

/* ❌ 错误 - 层级不对 */
:deep(.el-button) {
  background: red;
}
</style>
```

---

### 3. 主题切换后组件未更新

**问题：** 动态修改 CSS 变量后，某些组件样式未变化。

**解决：** 使用 `nextTick` 或强制重新渲染。

```ts
import { nextTick } from 'vue'

const changeTheme = async () => {
  document.documentElement.style.setProperty('--el-color-primary', '#1890ff')
  await nextTick()
  // 样式已更新
}
```

---

## 最佳实践

### 1. 主题配置集中管理

```ts
// theme.ts
export const themes = {
  light: {
    primary: '#409eff',
    success: '#67c23a',
    // ...
  },
  dark: {
    primary: '#177ddc',
    success: '#49aa19',
    // ...
  }
}

export const applyTheme = (theme: keyof typeof themes) => {
  const config = themes[theme]
  Object.entries(config).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--el-color-${key}`, value)
  })
}
```

### 2. 主题持久化

```ts
import { useLocalStorage } from '@vueuse/core'

export const useTheme = () => {
  const currentTheme = useLocalStorage('app-theme', 'light')
  
  const setTheme = (theme: string) => {
    applyTheme(theme)
    currentTheme.value = theme
  }
  
  // 初始化时应用主题
  onMounted(() => {
    applyTheme(currentTheme.value)
  })
  
  return { currentTheme, setTheme }
}
```

### 3. 按需覆盖组件样式

```scss
// custom-element-plus.scss
@forward 'element-plus/theme-chalk/src/common/var.scss' with (
  $colors: (
    'primary': (
      'base': #1890ff,
    ),
  ),
  $border-radius: (
    'base': 4px,
  ),
);
```

---

## 参考资料

- [Element Plus 自定义主题](https://element-plus.org/zh-CN/guide/theming.html)
- [CSS Variables MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
