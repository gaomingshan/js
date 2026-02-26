# 开关与滑块组件

## 概述

Switch、Slider、Rate 和 ColorPicker 是常用的交互组件。Switch 用于开关切换，Slider 用于数值选择，Rate 用于评分，ColorPicker 用于颜色选择。

---

## Switch 开关

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | boolean/string/number | false |
| disabled | 是否禁用 | boolean | false |
| loading | 是否加载中 | boolean | false |
| width | 宽度（像素） | number | 40 |
| active-text | 打开时的文字描述 | string | - |
| inactive-text | 关闭时的文字描述 | string | - |
| active-value | 打开时的值 | boolean/string/number | true |
| inactive-value | 关闭时的值 | boolean/string/number | false |
| active-color | 打开时的背景色 | string | #409eff |
| inactive-color | 关闭时的背景色 | string | #dcdfe6 |

---

## Slider 滑块

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | number/array | 0 |
| min | 最小值 | number | 0 |
| max | 最大值 | number | 100 |
| step | 步长 | number | 1 |
| show-stops | 是否显示间断点 | boolean | false |
| show-tooltip | 是否显示提示 | boolean | true |
| range | 是否为范围选择 | boolean | false |
| marks | 标记 | object | - |

---

## Rate 评分

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | number | 0 |
| max | 最大分值 | number | 5 |
| disabled | 是否只读 | boolean | false |
| allow-half | 是否允许半选 | boolean | false |
| show-text | 是否显示辅助文字 | boolean | false |
| show-score | 是否显示当前分数 | boolean | false |
| colors | icon 的颜色数组 | array | ['#F7BA2A', '#F7BA2A', '#F7BA2A'] |
| texts | 辅助文字数组 | array | ['极差', '失望', '一般', '满意', '惊喜'] |

---

## ColorPicker 颜色选择器

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | string | - |
| disabled | 是否禁用 | boolean | false |
| show-alpha | 是否支持透明度选择 | boolean | false |
| predefine | 预定义颜色 | array | - |

---

## 完整样例一：设置面板

### 效果描述
实现一个系统设置面板，包含各种开关和滑块配置。

### 完整代码

