# 复杂弹窗场景

## 概述

本章介绍复杂弹窗场景的处理，包括嵌套弹窗、弹窗通信、弹窗状态管理、全屏弹窗等高级用法，帮助处理实际项目中的复杂交互需求。

## 核心场景

### 1. 弹窗嵌套

多层弹窗的处理和遮罩层管理。

### 2. 弹窗通信

父子弹窗之间的数据传递。

### 3. 弹窗状态管理

使用 Pinia 或 Vuex 管理全局弹窗状态。

### 4. 动态弹窗

根据配置动态渲染弹窗内容。

## 完整实战样例

### 示例 1：嵌套弹窗 - 多级选择

三层嵌套弹窗实现复杂选择逻辑。

```vue
<template>
  <div class="nested-dialog-demo">
    <el-card>
      <template #header>
        <span>嵌套弹窗示例</span>
      </template>

      <el-button type="primary" @click="level1Visible = true">
        打开一级弹窗
      </el-button>

      <div style="margin-top: 20px">
        <h4>已选择的数据：</h4>
        <el-tag v-if="selectedData.province">省份：{{ selectedData.province }}</el-tag>
        <el-tag v-if="selectedData.city" style="margin-left: 8px">城市：{{ selectedData.city }}</el-tag>
        <el-tag v-if="selectedData.district" style="margin-left: 8px">区县：{{ selectedData.district }}</el-tag>
      </div>
    </el-card>

    <!-- 一级弹窗 -->
    <el-dialog
      v-model="level1Visible"
      title="选择省份"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-radio-group v-model="tempSelected.province">
        <el-radio
          v-for="province in provinces"
          :key="province.code"
          :label="province.name"
          style="display: block; margin-bottom: 12px"
        >
          {{ province.name }}
        </el-radio>
      </el-radio-group>

      <template #footer>
        <el-button @click="level1Visible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!tempSelected.province"
          @click="openLevel2"
        >
          下一步：选择城市
        </el-button>
      </template>
    </el-dialog>

    <!-- 二级弹窗 -->
    <el-dialog
      v-model="level2Visible"
      title="选择城市"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-alert
        :title="`已选择省份：${tempSelected.province}`"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      />

      <el-radio-group v-model="tempSelected.city">
        <el-radio
          v-for="city in currentCities"
          :key="city.code"
          :label="city.name"
          style="display: block; margin-bottom: 12px"
        >
          {{ city.name }}
        </el-radio>
      </el-radio-group>

      <template #footer>
        <el-button @click="backToLevel1">上一步</el-button>
        <el-button
          type="primary"
          :disabled="!tempSelected.city"
          @click="openLevel3"
        >
          下一步：选择区县
        </el-button>
      </template>
    </el-dialog>

    <!-- 三级弹窗 -->
    <el-dialog
      v-model="level3Visible"
      title="选择区县"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-alert
        :title="`已选择：${tempSelected.province} > ${tempSelected.city}`"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      />

      <el-radio-group v-model="tempSelected.district">
        <el-radio
          v-for="district in currentDistricts"
          :key="district.code"
          :label="district.name"
          style="display: block; margin-bottom: 12px"
        >
          {{ district.name }}
        </el-radio>
      </el-radio-group>

      <template #footer>
        <el-button @click="backToLevel2">上一步</el-button>
        <el-button
          type="primary"
          :disabled="!tempSelected.district"
          @click="confirmSelection"
        >
          确认选择
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

interface AreaItem {
  code: string
  name: string
}

const level1Visible = ref(false)
const level2Visible = ref(false)
const level3Visible = ref(false)

const selectedData = ref({
  province: '',
  city: '',
  district: ''
})

const tempSelected = ref({
  province: '',
  city: '',
  district: ''
})

const provinces: AreaItem[] = [
  { code: '110000', name: '北京市' },
  { code: '310000', name: '上海市' },
  { code: '440000', name: '广东省' }
]

const cityMap: Record<string, AreaItem[]> = {
  '北京市': [{ code: '110100', name: '北京市' }],
  '上海市': [{ code: '310100', name: '上海市' }],
  '广东省': [
    { code: '440100', name: '广州市' },
    { code: '440300', name: '深圳市' }
  ]
}

const districtMap: Record<string, AreaItem[]> = {
  '北京市': [
    { code: '110101', name: '东城区' },
    { code: '110102', name: '西城区' }
  ],
  '广州市': [
    { code: '440103', name: '荔湾区' },
    { code: '440104', name: '越秀区' }
  ],
  '深圳市': [
    { code: '440303', name: '罗湖区' },
    { code: '440304', name: '福田区' }
  ]
}

const currentCities = computed(() => {
  return cityMap[tempSelected.value.province] || []
})

const currentDistricts = computed(() => {
  return districtMap[tempSelected.value.city] || []
})

const openLevel2 = () => {
  level2Visible.value = true
}

const openLevel3 = () => {
  level3Visible.value = true
}

const backToLevel1 = () => {
  level2Visible.value = false
  tempSelected.value.city = ''
  tempSelected.value.district = ''
}

const backToLevel2 = () => {
  level3Visible.value = false
  tempSelected.value.district = ''
}

const confirmSelection = () => {
  selectedData.value = { ...tempSelected.value }
  level1Visible.value = false
  level2Visible.value = false
  level3Visible.value = false
  ElMessage.success('选择完成')
}
</script>

<style scoped>
.nested-dialog-demo {
  max-width: 800px;
  margin: 0 auto;
}

h4 {
  margin: 0 0 12px 0;
}
</style>
```

