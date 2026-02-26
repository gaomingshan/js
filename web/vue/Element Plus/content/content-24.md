# 步骤条与时间线

## 概述

`el-steps`（步骤条）和 `el-timeline`（时间线）用于展示流程进度和时间顺序。步骤条常用于多步骤表单、流程引导，时间线用于展示历史记录、操作日志。

## 核心属性与事件

### Steps 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `active` | 当前激活步骤的索引 | `number` | `0` |
| `direction` | 显示方向 | `'horizontal' / 'vertical'` | `'horizontal'` |
| `simple` | 是否应用简洁风格 | `boolean` | `false` |
| `finish-status` | 已完成步骤的状态 | `'wait' / 'process' / 'finish' / 'error' / 'success'` | `'finish'` |
| `process-status` | 当前步骤的状态 | `'wait' / 'process' / 'finish' / 'error' / 'success'` | `'process'` |
| `align-center` | 进行居中对齐 | `boolean` | `false` |

### Step 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `title` | 标题 | `string` | - |
| `description` | 描述性文字 | `string` | - |
| `icon` | 自定义图标 | `Component` | - |
| `status` | 当前步骤的状态 | `'wait' / 'process' / 'finish' / 'error' / 'success'` | - |

### Timeline 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `reverse` | 是否倒序 | `boolean` | `false` |

### Timeline Item 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `timestamp` | 时间戳 | `string` | - |
| `placement` | 时间戳位置 | `'top' / 'bottom'` | `'bottom'` |
| `type` | 节点类型 | `'primary' / 'success' / 'warning' / 'danger' / 'info'` | - |
| `color` | 节点颜色 | `string` | - |
| `size` | 节点尺寸 | `'normal' / 'large'` | `'normal'` |
| `icon` | 自定义图标 | `Component` | - |

## 完整实战样例

### 示例 1：步骤条 - 多步骤表单

商品发布流程的多步骤表单。

