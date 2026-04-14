<script setup lang="ts">
import { computed, watch } from 'vue'
import { useDocEditorStore } from '@/stores/docEditor'
import type { DocNode } from '@/types/editor'

const store = useDocEditorStore()

interface TreeNode {
  id: string
  label: string
  level: number
  children?: TreeNode[]
}

function buildTree(nodes: DocNode[]): TreeNode[] {
  const result: TreeNode[] = []
  for (const node of nodes) {
    if (node.type === 'heading') {
      const tn: TreeNode = {
        id: node.id,
        label: node.content || '(无标题)',
        level: node.level || 1,
        children: node.children ? buildTree(node.children) : undefined,
      }
      result.push(tn)
    }
  }
  return result
}

const treeData = computed(() => buildTree(store.docTree))
const defaultExpanded = computed(() => treeData.value.map((n) => n.id))

function onNodeClick(data: TreeNode) {
  store.selectedNodeId = data.id
  const el = document.getElementById(`block-${data.id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function onDeleteNode(id: string) {
  store.removeNode(id)
}

function allowDrop(_: any, dropNode: any, type: string) {
  // Only allow drop inside or next to heading nodes
  return dropNode.data.level !== undefined && (type === 'inner' || type === 'next' || type === 'prev')
}

function onDrop(draggingNode: any, dropNode: any, dropType: string) {
  const dragId = draggingNode?.data?.id as string
  const targetId = dropNode?.data?.id as string
  if (!dragId || !targetId) return
  let targetParentId: string | null = null
  let targetIndex = 0

  // Simple re-order logic via store.moveNode
  // Find target parent and index based on dropType
  const findParentAndIndex = (nodes: DocNode[], id: string): [string | null, number] | null => {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]!
      if (n.id === id) return [null, i]
      if (n.children) {
        const children = n.children
        for (let j = 0; j < children.length; j++) {
          if (children[j]!.id === id) return [n.id, j]
        }
        const deep = findParentAndIndex(children, id)
        if (deep) return deep
      }
    }
    return null
  }

  const targetPos = findParentAndIndex(store.docTree, targetId)
  if (!targetPos) return
  const [, baseIndex] = targetPos

  if (dropType === 'inner') {
    targetParentId = targetId
    targetIndex = (findNodeById(store.docTree, targetId)?.children?.length || 0)
  } else if (dropType === 'before') {
    targetParentId = targetPos[0]
    targetIndex = baseIndex
  } else {
    targetParentId = targetPos[0]
    targetIndex = baseIndex + 1
  }

  store.moveNode(dragId, targetParentId, targetIndex)
}

function findNodeById(nodes: DocNode[], id: string): DocNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNodeById(n.children, id)
      if (found) return found
    }
  }
  return null
}

// Sync highlight with selected node
watch(
  () => store.selectedNodeId,
  (id) => {
    if (!id) return
    const el = document.querySelector(`.doc-outline [data-id="${id}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  },
)
</script>

<template>
  <div class="doc-outline h-full overflow-auto pr-2">
    <div class="text-xs font-bold text-secondary uppercase tracking-wider mb-3 px-2">文档大纲</div>
    <el-tree
      :data="treeData"
      node-key="id"
      default-expand-all
      draggable
      :allow-drop="allowDrop"
      @node-click="onNodeClick"
      @node-drop="onDrop"
      :highlight-current="true"
      :current-node-key="store.selectedNodeId"
      class="bg-transparent"
    >
      <template #default="{ node, data }">
        <div
          class="flex items-center justify-between gap-2 py-1 text-sm group"
          :class="{
            'pl-0': data.level === 1,
            'pl-3': data.level === 2,
            'pl-6': data.level === 3,
            'pl-9': data.level >= 4,
          }"
          :data-id="data.id"
        >
          <span class="truncate" :title="data.label">{{ data.label }}</span>
          <el-button
            class="opacity-0 group-hover:opacity-100 transition-opacity"
            size="small"
            text
            type="danger"
            @click.stop="onDeleteNode(data.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<style scoped>
.doc-outline :deep(.el-tree-node__content) {
  height: auto;
  border-radius: 6px;
}
.doc-outline :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
</style>
