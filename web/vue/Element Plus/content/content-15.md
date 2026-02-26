# 表格复杂场景

## 概述

本章聚焦表格在实际项目中的复杂应用场景，包括可编辑表格、拖拽排序、虚拟滚动、Excel 导出等高级功能，解决大数据量和复杂交互需求。

## 核心技术栈

### 拖拽排序
- **Sortable.js** - 轻量级拖拽库
- 与 `el-table` 集成实现行拖拽

### 虚拟滚动
- **el-table-v2** - Element Plus 虚拟化表格组件
- 处理万级数据渲染

### Excel 导出
- **xlsx** - Excel 文件处理库
- 支持导出和导入

## 完整实战样例

### 示例 1：可编辑表格 - 商品价格批量修改

行内编辑功能，支持批量保存。

```vue
<template>
  <div class="editable-table-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品价格管理</span>
          <el-space>
            <el-button
              type="success"
              :disabled="!hasChanges"
              @click="handleSaveAll"
            >
              保存全部修改 ({{ changedRows.size }})
            </el-button>
            <el-button @click="handleCancel">
              取消修改
            </el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="tableData" border>
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="name" label="商品名称" width="200" />
        
        <el-table-column label="原价" width="150" align="right">
          <template #default="{ row }">
            ¥{{ row.originalPrice.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column label="现价" width="200">
          <template #default="{ row }">
            <div v-if="row.editing" class="edit-cell">
              <el-input-number
                v-model="row.price"
                :min="0"
                :precision="2"
                size="small"
                @change="handlePriceChange(row)"
              />
            </div>
            <div v-else class="price-display">
              <span :class="{ 'price-changed': isChanged(row) }">
                ¥{{ row.price.toFixed(2) }}
              </span>
              <el-tag v-if="isChanged(row)" type="warning" size="small">
                已修改
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="折扣" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getDiscountType(row)">
              {{ calculateDiscount(row) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="stock" label="库存" width="100" align="center" />
        
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <template v-if="!row.editing">
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑价格
              </el-button>
            </template>
            <template v-else>
              <el-button type="success" size="small" @click="handleSave(row)">
                保存
              </el-button>
              <el-button size="small" @click="handleCancelEdit(row)">
                取消
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Product {
  id: number
  name: string
  originalPrice: number
  price: number
  stock: number
  status: 'active' | 'inactive'
  editing?: boolean
  _originalData?: Partial<Product>
}

const tableData = ref<Product[]>([
  { id: 1, name: 'iPhone 15 Pro 256GB', originalPrice: 7999, price: 7999, stock: 120, status: 'active' },
  { id: 2, name: 'MacBook Pro 16 M3', originalPrice: 18999, price: 18999, stock: 45, status: 'active' },
  { id: 3, name: 'AirPods Pro 2', originalPrice: 1899, price: 1899, stock: 200, status: 'active' },
  { id: 4, name: 'iPad Air 11', originalPrice: 4799, price: 4799, stock: 85, status: 'active' },
  { id: 5, name: 'Apple Watch Series 9', originalPrice: 2999, price: 2999, stock: 150, status: 'active' }
])

const changedRows = ref<Set<number>>(new Set())

const hasChanges = computed(() => changedRows.value.size > 0)

const isChanged = (row: Product) => {
  return changedRows.value.has(row.id)
}

const calculateDiscount = (row: Product) => {
  const discount = ((row.originalPrice - row.price) / row.originalPrice * 100)
  if (discount > 0) {
    return `-${discount.toFixed(0)}%`
  }
  return '无折扣'
}

const getDiscountType = (row: Product) => {
  const discount = (row.originalPrice - row.price) / row.originalPrice
  if (discount >= 0.3) return 'danger'
  if (discount >= 0.1) return 'warning'
  return 'info'
}

const handleEdit = (row: Product) => {
  row.editing = true
  row._originalData = { price: row.price }
}

const handlePriceChange = (row: Product) => {
  if (row.price !== row.originalPrice) {
    changedRows.value.add(row.id)
  } else {
    changedRows.value.delete(row.id)
  }
}

const handleSave = (row: Product) => {
  row.editing = false
  delete row._originalData
  ElMessage.success(`${row.name} 价格已更新`)
}

const handleCancelEdit = (row: Product) => {
  if (row._originalData) {
    row.price = row._originalData.price!
    changedRows.value.delete(row.id)
  }
  row.editing = false
  delete row._originalData
}

const handleSaveAll = () => {
  ElMessageBox.confirm(`确定保存 ${changedRows.value.size} 个商品的价格修改吗？`, '批量保存', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟批量保存
    const changedProducts = tableData.value.filter(row => changedRows.value.has(row.id))
    console.log('保存数据:', changedProducts)
    
    changedRows.value.clear()
    tableData.value.forEach(row => {
      row.editing = false
      delete row._originalData
    })
    
    ElMessage.success('批量保存成功')
  })
}

const handleCancel = () => {
  if (changedRows.value.size === 0) {
    ElMessage.info('没有需要取消的修改')
    return
  }
  
  ElMessageBox.confirm('确定取消所有修改吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tableData.value.forEach(row => {
      if (row._originalData) {
        row.price = row._originalData.price!
      }
      row.editing = false
      delete row._originalData
    })
    changedRows.value.clear()
    ElMessage.info('已取消所有修改')
  })
}

const handleStatusChange = (row: Product) => {
  const status = row.status === 'active' ? '上架' : '下架'
  ElMessage.success(`${row.name} 已${status}`)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-cell {
  display: flex;
  align-items: center;
}

.price-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-changed {
  color: #f56c6c;
  font-weight: bold;
}
</style>
```

