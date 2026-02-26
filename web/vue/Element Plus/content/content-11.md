# 单选与多选组件

## 概述

Radio 和 Checkbox 是表单中最基础的选择组件。Radio 用于单选场景，Checkbox 用于多选场景。掌握它们的组合使用对于实现复杂的选择逻辑至关重要。

---

## Radio 单选框

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | string/number/boolean | - |
| label | 选项的值 | string/number/boolean | - |
| disabled | 是否禁用 | boolean | false |
| border | 是否显示边框 | boolean | false |
| size | 尺寸 | string (large/default/small) | default |

### RadioGroup 属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | string/number/boolean | - |
| size | 尺寸 | string | default |
| disabled | 是否禁用 | boolean | false |
| text-color | 按钮激活时的文本颜色 | string | #ffffff |
| fill | 按钮激活时的填充色和边框色 | string | #409eff |

---

## Checkbox 复选框

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | boolean/array | false |
| label | 选项的值 | string/number/boolean/object | - |
| true-label | 选中时的值 | string/number | - |
| false-label | 未选中时的值 | string/number | - |
| disabled | 是否禁用 | boolean | false |
| indeterminate | 设置不确定状态 | boolean | false |

### CheckboxGroup 属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | array | - |
| size | 尺寸 | string | default |
| disabled | 是否禁用 | boolean | false |
| min | 可被勾选的最小数量 | number | - |
| max | 可被勾选的最大数量 | number | - |

---

## 完整样例一：问卷调查

### 效果描述
实现一个完整的问卷调查表单，包含单选题、多选题、矩阵题等。

### 完整代码

```vue
<template>
  <div class="survey-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">用户满意度调查</h3>
      </template>
      
      <el-form :model="surveyForm" label-position="top">
        <!-- 单选题 -->
        <el-form-item label="1. 您的性别是？">
          <el-radio-group v-model="surveyForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 单选题（带边框） -->
        <el-form-item label="2. 您的年龄段是？">
          <el-radio-group v-model="surveyForm.age">
            <el-radio label="18-25" border>18-25岁</el-radio>
            <el-radio label="26-35" border>26-35岁</el-radio>
            <el-radio label="36-45" border>36-45岁</el-radio>
            <el-radio label="46+" border>46岁以上</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 单选按钮组 -->
        <el-form-item label="3. 您对我们的服务满意吗？">
          <el-radio-group v-model="surveyForm.satisfaction">
            <el-radio-button label="1">非常不满意</el-radio-button>
            <el-radio-button label="2">不满意</el-radio-button>
            <el-radio-button label="3">一般</el-radio-button>
            <el-radio-button label="4">满意</el-radio-button>
            <el-radio-button label="5">非常满意</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <!-- 多选题 -->
        <el-form-item label="4. 您经常使用哪些功能？（多选）">
          <el-checkbox-group v-model="surveyForm.features">
            <el-checkbox label="search">搜索</el-checkbox>
            <el-checkbox label="filter">筛选</el-checkbox>
            <el-checkbox label="sort">排序</el-checkbox>
            <el-checkbox label="export">导出</el-checkbox>
            <el-checkbox label="share">分享</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <!-- 多选题（带边框） -->
        <el-form-item label="5. 您希望改进哪些方面？（最多选3项）">
          <el-checkbox-group 
            v-model="surveyForm.improvements"
            :max="3"
          >
            <el-checkbox label="ui" border>界面设计</el-checkbox>
            <el-checkbox label="performance" border>性能优化</el-checkbox>
            <el-checkbox label="function" border>功能完善</el-checkbox>
            <el-checkbox label="stability" border>稳定性</el-checkbox>
            <el-checkbox label="security" border>安全性</el-checkbox>
          </el-checkbox-group>
          <el-text type="info" size="small" style="display: block; margin-top: 5px;">
            已选择 {{ surveyForm.improvements.length }}/3 项
          </el-text>
        </el-form-item>
        
        <!-- 多选按钮组 -->
        <el-form-item label="6. 您使用过哪些平台？">
          <el-checkbox-group v-model="surveyForm.platforms">
            <el-checkbox-button label="web">网页版</el-checkbox-button>
            <el-checkbox-button label="ios">iOS</el-checkbox-button>
            <el-checkbox-button label="android">Android</el-checkbox-button>
            <el-checkbox-button label="desktop">桌面版</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        
        <!-- 矩阵单选题 -->
        <el-form-item label="7. 请对以下功能进行评分">
          <el-table :data="matrixQuestions" border style="margin-top: 10px;">
            <el-table-column prop="feature" label="功能" width="150" />
            <el-table-column
              v-for="score in matrixScores"
              :key="score"
              :label="score"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-radio
                  v-model="surveyForm.matrix[row.key]"
                  :label="score"
                  style="margin: 0;"
                >
                  &nbsp;
                </el-radio>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        
        <!-- 是否同意 -->
        <el-form-item>
          <el-checkbox v-model="surveyForm.agree">
            我已阅读并同意《用户隐私协议》
          </el-checkbox>
        </el-form-item>
        
        <!-- 提交按钮 -->
        <el-form-item>
          <el-space>
            <el-button
              type="primary"
              @click="handleSubmitSurvey"
              :disabled="!surveyForm.agree"
            >
              提交问卷
            </el-button>
            <el-button @click="handleResetSurvey">重置</el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const surveyForm = reactive({
  gender: '',
  age: '',
  satisfaction: '',
  features: [] as string[],
  improvements: [] as string[],
  platforms: [] as string[],
  matrix: {
    ease: '',
    speed: '',
    design: '',
    stability: '',
  },
  agree: false,
})

const matrixQuestions = [
  { key: 'ease', feature: '易用性' },
  { key: 'speed', feature: '响应速度' },
  { key: 'design', feature: '界面设计' },
  { key: 'stability', feature: '稳定性' },
]

const matrixScores = ['很差', '差', '一般', '好', '很好']

const handleSubmitSurvey = () => {
  ElMessage.success('问卷提交成功，感谢您的参与！')
  console.log('问卷结果:', surveyForm)
}

const handleResetSurvey = () => {
  surveyForm.gender = ''
  surveyForm.age = ''
  surveyForm.satisfaction = ''
  surveyForm.features = []
  surveyForm.improvements = []
  surveyForm.platforms = []
  surveyForm.matrix = {
    ease: '',
    speed: '',
    design: '',
    stability: '',
  }
  surveyForm.agree = false
  ElMessage.info('问卷已重置')
}
</script>

<style scoped>
.survey-demo {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.el-radio,
.el-checkbox {
  margin-right: 20px;
}

.el-radio.is-bordered,
.el-checkbox.is-bordered {
  margin: 5px;
}
</style>
```

