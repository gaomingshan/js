# 组件二次封装

## 概述

基于 Element Plus 进行二次封装，提供符合业务需求的通用组件，提高开发效率和代码复用性。本章介绍组件封装的原则、方法和最佳实践。

## 封装原则

### 1. 单一职责

每个组件只负责一个功能模块。

### 2. 可配置性

通过 props 提供灵活的配置选项。

### 3. 易用性

简化常用场景的使用方式。

### 4. 扩展性

保留扩展能力，支持插槽和事件。

## 完整实战样例

### 示例 1：搜索表单封装

封装通用的搜索表单组件。

```vue
<!-- components/SearchForm.vue -->
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :inline="inline"
    :label-width="labelWidth"
    class="search-form"
  >
    <el-form-item
      v-for="item in fields"
      :key="item.prop"
      :label="item.label"
      :prop="item.prop"
    >
      <!-- 输入框 -->
      <el-input
        v-if="item.type === 'input'"
        v-model="formData[item.prop]"
        :placeholder="item.placeholder || `请输入${item.label}`"
        clearable
      />

      <!-- 选择器 -->
      <el-select
        v-else-if="item.type === 'select'"
        v-model="formData[item.prop]"
        :placeholder="item.placeholder || `请选择${item.label}`"
        clearable
        style="width: 100%"
      >
        <el-option
          v-for="option in item.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>

      <!-- 日期选择器 -->
      <el-date-picker
        v-else-if="item.type === 'date'"
        v-model="formData[item.prop]"
        type="date"
        :placeholder="item.placeholder || `请选择${item.label}`"
        clearable
        style="width: 100%"
      />

      <!-- 日期范围选择器 -->
      <el-date-picker
        v-else-if="item.type === 'daterange'"
        v-model="formData[item.prop]"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        clearable
        style="width: 100%"
      />

      <!-- 自定义插槽 -->
      <slot v-else-if="item.type === 'slot'" :name="item.prop" :form="formData" />
    </el-form-item>

    <el-form-item>
      <el-space>
        <el-button type="primary" :loading="loading" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
        <slot name="actions" :form="formData" />
      </el-space>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

interface SelectOption {
  label: string
  value: any
}

interface FormField {
  prop: string
  label: string
  type: 'input' | 'select' | 'date' | 'daterange' | 'slot'
  placeholder?: string
  options?: SelectOption[]
  defaultValue?: any
}

interface Props {
  fields: FormField[]
  inline?: boolean
  labelWidth?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  inline: true,
  labelWidth: '80px',
  loading: false
})

interface Emits {
  (e: 'search', data: Record<string, any>): void
  (e: 'reset'): void
}

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const formData = reactive<Record<string, any>>({})

// 初始化表单数据
const initFormData = () => {
  props.fields.forEach(field => {
    formData[field.prop] = field.defaultValue ?? ''
  })
}

initFormData()

// 搜索
const handleSearch = () => {
  emit('search', { ...formData })
}

// 重置
const handleReset = () => {
  formRef.value?.resetFields()
  initFormData()
  emit('reset')
}

// 暴露方法
defineExpose({
  reset: handleReset,
  getFormData: () => ({ ...formData })
})
</script>

<style scoped>
.search-form {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
```

**使用示例：**

```vue
<template>
  <div>
    <SearchForm
      :fields="searchFields"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #status="{ form }">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </template>
    </SearchForm>

    <el-table :data="tableData" border style="margin-top: 16px">
      <!-- 表格列 -->
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchForm from '@/components/SearchForm.vue'

const loading = ref(false)
const tableData = ref([])

const searchFields = [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input' as const,
    placeholder: '请输入用户名或邮箱'
  },
  {
    prop: 'role',
    label: '角色',
    type: 'select' as const,
    options: [
      { label: '管理员', value: 'admin' },
      { label: '编辑', value: 'editor' }
    ]
  },
  {
    prop: 'dateRange',
    label: '创建时间',
    type: 'daterange' as const
  },
  {
    prop: 'status',
    label: '状态',
    type: 'slot' as const
  }
]

const handleSearch = async (data: any) => {
  console.log('搜索参数:', data)
  loading.value = true
  // 调用 API
  loading.value = false
}

const handleReset = () => {
  console.log('重置表单')
}
</script>
```

---

### 示例 2：表格组件封装

带分页的数据表格封装。