---

### 示例 2：弹窗通信 - 表单编辑

主弹窗与子弹窗之间的数据传递。

```vue
<template>
  <div class="dialog-communication-demo">
    <el-card>
      <template #header>
        <span>弹窗通信示例</span>
      </template>

      <el-button type="primary" @click="openMainDialog">
        打开用户编辑弹窗
      </el-button>
    </el-card>

    <!-- 主弹窗：用户编辑 -->
    <el-dialog
      v-model="mainDialogVisible"
      title="编辑用户信息"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="userForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" />
        </el-form-item>

        <el-form-item label="所属部门">
          <el-input
            v-model="userForm.departmentName"
            readonly
            placeholder="点击选择部门"
            @click="openDepartmentDialog"
          >
            <template #suffix>
              <el-icon style="cursor: pointer"><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="角色">
          <el-select v-model="userForm.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
          <el-button type="primary" link style="margin-top: 8px" @click="openRoleDialog">
            管理角色
          </el-button>
        </el-form-item>

        <el-form-item label="权限">
          <el-space wrap>
            <el-tag
              v-for="permission in userForm.permissions"
              :key="permission"
              closable
              @close="removePermission(permission)"
            >
              {{ permission }}
            </el-tag>
          </el-space>
          <el-button
            type="primary"
            size="small"
            style="margin-top: 8px"
            @click="openPermissionDialog"
          >
            添加权限
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="mainDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUser">保存</el-button>
      </template>
    </el-dialog>

    <!-- 子弹窗：部门选择 -->
    <el-dialog
      v-model="departmentDialogVisible"
      title="选择部门"
      width="400px"
      append-to-body
    >
      <el-tree
        :data="departments"
        node-key="id"
        :props="{ label: 'name', children: 'children' }"
        @node-click="handleDepartmentSelect"
      />
    </el-dialog>

    <!-- 子弹窗：角色管理 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="角色管理"
      width="500px"
      append-to-body
    >
      <el-space direction="vertical" style="width: 100%">
        <el-button type="primary" size="small" @click="handleAddRole">
          新增角色
        </el-button>
        <el-table :data="roles" border>
          <el-table-column prop="name" label="角色名称" />
          <el-table-column prop="description" label="描述" />
          <el-table-column label="操作" width="150" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEditRole(row)">
                编辑
              </el-button>
              <el-button type="danger" link size="small" @click="handleDeleteRole(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-space>

      <template #footer>
        <el-button @click="roleDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 子弹窗：权限选择 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="选择权限"
      width="500px"
      append-to-body
    >
      <el-checkbox-group v-model="selectedPermissions">
        <el-checkbox
          v-for="permission in availablePermissions"
          :key="permission"
          :label="permission"
          style="display: block; margin-bottom: 12px"
        >
          {{ permission }}
        </el-checkbox>
      </el-checkbox-group>

      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPermissions">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

interface UserForm {
  username: string
  departmentId: string
  departmentName: string
  roleIds: string[]
  permissions: string[]
}

const mainDialogVisible = ref(false)
const departmentDialogVisible = ref(false)
const roleDialogVisible = ref(false)
const permissionDialogVisible = ref(false)

const userForm = reactive<UserForm>({
  username: '',
  departmentId: '',
  departmentName: '',
  roleIds: [],
  permissions: []
})

const departments = ref([
  {
    id: '1',
    name: '技术部',
    children: [
      { id: '1-1', name: '前端组' },
      { id: '1-2', name: '后端组' }
    ]
  },
  {
    id: '2',
    name: '产品部',
    children: [
      { id: '2-1', name: '产品组' },
      { id: '2-2', name: '设计组' }
    ]
  }
])

const roles = ref([
  { id: '1', name: '管理员', description: '系统管理员' },
  { id: '2', name: '编辑', description: '内容编辑' },
  { id: '3', name: '访客', description: '只读权限' }
])

const availablePermissions = ref([
  '用户管理',
  '角色管理',
  '权限管理',
  '内容管理',
  '数据统计'
])

const selectedPermissions = ref<string[]>([])

const openMainDialog = () => {
  // 模拟加载用户数据
  userForm.username = '张三'
  userForm.departmentName = '前端组'
  userForm.roleIds = ['1']
  userForm.permissions = ['用户管理', '内容管理']
  mainDialogVisible.value = true
}

const openDepartmentDialog = () => {
  departmentDialogVisible.value = true
}

const handleDepartmentSelect = (data: any) => {
  userForm.departmentId = data.id
  userForm.departmentName = data.name
  departmentDialogVisible.value = false
  ElMessage.success(`已选择：${data.name}`)
}

const openRoleDialog = () => {
  roleDialogVisible.value = true
}

const handleAddRole = () => {
  ElMessage.info('打开新增角色弹窗')
}

const handleEditRole = (row: any) => {
  ElMessage.info(`编辑角色：${row.name}`)
}

const handleDeleteRole = (row: any) => {
  ElMessage.warning(`删除角色：${row.name}`)
}

const openPermissionDialog = () => {
  selectedPermissions.value = [...userForm.permissions]
  permissionDialogVisible.value = true
}

const confirmPermissions = () => {
  userForm.permissions = [...selectedPermissions.value]
  permissionDialogVisible.value = false
  ElMessage.success('权限已更新')
}

const removePermission = (permission: string) => {
  const index = userForm.permissions.indexOf(permission)
  if (index > -1) {
    userForm.permissions.splice(index, 1)
  }
}

const handleSaveUser = () => {
  console.log('保存用户:', userForm)
  ElMessage.success('保存成功')
  mainDialogVisible.value = false
}
</script>

<style scoped>
.dialog-communication-demo {
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

---

### 示例 3：弹窗状态管理 - Pinia 集中管理

使用 Pinia 管理全局弹窗状态。

```ts
// stores/dialog.ts
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export interface DialogConfig {
  visible: boolean
  title: string
  width?: string
  data?: any
  onConfirm?: (data?: any) => void
  onCancel?: () => void
}

