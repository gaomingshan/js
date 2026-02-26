# 按钮与图标组件

## 概述

Button 和 Icon 是最基础也是最常用的组件。Button 组件提供了丰富的样式和交互状态，Icon 组件则用于视觉化展示功能。

---

## Button 组件核心配置

### 基础属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 按钮类型 | string | primary/success/warning/danger/info/text | - |
| size | 按钮尺寸 | string | large/default/small | default |
| plain | 朴素按钮 | boolean | - | false |
| round | 圆角按钮 | boolean | - | false |
| circle | 圆形按钮 | boolean | - | false |
| loading | 加载状态 | boolean | - | false |
| disabled | 禁用状态 | boolean | - | false |
| icon | 图标组件 | Component | - | - |

### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击事件 | (event: MouseEvent) |

---

## Icon 图标使用

### 安装 Element Plus Icons

```bash
pnpm install @element-plus/icons-vue
```

### 使用方式

```vue
<script setup lang="ts">
import { Edit, Delete, Search } from '@element-plus/icons-vue'
</script>

<template>
  <!-- 方式一：作为组件使用 -->
  <el-icon :size="20" color="#409eff">
    <Edit />
  </el-icon>
  
  <!-- 方式二：在按钮中使用 -->
  <el-button :icon="Search">搜索</el-button>
</template>
```

---

## 完整样例一：按钮类型展示

### 效果描述
展示所有按钮类型和状态，包括普通、朴素、圆角、圆形、加载、禁用等。

### 完整代码

```vue
<template>
  <div class="button-demo">
    <h3>基础按钮</h3>
    <el-row class="mb-4">
      <el-button>默认按钮</el-button>
      <el-button type="primary">主要按钮</el-button>
      <el-button type="success">成功按钮</el-button>
      <el-button type="info">信息按钮</el-button>
      <el-button type="warning">警告按钮</el-button>
      <el-button type="danger">危险按钮</el-button>
    </el-row>

    <h3>朴素按钮</h3>
    <el-row class="mb-4">
      <el-button plain>朴素按钮</el-button>
      <el-button type="primary" plain>主要按钮</el-button>
      <el-button type="success" plain>成功按钮</el-button>
      <el-button type="info" plain>信息按钮</el-button>
      <el-button type="warning" plain>警告按钮</el-button>
      <el-button type="danger" plain>危险按钮</el-button>
    </el-row>

    <h3>圆角按钮</h3>
    <el-row class="mb-4">
      <el-button round>圆角按钮</el-button>
      <el-button type="primary" round>主要按钮</el-button>
      <el-button type="success" round>成功按钮</el-button>
      <el-button type="info" round>信息按钮</el-button>
      <el-button type="warning" round>警告按钮</el-button>
      <el-button type="danger" round>危险按钮</el-button>
    </el-row>

    <h3>圆形图标按钮</h3>
    <el-row class="mb-4">
      <el-button :icon="Search" circle />
      <el-button type="primary" :icon="Edit" circle />
      <el-button type="success" :icon="Check" circle />
      <el-button type="info" :icon="Message" circle />
      <el-button type="warning" :icon="Star" circle />
      <el-button type="danger" :icon="Delete" circle />
    </el-row>

    <h3>加载状态</h3>
    <el-row class="mb-4">
      <el-button loading>加载中</el-button>
      <el-button type="primary" loading>保存中</el-button>
      <el-button type="success" :loading="isLoading" @click="handleSubmit">
        提交
      </el-button>
    </el-row>

    <h3>禁用状态</h3>
    <el-row class="mb-4">
      <el-button disabled>禁用按钮</el-button>
      <el-button type="primary" disabled>主要按钮</el-button>
      <el-button type="success" disabled>成功按钮</el-button>
    </el-row>

    <h3>不同尺寸</h3>
    <el-row class="mb-4">
      <el-button size="large">大型按钮</el-button>
      <el-button>默认按钮</el-button>
      <el-button size="small">小型按钮</el-button>
    </el-row>

    <h3>文字按钮</h3>
    <el-row class="mb-4">
      <el-button text>文字按钮</el-button>
      <el-button text type="primary">主要文字按钮</el-button>
      <el-button text type="danger">危险文字按钮</el-button>
      <el-button text :icon="Edit">编辑</el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Search, Edit, Check, Message, Star, Delete 
} from '@element-plus/icons-vue'

const isLoading = ref(false)

const handleSubmit = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}
</script>

<style scoped>
.button-demo {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 20px;
}

.el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #303133;
}
</style>
```

---

## 完整样例二：操作按钮组

### 效果描述
实际业务场景中的操作按钮组，包括表格操作、表单操作、工具栏等。