```vue
<template>
  <div class="steps-demo">
    <el-card>
      <template #header>
        <span>Steps 步骤条示例</span>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="20">
        <!-- 基础步骤条 -->
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>基础步骤条</span>
              <el-space>
                <el-button size="small" @click="currentStep > 0 && currentStep--">
                  上一步
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="currentStep < 3 && currentStep++"
                >
                  下一步
                </el-button>
              </el-space>
            </div>
          </template>

          <el-steps :active="currentStep" finish-status="success">
            <el-step title="填写信息" description="填写基本信息" />
            <el-step title="确认信息" description="确认填写内容" />
            <el-step title="提交审核" description="等待审核" />
            <el-step title="完成" description="流程结束" />
          </el-steps>

          <div style="margin-top: 32px; padding: 20px; background: #f5f7fa; border-radius: 4px">
            <h4>当前步骤：{{ stepNames[currentStep] }}</h4>
            <p>这是第 {{ currentStep + 1 }} 步的内容区域</p>
          </div>
        </el-card>

        <!-- 垂直步骤条 -->
        <el-card shadow="never">
          <template #header>
            <span>垂直步骤条</span>
          </template>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-steps :active="1" direction="vertical">
                <el-step title="步骤 1" description="这是描述信息" />
                <el-step title="步骤 2" description="这是描述信息" />
                <el-step title="步骤 3" description="这是描述信息" />
                <el-step title="步骤 4" description="这是描述信息" />
              </el-steps>
            </el-col>
            <el-col :span="16">
              <el-card shadow="always">
                <h4>内容区域</h4>
                <p>这里显示当前步骤的详细内容</p>
              </el-card>
            </el-col>
          </el-row>
        </el-card>

        <!-- 简洁风格 -->
        <el-card shadow="never">
          <template #header>
            <span>简洁风格步骤条</span>
          </template>

          <el-steps :active="2" simple>
            <el-step title="基本信息" />
            <el-step title="配置参数" />
            <el-step title="上传文件" />
            <el-step title="完成" />
          </el-steps>
        </el-card>

        <!-- 自定义图标 -->
        <el-card shadow="never">
          <template #header>
            <span>自定义图标</span>
          </template>

          <el-steps :active="1" finish-status="success">
            <el-step title="登录">
              <template #icon>
                <el-icon><User /></el-icon>
              </template>
            </el-step>
            <el-step title="验证身份">
              <template #icon>
                <el-icon><Lock /></el-icon>
              </template>
            </el-step>
            <el-step title="选择权限">
              <template #icon>
                <el-icon><Setting /></el-icon>
              </template>
            </el-step>
            <el-step title="完成设置">
              <template #icon>
                <el-icon><CircleCheck /></el-icon>
              </template>
            </el-step>
          </el-steps>
        </el-card>

        <!-- 完整流程示例 -->
        <el-card shadow="never">
          <template #header>
            <span>商品发布流程</span>
          </template>

          <el-steps :active="publishStep" align-center finish-status="success">
            <el-step title="基本信息" />
            <el-step title="商品图片" />
            <el-step title="商品详情" />
            <el-step title="规格库存" />
            <el-step title="预览发布" />
          </el-steps>

          <div class="step-content">
            <!-- 步骤 1 -->
            <div v-if="publishStep === 0" class="step-panel">
              <h3>填写基本信息</h3>
              <el-form :model="productForm" label-width="100px">
                <el-form-item label="商品名称">
                  <el-input v-model="productForm.name" placeholder="请输入商品名称" />
                </el-form-item>
                <el-form-item label="商品分类">
                  <el-select v-model="productForm.category" placeholder="请选择分类" style="width: 100%">
                    <el-option label="电子产品" value="electronics" />
                    <el-option label="服装鞋包" value="clothing" />
                    <el-option label="食品饮料" value="food" />
                  </el-select>
                </el-form-item>
                <el-form-item label="商品价格">
                  <el-input-number v-model="productForm.price" :min="0" :precision="2" />
                </el-form-item>
              </el-form>
            </div>

            <!-- 步骤 2 -->
            <div v-if="publishStep === 1" class="step-panel">
              <h3>上传商品图片</h3>
              <el-upload
                action="#"
                list-type="picture-card"
                :auto-upload="false"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </div>

            <!-- 步骤 3 -->
            <div v-if="publishStep === 2" class="step-panel">
              <h3>填写商品详情</h3>
              <el-input
                v-model="productForm.description"
                type="textarea"
                :rows="6"
                placeholder="请输入商品详情描述"
              />
            </div>

            <!-- 步骤 4 -->
            <div v-if="publishStep === 3" class="step-panel">
              <h3>设置规格和库存</h3>
              <el-form-item label="库存数量">
                <el-input-number v-model="productForm.stock" :min="0" />
              </el-form-item>
            </div>

            <!-- 步骤 5 -->
            <div v-if="publishStep === 4" class="step-panel">
              <h3>预览并发布</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="商品名称">{{ productForm.name || '-' }}</el-descriptions-item>
                <el-descriptions-item label="分类">{{ productForm.category || '-' }}</el-descriptions-item>
                <el-descriptions-item label="价格">¥{{ productForm.price || 0 }}</el-descriptions-item>
                <el-descriptions-item label="库存">{{ productForm.stock || 0 }}</el-descriptions-item>
                <el-descriptions-item label="描述" :span="2">
                  {{ productForm.description || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>

          <div class="step-actions">
            <el-button v-if="publishStep > 0" @click="publishStep--">
              上一步
            </el-button>
            <el-button
              v-if="publishStep < 4"
              type="primary"
              @click="publishStep++"
            >
              下一步
            </el-button>
            <el-button
              v-if="publishStep === 4"
              type="success"
              @click="handlePublish"
            >
              发布商品
            </el-button>
          </div>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  Lock,
  Setting,
  CircleCheck,
  Plus
} from '@element-plus/icons-vue'

const currentStep = ref(0)
const stepNames = ['填写信息', '确认信息', '提交审核', '完成']

const publishStep = ref(0)
const productForm = ref({
  name: '',
  category: '',
  price: 0,
  description: '',
  stock: 0
})

const handlePublish = () => {
  ElMessage.success('商品发布成功！')
  publishStep.value = 0
  productForm.value = {
    name: '',
    category: '',
    price: 0,
    description: '',
    stock: 0
  }
}
</script>

<style scoped>
.steps-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.step-content {
  margin: 32px 0;
  min-height: 300px;
}

.step-panel {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.step-panel h3 {
  margin: 0 0 20px 0;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}
</style>
```