---

## 完整样例二：权限选择

### 效果描述
实现权限管理系统的权限选择功能，包括全选、反选、父子关联等。

### 完整代码

```vue
<template>
  <div class="permission-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3 style="margin: 0;">角色权限配置</h3>
          <el-space>
            <el-button size="small" @click="handleSelectAll">全选</el-button>
            <el-button size="small" @click="handleInvertSelection">反选</el-button>
            <el-button size="small" @click="handleClearSelection">清空</el-button>
          </el-space>
        </div>
      </template>
      
      <el-form label-width="100px">
        <!-- 角色选择 -->
        <el-form-item label="选择角色">
          <el-radio-group v-model="selectedRole" @change="handleRoleChange">
            <el-radio-button label="admin">管理员</el-radio-button>
            <el-radio-button label="editor">编辑</el-radio-button>
            <el-radio-button label="viewer">访客</el-radio-button>
            <el-radio-button label="custom">自定义</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-divider />
        
        <!-- 权限列表 -->
        <div v-for="module in permissionModules" :key="module.name" class="module-section">
          <el-form-item>
            <template #label>
              <el-checkbox
                v-model="module.checked"
                :indeterminate="module.indeterminate"
                @change="handleModuleCheck(module)"
              >
                <strong>{{ module.label }}</strong>
              </el-checkbox>
            </template>
            
            <el-checkbox-group
              v-model="selectedPermissions"
              @change="handlePermissionChange"
            >
              <el-checkbox
                v-for="permission in module.permissions"
                :key="permission.value"
                :label="permission.value"
                :disabled="permission.disabled"
              >
                {{ permission.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>
        
        <el-divider />
        
        <!-- 已选权限展示 -->
        <el-form-item label="已选权限">
          <el-space wrap>
            <el-tag
              v-for="permission in selectedPermissions"
              :key="permission"
              closable
              @close="handleRemovePermission(permission)"
            >
              {{ getPermissionLabel(permission) }}
            </el-tag>
          </el-space>
          <el-text v-if="selectedPermissions.length === 0" type="info">
            暂无选中权限
          </el-text>
        </el-form-item>
        
        <!-- 权限说明 -->
        <el-form-item label="权限说明">
          <el-alert
            type="info"
            :closable="false"
            show-icon
          >
            <template #title>
              <div>当前已选择 {{ selectedPermissions.length }} 项权限</div>
            </template>
          </el-alert>
        </el-form-item>
        
        <!-- 保存按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSavePermissions">
            保存权限
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

interface Permission {
  value: string
  label: string
  disabled?: boolean
}

interface Module {
  name: string
  label: string
  checked: boolean
  indeterminate: boolean
  permissions: Permission[]
}

const selectedRole = ref('custom')
const selectedPermissions = ref<string[]>([])

const permissionModules = reactive<Module[]>([
  {
    name: 'user',
    label: '用户管理',
    checked: false,
    indeterminate: false,
    permissions: [
      { value: 'user:view', label: '查看用户' },
      { value: 'user:add', label: '新增用户' },
      { value: 'user:edit', label: '编辑用户' },
      { value: 'user:delete', label: '删除用户' },
    ],
  },
  {
    name: 'content',
    label: '内容管理',
    checked: false,
    indeterminate: false,
    permissions: [
      { value: 'content:view', label: '查看内容' },
      { value: 'content:add', label: '新增内容' },
      { value: 'content:edit', label: '编辑内容' },
      { value: 'content:delete', label: '删除内容' },
      { value: 'content:publish', label: '发布内容' },
    ],
  },
  {
    name: 'system',
    label: '系统设置',
    checked: false,
    indeterminate: false,
    permissions: [
      { value: 'system:view', label: '查看设置' },
      { value: 'system:config', label: '配置系统' },
      { value: 'system:log', label: '查看日志' },
      { value: 'system:backup', label: '备份数据', disabled: false },
    ],
  },
])

// 预设角色权限
const rolePermissions: Record<string, string[]> = {
  admin: [
    'user:view', 'user:add', 'user:edit', 'user:delete',
    'content:view', 'content:add', 'content:edit', 'content:delete', 'content:publish',
    'system:view', 'system:config', 'system:log', 'system:backup',
  ],
  editor: [
    'user:view',
    'content:view', 'content:add', 'content:edit', 'content:publish',
    'system:view',
  ],
  viewer: [
    'user:view',
    'content:view',
    'system:view',
  ],
}

// 角色切换
const handleRoleChange = (role: string) => {
  if (role !== 'custom') {
    selectedPermissions.value = [...rolePermissions[role]]
    updateModuleStatus()
  }
}

// 模块全选/取消
const handleModuleCheck = (module: Module) => {
  const modulePermissions = module.permissions.map(p => p.value)
  
  if (module.checked) {
    // 全选该模块
    modulePermissions.forEach(p => {
      if (!selectedPermissions.value.includes(p)) {
        selectedPermissions.value.push(p)
      }
    })
  } else {
    // 取消该模块
    selectedPermissions.value = selectedPermissions.value.filter(
      p => !modulePermissions.includes(p)
    )
  }
  
  updateModuleStatus()
}

// 权限变化
const handlePermissionChange = () => {
  selectedRole.value = 'custom'
  updateModuleStatus()
}

// 更新模块状态
const updateModuleStatus = () => {
  permissionModules.forEach(module => {
    const modulePermissions = module.permissions.map(p => p.value)
    const checkedCount = modulePermissions.filter(p =>
      selectedPermissions.value.includes(p)
    ).length
    
    module.checked = checkedCount === modulePermissions.length
    module.indeterminate = checkedCount > 0 && checkedCount < modulePermissions.length
  })
}

// 全选
const handleSelectAll = () => {
  const allPermissions = permissionModules.flatMap(m =>
    m.permissions.filter(p => !p.disabled).map(p => p.value)
  )
  selectedPermissions.value = allPermissions
  updateModuleStatus()
}

// 反选
const handleInvertSelection = () => {
  const allPermissions = permissionModules.flatMap(m =>
    m.permissions.filter(p => !p.disabled).map(p => p.value)
  )
  selectedPermissions.value = allPermissions.filter(
    p => !selectedPermissions.value.includes(p)
  )
  updateModuleStatus()
}

// 清空
const handleClearSelection = () => {
  selectedPermissions.value = []
  updateModuleStatus()
}

// 移除权限
const handleRemovePermission = (permission: string) => {
  selectedPermissions.value = selectedPermissions.value.filter(p => p !== permission)
  updateModuleStatus()
}

// 获取权限标签
const getPermissionLabel = (value: string) => {
  for (const module of permissionModules) {
    const permission = module.permissions.find(p => p.value === value)
    if (permission) return permission.label
  }
  return value
}

// 保存权限
const handleSavePermissions = () => {
  ElMessage.success('权限保存成功')
  console.log('已选权限:', selectedPermissions.value)
}

// 初始化模块状态
watch(selectedPermissions, () => {
  updateModuleStatus()
}, { immediate: true })
</script>

<style scoped>
.permission-demo {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.module-section {
  margin-bottom: 20px;
}

.el-checkbox {
  margin-right: 20px;
  margin-bottom: 10px;
}
</style>
```

