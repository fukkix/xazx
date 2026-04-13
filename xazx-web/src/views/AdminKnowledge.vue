<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { knowledgeApi, type TaskStatusResponse, type StatsResponse, type LintResponse, type LogsResponse } from '../services/knowledge'
import { ElMessage, ElNotification } from 'element-plus'
import { UploadFilled, Document, Warning, CircleCheck, Loading, Refresh } from '@element-plus/icons-vue'

// ============ 状态管理 ============

// 上传相关
const uploadFile = ref<File | null>(null)
const selectedDomain = ref('产品知识')
const selectedProductLine = ref('')
const isUploading = ref(false)

// 任务跟踪
const currentTaskId = ref('')
const taskStatus = ref<TaskStatusResponse | null>(null)
const isPolling = ref(false)
let pollingTimer: number | null = null

// ── Upload / Ingest ─────────────────────────────────────
const selectedDomain = ref('product')
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)
const fileInputRef = ref<HTMLInputElement | null>(null)

const domainOptions = [
  { label: '产品知识', value: '产品知识' },
  { label: '技术文档', value: '技术文档' },
  { label: '销售支持', value: '销售支持' },
  { label: '行业合规', value: '行业合规' },
  { label: '内部运营', value: '内部运营' }
]

const productLineOptions = [
  { label: 'WAF', value: 'WAF' },
  { label: '动态防御', value: '动态防御' },
  { label: '全流量分析', value: '全流量分析' },
  { label: '其他', value: '其他' }
]

const logTypeOptions = [
  { label: '全部', value: '' },
  { label: '入库', value: 'ingest' },
  { label: '检索', value: 'search' },
  { label: 'Lint', value: 'lint' },
  { label: '初始化', value: 'init' }
]

// ============ 计算属性 ============

const progressPercentage = computed(() => {
  if (!taskStatus.value) return 0
  
  const progressMap: Record<string, number> = {
    'uploading': 20,
    'parsing': 40,
    'generating': 60,
    'updating_index': 80,
    'done': 100
  }
  
  return progressMap[taskStatus.value.progress] || 0
})

const progressText = computed(() => {
  if (!taskStatus.value) return ''
  
  const textMap: Record<string, string> = {
    'uploading': '上传中...',
    'parsing': '解析文档...',
    'generating': '生成 Wiki 页面...',
    'updating_index': '更新索引...',
    'done': '完成'
  }
  
  return textMap[taskStatus.value.progress] || taskStatus.value.progress
})

const statusType = computed(() => {
  if (!taskStatus.value) return 'info'
  
  if (taskStatus.value.status === 'success') return 'success'
  if (taskStatus.value.status === 'error') return 'danger'
  return 'primary'
})

// ============ 文件上传 ============

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  selectedFiles.value = input.files ? Array.from(input.files) : []
}

