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
const collapsedGroups = ref<Record<number, boolean>>({})
const freezeCols = ref(props.node.attrs?.freezeCols ?? 1)

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

function toggleGroup(rowIdx: number) {
  collapsedGroups.value[rowIdx] = !collapsedGroups.value[rowIdx]
}

function setFreezeCols(n: number) {
  freezeCols.value = n
  const attrs = { ...props.node.attrs, freezeCols: n }
  store.updateNode(props.node.id, { attrs })
}

const groupMap = computed(() => {
  const map: Record<number, { header: number; hidden: boolean }> = {}
  if (!props.node.cells) return map
  props.node.cells.forEach((row, rIdx) => {
    const firstCell = row[0]
    if (firstCell && !firstCell.isMerged && (firstCell.rowspan || 1) > 1) {
      const rowspan = firstCell.rowspan || 1
      const hidden = !!collapsedGroups.value[rIdx]
      for (let i = 1; i < rowspan; i++) {
        map[rIdx + i] = { header: rIdx, hidden }
      }
    }
  })
  return map
})

function isHiddenRow(rIdx: number) {
  return groupMap.value[rIdx]?.hidden
}

function isGroupHeader(rIdx: number) {
  if (!props.node.cells) return false
  const firstCell = props.node.cells[rIdx]![0]
  return firstCell && !firstCell.isMerged && (firstCell.rowspan || 1) > 1
}
</script>

<template>
  <div
    class="py-2 px-3 rounded-lg border-2 cursor-pointer transition-all"
    :class="isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/20'"
    @click.stop="onClick"
  >
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="text-xs text-secondary">表格</span>
        <el-radio-group v-model="freezeCols" size="small" @change="setFreezeCols">
          <el-radio-button :label="0">不冻结</el-radio-button>
          <el-radio-button :label="1">冻结1列</el-radio-button>
          <el-radio-button :label="2">冻结2列</el-radio-button>
        </el-radio-group>
      </div>
      <el-button size="small" text @click.stop="onEdit">编辑表格</el-button>
    </div>

    <div v-if="node.cells && node.cells.length" class="overflow-auto">
      <table class="w-full border-collapse text-sm">
        <tbody>
          <tr v-for="(row, rIdx) in node.cells" :key="rIdx" v-show="!isHiddenRow(rIdx)">
            <td
              v-for="(cell, cIdx) in row"
              :key="cIdx"
              class="border border-outline-variant px-3 py-2 min-w-[80px]"
              :class="[
                rIdx === 0 ? 'bg-surface-container-low font-medium' : 'bg-surface-container-lowest',
                cIdx < freezeCols ? 'sticky z-10' : '',
                cIdx === 0 && freezeCols >= 1 ? 'left-0' : '',
                cIdx === 1 && freezeCols >= 2 ? 'left-[80px]' : '',
              ]"
              :rowspan="cell.rowspan || 1"
              :colspan="cell.colspan || 1"
              :style="cell.isMerged ? 'display:none' : ''"
            >
              <div class="flex items-center gap-2">
                <button
                  v-if="cIdx === 0 && isGroupHeader(rIdx)"
                  class="text-xs text-secondary hover:text-primary"
                  @click.stop="toggleGroup(rIdx)"
                >
                  <el-icon>
                    <ArrowDown v-if="!collapsedGroups[rIdx]" />
                    <ArrowRight v-else />
                  </el-icon>
                </button>
                <span>{{ cell.content }}</span>
              </div>
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

<style scoped>
td.sticky {
  position: sticky;
}
</style>
