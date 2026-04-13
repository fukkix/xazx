<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { knowledgeApi, type TaskStatus, type DomainStat } from '../services/knowledge'

// ── Stats ──────────────────────────────────────────────
const totalPages = ref(0)
const domainStats = ref<DomainStat[]>([])
const statsLoading = ref(false)
const backendOnline = ref<boolean | null>(null)

const domainMeta: Record<string, { label: string; icon: string; color: string }> = {
  product:    { label: '产品知识库', icon: 'Box',        color: 'text-blue-600 bg-blue-50' },
  tech:       { label: '技术文档库', icon: 'SetUp',      color: 'text-purple-600 bg-purple-50' },
  sales:      { label: '销售支持库', icon: 'Connection', color: 'text-green-600 bg-green-50' },
  compliance: { label: '行业合规库', icon: 'Reading',    color: 'text-amber-600 bg-amber-50' },
  ops:        { label: '内部运营库', icon: 'Notebook',   color: 'text-rose-600 bg-rose-50' }
}

const loadStats = async () => {
  statsLoading.value = true
  try {
    const res = await knowledgeApi.getStats()
    totalPages.value = res.total_pages
    domainStats.value = res.domains
    backendOnline.value = true
  } catch {
    backendOnline.value = false
  } finally {
    statsLoading.value = false
  }
}

// ── Upload / Ingest ─────────────────────────────────────
const selectedDomain = ref('product')
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)
const fileInputRef = ref<HTMLInputElement | null>(null)

const domainOptions = [
  { value: 'product',    label: '产品知识库' },
  { value: 'tech',       label: '技术文档库' },
  { value: 'sales',      label: '销售支持库' },
  { value: 'compliance', label: '行业合规库' },
  { value: 'ops',        label: '内部运营库' }
]

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

// ── Task Polling ─────────────────────────────────────────
interface TaskRecord extends TaskStatus {
  filename: string
  domain: string
  startedAt: string
}

const tasks = ref<TaskRecord[]>([])

const pollTask = async (taskId: string) => {
  const MAX_TRIES = 60
  let tries = 0
  const interval = setInterval(async () => {
    tries++
    try {
      const status = await knowledgeApi.getTaskStatus(taskId)
      const idx = tasks.value.findIndex(t => t.task_id === taskId)
      const task = idx !== -1 ? tasks.value[idx] : undefined
      if (task) {
        task.status = status.status
        task.progress = status.progress
        task.error = status.error
        task.wiki_page = status.wiki_page
      }
      if (status.status === 'success' || status.status === 'failed' || tries >= MAX_TRIES) {
        clearInterval(interval)
        if (status.status === 'success') {
          ElMessage.success('入库完成！')
          loadStats()
        }
      }
    } catch {
      clearInterval(interval)
    }
  }, 3000)
}

const statusLabel: Record<string, string> = {
  pending:    '等待中',
  running:    '处理中',
  processing: '处理中',
  success:    '已完成',
  failed:     '失败',
  error:      '失败'
}

const statusColor: Record<string, string> = {
  pending: 'text-secondary bg-surface-container-high',
  running: 'text-primary bg-primary/10',
  success: 'text-green-700 bg-green-50',
  failed:  'text-error bg-error/10'
}

onMounted(() => {
  loadStats()
})
</script>

