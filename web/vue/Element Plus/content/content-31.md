# TypeScript 类型支持

## 概述

Element Plus 使用 TypeScript 开发，提供完整的类型定义。本章介绍如何在 TypeScript 项目中正确使用 Element Plus，包括类型导入、类型推断、泛型组件等。

## 核心类型

### 1. 组件实例类型

获取组件实例类型，用于 ref 引用。

### 2. 组件 Props 类型

定义组件属性的类型。

### 3. 表单相关类型

表单、表单项、验证规则等类型。

### 4. 事件处理类型

组件事件回调的类型定义。

## 完整实战样例

### 示例 1：表单类型定义

完整的表单 TypeScript 类型定义。

```vue
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="120px"
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="formData.username" />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input v-model="formData.email" />
    </el-form-item>

    <el-form-item label="角色" prop="roles">
      <el-select v-model="formData.roles" multiple style="width: 100%">
        <el-option
          v-for="role in roleOptions"
          :key="role.value"
          :label="role.label"
          :value="role.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">
        提交
      </el-button>
      <el-button @click="handleReset">
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 表单数据类型定义
interface UserForm {
  username: string
  email: string
  roles: string[]
}

// 选项类型定义
interface SelectOption {
  label: string
  value: string
}

// 表单实例引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<UserForm>({
  username: '',
  email: '',
  roles: []
})

// 选项数据
const roleOptions: SelectOption[] = [
  { label: '管理员', value: 'admin' },
  { label: '编辑', value: 'editor' },
  { label: '访客', value: 'viewer' }
]

// 验证规则
const rules: FormRules<UserForm> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确的邮箱格式',
      trigger: ['blur', 'change']
    }
  ],
  roles: [
    {
      type: 'array',
      required: true,
      message: '请至少选择一个角色',
      trigger: 'change'
    }
  ]
}

// 提交处理
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    console.log('表单数据:', formData)
    ElMessage.success('提交成功')
  } catch (error) {
    ElMessage.error('请检查表单填写')
  }
}

// 重置处理
const handleReset = () => {
  formRef.value?.resetFields()
}
</script>
```

---

### 示例 2：表格类型定义

表格数据和列配置的类型定义。

```vue
<template>
  <div>
    <el-table
      ref="tableRef"
      :data="tableData"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)">
            {{ getRoleLabel(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 16px">
      已选择：{{ selectedRows.length }} 条
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { TableInstance } from 'element-plus'

// 用户角色枚举
enum UserRole {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer'
}

// 用户数据类型
interface User {
  id: number
  name: string
  email: string
  role: UserRole
  createTime: string
}

// Tag 类型映射
type TagType = 'success' | 'warning' | 'info' | 'danger'

// 表格实例引用
const tableRef = ref<TableInstance>()

// 表格数据
const tableData = ref<User[]>([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: UserRole.Admin,
    createTime: '2024-01-15'
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: UserRole.Editor,
    createTime: '2024-01-16'
  }
])

// 选中的行
const selectedRows = ref<User[]>([])

// 获取角色类型
const getRoleType = (role: UserRole): TagType => {
  const typeMap: Record<UserRole, TagType> = {
    [UserRole.Admin]: 'danger',
    [UserRole.Editor]: 'warning',
    [UserRole.Viewer]: 'info'
  }
  return typeMap[role]
}

// 获取角色标签
const getRoleLabel = (role: UserRole): string => {
  const labelMap: Record<UserRole, string> = {
    [UserRole.Admin]: '管理员',
    [UserRole.Editor]: '编辑',
    [UserRole.Viewer]: '访客'
  }
  return labelMap[role]
}

// 选择变化处理
const handleSelectionChange = (selection: User[]) => {
  selectedRows.value = selection
}

// 编辑处理
const handleEdit = (row: User) => {
  ElMessage.info(`编辑用户：${row.name}`)
}

// 删除处理
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}
</script>
```

---

### 示例 3：API 请求类型定义

完整的 API 请求和响应类型定义。

```ts
// types/api.ts

// 通用响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页参数
export interface PageParams {
  page: number
  pageSize: number
}

// 分页响应
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  role: string
  status: number
  createTime: string
  updateTime: string
}

export interface CreateUserParams {
  username: string
  email: string
  password: string
  role: string
}

export interface UpdateUserParams {
  id: number
  username?: string
  email?: string
  avatar?: string
  role?: string
  status?: number
}

export interface UserListParams extends PageParams {
  keyword?: string
  role?: string
  status?: number
}
```

```ts
// api/user.ts
import request from '@/utils/request'
import type {
  ApiResponse,
  User,
  CreateUserParams,
  UpdateUserParams,
  UserListParams,
  PageResult
} from '@/types/api'

// 获取用户列表
export const getUserList = (
  params: UserListParams
): Promise<ApiResponse<PageResult<User>>> => {
  return request.get('/api/users', { params })
}

// 获取用户详情
export const getUserDetail = (id: number): Promise<ApiResponse<User>> => {
  return request.get(`/api/users/${id}`)
}

// 创建用户
export const createUser = (
  data: CreateUserParams
): Promise<ApiResponse<User>> => {
  return request.post('/api/users', data)
}

// 更新用户
export const updateUser = (
  data: UpdateUserParams
): Promise<ApiResponse<User>> => {
  return request.put(`/api/users/${data.id}`, data)
}

// 删除用户
export const deleteUser = (id: number): Promise<ApiResponse<void>> => {
  return request.delete(`/api/users/${id}`)
}
```

