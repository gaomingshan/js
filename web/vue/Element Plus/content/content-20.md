# 加载与进度组件

## 概述

加载与进度组件用于向用户展示任务的执行状态，包括 `v-loading`（加载指令）、`el-progress`（进度条）、`el-skeleton`（骨架屏）。合理使用这些组件可以提升用户体验，减少等待焦虑。

## 核心属性与 API

### Loading 指令

```ts
// 指令方式
v-loading="loading"

// 服务方式
const loadingInstance = ElLoading.service(options)
loadingInstance.close()
```

**指令修饰符：**

| 修饰符 | 说明 |
|--------|------|
| `v-loading.fullscreen` | 全屏加载 |
| `v-loading.lock` | 锁定屏幕滚动 |

**核心配置：**

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `element-loading-text` | 加载文案 | `string` | - |
| `element-loading-spinner` | 自定义加载图标 | `string` | - |
| `element-loading-background` | 背景色 | `string` | `rgba(0, 0, 0, 0.7)` |
| `element-loading-svg` | 自定义 SVG 图标 | `string` | - |

### Progress 进度条

**核心属性：**

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `percentage` | 百分比 | `number` | `0` |
| `type` | 进度条类型 | `'line' / 'circle' / 'dashboard'` | `'line'` |
| `status` | 进度条状态 | `'success' / 'exception' / 'warning'` | - |
| `stroke-width` | 进度条宽度 | `number` | `6` |
| `width` | 环形进度条画布宽度 | `number` | `126` |
| `show-text` | 是否显示进度文字 | `boolean` | `true` |
| `color` | 进度条颜色 | `string / Function / Array` | - |
| `format` | 自定义文字格式 | `Function` | - |

### Skeleton 骨架屏

**核心属性：**

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `animated` | 是否使用动画 | `boolean` | `false` |
| `count` | 渲染多少个模板 | `number` | `1` |
| `loading` | 是否显示骨架屏 | `boolean` | `true` |
| `rows` | 骨架屏段落行数 | `number` | `3` |
| `throttle` | 延迟占位的时间（毫秒） | `number` | `0` |

## 完整实战样例

### 示例 1：Loading 加载 - 各种场景

不同场景下的加载状态展示。

