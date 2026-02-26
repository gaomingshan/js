# 表格高级功能

## 概述

本章深入探讨 `el-table` 的高级功能，包括展开行、树形数据、自定义表头、拖拽排序、单元格编辑等实用场景，帮助处理复杂的业务需求。

## 核心高级功能

### 展开行相关属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `type="expand"` | 展开行类型列 | `string` | - |
| `expand-row-keys` | 展开的行的 keys | `Array` | - |
| `default-expand-all` | 默认展开所有行 | `boolean` | `false` |

### 树形数据属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `row-key` | 行数据的 Key | `string/Function` | - |
| `tree-props` | 树形配置 | `Object` | `{ children: 'children', hasChildren: 'hasChildren' }` |
| `lazy` | 是否懒加载 | `boolean` | `false` |
| `load` | 加载子节点数据的函数 | `Function` | - |

### 合并单元格

| 方法 | 说明 | 参数 |
|------|------|------|
| `span-method` | 合并行或列的计算方法 | `({ row, column, rowIndex, columnIndex })` |

## 完整实战样例

### 示例 1：展开行详情

订单列表支持展开查看详细信息。

```vue
<template>
  <div class="expand-table-demo">
    <el-card>
      <template #header>
        <span>订单列表（点击展开查看详情）</span>
      </template>

      <el-table :data="tableData" border>
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <el-descriptions title="订单详情" :column="2" border>
                <el-descriptions-item label="订单号">
                  {{ row.orderNo }}
                </el-descriptions-item>
                <el-descriptions-item label="客户姓名">
                  {{ row.customer }}
                </el-descriptions-item>
                <el-descriptions-item label="联系电话">
                  {{ row.phone }}
                </el-descriptions-item>
                <el-descriptions-item label="订单状态">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="收货地址" :span="2">
                  {{ row.address }}
                </el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">
                  {{ row.remark || '无' }}
                </el-descriptions-item>
              </el-descriptions>

              <el-divider content-position="left">商品明细</el-divider>
              
              <el-table :data="row.items" border style="width: 100%">
                <el-table-column prop="productName" label="商品名称" width="200" />
                <el-table-column prop="spec" label="规格" width="150" />
                <el-table-column prop="price" label="单价" width="120" align="right">
                  <template #default="{ row: item }">
                    ¥{{ item.price.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="100" align="center" />
                <el-table-column label="小计" width="120" align="right">
                  <template #default="{ row: item }">
                    <span style="color: #f56c6c; font-weight: bold">
                      ¥{{ (item.price * item.quantity).toFixed(2) }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>

              <div class="order-summary">
                <el-space>
                  <span>商品总额：</span>
                  <span class="amount">¥{{ calculateTotal(row.items) }}</span>
                  <span>运费：</span>
                  <span class="amount">¥{{ row.shippingFee.toFixed(2) }}</span>
                  <span style="font-size: 16px; font-weight: bold">订单总额：</span>
                  <span class="total-amount">
                    ¥{{ (calculateTotal(row.items) + row.shippingFee).toFixed(2) }}
                  </span>
                </el-space>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="customer" label="客户" width="120" />
        <el-table-column prop="itemCount" label="商品数" width="100" align="center" />
        <el-table-column label="订单金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ (calculateTotal(row.items) + row.shippingFee).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="160" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed'

interface OrderItem {
  productName: string
  spec: string
  price: number
  quantity: number
}

interface Order {
  id: number
  orderNo: string
  customer: string
  phone: string
  address: string
  status: OrderStatus
  createTime: string
  remark: string
  shippingFee: number
  items: OrderItem[]
}

const tableData = ref<Order[]>([
  {
    id: 1,
    orderNo: 'ORD20240115001',
    customer: '张三',
    phone: '13800138000',
    address: '北京市朝阳区建国路88号SOHO现代城A座1001室',
    status: 'pending',
    createTime: '2024-01-15 10:30:00',
    remark: '请尽快发货',
    shippingFee: 10,
    items: [
      { productName: 'iPhone 15 Pro', spec: '256GB 黑色', price: 7999, quantity: 1 },
      { productName: 'AirPods Pro 2', spec: '标准版', price: 1899, quantity: 2 }
    ]
  },
  {
    id: 2,
    orderNo: 'ORD20240115002',
    customer: '李四',
    phone: '13900139000',
    address: '上海市浦东新区世纪大道1号',
    status: 'confirmed',
    createTime: '2024-01-15 11:20:00',
    remark: '',
    shippingFee: 15,
    items: [
      { productName: 'MacBook Pro 16', spec: 'M3 Max 16+512GB', price: 18999, quantity: 1 }
    ]
  }
])

const getStatusType = (status: OrderStatus) => {
  const map: Record<OrderStatus, any> = {
    pending: 'warning',
    confirmed: 'primary',
    shipped: 'info',
    completed: 'success'
  }
  return map[status]
}

const getStatusText = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    pending: '待处理',
    confirmed: '已确认',
    shipped: '已发货',
    completed: '已完成'
  }
  return map[status]
}

const calculateTotal = (items: OrderItem[]) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
</script>

<style scoped>
.expand-content {
  padding: 20px;
  background-color: #f5f7fa;
}

.order-summary {
  margin-top: 16px;
  padding: 12px;
  background-color: #fff;
  border-radius: 4px;
  text-align: right;
}

.amount {
  color: #409eff;
  font-weight: bold;
}

.total-amount {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}
</style>
```

