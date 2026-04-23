<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { knowledgeApi } from '../services/knowledge'

const totalMaterials = ref(0)
const pendingReview = ref(0)
const storageUsage = ref(0)
const tableData = ref<any[]>([])
const loading = ref(false)

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const stats = await knowledgeApi.getStats()
    totalMaterials.value = stats.total || 0
    pendingReview.value = 0
    storageUsage.value = 0
    const domains = stats.domains || {}
    const rows: any[] = []
    let id = 1
    for (const [domain, info] of Object.entries(domains)) {
      rows.push({
        id: id++,
        name: `${domain} 知识库`,
        size: `${info.total} 篇`,
        category: 'Documents',
        author: '系统自动统计',
        date: stats.last_updated,
        icon: 'Document'
      })
    }
    tableData.value = rows
  } catch (e) {
    console.error('获取仪表盘数据失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <main class="max-w-7xl mx-auto">
    <!-- Header Section -->
    <header class="mb-6">
      <div class="flex items-baseline gap-3 mb-1">
        <h1 class="text-2xl font-bold text-on-background tracking-tight">企业管理控制台</h1>
        <span class="geek-label">DASHBOARD_V1.0</span>
      </div>
      <p class="text-on-surface-variant text-sm max-w-2xl">集中管理平台核心资源、用户权限及数字资产分发。</p>
    </header>

    <!-- Statistics Grid -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="geek-panel p-5">
        <div class="flex justify-between items-start mb-3">
          <span class="p-2 bg-surface-container-high text-primary border border-outline inline-flex">
            <el-icon :size="20"><Box /></el-icon>
          </span>
          <span class="geek-tag geek-tag-primary">+12.5%</span>
        </div>
        <h3 class="geek-label mb-1">资料总数量</h3>
        <div class="text-3xl font-bold text-on-surface font-mono">{{ totalMaterials }}</div>
      </div>

      <div class="geek-panel p-5">
        <div class="flex justify-between items-start mb-3">
          <span class="p-2 bg-surface-container-high text-tertiary border border-outline inline-flex">
            <el-icon :size="20"><Clock /></el-icon>
          </span>
          <span class="geek-tag" style="border-color: #dc2626; color: #dc2626;">高优先级</span>
        </div>
        <h3 class="geek-label mb-1">待审核内容</h3>
        <div class="text-3xl font-bold text-on-surface font-mono">{{ pendingReview }}</div>
      </div>

      <div class="geek-panel p-5 bg-on-surface text-on-primary">
        <div class="flex justify-between items-start mb-3">
          <span class="p-2 bg-white/10 text-white border border-white/20 inline-flex">
            <el-icon :size="20"><UploadFilled /></el-icon>
          </span>
        </div>
        <h3 class="geek-label mb-1" style="color: #a1a1aa;">存储空间使用率</h3>
        <div class="text-3xl font-bold mb-3 font-mono">{{ storageUsage }}%</div>
        <div class="w-full bg-white/10 h-1">
          <div class="bg-white h-full" :style="{ width: storageUsage + '%' }"></div>
        </div>
      </div>
    </section>

    <!-- Resource Table Section -->
    <section class="geek-panel p-5">
      <div class="border-b border-outline pb-3 mb-3 flex flex-col md:flex-row justify-between items-center gap-3">
        <div class="flex items-center gap-2">
          <h2 class="text-base font-bold text-on-surface">平台资源列表</h2>
          <span class="geek-label">{{ tableData.length }} RECORDS</span>
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <el-input placeholder="搜索资料名称..." clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button type="primary" plain>
            <el-icon class="mr-1"><Filter /></el-icon> 筛选
          </el-button>
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%" row-class-name="hover:bg-surface-container-high transition-colors group cursor-pointer" :header-cell-style="{background:'#f5f5f5',color:'#52525b',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.05em'}">
        <el-table-column label="资料名称" min-width="200">
          <template #default="scope">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-surface-container-high border border-outline flex items-center justify-center text-primary">
                <el-icon><component :is="scope.row.icon" /></el-icon>
              </div>
              <div>
                <div class="font-bold text-on-surface text-sm">{{ scope.row.name }}</div>
                <div class="text-xs text-on-surface-variant font-mono">{{ scope.row.size }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="所属分类">
          <template #default="scope">
            <span class="geek-tag">{{ scope.row.category === 'Documents' ? '文档' : (scope.row.category === 'Images' ? '图片' : 'PPT') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="上传者" />
        <el-table-column prop="date" label="上传日期" />
        <el-table-column label="操作" align="right" width="120">
          <template #default>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
              <el-button link type="primary"><el-icon><Edit /></el-icon></el-button>
              <el-button link type="danger"><el-icon><Delete /></el-icon></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-3 flex justify-between items-center">
        <span class="geek-label">当前显示 {{ tableData.length }} 条，共 {{ tableData.length }} 条记录</span>
        <el-pagination background layout="prev, pager, next" :total="tableData.length" :page-size="10" />
      </div>
    </section>
  </main>
</template>