### 完整代码

```vue
<template>
  <div class="action-buttons-demo">
    <el-card class="mb-4">
      <template #header>
        <span>表格操作按钮</span>
      </template>
      <el-space>
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增
        </el-button>
        <el-button type="success" :icon="Download" @click="handleExport">
          导出
        </el-button>
        <el-button type="warning" :icon="Upload" @click="handleImport">
          导入
        </el-button>
        <el-button type="danger" :icon="Delete" :disabled="!hasSelection" @click="handleBatchDelete">
          批量删除
        </el-button>
      </el-space>
    </el-card>

    <el-card class="mb-4">
      <template #header>
        <span>行内操作按钮</span>
      </template>
      <div class="table-row-actions">
        <span>用户：张三</span>
        <el-button-group>
          <el-button type="primary" :icon="View" size="small">查看</el-button>
          <el-button type="success" :icon="Edit" size="small">编辑</el-button>
          <el-button type="danger" :icon="Delete" size="small">删除</el-button>
        </el-button-group>
      </div>
    </el-card>

    <el-card class="mb-4">
      <template #header>
        <span>表单操作按钮</span>
      </template>
      <div class="form-actions">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handleFormSubmit">
          {{ isSubmitting ? '提交中...' : '提交' }}
        </el-button>
      </div>
    </el-card>

    <el-card>
      <template #header>
        <span>工具栏按钮</span>
      </template>
      <div class="toolbar">
        <el-button-group>
          <el-button :icon="Back">返回</el-button>
          <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
          <el-button :icon="Setting">设置</el-button>
        </el-button-group>
        
        <el-space style="margin-left: auto;">
          <el-button text :icon="Question">帮助</el-button>
          <el-button text :icon="More">更多</el-button>
        </el-space>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Plus, Download, Upload, Delete, View, Edit,
  Back, Refresh, Setting, Question, More
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const hasSelection = ref(false)
const isSubmitting = ref(false)

const handleAdd = () => {
  ElMessage.success('打开新增弹窗')
}

const handleExport = () => {
  ElMessage.success('导出数据')
}

const handleImport = () => {
  ElMessage.success('打开导入弹窗')
}

const handleBatchDelete = () => {
  ElMessage.warning('批量删除操作')
}

const handleReset = () => {
  ElMessage.info('重置表单')
}

const handleFormSubmit = () => {
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    ElMessage.success('提交成功')
  }, 1500)
}

const handleRefresh = () => {
  ElMessage.success('刷新数据')
}
</script>

<style scoped>
.action-buttons-demo {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 20px;
}

.table-row-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.toolbar {
  display: flex;
  align-items: center;
}
</style>
```

---

## 完整样例三：自定义图标集成

### 效果描述
集成自定义 SVG 图标和 iconify 图标库。

### 完整代码

```vue
<template>
  <div class="custom-icon-demo">
    <h3>Element Plus 内置图标</h3>
    <el-space wrap>
      <el-button :icon="User">用户</el-button>
      <el-button :icon="House">首页</el-button>
      <el-button :icon="Setting">设置</el-button>
      <el-button :icon="Document">文档</el-button>
    </el-space>

    <h3>自定义 SVG 图标</h3>
    <el-space wrap>
      <el-button>
        <template #icon>
          <CustomIcon />
        </template>
        自定义图标
      </el-button>
      <el-icon :size="24" color="#409eff">
        <CustomIcon />
      </el-icon>
    </el-space>

    <h3>图标尺寸和颜色</h3>
    <el-space wrap>
      <el-icon :size="16" color="#409eff"><Star /></el-icon>
      <el-icon :size="20" color="#67c23a"><Star /></el-icon>
      <el-icon :size="24" color="#e6a23c"><Star /></el-icon>
      <el-icon :size="32" color="#f56c6c"><Star /></el-icon>
    </el-space>

    <h3>图标加载动画</h3>
    <el-space wrap>
      <el-icon class="is-loading" :size="24">
        <Loading />
      </el-icon>
      <el-button :loading="true">加载中</el-button>
    </el-space>
  </div>
</template>

<script setup lang="ts">
import { User, House, Setting, Document, Star, Loading } from '@element-plus/icons-vue'
import CustomIcon from './CustomIcon.vue'
</script>

<style scoped>
.custom-icon-demo {
  padding: 20px;
}

h3 {
  margin-top: 20px;
  margin-bottom: 10px;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
```

**CustomIcon.vue（自定义图标组件）**：