```vue
<!-- 使用示例 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserList, createUser } from '@/api/user'
import type { User, UserListParams, CreateUserParams } from '@/types/api'

const loading = ref(false)
const users = ref<User[]>([])
const total = ref(0)

const queryParams = ref<UserListParams>({
  page: 1,
  pageSize: 10,
  keyword: '',
  role: '',
  status: undefined
})

// 加载用户列表
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await getUserList(queryParams.value)
    if (response.code === 200) {
      users.value = response.data.list
      total.value = response.data.total
    }
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 创建用户
const handleCreate = async () => {
  const params: CreateUserParams = {
    username: 'newuser',
    email: 'newuser@example.com',
    password: '123456',
    role: 'editor'
  }

  try {
    const response = await createUser(params)
    if (response.code === 200) {
      ElMessage.success('创建成功')
      await loadUsers()
    }
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

onMounted(() => {
  loadUsers()
})
</script>
```

---

### 示例 4：泛型组件封装

封装可复用的泛型组件。

```vue
<!-- components/DataTable.vue -->
<template>
  <div class="data-table">
    <div class="table-header">
      <slot name="header" :selected="selectedRows" :refresh="loadData">
        <el-button type="primary" @click="loadData">刷新</el-button>
      </slot>
    </div>

    <el-table
      v-loading="loading"
      :data="data"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="showSelection" type="selection" width="55" />
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        v-bind="column"
      >
        <template v-if="column.slot" #default="scope">
          <slot :name="column.slot" v-bind="scope" />
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="showPagination"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, watch } from 'vue'

// 列配置类型
interface TableColumn {
  prop: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  slot?: string
}

// Props 定义
interface Props {
  columns: TableColumn[]
  loadData: (params: { page: number; pageSize: number }) => Promise<{
    list: T[]
    total: number
  }>
  showSelection?: boolean
  showPagination?: boolean
  defaultPageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  showSelection: false,
  showPagination: true,
  defaultPageSize: 10
})

// Emits 定义
interface Emits {
  (e: 'selection-change', selection: T[]): void
}

const emit = defineEmits<Emits>()

const loading = ref(false)
const data = ref<T[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(props.defaultPageSize)
const selectedRows = ref<T[]>([])

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const result = await props.loadData({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    data.value = result.list
    total.value = result.total
  } finally {
    loading.value = false
  }
}

// 选择变化
const handleSelectionChange = (selection: T[]) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

// 页码变化
const handlePageChange = () => {
  loadData()
}

// 页大小变化
const handleSizeChange = () => {
  currentPage.value = 1
  loadData()
}

// 初始加载
loadData()

// 暴露方法
defineExpose({
  refresh: loadData,
  clearSelection: () => {
    selectedRows.value = []
  }
})
</script>
```

```vue
<!-- 使用泛型组件 -->
<template>
  <DataTable
    :columns="columns"
    :load-data="loadUsers"
    show-selection
    @selection-change="handleSelectionChange"
  >
    <template #header="{ selected, refresh }">
      <el-space>
        <el-button type="primary" @click="refresh">刷新</el-button>
        <el-button
          type="danger"
          :disabled="selected.length === 0"
          @click="handleBatchDelete"
        >
          批量删除（{{ selected.length }}）
        </el-button>
      </el-space>
    </template>

    <template #role="{ row }">
      <el-tag>{{ row.role }}</el-tag>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import DataTable from '@/components/DataTable.vue'
import type { User } from '@/types/api'

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'email', label: '邮箱' },
  { prop: 'role', label: '角色', slot: 'role', width: 120 }
]

const loadUsers = async (params: { page: number; pageSize: number }) => {
  // 调用 API
  const response = await getUserList(params)
  return {
    list: response.data.list,
    total: response.data.total
  }
}

const handleSelectionChange = (selected: User[]) => {
  console.log('选中的用户:', selected)
}

const handleBatchDelete = () => {
  // 批量删除逻辑
}
</script>
```

---

## 常见类型问题

### 1. 组件实例类型获取

```ts
import type { ElForm, ElTable } from 'element-plus'

// 错误方式
const formRef = ref<typeof ElForm>() // ❌

// 正确方式
const formRef = ref<InstanceType<typeof ElForm>>() // ✅
```

### 2. 表单验证规则类型

```ts
import type { FormRules } from 'element-plus'

// 使用泛型指定表单数据类型
interface UserForm {
  username: string
  email: string
}

const rules: FormRules<UserForm> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ]
}
```

### 3. 事件处理类型

```ts
// 表格选择事件
const handleSelectionChange = (selection: User[]) => {
  // selection 自动推断为 User[]
}

// 分页事件
const handleCurrentChange = (page: number) => {
  // page 类型为 number
}
```

---

## 最佳实践

### 1. 使用类型别名

```ts
// types/element-plus.ts
import type {
  FormInstance,
  FormRules,
  TableInstance
} from 'element-plus'

export type ElFormInstance = FormInstance
export type ElFormRules<T = any> = FormRules<T>
export type ElTableInstance = TableInstance
```

### 2. 严格的 TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 3. 使用 JSDoc 增强提示

```ts
/**
 * 加载用户列表
 * @param params 查询参数
 * @returns 用户列表和总数
 */
export const getUserList = async (
  params: UserListParams
): Promise<ApiResponse<PageResult<User>>> => {
  // ...
}
```

---

## 参考资料

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Vue 3 TypeScript 支持](https://cn.vuejs.org/guide/typescript/overview.html)
- [Element Plus TypeScript](https://element-plus.org/zh-CN/guide/typescript.html)
