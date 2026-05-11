<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheck, Document, EditPen, Refresh, Warning } from '@element-plus/icons-vue'
import {
  knowledgeApi,
  type LintResponse,
  type LogsResponse,
  type StatsResponse,
} from '../services/knowledge'

const router = useRouter()

const selectedDomain = ref('产品知识')
const selectedProductLine = ref('')

const stats = ref<StatsResponse | null>(null)
const isLoadingStats = ref(false)

const lintResult = ref<LintResponse | null>(null)
const isLinting = ref(false)

const logs = ref<LogsResponse | null>(null)
const isLoadingLogs = ref(false)
const selectedLogType = ref('')
const logLimit = ref(20)

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
  { label: '网站监测系统', value: '网站监测系统' },
  { label: 'API模块', value: 'API模块' },
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


</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-baseline gap-3 mb-1">
          <h1 class="text-2xl font-bold text-on-surface">知识库管理</h1>
          <span class="geek-label">LLM_WIKI_SYSTEM</span>
        </div>
        <p class="text-sm text-secondary mt-1">手动编写资料并管理知识库内容</p>
      </div>
      <el-button type="primary" :icon="Refresh" @click="loadStats(); loadLogs()">刷新</el-button>
    </div>

    <div class="geek-panel p-5">
      <div class="flex items-center gap-2 mb-4 pb-3 border-b border-outline">
        <el-icon><Document /></el-icon>
        <span class="font-semibold text-sm">资料编写</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <el-select v-model="selectedDomain" placeholder="选择知识域">
          <el-option v-for="opt in domainOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>

        <el-select v-model="selectedProductLine" clearable placeholder="选择产品线（可选）">
          <el-option v-for="opt in productLineOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>

        <el-button type="primary" @click="router.push({
          path: '/knowledge/manual-entry',
          query: {
            mode: 'wiki',
            domain: selectedDomain,
            productLine: selectedProductLine
          }
        })">
          <el-icon class="mr-1"><EditPen /></el-icon> 手动编写资料
        </el-button>
      </div>
    </div>

    <div class="geek-panel p-5">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-outline">
        <div class="flex items-center gap-2">
          <el-icon><Document /></el-icon>
          <span class="font-semibold text-sm">统计信息</span>
        </div>
        <el-button text :icon="Refresh" :loading="isLoadingStats" @click="loadStats">刷新</el-button>
      </div>

      <div class="border border-outline p-4 text-center mb-4 bg-surface-container-high">
        <p class="geek-label">总页面数</p>
        <p class="text-3xl font-bold text-primary font-mono">{{ totalPages }}</p>
        <p v-if="stats?.last_updated" class="text-xs text-secondary mt-1 font-mono">{{ stats.last_updated }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="row in domainStatsRows" :key="row.domain" class="border border-outline p-3 bg-surface-container-low">
          <div class="flex items-center justify-between">
            <span class="font-medium text-on-surface text-sm">{{ row.domain }}</span>
            <span class="text-primary font-semibold font-mono">{{ row.total }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="geek-panel p-5">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-outline">
        <div class="flex items-center gap-2">
          <el-icon><Warning /></el-icon>
          <span class="font-semibold text-sm">Lint 健康检查</span>
        </div>
        <el-button type="warning" :loading="isLinting" @click="runLint">运行 Lint</el-button>
      </div>

      <div v-if="lintResult" class="grid grid-cols-3 gap-3 text-center">
        <div class="border border-outline p-3 bg-surface-container-low">
          <p class="geek-label">孤立页面</p>
          <p class="text-xl font-bold font-mono">{{ lintResult.summary.orphan_pages }}</p>
        </div>
        <div class="border border-outline p-3 bg-surface-container-low">
          <p class="geek-label">断链</p>
          <p class="text-xl font-bold font-mono">{{ lintResult.summary.broken_links }}</p>
        </div>
        <div class="border border-outline p-3 bg-surface-container-low">
          <p class="geek-label">过期页面</p>
          <p class="text-xl font-bold font-mono">{{ lintResult.summary.stale_pages }}</p>
        </div>
      </div>
      <div v-else class="text-sm text-secondary">尚未执行 Lint</div>
    </div>

    <div class="geek-panel p-5">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-outline">
        <div class="flex items-center gap-2">
          <el-icon><CircleCheck /></el-icon>
          <span class="font-semibold text-sm">操作日志</span>
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

      <div v-if="logs?.entries?.length" class="space-y-2">
        <div v-for="(entry, idx) in logs.entries" :key="idx" class="border border-outline p-3 bg-surface-container-low">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-on-surface">{{ entry.description }}</p>
              <p v-if="entry.detail" class="text-xs text-secondary font-mono">{{ entry.detail }}</p>
            </div>
            <div class="text-right">
              <el-tag size="small">{{ entry.type.toUpperCase() }}</el-tag>
              <p class="text-xs text-secondary mt-1 font-mono">{{ entry.date }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-secondary">暂无日志</div>
    </div>
  </div>
</template>
