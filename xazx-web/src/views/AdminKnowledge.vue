<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { CircleCheck, Document, Loading, Refresh, UploadFilled, Warning } from '@element-plus/icons-vue'
import {
  knowledgeApi,
  type IngestResponse,
  type LintResponse,
  type LogsResponse,
  type StatsResponse,
  type TaskStatusResponse
} from '../services/knowledge'

type TaskRow = {
  task_id: string
  filename: string
  domain: string
  status: 'processing' | 'success' | 'error'
  progress: string
  startedAt: string
  processing_time_ms?: number
  error?: string
  wiki_page_title?: string
  wiki_page_path?: string
}

const selectedDomain = ref('产品知识')
const selectedProductLine = ref('')
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)
const fileInputRef = ref<HTMLInputElement | null>(null)

const stats = ref<StatsResponse | null>(null)
const isLoadingStats = ref(false)

const lintResult = ref<LintResponse | null>(null)
const isLinting = ref(false)

const logs = ref<LogsResponse | null>(null)
const isLoadingLogs = ref(false)
const selectedLogType = ref('')
const logLimit = ref(20)

const tasks = ref<TaskRow[]>([])
const pollingTimers = new Map<string, number>()

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
  { label: '态势感知', value: '态势感知' },
  { label: '大模型安全', value: '大模型安全' },
  { label: '其他', value: '其他' }
]

const logTypeOptions = [
  { label: '全部', value: '' },
  { label: '入库', value: 'ingest' },
  { label: '检索', value: 'search' },
  { label: 'Lint', value: 'lint' },
  { label: '初始化', value: 'init' }
]

const totalPages = computed(() => stats.value?.total ?? 0)

const domainStatsRows = computed(() => {
  const map = stats.value?.domains ?? {}
  return Object.entries(map).map(([domain, data]) => ({
    domain,
    total: data.total,
    sub: data.sub ?? {}
  }))
})

const progressTextMap: Record<string, string> = {
  uploading: '上传中',
  parsing: '解析文档',
  generating: '生成 Wiki 页面',
  updating_index: '更新索引',
  done: '完成'
}

const progressPercentMap: Record<string, number> = {
  uploading: 20,
  parsing: 40,
  generating: 70,
  updating_index: 90,
  done: 100
}

const statusTagType = (status: TaskRow['status']) => {
  if (status === 'success') return 'success'
  if (status === 'error') return 'danger'
  return 'warning'
}

const formatTaskProgress = (progress: string) => progressTextMap[progress] ?? progress
const taskPercent = (progress: string) => progressPercentMap[progress] ?? 10

const resetFileInput = () => {
  selectedFiles.value = []
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  selectedFiles.value = input.files ? Array.from(input.files) : []
}

const upsertTask = (payload: TaskStatusResponse, fallback?: { filename: string; domain: string }) => {
  const idx = tasks.value.findIndex((it) => it.task_id === payload.task_id)
  const next: TaskRow = {
    task_id: payload.task_id,
    filename: idx >= 0 ? tasks.value[idx].filename : (fallback?.filename ?? '未知文件'),
    domain: idx >= 0 ? tasks.value[idx].domain : (fallback?.domain ?? selectedDomain.value),
    status: payload.status,
    progress: payload.progress,
    startedAt: idx >= 0 ? tasks.value[idx].startedAt : new Date().toLocaleString('zh-CN'),
    processing_time_ms: payload.processing_time_ms,
    error: payload.error,
    wiki_page_title: payload.wiki_page_title,
    wiki_page_path: payload.wiki_page_path
  }

  if (idx >= 0) {
    tasks.value[idx] = next
  } else {
    tasks.value.unshift(next)
  }
}

const stopPolling = (taskId: string) => {
  const timer = pollingTimers.get(taskId)
  if (timer) {
    window.clearTimeout(timer)
    pollingTimers.delete(taskId)
  }
}

const pollTask = async (taskId: string, fallback?: { filename: string; domain: string }) => {
  try {
    const status = await knowledgeApi.getTaskStatus(taskId)
    upsertTask(status, fallback)

    if (status.status === 'success') {
      stopPolling(taskId)
      ElNotification({
        title: '入库成功',
        message: `${status.wiki_page_title ?? 'Wiki 页面'} 已生成`,
        type: 'success',
        duration: 4000
      })
      await Promise.all([loadStats(), loadLogs()])
      return
    }

    if (status.status === 'error') {
      stopPolling(taskId)
      ElNotification({
        title: '入库失败',
        message: status.error ?? '未知错误',
        type: 'error',
        duration: 5000
      })
      return
    }

    const timer = window.setTimeout(() => pollTask(taskId, fallback), 2000)
    pollingTimers.set(taskId, timer)
  } catch (error: any) {
    stopPolling(taskId)
    ElMessage.error(`任务状态查询失败: ${error.message ?? '未知错误'}`)
  }
}

