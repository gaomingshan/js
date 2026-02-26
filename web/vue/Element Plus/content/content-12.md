# 文件上传组件

## 概述

Upload 是处理文件上传的核心组件。掌握文件上传的各种场景（图片上传、多文件上传、大文件分片上传、拖拽上传等）是开发中后台系统的重要技能。

---

## Upload 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| action | 上传的地址 | string | - |
| headers | 设置上传的请求头部 | object | - |
| method | 设置上传请求方法 | string | post |
| data | 上传时附带的额外参数 | object | - |
| name | 上传的文件字段名 | string | file |
| with-credentials | 支持发送 cookie 凭证信息 | boolean | false |
| multiple | 是否支持多选文件 | boolean | false |
| accept | 接受上传的文件类型 | string | - |
| limit | 最大允许上传个数 | number | - |
| file-list | 上传的文件列表 | array | [] |
| list-type | 文件列表的类型 | string (text/picture/picture-card) | text |
| auto-upload | 是否在选取文件后立即进行上传 | boolean | true |
| http-request | 覆盖默认的上传行为 | function | - |
| before-upload | 上传文件之前的钩子 | function(file) | - |
| on-success | 文件上传成功时的钩子 | function(response, file, fileList) | - |
| on-error | 文件上传失败时的钩子 | function(err, file, fileList) | - |
| on-progress | 文件上传时的钩子 | function(event, file, fileList) | - |
| on-change | 文件状态改变时的钩子 | function(file, fileList) | - |
| on-preview | 点击文件列表中已上传的文件时的钩子 | function(file) | - |
| on-remove | 文件列表移除文件时的钩子 | function(file, fileList) | - |
| on-exceed | 文件超出个数限制时的钩子 | function(files, fileList) | - |
| before-remove | 删除文件之前的钩子 | function(file, fileList) | - |

---

## 完整样例一：头像上传

### 效果描述
实现头像上传功能，包括图片预览、格式校验、大小限制等。

### 完整代码

```vue
<template>
  <div class="avatar-upload-demo">
    <el-card style="max-width: 600px; margin: 0 auto;">
      <template #header>
        <h3 style="margin: 0;">头像上传</h3>
      </template>
      
      <div class="avatar-upload-container">
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :on-success="handleAvatarSuccess"
          :on-error="handleUploadError"
          :on-progress="handleProgress"
        >
          <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
          
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <el-progress :percentage="uploadProgress" :stroke-width="2" />
          </div>
        </el-upload>
        
        <div class="upload-tips">
          <el-text type="info" size="small">
            只能上传 jpg/png 文件，且不超过 2MB
          </el-text>
        </div>
      </div>
      
      <!-- 裁剪预览 -->
      <el-divider />
      
      <div v-if="avatarUrl" class="avatar-preview">
        <h4>头像预览</h4>
        <el-space>
          <el-avatar :size="32" :src="avatarUrl" />
          <el-avatar :size="64" :src="avatarUrl" />
          <el-avatar :size="128" :src="avatarUrl" />
        </el-space>
        
        <el-space style="margin-top: 20px;">
          <el-button size="small" @click="handleReupload">重新上传</el-button>
          <el-button size="small" type="danger" @click="handleDeleteAvatar">删除头像</el-button>
        </el-space>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadProps, UploadProgressEvent } from 'element-plus'

const uploadUrl = 'https://jsonplaceholder.typicode.com/posts'
const avatarUrl = ref('')
const uploadProgress = ref(0)

// 上传前校验
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  // 文件类型校验
  if (!['image/jpeg', 'image/png'].includes(rawFile.type)) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!')
    return false
  }
  
  // 文件大小校验（2MB）
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像图片大小不能超过 2MB!')
    return false
  }
  
  uploadProgress.value = 0
  return true
}

// 上传成功
const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  // 生成预览 URL
  avatarUrl.value = URL.createObjectURL(uploadFile.raw!)
  uploadProgress.value = 100
  
  setTimeout(() => {
    uploadProgress.value = 0
    ElMessage.success('头像上传成功!')
  }, 500)
}

// 上传失败
const handleUploadError: UploadProps['onError'] = () => {
  uploadProgress.value = 0
  ElMessage.error('头像上传失败，请重试!')
}

// 上传进度
const handleProgress = (event: UploadProgressEvent) => {
  uploadProgress.value = Math.round(event.percent)
}

// 重新上传
const handleReupload = () => {
  avatarUrl.value = ''
}

// 删除头像
const handleDeleteAvatar = () => {
  avatarUrl.value = ''
  ElMessage.info('头像已删除')
}
</script>

<style scoped>
.avatar-upload-demo {
  padding: 20px;
}

.avatar-upload-container {
  text-align: center;
}

.avatar-uploader {
  position: relative;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.upload-progress {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
}

.upload-tips {
  margin-top: 10px;
}

.avatar-preview {
  text-align: center;
}

.avatar-preview h4 {
  margin-bottom: 15px;
}
</style>
```