```vue
<template>
  <div class="loading-demo">
    <el-card>
      <template #header>
        <span>Loading 加载示例</span>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="20">
        <!-- 区域加载 -->
        <el-card shadow="never">
          <template #header>
            <span>区域加载</span>
          </template>
          
          <el-space wrap>
            <el-button @click="triggerAreaLoading">
              触发区域加载（3秒）
            </el-button>
          </el-space>

          <div
            v-loading="areaLoading"
            element-loading-text="加载中..."
            element-loading-background="rgba(122, 122, 122, 0.8)"
            style="min-height: 200px; margin-top: 16px; border: 1px solid #dcdfe6; border-radius: 4px; display: flex; align-items: center; justify-content: center"
          >
            <p v-if="!areaLoading">这是需要加载的内容区域</p>
          </div>
        </el-card>

        <!-- 表格加载 -->
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>表格加载</span>
              <el-button size="small" @click="refreshTable">
                刷新表格
              </el-button>
            </div>
          </template>

          <el-table
            v-loading="tableLoading"
            :data="tableData"
            border
            element-loading-text="数据加载中..."
          >
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="role" label="角色" width="120" />
          </el-table>
        </el-card>

        <!-- 全屏加载 -->
        <el-card shadow="never">
          <template #header>
            <span>全屏加载</span>
          </template>

          <el-space wrap>
            <el-button type="primary" @click="triggerFullscreenLoading">
              全屏加载（2秒）
            </el-button>
            <el-button type="success" @click="triggerCustomLoading">
              自定义加载图标
            </el-button>
            <el-button type="warning" @click="triggerSvgLoading">
              SVG 加载图标
            </el-button>
          </el-space>
        </el-card>

        <!-- 服务方式调用 -->
        <el-card shadow="never">
          <template #header>
            <span>服务方式调用</span>
          </template>

          <el-space wrap>
            <el-button @click="showServiceLoading">
              服务方式加载
            </el-button>
            <el-button type="danger" @click="handleLargeDataProcess">
              大数据处理（带进度）
            </el-button>
          </el-space>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'

const areaLoading = ref(false)
const tableLoading = ref(false)

const tableData = ref([
  { name: '张三', email: 'zhangsan@example.com', role: '管理员' },
  { name: '李四', email: 'lisi@example.com', role: '编辑' },
  { name: '王五', email: 'wangwu@example.com', role: '普通用户' }
])

const triggerAreaLoading = () => {
  areaLoading.value = true
  setTimeout(() => {
    areaLoading.value = false
  }, 3000)
}

const refreshTable = () => {
  tableLoading.value = true
  
  // 模拟 API 请求
  setTimeout(() => {
    tableData.value = [
      { name: '张三', email: 'zhangsan@example.com', role: '管理员' },
      { name: '李四', email: 'lisi@example.com', role: '编辑' },
      { name: '王五', email: 'wangwu@example.com', role: '普通用户' },
      { name: '赵六', email: 'zhaoliu@example.com', role: '访客' }
    ]
    tableLoading.value = false
    ElMessage.success('表格数据已刷新')
  }, 2000)
}

const triggerFullscreenLoading = () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  setTimeout(() => {
    loading.close()
    ElMessage.success('加载完成')
  }, 2000)
}

const triggerCustomLoading = () => {
  const loading = ElLoading.service({
    lock: true,
    text: '处理中，请稍候...',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.8)',
    customClass: 'custom-loading'
  })
  
  setTimeout(() => {
    loading.close()
  }, 2000)
}

const triggerSvgLoading = () => {
  const loading = ElLoading.service({
    lock: true,
    text: '正在处理...',
    svg: `<svg viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4">
        <animate attributeName="stroke-dasharray" dur="1.5s" repeatCount="indefinite" values="1 150;90 150;1 150" />
      </circle>
    </svg>`,
    svgViewBox: '0 0 50 50'
  })
  
  setTimeout(() => {
    loading.close()
  }, 2000)
}

const showServiceLoading = () => {
  const loading = ElLoading.service({
    target: '.loading-demo',
    text: '加载中...'
  })
  
  setTimeout(() => {
    loading.close()
  }, 2000)
}

const handleLargeDataProcess = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '处理中... 0%',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      loading.setText(`处理中... ${i}%`)
    }
    
    loading.close()
    ElMessage.success('数据处理完成')
  } catch (error) {
    loading.close()
    ElMessage.error('处理失败')
  }
}
</script>

<style scoped>
.loading-demo {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
```

**运行效果：**
- 区域加载，带自定义文案和背景色
- 表格加载状态
- 全屏加载，锁定页面操作
- 自定义加载图标和 SVG 图标
- 服务方式调用，可动态更新文案

---

### 示例 2：Progress 进度条 - 文件上传与任务进度

不同类型的进度条展示。