const submitOne = async (file: File): Promise<IngestResponse> => {
  const progressCb = selectedFiles.value.length === 1
    ? (pct: number) => {
        uploadProgress.value = pct
      }
    : () => {}

  return knowledgeApi.ingestWithProgress(file, selectedDomain.value, progressCb, selectedProductLine.value || undefined)
}

const handleIngest = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  uploading.value = true
  uploadProgress.value = 0

  try {
    const files = [...selectedFiles.value]
    const submitted: { task_id: string; file: File }[] = []

    for (const file of files) {
      const res = await submitOne(file)
      submitted.push({ task_id: res.task_id, file })
      upsertTask(
        {
          task_id: res.task_id,
          status: 'processing',
          progress: 'uploading'
        },
        { filename: file.name, domain: selectedDomain.value }
      )
    }

    for (const item of submitted) {
      pollTask(item.task_id, { filename: item.file.name, domain: selectedDomain.value })
    }

    ElMessage.success(`已提交 ${submitted.length} 个文件，正在构建 LLM Wiki`) 
    resetFileInput()
    await Promise.all([loadStats(), loadLogs()])
  } catch (error: any) {
    ElMessage.error(`入库失败: ${error.message ?? '未知错误'}`)
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const loadStats = async () => {
  isLoadingStats.value = true
  try {
    stats.value = await knowledgeApi.getStats()
  } catch (error: any) {
    ElMessage.error(`加载统计失败: ${error.message ?? '未知错误'}`)
  } finally {
    isLoadingStats.value = false
  }
}

const runLint = async () => {
  isLinting.value = true
  try {
    lintResult.value = await knowledgeApi.lint()
    ElMessage.success('Lint 检查完成')
  } catch (error: any) {
    ElMessage.error(`Lint 失败: ${error.message ?? '未知错误'}`)
  } finally {
    isLinting.value = false
  }
}

const loadLogs = async () => {
  isLoadingLogs.value = true
  try {
    logs.value = await knowledgeApi.getLogs(logLimit.value, selectedLogType.value || undefined)
  } catch (error: any) {
    ElMessage.error(`加载日志失败: ${error.message ?? '未知错误'}`)
  } finally {
    isLoadingLogs.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadStats(), loadLogs()])
})

