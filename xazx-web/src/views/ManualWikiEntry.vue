<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { knowledgeApi } from '@/services/knowledge'
import { useDocEditorStore, createNode, type DraftData } from '@/stores/docEditor'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_TAGS, type DocNode, type TableCell } from '@/types/editor'
import { parseHtmlToNodes, parseMarkdownToNodes } from '@/utils/importParser'
import DocOutline from '@/components/editor/DocOutline.vue'
import EditorToolbar from '@/components/editor/EditorToolbar.vue'
import BlockRenderer from '@/components/editor/BlockRenderer.vue'
import WordImporter from '@/components/editor/WordImporter.vue'
import LinkPopover from '@/components/editor/LinkPopover.vue'

const route = useRoute()
const router = useRouter()
const store = useDocEditorStore()

// 来源信息
const sourceFile = ref(String(route.query.file ?? ''))
const domain = ref(String(route.query.domain ?? '产品知识'))
const productLine = ref(String(route.query.productLine ?? ''))

// 页面元信息
const title = ref('')
const summary = ref('')
const keywords = ref('')
const audience = ref<string[]>([])
const relatedTopics = ref('')

// UI 状态
const showWordImporter = ref(false)
const showLinkPopover = ref(false)
const linkPopoverPos = ref({ x: 0, y: 0 })
const activeTab = ref('properties')
const isSubmitting = ref(false)
const previewMd = ref('')
const previewHtml = ref('')
const autoSaveEnabled = ref(true)
const lastSavedAt = ref('')
const showDraftDialog = ref(false)
const draftToRestore = ref<DraftData | null>(null)

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
const AUTO_SAVE_DELAY = 3000

function triggerAutoSave() {
  if (!autoSaveEnabled.value) return
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    doSaveDraft(false)
  }, AUTO_SAVE_DELAY)
}

async function doSaveDraft(showMsg = true) {
  const ok = await store.saveDraft({
    title: title.value,
    summary: summary.value,
    keywords: keywords.value,
    audience: audience.value,
    relatedTopics: relatedTopics.value,
    domain: domain.value,
    productLine: productLine.value,
    sourceFile: sourceFile.value,
  })
  if (ok) {
    lastSavedAt.value = new Date().toLocaleTimeString('zh-CN')
    if (showMsg) ElMessage.success('草稿已保存')
  } else {
    if (showMsg) ElMessage.warning('草稿保存失败，文档可能过大')
  }
}

function restoreDraft() {
  if (!draftToRestore.value) return
  const d = draftToRestore.value
  store.initDocument(d.docTree)
  title.value = d.meta.title
  summary.value = d.meta.summary
  keywords.value = d.meta.keywords
  audience.value = d.meta.audience
  relatedTopics.value = d.meta.relatedTopics
  domain.value = d.meta.domain
  productLine.value = d.meta.productLine
  sourceFile.value = d.meta.sourceFile
  showDraftDialog.value = false
  draftToRestore.value = null
  lastSavedAt.value = new Date(d.savedAt).toLocaleTimeString('zh-CN')
  ElMessage.success('草稿已恢复')
}

function discardDraft() {
  store.clearDraft()
  showDraftDialog.value = false
  draftToRestore.value = null
}

const domainOptions = ['产品知识', '技术文档', '销售支持', '行业合规', '内部运营']
const audienceOptions = ['研发', '售前', '售后', '销售']

// 片段库
const fragments = ref<{ id: string; name: string; nodes: DocNode[] }[]>([])

onMounted(() => {
  // 检查是否有草稿
  if (store.hasDraft()) {
    const draft = store.loadDraft()
    if (draft) {
      draftToRestore.value = draft
      showDraftDialog.value = true
    }
  }
  if (!showDraftDialog.value) {
    store.initDocument([
      createNode('heading', { level: 1, content: '新文档' }),
    ])
  }
  // 加载片段库
  const saved = localStorage.getItem('doc_fragments')
  if (saved) {
    try {
      fragments.value = JSON.parse(saved)
    } catch {}
  }
})