**运行效果：**
- 点击展开按钮查看订单详细信息
- 展开内容包含订单信息、商品明细、金额汇总
- 使用 Descriptions 和嵌套 Table 组件
- 支持计算订单总额

---

### 示例 2：树形数据 - 部门管理

展示部门层级结构和懒加载子部门。

```vue
<template>
  <div class="tree-table-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>部门管理（树形结构）</span>
          <el-space>
            <el-button type="primary" @click="expandAll">
              全部展开
            </el-button>
            <el-button @click="collapseAll">
              全部收起
            </el-button>
          </el-space>
        </div>
      </template>

      <el-table
        ref="tableRef"
        :data="tableData"
        border
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
        lazy
        :load="loadChildren"
      >
        <el-table-column prop="name" label="部门名称" width="250" />
        
        <el-table-column prop="code" label="部门编码" width="150" />
        
        <el-table-column prop="manager" label="负责人" width="120" />
        
        <el-table-column prop="phone" label="联系电话" width="130" />
        
        <el-table-column prop="employeeCount" label="人数" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.employeeCount }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100" align="center">
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
            <el-button type="primary" size="small" link @click="handleAdd(row)">
              新增子部门
            </el-button>
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ElTable } from 'element-plus'

interface Department {
  id: number
  name: string
  code: string
  manager: string
  phone: string
  employeeCount: number
  status: 'active' | 'inactive'
  hasChildren?: boolean
  children?: Department[]
}

const tableRef = ref<InstanceType<typeof ElTable>>()

const tableData = ref<Department[]>([
  {
    id: 1,
    name: '技术部',
    code: 'TECH',
    manager: '张三',
    phone: '13800138000',
    employeeCount: 120,
    status: 'active',
    hasChildren: true,
    children: [
      {
        id: 11,
        name: '前端开发组',
        code: 'TECH-FE',
        manager: '李四',
        phone: '13900139000',
        employeeCount: 35,
        status: 'active',
        hasChildren: true
      },
      {
        id: 12,
        name: '后端开发组',
        code: 'TECH-BE',
        manager: '王五',
        phone: '13700137000',
        employeeCount: 45,
        status: 'active',
        hasChildren: false
      },
      {
        id: 13,
        name: '测试组',
        code: 'TECH-QA',
        manager: '赵六',
        phone: '13600136000',
        employeeCount: 20,
        status: 'active',
        hasChildren: false
      }
    ]
  },
  {
    id: 2,
    name: '产品部',
    code: 'PRODUCT',
    manager: '钱七',
    phone: '13500135000',
    employeeCount: 30,
    status: 'active',
    hasChildren: true
  },
  {
    id: 3,
    name: '市场部',
    code: 'MARKET',
    manager: '孙八',
    phone: '13400134000',
    employeeCount: 25,
    status: 'active',
    hasChildren: false
  }
])

// 懒加载子节点
const loadChildren = (row: Department, treeNode: any, resolve: Function) => {
  setTimeout(() => {
    // 模拟异步加载
    const children: Department[] = []
    
    if (row.id === 2) {
      children.push(
        {
          id: 21,
          name: '产品策划组',
          code: 'PRODUCT-PLAN',
          manager: '周九',
          phone: '13300133000',
          employeeCount: 15,
          status: 'active',
          hasChildren: false
        },
        {
          id: 22,
          name: '产品运营组',
          code: 'PRODUCT-OPS',
          manager: '吴十',
          phone: '13200132000',
          employeeCount: 15,
          status: 'active',
          hasChildren: false
        }
      )
    } else if (row.id === 11) {
      children.push(
        {
          id: 111,
          name: 'Vue 开发小组',
          code: 'TECH-FE-VUE',
          manager: '郑十一',
          phone: '13100131000',
          employeeCount: 18,
          status: 'active',
          hasChildren: false
        },
        {
          id: 112,
          name: 'React 开发小组',
          code: 'TECH-FE-REACT',
          manager: '陈十二',
          phone: '13000130000',
          employeeCount: 17,
          status: 'active',
          hasChildren: false
        }
      )
    }
    
    resolve(children)
  }, 500)
}

const expandAll = () => {
  // 展开所有节点（需要手动遍历实现）
  ElMessage.info('全部展开功能')
}

const collapseAll = () => {
  ElMessage.info('全部收起功能')
}

const handleStatusChange = (row: Department) => {
  const status = row.status === 'active' ? '启用' : '禁用'
  ElMessage.success(`${row.name} 已${status}`)
}

const handleAdd = (row: Department) => {
  ElMessage.info(`为 ${row.name} 添加子部门`)
}

const handleEdit = (row: Department) => {
  ElMessage.info(`编辑部门：${row.name}`)
}

const handleDelete = (row: Department) => {
  ElMessage.warning(`删除部门：${row.name}`)
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
- 树形结构展示部门层级
- 支持懒加载子节点
- 状态可以通过 Switch 切换
- 每个节点可以添加子部门

---

### 示例 3：单元格合并 - 报表统计

合并相同数据的单元格，常用于报表。

```vue
<template>
  <div class="merge-cell-demo">
    <el-card>
      <template #header>
        <span>销售统计报表（合并单元格）</span>
      </template>

      <el-table
        :data="tableData"
        border
        :span-method="objectSpanMethod"
        show-summary
        :summary-method="getSummaries"
      >
        <el-table-column prop="region" label="区域" width="120" align="center" />
        
        <el-table-column prop="city" label="城市" width="120" align="center" />
        
        <el-table-column prop="product" label="产品" width="180" />
        
        <el-table-column prop="salesAmount" label="销售额" width="150" align="right">
          <template #default="{ row }">
            ¥{{ row.salesAmount.toLocaleString() }}
          </template>
        </el-table-column>
        
        <el-table-column prop="quantity" label="销量" width="100" align="center" />
        
        <el-table-column prop="salesPerson" label="销售员" width="120" />
        
        <el-table-column prop="quarter" label="季度" width="100" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TableColumnCtx } from 'element-plus'