onBeforeUnmount(() => {
  for (const timer of pollingTimers.values()) {
    window.clearTimeout(timer)
  }
  pollingTimers.clear()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-on-surface">知识库管理</h1>
        <p class="text-sm text-secondary mt-1">上传文档并触发 LLM Wiki 构建</p>
      </div>
      <el-button type="primary" :icon="Refresh" @click="loadStats(); loadLogs()">刷新</el-button>
    </div>

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center gap-2">
          <el-icon><UploadFilled /></el-icon>
          <span class="font-semibold">文档入库</span>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <el-select v-model="selectedDomain" placeholder="选择知识域">
          <el-option v-for="opt in domainOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>

        <el-select v-model="selectedProductLine" clearable placeholder="选择产品线（可选）">
          <el-option v-for="opt in productLineOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>

        <input
          ref="fileInputRef"
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg"
          class="block w-full text-sm text-on-surface file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-on-primary"
          @change="handleFileChange"
        >
      </div>

      <div class="mt-4 flex items-center justify-between gap-4">
        <div class="text-sm text-secondary">
          {{ selectedFiles.length > 0 ? `已选择 ${selectedFiles.length} 个文件` : '未选择文件' }}
        </div>
        <el-button type="primary" :loading="uploading" :disabled="selectedFiles.length === 0" @click="handleIngest">
          {{ uploading ? '提交中...' : '开始入库并构建 Wiki' }}
        </el-button>
      </div>

      <div v-if="uploading && uploadProgress > 0" class="mt-3">
        <el-progress :percentage="uploadProgress" :stroke-width="8" />
      </div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center gap-2">
          <el-icon><Loading /></el-icon>
          <span class="font-semibold">入库任务</span>
        </div>
      </template>

      <div v-if="tasks.length === 0" class="text-secondary text-sm">暂无任务</div>
      <div v-else class="space-y-3">
        <div v-for="row in tasks" :key="row.task_id" class="rounded-lg border border-surface-container-high p-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="font-medium text-on-surface">{{ row.filename }}</p>
              <p class="text-xs text-secondary">{{ row.domain }} | {{ row.startedAt }}</p>
            </div>
            <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </div>

          <div class="mt-3">
            <div class="flex items-center justify-between mb-1 text-xs text-secondary">
              <span>{{ formatTaskProgress(row.progress) }}</span>
              <span>{{ taskPercent(row.progress) }}%</span>
            </div>
            <el-progress :percentage="taskPercent(row.progress)" :status="row.status === 'error' ? 'exception' : row.status === 'success' ? 'success' : ''" :stroke-width="8" />
          </div>

          <p v-if="row.wiki_page_title" class="text-sm text-green-700 mt-2">
            {{ row.wiki_page_title }}
          </p>
          <p v-if="row.wiki_page_path" class="text-xs text-secondary">{{ row.wiki_page_path }}</p>
          <p v-if="row.error" class="text-sm text-red-700 mt-2">{{ row.error }}</p>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <el-icon><Document /></el-icon>
            <span class="font-semibold">统计信息</span>
          </div>
          <el-button text :icon="Refresh" :loading="isLoadingStats" @click="loadStats">刷新</el-button>
        </div>
      </template>

      <div class="bg-primary/10 rounded-lg p-4 text-center mb-4">
        <p class="text-xs text-secondary">总页面数</p>
        <p class="text-3xl font-bold text-primary">{{ totalPages }}</p>
        <p v-if="stats?.last_updated" class="text-xs text-secondary mt-1">{{ stats.last_updated }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="row in domainStatsRows" :key="row.domain" class="rounded-lg bg-surface-container-low p-3">
          <div class="flex items-center justify-between">
            <span class="font-medium text-on-surface">{{ row.domain }}</span>
            <span class="text-primary font-semibold">{{ row.total }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <el-icon><Warning /></el-icon>
            <span class="font-semibold">Lint 健康检查</span>
          </div>
          <el-button type="warning" :loading="isLinting" @click="runLint">运行 Lint</el-button>
        </div>
      </template>

      <div v-if="lintResult" class="grid grid-cols-3 gap-3 text-center">
        <div class="rounded-lg p-3 bg-surface-container-low">
          <p class="text-xs text-secondary">孤立页面</p>
          <p class="text-xl font-bold">{{ lintResult.summary.orphan_pages }}</p>
        </div>
        <div class="rounded-lg p-3 bg-surface-container-low">
          <p class="text-xs text-secondary">断链</p>
          <p class="text-xl font-bold">{{ lintResult.summary.broken_links }}</p>
        </div>
        <div class="rounded-lg p-3 bg-surface-container-low">
          <p class="text-xs text-secondary">过期页面</p>
          <p class="text-xl font-bold">{{ lintResult.summary.stale_pages }}</p>
        </div>
      </div>
      <div v-else class="text-sm text-secondary">尚未执行 Lint</div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <el-icon><CircleCheck /></el-icon>
            <span class="font-semibold">操作日志</span>
          </div>
          <div class="flex items-center gap-2">
            <el-select v-model="selectedLogType" placeholder="类型" size="small" style="width: 110px" @change="loadLogs">
              <el-option v-for="option in logTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
            <el-select v-model="logLimit" placeholder="数量" size="small" style="width: 90px" @change="loadLogs">
              <el-option label="10" :value="10" />
              <el-option label="20" :value="20" />
              <el-option label="50" :value="50" />
            </el-select>
            <el-button text :icon="Refresh" :loading="isLoadingLogs" @click="loadLogs">刷新</el-button>
          </div>
        </div>
      </template>

      <div v-if="logs?.entries?.length" class="space-y-2">
        <div v-for="(entry, idx) in logs.entries" :key="idx" class="rounded-lg bg-surface-container-low p-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-on-surface">{{ entry.description }}</p>
              <p v-if="entry.detail" class="text-xs text-secondary">{{ entry.detail }}</p>
            </div>
            <div class="text-right">
              <el-tag size="small">{{ entry.type }}</el-tag>
              <p class="text-xs text-secondary mt-1">{{ entry.date }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-secondary">暂无日志</div>
    </el-card>
  </div>
</template>