// 快捷键
function onKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    if (e.shiftKey) store.redo()
    else store.undo()
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    doSaveDraft(true)
  }
  if (e.key === 'Backspace' || e.key === 'Delete') {
    const active = document.activeElement
    const isEditing =
      active?.tagName === 'INPUT' ||
      active?.tagName === 'TEXTAREA' ||
      (active as HTMLElement)?.isContentEditable
    if (!isEditing && store.selectedNodeId) {
      e.preventDefault()
      store.removeNode(store.selectedNodeId)
    }
  }
}
onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
})

// 选中节点操作
const selectedTags = computed(() => store.selectedNode?.tags || [])
const selectedLinks = computed(() => store.selectedNode?.links || [])
const allHeadingTitles = computed(() => store.allHeadings.map((h) => h.content || '').filter(Boolean))
const brokenLinks = computed(() => {
  return selectedLinks.value.filter((link) => !allHeadingTitles.value.includes(link))
})

function addTag(tag: string) {
  if (!store.selectedNodeId) return
  const current = store.selectedNode?.tags || []
  if (!current.includes(tag)) {
    store.updateNode(store.selectedNodeId, { tags: [...current, tag] })
  }
}

function removeTag(tag: string) {
  if (!store.selectedNodeId) return
  const current = store.selectedNode?.tags || []
  store.updateNode(store.selectedNodeId, { tags: current.filter((t) => t !== tag) })
}

function addLink(title: string) {
  if (!store.selectedNodeId) return
  const current = store.selectedNode?.links || []
  if (!current.includes(title)) {
    store.updateNode(store.selectedNodeId, { links: [...current, title] })
  }
}

function removeLink(title: string) {
  if (!store.selectedNodeId) return
  const current = store.selectedNode?.links || []
  store.updateNode(store.selectedNodeId, { links: current.filter((t) => t !== title) })
}

function saveFragment() {
  if (!store.selectedNode) return
  const name = window.prompt('片段名称', store.selectedNode.content || '未命名片段')
  if (!name) return
  fragments.value.push({
    id: uuidv4(),
    name,
    nodes: [JSON.parse(JSON.stringify(store.selectedNode))],
  })
  localStorage.setItem('doc_fragments', JSON.stringify(fragments.value))
  ElMessage.success('片段已保存')
}

function insertFragment(nodes: DocNode[]) {
  if (!store.selectedNodeId) return
  // Insert after selected node
  const selected = store.selectedNode!
  let parentId: string | null = null
  let index = store.docTree.length

  const findParentId = (arr: DocNode[], id: string): string | null => {
    for (const n of arr) {
      if (n.children) {
        if (n.children.some((c) => c.id === id)) return n.id
        const deep = findParentId(n.children, id)
        if (deep) return deep
      }
    }
    return null
  }
  parentId = findParentId(store.docTree, selected.id)
  if (parentId) {
    const parent = store.allNodes.find((n) => n.id === parentId)
    index = (parent?.children?.findIndex((c) => c.id === selected.id) ?? -1) + 1
  } else {
    index = store.docTree.findIndex((n) => n.id === selected.id) + 1
  }

  const clones = JSON.parse(JSON.stringify(nodes))
  clones.forEach((n: DocNode) => {
    n.id = uuidv4()
    function reassignIds(node: DocNode) {
      node.id = uuidv4()
      node.children?.forEach(reassignIds)
    }
    reassignIds(n)
    store.addNode(parentId, n, index++)
  })
}

async function onWordImported(nodes: DocNode[], images: File[]) {
  store.initDocument(nodes)
  // Attach images to image blocks
  nodes.forEach((node) => {
    function walk(n: DocNode) {
      if (n.type === 'image' && n.file) {
        // already set in importer
      }
      n.children?.forEach(walk)
    }
    walk(node)
  })
  await doSaveDraft(false)
}