**运行效果：**
- 点击"编辑价格"进入编辑模式
- 使用 InputNumber 修改价格
- 修改后显示"已修改"标签
- 实时计算折扣率
- 支持批量保存和取消修改

---

### 示例 2：拖拽排序 - 任务优先级调整

使用 Sortable.js 实现表格行拖拽排序。

```vue
<template>
  <div class="sortable-table-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务列表（拖拽调整优先级）</span>
          <el-button type="primary" @click="handleSaveOrder">
            保存排序
          </el-button>
        </div>
      </template>

      <el-alert
        title="提示"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      >
        按住任务行可以拖拽调整优先级顺序
      </el-alert>

      <el-table
        ref="tableRef"
        :data="tableData"
        border
        row-key="id"
        class="sortable-table"
      >
        <el-table-column label="排序" width="80" align="center">
          <template #default="{ $index }">
            <el-icon class="drag-handle" style="cursor: move">
              <Rank />
            </el-icon>
            {{ $index + 1 }}
          </template>
        </el-table-column>
        
        <el-table-column prop="title" label="任务标题" min-width="200" />
        
        <el-table-column prop="assignee" label="负责人" width="120" />
        
        <el-table-column prop="priority" label="优先级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="deadline" label="截止日期" width="120" />
        
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Rank } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'

type Priority = 'low' | 'medium' | 'high' | 'urgent'
type Status = 'todo' | 'inProgress' | 'done'

interface Task {
  id: number
  title: string
  assignee: string
  priority: Priority
  status: Status
  deadline: string
}

const tableRef = ref()
const tableData = ref<Task[]>([
  { id: 1, title: '完成用户管理模块', assignee: '张三', priority: 'high', status: 'inProgress', deadline: '2024-01-20' },
  { id: 2, title: '修复登录页面BUG', assignee: '李四', priority: 'urgent', status: 'todo', deadline: '2024-01-18' },
  { id: 3, title: '优化首页加载速度', assignee: '王五', priority: 'medium', status: 'todo', deadline: '2024-01-25' },
  { id: 4, title: '编写API文档', assignee: '赵六', priority: 'low', status: 'inProgress', deadline: '2024-01-30' },
  { id: 5, title: '数据库性能优化', assignee: '钱七', priority: 'high', status: 'todo', deadline: '2024-01-22' }
])

const getPriorityType = (priority: Priority) => {
  const map: Record<Priority, any> = {
    low: 'info',
    medium: '',
    high: 'warning',
    urgent: 'danger'
  }
  return map[priority]
}

const getPriorityText = (priority: Priority) => {
  const map: Record<Priority, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return map[priority]
}

const getStatusType = (status: Status) => {
  const map: Record<Status, any> = {
    todo: 'info',
    inProgress: 'warning',
    done: 'success'
  }
  return map[status]
}

const getStatusText = (status: Status) => {
  const map: Record<Status, string> = {
    todo: '待处理',
    inProgress: '进行中',
    done: '已完成'
  }
  return map[status]
}

onMounted(() => {
  nextTick(() => {
    initSortable()
  })
})

const initSortable = () => {
  const el = tableRef.value?.$el.querySelector('.el-table__body-wrapper tbody')
  if (!el) return
  
  Sortable.create(el, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: (evt: any) => {
      const { oldIndex, newIndex } = evt
      if (oldIndex === newIndex) return
      
      const movedItem = tableData.value[oldIndex]
      tableData.value.splice(oldIndex, 1)
      tableData.value.splice(newIndex, 0, movedItem)
      
      ElMessage.success('排序已更新')
    }
  })
}

const handleSaveOrder = () => {
  const orderData = tableData.value.map((item, index) => ({
    id: item.id,
    order: index + 1
  }))
  console.log('保存排序:', orderData)
  ElMessage.success('排序保存成功')
}

const handleEdit = (row: Task) => {
  ElMessage.info(`编辑任务：${row.title}`)
}

const handleDelete = (row: Task) => {
  const index = tableData.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    tableData.value.splice(index, 1)
    ElMessage.success('删除成功')
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sortable-table :deep(.el-table__row) {
  cursor: move;
}

.drag-handle {
  cursor: move;
  margin-right: 4px;
}
</style>
```