**运行效果：**
- 水平和垂直方向的步骤条
- 简洁风格步骤条
- 自定义图标步骤条
- 完整的商品发布流程，包含表单验证和预览

---

### 示例 2：时间线 - 操作日志

展示操作记录和历史事件。

```vue
<template>
  <div class="timeline-demo">
    <el-card>
      <template #header>
        <span>Timeline 时间线示例</span>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="20">
        <!-- 基础时间线 -->
        <el-card shadow="never">
          <template #header>
            <span>基础时间线</span>
          </template>

          <el-timeline>
            <el-timeline-item timestamp="2024/01/15 10:30" placement="top">
              <h4>更新 GitHub 模板</h4>
              <p>张三 提交了 5 个文件变更</p>
            </el-timeline-item>
            <el-timeline-item timestamp="2024/01/15 11:20" placement="top">
              <h4>更新 README 文档</h4>
              <p>李四 更新了项目文档</p>
            </el-timeline-item>
            <el-timeline-item timestamp="2024/01/15 14:35" placement="top">
              <h4>代码审查完成</h4>
              <p>王五 完成了代码审查</p>
            </el-timeline-item>
            <el-timeline-item timestamp="2024/01/15 16:50" placement="top">
              <h4>合并 PR #1234</h4>
              <p>赵六 合并了 Pull Request</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 不同类型节点 -->
        <el-card shadow="never">
          <template #header>
            <span>不同类型和颜色</span>
          </template>

          <el-timeline>
            <el-timeline-item timestamp="2024/01/15" type="primary">
              创建项目
            </el-timeline-item>
            <el-timeline-item timestamp="2024/01/16" type="success">
              开发完成
            </el-timeline-item>
            <el-timeline-item timestamp="2024/01/17" type="warning">
              测试发现问题
            </el-timeline-item>
            <el-timeline-item timestamp="2024/01/18" type="danger">
              紧急修复 Bug
            </el-timeline-item>
            <el-timeline-item timestamp="2024/01/19" type="info">
              版本发布
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 自定义节点 -->
        <el-card shadow="never">
          <template #header>
            <span>自定义节点图标</span>
          </template>

          <el-timeline>
            <el-timeline-item timestamp="2024/01/15 10:00" size="large">
              <template #dot>
                <el-icon color="#409eff" :size="20"><User /></el-icon>
              </template>
              <h4>用户注册</h4>
              <p>新用户 "张三" 注册成功</p>
            </el-timeline-item>

            <el-timeline-item timestamp="2024/01/15 10:30" size="large">
              <template #dot>
                <el-icon color="#67c23a" :size="20"><CircleCheck /></el-icon>
              </template>
              <h4>身份验证</h4>
              <p>用户完成身份验证</p>
            </el-timeline-item>

            <el-timeline-item timestamp="2024/01/15 11:00" size="large">
              <template #dot>
                <el-icon color="#e6a23c" :size="20"><Setting /></el-icon>
              </template>
              <h4>配置信息</h4>
              <p>用户更新个人配置</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 实际场景：订单跟踪 -->
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>订单跟踪</span>
              <el-tag>订单号：ORD20240115001</el-tag>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in orderActivities"
              :key="index"
              :timestamp="activity.timestamp"
              :type="activity.type"
              :size="activity.size"
            >
              <template v-if="activity.icon" #dot>
                <el-icon :color="activity.color" :size="20">
                  <component :is="activity.icon" />
                </el-icon>
              </template>
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
              <el-tag v-if="activity.status" :type="activity.statusType" size="small">
                {{ activity.status }}
              </el-tag>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 实际场景：系统日志 -->
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>系统操作日志</span>
              <el-space>
                <el-radio-group v-model="logType" size="small">
                  <el-radio-button label="all">全部</el-radio-button>
                  <el-radio-button label="success">成功</el-radio-button>
                  <el-radio-button label="error">失败</el-radio-button>
                </el-radio-group>
                <el-button size="small" @click="refreshLogs">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </el-space>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="log in filteredLogs"
              :key="log.id"
              :timestamp="log.time"
              :type="log.type"
            >
              <div class="log-item">
                <div class="log-header">
                  <span class="log-user">{{ log.user }}</span>
                  <el-tag :type="log.type" size="small">{{ log.action }}</el-tag>
                </div>
                <div class="log-content">
                  {{ log.content }}
                </div>
                <div class="log-meta">
                  <span>IP: {{ log.ip }}</span>
                  <span>浏览器: {{ log.browser }}</span>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>

          <el-empty v-if="filteredLogs.length === 0" description="暂无日志记录" />
        </el-card>

        <!-- 倒序时间线 -->
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>倒序时间线</span>
              <el-switch
                v-model="reverseTimeline"
                active-text="倒序"
                inactive-text="正序"
              />
            </div>
          </template>

          <el-timeline :reverse="reverseTimeline">
            <el-timeline-item
              v-for="i in 5"
              :key="i"
              :timestamp="`2024/01/${15 + i}`"
            >
              事件 {{ i }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  CircleCheck,
  Setting,
  ShoppingCart,
  Tickets,
  Van,
  Box,
  Refresh
} from '@element-plus/icons-vue'

// 订单跟踪
const orderActivities = ref([
  {
    timestamp: '2024-01-15 10:30:00',
    title: '订单创建',
    description: '用户提交订单，等待付款',
    type: 'primary',
    size: 'large',
    icon: ShoppingCart,
    color: '#409eff',
    status: '待付款',
    statusType: 'warning'
  },
  {
    timestamp: '2024-01-15 10:35:00',
    title: '付款成功',
    description: '订单已付款，商家准备发货',
    type: 'success',
    size: 'large',
    icon: Tickets,
    color: '#67c23a',
    status: '已付款',
    statusType: 'success'
  },
  {
    timestamp: '2024-01-15 14:20:00',
    title: '商品出库',
    description: '商品已从仓库发出',
    type: 'info',
    size: 'large',
    icon: Box,
    color: '#909399',
    status: '已发货',
    statusType: 'info'
  },
  {
    timestamp: '2024-01-16 09:15:00',
    title: '运输中',
    description: '包裹正在配送中，预计今日送达',
    type: 'primary',
    size: 'large',
    icon: Van,
    color: '#409eff',
    status: '配送中',
    statusType: 'primary'
  },
  {
    timestamp: '2024-01-16 15:30:00',
    title: '订单完成',
    description: '包裹已签收，交易完成',
    type: 'success',
    size: 'large',
    icon: CircleCheck,
    color: '#67c23a',
    status: '已完成',
    statusType: 'success'
  }
])

// 系统日志
interface SystemLog {
  id: number
  user: string
  action: string
  content: string
  time: string
  type: 'success' | 'warning' | 'danger' | 'info'
  ip: string
  browser: string
}

const logType = ref('all')
const systemLogs = ref<SystemLog[]>([
  {
    id: 1,
    user: '张三',
    action: '登录',
    content: '用户登录系统',
    time: '2024-01-15 10:30:00',
    type: 'success',
    ip: '192.168.1.100',
    browser: 'Chrome 120'
  },
  {
    id: 2,
    user: '李四',
    action: '创建',
    content: '创建了新的用户账号',
    time: '2024-01-15 11:20:00',
    type: 'success',
    ip: '192.168.1.101',
    browser: 'Firefox 121'
  },
  {
    id: 3,
    user: '王五',
    action: '删除',
    content: '删除了过期数据',
    time: '2024-01-15 14:15:00',
    type: 'warning',
    ip: '192.168.1.102',
    browser: 'Safari 17'
  },
  {
    id: 4,
    user: '赵六',
    action: '失败',
    content: '尝试访问未授权资源',
    time: '2024-01-15 15:30:00',
    type: 'danger',
    ip: '192.168.1.103',
    browser: 'Edge 120'
  }
])

const filteredLogs = computed(() => {
  if (logType.value === 'all') return systemLogs.value
  if (logType.value === 'success') {
    return systemLogs.value.filter(log => log.type === 'success')
  }
  if (logType.value === 'error') {
    return systemLogs.value.filter(log => log.type === 'danger')
  }
  return systemLogs.value
})

const refreshLogs = () => {
  ElMessage.success('日志已刷新')
}

// 倒序
const reverseTimeline = ref(false)
</script>

<style scoped>
.timeline-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.log-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-user {
  font-weight: bold;
  color: #303133;
}

.log-content {
  margin: 8px 0;
  color: #606266;
}

.log-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}
</style>
```