---

## 完整样例三：全选/反选逻辑

### 效果描述
展示复杂的全选、反选、部分选中等逻辑实现。

### 完整代码

```vue
<template>
  <div class="checkbox-logic-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">数据批量操作</h3>
      </template>
      
      <!-- 操作工具栏 -->
      <div class="toolbar">
        <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >
          全选
        </el-checkbox>
        
        <el-space>
          <el-text type="info">
            已选择 {{ checkedItems.length }} / {{ items.length }} 项
          </el-text>
          <el-button
            size="small"
            :disabled="checkedItems.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
          <el-button
            size="small"
            :disabled="checkedItems.length === 0"
            @click="handleBatchExport"
          >
            批量导出
          </el-button>
        </el-space>
      </div>
      
      <el-divider />
      
      <!-- 数据列表 -->
      <el-checkbox-group v-model="checkedItems" @change="handleCheckedItemsChange">
        <div v-for="item in items" :key="item.id" class="item-row">
          <el-checkbox :label="item.id" :disabled="item.disabled">
            <div class="item-content">
              <el-avatar :size="40" :src="item.avatar" />
              <div class="item-info">
                <el-text>{{ item.name }}</el-text>
                <el-text type="info" size="small">{{ item.email }}</el-text>
              </div>
              <el-tag :type="item.status === 'active' ? 'success' : 'info'" size="small">
                {{ item.status === 'active' ? '正常' : '禁用' }}
              </el-tag>
            </div>
          </el-checkbox>
        </div>
      </el-checkbox-group>
      
      <!-- 分页选择 -->
      <el-divider />
      
      <div class="pagination-checkbox">
        <el-checkbox v-model="selectAllPages">
          选择全部 {{ totalItems }} 项（跨页选择）
        </el-checkbox>
        <el-text v-if="selectAllPages" type="warning" size="small">
          已选择全部数据，包含其他页面
        </el-text>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Item {
  id: number
  name: string
  email: string
  avatar: string
  status: string
  disabled?: boolean
}

const items = ref<Item[]>([
  { id: 1, name: '张三', email: 'zhangsan@example.com', avatar: 'https://via.placeholder.com/40', status: 'active' },
  { id: 2, name: '李四', email: 'lisi@example.com', avatar: 'https://via.placeholder.com/40', status: 'active' },
  { id: 3, name: '王五', email: 'wangwu@example.com', avatar: 'https://via.placeholder.com/40', status: 'inactive' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', avatar: 'https://via.placeholder.com/40', status: 'active' },
  { id: 5, name: '孙七', email: 'sunqi@example.com', avatar: 'https://via.placeholder.com/40', status: 'active', disabled: true },
])

const checkedItems = ref<number[]>([])
const checkAll = ref(false)
const selectAllPages = ref(false)
const totalItems = ref(100)

// 是否部分选中
const isIndeterminate = computed(() => {
  const checkedCount = checkedItems.value.length
  const enabledCount = items.value.filter(item => !item.disabled).length
  return checkedCount > 0 && checkedCount < enabledCount
})

// 全选/取消全选
const handleCheckAllChange = (val: boolean) => {
  if (val) {
    checkedItems.value = items.value
      .filter(item => !item.disabled)
      .map(item => item.id)
  } else {
    checkedItems.value = []
  }
}

// 选项变化
const handleCheckedItemsChange = (value: number[]) => {
  const enabledCount = items.value.filter(item => !item.disabled).length
  checkAll.value = value.length === enabledCount
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${checkedItems.value.length} 项吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    ElMessage.success(`已删除 ${checkedItems.value.length} 项`)
    // 删除逻辑
    checkedItems.value = []
  } catch {
    // 取消删除
  }
}

// 批量导出
const handleBatchExport = () => {
  ElMessage.success(`正在导出 ${checkedItems.value.length} 项数据`)
  console.log('导出数据:', checkedItems.value)
}
</script>

<style scoped>
.checkbox-logic-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.item-row {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.item-row:hover {
  background-color: #f5f7fa;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pagination-checkbox {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
```

