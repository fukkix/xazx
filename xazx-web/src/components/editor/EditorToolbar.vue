<script setup lang="ts">
import { computed } from 'vue'
import { useDocEditorStore, createNode } from '@/stores/docEditor'
import type { DocNode } from '@/types/editor'

const store = useDocEditorStore()

const emit = defineEmits<{
  (e: 'import-word'): void
  (e: 'export-md'): void
  (e: 'export-html'): void
}>()

const canUndo = computed(() => store.canUndo())
const canRedo = computed(() => store.canRedo())

function insertBlock(type: DocNode['type']) {
  const selected = store.selectedNode
  let parentId: string | null = null
  let index = store.docTree.length

  if (selected) {
    // Find the top-level parent (or the node itself if it's top-level)
    const pos = store.getNodePosition(selected.id)
    if (pos) {
      // Insert after the selected node at the same level
      parentId = pos.parentId
      index = pos.index + 1
    }
  }

  const node = createNode(type)
  store.addNode(parentId, node, index)
}

function insertHeading() {
  const selected = store.selectedNode
  let index = store.docTree.length

  if (selected) {
    const pos = store.getNodePosition(selected.id)
    if (pos) {
      index = pos.index + 1
    }
  }

  const node = createNode('heading', { level: 2, content: '新标题' })
  store.addNode(null, node, index)
}
</script>

<template>
  <div class="flex items-center justify-between gap-3 flex-wrap">
    <div class="flex items-center gap-2 flex-wrap">
      <el-button-group>
        <el-button size="small" :disabled="!canUndo" @click="store.undo">
          <el-icon class="mr-0.5"><ArrowLeft /></el-icon>撤销
        </el-button>
        <el-button size="small" :disabled="!canRedo" @click="store.redo">
          <el-icon class="mr-0.5"><ArrowRight /></el-icon>重做
        </el-button>
      </el-button-group>

      <el-divider direction="vertical" />

      <el-button size="small" @click="insertHeading">
        <el-icon class="mr-0.5"><Document /></el-icon>标题
      </el-button>
      <el-button size="small" @click="insertBlock('paragraph')">
        <el-icon class="mr-0.5"><EditPen /></el-icon>段落
      </el-button>
      <el-button size="small" @click="insertBlock('steps')">
        <el-icon class="mr-0.5"><List /></el-icon>步骤
      </el-button>
      <el-button size="small" @click="insertBlock('table')">
        <el-icon class="mr-0.5"><Grid /></el-icon>表格
      </el-button>
      <el-button size="small" @click="insertBlock('image')">
        <el-icon class="mr-0.5"><Picture /></el-icon>图片
      </el-button>
      <el-button size="small" @click="insertBlock('path')">
        <el-icon class="mr-0.5"><Link /></el-icon>路径
      </el-button>
      <el-button size="small" @click="insertBlock('callout')">
        <el-icon class="mr-0.5"><WarningFilled /></el-icon>提示
      </el-button>
      <el-button size="small" @click="insertBlock('feature-matrix')">
        <el-icon class="mr-0.5"><Trophy /></el-icon>功能矩阵
      </el-button>

      <el-divider direction="vertical" />

      <el-button size="small" type="info" plain @click="emit('import-word')">
        <el-icon class="mr-0.5"><Upload /></el-icon>导入文档
      </el-button>
    </div>

    <div class="flex items-center gap-2">
      <el-button size="small" @click="emit('export-md')">
        <el-icon class="mr-0.5"><Download /></el-icon>导出 Markdown
      </el-button>
      <el-button size="small" @click="emit('export-html')">
        <el-icon class="mr-0.5"><Download /></el-icon>导出 HTML
      </el-button>
    </div>
  </div>
</template>