```vue
<template>
  <div class="progress-demo">
    <el-card>
      <template #header>
        <span>Progress 进度条示例</span>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="20">
        <!-- 基础进度条 -->
        <el-card shadow="never">
          <template #header>
            <span>线性进度条</span>
          </template>

          <el-space direction="vertical" style="width: 100%">
            <div>
              <div style="margin-bottom: 8px">默认进度条</div>
              <el-progress :percentage="50" />
            </div>

            <div>
              <div style="margin-bottom: 8px">自定义颜色</div>
              <el-progress :percentage="70" color="#67c23a" />
            </div>

            <div>
              <div style="margin-bottom: 8px">显示状态</div>
              <el-space direction="vertical" style="width: 100%">
                <el-progress :percentage="100" status="success" />
                <el-progress :percentage="80" status="warning" />
                <el-progress :percentage="50" status="exception" />
              </el-space>
            </div>

            <div>
              <div style="margin-bottom: 8px">自定义文字</div>
              <el-progress :percentage="progress1" :format="formatProgress" />
            </div>
          </el-space>
        </el-card>

        <!-- 环形进度条 -->
        <el-card shadow="never">
          <template #header>
            <span>环形进度条</span>
          </template>

          <el-space :size="40">
            <div>
              <div style="margin-bottom: 8px; text-align: center">圆形</div>
              <el-progress type="circle" :percentage="progress2" />
            </div>

            <div>
              <div style="margin-bottom: 8px; text-align: center">仪表盘</div>
              <el-progress type="dashboard" :percentage="progress2" />
            </div>

            <div>
              <div style="margin-bottom: 8px; text-align: center">自定义颜色</div>
              <el-progress
                type="circle"
                :percentage="progress2"
                :color="customColors"
              />
            </div>
          </el-space>
        </el-card>

        <!-- 文件上传场景 -->
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>文件上传进度</span>
              <el-button size="small" @click="simulateUpload">
                模拟上传
              </el-button>
            </div>
          </template>

          <el-space direction="vertical" style="width: 100%">
            <div v-for="file in uploadFiles" :key="file.id" class="file-item">
              <div class="file-info">
                <el-icon><Document /></el-icon>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
              <el-progress
                :percentage="file.progress"
                :status="file.status"
                :stroke-width="8"
              />
            </div>
          </el-space>
        </el-card>

        <!-- 任务进度场景 -->
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>任务执行进度</span>
              <el-space>
                <el-button size="small" @click="startTask" :disabled="taskRunning">
                  开始任务
                </el-button>
                <el-button size="small" @click="pauseTask" :disabled="!taskRunning">
                  {{ taskPaused ? '继续' : '暂停' }}
                </el-button>
                <el-button size="small" type="danger" @click="cancelTask" :disabled="!taskRunning">
                  取消
                </el-button>
              </el-space>
            </div>
          </template>

          <div>
            <div style="margin-bottom: 8px">
              <span>任务进度：</span>
              <span style="font-weight: bold; color: #409eff">{{ taskProgress }}%</span>
            </div>
            <el-progress
              :percentage="taskProgress"
              :status="taskStatus"
              :stroke-width="20"
            >
              <template #default="{ percentage }">
                <span style="color: #fff">{{ percentage }}%</span>
              </template>
            </el-progress>

            <div style="margin-top: 12px; color: #909399; font-size: 14px">
              <div>已完成：{{ taskCompleted }} / {{ taskTotal }} 项</div>
              <div v-if="taskRunning">预计剩余时间：{{ estimatedTime }} 秒</div>
            </div>
          </div>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

// 基础进度
const progress1 = ref(60)
const progress2 = ref(75)

const formatProgress = (percentage: number) => {
  return percentage === 100 ? '已完成' : `${percentage}%`
}

const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]

// 文件上传
interface UploadFile {
  id: number
  name: string
  size: number
  progress: number
  status?: 'success' | 'exception' | 'warning'
}

const uploadFiles = ref<UploadFile[]>([])

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

const simulateUpload = () => {
  const newFiles: UploadFile[] = [
    { id: Date.now(), name: 'document.pdf', size: 2048576, progress: 0 },
    { id: Date.now() + 1, name: 'image.jpg', size: 1536000, progress: 0 },
    { id: Date.now() + 2, name: 'video.mp4', size: 10485760, progress: 0 }
  ]

  uploadFiles.value = newFiles

  newFiles.forEach((file, index) => {
    const interval = setInterval(() => {
      if (file.progress >= 100) {
        clearInterval(interval)
        file.status = 'success'
        
        if (index === newFiles.length - 1) {
          ElMessage.success('所有文件上传完成')
        }
        return
      }

      file.progress += Math.random() * 15
      if (file.progress > 100) {
        file.progress = 100
      }
    }, 300)
  })
}

// 任务进度
const taskProgress = ref(0)
const taskRunning = ref(false)
const taskPaused = ref(false)
const taskStatus = ref<'success' | 'exception' | undefined>()
const taskTotal = ref(100)
const taskCompleted = computed(() => Math.floor(taskProgress.value))
const estimatedTime = computed(() => {
  if (taskProgress.value === 0) return 0
  const remaining = 100 - taskProgress.value
  return Math.ceil(remaining / 2)
})

let taskTimer: any = null

const startTask = () => {
  taskRunning.value = true
  taskPaused.value = false
  taskProgress.value = 0
  taskStatus.value = undefined

  taskTimer = setInterval(() => {
    if (taskPaused.value) return

    taskProgress.value += 2

    if (taskProgress.value >= 100) {
      clearInterval(taskTimer)
      taskProgress.value = 100
      taskStatus.value = 'success'
      taskRunning.value = false
      ElMessage.success('任务执行完成')
    }
  }, 100)
}

const pauseTask = () => {
  taskPaused.value = !taskPaused.value
  ElMessage.info(taskPaused.value ? '任务已暂停' : '任务继续执行')
}

const cancelTask = () => {
  if (taskTimer) {
    clearInterval(taskTimer)
  }
  taskStatus.value = 'exception'
  taskRunning.value = false
  taskPaused.value = false
  ElMessage.warning('任务已取消')
}
</script>

<style scoped>
.progress-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.file-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.file-name {
  flex: 1;
  font-weight: 500;
}

.file-size {
  color: #909399;
  font-size: 13px;
}
</style>
```

