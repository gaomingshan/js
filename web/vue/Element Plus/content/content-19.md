# 对话框与抽屉

## 概述

`el-dialog`（对话框）和 `el-drawer`（抽屉）是弹出层容器组件，用于在页面上层展示内容。对话框通常用于简短的交互（如表单、确认），抽屉用于展示详细信息或复杂操作。

## 核心属性与事件

### Dialog 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `v-model` | 是否显示 Dialog | `boolean` | `false` |
| `title` | 标题 | `string` | - |
| `width` | 宽度 | `string / number` | `'50%'` |
| `fullscreen` | 是否全屏 | `boolean` | `false` |
| `top` | 距离顶部位置 | `string` | `'15vh'` |
| `modal` | 是否需要遮罩层 | `boolean` | `true` |
| `close-on-click-modal` | 点击遮罩是否关闭 | `boolean` | `true` |
| `close-on-press-escape` | 按下 ESC 是否关闭 | `boolean` | `true` |
| `show-close` | 是否显示关闭按钮 | `boolean` | `true` |
| `before-close` | 关闭前的回调 | `Function` | - |
| `destroy-on-close` | 关闭时销毁子元素 | `boolean` | `false` |
| `align-center` | 内容居中 | `boolean` | `false` |

### Dialog 核心事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `open` | 打开时触发 | - |
| `opened` | 打开动画结束时触发 | - |
| `close` | 关闭时触发 | - |
| `closed` | 关闭动画结束时触发 | - |

### Drawer 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `v-model` | 是否显示 Drawer | `boolean` | `false` |
| `title` | 标题 | `string` | - |
| `direction` | 打开方向 | `'rtl' / 'ltr' / 'ttb' / 'btt'` | `'rtl'` |
| `size` | 宽度/高度 | `string / number` | `'30%'` |
| `with-header` | 是否显示标题栏 | `boolean` | `true` |
| `modal` | 是否需要遮罩层 | `boolean` | `true` |
| `close-on-click-modal` | 点击遮罩是否关闭 | `boolean` | `true` |
| `before-close` | 关闭前的回调 | `Function` | - |
| `destroy-on-close` | 关闭时销毁子元素 | `boolean` | `false` |

## 完整实战样例

### 示例 1：表单对话框 - 新增/编辑用户

最常见的对话框使用场景。

```vue
<template>
  <div class="dialog-form-demo">
    <el-card>
      <template #header>
        <span>用户管理</span>
      </template>

      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>

      <el-table :data="tableData" border style="margin-top: 16px">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="120" />
        <el-table-column label="操作" width="150" align="center">
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
    </el-card>

    <!-- 表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :before-close="handleBeforeClose"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="编辑" value="editor" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="form.status" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

interface User {
  id?: number
  name: string
  email: string
  role: string
  phone: string
  status: boolean
  remark: string
}

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const editingId = ref<number | null>(null)

const tableData = ref<User[]>([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin', phone: '13800138000', status: true, remark: '' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: 'editor', phone: '13900139000', status: true, remark: '' }
])

const form = ref<User>({
  name: '',
  email: '',
  role: '',
  phone: '',
  status: true,
  remark: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => editingId.value ? '编辑用户' : '新增用户')

const handleAdd = () => {
  editingId.value = null
  form.value = {
    name: '',
    email: '',
    role: '',
    phone: '',
    status: true,
    remark: ''
  }
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const handleEdit = (row: User) => {
  editingId.value = row.id!
  form.value = { ...row }
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const handleBeforeClose = (done: () => void) => {
  if (submitLoading.value) {
    ElMessage.warning('正在提交，请稍候...')
    return
  }
  
  ElMessageBox.confirm('确定要关闭吗？未保存的数据将丢失。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      done()
    })
    .catch(() => {})
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true

      // 模拟 API 请求
      setTimeout(() => {
        if (editingId.value) {
          // 编辑
          const index = tableData.value.findIndex(item => item.id === editingId.value)
          if (index > -1) {
            tableData.value[index] = { ...form.value, id: editingId.value }
          }
          ElMessage.success('编辑成功')
        } else {
          // 新增
          tableData.value.push({
            ...form.value,
            id: Date.now()
          })
          ElMessage.success('新增成功')
        }

        submitLoading.value = false
        dialogVisible.value = false
      }, 1000)
    }
  })
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.name}" 吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        tableData.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}
</script>

<style scoped>
.dialog-form-demo {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
```

**运行效果：**
- 点击新增/编辑打开对话框
- 表单验证提示
- 提交时显示加载状态
- 关闭前确认，防止误操作
- 编辑时回显数据

---

### 示例 2：嵌套对话框与全屏对话框

对话框嵌套和全屏显示的场景。