---

## 完整样例二：多文件上传

### 效果描述
实现多文件上传功能，支持文件列表管理、下载、删除等操作。

### 完整代码

```vue
<template>
  <div class="multi-upload-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">文档上传</h3>
      </template>
      
      <el-upload
        ref="uploadRef"
        v-model:file-list="fileList"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :data="uploadData"
        :multiple="true"
        :limit="5"
        :accept="acceptTypes"
        :before-upload="beforeUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-exceed="handleExceed"
        :on-remove="handleRemove"
        :on-preview="handlePreview"
        :auto-upload="false"
      >
        <template #trigger>
          <el-button type="primary" :icon="Upload">选择文件</el-button>
        </template>
        <el-button
          style="margin-left: 10px;"
          type="success"
          @click="handleUploadClick"
          :loading="isUploading"
          :disabled="fileList.length === 0"
        >
          {{ isUploading ? '上传中...' : '开始上传' }}
        </el-button>
        <el-button
          style="margin-left: 10px;"
          @click="handleClearFiles"
          :disabled="fileList.length === 0"
        >
          清空列表
        </el-button>
        
        <template #tip>
          <div class="el-upload__tip">
            支持 pdf、doc、docx、xls、xlsx、txt 格式，单个文件不超过 10MB，最多上传 5 个文件
          </div>
        </template>
      </el-upload>
      
      <!-- 上传统计 -->
      <el-divider />
      
      <el-descriptions :column="3" border>
        <el-descriptions-item label="总文件数">
          {{ fileList.length }}
        </el-descriptions-item>
        <el-descriptions-item label="已上传">
          {{ uploadedCount }}
        </el-descriptions-item>
        <el-descriptions-item label="总大小">
          {{ formatFileSize(totalSize) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="文件预览"
      width="60%"
    >
      <div v-if="previewFile" class="preview-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文件名">
            {{ previewFile.name }}
          </el-descriptions-item>
          <el-descriptions-item label="文件大小">
            {{ formatFileSize(previewFile.size) }}
          </el-descriptions-item>
          <el-descriptions-item label="上传时间">
            {{ previewFile.uploadTime || '未上传' }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(previewFile.status)">
              {{ getStatusText(previewFile.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadInstance, UploadProps, UploadUserFile } from 'element-plus'

const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadUserFile[]>([])
const isUploading = ref(false)
const previewVisible = ref(false)
const previewFile = ref<any>(null)

const uploadUrl = 'https://jsonplaceholder.typicode.com/posts'
const uploadHeaders = {
  Authorization: 'Bearer token'
}
const uploadData = {
  folder: 'documents'
}
const acceptTypes = '.pdf,.doc,.docx,.xls,.xlsx,.txt'

// 已上传数量
const uploadedCount = computed(() => {
  return fileList.value.filter(file => file.status === 'success').length
})

// 总大小
const totalSize = computed(() => {
  return fileList.value.reduce((total, file) => total + (file.size || 0), 0)
})

// 上传前校验
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  // 文件大小校验（10MB）
  if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error(`文件 ${rawFile.name} 大小超过 10MB!`)
    return false
  }
  
  // 文件类型校验
  const extension = rawFile.name.split('.').pop()?.toLowerCase()
  const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
  
  if (!extension || !allowedTypes.includes(extension)) {
    ElMessage.error(`文件 ${rawFile.name} 格式不支持!`)
    return false
  }
  
  return true
}

// 开始上传
const handleUploadClick = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }
  
  isUploading.value = true
  uploadRef.value?.submit()
}

// 上传成功
const handleSuccess: UploadProps['onSuccess'] = (response, file) => {
  file.uploadTime = new Date().toLocaleString()
  ElMessage.success(`文件 ${file.name} 上传成功`)
}

// 上传失败
const handleError: UploadProps['onError'] = (error, file) => {
  ElMessage.error(`文件 ${file.name} 上传失败`)
}

// 超出限制
const handleExceed: UploadProps['onExceed'] = (files) => {
  ElMessage.warning(`最多只能上传 5 个文件，本次选择了 ${files.length} 个文件`)
}

// 移除文件
const handleRemove: UploadProps['onRemove'] = async (file) => {
  try {
    await ElMessageBox.confirm(`确定移除文件 ${file.name}?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    return true
  } catch {
    return false
  }
}

