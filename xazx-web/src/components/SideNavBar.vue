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
  // TODO: 对接后端上传 API
  console.log('Upload:', uploadCategory.value, uploadFileList.value)
  uploadDialogVisible.value = false
}
</script>

<template>
  <aside class="h-screen w-64 fixed left-0 top-0 bg-blue-900 dark:bg-slate-950 shadow-2xl hidden md:flex flex-col pt-20 pb-8 px-4 z-40">
    <div class="mb-8 px-4">
      <h2 class="text-white font-bold text-xl">资料库</h2>
      <p class="text-blue-200/70 text-xs font-medium font-manrope uppercase tracking-widest">企业级核心资产</p>
    </div>
    
    <nav class="flex-1 space-y-1">
      <router-link to="/materials/document" active-class="bg-blue-800 dark:bg-blue-900 !text-white translate-x-1" class="text-blue-200/70 hover:text-white rounded-lg px-4 py-3 flex items-center gap-3 font-manrope text-sm font-medium hover:bg-blue-800/50 transition-all">
        <el-icon :size="18"><Document /></el-icon>
        文档 (Documents)
      </router-link>
      <router-link to="/materials/image" active-class="bg-blue-800 dark:bg-blue-900 !text-white translate-x-1" class="text-blue-200/70 hover:text-white rounded-lg px-4 py-3 flex items-center gap-3 font-manrope text-sm font-medium hover:bg-blue-800/50 transition-all">
        <el-icon :size="18"><Picture /></el-icon>
        图片素材 (Images)
      </router-link>
      <router-link to="/materials/ppt" active-class="bg-blue-800 dark:bg-blue-900 !text-white translate-x-1" class="text-blue-200/70 hover:text-white rounded-lg px-4 py-3 flex items-center gap-3 font-manrope text-sm font-medium hover:bg-blue-800/50 transition-all">
        <el-icon :size="18"><DataBoard /></el-icon>
        演示文稿 (PPTs)
      </router-link>
      <router-link to="/knowledge" active-class="bg-blue-800 dark:bg-blue-900 !text-white translate-x-1" class="text-blue-200/70 hover:text-white rounded-lg px-4 py-3 flex items-center gap-3 font-manrope text-sm font-medium hover:bg-blue-800/50 transition-all border-t border-blue-800 mt-4 pt-4">
        <el-icon :size="18"><Opportunity /></el-icon>
        知识库 (Wiki)
      </router-link>
      <router-link v-if="auth.user?.role === 'super_admin' || auth.user?.role === 'admin'" to="/accounts" active-class="bg-blue-800 dark:bg-blue-900 !text-white translate-x-1" class="text-blue-200/70 hover:text-white rounded-lg px-4 py-3 flex items-center gap-3 font-manrope text-sm font-medium hover:bg-blue-800/50 transition-all">
        <el-icon :size="18"><User /></el-icon>
        账号及权限管理
      </router-link>
    </nav>
    
    <div class="mt-auto space-y-4">
      <button
        v-if="auth.user?.role === 'super_admin' || auth.user?.role === 'admin'"
        class="w-full py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-primary-dim active:scale-[0.97] transition-all"
        @click="handleUploadClick"
      >
        <el-icon :size="20"><Plus /></el-icon>
        上传新资源
      </button>
      
      <div class="pt-6 border-t border-blue-800/50">
        <router-link to="/portal" target="_blank" class="text-blue-200/70 hover:text-white px-4 py-2 flex items-center gap-3 font-manrope text-sm font-medium">
          <el-icon :size="18"><Monitor /></el-icon> 前台门户
          <el-icon :size="10" class="ml-auto opacity-40"><TopRight /></el-icon>
        </router-link>
        <a href="#" class="text-blue-200/70 hover:text-white px-4 py-2 flex items-center gap-3 font-manrope text-sm font-medium">
          <el-icon :size="18"><Help /></el-icon> 使用帮助
        </a>
        <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" class="text-blue-200/70 hover:text-white px-4 py-2 flex items-center gap-3 font-manrope text-sm font-medium">
          <el-icon :size="18"><DataLine /></el-icon> 甘特图工具
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