interface SalesData {
  region: string
  city: string
  product: string
  salesAmount: number
  quantity: number
  salesPerson: string
  quarter: string
}

const tableData = ref<SalesData[]>([
  { region: '华东', city: '上海', product: 'iPhone 15', salesAmount: 2400000, quantity: 300, salesPerson: '张三', quarter: 'Q1' },
  { region: '华东', city: '上海', product: 'MacBook Pro', salesAmount: 1900000, quantity: 100, salesPerson: '李四', quarter: 'Q1' },
  { region: '华东', city: '杭州', product: 'iPhone 15', salesAmount: 1600000, quantity: 200, salesPerson: '王五', quarter: 'Q1' },
  { region: '华东', city: '杭州', product: 'iPad Air', salesAmount: 960000, quantity: 200, salesPerson: '赵六', quarter: 'Q1' },
  { region: '华北', city: '北京', product: 'iPhone 15', salesAmount: 3200000, quantity: 400, salesPerson: '钱七', quarter: 'Q1' },
  { region: '华北', city: '北京', product: 'AirPods Pro', salesAmount: 570000, quantity: 300, salesPerson: '孙八', quarter: 'Q1' },
  { region: '华北', city: '天津', product: 'iPhone 15', salesAmount: 1200000, quantity: 150, salesPerson: '周九', quarter: 'Q1' }
])

// 单元格合并逻辑
const objectSpanMethod = ({
  row,
  column,
  rowIndex,
  columnIndex
}: {
  row: SalesData
  column: TableColumnCtx<SalesData>
  rowIndex: number
  columnIndex: number
}) => {
  // 合并区域列
  if (columnIndex === 0) {
    if (rowIndex === 0) {
      return { rowspan: 4, colspan: 1 }
    } else if (rowIndex === 4) {
      return { rowspan: 3, colspan: 1 }
    } else if (rowIndex > 0 && rowIndex < 4) {
      return { rowspan: 0, colspan: 0 }
    } else if (rowIndex > 4 && rowIndex < 7) {
      return { rowspan: 0, colspan: 0 }
    }
  }
  
  // 合并城市列
  if (columnIndex === 1) {
    if (rowIndex === 0 || rowIndex === 2 || rowIndex === 4 || rowIndex === 6) {
      const nextRow = tableData.value[rowIndex + 1]
      if (nextRow && nextRow.city === row.city) {
        return { rowspan: 2, colspan: 1 }
      }
      return { rowspan: 1, colspan: 1 }
    } else {
      const prevRow = tableData.value[rowIndex - 1]
      if (prevRow && prevRow.city === row.city) {
        return { rowspan: 0, colspan: 0 }
      }
    }
  }
  
  return { rowspan: 1, colspan: 1 }
}