```vue
<template>
  <div class="dialog-advanced-demo">
    <el-card>
      <template #header>
        <span>高级对话框</span>
      </template>

      <el-space wrap>
        <el-button type="primary" @click="outerVisible = true">
          嵌套对话框
        </el-button>
        <el-button type="success" @click="fullscreenVisible = true">
          全屏对话框
        </el-button>
        <el-button type="warning" @click="draggableVisible = true">
          自定义头部
        </el-button>
      </el-space>
    </el-card>

    <!-- 外层对话框 -->
    <el-dialog v-model="outerVisible" title="外层对话框" width="50%">
      <p>这是外层对话框的内容</p>
      <el-button type="primary" @click="innerVisible = true">
        打开内层对话框
      </el-button>

      <!-- 内层对话框 -->
      <el-dialog
        v-model="innerVisible"
        width="40%"
        title="内层对话框"
        append-to-body
      >
        <p>这是内层对话框的内容</p>
        <template #footer>
          <el-button @click="innerVisible = false">关闭</el-button>
        </template>
      </el-dialog>

      <template #footer>
        <el-button @click="outerVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 全屏对话框 -->
    <el-dialog
      v-model="fullscreenVisible"
      title="全屏对话框"
      fullscreen
    >
      <el-card>
        <template #header>
          <span>内容区域</span>
        </template>
        <p>全屏对话框适合展示大量内容或复杂的表单</p>
        <el-form :model="detailForm" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="项目名称">
                <el-input v-model="detailForm.projectName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目编号">
                <el-input v-model="detailForm.projectCode" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开始日期">
                <el-date-picker
                  v-model="detailForm.startDate"
                  type="date"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束日期">
                <el-date-picker
                  v-model="detailForm.endDate"
                  type="date"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="项目描述">
                <el-input
                  v-model="detailForm.description"
                  type="textarea"
                  :rows="5"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <template #footer>
        <el-button @click="fullscreenVisible = false">取消</el-button>
        <el-button type="primary">保存</el-button>
      </template>
    </el-dialog>

    <!-- 自定义头部对话框 -->
    <el-dialog
      v-model="draggableVisible"
      width="600px"
      :show-close="false"
    >
      <template #header="{ close }">
        <div class="custom-header">
          <span class="title">自定义头部</span>
          <div class="actions">
            <el-button type="primary" size="small" @click="handleFullscreen">
              {{ isFullscreen ? '退出全屏' : '全屏' }}
            </el-button>
            <el-button size="small" @click="close">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <p>这是一个自定义头部的对话框</p>
      <p>可以在头部添加额外的操作按钮</p>

      <template #footer>
        <el-button @click="draggableVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Close } from '@element-plus/icons-vue'

const outerVisible = ref(false)
const innerVisible = ref(false)
const fullscreenVisible = ref(false)
const draggableVisible = ref(false)
const isFullscreen = ref(false)

const detailForm = ref({
  projectName: '',
  projectCode: '',
  startDate: '',
  endDate: '',
  description: ''
})

const handleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  // 实际项目中可以切换 fullscreen 属性
}
</script>

<style scoped>
.dialog-advanced-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.custom-header .title {
  font-size: 18px;
  font-weight: bold;
}

.custom-header .actions {
  display: flex;
  gap: 8px;
}
</style>
```

**运行效果：**
- 支持对话框嵌套，内层对话框使用 `append-to-body`
- 全屏对话框展示复杂表单
- 自定义头部，添加额外操作按钮

---

### 示例 3：抽屉 - 详情展示

使用抽屉组件展示详细信息。