**运行效果：**
- 基础时间线展示操作记录
- 不同类型和颜色的节点
- 自定义图标节点
- 订单跟踪完整流程
- 系统日志，支持筛选和刷新
- 正序/倒序切换

---

## 常见踩坑

### 1. Steps active 索引从 0 开始

**问题：** 以为 `active` 从 1 开始，导致步骤显示错误。

**解决：** `active` 索引从 0 开始。

```vue
<!-- 第一步 -->
<el-steps :active="0">
```

---

### 2. Timeline 节点过多导致页面过长

**问题：** 时间线内容过多，页面滚动困难。

**解决：** 使用分页或虚拟滚动，或设置固定高度。

```vue
<div style="max-height: 500px; overflow-y: auto">
  <el-timeline>
    ...
  </el-timeline>
</div>
```

---

### 3. Steps 垂直模式高度问题

**问题：** 垂直步骤条高度不够，内容显示不全。

**解决：** 给容器设置合适的高度。

```vue
<el-steps direction="vertical" style="min-height: 400px">
```

---

### 4. Timeline 时间戳格式不一致

**问题：** 不同时间戳格式混用，显示不美观。

**解决：** 统一格式化时间戳。

```ts
import dayjs from 'dayjs'

const formatTimestamp = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}
```

---

## 最佳实践