<template>
  <main class="max-w-7xl mx-auto">
    <header class="mb-10 flex items-end justify-between">
      <div>
        <h1 class="text-3xl font-black text-on-background tracking-tight mb-2">知识库管理</h1>
        <p class="text-on-surface-variant font-medium">上传原始文档，由 LLM 自动解析并入库为结构化 Wiki。</p>
      </div>
      <div class="flex items-center gap-2 text-xs font-medium">
        <span
          class="w-2 h-2 rounded-full"
          :class="backendOnline === null ? 'bg-secondary animate-pulse' : backendOnline ? 'bg-green-500' : 'bg-error'"
        ></span>
        <span class="text-secondary">
          {{ backendOnline === null ? '检测中...' : backendOnline ? '后端在线' : '后端离线 (localhost:8000)' }}
        </span>
      </div>
    </header>

    <!-- ── Stats ─────────────────────────────── -->
    <section class="mb-10">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold text-on-surface">Wiki 统计</h2>
        <button class="text-xs text-primary font-semibold hover:underline" @click="loadStats">刷新</button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <!-- Total -->
        <div class="bg-primary text-on-primary rounded-2xl p-5 shadow-lg col-span-2 md:col-span-1 flex flex-col justify-between">
          <span class="text-primary-fixed-dim text-xs font-bold uppercase tracking-widest">Wiki 总量</span>
          <div class="text-4xl font-black mt-2">{{ statsLoading ? '–' : totalPages }}</div>
          <span class="text-primary-fixed-dim text-xs mt-1">篇知识文章</span>
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
          <div class="text-xs text-secondary mt-1">{{ d.label }}</div>
        </div>
      </div>
    </section>

    <!-- ── Upload ─────────────────────────────── -->
    <section class="mb-10 bg-surface-container-lowest rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,52,94,0.05)]">
      <h2 class="text-lg font-bold text-on-surface mb-6">上传文档入库</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <!-- Domain Selector -->
        <div>
          <label class="text-xs font-bold text-secondary uppercase tracking-wider block mb-2">知识域</label>
          <el-select v-model="selectedDomain" class="w-full" size="large">
            <el-option
              v-for="opt in domainOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>

        <!-- File Picker -->
        <div>
          <label class="text-xs font-bold text-secondary uppercase tracking-wider block mb-2">选择文件</label>
          <div
            class="relative border-2 border-dashed border-outline/30 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-primary/40 transition-colors cursor-pointer"
            @click="fileInputRef?.click()"
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

        <!-- Submit Button -->
        <div>
          <button
            :disabled="uploading || selectedFiles.length === 0 || !backendOnline"
            class="w-full py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 shadow hover:bg-primary-dim active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleIngest"
          >
            <el-icon :size="18"><Upload /></el-icon>
            {{ uploading ? '提交中...' : '开始入库' }}
          </button>
        </div>
      </div>

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

    <!-- ── Tasks ─────────────────────────────── -->
    <section>
      <h2 class="text-lg font-bold text-on-surface mb-5">入库任务记录</h2>

      <div v-if="tasks.length === 0" class="flex flex-col items-center gap-3 py-16 text-center">
        <el-icon :size="40" class="text-secondary/30"><UploadFilled /></el-icon>
        <p class="text-sm font-medium text-secondary">暂无入库任务</p>
        <p class="text-xs text-on-surface-variant">上传文档后，可在此实时追踪入库进度</p>
      </div>

      <div v-else class="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(0,52,94,0.04)] overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-surface-container-low">
            <tr>
              <th class="text-left px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">文件名</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">知识域</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">提交时间</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">状态</th>
              <th class="text-left px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">进度</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline/10">
            <tr
              v-for="task in tasks"
              :key="task.task_id"
              class="hover:bg-surface-container-low transition-colors"
            >
              <td class="px-6 py-4 font-medium text-on-surface truncate max-w-[200px]">{{ task.filename }}</td>
              <td class="px-6 py-4 text-secondary">{{ domainMeta[task.domain]?.label }}</td>
              <td class="px-6 py-4 text-secondary font-mono text-xs">{{ task.startedAt }}</td>
              <td class="px-6 py-4">
                <span
                  class="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  :class="statusColor[task.status]"
                >
                  {{ statusLabel[task.status] }}
                </span>
              </td>
              <td class="px-6 py-4 text-xs text-secondary">
                <span v-if="task.error" class="text-error">{{ task.error }}</span>
                <span v-else-if="task.wiki_page" class="text-primary">→ {{ task.wiki_page }}</span>
                <span v-else>{{ task.progress ?? '–' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>
