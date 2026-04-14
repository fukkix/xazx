<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDocEditorStore } from '@/stores/docEditor'
import type { DocNode, TableCell } from '@/types/editor'
import TableEditor from '../TableEditor.vue'

const props = defineProps<{
  node: DocNode
}>()

const store = useDocEditorStore()
const isSelected = computed(() => store.selectedNodeId === props.node.id)
const showEditor = ref(false)

function onClick() {
  store.selectedNodeId = props.node.id
}

function onEdit() {
  showEditor.value = true
}

function onSave(cells: TableCell[][]) {
  store.updateNode(props.node.id, { cells })
  showEditor.value = false
}
</script>

<template>
  <div
    class="py-2 px-3 rounded-lg border-2 cursor-pointer transition-all"
    :class="isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/20'"
    @click.stop="onClick"
  >
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-secondary">表格</span>
      <el-button size="small" text @click.stop="onEdit">编辑表格</el-button>
    </div>

    <div v-if="node.cells && node.cells.length" class="overflow-auto">
      <table class="w-full border-collapse text-sm">
        <tbody>
          <tr v-for="(row, rIdx) in node.cells" :key="rIdx">
            <td
              v-for="(cell, cIdx) in row"
              :key="cIdx"
              class="border border-outline-variant px-3 py-2 min-w-[80px]"
              :class="rIdx === 0 ? 'bg-surface-container-low font-medium' : ''"
              :rowspan="cell.rowspan || 1"
              :colspan="cell.colspan || 1"
              :style="cell.isMerged ? 'display:none' : ''"
            >
              {{ cell.content }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-secondary text-xs">空表格，点击编辑</div>
  </div>

  <TableEditor
    v-if="showEditor"
    :cells="node.cells || []"
    @save="onSave"
    @cancel="showEditor = false"
  />
</template>