```vue
<template>
  <div class="settings-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">系统设置</h3>
      </template>
      
      <el-form :model="settings" label-width="140px">
        <!-- 基础开关 -->
        <el-divider content-position="left">通知设置</el-divider>
        
        <el-form-item label="消息通知">
          <el-switch
            v-model="settings.messageNotify"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>
        
        <el-form-item label="邮件通知">
          <el-switch
            v-model="settings.emailNotify"
            active-text="开"
            inactive-text="关"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        
        <el-form-item label="声音提示">
          <el-switch
            v-model="settings.soundAlert"
            :loading="isSaving"
            @change="handleSoundChange"
          />
        </el-form-item>
        
        <!-- 音量控制 -->
        <el-divider content-position="left">音量设置</el-divider>
        
        <el-form-item label="主音量">
          <el-slider
            v-model="settings.masterVolume"
            :show-tooltip="true"
            :format-tooltip="formatVolumeTooltip"
          />
          <el-text type="info" size="small">
            当前音量：{{ settings.masterVolume }}%
          </el-text>
        </el-form-item>
        
        <el-form-item label="通知音量">
          <el-slider
            v-model="settings.notifyVolume"
            :disabled="!settings.soundAlert"
            show-stops
            :step="10"
          />
        </el-form-item>
        
        <el-form-item label="音效音量范围">
          <el-slider
            v-model="settings.effectVolumeRange"
            range
            :max="100"
            :marks="volumeMarks"
          />
        </el-form-item>
        
        <!-- 显示设置 -->
        <el-divider content-position="left">显示设置</el-divider>
        
        <el-form-item label="亮度">
          <el-slider
            v-model="settings.brightness"
            :min="10"
            :max="100"
            :step="5"
          />
        </el-form-item>
        
        <el-form-item label="字体大小">
          <el-slider
            v-model="settings.fontSize"
            :min="12"
            :max="24"
            :step="2"
            show-stops
          >
            <template #default="{ value }">
              <div class="slider-demo-text" :style="{ fontSize: value + 'px' }">
                {{ value }}px
              </div>
            </template>
          </el-slider>
        </el-form-item>
        
        <!-- 主题颜色 -->
        <el-divider content-position="left">主题设置</el-divider>
        
        <el-form-item label="主题色">
          <el-color-picker
            v-model="settings.themeColor"
            :predefine="predefineColors"
            show-alpha
          />
          <el-text type="info" size="small" style="margin-left: 10px;">
            {{ settings.themeColor }}
          </el-text>
        </el-form-item>
        
        <el-form-item label="背景色">
          <el-color-picker
            v-model="settings.backgroundColor"
            :predefine="predefineColors"
          />
        </el-form-item>
        
        <!-- 主题预览 -->
        <el-form-item label="主题预览">
          <div 
            class="theme-preview"
            :style="{
              backgroundColor: settings.backgroundColor,
              color: settings.themeColor
            }"
          >
            <h4>主题预览</h4>
            <p :style="{ fontSize: settings.fontSize + 'px' }">
              这是预览文本，字体大小：{{ settings.fontSize }}px
            </p>
            <el-button :style="{ backgroundColor: settings.themeColor, borderColor: settings.themeColor }">
              主题按钮
            </el-button>
          </div>
        </el-form-item>
        
        <!-- 保存按钮 -->
        <el-form-item>
          <el-space>
            <el-button type="primary" @click="handleSaveSettings">
              保存设置
            </el-button>
            <el-button @click="handleResetSettings">
              恢复默认
            </el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const isSaving = ref(false)

const settings = reactive({
  messageNotify: true,
  emailNotify: false,
  soundAlert: true,
  masterVolume: 70,
  notifyVolume: 50,
  effectVolumeRange: [30, 80],
  brightness: 80,
  fontSize: 14,
  themeColor: '#409eff',
  backgroundColor: '#ffffff',
})

const defaultSettings = { ...settings }

const volumeMarks = {
  0: '静音',
  25: '低',
  50: '中',
  75: '高',
  100: '最大',
}

const predefineColors = [
  '#409eff',
  '#67c23a',
  '#e6a23c',
  '#f56c6c',
  '#909399',
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
]

const formatVolumeTooltip = (value: number) => {
  return `${value}%`
}

const handleSoundChange = (value: boolean) => {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
    ElMessage.success(value ? '声音已开启' : '声音已关闭')
  }, 500)
}

const handleSaveSettings = () => {
  ElMessage.success('设置已保存')
  console.log('保存的设置:', settings)
}

const handleResetSettings = () => {
  Object.assign(settings, defaultSettings)
  ElMessage.info('已恢复默认设置')
}
</script>

<style scoped>
.settings-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.slider-demo-text {
  font-weight: bold;
  color: #409eff;
}

.theme-preview {
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.theme-preview h4 {
  margin-top: 0;
}
</style>
```

---

## 完整样例二：商品评价

### 效果描述
实现商品评价功能，包括星级评分、评价内容等。

### 完整代码

