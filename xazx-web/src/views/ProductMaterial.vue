<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  Upload, Search, Delete, Document, Picture, DataBoard,
  Filter, RefreshRight, Box, Collection, Files, Monitor, View, Check, Close
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../services/auth'

// 产品列表
const products = ref([
  { id: 1, name: '网站监测系统', code: 'website_monitor' },
  { id: 2, name: 'WAF', code: 'waf' },
  { id: 3, name: '动态防御', code: 'dynamic_defense' },
  { id: 4, name: '全流量分析', code: 'traffic_analysis' },
  { id: 5, name: 'API模块', code: 'api_module' },
  { id: 6, name: '大模型安全', code: 'llm_security' },
  { id: 7, name: '其他', code: 'other' },
])

// 文件分类
const fileCategories = ref([
  { id: 1, name: '白皮书', code: 'whitepaper' },
  { id: 2, name: '操作手册', code: 'manual' },
  { id: 3, name: '功能清单', code: 'feature_list' },
  { id: 4, name: '功能说明', code: 'feature_desc' },
  { id: 5, name: '宣传PPT', code: 'promo_ppt' },
  { id: 6, name: '宣传折页', code: 'promo_brochure' },
  { id: 7, name: 'FQA', code: 'fqa' },
  { id: 8, name: '相关图片资料', code: 'images' },
])

// 状态
const loading = ref(false)
const tableData = ref<any[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)
const searchKeyword = ref('')
const filterProduct = ref('')
const filterCategory = ref('')
const filterStatus = ref('')

const auth = useAuthStore()
const canAudit = computed(() => auth.hasPermission('product.audit'))

const isUploadDialogVisible = ref(false)
const uploadProduct = ref('')
const uploadCategory = ref('')
const uploadTitle = ref('')
const uploadDesc = ref('')
const uploadFileList = ref<any[]>([])

const stats = ref({ total: 0, products: 7, categories: 8, size: '0 MB' })

// API 基础路径（通过 Vite 代理转发到 PHP 后端）
const API_BASE = '/api'

const fetchStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/files.php?size=1000`, {
      headers: auth.token ? { 'X-Token': auth.token } : {}
    })
    const data = await res.json()
    if (data.success) {
      stats.value.total = data.data.total
      let totalSize = 0
      data.data.list.forEach((f: any) => { totalSize += parseInt(f.file_size) })
      if (totalSize > 1024 * 1024 * 1024) stats.value.size = (totalSize / 1024 / 1024 / 1024).toFixed(2) + ' GB'
      else if (totalSize > 1024 * 1024) stats.value.size = (totalSize / 1024 / 1024).toFixed(2) + ' MB'
      else if (totalSize > 1024) stats.value.size = (totalSize / 1024).toFixed(2) + ' KB'
      else stats.value.size = totalSize + ' B'
    }
  } catch (e) { console.error(e) }
}

const fetchFiles = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filterProduct.value) params.append('product_id', filterProduct.value)
    if (filterCategory.value) params.append('category_id', filterCategory.value)
    if (searchKeyword.value) params.append('keyword', searchKeyword.value)
    if (filterStatus.value) params.append('status', filterStatus.value)
    params.append('page', String(currentPage.value))
    params.append('size', String(pageSize.value))

    const res = await fetch(`${API_BASE}/files.php?${params}`, {
      headers: auth.token ? { 'X-Token': auth.token } : {}
    })
    const data = await res.json()
    if (data.success) {
      tableData.value = data.data.list
      totalCount.value = data.data.total
    }
  } catch (e) {
    ElMessage.error('加载文件列表失败')
  } finally {
    loading.value = false
  }
}

const handleUpload = async () => {
  if (!uploadProduct.value) { ElMessage.warning('请选择产品分类'); return }
  if (!uploadCategory.value) { ElMessage.warning('请选择文件分类'); return }
  if (!uploadTitle.value.trim()) { ElMessage.warning('请输入文件标题'); return }
  if (uploadFileList.value.length === 0) { ElMessage.warning('请选择要上传的文件'); return }

  const formData = new FormData()
  formData.append('product_id', uploadProduct.value)
  formData.append('category_id', uploadCategory.value)
  formData.append('title', uploadTitle.value.trim())
  formData.append('description', uploadDesc.value.trim())
  formData.append('file', uploadFileList.value[0].raw)

  try {
    const res = await fetch(`${API_BASE}/upload.php`, {
      method: 'POST',
      headers: auth.token ? { 'X-Token': auth.token } : {},
      body: formData
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success(data.message || '上传成功')
      isUploadDialogVisible.value = false
      resetUploadForm()
      fetchFiles()
      fetchStats()
    } else {
      ElMessage.error(data.message || '上传失败')
    }
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

const resetUploadForm = () => {
  uploadProduct.value = ''
  uploadCategory.value = ''
  uploadTitle.value = ''
  uploadDesc.value = ''
  uploadFileList.value = []
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除 "${row.title}" 吗？`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await fetch(`${API_BASE}/delete.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(auth.token ? { 'X-Token': auth.token } : {}) },
      body: JSON.stringify({ id: row.id })
    })
    const data = await res.json()
    if (data.success) {
      ElMessage.success('删除成功')
      fetchFiles()
      fetchStats()
    } else {
      ElMessage.error(data.message)
    }
  } catch (e) {
    // cancelled
  }
}

const handlePreview = (row: any) => {
  window.open(`http://localhost/xazx-admin/${row.file_path}`, '_blank')
}