```vue
<template>
  <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="currentColor"
      d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"
    />
    <path
      fill="currentColor"
      d="M512 140c-205.4 0-372 166.6-372 372s166.6 372 372 372 372-166.6 372-372-166.6-372-372-372zm0 684c-172.3 0-312-139.7-312-312s139.7-312 312-312 312 139.7 312 312-139.7 312-312 312z"
    />
  </svg>
</template>

<script setup lang="ts">
// 自定义 SVG 图标
</script>
```

---

## 常见踩坑

### 1. 按钮点击事件失效

**问题**：按钮设置了 `disabled` 或 `loading` 后点击事件不触发

**原因**：这是预期行为，禁用和加载状态下按钮不可点击

**解决方案**：
```vue
<!-- ❌ 错误：loading 时仍想触发点击 -->
<el-button :loading="isLoading" @click="handleClick">
  提交
</el-button>

<!-- ✅ 正确：在点击时设置 loading -->
<el-button :loading="isLoading" @click="handleSubmit">
  提交
</el-button>

<script setup lang="ts">
const handleSubmit = async () => {
  isLoading.value = true
  try {
    await submitData()
  } finally {
    isLoading.value = false
  }
}
</script>
```

### 2. 图标不显示

**问题**：使用 `:icon="'Edit'"` 图标不显示

**原因**：icon 属性接收的是组件，不是字符串

**解决方案**：
```vue
<script setup lang="ts">
import { Edit } from '@element-plus/icons-vue'
</script>

<!-- ❌ 错误 -->
<el-button :icon="'Edit'">编辑</el-button>

<!-- ✅ 正确 -->
<el-button :icon="Edit">编辑</el-button>
```

### 3. 按钮组间距问题

**问题**：多个按钮之间没有间距

**解决方案**：
```vue
<!-- 方式一：使用 el-space -->
<el-space>
  <el-button>按钮1</el-button>
  <el-button>按钮2</el-button>
</el-space>

<!-- 方式二：使用 CSS -->
<style>
.el-button {
  margin-right: 10px;
}
</style>
```

### 4. 按钮宽度不一致

**问题**：多个按钮宽度不统一

**解决方案**：
```vue
<el-button style="width: 100px;">按钮1</el-button>
<el-button style="width: 100px;">按钮2</el-button>

<!-- 或使用 CSS -->
<style>
.fixed-width-btn {
  width: 100px;
}
</style>
```

---

## 最佳实践

### 1. 按钮类型语义化

```vue
<!-- ✅ 推荐：根据操作类型选择颜色 -->
<el-button type="primary">新增</el-button>  <!-- 主要操作 -->
<el-button type="success">保存</el-button>  <!-- 成功操作 -->
<el-button type="warning">编辑</el-button>  <!-- 警告操作 -->
<el-button type="danger">删除</el-button>   <!-- 危险操作 -->
<el-button type="info">查看</el-button>     <!-- 信息展示 -->

<!-- ❌ 不推荐：滥用颜色 -->
<el-button type="danger">查看详情</el-button>
```

### 2. 禁用状态管理

```vue
<script setup lang="ts">
import { computed } from 'vue'

const selectedItems = ref([])
const canDelete = computed(() => selectedItems.value.length > 0)
</script>

<template>
  <el-button 
    type="danger" 
    :disabled="!canDelete"
    @click="handleDelete"
  >
    删除
  </el-button>
</template>
```

### 3. 加载状态最佳实践

```vue
<script setup lang="ts">
const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (isSubmitting.value) return // 防止重复提交
  
  isSubmitting.value = true
  try {
    await api.submit(formData.value)
    ElMessage.success('提交成功')
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <el-button 
    type="primary" 
    :loading="isSubmitting"
    @click="handleSubmit"
  >
    {{ isSubmitting ? '提交中...' : '提交' }}
  </el-button>
</template>
```

### 4. 图标按钮使用

```vue
<!-- 有文字时，图标在左侧 -->
<el-button :icon="Search">搜索</el-button>

<!-- 纯图标按钮，使用 circle -->
<el-button :icon="Edit" circle />

<!-- 工具栏图标按钮，使用 text -->
<el-button text :icon="Setting">设置</el-button>
```

### 5. 按钮组合使用

```vue
<!-- 主次操作明确 -->
<div class="button-group">
  <el-button>取消</el-button>
  <el-button type="primary">确定</el-button>
</div>

<style>
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
```

---

## 参考资料

- [Element Plus Button 按钮](https://element-plus.org/zh-CN/component/button.html)
- [Element Plus Icon 图标](https://element-plus.org/zh-CN/component/icon.html)
- [Element Plus Icons 图标库](https://element-plus.org/zh-CN/component/icon.html#icon-collection)

---

## 下一步

继续学习其他基础组件：[链接与文字组件](./content-4.md)