**运行效果：**
- 鼠标悬停显示拖拽图标
- 拖拽行可以调整顺序
- 拖拽完成后实时更新排序
- 点击"保存排序"持久化顺序

**依赖安装：**
```bash
npm install sortablejs
npm install -D @types/sortablejs
```

---

### 示例 3：Excel 导出 - 数据报表导出

将表格数据导出为 Excel 文件。

```vue
<template>
  <div class="excel-export-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>销售数据报表</span>
          <el-space>
            <el-button type="success" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出 Excel
            </el-button>
            <el-button type="primary" @click="handleExportSelected">
              导出选中数据
            </el-button>
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept=".xlsx,.xls"
              :on-change="handleImport"
            >
              <el-button type="warning">
                <el-icon><Upload /></el-icon>
                导入 Excel
              </el-button>
            </el-upload>
          </el-space>
        </div>
      </template>

      <el-table
        ref="tableRef"
        :data="tableData"
        border
        show-summary
        :summary-method="getSummaries"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="date" label="日期" width="120" />
        
        <el-table-column prop="region" label="区域" width="100" />
        
        <el-table-column prop="product" label="产品" width="180" />
        
        <el-table-column prop="quantity" label="销量" width="100" align="right" />
        
        <el-table-column prop="price" label="单价" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column label="销售额" width="150" align="right">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">
              ¥{{ (row.quantity * row.price).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="salesPerson" label="销售员" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Upload } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import type { TableColumnCtx } from 'element-plus'

interface SalesData {
  date: string
  region: string
  product: string
  quantity: number
  price: number
  salesPerson: string
}

const tableRef = ref()
const selectedRows = ref<SalesData[]>([])

const tableData = ref<SalesData[]>([
  { date: '2024-01-15', region: '华东', product: 'iPhone 15 Pro', quantity: 50, price: 7999, salesPerson: '张三' },
  { date: '2024-01-15', region: '华北', product: 'MacBook Pro', quantity: 20, price: 18999, salesPerson: '李四' },
  { date: '2024-01-16', region: '华南', product: 'AirPods Pro 2', quantity: 100, price: 1899, salesPerson: '王五' },
  { date: '2024-01-16', region: '华东', product: 'iPad Air', quantity: 35, price: 4799, salesPerson: '赵六' },
  { date: '2024-01-17', region: '华北', product: 'Apple Watch 9', quantity: 60, price: 2999, salesPerson: '钱七' }
])

const handleSelectionChange = (selection: SalesData[]) => {
  selectedRows.value = selection
}

const getSummaries = (param: { columns: TableColumnCtx<SalesData>[]; data: SalesData[] }) => {
  const { columns, data } = param
  const sums: (string | number)[] = []
  
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = ''
      return
    }
    if (index === 1) {
      sums[index] = '合计'
      return
    }
    if (index === 2 || index === 3 || index === 7) {
      sums[index] = ''
      return
    }
    
    if (column.property === 'quantity') {
      const total = data.reduce((sum, item) => sum + item.quantity, 0)
      sums[index] = total
    } else if (column.property === 'price') {
      sums[index] = '平均'
    } else if (index === 6) {
      const total = data.reduce((sum, item) => sum + item.quantity * item.price, 0)
      sums[index] = `¥${total.toFixed(2)}`
    }
  })
  
  return sums
}

// 导出所有数据
const handleExport = () => {
  const data = tableData.value.map(row => ({
    '日期': row.date,
    '区域': row.region,
    '产品': row.product,
    '销量': row.quantity,
    '单价': row.price,
    '销售额': row.quantity * row.price,
    '销售员': row.salesPerson
  }))
  
  exportToExcel(data, '销售数据报表')
}

// 导出选中数据
const handleExportSelected = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  
  const data = selectedRows.value.map(row => ({
    '日期': row.date,
    '区域': row.region,
    '产品': row.product,
    '销量': row.quantity,
    '单价': row.price,
    '销售额': row.quantity * row.price,
    '销售员': row.salesPerson
  }))
  
  exportToExcel(data, `销售数据报表_选中${selectedRows.value.length}条`)
}

// Excel 导出核心方法
const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  
  // 设置列宽
  const colWidths = [
    { wch: 12 }, // 日期
    { wch: 10 }, // 区域
    { wch: 20 }, // 产品
    { wch: 10 }, // 销量
    { wch: 12 }, // 单价
    { wch: 15 }, // 销售额
    { wch: 12 }  // 销售员
  ]
  worksheet['!cols'] = colWidths
  
  XLSX.writeFile(workbook, `${filename}.xlsx`)
  ElMessage.success('导出成功')
}

// Excel 导入
const handleImport = (file: any) => {
  const reader = new FileReader()
  
  reader.onload = (e: any) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      // 数据映射
      const importedData: SalesData[] = jsonData.map((row: any) => ({
        date: row['日期'],
        region: row['区域'],
        product: row['产品'],
        quantity: row['销量'],
        price: row['单价'],
        salesPerson: row['销售员']
      }))
      
      tableData.value = [...tableData.value, ...importedData]
      ElMessage.success(`成功导入 ${importedData.length} 条数据`)
    } catch (error) {
      ElMessage.error('导入失败，请检查文件格式')
      console.error(error)
    }
  }
  
  reader.readAsArrayBuffer(file.raw)
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
- 点击"导出 Excel"导出所有数据
- 选中行后可导出选中数据
- 支持上传 Excel 文件导入数据
- 自动设置列宽和样式

**依赖安装：**
```bash
npm install xlsx
```

---

## 常见踩坑

### 1. 可编辑表格数据不更新

**问题：** 修改数据后视图不更新。

**解决：** 确保修改的是响应式数据。

```ts
// ❌ 错误
row.price = newPrice