// 预览文件
const handlePreview: UploadProps['onPreview'] = (file) => {
  previewFile.value = file
  previewVisible.value = true
}

// 清空文件列表
const handleClearFiles = () => {
  fileList.value = []
  uploadRef.value?.clearFiles()
  ElMessage.info('文件列表已清空')
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

// 获取状态类型
const getStatusType = (status: string | undefined) => {
  const map: Record<string, any> = {
    success: 'success',
    ready: 'info',
    uploading: 'warning',
    fail: 'danger',
  }
  return map[status || 'ready'] || 'info'
}

// 获取状态文本
const getStatusText = (status: string | undefined) => {
  const map: Record<string, string> = {
    success: '上传成功',
    ready: '待上传',
    uploading: '上传中',
    fail: '上传失败',
  }
  return map[status || 'ready'] || '未知'
}
</script>

<style scoped>
.multi-upload-demo {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.preview-content {
  padding: 20px;
}
</style>
```

---

## 完整样例三：拖拽上传与大文件分片

### 效果描述
实现拖拽上传和大文件分片上传功能。

### 完整代码

```vue
<template>
  <div class="drag-upload-demo">
    <el-row :gutter="20">
      <!-- 拖拽上传 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <h4 style="margin: 0;">拖拽上传</h4>
          </template>
          
          <el-upload
            v-model:file-list="dragFileList"
            :action="uploadUrl"
            drag
            multiple
            :limit="10"
            :on-exceed="handleDragExceed"
            :before-upload="beforeDragUpload"
          >
            <el-icon class="el-icon--upload">
              <UploadFilled />
            </el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持多文件上传，单个文件不超过 50MB
              </div>
            </template>
          </el-upload>
        </el-card>
      </el-col>
      
      <!-- 照片墙 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <h4 style="margin: 0;">照片墙</h4>
          </template>
          
          <el-upload
            v-model:file-list="pictureFileList"
            :action="uploadUrl"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handlePictureCardRemove"
            :limit="6"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          
          <el-dialog v-model="dialogVisible" title="图片预览">
            <img :src="dialogImageUrl" style="width: 100%;" />
          </el-dialog>
        </el-card>
      </el-col>
    </el-row>
    
    <el-divider />
    
    <!-- 大文件分片上传 -->
    <el-card>
      <template #header>
        <h4 style="margin: 0;">大文件分片上传</h4>
      </template>
      
      <el-upload
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleLargeFileChange"
        accept="video/*"
      >
        <el-button type="primary" :icon="Upload">选择大文件</el-button>
      </el-upload>
      
      <div v-if="largeFile" class="large-file-info">
        <el-divider />
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文件名">
            {{ largeFile.name }}
          </el-descriptions-item>
          <el-descriptions-item label="文件大小">
            {{ formatFileSize(largeFile.size) }}
          </el-descriptions-item>
          <el-descriptions-item label="分片大小">
            {{ formatFileSize(chunkSize) }}
          </el-descriptions-item>
          <el-descriptions-item label="分片数量">
            {{ chunkCount }}
          </el-descriptions-item>
        </el-descriptions>
        
        <el-divider />
        
        <div class="upload-control">
          <el-space>
            <el-button
              type="success"
              @click="handleStartChunkUpload"
              :loading="isChunkUploading"
              :disabled="isChunkUploading || uploadedChunks === chunkCount"
            >
              {{ isChunkUploading ? '上传中...' : '开始上传' }}
            </el-button>
            <el-button
              @click="handlePauseChunkUpload"
              :disabled="!isChunkUploading"
            >
              暂停
            </el-button>
            <el-button @click="handleCancelChunkUpload">取消</el-button>
          </el-space>
        </div>
        
        <div class="upload-progress">
          <el-progress
            :percentage="chunkProgress"
            :status="chunkProgress === 100 ? 'success' : undefined"
          />
          <el-text type="info" size="small">
            已上传：{{ uploadedChunks }} / {{ chunkCount }} 片
          </el-text>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadFilled, Upload, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadProps, UploadUserFile, UploadFile } from 'element-plus'

const uploadUrl = 'https://jsonplaceholder.typicode.com/posts'

// 拖拽上传
const dragFileList = ref<UploadUserFile[]>([])

const handleDragExceed: UploadProps['onExceed'] = (files) => {
  ElMessage.warning(`最多只能上传 10 个文件`)
}

const beforeDragUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 50) {
    ElMessage.error('文件大小不能超过 50MB')
    return false
  }
  return true
}

