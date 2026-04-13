<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { knowledgeApi } from '@/services/knowledge'

const route = useRoute()
const router = useRouter()

// 来源信息（从路由参数预填）
const sourceFile = ref(String(route.query.file ?? ''))
const domain = ref(String(route.query.domain ?? '产品知识'))
const productLine = ref(String(route.query.productLine ?? ''))

// 页面内容
const title = ref('')
const summary = ref('')
const content = ref('')
const keywords = ref('')
const audience = ref<string[]>([])
const relatedTopics = ref('')

// 图片管理
interface ImageItem {
  file: File
  url: string        // 本地预览 URL
  name: string       // 显示名
  inserted: boolean   // 是否已插入正文
}
const images = ref<ImageItem[]>([])
const isSubmitting = ref(false)

const domainOptions = ['产品知识', '技术文档', '销售支持', '行业合规', '内部运营']
const audienceOptions = ['研发', '售前', '售后', '销售']

// 选择图片
const onSelectImages = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/png,image/jpeg,image/webp,image/gif'
  input.multiple = true
  input.onchange = () => {
    if (!input.files) return
    for (const f of Array.from(input.files)) {
      // 去重
      if (images.value.some((img) => img.name === f.name && img.file.size === f.size)) continue
      images.value.push({
        file: f,
        url: URL.createObjectURL(f),
        name: f.name,
        inserted: false,
      })
    }
  }
  input.click()
}

// 删除图片
const removeImage = (idx: number) => {
  const img = images.value[idx]
  if (img) URL.revokeObjectURL(img.url)
  images.value.splice(idx, 1)
}

// 插入图片引用到正文光标位置
const contentRef = ref<InstanceType<typeof import('element-plus')['ElInput']> | null>(null)

const insertImageRef = (img: ImageItem) => {
  const ref = `![${img.name}](images/${img.name})`
  // 尝试在光标位置插入，否则追加到末尾
  const textarea = contentRef.value?.$el?.querySelector('textarea') as HTMLTextAreaElement | null
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = content.value.slice(0, start)
    const after = content.value.slice(end)
    content.value = before + ref + '\n' + after
    // 光标移到插入内容之后
    const newPos = start + ref.length + 1
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(newPos, newPos)
    })
  } else {
    content.value += (content.value.endsWith('\n') ? '' : '\n') + ref + '\n'
  }
  img.inserted = true
  ElMessage.success(`已插入 ${img.name} 的引用`)
}

// 一键插入所有图片
const insertAllImages = () => {
  const uninserted = images.value.filter((img) => !img.inserted)
  if (!uninserted.length) {
    ElMessage.info('所有图片已插入')
    return
  }
  const refs = uninserted.map((img) => `![${img.name}](images/${img.name})`).join('\n\n')
  content.value += (content.value.endsWith('\n') ? '' : '\n\n') + refs + '\n'
  uninserted.forEach((img) => (img.inserted = true))
  ElMessage.success(`已插入 ${uninserted.length} 张图片引用`)
}

// 表单基本校验
const canSubmit = computed(
  () => title.value.trim() && content.value.trim() && domain.value && !isSubmitting.value,
)