**运行效果：**
- 线性、环形、仪表盘进度条
- 自定义颜色和状态
- 文件上传进度模拟
- 任务执行进度，支持暂停和取消

---

### 示例 3：Skeleton 骨架屏 - 内容加载占位

优化加载体验的骨架屏。

```vue
<template>
  <div class="skeleton-demo">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>Skeleton 骨架屏示例</span>
          <el-button size="small" @click="toggleLoading">
            {{ loading ? '显示内容' : '显示骨架屏' }}
          </el-button>
        </div>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="20">
        <!-- 基础骨架屏 -->
        <el-card shadow="never">
          <template #header>
            <span>基础用法</span>
          </template>

          <el-skeleton :loading="loading" animated :rows="5">
            <template #default>
              <div>
                <h3>文章标题</h3>
                <p>这是文章的内容，骨架屏加载完成后显示真实内容。</p>
                <p>Element Plus 是一套基于 Vue 3 的组件库，提供了丰富的 UI 组件。</p>
                <p>骨架屏可以有效提升用户体验，减少等待时的焦虑感。</p>
              </div>
            </template>
          </el-skeleton>
        </el-card>

        <!-- 列表骨架屏 -->
        <el-card shadow="never">
          <template #header>
            <span>列表骨架屏</span>
          </template>

          <el-skeleton :loading="loading" animated :count="3">
            <template #template>
              <div class="list-item-skeleton">
                <el-skeleton-item variant="image" style="width: 60px; height: 60px" />
                <div style="flex: 1">
                  <el-skeleton-item variant="text" style="width: 50%" />
                  <el-skeleton-item variant="text" style="width: 80%; margin-top: 8px" />
                </div>
              </div>
            </template>

            <template #default>
              <div v-for="item in listData" :key="item.id" class="list-item">
                <el-avatar :size="60" :src="item.avatar" />
                <div class="list-content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                </div>
              </div>
            </template>
          </el-skeleton>
        </el-card>

        <!-- 卡片骨架屏 -->
        <el-card shadow="never">
          <template #header>
            <span>卡片骨架屏</span>
          </template>

          <el-row :gutter="20">
            <el-col v-for="i in 3" :key="i" :span="8">
              <el-skeleton :loading="loading" animated>
                <template #template>
                  <div class="card-skeleton">
                    <el-skeleton-item variant="image" style="width: 100%; height: 150px" />
                    <div style="padding: 14px">
                      <el-skeleton-item variant="h3" style="width: 50%" />
                      <div style="margin-top: 12px">
                        <el-skeleton-item variant="text" />
                        <el-skeleton-item variant="text" style="width: 80%; margin-top: 8px" />
                      </div>
                    </div>
                  </div>
                </template>

                <template #default>
                  <el-card>
                    <img
                      src="https://via.placeholder.com/300x150"
                      style="width: 100%; height: 150px; object-fit: cover"
                    />
                    <div style="padding: 14px">
                      <h3>商品标题 {{ i }}</h3>
                      <p style="color: #909399">这是商品的详细描述信息</p>
                      <div style="margin-top: 12px">
                        <el-tag type="danger">¥299</el-tag>
                      </div>
                    </div>
                  </el-card>
                </template>
              </el-skeleton>
            </el-col>
          </el-row>
        </el-card>

        <!-- 表格骨架屏 -->
        <el-card shadow="never">
          <template #header>
            <span>表格骨架屏</span>
          </template>

          <el-skeleton :loading="loading" animated :rows="5" :throttle="500">
            <template #default>
              <el-table :data="tableData" border>
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="email" label="邮箱" />
                <el-table-column prop="role" label="角色" width="120" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-skeleton>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(true)

const listData = ref([
  {
    id: 1,
    avatar: 'https://via.placeholder.com/60',
    title: '用户消息 1',
    description: '这是一条用户消息的详细描述'
  },
  {
    id: 2,
    avatar: 'https://via.placeholder.com/60',
    title: '用户消息 2',
    description: '这是另一条用户消息的详细描述'
  },
  {
    id: 3,
    avatar: 'https://via.placeholder.com/60',
    title: '用户消息 3',
    description: '这是第三条用户消息的详细描述'
  }
])

const tableData = ref([
  { name: '张三', email: 'zhangsan@example.com', role: '管理员', status: '正常' },
  { name: '李四', email: 'lisi@example.com', role: '编辑', status: '正常' },
  { name: '王五', email: 'wangwu@example.com', role: '普通用户', status: '禁用' }
])

const toggleLoading = () => {
  loading.value = !loading.value
}
</script>

<style scoped>
.skeleton-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.list-item-skeleton,
.list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.list-content {
  flex: 1;
}

.list-content h4 {
  margin: 0 0 8px 0;
}

.list-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.card-skeleton {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
</style>
```