// 照片墙
const pictureFileList = ref<UploadUserFile[]>([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const handlePictureCardPreview: UploadProps['onPreview'] = (file) => {
  dialogImageUrl.value = file.url!
  dialogVisible.value = true
}

const handlePictureCardRemove: UploadProps['onRemove'] = (file) => {
  console.log('删除文件:', file)
}

// 大文件分片上传
const largeFile = ref<File | null>(null)
const chunkSize = ref(2 * 1024 * 1024) // 2MB per chunk
const uploadedChunks = ref(0)
const isChunkUploading = ref(false)

const chunkCount = computed(() => {
  if (!largeFile.value) return 0
  return Math.ceil(largeFile.value.size / chunkSize.value)
})

const chunkProgress = computed(() => {
  if (chunkCount.value === 0) return 0
  return Math.round((uploadedChunks.value / chunkCount.value) * 100)
})

const handleLargeFileChange = (file: UploadFile) => {
  largeFile.value = file.raw as File
  uploadedChunks.value = 0
  ElMessage.success(`已选择文件: ${file.name}`)
}

// 开始分片上传
const handleStartChunkUpload = async () => {
  if (!largeFile.value) return
  
  isChunkUploading.value = true
  
  try {
    for (let i = uploadedChunks.value; i < chunkCount.value; i++) {
      if (!isChunkUploading.value) break // 暂停上传
      
      const start = i * chunkSize.value
      const end = Math.min(start + chunkSize.value, largeFile.value.size)
      const chunk = largeFile.value.slice(start, end)
      
      // 模拟上传分片
      await uploadChunk(chunk, i)
      
      uploadedChunks.value = i + 1
    }
    
    if (uploadedChunks.value === chunkCount.value) {
      ElMessage.success('文件上传完成!')
      isChunkUploading.value = false
    }
  } catch (error) {
    ElMessage.error('上传失败')
    isChunkUploading.value = false
  }
}

// 上传单个分片（模拟）
const uploadChunk = (chunk: Blob, index: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`上传分片 ${index + 1}/${chunkCount.value}`)
      resolve()
    }, 500)
  })
}

// 暂停上传
const handlePauseChunkUpload = () => {
  isChunkUploading.value = false
  ElMessage.info('上传已暂停')
}

// 取消上传
const handleCancelChunkUpload = () => {
  isChunkUploading.value = false
  uploadedChunks.value = 0
  largeFile.value = null
  ElMessage.info('上传已取消')
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}
</script>

<style scoped>
.drag-upload-demo {
  padding: 20px;
}