---

## 常见踩坑

### 1. Radio 绑定值类型不匹配

**问题**：Radio 的 label 和 v-model 类型不一致导致选中失效

**解决方案**：
```vue
<!-- ❌ 错误：类型不匹配 -->
<el-radio-group v-model="value">  <!-- value: number -->
  <el-radio label="1">选项1</el-radio>  <!-- label: string -->
</el-radio-group>

<!-- ✅ 正确：类型一致 -->
<el-radio-group v-model="value">  <!-- value: number -->
  <el-radio :label="1">选项1</el-radio>  <!-- label: number -->
</el-radio-group>
```

### 2. Checkbox 全选逻辑错误

**问题**：全选时包含了禁用项

**解决方案**：
```ts
const handleCheckAll = (val: boolean) => {
  if (val) {
    // 只选中未禁用的项
    checkedItems.value = items.value
      .filter(item => !item.disabled)
      .map(item => item.id)
  } else {
    checkedItems.value = []
  }
}
```

### 3. indeterminate 状态不更新

**问题**：部分选中状态未正确显示

**解决方案**：
```ts
const isIndeterminate = computed(() => {
  const count = checkedItems.value.length
  const total = items.value.filter(item => !item.disabled).length
  return count > 0 && count < total
})
```

### 4. CheckboxGroup 最大数量限制失效