const handleAudit = async (row: any, status: 'approved' | 'rejected') => {
  try {
    await authApi.auditFile(row.id, status)
    ElMessage.success(status === 'approved' ? '审核通过' : '已拒绝')
    fetchFiles()
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

const statusTagType = (status: string) => {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  return 'warning'
}

const statusLabel = (status: string) => {
  if (status === 'approved') return '已通过'
  if (status === 'rejected') return '已拒绝'
  return '待审核'
}

const getFileIcon = (type: string) => {
  if (['png', 'jpg', 'jpeg'].includes(type)) return Picture
  if (['ppt', 'pptx'].includes(type)) return DataBoard
  return Document
}

const formatFileSize = (size: number) => {
  if (size > 1024 * 1024 * 1024) return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
  if (size > 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + ' MB'
  if (size > 1024) return (size / 1024).toFixed(2) + ' KB'
  return size + ' B'
}

onMounted(() => {
  fetchStats()
  fetchFiles()
})
</script>

<template>
  <main class="max-w-7xl mx-auto">
    <!-- Header -->
    <header class="mb-6">
      <div class="flex items-baseline gap-3 mb-1">
        <h1 class="text-2xl font-bold text-on-background tracking-tight">产品资料管理</h1>
        <span class="geek-label">MATERIAL_MANAGEMENT_V1.0</span>
      </div>
      <p class="text-on-surface-variant text-sm max-w-2xl">管理所有产品相关的文档、手册、宣传资料等文件。支持按产品和文件分类维度进行上传和维护。</p>
    </header>

    <!-- Statistics Grid -->
    <section class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="geek-panel p-5">
        <div class="flex justify-between items-start mb-3">
          <span class="p-2 bg-surface-container-high text-primary border border-outline inline-flex">
            <el-icon :size="20"><Box /></el-icon>
          </span>
          <span class="geek-tag geek-tag-live">LIVE</span>
        </div>
        <h3 class="geek-label mb-1">资料总数量</h3>
        <div class="text-3xl font-bold text-on-surface font-mono">{{ stats.total }}</div>
      </div>

      <div class="geek-panel p-5">
        <div class="flex justify-between items-start mb-3">
          <span class="p-2 bg-surface-container-high text-tertiary border border-outline inline-flex">
            <el-icon :size="20"><Collection /></el-icon>
          </span>
          <span class="geek-tag geek-tag-ghost">8 CATS</span>
        </div>
        <h3 class="geek-label mb-1">文件分类</h3>
        <div class="text-3xl font-bold text-on-surface font-mono">{{ stats.categories }}</div>
      </div>

      <div class="geek-panel p-5">
        <div class="flex justify-between items-start mb-3">
          <span class="p-2 bg-surface-container-high text-tertiary border border-outline inline-flex">
            <el-icon :size="20"><Monitor /></el-icon>
          </span>
          <span class="geek-tag geek-tag-ghost">{{ stats.products }} PRODS</span>
        </div>
        <h3 class="geek-label mb-1">产品分类</h3>
        <div class="text-3xl font-bold text-on-surface font-mono">{{ stats.products }}</div>
      </div>

      <div class="geek-panel p-5 bg-on-surface text-on-primary">
        <div class="flex justify-between items-start mb-3">
          <span class="p-2 bg-white/10 text-white border border-white/20 inline-flex">
            <el-icon :size="20"><Files /></el-icon>
          </span>
        </div>
        <h3 class="geek-label mb-1" style="color: #a1a1aa;">存储空间</h3>
        <div class="text-3xl font-bold mb-3 font-mono">{{ stats.size }}</div>
      </div>
    </section>

    <!-- Main Panel -->
    <section class="geek-panel p-5">
      <!-- Toolbar -->
      <div class="border-b border-outline pb-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div class="flex items-center gap-2">
          <h2 class="text-base font-bold text-on-surface">文件列表</h2>
          <span class="geek-label">{{ totalCount }} RECORDS</span>
        </div>
        <div class="flex gap-2 w-full md:w-auto flex-wrap">
          <el-select v-model="filterProduct" placeholder="全部产品" clearable style="width: 160px" @change="currentPage = 1; fetchFiles()">
            <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
          <el-select v-model="filterCategory" placeholder="全部分类" clearable style="width: 160px" @change="currentPage = 1; fetchFiles()">
            <el-option v-for="c in fileCategories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
          <el-select v-if="canAudit" v-model="filterStatus" placeholder="全部状态" clearable style="width: 140px" @change="currentPage = 1; fetchFiles()">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
          <el-input v-model="searchKeyword" placeholder="搜索文件名..." clearable style="width: 220px" @keyup.enter="currentPage = 1; fetchFiles()">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button @click="currentPage = 1; fetchFiles()">
            <el-icon class="mr-1"><Filter /></el-icon> 筛选
          </el-button>
          <el-button plain @click="searchKeyword = ''; filterProduct = ''; filterCategory = ''; filterStatus = ''; currentPage = 1; fetchFiles()">
            <el-icon class="mr-1"><RefreshRight /></el-icon> 重置
          </el-button>
          <el-button type="primary" @click="isUploadDialogVisible = true">
            <el-icon class="mr-1"><Upload /></el-icon> 上传
          </el-button>
          <el-button type="primary" @click="$router.push('/knowledge/manual-entry?mode=product')">
            <el-icon class="mr-1"><Document /></el-icon> 手动编写
          </el-button>
        </div>
      </div>

      <!-- Table -->
      <el-table :data="tableData" v-loading="loading" style="width: 100%"
        row-class-name="hover:bg-surface-container-high transition-colors group"
        :header-cell-style="{ background: '#f5f5f5', color: '#52525b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }"
        empty-text="暂无文件，请先上传">
        <el-table-column label="文件信息" min-width="260">
          <template #default="scope">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-surface-container-high border border-outline flex items-center justify-center text-primary">
                <el-icon><component :is="getFileIcon(scope.row.file_type)" /></el-icon>
              </div>
              <div>
                <div class="font-bold text-on-surface text-sm">{{ scope.row.title }}</div>
                <div class="text-xs text-on-surface-variant font-mono">{{ scope.row.file_name }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="产品分类" width="140">
          <template #default="scope">
            <span class="geek-tag geek-tag-ghost">{{ scope.row.product_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="文件分类" width="120">
          <template #default="scope">
            <span class="geek-tag">{{ scope.row.category_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="file_size_human" label="文件大小" width="100">
          <template #default="scope">
            <span class="text-secondary font-mono text-xs">{{ scope.row.file_size_human }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="scope">
            <el-tag size="small" :type="statusTagType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="上传时间" width="150">
          <template #default="scope">
            <span class="text-secondary font-mono text-xs">{{ scope.row.created_at }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" width="180" fixed="right">
          <template #default="scope">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
              <el-button link type="primary" @click="handlePreview(scope.row)">
                <el-icon><View /></el-icon> 查看
              </el-button>
              <template v-if="canAudit && scope.row.status === 'pending'">
                <el-button link type="primary" @click="handleAudit(scope.row, 'approved')">
                  <el-icon><Check /></el-icon> 通过
                </el-button>
                <el-button link type="danger" @click="handleAudit(scope.row, 'rejected')">
                  <el-icon><Close /></el-icon> 拒绝
                </el-button>
              </template>
              <el-button v-if="auth.hasPermission('product.delete')" link type="danger" @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="mt-4 flex justify-between items-center">
        <span class="geek-label">当前显示 {{ tableData.length }} 条，共 {{ totalCount }} 条记录</span>
        <el-pagination background layout="prev, pager, next" :total="totalCount" :page-size="pageSize"
          v-model:current-page="currentPage" @current-change="fetchFiles" />
      </div>
    </section>

    <!-- Upload Dialog -->
    <el-dialog v-model="isUploadDialogVisible" title="上传新产品资料" width="560px" destroy-on-close>
      <el-form label-position="top" class="space-y-3">
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="产品分类">
            <el-select v-model="uploadProduct" placeholder="请选择产品" class="w-full">
              <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="文件分类">
            <el-select v-model="uploadCategory" placeholder="请选择分类" class="w-full">
              <el-option v-for="c in fileCategories" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="文件标题">
          <el-input v-model="uploadTitle" placeholder="请输入文件标题" />
        </el-form-item>
        <el-form-item label="文件描述">
          <el-input v-model="uploadDesc" type="textarea" :rows="2" placeholder="可选：填写文件描述信息" />
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload v-model:file-list="uploadFileList" drag action="#" :auto-upload="false" :limit="1">
            <el-icon class="el-icon--upload" :size="40"><Upload /></el-icon>
            <div class="el-upload__text">将文件拖拽至此 或 <em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip text-secondary font-medium">支持 PDF、PPT、Word、图片等格式，单文件最大 50MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="isUploadDialogVisible = false; resetUploadForm()">取消</el-button>
          <el-button type="primary" @click="handleUpload">
            <el-icon class="mr-1"><Upload /></el-icon> 确认上传
          </el-button>
        </div>
      </template>
    </el-dialog>
  </main>
</template>
