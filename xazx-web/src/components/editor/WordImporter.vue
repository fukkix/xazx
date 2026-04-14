<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as mammoth from 'mammoth'
import { createNode } from '@/stores/docEditor'
import type { DocNode, TableCell } from '@/types/editor'

const emit = defineEmits<{
  (e: 'imported', nodes: DocNode[], images: File[]): void
  (e: 'close'): void
}>()

const loading = ref(false)
const images = ref<File[]>([])

async function onFileChange(file: File) {
  if (!file || !file.name.endsWith('.docx')) {
    ElMessage.warning('请选择 .docx 文件')
    return
  }
  loading.value = true
  images.value = []

  try {
    // Extract images from docx (zip)
    const zipData = await file.arrayBuffer()
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(zipData)
    const imageFiles: File[] = []
    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (path.startsWith('word/media/')) {
        const blob = await zipEntry.async('blob')
        const ext = path.split('.').pop() || 'png'
        imageFiles.push(new File([blob], `docx_${Date.now()}_${imageFiles.length}.${ext}`, { type: blob.type }))
      }
    }
    images.value = imageFiles

    // Convert to HTML
    const result = await mammoth.convertToHtml({ arrayBuffer: zipData })
    const nodes = htmlToNodes(result.value)
    emit('imported', nodes, imageFiles)
    emit('close')
    ElMessage.success(`导入成功，解析 ${nodes.length} 个块，${imageFiles.length} 张图片`)
  } catch (e: any) {
    ElMessage.error(`导入失败: ${e.message}`)
  } finally {
    loading.value = false
  }
}

function htmlToNodes(html: string): DocNode[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const nodes: DocNode[] = []

  function parseElement(el: Element, parentNodes: DocNode[]) {
    const tag = el.tagName.toLowerCase()
    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag[1]!)
      const heading = createNode('heading', {
        level,
        content: cleanText(el.textContent || ''),
      })
      parentNodes.push(heading)
    } else if (tag === 'p') {
      const text = cleanText(el.textContent || '')
      if (text) {
        parentNodes.push(createNode('paragraph', { content: text }))
      }
    } else if (tag === 'table') {
      const cells: TableCell[][] = []
      const rows = el.querySelectorAll('tr')
      rows.forEach((row) => {
        const cellRow: TableCell[] = []
        row.querySelectorAll('td, th').forEach((cell) => {
          cellRow.push({ content: cleanText(cell.textContent || '') })
        })
        if (cellRow.length) cells.push(cellRow)
      })
      if (cells.length) {
        parentNodes.push(createNode('table', { cells }))
      }
    } else if (tag === 'img') {
      const src = el.getAttribute('src') || ''
      const imgFile = images.value.find((f) => src.includes(f.name)) || images.value.shift()
      parentNodes.push(
        createNode('image', {
          content: imgFile?.name || src,
          url: imgFile ? URL.createObjectURL(imgFile) : src,
          file: imgFile,
        }),
      )
    } else if (tag === 'ol' || tag === 'ul') {
      const steps = createNode('steps')
      el.querySelectorAll('li').forEach((li) => {
        steps.children!.push(createNode('step-item', { content: cleanText(li.textContent || '') }))
      })
      if (steps.children!.length) parentNodes.push(steps)
    } else if (tag === 'div') {
      for (const child of Array.from(el.children)) {
        parseElement(child, parentNodes)
      }
    }
  }

  for (const child of Array.from(doc.body.children)) {
    parseElement(child, nodes)
  }

  return nodes.length ? nodes : [createNode('paragraph', { content: '导入内容为空' })]
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/width="[\d.]+in"/g, '')
    .replace(/height="[\d.]+in"/g, '')
    .trim()
}
</script>

<template>
  <el-dialog title="导入 Word 文档" width="560px" :model-value="true" @close="emit('close')">
    <el-upload
      drag
      action="#"
      :auto-upload="false"
      accept=".docx"
      :limit="1"
      @change="(file: any) => onFileChange(file.raw)"
    >
      <el-icon class="el-icon--upload" :size="40"><UploadFilled /></el-icon>
      <div class="el-upload__text">将 .docx 文件拖拽至此 或 <em>点击上传</em></div>
    </el-upload>

    <div class="mt-4 text-xs text-secondary">
      <p>• 自动识别标题层级生成大纲</p>
      <p>• 自动提取文档内嵌图片</p>
      <p>• 自动将表格转为编辑器表格</p>
      <p>• 自动过滤冗余样式属性</p>
    </div>

    <template #footer>
      <el-button @click="emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>