export const useDialogStore = defineStore('dialog', () => {
  // 用户编辑弹窗
  const userDialog = reactive<DialogConfig>({
    visible: false,
    title: '用户编辑',
    width: '600px',
    data: null
  })

  // 确认弹窗
  const confirmDialog = reactive<DialogConfig>({
    visible: false,
    title: '确认操作',
    width: '400px',
    data: null
  })

  // 打开用户弹窗
  const openUserDialog = (data?: any, onConfirm?: (data?: any) => void) => {
    userDialog.data = data
    userDialog.onConfirm = onConfirm
    userDialog.visible = true
  }

  // 关闭用户弹窗
  const closeUserDialog = () => {
    userDialog.visible = false
    userDialog.data = null
    userDialog.onConfirm = undefined
  }

  // 打开确认弹窗
  const openConfirmDialog = (
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    confirmDialog.title = title
    confirmDialog.data = message
    confirmDialog.onConfirm = onConfirm
    confirmDialog.visible = true
  }

  // 关闭确认弹窗
  const closeConfirmDialog = () => {
    confirmDialog.visible = false
    confirmDialog.data = null
    confirmDialog.onConfirm = undefined
  }

  return {
    userDialog,
    confirmDialog,
    openUserDialog,
    closeUserDialog,
    openConfirmDialog,
    closeConfirmDialog
  }
})
```

```vue
<!-- 使用示例 -->
<template>
  <div class="dialog-store-demo">
    <el-card>
      <template #header>
        <span>弹窗状态管理示例</span>
      </template>

      <el-space wrap>
        <el-button type="primary" @click="handleOpenUser">
          编辑用户
        </el-button>
        <el-button type="danger" @click="handleDelete">
          删除数据
        </el-button>
      </el-space>
    </el-card>

    <!-- 用户编辑弹窗 -->
    <el-dialog
      v-model="dialogStore.userDialog.visible"
      :title="dialogStore.userDialog.title"
      :width="dialogStore.userDialog.width"
    >
      <el-form :model="userForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogStore.closeUserDialog()">取消</el-button>
        <el-button type="primary" @click="handleUserConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 确认弹窗 -->
    <el-dialog
      v-model="dialogStore.confirmDialog.visible"
      :title="dialogStore.confirmDialog.title"
      :width="dialogStore.confirmDialog.width"
    >
      <p>{{ dialogStore.confirmDialog.data }}</p>

      <template #footer>
        <el-button @click="dialogStore.closeConfirmDialog()">取消</el-button>
        <el-button type="primary" @click="handleConfirmAction">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useDialogStore } from '@/stores/dialog'

