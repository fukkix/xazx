<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  uploadType: { type: String, default: 'Document' } // Document, Image, PPT
})

const fileList = ref([])
</script>

<template>
  <div class="unified-upload-container">
    <el-upload
      class="upload-demo"
      drag
      action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
      multiple
      :file-list="fileList"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖拽至此 或 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip text-secondary font-medium">
          支持格式：根据资源类型而定 (PPT, 图片, PDF / Doc)。单文件体积上限：50MB
        </div>
      </template>
    </el-upload>
  </div>
</template>
