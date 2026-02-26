# 表格基础

## 概述

`el-table` 是 Element Plus 中最常用的数据展示组件之一，用于展示多条结构化数据。它支持排序、筛选、多选、展开行等丰富功能，是中后台系统的核心组件。

## 核心属性与事件

### Table 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `data` | 显示的数据 | `Array` | `[]` |
| `border` | 是否带有纵向边框 | `boolean` | `false` |
| `stripe` | 是否为斑马纹 | `boolean` | `false` |
| `height` | 表格高度，固定表头 | `string/number` | - |
| `max-height` | 表格最大高度 | `string/number` | - |
| `row-key` | 行数据的 Key，用于优化渲染 | `string/Function` | - |
| `default-sort` | 默认排序列和顺序 | `Object` | - |
| `empty-text` | 空数据时显示的文本 | `string` | '暂无数据' |
| `show-summary` | 是否显示合计行 | `boolean` | `false` |
| `summary-method` | 自定义合计逻辑 | `Function` | - |

### Table Column 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `prop` | 对应列内容的字段名 | `string` | - |
| `label` | 显示的标题 | `string` | - |
| `width` | 列宽度 | `string/number` | - |
| `min-width` | 最小列宽度 | `string/number` | - |
| `fixed` | 列是否固定 | `boolean/string` | `false` |
| `sortable` | 是否可排序 | `boolean/string` | `false` |
| `align` | 对齐方式 | `string` | `left` |
| `formatter` | 格式化显示内容 | `Function` | - |

### 核心事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `selection-change` | 选择项变化时触发 | `selection` |
| `row-click` | 行点击事件 | `row, column, event` |
| `sort-change` | 排序变化时触发 | `{ column, prop, order }` |
| `cell-click` | 单元格点击事件 | `row, column, cell, event` |

## 完整实战样例

### 示例 1：基础表格 - 用户列表

展示带边框、斑马纹、排序的基础表格。