```vue
<template>
  <div class="rating-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">商品评价</h3>
      </template>
      
      <!-- 商品信息 -->
      <div class="product-info">
        <img src="https://via.placeholder.com/100" class="product-image" />
        <div class="product-detail">
          <h4>iPhone 15 Pro Max</h4>
          <el-text type="info">订单号：202401010001</el-text>
        </div>
      </div>
      
      <el-divider />
      
      <el-form :model="ratingForm" label-width="100px">
        <!-- 综合评分 -->
        <el-form-item label="综合评分">
          <el-rate
            v-model="ratingForm.overall"
            :texts="ratingTexts"
            show-text
            :colors="ratingColors"
            @change="handleRatingChange"
          />
        </el-form-item>
        
        <!-- 详细评分 -->
        <el-form-item label="商品质量">
          <el-rate
            v-model="ratingForm.quality"
            show-score
            score-template="{value} 分"
          />
        </el-form-item>
        
        <el-form-item label="物流速度">
          <el-rate
            v-model="ratingForm.delivery"
            show-score
            score-template="{value} 分"
          />
        </el-form-item>
        
        <el-form-item label="服务态度">
          <el-rate
            v-model="ratingForm.service"
            allow-half
            show-score
            :precision="0.5"
          />
        </el-form-item>
        
        <!-- 推荐指数 -->
        <el-form-item label="推荐指数">
          <el-slider
            v-model="ratingForm.recommend"
            :min="0"
            :max="10"
            :step="1"
            show-stops
            :marks="recommendMarks"
          />
        </el-form-item>
        
        <!-- 是否匿名 -->
        <el-form-item label="匿名评价">
          <el-switch
            v-model="ratingForm.anonymous"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        
        <!-- 评价内容 -->
        <el-form-item label="评价内容">
          <el-input
            v-model="ratingForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入您的评价（选填）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <!-- 评价预览 -->
        <el-divider />
        <el-form-item label="评价预览">
          <el-card>
            <div class="rating-preview">
              <div class="preview-header">
                <el-avatar>{{ ratingForm.anonymous ? '匿' : '用' }}</el-avatar>
                <div class="user-info">
                  <el-text>{{ ratingForm.anonymous ? '匿名用户' : '张三' }}</el-text>
                  <el-rate
                    v-model="ratingForm.overall"
                    disabled
                    size="small"
                  />
                </div>
              </div>
              <div class="preview-content">
                <el-text v-if="ratingForm.comment">
                  {{ ratingForm.comment }}
                </el-text>
                <el-text v-else type="info">暂无评价内容</el-text>
              </div>
              <div class="preview-details">
                <el-text type="info" size="small">
                  质量：{{ ratingForm.quality }}分 |
                  物流：{{ ratingForm.delivery }}分 |
                  服务：{{ ratingForm.service }}分
                </el-text>
              </div>
            </div>
          </el-card>
        </el-form-item>
        
        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            @click="handleSubmitRating"
            :disabled="ratingForm.overall === 0"
          >
            提交评价
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const ratingForm = reactive({
  overall: 0,
  quality: 5,
  delivery: 5,
  service: 5,
  recommend: 8,
  anonymous: false,
  comment: '',
})

const ratingTexts = ['极差', '失望', '一般', '满意', '惊喜']

const ratingColors = ['#f56c6c', '#e6a23c', '#409eff', '#67c23a', '#67c23a']

const recommendMarks = {
  0: '不推荐',
  5: '一般',
  10: '强烈推荐',
}

const handleRatingChange = (value: number) => {
  console.log('评分变化:', value)
}

const handleSubmitRating = () => {
  ElMessage.success('评价提交成功，感谢您的反馈！')
  console.log('评价内容:', ratingForm)
}
</script>

<style scoped>
.rating-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.product-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.product-detail h4 {
  margin: 0 0 10px 0;
}

.rating-preview {
  padding: 10px;
}

.preview-header {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.preview-content {
  margin-bottom: 10px;
  line-height: 1.6;
}

.preview-details {
  margin-top: 10px;
}
</style>
```

---

## 完整样例三：图片编辑器

### 效果描述
实现图片编辑器，包括亮度、对比度、饱和度调节等。

### 完整代码

```vue
<template>
  <div class="image-editor-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">图片编辑器</h3>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="16">
          <!-- 图片预览 -->
          <div class="image-preview">
            <img
              src="https://via.placeholder.com/600x400"
              class="preview-image"
              :style="imageStyle"
            />
          </div>
        </el-col>
        
        <el-col :span="8">
          <!-- 调节面板 -->
          <el-form :model="imageSettings" label-width="80px">
            <el-form-item label="亮度">
              <el-slider
                v-model="imageSettings.brightness"
                :min="0"
                :max="200"
                :step="1"
              />
              <el-text type="info" size="small">
                {{ imageSettings.brightness }}%
              </el-text>
            </el-form-item>
            
            <el-form-item label="对比度">
              <el-slider
                v-model="imageSettings.contrast"
                :min="0"
                :max="200"
                :step="1"
              />
              <el-text type="info" size="small">
                {{ imageSettings.contrast }}%
              </el-text>
            </el-form-item>
            
            <el-form-item label="饱和度">
              <el-slider
                v-model="imageSettings.saturate"
                :min="0"
                :max="200"
                :step="1"
              />
              <el-text type="info" size="small">
                {{ imageSettings.saturate }}%
              </el-text>
            </el-form-item>
            
            <el-form-item label="模糊">
              <el-slider
                v-model="imageSettings.blur"
                :min="0"
                :max="10"
                :step="0.5"
              />
              <el-text type="info" size="small">
                {{ imageSettings.blur }}px
              </el-text>
            </el-form-item>
            
            <el-form-item label="灰度">
              <el-switch
                v-model="imageSettings.grayscale"
                active-text="开"
                inactive-text="关"
              />
            </el-form-item>
            
            <el-form-item label="色调">
              <el-color-picker
                v-model="imageSettings.tint"
                show-alpha
              />
            </el-form-item>
            
            <el-divider />
            
            <el-form-item>
              <el-space direction="vertical" style="width: 100%;">
                <el-button type="primary" style="width: 100%;" @click="handleReset">
                  重置
                </el-button>
                <el-button type="success" style="width: 100%;" @click="handleExport">
                  导出图片
                </el-button>
              </el-space>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const imageSettings = reactive({
  brightness: 100,
  contrast: 100,
  saturate: 100,
  blur: 0,
  grayscale: false,
  tint: 'rgba(0, 0, 0, 0)',
})

const defaultSettings = { ...imageSettings }

const imageStyle = computed(() => {
  const filters: string[] = []
  
  if (imageSettings.brightness !== 100) {
    filters.push(`brightness(${imageSettings.brightness}%)`)
  }
  if (imageSettings.contrast !== 100) {
    filters.push(`contrast(${imageSettings.contrast}%)`)
  }
  if (imageSettings.saturate !== 100) {
    filters.push(`saturate(${imageSettings.saturate}%)`)
  }
  if (imageSettings.blur > 0) {
    filters.push(`blur(${imageSettings.blur}px)`)
  }
  if (imageSettings.grayscale) {
    filters.push('grayscale(100%)')
  }
  
  return {
    filter: filters.join(' '),
    backgroundColor: imageSettings.tint,
    backgroundBlendMode: 'overlay',
  }
})

const handleReset = () => {
  Object.assign(imageSettings, defaultSettings)
  ElMessage.success('已重置为默认设置')
}

const handleExport = () => {
  ElMessage.success('图片导出成功')
  console.log('图片设置:', imageSettings)
}
</script>

<style scoped>
.image-editor-demo {
  padding: 20px;
}

.image-preview {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: filter 0.3s;
}
</style>
```