function updatePreview() {
  previewMd.value = store.toMarkdown()
  previewHtml.value = store.toHtml()
}

function exportMd() {
  updatePreview()
  const blob = new Blob([previewMd.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.value || 'document'}.md`
  a.click()
  URL.revokeObjectURL(url)
}

function exportHtml() {
  updatePreview()
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title.value}</title></head><body>${previewHtml.value}</body></html>`
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.value || 'document'}.html`
  a.click()
  URL.revokeObjectURL(url)
}

// 收集所有图片 File
const imageFiles = computed(() => {
  const files: File[] = []
  store.allNodes.forEach((n) => {
    if (n.type === 'image' && n.file) {
      files.push(n.file)
    }
  })
  return files
})

const canSubmit = computed(() => title.value.trim() && store.docTree.length > 0 && !isSubmitting.value)

async function submitPage() {
  if (!canSubmit.value) return
  isSubmitting.value = true
  try {
    const content = store.toMarkdown()
    const result = await knowledgeApi.manualSubmit({
      title: title.value.trim(),
      domain: domain.value,
      summary: summary.value.trim(),
      content,
      keywords: keywords.value,
      audience: audience.value.join(','),
      relatedTopics: relatedTopics.value,
      productLine: productLine.value || undefined,
      sourceFile: sourceFile.value || undefined,
      images: imageFiles.value,
    })
    store.clearDraft()
    ElMessage.success(`Wiki 页面已保存: ${result.wiki_page_title}（图片 ${result.images_saved} 张）`)
    router.push('/knowledge')
  } catch (e: unknown) {
    ElMessage.error(`提交失败: ${e instanceof Error ? e.message : e}`)
  } finally {
    isSubmitting.value = false
  }
}

// Watch meta fields for auto-save
watch([title, summary, keywords, audience, relatedTopics, domain, productLine, sourceFile], () => {
  triggerAutoSave()
}, { deep: true })

// Watch docTree for auto-save (use deep watcher on array)
watch(() => store.docTree, () => {
  triggerAutoSave()
}, { deep: true })

function goBack() {
  router.push('/knowledge')
}

function onCanvasClick(e: MouseEvent) {
  // Check for [[ link trigger in contenteditable (simplified)
  const target = e.target as HTMLElement
  if (target.isContentEditable && target.innerText.includes('[[')) {
    const rect = target.getBoundingClientRect()
    linkPopoverPos.value = { x: rect.left, y: rect.bottom + 4 }
    showLinkPopover.value = true
  }
}

function onPaste(e: ClipboardEvent) {
  const html = e.clipboardData?.getData('text/html') || ''
  const text = e.clipboardData?.getData('text/plain') || ''

  // Priority 1: structured HTML (from AI/web pages)
  if (html && html.includes('<')) {
    const result = parseHtmlToNodes(html)
    const isEmpty = result.nodes.length === 1 && result.nodes[0]!.type === 'paragraph' && result.nodes[0]!.content === '导入内容为空'
    if (result.nodes.length > 0 && !isEmpty) {
      e.preventDefault()
      // Attach pasted images to global image list for submit
      result.images.forEach((img) => {
        // images are already File objects with blob urls from parseHtmlToNodes
      })
      insertNodesAfterSelection(result.nodes)
      ElMessage.success(`已粘贴 ${result.nodes.length} 个结构化块`)
      return
    }
  }

  // Priority 2: markdown-like text
  const trimmed = text.trim()
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('|') ||
    trimmed.startsWith('>') ||
    /^步骤\s*\d+\s*[：:]/.test(trimmed) ||
    /【[^】]+】\s*>\s*【[^】]+】/.test(text)
  ) {
    const nodes = parseMarkdownToNodes(text)
    const isEmpty = nodes.length === 1 && nodes[0]!.type === 'paragraph' && nodes[0]!.content === '导入内容为空'
    if (nodes.length > 0 && !isEmpty) {
      e.preventDefault()
      insertNodesAfterSelection(nodes)
      ElMessage.success(`已粘贴 ${nodes.length} 个结构化块`)
      return
    }
  }

  // Priority 3: tab-separated table
  if (text.includes('\t')) {
    const rows = text.split(/\r?\n/).filter((line) => line.trim() !== '')
    const cells = rows.map((row) =>
      row.split('\t').map((cell) => ({ content: cell.trim(), isMerged: false })),
    )
    if (cells.length > 0) {
      e.preventDefault()
      insertNodesAfterSelection([createNode('table', { cells })])
      ElMessage.success('已粘贴为表格')
    }
  }
}

function insertNodesAfterSelection(nodes: DocNode[]) {
  if (!store.selectedNodeId) {
    nodes.forEach((n) => store.addNode(null, n))
    return
  }
  const selected = store.selectedNode!
  let parentId: string | null = null
  let index = store.docTree.length

  const findParentId = (arr: DocNode[], id: string): string | null => {
    for (const n of arr) {
      if (n.children) {
        if (n.children.some((c) => c.id === id)) return n.id
        const deep = findParentId(n.children, id)
        if (deep) return deep
      }
    }
    return null
  }
  parentId = findParentId(store.docTree, selected.id)
  if (parentId) {
    const parent = store.allNodes.find((n) => n.id === parentId)
    index = (parent?.children?.findIndex((c) => c.id === selected.id) ?? -1) + 1
  } else {
    index = store.docTree.findIndex((n) => n.id === selected.id) + 1
  }
  nodes.forEach((n) => {
    store.addNode(parentId, n, index++)
  })
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- 头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-on-surface">手动编辑 Wiki 页面</h1>
        <p class="text-sm text-secondary mt-1">结构化编辑器：支持层级、表格、步骤、截图标注与 Word 导入</p>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="lastSavedAt" class="text-xs text-secondary">草稿保存于 {{ lastSavedAt }}</div>
        <el-switch v-model="autoSaveEnabled" active-text="自动保存" size="small" />
        <el-button @click="goBack">返回知识库管理</el-button>
      </div>
    </div>

    <!-- 来源信息 -->
    <el-card shadow="hover">
      <template #header><span class="font-semibold">来源信息</span></template>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div>
          <label class="block text-xs text-secondary mb-1">页面标题 *</label>
          <el-input v-model="title" placeholder="输入页面标题" maxlength="100" show-word-limit />
        </div>
      </div>
    </el-card>

    <!-- 编辑器主体 -->
    <el-card shadow="hover" class="min-h-[600px]">
      <template #header>
        <EditorToolbar
          @import-word="showWordImporter = true"
          @export-md="exportMd"
          @export-html="exportHtml"
        />
      </template>

      <div class="flex gap-4 h-[700px]">
        <!-- 左侧大纲 -->
        <div class="w-60 flex-shrink-0 border-r border-outline-variant pr-3 hidden lg:block">
          <DocOutline />
        </div>

        <!-- 中间画布 -->
        <div class="flex-1 overflow-auto pr-2" @click="onCanvasClick" @paste="onPaste">
          <div class="space-y-1 min-h-full pb-20">
            <BlockRenderer
              v-for="node in store.docTree"
              :key="node.id"
              :node="node"
              :depth="0"
            />
          </div>
        </div>

        <!-- 右侧属性面板 -->
        <div class="w-72 flex-shrink-0 border-l border-outline-variant pl-3 hidden xl:block">
          <el-tabs v-model="activeTab" class="right-tabs">
            <el-tab-pane label="属性" name="properties">
              <div v-if="store.selectedNode" class="space-y-4">
                <div>
                  <div class="text-xs font-bold text-secondary uppercase mb-2">版本标签</div>
                  <div class="flex flex-wrap gap-1 mb-2">
                    <el-tag
                      v-for="tag in selectedTags"
                      :key="tag"
                      closable
                      size="small"
                      @close="removeTag(tag)"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                  <el-select
                    size="small"
                    placeholder="添加标签"
                    class="w-full"
                    @change="(v: string) => addTag(v)"
                  >
                    <el-option v-for="t in DEFAULT_TAGS" :key="t" :label="t" :value="t" />
                  </el-select>
                </div>

                <div>
                  <div class="text-xs font-bold text-secondary uppercase mb-2">双向链接</div>
                  <div class="space-y-1 mb-2">
                    <div
                      v-for="link in selectedLinks"
                      :key="link"
                      class="flex items-center justify-between text-xs px-2 py-1 rounded"
                      :class="brokenLinks.includes(link) ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'"
                    >
                      <span>[[{{ link }}]]</span>
                      <el-icon class="cursor-pointer" @click="removeLink(link)"><Close /></el-icon>
                    </div>
                  </div>
                  <el-button size="small" text @click="showLinkPopover = true">+ 添加链接</el-button>
                </div>

                <div>
                  <div class="text-xs font-bold text-secondary uppercase mb-2">片段</div>
                  <el-button size="small" text @click="saveFragment">保存当前块为片段</el-button>
                </div>
              </div>
              <div v-else class="text-sm text-secondary">请在画布中选择一个块</div>
            </el-tab-pane>

            <el-tab-pane label="片段库" name="fragments">
              <div v-if="fragments.length" class="space-y-2">
                <div
                  v-for="frag in fragments"
                  :key="frag.id"
                  class="rounded-lg bg-surface-container-low p-2 text-sm cursor-pointer hover:bg-primary/5"
                  @click="insertFragment(frag.nodes)"
                >
                  <div class="font-medium">{{ frag.name }}</div>
                  <div class="text-xs text-secondary truncate">{{ frag.nodes[0]?.content || '' }}</div>
                </div>
              </div>
              <div v-else class="text-sm text-secondary">暂无保存的片段</div>
            </el-tab-pane>

            <el-tab-pane label="预览" name="preview">
              <div class="space-y-2">
                <el-button size="small" @click="updatePreview">刷新预览</el-button>
                <div class="bg-surface-container-lowest rounded-lg p-3 text-xs font-mono whitespace-pre-wrap max-h-96 overflow-auto border border-outline-variant">
                  {{ previewMd || '点击刷新预览' }}
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-card>

    <!-- 底部提交栏 -->
    <div class="flex items-center justify-end gap-4 pb-8">
      <el-button @click="goBack">取消</el-button>
      <el-button type="info" size="large" @click="doSaveDraft(true)">保存草稿</el-button>
      <el-button type="primary" size="large" :disabled="!canSubmit" :loading="isSubmitting" @click="submitPage">
        提交到知识库
      </el-button>
    </div>

    <!-- 弹窗 -->
    <WordImporter v-if="showWordImporter" @imported="onWordImported" @close="showWordImporter = false" />

    <!-- 草稿恢复弹窗 -->
    <el-dialog v-model="showDraftDialog" title="恢复草稿" width="480px" :close-on-click-modal="false">
      <p class="text-sm text-on-surface mb-2">检测到未提交的草稿，是否继续编辑？</p>
      <p v-if="draftToRestore" class="text-xs text-secondary">
        上次保存时间：{{ new Date(draftToRestore.savedAt).toLocaleString('zh-CN') }}
      </p>
      <template #footer>
        <el-button @click="discardDraft">不恢复，开始新文档</el-button>
        <el-button type="primary" @click="restoreDraft">恢复草稿</el-button>
      </template>
    </el-dialog>

    <!-- Link Popover -->
    <div
      v-if="showLinkPopover"
      class="fixed z-50"
      :style="{ left: `${linkPopoverPos.x}px`, top: `${linkPopoverPos.y}px` }"
    >
      <LinkPopover @select="addLink" @close="showLinkPopover = false" />
    </div>
  </div>
</template>

<style scoped>
.right-tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
}
.right-tabs :deep(.el-tabs__item) {
  font-size: 12px;
  padding: 0 10px;
}
</style>
