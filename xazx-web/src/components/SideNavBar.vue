<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const uploadDialogVisible = ref(false)
const uploadCategory = ref('document')
const uploadFileList = ref<any[]>([])

const categoryOptions = [
  { label: '文档 (PDF / Word)', value: 'document' },
  { label: '图片素材 (PNG / JPG)', value: 'image' },
  { label: '演示文稿 (PPT)', value: 'ppt' }
]

const handleUploadClick = () => {
  uploadFileList.value = []
  uploadDialogVisible.value = true
}

const handleUploadSubmit = () => {
  console.log('Upload:', uploadCategory.value, uploadFileList.value)
  uploadDialogVisible.value = false
}
</script>

<template>
  <aside class="h-screen w-60 flex-shrink-0 bg-surface border-r border-outline hidden md:flex flex-col z-40">
    <div class="h-14 flex items-center px-4 border-b border-outline">
      <div>
        <h2 class="text-on-surface font-bold text-sm tracking-tight">资料库</h2>
        <p class="text-on-surface-variant text-[10px] font-mono uppercase tracking-widest">ENTERPRISE_ASSETS</p>
      </div>
    </div>

    <nav class="flex-1 py-2">
      <div class="px-3 py-2">
        <span class="geek-label px-1">核心资源</span>
      </div>
      <router-link to="/materials/document" active-class="!text-on-surface border-l-2 border-primary bg-primary/5" class="mx-2 px-3 py-2 flex items-center gap-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all border-l-2 border-transparent">
        <el-icon :size="16"><Document /></el-icon>
        文档 (Documents)
      </router-link>
      <router-link to="/materials/image" active-class="!text-on-surface border-l-2 border-primary bg-primary/5" class="mx-2 px-3 py-2 flex items-center gap-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all border-l-2 border-transparent">
        <el-icon :size="16"><Picture /></el-icon>
        图片素材 (Images)
      </router-link>
      <router-link to="/materials/ppt" active-class="!text-on-surface border-l-2 border-primary bg-primary/5" class="mx-2 px-3 py-2 flex items-center gap-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all border-l-2 border-transparent">
        <el-icon :size="16"><DataBoard /></el-icon>
        演示文稿 (PPTs)
      </router-link>

      <div class="px-3 py-2 mt-2">
        <span class="geek-label px-1">系统模块</span>
      </div>
      <router-link to="/knowledge" active-class="!text-on-surface border-l-2 border-primary bg-primary/5" class="mx-2 px-3 py-2 flex items-center gap-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all border-l-2 border-transparent">
        <el-icon :size="16"><Opportunity /></el-icon>
        知识库 (Wiki)
      </router-link>
      <router-link v-if="auth.user?.role === 'super_admin' || auth.user?.role === 'admin'" to="/accounts" active-class="!text-on-surface border-l-2 border-primary bg-primary/5" class="mx-2 px-3 py-2 flex items-center gap-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all border-l-2 border-transparent">
        <el-icon :size="16"><User /></el-icon>
        账号及权限管理
      </router-link>
    </nav>

    <div class="p-3 space-y-2 border-t border-outline">
      <button
        v-if="auth.user?.role === 'super_admin' || auth.user?.role === 'admin'"
        class="w-full py-2 bg-on-surface text-on-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-on-surface-variant active:opacity-90 transition-all"
        @click="handleUploadClick"
      >
        <el-icon :size="16"><Plus /></el-icon>
        上传新资源
      </button>

      <div class="pt-2 space-y-0">
        <router-link to="/portal" target="_blank" class="text-on-surface-variant hover:text-on-surface px-2 py-1.5 flex items-center gap-2 text-xs font-medium transition-colors">
          <el-icon :size="14"><Monitor /></el-icon> 前台门户
          <el-icon :size="10" class="ml-auto opacity-40"><TopRight /></el-icon>
        </router-link>
        <a href="#" class="text-on-surface-variant hover:text-on-surface px-2 py-1.5 flex items-center gap-2 text-xs font-medium transition-colors">
          <el-icon :size="14"><Help /></el-icon> 使用帮助
        </a>
        <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" class="text-on-surface-variant hover:text-on-surface px-2 py-1.5 flex items-center gap-2 text-xs font-medium transition-colors">
          <el-icon :size="14"><DataLine /></el-icon> 甘特图工具
          <el-icon :size="10" class="ml-auto opacity-40"><TopRight /></el-icon>
        </a>
      </div>
    </div>

    <!-- Upload Dialog -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传新资源"
      width="560px"
      :append-to-body="true"
    >
      <el-form label-position="top" class="space-y-2">
        <el-form-item label="资源分类">
          <el-select v-model="uploadCategory" placeholder="选择上传品类" class="w-full">
            <el-option
              v-for="opt in categoryOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload
            v-model:file-list="uploadFileList"
            drag
            action="#"
            :auto-upload="false"
            multiple
          >
            <el-icon class="el-icon--upload" :size="40"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖拽至此 或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip text-secondary font-medium">
                单文件体积上限：50MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="uploadFileList.length === 0" @click="handleUploadSubmit">
          <el-icon class="mr-1"><UploadFilled /></el-icon>
          确认上传
        </el-button>
      </template>
    </el-dialog>
  </aside>
</template>
