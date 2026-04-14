<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import { createNode } from '@/stores/docEditor'
import type { DocNode, TableCell } from '@/types/editor'

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
    if (file.name.endsWith('.docx')) {
      nodes = await importDocx(file)
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      nodes = await importExcel(file)
    } else {
      ElMessage.warning('仅支持 .docx / .xlsx / .xls 文件')
      loading.value = false
      return
    }
    emit('imported', nodes, images.value)
    emit('close')
    ElMessage.success(`导入成功，解析 ${nodes.length} 个块`)
  } catch (e: any) {
    ElMessage.error(`导入失败: ${e.message}`)
  } finally {
    loading.value = false
  }
}

async function importDocx(file: File): Promise<DocNode[]> {
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

  const result = await mammoth.convertToHtml({ arrayBuffer: zipData })
  return htmlToNodes(result.value)
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
      const cells = parseHtmlTable(el as HTMLTableElement)
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

function parseHtmlTable(tableEl: HTMLTableElement): TableCell[][] {
  const rows = Array.from(tableEl.querySelectorAll('tr'))
  if (!rows.length) return []
  const colCount = Math.max(...rows.map((r) => r.querySelectorAll('td, th').length))
  if (!colCount) return []

  // Initialize grid
  const grid: (TableCell | null)[][] = Array.from({ length: rows.length }, () =>
    Array.from({ length: colCount }, () => null),
  )

  rows.forEach((tr, r) => {
    const cells = Array.from(tr.querySelectorAll('td, th'))
    let c = 0
    cells.forEach((cellEl) => {
      while (c < colCount && grid[r]![c]) c++
      if (c >= colCount) return
      const rowspan = parseInt(cellEl.getAttribute('rowspan') || '1')
      const colspan = parseInt(cellEl.getAttribute('colspan') || '1')
      const cell: TableCell = {
        content: cleanText(cellEl.textContent || ''),
        rowspan,
        colspan,
        isMerged: false,
      }
      grid[r]![c] = cell
      for (let i = 0; i < rowspan; i++) {
        for (let j = 0; j < colspan; j++) {
          if (i === 0 && j === 0) continue
          if (grid[r + i]) {
            grid[r + i]![c + j] = { content: '', isMerged: true }
          }
        }
      }
      c++
    })
  })

  return grid.map((row) => row.map((cell) => cell || { content: '', isMerged: false }))
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

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/width="[\d.]+in"/g, '')
    .replace(/height="[\d.]+in"/g, '')
    .trim()
}
</script>

<template>
  <el-dialog title="导入文档" width="560px" :model-value="true" @close="emit('close')">
    <el-upload
      drag
      action="#"
      :auto-upload="false"
      accept=".docx,.xlsx,.xls"
      :limit="1"
      @change="(file: any) => onFileChange(file.raw)"
    >
      <el-icon class="el-icon--upload" :size="40"><UploadFilled /></el-icon>
      <div class="el-upload__text">将文件拖拽至此 或 <em>点击上传</em></div>
    </el-upload>

    <div class="mt-4 text-xs text-secondary space-y-1">
      <p>• 支持 Word (.docx) 和 Excel (.xlsx / .xls)</p>
      <p>• 自动识别标题层级生成大纲</p>
      <p>• 自动提取文档内嵌图片（Word）</p>
      <p>• 自动识别表格合并单元格</p>
      <p>• Excel 多 Sheet 会按 Sheet 名拆分为多个表格块</p>
    </div>

    <template #footer>
      <el-button @click="emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>
