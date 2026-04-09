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
  // Mock data fetching based on currentCategory.value
  const commonData = [
    { id: 1, name: 'Q1财务报告.pdf', size: '2.5MB', uploadTime: '2026-04-01', uploader: 'Admin', type: 'document' },
    { id: 2, name: '企业文化介绍.docx', size: '150KB', uploadTime: '2026-04-02', uploader: 'User B', type: 'document' },
    { id: 3, name: '产品宣传图.png', size: '1.2MB', uploadTime: '2026-04-02', uploader: 'User A', type: 'image' },
    { id: 4, name: '年会集锦.jpg', size: '5.2MB', uploadTime: '2026-04-03', uploader: 'User A', type: 'image' },
    { id: 5, name: '2026战略规划.pptx', size: '15MB', uploadTime: '2026-04-05', uploader: 'Super Admin', type: 'ppt' },
    { id: 6, name: '新人培训大纲.ppt', size: '8MB', uploadTime: '2026-04-06', uploader: 'Admin', type: 'ppt' }
  ]
  tableData.value = commonData.filter(item => item.type === currentCategory.value)
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
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-slate-800 dark:text-white capitalize">
          {{ categoryLabels[currentCategory] || '资料库' }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2">
          管理和查看所有涉及 {{ categoryLabels[currentCategory] || '此分类' }} 的企业资源。
        </p>
      </div>
      <div>
        <el-button type="primary" size="large" @click="isUploadDialogVisible = true" class="!rounded-xl !text-base" color="#2563eb">
          <el-icon class="mr-2"><Upload /></el-icon> 上传新资源
        </el-button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div class="flex justify-between mb-6">
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
        class="rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800"
        header-cell-class-name="!bg-slate-50 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-300"
      >
        <el-table-column prop="name" label="资源名称" min-width="250">
          <template #default="scope">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center">
                <el-icon v-if="currentCategory === 'document'" class="text-blue-500 text-xl"><Document /></el-icon>
                <el-icon v-else-if="currentCategory === 'image'" class="text-green-500 text-xl"><Picture /></el-icon>
                <el-icon v-else class="text-orange-500 text-xl"><DataBoard /></el-icon>
              </div>
              <span class="font-medium text-slate-700 dark:text-slate-200">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小" width="120">
           <template #default="scope">
             <span class="text-slate-500 font-mono text-sm">{{ scope.row.size }}</span>
           </template>
        </el-table-column>
        <el-table-column prop="uploader" label="上传者" width="150" />
        <el-table-column prop="uploadTime" label="上传时间" width="180">
          <template #default="scope">
             <span class="text-slate-500">{{ scope.row.uploadTime }}</span>
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

      <div class="flex justify-between items-center mt-6">
        <div class="text-sm text-slate-500">共 {{ tableData.length }} 条资源记录</div>
        <el-pagination
          background
          layout="prev, pager, next"
          :total="tableData.length"
        />
      </div>
    </div>

    <!-- 上传资源弹窗 -->
    <el-dialog v-model="isUploadDialogVisible" title="新增资料" width="550px" destroy-on-close class="!rounded-2xl">
      <div class="mb-5">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">资料所属类型</label>
        <el-select v-model="currentCategory" class="w-full" disabled size="large">
          <el-option label="文档资料 (Document, PDF)" value="document" />
          <el-option label="图片素材 (PNG, JPG)" value="image" />
          <el-option label="演示文稿 (PPT, PPTX)" value="ppt" />
        </el-select>
        <p class="text-xs text-slate-400 mt-2">当前处于 {{ categoryLabels[currentCategory] }} 管理页面，默认上传至此分类。</p>
      </div>
      
      <div class="mb-5">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">可用标签</label>
        <el-select class="w-full" placeholder="请选择资源关联标签（可选）" multiple size="large">
          <el-option label="产品介绍" value="product" />
          <el-option label="内部培训" value="training" />
          <el-option label="公开资料" value="public" />
        </el-select>
      </div>

      <div class="border-t border-slate-100 dark:border-slate-800 pt-5">
        <UnifiedUpload :uploadType="currentCategory" />
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-3 mt-4">
          <el-button @click="isUploadDialogVisible = false" size="large" class="!rounded-lg">查阅与返回</el-button>
          <el-button type="primary" @click="handleUploadSuccess" size="large" color="#2563eb" class="!rounded-lg">
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
