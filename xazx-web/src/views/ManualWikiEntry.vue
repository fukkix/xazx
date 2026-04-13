<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const sourceFile = ref(String(route.query.file ?? ''))
const domain = ref(String(route.query.domain ?? '产品知识'))
const productLine = ref(String(route.query.productLine ?? ''))
const title = ref('')
const summary = ref('')
const content = ref('')
const keywords = ref('')
const audience = ref('')
const relatedTopics = ref('')
const uploadedImages = ref<File[]>([])

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  uploadedImages.value = input.files ? Array.from(input.files) : []
}

const imageMarkdown = computed(() => {
  if (uploadedImages.value.length === 0) {
    return ''
  }
  return uploadedImages.value
    .map((f) => `![${f.name}](./images/${f.name})`)
    .join('\n\n')
})

const markdownDraft = computed(() => {
  const fm = [
    '---',
    `title: \"${title.value || '待填写标题'}\"`,
    `domain: \"${domain.value}\"`,
    `product_line: \"${productLine.value}\"`,
    `source_file: \"${sourceFile.value}\"`,
    `last_updated: \"${new Date().toISOString().slice(0, 10)}\"`,
    `keywords: [${keywords.value.split(',').map((x) => x.trim()).filter(Boolean).map((x) => `\"${x}\"`).join(', ')}]`,
    `audience: [${audience.value.split(',').map((x) => x.trim()).filter(Boolean).map((x) => `\"${x}\"`).join(', ')}]`,
    `related_topics: [${relatedTopics.value.split(',').map((x) => x.trim()).filter(Boolean).map((x) => `\"${x}\"`).join(', ')}]`,
    '---',
    ''
  ].join('\n')

  const sections = [
    '# 摘要',
    summary.value || '请填写摘要',
    '',
    '# 正文',
    content.value || '请填写正文内容',
    ''
  ]

  if (imageMarkdown.value) {
    sections.push('# 图片引用', imageMarkdown.value, '')
  }

  return fm + sections.join('\n')
})

const copyDraft = async () => {
  try {
    await navigator.clipboard.writeText(markdownDraft.value)
    ElMessage.success('Markdown 草稿已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制下方草稿')
  }
}

const goBack = () => {
  router.push('/knowledge')
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-on-surface">手动填写 Wiki 页面</h1>
        <p class="text-sm text-secondary mt-1">文档包含复杂图片引用，切换为手动录入模式</p>
      </div>
      <el-button @click="goBack">返回知识库管理</el-button>
    </div>

    <el-card shadow="hover">
      <template #header>
        <span class="font-semibold">来源信息</span>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <el-input v-model="sourceFile" placeholder="来源文件名" />
        <el-input v-model="domain" placeholder="知识域" />
        <el-input v-model="productLine" placeholder="产品线（可选）" />
      </div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <span class="font-semibold">页面内容填写</span>
      </template>
      <div class="space-y-4">
        <el-input v-model="title" placeholder="页面标题" />
        <el-input v-model="summary" type="textarea" :rows="3" placeholder="摘要（200 字以内）" />
        <el-input v-model="content" type="textarea" :rows="10" placeholder="正文内容（支持 Markdown）" />
        <el-input v-model="keywords" placeholder="关键词，逗号分隔，例如：WAF, 售后, 常见问题" />
        <el-input v-model="audience" placeholder="受众，逗号分隔，例如：售后, 售前" />
        <el-input v-model="relatedTopics" placeholder="相关主题，逗号分隔" />
      </div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <span class="font-semibold">图片上传（手动引用）</span>
      </template>
      <div class="space-y-3">
        <input type="file" accept=".png,.jpg,.jpeg,.webp" multiple @change="handleImageChange">
        <p class="text-xs text-secondary">当前为手动模式：图片会生成 Markdown 引用路径，建议你将图片放到页面同级 images 目录。</p>
        <ul v-if="uploadedImages.length" class="text-sm text-on-surface space-y-1">
          <li v-for="img in uploadedImages" :key="img.name">{{ img.name }}</li>
        </ul>
      </div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">Markdown 草稿</span>
          <el-button type="primary" @click="copyDraft">复制草稿</el-button>
        </div>
      </template>
      <el-input :model-value="markdownDraft" type="textarea" :rows="16" readonly />
    </el-card>
  </div>
</template>
