<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import { createNode } from '@/stores/docEditor'
import type { DocNode, TableCell } from '@/types/editor'
import { parseHtmlToNodes, parseMarkdownToNodes, cleanText } from '@/utils/importParser'

const emit = defineEmits<{
  (e: 'imported', nodes: DocNode[], images: File[]): void
  (e: 'close'): void
}>()

const loading = ref(false)
const images = ref<File[]>([])

async function onFileChange(file: File) {
  if (!file) return
  loading.value = true
  images.value = []

  try {
    let nodes: DocNode[] = []
    let imgs: File[] = []
    if (file.name.endsWith('.docx')) {
      const result = await importDocx(file)
      nodes = result.nodes
      imgs = result.images
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      nodes = await importExcel(file)
    } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      const html = await file.text()
      const result = parseHtmlToNodes(html)
      nodes = result.nodes
      imgs = result.images
    } else if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
      const md = await file.text()
      nodes = parseMarkdownToNodes(md)
    } else {
      ElMessage.warning('仅支持 .docx / .xlsx / .xls / .html / .md 文件')
      loading.value = false
      return
    }
    emit('imported', nodes, imgs)
    emit('close')
    ElMessage.success(`导入成功，解析 ${nodes.length} 个块`)
  } catch (e: any) {
    ElMessage.error(`导入失败: ${e.message}`)
  } finally {
    loading.value = false
  }
}

async function importDocx(file: File): Promise<{ nodes: DocNode[]; images: File[] }> {
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

  const result = await mammoth.convertToHtml({ arrayBuffer: zipData })
  // map docx images by matching src names
  images.value = imageFiles
  const htmlNodes = parseHtmlToNodes(result.value)
  // re-attach docx images: parseHtmlToNodes already handles external src,
  // but docx internal images need name matching.
  htmlNodes.nodes.forEach((node) => {
    function walk(n: DocNode) {
      if (n.type === 'image' && !n.file && n.content) {
        const imgFile = imageFiles.find((f) => n.content!.includes(f.name)) || imageFiles.shift()
        if (imgFile) {
          n.file = imgFile
          n.url = URL.createObjectURL(imgFile)
          n.content = imgFile.name
        }
      }
      n.children?.forEach(walk)
    }
    walk(node)
  })
  return { nodes: htmlNodes.nodes, images: imageFiles }
}

async function importExcel(file: File): Promise<DocNode[]> {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: 'array' })
  const nodes: DocNode[] = []

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName]!
    if (!worksheet['!ref']) return

    const cells = parseWorksheet(worksheet)
    if (cells.length) {
      nodes.push(createNode('heading', { level: 2, content: sheetName }))
      nodes.push(createNode('table', { cells }))
    }
  })

  return nodes.length ? nodes : [createNode('paragraph', { content: 'Excel 中未解析到表格' })]
}

function parseWorksheet(worksheet: XLSX.WorkSheet): TableCell[][] {
  const range = XLSX.utils.decode_range(worksheet['!ref']!)
  const rowCount = range.e.r - range.s.r + 1
  const colCount = range.e.c - range.s.c + 1

  const grid: (TableCell | null)[][] = Array.from({ length: rowCount }, () =>
    Array.from({ length: colCount }, () => null),
  )

  const merges = worksheet['!merges'] || []

  // Fill raw values
  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: range.s.r + r, c: range.s.c + c })
      const cell = worksheet[cellRef]
      grid[r]![c] = {
        content: cell ? cleanText(String(cell.v)) : '',
        isMerged: false,
      }
    }
  }

  // Apply merges
  merges.forEach((merge) => {
    const startR = merge.s.r - range.s.r
    const startC = merge.s.c - range.s.c
    const endR = merge.e.r - range.s.r
    const endC = merge.e.c - range.s.c
    const master = grid[startR]![startC]
    if (master) {
      master.rowspan = endR - startR + 1
      master.colspan = endC - startC + 1
      master.isMerged = false
    }
    for (let i = startR; i <= endR; i++) {
      for (let j = startC; j <= endC; j++) {
        if (i === startR && j === startC) continue
        grid[i]![j] = { content: '', isMerged: true }
      }
    }
  })

  return grid.map((row) => row.map((cell) => cell || { content: '', isMerged: false }))
}
</script>

<template>
  <el-dialog title="导入文档" width="560px" :model-value="true" @close="emit('close')">
    <el-upload
      drag
      action="#"
      :auto-upload="false"
      accept=".docx,.xlsx,.xls,.html,.htm,.md,.markdown"
      :limit="1"
      @change="(file: any) => onFileChange(file.raw)"
    >
      <el-icon class="el-icon--upload" :size="40"><UploadFilled /></el-icon>
      <div class="el-upload__text">将文件拖拽至此 或 <em>点击上传</em></div>
    </el-upload>

    <div class="mt-4 text-xs text-secondary space-y-1">
      <p>• 支持 Word (.docx)、Excel (.xlsx / .xls)、HTML (.html)、Markdown (.md)</p>
      <p>• 自动识别标题层级生成大纲</p>
      <p>• 自动提取文档内嵌图片</p>
      <p>• 自动识别表格合并单元格</p>
      <p>• 支持将 AI 生成的 HTML / Markdown 直接转为可编辑 Block</p>
    </div>

    <template #footer>
      <el-button @click="emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>