const handleIngest = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }
  uploading.value = true
  uploadProgress.value = 0
  try {
    const isSingle = selectedFiles.value.length === 1
    if (selectedFiles.value.length === 1) {
      // 单文件：带进度条
      const file = selectedFiles.value[0]
      const res = await knowledgeApi.ingestWithProgress(
        file,
        selectedDomain.value,
        (pct) => { uploadProgress.value = pct }
      )
      tasks.value.unshift({
        task_id: res.task_id,
        status: 'pending',
        filename: file.name,
        domain: selectedDomain.value,
        startedAt: new Date().toLocaleTimeString()
      })
      pollTask(res.task_id)
    } else {
      // 多文件走批量接口
      const res = await knowledgeApi.batchIngest(selectedFiles.value, selectedDomain.value)
      for (const t of res.tasks) {
        const filename = t.message.replace('文档 ', '').replace(' 已开始入库处理', '')
        tasks.value.unshift({
          task_id: t.task_id,
          status: 'pending',
          filename,
          domain: selectedDomain.value,
          startedAt: new Date().toLocaleTimeString()
        })
        pollTask(t.task_id)
      }
      if (res.errors.length > 0) {
        ElMessage.warning(`${res.accepted} 个文件已提交，${res.rejected} 个被拒绝：${res.errors.join('；')}`)
      } else {
        ElMessage.success(`${res.accepted} 个文件已全部提交`)
      }
    }
    selectedFiles.value = []
    if (fileInputRef.value) fileInputRef.value.value = ''
    if (isSingle) ElMessage.success('文件已提交，正在入库处理...')
    loadStats()
  } catch (err: any) {
    ElMessage.error(`入库失败：${err.message}`)
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// ============ 任务轮询 ============

const startPolling = () => {
  if (isPolling.value) return
  
  isPolling.value = true
  pollTaskStatus()
}

const stopPolling = () => {
  isPolling.value = false
  if (pollingTimer) {
    clearTimeout(pollingTimer)
    pollingTimer = null
  }
}

const pollTaskStatus = async () => {
  if (!currentTaskId.value || !isPolling.value) return
  
  try {
    const status = await knowledgeApi.getTaskStatus(currentTaskId.value)
    taskStatus.value = status
    
    // 如果任务完成或失败，停止轮询
    if (status.status === 'success' || status.status === 'error') {
      stopPolling()
      
      if (status.status === 'success') {
        ElNotification({
          title: '入库成功',
          message: `Wiki 页面已生成: ${status.wiki_page_title}`,
          type: 'success',
          duration: 5000
        })
        
        // 刷新统计和日志
        loadStats()
        loadLogs()
      } else {
        ElNotification({
          title: '入库失败',
          message: status.error || '未知错误',
          type: 'error',
          duration: 5000
        })
      }
    } else {
      // 继续轮询（每 2 秒）
      pollingTimer = window.setTimeout(pollTaskStatus, 2000)
    }
  } catch (error: any) {
    console.error('查询任务状态失败:', error)
    stopPolling()
  }
}

const statusLabel: Record<string, string> = {
  pending:    '等待中',
  running:    '处理中',
  processing: '处理中',
  success:    '已完成',
  failed:     '失败',
  error:      '失败'
}

// ============ 日志查询 ============

const loadLogs = async () => {
  isLoadingLogs.value = true
  
  try {
    logs.value = await knowledgeApi.getLogs(
      logLimit.value,
      selectedLogType.value || undefined
    )
  } catch (error: any) {
    console.error('加载日志失败:', error)
    ElMessage.error('加载日志失败')
  } finally {
    isLoadingLogs.value = false
  }
}

// ============ 生命周期 ============

onMounted(() => {
  loadStats()
  loadLogs()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- ═══════════ 页面标题 ═══════════ -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-on-surface">知识库管理</h1>
        <p class="text-sm text-secondary mt-1">文档入库、统计分析、健康检查</p>
      </div>
      <el-button
        type="primary"
        :icon="Refresh"
        @click="loadStats(); loadLogs()"
      >
        刷新数据
      </el-button>
    </div>

    <!-- ═══════════ 文件上传区 ═══════════ -->
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center gap-2">
          <el-icon><UploadFilled /></el-icon>
          <span class="font-semibold">文档入库</span>
        </div>
      </template>

      <div class="space-y-4">
        <!-- 文件选择 -->
        <div>
          <label class="block text-sm font-medium text-on-surface mb-2">选择文件</label>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg"
            @change="handleFileChange"
            class="block w-full text-sm text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-dim cursor-pointer"
          />
          <p class="text-xs text-secondary mt-1">
            支持格式：PDF, DOCX, PPTX, PNG, JPG（最大 50MB）
          </p>
          <p v-if="uploadFile" class="text-sm text-primary mt-2">
            已选择：{{ uploadFile.name }} ({{ (uploadFile.size / 1024 / 1024).toFixed(2) }} MB)
          </p>
        </div>

        <!-- Per domain -->
        <div
          v-for="d in domainOptions"
          :key="d.value"
          class="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,52,94,0.04)]"
          :class="{ 'animate-pulse': statsLoading }"
        >
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="domainMeta[d.value]?.color">
              <el-icon :size="16"><component :is="domainMeta[d.value]?.icon" /></el-icon>
            </div>
          </div>
          <div class="text-2xl font-black text-on-surface">
            <span v-if="statsLoading" class="inline-block w-8 h-6 bg-surface-container-high rounded"></span>
            <span v-else>{{ domainStats.find(s => s.domain === d.value)?.page_count ?? 0 }}</span>
          </div>
        </div>

        <!-- 上传按钮 -->
        <el-button
          type="primary"
          size="large"
          :loading="isUploading"
          :disabled="!uploadFile || !selectedDomain"
          @click="handleUpload"
          class="w-full"
        >
          {{ isUploading ? '上传中...' : '开始入库' }}
        </el-button>
      </div>
    </el-card>

    <!-- ═══════════ 入库进度区 ═══════════ -->
    <el-card v-if="taskStatus" shadow="hover">
      <template #header>
        <div class="flex items-center gap-2">
          <el-icon><Loading v-if="isPolling" class="is-loading" /><CircleCheck v-else /></el-icon>
          <span class="font-semibold">入库进度</span>
        </div>
      </template>

      <div class="space-y-4">
        <!-- 进度条 -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-on-surface">{{ progressText }}</span>
            <span class="text-sm text-secondary">{{ progressPercentage }}%</span>
          </div>
          <el-progress
            :percentage="progressPercentage"
            :status="statusType"
            :stroke-width="8"
          />
        </div>

        <!-- 任务信息 -->
        <div class="bg-surface-container-low rounded-lg p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary">任务 ID</span>
            <span class="text-xs font-mono text-on-surface">{{ taskStatus.task_id }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary">状态</span>
            <el-tag :type="statusType" size="small">{{ taskStatus.status }}</el-tag>
          </div>
          <div v-if="taskStatus.processing_time_ms" class="flex items-center justify-between">
            <span class="text-xs text-secondary">处理时间</span>
            <span class="text-xs text-on-surface">{{ (taskStatus.processing_time_ms / 1000).toFixed(2) }}s</span>
          </div>
        </div>

        <!-- Wiki 预览 -->
        <div v-if="taskStatus.status === 'success' && taskStatus.wiki_page_title" class="bg-green-50 rounded-lg p-4 space-y-2">
          <div class="flex items-center gap-2 mb-2">
            <el-icon class="text-green-600"><CircleCheck /></el-icon>
            <span class="text-sm font-semibold text-green-900">Wiki 页面已生成</span>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium text-green-900">{{ taskStatus.wiki_page_title }}</p>
            <p class="text-xs text-green-700">{{ taskStatus.summary }}</p>
            <p class="text-xs text-green-600 font-mono">{{ taskStatus.wiki_page_path }}</p>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="taskStatus.status === 'error'" class="bg-red-50 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <el-icon class="text-red-600"><Warning /></el-icon>
            <span class="text-sm font-semibold text-red-900">入库失败</span>
          </div>
          <p class="text-xs text-red-700">{{ taskStatus.error }}</p>
        </div>
      </div>
    </el-card>

    <!-- ═══════════ 统计面板 ═══════════ -->
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <el-icon><Document /></el-icon>
            <span class="font-semibold">统计信息</span>
          </div>
          <el-button
            text
            :icon="Refresh"
            :loading="isLoadingStats"
            @click="loadStats"
          >
            刷新
          </el-button>
        </div>
      </template>

      <div v-if="stats" class="space-y-4">
        <!-- 总计 -->
        <div class="bg-primary/10 rounded-lg p-4 text-center">
          <p class="text-sm text-secondary mb-1">总页面数</p>
          <p class="text-3xl font-bold text-primary">{{ stats.total }}</p>
          <p class="text-xs text-secondary mt-1">最后更新：{{ new Date(stats.last_updated).toLocaleString('zh-CN') }}</p>
        </div>

        <!-- 各知识域统计 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(domainStats, domainName) in stats.domains"
            :key="domainName"
            class="bg-surface-container-low rounded-lg p-4"
          >
            <el-icon class="text-secondary" :size="20"><UploadFilled /></el-icon>
            <span class="text-sm text-secondary truncate">
              {{ selectedFiles.length > 1 ? `已选择 ${selectedFiles.length} 个文件` : selectedFiles.length === 1 ? selectedFiles[0].name : '点击选择文件（可多选）' }}
            </span>
            <input
              ref="fileInputRef"
              type="file"
              accept=".pdf,.docx,.doc,.pptx,.ppt,.png,.jpg,.jpeg,.webp"
              class="hidden"
              multiple
              @change="handleFileChange"
            >
          </div>
        </div>
      </div>

        <!-- Submit Button -->
        <div>
          <button
            :disabled="uploading || selectedFiles.length === 0 || !backendOnline"
            class="w-full py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 shadow hover:bg-primary-dim active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleIngest"
          >
            {{ isLinting ? '检查中...' : '运行 Lint' }}
          </el-button>
        </div>
      </template>

      <p class="mt-4 text-xs text-secondary">
        支持格式：PDF、DOCX、PPTX、PNG/JPG（含图片型文档）· 单文件上限 50 MB · 批量最多 10 个文件
      </p>

      <!-- Upload Progress Bar -->
      <div v-if="uploading && uploadProgress > 0" class="mt-4">
        <div class="flex items-center justify-between text-xs text-secondary mb-1">
          <span>上传中...</span>
          <span>{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
          <div
            class="bg-primary h-1.5 rounded-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>
    </section>

        <!-- 详细统计 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-surface-container-low rounded-lg p-4">
            <p class="text-xs text-secondary mb-1">孤立页面</p>
            <p class="text-2xl font-bold" :class="lintResult.summary.orphan_pages > 0 ? 'text-yellow-600' : 'text-green-600'">
              {{ lintResult.summary.orphan_pages }}
            </p>
          </div>
          <div class="bg-surface-container-low rounded-lg p-4">
            <p class="text-xs text-secondary mb-1">断链</p>
            <p class="text-2xl font-bold" :class="lintResult.summary.broken_links > 0 ? 'text-red-600' : 'text-green-600'">
              {{ lintResult.summary.broken_links }}
            </p>
          </div>
          <div class="bg-surface-container-low rounded-lg p-4">
            <p class="text-xs text-secondary mb-1">过期页面</p>
            <p class="text-2xl font-bold" :class="lintResult.summary.stale_pages > 0 ? 'text-orange-600' : 'text-green-600'">
              {{ lintResult.summary.stale_pages }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="tasks.length === 0" class="flex flex-col items-center gap-3 py-16 text-center">
        <el-icon :size="40" class="text-secondary/30"><UploadFilled /></el-icon>
        <p class="text-sm font-medium text-secondary">暂无入库任务</p>
        <p class="text-xs text-on-surface-variant">上传文档后，可在此实时追踪入库进度</p>
      </div>
    </el-card>

    <!-- ═══════════ 操作日志 ═══════════ -->
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <el-icon><Document /></el-icon>
            <span class="font-semibold">操作日志</span>
          </div>
          <div class="flex items-center gap-2">
            <el-select v-model="selectedLogType" placeholder="日志类型" size="small" style="width: 120px" @change="loadLogs">
              <el-option
                v-for="option in logTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-select v-model="logLimit" placeholder="数量" size="small" style="width: 100px" @change="loadLogs">
              <el-option label="10 条" :value="10" />
              <el-option label="20 条" :value="20" />
              <el-option label="50 条" :value="50" />
              <el-option label="100 条" :value="100" />
            </el-select>
            <el-button
              text
              :icon="Refresh"
              :loading="isLoadingLogs"
              @click="loadLogs"
            >
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="logs && logs.entries.length > 0" class="space-y-2">
        <div
          v-for="(entry, index) in logs.entries"
          :key="index"
          class="bg-surface-container-low rounded-lg p-3 hover:bg-surface-container transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <el-tag :type="entry.type === 'ingest' ? 'primary' : entry.type === 'search' ? 'success' : 'info'" size="small">
                  {{ entry.type }}
                </el-tag>
                <span class="text-sm font-medium text-on-surface">{{ entry.description }}</span>
              </div>
              <p v-if="entry.detail" class="text-xs text-secondary mt-1">{{ entry.detail }}</p>
            </div>
            <span class="text-xs text-secondary whitespace-nowrap ml-4">{{ entry.date }}</span>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-secondary">
        <el-icon :size="48" class="mb-2"><Document /></el-icon>
        <p>暂无日志记录</p>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