// 提交到后端
const submitPage = async () => {
  if (!canSubmit.value) return
  isSubmitting.value = true
  try {
    const result = await knowledgeApi.manualSubmit({
      title: title.value.trim(),
      domain: domain.value,
      summary: summary.value.trim(),
      content: content.value,
      keywords: keywords.value,
      audience: audience.value.join(','),
      relatedTopics: relatedTopics.value,
      productLine: productLine.value || undefined,
      sourceFile: sourceFile.value || undefined,
      images: images.value.map((img) => img.file),
    })
    ElMessage.success(`Wiki 页面已保存: ${result.wiki_page_title}（图片 ${result.images_saved} 张）`)
    router.push('/knowledge')
  } catch (e: unknown) {
    ElMessage.error(`提交失败: ${e instanceof Error ? e.message : e}`)
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => router.push('/knowledge')
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <!-- 头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-on-surface">手动编辑 Wiki 页面</h1>
        <p class="text-sm text-secondary mt-1">填写内容、上传图片，一键提交到知识库</p>
      </div>
      <el-button @click="goBack">返回知识库管理</el-button>
    </div>

    <!-- 来源信息 -->
    <el-card shadow="hover">
      <template #header><span class="font-semibold">来源信息</span></template>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs text-secondary mb-1">来源文件</label>
          <el-input v-model="sourceFile" placeholder="可选，来源文件名" />
        </div>
        <div>
          <label class="block text-xs text-secondary mb-1">知识域 *</label>
          <el-select v-model="domain" class="w-full">
            <el-option v-for="d in domainOptions" :key="d" :label="d" :value="d" />
          </el-select>
        </div>
        <div>
          <label class="block text-xs text-secondary mb-1">产品线</label>
          <el-input v-model="productLine" placeholder="可选，如 WAF、动态防御" />
        </div>
      </div>
    </el-card>

    <!-- 页面内容 -->
    <el-card shadow="hover">
      <template #header><span class="font-semibold">页面内容</span></template>
      <div class="space-y-4">
        <div>
          <label class="block text-xs text-secondary mb-1">标题 *</label>
          <el-input v-model="title" placeholder="输入页面标题" maxlength="100" show-word-limit />
        </div>
        <div>
          <label class="block text-xs text-secondary mb-1">摘要</label>
          <el-input
            v-model="summary"
            type="textarea"
            :rows="2"
            placeholder="200 字以内的摘要"
            maxlength="200"
            show-word-limit
          />
        </div>
        <div>
          <label class="block text-xs text-secondary mb-1">
            正文 *
            <span class="text-gray-400 ml-2">支持 Markdown，可点击下方图片"插入引用"</span>
          </label>
          <el-input
            ref="contentRef"
            v-model="content"
            type="textarea"
            :rows="14"
            placeholder="在此编写 Markdown 正文内容…"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs text-secondary mb-1">关键词</label>
            <el-input v-model="keywords" placeholder="逗号分隔，如 WAF, 防篡改" />
          </div>
          <div>
            <label class="block text-xs text-secondary mb-1">受众</label>
            <el-select v-model="audience" multiple class="w-full" placeholder="选择受众角色">
              <el-option v-for="a in audienceOptions" :key="a" :label="a" :value="a" />
            </el-select>
          </div>
          <div>
            <label class="block text-xs text-secondary mb-1">相关主题</label>
            <el-input v-model="relatedTopics" placeholder="逗号分隔" />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 图片区域 -->
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">图片上传</span>
          <div class="space-x-2">
            <el-button size="small" @click="onSelectImages">选择图片</el-button>
            <el-button v-if="images.length" size="small" type="info" @click="insertAllImages"
              >全部插入正文</el-button
            >
          </div>
        </div>
      </template>

      <div v-if="!images.length" class="text-center text-secondary py-8">
        <p>点击"选择图片"从电脑中选取图片</p>
        <p class="text-xs mt-1">支持 PNG / JPG / WebP / GIF，可多选</p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="(img, idx) in images" :key="img.name + idx" class="relative group">
          <img
            :src="img.url"
            :alt="img.name"
            class="w-full h-32 object-cover rounded border"
          />
          <div class="mt-1 text-xs truncate text-secondary" :title="img.name">{{ img.name }}</div>
          <div
            class="absolute inset-0 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2"
          >
            <el-button
              size="small"
              type="primary"
              :disabled="img.inserted"
              @click="insertImageRef(img)"
            >
              {{ img.inserted ? '已插入' : '插入引用' }}
            </el-button>
            <el-button size="small" type="danger" @click="removeImage(idx)">删除</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 提交栏 -->
    <div class="flex items-center justify-end gap-4 pb-8">
      <el-button @click="goBack">取消</el-button>
      <el-button type="primary" size="large" :disabled="!canSubmit" :loading="isSubmitting" @click="submitPage">
        提交到知识库
      </el-button>
    </div>
  </div>
</template>