```vue
<!-- components/DataTable.vue -->
<template>
  <div class="data-table">
    <div v-if="$slots.toolbar" class="table-toolbar">
      <slot name="toolbar" :selected="selectedRows" :refresh="refresh" />
    </div>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      :border="border"
      :stripe="stripe"
      :highlight-current-row="highlightCurrentRow"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column
        v-if="showSelection"
        type="selection"
        width="55"
        fixed="left"
      />
      
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="60"
        align="center"
        fixed="left"
      />

      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :align="column.align || 'left'"
        :fixed="column.fixed"
        :sortable="column.sortable"
      >
        <template v-if="column.slot" #default="scope">
          <slot :name="column.slot" v-bind="scope" />
        </template>
        <template v-else-if="column.formatter" #default="scope">
          {{ column.formatter(scope.row, scope.column, scope.$index) }}
        </template>
      </el-table-column>

      <el-table-column
        v-if="$slots.actions"
        label="操作"
        :width="actionsWidth"
        :fixed="actionsFixed"
        align="center"
      >
        <template #default="scope">
          <slot name="actions" v-bind="scope" />
        </template>
      </el-table-column>
    </el-table>

    <div v-if="showPagination" class="table-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        background
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TableInstance } from 'element-plus'

interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right' | boolean
  sortable?: boolean | 'custom'
  slot?: string
  formatter?: (row: any, column: any, index: number) => string
}

interface Props {
  columns: TableColumn[]
  data?: any[]
  loading?: boolean
  border?: boolean
  stripe?: boolean
  highlightCurrentRow?: boolean
  showSelection?: boolean
  showIndex?: boolean
  showPagination?: boolean
  total?: number
  pageSize?: number
  currentPage?: number
  pageSizes?: number[]
  paginationLayout?: string
  actionsWidth?: string | number
  actionsFixed?: 'right' | boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  border: true,
  stripe: false,
  highlightCurrentRow: false,
  showSelection: false,
  showIndex: false,
  showPagination: true,
  total: 0,
  pageSize: 10,
  currentPage: 1,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  actionsWidth: 200,
  actionsFixed: 'right'
})

interface Emits {
  (e: 'selection-change', selection: any[]): void
  (e: 'sort-change', data: any): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'update:currentPage', page: number): void
  (e: 'update:pageSize', size: number): void
}

const emit = defineEmits<Emits>()

const tableRef = ref<TableInstance>()
const tableData = ref(props.data)
const selectedRows = ref<any[]>([])
const currentPage = ref(props.currentPage)
const pageSize = ref(props.pageSize)

watch(() => props.data, (newData) => {
  tableData.value = newData
})

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

const handleSortChange = (data: any) => {
  emit('sort-change', data)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  emit('update:currentPage', page)
  emit('page-change', page)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  emit('update:pageSize', size)
  emit('update:currentPage', 1)
  emit('size-change', size)
}

const refresh = () => {
  emit('page-change', currentPage.value)
}

defineExpose({
  refresh,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) => {
    tableRef.value?.toggleRowSelection(row, selected)
  }
})
</script>

<style scoped>
.data-table {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
}

.table-toolbar {
  margin-bottom: 16px;
}

.table-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
```

---

### 示例 3：对话框表单封装

统一的对话框表单组件。

```vue
<!-- components/DialogForm.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-width="labelWidth"
    >
      <slot :form="formData" />
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">{{ cancelText }}</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleConfirm">
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  modelValue: boolean
  title: string
  width?: string
  labelWidth?: string
  formData: Record<string, any>
  rules?: FormRules
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '600px',
  labelWidth: '100px',
  confirmText: '确定',
  cancelText: '取消'
})

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: Record<string, any>): void | Promise<void>
  (e: 'cancel'): void
  (e: 'closed'): void
}

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const visible = ref(props.modelValue)
const submitLoading = ref(false)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleConfirm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    const result = emit('confirm', props.formData)
    
    if (result instanceof Promise) {
      await result
    }
    
    visible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

const handleClosed = () => {
  formRef.value?.resetFields()
  emit('closed')
}

defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields()
})
</script>
```

**使用示例：**

```vue
<template>
  <div>
    <el-button type="primary" @click="handleAdd">新增用户</el-button>

    <DialogForm
      v-model="dialogVisible"
      :title="dialogTitle"
      :form-data="form"
      :rules="rules"
      @confirm="handleConfirm"
    >
      <template #default="{ form }">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="编辑" value="editor" />
          </el-select>
        </el-form-item>
      </template>
    </DialogForm>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import DialogForm from '@/components/DialogForm.vue'
import type { FormRules } from 'element-plus'

const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')

const form = reactive({
  username: '',
  email: '',
  role: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const handleAdd = () => {
  dialogTitle.value = '新增用户'
  Object.assign(form, {
    username: '',
    email: '',
    role: ''
  })
  dialogVisible.value = true
}

const handleConfirm = async (data: any) => {
  console.log('提交数据:', data)
  // 模拟 API 调用
  await new Promise(resolve => setTimeout(resolve, 1000))
  ElMessage.success('保存成功')
}
</script>
```

---

## 组件封装最佳实践

### 1. 保持简单

不要过度封装，只封装通用性强的组件。

### 2. 文档完善

为封装的组件编写详细文档和示例。

### 3. 类型支持

提供完整的 TypeScript 类型定义。

### 4. 测试覆盖

编写单元测试确保组件稳定性。

### 5. 版本管理

组件变更时做好版本管理和向后兼容。

---

## 参考资料

- [Vue 3 组件开发指南](https://cn.vuejs.org/guide/components/registration.html)
- [Element Plus 自定义主题](https://element-plus.org/zh-CN/guide/theming.html)