---

## 常见踩坑

### 1. Switch 绑定值类型错误

**问题**：Switch 绑定的不是 boolean 导致显示异常

**解决方案**：
```vue
<!-- ✅ 使用 active-value 和 inactive-value -->
<el-switch
  v-model="status"
  :active-value="1"
  :inactive-value="0"
/>
```

### 2. Slider 拖动不流畅

**问题**：Slider 在某些情况下拖动卡顿

**解决方案**：
```vue
<!-- 减少 step 值或移除不必要的 change 事件处理 -->
<el-slider
  v-model="value"
  :step="1"
  @input="handleInput"  <!-- 使用 input 而不是 change -->
/>
```

### 3. Rate 只读状态未生效

**问题**：设置 disabled 后仍然可以点击

**解决方案**：
```vue
<!-- ✅ 正确使用 disabled 属性 -->
<el-rate
  v-model="rating"
  :disabled="true"
/>
```

### 4. ColorPicker 颜色格式问题

**问题**：颜色格式不一致导致显示错误

**解决方案**：
```ts
// 统一使用十六进制格式
const color = ref('#409eff')

// 或使用 rgba 格式
const color = ref('rgba(64, 158, 255, 1)')
```

---

## 最佳实践

### 1. Switch 确认提示

```ts
const handleSwitchChange = async (value: boolean) => {
  if (value) {
    try {
      await ElMessageBox.confirm('确定要开启此功能吗？')
      // 开启逻辑
    } catch {
      // 取消时恢复原值
      nextTick(() => {
        switchValue.value = false
      })
    }
  }
}
```

### 2. Slider 防抖优化

```ts
import { debounce } from 'lodash-es'

const handleSliderChange = debounce((value: number) => {
  // 处理逻辑
  api.updateValue(value)
}, 300)
```

### 3. Rate 自定义图标

```vue
<el-rate
  v-model="rating"
  :icon-components="[StarFilled, StarFilled, StarFilled]"
  void-icon="Star"
  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
/>
```

### 4. ColorPicker 预设颜色

```ts
const predefineColors = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
]
```

---

## 参考资料

- [Element Plus Switch 开关](https://element-plus.org/zh-CN/component/switch.html)
- [Element Plus Slider 滑块](https://element-plus.org/zh-CN/component/slider.html)
- [Element Plus Rate 评分](https://element-plus.org/zh-CN/component/rate.html)
- [Element Plus ColorPicker 颜色选择器](https://element-plus.org/zh-CN/component/color-picker.html)

---

## 下一步

继续学习单选与多选组件：[单选与多选组件](./content-11.md)