// 合计行
const getSummaries = (param: { columns: TableColumnCtx<SalesData>[]; data: SalesData[] }) => {
  const { columns, data } = param
  const sums: (string | number)[] = []
  
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '总计'
      return
    }
    if (index === 1 || index === 2 || index === 5 || index === 6) {
      sums[index] = ''
      return
    }
    
    const values = data.map(item => {
      if (column.property === 'salesAmount') return item.salesAmount
      if (column.property === 'quantity') return item.quantity
      return 0
    })
    
    if (!values.every(value => Number.isNaN(value))) {
      const total = values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!Number.isNaN(value)) {
          return prev + curr
        }
        return prev
      }, 0)
      
      if (column.property === 'salesAmount') {
        sums[index] = `¥${total.toLocaleString()}`
      } else {
        sums[index] = total
      }
    } else {
      sums[index] = ''
    }
  })
  
  return sums
}
</script>

<style scoped>
:deep(.el-table__footer-wrapper .cell) {
  font-weight: bold;
  color: #f56c6c;
}
</style>
```

**运行效果：**
- 区域列合并相同区域的行
- 城市列合并相同城市的行
- 底部显示合计行
- 合计行高亮显示

---

## 常见踩坑

### 1. 树形数据懒加载无限循环

**问题：** `hasChildren` 设置不当导致重复加载。

**解决：** 确保加载完成后设置 `hasChildren: false`。

```ts
const loadChildren = (row: any, treeNode: any, resolve: Function) => {
  fetchData(row.id).then(children => {
    // 如果没有子节点，标记为 false
    if (children.length === 0) {
      row.hasChildren = false
    }
    resolve(children)
  })
}
```

---

### 2. 展开行内部表格样式问题

**问题：** 展开行内的嵌套表格样式异常。

**解决：** 给展开内容添加独立的样式作用域。

```vue
<el-table-column type="expand">
  <template #default="{ row }">
    <div class="expand-wrapper">
      <el-table :data="row.children">
        ...
      </el-table>
    </div>
  </template>
</el-table-column>

<style scoped>
.expand-wrapper {
  padding: 20px;
  background: #f5f7fa;
}
</style>
```

---

### 3. `span-method` 计算错误

**问题：** 合并单元格计算逻辑复杂，容易出错。

**解决：** 先计算每个分组的起始位置和数量，再返回合并配置。

```ts
// 先预处理数据，计算分组信息
const spanInfo = computed(() => {
  const result: Record<number, { rowspan: number; shown: boolean }> = {}
  let currentGroup = ''
  let startIndex = 0
  
  tableData.value.forEach((row, index) => {
    if (row.region !== currentGroup) {
      currentGroup = row.region
      startIndex = index
    }
    
    // ... 计算逻辑
  })
  
  return result
})
```

---

## 最佳实践

### 1. 展开行优化

展开内容较复杂时，使用动态组件按需加载：

```vue
<el-table-column type="expand">
  <template #default="{ row }">
    <component :is="ExpandDetail" :data="row" />
  </template>
</el-table-column>
```

### 2. 树形表格性能优化

使用虚拟滚动和懒加载结合：

```vue
<el-table
  row-key="id"
  lazy
  :load="loadChildren"
  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
>
```

### 3. 合并单元格数据预处理

将合并逻辑从渲染函数中分离：

```ts
const processedData = computed(() => {
  return tableData.value.map((row, index) => ({
    ...row,
    _spanInfo: calculateSpan(row, index)
  }))
})
```

---

## 参考资料

- [Element Plus Table 展开行](https://element-plus.org/zh-CN/component/table.html#%E5%B1%95%E5%BC%80%E8%A1%8C)
- [Element Plus Table 树形数据](https://element-plus.org/zh-CN/component/table.html#%E6%A0%91%E5%BD%A2%E6%95%B0%E6%8D%AE%E4%B8%8E%E6%87%92%E5%8A%A0%E8%BD%BD)