// ✅ 正确
tableData.value[index] = { ...row, price: newPrice }
```

---

### 2. 拖拽排序后数据混乱

**问题：** 拖拽后分页或筛选导致数据顺序混乱。

**解决：** 使用 `row-key` 保持数据关联。

```vue
<el-table :data="tableData" row-key="id">
```

---

### 3. Excel 导出中文乱码

**问题：** 导出的 Excel 文件打开后中文显示乱码。

**解决：** 使用 UTF-8 BOM 编码。

```ts
import { write, utils } from 'xlsx'

const workbook = utils.book_new()
// ... 添加数据
const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' })
const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
```

---

## 最佳实践

### 1. 可编辑表格状态管理

使用独立的编辑状态对象：

```ts
const editingState = ref<Record<number, boolean>>({})
const changedData = ref<Record<number, Partial<RowData>>>({})
```

### 2. 拖拽性能优化

大数据量时限制拖拽范围：

```ts
Sortable.create(el, {
  handle: '.drag-handle',
  animation: 150,
  // 只允许同页拖拽
  group: 'table-rows'
})
```

### 3. Excel 导出数据格式化

统一处理数据格式：

```ts
const formatExportData = (data: any[]) => {
  return data.map(row => ({
    ...row,
    price: `¥${row.price.toFixed(2)}`,
    date: dayjs(row.date).format('YYYY-MM-DD')
  }))
}
```

---

## 参考资料

- [Sortable.js 官方文档](https://sortablejs.github.io/Sortable/)
- [SheetJS (xlsx) 文档](https://docs.sheetjs.com/)
- [Element Plus Table V2 虚拟化表格](https://element-plus.org/zh-CN/component/table-v2.html)