### 1. 步骤条状态管理

```ts
// useSteps.ts
export const useSteps = (totalSteps: number) => {
  const currentStep = ref(0)
  
  const next = () => {
    if (currentStep.value < totalSteps - 1) {
      currentStep.value++
    }
  }
  
  const prev = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }
  
  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      currentStep.value = step
    }
  }
  
  const isFirstStep = computed(() => currentStep.value === 0)
  const isLastStep = computed(() => currentStep.value === totalSteps - 1)
  
  return { currentStep, next, prev, goToStep, isFirstStep, isLastStep }
}
```

### 2. 时间线数据格式化

```ts
interface TimelineItem {
  id: number
  timestamp: string
  title: string
  description: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const formatTimelineData = (data: any[]): TimelineItem[] => {
  return data.map(item => ({
    id: item.id,
    timestamp: dayjs(item.time).format('YYYY-MM-DD HH:mm'),
    title: item.title,
    description: item.desc,
    type: getTypeByStatus(item.status)
  }))
}
```

### 3. 步骤条表单验证

```ts
const validateStep = async (step: number): Promise<boolean> => {
  if (step === 0) {
    return await formRef.value?.validate()
  }
  // 其他步骤验证逻辑
  return true
}

const handleNext = async () => {
  const isValid = await validateStep(currentStep.value)
  if (isValid) {
    currentStep.value++
  }
}
```

---

## 参考资料

- [Element Plus Steps 文档](https://element-plus.org/zh-CN/component/steps.html)
- [Element Plus Timeline 文档](https://element-plus.org/zh-CN/component/timeline.html)
