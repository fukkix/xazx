<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Document, Picture, DataBoard, Search, Filter, RefreshRight, Upload } from '@element-plus/icons-vue'
import UnifiedUpload from '../components/UnifiedUpload.vue'

const route = useRoute()
const currentCategory = ref(route.params.category as string)

const categoryLabels: Record<string, string> = {
  document: '文档 (Documents)',
  image: '图片素材 (Images)',
  ppt: '演示文稿 (PPTs)'
}

const tableData = ref<any[]>([])
const searchKeyword = ref('')
const isUploadDialogVisible = ref(false)

const fetchMaterials = () => {
  tableData.value = []
}

watch(
  () => route.params.category,
  (newCategory) => {
    if (newCategory) {
      currentCategory.value = newCategory as string
      fetchMaterials()
    }
  }
)

onMounted(() => {
  fetchMaterials()
})

const handleUploadSuccess = () => {
  isUploadDialogVisible.value = false
  fetchMaterials()
}

const handlePreview = (row: any) => {
  console.log('Preview:', row.name)
}

const handleDownload = (row: any) => {
  console.log('Download:', row.name)
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <div class="flex items-baseline gap-3 mb-1">
          <h1 class="text-2xl font-bold text-on-surface capitalize">
            {{ categoryLabels[currentCategory] || '资料库' }}
          </h1>
          <span class="geek-label">ASSET_CATEGORY_{{ (currentCategory || 'ALL').toUpperCase() }}</span>
        </div>
        <p class="text-sm text-secondary mt-1">
          管理和查看所有涉及 {{ categoryLabels[currentCategory] || '此分类' }} 的企业资源。
        </p>
      </div>
      <div>
        <el-button type="primary" @click="isUploadDialogVisible = true">
          <el-icon class="mr-1"><Upload /></el-icon> 上传新资源
        </el-button>
      </div>
    </div>

    <div class="geek-panel p-5">
      <div class="flex justify-between mb-4">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文件名称..."
          class="!w-80"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="flex gap-2">
          <el-button><el-icon class="mr-1"><Filter /></el-icon> 分类筛选</el-button>
          <el-button plain><el-icon class="mr-1"><RefreshRight /></el-icon> 刷新视图</el-button>
        </div>
      </div>

      <el-table
        :data="tableData"
        style="width: 100%"
        class="border border-outline"
        :header-cell-style="{background:'#f5f5f5',color:'#52525b',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.05em'}"
      >
        <el-table-column prop="name" label="资源名称" min-width="250">
          <template #default="scope">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-surface-container-high border border-outline flex items-center justify-center">
                <el-icon v-if="currentCategory === 'document'" class="text-primary text-lg"><Document /></el-icon>
                <el-icon v-else-if="currentCategory === 'image'" class="text-primary text-lg"><Picture /></el-icon>
                <el-icon v-else class="text-primary text-lg"><DataBoard /></el-icon>
              </div>
              <span class="font-medium text-on-surface text-sm">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小" width="120">
           <template #default="scope">
             <span class="text-secondary font-mono text-xs">{{ scope.row.size }}</span>
           </template>
        </el-table-column>
        <el-table-column prop="uploader" label="上传者" />
        <el-table-column prop="uploadTime" label="上传时间" width="180">
          <template #default="scope">
             <span class="text-secondary font-mono text-xs">{{ scope.row.uploadTime }}</span>
           </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handlePreview(scope.row)">
              预览
            </el-button>
            <el-button size="small" type="success" link @click="handleDownload(scope.row)">
              下载
            </el-button>
            <el-button size="small" type="danger" link>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-between items-center mt-4">
        <div class="text-xs text-secondary font-mono">共 {{ tableData.length }} 条资源记录</div>
        <el-pagination
          background
          layout="prev, pager, next"
          :total="tableData.length"
        />
      </div>
    </div>

    <!-- 上传资源弹窗 -->
    <el-dialog v-model="isUploadDialogVisible" title="新增资料" width="550px" destroy-on-close>
      <div class="mb-4">
        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">资料所属类型</label>
        <el-select v-model="currentCategory" class="w-full" disabled size="large">
          <el-option label="文档资料 (Document, PDF)" value="document" />
          <el-option label="图片素材 (PNG, JPG)" value="image" />
          <el-option label="演示文稿 (PPT, PPTX)" value="ppt" />
        </el-select>
        <p class="text-xs text-secondary mt-2">当前处于 {{ categoryLabels[currentCategory] }} 管理页面，默认上传至此分类。</p>
      </div>

      <div class="mb-4">
        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">可用标签</label>
        <el-select class="w-full" placeholder="请选择资源关联标签（可选）" multiple size="large">
          <el-option label="产品介绍" value="product" />
          <el-option label="内部培训" value="training" />
          <el-option label="公开资料" value="public" />
        </el-select>
      </div>

      <div class="border-t border-outline pt-4">
        <UnifiedUpload :uploadType="currentCategory" />
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 mt-4">
          <el-button @click="isUploadDialogVisible = false" size="large">查阅与返回</el-button>
          <el-button type="primary" @click="handleUploadSuccess" size="large">
            保存资料
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
:deep(.el-table__row) {
  cursor: pointer;
  transition: all 0.2s;
}
:deep(.el-table__row:hover) {
  background-color: var(--el-color-primary-light-9) !important;
}
</style>