.large-file-info {
  margin-top: 20px;
}

.upload-control {
  margin: 20px 0;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.el-icon--upload {
  font-size: 67px;
  color: #8c939d;
  margin-bottom: 16px;
}
</style>
```

---

## 常见踩坑

### 1. 上传文件后文件列表未更新

**问题**：上传成功后 file-list 不更新

**解决方案**：
```vue
<!-- ✅ 使用 v-model:file-list -->
<el-upload
  v-model:file-list="fileList"
  :action="uploadUrl"
/>
```

### 2. 自定义上传 action 必填

**问题**：使用 http-request 后仍然提示 action 必填

**解决方案**：
```vue
<!-- 提供一个占位 action -->
<el-upload
  action="#"
  :http-request="customUpload"
/>
```

### 3. before-upload 返回 Promise 不生效

**问题**：before-upload 返回 Promise.reject() 仍然上传

**解决方案**：
```ts
// ❌ 错误
const beforeUpload = () => {
  return Promise.reject()
}

// ✅ 正确
const beforeUpload = () => {
  return false
}

// ✅ 或返回 Promise
const beforeUpload = async () => {
  const valid = await validate()
  if (!valid) {
    return Promise.reject()
  }
  return Promise.resolve()
}
```

### 4. 图片预览 URL 问题

**问题**：使用 URL.createObjectURL 后内存泄漏

**解决方案**：
```ts
import { onUnmounted } from 'vue'

const previewUrl = ref('')

const handlePreview = (file: File) => {
  // 创建 URL
  previewUrl.value = URL.createObjectURL(file)
}

// 组件卸载时释放
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
```

---

## 最佳实践

### 1. 自定义上传实现

```ts
import axios from 'axios'

const customUpload = async (options: any) => {
  const { file, onProgress, onSuccess, onError } = options
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await axios.post('/api/upload', formData, {
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total!)
        onProgress({ percent })
      }
    })
    
    onSuccess(response.data)
  } catch (error) {
    onError(error)
  }
}
```

### 2. OSS 直传

```ts
// 获取签名
const getOSSSignature = async () => {
  const response = await api.getOSSSignature()
  return response.data
}

// 上传到 OSS
const uploadToOSS = async (file: File) => {
  const signature = await getOSSSignature()
  
  const formData = new FormData()
  formData.append('key', `uploads/${Date.now()}_${file.name}`)
  formData.append('policy', signature.policy)
  formData.append('OSSAccessKeyId', signature.accessKeyId)
  formData.append('signature', signature.signature)
  formData.append('file', file)
  
  await axios.post(signature.host, formData)
}
```

### 3. 文件压缩

```ts
import Compressor from 'compressorjs'

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      maxWidth: 1920,
      maxHeight: 1080,
      success: (result) => {
        resolve(result as File)
      },
      error: reject,
    })
  })
}

const beforeUpload = async (file: File) => {
  if (file.type.startsWith('image/')) {
    return await compressImage(file)
  }
  return file
}
```

### 4. 断点续传

```ts
interface ChunkInfo {
  file: File
  chunkSize: number
  uploadedChunks: Set<number>
}

const resumableUpload = async (chunkInfo: ChunkInfo) => {
  const { file, chunkSize, uploadedChunks } = chunkInfo
  const totalChunks = Math.ceil(file.size / chunkSize)
  
  for (let i = 0; i < totalChunks; i++) {
    if (uploadedChunks.has(i)) continue // 跳过已上传的分片
    
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)
    
    try {
      await uploadChunk(chunk, i)
      uploadedChunks.add(i)
      
      // 保存进度到本地
      saveProgress(file.name, uploadedChunks)
    } catch (error) {
      console.error(`分片 ${i} 上传失败`)
      break
    }
  }
}
```

---

## 参考资料

- [Element Plus Upload 上传](https://element-plus.org/zh-CN/component/upload.html)
- [MDN FormData](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData)
- [compressorjs](https://github.com/fengyuanchen/compressorjs)

---

## 下一步

表单组件已全部学习完毕，继续学习数据展示组件：[表格基础](./content-13.md)