**问题**：设置 max 后仍然可以选择更多

**解决方案**：
```vue
<!-- ✅ 正确使用 max 属性 -->
<el-checkbox-group v-model="selected" :max="3">
  <el-checkbox v-for="item in items" :key="item" :label="item" />
</el-checkbox-group>
```

---

## 最佳实践

### 1. 单选组件化

```vue
<!-- RadioCard.vue -->
<template>
  <el-radio :label="value" :disabled="disabled">
    <div class="radio-card">
      <div class="card-icon">
        <el-icon :size="24"><component :is="icon" /></el-icon>
      </div>
      <div class="card-content">
        <div class="card-title">{{ title }}</div>
        <div class="card-desc">{{ description }}</div>
      </div>
    </div>
  </el-radio>
</template>
```

### 2. 权限树形选择

```ts
// 递归处理树形权限
const handleTreeCheck = (node: any, checked: boolean) => {
  // 选中/取消当前节点
  if (checked) {
    if (!selected.value.includes(node.id)) {
      selected.value.push(node.id)
    }
  } else {
    selected.value = selected.value.filter(id => id !== node.id)
  }
  
  // 递归处理子节点
  if (node.children) {
    node.children.forEach((child: any) => {
      handleTreeCheck(child, checked)
    })
  }
}
```

### 3. 批量操作确认

```ts
const handleBatchOperation = async (action: string) => {
  if (selected.value.length === 0) {
    ElMessage.warning('请先选择数据')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要${action} ${selected.value.length} 项数据吗？`,
      '批量操作',
      { type: 'warning' }
    )
    
    // 执行操作
    await api.batchAction(selected.value, action)
    ElMessage.success('操作成功')
    selected.value = []
  } catch {
    // 用户取消
  }
}
```

### 4. 状态持久化

```ts
import { useLocalStorage } from '@vueuse/core'

// 保存选中状态到本地存储
const selectedItems = useLocalStorage('selected-items', [])

// 恢复选中状态
onMounted(() => {
  if (selectedItems.value.length > 0) {
    checkedItems.value = selectedItems.value
  }
})

// 监听变化并保存
watch(checkedItems, (val) => {
  selectedItems.value = val
})
```

---

## 参考资料

- [Element Plus Radio 单选框](https://element-plus.org/zh-CN/component/radio.html)
- [Element Plus Checkbox 复选框](https://element-plus.org/zh-CN/component/checkbox.html)

---

## 下一步

继续学习文件上传组件：[文件上传组件](./content-12.md)
