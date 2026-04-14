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
    // If selected is heading, insert inside it
    if (selected.type === 'heading') {
      parentId = selected.id
      index = selected.children?.length || 0
    } else {
      // Find parent of selected
      const findParentId = (nodes: DocNode[], id: string): string | null => {
        for (const n of nodes) {
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
        const parent = store.docTree.find((n) => n.id === parentId) || store.allNodes.find((n) => n.id === parentId)
        index = (parent?.children?.findIndex((c) => c.id === selected.id) ?? -1) + 1
      } else {
        index = store.docTree.findIndex((n) => n.id === selected.id) + 1
      }
    }
  }

  const node = createNode(type)
  store.addNode(parentId, node, index)
}

function insertHeading() {
  const node = createNode('heading', { level: 2, content: '新标题' })
  store.addNode(null, node, store.docTree.length)
}
</script>

<template>
  <div class="flex items-center justify-between gap-3 flex-wrap">
    <div class="flex items-center gap-2 flex-wrap">
      <el-button-group>
        <el-button size="small" :disabled="!canUndo" @click="store.undo">撤销</el-button>
        <el-button size="small" :disabled="!canRedo" @click="store.redo">重做</el-button>
      </el-button-group>

      <el-divider direction="vertical" />

      <el-button size="small" @click="insertHeading">+ 标题</el-button>
      <el-button size="small" @click="insertBlock('paragraph')">+ 段落</el-button>
      <el-button size="small" @click="insertBlock('steps')">+ 步骤</el-button>
      <el-button size="small" @click="insertBlock('table')">+ 表格</el-button>
      <el-button size="small" @click="insertBlock('image')">+ 图片</el-button>
      <el-button size="small" @click="insertBlock('path')">+ 路径</el-button>
      <el-button size="small" @click="insertBlock('callout')">+ 提示</el-button>
      <el-button size="small" @click="insertBlock('feature-matrix')">+ 功能矩阵</el-button>

      <el-divider direction="vertical" />

      <el-button size="small" type="info" plain @click="emit('import-word')">导入文档</el-button>
    </div>

    <div class="flex items-center gap-2">
      <el-button size="small" @click="emit('export-md')">导出 Markdown</el-button>
      <el-button size="small" @click="emit('export-html')">导出 HTML</el-button>
    </div>
  </div>
</template>