```vue
<template>
  <div class="drawer-demo">
    <el-card>
      <template #header>
        <span>订单列表</span>
      </template>

      <el-table :data="orders" border>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="customer" label="客户" width="120" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="showDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 右侧抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="订单详情"
      :size="600"
      direction="rtl"
      destroy-on-close
    >
      <el-descriptions v-if="currentOrder" :column="2" border>
        <el-descriptions-item label="订单号" :span="2">
          {{ currentOrder.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="客户姓名">
          {{ currentOrder.customer }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ currentOrder.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          ¥{{ currentOrder.amount.toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(currentOrder.status)">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间" :span="2">
          {{ currentOrder.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">
          {{ currentOrder.address }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">商品明细</el-divider>

      <el-table v-if="currentOrder" :data="currentOrder.items" border>
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120" align="right">
          <template #default="{ row }">
            ¥{{ (row.quantity * row.price).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="drawerVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePrint">
          打印订单
        </el-button>
      </template>
    </el-drawer>

    <!-- 底部抽屉 -->
    <el-button type="success" style="margin-top: 16px" @click="bottomDrawerVisible = true">
      打开底部抽屉
    </el-button>

    <el-drawer
      v-model="bottomDrawerVisible"
      title="筛选条件"
      direction="btt"
      :size="300"
    >
      <el-form :model="filterForm" label-width="100px">
        <el-form-item label="订单状态">
          <el-select v-model="filterForm.status" style="width: 100%">
            <el-option label="全部" value="" />
            <el-option label="待付款" value="pending" />
            <el-option label="已付款" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="金额范围">
          <el-space>
            <el-input-number v-model="filterForm.minAmount" :min="0" />
            <span>至</span>
            <el-input-number v-model="filterForm.maxAmount" :min="0" />
          </el-space>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleResetFilter">重置</el-button>
        <el-button type="primary" @click="handleApplyFilter">
          应用筛选
        </el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed'

interface OrderItem {
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: number
  orderNo: string
  customer: string
  phone: string
  amount: number
  status: OrderStatus
  createTime: string
  address: string
  items: OrderItem[]
}

const drawerVisible = ref(false)
const bottomDrawerVisible = ref(false)
const currentOrder = ref<Order | null>(null)

const orders = ref<Order[]>([
  {
    id: 1,
    orderNo: 'ORD20240115001',
    customer: '张三',
    phone: '13800138000',
    amount: 9898,
    status: 'paid',
    createTime: '2024-01-15 10:30:00',
    address: '北京市朝阳区建国路88号',
    items: [
      { productName: 'iPhone 15 Pro', quantity: 1, price: 7999 },
      { productName: 'AirPods Pro 2', quantity: 1, price: 1899 }
    ]
  },
  {
    id: 2,
    orderNo: 'ORD20240115002',
    customer: '李四',
    phone: '13900139000',
    amount: 18999,
    status: 'shipped',
    createTime: '2024-01-15 11:20:00',
    address: '上海市浦东新区XX路XX号',
    items: [
      { productName: 'MacBook Pro 16', quantity: 1, price: 18999 }
    ]
  }
])

const filterForm = ref({
  status: '',
  dateRange: [],
  minAmount: 0,
  maxAmount: 99999
})

const getStatusType = (status: OrderStatus) => {
  const map: Record<OrderStatus, any> = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'info',
    completed: 'success'
  }
  return map[status]
}

const getStatusText = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    pending: '待付款',
    paid: '已付款',
    shipped: '已发货',
    completed: '已完成'
  }
  return map[status]
}

const showDetail = (order: Order) => {
  currentOrder.value = order
  drawerVisible.value = true
}

const handlePrint = () => {
  ElMessage.info('打印订单功能')
}

const handleResetFilter = () => {
  filterForm.value = {
    status: '',
    dateRange: [],
    minAmount: 0,
    maxAmount: 99999
  }
  ElMessage.info('筛选条件已重置')
}

const handleApplyFilter = () => {
  bottomDrawerVisible.value = false
  ElMessage.success('筛选条件已应用')
}
</script>

<style scoped>
.drawer-demo {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

**运行效果：**
- 点击"查看详情"打开右侧抽屉
- 抽屉中展示订单详情和商品明细
- 底部抽屉用于筛选条件设置
- 抽屉支持自定义 footer

---

## 常见踩坑

### 1. 嵌套对话框遮罩问题

**问题：** 内层对话框的遮罩层覆盖外层对话框。

**解决：** 使用 `append-to-body` 属性。

```vue
<el-dialog
  v-model="innerVisible"
  append-to-body
>
```

---

### 2. `destroy-on-close` 未生效

**问题：** 设置了 `destroy-on-close`，但组件状态仍保留。

**原因：** `v-model` 控制显示隐藏，内部状态需要手动重置。

**解决：** 在关闭时重置状态。

```ts
watch(dialogVisible, (val) => {
  if (!val) {
    nextTick(() => {
      formRef.value?.resetFields()
    })
  }
})
```

---

### 3. 抽屉中表单验证失效

**问题：** 抽屉中的表单验证不触发。

**解决：** 确保表单组件正确绑定 `ref` 和 `rules`。

```vue
<el-drawer v-model="visible">
  <el-form ref="formRef" :model="form" :rules="rules">
    ...
  </el-form>
</el-drawer>
```

---

### 4. 关闭动画卡顿

**问题：** 对话框关闭时动画不流畅。

**解决：** 使用 `destroy-on-close` 及时销毁组件，减少 DOM 节点。

```vue
<el-dialog v-model="visible" destroy-on-close>
```

---

## 最佳实践

### 1. 表单对话框模板封装

```vue
<!-- FormDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="600px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules">
      <slot :form="form" />
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>
```

### 2. 统一管理对话框状态

```ts
// useDialog.ts
export const useDialog = () => {
  const visible = ref(false)
  const loading = ref(false)
  
  const open = () => {
    visible.value = true
  }
  
  const close = () => {
    visible.value = false
  }
  
  return { visible, loading, open, close }
}
```

### 3. 抽屉内容懒加载

```vue
<el-drawer v-model="visible">
  <component :is="DetailComponent" v-if="visible" :id="currentId" />
</el-drawer>
```

---

## 参考资料

- [Element Plus Dialog 文档](https://element-plus.org/zh-CN/component/dialog.html)
- [Element Plus Drawer 文档](https://element-plus.org/zh-CN/component/drawer.html)