```vue
<template>
  <div class="user-table-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </template>

      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
        :default-sort="{ prop: 'createTime', order: 'descending' }"
        @sort-change="handleSortChange"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        
        <el-table-column prop="name" label="姓名" width="120" />
        
        <el-table-column prop="email" label="邮箱" min-width="180" />
        
        <el-table-column prop="role" label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="status"
          label="状态"
          width="100"
          align="center"
          :filters="[
            { text: '启用', value: 'active' },
            { text: '禁用', value: 'inactive' }
          ]"
          :filter-method="filterStatus"
        >
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="180"
          sortable
          :formatter="formatTime"
        />
        
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  createTime: string
}

const tableData = ref<User[]>([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: '管理员',
    status: 'active',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: '编辑',
    status: 'active',
    createTime: '2024-02-20 14:20:00'
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    role: '普通用户',
    status: 'inactive',
    createTime: '2024-03-10 09:15:00'
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    role: '编辑',
    status: 'active',
    createTime: '2024-03-25 16:45:00'
  }
])

const getRoleType = (role: string) => {
  const typeMap: Record<string, any> = {
    '管理员': 'danger',
    '编辑': 'warning',
    '普通用户': 'info'
  }
  return typeMap[role] || 'info'
}

const filterStatus = (value: string, row: User) => {
  return row.status === value
}

const formatTime = (row: User) => {
  return row.createTime
}

const handleSortChange = ({ prop, order }: any) => {
  console.log('排序变化:', prop, order)
  // 这里可以调用后端排序接口
}

const handleAdd = () => {
  ElMessage.info('打开新增对话框')
}

const handleEdit = (row: User) => {
  ElMessage.info(`编辑用户：${row.name}`)
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm(`确定删除用户 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
```

**运行效果：**
- 表格显示用户列表，带边框和斑马纹
- 支持按创建时间排序
- 角色和状态列使用标签显示
- 状态列支持筛选
- 操作列固定在右侧，包含编辑和删除按钮

---

### 示例 2：多选表格 - 批量操作

支持复选框选择和批量操作的表格。

```vue
<template>
  <div class="selection-table-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-space>
            <el-button
              type="danger"
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
            >
              批量删除 ({{ selectedRows.length }})
            </el-button>
            <el-button
              type="warning"
              :disabled="selectedRows.length === 0"
              @click="handleBatchExport"
            >
              批量导出
            </el-button>
          </el-space>
        </div>
      </template>

      <el-table
        ref="tableRef"
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55" :reserve-selection="true" />
        
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="name" label="商品名称" min-width="200" />
        
        <el-table-column prop="category" label="分类" width="120" />
        
        <el-table-column prop="price" label="价格" width="120" align="right">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">
              ¥{{ row.price.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="stock" label="库存" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.stock > 50" type="success">{{ row.stock }}</el-tag>
            <el-tag v-else-if="row.stock > 10" type="warning">{{ row.stock }}</el-tag>
            <el-tag v-else type="danger">{{ row.stock }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="sales" label="销量" width="100" align="center" sortable />
        
        <el-table-column label="操作" width="150" fixed="right" align="center">
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

      <div class="table-footer">
        <div class="selection-info">
          已选择 <span class="count">{{ selectedRows.length }}</span> 项
          <el-button type="primary" link @click="handleToggleSelection">
            {{ isAllSelected ? '取消全选' : '全选' }}
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ElTable } from 'element-plus'

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  sales: number
}

const tableRef = ref<InstanceType<typeof ElTable>>()
const selectedRows = ref<Product[]>([])

const tableData = ref<Product[]>([
  { id: 1, name: 'iPhone 15 Pro', category: '手机', price: 7999, stock: 120, sales: 580 },
  { id: 2, name: 'MacBook Pro 16', category: '电脑', price: 18999, stock: 45, sales: 120 },
  { id: 3, name: 'AirPods Pro 2', category: '耳机', price: 1899, stock: 8, sales: 950 },
  { id: 4, name: 'iPad Air', category: '平板', price: 4799, stock: 65, sales: 340 },
  { id: 5, name: 'Apple Watch 9', category: '手表', price: 2999, stock: 15, sales: 420 }
])

const isAllSelected = computed(() => {
  return selectedRows.value.length === tableData.value.length
})

const handleSelectionChange = (selection: Product[]) => {
  selectedRows.value = selection
}

const handleToggleSelection = () => {
  if (isAllSelected.value) {
    tableRef.value?.clearSelection()
  } else {
    tableData.value.forEach(row => {
      tableRef.value?.toggleRowSelection(row, true)
    })
  }
}

const handleBatchDelete = () => {
  const count = selectedRows.value.length
  ElMessageBox.confirm(`确定要删除选中的 ${count} 个商品吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = selectedRows.value.map(row => row.id)
    tableData.value = tableData.value.filter(item => !ids.includes(item.id))
    ElMessage.success(`成功删除 ${count} 个商品`)
    tableRef.value?.clearSelection()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleBatchExport = () => {
  ElMessage.success(`导出 ${selectedRows.value.length} 个商品`)
  console.log('导出数据:', selectedRows.value)
}

const handleEdit = (row: Product) => {
  ElMessage.info(`编辑商品：${row.name}`)
}

const handleDelete = (row: Product) => {
  ElMessageBox.confirm(`确定删除商品 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-info {
  color: #606266;
  font-size: 14px;
}

.selection-info .count {
  color: #409eff;
  font-weight: bold;
  margin: 0 4px;
}
</style>
```

**运行效果：**
- 表格支持复选框多选
- 批量操作按钮根据选择状态启用/禁用
- 显示已选择数量
- 库存列根据数量显示不同颜色的标签
- 支持全选和取消全选
- `reserve-selection` 保持跨页选择状态

---

### 示例 3：固定表头和列 - 大数据表格

处理大量数据的表格，固定表头和某些列。

```vue
<template>
  <div class="fixed-table-demo">
    <el-card>
      <template #header>
        <span>订单列表（共 {{ tableData.length }} 条）</span>
      </template>

      <el-table
        :data="tableData"
        border
        height="400"
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <el-table-column
          prop="orderNo"
          label="订单号"
          width="180"
          fixed="left"
        />
        
        <el-table-column prop="customer" label="客户姓名" width="120" />
        
        <el-table-column prop="phone" label="联系电话" width="130" />
        
        <el-table-column prop="product" label="商品名称" width="200" />
        
        <el-table-column
          prop="amount"
          label="订单金额"
          width="120"
          align="right"
          sortable
        >
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        
        <el-table-column prop="address" label="收货地址" min-width="250" />
        
        <el-table-column prop="status" label="订单状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="下单时间" width="160" />
        
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="handleConfirm(row)"
            >
              确认
            </el-button>
            <el-button type="primary" size="small" link @click="handleDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              link
              @click="handleCancel(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-summary">
        <el-statistic title="总订单数" :value="tableData.length" />
        <el-statistic title="总金额" :value="totalAmount" prefix="¥" :precision="2" />
        <el-statistic
          title="待处理"
          :value="pendingCount"
          :value-style="{ color: '#f56c6c' }"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'

interface Order {
  id: number
  orderNo: string
  customer: string
  phone: string
  product: string
  amount: number
  quantity: number
  address: string
  status: OrderStatus
  createTime: string
}

const tableData = ref<Order[]>([
  {
    id: 1,
    orderNo: 'ORD20240115001',
    customer: '张三',
    phone: '13800138000',
    product: 'iPhone 15 Pro',
    amount: 7999,
    quantity: 1,
    address: '北京市朝阳区XX路XX号',
    status: 'pending',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    orderNo: 'ORD20240115002',
    customer: '李四',
    phone: '13900139000',
    product: 'MacBook Pro 16',
    amount: 18999,
    quantity: 1,
    address: '上海市浦东新区XX路XX号',
    status: 'confirmed',
    createTime: '2024-01-15 11:20:00'
  },
  {
    id: 3,
    orderNo: 'ORD20240115003',
    customer: '王五',
    phone: '13700137000',
    product: 'AirPods Pro 2',
    amount: 1899,
    quantity: 2,
    address: '广州市天河区XX路XX号',
    status: 'shipped',
    createTime: '2024-01-15 14:10:00'
  },
  {
    id: 4,
    orderNo: 'ORD20240115004',
    customer: '赵六',
    phone: '13600136000',
    product: 'iPad Air',
    amount: 4799,
    quantity: 1,
    address: '深圳市南山区XX路XX号',
    status: 'completed',
    createTime: '2024-01-14 09:30:00'
  },
  {
    id: 5,
    orderNo: 'ORD20240115005',
    customer: '钱七',
    phone: '13500135000',
    product: 'Apple Watch 9',
    amount: 2999,
    quantity: 1,
    address: '杭州市西湖区XX路XX号',
    status: 'cancelled',
    createTime: '2024-01-14 16:45:00'
  }
])

const totalAmount = computed(() => {
  return tableData.value
    .filter(item => item.status !== 'cancelled')
    .reduce((sum, item) => sum + item.amount * item.quantity, 0)
})

const pendingCount = computed(() => {
  return tableData.value.filter(item => item.status === 'pending').length
})

const getStatusType = (status: OrderStatus) => {
  const typeMap: Record<OrderStatus, any> = {
    pending: 'warning',
    confirmed: 'primary',
    shipped: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status]
}

const getStatusText = (status: OrderStatus) => {
  const textMap: Record<OrderStatus, string> = {
    pending: '待处理',
    confirmed: '已确认',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status]
}

const getRowClassName = ({ row }: { row: Order }) => {
  if (row.status === 'cancelled') {
    return 'cancelled-row'
  }
  if (row.status === 'pending') {
    return 'pending-row'
  }
  return ''
}

const handleConfirm = (row: Order) => {
  row.status = 'confirmed'
  ElMessage.success('订单已确认')
}

const handleDetail = (row: Order) => {
  ElMessage.info(`查看订单详情：${row.orderNo}`)
}

const handleCancel = (row: Order) => {
  row.status = 'cancelled'
  ElMessage.warning('订单已取消')
}
</script>

<style scoped>
.table-summary {
  margin-top: 20px;
  display: flex;
  gap: 40px;
}

:deep(.cancelled-row) {
  background-color: #fef0f0;
}

:deep(.pending-row) {
  background-color: #fdf6ec;
}
</style>
```

**运行效果：**
- 表格高度固定为 400px，支持滚动
- 订单号列固定在左侧
- 操作列固定在右侧
- 表头固定，数据区域可滚动
- 不同状态的行显示不同背景色
- 底部显示订单统计信息

---

## 常见踩坑

### 1. 数据更新但表格不刷新

**问题：** 修改 `data` 中的对象属性，表格不更新。

**原因：** 直接修改嵌套对象属性可能失去响应式。

**解决：**
```ts
// ❌ 错误
tableData.value[0].name = '新名字'

// ✅ 正确
tableData.value[0] = { ...tableData.value[0], name: '新名字' }

// 或使用 splice
tableData.value.splice(0, 1, { ...tableData.value[0], name: '新名字' })
```

---

### 2. 多选状态在分页后丢失

**问题：** 切换分页后，之前选中的数据丢失。

**解决：** 使用 `row-key` 和 `reserve-selection`。

```vue
<el-table
  :data="tableData"
  row-key="id"
>
  <el-table-column
    type="selection"
    :reserve-selection="true"
  />
</el-table>
```

---

### 3. 固定列表格错位

**问题：** 使用 `fixed` 后，表格列错位或样式异常。

**原因：** 未设置明确的列宽度。

**解决：** 为所有列设置明确的宽度。

```vue
<!-- ❌ 错误 -->
<el-table-column prop="name" label="姓名" />

<!-- ✅ 正确 -->
<el-table-column prop="name" label="姓名" width="120" />
```

---

### 4. `formatter` 中无法访问 `this`

**问题：** 在 `formatter` 函数中使用 `this` 报错。

**解决：** 使用箭头函数或模板插槽。

```vue
<!-- ❌ 错误 -->
<el-table-column :formatter="formatData" />

<!-- ✅ 正确 - 使用模板 -->
<el-table-column>
  <template #default="{ row }">
    {{ formatData(row) }}
  </template>
</el-table-column>
```

---

### 5. 表格高度自适应问题

**问题：** 设置 `height="100%"` 不生效。

**解决：** 父容器需要有明确高度。

```vue
<div style="height: 500px">
  <el-table height="100%">
    ...
  </el-table>
</div>
```

---

## 最佳实践

### 1. 使用 `row-key` 优化性能

为表格数据设置唯一标识，提升渲染性能：

```vue
<el-table :data="tableData" row-key="id">
```

### 2. 合理使用 `min-width` 和 `width`

- 固定列使用 `width`
- 自适应列使用 `min-width`

### 3. 大数据表格使用虚拟滚动

数据量超过 1000 条时，考虑使用虚拟滚动：

```ts
import { ElTableV2 } from 'element-plus'
```

### 4. 统一处理表格操作

将增删改查操作封装为统一方法：

```ts
const tableOperations = {
  add: () => { /* ... */ },
  edit: (row: any) => { /* ... */ },
  delete: (row: any) => { /* ... */ },
  batchDelete: (rows: any[]) => { /* ... */ }
}
```

### 5. 表格加载状态管理

```vue
<el-table v-loading="loading" :data="tableData">
```

---

## 参考资料

- [Element Plus Table 官方文档](https://element-plus.org/zh-CN/component/table.html)
- [Element Plus TableV2 虚拟化表格](https://element-plus.org/zh-CN/component/table-v2.html)