const dialogStore = useDialogStore()

const userForm = reactive({
  username: '',
  email: ''
})

const handleOpenUser = () => {
  // 加载用户数据
  userForm.username = '张三'
  userForm.email = 'zhangsan@example.com'

  dialogStore.openUserDialog(userForm, (data) => {
    console.log('保存用户:', data)
    ElMessage.success('用户保存成功')
  })
}

const handleUserConfirm = () => {
  if (dialogStore.userDialog.onConfirm) {
    dialogStore.userDialog.onConfirm(userForm)
  }
  dialogStore.closeUserDialog()
}

const handleDelete = () => {
  dialogStore.openConfirmDialog(
    '确认删除',
    '此操作将永久删除该数据，是否继续？',
    () => {
      ElMessage.success('删除成功')
    }
  )
}

const handleConfirmAction = () => {
  if (dialogStore.confirmDialog.onConfirm) {
    dialogStore.confirmDialog.onConfirm()
  }
  dialogStore.closeConfirmDialog()
}
</script>
```

---

## 常见踩坑

### 1. 嵌套弹窗遮罩层叠加

**问题：** 多层弹窗打开后，遮罩层重叠导致无法操作。

**解决：** 使用 `append-to-body` 属性。

```vue
<el-dialog v-model="innerVisible" append-to-body>
```

---

### 2. 弹窗关闭后状态未清理

**问题：** 弹窗关闭后，表单数据仍保留。

**解决：** 在 `@closed` 事件中清理数据。

```vue
<el-dialog v-model="visible" @closed="handleClosed">
```

---

### 3. 弹窗通信数据丢失

**问题：** 子弹窗选择的数据未传递到父弹窗。

**解决：** 使用 props/emit 或状态管理。

---

## 最佳实践

### 1. 弹窗配置统一管理

```ts
// useDialog.ts
export const useDialog = () => {
  const visible = ref(false)
  const loading = ref(false)
  
  const open = (data?: any) => {
    // 初始化数据
    visible.value = true
  }
  
  const close = () => {
    visible.value = false
    // 清理数据
  }
  
  return { visible, loading, open, close }
}
```

### 2. 弹窗组件封装

将常用弹窗封装为独立组件。

### 3. 避免过深嵌套

弹窗嵌套不超过3层，否则考虑改用步骤条或其他交互方式。

---

## 参考资料

- [Element Plus Dialog 文档](https://element-plus.org/zh-CN/component/dialog.html)
- [Pinia 官方文档](https://pinia.vuejs.org/)