**运行效果：**
- 基础骨架屏替代加载状态
- 列表、卡片、表格的骨架屏
- 自定义骨架屏模板
- 动画效果提升体验
- 延迟显示（throttle）避免闪烁

---

## 常见踩坑

### 1. Loading 层级问题

**问题：** Loading 被其他元素遮挡。

**解决：** 调整 `z-index` 或使用 `fullscreen`。

```ts
ElLoading.service({
  lock: true,
  fullscreen: true
})
```

---

### 2. Progress 颜色不生效

**问题：** 设置 `color` 后颜色未变化。

**解决：** 确保没有同时设置 `status` 属性，`status` 优先级更高。

```vue
<!-- ❌ 错误 -->
<el-progress :percentage="50" color="#409eff" status="success" />

<!-- ✅ 正确 -->
<el-progress :percentage="50" color="#409eff" />
```

---

### 3. Skeleton 内容闪烁

**问题：** 加载完成后内容瞬间显示，体验不佳。

**解决：** 使用 `throttle` 延迟显示。

```vue
<el-skeleton :loading="loading" :throttle="500">
```

---

### 4. Loading 未正确关闭

**问题：** 服务方式调用的 Loading 未关闭，一直显示。

**解决：** 确保在 `finally` 中关闭。

```ts
const loading = ElLoading.service()
try {
  await fetchData()
} finally {
  loading.close()
}
```

---

## 最佳实践

### 1. 统一 Loading 管理

```ts
// useLoading.ts
export const useLoading = () => {
  const loading = ref(false)
  
  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    loading.value = true
    try {
      return await fn()
    } finally {
      loading.value = false
    }
  }
  
  return { loading, withLoading }
}
```

### 2. Progress 动态颜色

```ts
const progressColor = (percentage: number) => {
  if (percentage < 30) return '#f56c6c'
  if (percentage < 70) return '#e6a23c'
  return '#67c23a'
}
```

### 3. Skeleton 组件封装

```vue
<!-- SkeletonList.vue -->
<template>
  <el-skeleton :loading="loading" animated :count="count">
    <template #template>
      <slot name="skeleton" />
    </template>
    <template #default>
      <slot />
    </template>
  </el-skeleton>
</template>
```

---

## 参考资料

- [Element Plus Loading 文档](https://element-plus.org/zh-CN/component/loading.html)
- [Element Plus Progress 文档](https://element-plus.org/zh-CN/component/progress.html)
- [Element Plus Skeleton 文档](https://element-plus.org/zh-CN/component/skeleton.html)
